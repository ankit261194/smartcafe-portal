// Targeted verification test for Reviewer audit fixes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE = 'http://localhost:5000';

async function runAuditTests() {
  console.log('🔍 Running Audit Verification Test Suite...\n');
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

  // 1. Verify text strings in client components
  console.log('--- 1. Verification of Required UI Strings ---');
  const clientDir = path.join(__dirname, '..', 'client', 'src', 'components');

  const navbarContent = fs.readFileSync(path.join(clientDir, 'Navbar.jsx'), 'utf8');
  assert(navbarContent.includes('नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)'), 'Navbar contains "नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)"');

  const homeContent = fs.readFileSync(path.join(clientDir, 'CustomerHome.jsx'), 'utf8');
  assert(homeContent.includes('नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)'), 'CustomerHome contains "नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)"');
  assert(homeContent.includes('वर्तमान में कोई कैफे पंजीकृत नहीं है। नए कैफे संचालक ₹299 वार्षिक प्लान से तुरंत जुड़ें।'), 'CustomerHome contains exact clean 0-cafe empty state');
  assert(homeContent.includes('आपके दस्तावेज़ प्रिंट के बाद 24 घंटे में स्वतः नष्ट हो जाते हैं।'), 'CustomerHome contains exact privacy promise');

  const roleModalContent = fs.readFileSync(path.join(clientDir, 'RoleAuthModal.jsx'), 'utf8');
  assert(roleModalContent.includes('नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)'), 'RoleAuthModal contains "नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)"');
  assert(!roleModalContent.includes(`selectedCafe?.code || '101'`), 'RoleAuthModal eliminated hardcoded 101 fallback');

  const quickPrintContent = fs.readFileSync(path.join(clientDir, 'QuickPrint.jsx'), 'utf8');
  assert(quickPrintContent.includes('आपके दस्तावेज़ प्रिंट के बाद 24 घंटे में स्वतः नष्ट हो जाते हैं।'), 'QuickPrint contains exact privacy promise');
  assert(quickPrintContent.includes('अभी फ़ाइल डिलीट करें'), 'QuickPrint mentions 1-click file shredder');

  const printTokenContent = fs.readFileSync(path.join(clientDir, 'PrintTokenModal.jsx'), 'utf8');
  assert(printTokenContent.includes('अभी फ़ाइल डिलीट करें'), 'PrintTokenModal has exact shred button text "अभी फ़ाइल डिलीट करें"');
  assert(printTokenContent.includes('आपके दस्तावेज़ प्रिंट के बाद 24 घंटे में स्वतः नष्ट हो जाते हैं।'), 'PrintTokenModal contains exact privacy promise');

  // 2. Verify UdharRegister component exists and has offline sync
  console.log('\n--- 2. Standalone UdharRegister Component ---');
  const udharPath = path.join(clientDir, 'UdharRegister.jsx');
  assert(fs.existsSync(udharPath), 'UdharRegister.jsx exists');
  const udharContent = fs.readFileSync(udharPath, 'utf8');
  assert(udharContent.includes('offline_udhar_queue'), 'UdharRegister implements offline-first queue (offline_udhar_queue)');
  assert(udharContent.includes('window.addEventListener(\'online\''), 'UdharRegister listens for online event to auto-sync');
  assert(udharContent.includes('https://wa.me/91'), 'UdharRegister has 1-click WhatsApp payment reminder');

  // 3. Verify elimination of hardcoded 101 fallbacks
  console.log('\n--- 3. Clean Baseline and No Hardcoded Fallbacks ---');
  const rcContent = fs.readFileSync(path.join(clientDir, 'VehicleRCDownload.jsx'), 'utf8');
  assert(!rcContent.includes(`selectedCafe?.code || '101'`), 'VehicleRCDownload eliminated hardcoded 101 fallback');

  const complaintsContent = fs.readFileSync(path.join(clientDir, 'AdminComplaints.jsx'), 'utf8');
  assert(!complaintsContent.includes(`selectedCafe?.code || '101'`), 'AdminComplaints eliminated hardcoded 101 fallback');

  const settingsContent = fs.readFileSync(path.join(clientDir, 'AdminSettings.jsx'), 'utf8');
  assert(!settingsContent.includes('VLE-LIC-2026-UP101-ACTIVE'), 'AdminSettings eliminated fake active license fallback');

  // 4. Verify SuperAdmin Auth with Aa@910010025123343
  console.log('\n--- 4. Master Password and Server Baseline ---');
  const saRes = await fetch(`${BASE}/api/auth/superadmin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'Aa@910010025123343' })
  });
  const saData = await saRes.json();
  assert(saRes.status === 200 && saData.token, 'SuperAdmin successfully logs in with Aa@910010025123343');

  const cafesRes = await fetch(`${BASE}/api/cafes`);
  const cafes = await cafesRes.json();
  assert(Array.isArray(cafes) && cafes.length === 0, `Baseline verified: exactly 0 cafes in live server (found: ${cafes.length})`);

  console.log(`\n========================================`);
  console.log(`🎉 AUDIT VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runAuditTests().catch(err => {
  console.error('Audit tests crashed:', err);
  process.exit(1);
});
