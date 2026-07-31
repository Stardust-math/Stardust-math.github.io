#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  INDEX_FILE,
  CATALOG_FILE,
  PLACEHOLDER_FILE,
  ANIME_ROUTE_DIR,
  IMAGE_EXTENSIONS,
  relative,
  loadItems,
  buildArtifacts,
  assetPathToAbsolute,
  normalizeAssetPath,
  fileSha256
} = require(
  './lib/social_anime_data.js'
);

function readUInt24LE(
  buffer,
  offset
) {
  return (
    buffer[offset] |
    (
      buffer[offset + 1] <<
      8
    ) |
    (
      buffer[offset + 2] <<
      16
    )
  );
}

function detectImage(buffer) {
  if (
    buffer.length >= 24 &&
    buffer
      .subarray(0, 8)
      .equals(
        Buffer.from([
          0x89,
          0x50,
          0x4e,
          0x47,
          0x0d,
          0x0a,
          0x1a,
          0x0a
        ])
      )
  ) {
    return {
      type:
        'png',

      extension:
        '.png',

      width:
        buffer.readUInt32BE(
          16
        ),

      height:
        buffer.readUInt32BE(
          20
        )
    };
  }

  if (
    buffer.length >= 10 &&
    (
      buffer
        .subarray(0, 6)
        .toString('ascii') ===
        'GIF87a' ||
      buffer
        .subarray(0, 6)
        .toString('ascii') ===
        'GIF89a'
    )
  ) {
    return {
      type:
        'gif',

      extension:
        '.gif',

      width:
        buffer.readUInt16LE(
          6
        ),

      height:
        buffer.readUInt16LE(
          8
        )
    };
  }

  if (
    buffer.length >= 16 &&
    buffer
      .subarray(0, 4)
      .toString('ascii') ===
      'RIFF' &&
    buffer
      .subarray(8, 12)
      .toString('ascii') ===
      'WEBP'
  ) {
    const chunk =
      buffer
        .subarray(12, 16)
        .toString('ascii');

    if (
      chunk === 'VP8X' &&
      buffer.length >= 30
    ) {
      return {
        type:
          'webp',

        extension:
          '.webp',

        width:
          readUInt24LE(
            buffer,
            24
          ) + 1,

        height:
          readUInt24LE(
            buffer,
            27
          ) + 1
      };
    }

    if (
      chunk === 'VP8 ' &&
      buffer.length >= 30
    ) {
      const signatureOffset =
        23;

      if (
        buffer[
          signatureOffset
        ] === 0x9d &&
        buffer[
          signatureOffset + 1
        ] === 0x01 &&
        buffer[
          signatureOffset + 2
        ] === 0x2a
      ) {
        return {
          type:
            'webp',

          extension:
            '.webp',

          width:
            buffer.readUInt16LE(
              26
            ) &
            0x3fff,

          height:
            buffer.readUInt16LE(
              28
            ) &
            0x3fff
        };
      }
    }

    if (
      chunk === 'VP8L' &&
      buffer.length >= 25 &&
      buffer[20] === 0x2f
    ) {
      const bits =
        buffer.readUInt32LE(
          21
        );

      return {
        type:
          'webp',

        extension:
          '.webp',

        width:
          (
            bits &
            0x3fff
          ) + 1,

        height:
          (
            (
              bits >>
              14
            ) &
            0x3fff
          ) + 1
      };
    }

    return {
      type:
        'webp',

      extension:
        '.webp',

      width:
        null,

      height:
        null
    };
  }

  if (
    buffer.length >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8
  ) {
    let offset = 2;

    while (
      offset + 9 <
      buffer.length
    ) {
      if (
        buffer[offset] !==
        0xff
      ) {
        offset += 1;
        continue;
      }

      const marker =
        buffer[
          offset + 1
        ];

      offset += 2;

      if (
        marker === 0xd8 ||
        marker === 0xd9
      ) {
        continue;
      }

      if (
        offset + 2 >
        buffer.length
      ) {
        break;
      }

      const segmentLength =
        buffer.readUInt16BE(
          offset
        );

      if (
        segmentLength < 2 ||
        offset +
          segmentLength >
          buffer.length
      ) {
        break;
      }

      const isSof = [
        0xc0,
        0xc1,
        0xc2,
        0xc3,
        0xc5,
        0xc6,
        0xc7,
        0xc9,
        0xca,
        0xcb,
        0xcd,
        0xce,
        0xcf
      ].includes(marker);

      if (
        isSof &&
        segmentLength >= 7
      ) {
        return {
          type:
            'jpeg',

          extension:
            '.jpg',

          width:
            buffer.readUInt16BE(
              offset + 5
            ),

          height:
            buffer.readUInt16BE(
              offset + 3
            )
        };
      }

      offset +=
        segmentLength;
    }

    return {
      type:
        'jpeg',

      extension:
        '.jpg',

      width:
        null,

      height:
        null
    };
  }

  return null;
}

