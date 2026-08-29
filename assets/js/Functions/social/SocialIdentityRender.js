(function () {
  'use strict';

  function hiddenAttr(active) {
    return active ? '' : ' hidden';
  }

  function activeClass(active) {
    return active ? ' active' : '';
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

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function bindOrcidQrModal(root) {
    const socialRoot =
      root || document.getElementById('social');

    if (
      !socialRoot ||
      socialRoot.dataset.orcidQrBound === 'true'
    ) {
      return;
    }

    const openBtn =
      socialRoot.querySelector('[data-orcid-qr-open]');

    const modal =
      socialRoot.querySelector('#orcid-qr-modal');

    const dialog =
      socialRoot.querySelector('.orcid-qr-dialog');

    const closeBtns =
      socialRoot.querySelectorAll('[data-orcid-qr-close]');

    if (!openBtn || !modal || !dialog) return;

    markSocialCursorTargets(socialRoot);

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');

      document.body.classList.add(
        'orcid-qr-modal-open'
      );

      const closeBtn =
        modal.querySelector('[data-orcid-qr-close]');

      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');

      document.body.classList.remove(
        'orcid-qr-modal-open'
      );

      if (openBtn) openBtn.focus();
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

    document.addEventListener(
      'keydown',
      function (event) {
        if (
          event.key === 'Escape' &&
          modal.classList.contains('is-open')
        ) {
          closeModal();
        }
      }
    );

    socialRoot.dataset.orcidQrBound = 'true';
  }

  function renderCardsHTML() {
    return `
      <div id="mount-social-identity" class="social-submodule social-identity">
        <div class="social-grid">
          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-github"></i>
            </div>
            <div class="social-title" data-i18n="github_title">
              GitHub
            </div>
            <div class="social-description" data-i18n="github_desc">
              My code repositories and projects
            </div>
            <a
              href="https://github.com/Stardust-math"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_profile"
            >Profile</a>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-orcid"></i>
            </div>
            <div class="social-title" data-i18n="orcid_title">
              ORCID
            </div>
            <div class="social-description" data-i18n="orcid_desc">
              Academic identifier and research profile
            </div>
            <div class="social-link-group">
              <a
                href="https://orcid.org/0009-0009-1961-6829"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="link_record"
              >Record</a>
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

          <div class="social-card">
            <div class="social-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div
              class="social-title"
              data-i18n="icourse_title"
            >USTC iCourse</div>
            <div
              class="social-description"
              data-i18n="icourse_desc"
            >My course reviews and profile on USTC iCourse</div>
            <a
              href="https://icourse.club/user/11706"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_profile"
            >Profile</a>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-youtube"></i>
            </div>
            <div class="social-title" data-i18n="youtube_title">
              YouTube
            </div>
            <div class="social-description" data-i18n="youtube_desc">
              My video content and playlists
            </div>
            <div class="social-link-group">
              <a
                href="https://www.youtube.com/channel/UCemKYMAMJk8FggZ5NI36i1Q"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="link_channel"
              >Channel</a>
              <span class="social-divider">/</span>
              <a
                href="https://www.youtube.com/@JinghaoChen-Stardust"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="link_handle"
              >Handle</a>
            </div>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-tiktok"></i>
            </div>
            <div class="social-title" data-i18n="tiktok_title">
              TikTok (Chinese)
            </div>
            <div class="social-description" data-i18n="tiktok_desc">
              Short-form videos in Chinese
            </div>
            <div class="social-link-group">
              <a
                href="https://www.douyin.com/user/MS4wLjABAAAAqb9M45SaGeb8yI28lL3lDFHm48c4kl32Xq7BfRk3I24"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="link_link1"
              >Link 1</a>
              <span class="social-divider">/</span>
              <a
                href="https://v.douyin.com/PzIS6mSXJGY/"
                class="social-link"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="link_link2"
              >Link 2</a>
            </div>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="social-title" data-i18n="rednote_title">
              REDnote
            </div>
            <div class="social-description" data-i18n="rednote_desc">
              Chinese lifestyle and knowledge sharing
            </div>
            <a
              href="https://www.xiaohongshu.com/user/profile/64c696da000000000b005093"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_profile"
            >Profile</a>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-quora"></i>
            </div>
            <div class="social-title" data-i18n="quora_title">
              Quora
            </div>
            <div class="social-description" data-i18n="quora_desc">
              Various questions and answers
            </div>
            <a
              href="https://www.quora.com/profile/Jinghao-Chen-11/"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_profile"
            >Profile</a>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-twitter"></i>
            </div>
            <div class="social-title" data-i18n="x_title">
              X (Twitter)
            </div>
            <div class="social-description" data-i18n="x_desc">
              Notes and sharing
            </div>
            <a
              href="https://x.com/stardust_math"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_profile"
            >Profile</a>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <svg
                class="bilibili-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.99 6.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6.01a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.75l-1-3a.5.5 0 0 1 .33-.63l.94-.3a.5.5 0 0 1 .63.32l1.1 3.1h2.64l1.1-3.1a.5.5 0 0 1 .63-.32l.94.3a.5.5 0 0 1 .33.63l-1 3h2.75zm-2.74 2.5H8.75a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5z"
                  fill="currentColor"
                  stroke="currentColor"
                  stroke-width="0.2"
                />
                <circle
                  cx="10.5"
                  cy="11.5"
                  r="1"
                  fill="currentColor"
                />
                <circle
                  cx="13.5"
                  cy="11.5"
                  r="1"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="social-title" data-i18n="bilibili_title">
              Bilibili
            </div>
            <div class="social-description" data-i18n="bilibili_desc">
              Chinese video platform for my content
            </div>
            <a
              href="https://space.bilibili.com/470364718"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_channel"
            >Channel</a>
          </div>

          <div class="social-card">
            <div class="social-icon">
              <i class="fab fa-steam"></i>
            </div>
            <div class="social-title" data-i18n="steam_title">
              Steam
            </div>
            <div class="social-description" data-i18n="steam_desc">
              My gaming profile and library
            </div>
            <a
              href="https://steamcommunity.com/id/stardust-math/"
              class="social-link"
              target="_blank"
              rel="noopener noreferrer"
              data-i18n="link_profile"
            >Profile</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderModalHTML() {
    return `
      <div
        id="orcid-qr-modal"
        class="orcid-qr-modal"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orcid-qr-title"
      >
        <div class="orcid-qr-dialog">
          <button
            type="button"
            class="orcid-qr-close"
            data-orcid-qr-close
            aria-label="Close ORCID QR code / 关闭 ORCID 二维码"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >
            <i
              class="fas fa-times"
              aria-hidden="true"
            ></i>
          </button>

          <div
            id="orcid-qr-title"
            class="orcid-qr-title"
            data-i18n="orcid_qr_title"
          >ORCID QR Code</div>

          <img
            class="orcid-qr-image"
            src="assets/images/social/identity/ORCID.png"
            alt="ORCID QR code / ORCID 二维码"
            loading="lazy"
          />

          <p
            class="orcid-qr-caption"
            data-i18n="orcid_qr_caption"
          >Scan to open my ORCID record.</p>
        </div>
      </div>
    `;
  }

  function render(options) {
    const opts = options || {};
    const active = opts.active === true;

    return `
      <section
        class="social-section social-identity-section${activeClass(active)}"
        id="social-identity-section"
        data-view="identity"
        role="tabpanel"
        aria-labelledby="social-tab-identity"
        ${hiddenAttr(active)}
      >
        ${renderCardsHTML()}
      </section>
    `;
  }

  function ensureModal(root) {
    const socialRoot =
      root || document.getElementById('social');

    if (!socialRoot) return null;

    let modal =
      socialRoot.querySelector('#orcid-qr-modal');

    if (!modal) {
      socialRoot.insertAdjacentHTML(
        'beforeend',
        renderModalHTML()
      );

      modal =
        socialRoot.querySelector('#orcid-qr-modal');
    }

    bindOrcidQrModal(socialRoot);
    refreshAfterRender(socialRoot);

    return modal;
  }

  window.SocialIdentityRender = {
    render,
    ensureModal,
    bindOrcidQrModal,
    refreshAfterRender
  };
})();