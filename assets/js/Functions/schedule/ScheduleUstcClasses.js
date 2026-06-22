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

function markUstcCursorTarget(element) {
  if (!element || !element.dataset) return;

  element.dataset.cursor = element.dataset.cursor || 'precise_select';
  element.dataset.cursorFallback = element.dataset.cursorFallback || 'pointer';
}

// Initialize weeks selection
function initWeeksSelection() {
  const weeksGrid = document.getElementById('weeks-grid');
  if (!weeksGrid) return;

  weeksGrid.innerHTML = '';

  for (let week = 1; week <= 18; week++) {
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
}

function updateWeekDisplay() {
  const weekDisplay = document.getElementById('week-display');
  if (!weekDisplay) return;

  const selectedWeeks = Array.from(document.querySelectorAll('input[name="ustc-week"]:checked'))
    .map(checkbox => parseInt(checkbox.value))
    .sort((a, b) => a - b);

  if (selectedWeeks.length === 0) {
    weekDisplay.textContent = t('noWeeksSelected');
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

  weekDisplay.textContent = (getCurrentLang() === 'zh')
    ? (ranges.join('，') + t('weeksSuffix'))
    : (ranges.join(', ') + t('weeksSuffix'));
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

  return (getCurrentLang() === 'zh')
    ? (ranges.join('，') + (ranges.length > 0 ? t('weeksSuffix') : ''))
    : (ranges.join(', ') + (ranges.length > 0 ? t('weeksSuffix') : ''));
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
      <td>${cls.credits || t('unknown')}</td>
      <td>
        <button class="edit-ustc-class" data-id="${cls.id}" data-cursor="precise_select" data-cursor-fallback="pointer">${t('edit')}</button>
        <button class="delete-ustc-class" data-id="${cls.id}" data-cursor="precise_select" data-cursor-fallback="pointer">${t('del')}</button>
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
  const lang = getCurrentLang();

  const dayNames = (lang === 'zh')
    ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (lang === 'zh')
    ? days.map(day => dayNames[day]).join('，')
    : days.map(day => dayNames[day]).join(', ');
}

function openUstcClassModal(cls = null, periodStart = null, periodEnd = null, day = null) {
  const modal = document.getElementById('event-modal');
  const deleteBtn = document.getElementById('event-delete-btn');
  if (!modal || !deleteBtn) return;

  if (cls) {
    document.getElementById('event-modal-title').textContent = t('editClass');
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

    cls.days.forEach(day => {
      const checkbox = document.querySelector(`input[name="ustc-day"][value="${day}"]`);
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
    deleteBtn.style.display = 'inline-block';
  } else {
    document.getElementById('event-modal-title').textContent = t('addNewClass');
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
    deleteBtn.style.display = 'none';
  }

  const creditsInput = document.getElementById('ustc-credits');
  if (creditsInput) {
    creditsInput.type = 'number';
    creditsInput.step = '0.5';
    creditsInput.min = '0';
  }

  modal.style.display = 'flex';

  if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
    window.Schedule.markCursorTargets(document.getElementById('schedule'));
  }
}

function saveUstcClass() {
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
    alert(t('fillRequired'));
    return;
  }

  if (parseInt(periodStart) > parseInt(periodEnd)) {
    alert(t('endPeriodEarlier'));
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

  if (!confirm(t('confirmDeleteClass'))) return;

  ustcClasses = ustcClasses.filter(c => c.id !== id);
  localStorage.setItem('ustcClasses', JSON.stringify(ustcClasses));

  document.getElementById('event-modal').style.display = 'none';
  renderUstcTimetable();
}