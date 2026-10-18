const https = require('https');

https.get('https://smartcafe.sbs/', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Length:', data.length);
    const regex = /src=["'](\/assets\/[^"']+\.js)["']/g;
    let match;
    const js = [];
    while ((match = regex.exec(data)) !== null) {
      js.push(match[1]);
    }
    console.log('JS assets referenced:', js);
  });
}).on('error', (e) => console.error(e));
