window.__SCHEDULE_CALENDAR_GENERAL_VERSION__ = 'calendar-custom-timegrid-overlay-v14';

// General events storage
let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let timetableEvents = JSON.parse(localStorage.getItem('timetableEvents')) || [];

// General schedule state
let calendar;
let calendarRendered = false;
let calendarPendingView = null;
let calendarRefreshPending = false;
let currentWeek = new Date();
let fullCalendarLoadPromise = null;
let timetableInitialized = false;
let calendarOverlayResizeBound = false;

function getFullCalendarAssets() {
  const resources = window.SiteResources || {};
  const external = resources.external || {};
  const libraries = external.libraries || {};
  return libraries.fullCalendar || { styles: [], scripts: [] };
}

function loadFullCalendarAssets() {
  if (window.FullCalendar && typeof window.FullCalendar.Calendar === 'function') {
    return Promise.resolve(true);
  }

  if (fullCalendarLoadPromise) {
    return fullCalendarLoadPromise;
  }

  fullCalendarLoadPromise = (async () => {
    const loader = window.SiteResourceLoader || {};
    const assets = getFullCalendarAssets();

    if (typeof loader.loadStylesInParallel === 'function') {
      await loader.loadStylesInParallel(assets.styles || []);
    }

    if (typeof loader.loadScriptsInOrder === 'function') {
      await loader.loadScriptsInOrder(assets.scripts || []);
    } else {
      for (const script of (assets.scripts || [])) {
        await new Promise((resolve) => {
          const src = typeof script === 'string' ? script : script.src;

          if (!src) {
            resolve(null);
            return;
          }

          const el = document.createElement('script');
          el.src = src;
          el.async = false;
          el.onload = () => resolve(el);
          el.onerror = () => resolve(null);
          document.body.appendChild(el);
        });
      }
    }

    return !!(window.FullCalendar && typeof window.FullCalendar.Calendar === 'function');
  })();

  return fullCalendarLoadPromise;
}

function isCalendarVisible() {
  const schedulePage = document.getElementById('schedule');
  const calendarSection = document.getElementById('calendar-section');
  const container = document.getElementById('calendar-container');

  return !!(
    schedulePage &&
    schedulePage.classList.contains('visible') &&
    calendarSection &&
    calendarSection.classList.contains('active') &&
    container &&
    container.offsetParent !== null
  );
}

async function createCalendarIfNeeded() {
  if (calendar) return calendar;

  const calendarEl = document.getElementById('calendar-container');
  if (!calendarEl) return null;

  const loaded = await loadFullCalendarAssets();

  if (!loaded || !window.FullCalendar || typeof window.FullCalendar.Calendar !== 'function') {
    console.warn('[Schedule] FullCalendar failed to load.');
    return null;
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: getFullCalendarLocale(getCurrentLang()),
    timeZone: 'local',
    initialView: 'dayGridMonth',

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    allDaySlot: false,

    events: [],
    eventDisplay: 'block',

    displayEventTime: false,
    displayEventEnd: false,
    eventContent: renderCalendarEventContent,

    datesSet: function () {
      scheduleCustomTimeGridOverlayRender();
    },

    eventDidMount: function (info) {
      if (info && info.el && info.el.dataset) {
        info.el.dataset.cursor = 'precise_select';
        info.el.dataset.cursorFallback = 'pointer';
      }

      scheduleCustomTimeGridOverlayRender();
    },

    eventClick: function (info) {
      openGeneralEventModal('calendar', getCalendarSourceEvent(info.event));
    }
  });

  bindCalendarOverlayResize();
  updateCalendarTheme();
  return calendar;
}

function bindCalendarOverlayResize() {
  if (calendarOverlayResizeBound) return;

  calendarOverlayResizeBound = true;

  window.addEventListener('resize', () => {
    scheduleCustomTimeGridOverlayRender();
  });
}

function buildCalendarDisplayEvents() {
  return calendarEvents.flatMap(splitCalendarEventForDisplay);
}

