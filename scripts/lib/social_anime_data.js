'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(
  __dirname,
  '..',
  '..'
);

const DATA_ROOT = path.join(
  ROOT,
  'assets/data/social/anime'
);

const ITEMS_DIR = path.join(
  DATA_ROOT,
  'items'
);

const SETTINGS_FILE = path.join(
  DATA_ROOT,
  'settings.json'
);

const INDEX_FILE = path.join(
  DATA_ROOT,
  'anime-index.json'
);

const CATALOG_FILE = path.join(
  DATA_ROOT,
  'CATALOG.md'
);

const FALLBACK_DIR = path.join(
  ROOT,
  'assets/images/social/anime/fallback'
);

const PLACEHOLDER_FILE = path.join(
  ROOT,
  'assets/images/social/anime/anime-placeholder.svg'
);

const ANIME_ROUTE_DIR = path.join(
  ROOT,
  'social/anime'
);

const ITEM_FILE_RE =
  /^bgm-(\d+)\.json$/;

const ITEM_ID_RE =
  /^bgm-(\d+)$/;

const ALLOWED_STATUSES =
  new Set([
    'watching',
    'planned',
    'completed'
  ]);

const ALLOWED_CUSTOM_KEYS =
  new Set([
    'status',
    'noteZH',
    'noteEN'
  ]);

const ALLOWED_SOURCE_KEYS =
  new Set([
    'bangumiUrl',
    'watchUrl'
  ]);

const IMAGE_EXTENSIONS =
  new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif'
  ]);

function toPosix(value) {
  return String(value || '')
    .replace(/\\/g, '/');
}

function relative(filePath) {
  return toPosix(
    path.relative(
      ROOT,
      filePath
    )
  );
}

function ensureDirectory(directory) {
  fs.mkdirSync(
    directory,
    {
      recursive: true
    }
  );
}

