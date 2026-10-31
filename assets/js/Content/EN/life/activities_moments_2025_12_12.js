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
    dateKey: '2025_12_12',
    dateISO: '2025-12-12',
    dateLabel: '2025.12.12',

    title: 'An Unforgettably Delicious Bowl of Beef Noodles',
    location: 'High-tech Zone, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2025_12_12/cover.jpg',

    summary: 'An ordinary day, unexpectedly comforted by a bowl of beef noodles.',

    content: [
      {
        type: 'text',
        text: 'After trying so many kinds of noodles both on and off campus, most of them felt rather plain and forgettable. This bowl, however, was genuinely good. The noodles had just the right texture, soft yet pleasantly chewy; the beef practically melted in my mouth, and even the portion size was perfect, leaving nothing to waste [delicious].'
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

  window.ACTIVITIES_MOMENTS_EN = target;
})();
