(function () {
  'use strict';

  const ROOT_ID = 'profile';
  const MOUNT_ID = 'mount-about-profile';

  const EXPANDABLE_WARMUP_DELAY = 650;
  const EXPANDABLE_STAGGER_MS = 70;
  const HERO_TIMEOUT = 1400;

  const preloadedImages = Object.create(null);

  let expandableWarmupTimer = 0;
  let pendingLang = null;
  let activeImageLightbox = null;
  let activeImageTrigger = null;

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
    ) ? 'zh' : 'en';
  }

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();

    return (
      value === 'zh' ||
      value.startsWith('zh-')
    ) ? 'zh' : 'en';
  }

  function getTemplate(lang) {
    const normalized = normalizeLang(lang);

    if (normalized === 'zh') {
      return (
        typeof window.PROFILE_ZH_INNER_HTML === 'string' &&
        window.PROFILE_ZH_INNER_HTML.trim()
      )
        ? window.PROFILE_ZH_INNER_HTML
        : '';
    }

    return (
      typeof window.PROFILE_EN_INNER_HTML === 'string' &&
      window.PROFILE_EN_INNER_HTML.trim()
    )
      ? window.PROFILE_EN_INNER_HTML
      : '';
  }

  function getMount() {
    return document.getElementById(MOUNT_ID);
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function ensureRoot() {
    let root = getRoot();

    if (root) return root;

    if (
      window.About &&
      typeof window.About.init === 'function'
    ) {
      window.About.init();
    }

    const mount = getMount();

    if (!mount) {
      console.warn(
        '[ProfileRender] The Profile mount is unavailable.'
      );

      return null;
    }

    root = document.createElement('div');
    root.id = ROOT_ID;
    mount.appendChild(root);

    return root;
  }

  function getExpanders() {
    return (
      window.ContentExpanders ||
      null
    );
  }

  function getOpenKeys(root) {
    const expanders = getExpanders();

    if (
      expanders &&
      typeof expanders.getOpenKeys === 'function'
    ) {
      return expanders.getOpenKeys(
        root || document
      );
    }

    return [];
  }

  function initExpanders(root, openKeys) {
    const expanders = getExpanders();

    if (
      !root ||
      !expanders ||
      typeof expanders.init !== 'function'
    ) {
      return;
    }

    expanders.init(root, {
      openKeys:
        Array.isArray(openKeys)
          ? openKeys
          : []
    });
  }

  function refreshRuntimeFeatures(root) {
    if (
      window.Theme &&
      typeof window.Theme.init === 'function'
    ) {
      window.Theme.init();
    }

    if (
      window.Clock &&
      typeof window.Clock.updateClock ===
        'function'
    ) {
      window.Clock.updateClock();
    }

    if (
      window.ProfileContact &&
      typeof window.ProfileContact.init ===
        'function'
    ) {
      window.ProfileContact.init();
    }

    if (
      root &&
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh ===
        'function'
    ) {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function setFetchPriority(element, priority) {
    if (!element || !priority) return;

    element.setAttribute(
      'fetchpriority',
      priority
    );

    try {
      element.fetchPriority = priority;
    } catch (error) {}
  }

  function getImageSource(image) {
    if (!image) return '';

    return (
      image.currentSrc ||
      image.getAttribute('src') ||
      image.getAttribute('data-src') ||
      ''
    );
  }

  function normalizeImageUrl(src) {
    if (!src) return '';

    try {
      return new URL(
        src,
        document.baseURI
      ).href;
    } catch (error) {
      return src;
    }
  }

  function preloadImage(src, priority) {
    const url = normalizeImageUrl(src);

    if (!url) {
      return Promise.resolve(false);
    }

    if (preloadedImages[url]) {
      return preloadedImages[url];
    }

    const image = new Image();

    image.decoding = 'async';
    image.loading = 'eager';

    try {
      image.fetchPriority =
        priority || 'high';
    } catch (error) {}

    const promise = new Promise((resolve) => {
      image.onload = () => {
        if (
          typeof image.decode === 'function'
        ) {
          image.decode()
            .then(() => resolve(true))
            .catch(() => resolve(true));

          return;
        }

        resolve(true);
      };

      image.onerror = () => resolve(false);
      image.src = url;
    });

    preloadedImages[url] = promise;

    return promise;
  }

  function optimizeImages(root) {
    if (!root) return;

    root.querySelectorAll('img').forEach((image) => {
      if (!image.hasAttribute('decoding')) {
        image.setAttribute(
          'decoding',
          'async'
        );
      }

      const isHero = !!image.closest(
        '.profile-hero-avatar'
      );

      const isExpandable = !!image.closest(
        '.expand-row, .expand-content'
      );

      if (isHero) {
        image.setAttribute(
          'loading',
          'eager'
        );

        setFetchPriority(image, 'high');
        return;
      }

      if (isExpandable) {
        image.setAttribute(
          'loading',
          'lazy'
        );

        setFetchPriority(image, 'low');
        return;
      }

      if (!image.hasAttribute('loading')) {
        image.setAttribute(
          'loading',
          'lazy'
        );
      }
    });
  }

  function promoteImages(images, priority) {
    const list = Array.from(images || []);
    const nextPriority = priority || 'high';

    list.forEach((image) => {
      const src = getImageSource(image);

      if (!src) return;

      image.setAttribute(
        'loading',
        'eager'
      );

      image.setAttribute(
        'decoding',
        'async'
      );

      setFetchPriority(
        image,
        nextPriority
      );

      preloadImage(
        src,
        nextPriority
      );
    });
  }

  function preloadExpandableTarget(button) {
    if (!button) return;

    const targetId = button.getAttribute(
      'data-expand-target'
    );

    if (!targetId) return;

    const row =
      document.getElementById(targetId);

    if (!row) return;

    promoteImages(
      row.querySelectorAll('img[src]'),
      'high'
    );
  }

  function bindExpandableImageIntent(root) {
    if (!root) return;

    root
      .querySelectorAll(
        'button.expander[data-expand-target]'
      )
      .forEach((button) => {
        if (
          button.dataset
            .profileImageWarmupBound === '1'
        ) {
          return;
        }

        button.dataset
          .profileImageWarmupBound = '1';

        const warm = () => {
          preloadExpandableTarget(button);
        };

        button.addEventListener(
          'pointerenter',
          warm,
          { passive: true }
        );

        button.addEventListener(
          'focus',
          warm
        );

        button.addEventListener(
          'touchstart',
          warm,
          { passive: true }
        );

        button.addEventListener(
          'pointerdown',
          warm,
          { capture: true }
        );
      });
  }

  function getImagePreviewLabel(image) {
    const alt = String(
      image && image.getAttribute('alt')
        ? image.getAttribute('alt')
        : ''
    ).trim();

    if (getLang() === 'zh') {
      return alt
        ? '放大查看' + alt
        : '放大查看图片';
    }

    return alt
      ? 'Preview ' + alt
      : 'Preview image';
  }

  function getLightboxCloseLabel() {
    return getLang() === 'zh'
      ? '关闭图片预览'
      : 'Close image preview';
  }

  function handleImageLightboxKeydown(event) {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    closeImageLightbox();
  }

  function closeImageLightbox(options) {
    const opts = options || {};
    const trigger = activeImageTrigger;

    if (activeImageLightbox) {
      activeImageLightbox.remove();
    }

    activeImageLightbox = null;
    activeImageTrigger = null;

    document.removeEventListener(
      'keydown',
      handleImageLightboxKeydown
    );

    if (
      opts.restoreFocus !== false &&
      trigger &&
      trigger.isConnected &&
      typeof trigger.focus === 'function'
    ) {
      try {
        trigger.focus({ preventScroll: true });
      } catch (error) {
        trigger.focus();
      }
    }
  }

  function openImageLightbox(trigger) {
    if (!trigger) return;

    const image = trigger.querySelector('img[src]');
    const src = normalizeImageUrl(
      getImageSource(image)
    );

    if (!image || !src) return;

    closeImageLightbox({
      restoreFocus: false
    });

    const box = document.createElement('div');
    box.className = 'profile-image-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute(
      'aria-label',
      getImagePreviewLabel(image)
    );

    const closeButton =
      document.createElement('button');

    closeButton.className =
      'profile-image-lightbox-close';
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute(
      'aria-label',
      getLightboxCloseLabel()
    );
    closeButton.setAttribute(
      'data-cursor',
      'precise_select'
    );
    closeButton.setAttribute(
      'data-cursor-fallback',
      'pointer'
    );

    const previewImage =
      document.createElement('img');

    previewImage.src = src;
    previewImage.alt =
      image.getAttribute('alt') || '';
    previewImage.decoding = 'async';

    box.appendChild(closeButton);
    box.appendChild(previewImage);

    box.addEventListener('click', (event) => {
      if (
        event.target === box ||
        event.target === closeButton
      ) {
        closeImageLightbox();
      }
    });

    activeImageLightbox = box;
    activeImageTrigger = trigger;

    document.body.appendChild(box);
    document.addEventListener(
      'keydown',
      handleImageLightboxKeydown
    );

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh ===
        'function'
    ) {
      window.CustomCursorAPI.refresh(box);
    }

    try {
      closeButton.focus({ preventScroll: true });
    } catch (error) {
      closeButton.focus();
    }
  }

  function decorateExpandableImagePreview(image) {
    if (!image) return null;

    const trigger = image.closest('.expand-item');
    const src = getImageSource(image);

    if (!trigger || !src) return null;

    trigger.classList.add(
      'profile-image-preview'
    );

    trigger.setAttribute(
      'data-profile-image-preview',
      src
    );
    trigger.setAttribute(
      'data-cursor',
      'precise_select'
    );
    trigger.setAttribute(
      'data-cursor-fallback',
      'pointer'
    );
    trigger.setAttribute(
      'role',
      'button'
    );
    trigger.setAttribute(
      'tabindex',
      '0'
    );
    trigger.setAttribute(
      'aria-label',
      getImagePreviewLabel(image)
    );

    if (
      trigger.tagName &&
      trigger.tagName.toLowerCase() === 'a'
    ) {
      trigger.removeAttribute('href');
      trigger.removeAttribute('target');
      trigger.removeAttribute('rel');
      trigger.removeAttribute('download');
    }

    return trigger;
  }

  function bindExpandableImagePreviews(root) {
    if (!root) return;

    root.querySelectorAll(
      '.expand-row .expand-content ' +
      '.expand-item img[src]'
    ).forEach((image) => {
      decorateExpandableImagePreview(image);
    });

    if (
      root.dataset.profileImagePreviewBound === '1'
    ) {
      return;
    }

    root.dataset.profileImagePreviewBound = '1';

    root.addEventListener('click', (event) => {
      const trigger = event.target.closest(
        '[data-profile-image-preview]'
      );

      if (!trigger || !root.contains(trigger)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openImageLightbox(trigger);
    });

    root.addEventListener('keydown', (event) => {
      if (
        event.key !== 'Enter' &&
        event.key !== ' ' &&
        event.key !== 'Spacebar'
      ) {
        return;
      }

      const trigger = event.target.closest(
        '[data-profile-image-preview]'
      );

      if (!trigger || !root.contains(trigger)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openImageLightbox(trigger);
    });
  }

  function shouldAvoidBackgroundWarmup() {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      null;

    if (!connection) return false;
    if (connection.saveData) return true;

    const type = String(
      connection.effectiveType || ''
    ).toLowerCase();

    return (
      type === 'slow-2g' ||
      type === '2g'
    );
  }

  function isProfileActive() {
    if (
      window.About &&
      typeof window.About.getCurrentView ===
        'function'
    ) {
      return (
        window.About.getCurrentView() ===
        'profile'
      );
    }

    return true;
  }

  function scheduleExpandableWarmup(
    root,
    options
  ) {
    const opts = options || {};

    if (!root || !isProfileActive()) return;

    if (
      !opts.force &&
      shouldAvoidBackgroundWarmup()
    ) {
      return;
    }

    if (expandableWarmupTimer) {
      window.clearTimeout(
        expandableWarmupTimer
      );

      expandableWarmupTimer = 0;
    }

    const delay =
      Number.isFinite(Number(opts.delay))
        ? Math.max(0, Number(opts.delay))
        : EXPANDABLE_WARMUP_DELAY;

    expandableWarmupTimer =
      window.setTimeout(() => {
        expandableWarmupTimer = 0;

        if (!isProfileActive()) return;

        const images = root.querySelectorAll(
          '.expand-row img[src], ' +
          '.expand-content img[src]'
        );

        images.forEach((image, index) => {
          window.setTimeout(() => {
            promoteImages([image], 'high');
          }, index * EXPANDABLE_STAGGER_MS);
        });
      }, delay);
  }

  function render(lang, options) {
    const normalized = normalizeLang(
      lang ||
      pendingLang ||
      getLang()
    );

    const opts = options || {};
    const root = ensureRoot();

    if (!root) return null;

    const template = getTemplate(normalized);

    if (!template) {
      console.warn(
        `[ProfileRender] The ${normalized.toUpperCase()} Profile template is unavailable.`
      );

      return root;
    }

    const alreadyRendered =
      root.dataset.renderedLang ===
        normalized &&
      root.innerHTML.trim();

    if (
      !alreadyRendered ||
      opts.force === true
    ) {
      const openKeys =
        Array.isArray(opts.openKeys)
          ? opts.openKeys
          : getOpenKeys(root);

      closeImageLightbox({
        restoreFocus: false
      });

      root.innerHTML = template;

      root.dataset.renderedLang =
        normalized;

      root.dataset.profileRendered = '1';

      optimizeImages(root);
      bindExpandableImageIntent(root);
      bindExpandableImagePreviews(root);
      initExpanders(root, openKeys);
      refreshRuntimeFeatures(root);
    }

    pendingLang = null;

    return root;
  }

  function enter() {
    const root = render(getLang());

    if (!root) return null;

    optimizeImages(root);
    bindExpandableImageIntent(root);
    bindExpandableImagePreviews(root);

    scheduleExpandableWarmup(root, {
      delay: EXPANDABLE_WARMUP_DELAY
    });

    return root;
  }

  function waitForImageReady(
    image,
    timeout
  ) {
    if (!image) {
      return Promise.resolve(false);
    }

    const timeoutMs = Math.max(
      0,
      Number(timeout) || HERO_TIMEOUT
    );

    if (
      image.complete &&
      image.naturalWidth > 0
    ) {
      if (
        typeof image.decode === 'function'
      ) {
        return image.decode()
          .then(() => true)
          .catch(() => true);
      }

      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      let settled = false;
      let timer = 0;

      function done(value) {
        if (settled) return;

        settled = true;

        image.removeEventListener(
          'load',
          handleLoad
        );

        image.removeEventListener(
          'error',
          handleError
        );

        if (timer) {
          window.clearTimeout(timer);
        }

        resolve(value);
      }

      function handleLoad() {
        if (
          typeof image.decode === 'function'
        ) {
          image.decode()
            .then(() => done(true))
            .catch(() => done(true));

          return;
        }

        done(true);
      }

      function handleError() {
        done(false);
      }

      image.addEventListener(
        'load',
        handleLoad,
        { once: true }
      );

      image.addEventListener(
        'error',
        handleError,
        { once: true }
      );

      timer = window.setTimeout(() => {
        done(
          image.complete &&
          image.naturalWidth > 0
        );
      }, timeoutMs);
    });
  }

  function isDirectArchiveRoute() {
    if (
      window.AboutRoutes &&
      typeof window.AboutRoutes
        .resolveViewFromPath === 'function'
    ) {
      return (
        window.AboutRoutes.resolveViewFromPath(
          window.location.pathname
        ) === 'archive'
      );
    }

    return /\/about\/archive(?:\/|$)/.test(
      window.location.pathname
    );
  }

  function waitForCriticalImages(options) {
    if (isDirectArchiveRoute()) {
      return Promise.resolve(false);
    }

    const opts = options || {};
    const root = render(getLang());

    if (!root) {
      return Promise.resolve(false);
    }

    const avatar = root.querySelector(
      '.profile-hero-avatar img'
    );

    if (!avatar) {
      return Promise.resolve(false);
    }

    avatar.setAttribute(
      'loading',
      'eager'
    );

    avatar.setAttribute(
      'decoding',
      'async'
    );

    setFetchPriority(avatar, 'high');

    return waitForImageReady(
      avatar,
      opts.timeout || HERO_TIMEOUT
    ).then((ready) => {
      scheduleExpandableWarmup(root, {
        delay: ready ? 120 : 900
      });

      return ready;
    });
  }

  function handleLanguageChange(event) {
    if (
      event &&
      event.detail &&
      event.detail.scheduleExportOnly === true
    ) {
      return;
    }

    const lang = normalizeLang(
      event && event.detail
        ? event.detail.lang
        : getLang()
    );

    const openKeys =
      event &&
      event.detail &&
      Array.isArray(event.detail.openKeys)
        ? event.detail.openKeys
        : null;

    const about = document.getElementById('about');

    if (!about) {
      pendingLang = lang;
      return;
    }

    if (
      !about.classList.contains('visible') ||
      !isProfileActive()
    ) {
      pendingLang = lang;
      return;
    }

    render(lang, {
      force: true,
      openKeys
    });
  }

  const api = {
    render,
    enter,
    optimizeImages,
    bindExpandableImageIntent,
    bindExpandableImagePreviews,
    scheduleExpandableWarmup,
    preloadExpandableTarget,
    waitForCriticalImages,
    closeImageLightbox
  };

  window.ProfileRender = api;
  window.addEventListener(
    'site:langchange',
    handleLanguageChange
  );
})();