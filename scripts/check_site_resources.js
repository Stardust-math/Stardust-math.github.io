#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PAGES_CONFIG = require(
  './index_pages.config.js'
);
const SITE_FONTS_FILE = path.join(ROOT, 'assets/js/Config/SiteFonts.js');
const SITE_RESOURCES_FILE = path.join(ROOT, 'assets/js/Config/SiteResources.js');

const RETIRED_MODULE_DIRECTORIES = [
  'assets/css/toolkit',
  'assets/js/Content/EN/toolkit',
  'assets/js/Content/ZH/toolkit',
  'assets/js/Functions/toolkit',
  'assets/css/blog',
  'assets/js/Functions/blog',
  'assets/images/blog',
  'assets/audio/blog',
  'assets/animation/blog'
];

const RETIRED_FILES = [
  'assets/css/components/legacy-controls.css'
];

const FORBIDDEN_PATH_PATTERNS = [
  {
    label: 'removed fav/ directory',
    pattern: /(?:^|['"`(=\s])(?:\.\/)?fav\//i
  },
  {
    label: 'removed cursor.css file',
    pattern: /cursor\.css/i
  },
  {
    label: 'removed Toolkit module resource',
    pattern: /assets\/(?:css\/toolkit|js\/(?:Content\/(?:EN|ZH)|Functions)\/toolkit)\//i
  },
  {
    label: 'removed Blog easter-egg resource',
    pattern: /assets\/(?:css|images|audio|animation)\/blog\/|assets\/js\/Functions\/blog\//i
  },
  {
    label: 'removed legacy controls stylesheet',
    pattern: /assets\/css\/components\/legacy-controls\.css/i
  },
  {
    label: 'legacy flat About/Profile image path',
    pattern: /assets\/images\/about\/(?:profile\.jpg|Education_Background\.png|Excellent_Student_Scholarship--Silver\.jpg|Zhang_Zongzhi_Sci-Tech_Scholarship\.jpg|Excellent_Freshman_Scholarship--Silver\.jpg|Honorable_Mention\.jpg)/i
  },
  {
    label: 'legacy flat About/Profile PDF path',
    pattern: /assets\/pdf\/about\/(?:2025_MCM_Problem_B_Results\.pdf|Excellent_Freshman_Scholarship--Silver\.pdf)/i
  },
  {
    label: 'legacy flat About/Archive PDF path',
    pattern: /assets\/pdf\/about\/《概率论与数理统计》（缪柏其、张伟平）参考答案\.pdf/i
  },
  {
    label: 'legacy flat Social/Identity ORCID image path',
    pattern: /assets\/images\/social\/ORCID\.png/i
  }
];

const FORBIDDEN_SOURCE_PATTERNS = [
  {
    label: 'legacy About page key string',
    pattern: /['"]resume['"]/i
  },
  {
    label: 'legacy About page key property',
    pattern: /\bresume\s*:/i
  },
  {
    label: 'legacy Profile selector or control prefix',
    pattern: /resume-/i
  },
  {
    label: 'legacy ResumeExpanders API',
    pattern: /\bResumeExpanders\b/
  },
  {
    label: 'legacy AboutResumeRender API',
    pattern: /\bAboutResumeRender\b/
  },
  {
    label: 'legacy Resume expander storage key',
    pattern: /resume_expanders_/i
  },
  {
    label: 'retired Toolkit page key',
    pattern: /['"]toolkit['"]/
  },
  {
    label: 'retired Toolkit mount point',
    pattern: /\bmount-toolkit\b/i
  },
  {
    label: 'retired Toolkit runtime API',
    pattern: /\b(?:TOOLKIT_(?:EN|ZH)_I18N|initToolkitFilter)\b|\bwindow\.Toolkit\b/
  },
  {
    label: 'retired page-local control identifier',
    pattern: /\b(?:about-back-btn|social-back-btn|schedule-back-btn|toolkit-back-btn|toggle-btn-social|toggle-btn-schedule|toggle-btn-toolkit|clock-social|clock-schedule|clock-toolkit|clock-toggle)\b/
  }
];

const SOURCE_SCAN_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js'
]);

const LOCAL_ASSET_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
  '.mp3',
  '.m4a',
  '.mp4',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.cur'
]);

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

