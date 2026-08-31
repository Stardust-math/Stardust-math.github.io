'use strict';

function cleanText(value) {
  return String(
    value == null
      ? ''
      : value
  ).trim();
}

function getOrigin(value) {
  try {
    return new URL(value).origin;
  } catch (error) {
    return '';
  }
}

function createPublicRequestHeaders(options) {
  const settings = options || {};
  return {
    Accept:
      cleanText(settings.accept) ||
      'application/json',

    'User-Agent':
      cleanText(settings.userAgent)
  };
}

function createApiRequestHeaders(options) {
  const settings = options || {};
  const headers =
    createPublicRequestHeaders(settings);

  const token =
    cleanText(settings.accessToken);

  const apiOrigin =
    getOrigin(settings.apiBase);

  const requestOrigin =
    getOrigin(settings.url);

  if (
    token &&
    apiOrigin &&
    requestOrigin === apiOrigin
  ) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
}

module.exports = {
  createApiRequestHeaders,
  createPublicRequestHeaders,
  getOrigin
};
