#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const INDEX_PAGE_GENERATOR = path.join(
  ROOT,
  'scripts',
  'generate_index_pages.js'
);

const PUBLIC_DIRECTORIES = Object.freeze([
  'assets'
]);

const PUBLIC_ROOT_FILES = Object.freeze([
  'LICENSE',
  'giscus.json',
  'sw.js'
]);

const COVER_VIDEO_DIR_PLACEHOLDER =
  '/* __CLOUDFLARE_COVER_VIDEO_DIR__ */ null';

const DEFAULT_R2_COVER_VIDEO_DIR =
  'https://pub-af9c4bd8bbc54c3da2c1a4e992469554.r2.dev/cover/';

/*
  以后绑定正式 R2 自定义域名时，可以在 Cloudflare Pages 中设置：

  COVER_VIDEO_BASE_URL=https://media.example.com/cover/

  这样无需再次修改仓库代码。
*/
const R2_COVER_VIDEO_DIR = normalizeBaseUrl(
  process.env.COVER_VIDEO_BASE_URL ||
  DEFAULT_R2_COVER_VIDEO_DIR
);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_FILE_COUNT = normalizePositiveInteger(
  process.env.CLOUDFLARE_PAGES_MAX_FILES,
  20000,
  'CLOUDFLARE_PAGES_MAX_FILES'
);

function toPosix(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function normalizePositiveInteger(value, fallback, label) {
  const text = String(value == null ? '' : value).trim();

  if (!text) return fallback;

  if (!/^[1-9]\d*$/.test(text)) {
    throw new Error(`${label} must be a positive integer.`);
  }

  const number = Number(text);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} must be a safe positive integer.`);
  }

  return number;
}

function normalizeBaseUrl(value) {
  const valueText = String(value || '').trim();
  let url;

  try {
    url = new URL(valueText);
  } catch (error) {
    url = null;
  }

  if (
    !url ||
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    /[?#]/.test(valueText)
  ) {
    throw new Error(
      'COVER_VIDEO_BASE_URL must be an HTTPS base URL without credentials, query, or hash.'
    );
  }

  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }

  return url.href;
}

function shouldSkipFile(relativePath) {
  const normalized = toPosix(relativePath);

  /*
    Cloudflare Pages 不接收这些大型视频。
    源仓库和 GitHub Pages 中的原文件保持不变。
  */
  return /^assets\/animation\/cover\/[^/]+\.mp4$/i.test(
    normalized
  );
}

function copyDirectory(
  sourceDirectory,
  destinationDirectory,
  relativeDirectory = ''
) {
  fs.mkdirSync(destinationDirectory, {
    recursive: true
  });

  const entries = fs.readdirSync(sourceDirectory, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;

    const sourcePath = path.join(
      sourceDirectory,
      entry.name
    );

    const destinationPath = path.join(
      destinationDirectory,
      entry.name
    );

    if (entry.isDirectory()) {
      copyDirectory(
        sourcePath,
        destinationPath,
        relativePath
      );

      continue;
    }

    if (!entry.isFile()) {
      console.log(`[skip unsupported] ${relativePath}`);
      continue;
    }

    if (shouldSkipFile(relativePath)) {
      console.log(`[skip large asset] ${relativePath}`);
      continue;
    }

    fs.mkdirSync(path.dirname(destinationPath), {
      recursive: true
    });

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function copyPublicFile(relativePath) {
  const sourcePath = path.join(ROOT, relativePath);
  const destinationPath = path.join(DIST, relativePath);

  if (
    !fs.existsSync(sourcePath) ||
    !fs.lstatSync(sourcePath).isFile()
  ) {
    throw new Error(
      `Required public file was not found: ${relativePath}`
    );
  }

  fs.mkdirSync(path.dirname(destinationPath), {
    recursive: true
  });

  fs.copyFileSync(sourcePath, destinationPath);
  console.log(`[copy public file] ${relativePath}`);
}

function copyPublicInputs() {
  PUBLIC_DIRECTORIES.forEach((relativePath) => {
    const sourcePath = path.join(ROOT, relativePath);

    if (
      !fs.existsSync(sourcePath) ||
      !fs.lstatSync(sourcePath).isDirectory()
    ) {
      throw new Error(
        `Required public directory was not found: ${relativePath}`
      );
    }

    copyDirectory(
      sourcePath,
      path.join(DIST, relativePath),
      relativePath
    );
  });

  PUBLIC_ROOT_FILES.forEach(copyPublicFile);
}

function getGeneratedIndexPaths() {
  const output = execFileSync(
    process.execPath,
    [INDEX_PAGE_GENERATOR, '--paths'],
    {
      cwd: ROOT,
      encoding: 'utf8'
    }
  );

  const paths = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paths.length === 0) {
    throw new Error(
      'The index page generator returned no output paths.'
    );
  }

  const uniquePaths = new Set();

  paths.forEach((filePath) => {
    const normalized = toPosix(filePath);

    if (
      normalized !== path.posix.normalize(normalized) ||
      path.posix.isAbsolute(normalized) ||
      normalized === '..' ||
      normalized.startsWith('../') ||
      !/(^|\/)index\.html$/.test(normalized)
    ) {
      throw new Error(
        `The index page generator returned an unsafe path: ${filePath}`
      );
    }

    if (uniquePaths.has(normalized)) {
      throw new Error(
        `The index page generator returned a duplicate path: ${normalized}`
      );
    }

    uniquePaths.add(normalized);
  });

  return Array.from(uniquePaths);
}

function generateIndexPages() {
  execFileSync(
    process.execPath,
    [INDEX_PAGE_GENERATOR, '--output-root=dist'],
    {
      cwd: ROOT,
      stdio: 'inherit'
    }
  );
}

function injectCloudflareVideoDirectory() {
  const configPath = path.join(
    DIST,
    'assets',
    'js',
    'Config',
    'SiteResources.js'
  );

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Generated SiteResources.js was not found: ${configPath}`
    );
  }

  const originalText = fs.readFileSync(
    configPath,
    'utf8'
  );

  const replacementCount = originalText
    .split(COVER_VIDEO_DIR_PLACEHOLDER)
    .length - 1;

  if (replacementCount !== 1) {
    throw new Error(
      `Expected exactly one Cloudflare cover video placeholder, but found ${replacementCount}.`
    );
  }

  const updatedText = originalText.replace(
    COVER_VIDEO_DIR_PLACEHOLDER,
    JSON.stringify(R2_COVER_VIDEO_DIR)
  );

  if (updatedText.includes(COVER_VIDEO_DIR_PLACEHOLDER)) {
    throw new Error(
      'Cloudflare cover video placeholder remained after injection.'
    );
  }

  fs.writeFileSync(
    configPath,
    updatedText,
    'utf8'
  );

  console.log(
    `[inject] Cloudflare cover video directory: ${R2_COVER_VIDEO_DIR}`
  );
}

