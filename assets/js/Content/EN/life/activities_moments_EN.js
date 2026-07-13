(function () {
  'use strict';

  const previous = window.ACTIVITIES_MOMENTS_EN || {};

  window.ACTIVITIES_MOMENTS_EN = {
    ui: {
      viewMoment: 'View Moment',
      backToMoments: 'Back to Moments',
      close: 'Close',
      openImage: 'Open image',
      loadingMoment: 'Loading this moment...'
    },

    items: [
      {
        dateKey: '2026_05_16',
        dateISO: '2026-05-16',
        dateLabel: '2026.05.16',
        title: 'Volunteer Service for Science and Technology Week',
        location: 'West Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2026_05_16/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2026_03_20',
        dateISO: '2026-03-20',
        dateLabel: '2026.03.20',
        title: 'Third Scholarship at USTC',
        location: 'East Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2026_03_20/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2026_03_09',
        dateISO: '2026-03-09',
        dateLabel: '2026.03.09',
        title: 'Spring Festival Gala Performance',
        location: 'Old North Gate, East Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2026_03_09/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2026_02_17',
        dateISO: '2026-02-17',
        dateLabel: '2026.02.17',
        title: 'Returning to a Familiar Place — Back to Zhilin',
        location: 'Zhilin High School',
        cover: './assets/images/life/activities_moments/2026_02_17/cover.jpg',
        summary: 'Returning to Zhilin once more, I found the familiar campus still standing before me, while the circumstances of those earlier years had already receded far into the past. Experiences that once felt so heavy and vivid have gradually withdrawn into deeper layers of memory; the lessons I once believed could be passed on with certainty have also revealed their own limits in a new stage of life. This return was therefore not merely an act of nostalgia, but a moment of looking back, somewhere between reunion and estrangement, and sensing anew the distance between who I am now and the past I once inhabited.'
      },
      {
        dateKey: '2025_12_22',
        dateISO: '2025-12-22',
        dateLabel: '2025.12.22',
        title: 'Chinese Paper, Ink, Brush, and Inkstone',
        titleParts: [
          { text: 'Chinese Paper, Ink, Brush, and Inkstone', italic: true }
        ],
        location: 'South Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2025_12_22/cover.jpg',
        summary: 'A joyful ending.'
      },
      {
        dateKey: '2025_12_12',
        dateISO: '2025-12-12',
        dateLabel: '2025.12.12',
        title: 'An Unforgettably Delicious Bowl of Beef Noodles',
        location: 'High-tech Zone, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2025_12_12/cover.jpg',
        summary: 'An ordinary day, unexpectedly comforted by a bowl of beef noodles.'
      },
      {
        dateKey: '2025_09_12',
        dateISO: '2025-09-12',
        dateLabel: '2025.09.12',
        title: 'First In-Class TA Session',
        location: 'Room 5104, Fifth Teaching Building, East Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2025_09_12/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2025_08_31',
        dateISO: '2025-08-31',
        dateLabel: '2025.08.31',
        title: 'Visiting a Friend at Shenzhen University',
        location: 'Shenzhen University',
        cover: './assets/images/life/activities_moments/2025_08_31/cover.jpg',
        summary: 'I visited a high school friend at Shenzhen University and found a brief moment of ease in a long-awaited conversation at the end of summer.'
      },
      {
        dateKey: '2025_07_15',
        dateISO: '2025-07-15',
        dateLabel: '2025.07.15',
        title: 'Autographed Copy of Battle Through the Heavens',
        titleParts: [
          { text: 'Autographed Copy of ' },
          { text: 'Battle Through the Heavens', italic: true }
        ],
        location: '',
        cover: './assets/images/life/activities_moments/2025_07_15/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2025_07_09',
        dateISO: '2025-07-09',
        dateLabel: '2025.07.09',
        title: 'A Former Aspiration, Hard to Return To',
        location: 'Shenzhen, Guangdong, China',
        cover: './assets/images/life/activities_moments/2025_07_09/cover.jpg',
        summary: 'Once drawn to mathematics and physics, I later turned toward computation; the old aspiration had not vanished, yet the way back felt difficult to find.'
      },
      {
        dateKey: '2025_06_26',
        dateISO: '2025-06-26',
        dateLabel: '2025.06.26',
        title: 'Volunteer Science Outreach',
        location: 'Chengxiqiao Community Service Center, Hefei High-tech Industrial Development Zone, Hefei, Anhui, China',
        cover: './assets/images/life/activities_moments/2025_06_26/cover.jpg',
        summary: 'During a brief stay after the exams, I gave a science outreach session for children through small experiments on air pressure.'
      },
      {
        dateKey: '2025_04_22',
        dateISO: '2025-04-22',
        dateLabel: '2025.04.22',
        title: 'Second Scholarship at USTC',
        location: 'East Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2025_04_22/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2024_10_26',
        dateISO: '2024-10-26',
        dateLabel: '2024.10.26',
        title: 'Residential College Tug-of-War Competition',
        location: 'Gymnasium, Central Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2024_10_26/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2024_08_16',
        dateISO: '2024-08-16',
        dateLabel: '2024.08.16',
        title: 'Volunteer Science Outreach',
        location: 'Changning Center Party and Mass Service Center, High-tech Zone, Hefei, Anhui, China',
        cover: './assets/images/life/activities_moments/2024_08_16/cover.jpg',
        summary: 'At Changning Center Party and Mass Service Center, I gave a science outreach session for children and came to appreciate how challenging it is to teach step by step and according to each learner’s background.'
      },
      {
        dateKey: '2024_02_20',
        dateISO: '2024-02-20',
        dateLabel: '2024.02.20',
        title: 'Returning to High School for a USTC Outreach Talk',
        location: 'Zhilin High School',
        cover: './assets/images/life/activities_moments/2024_02_20/cover.jpg',
        summary: 'Returning to Zhilin, I introduced USTC to students from Olympiad Classes 1 to 7.'
      },
      {
        dateKey: '2024_01_15',
        dateISO: '2024-01-15',
        dateLabel: '2024.01.15',
        title: 'First Scholarship at USTC',
        location: 'East Campus, University of Science and Technology of China',
        cover: './assets/images/life/activities_moments/2024_01_15/cover.jpg',
        summary: ''
      }
    ],

    moments: Array.isArray(previous.moments) ? previous.moments : []
  };
})();