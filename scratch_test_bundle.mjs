global.window = {
  location: { pathname: '/', search: '', hash: '', protocol: 'https:' },
  innerWidth: 1200,
  innerHeight: 800,
  addEventListener: () => {},
  removeEventListener: () => {},
  history: { pushState: () => {}, replaceState: () => {} },
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  navigator: { onLine: true, userAgent: 'test' }
};
global.atob = global.window.atob;
global.btoa = global.window.btoa;
global.document = {
  documentElement: { classList: { add: () => {}, remove: () => {} } },
  getElementById: (id) => ({
    nodeType: 1,
    appendChild: () => {},
    removeChild: () => {},
    addEventListener: () => {},
    innerHTML: ''
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
  head: { appendChild: () => {} }
};
global.MutationObserver = class {
  observe() {}
  disconnect() {}
};
global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;
global.navigator = global.window.navigator;
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

try {
  // Let's import the compiled JS bundle!
  console.log('Testing execution of compiled JS bundle...');
  import('./client/dist/assets/index-Ca_c-TNr.js').then(() => {
    console.log('Bundle loaded without top-level errors!');
  }).catch(err => {
    console.error('BUNDLE THREW ERROR ON IMPORT:', err);
  });
} catch(e) {
  console.error('SYNC ERROR:', e);
}
