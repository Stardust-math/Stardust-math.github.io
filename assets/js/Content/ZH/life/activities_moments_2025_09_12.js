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
    dateKey: '2025_09_12',
    dateISO: '2025-09-12',
    dateLabel: '2025.09.12',

    title: '第一次助教随堂',
    location: '中国科学技术大学·东区·第五教学楼 5104',

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

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
