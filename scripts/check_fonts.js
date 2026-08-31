#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const FONTS_CSS = path.join(ROOT, 'assets/css/fonts.css');
const SITE_FONTS_JS = path.join(ROOT, 'assets/js/Config/SiteFonts.js');
const SITE_RESOURCES_JS = path.join(ROOT, 'assets/js/Config/SiteResources.js');
const FONT_AWESOME_CSS = path.join(ROOT, 'assets/fonts/Font_Awesome/css/all.min.css');

const SELF_FILE = path.normalize(__filename);

const SCANNED_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.yml',
  '.yaml'
]);

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.cache',
  '.next',
  'dist',
  'build'
]);

const ALLOWED_EXTERNAL_FONT_CONFIG_FILES = new Set([
  normalizePath(SITE_FONTS_JS)
]);

const ALLOWED_FONT_FACE_FILES = new Set([
  normalizePath(FONTS_CSS),
  normalizePath(FONT_AWESOME_CSS)
]);

const CENTRAL_FONT_FILES = new Set([
  normalizePath(FONTS_CSS),
  normalizePath(SITE_FONTS_JS),
  normalizePath(SITE_RESOURCES_JS),
  normalizePath(FONT_AWESOME_CSS)
]);

const DIRECT_FONT_NAME_PATTERNS = [
  {
    label: 'Google Font family Great Vibes',
    pattern: /["']Great Vibes["']/g
  },
  {
    label: 'Google Font family Allura',
    pattern: /["']Allura["']/g
  },
  {
    label: 'Google Font family Cinzel',
    pattern: /["']Cinzel["']/g
  },
  {
    label: 'Google Font family MedievalSharp',
    pattern: /["']MedievalSharp["']/g
  },
  {
    label: 'Google Font family UnifrakturMaguntia',
    pattern: /["']UnifrakturMaguntia["']/g
  },
  {
    label: 'local display font CygnetRound',
    pattern: /["']CygnetRound Local["']/g
  },
  {
    label: 'local display font Beautiful ES',
    pattern: /["']Beautiful ES Local["']/g
  },
  {
    label: 'local display font Cataneo BT',
    pattern: /["']Cataneo BT Local["']/g
  },
  {
    label: 'local display font HongLeiXingShu',
    pattern: /["']HongLeiXingShu Local["']/g
  }
];

const EXTERNAL_FONT_PATTERNS = [
  {
    label: 'Google Fonts external stylesheet',
    pattern: /fonts\.googleapis\.com\/css2?/i
  },
  {
    label: 'Font Awesome CDN stylesheet',
    pattern: /cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i
  }
];

let errors = [];
let warnings = [];

function normalizePath(file) {
  return path.normalize(file);
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function stripCssComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '');
}

function isExternalUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) ||
    /^(?:data:|mailto:|tel:|#)/i.test(value);
}

function stripQueryAndHash(value) {
  return String(value).split(/[?#]/)[0];
}

function decodeCssUrl(value) {
  try {
    return decodeURI(value);
  } catch (e) {
    return value;
  }
}

function parseCssUrls(text) {
  const urls = [];
  const re = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
  let match;

  while ((match = re.exec(text)) !== null) {
    const raw = match[2].trim();
    if (!raw || isExternalUrl(raw)) continue;
    urls.push(decodeCssUrl(stripQueryAndHash(raw)));
  }

  return urls;
}

function checkCssUrlsExist(cssFile) {
  if (!fs.existsSync(cssFile)) {
    fail(`Missing CSS file: ${rel(cssFile)}`);
    return;
  }

  const cssDir = path.dirname(cssFile);
  const text = stripCssComments(readText(cssFile));
  const urls = parseCssUrls(text);

  urls.forEach((urlValue) => {
    const target = path.resolve(cssDir, urlValue);

    if (!fs.existsSync(target)) {
      fail(`Missing file referenced by ${rel(cssFile)}: ${urlValue} -> ${rel(target)}`);
      return;
    }

    const stat = fs.statSync(target);
    if (!stat.isFile()) {
      fail(`Referenced path is not a file in ${rel(cssFile)}: ${urlValue} -> ${rel(target)}`);
    }
  });
}

function evaluateSiteFonts() {
  if (!fs.existsSync(SITE_FONTS_JS)) {
    fail(`Missing SiteFonts.js: ${rel(SITE_FONTS_JS)}`);
    return null;
  }

  const sandbox = {
    window: {},
    console: {
      log() {},
      warn() {},
      error() {}
    }
  };

  try {
    vm.runInNewContext(readText(SITE_FONTS_JS), sandbox, {
      filename: SITE_FONTS_JS,
      timeout: 1000
    });
  } catch (e) {
    fail(`Failed to evaluate ${rel(SITE_FONTS_JS)}: ${e.message}`);
    return null;
  }

  if (!sandbox.window.SiteFonts) {
    fail(`${rel(SITE_FONTS_JS)} did not define window.SiteFonts.`);
    return null;
  }

  return sandbox.window.SiteFonts;
}

function collectFallbackHrefs(value, out) {
  if (!value) return;

  if (Array.isArray(value)) {
    value.forEach((item) => collectFallbackHrefs(item, out));
    return;
  }

  if (typeof value !== 'object') return;

  if (typeof value.fallbackHref === 'string') {
    out.push(value.fallbackHref);
  }

  Object.keys(value).forEach((key) => {
    if (key === 'attrs') return;
    collectFallbackHrefs(value[key], out);
  });
}

function repoRelativeToAbs(value) {
  let clean = stripQueryAndHash(String(value).trim());

  if (!clean || isExternalUrl(clean)) {
    return null;
  }

  if (clean.startsWith('./')) clean = clean.slice(2);
  if (clean.startsWith('/')) clean = clean.slice(1);

  return path.join(ROOT, clean);
}

function checkSiteFontsFallbacks() {
  const siteFonts = evaluateSiteFonts();
  if (!siteFonts) return;

  const fallbacks = [];
  collectFallbackHrefs(siteFonts, fallbacks);

  fallbacks.forEach((href) => {
    const abs = repoRelativeToAbs(href);

    if (!abs) return;

    if (!fs.existsSync(abs)) {
      fail(`Missing font fallbackHref target from SiteFonts.js: ${href}`);
      return;
    }

    if (!fs.statSync(abs).isFile()) {
      fail(`font fallbackHref target is not a file: ${href}`);
    }
  });
}

function walkFiles(dir, out) {
  if (!fs.existsSync(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) return;
      walkFiles(abs, out);
      return;
    }

    if (!entry.isFile()) return;

    const normalized = normalizePath(abs);

    if (normalized === SELF_FILE) return;

    const ext = path.extname(entry.name).toLowerCase();
    if (!SCANNED_EXTENSIONS.has(ext)) return;

    out.push(abs);
  });

  return out;
}

function checkExternalFontLinksAreCentralized(files) {
  files.forEach((file) => {
    const normalized = normalizePath(file);
    if (ALLOWED_EXTERNAL_FONT_CONFIG_FILES.has(normalized)) return;

    const text = readText(file);

    EXTERNAL_FONT_PATTERNS.forEach((item) => {
      if (item.pattern.test(text)) {
        fail(`External font link is not centralized in SiteFonts.js: ${item.label} found in ${rel(file)}`);
      }
    });
  });
}

function checkFontFaceDeclarationsAreCentralized(files) {
  files.forEach((file) => {
    const normalized = normalizePath(file);
    if (ALLOWED_FONT_FACE_FILES.has(normalized)) return;

    const text = readText(file);

    if (/@font-face\b/i.test(text)) {
      fail(`@font-face declaration should be centralized: found in ${rel(file)}`);
    }
  });
}

function checkDirectFontNames(files) {
  files.forEach((file) => {
    const normalized = normalizePath(file);
    if (CENTRAL_FONT_FILES.has(normalized)) return;

    const text = readText(file);

    DIRECT_FONT_NAME_PATTERNS.forEach((item) => {
      item.pattern.lastIndex = 0;

      if (item.pattern.test(text)) {
        warn(`Direct font-family name remains outside central font files: ${item.label} found in ${rel(file)}`);
      }
    });
  });
}

function printResult() {
  console.log('=== Font resource check ===');

  if (warnings.length) {
    console.log(`\nWarnings: ${warnings.length}`);
    warnings.forEach((message, index) => {
      console.log(`  [W${String(index + 1).padStart(2, '0')}] ${message}`);
    });
  } else {
    console.log('\nWarnings: 0');
  }

  if (errors.length) {
    console.error(`\nErrors: ${errors.length}`);
    errors.forEach((message, index) => {
      console.error(`  [E${String(index + 1).padStart(2, '0')}] ${message}`);
    });

    console.error('\nResult: FAILED');
    process.exit(1);
  }

  console.log('\nErrors: 0');
  console.log('\nResult: PASSED');
}

function main() {
  checkCssUrlsExist(FONTS_CSS);
  checkCssUrlsExist(FONT_AWESOME_CSS);
  checkSiteFontsFallbacks();

  const files = walkFiles(ROOT, []);

  checkExternalFontLinksAreCentralized(files);
  checkFontFaceDeclarationsAreCentralized(files);
  checkDirectFontNames(files);

  printResult();
}

main();