function splitCalendarEventForDisplay(event) {
  if (!event) return [];

  const start = parseCalendarWallDateAsLocalDate(event.start);
  const end = parseCalendarWallDateAsLocalDate(event.end);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return [];
  }

  const segments = [];
  const firstDay = startOfLocalDay(start);
  const lastDay = startOfLocalDay(end);

  const sourceEvent = {
    id: event.id,
    title: event.title || '',
    description: event.description || '',
    start: event.start,
    end: event.end
  };

  const cursor = new Date(firstDay);

  while (cursor <= lastDay) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const segmentStart = maxDate(start, dayStart);
    const segmentEnd = minDate(end, dayEnd);

    if (segmentEnd > segmentStart) {
      const endsAtDayBoundary = segmentEnd.getTime() === dayEnd.getTime();

      const displayStartLabel = formatTimeLabel(segmentStart);
      const displayEndLabel = endsAtDayBoundary
        ? '24:00'
        : formatTimeLabel(segmentEnd);

      const displayTimeText = `${displayStartLabel} - ${displayEndLabel}`;

      /*
        FullCalendar treats event.end as exclusive.
        If a segment visually ends at 24:00, use 23:59 internally,
        but keep displayEndLabel as 24:00.
      */
      const renderEnd = endsAtDayBoundary
        ? new Date(dayEnd.getTime() - 60 * 1000)
        : new Date(segmentEnd.getTime());

      segments.push({
        id: `${event.id}__calendar_segment_${formatDateKey(dayStart)}`,
        title: event.title || '',
        start: new Date(segmentStart.getTime()),
        end: new Date(renderEnd.getTime()),
        allDay: false,
        extendedProps: {
          sourceEvent,
          originalId: event.id,
          description: event.description || '',
          displayTimeText,
          displayStartLabel,
          displayEndLabel,
          isCalendarSegment: true
        }
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return segments;
}

function parseCalendarWallDateAsLocalDate(value) {
  const parts = parseScheduleWallDateParts(value);

  if (!parts) {
    return new Date(NaN);
  }

  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond
  );
}

function parseScheduleWallDateParts(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
      hour: value.getHours(),
      minute: value.getMinutes(),
      second: value.getSeconds(),
      millisecond: value.getMilliseconds()
    };
  }

  const raw = String(value || '').trim();

  if (!raw) return null;

  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw)) {
    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) return null;

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds()
    };
  }

  const match = raw.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );

  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4] || 0),
      minute: Number(match[5] || 0),
      second: Number(match[6] || 0),
      millisecond: 0
    };
  }

  const fallback = new Date(raw);

  if (Number.isNaN(fallback.getTime())) return null;

  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth() + 1,
    day: fallback.getDate(),
    hour: fallback.getHours(),
    minute: fallback.getMinutes(),
    second: fallback.getSeconds(),
    millisecond: fallback.getMilliseconds()
  };
}

function getCalendarSourceEvent(calendarEvent) {
  if (!calendarEvent) return null;

  const props = calendarEvent.extendedProps || {};

  if (props.sourceEvent) {
    return {
      id: props.sourceEvent.id,
      title: props.sourceEvent.title || '',
      description: props.sourceEvent.description || '',
      start: props.sourceEvent.start,
      end: props.sourceEvent.end
    };
  }

  const originalId = props.originalId || calendarEvent.id;
  const matched = calendarEvents.find(event => event.id === originalId);

  if (matched) return matched;

  return {
    id: originalId,
    title: calendarEvent.title || '',
    description: props.description || '',
    start: formatDateTimeForInput(getGeneralEventStart(calendarEvent)),
    end: formatDateTimeForInput(getGeneralEventEnd(calendarEvent))
  };
}

function getCalendarSourceEventFromDisplayEvent(displayEvent) {
  const props = displayEvent && displayEvent.extendedProps ? displayEvent.extendedProps : {};

  if (props.sourceEvent) {
    return {
      id: props.sourceEvent.id,
      title: props.sourceEvent.title || '',
      description: props.sourceEvent.description || '',
      start: props.sourceEvent.start,
      end: props.sourceEvent.end
    };
  }

  return getCalendarSourceEvent(displayEvent);
}

