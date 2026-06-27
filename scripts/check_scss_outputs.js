#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SCSS_ROOT = path.join(ROOT, 'assets/scss');
const CSS_ROOT = path.join(ROOT, 'assets/css');
const SITE_FONTS_FILE = path.join(ROOT, 'assets/js/Config/SiteFonts.js');
const SITE_RESOURCES_FILE = path.join(ROOT, 'assets/js/Config/SiteResources.js');

let errors = [];
let warnings = [];

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function fail(message) {
  errors.push(message);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function isExternalUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) ||
    /^(?:data:|mailto:|tel:|#)/i.test(value);
}

function stripQueryAndHash(value) {
  return String(value).split(/[?#]/)[0];
}

function normalizeConfigPath(value) {
  if (typeof value !== 'string') return null;

  let clean = stripQueryAndHash(value).trim();

  if (!clean || isExternalUrl(clean)) return null;

  if (clean.startsWith('./')) clean = clean.slice(2);
  if (clean.startsWith('/')) clean = clean.slice(1);

  return clean.replace(/\\/g, '/');
}

function getHtmlBaseHref(htmlText) {
  const baseMatch = /<base\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i.exec(htmlText);
  return baseMatch ? baseMatch[1] : null;
}

function resolveHtmlHref(htmlFile, htmlText, href) {
  if (typeof href !== 'string') return null;

  const clean = stripQueryAndHash(href).trim();

  if (!clean || isExternalUrl(clean)) return null;

  if (clean.startsWith('/')) {
    return clean.slice(1).replace(/\\/g, '/');
  }

  const baseHref = getHtmlBaseHref(htmlText);
  const htmlDir = path.dirname(htmlFile);
  const baseDir = baseHref && !isExternalUrl(baseHref)
    ? path.resolve(htmlDir, stripQueryAndHash(baseHref))
    : htmlDir;

  const resolved = path.resolve(baseDir, clean);
  const relative = path.relative(ROOT, resolved).replace(/\\/g, '/');

  if (relative.startsWith('..')) return null;

  return relative;
}

function evaluateConfigFile(file, sandbox, requiredGlobalName) {
  if (!fs.existsSync(file)) {
    fail(`Missing config file: ${rel(file)}`);
    return false;
  }

  try {
    vm.runInNewContext(readText(file), sandbox, {
      filename: file,
      timeout: 1000
    });
  } catch (e) {
    fail(`Failed to evaluate ${rel(file)}: ${e.message}`);
    return false;
  }

  if (requiredGlobalName && !sandbox.window[requiredGlobalName]) {
    fail(`${rel(file)} did not define window.${requiredGlobalName}.`);
    return false;
  }

  return true;
}

function loadSiteResources() {
  const sandbox = {
    window: {},
    console: {
      log() {},
      warn() {},
      error() {}
    }
  };

  evaluateConfigFile(SITE_FONTS_FILE, sandbox, 'SiteFonts');

  if (!evaluateConfigFile(SITE_RESOURCES_FILE, sandbox, 'SiteResources')) {
    return null;
  }

  return sandbox.window.SiteResources;
}

function collectCssValues(value, out) {
  if (!value) return;

  if (typeof value === 'string') {
    const localPath = normalizeConfigPath(value);
    if (localPath && localPath.startsWith('assets/css/') && localPath.endsWith('.css')) {
      out.add(localPath);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectCssValues(item, out));
    return;
  }

  if (typeof value !== 'object') return;

  Object.keys(value).forEach((key) => {
    if (key === 'attrs' || key === 'timeout') return;
    collectCssValues(value[key], out);
  });
}

function collectConfiguredCss(resources) {
  const out = new Set();

  if (!resources || typeof resources !== 'object') return out;

  collectCssValues(resources.styles, out);

  const pages = resources.pages || {};
  Object.keys(pages).forEach((pageKey) => {
    const page = pages[pageKey];
    if (!page || typeof page !== 'object') return;
    collectCssValues(page.styles, out);
  });

  return out;
}

function walk(dir, out, predicate) {
  if (!fs.existsSync(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '_site' || entry.name === '.git') return;
      walk(abs, out, predicate);
      return;
    }

    if (!entry.isFile()) return;

    if (!predicate || predicate(abs, entry.name)) {
      out.push(abs);
    }
  });

  return out;
}

function isScssOutputFile(abs, name) {
  if (!name.endsWith('.scss')) return false;
  if (name.startsWith('_')) return false;
  return true;
}

