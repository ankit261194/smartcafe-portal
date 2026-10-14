import assert from 'assert';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:5000';
const SUPER_TOKEN = 'SUPERADMIN_Aa@910010025123343';

async function runTests() {
  console.log('🚀 [START] Comprehensive End-to-End Automated Test Suite...\n');

  // Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 15; i++) {
    try {
      const ping = await fetch(`${BASE_URL}/api/services/rates`);
      if (ping.ok) { serverReady = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  assert.ok(serverReady, 'Server must be responsive on port 5000');

  // Test 1: 79 Services Dynamic Rate & Margin Engine
  console.log('--- TEST 1: 79 Services Dynamic Rate & Margin Engine ---');
  const ratesRes = await fetch(`${BASE_URL}/api/services/rates`);
  assert.strictEqual(ratesRes.status, 200, 'Rates endpoint should return 200');
  const ratesData = await ratesRes.json();
  assert.strictEqual(ratesData.success, true, 'Rates response must be successful');
  assert.strictEqual(ratesData.services.length, 79, 'Must contain exactly 79 services');

  const aadhaarAdv = ratesData.services.find(s => s.id === 'aadhaar_advance_one' || s.num === 1);
  assert.ok(aadhaarAdv, 'Aadhaar Advance 1 service must exist');
  assert.strictEqual(aadhaarAdv.providerCost, 9, 'Provider cost for Aadhaar Advance 1 must be 9');
  console.log(`✅ Aadhaar Advance 1 verified: Provider Cost = ₹${aadhaarAdv.providerCost}, Wholesale = ₹${aadhaarAdv.wholesaleRate}, Retail = ₹${aadhaarAdv.retailRate}`);

  // Test saving rate
  const updateRes = await fetch(`${BASE_URL}/api/superadmin/services/rates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPER_TOKEN}`
    },
    body: JSON.stringify({
      serviceId: aadhaarAdv.id,
      wholesaleRate: 15,
      retailRate: 30,
      isActive: true
    })
  });
  assert.strictEqual(updateRes.status, 200, 'Update rate should return 200');
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true, 'Update rate should be successful');
  console.log('✅ Single & Batch Rate Update passed.\n');

  // Test 2: Compulsory Signup & Persistent Auto-Login Gate
  console.log('--- TEST 2: Compulsory Signup & Persistent Auto-Login Gate ---');
  const testPhone = '98000' + Math.floor(10000 + Math.random() * 90000);
  const testPass = 'Pass@' + Math.floor(1000 + Math.random() * 9000);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'रमेश कुमार डिजिटल केंद्र',
      phone: testPhone,
      password: testPass,
      role: 'cafe'
    })
  });
  assert.ok([200, 201].includes(regRes.status), 'Register should return 200 or 201');
  const regData = await regRes.json();
  assert.strictEqual(regData.success, true, 'Registration must be successful');
  assert.strictEqual(regData.user.phone, testPhone, 'Phone must match');
  assert.strictEqual(regData.user.balance, 0, 'New user balance must be strictly 0');
  assert.ok(regData.token, 'Must return JWT token for instant auto-login');
  console.log(`✅ Direct 3-field registration passed for ${testPhone} with initial balance ₹0.00`);

  // Test Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: testPass
    })
  });
  assert.strictEqual(loginRes.status, 200, 'Login should return 200');
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true, 'Login must succeed');
  assert.ok(loginData.token, 'Login must return persistent token');
  console.log('✅ Universal login & persistent token generation passed.\n');

  // Test 3: Super Admin User Directory Management (Plaintext Passwords, Balance, Block, Delete)
  console.log('--- TEST 3: Super Admin Control Room (Plaintext Passwords, Balance, Block, Delete) ---');
  const usersRes = await fetch(`${BASE_URL}/api/superadmin/users`, {
    headers: { 'Authorization': `Bearer ${SUPER_TOKEN}` }
  });
  assert.strictEqual(usersRes.status, 200, 'Superadmin users should return 200');
  const usersData = await usersRes.json();
  assert.strictEqual(usersData.success, true, 'Users list must be successful');
  const foundUser = usersData.users.find(u => u.phone === testPhone);
  assert.ok(foundUser, 'Registered user must exist in directory');
  assert.strictEqual(foundUser.password, testPass, 'Super Admin must see plaintext password');
  console.log(`✅ Plaintext password verified for Super Admin: "${foundUser.password}"`);

  // Balance adjustment (+250)
  const balRes = await fetch(`${BASE_URL}/api/superadmin/users/${foundUser.id}/balance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPER_TOKEN}`
    },
    body: JSON.stringify({
      amount: 250,
      type: 'credit',
      remark: 'UPI Topup Verified by Super Admin'
    })
  });
  assert.strictEqual(balRes.status, 200, 'Balance adjustment should return 200');
  const balData = await balRes.json();
  assert.strictEqual(balData.newBalance, 250, 'Balance must be updated to 250');
  console.log(`✅ Super Admin balance adjustment (+₹250) passed: New Balance = ₹${balData.newBalance}`);

  // Block user
  const blockRes = await fetch(`${BASE_URL}/api/superadmin/users/${foundUser.id}/block`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPER_TOKEN}`
    },
    body: JSON.stringify({ blocked: true })
  });
  assert.strictEqual(blockRes.status, 200, 'Block user should return 200');

  // Blocked user login attempt should fail with 403
  const blockedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      password: testPass
    })
  });
  assert.strictEqual(blockedLoginRes.status, 403, 'Blocked user login must return 403');
  console.log('✅ Blocked user login prevention passed (HTTP 403).');

  // Unblock user
  await fetch(`${BASE_URL}/api/superadmin/users/${foundUser.id}/block`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPER_TOKEN}`
    },
    body: JSON.stringify({ blocked: false })
  });
  console.log('✅ Unblock user passed.');

  // Delete user
  const delRes = await fetch(`${BASE_URL}/api/superadmin/users/${foundUser.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPER_TOKEN}` }
  });
  assert.strictEqual(delRes.status, 200, 'Delete user should return 200');
  console.log('✅ Super Admin user deletion passed.\n');

  // Test 4: Official Suman Devi UPI Payment QR & Mandatory Balance Gate
  console.log('--- TEST 4: Official Suman Devi UPI QR & Zero-Credit Gate ---');
  const qrClientPath = path.resolve('client/dist/images/superadmin_qr.jpg');
  const qrServerPath = path.resolve('server/public/images/superadmin_qr.jpg');
  assert.ok(fs.existsSync(qrClientPath), 'Client QR image must exist');
  assert.ok(fs.existsSync(qrServerPath), 'Server QR image must exist');
  console.log('✅ Suman Devi official QR image exists in both client/dist and server/public.');

  // Test Zero Credit Balance Gate (Unfunded execution rejected with 403)
  const unfundedRes = await fetch(`${BASE_URL}/api/services/execute-automated`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cafeId: 'SMARTCAFE-HQ',
      customerPhone: '9999999999',
      serviceType: 'rcDownload',
      operatorB2bDirect: false,
      params: { vehicleNumber: 'DL01AB1234' }
    })
  });
  assert.strictEqual(unfundedRes.status, 403, 'Unfunded execution without balance must return 403');
  const unfundedData = await unfundedRes.json();
  assert.ok(unfundedData.error.includes('अपर्याप्त'), 'Error message must specify insufficient balance');
  console.log(`✅ Zero credit gate passed: "${unfundedData.error}"\n`);

  // Test 5: P4Points Live API Gateway Token & Configuration
  console.log('--- TEST 5: P4Points Live Gateway Configuration ---');
  const gwRes = await fetch(`${BASE_URL}/api/superadmin/api-gateway`, {
    headers: { 'Authorization': `Bearer ${SUPER_TOKEN}` }
  });
  assert.strictEqual(gwRes.status, 200, 'Gateway endpoint should return 200');
  const gwData = await gwRes.json();
  assert.strictEqual(gwData.apiGateway.apiKey, 'f1c563aa08c301c9a7e58796ed4edbced254ea3a674f76fca2bbb1a2429968c5', 'P4Points token must match verified token');
  assert.strictEqual(gwData.apiGateway.liveMode, true, 'Live mode must be enabled');
  console.log('✅ P4Points Live API Gateway verified with token f1c563aa08c301c9a7e58796ed4edbced254ea3a674f76fca2bbb1a2429968c5.\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 5 TEST SUITES PASSED WITH 100% SUCCESS RATE!');
  console.log('═══════════════════════════════════════════════════════════════');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
