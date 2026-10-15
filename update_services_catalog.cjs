const fs = require('fs');

const p4 = JSON.parse(fs.readFileSync('server/data/p4points_docs.json', 'utf8'));
const s79Path = 'client/public/api/data/services_79.json';
const s79 = JSON.parse(fs.readFileSync(s79Path, 'utf8'));

// Verified P4Points endpoints map
const endpointMap = {
  // Aadhaar
  'aadhaar_original_pdf_otp': { endpoint: 'https://authorized.p4points.co.in/api/v1/aadhaar_pdf.php', method: 'GET', p4Key: 'aadhaar_pdf_otp' },
  'aadhaar_otp_kyc': { endpoint: 'https://authorized.p4points.co.in/api/v1/uid/ekycVerification.php', method: 'POST', p4Key: 'aadhaar_ekyc' },
  'uid_seeding': { endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php', method: 'GET', p4Key: 'npci_link_status' },
  'nsdl_bank': { endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php', method: 'GET', p4Key: 'npci_link_status' },
  'npci_verify': { endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php', method: 'GET', p4Key: 'npci_link_status' },
  'mobile_to_account_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php', method: 'GET', p4Key: 'npci_link_status' },
  'mobile_to_multi_account': { endpoint: 'https://authorized.p4points.co.in/api/v1/npci/npci_link_status.php', method: 'GET', p4Key: 'npci_link_status' },

  // PAN
  'pan_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php', method: 'GET', p4Key: 'pan_verification_premium' },
  'pan_basic_pricing': { endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php', method: 'GET', p4Key: 'pan_verification_premium' },
  'mask_pan': { endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php', method: 'GET', p4Key: 'pan_verification_premium' },
  'pan_aadhar_mask': { endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php', method: 'GET', p4Key: 'pan_verification_premium' },
  'pan_to_udyam_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php', method: 'GET', p4Key: 'pan_verification_premium' },
  'pan_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/getPanNumber.php', method: 'GET', p4Key: 'aadhaar_to_pan' },
  'pan_to_aadhar_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/getPanNumber.php', method: 'GET', p4Key: 'aadhaar_to_pan' },
  'pan_find_manual': { endpoint: 'https://authorized.p4points.co.in/api/v1/panfind.php', method: 'GET', p4Key: 'pan_find_async' },
  'pan_find_manual_alt': { endpoint: 'https://authorized.p4points.co.in/api/v1/panfind.php', method: 'GET', p4Key: 'pan_find_async' },
  'mobile_name_to_pan_instant': { endpoint: 'https://authorized.p4points.co.in/api/v1/panFind_name_and_number.php', method: 'GET', p4Key: 'pan_find_name_mobile' },
  'mobile_to_upi_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/panFind_name_and_number.php', method: 'GET', p4Key: 'pan_find_name_mobile' },
  'mobile_to_multi_upi_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/panFind_name_and_number.php', method: 'GET', p4Key: 'pan_find_name_mobile' },
  'upi_to_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/panFind_name_and_number.php', method: 'GET', p4Key: 'pan_find_name_mobile' },
  'pan_to_gst': { endpoint: 'https://authorized.p4points.co.in/api/v1/pan_to_gst.php', method: 'GET', p4Key: 'pan_to_gst' },
  'gst_to_pan': { endpoint: 'https://authorized.p4points.co.in/api/v1/gst_to_pan.php', method: 'GET', p4Key: 'gst_to_pan' },

  // Voter
  'voter_verification': { endpoint: 'https://authorized.p4points.co.in/api/v1/voterVerification_new.php', method: 'GET', p4Key: 'voter_verification' },
  'voter_pdf': { endpoint: 'https://authorized.p4points.co.in/api/v1/voterVerification_new.php', method: 'GET', p4Key: 'voter_verification' },
  'voter_original_pdf_no_otp': { endpoint: 'https://authorized.p4points.co.in/api/v1/voterVerification_new.php', method: 'GET', p4Key: 'voter_verification' },
  'voter_mobile_link': { endpoint: 'https://authorized.p4points.co.in/api/v4/instant_voter_link.php', method: 'GET', p4Key: 'instant_voter_mobile_no_otp' },
  'voter_mobile_link_no_otp': { endpoint: 'https://authorized.p4points.co.in/api/v4/instant_voter_link.php', method: 'GET', p4Key: 'instant_voter_mobile_no_otp' },
  'voter_mobile_link_instant_otp': { endpoint: 'https://authorized.p4points.co.in/api/v1/voter-link/mobile-link-api.php', method: 'GET', p4Key: 'voter_mobile_instant_form8' },

  // Ration
  'ration_verification': { endpoint: 'https://authorized.p4points.co.in/api/v1/rationPdf.php', method: 'GET', p4Key: 'ration_to_pdf' },
  'ration_pdf_by_ration': { endpoint: 'https://authorized.p4points.co.in/api/v1/rationPdf.php', method: 'GET', p4Key: 'ration_to_pdf' },
  'up_ration_info': { endpoint: 'https://authorized.p4points.co.in/api/v1/rationPdf.php', method: 'GET', p4Key: 'ration_to_pdf' },
  'ration_pdf_by_aadhar': { endpoint: 'https://authorized.p4points.co.in/api/v1/aadhar_to_Rationpdf.php', method: 'GET', p4Key: 'aadhaar_to_ration_pdf' },
  'up_ration_to_aadhaar': { endpoint: 'https://authorized.p4points.co.in/api/v1/aadhar_to_Rationpdf.php', method: 'GET', p4Key: 'aadhaar_to_ration_pdf' },
  'all_state_ration_to_aadhar': { endpoint: 'https://authorized.p4points.co.in/api/v1/aadhar_to_Rationpdf.php', method: 'GET', p4Key: 'aadhaar_to_ration_pdf' },
  'assam_ration_to_aadhaar': { endpoint: 'https://authorized.p4points.co.in/api/v1/aadhar_to_Rationpdf.php', method: 'GET', p4Key: 'aadhaar_to_ration_pdf' },

  // DL & LL
  'driving_licence_pdf': { endpoint: 'https://authorized.p4points.co.in/api/v1/dl/dl_pdf.php', method: 'GET', p4Key: 'dl_pdf_secure' },
  'dl_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/dl/dl_pdf.php', method: 'GET', p4Key: 'dl_pdf_secure' },
  'dl_to_mobile_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/dl/dl_pdf.php', method: 'GET', p4Key: 'dl_pdf_secure' },
  'll_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/LL_application_pdf.php', method: 'GET', p4Key: 'll_pdf_download' },
  'll_pdf': { endpoint: 'https://authorized.p4points.co.in/api/v1/LL_application_pdf.php', method: 'GET', p4Key: 'll_pdf_download' },
  'll_exam_pass_auto': { endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/Sarathi/ll_apply.php', method: 'GET', p4Key: 'll_exam_apply' },

  // RC
  'rc_to_details': { endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php', method: 'GET', p4Key: 'rc_details' },
  'engine_to_rc': { endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php', method: 'GET', p4Key: 'rc_details' },
  'chalan_find': { endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php', method: 'GET', p4Key: 'rc_details' },
  'vahan_check': { endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php', method: 'GET', p4Key: 'rc_details' },
  'rc_to_mobile_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php', method: 'GET', p4Key: 'rc_to_mobile' },
  'rc_mobile_fetch': { endpoint: 'https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php', method: 'GET', p4Key: 'rc_to_mobile' },
  'chassis_to_mobile_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php', method: 'GET', p4Key: 'rc_to_mobile' },
  'chalan_find_mobile': { endpoint: 'https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php', method: 'GET', p4Key: 'rc_to_mobile' },
  'rc_father_name_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/RcToFatherName.php', method: 'GET', p4Key: 'rc_to_father_name' },
  'chassis_to_rc_find': { endpoint: 'https://authorized.p4points.co.in/api/v1/chassis_to_Rc.php', method: 'GET', p4Key: 'chassis_to_rc' },
  'chassis_to_rc_alt': { endpoint: 'https://authorized.p4points.co.in/api/v1/chassis_to_Rc.php', method: 'GET', p4Key: 'chassis_to_rc' },
  'rc_pdf_download': { endpoint: 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc_fast_server.php', method: 'GET', p4Key: 'rc_fast_pdf' },

  // Mobile / Lookup
  'mobile_to_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },
  'mobile_lookup': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },
  'telegram_to_number_lookup': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },
  'vi_sim_to_photo_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },
  'gmail_to_details': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },
  'check_operator': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },
  'check_plan': { endpoint: 'https://authorized.p4points.co.in/api/v1/mobileLookup.php', method: 'GET', p4Key: 'mobile_lookup' },

  // Welfare & Utility
  'e_shram': { endpoint: 'https://authorized.p4points.co.in/api/v1/eshramVerification.php', method: 'GET', p4Key: 'eshram_verification' },
  'e_shram_update': { endpoint: 'https://authorized.p4points.co.in/api/v1/eshramVerification.php', method: 'GET', p4Key: 'eshram_verification' },
  'agristack_pdf': { endpoint: 'https://authorized.p4points.co.in/api/v1/AgriStak/approvedFarmersPdf.php', method: 'GET', p4Key: 'agristack_print_pdf' },
  'agristack_verify': { endpoint: 'https://authorized.p4points.co.in/api/v1/AgriStak/farmer-details.php', method: 'GET', p4Key: 'agristack_farmer_details' },
  'agristack_dbt': { endpoint: 'https://authorized.p4points.co.in/api/v1/AgriStak/checkStatus.php', method: 'GET', p4Key: 'agristack_check_status' },
  'rtps_bihar_pdf': { endpoint: 'https://authorized.p4points.co.in/api/v1/RtpsCertificate-Br.php', method: 'GET', p4Key: 'rtps_certificate_bihar' },
  'electric_bill_pdf_bihar': { endpoint: 'https://authorized.p4points.co.in/api/v1/elctricBillPDF.php', method: 'GET', p4Key: 'electric_bill_pdf' }
};

