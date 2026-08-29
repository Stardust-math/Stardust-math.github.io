(function () {
  'use strict';

  const resources = window.SiteResources;

  if (!resources) {
    console.error('[SiteEarlyBoot] window.SiteResources is not defined.');
    return;
  }

  const state = {
    selectedCoverFile: null,
    selectedCoverUrl: null
  };

  function normalizeUrl(url) {
    try {
      return new URL(url, document.baseURI).href;
    } catch (e) {
      return url;
    }
  }

  function hasStyle(href) {
    const abs = normalizeUrl(href);
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));

    return links.some((link) => {
      return link.href === abs || normalizeUrl(link.getAttribute('href')) === abs;
    });
  }

  function addStyle(href) {
    if (!href || hasStyle(href)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.siteEarlyBoot = 'style';
    document.head.appendChild(link);
  }

  function setSiteMeta() {
    if (resources.site && resources.site.title) {
      document.title = resources.site.title;
    }

    const favicon = resources.site && resources.site.favicon;
    if (!favicon || !favicon.href) return;

    const existing = document.querySelector('link[rel="icon"]');
    const abs = normalizeUrl(favicon.href);

    if (existing) {
      const oldHref = existing.href || normalizeUrl(existing.getAttribute('href'));
      if (oldHref === abs) return;
      existing.remove();
    }

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon.href;

    if (favicon.type) {
      link.type = favicon.type;
    }

    document.head.appendChild(link);
  }

  function loadCoreStylesEarly() {
    const coreStyles = resources.styles && resources.styles.core;
    if (!Array.isArray(coreStyles)) return;

    coreStyles.forEach(addStyle);
  }

  function chooseCoverFile() {
    const images = resources.images || {};
    const files = Array.isArray(images.coverFiles) ? images.coverFiles : [];

    if (!files.length) return null;

    return files[Math.floor(Math.random() * files.length)];
  }

  function warmCoverImage() {
    const images = resources.images || {};
    const coverDir = images.coverDir || './assets/images/cover/';
    const chosen = chooseCoverFile();

    if (!chosen) return;

    const url = coverDir + chosen;

    state.selectedCoverFile = chosen;
    state.selectedCoverUrl = url;

    const img = new Image();

    try {
      img.decoding = 'async';
    } catch (e) {}

    try {
      img.fetchPriority = 'high';
    } catch (e) {}

    img.src = url;
  }

  function warmAboutProfileImage() {
    const images = resources.images || {};
    const about = images.about || {};
    const url = about.profile || './assets/images/about/profile/profile.jpg';

    if (!url) return;

    const existingPreload = Array.from(document.querySelectorAll('link[rel="preload"][as="image"][href]'))
      .some((link) => {
        return link.href === normalizeUrl(url) || normalizeUrl(link.getAttribute('href')) === normalizeUrl(url);
      });

    if (!existingPreload) {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'image';
      preload.href = url;
      preload.dataset.siteEarlyBoot = 'about-profile-preload';

      try {
        preload.fetchPriority = 'high';
      } catch (e) {}

      try {
        preload.setAttribute('fetchpriority', 'high');
      } catch (e) {}

      document.head.appendChild(preload);
    }

    const img = new Image();

    try {
      img.decoding = 'async';
    } catch (e) {}

    try {
      img.fetchPriority = 'high';
    } catch (e) {}

    img.src = url;
  }

  function isLocalDevelopmentHost() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function scheduleIdle(callback, delay, timeout) {
    if (typeof callback !== 'function') return;

    const waitMs = Math.max(0, Number(delay) || 0);

    window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, {
          timeout: Math.max(0, Number(timeout) || 1600)
        });
        return;
      }

      window.setTimeout(callback, 0);
    }, waitMs);
  }

  function waitForFontsIfNeeded(offlineConfig) {
    if (!offlineConfig.waitForFonts) {
      return Promise.resolve();
    }

    if (!document.fonts || !document.fonts.ready) {
      return Promise.resolve();
    }

    const timeout = Math.max(0, Number(offlineConfig.fontWaitTimeout) || 3000);

    return Promise.race([
      document.fonts.ready.catch(() => {}),
      wait(timeout)
    ]).then(() => {});
  }

  function waitForResourceQuiet(offlineConfig) {
    const quietWindow = Math.max(0, Number(offlineConfig.resourceQuietWindow) || 2200);
    const maxDelay = Math.max(quietWindow, Number(offlineConfig.maxRegisterDelay) || 12000);

    if (!quietWindow) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let resolved = false;
      let quietTimer = null;
      let maxTimer = null;
      let observer = null;

      function cleanup() {
        if (quietTimer) {
          window.clearTimeout(quietTimer);
          quietTimer = null;
        }

        if (maxTimer) {
          window.clearTimeout(maxTimer);
          maxTimer = null;
        }

        if (observer) {
          try {
            observer.disconnect();
          } catch (e) {}

          observer = null;
        }
      }

      function done() {
        if (resolved) return;

        resolved = true;
        cleanup();
        resolve();
      }

      function markActivity() {
        if (resolved) return;

        if (quietTimer) {
          window.clearTimeout(quietTimer);
        }

        quietTimer = window.setTimeout(done, quietWindow);
      }

      if ('PerformanceObserver' in window) {
        try {
          observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            if (entries && entries.length) {
              markActivity();
            }
          });

          observer.observe({
            entryTypes: ['resource']
          });
        } catch (e) {
          observer = null;
        }
      }

      markActivity();
      maxTimer = window.setTimeout(done, maxDelay);
    });
  }

  function registerOfflineFallbackServiceWorker() {
    const offlineConfig = resources.offline || {};

    if (offlineConfig.enabled === false) return;

    if (!('serviceWorker' in navigator)) return;

    if (window.location.protocol === 'file:') return;

    if (!window.isSecureContext && !isLocalDevelopmentHost()) return;

    const serviceWorkerPath = offlineConfig.serviceWorker || '/sw.js';
    const scopePath = offlineConfig.scope || '/';

    function registerNow() {
      const options = {
        scope: scopePath
      };

      if (offlineConfig.updateViaCache) {
        options.updateViaCache = offlineConfig.updateViaCache;
      }

      navigator.serviceWorker.register(serviceWorkerPath, options)
        .catch((err) => {
          console.warn('[SiteEarlyBoot] Offline fallback service worker registration failed:', err);
        });
    }

    function scheduleRegister() {
      Promise.resolve()
        .then(() => wait(Math.max(0, Number(offlineConfig.registerDelay) || 0)))
        .then(() => waitForFontsIfNeeded(offlineConfig))
        .then(() => waitForResourceQuiet(offlineConfig))
        .then(() => {
          scheduleIdle(
            registerNow,
            0,
            offlineConfig.registerTimeout
          );
        })
        .catch(() => {
          scheduleIdle(
            registerNow,
            0,
            offlineConfig.registerTimeout
          );
        });
    }

    if (document.readyState === 'complete') {
      scheduleRegister();
      return;
    }

    window.addEventListener('load', scheduleRegister, { once: true });
  }

  setSiteMeta();
  loadCoreStylesEarly();
  warmCoverImage();
  warmAboutProfileImage();
  registerOfflineFallbackServiceWorker();

  window.SiteEarlyBoot = {
    getSelectedCoverFile() {
      return state.selectedCoverFile;
    },

    getSelectedCoverUrl() {
      return state.selectedCoverUrl;
    }
  };
})();