function readJson(filePath) {
  let source;

  try {
    source =
      fs.readFileSync(
        filePath,
        'utf8'
      );
  } catch (error) {
    throw new Error(
      `Cannot read ${relative(filePath)}: ${error.message}`
    );
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${relative(filePath)}: ${error.message}`
    );
  }
}

function stringifyJson(value) {
  return (
    JSON.stringify(
      value,
      null,
      2
    ) +
    '\n'
  );
}

function writeTextIfChanged(
  filePath,
  content
) {
  const current =
    fs.existsSync(filePath)
      ? fs.readFileSync(
          filePath,
          'utf8'
        )
      : null;

  if (current === content) {
    return false;
  }

  ensureDirectory(
    path.dirname(filePath)
  );

  fs.writeFileSync(
    filePath,
    content,
    'utf8'
  );

  return true;
}

function asString(value) {
  return value == null
    ? ''
    : String(value).trim();
}

function isNonEmptyString(value) {
  return (
    typeof value === 'string' &&
    value.trim() !== ''
  );
}

function finiteNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function integerOrNull(value) {
  const number =
    finiteNumber(value);

  return (
    number !== null &&
    Number.isInteger(number)
  )
    ? number
    : null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen =
    new Set();

  const result = [];

  value.forEach((entry) => {
    const text =
      asString(entry);

    if (
      !text ||
      seen.has(text)
    ) {
      return;
    }

    seen.add(text);
    result.push(text);
  });

  return result;
}

function isHttpUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const parsed =
      new URL(value);

    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:'
    );
  } catch (error) {
    return false;
  }
}

function normalizeAssetPath(value) {
  let assetPath =
    asString(value);

  if (!assetPath) {
    return '';
  }

  assetPath =
    toPosix(assetPath);

  if (
    assetPath.startsWith('/')
  ) {
    assetPath =
      `.${assetPath}`;
  } else if (
    !assetPath.startsWith('./')
  ) {
    assetPath =
      `./${assetPath}`;
  }

  return assetPath;
}

function assetPathToAbsolute(value) {
  const assetPath =
    normalizeAssetPath(value);

  if (!assetPath) {
    return null;
  }

  const absolutePath =
    path.resolve(
      ROOT,
      assetPath.replace(
        /^\.\//,
        ''
      )
    );

  if (
    absolutePath !== ROOT &&
    !absolutePath.startsWith(
      `${ROOT}${path.sep}`
    )
  ) {
    throw new Error(
      `Unsafe asset path: ${value}`
    );
  }

  return absolutePath;
}

function loadSettings() {
  if (
    !fs.existsSync(
      SETTINGS_FILE
    )
  ) {
    throw new Error(
      `Missing settings file: ${relative(SETTINGS_FILE)}`
    );
  }

  const raw =
    readJson(
      SETTINGS_FILE
    );

  const coverBackup =
    (
      raw.coverBackup &&
      typeof raw.coverBackup ===
        'object'
    )
      ? raw.coverBackup
      : {};

  return {
    schemaVersion:
      integerOrNull(
        raw.schemaVersion
      ) || 1,

    bangumiUsername:
      asString(
        raw.bangumiUsername
      ),

    syncCollection:
      raw.syncCollection ===
      true,

    allowedStatuses:
      normalizeStringArray(
        raw.allowedStatuses
      ).filter((status) =>
        ALLOWED_STATUSES.has(
          status
        )
      ),

    coverBackup: {
      enabled:
        coverBackup.enabled !==
        false,

      directory:
        asString(
          coverBackup.directory
        ) ||
        relative(
          FALLBACK_DIR
        )
    }
  };
}

function listItemFiles() {
  if (
    !fs.existsSync(
      ITEMS_DIR
    )
  ) {
    throw new Error(
      `Missing Anime items directory: ${relative(ITEMS_DIR)}`
    );
  }

  return fs
    .readdirSync(
      ITEMS_DIR
    )
    .filter((filename) =>
      ITEM_FILE_RE.test(
        filename
      )
    )
    .sort((left, right) =>
      left.localeCompare(
        right,
        'en'
      )
    )
    .map((filename) =>
      path.join(
        ITEMS_DIR,
        filename
      )
    );
}

function loadItem(filePath) {
  const item =
    readJson(filePath);

  if (
    !item ||
    typeof item !== 'object' ||
    Array.isArray(item)
  ) {
    throw new Error(
      `Anime item must be an object: ${relative(filePath)}`
    );
  }

  Object.defineProperty(
    item,
    '__filePath',
    {
      value:
        filePath,

      enumerable:
        false,

      configurable:
        false,

      writable:
        false
    }
  );

  return item;
}

function loadItems() {
  return listItemFiles()
    .map(loadItem);
}

function getExpectedId(subjectId) {
  return `bgm-${subjectId}`;
}

function resolveStatus(item) {
  const custom =
    (
      item.custom &&
      typeof item.custom ===
        'object'
    )
      ? item.custom
      : {};

  return asString(
    custom.status
  ).toLowerCase();
}

function disallowedKeys(
  object,
  allowedKeys
) {
  if (
    !object ||
    typeof object !== 'object' ||
    Array.isArray(object)
  ) {
    return [];
  }

  return Object.keys(object)
    .filter((key) =>
      !allowedKeys.has(key)
    );
}

function validateItem(item) {
  const errors = [];

  const filePath =
    item.__filePath ||
    path.join(
      ITEMS_DIR,
      'unknown.json'
    );

  const filename =
    path.basename(filePath);

  const filenameMatch =
    filename.match(
      ITEM_FILE_RE
    );

  const subjectId =
    integerOrNull(
      item.subjectId
    );

  const id =
    asString(item.id);

  const slug =
    asString(
      item.slug ||
      item.id
    );

  const source =
    (
      item.source &&
      typeof item.source ===
        'object'
    )
      ? item.source
      : null;

  const api =
    (
      item.api &&
      typeof item.api ===
        'object'
    )
      ? item.api
      : null;

  const custom =
    (
      item.custom &&
      typeof item.custom ===
        'object'
    )
      ? item.custom
      : null;

  if (!filenameMatch) {
    errors.push(
      `Invalid item filename: ${filename}`
    );
  }

  if (
    subjectId === null ||
    subjectId <= 0
  ) {
    errors.push(
      'subjectId must be a positive integer.'
    );
  }

  if (subjectId !== null) {
    const expectedId =
      getExpectedId(
        subjectId
      );

    if (id !== expectedId) {
      errors.push(
        `id must be ${expectedId}.`
      );
    }

    if (slug !== expectedId) {
      errors.push(
        `slug must be ${expectedId}.`
      );
    }

    if (
      filenameMatch &&
      Number(
        filenameMatch[1]
      ) !== subjectId
    ) {
      errors.push(
        `Filename subject ID does not match subjectId ${subjectId}.`
      );
    }
  }

  if (!ITEM_ID_RE.test(id)) {
    errors.push(
      'id must match bgm-<subject-id>.'
    );
  }

  if (!ITEM_ID_RE.test(slug)) {
    errors.push(
      'slug must match bgm-<subject-id>.'
    );
  }

  if (!source) {
    errors.push(
      'source must be an object.'
    );
  } else {
    const unexpected =
      disallowedKeys(
        source,
        ALLOWED_SOURCE_KEYS
      );

    if (unexpected.length) {
      errors.push(
        `source contains unsupported fields: ${unexpected.join(', ')}.`
      );
    }

    if (
      !isHttpUrl(
        source.bangumiUrl
      )
    ) {
      errors.push(
        'source.bangumiUrl must be a valid HTTP(S) URL.'
      );
    }

    if (
      !isHttpUrl(
        source.watchUrl
      )
    ) {
      errors.push(
        'source.watchUrl must be a valid HTTP(S) URL.'
      );
    }
  }

  if (!api) {
    errors.push(
      'api must be an object.'
    );
  } else {
    if (
      !isNonEmptyString(
        api.titleOriginal
      ) &&
      !isNonEmptyString(
        api.titleZH
      )
    ) {
      errors.push(
        'api must contain titleOriginal or titleZH.'
      );
    }

    if (
      !isHttpUrl(
        api.coverRemote
      )
    ) {
      errors.push(
        'api.coverRemote must be a valid HTTP(S) URL.'
      );
    }

    const fallbackPath =
      normalizeAssetPath(
        api.coverFallback
      );

    if (!fallbackPath) {
      errors.push(
        'api.coverFallback is required.'
      );
    }
  }

  if (!custom) {
    errors.push(
      'custom must be an object.'
    );
  } else {
    const unexpected =
      disallowedKeys(
        custom,
        ALLOWED_CUSTOM_KEYS
      );

    if (unexpected.length) {
      errors.push(
        `custom contains unsupported fields: ${unexpected.join(', ')}.`
      );
    }

    const status =
      resolveStatus(item);

    if (
      !ALLOWED_STATUSES.has(
        status
      )
    ) {
      errors.push(
        'custom.status must be watching, planned, or completed.'
      );
    }

    if (
      custom.noteZH !== undefined &&
      typeof custom.noteZH !==
        'string'
    ) {
      errors.push(
        'custom.noteZH must be a string.'
      );
    }

    if (
      custom.noteEN !== undefined &&
      typeof custom.noteEN !==
        'string'
    ) {
      errors.push(
        'custom.noteEN must be a string.'
      );
    }
  }

  return errors;
}

function assertValidItems(items) {
  const allErrors = [];

  const seenIds =
    new Map();

  const seenSlugs =
    new Map();

  items.forEach((item) => {
    const label =
      relative(
        item.__filePath ||
        path.join(
          ITEMS_DIR,
          'unknown.json'
        )
      );

    validateItem(item)
      .forEach((message) => {
        allErrors.push(
          `${label}: ${message}`
        );
      });

    const id =
      asString(item.id);

    const slug =
      asString(
        item.slug ||
        item.id
      );

    if (id) {
      if (seenIds.has(id)) {
        allErrors.push(
          `${label}: duplicate id ${id}; first seen in ${seenIds.get(id)}.`
        );
      } else {
        seenIds.set(
          id,
          label
        );
      }
    }

    if (slug) {
      if (seenSlugs.has(slug)) {
        allErrors.push(
          `${label}: duplicate slug ${slug}; first seen in ${seenSlugs.get(slug)}.`
        );
      } else {
        seenSlugs.set(
          slug,
          label
        );
      }
    }
  });

  if (allErrors.length) {
    throw new Error(
      'Anime data validation failed:\n- ' +
      allErrors.join('\n- ')
    );
  }
}

function resolveFinalItem(item) {
  const api =
    item.api || {};

  const custom =
    item.custom || {};

  const source =
    item.source || {};

  return {
    id:
      asString(item.id),

    subjectId:
      integerOrNull(
        item.subjectId
      ),

    slug:
      asString(
        item.slug ||
        item.id
      ),

    status:
      resolveStatus(item),

    titles: {
      original:
        asString(
          api.titleOriginal
        ),

      zh:
        asString(
          api.titleZH
        ),

      en:
        asString(
          api.titleEN
        )
    },

    summary:
      asString(
        api.summary
      ),

    cover: {
      remote:
        asString(
          api.coverRemote
        ),

      fallback:
        normalizeAssetPath(
          api.coverFallback
        )
    },

    links: {
      watch:
        asString(
          source.watchUrl
        ),

      bangumi:
        asString(
          source.bangumiUrl
        )
    },

    progress: {
      current:
        finiteNumber(
          api.progress
        ),

      total:
        finiteNumber(
          api.totalEpisodes
        )
    },

    year:
      integerOrNull(
        api.year
      ),

    studio:
      asString(
        api.studio
      ),

    genres:
      normalizeStringArray(
        api.genres
      ),

    ratings: {
      bangumi:
        finiteNumber(
          api.bangumiRating
        ),

      personal:
        finiteNumber(
          api.personalRating
        )
    },

    notes: {
      zh:
        asString(
          custom.noteZH
        ),

      en:
        asString(
          custom.noteEN
        )
    },

    dates: {
      air:
        asString(
          api.airDate
        )
    },

    updatedAt:
      asString(
        api.updatedAt
      )
  };
}

function compareFinalItems(
  left,
  right
) {
  const leftTitle =
    left.titles.zh ||
    left.titles.en ||
    left.titles.original ||
    left.id;

  const rightTitle =
    right.titles.zh ||
    right.titles.en ||
    right.titles.original ||
    right.id;

  const titleDifference =
    leftTitle.localeCompare(
      rightTitle,
      'zh-Hans-CN'
    );

  if (titleDifference !== 0) {
    return titleDifference;
  }

  return (
    (left.subjectId || 0) -
    (right.subjectId || 0)
  );
}

function latestUpdatedAt(items) {
  const values =
    items
      .map((item) =>
        asString(
          item.updatedAt
        )
      )
      .filter(Boolean)
      .map((value) => ({
        value,

        timestamp:
          Date.parse(value)
      }))
      .filter((entry) =>
        Number.isFinite(
          entry.timestamp
        )
      )
      .sort(
        (left, right) =>
          right.timestamp -
          left.timestamp
      );

  return values.length
    ? values[0].value
    : '';
}

function escapeMarkdownCell(value) {
  return String(
    value == null
      ? ''
      : value
  )
    .replace(
      /\|/g,
      '\\|'
    )
    .replace(
      /\r?\n/g,
      ' '
    )
    .trim();
}

function generateCatalog(items) {
  const lines = [
    '# Anime Catalog',
    '',
    'This file is generated from `assets/data/social/anime/items/*.json`.',
    'Do not edit it manually.',
    '',
    '| ID | Title | Status | Item file | Bangumi |',
    '|---|---|---|---|---|'
  ];

  items.forEach((item) => {
    const title =
      item.titles.zh ||
      item.titles.en ||
      item.titles.original ||
      item.id;

    lines.push(
      '| ' +
      escapeMarkdownCell(
        item.id
      ) +
      ' | ' +
      escapeMarkdownCell(
        title
      ) +
      ' | ' +
      escapeMarkdownCell(
        item.status
      ) +
      ' | `items/' +
      escapeMarkdownCell(
        item.id
      ) +
      '.json` | ' +
      escapeMarkdownCell(
        item.links.bangumi
      ) +
      ' |'
    );
  });

  lines.push('');

  return lines.join('\n');
}

function buildArtifacts(rawItems) {
  assertValidItems(
    rawItems
  );

  const items =
    rawItems
      .map(
        resolveFinalItem
      )
      .sort(
        compareFinalItems
      );

  const index = {
    schemaVersion: 1,

    generatedAt:
      latestUpdatedAt(
        items
      ),

    items
  };

  return {
    index,

    indexText:
      stringifyJson(index),

    catalogText:
      generateCatalog(items),

    items
  };
}

function fileSha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(
      fs.readFileSync(
        filePath
      )
    )
    .digest('hex');
}

module.exports = {
  ROOT,
  DATA_ROOT,
  ITEMS_DIR,
  SETTINGS_FILE,
  INDEX_FILE,
  CATALOG_FILE,
  FALLBACK_DIR,
  PLACEHOLDER_FILE,
  ANIME_ROUTE_DIR,

  ITEM_FILE_RE,
  ITEM_ID_RE,
  ALLOWED_STATUSES,
  ALLOWED_CUSTOM_KEYS,
  ALLOWED_SOURCE_KEYS,
  IMAGE_EXTENSIONS,

  toPosix,
  relative,
  ensureDirectory,
  readJson,
  stringifyJson,
  writeTextIfChanged,

  asString,
  isNonEmptyString,
  finiteNumber,
  integerOrNull,
  normalizeStringArray,
  isHttpUrl,

  normalizeAssetPath,
  assetPathToAbsolute,

  loadSettings,
  listItemFiles,
  loadItem,
  loadItems,

  getExpectedId,
  resolveStatus,
  validateItem,
  assertValidItems,
  resolveFinalItem,
  buildArtifacts,
  fileSha256
};