const SELF_FILE = path.normalize(__filename);

let errors = [];
let warnings = [];

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
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

function isExternalUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) ||
    /^(?:data:|mailto:|tel:|#)/i.test(value);
}

function stripQueryAndHash(value) {
  return String(value).split(/[?#]/)[0];
}

function toRepoPath(value) {
  let clean = stripQueryAndHash(value).trim();

  if (!clean || isExternalUrl(clean)) {
    return null;
  }

  if (clean.startsWith('./')) {
    clean = clean.slice(2);
  }

  if (clean.startsWith('/')) {
    clean = clean.slice(1);
  }

  return clean.replace(/\\/g, '/');
}

function evaluateConfigFile(file, sandbox, requiredGlobalName) {
  if (!fs.existsSync(file)) {
    fail(`Missing config file: ${rel(file)}`);
    return false;
  }

  const code = readText(file);

  try {
    vm.runInNewContext(code, sandbox, {
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

function addAsset(assets, value, origin, kind) {
  if (typeof value !== 'string') return;

  const repoPath = toRepoPath(value);
  if (!repoPath) return;

  assets.push({
    path: repoPath,
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

  if (typeof extension !== 'string' || !extension.trim()) {
    fail('coverVideo.extension must be a non-empty string when coverVideo is enabled.');
    return;
  }

  addAsset(assets, videoDir, 'coverVideo.dir', 'dir');

  coverFiles.forEach((imageFile, index) => {
    if (typeof imageFile !== 'string') {
      fail(`images.coverFiles[${index}] must be a string before checking cover video.`);
      return;
    }

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

    if (!page || typeof page !== 'object') {
      fail(`pages.${pageKey} must be an object.`);
      return;
    }

    if (typeof page.route !== 'string' || !page.route.trim()) {
      fail(`pages.${pageKey}.route must be a non-empty string.`);
    }

    if (typeof page.domId !== 'string' || !page.domId.trim()) {
      fail(`pages.${pageKey}.domId must be a non-empty string.`);
    }

    if (typeof page.mountId !== 'string' || !page.mountId.trim()) {
      fail(`pages.${pageKey}.mountId must be a non-empty string.`);
    }

    collectAssetList(assets, page.styles || [], `pages.${pageKey}.styles`, 'style');
    collectAssetList(assets, page.scripts || [], `pages.${pageKey}.scripts`, 'script');
  });
}

function collectAssets(resources) {
  const assets = [];

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

function checkAssetExists(asset) {
  if (asset.kind === 'external') return;

  const abs = path.join(ROOT, asset.path);

  if (!fs.existsSync(abs)) {
    fail(`Missing ${asset.kind}: ${asset.path}    from ${asset.origin}`);
    return;
  }

  const stat = fs.statSync(abs);

  if (asset.kind === 'dir' && !stat.isDirectory()) {
    fail(`Expected directory but found file: ${asset.path}    from ${asset.origin}`);
  }

  if (asset.kind !== 'dir' && !stat.isFile()) {
    fail(`Expected file but found directory: ${asset.path}    from ${asset.origin}`);
  }
}

function checkDuplicateLocalScriptsAndStyles(assets) {
  const map = new Map();

  assets.forEach((asset) => {
    if (asset.kind !== 'style' && asset.kind !== 'script') return;

    const key = `${asset.kind}:${asset.path}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(asset.origin);
  });

  Array.from(map.entries()).forEach(([key, origins]) => {
    if (origins.length <= 1) return;

    const [, assetPath] = key.split(':');
    warn(`Duplicate configured ${key.startsWith('style:') ? 'stylesheet' : 'script'}: ${assetPath}\n  used by: ${origins.join(', ')}`);
  });
}

function checkForbiddenConfiguredAssets(assets) {
  assets.forEach((asset) => {
    FORBIDDEN_PATH_PATTERNS.forEach((item) => {
      if (item.pattern.test(asset.path)) {
        fail(`Forbidden legacy path (${item.label}): ${asset.path}    from ${asset.origin}`);
      }
    });
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

    const ext = path.extname(entry.name).toLowerCase();
    if (!SCANNED_EXTENSIONS.has(ext)) return;

    if (path.normalize(abs) === SELF_FILE) return;

    out.push(abs);
  });

  return out;
}

function listFilesRecursively(directory, out) {
  if (!fs.existsSync(directory)) return out;

  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  entries.forEach((entry) => {
    const abs = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      listFilesRecursively(abs, out);
      return;
    }

    if (entry.isFile()) {
      out.push(abs);
    }
  });

  return out;
}

function checkRetiredArtifactsAbsent() {
  RETIRED_MODULE_DIRECTORIES.forEach((repoDirectory) => {
    const abs = path.join(ROOT, repoDirectory);
    const files = listFilesRecursively(abs, []);

    files.forEach((file) => {
      fail(
        `Retired module file must be removed: ${rel(file)}`
      );
    });
  });

  RETIRED_FILES.forEach((repoFile) => {
    const abs = path.join(ROOT, repoFile);

    if (fs.existsSync(abs)) {
      fail(`Retired file must be removed: ${repoFile}`);
    }
  });
}

function checkForbiddenTextReferences() {
  const files = walkFiles(ROOT, []);

  files.forEach((file) => {
    const text = readText(file);

    FORBIDDEN_PATH_PATTERNS.forEach((item) => {
      if (item.pattern.test(text)) {
        fail(`Forbidden legacy path (${item.label}) found in ${rel(file)}`);
      }
    });

    const extension = path.extname(file).toLowerCase();
    if (!SOURCE_SCAN_EXTENSIONS.has(extension)) return;

    FORBIDDEN_SOURCE_PATTERNS.forEach((item) => {
      if (item.pattern.test(text)) {
        fail(`Forbidden legacy source reference (${item.label}) found in ${rel(file)}`);
      }
    });
  });
}

function decodeRepoPath(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function extractStaticLocalAssetReferences(text) {
  const references = [];
  const pattern = /(['"`])((?:\.\/|\/)?assets\/[^'"`\r\n]+?)\1/g;
  let match = null;

  while ((match = pattern.exec(text)) !== null) {
    const value = String(match[2] || '').trim();

    if (
      !value ||
      value.includes('${') ||
      /[*{}<>]/.test(value)
    ) {
      continue;
    }

    const clean = stripQueryAndHash(value);
    const extension = path.posix.extname(clean).toLowerCase();

    if (!LOCAL_ASSET_EXTENSIONS.has(extension)) {
      continue;
    }

    references.push(value);
  }

  return references;
}

function checkStaticLocalAssetReferences() {
  const files = walkFiles(ROOT, []);

  files.forEach((file) => {
    const text = readText(file);
    const references = extractStaticLocalAssetReferences(text);

    references.forEach((value) => {
      const repoPath = toRepoPath(value);
      if (!repoPath) return;

      const decodedPath = decodeRepoPath(repoPath);
      const candidates = Array.from(
        new Set([repoPath, decodedPath])
      );

      const exists = candidates.some((candidate) => {
        const abs = path.join(ROOT, candidate);
        return fs.existsSync(abs) && fs.statSync(abs).isFile();
      });

      if (!exists) {
        fail(
          `Missing statically referenced local asset: ${repoPath}    from ${rel(file)}`
        );
      }
    });
  });
}

function checkRouteEntries(resources) {
  const rootIndex = path.join(ROOT, 'index.html');

  if (!fs.existsSync(rootIndex)) {
    fail('Missing root index.html');
  }

  const localization = resources && resources.localization
    ? resources.localization
    : {};

  if (typeof localization.defaultLanguage !== 'string') {
    fail('localization.defaultLanguage must be a string.');
  }

  const defaultLanguage = String(
    localization.defaultLanguage || ''
  ).trim().toLowerCase();
  if (
    !Array.isArray(localization.languages) ||
    localization.languages.length === 0
  ) {
    fail(
      'localization.languages must be a non-empty array.'
    );
  }

  if (
    Array.isArray(localization.languages) &&
    localization.languages.some((language) =>
      typeof language !== 'string'
    )
  ) {
    fail(
      'localization.languages must contain only strings.'
    );
  }

  const languages = Array.isArray(localization.languages)
    ? localization.languages.map((language) =>
        typeof language === 'string'
          ? language.trim().toLowerCase()
          : ''
      )
    : [];

  if (!languages.includes(defaultLanguage)) {
    fail(
      'localization.defaultLanguage must be included in languages.'
    );
  }

  if (defaultLanguage !== 'en') {
    fail(
      'localization.defaultLanguage must be en for the formal unprefixed entries.'
    );
  }

  if (
    languages.some((language) => !language) ||
    new Set(languages).size !== languages.length
  ) {
    fail(
      'localization.languages must contain unique, non-empty language codes.'
    );
  }

  if (
    languages.some((language) =>
      !/^[a-z0-9][a-z0-9-]*$/.test(language)
    )
  ) {
    fail(
      'localization.languages must contain safe lowercase URL path segments.'
    );
  }

  if (
    languages.length !== 2 ||
    !languages.includes('en') ||
    !languages.includes('zh')
  ) {
    fail(
      'localization.languages must contain exactly en and zh.'
    );
  }

  const htmlLanguages = localization.htmlLanguages || {};
  const hreflangLanguages = localization.hreflangLanguages || {};

  languages.forEach((language) => {
    if (
      typeof htmlLanguages[language] !== 'string' ||
      !htmlLanguages[language].trim()
    ) {
      fail(`Missing localization.htmlLanguages.${language}.`);
    }

    if (
      typeof hreflangLanguages[language] !== 'string' ||
      !hreflangLanguages[language].trim()
    ) {
      fail(`Missing localization.hreflangLanguages.${language}.`);
    }
  });

  const canonicalOrigin =
    resources && resources.site
      ? resources.site.canonicalOrigin
      : '';

  let canonicalUrl = null;

  try {
    canonicalUrl = new URL(canonicalOrigin);
  } catch (error) {}

  if (
    typeof canonicalOrigin !== 'string' ||
    !canonicalUrl ||
    canonicalUrl.protocol !== 'https:' ||
    canonicalUrl.username ||
    canonicalUrl.password ||
    canonicalUrl.pathname !== '/' ||
    canonicalUrl.search ||
    canonicalUrl.hash ||
    !(
      canonicalOrigin === canonicalUrl.origin ||
      canonicalOrigin === canonicalUrl.origin + '/'
    )
  ) {
    fail(
      'site.canonicalOrigin must be a bare HTTPS origin.'
    );
  }

  const pages = resources && resources.pages
    ? resources.pages
    : {};
  if (
    !Array.isArray(localization.localizedPages) ||
    localization.localizedPages.length === 0
  ) {
    fail(
      'localization.localizedPages must be a non-empty array.'
    );
  }

  if (
    Array.isArray(localization.localizedPages) &&
    localization.localizedPages.some((pageKey) =>
      typeof pageKey !== 'string'
    )
  ) {
    fail(
      'localization.localizedPages must contain only strings.'
    );
  }

  const localizedPageKeys = Array.isArray(
    localization.localizedPages
  )
    ? localization.localizedPages.map((pageKey) =>
        typeof pageKey === 'string'
          ? pageKey.trim()
          : ''
      )
    : [];
  const localizedRoutes = [];

  if (localizedPageKeys.some((pageKey) => !pageKey)) {
    fail('localization.localizedPages contains an empty page key.');
  }

  if (
    new Set(localizedPageKeys).size !== localizedPageKeys.length
  ) {
    fail('localization.localizedPages contains duplicate page keys.');
  }

  const navigation = resources && resources.navigation
    ? resources.navigation
    : {};
  const defaultPage = typeof navigation.defaultPage === 'string'
    ? navigation.defaultPage.trim()
    : '';

  if (!defaultPage || !pages[defaultPage]) {
    fail('navigation.defaultPage must name a configured page key.');
  }

  if (!Array.isArray(navigation.pages) || navigation.pages.length === 0) {
    fail('navigation.pages must be a non-empty array.');
  } else {
    const navigationPages = navigation.pages.map((pageKey) =>
      typeof pageKey === 'string' ? pageKey.trim() : ''
    );

    if (navigationPages.some((pageKey) => !pageKey)) {
      fail('navigation.pages must contain only non-empty page keys.');
    }

    if (new Set(navigationPages).size !== navigationPages.length) {
      fail('navigation.pages must not contain duplicate page keys.');
    }

    navigationPages.forEach((pageKey) => {
      if (!pages[pageKey]) {
        fail(`navigation.pages references an unknown page key: ${pageKey}`);
      }
    });
  }

  localizedPageKeys.forEach((pageKey) => {
    const page = pages[pageKey];

    if (!page || typeof page.route !== 'string' || !page.route.trim()) {
      fail(`Missing route for localized page: pages.${pageKey}.route`);
      return;
    }

    const route = page.route
      .trim()
      .replace(/^\/+|\/+$/g, '');

    if (
      !route ||
      route.includes('/') ||
      !/^[a-z0-9][a-z0-9_-]*$/.test(route)
    ) {
      fail(
        `pages.${pageKey}.route must be one safe lowercase top-level path segment.`
      );
      return;
    }

    if (pageKey !== route) {
      fail(
        `Localized page key must match its canonical route: pages.${pageKey}.route is ${route}.`
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        page,
        'defaultSubroute'
      )
    ) {
      const defaultSubroute =
        typeof page.defaultSubroute === 'string'
          ? page.defaultSubroute.trim()
          : '';

      if (
        !defaultSubroute ||
        !/^[a-z0-9][a-z0-9_-]*$/.test(
          defaultSubroute
        )
      ) {
        fail(
          `pages.${pageKey}.defaultSubroute must be one safe lowercase path segment.`
        );
      } else {
        const configuredSubroutes =
          INDEX_PAGES_CONFIG.pageSubroutes &&
          INDEX_PAGES_CONFIG.pageSubroutes[pageKey];

        if (
          !Array.isArray(configuredSubroutes) ||
          !configuredSubroutes.includes(
            defaultSubroute
          )
        ) {
          fail(
            `pages.${pageKey}.defaultSubroute must be listed in index_pages.config.js pageSubroutes.${pageKey}.`
          );
        }
      }
    }

    if (languages.includes(route)) {
      fail(
        `pages.${pageKey}.route conflicts with a language prefix: ${route}`
      );
      return;
    }

    localizedRoutes.push(route);
  });

  if (new Set(localizedRoutes).size !== localizedRoutes.length) {
    fail('Localized pages must use unique routes.');
  }

  localizedRoutes.forEach((route) => {
    const entry = path.join(ROOT, route, 'index.html');

    if (!fs.existsSync(entry)) {
      fail(
        `Missing unprefixed default-language entry: ${route}/index.html`
      );
    }

    languages.forEach((language) => {
      const localizedEntry = path.join(
        ROOT,
        language,
        route,
        'index.html'
      );

      if (!fs.existsSync(localizedEntry)) {
        fail(
          `Missing localized route entry: ${language}/${route}/index.html`
        );
      }
    });
  });

  ['toolkit', 'blog'].forEach((route) => {
    const retiredEntry = path.join(
      ROOT,
      route,
      'index.html'
    );

    if (fs.existsSync(retiredEntry)) {
      fail(`Retired route entry must be removed: ${route}/index.html`);
    }
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

    console.error('\nSite resource check failed.');
    process.exit(1);
  }

  console.log('Site resource check passed.');
}

function main() {
  const resources = loadSiteResources();

  if (resources) {
    const assets = collectAssets(resources);

    assets.forEach(checkAssetExists);
    checkDuplicateLocalScriptsAndStyles(assets);
    checkForbiddenConfiguredAssets(assets);
    checkRouteEntries(resources);
  } else {
    checkRouteEntries(null);
  }

  checkRetiredArtifactsAbsent();
  checkForbiddenTextReferences();
  checkStaticLocalAssetReferences();

  printResult();
}

main();
