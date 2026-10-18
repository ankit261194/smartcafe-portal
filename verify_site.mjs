import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'client', 'dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.json') contentType = 'application/json';
    if (ext === '.svg') contentType = 'image/svg+xml';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
  }
});

server.listen(5299, async () => {
  console.log('Static server on http://localhost:5299');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.join(__dirname, 'tmp_chrome_verify');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5299'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let exceptions = [];
  let consoleLogs = [];

  try {
    const tabsRes = await fetch('http://127.0.0.1:9223/json');
    const tabs = await tabsRes.json();
    const pageTab = tabs.find(t => t.url.includes('localhost:5299')) || tabs[0];

    if (pageTab?.webSocketDebuggerUrl) {
      const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
      let evalResult = null;

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 3,
            method: 'Runtime.evaluate',
            params: {
              expression: `({
                title: document.title,
                hasErrorElement: !!document.getElementById('root-error-text'),
                errorText: document.getElementById('root-error-text')?.innerText || '',
                rootChildrenCount: document.getElementById('root')?.children?.length || 0,
                bodySnippet: document.body.innerText.slice(0, 500)
              })`,
              returnByValue: true
            }
          }));
        }, 3000);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          consoleLogs.push({ type: msg.params.type, args: msg.params.args?.map(a => a.value || a.description) });
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          exceptions.push(msg.params.exceptionDetails);
        }
        if (msg.id === 3) {
          evalResult = msg.result?.result?.value;
        }
      };

      await new Promise(r => setTimeout(r, 6000));
      ws.close();

      console.log('--- EVALUATION RESULT ---');
      console.log(evalResult);
      console.log('--- EXCEPTIONS (' + exceptions.length + ') ---');
      exceptions.forEach(e => console.error(e.text, e.exception?.description));
      console.log('--- CONSOLE LOGS COUNT:', consoleLogs.length);
    }
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    browser.kill();
    server.close();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
    process.exit(0);
  }
});
