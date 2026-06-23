// USTC Timetable period definitions
const periodTimes = {
  1: { start: '07:50', end: '08:35' },
  2: { start: '08:40', end: '09:25' },
  3: { start: '09:45', end: '10:30' },
  4: { start: '10:35', end: '11:20' },
  5: { start: '11:25', end: '12:10' },
  6: { start: '14:00', end: '14:45' },
  7: { start: '14:50', end: '15:35' },
  8: { start: '15:55', end: '16:40' },
  9: { start: '16:45', end: '17:30' },
  10: { start: '17:35', end: '18:20' },
  11: { start: '19:30', end: '20:15' },
  12: { start: '20:20', end: '21:05' },
  13: { start: '21:10', end: '21:55' }
};

// USTC classes storage
let ustcClasses = JSON.parse(localStorage.getItem('ustcClasses')) || [];

// Preserve initial timetable HTML
const timetableTbody = document.querySelector('#ustc-timetable tbody');
const timetableTbodyInitialHTML = timetableTbody ? timetableTbody.innerHTML : '';

const USTC_TEACHING_WEEKS_MIN = 1;
const USTC_TEACHING_WEEKS_MAX = 18;

const USTC_CLASS_FORM_TEXT = {
  en: {
    addClass: 'Add Class',
    addNewClass: 'Add New Class',
    editClass: 'Edit Class',
    periodStart: 'Period Start',
    periodEnd: 'Period End',
    courseName: 'Course Name',
    instructor: 'Instructor',
    location: 'Location',
    credits: 'Credits',
    days: 'Days',
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    teachingWeeksTitle: 'Teaching Weeks (1-18)',
    inputMode: 'Input Mode',
    expressionMode: 'Expression',
    checkboxMode: 'Checkbox',
    expressionLabel: 'Teaching Weeks Expression',
    apply: 'Apply',
    patternPlaceholder: 'e.g. 1-16 / 1-8,10-16 / 1-15 odd / 2-16 even',
    patternHint: 'Examples: 1-16 / 1-8,10-16 / 1,3,5 / 1-15 odd or 1-15 (odd) / 2-16 even or 2-16 (even) / Separate items with commas / Spaces are allowed / Only odd and even are supported / Numbers must be strictly increasing from left to right / Each range must go from a smaller number to a larger number / Overlapping ranges, repeated boundary weeks, reversed ranges, and weeks outside 1-18 are invalid',
    noWeeksSelected: 'No weeks selected',
    weeksSuffix: ' week(s)',
    unknown: 'Unknown',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    fillRequired: 'Please fill in all required fields',
    endPeriodEarlier: 'End period cannot be earlier than start period',
    confirmDeleteClass: 'Are you sure you want to delete this class?',
    patternEmpty: 'Please enter a teaching-weeks expression, such as 1-16.',
    patternInvalidFormat: 'Invalid format. Use examples such as 1-16 / 1-8,10-16 / 1,3,5 / 1-15 odd / 2-16 even.',
    patternOutOfRange: 'Invalid week number. Valid weeks are 1-18.',
    patternReversedRange: 'Invalid range. Each range must go from a smaller number to a larger number.',
    patternDegenerateRange: 'Invalid range. Use a single number instead of a range with the same start and end.',
    patternNotIncreasing: 'Invalid order. Numbers must be strictly increasing from left to right; overlapping ranges or repeated boundary weeks are not allowed.',
    patternNoEffectiveWeeks: 'This expression selects no effective weeks. Please check odd/even and the week numbers.'
  },
  zh: {
    addClass: '添加课程',
    addNewClass: '添加新课程',
    editClass: '编辑课程',
    periodStart: '起始节次',
    periodEnd: '结束节次',
    courseName: '课程名称',
    instructor: '授课教师',
    location: '上课地点',
    credits: '学分',
    days: '上课日期',
    dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    teachingWeeksTitle: '教学周次（1-18）',
    inputMode: '输入方式',
    expressionMode: '表达式',
    checkboxMode: '勾选',
    expressionLabel: '教学周次表达式',
    apply: '应用',
    patternPlaceholder: '例如：1-16 / 1-8,10-16 / 1-15 odd / 2-16 even',
    patternHint: '示例：1-16 / 1-8,10-16 / 1,3,5 / 1-15 odd 或 1-15 (odd) / 2-16 even 或 2-16 (even) / 请用逗号分隔不同片段 / 允许空格 / 仅支持 odd 和 even 两种英文修饰词 / 数字必须从左到右严格递增 / 每个区间必须由小到大 / 不允许区间重叠、边界周次重复、反向区间或超出 1-18 的周次',
    noWeeksSelected: '未选择周次',
    weeksSuffix: '周',
    unknown: '未知',
    edit: '编辑',
    delete: '删除',
    cancel: '取消',
    save: '保存',
    fillRequired: '请填写所有必填项',
    endPeriodEarlier: '结束节次不能早于起始节次',
    confirmDeleteClass: '确定要删除这门课吗？',
    patternEmpty: '请输入教学周次表达式，例如 1-16。',
    patternInvalidFormat: '教学周次表达式格式不正确。可使用 1-16 / 1-8,10-16 / 1,3,5 / 1-15 odd / 2-16 even。',
    patternOutOfRange: '周次超出范围。有效周次为 1-18。',
    patternReversedRange: '区间不合法。每个区间必须由较小数字到较大数字。',
    patternDegenerateRange: '区间不合法。起止相同的情况请直接写单个数字。',
    patternNotIncreasing: '顺序不合法。数字必须从左到右严格递增，不允许区间重叠或边界周次重复。',
    patternNoEffectiveWeeks: '该表达式没有选中任何有效周次，请检查 odd/even 与周次数字。'
  }
};

