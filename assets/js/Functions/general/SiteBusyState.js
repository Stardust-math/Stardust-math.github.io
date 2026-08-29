(function () {
  'use strict';

  const BUSY_CLASS = 'site-busy';
  const BUSY_ATTR = 'data-site-busy';

  const DEFAULT_SHOW_DELAY = 90;
  const DEFAULT_MIN_VISIBLE = 180;
  const DEFAULT_HARD_TIMEOUT = 12000;

  const QUICK_PULSE_MS = 420;
  const DOWNLOAD_PULSE_MS = 950;
  const EXPORT_PULSE_MS = 1300;

  const RESOURCE_LINK_RE = /\.(pdf|zip|rar|7z|doc|docx|xls|xlsx|ppt|pptx|csv|ics|tex|bib)(?:[?#]|$)/i;
  const LOADING_TEXT_RE = /(Loading this moment|Loading Meditations|正在加载这一瞬|正在载入沉思录)/i;

  const activeRecords = Object.create(null);
  const intentGuards = Object.create(null);

  let nextTokenId = 1;
  let coverTouchStart = null;

  function numberOr(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clampDelay(value, fallback) {
    return Math.max(0, numberOr(value, fallback));
  }

  function syncCursorStyle() {
    const api = window.CustomCursorAPI;

    if (api && typeof api.refresh === 'function') {
      api.refresh();
    }
  }

  function hasVisibleBusyRecord() {
    return Object.keys(activeRecords).some((id) => {
      const record = activeRecords[id];
      return !!(record && record.shown && !record.finalized);
    });
  }

  function updateBusyDomState() {
    const root = document.documentElement;
    if (!root) return;

    if (hasVisibleBusyRecord()) {
      root.classList.add(BUSY_CLASS);
      root.setAttribute(BUSY_ATTR, 'true');
    } else {
      root.classList.remove(BUSY_CLASS);
      root.removeAttribute(BUSY_ATTR);
    }
  }

  function clearRecordTimers(record) {
    if (!record) return;

    ['showTimer', 'hardTimer', 'finishTimer'].forEach((key) => {
      if (record[key]) {
        window.clearTimeout(record[key]);
        record[key] = 0;
      }
    });
  }

  function showRecord(record) {
    if (!record || record.ended || record.finalized || !activeRecords[record.id]) return;

    record.shown = true;
    record.shownAt = Date.now();
    updateBusyDomState();
  }

  function begin(reason, options) {
    const opts = options || {};
    const id = String(nextTokenId++);
    const showDelay = clampDelay(opts.showDelay, DEFAULT_SHOW_DELAY);
    const hardTimeout = clampDelay(opts.hardTimeout, DEFAULT_HARD_TIMEOUT);

    const record = {
      id,
      reason: reason || 'busy',
      startedAt: Date.now(),
      shownAt: 0,
      shown: false,
      ended: false,
      finalized: false,
      minVisible: clampDelay(opts.minVisible, DEFAULT_MIN_VISIBLE),
      showTimer: 0,
      hardTimer: 0,
      finishTimer: 0
    };

    activeRecords[id] = record;

    if (showDelay <= 0 || opts.immediate === true) {
      showRecord(record);
    } else {
      record.showTimer = window.setTimeout(() => showRecord(record), showDelay);
    }

    if (hardTimeout > 0) {
      record.hardTimer = window.setTimeout(() => {
        end({ id }, { force: true });
      }, hardTimeout);
    }

    return { id };
  }

  function finalizeRecord(record) {
    if (!record || !activeRecords[record.id]) return;

    record.finalized = true;
    clearRecordTimers(record);
    delete activeRecords[record.id];
    updateBusyDomState();
  }

  function end(token, options) {
    const id = token && token.id ? String(token.id) : String(token || '');
    const record = activeRecords[id];
    if (!record || record.finalized) return;

    const opts = options || {};
    record.ended = true;

    if (record.showTimer) {
      window.clearTimeout(record.showTimer);
      record.showTimer = 0;
    }

    if (record.hardTimer) {
      window.clearTimeout(record.hardTimer);
      record.hardTimer = 0;
    }

    if (!record.shown || opts.force === true) {
      finalizeRecord(record);
      return;
    }

    const elapsedVisible = Date.now() - record.shownAt;
    const remaining = Math.max(0, record.minVisible - elapsedVisible);

    if (remaining <= 0) {
      finalizeRecord(record);
      return;
    }

    record.finishTimer = window.setTimeout(() => finalizeRecord(record), remaining);
  }

  function pulse(reason, duration, options) {
    const ms = clampDelay(duration, QUICK_PULSE_MS);
    const token = begin(reason || 'pulse', Object.assign({
      showDelay: 0,
      minVisible: ms,
      hardTimeout: ms + 1200
    }, options || {}));

    window.setTimeout(() => end(token), ms);
    return token;
  }

  function withBusy(reason, task, options) {
    const token = begin(reason, options);

    return Promise.resolve()
      .then(() => (typeof task === 'function' ? task() : task))
      .finally(() => end(token));
  }

  function clearAll() {
    Object.keys(activeRecords).forEach((id) => {
      finalizeRecord(activeRecords[id]);
    });
  }

  function safeClosest(target, selector) {
    if (!target || typeof target.closest !== 'function') return null;

    try {
      return target.closest(selector);
    } catch (e) {
      return null;
    }
  }

  function isPlainPrimaryActivation(event) {
    if (!event) return false;

    if (event.type === 'click') {
      return event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey;
    }

    return true;
  }

  function getSiteResources() {
    return window.SiteResources || {};
  }

  function getPageConfig(page) {
    const resources = getSiteResources();
    const pages = resources.pages || {};
    return pages[page] || null;
  }

  function getDefaultPage() {
    const resources = getSiteResources();
    const navigation = resources.navigation || {};
    return navigation.defaultPage || 'about';
  }

  function getPageElement(page) {
    const config = getPageConfig(page);
    const domId = config && config.domId;
    return domId ? document.getElementById(domId) : null;
  }

  function isPageVisible(page) {
    const el = getPageElement(page);
    return !!(el && el.classList && el.classList.contains('visible'));
  }

  function pageFromCurrentPath() {
    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.getPageFromPath === 'function'
    ) {
      return window.BootstrapRoutes.getPageFromPath(window.location.pathname);
    }

    const resources = getSiteResources();
    const pages = resources.pages || {};
    const path = String(window.location.pathname || '').replace(/index\.html$/, '');

    return Object.keys(pages).find((page) => {
      const route = pages[page] && pages[page].route;
      return route && path.indexOf('/' + route + '/') >= 0;
    }) || null;
  }

  function waitForCondition(condition, onDone, options) {
    const opts = options || {};
    const timeout = clampDelay(opts.timeout, DEFAULT_HARD_TIMEOUT);
    const intervalMs = clampDelay(opts.interval, 120);

    let done = false;
    let timeoutTimer = 0;
    let intervalTimer = 0;
    let observer = null;

    function cleanup() {
      if (done) return;
      done = true;

      if (timeoutTimer) window.clearTimeout(timeoutTimer);
      if (intervalTimer) window.clearInterval(intervalTimer);
      if (observer) observer.disconnect();
    }

    function check() {
      if (done) return;

      let ok = false;
      try {
        ok = !!condition();
      } catch (e) {
        ok = false;
      }

      if (!ok) return;

      cleanup();
      if (typeof onDone === 'function') onDone();
    }

    check();
    if (done) return cleanup;

    if (typeof MutationObserver === 'function' && document.documentElement) {
      observer = new MutationObserver(check);
      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class', 'style', 'src', 'data-am-view', 'data-date-key']
      });
    }

    intervalTimer = window.setInterval(check, intervalMs);
    timeoutTimer = window.setTimeout(cleanup, timeout);

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(check);
    } else {
      window.setTimeout(check, 0);
    }

    return cleanup;
  }

  function startPageBusy(page, reason, options) {
    if (!page || !getPageConfig(page)) return null;

    const opts = options || {};
    const token = begin(reason || ('page:' + page), {
      showDelay: opts.showDelay,
      minVisible: opts.minVisible,
      hardTimeout: opts.hardTimeout || DEFAULT_HARD_TIMEOUT
    });

    waitForCondition(
      () => isPageVisible(page),
      () => end(token),
      {
        timeout: opts.waitTimeout || opts.hardTimeout || DEFAULT_HARD_TIMEOUT,
        interval: 80
      }
    );

    return token;
  }

  function startPageBusyGuarded(page, reason, guardMs) {
    const key = reason || ('page:' + page);
    const now = Date.now();
    const guard = Math.max(0, Number(guardMs) || 700);

    if (intentGuards[key] && now - intentGuards[key] < guard) {
      return null;
    }

    intentGuards[key] = now;
    return startPageBusy(page, key);
  }

  function isCoverActive() {
    const cover = document.getElementById('cover');
    if (!cover) return false;
    if (cover.classList.contains('hidden') || cover.classList.contains('leaving')) return false;
    if (cover.dataset && cover.dataset.coverVisualMode === '1') return false;
    if (cover.style && cover.style.display === 'none') return false;
    return true;
  }

  function handleTopLevelPageClick(link) {
    const page = link && link.dataset ? link.dataset.page : '';
    if (!page) return false;

    startPageBusy(page, 'nav:' + page);
    return true;
  }

  function handleCoverClick(target) {
    const trigger = safeClosest(target, '#cover-scroll, #avatar-frame');
    if (!trigger || !isCoverActive()) return false;

    startPageBusy(getDefaultPage(), 'cover:click');
    return true;
  }

  function handleScheduleSubnavClick(control) {
    if (!control || !control.dataset) return false;

    const view = String(control.dataset.view || '').toLowerCase();
    if (!view) return false;

    if (view !== 'calendar') {
      pulse('schedule:' + view, QUICK_PULSE_MS);
      return true;
    }

    const startedAt = Date.now();
    const token = begin('schedule:calendar', {
      hardTimeout: 10000
    });

    waitForCondition(() => {
      const section = document.getElementById('calendar-section');
      if (!section || !section.classList.contains('active')) return false;

      const container = document.getElementById('calendar-container');
      if (container && container.querySelector('.fc')) return true;

      return Date.now() - startedAt > 1200;
    }, () => end(token), {
      timeout: 10000,
      interval: 100
    });

    return true;
  }

  function handleLifeSubnavClick(control) {
    if (!control || !control.dataset) return false;

    const view = String(control.dataset.view || '').toLowerCase();
    if (!view) return false;

    if (view !== 'meditations') {
      pulse('life:' + view, QUICK_PULSE_MS);
      return true;
    }

    const token = begin('life:meditations', {
      hardTimeout: 9000
    });

    waitForCondition(() => {
      const root = document.getElementById('meditations');
      if (!root) return false;

      return !LOADING_TEXT_RE.test(root.textContent || '');
    }, () => end(token), {
      timeout: 9000,
      interval: 120
    });

    return true;
  }

  function getActivityDetailElement(dateKey) {
    const safeDateKey = String(dateKey || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return document.querySelector('.activities_moments.am-detail[data-date-key="' + safeDateKey + '"]');
  }

  function handleActivityMomentClick(control) {
    if (!control || !control.dataset) return false;

    const dateKey = control.dataset.dateKey || '';
    if (!dateKey) return false;

    const token = begin('life:moment:' + dateKey, {
      hardTimeout: 10000
    });

    waitForCondition(() => {
      const detail = getActivityDetailElement(dateKey);
      if (!detail) return false;

      return !LOADING_TEXT_RE.test(detail.textContent || '');
    }, () => end(token), {
      timeout: 10000,
      interval: 100
    });

    return true;
  }

  function handleScheduleExportClick(button) {
    if (!button) return false;

    const toolbar = safeClosest(button, '.schedule-export-toolbar');
    const formatSelect = toolbar ? toolbar.querySelector('[data-schedule-export-format]') : null;
    const format = formatSelect ? String(formatSelect.value || '').toLowerCase() : '';

    if (format === 'pdf') {
      const token = begin('schedule:export:pdf', {
        showDelay: 0,
        minVisible: 260,
        hardTimeout: 8000
      });

      const release = () => end(token);
      window.addEventListener('afterprint', release, { once: true });
      window.setTimeout(release, 6500);
      return true;
    }

    pulse('schedule:export:' + (format || 'file'), EXPORT_PULSE_MS);
    return true;
  }

  function hrefLooksLikeLocalResource(rawHref, absoluteHref) {
    const raw = String(rawHref || '').trim();
    const absolute = String(absoluteHref || '').trim();

    return RESOURCE_LINK_RE.test(raw) ||
      RESOURCE_LINK_RE.test(absolute) ||
      raw.indexOf('./assets/pdf/') === 0 ||
      raw.indexOf('/assets/pdf/') >= 0 ||
      absolute.indexOf('/assets/pdf/') >= 0;
  }

  function shouldPulseForResourceLink(anchor) {
    if (!anchor) return false;

    const rawHref = anchor.getAttribute('href') || '';
    const raw = rawHref.trim();
    if (!raw || raw.charAt(0) === '#') return false;

    const lower = raw.toLowerCase();
    if (
      lower.indexOf('mailto:') === 0 ||
      lower.indexOf('tel:') === 0 ||
      lower.indexOf('javascript:') === 0
    ) {
      return false;
    }

    let absolute = raw;
    try {
      absolute = new URL(raw, document.baseURI).href;
    } catch (e) { }

    if (anchor.hasAttribute('download')) return true;
    if (hrefLooksLikeLocalResource(raw, absolute)) return true;

    return false;
  }

  function handleResourceLinkClick(anchor) {
    if (!shouldPulseForResourceLink(anchor)) return false;

    pulse('download:link', DOWNLOAD_PULSE_MS, {
      minVisible: DOWNLOAD_PULSE_MS
    });

    return true;
  }

  function handleClick(event) {
    if (!isPlainPrimaryActivation(event)) return;

    const target = event.target;
    const exportButton = safeClosest(target, '[data-schedule-export-submit]');
    if (exportButton && handleScheduleExportClick(exportButton)) return;

    const topNavLink = safeClosest(target, '.top-nav-link[data-page]');
    if (topNavLink && handleTopLevelPageClick(topNavLink)) return;

    if (handleCoverClick(target)) return;

    const scheduleControl = safeClosest(target, '.schedule-switcher .schedule-switch-btn[data-view]');
    if (scheduleControl && handleScheduleSubnavClick(scheduleControl)) return;

    const lifeControl = safeClosest(target, '.life-switcher .life-switch-btn[data-view]');
    if (lifeControl && handleLifeSubnavClick(lifeControl)) return;

    const activityMoment = safeClosest(target, '[data-am-action="view"][data-date-key]');
    if (activityMoment && handleActivityMomentClick(activityMoment)) return;

    const activityBack = safeClosest(target, '[data-am-action="back"]');
    if (activityBack) {
      pulse('life:moment-back', QUICK_PULSE_MS);
      return;
    }

    const anchor = safeClosest(target, 'a[href]');
    if (anchor) {
      handleResourceLinkClick(anchor);
    }
  }

  function handlePopState() {
    window.setTimeout(() => {
      const page = pageFromCurrentPath();
      if (page) {
        startPageBusy(page, 'history:' + page, {
          hardTimeout: DEFAULT_HARD_TIMEOUT
        });
      } else {
        pulse('history:cover', QUICK_PULSE_MS);
      }
    }, 0);
  }

  function handleCoverWheel(event) {
    if (!isCoverActive()) return;
    if (!event || Number(event.deltaY) <= 6) return;

    startPageBusyGuarded(getDefaultPage(), 'cover:wheel', 900);
  }

  function handleCoverKeydown(event) {
    if (!isCoverActive()) return;
    if (!event) return;

    const code = event.code || event.key;
    if (code === 'ArrowDown' || code === 'PageDown' || code === 'Space' || event.key === ' ') {
      startPageBusyGuarded(getDefaultPage(), 'cover:key', 900);
    }
  }

  function handleCoverTouchStart(event) {
    if (!isCoverActive()) {
      coverTouchStart = null;
      return;
    }

    const touch = event.touches && event.touches.length === 1 ? event.touches[0] : null;
    coverTouchStart = touch ? {
      x: touch.clientX,
      y: touch.clientY
    } : null;
  }

  function handleCoverTouchEnd(event) {
    if (!coverTouchStart || !isCoverActive()) {
      coverTouchStart = null;
      return;
    }

    const touch = event.changedTouches && event.changedTouches[0] ? event.changedTouches[0] : null;
    if (!touch) {
      coverTouchStart = null;
      return;
    }

    const dx = touch.clientX - coverTouchStart.x;
    const dy = touch.clientY - coverTouchStart.y;
    coverTouchStart = null;

    if (Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dy) > 60) {
      startPageBusyGuarded(getDefaultPage(), 'cover:touch', 900);
    }
  }

  function bindEvents() {
    if (window.__siteBusyStateEventsBound === true) return;
    window.__siteBusyStateEventsBound = true;

    document.addEventListener('click', handleClick, true);
    document.addEventListener('wheel', handleCoverWheel, {
      capture: true,
      passive: true
    });
    document.addEventListener('touchstart', handleCoverTouchStart, {
      capture: true,
      passive: true
    });
    document.addEventListener('touchend', handleCoverTouchEnd, {
      capture: true,
      passive: true
    });
    window.addEventListener('keydown', handleCoverKeydown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pagehide', clearAll);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearAll();
    });
  }

  function init() {
    syncCursorStyle();
    bindEvents();
  }

  window.SiteBusyState = {
    begin,
    end,
    pulse,
    withBusy,
    clearAll,
    injectStyle: syncCursorStyle,
    startPageBusy
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();