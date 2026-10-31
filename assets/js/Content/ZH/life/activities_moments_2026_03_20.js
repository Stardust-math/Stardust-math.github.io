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
    dateKey: '2026_03_20',
    dateISO: '2026-03-20',
    dateLabel: '2026.03.20',

    title: '科大的第三笔奖学金',
    location: '中国科学技术大学·东区',

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

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
