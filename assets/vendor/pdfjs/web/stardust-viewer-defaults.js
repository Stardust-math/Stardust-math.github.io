(function () {
  'use strict';

  /*
    Stardust PDF.js defaults.

    Wide readers use the document's requested spread mode:
    - outline sidebar open
    - odd spread (two-page) layout by default
    - single-page layout when requested

    Compact readers use a mobile-friendly layout:
    - sidebar closed
    - single-page layout

    The profile is selected from the PDF viewer iframe's own viewport,
    so Archive and Meditations share the same responsive behaviour.
    Visitors can still change the reading mode during the current session.
  */

  const SIDEBAR_VIEW = Object.freeze({
    NONE: 0,
    THUMBS: 1,
    OUTLINE: 2,
    ATTACHMENTS: 3,
    LAYERS: 4
  });

  const SCROLL_MODE = Object.freeze({
    VERTICAL: 0,
    HORIZONTAL: 1,
    WRAPPED: 2,
    PAGE: 3
  });

  const SPREAD_MODE = Object.freeze({
    NONE: 0,
    ODD: 1,
    EVEN: 2
  });

  const SPREAD_PROFILES = Object.freeze({
    none: Object.freeze({
      key: 'none',
      spreadMode: SPREAD_MODE.NONE,
      spreadButtonId: 'spreadNone'
    }),
    odd: Object.freeze({
      key: 'odd',
      spreadMode: SPREAD_MODE.ODD,
      spreadButtonId: 'spreadOdd'
    }),
    even: Object.freeze({
      key: 'even',
      spreadMode: SPREAD_MODE.EVEN,
      spreadButtonId: 'spreadEven'
    })
  });

  const DEFAULT_SPREAD_PROFILE =
    SPREAD_PROFILES.odd;

  const CURSOR_TOOL = Object.freeze({
    SELECT: 0,
    HAND: 1,
    ZOOM: 2
  });

  const VIEW_PROFILES = Object.freeze({
    wide: Object.freeze({
      key: 'wide',
      page: 1,
      zoom: 'page-width',
      sidebarView: SIDEBAR_VIEW.OUTLINE,
      scrollMode: SCROLL_MODE.VERTICAL,
      spreadMode: SPREAD_MODE.ODD,
      cursorTool: CURSOR_TOOL.SELECT,
      rotation: 0,
      spreadButtonId: 'spreadOdd'
    }),

    compact: Object.freeze({
      key: 'compact',
      page: 1,
      zoom: 'page-width',
      sidebarView: SIDEBAR_VIEW.NONE,
      scrollMode: SCROLL_MODE.VERTICAL,
      spreadMode: SPREAD_MODE.NONE,
      cursorTool: CURSOR_TOOL.SELECT,
      rotation: 0,
      spreadButtonId: 'spreadNone'
    })
  });

  /*
    A normal narrow desktop window should also receive the compact layout.
    Coarse-pointer devices receive a slightly wider allowance so phones in
    landscape and common tablets do not fall back to a two-page spread.
  */
  const COMPACT_MAX_WIDTH = 840;
  const COARSE_POINTER_MAX_WIDTH = 1024;

  const RETRY_LIMIT = 36;
  const RETRY_DELAY = 220;
  const LAYOUT_SYNC_DELAYS = Object.freeze([
    120,
    520
  ]);

  let retryCount = 0;
  let retryTimer = null;
  let applied = false;
  let activeProfileKey = '';
  let resizeFrame = null;
  let layoutTimers = [];

  function getApp() {
    return (
      window.PDFViewerApplication ||
      null
    );
  }

  function getOptions() {
    return (
      window.PDFViewerApplicationOptions ||
      null
    );
  }

  function safeCall(fn) {
    try {
      return fn();
    } catch (err) {
      return undefined;
    }
  }

  function callMethod(
    target,
    methodName,
    args
  ) {
    if (
      !target ||
      typeof target[methodName] !==
        'function'
    ) {
      return false;
    }

    try {
      target[methodName].apply(
        target,
        Array.isArray(args)
          ? args
          : []
      );

      return true;
    } catch (err) {
      return false;
    }
  }

  function getViewportWidth() {
    const documentWidth =
      document.documentElement &&
      document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : 0;

    if (documentWidth > 0) {
      return documentWidth;
    }

    return Math.max(
      0,
      Number(window.innerWidth) || 0
    );
  }

  function hasCoarsePointer() {
    return !!(
      typeof window.matchMedia ===
        'function' &&
      window
        .matchMedia('(pointer: coarse)')
        .matches
    );
  }

  function getConfiguredSpreadProfile() {
    let key = '';

    try {
      key = String(
        new URLSearchParams(
          window.location.search
        ).get('spreadmode') || ''
      )
        .trim()
        .toLowerCase();
    } catch (err) {
      key = '';
    }

    return Object.prototype.hasOwnProperty.call(
      SPREAD_PROFILES,
      key
    )
      ? SPREAD_PROFILES[key]
      : DEFAULT_SPREAD_PROFILE;
  }

  function getWideProfile() {
    const spreadProfile =
      getConfiguredSpreadProfile();

    if (
      spreadProfile.spreadMode ===
      VIEW_PROFILES.wide.spreadMode
    ) {
      return VIEW_PROFILES.wide;
    }

    return Object.assign(
      {},
      VIEW_PROFILES.wide,
      {
        key:
          'wide-' + spreadProfile.key,
        spreadMode:
          spreadProfile.spreadMode,
        spreadButtonId:
          spreadProfile.spreadButtonId
      }
    );
  }

  function getViewProfile() {
    const width =
      getViewportWidth();
    const wideProfile =
      getWideProfile();

    /*
      If the iframe has not received a measurable width yet,
      keep the existing desktop profile until PDF.js lays it out.
    */
    if (width <= 0) {
      return wideProfile;
    }

    const compact =
      width <= COMPACT_MAX_WIDTH ||
      (
        hasCoarsePointer() &&
        width <=
          COARSE_POINTER_MAX_WIDTH
      );

    return compact
      ? VIEW_PROFILES.compact
      : wideProfile;
  }

  function setOption(name, value) {
    const options = getOptions();

    if (
      !options ||
      typeof options.set !== 'function'
    ) {
      return;
    }

    safeCall(() => {
      options.set(name, value);
    });
  }

  function applyOptionsBeforeViewerRun(
    profile
  ) {
    const selected =
      profile || getViewProfile();

    /*
      These options are read by PDF.js during startup.

      They prevent remembered desktop preferences from
      shrinking pages when the same viewer is opened in
      a compact iframe.
    */
    setOption(
      'defaultZoomValue',
      selected.zoom
    );

    setOption(
      'sidebarViewOnLoad',
      selected.sidebarView
    );

    setOption(
      'scrollModeOnLoad',
      selected.scrollMode
    );

    setOption(
      'spreadModeOnLoad',
      selected.spreadMode
    );

    setOption(
      'cursorToolOnLoad',
      selected.cursorTool
    );
  }

  function isToggled(button) {
    return !!(
      button &&
      (
        button.classList.contains(
          'toggled'
        ) ||
        button.getAttribute(
          'aria-checked'
        ) === 'true' ||
        button.getAttribute(
          'aria-selected'
        ) === 'true'
      )
    );
  }

  function clickIfNotToggled(id) {
    const button =
      document.getElementById(id);

    if (
      !button ||
      typeof button.click !==
        'function' ||
      isToggled(button)
    ) {
      return;
    }

    button.click();
  }

  function isViewsManagerOpen() {
    const sidebar =
      document.getElementById(
        'viewsManager'
      );

    const toggle =
      document.getElementById(
        'viewsManagerToggleButton'
      );

    if (
      toggle &&
      toggle.getAttribute(
        'aria-expanded'
      ) === 'true'
    ) {
      return true;
    }

    return !!(
      sidebar &&
      sidebar.hidden === false
    );
  }

  function closeViewsManager(app) {
    const viewsManager =
      app && app.viewsManager;

    /*
      Prefer the public PDF.js manager API.
    */
    if (
      callMethod(
        viewsManager,
        'close'
      )
    ) {
      return;
    }

    /*
      Markup fallback for PDF.js builds that do not
      expose viewsManager.close().
    */
    const toggle =
      document.getElementById(
        'viewsManagerToggleButton'
      );

    if (
      isViewsManagerOpen() &&
      toggle &&
      typeof toggle.click ===
        'function'
    ) {
      toggle.click();
    }
  }

  function openOutlineSidebar(app) {
    const viewsManager =
      app && app.viewsManager;

    callMethod(
      viewsManager,
      'switchView',
      [
        SIDEBAR_VIEW.OUTLINE,
        true
      ]
    );

    callMethod(
      viewsManager,
      'open'
    );

    /*
      Fallback based on the current PDF.js viewer markup.
    */
    const sidebar =
      document.getElementById(
        'viewsManager'
      );

    const toggle =
      document.getElementById(
        'viewsManagerToggleButton'
      );

    const outlineButton =
      document.getElementById(
        'outlinesViewMenu'
      );

    if (
      sidebar &&
      sidebar.hidden &&
      toggle &&
      typeof toggle.click ===
        'function'
    ) {
      toggle.click();
    }

    if (
      outlineButton &&
      typeof outlineButton.click ===
        'function' &&
      !isToggled(outlineButton)
    ) {
      outlineButton.click();
    }
  }

  function syncSidebar(
    app,
    profile
  ) {
    if (
      profile.sidebarView ===
      SIDEBAR_VIEW.NONE
    ) {
      closeViewsManager(app);
      return;
    }

    if (
      profile.sidebarView ===
      SIDEBAR_VIEW.OUTLINE
    ) {
      openOutlineSidebar(app);
    }
  }

  function expandOutlineTree() {
    const outlineRoot =
      document.getElementById(
        'outlinesView'
      ) ||
      document.getElementById(
        'outlineView'
      );

    if (!outlineRoot) {
      return;
    }

    /*
      This complements the TeX settings:
      bookmarksopen=true, bookmarksopenlevel=2.
    */
    const togglers =
      outlineRoot.querySelectorAll(
        '.treeItemToggler.treeItemsHidden'
      );

    togglers.forEach(
      (toggler) => {
        toggler.classList.remove(
          'treeItemsHidden'
        );

        toggler.setAttribute(
          'aria-expanded',
          'true'
        );
      }
    );
  }

  function resetScrollPosition() {
    const viewerContainer =
      document.getElementById(
        'viewerContainer'
      );

    if (!viewerContainer) {
      return;
    }

    viewerContainer.scrollTop = 0;
    viewerContainer.scrollLeft = 0;
  }

  function clearLayoutTimers() {
    layoutTimers.forEach(
      (timer) => {
        window.clearTimeout(timer);
      }
    );

    layoutTimers = [];
  }

  function syncToolbar(profile) {
    clickIfNotToggled(
      'scrollVertical'
    );

    clickIfNotToggled(
      profile.spreadButtonId
    );

    clickIfNotToggled(
      'cursorSelectTool'
    );
  }

  function applyScaleAndPage(
    app,
    viewer,
    profile,
    options
  ) {
    const opts = options || {};

    safeCall(() => {
      viewer.currentScaleValue =
        profile.zoom;
    });

    if (opts.resetPage !== true) {
      return;
    }

    safeCall(() => {
      viewer.currentPageNumber =
        profile.page;
    });

    safeCall(() => {
      app.page = profile.page;
    });
  }

  function scheduleLayoutSync(
    app,
    viewer,
    profile,
    options
  ) {
    const opts = options || {};

    clearLayoutTimers();

    LAYOUT_SYNC_DELAYS.forEach(
      (delay, index) => {
        const timer =
          window.setTimeout(
            () => {
              /*
                Keep the visible controls synchronized
                with the direct PDF.js API assignments.
              */
              syncToolbar(profile);

              /*
                Toolbar mode changes can affect layout,
                so assert the sidebar profile before
                recalculating page-width.
              */
              syncSidebar(
                app,
                profile
              );

              applyScaleAndPage(
                app,
                viewer,
                profile,
                {
                  resetPage:
                    opts.resetPage ===
                      true &&
                    index === 0
                }
              );

              if (
                profile.sidebarView ===
                SIDEBAR_VIEW.OUTLINE
              ) {
                expandOutlineTree();
              }

              if (
                opts.resetScroll ===
                  true &&
                index === 0
              ) {
                resetScrollPosition();
              }
            },
            delay
          );

        layoutTimers.push(timer);
      }
    );
  }

  function applyViewerProfile(
    profile,
    options
  ) {
    const app = getApp();

    if (
      !app ||
      !app.pdfViewer
    ) {
      return false;
    }

    const viewer =
      app.pdfViewer;

    const selected =
      profile || getViewProfile();

    const opts =
      options || {};

    safeCall(() => {
      if (
        'pagesRotation' in viewer
      ) {
        viewer.pagesRotation =
          selected.rotation;
      }
    });

    safeCall(() => {
      viewer.scrollMode =
        selected.scrollMode;
    });

    safeCall(() => {
      viewer.spreadMode =
        selected.spreadMode;
    });

    safeCall(() => {
      if (
        app.pdfCursorTools &&
        typeof app.pdfCursorTools
          .switchTool === 'function'
      ) {
        app.pdfCursorTools.switchTool(
          selected.cursorTool
        );
      }
    });

    /*
      Sidebar and spread mode change the usable page width.

      Apply them before page-width so PDF.js measures
      the final document area instead of the old layout.
    */
    syncSidebar(
      app,
      selected
    );

    applyScaleAndPage(
      app,
      viewer,
      selected,
      {
        resetPage:
          opts.resetPage === true
      }
    );

    if (
      selected.sidebarView ===
      SIDEBAR_VIEW.OUTLINE
    ) {
      expandOutlineTree();
    }

    if (
      opts.resetScroll === true
    ) {
      resetScrollPosition();
    }

    scheduleLayoutSync(
      app,
      viewer,
      selected,
      opts
    );

    activeProfileKey =
      selected.key;

    return true;
  }

  function forceDefaults() {
    const profile =
      getViewProfile();

    applyOptionsBeforeViewerRun(
      profile
    );

    return applyViewerProfile(
      profile,
      {
        resetPage: true,
        resetScroll: true
      }
    );
  }

  function scheduleApply(force) {
    applyOptionsBeforeViewerRun(
      getViewProfile()
    );

    if (retryTimer) {
      window.clearTimeout(
        retryTimer
      );

      retryTimer = null;
    }

    if (
      applied &&
      !force
    ) {
      return;
    }

    retryCount = 0;

    function run() {
      const ok =
        forceDefaults();

      if (ok) {
        applied = true;
        return;
      }

      retryCount += 1;

      if (
        retryCount <= RETRY_LIMIT
      ) {
        retryTimer =
          window.setTimeout(
            run,
            RETRY_DELAY
          );
      }
    }

    run();
  }

  function handleViewportChange() {
    if (
      !applied ||
      resizeFrame !== null
    ) {
      return;
    }

    resizeFrame =
      window.requestAnimationFrame(
        () => {
          resizeFrame = null;

          const profile =
            getViewProfile();

          if (
            profile.key ===
            activeProfileKey
          ) {
            return;
          }

          /*
            Preserve the current page and scroll position
            when the reader crosses the responsive
            breakpoint.

            Only the layout profile and page-width are
            recalculated.
          */
          applyViewerProfile(
            profile,
            {
              resetPage: false,
              resetScroll: false
            }
          );
        }
      );
  }

  /*
    PDF.js dispatches "webviewerloaded" before
    PDFViewerApplication.run(config).

    In an iframe it may dispatch to the parent document,
    so listen there when possible.
  */
  try {
    parent.document.addEventListener(
      'webviewerloaded',
      () => {
        scheduleApply(true);
      },
      true
    );
  } catch (err) {
    document.addEventListener(
      'webviewerloaded',
      () => {
        scheduleApply(true);
      },
      true
    );
  }

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      scheduleApply(true);
    },
    {
      once: true
    }
  );

  window.addEventListener(
    'load',
    () => {
      scheduleApply(true);
    },
    {
      once: true
    }
  );

  /*
    These events are emitted during the initial PDF load
    in supported builds.

    Reapplying here ensures the final page canvas uses
    the selected responsive profile.
  */
  document.addEventListener(
    'documentloaded',
    () => {
      scheduleApply(true);
    }
  );

  document.addEventListener(
    'pagesloaded',
    () => {
      scheduleApply(true);
    }
  );

  /*
    This listener performs no PDF work during ordinary
    resizing. It only applies a new profile when the
    iframe crosses from wide to compact, or vice versa.

    requestAnimationFrame coalesces repeated browser
    resize events into a single check.
  */
  window.addEventListener(
    'resize',
    handleViewportChange,
    {
      passive: true
    }
  );
})();
