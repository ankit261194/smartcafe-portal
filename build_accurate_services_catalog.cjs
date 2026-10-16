const fs = require('fs');

const s79 = JSON.parse(fs.readFileSync('server/data/services_79.json', 'utf8'));

// Verified exact mapping from members/*.php and config/function.php
const verifiedCatalog = {
  // ─── 1. AADHAAR SERVICES ───
  'aadhaar_advance': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/uid/ekycVerification',
    method: 'POST',
    p4Key: 'aadhaar_ekyc',
    params: ['apiKey', 'aadhar', 'bioenc'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'fingerprint']
  },
  'aadhaar_original_pdf_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/aadhaar_pdf.php',
    method: 'GET',
    p4Key: 'aadhaar_pdf_otp',
    params: ['apiKey', 'action', 'aadhaar', 'otp'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'otp']
  },
  'aadhaar_original_pdf_no_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/uidai_original.php',
    method: 'GET',
    p4Key: 'uid_to_pdf_original',
    params: ['apiKey', 'aadhar'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'aadhaar_otp_kyc': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/uid/request-otp.php',
    method: 'GET',
    p4Key: 'aadhaar_otp_kyc',
    params: ['apiKey', 'aadhar', 'otp', 'txn_id'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'otp']
  },
  'aadhaar_pvc': {
    endpoint: 'https://authorized.p4points.co.in/api/v2/AadharPdfconvert.php',
    method: 'POST',
    p4Key: 'aadhaar_pvc_convert',
    params: ['apiKey', 'mobile', 'type', 'password'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile', 'file']
  },
  'uid_seeding': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php',
    method: 'GET',
    p4Key: 'npci_link_status',
    params: ['apiKey', 'aadhar'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'pvc_verify': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/uidai_original.php',
    method: 'GET',
    p4Key: 'uid_to_pdf_original',
    params: ['apiKey', 'aadhar'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'aadhar_number_to_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/eshramVerification',
    method: 'GET',
    p4Key: 'uid_to_details',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },

  // ─── 2. HEALTH & ABHA SERVICES ───
  'abha_card': {
    endpoint: 'https://authorized.p4points.co.in/api/v3/abha/abha_card_download.php',
    method: 'GET',
    p4Key: 'abha_card_download',
    params: ['apiKey', 'uidNumber', 'dob'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'dob']
  },
  'abha_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v3/abha/send_otp.php',
    method: 'GET',
    p4Key: 'abha_send_otp',
    params: ['apiKey', 'uidNumber', 'otp'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'otp']
  },
  'ayushman_image_jpg': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/PmjayVerification',
    method: 'GET',
    p4Key: 'pmjay_verification',
    params: ['apiKey', 'pmjayId'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['pmjayId']
  },

  // ─── 3. PAN CARD SERVICES ───
  'pan_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v3/pan-details/pan-details.php',
    method: 'GET',
    p4Key: 'pan_details_v3',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },
  'pan_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/getPanNumber',
    method: 'GET',
    p4Key: 'aadhaar_to_pan',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'pan_find_manual': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panfind.php',
    method: 'GET',
    p4Key: 'pan_find_async',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'pan_find_manual_alt': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panfind.php',
    method: 'GET',
    p4Key: 'pan_find_async',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'pan_to_aadhar_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panAadhar.php',
    method: 'GET',
    p4Key: 'pan_to_aadhaar',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },
  'pan_to_gst': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/pan_to_gst.php',
    method: 'GET',
    p4Key: 'pan_to_gst',
    params: ['apiKey', 'pan'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },
  'gst_to_pan': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/gst_to_pan.php',
    method: 'GET',
    p4Key: 'gst_to_pan',
    params: ['apiKey', 'gst'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['gst']
  },
  'mobile_name_to_pan_instant': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panFind_name_and_number.php',
    method: 'GET',
    p4Key: 'pan_find_name_mobile',
    params: ['apiKey', 'name', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile', 'name']
  },
  'pan_basic_pricing': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium',
    method: 'GET',
    p4Key: 'pan_verification_premium',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },
  'mask_pan': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/maskPanVerification.php',
    method: 'GET',
    p4Key: 'mask_pan_verification',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },
  'pan_aadhar_mask': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/maskAadharVerification',
    method: 'GET',
    p4Key: 'mask_aadhaar_verification',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },
  'pan_to_udyam_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium',
    method: 'GET',
    p4Key: 'pan_verification_premium',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },

  // ─── 4. VOTER SERVICES ───
  'voter_verification': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/voterVerification_new.php',
    method: 'GET',
    p4Key: 'voter_verification',
    params: ['apiKey', 'epicNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber']
  },
  'voter_mobile_link': {
    endpoint: 'https://authorized.p4points.co.in/api/v4/instant_voter_link.php',
    method: 'GET',
    p4Key: 'instant_voter_mobile_no_otp',
    params: ['apiKey', 'epic', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber', 'mobile']
  },
  'voter_pdf': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/voter-api/request-pdf.php',
    method: 'GET',
    p4Key: 'voter_pdf_download',
    params: ['apiKey', 'voter_number'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber']
  },
  'voter_original_pdf_no_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/voter-api/request-pdf.php',
    method: 'GET',
    p4Key: 'voter_pdf_download',
    params: ['apiKey', 'voter_number'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber']
  },
  'voter_original_pdf_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/v-Addition/Pdf-Download/api/send-otp.php',
    method: 'GET',
    p4Key: 'voter_pdf_otp',
    params: ['apiKey', 'epic_number', 'otp'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber', 'otp']
  },
  'voter_mobile_link_no_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v4/instant_voter_link.php',
    method: 'GET',
    p4Key: 'instant_voter_mobile_no_otp',
    params: ['apiKey', 'epic', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber', 'mobile']
  },
  'voter_mobile_link_instant_otp': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/voter-link/mobile-link-api.php',
    method: 'GET',
    p4Key: 'voter_mobile_instant_form8',
    params: ['apiKey', 'action', 'epic', 'phone', 'otp'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['epicNumber', 'mobile', 'otp']
  },

  // ─── 5. RATION SERVICES ───
  'ration_verification': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/rationPdf.php',
    method: 'GET',
    p4Key: 'ration_to_pdf',
    params: ['apiKey', 'ration_no', 'rationtype'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['rationNumber']
  },
  'ration_pdf_by_ration': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/rationPdf.php',
    method: 'GET',
    p4Key: 'ration_to_pdf',
    params: ['apiKey', 'ration_no', 'rationtype'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['rationNumber']
  },
  'ration_pdf_by_aadhar': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/aadhar_to_Rationpdf.php',
    method: 'GET',
    p4Key: 'aadhaar_to_ration_pdf',
    params: ['apiKey', 'aadhar', 'rationtype'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'up_ration_to_aadhaar': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/Ration2Uid-up',
    method: 'GET',
    p4Key: 'ration_to_aadhaar_up',
    params: ['apiKey', 'rationNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['rationNumber']
  },
  'all_state_ration_to_aadhar': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/Ration2Uid-All_state',
    method: 'GET',
    p4Key: 'ration_to_aadhaar_all',
    params: ['apiKey', 'rationNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['rationNumber']
  },
  'assam_ration_to_aadhaar': {
    endpoint: 'https://authorized.p4points.co.in/api/v2/aasham_ration2uid.php',
    method: 'GET',
    p4Key: 'ration_to_aadhaar_assam',
    params: ['apiKey', 'rationNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['rationNumber']
  },
  'up_ration_info': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/ration_full_info_up.php',
    method: 'GET',
    p4Key: 'up_ration_full_info',
    params: ['apiKey', 'rationNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['rationNumber']
  },

  // ─── 6. DRIVING LICENCE (DL) & LEARNER'S (LL) ───
  'driving_licence_pdf': {
    endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/DL/dl_link.php',
    method: 'GET',
    p4Key: 'dl_pdf_secure',
    params: ['apiKey', 'dlNo', 'dob', 'dltype'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['dlNumber', 'dob']
  },
  'dl_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v3/dl/dl_details.php',
    method: 'GET',
    p4Key: 'dl_details_v3',
    params: ['apikey', 'dl', 'dob'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['dlNumber', 'dob']
  },
  'dl_to_mobile_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/dlMobileFind.php',
    method: 'GET',
    p4Key: 'dl_to_mobile',
    params: ['apikey', 'dl', 'dob'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['dlNumber', 'dob']
  },
  'll_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/LL_application_find',
    method: 'GET',
    p4Key: 'll_application_find',
    params: ['apiKey', 'mobileNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'll_pdf': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/LL_application_pdf',
    method: 'GET',
    p4Key: 'll_pdf_download',
    params: ['apiKey', 'idNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['idNumber']
  },
  'll_exam_pass_auto': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/ll/ll_apply.php',
    method: 'GET',
    p4Key: 'll_exam_apply',
    params: ['apiKey', 'application_number', 'date_of_birth', 'password', 'exam_pin', 'state_name'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['applicationNumber', 'dob', 'password', 'exam_pin', 'state']
  },

  // ─── 7. RC (VEHICLE) SERVICES ───
  'rc_to_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/rc-api/rc-details.php',
    method: 'GET',
    p4Key: 'rc_details_v1',
    params: ['apiKey', 'vehicleNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },
  'rc_to_mobile_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php',
    method: 'GET',
    p4Key: 'rc_to_mobile',
    params: ['apiKey', 'vehicalNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },
  'rc_father_name_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/RcToFatherName.php',
    method: 'GET',
    p4Key: 'rc_to_father_name',
    params: ['apiKey', 'vehicalNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },
  'rc_mobile_fetch': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php',
    method: 'GET',
    p4Key: 'rc_to_mobile',
    params: ['apiKey', 'vehicalNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },
  'chassis_to_rc_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/chassis_to_Rc',
    method: 'GET',
    p4Key: 'chassis_to_rc',
    params: ['apiKey', 'chassisNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['chassisNumber']
  },
  'chassis_to_rc_alt': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/chassis_to_Rc',
    method: 'GET',
    p4Key: 'chassis_to_rc',
    params: ['apiKey', 'chassisNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['chassisNumber']
  },
  'engine_to_rc': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/engine_to_rc.php',
    method: 'GET',
    p4Key: 'engine_to_rc',
    params: ['apiKey', 'engine_number'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['engineNumber']
  },
  'chassis_to_mobile_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/chassis_to_Number_find',
    method: 'GET',
    p4Key: 'chassis_to_mobile',
    params: ['apiKey', 'chassisNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['chassisNumber']
  },
  'rc_pdf_download': {
    endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc_fast_server.php',
    method: 'GET',
    p4Key: 'rc_fast_pdf',
    params: ['apiKey', 'rcno', 'type', 'tpe'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },
  'chalan_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/challanVerification.php',
    method: 'GET',
    p4Key: 'challan_verification',
    params: ['apiKey', 'vehicalNo'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },
  'chalan_find_mobile': {
    endpoint: 'https://authorized.p4points.co.in/api/v2/MobileNumberToChallanDetails.php',
    method: 'GET',
    p4Key: 'challan_by_mobile',
    params: ['apiKey', 'mobileNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'vahan_check': {
    endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php',
    method: 'GET',
    p4Key: 'rc_details',
    params: ['apiKey', 'rcno'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['vehicleNumber']
  },

  // ─── 8. LOOKUP & MOBILE INTELLIGENCE ───
  'mobile_to_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php',
    method: 'GET',
    p4Key: 'mobile_lookup',
    params: ['apiKey', 'type', 'value'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'mobile_lookup': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php',
    method: 'GET',
    p4Key: 'mobile_lookup',
    params: ['apiKey', 'type', 'value'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'mobile_to_upi_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobiletoupi.php',
    method: 'GET',
    p4Key: 'mobile_to_upi',
    params: ['apiKey', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'mobile_to_multi_upi_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobiletoMultiupi_Find.php',
    method: 'GET',
    p4Key: 'mobile_to_multi_upi',
    params: ['apiKey', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'mobile_to_account_find': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobaile_to_account.php',
    method: 'GET',
    p4Key: 'mobile_to_account',
    params: ['apiKey', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'mobile_to_multi_account': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobaile_to_multi_bank.php',
    method: 'GET',
    p4Key: 'mobile_to_multi_bank',
    params: ['apiKey', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'upi_to_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/upi_verify.php',
    method: 'GET',
    p4Key: 'vpa_verify',
    params: ['apiKey', 'vpa'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['upi']
  },
  'telegram_to_number_lookup': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php',
    method: 'GET',
    p4Key: 'mobile_lookup',
    params: ['apiKey', 'type', 'value'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['telegram']
  },
  'vi_sim_to_photo_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/vi_sim_details.php',
    method: 'GET',
    p4Key: 'vi_sim_photo',
    params: ['apiKey', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'nsdl_bank': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php',
    method: 'GET',
    p4Key: 'npci_link_status',
    params: ['apiKey', 'aadhar'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'npci_verify': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php',
    method: 'GET',
    p4Key: 'npci_link_status',
    params: ['apiKey', 'aadhar'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'gmail_to_details': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php',
    method: 'GET',
    p4Key: 'mobile_lookup',
    params: ['apiKey', 'type', 'value'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['email']
  },
  'check_operator': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobile_operator_verify',
    method: 'GET',
    p4Key: 'mobile_operator_verify',
    params: ['apiKey', 'mobileNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },
  'check_plan': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php',
    method: 'GET',
    p4Key: 'mobile_lookup',
    params: ['apiKey', 'type', 'value'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['mobile']
  },

  // ─── 9. WELFARE & AGRICULTURE SERVICES ───
  'e_shram': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/eshramVerification',
    method: 'GET',
    p4Key: 'eshram_verification',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'e_shram_update': {
    endpoint: 'https://authorized.p4points.co.in/api/v2/eshram_mobile_update.php',
    method: 'GET',
    p4Key: 'eshram_mobile_update',
    params: ['apiKey', 'uidNumber', 'dob', 'mobile'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'dob', 'mobile']
  },
  'agristack_pdf': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/AgriStak/approvedFarmersPdf.php',
    method: 'GET',
    p4Key: 'agristack_print_pdf',
    params: ['apiKey', 'uidNumber', 'state'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar', 'state']
  },
  'agristack_verify': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/AgriStak/farmer-details.php',
    method: 'GET',
    p4Key: 'agristack_farmer_details',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'agristack_dbt': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/AgriStak/checkStatus.php',
    method: 'GET',
    p4Key: 'agristack_check_status',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'samagra_service': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/Hr_Services/familyVerification',
    method: 'GET',
    p4Key: 'family_verification',
    params: ['apiKey', 'familyId'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['familyId']
  },
  'sambal_pdf': {
    endpoint: 'https://authorized.p4points.co.in/api/v2/sharmadhan_card_details',
    method: 'GET',
    p4Key: 'sharmadhan_card_details',
    params: ['apiKey', 'uidNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['aadhaar']
  },
  'udyam_pdf': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium',
    method: 'GET',
    p4Key: 'pan_verification_premium',
    params: ['apiKey', 'panNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['panNumber']
  },

  // ─── 10. EDISTRICT & UTILITIES ───
  'rtps_bihar_pdf': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/RtpsCertificate-Br.php',
    method: 'GET',
    p4Key: 'rtps_certificate_bihar',
    params: ['apiKey', 'applicationNumber', 'name'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['applicationNumber', 'name']
  },
  'electric_bill_pdf_bihar': {
    endpoint: 'https://authorized.p4points.co.in/api/v1/elctricBillPDF',
    method: 'GET',
    p4Key: 'electric_bill_pdf',
    params: ['apiKey', 'caNumber'],
    isActive: true,
    status: 'live',
    badge: '🟢 लाइव P4 API (Verified)',
    inputs: ['caNumber']
  },

  // ─── 11. BUILT-IN PRODUCTIVITY UTILITIES (100% FREE & SELF-CONTAINED) ───
  'qr_generator': {
    endpoint: 'https://api.qrserver.com/v1/create-qr-code/',
    method: 'GET',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 100% निःशुल्क यूटिलिटी',
    serviceType: 'utility',
    inputs: ['text']
  },
  'bank_ifsc_lookup': {
    endpoint: 'https://ifsc.razorpay.com/',
    method: 'GET',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 100% निःशुल्क यूटिलिटी',
    serviceType: 'utility',
    inputs: ['ifsc']
  },
  'pincode_lookup': {
    endpoint: 'https://api.postalpincode.in/pincode/',
    method: 'GET',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 100% निःशुल्क यूटिलिटी',
    serviceType: 'utility',
    inputs: ['pincode']
  },
  'sarkari_job_feed': {
    endpoint: '/api/sarkari-jobs/feed',
    method: 'GET',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 100% लाइव सरकारी अपडेट',
    serviceType: 'utility',
    inputs: []
  },
  'pvc_auto_cropper': {
    endpoint: '/api/services/execute-automated',
    method: 'POST',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 1-क्लिक CR-80 PVC क्रॉपर',
    serviceType: 'utility',
    inputs: ['file']
  },
  'passport_photo_maker': {
    endpoint: '/api/services/execute-automated',
    method: 'POST',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 1-क्लिक 8-पासपोर्ट फोटो शीट',
    serviceType: 'utility',
    inputs: ['file']
  },
  'govt_form_resizer': {
    endpoint: '/api/services/execute-automated',
    method: 'POST',
    isActive: true,
    isFree: true,
    isComingSoon: false,
    status: 'live',
    badge: '🟢 20KB-50KB फोटो-साइन रिसाइज़र',
    serviceType: 'utility',
    inputs: ['file']
  }
};

let updatedCount = 0;
const updatedServices = s79.map(s => {
  const v = verifiedCatalog[s.id];
  if (v) {
    updatedCount++;
    return {
      ...s,
      apiEndpoint: v.endpoint || s.apiEndpoint,
      method: v.method || s.method,
      isActive: v.isActive !== undefined ? v.isActive : s.isActive,
      isComingSoon: v.isComingSoon !== undefined ? v.isComingSoon : (v.status === 'coming_soon'),
      status: v.status || s.status,
      badge: v.badge || s.badge,
      p4Key: v.p4Key || s.p4Key,
      parameters: v.params || s.parameters || [],
      requiredInputs: v.inputs || s.requiredInputs || []
    };
  }
  return s;
});

console.log('Total catalog entries:', updatedServices.length);
console.log('Updated services with verified P4 mappings:', updatedCount);

fs.writeFileSync('server/data/services_79.json', JSON.stringify(updatedServices, null, 2));
fs.writeFileSync('client/public/api/data/services_79.json', JSON.stringify(updatedServices, null, 2));
console.log('Synchronized services_79.json in both server/data/ and client/public/api/data/');
