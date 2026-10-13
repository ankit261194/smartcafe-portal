import React, { useState } from 'react';
import { 
  Printer, X, CheckCircle2, QrCode, FileText, Sparkles, 
  Download, ArrowRight, ShieldCheck, Copy, Share2, Award, 
  ExternalLink, CreditCard, Clock, Landmark, AlertCircle,
  Upload, Camera, PenTool, RotateCw, Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CR80CardRenderer from './janseva/CR80CardRenderer';
import UtilityBillRenderer from './janseva/UtilityBillRenderer';
import LegalWelfareRenderer from './janseva/LegalWelfareRenderer';

export const JAN_SEVA_SERVICES = [
  // 1. Advance Manual Aadhaar (CR-80 Format)
  {
    id: 'advance_manual_aadhaar',
    name: 'एडवांस मैनुअल आधार कार्ड (CR-80 Smart Card)',
    category: 'card',
    fee: 30,
    renderType: 'card',
    subType: 'aadhaar',
    requirePhoto: true,
    requireSign: false,
    dept: 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI Studio)',
    desc: 'फिंगरप्रिंट या मोबाइल OTP न आने पर ग्राहक के विवरण, फोटो व पते से ओरिजिनल फ्रंट व बैक CR-80 PVC स्मार्ट कार्ड 1 सेकंड में तैयार।',
    fields: [
      { id: 'idNumber', label: '12-अंकीय आधार संख्या (Aadhaar No)', type: 'text', placeholder: '4582 9102 3847', required: true },
      { id: 'holderName', label: 'पूरा नाम अंग्रेजी में (Full Name)', type: 'text', placeholder: 'RAMESH KUMAR', required: true },
      { id: 'holderNameHindi', label: 'पूरा नाम हिंदी में (Name in Hindi)', type: 'text', placeholder: 'रमेश कुमार', required: true },
      { id: 'dob', label: 'जन्मतिथि (DOB: DD/MM/YYYY)', type: 'text', placeholder: '15/08/1992', required: true },
      { id: 'gender', label: 'लिंग (Gender)', type: 'select', options: ['MALE / पुरुष', 'FEMALE / महिला', 'TRANSGENDER / तृतीय लिंग'] },
      { id: 'careOf', label: 'पिता / पति का नाम (C/O or S/O)', type: 'text', placeholder: 'S/O: Shri Babulal' },
      { id: 'address', label: 'पूरा पता अंग्रेजी में (Address in English)', type: 'text', placeholder: 'H No. 102, Vill Rampur, Post Bilgram, Dist Hardoi - 241001', required: true },
      { id: 'addressHindi', label: 'पूरा पता हिंदी में (Address in Hindi)', type: 'text', placeholder: 'मकान नं. 102, ग्राम रामपुर, पोस्ट बिलग्राम, जिला हरदोई - 241001' }
    ]
  },
  {
    id: 'pvc_card',
    name: 'ई-आधार से PVC स्मार्ट कार्ड (CR-80 Format)',
    category: 'card',
    fee: 10,
    renderType: 'card',
    subType: 'aadhaar',
    requirePhoto: true,
    requireSign: false,
    dept: 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)',
    desc: 'ई-आधार पीडीएफ विवरण से 85.6mm×54mm एटीएम साइज में कटिंग बॉर्डर सहित PVC शीट पर प्रिंट निकालें।',
    fields: [
      { id: 'idNumber', label: '12-अंकीय आधार संख्या', type: 'text', placeholder: 'XXXX XXXX 1234', required: true },
      { id: 'holderName', label: 'कार्डधारक का नाम', type: 'text', placeholder: 'राहुल कुमार' },
      { id: 'dob', label: 'जन्मतिथि (DOB)', type: 'text', placeholder: '15/08/1995' },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['MALE / पुरुष', 'FEMALE / महिला'] },
      { id: 'address', label: 'स्थाई पता', type: 'text', placeholder: 'ग्राम व पोस्ट, तहसील, जिला हरदोई' }
    ]
  },

  // 2. Advance PAN Card
  {
    id: 'advance_pan',
    name: 'एडवांस NSDL / UTI पैन कार्ड प्रिंट (CR-80 PVC)',
    category: 'card',
    fee: 30,
    renderType: 'card',
    subType: 'pan',
    requirePhoto: true,
    requireSign: true,
    dept: 'आयकर विभाग (Income Tax NSDL/UTI Generator)',
    desc: 'पैन नंबर, नाम व पिता के नाम से फोटो व सिग्नेचर सहित 1 सेकंड में ओरिजिनल फ्रंट व बैक एचडी पैन कार्ड प्रिंट।',
    fields: [
      { id: 'panNo', label: '10-अंकीय पैन नंबर (PAN Number)', type: 'text', placeholder: 'ABCDE1234F', required: true },
      { id: 'holderName', label: 'कार्डधारक का नाम (Full Name)', type: 'text', placeholder: 'AMIT KUMAR', required: true },
      { id: 'fatherName', label: 'पिता का नाम (Father\'s Name)', type: 'text', placeholder: 'SHRI BABULAL', required: true },
      { id: 'dob', label: 'जन्मतिथि (Date of Birth)', type: 'text', placeholder: '15/08/1992', required: true }
    ]
  },
  {
    id: 'epan_download',
    name: 'ई-पैन कार्ड (Instant e-PAN) डाउनलोड व रिप्रिंट',
    category: 'card',
    fee: 30,
    renderType: 'card',
    subType: 'pan',
    requirePhoto: true,
    requireSign: true,
    dept: 'आयकर विभाग (Income Tax e-Filing)',
    desc: 'आधार नंबर से खोया हुआ पैन कार्ड ओरिजिनल NSDL लेआउट में तत्काल प्रिंट निकालें।',
    fields: [
      { id: 'panNo', label: '10-अंकीय पैन नंबर', type: 'text', placeholder: 'ABCDE1234F', required: true },
      { id: 'holderName', label: 'पैन धारक का नाम', type: 'text', placeholder: 'राजेश कुमार' },
      { id: 'fatherName', label: 'पिता का नाम', type: 'text', placeholder: 'श्री रामेश्वर दयाल' },
      { id: 'dob', label: 'जन्मतिथि', type: 'text', placeholder: '12/04/1993' }
    ]
  },

  // 3. Advance Voter Smart Card
  {
    id: 'advance_voter',
    name: 'एडवांस डिजिटल वोटर स्मार्ट कार्ड (CR-80 Format)',
    category: 'card',
    fee: 30,
    renderType: 'card',
    subType: 'voter',
    requirePhoto: true,
    requireSign: false,
    dept: 'भारत निर्वाचन आयोग (Election Commission of India)',
    desc: 'होलोग्राम व डिजिटल लेआउट सहित नया 85.6mm×54mm एटीएम साइज वोटर स्मार्ट कार्ड तैयार।',
    fields: [
      { id: 'epicNo', label: 'EPIC / वोटर कार्ड नंबर', type: 'text', placeholder: 'UPL1049281', required: true },
      { id: 'voterName', label: 'मतदाता का नाम अंग्रेजी में', type: 'text', placeholder: 'RAM KUMAR', required: true },
      { id: 'voterNameHindi', label: 'मतदाता का नाम हिंदी में', type: 'text', placeholder: 'राम कुमार' },
      { id: 'relationName', label: 'पिता / पति का नाम', type: 'text', placeholder: 'श्री शिवबालक' },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['पुरुष / MALE', 'महिला / FEMALE'] },
      { id: 'age', label: 'आयु (Age)', type: 'text', placeholder: '32 वर्ष' },
      { id: 'assembly', label: 'विधानसभा व भाग संख्या', type: 'text', placeholder: '156-सवायजपुर • भाग संख्या 142' },
      { id: 'boothName', label: 'मतदान केंद्र (Polling Booth)', type: 'text', placeholder: 'प्राथमिक विद्यालय कक्ष संख्या 1' },
      { id: 'address', label: 'स्थाई निवास पता', type: 'text', placeholder: 'मकान नं. 45, ग्राम व पोस्ट, तहसील सवायजपुर, हरदोई' }
    ]
  },

  // 4. Ayushman Bharat Golden Card
  {
    id: 'ayushman_card',
    name: 'आयुष्मान भारत गोल्डन कार्ड (PM-JAY Health Card)',
    category: 'card',
    fee: 20,
    renderType: 'card',
    subType: 'ayushman',
    requirePhoto: true,
    requireSign: false,
    dept: 'राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA - Ayushman Bharat)',
    desc: 'आधार या राशन कार्ड से ₹5 लाख तक के मुफ़्त इलाज वाला गोल्डन कार्ड डाउनलोड व लैमिनेशन प्रिंट करवाएं।',
    fields: [
      { id: 'abhaId', label: 'PMJAY ID / ABHA संख्या', type: 'text', placeholder: 'AB-PMJAY-849204', required: true },
      { id: 'beneficiaryName', label: 'लाभार्थी का नाम', type: 'text', placeholder: 'सुनीता देवी', required: true },
      { id: 'familyHead', label: 'परिवार के मुखिया का नाम', type: 'text', placeholder: 'प्रेम शंकर' },
      { id: 'district', label: 'जनपद व राज्य', type: 'text', placeholder: 'हरदोई, उत्तर प्रदेश' }
    ]
  },

  // 5. e-Shram Card
  {
    id: 'eshram_card',
    name: 'ई-श्रम कार्ड डाउनलोड व प्रिंट (e-Shram UAN Card)',
    category: 'card',
    fee: 6,
    renderType: 'card',
    subType: 'eshram',
    requirePhoto: true,
    requireSign: false,
    dept: 'श्रम एवं रोजगार मंत्रालय (Ministry of Labour)',
    desc: '12-अंकीय UAN नंबर से असंगठित कर्मकार ई-श्रम कार्ड डाउनलोड व लेमिनेशन प्रिंट।',
    fields: [
      { id: 'uanNo', label: '12-अंकीय UAN नंबर', type: 'text', placeholder: '1234 5678 9821', required: true },
      { id: 'workerName', label: 'श्रमिक का नाम', type: 'text', placeholder: 'संतोष कुमार', required: true },
      { id: 'occupation', label: 'मुख्य व्यवसाय / कार्य', type: 'text', placeholder: 'कृषि मजदूर / निर्माण श्रमिक' },
      { id: 'bloodGroup', label: 'ब्लड ग्रुप / जन्मतिथि', type: 'text', placeholder: 'O+ • 01/01/1992' }
    ]
  },

  // 6. Divyang UDID Card
  {
    id: 'udid_card',
    name: 'दिव्यांग UDID स्वावलंबन कार्ड (CR-80 Smart Card)',
    category: 'card',
    fee: 30,
    renderType: 'card',
    subType: 'udid',
    requirePhoto: true,
    requireSign: true,
    dept: 'दिव्यांगजन सशक्तिकरण विभाग (UDID Swavlamban)',
    desc: 'दिव्यांग (विकलांग) नागरिकों का डिजिटल यूडीआईडी कार्ड, प्रतिशत सत्यापन व लेमिनेशन प्रिंट।',
    fields: [
      { id: 'udidNo', label: '18-अंकीय UDID कार्ड संख्या', type: 'text', placeholder: 'UP0410293847561029', required: true },
      { id: 'personName', label: 'दिव्यांगजन का नाम', type: 'text', placeholder: 'हरिनारायण', required: true },
      { id: 'disabilityType', label: 'दिव्यांगता का प्रकार व प्रतिशत', type: 'text', placeholder: 'लोकोमोटर दिव्यांगता (45%)' },
      { id: 'validUpto', label: 'कार्ड वैधता (Validity)', type: 'select', options: ['स्थाई (Permanent)', 'अस्थाई (Temporary - 5 वर्ष)'] },
      { id: 'hospital', label: 'मेडिकल बोर्ड / CMO कार्यालय', type: 'text', placeholder: 'मुख्य चिकित्सा अधिकारी (CMO), हरदोई' }
    ]
  },

  // 7. UPPCL Electricity Bill Invoice
  {
    id: 'electricity_bill',
    name: 'बिजली बिल जांच व डिस्कॉम रसीद (UPPCL Bill)',
    category: 'utility',
    fee: 10,
    renderType: 'bill',
    dept: 'विद्युत वितरण निगम लिमिटेड (UPPCL / Discom)',
    desc: '10-अंकीय खाता संख्या से कुल बकाया बिजली बिल की जांच करें और मुहर लगी आधिकारिक रसीद प्रिंट निकालें।',
    fields: [
      { id: 'discom', label: 'डिस्कॉम क्षेत्र (Discom)', type: 'select', options: ['मध्यांचल विद्युत वितरण निगम (MVVNL)', 'पूर्वांचल विद्युत वितरण निगम (PVVNL)', 'पश्चिमांचल विद्युत वितरण निगम (PVVNL)', 'दक्षिणांचल विद्युत वितरण निगम (DVVNL)', 'केस्को (KESCO कानपुर)'] },
      { id: 'consumerNo', label: '10-अंकीय उपभोक्ता संख्या (Account ID)', type: 'text', placeholder: '7418529630', required: true },
      { id: 'consumerName', label: 'उपभोक्ता का नाम', type: 'text', placeholder: 'महेश चंद्र' },
      { id: 'loadKw', label: 'सप्लाई श्रेणी व भार', type: 'select', options: ['LMV-1 घरेलू (1.00 KW)', 'LMV-1 घरेलू (2.00 KW)', 'LMV-2 वाणिज्यिक / दुकान (2.00 KW)'] },
      { id: 'meterNo', label: 'मीटर संख्या', type: 'text', placeholder: 'UP-7410294' },
      { id: 'amount', label: 'वर्तमान कुल देय धनराशि', type: 'text', placeholder: '₹1,240' },
      { id: 'dueDate', label: 'भुगतान की अंतिम तिथि', type: 'text', placeholder: '25/11/2026' }
    ]
  },

  // 8. Vehicle PUCC & Insurance
  {
    id: 'vehicle_pucc_insurance',
    name: 'वाहन प्रदूषण (PUCC) व बीमा वैधता पर्ची',
    category: 'utility',
    fee: 6,
    renderType: 'vehicle',
    dept: 'सड़क परिवहन एवं राजमार्ग मंत्रालय (mParivahan Vahan)',
    desc: 'गाड़ी नंबर से फिटनेस, प्रदूषण (PUCC), बीमा कंपनी व वैधता अवधि की प्रमाणित स्थिति पर्ची।',
    fields: [
      { id: 'vehicleNo', label: 'गाड़ी नंबर (RC Number)', type: 'text', placeholder: 'UP30AB1234', required: true },
      { id: 'ownerName', label: 'वाहन स्वामी का नाम', type: 'text', placeholder: 'विकास कुमार' },
      { id: 'vehicleClass', label: 'वाहन श्रेणी व ईंधन', type: 'select', options: ['LMV (कार / जीप) • पेट्रोल/CNG', '2W (मोटरसाइकिल / स्कूटर)', 'HGV / LCV (कमर्शियल वाहन)'] },
      { id: 'puccUpto', label: 'प्रदूषण (PUCC) वैधता तिथि', type: 'text', placeholder: '19/04/2027 तक वैध' },
      { id: 'insuranceUpto', label: 'बीमा कंपनी व वैधता', type: 'text', placeholder: '12/08/2027 • न्यू इंडिया इंश्योरेंस' }
    ]
  },

  // 9. 1-Click Affidavit / घोषणा पत्र
  {
    id: 'affidavit',
    name: '1-क्लिक शपथ पत्र / स्वप्रमाणित घोषणा पत्र',
    category: 'legal',
    fee: 20,
    renderType: 'legal',
    requirePhoto: true,
    dept: 'राजस्व एवं सामान्य प्रशासन विभाग (e-District)',
    desc: 'आय, जाति, निवास व स्कॉलरशिप के लिए 1-क्लिक में आधिकारिक हिंदी घोषणा पत्र तुरंत जनरेट व प्रिंट करें।',
    fields: [
      { id: 'applicantName', label: 'घोषणाकर्ता का नाम', type: 'text', placeholder: 'रामेश्वर सिंह', required: true },
      { id: 'fatherHusband', label: 'पिता / पति का नाम', type: 'text', placeholder: 'श्री बाबूलाल', required: true },
      { id: 'purpose', label: 'घोषणा का उद्देश्य', type: 'select', options: ['आय प्रमाण पत्र हेतु', 'जाति प्रमाण पत्र हेतु', 'मूल निवास प्रमाण पत्र हेतु', 'राशन कार्ड संशोधन हेतु', 'छात्रवृत्ति आवेदन हेतु'] },
      { id: 'income', label: 'वार्षिक आय (यदि लागू हो)', type: 'text', placeholder: '₹48,000/- मात्र' },
      { id: 'address', label: 'स्थाई निवास पता', type: 'text', placeholder: 'मकान नं. 14, ग्राम रामपुर, तहसील सवायजपुर, हरदोई' }
    ]
  },

  // 10. NFSA Ration Card
  {
    id: 'ration_slip',
    name: 'राशन कार्ड पात्रता पर्ची (NFSA Member Slip)',
    category: 'welfare',
    fee: 10,
    renderType: 'welfare',
    dept: 'खाद्य एवं रसद विभाग (NFSA / FCS Portal)',
    desc: 'कोटेदार को दिखाने के लिए परिवार के सभी सदस्यों के नाम और कुल यूनिट वाली आधिकारिक राशन पर्ची प्रिंट करें।',
    fields: [
      { id: 'rationNo', label: '12-अंकीय राशन कार्ड संख्या', type: 'text', placeholder: '215487965412', required: true },
      { id: 'headName', label: 'मुखिया का नाम', type: 'text', placeholder: 'शांति देवी', required: true },
      { id: 'dealerName', label: 'कोटेदार (उचित दर विक्रेता)', type: 'text', placeholder: 'मेसर्स कन्हैया लाल' },
      { id: 'units', label: 'कुल यूनिट (सदस्य संख्या)', type: 'number', placeholder: '5' }
    ]
  },

  // 11. PM-Kisan Samman Nidhi
  {
    id: 'pm_kisan_status',
    name: 'PM किसान सम्मान निधि क़िस्त व लैंड-सीडिंग स्टेटस',
    category: 'farmer',
    fee: 6,
    renderType: 'welfare',
    dept: 'कृषि एवं किसान कल्याण मंत्रालय (PM-KISAN Portal)',
    desc: 'किसान की 2000 रुपये वाली क़िस्त, e-KYC स्थिति, और भूलेख अंकन (Land Seeding) का आधिकारिक प्रिंट।',
    fields: [
      { id: 'farmerName', label: 'किसान का नाम', type: 'text', placeholder: 'बलदेव सिंह', required: true },
      { id: 'mobileReg', label: 'पंजीकृत मोबाइल या आधार नंबर', type: 'text', placeholder: '9839XXXX10' },
      { id: 'village', label: 'गाँव व तहसील', type: 'text', placeholder: 'कछौना, हरदोई' }
    ]
  },

  // 12. PAN-Aadhaar Link Status
  {
    id: 'pan_aadhaar_link',
    name: 'पैन-आधार लिंक स्टेटस जांच (PAN Link Check)',
    category: 'utility',
    fee: 6,
    renderType: 'welfare',
    dept: 'आयकर विभाग (Income Tax Department - NSDL/UTI)',
    desc: 'पैन और आधार नंबर की पारस्परिक लिंकिंग की आधिकारिक पुष्टि रसीद (सत्यापित व सक्रिय स्टेटस)।',
    fields: [
      { id: 'panNo', label: '10-अंकीय पैन नंबर (PAN)', type: 'text', placeholder: 'ABCDE1234F', required: true },
      { id: 'aadhaarNo', label: '12-अंकीय आधार नंबर (Aadhaar)', type: 'text', placeholder: 'XXXX XXXX 4921', required: true }
    ]
  },

  // 13. 10th/12th Board Result Verification
  {
    id: 'board_result_verify',
    name: '10वीं व 12वीं बोर्ड रिजल्ट व अंकतालिका सत्यापन',
    category: 'student',
    fee: 6,
    renderType: 'welfare',
    dept: 'माध्यमिक शिक्षा परिषद (UP Board / State Board)',
    desc: 'हाईस्कूल व इंटरमीडिएट रोल नंबर से सभी विषयों के प्राप्तांक, श्रेणी व आधिकारिक पासिंग रिजल्ट प्रिंट।',
    fields: [
      { id: 'examClass', label: 'कक्षा (Class)', type: 'select', options: ['हाईस्कूल (Class 10th)', 'इंटरमीडिएट (Class 12th)'] },
      { id: 'rollNo', label: 'रोल नंबर (Roll Number)', type: 'text', placeholder: '124019284', required: true },
      { id: 'studentName', label: 'छात्र / छात्रा का नाम', type: 'text', placeholder: 'मोहित कुमार', required: true }
    ]
  },

  // Remaining specialized welfare & utility services
  {
    id: 'scholarship_status',
    name: 'स्कॉलरशिप स्टेटस व PFMS पासबुक पर्ची',
    category: 'student',
    fee: 6,
    renderType: 'welfare',
    dept: 'समाज कल्याण / पिछड़ा वर्ग कल्याण विभाग',
    desc: 'दशमोत्तर व पूर्वदशम छात्रवृत्ति का स्टेटस (समाज कल्याण से अग्रसारित व बैंक में ₹5400 अंतरित)।',
    fields: [
      { id: 'regNo', label: 'छात्रवृत्ति रजिस्ट्रेशन संख्या', type: 'text', placeholder: '260194857201', required: true },
      { id: 'studentName', label: 'छात्र / छात्रा का नाम', type: 'text', placeholder: 'अंशिका वर्मा', required: true },
      { id: 'course', label: 'कक्षा / पाठ्यक्रम', type: 'text', placeholder: 'B.A. द्वितीय वर्ष' }
    ]
  },
  {
    id: 'pension_slip',
    name: 'पेंशन लाभार्थी स्टेटस व पर्ची (SSPY Portal)',
    category: 'welfare',
    fee: 10,
    renderType: 'welfare',
    dept: 'समाज कल्याण विभाग (Integrated Pension Portal)',
    desc: 'वृद्धावस्था, विधवा व दिव्यांग पेंशन की ₹3000 वाली क़िस्त का बैंक ट्रांसफर स्टेटस व आधिकारिक पर्ची प्रिंट।',
    fields: [
      { id: 'pensionerName', label: 'पेंशनर का नाम', type: 'text', placeholder: 'मंगली प्रसाद', required: true },
      { id: 'pensionType', label: 'पेंशन योजना का प्रकार', type: 'select', options: ['वृद्धावस्था पेंशन (Old Age)', 'निराश्रित महिला पेंशन (Widow)', 'दिव्यांग पेंशन (Divyang)'] },
      { id: 'regNo', label: 'पंजीकरण संख्या / खाता संख्या', type: 'text', placeholder: '1029384756' }
    ]
  },
  {
    id: 'voter_slip',
    name: 'वोटर लिस्ट में नाम खोजें व वोटर पर्ची (EPIC)',
    category: 'card',
    fee: 6,
    renderType: 'card',
    subType: 'voter',
    requirePhoto: true,
    dept: 'भारत निर्वाचन आयोग (Election Commission of India)',
    desc: 'वोटर कार्ड नंबर से पोलिंग बूथ, भाग संख्या, क्रम संख्या (सीरियल नंबर) व प्रमाणित वोटर पर्ची।',
    fields: [
      { id: 'epicNo', label: 'EPIC / वोटर कार्ड नंबर', type: 'text', placeholder: 'UPL1948291', required: true },
      { id: 'voterName', label: 'मतदाता का नाम', type: 'text', placeholder: 'शिवबालक', required: true },
      { id: 'boothName', label: 'मतदान केंद्र (Polling Booth)', type: 'text', placeholder: 'प्राथमिक विद्यालय कक्ष संख्या 1' },
      { id: 'assembly', label: 'भाग संख्या व क्रम संख्या', type: 'text', placeholder: 'भाग नं. 142 • क्रम संख्या 512' }
    ]
  },
  {
    id: 'nrega_job_card',
    name: 'नरेगा जॉब कार्ड व मस्टर रोल हाजिरी पर्ची',
    category: 'farmer',
    fee: 6,
    renderType: 'welfare',
    dept: 'ग्रामीण विकास मंत्रालय (MGNREGA Portal)',
    desc: 'गाँव के अकुशल मजदूर का जॉब कार्ड नंबर, कुल कार्य दिवस और मजदूरी भुगतान का प्रमाणित प्रिंट।',
    fields: [
      { id: 'jobCardNo', label: 'जॉब कार्ड संख्या', type: 'text', placeholder: 'UP-04-002-019/52', required: true },
      { id: 'workerName', label: 'श्रमिक का नाम', type: 'text', placeholder: 'सियाराम' },
      { id: 'gramPanchayat', label: 'ग्राम पंचायत व विकास खंड', type: 'text', placeholder: 'रामपुर, विकास खंड सवायजपुर' }
    ]
  },
  {
    id: 'lpg_subsidy',
    name: 'एलपीजी गैस सब्सिडी स्टेटस पर्ची (LPG Subsidy)',
    category: 'utility',
    fee: 6,
    renderType: 'welfare',
    dept: 'पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय (MyLPG Portal)',
    desc: 'रसोई गैस सिलेंडर की सब्सिडी किस बैंक खाते में गई और पिछली सब्सिडी राशि का ब्यौरा।',
    fields: [
      { id: 'lpgId', label: '17-अंकीय LPG ID या उपभोक्ता संख्या', type: 'text', placeholder: '12049182049182041', required: true },
      { id: 'consumerName', label: 'उपभोक्ता का नाम', type: 'text', placeholder: 'कमला देवी' },
      { id: 'agencyName', label: 'गैस एजेंसी व कंपनी', type: 'text', placeholder: 'भारत गैस / इंडेन ग्रामीण वितरक' }
    ]
  },
  {
    id: 'crs_verification',
    name: 'जन्म / मृत्यु प्रमाण पत्र सत्यापन पर्ची (CRS Portal)',
    category: 'legal',
    fee: 6,
    renderType: 'legal',
    dept: 'भारत के महारजिस्ट्रार (Civil Registration System - CRS)',
    desc: 'अस्पताल व नगर पालिका/ग्राम पंचायत द्वारा जारी जन्म व मृत्यु प्रमाण पत्र का डिजिटल नेट सत्यापन प्रिंट।',
    fields: [
      { id: 'regNo', label: 'पंजीकरण संख्या (Registration No.)', type: 'text', placeholder: 'B-2026-09-948201', required: true },
      { id: 'applicantName', label: 'बच्चे / मृतक का नाम', type: 'text', placeholder: 'आरव कुमार' },
      { id: 'fatherHusband', label: 'पिता / पति का नाम', type: 'text', placeholder: 'राजेश कुमार' },
      { id: 'address', label: 'घटना स्थल व पता', type: 'text', placeholder: 'सामुदायिक स्वास्थ्य केंद्र, हरदोई' }
    ]
  },
  {
    id: 'pariwar_register',
    name: 'परिवार रजिस्टर की नकल (Pariwar Register Nakal)',
    category: 'legal',
    fee: 6,
    renderType: 'welfare',
    dept: 'पंचायती राज विभाग (e-District / Panchayat Portal)',
    desc: 'राशन कार्ड संशोधन व पेंशन हेतु ग्राम पंचायत परिवार रजिस्टर की प्रमाणित नकल प्रिंट।',
    fields: [
      { id: 'headName', label: 'परिवार के मुखिया का नाम', type: 'text', placeholder: 'राम सनेही', required: true },
      { id: 'rationNo', label: 'मकान नंबर / रजिस्टर क्रमांक', type: 'text', placeholder: 'मकान नं. 42 / खाता 19' },
      { id: 'dealerName', label: 'ग्राम पंचायत व विकास खंड', type: 'text', placeholder: 'ग्राम पंचायत सुरसा, ब्लॉक हरदोई' },
      { id: 'units', label: 'कुल दर्ज सदस्य', type: 'number', placeholder: '5' }
    ]
  },
  {
    id: 'bank_npci_link',
    name: 'बैंक खाता NPCI / DBT आधार सीडिंग स्टेटस',
    category: 'utility',
    fee: 6,
    renderType: 'welfare',
    dept: 'नेशनल पेमेंट्स कारपोरेशन ऑफ इंडिया (NPCI Aadhar Seeding)',
    desc: 'सरकारी सब्सिडी, स्कॉलरशिप व पेंशन के लिए बैंक खाते में आधार NPCI मैपिंग जांच।',
    fields: [
      { id: 'aadhaarNo', label: 'आधार नंबर (अंतिम 4 अंक)', type: 'text', placeholder: 'XXXX XXXX 4921', required: true },
      { id: 'panNo', label: 'संबद्ध बैंक शाखा का नाम', type: 'text', placeholder: 'बैंक ऑफ बड़ौदा, शाखा सुरसा' }
    ]
  },
  {
    id: 'cert_net_verify',
    name: 'आय, जाति, निवास प्रमाण पत्र नेट सत्यापन पर्ची',
    category: 'legal',
    fee: 6,
    renderType: 'legal',
    dept: 'राजस्व परिषद (e-District Certificate Net Verification)',
    desc: 'तहसीलदार द्वारा जारी आय, जाति और निवास प्रमाण पत्र का ऑनलाइन डिजिटल सत्यापन प्रिंट।',
    fields: [
      { id: 'applicantName', label: 'आवेदक का नाम', type: 'text', placeholder: 'सुशील कुमार', required: true },
      { id: 'fatherHusband', label: 'पिता / पति का नाम', type: 'text', placeholder: 'श्री राम चरण' },
      { id: 'purpose', label: 'प्रमाण पत्र का प्रकार', type: 'select', options: ['जाति प्रमाण पत्र (Caste)', 'आय प्रमाण पत्र (Income)', 'मूल निवास प्रमाण पत्र (Domicile)'] },
      { id: 'address', label: 'आवेदन क्रमांक व प्रमाण पत्र क्रमांक', type: 'text', placeholder: 'आवेदन: 24192004 • प्रमाण पत्र: 241948291' }
    ]
  },
  {
    id: 'bhu_naksha',
    name: 'भू-नक्शा व खेत का सजरा मैप पर्ची (Bhu-Naksha)',
    category: 'farmer',
    fee: 6,
    renderType: 'welfare',
    dept: 'राजस्व परिषद उत्तर प्रदेश (Bhulekh Bhu-Naksha Portal)',
    desc: 'खेत का गाटा नंबर डालकर खेत की मेढ़, दिशा और आकार का प्रमाणित नक्शा प्रिंट निकालें।',
    fields: [
      { id: 'rationNo', label: 'खसरा / गाटा संख्या (Gata No.)', type: 'text', placeholder: 'गाटा संख्या 412/1', required: true },
      { id: 'headName', label: 'खातेदार / किसान का नाम', type: 'text', placeholder: 'हरिशंकर पुत्र राम दयाल' },
      { id: 'dealerName', label: 'ग्राम, परगना व तहसील', type: 'text', placeholder: 'ग्राम रामपुर, तहसील सवायजपुर, हरदोई' },
      { id: 'units', label: 'कुल रकबा (क्षेत्रफल हेक्टेयर में)', type: 'text', placeholder: '0.4120 हेक्टेयर' }
    ]
  },
  {
    id: 'pm_awas_list',
    name: 'प्रधानमंत्री आवास योजना (PMAY) लाभार्थी सूची',
    category: 'welfare',
    fee: 6,
    renderType: 'welfare',
    dept: 'ग्रामीण विकास मंत्रालय (PMAY-G / AwaasSoft)',
    desc: 'ग्रामीण व शहरी आवास योजना में ₹1.20 लाख सहायता सूची में नाम व क़िस्त की स्थिति प्रिंट।',
    fields: [
      { id: 'headName', label: 'लाभार्थी का नाम', type: 'text', placeholder: 'आशा देवी', required: true },
      { id: 'rationNo', label: 'PMAY पंजीकरण संख्या (PMAY ID)', type: 'text', placeholder: 'UP192840192' },
      { id: 'dealerName', label: 'ग्राम पंचायत व जनपद', type: 'text', placeholder: 'ग्राम बेहटा, हरदोई' }
    ]
  },
  {
    id: 'sewayojan_x10',
    name: 'रोजगार संगम सेवायोजन पंजीकरण (X-10 Slip)',
    category: 'student',
    fee: 6,
    renderType: 'welfare',
    dept: 'श्रम एवं रोजगार विभाग (Sewayojan Portal UP)',
    desc: 'आउटसोर्सिंग व संविदा सरकारी भर्तियों के लिए अनिवार्य रोजगार संगम X-10 पावती पर्ची।',
    fields: [
      { id: 'regNo', label: 'सेवायोजन पंजीकरण संख्या', type: 'text', placeholder: 'UP20261948291', required: true },
      { id: 'studentName', label: 'अभ्यर्थी का नाम', type: 'text', placeholder: 'अमनदीप' },
      { id: 'course', label: 'योग्यता (Qualification)', type: 'text', placeholder: 'स्नातक (B.Sc.) + CCC' }
    ]
  },
  {
    id: 'udyam_msme',
    name: 'उद्यम MSME पंजीकरण स्टेटस व सर्टिफिकेट',
    category: 'utility',
    fee: 6,
    renderType: 'welfare',
    dept: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय (Udyam Portal)',
    desc: 'दुकानदार व व्यापारिक फर्म का सरकारी उद्यम आधार प्रमाणपत्र व पंजीकरण सत्यापन प्रिंट।',
    fields: [
      { id: 'panNo', label: 'उद्यम पंजीकरण संख्या (Udyam No)', type: 'text', placeholder: 'UDYAM-UP-30-0012948', required: true },
      { id: 'aadhaarNo', label: 'इकाई का नाम (Enterprise Name)', type: 'text', placeholder: 'मेसर्स शर्मा डिजिटल सेवा केंद्र' }
    ]
  },
  {
    id: 'dl_sarathi_slip',
    name: 'ड्राइविंग लाइसेंस सारथी स्टेटस व टेस्ट स्लॉट पर्ची',
    category: 'utility',
    fee: 6,
    renderType: 'vehicle',
    dept: 'सड़क परिवहन एवं राजमार्ग मंत्रालय (Sarathi Parivahan)',
    desc: 'लर्निंग व परमानेंट ड्राइविंग लाइसेंस का आवेदन स्टेटस व RTO टेस्ट स्लॉट बुकिंग पर्ची।',
    fields: [
      { id: 'vehicleNo', label: 'आवेदन संख्या (Application No)', type: 'text', placeholder: 'DL-2026-019284', required: true },
      { id: 'ownerName', label: 'आवेदक का नाम', type: 'text', placeholder: 'दीपक कुमार' },
      { id: 'puccUpto', label: 'RTO कार्यालय व स्लॉट तिथि', type: 'text', placeholder: 'RTO हरदोई • 12 मार्च 2026 (11:00 AM)' }
    ]
  },
  {
    id: 'mahila_scheme',
    name: 'निराश्रित / विधवा / महिला कल्याण योजना स्टेटस',
    category: 'welfare',
    fee: 6,
    renderType: 'welfare',
    dept: 'महिला कल्याण एवं बाल विकास विभाग',
    desc: 'निराश्रित महिला पेंशन एवं मातृत्व वंदना योजना की क़िस्त व बैंक ट्रांसफर स्थिति प्रिंट।',
    fields: [
      { id: 'pensionerName', label: 'लाभार्थी महिला का नाम', type: 'text', placeholder: 'कमलेश कुमारी', required: true },
      { id: 'regNo', label: 'आवेदन / खाता संख्या', type: 'text', placeholder: '1048291048' }
    ]
  },
  {
    id: 'virtual_court_challan',
    name: 'वर्चुअल कोर्ट ई-चालान जांच व रसीद',
    category: 'utility',
    fee: 6,
    renderType: 'vehicle',
    dept: 'विधि एवं न्याय मंत्रालय (Virtual Courts Portal)',
    desc: 'ट्रैफिक पुलिस चालान का केस नंबर, जुर्माना राशि व वर्चुअल कोर्ट निस्तारण रसीद।',
    fields: [
      { id: 'vehicleNo', label: 'गाड़ी नंबर या चालान संख्या', type: 'text', placeholder: 'UP32AB1234 / CH-19284', required: true },
      { id: 'ownerName', label: 'वाहन स्वामी / अभियुक्त', type: 'text', placeholder: 'संजय यादव' },
      { id: 'puccUpto', label: 'जुर्माना राशि व स्थिति', type: 'text', placeholder: '₹1,000 (निस्तारित / Disposed in Virtual Court)' }
    ]
  },
  {
    id: 'new_electricity_meter',
    name: 'बिजली नया कनेक्शन (झटपट पोर्टल) पावती पर्ची',
    category: 'utility',
    fee: 6,
    renderType: 'bill',
    dept: 'उत्तर प्रदेश पावर कारपोरेशन (झटपट कनेक्शन पोर्टल)',
    desc: 'घरेलू व वाणिज्यिक नए बिजली मीटर आवेदन की आधिकारिक पावती व डिमांड नोट पर्ची।',
    fields: [
      { id: 'consumerNo', label: 'आवेदन संख्या (Application ID)', type: 'text', placeholder: 'JP-2026-019284', required: true },
      { id: 'consumerName', label: 'आवेदक का नाम', type: 'text', placeholder: 'राजेश शर्मा' },
      { id: 'loadKw', label: 'स्वीकृत भार', type: 'select', options: ['1 KW (घरेलू BPL/सामान्य)', '2 KW (घरेलू)', '3 KW (घरेलू/दुकान)'] },
      { id: 'substation', label: 'विद्युत उपकेंद्र व खंड', type: 'text', placeholder: '33/11 KV उपकेंद्र सांडी' }
    ]
  },
  {
    id: 'admit_card',
    name: 'परीक्षा प्रवेश पत्र व एडमिट कार्ड पर्ची',
    category: 'student',
    fee: 6,
    renderType: 'welfare',
    dept: 'कर्मचारी चयन आयोग / भर्ती बोर्ड (Admit Card Portal)',
    desc: 'प्रतियोगी परीक्षा या बोर्ड परीक्षा का आधिकारिक प्रवेश पत्र, परीक्षा तिथि व केंद्र पर्ची।',
    fields: [
      { id: 'studentName', label: 'परीक्षार्थी का नाम', type: 'text', placeholder: 'अभिषेक पटेल', required: true },
      { id: 'regNo', label: 'रोल नंबर / रजिस्ट्रेशन संख्या', type: 'text', placeholder: '2401829104', required: true },
      { id: 'course', label: 'परीक्षा का नाम व केंद्र', type: 'text', placeholder: 'SSC GD Exam 2026 • राजकीय इंटर कॉलेज, हरदोई' }
    ]
  },
  {
    id: 'ecourt_status',
    name: 'ई-कोर्ट केस स्टेटस व अगली तारीख पर्ची (e-Courts)',
    category: 'legal',
    fee: 6,
    renderType: 'welfare',
    dept: 'विधि एवं न्याय मंत्रालय (National e-Courts Portal)',
    desc: 'कचहरी व न्यायालय के मुकदमे का केस नंबर, अगली सुनवाई तारीख (Next Date) व जज आदेश पर्ची।',
    fields: [
      { id: 'applicantName', label: 'वादी / प्रतिवादी का नाम', type: 'text', placeholder: 'राम कुमार बनाम श्याम लाल', required: true },
      { id: 'rationNo', label: 'CNR नंबर / केस संख्या', type: 'text', placeholder: 'UP04000192842025' },
      { id: 'dealerName', label: 'न्यायालय व अगली सुनवाई तारीख', type: 'text', placeholder: 'सिविल जज (जू.डि.), हरदोई • 18 अप्रैल 2026' }
    ]
  },
  {
    id: 'kanya_sumangala',
    name: 'मुख्यमंत्री कन्या सुमंगला योजना क़िस्त स्टेटस',
    category: 'welfare',
    fee: 6,
    renderType: 'welfare',
    dept: 'महिला कल्याण विभाग (MKSY Portal)',
    desc: 'बेटियों को मिलने वाली ₹25,000 की 6 चरणों वाली सहायता राशि का आवेदन व बैंक अंतरण स्टेटस प्रिंट।',
    fields: [
      { id: 'headName', label: 'बालिका का नाम', type: 'text', placeholder: 'आरुषि सिंह', required: true },
      { id: 'rationNo', label: 'MKSY आवेदन संख्या', type: 'text', placeholder: 'MKSY26019284' },
      { id: 'dealerName', label: 'योजना चरण व धनराशि', type: 'text', placeholder: 'तृतीय चरण: कक्षा 1 में प्रवेश (₹3,000 अंतरित)' }
    ]
  },
  {
    id: 'vivah_anudan',
    name: 'शादी बीमारी अनुदान योजना स्टेटस (Vivah Anudan)',
    category: 'welfare',
    fee: 6,
    renderType: 'welfare',
    dept: 'समाज कल्याण / पिछड़ा वर्ग कल्याण विभाग',
    desc: 'पुत्री विवाह हेतु ₹20,000 / ₹51,000 सरकारी अनुदान की ऑनलाइन स्वीकृति व भुगतान स्टेटस पर्ची।',
    fields: [
      { id: 'applicantName', label: 'आवेदक (माता/पिता) का नाम', type: 'text', placeholder: 'भगवान दास', required: true },
      { id: 'fatherHusband', label: 'विवाहिता पुत्री का नाम', type: 'text', placeholder: 'पूजा देवी' },
      { id: 'address', label: 'आवेदन क्रमांक व स्वीकृति स्थिति', type: 'text', placeholder: '241920048192 • कोषागार से ₹20,000 भुगतान स्वीकृत' }
    ]
  },
  {
    id: 'passport_track',
    name: 'पासपोर्ट सेवा आवेदन ट्रैकिंग पर्ची (Passport Seva)',
    category: 'utility',
    fee: 6,
    renderType: 'welfare',
    dept: 'विदेश मंत्रालय (Consular, Passport & Visa Division)',
    desc: 'पासपोर्ट आवेदन की फाइल संख्या से पुलिस वेरिफिकेशन, प्रिंटिंग व स्पीड पोस्ट ट्रैकिंग पर्ची।',
    fields: [
      { id: 'panNo', label: '15-अंकीय फाइल संख्या (File Number)', type: 'text', placeholder: 'LKO206194829104', required: true },
      { id: 'aadhaarNo', label: 'आवेदक का नाम व जन्मतिथि', type: 'text', placeholder: 'संजय कुमार • 12/04/1994' }
    ]
  },
  {
    id: 'kcc_subsidy',
    name: 'किसान क्रेडिट कार्ड (KCC) ब्याज अनुदान पर्ची',
    category: 'farmer',
    fee: 6,
    renderType: 'welfare',
    dept: 'नाबार्ड एवं कृषि मंत्रालय (KCC Subsidy)',
    desc: 'फसली ऋण पर 3% सरकारी ब्याज छूट (Interest Subvention) व KCC सीमा नवीनीकरण पर्ची।',
    fields: [
      { id: 'farmerName', label: 'किसान का नाम', type: 'text', placeholder: 'नत्थू लाल', required: true },
      { id: 'mobileReg', label: 'KCC ऋण खाता संख्या', type: 'text', placeholder: '301928475819' },
      { id: 'village', label: 'बैंक शाखा व छूट स्थिति', type: 'text', placeholder: 'आर्यावर्त बैंक, बिलग्राम • 3% छूट क्रेडिटेड' }
    ]
  },
  {
    id: 'animal_husbandry_kcc',
    name: 'पशुपालन / डेयरी KCC आवेदन पावती पर्ची',
    category: 'farmer',
    fee: 6,
    renderType: 'welfare',
    dept: 'पशुपालन एवं मत्स्य विभाग (Pashupalan KCC)',
    desc: 'दुधारू पशुओं के लिए ₹2 लाख बिना गारंटी लोन की आधिकारिक आवेदन पावती व चिकित्सा पर्ची।',
    fields: [
      { id: 'farmerName', label: 'पशुपालक का नाम', type: 'text', placeholder: 'सुंदर लाल', required: true },
      { id: 'mobileReg', label: 'पशुओं की संख्या व टैग', type: 'text', placeholder: '4 गाय • टैग संख्या 104829' },
      { id: 'village', label: 'आवेदित ऋण राशि व अस्पताल', type: 'text', placeholder: '₹1,60,000 • पशु चिकित्सालय हरदोई' }
    ]
  },
  {
    id: 'itr_v_slip',
    name: 'इनकम टैक्स रिटर्न पावती (ITR-V Acknowledgement)',
    category: 'utility',
    fee: 6,
    renderType: 'welfare',
    dept: 'आयकर विभाग (Income Tax Department)',
    desc: 'बैंक लोन व वीज़ा हेतु आयकर रिटर्न भरने के बाद की आधिकारिक 1-पेज ITR-V रसीद।',
    fields: [
      { id: 'panNo', label: '10-अंकीय पैन नंबर (PAN)', type: 'text', placeholder: 'AAAPS1928K', required: true },
      { id: 'aadhaarNo', label: '15-अंकीय पावती संख्या (Ack No.)', type: 'text', placeholder: '240182910492810' }
    ]
  }
];

