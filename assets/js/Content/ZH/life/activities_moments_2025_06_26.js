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
    dateKey: '2025_06_26',
    dateISO: '2025-06-26',
    dateLabel: '2025.06.26',

    title: '志愿科普',
    location: '中国·安徽省·合肥市·合肥高新技术产业开发区城西桥社区服务中心',

    cover: './assets/images/life/activities_moments/2025_06_26/cover.jpg',

    summary: '考试结束后的短暂停留里，为小朋友们做了一次关于气压小实验的科普分享。',

    content: [
      {
        type: 'text',
        text: '趁刚考完还没走，给小朋友们科普了一下气压有关的小实验。可惜准备得不是很充分，有一个让他们动手的实验，因为担心他们的安全就没有做。于是前半小时还挺流畅，后面十几分钟就有点乱。不过明显这次做实验要比上次讲数学更能吸引小朋友们的注意[捂脸]。也感谢张老师的支持和帮助。'
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

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
