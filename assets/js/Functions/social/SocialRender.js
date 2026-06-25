(function () {
  'use strict';

  function renderSocialPage() {
    if (window.SocialShell && typeof window.SocialShell.renderSocialPage === 'function') {
      return window.SocialShell.renderSocialPage();
    }

    return document.getElementById('social');
  }

  function enhanceSocialRoutes() {
    if (window.SocialRoutes && typeof window.SocialRoutes.enhanceSocialSubnav === 'function') {
      window.SocialRoutes.enhanceSocialSubnav();
    }
  }

  function enterFromRoute(options) {
    if (window.SocialRoutes && typeof window.SocialRoutes.enterFromLocation === 'function') {
      window.SocialRoutes.enterFromLocation(options || {});
      return true;
    }

    return false;
  }

  function init() {
    const root = renderSocialPage();
    enhanceSocialRoutes();
    return root;
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

        if (enterFromRoute({ silent: true })) {
          return;
        }

        if (window.SocialShell && typeof window.SocialShell.setSocialView === 'function') {
          window.SocialShell.setSocialView(
            window.SocialShell.getCurrentView ? window.SocialShell.getCurrentView() : 'constellation',
            { silent: true }
          );
        }
      },

      refresh() {
        const root = init();

        if (window.SocialShell && typeof window.SocialShell.applySocialI18N === 'function') {
          window.SocialShell.applySocialI18N(root || document.getElementById('social'));
        }

        enhanceSocialRoutes();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();