(function () {
  const STORAGE_KEY = "site_lang"; // "en" | "zh"
  const LANG = { EN: "en", ZH: "zh" };
  const HTML_LANG = Object.assign(
    {
      en: "en",
      zh: "zh-CN"
    },
    window.SiteResources &&
    window.SiteResources.localization &&
    window.SiteResources.localization.htmlLanguages
      ? window.SiteResources.localization.htmlLanguages
      : {}
  );

  // ------------------------------
  // Expose unified language helpers
  // ------------------------------
  function normalizeLang(v) {
    const s = String(v || "").toLowerCase();
    return (s === "zh" || s.startsWith("zh")) ? LANG.ZH : LANG.EN;
  }

  function getLang() {
    const bodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : "";

    if (bodyLang) return normalizeLang(bodyLang);

    const htmlLang = document.documentElement.getAttribute("lang");
    if (htmlLang) return normalizeLang(htmlLang);

    return LANG.EN;
  }

  function setLang(lang) {
    const l = normalizeLang(lang);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    document.documentElement.setAttribute(
      "lang",
      HTML_LANG[l] || l
    );

    if (document.body && document.body.dataset) {
      document.body.dataset.lang = l;
    }

    return l;
  }

  function getFullCalendarLocale(lang) {
    const l = normalizeLang(lang);
    return (l === LANG.ZH) ? "zh-cn" : "en";
  }

  function getLanguageFromLocation(options) {
    const opts = options || {};
    const routes = window.BootstrapRoutes;

    if (!routes || typeof routes.parsePath !== "function") {
      return opts.preserveNeutralRoute === true
        ? getLang()
        : LANG.EN;
    }

    const parsed = routes.parsePath(window.location.pathname);

    if (!parsed.isLocalizedRoute) {
      return opts.preserveNeutralRoute === true
        ? getLang()
        : LANG.EN;
    }

    return normalizeLang(parsed.language);
  }

  function setLocationLanguage(lang, options) {
    const routes = window.BootstrapRoutes;

    if (
      !routes ||
      typeof routes.setLocationLanguage !== "function"
    ) {
      return null;
    }

    if (
      typeof routes.saveCurrentScrollPosition === "function"
    ) {
      routes.saveCurrentScrollPosition();
    }

    const result = routes.setLocationLanguage(
      normalizeLang(lang),
      options
    );

    if (
      typeof routes.setCurrentScrollPath === "function"
    ) {
      routes.setCurrentScrollPath(window.location.pathname);
    }

    return result;
  }

  window.SiteLang = window.SiteLang || {};
  window.SiteLang.LANG = LANG;
  window.SiteLang.normalizeLang = normalizeLang;
  window.SiteLang.getLang = getLang;
  window.SiteLang.setLang = setLang;
  window.SiteLang.getFullCalendarLocale = getFullCalendarLocale;

  // ------------------------------
  // Unified I18N Dictionary Center
  // ------------------------------
  window.SiteI18N = window.SiteI18N || {};
  window.SiteI18N.dict = window.SiteI18N.dict || {};

  window.SiteI18N.dict.schedule = window.SiteI18N.dict.schedule || {
    en: {
      weekOf: "Week of",
      thisWeek: "Week of",
      noWeeksSelected: "No weeks selected",
      weeksSuffix: " week(s)",
      unknown: "Unknown",
      edit: "Edit",
      del: "Delete",
      addNewClass: "Add New Class",
      editClass: "Edit Class",
      addNewEvent: "Add New Event",
      editEvent: "Edit Event",
      fillRequired: "Please fill in all required fields",
      endPeriodEarlier: "End period cannot be earlier than start period",
      confirmDeleteClass: "Are you sure you want to delete this class?",
      confirmDeleteEvent: "Are you sure you want to delete this event?"
    },
    zh: {
      weekOf: "本周：",
      thisWeek: "本周：",
      noWeeksSelected: "未选择周次",
      weeksSuffix: "周",
      unknown: "未知",
      edit: "编辑",
      del: "删除",
      addNewClass: "添加课程",
      editClass: "编辑课程",
      addNewEvent: "添加事件",
      editEvent: "编辑事件",
      fillRequired: "请填写所有必填项",
      endPeriodEarlier: "结束节次不能早于开始节次",
      confirmDeleteClass: "确定要删除这门课吗？",
      confirmDeleteEvent: "确定要删除这个事件吗？"
    }
  };

  window.SiteI18N.t = window.SiteI18N.t || function (scope, key) {
    const l = getLang();
    const store = window.SiteI18N.dict || {};
    const scoped = store[scope] || {};
    const dict = (l === LANG.ZH) ? scoped.zh : scoped.en;
    return (dict && dict[key]) || (scoped.en && scoped.en[key]) || key;
  };

  let meditationsEnInnerHTML = null;

  function ensureLangButtonMarkup(btn) {
    if (!btn) return null;

    let wrap = btn.querySelector(".top-nav-lang");
    let left = wrap ? wrap.querySelector(".lang-left") : null;
    let right = wrap ? wrap.querySelector(".lang-right") : null;
    let sep = wrap ? wrap.querySelector(".lang-sep") : null;

    if (!wrap || !left || !right || !sep) {
      btn.innerHTML = `
        <span class="top-nav-lang" aria-hidden="true">
          <span class="lang-token lang-left">EN</span>
          <span class="lang-sep">/</span>
          <span class="lang-token lang-right">ZH</span>
        </span>
      `;

      wrap = btn.querySelector(".top-nav-lang");
      left = wrap.querySelector(".lang-left");
      right = wrap.querySelector(".lang-right");
      sep = wrap.querySelector(".lang-sep");
    }

    return { wrap, left, right, sep };
  }

  function updateLangButton(lang) {
    const btn = document.getElementById("top-lang-btn");
    const parts = ensureLangButtonMarkup(btn);

    if (!btn || !parts) return;

    if (lang === LANG.ZH) {
      parts.left.textContent = "英";
      parts.right.textContent = "中";
      btn.setAttribute("aria-label", "切换到英文");
      btn.title = "切换到英文";
    } else {
      parts.left.textContent = "EN";
      parts.right.textContent = "ZH";
      btn.setAttribute("aria-label", "Switch to Chinese");
      btn.title = "Switch to Chinese";
    }
  }

  function captureMeditationsEnglishTemplate() {
    const meditations = document.getElementById("meditations");

    if (!meditations) return;

    if (meditationsEnInnerHTML == null) {
      meditationsEnInnerHTML = meditations.innerHTML;
    }
  }

  // ------------------------------
  // Stable asset root resolver
  // ------------------------------
  function getStableSiteRoot() {
    if (
      typeof window.__SITE_ROOT__ === "string" &&
      window.__SITE_ROOT__.trim()
    ) {
      return window.__SITE_ROOT__;
    }

    function rootFromAssetUrl(url) {
      if (!url) return null;

      try {
        const absoluteUrl = new URL(url, window.location.href).href;
        const idx = absoluteUrl.indexOf("/assets/");

        if (idx >= 0) {
          return absoluteUrl.slice(0, idx + 1);
        }
      } catch (e) {}

      return null;
    }

    const currentScriptRoot = document.currentScript && document.currentScript.src
      ? rootFromAssetUrl(document.currentScript.src)
      : null;

    if (currentScriptRoot) return currentScriptRoot;

    const scripts = Array.from(document.scripts || []);
    const matchedScript = scripts.find((script) => {
      return typeof script.src === "string" &&
        /\/assets\/js\/Functions\/(?:general\/)?Translate\.js(?:\?|#|$)/.test(script.src);
    });

    const matchedScriptRoot = matchedScript && matchedScript.src
      ? rootFromAssetUrl(matchedScript.src)
      : null;

    if (matchedScriptRoot) return matchedScriptRoot;

    const anyAssetEl = document.querySelector(
      'script[src*="/assets/"], script[src*="assets/"], link[href*="/assets/"], link[href*="assets/"], img[src*="/assets/"], img[src*="assets/"]'
    );

    if (anyAssetEl) {
      const url = anyAssetEl.src || anyAssetEl.href;
      const assetRoot = rootFromAssetUrl(url);

      if (assetRoot) return assetRoot;
    }

    try {
      return new URL("./", window.location.href).href;
    } catch (e) {
      return "/";
    }
  }

  function getStableAssetBase() {
    return new URL("assets/", getStableSiteRoot()).href;
  }

  function absolutizeAssetPaths(html) {
    if (typeof html !== "string" || !html.trim()) return html;

    const assetBase = getStableAssetBase();

    return html
      .replace(/((?:src|href|poster)\s*=\s*["'])\.\/assets\//gi, `$1${assetBase}`)
      .replace(/((?:src|href|poster)\s*=\s*["'])\.\.\/assets\//gi, `$1${assetBase}`)
      .replace(/((?:src|href|poster)\s*=\s*["'])assets\//gi, `$1${assetBase}`)
      .replace(/(url\(\s*["']?)\.\/assets\//gi, `$1${assetBase}`)
      .replace(/(url\(\s*["']?)\.\.\/assets\//gi, `$1${assetBase}`)
      .replace(/(url\(\s*["']?)assets\//gi, `$1${assetBase}`);
  }

  function applyMeditationsLanguage(lang) {
    const meditations = document.getElementById("meditations");

    if (!meditations) return;

    captureMeditationsEnglishTemplate();

    const currentRenderedLang =
      meditations.dataset.renderedLang || LANG.EN;

    if (lang === LANG.ZH) {
      if (
        typeof window.MEDITATIONS_ZH_INNER_HTML === "string" &&
        window.MEDITATIONS_ZH_INNER_HTML.trim()
      ) {
        const nextHTML = absolutizeAssetPaths(
          window.MEDITATIONS_ZH_INNER_HTML
        );

        if (
          currentRenderedLang !== LANG.ZH ||
          meditations.innerHTML !== nextHTML
        ) {
          meditations.innerHTML = nextHTML;
        }

        meditations.dataset.renderedLang = LANG.ZH;
      }

      return;
    }

    if (
      currentRenderedLang === LANG.ZH &&
      typeof meditationsEnInnerHTML === "string"
    ) {
      const nextHTML = absolutizeAssetPaths(
        meditationsEnInnerHTML
      );

      if (meditations.innerHTML !== nextHTML) {
        meditations.innerHTML = nextHTML;
      }
    }

    meditations.dataset.renderedLang = LANG.EN;
  }

  /* ------------------------------
   * Toolkit I18N
   * ------------------------------ */
  function getToolkitEnDict() {
    if (
      window.TOOLKIT_EN_I18N &&
      typeof window.TOOLKIT_EN_I18N === "object"
    ) {
      return window.TOOLKIT_EN_I18N;
    }

    return {
      toolkit_heading: "Academic Toolkit",
      search_placeholder: "Search tools by name.",
      filter_all: "All",
      no_results: "No matching tools found.\nTry a different search term."
    };
  }

  function getToolkitDict(lang) {
    if (
      lang === LANG.ZH &&
      window.TOOLKIT_ZH_I18N &&
      typeof window.TOOLKIT_ZH_I18N === "object"
    ) {
      return window.TOOLKIT_ZH_I18N;
    }

    return getToolkitEnDict();
  }

  function applyToolkitI18N(lang) {
    const toolkit = document.getElementById("toolkit");

    if (!toolkit) return;

    const dict = getToolkitDict(lang);

    toolkit.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");

      if (!key) return;

      const value = dict[key];

      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    toolkit
      .querySelectorAll("[data-i18n-placeholder]")
      .forEach((element) => {
        const key = element.getAttribute("data-i18n-placeholder");

        if (!key) return;

        const value = dict[key];

        if (typeof value === "string") {
          element.setAttribute("placeholder", value);
        }
      });
  }

  /* ------------------------------
   * Social I18N
   * ------------------------------ */
  function getSocialDict(lang) {
    const zh = window.SOCIAL_ZH_I18N;
    const en = window.SOCIAL_EN_I18N;

    if (
      lang === LANG.ZH &&
      zh &&
      typeof zh === "object"
    ) {
      return zh;
    }

    if (en && typeof en === "object") {
      return en;
    }

    return null;
  }

  function applySocialI18N(lang) {
    const social = document.getElementById("social");

    if (!social) return;

    const dict = getSocialDict(lang);

    if (!dict) return;

    social.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");

      if (!key) return;

      const value = dict[key];

      if (typeof value === "string") {
        element.textContent = value;
      }
    });
  }

  /* ------------------------------
   * Top Nav I18N
   * ------------------------------ */
  function applyTopNavI18N(lang) {
    const nav = document.getElementById("top-nav");

    if (!nav) return;

    const l = normalizeLang(lang);
    const labels = (l === LANG.ZH)
      ? {
        resume: "关于",
        schedule: "日程",
        social: "社交",
        toolkit: "工具",
        life: "人生"
      }
      : {
        resume: "About",
        schedule: "Schedule",
        social: "Social",
        toolkit: "Toolkit",
        life: "Life"
      };

    nav
      .querySelectorAll(".top-nav-link[data-page]")
      .forEach((button) => {
        const page = button.getAttribute("data-page");

        if (!page) return;

        const text = labels[page];

        if (typeof text === "string") {
          button.textContent = text;
        }
      });

    if (
      window.TopNav &&
      typeof window.TopNav.refreshLinks === "function"
    ) {
      window.TopNav.refreshLinks();
    }
  }

  function getFallbackOpenKeys(scope) {
    try {
      const root = scope || document;
      const buttons = Array.prototype.slice.call(
        root.querySelectorAll(
          'button.expander[aria-expanded="true"]'
        )
      );

      return buttons
        .map((button) => {
          const key = button.getAttribute("data-expand-key");

          if (key && String(key).trim()) {
            return String(key).trim();
          }

          const target = button.getAttribute("data-expand-target");

          if (target && String(target).trim()) {
            return String(target).trim();
          }

          return null;
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function getOpenKeys() {
    try {
      const api = window.ResumeExpanders;

      if (
        api &&
        typeof api.getOpenKeys === "function"
      ) {
        return api.getOpenKeys(document);
      }
    } catch (e) {}

    return getFallbackOpenKeys(document);
  }

  function restoreMeditationsOpenKeys(keys) {
    try {
      const api = window.ResumeExpanders;
      const meditations = document.getElementById("meditations");

      if (
        api &&
        typeof api.init === "function"
      ) {
        api.init(meditations || document, {
          openKeys: Array.isArray(keys) ? keys : [],
          skipSave: true
        });
      }
    } catch (e) {}
  }

  function isActuallyVisible(element) {
    if (!element) return false;

    try {
      return !!(
        element.offsetWidth ||
        element.offsetHeight ||
        element.getClientRects().length
      );
    } catch (e) {
      return false;
    }
  }

  function dispatchSiteLangChange(lang, openKeys) {
    const detail = {
      lang,
      openKeys: Array.isArray(openKeys) ? openKeys : []
    };

    try {
      window.dispatchEvent(
        new CustomEvent("site:langchange", {
          detail
        })
      );
    } catch (e) {
      try {
        const event = document.createEvent("CustomEvent");

        event.initCustomEvent(
          "site:langchange",
          false,
          false,
          detail
        );

        window.dispatchEvent(event);
      } catch (error) {}
    }
  }

  function smoothSwapMeditations(lang, openKeys) {
    const meditations = document.getElementById("meditations");

    if (!meditations) {
      applyMeditationsLanguage(lang);
      return;
    }

    const previousHeight =
      meditations.getBoundingClientRect().height;

    if (previousHeight > 0) {
      meditations.style.minHeight = `${previousHeight}px`;
    }

    meditations.style.transition = "opacity 120ms ease";
    meditations.style.opacity = "0";

    requestAnimationFrame(() => {
      applyMeditationsLanguage(lang);
      restoreMeditationsOpenKeys(openKeys);

      if (
        window.CustomCursorAPI &&
        typeof window.CustomCursorAPI.refresh === "function"
      ) {
        window.CustomCursorAPI.refresh(meditations);
      }

      requestAnimationFrame(() => {
        meditations.style.opacity = "1";

        const cleanup = () => {
          meditations.style.minHeight = "";
          meditations.removeEventListener(
            "transitionend",
            cleanup
          );
        };

        meditations.addEventListener(
          "transitionend",
          cleanup
        );

        window.setTimeout(cleanup, 250);
      });
    });
  }

  function applyLanguage(lang, options) {
    const opts = options || {};
    const shouldEmitLangChange =
      opts.emitLangChange === true;

    const l = setLang(lang);
    updateLangButton(l);

    const openKeys = shouldEmitLangChange
      ? getOpenKeys()
      : [];

    const meditations = document.getElementById("meditations");

    if (
      shouldEmitLangChange &&
      meditations &&
      isActuallyVisible(meditations)
    ) {
      smoothSwapMeditations(l, openKeys);
    } else {
      applyMeditationsLanguage(l);
    }

    applyToolkitI18N(l);
    applySocialI18N(l);
    applyTopNavI18N(l);

    if (shouldEmitLangChange) {
      dispatchSiteLangChange(l, openKeys);
    }

    return l;
  }

  function syncFromLocation(options) {
    const opts = Object.assign({
      emitLangChange: true,
      canonicalize: true,
      preserveNeutralRoute: true
    }, options || {});

    const routes = window.BootstrapRoutes;
    const current = getLang();

    if (!routes || typeof routes.parsePath !== "function") {
      return applyLanguage(current, {
        emitLangChange: false
      });
    }

    const parsed = routes.parsePath(window.location.pathname);

    if (!parsed.isLocalizedRoute) {
      if (opts.preserveNeutralRoute === true) {
        return current;
      }

      return applyLanguage(LANG.EN, {
        emitLangChange: false
      });
    }

    const language = normalizeLang(parsed.language);

    if (
      opts.canonicalize === true &&
      typeof routes.canonicalizeLocation === "function"
    ) {
      routes.canonicalizeLocation({
        defaultLanguage: LANG.EN
      });
    }

    return applyLanguage(language, {
      emitLangChange:
        opts.emitLangChange === true &&
        current !== language
    });
  }

  window.SiteLang.applyLanguage = applyLanguage;
  window.SiteLang.getLanguageFromLocation = getLanguageFromLocation;
  window.SiteLang.setLocationLanguage = setLocationLanguage;
  window.SiteLang.syncFromLocation = syncFromLocation;

  function bindLangToggle() {
    const button = document.getElementById("top-lang-btn");

    if (!button || button.dataset.bound === "1") {
      return;
    }

    button.dataset.bound = "1";

    button.addEventListener("click", () => {
      const current = getLang();
      const next = current === LANG.EN
        ? LANG.ZH
        : LANG.EN;

      setLocationLanguage(next, {
        replace: true
      });

      applyLanguage(next, {
        emitLangChange: true
      });
    });
  }

  function init() {
    syncFromLocation({
      emitLangChange: false,
      canonicalize: true,
      preserveNeutralRoute: false
    });

    bindLangToggle();

    let retry = 0;

    const timer = window.setInterval(() => {
      bindLangToggle();
      updateLangButton(getLang());
      retry += 1;

      if (
        document.getElementById("top-lang-btn") &&
        retry >= 3
      ) {
        window.clearInterval(timer);
      }

      if (retry >= 10) {
        window.clearInterval(timer);
      }
    }, 200);

    window.addEventListener("site:langchange", (event) => {
      if (
        event &&
        event.detail &&
        event.detail.scheduleExportOnly === true
      ) {
        return;
      }

      const l = normalizeLang(
        event && event.detail
          ? event.detail.lang
          : getLang()
      );

      applyToolkitI18N(l);
      applySocialI18N(l);
      applyTopNavI18N(l);
      updateLangButton(l);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
