(function () {
  'use strict';

  const target = window.ACTIVITIES_MOMENTS_EN || {
    ui: {},
    moments: []
  };

  if (!Array.isArray(target.moments)) {
    target.moments = [];
  }

  target.moments.push({
    dateKey: '2025_07_15',
    dateISO: '2025-07-15',
    dateLabel: '2025.07.15',

    title: 'Autographed Copy of Battle Through the Heavens',
    titleParts: [
      { text: 'Autographed Copy of ' },
      { text: 'Battle Through the Heavens', italic: true }
    ],
    location: '',

    cover: './assets/images/life/activities_moments/2025_07_15/cover.jpg',

    summary: '',

    content: [
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2025_07_15/01.jpg',
          './assets/images/life/activities_moments/2025_07_15/02.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
