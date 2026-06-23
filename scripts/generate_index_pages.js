#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const config = require('./index_pages.config.js');

const repoRoot = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));

const flags = {
  check: args.has('--check'),
  dryRun: args.has('--dry-run'),
  list: args.has('--list')
};

const PRE_COVER_FORMULAS = [
  {
    text: 'RΓ(X,Ω_X^•) ⇒ 𝔥^•(X,ℂ)',
    style: 'left:5%;top:10%;--s:.76rem;--r:-10deg;--o:.30;--t:9.5s;--d:-1.1s'
  },
  {
    text: 'ch(Rf_*E)·Td(Y)=f_*(ch(E)·Td(X))',
    classNames: ['gold'],
    style: 'right:5%;top:11%;--s:.70rem;--r:8deg;--o:.29;--t:10.2s;--d:-3.4s'
  },
  {
    text: 'E₂^{p,q}=H^p(X,ℋ^q(K^•)) ⇒ 𝔥^{p+q}(X,K^•)',
    classNames: ['cyan'],
    style: 'left:6%;top:27%;--s:.66rem;--r:5deg;--o:.32;--t:8.8s;--d:-5.1s'
  },
  {
    text: 'π₁^ét(X,x̄) → Gal(k̄/k)',
    classNames: ['violet'],
    style: 'right:8%;top:29%;--s:.76rem;--r:-8deg;--o:.33;--t:9.8s;--d:-2.2s'
  },
  {
    text: 'Ext^i_{𝒪_X}(𝔽,𝒢) ≅ H^i(X,𝓗om(𝔽,𝒢))',
    style: 'left:5%;top:49%;--s:.63rem;--r:-7deg;--o:.24;--t:11.2s;--d:-4.7s'
  },
  {
    text: 'Tor_i^R(M,N) ≅ H_i(P_• ⊗_R N)',
    classNames: ['cyan'],
    style: 'right:7%;top:49%;--s:.68rem;--r:10deg;--o:.25;--t:10.8s;--d:-6.0s'
  },
  {
    text: '𝒟′(Ω) ∋ T : φ ↦ ⟨T,φ⟩',
    classNames: ['deep'],
    style: 'left:7%;bottom:26%;--s:.72rem;--r:9deg;--o:.29;--t:9.4s;--d:-3.2s'
  },
  {
    text: 'H^1(G_K,Ad⁰ρ) / H_f^1(G_K,Ad⁰ρ)',
    classNames: ['violet'],
    style: 'right:6%;bottom:26%;--s:.66rem;--r:-9deg;--o:.27;--t:10.6s;--d:-8.1s'
  },
  {
    text: '∫_{𝓜_g} ψ₁^{a₁}⋯ψ_n^{a_n}',
    classNames: ['deep'],
    style: 'left:17%;bottom:9%;--s:.64rem;--r:-13deg;--o:.21;--t:12s;--d:-5.8s'
  },
  {
    text: '𝔽ℓ_G = LG / L⁺G',
    classNames: ['gold'],
    style: 'right:19%;bottom:9%;--s:.72rem;--r:12deg;--o:.26;--t:11.6s;--d:-2.8s'
  },
  {
    text: 'Spec ℤ ← Spec 𝒪_K → Spec 𝔽_q',
    classNames: ['deep'],
    style: 'left:35%;top:5%;--s:.58rem;--r:2deg;--o:.17;--t:12.5s;--d:-7.2s'
  },
  {
    text: '∂̄_E^2=0,  F_A^{0,2}=0',
    classNames: ['gold'],
    style: 'right:35%;bottom:6%;--s:.60rem;--r:-3deg;--o:.18;--t:12.8s;--d:-9s'
  }
];

