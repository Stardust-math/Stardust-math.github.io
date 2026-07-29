(function () {
  'use strict';

  /*
    Font resources are centralized here.

    Loading strategy:
    1. External Latin-font styles are loaded during normal site boot.
    2. Local font-face fallbacks are declared in assets/css/fonts.css.
    3. The segmented Chinese webfont stylesheet is loaded only after
       the site actually enters Chinese mode.
    4. Font Awesome uses an external stylesheet first, then falls back
       to the local stylesheet if the CDN stylesheet fails or times out.
  */

  const GOOGLE_FONT_STYLES = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Allura&family=Great+Vibes&display=swap'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=MedievalSharp&display=swap'
    }
  ];

  const ICON_FONT_STYLES = [
    {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      fallbackHref: './assets/fonts/Font_Awesome/css/all.min.css',
      timeout: 6000
    }
  ];

  /*
    Only the proportional GB Screen family is requested.

    The upstream stylesheet splits the full Chinese character set into
    unicode-range WOFF2 packages, so the browser downloads only the
    packages needed by the Chinese text currently rendered on the page.

    This stylesheet is intentionally excluded from externalStyles below:
    English-only visits must not request it during initial site loading.
  */
  const CHINESE_FONT_STYLES = [
    {
      href:
        'https://cdn.jsdelivr.net/npm/' +
        'lxgw-wenkai-screen-web@1.522.0/' +
        'lxgwwenkaigbscreen/result.css',

      fallbackHref:
        'https://cdnjs.cloudflare.com/ajax/libs/' +
        'lxgw-wenkai-screen-web/1.520.0/' +
        'lxgwwenkaigbscreen/result.css',

      timeout: 8000
    }
  ];

  let chineseFontStylesPromise = null;

  function normalizeLang(value) {
    const lang = String(value || '')
      .trim()
      .toLowerCase();

    return (
      lang === 'zh' ||
      lang.startsWith('zh-')
    )
      ? 'zh'
      : 'en';
  }

  function getCurrentLang() {
    const bodyLang =
      document.body &&
      document.body.dataset
        ? document.body.dataset.lang
        : '';

    if (bodyLang) {
      return normalizeLang(bodyLang);
    }

    return normalizeLang(
      document.documentElement.getAttribute(
        'lang'
      )
    );
  }

  function ensureChineseFontStyles() {
    if (chineseFontStylesPromise) {
      return chineseFontStylesPromise;
    }

    const loader =
      window.SiteResourceLoader;

    if (
      !loader ||
      typeof loader.loadStyle !==
        'function'
    ) {
      return Promise.resolve(false);
    }

    chineseFontStylesPromise =
      Promise.all(
        CHINESE_FONT_STYLES.map(
          (style) =>
            loader.loadStyle(style)
        )
      )
        .then((links) => {
          const loaded =
            links.every(Boolean);

          if (!loaded) {
            chineseFontStylesPromise = null;
          }

          return loaded;
        })
        .catch((error) => {
          chineseFontStylesPromise = null;

          console.warn(
            '[SiteFonts] Failed to load the Chinese webfont stylesheet.',
            error
          );

          return false;
        });

    return chineseFontStylesPromise;
  }

  function ensureForLanguage(lang) {
    if (
      normalizeLang(lang) !== 'zh'
    ) {
      return Promise.resolve(false);
    }

    return ensureChineseFontStyles();
  }

  window.SiteFonts = {
    googleFontStyles:
      GOOGLE_FONT_STYLES,

    iconFontStyles:
      ICON_FONT_STYLES,

    chineseFontStyles:
      CHINESE_FONT_STYLES,

    /*
      Only normal boot resources belong here.

      The Chinese stylesheet is deliberately excluded
      and loaded only when Chinese mode is active.
    */
    externalStyles: [
      ...GOOGLE_FONT_STYLES,
      ...ICON_FONT_STYLES
    ],

    ensureChineseFontStyles,
    ensureForLanguage
  };

  /*
    Translate.js emits this event after it has updated
    html[lang] and body[data-lang].

    Listening here keeps language-specific font loading
    inside the centralized font configuration layer.
  */
  window.addEventListener(
    'site:langchange',
    (event) => {
      const detail =
        event && event.detail
          ? event.detail
          : {};

      ensureForLanguage(
        detail.lang ||
        getCurrentLang()
      );
    }
  );

  /*
    This also supports a future configuration in which
    the initial document language may already be Chinese.
  */
  function initializeCurrentLanguage() {
    ensureForLanguage(
      getCurrentLang()
    );
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initializeCurrentLanguage,
      {
        once: true
      }
    );
  } else {
    initializeCurrentLanguage();
  }
})();