function normalizeUstcLang(lang) {
  const value = String(lang || '').toLowerCase();
  return value === 'zh' || value.startsWith('zh') ? 'zh' : 'en';
}

function getUstcLang() {
  if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
    return normalizeUstcLang(window.SiteLang.getLang());
  }

  const bodyLang = document.body && document.body.dataset
    ? document.body.dataset.lang
    : '';

  if (bodyLang) return normalizeUstcLang(bodyLang);

  const htmlLang = document.documentElement
    ? document.documentElement.getAttribute('lang')
    : '';

  if (htmlLang) return normalizeUstcLang(htmlLang);

  return 'en';
}

function ustcText(key) {
  const lang = getUstcLang();
  return (USTC_CLASS_FORM_TEXT[lang] && USTC_CLASS_FORM_TEXT[lang][key])
    || (USTC_CLASS_FORM_TEXT.en && USTC_CLASS_FORM_TEXT.en[key])
    || key;
}

function markUstcCursorTarget(element) {
  if (!element || !element.dataset) return;

  element.dataset.cursor = element.dataset.cursor || 'precise_select';
  element.dataset.cursorFallback = element.dataset.cursorFallback || 'pointer';
}

function setUstcElementText(selector, text) {
  const element = document.querySelector(selector);
  if (element && typeof text === 'string') {
    element.textContent = text;
  }
}

function setUstcLabelText(controlId, text) {
  const label = document.querySelector(`#event-modal label[for="${controlId}"]`);
  if (label && typeof text === 'string') {
    label.textContent = text;
  }
}

function setUstcGroupLabelText(innerSelector, text) {
  const innerElement = document.querySelector(innerSelector);
  const group = innerElement ? innerElement.closest('.event-form-group') : null;

  if (!group || typeof text !== 'string') return;

  const label = Array.from(group.children).find(child => child && child.tagName === 'LABEL');
  if (label) label.textContent = text;
}

function refreshUstcDayCheckboxLabels() {
  const dayNames = ustcText('dayNames');

  document.querySelectorAll('#event-modal input[name="ustc-day"]').forEach(input => {
    const label = input.closest('label');
    if (!label) return;

    Array.from(label.childNodes).forEach(node => {
      if (node !== input) node.remove();
    });

    const dayIndex = parseInt(input.value, 10);
    const dayText = Array.isArray(dayNames) ? dayNames[dayIndex] : input.value;

    label.appendChild(document.createTextNode(` ${dayText}`));
  });
}

