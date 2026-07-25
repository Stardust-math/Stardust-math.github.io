(function () {
  'use strict';

  window.MEDITATIONS_EN_INNER_HTML = `
<div class="container medit-pdf-page">
  <div class="resume-heading">
    Meditations
  </div>

  <div
    class="pdf-reader medit-pdf-reader"
    data-pdf-reader
    data-pdf-src="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
    data-pdf-page="1"
    data-pdf-zoom="page-width"
    data-pdf-page-mode="bookmarks"
    data-pdf-autoload="true"
  >
    <div
      class="pdf-reader-actions"
      aria-label="Meditations reading actions"
    >
      <button
        class="pdf-reader-action"
        type="button"
        data-pdf-fullscreen-open
        data-cursor="precise_select"
        data-cursor-fallback="pointer"
      >Fullscreen Reading</button>

      <a
        class="pdf-reader-action"
        href="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
        target="_blank"
        rel="noopener noreferrer"
        data-pdf-new-tab
        data-cursor="link_select"
        data-cursor-fallback="pointer"
      >Open in New Tab</a>
    </div>

    <div
      class="pdf-reader-fullscreen-bar"
      aria-hidden="true"
    >
      <span
        class="pdf-reader-fullscreen-title"
      >Meditations</span>

      <div
        class="pdf-reader-fullscreen-actions"
      >
        <a
          class="pdf-reader-fullscreen-link"
          href="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
          target="_blank"
          rel="noopener noreferrer"
          data-pdf-new-tab
          data-cursor="link_select"
          data-cursor-fallback="pointer"
        >Open in New Tab</a>

        <button
          class="pdf-reader-fullscreen-close"
          type="button"
          aria-label="Exit fullscreen reading"
          data-pdf-fullscreen-close
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >×</button>
      </div>
    </div>

    <div class="pdf-reader-frame-shell">
      <iframe
        class="pdf-reader-frame"
        title="Meditations PDF preview"
        loading="lazy"
        allow="fullscreen"
        allowfullscreen
      ></iframe>
    </div>

    <p class="pdf-reader-fallback">
      If the PDF preview does not load,
      <a
        href="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
        target="_blank"
        rel="noopener noreferrer"
        data-pdf-direct-link
      >open the PDF directly</a>.
    </p>
  </div>
</div>
`;
})();