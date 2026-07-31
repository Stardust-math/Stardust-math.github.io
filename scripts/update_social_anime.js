#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  spawnSync
} = require(
  'child_process'
);

const {
  ROOT,
  ITEMS_DIR,
  FALLBACK_DIR,
  relative,
  ensureDirectory,
  stringifyJson,
  writeTextIfChanged,
  asString,
  finiteNumber,
  integerOrNull,
  normalizeStringArray,
  normalizeAssetPath,
  assetPathToAbsolute,
  loadSettings,
  loadItems
} = require(
  './lib/social_anime_data.js'
);

const API_BASE =
  'https://api.bgm.tv';

const USER_AGENT =
  'StardustMathAnimeSync/1.0 ' +
  '(+https://github.com/' +
  'Stardust-math/' +
  'Stardust-math.github.io)';

const REQUEST_TIMEOUT_MS =
  20000;

const REQUEST_DELAY_MS =
  350;

function parseArgs(argv) {
  const options = {
    subjectIds:
      new Set(),

    refreshCovers:
      false,

    repairCovers:
      false,

    skipCollection:
      false,

    noBuild:
      false
  };

  for (
    let index = 0;
    index < argv.length;
    index += 1
  ) {
    const argument =
      argv[index];

    if (
      argument ===
      '--refresh-covers'
    ) {
      options.refreshCovers =
        true;

      continue;
    }

    if (
      argument ===
      '--repair-covers'
    ) {
      options.repairCovers =
        true;

      continue;
    }

    if (
      argument ===
      '--skip-collection'
    ) {
      options.skipCollection =
        true;

      continue;
    }

    if (
      argument ===
      '--no-build'
    ) {
      options.noBuild =
        true;

      continue;
    }

    if (
      argument ===
      '--subject'
    ) {
      index += 1;

      addSubjectId(
        options.subjectIds,
        argv[index]
      );

      continue;
    }

    if (
      argument.startsWith(
        '--subject='
      )
    ) {
      addSubjectId(
        options.subjectIds,
        argument.slice(
          '--subject='.length
        )
      );

      continue;
    }

    throw new Error(
      `Unknown argument: ${argument}`
    );
  }

  return options;
}

function addSubjectId(
  target,
  value
) {
  const subjectId =
    Number(value);

  if (
    !Number.isInteger(
      subjectId
    ) ||
    subjectId <= 0
  ) {
    throw new Error(
      `Invalid subject ID: ${value}`
    );
  }

  target.add(
    subjectId
  );
}

function sleep(milliseconds) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

function requestHeaders(accept) {
  const headers = {
    Accept:
      accept ||
      'application/json',

    'User-Agent':
      USER_AGENT
  };

  const token =
    asString(
      process.env
        .BANGUMI_ACCESS_TOKEN
    );

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
}

