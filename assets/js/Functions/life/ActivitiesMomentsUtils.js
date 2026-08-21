(function () {
  'use strict';

  const DETAIL_PROMISES = Object.create(null);

  const INLINE_EMOTES = {
    '[旺柴]': {
      className: 'am-emote-wangchai',
      label: '旺柴',
      text: '🐶'
    },
    '[doge]': {
      className: 'am-emote-wangchai',
      label: 'doge',
      text: '🐶'
    },
    '[叹气]': {
      className: 'am-emote-sigh',
      label: '叹气',
      text: '😮‍💨'
    },
    '[sigh]': {
      className: 'am-emote-sigh',
      label: 'sigh',
      text: '😮‍💨'
    },
    '[苦涩]': {
      className: 'am-emote-bitter',
      label: '苦涩',
      text: '🥲'
    },
    '[bitter]': {
      className: 'am-emote-bitter',
      label: 'bitter',
      text: '🥲'
    },
    '[流泪]': {
      className: 'am-emote-crying',
      label: '流泪',
      text: '😭'
    },
    '[crying]': {
      className: 'am-emote-crying',
      label: 'crying',
      text: '😭'
    },
    '[捂脸]': {
      className: 'am-emote-bitter',
      label: '捂脸',
      text: '🤦'
    },
    '[facepalm]': {
      className: 'am-emote-bitter',
      label: 'facepalm',
      text: '🤦'
    },
    '[机智]': {
      className: 'am-emote-witty',
      label: '机智',
      text: '😏'
    },
    '[witty]': {
      className: 'am-emote-witty',
      label: 'witty',
      text: '😏'
    },
    '[憨笑]': {
      className: 'am-emote-smile',
      label: '憨笑',
      text: '😊'
    },
    '[smile]': {
      className: 'am-emote-smile',
      label: 'smile',
      text: '😊'
    },
    '[皱眉]': {
      className: 'am-emote-frown',
      label: '皱眉',
      text: '😟'
    },
    '[frown]': {
      className: 'am-emote-frown',
      label: 'frown',
      text: '😟'
    },
    '[好吃]': {
      className: 'am-emote-delicious',
      label: '好吃',
      text: '😋'
    },
    '[delicious]': {
      className: 'am-emote-delicious',
      label: 'delicious',
      text: '😋'
    },
    '[庆祝]': {
      className: 'am-emote-celebrate',
      label: '庆祝',
      text: '🎉'
    },
    '[celebrate]': {
      className: 'am-emote-celebrate',
      label: 'celebrate',
      text: '🎉'
    },
    '[玫瑰]': {
      className: 'am-emote-rose',
      label: '玫瑰',
      text: '🌹'
    },
    '[rose]': {
      className: 'am-emote-rose',
      label: 'rose',
      text: '🌹'
    },
    '[呲牙]': {
      className: 'am-emote-grin',
      label: '呲牙',
      text: '😁'
    },
    '[grin]': {
      className: 'am-emote-grin',
      label: 'grin',
      text: '😁'
    }
  };

  function getMount() {
    return document.getElementById('mount-activities_moments');
  }

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function toResourceLang(lang) {
    return lang === 'zh' ? 'ZH' : 'EN';
  }

  function getData(lang) {
    const current = lang === 'zh'
      ? window.ACTIVITIES_MOMENTS_ZH
      : window.ACTIVITIES_MOMENTS_EN;

    if (current) {
      if (!Array.isArray(current.items)) current.items = [];
      if (!Array.isArray(current.moments)) current.moments = [];
      return current;
    }

    return {
      ui: {},
      items: [],
      moments: []
    };
  }

  function getFallbackData(lang) {
    const fallbackLang = lang === 'zh' ? 'en' : 'zh';
    return getData(fallbackLang);
  }

  function getUi() {
    const lang = getLang();
    const primary = getData(lang).ui || {};
    const fallback = getFallbackData(lang).ui || {};

    return Object.assign({
      viewMoment: lang === 'zh' ? '观此一瞬' : 'View Moment',
      backToMoments: lang === 'zh' ? '返回行迹' : 'Back to Moments',
      close: lang === 'zh' ? '关闭' : 'Close',
      openImage: lang === 'zh' ? '查看图片' : 'Open image',
      loadingMoment: lang === 'zh' ? '正在加载这一瞬的完整内容……' : 'Loading this moment...'
    }, fallback, primary);
  }

  function getActivitiesConfig() {
    return window.SiteResources && window.SiteResources.activitiesMoments
      ? window.SiteResources.activitiesMoments
      : null;
  }

  function getDetailScript(lang, dateKey) {
    const config = getActivitiesConfig();
    const resourceLang = toResourceLang(lang);

    if (
      config &&
      typeof config.detailScript === 'function'
    ) {
      return config.detailScript(resourceLang, dateKey);
    }

    return './assets/js/Content/' + resourceLang + '/life/activities_moments_' + dateKey + '.js';
  }

  function getCatalogItems(lang) {
    const data = getData(lang);

    if (Array.isArray(data.items) && data.items.length) {
      return data.items;
    }

    if (Array.isArray(data.catalog) && data.catalog.length) {
      return data.catalog;
    }

    if (Array.isArray(data.moments)) {
      return data.moments;
    }

    return [];
  }

  function getDetailItems(lang) {
    const data = getData(lang);
    return Array.isArray(data.moments) ? data.moments : [];
  }

  function findByDateKey(items, dateKey) {
    return (Array.isArray(items) ? items : []).find((item) => {
      return item && item.dateKey === dateKey;
    }) || null;
  }

  function getCatalogMomentInLang(lang, dateKey) {
    return findByDateKey(getCatalogItems(lang), dateKey);
  }

  function getDetailMomentInLang(lang, dateKey) {
    return findByDateKey(getDetailItems(lang), dateKey);
  }

  function hasDetailInLang(lang, dateKey) {
    return !!getDetailMomentInLang(lang, dateKey);
  }

  function mergeMoment(catalog, detail) {
    if (!catalog && !detail) return null;
    return Object.assign({}, catalog || {}, detail || {});
  }

  function getMomentInLang(lang, dateKey) {
    return mergeMoment(
      getCatalogMomentInLang(lang, dateKey),
      getDetailMomentInLang(lang, dateKey)
    );
  }

  function ensureDetailLoaded(dateKey, lang) {
    const currentLang = lang === 'zh' ? 'zh' : 'en';

    if (!dateKey) return Promise.resolve(false);

    if (hasDetailInLang(currentLang, dateKey)) {
      return Promise.resolve(true);
    }

    const key = currentLang + ':' + dateKey;

    if (DETAIL_PROMISES[key]) {
      return DETAIL_PROMISES[key];
    }

    const src = getDetailScript(currentLang, dateKey);

    if (
      !src ||
      !window.SiteResourceLoader ||
      typeof window.SiteResourceLoader.loadScript !== 'function'
    ) {
      return Promise.resolve(false);
    }

    DETAIL_PROMISES[key] = window.SiteResourceLoader.loadScript(src)
      .then(() => hasDetailInLang(currentLang, dateKey))
      .catch((err) => {
        console.warn('[ActivitiesMoments] Failed to load detail:', dateKey, currentLang, err);
        return false;
      });

    return DETAIL_PROMISES[key];
  }

  async function ensureMomentDetail(dateKey) {
    const lang = getLang();

    if (hasDetailInLang(lang, dateKey)) {
      return true;
    }

    const loaded = await ensureDetailLoaded(dateKey, lang);
    if (loaded) return true;

    const fallbackLang = lang === 'zh' ? 'en' : 'zh';

    if (hasDetailInLang(fallbackLang, dateKey)) {
      return true;
    }

    return ensureDetailLoaded(dateKey, fallbackLang);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderInlineText(value) {
    const raw = String(value == null ? '' : value);
    const tokens = Object.keys(INLINE_EMOTES);

    if (!tokens.some((token) => raw.includes(token))) {
      return escapeHtml(raw);
    }

    const pattern = /(\[旺柴\]|\[doge\]|\[叹气\]|\[sigh\]|\[苦涩\]|\[bitter\]|\[流泪\]|\[crying\]|\[捂脸\]|\[facepalm\]|\[机智\]|\[witty\]|\[憨笑\]|\[smile\]|\[皱眉\]|\[frown\]|\[好吃\]|\[delicious\]|\[庆祝\]|\[celebrate\]|\[玫瑰\]|\[rose\]|\[呲牙\]|\[grin\])/g;

    return raw.split(pattern).map((part) => {
      const emote = INLINE_EMOTES[part];

      if (!emote) {
        return escapeHtml(part);
      }

      return '<span class="am-emote ' + emote.className + '" role="img" aria-label="' +
        escapeHtml(emote.label) + '" title="' + escapeHtml(emote.label) + '">' +
        escapeHtml(emote.text) +
        '</span>';
    }).join('');
  }

  function renderTitle(moment) {
    const parts = Array.isArray(moment && moment.titleParts) ? moment.titleParts : null;

    if (!parts || !parts.length) {
      return escapeHtml(moment && moment.title ? moment.title : '');
    }

    return parts.map((part) => {
      const text = escapeHtml(part && part.text ? part.text : '');

      if (part && part.italic) {
        return '<em>' + text + '</em>';
      }

      return text;
    }).join('');
  }

  function normalizePath(pathname) {
    return String(pathname || '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '') || '/';
  }

  function normalizeAssetUrl(src) {
    if (!src) return '';

    try {
      return new URL(src, document.baseURI).href;
    } catch (e) {
      return String(src);
    }
  }

  function getLifeBaseUrl() {
    return new URL('life/', document.baseURI);
  }

  function getListRoute() {
    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        'life/activities_moments',
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    return new URL('activities_moments/', getLifeBaseUrl()).pathname;
  }

  function getDetailRoute(dateKey) {
    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.buildLocalizedPath === 'function'
    ) {
      return window.BootstrapRoutes.buildLocalizedPath(
        'life/activities_moments/' + encodeURIComponent(dateKey),
        window.BootstrapRoutes.getCurrentLanguage()
      );
    }

    return new URL('activities_moments/' + encodeURIComponent(dateKey) + '/', getLifeBaseUrl()).pathname;
  }

  function pushRoute(path, replace) {
    if (
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.syncHistory === 'function'
    ) {
      window.BootstrapRoutes.syncHistory(
        path,
        replace === true
      );
    }
  }

  function resolveDateKeyFromPath(pathname) {
    const path =
      window.BootstrapRoutes &&
      typeof window.BootstrapRoutes.getBusinessPath === 'function'
        ? window.BootstrapRoutes.getBusinessPath(
            pathname || window.location.pathname
          )
        : pathname || window.location.pathname;

    const parts = normalizePath(path)
      .split('/')
      .filter(Boolean);

    const lifeIndex = parts.indexOf('life');
    if (lifeIndex < 0) return null;

    const sub = parts[lifeIndex + 1];
    const dateKey = parts[lifeIndex + 2];

    if (sub !== 'activities_moments') return null;
    if (!dateKey) return null;

    try {
      return decodeURIComponent(dateKey);
    } catch (e) {
      return dateKey;
    }
  }

  function sortMoments(moments) {
    return moments.slice().sort((a, b) => {
      const da = Date.parse(a.dateISO || '');
      const db = Date.parse(b.dateISO || '');

      if (Number.isFinite(db) && Number.isFinite(da) && db !== da) {
        return db - da;
      }

      return String(b.dateKey || '').localeCompare(String(a.dateKey || ''));
    });
  }

  function getSortedMoments() {
    const lang = getLang();
    const primary = getCatalogItems(lang);
    const fallback = getCatalogItems(lang === 'zh' ? 'en' : 'zh');

    return sortMoments(primary.length ? primary : fallback);
  }

  function getMomentByKey(dateKey) {
    const lang = getLang();
    const fallbackLang = lang === 'zh' ? 'en' : 'zh';

    return getMomentInLang(lang, dateKey)
      || getMomentInLang(fallbackLang, dateKey)
      || null;
  }

  function getMetaText(moment) {
    const pieces = [];

    if (moment.location) pieces.push(moment.location);
    if (moment.occasion) pieces.push(moment.occasion);
    if (moment.subtitle && !moment.location && !moment.occasion) pieces.push(moment.subtitle);

    return pieces.join(' · ');
  }

  window.ActivitiesMomentsUtils = {
    getMount,
    getLang,
    toResourceLang,
    getData,
    getFallbackData,
    getUi,
    getActivitiesConfig,
    getDetailScript,
    getCatalogItems,
    getDetailItems,
    findByDateKey,
    getCatalogMomentInLang,
    getDetailMomentInLang,
    hasDetailInLang,
    mergeMoment,
    getMomentInLang,
    ensureDetailLoaded,
    ensureMomentDetail,
    escapeHtml,
    renderInlineText,
    renderTitle,
    normalizePath,
    normalizeAssetUrl,
    getLifeBaseUrl,
    getListRoute,
    getDetailRoute,
    pushRoute,
    resolveDateKeyFromPath,
    sortMoments,
    getSortedMoments,
    getMomentByKey,
    getMetaText
  };
})();
