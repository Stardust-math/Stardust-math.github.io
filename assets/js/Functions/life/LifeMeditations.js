(function () {
  'use strict';

  const PDF_PATH =
    './assets/pdf/life/meditations/' +
    'Stardust_Meditations.pdf';

  const LANG_CONFIG = {
    en: {
      src:
        './assets/js/Content/EN/life/' +
        'meditations_EN.js',
      htmlVar:
        'MEDITATIONS_EN_INNER_HTML'
    },

    zh: {
      src:
        './assets/js/Content/ZH/life/' +
        'meditations_ZH.js',
      htmlVar:
        'MEDITATIONS_ZH_INNER_HTML'
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
  let pdfResourcesPromise = null;
  let renderSequence = 0;

  function getLang() {
    if (
      window.SiteLang &&
      typeof window.SiteLang.getLang ===
        'function'
    ) {
      return window.SiteLang.getLang() ===
        'zh'
        ? 'zh'
        : 'en';
    }

    return (
      document.body &&
      document.body.dataset.lang === 'zh'
    )
      ? 'zh'
      : 'en';
  }

  function getMount() {
    return document.getElementById(
      'mount-meditations'
    );
  }

  function getExistingMeditations() {
    const mount = getMount();

    return mount
      ? mount.querySelector(
          '#meditations'
        )
      : null;
  }

  function normalizeMeditationHtml(html) {
    const raw = String(
      html || ''
    ).trim();

    if (!raw) {
      return `
        <div id="meditations">
          <div class="container medit-pdf-page"></div>
        </div>
      `;
    }

    if (
      /^<div\s+id=["']meditations["']/i
        .test(raw)
    ) {
      return raw;
    }

    return (
      '<div id="meditations">' +
      raw +
      '</div>'
    );
  }

  function getPdfResourceConfig() {
    const resources =
      window.SiteResources || {};

    return {
      style:
        resources.styles &&
        resources.styles.optional
          ? resources.styles.optional
              .pdfReader
          : '',

      script:
        resources.scripts &&
        resources.scripts.optional
          ? resources.scripts.optional
              .pdfReader
          : ''
    };
  }

  function ensurePdfReaderResources() {
    if (window.PdfReader) {
      return Promise.resolve(true);
    }

    if (pdfResourcesPromise) {
      return pdfResourcesPromise;
    }

    const loader =
      window.SiteResourceLoader;

    const resourceConfig =
      getPdfResourceConfig();

    if (
      !loader ||
      typeof loader.loadStyle !==
        'function' ||
      typeof loader.loadScript !==
        'function' ||
      !resourceConfig.style ||
      !resourceConfig.script
    ) {
      return Promise.resolve(false);
    }

    pdfResourcesPromise =
      Promise.all([
        loader.loadStyle(
          resourceConfig.style
        ),

        loader.loadScript(
          resourceConfig.script
        )
      ])
        .then(() => {
          return !!window.PdfReader;
        })
        .catch((error) => {
          console.warn(
            '[LifeMeditations] Failed to load the shared PDF reader.',
            error
          );

          return false;
        })
        .then((ready) => {
          if (!ready) {
            pdfResourcesPromise = null;
          }

          return ready;
        });

    return pdfResourcesPromise;
  }

  function setLoading(lang) {
    const mount = getMount();

    if (!mount) return;

    const text =
      lang === 'zh'
        ? '正在载入沉思录……'
        : 'Loading Meditations...';

    mount.innerHTML = `
      <div id="meditations">
        <div class="container medit-pdf-page">
          <div class="section">
            <p class="medit-loading">
              ${text}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function setFallback(lang) {
    const mount = getMount();

    if (!mount) return;

    const message =
      lang === 'zh'
        ? '沉思录内容暂时无法加载。'
        : 'Meditations could not be loaded.';

    const linkText =
      lang === 'zh'
        ? '直接打开 PDF'
        : 'Open the PDF directly';

    mount.innerHTML = `
      <div id="meditations">
        <div class="container medit-pdf-page">
          <div class="section">
            <p class="medit-loading">
              ${message}
              <a
                href="${PDF_PATH}"
                target="_blank"
                rel="noopener noreferrer"
              >${linkText}</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function readHtmlVariable(lang) {
    const config =
      LANG_CONFIG[lang];

    if (!config) return null;

    const value =
      window[config.htmlVar];

    if (
      typeof value !== 'string' ||
      !value.trim()
    ) {
      return null;
    }

    return normalizeMeditationHtml(
      value
    );
  }

  function loadLanguageScript(lang) {
    const config =
      LANG_CONFIG[lang];

    if (
      !config ||
      !config.src
    ) {
      return Promise.resolve(false);
    }

    if (LOAD_PROMISES[lang]) {
      return LOAD_PROMISES[lang];
    }

    const loader =
      window.SiteResourceLoader;

    if (
      loader &&
      typeof loader.loadScript ===
        'function'
    ) {
      LOAD_PROMISES[lang] =
        loader
          .loadScript(config.src)
          .then((script) => {
            return !!script;
          })
          .catch((error) => {
            console.warn(
              '[LifeMeditations] Failed to load language content:',
              lang,
              error
            );

            return false;
          });

      return LOAD_PROMISES[lang];
    }

    LOAD_PROMISES[lang] =
      new Promise((resolve) => {
        const script =
          document.createElement(
            'script'
          );

        script.src = config.src;
        script.async = false;

        script.onload = function () {
          resolve(true);
        };

        script.onerror = function () {
          resolve(false);
        };

        document.head.appendChild(
          script
        );
      });

    return LOAD_PROMISES[lang];
  }

  async function ensureHtmlLoaded(lang) {
    if (CACHE[lang]) {
      return CACHE[lang];
    }

    const existingVariable =
      readHtmlVariable(lang);

    if (existingVariable) {
      CACHE[lang] =
        existingVariable;

      return CACHE[lang];
    }

    const loaded =
      await loadLanguageScript(lang);

    if (!loaded) {
      return null;
    }

    const loadedVariable =
      readHtmlVariable(lang);

    if (!loadedVariable) {
      return null;
    }

    CACHE[lang] =
      loadedVariable;

    return CACHE[lang];
  }

  function getReader(root) {
    return root
      ? root.querySelector(
          '[data-pdf-reader]'
        )
      : null;
  }

  function initializeReader(root) {
    if (
      !root ||
      !window.PdfReader ||
      typeof window.PdfReader.init !==
        'function'
    ) {
      return false;
    }

    const reader = getReader(root);

    if (!reader) {
      return false;
    }

    window.PdfReader.init(
      reader,
      {
        autoload: true
      }
    );

    return true;
  }

  function refreshCursor(root) {
    if (
      root &&
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI
        .refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(
        root
      );
    }
  }

  function refreshAfterRender() {
    const root =
      getExistingMeditations();

    if (!root) return false;

    const initialized =
      initializeReader(root);

    refreshCursor(root);

    return initialized;
  }

  function closeFullscreenWithin(
    root,
    options
  ) {
    if (
      !root ||
      !window.PdfReader ||
      typeof window.PdfReader
        .closeFullscreenWithin !==
        'function'
    ) {
      return Promise.resolve(false);
    }

    return window.PdfReader
      .closeFullscreenWithin(
        root,
        options || {}
      );
  }

  async function render(options) {
    const opts = options || {};

    const lang =
      opts.lang === 'zh'
        ? 'zh'
        : opts.lang === 'en'
          ? 'en'
          : getLang();

    const mount = getMount();

    if (!mount) return false;

    const sequence =
      ++renderSequence;

    const existing =
      getExistingMeditations();

    if (
      currentLang === lang &&
      existing &&
      existing.querySelector(
        '[data-pdf-reader]'
      )
    ) {
      const readerReady =
        await ensurePdfReaderResources();

      if (
        sequence !== renderSequence
      ) {
        return false;
      }

      if (!readerReady) {
        setFallback(lang);
        return false;
      }

      refreshAfterRender();
      return true;
    }

    if (existing) {
      await closeFullscreenWithin(
        existing,
        {
          restoreFocus: false
        }
      );
    }

    if (
      sequence !== renderSequence
    ) {
      return false;
    }

    setLoading(lang);

    const results =
      await Promise.all([
        ensureHtmlLoaded(lang),
        ensurePdfReaderResources()
      ]);

    if (
      sequence !== renderSequence
    ) {
      return false;
    }

    const html = results[0];
    const readerReady = results[1];

    if (
      !html ||
      !readerReady
    ) {
      setFallback(lang);
      currentLang = lang;
      return false;
    }

    mount.innerHTML = html;
    currentLang = lang;

    refreshAfterRender();

    return true;
  }

  function ensureCurrent(options) {
    return render(
      Object.assign(
        {},
        options || {},
        {
          lang: getLang()
        }
      )
    );
  }

  function refreshCurrentLanguage() {
    return render({
      lang: getLang()
    });
  }

  function leave() {
    const existing =
      getExistingMeditations();

    if (!existing) {
      return Promise.resolve(false);
    }

    return closeFullscreenWithin(
      existing,
      {
        restoreFocus: false
      }
    );
  }

  function clear() {
    ++renderSequence;

    const existing =
      getExistingMeditations();

    const mount = getMount();

    function finishClear() {
      if (mount) {
        mount.innerHTML = '';
      }

      currentLang = null;
    }

    if (!existing) {
      finishClear();
      return Promise.resolve(true);
    }

    return closeFullscreenWithin(
      existing,
      {
        restoreFocus: false
      }
    )
      .catch(() => false)
      .then(() => {
        finishClear();
        return true;
      });
  }

  function getOpenKeys() {
    return [];
  }

  window.LifeMeditations = {
    render,
    ensureCurrent,
    refreshCurrentLanguage,
    leave,
    clear,
    getOpenKeys,
    preparePdfReader:
      ensurePdfReaderResources
  };
})();