(function () {
  'use strict';

  const DEFAULT_VIEW = 'activities_moments';

  const VIEW_TO_SLUG = {
    activities_moments: 'activities_moments',
    meditations: 'meditations'
  };

  const SLUG_TO_VIEW = {
    activities_moments: 'activities_moments',
    activities: 'activities_moments',
    moments: 'activities_moments',
    meditations: 'meditations'
  };

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();
    return SLUG_TO_VIEW[key] || (VIEW_TO_SLUG[key] ? key : null);
  }

  function getLifeBaseUrl() {
    return new URL('life/', document.baseURI);
  }

  function getRoute(view, dateKey) {
    const normalized = normalizeView(view) || DEFAULT_VIEW;
    const slug = VIEW_TO_SLUG[normalized] || VIEW_TO_SLUG[DEFAULT_VIEW];

    const logicalPath = normalized === 'activities_moments' && dateKey
      ? 'life/' + slug + '/' + encodeURIComponent(dateKey)
      : 'life/' + slug;

    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        logicalPath,
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    if (normalized === 'activities_moments' && dateKey) {
      return new URL(slug + '/' + encodeURIComponent(dateKey) + '/', getLifeBaseUrl()).pathname;
    }

    return new URL(slug + '/', getLifeBaseUrl()).pathname;
  }

  function normalizePath(pathname) {
    return String(pathname || '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '') || '/';
  }

  function isLifePath(pathname) {
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

    return parts.includes('life');
  }

  function getLifePathParts(pathname) {
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

    const lifeIndex = parts.indexOf('life');

    return {
      parts,
      lifeIndex,
      slug: lifeIndex >= 0 ? parts[lifeIndex + 1] : '',
      detail: lifeIndex >= 0 ? parts[lifeIndex + 2] : ''
    };
  }

  function resolveViewFromPath(pathname) {
    const info = getLifePathParts(pathname);
    return normalizeView(info.slug);
  }

  function resolveDetailFromPath(pathname) {
    const info = getLifePathParts(pathname);
    const view = normalizeView(info.slug);

    if (view !== 'activities_moments') return null;
    if (!info.detail) return null;

    try {
      return decodeURIComponent(info.detail);
    } catch (e) {
      return info.detail;
    }
  }

  function toRouteLink(control) {
    const view = normalizeView(control && control.dataset ? control.dataset.view : '');
    if (!control || !view) return control;

    const href = getRoute(view);

    if (control.tagName && control.tagName.toLowerCase() === 'a') {
      control.setAttribute('href', href);
      control.setAttribute('role', 'tab');
      return control;
    }

    const link = document.createElement('a');

    Array.from(control.attributes).forEach((attr) => {
      if (attr.name === 'type') return;
      link.setAttribute(attr.name, attr.value);
    });

    link.className = control.className;
    link.dataset.view = view;
    link.href = href;
    link.setAttribute('role', 'tab');
    link.innerHTML = control.innerHTML;

    control.replaceWith(link);
    return link;
  }

  function enhanceLifeSubnav() {
    document.querySelectorAll('.life-switcher .life-switch-btn').forEach((control) => {
      const link = toRouteLink(control);
      const view = normalizeView(link && link.dataset ? link.dataset.view : '');

      if (link && view) {
        link.setAttribute('href', getRoute(view));
      }
    });
  }

  function getLifeSetter() {
    if (window.Life && typeof window.Life.setLifeView === 'function') {
      return window.Life.setLifeView.bind(window.Life);
    }

    return null;
  }

  function activateActivities(dateKey, options) {
    const opts = options || {};

    if (!window.ActivitiesMoments) return;

    if (dateKey && typeof window.ActivitiesMoments.showDetail === 'function') {
      window.ActivitiesMoments.showDetail(dateKey, {
        updateHistory: false,
        scroll: opts.scroll
      });
      return;
    }

    if (typeof window.ActivitiesMoments.showList === 'function') {
      window.ActivitiesMoments.showList({
        updateHistory: false,
        scroll: opts.scroll
      });
    }
  }

  function activateMeditations() {
    if (
      window.LifeMeditations &&
      typeof window.LifeMeditations.ensureCurrent === 'function'
    ) {
      window.LifeMeditations.ensureCurrent();
    }
  }

  function activateView(view, options) {
    const opts = options || {};
    const normalized = normalizeView(view) || DEFAULT_VIEW;
    const setter = getLifeSetter();

    if (
      opts.updateHistory &&
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.syncHistory === 'function'
    ) {
      window.BootstrapRoutes.syncHistory(
        getRoute(normalized, opts.dateKey || null),
        opts.replaceHistory === true
      );
    }

    enhanceLifeSubnav();

    if (setter) {
      setter(normalized);
    }

    if (normalized === 'activities_moments') {
      activateActivities(opts.dateKey || null, opts);
    }

    if (normalized === 'meditations') {
      activateMeditations();
    }

  }

  function enterFromLocation() {
    const view = resolveViewFromPath(window.location.pathname) || DEFAULT_VIEW;
    const detail = resolveDetailFromPath(window.location.pathname);

    activateView(view, {
      updateHistory: false,
      dateKey: detail,
      scroll: false
    });
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

  function handleLifeSubnavClick(event) {
    const control = event.target && event.target.closest
      ? event.target.closest('.life-switcher .life-switch-btn')
      : null;

    if (!control) return;

    if (
      control.tagName &&
      control.tagName.toLowerCase() === 'a' &&
      !isPlainLeftClick(event)
    ) {
      return;
    }

    const view = normalizeView(control.dataset.view);
    if (!view) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    activateView(view, {
      updateHistory: true,
      dateKey: null,
      scroll: false
    });
  }

  document.addEventListener('click', handleLifeSubnavClick, true);

  window.addEventListener('popstate', () => {
    window.setTimeout(() => {
      if (isLifePath(window.location.pathname)) {
        enterFromLocation();
      }
    }, 0);
  });

  window.addEventListener('site:langchange', (event) => {
    if (
      event &&
      event.detail &&
      event.detail.scheduleExportOnly === true
    ) {
      return;
    }

    enhanceLifeSubnav();
  });

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('life', {
      init() {
        if (window.Life && typeof window.Life.initLifePage === 'function') {
          window.Life.initLifePage();
        }

        if (window.ActivitiesMoments && typeof window.ActivitiesMoments.init === 'function') {
          window.ActivitiesMoments.init();
        }

        enhanceLifeSubnav();
      },

      enter() {
        enterFromLocation();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceLifeSubnav);
  } else {
    enhanceLifeSubnav();
  }

  window.LifeRoutes = {
    normalizeView,
    resolveViewFromPath,
    resolveDetailFromPath,
    getRoute,
    enhanceLifeSubnav,
    activateView,
    enterFromLocation
  };
})();