const PRE_COVER_SYMBOLS = [
  ['∂̄', 'left:7%;top:7%;--s:.86rem;--r:-17deg;--o:.22'],
  ['ℵ₁', 'left:19%;top:17%;--s:.72rem;--r:9deg;--o:.16'],
  ['𝒟′', 'left:33%;top:12%;--s:.64rem;--r:-8deg;--o:.15'],
  ['𝔥^•', 'left:56%;top:8%;--s:.70rem;--r:12deg;--o:.17'],
  ['Ω_X^•', 'right:9%;top:8%;--s:.84rem;--r:-11deg;--o:.21'],
  ['π₁^ét', 'right:22%;top:21%;--s:.58rem;--r:18deg;--o:.15'],
  ['Spec', 'left:4%;top:36%;--s:.66rem;--r:14deg;--o:.14'],
  ['Ext', 'left:21%;top:42%;--s:.78rem;--r:-22deg;--o:.18'],
  ['Tor', 'right:6%;top:41%;--s:.74rem;--r:19deg;--o:.18'],
  ['𝔽ℓ_G', 'right:23%;top:53%;--s:.62rem;--r:-15deg;--o:.13'],
  ['RΓ', 'left:10%;bottom:32%;--s:.82rem;--r:-6deg;--o:.19'],
  ['𝒪_X', 'left:28%;bottom:20%;--s:.60rem;--r:16deg;--o:.14'],
  ['𝔽_q', 'right:11%;bottom:24%;--s:.86rem;--r:10deg;--o:.22'],
  ['Gal(k̄/k)', 'right:30%;bottom:12%;--s:.68rem;--r:-18deg;--o:.15'],
  ['𝓜_g', 'left:44%;bottom:8%;--s:.72rem;--r:7deg;--o:.14'],
  ['Ad⁰ρ', 'right:4%;bottom:45%;--s:.56rem;--r:-8deg;--o:.12'],
  ['H_f^1', 'left:42%;top:24%;--s:.54rem;--r:22deg;--o:.10'],
  ['𝔭-adic', 'left:58%;bottom:29%;--s:.58rem;--r:-21deg;--o:.11'],
  ['𝕋_ℓ', 'left:14%;top:58%;--s:.58rem;--r:11deg;--o:.11'],
  ['𝔤𝔩_n', 'right:14%;top:61%;--s:.62rem;--r:-12deg;--o:.13'],
  ['𝒮′', 'left:72%;top:17%;--s:.54rem;--r:-20deg;--o:.11'],
  ['lim¹', 'left:24%;bottom:43%;--s:.56rem;--r:20deg;--o:.10'],
  ['𝔈xt', 'right:40%;top:20%;--s:.50rem;--r:-30deg;--o:.08'],
  ['𝒯or', 'left:61%;top:36%;--s:.52rem;--r:28deg;--o:.08'],
  ['𝔛', 'left:36%;bottom:35%;--s:.54rem;--r:-16deg;--o:.09'],
  ['𝕍', 'right:35%;bottom:35%;--s:.52rem;--r:19deg;--o:.09']
];

let preCoverLoadingStyleCache = null;

function toRepoPath(filePath) {
  return path.join(repoRoot, filePath);
}

