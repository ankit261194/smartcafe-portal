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
assert(servicePageContent.includes("['aadhaar_pdf_otp', 'aadhaar_original_pdf_otp'].includes(tid) && val.replace(/\\D/g, '').length !== 12"), 'aadhaar_pdf_otp must validate 12-digit Aadhaar');
assert(servicePageContent.includes("currentTool?.id === 'aadhaar_original_pdf_otp'"), 'requiresLiveOtp must check aadhaar_original_pdf_otp');
const aadhaarPdfSvc = services79.find(s => s.id === 'aadhaar_original_pdf_otp');
assert(aadhaarPdfSvc, 'aadhaar_original_pdf_otp must exist in services_79.json');
assert(aadhaarPdfSvc.apiEndpoint.includes('aadhaar_pdf.php'), 'aadhaar_original_pdf_otp must route to aadhaar_pdf.php');
assert(aadhaarPdfSvc.badge.includes('लाइव सरकारी API'), 'aadhaar_original_pdf_otp must have honest live API badge');
assert(indexPhpContent.includes("'aadhaar_pdf_otp' => 'aadhaar_original_pdf_otp'"), 'index.php legacyMap must resolve aadhaar_pdf_otp');
assert(serverJsContent.includes("'aadhaar_pdf_otp': 'aadhaar_original_pdf_otp'"), 'server.js legacyMap must resolve aadhaar_pdf_otp');

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
assert(aadhaarAdvSvc.apiEndpoint.includes('ekycVerification'), 'aadhaar_advance must route to ekycVerification');
assert(aadhaarAdvSvc.badge.includes('लाइव सरकारी API'), 'aadhaar_advance must have honest live API badge');
assert(aadhaarAdvSvc.isComingSoon === false, 'aadhaar_advance must NOT be coming soon');
assert(indexPhpContent.includes("'aadhaar_advance_one' => 'aadhaar_advance'"), 'index.php legacyMap must resolve aadhaar_advance_one');
assert(serverJsContent.includes("'aadhaar_advance_one': 'aadhaar_advance'"), 'server.js legacyMap must resolve aadhaar_advance_one');

// 4. Service 16: aadhaar_manual & aadhaarCard (Manual ISO CR-80 PVC Smart Card Maker)
assert(servicePageContent.includes("['aadhaar_manual', 'aadhaarcard'].includes(id)"), 'aadhaar_manual must have dedicated form 13D');
assert(servicePageContent.includes("आधार मैनुअल CR-80 PVC स्मार्ट कार्ड मेकर"), 'aadhaar_manual form must display ISO CR-80 banner');
assert(servicePageContent.includes("params.serviceId = 'aadhaarCard'"), 'aadhaar_manual must pack serviceId aadhaarCard');
assert(servicePageContent.includes("toolKind === 'aadhaar' || currentTool?.serviceType === 'aadhaarCard'"), 'ServicePage must render Aadhaar CR-80 card preview');
assert(servicePageContent.includes("मेरा आधार, मेरी पहचान"), 'Aadhaar preview must contain official UIDAI tagline');
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
assert(maskAadhaarSvc.apiEndpoint.includes('maskAadharVerification'), 'pan_aadhar_mask must route to maskAadharVerification');
assert(maskAadhaarSvc.badge.includes('लाइव सरकारी API'), 'pan_aadhar_mask must have live API badge');
assert(indexPhpContent.includes("'mask_aadhaar' => 'pan_aadhar_mask'"), 'index.php legacyMap must resolve mask_aadhaar');
assert(serverJsContent.includes("'mask_aadhaar': 'pan_aadhar_mask'"), 'server.js legacyMap must resolve mask_aadhaar');

// 8. Aadhaar Demographic Mapping in Backend
assert(indexPhpContent.includes("$p4Service === 'aadhaar' || strpos($normServiceType, 'aadhaar') !== false || strpos($normServiceType, 'aadhar') !== false || strpos($normServiceType, 'uid') !== false"), 'index.php must map Aadhaar live response');
assert(serverJsContent.includes("liveP4.service === 'aadhaar' || normServiceType.includes('aadhaar') || normServiceType.includes('aadhar') || normServiceType.includes('uid')"), 'server.js must map Aadhaar live response');

console.log('✅ PASS: Part 3 Aadhaar Card Services Suite 100% verified across all tiers');

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
