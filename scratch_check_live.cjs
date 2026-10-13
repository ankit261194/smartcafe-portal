const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function main() {
  const home = await checkUrl('https://smartcafe.sbs');
  console.log('Homepage status:', home.statusCode);
  console.log('Last-Modified:', home.headers && home.headers['last-modified']);
  console.log('ETag:', home.headers && home.headers['etag']);
  const jsMatches = (home.body || '').match(/src=[\"\']([^\"\']*\.js)[\"\']/g);
  const cssMatches = (home.body || '').match(/href=[\"\']([^\"\']*\.css)[\"\']/g);
  console.log('JS files referenced:', jsMatches);
  console.log('CSS files referenced:', cssMatches);

  const health = await checkUrl('https://smartcafe.sbs/api/health');
  console.log('Health status:', health.statusCode);
  console.log('Health response:', health.body);
}

main();
