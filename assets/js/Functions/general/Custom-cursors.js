(function () {
  'use strict';

  var BASE = new URL('./assets/cursors/', document.baseURI).href;

  var CURSORS = {
    normal: 'normal.cur',
    unavailable: 'unavailable.cur',
    vertical_resize: 'vertical_resize.cur',
    background_run: 'background_run.cur',
    candidate: 'candidate.cur',
    precise_select: 'precise_select.cur',
    link_select: 'link_select.cur',
    busy: 'busy.cur',
    handwriting: 'handwriting.cur',
    horizontal_resize: 'horizontal_resize.cur',
    text_select: 'text_select.cur',
    diagonal1: 'diagonal_resize1.cur',
    diagonal2: 'diagonal_resize2.cur',
    move: 'move.cur',
    help: 'help.cur'
  };

  var STYLE_ID = 'custom-cursor-style';

  function cursorValue(fileName, fallback) {
    return 'url("' + BASE + fileName + '"), ' + (fallback || 'auto');
  }

  function rule(selector, key, fallback) {
    if (!CURSORS[key]) return '';
    return selector + ' { cursor: ' + cursorValue(CURSORS[key], fallback) + '; }\n';
  }

  function buildCursorCss() {
    var css = '';

    css += rule('html, body', 'normal', 'auto');

    css += rule('a[href]', 'link_select', 'pointer');
    css += rule('button, .btn, input[type="button"], input[type="submit"], input[type="reset"], select', 'precise_select', 'pointer');
    css += rule('input[type="text"], input[type="search"], input[type="email"], input[type="password"], input[type="number"], input[type="url"], input[type="tel"], textarea, [contenteditable="true"]', 'text_select', 'text');

    css += rule('[draggable="true"], .draggable', 'move', 'move');
    css += rule('.resize-vertical', 'vertical_resize', 'ns-resize');
    css += rule('.resize-horizontal', 'horizontal_resize', 'ew-resize');
    css += rule('.resize-diag1', 'diagonal1', 'nwse-resize');
    css += rule('.resize-diag2', 'diagonal2', 'nesw-resize');
    css += rule('.help, [data-cursor="help"]', 'help', 'help');
    css += rule('#resume button.expander[data-expand-target]', 'help', 'help');
    css += rule('.busy, [data-busy], [aria-busy="true"]', 'busy', 'wait');
    css += rule('.handwriting, .scribble-area', 'handwriting', 'crosshair');

    css += rule('[data-cursor][data-cursor="normal"]', 'normal', 'auto');
    css += rule('[data-cursor][data-cursor="unavailable"]', 'unavailable', 'not-allowed');
    css += rule('[data-cursor][data-cursor="vertical_resize"]', 'vertical_resize', 'ns-resize');
    css += rule('[data-cursor][data-cursor="background_run"]', 'background_run', 'progress');
    css += rule('[data-cursor][data-cursor="candidate"]', 'candidate', 'copy');
    css += rule('[data-cursor][data-cursor="precise_select"]', 'precise_select', 'pointer');
    css += rule('[data-cursor][data-cursor="link_select"]', 'link_select', 'pointer');
    css += rule('[data-cursor][data-cursor="busy"]', 'busy', 'wait');
    css += rule('[data-cursor][data-cursor="handwriting"]', 'handwriting', 'crosshair');
    css += rule('[data-cursor][data-cursor="horizontal_resize"]', 'horizontal_resize', 'ew-resize');
    css += rule('[data-cursor][data-cursor="text_select"]', 'text_select', 'text');
    css += rule('[data-cursor][data-cursor="diagonal1"]', 'diagonal1', 'nwse-resize');
    css += rule('[data-cursor][data-cursor="diagonal2"]', 'diagonal2', 'nesw-resize');
    css += rule('[data-cursor][data-cursor="move"]', 'move', 'move');

    return css;
  }

  function injectCursorStyle() {
    var existing = document.getElementById(STYLE_ID);

    if (existing) {
      existing.textContent = buildCursorCss();
      return existing;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = buildCursorCss();

    document.head.appendChild(style);
    return style;
  }

  function applyCursorToElement(el, cursorKey, fallback) {
    if (!el || !cursorKey || !CURSORS[cursorKey]) return;

    try {
      el.style.cursor = cursorValue(CURSORS[cursorKey], fallback);
    } catch (e) { }
  }

  function setDefaultCursor(key, fallback) {
    if (!CURSORS[key]) return;

    try {
      document.documentElement.style.cursor = cursorValue(CURSORS[key], fallback || 'auto');
    } catch (e) { }
  }

  function refresh() {
    /*
      Kept as a compatibility API.

      The old implementation scanned the DOM and wrote inline cursor styles.
      That caused slow loading and slow page switching when large sections,
      such as Schedule tables, were rendered.

      Cursor rules are now handled by one stylesheet, so no DOM scan is needed.
    */
    injectCursorStyle();
  }

  function init() {
    injectCursorStyle();

    window.CustomCursorAPI = {
      setDefault: setDefaultCursor,
      apply: applyCursorToElement,
      refresh: refresh
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
