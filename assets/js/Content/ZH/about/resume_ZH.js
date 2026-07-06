(function () {
  'use strict';

  window.RESUME_ZH_INNER_HTML = `
    <button id="toggle-btn">
      <span><i class="fas fa-sun"></i></span>
    </button>
    <div id="clock">GMT+8 00:00</div>
    <div class="container">

      <div class="section resume-hero" id="resume-hero">
        <div class="resume-hero-avatar">
          <img src="./assets/images/about/profile.jpg" alt="Profile photo">
        </div>
        <div class="resume-hero-body">
          <div class="resume-hero-name">陈璟皓</div>

          <div class="resume-email-block">
            <div class="resume-email-toggle-line">
              <span class="resume-email-title resume-email-title-icon" aria-label="邮箱" title="邮箱">
                <i class="fas fa-envelope" aria-hidden="true"></i>
              </span>
              <button class="expander resume-email-expander" type="button" data-expand-target="exp-hero-email-zh" data-expand-key="hero-email" aria-expanded="false" aria-label="展开邮箱地址">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="expand-row resume-email-expand" id="exp-hero-email-zh" aria-hidden="true" style="display:none;">
              <div class="expand-content resume-email-content">
                <div class="resume-email-list">
                  <div class="resume-email-row">
                    <span class="resume-email-label">学术邮箱</span>
                    <a class="resume-email-address" href="mailto:chenjinghao@mail.ustc.edu.cn">chenjinghao@mail.ustc.edu.cn</a>
                    <span class="resume-email-note"></span>
                    <span class="resume-email-actions" aria-label="学术邮箱操作">
                      <button class="resume-email-icon-btn resume-email-copy-btn" type="button" data-copy-email="chenjinghao@mail.ustc.edu.cn" aria-label="复制学术邮箱地址" title="复制">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                      </button>
                      <a class="resume-email-icon-btn resume-email-send-btn" href="mailto:chenjinghao@mail.ustc.edu.cn" aria-label="发送邮件到学术邮箱" title="发送邮件">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                      </a>
                    </span>
                  </div>

                  <div class="resume-email-row">
                    <span class="resume-email-label">个人邮箱</span>
                    <a class="resume-email-address" href="mailto:stardust.math26@gmail.com">stardust.math26@gmail.com</a>
                    <span class="resume-email-note"></span>
                    <span class="resume-email-actions" aria-label="个人邮箱操作">
                      <button class="resume-email-icon-btn resume-email-copy-btn" type="button" data-copy-email="stardust.math26@gmail.com" aria-label="复制个人邮箱地址" title="复制">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                      </button>
                      <a class="resume-email-icon-btn resume-email-send-btn" href="mailto:stardust.math26@gmail.com" aria-label="发送邮件到个人邮箱" title="发送邮件">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                      </a>
                    </span>
                  </div>

                  <div class="resume-email-row">
                    <span class="resume-email-label">临时邮箱</span>
                    <a class="resume-email-address" href="mailto:jinghao-chen@u.nus.edu">jinghao-chen@u.nus.edu</a>
                    <span class="resume-email-note">有效期：2026年8月--10月</span>
                    <span class="resume-email-actions" aria-label="临时邮箱操作">
                      <button class="resume-email-icon-btn resume-email-copy-btn" type="button" data-copy-email="jinghao-chen@u.nus.edu" aria-label="复制临时邮箱地址" title="复制">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                      </button>
                      <a class="resume-email-icon-btn resume-email-send-btn" href="mailto:jinghao-chen@u.nus.edu" aria-label="发送邮件到临时邮箱" title="发送邮件">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p class="resume-hero-intro">
          我是中国科学技术大学 (USTC) 数学专业本科生, 辅修计算机科学. 我主要研究运营管理与运筹学方向, 尤其关注供应链分析、随机建模与博弈论.
          <br><br>
          作为数学专业的学生, 严格的数学训练塑造了我处理应用问题的方式: 在进行计算之前, 我往往会先寻找问题背后的结构. 这种视角常常让我能借助代数或数论中的工具——例如不变量、对称性与离散推理——用更精炼的论证、更清晰的推导与更易于解释的结果, 替代单纯的暴力计算. 即使研究最终目标偏经验或决策导向, 我也会尽量让建模假设清晰可见、推理链条透明可靠. 作为计算机专业的学生, 当工作与计算或人工智能产生交集时, 我能够快速上手 (无论理论还是实操). 与此同时，多年的编程经验也让我能自然高效地使用科研软件进行可视化、分析与学术写作.
          <br><br>
          在我的学术品味中, "结构感"尤为重要: 看似不同的问题往往共享同一副"骨架"/"本质". 我最感兴趣的研究, 是揭示这种共通原则, 并据此设计既有效、又更有原则性与可解释性的模型与方法.
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>研究兴趣</h2>
        <ul><li>运营管理、运筹学、供应链、随机模型、博弈论.</li></ul>
      </div>

      <div class="section">
        <h2>教育背景</h2>
        <div class="subheading">
          <span class="subheading-title">
            <a class="resume-link" href="https://www.ustc.edu.cn/" target="_blank" rel="noopener noreferrer">中国科学技术大学</a>
          </span>
          <span>2023年9月 -- 2027年7月 (预计)</span>
        </div>

        <div class="subsubheading resume-degree-line">
          <span>
            <a class="resume-link" href="https://math.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">数学理学学士</a>; <a class="resume-link" href="https://cs.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">计算机科学与技术工学学士</a>
            <button class="expander" type="button" data-expand-target="exp-edu-bg-zh" data-expand-key="edu-bg" aria-expanded="false" aria-label="展开详情">
              <i class="fas fa-chevron-right"></i>
            </button>
            <br>
            (PS: <a class="resume-link" href="https://aixmicroprogram.mh.chaoxing.com/" target="_blank" rel="noopener noreferrer">AI+X 微专业, 华东五校联盟</a>)
          </span>
          <span>中国·合肥</span>
        </div>

        <div class="expand-row" id="exp-edu-bg-zh" aria-hidden="true" style="display:none;">
          <div class="expand-content">
            <div class="expand-item">
              <img src="./assets/images/about/Education_Background.png" alt="教育背景">
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>荣誉与奖项</h2>
        <table width="100%">
          <tr>
            <td>
              <a class="award-link" href="https://math.ustc.edu.cn/2025/1024/c18650a706019/page.htm" target="_blank" rel="noopener noreferrer" aria-label="打开相关链接">优秀学生奖学金 (银奖)</a>
              <button class="expander" type="button" data-expand-target="exp-ess-silver-zh" data-expand-key="ess-silver" aria-expanded="false" aria-label="展开详情"><i class="fas fa-chevron-right"></i></button>
            </td>
            <td align="right">2025</td>
          </tr>
          <tr class="expand-row" id="exp-ess-silver-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="https://math.ustc.edu.cn/2025/1024/c18650a706019/page.htm" target="_blank" rel="noopener noreferrer" aria-label="打开相关链接">
                  <img src="./assets/images/about/Excellent_Student_Scholarship--Silver.jpg" alt="优秀学生奖学金（银奖）">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <a class="award-link" href="https://math.ustc.edu.cn/2024/1113/c18650a660488/page.htm" target="_blank" rel="noopener noreferrer" aria-label="打开相关链接">张宗植科技奖学金</a>
              <button class="expander" type="button" data-expand-target="exp-zzst-scholarship-zh" data-expand-key="zzst-scholarship" aria-expanded="false" aria-label="展开详情"><i class="fas fa-chevron-right"></i></button>
            </td>
            <td align="right">2024</td>
          </tr>
          <tr class="expand-row" id="exp-zzst-scholarship-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="https://math.ustc.edu.cn/2024/1113/c18650a660488/page.htm" target="_blank" rel="noopener noreferrer" aria-label="打开相关链接">
                  <img src="./assets/images/about/Zhang_Zongzhi_Sci-Tech_Scholarship.jpg" alt="张宗植科技奖学金">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <a class="award-link" href="./assets/pdf/about/Excellent_Freshman_Scholarship--Silver.pdf" download aria-label="下载 PDF">优秀新生奖学金 (银奖)</a>
              <button class="expander" type="button" data-expand-target="exp-efs-silver-zh" data-expand-key="efs-silver" aria-expanded="false" aria-label="展开详情"><i class="fas fa-chevron-right"></i></button>
            </td>
            <td align="right">2023</td>
          </tr>
          <tr class="expand-row" id="exp-efs-silver-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="./assets/pdf/about/Excellent_Freshman_Scholarship--Silver.pdf" download aria-label="下载 PDF">
                  <img src="./assets/images/about/Excellent_Freshman_Scholarship--Silver.jpg" alt="优秀新生奖学金（银奖）">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <a class="award-link" href="./assets/pdf/about/2025_MCM_Problem_B_Results.pdf" download aria-label="下载 PDF">美国大学生数学建模竞赛 MCM (B题) Honorable Mention (担任队长)</a>
              <button class="expander" type="button" data-expand-target="exp-mcm-hm-zh" data-expand-key="mcm-hm" aria-expanded="false" aria-label="展开详情">
                <i class="fas fa-chevron-right"></i>
              </button>
            </td>
            <td align="right">2025</td>
          </tr>
          <tr class="expand-row" id="exp-mcm-hm-zh" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="./assets/pdf/about/2025_MCM_Problem_B_Results.pdf" download aria-label="下载 PDF">
                  <img src="./assets/images/about/Honorable_Mention.jpg" alt="MCM Honorable Mention">
                </a>
              </div>
            </td>
          </tr>

        </table>
      </div>
      
      <div class="section">
        <h2>科研经历</h2>
        <div class="subheading">
          <span class="subheading-title">边际分布模型与选择模型不等式的猜想与证明</span>
          <span>2026年7月 -- 至今</span>
        </div>
        <div class="subsubheading">
          <div>导师: </div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://cde.nus.edu.sg/isem/staff/li-xiaobo/" target="_blank" rel="noopener noreferrer">李晓波</a></strong></div>
          </div>
        </div>
        <ul>
          <li>待添加</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">具有不平等厌恶偏好的消费者下的需求信息共享</span>
          <span>2025年7月 -- 至今</span>
        </div>
        <div class="subsubheading">
          <div>导师: </div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://sites.google.com/site/yiminyu/" target="_blank" rel="noopener noreferrer">虞义敏教授</a></strong>(<a class="resume-link" href="https://www.cb.cityu.edu.hk/dao/" target="_blank" rel="noopener noreferrer">香港城市大学 决策分析与运营学系</a>)</div>
            <div><strong><a class="resume-link" href="https://www.ln.edu.hk/mkt/faculty-staff/staff-list/wang-qian" target="_blank" rel="noopener noreferrer">汪倩教授</a></strong>(<a class="resume-link" href="https://www.ln.edu.hk/mkt" target="_blank" rel="noopener noreferrer">香港岭南大学 市场营销与国际商务学系</a>)</div>
          </div>
        </div>
        <ul>
          <li>构建包含需求预测不确定性与不平等厌恶消费者的制造商—零售商贝叶斯定价/信号传递模型, 并在 LMSE (least-misleading sequential equilibrium) 准则下求解精炼的完美贝叶斯均衡.</li>
          <li>推导信息不共享与零售商共享两种机制下的闭式"混同/分离"批发价策略与利润表达式.</li>
          <li>证明自愿信息共享与强制信息共享在收益上的等价性, 并给出比较静态: 阐明不同信念设定（被动 vs. 线性）与不平等厌恶如何重塑渠道表现.</li>
        </ul>
        
        <div class="subheading">
          <span class="subheading-title">垄断企业在"先发货后购物 (STS)"与传统商业模式下的双边博弈</span>
          <span>2024年9月 -- 2025年8月</span>
        </div>
        <div class="subsubheading">
          <div>导师: </div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://bs.ustc.edu.cn/chinese/profile-329.html" target="_blank" rel="noopener noreferrer">沈晓蓓教授</a></strong>(<a class="resume-link" href="https://business.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">中国科学技术大学 管理学院</a>)</div>
            <div><strong><a class="resume-link" href="https://bs.ustc.edu.cn/chinese/profile-2329.html" target="_blank" rel="noopener noreferrer">吕建成博士</a></strong>(<a class="resume-link" href="https://business.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">中国科学技术大学 管理学院</a>)</div>
          </div>
        </div>
        <ul>
          <li>构建比较传统渠道与 STS (Ship-then-Shop) 渠道的双边渠道选择博弈模型, 纳入订阅成本、搜索成本与退货成本等因素.</li>
          <li>刻画企业最优定价, 并证明在均衡中不会出现"展厅效应 (showrooming)"; 该结论在放松消费者类型认知假设, 以及放宽消费者类型与退货成本分布假设后仍然成立.</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>教学经历</h2>
        <div class="subheading">
          <span class="subheading-title">助教, "数学分析(B1)"</span>
          <span>2026年9月 -- 2027年1月</span>
        </div>
        <div class="subsubheading">
          <div>授课教师: </div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://faculty.ustc.edu.cn/mingminzhang/zh_CN/index.htm" target="_blank" rel="noopener noreferrer">张明敏</a></strong> (<a class="resume-link" href="https://math.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">中国科学技术大学 数学科学学院</a>)</div>
          </div>
        </div>
        <ul>
          <li>待添加</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">助教, "机器学习B"</span>
          <span>2026年3月 -- 2026年7月</span>
        </div>
        <div class="subsubheading">
          <div>授课教师: </div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://faculty.ustc.edu.cn/xiaoli" target="_blank" rel="noopener noreferrer">肖力教授</a></strong> (<a class="resume-link" href="https://sist.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">中国科学技术大学 信息科学技术学院</a>)</div>
          </div>
        </div>
        <ul>
          <li>
            补充拓展了“机器学习A”中学到的、王杰老师编的教材内容, 帮助同学们夯实机器学习相关的数学基础:
            <a
              class="expand-action-btn"
              href="https://github.com/Stardust-math/Machine_Learning_B"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>
              <span>仓库</span>
            </a>
          </li>
          <li>给学生的作业和考试评分, 提供反馈和辅导. 每周开设习题课, 回答问题, 帮助学生准备考试.</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">助教, "概率论与数理统计"</span>
          <span>2025年9月 -- 2026年1月</span>
        </div>
        <div class="subsubheading">
          <div>授课教师: </div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://bs.ustc.edu.cn/chinese/profile-97.html" target="_blank" rel="noopener noreferrer">张曙光教授</a></strong> (<a class="resume-link" href="https://business.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">中国科学技术大学 管理学院</a>)</div>
          </div>
        </div>
        <ul>
          <li>
            基于缪柏其、张伟平编撰的教材整理并编写详细 LaTeX 习题解答与参考答案；维护开源仓库供同学使用:
            <a
              class="expand-action-btn"
              href="https://github.com/Stardust-math/Reference-Answer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>
              <span>仓库</span>
            </a>
          </li>
          <li>给学生的作业和考试评分, 提供反馈和辅导. 每周开设习题课, 回答问题, 帮助学生准备考试.</li>
        </ul>
      </div>

      <div class="section">
        <h2>课程设计</h2>

        <div class="subheading">
          <span class="subheading-title">
            基于加权图建模与系统额外增量的地铁线路规划
          </span>
        </div>

        <ul>
          <li>
            本项目在加权图建模框架下研究地铁路径规划，并在原始教学模板基础上扩展为一个完整系统，包含最短路径计算、改进的图形交互界面，以及考虑换乘代价的路径规划扩展。
            <br>
            <div class="project-actions">
              <a
                class="expand-action-btn"
                href="https://stardust-math.github.io/Mathematical_Modeling/HW_1/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                <span>展示页</span>
              </a>

              <a
                class="expand-action-btn"
                href="https://github.com/Stardust-math/Mathematical_Modeling/tree/main/HW%26ANS/Answer_1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
                </svg>
                <span>代码</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            图像恢复的渐进式 RPCA 框架：从基础分解到掩膜补全
          </span>
        </div>

        <ul>
          <li>
            本项目研究基于渐进式 RPCA 框架的图像恢复，从基础的低秩—稀疏分解出发，进一步扩展到彩色图像处理、增强图形交互、TV 正则化恢复与掩膜补全。
            <br>
            <div class="project-actions">
              <a
                class="expand-action-btn"
                href="https://stardust-math.github.io/Mathematical_Modeling/HW_2/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                <span>展示页</span>
              </a>

              <a
                class="expand-action-btn"
                href="https://github.com/Stardust-math/Mathematical_Modeling/tree/main/HW%26ANS/Answer_2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
                </svg>
                <span>代码</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            基于插值、拟合与傅里叶重建的曲线拟合
          </span>
        </div>

        <ul>
          <li>
            本项目研究由采样点驱动的平面曲线重建，综合比较局部插值、全局拟合与周期闭曲线的截断傅里叶重建。实验系统考察了三次 Hermite 插值、三次 B 样条插值、多项式最小二乘拟合和 B 样条最小二乘拟合在不同参数化方式、节点密度与噪声水平下的表现。
            <br>
            <div class="project-actions">
              <a
                class="expand-action-btn"
                href="https://stardust-math.github.io/Mathematical_Modeling/HW_3/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                <span>展示页</span>
              </a>

              <a
                class="expand-action-btn"
                href="https://github.com/Stardust-math/Mathematical_Modeling/tree/main/HW%26ANS/Answer_3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
                </svg>
                <span>代码</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            基于区室传染病模型的周期性爆发建模
          </span>
        </div>

        <ul>
          <li>
            本项目基于 SIR 型区室传染病模型研究传染病的周期性爆发现象。实验从基础 SIR 模型出发，进一步引入出生死亡导致的人口更新、季节性传播率强迫以及 Gillespie 随机模拟，用于解释单次爆发、反复峰值、季节性流行模式与小感染人数下的早期消亡现象。
            <br>
            <div class="project-actions">
              <a
                class="expand-action-btn"
                href="https://stardust-math.github.io/Mathematical_Modeling/HW_4/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                <span>展示页</span>
              </a>

              <a
                class="expand-action-btn"
                href="https://github.com/Stardust-math/Mathematical_Modeling/tree/main/HW%26ANS/Answer_4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
                </svg>
                <span>代码</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            压力下的搭便车：公共物品治理中的动态存量—压力模型
          </span>
        </div>

        <ul>
          <li>
            本项目研究动态公共物品供给中的搭便车行为，构建基于仿真的动态存量—压力搭便车框架，将异质性主体、贡献激励、公共物品存量、维护压力、需求反馈、容量饱和与政策干预整合在同一动态多主体系统中；在受控合成情景下，比较 Nash 式个体理性基准与阶段性社会规划者基准，并评估补贴、惩罚、声誉、匹配基金、阈值治理与组合治理政策的效果。
            <br>
            <div class="project-actions">
              <a
                class="expand-action-btn"
                href="https://stardust-math.github.io/Mathematical_Modeling/Final/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                <span>展示页</span>
              </a>

              <a
                class="expand-action-btn"
                href="https://github.com/Stardust-math/Mathematical_Modeling/tree/main/HW%26ANS/Final/PublicGood_FreeRiding"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
                </svg>
                <span>代码</span>
              </a>
            </div>
          </li>
        </ul>
      </div>
      
      <div class="section">
        <h2>附加信息</h2>
        <ul>
          <li>
            <strong>技术能力:</strong>
            <ul>
              <li>编程: Python（熟练）, C（熟练）, Mathematica（熟练）</li>
              <li>工具: LaTeX（高级）, Visio, Adobe Illustrator, Adobe Photoshop</li>
            </ul>
          </li>
          <li>
            <strong>语言:</strong> 中文（母语）, 英语（流利--托福: 阅读 28, 听力 24, 口语 24, 写作 27）
          </li>
        </ul>
      </div>
    </div>
    
    <a href="#" class="back-btn" id="resume-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
  `;
})();