function renderCalendarEventContent(info) {
  const event = info && info.event ? info.event : null;

  if (!event) return { domNodes: [] };

  const frame = document.createElement('div');
  frame.className = 'schedule-calendar-event-frame';

  const timeText = formatCalendarEventTime(event);

  if (timeText) {
    const timeEl = document.createElement('div');
    timeEl.className = 'schedule-calendar-event-time';
    timeEl.textContent = timeText;
    frame.appendChild(timeEl);
  }

  const titleEl = document.createElement('div');
  titleEl.className = 'schedule-calendar-event-title';
  titleEl.textContent = event.title || '';
  frame.appendChild(titleEl);

  return {
    domNodes: [frame]
  };
}

function formatCalendarEventTime(event) {
  const props = event && event.extendedProps ? event.extendedProps : {};

  if (props.isCalendarSegment && typeof props.displayTimeText === 'string') {
    return props.displayTimeText;
  }

  const start = getGeneralEventStart(event);
  const end = getGeneralEventEnd(event);

  if (!start || !end) return '';

  return formatEventTimeRange(start, end);
}

function scheduleCustomTimeGridOverlayRender() {
  requestAnimationFrame(renderCustomTimeGridOverlay);
  setTimeout(renderCustomTimeGridOverlay, 0);
  setTimeout(renderCustomTimeGridOverlay, 80);
  setTimeout(renderCustomTimeGridOverlay, 220);
}

