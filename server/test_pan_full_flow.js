// ═══════════════════════════════════════════════════════════════════════════
// SMART CAFE — PAN CARD SYSTEM COMPREHENSIVE END-TO-END VERIFICATION SUITE
// Tests Phases 1 through 6: Models, Wallets, Auto-Stamping, Admin Queue,
// PanSuvidha Bridge, and Golden Rules.
// ═══════════════════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { generateStampedForm49APdf } from '../client/src/utils/form49aStamper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5000;
const BASE = `http://127.0.0.1:${PORT}`;
const storePath = path.join(__dirname, 'data', 'store.json');
const SUPERADMIN_KEY = 'SUPERADMIN_Aa@910010025123343';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE}/api/pan/my-applications?mobile=0000000000`);
      if (res.status === 200 || res.status === 400) return true;
    } catch {}
    await sleep(500);
  }
  return false;
}

// 1x1 Transparent PNG sample
const DUMMY_PNG_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// Minimal 1x1 JPEG sample
const DUMMY_JPG_B64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function runSuite() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SMART CAFE: PAN CARD SYSTEM FULL E2E INTEGRATION SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

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

  // Setup test wallet with ₹1000 balance
  const testPhone = '8006517171';
  try {
    const raw = fs.readFileSync(storePath, 'utf8').replace(/^\uFEFF/, '');
    const store = JSON.parse(raw);
    if (!Array.isArray(store.wallets)) store.wallets = [];
    let w = store.wallets.find(x => x.phone === testPhone);
    if (!w) {
      w = { phone: testPhone, customerName: 'Ankit Chaudhary', balance: 1000, transactions: [] };
      store.wallets.push(w);
    } else {
      w.balance = 1000;
    }
    if (!Array.isArray(store.users)) store.users = [];
    let u = store.users.find(x => x.phone === testPhone);
    if (u) u.balance = 1000;
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn('[SETUP WARNING]', e.message);
  }

  // Ensure server is online
  let serverProcess = null;
  const isOnline = await waitForServer(3);
  if (!isOnline) {
    console.log('[TEST] Starting backend server...');
    serverProcess = spawn('node', ['server/server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'pipe'
    });
    const ready = await waitForServer(30);
    if (!ready) {
      console.error('❌ Server failed to start');
      process.exit(1);
    }
    console.log('✅ Server online on', BASE);
  } else {
    console.log('✅ Connected to existing server on', BASE);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 1: FORM 49A AUTO-STAMPING & MERGING ENGINE
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 1] Form 49A Digital Auto-Stamping & Merging Engine...');
  try {
    const appData = {
      id: 'PAN-TEST-001',
      personal: {
        title: 'Shri',
        firstName: 'Ankit',
        middleName: 'Kumar',
        lastName: 'Chaudhary',
        gender: 'Male',
        dob: '1998-05-15',
        fatherName: 'Rajendra Singh',
        cardParentChoice: 'father',
        mobile: '8006517171',
        email: 'ankit@example.com'
      },
      address: {
        flat: 'Shop 4',
        premises: 'Main Market',
        street: 'Station Road',
        locality: 'Sadar',
        city: 'Bulandshahar',
        state: 'Uttar Pradesh',
        pincode: '203001'
      },
      aoCode: {
        areaCode: 'KNP',
        aoType: 'W',
        rangeCode: '17',
        aoNumber: '95'
      },
      identity: {
        aadhaarNumber: '548963217458',
        nameOnAadhaar: 'Ankit Chaudhary',
        dobProof: '10th Marksheet'
      },
      photo: DUMMY_JPG_B64,
      signature: DUMMY_PNG_B64,
      aadhaarDoc: DUMMY_JPG_B64,
      dobDoc: DUMMY_JPG_B64
    };

    const res = await generateStampedForm49APdf(appData);
    assert(res && res.pdfBytes && res.pdfBytes.length > 3000, 'Form 49A PDF generated with valid bytes');
    assert(res.pdfBytes.length < 2 * 1024 * 1024, 'Stamped Form 49A PDF size is strictly < 2MB (' + Math.round(res.pdfBytes.length / 1024) + ' KB)');
  } catch (err) {
    assert(false, 'Form 49A Stamper error: ' + err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 2: RETAILER B2B APPLICATION & WALLET DEDUCTION (₹145)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 2] Retailer Application (₹145 Deduction)...');
  let b2bAppId = null;
  try {
    const res = await fetch(`${BASE}/api/pan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedBy: testPhone,
        role: 'cafe_operator',
        feeCharged: 145,
        personal: {
          title: 'Shri',
          firstName: 'Ankit',
          lastName: 'Chaudhary',
          dob: '1998-05-15',
          gender: 'Male',
          fatherName: 'Rajendra Singh',
          mobile: testPhone
        },
        address: {
          premises: 'Main Bazar',
          city: 'Bulandshahar',
          state: 'Uttar Pradesh',
          pincode: '203001'
        },
        aoCode: {
          areaCode: 'KNP',
          aoType: 'W',
          rangeCode: '17',
          aoNumber: '95'
        },
        identity: {
          aadhaarNumber: '548963217458',
          nameOnAadhaar: 'Ankit Chaudhary',
          dobProof: '10th / Matriculation Marksheet'
        },
        photo: DUMMY_JPG_B64,
        signature: DUMMY_PNG_B64
      })
    });

    const data = await res.json();
    assert(res.status === 200 && data.success, 'B2B PAN Application submitted successfully');
    assert(data.application && data.application.id, 'Application assigned unique ID: ' + data.application?.id);
    b2bAppId = data.application?.id;

    assert(data.application?.financials?.feeCharged === 145, 'Financial feeCharged is ₹145');
    assert(data.application?.financials?.netProfit === 25, 'Net profit is ₹25 (145 - 120 base)');
    assert(data.currentBalance === 855, 'Wallet balance reduced from ₹1000 to ₹855');
  } catch (err) {
    assert(false, 'B2B application error: ' + err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 3: CUSTOMER B2C APPLICATION & WALLET DEDUCTION (₹190)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 3] Customer B2C Application (₹190 Deduction)...');
  let b2cAppId = null;
  try {
    const res = await fetch(`${BASE}/api/pan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedBy: testPhone,
        role: 'customer',
        feeCharged: 190,
        personal: {
          title: 'Kumari',
          firstName: 'Pooja',
          lastName: 'Sharma',
          dob: '2001-08-20',
          gender: 'Female',
          fatherName: 'Ramesh Sharma',
          mobile: testPhone
        },
        address: {
          premises: 'Civil Lines',
          city: 'Meerut',
          state: 'Uttar Pradesh',
          pincode: '250001'
        },
        aoCode: {
          areaCode: 'MRT',
          aoType: 'W',
          rangeCode: '21',
          aoNumber: '88'
        },
        identity: {
          aadhaarNumber: '987456321458',
          nameOnAadhaar: 'Pooja Sharma',
          dobProof: 'Municipal Birth Certificate'
        },
        photo: DUMMY_JPG_B64,
        signature: DUMMY_PNG_B64
      })
    });

    const data = await res.json();
    assert(res.status === 200 && data.success, 'B2C PAN Application submitted successfully');
    b2cAppId = data.application?.id;
    assert(data.application?.financials?.feeCharged === 190, 'Financial feeCharged is ₹190 for B2C');
    assert(data.application?.financials?.netProfit === 70, 'Net profit is ₹70 (190 - 120 base)');
    assert(data.currentBalance === 665, 'Wallet balance reduced from ₹855 to ₹665 (855 - 190)');
  } catch (err) {
    assert(false, 'B2C application error: ' + err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 4: SUPERADMIN QUEUE & OBJECTION / RESUBMISSION WORKFLOW
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 4] SuperAdmin Objection & Zero-Fee Resubmission...');
  if (b2bAppId) {
    try {
      // 1. Raise Objection
      const objRes = await fetch(`${BASE}/api/superadmin/pan/applications/${b2bAppId}/raise-objection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-key': SUPERADMIN_KEY
        },
        body: JSON.stringify({ reason: 'Photograph has red eye glare' })
      });
      const objData = await objRes.json();
      assert(objRes.status === 200 && objData.success, 'Objection raised successfully');
      assert(objData.application?.status === 'objection', 'Status updated to objection');

      // Check wallet - Strict Golden Rule: Zero Refund on Objection!
      const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      const w = store.wallets.find(x => x.phone === testPhone);
      assert(w.balance === 665, 'Wallet untouched on objection (Still ₹665, ZERO refund)');

      // 2. Resubmit Objection Documents
      const resubRes = await fetch(`${BASE}/api/pan/applications/${b2bAppId}/resubmit-objection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliedBy: testPhone,
          photo: DUMMY_JPG_B64,
          notes: 'Uploaded studio photo'
        })
      });
      const resubData = await resubRes.json();
      assert(resubRes.status === 200 && resubData.success, 'Resubmitted objection documents successfully');
      assert(resubData.application?.status === 'under_review', 'Status moved to under_review');

      const storeAfter = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      const wAfter = storeAfter.wallets.find(x => x.phone === testPhone);
      assert(wAfter.balance === 665, 'Resubmission charged ₹0 (Wallet remains ₹665)');
    } catch (err) {
      assert(false, 'Objection/resubmission error: ' + err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 5: SUPERADMIN COMPLETION WITH 15-DIGIT ACK NUMBER
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 5] SuperAdmin Completion (15-Digit Ack No.)...');
  if (b2bAppId) {
    try {
      // Attempt invalid ack (<15 digits)
      const badRes = await fetch(`${BASE}/api/superadmin/pan/applications/${b2bAppId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-key': SUPERADMIN_KEY
        },
        body: JSON.stringify({ ackNumber: '12345' })
      });
      assert(badRes.status === 400, 'Rejects invalid ack number shorter than 15 digits');

      // Valid 15-digit ack
      const okRes = await fetch(`${BASE}/api/superadmin/pan/applications/${b2bAppId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-key': SUPERADMIN_KEY
        },
        body: JSON.stringify({
          ackNumber: '887766554433221',
          slipPdf: DUMMY_PNG_B64
        })
      });
      const okData = await okRes.json();
      assert(okRes.status === 200 && okData.success, 'Marked Completed with 15-digit Ack No');
      assert(okData.application?.status === 'completed', 'Application status is completed');
      assert(okData.application?.fulfillment?.ackNumber === '887766554433221', 'Ack number stored accurately');
    } catch (err) {
      assert(false, 'Completion error: ' + err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 6: UNIVERSAL GOLDEN RULE 3 (REJECT != REFUND SEPARATION)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 6] Universal Golden Rule 3: Reject != Refund...');
  if (b2cAppId) {
    try {
      // 1. Mark Rejected
      const rejRes = await fetch(`${BASE}/api/superadmin/pan/applications/${b2cAppId}/mark-rejected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-key': SUPERADMIN_KEY
        },
        body: JSON.stringify({ reason: 'Duplicate PAN detected' })
      });
      const rejData = await rejRes.json();
      assert(rejRes.status === 200 && rejData.success, 'Marked Rejected successfully');
      assert(rejData.application?.status === 'rejected', 'Status changed to rejected');

      // Strict Golden Rule: Wallet remains ₹665 (NO automatic refund on rejection)
      const storeRej = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      const wRej = storeRej.wallets.find(x => x.phone === testPhone);
      assert(wRej.balance === 665, 'Wallet untouched on Reject (Still ₹665, Golden Rule 3 confirmed)');

      // 2. Explicit Independent Refund
      const refRes = await fetch(`${BASE}/api/superadmin/pan/applications/${b2cAppId}/issue-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-key': SUPERADMIN_KEY
        }
      });
      const refData = await refRes.json();
      assert(refRes.status === 200 && refData.success, 'Independent refund issued successfully');
      assert(refData.refundedAmount === 190, 'Refunded exact B2C fee of ₹190');

      const storeRef = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      const wRef = storeRef.wallets.find(x => x.phone === testPhone);
      assert(wRef.balance === 855, 'Wallet restored to ₹855 (665 + 190)');

      // 3. Duplicate Refund Protection
      const dupRefRes = await fetch(`${BASE}/api/superadmin/pan/applications/${b2cAppId}/issue-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-superadmin-key': SUPERADMIN_KEY
        }
      });
      assert(dupRefRes.status === 400, 'Duplicate refund strictly prevented with HTTP 400');
    } catch (err) {
      assert(false, 'Reject/Refund error: ' + err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 7: PANSUVIDHA BRIDGE ASSET INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 7] PanSuvidha Bridge Asset Integrity...');
  try {
    const bridgePath = path.join(__dirname, '..', 'client', 'public', 'tools', 'pansuvidha_bridge.js');
    assert(fs.existsSync(bridgePath), 'pansuvidha_bridge.js exists in client/public/tools/');
    const bridgeContent = fs.readFileSync(bridgePath, 'utf8');
    assert(bridgeContent.includes('Smart Cafe Bridge'), 'pansuvidha_bridge.js contains Smart Cafe Bridge HUD');
    assert(bridgeContent.includes('executeAutofill'), 'pansuvidha_bridge.js contains executeAutofill engine');
    assert(bridgeContent.includes('txtLastName') || bridgeContent.includes('lastName'), 'pansuvidha_bridge.js includes Form 49A input mapping rules');
  } catch (err) {
    assert(false, 'Bridge asset test error: ' + err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 8: AO CODES (708 CITIES) INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST GROUP 8] AO Codes Catalog Integrity...');
  try {
    const aoPath = path.join(__dirname, '..', 'client', 'src', 'data', 'ao_codes.json');
    assert(fs.existsSync(aoPath), 'ao_codes.json exists');
    const aoData = JSON.parse(fs.readFileSync(aoPath, 'utf8'));
    assert(Array.isArray(aoData) && aoData.length >= 700, `ao_codes.json contains ${aoData.length} cities (>= 700 verified)`);
    const bulandshahar = aoData.find(x => x.city?.toUpperCase().includes('BULANDSHAHAR'));
    assert(bulandshahar && bulandshahar.areaCode === 'KNP', 'Bulandshahar AO code is KNP W 17 95');
  } catch (err) {
    assert(false, 'AO codes test error: ' + err.message);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════════════════════════');

  if (serverProcess) {
    serverProcess.kill();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
