(function () {
  'use strict';

  const DEFAULT_VIEW =
    'constellation';

  const VIEW_TO_SLUG = {
    constellation:
      'constellation',

    identity:
      'identity',

    footprints:
      'footprints',

    anime:
      'anime'
  };

  const SLUG_TO_VIEW = {
    constellation:
      'constellation',

    friends:
      'constellation',

    friendlinks:
      'constellation',

    guestbook:
      'constellation',

    comments:
      'constellation',

    identity:
      'identity',

    cards:
      'identity',

    accounts:
      'identity',

    profiles:
      'identity',

    footprints:
      'footprints',

    stats:
      'footprints',

    statistics:
      'footprints',

    visitors:
      'footprints',

    map:
      'footprints',

    anime:
      'anime',

    watchlist:
      'anime',

    animewatchlist:
      'anime'
  };

  function normalizeView(view) {
    const key = String(view || '')
      .trim()
      .toLowerCase();

    return (
      SLUG_TO_VIEW[key] ||
      (
        VIEW_TO_SLUG[key]
          ? key
          : null
      )
    );
  }

  function getSocialBaseUrl() {
    return new URL(
      'social/',
      document.baseURI
    );
  }

  function getRoute(view) {
    const normalized =
      normalizeView(view) ||
      DEFAULT_VIEW;

    return new URL(
      VIEW_TO_SLUG[normalized] +
      '/',
      getSocialBaseUrl()
    ).pathname;
  }

  function normalizePath(pathname) {
    return String(
      pathname || '/'
    )
      .replace(
        /index\.html$/,
        ''
      )
      .replace(
        /\/+$/,
        ''
      ) || '/';
  }

  function isSocialPath(pathname) {
    const parts =
      normalizePath(
        pathname ||
        window.location.pathname
      )
        .split('/')
        .filter(Boolean);

    return parts.includes(
      'social'
    );
  }

  function getSocialPathParts(pathname) {
    const parts =
      normalizePath(
        pathname ||
        window.location.pathname
      )
        .split('/')
        .filter(Boolean);

    const socialIndex =
      parts.indexOf(
        'social'
      );

    return {
      parts,

      socialIndex,

      slug:
        socialIndex >= 0
          ? (
              parts[
                socialIndex + 1
              ] || ''
            )
          : ''
    };
  }

  function resolveViewFromPath(pathname) {
    const info =
      getSocialPathParts(
        pathname
      );

    return normalizeView(
      info.slug
    );
  }

  function applySocialSubnavCursor(control) {
    if (
      !control ||
      !control.dataset
    ) {
      return;
    }

    control.dataset.cursor =
      control.dataset.cursor ||
      'precise_select';

    control.dataset.cursorFallback =
      control.dataset.cursorFallback ||
      'pointer';
  }

  function toRouteLink(control) {
    const view =
      normalizeView(
        control &&
        control.dataset
          ? control.dataset.view
          : ''
      );

    if (
      !control ||
      !view
    ) {
      return control;
    }

    const href =
      getRoute(view);

    if (
      control.tagName &&
      control.tagName
        .toLowerCase() === 'a'
    ) {
      control.setAttribute(
        'href',
        href
      );

      control.setAttribute(
        'role',
        'tab'
      );

      applySocialSubnavCursor(
        control
      );

      return control;
    }

    const link =
      document.createElement(
        'a'
      );

    Array.from(
      control.attributes
    ).forEach(function (attribute) {
      if (
        attribute.name === 'type'
      ) {
        return;
      }

      link.setAttribute(
        attribute.name,
        attribute.value
      );
    });

    link.className =
      control.className;

    link.dataset.view =
      view;

    link.href =
      href;

    link.setAttribute(
      'role',
      'tab'
    );

    link.innerHTML =
      control.innerHTML;

    applySocialSubnavCursor(
      link
    );

    control.replaceWith(
      link
    );

    return link;
  }

  function enhanceSocialSubnav() {
    document
      .querySelectorAll(
        '.social-switcher .social-switch-btn'
      )
      .forEach(function (control) {
        const link =
          toRouteLink(control);

        const view =
          normalizeView(
            link &&
            link.dataset
              ? link.dataset.view
              : ''
          );

        if (
          link &&
          view
        ) {
          link.setAttribute(
            'href',
            getRoute(view)
          );

          applySocialSubnavCursor(
            link
          );
        }
      });

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh();
    }
  }

  function getSocialSetter() {
    if (
      window.SocialShell &&
      typeof window.SocialShell.setSocialView === 'function'
    ) {
      return window.SocialShell
        .setSocialView.bind(
          window.SocialShell
        );
    }

    return null;
  }

  function activateView(view, options) {
    const opts =
      options || {};

    const normalized =
      normalizeView(view) ||
      DEFAULT_VIEW;

    const setter =
      getSocialSetter();

    enhanceSocialSubnav();

    if (setter) {
      setter(
        normalized,
        {
          silent:
            opts.silent === true
        }
      );
    }

    if (
      opts.updateHistory &&
      window.history &&
      typeof window.history.pushState === 'function'
    ) {
      const route =
        getRoute(normalized);

      const current =
        normalizePath(
          window.location.pathname
        );

      const next =
        normalizePath(route);

      if (
        current !== next
      ) {
        const method =
          opts.replaceHistory
            ? 'replaceState'
            : 'pushState';

        window.history[method](
          {
            path: route
          },
          '',
          route
        );
      }
    }
  }

  function enterFromLocation(options) {
    const opts =
      options || {};

    const view =
      resolveViewFromPath(
        window.location.pathname
      ) ||
      DEFAULT_VIEW;

    activateView(
      view,
      {
        updateHistory:
          false,

        silent:
          opts.silent !== false
      }
    );
  }

  function handleSocialSubnavClick(event) {
    const control =
      event.target &&
      event.target.closest
        ? event.target.closest(
            '.social-switcher .social-switch-btn'
          )
        : null;

    if (!control) {
      return;
    }

    const view =
      normalizeView(
        control.dataset
          ? control.dataset.view
          : ''
      );

    if (!view) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    activateView(
      view,
      {
        updateHistory: true
      }
    );
  }

  function handleSocialSubnavKeydown(event) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight'
    ) {
      return;
    }

    const control =
      event.target &&
      event.target.closest
        ? event.target.closest(
            '.social-switcher .social-switch-btn'
          )
        : null;

    if (!control) {
      return;
    }

    const root =
      document.getElementById(
        'social'
      );

    if (
      !root ||
      !root.contains(control)
    ) {
      return;
    }

    const buttons =
      Array.from(
        root.querySelectorAll(
          '.social-switcher .social-switch-btn'
        )
      );

    const index =
      buttons.indexOf(control);

    if (index < 0) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const direction =
      event.key === 'ArrowRight'
        ? 1
        : -1;

    const next =
      buttons[
        (
          index +
          direction +
          buttons.length
        ) %
        buttons.length
      ];

    if (!next) {
      return;
    }

    next.focus();

    activateView(
      next.dataset
        ? next.dataset.view
        : DEFAULT_VIEW,
      {
        updateHistory: true
      }
    );
  }

  document.addEventListener(
    'click',
    handleSocialSubnavClick,
    true
  );

  document.addEventListener(
    'keydown',
    handleSocialSubnavKeydown,
    true
  );

  window.addEventListener(
    'popstate',
    function () {
      window.setTimeout(
        function () {
          if (
            isSocialPath(
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

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      enhanceSocialSubnav
    );
  } else {
    enhanceSocialSubnav();
  }

  window.SocialRoutes = {
    normalizeView,
    resolveViewFromPath,
    getRoute,
    enhanceSocialSubnav,
    activateView,
    enterFromLocation
  };
})();