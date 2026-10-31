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
    dateKey: '2025_12_22',
    dateISO: '2025-12-22',
    dateLabel: '2025.12.22',

    title: 'Chinese Paper, Ink, Brush, and Inkstone',
    titleParts: [
      { text: 'Chinese Paper, Ink, Brush, and Inkstone', italic: true }
    ],
    location: 'South Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2025_12_22/cover.jpg',

    summary: 'A joyful ending.',

    content: [
      {
        type: 'text',
        text: 'A joyful ending [celebrate].'
      },
      {
        type: 'text',
        text: 'The teacher gave each of us another brush handmade by himself [rose]. We all wrote many characters together [smile].'
      },
      {
        type: 'text',
        text: 'A calligrapher and painter also came to write inscriptions and paint for everyone. I did not expect someone to recognize the source of my piece, which was such a pleasant surprise [grin].'
      },
      {
        type: 'text',
        text: 'Unfortunately, I heard that this course might be offered for the last time. I am not sure whether that makes me lucky [frown].'
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

  window.ACTIVITIES_MOMENTS_EN = target;
})();
