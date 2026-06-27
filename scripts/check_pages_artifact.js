#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_DIR = path.join(ROOT, '_site');
const SITE_FONTS_FILE = path.join(SITE_DIR, 'assets/js/Config/SiteFonts.js');
const SITE_RESOURCES_FILE = path.join(SITE_DIR, 'assets/js/Config/SiteResources.js');

let errors = [];
let warnings = [];

function relFromSite(abs) {
  return path.relative(SITE_DIR, abs).replace(/\\/g, '/');
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
  const relative = path.relative(SITE_DIR, resolved).replace(/\\/g, '/');

  if (relative.startsWith('..')) return null;

  return relative;
}

function evaluateConfigFile(file, sandbox, requiredGlobalName) {
  if (!fs.existsSync(file)) {
    fail(`Missing config file in Pages artifact: ${relFromSite(file)}`);
    return false;
  }

  try {
    vm.runInNewContext(readText(file), sandbox, {
      filename: file,
      timeout: 1000
    });
  } catch (e) {
    fail(`Failed to evaluate ${relFromSite(file)}: ${e.message}`);
    return false;
  }

  if (requiredGlobalName && !sandbox.window[requiredGlobalName]) {
    fail(`${relFromSite(file)} did not define window.${requiredGlobalName}.`);
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

function addAsset(assets, value, origin, kind) {
  const localPath = normalizeConfigPath(value);

  if (!localPath) return;

  assets.push({
    path: localPath,
    origin,
    kind: kind || 'file'
  });
}

function collectAssetList(assets, value, origin, kind) {
  if (!value) return;

  if (typeof value === 'string') {
    addAsset(assets, value, origin, kind);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectAssetList(assets, item, `${origin}[${index}]`, kind);
    });
    return;
  }

  if (typeof value !== 'object') return;

  if (typeof value.href === 'string') {
    addAsset(assets, value.href, `${origin}.href`, kind);
  }

  if (typeof value.src === 'string') {
    addAsset(assets, value.src, `${origin}.src`, kind);
  }

  if (typeof value.fallbackHref === 'string') {
    addAsset(assets, value.fallbackHref, `${origin}.fallbackHref`, 'style');
  }

  Object.keys(value).forEach((key) => {
    if (key === 'href' || key === 'src' || key === 'fallbackHref' || key === 'attrs' || key === 'timeout') return;

    collectAssetList(assets, value[key], `${origin}.${key}`, kind);
  });
}

function collectImages(assets, obj, origin, inheritedCoverDir) {
  if (!obj || typeof obj !== 'object') return;

  const localCoverDir = typeof obj.coverDir === 'string'
    ? obj.coverDir
    : inheritedCoverDir;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const here = `${origin}.${key}`;

    if (key === 'coverDir' && typeof value === 'string') {
      addAsset(assets, value, here, 'dir');
      return;
    }

    if (key === 'coverFiles' && Array.isArray(value)) {
      if (!localCoverDir) {
        fail(`${here} exists, but coverDir is not defined.`);
        return;
      }

      value.forEach((file, index) => {
        if (typeof file !== 'string') {
          fail(`${here}[${index}] must be a string.`);
          return;
        }

        addAsset(assets, localCoverDir + file, `${here}[${index}]`, 'image');
      });

      return;
    }

    if (typeof value === 'string') {
      addAsset(assets, value, here, 'image');
      return;
    }

    if (value && typeof value === 'object') {
      collectImages(assets, value, here, localCoverDir);
    }
  });
}

function coverVideoFileFromImageFile(imageFile, extension) {
  if (typeof imageFile !== 'string') return null;

  const ext = typeof extension === 'string' && extension
    ? extension
    : '.mp4';

  return imageFile.replace(/\.[^/.]+$/, '') + ext;
}

function collectCoverVideos(assets, resources) {
  if (!resources || !resources.coverVideo) return;

  const coverVideo = resources.coverVideo;

  if (coverVideo.enabled === false) return;

  const images = resources.images || {};
  const coverFiles = images.coverFiles;
  const videoDir = coverVideo.dir;
  const extension = coverVideo.extension || '.mp4';

  if (!Array.isArray(coverFiles)) {
    fail('coverVideo is enabled, but images.coverFiles is not defined.');
    return;
  }

  if (typeof videoDir !== 'string' || !videoDir.trim()) {
    fail('coverVideo.dir must be a non-empty string when coverVideo is enabled.');
    return;
  }

  addAsset(assets, videoDir, 'coverVideo.dir', 'dir');

  coverFiles.forEach((imageFile, index) => {
    const videoFile = coverVideoFileFromImageFile(imageFile, extension);

    if (!videoFile) {
      fail(`Could not derive cover video file from images.coverFiles[${index}].`);
      return;
    }

    addAsset(
      assets,
      videoDir + videoFile,
      `coverVideo derived from images.coverFiles[${index}]`,
      'video'
    );
  });
}

