(function () {
  'use strict';

  function deepFreeze(value) {
    if (
      value === null ||
      typeof value !== 'object' ||
      Object.isFrozen(value)
    ) {
      return value;
    }

    Object.keys(value).forEach(function (key) {
      deepFreeze(value[key]);
    });

    return Object.freeze(value);
  }

  window.AboutArchiveConfig = deepFreeze({
    schemaVersion: 2,
    exclusiveOpen: true,

    search: {
      debounceMs: 120,
      filters: [
        {
          id: 'materialType',
          field: 'materialType',
          taxonomy: 'materialTypes',
          multiple: false,
          order: 10
        },
        {
          id: 'subject',
          field: 'subjects',
          taxonomy: 'subjects',
          multiple: true,
          order: 20
        },
        {
          id: 'series',
          field: 'series',
          taxonomy: 'series',
          multiple: false,
          order: 30
        },
        {
          id: 'year',
          field: 'year',
          taxonomy: null,
          multiple: false,
          order: 40
        },
        {
          id: 'role',
          field: 'roles',
          taxonomy: 'roles',
          multiple: true,
          order: 50
        },
        {
          id: 'language',
          field: 'languages',
          taxonomy: 'languages',
          multiple: true,
          order: 60
        }
      ]
    },

    grouping: {
      seriesMinimumSize: 2
    },

    taxonomy: {
      primaryCategories: [
        {
          id: 'works-compilations',
          order: 10
        },
        {
          id: 'selected-readings',
          order: 20
        }
      ],

      materialTypes: [
        {
          id: 'course-teaching-materials',
          primaryCategory: 'works-compilations',
          order: 10
        },
        {
          id: 'research-manuscripts-notes',
          primaryCategory: 'works-compilations',
          order: 20
        },
        {
          id: 'expository-notes-surveys',
          primaryCategory: 'works-compilations',
          order: 30
        },
        {
          id: 'project-reports-documentation',
          primaryCategory: 'works-compilations',
          order: 40
        },
        {
          id: 'talks-presentations',
          primaryCategory: 'works-compilations',
          order: 50
        },
        {
          id: 'translations-annotations',
          primaryCategory: 'works-compilations',
          order: 60
        },
        {
          id: 'other-materials',
          primaryCategory: 'works-compilations',
          order: 90
        },
        {
          id: 'books-textbooks',
          primaryCategory: 'selected-readings',
          order: 110
        },
        {
          id: 'papers-preprints',
          primaryCategory: 'selected-readings',
          order: 120
        },
        {
          id: 'theses-dissertations',
          primaryCategory: 'selected-readings',
          order: 130
        },
        {
          id: 'lecture-notes-course-materials',
          primaryCategory: 'selected-readings',
          order: 140
        },
        {
          id: 'reports-essays',
          primaryCategory: 'selected-readings',
          order: 150
        },
        {
          id: 'documentation-tutorials',
          primaryCategory: 'selected-readings',
          order: 160
        },
        {
          id: 'other-readings',
          primaryCategory: 'selected-readings',
          order: 190
        }
      ],

      subjects: [
        {
          id: 'probability-theory',
          order: 10
        },
        {
          id: 'mathematical-statistics',
          order: 20
        }
      ],

      series: [
        {
          id: 'probability-theory-mathematical-statistics',
          order: 10
        }
      ],

      roles: [
        {
          id: 'author',
          order: 10
        },
        {
          id: 'co-author',
          order: 20
        },
        {
          id: 'compiler',
          order: 30
        },
        {
          id: 'editor',
          order: 40
        },
        {
          id: 'translator',
          order: 50
        },
        {
          id: 'annotator',
          order: 60
        }
      ],

      languages: [
        {
          id: 'zh',
          order: 10
        },
        {
          id: 'en',
          order: 20
        }
      ],

      tags: [
        {
          id: 'exercise-solutions',
          order: 10
        }
      ]
    },

    documents: [
      {
        id: 'probability-statistics-miao-zhang-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'probability-theory-mathematical-statistics',
        subjects: [
          'probability-theory',
          'mathematical-statistics'
        ],
        roles: ['author'],
        languages: ['zh'],
        tags: ['exercise-solutions'],
        date: '2026-07',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/《概率论与数理统计》（缪柏其、张伟平）参考答案.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 10
      }
    ]
  });
})();
