(function () {
  'use strict';

  window.ABOUT_ARCHIVE_ZH = Object.freeze({
    labels: Object.freeze({
      primaryCategories: Object.freeze({
        'works-compilations': '编写与整理',
        'selected-readings': '研读资料'
      }),

      materialTypes: Object.freeze({
        'course-teaching-materials':
          '课程与教学资料',
        'research-manuscripts-notes':
          '研究文稿与笔记',
        'expository-notes-surveys':
          '讲义与综述',
        'project-reports-documentation':
          '项目报告与文档',
        'talks-presentations':
          '报告与演示文稿',
        'translations-annotations':
          '翻译与注释',
        'other-materials': '其他资料',
        'books-textbooks': '书籍与教材',
        'papers-preprints': '论文与预印本',
        'theses-dissertations': '学位论文',
        'lecture-notes-course-materials':
          '讲义与课程资料',
        'reports-essays': '报告与文章',
        'documentation-tutorials':
          '文档与教程',
        'other-readings': '其他阅读'
      }),

      subjects: Object.freeze({
        'probability-theory': '概率论',
        'mathematical-statistics': '数理统计'
      }),

      series: Object.freeze({
        'probability-theory-mathematical-statistics':
          '概率论与数理统计'
      }),

      roles: Object.freeze({
        author: '作者',
        'co-author': '合著者',
        compiler: '整理者',
        editor: '编辑',
        translator: '译者',
        annotator: '注释者'
      }),

      languages: Object.freeze({
        zh: '中文',
        en: '英文'
      }),

      tags: Object.freeze({
        'exercise-solutions': '习题解答'
      }),

      resourceTypes: Object.freeze({
        pdf: 'PDF',
        source: '来源',
        notes: '笔记',
        code: '代码',
        slides: '演示文稿',
        dataset: '数据集',
        other: '资源'
      })
    }),

    documents: Object.freeze({
      'probability-statistics-miao-zhang-solutions':
        Object.freeze({
          title:
            '《概率论与数理统计》（缪柏其、张伟平）习题参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《概率论与数理统计》',
              kind: 'cite'
            }),
            Object.freeze({
              text:
                '（缪柏其、张伟平）习题参考解答'
            })
          ]),
          creators: Object.freeze([
            '陈璟皓'
          ]),
          meta: '2026年7月',
          notice:
            '陈璟皓 · 独立编写 · 非官方课程与教学资料',
          description:
            '面向《概率论与数理统计》独立编写的习题参考解答，可用于课程学习与教学参考。',
          searchAliases: Object.freeze([
            '缪柏其',
            '张伟平',
            '概率统计',
            '习题答案',
            '课程解答'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        })
    }),

    ui: Object.freeze({
      searchLabel: '搜索文库',
      searchPlaceholder:
        '搜索标题、作者、课程或主题……',
      clearSearch: '清除搜索',
      filtersLabel: '文库筛选',
      allMaterials: '全部资料',
      filterLabels: Object.freeze({
        materialType: '类型',
        subject: '学科',
        series: '课程或专题',
        year: '年份',
        role: '贡献角色',
        language: '语言'
      }),
      filterAll: Object.freeze({
        materialType: '全部类型',
        subject: '全部学科',
        series: '全部课程与专题',
        year: '全部年份',
        role: '全部贡献角色',
        language: '全部语言'
      }),
      oneResult: '共 1 项资料',
      manyResults: '共 {count} 项资料',
      noResultsQuery:
        '没有找到与“{query}”匹配的资料。',
      noResultsFilters:
        '没有符合当前筛选条件的资料。',
      resetFilters: '清除搜索与筛选',
      expand: '展开文档',
      collapse: '收起文档',
      loadingReader: '正在加载 PDF 阅读器……',
      readerUnavailable:
        'PDF 阅读器暂时无法加载。',
      readerActions: 'PDF 阅读操作',
      fullscreen: '全屏阅读',
      openNewTab: '新标签页打开',
      directOpen: '直接打开 PDF',
      closeFullscreen: '退出全屏阅读',
      previewSuffix: 'PDF 预览',
      fallbackPrefix: '若 PDF 预览无法加载，可',
      fallbackSuffix: '。',
      resourcesLabel: '资料资源',
      tagsLabel: '学科与标签'
    })
  });
})();
