(function () {
  'use strict';

  const PDF_VIEWER_SRC = './assets/vendor/pdfjs/web/viewer.html?file=..%2F..%2F..%2Fpdf%2Flife%2Fmeditations%2FStardust_Meditations.pdf';

  const LANG_CONFIG = {
    en: {
      src: './assets/js/Content/EN/life/meditations_EN.js',
      htmlVar: 'MEDITATIONS_EN_INNER_HTML'
    },
    zh: {
      src: './assets/js/Content/ZH/life/meditations_ZH.js',
      htmlVar: 'MEDITATIONS_ZH_INNER_HTML'
    }
  };

  const CACHE = {
    en: null,
    zh: null
  };

  const LOAD_PROMISES = {
    en: null,
    zh: null
  };

  let currentLang = null;
  let lastFocusedElement = null;
  let globalHandlersBound = false;

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function getMount() {
    return document.getElementById('mount-meditations');
  }

  function getExistingMeditations() {
    const mount = getMount();
    return mount ? mount.querySelector('#meditations') : null;
  }

  function normalizeMeditationHtml(html) {
    const raw = String(html || '').trim();

    if (!raw) {
      return '<div id="meditations"><div class="container medit-pdf-page"></div></div>';
    }

    if (/^<div\s+id=["']meditations["']/i.test(raw)) {
      return raw;
    }

    return '<div id="meditations">' + raw + '</div>';
  }

  function captureCurrentHtml() {
    const existing = getExistingMeditations();

    if (existing && currentLang && !CACHE[currentLang]) {
      CACHE[currentLang] = existing.outerHTML;
    }
  }

  function setLoading(lang) {
    const mount = getMount();
    if (!mount) return;

    const text = lang === 'zh'
      ? '正在载入沉思录……'
      : 'Loading Meditations...';

    mount.innerHTML = `
      <div id="meditations">
        <div class="container medit-pdf-page">
          <div class="section">
            <p class="medit-loading">${text}</p>
          </div>
        </div>
      </div>
    `;
  }

  function setFallback(lang) {
    const mount = getMount();
    if (!mount) return;

    const text = lang === 'zh'
      ? '沉思录内容暂时无法加载。'
      : 'Meditations could not be loaded.';

    mount.innerHTML = `
      <div id="meditations">
        <div class="container medit-pdf-page">
          <div class="section">
            <p class="medit-loading">${text}</p>
          </div>
        </div>
      </div>
    `;
  }

  function getOpenKeys() {
    return [];
  }

  function ensurePdfFrameLoaded(root) {
    const frame = root && root.querySelector('.medit-pdfjs-frame');
    if (!frame) return;

    const nextSrc = frame.dataset.src || PDF_VIEWER_SRC;

    if (!frame.getAttribute('src')) {
      frame.setAttribute('src', nextSrc);
    }
  }

  function setTopbarVisibility(root, visible) {
    const topbar = root && root.querySelector('.medit-fullscreen-topbar');
    if (!topbar) return;

    topbar.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function getFullscreenElement() {
    return document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null;
  }

  function requestBrowserFullscreen(element) {
    if (!element) return Promise.resolve(false);

    const request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    if (typeof request !== 'function') {
      return Promise.resolve(false);
    }

    try {
      const result = request.call(element);
      return Promise.resolve(result).then(() => true).catch(() => false);
    } catch (err) {
      return Promise.resolve(false);
    }
  }

  function exitBrowserFullscreen() {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;

    if (!getFullscreenElement() || typeof exit !== 'function') {
      return Promise.resolve(false);
    }

    try {
      const result = exit.call(document);
      return Promise.resolve(result).then(() => true).catch(() => false);
    } catch (err) {
      return Promise.resolve(false);
    }
  }

  function openFullscreen(root) {
    if (!root || root.classList.contains('is-fullscreen')) return;

    lastFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    ensurePdfFrameLoaded(root);

    root.classList.add('is-fullscreen');
    document.body.classList.add('medit-pdf-fullscreen-open');
    setTopbarVisibility(root, true);

    requestBrowserFullscreen(root).then((ok) => {
      if (!ok) {
        root.classList.add('is-css-fullscreen-fallback');
      }
    });

    const closeButton = root.querySelector('[data-medit-fullscreen-close]');
    if (closeButton && typeof closeButton.focus === 'function') {
      window.setTimeout(() => closeButton.focus({ preventScroll: true }), 0);
    }
  }

  function closeFullscreen(root, options) {
    const opts = options || {};
    const target = root || getExistingMeditations();

    if (!target) return;

    target.classList.remove('is-fullscreen');
    target.classList.remove('is-css-fullscreen-fallback');
    document.body.classList.remove('medit-pdf-fullscreen-open');
    setTopbarVisibility(target, false);

    exitBrowserFullscreen();

    if (
      opts.restoreFocus !== false &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === 'function' &&
      document.contains(lastFocusedElement)
    ) {
      window.setTimeout(() => lastFocusedElement.focus({ preventScroll: true }), 0);
    }

    lastFocusedElement = null;
  }

  function syncAfterNativeFullscreenExit() {
    if (getFullscreenElement()) return;

    const root = getExistingMeditations();

    if (root && root.classList.contains('is-fullscreen')) {
      root.classList.remove('is-fullscreen');
      root.classList.remove('is-css-fullscreen-fallback');
      document.body.classList.remove('medit-pdf-fullscreen-open');
      setTopbarVisibility(root, false);
      lastFocusedElement = null;
    }
  }

  function handleKeydown(event) {
    if (!event || event.key !== 'Escape') return;

    const root = getExistingMeditations();

    if (root && root.classList.contains('is-fullscreen')) {
      event.preventDefault();
      closeFullscreen(root);
    }
  }

  function bindGlobalHandlers() {
    if (globalHandlersBound) return;

    globalHandlersBound = true;

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('fullscreenchange', syncAfterNativeFullscreenExit);
    document.addEventListener('webkitfullscreenchange', syncAfterNativeFullscreenExit);
    document.addEventListener('mozfullscreenchange', syncAfterNativeFullscreenExit);
    document.addEventListener('MSFullscreenChange', syncAfterNativeFullscreenExit);
  }

  function bindPdfControls(root) {
    if (!root || root.dataset.meditPdfBound === '1') return;

    root.dataset.meditPdfBound = '1';

    const openButton = root.querySelector('[data-medit-fullscreen-open]');
    const closeButton = root.querySelector('[data-medit-fullscreen-close]');

    if (openButton) {
      openButton.addEventListener('click', () => openFullscreen(root));
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => closeFullscreen(root));
    }

    bindGlobalHandlers();
  }

  function refreshAfterRender() {
    const mount = getMount();
    if (!mount) return;

    const root = getExistingMeditations();
    if (!root) return;

    ensurePdfFrameLoaded(root);
    bindPdfControls(root);

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(mount);
    }
  }

  function readHtmlVariable(lang) {
    const config = LANG_CONFIG[lang];
    if (!config) return null;

    const value = window[config.htmlVar];

    return typeof value === 'string' && value.trim()
      ? normalizeMeditationHtml(value)
      : null;
  }

  function loadScript(lang) {
    const config = LANG_CONFIG[lang];

    if (!config || !config.src) {
      return Promise.resolve(false);
    }

    if (LOAD_PROMISES[lang]) {
      return LOAD_PROMISES[lang];
    }

    if (
      window.SiteResourceLoader &&
      typeof window.SiteResourceLoader.loadScript === 'function'
    ) {
      LOAD_PROMISES[lang] = window.SiteResourceLoader.loadScript(config.src)
        .then(() => true)
        .catch((err) => {
          console.warn('[LifeMeditations] Failed to load:', lang, err);
          return false;
        });

      return LOAD_PROMISES[lang];
    }

    LOAD_PROMISES[lang] = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = config.src;
      script.async = false;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.head.appendChild(script);
    });

    return LOAD_PROMISES[lang];
  }

  async function ensureHtmlLoaded(lang) {
    if (CACHE[lang]) {
      return CACHE[lang];
    }

    const fromVariableBeforeLoad = readHtmlVariable(lang);
    if (fromVariableBeforeLoad) {
      CACHE[lang] = fromVariableBeforeLoad;
      return CACHE[lang];
    }

    const mount = getMount();
    if (!mount) return null;

    mount.innerHTML = '';

    const ok = await loadScript(lang);
    if (!ok) return null;

    const fromVariableAfterLoad = readHtmlVariable(lang);
    if (fromVariableAfterLoad) {
      CACHE[lang] = fromVariableAfterLoad;
      return CACHE[lang];
    }

    const inserted = getExistingMeditations();
    if (inserted) {
      CACHE[lang] = inserted.outerHTML;
      return CACHE[lang];
    }

    return null;
  }

  async function render(options) {
    const opts = options || {};
    const lang = opts.lang === 'zh' ? 'zh' : opts.lang === 'en' ? 'en' : getLang();
    const mount = getMount();

    if (!mount) return false;

    const existing = getExistingMeditations();

    if (currentLang === lang && existing) {
      refreshAfterRender();
      return true;
    }

    if (existing && existing.classList.contains('is-fullscreen')) {
      closeFullscreen(existing, { restoreFocus: false });
    }

    captureCurrentHtml();

    if (CACHE[lang]) {
      mount.innerHTML = CACHE[lang];
      currentLang = lang;
      refreshAfterRender();
      return true;
    }

    setLoading(lang);

    const html = await ensureHtmlLoaded(lang);

    if (!html) {
      setFallback(lang);
      currentLang = lang;
      refreshAfterRender();
      return false;
    }

    mount.innerHTML = html;
    currentLang = lang;

    refreshAfterRender();

    return true;
  }

  function ensureCurrent(options) {
    return render(Object.assign({}, options || {}, {
      lang: getLang()
    }));
  }

  function refreshCurrentLanguage() {
    return render({
      lang: getLang()
    });
  }

  function clear() {
    const existing = getExistingMeditations();
    if (existing && existing.classList.contains('is-fullscreen')) {
      closeFullscreen(existing, { restoreFocus: false });
    }

    captureCurrentHtml();

    const mount = getMount();
    if (mount) mount.innerHTML = '';

    currentLang = null;
  }

  window.LifeMeditations = {
    render,
    ensureCurrent,
    refreshCurrentLanguage,
    clear,
    getOpenKeys
  };
})();