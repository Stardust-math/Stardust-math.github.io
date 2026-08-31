// ============ i18n hooks (delegated to Translate.js) ============
function getCurrentLang() {
  if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
    return window.SiteLang.getLang();
  }

  const s = String((document.body && document.body.dataset && document.body.dataset.lang) || 'en').toLowerCase();
  return (s === 'zh' || s.startsWith('zh')) ? 'zh' : 'en';
}

function getFullCalendarLocale(lang) {
  if (window.SiteLang && typeof window.SiteLang.getFullCalendarLocale === 'function') {
    return window.SiteLang.getFullCalendarLocale(lang);
  }

  const l = String(lang || '').toLowerCase();
  return (l === 'zh' || l.startsWith('zh')) ? 'zh-cn' : 'en';
}

function t(key) {
  if (window.SiteI18N && typeof window.SiteI18N.t === 'function') {
    return window.SiteI18N.t('schedule', key);
  }

  return key;
}
// ===============================================================

let schedulePageInitialized = false;
let scheduleCursorObserver = null;
let scheduleCursorMarkPending = false;

function dispatchScheduleViewChange(view) {
  try {
    if (typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('schedule:viewchange', {
        detail: { view }
      }));
    } else {
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('schedule:viewchange', false, false, { view });
      window.dispatchEvent(evt);
    }
  } catch (e) { }
}

function setScheduleView(view) {
  const supportedViews = [
    'my-timetable',
    'ustc-timetable',
    'timetable',
    'calendar'
  ];

  const targetView = supportedViews.includes(view)
    ? view
    : 'my-timetable';

  const viewSwitchers = document.querySelectorAll('.schedule-switch-btn');
  const sections = document.querySelectorAll('.schedule-section[data-view]');

  viewSwitchers.forEach(btn => {
    const active = btn.dataset.view === targetView;

    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.setAttribute('tabindex', active ? '0' : '-1');
  });

  sections.forEach(sec => {
    const active = sec.dataset.view === targetView;

    sec.classList.toggle('active', active);
    sec.toggleAttribute('hidden', !active);
  });

  if (targetView === 'calendar') {
    setTimeout(() => {
      if (typeof ensureCalendarRendered === 'function') {
        ensureCalendarRendered('dayGridMonth');
      }

      scheduleCursorRefresh(document.getElementById('schedule'));
    }, 0);
  } else if (targetView === 'timetable') {
    if (typeof updateTimetable === 'function') {
      updateTimetable();
    }
  } else if (targetView === 'ustc-timetable') {
    if (typeof renderUstcTimetable === 'function') {
      renderUstcTimetable();
    }
  }

  scheduleCursorRefresh(document.getElementById('schedule'));
  dispatchScheduleViewChange(targetView);
}

function bindOnce(element, eventName, handler, flag) {
  if (!element || !eventName || typeof handler !== 'function') return;

  const key = flag || ('bound' + eventName);

  if (element.dataset && element.dataset[key] === 'true') {
    return;
  }

  element.addEventListener(eventName, handler);

  if (element.dataset) {
    element.dataset[key] = 'true';
  }
}

function setCursorHint(element, cursorKey, fallback, overwrite) {
  if (!element || !element.dataset) return;

  if (overwrite || !element.dataset.cursor) {
    element.dataset.cursor = cursorKey || 'precise_select';
  }

  if (overwrite || !element.dataset.cursorFallback) {
    element.dataset.cursorFallback = fallback || 'pointer';
  }
}

function setCursorHintForAll(root, selectors, cursorKey, fallback, overwrite) {
  const scope = root || document;

  if (!scope || typeof scope.querySelectorAll !== 'function') return;

  scope.querySelectorAll(selectors.join(', ')).forEach((el) => {
    setCursorHint(el, cursorKey, fallback, overwrite);
  });
}

