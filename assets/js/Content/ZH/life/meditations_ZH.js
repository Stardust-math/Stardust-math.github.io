(function () {
  window.MEDITATIONS_ZH_INNER_HTML = `
<div class="container medit-pdf-page">
  <div class="resume-heading">沉思录</div>

  <div class="medit-readerbar" aria-label="沉思录阅读操作">
    <button
      class="medit-reader-action"
      type="button"
      data-medit-fullscreen-open
      data-cursor="precise_select"
      data-cursor-fallback="pointer"
    >全屏阅读</button>

    <a
      class="medit-reader-action"
      href="./assets/vendor/pdfjs/web/viewer.html?file=..%2F..%2F..%2Fpdf%2Flife%2Fmeditations%2FStardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks"
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="link_select"
      data-cursor-fallback="pointer"
    >新标签页打开</a>
  </div>

  <div class="medit-fullscreen-topbar" aria-hidden="true">
    <span class="medit-fullscreen-title">沉思录</span>

    <div class="medit-fullscreen-actions">
      <a
        class="medit-fullscreen-link"
        href="./assets/vendor/pdfjs/web/viewer.html?file=..%2F..%2F..%2Fpdf%2Flife%2Fmeditations%2FStardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link_select"
        data-cursor-fallback="pointer"
      >新标签页打开</a>

      <button
        class="medit-fullscreen-close"
        type="button"
        aria-label="退出全屏阅读"
        data-medit-fullscreen-close
        data-cursor="precise_select"
        data-cursor-fallback="pointer"
      >×</button>
    </div>
  </div>

  <div class="medit-pdfjs-shell" data-medit-pdf-shell>
    <iframe
      class="medit-pdfjs-frame"
      title="沉思录 PDF 预览"
      data-src="./assets/vendor/pdfjs/web/viewer.html?file=..%2F..%2F..%2Fpdf%2Flife%2Fmeditations%2FStardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks"
      loading="lazy"
      allow="fullscreen"
      allowfullscreen
    ></iframe>
  </div>

  <p class="medit-pdfjs-fallback">
    若 PDF 预览无法加载，可
    <a
      href="./assets/pdf/life/meditations/Stardust_Meditations.pdf"
      target="_blank"
      rel="noopener noreferrer"
    >直接打开 PDF</a>。
  </p>
</div>
`;
})();