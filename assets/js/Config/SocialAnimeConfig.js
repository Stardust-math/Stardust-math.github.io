(function () {
  'use strict';

  const A =
    './assets/';

  window.SocialAnimeConfig = {
    dataUrl:
      A +
      'data/social/anime/anime-index.json',

    placeholderCover:
      A +
      'images/social/anime/anime-placeholder.svg',

    batchSize:
      8,

    defaultFilter:
      'all',

    filters: [
      'all',
      'watching',
      'planned',
      'completed'
    ],

    storageKey:
      'stardust-social-anime-filter'
  };
})();