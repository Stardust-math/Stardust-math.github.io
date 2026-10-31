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
    dateKey: '2025_09_12',
    dateISO: '2025-09-12',
    dateLabel: '2025.09.12',

    title: 'First In-Class TA Session',
    location: 'Room 5104, Fifth Teaching Building, East Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2025_09_12/cover.jpg',

    summary: '',

    content: [
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2025_09_12/01.jpg',
          './assets/images/life/activities_moments/2025_09_12/02.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
