const https = require('https');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function main() {
  const home = await getUrl('https://smartcafe.sbs/');
  console.log('Home Status:', home.status);
  
  // Find script tags
  const scriptRegex = /<script[^>]*src=["']([^"']+)["']/g;
  let match;
  const scriptUrls = [];
  while ((match = scriptRegex.exec(home.data)) !== null) {
    scriptUrls.push(match[1]);
  }
  console.log('Script URLs found in HTML:', scriptUrls);

  for (const s of scriptUrls) {
    const fullUrl = s.startsWith('http') ? s : 'https://smartcafe.sbs' + (s.startsWith('/') ? '' : '/') + s;
    const sRes = await getUrl(fullUrl);
    console.log(`Script ${fullUrl} -> Status ${sRes.status}, Length: ${sRes.data.length}`);
  }

  // Check API endpoints
  const apiStats = await getUrl('https://smartcafe.sbs/api/index.php?endpoint=services');
  console.log('API /services -> Status:', apiStats.status, 'Length:', apiStats.data.length);
  try {
    const json = JSON.parse(apiStats.data);
    console.log('API /services JSON success:', json.success, 'Count:', json.services ? json.services.length : 0);
  } catch (e) {
    console.log('API /services not JSON:', apiStats.data.substring(0, 200));
  }
}

main().catch(console.error);
