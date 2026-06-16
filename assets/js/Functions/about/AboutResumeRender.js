(function () {
  'use strict';

  const ROOT_ID = 'resume';
  const MOUNT_ID = 'mount-resume';

  const EXPANDABLE_IMAGE_START_DELAY = 120;
  const EXPANDABLE_IMAGE_ENTER_DELAY = 650;
  const EXPANDABLE_IMAGE_LANG_DELAY = 260;
  const EXPANDABLE_IMAGE_STAGGER_MS = 70;
  const HERO_TIMEOUT = 1400;

  const preloadedExpandableImages = Object.create(null);
  const preloadLinks = Object.create(null);

  let mutationObserver = null;
  let optimizeRaf = 0;
  let expandableWarmupTimer = 0;
  let expandableWarmupStarted = false;

  function getMount() {
    return document.getElementById(MOUNT_ID) || document.body;
  }

  function getResumeRoot() {
    return document.getElementById(ROOT_ID);
  }

  function ensureResumeRoot() {
    let resume = getResumeRoot();

    if (resume) {
      return resume;
    }

    const mount = getMount();
    resume = document.createElement('div');
    resume.id = ROOT_ID;
    mount.appendChild(resume);

    return resume;
  }

  function getEnglishTemplate() {
    if (
      typeof window.RESUME_EN_INNER_HTML === 'string' &&
      window.RESUME_EN_INNER_HTML.trim()
    ) {
      return window.RESUME_EN_INNER_HTML;
    }

    return '';
  }

  function qsAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getConnection() {
    return navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      null;
  }

  function shouldAvoidBackgroundImageWarmup() {
    const connection = getConnection();

    if (!connection) {
      return false;
    }

    if (connection.saveData) {
      return true;
    }

    const effectiveType = String(connection.effectiveType || '').toLowerCase();

    return effectiveType === 'slow-2g' || effectiveType === '2g';
  }

  function normalizeImageUrl(src) {
    if (!src || typeof src !== 'string') return '';

    try {
      return new URL(src, window.location.href).href;
    } catch (e) {
      return src;
    }
  }

  function getImageSource(img) {
    if (!img) return '';

    return img.currentSrc ||
      img.getAttribute('src') ||
      img.getAttribute('data-src') ||
      '';
  }

  function setFetchPriority(el, priority) {
    if (!el || !priority) return;

    el.setAttribute('fetchpriority', priority);

    try {
      el.fetchPriority = priority;
    } catch (e) {}
  }

  function ensureImagePreloadLink(src, priority) {
    const url = normalizeImageUrl(src);

    if (!url) {
      return null;
    }

    const fetchPriority = priority || 'high';

    if (preloadLinks[url]) {
      setFetchPriority(preloadLinks[url], fetchPriority);
      return preloadLinks[url];
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.dataset.aboutExpandablePreload = '1';

    setFetchPriority(link, fetchPriority);

    document.head.appendChild(link);
    preloadLinks[url] = link;

    return link;
  }

  function preloadImageSrc(src, priority) {
    const url = normalizeImageUrl(src);

    if (!url) {
      return Promise.resolve(false);
    }

    ensureImagePreloadLink(url, priority || 'high');

    if (preloadedExpandableImages[url]) {
      return preloadedExpandableImages[url].promise;
    }

    const image = new Image();
    const fetchPriority = priority || 'high';

    try {
      image.decoding = 'async';
    } catch (e) {}

    try {
      image.loading = 'eager';
    } catch (e) {}

    try {
      image.fetchPriority = fetchPriority;
    } catch (e) {}

    const promise = new Promise((resolve) => {
      let settled = false;

      function done(value) {
        if (settled) return;

        settled = true;

        if (preloadedExpandableImages[url]) {
          preloadedExpandableImages[url].ready = value === true;
        }

        resolve(value);
      }

      image.onload = function () {
        if (typeof image.decode === 'function') {
          image.decode()
            .then(() => done(true))
            .catch(() => done(true));
          return;
        }

        done(true);
      };

      image.onerror = function () {
        done(false);
      };

      image.src = url;
    });

    preloadedExpandableImages[url] = {
      promise,
      ready: false
    };

    return promise;
  }

  function getExpandableImages(scope) {
    const root = scope || getResumeRoot();

    if (!root) {
      return [];
    }

    return qsAll('.expand-row img[src], .expand-content img[src]', root);
  }

  function promoteImages(images, priority) {
    const list = Array.isArray(images) ? images : [];
    const fetchPriority = priority || 'high';

    list.forEach((img) => {
      const src = getImageSource(img);

      if (!src) return;

      img.setAttribute('loading', 'eager');
      img.setAttribute('decoding', 'async');
      setFetchPriority(img, fetchPriority);

      ensureImagePreloadLink(src, fetchPriority);
      preloadImageSrc(src, fetchPriority);
    });
  }

  function warmExpandableImagesNow(scope, options) {
    const opts = options || {};
    const root = scope || getResumeRoot();

    if (!root) return;

    if (!opts.force && shouldAvoidBackgroundImageWarmup()) {
      return;
    }

    const images = getExpandableImages(root);

    if (!images.length) {
      return;
    }

    images.forEach((img, index) => {
      window.setTimeout(() => {
        promoteImages([img], opts.priority || 'high');
      }, index * EXPANDABLE_IMAGE_STAGGER_MS);
    });
  }

  function scheduleExpandableImageWarmup(scope, options) {
    const opts = options || {};
    const root = scope || getResumeRoot();

    if (!root) return;

    if (!opts.force && expandableWarmupStarted) {
      return;
    }

    if (!opts.force && shouldAvoidBackgroundImageWarmup()) {
      return;
    }

    if (expandableWarmupTimer) {
      if (opts.replace === true) {
        window.clearTimeout(expandableWarmupTimer);
        expandableWarmupTimer = 0;
      } else {
        return;
      }
    }

    const delay = Math.max(
      0,
      Number.isFinite(Number(opts.delay)) ? Number(opts.delay) : EXPANDABLE_IMAGE_START_DELAY
    );

    expandableWarmupTimer = window.setTimeout(() => {
      expandableWarmupTimer = 0;

      if (!opts.force && expandableWarmupStarted) {
        return;
      }

      expandableWarmupStarted = true;

      warmExpandableImagesNow(root, {
        force: opts.force === true,
        priority: opts.priority || 'high'
      });
    }, delay);
  }

  function getTargetRowFromButton(btn) {
    if (!btn) return null;

    const targetId = btn.getAttribute('data-expand-target');

    if (!targetId) return null;

    return document.getElementById(targetId);
  }

  function preloadExpandableTarget(btn, priority) {
    const row = getTargetRowFromButton(btn);

    if (!row) return;

    const images = qsAll('img[src]', row);

    if (!images.length) return;

    promoteImages(images, priority || 'high');
  }

  function bindExpandableImageIntentWarmup(scope) {
    const root = scope || getResumeRoot();

    if (!root) return;

    qsAll('button.expander[data-expand-target]', root).forEach((btn) => {
      if (btn.dataset.aboutImageWarmupBound === '1') return;

      btn.dataset.aboutImageWarmupBound = '1';

      const warmByIntent = function () {
        preloadExpandableTarget(btn, 'high');
      };

      btn.addEventListener('pointerenter', warmByIntent);
      btn.addEventListener('focus', warmByIntent);
      btn.addEventListener('touchstart', warmByIntent, { passive: true });
      btn.addEventListener('pointerdown', warmByIntent, { capture: true });

      btn.addEventListener('keydown', function (e) {
        const key = e && e.key;

        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
          warmByIntent();
        }
      }, { capture: true });
    });
  }

  function optimizeResumeImages(scope) {
    const root = scope || getResumeRoot();
    if (!root) return;

    const images = Array.from(root.querySelectorAll('img'));

    images.forEach((img) => {
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      const isHeroAvatar = !!img.closest('.resume-hero-avatar');
      const isExpandableImage = !!img.closest('.expand-row, .expand-content');

      if (isHeroAvatar) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');

        try {
          img.fetchPriority = 'high';
        } catch (e) {}

        return;
      }

      if (isExpandableImage) {
        if (img.getAttribute('loading') !== 'eager') {
          img.setAttribute('loading', 'lazy');
        }

        const currentPriority = img.getAttribute('fetchpriority');

        if (!currentPriority || currentPriority === 'auto') {
          setFetchPriority(img, 'low');
        }

        return;
      }

      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function scheduleImageOptimization(scope) {
    if (optimizeRaf) {
      cancelAnimationFrame(optimizeRaf);
    }

    optimizeRaf = requestAnimationFrame(() => {
      optimizeRaf = 0;
      optimizeResumeImages(scope);
      bindExpandableImageIntentWarmup(scope);
    });
  }

  function observeResumeChanges(resume) {
    if (!resume || mutationObserver) return;

    mutationObserver = new MutationObserver(() => {
      scheduleImageOptimization(resume);
    });

    mutationObserver.observe(resume, {
      childList: true,
      subtree: true
    });
  }

  function renderEnglishResume() {
    const resume = ensureResumeRoot();

    if (!resume) {
      return null;
    }

    if (!resume.innerHTML.trim()) {
      const html = getEnglishTemplate();

      if (!html) {
        console.warn('[AboutResumeRender] RESUME_EN_INNER_HTML is empty or unavailable.');
        return resume;
      }

      resume.innerHTML = html;
      resume.dataset.renderedLang = 'en';
      resume.dataset.aboutRendered = '1';
    }

    observeResumeChanges(resume);
    optimizeResumeImages(resume);
    bindExpandableImageIntentWarmup(resume);

    return resume;
  }

  function waitForImageReady(img, timeout) {
    if (!img) return Promise.resolve(false);

    const timeoutMs = Math.max(0, Number(timeout) || HERO_TIMEOUT);

    if (img.complete && img.naturalWidth > 0) {
      if (typeof img.decode === 'function') {
        return img.decode()
          .then(() => true)
          .catch(() => true);
      }

      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      let settled = false;
      let timer = null;

      function cleanup() {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
      }

      function done(value) {
        if (settled) return;

        settled = true;
        cleanup();
        resolve(value);
      }

      function handleLoad() {
        if (typeof img.decode === 'function') {
          img.decode()
            .then(() => done(true))
            .catch(() => done(true));
          return;
        }

        done(true);
      }

      function handleError() {
        done(false);
      }

      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });

      if (timeoutMs > 0) {
        timer = window.setTimeout(() => {
          done(img.complete && img.naturalWidth > 0);
        }, timeoutMs);
      }
    });
  }

  function waitForCriticalImages(options) {
    const opts = options || {};
    const resume = renderEnglishResume();

    if (!resume) return Promise.resolve(false);

    const avatar = resume.querySelector('.resume-hero-avatar img');

    if (!avatar) return Promise.resolve(false);

    avatar.setAttribute('loading', 'eager');
    avatar.setAttribute('fetchpriority', 'high');
    avatar.setAttribute('decoding', 'async');

    try {
      avatar.fetchPriority = 'high';
    } catch (e) {}

    return waitForImageReady(avatar, opts.timeout || HERO_TIMEOUT)
      .then((ready) => {
        scheduleExpandableImageWarmup(resume, {
          delay: ready ? EXPANDABLE_IMAGE_START_DELAY : 900,
          priority: 'high',
          replace: true
        });

        return ready;
      });
  }

  function init() {
    const resume = renderEnglishResume();

    if (resume && window.ResumeExpanders && typeof window.ResumeExpanders.init === 'function') {
      window.ResumeExpanders.init(resume);
    }

    if (resume && window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(resume);
    }
  }

  function enter() {
    const resume = renderEnglishResume();

    if (!resume) return;

    optimizeResumeImages(resume);
    bindExpandableImageIntentWarmup(resume);

    scheduleExpandableImageWarmup(resume, {
      delay: EXPANDABLE_IMAGE_ENTER_DELAY,
      priority: 'high'
    });
  }

  window.AboutResumeRender = {
    init,
    enter,
    renderEnglishResume,
    optimizeResumeImages,
    bindExpandableImageIntentWarmup,
    scheduleExpandableImageWarmup,
    preloadExpandableTarget,
    waitForCriticalImages
  };

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('resume', {
      init() {
        init();
      },

      enter() {
        enter();
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

  window.addEventListener('site:langchange', () => {
    const resume = getResumeRoot();

    expandableWarmupStarted = false;

    scheduleImageOptimization(resume);
    scheduleExpandableImageWarmup(resume, {
      delay: EXPANDABLE_IMAGE_LANG_DELAY,
      priority: 'high',
      replace: true
    });
  });
})();