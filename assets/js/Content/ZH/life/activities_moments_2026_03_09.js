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
    dateKey: '2026_03_09',
    dateISO: '2026-03-09',
    dateLabel: '2026.03.09',

    title: '春晚参演',
    location: '中国科学技术大学·东区·老北门',

    cover: './assets/images/life/activities_moments/2026_03_09/cover.jpg',

    summary: '',

    content: []
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
