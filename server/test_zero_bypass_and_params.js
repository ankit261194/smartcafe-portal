import assert from 'assert';
import fs from 'fs';

console.log('--- TEST 1: Check users_master.json & store.json integrity ---');
const storePath = 'client/public/api/data/store.json';
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const user8006 = store.wallets.find(w => w.phone === '8006518960');
assert(user8006, 'User 8006518960 wallet must exist');
assert(user8006.balance === 10, `User 8006518960 balance must strictly be 10 (got ${user8006.balance})`);
console.log('✅ PASS: User 8006518960 balance is strictly ₹10');

const usersMasterPath = 'client/public/api/data/users_master.json';
const usersMaster = JSON.parse(fs.readFileSync(usersMasterPath, 'utf8'));
const masterUser = usersMaster.find(u => u.phone === '8006518960');
assert(masterUser, 'User 8006518960 exists in users_master');
assert(masterUser.balance === 10, `User 8006518960 balance in users_master is 10 (got ${masterUser.balance})`);
console.log('✅ PASS: users_master.json integrity confirmed');

console.log('\n--- TEST 2: Inspect ServicePage.jsx for Honest Badges & Zero Bypass ---');
const servicePageContent = fs.readFileSync('client/src/components/ServicePage.jsx', 'utf8');

// Check that isTrialPreview logic is removed from ServicePage
assert(!servicePageContent.includes('const isTrialPreview = !isFreeService'), 'isTrialPreview definition should be removed');
assert(!servicePageContent.includes('previewMode: isTrialPreview'), 'previewMode: isTrialPreview should be removed');

// Check 403 handling does NOT call executeDirectLookupFallback
assert(servicePageContent.includes('if (res.status === 403)'), 'Must have 403 check');
assert(!servicePageContent.match(/if\s*\(res\.status\s*===\s*403\)\s*\{\s*await executeDirectLookupFallback/), '403 must not call executeDirectLookupFallback');

// Check fallback in else & catch does NOT fall back for paid services
assert(servicePageContent.includes('if (isFreeService) {\n          await executeDirectLookupFallback(val);'), 'Only free service falls back on non-200');

// Check Honest Badges
assert(servicePageContent.includes('⏱️ मैन्युअल रिले (1-2 घंटे)'), 'Manual relay badge present');
assert(servicePageContent.includes('🟢 लाइव सरकारी API'), 'Live government API badge present');
assert(servicePageContent.includes('🖨️ CR-80 PVC स्मार्ट कार्ड'), 'CR-80 PVC smart card badge present');
assert(servicePageContent.includes('⏱️ 1-2 घंटे रिले'), 'Speed badge: 1-2 hours relay present');
assert(servicePageContent.includes('🖨️ त्वरित कार्ड प्रिंट'), 'Speed badge: instant card print present');
assert(servicePageContent.includes('⚡ 0.5s लाइव'), 'Speed badge: 0.5s live present');

console.log('✅ PASS: ServicePage.jsx badges and zero-bypass handlers verified');

console.log('\n--- TEST 3: Inspect ServicePage.jsx Parameter Packing ---');
// Verify ll_exam_pass_auto packing
assert(servicePageContent.includes('tid === \'ll_exam_pass_auto\''), 'Must have ll_exam_pass_auto check');
assert(servicePageContent.includes('params.password = secondaryInput.trim()'), 'll_exam_pass_auto must set password');
assert(servicePageContent.includes('params.examPin = thirdInput.trim()'), 'll_exam_pass_auto must set examPin');
assert(servicePageContent.includes('params.examsecretpin = thirdInput.trim()'), 'll_exam_pass_auto must set examsecretpin');
assert(servicePageContent.includes('params.state = selectState || \'UP\''), 'll_exam_pass_auto must set state');

// Verify pan_find does not set panNo
assert(servicePageContent.includes('delete params.panNo'), 'pan_find must delete panNo');

// Verify ration_pdf_by_aadhar does not set rationNo
assert(servicePageContent.includes('delete params.rationNo'), 'ration_pdf_by_aadhar must delete rationNo');
assert(servicePageContent.includes('params.rationtype = \'new\''), 'ration_pdf_by_aadhar must set rationtype');

// Verify other services
assert(servicePageContent.includes('tid === \'ll_find\' || tid === \'ll_pdf\''), 'll_find/ll_pdf mapped');
assert(servicePageContent.includes('tid === \'dl_to_mobile_find\''), 'dl_to_mobile_find mapped');
assert(servicePageContent.includes('tid === \'pan_to_aadhar_find\''), 'pan_to_aadhar_find mapped');
assert(servicePageContent.includes('tid === \'pan_aadhaar_link_manual\''), 'pan_aadhaar_link_manual mapped');
assert(servicePageContent.includes('up_ration_to_aadhaar'), 'up_ration_to_aadhaar mapped');
assert(servicePageContent.includes('rtps_bihar_pdf'), 'rtps_bihar_pdf mapped');
assert(servicePageContent.includes('tid === \'nsdl_bank\''), 'nsdl_bank mapped');
assert(servicePageContent.includes('tid === \'telegram_to_number_lookup\''), 'telegram_to_number_lookup mapped');
assert(servicePageContent.includes('tid === \'gmail_to_details\''), 'gmail_to_details mapped');

console.log('✅ PASS: All 13 parameter mappings verified in ServicePage.jsx');

console.log('\n--- TEST 4: Inspect index.php & server.js for Zero Bypass ---');
const indexPhpContent = fs.readFileSync('client/public/api/index.php', 'utf8');
assert(!indexPhpContent.includes('$isTrial = $previewMode;'), 'index.php must not have $isTrial = $previewMode;');
assert(indexPhpContent.includes('http_response_code(403);'), 'index.php must return 403 on low balance');

const serverJsContent = fs.readFileSync('server/server.js', 'utf8');
assert(!serverJsContent.includes('let isTrial = isOtherCategory ? false : Boolean(previewMode);'), 'server.js must not have isTrial previewMode bypass');
assert(serverJsContent.includes('return res.status(403).json('), 'server.js must return 403 on low balance');

console.log('✅ PASS: index.php and server.js zero-bypass code verified');
console.log('\n🎉 ALL LOCAL STATIC & INTEGRATION CHECKS PASSED PERFECTLY!');
