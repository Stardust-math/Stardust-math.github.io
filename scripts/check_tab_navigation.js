#!/usr/bin/env node
'use strict';

/*
  Execute the Life and Schedule tab controllers against a minimal DOM stub.
  This check is read-only and has no third-party dependencies.
*/

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const sourceFile = (relativePath) => path.join(ROOT, relativePath);
const LIFE_ROUTES = sourceFile('assets/js/Functions/life/LifeRoutes.js');
const SCHEDULE_ROUTES = sourceFile('assets/js/Functions/schedule/ScheduleRoutes.js');
const SCHEDULE_CORE = sourceFile('assets/js/Functions/schedule/ScheduleCore.js');

function load(context, file) {
  new vm.Script(fs.readFileSync(file, 'utf8'), {
    filename: path.relative(ROOT, file)
  }).runInContext(context);
}

function classList(active) {
  const values = new Set(active ? ['active'] : []);

  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    contains: (name) => values.has(name),
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    }
  };
}

function control(view, active) {
  const attributes = new Map([
    ['aria-selected', active ? 'true' : 'false'],
    ['tabindex', active ? '0' : '-1']
  ]);
  const listeners = new Map();

  const element = {
    tagName: 'A',
    dataset: { view },
    classList: classList(active),
    focused: false,
    closest: (selector) => selector.includes('switch-btn') ? element : null,
    focus: () => { element.focused = true; },
    getAttribute: (name) => attributes.has(name) ? attributes.get(name) : null,
    setAttribute: (name, value) => attributes.set(name, String(value)),
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    dispatchLocal(type, event) {
      (listeners.get(type) || []).forEach((handler) => handler(event));
    }
  };

  return element;
}

function panel(view, active) {
  const attributes = new Set(active ? [] : ['hidden']);

  return {
    dataset: { view },
    classList: classList(active),
    hasAttribute: (name) => attributes.has(name),
    toggleAttribute(name, force) {
      const enabled = force === undefined ? !attributes.has(name) : Boolean(force);
      if (enabled) attributes.add(name);
      else attributes.delete(name);
      return enabled;
    }
  };
}

function register(registry, type, handler) {
  if (!registry.has(type)) registry.set(type, []);
  registry.get(type).push(handler);
}

function inputEvent(target, properties) {
  return {
    target,
    defaultPrevented: false,
    immediatePropagationStopped: false,
    ...properties,
    preventDefault() { this.defaultPrevented = true; },
    stopImmediatePropagation() { this.immediatePropagationStopped = true; }
  };
}

function routeHarness({ page, views, file }) {
  const controls = views.map((view, index) => control(view, index === 0));
  const handlers = new Map();
  const activated = [];
  const history = [];
  const root = {
    dataset: {},
    contains: (node) => controls.includes(node),
    querySelectorAll: (selector) => selector.includes('switch-btn') ? controls : []
  };
  const document = {
    baseURI: 'https://example.test/',
    readyState: 'complete',
    addEventListener: (type, handler) => register(handlers, type, handler),
    getElementById: (id) => id === page ? root : null,
    querySelectorAll: (selector) => selector.includes(`.${page}-switcher`) ? controls : []
  };
  const window = {
    location: { pathname: `/en/${page}/` },
    addEventListener() {},
    BootstrapRoutes: {
      buildLocalizedPath: (logicalPath) => `/en/${logicalPath}/`,
      getBusinessPath: (pathname) => pathname,
      getCurrentLanguage: () => 'en',
      syncHistory: (route) => history.push(route)
    },
    CustomCursorAPI: { refresh() {} }
  };

  if (page === 'life') {
    window.Life = { setLifeView: (view) => activated.push(view) };
    window.ActivitiesMoments = { showList() {} };
    window.LifeMeditations = { ensureCurrent() {} };
  } else {
    window.Schedule = { setScheduleView: (view) => activated.push(view) };
  }

  load(vm.createContext({ URL, console, document, window }), file);
  return { activated, controls, handlers, history };
}

function checkKeyboardNavigation() {
  const modules = [
    {
      page: 'life',
      file: LIFE_ROUTES,
      views: ['activities_moments', 'meditations'],
      cases: [
        ['ArrowLeft', 0, 1],
        ['ArrowRight', 1, 0],
        ['Home', 1, 0],
        ['End', 0, 1]
      ]
    },
    {
      page: 'schedule',
      file: SCHEDULE_ROUTES,
      views: ['my-timetable', 'ustc-timetable', 'timetable', 'calendar'],
      cases: [
        ['ArrowLeft', 0, 3],
        ['ArrowRight', 3, 0],
        ['Home', 2, 0],
        ['End', 1, 3]
      ]
    }
  ];

  modules.forEach((module) => {
    module.cases.forEach(([key, start, expected]) => {
      const harness = routeHarness(module);
      const keyHandlers = harness.handlers.get('keydown') || [];
      const event = inputEvent(harness.controls[start], { key });

      assert.equal(keyHandlers.length, 1, `${module.page} must register one keydown router.`);
      keyHandlers[0](event);
      assert.equal(event.defaultPrevented, true, `${module.page} ${key} did not prevent default.`);
      assert.equal(event.immediatePropagationStopped, true, `${module.page} ${key} was not isolated.`);
      assert.deepEqual(harness.activated, [module.views[expected]], `${module.page} ${key} activated the wrong view.`);
      assert.equal(harness.history.length, 1, `${module.page} ${key} updated history incorrectly.`);

      harness.controls.forEach((item, index) => {
        assert.equal(item.focused, index === expected, `${module.page} ${key} focused the wrong tab.`);
      });
    });
  });
}

