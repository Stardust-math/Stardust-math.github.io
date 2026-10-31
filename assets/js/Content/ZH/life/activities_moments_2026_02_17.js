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
    dateKey: '2026_02_17',
    dateISO: '2026-02-17',
    dateLabel: '2026.02.17',

    title: '故地重游——重返知临',
    location: '知临中学',

    cover: './assets/images/life/activities_moments/2026_02_17/cover.jpg',

    summary: '再回知临，熟悉的校园依旧在眼前，昔日的处境却已远去。那些曾经沉重而鲜明的经历，随着时间逐渐退入更深的记忆之中；曾经确信可以传递的经验，也在新的阶段里显出它自身的局限。此番回望，并非单纯的怀念，而是在重逢与疏离之间，重新感知自己与过去的距离。',

    content: [
      {
        type: 'text',
        text: '年前回知临看老师，在学校里逛了几圈，又见了几位老师，还和周老师拍了合照[旺柴]（可惜忘了和其他老师合照了）好多老师都不在知临了[叹气]看着熟悉的校园，饭点时同学们奔跑的身影，感觉自己好像又回到了高中。但现在早已不在那般处境之下，目标不同、压力不同、烦恼不同，记忆也早已消退，就连回忆都做不到了[苦涩]'
      },
      {
        type: 'text',
        text: '考前班主任对我们说“明年此日青云去，却笑人间举子忙”，当时我想着：那样压抑的三年，无论结果如何，能熬过去的学生都值得尊重。即便我考上了一个看得过去的大学，也无法“笑”看学弟学妹们忙碌。于是高考前的我竭力记住我的每一个决定和感受，希望能整理成经验，无论成败，至少能帮助学弟学妹们减轻痛苦、少走弯路。'
      },
      {
        type: 'text',
        text: '但大一寒假回校宣讲时，我发现我高中整理的东西都太过狭隘了，只适合应试，甚至只适合我个人，若是强行灌输给学弟学妹们，恐怕会将他们导入岐途，于是便只好向他们介绍大学生活。'
      },
      {
        type: 'text',
        text: '直到如今又一次回校，我甚至不敢去接触他们了。感觉大学生活并不像许多老师描述的那样美好，甚至比高中还要困苦无数。若是他们问我大学的情形，我既不忍骗他们，又不该提前揭露给他们，于是便只能选择逃避了。'
      },
      {
        type: 'text',
        text: '或许将来有一天，我也会像这样怀念大学生活，不过现在的我实在欣赏不起来。但至少又过了一年，过去对我的负面影响又削弱了一分，接下来又要迎来冲刺的一年，希望将来还能有回看的机会。'
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

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