function collectPageAssets(assets, pages) {
  if (!pages || typeof pages !== 'object') return;

  Object.keys(pages).forEach((pageKey) => {
    const page = pages[pageKey];

    if (!page || typeof page !== 'object') return;

    collectAssetList(assets, page.styles || [], `pages.${pageKey}.styles`, 'style');
    collectAssetList(assets, page.scripts || [], `pages.${pageKey}.scripts`, 'script');
  });
}

function collectConfiguredAssets(resources) {
  const assets = [];

  if (!resources) return assets;

  if (resources.site && resources.site.favicon && typeof resources.site.favicon.href === 'string') {
    addAsset(assets, resources.site.favicon.href, 'site.favicon.href', 'image');
  }

  collectAssetList(assets, resources.external && resources.external.styles, 'external.styles', 'external');
  collectAssetList(assets, resources.external && resources.external.analytics, 'external.analytics', 'external');

  if (resources.external && resources.external.libraries) {
    collectAssetList(assets, resources.external.libraries, 'external.libraries', 'external');
  }

  collectAssetList(assets, resources.styles, 'styles', 'style');
  collectAssetList(assets, resources.scripts, 'scripts', 'script');

  collectPageAssets(assets, resources.pages);

  if (resources.images) {
    collectImages(assets, resources.images, 'images');
  }

  collectCoverVideos(assets, resources);

  return assets;
}

function checkPathExists(relativePath, origin, kind) {
  const abs = path.join(SITE_DIR, relativePath);

  if (!fs.existsSync(abs)) {
    fail(`Missing ${kind || 'file'} in Pages artifact: ${relativePath}    from ${origin}`);
    return;
  }

  const stat = fs.statSync(abs);

  if (kind === 'dir' && !stat.isDirectory()) {
    fail(`Expected directory but found file in Pages artifact: ${relativePath}    from ${origin}`);
  }

  if (kind !== 'dir' && !stat.isFile()) {
    fail(`Expected file but found directory in Pages artifact: ${relativePath}    from ${origin}`);
  }
}

function walkFiles(dir, out) {
  if (!fs.existsSync(dir)) return out;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkFiles(abs, out);
      return;
    }

    if (entry.isFile()) {
      out.push(abs);
    }
  });

  return out;
}

function checkHtmlLinkedCss() {
  const htmlFiles = walkFiles(SITE_DIR, []).filter((file) => file.endsWith('.html'));

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
      if (!localPath || !localPath.endsWith('.css')) continue;

      checkPathExists(localPath, relFromSite(htmlFile), 'style');
    }
  });
}

function checkRequiredFiles() {
  [
    'index.html',
    'about/index.html',
    'schedule/index.html',
    'social/index.html',
    'life/index.html',
    'sw.js',
    'giscus.json',
    'assets/js/Config/SiteResources.js',
    'assets/js/Config/SiteFonts.js',
    'assets/css/base/site-zoom.css'
  ].forEach((file) => {
    checkPathExists(file, 'required artifact file', 'file');
  });
}

function checkSourceOnlyFilesAreAbsent() {
  [
    'assets/scss',
    'scripts',
    'node_modules',
    'package.json',
    'package-lock.json',
    '.github'
  ].forEach((relativePath) => {
    const abs = path.join(SITE_DIR, relativePath);

    if (fs.existsSync(abs)) {
      fail(`Source-only path should not be published in Pages artifact: ${relativePath}`);
    }
  });
}

function checkConfiguredAssets() {
  const resources = loadSiteResources();
  const assets = collectConfiguredAssets(resources);

  assets.forEach((asset) => {
    if (asset.kind === 'external') return;
    checkPathExists(asset.path, asset.origin, asset.kind);
  });
}

function checkNoCssSourceMaps() {
  const cssDir = path.join(SITE_DIR, 'assets/css');
  const maps = walkFiles(cssDir, []).filter((file) => file.endsWith('.css.map'));

  maps.forEach((file) => {
    fail(`Unexpected CSS source map in Pages artifact: ${relFromSite(file)}`);
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

    console.error('\nPages artifact check failed.');
    process.exit(1);
  }

  console.log('Pages artifact check passed.');
}

function main() {
  if (!fs.existsSync(SITE_DIR) || !fs.statSync(SITE_DIR).isDirectory()) {
    fail('Missing Pages artifact directory: _site');
    printResult();
    return;
  }

  checkRequiredFiles();
  checkSourceOnlyFilesAreAbsent();
  checkConfiguredAssets();
  checkHtmlLinkedCss();
  checkNoCssSourceMaps();

  printResult();
}

main();