function refreshWeekExpressionControlsText() {
  const modeLabel = document.getElementById('week-input-mode-label');
  const modeSelect = document.getElementById('week-input-mode');
  const expressionLabel = document.getElementById('week-pattern-label');
  const input = document.getElementById('week-pattern-input');
  const applyBtn = document.getElementById('week-pattern-apply');
  const hint = document.getElementById('week-pattern-hint');

  if (modeLabel) modeLabel.textContent = ustcText('inputMode');

  if (modeSelect) {
    const expressionOption = modeSelect.querySelector('option[value="expression"]');
    const checkboxOption = modeSelect.querySelector('option[value="checkbox"]');

    if (expressionOption) expressionOption.textContent = ustcText('expressionMode');
    if (checkboxOption) checkboxOption.textContent = ustcText('checkboxMode');
  }

  if (expressionLabel) expressionLabel.textContent = ustcText('expressionLabel');
  if (input) input.placeholder = ustcText('patternPlaceholder');
  if (applyBtn) applyBtn.textContent = ustcText('apply');
  if (hint) hint.textContent = ustcText('patternHint');
}

function refreshUstcClassFormLanguage() {
  const eventId = document.getElementById('event-id');
  const isEditing = Boolean(eventId && eventId.value);

  setUstcElementText('#event-modal-title', isEditing ? ustcText('editClass') : ustcText('addNewClass'));

  setUstcLabelText('ustc-period-start', ustcText('periodStart'));
  setUstcLabelText('ustc-period-end', ustcText('periodEnd'));
  setUstcLabelText('ustc-course-name', ustcText('courseName'));
  setUstcLabelText('ustc-instructor', ustcText('instructor'));
  setUstcLabelText('ustc-location', ustcText('location'));
  setUstcLabelText('ustc-credits', ustcText('credits'));

  setUstcGroupLabelText('#event-modal .days-container', ustcText('days'));
  setUstcElementText('#event-modal .weeks-title', ustcText('teachingWeeksTitle'));

  setUstcElementText('#event-delete-btn', ustcText('delete'));
  setUstcElementText('#event-cancel-btn', ustcText('cancel'));
  setUstcElementText('#event-modal .event-form-btn-save', ustcText('save'));

  const addBtn = document.getElementById('add-ustc-event');
  if (addBtn) {
    addBtn.innerHTML = `<i class="fas fa-plus"></i> ${ustcText('addClass')}`;
  }

  refreshUstcDayCheckboxLabels();
  refreshWeekExpressionControlsText();
}

function getSelectedUstcWeeks() {
  return Array.from(document.querySelectorAll('input[name="ustc-week"]:checked'))
    .map(checkbox => parseInt(checkbox.value, 10))
    .filter(week => Number.isInteger(week))
    .sort((a, b) => a - b);
}

