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
    dateKey: '2024_10_26',
    dateISO: '2024-10-26',
    dateLabel: '2024.10.26',

    title: 'Residential College Tug-of-War Competition',
    location: 'Gymnasium, Central Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2024_10_26/cover.jpg',

    summary: '',

    content: [
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2024_10_26/01.jpg',
          './assets/images/life/activities_moments/2024_10_26/02.jpg',
          './assets/images/life/activities_moments/2024_10_26/03.jpg',
          './assets/images/life/activities_moments/2024_10_26/04.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
