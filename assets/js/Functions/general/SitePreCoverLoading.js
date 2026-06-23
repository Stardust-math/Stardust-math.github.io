(function () {
  'use strict';

  const OVERLAY_ID = 'site-precover-loading';
  const STYLE_ID = 'site-precover-loading-critical';
  const ACTIVE_CLASS = 'site-precover-loading-active';
  const HIDING_CLASS = 'is-hiding';

  const COVER_READY_CLASS = 'background-ready';
  const FADE_DURATION = 380;
  const COVER_PAINT_DELAY = 120;
  const FALLBACK_TIMEOUT = 10000;

  let hidden = false;
  let loadReady = false;
  let coverReady = false;
  let hideTimer = null;
  let fallbackTimer = null;
  let coverObserver = null;
  let coverMountObserver = null;

  function cleanupObservers() {
    if (coverObserver) {
      coverObserver.disconnect();
      coverObserver = null;
    }

    if (coverMountObserver) {
      coverMountObserver.disconnect();
      coverMountObserver = null;
    }
  }

  function clearTimers() {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }

    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function finalizeHide() {
    const overlay = document.getElementById(OVERLAY_ID);
    const style = document.getElementById(STYLE_ID);

    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }

    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }

    document.documentElement.classList.remove(ACTIVE_CLASS);
    document.documentElement.removeAttribute('aria-busy');

    cleanupObservers();
    clearTimers();
  }

  function hide() {
    if (hidden) return;

    hidden = true;

    const overlay = document.getElementById(OVERLAY_ID);

    if (!overlay) {
      finalizeHide();
      return;
    }

    overlay.classList.add(HIDING_CLASS);

    window.setTimeout(finalizeHide, FADE_DURATION);
  }

  function scheduleHide() {
    if (hidden || hideTimer) return;

    hideTimer = window.setTimeout(() => {
      hideTimer = null;
      hide();
    }, COVER_PAINT_DELAY);
  }

  function tryHide() {
    if (hidden) return;

    if (loadReady && coverReady) {
      scheduleHide();
    }
  }

  function markLoadReady() {
    loadReady = true;
    tryHide();
  }

  function markCoverReady() {
    coverReady = true;
    tryHide();
  }

  function isCoverReady(coverEl) {
    return !!(
      coverEl &&
      coverEl.classList &&
      coverEl.classList.contains(COVER_READY_CLASS)
    );
  }

  function bindCoverObserver(coverEl) {
    if (!coverEl || coverObserver || coverReady) return;

    if (isCoverReady(coverEl)) {
      markCoverReady();
      return;
    }

    coverObserver = new MutationObserver(() => {
      if (isCoverReady(coverEl)) {
        markCoverReady();
      }
    });

    coverObserver.observe(coverEl, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function watchCoverElement() {
    const existingCover = document.getElementById('cover');

    if (existingCover) {
      bindCoverObserver(existingCover);
      return;
    }

    const mountCover = document.getElementById('mount-cover');
    const observeTarget = mountCover || document.body;

    if (!observeTarget || coverMountObserver) return;

    coverMountObserver = new MutationObserver(() => {
      const coverEl = document.getElementById('cover');

      if (coverEl) {
        bindCoverObserver(coverEl);

        if (coverMountObserver) {
          coverMountObserver.disconnect();
          coverMountObserver = null;
        }
      }
    });

    coverMountObserver.observe(observeTarget, {
      childList: true,
      subtree: true
    });
  }

  function initLoadWatcher() {
    if (document.readyState === 'complete') {
      markLoadReady();
      return;
    }

    window.addEventListener('load', markLoadReady, {
      once: true
    });
  }

  function initFallback() {
    fallbackTimer = window.setTimeout(() => {
      loadReady = true;
      coverReady = true;
      hide();
    }, FALLBACK_TIMEOUT);
  }

  function init() {
    const overlay = document.getElementById(OVERLAY_ID);

    if (!overlay) {
      document.documentElement.classList.remove(ACTIVE_CLASS);
      return;
    }

    document.documentElement.classList.add(ACTIVE_CLASS);
    document.documentElement.setAttribute('aria-busy', 'true');

    initLoadWatcher();
    watchCoverElement();
    initFallback();

    if (isCoverReady(document.getElementById('cover'))) {
      markCoverReady();
    }
  }

  window.SitePreCoverLoading = {
    hide
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }
}());