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

  function normalizeSelectors(selectors) {
    if (!selectors) return [];

    if (Array.isArray(selectors)) {
      return selectors.filter(Boolean);
    }

    return String(selectors)
      .split(',')
      .map(function (selector) {
        return selector.trim();
      })
      .filter(Boolean);
  }

  function joinSelectors(selectors) {
    return normalizeSelectors(selectors).join(',\n');
  }

  function withDescendants(selectors) {
    var expanded = [];

    normalizeSelectors(selectors).forEach(function (selector) {
      expanded.push(selector);
      expanded.push(selector + ' *');
    });

    return expanded;
  }

  function rule(selectors, key, fallback, important) {
    var selectorText = joinSelectors(selectors);

    if (!selectorText || !CURSORS[key]) return '';

    return selectorText + ' {\n' +
      '  cursor: ' + cursorValue(CURSORS[key], fallback) + (important ? ' !important' : '') + ';\n' +
      '}\n';
  }

  function buildCursorCss() {
    var css = '';

    function add(selectors, key, fallback, important) {
      css += rule(selectors, key, fallback, important);
    }

    function addWithChildren(selectors, key, fallback, important) {
      add(withDescendants(selectors), key, fallback, important);
    }

    css += rule('html, body', 'normal', 'auto', false);

    addWithChildren([
      'a[href]',
      'area[href]',
      '[role="link"]'
    ], 'link_select', 'pointer', true);

    addWithChildren([
      'button:not(:disabled)',
      '.btn:not(.disabled):not(.is-disabled)',
      'input[type="button"]:not(:disabled)',
      'input[type="submit"]:not(:disabled)',
      'input[type="reset"]:not(:disabled)',
      'input[type="checkbox"]:not(:disabled)',
      'input[type="radio"]:not(:disabled)',
      'select:not(:disabled)',
      'summary',
      'label[for]',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="tab"]:not([aria-disabled="true"])',
      '[role="switch"]:not([aria-disabled="true"])',
      '[role="menuitem"]:not([aria-disabled="true"])',
      '[role="option"]:not([aria-disabled="true"])'
    ], 'precise_select', 'pointer', true);

    add([
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

    addWithChildren([
      '[draggable="true"]',
      '.draggable'
    ], 'move', 'move', true);

    addWithChildren('.resize-vertical', 'vertical_resize', 'ns-resize', true);
    addWithChildren('.resize-horizontal', 'horizontal_resize', 'ew-resize', true);
    addWithChildren('.resize-diag1', 'diagonal1', 'nwse-resize', true);
    addWithChildren('.resize-diag2', 'diagonal2', 'nesw-resize', true);

    addWithChildren([
      '.help',
      '[data-cursor="help"]',
      '#resume button.expander[data-expand-target]'
    ], 'help', 'help', true);

    addWithChildren([
      '.busy',
      '[data-busy]',
      '[aria-busy="true"]'
    ], 'busy', 'wait', true);

    addWithChildren([
      '.handwriting',
      '.scribble-area'
    ], 'handwriting', 'crosshair', true);

    /*
      Explicit data-cursor declarations are the authoritative cursor semantics.

      These rules intentionally use !important because many page-level CSS files
      still contain native cursor: pointer/default declarations. The scope is not
      a business-class fallback list; it only applies where the element itself
      explicitly declares data-cursor.
    */
    addWithChildren('[data-cursor][data-cursor="normal"]', 'normal', 'auto', true);
    addWithChildren('[data-cursor][data-cursor="unavailable"]', 'unavailable', 'not-allowed', true);
    addWithChildren('[data-cursor][data-cursor="vertical_resize"]', 'vertical_resize', 'ns-resize', true);
    addWithChildren('[data-cursor][data-cursor="background_run"]', 'background_run', 'progress', true);
    addWithChildren('[data-cursor][data-cursor="candidate"]', 'candidate', 'copy', true);
    addWithChildren('[data-cursor][data-cursor="precise_select"]', 'precise_select', 'pointer', true);
    addWithChildren('[data-cursor][data-cursor="link_select"]', 'link_select', 'pointer', true);
    addWithChildren('[data-cursor][data-cursor="busy"]', 'busy', 'wait', true);
    addWithChildren('[data-cursor][data-cursor="handwriting"]', 'handwriting', 'crosshair', true);
    addWithChildren('[data-cursor][data-cursor="horizontal_resize"]', 'horizontal_resize', 'ew-resize', true);
    addWithChildren('[data-cursor][data-cursor="text_select"]', 'text_select', 'text', true);
    addWithChildren('[data-cursor][data-cursor="diagonal1"]', 'diagonal1', 'nwse-resize', true);
    addWithChildren('[data-cursor][data-cursor="diagonal2"]', 'diagonal2', 'nesw-resize', true);
    addWithChildren('[data-cursor][data-cursor="move"]', 'move', 'move', true);

    addWithChildren([
      '[disabled]',
      '[aria-disabled="true"]',
      '.disabled',
      '.is-disabled'
    ], 'unavailable', 'not-allowed', true);

    return css;
  }

  function injectCursorStyle() {
    var existing = document.getElementById(STYLE_ID);

    if (existing) {
      existing.textContent = buildCursorCss();

      /*
        Keep the cursor stylesheet near the end of <head>.
        This avoids being accidentally overridden by later lazy-loaded page CSS,
        while the explicit data-cursor rules still remain narrowly scoped.
      */
      if (existing.parentNode === document.head) {
        document.head.appendChild(existing);
      }

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

      Cursor rules are handled by one stylesheet. Refresh rebuilds and moves
      that stylesheet to the end of <head> so late-loaded module CSS does not
      override explicit cursor semantics.
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