async function fetchWithTimeout(
  url,
  options
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT_MS
    );

  try {
    return await fetch(
      url,
      {
        ...options,

        redirect:
          'follow',

        signal:
          controller.signal
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(
  url,
  allowNotFound
) {
  const response =
    await fetchWithTimeout(
      url,
      {
        headers:
          requestHeaders(
            'application/json'
          )
      }
    );

  if (
    allowNotFound &&
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    const body =
      await response
        .text()
        .catch(() => '');

    throw new Error(
      `HTTP ${response.status} for ${url}` +
      (
        body
          ? (
              ': ' +
              body.slice(
                0,
                240
              )
            )
          : ''
      )
    );
  }

  return response.json();
}

function infoboxValueToText(value) {
  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value)
      .trim();
  }

  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map((entry) => {
      if (
        typeof entry ===
          'string' ||
        typeof entry ===
          'number'
      ) {
        return String(entry)
          .trim();
      }

      if (
        entry &&
        typeof entry ===
          'object'
      ) {
        return asString(
          entry.v ||
          entry.value ||
          entry.name
        );
      }

      return '';
    })
    .filter(Boolean)
    .join(' / ');
}

function findInfoboxValue(
  subject,
  keys
) {
  const infobox =
    Array.isArray(
      subject.infobox
    )
      ? subject.infobox
      : [];

  const normalizedKeys =
    keys.map((key) =>
      key.toLowerCase()
    );

  for (
    const entry of infobox
  ) {
    if (
      !entry ||
      typeof entry !==
        'object'
    ) {
      continue;
    }

    const key =
      asString(
        entry.key
      ).toLowerCase();

    if (
      !normalizedKeys.includes(
        key
      )
    ) {
      continue;
    }

    const value =
      infoboxValueToText(
        entry.value
      );

    if (value) {
      return value;
    }
  }

  return '';
}

function extractYear(date) {
  const match =
    asString(date)
      .match(
        /^(\d{4})/
      );

  return match
    ? Number(match[1])
    : null;
}

function extractEnglishTitle(subject) {
  return findInfoboxValue(
    subject,
    [
      '英文名',
      'english name',
      'english'
    ]
  );
}

function extractStudio(subject) {
  return findInfoboxValue(
    subject,
    [
      '动画制作',
      '動畫製作',
      '动画制作公司',
      '動畫製作公司',
      'アニメーション制作',
      '制作会社'
    ]
  );
}

function extractGenres(subject) {
  if (
    !Array.isArray(
      subject.tags
    )
  ) {
    return [];
  }

  return normalizeStringArray(
    subject.tags
      .map((tag) => {
        return (
          tag &&
          typeof tag ===
            'object'
        )
          ? asString(
              tag.name
            )
          : '';
      })
      .filter(Boolean)
      .slice(0, 8)
  );
}

function selectRemoteCover(
  subject,
  subjectId
) {
  const images =
    (
      subject.images &&
      typeof subject.images ===
        'object'
    )
      ? subject.images
      : {};

  return (
    asString(
      images.large
    ) ||
    asString(
      images.common
    ) ||
    asString(
      images.medium
    ) ||
    (
      `${API_BASE}/v0/subjects/` +
      `${subjectId}/image?type=large`
    )
  );
}

function mapCollectionStatus(type) {
  return {
    1: 'planned',
    2: 'completed',
    3: 'watching'
  }[Number(type)] || '';
}

async function fetchCollection(
  settings,
  subjectId,
  skipCollection
) {
  if (
    skipCollection ||
    !settings.syncCollection ||
    !settings.bangumiUsername
  ) {
    return null;
  }

  const username =
    encodeURIComponent(
      settings.bangumiUsername
    );

  const url =
    `${API_BASE}/v0/users/` +
    `${username}/collections/` +
    `${subjectId}`;

  return fetchJson(
    url,
    true
  );
}

function getBackupDirectory(settings) {
  const configured =
    asString(
      settings.coverBackup &&
      settings.coverBackup
        .directory
    );

  const directory =
    path.resolve(
      ROOT,
      configured ||
      relative(
        FALLBACK_DIR
      )
    );

  if (
    directory !== ROOT &&
    !directory.startsWith(
      `${ROOT}${path.sep}`
    )
  ) {
    throw new Error(
      `Unsafe cover backup directory: ${configured}`
    );
  }

  return directory;
}

function extensionFromContentType(
  contentType,
  fallbackUrl
) {
  const normalized =
    asString(
      contentType
    )
      .split(';')[0]
      .toLowerCase();

  const byType = {
    'image/jpeg':
      '.jpg',

    'image/jpg':
      '.jpg',

    'image/png':
      '.png',

    'image/webp':
      '.webp',

    'image/gif':
      '.gif'
  };

  if (byType[normalized]) {
    return byType[normalized];
  }

  try {
    const extension =
      path.extname(
        new URL(
          fallbackUrl
        ).pathname
      ).toLowerCase();

    if (
      [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.gif'
      ].includes(extension)
    ) {
      return extension ===
        '.jpeg'
        ? '.jpg'
        : extension;
    }
  } catch (error) {
    // Use JPEG below.
  }

  return '.jpg';
}

function existingFallbackPath(item) {
  return normalizeAssetPath(
    item.api &&
    item.api.coverFallback
  );
}

function findExistingCover(
  subjectId,
  backupDirectory
) {
  if (
    !fs.existsSync(
      backupDirectory
    )
  ) {
    return '';
  }

  const prefix =
    `bgm-${subjectId}`;

  const match =
    fs
      .readdirSync(
        backupDirectory
      )
      .filter((filename) => {
        return (
          path.basename(
            filename,
            path.extname(filename)
          ) === prefix
        );
      })
      .filter((filename) => {
        return [
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.gif'
        ].includes(
          path.extname(
            filename
          ).toLowerCase()
        );
      })
      .sort()[0];

  return match
    ? (
        './' +
        relative(
          path.join(
            backupDirectory,
            match
          )
        )
      )
    : '';
}

async function ensureFallbackCover(
  item,
  remoteUrl,
  options
) {
  const settings =
    options.settings;

  if (
    !settings.coverBackup
      .enabled
  ) {
    return existingFallbackPath(
      item
    );
  }

  const subjectId =
    Number(
      item.subjectId
    );

  const backupDirectory =
    getBackupDirectory(
      settings
    );

  ensureDirectory(
    backupDirectory
  );

  const configured =
    existingFallbackPath(
      item
    ) ||
    findExistingCover(
      subjectId,
      backupDirectory
    );

  const configuredAbsolute =
    configured
      ? assetPathToAbsolute(
          configured
        )
      : null;

  const validExisting =
    Boolean(
      configuredAbsolute &&
      fs.existsSync(
        configuredAbsolute
      ) &&
      fs.statSync(
        configuredAbsolute
      ).isFile() &&
      fs.statSync(
        configuredAbsolute
      ).size > 0
    );

  if (
    validExisting &&
    !options.refreshCovers
  ) {
    return configured;
  }

  if (
    configured &&
    !validExisting &&
    !options.refreshCovers &&
    !options.repairCovers
  ) {
    console.log(
      '  repairing missing cover: ' +
      configured
    );
  }

  const response =
    await fetchWithTimeout(
      remoteUrl,
      {
        headers:
          requestHeaders(
            'image/webp,' +
            'image/png,' +
            'image/jpeg,' +
            'image/gif,' +
            'image/*;q=0.8,' +
            '*/*;q=0.5'
          )
      }
    );

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} while downloading cover ${remoteUrl}`
    );
  }

  const contentType =
    asString(
      response.headers.get(
        'content-type'
      )
    );

  if (
    !contentType
      .toLowerCase()
      .startsWith('image/')
  ) {
    throw new Error(
      'Cover response is not an image: ' +
      (
        contentType ||
        'unknown content type'
      )
    );
  }

  const bytes =
    Buffer.from(
      await response.arrayBuffer()
    );

  if (bytes.length < 512) {
    throw new Error(
      'Downloaded cover is unexpectedly small ' +
      `(${bytes.length} bytes).`
    );
  }

  const extension =
    extensionFromContentType(
      contentType,
      response.url ||
      remoteUrl
    );

  const targetAbsolute =
    path.join(
      backupDirectory,
      `bgm-${subjectId}${extension}`
    );

  const targetAssetPath =
    './' +
    relative(
      targetAbsolute
    );

  if (options.refreshCovers) {
    fs
      .readdirSync(
        backupDirectory
      )
      .filter((filename) => {
        return (
          path.basename(
            filename,
            path.extname(filename)
          ) ===
          `bgm-${subjectId}`
        );
      })
      .forEach((filename) => {
        const oldPath =
          path.join(
            backupDirectory,
            filename
          );

        if (
          oldPath !== targetAbsolute &&
          fs.statSync(
            oldPath
          ).isFile()
        ) {
          fs.unlinkSync(
            oldPath
          );
        }
      });
  }

  fs.writeFileSync(
    targetAbsolute,
    bytes
  );

  console.log(
    '  saved fallback cover: ' +
    relative(
      targetAbsolute
    ) +
    ` (${bytes.length} bytes)`
  );

  return targetAssetPath;
}

function comparableApi(api) {
  const copy = {
    ...(api || {})
  };

  delete copy.updatedAt;

  return copy;
}

function apiChanged(
  previousApi,
  nextApiWithoutTimestamp
) {
  return (
    JSON.stringify(
      comparableApi(
        previousApi
      )
    ) !==
    JSON.stringify(
      nextApiWithoutTimestamp
    )
  );
}

function buildApi(
  subject,
  collection,
  fallbackPath,
  previousApi
) {
  const airDate =
    asString(
      subject.date
    );

  const rating =
    (
      subject.rating &&
      typeof subject.rating ===
        'object'
    )
      ? subject.rating
      : {};

  const next = {
    titleOriginal:
      asString(
        subject.name
      ),

    titleZH:
      asString(
        subject.name_cn
      ),

    titleEN:
      extractEnglishTitle(
        subject
      ),

    summary:
      asString(
        subject.summary
      ),

    coverRemote:
      selectRemoteCover(
        subject,
        subject.id
      ),

    coverFallback:
      normalizeAssetPath(
        fallbackPath
      ),

    status:
      collection
        ? mapCollectionStatus(
            collection.type
          )
        : '',

    progress:
      collection
        ? finiteNumber(
            collection.ep_status
          )
        : null,

    totalEpisodes:
      integerOrNull(
        subject.total_episodes
      ) ??
      integerOrNull(
        subject.eps
      ),

    airDate,

    year:
      extractYear(
        airDate
      ),

    studio:
      extractStudio(
        subject
      ),

    genres:
      extractGenres(
        subject
      ),

    bangumiRating:
      finiteNumber(
        rating.score
      ),

    personalRating:
      collection
        ? finiteNumber(
            collection.rate
          )
        : null
  };

  const changed =
    apiChanged(
      previousApi,
      next
    );

  return {
    ...next,

    updatedAt:
      changed
        ? new Date()
            .toISOString()
        : asString(
            previousApi &&
            previousApi.updatedAt
          )
  };
}

function sanitizeSource(
  item,
  subjectId
) {
  const source =
    (
      item.source &&
      typeof item.source ===
        'object'
    )
      ? item.source
      : {};

  return {
    bangumiUrl:
      asString(
        source.bangumiUrl
      ) ||
      `https://bgm.tv/subject/${subjectId}`,

    watchUrl:
      asString(
        source.watchUrl
      )
  };
}

