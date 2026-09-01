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
    schemaVersion: 3,
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
        },
        {
          id: 'optimization',
          order: 30
        },
        {
          id: 'mathematical-modeling',
          order: 40
        },
        {
          id: 'computer-graphics',
          order: 50
        },
        {
          id: 'finite-element-analysis',
          order: 60
        },
        {
          id: 'topology-optimization',
          order: 70
        },
        {
          id: 'machine-learning',
          order: 80
        },
        {
          id: 'latex-typesetting',
          order: 90
        }
      ],

      series: [
        {
          id: 'probability-theory-mathematical-statistics',
          order: 10
        },
        {
          id: 'introduction-to-optimization',
          order: 20
        },
        {
          id: 'machine-learning-a',
          order: 30
        },
        {
          id: 'machine-learning-b',
          order: 40
        }
      ],

      roles: [
        {
          id: 'author',
          order: 10
        },
        {
          id: 'solution-author',
          order: 15
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
        },
        {
          id: 'review-sample-answers',
          order: 20
        },
        {
          id: 'project-report',
          order: 30
        },
        {
          id: 'template-example',
          order: 40
        }
      ]
    },

    /*
      Embedded PDF spread modes are recorded per resource:
      - 'none': single-page layout
      - 'odd': cover-first two-page layout
      - 'even': even-page-first two-page layout
    */
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
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 10
      },
      {
        id: 'introduction-to-optimization-homework-01-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'introduction-to-optimization',
        subjects: ['optimization'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2026-03',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/introduction-to-optimization-homework-01-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 20
      },
      {
        id: 'introduction-to-optimization-homework-02-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'introduction-to-optimization',
        subjects: ['optimization'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2026-04',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/introduction-to-optimization-homework-02-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 21
      },
      {
        id: 'introduction-to-optimization-homework-03-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'introduction-to-optimization',
        subjects: ['optimization'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2026-04',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/introduction-to-optimization-homework-03-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 22
      },
      {
        id: 'introduction-to-optimization-homework-04-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'introduction-to-optimization',
        subjects: ['optimization'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2026-05',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/introduction-to-optimization-homework-04-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 23
      },
      {
        id: 'stardust-cheatsheet-template-example',
        primaryCategory: 'works-compilations',
        materialType: 'other-materials',
        subjects: ['latex-typesetting'],
        roles: ['author'],
        languages: ['zh', 'en'],
        tags: ['template-example'],
        date: '2026-05',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/stardust-cheatsheet-template-example.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'none',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 30
      },
      {
        id: 'mathematical-modeling-answer-01-metro-route-planning',
        primaryCategory: 'works-compilations',
        materialType: 'project-reports-documentation',
        subjects: ['mathematical-modeling'],
        roles: ['author'],
        languages: ['en'],
        tags: ['project-report'],
        date: '2026-04',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/mathematical-modeling-answer-01-metro-route-planning.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 40
      },
      {
        id: 'mathematical-modeling-answer-02-rpca-image-restoration',
        primaryCategory: 'works-compilations',
        materialType: 'project-reports-documentation',
        subjects: ['mathematical-modeling'],
        roles: ['author'],
        languages: ['en'],
        tags: ['project-report'],
        date: '2026-04',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/mathematical-modeling-answer-02-rpca-image-restoration.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 41
      },
      {
        id: 'mathematical-modeling-answer-03-curve-fitting-fourier-reconstruction',
        primaryCategory: 'works-compilations',
        materialType: 'project-reports-documentation',
        subjects: ['mathematical-modeling'],
        roles: ['author'],
        languages: ['en'],
        tags: ['project-report'],
        date: '2026-04',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/mathematical-modeling-answer-03-curve-fitting-fourier-reconstruction.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 42
      },
      {
        id: 'mathematical-modeling-answer-04-periodic-outbreak-models',
        primaryCategory: 'works-compilations',
        materialType: 'project-reports-documentation',
        subjects: ['mathematical-modeling'],
        roles: ['author'],
        languages: ['en'],
        tags: ['project-report'],
        date: '2026-05',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/mathematical-modeling-answer-04-periodic-outbreak-models.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 43
      },
      {
        id: 'topograph3d-course-report',
        primaryCategory: 'works-compilations',
        materialType: 'project-reports-documentation',
        subjects: [
          'computer-graphics',
          'finite-element-analysis',
          'topology-optimization'
        ],
        roles: ['author'],
        languages: ['en'],
        tags: ['project-report'],
        date: '2026-08',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/topograph3d-course-report.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 50
      },
      {
        id: 'machine-learning-a-homework-01-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-a',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2025-10',
        year: 2025,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-a-homework-01-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 60
      },
      {
        id: 'machine-learning-a-homework-02-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-a',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2024-10',
        year: 2024,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-a-homework-02-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 61
      },
      {
        id: 'machine-learning-a-homework-03-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-a',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['en'],
        tags: ['exercise-solutions'],
        date: '2025-11',
        year: 2025,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-a-homework-03-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 62
      },
      {
        id: 'machine-learning-b-homework-01-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['zh'],
        tags: ['exercise-solutions'],
        date: '2026-03',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-homework-01-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 70
      },
      {
        id: 'machine-learning-b-homework-02-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['zh'],
        tags: ['exercise-solutions'],
        date: '2026-03',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-homework-02-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 71
      },
      {
        id: 'machine-learning-b-homework-03-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['zh'],
        tags: ['exercise-solutions'],
        date: '2026-04',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-homework-03-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 72
      },
      {
        id: 'machine-learning-b-homework-04-solutions',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['solution-author'],
        languages: ['zh'],
        tags: ['exercise-solutions'],
        date: '2026-05',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-homework-04-solutions.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 73
      },
      {
        id: 'machine-learning-b-review-sample-ch01-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch01-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 74
      },
      {
        id: 'machine-learning-b-review-sample-ch02-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch02-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 75
      },
      {
        id: 'machine-learning-b-review-sample-ch03-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch03-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 76
      },
      {
        id: 'machine-learning-b-review-sample-ch04-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch04-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 77
      },
      {
        id: 'machine-learning-b-review-sample-ch05-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch05-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 78
      },
      {
        id: 'machine-learning-b-review-sample-ch06-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch06-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 79
      },
      {
        id: 'machine-learning-b-review-sample-ch07-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch07-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 80
      },
      {
        id: 'machine-learning-b-review-sample-ch08-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch08-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 81
      },
      {
        id: 'machine-learning-b-review-sample-ch09-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch09-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 82
      },
      {
        id: 'machine-learning-b-review-sample-ch10-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch10-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 83
      },
      {
        id: 'machine-learning-b-review-sample-ch11-with-answers',
        primaryCategory: 'works-compilations',
        materialType: 'course-teaching-materials',
        series: 'machine-learning-b',
        subjects: ['machine-learning'],
        roles: ['compiler'],
        languages: ['zh'],
        tags: ['review-sample-answers'],
        date: '2026-06',
        year: 2026,
        resources: [
          {
            id: 'document-pdf',
            type: 'pdf',
            href:
              './assets/pdf/about/archive/machine-learning-b-review-sample-ch11-with-answers.pdf',
            embed: true,
            initialPage: 1,
            zoom: 'page-width',
            pageMode: 'bookmarks',
            spreadMode: 'odd',
            order: 10
          }
        ],
        defaultOpen: false,
        order: 84
      }
    ]
  });
})();
