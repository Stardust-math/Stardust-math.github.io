#!/usr/bin/env node
'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const {
  createApiRequestHeaders,
  createPublicRequestHeaders
} = require(
  './lib/social_anime_http.js'
);

const API_BASE =
  'https://api.bgm.tv';

const BASE_OPTIONS = {
  apiBase:
    API_BASE,

  accessToken:
    'test-token',

  userAgent:
    'StardustMathAnimeSync/Test'
};

function headersFor(url) {
  return createApiRequestHeaders({
    ...BASE_OPTIONS,
    url
  });
}

assert.equal(
  headersFor(
    `${API_BASE}/v0/subjects/1`
  ).Authorization,
  'Bearer test-token'
);

assert.equal(
  headersFor(
    'https://API.BGM.TV:443/v0/subjects/1'
  ).Authorization,
  'Bearer test-token'
);

[
  'https://lain.bgm.tv/pic/cover/l/example.jpg',
  'http://api.bgm.tv/v0/subjects/1',
  'https://api.bgm.tv@evil.example/v0/subjects/1',
  'https://api.bgm.tv.example.com/v0/subjects/1',
  'https://bgm.tv/subject/1',
  'not-a-url'
].forEach((url) => {
  assert.equal(
    headersFor(url).Authorization,
    undefined,
    `Authorization must not be sent to ${url}`
  );
});

const publicHeaders =
  createPublicRequestHeaders({
    accept:
      'image/*',
    userAgent:
      BASE_OPTIONS.userAgent
  });

assert.equal(
  publicHeaders.Accept,
  'image/*'
);

assert.equal(
  publicHeaders['User-Agent'],
  BASE_OPTIONS.userAgent
);

assert.equal(
  publicHeaders.Authorization,
  undefined
);

const publicApiImageHeaders =
  createPublicRequestHeaders({
    accept:
      'image/*',
    userAgent:
      BASE_OPTIONS.userAgent,
    url:
      `${API_BASE}/v0/subjects/1/image?type=large`,
    apiBase:
      API_BASE,
    accessToken:
      BASE_OPTIONS.accessToken
  });

assert.equal(
  publicApiImageHeaders.Authorization,
  undefined
);

assert.equal(
  createApiRequestHeaders({
    ...BASE_OPTIONS,
    url:
      `${API_BASE}/v0/subjects/1`,
    accessToken:
      '   '
  }).Authorization,
  undefined
);

assert.equal(
  headersFor(
    `${API_BASE}/v0/subjects/1`
  ).Accept,
  'application/json'
);

const syncSource = fs.readFileSync(
  path.join(
    __dirname,
    'update_social_anime.js'
  ),
  'utf8'
);

const coverFunctionStart =
  syncSource.indexOf(
    'async function ensureFallbackCover('
  );

const coverFunctionEnd =
  syncSource.indexOf(
    '\nasync function ',
    coverFunctionStart + 1
  );

assert.ok(
  coverFunctionStart >= 0 &&
  coverFunctionEnd > coverFunctionStart,
  'ensureFallbackCover() must remain inspectable.'
);

const coverFunctionSource =
  syncSource.slice(
    coverFunctionStart,
    coverFunctionEnd
  );

assert.match(
  coverFunctionSource,
  /publicRequestHeaders\s*\(/,
  'Cover downloads must use public request headers.'
);

assert.doesNotMatch(
  coverFunctionSource,
  /apiRequestHeaders\s*\(/,
  'Cover downloads must never use authenticated API headers.'
);

console.log(
  'Social Anime synchronization credential-scope check passed.'
);
