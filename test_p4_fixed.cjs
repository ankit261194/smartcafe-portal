const https = require('https');
const apiKey = 'f1c563aa08c301c9a7e58796ed4edbced254ea3a674f76fca2bbb1a2429968c5';

const endpoints = [
  { name: 'RC to Father Name', url: `https://authorized.p4points.co.in/api/v1/RcToFatherName.php?apiKey=${apiKey}&vehicalNumber=UP32AB1234` },
  { name: 'RC to Mobile', url: `https://authorized.p4points.co.in/api/v1/Rc_to_mobaile.php?apiKey=${apiKey}&vehicalNumber=UP32AB1234` },
  { name: 'Chassis to RC', url: `https://authorized.p4points.co.in/api/v1/chassis_to_Rc.php?apiKey=${apiKey}&chassisNumber=SB308IN1353235` },
  { name: 'Aadhaar to PAN', url: `https://authorized.p4points.co.in/api/v1/getPanNumber.php?apiKey=${apiKey}&uidNumber=999988887777` },
  { name: 'Voter Verification', url: `https://authorized.p4points.co.in/api/v1/voterVerification_new.php?apiKey=${apiKey}&epicNumber=XYZ1234567` },
  { name: 'Electric Bill PDF', url: `https://authorized.p4points.co.in/api/v1/elctricBillPDF.php?apiKey=${apiKey}&caNumber=102030405060` },
  { name: 'LL Application PDF', url: `https://authorized.p4points.co.in/api/v1/LL_application_pdf.php?apiKey=${apiKey}&idNumber=1234567890` },
  { name: 'AgriStack Farmer PDF (no state)', url: `https://authorized.p4points.co.in/api/v1/AgriStak/approvedFarmersPdf_old_formate_widhout_state.php?apiKey=${apiKey}&uidNumber=999988887777` }
];

async function testFixed() {
  console.log('Testing with exact documented param names...');
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
testFixed();
