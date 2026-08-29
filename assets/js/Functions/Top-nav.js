(function () {
  'use strict';

  function getTopLevelHref(pageKey) {
    const resources = window.SiteResources || {};
    const pages = resources.pages || {};
    const page = pages[pageKey] || {};
    const route = page.route;

    if (!route) return './';

    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        route,
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    return new URL(route + '/', document.baseURI).pathname;
  }

  // ------------------------------
  // Render Top Nav HTML
  // ------------------------------
  const mount =
    document.getElementById('mount-top-nav') ||
    document.body;

  mount.insertAdjacentHTML('beforeend', `
    <nav
      id="top-nav"
      class="top-nav"
      aria-label="Primary navigation"
    >
      <div class="top-nav-inner">
        <div class="top-nav-left">
          <button
            id="top-toggle-btn"
            class="top-nav-icon"
            aria-label="Toggle theme"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >
            <span>
              <i class="fas fa-sun"></i>
            </span>
          </button>

          <div
            id="top-clock"
            class="top-nav-clock"
            aria-label="Local time"
          >GMT+8 00:00</div>
        </div>

        <div
          class="top-nav-center"
          role="navigation"
          aria-label="Pages"
        >
          <a
            class="top-nav-link"
            href="${getTopLevelHref('about')}"
            data-page="about"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >About</a>

          <a
            class="top-nav-link"
            href="${getTopLevelHref('schedule')}"
            data-page="schedule"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >Schedule</a>

          <a
            class="top-nav-link"
            href="${getTopLevelHref('social')}"
            data-page="social"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >Social</a>

          <!--
          <a
            class="top-nav-link"
            href="${getTopLevelHref('toolkit')}"
            data-page="toolkit"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >Toolkit</a>
          -->

          <a
            class="top-nav-link"
            href="${getTopLevelHref('life')}"
            data-page="life"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >Life</a>
        </div>

        <div class="top-nav-right">
          <button
            id="top-lang-btn"
            class="top-nav-icon top-nav-lang-btn"
            aria-label="Switch to Chinese"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >
            <span
              class="top-nav-lang"
              aria-hidden="true"
            >
              <span class="lang-token lang-left">
                EN
              </span>

              <span class="lang-sep">/</span>

              <span class="lang-token lang-right">
                ZH
              </span>
            </span>
          </button>

          <button
            id="top-back-btn"
            class="top-nav-icon"
            aria-label="Back to cover"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
        </div>
      </div>
    </nav>
  `);

  function refreshTopNavHrefs() {
    const topNav = document.getElementById('top-nav');

    if (!topNav) return;

    topNav
      .querySelectorAll('.top-nav-link[data-page]')
      .forEach((link) => {
        const page = link.dataset.page;

        if (!page) return;

        link.setAttribute('href', getTopLevelHref(page));
      });
  }

  function showTopNav() {
    refreshTopNavHrefs();
    document.body.classList.add('nav-visible');
  }

  function hideTopNav() {
    document.body.classList.remove('nav-visible');
  }

  function setTopNavActive(pageKey) {
    const links =
      document.querySelectorAll('.top-nav-link');

    links.forEach((link) => {
      link.classList.toggle(
        'active',
        link.dataset.page === pageKey
      );
    });
  }

  function resetDefaultSubroute(pageKey) {
    if (
      pageKey === 'about' &&
      window.AboutRoutes &&
      typeof window.AboutRoutes.activateView ===
        'function'
    ) {
      window.AboutRoutes.activateView('profile', {
        updateHistory: false,
        scroll: false
      });

      return;
    }

    if (
      pageKey === 'schedule' &&
      window.ScheduleRoutes &&
      typeof window.ScheduleRoutes.activateView ===
        'function'
    ) {
      window.ScheduleRoutes.activateView(
        'my-timetable',
        {
          updateHistory: false,
          scroll: false
        }
      );

      return;
    }

    if (
      pageKey === 'social' &&
      window.SocialRoutes &&
      typeof window.SocialRoutes.activateView ===
        'function'
    ) {
      window.SocialRoutes.activateView(
        'constellation',
        {
          updateHistory: false,
          silent: false
        }
      );

      return;
    }

    if (
      pageKey === 'life' &&
      window.LifeRoutes &&
      typeof window.LifeRoutes.activateView ===
        'function'
    ) {
      window.LifeRoutes.activateView(
        'activities_moments',
        {
          updateHistory: false,
          dateKey: null,
          scroll: false
        }
      );
    }
  }

  function isPlainLeftClick(event) {
    return event &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.defaultPrevented;
  }

  function navigateToTopLevelPage(
    target,
    onNavigate
  ) {
    if (!target || !onNavigate) return;

    let result;

    try {
      result = onNavigate(target);
    } catch (error) {
      console.error(
        '[TopNav] Navigation failed:',
        target,
        error
      );

      return;
    }

    Promise.resolve(result)
      .then(() => {
        resetDefaultSubroute(target);
      })
      .catch((error) => {
        console.error(
          '[TopNav] Navigation promise failed:',
          target,
          error
        );
      });
  }

  function initTopNav(
    onNavigate,
    onBackToCover,
    onWarmup
  ) {
    const topNav =
      document.getElementById('top-nav');

    if (!topNav) return;

    const topBackBtn =
      document.getElementById('top-back-btn');

    if (
      topBackBtn &&
      onBackToCover &&
      topBackBtn.dataset.boundBack !== '1'
    ) {
      topBackBtn.dataset.boundBack = '1';

      topBackBtn.addEventListener(
        'click',
        onBackToCover
      );
    }

    const links =
      topNav.querySelectorAll('.top-nav-link');

    links.forEach((link) => {
      if (link.dataset.boundNav !== '1') {
        link.dataset.boundNav = '1';

        link.addEventListener(
          'click',
          (event) => {
            const target = link.dataset.page;

            if (
              !target ||
              !onNavigate ||
              !isPlainLeftClick(event)
            ) {
              return;
            }

            event.preventDefault();

            navigateToTopLevelPage(
              target,
              onNavigate
            );
          }
        );
      }

      if (
        onWarmup &&
        link.dataset.boundWarmup !== '1'
      ) {
        link.dataset.boundWarmup = '1';

        let warmed = false;

        function warm() {
          if (warmed) return;

          warmed = true;

          const target = link.dataset.page;

          if (!target) return;

          onWarmup(target);
        }

        link.addEventListener(
          'pointerenter',
          warm,
          { passive: true }
        );

        link.addEventListener('focus', warm);

        link.addEventListener(
          'touchstart',
          warm,
          { passive: true }
        );
      }
    });

    // Hidden on cover by default.
    refreshTopNavHrefs();
    hideTopNav();
  }

  window.addEventListener(
    'site:langchange',
    refreshTopNavHrefs
  );

  window.TopNav = {
    show: showTopNav,
    hide: hideTopNav,
    setActive: setTopNavActive,
    refreshLinks: refreshTopNavHrefs,
    init: initTopNav
  };
})();