function normalizedExtension(
  filePath
) {
  const extension =
    path.extname(
      filePath
    ).toLowerCase();

  return extension === '.jpeg'
    ? '.jpg'
    : extension;
}

function checkGeneratedFile(
  filePath,
  expected,
  errors
) {
  if (
    !fs.existsSync(
      filePath
    )
  ) {
    errors.push(
      `Missing generated file: ${relative(filePath)}.`
    );

    return;
  }

  const actual =
    fs.readFileSync(
      filePath,
      'utf8'
    );

  if (actual !== expected) {
    errors.push(
      'Generated file is stale: ' +
      `${relative(filePath)}. ` +
      'Run the Anime build script before committing.'
    );
  }
}

function checkPlaceholder(errors) {
  if (
    !fs.existsSync(
      PLACEHOLDER_FILE
    )
  ) {
    errors.push(
      'Missing global Anime placeholder: ' +
      `${relative(PLACEHOLDER_FILE)}.`
    );

    return;
  }

  const stat =
    fs.statSync(
      PLACEHOLDER_FILE
    );

  if (
    !stat.isFile() ||
    stat.size < 100
  ) {
    errors.push(
      'Anime placeholder is empty or invalid: ' +
      `${relative(PLACEHOLDER_FILE)}.`
    );
  }
}

function checkRouteDirectory(errors) {
  const listEntry =
    path.join(
      ANIME_ROUTE_DIR,
      'index.html'
    );

  if (
    !fs.existsSync(
      listEntry
    )
  ) {
    errors.push(
      'Missing Anime list route entry: ' +
      `${relative(listEntry)}.`
    );
  }

  if (
    !fs.existsSync(
      ANIME_ROUTE_DIR
    )
  ) {
    return;
  }

  fs.readdirSync(
    ANIME_ROUTE_DIR,
    {
      withFileTypes:
        true
    }
  )
    .filter((entry) => {
      return (
        entry.isDirectory() &&
        /^bgm-\d+$/.test(
          entry.name
        )
      );
    })
    .forEach((entry) => {
      errors.push(
        'Obsolete Anime detail directory must be removed: ' +
        relative(
          path.join(
            ANIME_ROUTE_DIR,
            entry.name
          )
        ) +
        '.'
      );
    });
}

