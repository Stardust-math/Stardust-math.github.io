(function () {
  'use strict';

  const APP_ID = 'social-anime-app';
  const SECTION_ID = 'social-anime-section';
  const SUMMARY_SELECTOR = '[data-anime-summary]';
  const SUMMARY_PARAGRAPH_CLASS =
    'anime-card-summary-paragraph';
  const SUMMARY_ELLIPSIS = '…';
  const SUMMARY_OVERFLOW_TOLERANCE = 1;

  const state = {
    data: null,
    dataPromise: null,
    itemById: new Map(),
    filter: null,
    searchQuery: '',
    searchController: null,
    searchMatchedItems: [],
    filteredItems: [],
    statusCounts: {
      all: 0,
      watching: 0,
      planned: 0,
      completed: 0
    },
    visibleCount: 0,
    observer: null,
    summaryObserver: null,
    summaryResizeObserver: null,
    summaryObservedWidth: null,
    summaryLayoutFrame: 0,
    pendingSummaries: new Set(),
    bound: false,
    summaryWatchersBound: false
  };

  function getConfig() {
    return window.SocialAnimeConfig || {};
  }

  function getApp() {
    return document.getElementById(APP_ID);
  }

  function getSection() {
    return document.getElementById(SECTION_ID);
  }

  function getSearchApi() {
    return window.SocialAnimeSearch || null;
  }

  function isSectionActive() {
    const section = getSection();

    return Boolean(
      section &&
      !section.hidden &&
      section.classList.contains('active')
    );
  }

  function getLang() {
    if (
      window.SiteLang &&
      typeof window.SiteLang.getLang === 'function'
    ) {
      return window.SiteLang.getLang() === 'zh'
        ? 'zh'
        : 'en';
    }

    const bodyLang =
      document.body && document.body.dataset
        ? document.body.dataset.lang
        : '';

    return /^zh/i.test(bodyLang)
      ? 'zh'
      : 'en';
  }

  function getDict() {
    return getLang() === 'zh'
      ? (window.SOCIAL_ZH_I18N || {})
      : (window.SOCIAL_EN_I18N || {});
  }

  function text(key, fallback) {
    const dict = getDict();

    return Object.prototype.hasOwnProperty.call(dict, key)
      ? dict[key]
      : fallback;
  }

  function formatText(template, values) {
    const replacements =
      values && typeof values === 'object'
        ? values
        : {};

    return String(template || '').replace(
      /\{([a-zA-Z0-9_]+)\}/g,
      function (match, key) {
        return Object.prototype.hasOwnProperty.call(
          replacements,
          key
        )
          ? String(replacements[key])
          : match;
      }
    );
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(
      /[&<>"']/g,
      function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      }
    );
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function hasText(value) {
    return (
      typeof value === 'string' &&
      value.trim() !== ''
    );
  }

  function finiteNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  }

  function normalizeStatus(value) {
    const status = String(value || '')
      .trim()
      .toLowerCase();

    return [
      'watching',
      'planned',
      'completed'
    ].includes(status)
      ? status
      : '';
  }

  function normalizeSummaryParagraphs(value) {
    return String(value == null ? '' : value)
      .replace(/\r\n?/g, '\n')
      .split(/\n+/)
      .map(function (paragraph) {
        return paragraph.trim();
      })
      .filter(hasText);
  }

  function normalizeItem(raw) {
    const item =
      raw && typeof raw === 'object'
        ? raw
        : {};

    const titles =
      item.titles && typeof item.titles === 'object'
        ? item.titles
        : {};

    const cover =
      item.cover && typeof item.cover === 'object'
        ? item.cover
        : {};

    const links =
      item.links && typeof item.links === 'object'
        ? item.links
        : {};

    const progress =
      item.progress && typeof item.progress === 'object'
        ? item.progress
        : {};

    const ratings =
      item.ratings && typeof item.ratings === 'object'
        ? item.ratings
        : {};

    const notes =
      item.notes && typeof item.notes === 'object'
        ? item.notes
        : {};

    const dates =
      item.dates && typeof item.dates === 'object'
        ? item.dates
        : {};

    const summary = String(item.summary || '');

    return {
      id: String(item.id || ''),

      subjectId: finiteNumber(item.subjectId),

      slug: String(item.slug || item.id || ''),

      status: normalizeStatus(item.status),

      titles: {
        original: String(titles.original || ''),
        zh: String(titles.zh || ''),
        en: String(titles.en || '')
      },

      summary,
      summaryParagraphs: normalizeSummaryParagraphs(summary),

      cover: {
        remote: String(cover.remote || ''),
        fallback: String(cover.fallback || '')
      },

      links: {
        watch: String(links.watch || ''),
        bangumi: String(links.bangumi || '')
      },

      progress: {
        current: finiteNumber(progress.current),
        total: finiteNumber(progress.total)
      },

      year:
        item.year == null
          ? ''
          : String(item.year),

      studio: String(item.studio || ''),

      genres: Array.isArray(item.genres)
        ? item.genres
            .map(String)
            .filter(hasText)
        : [],

      ratings: {
        bangumi: finiteNumber(ratings.bangumi),
        personal: finiteNumber(ratings.personal)
      },

      notes: {
        zh: String(notes.zh || ''),
        en: String(notes.en || '')
      },

      dates: {
        air: String(dates.air || '')
      },

      updatedAt: String(item.updatedAt || '')
    };
  }

  function normalizeData(raw) {
    const source =
      raw && typeof raw === 'object'
        ? raw
        : {};

    const items = Array.isArray(source.items)
      ? source.items
          .map(normalizeItem)
          .filter(function (item) {
            return (
              hasText(item.id) &&
              hasText(item.slug) &&
              hasText(item.status) &&
              hasText(item.links.bangumi)
            );
          })
      : [];

    return {
      schemaVersion: source.schemaVersion || 1,
      generatedAt: String(source.generatedAt || ''),
      items
    };
  }

  function indexItems(items) {
    state.itemById = new Map();

    items.forEach(function (item) {
      state.itemById.set(item.id, item);
    });
  }

  function setBusy(busy) {
    const app = getApp();

    if (!app) {
      return;
    }

    app.setAttribute(
      'aria-busy',
      busy ? 'true' : 'false'
    );
  }

  function renderLoading() {
    const app = getApp();

    if (!app) {
      return;
    }

    destroySearchController();
    clearPendingSummaryLayouts();
    setBusy(true);

    app.innerHTML = `
      <div class="anime-state anime-state-loading">
        <span
          class="anime-state-spinner"
          aria-hidden="true"
        ></span>

        <span>
          ${escapeHtml(
            text(
              'anime_loading',
              'Loading anime data...'
            )
          )}
        </span>
      </div>
    `;
  }

  function renderError(error) {
    const app = getApp();

    if (!app) {
      return;
    }

    destroySearchController();
    clearPendingSummaryLayouts();
    setBusy(false);

    app.innerHTML = `
      <div
        class="anime-state anime-state-error"
        role="alert"
      >
        <i
          class="fas fa-circle-exclamation"
          aria-hidden="true"
        ></i>

        <span>
          ${escapeHtml(
            text(
              'anime_load_failed',
              'Anime data could not be loaded.'
            )
          )}
        </span>
      </div>
    `;

    if (
      window.console &&
      typeof window.console.error === 'function'
    ) {
      window.console.error(
        '[SocialAnime] Failed to load anime data.',
        error
      );
    }
  }

  function prepareSearchItems() {
    const searchApi = getSearchApi();

    if (
      !state.data ||
      !searchApi ||
      typeof searchApi.prepareItems !==
      'function'
    ) {
      return;
    }

    searchApi.prepareItems(state.data.items);
  }

  function ensureSearchAssets() {
    if (getSearchApi()) {
      prepareSearchItems();
      return Promise.resolve(true);
    }

    const loader = window.SiteResourceLoader;

    if (
      !loader ||
      typeof loader.warmPageExtras !==
      'function'
    ) {
      return Promise.resolve(false);
    }

    return loader.warmPageExtras(
      'social',
      'anime-search-entry'
    ).then(function () {
      prepareSearchItems();
      return Boolean(getSearchApi());
    });
  }

  function loadData() {
    if (state.data) {
      return Promise.resolve(state.data);
    }

    if (state.dataPromise) {
      return state.dataPromise;
    }

    const config = getConfig();
    const dataUrl =
      config.dataUrl ||
      './assets/data/social/anime/anime-index.json';

    state.dataPromise = fetch(dataUrl, {
      credentials: 'same-origin',
      cache: 'no-cache'
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            'HTTP ' +
            response.status +
            ' while loading ' +
            dataUrl
          );
        }

        return response.json();
      })
      .then(function (raw) {
        state.data = normalizeData(raw);
        indexItems(state.data.items);

        prepareSearchItems();

        return state.data;
      })
      .catch(function (error) {
        state.dataPromise = null;
        throw error;
      });

    return state.dataPromise;
  }

  function allowedFilters() {
    const config = getConfig();

    return Array.isArray(config.filters)
      ? config.filters.filter(function (filter) {
          return [
            'all',
            'watching',
            'planned',
            'completed'
          ].includes(filter);
        })
      : [
          'all',
          'watching',
          'planned',
          'completed'
        ];
  }

  function queryFilter() {
    try {
      const params = new URLSearchParams(
        window.location.search
      );
      const status = params.get('status');

      return allowedFilters().includes(status)
        ? status
        : '';
    } catch (error) {
      return '';
    }
  }

  function readStoredFilter() {
    const config = getConfig();
    const filters = allowedFilters();
    const fromQuery = queryFilter();

    if (fromQuery) {
      return fromQuery;
    }

    try {
      const stored = window.sessionStorage.getItem(
        config.storageKey ||
        'stardust-social-anime-filter'
      );

      if (filters.includes(stored)) {
        return stored;
      }
    } catch (error) {
      // sessionStorage is optional.
    }

    return filters.includes(config.defaultFilter)
      ? config.defaultFilter
      : 'all';
  }

  function storeFilter(filter) {
    const config = getConfig();

    try {
      window.sessionStorage.setItem(
        config.storageKey ||
        'stardust-social-anime-filter',
        filter
      );
    } catch (error) {
      // sessionStorage is optional.
    }
  }

  function updateFilterQuery(filter) {
    if (
      !window.history ||
      typeof window.history.replaceState !== 'function'
    ) {
      return;
    }

    try {
      const url = new URL(window.location.href);

      if (filter === 'all') {
        url.searchParams.delete('status');
      } else {
        url.searchParams.set('status', filter);
      }

      window.history.replaceState(
        window.history.state,
        '',
        url.pathname + url.search + url.hash
      );
    } catch (error) {
      // Query synchronization is optional.
    }
  }

  function statusLabel(status) {
    return {
      watching: text(
        'anime_status_watching',
        'Watching'
      ),
      planned: text(
        'anime_status_planned',
        'Planned'
      ),
      completed: text(
        'anime_status_completed',
        'Completed'
      )
    }[status] || status;
  }

  function filterLabel(filter) {
    return {
      all: text(
        'anime_filter_all',
        'All'
      ),
      watching: text(
        'anime_filter_watching',
        'Watching'
      ),
      planned: text(
        'anime_filter_planned',
        'Queue'
      ),
      completed: text(
        'anime_filter_completed',
        'Finished'
      )
    }[filter] || filter;
  }

  function displayTitle(item) {
    return (
      item.titles.original ||
      (
        getLang() === 'zh'
          ? item.titles.zh
          : item.titles.en
      ) ||
      item.titles.zh ||
      item.titles.en ||
      item.id
    );
  }

  function secondaryTitle(item) {
    const primary = displayTitle(item);
    const candidates =
      getLang() === 'zh'
        ? [item.titles.zh, item.titles.en]
        : [item.titles.en, item.titles.zh];

    return candidates.find(function (candidate) {
      return (
        hasText(candidate) &&
        candidate !== primary
      );
    }) || '';
  }

  function personalNote(item) {
    if (getLang() === 'zh') {
      return (
        item.notes.zh ||
        item.notes.en ||
        ''
      );
    }

    return (
      item.notes.en ||
      item.notes.zh ||
      ''
    );
  }

  function validAnimeItems() {
    const items = state.data
      ? state.data.items
      : [];

    return items.filter(function (item) {
      return [
        'watching',
        'planned',
        'completed'
      ].includes(item.status);
    });
  }

  function rebuildResultState() {
    const items = validAnimeItems();
    const searchApi = getSearchApi();

    state.searchMatchedItems =
      searchApi &&
      typeof searchApi.filterItems === 'function'
        ? searchApi.filterItems(
            items,
            state.searchQuery
          )
        : items.slice();

    state.statusCounts = {
      all: state.searchMatchedItems.length,
      watching: 0,
      planned: 0,
      completed: 0
    };

    state.searchMatchedItems.forEach(function (item) {
      if (
        Object.prototype.hasOwnProperty.call(
          state.statusCounts,
          item.status
        )
      ) {
        state.statusCounts[item.status] += 1;
      }
    });

    const filter = state.filter || 'all';

    state.filteredItems = filter === 'all'
      ? state.searchMatchedItems.slice()
      : state.searchMatchedItems.filter(
          function (item) {
            return item.status === filter;
          }
        );
  }

  function getFilteredItems() {
    return state.filteredItems;
  }

  function countByStatus(status) {
    return Number(
      state.statusCounts[status]
    ) || 0;
  }

  function searchResultText(count) {
    if (count === 0) {
      return text(
        'anime_search_result_empty',
        'No matches'
      );
    }

    if (
      getLang() === 'en' &&
      count === 1
    ) {
      return text(
        'anime_search_result_one',
        '1 match'
      );
    }

    return formatText(
      text(
        'anime_search_result_many',
        '{count} matches'
      ),
      { count }
    );
  }

  function displaySearchQuery() {
    const query = String(
      state.searchQuery || ''
    )
      .trim()
      .replace(/\s+/g, ' ');

    if (query.length <= 80) {
      return query;
    }

    return query.slice(0, 79) + '…';
  }

  function filterButton(filter) {
    const active = filter === state.filter;

    return `
      <button
        class="anime-filter-item${active ? ' active' : ''}"
        type="button"
        data-anime-filter="${escapeAttr(filter)}"
        aria-pressed="${active ? 'true' : 'false'}"
      >
        <span
          class="anime-filter-marker"
          aria-hidden="true"
        ></span>

        <span class="anime-filter-label">
          ${escapeHtml(filterLabel(filter))}
        </span>

        <span class="anime-filter-count">
          ${countByStatus(filter)}
        </span>
      </button>
    `;
  }

  function mobileFilterOptions() {
    return allowedFilters().map(function (filter) {
      return `
        <option
          value="${escapeAttr(filter)}"
          ${filter === state.filter ? 'selected' : ''}
        >
          ${escapeHtml(filterLabel(filter))}
          (${countByStatus(filter)})
        </option>
      `;
    }).join('');
  }

  function destroySearchController() {
    if (!state.searchController) {
      return;
    }

    if (
      typeof state.searchController.destroy ===
      'function'
    ) {
      state.searchController.destroy();
    }

    state.searchController = null;
  }

  function mountSearchController() {
    const mount = document.getElementById(
      'anime-search-root'
    );
    const searchApi = getSearchApi();

    destroySearchController();

    if (!mount) {
      return;
    }

    if (
      !searchApi ||
      typeof searchApi.createController !==
      'function'
    ) {
      mount.hidden = true;
      return;
    }

    mount.hidden = false;

    state.searchController =
      searchApi.createController({
        mount,
        initialQuery: state.searchQuery,
        label: text(
          'anime_search_label',
          'Search anime'
        ),
        placeholder: text(
          'anime_search_placeholder',
          'Search anime...'
        ),
        clearLabel: text(
          'anime_search_clear',
          'Clear search'
        ),
        debounceMs: 120,
        formatResult: searchResultText,
        onChange(query) {
          if (query === state.searchQuery) {
            return;
          }

          state.searchQuery = query;
          refreshResults();
        }
      });
  }

  function syncFilterControls() {
    const app = getApp();

    if (!app) {
      return;
    }

    app.querySelectorAll(
      '[data-anime-filter]'
    ).forEach(function (button) {
      const filter =
        button.dataset.animeFilter ||
        'all';
      const active = filter === state.filter;
      const label = button.querySelector(
        '.anime-filter-label'
      );
      const count = button.querySelector(
        '.anime-filter-count'
      );

      button.classList.toggle(
        'active',
        active
      );
      button.setAttribute(
        'aria-pressed',
        active ? 'true' : 'false'
      );

      if (label) {
        label.textContent =
          filterLabel(filter);
      }

      if (count) {
        count.textContent = String(
          countByStatus(filter)
        );
      }
    });

    const mobileFilter = document.getElementById(
      'anime-mobile-filter'
    );

    if (mobileFilter) {
      mobileFilter.innerHTML =
        mobileFilterOptions();
      mobileFilter.value = state.filter || 'all';
    }

    if (
      state.searchController &&
      typeof state.searchController.setResult ===
      'function'
    ) {
      state.searchController.setResult(
        countByStatus('all')
      );
    }
  }

  function syncInterfaceLanguage() {
    const app = getApp();

    if (!app) {
      return;
    }

    const filterLabelText = text(
      'anime_filter_label',
      'Status'
    );
    const mobileLabel = app.querySelector(
      '.anime-mobile-filter-label'
    );
    const sidebar = app.querySelector(
      '.anime-filter-sidebar'
    );

    if (mobileLabel) {
      mobileLabel.textContent =
        filterLabelText;
    }

    if (sidebar) {
      sidebar.setAttribute(
        'aria-label',
        filterLabelText
      );
    }

    if (
      state.searchController &&
      typeof state.searchController.updateText ===
      'function'
    ) {
      state.searchController.updateText({
        label: text(
          'anime_search_label',
          'Search anime'
        ),
        placeholder: text(
          'anime_search_placeholder',
          'Search anime...'
        ),
        clearLabel: text(
          'anime_search_clear',
          'Clear search'
        ),
        formatResult: searchResultText
      });
    }

    syncFilterControls();
  }

  function resetCardResults() {
    const app = getApp();
    const list = document.getElementById(
      'anime-card-list'
    );
    const sentinel = document.getElementById(
      'anime-list-sentinel'
    );

    if (!list) {
      return;
    }

    state.visibleCount = 0;

    clearPendingSummaryLayouts();
    disconnectObserver();
    disconnectSummaryObserver();

    list.textContent = '';

    if (sentinel) {
      sentinel.hidden = false;
    }

    syncFilterControls();
    appendNextBatch();
    observeSentinel();
    refreshCursor(app);
  }

  function refreshResults() {
    rebuildResultState();
    resetCardResults();
  }

  function renderListShell() {
    const app = getApp();

    if (!app) {
      return;
    }

    const filters = allowedFilters();

    destroySearchController();
    clearPendingSummaryLayouts();
    disconnectObserver();
    disconnectSummaryObserver();
    rebuildResultState();

    app.innerHTML = `
      <div class="anime-mobile-filter-wrap">
        <label
          class="anime-mobile-filter-label"
          for="anime-mobile-filter"
        >
          ${escapeHtml(
            text(
              'anime_filter_label',
              'Status'
            )
          )}
        </label>

        <select
          id="anime-mobile-filter"
          class="anime-mobile-filter"
        >
          ${mobileFilterOptions()}
        </select>
      </div>

      <div class="anime-list-layout">
        <aside
          class="anime-filter-sidebar"
          aria-label="${escapeAttr(
            text(
              'anime_filter_label',
              'Status'
            )
          )}"
        >
          <div
            id="anime-search-root"
            class="anime-search-root"
          ></div>

          <div class="anime-filter-panel">
            ${filters.map(filterButton).join('')}
          </div>
        </aside>

        <div class="anime-list-column">
          <div
            id="anime-card-list"
            class="anime-card-list"
          ></div>

          <div
            id="anime-list-sentinel"
            class="anime-list-sentinel"
            aria-hidden="true"
          ></div>
        </div>
      </div>
    `;

    mountSearchController();
    setBusy(false);
    observeSummaryContainer();
    resetCardResults();
  }

  function metadataRow(label, value, modifierClass) {
    if (
      !hasText(
        String(value == null ? '' : value)
      )
    ) {
      return '';
    }

    const modifier = hasText(modifierClass)
      ? ' ' + escapeAttr(modifierClass)
      : '';

    return `
      <div class="anime-meta-row${modifier}">
        <span class="anime-meta-label">
          ${escapeHtml(label)}
        </span>

        <span class="anime-meta-value">
          ${escapeHtml(value)}
        </span>
      </div>
    `;
  }

  function cardProgress(item) {
    const current = item.progress.current;
    const total = item.progress.total;

    if (
      item.status !== 'watching' ||
      current == null ||
      current < 0
    ) {
      return '';
    }

    const hasTotal =
      total != null &&
      total > 0;

    const percent = hasTotal
      ? Math.max(
          0,
          Math.min(
            100,
            current / total * 100
          )
        )
      : 0;

    const value = hasTotal
      ? current + ' / ' + total
      : String(current);

    return `
      <div class="anime-cover-progress">
        ${hasTotal ? `
          <div
            class="anime-progress-track"
            aria-hidden="true"
          >
            <span
              class="anime-progress-value"
              style="width:${percent.toFixed(2)}%"
            ></span>
          </div>
        ` : ''}

        <span class="anime-progress-text">
          ${escapeHtml(value)}
        </span>
      </div>
    `;
  }

  function ratingBadge(item) {
    const value =
      item.ratings.personal != null
        ? item.ratings.personal
        : item.ratings.bangumi;

    if (
      value == null ||
      value <= 0
    ) {
      return '';
    }

    return `
      <span
        class="anime-rating-badge"
        title="${escapeAttr(
          text(
            'anime_rating',
            'Rating'
          )
        )}"
      >
        <i
          class="fas fa-star"
          aria-hidden="true"
        ></i>

        <span>
          ${escapeHtml(value.toFixed(1))}
        </span>
      </span>
    `;
  }

  function genreTags(item) {
    if (!item.genres.length) {
      return '';
    }

    return `
      <div class="anime-genre-list">
        ${item.genres.map(function (genre) {
          return `
            <span class="anime-genre-tag">
              ${escapeHtml(genre)}
            </span>
          `;
        }).join('')}
      </div>
    `;
  }

  function watchButton(item, title) {
    if (!hasText(item.links.watch)) {
      return '';
    }

    return `
      <a
        class="anime-watch-button"
        href="${escapeAttr(item.links.watch)}"
        target="_blank"
        rel="noopener noreferrer"
        title="${escapeAttr(
          text(
            'anime_watch',
            'Watch'
          )
        )}"
        aria-label="${escapeAttr(
          text(
            'anime_watch',
            'Watch'
          ) +
          ': ' +
          title
        )}"
      >
        <i
          class="fas fa-play"
          aria-hidden="true"
        ></i>
      </a>
    `;
  }

  function cardFooter(item, title) {
    const tags = genreTags(item);
    const action = watchButton(item, title);

    if (!tags && !action) {
      return '';
    }

    return `
      <div class="anime-card-footer">
        ${tags}
        ${action}
      </div>
    `;
  }

  function summaryHtml(item) {
    if (!item.summaryParagraphs.length) {
      return '';
    }

    return `
      <div
        class="anime-card-summary"
        data-anime-summary
      >
        ${item.summaryParagraphs.map(function (paragraph) {
          return `
            <p class="${SUMMARY_PARAGRAPH_CLASS}">${escapeHtml(paragraph)}</p>
          `;
        }).join('')}
      </div>
    `;
  }

  function cardHtml(item) {
    const title = displayTitle(item);
    const secondary = secondaryTitle(item);
    const note = personalNote(item);

    const episodeValue =
      item.progress.total != null &&
      item.progress.total > 0
        ? String(item.progress.total)
        : '';

    const metadata = [
      metadataRow(
        text(
          'anime_year',
          'Year'
        ),
        item.year
      ),
      metadataRow(
        text(
          'anime_episodes',
          'Episodes'
        ),
        episodeValue
      ),
      metadataRow(
        text(
          'anime_studio',
          'Studio'
        ),
        item.studio,
        'anime-meta-row-studio'
      )
    ].filter(Boolean).join('');

    const remoteCover =
      item.cover.remote ||
      item.cover.fallback ||
      getConfig().placeholderCover ||
      '';

    const bangumiUrl = item.links.bangumi;

    return `
      <article
        class="anime-card"
        data-anime-id="${escapeAttr(item.id)}"
        data-anime-bangumi-url="${escapeAttr(bangumiUrl)}"
        role="link"
        tabindex="0"
        aria-label="${escapeAttr(
          text(
            'anime_open_bangumi',
            'Open on Bangumi'
          ) +
          ': ' +
          title
        )}"
      >
        <div class="anime-card-cover-wrap">
          <a
            class="anime-bangumi-link anime-cover-link"
            href="${escapeAttr(bangumiUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${escapeAttr(
              text(
                'anime_open_bangumi',
                'Open on Bangumi'
              ) +
              ': ' +
              title
            )}"
          >
            <img
              class="anime-cover-image"
              src="${escapeAttr(remoteCover)}"
              data-anime-cover
              data-fallback-src="${escapeAttr(item.cover.fallback)}"
              alt="${escapeAttr(title)}"
              loading="lazy"
              decoding="async"
            >

            <span
              class="anime-cover-overlay"
              aria-hidden="true"
            >
              <span class="anime-cover-open-icon">
                <i class="fas fa-compass"></i>
              </span>
            </span>
          </a>

          <span
            class="anime-status-badge anime-status-${escapeAttr(item.status)}"
          >
            ${escapeHtml(statusLabel(item.status))}
          </span>

          ${ratingBadge(item)}
          ${cardProgress(item)}
        </div>

        <div class="anime-card-content">
          <div class="anime-card-heading-row">
            <div class="anime-card-titles">
              <h3 class="anime-card-title">
                <a
                  class="anime-bangumi-link"
                  href="${escapeAttr(bangumiUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${escapeHtml(title)}
                </a>
              </h3>

              ${secondary ? `
                <div class="anime-card-secondary-title">
                  ${escapeHtml(secondary)}
                </div>
              ` : ''}
            </div>
          </div>

          ${summaryHtml(item)}

          ${metadata ? `
            <div class="anime-card-meta">
              ${metadata}
            </div>
          ` : ''}

          ${cardFooter(item, title)}

          ${hasText(note) ? `
            <div class="anime-card-note">
              <span class="anime-card-note-label">
                ${escapeHtml(
                  text(
                    'anime_personal_note',
                    'Personal note'
                  )
                )}
              </span>

              <p>${escapeHtml(note)}</p>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  function emptyStateHtml() {
    const query = displaySearchQuery();
    const hasQuery = hasText(query);
    const message = hasQuery
      ? formatText(
          text(
            'anime_search_empty',
            'No anime in this status matched “{query}”.'
          ),
          { query }
        )
      : text(
          'anime_empty',
          'No anime entries in this category.'
        );

    return `
      <div class="anime-state anime-state-empty">
        <div class="anime-search-empty-content">
          <i
            class="fas fa-folder-open"
            aria-hidden="true"
          ></i>

          <span>
            ${escapeHtml(message)}
          </span>

          ${hasQuery ? `
            <button
              class="anime-search-empty-clear"
              type="button"
              data-anime-clear-search
            >
              ${escapeHtml(
                text(
                  'anime_search_empty_clear',
                  'Clear search'
                )
              )}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderEmptyState(list) {
    list.innerHTML = emptyStateHtml();
    hideSentinel();
    refreshCursor(list);
  }

  function appendNextBatch() {
    const list = document.getElementById(
      'anime-card-list'
    );

    if (!list) {
      return;
    }

    const items = getFilteredItems();
    const batchSize = Math.max(
      1,
      Number(getConfig().batchSize) || 8
    );

    if (items.length === 0) {
      renderEmptyState(list);
      return;
    }

    const start = state.visibleCount;
    const end = Math.min(
      items.length,
      start + batchSize
    );
    const slice = items.slice(start, end);

    if (!slice.length) {
      hideSentinel();
      return;
    }

    const previousLastCard = list.lastElementChild;

    list.insertAdjacentHTML(
      'beforeend',
      slice.map(cardHtml).join('')
    );

    state.visibleCount = end;

    const newCards = collectInsertedCards(
      list,
      previousLastCard
    );

    bindCoverFallbacks(list);
    watchSummaryCards(newCards);
    refreshCursor(list);

    if (state.visibleCount >= items.length) {
      hideSentinel();
    }
  }

  function rerenderVisibleCards() {
    const app = getApp();
    const list = document.getElementById(
      'anime-card-list'
    );
    const sentinel = document.getElementById(
      'anime-list-sentinel'
    );

    if (!list) {
      renderListShell();
      return;
    }

    const items = getFilteredItems();
    const batchSize = Math.max(
      1,
      Number(getConfig().batchSize) || 8
    );
    const targetCount = items.length
      ? Math.min(
          items.length,
          Math.max(
            state.visibleCount,
            Math.min(batchSize, items.length)
          )
        )
      : 0;

    clearPendingSummaryLayouts();
    disconnectObserver();
    disconnectSummaryObserver();

    list.textContent = '';
    state.visibleCount = 0;

    if (sentinel) {
      sentinel.hidden = false;
    }

    if (!items.length) {
      renderEmptyState(list);
      refreshCursor(app);
      return;
    }

    list.insertAdjacentHTML(
      'beforeend',
      items
        .slice(0, targetCount)
        .map(cardHtml)
        .join('')
    );

    state.visibleCount = targetCount;

    const cards = Array.from(
      list.querySelectorAll('.anime-card')
    );

    bindCoverFallbacks(list);
    watchSummaryCards(cards);
    refreshCursor(list);

    if (state.visibleCount >= items.length) {
      hideSentinel();
    } else {
      observeSentinel();
    }
  }

  function collectInsertedCards(list, previousLastCard) {
    const cards = [];
    let node = previousLastCard
      ? previousLastCard.nextElementSibling
      : list.firstElementChild;

    while (node) {
      if (node.classList.contains('anime-card')) {
        cards.push(node);
      }

      node = node.nextElementSibling;
    }

    return cards;
  }

  function hideSentinel() {
    const sentinel = document.getElementById(
      'anime-list-sentinel'
    );

    if (sentinel) {
      sentinel.hidden = true;
    }

    disconnectObserver();
  }

  function observeSentinel() {
    const sentinel = document.getElementById(
      'anime-list-sentinel'
    );

    if (
      !sentinel ||
      sentinel.hidden
    ) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      while (
        state.visibleCount <
        getFilteredItems().length
      ) {
        appendNextBatch();
      }

      return;
    }

    disconnectObserver();

    state.observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            appendNextBatch();
          }
        });
      },
      {
        rootMargin: '280px 0px'
      }
    );

    state.observer.observe(sentinel);
  }

  function disconnectObserver() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
  }

  function bindCoverFallbacks(scope) {
    const root = scope || document;
    const placeholder =
      getConfig().placeholderCover || '';

    root.querySelectorAll(
      'img[data-anime-cover]'
    ).forEach(function (image) {
      if (
        image.dataset.animeFallbackBound === 'true'
      ) {
        return;
      }

      image.dataset.animeFallbackBound = 'true';
      image.dataset.animeFallbackStage = 'remote';

      image.addEventListener('error', function () {
        const stage =
          image.dataset.animeFallbackStage ||
          'remote';
        const fallback =
          image.dataset.fallbackSrc ||
          '';

        if (
          stage === 'remote' &&
          fallback &&
          image.src !== new URL(
            fallback,
            document.baseURI
          ).href
        ) {
          image.dataset.animeFallbackStage = 'local';
          image.src = fallback;
          return;
        }

        if (
          stage !== 'placeholder' &&
          placeholder
        ) {
          image.dataset.animeFallbackStage =
            'placeholder';
          image.src = placeholder;
          return;
        }

        image.dataset.animeFallbackStage = 'done';
      });
    });
  }

  function createSummaryParagraph(textContent) {
    const paragraph = document.createElement('p');

    paragraph.className = SUMMARY_PARAGRAPH_CLASS;
    paragraph.textContent = textContent;

    return paragraph;
  }

  function renderSummaryContent(
    summary,
    paragraphCharacters,
    characterLimit,
    appendEllipsis
  ) {
    const fragment = document.createDocumentFragment();
    let remaining = Math.max(0, characterLimit);
    let lastParagraph = null;

    for (
      let index = 0;
      index < paragraphCharacters.length;
      index += 1
    ) {
      if (remaining <= 0) {
        break;
      }

      const characters = paragraphCharacters[index];
      const take = Math.min(
        remaining,
        characters.length
      );

      if (take <= 0) {
        continue;
      }

      lastParagraph = createSummaryParagraph(
        characters.slice(0, take).join('')
      );
      fragment.appendChild(lastParagraph);
      remaining -= take;
    }

    if (appendEllipsis) {
      if (!lastParagraph) {
        lastParagraph = createSummaryParagraph(
          SUMMARY_ELLIPSIS
        );
        fragment.appendChild(lastParagraph);
      } else {
        lastParagraph.textContent =
          lastParagraph.textContent
            .replace(/\s+$/u, '') +
          SUMMARY_ELLIPSIS;
      }
    }

    summary.textContent = '';
    summary.appendChild(fragment);
  }

  function summaryFits(summary) {
    return (
      summary.scrollHeight <=
      summary.clientHeight +
      SUMMARY_OVERFLOW_TOLERANCE
    );
  }

  function fitSummary(summary) {
    if (
      !summary ||
      !summary.isConnected ||
      summary.clientWidth <= 0 ||
      summary.clientHeight <= 0
    ) {
      return false;
    }

    const card = summary.closest(
      '.anime-card[data-anime-id]'
    );
    const item = card
      ? state.itemById.get(card.dataset.animeId)
      : null;

    if (
      !item ||
      !item.summaryParagraphs.length
    ) {
      return true;
    }

    const paragraphCharacters =
      item.summaryParagraphs.map(function (paragraph) {
        return Array.from(paragraph);
      });

    const totalCharacters =
      paragraphCharacters.reduce(
        function (sum, characters) {
          return sum + characters.length;
        },
        0
      );

    renderSummaryContent(
      summary,
      paragraphCharacters,
      totalCharacters,
      false
    );

    if (summaryFits(summary)) {
      summary.classList.remove('is-truncated');
      return true;
    }

    let low = 0;
    let high = totalCharacters;
    let best = 0;

    while (low <= high) {
      const middle = Math.floor(
        (low + high) / 2
      );

      renderSummaryContent(
        summary,
        paragraphCharacters,
        middle,
        true
      );

      if (summaryFits(summary)) {
        best = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    renderSummaryContent(
      summary,
      paragraphCharacters,
      best,
      true
    );
    summary.classList.add('is-truncated');

    return true;
  }

  function collectSummaries(scope) {
    if (!scope) {
      return [];
    }

    const summaries = [];

    if (
      scope.nodeType === 1 &&
      scope.matches(SUMMARY_SELECTOR)
    ) {
      summaries.push(scope);
    }

    if (typeof scope.querySelectorAll === 'function') {
      scope.querySelectorAll(
        SUMMARY_SELECTOR
      ).forEach(function (summary) {
        summaries.push(summary);
      });
    }

    return summaries;
  }

  function scheduleSummaryLayout(scope) {
    collectSummaries(scope).forEach(function (summary) {
      state.pendingSummaries.add(summary);
    });

    if (
      state.summaryLayoutFrame ||
      !state.pendingSummaries.size
    ) {
      return;
    }

    state.summaryLayoutFrame = window.requestAnimationFrame(
      flushSummaryLayouts
    );
  }

  function refreshSummaryCardLayouts() {
    const app = getApp();

    if (!app) {
      return;
    }

    watchSummaryCards(
      Array.from(
        app.querySelectorAll('.anime-card')
      )
    );
  }

  function flushSummaryLayouts() {
    state.summaryLayoutFrame = 0;

    if (!isSectionActive()) {
      state.pendingSummaries.clear();
      return;
    }

    const pending = Array.from(
      state.pendingSummaries
    );
    state.pendingSummaries.clear();

    pending.forEach(function (summary) {
      if (!fitSummary(summary)) {
        const card = summary.closest('.anime-card');

        if (
          card &&
          state.summaryObserver
        ) {
          state.summaryObserver.observe(card);
        }
      }
    });
  }

  function clearPendingSummaryLayouts() {
    state.pendingSummaries.clear();

    if (state.summaryLayoutFrame) {
      window.cancelAnimationFrame(
        state.summaryLayoutFrame
      );
      state.summaryLayoutFrame = 0;
    }
  }

  function ensureSummaryObserver() {
    if (
      state.summaryObserver ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    state.summaryObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          state.summaryObserver.unobserve(entry.target);
          scheduleSummaryLayout(entry.target);
        });
      },
      {
        rootMargin: '320px 0px'
      }
    );
  }

  function watchSummaryCards(cards) {
    if (!cards.length) {
      return;
    }

    ensureSummaryObserver();

    if (!state.summaryObserver) {
      cards.forEach(scheduleSummaryLayout);
      return;
    }

    cards.forEach(function (card) {
      state.summaryObserver.observe(card);
    });
  }

  function disconnectSummaryObserver() {
    if (state.summaryObserver) {
      state.summaryObserver.disconnect();
      state.summaryObserver = null;
    }
  }

  function observeSummaryContainer() {
    const app = getApp();

    if (
      !app ||
      !state.summaryResizeObserver
    ) {
      return;
    }

    state.summaryObservedWidth = null;
    state.summaryResizeObserver.disconnect();
    state.summaryResizeObserver.observe(app);
  }

  function bindSummaryLayoutWatchers() {
    if (state.summaryWatchersBound) {
      return;
    }

    if ('ResizeObserver' in window) {
      state.summaryResizeObserver = new ResizeObserver(
        function (entries) {
          const entry = entries[0];
          const width = entry
            ? Math.round(entry.contentRect.width)
            : null;

          if (
            width == null ||
            width === state.summaryObservedWidth
          ) {
            return;
          }

          state.summaryObservedWidth = width;
          refreshSummaryCardLayouts();
        }
      );
    } else {
      let previousWidth = window.innerWidth;

      window.addEventListener(
        'resize',
        function () {
          const width = window.innerWidth;

          if (width === previousWidth) {
            return;
          }

          previousWidth = width;
          refreshSummaryCardLayouts();
        },
        { passive: true }
      );
    }

    if (
      document.fonts &&
      document.fonts.ready &&
      typeof document.fonts.ready.then === 'function'
    ) {
      document.fonts.ready.then(function () {
        refreshSummaryCardLayouts();
      });
    }

    state.summaryWatchersBound = true;
  }

  function setFilter(filter) {
    const filters = allowedFilters();

    if (
      !filters.includes(filter) ||
      state.filter === filter
    ) {
      return;
    }

    state.filter = filter;
    storeFilter(filter);
    updateFilterQuery(filter);
    refreshResults();
  }

  function openBangumi(url) {
    if (!hasText(url)) {
      return;
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function handleClick(event) {
    const app = getApp();

    if (
      !app ||
      !app.contains(event.target)
    ) {
      return;
    }

    const clearSearchButton = event.target.closest(
      '[data-anime-clear-search]'
    );

    if (clearSearchButton) {
      event.preventDefault();

      if (
        state.searchController &&
        typeof state.searchController.clear ===
        'function'
      ) {
        state.searchController.clear({
          focus: true
        });
      }

      return;
    }

    const filterButtonElement = event.target.closest(
      '[data-anime-filter]'
    );

    if (filterButtonElement) {
      event.preventDefault();
      setFilter(
        filterButtonElement.dataset.animeFilter ||
        'all'
      );
      return;
    }

    if (
      event.target.closest('.anime-watch-button') ||
      event.target.closest('.anime-bangumi-link')
    ) {
      return;
    }

    const card = event.target.closest(
      '.anime-card[data-anime-bangumi-url]'
    );

    if (!card) {
      return;
    }

    openBangumi(card.dataset.animeBangumiUrl);
  }

  function handleKeydown(event) {
    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    const card = event.target.closest(
      '.anime-card[data-anime-bangumi-url]'
    );

    if (
      !card ||
      event.target.closest('a, button, select')
    ) {
      return;
    }

    event.preventDefault();
    openBangumi(card.dataset.animeBangumiUrl);
  }

  function handleChange(event) {
    const target = event.target;

    if (
      !target ||
      target.id !== 'anime-mobile-filter'
    ) {
      return;
    }

    setFilter(target.value || 'all');
  }

  function bindEvents() {
    if (state.bound) {
      return;
    }

    const section = getSection();

    if (!section) {
      return;
    }

    section.addEventListener('click', handleClick);
    section.addEventListener('keydown', handleKeydown);
    section.addEventListener('change', handleChange);

    bindSummaryLayoutWatchers();
    state.bound = true;
  }

  function refreshCursor(scope) {
    const root = scope || getSection();

    if (!root) {
      return;
    }

    root.querySelectorAll([
      '.anime-filter-item',
      '.anime-filter-item *',
      '.anime-card',
      '.anime-card *',
      '.anime-bangumi-link',
      '.anime-bangumi-link *',
      '.anime-watch-button',
      '.anime-watch-button *',
      '.anime-search-clear',
      '.anime-search-clear *',
      '.anime-search-empty-clear',
      '.anime-search-empty-clear *'
    ].join(', ')).forEach(function (element) {
      if (!element.dataset) {
        return;
      }

      element.dataset.cursor =
        element.dataset.cursor ||
        'precise_select';

      element.dataset.cursorFallback =
        element.dataset.cursorFallback ||
        'pointer';
    });

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function renderList() {
    if (!state.filter) {
      state.filter = readStoredFilter();
    }

    renderListShell();
  }

  function enter() {
    if (!isSectionActive()) {
      return Promise.resolve(false);
    }

    bindEvents();

    if (!state.data) {
      renderLoading();
    }

    return Promise.all([
      loadData(),
      ensureSearchAssets()
    ])
      .then(function () {
        renderList();
        return true;
      })
      .catch(function (error) {
        renderError(error);
        return false;
      });
  }

  function refreshLanguage() {
    if (!state.data || !isSectionActive()) {
      return;
    }

    const list = document.getElementById(
      'anime-card-list'
    );

    if (!list) {
      renderList();
      return;
    }

    syncInterfaceLanguage();
    rerenderVisibleCards();
  }

  window.SocialAnime = {
    enter,
    renderList,
    refreshLanguage,
    loadData
  };

  window.addEventListener(
    'site:langchange',
    refreshLanguage
  );
})();
