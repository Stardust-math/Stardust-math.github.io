(function () {
  'use strict';

  const ROOT_ID = 'about-archive';
  const MOUNT_ID = 'mount-about-archive';
  const DEFAULT_DEBOUNCE_MS = 120;

  let pdfResourcesPromise = null;
  let globalHandlersBound = false;
  let filterTimer = 0;
  let catalog = null;
  let lastResultCount = 0;

  const filterState = {
    query: '',
    primaryCategory: '',
    selections: Object.create(null)
  };

  function getLang() {
    if (
      window.SiteLang &&
      typeof window.SiteLang.getLang === 'function'
    ) {
      return window.SiteLang.getLang() === 'zh'
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

  function getDictionaries() {
    return [
      window.ABOUT_ARCHIVE_EN,
      window.ABOUT_ARCHIVE_ZH
    ].filter(Boolean);
  }

  function getConfig() {
    return (
      window.AboutArchiveConfig || {
        exclusiveOpen: true,
        search: {
          debounceMs: DEFAULT_DEBOUNCE_MS,
          filters: []
        },
        grouping: {
          seriesMinimumSize: 2
        },
        taxonomy: {},
        documents: []
      }
    );
  }

  function getMount() {
    return document.getElementById(MOUNT_ID);
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function asArray(value) {
    return Array.isArray(value)
      ? value
      : [];
  }

  function hasText(value) {
    return (
      typeof value === 'string' &&
      value.trim() !== ''
    );
  }

  function hasValue(value) {
    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    );
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeSelector(value) {
    const text = String(
      value == null ? '' : value
    );

    if (
      window.CSS &&
      typeof window.CSS.escape === 'function'
    ) {
      return window.CSS.escape(text);
    }

    return text.replace(/[\\"]/g, '\\$&');
  }

  function formatText(template, values) {
    const source = String(template || '');
    const replacements =
      values && typeof values === 'object'
        ? values
        : {};

    return source.replace(
      /\{([a-zA-Z0-9_]+)\}/g,
      function (match, key) {
        return Object.prototype.hasOwnProperty.call(
          replacements,
          key
        )
          ? String(replacements[key])
          : match;
      }
    );
  }

  function normalizeUnicode(value) {
    const text = String(value == null ? '' : value);

    if (typeof text.normalize !== 'function') {
      return text;
    }

    try {
      return text.normalize('NFKC');
    } catch (error) {
      return text;
    }
  }

  function normalizeText(value) {
    return normalizeUnicode(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function tokenize(value) {
    const normalized = normalizeText(value);

    return normalized
      ? normalized.split(' ')
      : [];
  }

  function getUi(dictionary) {
    return (
      dictionary &&
      dictionary.ui
    ) || {};
  }

  function getLabels(dictionary, group) {
    return (
      dictionary &&
      dictionary.labels &&
      dictionary.labels[group]
    ) || {};
  }

  function getLabel(dictionary, group, id) {
    if (!hasValue(id)) return '';

    const labels = getLabels(dictionary, group);
    const key = String(id);

    return typeof labels[key] === 'string'
      ? labels[key]
      : key;
  }

  function getDocumentText(dictionary, id) {
    return (
      dictionary &&
      dictionary.documents &&
      dictionary.documents[id]
    ) || {
      title: id,
      displayTitle: [],
      creators: [],
      meta: '',
      notice: '',
      description: '',
      searchAliases: [],
      resourceLabels: {}
    };
  }

  function getDisplayTitleParts(text) {
    if (
      text &&
      Array.isArray(text.displayTitle) &&
      text.displayTitle.length
    ) {
      return text.displayTitle.map(function (part) {
        if (
          part &&
          typeof part === 'object'
        ) {
          return {
            text: String(part.text || ''),
            kind: String(part.kind || '')
          };
        }

        return {
          text: String(part || ''),
          kind: ''
        };
      });
    }

    return [
      {
        text: String(
          text && text.title
            ? text.title
            : ''
        ),
        kind: ''
      }
    ];
  }

  function getPlainTitle(text) {
    if (text && hasText(text.title)) {
      return text.title.trim();
    }

    return getDisplayTitleParts(text)
      .map(function (part) {
        return part.text;
      })
      .join('');
  }

  function renderDocumentTitle(text) {
    return getDisplayTitleParts(text)
      .map(function (part) {
        const escaped = escapeHtml(part.text);

        if (part.kind === 'cite') {
          return (
            '<cite class="archive-document-book-title">' +
            escaped +
            '</cite>'
          );
        }

        if (part.kind === 'person') {
          return (
            '<span class="archive-document-person">' +
            escaped +
            '</span>'
          );
        }

        return escaped;
      })
      .join('');
  }

  function updateDocumentTitle(element, text) {
    if (!element) return;
    element.innerHTML = renderDocumentTitle(text);
  }

  function getTaxonomyItems(config, group) {
    const taxonomy =
      config && config.taxonomy
        ? config.taxonomy
        : {};

    return asArray(taxonomy[group])
      .slice()
      .sort(function (a, b) {
        return (
          Number(a && a.order || 0) -
          Number(b && b.order || 0)
        );
      });
  }

  function createTaxonomyIndex(config) {
    const groups = [
      'primaryCategories',
      'materialTypes',
      'subjects',
      'series',
      'roles',
      'languages',
      'tags'
    ];
    const result = Object.create(null);

    groups.forEach(function (group) {
      const byId = new Map();
      const orderById = new Map();
      const items = getTaxonomyItems(config, group);

      items.forEach(function (item, index) {
        if (!item || !hasValue(item.id)) return;

        const id = String(item.id);
        byId.set(id, item);
        orderById.set(
          id,
          Number.isFinite(Number(item.order))
            ? Number(item.order)
            : index
        );
      });

      result[group] = {
        items: items,
        byId: byId,
        orderById: orderById
      };
    });

    return result;
  }

  function taxonomyOrder(taxonomy, group, id) {
    const index = taxonomy[group];

    if (
      index &&
      index.orderById.has(String(id))
    ) {
      return index.orderById.get(String(id));
    }

    return Number.MAX_SAFE_INTEGER;
  }

  function normalizeResources(resources) {
    return asArray(resources)
      .filter(function (resource) {
        return (
          resource &&
          typeof resource === 'object' &&
          hasValue(resource.id) &&
          hasValue(resource.href)
        );
      })
      .map(function (resource) {
        return Object.assign({}, resource, {
          id: String(resource.id),
          type: String(resource.type || 'other'),
          href: String(resource.href),
          order: Number(resource.order || 0)
        });
      })
      .sort(function (a, b) {
        return a.order - b.order;
      });
  }

  function normalizeDocuments(config) {
    return asArray(config.documents)
      .filter(function (documentItem) {
        return (
          documentItem &&
          typeof documentItem === 'object' &&
          hasValue(documentItem.id)
        );
      })
      .map(function (documentItem) {
        const normalized = Object.assign(
          {},
          documentItem,
          {
            id: String(documentItem.id),
            primaryCategory: String(
              documentItem.primaryCategory || ''
            ),
            materialType: String(
              documentItem.materialType || ''
            ),
            series: String(
              documentItem.series || ''
            ),
            subjects: asArray(
              documentItem.subjects
            ).map(String),
            roles: asArray(
              documentItem.roles
            ).map(String),
            languages: asArray(
              documentItem.languages
            ).map(String),
            tags: asArray(
              documentItem.tags
            ).map(String),
            date: String(
              documentItem.date || ''
            ),
            year: hasValue(documentItem.year)
              ? String(documentItem.year)
              : '',
            resources: normalizeResources(
              documentItem.resources
            ),
            order: Number.isFinite(
              Number(documentItem.order)
            )
              ? Number(documentItem.order)
              : Number.MAX_SAFE_INTEGER
          }
        );

        normalized.primaryPdf =
          normalized.resources.find(
            function (resource) {
              return (
                resource.type === 'pdf' &&
                resource.embed !== false
              );
            }
          ) || null;

        return normalized;
      });
  }

  function collectDocumentSearchValues(
    documentItem,
    dictionary
  ) {
    const text = getDocumentText(
      dictionary,
      documentItem.id
    );
    const values = [
      getPlainTitle(text),
      text.meta,
      text.notice,
      text.description,
      ...asArray(text.creators),
      ...asArray(text.searchAliases),
      getLabel(
        dictionary,
        'primaryCategories',
        documentItem.primaryCategory
      ),
      getLabel(
        dictionary,
        'materialTypes',
        documentItem.materialType
      ),
      getLabel(
        dictionary,
        'series',
        documentItem.series
      ),
      ...documentItem.subjects.map(function (id) {
        return getLabel(
          dictionary,
          'subjects',
          id
        );
      }),
      ...documentItem.roles.map(function (id) {
        return getLabel(
          dictionary,
          'roles',
          id
        );
      }),
      ...documentItem.languages.map(function (id) {
        return getLabel(
          dictionary,
          'languages',
          id
        );
      }),
      ...documentItem.tags.map(function (id) {
        return getLabel(
          dictionary,
          'tags',
          id
        );
      })
    ];

    return values.filter(hasValue);
  }

  function buildSearchIndex(documentItem) {
    const values = [
      documentItem.id,
      documentItem.primaryCategory,
      documentItem.materialType,
      documentItem.series,
      documentItem.date,
      documentItem.year,
      ...documentItem.subjects,
      ...documentItem.roles,
      ...documentItem.languages,
      ...documentItem.tags
    ];

    getDictionaries().forEach(function (dictionary) {
      values.push(
        ...collectDocumentSearchValues(
          documentItem,
          dictionary
        )
      );
    });

    return normalizeText(
      values.filter(hasValue).join(' ')
    );
  }

  function sortDocuments(documents, taxonomy) {
    return documents.slice().sort(function (a, b) {
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      const aTitle = getPlainTitle(
        getDocumentText(
          window.ABOUT_ARCHIVE_EN,
          a.id
        )
      );
      const bTitle = getPlainTitle(
        getDocumentText(
          window.ABOUT_ARCHIVE_EN,
          b.id
        )
      );

      if (aTitle !== bTitle) {
        return aTitle.localeCompare(bTitle, 'en');
      }

      return (
        taxonomyOrder(
          taxonomy,
          'primaryCategories',
          a.primaryCategory
        ) -
        taxonomyOrder(
          taxonomy,
          'primaryCategories',
          b.primaryCategory
        )
      );
    });
  }

  function getDocumentFieldValues(
    documentItem,
    filterDefinition
  ) {
    const value = documentItem[
      filterDefinition.field
    ];

    if (filterDefinition.multiple === true) {
      return asArray(value)
        .map(String)
        .filter(hasText);
    }

    return hasValue(value)
      ? [String(value)]
      : [];
  }

  function sortFilterValues(
    values,
    filterDefinition,
    taxonomy
  ) {
    const result = values.slice();

    if (filterDefinition.id === 'year') {
      return result.sort(function (a, b) {
        return Number(b) - Number(a);
      });
    }

    return result.sort(function (a, b) {
      const taxonomyGroup =
        filterDefinition.taxonomy;

      return (
        taxonomyOrder(
          taxonomy,
          taxonomyGroup,
          a
        ) -
        taxonomyOrder(
          taxonomy,
          taxonomyGroup,
          b
        )
      );
    });
  }

  function createFilterControls(
    documents,
    config,
    taxonomy
  ) {
    const definitions = asArray(
      config.search && config.search.filters
    )
      .slice()
      .sort(function (a, b) {
        return (
          Number(a && a.order || 0) -
          Number(b && b.order || 0)
        );
      });

    if (documents.length < 2) {
      return [];
    }

    return definitions
      .map(function (definition) {
        const counts = new Map();

        documents.forEach(function (documentItem) {
          const values = new Set(
            getDocumentFieldValues(
              documentItem,
              definition
            )
          );

          values.forEach(function (value) {
            counts.set(
              value,
              (counts.get(value) || 0) + 1
            );
          });
        });

        const values = sortFilterValues(
          Array.from(counts.keys()),
          definition,
          taxonomy
        ).filter(function (value) {
          return counts.get(value) < documents.length;
        });

        if (!values.length) {
          return null;
        }

        return {
          id: String(definition.id),
          field: String(definition.field),
          taxonomy: definition.taxonomy
            ? String(definition.taxonomy)
            : '',
          multiple:
            definition.multiple === true,
          options: values.map(function (value) {
            return {
              id: value,
              count: counts.get(value) || 0
            };
          })
        };
      })
      .filter(Boolean);
  }

  function createPrimaryControls(
    documents,
    taxonomy
  ) {
    const counts = new Map();

    documents.forEach(function (documentItem) {
      if (!documentItem.primaryCategory) return;

      counts.set(
        documentItem.primaryCategory,
        (counts.get(
          documentItem.primaryCategory
        ) || 0) + 1
      );
    });

    if (counts.size < 2) {
      return [];
    }

    return Array.from(counts.keys())
      .sort(function (a, b) {
        return (
          taxonomyOrder(
            taxonomy,
            'primaryCategories',
            a
          ) -
          taxonomyOrder(
            taxonomy,
            'primaryCategories',
            b
          )
        );
      })
      .map(function (id) {
        return {
          id: id,
          count: counts.get(id) || 0
        };
      });
  }

  function createCatalog() {
    const config = getConfig();
    const taxonomy = createTaxonomyIndex(config);
    const documents = sortDocuments(
      normalizeDocuments(config),
      taxonomy
    );
    const byId = new Map();

    documents.forEach(function (documentItem) {
      documentItem.searchIndex =
        buildSearchIndex(documentItem);
      byId.set(documentItem.id, documentItem);
    });

    return {
      config: config,
      taxonomy: taxonomy,
      documents: documents,
      byId: byId,
      elements: new Map(),
      primaryControls: createPrimaryControls(
        documents,
        taxonomy
      ),
      filterControls: createFilterControls(
        documents,
        config,
        taxonomy
      )
    };
  }

  function compareTaxonomyIds(group, a, b) {
    return (
      taxonomyOrder(
        catalog.taxonomy,
        group,
        a
      ) -
      taxonomyOrder(
        catalog.taxonomy,
        group,
        b
      )
    );
  }

  function groupBy(items, keyGetter) {
    const groups = new Map();

    items.forEach(function (item) {
      const key = String(keyGetter(item) || '');

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(item);
    });

    return groups;
  }

  function renderCount(value) {
    return (
      '<span class="archive-group-count" ' +
      'data-archive-group-count>' +
      escapeHtml(value) +
      '</span>'
    );
  }

  function renderTags(documentItem, dictionary) {
    const tags = [];

    documentItem.subjects.forEach(function (id) {
      tags.push({
        group: 'subjects',
        id: id
      });
    });

    documentItem.tags.forEach(function (id) {
      tags.push({
        group: 'tags',
        id: id
      });
    });

    if (!tags.length) return '';

    return (
      '<div class="archive-document-tags" ' +
      'aria-label="' +
      escapeHtml(
        getUi(dictionary).tagsLabel || ''
      ) +
      '">' +
      tags.map(function (tag) {
        return (
          '<span class="archive-document-tag" ' +
          'data-archive-label-group="' +
          escapeHtml(tag.group) +
          '" data-archive-label-id="' +
          escapeHtml(tag.id) +
          '">' +
          escapeHtml(
            getLabel(
              dictionary,
              tag.group,
              tag.id
            )
          ) +
          '</span>'
        );
      }).join('') +
      '</div>'
    );
  }

  function getResourceLabel(
    dictionary,
    text,
    resource
  ) {
    const localLabels =
      text && text.resourceLabels
        ? text.resourceLabels
        : {};

    if (
      typeof localLabels[resource.id] ===
      'string'
    ) {
      return localLabels[resource.id];
    }

    return getLabel(
      dictionary,
      'resourceTypes',
      resource.type
    );
  }

  function renderResourceLinks(
    documentItem,
    dictionary,
    text
  ) {
    const resources = documentItem.resources.filter(
      function (resource) {
        return resource !== documentItem.primaryPdf;
      }
    );

    if (!resources.length) return '';

    const ui = getUi(dictionary);

    return (
      '<nav class="archive-document-links" ' +
      'aria-label="' +
      escapeHtml(ui.resourcesLabel || '') +
      '">' +
      resources.map(function (resource) {
        return (
          '<a class="archive-document-link" ' +
          'href="' +
          escapeHtml(resource.href) +
          '" target="_blank" ' +
          'rel="noopener noreferrer" ' +
          'data-archive-resource-id="' +
          escapeHtml(resource.id) +
          '" data-archive-resource-type="' +
          escapeHtml(resource.type) +
          '" data-cursor="link_select" ' +
          'data-cursor-fallback="pointer">' +
          escapeHtml(
            getResourceLabel(
              dictionary,
              text,
              resource
            )
          ) +
          '</a>'
        );
      }).join('') +
      '</nav>'
    );
  }

  function getPdfResourceConfig() {
    const resources = window.SiteResources || {};

    return {
      style:
        resources.styles &&
        resources.styles.optional
          ? resources.styles.optional.pdfReader
          : '',
      script:
        resources.scripts &&
        resources.scripts.optional
          ? resources.scripts.optional.pdfReader
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

    const loader = window.SiteResourceLoader;
    const resourceConfig =
      getPdfResourceConfig();

    if (
      !loader ||
      typeof loader.loadStyle !== 'function' ||
      typeof loader.loadScript !== 'function' ||
      !resourceConfig.style ||
      !resourceConfig.script
    ) {
      return Promise.resolve(false);
    }

    pdfResourcesPromise = Promise.all([
      loader.loadStyle(resourceConfig.style),
      loader.loadScript(resourceConfig.script)
    ])
      .then(function () {
        return Boolean(window.PdfReader);
      })
      .catch(function (error) {
        console.warn(
          '[ArchiveRender] Failed to load the PDF reader.',
          error
        );
        return false;
      })
      .then(function (ready) {
        if (!ready) {
          pdfResourcesPromise = null;
        }

        return ready;
      });

    return pdfResourcesPromise;
  }

  function renderReader(
    documentItem,
    text,
    dictionary
  ) {
    const pdf = documentItem.primaryPdf;

    if (!pdf) return '';

    const ui = getUi(dictionary);
    const plainTitle = getPlainTitle(text);
    const pdfPath = escapeHtml(pdf.href);

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
        >${escapeHtml(ui.directOpen || '')}</a>
      </p>
      <div
        class="pdf-reader archive-pdf-reader"
        data-pdf-reader
        data-pdf-document-id="${escapeHtml(
          documentItem.id
        )}"
        data-pdf-src="${pdfPath}"
        data-pdf-page="${escapeHtml(
          pdf.initialPage || 1
        )}"
        data-pdf-zoom="${escapeHtml(
          pdf.zoom || 'page-width'
        )}"
        data-pdf-page-mode="${escapeHtml(
          pdf.pageMode || 'bookmarks'
        )}"
        data-pdf-spread-mode="${escapeHtml(
          pdf.spreadMode || 'odd'
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
          >${escapeHtml(ui.fullscreen || '')}</button>
          <a
            class="pdf-reader-action"
            href="${pdfPath}"
            target="_blank"
            rel="noopener noreferrer"
            data-pdf-new-tab
            data-archive-ui="openNewTab"
            data-cursor="link_select"
            data-cursor-fallback="pointer"
          >${escapeHtml(ui.openNewTab || '')}</a>
        </div>
        <div
          class="pdf-reader-fullscreen-bar"
          aria-hidden="true"
        >
          <span
            class="pdf-reader-fullscreen-title"
            data-archive-fullscreen-title
          >${renderDocumentTitle(text)}</span>
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
            >${escapeHtml(ui.openNewTab || '')}</a>
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
            title="${escapeHtml(
              plainTitle +
              ' ' +
              (ui.previewSuffix || '')
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
          >${escapeHtml(ui.directOpen || '')}</a><span
            data-archive-ui="fallbackSuffix"
          >${escapeHtml(
            ui.fallbackSuffix || ''
          )}</span>
        </p>
      </div>
    `;
  }

  function renderExpandedContent(
    documentItem,
    text,
    dictionary
  ) {
    const description = hasText(text.description)
      ? (
          '<p class="archive-document-description" ' +
          'data-archive-document-description>' +
          escapeHtml(text.description) +
          '</p>'
        )
      : (
          '<p class="archive-document-description" ' +
          'data-archive-document-description hidden></p>'
        );

    return (
      description +
      renderReader(
        documentItem,
        text,
        dictionary
      )
    );
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
      'archive-document-' + documentItem.id;
    const hasLocalizedDescription =
      getDictionaries().some(function (dictionary) {
        return hasText(
          getDocumentText(
            dictionary,
            documentItem.id
          ).description
        );
      });
    const hasExpandedContent = Boolean(
      documentItem.primaryPdf ||
      hasLocalizedDescription
    );
    const isOpen =
      hasExpandedContent &&
      documentItem.defaultOpen === true;
    const exclusive =
      getConfig().exclusiveOpen !== false;
    const expander = hasExpandedContent
      ? `
        <button
          class="expander archive-document-expander${
            isOpen ? ' is-open' : ''
          }"
          type="button"
          data-expand-target="${escapeHtml(rowId)}"
          data-expand-key="${escapeHtml(
            documentItem.id
          )}"
          data-expand-group="about-archive-documents"
          data-expand-exclusive="${
            exclusive ? 'true' : 'false'
          }"
          aria-controls="${escapeHtml(rowId)}"
          aria-expanded="${
            isOpen ? 'true' : 'false'
          }"
          aria-label="${escapeHtml(
            isOpen
              ? ui.collapse || ''
              : ui.expand || ''
          )}"
          data-cursor="help"
        >
          <i
            class="fas fa-chevron-right"
            aria-hidden="true"
          ></i>
        </button>
      `
      : '';
    const expanded = hasExpandedContent
      ? `
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
            ${renderExpandedContent(
              documentItem,
              text,
              dictionary
            )}
          </div>
        </div>
      `
      : '';

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
            <div class="archive-document-title-line">
              <div
                class="archive-document-title"
                data-archive-document-title
              >${renderDocumentTitle(text)}</div>
              ${expander}
            </div>
            <div
              class="archive-document-notice"
              data-archive-document-notice
              ${
                hasText(text.notice)
                  ? ''
                  : 'hidden'
              }
            >${escapeHtml(text.notice || '')}</div>
            ${renderTags(
              documentItem,
              dictionary
            )}
            ${renderResourceLinks(
              documentItem,
              dictionary,
              text
            )}
          </div>
          <div
            class="archive-document-meta"
            data-archive-document-meta
            ${
              hasText(text.meta)
                ? ''
                : 'hidden'
            }
          >${escapeHtml(text.meta || '')}</div>
        </div>
        ${expanded}
      </article>
    `;
  }

  function renderDocumentList(
    documents,
    dictionary,
    className
  ) {
    if (!documents.length) return '';

    return (
      '<div class="archive-document-list ' +
      escapeHtml(className || '') +
      '">' +
      documents.map(function (documentItem) {
        return renderDocument(
          documentItem,
          dictionary
        );
      }).join('') +
      '</div>'
    );
  }

  function renderTypeDocuments(
    documents,
    dictionary
  ) {
    const threshold = Math.max(
      2,
      Number(
        catalog.config.grouping &&
        catalog.config.grouping.seriesMinimumSize
      ) || 2
    );
    const seriesGroups = groupBy(
      documents.filter(function (item) {
        return hasText(item.series);
      }),
      function (item) {
        return item.series;
      }
    );
    const displayedSeries = Array.from(
      seriesGroups.keys()
    )
      .filter(function (seriesId) {
        return (
          seriesGroups.get(seriesId).length >=
          threshold
        );
      })
      .sort(function (a, b) {
        return compareTaxonomyIds(
          'series',
          a,
          b
        );
      });
    const displayedSet = new Set(
      displayedSeries
    );
    const ungrouped = documents.filter(
      function (item) {
        return !displayedSet.has(item.series);
      }
    );
    const sections = [];

    if (ungrouped.length) {
      sections.push(
        renderDocumentList(
          ungrouped,
          dictionary,
          'archive-document-list-ungrouped'
        )
      );
    }

    displayedSeries.forEach(function (seriesId) {
      const seriesDocuments =
        seriesGroups.get(seriesId) || [];

      sections.push(`
        <section
          class="archive-series"
          data-archive-series-section
          data-archive-series="${escapeHtml(
            seriesId
          )}"
        >
          <h4 class="archive-series-title">
            <span
              data-archive-label-group="series"
              data-archive-label-id="${escapeHtml(
                seriesId
              )}"
            >${escapeHtml(
              getLabel(
                dictionary,
                'series',
                seriesId
              )
            )}</span>
            ${renderCount(seriesDocuments.length)}
          </h4>
          ${renderDocumentList(
            seriesDocuments,
            dictionary,
            'archive-document-list-series'
          )}
        </section>
      `);
    });

    return sections.join('');
  }

  function renderCategory(
    categoryId,
    documents,
    dictionary
  ) {
    const typeGroups = groupBy(
      documents,
      function (item) {
        return item.materialType;
      }
    );
    const typeIds = Array.from(
      typeGroups.keys()
    )
      .filter(hasText)
      .sort(function (a, b) {
        return compareTaxonomyIds(
          'materialTypes',
          a,
          b
        );
      });
    const directDocuments =
      typeGroups.get('') || [];
    const contents = [];

    if (directDocuments.length) {
      contents.push(
        renderDocumentList(
          directDocuments,
          dictionary,
          'archive-document-list-direct'
        )
      );
    }

    typeIds.forEach(function (typeId) {
      const typeDocuments =
        typeGroups.get(typeId) || [];

      contents.push(`
        <section
          class="archive-material-type"
          data-archive-type-section
          data-archive-material-type="${escapeHtml(
            typeId
          )}"
        >
          <h3 class="archive-material-type-title">
            <span
              data-archive-label-group="materialTypes"
              data-archive-label-id="${escapeHtml(
                typeId
              )}"
            >${escapeHtml(
              getLabel(
                dictionary,
                'materialTypes',
                typeId
              )
            )}</span>
            ${renderCount(typeDocuments.length)}
          </h3>
          ${renderTypeDocuments(
            typeDocuments,
            dictionary
          )}
        </section>
      `);
    });

    return `
      <section
        class="archive-category"
        data-archive-category-section
        data-archive-primary-category="${escapeHtml(
          categoryId
        )}"
      >
        <h2 class="archive-category-title">
          <span
            data-archive-label-group="primaryCategories"
            data-archive-label-id="${escapeHtml(
              categoryId
            )}"
          >${escapeHtml(
            getLabel(
              dictionary,
              'primaryCategories',
              categoryId
            )
          )}</span>
          ${renderCount(documents.length)}
        </h2>
        ${contents.join('')}
      </section>
    `;
  }

  function renderCatalog(dictionary) {
    const categoryGroups = groupBy(
      catalog.documents,
      function (item) {
        return item.primaryCategory;
      }
    );
    const categoryIds = Array.from(
      categoryGroups.keys()
    ).sort(function (a, b) {
      return compareTaxonomyIds(
        'primaryCategories',
        a,
        b
      );
    });

    return categoryIds
      .map(function (categoryId) {
        return renderCategory(
          categoryId,
          categoryGroups.get(categoryId) || [],
          dictionary
        );
      })
      .join('');
  }

  function getFilterLabel(
    dictionary,
    filterControl,
    value
  ) {
    if (filterControl.id === 'year') {
      return String(value);
    }

    return getLabel(
      dictionary,
      filterControl.taxonomy,
      value
    );
  }

  function renderPrimaryControls(dictionary) {
    if (!catalog.primaryControls.length) {
      return '';
    }

    const ui = getUi(dictionary);

    return `
      <div
        class="archive-primary-filters"
        role="group"
        aria-label="${escapeHtml(
          ui.filtersLabel || ''
        )}"
      >
        <button
          class="archive-primary-filter is-active"
          type="button"
          data-archive-primary-filter=""
          aria-pressed="true"
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >
          <span data-archive-primary-filter-label>
            ${escapeHtml(ui.allMaterials || '')}
          </span>
        </button>
        ${catalog.primaryControls.map(
          function (control) {
            return `
              <button
                class="archive-primary-filter"
                type="button"
                data-archive-primary-filter="${escapeHtml(
                  control.id
                )}"
                aria-pressed="false"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >
                <span
                  data-archive-label-group="primaryCategories"
                  data-archive-label-id="${escapeHtml(
                    control.id
                  )}"
                >${escapeHtml(
                  getLabel(
                    dictionary,
                    'primaryCategories',
                    control.id
                  )
                )}</span>
              </button>
            `;
          }
        ).join('')}
      </div>
    `;
  }

  function renderFilterControls(dictionary) {
    if (!catalog.filterControls.length) {
      return '';
    }

    const ui = getUi(dictionary);
    const filterLabels = ui.filterLabels || {};
    const filterAll = ui.filterAll || {};

    return (
      '<div class="archive-select-filters">' +
      catalog.filterControls.map(function (control) {
        return `
          <label class="archive-filter-field">
            <span class="archive-visually-hidden">
              ${escapeHtml(
                filterLabels[control.id] ||
                control.id
              )}
            </span>
            <select
              class="archive-filter-select"
              data-archive-filter="${escapeHtml(
                control.id
              )}"
              aria-label="${escapeHtml(
                filterLabels[control.id] ||
                control.id
              )}"
              data-cursor="precise_select"
              data-cursor-fallback="pointer"
            >
              <option value="" data-archive-filter-all>
                ${escapeHtml(
                  filterAll[control.id] ||
                  filterLabels[control.id] ||
                  control.id
                )}
              </option>
              ${control.options.map(
                function (option) {
                  return `
                    <option
                      value="${escapeHtml(
                        option.id
                      )}"
                      data-archive-filter-option="${escapeHtml(
                        option.id
                      )}"
                    >${escapeHtml(
                      getFilterLabel(
                        dictionary,
                        control,
                        option.id
                      )
                    )}</option>
                  `;
                }
              ).join('')}
            </select>
            <i
              class="fas fa-chevron-down archive-filter-icon"
              aria-hidden="true"
            ></i>
          </label>
        `;
      }).join('') +
      '</div>'
    );
  }

  function formatResultCount(dictionary, count) {
    const ui = getUi(dictionary);

    if (count === 1) {
      return ui.oneResult || '1';
    }

    return formatText(
      ui.manyResults || '{count}',
      {
        count: count
      }
    );
  }

  function renderToolbar(dictionary) {
    const ui = getUi(dictionary);
    const hasControls = Boolean(
      catalog.primaryControls.length ||
      catalog.filterControls.length
    );

    return `
      <section
        class="archive-toolbar"
        aria-label="${escapeHtml(
          ui.filtersLabel || ''
        )}"
        data-archive-toolbar
      >
        <div class="archive-search-field">
          <span
            class="archive-search-icon"
            aria-hidden="true"
          >
            <i class="fas fa-magnifying-glass"></i>
          </span>
          <input
            class="archive-search-input"
            type="search"
            role="searchbox"
            inputmode="search"
            enterkeyhint="search"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            aria-label="${escapeHtml(
              ui.searchLabel || ''
            )}"
            placeholder="${escapeHtml(
              ui.searchPlaceholder || ''
            )}"
            data-archive-search-input
          />
          <button
            class="archive-search-clear"
            type="button"
            aria-label="${escapeHtml(
              ui.clearSearch || ''
            )}"
            title="${escapeHtml(
              ui.clearSearch || ''
            )}"
            data-archive-search-clear
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
            hidden
          >
            <i
              class="fas fa-xmark"
              aria-hidden="true"
            ></i>
          </button>
        </div>
        <div
          class="archive-toolbar-controls"
          ${hasControls ? '' : 'hidden'}
        >
          ${renderPrimaryControls(dictionary)}
          ${renderFilterControls(dictionary)}
        </div>
        <div class="archive-toolbar-status">
          <span
            class="archive-result-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-archive-result-count
          >${escapeHtml(
            formatResultCount(
              dictionary,
              catalog.documents.length
            )
          )}</span>
        </div>
      </section>
    `;
  }

  function createMarkup(dictionary) {
    return `
      ${renderToolbar(dictionary)}
      <div
        class="archive-empty-state"
        data-archive-empty-state
        hidden
      >
        <p data-archive-empty-message></p>
        <button
          class="archive-empty-reset"
          type="button"
          data-archive-reset
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >${escapeHtml(
          getUi(dictionary).resetFilters || ''
        )}</button>
      </div>
      <div
        class="archive-catalog"
        data-archive-catalog
      >
        ${renderCatalog(dictionary)}
      </div>
    `;
  }

  function ensureRoot() {
    let root = getRoot();

    if (root) return root;

    if (
      window.About &&
      typeof window.About.init === 'function'
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
    return window.ContentExpanders || null;
  }

  function initializeExpanders(root) {
    const expanders = getExpanders();

    if (
      !root ||
      !expanders ||
      typeof expanders.init !== 'function'
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
      ).find(function (reader) {
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
    stateName
  ) {
    if (!documentElement) return;

    const status = documentElement.querySelector(
      '[data-archive-reader-status]'
    );

    if (!status) return;

    const dictionary = getDictionary(getLang());
    const ui = getUi(dictionary);
    const text = status.querySelector(
      '[data-archive-reader-status-text]'
    );
    const directLink = status.querySelector(
      '[data-archive-reader-status-link]'
    );

    status.dataset.state = stateName;

    if (stateName === 'loading') {
      if (text) {
        text.textContent = ui.loadingReader || '';
      }

      if (directLink) {
        directLink.hidden = true;
      }

      status.hidden = false;
      return;
    }

    if (stateName === 'error') {
      if (text) {
        text.textContent = ui.readerUnavailable || '';
      }

      if (directLink) {
        directLink.textContent = ui.directOpen || '';
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
    const id = documentElement.getAttribute(
      'data-archive-document-id'
    );
    const reader = findReader(id);

    if (!reader) {
      return Promise.resolve(false);
    }

    setReaderStatus(documentElement, 'loading');

    return ensurePdfReaderResources()
      .then(function (ready) {
        if (!ready || !window.PdfReader) {
          setReaderStatus(
            documentElement,
            'error'
          );
          return false;
        }

        reader.hidden = false;
        window.PdfReader.init(reader);
        setReaderStatus(documentElement, 'idle');

        const expander =
          documentElement.querySelector(
            'button.expander' +
            '[data-expand-target]'
          );
        const shouldLoad = Boolean(
          opts.load === true &&
          expander &&
          expander.getAttribute(
            'aria-expanded'
          ) === 'true'
        );

        if (shouldLoad) {
          window.PdfReader.load(reader);
        }

        if (
          window.CustomCursorAPI &&
          typeof window.CustomCursorAPI.refresh ===
            'function'
        ) {
          window.CustomCursorAPI.refresh(
            documentElement
          );
        }

        return true;
      });
  }

  function indexDocumentElements(root) {
    if (!root || !catalog) return;

    catalog.elements.clear();

    root.querySelectorAll(
      '[data-archive-document]'
    ).forEach(function (documentElement) {
      const id = documentElement.getAttribute(
        'data-archive-document-id'
      );

      if (id) {
        catalog.elements.set(id, documentElement);
      }
    });
  }

  function documentMatches(
    documentItem,
    tokens
  ) {
    if (
      filterState.primaryCategory &&
      documentItem.primaryCategory !==
        filterState.primaryCategory
    ) {
      return false;
    }

    const controls = catalog.filterControls;

    for (let index = 0; index < controls.length; index += 1) {
      const control = controls[index];
      const selected =
        filterState.selections[control.id] || '';

      if (!selected) continue;

      const values = getDocumentFieldValues(
        documentItem,
        control
      );

      if (!values.includes(selected)) {
        return false;
      }
    }

    return tokens.every(function (token) {
      return documentItem.searchIndex.includes(token);
    });
  }

  function closeDocument(documentElement) {
    if (!documentElement) return;

    const expander = documentElement.querySelector(
      'button.expander[aria-expanded="true"]'
    );

    if (expander) {
      expander.click();
    }
  }

  function unloadDocumentReader(documentElement) {
    if (!documentElement) return false;

    const id = documentElement.getAttribute(
      'data-archive-document-id'
    );
    const reader = findReader(id);

    if (
      !reader ||
      !window.PdfReader ||
      typeof window.PdfReader.unload !==
        'function'
    ) {
      return false;
    }

    return window.PdfReader.unload(reader);
  }

  function countVisibleDocuments(element) {
    return Array.from(
      element.querySelectorAll(
        '[data-archive-document]'
      )
    ).filter(function (documentElement) {
      return !documentElement.hidden;
    }).length;
  }

  function updateGroupVisibility(root) {
    [
      '[data-archive-series-section]',
      '[data-archive-type-section]',
      '[data-archive-category-section]'
    ].forEach(function (selector) {
      root.querySelectorAll(selector)
        .forEach(function (section) {
          const count =
            countVisibleDocuments(section);
          const counter = section.querySelector(
            ':scope > * [data-archive-group-count], ' +
            ':scope > [data-archive-group-count]'
          );

          section.hidden = count === 0;

          if (counter) {
            counter.textContent = String(count);
          }
        });
    });
  }

  function updateResultCount(
    root,
    dictionary,
    count
  ) {
    const result = root.querySelector(
      '[data-archive-result-count]'
    );

    if (!result) return;

    result.textContent = formatResultCount(
      dictionary,
      count
    );
  }

  function updateEmptyState(
    root,
    dictionary,
    count
  ) {
    const empty = root.querySelector(
      '[data-archive-empty-state]'
    );

    if (!empty) return;

    const message = empty.querySelector(
      '[data-archive-empty-message]'
    );
    const ui = getUi(dictionary);
    const query = filterState.query.trim();

    empty.hidden = count !== 0;

    if (!message || count !== 0) return;

    message.textContent = query
      ? formatText(
          ui.noResultsQuery || '',
          {
            query: query
          }
        )
      : (
          ui.noResultsFilters || ''
        );
  }

  function updateSearchClear(root) {
    const clear = root.querySelector(
      '[data-archive-search-clear]'
    );

    if (clear) {
      clear.hidden = !hasText(filterState.query);
    }
  }

  function applyFilters() {
    const root = getRoot();

    if (!root || !catalog) return 0;

    const tokens = tokenize(filterState.query);
    let count = 0;

    catalog.documents.forEach(function (documentItem) {
      const documentElement =
        catalog.elements.get(documentItem.id) ||
        root.querySelector(
          '[data-archive-document-id="' +
          escapeSelector(documentItem.id) +
          '"]'
        );

      if (!documentElement) return;

      const matches = documentMatches(
        documentItem,
        tokens
      );

      if (!matches && !documentElement.hidden) {
        closeDocument(documentElement);
        unloadDocumentReader(documentElement);
      }

      documentElement.hidden = !matches;

      if (matches) {
        count += 1;
      }
    });

    updateGroupVisibility(root);

    const dictionary = getDictionary(getLang());
    updateResultCount(root, dictionary, count);
    updateEmptyState(root, dictionary, count);
    updateSearchClear(root);

    const catalogElement = root.querySelector(
      '[data-archive-catalog]'
    );

    if (catalogElement) {
      catalogElement.hidden = count === 0;
    }

    lastResultCount = count;
    return count;
  }

  function clearFilterTimer() {
    if (!filterTimer) return;

    window.clearTimeout(filterTimer);
    filterTimer = 0;
  }

  function scheduleFilters(immediate) {
    clearFilterTimer();

    if (immediate) {
      applyFilters();
      return;
    }

    const delay = Math.max(
      0,
      Number(
        catalog &&
        catalog.config.search &&
        catalog.config.search.debounceMs
      ) || DEFAULT_DEBOUNCE_MS
    );

    filterTimer = window.setTimeout(function () {
      filterTimer = 0;
      applyFilters();
    }, delay);
  }

  function syncControls(root) {
    const input = root.querySelector(
      '[data-archive-search-input]'
    );

    if (input && input.value !== filterState.query) {
      input.value = filterState.query;
    }

    root.querySelectorAll(
      '[data-archive-primary-filter]'
    ).forEach(function (button) {
      const value = button.getAttribute(
        'data-archive-primary-filter'
      ) || '';
      const active =
        value === filterState.primaryCategory;

      button.classList.toggle('is-active', active);
      button.setAttribute(
        'aria-pressed',
        active ? 'true' : 'false'
      );
    });

    catalog.filterControls.forEach(
      function (control) {
        const select = root.querySelector(
          '[data-archive-filter="' +
          escapeSelector(control.id) +
          '"]'
        );

        if (select) {
          select.value =
            filterState.selections[
              control.id
            ] || '';
        }
      }
    );

    updateSearchClear(root);
  }

  function focusSearchInput(root) {
    if (!root) return;

    const input = root.querySelector(
      '[data-archive-search-input]'
    );

    if (!input) return;

    try {
      input.focus({
        preventScroll: true
      });
    } catch (error) {
      input.focus();
    }
  }

  function clearSearch(options) {
    const opts = options || {};
    const root = getRoot();

    filterState.query = '';

    if (root) {
      syncControls(root);
      scheduleFilters(true);

      if (opts.focus === true) {
        focusSearchInput(root);
      }
    }
  }

  function resetFilters(options) {
    const opts = options || {};
    const root = getRoot();

    filterState.query = '';
    filterState.primaryCategory = '';
    filterState.selections = Object.create(null);

    if (root) {
      syncControls(root);
      scheduleFilters(true);

      if (opts.focus === true) {
        focusSearchInput(root);
      }
    }
  }

  function handleRootInput(event) {
    const input = event.target.closest(
      '[data-archive-search-input]'
    );

    if (!input) return;

    filterState.query = input.value;
    updateSearchClear(getRoot());
    scheduleFilters(false);
  }

  function handleRootChange(event) {
    const select = event.target.closest(
      '[data-archive-filter]'
    );

    if (!select) return;

    const id = select.getAttribute(
      'data-archive-filter'
    );

    if (!id) return;

    filterState.selections[id] =
      select.value || '';
    scheduleFilters(true);
  }

  function handleRootClick(event) {
    const clear = event.target.closest(
      '[data-archive-search-clear]'
    );

    if (clear) {
      event.preventDefault();
      clearSearch({
        focus: true
      });
      return;
    }

    const reset = event.target.closest(
      '[data-archive-reset]'
    );

    if (reset) {
      event.preventDefault();
      resetFilters({
        focus: true
      });
      return;
    }

    const categoryButton = event.target.closest(
      '[data-archive-primary-filter]'
    );

    if (!categoryButton) return;

    event.preventDefault();
    filterState.primaryCategory =
      categoryButton.getAttribute(
        'data-archive-primary-filter'
      ) || '';

    syncControls(getRoot());
    scheduleFilters(true);
  }

  function handleRootKeydown(event) {
    const input = event.target.closest(
      '[data-archive-search-input]'
    );

    if (!input) return;

    if (event.key === 'Enter') {
      clearFilterTimer();
      applyFilters();
      input.blur();
      return;
    }

    if (event.key !== 'Escape') return;

    event.preventDefault();

    if (hasText(filterState.query)) {
      filterState.query = '';
      input.value = '';
      updateSearchClear(getRoot());
      scheduleFilters(true);
    } else {
      input.blur();
    }
  }

  function bindRootHandlers(root) {
    if (
      !root ||
      root.dataset.archiveHandlersBound === '1'
    ) {
      return;
    }

    root.dataset.archiveHandlersBound = '1';
    root.addEventListener('input', handleRootInput);
    root.addEventListener('change', handleRootChange);
    root.addEventListener('click', handleRootClick);
    root.addEventListener(
      'keydown',
      handleRootKeydown
    );
  }

  function updateToolbarI18N(
    root,
    dictionary
  ) {
    const ui = getUi(dictionary);
    const toolbar = root.querySelector(
      '[data-archive-toolbar]'
    );
    const input = root.querySelector(
      '[data-archive-search-input]'
    );
    const clear = root.querySelector(
      '[data-archive-search-clear]'
    );
    const allLabel = root.querySelector(
      '[data-archive-primary-filter-label]'
    );
    const reset = root.querySelector(
      '[data-archive-reset]'
    );

    if (toolbar) {
      toolbar.setAttribute(
        'aria-label',
        ui.filtersLabel || ''
      );
    }

    if (input) {
      input.setAttribute(
        'aria-label',
        ui.searchLabel || ''
      );
      input.setAttribute(
        'placeholder',
        ui.searchPlaceholder || ''
      );
    }

    if (clear) {
      clear.setAttribute(
        'aria-label',
        ui.clearSearch || ''
      );
      clear.setAttribute(
        'title',
        ui.clearSearch || ''
      );
    }

    if (allLabel) {
      allLabel.textContent =
        ui.allMaterials || '';
    }

    if (reset) {
      reset.textContent =
        ui.resetFilters || '';
    }

    const filterLabels = ui.filterLabels || {};
    const filterAll = ui.filterAll || {};

    catalog.filterControls.forEach(
      function (control) {
        const select = root.querySelector(
          '[data-archive-filter="' +
          escapeSelector(control.id) +
          '"]'
        );

        if (!select) return;

        select.setAttribute(
          'aria-label',
          filterLabels[control.id] ||
            control.id
        );

        const allOption = select.querySelector(
          '[data-archive-filter-all]'
        );

        if (allOption) {
          allOption.textContent =
            filterAll[control.id] ||
            filterLabels[control.id] ||
            control.id;
        }

        control.options.forEach(
          function (option) {
            const optionElement =
              select.querySelector(
                '[data-archive-filter-option="' +
                escapeSelector(option.id) +
                '"]'
              );

            if (optionElement) {
              optionElement.textContent =
                getFilterLabel(
                  dictionary,
                  control,
                  option.id
                );
            }
          }
        );
      }
    );

    updateResultCount(
      root,
      dictionary,
      lastResultCount
    );
  }

  function updateDocumentI18N(
    documentElement,
    dictionary
  ) {
    const id = documentElement.getAttribute(
      'data-archive-document-id'
    );
    const documentItem = catalog.byId.get(id);

    if (!documentItem) return;

    const text = getDocumentText(dictionary, id);
    const ui = getUi(dictionary);
    const title = documentElement.querySelector(
      '[data-archive-document-title]'
    );
    const meta = documentElement.querySelector(
      '[data-archive-document-meta]'
    );
    const notice = documentElement.querySelector(
      '[data-archive-document-notice]'
    );
    const description = documentElement.querySelector(
      '[data-archive-document-description]'
    );
    const expander = documentElement.querySelector(
      'button.expander'
    );

    updateDocumentTitle(title, text);

    if (meta) {
      meta.textContent = text.meta || '';
      meta.hidden = !hasText(text.meta);
    }

    if (notice) {
      notice.textContent = text.notice || '';
      notice.hidden = !hasText(text.notice);
    }

    if (description) {
      description.textContent =
        text.description || '';
      description.hidden =
        !hasText(text.description);
    }

    if (expander) {
      const open = expander.getAttribute(
        'aria-expanded'
      ) === 'true';

      expander.setAttribute(
        'aria-label',
        open
          ? ui.collapse || ''
          : ui.expand || ''
      );
    }

    documentElement.querySelectorAll(
      '[data-archive-resource-id]'
    ).forEach(function (link) {
      const resourceId = link.getAttribute(
        'data-archive-resource-id'
      );
      const resource = documentItem.resources.find(
        function (candidate) {
          return candidate.id === resourceId;
        }
      );

      if (resource) {
        link.textContent = getResourceLabel(
          dictionary,
          text,
          resource
        );
      }
    });

    const tags = documentElement.querySelector(
      '.archive-document-tags'
    );

    if (tags) {
      tags.setAttribute(
        'aria-label',
        ui.tagsLabel || ''
      );
    }

    const links = documentElement.querySelector(
      '.archive-document-links'
    );

    if (links) {
      links.setAttribute(
        'aria-label',
        ui.resourcesLabel || ''
      );
    }

    const status = documentElement.querySelector(
      '[data-archive-reader-status]'
    );

    if (status && !status.hidden) {
      const statusText = status.querySelector(
        '[data-archive-reader-status-text]'
      );
      const statusLink = status.querySelector(
        '[data-archive-reader-status-link]'
      );

      if (
        statusText &&
        status.dataset.state === 'loading'
      ) {
        statusText.textContent =
          ui.loadingReader || '';
      }

      if (
        statusText &&
        status.dataset.state === 'error'
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

    const fullscreenTitle = reader.querySelector(
      '[data-archive-fullscreen-title]'
    );

    updateDocumentTitle(fullscreenTitle, text);

    const frame = reader.querySelector(
      '.pdf-reader-frame'
    );

    if (frame) {
      frame.title =
        getPlainTitle(text) +
        ' ' +
        (ui.previewSuffix || '');
    }

    const actionBar = reader.querySelector(
      '[data-archive-reader-actions]'
    );

    if (actionBar) {
      actionBar.setAttribute(
        'aria-label',
        ui.readerActions || ''
      );
    }

    const closeButton = reader.querySelector(
      '[data-pdf-fullscreen-close]'
    );

    if (closeButton) {
      closeButton.setAttribute(
        'aria-label',
        ui.closeFullscreen || ''
      );
    }

    reader.querySelectorAll('[data-archive-ui]')
      .forEach(function (element) {
        const key = element.getAttribute(
          'data-archive-ui'
        );

        if (
          key &&
          typeof ui[key] === 'string'
        ) {
          element.textContent = ui[key];
        }
      });
  }

  function updateI18N() {
    const root = getRoot();

    if (!root || !catalog) return null;

    const dictionary = getDictionary(getLang());

    if (!dictionary) return root;

    root.querySelectorAll(
      '[data-archive-label-group]' +
      '[data-archive-label-id]'
    ).forEach(function (element) {
      const group = element.getAttribute(
        'data-archive-label-group'
      );
      const id = element.getAttribute(
        'data-archive-label-id'
      );

      element.textContent = getLabel(
        dictionary,
        group,
        id
      );
    });

    root.querySelectorAll(
      '[data-archive-document]'
    ).forEach(function (documentElement) {
      updateDocumentI18N(
        documentElement,
        dictionary
      );
    });

    updateToolbarI18N(root, dictionary);
    updateEmptyState(
      root,
      dictionary,
      lastResultCount
    );

    root.dataset.renderedLang = getLang();
    return root;
  }

  function render() {
    const root = ensureRoot();

    if (!root) return null;

    if (
      root.dataset.archiveRendered !== '1'
    ) {
      catalog = createCatalog();
      lastResultCount = catalog.documents.length;

      const dictionary = getDictionary(getLang());
      root.innerHTML = createMarkup(dictionary);
      root.dataset.archiveRendered = '1';
      root.dataset.renderedLang = getLang();

      indexDocumentElements(root);
      bindRootHandlers(root);
      initializeExpanders(root);
      syncControls(root);
      applyFilters();

      root.querySelectorAll(
        '[data-archive-document]'
      ).forEach(function (documentElement) {
        const expander =
          documentElement.querySelector(
            'button.expander' +
            '[aria-expanded="true"]'
          );

        if (expander) {
          prepareReader(
            documentElement,
            {
              load: true
            }
          );
        }
      });

      if (
        window.CustomCursorAPI &&
        typeof window.CustomCursorAPI.refresh ===
          'function'
      ) {
        window.CustomCursorAPI.refresh(root);
      }
    } else {
      updateI18N();
      syncControls(root);
      applyFilters();
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
      !root.contains(event.detail.target)
    ) {
      return;
    }

    const button = event.detail.button;

    if (button) {
      const ui = getUi(
        getDictionary(getLang())
      );

      button.setAttribute(
        'aria-label',
        event.detail.expanded
          ? ui.collapse || ''
          : ui.expand || ''
      );
    }

    if (!event.detail.expanded) return;

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
    applyFilters();
    return root;
  }

  function leave() {
    clearFilterTimer();

    const root = getRoot();

    if (
      root &&
      window.PdfReader &&
      typeof window.PdfReader
        .closeFullscreenWithin === 'function'
    ) {
      window.PdfReader.closeFullscreenWithin(
        root,
        {
          restoreFocus: false
        }
      );
    }
  }

  window.ArchiveRender = {
    render: render,
    enter: enter,
    leave: leave,
    updateI18N: updateI18N,
    resetFilters: resetFilters,
    preparePdfReader: ensurePdfReaderResources
  };
})();