function sanitizeCustom(item) {
  const custom =
    (
      item.custom &&
      typeof item.custom ===
        'object'
    )
      ? item.custom
      : {};

  return {
    status:
      asString(
        custom.status
      ).toLowerCase(),

    noteZH:
      asString(
        custom.noteZH
      ),

    noteEN:
      asString(
        custom.noteEN
      )
  };
}

async function updateItem(
  item,
  options
) {
  const subjectId =
    Number(
      item.subjectId
    );

  const itemPath =
    item.__filePath ||
    path.join(
      ITEMS_DIR,
      `bgm-${subjectId}.json`
    );

  console.log(
    `Updating bgm-${subjectId}`
  );

  const subject =
    await fetchJson(
      `${API_BASE}/v0/subjects/${subjectId}`,
      false
    );

  const collection =
    await fetchCollection(
      options.settings,
      subjectId,
      options.skipCollection
    );

  const remoteCover =
    selectRemoteCover(
      subject,
      subjectId
    );

  const fallbackPath =
    await ensureFallbackCover(
      item,
      remoteCover,
      options
    );

  const api =
    buildApi(
      subject,
      collection,
      fallbackPath,
      item.api || {}
    );

  const updatedItem = {
    schemaVersion:
      integerOrNull(
        item.schemaVersion
      ) || 1,

    id:
      `bgm-${subjectId}`,

    subjectId,

    slug:
      `bgm-${subjectId}`,

    source:
      sanitizeSource(
        item,
        subjectId
      ),

    api,

    custom:
      sanitizeCustom(
        item
      )
  };

  const changed =
    writeTextIfChanged(
      itemPath,
      stringifyJson(
        updatedItem
      )
    );

  console.log(
    '  ' +
    (
      changed
        ? 'updated'
        : 'current'
    ) +
    ': ' +
    relative(itemPath)
  );
}

