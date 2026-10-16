const fs = require('fs');

const allData = JSON.parse(fs.readFileSync('all_217_analysis.json', 'utf8'));

const targetFiles = [
  'Driving_Licence_Pdf_new.php',
  'Driving_Licence_Pdf.php',
  'dl-download.php',
  'DL_Find.php',
  'DL_to_Mobile.php',
  'e-shram_number_link.php',
  'e-shram_verification.php',
  'eshramaadhar.php',
  'Voter_Original_PDF.php',
  'Voter_ORIGINAL_PDF_DOWNLOAD.php',
  'Voter_Mobile_Link.php',
  'voter_number_chek.php',
  'Rc_Verify.php',
  'Rc_Verify_server.php',
  'Rc_Verify_server_new.php',
  'RC_To_Mobaile.php',
  'Mobaile_To_RC.php',
  'chassis_to_Rc.php',
  'Ration_Pdf.php',
  'Ration_Pdf_by_aadhaar.php',
  'Ration_uid_find.php',
  'ElectricBill_Details.php',
  'Electric_Bill.php',
  'electricBill_Service.php',
  'PanDetails.php',
  'pan-details.php',
  'panfind.php',
  'pan_mannaul.php',
  'Uid_to_Pdf.php',
  'Uid_to_Pdf_original.php',
  'Uid_to_Details.php',
  'Uid_to_Details3.php',
  'Aadhar_Manual.php',
  'ABHA-Card-Download.php',
  'ABHA-Card-Download_widhoutopt.php',
  'AgrifarmerCardnew.php',
  'Rtps_Certificate.php'
];

for (const tf of targetFiles) {
  const item = allData[tf];
  console.log(`\n=================== [${tf}] ===================`);
  if (!item) {
    console.log('NOT FOUND in analysis');
    continue;
  }
  console.log('Form Fields:', item.formFields.join(', '));
  item.apiLines.forEach(l => console.log(`   L${l.line}: ${l.text}`));
}
