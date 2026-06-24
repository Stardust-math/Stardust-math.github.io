(function () {
  'use strict';

  /*
    Stardust PDF.js defaults.

    This script only applies defaults when the PDF.js viewer is opened or refreshed.
    Visitors can still change the reading mode during the current session.
  */

  const DEFAULTS = Object.freeze({
    page: 1,
    zoom: 'page-width',

    /*
      SidebarView:
      NONE        = 0
      THUMBS      = 1
      OUTLINE     = 2
      ATTACHMENTS = 3
      LAYERS      = 4
    */
    sidebarView: 2,

    /*
      ScrollMode:
      VERTICAL   = 0
      HORIZONTAL = 1
      WRAPPED    = 2
      PAGE       = 3
    */
    scrollMode: 0,

    /*
      SpreadMode:
      NONE = 0  -> single-page view
      ODD  = 1  -> two-page view
      EVEN = 2  -> book view
    */
    spreadMode: 1,

    /*
      CursorTool:
      SELECT = 0
      HAND   = 1
      ZOOM   = 2
    */
    cursorTool: 0,

    rotation: 0
  });

  const RETRY_LIMIT = 36;
  const RETRY_DELAY = 220;

  let retryCount = 0;
  let retryTimer = null;
  let applied = false;

  function getApp() {
    return window.PDFViewerApplication || null;
  }

  function getOptions() {
    return window.PDFViewerApplicationOptions || null;
  }

  function safeCall(fn) {
    try {
      return fn();
    } catch (err) {
      return undefined;
    }
  }

  function setOption(name, value) {
    const options = getOptions();

    if (!options || typeof options.set !== 'function') {
      return;
    }

    safeCall(() => options.set(name, value));
  }

  function applyOptionsBeforeViewerRun() {
    /*
      These options are read by PDF.js during startup.
      They help avoid first rendering the old remembered preferences.
    */
    setOption('defaultZoomValue', DEFAULTS.zoom);
    setOption('sidebarViewOnLoad', DEFAULTS.sidebarView);
    setOption('scrollModeOnLoad', DEFAULTS.scrollMode);
    setOption('spreadModeOnLoad', DEFAULTS.spreadMode);
    setOption('cursorToolOnLoad', DEFAULTS.cursorTool);
  }

  function clickIfNotToggled(id) {
    const button = document.getElementById(id);

    if (!button || typeof button.click !== 'function') {
      return;
    }

    const toggled =
      button.classList.contains('toggled') ||
      button.getAttribute('aria-checked') === 'true' ||
      button.getAttribute('aria-selected') === 'true';

    if (!toggled) {
      button.click();
    }
  }

  function openOutlineSidebar(app) {
    const viewsManager = app && app.viewsManager;

    if (viewsManager) {
      safeCall(() => {
        if (typeof viewsManager.switchView === 'function') {
          viewsManager.switchView(DEFAULTS.sidebarView, true);
        }
      });

      safeCall(() => {
        if (typeof viewsManager.open === 'function') {
          viewsManager.open();
        }
      });
    }

    /*
      Fallback based on current PDF.js viewer markup.
    */
    const sidebar = document.getElementById('viewsManager');
    const toggle = document.getElementById('viewsManagerToggleButton');
    const outlineButton = document.getElementById('outlinesViewMenu');

    if (sidebar && sidebar.hidden && toggle && typeof toggle.click === 'function') {
      toggle.click();
    }

    if (outlineButton && typeof outlineButton.click === 'function') {
      const selected =
        outlineButton.classList.contains('toggled') ||
        outlineButton.getAttribute('aria-checked') === 'true' ||
        outlineButton.getAttribute('aria-selected') === 'true';

      if (!selected) {
        outlineButton.click();
      }
    }
  }

  function expandOutlineTree() {
    const outlineRoot =
      document.getElementById('outlinesView') ||
      document.getElementById('outlineView');

    if (!outlineRoot) {
      return;
    }

    /*
      This complements the TeX setting:
      bookmarksopen=true, bookmarksopenlevel=2.
      It is safe even when the PDF already opens bookmarks by itself.
    */
    const togglers = outlineRoot.querySelectorAll('.treeItemToggler.treeItemsHidden');

    togglers.forEach((toggler) => {
      toggler.classList.remove('treeItemsHidden');
      toggler.setAttribute('aria-expanded', 'true');
    });
  }

  function resetScrollPosition() {
    const viewerContainer = document.getElementById('viewerContainer');

    if (!viewerContainer) {
      return;
    }

    viewerContainer.scrollTop = 0;
    viewerContainer.scrollLeft = 0;
  }

  function forceDefaults() {
    const app = getApp();

    if (!app || !app.pdfViewer) {
      return false;
    }

    const viewer = app.pdfViewer;

    safeCall(() => {
      if ('pagesRotation' in viewer) {
        viewer.pagesRotation = DEFAULTS.rotation;
      }
    });

    safeCall(() => {
      viewer.scrollMode = DEFAULTS.scrollMode;
    });

    safeCall(() => {
      viewer.spreadMode = DEFAULTS.spreadMode;
    });

    safeCall(() => {
      viewer.currentScaleValue = DEFAULTS.zoom;
    });

    safeCall(() => {
      viewer.currentPageNumber = DEFAULTS.page;
    });

    safeCall(() => {
      app.page = DEFAULTS.page;
    });

    safeCall(() => {
      if (app.pdfCursorTools && typeof app.pdfCursorTools.switchTool === 'function') {
        app.pdfCursorTools.switchTool(DEFAULTS.cursorTool);
      }
    });

    openOutlineSidebar(app);

    /*
      Synchronize visible toolbar/menu state after PDF.js updates its UI.
      The current viewer menu contains scroll mode buttons and spread mode buttons.
    */
    window.setTimeout(() => {
      clickIfNotToggled('scrollVertical');
      clickIfNotToggled('spreadOdd');
      clickIfNotToggled('cursorSelectTool');

      safeCall(() => {
        viewer.currentScaleValue = DEFAULTS.zoom;
        viewer.currentPageNumber = DEFAULTS.page;
      });

      openOutlineSidebar(app);
      expandOutlineTree();
      resetScrollPosition();
    }, 120);

    window.setTimeout(() => {
      safeCall(() => {
        viewer.currentScaleValue = DEFAULTS.zoom;
        viewer.currentPageNumber = DEFAULTS.page;
      });

      openOutlineSidebar(app);
      expandOutlineTree();
      resetScrollPosition();
    }, 520);

    return true;
  }

  function scheduleApply(force) {
    applyOptionsBeforeViewerRun();

    if (retryTimer) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }

    if (applied && !force) {
      return;
    }

    retryCount = 0;

    function run() {
      const ok = forceDefaults();

      if (ok) {
        applied = true;
        return;
      }

      retryCount += 1;

      if (retryCount <= RETRY_LIMIT) {
        retryTimer = window.setTimeout(run, RETRY_DELAY);
      }
    }

    run();
  }

  /*
    PDF.js dispatches "webviewerloaded" before PDFViewerApplication.run(config).
    In an iframe it dispatches to parent.document, so listen there when possible.
  */
  try {
    parent.document.addEventListener('webviewerloaded', () => {
      scheduleApply(true);
    }, true);
  } catch (err) {
    document.addEventListener('webviewerloaded', () => {
      scheduleApply(true);
    }, true);
  }

  document.addEventListener('DOMContentLoaded', () => {
    scheduleApply(true);
  }, { once: true });

  window.addEventListener('load', () => {
    scheduleApply(true);
  }, { once: true });

  /*
    These DOM events may not exist in every PDF.js build, but listening for them
    is harmless and helps if the viewer forwards them.
  */
  document.addEventListener('documentloaded', () => {
    scheduleApply(true);
  });

  document.addEventListener('pagesloaded', () => {
    scheduleApply(true);
  });
})();