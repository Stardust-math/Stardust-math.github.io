(function () {
  window.MEDITATIONS_EN_INNER_HTML = `
<div class="container medit-pdf-page">
  <div class="resume-heading">Meditations</div>

  <div class="medit-readerbar" aria-label="Meditations reading actions">
    <button
      class="medit-reader-action"
      type="button"
      data-medit-fullscreen-open
      data-cursor="precise_select"
      data-cursor-fallback="pointer"
    >Fullscreen Reading</button>

    <a
      class="medit-reader-action"
      href="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
      target="_blank"
      rel="noopener noreferrer"
      data-medit-pdf-link
      data-cursor="link_select"
      data-cursor-fallback="pointer"
    >Open in New Tab</a>
  </div>

  <div class="medit-fullscreen-topbar" aria-hidden="true">
    <span class="medit-fullscreen-title">Meditations</span>

    <div class="medit-fullscreen-actions">
      <a
        class="medit-fullscreen-link"
        href="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
        target="_blank"
        rel="noopener noreferrer"
        data-medit-pdf-link
        data-cursor="link_select"
        data-cursor-fallback="pointer"
      >Open in New Tab</a>

      <button
        class="medit-fullscreen-close"
        type="button"
        aria-label="Exit fullscreen reading"
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
    If the PDF preview does not load,
    <a
      href="./assets/pdf/life/meditations/Stardust_Meditations.pdf#page=1&amp;zoom=page-width&amp;pagemode=bookmarks&amp;view=FitH&amp;navpanes=1&amp;toolbar=1"
      target="_blank"
      rel="noopener noreferrer"
      data-medit-pdf-link
    >open the PDF directly</a>.
  </p>
</div>
`;
})();