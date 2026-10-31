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
    dateKey: '2026_03_20',
    dateISO: '2026-03-20',
    dateLabel: '2026.03.20',

    title: 'Third Scholarship at USTC',
    location: 'East Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2026_03_20/cover.jpg',

    summary: '',

    content: [
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2026_03_20/01.jpg',
          './assets/images/life/activities_moments/2026_03_20/02.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
