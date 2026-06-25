(function () {
  'use strict';

  function hiddenAttr(active) {
    return active ? '' : ' hidden';
  }

  function activeClass(active) {
    return active ? ' active' : '';
  }

  function render(options) {
    const opts = options || {};
    const active = opts.active === true;

    return `
      <section
        class="social-section social-footprints-section${activeClass(active)}"
        id="social-footprints-section"
        data-view="footprints"
        role="tabpanel"
        aria-labelledby="social-tab-footprints"
        ${hiddenAttr(active)}
      >
        <div id="mount-social-footprints" class="social-submodule stats-container social-footprints">
          <div class="stats-heading" data-i18n="stats_heading">Website Statistics</div>

          <div class="stats-metrics" aria-label="GoatCounter summary">
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_total">All-time (Total)</div>
              <div class="stats-metric-value" id="gc-total">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_month">Last 30 days</div>
              <div class="stats-metric-value" id="gc-month">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_week">Last 7 days</div>
              <div class="stats-metric-value" id="gc-week">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_page">This path</div>
              <div class="stats-metric-value" id="gc-page">—</div>
            </div>
          </div>

          <div class="stats-block">
            <div class="stats-subtitle">
              <span data-i18n="dashboard_title">GoatCounter Dashboard</span>
              <a class="stats-link" href="https://stardust.goatcounter.com/" target="_blank" rel="noopener noreferrer" data-i18n="link_open">Open</a>
            </div>

            <div class="stats-embed">
              <iframe
                class="goatcounter-frame"
                title="GoatCounter dashboard"
                loading="lazy"
                data-src="https://stardust.goatcounter.com?hideui=1"
              ></iframe>
            </div>
          </div>

          <div class="stats-sep"></div>

          <div class="stats-block">
            <div class="stats-subtitle">
              <span data-i18n="visitor_map">Visitor Map</span>
            </div>
            <div class="visitor-map-wrap">
              <div id="visitor-map-placeholder"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  window.SocialFootprintsRender = {
    render
  };
})();