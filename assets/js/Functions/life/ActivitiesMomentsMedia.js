(function () {
  'use strict';

  const IMAGE_WARMUP = {
    started: false,
    running: false,
    queue: [],
    seen: Object.create(null),
    active: 0,
    loaded: 0,
    failed: 0,
    concurrency: 3,
    gap: 80,
    timeout: 30000
  };

  function getUtils() {
    return window.ActivitiesMomentsUtils || null;
  }

  function collectGalleryImagesFromMoment(moment) {
    if (!moment || !Array.isArray(moment.gallery)) return [];

    return moment.gallery
      .map((src) => {
        if (typeof src === 'string') return src;
        if (src && typeof src === 'object' && src.src) return src.src;
        return '';
      })
      .filter(Boolean);
  }

  function collectAllGalleryImages() {
    const U = getUtils();
    if (!U) return [];

    const langs = ['en', 'zh'];
    const images = [];

    langs.forEach((lang) => {
      U.getDetailItems(lang).forEach((moment) => {
        images.push(...collectGalleryImagesFromMoment(moment));
      });
    });

    return images;
  }

  function preloadImage(src) {
    const U = getUtils();
    const abs = U ? U.normalizeAssetUrl(src) : '';

    if (!abs) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      let timer = null;

      function settle(ok) {
        if (settled) return;
        settled = true;

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        resolve(ok);
      }

      img.decoding = 'async';

      try {
        img.fetchPriority = 'low';
      } catch (e) {}

      img.onload = () => settle(true);
      img.onerror = () => settle(false);

      timer = window.setTimeout(() => {
        settle(false);
      }, IMAGE_WARMUP.timeout);

      img.src = abs;

      if (img.complete && img.naturalWidth > 0) {
        settle(true);
      }
    });
  }

  function scheduleImageWarmupPump() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        pumpImageWarmupQueue();
      }, { timeout: 1800 });
      return;
    }

    window.setTimeout(() => {
      pumpImageWarmupQueue();
    }, 250);
  }

  function pumpImageWarmupQueue() {
    if (!IMAGE_WARMUP.running) return;

    while (
      IMAGE_WARMUP.active < IMAGE_WARMUP.concurrency &&
      IMAGE_WARMUP.queue.length
    ) {
      const src = IMAGE_WARMUP.queue.shift();
      IMAGE_WARMUP.active += 1;

      preloadImage(src)
        .then((ok) => {
          if (ok) {
            IMAGE_WARMUP.loaded += 1;
          } else {
            IMAGE_WARMUP.failed += 1;
          }
        })
        .catch(() => {
          IMAGE_WARMUP.failed += 1;
        })
        .finally(() => {
          IMAGE_WARMUP.active -= 1;

          if (IMAGE_WARMUP.queue.length) {
            window.setTimeout(() => {
              pumpImageWarmupQueue();
            }, IMAGE_WARMUP.gap);
            return;
          }

          if (IMAGE_WARMUP.active === 0) {
            IMAGE_WARMUP.running = false;
          }
        });
    }
  }

  function startGalleryImageWarmup(reason) {
    const U = getUtils();

    if (!U || IMAGE_WARMUP.started) return;

    const sources = collectAllGalleryImages();
    const unique = [];

    sources.forEach((src) => {
      const abs = U.normalizeAssetUrl(src);
      if (!abs || IMAGE_WARMUP.seen[abs]) return;

      IMAGE_WARMUP.seen[abs] = true;
      unique.push(abs);
    });

    if (!unique.length) return;

    IMAGE_WARMUP.started = true;
    IMAGE_WARMUP.running = true;
    IMAGE_WARMUP.queue.push(...unique);

    try {
      window.dispatchEvent(new CustomEvent('activities:gallerywarmupstarted', {
        detail: {
          reason: reason || '',
          total: unique.length
        }
      }));
    } catch (e) {}

    scheduleImageWarmupPump();
  }

  function bindBackgroundWarmupEvents() {
    if (window.__activitiesMomentsWarmupEventsBound) return;
    window.__activitiesMomentsWarmupEventsBound = true;

    window.addEventListener('site:pagewarmuploaded', (event) => {
      const detail = event && event.detail ? event.detail : {};

      if (detail.page === 'life') {
        startGalleryImageWarmup('life-background-detail-warmup-finished');
      }
    });

    if (
      window.SiteResourceLoader &&
      typeof window.SiteResourceLoader.isPageWarmupLoaded === 'function' &&
      window.SiteResourceLoader.isPageWarmupLoaded('life')
    ) {
      startGalleryImageWarmup('life-background-detail-warmup-already-finished');
    }
  }

  function openLightbox(src) {
    const U = getUtils();

    if (!U || !src) return;

    closeLightbox();

    const ui = U.getUi();
    const box = document.createElement('div');
    box.className = 'am-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    box.innerHTML = `
      <button
        class="am-lightbox-close"
        type="button"
        aria-label="${U.escapeHtml(ui.close)}"
        data-cursor="precise_select"
        data-cursor-fallback="pointer"
      >×</button>
      <img src="${U.escapeHtml(src)}" alt="">
    `;

    box.addEventListener('click', (event) => {
      if (
        event.target === box ||
        event.target.classList.contains('am-lightbox-close')
      ) {
        closeLightbox();
      }
    });

    document.body.appendChild(box);
  }

  function closeLightbox() {
    const existing = document.querySelector('.am-lightbox');
    if (existing) existing.remove();
  }

  window.ActivitiesMomentsMedia = {
    collectGalleryImagesFromMoment,
    collectAllGalleryImages,
    preloadImage,
    startGalleryImageWarmup,
    bindBackgroundWarmupEvents,
    openLightbox,
    closeLightbox
  };
})();