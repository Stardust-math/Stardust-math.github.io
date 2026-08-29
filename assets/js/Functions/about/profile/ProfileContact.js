(function () {
  'use strict';

  const RESET_DELAY = 1500;
  const resetTimers = new WeakMap();

  function getCopyText(button) {
    if (!button) return '';

    return String(
      button.getAttribute('data-copy-email') || ''
    ).trim();
  }

  function isChineseButton(button) {
    const title = button
      ? String(button.getAttribute('title') || '')
      : '';

    const aria = button
      ? String(button.getAttribute('aria-label') || '')
      : '';

    return (
      title.includes('复制') ||
      aria.includes('复制')
    );
  }

  function getStateLabel(button, ok) {
    if (isChineseButton(button)) {
      return ok ? '已复制' : '复制失败';
    }

    return ok ? 'Copied' : 'Copy failed';
  }

  function fallbackCopy(text) {
    return new Promise((resolve, reject) => {
      if (!document.body) {
        reject(new Error('document.body is unavailable'));
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
        const copied = document.execCommand('copy');
        textarea.remove();

        if (copied) {
          resolve();
        } else {
          reject(
            new Error(
              'document.execCommand("copy") returned false'
            )
          );
        }
      } catch (error) {
        textarea.remove();
        reject(error);
      }
    });
  }

  function copyToClipboard(text) {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      return navigator.clipboard.writeText(text);
    }

    return fallbackCopy(text);
  }

  function rememberOriginalState(button, icon) {
    if (
      icon &&
      !button.dataset.originalIconClass
    ) {
      button.dataset.originalIconClass =
        icon.className;
    }

    if (
      !button.hasAttribute('data-original-title')
    ) {
      button.dataset.originalTitle =
        button.getAttribute('title') || '';
    }

    if (
      !button.hasAttribute(
        'data-original-aria-label'
      )
    ) {
      button.dataset.originalAriaLabel =
        button.getAttribute('aria-label') || '';
    }
  }

  function restoreButtonState(button) {
    if (!button) return;

    const icon = button.querySelector('i');

    button.classList.remove(
      'is-copied',
      'is-copy-failed'
    );

    if (
      icon &&
      button.dataset.originalIconClass
    ) {
      icon.className =
        button.dataset.originalIconClass;
    }

    if (button.dataset.originalAriaLabel) {
      button.setAttribute(
        'aria-label',
        button.dataset.originalAriaLabel
      );
    } else {
      button.removeAttribute('aria-label');
    }

    if (button.dataset.originalTitle) {
      button.setAttribute(
        'title',
        button.dataset.originalTitle
      );
    } else {
      button.removeAttribute('title');
    }

    button.disabled = false;
    resetTimers.delete(button);
  }

  function setButtonState(button, ok) {
    if (!button) return;

    const icon = button.querySelector('i');

    rememberOriginalState(button, icon);

    const oldTimer = resetTimers.get(button);

    if (oldTimer) {
      window.clearTimeout(oldTimer);
      resetTimers.delete(button);
    }

    button.classList.remove(
      'is-copied',
      'is-copy-failed'
    );

    button.classList.add(
      ok ? 'is-copied' : 'is-copy-failed'
    );

    if (icon) {
      icon.className = ok
        ? 'fas fa-check'
        : 'fas fa-exclamation-triangle';
    }

    const label = getStateLabel(button, ok);

    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.disabled = false;

    const timer = window.setTimeout(() => {
      restoreButtonState(button);
    }, RESET_DELAY);

    resetTimers.set(button, timer);
  }

  function handleCopyClick(event) {
    const button =
      event.target &&
      typeof event.target.closest === 'function'
        ? event.target.closest(
          '.profile-email-copy-btn[data-copy-email]'
        )
        : null;

    if (!button) return;

    const email = getCopyText(button);

    if (!email) return;

    button.disabled = true;

    copyToClipboard(email)
      .then(() => {
        setButtonState(button, true);
      })
      .catch(() => {
        setButtonState(button, false);
      });
  }

  function init() {
    if (
      document.documentElement.dataset
        .profileContactBound === '1'
    ) {
      return;
    }

    document.documentElement.dataset
      .profileContactBound = '1';

    document.addEventListener(
      'click',
      handleCopyClick
    );
  }

  window.ProfileContact = {
    init
  };
})();