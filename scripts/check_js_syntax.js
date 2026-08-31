#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const SCAN_ROOTS = [
  'assets/js',
  'scripts'
];

const ROOT_FILES = [
  'sw.js'
];

function toPosix(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function collectJavaScriptFiles(relativeDirectory) {
  const absoluteDirectory = path.join(
    ROOT,
    relativeDirectory
  );

  if (!fs.existsSync(absoluteDirectory)) {
    throw new Error(
      `JavaScript source directory is missing: ${relativeDirectory}`
    );
  }

  const files = [];
  const entries = fs.readdirSync(
    absoluteDirectory,
    { withFileTypes: true }
  );

  entries.forEach((entry) => {
    const relativePath = toPosix(
      path.posix.join(
        relativeDirectory,
        entry.name
      )
    );

    if (entry.isDirectory()) {
      files.push(
        ...collectJavaScriptFiles(relativePath)
      );
      return;
    }

    if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === '.js'
    ) {
      files.push(relativePath);
    }
  });

  return files;
}

function main() {
  const files = SCAN_ROOTS
    .flatMap(collectJavaScriptFiles)
    .concat(ROOT_FILES)
    .sort();

  const errors = [];

  files.forEach((relativePath) => {
    const absolutePath = path.join(
      ROOT,
      relativePath
    );

    if (!fs.existsSync(absolutePath)) {
      errors.push(
        `${relativePath}: file is missing.`
      );
      return;
    }

    try {
      const source = fs.readFileSync(
        absolutePath,
        'utf8'
      );

      new vm.Script(source, {
        filename: relativePath
      });
    } catch (error) {
      errors.push(
        error && error.stack
          ? error.stack
          : `${relativePath}: ${error}`
      );
    }
  });

  if (errors.length) {
    console.error(
      'JavaScript syntax check failed.\n'
    );
    console.error(errors.join('\n\n'));
    process.exit(1);
  }

  console.log(
    `JavaScript syntax check passed (${files.length} files).`
  );
}

main();
