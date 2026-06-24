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
      href="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
      target="_blank"
      rel="noopener noreferrer"
      data-medit-pdf-link
      data-cursor="link_select"
      data-cursor-fallback="pointer"
    >新标签页打开</a>
  </div>

  <div class="medit-fullscreen-topbar" aria-hidden="true">
    <span class="medit-fullscreen-title">沉思录</span>

    <div class="medit-fullscreen-actions">
      <a
        class="medit-fullscreen-link"
        href="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
        target="_blank"
        rel="noopener noreferrer"
        data-medit-pdf-link
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

  <div class="medit-pdf-shell" data-medit-pdf-shell>
    <embed
      class="medit-pdf-frame"
      type="application/pdf"
      data-src="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
    >
  </div>

  <p class="medit-pdf-fallback">
    若 PDF 预览无法加载，可
    <a
      href="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
      target="_blank"
      rel="noopener noreferrer"
      data-medit-pdf-link
    >直接打开 PDF</a>。
  </p>
</div>
`;
})();