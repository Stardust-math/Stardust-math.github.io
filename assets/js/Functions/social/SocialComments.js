(function () {
  'use strict';

  const GISCUS_CONFIG = {
    repo: 'Stardust-math/Stardust-math.github.io',
    repoId: 'R_kgDOPFvFdg',
    mapping: 'number',
    term: '2',
    reactionsEnabled: '0',
    emitMetadata: '0',
    inputPosition: 'top',
    loading: 'eager'
  };

  const GISCUS_ORIGIN = 'https://giscus.app';
  const GISCUS_MOUNT_DELAY = 120;

  let giscusLoaded = false;
  let giscusMountTimer = null;
  let socialVisibleObserver = null;
  let themeObserver = null;

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang();
    }

    const bodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : '';

    if (bodyLang) {
      return String(bodyLang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    const htmlLang = document.documentElement.getAttribute('lang') || '';
    return String(htmlLang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function getGiscusLang() {
    return getLang() === 'zh' ? 'zh-CN' : 'en';
  }

  function getTheme() {
    if (!document.body) {
      return 'preferred_color_scheme';
    }

    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  function getSocialRoot() {
    return document.getElementById('social');
  }

  function ensureSocialRoot() {
    let social = getSocialRoot();

    if (
      !social &&
      window.SocialRender &&
      typeof window.SocialRender.renderSocialPage === 'function'
    ) {
      social = window.SocialRender.renderSocialPage();
    }

    return social || getSocialRoot();
  }

  function isConstellationActive() {
    if (window.SocialShell && typeof window.SocialShell.isViewActive === 'function') {
      return window.SocialShell.isViewActive('constellation');
    }

    const section = document.querySelector('#social .social-section[data-view="constellation"]');

    if (!section) {
      return true;
    }

    return section.classList.contains('active') && !section.hidden;
  }

  function socialIsVisible() {
    const social = getSocialRoot();
    if (!social || !isConstellationActive()) return false;

    if (social.classList.contains('visible')) {
      return true;
    }

    try {
      const cs = window.getComputedStyle(social);
      return cs.display !== 'none' && social.offsetWidth > 0 && social.offsetHeight > 0;
    } catch (e) {
      return false;
    }
  }

  function getSocialDict() {
    const lang = getLang();

    if (lang === 'zh' && window.SOCIAL_ZH_I18N && typeof window.SOCIAL_ZH_I18N === 'object') {
      return window.SOCIAL_ZH_I18N;
    }

    if (window.SOCIAL_EN_I18N && typeof window.SOCIAL_EN_I18N === 'object') {
      return window.SOCIAL_EN_I18N;
    }

    return {};
  }

  function updateStaticTexts() {
    const dict = getSocialDict();

    const loading = document.getElementById('giscus-loading');
    if (loading && dict.comments_loading) {
      loading.textContent = dict.comments_loading;
    }

    const githubLink = document.getElementById('giscus-github-link');
    if (githubLink) {
      const label = dict.comments_open_github || 'Open discussion on GitHub';
      githubLink.setAttribute('title', label);
      githubLink.setAttribute('aria-label', label);
    }
  }

  function postGiscusConfig(config) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      giscus: {
        setConfig: config
      }
    }, GISCUS_ORIGIN);
  }

  function syncGiscusAppearance() {
    if (!giscusLoaded) return;

    postGiscusConfig({
      theme: getTheme(),
      lang: getGiscusLang(),
      inputPosition: GISCUS_CONFIG.inputPosition,
      reactionsEnabled: false
    });
  }

  function mountGiscus() {
    if (giscusLoaded) return;
    if (!socialIsVisible()) return;

    const container = document.getElementById('giscus-container');
    if (!container) return;

    container.textContent = '';

    const script = document.createElement('script');
    script.src = GISCUS_ORIGIN + '/client.js';

    script.setAttribute('data-repo', GISCUS_CONFIG.repo);
    script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
    script.setAttribute('data-mapping', GISCUS_CONFIG.mapping);
    script.setAttribute('data-term', GISCUS_CONFIG.term);
    script.setAttribute('data-reactions-enabled', GISCUS_CONFIG.reactionsEnabled);
    script.setAttribute('data-emit-metadata', GISCUS_CONFIG.emitMetadata);
    script.setAttribute('data-input-position', GISCUS_CONFIG.inputPosition);
    script.setAttribute('data-theme', getTheme());
    script.setAttribute('data-lang', getGiscusLang());
    script.setAttribute('data-loading', GISCUS_CONFIG.loading);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    script.onerror = function () {
      const dict = getSocialDict();
      container.innerHTML = '<div class="giscus-fallback">' +
        (dict.comments_failed || 'Comments failed to load. Please open the discussion on GitHub.') +
        '</div>';
    };

    container.appendChild(script);
    giscusLoaded = true;
    disconnectSocialVisibleObserver();
  }

  function clearGiscusMountTimer() {
    if (!giscusMountTimer) return;

    window.clearTimeout(giscusMountTimer);
    giscusMountTimer = null;
  }

  function scheduleGiscusMount(options) {
    if (giscusLoaded) return true;

    const opts = options || {};
    const social = ensureSocialRoot();

    if (!social || !socialIsVisible()) {
      return false;
    }

    if (!document.getElementById('giscus-container')) {
      return false;
    }

    if (giscusMountTimer && opts.replace !== true) {
      return true;
    }

    if (giscusMountTimer && opts.replace === true) {
      clearGiscusMountTimer();
    }

    const delay = Math.max(
      0,
      Number.isFinite(Number(opts.delay)) ? Number(opts.delay) : GISCUS_MOUNT_DELAY
    );

    giscusMountTimer = window.setTimeout(() => {
      giscusMountTimer = null;

      if (!socialIsVisible()) {
        armWhenSocialVisible();
        return;
      }

      mountGiscus();
    }, delay);

    return true;
  }

  function disconnectSocialVisibleObserver() {
    if (!socialVisibleObserver) return;

    socialVisibleObserver.disconnect();
    socialVisibleObserver = null;
  }

  function armWhenSocialVisible() {
    const social = ensureSocialRoot();
    if (!social || giscusLoaded) return;

    if (socialIsVisible()) {
      scheduleGiscusMount();
    }

    if (socialVisibleObserver || giscusLoaded) return;

    socialVisibleObserver = new MutationObserver(() => {
      if (socialIsVisible()) {
        scheduleGiscusMount();
      }

      if (giscusLoaded) {
        disconnectSocialVisibleObserver();
      }
    });

    socialVisibleObserver.observe(social, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  function observeTheme() {
    if (!document.body || themeObserver) return;

    themeObserver = new MutationObserver(function () {
      syncGiscusAppearance();
    });

    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function init() {
    updateStaticTexts();
    observeTheme();
    armWhenSocialVisible();
  }

  function enter() {
    updateStaticTexts();
    observeTheme();

    scheduleGiscusMount({
      delay: GISCUS_MOUNT_DELAY,
      replace: true
    }) || armWhenSocialVisible();
  }

  function refresh() {
    updateStaticTexts();
    observeTheme();

    if (!giscusLoaded) {
      armWhenSocialVisible();
    } else {
      syncGiscusAppearance();
    }
  }

  window.addEventListener('site:langchange', function () {
    updateStaticTexts();
    syncGiscusAppearance();
  });

  window.addEventListener('social:viewchange', function (event) {
    const detail = event && event.detail ? event.detail : {};

    if (detail.view === 'constellation') {
      enter();
    }
  });

  window.SocialComments = {
    init,
    enter,
    refresh,
    mountGiscus,
    scheduleGiscusMount,
    syncGiscusAppearance
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', () => {
    if (socialIsVisible()) {
      enter();
    }
  }, { once: true });
})();