function markScheduleCursorTargets(root) {
  const scheduleRoot = document.getElementById('schedule') || root;

  if (!scheduleRoot || typeof scheduleRoot.querySelectorAll !== 'function') return;

  /*
    Schedule is a dense UI panel. The page itself, labels, wrappers,
    helper text and table text should use the normal cursor. Only the
    actual controls should opt into precise_select.
  */
  setCursorHint(scheduleRoot, 'normal', 'auto', true);

  setCursorHintForAll(scheduleRoot, [
    '.schedule-container',
    '.schedule-section',
    '.schedule-heading',
    '.semester-title',

    '.schedule-switcher',

    '.semester-selector',
    '.semester-dropdown',
    '.semester-dropdown-content',

    '.schedule-semester-panel',
    '.schedule-semester-panel label',
    '.schedule-semester-select-wrap',

    '.schedule-week-panel',
    '.schedule-week-panel label',
    '.schedule-week-select-wrap',

    '.schedule-export-toolbar',
    '.schedule-export-control',
    '.schedule-export-control label',

    '.ustc-local-save-hint',
    '.week-display',
    '.weeks-title',
    '.schedule-control-hint-below',

    '.timetable',
    '.timetable th',
    '.timetable td',
    '#ustc-timetable',
    '#ustc-timetable th',
    '#ustc-timetable td'
  ], 'normal', 'auto', true);

  /*
    Actual clickable / selectable controls.
    These are intentionally narrower than the panel wrappers above.
  */
  setCursorHintForAll(scheduleRoot, [
    '.schedule-switch-btn',
    '.schedule-switch-btn *',
    '.schedule-switcher a.schedule-switch-btn',
    '.schedule-switcher a.schedule-switch-btn *',

    '.semester-dropdown-btn',
    '.semester-dropdown-btn *',
    '.semester-dropdown-content a',
    '.semester-dropdown-content a *',

    '.schedule-semester-select',
    '.schedule-semester-select *',
    '[data-schedule-semester-select]',
    '[data-schedule-semester-select] *',

    '.schedule-week-panel select',
    '.schedule-week-panel select *',
    '[data-schedule-week-select]',
    '[data-schedule-week-select] *',

    '.schedule-export-control select',
    '.schedule-export-control select *',
    '.schedule-export-btn',
    '.schedule-export-btn *',
    '.schedule-export-action',
    '.schedule-export-action *',

    '.add-event-btn',
    '.add-event-btn *',
    '.event-form-btn',
    '.event-form-btn *',
    '.event-modal-close',
    '.event-modal-close *',

    '.week-nav-btn',
    '.week-nav-btn *',

    '.edit-ustc-class',
    '.delete-ustc-class',
    '.edit-ustc-class *',
    '.delete-ustc-class *'
  ], 'precise_select', 'pointer', true);

  setCursorHintForAll(scheduleRoot, [
    '.timetable td.has-event',
    '.timetable td.has-event *',
    '.timetable-event',
    '.timetable-event *',
    'td.event-cell',
    'td.event-cell *',
    'td.event-cell .course-container',
    'td.event-cell .course-container *',
    'td.event-cell .overlap-container',
    'td.event-cell .overlap-container *',
    'td.event-cell .overlap-course',
    'td.event-cell .overlap-course *',
    '.fc .fc-button',
    '.fc .fc-button *',
    '.fc-event',
    '.fc-event *'
  ], 'precise_select', 'pointer', true);

  setCursorHintForAll(scheduleRoot, [
    'input:not([type])',
    'input[type="text"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="password"]',
    'input[type="number"]',
    'input[type="url"]',
    'input[type="tel"]',
    'textarea',
    '[contenteditable="true"]'
  ], 'text_select', 'text', true);
}

function scheduleCursorRefresh(root) {
  if (scheduleCursorMarkPending) return;

  scheduleCursorMarkPending = true;

  window.requestAnimationFrame(() => {
    scheduleCursorMarkPending = false;
    markScheduleCursorTargets(root || document.getElementById('schedule'));

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh();
    }
  });
}

function installScheduleCursorObserver() {
  const root = document.getElementById('schedule');

  if (!root || scheduleCursorObserver) return;

  scheduleCursorObserver = new MutationObserver(() => {
    scheduleCursorRefresh(root);
  });

  scheduleCursorObserver.observe(root, {
    childList: true,
    subtree: true
  });
}

