(function () {
  'use strict';

  const registry = Object.create(null);
  const initialized = Object.create(null);

  function getPageElement(page) {
    const resources = window.SiteResources || {};
    const pages = resources.pages || {};
    const config = pages[page] || {};
    const domId = config.domId;

    return domId ? document.getElementById(domId) : null;
  }

  function makeContext(page, extra) {
    return Object.assign({
      page,
      element: getPageElement(page)
    }, extra || {});
  }

  function safeCall(page, hook, context) {
    const lifecycle = registry[page];

    if (!lifecycle || typeof lifecycle[hook] !== 'function') {
      return undefined;
    }

    try {
      return lifecycle[hook](context || makeContext(page));
    } catch (e) {
      console.error(`[SitePages] ${page}.${hook} failed:`, e);
      return undefined;
    }
  }

  function register(page, lifecycle) {
    if (!page || typeof page !== 'string') {
      console.warn('[SitePages] register(page, lifecycle) requires a page name.');
      return;
    }

    if (!lifecycle || typeof lifecycle !== 'object') {
      console.warn(`[SitePages] lifecycle for "${page}" must be an object.`);
      return;
    }

    registry[page] = Object.assign({}, registry[page] || {}, lifecycle);
  }

  function init(page, extra) {
    if (!page) return;
    if (initialized[page]) return;

    safeCall(page, 'init', makeContext(page, extra));
    initialized[page] = true;
  }

  function enter(page, extra) {
    if (!page) return;
    safeCall(page, 'enter', makeContext(page, extra));
  }

  function leave(page, extra) {
    if (!page) return;
    safeCall(page, 'leave', makeContext(page, extra));
  }

  function refresh(page, extra) {
    if (!page) return;
    safeCall(page, 'refresh', makeContext(page, extra));
  }

  function get(page) {
    return registry[page] || null;
  }

  function list() {
    return Object.keys(registry);
  }

  function callSchedule(name, args) {
    const params = Array.isArray(args) ? args : [];

    if (window.Schedule && typeof window.Schedule[name] === 'function') {
      return window.Schedule[name].apply(window.Schedule, params);
    }

    if (typeof window[name] === 'function') {
      return window[name].apply(window, params);
    }

    return undefined;
  }

  function callToolkit(name, args) {
    const params = Array.isArray(args) ? args : [];

    if (window.Toolkit && typeof window.Toolkit[name] === 'function') {
      return window.Toolkit[name].apply(window.Toolkit, params);
    }

    if (typeof window[name] === 'function') {
      return window[name].apply(window, params);
    }

    return undefined;
  }

  function registerDefaultLifecycles() {
    register('schedule', {
      init() {
        callSchedule('initSchedulePage');
        callSchedule('initWeeksSelection');
        callSchedule('initSemesterSelection');
      },

      enter() {
        const scheduleRoutes = window.ScheduleRoutes;

        if (scheduleRoutes && typeof scheduleRoutes.enterFromLocation === 'function') {
          scheduleRoutes.enterFromLocation();
          return;
        }

        callSchedule('setScheduleView', ['my-timetable']);
      }
    });

    register('toolkit', {
      init() {
        callToolkit('initToolkitFilter');
      }
    });

    register('about', {});
    register('social', {});
    register('life', {});
  }

  window.SitePages = {
    register,
    init,
    enter,
    leave,
    refresh,
    get,
    list
  };

  registerDefaultLifecycles();
})();
