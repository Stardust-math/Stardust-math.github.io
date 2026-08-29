(function () {
  'use strict';

  const STORAGE_KEY =
    'content_expanders_open_keys_v1';

  const ANIMATION_MS = 280;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {}

  function qsAll(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(
        selector
      )
    );
  }

  function prefersReducedMotion() {
    try {
      return !!(
        window.matchMedia &&
        window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches
      );
    } catch (error) {
      return false;
    }
  }

  function getOpenDisplay(element) {
    if (!element) return '';

    if (
      element.tagName &&
      element.tagName.toLowerCase() ===
        'tr'
    ) {
      return 'table-row';
    }

    return 'block';
  }

  function setDisplay(element, open) {
    if (!element) return;

    element.style.display = open
      ? getOpenDisplay(element)
      : 'none';
  }

  function clearMotionTimer(row) {
    if (
      !row ||
      !row.dataset.expandTimer
    ) {
      return;
    }

    try {
      clearTimeout(
        Number(row.dataset.expandTimer)
      );
    } catch (error) {}

    delete row.dataset.expandTimer;
  }

  function finishAnimationLater(
    row,
    callback
  ) {
    if (!row) return;

    clearMotionTimer(row);

    const delay = prefersReducedMotion()
      ? 0
      : ANIMATION_MS + 60;

    const timer = window.setTimeout(
      function () {
        clearMotionTimer(row);
        callback();
      },
      delay
    );

    row.dataset.expandTimer =
      String(timer);
  }

  function setInstantRowState(
    row,
    open
  ) {
    if (!row) return;

    clearMotionTimer(row);

    row.classList.remove(
      'is-animating',
      'is-closing'
    );

    row.classList.toggle(
      'is-open',
      open
    );

    row.setAttribute(
      'aria-hidden',
      open ? 'false' : 'true'
    );

    setDisplay(row, open);
  }

  function animateRowOpen(row) {
    if (!row) return;

    clearMotionTimer(row);

    row.classList.remove(
      'is-closing'
    );

    row.classList.add(
      'is-animating'
    );

    row.setAttribute(
      'aria-hidden',
      'false'
    );

    setDisplay(row, true);

    requestAnimationFrame(
      function () {
        row.classList.add(
          'is-open'
        );

        finishAnimationLater(
          row,
          function () {
            row.classList.remove(
              'is-animating',
              'is-closing'
            );
          }
        );
      }
    );
  }

  function animateRowClose(row) {
    if (!row) return;

    clearMotionTimer(row);

    row.classList.add(
      'is-animating',
      'is-closing'
    );

    row.setAttribute(
      'aria-hidden',
      'true'
    );

    requestAnimationFrame(
      function () {
        row.classList.remove(
          'is-open'
        );

        finishAnimationLater(
          row,
          function () {
            row.classList.remove(
              'is-animating',
              'is-closing'
            );

            setDisplay(row, false);
          }
        );
      }
    );
  }

  function getBtnKey(button) {
    if (!button) return null;

    const key =
      button.getAttribute(
        'data-expand-key'
      );

    if (
      key &&
      String(key).trim()
    ) {
      return String(key).trim();
    }

    const target =
      button.getAttribute(
        'data-expand-target'
      );

    if (
      target &&
      String(target).trim()
    ) {
      return String(target).trim();
    }

    return null;
  }

  function saveState(scope) {
    try {
      const root = scope || document;

      const openKeys = qsAll(
        'button.expander' +
        '[aria-expanded="true"]',
        root
      )
        .map(getBtnKey)
        .filter(Boolean);

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(openKeys)
      );
    } catch (error) {}
  }

  function loadState() {
    try {
      const raw =
        sessionStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) return [];

      const values = JSON.parse(raw);

      return Array.isArray(values)
        ? values.map(String)
        : [];
    } catch (error) {
      return [];
    }
  }

  function dispatchChange(
    button,
    row,
    open,
    options
  ) {
    const opts = options || {};

    if (
      opts.emit === false ||
      typeof CustomEvent !== 'function'
    ) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent(
        'site:expanderchange',
        {
          detail: {
            button,
            target: row,
            key: getBtnKey(button),
            expanded: open,
            userInitiated:
              opts.userInitiated === true
          }
        }
      )
    );
  }

  function closeExclusivePeers(
    button,
    options
  ) {
    if (!button) return;

    if (
      button.getAttribute(
        'data-expand-exclusive'
      ) !== 'true'
    ) {
      return;
    }

    const group =
      button.getAttribute(
        'data-expand-group'
      );

    if (!group) return;

    const opts = options || {};
    const root = opts.scope || document;

    qsAll(
      'button.expander' +
      '[data-expand-group]' +
      '[aria-expanded="true"]',
      root
    ).forEach((peer) => {
      if (peer === button) return;

      if (
        peer.getAttribute(
          'data-expand-group'
        ) !== group
      ) {
        return;
      }

      setOpen(
        peer,
        false,
        {
          animate:
            opts.animate === true,
          userInitiated: false,
          skipExclusive: true,
          scope: root
        }
      );
    });
  }

  function setOpen(
    button,
    open,
    options
  ) {
    if (!button) return false;

    const opts = options || {};

    const targetId =
      button.getAttribute(
        'data-expand-target'
      );

    if (!targetId) return false;

    const row =
      document.getElementById(
        targetId
      );

    if (!row) return false;

    const alreadyOpen =
      button.getAttribute(
        'aria-expanded'
      ) === 'true';

    if (
      alreadyOpen === open &&
      opts.force !== true
    ) {
      return false;
    }

    if (
      open &&
      opts.skipExclusive !== true
    ) {
      closeExclusivePeers(
        button,
        opts
      );
    }

    button.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );

    button.classList.toggle(
      'is-open',
      open
    );

    const animate =
      opts.animate === true;

    if (
      !animate ||
      prefersReducedMotion()
    ) {
      setInstantRowState(
        row,
        open
      );
    } else if (open) {
      animateRowOpen(row);
    } else {
      animateRowClose(row);
    }

    dispatchChange(
      button,
      row,
      open,
      opts
    );

    return true;
  }

  function toggle(button) {
    if (!button) return false;

    const isOpen =
      button.getAttribute(
        'aria-expanded'
      ) === 'true';

    const changed = setOpen(
      button,
      !isOpen,
      {
        animate: true,
        userInitiated: true
      }
    );

    if (changed) {
      saveState(document);
    }

    return changed;
  }

  function normalizeRows(scope) {
    const root = scope || document;

    qsAll(
      '.expand-row[id]',
      root
    ).forEach((row) => {
      const isOpen =
        row.classList.contains(
          'is-open'
        ) ||
        row.getAttribute(
          'aria-hidden'
        ) === 'false';

      setInstantRowState(
        row,
        isOpen
      );
    });
  }

  function markExpandLayouts(scope) {
    const root = scope || document;

    qsAll(
      '.expand-content',
      root
    ).forEach((box) => {
      const items =
        box.querySelectorAll(
          '.expand-item'
        );

      const number =
        items ? items.length : 0;

      box.classList.remove(
        'is-single',
        'is-multi'
      );

      if (number === 1) {
        box.classList.add(
          'is-single'
        );
      }

      if (number > 1) {
        box.classList.add(
          'is-multi'
        );
      }
    });
  }

  function getOpenKeys(scope) {
    try {
      const root = scope || document;

      return qsAll(
        'button.expander' +
        '[aria-expanded="true"]',
        root
      )
        .map(getBtnKey)
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function applyOpenKeys(
    keys,
    scope
  ) {
    const root = scope || document;

    const wantedKeys =
      Array.isArray(keys)
        ? keys.map(String)
        : [];

    const wantedSet =
      Object.create(null);

    wantedKeys.forEach((key) => {
      wantedSet[String(key)] = true;
    });

    qsAll(
      'button.expander' +
      '[data-expand-target]',
      root
    ).forEach((button) => {
      const key = getBtnKey(button);

      const shouldOpen = !!(
        key &&
        wantedSet[String(key)]
      );

      setOpen(
        button,
        shouldOpen,
        {
          animate: false,
          emit: false,
          scope: root
        }
      );
    });
  }

  function restoreState(scope) {
    const keys = loadState();

    if (!keys.length) return;

    applyOpenKeys(
      keys,
      scope || document
    );
  }

  function init(root, options) {
    const scope = root || document;
    const opts = options || {};

    normalizeRows(scope);
    markExpandLayouts(scope);

    if (
      Array.isArray(opts.openKeys) &&
      opts.openKeys.length > 0
    ) {
      applyOpenKeys(
        opts.openKeys,
        scope
      );
    } else {
      restoreState(scope);
    }

    if (!opts.skipSave) {
      saveState(scope);
    }
  }

  function setupDelegatedClickOnce() {
    if (
      document.documentElement.dataset
        .expanderDelegation === '1'
    ) {
      return;
    }

    document.documentElement.dataset
      .expanderDelegation = '1';

    document.addEventListener(
      'click',
      function (event) {
        const button =
          event.target &&
          typeof event.target.closest ===
            'function'
            ? event.target.closest(
                'button.expander' +
                '[data-expand-target]'
              )
            : null;

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        toggle(button);
      },
      true
    );
  }

  function setupMeditationsRowClickOnce() {
    if (
      document.documentElement.dataset
        .meditRowClick === '1'
    ) {
      return;
    }

    document.documentElement.dataset
      .meditRowClick = '1';

    document.addEventListener(
      'click',
      function (event) {
        const target = event.target;

        const row =
          target &&
          typeof target.closest ===
            'function'
            ? target.closest(
                '#meditations .medit-row'
              )
            : null;

        if (!row) return;

        if (
          target &&
          typeof target.closest ===
            'function' &&
          target.closest(
            'button.expander'
          )
        ) {
          return;
        }

        if (
          target &&
          typeof target.closest ===
            'function' &&
          target.closest(
            'a, button, input, ' +
            'textarea, select, label'
          )
        ) {
          return;
        }

        const button =
          row.querySelector(
            'button.expander' +
            '[data-expand-target]'
          );

        if (button) {
          toggle(button);
        }
      },
      true
    );
  }

  const api = {
    init,
    getOpenKeys,
    applyOpenKeys,
    saveState,
    setOpen,
    toggle
  };

  window.ContentExpanders = api;

  setupDelegatedClickOnce();
  setupMeditationsRowClickOnce();

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        init(document);
      }
    );
  } else {
    init(document);
  }

  window.addEventListener(
    'site:langchange',
    function (event) {
      const openKeys =
        event &&
        event.detail &&
        Array.isArray(
          event.detail.openKeys
        )
          ? event.detail.openKeys
          : null;

      requestAnimationFrame(
        function () {
          init(
            document,
            openKeys
              ? { openKeys }
              : undefined
          );
        }
      );
    }
  );
})();