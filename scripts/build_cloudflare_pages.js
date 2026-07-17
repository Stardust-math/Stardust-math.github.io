#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

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
const MAX_FILE_COUNT = Number(
  process.env.CLOUDFLARE_PAGES_MAX_FILES || 20000
);

const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.github',
  'dist',
  'node_modules',
  'scripts'
]);

function toPosix(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function normalizeBaseUrl(value) {
  const url = String(value || '').trim();

  if (!/^https:\/\//i.test(url)) {
    throw new Error(
      'COVER_VIDEO_BASE_URL must begin with https://'
    );
  }

  return url.endsWith('/') ? url : `${url}/`;
}

function shouldSkipDirectory(relativePath) {
  const normalized = toPosix(relativePath);
  const firstSegment = normalized.split('/')[0];

  return SKIPPED_DIRECTORIES.has(firstSegment);
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
      if (shouldSkipDirectory(relativePath)) {
        console.log(`[skip directory] ${relativePath}`);
        continue;
      }

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

function patchCloudflareVideoDirectory() {
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

  /*
    只匹配 coverVideo 配置块中的本地视频目录。
  */
  const localVideoDirectoryPattern =
    /(coverVideo\s*:\s*\{[\s\S]*?\bdir\s*:\s*)A\s*\+\s*(['"])animation\/cover\/\2/;

  let replacementCount = 0;

  const updatedText = originalText.replace(
    localVideoDirectoryPattern,
    (fullMatch, prefix) => {
      replacementCount += 1;

      return `${prefix}'${R2_COVER_VIDEO_DIR}'`;
    }
  );

  if (replacementCount !== 1) {
    throw new Error(
      `Expected to replace exactly one coverVideo.dir, but replaced ${replacementCount}.`
    );
  }

  fs.writeFileSync(
    configPath,
    updatedText,
    'utf8'
  );

  console.log(
    `[patch] Cloudflare cover video directory: ${R2_COVER_VIDEO_DIR}`
  );
}

function validateOutput() {
  const requiredIndexPath = path.join(
    DIST,
    'index.html'
  );

  if (!fs.existsSync(requiredIndexPath)) {
    throw new Error(
      'dist/index.html was not generated.'
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

  copyDirectory(ROOT, DIST);
  patchCloudflareVideoDirectory();
  validateOutput();

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