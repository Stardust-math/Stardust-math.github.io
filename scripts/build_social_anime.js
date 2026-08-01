#!/usr/bin/env node
'use strict';

const fs = require('fs');

const {
  INDEX_FILE,
  CATALOG_FILE,
  relative,
  loadItems,
  buildArtifacts,
  writeTextIfChanged
} = require(
  './lib/social_anime_data.js'
);

const args =
  new Set(
    process.argv.slice(2)
  );

const checkOnly =
  args.has('--check');

function compareFile(
  filePath,
  expected
) {
  if (
    !fs.existsSync(filePath)
  ) {
    return 'missing';
  }

  return (
    fs.readFileSync(
      filePath,
      'utf8'
    ) === expected
  )
    ? 'current'
    : 'stale';
}

function main() {
  const rawItems =
    loadItems();

  const artifacts =
    buildArtifacts(
      rawItems
    );

  if (checkOnly) {
    const indexStatus =
      compareFile(
        INDEX_FILE,
        artifacts.indexText
      );

    const catalogStatus =
      compareFile(
        CATALOG_FILE,
        artifacts.catalogText
      );

    console.log(
      'Social Anime build check'
    );

    console.log(
      '========================'
    );

    console.log(
      `Items: ${artifacts.items.length}`
    );

    console.log(
      `${relative(INDEX_FILE)}: ${indexStatus}`
    );

    console.log(
      `${relative(CATALOG_FILE)}: ${catalogStatus}`
    );

    if (
      indexStatus !== 'current' ||
      catalogStatus !== 'current'
    ) {
      console.error(
        '\nGenerated Anime files are not up to date.'
      );

      console.error(
        'Run: node scripts/build_social_anime.js'
      );

      process.exitCode = 1;
    }

    return;
  }

  const indexChanged =
    writeTextIfChanged(
      INDEX_FILE,
      artifacts.indexText
    );

  const catalogChanged =
    writeTextIfChanged(
      CATALOG_FILE,
      artifacts.catalogText
    );

  console.log(
    'Social Anime build'
  );

  console.log(
    '=================='
  );

  console.log(
    `Items: ${artifacts.items.length}`
  );

  console.log(
    (
      indexChanged
        ? 'updated'
        : 'current'
    ) +
    ': ' +
    relative(INDEX_FILE)
  );

  console.log(
    (
      catalogChanged
        ? 'updated'
        : 'current'
    ) +
    ': ' +
    relative(CATALOG_FILE)
  );
}

try {
  main();
} catch (error) {
  console.error(
    '[build_social_anime] Failed.'
  );

  console.error(
    error && error.stack
      ? error.stack
      : error
  );

  process.exitCode = 1;
}