function validateOutput(generatedIndexPaths) {
  const requiredIndexPath = path.join(
    DIST,
    'index.html'
  );

  if (!fs.existsSync(requiredIndexPath)) {
    throw new Error(
      'dist/index.html was not generated.'
    );
  }

  const missingGeneratedEntries = generatedIndexPaths
    .filter((relativePath) =>
      !fs.existsSync(path.join(DIST, relativePath))
    );

  if (missingGeneratedEntries.length > 0) {
    throw new Error(
      [
        'Cloudflare Pages output is missing generated entries:',
        ...missingGeneratedEntries
      ].join('\n')
    );
  }

  const allowedTopLevelEntries = new Set([
    ...PUBLIC_DIRECTORIES,
    ...PUBLIC_ROOT_FILES
  ]);

  generatedIndexPaths.forEach((relativePath) => {
    allowedTopLevelEntries.add(
      toPosix(relativePath).split('/')[0]
    );
  });

  const unexpectedTopLevelEntries = fs
    .readdirSync(DIST)
    .filter((entryName) =>
      !allowedTopLevelEntries.has(entryName)
    );

  if (unexpectedTopLevelEntries.length > 0) {
    throw new Error(
      [
        'Cloudflare Pages output contains unexpected top-level entries:',
        ...unexpectedTopLevelEntries
      ].join('\n')
    );
  }

  const oversizedFiles = [];
  const accidentallyCopiedVideos = [];

  let fileCount = 0;

  function scan(currentDirectory) {
    const entries = fs.readdirSync(currentDirectory, {
      withFileTypes: true
    });

    for (const entry of entries) {
      const fullPath = path.join(
        currentDirectory,
        entry.name
      );

      if (entry.isDirectory()) {
        scan(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      fileCount += 1;

      const relativePath = toPosix(
        path.relative(DIST, fullPath)
      );

      const stats = fs.statSync(fullPath);

      if (stats.size > MAX_FILE_SIZE_BYTES) {
        oversizedFiles.push({
          path: relativePath,
          sizeMiB: stats.size / 1024 / 1024
        });
      }

      if (
        /^assets\/animation\/cover\/[^/]+\.mp4$/i.test(
          relativePath
        )
      ) {
        accidentallyCopiedVideos.push(relativePath);
      }
    }
  }

  scan(DIST);

  if (accidentallyCopiedVideos.length > 0) {
    throw new Error(
      [
        'Local cover videos were accidentally copied into dist:',
        ...accidentallyCopiedVideos
      ].join('\n')
    );
  }

  if (oversizedFiles.length > 0) {
    const details = oversizedFiles.map((file) => {
      return `${file.path} (${file.sizeMiB.toFixed(2)} MiB)`;
    });

    throw new Error(
      [
        'Cloudflare Pages output contains files over 25 MiB:',
        ...details
      ].join('\n')
    );
  }

  if (fileCount > MAX_FILE_COUNT) {
    throw new Error(
      `Cloudflare Pages output contains ${fileCount} files; configured limit is ${MAX_FILE_COUNT}.`
    );
  }

  console.log(`[validate] File count: ${fileCount}`);
  console.log(
    `[validate] Generated index entries: ${generatedIndexPaths.length}`
  );
  console.log('[validate] Public top-level allowlist passed.');
  console.log('[validate] No files exceed 25 MiB.');
  console.log('[validate] No local cover MP4 files were copied.');
}

function build() {
  console.log(
    '[build] Preparing Cloudflare Pages output...'
  );

  fs.rmSync(DIST, {
    recursive: true,
    force: true
  });

  fs.mkdirSync(DIST, {
    recursive: true
  });

  const generatedIndexPaths = getGeneratedIndexPaths();

  copyPublicInputs();
  generateIndexPages();
  injectCloudflareVideoDirectory();
  validateOutput(generatedIndexPaths);

  console.log(
    '[build] Cloudflare Pages output is ready.'
  );

  console.log(
    `[build] Output directory: ${DIST}`
  );
}

try {
  build();
} catch (error) {
  console.error(
    '[build] Failed:',
    error && error.message
      ? error.message
      : error
  );

  process.exit(1);
}
