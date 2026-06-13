(function () {
  'use strict';

  const DEFAULT_SEMESTER_ID = 'freshman-first';

  const SEMESTER_ORDER = [
    'freshman-first',
    'freshman-second',
    'freshman-summer',
    'sophomore-first',
    'sophomore-second',
    'sophomore-summer',
    'junior-first',
    'junior-second',
    'junior-summer',
    'senior-first',
    'senior-second'
  ];

  const UI_TEXT = {
    en: {
      selectSemester: 'Select Semester'
    },
    zh: {
      selectSemester: '选择学期'
    }
  };

  let initialized = false;

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();
    return value === 'zh' || value.startsWith('zh') ? 'zh' : 'en';
  }

  function getCurrentLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return normalizeLang(window.SiteLang.getLang());
    }

    const bodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : '';

    if (bodyLang) return normalizeLang(bodyLang);

    const htmlLang = document.documentElement
      ? document.documentElement.getAttribute('lang')
      : '';

    if (htmlLang) return normalizeLang(htmlLang);

    return 'en';
  }

  function textFor(lang) {
    return UI_TEXT[normalizeLang(lang)] || UI_TEXT.en;
  }

  function getSemesterConfig() {
    return window.SCHEDULE_SEMESTER_CONFIG && window.SCHEDULE_SEMESTER_CONFIG.semesters
      ? window.SCHEDULE_SEMESTER_CONFIG.semesters
      : {};
  }

  function getSemesterLabel(id, lang) {
    const semester = getSemesterConfig()[id];

    if (semester) {
      return normalizeLang(lang) === 'zh'
        ? (semester.labelZH || semester.labelEN || id)
        : (semester.labelEN || semester.labelZH || id);
    }

    const fallback = {
      'freshman-first': {
        en: 'Freshman Year - First Semester (2023 Fall)',
        zh: '大一上（23秋）'
      },
      'freshman-second': {
        en: 'Freshman Year - Second Semester (2024 Spring)',
        zh: '大一下（24春）'
      },
      'freshman-summer': {
        en: 'Freshman Year - Mini Semester (2024 Summer)',
        zh: '大一暑假（24夏）'
      },
      'sophomore-first': {
        en: 'Sophomore Year - First Semester (2024 Fall)',
        zh: '大二上（24秋）'
      },
      'sophomore-second': {
        en: 'Sophomore Year - Second Semester (2025 Spring)',
        zh: '大二下（25春）'
      },
      'sophomore-summer': {
        en: 'Sophomore Year - Mini Semester (2025 Summer)',
        zh: '大二暑假（25夏）'
      },
      'junior-first': {
        en: 'Junior Year - First Semester (2025 Fall)',
        zh: '大三上（25秋）'
      },
      'junior-second': {
        en: 'Junior Year - Second Semester (2026 Spring)',
        zh: '大三下（26春）'
      },
      'junior-summer': {
        en: 'Junior Year - Mini Semester (2026 Summer)',
        zh: '大三暑假（26夏）'
      },
      'senior-first': {
        en: 'Senior Year - First Semester (2026 Fall)',
        zh: '大四上（26秋）'
      },
      'senior-second': {
        en: 'Senior Year - Second Semester (2027 Spring)',
        zh: '大四下（27春）'
      }
    };

    const item = fallback[id];
    if (!item) return id || '';

    return normalizeLang(lang) === 'zh' ? item.zh : item.en;
  }

  function getAvailableSemesters() {
    const config = getSemesterConfig();

    const orderedIds = SEMESTER_ORDER.filter(function (id) {
      return document.getElementById(id) || config[id];
    });

    if (orderedIds.length) return orderedIds;

    return Array.from(document.querySelectorAll('#my-timetable-section .semester-timetable-container'))
      .map(function (container) {
        return container.id;
      })
      .filter(Boolean);
  }

  function getActiveSemesterId() {
    const active = document.querySelector('#my-timetable-section .semester-timetable-container.active');
    if (active && active.id) return active.id;

    const select = document.querySelector('#my-timetable-section [data-schedule-semester-select]');
    if (select && select.value) return select.value;

    return DEFAULT_SEMESTER_ID;
  }

  function dispatchSemesterChange(semesterId) {
    try {
      window.dispatchEvent(new CustomEvent('schedule:semesterchange', {
        detail: {
          semesterId: semesterId
        }
      }));
    } catch (e) { }
  }

  function activateSemester(semesterId) {
    const targetId = semesterId || DEFAULT_SEMESTER_ID;
    const target = document.getElementById(targetId);

    if (!target) return;

    document.querySelectorAll('#my-timetable-section .semester-timetable-container').forEach(function (container) {
      const isActive = container.id === targetId;
      container.classList.toggle('active', isActive);
      container.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    const select = document.querySelector('#my-timetable-section [data-schedule-semester-select]');
    if (select && select.value !== targetId) {
      select.value = targetId;
    }

    const root = document.querySelector('#my-timetable-section .semester-selector');
    if (root) {
      root.dataset.activeSemester = targetId;
    }

    dispatchSemesterChange(targetId);
  }

  function buildSemesterSelect(root) {
    const lang = getCurrentLang();
    const text = textFor(lang);
    const semesterIds = getAvailableSemesters();

    if (!semesterIds.length) return false;

    const current = getActiveSemesterId() || DEFAULT_SEMESTER_ID;
    const selectedId = semesterIds.indexOf(current) !== -1
      ? current
      : (semesterIds.indexOf(DEFAULT_SEMESTER_ID) !== -1 ? DEFAULT_SEMESTER_ID : semesterIds[0]);

    root.classList.add('schedule-semester-panel');
    root.dataset.scheduleSemesterMounted = 'true';
    root.dataset.activeSemester = selectedId;

    root.innerHTML = '';

    const label = document.createElement('label');
    label.className = 'schedule-semester-label';
    label.setAttribute('for', 'schedule-semester-select');
    label.textContent = text.selectSemester;

    const selectWrap = document.createElement('div');
    selectWrap.className = 'schedule-semester-select-wrap';

    const select = document.createElement('select');
    select.id = 'schedule-semester-select';
    select.className = 'schedule-semester-select';
    select.dataset.scheduleSemesterSelect = 'true';
    select.setAttribute('aria-label', text.selectSemester);

    semesterIds.forEach(function (id) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = getSemesterLabel(id, lang);
      select.appendChild(option);
    });

    select.value = selectedId;

    select.addEventListener('change', function () {
      activateSemester(select.value);
    });

    selectWrap.appendChild(select);
    root.appendChild(label);
    root.appendChild(selectWrap);

    activateSemester(selectedId);

    return true;
  }

  function refreshLanguage() {
    const lang = getCurrentLang();
    const text = textFor(lang);

    const root = document.querySelector('#my-timetable-section .semester-selector');
    if (!root) return;

    const label = root.querySelector('.schedule-semester-label');
    const select = root.querySelector('[data-schedule-semester-select]');

    if (label) {
      label.textContent = text.selectSemester;
    }

    if (!select) return;

    const selected = select.value || getActiveSemesterId() || DEFAULT_SEMESTER_ID;
    select.setAttribute('aria-label', text.selectSemester);

    Array.from(select.options).forEach(function (option) {
      option.textContent = getSemesterLabel(option.value, lang);
    });

    select.value = selected;
  }

  function init() {
    const root = document.querySelector('#my-timetable-section .semester-selector');
    if (!root) return false;

    if (!initialized || !root.querySelector('[data-schedule-semester-select]')) {
      initialized = buildSemesterSelect(root);
    } else {
      refreshLanguage();
    }

    return initialized;
  }

  window.addEventListener('site:langchange', function () {
    refreshLanguage();
  });

  window.ScheduleSemesterSelector = window.ScheduleSemesterSelector || {};
  window.ScheduleSemesterSelector.init = init;
  window.ScheduleSemesterSelector.activateSemester = activateSemester;
  window.ScheduleSemesterSelector.getActiveSemesterId = getActiveSemesterId;

  window.Schedule = window.Schedule || {};
  window.Schedule.initSemesterSelection = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.requestAnimationFrame(init);
    }, { once: true });
  } else {
    window.requestAnimationFrame(init);
  }
})();
