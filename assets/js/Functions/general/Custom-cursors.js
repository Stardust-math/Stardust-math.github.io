(function () {
  'use strict';

  var BASE = new URL(
    './assets/cursors/',
    document.baseURI
  ).href;

  var CURSORS = {
    normal: 'normal.cur',
    unavailable: 'unavailable.cur',
    vertical_resize:
      'vertical_resize.cur',
    background_run:
      'background_run.cur',
    candidate: 'candidate.cur',
    precise_select:
      'precise_select.cur',
    link_select:
      'link_select.cur',
    busy: 'busy.cur',
    handwriting:
      'handwriting.cur',
    horizontal_resize:
      'horizontal_resize.cur',
    text_select:
      'text_select.cur',
    diagonal1:
      'diagonal_resize1.cur',
    diagonal2:
      'diagonal_resize2.cur',
    move: 'move.cur',
    help: 'help.cur'
  };

  var STYLE_ID =
    'custom-cursor-style';

  var BUSY_CLASS =
    'site-busy';

  var CURSOR_OVERRIDE_VAR =
    '--site-cursor-override';

  function cursorValue(
    fileName,
    fallback
  ) {
    return (
      'url("' +
      BASE +
      fileName +
      '"), ' +
      (fallback || 'auto')
    );
  }

  function cursorCssValue(
    key,
    fallback
  ) {
    if (!CURSORS[key]) {
      return '';
    }

    return (
      'var(' +
      CURSOR_OVERRIDE_VAR +
      ', ' +
      cursorValue(
        CURSORS[key],
        fallback
      ) +
      ')'
    );
  }

  function normalizeSelectors(
    selectors
  ) {
    if (!selectors) {
      return [];
    }

    if (Array.isArray(selectors)) {
      return selectors.filter(
        Boolean
      );
    }

    return String(selectors)
      .split(',')
      .map(function (selector) {
        return selector.trim();
      })
      .filter(Boolean);
  }

  function joinSelectors(
    selectors
  ) {
    return normalizeSelectors(
      selectors
    ).join(',\n');
  }

  function withDescendants(
    selectors
  ) {
    var expanded = [];

    normalizeSelectors(
      selectors
    ).forEach(
      function (selector) {
        expanded.push(selector);
        expanded.push(
          selector + ' *'
        );
      }
    );

    return expanded;
  }

  function rule(
    selectors,
    key,
    fallback,
    important
  ) {
    var selectorText =
      joinSelectors(selectors);

    var value =
      cursorCssValue(
        key,
        fallback
      );

    if (
      !selectorText ||
      !value
    ) {
      return '';
    }

    return (
      selectorText +
      ' {\n' +
      '  cursor: ' +
      value +
      (
        important
          ? ' !important'
          : ''
      ) +
      ';\n' +
      '}\n'
    );
  }

  function buildBusyStateCss() {
    if (!CURSORS.busy) {
      return '';
    }

    var busyValue =
      cursorValue(
        CURSORS.busy,
        'wait'
      );

    return [
      'html.' + BUSY_CLASS + ' {',
      '  ' +
        CURSOR_OVERRIDE_VAR +
        ': ' +
        busyValue +
        ';',
      '}',
      '',
      'html.' +
        BUSY_CLASS +
        ',',
      'html.' +
        BUSY_CLASS +
        ' *,',
      'html.' +
        BUSY_CLASS +
        ' *::before,',
      'html.' +
        BUSY_CLASS +
        ' *::after {',
      '  cursor: var(' +
        CURSOR_OVERRIDE_VAR +
        ') !important;',
      '}'
    ].join('\n') + '\n';
  }

  function buildCursorCss() {
    var css = '';

    function add(
      selectors,
      key,
      fallback,
      important
    ) {
      css += rule(
        selectors,
        key,
        fallback,
        important
      );
    }

    function addWithChildren(
      selectors,
      key,
      fallback,
      important
    ) {
      add(
        withDescendants(
          selectors
        ),
        key,
        fallback,
        important
      );
    }

    /* Default document cursor */
    css += rule(
      'html, body',
      'normal',
      'auto',
      false
    );

    /* =====================================================
       Links
       ===================================================== */

    addWithChildren(
      [
        'a[href]',
        'area[href]',
        '[role="link"]'
      ],
      'link_select',
      'pointer',
      true
    );

    /* =====================================================
       Ordinary controls
       ===================================================== */

    addWithChildren(
      [
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
      ],
      'precise_select',
      'pointer',
      true
    );

    /* =====================================================
       Text input
       ===================================================== */

    add(
      [
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
      ],
      'text_select',
      'text',
      true
    );

    /* =====================================================
       Drag and resize
       ===================================================== */

    addWithChildren(
      [
        '[draggable="true"]',
        '.draggable'
      ],
      'move',
      'move',
      true
    );

    addWithChildren(
      '.resize-vertical',
      'vertical_resize',
      'ns-resize',
      true
    );

    addWithChildren(
      '.resize-horizontal',
      'horizontal_resize',
      'ew-resize',
      true
    );

    addWithChildren(
      '.resize-diag1',
      'diagonal1',
      'nwse-resize',
      true
    );

    addWithChildren(
      '.resize-diag2',
      'diagonal2',
      'nesw-resize',
      true
    );

    /* =====================================================
       Help and expander controls
       ===================================================== */

    /*
      General expander rule.

      Every element that uses the site's standard
      .expander class together with data-expand-target
      represents an action for displaying additional
      information.

      This applies consistently to:

      - Profile expanders
      - Profile email expanders
      - Education and award expanders
      - Project detail expanders
      - Archive document expanders
      - Future expanders on other pages

      The selector has greater specificity than the
      ordinary button:not(:disabled) rule, so help.cur
      reliably replaces precise_select.cur.
    */
    addWithChildren(
      [
        '.help',
        '[data-cursor="help"]',
        '.expander[data-expand-target]'
      ],
      'help',
      'help',
      true
    );

    /* =====================================================
       Busy and handwriting
       ===================================================== */

    addWithChildren(
      [
        '.busy',
        '[data-busy]',
        '[aria-busy="true"]'
      ],
      'busy',
      'wait',
      true
    );

    addWithChildren(
      [
        '.handwriting',
        '.scribble-area'
      ],
      'handwriting',
      'crosshair',
      true
    );

    /* =====================================================
       Explicit cursor semantics
       ===================================================== */

    /*
      Explicit data-cursor declarations are authoritative.

      The doubled attribute selectors deliberately provide
      enough specificity to override broad rules such as
      button:not(:disabled).

      Descendant rules ensure that icons and spans inside
      controls use the same cursor as their parent.
    */

    addWithChildren(
      '[data-cursor][data-cursor="normal"]',
      'normal',
      'auto',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="unavailable"]',
      'unavailable',
      'not-allowed',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="vertical_resize"]',
      'vertical_resize',
      'ns-resize',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="background_run"]',
      'background_run',
      'progress',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="candidate"]',
      'candidate',
      'copy',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="precise_select"]',
      'precise_select',
      'pointer',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="link_select"]',
      'link_select',
      'pointer',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="busy"]',
      'busy',
      'wait',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="handwriting"]',
      'handwriting',
      'crosshair',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="horizontal_resize"]',
      'horizontal_resize',
      'ew-resize',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="text_select"]',
      'text_select',
      'text',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="diagonal1"]',
      'diagonal1',
      'nwse-resize',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="diagonal2"]',
      'diagonal2',
      'nesw-resize',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="move"]',
      'move',
      'move',
      true
    );

    addWithChildren(
      '[data-cursor][data-cursor="help"]',
      'help',
      'help',
      true
    );

    /* =====================================================
       Disabled controls
       ===================================================== */

    addWithChildren(
      [
        '[disabled]',
        '[aria-disabled="true"]',
        '.disabled',
        '.is-disabled'
      ],
      'unavailable',
      'not-allowed',
      true
    );

    /*
      Global busy is the highest-priority state.

      All cursor declarations resolve through
      --site-cursor-override, so setting html.site-busy
      changes every cursor to busy.cur.
    */
    css += buildBusyStateCss();

    return css;
  }

  function injectCursorStyle() {
    var existing =
      document.getElementById(
        STYLE_ID
      );

    if (existing) {
      existing.textContent =
        buildCursorCss();

      /*
        Keep the generated cursor stylesheet near the
        end of head so lazy-loaded module styles cannot
        accidentally override cursor semantics.
      */
      if (
        existing.parentNode ===
        document.head
      ) {
        document.head.appendChild(
          existing
        );
      }

      return existing;
    }

    var style =
      document.createElement(
        'style'
      );

    style.id = STYLE_ID;
    style.textContent =
      buildCursorCss();

    document.head.appendChild(
      style
    );

    return style;
  }

  function applyCursorToElement(
    element,
    cursorKey,
    fallback
  ) {
    var value =
      cursorCssValue(
        cursorKey,
        fallback
      );

    if (
      !element ||
      !value
    ) {
      return;
    }

    try {
      element.style.cursor =
        value;
    } catch (error) {
      /*
        Cursor failures must remain non-fatal.
      */
    }
  }

  function setDefaultCursor(
    key,
    fallback
  ) {
    var value =
      cursorCssValue(
        key,
        fallback || 'auto'
      );

    if (!value) {
      return;
    }

    try {
      document.documentElement
        .style.cursor = value;
    } catch (error) {
      /*
        Cursor failures must remain non-fatal.
      */
    }
  }

  function refresh() {
    /*
      Cursor rules are handled by one generated stylesheet
      rather than repeated scanning of the complete DOM.

      Refresh rebuilds the stylesheet and moves it to the
      end of head, ensuring that late-loaded modules use
      the current cursor rules.
    */
    injectCursorStyle();
  }

  function init() {
    injectCursorStyle();

    window.CustomCursorAPI = {
      setDefault:
        setDefaultCursor,

      apply:
        applyCursorToElement,

      refresh:
        refresh
    };
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }
})();