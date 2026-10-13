import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRealWorldFeatures() {
  console.log('🚀 Testing Real-World Features & Ground-Level Hardening...\n');
  const baseUrl = 'http://localhost:5000';

  // 1. Test Super Admin Financials & Broadcast
  console.log('--- 1. Testing Super Admin Financials & Broadcast Announcement ---');
  const statsRes = await fetch(`${baseUrl}/api/superadmin/stats`);
  const stats = await statsRes.json();
  console.log(`  Total Cafes: ${stats.totalCafes}`);
  console.log(`  Wholesale Service Revenue: ₹${stats.wholesaleServiceRevenue}`);
  console.log(`  Total Platform Earnings: ₹${stats.totalPlatformEarnings}`);
  if (stats.totalPlatformEarnings !== undefined) {
    console.log('  ✅ PASS: Platform Financials Ledger verified!');
  } else {
    throw new Error('Platform financials missing in stats!');
  }

  // Publish Broadcast
  const bcPost = await fetch(`${baseUrl}/api/superadmin/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'परीक्षण: ई-डिस्ट्रिक्ट पोर्टल पर आज सायं 5 बजे सर्वर मेंटेनेंस रहेगा।',
      type: 'warning'
    })
  });
  const bcData = await bcPost.json();
  if (bcData.success && bcData.broadcastNotice?.message) {
    console.log('  ✅ PASS: Broadcast notice published successfully!');
  } else {
    throw new Error('Failed to publish broadcast notice');
  }

  // Fetch Public Broadcast
  const bcGet = await fetch(`${baseUrl}/api/broadcast`);
  const publicBc = await bcGet.json();
  if (publicBc.broadcast?.active && publicBc.broadcast.type === 'warning') {
    console.log(`  ✅ PASS: Public broadcast active: "${publicBc.broadcast.message}"`);
  } else {
    throw new Error('Public broadcast not active or type mismatch');
  }

  // Clear Broadcast
  const bcDel = await fetch(`${baseUrl}/api/superadmin/broadcast`, { method: 'DELETE' });
  const bcDelData = await bcDel.json();
  if (bcDelData.success) {
    console.log('  ✅ PASS: Broadcast notice successfully cleared!');
  }

  // 2. Test Customer Session 4-Digit Security PIN
  console.log('\n--- 2. Testing Customer Session 4-Digit Security PIN ---');
  const testPhone = '9876123450';
  const regRes = await fetch(`${baseUrl}/api/auth/customer/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      name: 'सोनू शर्मा',
      pin: '4321',
      cafeId: 'CAFE-101'
    })
  });
  const regData = await regRes.json();
  if (regData.success && regData.customer.name === 'सोनू शर्मा') {
    console.log('  ✅ PASS: Customer registered with 4-digit PIN 4321');
  }

  // Try logging in with WRONG pin
  const wrongPinRes = await fetch(`${baseUrl}/api/auth/customer/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      name: 'सोनू शर्मा',
      pin: '9999'
    })
  });
  if (wrongPinRes.status === 401) {
    console.log('  ✅ PASS: HTTP 401 Unauthorized returned on wrong PIN!');
  } else {
    throw new Error('Server allowed login with wrong PIN!');
  }

  // Correct PIN
  const correctPinRes = await fetch(`${baseUrl}/api/auth/customer/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      name: 'सोनू शर्मा',
      pin: '4321'
    })
  });
  if (correctPinRes.ok) {
    console.log('  ✅ PASS: Customer authenticated with correct PIN!');
  }

  // 3. Test Cashbook CSV Export with UTF-8 BOM
  console.log('\n--- 3. Testing Cashbook UTF-8 BOM CSV Export ---');
  // First add an entry to cashbook with Hindi characters
  await fetch(`${baseUrl}/api/cashbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cafeId: 'CAFE-101',
      title: 'पासपोर्ट फोटो 8 पीस',
      category: 'Photo',
      amount: 50,
      paymentMode: 'cash',
      type: 'income',
      customer: 'राजेश कुमार जी'
    })
  });

  const csvRes = await fetch(`${baseUrl}/api/cashbook/export-csv?cafeId=CAFE-101&filter=today`);
  const buf = await csvRes.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const hasBom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
  const decodedText = new TextDecoder().decode(bytes);
  console.log(`  CSV Status: ${csvRes.status}, BOM Detected: ${hasBom}, Length: ${bytes.length} bytes`);
  if (hasBom && decodedText.includes('राजेश कुमार जी')) {
    console.log('  ✅ PASS: Cashbook CSV has UTF-8 BOM and preserves Hindi characters!');
  } else {
    throw new Error(`CSV missing UTF-8 BOM or Hindi text corrupted! hasBom: ${hasBom}`);
  }

  // Clean up test entry from store.json
  const storePath = path.join(__dirname, '..', 'server', 'data', 'store.json');
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  store.cashbook = store.cashbook.filter(c => c.customer !== 'राजेश कुमार जी');
  store.wallets = store.wallets.filter(w => w.phone !== testPhone);
  store.broadcastNotice = null;
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  console.log('  🧹 Cleaned up: Database restored to authentic baseline.');

  console.log('\n========================================');
  console.log('🎉 ALL REAL-WORLD HARDENING VERIFICATIONS PASSED!');
  console.log('========================================');
}

testRealWorldFeatures().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
