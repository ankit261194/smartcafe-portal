/**
 * Autonomous Search Engine Indexer & SEO Submitter
 * Submits all pages and sitemaps directly to Google, Bing, and IndexNow
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = 'smartcafe.sbs';
const INDEXNOW_KEY = 'c7e85293d9b441f3a09724ef139b83b1';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// 1. Extract all URLs from sitemap.xml
function extractUrlsFromSitemap() {
  const sitemapPath = path.join(__dirname, '..', 'client', 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('Sitemap not found at:', sitemapPath);
    return [`https://${HOST}/`];
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(content)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  return urls;
}

// 2. HTTP Helper
function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'http:' ? http : https;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// 3. Submit to IndexNow
async function submitIndexNow(urls, endpointHost = 'api.indexnow.org') {
  console.log(`\n[IndexNow] Submitting ${urls.length} URLs to ${endpointHost}...`);
  const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  });

  try {
    const res = await httpRequest({
      hostname: endpointHost,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'SmartCafe-AutoIndexer/1.0'
      }
    }, payload);

    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log(`[IndexNow] SUCCESS (${res.statusCode}) from ${endpointHost} - All ${urls.length} URLs queued for indexing!`);
      return { success: true, status: res.statusCode };
    } else {
      console.warn(`[IndexNow] Notice (${res.statusCode}) from ${endpointHost}:`, res.body || 'No body');
      return { success: false, status: res.statusCode, body: res.body };
    }
  } catch (err) {
    console.error(`[IndexNow] Error submitting to ${endpointHost}:`, err.message);
    return { success: false, error: err.message };
  }
}

// 4. Ping Search Engine Sitemaps
async function pingSitemap(engineName, pingUrl) {
  console.log(`\n[Ping] Pinging ${engineName} with sitemap: ${pingUrl}...`);
  try {
    const urlObj = new URL(pingUrl);
    const res = await httpRequest({
      hostname: urlObj.hostname,
      port: urlObj.protocol === 'https:' ? 443 : 80,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(`[Ping] ${engineName} response: HTTP ${res.statusCode}`);
    return { success: res.statusCode === 200, status: res.statusCode };
  } catch (err) {
    console.error(`[Ping] Error pinging ${engineName}:`, err.message);
    return { success: false, error: err.message };
  }
}

// 5. Run full SEO indexing pipeline
async function runIndexingPipeline() {
  console.log('================================================================');
  console.log('🚀 SMART CAFE B2B - AUTONOMOUS SEARCH ENGINE INDEXER');
  console.log(`Target: https://${HOST}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('================================================================');

  const urls = extractUrlsFromSitemap();
  console.log(`Found ${urls.length} indexed URLs in sitemap:`);
  urls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));

  // 1. Submit to IndexNow API (Bing, Yandex, Seznam, Naver)
  const indexNowRes1 = await submitIndexNow(urls, 'api.indexnow.org');
  const indexNowRes2 = await submitIndexNow(urls, 'www.bing.com');

  // 2. Ping Search Engine sitemaps
  const googlePing = await pingSitemap('Google', `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
  const bingPing = await pingSitemap('Bing', `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);

  console.log('\n================================================================');
  console.log('INDEXING SUBMISSION SUMMARY:');
  console.log(`- Total URLs submitted: ${urls.length}`);
  console.log(`- IndexNow (api.indexnow.org): ${indexNowRes1.status || 'Error'}`);
  console.log(`- IndexNow (www.bing.com): ${indexNowRes2.status || 'Error'}`);
  console.log(`- Google Sitemap Ping: ${googlePing.status || 'Done'}`);
  console.log(`- Bing Sitemap Ping: ${bingPing.status || 'Done'}`);
  console.log('================================================================');

  return {
    urlsCount: urls.length,
    indexNow: indexNowRes1,
    bingIndexNow: indexNowRes2,
    googlePing,
    bingPing
  };
}

if (require.main === module) {
  runIndexingPipeline().then(() => process.exit(0)).catch(e => {
    console.error('Pipeline error:', e);
    process.exit(1);
  });
}

module.exports = { runIndexingPipeline, extractUrlsFromSitemap };
