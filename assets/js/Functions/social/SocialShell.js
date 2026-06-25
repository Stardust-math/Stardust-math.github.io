(function () {
  'use strict';

  const ROOT_ID = 'social';
  const MOUNT_ID = 'mount-social';
  const DEFAULT_VIEW = 'constellation';

  const VIEW_ALIASES = {
    constellation: 'constellation',
    friends: 'constellation',
    friendlinks: 'constellation',
    guestbook: 'constellation',
    comments: 'constellation',

    identity: 'identity',
    cards: 'identity',
    accounts: 'identity',
    profiles: 'identity',

    footprints: 'footprints',
    stats: 'footprints',
    statistics: 'footprints',
    visitors: 'footprints',
    map: 'footprints'
  };

  let currentView = DEFAULT_VIEW;
  let socialSwitchBound = false;

  function getMount() {
    return document.getElementById(MOUNT_ID) || document.body;
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();
    return VIEW_ALIASES[key] || null;
  }

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    const bodyLang = document.body && document.body.dataset ? document.body.dataset.lang : '';
    return /^zh/i.test(bodyLang) ? 'zh' : 'en';
  }

  function getSocialDict() {
    const lang = getLang();

    if (lang === 'zh' && window.SOCIAL_ZH_I18N && typeof window.SOCIAL_ZH_I18N === 'object') {
      return window.SOCIAL_ZH_I18N;
    }

    if (window.SOCIAL_EN_I18N && typeof window.SOCIAL_EN_I18N === 'object') {
      return window.SOCIAL_EN_I18N;
    }

    return {};
  }

  function applySocialI18N(root) {
    const scope = root || getRoot();
    if (!scope || typeof scope.querySelectorAll !== 'function') return;

    const dict = getSocialDict();

    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (!key || !Object.prototype.hasOwnProperty.call(dict, key)) return;
      el.textContent = dict[key];
    });
  }

  function dispatchSocialViewChange(view) {
    try {
      const detail = { view };

      if (typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('social:viewchange', { detail }));
      } else {
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('social:viewchange', false, false, detail);
        window.dispatchEvent(evt);
      }
    } catch (e) { }
  }

  function markCursorTargets(root) {
    const scope = root || getRoot();
    if (!scope || typeof scope.querySelectorAll !== 'function') return;

    scope.querySelectorAll([
      '.social-switch-btn',
      '.social-switch-btn *',
      '[data-orcid-qr-open]',
      '[data-orcid-qr-close]'
    ].join(', ')).forEach(function (el) {
      if (!el.dataset) return;
      el.dataset.cursor = el.dataset.cursor || 'precise_select';
      el.dataset.cursorFallback = el.dataset.cursorFallback || 'pointer';
    });
  }

  function refreshCursor(root) {
    markCursorTargets(root);

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(root || getRoot());
    }
  }

  function renderSections() {
    const parts = [];

    if (window.SocialConstellationRender && typeof window.SocialConstellationRender.render === 'function') {
      parts.push(window.SocialConstellationRender.render({ active: true }));
    }

    if (window.SocialIdentityRender && typeof window.SocialIdentityRender.render === 'function') {
      parts.push(window.SocialIdentityRender.render({ active: false }));
    }

    if (window.SocialFootprintsRender && typeof window.SocialFootprintsRender.render === 'function') {
      parts.push(window.SocialFootprintsRender.render({ active: false }));
    }

    return parts.join('');
  }

  function renderSocialPage() {
    const existing = getRoot();

    if (existing) {
      bindSocialSwitcher(existing);
      applySocialI18N(existing);
      refreshCursor(existing);
      return existing;
    }

    const mount = getMount();

    mount.insertAdjacentHTML('beforeend', `
      <div id="social">
        <button id="toggle-btn-social">
          <span><i class="fas fa-sun"></i></span>
        </button>
        <div id="clock-social">GMT+8 00:00</div>

        <div class="container social-container">
          <div class="social-heading" data-i18n="social_heading">Connect With Me</div>

          <div class="social-shell">
            <div class="social-switcher" role="tablist" aria-label="Social sections">
              <a
                class="social-switch-btn active"
                id="social-tab-constellation"
                href="./social/constellation/"
                data-view="constellation"
                role="tab"
                aria-selected="true"
                tabindex="0"
                data-i18n="social_tab_constellation"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Constellation</a>

              <a
                class="social-switch-btn"
                id="social-tab-identity"
                href="./social/identity/"
                data-view="identity"
                role="tab"
                aria-selected="false"
                tabindex="-1"
                data-i18n="social_tab_identity"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Identity</a>

              <a
                class="social-switch-btn"
                id="social-tab-footprints"
                href="./social/footprints/"
                data-view="footprints"
                role="tab"
                aria-selected="false"
                tabindex="-1"
                data-i18n="social_tab_footprints"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Footprints</a>
            </div>

            ${renderSections()}
          </div>
        </div>

        <a href="#" class="back-btn" id="social-back-btn">
          <i class="fas fa-arrow-left"></i>
        </a>
      </div>
    `);

    const root = getRoot();

    if (window.SocialIdentityRender && typeof window.SocialIdentityRender.ensureModal === 'function') {
      window.SocialIdentityRender.ensureModal(root);
    }

    bindSocialSwitcher(root);
    applySocialI18N(root);
    setSocialView(DEFAULT_VIEW, { silent: true });
    refreshCursor(root);

    return root;
  }

  function runViewEnter(view) {
    if (view === 'constellation') {
      if (window.SocialFriends && typeof window.SocialFriends.refresh === 'function') {
        window.SocialFriends.refresh();
      }

      if (window.SocialComments && typeof window.SocialComments.enter === 'function') {
        window.SocialComments.enter();
      }
    }

    if (view === 'identity') {
      const root = getRoot();

      if (window.SocialIdentityRender && typeof window.SocialIdentityRender.bindOrcidQrModal === 'function') {
        window.SocialIdentityRender.bindOrcidQrModal(root);
      }
    }

    if (view === 'footprints') {
      if (window.SocialStats && typeof window.SocialStats.enter === 'function') {
        window.SocialStats.enter();
      }
    }
  }

  function setSocialView(view, options) {
    const opts = options || {};
    const root = renderSocialPage();
    const normalized = normalizeView(view) || DEFAULT_VIEW;

    currentView = normalized;
    applySocialI18N(root);

    root.querySelectorAll('.social-switch-btn').forEach(function (btn) {
      const btnView = normalizeView(btn.dataset ? btn.dataset.view : '');
      const active = btnView === normalized;

      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    root.querySelectorAll('.social-section').forEach(function (section) {
      const sectionView = normalizeView(section.dataset ? section.dataset.view : '');
      const active = sectionView === normalized;

      section.classList.toggle('active', active);
      section.toggleAttribute('hidden', !active);
    });

    runViewEnter(normalized);
    refreshCursor(root);

    if (opts.silent !== true) {
      dispatchSocialViewChange(normalized);
    }

    return normalized;
  }

  function getCurrentView() {
    return currentView;
  }

  function isViewActive(view) {
    const normalized = normalizeView(view);
    if (!normalized) return false;

    const root = getRoot();
    if (!root) return false;

    const section = root.querySelector('.social-section[data-view="' + normalized + '"]');
    return !!section && section.classList.contains('active') && !section.hidden;
  }

  function bindSocialSwitcher(root) {
    const social = root || getRoot();
    if (!social || socialSwitchBound) return;

    social.addEventListener('click', function (event) {
      const btn = event.target.closest('.social-switch-btn');
      if (!btn || !social.contains(btn)) return;

      event.preventDefault();
      setSocialView(btn.dataset ? btn.dataset.view : DEFAULT_VIEW);
    });

    social.addEventListener('keydown', function (event) {
      const btn = event.target.closest('.social-switch-btn');
      if (!btn || !social.contains(btn)) return;

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const buttons = Array.from(social.querySelectorAll('.social-switch-btn'));
      const index = buttons.indexOf(btn);
      if (index < 0) return;

      event.preventDefault();

      const dir = event.key === 'ArrowRight' ? 1 : -1;
      const next = buttons[(index + dir + buttons.length) % buttons.length];

      if (next) {
        next.focus();
        setSocialView(next.dataset ? next.dataset.view : DEFAULT_VIEW);
      }
    });

    socialSwitchBound = true;
  }

  function init() {
    return renderSocialPage();
  }

  window.SocialShell = {
    init,
    renderSocialPage,
    normalizeView,
    setSocialView,
    getCurrentView,
    isViewActive,
    applySocialI18N,
    refreshCursor
  };

  window.addEventListener('site:langchange', function () {
    applySocialI18N(getRoot());
  });
})();