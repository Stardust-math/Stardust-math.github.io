(function () {
  "use strict";

  const STORAGE_KEY = "resume_expanders_open_keys_v1";
  const ANIMATION_MS = 280;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {}

  function qsAll(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function prefersReducedMotion() {
    try {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch (e) {
      return false;
    }
  }

  function getOpenDisplay(el) {
    if (!el) return "";

    if (el.tagName && el.tagName.toLowerCase() === "tr") {
      return "table-row";
    }

    return "block";
  }

  function setDisplay(el, open) {
    if (!el) return;
    el.style.display = open ? getOpenDisplay(el) : "none";
  }

  function clearMotionTimer(row) {
    if (!row || !row.dataset.expandTimer) return;

    try {
      clearTimeout(Number(row.dataset.expandTimer));
    } catch (e) {}

    delete row.dataset.expandTimer;
  }

  function finishAnimationLater(row, callback) {
    if (!row) return;

    clearMotionTimer(row);

    const delay = prefersReducedMotion() ? 0 : ANIMATION_MS + 60;

    const timer = window.setTimeout(function () {
      clearMotionTimer(row);
      callback();
    }, delay);

    row.dataset.expandTimer = String(timer);
  }

  function setInstantRowState(row, open) {
    if (!row) return;

    clearMotionTimer(row);

    row.classList.remove("is-animating", "is-closing");
    row.classList.toggle("is-open", open);
    row.setAttribute("aria-hidden", open ? "false" : "true");
    setDisplay(row, open);
  }

  function animateRowOpen(row) {
    if (!row) return;

    clearMotionTimer(row);

    row.classList.remove("is-closing");
    row.classList.add("is-animating");
    row.setAttribute("aria-hidden", "false");
    setDisplay(row, true);

    requestAnimationFrame(function () {
      row.classList.add("is-open");

      finishAnimationLater(row, function () {
        row.classList.remove("is-animating", "is-closing");
      });
    });
  }

  function animateRowClose(row) {
    if (!row) return;

    clearMotionTimer(row);

    row.classList.add("is-animating", "is-closing");
    row.setAttribute("aria-hidden", "true");

    requestAnimationFrame(function () {
      row.classList.remove("is-open");

      finishAnimationLater(row, function () {
        row.classList.remove("is-animating", "is-closing");
        setDisplay(row, false);
      });
    });
  }

  function getBtnKey(btn) {
    if (!btn) return null;

    const k = btn.getAttribute("data-expand-key");
    if (k && String(k).trim()) return String(k).trim();

    const t = btn.getAttribute("data-expand-target");
    if (t && String(t).trim()) return String(t).trim();

    return null;
  }

  function saveState(scope) {
    try {
      const root = scope || document;
      const open = qsAll('button.expander[aria-expanded="true"]', root)
        .map(getBtnKey)
        .filter(Boolean);

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch (e) {}
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  function setOpen(btn, open, options) {
    if (!btn) return;

    const opts = options || {};
    const animate = opts.animate === true;

    const targetId = btn.getAttribute("data-expand-target");
    if (!targetId) return;

    const row = document.getElementById(targetId);
    if (!row) return;

    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("is-open", open);

    if (!animate || prefersReducedMotion()) {
      setInstantRowState(row, open);
      return;
    }

    if (open) {
      animateRowOpen(row);
    } else {
      animateRowClose(row);
    }
  }

  function toggle(btn) {
    if (!btn) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    setOpen(btn, !isOpen, { animate: true });
    saveState(document);
  }

  function bindOne(btn) {
    if (!btn || btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle(btn);
    });
  }

  function normalizeRows(scope) {
    const root = scope || document;

    qsAll(".expand-row[id]", root).forEach(function (row) {
      const isOpen =
        row.classList.contains("is-open") ||
        row.getAttribute("aria-hidden") === "false";

      setInstantRowState(row, isOpen);
    });
  }

  function markExpandLayouts(scope) {
    const root = scope || document;

    qsAll(".expand-content", root).forEach(function (box) {
      const items = box.querySelectorAll(".expand-item");
      const n = items ? items.length : 0;

      box.classList.remove("is-single", "is-multi");

      if (n === 1) box.classList.add("is-single");
      if (n > 1) box.classList.add("is-multi");
    });
  }

  function getOpenKeys(scope) {
    try {
      const root = scope || document;

      return qsAll('button.expander[aria-expanded="true"]', root)
        .map(getBtnKey)
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function applyOpenKeys(keys, scope) {
    const root = scope || document;
    const wanted = Array.isArray(keys) ? keys.map(String) : [];

    const btns = qsAll('button.expander[data-expand-target]', root);

    const wantSet = Object.create(null);
    wanted.forEach(function (k) {
      wantSet[String(k)] = true;
    });

    btns.forEach(function (btn) {
      const k = getBtnKey(btn);
      const shouldOpen = !!(k && wantSet[String(k)]);

      setOpen(btn, shouldOpen, { animate: false });
    });
  }

  function restoreState(scope) {
    const root = scope || document;
    const keys = loadState();

    if (!keys || keys.length === 0) return;

    applyOpenKeys(keys, root);
  }

  function init(root, opts) {
    const scope = root || document;
    const options = opts || {};

    normalizeRows(scope);
    markExpandLayouts(scope);
    qsAll("button.expander[data-expand-target]", scope).forEach(bindOne);

    if (Array.isArray(options.openKeys) && options.openKeys.length > 0) {
      applyOpenKeys(options.openKeys, scope);
    } else {
      restoreState(scope);
    }

    if (!options.skipSave) saveState(scope);
  }

  function setupDelegatedClickOnce() {
    if (document.documentElement.dataset.expanderDelegation === "1") return;

    document.documentElement.dataset.expanderDelegation = "1";

    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target && e.target.closest
          ? e.target.closest("button.expander[data-expand-target]")
          : null;

        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        toggle(btn);
      },
      true
    );
  }

  function setupMeditationsRowClickOnce() {
    if (document.documentElement.dataset.meditRowClick === "1") return;

    document.documentElement.dataset.meditRowClick = "1";

    document.addEventListener(
      "click",
      function (e) {
        const t = e.target;

        const row = t && t.closest ? t.closest("#meditations .medit-row") : null;
        if (!row) return;

        if (t && t.closest && t.closest("button.expander")) return;
        if (t && t.closest && t.closest("a, button, input, textarea, select, label")) return;

        const btn = row.querySelector('button.expander[data-expand-target]');
        if (!btn) return;

        toggle(btn);
      },
      true
    );
  }

  window.ResumeExpanders = window.ResumeExpanders || {};
  window.ResumeExpanders.init = init;
  window.ResumeExpanders.getOpenKeys = getOpenKeys;
  window.ResumeExpanders.applyOpenKeys = applyOpenKeys;
  window.ResumeExpanders.saveState = saveState;

  setupDelegatedClickOnce();
  setupMeditationsRowClickOnce();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init(document);
    });
  } else {
    init(document);
  }

  window.addEventListener("site:langchange", function (e) {
    const openKeys =
      e && e.detail && Array.isArray(e.detail.openKeys) ? e.detail.openKeys : null;

    requestAnimationFrame(function () {
      init(document, openKeys ? { openKeys: openKeys } : undefined);
    });
  });
})();