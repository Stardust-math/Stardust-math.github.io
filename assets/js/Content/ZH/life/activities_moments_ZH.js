(function () {
  'use strict';

  const previous = window.ACTIVITIES_MOMENTS_ZH || {};

  window.ACTIVITIES_MOMENTS_ZH = {
    ui: {
      viewMoment: '观此一瞬',
      backToMoments: '行至终章',
      close: '关闭',
      openImage: '查看图片',
      loadingMoment: '正在加载这一瞬的完整内容……'
    },

    items: [
      {
        dateKey: '2026_05_16',
        dateISO: '2026-05-16',
        dateLabel: '2026.05.16',
        title: '科技活动周志愿服务',
        location: '中国科学技术大学·西区',
        cover: './assets/images/life/activities_moments/2026_05_16/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2026_03_20',
        dateISO: '2026-03-20',
        dateLabel: '2026.03.20',
        title: '科大的第三笔奖学金',
        location: '中国科学技术大学·东区',
        cover: './assets/images/life/activities_moments/2026_03_20/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2026_03_09',
        dateISO: '2026-03-09',
        dateLabel: '2026.03.09',
        title: '春晚参演',
        location: '中国科学技术大学·东区·老北门',
        cover: './assets/images/life/activities_moments/2026_03_09/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2026_02_17',
        dateISO: '2026-02-17',
        dateLabel: '2026.02.17',
        title: '故地重游——重返知临',
        location: '知临中学',
        cover: './assets/images/life/activities_moments/2026_02_17/cover.jpg',
        summary: '再回知临，熟悉的校园依旧在眼前，昔日的处境却已远去。那些曾经沉重而鲜明的经历，随着时间逐渐退入更深的记忆之中；曾经确信可以传递的经验，也在新的阶段里显出它自身的局限。此番回望，并非单纯的怀念，而是在重逢与疏离之间，重新感知自己与过去的距离。'
      },
      {
        dateKey: '2025_12_22',
        dateISO: '2025-12-22',
        dateLabel: '2025.12.22',
        title: '《中国纸墨笔砚》',
        location: '中国科学技术大学·南校区',
        cover: './assets/images/life/activities_moments/2025_12_22/cover.jpg',
        summary: '完结撒花。'
      },
      {
        dateKey: '2025_12_12',
        dateISO: '2025-12-12',
        dateLabel: '2025.12.12',
        title: '一碗绝世美味的牛肉面',
        location: '中国科学技术大学·高新区',
        cover: './assets/images/life/activities_moments/2025_12_12/cover.jpg',
        summary: '平平无奇的一天，被一碗牛肉面狠狠治愈。'
      },
      {
        dateKey: '2025_09_12',
        dateISO: '2025-09-12',
        dateLabel: '2025.09.12',
        title: '第一次助教随堂',
        location: '中国科学技术大学·东区·第五教学楼 5104',
        cover: './assets/images/life/activities_moments/2025_09_12/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2025_08_31',
        dateISO: '2025-08-31',
        dateLabel: '2025.08.31',
        title: '深大访友',
        location: '深圳大学',
        cover: './assets/images/life/activities_moments/2025_08_31/cover.jpg',
        summary: '去深大看望高中同学，在久违的闲谈里，偷得一段夏末的轻松。'
      },
      {
        dateKey: '2025_07_15',
        dateISO: '2025-07-15',
        dateLabel: '2025.07.15',
        title: '《斗破苍穹》亲笔签名',
        location: '',
        cover: './assets/images/life/activities_moments/2025_07_15/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2025_07_09',
        dateISO: '2025-07-09',
        dateLabel: '2025.07.09',
        title: '旧志难酬',
        location: '中国·广东省·深圳',
        cover: './assets/images/life/activities_moments/2025_07_09/cover.jpg',
        summary: '昔慕数理，后转计数；旧志未泯，而归途难寻。'
      },
      {
        dateKey: '2025_06_26',
        dateISO: '2025-06-26',
        dateLabel: '2025.06.26',
        title: '志愿科普',
        location: '中国·安徽省·合肥市·合肥高新技术产业开发区城西桥社区服务中心',
        cover: './assets/images/life/activities_moments/2025_06_26/cover.jpg',
        summary: '考试结束后的短暂停留里，为小朋友们做了一次关于气压小实验的科普分享。'
      },
      {
        dateKey: '2025_04_22',
        dateISO: '2025-04-22',
        dateLabel: '2025.04.22',
        title: '科大的第二笔奖学金',
        location: '中国科学技术大学·东区',
        cover: './assets/images/life/activities_moments/2025_04_22/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2024_10_26',
        dateISO: '2024-10-26',
        dateLabel: '2024.10.26',
        title: '书院团体拔河赛',
        location: '中国科学技术大学·中校区·体育馆',
        cover: './assets/images/life/activities_moments/2024_10_26/cover.jpg',
        summary: ''
      },
      {
        dateKey: '2024_08_16',
        dateISO: '2024-08-16',
        dateLabel: '2024.08.16',
        title: '志愿科普',
        location: '中国·安徽省·合肥市·高新区长宁中心党群服务中心',
        cover: './assets/images/life/activities_moments/2024_08_16/cover.jpg',
        summary: '在长宁中心党群服务中心，为小朋友们做了一场科普分享，也第一次真切感受到循序渐进与因材施教的不易。'
      },
      {
        dateKey: '2024_02_20',
        dateISO: '2024-02-20',
        dateLabel: '2024.02.20',
        title: '高中返校宣讲',
        location: '知临中学',
        cover: './assets/images/life/activities_moments/2024_02_20/cover.jpg',
        summary: '回到知临，给奥1到奥7班的同学们宣传了科大。'
      },
      {
        dateKey: '2024_01_15',
        dateISO: '2024-01-15',
        dateLabel: '2024.01.15',
        title: '科大的第一笔奖学金',
        location: '中国科学技术大学·东区',
        cover: './assets/images/life/activities_moments/2024_01_15/cover.jpg',
        summary: ''
      }
    ],

    moments: Array.isArray(previous.moments) ? previous.moments : []
  };
})();