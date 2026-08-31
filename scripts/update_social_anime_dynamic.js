#!/usr/bin/env node
'use strict';

const {
  spawnSync
} = require(
  'child_process'
);

const {
  ROOT,
  relative,
  stringifyJson,
  writeTextIfChanged,
  asString,
  finiteNumber,
  loadSettings,
  loadItems
} = require(
  './lib/social_anime_data.js'
);

const {
  createApiRequestHeaders
} = require(
  './lib/social_anime_http.js'
);

const API_BASE =
  'https://api.bgm.tv';
const USER_AGENT =
  'StardustMathAnimeDynamicSync/1.0 ' +
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

function apiRequestHeaders(url) {
  return createApiRequestHeaders({
    url,
    apiBase:
      API_BASE,
    userAgent:
      USER_AGENT,
    accessToken:
      process.env
        .BANGUMI_ACCESS_TOKEN
  });
}

async function fetchWithTimeout(url) {
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
        headers:
          apiRequestHeaders(url),

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
      url
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

function dynamicApiValues(
  subject,
  collection
) {
  const rating =
    (
      subject.rating &&
      typeof subject.rating ===
        'object'
    )
      ? subject.rating
      : {};

  return {
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
}

function comparableDynamicApi(api) {
  const source =
    (
      api &&
      typeof api === 'object' &&
      !Array.isArray(api)
    )
      ? api
      : {};

  return {
    status:
      asString(
        source.status
      ).toLowerCase(),

    progress:
      finiteNumber(
        source.progress
      ),

    bangumiRating:
      finiteNumber(
        source.bangumiRating
      ),

    personalRating:
      finiteNumber(
        source.personalRating
      )
  };
}

function dynamicApiChanged(
  previousApi,
  nextDynamicValues
) {
  return (
    JSON.stringify(
      comparableDynamicApi(
        previousApi
      )
    ) !==
    JSON.stringify(
      nextDynamicValues
    )
  );
}

function buildDynamicApi(
  subject,
  collection,
  previousApi
) {
  const currentApi =
    (
      previousApi &&
      typeof previousApi ===
        'object' &&
      !Array.isArray(previousApi)
    )
      ? previousApi
      : {};

  const nextDynamicValues =
    dynamicApiValues(
      subject,
      collection
    );

  const changed =
    dynamicApiChanged(
      currentApi,
      nextDynamicValues
    );

  if (!changed) {
    return currentApi;
  }

  return {
    ...currentApi,
    ...nextDynamicValues,

    updatedAt:
      new Date()
        .toISOString()
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
    item.__filePath;

  if (!itemPath) {
    throw new Error(
      `Missing source path for bgm-${subjectId}.`
    );
  }

  console.log(
    `Updating dynamic data for bgm-${subjectId}`
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

  const api =
    buildDynamicApi(
      subject,
      collection,
      item.api
    );

  const updatedItem = {
    ...item,
    api
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
    '[update_social_anime_dynamic] Failed.'
  );
  console.error(
    error && error.stack
      ? error.stack
      : error
  );

  process.exitCode = 1;
});
