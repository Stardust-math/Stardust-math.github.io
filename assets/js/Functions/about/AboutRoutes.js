(function () {
  'use strict';

  const PAGE_KEY = 'about';
  const DEFAULT_VIEW = 'profile';

  const VIEW_TO_SLUG = Object.freeze({
    profile: 'profile',
    archive: 'archive'
  });

  const SLUG_TO_VIEW = Object.freeze({
    profile: 'profile',
    archive: 'archive'
  });

  function normalizeView(view) {
    const key = String(
      view || ''
    )
      .trim()
      .toLowerCase();

    return SLUG_TO_VIEW[key] || null;
  }

  function getSiteRootPath() {
    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes
        .getSiteRootPath === 'function'
    ) {
      return window.BootstrapRoutes
        .getSiteRootPath();
    }

    const base = new URL(
      './',
      document.baseURI
    );

    return base.pathname.endsWith('/')
      ? base.pathname
      : base.pathname + '/';
  }

  function getRoute(view) {
    const normalized =
      normalizeView(view) ||
      DEFAULT_VIEW;

    const slug =
      VIEW_TO_SLUG[normalized] ||
      VIEW_TO_SLUG[DEFAULT_VIEW];

    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        'about/' + slug,
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    const root = getSiteRootPath();

    return (
      root +
      'about/' +
      slug +
      '/'
    ).replace(/\/{2,}/g, '/');
  }

  function normalizePath(pathname) {
    return (
      String(pathname || '/')
        .replace(/index\.html$/, '')
        .replace(/\/+$/, '') ||
      '/'
    );
  }

  function isAboutPath(pathname) {
    const path =
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.getBusinessPath === 'function'
        ? window.BootstrapRoutes.getBusinessPath(
            pathname || window.location.pathname
          )
        : pathname || window.location.pathname;

    const parts = normalizePath(path)
      .split('/')
      .filter(Boolean);

    return parts.includes('about');
  }

  function resolveViewFromPath(pathname) {
    const path =
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.getBusinessPath === 'function'
        ? window.BootstrapRoutes.getBusinessPath(
            pathname || window.location.pathname
          )
        : pathname || window.location.pathname;

    const parts = normalizePath(path)
      .split('/')
      .filter(Boolean);

    const aboutIndex =
      parts.indexOf('about');

    if (aboutIndex < 0) {
      return null;
    }

    return (
      normalizeView(
        parts[aboutIndex + 1]
      ) ||
      DEFAULT_VIEW
    );
  }

  function enhanceSubnav() {
    document
      .querySelectorAll(
        '.about-switcher ' +
        '.about-switch-btn[data-view]'
      )
      .forEach((control) => {
        const view =
          normalizeView(
            control.dataset.view
          );

        if (!view) return;

        control.setAttribute(
          'href',
          getRoute(view)
        );

        control.setAttribute(
          'role',
          'tab'
        );
      });
  }

  function enterProfile() {
    if (
      window.ProfileRender &&
      typeof window.ProfileRender.enter ===
        'function'
    ) {
      window.ProfileRender.enter();
    }
  }

  function enterArchive() {
    if (
      window.ArchiveRender &&
      typeof window.ArchiveRender.enter ===
        'function'
    ) {
      window.ArchiveRender.enter();
    }
  }

  function leaveArchive() {
    if (
      window.ArchiveRender &&
      typeof window.ArchiveRender.leave ===
        'function'
    ) {
      window.ArchiveRender.leave();
    }
  }

  function activateView(view, options) {
    const opts = options || {};

    const normalized =
      normalizeView(view) ||
      DEFAULT_VIEW;

    let previousView = null;

    if (
      window.About &&
      typeof window.About
        .getCurrentView === 'function'
    ) {
      previousView =
        window.About.getCurrentView();
    }

    if (
      opts.updateHistory === true &&
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.syncHistory ===
        'function'
    ) {
      window.BootstrapRoutes.syncHistory(
        getRoute(normalized),
        opts.replaceHistory === true
      );
    }

    if (
      previousView === 'archive' &&
      normalized !== 'archive'
    ) {
      leaveArchive();
    }

    if (
      window.About &&
      typeof window.About.init ===
        'function'
    ) {
      window.About.init();
    }

    if (
      window.About &&
      typeof window.About.setView ===
        'function'
    ) {
      window.About.setView(
        normalized
      );
    }

    enhanceSubnav();

    if (normalized === 'profile') {
      enterProfile();
    }

    if (normalized === 'archive') {
      enterArchive();
    }

    if (opts.scroll === true) {
      const root =
        document.getElementById(
          'about'
        );

      if (root) {
        root.scrollIntoView({
          behavior:
            opts.scrollBehavior ||
            'smooth',
          block: 'start'
        });
      }
    }

    return normalized;
  }

  function enterFromLocation() {
    const view =
      resolveViewFromPath(
        window.location.pathname
      ) ||
      DEFAULT_VIEW;

    return activateView(
      view,
      {
        updateHistory: false,
        scroll: false
      }
    );
  }

  function isPlainLeftClick(event) {
    return !!(
      event &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.defaultPrevented
    );
  }

  function handleClick(event) {
    const control =
      event.target &&
      typeof event.target.closest ===
        'function'
        ? event.target.closest(
            '.about-switcher ' +
            '.about-switch-btn' +
            '[data-view]'
          )
        : null;

    if (
      !control ||
      !isPlainLeftClick(event)
    ) {
      return;
    }

    const view =
      normalizeView(
        control.dataset.view
      );

    if (!view) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    activateView(
      view,
      {
        updateHistory: true,
        scroll: false
      }
    );
  }

  function handleKeydown(event) {
    const control =
      event.target &&
      typeof event.target.closest ===
        'function'
        ? event.target.closest(
            '.about-switcher ' +
            '.about-switch-btn' +
            '[data-view]'
          )
        : null;

    if (!control) return;

    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    const buttons = Array.from(
      document.querySelectorAll(
        '.about-switcher ' +
        '.about-switch-btn' +
        '[data-view]'
      )
    );

    if (!buttons.length) return;

    const currentIndex =
      buttons.indexOf(control);

    if (currentIndex < 0) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    let nextIndex = currentIndex;

    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (
      event.key === 'End'
    ) {
      nextIndex =
        buttons.length - 1;
    } else {
      const direction =
        event.key === 'ArrowRight'
          ? 1
          : -1;

      nextIndex =
        (
          currentIndex +
          direction +
          buttons.length
        ) %
        buttons.length;
    }

    const next = buttons[nextIndex];

    const view =
      normalizeView(
        next.dataset.view
      );

    if (!view) return;

    next.focus();

    activateView(
      view,
      {
        updateHistory: true,
        scroll: false
      }
    );
  }

  function initPage() {
    if (
      window.About &&
      typeof window.About.init ===
        'function'
    ) {
      window.About.init();
    }

    if (
      window.ProfileContact &&
      typeof window.ProfileContact
        .init === 'function'
    ) {
      window.ProfileContact.init();
    }

    enhanceSubnav();
  }

  document.addEventListener(
    'click',
    handleClick,
    true
  );

  document.addEventListener(
    'keydown',
    handleKeydown,
    true
  );

  window.addEventListener(
    'popstate',
    function () {
      window.setTimeout(
        function () {
          if (
            isAboutPath(
              window.location.pathname
            )
          ) {
            enterFromLocation();
          }
        },
        0
      );
    }
  );

  window.addEventListener(
    'site:langchange',
    function (event) {
      if (
        event &&
        event.detail &&
        event.detail.scheduleExportOnly === true
      ) {
        return;
      }

      enhanceSubnav();
    }
  );

  if (
    window.SitePages &&
    typeof window.SitePages.register ===
      'function'
  ) {
    window.SitePages.register(
      PAGE_KEY,
      {
        init() {
          initPage();
        },

        enter() {
          enterFromLocation();
        },

        refresh() {
          initPage();
          enterFromLocation();
        }
      }
    );
  }

  window.AboutRoutes = {
    normalizeView,
    resolveViewFromPath,
    getRoute,
    enhanceSubnav,
    activateView,
    enterFromLocation
  };
})();
