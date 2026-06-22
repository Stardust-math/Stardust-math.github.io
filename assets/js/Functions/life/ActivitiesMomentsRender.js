(function () {
  'use strict';

  function getUtils() {
    return window.ActivitiesMomentsUtils || null;
  }

  function renderMomentIndex(currentDateKey) {
    const U = getUtils();

    if (
      U &&
      window.ActivitiesMomentsIndex &&
      typeof window.ActivitiesMomentsIndex.render === 'function'
    ) {
      return window.ActivitiesMomentsIndex.render(U.getSortedMoments(), currentDateKey);
    }

    return '';
  }

  function renderCard(moment, index, ui) {
    const U = getUtils();
    if (!U) return '';

    const rawDateKey = moment.dateKey || '';
    const dateKey = U.escapeHtml(rawDateKey);
    const dateLabel = U.escapeHtml(moment.dateLabel || moment.dateISO || moment.dateKey || '');
    const plainTitle = U.escapeHtml(moment.title || '');
    const title = U.renderTitle(moment);
    const meta = U.escapeHtml(U.getMetaText(moment));
    const summary = U.renderInlineText(moment.summary || '');
    const cover = moment.cover ? U.escapeHtml(moment.cover) : '';
    const action = U.escapeHtml(ui.viewMoment);
    const detailHref = U.escapeHtml(U.getDetailRoute(rawDateKey));

    const fetchPriority = index === 0 ? ' fetchpriority="high"' : '';
    const loading = index === 0 ? 'eager' : 'lazy';

    const media = cover
      ? `
        <div class="am-card-media">
          <img
            src="${cover}"
            alt="${plainTitle}"
            loading="${loading}"
            decoding="async"${fetchPriority}
          >
          <div class="am-card-date">${dateLabel}</div>
        </div>
      `
      : `
        <div class="am-card-media" aria-hidden="true">
          <div class="am-card-date">${dateLabel}</div>
        </div>
      `;

    return `
      <article class="am-card" data-date-key="${dateKey}">
        ${media}
        <div class="am-card-body">
          <h3 class="am-card-title">${title}</h3>
          ${meta ? `<p class="am-card-meta">${meta}</p>` : ''}
          ${summary ? `<p class="am-card-summary">${summary}</p>` : ''}
          <a
            class="am-card-action"
            href="${detailHref}"
            data-am-action="view"
            data-date-key="${dateKey}"
            data-cursor="handwriting"
            data-cursor-fallback="crosshair"
          >${action}</a>
        </div>
      </article>
    `;
  }

  function renderListHtml() {
    const U = getUtils();
    if (!U) return '<div class="activities_moments is-empty"></div>';

    const ui = U.getUi();
    const moments = U.getSortedMoments();

    if (!moments.length) {
      return '<div class="activities_moments is-empty"></div>';
    }

    return `
      <div class="activities_moments" data-am-view="list">
        <div class="am-card-grid">
          ${moments.map((moment, index) => renderCard(moment, index, ui)).join('')}
        </div>
      </div>
    `;
  }

  function renderGallery(moment, ui) {
    const U = getUtils();
    if (!U) return '';

    const gallery = Array.isArray(moment.gallery) ? moment.gallery : [];
    if (!gallery.length) return '';

    return `
      <div class="am-gallery">
        ${gallery.map((src, index) => {
          const safeSrc = U.escapeHtml(src);
          const alt = U.escapeHtml((moment.title || '') + ' ' + (index + 1));

          return `
            <button
              class="am-gallery-item"
              type="button"
              data-am-image="${safeSrc}"
              data-cursor="precise_select"
              data-cursor-fallback="pointer"
              aria-label="${U.escapeHtml(ui.openImage)}"
            >
              <img src="${safeSrc}" alt="${alt}" loading="lazy" decoding="async">
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderDetailShell(moment, innerHtml) {
    const U = getUtils();
    if (!U) return '';

    const dateLabel = U.escapeHtml(moment.dateLabel || moment.dateISO || moment.dateKey || '');
    const plainTitle = U.escapeHtml(moment.title || '');
    const title = U.renderTitle(moment);
    const meta = U.escapeHtml(U.getMetaText(moment));
    const cover = moment.cover ? U.escapeHtml(moment.cover) : '';
    const currentDateKey = moment.dateKey || '';

    const hero = cover
      ? `<img src="${cover}" alt="${plainTitle}" loading="eager" decoding="async" fetchpriority="high">`
      : '';

    return `
      <div class="activities_moments am-detail" data-am-view="detail" data-date-key="${U.escapeHtml(currentDateKey)}">
        <article class="am-detail-card">
          <header class="am-detail-hero">
            ${hero}
            <div class="am-detail-head">
              <div class="am-detail-date">${dateLabel}</div>
              <h2 class="am-detail-title">${title}</h2>
              ${meta ? `<p class="am-detail-meta">${meta}</p>` : ''}
            </div>
          </header>

          <div class="am-detail-layout">
            ${renderMomentIndex(currentDateKey)}

            <div class="am-detail-content">
              ${innerHtml}
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderDetailLoadingHtml(moment) {
    const U = getUtils();
    if (!U) return '';

    const ui = U.getUi();

    return renderDetailShell(moment, `
      <div class="am-detail-body">
        <p>${U.escapeHtml(ui.loadingMoment)}</p>
      </div>
    `);
  }

  function renderDetailHtml(moment) {
    const U = getUtils();
    if (!U) return '';

    const ui = U.getUi();

    const backHref = U.escapeHtml(U.getListRoute());
    const body = Array.isArray(moment.body) ? moment.body : [];
    const bodyHtml = body
      .map((paragraph) => `<p>${U.renderInlineText(paragraph)}</p>`)
      .join('');

    return renderDetailShell(moment, `
      ${bodyHtml ? `<div class="am-detail-body">${bodyHtml}</div>` : ''}
      ${renderGallery(moment, ui)}

      <div class="am-detail-footer">
        <a
          class="am-detail-back"
          href="${backHref}"
          data-am-action="back"
          data-cursor="handwriting"
          data-cursor-fallback="crosshair"
        >${U.escapeHtml(ui.backToMoments)}</a>
      </div>
    `);
  }

  window.ActivitiesMomentsRender = {
    renderMomentIndex,
    renderCard,
    renderListHtml,
    renderGallery,
    renderDetailShell,
    renderDetailLoadingHtml,
    renderDetailHtml
  };
})();