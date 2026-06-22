(function () {
  'use strict';

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeDateKey(value) {
    return String(value == null ? '' : value);
  }

  function getLifeBaseUrl() {
    return new URL('life/', document.baseURI);
  }

  function getDetailRoute(dateKey) {
    return new URL('activities_moments/' + encodeURIComponent(dateKey) + '/', getLifeBaseUrl()).pathname;
  }

  function sortMomentsNewestFirst(moments) {
    return (Array.isArray(moments) ? moments : []).slice().sort((a, b) => {
      const da = Date.parse(a && a.dateISO ? a.dateISO : '');
      const db = Date.parse(b && b.dateISO ? b.dateISO : '');

      if (Number.isFinite(db) && Number.isFinite(da) && db !== da) {
        return db - da;
      }

      return String((b && b.dateKey) || '').localeCompare(String((a && a.dateKey) || ''));
    });
  }

  function getIndexTitle() {
    return getLang() === 'zh' ? '目录' : 'Index';
  }

  function getAriaLabel() {
    return getLang() === 'zh' ? 'Activities & Moments 目录' : 'Activities & Moments index';
  }

  function render(moments, currentDateKey) {
    const sorted = sortMomentsNewestFirst(moments);
    const currentKey = normalizeDateKey(currentDateKey);

    if (!sorted.length) {
      return '';
    }

    const items = sorted.map((moment) => {
      if (!moment) return '';

      const rawDateKey = normalizeDateKey(moment.dateKey);
      const isActive = rawDateKey === currentKey;
      const dateText = moment.dateLabel || moment.dateISO || moment.dateKey || '';
      const titleText = moment.title || '';
      const href = getDetailRoute(rawDateKey);

      return `
        <a
          class="am-detail-index-link${isActive ? ' is-active' : ''}"
          href="${escapeHtml(href)}"
          data-am-action="view"
          data-date-key="${escapeHtml(rawDateKey)}"
          data-cursor="handwriting"
          data-cursor-fallback="crosshair"
          ${isActive ? 'aria-current="page"' : ''}
        >
          <span class="am-index-date">${escapeHtml(dateText)}</span>
          <span class="am-index-colon">:</span>
          <span class="am-index-title">${escapeHtml(titleText)}</span>
        </a>
      `;
    }).join('');

    return `
      <aside class="am-detail-index" data-am-index>
        <div class="am-detail-index-title">${escapeHtml(getIndexTitle())}</div>
        <div class="am-detail-index-scroll" data-am-index-scroll>
          <nav class="am-detail-index-list" aria-label="${escapeHtml(getAriaLabel())}">
            ${items}
          </nav>
        </div>
      </aside>
    `;
  }

  function ensureActiveVisible(index) {
    if (!index) return;

    const scroller = index.querySelector('[data-am-index-scroll]');
    const active = index.querySelector('.am-detail-index-link.is-active');

    if (!scroller || !active) return;

    const padding = 14;
    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (activeRect.top < scrollerRect.top + padding) {
      scroller.scrollTop -= (scrollerRect.top + padding - activeRect.top);
      return;
    }

    if (activeRect.bottom > scrollerRect.bottom - padding) {
      scroller.scrollTop += activeRect.bottom - (scrollerRect.bottom - padding);
    }
  }

  function getRoot(root) {
    return root || document;
  }

  function sync(root) {
    const scope = getRoot(root);
    const content = scope.querySelector ? scope.querySelector('.am-detail-content') : null;
    const index = scope.querySelector ? scope.querySelector('[data-am-index]') : null;

    if (!content || !index) return;

    const isSingleColumn = window.matchMedia && window.matchMedia('(max-width: 1024px)').matches;

    if (isSingleColumn) {
      index.style.removeProperty('--am-index-height');
    } else {
      const contentHeight = Math.ceil(content.getBoundingClientRect().height);

      if (contentHeight > 0) {
        index.style.setProperty('--am-index-height', contentHeight + 'px');
      }
    }

    ensureActiveVisible(index);
  }

  function scheduleSync(root) {
    const scope = getRoot(root);

    window.requestAnimationFrame(() => {
      sync(scope);

      window.requestAnimationFrame(() => {
        sync(scope);
      });
    });
  }

  let resizeTimer = null;

  window.addEventListener('resize', () => {
    const mount = document.getElementById('mount-activities_moments');
    if (!mount || !mount.querySelector('.am-detail-layout')) return;

    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      scheduleSync(mount);
    }, 120);
  });

  window.ActivitiesMomentsIndex = {
    render,
    sync,
    scheduleSync,
    sortMomentsNewestFirst
  };
})();