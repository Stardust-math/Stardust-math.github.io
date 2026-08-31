(function () {
  'use strict';

  const DEFAULT_VIEW =
    'activities_moments';

  const VIEW_ALIASES = {
    activities_moments:
      'activities_moments',

    activities:
      'activities_moments',

    moments:
      'activities_moments',

    meditations:
      'meditations'
  };

  const I18N = {
    en: {
      life_heading:
        'Vignettes of a Fleeting Life',

      activities_moments:
        'Activities & Moments',

      meditations:
        'Meditations',

      sections_label:
        'Life sections',

      top_nav_life:
        'Life'
    },

    zh: {
      life_heading:
        '浮生一隅',

      activities_moments:
        '岁时行迹',

      meditations:
        '沉思录',

      sections_label:
        '人生分区',

      top_nav_life:
        '人生'
    }
  };

  let currentView = DEFAULT_VIEW;

  function normalizeView(view) {
    const key = String(
      view || ''
    )
      .trim()
      .toLowerCase();

    return VIEW_ALIASES[key] || null;
  }

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

  function getDict() {
    const lang = getLang();

    return I18N[lang] || I18N.en;
  }

  function applyLifeI18N() {
    const dict = getDict();

    document
      .querySelectorAll(
        '#life [data-life-i18n]'
      )
      .forEach((element) => {
        const key =
          element.getAttribute(
            'data-life-i18n'
          );

        if (!key) return;

        const value = dict[key];

        if (
          typeof value === 'string'
        ) {
          element.textContent = value;
        }
      });

    const topLife =
      document.querySelector(
        '.top-nav-link[data-page="life"]'
      );

    if (topLife) {
      topLife.textContent =
        dict.top_nav_life;
    }

    const switcher =
      document.querySelector(
        '#life .life-switcher'
      );

    if (switcher) {
      switcher.setAttribute(
        'aria-label',
        dict.sections_label
      );
    }
  }

  function renderActivitiesMoments() {
    const mount =
      document.getElementById(
        'mount-activities_moments'
      );

    if (!mount) return;

    if (
      window.ActivitiesMoments &&
      typeof window.ActivitiesMoments
        .renderCurrent === 'function'
    ) {
      window.ActivitiesMoments
        .renderCurrent({
          scroll: false
        });

      return;
    }

    if (!mount.firstElementChild) {
      mount.innerHTML =
        '<div class="' +
        'activities_moments is-empty' +
        '"></div>';
    }
  }

  function renderMeditations(options) {
    const opts = options || {};

    const mount =
      document.getElementById(
        'mount-meditations'
      );

    if (!mount) return;

    if (
      window.LifeMeditations &&
      typeof window.LifeMeditations
        .ensureCurrent === 'function'
    ) {
      window.LifeMeditations
        .ensureCurrent({
          preserveState:
            opts.preserveState === true
        });

      return;
    }

    if (!mount.firstElementChild) {
      mount.innerHTML = `
        <div id="meditations">
          <div class="container">
            <div class="section">
              <p class="medit-loading">
                Loading Meditations...
              </p>
            </div>
          </div>
        </div>
      `;
    }
  }

  function leaveMeditations() {
    if (
      window.LifeMeditations &&
      typeof window.LifeMeditations.leave ===
        'function'
    ) {
      window.LifeMeditations.leave();
    }
  }

  function setLifeView(view) {
    const normalized =
      normalizeView(view) ||
      DEFAULT_VIEW;

    const previousView =
      currentView;

    if (
      previousView === 'meditations' &&
      normalized !== 'meditations'
    ) {
      leaveMeditations();
    }

    currentView = normalized;

    applyLifeI18N();

    document
      .querySelectorAll(
        '#life .life-switch-btn'
      )
      .forEach((button) => {
        const buttonView =
          normalizeView(
            button.dataset.view
          );

        const active =
          buttonView === normalized;

        button.classList.toggle(
          'active',
          active
        );

        button.setAttribute(
          'aria-selected',
          active ? 'true' : 'false'
        );

        button.setAttribute(
          'tabindex',
          active ? '0' : '-1'
        );
      });

    document
      .querySelectorAll(
        '#life .life-section'
      )
      .forEach((section) => {
        const sectionView =
          normalizeView(
            section.dataset.view
          );

        const active =
          sectionView === normalized;

        section.classList.toggle(
          'active',
          active
        );

        section.toggleAttribute(
          'hidden',
          !active
        );
      });

    if (
      normalized ===
      'activities_moments'
    ) {
      renderActivitiesMoments();
    }

    if (
      normalized ===
      'meditations'
    ) {
      renderMeditations();
    }

    return normalized;
  }

  function getCurrentView() {
    return currentView;
  }

  function initLifePage() {
    const life =
      document.getElementById(
        'life'
      );

    if (!life) return;

    applyLifeI18N();

    if (
      window.ActivitiesMoments &&
      typeof window.ActivitiesMoments
        .init === 'function'
    ) {
      window.ActivitiesMoments.init();
    } else {
      renderActivitiesMoments();
    }

    const active =
      life.querySelector(
        '.life-switch-btn.active'
      );

    const initialView =
      active &&
      active.dataset
        ? active.dataset.view
        : DEFAULT_VIEW;

    setLifeView(initialView);
  }

  function bindLanguageObserver() {
    if (
      !document.body ||
      document.body.dataset
        .boundLifeLangObserver === '1'
    ) {
      return;
    }

    document.body.dataset
      .boundLifeLangObserver = '1';

    const observer =
      new MutationObserver(
        function () {
          applyLifeI18N();

          if (
            currentView ===
            'meditations'
          ) {
            if (
              window.LifeMeditations &&
              typeof window.LifeMeditations
                .refreshCurrentLanguage ===
                'function'
            ) {
              window.LifeMeditations
                .refreshCurrentLanguage();
            } else {
              renderMeditations({
                preserveState: true
              });
            }

            return;
          }

          if (
            window.ActivitiesMoments &&
            typeof window.ActivitiesMoments
              .renderCurrent ===
              'function'
          ) {
            window.ActivitiesMoments
              .renderCurrent({
                scroll: false
              });
          } else {
            renderActivitiesMoments();
          }
        }
      );

    observer.observe(
      document.body,
      {
        attributes: true,
        attributeFilter: [
          'data-lang'
        ]
      }
    );
  }

  const mount =
    document.getElementById(
      'mount-life'
    ) ||
    document.body;

  if (
    !document.getElementById('life')
  ) {
    mount.insertAdjacentHTML(
      'beforeend',
      `
        <div id="life">
          <div class="life-container">
            <h1
              class="life-heading"
              data-life-i18n="life_heading"
            >
              Vignettes of a Fleeting Life
            </h1>

            <div class="life-shell">
              <div
                class="life-switcher"
                role="tablist"
                aria-label="Life sections"
              >
                <button
                  class="life-switch-btn active"
                  id="life-tab-activities_moments"
                  type="button"
                  data-view="activities_moments"
                  role="tab"
                  aria-selected="true"
                  aria-controls="activities_moments-section"
                  tabindex="0"
                  data-life-i18n="activities_moments"
                  data-cursor="precise_select"
                  data-cursor-fallback="pointer"
                >
                  Activities &amp; Moments
                </button>

                <button
                  class="life-switch-btn"
                  id="life-tab-meditations"
                  type="button"
                  data-view="meditations"
                  role="tab"
                  aria-selected="false"
                  aria-controls="meditations-section"
                  tabindex="-1"
                  data-life-i18n="meditations"
                  data-cursor="precise_select"
                  data-cursor-fallback="pointer"
                >
                  Meditations
                </button>
              </div>

              <section
                class="life-section active"
                id="activities_moments-section"
                data-view="activities_moments"
                role="tabpanel"
                aria-labelledby="life-tab-activities_moments"
              >
                <div
                  id="mount-activities_moments"
                ></div>
              </section>

              <section
                class="life-section"
                id="meditations-section"
                data-view="meditations"
                role="tabpanel"
                aria-labelledby="life-tab-meditations"
                hidden
              >
                <div
                  id="mount-meditations"
                ></div>
              </section>
            </div>
          </div>
        </div>
      `
    );
  }

  window.Life = {
    normalizeView,
    setLifeView,
    getCurrentView,
    initLifePage,
    renderActivitiesMoments,
    renderMeditations,
    applyLifeI18N
  };

  bindLanguageObserver();

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initLifePage
    );
  } else {
    initLifePage();
  }
})();
