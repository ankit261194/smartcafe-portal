const https = require('https');
const apiKey = 'f1c563aa08c301c9a7e58796ed4edbced254ea3a674f76fca2bbb1a2429968c5';

const endpoints = [
  { name: 'RC Details (v4)', url: `https://authorized.p4points.co.in/api/v4/rc-details.php?apiKey=${apiKey}&vehicleNumber=UP32AB1234` },
  { name: 'RC Fast Server (v4)', url: `https://authorized.p4points.co.in/api/v4/rc_fast_server.php?apiKey=${apiKey}&vehicleNumber=UP32AB1234` },
  { name: 'RC to Father Name (v1)', url: `https://authorized.p4points.co.in/api/v1/RcToFatherName.php?apiKey=${apiKey}&vehicleNumber=UP32AB1234` },
  { name: 'Chassis to RC (v1)', url: `https://authorized.p4points.co.in/api/v1/chassis_to_Rc.php?apiKey=${apiKey}&chassis_number=SB308IN1353235` },
  { name: 'RC to Mobile (v1)', url: `https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php?apiKey=${apiKey}&vehicleNumber=UP32AB1234` },
  { name: 'Aadhaar to PAN (v1)', url: `https://authorized.p4points.co.in/api/v1/getPanNumber.php?apiKey=${apiKey}&aadharNumber=999988887777` },
  { name: 'PAN Verification (v1)', url: `https://authorized.p4points.co.in/api/v1/panVerificationPremium.php?apiKey=${apiKey}&panNumber=ABCDE1234F` },
  { name: 'PAN to GST (v1)', url: `https://authorized.p4points.co.in/api/v1/pan_to_gst.php?apiKey=${apiKey}&pan=ABCDE1234F` },
  { name: 'GST to PAN (v1)', url: `https://authorized.p4points.co.in/api/v1/gst_to_pan.php?apiKey=${apiKey}&gst=09AAACH7409R1ZZ` },
  { name: 'DL PDF (v1)', url: `https://authorized.p4points.co.in/api/v1/dlpdf.php?apiKey=${apiKey}&dlNo=UP3220180012345&dob=1995-05-15` },
  { name: 'Voter Verification (v1)', url: `https://authorized.p4points.co.in/api/v1/voterVerification_new.php?apiKey=${apiKey}&epic_no=XYZ1234567` },
  { name: 'Electric Bill PDF (v1)', url: `https://authorized.p4points.co.in/api/v1/elctricBillPDF.php?apiKey=${apiKey}&canumber=102030405060` },
  { name: 'Ration PDF (v1)', url: `https://authorized.p4points.co.in/api/v1/rationPdf.php?apiKey=${apiKey}&rationCardNo=105023456789` },
  { name: 'Aadhaar to Ration PDF (v1)', url: `https://authorized.p4points.co.in/api/v1/aadhar_to_Rationpdf.php?apiKey=${apiKey}&aadhar_number=999988887777` },
  { name: 'NPCI Link Status (v1)', url: `https://authorized.p4points.co.in/api/v1/npci_link_status.php?apiKey=${apiKey}&aadhar_number=999988887777` },
  { name: 'eShram Verification (v1)', url: `https://authorized.p4points.co.in/api/v1/eshramVerification.php?apiKey=${apiKey}&uan=123456789012` },
  { name: 'LL Application PDF (v1)', url: `https://authorized.p4points.co.in/api/v1/LL_application_pdf.php?apiKey=${apiKey}&application_number=1234567&dob=1995-05-15` },
  { name: 'LL Exam Status (v1)', url: `https://authorized.p4points.co.in/api/v1/ll/cheak-status.php?apiKey=${apiKey}&application_number=1234567` },
  { name: 'AgriStack Farmer Details (v1)', url: `https://authorized.p4points.co.in/api/v1/AgriStak/farmer-details.php?apiKey=${apiKey}&uidNumber=999988887777` },
  { name: 'AgriStack Passbook PDF (v1)', url: `https://authorized.p4points.co.in/api/v1/AgriStak/approvedFarmersPdf.php?apiKey=${apiKey}&uidNumber=999988887777` },
  { name: 'AgriStack Status (v1)', url: `https://authorized.p4points.co.in/api/v1/AgriStak/checkStatus.php?apiKey=${apiKey}&uidNumber=999988887777` },
  { name: 'RTPS Bihar Certificate (v1)', url: `https://authorized.p4points.co.in/api/v1/RtpsCertificate-Br.php?apiKey=${apiKey}&appNo=BR123456&name=Ram` },
  { name: 'Instant Voter Mobile Link (v4)', url: `https://authorized.p4points.co.in/api/v4/instant_voter_link.php?apiKey=${apiKey}&epic=XYZ1234567&mobile=8006518960` }
];

async function testAll() {
  console.log('Testing P4Points Live Upstream Endpoints...');
  for (const ep of endpoints) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = https.get(ep.url, { timeout: 8000 }, (r) => {
          let data = '';
          r.on('data', c => data += c);
          r.on('end', () => resolve({ statusCode: r.statusCode, data }));
        });
        req.on('error', e => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')); });
      });
      const preview = res.data.substring(0, 160).replace(/\s+/g, ' ');
      console.log(`[${res.statusCode}] ${ep.name.padEnd(30)} => ${preview}`);
    } catch (e) {
      console.log(`[ERR] ${ep.name.padEnd(30)} => ${e.message}`);
    }
  }
}
testAll();
