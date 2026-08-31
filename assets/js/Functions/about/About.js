(function () {
  'use strict';

  const ROOT_ID = 'about';
  const MOUNT_ID = 'mount-about';
  const DEFAULT_VIEW = 'profile';

  const VIEW_ALIASES = Object.freeze({
    profile: 'profile',
    archive: 'archive'
  });

  const I18N = Object.freeze({
    en: {
      heading: 'About Me',
      profile: 'Profile',
      archive: 'Archive',
      sectionsLabel: 'About sections'
    },
    zh: {
      heading: '关于我',
      profile: '履历',
      archive: '文库',
      sectionsLabel: '关于页面分区'
    }
  });

  let currentView = DEFAULT_VIEW;

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();

    return VIEW_ALIASES[key] || null;
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

    return (
      document.body &&
      document.body.dataset.lang === 'zh'
    )
      ? 'zh'
      : 'en';
  }

  function getDict() {
    return I18N[getLang()] || I18N.en;
  }

  function getMount() {
    return (
      document.getElementById(MOUNT_ID) ||
      document.body
    );
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function render() {
    const existing = getRoot();

    if (existing) {
      applyI18N();

      return existing;
    }

    const mount = getMount();

    mount.insertAdjacentHTML('beforeend', `
      <div
        id="about"
        data-about-view="${DEFAULT_VIEW}"
      >
        <div class="container about-container">
          <h1
            class="about-heading"
            data-about-i18n="heading"
          >About Me</h1>

          <div class="about-shell">
            <nav
              class="about-switcher"
              role="tablist"
              aria-label="About sections"
            >
              <a
                class="about-switch-btn active"
                id="about-tab-profile"
                href="./about/profile/"
                data-view="profile"
                role="tab"
                aria-selected="true"
                aria-controls="about-profile-section"
                tabindex="0"
                data-about-i18n="profile"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Profile</a>

              <a
                class="about-switch-btn"
                id="about-tab-archive"
                href="./about/archive/"
                data-view="archive"
                role="tab"
                aria-selected="false"
                aria-controls="about-archive-section"
                tabindex="-1"
                data-about-i18n="archive"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Archive</a>
            </nav>

            <section
              class="about-section active"
              id="about-profile-section"
              data-view="profile"
              role="tabpanel"
              aria-labelledby="about-tab-profile"
            >
              <div id="mount-about-profile"></div>
            </section>

            <section
              class="about-section about-archive-section"
              id="about-archive-section"
              data-view="archive"
              role="tabpanel"
              aria-labelledby="about-tab-archive"
              hidden
            >
              <div id="mount-about-archive"></div>
            </section>
          </div>
        </div>
      </div>
    `);

    applyI18N();
    setView(currentView);
    refreshCursor();

    return getRoot();
  }

  function applyI18N() {
    const root = getRoot();

    if (!root) {
      return;
    }

    const dict = getDict();

    root
      .querySelectorAll('[data-about-i18n]')
      .forEach((element) => {
        const key = element.getAttribute(
          'data-about-i18n'
        );

        if (
          !key ||
          typeof dict[key] !== 'string'
        ) {
          return;
        }

        element.textContent = dict[key];
      });

    const switcher = root.querySelector(
      '.about-switcher'
    );

    if (switcher) {
      switcher.setAttribute(
        'aria-label',
        dict.sectionsLabel
      );
    }
  }

  function setView(view) {
    const normalized =
      normalizeView(view) ||
      DEFAULT_VIEW;

    const root = getRoot() || render();

    currentView = normalized;
    root.dataset.aboutView = normalized;

    root
      .querySelectorAll(
        '.about-switch-btn[data-view]'
      )
      .forEach((button) => {
        const buttonView = normalizeView(
          button.dataset.view
        );

        const active =
          buttonView === normalized;

        button.classList.toggle(
          'active',
          active
        );

        button.setAttribute(
          'aria-selected',
          active ? 'true' : 'false'
        );

        button.setAttribute(
          'tabindex',
          active ? '0' : '-1'
        );
      });

    root
      .querySelectorAll(
        '.about-section[data-view]'
      )
      .forEach((section) => {
        const sectionView = normalizeView(
          section.dataset.view
        );

        const active =
          sectionView === normalized;

        section.classList.toggle(
          'active',
          active
        );

        section.toggleAttribute(
          'hidden',
          !active
        );
      });

    refreshCursor();

    return normalized;
  }

  function getCurrentView() {
    return currentView;
  }

  function refreshCursor() {
    const root = getRoot();

    if (
      root &&
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh ===
        'function'
    ) {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function init() {
    const root = render();

    applyI18N();
    setView(currentView);

    return root;
  }

  window.About = {
    init,
    render,
    normalizeView,
    setView,
    getCurrentView,
    applyI18N,
    refreshCursor
  };

  window.addEventListener(
    'site:langchange',
    () => {
      applyI18N();
    }
  );
})();
