(function () {
  'use strict';

  const ROOT_ID = 'about-archive';
  const MOUNT_ID = 'mount-about-archive';

  let pdfResourcesPromise = null;
  let globalHandlersBound = false;

  function getLang() {
    if (
      window.SiteLang &&
      typeof window.SiteLang.getLang ===
        'function'
    ) {
      return window.SiteLang.getLang() ===
        'zh'
        ? 'zh'
        : 'en';
    }

    return (
      document.body &&
      document.body.dataset.lang === 'zh'
    )
      ? 'zh'
      : 'en';
  }

  function getDictionary(lang) {
    return lang === 'zh'
      ? window.ABOUT_ARCHIVE_ZH
      : window.ABOUT_ARCHIVE_EN;
  }

  function getConfig() {
    return (
      window.AboutArchiveConfig || {
        exclusiveOpen: true,
        documents: []
      }
    );
  }

  function getMount() {
    return document.getElementById(
      MOUNT_ID
    );
  }

  function getRoot() {
    return document.getElementById(
      ROOT_ID
    );
  }

  function escapeHtml(value) {
    return String(
      value == null ? '' : value
    )
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getDocumentText(
    dictionary,
    id
  ) {
    return (
      dictionary &&
      dictionary.documents &&
      dictionary.documents[id]
    ) || {
      title: id,
      meta: '',
      notice: ''
    };
  }

  function getTitleParts(text) {
    const rawTitle =
      text && text.title;

    if (
      rawTitle &&
      typeof rawTitle === 'object'
    ) {
      return {
        prefix: String(
          rawTitle.prefix || ''
        ),

        bookTitle: String(
          rawTitle.bookTitle || ''
        ),

        authorsPrefix: String(
          rawTitle.authorsPrefix || ''
        ),

        authors: String(
          rawTitle.authors || ''
        ),

        authorsSuffix: String(
          rawTitle.authorsSuffix || ''
        ),

        suffix: String(
          rawTitle.suffix || ''
        )
      };
    }

    return {
      prefix: '',
      bookTitle: '',
      authorsPrefix: '',
      authors: '',
      authorsSuffix: '',
      suffix: String(rawTitle || '')
    };
  }

  function getPlainTitle(text) {
    const parts = getTitleParts(text);

    return (
      parts.prefix +
      parts.bookTitle +
      parts.authorsPrefix +
      parts.authors +
      parts.authorsSuffix +
      parts.suffix
    );
  }

  function renderDocumentTitle(text) {
    const parts = getTitleParts(text);

    if (
      !parts.bookTitle &&
      !parts.authors
    ) {
      return escapeHtml(
        getPlainTitle(text)
      );
    }

    return (
      escapeHtml(parts.prefix) +
      (
        parts.bookTitle
          ? '<cite class="archive-document-book-title">' +
            escapeHtml(parts.bookTitle) +
            '</cite>'
          : ''
      ) +
      escapeHtml(parts.authorsPrefix) +
      (
        parts.authors
          ? '<span class="archive-document-authors">' +
            escapeHtml(parts.authors) +
            '</span>'
          : ''
      ) +
      escapeHtml(parts.authorsSuffix) +
      escapeHtml(parts.suffix)
    );
  }

  function updateDocumentTitle(
    element,
    text
  ) {
    if (!element) return;

    element.innerHTML =
      renderDocumentTitle(text);
  }

  function getUi(dictionary) {
    return (
      dictionary &&
      dictionary.ui
    ) || {};
  }

  function getPdfResourceConfig() {
    const resources =
      window.SiteResources || {};

    return {
      style:
        resources.styles &&
        resources.styles.optional
          ? resources.styles.optional
              .pdfReader
          : '',

      script:
        resources.scripts &&
        resources.scripts.optional
          ? resources.scripts.optional
              .pdfReader
          : ''
    };
  }

  function ensurePdfReaderResources() {
    if (window.PdfReader) {
      return Promise.resolve(true);
    }

    if (pdfResourcesPromise) {
      return pdfResourcesPromise;
    }

    const loader =
      window.SiteResourceLoader;

    const resourceConfig =
      getPdfResourceConfig();

    if (
      !loader ||
      typeof loader.loadStyle !==
        'function' ||
      typeof loader.loadScript !==
        'function' ||
      !resourceConfig.style ||
      !resourceConfig.script
    ) {
      return Promise.resolve(false);
    }

    pdfResourcesPromise =
      Promise.all([
        loader.loadStyle(
          resourceConfig.style
        ),

        loader.loadScript(
          resourceConfig.script
        )
      ])
        .then(() => {
          return !!window.PdfReader;
        })
        .catch((error) => {
          console.warn(
            '[ArchiveRender] Failed to load the PDF reader.',
            error
          );

          return false;
        })
        .then((ready) => {
          if (!ready) {
            pdfResourcesPromise = null;
          }

          return ready;
        });

    return pdfResourcesPromise;
  }

  function sortedDocuments() {
    return Array.from(
      getConfig().documents || []
    ).sort((a, b) => {
      return (
        Number(a.order || 0) -
        Number(b.order || 0)
      );
    });
  }

  function groupDocuments(documents) {
    const groups = new Map();

    documents.forEach((documentItem) => {
      const category =
        documentItem.category ||
        'miscellaneous';

      if (!groups.has(category)) {
        groups.set(category, []);
      }

      groups
        .get(category)
        .push(documentItem);
    });

    return groups;
  }

  function renderReader(
    documentItem,
    text,
    ui
  ) {
    const plainTitle =
      getPlainTitle(text);

    const escapedPlainTitle =
      escapeHtml(plainTitle);

    const pdfPath = escapeHtml(
      documentItem.pdfPath
    );

    return `
      <p
        class="archive-reader-status"
        data-archive-reader-status
        data-state="idle"
        hidden
      >
        <span
          data-archive-reader-status-text
        ></span>

        <a
          href="${pdfPath}"
          target="_blank"
          rel="noopener noreferrer"
          data-archive-reader-status-link
          data-archive-ui="directOpen"
          hidden
        >${escapeHtml(
          ui.directOpen || ''
        )}</a>
      </p>

      <div
        class="pdf-reader archive-pdf-reader"
        data-pdf-reader
        data-pdf-document-id="${escapeHtml(
          documentItem.id
        )}"
        data-pdf-src="${pdfPath}"
        data-pdf-page="${escapeHtml(
          documentItem.initialPage || 1
        )}"
        data-pdf-zoom="${escapeHtml(
          documentItem.zoom ||
          'page-width'
        )}"
        data-pdf-page-mode="${escapeHtml(
          documentItem.pageMode ||
          'bookmarks'
        )}"
        hidden
      >
        <div
          class="pdf-reader-actions"
          data-archive-reader-actions
          aria-label="${escapeHtml(
            ui.readerActions || ''
          )}"
        >
          <button
            class="pdf-reader-action"
            type="button"
            data-pdf-fullscreen-open
            data-archive-ui="fullscreen"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >${escapeHtml(
            ui.fullscreen || ''
          )}</button>

          <a
            class="pdf-reader-action"
            href="${pdfPath}"
            target="_blank"
            rel="noopener noreferrer"
            data-pdf-new-tab
            data-archive-ui="openNewTab"
            data-cursor="link_select"
            data-cursor-fallback="pointer"
          >${escapeHtml(
            ui.openNewTab || ''
          )}</a>
        </div>

        <div
          class="pdf-reader-fullscreen-bar"
          aria-hidden="true"
        >
          <span
            class="pdf-reader-fullscreen-title"
            data-archive-fullscreen-title
          >${renderDocumentTitle(
            text
          )}</span>

          <div
            class="pdf-reader-fullscreen-actions"
          >
            <a
              class="pdf-reader-fullscreen-link"
              href="${pdfPath}"
              target="_blank"
              rel="noopener noreferrer"
              data-pdf-new-tab
              data-archive-ui="openNewTab"
              data-cursor="link_select"
              data-cursor-fallback="pointer"
            >${escapeHtml(
              ui.openNewTab || ''
            )}</a>

            <button
              class="pdf-reader-fullscreen-close"
              type="button"
              data-pdf-fullscreen-close
              aria-label="${escapeHtml(
                ui.closeFullscreen || ''
              )}"
              data-cursor="precise_select"
              data-cursor-fallback="pointer"
            >×</button>
          </div>
        </div>

        <div class="pdf-reader-frame-shell">
          <iframe
            class="pdf-reader-frame"
            title="${escapedPlainTitle} ${escapeHtml(
              ui.previewSuffix || ''
            )}"
            loading="lazy"
            allow="fullscreen"
            allowfullscreen
          ></iframe>
        </div>

        <p class="pdf-reader-fallback">
          <span
            data-archive-ui="fallbackPrefix"
          >${escapeHtml(
            ui.fallbackPrefix || ''
          )}</span>

          <a
            href="${pdfPath}"
            target="_blank"
            rel="noopener noreferrer"
            data-pdf-direct-link
            data-archive-ui="directOpen"
            data-cursor="link_select"
            data-cursor-fallback="pointer"
          >${escapeHtml(
            ui.directOpen || ''
          )}</a><span
            data-archive-ui="fallbackSuffix"
          >${escapeHtml(
            ui.fallbackSuffix || ''
          )}</span>
        </p>
      </div>
    `;
  }

  function renderDocument(
    documentItem,
    dictionary
  ) {
    const ui = getUi(dictionary);

    const text = getDocumentText(
      dictionary,
      documentItem.id
    );

    const rowId =
      'archive-document-' +
      documentItem.id;

    const isOpen =
      documentItem.defaultOpen === true;

    const exclusive =
      getConfig().exclusiveOpen !== false;

    return `
      <article
        class="archive-document"
        data-archive-document
        data-archive-document-id="${escapeHtml(
          documentItem.id
        )}"
      >
        <div class="archive-document-row">
          <div class="archive-document-copy">
            <div
              class="archive-document-title"
              data-archive-document-title
            >${renderDocumentTitle(
              text
            )}</div>

            <div
              class="archive-document-meta"
              data-archive-document-meta
            >${escapeHtml(
              text.meta
            )}</div>

            <div
              class="archive-document-notice"
              data-archive-document-notice
            >${escapeHtml(
              text.notice
            )}</div>
          </div>

          <button
            class="expander archive-document-expander${
              isOpen ? ' is-open' : ''
            }"
            type="button"
            data-expand-target="${escapeHtml(
              rowId
            )}"
            data-expand-key="${escapeHtml(
              documentItem.id
            )}"
            data-expand-group="about-archive-documents"
            data-expand-exclusive="${
              exclusive ? 'true' : 'false'
            }"
            aria-controls="${escapeHtml(
              rowId
            )}"
            aria-expanded="${
              isOpen ? 'true' : 'false'
            }"
            aria-label="${escapeHtml(
              isOpen
                ? ui.collapse
                : ui.expand
            )}"
            data-cursor="help"
          >
            <i
              class="fas fa-chevron-right"
              aria-hidden="true"
            ></i>
          </button>
        </div>

        <div
          class="expand-row archive-document-expand${
            isOpen ? ' is-open' : ''
          }"
          id="${escapeHtml(rowId)}"
          aria-hidden="${
            isOpen ? 'false' : 'true'
          }"
          style="display:${
            isOpen ? 'block' : 'none'
          };"
        >
          <div
            class="expand-content archive-document-content"
          >
            ${renderReader(
              documentItem,
              text,
              ui
            )}
          </div>
        </div>
      </article>
    `;
  }

  function createMarkup(dictionary) {
    const groups = groupDocuments(
      sortedDocuments()
    );

    const sections = [];

    groups.forEach(
      (documents, category) => {
        const categoryTitle =
          dictionary &&
          dictionary.categories &&
          dictionary.categories[category]
            ? dictionary.categories[category]
            : category;

        sections.push(`
          <section
            class="archive-category"
            data-archive-category="${escapeHtml(
              category
            )}"
          >
            <h2
              class="archive-category-title"
              data-archive-category-title
            >${escapeHtml(
              categoryTitle
            )}</h2>

            <div class="archive-document-list">
              ${documents
                .map((documentItem) =>
                  renderDocument(
                    documentItem,
                    dictionary
                  )
                )
                .join('')}
            </div>
          </section>
        `);
      }
    );

    return sections.join('');
  }

  function ensureRoot() {
    let root = getRoot();

    if (root) return root;

    if (
      window.About &&
      typeof window.About.init ===
        'function'
    ) {
      window.About.init();
    }

    const mount = getMount();

    if (!mount) {
      console.warn(
        '[ArchiveRender] The Archive mount is unavailable.'
      );

      return null;
    }

    root = document.createElement('div');
    root.id = ROOT_ID;
    mount.appendChild(root);

    return root;
  }

  function getExpanders() {
    return (
      window.ContentExpanders ||
      window.ResumeExpanders ||
      null
    );
  }

  function initializeExpanders(root) {
    const expanders = getExpanders();

    if (
      !root ||
      !expanders ||
      typeof expanders.init !==
        'function'
    ) {
      return;
    }

    expanders.init(root, {
      skipSave: true
    });
  }

  function findReader(id) {
    return (
      Array.from(
        document.querySelectorAll(
          '[data-pdf-reader]' +
          '[data-pdf-document-id]'
        )
      ).find((reader) => {
        return (
          reader.getAttribute(
            'data-pdf-document-id'
          ) === id
        );
      }) || null
    );
  }

  function setReaderStatus(
    documentElement,
    state
  ) {
    if (!documentElement) return;

    const status =
      documentElement.querySelector(
        '[data-archive-reader-status]'
      );

    if (!status) return;

    const dictionary =
      getDictionary(getLang());

    const ui = getUi(dictionary);

    const text =
      status.querySelector(
        '[data-archive-reader-status-text]'
      );

    const directLink =
      status.querySelector(
        '[data-archive-reader-status-link]'
      );

    status.dataset.state = state;

    if (state === 'loading') {
      if (text) {
        text.textContent =
          ui.loadingReader || '';
      }

      if (directLink) {
        directLink.hidden = true;
      }

      status.hidden = false;
      return;
    }

    if (state === 'error') {
      if (text) {
        text.textContent =
          ui.readerUnavailable || '';
      }

      if (directLink) {
        directLink.textContent =
          ui.directOpen || '';

        directLink.hidden = false;
      }

      status.hidden = false;
      return;
    }

    if (text) {
      text.textContent = '';
    }

    if (directLink) {
      directLink.hidden = true;
    }

    status.hidden = true;
  }

  function prepareReader(
    documentElement,
    options
  ) {
    if (!documentElement) {
      return Promise.resolve(false);
    }

    const opts = options || {};

    const id =
      documentElement.getAttribute(
        'data-archive-document-id'
      );

    const reader = findReader(id);

    if (!reader) {
      return Promise.resolve(false);
    }

    setReaderStatus(
      documentElement,
      'loading'
    );

    return ensurePdfReaderResources()
      .then((ready) => {
        if (
          !ready ||
          !window.PdfReader
        ) {
          setReaderStatus(
            documentElement,
            'error'
          );

          return false;
        }

        reader.hidden = false;

        window.PdfReader.init(
          reader
        );

        setReaderStatus(
          documentElement,
          'idle'
        );

        const expander =
          documentElement.querySelector(
            'button.expander' +
            '[data-expand-target]'
          );

        const shouldLoad =
          opts.load === true &&
          expander &&
          expander.getAttribute(
            'aria-expanded'
          ) === 'true';

        if (shouldLoad) {
          window.PdfReader.load(
            reader
          );
        }

        if (
          window.CustomCursorAPI &&
          typeof window.CustomCursorAPI
            .refresh === 'function'
        ) {
          window.CustomCursorAPI.refresh(
            documentElement
          );
        }

        return true;
      });
  }

  function prepareAllReaders(root) {
    if (!root) {
      return Promise.resolve(false);
    }

    return ensurePdfReaderResources()
      .then((ready) => {
        if (
          !ready ||
          !window.PdfReader
        ) {
          return false;
        }

        root
          .querySelectorAll(
            '[data-archive-document]'
          )
          .forEach((documentElement) => {
            const id =
              documentElement.getAttribute(
                'data-archive-document-id'
              );

            const reader =
              findReader(id);

            if (!reader) return;

            reader.hidden = false;

            window.PdfReader.init(
              reader
            );

            setReaderStatus(
              documentElement,
              'idle'
            );
          });

        return true;
      });
  }

  function updateI18N() {
    const root = getRoot();

    if (!root) return null;

    const dictionary =
      getDictionary(getLang());

    if (!dictionary) return root;

    const ui = getUi(dictionary);

    root
      .querySelectorAll(
        '[data-archive-category]'
      )
      .forEach((categoryElement) => {
        const key =
          categoryElement.getAttribute(
            'data-archive-category'
          );

        const heading =
          categoryElement.querySelector(
            '[data-archive-category-title]'
          );

        if (
          heading &&
          dictionary.categories &&
          dictionary.categories[key]
        ) {
          heading.textContent =
            dictionary.categories[key];
        }
      });

    root
      .querySelectorAll(
        '[data-archive-document]'
      )
      .forEach((documentElement) => {
        const id =
          documentElement.getAttribute(
            'data-archive-document-id'
          );

        const text = getDocumentText(
          dictionary,
          id
        );

        const title =
          documentElement.querySelector(
            '[data-archive-document-title]'
          );

        const meta =
          documentElement.querySelector(
            '[data-archive-document-meta]'
          );

        const notice =
          documentElement.querySelector(
            '[data-archive-document-notice]'
          );

        const expander =
          documentElement.querySelector(
            'button.expander'
          );

        if (title) {
          updateDocumentTitle(
            title,
            text
          );
        }

        if (meta) {
          meta.textContent =
            text.meta || '';
        }

        if (notice) {
          notice.textContent =
            text.notice || '';
        }

        if (expander) {
          const isOpen =
            expander.getAttribute(
              'aria-expanded'
            ) === 'true';

          expander.setAttribute(
            'aria-label',
            isOpen
              ? ui.collapse
              : ui.expand
          );
        }

        const status =
          documentElement.querySelector(
            '[data-archive-reader-status]'
          );

        if (
          status &&
          !status.hidden
        ) {
          const statusText =
            status.querySelector(
              '[data-archive-reader-status-text]'
            );

          const statusLink =
            status.querySelector(
              '[data-archive-reader-status-link]'
            );

          if (
            statusText &&
            status.dataset.state ===
              'loading'
          ) {
            statusText.textContent =
              ui.loadingReader || '';
          }

          if (
            statusText &&
            status.dataset.state ===
              'error'
          ) {
            statusText.textContent =
              ui.readerUnavailable || '';
          }

          if (statusLink) {
            statusLink.textContent =
              ui.directOpen || '';
          }
        }

        const reader = findReader(id);

        if (!reader) return;

        const fullscreenTitle =
          reader.querySelector(
            '[data-archive-fullscreen-title]'
          );

        if (fullscreenTitle) {
          updateDocumentTitle(
            fullscreenTitle,
            text
          );
        }

        const plainTitle =
          getPlainTitle(text);

        const frame =
          reader.querySelector(
            '.pdf-reader-frame'
          );

        if (frame) {
          frame.title =
            plainTitle +
            ' ' +
            (ui.previewSuffix || '');
        }

        const actionBar =
          reader.querySelector(
            '[data-archive-reader-actions]'
          );

        if (actionBar) {
          actionBar.setAttribute(
            'aria-label',
            ui.readerActions || ''
          );
        }

        const closeButton =
          reader.querySelector(
            '[data-pdf-fullscreen-close]'
          );

        if (closeButton) {
          closeButton.setAttribute(
            'aria-label',
            ui.closeFullscreen || ''
          );
        }

        reader
          .querySelectorAll(
            '[data-archive-ui]'
          )
          .forEach((element) => {
            const key =
              element.getAttribute(
                'data-archive-ui'
              );

            if (
              key &&
              typeof ui[key] ===
                'string'
            ) {
              element.textContent =
                ui[key];
            }
          });
      });

    root.dataset.renderedLang =
      getLang();

    return root;
  }

  function render() {
    const root = ensureRoot();

    if (!root) return null;

    if (
      root.dataset.archiveRendered !==
        '1'
    ) {
      const dictionary =
        getDictionary(getLang());

      root.innerHTML =
        createMarkup(dictionary);

      root.dataset.archiveRendered =
        '1';

      root.dataset.renderedLang =
        getLang();

      initializeExpanders(root);

      if (
        window.CustomCursorAPI &&
        typeof window.CustomCursorAPI
          .refresh === 'function'
      ) {
        window.CustomCursorAPI.refresh(
          root
        );
      }
    } else {
      updateI18N();
    }

    bindGlobalHandlers();

    return root;
  }

  function handleExpanderChange(event) {
    const root = getRoot();

    if (
      !root ||
      !event ||
      !event.detail ||
      !event.detail.target ||
      !root.contains(
        event.detail.target
      )
    ) {
      return;
    }

    const button =
      event.detail.button;

    if (button) {
      const dictionary =
        getDictionary(getLang());

      const ui =
        getUi(dictionary);

      button.setAttribute(
        'aria-label',
        event.detail.expanded
          ? ui.collapse
          : ui.expand
      );
    }

    if (!event.detail.expanded) {
      return;
    }

    const documentElement =
      event.detail.target.closest(
        '[data-archive-document]'
      );

    prepareReader(
      documentElement,
      {
        load: true
      }
    );
  }

  function bindGlobalHandlers() {
    if (globalHandlersBound) return;

    globalHandlersBound = true;

    document.addEventListener(
      'site:expanderchange',
      handleExpanderChange
    );

    window.addEventListener(
      'site:langchange',
      updateI18N
    );
  }

  function enter() {
    const root = render();

    if (!root) return null;

    updateI18N();

    /*
      Load only the small shared reader resources
      after Archive becomes visible.

      The PDF iframe itself remains unloaded until
      the visitor expands the document.
    */
    prepareAllReaders(root);

    return root;
  }

  function leave() {
    const root = getRoot();

    if (
      root &&
      window.PdfReader &&
      typeof window.PdfReader
        .closeFullscreenWithin ===
        'function'
    ) {
      window.PdfReader
        .closeFullscreenWithin(
          root,
          {
            restoreFocus: false
          }
        );
    }
  }

  window.ArchiveRender = {
    render,
    enter,
    leave,
    updateI18N,

    preparePdfReader:
      ensurePdfReaderResources
  };
})();