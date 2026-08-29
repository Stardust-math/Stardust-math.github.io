(function () {
  'use strict';

  const CONFIG = {
    stylesheet: './assets/css/components/site-footer-label.css',

    repositoryApi: 'https://api.github.com/repos/Stardust-math/Stardust-math.github.io',
    githubProfile: 'https://github.com/Stardust-math',
    orcidProfile: 'https://orcid.org/0009-0009-1961-6829',
    orcidIcon: 'https://orcid.org/sites/default/files/images/orcid_16x16.png',

    copyright: 'Copyright © 2026 Jinghao Chen',
    quote: 'You have reached the end of this page, but not the end of the journey.',

    /*
      GitHub Pages paths are case-sensitive.
      Keep these filenames exactly the same as the uploaded files.

      SVG is tried first. PNG is used only if SVG fails.
      If your actual files are USTC.SVG / USTC.PNG, change these two lines.
    */
    emblemSvg: './assets/images/labels/USTC.svg',
    emblemPng: './assets/images/labels/USTC.png',
    ustcHome: 'https://www.ustc.edu.cn/',

    /*
      These are DOM element IDs for pages that receive
      the shared footer label.
    */
    targetPageIds: [
      'about',
      'schedule',
      'social',
      'toolkit',
      'life'
    ],

    cacheKey: 'site-footer-label:last-updated',
    cacheTTL: 24 * 60 * 60 * 1000
  };

  let stylesheetLoaded = false;
  let initialized = false;
  let mutationObserver = null;
  let ensureTimer = 0;
  let lastUpdatedPromise = null;

  let emblemReadySrc = '';
  let emblemPreloadPromise = null;

  const hydratedFooters = new WeakSet();

  function runWhenIdle(callback, timeout) {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, {
        timeout: timeout || 1200
      });
      return;
    }

    window.setTimeout(
      callback,
      Math.min(timeout || 600, 600)
    );
  }

  function loadStylesheet() {
    if (stylesheetLoaded) return;

    stylesheetLoaded = true;

    if (
      document.querySelector(
        'link[data-site-footer-label-style="1"]'
      )
    ) {
      return;
    }

    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = CONFIG.stylesheet;

    link.setAttribute(
      'data-site-footer-label-style',
      '1'
    );

    document.head.appendChild(link);
  }

  function escapeText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function readCachedUpdate() {
    try {
      const raw = localStorage.getItem(
        CONFIG.cacheKey
      );

      if (!raw) return '';

      const cached = JSON.parse(raw);

      if (
        !cached ||
        !cached.value ||
        !cached.savedAt ||
        Date.now() - cached.savedAt >
          CONFIG.cacheTTL
      ) {
        return '';
      }

      return cached.value;
    } catch (e) {
      return '';
    }
  }

  function writeCachedUpdate(value) {
    try {
      localStorage.setItem(
        CONFIG.cacheKey,
        JSON.stringify({
          value,
          savedAt: Date.now()
        })
      );
    } catch (e) {}
  }

  function fetchLastUpdated() {
    const cached = readCachedUpdate();

    if (cached) {
      return Promise.resolve(cached);
    }

    if (lastUpdatedPromise) {
      return lastUpdatedPromise;
    }

    lastUpdatedPromise = fetch(
      CONFIG.repositoryApi,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    )
      .then((response) => {
        if (!response.ok) return '';

        return response.json();
      })
      .then((data) => {
        const value = formatDate(
          data &&
          (
            data.pushed_at ||
            data.updated_at
          )
        );

        if (value) {
          writeCachedUpdate(value);
        }

        return value;
      })
      .catch(() => '');

    return lastUpdatedPromise;
  }

  function testEmblemImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve('');
        return;
      }

      const img = new Image();

      img.onload = () => resolve(src);
      img.onerror = () => resolve('');

      try {
        img.decoding = 'async';
      } catch (e) {}

      img.src = src;
    });
  }

  function preloadEmblem() {
    if (emblemReadySrc) {
      return Promise.resolve(
        emblemReadySrc
      );
    }

    if (emblemPreloadPromise) {
      return emblemPreloadPromise;
    }

    emblemPreloadPromise = testEmblemImage(
      CONFIG.emblemSvg
    )
      .then((src) => {
        if (src) return src;

        return testEmblemImage(
          CONFIG.emblemPng
        );
      })
      .then((src) => {
        emblemReadySrc = src || '';

        return emblemReadySrc;
      })
      .catch(() => '');

    return emblemPreloadPromise;
  }

  function githubIconSvg() {
    return [
      '<svg class="site-footer-label__github-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '<path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56v-2.15c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17A10.9 10.9 0 0 1 12 6.05c.98 0 1.96.13 2.88.39 2.19-1.48 3.15-1.17 3.15-1.17.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.18c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>',
      '</svg>'
    ].join('');
  }

  function createFooter() {
    const footer =
      document.createElement('footer');

    footer.className =
      'site-footer-label';

    footer.setAttribute(
      'aria-label',
      'Site footer'
    );

    footer.dataset.siteFooterLabel = '1';

    footer.innerHTML = [
      '<div class="site-footer-label__left">',

      `  <a class="site-footer-label__emblem-link is-hidden" href="${CONFIG.ustcHome}" target="_blank" rel="noopener noreferrer" aria-label="Open University of Science and Technology of China website" aria-hidden="true" tabindex="-1">`,

      '    <img class="site-footer-label__emblem is-hidden" alt="School emblem" decoding="async" loading="lazy" fetchpriority="low" style="width:min(86vw,420px);max-width:100%;height:auto;visibility:hidden;">',

      '  </a>',

      '</div>',

      '<div class="site-footer-label__center">',

      `  <div class="site-footer-label__copyright">${escapeText(CONFIG.copyright)}</div>`,

      `  <div class="site-footer-label__quote">${escapeText(CONFIG.quote)}</div>`,

      '  <div class="site-footer-label__updated">Last updated: <span data-site-footer-updated>Loading...</span></div>',

      '</div>',

      '<div class="site-footer-label__right">',

      '  <div class="site-footer-label__links" aria-label="External profile links">',

      `    <a class="site-footer-label__profile-link site-footer-label__github-link" href="${CONFIG.githubProfile}" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile">`,

      `      ${githubIconSvg()}`,

      '      <span>GitHub</span>',

      '    </a>',

      `    <a class="site-footer-label__profile-link site-footer-label__orcid-link" href="${CONFIG.orcidProfile}" target="_blank" rel="me noopener noreferrer" aria-label="Open ORCID record 0009-0009-1961-6829">`,

      `      <img class="site-footer-label__orcid-icon" src="${CONFIG.orcidIcon}" alt="ORCID iD icon" loading="lazy" decoding="async">`,

      '      <span>ORCID</span>',

      '    </a>',

      '  </div>',

      '</div>'
    ].join('');

    return footer;
  }

  function getFooterHost(page) {
    return page || null;
  }

  function ensureFooterForPage(page) {
    if (!page) return;

    const host = getFooterHost(page);

    if (!host) return;

    const existing = page.querySelector(
      '.site-footer-label'
    );

    if (existing) {
      if (
        existing.parentElement !== host
      ) {
        host.appendChild(existing);
      }

      page.dataset.footerLabelReady = '1';

      observeFooterVisibility(existing);

      return;
    }

    loadStylesheet();

    const footer = createFooter();

    host.appendChild(footer);

    page.dataset.footerLabelReady = '1';

    observeFooterVisibility(footer);
  }

  function ensureAllFooters() {
    CONFIG.targetPageIds.forEach((id) => {
      const page =
        document.getElementById(id);

      if (page) {
        ensureFooterForPage(page);
      }
    });
  }

  function scheduleEnsureAllFooters() {
    if (ensureTimer) {
      window.clearTimeout(ensureTimer);
    }

    ensureTimer = window.setTimeout(
      () => {
        ensureTimer = 0;

        runWhenIdle(() => {
          ensureAllFooters();
        }, 1000);
      },
      120
    );
  }

  function setEmblemVisible(
    emblem,
    visible
  ) {
    const emblemLink =
      emblem &&
      emblem.closest
        ? emblem.closest(
            '.site-footer-label__emblem-link'
          )
        : null;

    if (visible) {
      emblem.classList.remove(
        'is-hidden'
      );

      emblem.style.visibility = '';

      if (emblemLink) {
        emblemLink.classList.remove(
          'is-hidden'
        );

        emblemLink.removeAttribute(
          'aria-hidden'
        );

        emblemLink.removeAttribute(
          'tabindex'
        );
      }

      return;
    }

    emblem.classList.add('is-hidden');
    emblem.style.visibility = 'hidden';

    if (emblemLink) {
      emblemLink.classList.add(
        'is-hidden'
      );

      emblemLink.setAttribute(
        'aria-hidden',
        'true'
      );

      emblemLink.setAttribute(
        'tabindex',
        '-1'
      );
    }
  }

  function hydrateEmblem(footer) {
    const emblem = footer.querySelector(
      '.site-footer-label__emblem'
    );

    if (
      !emblem ||
      emblem.dataset.emblemHydrated === '1'
    ) {
      return;
    }

    emblem.dataset.emblemHydrated = '1';

    preloadEmblem().then((src) => {
      if (!src) {
        setEmblemVisible(
          emblem,
          false
        );

        return;
      }

      emblem.onload = () => {
        setEmblemVisible(
          emblem,
          true
        );
      };

      emblem.onerror = () => {
        setEmblemVisible(
          emblem,
          false
        );
      };

      emblem.src = src;

      if (
        emblem.complete &&
        emblem.naturalWidth > 0
      ) {
        setEmblemVisible(
          emblem,
          true
        );
      }
    });
  }

  function hydrateLastUpdated(footer) {
    const updated = footer.querySelector(
      '[data-site-footer-updated]'
    );

    if (!updated) return;

    fetchLastUpdated().then(
      (dateText) => {
        updated.textContent =
          dateText ||
          'Unavailable';
      }
    );
  }

  function hydrateFooter(footer) {
    if (
      !footer ||
      hydratedFooters.has(footer)
    ) {
      return;
    }

    hydratedFooters.add(footer);

    runWhenIdle(() => {
      hydrateEmblem(footer);
      hydrateLastUpdated(footer);
    }, 1200);
  }

  function observeFooterVisibility(
    footer
  ) {
    if (!footer) return;

    if (
      footer.dataset
        .footerVisibilityObserved === '1'
    ) {
      return;
    }

    footer.dataset
      .footerVisibilityObserved = '1';

    if (
      typeof IntersectionObserver !==
      'function'
    ) {
      hydrateFooter(footer);
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            observer.disconnect();
            hydrateFooter(footer);
          });
        },
        {
          root: null,
          rootMargin: '420px 0px',
          threshold: 0
        }
      );

    observer.observe(footer);
  }

  function observePageCreation() {
    if (mutationObserver) return;

    mutationObserver =
      new MutationObserver(() => {
        scheduleEnsureAllFooters();
      });

    mutationObserver.observe(
      document.body ||
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  function init() {
    if (initialized) return;

    initialized = true;

    scheduleEnsureAllFooters();
    observePageCreation();

    window.addEventListener(
      'site:langchange',
      scheduleEnsureAllFooters
    );
  }

  window.SiteFooterLabel = {
    init,
    ensureAllFooters,
    ensureFooterForPage,
    fetchLastUpdated,
    preloadEmblem
  };

  if (
    !window.__SiteFooterLabelPreloadOnly
  ) {
    if (
      document.readyState === 'loading'
    ) {
      document.addEventListener(
        'DOMContentLoaded',
        init
      );
    } else {
      init();
    }
  }
})();