function renderCustomTimeGridOverlay() {
  const calendarRoot = document.getElementById('calendar-container');

  if (!calendarRoot || !calendar || !calendar.view) return;

  const viewType = calendar.view.type;
  const isTimeGrid = viewType === 'timeGridWeek' || viewType === 'timeGridDay';

  removeCustomTimeGridOverlay();

  if (!isTimeGrid) {
    showNativeTimeGridEvents();
    return;
  }

  hideNativeTimeGridEvents();

  const body = calendarRoot.querySelector('.fc-timegrid-body');
  const slots = calendarRoot.querySelector('.fc-timegrid-slots');
  const cols = Array.from(calendarRoot.querySelectorAll('.fc-timegrid-col[data-date]'));

  if (!body || !slots || !cols.length) return;

  body.style.position = 'relative';

  const bodyRect = body.getBoundingClientRect();
  const slotsRect = slots.getBoundingClientRect();

  if (!slotsRect.height || slotsRect.height <= 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'schedule-calendar-timegrid-overlay';
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.zIndex = '20';
  overlay.style.pointerEvents = 'none';

  body.appendChild(overlay);

  const dayMinutes = 24 * 60;
  const pxPerMinute = slotsRect.height / dayMinutes;

  const colMap = new Map();

  cols.forEach(col => {
    const date = col.getAttribute('data-date');
    const rect = col.getBoundingClientRect();

    colMap.set(date, {
      left: rect.left - bodyRect.left,
      width: rect.width
    });
  });

  buildCalendarDisplayEvents().forEach(event => {
    const props = event.extendedProps || {};

    if (!props.isCalendarSegment) return;

    const start = event.start instanceof Date ? event.start : new Date(event.start);

    if (Number.isNaN(start.getTime())) return;

    const dateKey = formatDateKeyDashed(start);
    const col = colMap.get(dateKey);

    if (!col) return;

    const startMinutes = parseCalendarDisplayStartMinutes(props);
    const endMinutes = parseCalendarDisplayEndMinutes(props);

    if (
      startMinutes == null ||
      endMinutes == null ||
      endMinutes <= startMinutes
    ) {
      return;
    }

    const top = (slotsRect.top - bodyRect.top) + startMinutes * pxPerMinute;
    const height = Math.max(18, (endMinutes - startMinutes) * pxPerMinute);

    const card = document.createElement('div');
    card.className = 'schedule-calendar-timegrid-event';
    card.dataset.cursor = 'precise_select';
    card.dataset.cursorFallback = 'pointer';

    card.style.position = 'absolute';
    card.style.left = `${col.left + 3}px`;
    card.style.top = `${top}px`;
    card.style.width = `${Math.max(0, col.width - 6)}px`;
    card.style.height = `${height}px`;
    card.style.pointerEvents = 'auto';

    card.innerHTML = `
      <div class="schedule-calendar-event-frame">
        <div class="schedule-calendar-event-time">${escapeHtml(props.displayTimeText || '')}</div>
        <div class="schedule-calendar-event-title">${escapeHtml(event.title || '')}</div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      openGeneralEventModal('calendar', getCalendarSourceEventFromDisplayEvent(event));
    });

    overlay.appendChild(card);
  });

  if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
    window.Schedule.markCursorTargets(document.getElementById('schedule'));
  }
}

function removeCustomTimeGridOverlay() {
  document
    .querySelectorAll('.schedule-calendar-timegrid-overlay')
    .forEach(node => node.remove());
}

function hideNativeTimeGridEvents() {
  document
    .querySelectorAll('#calendar-container .fc-timegrid-event-harness')
    .forEach(node => {
      node.style.display = 'none';
    });
}

function showNativeTimeGridEvents() {
  document
    .querySelectorAll('#calendar-container .fc-timegrid-event-harness')
    .forEach(node => {
      node.style.display = '';
    });
}

function parseCalendarDisplayStartMinutes(props) {
  if (typeof props.displayStartLabel === 'string') {
    return parseTimeLabelToMinutes(props.displayStartLabel);
  }

  if (typeof props.displayTimeText === 'string') {
    const parts = props.displayTimeText.split('-');

    if (parts[0]) {
      return parseTimeLabelToMinutes(parts[0].trim());
    }
  }

  return null;
}

function parseCalendarDisplayEndMinutes(props) {
  if (typeof props.displayEndLabel === 'string') {
    return parseTimeLabelToMinutes(props.displayEndLabel);
  }

  if (typeof props.displayTimeText === 'string') {
    const parts = props.displayTimeText.split('-');

    if (parts[1]) {
      return parseTimeLabelToMinutes(parts[1].trim());
    }
  }

  return null;
}

function parseTimeLabelToMinutes(label) {
  const text = String(label || '').trim();

  if (text === '24:00') return 24 * 60;

  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 24 ||
    minute < 0 ||
    minute >= 60
  ) {
    return null;
  }

  if (hour === 24 && minute !== 0) return null;

  return hour * 60 + minute;
}

function formatDateKeyDashed(value) {
  const date = value instanceof Date ? value : new Date(value);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

function refreshCalendarEvents() {
  if (!calendar) return;

  if (typeof calendar.removeAllEventSources === 'function') {
    calendar.removeAllEventSources();
  } else {
    calendar.removeAllEvents();
  }

  calendar.addEventSource(buildCalendarDisplayEvents());
  scheduleCustomTimeGridOverlayRender();
}

function ensureCalendarRendered(forceView) {
  if (forceView) {
    calendarPendingView = forceView;
  }

  createCalendarIfNeeded().then((instance) => {
    if (!instance) return;

    if (!isCalendarVisible()) {
      calendarRefreshPending = true;
      return;
    }

    if (!calendarRendered) {
      instance.render();
      calendarRendered = true;
      refreshCalendarEvents();
    }

    if (calendarPendingView) {
      instance.changeView(calendarPendingView);
      calendarPendingView = null;
    }

    if (calendarRefreshPending) {
      refreshCalendarEvents();
      calendarRefreshPending = false;
    }

    setTimeout(() => {
      try {
        instance.updateSize();
      } catch (e) { }

      scheduleCustomTimeGridOverlayRender();

      if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
        window.Schedule.markCursorTargets(document.getElementById('schedule'));
      }
    }, 0);
  });
}

function initCalendar() {
  if (calendar) {
    try {
      calendar.destroy();
    } catch (e) { }

    calendar = null;
  }

  removeCustomTimeGridOverlay();

  calendarRendered = false;
  calendarPendingView = null;
  calendarRefreshPending = false;
}

function updateCalendarTheme() {
  if (!calendar) return;
  calendar.setOption('themeSystem', 'standard');
}

function setCalendarLocale(lang) {
  if (!calendar) return;

  calendar.setOption('locale', getFullCalendarLocale(lang));
  calendarRefreshPending = true;
  ensureCalendarRendered();
}

// Timetable functionality
function initTimetable() {
  if (timetableInitialized) {
    updateTimetable();
    return;
  }

  const timetableBody = document.getElementById('timetable-body');
  if (!timetableBody) return;

  timetableBody.innerHTML = '';

  for (let hour = 0; hour <= 23; hour++) {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.className = 'time-cell';
    timeCell.textContent = `${formatHourLabel(hour)} - ${formatHourLabel(hour + 1)}`;
    row.appendChild(timeCell);

    for (let day = 0; day < 7; day++) {
      const dayCell = document.createElement('td');
      dayCell.dataset.day = day;
      dayCell.dataset.hour = hour;
      row.appendChild(dayCell);
    }

    timetableBody.appendChild(row);
  }

  timetableInitialized = true;
  updateTimetable();
}

function updateTimetable() {
  const weekStart = new Date(currentWeek);
  weekStart.setDate(currentWeek.getDate() - (currentWeek.getDay() + 6) % 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const lang = getCurrentLang();
  const currentWeekEl = document.getElementById('current-week');

  if (currentWeekEl) {
    const visibleWeekEnd = new Date(weekEnd);
    visibleWeekEnd.setDate(visibleWeekEnd.getDate() - 1);

    if (lang === 'zh') {
      const optionsZh = { weekday: 'short', month: 'numeric', day: 'numeric' };
      const left = weekStart.toLocaleDateString('zh-CN', optionsZh);
      const right = visibleWeekEnd.toLocaleDateString('zh-CN', optionsZh);
      currentWeekEl.textContent = `${t('weekOf')}${left} - ${right}`;
    } else {
      const optionsEn = { weekday: 'short', month: 'short', day: 'numeric' };
      currentWeekEl.textContent =
        `${t('weekOf')} ${weekStart.toLocaleDateString('en-US', optionsEn)} - ${visibleWeekEnd.toLocaleDateString('en-US', optionsEn)}`;
    }
  }

  const cells = document.querySelectorAll('#timetable-body td:not(.time-cell)');
  cells.forEach(cell => {
    cell.className = '';
    cell.innerHTML = '';
    cell.rowSpan = 1;
    cell.style.display = '';
    cell.removeAttribute('data-cursor');
    cell.removeAttribute('data-cursor-fallback');
  });

  const occupied = Array.from({ length: 7 }, () => Object.create(null));

  const weekEvents = timetableEvents
    .filter(event => {
      const start = new Date(event.start);
      const end = new Date(event.end);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return false;
      }

      return end > weekStart && start < weekEnd;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  weekEvents.forEach(event => {
    const placements = getTimetableEventPlacements(event, weekStart, weekEnd, occupied);

    placements.forEach(placement => {
      const cell = document.querySelector(
        `#timetable-body td[data-day="${placement.day}"][data-hour="${placement.hour}"]`
      );

      if (!cell || cell.style.display === 'none') return;

      cell.className = 'has-event has-class event-cell general-timetable-event-cell';
      cell.rowSpan = placement.rowSpan;
      cell.dataset.cursor = 'precise_select';
      cell.dataset.cursorFallback = 'pointer';

      for (let hour = placement.hour + 1; hour < placement.hour + placement.rowSpan; hour++) {
        const coveredCell = document.querySelector(
          `#timetable-body td[data-day="${placement.day}"][data-hour="${hour}"]`
        );

        if (coveredCell) {
          coveredCell.style.display = 'none';
        }
      }

      const startInfo = document.createElement('div');
      startInfo.className = 'time-info start-info';
      startInfo.textContent = formatTimeLabel(placement.segmentStart);

      const endInfo = document.createElement('div');
      endInfo.className = 'time-info end-info';
      endInfo.textContent = getSegmentEndLabel(placement.segmentEnd, placement.dayStart);

      const eventElement = document.createElement('div');
      eventElement.className = 'course-container general-timetable-event';
      eventElement.dataset.cursor = 'precise_select';
      eventElement.dataset.cursorFallback = 'pointer';

      const title = escapeHtml(event.title || '');
      const description = escapeHtml(event.description || '');
      const timeRange = escapeHtml(formatEventTimeRange(event.start, event.end));

      eventElement.innerHTML = `
        <div class="course-number">${timeRange}</div>
        <div class="course-name">${title}</div>
        ${description ? `<div class="location">${description}</div>` : ''}
      `;

      eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openGeneralEventModal('timetable', event);
      });

      cell.appendChild(startInfo);
      cell.appendChild(endInfo);
      cell.appendChild(eventElement);
    });
  });

  if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
    window.Schedule.markCursorTargets(document.getElementById('schedule'));
  }
}

