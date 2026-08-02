(function () {
  'use strict';

  const DEFAULT_DEBOUNCE_MS = 120;
  const indexByItem = new WeakMap();

  function hasText(value) {
    return (
      typeof value === 'string' &&
      value.trim() !== ''
    );
  }

  function hasValue(value) {
    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    );
  }

  function normalizeUnicode(value) {
    const text = String(value == null ? '' : value);

    if (typeof text.normalize !== 'function') {
      return text;
    }

    try {
      return text.normalize('NFKC');
    } catch (error) {
      return text;
    }
  }

  function normalizeText(value) {
    return normalizeUnicode(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function tokenize(value) {
    const normalized = normalizeText(value);

    return normalized
      ? normalized.split(' ')
      : [];
  }

  function buildIndex(item) {
    const source =
      item && typeof item === 'object'
        ? item
        : {};

    const titles =
      source.titles &&
      typeof source.titles === 'object'
        ? source.titles
        : {};

    const genres = Array.isArray(source.genres)
      ? source.genres
      : [];

    return normalizeText([
      titles.original,
      titles.zh,
      titles.en,
      source.studio,
      source.year,
      ...genres
    ].filter(hasValue).join(' '));
  }

  function getIndex(item) {
    if (
      !item ||
      typeof item !== 'object'
    ) {
      return '';
    }

    if (!indexByItem.has(item)) {
      indexByItem.set(
        item,
        buildIndex(item)
      );
    }

    return indexByItem.get(item) || '';
  }

  function prepareItems(items) {
    if (!Array.isArray(items)) {
      return;
    }

    items.forEach(function (item) {
      getIndex(item);
    });
  }

  function filterItems(items, query) {
    const source = Array.isArray(items)
      ? items
      : [];
    const tokens = tokenize(query);

    if (!tokens.length) {
      return source.slice();
    }

    return source.filter(function (item) {
      const index = getIndex(item);

      return tokens.every(function (token) {
        return index.includes(token);
      });
    });
  }

  function createElement(tagName, className) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    return element;
  }

  function parseMaxHeight(input) {
    const value = window.getComputedStyle(input).maxHeight;
    const number = Number.parseFloat(value);

    return Number.isFinite(number)
      ? number
      : Infinity;
  }

  function createController(options) {
    const settings =
      options && typeof options === 'object'
        ? options
        : {};
    const mount = settings.mount;

    if (
      !mount ||
      mount.nodeType !== 1
    ) {
      return null;
    }

    const label = String(
      settings.label ||
      'Search anime'
    );
    const placeholder = String(
      settings.placeholder ||
      label
    );
    const clearLabel = String(
      settings.clearLabel ||
      'Clear search'
    );
    const debounceMs = Math.max(
      0,
      Number(settings.debounceMs) ||
      DEFAULT_DEBOUNCE_MS
    );
    const onChange =
      typeof settings.onChange === 'function'
        ? settings.onChange
        : function () {};
    const formatResult =
      typeof settings.formatResult === 'function'
        ? settings.formatResult
        : function (count) {
            return String(count);
          };

    let query = String(
      settings.initialQuery ||
      ''
    );
    let timer = 0;
    let resizeObserver = null;
    let lastObservedWidth = null;
    let destroyed = false;

    const wrapper = createElement(
      'div',
      'anime-search'
    );
    const field = createElement(
      'div',
      'anime-search-field'
    );
    const icon = createElement(
      'span',
      'anime-search-icon'
    );
    const iconGlyph = createElement(
      'i',
      'fas fa-magnifying-glass'
    );
    const input = createElement(
      'textarea',
      'anime-search-input'
    );
    const clearButton = createElement(
      'button',
      'anime-search-clear'
    );
    const clearGlyph = createElement(
      'i',
      'fas fa-xmark'
    );
    const result = createElement(
      'div',
      'anime-search-result'
    );

    icon.setAttribute('aria-hidden', 'true');
    icon.appendChild(iconGlyph);

    input.rows = 1;
    input.value = query;
    input.placeholder = placeholder;
    input.setAttribute('aria-label', label);
    input.setAttribute('role', 'searchbox');
    input.setAttribute('inputmode', 'search');
    input.setAttribute('enterkeyhint', 'search');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('spellcheck', 'false');

    clearButton.type = 'button';
    clearButton.setAttribute('aria-label', clearLabel);
    clearButton.title = clearLabel;
    clearButton.appendChild(clearGlyph);

    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');
    result.setAttribute('aria-atomic', 'true');

    field.appendChild(icon);
    field.appendChild(input);
    field.appendChild(clearButton);
    wrapper.appendChild(field);
    wrapper.appendChild(result);

    mount.textContent = '';
    mount.appendChild(wrapper);

    function focusInput() {
      try {
        input.focus({ preventScroll: true });
      } catch (error) {
        input.focus();
      }
    }

    function updateActiveState() {
      const active = hasText(query);

      wrapper.classList.toggle(
        'is-active',
        active
      );
      clearButton.hidden = !active;
    }

    function autoGrow() {
      if (destroyed) {
        return;
      }

      input.style.height = 'auto';

      const maxHeight = parseMaxHeight(input);
      const nextHeight = Math.min(
        input.scrollHeight,
        maxHeight
      );

      input.style.height =
        Math.max(nextHeight, 0) +
        'px';
      input.style.overflowY =
        input.scrollHeight >
        maxHeight + 1
          ? 'auto'
          : 'hidden';
    }

    function clearTimer() {
      if (!timer) {
        return;
      }

      window.clearTimeout(timer);
      timer = 0;
    }

    function notify(immediate) {
      clearTimer();

      if (immediate || debounceMs === 0) {
        onChange(query);
        return;
      }

      timer = window.setTimeout(function () {
        timer = 0;
        onChange(query);
      }, debounceMs);
    }

    function setQuery(value, optionsValue) {
      const setOptions =
        optionsValue &&
        typeof optionsValue === 'object'
          ? optionsValue
          : {};

      query = String(value == null ? '' : value);
      input.value = query;

      updateActiveState();
      autoGrow();

      if (setOptions.notify) {
        notify(Boolean(setOptions.immediate));
      }

      if (setOptions.focus) {
        focusInput();
        input.setSelectionRange(
          input.value.length,
          input.value.length
        );
      }
    }

    function clear(optionsValue) {
      const clearOptions =
        optionsValue &&
        typeof optionsValue === 'object'
          ? optionsValue
          : {};

      if (!query && !input.value) {
        if (clearOptions.focus) {
          focusInput();
        }
        return;
      }

      setQuery('', {
        notify: true,
        immediate: true,
        focus: Boolean(clearOptions.focus)
      });
    }

    function flush() {
      if (!timer) {
        return;
      }

      clearTimer();
      onChange(query);
    }

    function setResult(count) {
      const numericCount = Math.max(
        0,
        Number(count) || 0
      );
      const active = hasText(query);

      result.hidden = !active;
      result.textContent = active
        ? String(formatResult(numericCount))
        : '';
    }

    function handleInput() {
      query = input.value;
      updateActiveState();
      autoGrow();
      notify(false);
    }

    function handleKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        flush();
        input.blur();
        return;
      }

      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();

      if (hasText(query)) {
        clear({ focus: true });
      } else {
        input.blur();
      }
    }

    function handleClearClick(event) {
      event.preventDefault();
      event.stopPropagation();
      clear({ focus: true });
    }

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeydown);
    clearButton.addEventListener(
      'click',
      handleClearClick
    );

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(
        function (entries) {
          const entry = entries[0];
          const width = entry
            ? Math.round(
                entry.contentRect.width
              )
            : null;

          if (
            width == null ||
            width === lastObservedWidth
          ) {
            return;
          }

          lastObservedWidth = width;
          autoGrow();
        }
      );

      resizeObserver.observe(mount);
    }

    updateActiveState();
    autoGrow();

    return {
      clear,

      destroy() {
        if (destroyed) {
          return;
        }

        destroyed = true;
        clearTimer();

        input.removeEventListener(
          'input',
          handleInput
        );
        input.removeEventListener(
          'keydown',
          handleKeydown
        );
        clearButton.removeEventListener(
          'click',
          handleClearClick
        );

        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
      },

      focus() {
        focusInput();
      },

      getQuery() {
        return query;
      },

      setQuery,
      setResult
    };
  }

  window.SocialAnimeSearch = {
    createController,
    filterItems,
    normalizeText,
    prepareItems,
    tokenize
  };
})();
