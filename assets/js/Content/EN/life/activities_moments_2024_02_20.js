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
    dateKey: '2024_02_20',
    dateISO: '2024-02-20',
    dateLabel: '2024.02.20',

    title: 'Returning to High School for a USTC Outreach Talk',
    location: 'Zhilin High School',

    cover: './assets/images/life/activities_moments/2024_02_20/cover.jpg',

    summary: 'Returning to Zhilin, I introduced USTC to students from Olympiad Classes 1 to 7.',

    content: [
      {
        type: 'text',
        text: 'Returning to Zhilin, I introduced USTC to students from Olympiad Classes 1 to 7.'
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

  window.ACTIVITIES_MOMENTS_EN = target;
})();
