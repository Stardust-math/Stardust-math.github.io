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
            type="button"
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

        <div class="top-nav-center-wrap">
          <button
            id="top-menu-btn"
            class="top-nav-icon top-nav-menu-btn"
            type="button"
            aria-label="Open page menu"
            aria-controls="top-nav-pages"
            aria-expanded="false"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >
            <i class="fas fa-bars" aria-hidden="true"></i>
          </button>

          <div
            id="top-nav-pages"
            class="top-nav-center"
            role="group"
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

            <a
              class="top-nav-link"
              href="${getTopLevelHref('life')}"
              data-page="life"
              data-cursor="precise_select"
              data-cursor-fallback="pointer"
            >Life</a>
          </div>
        </div>

        <div class="top-nav-right">
          <button
            id="top-lang-btn"
            class="top-nav-icon top-nav-lang-btn"
            type="button"
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
            type="button"
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

  const MOBILE_MENU_MAX_WIDTH = 820;

  const mobileMenuMedia =
    typeof window.matchMedia === 'function'
      ? window.matchMedia(
          `(max-width: ${MOBILE_MENU_MAX_WIDTH}px)`
        )
      : null;

  function isMobileMenuLayout() {
    return mobileMenuMedia
      ? mobileMenuMedia.matches
      : window.innerWidth <=
          MOBILE_MENU_MAX_WIDTH;
  }

  function isChinese() {
    return Boolean(
      document.body &&
      document.body.dataset.lang === 'zh'
    );
  }

  function updateMobileMenuLabel() {
    const button =
      document.getElementById('top-menu-btn');

    const topNav =
      document.getElementById('top-nav');

    const pages =
      document.getElementById('top-nav-pages');

    if (!button) return;

    const open =
      button.getAttribute('aria-expanded') === 'true';

    const label = isChinese()
      ? (open ? '关闭页面菜单' : '打开页面菜单')
      : (open ? 'Close page menu' : 'Open page menu');

    button.setAttribute('aria-label', label);
    button.title = label;

    if (topNav) {
      topNav.setAttribute(
        'aria-label',
        isChinese()
          ? '主导航'
          : 'Primary navigation'
      );
    }

    if (pages) {
      pages.setAttribute(
        'aria-label',
        isChinese()
          ? '页面'
          : 'Pages'
      );
    }
  }

  function setMobileMenuOpen(open, options) {
    const opts = options || {};
    const topNav = document.getElementById('top-nav');
    const button = document.getElementById('top-menu-btn');
    const pages = document.getElementById('top-nav-pages');

    if (!topNav || !button || !pages) return;

    const nextOpen =
      Boolean(open) &&
      isMobileMenuLayout();

    topNav.classList.toggle(
      'top-nav-menu-open',
      nextOpen
    );

    button.setAttribute(
      'aria-expanded',
      nextOpen ? 'true' : 'false'
    );

    const shouldHidePages =
      isMobileMenuLayout() &&
      !nextOpen;

    const shouldReturnFocus =
      !nextOpen &&
      (
        opts.returnFocus === true ||
        (
          shouldHidePages &&
          pages.contains(document.activeElement)
        )
      );

    if (shouldReturnFocus) {
      button.focus({
        preventScroll: true
      });
    }

    if (shouldHidePages) {
      pages.setAttribute('aria-hidden', 'true');
    } else {
      pages.removeAttribute('aria-hidden');
    }

    const icon = button.querySelector('i');

    if (icon) {
      icon.classList.toggle('fa-bars', !nextOpen);
      icon.classList.toggle('fa-xmark', nextOpen);
    }

    updateMobileMenuLabel();
  }

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
    setMobileMenuOpen(false);
    document.body.classList.remove('nav-visible');
  }

  function setTopNavActive(pageKey) {
    const links =
      document.querySelectorAll('.top-nav-link');

    links.forEach((link) => {
      const active =
        link.dataset.page === pageKey;

      link.classList.toggle('active', active);

      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
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

    const topMenuBtn =
      document.getElementById('top-menu-btn');

    if (
      topMenuBtn &&
      topMenuBtn.dataset.boundMenu !== '1'
    ) {
      topMenuBtn.dataset.boundMenu = '1';

      topMenuBtn.addEventListener(
        'click',
        () => {
          setMobileMenuOpen(
            topMenuBtn.getAttribute(
              'aria-expanded'
            ) !== 'true'
          );
        }
      );
    }

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

            setMobileMenuOpen(false);

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

    if (topNav.dataset.boundMobileMenu !== '1') {
      topNav.dataset.boundMobileMenu = '1';

      document.addEventListener(
        'click',
        (event) => {
          if (
            topNav.classList.contains(
              'top-nav-menu-open'
            ) &&
            !topNav.contains(event.target)
          ) {
            setMobileMenuOpen(false);
          }
        },
        true
      );

      document.addEventListener(
        'keydown',
        (event) => {
          if (
            event.key === 'Escape' &&
            topNav.classList.contains(
              'top-nav-menu-open'
            )
          ) {
            event.preventDefault();
            setMobileMenuOpen(false, {
              returnFocus: true
            });
          }
        }
      );

      let previousMobileMenuLayout =
        isMobileMenuLayout();

      const handleLayoutChange = () => {
        const nextMobileMenuLayout =
          isMobileMenuLayout();

        if (
          nextMobileMenuLayout ===
          previousMobileMenuLayout
        ) {
          return;
        }

        previousMobileMenuLayout =
          nextMobileMenuLayout;

        const menuHadFocus =
          document.activeElement === topMenuBtn;

        setMobileMenuOpen(false);

        if (
          menuHadFocus &&
          !nextMobileMenuLayout
        ) {
          const currentLink =
            topNav.querySelector(
              '.top-nav-link[aria-current="page"]'
            );

          if (currentLink) {
            currentLink.focus({
              preventScroll: true
            });
          }
        }
      };

      if (mobileMenuMedia) {
        if (
          typeof mobileMenuMedia.addEventListener ===
            'function'
        ) {
          mobileMenuMedia.addEventListener(
            'change',
            handleLayoutChange
          );
        } else if (
          typeof mobileMenuMedia.addListener ===
            'function'
        ) {
          mobileMenuMedia.addListener(
            handleLayoutChange
          );
        }
      } else {
        window.addEventListener(
          'resize',
          handleLayoutChange,
          { passive: true }
        );
      }
    }

    // Hidden on cover by default.
    refreshTopNavHrefs();
    hideTopNav();
  }

  window.addEventListener(
    'site:langchange',
    () => {
      refreshTopNavHrefs();
      updateMobileMenuLabel();
    }
  );

  window.TopNav = {
    show: showTopNav,
    hide: hideTopNav,
    setActive: setTopNavActive,
    refreshLinks: refreshTopNavHrefs,
    init: initTopNav
  };
})();
