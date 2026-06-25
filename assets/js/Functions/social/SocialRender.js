(function () {
  'use strict';

  function renderSocialPage() {
    if (window.SocialShell && typeof window.SocialShell.renderSocialPage === 'function') {
      return window.SocialShell.renderSocialPage();
    }

    return document.getElementById('social');
  }

  function init() {
    return renderSocialPage();
  }

  window.SocialRender = {
    init,
    renderSocialPage
  };

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('social', {
      init() {
        init();
      },

      enter() {
        init();

        if (window.SocialShell && typeof window.SocialShell.setSocialView === 'function') {
          window.SocialShell.setSocialView(
            window.SocialShell.getCurrentView ? window.SocialShell.getCurrentView() : 'constellation',
            { silent: true }
          );
        }
      },

      refresh() {
        init();

        if (window.SocialShell && typeof window.SocialShell.applySocialI18N === 'function') {
          window.SocialShell.applySocialI18N(document.getElementById('social'));
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();