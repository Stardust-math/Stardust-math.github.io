(function () {
  const LANG = { EN: "en", ZH: "zh" };

  function normalizeLang(v) {
    const s = String(v || "").toLowerCase();
    return (s === "zh" || s.startsWith("zh")) ? LANG.ZH : LANG.EN;
  }

  function getCurrentLang() {
    return normalizeLang((document.body && document.body.dataset && document.body.dataset.lang) || LANG.EN);
  }

  // ====== 手动维护：课程中文名 (按课程号优先匹配) ======
  const COURSE_NAME_ZH_BY_CODE = {
    "001046.01": "数值分析",
    "001108.01": "数学实验",
    "001125.01": "数值代数",
    "001139.01": "数学建模",
    "001356.02": "代数学基础",
    "001361.01": "符号计算软件",
    "001702.01": "实分析 (H)",
    "001M06.01": "计算机图形学前沿",
    "006196.01": "多媒体技术基础",
    "011044.02": "计算机导论",
    "011103.02": "代数结构",
    "011144.04": "计算机网络",
    "011145.02": "计算机组成原理",
    "011174.01": "操作系统原理与设计",
    "011187.01": "数据隐私的方法伦理和实践",
    "210706.01": "脑与认知科学导论",
    "AI3001.02": "机器学习 A",
    "BIO1509G.02": "人体微生物与健康",
    "CS1001A.11": "计算机程序设计 A",
    "CS2002.03": "数理逻辑基础",
    "CS2502A.01": "数据结构 A",
    "CS4017.01": "最优化导论",
    "CS4018.01": "量子计算与机器学习",
    "EDUS1001.33": "劳动教育",
    "EE3502.01": "机器学习 B",
    "ESS1513.01": "气象与摄影",
    "FL1003.25": "英语交流 I",
    "FL1004.06": "英语交流 II",
    "FL1005.23": "英语读写 I",
    "FL1006.07": "英语读写 II",
    "FL1502.01": "英语口语沟通 (基础)",
    "FS1001.48": "\"科学与社会\"研讨课",
    "FS1001.6C": "\"科学与社会\"研讨课",
    "HS1003.10": "艺术实践",
    "HS1523.01": "科学之美",
    "HS1524.01": "物理学思想史",
    "HS1531.06": "大学生心理学",
    "HS1534.03": "社会心理学",
    "HS1590.01": "中国纸墨笔砚",
    "HS1648.01": "生活中的公共事务",
    "MATH1001.01": "数学分析(A1)",
    "MATH1002.02": "数学分析(A2)",
    "MATH1003.01": "数学分析(A3)",
    "MATH1004.01": "线性代数(A1)",
    "MATH1005.01": "线性代数(A2)",
    "MATH1006.10": "数学分析(B1)",
    "MATH2002.02": "几何学基础",
    "MATH2801.01": "数学强基讨论班 I",
    "MATH2802.01": "数学强基讨论班 II",
    "MATH3004.01": "泛函分析",
    "MATH3007.02": "概率论",
    "MATH3008.01": "复分析",
    "MATH3011.01": "运筹学",
    "MATH3012.02": "微分方程引论",
    "MATH4003.01": "数学前沿课程",
    "MARX1005.18": "思想政治理论课实践",
    "MARX1006.05": "形势与政策",
    "MARX1010.11": "中国近现代史纲要",
    "MARX1011.11": "马克思主义基本原理",
    "MARX1012.06": "思想道德与法治",
    "MARX1013.02": "毛泽东思想和中国特色社会主义理论体系概论",
    "MARX1014.08": "习近平新时代中国特色社会主义思想概论",
    "MARX1503.01": "改革开放史",
    "MIL1001.05": "军事理论",
    "MIL1002.05": "军事技能",
    "MNSC4004.01": "社交媒体分析",
    "PE00001.36": "基础体育",
    "PE00127.06": "游泳",
    "PE00130w.01": "散打 I",
    "PE00139.06": "拓展训练 II",
    "PHYS1001B.09": "力学 B",
    "PHYS1002B.09": "热学 B",
    "PHYS1003B.14": "光学 B",
    "PHYS1004B.02": "电磁学 B",
    "PHYS1005B.02": "原子物理 B",
    "PHYS1008B.08": "大学物理基础实验 B",
    "PHYS1009B.04": "大学物理综合实验 B",
    "STAT2002.06": "概率论与数理统计",
  };

  // 作为兜底：按英文课程名匹配
  const COURSE_NAME_ZH_BY_TEXT = {
    "Advances in Computer Graphics": "计算机图形学前沿",
    "AI Ethics and Security (AI+X Micro-minor Foundation Course)": "人工智能伦理与安全 (AI+X 微专业基础课程)",
    "Algebraic Structure": "代数结构",
    "An Outline of Modern and Contemporary Chinese History": "中国近现代史纲要",
    "Art Practice": "艺术实践",
    "Artificial Intelligence and Scientific Computing (AI+X Micro-minor Core Course)": "人工智能与科学计算 (AI+X 微专业核心课程)",
    "Atomic Physics B": "原子物理 B",
    "Basic Sports": "基础体育",
    "College Physics - Base Experimentation B": "大学物理基础实验 B",
    "College Physics - Comprehensive Experimentation B": "大学物理综合实验 B",
    "Collegiate Psychology": "大学生心理学",
    "Complex Variable": "复分析",
    "Computer Networks": "计算机网络",
    "Computer Organization": "计算机组成原理",
    "Computer Programming A": "计算机程序设计 A",
    "Data Structures A": "数据结构 A",
    "Electromagnetism B": "电磁学 B",
    "Elementary Seminar for Qiangji Class I": "数学强基讨论班 I",
    "Elementary Seminar for Qiangji Class II": "数学强基讨论班 II",
    "English Communication I": "英语交流 I",
    "English Communication II": "英语交流 II",
    "English Oral Practice (Elementary)": "英语口语沟通 (基础)",
    "English Reading & Writing I": "英语读写 I",
    "English Reading & Writing II": "英语读写 II",
    "Foundation of Algebra": "代数学基础",
    "Foundations of Geometry": "几何学基础",
    "Four Treasures of the Study: Chinese Paper, Ink, Pen and Inkstone": "中国纸墨笔砚",
    "Free Combat I": "散打 I",
    "Freshman Seminar": "\"科学与社会\"研讨课",
    "Functional Analysis": "泛函分析",
    "Fundamentals of Marxism": "马克思主义基本原理",
    "Fundamentals of Multimedia Technology": "多媒体技术基础",
    "Game Artificial Intelligence Practice (AI+X Micro-minor Practical Course)": "游戏人工智能实践 (AI+X 微专业实践课程)",
    "History of Mind in Physics": "物理学思想史",
    "History of Reform and Open-up": "改革开放史",
    "Ideology, Morality, and Rule of Law": "思想道德与法治",
    "Introduction to Artificial Intelligence (AI+X Micro-minor Foundation Course)": "人工智能导论 (AI+X 微专业基础课程)",
    "Introduction to Brain and Cognition Science": "脑与认知科学导论",
    "Introduction to Computer Science": "计算机导论",
    "Introduction to Differential Equations": "微分方程引论",
    "Introduction to Frontiers in Mathematics": "数学前沿课程",
    "Introduction to Mao Zedong Thought and Theoretical System of Socialism with Chinese Characteristics": "毛泽东思想和中国特色社会主义理论体系概论",
    "Introduction to Optimization": "最优化导论",
    "Introduction to Xi Jinping Thought on Socialism with Chinese Characteristics for a New Era": "习近平新时代中国特色社会主义思想概论",
    "Labor Education": "劳动教育",
    "Large Model Architecture and Practical Application of Multi-modal Technologies (AI+X Micro-minor Practical Course)": "大模型架构与多模态应用实战 (AI+X 微专业实践课程)",
    "Life Science: Human Microbiota and Health": "人体微生物与健康",
    "Linear Algebra A1": "线性代数(A1)",
    "Linear Algebra A2": "线性代数(A2)",
    "Machine Learning A": "机器学习 A",
    "Machine Learning B": "机器学习 B",
    "Mathematical Analysis A1": "数学分析(A1)",
    "Mathematical Analysis A2": "数学分析(A2)",
    "Mathematical Analysis A3": "数学分析(A3)",
    "Mathematical Analysis B1": "数学分析(B1)",
    "Mathematical Experiments": "数学实验",
    "Mathematical Foundations of AI (AI+X Micro-minor Foundation Course)": "人工智能数学基础 (AI+X 微专业基础课程)",
    "Mathematical Logic": "数理逻辑基础",
    "Mathematical Modeling": "数学建模",
    "Mathematical Software": "符号计算软件",
    "Mechanics B": "力学 B",
    "Meteorology and Photography": "气象与摄影",
    "Methodology, Ethics and Practice of Data privacy": "数据隐私的方法伦理和实践",
    "Military Skills": "军事技能",
    "Military Theory": "军事理论",
    "Natural Language Processing (AI+X Micro-minor Core Course)": "自然语言处理 (AI+X 微专业核心课程)",
    "Numerical Algebra": "数值代数",
    "Numerical Analysis": "数值分析",
    "Operating System": "操作系统原理与设计",
    "Operations Research": "运筹学",
    "Optics B": "光学 B",
    "Outward Development II": "拓展训练 II",
    "Practice on Chinese Important Thoughts": "思想政治理论课实践",
    "Probability Theory": "概率论",
    "Probability Theory and Mathematical Statistics": "概率论与数理统计",
    "Public Affairs in Life": "生活中的公共事务",
    "Quantum Computing and Machine Learning": "量子计算与机器学习",
    "Real Analysis (H)": "实分析 (H)",
    "Situation and Policy": "形势与政策",
    "Social Media Analytics": "社交媒体分析",
    "Social Psychology": "社会心理学",
    "Swimming": "游泳",
    "The Beauty of Science": "科学之美",
    "Thermotics B": "热学 B",
  };

  // ====== 手动维护：教师中文名 ======
  const INSTRUCTOR_ZH_BY_TOKEN = {
    "Ao Li": "李骜",
    "Biao Chen": "陈彪",
    "Bin Qian": "钱斌",
    "Cheng Chen": "陈澄",
    "Chen Zhao": "赵晨",
    "Chunhui Zhou": "周春辉",
    "Chunkai Xu": "徐春凯",
    "Congwen Liu": "刘聪文",
    "Da Li": "李达",
    "Dafeng Zuo": "左达峰",
    "Dangzheng Liu": "刘党政",
    "Dongqing Wang": "王冬青",
    "Falai Chen": "陈发来",
    "Fei Wu": "吴飞",
    "Guangbin Ren": "任广斌",
    "Guangzhong Sun": "孙广中",
    "Guimin Fan": "樊桂敏",
    "Guorong Zhang": "张国荣",
    "Hailong Liu": "刘海龙",
    "Hao Ding": "丁浩",
    "Hao Zhou": "周颢",
    "Hongli Xu": "徐宏力",
    "Hu Si": "司虎",
    "Huping Shang": "尚虎平",
    "Jianliang Lu": "卢建良",
    "Jinlong Li": "李金龙",
    "Jun Si": "斯骏",
    "Junfei Dai": "戴俊飞",
    "Junxia Zhang": "张俊霞",
    "Junyan Zhang": "章俊彦",
    "Lan Zhang": "张兰",
    "Lei Zhang": "张磊",
    "Li Tang": "唐莉",
    "Li Xiao": "肖力",
    "Liang Wan": "万亮",
    "Lifeng Zhao": "赵立峰",
    "Ligang Liu": "刘利刚",
    "Liming Ma": "马立明",
    "Liucheng Duan": "段柳成",
    "Luo Luo": "罗罗",
    "Muxi Li": "李沐西",
    "Ming Gong": "龚明",
    "Mingmin Zhang": "张明敏",
    "Na Zhang": "张娜",
    "Nenghai Yu": "俞能海",
    "Nick": "尼克",
    "Null": "无",
    "Peijun Yao": "姚培军",
    "Qi Cheng": "程琪",
    "Renjie Chen": "陈仁杰",
    "Rongde Lu": "卢荣德",
    "Rujing Zha": "查汝晶",
    "Runze Wu": "吴润泽",
    "Shanyong Wang": "王善勇",
    "Shixiang Chen": "陈士祥",
    "Shu Zhu": "朱书",
    "Shuguang Zhang": "张曙光",
    "Shukun Tang": "汤书昆",
    "Siliang Tang": "汤斯亮",
    "Simin Li": "李思敏",
    "Tao Wang": "汪滔",
    "Thomas Yifang Xiao": "肖一方",
    "Wei Yang": "杨威",
    "Wen Zeng": "曾文",
    "Xizhi Liu": "刘西之",
    "Xianglan Chen": "陈香兰",
    "Xiao Han": "韩笑",
    "Xiaobei Shen": "沈晓蓓",
    "Xiaochu Zhang": "张效初",
    "Xiaohua Xu": "徐小华",
    "Xiaohui Chen": "陈晓辉",
    "Xiaojun Chang": "常晓军",
    "Xiaoya Zhai": "翟晓雅",
    "Xinan Ma": "麻希南",
    "Xinmao Wang": "王新茂",
    "Xu Zhang": "张旭",
    "Xuan Liu": "刘暄",
    "Xuxin Hu": "虎旭昕",
    "Yan Liang": "梁琰",
    "Yan Xu": "徐岩",
    "Yanan Zhao": "赵雅楠",
    "Yanen Fan": "樊彦恩",
    "Yangyang Fan": "樊洋洋",
    "Yanzhi Song": "宋艳枝",
    "Yi Li": "李毅",
    "Yi Xie": "谢羿",
    "Yi Zhou": "周熠",
    "Ying Wei": "魏颖",
    "Yingqiu Yang": "杨映秋",
    "Yinhua Xia": "夏银华",
    "Yong Wang": "王永",
    "Yuchen Liao": "廖羽晨",
    "Yumeng Liu": "刘雨萌",
    "Yunfei Fu": "傅云飞",
    "Zhihui Li": "李志慧",
    "Zhengxing Huang": "黄正行",
    "Ziqi Yang": "杨子祺",
    "……": "……",
  };

  // ====== 手动维护：地点中文 ======
  const LOCATION_ZH = {
    "East Campus Track Field": "东区操场",
    "West Student Activity Center (2F) Computer Lab": "西活二楼机房",
    "Central Campus Gymnasium": "中区搏击馆",
    "Central Campus Swimming Pool": "中区游泳馆",
    "First Teaching Building": "第一教学楼",
    "West Campus Electrical Building (1F) Computer Lab (Hall 1)": "西区电一楼机房1厅",
    "West Campus Electrical Building (3F) 406, 408": "西区电三楼406、408",
    "West Campus Electrical Building (3F) 406": "西区电三楼406",
  };

  // ====== Course Type (manual; defined in schedule_EN.js) ======
  // Supported EN tokens: Major / Minor / Micro-minor / TA
  const COURSE_TYPE_ZH = {
    "Major": "主修",
    "Minor": "辅修",
    "Micro-minor": "微专业",
    "TA": "助教",
  };

  function normalizeCourseTypeToken(v) {
    const s0 = String(v || "").trim();
    if (!s0) return "";
    const s = s0.toLowerCase();
    if (s === "major") return "Major";
    if (s === "minor") return "Minor";
    if (s === "ta") return "TA";
    if (s === "micro-minor" || s === "microminor" || s === "micro minor" || s === "micro_minor") return "Micro-minor";
    // Fallback: keep original casing (user-defined)
    return s0;
  }

  function getDefaultCourseTypeToken() {
    try {
      const v = (window && window.SCHEDULE_DEFAULT_COURSE_TYPE) ? window.SCHEDULE_DEFAULT_COURSE_TYPE : "Major";
      return normalizeCourseTypeToken(v) || "Major";
    } catch (e) {
      return "Major";
    }
  }

  function getCourseTypeByKey(key) {
    try {
      const map = (window && window.SCHEDULE_COURSE_TYPE_BY_KEY && typeof window.SCHEDULE_COURSE_TYPE_BY_KEY === "object")
        ? window.SCHEDULE_COURSE_TYPE_BY_KEY
        : null;
      if (map && key && Object.prototype.hasOwnProperty.call(map, key)) {
        return normalizeCourseTypeToken(map[key]);
      }
    } catch (e) { }
    return "";
  }

  function getSemesterIdForNode(node) {
    try {
      const sem = node && node.closest ? node.closest(".semester-timetable-container") : null;
      return (sem && sem.id) ? sem.id : "";
    } catch (e) {
      return "";
    }
  }

  function buildCourseTypeKey(node, courseCode) {
    const semId = getSemesterIdForNode(node) || "unknown";
    const code = String(courseCode || "").trim();
    return `${semId}|${code}`;
  }

  // Resolve course type with priority:
  // 1) data-course-type on the instance node (block/tr/cell)
  // 2) global map in schedule_EN.js (window.SCHEDULE_COURSE_TYPE_BY_KEY)
  // 3) global default (window.SCHEDULE_DEFAULT_COURSE_TYPE, default "Major")
  function resolveCourseTypeToken(primaryNode, secondaryNode, courseCode) {
    const direct1 = normalizeCourseTypeToken(primaryNode && primaryNode.dataset ? primaryNode.dataset.courseType : "");
    if (direct1) return direct1;

    const direct2 = normalizeCourseTypeToken(secondaryNode && secondaryNode.dataset ? secondaryNode.dataset.courseType : "");
    if (direct2) return direct2;

    const byKey = getCourseTypeByKey(buildCourseTypeKey(primaryNode || secondaryNode, courseCode));
    if (byKey) return byKey;

    return getDefaultCourseTypeToken();
  }

  function findCourseNumberLikeElement(block) {
    if (!block || !block.querySelector) return null;
    const cn = block.querySelector(".course-number");
    if (cn) return cn;

    // Fallback: some overlap blocks might accidentally use ".course-name" to store the course number
    const firstName = block.querySelector(".course-name");
    if (firstName) {
      const txt = String(firstName.textContent || "").trim();
      if (/^[A-Za-z]{0,8}\d{3,8}[A-Za-z]?\./.test(txt) || /^[A-Za-z]{0,8}\d{3,8}[A-Za-z]?\b/.test(txt)) {
        return firstName;
      }
    }
    return null;
  }

  function setBadgeText(badgeEl, enToken, lang) {
    const token = normalizeCourseTypeToken(enToken) || getDefaultCourseTypeToken();
    badgeEl.dataset.enText = token;
    badgeEl.dataset.type = token;
    badgeEl.textContent = (normalizeLang(lang) === LANG.ZH) ? (COURSE_TYPE_ZH[token] || token) : token;
  }

  function ensureCourseTypeBadgeInCourseBlock(block, courseCode, lang) {
    const holder = findCourseNumberLikeElement(block);
    if (!holder) return;

    const token = resolveCourseTypeToken(block, holder, courseCode);

    let badge = holder.querySelector(".course-type-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "course-type-badge";
      holder.appendChild(document.createTextNode(" "));
      holder.appendChild(badge);
    }
    setBadgeText(badge, token, lang);
  }

  function ensureCourseTypeBadgeInMyClassesCell(courseNumberCell, courseCode, lang) {
    if (!courseNumberCell) return;
    const token = resolveCourseTypeToken(courseNumberCell.closest("tr"), courseNumberCell, courseCode);

    let badge = courseNumberCell.querySelector(".course-type-badge");
    if (!badge) {
      // Rebuild only the first column to keep it clean: "CODE  [badge]"
      const code = String(courseCode || "").trim() || getCourseCodeFromCourseNumberText(courseNumberCell.textContent || "");
      courseNumberCell.innerHTML = "";
      const codeSpan = document.createElement("span");
      codeSpan.className = "course-code";
      codeSpan.textContent = code;
      courseNumberCell.appendChild(codeSpan);
      courseNumberCell.appendChild(document.createTextNode(" "));
      badge = document.createElement("span");
      badge.className = "course-type-badge";
      courseNumberCell.appendChild(badge);
    }
    setBadgeText(badge, token, lang);
  }


  function getCourseCodeFromCourseNumberText(courseNumberText) {
    const s = String(courseNumberText || "").trim();
    if (!s) return "";
    return s.split(/\s+/)[0] || "";
  }

  function getZhCourseName(courseCode, enName) {
    const code = String(courseCode || "").trim();
    const en = String(enName || "").trim();
    return COURSE_NAME_ZH_BY_CODE[code] || COURSE_NAME_ZH_BY_TEXT[en] || en;
  }

  function translateInstructorNameTokenToZh(token) {
    const raw = String(token || "");
    if (!raw.trim()) return raw;

    const leading = raw.match(/^\s*/)[0] || "";
    const trailing = raw.match(/\s*$/)[0] || "";
    const coreWithPunct = raw.trim();

    // Keep ending punctuation in the rendered text, but ignore it for lookup.
    const punctMatch = coreWithPunct.match(/([.。]+)$/);
    const punct = punctMatch ? punctMatch[1] : "";
    const lookupToken = punct
      ? coreWithPunct.slice(0, -punct.length).trim()
      : coreWithPunct;

    const mapped = INSTRUCTOR_ZH_BY_TOKEN[lookupToken];

    if (!mapped) {
      return raw;
    }

    return `${leading}${mapped}${punct}${trailing}`;
  }

  function translateInstructorToZh(enText) {
    const raw = String(enText || "");
    if (!raw.trim()) return raw;

    // Preserve the original delimiters and punctuation, e.g. "," / ";" / ".".
    return raw
      .split(/([,;]\s*)/)
      .map(part => (/^[,;]\s*$/.test(part) ? part : translateInstructorNameTokenToZh(part)))
      .join("")
      .trim();
  }

  function translateLocationToZh(enText) {
    const raw = String(enText || "").trim();
    if (!raw) return raw;
    return LOCATION_ZH[raw] || raw;
  }

  function transformWeeksToZh(enWeeksText) {
    let s = String(enWeeksText || "").trim();
    if (!s) return s;

    // e.g. "2-4, 6-18 week(s)" -> "第2-4、6-18周";
    //      "2-16 (even) week(s)" -> "第2-16（双）周";
    //      "1-15 (odd) week(s)" -> "第1-15（单）周"
    s = s.replace(/\(\s*odd\s*\)/gi, "（单）");
    s = s.replace(/\(\s*even\s*\)/gi, "（双）");
    s = s.replace(/\bodd\b/gi, "单");
    s = s.replace(/\beven\b/gi, "双");
    s = s.replace(/week\(s\)/gi, "");
    s = s.replace(/\s+/g, " ");
    s = s.replace(/\s*,\s*/g, "、");
    s = s.replace(/\s*;\s*/g, "；");
    s = s.replace(/\s*（/g, "（").replace(/）\s*/g, "）");

    return `第${s}周`;
  }

  function transformTimeHtmlToZh(enHtml) {
    let s = String(enHtml || "");

    // e.g. "5(5), 2-16 (even) week(s)" -> "5(5), 2-16（双）周"
    s = s.replace(/Null/gi, "无");
    s = s.replace(/\(\s*odd\s*\)/gi, "（单）");
    s = s.replace(/\(\s*even\s*\)/gi, "（双）");
    s = s.replace(/\bodd\b/gi, "单");
    s = s.replace(/\beven\b/gi, "双");
    s = s.replace(/week\(s\)/gi, "周");
    s = s.replace(/weeks\b/gi, "周");
    s = s.replace(/week\b/gi, "周");
    s = s.replace(/;\s*/g, "；");
    s = s.replace(/\s*（/g, "（").replace(/）\s*/g, "）");

    return s;
  }

  function storeIfEmptyDataset(el, key, value) {
    if (!el || !el.dataset) return;
    if (el.dataset[key] == null) {
      el.dataset[key] = value;
    }
  }

  function applyMyTimetableLanguage(lang) {
    const l = normalizeLang(lang);
    const root = document.getElementById("my-timetable-section");
    if (!root) return false;

    // ---- 1) Timetable cells (supports overlap layouts) ----
    const courseBlocks = root.querySelectorAll(".course-container, .overlap-course");
    courseBlocks.forEach(block => {
      let courseCode = "";
      try {
        const courseNumberEl =
          block.querySelector(".course-number") ||
          (block.closest("td") ? block.closest("td").querySelector(".course-number") : null) ||
          (block.closest(".course-container") ? block.closest(".course-container").querySelector(".course-number") : null);
        courseCode = getCourseCodeFromCourseNumberText(courseNumberEl ? courseNumberEl.textContent : "");
      } catch (e) {
        courseCode = "";
      }

      // ---- [NEW] Course type badge (default: Major) ----
      try {
        ensureCourseTypeBadgeInCourseBlock(block, courseCode, l);
      } catch (e) { }

      const nameEl = block.querySelector(".course-name");
      if (nameEl) {
        storeIfEmptyDataset(nameEl, "enText", nameEl.textContent);
        nameEl.textContent = (l === LANG.ZH) ? getZhCourseName(courseCode, nameEl.dataset.enText) : nameEl.dataset.enText;
      }

      const instructorEl = block.querySelector(".instructor");
      if (instructorEl) {
        storeIfEmptyDataset(instructorEl, "enText", instructorEl.textContent);
        instructorEl.textContent = (l === LANG.ZH) ? translateInstructorToZh(instructorEl.dataset.enText) : instructorEl.dataset.enText;
      }

      const locationEl = block.querySelector(".location");
      if (locationEl) {
        storeIfEmptyDataset(locationEl, "enText", locationEl.textContent);
        locationEl.textContent = (l === LANG.ZH) ? translateLocationToZh(locationEl.dataset.enText) : locationEl.dataset.enText;
      }

      const weeksEl = block.querySelector(".weeks");
      if (weeksEl) {
        storeIfEmptyDataset(weeksEl, "enText", weeksEl.textContent);
        weeksEl.textContent = (l === LANG.ZH) ? transformWeeksToZh(weeksEl.dataset.enText) : weeksEl.dataset.enText;
      }
    });

    // ---- 2) "My Classes" table content ----
    root.querySelectorAll(".my-classes-table tbody tr").forEach(tr => {
      const cells = tr.querySelectorAll("td");
      if (!cells || cells.length < 5) return;

      // Course number (col 1)
      const courseNumberCell = cells[0];
      storeIfEmptyDataset(courseNumberCell, "enText", courseNumberCell.textContent.trim());
      const courseCode = getCourseCodeFromCourseNumberText(courseNumberCell.dataset.enText);

      // ---- [NEW] Course type badge (default: Major) ----
      try {
        ensureCourseTypeBadgeInMyClassesCell(courseNumberCell, courseCode, l);
      } catch (e) { }


      // Course name (col 2)
      const nameCell = cells[1];
      if (nameCell) {
        storeIfEmptyDataset(nameCell, "enHtml", nameCell.innerHTML);
        if (l === LANG.ZH) {
          const tmp = document.createElement('div');
          tmp.innerHTML = nameCell.dataset.enHtml;

          const enNameText = (tmp.textContent || '').trim();
          const zhName = getZhCourseName(courseCode, enNameText);

          const creditSpan = tmp.querySelector('span.credits-inline');
          const creditHtml = creditSpan ? creditSpan.outerHTML : '';

          nameCell.innerHTML = `${zhName}${creditHtml}`;
        } else {
          nameCell.innerHTML = nameCell.dataset.enHtml;
        }
      }

      // Instructor (col 3)
      const instCell = cells[2];
      if (instCell) {
        storeIfEmptyDataset(instCell, "enHtml", instCell.innerHTML);

        if (l === LANG.ZH) {
          const tmp = document.createElement('div');
          tmp.innerHTML = instCell.dataset.enHtml || instCell.innerHTML;
          const enInstText = (tmp.textContent || '').trim();
          instCell.textContent = translateInstructorToZh(enInstText);
        } else {
          instCell.innerHTML = instCell.dataset.enHtml;
        }
      }

      // Time (col 4)
      const timeCell = cells[3];
      if (timeCell) {
        storeIfEmptyDataset(timeCell, "enHtml", timeCell.innerHTML);
        timeCell.innerHTML = (l === LANG.ZH) ? transformTimeHtmlToZh(timeCell.dataset.enHtml) : timeCell.dataset.enHtml;
      }
    });

    // ---- 3) Static UI texts (semester dropdown / titles / table headers) ----
    const SEMESTER_ZH = {
      "freshman-first": "大一上（23秋）",
      "freshman-second": "大一下（24春）",
      "freshman-summer": "大一暑假（24夏）",
      "sophomore-first": "大二上（24秋）",
      "sophomore-second": "大二下（25春）",
      "sophomore-summer": "大二暑假（25夏）",
      "junior-first": "大三上（25秋）",
      "junior-second": "大三下（26春）",
      "junior-summer": "大三暑假（26夏）",
      "senior-first": "大四上（26秋）",
      "senior-second": "大四下（27春）",
    };

    // Dropdown button label
    const ddBtn = root.querySelector(".semester-dropdown-btn");
    if (ddBtn) {
      storeIfEmptyDataset(ddBtn, "enHtml", ddBtn.innerHTML);
      ddBtn.innerHTML = (l === LANG.ZH)
        ? `选择学期 <i class="fas fa-caret-down"></i>`
        : ddBtn.dataset.enHtml;
    }

    // Dropdown options
    root.querySelectorAll(".semester-dropdown-content a[data-semester]").forEach(a => {
      storeIfEmptyDataset(a, "enText", a.textContent);
      const sid = a.dataset.semester;
      if (l === LANG.ZH) {
        a.textContent = SEMESTER_ZH[sid] || a.dataset.enText;
      } else {
        a.textContent = a.dataset.enText;
      }
    });

    // Semester titles
    root.querySelectorAll(".semester-timetable-container").forEach(container => {
      const h3 = container.querySelector(".semester-title");
      if (!h3) return;
      storeIfEmptyDataset(h3, "enText", h3.textContent);
      const sid = container.id;
      h3.textContent = (l === LANG.ZH) ? (SEMESTER_ZH[sid] || h3.dataset.enText) : h3.dataset.enText;
    });

    // Timetable table headers
    const TH_ZH = {
      "Period": "时段",
      "Period Number": "节次",
      "Period Range": "节次范围",
      "Monday": "周一",
      "Tuesday": "周二",
      "Wednesday": "周三",
      "Thursday": "周四",
      "Friday": "周五",
      "Saturday": "周六",
      "Sunday": "周日",
      "Time": "时间",
    };
    root.querySelectorAll("th").forEach(th => {
      storeIfEmptyDataset(th, "enText", th.textContent.trim());
      const en = th.dataset.enText;
      th.textContent = (l === LANG.ZH) ? (TH_ZH[en] || en) : en;
    });

    // Period section labels
    const PERIOD_ZH = { "Morning": "上午", "Afternoon": "下午", "Evening": "晚上" };
    root.querySelectorAll(".period-header").forEach(td => {
      storeIfEmptyDataset(td, "enText", td.textContent.trim());
      const en = td.dataset.enText;
      td.textContent = (l === LANG.ZH) ? (PERIOD_ZH[en] || en) : en;
    });

    // "My Classes" section title and table headers
    root.querySelectorAll(".my-classes-container h3").forEach(h3 => {
      storeIfEmptyDataset(h3, "enText", h3.textContent.trim());
      h3.textContent = (l === LANG.ZH) ? "我的课程" : h3.dataset.enText;
    });

    const MY_CLASSES_TH_ZH = {
      "Course Number": "课程号",
      "Course Name": "课程名",
      "Instructor": "教师",
      "Time": "时间",
      "Credits": "学分",
    };
    root.querySelectorAll(".my-classes-table thead th").forEach(th => {
      storeIfEmptyDataset(th, "enText", th.textContent.trim());
      const en = th.dataset.enText;
      th.textContent = (l === LANG.ZH) ? (MY_CLASSES_TH_ZH[en] || en) : en;
    });

    return true;
  }

  function applySchedulePageLanguage(lang) {
    const l = normalizeLang(lang);
    const scheduleRoot = document.getElementById("schedule");
    if (!scheduleRoot) return false;

    const switcher = scheduleRoot.querySelector(".schedule-switcher");
    if (switcher) {
      switcher.setAttribute(
        "aria-label",
        (l === LANG.ZH) ? "日程分区" : "Schedule sections"
      );
    }

    // Heading
    const heading = scheduleRoot.querySelector(".schedule-heading");
    if (heading) {
      storeIfEmptyDataset(heading, "enText", heading.textContent.trim());
      heading.textContent = (l === LANG.ZH) ? "我的日程" : heading.dataset.enText;
    }

    // Top switch buttons
    const viewBtnZh = {
      "my-timetable": "我的课表",
      "ustc-timetable": "USTC 课表",
      "timetable": "时间表",
      "calendar": "日历",
    };
    scheduleRoot.querySelectorAll(".schedule-switch-btn").forEach(btn => {
      storeIfEmptyDataset(btn, "enText", btn.textContent.trim());
      const view = btn.dataset.view;
      if (l === LANG.ZH) {
        btn.textContent = viewBtnZh[view] || btn.dataset.enText;
      } else {
        btn.textContent = btn.dataset.enText;
      }
    });

    // Add buttons
    const addTimetableBtn = document.getElementById("add-timetable-event");
    if (addTimetableBtn) {
      storeIfEmptyDataset(addTimetableBtn, "enHtml", addTimetableBtn.innerHTML);
      addTimetableBtn.innerHTML = (l === LANG.ZH) ? '<i class="fas fa-plus"></i> 添加课程/事件' : addTimetableBtn.dataset.enHtml;
    }
    const addCalendarBtn = document.getElementById("add-calendar-event");
    if (addCalendarBtn) {
      storeIfEmptyDataset(addCalendarBtn, "enHtml", addCalendarBtn.innerHTML);
      addCalendarBtn.innerHTML = (l === LANG.ZH) ? '<i class="fas fa-plus"></i> 添加事件' : addCalendarBtn.dataset.enHtml;
    }
    const addUstcBtn = document.getElementById("add-ustc-event");
    if (addUstcBtn) {
      storeIfEmptyDataset(addUstcBtn, "enHtml", addUstcBtn.innerHTML);
      addUstcBtn.innerHTML = (l === LANG.ZH) ? '<i class="fas fa-plus"></i> 添加课程' : addUstcBtn.dataset.enHtml;
    }

    // USTC local-save hint text
    const hint = scheduleRoot.querySelector(".ustc-local-save-hint span");
    if (hint) {
      storeIfEmptyDataset(hint, "enText", hint.textContent.trim());
      hint.textContent = (l === LANG.ZH)
        ? "你的操作会保存在本地，下次打开时会自动恢复。"
        : hint.dataset.enText;
    }

    // Global table headers inside schedule.
    // Do not touch FullCalendar headers inside #calendar-container.
    // FullCalendar owns its own DOM and is already localized through setCalendarLocale().
    const TH_ZH_GLOBAL = {
      "Period": "时段",
      "Period Number": "节次",
      "Period Range": "节次范围",
      "Time": "时间",
      "Monday": "周一",
      "Tuesday": "周二",
      "Wednesday": "周三",
      "Thursday": "周四",
      "Friday": "周五",
      "Saturday": "周六",
      "Sunday": "周日",
      "Course Name": "课程名",
      "Course Number": "课程号",
      "Instructor": "教师",
      "Location": "地点",
      "Weeks": "周次",
      "Days": "星期",
      "Credits": "学分",
      "Actions": "操作",
    };

    scheduleRoot.querySelectorAll("th").forEach(th => {
      if (th.closest("#calendar-container")) return;

      storeIfEmptyDataset(th, "enText", th.textContent.trim());
      const en = th.dataset.enText;
      th.textContent = (l === LANG.ZH) ? (TH_ZH_GLOBAL[en] || en) : en;
    });

    // Period section labels (USTC Timetable)
    const PERIOD_ZH = { "Morning": "上午", "Afternoon": "下午", "Evening": "晚上" };
    scheduleRoot.querySelectorAll("#ustc-timetable-section .period-header").forEach(td => {
      storeIfEmptyDataset(td, "enText", td.textContent.trim());
      const en = td.dataset.enText;
      td.textContent = (l === LANG.ZH) ? (PERIOD_ZH[en] || en) : en;
    });

    // ---- Extra: USTC list / modals / dynamic UI labels ----

    // USTC classes list title
    scheduleRoot.querySelectorAll(".ustc-classes-container h3").forEach(h3 => {
      storeIfEmptyDataset(h3, "enText", h3.textContent.trim());
      h3.textContent = (l === LANG.ZH) ? "课程列表" : h3.dataset.enText;
    });

    // Buttons inside USTC classes list (rendered by Schedule_Function.js)
    const BTN_ZH = { "Edit": "编辑", "Delete": "删除" };
    scheduleRoot.querySelectorAll(".edit-ustc-class, .delete-ustc-class").forEach(btn => {
      storeIfEmptyDataset(btn, "enText", btn.textContent.trim());
      const en = btn.dataset.enText;
      btn.textContent = (l === LANG.ZH) ? (BTN_ZH[en] || en) : en;
    });

    // USTC class modal: labels
    const LABEL_ZH = {
      "Period Start": "开始节次",
      "Period End": "结束节次",
      "Course Name": "课程名",
      "Instructor": "教师",
      "Location": "地点",
      "Credits": "学分",
      "Days": "星期",
      "Teaching Weeks (1-18)": "教学周 (1-18)",
      "Event Title": "事件标题",
      "Description": "描述",
      "Start": "开始时间",
      "End": "结束时间",
      "Recurring Event": "重复事件",
      "Delete": "删除",
      "Cancel": "取消",
      "Save": "保存",
    };

    // Regular labels with "for" attribute
    scheduleRoot.querySelectorAll("#event-modal label[for], #general-event-modal label[for]").forEach(label => {
      storeIfEmptyDataset(label, "enText", label.textContent.trim());
      const en = label.dataset.enText;
      label.textContent = (l === LANG.ZH) ? (LABEL_ZH[en] || en) : en;
    });

    // Days checkbox labels inside USTC modal
    const dayMap = { "Mon": "周一", "Tue": "周二", "Wed": "周三", "Thu": "周四", "Fri": "周五", "Sat": "周六", "Sun": "周日" };
    scheduleRoot.querySelectorAll("#event-modal .days-container > label").forEach(label => {
      storeIfEmptyDataset(label, "enText", label.textContent.trim());
      const en = label.dataset.enText; // e.g. "Mon"
      const input = label.querySelector("input");
      if (!input) return;
      label.innerHTML = "";
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + ((l === LANG.ZH) ? (dayMap[en] || en) : en)));
    });

    // Weeks title
    scheduleRoot.querySelectorAll("#event-modal .weeks-title").forEach(el => {
      storeIfEmptyDataset(el, "enText", el.textContent.trim());
      const en = el.dataset.enText;
      el.textContent = (l === LANG.ZH) ? (LABEL_ZH[en] || en) : en;
    });

    // Recurring checkbox label (General event modal)
    scheduleRoot.querySelectorAll("#general-event-modal #recurring-container label").forEach(label => {
      storeIfEmptyDataset(label, "enText", label.textContent.trim().replace(/\s+/g, " "));
      const input = label.querySelector("input");
      if (!input) return;
      const enToken = "Recurring Event";
      label.innerHTML = "";
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + ((l === LANG.ZH) ? LABEL_ZH[enToken] : enToken)));
    });

    // Modal action buttons
    const btnIds = [
      "event-delete-btn", "event-cancel-btn",
      "general-event-delete-btn", "general-event-cancel-btn"
    ];
    btnIds.forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      storeIfEmptyDataset(btn, "enText", btn.textContent.trim());
      const en = btn.dataset.enText;
      btn.textContent = (l === LANG.ZH) ? (LABEL_ZH[en] || en) : en;
    });
    scheduleRoot.querySelectorAll("#event-modal .event-form-btn-save, #general-event-modal .event-form-btn-save").forEach(btn => {
      storeIfEmptyDataset(btn, "enText", btn.textContent.trim());
      const en = btn.dataset.enText;
      btn.textContent = (l === LANG.ZH) ? (LABEL_ZH[en] || en) : en;
    });

    // Week navigation fallback
    const weekTitle = document.getElementById("current-week");
    if (weekTitle) {
      storeIfEmptyDataset(weekTitle, "enText", weekTitle.textContent);
      if (l === LANG.ZH && /^Week of\b/.test(weekTitle.dataset.enText || "")) {
        weekTitle.textContent = weekTitle.dataset.enText.replace(/^Week of\s*/i, "本周：");
      }
      if (l !== LANG.ZH) {
        weekTitle.textContent = weekTitle.dataset.enText;
      }
    }

    return true;
  }

  function applyWithRetry(lang, retry = 0) {
    const ok1 = applyMyTimetableLanguage(lang);
    const ok2 = applySchedulePageLanguage(lang);
    const ok = ok1 || ok2;
    if (ok) return;
    if (retry >= 20) return; // ~3s max
    setTimeout(() => applyWithRetry(lang, retry + 1), 150);
  }

  // If the schedule module is mounted later, observe DOM and apply once it appears.
  function watchForMyTimetableMount() {
    if (document.getElementById("my-timetable-section")) return;

    const observer = new MutationObserver(() => {
      if (applyMyTimetableLanguage(getCurrentLang()) || applySchedulePageLanguage(getCurrentLang())) {
        try { observer.disconnect(); } catch (e) { }
      }
    });

    const target = document.documentElement || document.body;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
      setTimeout(() => { try { observer.disconnect(); } catch (e) { } }, 30000);
    }
  }

  // Listen Switch.js language event
  window.addEventListener("site:langchange", function (e) {
    const l = normalizeLang(e && e.detail && e.detail.lang);
    applyWithRetry(l);
  });

  // Apply on load
  watchForMyTimetableMount();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyWithRetry(getCurrentLang()));
  } else {
    setTimeout(() => applyWithRetry(getCurrentLang()), 0);
  }
})();
