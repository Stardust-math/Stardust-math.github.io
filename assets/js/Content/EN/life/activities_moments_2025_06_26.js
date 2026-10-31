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
    dateKey: '2025_06_26',
    dateISO: '2025-06-26',
    dateLabel: '2025.06.26',

    title: 'Volunteer Science Outreach',
    location: 'Chengxiqiao Community Service Center, Hefei High-tech Industrial Development Zone, Hefei, Anhui, China',

    cover: './assets/images/life/activities_moments/2025_06_26/cover.jpg',

    summary: 'During a brief stay after the exams, I gave a science outreach session for children through small experiments on air pressure.',

    content: [
      {
        type: 'text',
        text: 'Before leaving after the exams, I gave the children a small science outreach session on experiments related to air pressure. Unfortunately, I was not fully prepared. There was one hands-on experiment that I eventually decided not to conduct because I was concerned about their safety. As a result, the first half hour went rather smoothly, while the last ten minutes or so became a little messy. Still, it was clear that doing experiments attracted the children’s attention much more than my previous mathematics talk did [facepalm]. I am also grateful to Teacher Zhang for the support and help.'
      },
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2025_06_26/01.jpg',
          './assets/images/life/activities_moments/2025_06_26/02.jpg',
          './assets/images/life/activities_moments/2025_06_26/03.jpg',
          './assets/images/life/activities_moments/2025_06_26/04.jpg',
          './assets/images/life/activities_moments/2025_06_26/05.jpg',
          './assets/images/life/activities_moments/2025_06_26/06.jpg',
          './assets/images/life/activities_moments/2025_06_26/07.jpg',
          './assets/images/life/activities_moments/2025_06_26/08.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