function getTimetableEventPlacements(event, weekStart, weekEnd, occupied) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  if (end <= start) return [];

  const placements = [];
  const hourMs = 60 * 60 * 1000;

  for (let day = 0; day < 7; day++) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const segmentStart = maxDate(start, dayStart, weekStart);
    const segmentEnd = minDate(end, dayEnd, weekEnd);

    if (segmentEnd <= segmentStart) continue;

    let firstHour = Math.floor((segmentStart.getTime() - dayStart.getTime()) / hourMs);
    let lastHourExclusive = Math.ceil((segmentEnd.getTime() - dayStart.getTime()) / hourMs);

    firstHour = Math.max(0, Math.min(23, firstHour));
    lastHourExclusive = Math.max(firstHour + 1, Math.min(24, lastHourExclusive));

    let rowSpan = Math.max(1, lastHourExclusive - firstHour);

    if (hasOccupiedHour(occupied, day, firstHour, rowSpan)) {
      const fallbackHour = findFirstFreeHour(occupied, day, firstHour, lastHourExclusive);

      if (fallbackHour == null) {
        continue;
      }

      firstHour = fallbackHour;
      rowSpan = 1;
    }

    for (let hour = firstHour; hour < firstHour + rowSpan; hour++) {
      occupied[day][hour] = true;
    }

    placements.push({
      day,
      hour: firstHour,
      rowSpan,
      dayStart,
      dayEnd,
      segmentStart,
      segmentEnd
    });
  }

  return placements;
}

