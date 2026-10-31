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
    dateKey: '2025_07_09',
    dateISO: '2025-07-09',
    dateLabel: '2025.07.09',

    title: '旧志难酬',
    location: '中国·广东省·深圳',

    cover: './assets/images/life/activities_moments/2025_07_09/cover.jpg',

    summary: '昔慕数理，后转计数；旧志未泯，而归途难寻。',

    content: [
      {
        type: 'text',
        text: '昔年少时，心醉纯数，寒灯夜读，废寝忘食，惟恐虚负寸阴寸景。及入大学，苦读两载，终觉才力疏浅，志慕犹炽，而手不能逮，遂折节就计数之途。是举也，违我初心，弃我旧梦，折我平生清狂之志。每夜孤坐，追忆垂髫之时，执笔摹算，心驰象外，尝誓与数理偕老，今则梦冷魂销，幽思难遣，唯余残影孤灯。自悔自鄙，旋堕为昔所笑所轻者。念及枯愿，心灰若死，殇透五内，泪湿青衫，渺渺茫茫，不知来路几何，难觅归处何方。'
      }
    ]
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
