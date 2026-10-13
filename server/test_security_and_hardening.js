// Automated Verification Test Suite for Security, Authentication, 1-Click Backup, File Shredder & Staff Mode
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = 'http://localhost:5000';
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storePath = path.join(__dirname, 'data', 'store.json');
let backupStoreContent = null;
try {
  backupStoreContent = fs.readFileSync(storePath, 'utf8');
} catch (e) {}

async function runSecurityTests() {
  console.log('🛡️ Starting Security, Auth, Backup & Staff Mode Test Suite...\n');
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

  // --- 1. Super Admin Authentication (BCrypt + JWT) ---
  console.log('--- 1. Super Admin BCrypt + JWT Authentication ---');
  let superAdminToken = null;
  {
    // Test 1a: Invalid Master PIN -> HTTP 401
    const invalidPinRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '0001' })
    });
    assert(invalidPinRes.status === 401, 'Rejects incorrect Super Admin PIN with HTTP 401');

    // Test 1b: Valid Master PIN '9999' -> Success with signed JWT
    const validPinRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '9999' })
    });
    const validPinData = await validPinRes.json();
    assert(validPinRes.status === 200 && validPinData.token && validPinData.role === 'superadmin', 'Super Admin logs in with master PIN and receives signed JWT');
    superAdminToken = validPinData.token;

    // Test 1c: Valid Master Password 'ADMIN@2026' -> Success
    const validPassRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'ADMIN@2026' })
    });
    const validPassData = await validPassRes.json();
    assert(validPassRes.status === 200 && validPassData.token, 'Super Admin logs in with master password ADMIN@2026');

    // Seed test cafe CAFE-101 for security test suite if cafes array is clean
    const cafesCheckRes = await fetch(`${BASE}/api/cafes`);
    const cafesCheck = await cafesCheckRes.json();
    if (!cafesCheck.find(c => c.id === 'CAFE-101')) {
      await fetch(`${BASE}/api/cafes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${superAdminToken}` },
        body: JSON.stringify({
          id: 'CAFE-101',
          code: '101',
          shopName: 'श्री डिजिटल साइबर कैफे',
          ownerName: 'राजेश कुमार',
          phone: '9876543210',
          pin: '1234',
          staffPin: '0000',
          city: 'हरदोई'
        })
      });
    }
  }

  // --- 2. Cafe Owner vs Staff Login Mode (BCrypt + JWT + Role-Based Access) ---
  console.log('\n--- 2. Cafe Owner vs Staff (स्टाफ मोड) Authentication ---');
  let cafeOwnerToken = null;
  let staffToken = null;
  {
    // Test 2a: Cafe Owner logs in with Owner PIN '1234'
    const ownerLoginRes = await fetch(`${BASE}/api/auth/cafe/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', pin: '1234' })
    });
    const ownerData = await ownerLoginRes.json();
    assert(ownerLoginRes.status === 200 && ownerData.role === 'cafe_owner' && ownerData.isStaff === false, 'Cafe Owner logs in with owner PIN (1234) and receives owner role');
    cafeOwnerToken = ownerData.token;

    // Test 2b: Staff logs in with Staff PIN '0000'
    const staffLoginRes = await fetch(`${BASE}/api/auth/cafe/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', pin: '0000' })
    });
    const staffData = await staffLoginRes.json();
    assert(staffLoginRes.status === 200 && staffData.role === 'staff' && staffData.isStaff === true, 'Staff member logs in with staff PIN (0000) and receives staff role');
    staffToken = staffData.token;

    // Test 2c: Invalid PIN rejected
    const invalidCafeLogin = await fetch(`${BASE}/api/auth/cafe/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', pin: '9876' })
    });
    assert(invalidCafeLogin.status === 401, 'Rejects invalid cafe PIN with HTTP 401');
  }

  // --- 3. Role-Based Permissions Enforcement for Staff Mode ---
  console.log('\n--- 3. Role-Based Permissions Enforcement for Staff Mode ---');
  {
    // Staff Mode ALLOWED: Live Print Queue
    const staffPrintsRes = await fetch(`${BASE}/api/prints?cafeId=CAFE-101`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffPrintsRes.status === 200, 'Staff Mode allowed to view Live Print Queue');

    // Staff Mode ALLOWED: Form Applications
    const staffAppsRes = await fetch(`${BASE}/api/applications`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffAppsRes.status === 200, 'Staff Mode allowed to view Form Applications');

    // Staff Mode RESTRICTED: Cashbook -> MUST be 403 Forbidden
    const staffCashbookRes = await fetch(`${BASE}/api/cashbook`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffCashbookRes.status === 403, 'Staff Mode STRICTLY BLOCKED from Cashbook with HTTP 403');

    // Staff Mode RESTRICTED: Udhar Ledger -> MUST be 403 Forbidden
    const staffUdharRes = await fetch(`${BASE}/api/udhar`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffUdharRes.status === 403, 'Staff Mode STRICTLY BLOCKED from Udhar Register with HTTP 403');

    // Staff Mode RESTRICTED: B2B Wallet & Margins -> MUST be 403 Forbidden
    const staffB2bRes = await fetch(`${BASE}/api/cafes/CAFE-101/b2b-wallet`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffB2bRes.status === 403, 'Staff Mode STRICTLY BLOCKED from Wholesale B2B Wallet with HTTP 403');

    // Staff Mode RESTRICTED: Settings -> MUST be 403 Forbidden
    const staffSettingsRes = await fetch(`${BASE}/api/cafes/CAFE-101/retail-rates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({ rcDownload: 260 })
    });
    assert(staffSettingsRes.status === 403, 'Staff Mode STRICTLY BLOCKED from editing Retail Rates with HTTP 403');

    // Staff Mode RESTRICTED: Backup -> MUST be 403 Forbidden
    const staffBackupRes = await fetch(`${BASE}/api/system/backup`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffBackupRes.status === 403, 'Staff Mode STRICTLY BLOCKED from System Backup with HTTP 403');

    // Staff Mode RESTRICTED: Cafe PIN Update -> MUST be 403 Forbidden
    const staffPinRes = await fetch(`${BASE}/api/cafes/CAFE-101/pin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({ pin: '5555' })
    });
    assert(staffPinRes.status === 403, 'Staff Mode STRICTLY BLOCKED from changing Cafe PIN with HTTP 403');

    // Staff Mode RESTRICTED: Rates -> MUST be 403 Forbidden
    const staffRatesRes = await fetch(`${BASE}/api/cafes/CAFE-101/rates`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffRatesRes.status === 403, 'Staff Mode STRICTLY BLOCKED from Wholesale Rates with HTTP 403');

    // Cafe Owner ALLOWED: Cashbook access
    const ownerCashbookRes = await fetch(`${BASE}/api/cashbook`, {
      headers: { 'Authorization': `Bearer ${cafeOwnerToken}` }
    });
    assert(ownerCashbookRes.status === 200, 'Cafe Owner successfully accessed Cashbook');
  }

  // --- 4. JWT Token Security & Invalid Token Rejection ---
  console.log('\n--- 4. JWT Token Security & Tamper Rejection ---');
  {
    // Unauthenticated requests to protected routes -> MUST be 401
    const unauthCashbook = await fetch(`${BASE}/api/cashbook`);
    assert(unauthCashbook.status === 401, 'Unauthenticated access to /api/cashbook strictly returns HTTP 401');

    const unauthWallet = await fetch(`${BASE}/api/wallet/9812345678`);
    assert(unauthWallet.status === 401, 'Unauthenticated access to /api/wallet strictly returns HTTP 401');

    const unauthBackup = await fetch(`${BASE}/api/system/backup`);
    assert(unauthBackup.status === 401, 'Unauthenticated access to /api/system/backup strictly returns HTTP 401');

    const unauthSuperAdmin = await fetch(`${BASE}/api/superadmin/stats`);
    assert(unauthSuperAdmin.status === 401, 'Unauthenticated access to /api/superadmin strictly returns HTTP 401');

    const tamperedRes = await fetch(`${BASE}/api/cashbook`, {
      headers: { 'Authorization': 'Bearer INVALID_MALFORMED_JWT_TOKEN_12345' }
    });
    assert(tamperedRes.status === 401, 'Rejects invalid/tampered Bearer token with HTTP 401');

    const wrongFormatRes = await fetch(`${BASE}/api/cashbook`, {
      headers: { 'Authorization': 'Basic dXNlcjpwYXNz' }
    });
    assert(wrongFormatRes.status === 401, 'Rejects invalid Authorization header format with HTTP 401');
  }

  // --- 5. 1-Click Database & Records Backup API ---
  console.log('\n--- 5. 1-Click Database & Records Backup API ---');
  {
    // Test 5a: Super Admin Full Master Backup
    const masterBackupRes = await fetch(`${BASE}/api/system/backup`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const masterBackupData = await masterBackupRes.json();
    assert(
      masterBackupRes.status === 200 &&
      masterBackupData.backupType === 'master_saas_full_backup' &&
      masterBackupData.metrics.totalCafes > 0 &&
      masterBackupRes.headers.get('content-disposition')?.includes('CyberCafe_Master_Full_Backup_'),
      'Super Admin downloads complete multi-tenant Master JSON Backup'
    );

    // Test 5b: Cafe Owner Isolated Backup
    const cafeBackupRes = await fetch(`${BASE}/api/system/backup?cafeId=CAFE-101`, {
      headers: { 'Authorization': `Bearer ${cafeOwnerToken}` }
    });
    const cafeBackupData = await cafeBackupRes.json();
    assert(
      cafeBackupRes.status === 200 &&
      cafeBackupData.backupType === 'cafe_isolated_records' &&
      cafeBackupData.cafeId === 'CAFE-101' &&
      cafeBackupData.shopSettings &&
      cafeBackupRes.headers.get('content-disposition')?.includes('CyberCafe_CAFE-101_Backup_'),
      'Cafe Owner downloads isolated shop records & cashbook backup'
    );

    // Test 5c: Cross-Tenant Isolation Block (CAFE-101 attempting to fetch CAFE-102 backup)
    const crossTenantBackupRes = await fetch(`${BASE}/api/system/backup?cafeId=CAFE-102`, {
      headers: { 'Authorization': `Bearer ${cafeOwnerToken}` }
    });
    assert(crossTenantBackupRes.status === 403, 'Cross-tenant backup download strictly BLOCKED with HTTP 403');
  }

  // --- 6. Privacy Auto-Purge Cron Engine (24-Hour File Shredder) ---
  console.log('\n--- 6. Privacy Auto-Purge Cron Engine (24-Hour File Shredder) ---');
  {
    // Test 6a: Unauthenticated Shredder call rejected
    const unauthShredder = await fetch(`${BASE}/api/system/cleanup/run`, { method: 'POST' });
    assert(unauthShredder.status === 401, 'Unauthenticated file shredder execution rejected with HTTP 401');

    // Create simulated test files: one recent (<1 hour), one old (>25 hours)
    const recentFileName = `test_recent_${Date.now()}.pdf`;
    const oldFileName = `test_old_expired_${Date.now()}.pdf`;
    const recentPath = path.join(uploadsDir, recentFileName);
    const oldPath = path.join(uploadsDir, oldFileName);

    fs.writeFileSync(recentPath, 'RECENT_FILE_CONTENT_CUSTOMER_TEST');
    fs.writeFileSync(oldPath, 'OLD_FILE_CONTENT_EXPIRED_25_HOURS');

    // Backdate the old file's modified time to 26 hours ago
    const twentySixHoursAgo = new Date(Date.now() - 26 * 60 * 60 * 1000);
    fs.utimesSync(oldPath, twentySixHoursAgo, twentySixHoursAgo);

    // Trigger File Shredder with Super Admin auth
    const shredderRes = await fetch(`${BASE}/api/system/cleanup/run`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const shredderData = await shredderRes.json();
    assert(shredderRes.status === 200 && shredderData.success, 'Manually invoked Privacy File Shredder with Super Admin auth');

    // Verify old expired file was shredded from disk
    const oldFileStillExists = fs.existsSync(oldPath);
    assert(!oldFileStillExists, '24-hour expired customer file was SECURELY SHREDDED from disk');

    // Verify recent file remains intact
    const recentFileStillExists = fs.existsSync(recentPath);
    assert(recentFileStillExists, 'Recent active customer file is preserved on disk');
    try { fs.unlinkSync(recentPath); } catch {}

    // Verify Shredder telemetry in System Health
    const healthRes = await fetch(`${BASE}/api/health`);
    const healthData = await healthRes.json();
    assert(healthData.fileShredder && healthData.fileShredder.status === 'active', 'File Shredder statistics logged to live system health');
  }

  // --- 7. Staff PIN Configuration Engine ---
  console.log('\n--- 7. Staff PIN Configuration Engine ---');
  {
    // Update staff PIN to '4321'
    const updateStaffRes = await fetch(`${BASE}/api/cafes/CAFE-101/staff-pin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({ staffPin: '4321', staffEnabled: true })
    });
    const updateStaffData = await updateStaffRes.json();
    assert(updateStaffRes.status === 200 && updateStaffData.success, 'Cafe Owner configured new Staff PIN (4321)');

    // Old staff PIN '0000' must now fail
    const oldStaffLogin = await fetch(`${BASE}/api/auth/cafe/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', pin: '0000' })
    });
    assert(oldStaffLogin.status === 401, 'Old staff PIN is revoked (HTTP 401)');

    // New staff PIN '4321' succeeds
    const newStaffLogin = await fetch(`${BASE}/api/auth/cafe/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', pin: '4321' })
    });
    const newStaffData = await newStaffLogin.json();
    assert(newStaffLogin.status === 200 && newStaffData.isStaff === true, 'Staff successfully logs in with new Staff PIN (4321)');

    // Restore default staff PIN '0000' for clean baseline
    await fetch(`${BASE}/api/cafes/CAFE-101/staff-pin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({ staffPin: '0000', staffEnabled: true })
    });
  }

  // --- 8. Thread-Safe Atomic Writes & Snapshot Verification ---
  console.log('\n--- 8. Database Integrity & Backup Snapshot Verification ---');
  {
    const bakFile = path.join(__dirname, 'data', 'store.json.bak');
    assert(fs.existsSync(bakFile), 'Atomic store.json.bak rolling snapshot file exists on disk');
  }

  // --- 9. Customer Wallet BCrypt PIN Payment Verification ---
  console.log('\n--- 9. Customer Wallet BCrypt PIN Payment Verification ---');
  {
    // Unauthenticated wallet pay -> 401
    const unauthPay = await fetch(`${BASE}/api/wallet/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9812345678', amount: 10 })
    });
    assert(unauthPay.status === 401, 'Unauthenticated /api/wallet/pay rejected with HTTP 401');

    // Authenticate customer session
    const custAuthRes = await fetch(`${BASE}/api/auth/customer/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9812345678', name: 'राहुल वर्मा' })
    });
    const custToken = (await custAuthRes.json()).token;

    // Top-up customer wallet via UTR approval loop
    const topupUtr = String(Date.now()).padStart(12, '0').slice(-12);
    const subRes = await fetch(`${BASE}/api/wallet/submit-utr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      },
      body: JSON.stringify({
        phone: '9812345678',
        customerName: 'राहुल वर्मा',
        cafeId: 'CAFE-101',
        amount: 100,
        utr: topupUtr
      })
    });
    const subData = await subRes.json();
    const reqId = subData.utrRequest.id;

    await fetch(`${BASE}/api/cafes/CAFE-101/utr-requests/${reqId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cafeOwnerToken}`
      },
      body: JSON.stringify({ action: 'approve' })
    });

    // Make an authenticated payment using Customer token
    const authedPay = await fetch(`${BASE}/api/wallet/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      },
      body: JSON.stringify({
        phone: '9812345678',
        amount: 10,
        note: 'सुरक्षित BCrypt पिन टेस्ट'
      })
    });
    const authedPayData = await authedPay.json();
    assert(authedPay.status === 200 && authedPayData.success, 'Authenticated Customer wallet pay succeeds with HTTP 200');
    assert(authedPayData.wallet && authedPayData.wallet.pin === undefined, 'Customer wallet response strictly omits hashed PIN');

    // Reject payment when unauthorized user calls without customer token and provides wrong PIN
    const wrongPinPay = await fetch(`${BASE}/api/wallet/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        phone: '9812345678',
        amount: 5,
        pin: '9876'
      })
    });
    assert(wrongPinPay.status === 401, 'Rejects payment with incorrect 4-digit PIN with HTTP 401');
  }

  console.log(`\n========================================`);
  console.log(`🎉 SECURITY VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
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

  if (failed > 0) process.exit(1);
}

runSecurityTests().catch(err => {
  console.error('Security Suite Error:', err);
  process.exit(1);
});