function formatWeeksForPatternInput(weeks) {
  if (!weeks || weeks.length === 0) return '';

  const sortedWeeks = Array.from(new Set(weeks.map(Number)))
    .filter(week => Number.isInteger(week))
    .sort((a, b) => a - b);

  if (sortedWeeks.length === 0) return '';

  const ranges = [];
  let start = sortedWeeks[0];
  let end = start;

  for (let i = 1; i < sortedWeeks.length; i++) {
    if (sortedWeeks[i] === end + 1) {
      end = sortedWeeks[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sortedWeeks[i];
      end = start;
    }
  }

  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(',');
}

function syncWeekPatternInputFromCheckboxes() {
  const input = document.getElementById('week-pattern-input');
  if (!input) return;

  input.value = formatWeeksForPatternInput(getSelectedUstcWeeks());
}

function setWeekPatternError(message = '') {
  const error = document.getElementById('week-pattern-error');
  const input = document.getElementById('week-pattern-input');

  if (error) error.textContent = message;
  if (input) input.classList.toggle('has-error', Boolean(message));
}

function clearWeekPatternError() {
  setWeekPatternError('');
}

function setSelectedUstcWeeks(weeks, options = {}) {
  const selected = new Set(
    (weeks || [])
      .map(week => parseInt(week, 10))
      .filter(week => Number.isInteger(week))
  );

  document.querySelectorAll('input[name="ustc-week"]').forEach(checkbox => {
    checkbox.checked = selected.has(parseInt(checkbox.value, 10));
  });

  updateWeekDisplay({
    syncPatternInput: options.syncPatternInput !== false
  });
}

function parseWeekPattern(input) {
  const text = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/，/g, ',');

  if (!text) {
    throw new Error(ustcText('patternEmpty'));
  }

  const parts = text
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error(ustcText('patternEmpty'));
  }

  const weeks = [];
  let previousEnd = 0;

  parts.forEach(part => {
    const match = part.match(/^(\d{1,2})(?:\s*[-–—]\s*(\d{1,2}))?(?:\s*\(?\s*(odd|even)\s*\)?)?$/);

    if (!match) {
      throw new Error(ustcText('patternInvalidFormat'));
    }

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : start;
    const parity = match[3] || null;

    if (
      start < USTC_TEACHING_WEEKS_MIN ||
      start > USTC_TEACHING_WEEKS_MAX ||
      end < USTC_TEACHING_WEEKS_MIN ||
      end > USTC_TEACHING_WEEKS_MAX
    ) {
      throw new Error(ustcText('patternOutOfRange'));
    }

    if (start > end) {
      throw new Error(ustcText('patternReversedRange'));
    }

    if (match[2] && start === end) {
      throw new Error(ustcText('patternDegenerateRange'));
    }

    if (start <= previousEnd) {
      throw new Error(ustcText('patternNotIncreasing'));
    }

    for (let week = start; week <= end; week++) {
      if (parity === 'odd' && week % 2 === 0) continue;
      if (parity === 'even' && week % 2 !== 0) continue;
      weeks.push(week);
    }

    previousEnd = end;
  });

  if (weeks.length === 0) {
    throw new Error(ustcText('patternNoEffectiveWeeks'));
  }

  return weeks;
}

function applyWeekPatternInput() {
  const input = document.getElementById('week-pattern-input');
  if (!input) return true;

  try {
    const weeks = parseWeekPattern(input.value);
    clearWeekPatternError();
    setSelectedUstcWeeks(weeks, { syncPatternInput: false });
    return true;
  } catch (error) {
    setWeekPatternError(error && error.message ? error.message : ustcText('patternInvalidFormat'));
    return false;
  }
}

function setWeekInputMode(mode) {
  const normalizedMode = mode === 'checkbox' ? 'checkbox' : 'expression';
  const modeSelect = document.getElementById('week-input-mode');
  const expressionPanel = document.getElementById('week-expression-panel');
  const checkboxPanel = document.getElementById('week-checkbox-panel');

  if (modeSelect) modeSelect.value = normalizedMode;
  if (expressionPanel) expressionPanel.hidden = normalizedMode !== 'expression';
  if (checkboxPanel) checkboxPanel.hidden = normalizedMode !== 'checkbox';

  if (normalizedMode === 'expression') {
    syncWeekPatternInputFromCheckboxes();
  }

  clearWeekPatternError();
}

function bindWeekExpressionControls() {
  const modeSelect = document.getElementById('week-input-mode');
  const input = document.getElementById('week-pattern-input');
  const applyBtn = document.getElementById('week-pattern-apply');

  if (modeSelect && modeSelect.dataset.bound !== 'true') {
    modeSelect.addEventListener('change', () => {
      setWeekInputMode(modeSelect.value);
    });

    modeSelect.dataset.bound = 'true';
  }

  if (applyBtn && applyBtn.dataset.bound !== 'true') {
    applyBtn.addEventListener('click', () => {
      applyWeekPatternInput();
    });

    applyBtn.dataset.bound = 'true';
  }

  if (input && input.dataset.bound !== 'true') {
    input.addEventListener('input', clearWeekPatternError);

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyWeekPatternInput();
      }
    });

    input.dataset.bound = 'true';
  }
}

