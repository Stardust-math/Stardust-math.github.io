#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_DIR = path.join(ROOT, '_site');

const TOP_LEVEL_EXCLUDES = new Set([
  '.git',
  '.github',
  '.cache',
  '.next',
  '_site',
  'node_modules',
  'scripts',
  'dist',
  'build',
  'package.json',
  'package-lock.json'
]);

function toPosix(value) {
  return value.replace(/\\/g, '/');
}

function rel(abs) {
  return toPosix(path.relative(ROOT, abs));
}

function removeIfExists(target) {
  fs.rmSync(target, {
    recursive: true,
    force: true
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, {
    recursive: true
  });
}

function shouldExclude(relativePath) {
  const clean = toPosix(relativePath);

  if (!clean) return false;

  const first = clean.split('/')[0];

  if (TOP_LEVEL_EXCLUDES.has(first)) {
    return true;
  }

  if (clean === 'assets/scss' || clean.startsWith('assets/scss/')) {
    return true;
  }

  if (clean.endsWith('.css.map')) {
    return true;
  }

  return false;
}

function copyRecursive(source, destination) {
  const relativePath = rel(source);

  if (shouldExclude(relativePath)) {
    return;
  }

  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    ensureDir(destination);

    const entries = fs.readdirSync(source, { withFileTypes: true });

    entries.forEach((entry) => {
      copyRecursive(
        path.join(source, entry.name),
        path.join(destination, entry.name)
      );
    });

    return;
  }

  if (!stat.isFile()) {
    return;
  }

  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function assertExists(relativePath) {
  const target = path.join(SITE_DIR, relativePath);

  if (!fs.existsSync(target)) {
    throw new Error(`Missing required Pages artifact file: ${relativePath}`);
  }
}

function assertNotExists(relativePath) {
  const target = path.join(SITE_DIR, relativePath);

  if (fs.existsSync(target)) {
    throw new Error(`Unexpected source-only file in Pages artifact: ${relativePath}`);
  }
}

function main() {
  removeIfExists(SITE_DIR);
  ensureDir(SITE_DIR);

  const entries = fs.readdirSync(ROOT, { withFileTypes: true });

  entries.forEach((entry) => {
    const source = path.join(ROOT, entry.name);
    const destination = path.join(SITE_DIR, entry.name);
    copyRecursive(source, destination);
  });

  assertExists('index.html');
  assertExists('about/index.html');
  assertExists('schedule/index.html');
  assertExists('social/index.html');
  assertExists('life/index.html');
  assertExists('assets/js/Config/SiteResources.js');
  assertExists('assets/css/base/site-zoom.css');
  assertExists('sw.js');

  assertNotExists('assets/scss');
  assertNotExists('scripts');
  assertNotExists('node_modules');
  assertNotExists('package.json');
  assertNotExists('package-lock.json');

  console.log('Pages site directory built at _site/.');
}

main();