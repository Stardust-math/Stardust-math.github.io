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
    dateKey: '2025_12_22',
    dateISO: '2025-12-22',
    dateLabel: '2025.12.22',

    title: '《中国纸墨笔砚》',
    location: '中国科学技术大学·南校区',

    cover: './assets/images/life/activities_moments/2025_12_22/cover.jpg',

    summary: '完结撒花。',

    content: [
      {
        type: 'text',
        text: '完结撒花[庆祝]。'
      },
      {
        type: 'text',
        text: '老师又送了我们每人一支他亲手做的笔[玫瑰]。大家一起写了很多字[憨笑]。'
      },
      {
        type: 'text',
        text: '有书画家来给大家题字、画画，没想到竟然有人认出我这幅字的出处，太惊喜了[呲牙]。'
      },
      {
        type: 'text',
        text: '可惜听说这门课可能是最后一届开了，不知道算不算幸运[皱眉]。'
      },
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2025_12_22/01.jpg',
          './assets/images/life/activities_moments/2025_12_22/02.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
