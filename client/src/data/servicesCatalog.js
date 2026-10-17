import services79Raw from './services_79.json';

// Comprehensive Category Metadata with Hindi/English, Icons & Color Accents (STRICTLY 79 LIVE SERVICES)
export const SERVICE_CATEGORIES = [
  {
    id: 'aadhaar',
    title: { hi: '🪪 आधार सेवाएं', en: '🪪 Aadhaar Services' },
    icon: 'ShieldCheck',
    color: 'from-red-600 to-rose-700',
    borderColor: 'border-red-200 dark:border-red-900/50',
    lightBg: 'bg-red-50/70 dark:bg-red-950/30',
    desc: { hi: 'आधार एडवांस फिंगरप्रिंट, ओरिजिनल PDF डाउनलोड, बिना OTP आधार, PVC कार्ड व e-KYC', en: 'Aadhaar Advance Fingerprint, Original PDF, No OTP, PVC Card & e-KYC' }
  },
  {
    id: 'pan',
    title: { hi: '💳 पैन कार्ड सेवाएं', en: '💳 PAN Card Hub' },
    icon: 'CreditCard',
    color: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-200 dark:border-blue-900/50',
    lightBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    desc: { hi: 'पैन नंबर सर्च, इंस्टेंट e-PAN PDF, पैन वेरिफिकेशन, पैन-आधार लिंक व GST खोज', en: 'Find PAN by Aadhaar, Instant e-PAN PDF, PAN Verification & GST' }
  },
  {
    id: 'rc',
    title: { hi: '🚗 वाहन व RC सेवाएं', en: '🚗 Vehicle & RC Hub' },
    icon: 'Car',
    color: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    desc: { hi: 'वाहन RC टू PDF / PVC, ई-चालान जांच, चेचिस व इंजन सर्च', en: 'Vehicle RC to PDF/PVC, e-Challan & Chassis Search' }
  },
  {
    id: 'dl',
    title: { hi: '🪪 ड्राइविंग लाइसेंस', en: '🪪 Driving Licence' },
    icon: 'Award',
    color: 'from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200 dark:border-cyan-900/50',
    lightBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    desc: { hi: 'ड्राइविंग लाइसेंस PDF, सारथी DL सर्च व लर्निंग लाइसेंस विवरण', en: 'Driving Licence PDF, Sarathi DL Search & Details' }
  },
  {
    id: 'voter',
    title: { hi: '🗳️ वोटर कार्ड सेवाएं', en: '🗳️ Voter Card Hub' },
    icon: 'Award',
    color: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-200 dark:border-amber-900/50',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    desc: { hi: 'डिजिटल वोटर कार्ड PDF, बिना OTP ओरिजिनल PDF व EPIC सर्च', en: 'Digital Voter Card PDF, Without OTP PDF & EPIC Search' }
  },
  {
    id: 'ration',
    title: { hi: '🌾 राशन कार्ड सेवाएं', en: '🌾 Ration Card Hub' },
    icon: 'FileText',
    color: 'from-lime-600 to-emerald-700',
    borderColor: 'border-lime-200 dark:border-lime-900/50',
    lightBg: 'bg-lime-50/70 dark:bg-lime-950/30',
    desc: { hi: 'राशन कार्ड पर्चा/PDF, राशन विवरण व परिवार सदस्य सूची', en: 'Ration Card PDF/Slip, Ration Details & Member List' }
  },
  {
    id: 'health',
    title: { hi: '🏥 आयुष्मान भारत', en: '🏥 Ayushman Bharat (PM-JAY)' },
    icon: 'ShieldCheck',
    color: 'from-rose-600 to-red-700',
    borderColor: 'border-rose-200 dark:border-rose-900/50',
    lightBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    desc: { hi: 'PM-JAY गोल्डन कार्ड, आयुष्मान कार्ड PDF व ABHA हेल्थ आईडी', en: 'PM-JAY Golden Card, Ayushman Card PDF & ABHA' }
  },
  {
    id: 'welfare',
    title: { hi: '👨‍👩‍👧 समग्र व राज्य कल्याण', en: '👨‍👩‍👧 Samagra & Welfare' },
    icon: 'Layers',
    color: 'from-purple-600 to-indigo-700',
    borderColor: 'border-purple-200 dark:border-purple-900/50',
    lightBg: 'bg-purple-50/70 dark:bg-purple-950/30',
    desc: { hi: 'समग्र आईडी परिवार व सदस्य, संबल कार्ड, RTPS बिहार व ई-श्रम', en: 'Samagra ID, Sambal, RTPS Bihar & e-Shram' }
  },
  {
    id: 'utility',
    title: { hi: '⚡ बिजली बिल व यूटिलिटी', en: '⚡ Electricity & Utility' },
    icon: 'Zap',
    color: 'from-yellow-600 to-amber-700',
    borderColor: 'border-yellow-200 dark:border-yellow-900/50',
    lightBg: 'bg-yellow-50/70 dark:bg-yellow-950/30',
    desc: { hi: 'बिजली बिल भुगतान रसीद व उद्यम रजिस्ट्रेशन प्रमाण पत्र', en: 'Electricity Bill Receipt & Udyam MSME Certificate' }
  },
  {
    id: 'banking',
    title: { hi: '🏦 बैंकिंग व NSDL सेवाएं', en: '🏦 Banking & Financial' },
    icon: 'Zap',
    color: 'from-sky-600 to-blue-700',
    borderColor: 'border-sky-200 dark:border-sky-900/50',
    lightBg: 'bg-sky-50/70 dark:bg-sky-950/30',
    desc: { hi: 'NSDL पेमेंट्स बैंक, NPCI आधार लिंक चेक व बैंक अकाउंट विवरण', en: 'NSDL Bank, NPCI Aadhaar Link Check & Account Details' }
  },
  {
    id: 'agriculture',
    title: { hi: '🚜 किसान व कृषि सेवाएं', en: '🚜 Farmer & Agriculture' },
    icon: 'FileText',
    color: 'from-emerald-600 to-green-700',
    borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    desc: { hi: 'एग्रीस्टैक PDF, किसान सत्यापन व DBT आधार स्टेटस', en: 'AgriStack PDF, Farmer Verification & DBT Status' }
  },
  {
    id: 'lookup',
    title: { hi: '🔍 डिटेल्स सर्च टूल्स', en: '🔍 All Details Search' },
    icon: 'Sparkles',
    color: 'from-violet-600 to-purple-700',
    borderColor: 'border-violet-200 dark:border-violet-900/50',
    lightBg: 'bg-violet-50/70 dark:bg-violet-950/30',
    desc: { hi: 'आधार नंबर टू डिटेल्स, ईमेल टू डिटेल्स व त्वरित सर्च टूल', en: 'Aadhaar to Details, Email to Details & Fast Lookup' }
  },
  {
    id: 'telecom',
    title: { hi: '📱 टेलीकॉम व टूल्स', en: '📱 Telecom & Tools' },
    icon: 'Sparkles',
    color: 'from-teal-600 to-emerald-700',
    borderColor: 'border-teal-200 dark:border-teal-900/50',
    lightBg: 'bg-teal-50/70 dark:bg-teal-950/30',
    desc: { hi: 'ऑपरेटर चेक, रिचार्ज प्लान सर्च व डायनामिक QR जनरेटर', en: 'Check Operator, Recharge Plans & QR Generator' }
  },
  {
    id: 'other',
    title: { hi: 'अन्य सेवाएं', en: 'Other Services' },
    icon: 'Sparkles',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-200 dark:border-amber-900/50',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    desc: { hi: 'PVC क्रॉपर, पासपोर्ट फोटो, 50KB रिसाइज़र, बैंक IFSC, पिनकोड व QR कोड', en: 'PVC Cropper, Passport Photo, 50KB Resizer, Bank IFSC, Pincode & QR' }
  }
];

