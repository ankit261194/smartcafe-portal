// ═══════════════════════════════════════════════════════════════════════════
// SMART CAFE — PHASE 1 EXHAUSTIVE VERIFICATION TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5000;
const BASE = `http://127.0.0.1:${PORT}`;
const storePath = path.join(__dirname, 'data', 'store.json');
const storeBakPath = path.join(__dirname, 'data', 'store.json.bak');
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

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🧪 SMART CAFE: PHASE 1 EXHAUSTIVE BACKEND DATA & WALLET ENGINE TEST');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Idempotent State Setup: Ensure test user 8006517171 has exactly ₹500 balance
  try {
    const raw = fs.readFileSync(storePath, 'utf8').replace(/^\uFEFF/, '');
    const store = JSON.parse(raw);
    if (!Array.isArray(store.wallets)) store.wallets = [];
    let w = store.wallets.find(x => x.phone === '8006517171');
    if (!w) {
      w = { phone: '8006517171', customerName: 'Ankit Chaudhary', balance: 500, transactions: [] };
      store.wallets.push(w);
    } else {
      w.balance = 500;
    }
    if (!Array.isArray(store.users)) store.users = [];
    let u = store.users.find(x => x.phone === '8006517171');
    if (u) u.balance = 500;
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn('[SETUP WARNING]', e.message);
  }

  // 1. Ensure server is running
  let serverProcess = null;
  const isAlreadyRunning = await waitForServer(3);
  if (!isAlreadyRunning) {
    console.log('[TEST] Starting Node.js backend server on port', PORT, '...');
    serverProcess = spawn('node', ['server/server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'pipe'
    });
    serverProcess.stdout.on('data', data => {});
    serverProcess.stderr.on('data', data => {
      console.error('[SERVER ERROR]', data.toString().trim());
    });

    const ready = await waitForServer(40);
    if (!ready) {
      console.error('❌ Server failed to start within 20 seconds!');
      process.exit(1);
    }
    console.log('✅ Server online and responding on', BASE);
  } else {
    console.log('✅ Connected to running server on', BASE);
  }

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

  try {
    // Read pre-test store
    const preStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    let userWallet = (preStore.wallets || []).find(w => w.phone === '8006517171');
    const initialBal = userWallet ? parseFloat(userWallet.balance) : 500;
    console.log(`[STATE] User 8006517171 Initial Wallet Balance: ₹${initialBal}\n`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: Atomic Balance Guard — Reject on Insufficient Funds (HTTP 402)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[TEST 1] Testing Insufficient Balance rejection (HTTP 402)...');
    const brokeRes = await fetch(`${BASE}/api/pan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedBy: '9999999999', // Wallet with ₹0 balance
        role: 'cafe_operator',
        personal: { lastName: 'Test', dob: '1990-01-01', mobile: '9999999999' },
        address: { pincode: '203001', state: 'Uttar Pradesh' },
        aoCode: { areaCode: 'KNP' },
        identity: { aadhaarNumber: '123456789012' }
      })
    });
    const brokeJson = await brokeRes.json();
    console.log(`  Response: HTTP ${brokeRes.status} | Body:`, JSON.stringify(brokeJson));
    assert(brokeRes.status === 402, 'HTTP 402 Payment Required returned when balance < ₹145');
    assert(brokeJson.requiredAmount === 145, 'Error specifies exact required amount ₹145');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: Security & Tamper Guard — Zero Financial Leakage (Undercharge Protection)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2] Testing Zero Financial Leakage (Attempting feeCharged: ₹1 tamper)...');
    const tamperRes = await fetch(`${BASE}/api/pan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedBy: '8006517171',
        role: 'cafe_operator',
        feeCharged: 1, // Malicious undercharge attempt
        personal: { lastName: 'TamperTest', dob: '1995-01-01' },
        address: { pincode: '203001' },
        aoCode: { areaCode: 'KNP' },
        identity: { aadhaarNumber: '987654321098' }
      })
    });
    const tamperJson = await tamperRes.json();
    assert(tamperRes.status === 200, 'Application processed');
    assert(tamperJson.feeCharged === 145, 'Server strictly enforced minimum mandatory fee ₹145 (Ignored ₹1 tamper)');
    // Restore wallet for next tests
    await fetch(`${BASE}/api/superadmin/pan/applications/${tamperJson.trackingId}/issue-refund`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPERADMIN_KEY}` }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: Stringified JSON / FormData Parsing (Real Browser Form Compatibility)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3] Testing Stringified JSON Form-Data compatibility...');
    const stringifiedRes = await fetch(`${BASE}/api/pan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedBy: '8006517171',
        role: 'cafe_operator',
        personal: JSON.stringify({
          title: 'Shri',
          firstName: 'Ankit',
          lastName: 'Chaudhary',
          dob: '1998-05-15',
          fatherName: 'Rajendra Singh'
        }),
        address: JSON.stringify({
          flat: 'Shop No 4',
          premises: 'Main Market',
          pincode: '203001'
        }),
        aoCode: JSON.stringify({
          areaCode: 'KNP',
          aoType: 'W',
          rangeCode: '17',
          aoNumber: '95'
        }),
        identity: JSON.stringify({
          dobProof: '10th Marksheet',
          aadhaarNumber: '548963217458'
        }),
        documents: JSON.stringify({
          photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
          signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          aadhaarDoc: 'data:application/pdf;base64,JVBERi0xLjUK',
          dobDoc: 'data:application/pdf;base64,JVBERi0xLjUK'
        })
      })
    });
    const stringifiedJson = await stringifiedRes.json();
    assert(stringifiedRes.status === 200, 'HTTP 200 OK from stringified body');
    assert(stringifiedJson.success === true, 'Successfully parsed stringified nested fields');
    const mainPanId = stringifiedJson.trackingId;

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: Verifying store.json Persistence, Backup & Exact ₹145 Debit
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4] Verifying store.json persistence, backup (.bak) & exact ₹145 debit...');
    assert(fs.existsSync(storeBakPath), 'store.json.bak backup exists on disk before write');
    const postStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const savedPan = (postStore.panApplications || []).find(a => a.id === mainPanId);
    assert(!!savedPan, `PAN record ${mainPanId} found in store.json panApplications array`);
    assert(savedPan && savedPan.status === 'pending', 'PAN application initial status is strictly "pending"');
    assert(savedPan && savedPan.appliedBy === '8006517171', 'appliedBy matches 8006517171');
    assert(savedPan && savedPan.personal.lastName === 'Chaudhary', 'personal.lastName stored correctly');
    assert(savedPan && savedPan.aoCode.areaCode === 'KNP', 'aoCode.areaCode stored correctly');
    assert(savedPan && savedPan.financials.feeCharged === 145, 'financials.feeCharged is ₹145');
    assert(savedPan && savedPan.financials.baseCost === 120, 'financials.baseCost is ₹120');
    assert(savedPan && savedPan.financials.netProfit === 25, 'financials.netProfit is ₹25 (145 - 120)');

    // Check disk documents
    assert(savedPan && savedPan.documents.photo && fs.existsSync(path.join(__dirname, '..', savedPan.documents.photo.replace(/^\//, ''))), 'Photo saved to uploads/pan_docs/ and exists on disk');
    assert(savedPan && savedPan.documents.signature && fs.existsSync(path.join(__dirname, '..', savedPan.documents.signature.replace(/^\//, ''))), 'Signature saved to uploads/pan_docs/ and exists on disk');

    // Check wallet balance
    const updatedWallet = (postStore.wallets || []).find(w => w.phone === '8006517171');
    const newBal = updatedWallet ? parseFloat(updatedWallet.balance) : 0;
    const expectedBal = Math.round((initialBal - 145) * 100) / 100;
    console.log(`  Initial Balance: ₹${initialBal} | Expected: ₹${expectedBal} | Actual: ₹${newBal}`);
    assert(newBal === expectedBal, `Wallet balance reduced by exactly ₹145 (From ₹${initialBal} to ₹${newBal})`);

    // Check transaction entry
    const debitTxn = (updatedWallet.transactions || []).find(t => t.id === savedPan.financials.walletTxnId);
    assert(!!debitTxn && debitTxn.amount === 145 && debitTxn.type === 'debit', `Debit transaction of ₹145 logged in wallet transactions (${savedPan.financials.walletTxnId})`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: Fetch User Applications (GET /api/pan/my-applications)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5] Fetching user applications (GET /api/pan/my-applications)...');
    const myAppsRes = await fetch(`${BASE}/api/pan/my-applications?mobile=8006517171`);
    const myAppsJson = await myAppsRes.json();
    assert(myAppsRes.status === 200, 'HTTP 200 OK from /api/pan/my-applications');
    assert(myAppsJson.applications.some(a => a.id === mainPanId), `Application ${mainPanId} returned in user application list`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: SuperAdmin Security — Reject Unauthenticated Access (HTTP 401)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6] Testing SuperAdmin Security (Unauthenticated rejection)...');
    const unauthQueue = await fetch(`${BASE}/api/superadmin/pan/applications`);
    assert(unauthQueue.status === 401, 'Unauthenticated GET /api/superadmin/pan/applications strictly returns HTTP 401');
    const unauthRefund = await fetch(`${BASE}/api/superadmin/pan/applications/${mainPanId}/issue-refund`, { method: 'POST' });
    assert(unauthRefund.status === 401, 'Unauthenticated POST issue-refund strictly returns HTTP 401');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: SuperAdmin Queue & Status Filter (Authenticated)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 7] SuperAdmin queue filter (GET /api/superadmin/pan/applications)...');
    const saQueueRes = await fetch(`${BASE}/api/superadmin/pan/applications?status=pending`, {
      headers: { 'Authorization': `Bearer ${SUPERADMIN_KEY}` }
    });
    const saQueueJson = await saQueueRes.json();
    assert(saQueueRes.status === 200, 'HTTP 200 OK from /api/superadmin/pan/applications');
    assert(saQueueJson.applications.some(a => a.id === mainPanId), `Application ${mainPanId} visible in pending SuperAdmin queue`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: SuperAdmin Raise Objection (No Refund Allowed)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 8] SuperAdmin Raise Objection (No refund)...');
    const objRes = await fetch(`${BASE}/api/superadmin/pan/applications/${mainPanId}/raise-objection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERADMIN_KEY}`
      },
      body: JSON.stringify({ reason: 'Aadhaar copy is blurry / dim' })
    });
    const objJson = await objRes.json();
    assert(objRes.status === 200, 'HTTP 200 OK from raise-objection');
    assert(objJson.application.status === 'objection', 'Status changed to "objection"');
    assert(objJson.application.objectionDetails.reason === 'Aadhaar copy is blurry / dim', 'Objection reason stored');

    // Verify wallet NOT refunded
    const storeAfterObj = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const balAfterObj = (storeAfterObj.wallets.find(w => w.phone === '8006517171')).balance;
    assert(balAfterObj === expectedBal, `Wallet balance remains ₹${balAfterObj} (Zero refund on objection)`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 9: Resubmit Corrected Documents (Zero Fees Charged)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 9] Resubmit objection documents (Zero fees charged)...');
    const resubmitRes = await fetch(`${BASE}/api/pan/applications/${mainPanId}/resubmit-objection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: {
          aadhaarDoc: 'data:application/pdf;base64,JVBERi0xLjUKc2FtcGxl'
        },
        notes: 'Uploaded HD scanned Aadhaar document'
      })
    });
    const resubmitJson = await resubmitRes.json();
    assert(resubmitRes.status === 200, 'HTTP 200 OK from resubmit-objection');
    assert(resubmitJson.application.status === 'under_review', 'Status moved to "under_review"');
    const storeAfterResub = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const balAfterResub = (storeAfterResub.wallets.find(w => w.phone === '8006517171')).balance;
    assert(balAfterResub === expectedBal, `Wallet balance unchanged at ₹${balAfterResub} (No fee charged on resubmission)`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 10: SuperAdmin Complete Application (Ack No. & PDF Slip)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 10] SuperAdmin Complete application (15-digit Ack No.)...');
    const compRes = await fetch(`${BASE}/api/superadmin/pan/applications/${mainPanId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERADMIN_KEY}`
      },
      body: JSON.stringify({
        ackNumber: '123456789012345',
        slipPdf: 'data:application/pdf;base64,JVBERi0xLjUKc2xpcA=='
      })
    });
    const compJson = await compRes.json();
    assert(compRes.status === 200, 'HTTP 200 OK from complete endpoint');
    assert(compJson.application.status === 'completed', 'Application status updated to "completed"');
    assert(compJson.application.fulfillment.ackNumber === '123456789012345', '15-digit Ack number saved correctly');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 11: SuperAdmin Independent Refund (₹145 Credited Back)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 11] SuperAdmin Independent Refund (/api/superadmin/pan/applications/:id/issue-refund)...');
    const refundRes = await fetch(`${BASE}/api/superadmin/pan/applications/${mainPanId}/issue-refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERADMIN_KEY}`
      }
    });
    const refundJson = await refundRes.json();
    console.log(`  Response: HTTP ${refundRes.status} | Body:`, JSON.stringify(refundJson));
    assert(refundRes.status === 200, 'HTTP 200 OK received for issue-refund');
    assert(refundJson.refundedAmount === 145, 'Refunded amount is exactly ₹145');
    assert(refundJson.application.financials.isRefunded === true, 'application.financials.isRefunded set to true');

    // Verify wallet balance in store.json is restored
    const finalStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const finalWallet = finalStore.wallets.find(w => w.phone === '8006517171');
    const finalBal = finalWallet ? parseFloat(finalWallet.balance) : 0;
    console.log(`  Final Wallet Balance: ₹${finalBal} (Expected: ₹${initialBal})`);
    assert(finalBal === initialBal, `Wallet balance restored to ₹${finalBal} (credited ₹145)`);

    // Verify credit transaction logged
    const creditTxn = (finalWallet.transactions || []).find(t => t.id === refundJson.refundTxnId);
    assert(!!creditTxn && creditTxn.amount === 145 && creditTxn.type === 'credit', `Credit transaction of ₹145 logged in wallet transactions (${refundJson.refundTxnId})`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 12: Duplicate Refund Protection (Prevent double-refund leak)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 12] Testing Duplicate Refund protection...');
    const dupRefundRes = await fetch(`${BASE}/api/superadmin/pan/applications/${mainPanId}/issue-refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERADMIN_KEY}`
      }
    });
    assert(dupRefundRes.status === 400, 'HTTP 400 returned when attempting duplicate refund');
    const storeAfterDup = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    const balAfterDup = (storeAfterDup.wallets.find(w => w.phone === '8006517171')).balance;
    assert(balAfterDup === initialBal, `Wallet balance protected against duplicate refund (Still ₹${balAfterDup})`);

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 13: Universal Golden Rule 3 — Reject != Refund Separation
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[TEST 13] Testing Universal Golden Rule 3: Reject != Refund Separation...');
    const rejAppRes = await fetch(`${BASE}/api/pan/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appliedBy: '8006517171',
        role: 'cafe_operator',
        feeCharged: 145,
        personal: { lastName: 'RejectSeparationTest', dob: '1990-01-01' },
        address: { pincode: '203001' },
        aoCode: { areaCode: 'KNP' },
        identity: { aadhaarNumber: '112233445566' }
      })
    });
    const rejAppJson = await rejAppRes.json();
    const rejId = rejAppJson.trackingId;

    const rejBalBefore = (JSON.parse(fs.readFileSync(storePath, 'utf8')).wallets.find(w => w.phone === '8006517171')).balance;
    const markRejRes = await fetch(`${BASE}/api/superadmin/pan/applications/${rejId}/mark-rejected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERADMIN_KEY}`
      },
      body: JSON.stringify({ reason: 'Documents illegible' })
    });
    assert(markRejRes.status === 200, 'Mark Rejected returned HTTP 200');
    const rejBalAfter = (JSON.parse(fs.readFileSync(storePath, 'utf8')).wallets.find(w => w.phone === '8006517171')).balance;
    assert(rejBalAfter === rejBalBefore, `Wallet untouched upon Mark Rejected (Before: ₹${rejBalBefore}, After: ₹${rejBalAfter})`);

    // Now issue independent manual refund on rejected application
    const manualRefundRes = await fetch(`${BASE}/api/superadmin/pan/applications/${rejId}/issue-refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERADMIN_KEY}`
      }
    });
    assert(manualRefundRes.status === 200, 'Manual refund on rejected application succeeded with HTTP 200');
    const rejBalFinal = (JSON.parse(fs.readFileSync(storePath, 'utf8')).wallets.find(w => w.phone === '8006517171')).balance;
    assert(rejBalFinal === initialBal, `Wallet restored to ₹${initialBal} after explicit independent refund`);

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log(`🎉 PHASE 1 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('═══════════════════════════════════════════════════════════════════════════');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    if (serverProcess) {
      console.log('[TEST] Stopping test server instance...');
      serverProcess.kill('SIGTERM');
    }
  }
}

main().catch(err => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});
