(function () {
  'use strict';

  window.ABOUT_ARCHIVE_EN = Object.freeze({
    labels: Object.freeze({
      primaryCategories: Object.freeze({
        'works-compilations': 'Works & Compilations',
        'selected-readings': 'Selected Readings'
      }),

      materialTypes: Object.freeze({
        'course-teaching-materials':
          'Course & Teaching Materials',
        'research-manuscripts-notes':
          'Research Manuscripts & Notes',
        'expository-notes-surveys':
          'Expository Notes & Surveys',
        'project-reports-documentation':
          'Project Reports & Documentation',
        'talks-presentations':
          'Talks & Presentations',
        'translations-annotations':
          'Translations & Annotations',
        'other-materials': 'Other Materials',
        'books-textbooks': 'Books & Textbooks',
        'papers-preprints': 'Papers & Preprints',
        'theses-dissertations':
          'Theses & Dissertations',
        'lecture-notes-course-materials':
          'Lecture Notes & Course Materials',
        'reports-essays': 'Reports & Essays',
        'documentation-tutorials':
          'Documentation & Tutorials',
        'other-readings': 'Other Readings'
      }),

      subjects: Object.freeze({
        'probability-theory': 'Probability Theory',
        'mathematical-statistics':
          'Mathematical Statistics'
      }),

      series: Object.freeze({
        'probability-theory-mathematical-statistics':
          'Probability Theory and Mathematical Statistics'
      }),

      roles: Object.freeze({
        author: 'Author',
        'co-author': 'Co-author',
        compiler: 'Compiler',
        editor: 'Editor',
        translator: 'Translator',
        annotator: 'Annotator'
      }),

      languages: Object.freeze({
        zh: 'Chinese',
        en: 'English'
      }),

      tags: Object.freeze({
        'exercise-solutions': 'Exercise Solutions'
      }),

      resourceTypes: Object.freeze({
        pdf: 'PDF',
        source: 'Source',
        notes: 'Notes',
        code: 'Code',
        slides: 'Slides',
        dataset: 'Dataset',
        other: 'Resource'
      })
    }),

    documents: Object.freeze({
      'probability-statistics-miao-zhang-solutions':
        Object.freeze({
          title:
            'Reference Solutions to Exercises in Probability Theory and Mathematical Statistics (Baiqi Miao and Weiping Zhang)',
          displayTitle: Object.freeze([
            Object.freeze({
              text: 'Reference Solutions to Exercises in '
            }),
            Object.freeze({
              text:
                'Probability Theory and Mathematical Statistics',
              kind: 'cite'
            }),
            Object.freeze({
              text: ' (Baiqi Miao and Weiping Zhang)'
            })
          ]),
          creators: Object.freeze([
            'Jinghao Chen'
          ]),
          meta: 'July 2026',
          notice:
            'Jinghao Chen · Independently authored · Unofficial course and teaching material',
          description:
            'Independently written reference solutions for Probability Theory and Mathematical Statistics, intended for course study and teaching reference.',
          searchAliases: Object.freeze([
            'Baiqi Miao',
            'Weiping Zhang',
            'probability and statistics',
            'exercise answers',
            'course solutions'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        })
    }),

    ui: Object.freeze({
      searchLabel: 'Search the archive',
      searchPlaceholder:
        'Search titles, authors, courses, or topics…',
      clearSearch: 'Clear search',
      filtersLabel: 'Archive filters',
      allMaterials: 'All Materials',
      filterLabels: Object.freeze({
        materialType: 'Type',
        subject: 'Subject',
        series: 'Course or Series',
        year: 'Year',
        role: 'Contribution',
        language: 'Language'
      }),
      filterAll: Object.freeze({
        materialType: 'All Types',
        subject: 'All Subjects',
        series: 'All Courses & Series',
        year: 'All Years',
        role: 'All Contributions',
        language: 'All Languages'
      }),
      oneResult: '1 material',
      manyResults: '{count} materials',
      noResultsQuery:
        'No materials matched “{query}”.',
      noResultsFilters:
        'No materials match the current filters.',
      resetFilters: 'Clear search and filters',
      expand: 'Expand document',
      collapse: 'Collapse document',
      loadingReader: 'Loading the PDF reader...',
      readerUnavailable:
        'The PDF reader could not be loaded.',
      readerActions: 'PDF reading actions',
      fullscreen: 'Fullscreen Reading',
      openNewTab: 'Open in New Tab',
      directOpen: 'Open PDF Directly',
      closeFullscreen: 'Exit fullscreen reading',
      previewSuffix: 'PDF preview',
      fallbackPrefix:
        'If the PDF preview does not load,',
      fallbackSuffix: '.',
      resourcesLabel: 'Material resources',
      tagsLabel: 'Subjects and tags'
    })
  });
})();
