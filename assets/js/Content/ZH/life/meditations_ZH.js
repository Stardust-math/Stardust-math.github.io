(function () {
  'use strict';

  window.MEDITATIONS_ZH_INNER_HTML = `
<div class="container medit-pdf-page">
  <div class="meditations-heading">
    沉思录
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
      aria-label="沉思录阅读操作"
    >
      <button
        class="pdf-reader-action"
        type="button"
        data-pdf-fullscreen-open
        data-cursor="precise_select"
        data-cursor-fallback="pointer"
      >全屏阅读</button>

      <a
        class="pdf-reader-action"
        href="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
        target="_blank"
        rel="noopener noreferrer"
        data-pdf-new-tab
        data-cursor="link_select"
        data-cursor-fallback="pointer"
      >新标签页打开</a>
    </div>

    <div
      class="pdf-reader-fullscreen-bar"
      aria-hidden="true"
    >
      <span
        class="pdf-reader-fullscreen-title"
      >沉思录</span>

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
        >新标签页打开</a>

        <button
          class="pdf-reader-fullscreen-close"
          type="button"
          aria-label="退出全屏阅读"
          data-pdf-fullscreen-close
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >×</button>
      </div>
    </div>

    <div class="pdf-reader-frame-shell">
      <iframe
        class="pdf-reader-frame"
        title="沉思录 PDF 预览"
        loading="lazy"
        allow="fullscreen"
        allowfullscreen
      ></iframe>
    </div>

    <p class="pdf-reader-fallback">
      若 PDF 预览无法加载，可
      <a
        href="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
        target="_blank"
        rel="noopener noreferrer"
        data-pdf-direct-link
      >直接打开 PDF</a>。
    </p>
  </div>
</div>
`;
})();