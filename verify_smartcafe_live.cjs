const https = require('https');

function postJson(url, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(postData);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

async function verify() {
  console.log('=== 1. Checking Live Wallet for 8006518960 on smartcafe.sbs ===');
  const w = await getJson('https://smartcafe.sbs/api/wallet/8006518960');
  console.log('Wallet Status:', w.status, 'Response:', w.body);

  console.log('\n=== 2. Testing Live RC Details via Dynamic Router on smartcafe.sbs ===');
  const rc = await postJson('https://smartcafe.sbs/api/services/execute-automated', {
    serviceType: 'rc_to_details',
    previewMode: true,
    params: { query: 'UP32AB1234' }
  });
  console.log('RC Status:', rc.status, 'Preview:', rc.body.substring(0, 250));

  console.log('\n=== 3. Testing Live Voter Verification via Dynamic Router on smartcafe.sbs ===');
  const voter = await postJson('https://smartcafe.sbs/api/services/execute-automated', {
    serviceType: 'voter_verification',
    previewMode: true,
    params: { query: 'XRI0815480' }
  });
  console.log('Voter Status:', voter.status, 'Preview:', voter.body.substring(0, 250));

  console.log('\n=== 4. Testing Live Electric Bill via Dynamic Router on smartcafe.sbs ===');
  const bill = await postJson('https://smartcafe.sbs/api/services/execute-automated', {
    serviceType: 'electric_bill_pdf_bihar',
    previewMode: true,
    params: { query: '1263046893' }
  });
  console.log('Electric Bill Status:', bill.status, 'Preview:', bill.body.substring(0, 250));

  console.log('\n=== 5. Testing Live PAN to GST via Dynamic Router on smartcafe.sbs ===');
  const pan = await postJson('https://smartcafe.sbs/api/services/execute-automated', {
    serviceType: 'pan_to_gst',
    previewMode: true,
    params: { query: 'AAACA1234A' }
  });
  console.log('PAN to GST Status:', pan.status, 'Preview:', pan.body.substring(0, 250));
}

verify();
