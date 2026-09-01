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
        'mathematical-statistics': '数理统计',
        optimization: '优化',
        'mathematical-modeling': '数学建模',
        'computer-graphics': '计算机图形学',
        'finite-element-analysis': '有限元分析',
        'topology-optimization': '拓扑优化',
        'machine-learning': '机器学习',
        'latex-typesetting': 'LaTeX 排版'
      }),

      series: Object.freeze({
        'probability-theory-mathematical-statistics':
          '概率论与数理统计',
        'introduction-to-optimization': '优化导论',
        'machine-learning-a': '机器学习 A',
        'machine-learning-b': '机器学习 B'
      }),

      roles: Object.freeze({
        author: '作者',
        'solution-author': '解答编写者',
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
        'exercise-solutions': '习题解答',
        'review-sample-answers':
          '含答案复习样卷',
        'project-report': '项目报告',
        'template-example': '模板示例'
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
        }),
      'introduction-to-optimization-homework-01-solutions':
        Object.freeze({
          title: '《优化导论》作业 1 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《优化导论》作业 1 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年春季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '完整解答，涵盖凸集、凸包与分离、凸函数、光滑性与强凸性，以及次梯度。',
          searchAliases: Object.freeze([
            'CS4017',
            '优化作业 1',
            'HW1',
            '凸性'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'introduction-to-optimization-homework-02-solutions':
        Object.freeze({
          title: '《优化导论》作业 2 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《优化导论》作业 2 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年春季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '完整解答，涵盖二次优化、凸优化问题变换、CVXPY、回归正则化与单纯形投影。',
          searchAliases: Object.freeze([
            'CS4017',
            '优化作业 2',
            'HW2',
            'CVXPY'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'introduction-to-optimization-homework-03-solutions':
        Object.freeze({
          title: '《优化导论》作业 3 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《优化导论》作业 3 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年春季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '完整解答，涵盖线性规划对偶、KKT 条件、灵敏度分析、二次规划对偶与 l1 球投影。',
          searchAliases: Object.freeze([
            'CS4017',
            '优化作业 3',
            'HW3',
            'KKT'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'introduction-to-optimization-homework-04-solutions':
        Object.freeze({
          title: '《优化导论》作业 4 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《优化导论》作业 4 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年春季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '完整解答，涵盖光滑与强凸函数、梯度法与牛顿法、回归实验、熵最小化与障碍法。',
          searchAliases: Object.freeze([
            'CS4017',
            '优化作业 4',
            'HW4',
            '牛顿法'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'stardust-cheatsheet-template-example':
        Object.freeze({
          title: 'Stardust Cheatsheet LaTeX 模板（示例）',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                'Stardust Cheatsheet LaTeX 模板（示例）'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 5 月',
          notice:
            '陈璟皓 · 模板设计 · 保留占位内容的原始示例输出',
          description:
            '五栏 A4 横向 LaTeX 速查表模板的单页原始示例输出，用于展示高密度数学排版与中英文混排，并保留源文件中的示例内容和占位文字。',
          searchAliases: Object.freeze([
            '速查表',
            'LaTeX 模板',
            'A4 横向',
            '排版示例'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'mathematical-modeling-answer-01-metro-route-planning':
        Object.freeze({
          title:
            '数学建模作业一：基于加权图的地铁路线规划',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '数学建模作业一：基于加权图的地铁路线规划'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 4 月',
          notice: '陈璟皓 · 完整课程项目报告',
          description:
            '完整报告，涵盖加权图建模、Dijkstra 最短路径、GUI 改进及考虑换乘惩罚的地铁路线规划。',
          searchAliases: Object.freeze([
            '加权图',
            'Dijkstra',
            '地铁网络',
            '路线规划'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'mathematical-modeling-answer-02-rpca-image-restoration':
        Object.freeze({
          title:
            '数学建模作业二：渐进式 RPCA 图像修复框架',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '数学建模作业二：渐进式 RPCA 图像修复框架'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 4 月',
          notice: '陈璟皓 · 完整课程项目报告',
          description:
            '完整报告，从基础与彩色 RPCA 逐步扩展至 GUI 改进、全变分正则化和掩膜图像补全。',
          searchAliases: Object.freeze([
            '鲁棒主成分分析',
            'RPCA',
            '图像修复',
            '掩膜补全'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'mathematical-modeling-answer-03-curve-fitting-fourier-reconstruction':
        Object.freeze({
          title:
            '数学建模作业三：插值、逼近与傅里叶重构下的曲线拟合',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '数学建模作业三：插值、逼近与傅里叶重构下的曲线拟合'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 4 月',
          notice: '陈璟皓 · 完整课程项目报告',
          description:
            '完整报告，比较插值与逼近方法、参数化规则和噪声鲁棒性，并研究闭合曲线的傅里叶重构。',
          searchAliases: Object.freeze([
            '曲线拟合',
            '插值',
            'B 样条',
            '傅里叶重构'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'mathematical-modeling-answer-04-periodic-outbreak-models':
        Object.freeze({
          title:
            '数学建模作业四：仓室传染病模型中的周期性暴发',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '数学建模作业四：仓室传染病模型中的周期性暴发'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 5 月',
          notice: '陈璟皓 · 完整课程项目报告',
          description:
            '完整报告，利用基础、人口统计、季节性强迫和随机 SIR 模型分析疫情复发与早期消亡。',
          searchAliases: Object.freeze([
            'SIR 模型',
            '传染病模型',
            '季节性强迫',
            '随机传染病模型'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'topograph3d-course-report':
        Object.freeze({
          title: 'TopoGraph3D 课程报告',
          displayTitle: Object.freeze([
            Object.freeze({
              text: 'TopoGraph3D 课程报告'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 8 月',
          notice:
            '陈璟皓 · 完整计算机图形学课程项目报告',
          description:
            '完整报告，介绍一个将三维 Hex8 有限元分析、科学可视化与 SIMP 拓扑优化集成到可执行节点图中的系统。',
          searchAliases: Object.freeze([
            '计算机图形学',
            '节点图',
            'Hex8 有限元分析',
            'SIMP'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-a-homework-01-solutions':
        Object.freeze({
          title: '《机器学习 A》作业 1 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 A》作业 1 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2025 年秋季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '2025 年秋季完整解答，涵盖极限与极限点、范数、开闭集、投影、矩阵求导、线性空间、秩、特征值、奇异值及伪逆。',
          searchAliases: Object.freeze([
            'Introduction to Machine Learning',
            '机器学习作业 1',
            'MLA HW1',
            '线性代数复习'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-a-homework-02-solutions':
        Object.freeze({
          title: '《机器学习 A》作业 2 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 A》作业 2 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2024 年秋季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '2024 年秋季完整解答，涵盖向量、矩阵与函数空间中的投影，多重共线性、正则化最小二乘、图像变形及偏差-方差权衡。',
          searchAliases: Object.freeze([
            'Introduction to Machine Learning',
            '机器学习作业 2',
            'MLA HW2',
            '正则化最小二乘'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-a-homework-03-solutions':
        Object.freeze({
          title: '《机器学习 A》作业 3 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 A》作业 3 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2025 年秋季',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '2025 年秋季完整解答，涵盖仿射集与投影、凸集及其像与原像、上图与下图、锥、Gordan 定理和 Farkas 引理。',
          searchAliases: Object.freeze([
            'Introduction to Machine Learning',
            '机器学习作业 3',
            'MLA HW3',
            'Farkas 引理'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-homework-01-solutions':
        Object.freeze({
          title: '《机器学习 B》作业 1 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 B》作业 1 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 3 月',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            'ROC/AUC 计算与分类模型评估指标比较的作业解答。',
          searchAliases: Object.freeze([
            'EE3502',
            '机器学习 B 作业 1',
            'MLB HW1',
            'ROC AUC'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-homework-02-solutions':
        Object.freeze({
          title: '《机器学习 B》作业 2 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 B》作业 2 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 3 月',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '涵盖平均绝对误差与拉普拉斯极大似然等价性、线性判别分析和信息增益决策树的作业解答。',
          searchAliases: Object.freeze([
            'EE3502',
            '机器学习 B 作业 2',
            'MLB HW2',
            'LDA'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-homework-03-solutions':
        Object.freeze({
          title: '《机器学习 B》作业 3 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 B》作业 3 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 4 月',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '涵盖线性核与高斯核 SVM、基于 SMO 的硬间隔 SVM 和朴素贝叶斯分类的作业解答。',
          searchAliases: Object.freeze([
            'EE3502',
            '机器学习 B 作业 3',
            'MLB HW3',
            'SVM SMO 朴素贝叶斯'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-homework-04-solutions':
        Object.freeze({
          title: '《机器学习 B》作业 4 参考解答',
          displayTitle: Object.freeze([
            Object.freeze({
              text: '《机器学习 B》作业 4 参考解答'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 5 月',
          notice:
            '陈璟皓 · 解答编写 · 非官方课程资料',
          description:
            '前两个主成分计算与中心化核主成分分析推导的作业解答。',
          searchAliases: Object.freeze([
            'EE3502',
            '机器学习 B 作业 4',
            'MLB HW4',
            'PCA 核 PCA'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch01-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 1 章：绪论',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 1 章：绪论'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 1.1-1.4 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 1 章复习',
            '绪论',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch02-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 2 章：模型评估与选择',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 2 章：模型评估与选择'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 2.1-2.3 节与第 2.5 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 2 章复习',
            '模型评估与选择',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch03-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 3 章：线性模型',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 3 章：线性模型'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 3.1-3.5 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 3 章复习',
            '线性模型',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch04-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 4 章：决策树',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 4 章：决策树'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 4.1-4.4 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 4 章复习',
            '决策树',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch05-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 5 章：神经网络',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 5 章：神经网络'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 5.1-5.4 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 5 章复习',
            '神经网络',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch06-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 6 章：支持向量机',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 6 章：支持向量机'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 6.1-6.6 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 6 章复习',
            '支持向量机',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch07-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 7 章：贝叶斯分类器',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 7 章：贝叶斯分类器'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 7.1-7.4 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 7 章复习',
            '贝叶斯分类器',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch08-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 8 章：集成学习',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 8 章：集成学习'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 8.1-8.5 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 8 章复习',
            '集成学习',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch09-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 9 章：聚类',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 9 章：聚类'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 9.1-9.3 节、第 9.4.1 节、第 9.5 节与第 9.6 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 9 章复习',
            '聚类',
            '样卷答案'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch10-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 10 章：降维与度量学习',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 10 章：降维与度量学习'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 10.1-10.6 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 10 章复习',
            '降维',
            '度量学习'
          ]),
          resourceLabels: Object.freeze({
            'document-pdf': 'PDF'
          })
        }),
      'machine-learning-b-review-sample-ch11-with-answers':
        Object.freeze({
          title:
            '《机器学习 B》期末复习样卷（含参考答案）——第 11 章：特征选择与稀疏学习',
          displayTitle: Object.freeze([
            Object.freeze({
              text:
                '《机器学习 B》期末复习样卷（含参考答案）——第 11 章：特征选择与稀疏学习'
            })
          ]),
          creators: Object.freeze(['陈璟皓']),
          meta: '2026 年 6 月',
          notice:
            '陈璟皓 · 助教编写 · 非官方复习资料',
          description:
            '覆盖第 11.1-11.4 节的期末复习样卷，附逐题参考答案与说明。',
          searchAliases: Object.freeze([
            'EE3502',
            '第 11 章复习',
            '特征选择',
            '稀疏学习'
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
