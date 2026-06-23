(function () {
  'use strict';

  window.SOCIAL_FRIENDS_DATA = {
    email: 'stardust.math26@gmail.com',

    mailSubject: 'Request to Add Friend',

    requestTemplate: [
      'Site Name: [Your Site Name]',
      'Site Desc: [Your Site Description]',
      'Site Link: [Your Site Link]',
      'Avatar Link: [Your Avatar Link]',
      'Tag: [Your Site Tag]'
    ].join('\n'),

    mySiteInfo: [
      'Site Name: Joker Chen',
      'Site Desc: Ich muß fort, ich muß reisen, ich muß in die Freiheit.',
      'Site Link: https://stardust-math.github.io',
      'Avatar Link: https://stardust-math.github.io/assets/images/favicon.png',
      'Tag: Blog'
    ].join('\n'),

    friends: [
      {
        title: 'Joker Chen',
        desc: 'Ich muß fort, ich muß reisen, ich muß in die Freiheit.',
        siteurl: 'https://stardust-math.github.io',
        avatar: 'https://stardust-math.github.io/assets/images/favicon.png',
        tag: 'Blog'
      }
    ]
  };
})();