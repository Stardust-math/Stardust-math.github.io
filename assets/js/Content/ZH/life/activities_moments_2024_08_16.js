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
    dateKey: '2024_08_16',
    dateISO: '2024-08-16',
    dateLabel: '2024.08.16',

    title: '志愿科普',
    location: '中国·安徽省·合肥市·高新区长宁中心党群服务中心',

    cover: './assets/images/life/activities_moments/2024_08_16/cover.jpg',

    summary: '在长宁中心党群服务中心，为小朋友们做了一场科普分享，也第一次真切感受到循序渐进与因材施教的不易。',

    content: [
      {
        type: 'text',
        text: '当老师果然好难[流泪]。给小朋友们讲了一下数学上关于对称、定义的问题，也稍微介绍了一下抽象结构和拓扑。结果从这里开始，小朋友们就有点听不懂了。还是我没有评估好难度……希望不会让他们因此对数学感到厌烦。'
      },
      {
        type: 'text',
        text: '如果有下次机会的话，还是要先详细了解一下他们的知识储备才行。如何循序渐进、因材施教，也是一门不简单的学问啊。也越来越感激曾经教导我的老师们了。'
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
