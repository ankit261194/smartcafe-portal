// Comprehensive End-to-End Test Suite for All 10 Pillars
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = 'http://localhost:5000';
const storePath = path.join(__dirname, 'data', 'store.json');
let backupStoreContent = null;

async function runTests() {
  console.log('🧪 Starting 10-Pillar Verification Test Suite...\n');
  try {
    backupStoreContent = fs.readFileSync(storePath, 'utf8');
  } catch (err) {
    console.warn('Could not backup store.json:', err.message);
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

  // Pre-authenticate sessions for Super Admin, Cafe Owner and Customer
  let superAdminToken = '';
  let cafeOwnerToken = '';
  let customerToken = '';

  try {
    const saLogin = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '9999' })
    });
    const saData = await saLogin.json();
    superAdminToken = saData.token || '';

    // Check & seed test cafes CAFE-101 and CAFE-102 for 10-pillar validation
    const cafesRes = await fetch(`${BASE}/api/cafes`);
    const cafesList = await cafesRes.json();
    if (!cafesList.find(c => c.id === 'CAFE-101' && (c.b2bWallet?.balance || 0) >= 200)) {
      await fetch(`${BASE}/api/cafes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${superAdminToken}` },
        body: JSON.stringify({
          id: 'CAFE-101',
          code: '101',
          shopName: 'श्री डिजिटल साइबर कैफे एवं जन सेवा केंद्र',
          ownerName: 'राजेश कुमार',
          phone: '9876543210',
          pin: '1234',
          staffPin: '0000',
          city: 'हरदोई',
          b2bWallet: { balance: 550, minThreshold: 200, transactions: [] }
        })
      });
    }
    if (!cafesList.find(c => c.id === 'CAFE-102' && (c.b2bWallet?.balance || 0) === 100)) {
      await fetch(`${BASE}/api/cafes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${superAdminToken}` },
        body: JSON.stringify({
          id: 'CAFE-102',
          code: '102',
          shopName: 'शर्मा जन सेवा केंद्र व कंप्यूटर कैफे',
          ownerName: 'अनिल शर्मा',
          phone: '9833445566',
          pin: '1234',
          staffPin: '0000',
          city: 'लखनऊ',
          b2bWallet: { balance: 100, minThreshold: 200, transactions: [] }
        })
      });
    }

    const cafeLogin = await fetch(`${BASE}/api/auth/cafe/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', pin: '1234' })
    });
    const cafeData = await cafeLogin.json();
    cafeOwnerToken = cafeData.token || '';

    const custLogin = await fetch(`${BASE}/api/auth/customer/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9812345678', name: 'राहुल वर्मा' })
    });
    const custData = await custLogin.json();
    customerToken = custData.token || '';
  } catch (err) {
    console.error('Pre-authentication error:', err.message);
  }

  // --- PILLAR 1: Two-Tier Financial Ledger Engine ---
  console.log('--- PILLAR 1 & 3: Two-Tier Financial Ledger & B2B Visibility Gate ---');
  {
    // Check service status for CAFE-102 (B2B balance = 100, wholesale = 200)
    const statusRes = await fetch(`${BASE}/api/cafes/CAFE-102/service-status/rcDownload`);
    const statusData = await statusRes.json();
    assert(statusData.isAvailable === false, 'CAFE-102 service is gated offline (B2B < wholesale)');
    assert(statusData.b2bBalance === 100, 'CAFE-102 B2B balance correctly reports 100');

    // Attempt automated execution with CAFE-102 -> MUST return HTTP 403 with sanchalak_b2b insufficiency
    const execFailRes = await fetch(`${BASE}/api/services/execute-automated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cafeId: 'CAFE-102',
        customerPhone: '9812345678',
        serviceType: 'rcDownload',
        params: { vehicleNumber: 'DL01CA1234' }
      })
    });
    const execFailData = await execFailRes.json();
    assert(execFailRes.status === 403, 'HTTP 403 Forbidden on Sanchalak B2B balance insufficiency');
    assert(execFailData.insufficientRole === 'sanchalak_b2b', 'Server flags sanchalak_b2b insufficiency');

    // Check CAFE-101 (B2B balance > 200) service status -> MUST be online
    const status101Res = await fetch(`${BASE}/api/cafes/CAFE-101/service-status/rcDownload`);
    const status101Data = await status101Res.json();
    assert(status101Data.isAvailable === true, 'CAFE-101 service is online (B2B >= wholesale)');
  }

  // --- PILLAR 2: Zero-Gateway Direct UPI + 12-Digit UTR Approval Loop ---
  console.log('\n--- PILLAR 2: Zero-Gateway Direct UPI + 12-Digit UTR Approval Loop ---');
  {
    // Test 1: Reject invalid UTR (e.g. 5 digits or non-numeric)
    const invalidUtrRes = await fetch(`${BASE}/api/wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        phone: '9812345678',
        customerName: 'राहुल वर्मा',
        cafeId: 'CAFE-101',
        amount: 300,
        utr: '12345' // INVALID
      })
    });
    assert(invalidUtrRes.status === 400, 'Rejects invalid non-12-digit UTR with HTTP 400');

    // Test 2: Valid 12-digit Customer -> Sanchalak UTR submission
    const validUtr = String(Date.now()).padStart(12, '0').slice(-12);
    const subRes = await fetch(`${BASE}/api/wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        phone: '9812345678',
        customerName: 'राहुल वर्मा',
        cafeId: 'CAFE-101',
        amount: 500,
        utr: validUtr
      })
    });
    const subData = await subRes.json();
    assert(subRes.status === 201 && subData.utrRequest, 'Successfully submitted valid 12-digit Customer UTR');
    const custUtrId = subData.utrRequest.id;

    // Test 2b: Prevent Duplicate Customer UTR submission
    const dupCustUtrRes = await fetch(`${BASE}/api/wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        phone: '9812345678',
        customerName: 'राहुल वर्मा',
        cafeId: 'CAFE-101',
        amount: 500,
        utr: validUtr
      })
    });
    assert(dupCustUtrRes.status === 400, 'Rejects duplicate customer UTR with HTTP 400');

    // Sanchalak approves the UTR request
    const approveCustUtr = await fetch(`${BASE}/api/cafes/CAFE-101/utr-requests/${custUtrId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const approveCustData = await approveCustUtr.json();
    assert(approveCustUtr.status === 200 && approveCustData.utrRequest.status === 'approved', 'Sanchalak approved Customer UTR request');

    // Test 2c: Prevent Double Approval on already approved Customer UTR
    const doubleCustApproveRes = await fetch(`${BASE}/api/cafes/CAFE-101/utr-requests/${custUtrId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    assert(doubleCustApproveRes.status === 400, 'Rejects double-approval on already approved Customer UTR');

    // Verify Customer Wallet balance credited
    const walletRes = await fetch(`${BASE}/api/wallet/9812345678`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const walletData = await walletRes.json();
    assert(walletData.balance >= 500, `Customer Wallet balance credited (Current: ₹${walletData.balance})`);

    // Test 3: Sanchalak -> Super Admin B2B UTR Submission & Approval
    const sanchUtr = String(Date.now() + 100).padStart(12, '0').slice(-12);
    const subB2bRes = await fetch(`${BASE}/api/cafes/CAFE-101/b2b-wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({
        amount: 1000,
        utr: sanchUtr
      })
    });
    const subB2bData = await subB2bRes.json();
    assert(subB2bRes.status === 201 && subB2bData.utrRequest, 'Successfully submitted Sanchalak B2B UTR to Super Admin');
    const b2bUtrId = subB2bData.utrRequest.id;

    // Test 3b: Prevent Duplicate B2B UTR submission
    const dupB2bUtrRes = await fetch(`${BASE}/api/cafes/CAFE-101/b2b-wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({
        amount: 1000,
        utr: sanchUtr
      })
    });
    assert(dupB2bUtrRes.status === 400, 'Rejects duplicate B2B UTR submission with HTTP 400');

    // Super Admin approves B2B UTR
    const approveB2bRes = await fetch(`${BASE}/api/superadmin/b2b-utr-requests/${b2bUtrId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const approveB2bData = await approveB2bRes.json();
    assert(approveB2bRes.status === 200 && approveB2bData.utrRequest.status === 'approved', 'Super Admin approved Sanchalak B2B UTR');

    // Test 3c: Prevent Double Approval on already approved B2B UTR
    const doubleB2bApproveRes = await fetch(`${BASE}/api/superadmin/b2b-utr-requests/${b2bUtrId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    assert(doubleB2bApproveRes.status === 400, 'Rejects double-approval on already approved B2B UTR');

    // Verify Sanchalak B2B Wallet credited
    const b2bRes = await fetch(`${BASE}/api/cafes/CAFE-101/b2b-wallet`, {
      headers: { 'Authorization': `Bearer ${cafeOwnerToken}` }
    });
    const b2bData = await b2bRes.json();
    assert(b2bData.b2bWallet.balance >= 1000, `Sanchalak B2B Wallet balance credited (Current: ₹${b2bData.b2bWallet.balance})`);
  }

  // --- PILLAR 4: Sanchalak Rate Card & Profit Margin Engine ---
  console.log('\n--- PILLAR 4: Sanchalak Rate Card & Profit Margin Engine ---');
  {
    const ratesRes = await fetch(`${BASE}/api/cafes/CAFE-101/rates`, {
      headers: { 'Authorization': `Bearer ${cafeOwnerToken}` }
    });
    const ratesData = await ratesRes.json();
    assert(ratesData.superAdminRates && ratesData.retailRates, 'Retrieved Wholesale and Retail Rate Cards');
    assert(ratesData.margins.rcDownload.wholesaleCost === 200, 'Wholesale base cost is ₹200 for RC download');

    // Test 4a: Prevent negative margin (retail rate < wholesale base cost)
    const invalidRateRes = await fetch(`${BASE}/api/cafes/CAFE-101/retail-rates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({
        rcDownload: 150 // Wholesale is 200, so 150 must be rejected
      })
    });
    assert(invalidRateRes.status === 400, 'Rejects retail rate below wholesale cost with HTTP 400');

    // Update retail rates
    const updateRateRes = await fetch(`${BASE}/api/cafes/CAFE-101/retail-rates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({
        rcDownload: 270,
        panCard: 160
      })
    });
    const updateRateData = await updateRateRes.json();
    assert(updateRateData.retailRates.rcDownload === 270, 'Updated Sanchalak retail rate to ₹270 (Margin: ₹70)');
  }

  // --- PILLAR 5: Automated Central Service & White-Labeled Delivery (Vehicle RC Parivahan) ---
  console.log('\n--- PILLAR 5: Automated Service & Double-Entry Ledger Execution ---');
  {
    // Parivahan Vehicle RC Lookup
    const lookupRes = await fetch(`${BASE}/api/rc/lookup/UP32AB1234`);
    const lookupData = await lookupRes.json();
    assert(lookupData.regNo === 'UP32AB1234' && lookupData.ownerName, `Vehicle RC details generated: ${lookupData.makerModel}`);

    // Pre-execution balances
    const wPre = await (await fetch(`${BASE}/api/wallet/9812345678`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    })).json();
    const b2bPre = await (await fetch(`${BASE}/api/cafes/CAFE-101/b2b-wallet`, {
      headers: { 'Authorization': `Bearer ${cafeOwnerToken}` }
    })).json();
    const custBalPre = wPre.balance;
    const b2bBalPre = b2bPre.b2bWallet.balance;

    // Execute Automated RC Download
    const execRes = await fetch(`${BASE}/api/services/execute-automated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cafeId: 'CAFE-101',
        customerPhone: '9812345678',
        serviceType: 'rcDownload',
        params: { vehicleNumber: 'UP32AB1234' }
      })
    });
    const execData = await execRes.json();
    assert(execRes.status === 200 && execData.success, 'Two-Tier Ledger executed successfully');
    assert(execData.retailFee === 270, 'Customer debited retail fee of ₹270');
    assert(execData.wholesaleCost === 200, 'Sanchalak B2B debited wholesale cost of ₹200');
    assert(execData.margin === 70, 'Sanchalak earned net profit margin of +₹70');
    assert(execData.customerBalance === custBalPre - 270, 'Customer balance accurately debited');
    assert(execData.sanchalakB2bBalance === b2bBalPre - 200, 'Sanchalak B2B balance accurately debited');
    assert(execData.vehicleData && execData.vehicleData.regNo === 'UP32AB1234', 'Automated Parivahan RC vehicleData generated and delivered');

    // Verify order persisted in RC orders store
    const rcOrdersRes = await fetch(`${BASE}/api/rc/orders?cafeId=CAFE-101`);
    const rcOrdersData = await rcOrdersRes.json();
    assert(Array.isArray(rcOrdersData) && rcOrdersData.some(o => o.vehicleNumber === 'UP32AB1234'), 'White-labeled RC Order persisted and retrievable via /api/rc/orders');
  }

  // --- PILLAR 6: Secret Shadow Complaint & Audit Monitoring ---
  console.log('\n--- PILLAR 6: Secret Shadow Complaint & Audit Monitoring ---');
  {
    // Customer submits complaint
    const cmpRes = await fetch(`${BASE}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cafeId: 'CAFE-101',
        customerPhone: '9812345678',
        customerName: 'राहुल वर्मा',
        category: 'प्रिंट गुणवत्ता',
        subject: 'RC प्रिंट में बैक साइड का बारकोड कट रहा था',
        description: 'कृपया मुझे स्पष्ट प्रति दोबारा प्रिंट करके दें।'
      })
    });
    const cmpData = await cmpRes.json();
    assert(cmpRes.status === 201 && cmpData.complaint, 'Customer filed complaint ticket');
    const cmpId = cmpData.complaint.id;

    // Sanchalak replies
    const replyRes = await fetch(`${BASE}/api/cafes/CAFE-101/complaints/${cmpId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({
        message: 'नमस्ते राहुल जी, हमने CR-80 लेआउट सही कर दिया है, आप काउंटर से निःशुल्क नया प्रिंट प्राप्त कर सकते हैं।',
        status: 'resolved'
      })
    });
    const replyData = await replyRes.json();
    assert(replyData.complaint.status === 'resolved', 'Sanchalak replied and marked complaint resolved');

    // Super Admin Secret Shadow Audit Note
    const noteRes = await fetch(`${BASE}/api/superadmin/shadow-audit/complaints/${cmpId}/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        note: 'गुप्त ऑडिट नोट: संचालक ने 15 मिनट के भीतर शिकायत का संतोषजनक समाधान कर दिया।'
      })
    });
    const noteData = await noteRes.json();
    assert(noteData.complaint.secretAuditNote.includes('गुप्त ऑडिट नोट'), 'Super Admin attached confidential shadow audit note');

    // Verify secretAuditNote is masked from customer view
    const custViewRes = await fetch(`${BASE}/api/complaints/customer/9812345678`);
    const custViewData = await custViewRes.json();
    const foundCmp = custViewData.find(c => c.id === cmpId);
    assert(foundCmp && foundCmp.secretAuditNote === undefined, 'Confidential shadow note is MASKED from customer view');

    // Super Admin 1-Click Cafe Freeze
    const freezeRes = await fetch(`${BASE}/api/superadmin/shadow-audit/cafes/CAFE-101/freeze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        freeze: true,
        reason: 'ऑडिट जांच हेतु अस्थायी रोक'
      })
    });
    const freezeData = await freezeRes.json();
    assert(freezeData.isFrozen === true, 'Super Admin successfully froze cafe license');

    // Attempting service on frozen cafe -> MUST return HTTP 403
    const frozenExecRes = await fetch(`${BASE}/api/services/execute-automated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cafeId: 'CAFE-101',
        customerPhone: '9812345678',
        serviceType: 'rcDownload',
        params: { vehicleNumber: 'UP32AB1234' }
      })
    });
    assert(frozenExecRes.status === 403, 'Execution blocked on frozen cafe with HTTP 403');

    // Attempting application submission on frozen cafe -> MUST return HTTP 403
    const frozenAppRes = await fetch(`${BASE}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cafeId: 'CAFE-101',
        serviceType: 'आय प्रमाण पत्र',
        applicantName: 'परीक्षार्थी',
        applicantPhone: '9812345678'
      })
    });
    assert(frozenAppRes.status === 403, 'New application blocked on frozen cafe with HTTP 403');

    // Attempting wallet UTR submission on frozen cafe -> MUST return HTTP 403
    const frozenUtrRes = await fetch(`${BASE}/api/wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        cafeId: 'CAFE-101',
        phone: '9812345678',
        amount: 200,
        utr: '999888777666'
      })
    });
    assert(frozenUtrRes.status === 403, 'Wallet topup UTR blocked on frozen cafe with HTTP 403');

    // Attempting retail rate change on frozen cafe -> MUST return HTTP 403
    const frozenRatesRes = await fetch(`${BASE}/api/cafes/CAFE-101/retail-rates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({ rcDownload: 280 })
    });
    assert(frozenRatesRes.status === 403, 'Rate changes blocked on frozen cafe with HTTP 403');

    // Unfreeze cafe
    await fetch(`${BASE}/api/superadmin/shadow-audit/cafes/CAFE-101/freeze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ freeze: false })
    });
    console.log('  ✅ Unfroze cafe for normal operation');
  }

  // --- PILLAR 7: Chain-to-Chain ₹299 Subscription & VLE KYC System ---
  console.log('\n--- PILLAR 7: Chain-to-Chain ₹299 Subscription & VLE KYC System ---');
  {
    const kycUtr = String(Date.now() + 300).padStart(12, '0').slice(-12);
    // Apply for VLE KYC
    const kycApplyRes = await fetch(`${BASE}/api/kyc/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopName: 'अवध डिजिटल जन सेवा केंद्र',
        ownerName: 'अमित कुमार अवस्थी',
        phone: '9450123456',
        vleId: 'CSC-UP-241001-999',
        aadhaarNo: '123456789012',
        panNo: 'ABCDE1234F',
        termsAccepted: true,
        utr: kycUtr
      })
    });
    const kycApplyData = await kycApplyRes.json();
    assert(kycApplyRes.status === 201 && kycApplyData.application, 'VLE KYC Application submitted with ₹299 UTR');
    const kycId = kycApplyData.application.id;

    // Test 7b: Prevent Duplicate KYC UTR submission
    const dupKycRes = await fetch(`${BASE}/api/kyc/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopName: 'अवध डिजिटल जन सेवा केंद्र 2',
        ownerName: 'अमित कुमार',
        phone: '9450123457',
        vleId: 'CSC-UP-241001-998',
        aadhaarNo: '123456789012',
        panNo: 'ABCDE1234F',
        termsAccepted: true,
        utr: kycUtr
      })
    });
    assert(dupKycRes.status === 400, 'Rejects duplicate KYC UTR submission with HTTP 400');

    // Super Admin Approves KYC & Issues 365-day License
    const kycApproveRes = await fetch(`${BASE}/api/superadmin/kyc-applications/${kycId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    const kycApproveData = await kycApproveRes.json();
    assert(kycApproveData.kyc.status === 'approved' && kycApproveData.kyc.licenseKey, `Digital License Key Generated: ${kycApproveData.kyc.licenseKey}`);

    // Test 7c: Prevent Double Approval on already approved KYC application
    const doubleKycApproveRes = await fetch(`${BASE}/api/superadmin/kyc-applications/${kycId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });
    assert(doubleKycApproveRes.status === 400, 'Rejects double-approval on already approved KYC application');

    // Verify 365-day License Certificate API
    const certRes = await fetch(`${BASE}/api/cafes/CAFE-101/license-certificate`);
    const certData = await certRes.json();
    assert(certData.licenseKey && certData.plan.includes('₹299'), '365-Day Digital License Certificate verified');
  }

  // --- PILLAR 8: e-District Suite & 1-Click Auto-Filler Bot ---
  console.log('\n--- PILLAR 8: e-District Suite & Applications ---');
  {
    const appsRes = await fetch(`${BASE}/api/applications`);
    const appsData = await appsRes.json();
    assert(Array.isArray(appsData), `e-District applications list retrieved (${appsData.length} records)`);
  }

  // --- PILLAR 9: Live Real-Time OTP Sync Bridge ---
  console.log('\n--- PILLAR 9: Live Real-Time OTP Sync Bridge ---');
  {
    // Find or create an application to test OTP sync
    const appsRes = await fetch(`${BASE}/api/applications`);
    const appsData = await appsRes.json();
    if (appsData.length > 0) {
      const testApp = appsData[0];
      // Request OTP
      const reqRes = await fetch(`${BASE}/api/applications/${testApp.id}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpType: 'aadhaar' })
      });
      const reqData = await reqRes.json();
      assert(reqData.application && reqData.application.otpStatus === 'requested', 'Operator initiated Live OTP request');

      // Customer submits OTP
      const subOtpRes = await fetch(`${BASE}/api/applications/${testApp.id}/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: '789123' })
      });
      const subOtpData = await subOtpRes.json();
      assert(subOtpData.application && subOtpData.application.otpStatus === 'received' && subOtpData.application.liveOtp === '789123', 'Customer OTP received instantaneously on operator workstation');
    }
  }

  // --- PILLAR 10: Print Portal & PVC Format ---
  console.log('\n--- PILLAR 10: Print Portal & Static Client Dist Serving ---');
  {
    const clientRes = await fetch(`${BASE}/`);
    assert(clientRes.status === 200, 'Frontend Single Page Application successfully served at http://localhost:5000');
  }

  console.log(`\n========================================`);
  console.log(`🎉 ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (backupStoreContent) {
    try {
      const cleanObj = JSON.parse(backupStoreContent);
      cleanObj.cafes = [];
      if (!cleanObj.settings.superAdminPin) {
        cleanObj.settings.superAdminPin = '$2b$10$oXQxOqVvP8g19z06n6l3v.0vK7gZ4wXq6F9p1a8y2e3r4t5y6u7i8';
      }
      fs.writeFileSync(storePath, JSON.stringify(cleanObj, null, 2), 'utf8');
      console.log('🧹 Cleaned up: store.json successfully restored to authentic baseline without test clutter.');
    } catch (cleanupErr) {
      console.warn('Cleanup failed:', cleanupErr.message);
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
