#!/usr/bin/env node
'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_RESOURCES_PATH = path.join(
  ROOT,
  'assets',
  'js',
  'Config',
  'SiteResources.js'
);
const BOOTSTRAP_ROUTES_PATH = path.join(
  ROOT,
  'assets',
  'js',
  'Functions',
  'bootstrap',
  'BootstrapRoutes.js'
);

function loadRoutes() {
  const sandbox = {
    URL,
    console,
    setTimeout,
    requestAnimationFrame(callback) {
      callback();
    },
    document: {
      documentElement: {
        getAttribute() {
          return 'en';
        },
        setAttribute() {}
      },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      getElementById() {
        return null;
      },
      createElement() {
        return {
          setAttribute() {},
          remove() {}
        };
      },
      head: {
        appendChild() {}
      }
    },
    window: {
      SiteFonts: {
        externalStyles: []
      },
      __SITE_ROOT__: '/',
      location: {
        origin:
          'https://stardust-math.github.io',
        href:
          'https://stardust-math.github.io/en/about/',
        pathname:
          '/en/about/',
        search: '',
        hash: ''
      },
      history: {
        state: null,
        scrollRestoration: 'auto',
        pushState() {},
        replaceState() {}
      },
      sessionStorage: {
        getItem() {
          return null;
        },
        setItem() {}
      },
      addEventListener() {},
      setTimeout,
      scrollX: 0,
      scrollY: 0,
      pageXOffset: 0,
      pageYOffset: 0
    }
  };

  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.URL = URL;

  vm.createContext(sandbox);

  vm.runInContext(
    fs.readFileSync(
      SITE_RESOURCES_PATH,
      'utf8'
    ),
    sandbox,
    {
      filename:
        'assets/js/Config/SiteResources.js'
    }
  );

  vm.runInContext(
    fs.readFileSync(
      BOOTSTRAP_ROUTES_PATH,
      'utf8'
    ),
    sandbox,
    {
      filename:
        'assets/js/Functions/bootstrap/BootstrapRoutes.js'
    }
  );

  sandbox.window.BootstrapRoutes.configure({
    pageConfigs:
      sandbox.window.SiteResources.pages,
    navigation:
      sandbox.window.SiteResources.navigation
  });

  return sandbox.window.BootstrapRoutes;
}

function main() {
  const routes = loadRoutes();

  const cases = [
    ['/', undefined, '/'],
    ['/en/about/', undefined, '/en/about/'],
    ['/en/about/profile/', undefined, '/en/about/'],
    ['/zh/about/profile/', undefined, '/zh/about/'],
    ['/about/profile/', undefined, '/en/about/'],
    ['/en/about/archive/', undefined, '/en/about/archive/'],
    ['/en/schedule/my_timetable/', undefined, '/en/schedule/'],
    ['/zh/social/constellation/', undefined, '/zh/social/'],
    ['/en/life/activities_moments/', undefined, '/en/life/'],
    [
      '/zh/life/activities_moments/2026_05_16/',
      undefined,
      '/zh/life/activities_moments/2026_05_16/'
    ],
    ['/en/life/meditations/', undefined, '/en/life/meditations/'],
    [
      '/en/about/profile/index.html?from=test#top',
      undefined,
      '/en/about/'
    ],
    ['/en/about/profile/', 'zh', '/zh/about/']
  ];

  cases.forEach(([pathname, language, expected]) => {
    assert.equal(
      routes.getCanonicalPath(
        pathname,
        language
      ),
      expected,
      `${pathname} canonical path`
    );
  });

  assert.equal(
    routes.getCanonicalUrl(
      '/zh/social/constellation/'
    ),
    'https://stardust-math.github.io/zh/social/'
  );

  console.log(
    `Route metadata check passed (${cases.length} cases).`
  );
}

main();