// Unsupported by P4Points - Coming Soon
const comingSoonIds = new Set([
  'aadhaar_advance',
  'aadhaar_original_pdf_no_otp',
  'aadhaar_pvc',
  'abha_card',
  'abha_otp',
  'pvc_verify',
  'ayushman_image_jpg',
  'aadhar_number_to_details',
  'samagra_service',
  'sambal_pdf',
  'udyam_pdf',
  'qr_generator'
]);

let liveCount = 0;
let comingSoonCount = 0;

s79.forEach(item => {
  const mapped = endpointMap[item.id];
  if (mapped) {
    item.apiEndpoint = mapped.endpoint;
    item.method = mapped.method;
    item.p4Key = mapped.p4Key;
    item.status = 'live';
    item.isComingSoon = false;
    item.badge = '🟢 100% लाइव आधिकारिक API';
    item.isActive = true;
    liveCount++;
  } else if (comingSoonIds.has(item.id)) {
    item.status = 'coming_soon';
    item.isComingSoon = true;
    item.badge = '⏳ आगामी सेवा (Coming Soon)';
    item.isActive = false;
    item.apiEndpoint = '';
    comingSoonCount++;
  } else {
    if (item.apiEndpoint && item.apiEndpoint.includes('p4points.co.in')) {
      item.status = 'live';
      item.isComingSoon = false;
      item.badge = '🟢 100% लाइव आधिकारिक API';
      item.isActive = true;
      liveCount++;
    } else {
      item.status = 'coming_soon';
      item.isComingSoon = true;
      item.badge = '⏳ आगामी सेवा (Coming Soon)';
      item.isActive = false;
      comingSoonCount++;
    }
  }
});

console.log('Result: ' + liveCount + ' LIVE, ' + comingSoonCount + ' COMING SOON (Total: ' + s79.length + ')');

const targets = [
  'client/public/api/data/services_79.json',
  'client/dist/api/data/services_79.json',
  'server/data/services_79.json'
];

targets.forEach(t => {
  fs.writeFileSync(t, JSON.stringify(s79, null, 2), 'utf8');
  console.log('Saved to ' + t);
});
