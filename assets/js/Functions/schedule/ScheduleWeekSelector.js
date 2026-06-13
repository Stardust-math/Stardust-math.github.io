(function () {
  'use strict';

  const MIN_WEEK = 1;
  const MAX_WEEK = 18;

  const state = {
    my: 'all',
    ustc: 'all'
  };

  const UI_TEXT = {
    en: {
      selectWeek: 'Select Week',
      allWeeks: 'All Weeks',
      weekOption: function (week) { return 'Week ' + week; },
      weekCell: function (week) { return week + ' week(s)'; }
    },
    zh: {
      selectWeek: '选择周次',
      allWeeks: '全部周次',
      weekOption: function (week) { return '第' + week + '周'; },
      weekCell: function (week) { return '第' + week + '周'; }
    }
  };

  let initialized = false;
  let originalRenderUstcTimetable = null;
  let isRenderingUstc = false;

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();
    return value === 'zh' || value.startsWith('zh') ? 'zh' : 'en';
  }

  function getCurrentLangForWeekSelector() {
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

  function getMaxWeekForType(type) {
    if (type !== 'my') return MAX_WEEK;

    const activeSemester = getActiveMySemester();
    const semesterId = activeSemester && activeSemester.id ? activeSemester.id : '';
    const semester = getSemesterConfig()[semesterId] || null;
    const teachingWeeks = parseInt(semester && semester.teachingWeeks, 10);

    return Number.isFinite(teachingWeeks) && teachingWeeks >= MIN_WEEK
      ? teachingWeeks
      : MAX_WEEK;
  }

  function normalizeSelectedWeekValue(type, value) {
    const selected = String(value || state[type] || 'all');

    if (selected === 'all') return 'all';

    const week = parseInt(selected, 10);
    const maxWeek = getMaxWeekForType(type);

    return Number.isFinite(week) && week >= MIN_WEEK && week <= maxWeek
      ? String(week)
      : 'all';
  }

  function populateWeekSelectOptions(select, type, lang) {
    if (!select) return;

    const text = textFor(lang);
    const selectedValue = normalizeSelectedWeekValue(type, select.value || state[type] || 'all');
    const maxWeek = getMaxWeekForType(type);

    select.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = text.allWeeks;
    select.appendChild(allOption);

    for (let week = MIN_WEEK; week <= maxWeek; week += 1) {
      const option = document.createElement('option');
      option.value = String(week);
      option.textContent = text.weekOption(week);
      select.appendChild(option);
    }

    select.value = selectedValue;
    state[type] = selectedValue;
  }

  function cleanWeekText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function toEnglishWeeksText(value) {
    let text = cleanWeekText(value);
    if (!text) return '';

    text = text
      .replace(/^第\s*/g, '')
      .replace(/\s*周$/g, '')
      .replace(/week\(s\)/gi, '')
      .replace(/\bweeks?\b/gi, '')
      .replace(/（\s*单\s*）/g, ' (odd)')
      .replace(/（\s*双\s*）/g, ' (even)')
      .replace(/\b单\b/g, 'odd')
      .replace(/\b双\b/g, 'even')
      .replace(/[，、]/g, ', ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    return text ? (text + ' week(s)') : '';
  }

  function toChineseWeeksText(value) {
    let text = cleanWeekText(value);
    if (!text) return '';

    text = text
      .replace(/^第\s*/g, '')
      .replace(/\s*周$/g, '')
      .replace(/week\(s\)/gi, '')
      .replace(/\bweeks?\b/gi, '')
      .replace(/\(\s*odd\s*\)/gi, '（单）')
      .replace(/\(\s*even\s*\)/gi, '（双）')
      .replace(/\bodd\b/gi, '单')
      .replace(/\beven\b/gi, '双')
      .replace(/[，,]\s*/g, '、')
      .replace(/\s*、\s*/g, '、')
      .replace(/\s+/g, ' ')
      .replace(/\s*（/g, '（')
      .replace(/）\s*/g, '）')
      .trim();

    return text ? ('第' + text + '周') : '';
  }

  function weekTextForLang(value, lang) {
    return normalizeLang(lang) === 'zh'
      ? toChineseWeeksText(value)
      : toEnglishWeeksText(value);
  }

  function selectedWeekText(week, lang) {
    return textFor(lang).weekCell(week);
  }

  function parseWeeksFromText(value, maxWeek) {
    let text = cleanWeekText(value);
    const result = new Set();
    const upperWeek = Math.max(
      MIN_WEEK,
      parseInt(maxWeek || MAX_WEEK, 10) || MAX_WEEK
    );

    if (!text) return result;

    text = text
      .replace(/^第\s*/g, '')
      .replace(/\s*周$/g, '')
      .replace(/week\(s\)/gi, '')
      .replace(/\bweeks?\b/gi, '')
      .replace(/（\s*单\s*）/g, ' odd ')
      .replace(/（\s*双\s*）/g, ' even ')
      .replace(/\(\s*odd\s*\)/gi, ' odd ')
      .replace(/\(\s*even\s*\)/gi, ' even ')
      .replace(/\b单\b/g, ' odd ')
      .replace(/\b双\b/g, ' even ')
      .replace(/[，、;]/g, ',')
      .replace(/\s+/g, ' ')
      .trim();

    text.split(',')
      .map(function (part) { return part.trim(); })
      .filter(Boolean)
      .forEach(function (part) {
        const oddOnly = /\bodd\b/i.test(part);
        const evenOnly = /\beven\b/i.test(part);

        const cleaned = part
          .replace(/\bodd\b/gi, '')
          .replace(/\beven\b/gi, '')
          .replace(/[()（）]/g, '')
          .trim();

        const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);

        if (rangeMatch) {
          const start = parseInt(rangeMatch[1], 10);
          const end = parseInt(rangeMatch[2], 10);
          const left = Math.min(start, end);
          const right = Math.max(start, end);

          for (let week = left; week <= right; week += 1) {
            if (week < MIN_WEEK || week > upperWeek) continue;
            if (oddOnly && week % 2 === 0) continue;
            if (evenOnly && week % 2 !== 0) continue;
            result.add(week);
          }

          return;
        }

        const numbers = cleaned.match(/\d+/g) || [];

        numbers.forEach(function (numText) {
          const week = parseInt(numText, 10);
          if (week < MIN_WEEK || week > upperWeek) return;
          if (oddOnly && week % 2 === 0) return;
          if (evenOnly && week % 2 !== 0) return;
          result.add(week);
        });
      });

    return result;
  }

  function setTextIfChanged(element, text) {
    const next = String(text == null ? '' : text);

    if (element && element.textContent !== next) {
      element.textContent = next;
    }
  }

  function storeOriginalWeekText(weeksEl) {
    if (!weeksEl || !weeksEl.dataset) return;

    if (!weeksEl.dataset.weekSelectorOriginalText) {
      const sourceText = weeksEl.dataset.enText || weeksEl.textContent || '';
      weeksEl.dataset.weekSelectorOriginalText = cleanWeekText(sourceText);
    }

    if (!weeksEl.dataset.weekSelectorWeeks) {
      const weeks = Array.from(parseWeeksFromText(weeksEl.dataset.weekSelectorOriginalText, getMaxWeekForType('my')));
      weeksEl.dataset.weekSelectorWeeks = weeks.join(',');
    }
  }

  function getStoredWeeks(weeksEl) {
    storeOriginalWeekText(weeksEl);

    const raw = weeksEl && weeksEl.dataset
      ? weeksEl.dataset.weekSelectorWeeks || ''
      : '';

    return raw.split(',')
      .map(function (value) { return parseInt(value, 10); })
      .filter(function (value) { return Number.isFinite(value); });
  }

  function courseBlockMatchesWeek(block, selectedWeek) {
    if (selectedWeek === 'all') return true;

    const week = parseInt(selectedWeek, 10);
    if (!Number.isFinite(week)) return true;

    const weeksEl = block ? block.querySelector('.weeks') : null;
    if (!weeksEl) return true;

    const weeks = getStoredWeeks(weeksEl);

    if (!weeks.length) return true;

    return weeks.indexOf(week) !== -1;
  }

  function getMyCourseBlocks() {
    const activeSemester = document.querySelector('#my-timetable-section .semester-timetable-container.active');
    if (!activeSemester) return [];

    return Array.from(activeSemester.querySelectorAll(
      '.timetable .course-container, .timetable .overlap-course'
    ));
  }

  function getActiveMySemester() {
    return document.querySelector('#my-timetable-section .semester-timetable-container.active');
  }

  function removeSyntheticMyCells(root) {
    const scope = root || document;
    scope.querySelectorAll('td[data-week-selector-synthetic="true"]').forEach(function (cell) {
      cell.remove();
    });
  }

  function storeMyCellState(cell) {
    if (!cell || !cell.dataset) return;

    if (cell.dataset.weekSelectorOriginalClass == null) {
      cell.dataset.weekSelectorOriginalClass = cell.className || '';
    }

    if (cell.dataset.weekSelectorOriginalCursor == null) {
      cell.dataset.weekSelectorOriginalCursor = cell.style.cursor || '';
    }

    if (cell.dataset.weekSelectorOriginalRowSpan == null) {
      cell.dataset.weekSelectorOriginalRowSpan = String(cell.rowSpan || 1);
    }
  }

  function resetMyCellState(cell) {
    if (!cell || !cell.dataset) return;

    if (cell.dataset.weekSelectorOriginalClass != null) {
      cell.className = cell.dataset.weekSelectorOriginalClass;
    }

    if (cell.dataset.weekSelectorOriginalCursor != null) {
      cell.style.cursor = cell.dataset.weekSelectorOriginalCursor;
    }

    if (cell.dataset.weekSelectorOriginalRowSpan != null) {
      const originalRowSpan = parseInt(cell.dataset.weekSelectorOriginalRowSpan, 10);
      if (Number.isFinite(originalRowSpan) && originalRowSpan > 0) {
        cell.rowSpan = originalRowSpan;
      }
    }

    cell.removeAttribute('data-week-selector-empty');
    cell.removeAttribute('data-week-selector-split-span');
  }

  function updateMyCellVisibility(cell) {
    if (!cell) return;

    storeMyCellState(cell);
    resetMyCellState(cell);

    const blocks = Array.from(cell.querySelectorAll('.course-container, .overlap-course'));
    if (!blocks.length) return;

    const visibleBlocks = blocks.filter(function (block) {
      return block.dataset.scheduleWeekHidden !== 'true';
    });

    if (!visibleBlocks.length) {
      cell.classList.remove('has-event', 'has-class', 'event-cell');
      cell.classList.add('empty-cell');
      cell.style.cursor = 'default';
      cell.dataset.weekSelectorEmpty = 'true';
      cell.dataset.weekSelectorSplitSpan = cell.dataset.weekSelectorOriginalRowSpan || String(cell.rowSpan || 1);
    }
  }

  function getCellTableSection(cell) {
    return cell && cell.closest
      ? cell.closest('tbody')
      : null;
  }

  function getPositiveSpan(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : fallback;
  }

  function buildTableGrid(tbody) {
    const rows = Array.from(tbody ? tbody.rows : []);
    const occupied = [];
    const entriesByCell = new Map();
    const entriesByRow = new Map();

    rows.forEach(function (row, rowIndex) {
      if (!occupied[rowIndex]) occupied[rowIndex] = [];

      let colIndex = 0;
      const rowEntries = [];
      entriesByRow.set(row, rowEntries);

      Array.from(row.children).forEach(function (cell) {
        if (!/^(TD|TH)$/i.test(cell.tagName || '')) return;

        if (cell.dataset && cell.dataset.weekSelectorSynthetic === 'true') {
          return;
        }

        while (occupied[rowIndex][colIndex]) {
          colIndex += 1;
        }

        const rowSpan = getPositiveSpan(cell.getAttribute('rowspan') || cell.rowSpan || 1, 1);
        const colSpan = getPositiveSpan(cell.getAttribute('colspan') || cell.colSpan || 1, 1);

        const entry = {
          cell: cell,
          row: row,
          rowIndex: rowIndex,
          colIndex: colIndex,
          rowSpan: rowSpan,
          colSpan: colSpan
        };

        entriesByCell.set(cell, entry);
        rowEntries.push(entry);

        for (let r = rowIndex; r < rowIndex + rowSpan; r += 1) {
          if (!occupied[r]) occupied[r] = [];

          for (let c = colIndex; c < colIndex + colSpan; c += 1) {
            occupied[r][c] = true;
          }
        }

        colIndex += colSpan;
      });
    });

    return {
      rows: rows,
      entriesByCell: entriesByCell,
      entriesByRow: entriesByRow
    };
  }

  function findInsertionReferenceByColumn(grid, row, targetColumn) {
    const rowEntries = grid.entriesByRow.get(row) || [];
    let best = null;

    rowEntries.forEach(function (entry) {
      if (entry.colIndex <= targetColumn) return;

      if (!best || entry.colIndex < best.colIndex) {
        best = entry;
      }
    });

    return best ? best.cell : null;
  }

  function splitMyEmptyRowspanCells(cells) {
    const targets = Array.from(cells).filter(function (cell) {
      const span = parseInt(cell.dataset.weekSelectorSplitSpan || cell.rowSpan || 1, 10);
      return cell.dataset.weekSelectorEmpty === 'true' &&
        Number.isFinite(span) &&
        span > 1;
    });

    if (!targets.length) return;

    const targetsByTbody = new Map();

    targets.forEach(function (cell) {
      const tbody = getCellTableSection(cell);
      if (!tbody) return;

      if (!targetsByTbody.has(tbody)) {
        targetsByTbody.set(tbody, []);
      }

      targetsByTbody.get(tbody).push(cell);
    });

    targetsByTbody.forEach(function (tbodyTargets, tbody) {
      const beforeGrid = buildTableGrid(tbody);
      const insertPlans = [];

      tbodyTargets.forEach(function (cell) {
        const entry = beforeGrid.entriesByCell.get(cell);
        const span = parseInt(cell.dataset.weekSelectorSplitSpan || cell.rowSpan || 1, 10);

        if (!entry || !Number.isFinite(span) || span <= 1) return;

        for (let offset = 1; offset < span; offset += 1) {
          const row = beforeGrid.rows[entry.rowIndex + offset];
          if (!row) break;

          insertPlans.push({
            row: row,
            rowIndex: entry.rowIndex + offset,
            colIndex: entry.colIndex,
            colSpan: entry.colSpan
          });
        }

        cell.rowSpan = 1;
      });

      if (!insertPlans.length) return;

      const afterGrid = buildTableGrid(tbody);

      insertPlans.sort(function (a, b) {
        return (a.rowIndex - b.rowIndex) || (a.colIndex - b.colIndex);
      });

      insertPlans.forEach(function (plan) {
        const syntheticCell = document.createElement('td');

        syntheticCell.className = 'empty-cell week-selector-synthetic-cell';
        syntheticCell.dataset.weekSelectorSynthetic = 'true';
        syntheticCell.dataset.weekSelectorEmpty = 'true';
        syntheticCell.setAttribute('aria-hidden', 'true');

        if (plan.colSpan && plan.colSpan > 1) {
          syntheticCell.colSpan = plan.colSpan;
        }

        const before = findInsertionReferenceByColumn(afterGrid, plan.row, plan.colIndex);

        plan.row.insertBefore(
          syntheticCell,
          before && before.parentNode === plan.row ? before : null
        );
      });
    });
  }

  function applyMyWeekSelection() {
    const selected = state.my || 'all';
    const lang = getCurrentLangForWeekSelector();
    const activeSemester = getActiveMySemester();

    if (activeSemester) {
      removeSyntheticMyCells(activeSemester);
    }

    const blocks = getMyCourseBlocks();

    if (!blocks.length) return;

    blocks.forEach(function (block) {
      const matched = courseBlockMatchesWeek(block, selected);
      const weeksEl = block.querySelector('.weeks');

      if (block.dataset.scheduleWeekHidden !== String(!matched)) {
        block.dataset.scheduleWeekHidden = matched ? 'false' : 'true';
      }

      if (!weeksEl || !matched) return;

      storeOriginalWeekText(weeksEl);

      if (selected === 'all') {
        const original = weeksEl.dataset.weekSelectorOriginalText || weeksEl.dataset.enText || weeksEl.textContent || '';
        setTextIfChanged(weeksEl, weekTextForLang(original, lang));
      } else {
        const week = parseInt(selected, 10);
        if (Number.isFinite(week)) {
          setTextIfChanged(weeksEl, selectedWeekText(week, lang));
        }
      }
    });

    const cells = new Set();

    blocks.forEach(function (block) {
      const cell = block.closest('td');
      if (cell) cells.add(cell);
    });

    cells.forEach(updateMyCellVisibility);
    splitMyEmptyRowspanCells(cells);
  }

  function classMatchesSelectedWeek(cls, selectedWeek) {
    if (selectedWeek === 'all') return true;

    const week = parseInt(selectedWeek, 10);
    if (!Number.isFinite(week)) return true;

    const weeks = Array.isArray(cls && cls.weeks)
      ? cls.weeks.map(function (value) {
        return parseInt(value, 10);
      }).filter(function (value) {
        return Number.isFinite(value);
      })
      : [];

    if (!weeks.length) return true;

    return weeks.indexOf(week) !== -1;
  }

  function renderUstcTimetableWithoutClassesListRefresh() {
    if (
      typeof renderUstcClassesList !== 'function' ||
      typeof originalRenderUstcTimetable !== 'function'
    ) {
      return originalRenderUstcTimetable();
    }

    const realRenderUstcClassesList = renderUstcClassesList;

    try {
      renderUstcClassesList = function () {};
      return originalRenderUstcTimetable();
    } finally {
      renderUstcClassesList = realRenderUstcClassesList;
    }
  }

  function patchUstcRender() {
    if (originalRenderUstcTimetable) return;
    if (typeof renderUstcTimetable !== 'function') return;

    originalRenderUstcTimetable = renderUstcTimetable;

    renderUstcTimetable = function patchedRenderUstcTimetable() {
      if (isRenderingUstc) {
        return originalRenderUstcTimetable();
      }

      const selected = state.ustc || 'all';

      if (
        selected === 'all' ||
        typeof ustcClasses === 'undefined' ||
        !Array.isArray(ustcClasses)
      ) {
        return originalRenderUstcTimetable();
      }

      const fullClasses = ustcClasses;
      const filteredClasses = fullClasses.filter(function (cls) {
        return classMatchesSelectedWeek(cls, selected);
      });

      try {
        isRenderingUstc = true;
        ustcClasses = filteredClasses;
        renderUstcTimetableWithoutClassesListRefresh();
      } finally {
        ustcClasses = fullClasses;
        isRenderingUstc = false;
      }

      if (typeof renderUstcClassesList === 'function') {
        renderUstcClassesList();
      }

      applyUstcWeekText();

      return undefined;
    };
  }

  function applyUstcWeekText() {
    const selected = state.ustc || 'all';
    if (selected === 'all') return;

    const lang = getCurrentLangForWeekSelector();
    const week = parseInt(selected, 10);

    if (!Number.isFinite(week)) return;

    document.querySelectorAll('#ustc-timetable .weeks').forEach(function (weeksEl) {
      setTextIfChanged(weeksEl, selectedWeekText(week, lang));
    });
  }

  function applyUstcWeekSelection() {
    patchUstcRender();

    if (typeof renderUstcTimetable === 'function') {
      renderUstcTimetable();
    }

    applyUstcWeekText();
  }

  function applyWeekSelection(type) {
    if (type === 'ustc') {
      applyUstcWeekSelection();
      return;
    }

    applyMyWeekSelection();
  }

  function createWeekControl(type) {
    const lang = getCurrentLangForWeekSelector();
    const text = textFor(lang);

    const control = document.createElement('div');
    control.className = 'schedule-week-panel schedule-week-selector-control';
    control.dataset.weekSelectorType = type;

    const label = document.createElement('label');
    label.textContent = text.selectWeek;

    const selectWrap = document.createElement('div');
    selectWrap.className = 'schedule-week-select-wrap';

    const select = document.createElement('select');
    select.setAttribute('aria-label', text.selectWeek);
    select.dataset.scheduleWeekSelect = type;

    populateWeekSelectOptions(select, type, lang);

    select.addEventListener('change', function () {
      state[type] = select.value || 'all';
      applyWeekSelection(type);
    });

    selectWrap.appendChild(select);
    control.appendChild(label);
    control.appendChild(selectWrap);

    return control;
  }

  function updateWeekControlLanguage(control) {
    if (!control) return;

    const type = control.dataset.weekSelectorType || 'my';
    const lang = getCurrentLangForWeekSelector();
    const text = textFor(lang);
    const label = control.querySelector('label');
    const select = control.querySelector('select');

    if (label) {
      setTextIfChanged(label, text.selectWeek);
    }

    if (!select) return;

    select.setAttribute('aria-label', text.selectWeek);
    populateWeekSelectOptions(select, type, lang);
  }

  function mountMyWeekSelector() {
    if (document.querySelector('[data-week-selector-mounted="my"]')) return true;

    const row = document.querySelector('#my-timetable-section .schedule-export-my-row');
    const toolbar = document.querySelector('#my-timetable-section [data-schedule-export-mounted="my"]');

    if (!row || !toolbar) return false;

    row.classList.add('schedule-control-row', 'schedule-control-row-my');

    const selector = document.querySelector('#my-timetable-section .semester-selector');
    if (selector) {
      selector.classList.add('schedule-semester-panel');
    }

    const control = createWeekControl('my');
    control.dataset.weekSelectorMounted = 'my';

    row.insertBefore(control, toolbar);

    return true;
  }

  function mountUstcWeekSelector() {
    if (document.querySelector('[data-week-selector-mounted="ustc"]')) return true;

    const row = document.querySelector('#ustc-timetable-section .schedule-export-ustc-row');
    const toolbar = document.querySelector('#ustc-timetable-section [data-schedule-export-mounted="ustc"]');

    if (!row || !toolbar) return false;

    row.classList.add('schedule-control-row', 'schedule-control-row-ustc');

    const hint = row.querySelector('.ustc-local-save-hint');
    if (hint && row.parentNode) {
      hint.classList.add('schedule-control-hint-below');
      row.parentNode.insertBefore(hint, row.nextSibling);
    }

    const control = createWeekControl('ustc');
    control.dataset.weekSelectorMounted = 'ustc';

    row.insertBefore(control, toolbar);

    return true;
  }

  function mountWeekSelectors() {
    if (window.ScheduleExport && typeof window.ScheduleExport.init === 'function') {
      window.ScheduleExport.init();
    }

    const myMounted = mountMyWeekSelector();
    const ustcMounted = mountUstcWeekSelector();

    return myMounted && ustcMounted;
  }

  function refreshControlLanguage() {
    document.querySelectorAll('.schedule-week-selector-control').forEach(updateWeekControlLanguage);
  }

  function init() {
    patchUstcRender();

    const mounted = mountWeekSelectors();

    refreshControlLanguage();
    applyMyWeekSelection();
    applyUstcWeekText();

    initialized = initialized || mounted;

    return mounted;
  }

  function scheduleInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        window.requestAnimationFrame(init);
      }, { once: true });
    } else {
      window.requestAnimationFrame(init);
    }
  }

  window.addEventListener('site:langchange', function () {
    refreshControlLanguage();
    applyMyWeekSelection();
    applyUstcWeekText();
  });

  window.addEventListener('schedule:semesterchange', function () {
    refreshControlLanguage();
    applyMyWeekSelection();
  });

  window.ScheduleWeekSelector = window.ScheduleWeekSelector || {};
  window.ScheduleWeekSelector.init = init;
  window.ScheduleWeekSelector.applyWeekSelection = applyWeekSelection;

  window.Schedule = window.Schedule || {};
  window.Schedule.initWeekSelectionControl = init;

  scheduleInit();
})();
