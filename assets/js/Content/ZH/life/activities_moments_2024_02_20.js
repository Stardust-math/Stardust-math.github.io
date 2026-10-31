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
    dateKey: '2024_02_20',
    dateISO: '2024-02-20',
    dateLabel: '2024.02.20',

    title: '高中返校宣讲',
    location: '知临中学',

    cover: './assets/images/life/activities_moments/2024_02_20/cover.jpg',

    summary: '回到知临，给奥1到奥7班的同学们宣传了科大。',

    content: [
      {
        type: 'text',
        text: '回到知临，给奥1到奥7班的同学们宣传了科大。'
      },
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2024_02_20/01.jpg',
          './assets/images/life/activities_moments/2024_02_20/02.jpg',
          './assets/images/life/activities_moments/2024_02_20/03.jpg',
          './assets/images/life/activities_moments/2024_02_20/04.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
