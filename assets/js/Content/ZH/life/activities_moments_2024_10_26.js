(function () {
  'use strict';

  const target = window.ACTIVITIES_MOMENTS_ZH || {
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

    title: '书院团体拔河赛',
    location: '中国科学技术大学·中校区·体育馆',

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

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