function scheduleHarness() {
  const views = ['my-timetable', 'ustc-timetable', 'timetable', 'calendar'];
  const controls = views.map((view, index) => control(view, index === 0));
  const panels = views.map((view, index) => panel(view, index === 0));
  const handlers = new Map();
  const viewChanges = [];
  const renders = { calendar: 0, timetable: 0, ustc: 0 };
  const root = {
    dataset: {},
    contains: (node) => controls.includes(node),
    querySelectorAll: (selector) => selector.includes('switch-btn') ? controls : []
  };
  const document = {
    baseURI: 'https://example.test/',
    body: { dataset: {} },
    readyState: 'complete',
    addEventListener: (type, handler) => register(handlers, type, handler),
    getElementById: (id) => id === 'schedule' ? root : null,
    querySelectorAll(selector) {
      if (selector === '.schedule-switch-btn') return controls;
      if (selector === '.schedule-section[data-view]') return panels;
      if (selector.includes('.schedule-switcher')) return controls;
      return [];
    }
  };
  const window = {
    location: { pathname: '/en/schedule/my_timetable/' },
    addEventListener() {},
    dispatchEvent(event) {
      if (event.type === 'schedule:viewchange') viewChanges.push(event.detail);
    },
    requestAnimationFrame: (handler) => handler(),
    BootstrapRoutes: {
      buildLocalizedPath: (logicalPath) => `/en/${logicalPath}/`,
      getBusinessPath: (pathname) => pathname,
      getCurrentLanguage: () => 'en',
      syncHistory() {}
    },
    CustomCursorAPI: { refresh() {} }
  };
  class FakeCustomEvent {
    constructor(type, options) {
      this.type = type;
      this.detail = options && options.detail;
    }
  }
  class FakeMutationObserver {
    observe() {}
    disconnect() {}
  }
  const context = vm.createContext({
    URL,
    console,
    document,
    window,
    CustomEvent: FakeCustomEvent,
    MutationObserver: FakeMutationObserver,
    setTimeout: (handler) => handler(),
    initCalendar() {},
    initTimetable() {},
    ensureCalendarRendered: () => { renders.calendar += 1; },
    updateTimetable: () => { renders.timetable += 1; },
    renderUstcTimetable: () => { renders.ustc += 1; }
  });

  load(context, SCHEDULE_CORE);
  load(context, SCHEDULE_ROUTES);
  return { controls, handlers, panels, renders, viewChanges, window };
}

function assertScheduleState(harness, expectedView) {
  harness.controls.forEach((item) => {
    const active = item.dataset.view === expectedView;
    assert.equal(item.classList.contains('active'), active, `${item.dataset.view} has the wrong active class.`);
    assert.equal(item.getAttribute('aria-selected'), active ? 'true' : 'false', `${item.dataset.view} has the wrong aria-selected.`);
    assert.equal(item.getAttribute('tabindex'), active ? '0' : '-1', `${item.dataset.view} has the wrong tabindex.`);
  });

  harness.panels.forEach((item) => {
    const active = item.dataset.view === expectedView;
    assert.equal(item.classList.contains('active'), active, `${item.dataset.view} panel has the wrong active class.`);
    assert.equal(item.hasAttribute('hidden'), !active, `${item.dataset.view} panel has the wrong hidden state.`);
  });
}

function checkScheduleState() {
  const harness = scheduleHarness();
  ['my-timetable', 'ustc-timetable', 'timetable', 'calendar'].forEach((view) => {
    harness.window.Schedule.setScheduleView(view);
    assertScheduleState(harness, view);
  });

  harness.window.Schedule.setScheduleView('invalid-view');
  assertScheduleState(harness, 'my-timetable');
  assert.deepEqual(harness.renders, { calendar: 1, timetable: 1, ustc: 1 });
}

function checkModifiedClicks() {
  const harness = scheduleHarness();
  harness.window.Schedule.initSchedulePage();

  const captureHandlers = harness.handlers.get('click') || [];
  assert.equal(captureHandlers.length, 1, 'ScheduleRoutes must own the delegated tab click handler.');
  const initialViewChanges = harness.viewChanges.length;
  const cases = [
    ['Ctrl+click', { button: 0, ctrlKey: true }],
    ['Cmd+click', { button: 0, metaKey: true }],
    ['Shift+click', { button: 0, shiftKey: true }],
    ['middle click', { button: 1 }]
  ];

  cases.forEach(([label, modifiers]) => {
    const target = harness.controls[1];
    const event = inputEvent(target, {
      button: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      ...modifiers
    });

    captureHandlers.forEach((handler) => handler(event));
    if (!event.immediatePropagationStopped) target.dispatchLocal('click', event);
    assert.equal(event.defaultPrevented, false, `${label} must preserve native link behavior.`);
    assert.equal(harness.viewChanges.length, initialViewChanges, `${label} invoked a duplicate local setter.`);
  });
}

checkKeyboardNavigation();
checkScheduleState();
checkModifiedClicks();

console.log('Life and Schedule tab navigation check passed.');
