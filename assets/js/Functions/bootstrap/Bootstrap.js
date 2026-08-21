(function () {
  'use strict';

  const resources = window.SiteResources || {};
  const loader = window.SiteResourceLoader || {};
  const pageConfigs = resources.pages || {};
  const navigation = resources.navigation || {};
  const defaultPage = navigation.defaultPage || 'resume';
  const warmupConfig = navigation.warmup || {};

  const routes = window.BootstrapRoutes || {};
  const warmup = window.BootstrapWarmup || {};
  const coverInput = window.BootstrapCoverInput || {};

  const FOOTER_LABEL_SCRIPT_SRC = './assets/js/Functions/general/SiteFooterLabel.js';

  let coverHidden = false;
  let currentPage = null;
  let coverWarmupWatcherBound = false;

  let footerLabelScriptLoadStarted = false;
  let footerLabelInitStarted = false;
  let footerLabelInitRequested = false;

  let defaultPageWarmupStarted = false;
  let defaultPageWarmupPromise = null;

  const MIN_COVER_EXIT_DELAY = 300;

  routes.configure({
    pageConfigs,
    navigation,
    defaultPage
  });

  warmup.configure({
    pageConfigs,
    loader,
    warmupConfig,
    defaultPage,
    getCurrentPage() {
      return currentPage;
    }
  });

  function runWhenIdle(callback, timeout) {
    const numericTimeout = Number(timeout);
    const hasTimeout = Number.isFinite(numericTimeout);

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, {
        timeout: hasTimeout ? Math.max(0, numericTimeout) : 1200
      });
      return;
    }

    window.setTimeout(callback, hasTimeout ? Math.max(0, numericTimeout) : 600);
  }

  function finalizeFooterLabelReady() {
    if (!window.SiteFooterLabel) return;

    if (typeof window.SiteFooterLabel.preloadEmblem === 'function') {
      window.SiteFooterLabel.preloadEmblem();
    }

    if (
      footerLabelInitRequested &&
      !footerLabelInitStarted &&
      typeof window.SiteFooterLabel.init === 'function'
    ) {
      footerLabelInitStarted = true;
      window.__SiteFooterLabelPreloadOnly = false;
      window.SiteFooterLabel.init();
    }
  }

  function loadFooterLabelNonBlocking(options) {
    const opts = options || {};
    const timeout = Number.isFinite(Number(opts.timeout))
      ? Number(opts.timeout)
      : 1400;
    const preloadEmblemOnly = opts.preloadEmblemOnly === true;
    const shouldInit = !preloadEmblemOnly;

    if (shouldInit) {
      footerLabelInitRequested = true;
      window.__SiteFooterLabelPreloadOnly = false;
    }

    if (window.SiteFooterLabel) {
      finalizeFooterLabelReady();
      return;
    }

    if (footerLabelScriptLoadStarted) {
      return;
    }

    footerLabelScriptLoadStarted = true;

    if (preloadEmblemOnly && !footerLabelInitRequested) {
      window.__SiteFooterLabelPreloadOnly = true;
    }

    runWhenIdle(() => {
      if (window.SiteFooterLabel) {
        finalizeFooterLabelReady();
        return;
      }

      if (document.querySelector('script[data-site-footer-label-script="1"]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = FOOTER_LABEL_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-site-footer-label-script', '1');

      script.onload = () => {
        finalizeFooterLabelReady();
      };

      document.body.appendChild(script);
    }, timeout);
  }

  function warmDefaultPageImmediately(reason) {
    if (defaultPageWarmupStarted) {
      return defaultPageWarmupPromise || Promise.resolve(null);
    }

    defaultPageWarmupStarted = true;

    if (
      warmup &&
      typeof warmup.warmPage === 'function'
    ) {
      defaultPageWarmupPromise = warmup.warmPage(defaultPage, reason || 'cover-default-priority')
        .catch((err) => {
          console.warn('[Bootstrap] Default page warm-up failed:', err);
          return null;
        });

      return defaultPageWarmupPromise;
    }

    defaultPageWarmupPromise = Promise.resolve(null);
    return defaultPageWarmupPromise;
  }

  function getPageElement(page) {
    return routes.getPageElement(page);
  }

  function getPageContext(page, extra) {
    return routes.getPageContext(page, extra);
  }

  function isCoverRoute() {
    return !routes.getPageFromPath(window.location.pathname);
  }

  function canStartAfterCoverWarmup() {
    return isCoverRoute() && !coverHidden;
  }

  function triggerAfterCoverWarmup() {
    if (!canStartAfterCoverWarmup()) return;

    warmDefaultPageImmediately('cover-background-ready-default-page')
      .finally(() => {
        /*
          Start the footer emblem request after the cover and About resources,
          but before warming later modules. This only starts the emblem request;
          it never waits for the image to finish loading.
        */
        loadFooterLabelNonBlocking({
          timeout: 0,
          preloadEmblemOnly: true
        });

        if (
          warmup &&
          typeof warmup.startAfterCoverWarmup === 'function'
        ) {
          warmup.startAfterCoverWarmup();
        }
      });
  }

  function startAfterCoverWarmupWhenReady(reason) {
    if (!canStartAfterCoverWarmup()) return;

    const cover = document.getElementById('cover');

    if (!cover) {
      window.setTimeout(() => {
        startAfterCoverWarmupWhenReady(reason || 'cover-missing-retry');
      }, 120);
      return;
    }

    if (cover.classList.contains('background-ready')) {
      window.setTimeout(() => {
        triggerAfterCoverWarmup();
      }, 80);
      return;
    }

    if (coverWarmupWatcherBound) return;
    coverWarmupWatcherBound = true;

    if (typeof MutationObserver !== 'function') {
      window.setTimeout(() => {
        if (
          cover.classList.contains('background-ready') ||
          document.readyState === 'complete'
        ) {
          triggerAfterCoverWarmup();
        }
      }, 2000);
      return;
    }

    const observer = new MutationObserver(() => {
      if (cover.classList.contains('background-ready')) {
        observer.disconnect();

        window.setTimeout(() => {
          triggerAfterCoverWarmup();
        }, 80);
      }
    });

    observer.observe(cover, {
      attributes: true,
      attributeFilter: ['class']
    });

    window.setTimeout(() => {
      observer.disconnect();

      if (
        cover.classList.contains('background-ready') ||
        document.readyState === 'complete'
      ) {
        triggerAfterCoverWarmup();
      }
    }, 3500);
  }

  function runPageInit(page) {
    const sitePages = window.SitePages;

    if (sitePages && typeof sitePages.init === 'function') {
      sitePages.init(page, getPageContext(page));
      return;
    }

    if (page === 'schedule' && window.Schedule) {
      if (typeof window.Schedule.initSchedulePage === 'function') {
        window.Schedule.initSchedulePage();
      }

      if (typeof window.Schedule.initWeeksSelection === 'function') {
        window.Schedule.initWeeksSelection();
      }

      if (typeof window.Schedule.initSemesterSelection === 'function') {
        window.Schedule.initSemesterSelection();
      }
    }

    if (
      page === 'toolkit' &&
      window.Toolkit &&
      typeof window.Toolkit.initToolkitFilter === 'function'
    ) {
      window.Toolkit.initToolkitFilter();
    }
  }

  function runPageEnter(page, previousPage) {
    const sitePages = window.SitePages;

    if (sitePages && typeof sitePages.enter === 'function') {
      sitePages.enter(page, getPageContext(page, {
        previousPage
      }));
      return;
    }

    if (
      page === 'schedule' &&
      window.Schedule &&
      typeof window.Schedule.setScheduleView === 'function'
    ) {
      window.Schedule.setScheduleView('my-timetable');
    }
  }

  function runPageLeave(page, nextPage) {
    const sitePages = window.SitePages;

    if (sitePages && typeof sitePages.leave === 'function') {
      sitePages.leave(page, getPageContext(page, {
        nextPage
      }));
    }
  }

  function initLoadedPage(page) {
    const pageId = routes.getPageDomId(page);
    const pageEl = pageId ? document.getElementById(pageId) : null;

    runPageInit(page);

    if (
      window.SiteLang &&
      typeof window.SiteLang.applyLanguage === 'function'
    ) {
      const lang = window.SiteLang.getLang ? window.SiteLang.getLang() : 'en';
      window.SiteLang.applyLanguage(lang);
    }

    if (
      window.Theme &&
      typeof window.Theme.init === 'function'
    ) {
      window.Theme.init();
    }

    if (
      window.Clock &&
      typeof window.Clock.updateClock === 'function'
    ) {
      window.Clock.updateClock();
    }

    if (
      window.ResumeExpanders &&
      typeof window.ResumeExpanders.init === 'function'
    ) {
      window.ResumeExpanders.init(pageEl || document);
    }

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(pageEl || document);
    }
  }

  function warmPageCriticalAssetsNonBlocking(page) {
    if (
      page === 'resume' &&
      window.AboutResumeRender &&
      typeof window.AboutResumeRender.waitForCriticalImages === 'function'
    ) {
      window.AboutResumeRender.waitForCriticalImages({
        timeout: 1400
      }).catch((err) => {
        console.warn('[Bootstrap] Non-blocking resume image warm-up failed:', err);
      });
    }
  }

  async function ensurePageAssets(page) {
    if (!pageConfigs[page]) return false;

    if (!loader || typeof loader.loadPage !== 'function') {
      console.error('[Bootstrap] SiteResourceLoader.loadPage is not available.');
      return false;
    }

    await loader.loadPage(page);
    initLoadedPage(page);

    warmPageCriticalAssetsNonBlocking(page);

    return true;
  }

  function activatePage(targetPage, opts) {
    const targetEl = getPageElement(targetPage);
    if (!targetEl) return false;

    const options = opts || {};
    const previousPage = currentPage;
    const restorePath = options.restoreScrollPath || window.location.pathname;
    const nextScrollPath = (
      options.updateHistory &&
      routes.hasRouteForPage(targetPage)
    )
      ? routes.getRouteForPage(targetPage)
      : restorePath;

    if (previousPage && previousPage !== targetPage) {
      if (options.skipSaveCurrentScroll !== true) {
        routes.saveCurrentScrollPosition();
      }

      runPageLeave(previousPage, targetPage);
    }

    routes.hideAllPages();

    targetEl.classList.add('visible');

    currentPage = targetPage;
    routes.setCurrentScrollPath(nextScrollPath);

    if (options.restoreScroll) {
      const restored = routes.restoreSavedScrollPosition(restorePath);

      if (!restored && options.scrollBehavior !== 'none') {
        routes.scrollTargetIntoView(routes.getPageDomId(targetPage), options.scrollBehavior);
      }
    } else if (options.scrollBehavior !== 'none') {
      routes.scrollTargetIntoView(routes.getPageDomId(targetPage), options.scrollBehavior);
    }

    runPageEnter(targetPage, previousPage);

    if (window.TopNav) {
      window.TopNav.show();
      window.TopNav.setActive(currentPage);
    }

    if (
      options.updateHistory &&
      routes.hasRouteForPage(currentPage)
    ) {
      routes.syncHistory(
        routes.getRouteForPage(currentPage),
        options.replaceHistory,
        {
          saveScroll: false
        }
      );
    }

    if (
      warmup &&
      typeof warmup.startAfterFirstPageWarmup === 'function'
    ) {
      warmup.startAfterFirstPageWarmup();
    }

    loadFooterLabelNonBlocking();

    return true;
  }

  async function showPage(page, options) {
    coverInput.stopCoverEnterHint();

    const opts = Object.assign({
      updateHistory: true,
      replaceHistory: false,
      instant: false,
      scrollBehavior: 'smooth',
      restoreScroll: false,
      restoreScrollPath: null,
      skipSaveCurrentScroll: false
    }, options || {});

    if (!pageConfigs[page]) return;

    if (coverHidden && currentPage === page) {
      if (
        opts.updateHistory &&
        routes.hasRouteForPage(page)
      ) {
        routes.syncHistory(
          routes.getRouteForPage(page),
          opts.replaceHistory
        );
      }

      if (opts.restoreScroll) {
        const restorePath =
          opts.restoreScrollPath ||
          window.location.pathname;

        routes.setCurrentScrollPath(restorePath);

        requestAnimationFrame(() => {
          routes.restoreSavedScrollPosition(
            restorePath
          );
        });
      }

      return;
    }

    if (!coverHidden && page === defaultPage) {
      warmDefaultPageImmediately('cover-enter-request');
    }

    const cover = document.getElementById('cover');
    const loadPromise = ensurePageAssets(page);

    if (coverHidden || opts.instant) {
      const loaded = await loadPromise;
      if (!loaded) return;

      const target = getPageElement(page);
      if (!cover || !target) return;

      cover.classList.add('hidden');
      cover.classList.remove('visible', 'leaving');
      cover.style.display = 'none';

      document.body.style.overflow = 'auto';

      coverHidden = true;

      activatePage(page, opts);
      document.documentElement.classList.remove('route-entry');

      return;
    }

    if (!cover) {
      const loaded = await loadPromise;
      if (!loaded) return;

      activatePage(page, opts);

      return;
    }

    cover.classList.add('leaving');
    coverInput.hideCoverElements();

    const results = await Promise.all([
      loadPromise,
      warmup.delay(MIN_COVER_EXIT_DELAY)
    ]);

    const loaded = results[0];
    if (!loaded) return;

    const target = getPageElement(page);
    if (!target) return;

    cover.classList.add('hidden');
    cover.classList.remove('visible', 'leaving');
    cover.style.display = 'none';

    document.body.style.overflow = 'auto';

    coverHidden = true;

    activatePage(page, opts);
    document.documentElement.classList.remove('route-entry');
  }

  function backToCover(options) {
    const opts = Object.assign({
      updateHistory: true,
      replaceHistory: false,
      instant: false
    }, options || {});

    const cover = document.getElementById('cover');
    if (!cover) return;

    if (currentPage) {
      routes.saveCurrentScrollPosition();
      runPageLeave(currentPage, null);
    }

    coverHidden = false;
    currentPage = null;

    if (window.TopNav) {
      window.TopNav.hide();
      window.TopNav.setActive('');
    }

    cover.style.display = 'flex';
    cover.classList.remove('hidden', 'leaving');

    routes.hideAllPages();

    [
      'resume-back-btn',
      'social-back-btn',
      'toolkit-back-btn',
      'schedule-back-btn'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    if (opts.updateHistory) {
      routes.syncHistory(
        routes.getCoverRoute(),
        opts.replaceHistory,
        {
          saveScroll: false
        }
      );
    }

    if (opts.instant) {
      cover.classList.add('visible');
      coverInput.showCoverElements();
      startAfterCoverWarmupWhenReady('back-to-cover-instant');

      return;
    }

    setTimeout(() => {
      cover.classList.add('visible');
      coverInput.showCoverElements();
      startAfterCoverWarmupWhenReady('back-to-cover');
    }, 100);
  }

  function syncLanguageFromLocation(options) {
    if (
      window.SiteLang &&
      typeof window.SiteLang.syncFromLocation === 'function'
    ) {
      return window.SiteLang.syncFromLocation(options);
    }

    return null;
  }

  async function applyRouteFromLocation(options) {
    const opts = options || {};

    if (opts.syncLanguage !== false) {
      syncLanguageFromLocation({
        emitLangChange: opts.emitLangChange === true,
        canonicalize: true,
        preserveNeutralRoute: true
      });
    }

    if (
      typeof routes.syncDocumentMetadata === 'function'
    ) {
      routes.syncDocumentMetadata(
        window.location.pathname
      );
    }

    const page = routes.getPageFromPath(window.location.pathname);

    if (page) {
      await showPage(page, Object.assign({
        updateHistory: false,
        instant: true,
        scrollBehavior: 'auto',
        restoreScroll: true,
        restoreScrollPath: window.location.pathname
      }, opts));

      return;
    }

    backToCover(Object.assign({
      updateHistory: false,
      instant: true
    }, opts));
  }

  async function bootDOMContentLoaded() {
    if (
      window.Theme &&
      typeof window.Theme.init === 'function'
    ) {
      window.Theme.init();
    }

    if (
      window.TopNav &&
      typeof window.TopNav.init === 'function'
    ) {
      window.TopNav.init(
        showPage,
        backToCover,
        warmup.warmPageByIntent
      );
    }

    if (
      window.Clock &&
      typeof window.Clock.initToggle === 'function'
    ) {
      window.Clock.initToggle();
    }

    coverInput.bindCoverArrowAndScroll();

    const initialPage = routes.getPageFromPath(window.location.pathname);

    if (initialPage) {
      await applyRouteFromLocation({
        updateHistory: false,
        instant: true,
        scrollBehavior: 'auto',
        restoreScroll: true,
        restoreScrollPath: window.location.pathname
      });
    } else {
      startAfterCoverWarmupWhenReady('dom-content-loaded');
    }
  }

  function bootOnLoad() {
    const initialPage = routes.getPageFromPath(window.location.pathname);

    if (!initialPage) {
      if (window.TopNav) {
        window.TopNav.hide();
      }

      document.body.style.overflow = 'hidden';

      const cover = document.getElementById('cover');

      if (cover) {
        cover.classList.add('visible');
        coverInput.showCoverElements();
        startAfterCoverWarmupWhenReady('window-load');
      }
    }

    coverInput.bindCoverArrowAndScroll();

    if (
      window.Clock &&
      typeof window.Clock.start === 'function'
    ) {
      window.Clock.start();
    }
  }

  coverInput.configure({
    defaultPage,
    showPage,
    warmPage(page, reason) {
      return warmup.warmPage(page, reason);
    },
    isCoverHidden() {
      return coverHidden;
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDOMContentLoaded);
  } else {
    bootDOMContentLoaded();
  }

  window.addEventListener('popstate', () => {
    routes.saveCurrentScrollPosition({
      includeLocationPath: false
    });

    routes.setCurrentScrollPath(
      window.location.pathname
    );

    applyRouteFromLocation({
      syncLanguage: true,
      emitLangChange: true,
      restoreScroll: true,
      restoreScrollPath: window.location.pathname,
      skipSaveCurrentScroll: true
    });
  });

  window.addEventListener('load', bootOnLoad);

  window.Bootstrap = {
    showPage,
    backToCover,
    applyRouteFromLocation,
    ensurePageAssets,
    activatePage,
    getCurrentPage() {
      return currentPage;
    },
    isCoverHidden() {
      return coverHidden;
    }
  };
})();
