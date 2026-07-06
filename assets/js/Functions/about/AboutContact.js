(function () {
  'use strict';

  const RESET_DELAY = 1500;
  const resetTimers = new WeakMap();

  function getCopyText(button) {
    if (!button) return '';
    return String(button.getAttribute('data-copy-email') || '').trim();
  }

  function getCopySuccessLabel(button) {
    const title = button ? String(button.getAttribute('title') || '') : '';
    const aria = button ? String(button.getAttribute('aria-label') || '') : '';

    return title.indexOf('复制') !== -1 || aria.indexOf('复制') !== -1
      ? '已复制'
      : 'Copied';
  }

  function getCopyFailedLabel(button) {
    const title = button ? String(button.getAttribute('title') || '') : '';
    const aria = button ? String(button.getAttribute('aria-label') || '') : '';

    return title.indexOf('复制') !== -1 || aria.indexOf('复制') !== -1
      ? '复制失败'
      : 'Copy failed';
  }

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      if (!document.body) {
        reject(new Error('document.body is not available'));
        return;
      }

      const textarea = document.createElement('textarea');

      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      textarea.style.opacity = '0';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (ok) {
          resolve();
        } else {
          reject(new Error('document.execCommand("copy") returned false'));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return fallbackCopy(text);
  }

  function setButtonState(button, ok) {
    if (!button) return;

    const icon = button.querySelector('i');

    if (icon && !button.dataset.originalIconClass) {
      button.dataset.originalIconClass = icon.className;
    }

    if (!button.dataset.originalTitle) {
      button.dataset.originalTitle = button.getAttribute('title') || '';
    }

    if (!button.dataset.originalAriaLabel) {
      button.dataset.originalAriaLabel = button.getAttribute('aria-label') || '';
    }

    if (resetTimers.get(button)) {
      window.clearTimeout(resetTimers.get(button));
      resetTimers.delete(button);
    }

    button.classList.remove('is-copied', 'is-copy-failed');
    button.classList.add(ok ? 'is-copied' : 'is-copy-failed');

    if (icon) {
      icon.className = ok ? 'fas fa-check' : 'fas fa-exclamation-triangle';
    }

    const label = ok ? getCopySuccessLabel(button) : getCopyFailedLabel(button);

    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.disabled = false;

    const timer = window.setTimeout(function () {
      button.classList.remove('is-copied', 'is-copy-failed');

      if (icon && button.dataset.originalIconClass) {
        icon.className = button.dataset.originalIconClass;
      }

      if (button.dataset.originalAriaLabel) {
        button.setAttribute('aria-label', button.dataset.originalAriaLabel);
      }

      if (button.dataset.originalTitle) {
        button.setAttribute('title', button.dataset.originalTitle);
      } else {
        button.removeAttribute('title');
      }

      resetTimers.delete(button);
    }, RESET_DELAY);

    resetTimers.set(button, timer);
  }

  function handleCopyClick(event) {
    const button = event.target.closest('.resume-email-copy-btn[data-copy-email]');

    if (!button) return;

    const email = getCopyText(button);

    if (!email) return;

    button.disabled = true;

    copyToClipboard(email)
      .then(function () {
        setButtonState(button, true);
      })
      .catch(function () {
        setButtonState(button, false);
      });
  }

  function init() {
    if (document.documentElement.dataset.aboutContactBound === '1') {
      return;
    }

    document.documentElement.dataset.aboutContactBound = '1';
    document.addEventListener('click', handleCopyClick);
  }

  window.AboutContact = {
    init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();