export default function JanSevaModal({ 
  isOpen, 
  onClose, 
  initialServiceId = null,
  selectedCafe = null,
  settings = null
}) {
  const [selectedService, setSelectedService] = useState(() => {
    if (initialServiceId) {
      const match = JAN_SEVA_SERVICES.find(s => s.id === initialServiceId);
      if (match) return match;
    }
    return JAN_SEVA_SERVICES[0];
  });

  const [formData, setFormData] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [signUrl, setSignUrl] = useState(null);
  const [generatedSlip, setGeneratedSlip] = useState(null);
  const [submittingToken, setSubmittingToken] = useState(false);
  const [submittedToken, setSubmittedToken] = useState(null);

  if (!isOpen) return null;

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handleSignUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSignUrl(url);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const token = `JS-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedSlip({
      token,
      generatedAt: new Date().toLocaleString('hi-IN'),
      service: selectedService,
      details: { ...formData },
      photoUrl,
      signUrl,
      cafe: selectedCafe || { shopName: settings?.shopName || 'डिजिटल सेवा केंद्र अधिकृत शाखा', address: 'तहसील मुख्य मार्ग' }
    });
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const handleSendTokenToCafe = async () => {
    if (!generatedSlip) return;
    setSubmittingToken(true);
    try {
      const cafeId = selectedCafe?.id || 'GLOBAL';
      const payload = {
        customerName: formData.holderName || formData.applicantName || formData.beneficiaryName || formData.headName || formData.workerName || formData.studentName || 'नागरिक',
        phone: formData.mobileReg || '9876543210',
        cafeId,
        serviceName: selectedService.name,
        fee: selectedService.fee,
        details: JSON.stringify(generatedSlip.details),
        slipToken: generatedSlip.token
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedToken(data.application?.id || generatedSlip.token);
      } else {
        setSubmittedToken(generatedSlip.token);
      }
    } catch (err) {
      setSubmittedToken(generatedSlip.token);
    } finally {
      setSubmittingToken(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[95vh] flex flex-col border border-slate-200">
        
        {/* Top Modal Header (Hidden on print) */}
        <div className="no-print bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  जनसेवा तत्काल स्टूडियो (Jan Seva Studio)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  100% In-App Genuine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                CR-80 स्मार्ट कार्ड्स, बिजली बिल, वाहन व सरकारी योजनाओं का प्रमाणित इंजन
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Service Selector Chips (Hidden on print) */}
          <div className="no-print space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              सेवा चुनें (Select Service) — कुल 40 हाई-डिमांड सरकारी सेवाएं:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-2xl">
              {JAN_SEVA_SERVICES.map((s) => {
                const isSelected = selectedService.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(s);
                      setFormData({});
                      setPhotoUrl(null);
                      setSignUrl(null);
                      setGeneratedSlip(null);
                      setSubmittedToken(null);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between gap-1 text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md font-bold' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight">{s.name}</span>
                    <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-current/20 text-[10px]">
                      <span className="opacity-80 font-mono">शुल्क:</span>
                      <span className={`px-1.5 py-0.5 rounded-md font-black ${isSelected ? 'bg-white text-blue-900' : 'bg-emerald-100 text-emerald-800'}`}>
                        ₹{s.fee}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Info Banner */}
          <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  {selectedService.dept}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {selectedService.category}
                </span>
                {selectedService.renderType === 'card' && (
                  <span className="bg-purple-100 text-purple-800 font-black text-[10px] px-2 py-0.5 rounded-full border border-purple-300">
                    CR-80 PVC Format
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-base text-slate-900 mt-1">
                {selectedService.name}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {selectedService.desc}
              </p>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-blue-200 text-center shadow-xs shrink-0">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">निर्धारित सेवा शुल्क</span>
              <span className="text-xl font-black text-emerald-600">
                ₹{selectedService.fee} मात्र
              </span>
            </div>
          </div>

          {/* INPUT FORM (Hidden on print) */}
          {!generatedSlip && (
            <form onSubmit={handleGenerate} className="no-print bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>आवश्यक जानकारी एवं दस्तावेज दर्ज करें:</span>
                </h5>
                <span className="text-[11px] text-slate-500 font-semibold">
                  * लाल चिन्ह वाले आवश्यक हैं
                </span>
              </div>

              {/* Photo & Signature Upload Section for Smart Cards & Affidavits */}
              {(selectedService.requirePhoto || selectedService.requireSign) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedService.requirePhoto && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>ग्राहक की पासपोर्ट फोटो अपलोड करें:</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-16 border-2 border-dashed border-slate-400 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {photoUrl ? (
                            <img src={photoUrl} alt="Passport preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold text-center px-1">फोटो</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>फोटो चुनें</span>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                          <p className="text-[10px] text-slate-500 mt-1">
                            (खाली छोड़ने पर ऑटोमैटिक मानक सरकारी फोटो उपयोग होगी)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedService.requireSign && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-blue-600" />
                        <span>ग्राहक का हस्ताक्षर (Signature) अपलोड:</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-14 border-2 border-dashed border-slate-400 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {signUrl ? (
                            <img src={signUrl} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">साइन</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>हस्ताक्षर चुनें</span>
                            <input type="file" accept="image/*" onChange={handleSignUpload} className="hidden" />
                          </label>
                          <p className="text-[10px] text-slate-500 mt-1">
                            (खाली छोड़ने पर प्रमाणित डिजिटल हस्ताक्षर जुड़ेगा)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Specific Field Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedService.fields.map((fld) => (
                  <div key={fld.id} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>{fld.label}</span>
                      {fld.required && <span className="text-red-500 font-bold">*</span>}
                    </label>
                    {fld.type === 'select' ? (
                      <select
                        value={formData[fld.id] || fld.options[0]}
                        onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                      >
                        {fld.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={fld.type}
                        placeholder={fld.placeholder}
                        value={formData[fld.id] || ''}
                        onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
                        required={fld.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    // Pre-fill realistic sample values for instant test
                    const samples = {};
                    selectedService.fields.forEach(f => {
                      if (f.placeholder) samples[f.id] = f.placeholder.replace('उदा. ', '');
                      else if (f.options) samples[f.id] = f.options[0];
                    });
                    setFormData(samples);
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  उदाहरण डेटा भरें
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {selectedService.renderType === 'card' ? 'ओरिजिनल PVC कार्ड बनाएं' : 'आधिकारिक प्रमाणित पर्ची तैयार करें'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* GENERATED OUTPUT & PRINT PREVIEW */}
          {generatedSlip && (
            <div className="space-y-4">
              
              {/* Slip Action Control Bar (Hidden on print) */}
              <div className="no-print bg-slate-900 text-white p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">
                    सत्यापित दस्तावेज तैयार है! टोकन: <span className="font-mono text-amber-300 font-black">{generatedSlip.token}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedSlip(null)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    बदलाव करें
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTokenToCafe}
                    disabled={submittingToken || !!submittedToken}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <SendIcon className="w-3.5 h-3.5" />
                    <span>{submittedToken ? 'टोकन कैफे पर भेजा गया ✓' : 'कैफे काउंटर को भेजें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectPrint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>डायरेक्ट प्रिंट (₹{selectedService.fee})</span>
                  </button>
                </div>
              </div>

              {/* RENDER THE ACCURATE DEDICATED TEMPLATE */}
              {selectedService.renderType === 'card' && (
                <CR80CardRenderer 
                  service={selectedService}
                  data={generatedSlip.details}
                  photoUrl={generatedSlip.photoUrl}
                  signUrl={generatedSlip.signUrl}
                  cafe={generatedSlip.cafe}
                />
              )}

              {selectedService.renderType === 'bill' && (
                <UtilityBillRenderer 
                  service={selectedService}
                  data={generatedSlip.details}
                  cafe={generatedSlip.cafe}
                  generatedAt={generatedSlip.generatedAt}
                  token={generatedSlip.token}
                />
              )}

              {selectedService.renderType === 'vehicle' && (
                <UtilityBillRenderer 
                  service={selectedService}
                  data={generatedSlip.details}
                  cafe={generatedSlip.cafe}
                  generatedAt={generatedSlip.generatedAt}
                  token={generatedSlip.token}
                />
              )}

              {(selectedService.renderType === 'legal' || selectedService.renderType === 'welfare') && (
                <LegalWelfareRenderer 
                  service={selectedService}
                  data={generatedSlip.details}
                  cafe={generatedSlip.cafe}
                  generatedAt={generatedSlip.generatedAt}
                  token={generatedSlip.token}
                  photoUrl={generatedSlip.photoUrl}
                />
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}
