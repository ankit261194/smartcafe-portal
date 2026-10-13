// =======================================================================
// AUTHENTIC SERVICE FORM SCHEMAS & DOCUMENT UPLOAD SPECIFICATIONS
// Real-World Requirements for Government Portal Forms & e-District Suites
// =======================================================================

export const SERVICE_FORM_SCHEMAS = {
  // ---------------------------------------------------------------------
  // 1. प्रमाण पत्र (Certificates)
  // ---------------------------------------------------------------------
  'आय प्रमाण पत्र (Income Certificate)': {
    id: 'income_cert',
    dept: 'राजस्व परिषद उत्तर प्रदेश (e-District Revenue)',
    bannerText: 'तहसीलदार द्वारा जारी आधिकारिक आय प्रमाण पत्र (3 वर्ष वैधता)',
    docsRequired: [
      { id: 'photo', label: 'आवेदक की रंगीन पासपोर्ट फोटो (White/Light Background)', required: true, accept: 'image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (Front & Back साफ स्कैन)', required: true, accept: '.pdf,image/*' },
      { id: 'ration_parivar', label: 'राशन कार्ड या परिवार रजिस्टर की नकल', required: true, accept: '.pdf,image/*' },
      { id: 'declaration', label: 'स्वप्रमाणित घोषणा पत्र (Self-Declaration)', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'applicantNameHindi', label: 'आवेदक का नाम (हिंदी में)', type: 'text', placeholder: 'आवेदक का नाम (हिंदी में)', required: true },
      { id: 'applicantName', label: 'आवेदक का नाम (अंग्रेजी में)', type: 'text', placeholder: 'APPLICANT FULL NAME', required: true },
      { id: 'fatherHusbandName', label: 'पिता / पति / संरक्षक का नाम', type: 'text', placeholder: 'पिता / पति / संरक्षक का नाम', required: true },
      { id: 'motherName', label: 'माता का नाम', type: 'text', placeholder: 'माता का नाम', required: true },
      { id: 'villageMohalla', label: 'मकान नं. / ग्राम / मोहल्ला', type: 'text', placeholder: 'मकान नं. / ग्राम / मोहल्ला दर्ज करें', required: true },
      { id: 'postOffice', label: 'डाकघर (Post Office)', type: 'text', placeholder: 'डाकघर का नाम दर्ज करें', required: true },
      { id: 'tehsil', label: 'तहसील (Tehsil)', type: 'text', placeholder: 'तहसील का नाम दर्ज करें', required: true },
      { id: 'district', label: 'जनपद (District)', type: 'text', placeholder: 'जनपद का नाम दर्ज करें', required: true },
      { id: 'occupation', label: 'परिवार का मुख्य व्यवसाय', type: 'select', options: ['कृषि (Agriculture)', 'मजदूरी (Daily Labour)', 'व्यापार / दुकान (Business)', 'प्राइवेट नौकरी (Private Job)', 'पेंशनर / अन्य'], required: true },
      { id: 'familyMembers', label: 'परिवार में कुल सदस्य संख्या', type: 'number', placeholder: 'सदस्य संख्या दर्ज करें', required: true },
      { id: 'annualIncome', label: 'प्रत्याशित वार्षिक आय (₹ में)', type: 'select', options: ['₹42,000/- (बयालीस हजार रुपये)', '₹48,000/- (अड़तालीस हजार रुपये)', '₹60,000/- (साठ हजार रुपये)', '₹72,000/- (बहत्तर हजार रुपये)', '₹96,000/- (छियानबे हजार रुपये)'], required: true },
      { id: 'aadhaarNo', label: '12-अंकीय आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
      { id: 'rationCardNo', label: 'राशन कार्ड संख्या (यदि हो)', type: 'text', placeholder: 'राशन कार्ड नंबर दर्ज करें', required: false },
      { id: 'reason', label: 'प्रमाण पत्र बनवाने का कारण', type: 'select', options: ['छात्रवृत्ति / स्कॉलरशिप आवेदन', 'कॉलेज / स्कूल एडमिशन', 'सरकारी योजना / राशन कार्ड', 'बैंक लोन / सरकारी कार्य'], required: true }
    ]
  },

  'जाति प्रमाण पत्र (Caste Certificate)': {
    id: 'caste_cert',
    dept: 'राजस्व परिषद उत्तर प्रदेश (e-District Revenue)',
    bannerText: 'OBC / SC / ST जाति प्रमाण पत्र (सक्षम अधिकारी तहसीलदार)',
    docsRequired: [
      { id: 'photo', label: 'आवेदक की रंगीन पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (Front व Back)', required: true, accept: '.pdf,image/*' },
      { id: 'old_caste_khatauni', label: 'पुराना जाति प्रमाण पत्र / खतौनी / परिवार रजिस्टर', required: true, accept: '.pdf,image/*' },
      { id: 'declaration', label: 'स्वप्रमाणित घोषणा पत्र', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'applicantNameHindi', label: 'आवेदक का नाम (हिंदी में)', type: 'text', placeholder: 'आवेदक का नाम (हिंदी में)', required: true },
      { id: 'applicantName', label: 'आवेदक का नाम (अंग्रेजी में)', type: 'text', placeholder: 'APPLICANT FULL NAME', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'पिता का नाम', required: true },
      { id: 'motherName', label: 'माता का नाम', type: 'text', placeholder: 'माता का नाम', required: true },
      { id: 'casteCategory', label: 'जाति वर्ग (Category)', type: 'select', options: ['अन्य पिछड़ा वर्ग (OBC)', 'अनुसूचित जाति (SC)', 'अनुसूचित जनजाति (ST)'], required: true },
      { id: 'subCaste', label: 'उप-जाति (Sub-Caste / जाति का नाम)', type: 'text', placeholder: 'उप-जाति दर्ज करें', required: true },
      { id: 'villageMohalla', label: 'मकान नं. / ग्राम / मोहल्ला', type: 'text', placeholder: 'मकान नं. / ग्राम / मोहल्ला दर्ज करें', required: true },
      { id: 'tehsil', label: 'तहसील', type: 'text', placeholder: 'तहसील दर्ज करें', required: true },
      { id: 'district', label: 'जनपद', type: 'text', placeholder: 'जनपद दर्ज करें', required: true },
      { id: 'aadhaarNo', label: '12-अंकीय आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
      { id: 'priorCertIssued', label: 'क्या परिवार में पूर्व में किसी का जाति प्रमाण पत्र जारी हुआ है?', type: 'select', options: ['हाँ (पूर्व में जाति प्रमाण पत्र जारी है)', 'नहीं (प्रथम बार आवेदन है)'], required: true }
    ]
  },

  'निवास प्रमाण पत्र (Domicile/Niwas)': {
    id: 'niwas_cert',
    dept: 'राजस्व परिषद उत्तर प्रदेश (e-District Revenue)',
    bannerText: 'मूल निवास प्रमाण पत्र (तहसीलदार / उपजिलाधिकारी)',
    docsRequired: [
      { id: 'photo', label: 'आवेदक की पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड', required: true, accept: '.pdf,image/*' },
      { id: 'residence_proof', label: 'बिजली बिल / राशन कार्ड / वोटर कार्ड', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'applicantNameHindi', label: 'आवेदक का नाम (हिंदी में)', type: 'text', placeholder: 'आवेदक का नाम (हिंदी में)', required: true },
      { id: 'applicantName', label: 'आवेदक का नाम (अंग्रेजी में)', type: 'text', placeholder: 'APPLICANT FULL NAME', required: true },
      { id: 'fatherHusbandName', label: 'पिता / पति का नाम', type: 'text', placeholder: 'पिता / पति का नाम', required: true },
      { id: 'villageMohalla', label: 'स्थाई निवास पता (मकान नं, ग्राम, पोस्ट)', type: 'text', placeholder: 'मकान नं, ग्राम, पोस्ट', required: true },
      { id: 'tehsil', label: 'तहसील', type: 'text', placeholder: 'तहसील का नाम', required: true },
      { id: 'district', label: 'जनपद', type: 'text', placeholder: 'जनपद का नाम', required: true },
      { id: 'residenceDuration', label: 'निवास की अवधि', type: 'select', options: ['जन्म से (Since Birth)', '10 वर्षों से', '15 वर्षों से', '20 वर्षों से अधिक'], required: true },
      { id: 'purpose', label: 'प्रमाण पत्र बनवाने का उद्देश्य', type: 'select', options: ['सरकारी नौकरी / पुलिस भर्ती', 'उच्च शिक्षा / कॉलेज दाखिला', 'स्कॉलरशिप आवेदन', 'अन्य'], required: true },
      { id: 'aadhaarNo', label: '12-अंकीय आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'EWS प्रमाण पत्र': {
    id: 'ews_cert',
    dept: 'राजस्व विभाग (सामान्य वर्ग 10% आरक्षण)',
    bannerText: 'आर्थिक रूप से कमजोर वर्ग (EWS) प्रमाण पत्र',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'income_cert', label: 'तहसीलदार द्वारा जारी आय प्रमाण पत्र', required: true, accept: '.pdf,image/*' },
      { id: 'khatauni', label: 'खतौनी / कृषि भूमि दस्तावेज (यदि लागू हो)', required: true, accept: '.pdf,image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'applicantName', label: 'आवेदक का पूरा नाम', type: 'text', placeholder: 'आवेदक का पूरा नाम', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'पिता का पूरा नाम', required: true },
      { id: 'generalCaste', label: 'सामान्य जाति (General Caste)', type: 'text', placeholder: 'जाति / उप-जाति दर्ज करें', required: true },
      { id: 'familyAnnualIncome', label: 'कुल पारिवारिक वार्षिक आय', type: 'text', placeholder: 'पारिवारिक वार्षिक आय', required: true },
      { id: 'agriLand', label: 'कृषि भूमि (5 एकड़ से कम)', type: 'select', options: ['हाँ, 5 एकड़ से कम है', 'कोई कृषि भूमि नहीं है'], required: true },
      { id: 'resPlot', label: 'आवासीय भूखंड (1000 वर्ग फुट से कम)', type: 'select', options: ['हाँ, 1000 वर्ग फुट से कम है', 'कोई आवासीय प्लॉट नहीं है'], required: true },
      { id: 'villageDistrict', label: 'गाँव, तहसील व जनपद', type: 'text', placeholder: 'ग्राम, तहसील, जनपद', required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  // ---------------------------------------------------------------------
  // 2. आईडी कार्ड व पैन (ID & PAN)
  // ---------------------------------------------------------------------
  'नया पैन कार्ड (New PAN Card)': {
    id: 'new_pan',
    dept: 'आयकर विभाग (Income Tax Department - Form 49A)',
    bannerText: 'NSDL / UTI नया पैन कार्ड (घर के पते पर फिजिकल कार्ड डिलीवरी)',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट साइज रंगीन फोटो (सफेद बैकग्राउंड)', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर (सफेद कागज पर काली स्याही से साफ साइन)', required: true, accept: 'image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (Front & Back दोनों साइड)', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'fullName', label: 'पूरा नाम (आधार कार्ड के अनुसार अंग्रेजी में)', type: 'text', placeholder: 'FULL NAME IN CAPITAL', required: true },
      { id: 'fatherName', label: 'पिता का नाम (कार्ड पर छपने हेतु)', type: 'text', placeholder: 'FATHER FULL NAME', required: true },
      { id: 'motherName', label: 'माता का नाम (ऐच्छिक)', type: 'text', placeholder: 'MOTHER NAME', required: false },
      { id: 'dob', label: 'जन्मतिथि (Date of Birth: DD/MM/YYYY)', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'gender', label: 'लिंग (Gender)', type: 'select', options: ['MALE / पुरुष', 'FEMALE / महिला'], required: true },
      { id: 'aadhaarNo', label: '12-अंकीय आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
      { id: 'email', label: 'ईमेल आईडी (e-PAN PDF प्राप्त करने हेतु)', type: 'text', placeholder: 'yourname@email.com', required: true },
      { id: 'deliveryAddress', label: 'फिजिकल पैन कार्ड डिलीवरी का पूरा पता', type: 'text', placeholder: 'पूरा डाक पता दर्ज करें', required: true },
      { id: 'pincode', label: 'पिन कोड (6-Digit Pincode)', type: 'text', placeholder: '6-अंकीय पिनकोड', required: true }
    ]
  },

  'पैन कार्ड सुधार / रिप्रिंट': {
    id: 'pan_corr',
    dept: 'आयकर विभाग (NSDL/UTI PAN Correction CSF)',
    bannerText: 'खोया हुआ पैन कार्ड रिप्रिंट अथवा नाम/जन्मतिथि/पिता के नाम में सुधार',
    docsRequired: [
      { id: 'old_pan_proof', label: 'पुराना पैन कार्ड (या ई-पैन कॉपी/पैन रसीद)', required: true, accept: '.pdf,image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (सही विवरण सहित)', required: true, accept: '.pdf,image/*' },
      { id: 'photo', label: 'नई पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'नया हस्ताक्षर (Signature)', required: true, accept: 'image/*' }
    ],
    fields: [
      { id: 'panNo', label: '10-अंकीय पुराना पैन नंबर (PAN Number)', type: 'text', placeholder: '10-अंकीय पैन नंबर', required: true },
      { id: 'correctionType', label: 'क्या संशोधन / सुधार कराना है?', type: 'select', options: ['नाम में सुधार', 'पिता के नाम में सुधार', 'जन्मतिथि (DOB) में सुधार', 'फोटो व हस्ताक्षर अपडेट', 'हुबहू नया प्लास्टिक कार्ड (Reprint)'], required: true },
      { id: 'correctName', label: 'सही नाम (अंग्रेजी में)', type: 'text', placeholder: 'CORRECT FULL NAME', required: true },
      { id: 'correctFatherName', label: 'पिता का सही नाम', type: 'text', placeholder: 'CORRECT FATHER NAME', required: true },
      { id: 'correctDob', label: 'सही जन्मतिथि (DD/MM/YYYY)', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'वोटर आईडी कार्ड (Voter Card Form 6)': {
    id: 'voter_card',
    dept: 'भारत निर्वाचन आयोग (Election Commission of India - Form 6)',
    bannerText: '18 वर्ष पूर्ण होने पर नया मतदाता पहचान पत्र (Voter ID Smart Card)',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट साइज रंगीन फोटो', required: true, accept: 'image/*' },
      { id: 'age_proof', label: 'आयु प्रमाण पत्र (10वीं मार्कशीट / आधार कार्ड)', required: true, accept: '.pdf,image/*' },
      { id: 'address_proof', label: 'निवास प्रमाण पत्र (आधार / बिजली बिल / राशन कार्ड)', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'voterNameHindi', label: 'मतदाता का नाम (हिंदी में)', type: 'text', placeholder: 'मतदाता का नाम (हिंदी)', required: true },
      { id: 'voterName', label: 'मतदाता का नाम (अंग्रेजी में)', type: 'text', placeholder: 'VOTER FULL NAME', required: true },
      { id: 'relationType', label: 'नातेदार का प्रकार', type: 'select', options: ['पिता (Father)', 'पति (Husband)', 'माता (Mother)'], required: true },
      { id: 'relativeName', label: 'नातेदार का नाम', type: 'text', placeholder: 'नातेदार का नाम दर्ज करें', required: true },
      { id: 'dob', label: 'जन्मतिथि (आयु 18+ वर्ष अनिवार्य)', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['पुरुष / Male', 'महिला / Female', 'तृतीय लिंग'], required: true },
      { id: 'assembly', label: 'विधानसभा क्षेत्र का नाम व संख्या', type: 'text', placeholder: 'विधानसभा क्षेत्र', required: true },
      { id: 'houseAddress', label: 'मकान नंबर, ग्राम/मोहल्ला, पोस्ट व पिन कोड', type: 'text', placeholder: 'मकान नं., ग्राम/मोहल्ला, पोस्ट', required: true },
      { id: 'mobile', label: 'मोबाइल नंबर', type: 'text', placeholder: '10-अंकीय मोबाइल नंबर', required: true }
    ]
  },

  'आयुष्मान भारत कार्ड (Golden Card)': {
    id: 'ayushman_card',
    dept: 'राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA - Ayushman Bharat PM-JAY)',
    bannerText: '₹5 लाख तक के मुफ़्त इलाज वाला आयुष्मान भारत गोल्डन कार्ड',
    docsRequired: [
      { id: 'ration_pmletter', label: 'राशन कार्ड (पात्र गृहस्थी/अंत्योदय) या PM-JAY लेटर', required: true, accept: '.pdf,image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (ओरिजिनल स्कैन)', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'beneficiaryName', label: 'लाभार्थी का नाम', type: 'text', placeholder: 'लाभार्थी का पूरा नाम दर्ज करें', required: true },
      { id: 'idType', label: 'पहचान का आधार', type: 'select', options: ['राशन कार्ड संख्या', 'PM-JAY HHID संख्या / लेटर', 'आधार संख्या (e-KYC)'], required: true },
      { id: 'idNumber', label: 'पहचान संख्या दर्ज करें', type: 'text', placeholder: 'पहचान संख्या दर्ज करें', required: true },
      { id: 'familyHead', label: 'परिवार के मुखिया का नाम', type: 'text', placeholder: 'परिवार के मुखिया का नाम दर्ज करें', required: true },
      { id: 'district', label: 'जनपद व राज्य', type: 'text', placeholder: 'जनपद व राज्य दर्ज करें', required: true }
    ]
  },

  // ---------------------------------------------------------------------
  // 3. सरकारी नौकरी (Sarkari Jobs)
  // ---------------------------------------------------------------------
  'SSC GD Constable 2026': {
    id: 'ssc_gd',
    dept: 'कर्मचारी चयन आयोग (Staff Selection Commission)',
    bannerText: 'SSC GD कांस्टेबल (BSF, CISF, CRPF, SSB, ITBP, AR, SSF) भर्ती 2026',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट साइज फोटो (बिना चश्मा व बिना टोपी)', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर (साफ सफेद कागज पर काली स्याही)', required: true, accept: 'image/*' },
      { id: 'marksheet10', label: '10वीं (हाईस्कूल) मार्कशीट', required: true, accept: '.pdf,image/*' },
      { id: 'caste_cert', label: 'जाति प्रमाण पत्र (यदि OBC/SC/ST/EWS हों)', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'candidateName', label: 'अभ्यर्थी का पूरा नाम (10वीं मार्कशीट अनुसार)', type: 'text', placeholder: 'CANDIDATE FULL NAME', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'FATHER FULL NAME', required: true },
      { id: 'motherName', label: 'माता का नाम', type: 'text', placeholder: 'MOTHER FULL NAME', required: true },
      { id: 'dob', label: 'जन्मतिथि (DD/MM/YYYY)', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['MALE / पुरुष', 'FEMALE / महिला'], required: true },
      { id: 'category', label: 'आरक्षण श्रेणी', type: 'select', options: ['UR (सामान्य)', 'OBC (अन्य पिछड़ा वर्ग)', 'SC', 'ST', 'EWS'], required: true },
      { id: 'tenthRollNo', label: '10वीं रोल नंबर', type: 'text', placeholder: '10वीं रोल नंबर', required: true },
      { id: 'tenthBoard', label: '10वीं बोर्ड का नाम', type: 'text', placeholder: 'UP Board / CBSE / ICSE', required: true },
      { id: 'tenthYear', label: '10वीं उत्तीर्ण वर्ष', type: 'text', placeholder: 'उत्तीर्ण वर्ष', required: true },
      { id: 'tenthMarks', label: '10वीं प्राप्तांक व प्रतिशत', type: 'text', placeholder: 'प्राप्तांक / पूर्णांक व %', required: true },
      { id: 'heightCm', label: 'शारीरिक ऊंचाई (सेमी में)', type: 'text', placeholder: 'ऊंचाई (सेमी में) दर्ज करें', required: true },
      { id: 'examCenterPref', label: 'परीक्षा केंद्र 3 पसंदीदा शहर', type: 'text', placeholder: 'पसंदीदा शहर 1, 2, 3', required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'रेलवे NTPC / Group D Form': {
    id: 'railway_ntpc',
    dept: 'रेलवे भर्ती बोर्ड (Railway Recruitment Control Board - RRB)',
    bannerText: 'RRB रेलवे गैर-तकनीकी (NTPC) एवं ग्रुप-D भर्ती ऑनलाइन आवेदन',
    docsRequired: [
      { id: 'photo', label: 'रंगीन पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर', required: true, accept: 'image/*' },
      { id: 'marksheet10', label: '10वीं मार्कशीट', required: true, accept: '.pdf,image/*' },
      { id: 'caste_cert', label: 'जाति प्रमाण पत्र (सेंट्रल फॉर्मेट)', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'candidateName', label: 'अभ्यर्थी का नाम', type: 'text', placeholder: 'CANDIDATE FULL NAME', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'FATHER FULL NAME', required: true },
      { id: 'dob', label: 'जन्मतिथि', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['MALE / पुरुष', 'FEMALE / महिला'], required: true },
      { id: 'category', label: 'श्रेणी (Category)', type: 'select', options: ['UR', 'OBC-NCL', 'SC', 'ST', 'EWS'], required: true },
      { id: 'qualification', label: 'उच्चतम शैक्षणिक योग्यता', type: 'select', options: ['10th Pass (High School)', '12th Pass (Intermediate)', 'Graduate (स्नातक)'], required: true },
      { id: 'tenthRollNo', label: '10वीं रोल नंबर व वर्ष', type: 'text', placeholder: 'रोल नंबर व वर्ष', required: true },
      { id: 'rrbZone', label: 'आवेदन RRB ज़ोन प्राथमिकता', type: 'select', options: ['RRB Prayagraj (Allahabad)', 'RRB Chandigarh', 'RRB Gorakhpur', 'RRB Kolkata', 'RRB Mumbai'], required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'UP / स्टेट पुलिस भर्ती': {
    id: 'police_bharti',
    dept: 'उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड (UPPRPB)',
    bannerText: 'UP पुलिस आरक्षी (Constable) एवं उपनिरीक्षक (SI) भर्ती',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट साइज फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर', required: true, accept: 'image/*' },
      { id: 'marksheet12', label: '12वीं (इंटरमीडिएट) मार्कशीट', required: true, accept: '.pdf,image/*' },
      { id: 'domicile', label: 'उत्तर प्रदेश मूल निवास प्रमाण पत्र', required: true, accept: '.pdf,image/*' },
      { id: 'caste_cert', label: 'जाति प्रमाण पत्र (यदि लागू हो)', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'candidateName', label: 'अभ्यर्थी का पूरा नाम', type: 'text', placeholder: 'CANDIDATE FULL NAME', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'FATHER FULL NAME', required: true },
      { id: 'motherName', label: 'माता का नाम', type: 'text', placeholder: 'MOTHER FULL NAME', required: true },
      { id: 'dob', label: 'जन्मतिथि', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['MALE / पुरुष', 'FEMALE / महिला'], required: true },
      { id: 'category', label: 'वर्ग', type: 'select', options: ['UR', 'OBC', 'SC', 'ST', 'EWS'], required: true },
      { id: 'tenthRoll', label: '10वीं रोल नंबर व प्राप्तांक', type: 'text', placeholder: '10वीं रोल नंबर व अंक', required: true },
      { id: 'twelfthRoll', label: '12वीं रोल नंबर व प्राप्तांक', type: 'text', placeholder: '12वीं रोल नंबर व अंक', required: true },
      { id: 'domicileCertNo', label: 'निवास प्रमाण पत्र क्रमांक', type: 'text', placeholder: 'निवास प्रमाण पत्र क्रमांक', required: true },
      { id: 'casteCertNo', label: 'जाति प्रमाण पत्र क्रमांक (यदि लागू हो)', type: 'text', placeholder: 'जाति प्रमाण पत्र क्रमांक', required: false },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'अन्य सरकारी नौकरी फॉर्म': {
    id: 'sarkari_job_other',
    dept: 'विभिन्न सरकारी भर्ती आयोग (State & Central Govt Jobs)',
    bannerText: 'बैंक, रक्षा, वन विभाग, डाक विभाग व अन्य सरकारी भर्तियां',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर', required: true, accept: 'image/*' },
      { id: 'marksheet', label: 'संबंधित शैक्षणिक मार्कशीट', required: true, accept: '.pdf,image/*' },
      { id: 'id_proof', label: 'आधार कार्ड या अन्य आईडी', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'examPostName', label: 'भर्ती / परीक्षा का नाम व पद', type: 'text', placeholder: 'भर्ती / परीक्षा का नाम व पद', required: true },
      { id: 'candidateName', label: 'अभ्यर्थी का पूरा नाम', type: 'text', placeholder: 'CANDIDATE FULL NAME', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'FATHER FULL NAME', required: true },
      { id: 'dob', label: 'जन्मतिथि', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'qualification', label: 'शैक्षणिक योग्यता', type: 'text', placeholder: '10वीं / 12वीं / स्नातक / आईटीआई / डिप्लोमा', required: true },
      { id: 'category', label: 'वर्ग', type: 'select', options: ['UR', 'OBC', 'SC', 'ST', 'EWS'], required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  // ---------------------------------------------------------------------
  // 4. छात्रवृत्ति व शिक्षा (Scholarship & Education)
  // ---------------------------------------------------------------------
  'UP / स्टेट स्कॉलरशिप फॉर्म': {
    id: 'scholarship_up',
    dept: 'समाज कल्याण / पिछड़ा वर्ग / अल्पसंख्यक कल्याण विभाग',
    bannerText: 'दशमोत्तर एवं पूर्वदशम छात्रवृत्ति व शुल्क प्रतिपूर्ति ऑनलाइन आवेदन',
    docsRequired: [
      { id: 'photo', label: 'छात्र / छात्रा की पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'prev_marksheet', label: 'पिछली कक्षा की मार्कशीट', required: true, accept: '.pdf,image/*' },
      { id: 'fee_receipt', label: 'कॉलेज फीस रसीद (Fee Receipt)', required: true, accept: '.pdf,image/*' },
      { id: 'income_cert', label: 'आय प्रमाण पत्र (Income Certificate)', required: true, accept: '.pdf,image/*' },
      { id: 'caste_cert', label: 'जाति प्रमाण पत्र (यदि OBC/SC/ST हों)', required: false, accept: '.pdf,image/*' },
      { id: 'bank_passbook', label: 'आधार लिंक्ड बैंक पासबुक', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'studentName', label: 'छात्र / छात्रा का पूरा नाम', type: 'text', placeholder: 'छात्र / छात्रा का पूरा नाम', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'पिता का पूरा नाम', required: true },
      { id: 'motherName', label: 'माता का नाम', type: 'text', placeholder: 'माता का पूरा नाम', required: true },
      { id: 'collegeName', label: 'कॉलेज / विद्यालय का नाम व जिला', type: 'text', placeholder: 'कॉलेज / विद्यालय का नाम व जिला', required: true },
      { id: 'courseYear', label: 'पाठ्यक्रम व वर्ष (Course & Year)', type: 'select', options: ['कक्षा 11वीं (11th)', 'कक्षा 12वीं (12th)', 'B.A. (प्रथम / द्वितीय / तृतीय वर्ष)', 'B.Sc. / B.Com.', 'B.Tech / Polytechnic / ITI', 'B.Ed / D.El.Ed / MA / M.Sc'], required: true },
      { id: 'tenthRollYear', label: 'हाईस्कूल रोल नंबर व उत्तीर्ण वर्ष', type: 'text', placeholder: 'रोल नंबर व उत्तीर्ण वर्ष', required: true },
      { id: 'feeAmount', label: 'कॉलेज में जमा नॉन-रिफंडेबल फीस राशि (₹)', type: 'text', placeholder: 'फीस राशि (₹)', required: true },
      { id: 'incomeCertNo', label: 'आय प्रमाण पत्र आवेदन व क्रमांक', type: 'text', placeholder: 'आवेदन व प्रमाण पत्र क्रमांक', required: true },
      { id: 'casteCertNo', label: 'जाति प्रमाण पत्र आवेदन व क्रमांक', type: 'text', placeholder: 'आवेदन व प्रमाण पत्र क्रमांक', required: false },
      { id: 'bankAccount', label: 'बैंक खाता संख्या, बैंक का नाम व IFSC कोड', type: 'text', placeholder: 'खाता संख्या, बैंक व IFSC कोड', required: true },
      { id: 'aadhaarNo', label: '12-अंकीय आधार संख्या (NPCI DBT सक्रिय)', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'यूनिवर्सिटी / कॉलेज एडमिशन फॉर्म': {
    id: 'college_admission',
    dept: 'उच्च शिक्षा विभाग (University & Degree Colleges)',
    bannerText: 'UG / PG डिग्री कॉलेज व यूनिवर्सिटी प्रवेश परीक्षा / मेरिट एडमिशन',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर', required: true, accept: 'image/*' },
      { id: 'marksheet', label: 'पिछली कक्षा की मार्कशीट (12th / UG)', required: true, accept: '.pdf,image/*' },
      { id: 'tc_migration', label: 'TC / माइग्रेशन सर्टिफिकेट (यदि उपलब्ध हो)', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'studentName', label: 'छात्र / छात्रा का नाम', type: 'text', placeholder: 'छात्र / छात्रा का नाम', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'पिता का नाम', required: true },
      { id: 'appliedCourse', label: 'प्रवेश हेतु इच्छित कोर्स', type: 'select', options: ['B.A. (कला संकाय)', 'B.Sc. (विज्ञान - PCM/ZBC)', 'B.Com. (वाणिज्य)', 'M.A. / M.Sc. / M.Com.', 'BBA / BCA / ITI'], required: true },
      { id: 'prevMarks', label: 'पिछली परीक्षा के प्राप्तांक व प्रतिशत', type: 'text', placeholder: 'प्राप्तांक व प्रतिशत दर्ज करें', required: true },
      { id: 'subjectPref', label: 'पसंदीदा मुख्य विषय', type: 'text', placeholder: 'पसंदीदा विषय दर्ज करें', required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'CTET / TET परीक्षा फॉर्म': {
    id: 'ctet_tet',
    dept: 'केंद्रीय माध्यमिक शिक्षा बोर्ड (CBSE CTET / State TET)',
    bannerText: 'केंद्रीय शिक्षक पात्रता परीक्षा (CTET) ऑनलाइन आवेदन',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट रंगीन फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर', required: true, accept: 'image/*' },
      { id: 'training_doc', label: 'B.Ed / D.El.Ed / BTC फाइनल मार्कशीट या एडमिट कार्ड', required: true, accept: '.pdf,image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'candidateName', label: 'अभ्यर्थी का नाम', type: 'text', placeholder: 'अभ्यर्थी का पूरा नाम', required: true },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'पिता का पूरा नाम', required: true },
      { id: 'dob', label: 'जन्मतिथि', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'paperChoice', label: 'आवेदन हेतु पेपर', type: 'select', options: ['Paper 1 (कक्षा 1 से 5 हेतु - प्राथमिक)', 'Paper 2 (कक्षा 6 से 8 हेतु - उच्च प्राथमिक)', 'दोनों पेपर (Paper 1 & Paper 2)'], required: true },
      { id: 'trainingQual', label: 'शिक्षक प्रशिक्षण योग्यता', type: 'select', options: ['D.El.Ed / BTC (2 वर्ष डिप्लोमा)', 'B.Ed (स्नातक शिक्षा)', 'B.El.Ed (4 वर्ष)'], required: true },
      { id: 'passedStatus', label: 'उत्तीर्ण स्थिति', type: 'select', options: ['Passed (उत्तीर्ण)', 'Appearing (अंतिम वर्ष में अध्ययनरत)'], required: true },
      { id: 'lang1', label: 'प्रथम भाषा (Language 1)', type: 'select', options: ['Hindi (हिंदी)', 'English (अंग्रेजी)', 'Sanskrit (संस्कृत)', 'Urdu (उर्दू)'], required: true },
      { id: 'lang2', label: 'द्वितीय भाषा (Language 2)', type: 'select', options: ['English (अंग्रेजी)', 'Sanskrit (संस्कृत)', 'Hindi (हिंदी)', 'Urdu (उर्दू)'], required: true },
      { id: 'centerPref', label: 'परीक्षा केंद्र 3 पसंदीदा शहर', type: 'text', placeholder: 'पसंदीदा शहर 1, 2, 3', required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  // ---------------------------------------------------------------------
  // 5. सरकारी योजनाएं (Govt Schemes & PF)
  // ---------------------------------------------------------------------
  'PM किसान e-KYC / नया रजिस्ट्रेशन': {
    id: 'pm_kisan_reg',
    dept: 'कृषि एवं किसान कल्याण मंत्रालय (PM-KISAN Samman Nidhi)',
    bannerText: 'किसान सम्मान निधि ₹6,000 वार्षिक योजना में नया पंजीकरण या e-KYC',
    docsRequired: [
      { id: 'khatauni', label: 'खेत की प्रमाणित खतौनी (Land Records)', required: true, accept: '.pdf,image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (मोबाइल से लिंक)', required: true, accept: '.pdf,image/*' },
      { id: 'bank_passbook', label: 'बैंक पासबुक की कॉपी', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'farmerName', label: 'किसान का नाम (आधार व खतौनी अनुसार)', type: 'text', placeholder: 'किसान का पूरा नाम', required: true },
      { id: 'fatherHusbandName', label: 'पिता / पति का नाम', type: 'text', placeholder: 'पिता / पति का नाम', required: true },
      { id: 'farmerCategory', label: 'श्रेणी (Category)', type: 'select', options: ['Small & Marginal (1-2 हेक्टेयर)', 'Others (2 हेक्टेयर से अधिक)'], required: true },
      { id: 'district', label: 'जिला व तहसील', type: 'text', placeholder: 'जनपद व तहसील', required: true },
      { id: 'blockVillage', label: 'विकास खंड व गाँव का नाम', type: 'text', placeholder: 'ब्लॉक व ग्राम का नाम', required: true },
      { id: 'khasraKhatauni', label: 'खतौनी खाता संख्या व खसरा/गाटा संख्या', type: 'text', placeholder: 'खाता व गाटा संख्या', required: true },
      { id: 'landArea', label: 'कुल रकबा (क्षेत्रफल हेक्टेयर में)', type: 'text', placeholder: 'रकबा हेक्टेयर में', required: true },
      { id: 'bankDetails', label: 'बैंक खाता संख्या व IFSC कोड', type: 'text', placeholder: 'खाता संख्या व IFSC कोड', required: true },
      { id: 'aadhaarNo', label: 'आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  },

  'PF / EPFO बैलेंस विड्रॉल (Claim)': {
    id: 'pf_claim',
    dept: 'कर्मचारी भविष्य निधि संगठन (EPFO India)',
    bannerText: 'PF एडवांस (Form 31) अथवा फुल सेटलमेंट (Form 19 & 10C) क्लेम',
    docsRequired: [
      { id: 'bank_proof', label: 'बैंक पासबुक या कैंसिल्ड चेक (जिसपर नाम छपा हो)', required: true, accept: '.pdf,image/*' },
      { id: 'aadhaar', label: 'आधार कार्ड (UAN से लिंक्ड)', required: true, accept: '.pdf,image/*' },
      { id: 'pan_card', label: 'पैन कार्ड (यदि निकासी ₹50,000+ हो)', required: false, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'memberName', label: 'कर्मचारी का पूरा नाम', type: 'text', placeholder: 'कर्मचारी का पूरा नाम', required: true },
      { id: 'uanNumber', label: '12-अंकीय UAN नंबर (Universal Account Number)', type: 'text', placeholder: '12-अंकीय UAN संख्या', required: true },
      { id: 'pfMobile', label: 'UAN से लिंक्ड एक्टिव मोबाइल नंबर', type: 'text', placeholder: '10-अंकीय मोबाइल नंबर', required: true },
      { id: 'claimType', label: 'निकासी का प्रकार', type: 'select', options: ['PF एडवांस Form 31 (नौकरी के दौरान निकासी)', 'पूरा PF निकासी Form 19 (कंपनी छोड़ने के बाद)', 'पेंशन निकासी Form 10C'], required: true },
      { id: 'withdrawalReason', label: 'निकासी का उद्देश्य / कारण', type: 'select', options: ['बीमारी का इलाज (Illness)', 'मकान निर्माण / मरम्मत (House Construction)', 'विवाह (Marriage)', 'बेरोजगारी / महामारी आउटब्रेक'], required: true },
      { id: 'claimAmount', label: 'अपेक्षित निकासी धनराशि (₹)', type: 'text', placeholder: 'निकासी धनराशि (₹)', required: true },
      { id: 'bankAccount', label: 'EPFO में दर्ज बैंक खाता संख्या व IFSC कोड', type: 'text', placeholder: 'खाता संख्या व IFSC कोड', required: true }
    ]
  },

  'ड्राइविंग लाइसेंस (Learning DL)': {
    id: 'learning_dl',
    dept: 'सड़क परिवहन एवं राजमार्ग मंत्रालय (Sarathi Parivahan)',
    bannerText: 'लर्निंग ड्राइविंग लाइसेंस (LL) ऑनलाइन स्लॉट व आवेदन',
    docsRequired: [
      { id: 'photo', label: 'पासपोर्ट साइज फोटो', required: true, accept: 'image/*' },
      { id: 'sign', label: 'हस्ताक्षर (साफ साइन)', required: true, accept: 'image/*' },
      { id: 'age_proof', label: 'आयु प्रमाण पत्र (10वीं मार्कशीट / आधार)', required: true, accept: '.pdf,image/*' },
      { id: 'address_proof', label: 'निवास प्रमाण पत्र (आधार कार्ड)', required: true, accept: '.pdf,image/*' }
    ],
    fields: [
      { id: 'applicantName', label: 'आवेदक का पूरा नाम', type: 'text', placeholder: 'आवेदक का पूरा नाम', required: true },
      { id: 'fatherHusbandName', label: 'पिता / पति का नाम', type: 'text', placeholder: 'पिता / पति का नाम', required: true },
      { id: 'dob', label: 'जन्मतिथि (आयु 18+ वर्ष)', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['पुरुष / Male', 'महिला / Female'], required: true },
      { id: 'bloodGroup', label: 'ब्लड ग्रुप (Blood Group)', type: 'select', options: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-', 'अज्ञात (Unknown)'], required: true },
      { id: 'education', label: 'शैक्षणिक योग्यता', type: 'select', options: ['8वीं पास', '10वीं (High School)', '12वीं (Intermediate)', 'स्नातक या उच्च (Graduate)'], required: true },
      { id: 'rtoOffice', label: 'RTO कार्यालय / जनपद', type: 'text', placeholder: 'RTO कार्यालय / जनपद कोड', required: true },
      { id: 'vehicleClass', label: 'वाहन श्रेणी (Vehicle Class)', type: 'select', options: ['MCWG (मोटरसाइकिल / 2-Wheeler)', 'LMV (कार / जीप / 4-Wheeler)', 'MCWG + LMV (मोटरसाइकिल व कार दोनों)'], required: true },
      { id: 'identMark', label: 'पहचान का चिन्ह (तिल, कटा निशान)', type: 'text', placeholder: 'पहचान का स्पष्ट चिन्ह', required: false },
      { id: 'aadhaarNo', label: '12-अंकीय आधार संख्या', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true }
    ]
  }
};
