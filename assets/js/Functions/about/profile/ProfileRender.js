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
    return String(lang || '').toLowerCase() === 'zh'
      ? 'zh'
      : 'en';
  }

  function getTemplate(lang) {
    const normalized = normalizeLang(lang);

    if (normalized === 'zh') {
      if (
        typeof window.PROFILE_ZH_INNER_HTML ===
          'string' &&
        window.PROFILE_ZH_INNER_HTML.trim()
      ) {
        return window.PROFILE_ZH_INNER_HTML;
      }

      /*
        仅用于迁移期间兼容。
        两个内容文件完成变量改名后不会进入这里。
      */
      if (
        typeof window.RESUME_ZH_INNER_HTML ===
          'string' &&
        window.RESUME_ZH_INNER_HTML.trim()
      ) {
        return window.RESUME_ZH_INNER_HTML;
      }

      return '';
    }

    if (
      typeof window.PROFILE_EN_INNER_HTML ===
        'string' &&
      window.PROFILE_EN_INNER_HTML.trim()
    ) {
      return window.PROFILE_EN_INNER_HTML;
    }

    /*
      仅用于迁移期间兼容。
      两个内容文件完成变量改名后不会进入这里。
    */
    if (
      typeof window.RESUME_EN_INNER_HTML ===
        'string' &&
      window.RESUME_EN_INNER_HTML.trim()
    ) {
      return window.RESUME_EN_INNER_HTML;
    }

    return '';
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
      window.ResumeExpanders ||
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
        '.resume-hero-avatar'
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

      root.innerHTML = template;

      root.dataset.renderedLang =
        normalized;

      root.dataset.profileRendered = '1';

      optimizeImages(root);
      bindExpandableImageIntent(root);
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
      '.resume-hero-avatar img'
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

    if (
      !document.getElementById('about')
    ) {
      pendingLang = lang;
      return;
    }

    if (!isProfileActive()) {
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
    scheduleExpandableWarmup,
    preloadExpandableTarget,
    waitForCriticalImages
  };

  window.ProfileRender = api;

  /*
    Bootstrap.js 目前仍通过 AboutResumeRender
    调用非阻塞头像预热。保留兼容别名可以避免修改
    与本次模块拆分无关的 Bootstrap 主体。
  */
  window.AboutResumeRender = api;

  window.addEventListener(
    'site:langchange',
    handleLanguageChange
  );
})();