function maxDate() {
  return Array.from(arguments).reduce((max, value) => {
    const date = value instanceof Date ? value : new Date(value);
    return date > max ? date : max;
  }, new Date(-8640000000000000));
}

function minDate() {
  return Array.from(arguments).reduce((min, value) => {
    const date = value instanceof Date ? value : new Date(value);
    return date < min ? date : min;
  }, new Date(8640000000000000));
}

function hasOccupiedHour(occupied, day, startHour, rowSpan) {
  for (let hour = startHour; hour < startHour + rowSpan; hour++) {
    if (occupied[day] && occupied[day][hour]) {
      return true;
    }
  }

  return false;
}

function findFirstFreeHour(occupied, day, startHour, endHourExclusive) {
  for (let hour = startHour; hour < endHourExclusive; hour++) {
    if (!occupied[day][hour]) {
      return hour;
    }
  }

  return null;
}

function goToPreviousWeek() {
  currentWeek.setDate(currentWeek.getDate() - 7);
  updateTimetable();
}

function goToNextWeek() {
  currentWeek.setDate(currentWeek.getDate() + 7);
  updateTimetable();
}

function openGeneralEventModal(type, event = null, preset = null) {
  const modal = document.getElementById('general-event-modal');
  const deleteBtn = document.getElementById('general-event-delete-btn');

  if (!modal || !deleteBtn) return;

  if (event) {
    document.getElementById('general-event-modal-title').textContent = t('editEvent');
    document.getElementById('general-event-id').value = event.id || '';
    document.getElementById('event-title').value = event.title || '';
    document.getElementById('event-description').value = getGeneralEventDescription(event);
    document.getElementById('event-start').value = formatDateTimeForInput(getGeneralEventStart(event));
    document.getElementById('event-end').value = formatDateTimeForInput(getGeneralEventEnd(event));
    deleteBtn.style.display = 'inline-block';
  } else {
    document.getElementById('general-event-modal-title').textContent = t('addNewEvent');
    document.getElementById('general-event-id').value = '';
    document.getElementById('event-title').value = '';
    document.getElementById('event-description').value = '';

    if (preset) {
      document.getElementById('event-start').value = formatDateTimeForInput(preset.start);
      document.getElementById('event-end').value = formatDateTimeForInput(preset.end);
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      document.getElementById('event-start').value = formatDateTimeForInput(now);
      document.getElementById('event-end').value = formatDateTimeForInput(oneHourLater);
    }

    deleteBtn.style.display = 'none';
  }

  document.getElementById('general-event-type').value = type;
  modal.style.display = 'flex';

  if (window.Schedule && typeof window.Schedule.markCursorTargets === 'function') {
    window.Schedule.markCursorTargets(document.getElementById('schedule'));
  }
}

