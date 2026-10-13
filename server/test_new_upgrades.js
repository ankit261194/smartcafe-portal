// Targeted Verification for New Upgrades:
// 1. Master Password Aa@910010025123343 & PIN 9999
// 2. 0 Welcome Bonus on KYC Approval (balance === 0)
// 3. 365-Day License Auto-Expiry Cron Engine (Auto-freeze on expired validTill)
// 4. 1-Click Immediate Document Shredder API (/api/prints/:id/shred)
// 5. Clean baseline state restoration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = 'http://localhost:5000';
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storePath = path.join(__dirname, 'data', 'store.json');

async function runNewUpgradesTests() {
  console.log('🚀 Running Targeted Test Suite for CyberCafe Portal Hardening...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- 1. Master Password Verification ---
  console.log('--- 1. Master Password & Master PIN Verification ---');
  let superAdminToken = null;
  {
    // Login with Master Password Aa@910010025123343
    const passRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Aa@910010025123343' })
    });
    const passData = await passRes.json();
    assert(passRes.status === 200 && passData.token && passData.role === 'superadmin', 'Super Admin logs in with master password Aa@910010025123343');
    superAdminToken = passData.token;

    // Login with Master PIN 9999
    const pinRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '9999' })
    });
    const pinData = await pinRes.json();
    assert(pinRes.status === 200 && pinData.token, 'Super Admin logs in with master PIN 9999');

    // Reject incorrect password
    const wrongRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'WrongPassword123' })
    });
    assert(wrongRes.status === 401, 'Rejects incorrect password with HTTP 401');
  }

  // --- 2. Zero Welcome Bonus Verification on KYC Approval ---
  console.log('\n--- 2. Strictly Zero Welcome Bonus on KYC Approval ---');
  let approvedCafeId = null;
  {
    const kycUtr = String(Date.now()).slice(-12);
    const kycRes = await fetch(`${BASE}/api/kyc/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopName: 'टेस्ट कैफे ज़ीरो बोनस',
        ownerName: 'विक्रम सिंह',
        phone: '9988776655',
        vleId: 'CSC-TEST-9988',
        aadhaarNo: '1234 5678 9012',
        panNo: 'ABCDE9876F',
        upiId: 'vikram@upi',
        termsAccepted: true,
        utr: kycUtr,
        screenshotUrl: '/uploads/sample_slip.png'
      })
    });
    const kycData = await kycRes.json();
    assert(kycRes.status === 201 && kycData.application, 'Submitted VLE KYC application');
    const kycId = kycData.application.id;

    // Super Admin approves KYC
    const approveRes = await fetch(`${BASE}/api/superadmin/kyc-applications/${kycId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.success, 'Super Admin approved KYC');

    // Verify cafe in cafes list has balance strictly 0
    const cafesRes = await fetch(`${BASE}/api/cafes`);
    const cafes = await cafesRes.json();
    const createdCafe = cafes.find(c => c.phone === '9988776655');
    assert(Boolean(createdCafe), 'Newly registered cafe is present in active directory');
    if (createdCafe) {
      approvedCafeId = createdCafe.id;
      assert(createdCafe.b2bWallet.balance === 0, `Initial B2B wallet balance is strictly ₹0 (Actual: ₹${createdCafe.b2bWallet.balance})`);
      assert(createdCafe.subscription.status === 'active', 'Cafe subscription status is active');
      assert(Boolean(createdCafe.subscription.validTill), 'Cafe has 365-day validTill timestamp');
    }
  }

  // --- 3. 365-Day License Auto-Expiry Cron Engine ---
  console.log('\n--- 3. 365-Day License Auto-Expiry Cron Engine ---');
  {
    // Modify created cafe subscription to be expired (validTill in the past)
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const cafeIndex = store.cafes.findIndex(c => c.id === approvedCafeId);
    if (cafeIndex !== -1) {
      store.cafes[cafeIndex].subscription.validTill = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
    }

    // Trigger check-license-expiry
    const expiryRes = await fetch(`${BASE}/api/system/check-license-expiry`, {
      method: 'POST'
    });
    const expiryData = await expiryRes.json();
    assert(expiryRes.status === 200 && expiryData.success, 'Triggered /api/system/check-license-expiry endpoint');
    assert(expiryData.expiredCount >= 1, `Auto-expired cron flagged ${expiryData.expiredCount} cafe(s)`);

    // Verify cafe is now frozen
    const updatedCafesRes = await fetch(`${BASE}/api/cafes`);
    const updatedCafes = await updatedCafesRes.json();
    const frozenCafe = updatedCafes.find(c => c.id === approvedCafeId);
    assert(frozenCafe && frozenCafe.isFrozen === true, 'Cafe is automatically frozen (isFrozen: true)');
    assert(frozenCafe && frozenCafe.subscription.status === 'expired', 'Cafe subscription status changed to expired');
    assert(frozenCafe && frozenCafe.frozenReason.includes('सदस्यता समाप्त'), 'Cafe frozenReason correctly indicates license expiry');
  }

  // --- 4. 1-Click Immediate Document Shredder ---
  console.log('\n--- 4. 1-Click Immediate Document Shredder API ---');
  {
    // Create a temporary file in uploads
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const dummyFile = path.join(uploadsDir, `test_shred_${Date.now()}.pdf`);
    fs.writeFileSync(dummyFile, '%PDF-1.4 dummy print content for shredder test', 'utf8');
    assert(fs.existsSync(dummyFile), 'Created sample customer print document on disk');

    // Create print record in store
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const printId = `PRN-SHRED-${Date.now()}`;
    store.prints.push({
      id: printId,
      customerName: 'श्रेडर टेस्ट ग्राहक',
      phone: '9911223344',
      tokenNumber: 'P-999',
      fileName: path.basename(dummyFile),
      filePath: dummyFile,
      pages: 1,
      copies: 1,
      color: 'bw',
      status: 'pending',
      amount: 3,
      paid: true,
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

    // Call 1-click immediate shred API
    const shredRes = await fetch(`${BASE}/api/prints/${printId}/shred`, {
      method: 'POST'
    });
    const shredData = await shredRes.json();
    assert(shredRes.status === 200 && shredData.success, 'Invoked /api/prints/:id/shred successfully');
    assert(!fs.existsSync(dummyFile), 'Document file was IMMEDIATELY permanently shredded from disk');
    assert(shredData.print.fileShredded === true, 'Print record marked fileShredded: true');
    assert(shredData.print.filePath === '', 'Print record filePath wiped empty');
  }

  // --- 5. Clean Baseline Verification & Restoration ---
  console.log('\n--- 5. Clean Baseline State Verification ---');
  {
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    store.cafes = [];
    store.wallets = [];
    store.prints = [];
    store.vleKycApplications = [];
    store.utrRequests = [];
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');

    const cleanCafesRes = await fetch(`${BASE}/api/cafes`);
    const cleanCafes = await cleanCafesRes.json();
    assert(Array.isArray(cleanCafes) && cleanCafes.length === 0, 'Clean baseline verified: exactly 0 cafes in database');
  }

  console.log(`\n========================================`);
  console.log(`🎉 NEW UPGRADES VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runNewUpgradesTests().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
