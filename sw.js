/* "Stardust Math" service worker: offline fallback only */

(function () {
  'use strict';

  const SW_VERSION = 'stardust-offline-fallback-v2';

  function isNavigationRequest(request) {
    if (!request || request.method !== 'GET') return false;

    if (request.mode === 'navigate') {
      return true;
    }

    const accept = request.headers.get('accept') || '';
    return accept.indexOf('text/html') !== -1;
  }

  function createOfflineHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Connection Unavailable | Stardust Archive</title>

<style>
  :root {
    color-scheme: dark;
    --bg: #020612;
    --bg2: #071128;
    --ink: #eef5ff;
    --muted: rgba(224,235,255,0.72);
    --faint: rgba(224,235,255,0.4);
    --gold: rgba(228,202,141,0.85);
    --line: rgba(224,235,255,0.16);
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    height: 100%;
    background: var(--bg);
    font-family: Georgia, "Times New Roman", "Noto Serif SC", serif;
    color: var(--ink);
  }

  body {
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 30% 20%, rgba(100,140,255,0.12), transparent 40%),
      radial-gradient(circle at 70% 80%, rgba(228,202,141,0.08), transparent 45%),
      linear-gradient(180deg, var(--bg), var(--bg2));
  }

  .card {
    width: min(560px, calc(100vw - 40px));
    padding: 42px 34px;
    text-align: center;
    border-top: 1px solid var(--gold);
    border-bottom: 1px solid var(--line);
    position: relative;
  }

  .card::before,
  .card::after {
    content: "";
    position: absolute;
    left: 50%;
    width: 70px;
    height: 1px;
    transform: translateX(-50%);
    background: var(--gold);
  }

  .card::before { top: 0; }
  .card::after { bottom: 0; opacity: 0.3; }

  .title {
    font-size: 1.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0;
  }

  .sub {
    margin-top: 18px;
    color: var(--muted);
    line-height: 1.8;
    font-size: 1rem;
  }

  .site {
    margin-top: 22px;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    color: var(--faint);
  }

  .nav {
    margin-top: 10px;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    color: rgba(224,235,255,0.28);
  }

  button {
    margin-top: 28px;
    padding: 10px 18px;
    border-radius: 999px;
    border: 1px solid rgba(228,202,141,0.5);
    background: rgba(228,202,141,0.1);
    color: var(--ink);
    cursor: pointer;
    font: inherit;
  }

  button:hover {
    background: rgba(228,202,141,0.16);
  }

  button:active {
    transform: translateY(1px);
  }
</style>

</head>

<body>
  <div class="card">
    <h1 class="title">Connection Unavailable</h1>

    <div class="sub">
      This path is temporarily out of reach.<br/>
      Please restore your network connection and try again.
    </div>

    <div class="site">stardust-math.github.io</div>
    <div class="nav">ABOUT · SCHEDULE · SOCIAL · LIFE</div>

    <button onclick="window.location.reload()">
      Try Again
    </button>
  </div>
</body>
</html>`;
  }

  function createOfflineResponse() {
    return new Response(createOfflineHtml(), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  async function networkFirstNavigation(request) {
    try {
      return await fetch(request);
    } catch (err) {
      return createOfflineResponse();
    }
  }

  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      if (self.clients && self.clients.claim) {
        await self.clients.claim();
      }
    })());
  });

  self.addEventListener('fetch', (event) => {
    if (!isNavigationRequest(event.request)) return;
    event.respondWith(networkFirstNavigation(event.request));
  });

  self.__STARDUST_OFFLINE_SW_VERSION__ = SW_VERSION;
})();