function expectedCssForScss(scssFile) {
  const relative = path.relative(SCSS_ROOT, scssFile);
  return path.join(CSS_ROOT, relative).replace(/\.scss$/i, '.css');
}

function expectedScssForCssPath(cssPath) {
  const relative = cssPath.replace(/^assets\/css\//, '').replace(/\.css$/i, '.scss');
  return path.join(SCSS_ROOT, relative);
}

function checkScssRoot() {
  if (!fs.existsSync(SCSS_ROOT) || !fs.statSync(SCSS_ROOT).isDirectory()) {
    fail('Missing SCSS source directory: assets/scss');
  }
}

function checkEveryScssProducedCss() {
  const scssFiles = walk(SCSS_ROOT, [], isScssOutputFile);

  if (!scssFiles.length) {
    fail('No non-partial SCSS files found under assets/scss.');
    return;
  }

  scssFiles.forEach((scssFile) => {
    const cssFile = expectedCssForScss(scssFile);

    if (!fs.existsSync(cssFile)) {
      fail(`SCSS did not produce expected CSS: ${rel(scssFile)} -> ${rel(cssFile)}`);
      return;
    }

    if (!fs.statSync(cssFile).isFile()) {
      fail(`Expected CSS output is not a file: ${rel(cssFile)}`);
    }
  });
}

function checkConfiguredCssHasScssSource() {
  const resources = loadSiteResources();
  const configuredCss = collectConfiguredCss(resources);

  configuredCss.forEach((cssPath) => {
    const cssFile = path.join(ROOT, cssPath);

    if (!fs.existsSync(cssFile)) {
      fail(`Configured CSS was not generated: ${cssPath}`);
      return;
    }

    const scssFile = expectedScssForCssPath(cssPath);

    if (!fs.existsSync(scssFile)) {
      fail(`Configured CSS has no SCSS source: ${cssPath} expected ${rel(scssFile)}`);
    }
  });
}

function checkHtmlLinkedCssHasScssSource() {
  const htmlFiles = walk(ROOT, [], (abs, name) => {
    if (!name.endsWith('.html')) return false;

    const relative = rel(abs);
    if (relative.startsWith('_site/')) return false;
    if (relative.startsWith('node_modules/')) return false;

    return true;
  });

  const linkPattern = /<link\b[^>]*>/gi;
  const relPattern = /\brel=["'][^"']*stylesheet[^"']*["']/i;
  const hrefPattern = /\bhref=["']([^"']+)["']/i;

  htmlFiles.forEach((htmlFile) => {
    const text = readText(htmlFile);

    let linkMatch;
    while ((linkMatch = linkPattern.exec(text))) {
      const tag = linkMatch[0];
      if (!relPattern.test(tag)) continue;

      const hrefMatch = hrefPattern.exec(tag);
      if (!hrefMatch) continue;

      const localPath = resolveHtmlHref(htmlFile, text, hrefMatch[1]);
      if (!localPath || !localPath.startsWith('assets/css/') || !localPath.endsWith('.css')) continue;

      const cssFile = path.join(ROOT, localPath);
      const scssFile = expectedScssForCssPath(localPath);

      if (!fs.existsSync(cssFile)) {
        fail(`HTML-linked CSS was not generated: ${localPath} from ${rel(htmlFile)}`);
      }

      if (!fs.existsSync(scssFile)) {
        fail(`HTML-linked CSS has no SCSS source: ${localPath} from ${rel(htmlFile)} expected ${rel(scssFile)}`);
      }
    }
  });
}

function checkNoCssSourceMaps() {
  const cssMaps = walk(CSS_ROOT, [], (abs, name) => name.endsWith('.css.map'));

  cssMaps.forEach((file) => {
    fail(`Unexpected CSS source map generated: ${rel(file)}`);
  });
}

function printResult() {
  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((message) => {
      console.log(`- ${message}`);
    });
  }

  if (errors.length) {
    console.error('\nErrors:');
    errors.forEach((message) => {
      console.error(`- ${message}`);
    });

    console.error('\nSCSS output check failed.');
    process.exit(1);
  }

  console.log('SCSS output check passed.');
}

function main() {
  checkScssRoot();
  checkEveryScssProducedCss();
  checkConfiguredCssHasScssSource();
  checkHtmlLinkedCssHasScssSource();
  checkNoCssSourceMaps();
  printResult();
}

main();