function checkFallbackCovers(
  items,
  errors
) {
  const usedPaths =
    new Map();

  const usedHashes =
    new Map();

  items.forEach((item) => {
    const fallbackPath =
      normalizeAssetPath(
        item.api &&
        item.api.coverFallback
      );

    const itemLabel =
      relative(
        item.__filePath
      );

    if (!fallbackPath) {
      errors.push(
        `${itemLabel}: api.coverFallback is missing.`
      );

      return;
    }

    let absolutePath;

    try {
      absolutePath =
        assetPathToAbsolute(
          fallbackPath
        );
    } catch (error) {
      errors.push(
        `${itemLabel}: ${error.message}`
      );

      return;
    }

    if (
      !absolutePath ||
      !fs.existsSync(
        absolutePath
      )
    ) {
      errors.push(
        `${itemLabel}: fallback cover does not exist: ${fallbackPath}.`
      );

      return;
    }

    const stat =
      fs.statSync(
        absolutePath
      );

    if (!stat.isFile()) {
      errors.push(
        `${itemLabel}: fallback cover is not a file: ${fallbackPath}.`
      );

      return;
    }

    if (stat.size < 512) {
      errors.push(
        `${itemLabel}: fallback cover is unexpectedly small ` +
        `(${stat.size} bytes): ${fallbackPath}.`
      );

      return;
    }

    const extension =
      normalizedExtension(
        absolutePath
      );

    if (
      !IMAGE_EXTENSIONS.has(
        path.extname(
          absolutePath
        ).toLowerCase()
      )
    ) {
      errors.push(
        `${itemLabel}: unsupported fallback extension: ${fallbackPath}.`
      );

      return;
    }

    const buffer =
      fs.readFileSync(
        absolutePath
      );

    const detected =
      detectImage(
        buffer
      );

    if (!detected) {
      errors.push(
        `${itemLabel}: fallback cover is not a supported image: ${fallbackPath}.`
      );

      return;
    }

    if (
      extension !==
      detected.extension
    ) {
      errors.push(
        `${itemLabel}: fallback extension ${extension} does not match ` +
        `detected ${detected.extension}: ${fallbackPath}.`
      );
    }

    if (
      detected.width !==
        null &&
      detected.height !==
        null
    ) {
      if (
        detected.width <= 0 ||
        detected.height <= 0
      ) {
        errors.push(
          `${itemLabel}: fallback cover has invalid dimensions: ${fallbackPath}.`
        );
      } else {
        const ratio =
          detected.width /
          detected.height;

        if (
          ratio < 0.55 ||
          ratio > 0.8
        ) {
          errors.push(
            `${itemLabel}: fallback cover ratio ${ratio.toFixed(3)} is not ` +
            `close to a portrait cover: ${fallbackPath}.`
          );
        }
      }
    }

    const normalizedAbsolute =
      path.resolve(
        absolutePath
      );

    if (
      usedPaths.has(
        normalizedAbsolute
      )
    ) {
      errors.push(
        `${itemLabel}: fallback cover path is also used by ` +
        `${usedPaths.get(normalizedAbsolute)}: ${fallbackPath}.`
      );
    } else {
      usedPaths.set(
        normalizedAbsolute,
        itemLabel
      );
    }

    const hash =
      fileSha256(
        absolutePath
      );

    if (
      usedHashes.has(hash)
    ) {
      errors.push(
        `${itemLabel}: fallback cover bytes are identical to ` +
        `${usedHashes.get(hash)}. Check for an accidental duplicate mapping.`
      );
    } else {
      usedHashes.set(
        hash,
        itemLabel
      );
    }
  });
}

function main() {
  const items =
    loadItems();

  const artifacts =
    buildArtifacts(
      items
    );

  const errors = [];

  checkGeneratedFile(
    INDEX_FILE,
    artifacts.indexText,
    errors
  );

  checkGeneratedFile(
    CATALOG_FILE,
    artifacts.catalogText,
    errors
  );

  checkPlaceholder(
    errors
  );

  checkRouteDirectory(
    errors
  );

  checkFallbackCovers(
    items,
    errors
  );

  console.log(
    'Social Anime check'
  );

  console.log(
    '=================='
  );

  console.log(
    `Items: ${items.length}`
  );

  if (errors.length) {
    console.error('');
    console.error('Problems');
    console.error('--------');

    errors.forEach((message) => {
      console.error(
        `- ${message}`
      );
    });

    process.exitCode = 1;
    return;
  }

  console.log(
    'All Anime data, generated files, routes, and fallback covers are valid.'
  );
}

try {
  main();
} catch (error) {
  console.error(
    '[check_social_anime] Failed.'
  );

  console.error(
    error && error.stack
      ? error.stack
      : error
  );

  process.exitCode = 1;
}