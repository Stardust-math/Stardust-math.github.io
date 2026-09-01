(function () {
  'use strict';

  const READER_SELECTOR = '[data-pdf-reader]';
  const DEFAULT_SPREAD_MODE = 'odd';
  const SPREAD_MODES = new Set([
    'none',
    'odd',
    'even'
  ]);
  const STATE = new WeakMap();

  let activeReader = null;
  let globalHandlersBound = false;

  function isElement(value) {
    return !!(
      value &&
      value.nodeType === 1
    );
  }

  function getState(reader) {
    let state = STATE.get(reader);

    if (!state) {
      state = {
        placeholder: null,
        originalParent: null,
        lastFocusedElement: null,
        closing: false
      };

      STATE.set(reader, state);
    }

    return state;
  }

  function getReader(value) {
    if (!value) return null;

    if (
      isElement(value) &&
      value.matches(READER_SELECTOR)
    ) {
      return value;
    }

    if (
      isElement(value) &&
      typeof value.closest === 'function'
    ) {
      return value.closest(READER_SELECTOR);
    }

    return null;
  }

  function normalizePositiveInteger(value, fallback) {
    const number = Number(value);

    return (
      Number.isFinite(number) &&
      number >= 1
    )
      ? Math.floor(number)
      : fallback;
  }

  function normalizeSpreadMode(value) {
    const mode = String(
      value == null ? '' : value
    )
      .trim()
      .toLowerCase();

    return SPREAD_MODES.has(mode)
      ? mode
      : DEFAULT_SPREAD_MODE;
  }

  function buildViewerUrl(pdfPath, options) {
    const opts = options || {};

    const pdfUrl = new URL(
      String(pdfPath || ''),
      document.baseURI
    );

    const viewerUrl = new URL(
      './assets/vendor/pdfjs/web/viewer.html',
      document.baseURI
    );

    viewerUrl.searchParams.set(
      'file',
      pdfUrl.href
    );

    viewerUrl.searchParams.set(
      'spreadmode',
      normalizeSpreadMode(
        opts.spreadMode
      )
    );

    const hash = new URLSearchParams();

    hash.set(
      'page',
      String(
        normalizePositiveInteger(
          opts.page,
          1
        )
      )
    );

    if (opts.zoom) {
      hash.set(
        'zoom',
        String(opts.zoom)
      );
    }

    if (opts.pageMode) {
      hash.set(
        'pagemode',
        String(opts.pageMode)
      );
    }

    viewerUrl.hash = hash.toString();

    return viewerUrl.href;
  }

  function getFrame(reader) {
    return reader
      ? reader.querySelector(
          '.pdf-reader-frame'
        )
      : null;
  }

  function getTopbar(reader) {
    return reader
      ? reader.querySelector(
          '.pdf-reader-fullscreen-bar'
        )
      : null;
  }

  function getOpenButton(reader) {
    return reader
      ? reader.querySelector(
          '[data-pdf-fullscreen-open]'
        )
      : null;
  }

  function getCloseButton(reader) {
    return reader
      ? reader.querySelector(
          '[data-pdf-fullscreen-close]'
        )
      : null;
  }

  function getViewerUrl(reader) {
    if (!reader) return '';

    const pdfPath =
      reader.getAttribute('data-pdf-src');

    if (!pdfPath) return '';

    return buildViewerUrl(pdfPath, {
      page:
        reader.getAttribute(
          'data-pdf-page'
        ) || 1,
      zoom:
        reader.getAttribute(
          'data-pdf-zoom'
        ) || 'page-width',
      pageMode:
        reader.getAttribute(
          'data-pdf-page-mode'
        ) || 'bookmarks',
      spreadMode:
        reader.getAttribute(
          'data-pdf-spread-mode'
        ) || DEFAULT_SPREAD_MODE
    });
  }

  function configure(reader) {
    if (!reader) return false;

    const pdfPath =
      reader.getAttribute('data-pdf-src');

    if (!pdfPath) return false;

    const directUrl = new URL(
      pdfPath,
      document.baseURI
    ).href;

    const viewerUrl = getViewerUrl(reader);

    reader
      .querySelectorAll(
        '[data-pdf-new-tab]'
      )
      .forEach((link) => {
        link.setAttribute(
          'href',
          viewerUrl
        );
      });

    reader
      .querySelectorAll(
        '[data-pdf-direct-link]'
      )
      .forEach((link) => {
        link.setAttribute(
          'href',
          directUrl
        );
      });

    const frame = getFrame(reader);

    if (frame) {
      frame.dataset.src = viewerUrl;
    }

    return true;
  }

  function load(readerOrChild) {
    const reader = getReader(readerOrChild);

    if (!reader) return false;

    configure(reader);

    const frame = getFrame(reader);

    if (!frame) return false;

    const source =
      frame.dataset.src || '';

    if (
      source &&
      !frame.getAttribute('src')
    ) {
      frame.setAttribute(
        'src',
        source
      );
    }

    const loaded =
      !!frame.getAttribute('src');

    reader.dataset.pdfLoaded =
      loaded ? '1' : '0';

    return loaded;
  }

  function setTopbarVisible(reader, visible) {
    const topbar = getTopbar(reader);

    if (!topbar) return;

    topbar.setAttribute(
      'aria-hidden',
      visible ? 'false' : 'true'
    );
  }

  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  }

  function requestBrowserFullscreen(element) {
    if (!element) {
      return Promise.resolve(false);
    }

    const request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    if (typeof request !== 'function') {
      return Promise.resolve(false);
    }

    try {
      return Promise
        .resolve(request.call(element))
        .then(() => true)
        .catch(() => false);
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  function exitBrowserFullscreen() {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;

    if (
      !getFullscreenElement() ||
      typeof exit !== 'function'
    ) {
      return Promise.resolve(false);
    }

    try {
      return Promise
        .resolve(exit.call(document))
        .then(() => true)
        .catch(() => false);
    } catch (error) {
      return Promise.resolve(false);
    }
  }

  function moveToBody(reader) {
    const state = getState(reader);

    if (state.placeholder) return;

    state.originalParent =
      reader.parentNode;

    state.placeholder =
      document.createComment(
        'pdf-reader-placeholder'
      );

    reader.parentNode.insertBefore(
      state.placeholder,
      reader
    );

    document.body.appendChild(reader);
  }

  function restoreFromBody(reader) {
    const state = getState(reader);

    if (
      state.placeholder &&
      state.placeholder.parentNode
    ) {
      state.placeholder.parentNode
        .replaceChild(
          reader,
          state.placeholder
        );
    } else if (state.originalParent) {
      state.originalParent.appendChild(
        reader
      );
    }

    state.placeholder = null;
    state.originalParent = null;
  }

  function belongsToScope(reader, scope) {
    if (!reader || !scope) return false;
    if (scope === document) return true;
    if (scope.contains(reader)) return true;

    const state = getState(reader);

    return !!(
      state.originalParent &&
      (
        state.originalParent === scope ||
        scope.contains(
          state.originalParent
        )
      )
    );
  }

  function finalizeClose(reader, options) {
    if (!reader) return;

    const opts = options || {};
    const state = getState(reader);

    reader.classList.remove(
      'is-fullscreen',
      'is-css-fullscreen-fallback'
    );

    setTopbarVisible(reader, false);

    document.body.classList.remove(
      'pdf-reader-fullscreen-open'
    );

    restoreFromBody(reader);

    if (activeReader === reader) {
      activeReader = null;
    }

    state.closing = false;

    const focusTarget =
      state.lastFocusedElement;

    if (
      opts.restoreFocus !== false &&
      focusTarget &&
      typeof focusTarget.focus ===
        'function' &&
      document.contains(focusTarget)
    ) {
      window.setTimeout(() => {
        focusTarget.focus({
          preventScroll: true
        });
      }, 0);
    }

    state.lastFocusedElement = null;
  }

  function closeFullscreen(
    readerOrChild,
    options
  ) {
    const reader =
      getReader(readerOrChild) ||
      activeReader;

    if (!reader) {
      return Promise.resolve(false);
    }

    const state = getState(reader);

    if (state.closing) {
      return Promise.resolve(false);
    }

    state.closing = true;

    const fullscreenElement =
      getFullscreenElement();

    if (
      fullscreenElement === reader ||
      (
        fullscreenElement &&
        reader.contains(fullscreenElement)
      )
    ) {
      return exitBrowserFullscreen()
        .then(() => {
          finalizeClose(
            reader,
            options
          );

          return true;
        });
    }

    finalizeClose(reader, options);

    return Promise.resolve(true);
  }

  function openFullscreen(readerOrChild) {
    const reader = getReader(readerOrChild);

    if (
      !reader ||
      reader.classList.contains(
        'is-fullscreen'
      )
    ) {
      return Promise.resolve(false);
    }

    if (
      activeReader &&
      activeReader !== reader
    ) {
      return closeFullscreen(
        activeReader,
        {
          restoreFocus: false
        }
      ).then(() =>
        openFullscreen(reader)
      );
    }

    const state = getState(reader);

    state.lastFocusedElement =
      document.activeElement instanceof
        HTMLElement
        ? document.activeElement
        : null;

    load(reader);
    moveToBody(reader);

    activeReader = reader;

    reader.classList.add(
      'is-fullscreen'
    );

    document.body.classList.add(
      'pdf-reader-fullscreen-open'
    );

    setTopbarVisible(reader, true);

    const closeButton =
      getCloseButton(reader);

    if (
      closeButton &&
      typeof closeButton.focus ===
        'function'
    ) {
      window.setTimeout(() => {
        closeButton.focus({
          preventScroll: true
        });
      }, 0);
    }

    return requestBrowserFullscreen(reader)
      .then((opened) => {
        if (!opened) {
          reader.classList.add(
            'is-css-fullscreen-fallback'
          );
        }

        return opened;
      });
  }

  function handleFullscreenChange() {
    if (getFullscreenElement()) return;

    if (
      activeReader &&
      activeReader.classList.contains(
        'is-fullscreen'
      )
    ) {
      finalizeClose(activeReader);
    }
  }

  function handleKeydown(event) {
    if (
      !event ||
      event.key !== 'Escape' ||
      !activeReader
    ) {
      return;
    }

    event.preventDefault();
    closeFullscreen(activeReader);
  }

  function bindGlobalHandlers() {
    if (globalHandlersBound) return;

    globalHandlersBound = true;

    document.addEventListener(
      'keydown',
      handleKeydown
    );

    [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ].forEach((eventName) => {
      document.addEventListener(
        eventName,
        handleFullscreenChange
      );
    });
  }

  function bindReader(reader) {
    if (
      !reader ||
      reader.dataset.pdfReaderBound ===
        '1'
    ) {
      return;
    }

    reader.dataset.pdfReaderBound = '1';

    const openButton =
      getOpenButton(reader);

    const closeButton =
      getCloseButton(reader);

    if (openButton) {
      openButton.addEventListener(
        'click',
        () => openFullscreen(reader)
      );
    }

    if (closeButton) {
      closeButton.addEventListener(
        'click',
        () => closeFullscreen(reader)
      );
    }

    bindGlobalHandlers();
  }

  function collectReaders(scope) {
    const root = scope || document;
    const readers = [];

    if (
      isElement(root) &&
      root.matches(READER_SELECTOR)
    ) {
      readers.push(root);
    }

    if (
      typeof root.querySelectorAll ===
        'function'
    ) {
      root
        .querySelectorAll(
          READER_SELECTOR
        )
        .forEach((reader) => {
          if (!readers.includes(reader)) {
            readers.push(reader);
          }
        });
    }

    return readers;
  }

  function init(scope, options) {
    const opts = options || {};
    const readers = collectReaders(
      scope || document
    );

    readers.forEach((reader) => {
      configure(reader);
      bindReader(reader);

      const autoload =
        opts.autoload === true ||
        reader.getAttribute(
          'data-pdf-autoload'
        ) === 'true';

      if (autoload) {
        load(reader);
      }
    });

    return readers;
  }

  function closeFullscreenWithin(
    scope,
    options
  ) {
    if (
      activeReader &&
      belongsToScope(
        activeReader,
        scope || document
      )
    ) {
      return closeFullscreen(
        activeReader,
        options
      );
    }

    return Promise.resolve(false);
  }

  window.PdfReader = {
    init,
    load,
    configure,
    buildViewerUrl,
    openFullscreen,
    closeFullscreen,
    closeFullscreenWithin
  };
})();
