(function () {
  'use strict';

  window.PROFILE_EN_INNER_HTML = `
      <div class="section resume-hero" id="resume-hero">
        <div class="resume-hero-avatar">
          <img src="./assets/images/about/profile.jpg" alt="Profile photo">
        </div>
        <div class="resume-hero-body">
          <div class="resume-hero-name">Jinghao Chen</div>

          <div class="resume-email-block">
            <div class="resume-email-toggle-line">
              <span class="resume-email-title resume-email-title-icon" aria-label="Email" title="Email">
                <i class="fas fa-envelope" aria-hidden="true"></i>
              </span>
              <button class="expander resume-email-expander" type="button" data-expand-target="exp-hero-email" data-expand-key="hero-email" aria-expanded="false" aria-label="Expand email addresses">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="expand-row resume-email-expand" id="exp-hero-email" aria-hidden="true" style="display:none;">
              <div class="expand-content resume-email-content">
                <div class="resume-email-list">
                  <div class="resume-email-row">
                    <span class="resume-email-label">Academic</span>
                    <a class="resume-email-address" href="mailto:chenjinghao@mail.ustc.edu.cn">chenjinghao@mail.ustc.edu.cn</a>
                    <span class="resume-email-note"></span>
                    <span class="resume-email-actions" aria-label="Academic email actions">
                      <button class="resume-email-icon-btn resume-email-copy-btn" type="button" data-copy-email="chenjinghao@mail.ustc.edu.cn" aria-label="Copy academic email address" title="Copy">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                      </button>
                      <a class="resume-email-icon-btn resume-email-send-btn" href="mailto:chenjinghao@mail.ustc.edu.cn" aria-label="Send email to academic address" title="Send email">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                      </a>
                    </span>
                  </div>

                  <div class="resume-email-row">
                    <span class="resume-email-label">Personal</span>
                    <a class="resume-email-address" href="mailto:stardust.math26@gmail.com">stardust.math26@gmail.com</a>
                    <span class="resume-email-note"></span>
                    <span class="resume-email-actions" aria-label="Personal email actions">
                      <button class="resume-email-icon-btn resume-email-copy-btn" type="button" data-copy-email="stardust.math26@gmail.com" aria-label="Copy personal email address" title="Copy">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                      </button>
                      <a class="resume-email-icon-btn resume-email-send-btn" href="mailto:stardust.math26@gmail.com" aria-label="Send email to personal address" title="Send email">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                      </a>
                    </span>
                  </div>

                  <div class="resume-email-row">
                    <span class="resume-email-label">Temporary</span>
                    <a class="resume-email-address" href="mailto:jinghao-chen@u.nus.edu">jinghao-chen@u.nus.edu</a>
                    <span class="resume-email-note">Valid during Aug.--Oct. 2026</span>
                    <span class="resume-email-actions" aria-label="Temporary email actions">
                      <button class="resume-email-icon-btn resume-email-copy-btn" type="button" data-copy-email="jinghao-chen@u.nus.edu" aria-label="Copy temporary email address" title="Copy">
                        <i class="fas fa-copy" aria-hidden="true"></i>
                      </button>
                      <a class="resume-email-icon-btn resume-email-send-btn" href="mailto:jinghao-chen@u.nus.edu" aria-label="Send email to temporary address" title="Send email">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p class="resume-hero-intro">
          I am an undergraduate at the University of Science and Technology of China (USTC), majoring in Mathematics with a minor in Computer Science. My primary research interests lie in operations management and operations research, with a particular focus on supply chain analytics, stochastic modeling, and game theory.
          <br><br>
          My training in rigorous mathematics shapes how I approach applied problems: I tend to look for underlying structure before reaching for computation. This perspective often lets me use tools and ways of thinking drawn from algebra and number theory—such as invariance, symmetry, and discrete reasoning—to replace brute-force calculations with concise arguments, cleaner derivations, and more interpretable results. Even when the end goal is empirical or decision-oriented, I strive to make the modeling assumptions explicit and the logic transparent. When my work intersects with computing or AI, I can ramp up fast—both conceptually and in implementation. Meanwhile, years of programming experience make it natural for me to use research software efficiently for visualization, analysis, and academic writing.
          <br><br>
          At the core of my academic taste is an appreciation for structure—the sense that seemingly different problems share the same “skeleton.” I am most excited by research that reveals these shared principles and uses them to design models and methods that are not only effective, but also principled and explainable.
          </p>
        </div>
      </div>

      <div class="section">
        <h2>Research Interests</h2>
        <ul><li>Operations Management, Operations Research, Supply Chain, Stochastic Models, Game Theory.</li></ul>
      </div>

      <div class="section">
        <h2>Education</h2>
        <div class="subheading">
          <span class="subheading-title">
            <a class="resume-link" href="https://www.ustc.edu.cn/" target="_blank" rel="noopener noreferrer">University of Science and Technology of China</a>
          </span>
          <span>Sep. 2023 -- Jul. 2027 (Expected)</span>
        </div>

        <div class="subsubheading resume-degree-line">
          <span>
            <a class="resume-link" href="https://math.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">B.Sc. in Mathematics</a>; <a class="resume-link" href="https://cs.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">B.Eng. in Computer Science and Technology</a>
            <button class="expander" type="button" data-expand-target="exp-edu-bg" data-expand-key="edu-bg" aria-expanded="false" aria-label="Expand details">
              <i class="fas fa-chevron-right"></i>
            </button>
            <br>
            (<a class="resume-link" href="https://aixmicroprogram.mh.chaoxing.com/" target="_blank" rel="noopener noreferrer">Additional Specialization in AI+X (Certificate Program), East China Five Universities Consortium</a>)
          </span>
          <span>Hefei, China</span>
        </div>

        <div class="expand-row" id="exp-edu-bg" aria-hidden="true" style="display:none;">
          <div class="expand-content">
            <div class="expand-item">
              <img src="./assets/images/about/Education_Background.png" alt="Education Background">
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Honors & Awards</h2>
        <table width="100%">
          <tr>
            <td>
              <a class="award-link" href="https://math.ustc.edu.cn/2025/1024/c18650a706019/page.htm" target="_blank" rel="noopener noreferrer" aria-label="Open related link">Excellent Student Scholarship--Silver</a>
              <button class="expander" type="button" data-expand-target="exp-ess-silver" data-expand-key="ess-silver" aria-expanded="false" aria-label="Expand details"><i class="fas fa-chevron-right"></i></button>
            </td>
            <td align="right">2025</td>
          </tr>
          <tr class="expand-row" id="exp-ess-silver" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="https://math.ustc.edu.cn/2025/1024/c18650a706019/page.htm" target="_blank" rel="noopener noreferrer" aria-label="Open related link">
                  <img src="./assets/images/about/Excellent_Student_Scholarship--Silver.jpg" alt="Excellent Student Scholarship--Silver">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <a class="award-link" href="https://math.ustc.edu.cn/2024/1113/c18650a660488/page.htm" target="_blank" rel="noopener noreferrer" aria-label="Open related link">Zhang Zongzhi Sci-Tech Scholarship</a>
              <button class="expander" type="button" data-expand-target="exp-zzst-scholarship" data-expand-key="zzst-scholarship" aria-expanded="false" aria-label="Expand details"><i class="fas fa-chevron-right"></i></button>
            </td>
            <td align="right">2024</td>
          </tr>
          <tr class="expand-row" id="exp-zzst-scholarship" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="https://math.ustc.edu.cn/2024/1113/c18650a660488/page.htm" target="_blank" rel="noopener noreferrer" aria-label="Open related link">
                  <img src="./assets/images/about/Zhang_Zongzhi_Sci-Tech_Scholarship.jpg" alt="Zhang Zongzhi Sci-Tech Scholarship">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <a class="award-link" href="./assets/pdf/about/Excellent_Freshman_Scholarship--Silver.pdf" download aria-label="Download PDF">Excellent Freshman Scholarship--Silver</a>
              <button class="expander" type="button" data-expand-target="exp-efs-silver" data-expand-key="efs-silver" aria-expanded="false" aria-label="Expand details"><i class="fas fa-chevron-right"></i></button>
            </td>
            <td align="right">2023</td>
          </tr>
          <tr class="expand-row" id="exp-efs-silver" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="./assets/pdf/about/Excellent_Freshman_Scholarship--Silver.pdf" download aria-label="Download PDF">
                  <img src="./assets/images/about/Excellent_Freshman_Scholarship--Silver.jpg" alt="Excellent Freshman Scholarship--Silver">
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <a class="award-link" href="./assets/pdf/about/2025_MCM_Problem_B_Results.pdf" download aria-label="Download PDF">Honorable Mention, Mathematical Contest in Modeling<sup>&reg;</sup> (MCM), Problem B (Team Captain)</a>
              <button class="expander" type="button" data-expand-target="exp-mcm-hm" data-expand-key="mcm-hm" aria-expanded="false" aria-label="Expand details">
                <i class="fas fa-chevron-right"></i>
              </button>
            </td>
            <td align="right">2025</td>
          </tr>
          <tr class="expand-row" id="exp-mcm-hm" aria-hidden="true" style="display:none;">
            <td colspan="2">
              <div class="expand-content">
                <a class="expand-item" href="./assets/pdf/about/2025_MCM_Problem_B_Results.pdf" download aria-label="Download PDF">
                  <img src="./assets/images/about/Honorable_Mention.jpg" alt="Honorable Mention, MCM">
                </a>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Research Experience</h2>
        <div class="subheading">
          <span class="subheading-title">Choice Model Inequalities and Marginal Distribution Models</span>
          <span>Jul. 2026 -- Present</span>
        </div>
        <div class="subsubheading">
          <div>Advisor:</div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://cde.nus.edu.sg/isem/staff/li-xiaobo/" target="_blank" rel="noopener noreferrer">Prof. Xiaobo Li</a></strong> (<a class="resume-link" href="https://cde.nus.edu.sg/isem/" target="_blank" rel="noopener noreferrer">Department of Industrial Systems Engineering and Management, National University of Singapore</a>)</div>
          </div>
        </div>
        <ul>
          <li>TBA.</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">Demand Information Sharing with Inequality-Averse Consumers</span>
          <span>Jul. 2025 -- Present</span>
        </div>
        <div class="subsubheading">
          <div>Advisors:</div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://sites.google.com/site/yiminyu/" target="_blank" rel="noopener noreferrer">Prof. Yimin Yu</a></strong> (<a class="resume-link" href="https://www.cb.cityu.edu.hk/dao/" target="_blank" rel="noopener noreferrer">Department of Decision Analytics & Operations, City University of Hong Kong</a>)</div>
            <div><strong><a class="resume-link" href="https://www.ln.edu.hk/mkt/faculty-staff/staff-list/wang-qian" target="_blank" rel="noopener noreferrer">Prof. Qian Wang</a></strong> (<a class="resume-link" href="https://www.ln.edu.hk/mkt" target="_blank" rel="noopener noreferrer">Department of Marketing & International Business, Lingnan University</a>)</div>
          </div>
        </div>
        <ul>
          <li>Formulated a Bayesian manufacturer-retailer pricing/signaling model with demand-forecast uncertainty and inequality-averse consumers, and solved Perfect Bayesian equilibria refined by the least-misleading sequential equilibrium (LMSE) criterion.</li>
          <li>Derived closed-form pooling and separating wholesale-price policies and profit expressions across no-sharing and retailer-sharing regimes.</li>
          <li>Established payoff equivalence between voluntary and mandatory information sharing, and characterized comparative statics showing how belief specifications (passive vs. linear) and inequality aversion reshape channel performance.</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">Monopoly Firm's Bilateral Game Under Ship-then-Shop (STS) and Traditional Business Models</span>
          <span>Sep. 2024 -- Aug. 2025</span>
        </div>
        <div class="subsubheading">
          <div>Advisors:</div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://bs.ustc.edu.cn/chinese/profile-329.html" target="_blank" rel="noopener noreferrer">Prof. Xiaobei Shen</a></strong> (<a class="resume-link" href="https://business.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">School of Management, University of Science and Technology of China</a>)</div>
            <div><strong><a class="resume-link" href="https://bs.ustc.edu.cn/chinese/profile-2329.html" target="_blank" rel="noopener noreferrer">Dr. Jiancheng Lyu</a></strong> (<a class="resume-link" href="https://business.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">School of Management, University of Science and Technology of China</a>)</div>
          </div>
        </div>
        <ul>
          <li>Formulated a bilateral channel-selection game comparing a traditional channel with a Ship-then-Shop (STS) channel for a monopolistic firm, incorporating subscription, search, and return costs.</li>
          <li>Characterized the firm's optimal pricing and proved that showrooming does not arise in equilibrium, even after relaxing assumptions on consumer type awareness and the distributions of consumer types and return costs.</li>
        </ul>
      </div>

      <div class="section">
        <h2>Teaching Experience</h2>
        <div class="subheading">
          <span class="subheading-title">Teaching Assistant, "Mathematical Analysis B1"</span>
          <span>Sep. 2026 -- Jan. 2027</span>
        </div>
        <div class="subsubheading">
          <div>Instructor:</div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://faculty.ustc.edu.cn/mingminzhang/zh_CN/index.htm" target="_blank" rel="noopener noreferrer">Prof. Mingmin Zhang</a></strong> (<a class="resume-link" href="https://math.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">School of Mathematical Sciences, University of Science and Technology of China</a>)</div>
          </div>
        </div>
        <ul>
          <li>TBA.</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">Teaching Assistant, "Machine Learning B"</span>
          <span>Mar. 2026 -- Jul. 2026</span>
        </div>
        <div class="subsubheading">
          <div>Instructor:</div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://faculty.ustc.edu.cn/xiaoli" target="_blank" rel="noopener noreferrer">Prof. Li Xiao</a></strong> (<a class="resume-link" href="https://sist.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">School of Information Science & Technology, University of Science and Technology of China</a>)</div>
          </div>
        </div>
        <ul>
          <li>
            Expanded upon the material learned in "Machine Learning A" and the textbook compiled by Prof. Jie Wang, helping students strengthen the mathematical foundations relevant to machine learning:
            <a
              class="expand-action-btn"
              href="https://github.com/Stardust-math/Machine_Learning_B"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>
              <span>Repo</span>
            </a>
          </li>
          <li>Assisted in homework and exam grading, provided feedback and tutoring, and held weekly problem-solving sessions to answer questions and help students prepare for exams.</li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">Teaching Assistant, "Probability Theory and Mathematical Statistics"</span>
          <span>Sep. 2025 -- Jan. 2026</span>
        </div>
        <div class="subsubheading">
          <div>Instructor:</div>
          <div class="resume-advisor-list">
            <div><strong><a class="resume-link" href="https://bs.ustc.edu.cn/chinese/profile-97.html" target="_blank" rel="noopener noreferrer">Prof. Shuguang Zhang</a></strong> (<a class="resume-link" href="https://business.ustc.edu.cn/main.htm" target="_blank" rel="noopener noreferrer">School of Management, University of Science and Technology of China</a>)</div>
          </div>
        </div>
        <ul>
          <li>
            Compiled detailed LaTeX solutions and reference answers based on the textbook by Baiqi Miao and Weiping Zhang; maintained an open-source repository for students:
            <a
              class="expand-action-btn"
              href="https://github.com/Stardust-math/Reference-Answer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="btn-ico" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>
              <span>Repo</span>
            </a>
          </li>
          <li>Assisted in homework and exam grading, providing feedback and tutoring. Held weekly problem-solving sessions to answer questions and help students prepare for exams.</li>
        </ul>
      </div>

      <div class="section">
        <h2>Selected Coursework Projects</h2>

        <div class="subheading">
          <span class="subheading-title">
            Metro Route Planning via Weighted Graph Modeling and Incremental System Enhancement
          </span>
        </div>

        <ul>
          <li>
            This project studies metro route planning under a weighted-graph formulation and extends the original teaching template into a complete system with shortest-path computation, improved graphical interaction, and a transfer-aware routing extension.
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
                <span>Page</span>
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
                <span>Code</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            A Progressive RPCA Framework for Image Restoration: From Basic Decomposition to Masked Completion
          </span>
        </div>

        <ul>
          <li>
            This project studies image restoration through a progressive RPCA framework, starting from basic low-rank and sparse decomposition and extending to color processing, enhanced graphical interaction, TV-regularized recovery, and masked completion.
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
                <span>Page</span>
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
                <span>Code</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            Curve Fitting by Interpolation, Approximation, and Fourier Reconstruction
          </span>
        </div>

        <ul>
          <li>
            This project studies planar curve reconstruction from sampled points by combining local interpolation, global approximation, and truncated Fourier reconstruction for periodic closed contours. The experiments compare cubic Hermite interpolation, cubic B-spline interpolation, polynomial least-squares fitting, and B-spline least-squares fitting under different parameterizations, node densities, and noise levels.
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
                <span>Page</span>
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
                <span>Code</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            Periodic Outbreaks in Compartmental Epidemic Models
          </span>
        </div>

        <ul>
          <li>
            This project studies recurrent epidemic outbreaks through SIR-type compartmental models. Starting from the basic SIR model, it extends the system with demographic renewal, seasonal transmission forcing, and stochastic Gillespie simulation to explain single outbreaks, recurrent peaks, seasonal epidemic patterns, and early fade-out.
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
                <span>Page</span>
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
                <span>Code</span>
              </a>
            </div>
          </li>
        </ul>

        <div class="subheading">
          <span class="subheading-title">
            Free Riding Under Pressure: A Dynamic Stock–Pressure Model for Public-Good Governance
          </span>
        </div>

        <ul>
          <li>
            This project studies free riding in dynamic public-good provision through a simulation-based Dynamic Stock–Pressure Free-Riding framework. It links heterogeneous agents, contribution incentives, public-good stock, maintenance pressure, demand feedback, capacity saturation, and policy intervention, then compares Nash-style individual rationality with a stage-wise social-planner benchmark and evaluates subsidy, penalty, reputation, matching fund, threshold governance, and portfolio policies under controlled synthetic scenarios.
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
                <span>Page</span>
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
                <span>Code</span>
              </a>
            </div>
          </li>
        </ul>
      </div>

      <div class="section">
        <h2>Additional Information</h2>
        <ul>
          <li>
            <strong>Technical Skills:</strong>
            <ul>
              <li>Programming: Python (proficient), C (proficient), Mathematica (proficient)</li>
              <li>Tools: LaTeX (advanced), Visio, Adobe Illustrator, Adobe Photoshop</li>
            </ul>
          </li>
          <li>
            <strong>Languages:</strong> Mandarin (Native), English (Fluent--Toefl: Reading 28, Listening 24, Speaking 24, Writing 27)
          </li>
        </ul>
      </div>

    <a href="#" class="back-btn" id="resume-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
  `;
})();