function toPosix(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function normalizeOutputPath(value) {
  let p = toPosix(value || '').trim();

  p = p.replace(/^\/+/, '');

  if (!p || p === '.') {
    return 'index.html';
  }

  if (p.endsWith('/')) {
    p += 'index.html';
  }

  if (!p.endsWith('index.html')) {
    p = p.replace(/\/+$/, '') + '/index.html';
  }

  p = path.posix.normalize(p);

  if (p === '.') {
    p = 'index.html';
  }

  if (p.startsWith('../') || path.posix.isAbsolute(p)) {
    throw new Error(`Unsafe output path: ${value}`);
  }

  return p;
}

function routeToIndexPath(route) {
  const cleaned = String(route || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  return cleaned ? `${cleaned}/index.html` : 'index.html';
}

function getBaseHref(outputPath) {
  const normalized = normalizeOutputPath(outputPath);
  const dir = path.posix.dirname(normalized);

  if (dir === '.') {
    return './';
  }

  const depth = dir.split('/').filter(Boolean).length;
  return '../'.repeat(depth);
}

function loadSiteResources() {
  const siteResourcesPath = config.siteResourcesPath || 'assets/js/Config/SiteResources.js';
  const abs = toRepoPath(siteResourcesPath);

  if (!fs.existsSync(abs)) {
    throw new Error(`SiteResources file not found: ${siteResourcesPath}`);
  }

  const code = fs.readFileSync(abs, 'utf8');

  const sandbox = {
    console,
    window: {
      SiteFonts: {
        externalStyles: []
      }
    }
  };

  sandbox.global = sandbox.window;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, {
    filename: siteResourcesPath
  });

  if (!sandbox.window.SiteResources) {
    throw new Error(`window.SiteResources was not created by ${siteResourcesPath}`);
  }

  return sandbox.window.SiteResources;
}

function makeEntry(outputPath, options) {
  const opts = options || {};
  const normalized = normalizeOutputPath(outputPath);

  return {
    outputPath: normalized,
    baseHref: opts.baseHref || getBaseHref(normalized),
    routeEntry: typeof opts.routeEntry === 'boolean'
      ? opts.routeEntry
      : normalized !== 'index.html',
    preCoverLoading: opts.preCoverLoading === true,
    title: opts.title || config.title || 'Joker Chen'
  };
}

function collectEntries() {
  const siteResources = loadSiteResources();
  const entries = [];

  const rawEntries = Array.isArray(config.entries) ? config.entries : [];

  rawEntries.forEach((item) => {
    if (!item) return;

    if (item.sitePage) {
      const pages = siteResources.pages || {};
      const pageConfig = pages[item.sitePage];

      if (!pageConfig || !pageConfig.route) {
        throw new Error(`Missing route for SiteResources.pages.${item.sitePage}`);
      }

      entries.push(makeEntry(routeToIndexPath(pageConfig.route), item));
      return;
    }

    if (Object.prototype.hasOwnProperty.call(item, 'path')) {
      entries.push(makeEntry(item.path, item));
      return;
    }

    if (Object.prototype.hasOwnProperty.call(item, 'route')) {
      entries.push(makeEntry(routeToIndexPath(item.route), item));
      return;
    }

    throw new Error(`Invalid entry in scripts/index_pages.config.js: ${JSON.stringify(item)}`);
  });

  const activityConfig = config.activityMomentDetailEntries || {};

  if (activityConfig.enabled) {
    const baseRoute = String(activityConfig.baseRoute || 'life/activities_moments')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

    const dates = siteResources.activitiesMoments &&
      Array.isArray(siteResources.activitiesMoments.dates)
      ? siteResources.activitiesMoments.dates
      : [];

    dates.forEach((dateKey) => {
      entries.push(makeEntry(`${baseRoute}/${dateKey}/index.html`, {
        routeEntry: true
      }));
    });
  }

  const deduped = [];
  const seen = new Map();

  entries.forEach((entry) => {
    if (seen.has(entry.outputPath)) {
      const previous = seen.get(entry.outputPath);

      if (
        previous.baseHref !== entry.baseHref ||
        previous.routeEntry !== entry.routeEntry ||
        previous.preCoverLoading !== entry.preCoverLoading ||
        previous.title !== entry.title
      ) {
        throw new Error(`Conflicting entry for ${entry.outputPath}`);
      }

      return;
    }

    seen.set(entry.outputPath, entry);
    deduped.push(entry);
  });

  return deduped;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function escapeInlineStyle(styleText) {
  return String(styleText).replace(/<\/style/gi, '<\\/style');
}

function getPreCoverLoadingStyleContent() {
  if (preCoverLoadingStyleCache !== null) {
    return preCoverLoadingStyleCache;
  }

  const stylePath = config.preCoverLoadingStylePath || 'assets/css/SitePreCoverLoading.css';
  const abs = toRepoPath(stylePath);

  if (!fs.existsSync(abs)) {
    throw new Error(`Pre-cover loading style file not found: ${stylePath}`);
  }

  preCoverLoadingStyleCache = fs.readFileSync(abs, 'utf8');
  return preCoverLoadingStyleCache;
}

function getHtmlClassAttr(entry) {
  const classes = [];

  if (entry.preCoverLoading) {
    classes.push('site-precover-loading-active');
  }

  return classes.length ? ` class="${classes.join(' ')}"` : '';
}

function getRouteEntryHead(routeEntry) {
  if (!routeEntry) return '';

  return `<script>
  document.documentElement.classList.add('route-entry');
</script>

<style>
  html.route-entry #mount-cover,
  html.route-entry #cover {
    display: none !important;
  }
</style>`;
}

function getPreCoverLoadingHead(entry) {
  if (!entry.preCoverLoading) return '';

  const css = escapeInlineStyle(getPreCoverLoadingStyleContent());

  return `
<style id="site-precover-loading-critical">
${css}
</style>`;
}

function getPreCoverLoadingBody(entry) {
  if (!entry.preCoverLoading) return '';

  const formulaHtml = PRE_COVER_FORMULAS.map((item) => {
    const classNames = ['cm-formula'].concat(item.classNames || []);
    return `      <span class="${classNames.join(' ')}" style="${item.style}">${escapeHtml(item.text)}</span>`;
  }).join('\n');

  const symbolHtml = PRE_COVER_SYMBOLS.map(([text, style]) => {
    return `      <span style="${style}">${escapeHtml(text)}</span>`;
  }).join('\n');

  return `  <div id="site-precover-loading" role="status" aria-live="polite" aria-label="Loading">
    <div class="cm-nebula" aria-hidden="true"></div>
    <div class="cm-veil" aria-hidden="true"></div>
    <div class="cm-manifold-grid" aria-hidden="true"></div>

    <svg class="cm-celestial-lines" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <line x1="80" y1="210" x2="190" y2="150"></line>
      <line x1="190" y1="150" x2="310" y2="260"></line>
      <line x1="720" y1="180" x2="835" y2="255"></line>
      <line x1="835" y1="255" x2="910" y2="190"></line>
      <line x1="110" y1="760" x2="245" y2="690"></line>
      <line x1="760" y1="780" x2="890" y2="690"></line>
      <line x1="410" y1="105" x2="500" y2="72"></line>
      <line x1="500" y1="72" x2="590" y2="118"></line>
      <line x1="395" y1="890" x2="486" y2="832"></line>
      <line x1="486" y1="832" x2="604" y2="878"></line>
      <circle cx="80" cy="210" r="2"></circle>
      <circle cx="190" cy="150" r="2.8"></circle>
      <circle cx="310" cy="260" r="1.8"></circle>
      <circle cx="720" cy="180" r="2"></circle>
      <circle cx="835" cy="255" r="2.4"></circle>
      <circle cx="910" cy="190" r="1.8"></circle>
      <circle cx="110" cy="760" r="2"></circle>
      <circle cx="245" cy="690" r="2.2"></circle>
      <circle cx="760" cy="780" r="1.8"></circle>
      <circle cx="890" cy="690" r="2.2"></circle>
      <circle cx="410" cy="105" r="1.5"></circle>
      <circle cx="500" cy="72" r="2"></circle>
      <circle cx="590" cy="118" r="1.5"></circle>
      <circle cx="395" cy="890" r="1.5"></circle>
      <circle cx="486" cy="832" r="2"></circle>
      <circle cx="604" cy="878" r="1.5"></circle>
    </svg>

    <div class="cm-symbol-cloud" aria-hidden="true">
${symbolHtml}
    </div>

    <div class="cm-formula-field" aria-hidden="true">
${formulaHtml}
    </div>

    <div class="cm-inner">
      <div class="cm-instrument" aria-hidden="true">
        <div class="cm-aura"></div>
        <div class="cm-aura second"></div>

        <svg class="cm-constellation" viewBox="0 0 248 248" focusable="false">
          <line x1="46" y1="90" x2="84" y2="52"></line>
          <line x1="84" y1="52" x2="128" y2="76"></line>
          <line x1="128" y1="76" x2="168" y2="44"></line>
          <line x1="168" y1="44" x2="206" y2="96"></line>
          <line x1="68" y1="184" x2="108" y2="154"></line>
          <line x1="108" y1="154" x2="156" y2="180"></line>
          <line x1="156" y1="180" x2="190" y2="160"></line>
          <circle cx="46" cy="90" r="1.4"></circle>
          <circle cx="84" cy="52" r="2"></circle>
          <circle cx="128" cy="76" r="1.2"></circle>
          <circle cx="168" cy="44" r="1.5"></circle>
          <circle cx="206" cy="96" r="1.1"></circle>
          <circle cx="68" cy="184" r="1.2"></circle>
          <circle cx="108" cy="154" r="1.5"></circle>
          <circle cx="156" cy="180" r="1.2"></circle>
          <circle cx="190" cy="160" r="1.1"></circle>
        </svg>

        <div class="cm-shell"></div>
        <div class="cm-ring outer"></div>
        <div class="cm-ring middle"></div>
        <div class="cm-ring inner"></div>
        <div class="cm-ring glass"></div>

        <div class="cm-meridian m1"></div>
        <div class="cm-meridian m2"></div>
        <div class="cm-meridian m3"></div>

        <div class="cm-symbol-orbit">
          <span>∂̄</span><span>ℵ₁</span><span>𝒟′</span><span>Spec</span>
          <span>Ext</span><span>Tor</span><span>π₁^ét</span><span>Ω_X^•</span>
        </div>

        <div class="cm-symbol-orbit-chaos">
          <span>𝔽ℓ</span><span>RΓ</span><span>Ad⁰</span><span>lim¹</span>
          <span>𝕋_ℓ</span><span>𝒮′</span><span>𝔤</span>
        </div>

        <div class="cm-symbol-orbit-fringe">
          <span>𝔈xt</span><span>𝒯or</span><span>𝔖</span><span>𝔛</span><span>⊠</span><span>↠</span>
        </div>

        <div class="cm-dot d1"></div>
        <div class="cm-dot d2"></div>
        <div class="cm-core"></div>
      </div>

      <div class="cm-label">
        <p class="cm-title">Loading</p>
        <p class="cm-subtitle">
          <span class="cm-loading-dots"><span>.</span><span>.</span><span>.</span></span>
        </p>
      </div>
    </div>
  </div>
`;
}

function getPreCoverLoadingScript(entry) {
  if (!entry.preCoverLoading) return '';

  const scriptPath = toPosix(config.preCoverLoadingScriptPath || 'assets/js/Functions/general/SitePreCoverLoading.js')
    .replace(/^\/+/, '');

  return `  <script src="./${scriptPath}"></script>\n`;
}

function renderTemplate(template, entry) {
  return template
    .replace(/\{\{GENERATED_NOTICE\}\}/g, config.generatedNotice || '')
    .replace(/\{\{HTML_CLASS_ATTR\}\}/g, getHtmlClassAttr(entry))
    .replace(/\{\{BASE_HREF\}\}/g, entry.baseHref)
    .replace(/\{\{ROUTE_ENTRY_HEAD\}\}/g, getRouteEntryHead(entry.routeEntry))
    .replace(/\{\{TITLE\}\}/g, entry.title)
    .replace(/\{\{PRECOVER_LOADING_HEAD\}\}/g, getPreCoverLoadingHead(entry))
    .replace(/\{\{PRECOVER_LOADING_BODY\}\}/g, getPreCoverLoadingBody(entry))
    .replace(/\{\{PRECOVER_LOADING_SCRIPT\}\}/g, getPreCoverLoadingScript(entry));
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function writeOrCheckEntry(entry, content) {
  const abs = toRepoPath(entry.outputPath);
  const exists = fs.existsSync(abs);
  const current = exists ? fs.readFileSync(abs, 'utf8') : null;

  if (current === content) {
    return {
      status: 'skip',
      path: entry.outputPath
    };
  }

  if (flags.check) {
    return {
      status: exists ? 'stale' : 'missing',
      path: entry.outputPath
    };
  }

  if (flags.dryRun) {
    return {
      status: exists ? 'would-update' : 'would-create',
      path: entry.outputPath
    };
  }

  fs.mkdirSync(path.dirname(abs), {
    recursive: true
  });

  fs.writeFileSync(abs, content, 'utf8');

  return {
    status: exists ? 'updated' : 'created',
    path: entry.outputPath
  };
}

function printList(entries) {
  entries.forEach((entry) => {
    const labels = [
      entry.routeEntry ? 'route-entry' : 'root'
    ];

    if (entry.preCoverLoading) {
      labels.push('pre-cover-loading');
    }

    labels.push(`base=${entry.baseHref}`);

    console.log(`${entry.outputPath}  [${labels.join(', ')}]`);
  });
}

function printSummary(results) {
  const counts = results.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  console.log('\nIndex page generation summary');
  console.log('=============================');

  Object.keys(counts).sort().forEach((status) => {
    console.log(`${status}: ${counts[status]}`);
  });

  const changed = results.filter((item) => {
    return [
      'created',
      'updated',
      'missing',
      'stale',
      'would-create',
      'would-update'
    ].includes(item.status);
  });

  if (changed.length) {
    console.log('\nDetails');
    console.log('-------');

    changed.forEach((item) => {
      console.log(`${item.status}: ${item.path}`);
    });
  }
}

function main() {
  const entries = collectEntries();

  if (flags.list) {
    printList(entries);
    return;
  }

  const templatePath = config.templatePath || 'scripts/templates/index.template.html';
  const templateAbs = toRepoPath(templatePath);

  if (!fs.existsSync(templateAbs)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  const template = fs.readFileSync(templateAbs, 'utf8');
  const results = [];

  entries.forEach((entry) => {
    const content = ensureTrailingNewline(renderTemplate(template, entry));
    results.push(writeOrCheckEntry(entry, content));
  });

  printSummary(results);

  if (flags.check) {
    const hasDiff = results.some((item) => {
      return item.status === 'missing' || item.status === 'stale';
    });

    if (hasDiff) {
      console.error('\nGenerated index pages are not up to date.');
      console.error('Run: node scripts/generate_index_pages.js');
      process.exitCode = 1;
    }
  }
}

try {
  main();
} catch (err) {
  console.error('[generate_index_pages] Failed.');
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
}