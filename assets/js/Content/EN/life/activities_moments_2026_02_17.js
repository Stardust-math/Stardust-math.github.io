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
    dateKey: '2026_02_17',
    dateISO: '2026-02-17',
    dateLabel: '2026.02.17',

    title: 'Returning to a Familiar Place — Back to Zhilin',
    location: 'Zhilin High School',

    cover: './assets/images/life/activities_moments/2026_02_17/cover.jpg',

    summary: 'Returning to Zhilin once more, I found the familiar campus still standing before me, while the circumstances of those earlier years had already receded far into the past. Experiences that once felt so heavy and vivid have gradually withdrawn into deeper layers of memory; the lessons I once believed could be passed on with certainty have also revealed their own limits in a new stage of life. This return was therefore not merely an act of nostalgia, but a moment of looking back, somewhere between reunion and estrangement, and sensing anew the distance between who I am now and the past I once inhabited.',

    content: [
      {
        type: 'text',
        text: 'Before the Lunar New Year, I returned to Zhilin to visit my teachers. I walked around the campus several times, met a few teachers again, and even took a photo with Teacher Zhou [doge]. It was a pity that I forgot to take photos with the others. Many teachers are no longer at Zhilin now [sigh]. Looking at the familiar campus, and at the students running across it during lunch break, I felt as if I had returned to high school. Yet I am no longer in that situation. The goals are different, the pressure is different, the troubles are different, and even the memories have faded so much that I can hardly summon them back [bitter].'
      },
      {
        type: 'text',
        text: 'Before the college entrance examination, our homeroom teacher once said to us, “On this day next year, when you have risen to the blue clouds, you may smile upon the candidates still hurrying through the world below.” At that time, I thought that no matter what the final result might be, every student who had endured those oppressive three years deserved respect. Even if I eventually entered a university that seemed decent enough, I could never truly “smile” at the busyness of the younger students. So before the Gaokao, I tried my best to remember every decision I made and every feeling I had, hoping that one day I could organize them into experience. Whether I succeeded or failed, I at least wished to help those who came after me suffer a little less and avoid a few unnecessary detours.'
      },
      {
        type: 'text',
        text: 'But when I returned to school during my freshman winter vacation to give a talk, I realized that everything I had summarized in high school was far too narrow. It was suited only to examinations, perhaps even only to myself. If I forced those ideas upon younger students, I might instead lead them astray. So in the end, I could only introduce them to university life.'
      },
      {
        type: 'text',
        text: 'Now, returning to the school once again, I find that I no longer even dare to approach them. University life does not feel as wonderful as many teachers describe it. In some ways, it is even far more painful than high school. If they asked me what university is really like, I would neither have the heart to deceive them nor the right to reveal everything too early. And so I could only choose to avoid the question.'
      },
      {
        type: 'text',
        text: 'Perhaps one day in the future, I will look back on university life with the same kind of longing. But at this moment, I truly cannot bring myself to appreciate it. Still, another year has passed, and the negative influence of the past has weakened a little more. A final year of striving is about to begin. I hope that, in the future, there will still be a chance to look back.'
      },
      {
        type: 'gallery',
        images: [
          './assets/images/life/activities_moments/2026_02_17/01.jpg',
          './assets/images/life/activities_moments/2026_02_17/02.jpg',
          './assets/images/life/activities_moments/2026_02_17/03.jpg',
          './assets/images/life/activities_moments/2026_02_17/04.jpg',
          './assets/images/life/activities_moments/2026_02_17/05.jpg',
          './assets/images/life/activities_moments/2026_02_17/06.jpg',
          './assets/images/life/activities_moments/2026_02_17/07.jpg',
          './assets/images/life/activities_moments/2026_02_17/08.jpg'
        ]
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
