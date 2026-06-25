(function () {
  'use strict';

  const GC_SITE = 'https://stardust.goatcounter.com';

  const MAPMYVISITORS_MAP_SRC =
    'https://mapmyvisitors.com/map.js?d=lv35skyX2lbyweEWXclKdlDX6sBuXZH9CUyHouy4nk4&cl=ffffff&w=a';

  const VISITOR_MAP_RESIZE_DEBOUNCE = 320;
  const VISITOR_MAP_WIDTH_EPSILON = 8;

  const SOCIAL_RESOURCE_START_DELAY = 60;
  const GOATCOUNTER_STATS_DELAY = 60;
  const GOATCOUNTER_DASHBOARD_DELAY = 180;
  const VISITOR_MAP_DELAY = 280;
  const VISITOR_MAP_SCRIPT_DELAY = 80;

  let statsStarted = false;
  let statsFinished = false;
  let goatCounterFrameStarted = false;
  let visitorMapStarted = false;
  let visitorMapScriptStarted = false;
  let visibleObserver = null;
  let delayedLoadTimer = null;

  let visitorMapResizeStarted = false;
  let visitorMapResizeObserver = null;
  let visitorMapResizeTimer = null;
  let visitorMapLastSignature = null;

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

  function isFootprintsActive() {
    if (window.SocialShell && typeof window.SocialShell.isViewActive === 'function') {
      return window.SocialShell.isViewActive('footprints');
    }

    const section = document.querySelector('#social .social-section[data-view="footprints"]');

    if (!section) {
      return true;
    }

    return section.classList.contains('active') && !section.hidden;
  }

  function socialIsVisible() {
    const social = getSocialRoot();
    if (!social || !isFootprintsActive()) return false;

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

  function allSocialStatsResourcesStarted() {
    return statsStarted && goatCounterFrameStarted && visitorMapScriptStarted;
  }

  function disconnectVisibleObserverIfDone() {
    if (!visibleObserver || !allSocialStatsResourcesStarted()) return;

    visibleObserver.disconnect();
    visibleObserver = null;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setStatsFallback() {
    ['gc-total', 'gc-month', 'gc-week', 'gc-page'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.textContent = '—';
      el.title = 'GoatCounter visitor-counter may be disabled or blocked.';
    });
  }

  async function fetchCounter(path, start) {
    const qs = new URLSearchParams();
    if (start) qs.set('start', start);

    const url = `${GC_SITE}/counter/${encodeURIComponent(path)}.json${qs.toString() ? '?' + qs.toString() : ''}`;
    const response = await fetch(url, { mode: 'cors' });

    if (!response.ok) {
      throw new Error(`GoatCounter counter failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.count != null) {
      return data.count;
    }

    if (data && data.count_unique != null) {
      return data.count_unique;
    }

    return '—';
  }

  async function initStats() {
    if (statsStarted) return;

    statsStarted = true;
    disconnectVisibleObserverIfDone();

    try {
      const currentPath = window.location.pathname || '/';

      const [
        total,
        month,
        week,
        page
      ] = await Promise.all([
        fetchCounter('TOTAL'),
        fetchCounter('TOTAL', 'month'),
        fetchCounter('TOTAL', 'week'),
        fetchCounter(currentPath)
      ]);

      setText('gc-total', total);
      setText('gc-month', month);
      setText('gc-week', week);
      setText('gc-page', page);
    } catch (e) {
      setStatsFallback();
    } finally {
      statsFinished = true;
    }
  }

  function loadGoatCounterFrame() {
    if (goatCounterFrameStarted) return;

    const frame = document.querySelector('#social .goatcounter-frame');
    if (!frame) return;

    const src = frame.getAttribute('data-src');
    if (!src) return;

    frame.setAttribute('loading', 'eager');
    frame.setAttribute('fetchpriority', 'low');

    try {
      frame.loading = 'eager';
    } catch (e) {}

    try {
      frame.fetchPriority = 'low';
    } catch (e) {}

    if (!frame.getAttribute('src')) {
      frame.setAttribute('src', src);
    }

    goatCounterFrameStarted = true;
    disconnectVisibleObserverIfDone();
  }

  function getVisitorMapPlaceholder() {
    return document.getElementById('visitor-map-placeholder');
  }

  function readVisitorMapSignature() {
    const placeholder = getVisitorMapPlaceholder();
    const slot = document.getElementById('visitor-map-slot');
    const target = slot || placeholder;

    if (!target) return null;

    let width = 0;

    try {
      width = Math.round(target.getBoundingClientRect().width);
    } catch (e) {
      width = Math.round(target.offsetWidth || 0);
    }

    const visualViewport = window.visualViewport || null;

    return {
      width,
      innerWidth: Math.round(window.innerWidth || 0),
      devicePixelRatio: Math.round((window.devicePixelRatio || 1) * 100),
      viewportWidth: visualViewport ? Math.round(visualViewport.width || 0) : 0,
      viewportScale: visualViewport ? Math.round((visualViewport.scale || 1) * 100) : 100
    };
  }

  function visitorMapSignatureChanged(current, previous) {
    if (!current || !previous) return true;

    return (
      Math.abs(current.width - previous.width) > VISITOR_MAP_WIDTH_EPSILON ||
      Math.abs(current.innerWidth - previous.innerWidth) > VISITOR_MAP_WIDTH_EPSILON ||
      current.devicePixelRatio !== previous.devicePixelRatio ||
      Math.abs(current.viewportWidth - previous.viewportWidth) > VISITOR_MAP_WIDTH_EPSILON ||
      current.viewportScale !== previous.viewportScale
    );
  }

  function appendMapMyVisitorsScript(target, id, src) {
    if (!target) return;

    if (target.querySelector(`#${id}`)) {
      visitorMapScriptStarted = true;
      disconnectVisibleObserverIfDone();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = id;
    script.async = false;
    script.src = src;

    script.addEventListener('error', () => {
      if (!target.querySelector('.visitor-widget-fallback')) {
        const fallback = document.createElement('div');
        fallback.className = 'visitor-widget-fallback';
        fallback.textContent = 'Visitor map failed to load.';
        target.appendChild(fallback);
      }
    }, { once: true });

    target.appendChild(script);

    visitorMapScriptStarted = true;
    disconnectVisibleObserverIfDone();
  }

  function scheduleVisitorMapScriptLoad(mapSlot, options) {
    const opts = options || {};

    if (!mapSlot) return;

    if (!opts.force && visitorMapScriptStarted) {
      disconnectVisibleObserverIfDone();
      return;
    }

    window.setTimeout(() => {
      if (!socialIsVisible()) {
        armWhenVisible();
        return;
      }

      appendMapMyVisitorsScript(
        mapSlot,
        'mapmyvisitors',
        MAPMYVISITORS_MAP_SRC
      );

      window.setTimeout(() => {
        visitorMapLastSignature = readVisitorMapSignature();
      }, 600);
    }, VISITOR_MAP_SCRIPT_DELAY);
  }

  function mountVisitorMapWidgets(force) {
    const placeholder = getVisitorMapPlaceholder();
    if (!placeholder) return;

    const existingMapSlot = placeholder.querySelector('#visitor-map-slot');

    if (!force && visitorMapStarted && existingMapSlot) {
      startVisitorMapResizeWatch();

      if (!visitorMapScriptStarted) {
        scheduleVisitorMapScriptLoad(existingMapSlot);
      }

      disconnectVisibleObserverIfDone();
      return;
    }

    visitorMapStarted = true;

    placeholder.textContent = '';

    const mapSlot = document.createElement('div');
    mapSlot.className = 'visitor-widget-slot visitor-map-slot';
    mapSlot.id = 'visitor-map-slot';
    mapSlot.setAttribute('aria-label', '2D visitor map');

    placeholder.appendChild(mapSlot);

    visitorMapLastSignature = readVisitorMapSignature();
    startVisitorMapResizeWatch();

    scheduleVisitorMapScriptLoad(mapSlot, {
      force: force === true
    });
  }

  function remountVisitorMapIfNeeded() {
    if (!visitorMapStarted) return;
    if (!socialIsVisible()) return;

    const currentSignature = readVisitorMapSignature();

    if (!visitorMapSignatureChanged(currentSignature, visitorMapLastSignature)) {
      return;
    }

    visitorMapLastSignature = currentSignature;
    mountVisitorMapWidgets(true);
  }

  function scheduleVisitorMapResizeCheck() {
    if (!visitorMapStarted) return;

    if (visitorMapResizeTimer) {
      window.clearTimeout(visitorMapResizeTimer);
    }

    visitorMapResizeTimer = window.setTimeout(() => {
      visitorMapResizeTimer = null;
      remountVisitorMapIfNeeded();
    }, VISITOR_MAP_RESIZE_DEBOUNCE);
  }

  function startVisitorMapResizeWatch() {
    if (visitorMapResizeStarted) return;

    const placeholder = getVisitorMapPlaceholder();
    if (!placeholder) return;

    visitorMapResizeStarted = true;

    window.addEventListener('resize', scheduleVisitorMapResizeCheck, {
      passive: true
    });

    window.addEventListener('orientationchange', scheduleVisitorMapResizeCheck, {
      passive: true
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleVisitorMapResizeCheck, {
        passive: true
      });
    }

    if (typeof ResizeObserver === 'function') {
      visitorMapResizeObserver = new ResizeObserver(() => {
        scheduleVisitorMapResizeCheck();
      });

      visitorMapResizeObserver.observe(placeholder);
    }
  }

  function scheduleVisibleResourceLoad() {
    if (delayedLoadTimer) return;

    delayedLoadTimer = window.setTimeout(() => {
      delayedLoadTimer = null;

      if (!socialIsVisible()) {
        armWhenVisible();
        return;
      }

      window.setTimeout(() => {
        if (!socialIsVisible()) {
          armWhenVisible();
          return;
        }

        if (!statsFinished) {
          initStats();
        }
      }, GOATCOUNTER_STATS_DELAY);

      window.setTimeout(() => {
        if (!socialIsVisible()) {
          armWhenVisible();
          return;
        }

        loadGoatCounterFrame();
      }, GOATCOUNTER_DASHBOARD_DELAY);

      window.setTimeout(() => {
        if (!socialIsVisible()) {
          armWhenVisible();
          return;
        }

        mountVisitorMapWidgets(false);
      }, VISITOR_MAP_DELAY);
    }, SOCIAL_RESOURCE_START_DELAY);
  }

  function initVisibleResources() {
    ensureSocialRoot();

    if (!socialIsVisible()) {
      return false;
    }

    scheduleVisibleResourceLoad();

    return true;
  }

  function armWhenVisible() {
    const social = ensureSocialRoot();
    if (!social) return;

    if (socialIsVisible()) {
      initVisibleResources();
    }

    disconnectVisibleObserverIfDone();

    if (visibleObserver || allSocialStatsResourcesStarted()) return;

    visibleObserver = new MutationObserver(() => {
      if (socialIsVisible()) {
        initVisibleResources();
        disconnectVisibleObserverIfDone();
      }
    });

    visibleObserver.observe(social, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  function enter() {
    armWhenVisible();
  }

  function refresh() {
    armWhenVisible();
    scheduleVisitorMapResizeCheck();
  }

  window.SocialStats = {
    enter,
    refresh,
    initVisibleResources,
    initStats,
    loadGoatCounterFrame,
    mountVisitorMapWidgets,
    remountVisitorMapIfNeeded
  };

  window.addEventListener('social:viewchange', function (event) {
    const detail = event && event.detail ? event.detail : {};

    if (detail.view === 'footprints') {
      refresh();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armWhenVisible);
  } else {
    armWhenVisible();
  }

  window.addEventListener('load', () => {
    if (socialIsVisible()) {
      initVisibleResources();
      scheduleVisitorMapResizeCheck();
    }
  }, { once: true });
})();