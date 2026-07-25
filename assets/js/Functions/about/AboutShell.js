(function () {
  'use strict';

  const ROOT_ID = 'about';
  const MOUNT_ID = 'mount-resume';
  const RESUME_ID = 'resume';
  const DEFAULT_VIEW = 'profile';

  const VIEW_ALIASES = {
    profile: 'profile',
    resume: 'profile',
    cv: 'profile',
    archive: 'archive'
  };

  const I18N = {
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
  };

  let currentView = DEFAULT_VIEW;
  let resumeObserver = null;
  let refreshRaf = 0;

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();
    return VIEW_ALIASES[key] || null;
  }

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function getDict() {
    return I18N[getLang()] || I18N.en;
  }

  function getMount() {
    return document.getElementById(MOUNT_ID) || document.body;
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getResume() {
    return document.getElementById(RESUME_ID);
  }

  function getProfilePanel() {
    const resume = getResume();
    if (!resume) return null;

    return resume.querySelector(':scope > .container');
  }

  function getArchivePanel() {
    const root = getRoot();
    return root ? root.querySelector('#about-archive-panel') : null;
  }

  function renderShell() {
    const existing = getRoot();
    if (existing) return existing;

    const mount = getMount();

    mount.insertAdjacentHTML('beforeend', `
      <div id="about">
        <div class="about-container">
          <div class="about-heading" data-about-i18n="heading">About Me</div>

          <div class="about-shell">
            <div class="about-switcher" role="tablist" aria-label="About sections">
              <a
                class="about-switch-btn active"
                id="about-tab-profile"
                href="./about/profile/"
                data-view="profile"
                role="tab"
                aria-selected="true"
                aria-controls="about-profile-panel"
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
                aria-controls="about-archive-panel"
                tabindex="-1"
                data-about-i18n="archive"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Archive</a>
            </div>

            <div id="resume"></div>

            <section
              class="about-section"
              id="about-archive-panel"
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

    return getRoot();
  }

  function prepareProfilePanel() {
    const panel = getProfilePanel();
    if (!panel) return null;

    panel.id = 'about-profile-panel';
    panel.classList.add('about-section', 'about-profile-panel');
    panel.dataset.view = 'profile';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'about-tab-profile');

    return panel;
  }

  function applyI18N() {
    const root = getRoot();
    if (!root) return;

    const dict = getDict();

    root.querySelectorAll('[data-about-i18n]').forEach((el) => {
      const key = el.getAttribute('data-about-i18n');
      if (!key || typeof dict[key] !== 'string') return;

      el.textContent = dict[key];
    });

    const switcher = root.querySelector('.about-switcher');

    if (switcher) {
      switcher.setAttribute('aria-label', dict.sectionsLabel);
    }
  }

  function refreshCursor() {
    const root = getRoot();
    if (!root) return;

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function refreshLegacyControls() {
    if (window.Theme && typeof window.Theme.init === 'function') {
      window.Theme.init();
    }

    if (window.Clock && typeof window.Clock.updateClock === 'function') {
      window.Clock.updateClock();
    }
  }

  function setView(view) {
    const normalized = normalizeView(view) || DEFAULT_VIEW;
    const root = renderShell();

    currentView = normalized;
    applyI18N();

    root.querySelectorAll('.about-switch-btn').forEach((button) => {
      const buttonView = normalizeView(
        button.dataset ? button.dataset.view : ''
      );

      const active = buttonView === normalized;

      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.setAttribute('tabindex', active ? '0' : '-1');
    });

    const profilePanel = prepareProfilePanel();
    const archivePanel = getArchivePanel();

    if (profilePanel) {
      const active = normalized === 'profile';

      profilePanel.classList.toggle('active', active);
      profilePanel.toggleAttribute('hidden', !active);
    }

    if (archivePanel) {
      const active = normalized === 'archive';

      archivePanel.classList.toggle('active', active);
      archivePanel.toggleAttribute('hidden', !active);
    }

    refreshCursor();

    return normalized;
  }

  function getCurrentView() {
    return currentView;
  }

  function scheduleResumeRefresh() {
    if (refreshRaf) {
      cancelAnimationFrame(refreshRaf);
    }

    refreshRaf = requestAnimationFrame(() => {
      refreshRaf = 0;

      prepareProfilePanel();
      setView(currentView);
      refreshLegacyControls();
    });
  }

  function observeResume() {
    const resume = getResume();

    if (
      !resume ||
      resumeObserver ||
      typeof MutationObserver !== 'function'
    ) {
      return;
    }

    resumeObserver = new MutationObserver(() => {
      /*
        Translate.js replaces #resume.innerHTML when the language changes.
        Restore the panel identity synchronously so Archive never flashes
        Profile content for one frame.
      */
      prepareProfilePanel();
      setView(currentView);
      scheduleResumeRefresh();
    });

    resumeObserver.observe(resume, {
      childList: true
    });
  }

  function init() {
    renderShell();
    observeResume();
    prepareProfilePanel();
    applyI18N();
    setView(currentView);
    refreshLegacyControls();

    return getRoot();
  }

  window.AboutShell = {
    init,
    renderShell,
    normalizeView,
    setView,
    getCurrentView,
    prepareProfilePanel,
    applyI18N,
    refreshCursor
  };

  window.addEventListener('site:langchange', () => {
    applyI18N();
    scheduleResumeRefresh();
  });

  init();
})();