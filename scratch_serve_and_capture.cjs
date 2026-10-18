const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
  }
});

server.listen(5199, () => {
  console.log('Local test server listening on http://localhost:5199');
  
  try {
    const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const output = execSync(`"${chrome}" --headless=new --virtual-time-budget=5000 --dump-dom http://localhost:5199`, { encoding: 'utf8' });
    
    fs.writeFileSync('dom_local.html', output, 'utf8');
    console.log('Saved dom_local.html. Output length:', output.length);

    if (output.includes('id="root-error-text"')) {
      const start = output.indexOf('id="root-error-text"');
      const text = output.substring(start, output.indexOf('</pre>', start));
      console.log('--- EXACT ROOT ERROR ---');
      console.log(text);
      console.log('------------------------');
    } else {
      console.log('No error boundary on local load! Checking if app rendered:');
      console.log('Contains RekhaDashboard/Portal:', output.includes('RekhaDashboard') || output.includes('डिजिटल साइबर कैफे'));
      const rootIdx = output.indexOf('<div id="root">');
      console.log(output.substring(rootIdx, rootIdx + 600));
    }
  } catch(e) {
    console.error('Chrome execution error:', e.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
