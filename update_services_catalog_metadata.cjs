const fs = require('fs');

const pathServer = 'server/data/services_79.json';
const pathClient = 'client/public/api/data/services_79.json';

const services = JSON.parse(fs.readFileSync(pathServer, 'utf8'));

const manualRelayMap = {
  'll_exam_pass_auto': {
    name: 'LL Exam Pass / Request (सारथी टेस्ट आवेदन)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'll_exam_Request.php',
    upstreamService: 'LL_Request',
    requiredInputs: ['applicationNumber', 'dob', 'password', 'state'],
    inputMeta: {
      applicationNumber: { label: { hi: 'आवेदन / LL संख्या', en: 'Application / LL Number' }, placeholder: 'उदा. 12345678/2026', type: 'text' },
      dob: { label: { hi: 'जन्म तिथि (DOB)', en: 'Date of Birth' }, placeholder: 'YYYY-MM-DD', type: 'date' },
      password: { label: { hi: 'सारथी पोर्टल पासवर्ड', en: 'Portal Password' }, placeholder: 'सारथी पासवर्ड', type: 'password' },
      state: { label: { hi: 'राज्य (State)', en: 'State' }, placeholder: 'उत्तर प्रदेश / बिहार / अन्य', type: 'state_select' }
    },
    defaultWholesaleRate: 30,
    defaultRetailRate: 80,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  },
  'ayushman_image_jpg': {
    name: 'Ayushman PM-JAY Golden Card (आयुष्मान कार्ड)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'Pmjay_Verify.php',
    upstreamService: 'Ayushman Download',
    requiredInputs: ['uidNumber', 'stateCode'],
    inputMeta: {
      uidNumber: { label: { hi: 'आधार नंबर / PM-JAY आईडी / राशन कार्ड', en: 'Aadhaar / PM-JAY ID / Ration' }, placeholder: '12-अंकीय आधार या राशन नंबर', type: 'text' },
      stateCode: { label: { hi: 'राज्य (State)', en: 'State' }, placeholder: 'राज्य चुनें', type: 'state_select' }
    },
    defaultWholesaleRate: 20,
    defaultRetailRate: 50,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  },
  'e_shram_update': {
    name: 'e-Shram / Aadhaar Mobile Number Link (मोबाइल लिंक)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'e-shram_number_link.php',
    upstreamService: 'Mobile_Update',
    requiredInputs: ['uidNumber', 'dob', 'mobile'],
    inputMeta: {
      uidNumber: { label: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }, placeholder: 'आधार नंबर', type: 'text' },
      dob: { label: { hi: 'जन्म तिथि (DOB)', en: 'Date of Birth' }, placeholder: 'YYYY-MM-DD', type: 'date' },
      mobile: { label: { hi: 'नया मोबाइल नंबर जो लिंक करना है', en: 'New 10-Digit Mobile Number' }, placeholder: '10-अंकीय मोबाइल नंबर', type: 'text' }
    },
    defaultWholesaleRate: 25,
    defaultRetailRate: 60,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  },
  'dl_to_mobile_find': {
    name: 'DL Mobile Number Link / Find (DL मोबाइल लिंक)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'dl_link.php',
    upstreamService: 'DL Mobile Link',
    requiredInputs: ['applicationNumber', 'password', 'state', 'mobile'],
    inputMeta: {
      applicationNumber: { label: { hi: 'DL / आवेदन संख्या', en: 'DL / Application Number' }, placeholder: 'DL नंबर', type: 'text' },
      password: { label: { hi: 'सारथी पासवर्ड', en: 'Password' }, placeholder: 'पासवर्ड', type: 'password' },
      state: { label: { hi: 'राज्य (State)', en: 'State' }, placeholder: 'राज्य', type: 'state_select' },
      mobile: { label: { hi: 'लिंक करने हेतु मोबाइल नंबर', en: 'Mobile Number' }, placeholder: '10-अंकीय मोबाइल', type: 'text' }
    },
    defaultWholesaleRate: 25,
    defaultRetailRate: 60,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  },
  'samagra_service': {
    name: 'Samagra Social Security ID (समग्र आईडी पर्ची)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'familyID_Service.php',
    upstreamService: 'Samagra Print',
    requiredInputs: ['samagraId'],
    inputMeta: {
      samagraId: { label: { hi: '9-अंकीय समग्र सदस्य / परिवार आईडी', en: '9-Digit Samagra Member / Family ID' }, placeholder: '9-अंकीय समग्र आईडी', type: 'text' }
    },
    defaultWholesaleRate: 15,
    defaultRetailRate: 35,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  },
  'sambal_pdf': {
    name: 'Sambal Card PDF (संबल कार्ड डाउनलोड)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'familyID_Service.php',
    upstreamService: 'Samagra Print',
    requiredInputs: ['samagraId'],
    inputMeta: {
      samagraId: { label: { hi: 'समग्र आईडी या संबल नंबर', en: 'Samagra ID or Sambal Number' }, placeholder: '9-अंकीय आईडी', type: 'text' }
    },
    defaultWholesaleRate: 20,
    defaultRetailRate: 50,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  },
  'agristack_pdf': {
    name: 'AgriStack Farmer Card / Land Seeding (भूलेख / किसान कार्ड)',
    fulfillmentType: 'manual_relay',
    upstreamFile: 'AgrifarmerCardstate.php',
    upstreamService: 'Land Seeding',
    requiredInputs: ['farmerId', 'state'],
    inputMeta: {
      farmerId: { label: { hi: 'किसान आईडी / खसरा / आधार संख्या', en: 'Farmer ID / Khasra / Aadhaar' }, placeholder: 'किसान आईडी / खसरा संख्या', type: 'text' },
      state: { label: { hi: 'राज्य (State)', en: 'State' }, placeholder: 'राज्य चुनें', type: 'state_select' }
    },
    defaultWholesaleRate: 30,
    defaultRetailRate: 80,
    badge: '⏳ पेंडिंग रिले (2-4 घंटे)',
    status: 'manual_relay'
  }
};

services.forEach(s => {
  if (manualRelayMap[s.id]) {
    const meta = manualRelayMap[s.id];
    Object.assign(s, meta);
  } else {
    // Instant API services
    s.fulfillmentType = 'instant_api';
    if (!s.status) s.status = 'live';
    if (!s.badge) s.badge = '🟢 लाइव API (Instant 0.5s)';
  }
});

fs.writeFileSync(pathServer, JSON.stringify(services, null, 2), 'utf8');
fs.writeFileSync(pathClient, JSON.stringify(services, null, 2), 'utf8');
console.log('Successfully updated 86 services metadata in both server and client data directories!');
