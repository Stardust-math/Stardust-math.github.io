#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
const CONFIG_PATH =
  'assets/js/Config/AboutArchiveConfig.js';
const DICTIONARY_PATHS = {
  en:
    'assets/js/Content/EN/about/archive/archive_EN.js',
  zh:
    'assets/js/Content/ZH/about/archive/archive_ZH.js'
};
const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;
const SAFE_FILTER_ID = /^[a-z][a-zA-Z0-9]*$/;
const PDF_SPREAD_MODES = new Set([
  'none',
  'odd',
  'even'
]);
const TAXONOMY_GROUPS = [
  'primaryCategories',
  'materialTypes',
  'subjects',
  'series',
  'roles',
  'languages',
  'tags'
];
const ARRAY_DOCUMENT_FIELDS = {
  subjects: 'subjects',
  roles: 'roles',
  languages: 'languages',
  tags: 'tags'
};
const FILTER_FIELD_CONTRACTS = {
  materialType: {
    taxonomy: 'materialTypes',
    multiple: false
  },
  subjects: {
    taxonomy: 'subjects',
    multiple: true
  },
  series: {
    taxonomy: 'series',
    multiple: false
  },
  year: {
    taxonomy: null,
    multiple: false
  },
  roles: {
    taxonomy: 'roles',
    multiple: true
  },
  languages: {
    taxonomy: 'languages',
    multiple: true
  }
};
const REQUIRED_UI_KEYS = [
  'searchLabel',
  'searchPlaceholder',
  'clearSearch',
  'filtersLabel',
  'allMaterials',
  'oneResult',
  'manyResults',
  'noResultsQuery',
  'noResultsFilters',
  'resetFilters',
  'expand',
  'collapse',
  'loadingReader',
  'readerUnavailable',
  'readerActions',
  'fullscreen',
  'openNewTab',
  'directOpen',
  'closeFullscreen',
  'previewSuffix',
  'fallbackPrefix',
  'fallbackSuffix',
  'resourcesLabel',
  'tagsLabel'
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readScript(relativePath) {
  const absolutePath = repoPath(relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function runScripts() {
  const sandbox = {
    console,
    window: {}
  };

  sandbox.global = sandbox.window;
  vm.createContext(sandbox);

  vm.runInContext(
    readScript(CONFIG_PATH),
    sandbox,
    {
      filename: CONFIG_PATH
    }
  );

  Object.values(DICTIONARY_PATHS)
    .forEach((relativePath) => {
      vm.runInContext(
        readScript(relativePath),
        sandbox,
        {
          filename: relativePath
        }
      );
    });

  return sandbox.window;
}

function isObject(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function requireString(value, label) {
  if (
    typeof value !== 'string' ||
    value.trim() === ''
  ) {
    fail(`${label} must be a non-empty string.`);
    return '';
  }

  return value.trim();
}

function requireSafeId(value, label) {
  const id = requireString(value, label);

  if (id && !SAFE_ID.test(id)) {
    fail(
      `${label} must match ${SAFE_ID}: ${id}`
    );
  }

  return id;
}

function buildTaxonomy(config) {
  const source = isObject(config.taxonomy)
    ? config.taxonomy
    : {};

  if (!isObject(config.taxonomy)) {
    fail('AboutArchiveConfig.taxonomy must be an object.');
  }

  const taxonomy = {};

  TAXONOMY_GROUPS.forEach((group) => {
    const items = source[group];
    const ids = new Set();
    const byId = new Map();

    if (!Array.isArray(items)) {
      fail(
        `AboutArchiveConfig.taxonomy.${group} must be an array.`
      );
      taxonomy[group] = {
        ids,
        byId
      };
      return;
    }

    items.forEach((item, index) => {
      const prefix =
        `AboutArchiveConfig.taxonomy.${group}[${index}]`;

      if (!isObject(item)) {
        fail(`${prefix} must be an object.`);
        return;
      }

      const id = requireSafeId(
        item.id,
        `${prefix}.id`
      );

      if (!id) return;

      if (ids.has(id)) {
        fail(
          `Duplicate taxonomy id in ${group}: ${id}`
        );
        return;
      }

      ids.add(id);
      byId.set(id, item);

      if (
        item.order !== undefined &&
        !Number.isFinite(Number(item.order))
      ) {
        fail(`${prefix}.order must be numeric.`);
      }
    });

    taxonomy[group] = {
      ids,
      byId
    };
  });

  const primaryIds =
    taxonomy.primaryCategories
      ? taxonomy.primaryCategories.ids
      : new Set();

  const materialTypes =
    taxonomy.materialTypes
      ? taxonomy.materialTypes.byId
      : new Map();

  materialTypes.forEach((item, id) => {
    const primaryCategory = requireSafeId(
      item.primaryCategory,
      `Material type ${id}.primaryCategory`
    );

    if (
      primaryCategory &&
      !primaryIds.has(primaryCategory)
    ) {
      fail(
        `Material type ${id} references unknown primary category: ${primaryCategory}`
      );
    }
  });

  return taxonomy;
}

function validateFilterDefinitions(config, taxonomy) {
  const search = config.search;

  if (!isObject(search)) {
    fail('AboutArchiveConfig.search must be an object.');
    return;
  }

  if (
    search.debounceMs !== undefined &&
    (
      !Number.isFinite(Number(search.debounceMs)) ||
      Number(search.debounceMs) < 0
    )
  ) {
    fail(
      'AboutArchiveConfig.search.debounceMs must be a non-negative number.'
    );
  }

  if (!Array.isArray(search.filters)) {
    fail(
      'AboutArchiveConfig.search.filters must be an array.'
    );
    return;
  }

  const ids = new Set();

  search.filters.forEach((filter, index) => {
    const prefix =
      `AboutArchiveConfig.search.filters[${index}]`;

    if (!isObject(filter)) {
      fail(`${prefix} must be an object.`);
      return;
    }

    const id = requireString(
      filter.id,
      `${prefix}.id`
    );

    if (id && !SAFE_FILTER_ID.test(id)) {
      fail(
        `${prefix}.id must match ${SAFE_FILTER_ID}: ${id}`
      );
    }
    const field = requireString(
      filter.field,
      `${prefix}.field`
    );

    if (id && ids.has(id)) {
      fail(`Duplicate Archive filter id: ${id}`);
    }
    ids.add(id);

    const contract = FILTER_FIELD_CONTRACTS[field];

    if (field && !contract) {
      fail(
        `${prefix}.field is not supported by ArchiveRender: ${field}`
      );
    }

    const declaredTaxonomy =
      filter.taxonomy === null
        ? null
        : requireString(
            filter.taxonomy,
            `${prefix}.taxonomy`
          );

    if (
      declaredTaxonomy &&
      !taxonomy[declaredTaxonomy]
    ) {
      fail(
        `${prefix}.taxonomy references an unknown taxonomy group: ${declaredTaxonomy}`
      );
    }

    if (
      contract &&
      declaredTaxonomy !== contract.taxonomy
    ) {
      fail(
        `${prefix}.taxonomy must be ${String(contract.taxonomy)} for field ${field}.`
      );
    }

    if (
      contract &&
      filter.multiple !== contract.multiple
    ) {
      fail(
        `${prefix}.multiple must be ${contract.multiple} for field ${field}.`
      );
    }

    if (
      filter.order !== undefined &&
      !Number.isFinite(Number(filter.order))
    ) {
      fail(`${prefix}.order must be numeric.`);
    }
  });
}

function validateLabels(
  dictionary,
  language,
  taxonomy
) {
  if (!isObject(dictionary.labels)) {
    fail(`${language} dictionary.labels must be an object.`);
    return;
  }

  TAXONOMY_GROUPS.forEach((group) => {
    const labels = dictionary.labels[group];

    if (!isObject(labels)) {
      fail(
        `${language} dictionary.labels.${group} must be an object.`
      );
      return;
    }

    const ids = taxonomy[group]
      ? taxonomy[group].ids
      : new Set();

    ids.forEach((id) => {
      requireString(
        labels[id],
        `${language} label ${group}.${id}`
      );
    });
  });

  if (!isObject(dictionary.labels.resourceTypes)) {
    fail(
      `${language} dictionary.labels.resourceTypes must be an object.`
    );
  }
}

function validateUi(dictionary, language, config) {
  if (!isObject(dictionary.ui)) {
    fail(`${language} dictionary.ui must be an object.`);
    return;
  }

  REQUIRED_UI_KEYS.forEach((key) => {
    requireString(
      dictionary.ui[key],
      `${language} dictionary.ui.${key}`
    );
  });

  const filters = Array.isArray(
    config.search && config.search.filters
  )
    ? config.search.filters
    : [];

  if (!isObject(dictionary.ui.filterLabels)) {
    fail(
      `${language} dictionary.ui.filterLabels must be an object.`
    );
  }

  if (!isObject(dictionary.ui.filterAll)) {
    fail(
      `${language} dictionary.ui.filterAll must be an object.`
    );
  }

  filters.forEach((filter) => {
    if (!filter || !filter.id) return;

    requireString(
      dictionary.ui.filterLabels &&
        dictionary.ui.filterLabels[filter.id],
      `${language} filter label ${filter.id}`
    );
    requireString(
      dictionary.ui.filterAll &&
        dictionary.ui.filterAll[filter.id],
      `${language} all-option label ${filter.id}`
    );
  });
}

function validateDisplayTitle(
  text,
  label
) {
  requireString(text.title, `${label}.title`);

  if (!Array.isArray(text.displayTitle)) {
    fail(`${label}.displayTitle must be an array.`);
    return;
  }

  if (!text.displayTitle.length) {
    fail(`${label}.displayTitle cannot be empty.`);
    return;
  }

  text.displayTitle.forEach((part, index) => {
    const prefix = `${label}.displayTitle[${index}]`;

    if (!isObject(part)) {
      fail(`${prefix} must be an object.`);
      return;
    }

    requireString(part.text, `${prefix}.text`);

    if (
      part.kind !== undefined &&
      !['', 'cite', 'person'].includes(
        String(part.kind)
      )
    ) {
      fail(
        `${prefix}.kind must be cite, person, or omitted.`
      );
    }
  });
}

function validateLocalizedDocument(
  dictionary,
  language,
  documentId,
  resourceIds
) {
  if (!isObject(dictionary)) {
    return;
  }

  if (!isObject(dictionary.documents)) {
    fail(`${language} dictionary.documents must be an object.`);
    return;
  }

  const text = dictionary.documents[documentId];
  const label =
    `${language} dictionary document ${documentId}`;

  if (!isObject(text)) {
    fail(`${label} is missing.`);
    return;
  }

  validateDisplayTitle(text, label);

  ['meta', 'notice', 'description']
    .forEach((field) => {
      if (
        text[field] !== undefined &&
        typeof text[field] !== 'string'
      ) {
        fail(`${label}.${field} must be a string.`);
      }
    });

  [
    ['creators', text.creators],
    ['searchAliases', text.searchAliases]
  ].forEach(([field, values]) => {
    if (values === undefined) return;

    if (!Array.isArray(values)) {
      fail(`${label}.${field} must be an array.`);
      return;
    }

    values.forEach((value, index) => {
      requireString(
        value,
        `${label}.${field}[${index}]`
      );
    });
  });

  if (
    text.resourceLabels !== undefined &&
    !isObject(text.resourceLabels)
  ) {
    fail(`${label}.resourceLabels must be an object.`);
  }

  if (isObject(text.resourceLabels)) {
    Object.entries(text.resourceLabels)
      .forEach(([resourceId, resourceLabel]) => {
        requireString(
          resourceLabel,
          `${label}.resourceLabels.${resourceId}`
        );

        if (!resourceIds.has(resourceId)) {
          fail(
            `${label}.resourceLabels references an unknown resource: ${resourceId}`
          );
        }
      });
  }
}

function validateLocalHref(href, label) {
  const relative = href.slice(2);
  const normalized = path.posix.normalize(
    relative.replace(/\\/g, '/')
  );

  if (
    normalized.startsWith('../') ||
    path.posix.isAbsolute(normalized)
  ) {
    fail(`${label} contains an unsafe local path: ${href}`);
    return;
  }

  if (!fs.existsSync(repoPath(normalized))) {
    fail(`${label} points to a missing file: ${href}`);
  }
}

function validateResource(
  resource,
  documentId,
  index,
  resourceIds
) {
  const prefix =
    `Document ${documentId}.resources[${index}]`;

  if (!isObject(resource)) {
    fail(`${prefix} must be an object.`);
    return null;
  }

  const id = requireSafeId(
    resource.id,
    `${prefix}.id`
  );
  const type = requireSafeId(
    resource.type || 'other',
    `${prefix}.type`
  );
  const href = requireString(
    resource.href,
    `${prefix}.href`
  );

  if (id && resourceIds.has(id)) {
    fail(
      `Document ${documentId} has duplicate resource id: ${id}`
    );
  }
  resourceIds.add(id);

  if (href.startsWith('./')) {
    validateLocalHref(href, `${prefix}.href`);
  } else if (/^https?:\/\//i.test(href)) {
    try {
      new URL(href);
    } catch (error) {
      fail(`${prefix}.href is not a valid URL: ${href}`);
    }
  } else {
    fail(
      `${prefix}.href must be a ./ local path or an HTTP(S) URL: ${href}`
    );
  }

  if (
    type === 'pdf' &&
    href &&
    !href.toLowerCase().endsWith('.pdf')
  ) {
    fail(
      `${prefix} is a PDF resource but does not use a .pdf path.`
    );
  }

  if (
    resource.order !== undefined &&
    !Number.isFinite(Number(resource.order))
  ) {
    fail(`${prefix}.order must be numeric.`);
  }

  if (
    resource.embed !== undefined &&
    typeof resource.embed !== 'boolean'
  ) {
    fail(`${prefix}.embed must be boolean.`);
  }

  if (type === 'pdf') {
    if (
      resource.initialPage !== undefined &&
      (
        !Number.isInteger(Number(resource.initialPage)) ||
        Number(resource.initialPage) < 1
      )
    ) {
      fail(
        `${prefix}.initialPage must be a positive integer.`
      );
    }

    ['zoom', 'pageMode'].forEach((field) => {
      if (resource[field] !== undefined) {
        requireString(
          resource[field],
          `${prefix}.${field}`
        );
      }
    });

    const spreadMode = requireString(
      resource.spreadMode,
      `${prefix}.spreadMode`
    );

    if (
      spreadMode &&
      !PDF_SPREAD_MODES.has(spreadMode)
    ) {
      fail(
        `${prefix}.spreadMode must be none, odd, or even.`
      );
    }
  }

  return {
    type,
    embedded: type === 'pdf' && resource.embed !== false
  };
}

function validateDocument(
  documentItem,
  index,
  taxonomy,
  dictionaries,
  documentIds
) {
  const prefix =
    `AboutArchiveConfig.documents[${index}]`;

  if (!isObject(documentItem)) {
    fail(`${prefix} must be an object.`);
    return;
  }

  const id = requireSafeId(
    documentItem.id,
    `${prefix}.id`
  );

  if (!id) return;

  if (documentIds.has(id)) {
    fail(`Duplicate Archive document id: ${id}`);
    return;
  }
  documentIds.add(id);

  const primaryCategory = requireSafeId(
    documentItem.primaryCategory,
    `${prefix}.primaryCategory`
  );

  if (
    primaryCategory &&
    !taxonomy.primaryCategories.ids.has(
      primaryCategory
    )
  ) {
    fail(
      `${prefix}.primaryCategory is unknown: ${primaryCategory}`
    );
  }

  if (documentItem.materialType !== undefined) {
    const materialType = requireSafeId(
      documentItem.materialType,
      `${prefix}.materialType`
    );
    const typeDefinition =
      taxonomy.materialTypes.byId.get(
        materialType
      );

    if (materialType && !typeDefinition) {
      fail(
        `${prefix}.materialType is unknown: ${materialType}`
      );
    }

    if (
      typeDefinition &&
      typeDefinition.primaryCategory !==
        primaryCategory
    ) {
      fail(
        `${prefix}.materialType ${materialType} belongs to ${typeDefinition.primaryCategory}, not ${primaryCategory}.`
      );
    }
  }

  if (documentItem.series !== undefined) {
    const series = requireSafeId(
      documentItem.series,
      `${prefix}.series`
    );

    if (
      series &&
      !taxonomy.series.ids.has(series)
    ) {
      fail(`${prefix}.series is unknown: ${series}`);
    }
  }

  Object.entries(ARRAY_DOCUMENT_FIELDS)
    .forEach(([field, taxonomyGroup]) => {
      const values = documentItem[field];

      if (values === undefined) return;

      if (!Array.isArray(values)) {
        fail(`${prefix}.${field} must be an array.`);
        return;
      }

      const seen = new Set();

      values.forEach((value, valueIndex) => {
        const itemId = requireSafeId(
          value,
          `${prefix}.${field}[${valueIndex}]`
        );

        if (!itemId) return;

        if (seen.has(itemId)) {
          fail(
            `${prefix}.${field} contains duplicate id: ${itemId}`
          );
        }
        seen.add(itemId);

        if (
          !taxonomy[taxonomyGroup].ids.has(
            itemId
          )
        ) {
          fail(
            `${prefix}.${field} references unknown ${taxonomyGroup} id: ${itemId}`
          );
        }
      });
    });

  if (documentItem.date !== undefined) {
    const date = requireString(
      documentItem.date,
      `${prefix}.date`
    );

    if (date && !/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
      fail(
        `${prefix}.date must use a valid YYYY-MM value: ${date}`
      );
    }

    if (
      date &&
      documentItem.year !== undefined &&
      Number(date.slice(0, 4)) !==
        Number(documentItem.year)
    ) {
      fail(
        `${prefix}.year does not match ${prefix}.date.`
      );
    }
  }

  if (
    documentItem.year !== undefined &&
    !Number.isInteger(Number(documentItem.year))
  ) {
    fail(`${prefix}.year must be an integer.`);
  }

  if (
    documentItem.order !== undefined &&
    !Number.isFinite(Number(documentItem.order))
  ) {
    fail(`${prefix}.order must be numeric.`);
  }

  if (
    documentItem.defaultOpen !== undefined &&
    typeof documentItem.defaultOpen !== 'boolean'
  ) {
    fail(`${prefix}.defaultOpen must be boolean.`);
  }

  const resources = documentItem.resources;

  if (
    resources !== undefined &&
    !Array.isArray(resources)
  ) {
    fail(`${prefix}.resources must be an array.`);
  }

  const resourceIds = new Set();
  let embeddedPdfCount = 0;

  if (Array.isArray(resources)) {
    resources.forEach((resource, resourceIndex) => {
      const result = validateResource(
        resource,
        id,
        resourceIndex,
        resourceIds
      );

      if (result && result.embedded) {
        embeddedPdfCount += 1;
      }

      if (result) {
        Object.entries(dictionaries)
          .forEach(([language, dictionary]) => {
            requireString(
              dictionary &&
                dictionary.labels &&
                dictionary.labels.resourceTypes &&
                dictionary.labels.resourceTypes[
                  result.type
                ],
              `${language} resource type label ${result.type}`
            );
          });
      }
    });
  }

  if (embeddedPdfCount > 1) {
    fail(
      `Document ${id} has more than one embedded PDF; ArchiveRender uses one primary reader.`
    );
  }

  Object.entries(dictionaries)
    .forEach(([language, dictionary]) => {
      validateLocalizedDocument(
        dictionary,
        language,
        id,
        resourceIds
      );
    });

  const localizedDescriptions = Object.values(
    dictionaries
  )
    .filter(isObject)
    .map((dictionary) => {
      const text =
        dictionary.documents &&
        dictionary.documents[id];

      return isObject(text) &&
        typeof text.description === 'string'
        ? text.description.trim()
        : '';
    });

  if (
    localizedDescriptions.some(Boolean) &&
    localizedDescriptions.some((value) => !value)
  ) {
    fail(
      `Document ${id} must provide its expanded description in every configured language or omit it in all languages.`
    );
  }
}

function validateDictionaryDocumentKeys(
  dictionary,
  language,
  documentIds
) {
  if (!isObject(dictionary.documents)) return;

  Object.keys(dictionary.documents)
    .forEach((id) => {
      if (!documentIds.has(id)) {
        fail(
          `${language} dictionary contains an unconfigured document: ${id}`
        );
      }
    });
}

function main() {
  let windowObject;

  try {
    windowObject = runScripts();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }

  const config = windowObject.AboutArchiveConfig;
  const dictionaries = {
    en: windowObject.ABOUT_ARCHIVE_EN,
    zh: windowObject.ABOUT_ARCHIVE_ZH
  };

  if (!isObject(config)) {
    fail('window.AboutArchiveConfig was not created.');
  }

  if (Number(config && config.schemaVersion) !== 3) {
    fail(
      'AboutArchiveConfig.schemaVersion must be 3.'
    );
  }

  if (
    config &&
    config.exclusiveOpen !== undefined &&
    typeof config.exclusiveOpen !== 'boolean'
  ) {
    fail('AboutArchiveConfig.exclusiveOpen must be boolean.');
  }

  if (
    config &&
    config.grouping !== undefined &&
    !isObject(config.grouping)
  ) {
    fail('AboutArchiveConfig.grouping must be an object.');
  }

  if (
    config &&
    isObject(config.grouping) &&
    config.grouping.seriesMinimumSize !== undefined &&
    (
      !Number.isInteger(
        Number(config.grouping.seriesMinimumSize)
      ) ||
      Number(config.grouping.seriesMinimumSize) < 2
    )
  ) {
    fail(
      'AboutArchiveConfig.grouping.seriesMinimumSize must be an integer of at least 2.'
    );
  }

  Object.entries(dictionaries)
    .forEach(([language, dictionary]) => {
      if (!isObject(dictionary)) {
        fail(
          `The ${language} Archive dictionary was not created.`
        );
      }
    });

  const taxonomy = buildTaxonomy(config || {});
  validateFilterDefinitions(
    config || {},
    taxonomy
  );

  Object.entries(dictionaries)
    .forEach(([language, dictionary]) => {
      if (!isObject(dictionary)) return;

      validateLabels(
        dictionary,
        language,
        taxonomy
      );
      validateUi(
        dictionary,
        language,
        config || {}
      );
    });

  const documents =
    config && Array.isArray(config.documents)
      ? config.documents
      : [];

  if (!Array.isArray(config && config.documents)) {
    fail(
      'AboutArchiveConfig.documents must be an array.'
    );
  }

  const documentIds = new Set();

  documents.forEach((documentItem, index) => {
    validateDocument(
      documentItem,
      index,
      taxonomy,
      dictionaries,
      documentIds
    );
  });

  Object.entries(dictionaries)
    .forEach(([language, dictionary]) => {
      if (!isObject(dictionary)) return;

      validateDictionaryDocumentKeys(
        dictionary,
        language,
        documentIds
      );
    });

  if (config && config.exclusiveOpen === true) {
    const defaultOpenCount = documents.filter(
      (documentItem) =>
        documentItem &&
        documentItem.defaultOpen === true
    ).length;

    if (defaultOpenCount > 1) {
      fail(
        'Only one Archive document may use defaultOpen when exclusiveOpen is true.'
      );
    }
  }

  if (errors.length) {
    console.error(
      `About Archive check failed with ${errors.length} issue${
        errors.length === 1 ? '' : 's'
      }:`
    );
    errors.forEach((message) => {
      console.error(`- ${message}`);
    });
    process.exit(1);
  }

  console.log(
    'About Archive check passed: ' +
    `${documents.length} document(s), ` +
    `${taxonomy.primaryCategories.ids.size} primary category definition(s), ` +
    `${taxonomy.materialTypes.ids.size} material type definition(s).`
  );
}

main();