function ensureWeekInputControls() {
  const weeksGrid = document.getElementById('weeks-grid');
  if (!weeksGrid) return;

  const weeksContainer = weeksGrid.closest('.weeks-container');
  if (!weeksContainer) return;

  let checkboxPanel = document.getElementById('week-checkbox-panel');

  if (!checkboxPanel) {
    checkboxPanel = document.createElement('div');
    checkboxPanel.id = 'week-checkbox-panel';
    checkboxPanel.className = 'week-checkbox-panel';

    weeksGrid.insertAdjacentElement('beforebegin', checkboxPanel);
    checkboxPanel.appendChild(weeksGrid);
  }

  if (!document.getElementById('week-expression-controls')) {
    const controls = document.createElement('div');
    controls.id = 'week-expression-controls';
    controls.className = 'week-expression-controls';

    controls.innerHTML = `
      <div class="week-input-mode-row">
        <label id="week-input-mode-label" for="week-input-mode"></label>
        <select id="week-input-mode" class="event-form-control">
          <option value="expression" selected></option>
          <option value="checkbox"></option>
        </select>
      </div>

      <div id="week-expression-panel" class="week-expression-panel">
        <label id="week-pattern-label" for="week-pattern-input"></label>
        <div class="week-expression-row">
          <input
            type="text"
            id="week-pattern-input"
            class="event-form-control"
            autocomplete="off"
            spellcheck="false"
          >
          <button type="button" id="week-pattern-apply" class="event-form-btn week-pattern-apply-btn"></button>
        </div>
        <div class="week-pattern-hint" id="week-pattern-hint"></div>
        <div class="week-pattern-error" id="week-pattern-error" aria-live="polite"></div>
      </div>
    `;

    weeksContainer.insertBefore(controls, checkboxPanel);
  }

  refreshUstcClassFormLanguage();
  bindWeekExpressionControls();
  setWeekInputMode('expression');
}

// Initialize weeks selection
function initWeeksSelection() {
  const weeksGrid = document.getElementById('weeks-grid');
  if (!weeksGrid) return;

  weeksGrid.innerHTML = '';

  for (let week = USTC_TEACHING_WEEKS_MIN; week <= USTC_TEACHING_WEEKS_MAX; week++) {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'week-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `week-${week}`;
    checkbox.name = 'ustc-week';
    checkbox.value = week;

    const label = document.createElement('label');
    label.htmlFor = `week-${week}`;
    label.textContent = week;

    checkbox.addEventListener('change', updateWeekDisplay);

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    weeksGrid.appendChild(checkboxContainer);
  }

  ensureWeekInputControls();
  updateWeekDisplay();
  refreshUstcClassFormLanguage();
}

function updateWeekDisplay(options = {}) {
  const weekDisplay = document.getElementById('week-display');
  if (!weekDisplay) return;

  const selectedWeeks = getSelectedUstcWeeks();

  if (selectedWeeks.length === 0) {
    weekDisplay.textContent = ustcText('noWeeksSelected');

    if (options.syncPatternInput !== false) {
      syncWeekPatternInputFromCheckboxes();
    }

    return;
  }

  const ranges = [];
  let start = selectedWeeks[0];
  let end = start;

  for (let i = 1; i < selectedWeeks.length; i++) {
    if (selectedWeeks[i] === end + 1) {
      end = selectedWeeks[i];
    } else {
      ranges.push(start === end ? start : `${start}-${end}`);
      start = selectedWeeks[i];
      end = start;
    }
  }

  ranges.push(start === end ? start : `${start}-${end}`);

  weekDisplay.textContent = (getUstcLang() === 'zh')
    ? (ranges.join('，') + ustcText('weeksSuffix'))
    : (ranges.join(', ') + ustcText('weeksSuffix'));

  if (options.syncPatternInput !== false) {
    syncWeekPatternInputFromCheckboxes();
  }
}

