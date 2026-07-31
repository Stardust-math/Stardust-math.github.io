(function () {
  'use strict';

  function hiddenAttr(active) {
    return active
      ? ''
      : ' hidden';
  }

  function activeClass(active) {
    return active
      ? ' active'
      : '';
  }

  function render(options) {
    const opts =
      options || {};

    const active =
      opts.active === true;

    return `
      <section
        class="social-section social-anime-section${activeClass(active)}"
        id="social-anime-section"
        data-view="anime"
        role="tabpanel"
        aria-labelledby="social-tab-anime"
        ${hiddenAttr(active)}
      >
        <div
          id="mount-social-anime"
          class="social-submodule social-anime"
        >
          <div
            class="anime-module-heading"
            data-i18n="anime_heading"
          >
            My Anime Watchlist
          </div>

          <div
            id="social-anime-app"
            class="anime-app"
            aria-live="polite"
            aria-busy="false"
          ></div>
        </div>
      </section>
    `;
  }

  window.SocialAnimeRender = {
    render
  };
})();