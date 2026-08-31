(function () {
  'use strict';

  const DEFAULT_VIEW = 'my-timetable';

  const VIEW_TO_SLUG = {
    'my-timetable': 'my_timetable',
    'ustc-timetable': 'ustc_timetable',
    timetable: 'timetable',
    calendar: 'calendar'
  };

  const SLUG_TO_VIEW = {
    my_timetable: 'my-timetable',
    'my-timetable': 'my-timetable',
    ustc_timetable: 'ustc-timetable',
    'ustc-timetable': 'ustc-timetable',
    timetable: 'timetable',
    calendar: 'calendar'
  };

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();
    return SLUG_TO_VIEW[key] || (VIEW_TO_SLUG[key] ? key : null);
  }

  function getScheduleBaseUrl() {
    return new URL('schedule/', document.baseURI);
  }

  function getRoute(view) {
    const normalized = normalizeView(view) || DEFAULT_VIEW;

    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        'schedule/' + VIEW_TO_SLUG[normalized],
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    return new URL(VIEW_TO_SLUG[normalized] + '/', getScheduleBaseUrl()).pathname;
  }

  function normalizePath(pathname) {
    return String(pathname || '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '') || '/';
  }

  function isSchedulePath(pathname) {
    const path =
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.getBusinessPath === 'function'
        ? window.BootstrapRoutes.getBusinessPath(
            pathname || window.location.pathname
          )
        : pathname || window.location.pathname;

    const parts = normalizePath(path)
      .split('/')
      .filter(Boolean);

    return parts.includes('schedule');
  }

  function resolveViewFromPath(pathname) {
    const path =
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.getBusinessPath === 'function'
        ? window.BootstrapRoutes.getBusinessPath(
            pathname || window.location.pathname
          )
        : pathname || window.location.pathname;

    const parts = normalizePath(path)
      .split('/')
      .filter(Boolean);

    const scheduleIndex = parts.indexOf('schedule');
    const slug = scheduleIndex >= 0 ? parts[scheduleIndex + 1] : '';

    return normalizeView(slug);
  }

  function applyScheduleSubnavCursor(control) {
    if (!control || !control.dataset) return;

    control.dataset.cursor = control.dataset.cursor || 'precise_select';
    control.dataset.cursorFallback = control.dataset.cursorFallback || 'pointer';
  }

  function toRouteLink(control) {
    const view = normalizeView(control && control.dataset ? control.dataset.view : '');
    if (!control || !view) return control;

    const href = getRoute(view);

    if (control.tagName && control.tagName.toLowerCase() === 'a') {
      control.setAttribute('href', href);
      control.setAttribute('role', 'tab');
      applyScheduleSubnavCursor(control);
      return control;
    }

    const link = document.createElement('a');

    Array.from(control.attributes).forEach((attr) => {
      if (attr.name === 'type') return;
      link.setAttribute(attr.name, attr.value);
    });

    link.className = control.className;
    link.dataset.view = view;
    link.href = href;
    link.setAttribute('role', 'tab');
    link.innerHTML = control.innerHTML;

    applyScheduleSubnavCursor(link);

    control.replaceWith(link);
    return link;
  }

  function enhanceScheduleSubnav() {
    document.querySelectorAll('.schedule-switcher .schedule-switch-btn').forEach((control) => {
      const link = toRouteLink(control);
      const view = normalizeView(link && link.dataset ? link.dataset.view : '');

      if (link && view) {
        link.setAttribute('href', getRoute(view));
        applyScheduleSubnavCursor(link);
      }
    });

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh();
    }
  }

  function getScheduleSetter() {
    if (window.Schedule && typeof window.Schedule.setScheduleView === 'function') {
      return window.Schedule.setScheduleView.bind(window.Schedule);
    }

    if (typeof window.setScheduleView === 'function') {
      return window.setScheduleView.bind(window);
    }

    return null;
  }

  function activateView(view, options) {
    const opts = options || {};
    const normalized = normalizeView(view) || DEFAULT_VIEW;
    const setter = getScheduleSetter();

    if (
      opts.updateHistory &&
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.syncHistory === 'function'
    ) {
      window.BootstrapRoutes.syncHistory(
        getRoute(normalized),
        opts.replaceHistory === true
      );
    }

    enhanceScheduleSubnav();

    if (setter) {
      setter(normalized);
    }

  }

  function enterFromLocation() {
    const view = resolveViewFromPath(window.location.pathname) || DEFAULT_VIEW;
    activateView(view, { updateHistory: false });
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

  function handleScheduleSubnavClick(event) {
    const control = event.target && event.target.closest
      ? event.target.closest('.schedule-switcher .schedule-switch-btn')
      : null;

    if (!control) return;

    const root = document.getElementById('schedule');

    if (!root || !root.contains(control)) return;

    if (
      control.tagName &&
      control.tagName.toLowerCase() === 'a' &&
      !isPlainLeftClick(event)
    ) {
      return;
    }

    const view = normalizeView(control.dataset.view);
    if (!view) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    activateView(view, { updateHistory: true });
  }

  function handleScheduleSubnavKeydown(event) {
    const control = event.target && event.target.closest
      ? event.target.closest('.schedule-switcher .schedule-switch-btn[data-view]')
      : null;

    if (!control) return;

    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    const root = document.getElementById('schedule');

    if (!root || !root.contains(control)) return;

    const controls = Array.from(
      root.querySelectorAll(
        '.schedule-switcher .schedule-switch-btn[data-view]'
      )
    );

    const currentIndex = controls.indexOf(control);

    if (!controls.length || currentIndex < 0) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    let nextIndex = currentIndex;

    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = controls.length - 1;
    } else {
      const direction = event.key === 'ArrowRight'
        ? 1
        : -1;

      nextIndex = (
        currentIndex +
        direction +
        controls.length
      ) % controls.length;
    }

    const next = controls[nextIndex];
    const view = normalizeView(
      next && next.dataset
        ? next.dataset.view
        : ''
    );

    if (!next || !view) return;

    next.focus();
    activateView(view, { updateHistory: true });
  }

  document.addEventListener('click', handleScheduleSubnavClick, true);
  document.addEventListener('keydown', handleScheduleSubnavKeydown, true);

  window.addEventListener('popstate', () => {
    window.setTimeout(() => {
      if (isSchedulePath(window.location.pathname)) {
        enterFromLocation();
      }
    }, 0);
  });

  window.addEventListener('site:langchange', (event) => {
    if (
      event &&
      event.detail &&
      event.detail.scheduleExportOnly === true
    ) {
      return;
    }

    enhanceScheduleSubnav();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceScheduleSubnav);
  } else {
    enhanceScheduleSubnav();
  }

  window.ScheduleRoutes = {
    normalizeView,
    resolveViewFromPath,
    getRoute,
    enhanceScheduleSubnav,
    activateView,
    enterFromLocation
  };
})();
