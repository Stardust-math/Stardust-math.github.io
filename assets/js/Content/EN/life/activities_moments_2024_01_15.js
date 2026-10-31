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
    dateKey: '2024_01_15',
    dateISO: '2024-01-15',
    dateLabel: '2024.01.15',

    title: 'First Scholarship at USTC',
    location: 'East Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2024_01_15/cover.jpg',

    summary: '',

    content: [
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2024_01_15/01.jpg',
          './assets/images/life/activities_moments/2024_01_15/02.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
