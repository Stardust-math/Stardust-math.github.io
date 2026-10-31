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
    dateKey: '2024_08_16',
    dateISO: '2024-08-16',
    dateLabel: '2024.08.16',

    title: 'Volunteer Science Outreach',
    location: 'Changning Center Party and Mass Service Center, High-tech Zone, Hefei, Anhui, China',

    cover: './assets/images/life/activities_moments/2024_08_16/cover.jpg',

    summary: 'At Changning Center Party and Mass Service Center, I gave a science outreach session for children and came to appreciate how challenging it is to teach step by step and according to each learner’s background.',

    content: [
      {
        type: 'text',
        text: 'Being a teacher is truly difficult [crying]. I talked with the children about symmetry and definitions in mathematics, and briefly introduced abstract structures and topology. From that point on, however, some of them seemed to find it difficult to follow. I probably did not assess the difficulty well enough, and I hope this experience did not make them feel discouraged from mathematics.'
      },
      {
        type: 'text',
        text: 'If I have another opportunity like this, I should first learn more carefully about their prior knowledge. Teaching step by step and according to each learner’s background is itself a difficult art. This experience also made me feel even more grateful to the teachers who have guided me.'
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
