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
    dateKey: '2026_05_16',
    dateISO: '2026-05-16',
    dateLabel: '2026.05.16',

    title: '科技活动周志愿服务',
    location: '中国科学技术大学·西区',

    cover: './assets/images/life/activities_moments/2026_05_16/cover.jpg',

    summary: '',

    body: [],

    gallery: [
      './assets/images/life/activities_moments/2026_05_16/01.jpg',
      './assets/images/life/activities_moments/2026_05_16/02.jpg'
    ]
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();