// Targeted verification test for all 14 1-click Instant Tools
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = 'http://localhost:5000';

async function run14ToolsTest() {
  console.log('⚡ Starting 14 1-Click Instant Tools Deep Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // Backup store.json to keep baseline pristine
  const storePath = path.join(__dirname, 'data', 'store.json');
  const backupPath = path.join(__dirname, 'data', 'store.json.testbak14');
  fs.copyFileSync(storePath, backupPath);

  try {
    // 1. Test all 12 authentic lookup endpoints
    console.log('--- 1. Testing Instant Lookup Endpoints ---');
    const lookups = [
      { url: '/api/rc/lookup/UP32AB1234', field: 'regNo', expected: 'UP32AB1234', title: 'Vehicle RC Lookup' },
      { url: '/api/dl/lookup/UP1420110012345', field: 'dlNo', expected: 'UP1420110012345', title: 'Driving Licence Lookup' },
      { url: '/api/challan/lookup/UP32AB1234', field: 'vehicleNo', expected: 'UP32AB1234', title: 'Challan Lookup' },
      { url: '/api/epan/lookup/ABCDE1234F', field: 'panNo', expected: 'ABCDE1234F', title: 'e-PAN Lookup' },
      { url: '/api/receipt/lookup/9876543210', field: 'customerPhone', expected: '9876543210', title: 'Cafe Receipt Lookup' },
      { url: '/api/pan/lookup/ABCDE1234F', field: 'panNo', expected: 'ABCDE1234F', title: 'PAN Card Lookup' },
      { url: '/api/aadhaar/lookup/541287963214', field: 'aadhaarNo', expected: '5412 8796 3214', title: 'Aadhaar Card Lookup' },
      { url: '/api/voter/lookup/WBD1234567', field: 'epicNo', expected: 'WBD1234567', title: 'Voter Card Lookup' },
      { url: '/api/ayushman/lookup/PMJAYUP98214', field: 'pmjayId', expected: 'PMJAY-UP-98214', title: 'Ayushman Card Lookup' },
      { url: '/api/ration/lookup/215409823412', field: 'rationNo', expected: '215409823412', title: 'Ration Card Lookup' },
      { url: '/api/electricity/lookup/7812903456', field: 'consumerNo', expected: '7812903456', title: 'Electricity Bill Lookup' },
      { url: '/api/edistrict/lookup/241550010098241/789240019234', field: 'appNo', expected: '241550010098241', title: 'e-District Lookup' }
    ];

    for (const l of lookups) {
      const res = await fetch(`${BASE}${l.url}`);
      assert(res.status === 200, `${l.title} returns HTTP 200`);
      const data = await res.json();
      assert(data[l.field] !== undefined, `${l.title} returns expected field "${l.field}" (${data[l.field]})`);
    }

    // Verify deprecated fake scraper lookups return 410 Gone
    const deprecatedScrapers = [
      { url: '/api/findpan/lookup/541287963214', title: 'Find PAN (Scraper Deprecated)' },
      { url: '/api/searchepic/lookup/WBD1234567', title: 'Search EPIC (Scraper Deprecated)' }
    ];
    for (const d of deprecatedScrapers) {
      const res = await fetch(`${BASE}${d.url}`);
      assert(res.status === 410, `${d.title} correctly rejected with HTTP 410 Gone`);
      const data = await res.json();
      assert(data.deprecated === true, `${d.title} confirms deprecation`);
    }

    // 2. Setup a test cafe and wallet to test automated execution
    console.log('\n--- 2. Setting Up Test Cafe & Funded Wallets ---');
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    store.cafes = store.cafes || [];
    const testCafe = {
      id: 'CAFE-999',
      code: '999',
      shopName: 'परीक्षण जन सेवा केंद्र',
      ownerName: 'परीक्षण संचालक',
      phone: '9999988888',
      email: 'test999@rekha.in',
      pin: '1234',
      status: 'active',
      subscriptionStatus: 'active',
      isFrozen: false,
      validTill: Date.now() + 365 * 86400000,
      b2bWallet: {
        balance: 10000,
        minThreshold: 200,
        transactions: []
      },
      retailRates: {
        rcDownload: 250,
        panCard: 30,
        aadhaarCard: 30,
        voterCard: 30,
        ayushmanCard: 30,
        rationCard: 25,
        electricityBill: 20,
        edistrictSlip: 30,
        drivingLicence: 50,
        challanSearch: 20,
        ePan: 25,
        receiptMaker: 15
      }
    };
    store.cafes.push(testCafe);
    store.wallets = store.wallets || [];
    store.wallets.push({
      phone: '9876543210',
      customerName: 'राजेश कुमार',
      balance: 10000,
      transactions: []
    });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

    // 3. Test execute-automated for all 12 authentic tools
    console.log('\n--- 3. Testing 1-Click Automated Execution Across All 12 Authentic Tools ---');
    const tools = [
      { serviceType: 'rcDownload', params: { vehicleNumber: 'UP32AB1234' }, title: 'वाहन RC' },
      { serviceType: 'panCard', params: { panNo: 'ABCDE1234F', name: 'राजेश कुमार' }, title: 'पैन कार्ड' },
      { serviceType: 'aadhaarCard', params: { aadhaarNo: '541287963214', name: 'अनिल वर्मा' }, title: 'आधार कार्ड' },
      { serviceType: 'voterCard', params: { epicNo: 'WBD1234567', name: 'धर्मेन्द्र' }, title: 'वोटर कार्ड' },
      { serviceType: 'ayushmanCard', params: { pmjayId: 'PMJAY-UP-98214' }, title: 'आयुष्मान कार्ड' },
      { serviceType: 'rationCard', params: { rationNo: '215409823412' }, title: 'राशन कार्ड' },
      { serviceType: 'electricityBill', params: { consumerNo: '7812903456' }, title: 'बिजली बिल' },
      { serviceType: 'edistrictSlip', params: { appNo: '241550010098241', certNo: '789240019234' }, title: 'e-District' },
      { serviceType: 'drivingLicence', params: { dlNo: 'UP1420110012345' }, title: 'ड्राइविंग लाइसेंस' },
      { serviceType: 'challanSearch', params: { vehicleNo: 'UP32AB1234' }, title: 'ई-चालान' },
      { serviceType: 'ePan', params: { panNo: 'ABCDE1234F' }, title: 'ई-पैन डाउनलोड' },
      { serviceType: 'receiptMaker', params: { query: '9876543210' }, title: 'कैफे बिल रसीद' }
    ];

    for (const t of tools) {
      const res = await fetch(`${BASE}/api/services/execute-automated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId: 'CAFE-999',
          customerPhone: '9876543210',
          serviceType: t.serviceType,
          params: t.params
        })
      });

      assert(res.status === 200, `execute-automated for ${t.title} (${t.serviceType}) returns HTTP 200`);
      const data = await res.json();
      assert(data.success === true, `execute-automated for ${t.title} succeeded`);
      assert(data.data !== undefined || data.generatedData !== undefined, `execute-automated for ${t.title} returned payload data`);
    }

    // Verify execute-automated rejects deprecated scrapers with 410
    const deprecatedTools = [
      { serviceType: 'findPan', params: { query: '541287963214' }, title: 'गुमशुदा पैन' },
      { serviceType: 'searchEpic', params: { epicNo: 'WBD1234567' }, title: 'सर्च EPIC' }
    ];
    for (const dt of deprecatedTools) {
      const res = await fetch(`${BASE}/api/services/execute-automated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId: 'CAFE-999',
          customerPhone: '9876543210',
          serviceType: dt.serviceType,
          params: dt.params
        })
      });
      assert(res.status === 410, `execute-automated correctly rejects deprecated ${dt.title} (${dt.serviceType}) with HTTP 410`);
    }

    // 4. Test Orders and Free Reprint Persistence
    console.log('\n--- 4. Testing Order Persistence & Free Reprint ---');
    const ordersRes = await fetch(`${BASE}/api/orders?phone=9876543210`);
    assert(ordersRes.status === 200, `/api/orders returns HTTP 200`);
    const ordersList = await ordersRes.json();
    assert(Array.isArray(ordersList), 'Orders response is an array');
    assert(ordersList.length >= 12, `All 12 authentic generated orders persisted in history (found: ${ordersList.length})`);

    // Verify order data integrity for instant reprint
    const sampleOrder = ordersList[0];
    assert(sampleOrder.orderId !== undefined, 'Order has valid orderId');
    assert(sampleOrder.docTitle !== undefined || sampleOrder.serviceTitle !== undefined, 'Order has valid docTitle');
    assert(sampleOrder.data !== undefined || sampleOrder.generatedData !== undefined, 'Order retains full generated data payload for 1-click free reprint');

  } finally {
    // Restore pristine store.json baseline
    fs.copyFileSync(backupPath, storePath);
    fs.unlinkSync(backupPath);
    const fut = new Date(Date.now() + 5000);
    fs.utimesSync(storePath, fut, fut);
    console.log('\n🧹 Baseline restored cleanly to store.json.');
  }

  console.log(`\n========================================`);
  console.log(`🎉 14 TOOLS VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run14ToolsTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
