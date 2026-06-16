(function () {
  'use strict';

  const ROOT_ID = 'resume';
  const MOUNT_ID = 'mount-resume';

  const SECONDARY_IMAGE_IDLE_TIMEOUT = 1200;
  const SECONDARY_IMAGE_START_DELAY = 480;
  const SECONDARY_IMAGE_STAGGER_MS = 180;
  const SECONDARY_IMAGE_FALLBACK_ENTER_DELAY = 1800;

  const preloadedSecondaryImages = Object.create(null);

  let mutationObserver = null;
  let optimizeRaf = 0;
  let secondaryWarmupTimer = 0;
  let secondaryWarmupStarted = false;

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

  function runWhenIdle(callback, timeout) {
    if (typeof callback !== 'function') return;

    const fallbackTimeout = Math.max(0, Number(timeout) || SECONDARY_IMAGE_IDLE_TIMEOUT);
    const loader = window.SiteResourceLoader;

    if (loader && typeof loader.idle === 'function') {
      loader.idle(callback, fallbackTimeout);
      return;
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, {
        timeout: fallbackTimeout
      });
      return;
    }

    window.setTimeout(callback, fallbackTimeout);
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

  function setFetchPriority(img, priority) {
    if (!img || !priority) return;

    img.setAttribute('fetchpriority', priority);

    try {
      img.fetchPriority = priority;
    } catch (e) {}
  }

  function preloadImageSrc(src, priority) {
    const url = normalizeImageUrl(src);

    if (!url) {
      return Promise.resolve(false);
    }

    if (preloadedSecondaryImages[url]) {
      return preloadedSecondaryImages[url].promise;
    }

    const image = new Image();
    const fetchPriority = priority || 'low';

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

        if (preloadedSecondaryImages[url]) {
          preloadedSecondaryImages[url].ready = value === true;
        }

        resolve(value);
      }

      image.onload = function () {
        if (fetchPriority === 'high' && typeof image.decode === 'function') {
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

    preloadedSecondaryImages[url] = {
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

  function preloadImages(images, priority, options) {
    const opts = options || {};
    const list = Array.isArray(images) ? images : [];
    const fetchPriority = priority || 'low';

    list.forEach((img) => {
      const src = getImageSource(img);

      if (!src) return;

      if (opts.promoteActualImage) {
        img.setAttribute('loading', 'eager');
        setFetchPriority(img, fetchPriority);
      }

      preloadImageSrc(src, fetchPriority);
    });
  }

  function preloadExpandableImagesSequentially(scope, options) {
    const opts = options || {};
    const force = opts.force === true;

    if (!force && shouldAvoidBackgroundImageWarmup()) {
      return;
    }

    const images = getExpandableImages(scope);

    if (!images.length) {
      return;
    }

    let index = 0;

    function step() {
      const img = images[index];

      if (!img) return;

      preloadImages([img], 'low', {
        promoteActualImage: false
      });

      index += 1;

      if (index < images.length) {
        window.setTimeout(() => {
          runWhenIdle(step, SECONDARY_IMAGE_IDLE_TIMEOUT);
        }, SECONDARY_IMAGE_STAGGER_MS);
      }
    }

    step();
  }

  function scheduleSecondaryAboutImageWarmup(scope, options) {
    const opts = options || {};
    const root = scope || getResumeRoot();

    if (!root) return;

    if (!opts.force && secondaryWarmupStarted) {
      return;
    }

    if (!opts.force && shouldAvoidBackgroundImageWarmup()) {
      return;
    }

    if (secondaryWarmupTimer) {
      if (opts.replace === true) {
        window.clearTimeout(secondaryWarmupTimer);
        secondaryWarmupTimer = 0;
      } else {
        return;
      }
    }

    const delay = Math.max(
      0,
      Number.isFinite(Number(opts.delay)) ? Number(opts.delay) : SECONDARY_IMAGE_START_DELAY
    );

    secondaryWarmupTimer = window.setTimeout(() => {
      secondaryWarmupTimer = 0;

      if (!opts.force && secondaryWarmupStarted) {
        return;
      }

      secondaryWarmupStarted = true;

      runWhenIdle(() => {
        preloadExpandableImagesSequentially(root, {
          force: opts.force === true
        });
      }, opts.idleTimeout || SECONDARY_IMAGE_IDLE_TIMEOUT);
    }, delay);
  }

  function getTargetRowFromButton(btn) {
    if (!btn) return null;

    const targetId = btn.getAttribute('data-expand-target');

    if (!targetId) return null;

    return document.getElementById(targetId);
  }

  function preloadExpandableTarget(btn, priority, options) {
    const row = getTargetRowFromButton(btn);

    if (!row) return;

    const images = qsAll('img[src]', row);

    if (!images.length) return;

    preloadImages(images, priority || 'high', options || {
      promoteActualImage: true
    });
  }

  function bindExpandableImageIntentWarmup(scope) {
    const root = scope || getResumeRoot();

    if (!root) return;

    qsAll('button.expander[data-expand-target]', root).forEach((btn) => {
      if (btn.dataset.aboutImageWarmupBound === '1') return;

      btn.dataset.aboutImageWarmupBound = '1';

      const warmByIntent = function () {
        preloadExpandableTarget(btn, 'high', {
          promoteActualImage: true
        });
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

    const timeoutMs = Math.max(0, Number(timeout) || 1400);

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

    return waitForImageReady(avatar, opts.timeout || 1400)
      .then((ready) => {
        scheduleSecondaryAboutImageWarmup(resume, {
          delay: ready ? 120 : 900,
          idleTimeout: SECONDARY_IMAGE_IDLE_TIMEOUT,
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

    scheduleSecondaryAboutImageWarmup(resume, {
      delay: SECONDARY_IMAGE_FALLBACK_ENTER_DELAY
    });
  }

  window.AboutResumeRender = {
    init,
    enter,
    renderEnglishResume,
    optimizeResumeImages,
    bindExpandableImageIntentWarmup,
    scheduleSecondaryAboutImageWarmup,
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

    secondaryWarmupStarted = false;

    scheduleImageOptimization(resume);
    scheduleSecondaryAboutImageWarmup(resume, {
      delay: 420,
      replace: true
    });
  });
})();