(function () {
  'use strict';

  let pageConfigs = {};
  let loader = {};
  let warmupConfig = {};
  let defaultPage = 'about';
  let getCurrentPage = function () {
    return null;
  };

  let afterCoverWarmupStarted = false;
  let afterFirstPageWarmupStarted = false;
  let lifeDisplayFontWarmupStarted = false;

  const intentWarmTimers = Object.create(null);

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function toDelay(value, fallback) {
    const n = Number(value);

    if (Number.isFinite(n)) {
      return Math.max(0, n);
    }

    return Math.max(0, Number(fallback) || 0);
  }

  function validPages(list) {
    return (Array.isArray(list) ? list : [])
      .filter((page) => page && pageConfigs[page]);
  }

  function warmPage(page, reason) {
    if (!page || !pageConfigs[page]) {
      return Promise.resolve(null);
    }

    if (!loader || typeof loader.warmPage !== 'function') {
      if (loader && typeof loader.loadPage === 'function') {
        return loader.loadPage(page);
      }

      return Promise.resolve(null);
    }

    return loader.warmPage(page, reason || 'bootstrap');
  }

  function warmLifeDisplayFontsAfterLife() {
    if (lifeDisplayFontWarmupStarted) return;

    lifeDisplayFontWarmupStarted = true;

    const preloader = window.SitePreloader;

    if (!preloader || typeof preloader.warmFontGroupWhenIdle !== 'function') {
      return;
    }

    preloader.warmFontGroupWhenIdle('lifeDisplay', {
      timeout: 3000,
      reason: 'after-life-warmup'
    });
  }

  function scheduleWarmupSequence(pages, options) {
    const opts = options || {};
    const list = validPages(pages);

    if (!list.length) return;

    const startDelay = toDelay(opts.startDelay, 0);
    const gap = toDelay(opts.gap, 0);
    const idleDelay = toDelay(opts.idleDelay, 150);
    const reason = opts.reason || 'sequence';

    const afterPageWarmup = typeof opts.afterPageWarmup === 'function'
      ? opts.afterPageWarmup
      : null;

    function run() {
      window.setTimeout(async () => {
        for (let index = 0; index < list.length; index += 1) {
          const page = list[index];

          if (page !== getCurrentPage()) {
            await warmPage(page, reason);
          }

          if (afterPageWarmup) {
            try {
              afterPageWarmup(page, index, list);
            } catch (e) {
              console.warn('[BootstrapWarmup] afterPageWarmup failed:', page, e);
            }
          }

          if (gap > 0) {
            await delay(gap);
          }
        }
      }, startDelay);
    }

    /*
      Keep the warm-up continuous, but give the browser a very short chance
      to finish immediate cover work first. This avoids blocking the first
      visible screen while still preparing later modules quickly.
    */
    if (idleDelay <= 0) {
      run();
      return;
    }

    if (loader && typeof loader.idle === 'function') {
      loader.idle(run, idleDelay);
    } else {
      window.setTimeout(run, idleDelay);
    }
  }

  function startAfterCoverWarmup() {
    if (afterCoverWarmupStarted) return;

    afterCoverWarmupStarted = true;

    scheduleWarmupSequence(warmupConfig.afterCover || [defaultPage], {
      startDelay: warmupConfig.delayAfterCover || 250,
      gap: warmupConfig.delayBetweenPages || 350,
      idleDelay: warmupConfig.idleAfterCover || 150,
      reason: 'after-cover',
      afterPageWarmup(page) {
        if (page === 'life') {
          warmLifeDisplayFontsAfterLife();
        }
      }
    });
  }

  function startAfterFirstPageWarmup() {
    if (afterFirstPageWarmupStarted) return;

    afterFirstPageWarmupStarted = true;

    scheduleWarmupSequence(warmupConfig.afterFirstPage || [], {
      startDelay: warmupConfig.delayAfterFirstPage || 600,
      gap: warmupConfig.delayBetweenPages || 350,
      idleDelay: warmupConfig.idleAfterFirstPage || 500,
      reason: 'after-first-page',
      afterPageWarmup(page) {
        if (page === 'life') {
          warmLifeDisplayFontsAfterLife();
        }
      }
    });
  }

  function warmPageByIntent(page) {
    if (!page || !pageConfigs[page]) return;

    const hoverDelay = Number(warmupConfig.hoverDelay);
    const ms = Number.isFinite(hoverDelay) ? hoverDelay : 60;

    if (intentWarmTimers[page]) {
      clearTimeout(intentWarmTimers[page]);
    }

    intentWarmTimers[page] = window.setTimeout(() => {
      delete intentWarmTimers[page];
      warmPage(page, 'nav-intent');
    }, ms);
  }

  function configure(options) {
    const opts = options || {};

    pageConfigs = opts.pageConfigs || {};
    loader = opts.loader || {};
    warmupConfig = opts.warmupConfig || {};
    defaultPage = opts.defaultPage || 'about';

    if (typeof opts.getCurrentPage === 'function') {
      getCurrentPage = opts.getCurrentPage;
    }
  }

  function resetWarmupState() {
    afterCoverWarmupStarted = false;
    afterFirstPageWarmupStarted = false;
    lifeDisplayFontWarmupStarted = false;

    Object.keys(intentWarmTimers).forEach((page) => {
      clearTimeout(intentWarmTimers[page]);
      delete intentWarmTimers[page];
    });
  }

  window.BootstrapWarmup = {
    configure,
    delay,
    validPages,
    warmPage,
    scheduleWarmupSequence,
    warmLifeDisplayFontsAfterLife,
    startAfterCoverWarmup,
    startAfterFirstPageWarmup,
    warmPageByIntent,
    resetWarmupState
  };
})();