function runBuild() {
  const result =
    spawnSync(
      process.execPath,
      [
        'scripts/build_social_anime.js'
      ],
      {
        cwd:
          ROOT,

        stdio:
          'inherit'
      }
    );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      'scripts/build_social_anime.js exited with status ' +
      result.status
    );
  }
}

async function main() {
  const options =
    parseArgs(
      process.argv.slice(2)
    );

  options.settings =
    loadSettings();

  const items =
    loadItems();

  const selected =
    options.subjectIds.size
      ? items.filter((item) => {
          return options
            .subjectIds
            .has(
              Number(
                item.subjectId
              )
            );
        })
      : items;

  if (!selected.length) {
    throw new Error(
      'No matching Anime item files were found.'
    );
  }

  if (
    options.subjectIds.size &&
    selected.length !==
      options.subjectIds.size
  ) {
    const found =
      new Set(
        selected.map((item) =>
          Number(
            item.subjectId
          )
        )
      );

    const missing =
      Array.from(
        options.subjectIds
      ).filter((subjectId) =>
        !found.has(subjectId)
      );

    throw new Error(
      'Missing item files for subject IDs: ' +
      missing.join(', ')
    );
  }

  ensureDirectory(
    getBackupDirectory(
      options.settings
    )
  );

  for (
    let index = 0;
    index < selected.length;
    index += 1
  ) {
    if (index > 0) {
      await sleep(
        REQUEST_DELAY_MS
      );
    }

    await updateItem(
      selected[index],
      options
    );
  }

  if (!options.noBuild) {
    console.log('');
    runBuild();
  }
}

main().catch((error) => {
  console.error(
    '[update_social_anime] Failed.'
  );

  console.error(
    error && error.stack
      ? error.stack
      : error
  );

  process.exitCode = 1;
});