function formatWeeks(weeks) {
  if (!weeks || weeks.length === 0) return '';

  const sortedWeeks = [...weeks].sort((a, b) => a - b);

  const ranges = [];
  let start = sortedWeeks[0];
  let end = start;

  for (let i = 1; i < sortedWeeks.length; i++) {
    if (sortedWeeks[i] === end + 1) {
      end = sortedWeeks[i];
    } else {
      ranges.push(start === end ? start : `${start}-${end}`);
      start = sortedWeeks[i];
      end = start;
    }
  }

  ranges.push(start === end ? start : `${start}-${end}`);

  return (getUstcLang() === 'zh')
    ? (ranges.join('，') + (ranges.length > 0 ? ustcText('weeksSuffix') : ''))
    : (ranges.join(', ') + (ranges.length > 0 ? ustcText('weeksSuffix') : ''));
}

// USTC Timetable functionality
function renderUstcTimetable() {
  const timetable = document.getElementById('ustc-timetable');
  if (!timetable) return;

  const tbody = timetable.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = timetableTbodyInitialHTML;

  const cells = Array.from(tbody.querySelectorAll('td[data-period][data-day]'));
  const occupied = Array(14).fill().map(() => Array(7).fill(false));

  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.rowSpan = 1;
    cell.className = '';
    cell.style.display = '';
    cell.removeAttribute('data-cursor');
    cell.removeAttribute('data-cursor-fallback');
  });

  ustcClasses.sort((a, b) => a.periodStart - b.periodStart);

  const cellCourses = Array(14).fill().map(() => Array(7).fill().map(() => []));

  ustcClasses.forEach(cls => {
    const periodStart = parseInt(cls.periodStart);
    const periodEnd = parseInt(cls.periodEnd);

    cls.days.forEach(day => {
      for (let period = periodStart; period <= periodEnd; period++) {
        if (period >= 1 && period <= 13) {
          cellCourses[period][day].push({
            id: cls.id,
            courseName: cls.courseName,
            instructor: cls.instructor,
            location: cls.location,
            credits: cls.credits,
            weeks: cls.weeks,
            periodStart: cls.periodStart,
            periodEnd: cls.periodEnd
          });
        }
      }
    });
  });

  for (let period = 1; period <= 13; period++) {
    for (let day = 0; day <= 6; day++) {
      const courses = cellCourses[period][day];
      if (courses.length === 0) continue;

      const cell = tbody.querySelector(`td[data-period="${period}"][data-day="${day}"]`);
      if (!cell) continue;

      if (occupied[period][day]) continue;

      let maxPeriod = period;

      for (let p = period; p <= 13; p++) {
        const allExist = courses.every(course =>
          cellCourses[p][day].some(c => c.id === course.id)
        );

        if (allExist) {
          maxPeriod = p;
        } else {
          break;
        }
      }

      const rowSpan = maxPeriod - period + 1;

      for (let p = period; p <= maxPeriod; p++) {
        occupied[p][day] = true;
      }

      cell.rowSpan = rowSpan;
      cell.className = 'has-class event-cell';
      markUstcCursorTarget(cell);

      const endPeriod = period + rowSpan - 1;

      const startInfo = document.createElement('div');
      startInfo.className = 'time-info start-info';
      startInfo.textContent = periodTimes[period].start;

      const endInfo = document.createElement('div');
      endInfo.className = 'time-info end-info';
      endInfo.textContent = periodTimes[endPeriod].end;

      const container = document.createElement('div');
      container.className = 'overlap-container';
      markUstcCursorTarget(container);

      cell.appendChild(startInfo);
      cell.appendChild(endInfo);

      courses.forEach(course => {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'overlap-course';
        markUstcCursorTarget(courseDiv);

        const credit = (course.credits ?? '').toString().trim();
        const creditHtml = credit ? ` <span class="credits-inline">[${credit}]</span>` : '';

        courseDiv.innerHTML = `
          <div class="course-name">${course.courseName}${creditHtml}</div>
          <div class="instructor">${course.instructor}</div>
          <div class="location">${course.location}</div>
          <div class="weeks">${formatWeeks(course.weeks)}</div>
        `;

        courseDiv.addEventListener('click', (e) => {
          e.stopPropagation();

          const cls = ustcClasses.find(c => c.id === course.id);
          if (cls) {
            openUstcClassModal(cls);
          }
        });

        container.appendChild(courseDiv);
      });

      cell.appendChild(container);

      for (let p = period + 1; p <= maxPeriod; p++) {
        const nextCell = tbody.querySelector(`td[data-period="${p}"][data-day="${day}"]`);

        if (nextCell) {
          nextCell.style.display = 'none';
        }
      }

      cell.addEventListener('click', (e) => {
        if (e.target === cell || e.target === startInfo || e.target === endInfo) {
          const period = parseInt(cell.dataset.period);
          const day = parseInt(cell.dataset.day);
          openUstcClassModal(null, period, period, day);
        }
      });
    }
  }

  renderUstcClassesList();

  if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
    window.Schedule.markCursorTargets(document.getElementById('schedule'));
  }
}

