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
    dateKey: '2025_07_09',
    dateISO: '2025-07-09',
    dateLabel: '2025.07.09',

    title: 'A Former Aspiration, Hard to Return To',
    location: 'Shenzhen, Guangdong, China',

    cover: './assets/images/life/activities_moments/2025_07_09/cover.jpg',

    summary: 'Once drawn to mathematics and physics, I later turned toward computation; the old aspiration had not vanished, yet the way back felt difficult to find.',

    content: [
      {
        type: 'text',
        text: 'In my younger years, I was deeply drawn to pure mathematics. I read late into the cold nights, forgetting sleep and meals, afraid of wasting even the briefest moments of time. After entering university and studying hard for two years, I finally came to feel the shallowness of my own ability. Though the longing remained intense, my hands could not reach what my heart desired, and so I bent myself toward the path of computation.'
      },
      {
        type: 'text',
        text: 'That choice went against my original aspiration, abandoned an old dream, and broke the proud and unrestrained ambition I had carried for so long. On many nights, sitting alone, I would recall the days of childhood, when I held a pen and traced out calculations, letting my thoughts wander beyond the visible world. I once swore that I would grow old with mathematics and physics. Now the dream has grown cold, the spirit has faded, and those thoughts are difficult to dispel; only a faint shadow and a solitary lamp remain.'
      },
      {
        type: 'text',
        text: 'I regret and despise myself for having gradually become the very kind of person I once laughed at and looked down upon. Thinking of that withered wish, my heart feels ashen, grief pierces through me, and tears dampen my robe. In the vast and uncertain distance, I no longer know how far the road ahead extends, nor where a place of return may be found.'
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
