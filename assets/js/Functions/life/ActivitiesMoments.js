(function () {
  'use strict';

  const STATE = {
    initialized: false,
    mode: 'list',
    dateKey: null
  };

  let detailRenderToken = 0;

  function U() {
    return window.ActivitiesMomentsUtils || null;
  }

  function R() {
    return window.ActivitiesMomentsRender || null;
  }

  function M() {
    return window.ActivitiesMomentsMedia || null;
  }

  function getMount() {
    const utils = U();
    return utils ? utils.getMount() : document.getElementById('mount-activities_moments');
  }

  function bindBackgroundWarmupEvents() {
    const media = M();

    if (media && typeof media.bindBackgroundWarmupEvents === 'function') {
      media.bindBackgroundWarmupEvents();
    }
  }

  function startGalleryImageWarmup(reason) {
    const media = M();

    if (media && typeof media.startGalleryImageWarmup === 'function') {
      media.startGalleryImageWarmup(reason);
    }
  }

  function syncMomentIndex() {
    const mount = getMount();

    if (
      mount &&
      window.ActivitiesMomentsIndex &&
      typeof window.ActivitiesMomentsIndex.scheduleSync === 'function'
    ) {
      window.ActivitiesMomentsIndex.scheduleSync(mount);
    }
  }

  function refreshCursor() {
    const mount = getMount();

    if (
      mount &&
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(mount);
    }
  }

  function isPlainLeftClick(event) {
    return !!(
      event &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.defaultPrevented
    );
  }

  function shouldUseClientNavigation(event, control) {
    return !(
      control &&
      control.tagName &&
      control.tagName.toLowerCase() === 'a'
    ) || isPlainLeftClick(event);
  }

  function bindEvents() {
    const mount = getMount();
    if (!mount || mount.dataset.activitiesMomentsBound === '1') return;

    mount.dataset.activitiesMomentsBound = '1';

    mount.addEventListener('click', (event) => {
      const back = event.target.closest('[data-am-action="back"]');
      if (back) {
        if (!shouldUseClientNavigation(event, back)) return;

        event.preventDefault();
        showList({ updateHistory: true });
        return;
      }

      const view = event.target.closest('[data-am-action="view"][data-date-key]');
      if (view) {
        if (!shouldUseClientNavigation(event, view)) return;

        event.preventDefault();

        const dateKey = view.getAttribute('data-date-key');
        if (dateKey) {
          showDetail(dateKey, { updateHistory: true });
        }
        return;
      }

      const imageButton = event.target.closest('[data-am-image]');
      if (imageButton) {
        event.preventDefault();

        const media = M();
        if (media && typeof media.openLightbox === 'function') {
          media.openLightbox(imageButton.getAttribute('data-am-image'));
        }
      }
    });

    mount.addEventListener('keydown', (event) => {
      if (event.key !== ' ' && event.key !== 'Spacebar') return;

      const back = event.target.closest('[data-am-action="back"]');
      if (back) {
        event.preventDefault();
        showList({ updateHistory: true });
        return;
      }

      const view = event.target.closest('[data-am-action="view"][data-date-key]');
      if (view) {
        event.preventDefault();

        const dateKey = view.getAttribute('data-date-key');
        if (dateKey) {
          showDetail(dateKey, { updateHistory: true });
        }
      }
    });
  }

  function showList(options) {
    const opts = options || {};
    const utils = U();
    const render = R();
    const mount = getMount();

    if (!utils || !render || !mount) return;

    detailRenderToken += 1;

    STATE.mode = 'list';
    STATE.dateKey = null;

    if (opts.updateHistory) {
      utils.pushRoute(utils.getListRoute(), opts.replaceHistory);
    }

    mount.innerHTML = render.renderListHtml();
    bindEvents();
    refreshCursor();

    if (opts.scroll !== false) {
      scrollToMount();
    }
  }

  async function showDetail(dateKey, options) {
    const opts = options || {};
    const utils = U();
    const render = R();
    const mount = getMount();

    if (!utils || !render || !mount) return;

    const token = ++detailRenderToken;
    const lang = utils.getLang();
    const initialMoment = utils.getMomentByKey(dateKey);

    if (!initialMoment) {
      showList({
        updateHistory: opts.updateHistory,
        replaceHistory: true,
        scroll: opts.scroll
      });
      return;
    }

    STATE.mode = 'detail';
    STATE.dateKey = dateKey;

    if (opts.updateHistory) {
      utils.pushRoute(utils.getDetailRoute(dateKey), opts.replaceHistory);
    }

    let didScroll = false;

    if (!utils.hasDetailInLang(lang, dateKey)) {
      mount.innerHTML = render.renderDetailLoadingHtml(initialMoment);
      bindEvents();
      syncMomentIndex();
      refreshCursor();

      if (opts.scroll !== false) {
        scrollToMount();
        didScroll = true;
      }

      await utils.ensureMomentDetail(dateKey);

      if (
        token !== detailRenderToken ||
        STATE.mode !== 'detail' ||
        STATE.dateKey !== dateKey
      ) {
        return;
      }
    }

    const moment = utils.getMomentByKey(dateKey);

    if (!moment) {
      showList({
        updateHistory: false,
        replaceHistory: true,
        scroll: opts.scroll
      });
      return;
    }

    mount.innerHTML = render.renderDetailHtml(moment);
    bindEvents();
    syncMomentIndex();
    refreshCursor();

    if (opts.scroll !== false && !didScroll) {
      scrollToMount();
    }
  }

  function scrollToMount() {
    const section = document.getElementById('activities_moments-section');
    const target = section || getMount();

    if (!target) return;

    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {}
  }

  function renderCurrent(options) {
    const opts = options || {};
    const utils = U();

    if (!utils) return;

    const dateKeyFromPath = utils.resolveDateKeyFromPath(window.location.pathname);

    if (dateKeyFromPath) {
      showDetail(dateKeyFromPath, {
        updateHistory: false,
        scroll: opts.scroll
      });
      return;
    }

    if (STATE.mode === 'detail' && STATE.dateKey) {
      showDetail(STATE.dateKey, {
        updateHistory: false,
        scroll: opts.scroll
      });
      return;
    }

    showList({
      updateHistory: false,
      scroll: opts.scroll
    });
  }

  function syncWithLocation(options) {
    const opts = options || {};
    const utils = U();

    if (!utils) return;

    const dateKey = utils.resolveDateKeyFromPath(window.location.pathname);

    if (dateKey) {
      showDetail(dateKey, {
        updateHistory: false,
        scroll: opts.scroll
      });
    } else {
      showList({
        updateHistory: false,
        scroll: opts.scroll
      });
    }
  }

  function getSortedMoments() {
    const utils = U();
    return utils ? utils.getSortedMoments() : [];
  }

  function getMomentByKey(dateKey) {
    const utils = U();
    return utils ? utils.getMomentByKey(dateKey) : null;
  }

  function getListRoute() {
    const utils = U();

    if (utils) return utils.getListRoute();

    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        'life/activities_moments',
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    return '/life/activities_moments/';
  }

  function getDetailRoute(dateKey) {
    const utils = U();

    if (utils) return utils.getDetailRoute(dateKey);

    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        'life/activities_moments/' + encodeURIComponent(dateKey),
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    return '/life/activities_moments/' + encodeURIComponent(dateKey) + '/';
  }

  function resolveDateKeyFromPath(pathname) {
    const utils = U();
    return utils ? utils.resolveDateKeyFromPath(pathname) : null;
  }

  function ensureMomentDetail(dateKey) {
    const utils = U();
    return utils ? utils.ensureMomentDetail(dateKey) : Promise.resolve(false);
  }

  function init() {
    bindBackgroundWarmupEvents();

    if (STATE.initialized) {
      renderCurrent({ scroll: false });
      return;
    }

    STATE.initialized = true;

    bindEvents();
    renderCurrent({ scroll: false });
  }

  window.ActivitiesMoments = {
    init,
    renderCurrent,
    showList,
    showDetail,
    syncWithLocation,
    getSortedMoments,
    getMomentByKey,
    getListRoute,
    getDetailRoute,
    resolveDateKeyFromPath,
    ensureMomentDetail,
    startGalleryImageWarmup
  };

  bindBackgroundWarmupEvents();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