function renderUstcClassesList() {
  const tbody = document.getElementById('ustc-classes-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  ustcClasses.forEach(cls => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${cls.periodStart} - ${cls.periodEnd}</td>
      <td>${cls.courseName}</td>
      <td>${cls.instructor}</td>
      <td>${cls.location}</td>
      <td>${formatWeeks(cls.weeks)}</td>
      <td>${getDaysString(cls.days)}</td>
      <td>${cls.credits || ustcText('unknown')}</td>
      <td>
        <button class="edit-ustc-class" data-id="${cls.id}" data-cursor="precise_select" data-cursor-fallback="pointer">${ustcText('edit')}</button>
        <button class="delete-ustc-class" data-id="${cls.id}" data-cursor="precise_select" data-cursor-fallback="pointer">${ustcText('delete')}</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  document.querySelectorAll('.edit-ustc-class').forEach(btn => {
    markUstcCursorTarget(btn);

    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const cls = ustcClasses.find(c => c.id === id);

      if (cls) {
        openUstcClassModal(cls);
      }
    });
  });

  document.querySelectorAll('.delete-ustc-class').forEach(btn => {
    markUstcCursorTarget(btn);

    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      deleteUstcClass(id);
    });
  });
}

function getDaysString(days) {
  const lang = getUstcLang();
  const dayNames = lang === 'zh'
    ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return lang === 'zh'
    ? days.map(day => dayNames[day]).join('，')
    : days.map(day => dayNames[day]).join(', ');
}

