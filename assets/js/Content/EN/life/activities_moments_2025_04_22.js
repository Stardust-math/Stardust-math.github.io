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
    dateKey: '2025_04_22',
    dateISO: '2025-04-22',
    dateLabel: '2025.04.22',

    title: 'Second Scholarship at USTC',
    location: 'East Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2025_04_22/cover.jpg',

    summary: '',

    content: [
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2025_04_22/01.jpg',
          './assets/images/life/activities_moments/2025_04_22/02.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
