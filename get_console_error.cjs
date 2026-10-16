const http = require('http');
const { spawn } = require('child_process');

async function checkConsole() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9333;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-sandbox',
    'https://smartcafe.sbs'
  ]);

  await new Promise(r => setTimeout(r, 4000));

  http.get(`http://127.0.0.1:${port}/json`, async (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const page = tabs.find(t => t.type === 'page');
      if (!page || !page.webSocketDebuggerUrl) {
        console.log('No page found:', tabs);
        chromeProc.kill();
        return;
      }
      console.log('Connecting to:', page.webSocketDebuggerUrl);
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Page.reload' }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails, null, 2));
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
        }
      };

      await new Promise(r => setTimeout(r, 6000));
      ws.close();
      chromeProc.kill();
    });
  }).on('error', (err) => {
    console.error('HTTP Error:', err.message);
    chromeProc.kill();
  });
}

checkConsole();
