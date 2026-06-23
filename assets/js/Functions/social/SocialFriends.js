(function () {
  'use strict';

  const ROOT_ID = 'social-friends';
  const COPY_RESET_MS = 1500;

  let retryCount = 0;

  function getData() {
    return window.SOCIAL_FRIENDS_DATA || {};
  }

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang();
    }

    const bodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : '';

    return /^zh/i.test(bodyLang) ? 'zh' : 'en';
  }

  function getDict() {
    const lang = getLang();
    const en = window.SOCIAL_FRIENDS_EN_I18N || {};
    const zh = window.SOCIAL_FRIENDS_ZH_I18N || {};

    if (lang === 'zh' && zh && typeof zh === 'object') {
      return zh;
    }

    return en;
  }

  function t(key) {
    const dict = getDict();
    const en = window.SOCIAL_FRIENDS_EN_I18N || {};

    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      return dict[key];
    }

    if (Object.prototype.hasOwnProperty.call(en, key)) {
      return en[key];
    }

    return '';
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function firstLetter(value) {
    const s = String(value || '').trim();
    return s ? s.charAt(0).toUpperCase() : '?';
  }

  function normalizeLines(text) {
    return String(text || '').replace(/\r\n/g, '\n').split('\n');
  }

  function getMailtoHref() {
    const data = getData();
    const email = data.email || '';
    const subject = data.mailSubject || 'Request to Add Friend';
    const body = data.requestTemplate || '';

    const query = new URLSearchParams({
      subject,
      body
    }).toString();

    return 'mailto:' + encodeURIComponent(email) + '?' + query;
  }

  function renderIntro() {
    const intro = String(t('friends_intro') || '').trim();

    if (!intro) {
      return '';
    }

    return [
      '<p class="friends-intro" data-social-friends-i18n="friends_intro">',
        escapeHTML(intro),
      '</p>'
    ].join('');
  }

  function renderCodeLines(text) {
    const lines = normalizeLines(text);

    return lines.map(function (line, index) {
      const content = escapeHTML(line) || '&nbsp;';

      return [
        '<span class="friends-code-line">',
          '<span class="friends-code-no" aria-hidden="true">', index + 1, '</span>',
          '<code class="friends-code-text">', content, '</code>',
        '</span>'
      ].join('');
    }).join('');
  }

  function renderCodeCard(titleKey, copyKind, copyLabelKey, text) {
    return [
      '<div class="friends-code-card">',
        '<div class="friends-code-header">',
          '<div class="friends-code-title" data-social-friends-i18n="', escapeHTML(titleKey), '">',
            escapeHTML(t(titleKey)),
          '</div>',
          '<button',
            ' type="button"',
            ' class="friends-icon-button"',
            ' data-friends-copy="', escapeHTML(copyKind), '"',
            ' data-social-friends-aria="', escapeHTML(copyLabelKey), '"',
            ' aria-label="', escapeHTML(t(copyLabelKey)), '"',
            ' title="', escapeHTML(t(copyLabelKey)), '"',
            ' data-cursor="precise_select"',
            ' data-cursor-fallback="pointer"',
          '>',
            '<i class="fas fa-copy" aria-hidden="true"></i>',
          '</button>',
        '</div>',
        '<div class="friends-code" tabindex="0">',
          renderCodeLines(text),
        '</div>',
      '</div>'
    ].join('');
  }

  function renderArrowSVG() {
    return [
      '<svg',
        ' class="friend-avatar-arrow-svg"',
        ' xmlns="http://www.w3.org/2000/svg"',
        ' viewBox="0 0 24 24"',
        ' aria-hidden="true"',
        ' focusable="false"',
      '>',
        '<line class="friend-arrow-line" x1="5" y1="12" x2="19" y2="12"></line>',
        '<polyline class="friend-arrow-head" points="12 5 19 12 12 19"></polyline>',
      '</svg>'
    ].join('');
  }

  function renderFriendCard(item) {
    const title = item.title || '';
    const desc = item.desc || '';
    const url = item.siteurl || item.url || item.link || '#';
    const avatar = item.avatar || item.imgurl || '';
    const tag = item.tag || '';
    const openLabel = t('friends_open_site') + ': ' + title;

    const bgAvatar = avatar
      ? [
          '<img',
            ' class="friend-card-bg"',
            ' src="', escapeHTML(avatar), '"',
            ' alt=""',
            ' loading="lazy"',
            ' decoding="async"',
            ' aria-hidden="true"',
          '>'
        ].join('')
      : '';

    const avatarImg = avatar
      ? [
          '<img',
            ' class="friend-avatar"',
            ' src="', escapeHTML(avatar), '"',
            ' alt=""',
            ' loading="lazy"',
            ' decoding="async"',
          '>'
        ].join('')
      : '';

    return [
      '<a',
        ' class="friend-card"',
        ' href="', escapeHTML(url), '"',
        ' target="_blank"',
        ' rel="noopener noreferrer"',
        ' aria-label="', escapeHTML(openLabel), '"',
      '>',
        bgAvatar,

        '<span class="friend-card-inner">',
          '<span class="friend-avatar-wrap">',
            '<span class="friend-avatar-shell" aria-hidden="true">',
              '<span class="friend-avatar-fallback">', escapeHTML(firstLetter(title)), '</span>',
              avatarImg,
              '<span class="friend-avatar-overlay">',
                renderArrowSVG(),
              '</span>',
            '</span>',
          '</span>',

          '<span class="friend-card-body">',
            '<span class="friend-title">', escapeHTML(title), '</span>',
            '<span class="friend-desc">', escapeHTML(desc), '</span>',
            tag
              ? '<span class="friend-tag">' + escapeHTML(tag) + '</span>'
              : '',
          '</span>',
        '</span>',
      '</a>'
    ].join('');
  }

  function renderFriendsGrid() {
    const data = getData();
    const friends = Array.isArray(data.friends) ? data.friends : [];

    if (!friends.length) {
      return [
        '<div class="friends-empty" data-social-friends-i18n="friends_empty">',
          escapeHTML(t('friends_empty')),
        '</div>'
      ].join('');
    }

    return [
      '<div class="friends-grid">',
        friends.map(renderFriendCard).join(''),
      '</div>'
    ].join('');
  }

  function renderSiteInfoPanel() {
    const data = getData();

    return [
      '<div class="friends-panel friends-site-info-panel">',
        '<div class="friends-panel-header">',
          '<div>',
            '<h3 data-social-friends-i18n="friends_site_info_title">',
              escapeHTML(t('friends_site_info_title')),
            '</h3>',
            '<p data-social-friends-i18n="friends_site_info_desc">',
              escapeHTML(t('friends_site_info_desc')),
            '</p>',
          '</div>',
        '</div>',

        renderCodeCard(
          'friends_site_info_title',
          'siteInfo',
          'friends_copy_site_info',
          data.mySiteInfo || ''
        ),
      '</div>'
    ].join('');
  }

  function renderApplyPanel() {
    const data = getData();
    const email = data.email || '';
    const mailto = getMailtoHref();

    return [
      '<div class="friends-panel friends-apply-panel">',
        '<div class="friends-panel-header">',
          '<div>',
            '<h3 data-social-friends-i18n="friends_apply_title">',
              escapeHTML(t('friends_apply_title')),
            '</h3>',
            '<p data-social-friends-i18n="friends_apply_desc">',
              escapeHTML(t('friends_apply_desc')),
            '</p>',
          '</div>',
        '</div>',

        '<div class="friends-email-line">',
          '<span class="friends-email-label" data-social-friends-i18n="friends_email_label">',
            escapeHTML(t('friends_email_label')),
          '</span>',
          '<a class="friends-email-address" href="mailto:', escapeHTML(email), '">',
            escapeHTML(email),
          '</a>',
          '<span class="friends-email-actions">',
            '<button',
              ' type="button"',
              ' class="friends-icon-button"',
              ' data-friends-copy="email"',
              ' data-social-friends-aria="friends_copy_email"',
              ' aria-label="', escapeHTML(t('friends_copy_email')), '"',
              ' title="', escapeHTML(t('friends_copy_email')), '"',
              ' data-cursor="precise_select"',
              ' data-cursor-fallback="pointer"',
            '>',
              '<i class="fas fa-copy" aria-hidden="true"></i>',
            '</button>',
            '<a',
              ' class="friends-icon-button"',
              ' href="', escapeHTML(mailto), '"',
              ' data-social-friends-aria="friends_send_email"',
              ' aria-label="', escapeHTML(t('friends_send_email')), '"',
              ' title="', escapeHTML(t('friends_send_email')), '"',
            '>',
              '<i class="fas fa-paper-plane" aria-hidden="true"></i>',
            '</a>',
          '</span>',
        '</div>',

        renderCodeCard(
          'friends_template_title',
          'template',
          'friends_copy_template',
          data.requestTemplate || ''
        ),
      '</div>'
    ].join('');
  }

  function renderModuleHTML() {
    return [
      '<section id="', ROOT_ID, '" class="stats-block friends-block" aria-labelledby="social-friends-title">',
        '<div class="stats-subtitle friends-title-row">',
          '<span id="social-friends-title" data-social-friends-i18n="friends_heading">',
            escapeHTML(t('friends_heading')),
          '</span>',
        '</div>',

        renderIntro(),

        renderFriendsGrid(),

        '<div class="friends-panels">',
          renderSiteInfoPanel(),
          renderApplyPanel(),
        '</div>',
      '</section>',

      '<div class="stats-sep social-friends-sep" aria-hidden="true"></div>'
    ].join('');
  }

  function applyI18N(root) {
    if (!root) return;

    root.querySelectorAll('[data-social-friends-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-social-friends-i18n');
      if (!key) return;

      const value = t(key);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });

    root.querySelectorAll('[data-social-friends-aria]').forEach(function (el) {
      if (el.classList && el.classList.contains('is-copied')) return;

      const key = el.getAttribute('data-social-friends-aria');
      if (!key) return;

      const value = t(key);
      if (typeof value === 'string') {
        el.setAttribute('aria-label', value);
        el.setAttribute('title', value);
      }
    });
  }

  function getCopyText(kind) {
    const data = getData();

    if (kind === 'email') {
      return data.email || '';
    }

    if (kind === 'template') {
      return data.requestTemplate || '';
    }

    if (kind === 'siteInfo') {
      return data.mySiteInfo || '';
    }

    return '';
  }

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      if (!document.body) {
        reject(new Error('document.body is not available'));
        return;
      }

      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      textarea.style.opacity = '0';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (ok) {
          resolve();
        } else {
          reject(new Error('document.execCommand("copy") returned false'));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return fallbackCopy(text);
  }

  function setButtonState(btn, ok) {
    if (!btn) return;

    const icon = btn.querySelector('i');

    if (icon && !btn.dataset.originalIconClass) {
      btn.dataset.originalIconClass = icon.className;
    }

    if (btn.dataset.copyTimer) {
      window.clearTimeout(Number(btn.dataset.copyTimer));
      btn.dataset.copyTimer = '';
    }

    btn.classList.add(ok ? 'is-copied' : 'is-copy-failed');

    if (icon) {
      icon.className = ok ? 'fas fa-check' : 'fas fa-exclamation-triangle';
    }

    const label = ok ? t('friends_copied') : t('friends_copy_failed');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);

    const timer = window.setTimeout(function () {
      btn.classList.remove('is-copied', 'is-copy-failed');

      if (icon && btn.dataset.originalIconClass) {
        icon.className = btn.dataset.originalIconClass;
      }

      const key = btn.getAttribute('data-social-friends-aria');
      if (key) {
        const restored = t(key);
        btn.setAttribute('aria-label', restored);
        btn.setAttribute('title', restored);
      }

      btn.dataset.copyTimer = '';
    }, COPY_RESET_MS);

    btn.dataset.copyTimer = String(timer);
  }

  function bindActions(root) {
    if (!root || root.dataset.friendsBound === '1') return;

    root.addEventListener('click', function (event) {
      const btn = event.target.closest('[data-friends-copy]');
      if (!btn || !root.contains(btn)) return;

      event.preventDefault();

      const kind = btn.getAttribute('data-friends-copy');
      const text = getCopyText(kind);

      copyToClipboard(text)
        .then(function () {
          setButtonState(btn, true);
        })
        .catch(function () {
          setButtonState(btn, false);
        });
    });

    root.dataset.friendsBound = '1';
  }

  function refreshCursor(root) {
    if (!root) return;

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function insertModule() {
    const social = document.getElementById('social');
    if (!social) return null;

    let root = document.getElementById(ROOT_ID);

    if (!root) {
      const guestbook = social.querySelector('#guestbook');
      const statsContainer = social.querySelector('.stats-container') || social;
      const html = renderModuleHTML();

      if (guestbook && guestbook.parentNode) {
        guestbook.insertAdjacentHTML('beforebegin', html);
      } else {
        statsContainer.insertAdjacentHTML('beforeend', html);
      }

      root = document.getElementById(ROOT_ID);
    }

    bindActions(root);
    applyI18N(root);
    refreshCursor(root);

    return root;
  }

  function initWithRetry() {
    const root = insertModule();
    if (root) return root;

    if (retryCount < 20) {
      retryCount += 1;
      window.setTimeout(initWithRetry, 100);
    }

    return null;
  }

  function handleLangChange() {
    applyI18N(document.getElementById(ROOT_ID));
  }

  window.SocialFriends = {
    init: insertModule,
    refresh: insertModule
  };

  window.addEventListener('site:langchange', handleLangChange);

  window.addEventListener('site:pageassetsloaded', function (event) {
    const detail = event && event.detail ? event.detail : {};
    if (detail.page === 'social') {
      initWithRetry();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithRetry);
  } else {
    initWithRetry();
  }
})();