// Helper to determine group category for services
export function getServiceGroup(cat) {
  if (cat === 'aadhaar') return 'aadhaar';
  if (cat === 'pan') return 'pan';
  if (cat === 'rc') return 'rc';
  if (cat === 'dl') return 'dl';
  if (cat === 'voter') return 'voter';
  if (cat === 'ration') return 'ration';
  if (cat === 'health') return 'health';
  if (cat === 'welfare') return 'welfare';
  if (cat === 'utility') return 'utility';
  if (cat === 'banking') return 'banking';
  if (cat === 'agriculture') return 'agriculture';
  if (cat === 'lookup') return 'lookup';
  if (cat === 'other') return 'other';
  if (cat === 'telecom' || cat === 'misc' || cat === 'edistrict') return 'telecom';
  return cat;
}

// Hindi titles and placeholders mapping for the 79 services
const SERVICE_ENRICHMENT = {
  aadhaar_advance: {
    title: { hi: 'आधार एडवांस (फिंगरप्रिंट)', en: 'Aadhaar Advance (Fingerprint)' },
    sub: { hi: 'बायोमेट्रिक फिंगर से तुरंत आधार कार्ड डाउनलोड', en: 'Instant Aadhaar Download via Fingerprint' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: 'XXXX XXXX 1234', en: 'XXXX XXXX 1234' }
  },
  aadhaar_original_pdf_otp: {
    title: { hi: 'आधार ओरिजिनल PDF (OTP द्वारा)', en: 'Aadhaar Original PDF (OTP)' },
    sub: { hi: 'UIDAI आधिकारिक e-Aadhaar PDF पासवर्ड सहित', en: 'Official UIDAI e-Aadhaar PDF' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_pdf_otp: {
    title: { hi: 'आधार ओरिजिनल PDF (OTP द्वारा)', en: 'Aadhaar Original PDF (OTP)' },
    sub: { hi: 'UIDAI आधिकारिक e-Aadhaar PDF पासवर्ड सहित', en: 'Official UIDAI e-Aadhaar PDF' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_ekyc: {
    title: { hi: 'आधार e-KYC बायोमेट्रिक सत्यापन', en: 'Aadhaar Biometric e-KYC' },
    sub: { hi: 'बायोमेट्रिक फिंगरप्रिंट से UIDAI आधिकारिक डेटा सत्यापन', en: 'Official UIDAI Demographic Data via Fingerprint' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  uid_ekyc: {
    title: { hi: 'आधार e-KYC बायोमेट्रिक सत्यापन', en: 'UID e-KYC Verification' },
    sub: { hi: 'बायोमेट्रिक फिंगरप्रिंट से UIDAI आधिकारिक डेटा सत्यापन', en: 'Official UIDAI Demographic Data via Fingerprint' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_manual: {
    title: { hi: 'आधार मैनुअल CR-80 PVC स्मार्ट कार्ड मेकर', en: 'Aadhaar Manual CR-80 PVC Smart Card Maker' },
    sub: { hi: '85.6mm×54mm ISO लेआउट HD PVC आधार कार्ड मेकर', en: 'ISO CR-80 PVC Smart Card Maker' },
    inputLabel: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' },
    placeholder: { hi: 'आधार नंबर दर्ज करें', en: 'Enter Aadhaar Number' }
  },
  aadhaarCard: {
    title: { hi: 'आधार CR-80 PVC स्मार्ट कार्ड प्रिंट', en: 'Aadhaar CR-80 PVC Smart Card Print' },
    sub: { hi: '85.6mm×54mm ISO लेआउट HD PVC आधार कार्ड मेकर', en: 'ISO CR-80 PVC Smart Card Maker' },
    inputLabel: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' },
    placeholder: { hi: 'आधार नंबर दर्ज करें', en: 'Enter Aadhaar Number' }
  },
  mobile_update_service: {
    title: { hi: 'आधार मोबाइल नंबर लिंक / अपडेट अनुरोध', en: 'Aadhaar Mobile Link / Update' },
    sub: { hi: 'आधार में नया मोबाइल नंबर जोड़ने हेतु अनुरोध प्रेषित करें', en: 'Aadhaar Mobile Link Request' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_to_mobile_find: {
    title: { hi: 'आधार मोबाइल नंबर लिंक / खोज', en: 'Aadhaar Mobile Link / Find' },
    sub: { hi: 'आधार में नया मोबाइल नंबर जोड़ने हेतु अनुरोध प्रेषित करें', en: 'Aadhaar Mobile Link Request' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  dob_update_service: {
    title: { hi: 'आधार जन्मतिथि सुधार आवेदन (DOB Update)', en: 'Aadhaar DOB Update / Correction' },
    sub: { hi: 'आधार कार्ड में जन्मतिथि संशोधन हेतु अधिकृत अनुरोध', en: 'Aadhaar Date of Birth Correction' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  mask_aadhaar: {
    title: { hi: 'मास्क आधार सत्यापन (Mask Aadhaar)', en: 'Mask Aadhaar Verification' },
    sub: { hi: 'UIDAI सुरक्षित मास्क आधार सत्यापन व स्थिति', en: 'UIDAI Masked Aadhaar Verification' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_mask_verification: {
    title: { hi: 'मास्क आधार सत्यापन (Mask Aadhaar)', en: 'Mask Aadhaar Verification' },
    sub: { hi: 'UIDAI सुरक्षित मास्क आधार सत्यापन व स्थिति', en: 'UIDAI Masked Aadhaar Verification' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_original_pdf_no_otp: {
    title: { hi: 'आधार ओरिजिनल PDF (बिना OTP)', en: 'Aadhaar Original PDF (No OTP)' },
    sub: { hi: 'बिना मोबाइल OTP के आधिकारिक आधार PDF डाउनलोड', en: 'Aadhaar PDF Download Without Mobile OTP' },
    inputLabel: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_otp_kyc: {
    title: { hi: 'आधार OTP KYC सत्यापन', en: 'Aadhaar OTP KYC' },
    sub: { hi: 'तुरंत आधार विवरण व फोटो सत्यापन', en: 'Instant Aadhaar Details & Photo Verification' },
    inputLabel: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' },
    placeholder: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' }
  },
  aadhaar_pvc: {
    title: { hi: 'आधार CR-80 PVC स्मार्ट कार्ड', en: 'Aadhaar CR-80 PVC Smart Card' },
    sub: { hi: '85.6mm×54mm ISO लेआउट HD PVC कार्ड', en: '85.6mm×54mm ISO Layout HD PVC Card' },
    inputLabel: { hi: '12-अंकीय आधार नंबर', en: '12-Digit Aadhaar Number' },
    placeholder: { hi: 'आधार नंबर दर्ज करें', en: 'Enter Aadhaar Number' }
  },
  pan_find: {
    title: { hi: 'पैन नंबर सर्च (Find PAN)', en: 'Find PAN Number' },
    sub: { hi: 'आधार नंबर या नाम से खोया हुआ पैन नंबर प्राप्त करें', en: 'Retrieve Lost PAN Number by Aadhaar' },
    inputLabel: { hi: '12-अंकीय आधार नंबर या नाम', en: '12-Digit Aadhaar or Name' },
    placeholder: { hi: 'आधार नंबर दर्ज करें', en: 'Enter Aadhaar Number' }
  },
  pan_details: {
    title: { hi: 'पैन कार्ड वेरिफिकेशन व विवरण', en: 'PAN Verification & Details' },
    sub: { hi: 'NSDL/UTI एक्टिव स्टेटस व धारक का नाम', en: 'NSDL/UTI Active Status & Holder Name' },
    inputLabel: { hi: '10-अक्षरों का PAN नंबर दर्ज करें', en: 'Enter 10-Character PAN' },
    placeholder: { hi: 'जैसे ABCDE1234F', en: 'e.g. ABCDE1234F' }
  },
  rc_pdf_download: {
    title: { hi: 'वाहन RC टू PDF / PVC स्मार्ट कार्ड', en: 'Vehicle RC to PDF / PVC' },
    sub: { hi: 'परिवहन MoRTH आधिकारिक वाहन RC प्रमाण पत्र', en: 'Official MoRTH Parivahan RC Certificate' },
    inputLabel: { hi: 'गाड़ी नंबर दर्ज करें (Registration No)', en: 'Vehicle Registration Number' },
    placeholder: { hi: 'गाड़ी नंबर दर्ज करें (जैसे DL01AB1234)', en: 'Enter Vehicle Registration Number' }
  },
  rc_to_details: {
    title: { hi: 'वाहन RC विवरण व मालिक का नाम', en: 'Vehicle RC Full Details' },
    sub: { hi: 'गाड़ी मालिक, मॉडल, बीमा व फिटनेस विवरण', en: 'Owner Name, Model, Insurance & Fitness' },
    inputLabel: { hi: 'गाड़ी नंबर दर्ज करें', en: 'Enter Vehicle Number' },
    placeholder: { hi: 'गाड़ी नंबर दर्ज करें', en: 'Enter Vehicle Number' }
  },
  chalan_find: {
    title: { hi: 'वाहन ई-चालान जांच एवं रसीद', en: 'e-Challan Search & Receipt' },
    sub: { hi: 'ट्रैफिक चालान स्टेटस, बकाया राशि व कोर्ट विवरण', en: 'Traffic Challan Amount & Pending Status' },
    inputLabel: { hi: 'गाड़ी नंबर या चालान नंबर', en: 'Vehicle or Challan Number' },
    placeholder: { hi: 'गाड़ी नंबर या चालान संख्या दर्ज करें', en: 'Enter Vehicle or Challan Number' }
  },
  driving_licence_pdf: {
    title: { hi: 'ड्राइविंग लाइसेंस (DL) PDF डाउनलोड', en: 'Driving Licence PDF' },
    sub: { hi: 'सारथी MoRTH डिजिटल ड्राइविंग लाइसेंस प्रति', en: 'Sarathi MoRTH Digital Driving Licence' },
    inputLabel: { hi: '15-अंकीय DL नंबर दर्ज करें', en: 'Enter 15-Digit DL Number' },
    placeholder: { hi: 'DL नंबर दर्ज करें', en: 'Enter DL Number' }
  },
  voter_pdf: {
    title: { hi: 'डिजिटल वोटर स्मार्ट कार्ड (EPIC PDF)', en: 'Digital Voter Card PDF' },
    sub: { hi: 'निर्वाचन आयोग डिजिटल स्मार्ट पहचान पत्र', en: 'Election Commission Smart Voter Card' },
    inputLabel: { hi: '10-अक्षरों का EPIC वोटर कार्ड नंबर', en: '10-Character EPIC Number' },
    placeholder: { hi: 'EPIC वोटर नंबर दर्ज करें', en: 'Enter EPIC Number' }
  },
  voter_original_pdf_no_otp: {
    title: { hi: 'वोटर ओरिजिनल PDF (बिना OTP)', en: 'Voter Original PDF (No OTP)' },
    sub: { hi: 'बिना मोबाइल OTP के आधिकारिक वोटर कार्ड PDF', en: 'Official Voter Card PDF Without OTP' },
    inputLabel: { hi: 'EPIC वोटर नंबर दर्ज करें', en: 'Enter EPIC Number' },
    placeholder: { hi: 'EPIC नंबर दर्ज करें', en: 'Enter EPIC Number' }
  },
  ration_pdf_by_ration: {
    title: { hi: 'राशन कार्ड पर्चा / PDF (राशन नंबर से)', en: 'Ration Card PDF by Ration No' },
    sub: { hi: 'खाद्य रसद विभाग NFSA अधिकृत राशन पर्ची', en: 'NFSA Food Supplies Official Ration Slip' },
    inputLabel: { hi: 'राशन कार्ड नंबर दर्ज करें', en: 'Enter Ration Card Number' },
    placeholder: { hi: '12-अंकीय राशन कार्ड नंबर', en: '12-Digit Ration Card Number' }
  },
  samagra_service: {
    title: { hi: 'समग्र आईडी परिवार व सदस्य PDF', en: 'Samagra ID Search & PDF' },
    sub: { hi: 'मध्य प्रदेश समग्र सामाजिक सुरक्षा मिशन पर्ची', en: 'MP Samagra Social Security Mission Slip' },
    inputLabel: { hi: 'समग्र परिवार ID या सदस्य ID दर्ज करें', en: 'Enter Samagra Family / Member ID' },
    placeholder: { hi: '9-अंकीय समग्र सदस्य आईडी', en: '9-Digit Member ID' }
  },
  rtps_bihar_pdf: {
    title: { hi: 'RTPS बिहार प्रमाण पत्र PDF', en: 'RTPS Bihar Certificate PDF' },
    sub: { hi: 'सर्विस प्लस बिहार आय, जाति व निवास प्रमाण पत्र', en: 'ServicePlus Bihar Income, Caste & Domicile' },
    inputLabel: { hi: 'आवेदन संदर्भ संख्या (Reference No)', en: 'Application Reference Number' },
    placeholder: { hi: 'जैसे BIPCC/2026/XXXXX', en: 'e.g. BIPCC/2026/XXXXX' }
  },
  electric_bill_pdf_bihar: {
    title: { hi: 'बिजली बिल भुगतान रसीद', en: 'Electricity Bill Receipt' },
    sub: { hi: 'विद्युत वितरण निगम अधिकृत बिल भुगतान रसीद', en: 'State Discom Electricity Payment Slip' },
    inputLabel: { hi: 'उपभोक्ता संख्या (Consumer CA Number)', en: 'Consumer Number (CA Number)' },
    placeholder: { hi: 'उपभोक्ता संख्या दर्ज करें', en: 'Enter Consumer Number' }
  },
  nsdl_bank: {
    title: { hi: 'NSDL पेमेंट्स बैंक सेवा', en: 'NSDL Payments Bank' },
    sub: { hi: 'जीरो बैलेंस बैंक खाता व बैंकिंग पॉइंट सुविधा', en: 'Zero Balance Bank Account Facility' },
    inputLabel: { hi: 'ग्राहक का 10-अंकीय मोबाइल नंबर', en: 'Customer Mobile Number' },
    placeholder: { hi: 'मोबाइल नंबर दर्ज करें', en: 'Enter Mobile Number' }
  },
  bank_ifsc_lookup: {
    title: { hi: 'बैंक IFSC सर्च व शाखा विवरण', en: 'Bank IFSC Code & Branch Finder' },
    sub: { hi: '11-अंकों के IFSC कोड से बैंक शाखा, पता, MICR व UPI विवरण 1-क्लिक में', en: 'Instant Bank Name, Branch, Full Address & MICR by IFSC' },
    inputLabel: { hi: 'बैंक IFSC कोड (11 अक्षर)', en: 'Bank IFSC Code (11 Chars)' },
    placeholder: { hi: 'जैसे SBIN0000123 / PUNB0024000', en: 'e.g. SBIN0000123 / PUNB0024000' }
  },
  pincode_lookup: {
    title: { hi: 'डाकघर पिनकोड सर्च व एड्रेस लोकेटर', en: 'India Post Pincode & Branch Finder' },
    sub: { hi: '6-अंकों के पिनकोड से सभी डाकघरों की सूची, जिला व राज्य विवरण 1-क्लिक में', en: 'Instant Post Offices List, District & State by Pincode' },
    inputLabel: { hi: '6-अंकों का पिनकोड (Pincode)', en: '6-Digit Indian Pincode' },
    placeholder: { hi: 'जैसे 110001 / 201001 / 800001', en: 'e.g. 110001 / 201001 / 800001' }
  },
  qr_generator: {
    title: { hi: 'इंस्टेंट पेमेंट व टोकन QR कोड मेकर', en: 'Instant High-Res QR Code Maker' },
    sub: { hi: 'दुकान काउंटर, रसीद या टोकन के लिए 300 DPI एचडी क्यूआर कोड तुरंत बनाएं', en: '300 DPI High-Res Payment & Tracking QR Code Generator' },
    inputLabel: { hi: 'UPI ID, मोबाइल नंबर या टेक्स्ट', en: 'UPI ID, Mobile or Custom Text' },
    placeholder: { hi: 'जैसे 8006518960@upi या दुकान का नाम', en: 'e.g. 8006518960@upi or Shop Name' }
  },
  sarkari_job_feed: {
    title: { hi: 'लाइव सरकारी नौकरी, एडमिट कार्ड व योजनाएं', en: 'Live Sarkari Jobs, Admit Cards & Results' },
    sub: { hi: 'रोज़ाना निकलने वाले सभी नए सरकारी फॉर्म व एडमिट कार्ड का 24x7 लाइव फीड', en: '24x7 Live Feed of Latest Government Forms & Exams' },
    inputLabel: { hi: 'सर्च कीवर्ड या फ़िल्टर (वैकल्पिक)', en: 'Search Keyword / Filter (Optional)' },
    placeholder: { hi: 'जैसे SSC, Railway, Police, UPSC', en: 'e.g. SSC, Railway, Police, UPSC' }
  },
  pvc_auto_cropper: {
    title: { hi: 'A4 to PVC कार्ड ऑटो-क्रॉपर (CR-80 85.6mm×54mm)', en: 'A4 to PVC Card Auto-Cropper (CR-80)' },
    sub: { hi: 'ई-आधार, वोटर या आयुष्मान A4 PDF/इमेज से 1-क्लिक में फ्रंट व बैक PVC कार्ड बनाएं', en: '1-Click Front & Back ISO CR-80 PVC Card Cropper from A4 PDF/Image' },
    inputLabel: { hi: 'A4 PDF या कार्ड इमेज अपलोड करें', en: 'Upload A4 PDF or Card Image' },
    placeholder: { hi: 'फ़ाइल चुनें', en: 'Choose File' }
  },
  passport_photo_maker: {
    title: { hi: '1-क्लिक पासपोर्ट साइज फोटो मेकर (4x6 शीट / 8 फोटो)', en: '1-Click Passport Photo Maker (4x6 Sheet)' },
    sub: { hi: '1 फोटो अपलोड करने पर तुरंत 6, 8 या 12 पासपोर्ट फोटो (3.5x4.5cm) बॉर्डर के साथ प्रिंट शीट', en: 'Instant 4x6 Printable Sheet with 6, 8 or 12 Bordered Photos' },
    inputLabel: { hi: 'ग्राहक की फोटो अपलोड करें', en: 'Upload Customer Photo' },
    placeholder: { hi: 'फ़ाइल चुनें', en: 'Choose File' }
  },
  govt_form_resizer: {
    title: { hi: 'सरकारी फॉर्म फोटो व साइन रिसाइज़र (20KB - 50KB Exact)', en: 'Govt Form Photo & Sign Resizer (Exact 50KB)' },
    sub: { hi: 'SSC, पुलिस, छात्रवृत्ति व पैन फॉर्म के लिए फोटो व साइन बिना क्वालिटी खोए मनचाहे KB में सेट करें', en: 'Resize & Compress Photo/Sign to Exact 20KB-50KB with Zero Quality Loss' },
    inputLabel: { hi: 'फोटो या हस्ताक्षर अपलोड करें', en: 'Upload Photo or Signature' },
    placeholder: { hi: 'फ़ाइल चुनें', en: 'Choose File' }
  }
};

/**
 * Merge strictly the 79 services with live rates saved by Super Admin
 */
export function getMergedServicesCatalog(liveRates = []) {
  // Map of live rates keyed by service id and num
  const ratesMap = new Map();
  if (Array.isArray(liveRates)) {
    liveRates.forEach(r => {
      if (r.id) ratesMap.set(r.id, r);
      if (r.num) ratesMap.set(`num_${r.num}`, r);
    });
  }

  // Enrich strictly the 79 services (NO old services, NO edistrict)
  const enriched79 = services79Raw.map(s => {
    const live = ratesMap.get(s.id) || ratesMap.get(`num_${s.num}`) || {};
    const enrich = SERVICE_ENRICHMENT[s.id] || {};
    const group = getServiceGroup(s.category);

    const isOtherService = s.category === 'other' || group === 'other' || ['pvc_auto_cropper', 'passport_photo_maker', 'govt_form_resizer', 'bank_ifsc_lookup', 'pincode_lookup', 'qr_generator', 'sarkari_job_feed'].includes(s.id);

    return {
      ...s,
      wholesaleRate: isOtherService ? 0 : (live.wholesaleRate !== undefined ? Number(live.wholesaleRate) : s.wholesaleRate),
      retailRate: isOtherService ? 0 : (live.retailRate !== undefined ? Number(live.retailRate) : s.retailRate),
      isFree: isOtherService || (s.wholesaleRate === 0 && s.retailRate === 0),
      isActive: live.isActive !== undefined ? Boolean(live.isActive) : (s.isActive !== false),
      title: enrich.title || { hi: s.name, en: s.name },
      sub: enrich.sub || { hi: `${s.name} आधिकारिक डिजिटल सेवा`, en: `Official ${s.name} Service` },
      group: group,
      inputLabel: enrich.inputLabel || { hi: 'संदर्भ नंबर / आईडी दर्ज करें', en: 'Enter Reference Number / ID' },
      placeholder: enrich.placeholder || { hi: 'आईडी दर्ज करें', en: 'Enter ID' }
    };
  });

  return enriched79;
}
