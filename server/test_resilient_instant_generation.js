import http from 'http';

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({
      hostname: 'localhost',
      port: 5000,
      path
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
  });
}

const TOOLS_TO_TEST = [
  { id: 'rc', serviceType: 'rcDownload', sample: 'UP32AB1234', key: 'regNo' },
  { id: 'pan', serviceType: 'panCard', sample: 'ABCDE1234F', key: 'panNo' },
  { id: 'aadhaar', serviceType: 'aadhaarCard', sample: '5412 8796 3214', key: 'aadhaarNo' },
  { id: 'voter', serviceType: 'voterCard', sample: 'WBD1234567', key: 'epicNo' },
  { id: 'ayushman', serviceType: 'ayushmanCard', sample: 'PMJAY-UP-98214', key: 'pmjayId' },
  { id: 'ration', serviceType: 'rationCard', sample: '215409823412', key: 'rationNo' },
  { id: 'electricity', serviceType: 'electricityBill', sample: '7812903456', key: 'consumerNo' },
  { id: 'edistrict', serviceType: 'edistrictSlip', sample: '241550010098241', key: 'appNo' },
  { id: 'dl', serviceType: 'drivingLicence', sample: 'UP1420110012345', key: 'dlNo' },
  { id: 'challan', serviceType: 'challanSearch', sample: 'UP32AB1234', key: 'vehicleNo' },
  { id: 'epan', serviceType: 'ePan', sample: 'ABCDE1234F', key: 'panNo' },
  { id: 'receipt', serviceType: 'receiptMaker', sample: '9876543210', key: 'receiptNo' }
];

const DEPRECATED_TOOLS = [
  { id: 'findpan', serviceType: 'findPan', sample: '5412 8796 3214', key: 'query' },
  { id: 'searchepic', serviceType: 'searchEpic', sample: 'WBD1234567', key: 'epicNo' }
];

async function run() {
  console.log('🧪 Starting Resilient 1-Click Generation Verification (Zero Balance & Unauthenticated Citizen)...\n');
  let passed = 0;
  let failed = 0;

  for (const tool of TOOLS_TO_TEST) {
    // Test 1: execute-automated without cafe or with empty/zero balance
    const payload = {
      cafeId: 'SMARTCAFE-HQ',
      customerPhone: '9876543210',
      serviceType: tool.serviceType,
      operatorB2bDirect: false,
      previewMode: true,
      params: { [tool.key]: tool.sample }
    };

    try {
      const res = await postJson('/api/services/execute-automated', payload);
      if (res.status === 200 && res.data.success && (res.data.generatedData || res.data.vehicleData)) {
        console.log(`  ✅ PASS: 1-Click Automated [${tool.id}] (${tool.serviceType}) returned 200 OK + Data`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: 1-Click Automated [${tool.id}] returned status ${res.status}:`, res.data);
        failed++;
      }
    } catch (e) {
      console.error(`  ❌ ERROR in [${tool.id}]:`, e.message);
      failed++;
    }

    // Test 2: direct lookup fallback
    let lookupPath = `/api/${tool.id}/lookup/${encodeURIComponent(tool.sample)}`;
    if (tool.id === 'edistrict') lookupPath = `/api/edistrict/lookup/${encodeURIComponent(tool.sample)}/789240019234`;
    try {
      const lRes = await getJson(lookupPath);
      if (lRes.status === 200 && lRes.data) {
        console.log(`  ✅ PASS: Direct Lookup [${tool.id}] -> ${lookupPath} returned 200 OK`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: Direct Lookup [${tool.id}] returned status ${lRes.status}`);
        failed++;
      }
    } catch (e) {
      console.error(`  ❌ ERROR in direct lookup [${tool.id}]:`, e.message);
      failed++;
    }
  }

  // Test 3: verify deprecated scrapers are rejected with 410 Gone
  for (const tool of DEPRECATED_TOOLS) {
    try {
      const res = await postJson('/api/services/execute-automated', {
        cafeId: 'SMARTCAFE-HQ',
        customerPhone: '9876543210',
        serviceType: tool.serviceType,
        params: { [tool.key]: tool.sample }
      });
      if (res.status === 410) {
        console.log(`  ✅ PASS: Automated [${tool.id}] correctly rejected with HTTP 410 Gone`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: Automated [${tool.id}] returned status ${res.status} instead of 410`);
        failed++;
      }
    } catch (e) {
      console.error(`  ❌ ERROR in deprecated test [${tool.id}]:`, e.message);
      failed++;
    }

    try {
      const lRes = await getJson(`/api/${tool.id}/lookup/${encodeURIComponent(tool.sample)}`);
      if (lRes.status === 410) {
        console.log(`  ✅ PASS: Direct Lookup [${tool.id}] correctly rejected with HTTP 410 Gone`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: Direct Lookup [${tool.id}] returned status ${lRes.status} instead of 410`);
        failed++;
      }
    } catch (e) {
      console.error(`  ❌ ERROR in deprecated lookup [${tool.id}]:`, e.message);
      failed++;
    }
  }

  console.log(`\n==============================================`);
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
