const fs = require('fs');
const path = require('path');

const paths = [
  path.join(__dirname, 'server', 'data', 'services_79.json'),
  path.join(__dirname, 'client', 'public', 'api', 'data', 'services_79.json'),
  path.join(__dirname, 'client', 'src', 'data', 'services_79.json')
];

const newServices = [
  {
    id: 'puc_certificate_download',
    num: 87,
    name: 'PUC Pollution Certificate (वाहन प्रदूषण प्रमाण पत्र)',
    category: 'rc',
    group: 'rc',
    wholesaleRate: 25,
    retailRate: 50,
    isActive: true,
    isComingSoon: false,
    serviceType: 'manual_relay',
    fulfillmentType: 'manual_relay',
    upstreamService: 'puc_services',
    upstreamFile: 'puc.php',
    requiredInputs: ['vehicleNumber'],
    inputMeta: {
      vehicleNumber: { label: 'गाड़ी नंबर (Vehicle Reg No)', placeholder: 'उदा. UP32AB1234', type: 'text' }
    },
    eta: '2-4 घंटे',
    description: 'वाहन प्रदूषण (PUC) जांच प्रमाण पत्र रेखा B2B रिले द्वारा जारी।'
  },
  {
    id: 'pan_aadhaar_link_manual',
    num: 88,
    name: 'PAN Aadhaar Link Service (पैन-आधार लिंक अनुरोध)',
    category: 'pan',
    group: 'pan',
    wholesaleRate: 50,
    retailRate: 100,
    isActive: true,
    isComingSoon: false,
    serviceType: 'manual_relay',
    fulfillmentType: 'manual_relay',
    upstreamService: 'Pan_Number_Link',
    upstreamFile: 'Pan_Number_Link.php',
    requiredInputs: ['panNo', 'aadhaarNo', 'mobile'],
    inputMeta: {
      panNo: { label: '10-अंकीय पैन नंबर (PAN Number)', placeholder: 'उदा. ABCDE1234F', type: 'text' },
      aadhaarNo: { label: '12-अंकीय आधार नंबर (Aadhaar Number)', placeholder: 'उदा. 123456789012', type: 'text' },
      mobile: { label: 'मोबाइल नंबर (Mobile No)', placeholder: 'उदा. 9876543210', type: 'tel' }
    },
    eta: '2-4 घंटे',
    description: 'आयकर विभाग पोर्टल पर पैन-आधार लिंक आवेदन B2B रिले द्वारा।'
  },
  {
    id: 'dob_update_service',
    num: 89,
    name: 'DOB Update / Correction (जन्मतिथि सुधार आवेदन)',
    category: 'aadhaar',
    group: 'aadhaar',
    wholesaleRate: 80,
    retailRate: 150,
    isActive: true,
    isComingSoon: false,
    serviceType: 'manual_relay',
    fulfillmentType: 'manual_relay',
    upstreamService: 'Dob_Update',
    upstreamFile: 'Dob_Update.php',
    requiredInputs: ['aadhaarNo', 'dob', 'mobile'],
    inputMeta: {
      aadhaarNo: { label: 'आधार नंबर (Aadhaar Number)', placeholder: 'उदा. 123456789012', type: 'text' },
      dob: { label: 'सही जन्म तिथि (Correct DOB)', type: 'date' },
      mobile: { label: 'मोबाइल नंबर (Mobile No)', placeholder: 'उदा. 9876543210', type: 'tel' }
    },
    eta: '2-4 घंटे',
    description: 'UIDAI पोर्टल पर जन्मतिथि सुधार/अपडेट अनुरोध B2B रिले द्वारा।'
  }
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    newServices.forEach(ns => {
      const idx = data.findIndex(x => x.id === ns.id);
      if (idx !== -1) {
        data[idx] = { ...data[idx], ...ns };
      } else {
        data.push(ns);
      }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${p}, total services: ${data.length}`);
  }
});
