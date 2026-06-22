(function () {
  'use strict';

  const ROOT_ID = 'social';
  const MOUNT_ID = 'mount-social';

  function getMount() {
    return document.getElementById(MOUNT_ID) || document.body;
  }

  function getSocialRoot() {
    return document.getElementById(ROOT_ID);
  }

  function markSocialCursorTargets(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;

    root.querySelectorAll([
      '[data-orcid-qr-open]',
      '[data-orcid-qr-close]'
    ].join(', ')).forEach(function (el) {
      if (!el.dataset) return;

      el.dataset.cursor = el.dataset.cursor || 'precise_select';
      el.dataset.cursorFallback = el.dataset.cursorFallback || 'pointer';
    });
  }

  function refreshAfterRender(root) {
    if (!root) return;

    markSocialCursorTargets(root);

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function bindOrcidQrModal(root) {
    if (!root || root.dataset.orcidQrBound === 'true') return;

    const openBtn = root.querySelector('[data-orcid-qr-open]');
    const modal = root.querySelector('#orcid-qr-modal');
    const dialog = root.querySelector('.orcid-qr-dialog');
    const closeBtns = root.querySelectorAll('[data-orcid-qr-close]');

    if (!openBtn || !modal || !dialog) return;

    markSocialCursorTargets(root);

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('orcid-qr-modal-open');

      const closeBtn = modal.querySelector('[data-orcid-qr-close]');
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('orcid-qr-modal-open');

      openBtn.focus();
    }

    openBtn.addEventListener('click', function () {
      openModal();
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeModal();
      });
    });

    modal.addEventListener('click', function (event) {
      if (!dialog.contains(event.target)) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    root.dataset.orcidQrBound = 'true';
  }

  function renderSocialPage() {
    const existing = getSocialRoot();

    if (existing) {
      bindOrcidQrModal(existing);
      refreshAfterRender(existing);
      return existing;
    }

    const mount = getMount();

    mount.insertAdjacentHTML('beforeend', `
      <div id="social">
        <button id="toggle-btn-social">
          <span><i class="fas fa-sun"></i></span>
        </button>
        <div id="clock-social">GMT+8 00:00</div>

        <!-- Social cards -->
        <div class="container">
          <div class="social-heading" data-i18n="social_heading">Connect With Me</div>
          
          <div class="social-grid">
            <!-- GitHub card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-github"></i></div>
              <div class="social-title" data-i18n="github_title">GitHub</div>
              <div class="social-description" data-i18n="github_desc">My code repositories and projects</div>
              <a href="https://github.com/Stardust-math" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>

            <!-- ORCID card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-orcid"></i></div>
              <div class="social-title" data-i18n="orcid_title">ORCID</div>
              <div class="social-description" data-i18n="orcid_desc">Academic identifier and research profile</div>
              <div class="social-link-group">
                <a href="https://orcid.org/0009-0009-1961-6829" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_record">Record</a>
                <span class="social-divider">/</span>
                <button
                  type="button"
                  class="social-link social-qr-button"
                  data-orcid-qr-open
                  data-i18n="link_qr_code"
                  data-cursor="precise_select"
                  data-cursor-fallback="pointer"
                >QR Code</button>
              </div>
            </div>

            <!-- YouTube card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-youtube"></i></div>
              <div class="social-title" data-i18n="youtube_title">YouTube</div>
              <div class="social-description" data-i18n="youtube_desc">My video content and playlists</div>
              <div class="social-link-group">
                <a href="https://www.youtube.com/channel/UCemKYMAMJk8FggZ5NI36i1Q" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_channel">Channel</a>
                <span class="social-divider">/</span>
                <a href="https://www.youtube.com/@JinghaoChen-Stardust" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_handle">Handle</a>
              </div>
            </div>
            
            <!-- TikTok card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-tiktok"></i></div>
              <div class="social-title" data-i18n="tiktok_title">TikTok (Chinese)</div>
              <div class="social-description" data-i18n="tiktok_desc">Short-form videos in Chinese</div>
              <div class="social-link-group">
                <a href="https://www.douyin.com/user/MS4wLjABAAAAqb9M45SaGeb8yI28lL3lDFHm48c4kl32Xq7BfRk3I24" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_link1">Link 1</a>
                <span class="social-divider">/</span>
                <a href="https://v.douyin.com/PzIS6mSXJGY/" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_link2">Link 2</a>
              </div>
            </div>
            
            <!-- REDnote (Xiaohongshu) card -->
            <div class="social-card">
              <div class="social-icon"><i class="fas fa-book"></i></div>
              <div class="social-title" data-i18n="rednote_title">REDnote</div>
              <div class="social-description" data-i18n="rednote_desc">Chinese lifestyle and knowledge sharing</div>
              <a href="https://www.xiaohongshu.com/user/profile/64c696da000000000b005093" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
            
            <!-- Quora card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-quora"></i></div>
              <div class="social-title" data-i18n="quora_title">Quora</div>
              <div class="social-description" data-i18n="quora_desc">Various questions and answers</div>
              <a href="https://www.quora.com/profile/Jinghao-Chen-11/" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
            
            <!-- Twitter/X card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-twitter"></i></div>
              <div class="social-title" data-i18n="x_title">X (Twitter)</div>
              <div class="social-description" data-i18n="x_desc">Notes and sharing</div>
              <a href="https://x.com/stardust_math" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
            
            <!-- Bilibili card -->
            <div class="social-card">
              <div class="social-icon">
                <svg class="bilibili-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.99 6.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6.01a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.75l-1-3a.5.5 0 0 1 .33-.63l.94-.3a.5.5 0 0 1 .63.32l1.1 3.1h2.64l1.1-3.1a.5.5 0 0 1 .63-.32l.94.3a.5.5 0 0 1 .33.63l-1 3h2.75zm-2.74 2.5H8.75a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5z"
                        fill="currentColor" stroke="currentColor" stroke-width="0.2"/>
                  <circle cx="10.5" cy="11.5" r="1" fill="currentColor"/>
                  <circle cx="13.5" cy="11.5" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div class="social-title" data-i18n="bilibili_title">Bilibili</div>
              <div class="social-description" data-i18n="bilibili_desc">Chinese video platform for my content</div>
              <a href="https://space.bilibili.com/470364718" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_channel">Channel</a>
            </div>

            <!-- Steam card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-steam"></i></div>
              <div class="social-title" data-i18n="steam_title">Steam</div>
              <div class="social-description" data-i18n="steam_desc">My gaming profile and library</div>
              <a href="https://steamcommunity.com/id/stardust-math/" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
          </div>
        </div>

        <!-- ORCID QR modal -->
        <div id="orcid-qr-modal" class="orcid-qr-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="orcid-qr-title">
          <div class="orcid-qr-dialog">
            <button
              type="button"
              class="orcid-qr-close"
              data-orcid-qr-close
              aria-label="Close ORCID QR code / 关闭 ORCID 二维码"
              data-cursor="precise_select"
              data-cursor-fallback="pointer"
            >
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
            <div id="orcid-qr-title" class="orcid-qr-title" data-i18n="orcid_qr_title">ORCID QR Code</div>
            <img
              class="orcid-qr-image"
              src="assets/images/social/ORCID.png"
              alt="ORCID QR code / ORCID 二维码"
              loading="lazy"
            />
            <p class="orcid-qr-caption" data-i18n="orcid_qr_caption">Scan to open my ORCID record.</p>
          </div>
        </div>

        <!-- Website statistics -->
        <div class="container stats-container">
          <div class="stats-heading" data-i18n="stats_heading">Website Statistics</div>

          <!-- GoatCounter summary -->
          <div class="stats-metrics" aria-label="GoatCounter summary">
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_total">All-time (Total)</div>
              <div class="stats-metric-value" id="gc-total">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_month">Last 30 days</div>
              <div class="stats-metric-value" id="gc-month">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_week">Last 7 days</div>
              <div class="stats-metric-value" id="gc-week">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_page">This path</div>
              <div class="stats-metric-value" id="gc-page">—</div>
            </div>
          </div>

          <!-- GoatCounter dashboard -->
          <div class="stats-block">
            <div class="stats-subtitle">
              <span data-i18n="dashboard_title">GoatCounter Dashboard</span>
              <a class="stats-link" href="https://stardust.goatcounter.com/" target="_blank" rel="noopener noreferrer" data-i18n="link_open">Open</a>
            </div>

            <div class="stats-embed">
              <iframe
                class="goatcounter-frame"
                title="GoatCounter dashboard"
                loading="lazy"
                data-src="https://stardust.goatcounter.com?hideui=1"
              ></iframe>
            </div>
          </div>

          <div class="stats-sep"></div>

          <!-- MapMyVisitors visitor map -->
          <div class="stats-block">
            <div class="stats-subtitle">
              <span data-i18n="visitor_map">Visitor Map</span>
            </div>
            <div class="visitor-map-wrap">
              <div id="visitor-map-placeholder"></div>
            </div>
          </div>

          <div class="stats-sep"></div>

          <!-- Giscus guestbook -->
          <div id="guestbook" class="stats-block comments-block">
            <div class="comments-header">
              <div class="stats-subtitle comments-subtitle">
                <span data-i18n="comments_title">Guestbook</span>
              </div>

              <a
                id="giscus-github-link"
                class="comments-github-icon"
                href="https://github.com/Stardust-math/Stardust-math.github.io/discussions/2"
                target="_blank"
                rel="noopener noreferrer"
                title="Open discussion on GitHub"
                aria-label="Open discussion on GitHub"
              >
                <svg
                  class="comments-github-svg"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                    0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                    -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                    .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                    0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12
                    0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.87c.68 0 1.36.09 2 .26
                    1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                    .51.56.82 1.27.82 2.15
                    0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                    0 1.07-.01 1.93-.01 2.2
                    0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                  />
                </svg>
              </a>
            </div>

            <p class="comments-login-hint">
              <span data-i18n="comments_hint_intro">Feel free to leave a note, suggestion, or academic message. </span>
              <span data-i18n="comments_hint_exchange">Visitors are also welcome to share their personal homepages or other appropriate information here for academic exchange and mutual improvement, provided that the content is lawful and respectful. </span>
              <span data-i18n="comments_hint_support">Comments support </span>
              <a
                class="comments-syntax-link"
                href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/about-writing-and-formatting-on-github"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="comments_hint_markdown"
              >GitHub Flavored Markdown</a>
              <span data-i18n="comments_hint_and"> and </span>
              <a
                class="comments-syntax-link"
                href="https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="comments_hint_math"
              >mathematical expressions</a>
              <span data-i18n="comments_hint_suffix">. Sign in with GitHub to comment.</span>
            </p>

            <div id="giscus-container" class="giscus-container">
              <div id="giscus-loading" class="giscus-loading" data-i18n="comments_loading">
                Loading comments...
              </div>
            </div>
          </div>
        </div>
        
        <a href="#" class="back-btn" id="social-back-btn">
          <i class="fas fa-arrow-left"></i>
        </a>
      </div>
    `);

    const root = getSocialRoot();
    bindOrcidQrModal(root);
    refreshAfterRender(root);

    return root;
  }

  function init() {
    return renderSocialPage();
  }

  window.SocialRender = {
    init,
    renderSocialPage
  };

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('social', {
      init() {
        init();
      },

      refresh() {
        init();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();