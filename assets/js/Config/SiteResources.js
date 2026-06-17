(function () {
  'use strict';

  const A = './assets/';

  const SITE_FONT_STYLES = window.SiteFonts && Array.isArray(window.SiteFonts.externalStyles)
    ? window.SiteFonts.externalStyles
    : [];

  /*
    Add activity dates here after creating both language detail files.

    The list/index data is stored in:
    assets/js/Content/EN/life/activities_moments_EN.js
    assets/js/Content/ZH/life/activities_moments_ZH.js

    The detail data is stored in:
    assets/js/Content/EN/life/activities_moments_2026_05_12.js
    assets/js/Content/ZH/life/activities_moments_2026_05_12.js

    Loading strategy:
    1. List/index files are critical Life resources.
    2. Detail files are loaded on demand when a visitor opens a specific moment.
  */
  const ACTIVITY_MOMENT_DATES = [
    '2026_03_20',
    '2026_03_09',
    '2026_02_17',
    '2025_12_22',
    '2025_12_12',
    '2025_09_12',
    '2025_08_31',
    '2025_07_15',
    '2025_07_09',
    '2025_06_26',
    '2025_04_22',
    '2024_10_26',
    '2024_08_16',
    '2024_02_20',
    '2024_01_15'
  ];

  const ACTIVITIES_MOMENTS = {
    dates: ACTIVITY_MOMENT_DATES.slice(),

    detailScript(lang, dateKey) {
      return A + 'js/Content/' + lang + '/life/activities_moments_' + dateKey + '.js';
    },

    detailScripts(lang) {
      return this.dates.map((dateKey) => this.detailScript(lang, dateKey));
    }
  };

  const FULL_CALENDAR = {
    styles: [
      {
        href: 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css'
      }
    ],
    scripts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js'
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/locales-all.min.js'
      }
    ]
  };

  const SCHEDULE_STYLES = [
    A + 'css/schedule/schedule-shell.css',
    A + 'css/schedule/schedule-calendar.css',
    A + 'css/schedule/schedule-general-timetable.css',
    A + 'css/schedule/schedule-modal.css',
    A + 'css/schedule/schedule-ustc-base.css',
    A + 'css/schedule/schedule-course-cells.css',
    A + 'css/schedule/schedule-semester-controls.css',

    A + 'css/schedule/schedule-export-toolbar.css',
    A + 'css/schedule/schedule-export-print.css',
    A + 'css/schedule/schedule-week-selector.css'
  ];

  window.SiteResources = {
    site: {
      title: 'Joker Chen',
      favicon: {
        href: A + 'images/favicon.png',
        type: 'image/png'
      }
    },

    offline: {
      enabled: true,
      serviceWorker: '/sw.js',
      scope: '/',

      /*
        Register the offline fallback service worker only after the page has become quiet.
        This keeps sw.js from competing with first-load resources and page warm-up scripts.
      */
      registerDelay: 2000,
      registerTimeout: 2000,
      resourceQuietWindow: 2200,
      maxRegisterDelay: 12000,
      waitForFonts: true,
      fontWaitTimeout: 3000,
      updateViaCache: 'none'
    },

    activitiesMoments: ACTIVITIES_MOMENTS,

    /*
      Cover video resources are derived from images.coverFiles.

      Naming rule:
      assets/images/cover/cover_1.webp
      assets/animation/cover/cover_1.mp4

      The video file names are intentionally not listed again, so the cover
      image list remains the single source of truth.
    */
    coverVideo: {
      enabled: true,
      dir: A + 'animation/cover/',
      extension: '.mp4'
    },

    navigation: {
      defaultPage: 'resume',
      pages: ['resume', 'schedule', 'social', 'toolkit', 'life'],

      warmup: {
        /*
          Visitor-experience-first warm-up policy:
          - The cover remains the first critical visual target.
          - Once the cover background is ready, all main modules keep warming.
          - Hidden/easter-egg pages are excluded.
          - FullCalendar and Life moment details stay lazy-loaded.
        */
        afterCover: ['resume', 'schedule', 'social', 'life'],
        afterFirstPage: ['resume', 'schedule', 'social', 'life'],

        delayAfterCover: 250,
        delayAfterFirstPage: 600,
        delayBetweenPages: 350,
        idleAfterCover: 150,
        idleAfterFirstPage: 500,
        hoverDelay: 60
      }
    },

    external: {
      styles: [
        ...SITE_FONT_STYLES
      ],

      libraries: {
        fullCalendar: FULL_CALENDAR
      },

      analytics: [
        {
          src: 'https://gc.zgo.at/count.js',
          attrs: {
            async: true,
            'data-goatcounter': 'https://stardust.goatcounter.com/count'
          }
        }
      ]
    },

    preload: {
      fonts: {
        lifeDisplay: [
          {
            href: A + 'fonts/Local_Display/HongLeiXingShuJianTi-2.woff2',
            family: 'HongLeiXingShu Local',
            type: 'font/woff2',
            load: '1em "HongLeiXingShu Local"'
          },
          {
            href: A + 'fonts/Local_Display/Beautiful-ES-1.woff2',
            family: 'Beautiful ES Local',
            type: 'font/woff2',
            load: '1em "Beautiful ES Local"'
          },
          {
            href: A + 'fonts/Local_Display/Cataneo%20BT.woff2',
            family: 'Cataneo BT Local',
            type: 'font/woff2',
            load: '1em "Cataneo BT Local"'
          }
        ]
      }
    },

    styles: {
      core: [
        A + 'css/fonts.css',

        A + 'css/base/core.css',
        A + 'css/base/site-zoom.css',
        A + 'css/layout/page-shell.css',
        A + 'css/components/legacy-controls.css',
        A + 'css/components/expanders.css',
        A + 'css/base/dark-mode.css',
        A + 'css/base/scrollbar.css',

        A + 'css/top-nav.css',
        A + 'css/cover/cover-shell.css',
        A + 'css/cover/cover-identity.css',
        A + 'css/cover/cover-enter.css'
      ],

      optional: {
        blog: A + 'css/blog/blog.css'
      }
    },

    scripts: {
      core: [
        A + 'js/Functions/Top-nav.js',

        A + 'js/Functions/cover/CoverBackground.js',
        A + 'js/Functions/cover/CoverDepthMotion.js',
        A + 'js/Functions/cover/CoverEnterHint.js',
        A + 'js/Functions/cover/Cover.js',

        A + 'js/Functions/general/Clock.js',
        A + 'js/Functions/general/Theme.js',
        A + 'js/Functions/general/Translate.js',
        A + 'js/Functions/general/Expanders.js',
        A + 'js/Functions/general/Custom-cursors.js',
        A + 'js/Functions/general/SitePreloader.js',
        A + 'js/Functions/general/SitePages.js'
      ],

      bootstrap: [
        A + 'js/Functions/bootstrap/BootstrapRoutes.js',
        A + 'js/Functions/bootstrap/BootstrapWarmup.js',
        A + 'js/Functions/bootstrap/BootstrapCoverInput.js',
        A + 'js/Functions/bootstrap/Bootstrap.js'
      ],

      optional: {
        blog: A + 'js/Functions/blog/Blog.js'
      }
    },

    pages: {
      resume: {
        route: 'about',
        domId: 'resume',
        mountId: 'mount-resume',
        styles: [
          A + 'css/about/about.css'
        ],
        scripts: [
          A + 'js/Content/EN/about/resume_EN.js',
          A + 'js/Content/ZH/about/resume_ZH.js',
          A + 'js/Functions/about/AboutResumeRender.js'
        ]
      },

      schedule: {
        route: 'schedule',
        domId: 'schedule',
        mountId: 'mount-schedule',
        styles: [
          ...SCHEDULE_STYLES
        ],
        scripts: [
          A + 'js/Content/EN/schedule/schedule_EN.js',
          A + 'js/Content/ZH/schedule/schedule_ZH.js',
          A + 'js/Config/ScheduleSemesterConfig.js',
          A + 'js/Functions/schedule/ScheduleUstcClasses.js',
          A + 'js/Functions/schedule/ScheduleCalendarGeneral.js',
          A + 'js/Functions/schedule/ScheduleCore.js',
          A + 'js/Functions/schedule/ScheduleRoutes.js',
          A + 'js/Functions/schedule/ScheduleExport.js',
          A + 'js/Functions/schedule/ScheduleSemesterSelector.js',
          A + 'js/Functions/schedule/ScheduleWeekSelector.js'
        ]
      },

      social: {
        route: 'social',
        domId: 'social',
        mountId: 'mount-social',
        styles: [
          A + 'css/social/social-cards.css',
          A + 'css/social/social-stats.css'
        ],
        scripts: [
          A + 'js/Content/EN/social/social_EN.js',
          A + 'js/Content/ZH/social/social_ZH.js',
          A + 'js/Functions/social/SocialRender.js',
          A + 'js/Functions/social/SocialStats.js',
          A + 'js/Functions/social/SocialComments.js'
        ]
      },

      toolkit: {
        route: 'toolkit',
        domId: 'toolkit',
        mountId: 'mount-toolkit',
        styles: [
          A + 'css/toolkit/toolkit.css'
        ],
        scripts: [
          A + 'js/Content/EN/toolkit/toolkit_EN.js',
          A + 'js/Content/ZH/toolkit/toolkit_ZH.js',
          A + 'js/Functions/toolkit/Toolkit.js'
        ]
      },

      life: {
        route: 'life',
        domId: 'life',
        mountId: 'mount-life',
        styles: [
          A + 'css/life/life.css',
          A + 'css/life/activities_moments-list.css',
          A + 'css/life/activities_moments-detail.css',
          A + 'css/life/meditations.css'
        ],
        scripts: [
          A + 'js/Functions/life/Life.js',

          A + 'js/Content/EN/life/activities_moments_EN.js',
          A + 'js/Content/ZH/life/activities_moments_ZH.js',

          A + 'js/Functions/life/ActivitiesMomentsUtils.js',
          A + 'js/Functions/life/ActivitiesMomentsIndex.js',
          A + 'js/Functions/life/ActivitiesMomentsRender.js',
          A + 'js/Functions/life/ActivitiesMomentsMedia.js',
          A + 'js/Functions/life/ActivitiesMoments.js',

          A + 'js/Functions/life/LifeMeditations.js',
          A + 'js/Functions/life/LifeRoutes.js'
        ]
      }
    },

    images: {
      favicon: A + 'images/favicon.png',
      avatar: A + 'images/avatar.jpg',

      coverDir: A + 'images/cover/',

      coverFiles: [
        'cover_1.webp',
        'cover_2.webp',
        'cover_3.webp',
        'cover_4.webp',
        'cover_5.webp',
        'cover_6.webp',
        'cover_7.webp',
        'cover_8.webp',
        'cover_9.webp',
        'cover_10.webp',
        'cover_11.webp',
        'cover_12.webp'
      ],

      blog: {
        background: A + 'images/blog/background.jpg',
        backgroundPng: A + 'images/blog/background.png',
        oldPaperTexture: A + 'images/blog/old-paper-texture.jpg',
        scrollTexture: A + 'images/blog/scroll-texture.png',
        fireAnimation: A + 'animation/blog/fire-animation.gif'
      },

      about: {
        profile: A + 'images/about/profile.jpg',
        educationBackground: A + 'images/about/Education_Background.png',
        excellentStudentScholarship: A + 'images/about/Excellent_Student_Scholarship--Silver.jpg',
        zhangZongzhiScholarship: A + 'images/about/Zhang_Zongzhi_Sci-Tech_Scholarship.jpg',
        excellentFreshmanScholarship: A + 'images/about/Excellent_Freshman_Scholarship--Silver.jpg',
        honorableMention: A + 'images/about/Honorable_Mention.jpg'
      }
    }
  };
})();