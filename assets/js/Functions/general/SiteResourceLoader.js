(function () {
  'use strict';

  const resources = window.SiteResources;

  if (!resources) {
    console.error('[SiteResourceLoader] window.SiteResources is not defined.');
    return;
  }

  const loadedStyles = Object.create(null);
  const loadedScripts = Object.create(null);
  const pagePromises = Object.create(null);
  const pageLoaded = Object.create(null);

  const pageWarmupPromises = Object.create(null);
  const pageWarmupLoaded = Object.create(null);

  const DEFAULT_EXISTING_STYLE_TIMEOUT = 5000;

  let bootPromise = null;
  let analyticsStarted = false;

  function toAssetObject(item, keyName) {
    if (typeof item === 'string') {
      return {
        [keyName]: item,
        attrs: {}
      };
    }

    if (item && typeof item === 'object') {
      return {
        [keyName]: item[keyName],
        attrs: item.attrs || {},
        fallbackHref: item.fallbackHref || '',
        timeout: item.timeout
      };
    }

    return {
      [keyName]: '',
      attrs: {}
    };
  }

  function applyAttributes(el, attrs) {
    Object.keys(attrs || {}).forEach((key) => {
      const value = attrs[key];

      if (value === false || value == null) return;

      if (value === true) {
        el.setAttribute(key, '');
        return;
      }

      el.setAttribute(key, String(value));
    });
  }

  function normalizeUrl(url) {
    try {
      return new URL(url, document.baseURI).href;
    } catch (e) {
      return url;
    }
  }

  function findExistingStyle(href) {
    const abs = normalizeUrl(href);
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));

    return links.find((link) => {
      return link.href === abs || normalizeUrl(link.getAttribute('href')) === abs;
    });
  }

  function isStylesheetLoaded(link) {
    if (!link) return false;

    if (link.dataset.siteStyleLoaded === '1') {
      return true;
    }

    if (link.dataset.siteStyleFailed === '1') {
      return false;
    }

    try {
      return !!link.sheet;
    } catch (e) {
      return true;
    }
  }

  function waitForExistingStyle(link, href, timeout) {
    if (!link) return Promise.resolve(null);

    if (link.dataset.siteStyleFailed === '1') {
      return Promise.resolve(null);
    }

    if (isStylesheetLoaded(link)) {
      link.dataset.siteStyleLoaded = '1';
      return Promise.resolve(link);
    }

    if (link.__siteStylePromise) {
      return link.__siteStylePromise;
    }

    link.__siteStylePromise = new Promise((resolve) => {
      const timeoutMs = Math.max(
        0,
        Number(timeout) || DEFAULT_EXISTING_STYLE_TIMEOUT
      );

      let settled = false;
      let timer = null;

      function cleanup() {
        link.removeEventListener('load', handleLoad);
        link.removeEventListener('error', handleError);

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
      }

      function settle(result) {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(result);
      }

      function handleLoad() {
        link.dataset.siteStyleLoaded = '1';
        link.dataset.siteStyleFailed = '0';
        settle(link);
      }

      function handleError() {
        link.dataset.siteStyleFailed = '1';
        link.dataset.siteStyleLoaded = '0';
        console.warn('[SiteResourceLoader] Existing stylesheet failed to load:', href);
        settle(null);
      }

      link.addEventListener('load', handleLoad);
      link.addEventListener('error', handleError);

      if (timeoutMs > 0) {
        timer = window.setTimeout(() => {
          if (isStylesheetLoaded(link)) {
            link.dataset.siteStyleLoaded = '1';
            link.dataset.siteStyleFailed = '0';
            settle(link);
            return;
          }

          console.warn('[SiteResourceLoader] Existing stylesheet load wait timed out:', href);
          settle(link);
        }, timeoutMs);
      }
    });

    return link.__siteStylePromise;
  }

  function findExistingScript(src) {
    const abs = normalizeUrl(src);
    const scripts = Array.from(document.querySelectorAll('script[src]'));

    return scripts.find((script) => {
      return script.src === abs || normalizeUrl(script.getAttribute('src')) === abs;
    });
  }

  function flatten(arrays) {
    return arrays.reduce((acc, item) => {
      if (Array.isArray(item)) {
        acc.push(...item);
      } else if (item) {
        acc.push(item);
      }
      return acc;
    }, []);
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function idle(callback, timeout) {
    if (typeof callback !== 'function') return;

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: timeout || 1600 });
      return;
    }

    window.setTimeout(callback, timeout || 800);
  }

  function setSiteMeta() {
    if (resources.site && resources.site.title) {
      document.title = resources.site.title;
    }

    const favicon = resources.site && resources.site.favicon;
    if (!favicon || !favicon.href) return;

    const oldIcon = document.querySelector('link[rel="icon"]');
    if (oldIcon) oldIcon.remove();

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon.href;

    if (favicon.type) {
      link.type = favicon.type;
    }

    document.head.appendChild(link);
  }

  function loadStyleCandidate(href, attrs, timeout) {
    if (!href) return Promise.resolve(null);

    const existing = findExistingStyle(href);
    if (existing) {
      return waitForExistingStyle(existing, href, timeout);
    }

    return new Promise((resolve) => {
      const link = document.createElement('link');
      const timeoutMs = Math.max(0, Number(timeout) || 0);
      let settled = false;
      let timer = null;

      function settle(result, shouldRemove) {
        if (settled) return;
        settled = true;

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        if (shouldRemove && link.parentNode) {
          link.parentNode.removeChild(link);
        }

        resolve(result);
      }

      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.siteManaged = 'style';

      applyAttributes(link, attrs);

      link.onload = () => {
        link.dataset.siteStyleLoaded = '1';
        link.dataset.siteStyleFailed = '0';
        settle(link, false);
      };

      link.onerror = () => {
        link.dataset.siteStyleFailed = '1';
        link.dataset.siteStyleLoaded = '0';
        console.warn('[SiteResourceLoader] Failed to load stylesheet:', href);
        settle(null, true);
      };

      if (timeoutMs > 0) {
        timer = window.setTimeout(() => {
          link.dataset.siteStyleFailed = '1';
          link.dataset.siteStyleLoaded = '0';
          console.warn('[SiteResourceLoader] Stylesheet load timed out:', href);
          settle(null, true);
        }, timeoutMs);
      }

      document.head.appendChild(link);
    });
  }

  function loadStyle(item) {
    const asset = toAssetObject(item, 'href');
    const href = asset.href;
    if (!href) return Promise.resolve(null);

    const key = normalizeUrl(href);

    if (loadedStyles[key]) {
      return loadedStyles[key];
    }

    loadedStyles[key] = (async () => {
      const primary = await loadStyleCandidate(href, asset.attrs, asset.timeout);

      if (primary) {
        return primary;
      }

      if (asset.fallbackHref) {
        console.warn('[SiteResourceLoader] Loading fallback stylesheet:', asset.fallbackHref);
        return loadStyle(asset.fallbackHref);
      }

      return null;
    })();

    return loadedStyles[key];
  }

  function loadScript(item) {
    const asset = toAssetObject(item, 'src');
    const src = asset.src;
    if (!src) return Promise.resolve(null);

    const key = normalizeUrl(src);

    if (loadedScripts[key]) {
      return loadedScripts[key];
    }

    const existing = findExistingScript(src);
    if (existing) {
      loadedScripts[key] = Promise.resolve(existing);
      return loadedScripts[key];
    }

    loadedScripts[key] = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.siteManaged = 'script';

      applyAttributes(script, asset.attrs);

      script.onload = () => resolve(script);
      script.onerror = () => {
        console.warn('[SiteResourceLoader] Failed to load script:', src);
        resolve(null);
      };

      document.body.appendChild(script);
    });

    return loadedScripts[key];
  }

  async function loadStylesInParallel(items) {
    const list = Array.isArray(items) ? items : [];
    await Promise.all(list.map(loadStyle));
  }

  async function loadScriptsInOrder(items) {
    const list = Array.isArray(items) ? items : [];

    for (const item of list) {
      await loadScript(item);
    }
  }

  function hasWarmupAssets(page) {
    return !!(
      page &&
      (
        (Array.isArray(page.warmupStyles) && page.warmupStyles.length) ||
        (Array.isArray(page.warmupScripts) && page.warmupScripts.length)
      )
    );
  }

  function warmPageExtras(pageKey, reason) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page || !hasWarmupAssets(page)) {
      return Promise.resolve(null);
    }

    if (pageWarmupPromises[pageKey]) {
      return pageWarmupPromises[pageKey];
    }

    pageWarmupPromises[pageKey] = (async () => {
      await loadStylesInParallel(page.warmupStyles || []);
      await loadScriptsInOrder(page.warmupScripts || []);

      pageWarmupLoaded[pageKey] = true;

      try {
        window.dispatchEvent(new CustomEvent('site:pagewarmuploaded', {
          detail: { page: pageKey, config: page, reason: reason || '' }
        }));
      } catch (e) {}

      return page;
    })().catch((err) => {
      console.warn('[SiteResourceLoader] Page extra warm-up failed:', pageKey, reason || '', err);
      return null;
    });

    return pageWarmupPromises[pageKey];
  }

  function startPageExtrasWarmup(pageKey, reason) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page || !hasWarmupAssets(page)) return;
    if (pageWarmupPromises[pageKey] || pageWarmupLoaded[pageKey]) return;

    window.setTimeout(() => {
      warmPageExtras(pageKey, reason || 'post-critical-load');
    }, 0);
  }

  function loadAnalyticsWhenIdle() {
    if (analyticsStarted) return;
    analyticsStarted = true;

    idle(() => {
      const analyticsScripts = flatten([
        resources.external && resources.external.analytics
      ]);

      analyticsScripts.forEach((script) => {
        loadScript(script);
      });
    }, 2000);
  }

  function waitForWindowLoad() {
    if (document.readyState === 'complete') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.addEventListener('load', resolve, { once: true });
    });
  }

  function waitForFontsReady(timeout) {
    if (!document.fonts || !document.fonts.ready) {
      return Promise.resolve();
    }

    const maxWait = Math.max(0, Number(timeout) || 3500);

    return Promise.race([
      document.fonts.ready.catch(() => {}),
      delay(maxWait)
    ]).then(() => {});
  }

  function uniqueValidPages(list) {
    const pages = resources.pages || {};
    const seen = Object.create(null);

    return (Array.isArray(list) ? list : [])
      .filter((page) => page && pages[page] && !seen[page])
      .map((page) => {
        seen[page] = true;
        return page;
      });
  }

  function getLowestPriorityWarmupPages(options) {
    const opts = options || {};
    const navigation = resources.navigation || {};
    const warmup = navigation.warmup || {};

    if (Array.isArray(opts.pages) && opts.pages.length) {
      return uniqueValidPages(opts.pages);
    }

    const list = [];

    if (navigation.defaultPage) {
      list.push(navigation.defaultPage);
    }

    if (Array.isArray(warmup.afterCover)) {
      list.push(...warmup.afterCover);
    }

    if (Array.isArray(warmup.afterFirstPage)) {
      list.push(...warmup.afterFirstPage);
    }

    if (!list.length) {
      list.push('about', 'schedule', 'social', 'life');
    }

    return uniqueValidPages(list);
  }

  function warmupPagesAreSettled(pageKeys) {
    return pageKeys.every((page) => {
      if (isPageLoading(page)) return false;
      if (isPageWarmupLoading(page)) return false;

      return isPageLoaded(page);
    });
  }

  function waitForPageWarmups(options) {
    const opts = options || {};
    const pageKeys = getLowestPriorityWarmupPages(opts);

    if (!pageKeys.length) return Promise.resolve();

    const waitLimit = Math.max(0, Number(opts.maxWait) || 28000);

    return new Promise((resolve) => {
      const startedAt = performance.now();
      let timer = null;

      function cleanup() {
        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        window.removeEventListener('site:pageassetsloaded', check);
        window.removeEventListener('site:pagewarmuploaded', check);
      }

      function done() {
        cleanup();
        resolve();
      }

      function check() {
        if (warmupPagesAreSettled(pageKeys)) {
          done();
          return;
        }

        if (performance.now() - startedAt >= waitLimit) {
          done();
          return;
        }

        timer = window.setTimeout(check, Number(opts.pollInterval) || 520);
      }

      window.addEventListener('site:pageassetsloaded', check);
      window.addEventListener('site:pagewarmuploaded', check);

      check();
    });
  }

  function waitForResourceQuiet(options) {
    const opts = options || {};
    const quietMs = Math.max(0, Number(opts.quietWindow) || 1800);
    const maxMs = Math.max(quietMs, Number(opts.maxWait) || 12000);

    if (!quietMs) return Promise.resolve();

    if (typeof PerformanceObserver !== 'function') {
      return delay(quietMs);
    }

    return new Promise((resolve) => {
      let quietTimer = null;
      let maxTimer = null;
      let observer = null;
      let settled = false;

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
        if (settled) return;

        settled = true;
        cleanup();
        resolve();
      }

      function markActivity() {
        if (settled) return;

        if (quietTimer) {
          window.clearTimeout(quietTimer);
        }

        quietTimer = window.setTimeout(done, quietMs);
      }

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

      markActivity();
      maxTimer = window.setTimeout(done, maxMs);
    });
  }

  function waitForLowestPriorityWindow(options) {
    const opts = options || {};

    return Promise.resolve()
      .then(() => waitForWindowLoad())
      .then(() => {
        if (opts.waitForFonts === false) return null;

        return waitForFontsReady(opts.fontWaitTimeout || 3500);
      })
      .then(() => {
        if (opts.waitForPageWarmups === false) return null;

        return waitForPageWarmups({
          pages: opts.pages,
          maxWait: opts.pageWarmupMaxWait || opts.maxWait || 28000,
          pollInterval: opts.pollInterval || 520
        });
      })
      .then(() => {
        if (opts.waitForResourceQuiet === false) return null;

        return waitForResourceQuiet({
          quietWindow: opts.resourceQuietWindow || 1800,
          maxWait: opts.resourceQuietMaxWait || 12000
        });
      })
      .then(() => new Promise((resolve) => {
        idle(resolve, opts.idleTimeout || 6000);
      }));
  }

  function scheduleLowestPriorityTask(callback, options) {
    if (typeof callback !== 'function') return Promise.resolve(null);

    return waitForLowestPriorityWindow(options)
      .then(() => callback())
      .catch((err) => {
        console.warn('[SiteResourceLoader] Lowest-priority task failed:', err);
        return null;
      });
  }

  async function bootCore() {
    if (bootPromise) return bootPromise;

    bootPromise = (async () => {
      setSiteMeta();

      const externalStyles = flatten([
        resources.external && resources.external.styles
      ]);

      const coreStyles = flatten([
        resources.styles && resources.styles.core
      ]);

      loadStylesInParallel(externalStyles);
      await loadStylesInParallel(coreStyles);

      const coreScripts = flatten([
        resources.scripts && resources.scripts.core,
        resources.scripts && resources.scripts.bootstrap
      ]);

      await loadScriptsInOrder(coreScripts);

      loadAnalyticsWhenIdle();
    })();

    return bootPromise;
  }

  async function loadPage(pageKey) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page) {
      console.warn('[SiteResourceLoader] Unknown page:', pageKey);
      return null;
    }

    if (pagePromises[pageKey]) {
      return pagePromises[pageKey];
    }

    pagePromises[pageKey] = (async () => {
      await loadStylesInParallel(page.styles || []);
      await loadScriptsInOrder(page.scripts || []);

      pageLoaded[pageKey] = true;

      try {
        window.dispatchEvent(new CustomEvent('site:pageassetsloaded', {
          detail: { page: pageKey, config: page }
        }));
      } catch (e) {}

      startPageExtrasWarmup(pageKey, 'post-critical-load');

      return page;
    })();

    return pagePromises[pageKey];
  }

  function warmPage(pageKey, reason) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page) return Promise.resolve(null);

    if (pageLoaded[pageKey]) {
      startPageExtrasWarmup(pageKey, reason || 'warm-page-loaded');
      return Promise.resolve(page);
    }

    return loadPage(pageKey).catch((err) => {
      console.warn('[SiteResourceLoader] Warm-up failed:', pageKey, reason || '', err);
      return null;
    });
  }

  async function warmPagesSequential(pageKeys, options) {
    const opts = options || {};
    const list = Array.isArray(pageKeys) ? pageKeys : [];
    const gap = Number(opts.gap) || 0;

    for (const pageKey of list) {
      await warmPage(pageKey, opts.reason || 'sequence');
      if (gap > 0) await delay(gap);
    }
  }

  function isPageLoaded(pageKey) {
    return !!pageLoaded[pageKey];
  }

  function isPageLoading(pageKey) {
    return !!pagePromises[pageKey] && !pageLoaded[pageKey];
  }

  function isPageWarmupLoaded(pageKey) {
    return !!pageWarmupLoaded[pageKey];
  }

  function isPageWarmupLoading(pageKey) {
    return !!pageWarmupPromises[pageKey] && !pageWarmupLoaded[pageKey];
  }

  function getPageConfig(pageKey) {
    return resources.pages && resources.pages[pageKey]
      ? resources.pages[pageKey]
      : null;
  }

  function getAllPageConfigs() {
    return resources.pages || {};
  }

  window.SiteResourceLoader = {
    bootCore,
    loadPage,
    warmPage,
    warmPageExtras,
    warmPagesSequential,
    isPageLoaded,
    isPageLoading,
    isPageWarmupLoaded,
    isPageWarmupLoading,
    loadStyle,
    loadScript,
    loadStylesInParallel,
    loadScriptsInOrder,
    getPageConfig,
    getAllPageConfigs,

    waitForWindowLoad,
    waitForFontsReady,
    waitForPageWarmups,
    waitForResourceQuiet,
    waitForLowestPriorityWindow,
    scheduleLowestPriorityTask,

    idle,
    delay
  };

  bootCore();
})();