function openUstcClassModal(cls = null, periodStart = null, periodEnd = null, day = null) {
  const modal = document.getElementById('event-modal');
  const deleteBtn = document.getElementById('event-delete-btn');
  if (!modal || !deleteBtn) return;

  ensureWeekInputControls();

  if (cls) {
    document.getElementById('event-id').value = cls.id;
    document.getElementById('ustc-period-start').value = cls.periodStart;
    document.getElementById('ustc-period-end').value = cls.periodEnd;
    document.getElementById('ustc-course-name').value = cls.courseName;
    document.getElementById('ustc-instructor').value = cls.instructor;
    document.getElementById('ustc-location').value = cls.location;
    document.getElementById('ustc-credits').value = cls.credits || '';

    document.querySelectorAll('input[name="ustc-day"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    cls.days.forEach(dayValue => {
      const checkbox = document.querySelector(`input[name="ustc-day"][value="${dayValue}"]`);
      if (checkbox) checkbox.checked = true;
    });

    document.querySelectorAll('input[name="ustc-week"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    if (cls.weeks && cls.weeks.length > 0) {
      cls.weeks.forEach(week => {
        const checkbox = document.querySelector(`input[name="ustc-week"][value="${week}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }

    updateWeekDisplay();
    setWeekInputMode('expression');
    deleteBtn.style.display = 'inline-block';
  } else {
    document.getElementById('event-id').value = '';
    document.getElementById('ustc-period-start').value = periodStart !== null ? periodStart : '1';
    document.getElementById('ustc-period-end').value = periodEnd !== null ? periodEnd : '1';
    document.getElementById('ustc-course-name').value = '';
    document.getElementById('ustc-instructor').value = '';
    document.getElementById('ustc-location').value = '';
    document.getElementById('ustc-credits').value = '';

    document.querySelectorAll('input[name="ustc-day"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    if (day !== null) {
      const dayCheckbox = document.querySelector(`input[name="ustc-day"][value="${day}"]`);
      if (dayCheckbox) dayCheckbox.checked = true;
    }

    document.querySelectorAll('input[name="ustc-week"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    updateWeekDisplay();
    setWeekInputMode('expression');
    deleteBtn.style.display = 'none';
  }

  const creditsInput = document.getElementById('ustc-credits');
  if (creditsInput) {
    creditsInput.type = 'number';
    creditsInput.step = '0.5';
    creditsInput.min = '0';
  }

  refreshUstcClassFormLanguage();

  modal.style.display = 'flex';

  if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
    window.Schedule.markCursorTargets(document.getElementById('schedule'));
  }
}

function saveUstcClass() {
  const weekInputMode = document.getElementById('week-input-mode');

  if (!weekInputMode || weekInputMode.value !== 'checkbox') {
    if (!applyWeekPatternInput()) return;
  }

  const id = document.getElementById('event-id').value;
  const periodStart = document.getElementById('ustc-period-start').value;
  const periodEnd = document.getElementById('ustc-period-end').value;
  const courseName = document.getElementById('ustc-course-name').value;
  const instructor = document.getElementById('ustc-instructor').value;
  const location = document.getElementById('ustc-location').value;
  const credits = document.getElementById('ustc-credits').value;

  const days = [];
  document.querySelectorAll('input[name="ustc-day"]:checked').forEach(checkbox => {
    days.push(parseInt(checkbox.value));
  });

  const weeks = [];
  document.querySelectorAll('input[name="ustc-week"]:checked').forEach(checkbox => {
    weeks.push(parseInt(checkbox.value));
  });

  if (!courseName || !instructor || !location || days.length === 0 || weeks.length === 0) {
    alert(ustcText('fillRequired'));
    return;
  }

  if (parseInt(periodStart) > parseInt(periodEnd)) {
    alert(ustcText('endPeriodEarlier'));
    return;
  }

  if (id) {
    const index = ustcClasses.findIndex(c => c.id === id);

    if (index !== -1) {
      ustcClasses[index] = {
        id,
        periodStart,
        periodEnd,
        courseName,
        instructor,
        location,
        credits,
        days,
        weeks
      };
    }
  } else {
    const newClass = {
      id: Date.now().toString(),
      periodStart,
      periodEnd,
      courseName,
      instructor,
      location,
      credits,
      days,
      weeks
    };

    ustcClasses.push(newClass);
  }

  localStorage.setItem('ustcClasses', JSON.stringify(ustcClasses));

  document.getElementById('event-modal').style.display = 'none';
  renderUstcTimetable();
}

function deleteUstcClass(id = null) {
  if (!id) {
    id = document.getElementById('event-id').value;
  }

  if (!id) return;

  if (!confirm(ustcText('confirmDeleteClass'))) return;

  ustcClasses = ustcClasses.filter(c => c.id !== id);
  localStorage.setItem('ustcClasses', JSON.stringify(ustcClasses));

  document.getElementById('event-modal').style.display = 'none';
  renderUstcTimetable();
}

window.addEventListener('site:langchange', function () {
  try {
    refreshUstcClassFormLanguage();
  } catch (err) { }

  try {
    updateWeekDisplay();
  } catch (err) { }

  try {
    renderUstcClassesList();
  } catch (err) { }
});

window.Schedule = window.Schedule || {};
window.Schedule.initWeeksSelection = initWeeksSelection;
window.Schedule.refreshUstcClassFormLanguage = refreshUstcClassFormLanguage;