function getGeneralEventDescription(event) {
  if (!event) return '';

  if (typeof event.description === 'string') {
    return event.description;
  }

  if (
    event.extendedProps &&
    typeof event.extendedProps.description === 'string'
  ) {
    return event.extendedProps.description;
  }

  return '';
}

function getGeneralEventStart(event) {
  if (!event) return new Date();

  if (event.start) return event.start;
  if (event.startStr) return new Date(event.startStr);

  return new Date();
}

function getGeneralEventEnd(event) {
  if (!event) {
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  if (event.end) return event.end;
  if (event.endStr) return new Date(event.endStr);

  const start = getGeneralEventStart(event);
  return new Date(start.getTime() + 60 * 60 * 1000);
}

function formatDateTimeForInput(date) {
  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.getTime())) return '';

  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, '0');
  const dd = String(value.getDate()).padStart(2, '0');
  const hh = String(value.getHours()).padStart(2, '0');
  const min = String(value.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatTimeLabel(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getSegmentEndLabel(segmentEnd, dayStart) {
  const end = segmentEnd instanceof Date ? segmentEnd : new Date(segmentEnd);
  const day = dayStart instanceof Date ? dayStart : new Date(dayStart);

  if (Number.isNaN(end.getTime()) || Number.isNaN(day.getTime())) {
    return formatTimeLabel(segmentEnd);
  }

  const dayEnd = new Date(day);
  dayEnd.setDate(dayEnd.getDate() + 1);

  if (end.getTime() === dayEnd.getTime()) {
    return '24:00';
  }

  return formatTimeLabel(end);
}

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatEventTimeRange(startValue, endValue) {
  const start = startValue instanceof Date ? startValue : new Date(startValue);
  const end = endValue instanceof Date ? endValue : new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '';
  }

  if (isSameLocalDate(start, end)) {
    return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
  }

  return `${formatDateTimeLabel(start)} - ${formatDateTimeLabel(end)}`;
}

function formatDateTimeLabel(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${month}/${day} ${formatTimeLabel(date)}`;
}

function isSameLocalDate(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfLocalDay(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}_${mm}_${dd}`;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function saveGeneralEvent() {
  const id = document.getElementById('general-event-id').value;
  const type = document.getElementById('general-event-type').value;
  const title = document.getElementById('event-title').value;
  const description = document.getElementById('event-description').value;
  const start = document.getElementById('event-start').value;
  const end = document.getElementById('event-end').value;

  if (!title || !start || !end) {
    alert(t('fillRequired'));
    return;
  }

  if (new Date(end) <= new Date(start)) {
    alert(getCurrentLang() === 'zh'
      ? '结束时间必须晚于开始时间。'
      : 'End time must be later than start time.');
    return;
  }

  const event = {
    id: id || Date.now().toString(),
    title,
    description,
    start,
    end
  };

  let events;

  if (type === 'calendar') {
    events = calendarEvents;
  } else {
    events = timetableEvents;
  }

  if (id) {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) events[index] = event;
  } else {
    events.push(event);
  }

  if (type === 'calendar') {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  } else {
    localStorage.setItem('timetableEvents', JSON.stringify(events));
  }

  document.getElementById('general-event-modal').style.display = 'none';

  if (type === 'calendar') {
    calendarRefreshPending = true;
    ensureCalendarRendered();
  } else {
    updateTimetable();
  }
}

function deleteGeneralEvent() {
  const id = document.getElementById('general-event-id').value;
  const type = document.getElementById('general-event-type').value;

  if (!id) return;

  if (!confirm(t('confirmDeleteEvent'))) return;

  let events;

  if (type === 'calendar') {
    events = calendarEvents;
  } else {
    events = timetableEvents;
  }

  const index = events.findIndex(e => e.id === id);
  if (index !== -1) events.splice(index, 1);

  if (type === 'calendar') {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  } else {
    localStorage.setItem('timetableEvents', JSON.stringify(events));
  }

  document.getElementById('general-event-modal').style.display = 'none';

  if (type === 'calendar') {
    calendarRefreshPending = true;
    ensureCalendarRendered();
  } else {
    updateTimetable();
  }
}