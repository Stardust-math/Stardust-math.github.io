(function () {
  'use strict';

  let pageConfigs = {};
  let navigation = {};
  let defaultPage = 'about';

  const ROUTE_TO_PAGE = {};
  const PAGE_TO_ROUTE = {};
  const PAGE_DOM_IDS = {};
  const ROUTE_SEGMENTS = [];

  const resources = window.SiteResources || {};
  const localization = resources.localization || {};
  const siteConfig = resources.site || {};

  const DEFAULT_LANGUAGE =
    String(localization.defaultLanguage || 'en')
      .trim()
      .toLowerCase() === 'zh'
      ? 'zh'
      : 'en';

  const configuredLanguages =
    Array.isArray(localization.languages)
      ? localization.languages
      : [];

  const LANGUAGES = Object.freeze(
    Array.from(
      new Set(
        configuredLanguages
          .map((value) => String(value || '').trim().toLowerCase())
          .filter((value) => value === 'en' || value === 'zh')
          .concat(['en', 'zh'])
      )
    )
  );

  const configuredLocalizedPages =
    Array.isArray(localization.localizedPages)
      ? localization.localizedPages
      : ['about', 'schedule', 'social', 'life'];

  const LOCALIZED_ROUTE_SEGMENTS = Object.freeze(
    Array.from(
      new Set(
        configuredLocalizedPages
          .map((pageKey) => {
            const page = resources.pages && resources.pages[pageKey];
            return page && page.route ? String(page.route) : '';
          })
          .filter(Boolean)
      )
    )
  );

  const DEFAULT_SUBROUTE_BY_ROUTE = Object.freeze(
    configuredLocalizedPages.reduce(
      (defaults, pageKey) => {
        const page =
          resources.pages &&
          resources.pages[pageKey];

        const route =
          page && page.route
            ? String(page.route).trim()
            : '';

        const defaultSubroute =
          page && page.defaultSubroute
            ? String(page.defaultSubroute).trim()
            : '';

        if (route && defaultSubroute) {
          defaults[route] = defaultSubroute;
        }

        return defaults;
      },
      {}
    )
  );

  const HTML_LANGUAGES = Object.assign({
    en: 'en',
    zh: 'zh-CN'
  }, localization.htmlLanguages || {});

  const HREFLANG_LANGUAGES = Object.assign({
    en: 'en',
    zh: 'zh-Hans'
  }, localization.hreflangLanguages || {});

  const CANONICAL_ORIGIN = String(
    siteConfig.canonicalOrigin || window.location.origin
  ).replace(/\/+$/, '');

  const SCROLL_STORAGE_PREFIX = 'stardust-page-scroll:';

  let currentScrollKey = null;
  let isRestoringScroll = false;
  let configured = false;
  let stableSiteRootPath = null;

  function resetMaps() {
    Object.keys(ROUTE_TO_PAGE).forEach((key) => delete ROUTE_TO_PAGE[key]);
    Object.keys(PAGE_TO_ROUTE).forEach((key) => delete PAGE_TO_ROUTE[key]);
    Object.keys(PAGE_DOM_IDS).forEach((key) => delete PAGE_DOM_IDS[key]);
    ROUTE_SEGMENTS.splice(0, ROUTE_SEGMENTS.length);
  }

  function buildRouteMaps() {
    resetMaps();

    Object.keys(pageConfigs).forEach((pageKey) => {
      const cfg = pageConfigs[pageKey] || {};
      const route = cfg.route;
      const domId = cfg.domId;

      if (route) {
        ROUTE_TO_PAGE['/' + route] = pageKey;
        PAGE_TO_ROUTE[pageKey] = route;
        ROUTE_SEGMENTS.push(route);
      }

      if (domId) {
        PAGE_DOM_IDS[pageKey] = domId;
      }
    });
  }

  function parseLanguageSegment(value) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase();

    return LANGUAGES.includes(normalized)
      ? normalized
      : null;
  }

  function normalizeLanguage(value) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase();

    return (
      parseLanguageSegment(normalized) ||
      parseLanguageSegment(normalized.split('-')[0]) ||
      DEFAULT_LANGUAGE
    );
  }

  function normalizePath(pathname) {
    let cleaned = String(pathname || '/');

    try {
      if (/^[a-z][a-z\d+.-]*:/i.test(cleaned)) {
        cleaned = new URL(cleaned).pathname;
      }
    } catch (e) {}

    cleaned = cleaned
      .split('?')[0]
      .split('#')[0]
      .replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/');

    if (!cleaned.startsWith('/')) {
      cleaned = '/' + cleaned;
    }

    cleaned = cleaned
      .replace(/\/index\.html$/i, '')
      .replace(/\/+$/, '');

    return cleaned || '/';
  }

  function withTrailingSlash(pathname) {
    const normalized = normalizePath(pathname);
    return normalized === '/' ? '/' : normalized + '/';
  }

  function resolveSiteRootPath() {
    try {
      const explicitRoot =
        typeof window.__SITE_ROOT__ === 'string'
          ? window.__SITE_ROOT__.trim()
          : '';

      if (explicitRoot) {
        return withTrailingSlash(
          new URL(explicitRoot, window.location.href).pathname
        );
      }

      const base = document.querySelector('base[href]');

      if (base) {
        return withTrailingSlash(
          new URL(base.href, window.location.href).pathname
        );
      }
    } catch (e) {}

    const normalized = normalizePath(window.location.pathname);
    const parts = normalized.split('/').filter(Boolean);
    const knownRoutes = Object.keys(resources.pages || {})
      .map((pageKey) => {
        const page = resources.pages[pageKey];
        return page && page.route ? String(page.route) : '';
      })
      .filter(Boolean);

    const routeIndex = parts.findIndex((part) => knownRoutes.includes(part));

    if (routeIndex < 0) {
      return '/';
    }

    const hasLanguageBeforeRoute =
      routeIndex > 0 &&
      Boolean(parseLanguageSegment(parts[routeIndex - 1]));

    const rootEnd = hasLanguageBeforeRoute
      ? routeIndex - 1
      : routeIndex;

    const rootParts = parts.slice(0, rootEnd);

    return '/' + (rootParts.length ? rootParts.join('/') + '/' : '');
  }

  function getSiteRootPath() {
    if (!stableSiteRootPath) {
      stableSiteRootPath = resolveSiteRootPath();
    }

    return stableSiteRootPath;
  }

  function stripSiteRoot(pathname) {
    const siteRoot = normalizePath(getSiteRootPath());
    const normalized = normalizePath(pathname);

    if (siteRoot === '/') return normalized;
    if (normalized === siteRoot) return '/';

    if (normalized.startsWith(siteRoot + '/')) {
      return normalized.slice(siteRoot.length) || '/';
    }

    return normalized;
  }

  function isLocalizedRouteSegments(segments) {
    return Boolean(
      Array.isArray(segments) &&
      segments.length &&
      LOCALIZED_ROUTE_SEGMENTS.includes(segments[0])
    );
  }

  function parsePath(pathname) {
    const relativePath = stripSiteRoot(
      pathname || window.location.pathname
    );

    const segments = normalizePath(relativePath)
      .split('/')
      .filter(Boolean);

    const prefixLanguage = parseLanguageSegment(segments[0]);
    const prefixedBusinessSegments = prefixLanguage
      ? segments.slice(1)
      : segments.slice();

    const hasLanguagePrefix = Boolean(
      prefixLanguage &&
      isLocalizedRouteSegments(prefixedBusinessSegments)
    );

    const businessSegments = hasLanguagePrefix
      ? prefixedBusinessSegments
      : segments.slice();

    const businessPath = businessSegments.length
      ? '/' + businessSegments.join('/')
      : '/';

    return {
      siteRoot: getSiteRootPath(),
      relativePath,
      hasLanguagePrefix,
      language: hasLanguagePrefix
        ? prefixLanguage
        : DEFAULT_LANGUAGE,
      businessSegments,
      businessPath,
      isLocalizedRoute: isLocalizedRouteSegments(businessSegments),
      isCover: businessSegments.length === 0
    };
  }

  function getBusinessSegments(value) {
    if (Array.isArray(value)) {
      const parts = value
        .map((part) => String(part || '').trim())
        .filter(Boolean);

      const prefixLanguage = parseLanguageSegment(parts[0]);
      const withoutPrefix = prefixLanguage ? parts.slice(1) : parts;

      return prefixLanguage && isLocalizedRouteSegments(withoutPrefix)
        ? withoutPrefix
        : parts;
    }

    const raw = String(value || '').trim();

    if (!raw) return [];

    if (raw.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(raw)) {
      return parsePath(raw).businessSegments;
    }

    return getBusinessSegments(raw.split('/'));
  }

  function getBusinessPath(pathname) {
    return parsePath(
      pathname || window.location.pathname
    ).businessPath;
  }

  function getCurrentLanguage() {
    const parsed = parsePath(window.location.pathname);

    if (parsed.hasLanguagePrefix) {
      return parsed.language;
    }

    if (
      window.SiteLang &&
      typeof window.SiteLang.getLang === 'function'
    ) {
      return normalizeLanguage(window.SiteLang.getLang());
    }

    return normalizeLanguage(
      document.documentElement.getAttribute('lang') ||
      DEFAULT_LANGUAGE
    );
  }

  function joinSitePath(segments) {
    const parts = Array.isArray(segments)
      ? segments.filter(Boolean)
      : [];

    if (!parts.length) return getSiteRootPath();

    return getSiteRootPath() + parts.join('/') + '/';
  }

  function buildLocalizedPath(businessPath, language) {
    const segments = getBusinessSegments(businessPath);

    if (!segments.length) return getSiteRootPath();

    if (!isLocalizedRouteSegments(segments)) {
      return joinSitePath(segments);
    }

    return joinSitePath([
      normalizeLanguage(language),
      ...segments
    ]);
  }

  function getUnlocalizedPath(pathname) {
    const parsed = parsePath(pathname || window.location.pathname);
    return joinSitePath(parsed.businessSegments);
  }

  function normalizeAnalyticsPath(value) {
    let raw = String(
      value ||
      window.location.pathname + window.location.search
    );

    let pathname = raw;
    let suffix = '';

    try {
      if (/^[a-z][a-z\d+.-]*:/i.test(raw)) {
        const url = new URL(raw);
        pathname = url.pathname;
        suffix = url.search + url.hash;
      } else {
        const queryIndex = raw.indexOf('?');
        const hashIndex = raw.indexOf('#');
        const suffixIndexes = [queryIndex, hashIndex]
          .filter((index) => index >= 0);
        const suffixIndex = suffixIndexes.length
          ? Math.min(...suffixIndexes)
          : -1;

        if (suffixIndex >= 0) {
          pathname = raw.slice(0, suffixIndex);
          suffix = raw.slice(suffixIndex);
        }
      }
    } catch (e) {}

    return getUnlocalizedPath(pathname) + suffix;
  }

  function getCanonicalPath(pathname, language) {
    const parsed = parsePath(pathname || window.location.pathname);

    if (parsed.isCover) return '/';

    const segments = parsed.businessSegments.slice();

    if (
      segments.length === 2 &&
      DEFAULT_SUBROUTE_BY_ROUTE[segments[0]] ===
        segments[1]
    ) {
      segments.pop();
    }

    if (parsed.isLocalizedRoute) {
      segments.unshift(normalizeLanguage(language || parsed.language));
    }

    return '/' + segments.join('/') + '/';
  }

  function getCanonicalUrl(pathname, language) {
    const canonicalPath = getCanonicalPath(pathname, language);

    try {
      return new URL(
        canonicalPath.replace(/^\/+/, ''),
        CANONICAL_ORIGIN + '/'
      ).href;
    } catch (e) {
      return CANONICAL_ORIGIN + canonicalPath;
    }
  }

  function ensureCanonicalLink() {
    let link = document.querySelector(
      'link#site-canonical[rel="canonical"]'
    );

    if (link) return link;

    link = document.createElement('link');
    link.id = 'site-canonical';
    link.rel = 'canonical';
    document.head.appendChild(link);

    return link;
  }

  function removeAlternateLinks() {
    document
      .querySelectorAll(
        'link[rel="alternate"][data-site-language]'
      )
      .forEach((link) => link.remove());
  }

  function syncDocumentMetadata(pathname, language) {
    const parsed = parsePath(pathname || window.location.pathname);
    const normalizedLanguage = parsed.isLocalizedRoute
      ? normalizeLanguage(language || parsed.language)
      : getCurrentLanguage();
    const documentLanguage = parsed.isCover
      ? DEFAULT_LANGUAGE
      : normalizedLanguage;

    document.documentElement.setAttribute(
      'lang',
      HTML_LANGUAGES[documentLanguage] || documentLanguage
    );

    ensureCanonicalLink().href = getCanonicalUrl(
      pathname || window.location.pathname,
      normalizedLanguage
    );

    removeAlternateLinks();

    if (!parsed.isLocalizedRoute) {
      return;
    }

    LANGUAGES.forEach((alternateLanguage) => {
      const link = document.createElement('link');

      link.rel = 'alternate';
      link.setAttribute(
        'data-site-language',
        alternateLanguage
      );
      link.hreflang =
        HREFLANG_LANGUAGES[alternateLanguage] ||
        alternateLanguage;
      link.href = getCanonicalUrl(
        pathname || window.location.pathname,
        alternateLanguage
      );

      document.head.appendChild(link);
    });
  }

  function buildHistoryState(pathname) {
    const current = window.history ? window.history.state : null;
    const base = current && typeof current === 'object' && !Array.isArray(current)
      ? current
      : {};

    return Object.assign({}, base, {
      path: pathname
    });
  }

  function setLocationLanguage(language, options) {
    const opts = Object.assign({
      replace: true
    }, options || {});

    const parsed = parsePath(window.location.pathname);
    const normalizedLanguage = normalizeLanguage(language);

    if (!parsed.isLocalizedRoute) {
      return {
        changed: false,
        language: normalizedLanguage,
        pathname: window.location.pathname
      };
    }

    const pathname = buildLocalizedPath(
      parsed.businessSegments,
      normalizedLanguage
    );

    const nextUrl =
      pathname +
      window.location.search +
      window.location.hash;

    const currentUrl =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    if (
      currentUrl === nextUrl ||
      !window.history ||
      typeof window.history.pushState !== 'function'
    ) {
      syncDocumentMetadata(pathname, normalizedLanguage);

      return {
        changed: false,
        language: normalizedLanguage,
        pathname
      };
    }

    const method = opts.replace === false
      ? 'pushState'
      : 'replaceState';

    window.history[method](
      buildHistoryState(pathname),
      '',
      nextUrl
    );

    syncDocumentMetadata(pathname, normalizedLanguage);

    return {
      changed: true,
      language: normalizedLanguage,
      pathname
    };
  }

  function canonicalizeLocation(options) {
    const opts = options || {};
    const parsed = parsePath(window.location.pathname);

    if (!parsed.isLocalizedRoute) {
      return {
        changed: false,
        language: parsed.isCover
          ? DEFAULT_LANGUAGE
          : getCurrentLanguage(),
        pathname: window.location.pathname
      };
    }

    const language = parsed.hasLanguagePrefix
      ? parsed.language
      : normalizeLanguage(opts.defaultLanguage || DEFAULT_LANGUAGE);

    return setLocationLanguage(language, {
      replace: true
    });
  }

  function getPageFromPath(pathname) {
    const relativePath = getBusinessPath(pathname || window.location.pathname);
    const exactPage = ROUTE_TO_PAGE[relativePath];

    if (exactPage) return exactPage;

    const nestedRoute = Object.keys(ROUTE_TO_PAGE)
      .sort((a, b) => b.length - a.length)
      .find((route) => relativePath.startsWith(route + '/'));

    return nestedRoute ? ROUTE_TO_PAGE[nestedRoute] : null;
  }

  function getRouteForPage(page) {
    const segment = PAGE_TO_ROUTE[page];

    if (!segment) return getCoverRoute();

    return buildLocalizedPath(
      segment,
      getCurrentLanguage()
    );
  }

  function getCoverRoute() {
    return getSiteRootPath();
  }

  function hasRouteForPage(page) {
    return Boolean(PAGE_TO_ROUTE[page]);
  }

  function syncHistory(path, replace, options) {
    if (!window.history || typeof window.history.pushState !== 'function') return;

    const opts = Object.assign({
      saveScroll: true,
      setScrollPath: true
    }, options || {});

    const nextPath = path || getCoverRoute();
    let nextPathname = nextPath;

    try {
      nextPathname = new URL(
        nextPath,
        window.location.href
      ).pathname;
    } catch (e) {}

    const currentPath = normalizePath(window.location.pathname);
    const nextNormalizedPath = normalizePath(nextPathname);

    if (currentPath === nextNormalizedPath) {
      syncDocumentMetadata(nextPathname);
      return;
    }

    if (opts.saveScroll !== false) {
      saveCurrentScrollPosition({
        includeLocationPath: false
      });
    }

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method](
      buildHistoryState(nextPathname),
      '',
      nextPath
    );

    if (opts.setScrollPath !== false) {
      setCurrentScrollPath(nextPathname);
    }

    syncDocumentMetadata(nextPathname);
  }

  function getScrollKey(pathname) {
    return SCROLL_STORAGE_PREFIX + normalizePath(pathname || window.location.pathname);
  }

  function setCurrentScrollPath(pathname) {
    currentScrollKey = getScrollKey(pathname || window.location.pathname);
  }

  function readSavedScrollPosition(pathname) {
    try {
      const raw = window.sessionStorage.getItem(getScrollKey(pathname));
      if (!raw) return null;

      const data = JSON.parse(raw);
      const x = Number(data && data.x);
      const y = Number(data && data.y);

      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

      return {
        x: Math.max(0, x),
        y: Math.max(0, y)
      };
    } catch (e) {
      return null;
    }
  }

  function saveCurrentScrollPosition(options) {
    if (isRestoringScroll) return;

    const opts = options || {};

    try {
      const data = JSON.stringify({
        x: window.scrollX || window.pageXOffset || 0,
        y: window.scrollY || window.pageYOffset || 0,
        ts: Date.now()
      });

      const keys = [currentScrollKey];

      if (opts.includeLocationPath !== false) {
        keys.push(getScrollKey(window.location.pathname));
      }

      Array.from(new Set(keys.filter(Boolean))).forEach((key) => {
        window.sessionStorage.setItem(key, data);
      });
    } catch (e) {}
  }

  function restoreSavedScrollPosition(pathname) {
    const pos = readSavedScrollPosition(pathname);
    if (!pos) return false;

    isRestoringScroll = true;

    const restore = () => {
      try {
        window.scrollTo(pos.x, pos.y);
      } catch (e) {}
    };

    restore();

    requestAnimationFrame(() => {
      restore();

      setTimeout(restore, 80);

      setTimeout(() => {
        restore();
        isRestoringScroll = false;
      }, 240);
    });

    return true;
  }

  function scrollTargetIntoView(targetId, behavior) {
    const el = document.getElementById(targetId);
    if (!el) return;

    try {
      el.scrollIntoView({
        behavior: behavior || 'smooth',
        block: 'start'
      });
    } catch (e) {}
  }

  function getPageElement(page) {
    const id = PAGE_DOM_IDS[page];
    return id ? document.getElementById(id) : null;
  }

  function getPageDomId(page) {
    return PAGE_DOM_IDS[page] || '';
  }

  function getPageContext(page, extra) {
    return Object.assign({
      page,
      element: getPageElement(page)
    }, extra || {});
  }

  function hideAllPages() {
    Object.keys(PAGE_DOM_IDS).forEach((page) => {
      const el = getPageElement(page);
      if (el) el.classList.remove('visible');
    });
  }

  function initScrollRestoration() {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch (e) {}
  }

  function bindScrollSaveEvents() {
    if (window.__bootstrapRoutesScrollEventsBound) return;
    window.__bootstrapRoutesScrollEventsBound = true;

    window.addEventListener('pagehide', saveCurrentScrollPosition);
    window.addEventListener('beforeunload', saveCurrentScrollPosition);
  }

  function configure(options) {
    const opts = options || {};

    pageConfigs = opts.pageConfigs || {};
    navigation = opts.navigation || {};
    defaultPage = navigation.defaultPage || opts.defaultPage || 'about';

    buildRouteMaps();

    if (!configured) {
      configured = true;
      initScrollRestoration();
      bindScrollSaveEvents();
    }

    return {
      defaultPage
    };
  }

  function installGoatCounterPathNormalizer() {
    const existing =
      window.goatcounter &&
      typeof window.goatcounter === 'object'
        ? window.goatcounter
        : {};

    if (existing.path == null) {
      existing.path = normalizeAnalyticsPath;
    }

    window.goatcounter = existing;
  }

  installGoatCounterPathNormalizer();

  window.BootstrapRoutes = {
    configure,

    DEFAULT_LANGUAGE,
    LANGUAGES,
    LOCALIZED_ROUTE_SEGMENTS,

    parseLanguageSegment,
    normalizeLanguage,
    normalizePath,
    getSiteRootPath,
    stripSiteRoot,
    parsePath,
    getBusinessPath,
    getCurrentLanguage,
    buildLocalizedPath,
    getUnlocalizedPath,
    normalizeAnalyticsPath,
    getCanonicalPath,
    getCanonicalUrl,
    syncDocumentMetadata,
    setLocationLanguage,
    canonicalizeLocation,

    getPageFromPath,
    getRouteForPage,
    getCoverRoute,
    hasRouteForPage,
    syncHistory,

    getScrollKey,
    setCurrentScrollPath,
    readSavedScrollPosition,
    saveCurrentScrollPosition,
    restoreSavedScrollPosition,
    scrollTargetIntoView,

    getPageElement,
    getPageDomId,
    getPageContext,
    hideAllPages,

    getMaps() {
      return {
        routeToPage: Object.assign({}, ROUTE_TO_PAGE),
        pageToRoute: Object.assign({}, PAGE_TO_ROUTE),
        pageDomIds: Object.assign({}, PAGE_DOM_IDS),
        routeSegments: ROUTE_SEGMENTS.slice()
      };
    }
  };
})();
