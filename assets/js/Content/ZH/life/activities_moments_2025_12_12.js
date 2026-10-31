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
    dateKey: '2025_12_12',
    dateISO: '2025-12-12',
    dateLabel: '2025.12.12',

    title: '一碗绝世美味的牛肉面',
    location: '中国科学技术大学·高新区',

    cover: './assets/images/life/activities_moments/2025_12_12/cover.jpg',

    summary: '平平无奇的一天，被一碗牛肉面狠狠治愈。',

    content: [
      {
        type: 'text',
        text: '校内校外吃过这么多种面，都感觉寡淡无味，唯独这次这碗是真的香。面软硬适中，有嚼劲，牛肉直接化在我嘴里，量也刚好，不会有剩[好吃]。'
      },
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2025_12_12/01.jpg',
          './assets/images/life/activities_moments/2025_12_12/02.jpg',
          './assets/images/life/activities_moments/2025_12_12/03.jpg',
          './assets/images/life/activities_moments/2025_12_12/04.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