function initSchedulePage() {
  if (typeof initCalendar === 'function') {
    initCalendar();
  }

  if (typeof initTimetable === 'function') {
    initTimetable();
  }

  const viewSwitchers = document.querySelectorAll('.schedule-switch-btn');

  if (!schedulePageInitialized) {
    setScheduleView('my-timetable');
  }

  viewSwitchers.forEach(btn => {
    setCursorHint(btn, 'precise_select', 'pointer', true);
  });

  const eventModal = document.getElementById('event-modal');
  const eventModalClose = document.getElementById('event-modal-close');
  const eventCancelBtn = document.getElementById('event-cancel-btn');
  const eventForm = document.getElementById('event-form');

  const generalEventModal = document.getElementById('general-event-modal');
  const generalEventModalClose = document.getElementById('general-event-modal-close');
  const generalEventCancelBtn = document.getElementById('general-event-cancel-btn');
  const generalEventForm = document.getElementById('general-event-form');

  bindOnce(document.getElementById('add-calendar-event'), 'click', () => {
    if (typeof openGeneralEventModal === 'function') {
      openGeneralEventModal('calendar');
    }
  }, 'scheduleAddCalendarBound');

  bindOnce(document.getElementById('add-timetable-event'), 'click', () => {
    if (typeof openGeneralEventModal === 'function') {
      openGeneralEventModal('timetable');
    }
  }, 'scheduleAddTimetableBound');

  bindOnce(document.getElementById('add-ustc-event'), 'click', () => {
    if (typeof openUstcClassModal === 'function') {
      openUstcClassModal();
    }
  }, 'scheduleAddUstcBound');

  bindOnce(eventModalClose, 'click', () => {
    if (eventModal) eventModal.style.display = 'none';
  }, 'scheduleCloseEventModalBound');

  bindOnce(eventCancelBtn, 'click', () => {
    if (eventModal) eventModal.style.display = 'none';
  }, 'scheduleCancelEventModalBound');

  bindOnce(generalEventModalClose, 'click', () => {
    if (generalEventModal) generalEventModal.style.display = 'none';
  }, 'scheduleCloseGeneralEventModalBound');

  bindOnce(generalEventCancelBtn, 'click', () => {
    if (generalEventModal) generalEventModal.style.display = 'none';
  }, 'scheduleCancelGeneralEventModalBound');

  if (!schedulePageInitialized) {
    window.addEventListener('click', (e) => {
      if (e.target === eventModal) {
        eventModal.style.display = 'none';
      }

      if (e.target === generalEventModal) {
        generalEventModal.style.display = 'none';
      }
    });
  }

  bindOnce(eventForm, 'submit', (e) => {
    e.preventDefault();

    if (typeof saveUstcClass === 'function') {
      saveUstcClass();
    }
  }, 'scheduleEventFormBound');

  bindOnce(generalEventForm, 'submit', (e) => {
    e.preventDefault();

    if (typeof saveGeneralEvent === 'function') {
      saveGeneralEvent();
    }
  }, 'scheduleGeneralEventFormBound');

  bindOnce(document.getElementById('event-delete-btn'), 'click', () => {
    if (typeof deleteUstcClass === 'function') {
      deleteUstcClass();
    }
  }, 'scheduleDeleteUstcBound');

  bindOnce(document.getElementById('general-event-delete-btn'), 'click', () => {
    if (typeof deleteGeneralEvent === 'function') {
      deleteGeneralEvent();
    }
  }, 'scheduleDeleteGeneralEventBound');

  bindOnce(document.getElementById('prev-week-btn'), 'click', () => {
    if (typeof goToPreviousWeek === 'function') {
      goToPreviousWeek();
    }
  }, 'schedulePrevWeekBound');

  bindOnce(document.getElementById('next-week-btn'), 'click', () => {
    if (typeof goToNextWeek === 'function') {
      goToNextWeek();
    }
  }, 'scheduleNextWeekBound');

  installScheduleCursorObserver();
  scheduleCursorRefresh(document.getElementById('schedule'));

  schedulePageInitialized = true;
}

window.addEventListener('site:langchange', function (e) {
  if (e && e.detail && e.detail.scheduleExportOnly === true) {
    return;
  }

  const lang = (window.SiteLang && typeof window.SiteLang.normalizeLang === 'function')
    ? window.SiteLang.normalizeLang(e && e.detail && e.detail.lang)
    : getCurrentLang();

  if (typeof setCalendarLocale === 'function') {
    setCalendarLocale(lang);
  }

  try {
    if (typeof updateTimetable === 'function') updateTimetable();
  } catch (err) { }

  try {
    if (typeof updateWeekDisplay === 'function') updateWeekDisplay();
  } catch (err) { }

  try {
    if (typeof renderUstcClassesList === 'function') renderUstcClassesList();
  } catch (err) { }

  scheduleCursorRefresh(document.getElementById('schedule'));
});

window.addEventListener('schedule:semesterchange', function () {
  scheduleCursorRefresh(document.getElementById('schedule'));
});

window.addEventListener('schedule:viewchange', function () {
  scheduleCursorRefresh(document.getElementById('schedule'));
});

window.Schedule = window.Schedule || {};
window.Schedule.setScheduleView = setScheduleView;
window.Schedule.initSchedulePage = initSchedulePage;
window.Schedule.markCursorTargets = markScheduleCursorTargets;
window.Schedule.refreshCursorTargets = scheduleCursorRefresh;
window.Schedule.initWeeksSelection = (typeof initWeeksSelection === 'function') ? initWeeksSelection : undefined;
window.Schedule.initSemesterSelection = function () {};
window.Schedule.updateCalendarTheme = (typeof updateCalendarTheme === 'function') ? updateCalendarTheme : function () {};
