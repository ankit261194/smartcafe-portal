const { spawn } = require('child_process');
const http = require('http');

async function testWithBrowser() {
  console.log('Launching Edge with remote debugging port 9222...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const fs = require('fs');
  const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const tmpDir = 'C:\\Users\\hp\\.gemini\\antigravity\\scratch\\cybercafe-portal\\browser_tmp';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = spawn(browserPath, [
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--disable-gpu',
    'https://smartcafe.sbs'
  ]);

  // Wait for port 9222
  await new Promise(r => setTimeout(r, 2000));

  function getTabs() {
    return new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json', res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
    });
  }

  let tabs;
  for (let i = 0; i < 5; i++) {
    try {
      tabs = await getTabs();
      if (tabs && tabs.length > 0) break;
    } catch(e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('Open Tabs:', tabs?.map(t => ({ title: t.title, url: t.url })));

  const targetTab = tabs.find(t => t.url.includes('smartcafe.sbs')) || tabs[0];
  console.log('Targeting Tab:', targetTab.url);

  // Connect via native WebSocket to target tab
  if (targetTab && targetTab.webSocketDebuggerUrl) {
    const wsUrl = targetTab.webSocketDebuggerUrl;
    console.log('Connecting to WebSocket:', wsUrl);
    const WebSocket = globalThis.WebSocket;
    if (WebSocket) {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        console.log('Connected to CDP!');
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 4, method: 'Network.enable' }));
      };
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', data.params.type, data.params.args?.map(a => a.value || a.description));
        }
        if (data.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER UNCAUGHT EXCEPTION]', data.params.exceptionDetails);
        }
        if (data.method === 'Log.entryAdded') {
          console.log('[LOG ENTRY]', data.params.entry.level, data.params.entry.text);
        }
      };

      console.log('Waiting 10s for page to load or challenge to pass...');
      await new Promise(r => setTimeout(r, 10000));

      const updatedTabs = await getTabs();
      const currentTab = updatedTabs.find(t => t.url.includes('smartcafe.sbs')) || updatedTabs[0];
      console.log('Updated Tab Title after 10s:', currentTab?.title, 'URL:', currentTab?.url);

      ws.close();
    }
  }

  browser.kill();
  console.log('Browser test complete.');
}

testWithBrowser().catch(console.error);
