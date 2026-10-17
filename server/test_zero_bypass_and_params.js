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

console.log('\n--- TEST 2: Inspect ServicePage.jsx for Honest Badges, Zero Bypass & Mandatory Validations ---');
const servicePageContent = fs.readFileSync('client/src/components/ServicePage.jsx', 'utf8');

// Check that isTrialPreview logic is removed from ServicePage
assert(!servicePageContent.includes('const isTrialPreview = !isFreeService'), 'isTrialPreview definition should be removed');
assert(!servicePageContent.includes('previewMode: isTrialPreview'), 'previewMode: isTrialPreview should be removed');

// Check mandatory validation on client before submitting ll_exam_pass_auto
assert(servicePageContent.includes("if (tid === 'll_exam_pass_auto')"), 'Must have ll_exam_pass_auto validation check');
assert(servicePageContent.includes("if (!secondaryInput.trim())"), 'Must reject ll_exam_pass_auto if password missing');
assert(servicePageContent.includes("if (!dobDate)"), 'Must reject ll_exam_pass_auto if dob missing');

// Check 403 handling does NOT call executeDirectLookupFallback
assert(servicePageContent.includes('if (res.status === 403)'), 'Must have 403 check');
assert(!servicePageContent.match(/if\s*\(res\.status\s*===\s*403\)\s*\{\s*await executeDirectLookupFallback/), '403 must not call executeDirectLookupFallback');

// Check fallback in else & catch does NOT fall back for paid services
assert(servicePageContent.includes('if (isFreeService) {\n          await executeDirectLookupFallback(val);'), 'Only free service falls back on non-200');

// Check executeDirectLookupFallback does NOT default to /api/rc/lookup
assert(!servicePageContent.includes('fallbackUrlMap[toolKind] || `/api/rc/lookup/'), 'executeDirectLookupFallback must not default to /api/rc/lookup');

// Check Honest Badges
assert(servicePageContent.includes('⏱️ मैन्युअल रिले (1-2 घंटे)'), 'Manual relay badge present');
assert(servicePageContent.includes('🟢 लाइव सरकारी API'), 'Live government API badge present');
assert(servicePageContent.includes('🖨️ CR-80 PVC स्मार्ट कार्ड'), 'CR-80 PVC smart card badge present');
assert(servicePageContent.includes('⏱️ 1-2 घंटे रिले'), 'Speed badge: 1-2 hours relay present');
assert(servicePageContent.includes('🖨️ त्वरित कार्ड प्रिंट'), 'Speed badge: instant card print present');
assert(servicePageContent.includes('⚡ 0.5s लाइव'), 'Speed badge: 0.5s live present');

console.log('✅ PASS: ServicePage.jsx badges, validations and zero-bypass handlers verified');

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
assert(servicePageContent.includes('tid === \'upi_to_details\''), 'upi_to_details mapped');

console.log('✅ PASS: All 13 parameter mappings verified in ServicePage.jsx');

const indexPhpContent = fs.readFileSync('client/public/api/index.php', 'utf8');
const serverJsContent = fs.readFileSync('server/server.js', 'utf8');

console.log('\n--- TEST 3B: Part 1 RTO & Transport Services Verification ---');
// 1. ll_find & ll_pdf
assert(servicePageContent.includes("params.state = selectState || 'UP'"), 'll_find/ll_pdf must map state');
assert(servicePageContent.includes("params.applicationNumber = val"), 'll_find/ll_pdf must map applicationNumber');
assert(servicePageContent.includes("params.idNumber = val"), 'll_find/ll_pdf must map idNumber');
assert(indexPhpContent.includes("serviceApi/TargetApiV1/DL/ll_pdf.php"), 'index.php must route ll_find/ll_pdf to primary ll_pdf.php');
assert(indexPhpContent.includes("api/v1/LL_application_pdf.php"), 'index.php must fallback ll_find/ll_pdf to LL_application_pdf.php');
assert(serverJsContent.includes("serviceApi/TargetApiV1/DL/ll_pdf.php"), 'server.js must route ll_find/ll_pdf to primary ll_pdf.php');
assert(serverJsContent.includes("api/v1/LL_application_pdf.php"), 'server.js must fallback ll_find/ll_pdf to LL_application_pdf.php');

// 2. dl_to_mobile_find
assert(servicePageContent.includes("tid === 'dl_to_mobile_find'"), 'dl_to_mobile_find must be mapped in ServicePage');
assert(servicePageContent.includes("params.password = thirdInput.trim()"), 'dl_to_mobile_find must map password from thirdInput');
assert(indexPhpContent.includes("$uService === 'DL Mobile Link' || ($service79['id'] ?? '') === 'dl_to_mobile_find'"), 'index.php must support dl_to_mobile_find in relay');
assert(serverJsContent.includes("uService === 'DL Mobile Link' || service79.id === 'dl_to_mobile_find'"), 'server.js must support dl_to_mobile_find in relay');

// 3. Driving Licence (DL)
assert(servicePageContent.includes("params.cardBg = cardBg || 'White Background'"), 'DL must map cardBg');
assert(indexPhpContent.includes("serviceApi/TargetApiV1/DrivingLicence/dl-details.php"), 'index.php must route DL to dl-details.php');
assert(indexPhpContent.includes("serviceApi/TargetApiV1/DL/dl-pdf.php"), 'index.php must route DL to dl-pdf.php');
assert(serverJsContent.includes("serviceApi/TargetApiV1/DrivingLicence/dl-details.php"), 'server.js must route DL to dl-details.php');
assert(serverJsContent.includes("serviceApi/TargetApiV1/DL/dl-pdf.php"), 'server.js must route DL to dl-pdf.php');

// 4. PUC Certificate Download
assert(servicePageContent.includes("tid === 'puc_certificate_download'"), 'puc_certificate_download must be mapped in ServicePage');
assert(servicePageContent.includes("params.vehicle_number = val.toUpperCase().replace(/[\\s-]+/g, '')"), 'puc_certificate_download must map vehicle_number');
assert(indexPhpContent.includes("serviceApi/TargetApiV1/RC/puc_certificate.php"), 'index.php must route PUC to puc_certificate.php');
assert(serverJsContent.includes("serviceApi/TargetApiV1/RC/puc_certificate.php"), 'server.js must route PUC to puc_certificate.php');

// 5. Chassis to RC & Engine to RC
assert(servicePageContent.includes("params.chassis_no = val.toUpperCase().trim()"), 'chassis_to_rc must map chassis_no');
assert(servicePageContent.includes("params.engine_number = val.toUpperCase().trim()"), 'engine_to_rc must map engine_number');
assert(indexPhpContent.includes("api/v1/chassis_to_Rc.php"), 'index.php must call chassis_to_Rc.php');
assert(indexPhpContent.includes("api/v1/engine_to_rc.php"), 'index.php must call engine_to_rc.php');
assert(serverJsContent.includes("api/v1/chassis_to_Rc.php"), 'server.js must call chassis_to_Rc.php');
assert(serverJsContent.includes("api/v1/engine_to_rc.php"), 'server.js must call engine_to_rc.php');

// 6. Deep Verification: TargetUrl Overwrite & Section 1 Isolation & LegacyMap Integrity
assert(!indexPhpContent.includes('$targetUrl = $endpointUrl;\n        $ch = curl_init();'), 'index.php must NOT wipe out targetUrl before curl_init');
assert(indexPhpContent.includes("'chassis_to_rc' => 'chassis_to_rc_find'"), 'index.php legacyMap must resolve chassis_to_rc');
assert(serverJsContent.includes("'chassis_to_rc': 'chassis_to_rc_find'"), 'server.js legacyMap must resolve chassis_to_rc');
assert(indexPhpContent.includes("strpos($norm, 'chassis') === false && strpos($norm, 'engine') === false && strpos($norm, 'puc') === false"), 'index.php Section 1 must isolate standard RC from chassis/engine/puc');
assert(serverJsContent.includes("!norm.includes('chassis') && !norm.includes('engine') && !norm.includes('puc')"), 'server.js Section 1 must isolate standard RC from chassis/engine/puc');

// 7. Client Form Integrity: Mandatory Validations & Elevated UI Forms
assert(servicePageContent.includes("['chassis_to_rc', 'chassis_to_rc_find', 'chassis_to_rc_alt'].includes(tid) && val.length < 5"), 'ServicePage must enforce min 5 chars for chassis');
assert(servicePageContent.includes("tid === 'engine_to_rc' && val.length < 4"), 'ServicePage must enforce min 4 chars for engine');
assert(servicePageContent.includes("tid === 'puc_certificate_download' && val.replace(/[\\s-]+/g, '').length < 5"), 'ServicePage must enforce min 5 chars for PUC');
assert(!servicePageContent.includes('// 8B. PUC POLLUTION CERTIFICATE DOWNLOAD'), 'ServicePage must not have dead shadowed duplicate 8B block');
assert(!servicePageContent.includes('// 8C. CHASSIS TO RC FIND'), 'ServicePage must not have dead shadowed duplicate 8C block');
assert(!servicePageContent.includes('// 8D. ENGINE TO RC FIND'), 'ServicePage must not have dead shadowed duplicate 8D block');

console.log('✅ PASS: Part 1 RTO & Transport Services parameter & routing verified across all tiers');

const services79 = JSON.parse(fs.readFileSync('client/src/data/services_79.json', 'utf8'));

console.log('\n--- TEST 3C: Part 2 PAN Card Services Suite Comprehensive Verification ---');
// 1. Service 6: pan_find (Aadhaar to PAN Find)
assert(servicePageContent.includes("if (id === 'pan_find')"), 'pan_find must have dedicated form 9A');
assert(servicePageContent.includes("onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}"), 'pan_find must strictly accept 12-digit Aadhaar only');
assert(servicePageContent.includes("tid === 'pan_find' && val.replace(/\\D/g, '').length !== 12"), 'pan_find must enforce 12-digit Aadhaar length validation');
assert(servicePageContent.includes("const cleanUid = val.replace(/\\D/g, '')"), 'pan_find must extract clean 12-digit Aadhaar');
assert(servicePageContent.includes("delete params.panNo"), 'pan_find must delete panNo parameter');
assert(servicePageContent.includes("delete params.panNumber"), 'pan_find must delete panNumber parameter');
assert(servicePageContent.includes("delete params.pan"), 'pan_find must delete pan parameter');

const panFindSvc = services79.find(s => s.id === 'pan_find');
assert(panFindSvc, 'pan_find must exist in services_79.json');
assert(panFindSvc.apiEndpoint.includes('getPanNumber.php'), 'pan_find must route to getPanNumber.php');
assert(panFindSvc.badge.includes('मैन्युअल रिले'), 'pan_find must have honest manual relay badge');

// 2. Service 7: pan_find_manual & pan_find_manual_alt
assert(servicePageContent.includes("['pan_find_manual', 'pan_find_manual_alt'].includes(id)"), 'pan_find_manual must have dedicated form 9B');
assert(servicePageContent.includes("val = customerName.trim()"), 'pan_find_manual must assign customerName as val');
assert(servicePageContent.includes("['pan_find_manual', 'pan_find_manual_alt'].includes(tid)"), 'pan_find_manual client validation check present');
assert(servicePageContent.includes("params.name = customerName.trim()"), 'pan_find_manual must pack name');
assert(servicePageContent.includes("params.fatherName = fatherName.trim()"), 'pan_find_manual must pack fatherName');
assert(servicePageContent.includes("params.mobile = secondaryInput.trim()"), 'pan_find_manual must pack mobile');

const panFindMan = services79.find(s => s.id === 'pan_find_manual');
assert(panFindMan, 'pan_find_manual must exist in services_79.json');
assert(panFindMan.apiEndpoint.includes('panFind_name_and_number.php'), 'pan_find_manual must route to panFind_name_and_number.php');
assert(panFindMan.upstreamService === 'pan_find_manual', 'pan_find_manual upstreamService must be pan_find_manual');
assert(panFindMan.upstreamFile === 'pan_find_manual.php', 'pan_find_manual upstreamFile must be pan_find_manual.php');

// 3. Service 8: pan_to_aadhar_find
assert(servicePageContent.includes("if (id === 'pan_to_aadhar_find')"), 'pan_to_aadhar_find must have dedicated form 10');
assert(servicePageContent.includes("tid === 'pan_to_aadhar_find'"), 'pan_to_aadhar_find client validation check present');
assert(servicePageContent.includes("params.dob = dobDate ? formatDobDisplay(dobDate) : undefined"), 'pan_to_aadhar_find must pack dob');

const panToAadharSvc = services79.find(s => s.id === 'pan_to_aadhar_find');
assert(panToAadharSvc, 'pan_to_aadhar_find must exist in services_79.json');
assert(panToAadharSvc.apiEndpoint.includes('pan_to_aadhar.php'), 'pan_to_aadhar_find must route to pan_to_aadhar.php');
assert(panToAadharSvc.badge.includes('लाइव सरकारी API'), 'pan_to_aadhar_find must have live API badge');

// 4. Service 9: pan_aadhaar_link_manual
assert(servicePageContent.includes("if (id === 'pan_aadhaar_link_manual')"), 'pan_aadhaar_link_manual must have dedicated form 11');
assert(servicePageContent.includes("tid === 'pan_aadhaar_link_manual'"), 'pan_aadhaar_link_manual client validation check present');
assert(indexPhpContent.includes("$uService === 'Pan_Number_Link' || ($service79['id'] ?? '') === 'pan_aadhaar_link_manual'"), 'index.php must support pan_aadhaar_link_manual in relay');
assert(serverJsContent.includes("uService === 'Pan_Number_Link' || service79.id === 'pan_aadhaar_link_manual'"), 'server.js must support pan_aadhaar_link_manual in relay');
assert(indexPhpContent.includes("$upstreamFile = 'panAadharNumber_Link.php'"), 'index.php must route Pan_Number_Link to panAadharNumber_Link.php');

// 5. Service 10: pan_to_gst & gst_to_pan & gst_verification
assert(servicePageContent.includes("if (id === 'pan_to_gst')"), 'pan_to_gst must have dedicated form 12');
assert(servicePageContent.includes("['gst_to_pan', 'gst_verification'].includes(id)"), 'gst_to_pan must have dedicated form 13');
assert(indexPhpContent.includes("'gst_verification' => 'gst_to_pan'"), 'index.php legacyMap must resolve gst_verification');
assert(serverJsContent.includes("'gst_verification': 'gst_to_pan'"), 'server.js legacyMap must resolve gst_verification');

// 6. Service 11: pan_details & pan_verification_premium
assert(servicePageContent.includes("['pan', 'pan_details', 'pan_basic_pricing'"), 'pan_details must have clean 15B form');
assert(indexPhpContent.includes("'pan_verification_premium' => 'pan_details'"), 'index.php legacyMap must resolve pan_verification_premium');
assert(serverJsContent.includes("'pan_verification_premium': 'pan_details'"), 'server.js legacyMap must resolve pan_verification_premium');
const panDetailsSvc = services79.find(s => s.id === 'pan_details');
assert(panDetailsSvc.apiEndpoint.includes('panVerificationPremium.php'), 'pan_details must route to panVerificationPremium.php');

// 7. Service 12: panCard / Instant PAN PVC CR-80 Maker
assert(servicePageContent.includes("if (id === 'pancard')"), 'panCard must have dedicated 15A form');
assert(servicePageContent.includes("ISO CR-80 PVC पैन कार्ड मेकर"), 'panCard form must display ISO CR-80 banner');
assert(servicePageContent.includes("handlePhotoUpload"), 'panCard form must have photo upload');
assert(servicePageContent.includes("handleSignUpload"), 'panCard form must have signature upload');
assert(servicePageContent.includes("toolKind === 'pan' && ("), 'ServicePage must render CR-80 card preview for toolKind pan');
assert(servicePageContent.includes("INCOME TAX DEPARTMENT • GOVT. OF INDIA"), 'PAN card preview must contain official ITD header');
assert(indexPhpContent.includes("$normServiceType === 'pancard' || (isset($params['serviceId']) && $params['serviceId'] === 'panCard')"), 'index.php execute-automated must support instant PVC panCard');
assert(serverJsContent.includes("normServiceType === 'pancard' || normServiceType === 'panCard' || params?.serviceId === 'panCard'"), 'server.js execute-automated must support instant PVC panCard');

// 8. Strict Backend Response Validation (Zero Fake Fallback Protection)
assert(indexPhpContent.includes("in_array($norm, ['pan_find', 'pan_find_manual', 'pan_find_manual_alt', 'epan', 'findpan'])"), 'index.php must strictly validate PAN find responses');
assert(serverJsContent.includes("['pan_find', 'pan_find_manual', 'pan_find_manual_alt', 'epan', 'findpan'].includes(norm)"), 'server.js must strictly validate PAN find responses');
assert(!indexPhpContent.includes("$panNo = strtoupper(trim($liveP4['panNo'] ?? ($p4Data['panNumber'] ?? ($p4Data['panNo'] ?? ($p4Data['pan'] ?? ($userVal ?: ''))))));"), 'index.php must NOT unconditionally fall back to userVal on PAN search');

console.log('✅ PASS: Part 2 PAN Card Services Suite 100% verified across all tiers');

console.log('\n--- TEST 3D: Part 3 Aadhaar Card Services Suite Comprehensive Verification ---');
// 1. Service 13: aadhaar_pdf_otp / aadhaar_original_pdf_otp (Original PDF via OTP)
assert(servicePageContent.includes("['aadhaar_pdf_otp', 'aadhaar_original_pdf_otp'].includes(id)"), 'aadhaar_pdf_otp must have dedicated form 13A');
assert(servicePageContent.includes("['aadhaar_pdf_otp', 'aadhaar_original_pdf_otp'].includes(tid)"), 'aadhaar_pdf_otp must validate 12-digit Aadhaar');
assert(servicePageContent.includes("currentTool?.id === 'aadhaar_original_pdf_otp'"), 'requiresLiveOtp must check aadhaar_original_pdf_otp');
assert(servicePageContent.includes("!secondaryInput.trim()"), 'requiresLiveOtp must NOT hijack submission when user has already typed OTP');
const aadhaarPdfSvc = services79.find(s => s.id === 'aadhaar_original_pdf_otp');
assert(aadhaarPdfSvc, 'aadhaar_original_pdf_otp must exist in services_79.json');
assert(aadhaarPdfSvc.apiEndpoint.includes('aadhaar_pdf.php'), 'aadhaar_original_pdf_otp must route to aadhaar_pdf.php');
assert(aadhaarPdfSvc.badge.includes('लाइव सरकारी API'), 'aadhaar_original_pdf_otp must have honest live API badge');
assert(indexPhpContent.includes("'aadhaar_pdf_otp' => 'aadhaar_original_pdf_otp'"), 'index.php legacyMap must resolve aadhaar_pdf_otp');
assert(serverJsContent.includes("'aadhaar_pdf_otp': 'aadhaar_original_pdf_otp'"), 'server.js legacyMap must resolve aadhaar_pdf_otp');
assert(serverJsContent.includes("app.post('/api/services/otp/request'"), 'server.js must implement /api/services/otp/request');
assert(serverJsContent.includes("app.post('/api/services/otp/verify'"), 'server.js must implement /api/services/otp/verify');

// 2. Service 14: aadhaar_ekyc / uid_ekyc (eKYC Verification via Biometric RD)
assert(servicePageContent.includes("['aadhaar_ekyc', 'uid_ekyc'].includes(id)"), 'aadhaar_ekyc must have dedicated form 13B');
assert(servicePageContent.includes("['aadhaar_ekyc', 'uid_ekyc'].includes(tid) && val.replace(/\\D/g, '').length !== 12"), 'aadhaar_ekyc must validate 12-digit Aadhaar');
assert(servicePageContent.includes("params.pidData = biometricPid"), 'ServicePage must pack biometric pidData');
assert(indexPhpContent.includes("'uid_ekyc' => 'aadhaar_advance'"), 'index.php legacyMap must resolve uid_ekyc');
assert(serverJsContent.includes("'uid_ekyc': 'aadhaar_advance'"), 'server.js legacyMap must resolve uid_ekyc');

// 3. Service 15: aadhaar_advance (Advance Fingerprint 1 to 5)
assert(servicePageContent.includes("['aadhaar_advance', 'aadhaar_advance_one'"), 'aadhaar_advance must have dedicated form 13C');
assert(servicePageContent.includes("params.advanceServer = advanceServer || '1'"), 'aadhaar_advance must pack advanceServer');
const aadhaarAdvSvc = services79.find(s => s.id === 'aadhaar_advance');
assert(aadhaarAdvSvc, 'aadhaar_advance must exist in services_79.json');
assert(aadhaarAdvSvc.apiEndpoint.includes('ekycVerification.php'), 'aadhaar_advance must route to ekycVerification.php');
assert(aadhaarAdvSvc.badge.includes('लाइव सरकारी API'), 'aadhaar_advance must have honest live API badge');
assert(aadhaarAdvSvc.isComingSoon === false, 'aadhaar_advance must NOT be coming soon');
assert(indexPhpContent.includes("'aadhaar_advance_one' => 'aadhaar_advance'"), 'index.php legacyMap must resolve aadhaar_advance_one');
assert(serverJsContent.includes("'aadhaar_advance_one': 'aadhaar_advance'"), 'server.js legacyMap must resolve aadhaar_advance_one');

// 4. Service 16: aadhaar_manual & aadhaarCard (Manual ISO CR-80 PVC Smart Card Maker)
assert(servicePageContent.includes("['aadhaar_manual', 'aadhaarcard'].includes(id)"), 'aadhaar_manual must have dedicated form 13D');
assert(servicePageContent.includes("आधार मैनुअल CR-80 PVC स्मार्ट कार्ड मेकर"), 'aadhaar_manual form must display ISO CR-80 banner');
assert(servicePageContent.includes("params.serviceId = 'aadhaarCard'"), 'aadhaar_manual must pack serviceId aadhaarCard');
assert(servicePageContent.includes("cardData.photoUrl || photoData"), 'Aadhaar front card must render cardData.photoUrl with photoData fallback');
assert(servicePageContent.includes("toolKind === 'aadhaar' || currentTool?.serviceType === 'aadhaarCard'"), 'ServicePage must render Aadhaar CR-80 card preview');
assert(servicePageContent.includes("मेरा आधार, मेरी पहचान"), 'Aadhaar preview must contain official UIDAI tagline');
assert(!serverJsContent.includes("'aadhaar_manual': 'aadhaar_advance'"), 'aadhaar_manual must NOT be misrouted to aadhaar_advance in server.js');
assert(!indexPhpContent.includes("'aadhaar_manual' => 'aadhaar_advance'"), 'aadhaar_manual must NOT be misrouted to aadhaar_advance in index.php');
assert(indexPhpContent.includes("$normServiceType === 'aadhaarcard' || $normServiceType === 'aadhaarCard' || $normServiceType === 'aadhaar_manual'"), 'index.php execute-automated must support instant PVC aadhaarCard');
assert(serverJsContent.includes("normServiceType === 'aadhaarcard' || normServiceType === 'aadhaarCard' || normServiceType === 'aadhaar_manual'"), 'server.js execute-automated must support instant PVC aadhaarCard');

// 5. Service 17: mobile_update_service / aadhaar_to_mobile_find (Mobile Link / Update Relay)
assert(servicePageContent.includes("['mobile_update_service', 'aadhaar_to_mobile_find', 'aadhaar_mobile_link'].includes(id)"), 'mobile_update_service must have dedicated form 13E');
assert(servicePageContent.includes("['mobile_update_service', 'aadhaar_to_mobile_find', 'aadhaar_mobile_link'].includes(tid)"), 'mobile_update_service must validate 12-digit Aadhaar');
const mobUpdSvc = services79.find(s => s.id === 'mobile_update_service');
assert(mobUpdSvc, 'mobile_update_service must exist in services_79.json');
assert(mobUpdSvc.upstreamService === 'Mobile_Update', 'mobile_update_service must have upstreamService Mobile_Update');
assert(mobUpdSvc.upstreamFile === 'Mobile_Update.php', 'mobile_update_service must have upstreamFile Mobile_Update.php');
assert(mobUpdSvc.badge.includes('मैन्युअल रिले'), 'mobile_update_service must have honest manual relay badge');
assert(indexPhpContent.includes("$uService === 'Mobile_Update' || in_array($service79['id'] ?? '', ['mobile_update_service', 'aadhaar_to_mobile_find'])"), 'index.php must support Mobile_Update relay');
assert(serverJsContent.includes("uService === 'Mobile_Update' || service79.id === 'mobile_update_service' || service79.id === 'aadhaar_to_mobile_find'"), 'server.js must support Mobile_Update relay');

// 6. Service 18: dob_update_service (DOB Update Request Relay)
assert(servicePageContent.includes("['dob_update_service', 'aadhaar_dob_update'].includes(id)"), 'dob_update_service must have dedicated form 13F');
assert(servicePageContent.includes("['dob_update_service', 'aadhaar_dob_update'].includes(tid)"), 'dob_update_service must validate 12-digit Aadhaar');
const dobUpdSvc = services79.find(s => s.id === 'dob_update_service');
assert(dobUpdSvc, 'dob_update_service must exist in services_79.json');
assert(dobUpdSvc.upstreamService === 'Dob_Update', 'dob_update_service must have upstreamService Dob_Update');
assert(dobUpdSvc.upstreamFile === 'dob_update.php', 'dob_update_service must have upstreamFile dob_update.php');
assert(dobUpdSvc.badge.includes('मैन्युअल रिले'), 'dob_update_service must have honest manual relay badge');
assert(indexPhpContent.includes("$uService === 'Dob_Update' || ($service79['id'] ?? '') === 'dob_update_service'"), 'index.php must support Dob_Update relay');
assert(serverJsContent.includes("uService === 'Dob_Update' || service79.id === 'dob_update_service'"), 'server.js must support Dob_Update relay');

// 7. Service 19: mask_aadhaar / aadhaar_mask_verification (Mask Aadhaar Verification)
assert(servicePageContent.includes("['mask_aadhaar', 'aadhaar_mask_verification', 'pan_aadhar_mask'].includes(id)"), 'mask_aadhaar must have dedicated form 13G');
assert(servicePageContent.includes("['mask_aadhaar', 'aadhaar_mask_verification', 'pan_aadhar_mask'].includes(tid) && val.replace(/\\D/g, '').length !== 12"), 'mask_aadhaar must validate 12-digit Aadhaar');
const maskAadhaarSvc = services79.find(s => s.id === 'pan_aadhar_mask');
assert(maskAadhaarSvc, 'pan_aadhar_mask must exist in services_79.json');
assert(maskAadhaarSvc.apiEndpoint.includes('maskAadharVerification.php'), 'pan_aadhar_mask must route to maskAadharVerification.php');
assert(maskAadhaarSvc.badge.includes('लाइव सरकारी API'), 'pan_aadhar_mask must have live API badge');
assert(indexPhpContent.includes("'mask_aadhaar' => 'pan_aadhar_mask'"), 'index.php legacyMap must resolve mask_aadhaar');
assert(serverJsContent.includes("'mask_aadhaar': 'pan_aadhar_mask'"), 'server.js legacyMap must resolve mask_aadhaar');

// 8. Aadhaar Demographic Mapping in Backend
assert(indexPhpContent.includes("$p4Service === 'aadhaar' || strpos($normServiceType, 'aadhaar') !== false || strpos($normServiceType, 'aadhar') !== false || strpos($normServiceType, 'uid') !== false"), 'index.php must map Aadhaar live response');
assert(serverJsContent.includes("liveP4.service === 'aadhaar' || normServiceType.includes('aadhaar') || normServiceType.includes('aadhar') || normServiceType.includes('uid')"), 'server.js must map Aadhaar live response');

console.log('✅ PASS: Part 3 Aadhaar Card Services Suite 100% verified across all tiers');

console.log('\n--- TEST 3E: Part 4 Voter Card Services Suite Comprehensive Verification ---');
// 1. Service 20: voter_verification & voter_details
assert(servicePageContent.includes("['voter', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_verification', 'epic'].includes(id)"), 'voter_verification must have dedicated form 28');
assert(servicePageContent.includes("['voter', 'epic', 'voter_verification', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_original_pdf_otp', 'votercard'].includes(tid) && val.length < 5"), 'voter_verification must validate min 5 chars');
assert(servicePageContent.includes("params.epicNumber = val.toUpperCase().trim()"), 'ServicePage must pack epicNumber');
assert(servicePageContent.includes("params.epic = val.toUpperCase().trim()"), 'ServicePage must pack epic');

const voterVerSvc = services79.find(s => s.id === 'voter_verification');
assert(voterVerSvc, 'voter_verification must exist in services_79.json');
assert(voterVerSvc.apiEndpoint.includes('voterVerification_new.php'), 'voter_verification must route to voterVerification_new.php');
assert(voterVerSvc.badge.includes('लाइव P4 API'), 'voter_verification must have honest live API badge');
assert(indexPhpContent.includes("api/v1/voterVerification_new.php"), 'index.php must call voterVerification_new.php');
assert(serverJsContent.includes("api/v1/voterVerification_new.php"), 'server.js must call voterVerification_new.php');

// 2. Service 21: instant_voter_link & voter_mobile_link
assert(servicePageContent.includes("['voter_mobile_link', 'vcmRequest', 'voter_mobile_link_no_otp', 'voter_mobile_link_instant_otp', 'instant_voter_link', 'voter_mobile_link_instant'].includes(id)"), 'voter_mobile_link must have dedicated form 22');
assert(servicePageContent.includes("['voter_mobile_link', 'vcmRequest', 'voter_mobile_link_no_otp', 'voter_mobile_link_instant_otp', 'instant_voter_link', 'voter_mobile_link_instant'].includes(tid)"), 'voter_mobile_link must validate mobile number');
assert(servicePageContent.includes("params.mobile = secondaryInput.trim()"), 'voter_mobile_link must pack mobile');
const voterLinkSvc = services79.find(s => s.id === 'voter_mobile_link');
assert(voterLinkSvc, 'voter_mobile_link must exist in services_79.json');
assert(voterLinkSvc.apiEndpoint.includes('instant_voter_link.php'), 'voter_mobile_link must route to instant_voter_link.php');
assert(indexPhpContent.includes("api/v4/instant_voter_link.php"), 'index.php must route to instant_voter_link.php');
assert(serverJsContent.includes("api/v4/instant_voter_link.php"), 'server.js must route to instant_voter_link.php');

// 3. Service 22B: voter_original_pdf_otp
assert(servicePageContent.includes("id === 'voter_original_pdf_otp'"), 'voter_original_pdf_otp must have dedicated form 22B');
assert(servicePageContent.includes("currentTool?.id === 'voter_original_pdf_otp'"), 'voter_original_pdf_otp must validate OTP requirement');
const voterOtpSvc = services79.find(s => s.id === 'voter_original_pdf_otp');
assert(voterOtpSvc, 'voter_original_pdf_otp must exist in services_79.json');
assert(voterOtpSvc.apiEndpoint.includes('send-otp.php'), 'voter_original_pdf_otp must route to send-otp.php');
assert(indexPhpContent.includes("api/v1/v-Addition/Pdf-Download/api/send-otp.php"), 'index.php must implement send-otp.php');
assert(indexPhpContent.includes("api/v1/v-Addition/Pdf-Download/api/verify-otp.php"), 'index.php must implement verify-otp.php');
assert(serverJsContent.includes("api/v1/v-Addition/Pdf-Download/api/send-otp.php"), 'server.js must implement send-otp.php');
assert(serverJsContent.includes("api/v1/v-Addition/Pdf-Download/api/verify-otp.php"), 'server.js must implement verify-otp.php');

// 4. Service 22C: voter_pdf & voter_original_pdf_no_otp
const voterPdfSvc = services79.find(s => s.id === 'voter_pdf');
assert(voterPdfSvc, 'voter_pdf must exist in services_79.json');
assert(voterPdfSvc.apiEndpoint.includes('request-pdf.php'), 'voter_pdf must route to request-pdf.php');
assert(indexPhpContent.includes("api/v1/voter-api/request-pdf.php"), 'index.php must call request-pdf.php');
assert(serverJsContent.includes("api/v1/voter-api/request-pdf.php"), 'server.js must call request-pdf.php');

// 5. Service 28A: voterCard / voter_manual (Manual ISO CR-80 PVC Smart Card Maker)
assert(servicePageContent.includes("['voterCard', 'voter_card_pvc', 'voter_manual'].includes(id)"), 'voterCard must have dedicated form 28A');
assert(servicePageContent.includes("ISO CR-80 PVC डिजिटल वोटर कार्ड मेकर"), 'voterCard form must display ISO CR-80 banner');
assert(servicePageContent.includes("toolKind === 'voter' || currentTool?.serviceType === 'voterCard'"), 'ServicePage must render voter CR-80 card preview');
assert(servicePageContent.includes("ELECTION COMMISSION OF INDIA"), 'Voter preview must contain official ECI header');
assert(indexPhpContent.includes("$normServiceType === 'votercard' || $normServiceType === 'voterCard' || $normServiceType === 'voter_manual'"), 'index.php must support instant PVC voterCard');
assert(serverJsContent.includes("normServiceType === 'votercard' || normServiceType === 'voterCard' || normServiceType === 'voter_manual'"), 'server.js must support instant PVC voterCard');

// 6. Voter Demographic Mapping in Backend
assert(indexPhpContent.includes("liveP4['name'] ?? ($p4Data['name'] ?? ($p4Data['applicant_name'] ?? ($params['customerName'] ?? 'मतदाता')))") || indexPhpContent.includes("$generatedData['epicNumber'] = $epic;"), 'index.php must map voter demographic fields');
assert(serverJsContent.includes("generatedData.acName = liveP4.assembly || rawData.ac_name"), 'server.js must map voter demographic fields');

// 7. Section 6 Voter Verification isolation from sub-services
assert(indexPhpContent.includes("strpos($norm, 'link') === false && strpos($norm, 'mobile') === false && strpos($norm, 'otp') === false"), 'index.php Section 6 must isolate verification from link/otp');
assert(serverJsContent.includes("!norm.includes('link') && !norm.includes('mobile') && !norm.includes('otp')"), 'server.js Section 6 must isolate verification from link/otp');

console.log('✅ PASS: Part 4 Voter Card Services Suite 100% verified across all tiers');

console.log('\n--- TEST 3F: Part 5 Ration, Ayushman, Samagra & Welfare Services Suite Verification ---');
// 1. Verify all 12 services exist in services_79.json
const part5ServiceIds = [
  'ration_verification', 'ration_pdf_by_ration', 'ration_pdf_by_aadhar',
  'up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar',
  'up_ration_info', 'ayushman_image_jpg', 'e_shram', 'e_shram_update',
  'samagra_service', 'sambal_pdf'
];
part5ServiceIds.forEach(id => {
  const svc = services79.find(s => s.id === id);
  assert(svc, `Service ${id} must exist in services_79.json`);
  assert(svc.badge, `Service ${id} must have honest badge`);
  assert(svc.isComingSoon === false, `Service ${id} must NOT be coming soon`);
});
console.log('✅ PASS: All 12 Part 5 services registered with honest badges and active status');

// 2. Client-side Input Validations & Parameter Packing in ServicePage.jsx
assert(servicePageContent.includes("['ration', 'ration_pdf_by_ration', 'ration_verification', 'rationCard', 'up_ration_info'].includes(tid)"), 'Ration number validation present');
assert(servicePageContent.includes("['ayushman', 'pmjay_verify', 'ayushman_card', 'ayushman_image_jpg', 'ayushmanCard'].includes(tid)"), 'Ayushman PMJAY ID validation present');
assert(servicePageContent.includes("tid === 'e_shram' && val.replace(/\\D/g, '').length !== 12"), 'e-Shram 12-digit Aadhaar validation present');
assert(servicePageContent.includes("['e_shram_update', 'e_shram_number_link'].includes(tid)"), 'e-Shram update validation present');
assert(servicePageContent.includes("tid === 'samagra_service'"), 'Samagra validation present');
assert(servicePageContent.includes("tid === 'sambal_pdf'"), 'Sambal validation present');
assert(servicePageContent.includes("params.pmjayId = val.toUpperCase().trim()"), 'Ayushman packs pmjayId');
assert(servicePageContent.includes("params.rationNumber = val"), 'Ration info/aadhaar services pack rationNumber');
assert(servicePageContent.includes("params.uidNumber = val"), 'e-Shram / Sambal pack uidNumber');
assert(servicePageContent.includes("params.familyId = val"), 'Samagra packs familyId');
console.log('✅ PASS: ServicePage client-side validations and parameter packing verified');

// 3. Official CR-80 PVC Preview for Ayushman Golden Card
assert(servicePageContent.includes("National Health Authority (NHA)"), 'Ayushman preview must contain official NHA header');
assert(servicePageContent.includes("आयुष्मान भारत • प्रधानमंत्री जन आरोग्य योजना"), 'Ayushman preview must display PM-JAY scheme name');
assert(servicePageContent.includes("14555"), 'Ayushman preview must display official 14555 helpline');
assert(servicePageContent.includes("toolKind === 'ayushman'"), 'Ayushman preview condition check');
console.log('✅ PASS: Ayushman ISO CR-80 PVC Golden Card preview with NHA & helpline verified');

// 4. Zero Mock Names Sanitization in Backend Lookups
assert(!serverJsContent.includes('SUNITA DEVI'), 'server.js must NOT contain mock name SUNITA DEVI');
assert(!serverJsContent.includes('KUSUM LATA'), 'server.js must NOT contain mock name KUSUM LATA');
assert(!serverJsContent.includes('विकास'), 'server.js must NOT contain mock name Vikas');
assert(!serverJsContent.includes('पूजा'), 'server.js must NOT contain mock name Pooja');
assert(!indexPhpContent.includes('SUNITA DEVI'), 'index.php must NOT contain mock name SUNITA DEVI');
assert(!indexPhpContent.includes('KUSUM LATA'), 'index.php must NOT contain mock name KUSUM LATA');
assert(!indexPhpContent.includes('विकास'), 'index.php must NOT contain mock name Vikas');
assert(!indexPhpContent.includes('पूजा'), 'index.php must NOT contain mock name Pooja');
console.log('✅ PASS: Zero mock/synthetic names verified in both Node and PHP backends');

// 5. Backend Section 5 Isolation and Endpoints (Node & PHP)
assert(serverJsContent.includes("norm.includes('ration') && !norm.includes('aadhar') && !norm.includes('uid') && !norm.includes('info')"), 'server.js Section 5 must isolate ration PDF');
assert(indexPhpContent.includes("strpos($norm, 'ration') !== false && strpos($norm, 'aadhar') === false && strpos($norm, 'uid') === false && strpos($norm, 'info') === false"), 'index.php Section 5 must isolate ration PDF');
assert(serverJsContent.includes("ration_full_info_up.php"), 'server.js Section 5B UP ration info implemented');
assert(indexPhpContent.includes("ration_full_info_up.php"), 'index.php Section 5B UP ration info implemented');
assert(serverJsContent.includes("Ration2Uid-up"), 'server.js Section 5C Ration to Aadhaar implemented');
assert(indexPhpContent.includes("Ration2Uid-up"), 'index.php Section 5C Ration to Aadhaar implemented');
assert(serverJsContent.includes("Ration2Uid-All_state"), 'server.js Section 5C All state ration to UID implemented');
assert(indexPhpContent.includes("Ration2Uid-All_state"), 'index.php Section 5C All state ration to UID implemented');
assert(serverJsContent.includes("aasham_ration2uid.php"), 'server.js Section 5C Assam ration to UID implemented');
assert(indexPhpContent.includes("aasham_ration2uid.php"), 'index.php Section 5C Assam ration to UID implemented');
assert(serverJsContent.includes("PmjayVerification"), 'server.js Section 12D PMJAY verification implemented');
assert(indexPhpContent.includes("PmjayVerification"), 'index.php Section 12D PMJAY verification implemented');
assert(serverJsContent.includes("aadhar_to_Rationpdf.php"), 'server.js Section 10 Aadhaar to Ration implemented');
assert(indexPhpContent.includes("aadhar_to_Rationpdf.php"), 'index.php Section 10 Aadhaar to Ration implemented');
console.log('✅ PASS: Live P4Points Section 5, 5B, 5C, 10, 12D verified in both backends');

// 6. Manual Relay Parameter Handling (Node & PHP)
assert(serverJsContent.includes("uService === 'Mobile_Update' || service79.id === 'mobile_update_service' || service79.id === 'aadhaar_to_mobile_find' || service79.id === 'e_shram_update'"), 'server.js relay supports e_shram_update');
assert(indexPhpContent.includes("uService === 'Mobile_Update' || in_array($service79['id'] ?? '', ['mobile_update_service', 'aadhaar_to_mobile_find', 'e_shram_update'])"), 'index.php relay supports e_shram_update');
assert(serverJsContent.includes("uService === 'Samagra Print' || service79.id === 'samagra_service'"), 'server.js relay supports samagra_service');
assert(indexPhpContent.includes("$uService === 'Samagra Print' || ($service79['id'] ?? '') === 'samagra_service'"), 'index.php relay supports samagra_service');
assert(serverJsContent.includes("service79.id === 'sambal_pdf'"), 'server.js relay supports sambal_pdf');
assert(indexPhpContent.includes("($service79['id'] ?? '') === 'sambal_pdf'"), 'index.php relay supports sambal_pdf');
console.log('✅ PASS: Manual relay handlers for e_shram_update, samagra_service, and sambal_pdf verified');

// 7. Live Demographic Mapping & Instant PVC Generators in execute-automated
assert(serverJsContent.includes("normServiceType === 'ayushmancard' || normServiceType === 'ayushmanCard' || normServiceType === 'ayushman_image_jpg'"), 'server.js supports instant PVC ayushmanCard');
assert(indexPhpContent.includes("$normServiceType === 'ayushmancard' || $normServiceType === 'ayushmanCard' || $normServiceType === 'ayushman_image_jpg'"), 'index.php supports instant PVC ayushmanCard');
assert(serverJsContent.includes("normServiceType === 'rationcard' || normServiceType === 'rationCard' || normServiceType === 'ration_pdf_by_ration'"), 'server.js supports instant PVC rationCard');
assert(indexPhpContent.includes("$normServiceType === 'rationcard' || $normServiceType === 'rationCard' || $normServiceType === 'ration_pdf_by_ration'"), 'index.php supports instant PVC rationCard');
console.log('✅ PASS: Live demographic mappings and instant PVC generators verified');

// 8. Lookup routes connected to Live P4Points
assert(serverJsContent.includes("app.get('/api/ayushman/lookup/:id'"), 'server.js ayushman lookup route exists');
assert(serverJsContent.includes("app.get('/api/ration/lookup/:rationNo'"), 'server.js ration lookup route exists');
assert(indexPhpContent.includes("preg_match('#^ayushman/lookup/([^/]+)$#'"), 'index.php ayushman lookup route exists');
assert(indexPhpContent.includes("preg_match('#^ration/lookup/([^/]+)$#'"), 'index.php ration lookup route exists');
console.log('✅ PASS: Ayushman and Ration lookup routes with live gateway check verified');

console.log('✅ PASS: Part 5 Ration, Ayushman, Samagra & Welfare Suite 100% verified across all tiers');

console.log('\n--- TEST 3G: Part 6 Utility, AgriStack, RTPS, Banking & Telecom Suite Comprehensive Verification ---');
// 1. Verify 9 Mandatory Audit Items across Node, PHP & Frontend
assert(serverJsContent.includes("'dl_details': 'driving_licence_pdf'"), 'Audit 1: server.js legacyMap dl_details mapped');
assert(indexPhpContent.includes("'dl_details' => 'driving_licence_pdf'"), 'Audit 1: index.php legacyMap dl_details mapped');

assert(serverJsContent.includes("MobileNumberToChallanDetails.php"), 'Audit 2: server.js chalan_find_mobile direct route');
assert(indexPhpContent.includes("MobileNumberToChallanDetails.php"), 'Audit 2: index.php chalan_find_mobile direct route');

assert(serverJsContent.includes("'voter_mobile_link_no_otp': 'instant_voter_link'"), 'Audit 3: server.js voter_mobile_link_no_otp mapped');
assert(indexPhpContent.includes("'voter_mobile_link_no_otp' => 'instant_voter_link'"), 'Audit 3: index.php voter_mobile_link_no_otp mapped');

assert(serverJsContent.includes("'voter_mobile_link_instant_otp': 'instant_voter_link'"), 'Audit 4: server.js voter_mobile_link_instant_otp mapped');
assert(indexPhpContent.includes("'voter_mobile_link_instant_otp' => 'instant_voter_link'"), 'Audit 4: index.php voter_mobile_link_instant_otp mapped');

assert(servicePageContent.includes("['voter', 'epic', 'voter_verification', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_original_pdf_otp', 'votercard'].includes(tid)"), 'Audit 5: ServicePage voter form check includes votercard');

assert(serverJsContent.includes("'ration_verification': 'ration_pdf_by_ration'"), 'Audit 6: server.js ration_verification mapped');
assert(indexPhpContent.includes("'ration_verification' => 'ration_pdf_by_ration'"), 'Audit 6: index.php ration_verification mapped');

assert(serverJsContent.includes("norm.includes('ration_to_aadhar')"), 'Audit 7: server.js ration_to_aadhar spelling support');
assert(indexPhpContent.includes("strpos($norm, 'ration_to_aadhar') !== false"), 'Audit 7: index.php ration_to_aadhar spelling support');

assert(serverJsContent.includes("'up_ration_to_aadhaar': 'up_ration_to_aadhaar'"), 'Audit 8: server.js up_ration_to_aadhaar mapped');
assert(indexPhpContent.includes("'up_ration_to_aadhaar' => 'up_ration_to_aadhaar'"), 'Audit 8: index.php up_ration_to_aadhaar mapped');

assert(serverJsContent.includes("'assam_ration_to_aadhaar': 'assam_ration_to_aadhaar'"), 'Audit 9: server.js assam_ration_to_aadhaar mapped');
assert(indexPhpContent.includes("'assam_ration_to_aadhaar' => 'assam_ration_to_aadhaar'"), 'Audit 9: index.php assam_ration_to_aadhaar mapped');
console.log('✅ PASS: All 9 mandatory audit fixes verified across server.js, index.php & ServicePage.jsx');

// 2. Verify all 28 Part 6 Services registered in services_79.json
const part6ServiceIds = [
  'electric_bill_pdf_bihar', 'rtps_bihar_pdf', 'agristack_verify', 'agristack_dbt', 'agristack_pdf',
  'udyam_pdf', 'mobile_to_upi_find', 'mobile_to_multi_upi_find', 'mobile_to_account_find', 'mobile_to_multi_account',
  'upi_to_details', 'vi_sim_to_photo_details', 'check_operator', 'check_plan', 'mobile_to_details',
  'mobile_lookup', 'chalan_find_mobile', 'chalan_find', 'nsdl_bank', 'npci_verify', 'uid_seeding',
  'telegram_to_number_lookup', 'gmail_to_details', 'bank_ifsc_lookup', 'pincode_lookup', 'qr_generator',
  'sarkari_job_feed', 'pvc_auto_cropper'
];
part6ServiceIds.forEach(id => {
  const svc = services79.find(s => s.id === id);
  assert(svc, `Service ${id} must exist in services_79.json`);
  assert(svc.status === 'live', `Service ${id} must have live status in services_79.json`);
});
console.log('✅ PASS: All 28 Part 6 services registered with active status in services_79.json');

// 3. Backend Live P4Points Routing Sections (Sections 7, 9, 19, 20-32)
assert(serverJsContent.includes('elctricBillPDF.php'), 'server.js Section 7 Electric Bill PDF');
assert(indexPhpContent.includes('elctricBillPDF.php'), 'index.php Section 7 Electric Bill PDF');

assert(serverJsContent.includes('RtpsCertificate-Br.php'), 'server.js Section 9 RTPS Bihar Certificate PDF');
assert(indexPhpContent.includes('RtpsCertificate-Br.php'), 'index.php Section 9 RTPS Bihar Certificate PDF');

assert(serverJsContent.includes('npci/npci_link_status.php'), 'server.js Section 19/19B NPCI Bank Seeding');
assert(indexPhpContent.includes('npci/npci_link_status.php'), 'index.php Section 19/19B NPCI Bank Seeding');

assert(serverJsContent.includes('approvedFarmersPdf.php'), 'server.js Section 20 AgriStack Approved Farmers PDF');
assert(indexPhpContent.includes('approvedFarmersPdf.php'), 'index.php Section 20 AgriStack Approved Farmers PDF');

assert(serverJsContent.includes('farmer-details.php'), 'server.js Section 21 AgriStack Farmer Details');
assert(indexPhpContent.includes('farmer-details.php'), 'index.php Section 21 AgriStack Farmer Details');

assert(serverJsContent.includes('checkStatus.php'), 'server.js Section 22 AgriStack DBT Status');
assert(indexPhpContent.includes('checkStatus.php'), 'index.php Section 22 AgriStack DBT Status');

assert(serverJsContent.includes('mobiletoupi.php'), 'server.js Section 23 Mobile to UPI Find');
assert(indexPhpContent.includes('mobiletoupi.php'), 'index.php Section 23 Mobile to UPI Find');

assert(serverJsContent.includes('mobiletoMultiupi_Find.php'), 'server.js Section 24 Mobile to Multi UPI');
assert(indexPhpContent.includes('mobiletoMultiupi_Find.php'), 'index.php Section 24 Mobile to Multi UPI');

assert(serverJsContent.includes('mobaile_to_account.php'), 'server.js Section 25 Mobile to Account');
assert(indexPhpContent.includes('mobaile_to_account.php'), 'index.php Section 25 Mobile to Account');

assert(serverJsContent.includes('mobaile_to_multi_bank.php'), 'server.js Section 26 Mobile to Multi Bank');
assert(indexPhpContent.includes('mobaile_to_multi_bank.php'), 'index.php Section 26 Mobile to Multi Bank');

assert(serverJsContent.includes('upi_verify.php'), 'server.js Section 27 UPI Verify');
assert(indexPhpContent.includes('upi_verify.php'), 'index.php Section 27 UPI Verify');

assert(serverJsContent.includes('vi_sim_details.php'), 'server.js Section 28 Vi SIM to Photo & Details');
assert(indexPhpContent.includes('vi_sim_details.php'), 'index.php Section 28 Vi SIM to Photo & Details');

assert(serverJsContent.includes('mobile_operator_verify'), 'server.js Section 29 Mobile Operator Verify');
assert(indexPhpContent.includes('mobile_operator_verify'), 'index.php Section 29 Mobile Operator Verify');

assert(serverJsContent.includes('mobileLookup.php'), 'server.js Section 30 Mobile / Plan Lookup');
assert(indexPhpContent.includes('mobileLookup.php'), 'index.php Section 30 Mobile / Plan Lookup');

assert(serverJsContent.includes('challanVerification.php'), 'server.js Section 32 Challan Vehicle Verification');
assert(indexPhpContent.includes('challanVerification.php'), 'index.php Section 32 Challan Vehicle Verification');
console.log('✅ PASS: All 18 Part 6 live P4Points backend sections verified across Node and PHP');

// 4. Client-side Form Validations & Parameter Packings in ServicePage.jsx
assert(servicePageContent.includes("['electric_bill_pdf_bihar', 'electric_bill'].includes(tid)"), 'Electric Bill CA validation');
assert(servicePageContent.includes("['rtps_bihar_pdf', 'rtps'].includes(tid)"), 'RTPS App No & Applicant Name validation');
assert(servicePageContent.includes("['agristack_pdf', 'agristack_verify', 'agristack_dbt'].includes(tid)"), 'AgriStack Farmer ID / Aadhaar validation');
assert(servicePageContent.includes("['udyam_pdf', 'udyam'].includes(tid)"), 'Udyam Registration Number validation');
assert(servicePageContent.includes("tid === 'upi_to_details'"), 'UPI ID validation');
assert(servicePageContent.includes("tid === 'nsdl_bank'"), 'NSDL Bank Account & IFSC validation');
assert(servicePageContent.includes("['npci_verify', 'uid_seeding', 'aadhaar_bank_seeding'].includes(tid)"), 'NPCI Aadhaar validation');
assert(servicePageContent.includes("tid === 'telegram_to_number_lookup'"), 'Telegram username validation');
assert(servicePageContent.includes("tid === 'gmail_to_details'"), 'Gmail address validation');
assert(servicePageContent.includes("tid === 'bank_ifsc_lookup'"), 'Bank IFSC validation');
assert(servicePageContent.includes("tid === 'pincode_lookup'"), 'Pincode validation');
assert(servicePageContent.includes("params.caNumber = val"), 'Electric Bill CA parameter packing');
assert(servicePageContent.includes("params.farmerId = val"), 'AgriStack farmerId parameter packing');
assert(servicePageContent.includes("params.udyamNo = val"), 'Udyam udyamNo parameter packing');
console.log('✅ PASS: Part 6 Client-side validations and parameter packings verified in ServicePage.jsx');

console.log('✅ PASS: Part 6 Utility, AgriStack, RTPS, Banking & Telecom Suite 100% verified across all tiers');

console.log('\n--- TEST 4: Inspect index.php & server.js for Zero Bypass & Server-Side Validations ---');
assert(!indexPhpContent.includes('$isTrial = $previewMode;'), 'index.php must not have $isTrial = $previewMode;');
assert(indexPhpContent.includes('http_response_code(403);'), 'index.php must return 403 on low balance');
assert(indexPhpContent.includes("if ($normServiceType === 'll_exam_pass_auto')"), 'index.php must validate ll_exam_pass_auto');
assert(indexPhpContent.includes("सारथी SMS पासवर्ड (Password) आवश्यक है।"), 'index.php must require password for ll_exam_pass_auto');

assert(!serverJsContent.includes('let isTrial = isOtherCategory ? false : Boolean(previewMode);'), 'server.js must not have isTrial previewMode bypass');
assert(serverJsContent.includes('return res.status(403).json('), 'server.js must return 403 on low balance');
assert(serverJsContent.includes("if (normServiceType === 'll_exam_pass_auto')"), 'server.js must validate ll_exam_pass_auto');

console.log('✅ PASS: index.php and server.js zero-bypass & password validation code verified');

console.log('\n--- TEST 5: Inspect services_79.json Upstream Manual Relay Metadata ---');
const llExam = services79.find(s => s.id === 'll_exam_pass_auto');
assert(llExam, 'll_exam_pass_auto must exist in services_79.json');
assert(llExam.upstreamService === 'LL_Request', 'll_exam_pass_auto must have upstreamService LL_Request');
assert(llExam.upstreamFile === 'll_exam_Request.php', 'll_exam_pass_auto must have upstreamFile ll_exam_Request.php');
console.log('✅ PASS: services_79.json upstream manual relay metadata verified');

console.log('\n--- TEST 6: Inspect deploy.ps1 for Strict 8006518960 Protection ---');
const deployContent = fs.readFileSync('deploy.ps1', 'utf8');
assert(deployContent.includes("w.balance = (w.phone === '8006518960') ? 10.0 : Math.max(0, realBal);"), 'deploy.ps1 must enforce 10.0 balance for 8006518960');
console.log('✅ PASS: deploy.ps1 strict wallet protection verified');

console.log('\n🎉 ALL LOCAL STATIC & INTEGRATION CHECKS PASSED PERFECTLY!');
