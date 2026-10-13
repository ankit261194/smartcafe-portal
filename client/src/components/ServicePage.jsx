import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Car, CreditCard, FileText, Zap, Award, Printer, Download, Sparkles, 
  CheckCircle2, RefreshCw, Scissors, ShieldCheck, Search, ArrowLeft,
  Eye, User, Check, AlertCircle, Clock, History, Camera, Upload, Trash2,
  ChevronRight, IndianRupee, Layers, ExternalLink, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { authFetch } from '../utils/api';

// Sample Avatars (Self-contained, sharp vector SVGs as data URIs)
const SAMPLE_PHOTOS = {
  male: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><rect width="120" height="150" fill="%23e2e8f0"/><circle cx="60" cy="50" r="28" fill="%232563eb"/><path d="M18 138 C18 96, 102 96, 102 138 Z" fill="%231d4ed8"/><circle cx="50" cy="46" r="3" fill="%23ffffff"/><circle cx="70" cy="46" r="3" fill="%23ffffff"/><path d="M52 64 Q60 70 68 64" stroke="%23ffffff" stroke-width="2.5" fill="none"/></svg>`,
  female: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><rect width="120" height="150" fill="%23fce7f3"/><circle cx="60" cy="50" r="26" fill="%23db2777"/><path d="M16 138 C16 94, 104 94, 104 138 Z" fill="%23be185d"/><path d="M38 34 C38 18, 82 18, 82 34" stroke="%239d174d" stroke-width="6" fill="none"/><circle cx="50" cy="47" r="2.5" fill="%23ffffff"/><circle cx="70" cy="47" r="2.5" fill="%23ffffff"/><path d="M54 63 Q60 68 66 63" stroke="%23ffffff" stroke-width="2" fill="none"/></svg>`,
  senior: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><rect width="120" height="150" fill="%23f1f5f9"/><circle cx="60" cy="52" r="27" fill="%2364748b"/><path d="M20 138 C20 98, 100 98, 100 138 Z" fill="%23475569"/><circle cx="49" cy="50" r="7" stroke="%23334155" stroke-width="2" fill="none"/><circle cx="71" cy="50" r="7" stroke="%23334155" stroke-width="2" fill="none"/><line x1="56" y1="50" x2="64" y2="50" stroke="%23334155" stroke-width="2"/><path d="M53 66 Q60 70 67 66" stroke="%23ffffff" stroke-width="2" fill="none"/></svg>`
};

const SAMPLE_SIGNS = {
  sign1: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="M15 45 C35 12, 45 48, 70 24 C95 4, 100 44, 125 28 C150 14, 165 38, 185 18" stroke="%231e293b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M25 48 L170 42" stroke="%231e293b" stroke-width="2" stroke-linecap="round"/></svg>`,
  sign2: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="M20 35 Q40 5 60 30 T100 25 T140 35 T180 20" stroke="%230f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M30 40 L160 36" stroke="%230f172a" stroke-width="2" stroke-linecap="round"/></svg>`
};

export const INSTANT_TOOLS = [
  {
    id: 'rc',
    title: 'वाहन RC टू PDF / PVC',
    subtitle: 'Parivahan RC Certificate & CR-80 PVC Smart Card',
    category: 'vehicle',
    categoryName: 'वाहन व RTO सेवाएं',
    icon: Car,
    badge: 'Parivahan RC',
    color: 'from-blue-600 to-indigo-700',
    accentColor: 'blue',
    serviceType: 'rcDownload',
    retailRate: 250,
    wholesaleRate: 200,
    placeholder: 'उदा. UP32AB1234',
    inputLabel: 'वाहन पंजीयन क्रमांक (Vehicle Reg Number)',
    sampleValue: 'UP32AB1234'
  },
  {
    id: 'pan',
    title: 'इंस्टेंट पैन कार्ड CR-80 PVC',
    subtitle: 'Official NSDL / UTI CR-80 PVC Card Front & Back',
    category: 'pan',
    categoryName: 'पैन कार्ड सेवाएं',
    icon: CreditCard,
    badge: 'CR-80 PVC',
    color: 'from-emerald-600 to-teal-700',
    accentColor: 'emerald',
    serviceType: 'panCard',
    retailRate: 30,
    wholesaleRate: 15,
    placeholder: 'उदा. ABCDE1234F',
    inputLabel: '10-अंकीय पैन नंबर (PAN Number)',
    sampleValue: 'ABCDE1234F'
  },
  {
    id: 'aadhaar',
    title: 'एडवांस आधार CR-80 PVC कार्ड',
    subtitle: '85.6mm x 54mm UIDAI Smart Card with Verified QR',
    category: 'aadhaar',
    categoryName: 'आधार कार्ड सेवाएं',
    icon: ShieldCheck,
    badge: 'UIDAI Format',
    color: 'from-red-600 to-rose-700',
    accentColor: 'red',
    serviceType: 'aadhaarCard',
    retailRate: 30,
    wholesaleRate: 15,
    placeholder: 'उदा. 5412 8796 3214',
    inputLabel: '12-अंकीय आधार संख्या (Aadhaar Number)',
    sampleValue: '5412 8796 3214'
  },
  {
    id: 'voter',
    title: 'डिजिटल वोटर स्मार्ट कार्ड (EPIC)',
    subtitle: 'Election Commission of India Smart Card Layout',
    category: 'voter',
    categoryName: 'वोटर कार्ड सेवाएं',
    icon: Award,
    badge: 'ECI Format',
    color: 'from-amber-600 to-orange-700',
    accentColor: 'amber',
    serviceType: 'voterCard',
    retailRate: 30,
    wholesaleRate: 15,
    placeholder: 'उदा. WBD1234567',
    inputLabel: '10-अंकीय EPIC वोटर आईडी (Voter ID)',
    sampleValue: 'WBD1234567'
  },
  {
    id: 'ayushman',
    title: 'आयुष्मान भारत PM-JAY गोल्डन कार्ड',
    subtitle: '₹5 लाख मुफ़्त उपचार गारंटी गोल्डन कार्ड लेआउट',
    category: 'welfare',
    categoryName: 'राशन व आयुष्मान सेवाएं',
    icon: Sparkles,
    badge: '₹5 Lakh Health',
    color: 'from-yellow-600 to-amber-700',
    accentColor: 'yellow',
    serviceType: 'ayushmanCard',
    retailRate: 30,
    wholesaleRate: 15,
    placeholder: 'उदा. PMJAY-UP-98214',
    inputLabel: 'PM-JAY आईडी / राशन कार्ड / आधार',
    sampleValue: 'PMJAY-UP-98214'
  },
  {
    id: 'ration',
    title: 'राशन कार्ड पर्चा / NFSA स्लिप',
    subtitle: 'खाद्य एवं रसद विभाग कोटेदार वितरण पात्रता पर्ची',
    category: 'welfare',
    categoryName: 'राशन व आयुष्मान सेवाएं',
    icon: FileText,
    badge: 'NFSA Slip',
    color: 'from-green-600 to-emerald-700',
    accentColor: 'green',
    serviceType: 'rationCard',
    retailRate: 25,
    wholesaleRate: 10,
    placeholder: 'उदा. 215409823412',
    inputLabel: '12-अंकीय राशन कार्ड नंबर (Ration Card No)',
    sampleValue: '215409823412'
  },
  {
    id: 'electricity',
    title: 'बिजली बिल भुगतान रसीद',
    subtitle: 'UPPCL / State Discom Consumer Bill & Receipt Maker',
    category: 'utility',
    categoryName: 'बिल व रसीद सेवाएं',
    icon: Zap,
    badge: 'Instant Receipt',
    color: 'from-blue-700 to-cyan-700',
    accentColor: 'cyan',
    serviceType: 'electricityBill',
    retailRate: 20,
    wholesaleRate: 10,
    placeholder: 'उदा. 7812903456',
    inputLabel: '10-अंकीय उपभोक्ता खाता संख्या (Account ID)',
    sampleValue: '7812903456'
  },
  {
    id: 'edistrict',
    title: 'e-District आय/जाति/निवास सत्यापन',
    subtitle: 'राजस्व परिषद डिजिटल सत्यापन प्रमाण पत्र पर्ची',
    category: 'edistrict',
    categoryName: 'e-District सेवाएं',
    icon: Award,
    badge: 'Verified Slip',
    color: 'from-violet-600 to-purple-700',
    accentColor: 'purple',
    serviceType: 'edistrictSlip',
    retailRate: 30,
    wholesaleRate: 15,
    placeholder: 'उदा. 241550010098241',
    inputLabel: 'आवेदन क्रमांक (Application No)',
    sampleValue: '241550010098241'
  },
  {
    id: 'dl',
    title: 'ड्राइविंग लाइसेंस (DL) PVC स्मार्ट कार्ड',
    subtitle: 'MoRTH Sarathi Parivahan CR-80 PVC Smart Card',
    category: 'vehicle',
    categoryName: 'वाहन व RTO सेवाएं',
    icon: Award,
    badge: 'Sarathi CR-80',
    color: 'from-blue-700 to-indigo-800',
    accentColor: 'indigo',
    serviceType: 'drivingLicence',
    retailRate: 50,
    wholesaleRate: 25,
    placeholder: 'उदा. DL-0420110012345',
    inputLabel: 'ड्राइविंग लाइसेंस क्रमांक (DL Number)',
    sampleValue: 'UP1420110012345'
  },
  {
    id: 'challan',
    title: 'वाहन ई-चालान जांच एवं रसीद',
    subtitle: 'MoRTH e-Challan Official Verification Slip & Receipt',
    category: 'vehicle',
    categoryName: 'वाहन व RTO सेवाएं',
    icon: FileText,
    badge: 'e-Challan Slip',
    color: 'from-amber-600 to-red-700',
    accentColor: 'rose',
    serviceType: 'challanSearch',
    retailRate: 20,
    wholesaleRate: 10,
    placeholder: 'उदा. UP32AB1234 या चालान सं.',
    inputLabel: 'वाहन पंजीयन / चालान क्रमांक (Reg / Challan No)',
    sampleValue: 'UP32AB1234'
  },
  {
    id: 'epan',
    title: 'ई-पैन कार्ड डिजिटल डाउनलोड',
    subtitle: 'Income Tax Dept Official e-PAN Slip & Letter Format',
    category: 'pan',
    categoryName: 'पैन कार्ड सेवाएं',
    icon: Download,
    badge: 'e-PAN Letter',
    color: 'from-teal-600 to-emerald-700',
    accentColor: 'teal',
    serviceType: 'ePan',
    retailRate: 25,
    wholesaleRate: 10,
    placeholder: 'उदा. ABCDE1234F',
    inputLabel: '10-अंकीय पैन / पावती संख्या (PAN / Ack No)',
    sampleValue: 'ABCDE1234F'
  },
  {
    id: 'receipt',
    title: 'जन सेवा केंद्र बिल / टैक्स रसीद',
    subtitle: 'Branded Cyber Cafe Counter Cash Receipt Maker',
    category: 'utility',
    categoryName: 'बिल व रसीद सेवाएं',
    icon: FileText,
    badge: 'Tax Slip',
    color: 'from-purple-600 to-indigo-700',
    accentColor: 'purple',
    serviceType: 'receiptMaker',
    retailRate: 15,
    wholesaleRate: 5,
    placeholder: 'उदा. 9876543210',
    inputLabel: 'ग्राहक मोबाइल नंबर (Customer Mobile)',
    sampleValue: '9876543210'
  }
];

export default function ServicePage({
  activeToolId = 'rc',
  onSelectTool,
  onBack,
  selectedCafe,
  customerSession,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  isOperator = false,
  onOpenWallet,
  onOpenB2bWallet,
  onBalanceUpdated,
  disabledTools = [],
  theme = 'light'
}) {
  const currentTool = INSTANT_TOOLS.find(t => t.id === activeToolId) || INSTANT_TOOLS[0];
  const photoInputRef = useRef(null);
  const signInputRef = useRef(null);

  // =========================================================================
  // AUTO-CLEARING INPUT FORM STATES (ZERO LINGERING DATA ON TOOL SWITCH)
  // =========================================================================
  const [primaryInput, setPrimaryInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [fatherName, setFatherName] = useState('');
  
  // Real HTML5 Date Picker for DOB & Dates (strictly YYYY-MM-DD)
  const [dobDate, setDobDate] = useState('1990-08-15');
  const [gender, setGender] = useState('MALE');
  const [secondaryInput, setSecondaryInput] = useState(''); // e.g. Cert No, Ack No, Discom
  const [addressInput, setAddressInput] = useState('');

  // Photo & Signature Upload / Picker states
  const [photoData, setPhotoData] = useState(SAMPLE_PHOTOS.male);
  const [signData, setSignData] = useState(SAMPLE_SIGNS.sign1);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [isCustomSign, setIsCustomSign] = useState(false);

  // Execution & Preview States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [cardSide, setCardSide] = useState('both'); // 'both', 'front', 'back'
  
  // Order History
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Clear all states cleanly whenever user switches service
  useEffect(() => {
    resetForm();
    fetchOrderHistory();
  }, [activeToolId]);

  const resetForm = () => {
    setPrimaryInput('');
    setCustomerName('');
    setFatherName('');
    setDobDate('1990-08-15');
    setGender('MALE');
    setSecondaryInput('');
    setAddressInput('');
    setPhotoData(SAMPLE_PHOTOS.male);
    setSignData(SAMPLE_SIGNS.sign1);
    setIsCustomPhoto(false);
    setIsCustomSign(false);
    setCurrentResult(null);
    setErrorMsg('');
  };

  // Fetch persistent order history
  const fetchOrderHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const list = await res.json();
        setOrderHistory(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Convert HTML5 YYYY-MM-DD to Indian DD/MM/YYYY
  const formatDobDisplay = (isoStr) => {
    if (!isoStr) return '15/08/1990';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  };

  // 1-Click Autofill Sample
  const handleAutofillSample = () => {
    setPrimaryInput(currentTool.sampleValue);
    setDobDate('1992-07-20');
    setGender('MALE');
    setPhotoData(SAMPLE_PHOTOS.male);
    setSignData(SAMPLE_SIGNS.sign1);

    if (currentTool.id === 'rc') {
      setCustomerName('राजेश कुमार');
      setFatherName('श्री रामेश्वर दयाल');
      setSecondaryInput('MARUTI SWIFT DZIRE VXI');
    } else if (currentTool.id === 'pan' || currentTool.id === 'epan') {
      setCustomerName('राजेश कुमार');
      setFatherName('श्री रामेश्वर दयाल');
      setSecondaryInput('N-8924018920');
    } else if (currentTool.id === 'aadhaar') {
      setCustomerName('अनिल वर्मा');
      setFatherName('श्री सत्य प्रकाश वर्मा');
      setAddressInput('मकान नं. 45, गांधी नगर, हरदोई, उत्तर प्रदेश - 241001');
    } else if (currentTool.id === 'voter') {
      setCustomerName('धर्मेन्द्र मिश्रा');
      setFatherName('श्री कमला कांत मिश्रा');
      setSecondaryInput('156 - हरदोई सदर');
    } else if (currentTool.id === 'ayushman') {
      setCustomerName('श्रीमती आशा देवी');
      setFatherName('पत्नी श्री सुरेश कुमार');
      setSecondaryInput('UP-LKO-9824102');
    } else if (currentTool.id === 'ration') {
      setCustomerName('श्रीमती फूलमती देवी');
      setFatherName('पत्नी श्री राम कुमार');
      setSecondaryInput('पात्र गृहस्थी (PHH)');
    } else if (currentTool.id === 'electricity') {
      setCustomerName('महेश चंद्र');
      setFatherName('पुत्र श्री गिरधारी लाल');
      setSecondaryInput('UPPCL MVVNL ग्रामीण');
    } else if (currentTool.id === 'edistrict') {
      setCustomerName('हरिओम सिंह');
      setFatherName('श्री बृजभान सिंह');
      setSecondaryInput('789240019234');
    } else if (currentTool.id === 'dl') {
      setCustomerName('सतीश वर्मा');
      setFatherName('श्री रघुवीर वर्मा');
      setSecondaryInput('MCWG, LMV-NT');
    } else if (currentTool.id === 'challan') {
      setCustomerName('सुरेश कुमार');
      setFatherName('श्री राज नारायण');
      setSecondaryInput('बिना हेलमेट वाहन चालन (Section 194D)');
    } else if (currentTool.id === 'receipt') {
      setCustomerName('विकास रस्तोगी');
      setSecondaryInput('ऑनलाइन फॉर्म, आय प्रमाण पत्र व PVC कार्ड');
    }
    setErrorMsg('');
  };

  // Custom Photo file reader with canvas passport scaler (max 300x400)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('कृपया 10MB से छोटी फ़ोटो चुनें।');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxW = 300;
        const maxH = 400;
        if (width > maxW || height > maxH) {
          if (width / height > maxW / maxH) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          } else {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setPhotoData(canvas.toDataURL('image/jpeg', 0.9));
        setIsCustomPhoto(true);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Custom Signature file reader with canvas scaler (max 320x100)
  const handleSignUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxW = 320;
        const maxH = 100;
        if (width > maxW || height > maxH) {
          if (width / height > maxW / maxH) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          } else {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setSignData(canvas.toDataURL('image/png'));
        setIsCustomSign(true);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Instant Execution
  const handleInstantGenerate = async (e) => {
    if (e) e.preventDefault();
    let val = primaryInput.trim();
    if (!val) {
      val = currentTool.sampleValue;
      setPrimaryInput(val);
    }
    setErrorMsg('');
    setLoading(true);

    const effectivePhone = customerSession?.phone || (isOperator ? (selectedCafe?.phone || '9999999999') : '9876543210');
    const cafeId = selectedCafe?.id || (isOperator ? selectedCafe?.code : 'SMARTCAFE-HQ');

    const params = {
      customerName: customerName.trim() || undefined,
      fatherName: fatherName.trim() || undefined,
      dob: formatDobDisplay(dobDate),
      gender: gender
    };

    if (currentTool.id === 'rc') params.vehicleNumber = val.toUpperCase();
    if (currentTool.id === 'pan') {
      params.panNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (currentTool.id === 'aadhaar') {
      params.aadhaarNo = val;
      params.name = customerName.trim() || undefined;
      params.address = addressInput.trim() || undefined;
    }
    if (currentTool.id === 'voter') {
      params.epicNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (currentTool.id === 'ayushman') {
      params.pmjayId = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (currentTool.id === 'ration') {
      params.rationNo = val;
      params.headName = customerName.trim() || undefined;
    }
    if (currentTool.id === 'electricity') {
      params.consumerNo = val;
      params.consumerName = customerName.trim() || undefined;
    }
    if (currentTool.id === 'edistrict') {
      params.appNo = val;
      params.certNo = secondaryInput.trim() || '789240019234';
      params.applicantName = customerName.trim() || 'हरिओम सिंह';
    }
    if (currentTool.id === 'dl') {
      params.dlNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (currentTool.id === 'challan') {
      params.vehicleNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (currentTool.id === 'epan') {
      params.panNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (currentTool.id === 'receipt') {
      params.query = val;
      params.serviceDesc = secondaryInput.trim() || 'साइबर कैफे ऑनलाइन सेवाएं';
      params.customerName = customerName.trim() || 'आवेदक';
    }

    try {
      const startTime = Date.now();
      const res = await fetch('/api/services/execute-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId,
          customerPhone: effectivePhone,
          serviceType: currentTool.serviceType,
          operatorB2bDirect: isOperator,
          params
        })
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise(r => setTimeout(r, 350 - elapsed));
      }

      const data = await res.json();

      if (res.ok && data.success) {
        // Overlay custom user inputs if present
        const mergedData = {
          ...(data.generatedData || data.vehicleData || data.data || {}),
          ...(customerName.trim() ? { name: customerName.trim(), ownerName: customerName.trim(), applicantName: customerName.trim(), headName: customerName.trim(), consumerName: customerName.trim() } : {}),
          ...(fatherName.trim() ? { fatherName: fatherName.trim() } : {}),
          dob: formatDobDisplay(dobDate),
          gender: gender,
          photoUrl: photoData,
          signUrl: signData
        };

        setCurrentResult({
          ...data,
          generatedData: mergedData,
          vehicleData: mergedData
        });
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        fetchOrderHistory();
        if (onBalanceUpdated) onBalanceUpdated();
        setTimeout(() => {
          const el = document.getElementById('cr80-preview-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        await executeDirectLookupFallback(val);
      }
    } catch (err) {
      console.warn('execute-automated fallback triggered:', err);
      await executeDirectLookupFallback(val);
    } finally {
      setLoading(false);
    }
  };

  // Direct Lookup Fallback
  const executeDirectLookupFallback = async (val) => {
    try {
      const fallbackUrlMap = {
        rc: `/api/rc/lookup/${encodeURIComponent(val)}`,
        pan: `/api/pan/lookup/${encodeURIComponent(val)}`,
        aadhaar: `/api/aadhaar/lookup/${encodeURIComponent(val)}`,
        voter: `/api/voter/lookup/${encodeURIComponent(val)}`,
        ayushman: `/api/ayushman/lookup/${encodeURIComponent(val)}`,
        ration: `/api/ration/lookup/${encodeURIComponent(val)}`,
        electricity: `/api/electricity/lookup/${encodeURIComponent(val)}`,
        edistrict: `/api/edistrict/lookup/${encodeURIComponent(val)}/${encodeURIComponent(secondaryInput.trim() || '789240019234')}`,
        dl: `/api/dl/lookup/${encodeURIComponent(val)}`,
        challan: `/api/challan/lookup/${encodeURIComponent(val)}`,
        epan: `/api/epan/lookup/${encodeURIComponent(val)}`,
        receipt: `/api/receipt/lookup/${encodeURIComponent(val)}`
      };

      const targetUrl = fallbackUrlMap[currentTool.id] || `/api/rc/lookup/${encodeURIComponent(val)}`;
      const fRes = await fetch(targetUrl);
      if (fRes.ok) {
        const lookupData = await fRes.json();
        const mergedData = {
          ...lookupData,
          ...(customerName.trim() ? { name: customerName.trim(), ownerName: customerName.trim(), applicantName: customerName.trim(), headName: customerName.trim(), consumerName: customerName.trim() } : {}),
          ...(fatherName.trim() ? { fatherName: fatherName.trim() } : {}),
          dob: formatDobDisplay(dobDate),
          gender: gender,
          photoUrl: photoData,
          signUrl: signData
        };

        setCurrentResult({
          success: true,
          isInstantPreview: true,
          message: '✅ 1-क्लिक इंस्टेंट जनरेशन सफल! आधिकारिक प्रति तैयार है। (लाइव प्रीव्यू)',
          retailFee: currentTool.retailRate,
          wholesaleCost: currentTool.wholesaleRate,
          margin: currentTool.retailRate - currentTool.wholesaleRate,
          vehicleData: mergedData,
          generatedData: mergedData,
          data: mergedData
        });
        setErrorMsg('');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          const el = document.getElementById('cr80-preview-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const errJson = await fRes.json().catch(() => ({}));
        setErrorMsg(errJson.error || 'जनरेशन पूरा नहीं हो सका। कृपया नंबर जांचें।');
      }
    } catch (fallbackErr) {
      console.error(fallbackErr);
      setErrorMsg('सर्वर से संपर्क करने में असमर्थ। कृपया पुनः प्रयास करें।');
    }
  };

  // 1-Click Free Reprint from History
  const handleFreeReprint = (orderItem) => {
    const genData = orderItem.generatedData || orderItem.vehicleData || orderItem;
    setCurrentResult({
      success: true,
      isReprint: true,
      message: '✅ 1-क्लिक निःशुल्क रिप्रिंट लोड हो गया (वॉलेट से कोई कटौती नहीं हुई)।',
      retailFee: 0,
      wholesaleCost: 0,
      margin: 0,
      vehicleData: genData,
      generatedData: genData,
      order: orderItem
    });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // 1-Click Authentic Vector PDF Generation via jsPDF
  const handleDownloadPdf = () => {
    try {
      const val = primaryInput || currentTool.sampleValue;
      const isCard = ['rc', 'pan', 'aadhaar', 'voter', 'dl', 'ayushman'].includes(currentTool.id);
      const cardData = activeData || {
        name: customerName || 'राजेश कुमार',
        fatherName: fatherName || 'श्री रामेश्वर दयाल',
        dob: formatDobDisplay(dobDate),
        gender: gender,
        panNo: primaryInput || 'ABCDE1234F',
        aadhaarNo: primaryInput || '5412 8796 3214',
        epicNo: primaryInput || 'WBD1234567',
        pmjayId: primaryInput || 'PMJAY-UP-98214',
        regNo: primaryInput || 'UP32AB1234',
        makerModel: secondaryInput || 'MARUTI SWIFT DZIRE VXI',
        dlNo: primaryInput || 'UP1420110012345',
        rationNo: primaryInput || '215409823412',
        consumerNo: primaryInput || '7812903456',
        appNo: primaryInput || '241550010098241',
        certNo: secondaryInput || '789240019234',
        challanNo: primaryInput || 'UP8924018241',
        receiptNo: `REC-2026-${Date.now().toString().slice(-4)}`,
        address: addressInput || 'मकान नं. 45, गांधी नगर, हरदोई, उत्तर प्रदेश - 241001'
      };

      if (isCard) {
        // ISO CR-80 PVC Card: 85.6mm x 54mm
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [85.6, 54]
        });

        // 1. FRONT SIDE
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(1.5, 1.5, 82.6, 51, 2, 2, 'F');
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        doc.roundedRect(1.5, 1.5, 82.6, 51, 2, 2, 'D');

        // Header band
        if (currentTool.id === 'pan') {
          doc.setFillColor(6, 95, 70); // Emerald 800
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('INCOME TAX DEPARTMENT - GOVT. OF INDIA', 42.8, 6.5, { align: 'center' });
        } else if (currentTool.id === 'aadhaar') {
          doc.setFillColor(220, 38, 38); // Red 600
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('GOVERNMENT OF INDIA - UIDAI AADHAAR', 42.8, 6.5, { align: 'center' });
        } else if (currentTool.id === 'voter') {
          doc.setFillColor(217, 119, 6); // Amber 600
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('ELECTION COMMISSION OF INDIA (EPIC)', 42.8, 6.5, { align: 'center' });
        } else if (currentTool.id === 'dl') {
          doc.setFillColor(49, 46, 129); // Indigo 900
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('UNION OF INDIA - DRIVING LICENCE (SARATHI)', 42.8, 6.5, { align: 'center' });
        } else if (currentTool.id === 'rc') {
          doc.setFillColor(37, 99, 235); // Blue 600
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('MINISTRY OF ROAD TRANSPORT & HIGHWAYS (RC)', 42.8, 6.5, { align: 'center' });
        } else {
          doc.setFillColor(202, 138, 4); // Yellow 600
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('AYUSHMAN BHARAT - PM-JAY GOLDEN CARD', 42.8, 6.5, { align: 'center' });
        }

        // Details
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`NAME: ${cardData.name || cardData.ownerName || 'APPLICANT'}`, 5, 14);
        doc.setFont('helvetica', 'normal');
        doc.text(`FATHER: ${cardData.fatherName || '-'}`, 5, 19);
        doc.text(`DOB: ${cardData.dob}   GENDER: ${cardData.gender || 'MALE'}`, 5, 24);

        if (currentTool.id === 'rc') {
          doc.text(`MODEL: ${cardData.makerModel || 'MOTOR VEHICLE'}`, 5, 29);
          doc.setFontSize(8);
          doc.setFont('courier', 'bold');
          doc.setTextColor(37, 99, 235);
          doc.text(`REG NO: ${cardData.regNo || val}`, 5, 35);
        } else if (currentTool.id === 'dl') {
          doc.text(`VALIDITY: NT UPTO 2042`, 5, 29);
          doc.setFontSize(8);
          doc.setFont('courier', 'bold');
          doc.setTextColor(49, 46, 129);
          doc.text(`DL NO: ${cardData.dlNo || val}`, 5, 35);
        } else if (currentTool.id === 'pan') {
          doc.setFontSize(9);
          doc.setFont('courier', 'bold');
          doc.setTextColor(6, 95, 70);
          doc.text(`PAN: ${cardData.panNo || val}`, 5, 35);
        } else if (currentTool.id === 'aadhaar') {
          doc.setFontSize(8.5);
          doc.setFont('courier', 'bold');
          doc.setTextColor(220, 38, 38);
          doc.text(`AADHAAR: ${cardData.aadhaarNo || val}`, 5, 35);
        } else if (currentTool.id === 'voter') {
          doc.setFontSize(8.5);
          doc.setFont('courier', 'bold');
          doc.setTextColor(217, 119, 6);
          doc.text(`EPIC NO: ${cardData.epicNo || val}`, 5, 35);
        } else if (currentTool.id === 'ayushman') {
          doc.setFontSize(8.5);
          doc.setFont('courier', 'bold');
          doc.setTextColor(161, 98, 7);
          doc.text(`PM-JAY ID: ${cardData.pmjayId || val}`, 5, 35);
        }

        // Bottom Banner
        doc.setFontSize(5);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('CR-80 ISO 85.6mm x 54mm Smart PVC Card • Verified Official Layout', 42.8, 50, { align: 'center' });

        // 2. BACK SIDE PAGE
        doc.addPage([85.6, 54], 'landscape');
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(1.5, 1.5, 82.6, 51, 2, 2, 'F');
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        doc.roundedRect(1.5, 1.5, 82.6, 51, 2, 2, 'D');

        doc.setFontSize(6.5);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('CARD VERIFICATION & DETAILS (BACK SIDE)', 42.8, 7.5, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text(`ADDRESS: ${cardData.address || 'UTTAR PRADESH, INDIA'}`, 5, 15);
        doc.text(`ID REFERENCE: ${val}`, 5, 21);
        doc.text(`ISSUING AUTHORITY: Digital Services Portal (Govt. Verified)`, 5, 27);
        doc.text('If found, please return to nearest administrative authority.', 5, 33);

        doc.setFontSize(5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Smart Cafe Portal • Order ID: ${Date.now().toString().slice(-8)}`, 42.8, 50, { align: 'center' });

        doc.save(`${currentTool.id.toUpperCase()}_${val}.pdf`);
      } else {
        // A4 Portrait Slip / Receipt
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.5);
        doc.roundedRect(10, 10, 190, 277, 3, 3, 'D');

        // Header
        doc.setFillColor(241, 245, 249);
        doc.rect(10, 10, 190, 22, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(currentTool.title.toUpperCase(), 105, 20, { align: 'center' });

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(currentTool.subtitle, 105, 27, { align: 'center' });

        doc.setDrawColor(148, 163, 184);
        doc.line(10, 32, 200, 32);

        // Receipt Information Box
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`REFERENCE NUMBER / ID: ${val}`, 15, 42);
        doc.text(`CUSTOMER / APPLICANT: ${cardData.name || cardData.applicantName || cardData.consumerName || 'CUSTOMER'}`, 15, 50);
        doc.text(`FATHER / SPOUSE: ${cardData.fatherName || '-'}`, 15, 58);
        doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, 140, 42);
        doc.text(`STATUS: VERIFIED & COMPLETED`, 140, 50);

        // Details Grid
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 68, 180, 48, 2, 2, 'F');
        doc.rect(15, 68, 180, 48, 'D');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('OFFICIAL VERIFICATION DETAILS', 20, 76);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`Service Category: ${currentTool.categoryName}`, 20, 84);
        doc.text(`Primary ID: ${val}`, 20, 92);
        doc.text(`Secondary Reference: ${secondaryInput || cardData.certNo || '-'}`, 20, 100);
        doc.text(`Digital Verification Authority: National Government e-Services Portal`, 20, 108);

        // Official Stamp / Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('This is an authentic computer-generated official receipt/certificate and does not require a physical signature.', 105, 270, { align: 'center' });
        doc.text(`Generated at ${selectedCafe?.shopName || 'Smart Cafe'} • Powered by Smart Cafe B2B Portal`, 105, 275, { align: 'center' });

        doc.save(`${currentTool.id.toUpperCase()}_Slip_${val}.pdf`);
      }
    } catch (e) {
      console.error('PDF generation error, fallback to print:', e);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeData = currentResult?.generatedData || currentResult?.vehicleData || null;

  // Filtered orders for this specific tool
  const toolOrders = orderHistory.filter(o => {
    const matchesTool = o.serviceType === currentTool.serviceType || 
      (currentTool.id === 'rc' && (o.serviceType === 'rcDownload' || o.vehicleNumber));
    if (!matchesTool) return false;
    if (!historySearch) return true;
    const s = historySearch.toLowerCase();
    return (
      (o.refNumber && o.refNumber.toLowerCase().includes(s)) ||
      (o.docTitle && o.docTitle.toLowerCase().includes(s)) ||
      (o.customerName && o.customerName.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* 1. TOP BREADCRUMB & BACK TO DASHBOARD BAR */}
      {/* =================================================================== */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 dark:bg-[#0c162c]/95 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>← डैशबोर्ड पर वापस जाएं</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="cursor-pointer hover:underline font-semibold" onClick={onBack}>
              {isOperator ? 'संचालक डैशबोर्ड' : 'नागरिक पोर्टल'}
            </span>
            <span>›</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{currentTool.categoryName}</span>
            <span>›</span>
            <span className="font-black text-orange-600 dark:text-orange-400">{currentTool.title}</span>
          </div>
        </div>

        {/* Wholesale & Retail Price Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                {isOperator ? 'थोक B2B दर' : 'खुदरा शुल्क'}
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                ₹{isOperator ? currentTool.wholesaleRate : currentTool.retailRate}
              </span>
            </div>
            {isOperator && (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                मुनाफ़ा: +₹{currentTool.retailRate - currentTool.wholesaleRate}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
            className="bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            + रिचार्ज (शेष: ₹{isOperator ? sanchalakB2bBalance : walletBalance})
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. DEDICATED FULL-SCREEN SERVICE WORKSPACE (2-COLUMN RESPONSIVE) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: THE INPUT FORM (AUTO-CLEARING, HTML5 DATES, PHOTO) */}
        {/* ================================================================= */}
        <div className="no-print w-full lg:col-span-5 space-y-5">
          
          <div className="bg-white dark:bg-[#0c162c] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            {/* Service Header Info */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-900">
                    {currentTool.badge}
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⚡ 0.5s Engine
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <currentTool.icon className="w-5 h-5 text-orange-500" />
                  <span>{currentTool.title}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentTool.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-rose-500 font-bold flex items-center gap-1 transition cursor-pointer"
                title="फ़ॉर्म साफ़ करें"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>साफ़ करें</span>
              </button>
            </div>

            {/* Quick Autofill Sample Button */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs">
              <span className="text-amber-900 dark:text-amber-300 font-bold">
                परीक्षण हेतु नमूना डेटा भरें:
              </span>
              <button
                type="button"
                onClick={handleAutofillSample}
                className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-3 py-1 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                ⚡ नमूना डेटा भरें ({currentTool.sampleValue})
              </button>
            </div>

            {/* THE FORM */}
            <form onSubmit={handleInstantGenerate} className="space-y-4">
              
              {/* Primary Input (PAN, Aadhaar, Voter, RC, etc.) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{currentTool.inputLabel} *</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">आवश्यक</span>
                </label>
                <input
                  type="text"
                  required
                  value={primaryInput}
                  onChange={(e) => {
                    let raw = e.target.value;
                    if (['pan', 'epan'].includes(currentTool.id)) {
                      raw = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                    } else if (currentTool.id === 'aadhaar') {
                      const digits = raw.replace(/\D/g, '').slice(0, 12);
                      const parts = [];
                      for (let i = 0; i < digits.length; i += 4) {
                        parts.push(digits.substring(i, i + 4));
                      }
                      raw = parts.join(' ');
                    } else if (currentTool.id === 'voter') {
                      raw = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                    } else if (currentTool.id === 'rc') {
                      raw = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                    } else if (currentTool.id === 'dl') {
                      raw = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
                    } else if (currentTool.id === 'challan') {
                      raw = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                    } else if (currentTool.id === 'ayushman') {
                      raw = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 18);
                    } else if (['electricity', 'ration', 'edistrict'].includes(currentTool.id)) {
                      raw = raw.replace(/\D/g, '').slice(0, currentTool.id === 'edistrict' ? 16 : 12);
                    } else if (currentTool.id === 'receipt') {
                      raw = raw.replace(/\D/g, '').slice(0, 10);
                    } else {
                      raw = raw.toUpperCase();
                    }
                    setPrimaryInput(raw);
                  }}
                  placeholder={currentTool.placeholder}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-400 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-mono font-black text-base sm:text-lg uppercase tracking-wider focus:outline-none transition shadow-inner placeholder:text-slate-400"
                />
                {/* Validation Feedback */}
                <div className="flex items-center justify-between text-[11px] font-bold px-1 pt-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {currentTool.id === 'pan' && '10-अंकीय पैन नंबर (उदा. ABCDE1234F)'}
                    {currentTool.id === 'aadhaar' && '12-अंकीय आधार संख्या (4-4-4 प्रारूप में स्वतः स्पेस)'}
                    {currentTool.id === 'voter' && '10-अंकीय वोटर आईडी EPIC कोड'}
                    {currentTool.id === 'rc' && 'वाहन पंजीयन क्रमांक (उदा. UP32AB1234)'}
                    {currentTool.id === 'dl' && 'सारथी ड्राइविंग लाइसेंस क्रमांक'}
                    {currentTool.id === 'electricity' && 'उपभोक्ता खाता संख्या'}
                    {currentTool.id === 'ration' && '12-अंकीय राशन कार्ड संख्या'}
                    {currentTool.id === 'edistrict' && 'आवेदन क्रमांक संख्या'}
                    {currentTool.id === 'challan' && 'चालान / वाहन क्रमांक'}
                    {currentTool.id === 'receipt' && '10-अंकीय ग्राहक मोबाइल नंबर'}
                  </span>
                  {primaryInput && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {primaryInput.length} वर्ण
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Details: Name & Father's Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    आवेदक का नाम (Full Name)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="उदा. राजेश कुमार"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    पिता / पति का नाम (Father's Name)
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="उदा. श्री रामेश्वर दयाल"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* REAL HTML5 DATE PICKER FOR DOB & DATES (STRICT REQUIREMENT) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>जन्म तिथि / DOB (HTML5 Date Picker) *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dobDate}
                    onChange={(e) => setDobDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono block">
                    कार्ड पर छपेगा: {formatDobDisplay(dobDate)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    लिंग (Gender)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="MALE">MALE (पुरुष)</option>
                    <option value="FEMALE">FEMALE (महिला)</option>
                    <option value="OTHER">OTHER (अन्य)</option>
                  </select>
                </div>
              </div>

              {/* Optional Secondary Field: Cert No, Ack No, Discom, or Address */}
              {currentTool.id === 'aadhaar' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    पता (Full Address for Back of Aadhaar)
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="उदा. मकान नं. 45, गांधी नगर, हरदोई - 241001"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {currentTool.id === 'edistrict' ? 'प्रमाण पत्र क्रमांक (Certificate ID)' :
                     currentTool.id === 'receipt' ? 'सेवा विवरण (Service Description)' :
                     currentTool.id === 'dl' ? 'अधिकृत COV श्रेणी (उदा. LMV-NT, MCWG)' :
                     'अतिरिक्त विवरण / पावती संख्या (वैकल्पिक)'}
                  </label>
                  <input
                    type="text"
                    value={secondaryInput}
                    onChange={(e) => setSecondaryInput(e.target.value)}
                    placeholder={
                      currentTool.id === 'edistrict' ? '789240019234' :
                      currentTool.id === 'receipt' ? 'उदा. ऑनलाइन फॉर्म व PVC कार्ड' :
                      currentTool.id === 'dl' ? 'LMV-NT, MCWG' :
                      'वैकल्पिक संदर्भ'
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
              )}

              {/* PHOTO & SIGNATURE UPLOAD / PRESET PICKER (FOR PVC SMART CARDS) */}
              {['pan', 'aadhaar', 'voter', 'dl', 'ayushman'].includes(currentTool.id) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-orange-500" />
                      <span>स्मार्ट कार्ड फ़ोटो एवं हस्ताक्षर चयन</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">100% लाइव कार्ड प्रीव्यू</span>
                  </div>

                  {/* Photo Controls */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 bg-white shadow-xs">
                      <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        फ़ोटो चुनें अथवा अपनी अपलोड करें:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => { setPhotoData(SAMPLE_PHOTOS.male); setIsCustomPhoto(false); }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                        >
                          👤 पुरुष
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhotoData(SAMPLE_PHOTOS.female); setIsCustomPhoto(false); }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                        >
                          👩 महिला
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhotoData(SAMPLE_PHOTOS.senior); setIsCustomPhoto(false); }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                        >
                          👴 वरिष्ठ
                        </button>

                        <input
                          type="file"
                          ref={photoInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-[11px] font-black hover:bg-orange-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>अपलोड</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Signature Controls (for PAN & DL) */}
                  {['pan', 'dl'].includes(currentTool.id) && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="w-16 h-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={signData} alt="Signature" className="max-h-full max-w-full object-contain" />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                          हस्ताक्षर (Signature):
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => { setSignData(SAMPLE_SIGNS.sign1); setIsCustomSign(false); }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                          >
                            ✍️ नमूना 1
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSignData(SAMPLE_SIGNS.sign2); setIsCustomSign(false); }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                          >
                            ✍️ नमूना 2
                          </button>

                          <input
                            type="file"
                            ref={signInputRef}
                            onChange={handleSignUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => signInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>हस्ताक्षर अपलोड</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black px-6 py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>0.5s में जनरेट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>⚡ 1-क्लिक जनरेट करें (0.5 Sec Engine)</span>
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: 100% REAL FULL-COLOR HD ISO CR-80 PVC SMART CARD */}
        {/* ================================================================= */}
        <div id="cr80-preview-anchor" className="w-full lg:col-span-7 space-y-4 max-w-full">
          
          {/* Action Bar (Print & Download Controls) */}
          <div className="no-print bg-white dark:bg-[#0c162c] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  {currentResult?.isReprint ? '🔄 निःशुल्क रिप्रिंट प्रति तैयार है' : '✅ आधिकारिक ISO CR-80 PVC स्मार्ट कार्ड प्रीव्यू'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  85.6mm × 54mm मानक आयाम • कटिंग मार्क्स एवं सत्यापित QR कोड सहित
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Card Side Toggle */}
              {['pan', 'aadhaar', 'voter', 'dl', 'rc'].includes(currentTool.id) && (
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCardSide('both')}
                    className={`px-3 py-1.5 rounded-lg transition ${cardSide === 'both' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    दोनों तरफ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('front')}
                    className={`px-3 py-1.5 rounded-lg transition ${cardSide === 'front' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('back')}
                    className={`px-3 py-1.5 rounded-lg transition ${cardSide === 'back' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Back
                  </button>
                </div>
              )}

              {/* 1-Click Print */}
              <button
                type="button"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ प्रिंट निकालें</span>
              </button>

              {/* 1-Click Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                title="आधिकारिक वेक्टर PDF फ़ाइल सीधे डाउनलोड करें"
              >
                <Download className="w-4 h-4" />
                <span>📥 HD PDF डाउनलोड</span>
              </button>
            </div>

          </div>

          {/* RENDER CANVAS CONTAINER WITH PRECISION CUTTING MARKS */}
          <div className="bg-white dark:bg-[#070e1b] p-3 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md max-w-full overflow-hidden">
            
            {/* Cut-Marks Print Notice */}
            <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Scissors className="w-4 h-4 text-orange-500 shrink-0" />
                <span>मानक कटिंग बॉर्डर एवं क्रॉप गाइड (CR-80 Dimensions 85.6mm × 54mm)</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                रसीद ID: {currentResult?.order?.id || `ORD-${Date.now().toString().slice(-6)}`}
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-2 sm:p-8 bg-slate-50/80 dark:bg-[#0a1426]/70 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl min-h-[300px] max-w-full overflow-x-auto">
              
              {/* Fallback data if user hasn't generated yet */}
              {(() => {
                const cardData = activeData || {
                  name: customerName || 'राजेश कुमार',
                  fatherName: fatherName || 'श्री रामेश्वर दयाल',
                  dob: formatDobDisplay(dobDate),
                  gender: gender,
                  panNo: primaryInput || 'ABCDE1234F',
                  aadhaarNo: primaryInput || '5412 8796 3214',
                  maskedAadhaar: 'XXXX XXXX 3214',
                  epicNo: primaryInput || 'WBD1234567',
                  pmjayId: primaryInput || 'PMJAY-UP-98214',
                  coverageAmount: '₹5,00,000 मुफ़्त उपचार',
                  state: 'उत्तर प्रदेश',
                  yob: '1990',
                  regNo: primaryInput || 'UP32AB1234',
                  ownerName: customerName || 'राजेश कुमार',
                  makerModel: 'MARUTI SWIFT DZIRE VXI',
                  fuelType: 'PETROL',
                  regDate: '15/03/2019',
                  fitnessUpto: '14/03/2034',
                  rtoOffice: 'RTO LUCKNOW, UP',
                  chassisNo: 'MBHFE41B8H0129481',
                  engineNo: 'K12MN8920194',
                  insuranceCompany: 'NEW INDIA ASSURANCE',
                  insuranceUpto: '14/03/2027',
                  mvTaxUpto: 'L.T.T (LIFE TIME)',
                  rationNo: primaryInput || '215409823412',
                  headName: customerName || 'श्रीमती फूलमती देवी',
                  scheme: 'पात्र गृहस्थी (PHH)',
                  units: '4',
                  fpsDealer: 'उचित दर विक्रेता: रमेश चंद्र (दुकान सं. 1024)',
                  status: 'सक्रिय (ACTIVE)',
                  members: [
                    { index: '1', name: customerName || 'फूलमती देवी', relation: 'मुखिया', age: '48' },
                    { index: '2', name: 'राजेश कुमार', relation: 'बेटा', age: '26' },
                    { index: '3', name: 'सीमा देवी', relation: 'बहू', age: '23' },
                    { index: '4', name: 'आरव कुमार', relation: 'पोता', age: '3' }
                  ],
                  consumerNo: primaryInput || '7812903456',
                  consumerName: customerName || 'महेश चंद्र',
                  discom: 'मध्यांचल विद्युत वितरण निगम लिमिटेड (MVVNL)',
                  sanctionedLoad: '2.00 KW / LMV-1',
                  meterNo: 'MTR-982401',
                  billedUnits: '184',
                  billMonth: 'अक्टूबर 2026',
                  netPayable: '1,420',
                  txnId: 'TXN-UPPCL-9824018',
                  paymentDate: '12/10/2026',
                  appNo: primaryInput || '241550010098241',
                  certNo: secondaryInput || '789240019234',
                  applicantName: customerName || 'हरिओम सिंह',
                  certType: 'निवास प्रमाण पत्र (DOMICILE CERTIFICATE)',
                  annualIncome: '₹60,000 (साठ हजार रुपये मात्र)',
                  issuingAuthority: 'तहसीलदार सदर, हरदोई',
                  verificationStatus: 'सत्यापित (VERIFIED)',
                  dlNo: primaryInput || 'UP1420110012345',
                  bloodGroup: 'B+',
                  validNt: '14/08/2042',
                  covs: ['LMV (Light Motor Vehicle)', 'MCWG (Motor Cycle with Gear)'],
                  address: addressInput || 'मकान नं. 45, गांधी नगर, हरदोई, उत्तर प्रदेश - 241001',
                  challanNo: primaryInput || 'UP8924018241',
                  vehicleNo: primaryInput || 'UP32AB1234',
                  location: 'सदर चौराहा, हरदोई',
                  offense: 'बिना हेलमेट दोपहिया वाहन चालन',
                  section: 'धारा 194D MV Act',
                  amount: '1,000',
                  trafficPolice: 'यातायात पुलिस हरदोई (UP POLICE)',
                  ackNo: '88294018241',
                  downloadDate: '12/10/2026',
                  itdSignStatus: 'डिजिटली हस्ताक्षरित (NSDL e-Governance)',
                  receiptNo: 'REC-2026-9824',
                  customerPhone: primaryInput || '9876543210',
                  serviceDesc: secondaryInput || 'ऑनलाइन फॉर्म व PVC स्मार्ट कार्ड',
                  paymentMode: 'CASH / UPI',
                  date: '12/10/2026',
                  time: '18:40'
                };

                return (
                  <>
                    {/* ======================================================= */}
                    {/* 1. PAN CARD RENDERER (NSDL / UTI OFFICIAL FORMAT) */}
                    {/* ======================================================= */}
                    {currentTool.id === 'pan' && (
                      <>
                        {(cardSide === 'both' || cardSide === 'front') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            {/* ISO CR-80 Cutting Marks */}
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-[#eff6ff] via-white to-[#f0fdf4] rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b border-emerald-600 pb-1">
                                <div>
                                  <div className="text-[9px] font-black tracking-wider text-emerald-800 uppercase">आयकर विभाग • भारत सरकार</div>
                                  <div className="text-[7.5px] font-bold text-slate-600 uppercase">INCOME TAX DEPARTMENT • GOVT. OF INDIA</div>
                                </div>
                                <div className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                                  ITD
                                </div>
                              </div>

                              {/* Middle: Photo + Info + Signature */}
                              <div className="flex items-center gap-3 py-1">
                                <div className="w-[68px] h-[84px] bg-slate-200 border border-slate-400 rounded overflow-hidden shrink-0 shadow-2xs">
                                  <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 space-y-1 text-xs">
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">नाम / Name</span>
                                    <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">पिता का नाम / Father's Name</span>
                                    <span className="font-bold text-slate-800 text-[10px] block">{cardData.fatherName}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">जन्म तिथि / Date of Birth</span>
                                    <span className="font-mono font-bold text-slate-800 text-[10px]">{cardData.dob}</span>
                                  </div>

                                  {/* Signature Strip */}
                                  <div className="pt-0.5">
                                    <div className="w-24 h-5 border-b border-slate-400 overflow-hidden flex items-center">
                                      <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <span className="text-[6.5px] text-slate-400 font-bold block">हस्ताक्षर / Signature</span>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom PAN Box */}
                              <div className="bg-emerald-950 text-white rounded p-1 text-center font-mono font-black text-sm tracking-widest shadow-xs">
                                {cardData.panNo}
                              </div>
                            </div>
                          </div>
                        )}

                        {(cardSide === 'both' || cardSide === 'back') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="text-[8px] text-slate-500 text-center border-b pb-1">
                                इस कार्ड के खो जाने पर कृपया नजदीकी आयकर कार्यालय को सूचित करें।
                              </div>

                              <div className="flex items-center justify-between gap-3 py-2">
                                <div className="space-y-1 text-[9px] text-slate-700 leading-tight">
                                  <p className="font-bold">National Securities Depository Limited</p>
                                  <p>UTI Infrastructure Technology And Services Ltd.</p>
                                  <p className="font-mono text-[8px] text-slate-500">Issue Date: 14/03/2020</p>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`ITD:PAN:${cardData.panNo}|NAME:${cardData.name}|DOB:${cardData.dob}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500">
                                <span>CR-80 85.6mm × 54mm</span>
                                <span className="font-mono font-bold">{cardData.panNo}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 2. AADHAAR CARD RENDERER (UIDAI CR-80 PVC FORMAT) */}
                    {/* ======================================================= */}
                    {currentTool.id === 'aadhaar' && (
                      <>
                        {(cardSide === 'both' || cardSide === 'front') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b border-red-500 pb-1 flex items-center justify-between">
                                <div>
                                  <div className="text-[9px] font-black text-red-600 leading-tight">भारत सरकार</div>
                                  <div className="text-[7.5px] font-bold text-slate-700 leading-tight">Government of India</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] font-black tracking-wider text-red-600">मेरा आधार, मेरी पहचान</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 py-1">
                                <div className="w-[68px] h-[84px] bg-slate-100 border-2 border-slate-700 rounded overflow-hidden shrink-0 shadow-2xs">
                                  <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 space-y-1 text-xs">
                                  <div>
                                    <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                    <span className="text-[9px] text-slate-600 block">आत्मज: {cardData.fatherName}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-700">
                                    <div>जन्म तिथि / DOB: <span className="font-mono font-bold">{cardData.dob}</span></div>
                                    <div>लिंग / Gender: <span className="font-bold">{cardData.gender}</span></div>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-slate-300 pt-1 text-center">
                                <div className="font-mono font-black text-red-600 text-sm tracking-widest">
                                  {cardData.aadhaarNo}
                                </div>
                                <div className="text-[7.5px] text-slate-500">मेरा आधार, मेरी पहचान</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {(cardSide === 'both' || cardSide === 'back') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b pb-1 text-[8px] font-bold text-slate-700">
                                भारतीय विशिष्ट पहचान प्राधिकरण • UIDAI
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[9px]">
                                <div className="space-y-0.5 max-w-[200px]">
                                  <span className="font-bold text-slate-900 block">पता / Address:</span>
                                  <p className="text-slate-700 leading-tight">{cardData.address}</p>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`UIDAI:AADHAAR:${cardData.aadhaarNo}|NAME:${cardData.name}|DOB:${cardData.dob}|ADDRESS:${cardData.address}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                                <span>हेल्पलाइन: 1947 | www.uidai.gov.in</span>
                                <span className="font-bold text-red-600">{cardData.maskedAadhaar}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 3. VOTER SMART CARD (EPIC CR-80 FORMAT) */}
                    {/* ======================================================= */}
                    {currentTool.id === 'voter' && (
                      <>
                        {(cardSide === 'both' || cardSide === 'front') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-amber-50/40 via-white to-slate-50 rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b border-amber-600 pb-1 flex items-center justify-between">
                                <div>
                                  <div className="text-[9px] font-black text-amber-900 uppercase">भारत निर्वाचन आयोग</div>
                                  <div className="text-[7.5px] font-bold text-slate-600 uppercase">ELECTION COMMISSION OF INDIA</div>
                                </div>
                                <div className="font-mono font-black text-amber-900 text-xs px-2 py-0.5 bg-amber-100 rounded">
                                  {cardData.epicNo}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 py-1">
                                <div className="w-[68px] h-[84px] bg-slate-100 border border-slate-500 rounded overflow-hidden shrink-0 shadow-2xs">
                                  <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 space-y-1 text-xs">
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">मतदाता का नाम</span>
                                    <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">पिता/पति का नाम</span>
                                    <span className="font-bold text-slate-800 text-[10px] block">{cardData.fatherName}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[9px] text-slate-700">
                                    <span>लिंग: <strong>{cardData.gender}</strong></span>
                                    <span>DOB: <strong>{cardData.dob}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-600">
                                <span>विधानसभा: 156 - हरदोई सदर</span>
                                <span className="font-mono font-bold text-amber-800">{cardData.epicNo}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {(cardSide === 'both' || cardSide === 'back') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b pb-1 text-[8px] font-bold text-slate-700">
                                निर्वाचक रजिस्ट्रीकरण अधिकारी द्वारा जारी (Official Smart Card)
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[9px]">
                                <div className="space-y-1 text-slate-700 max-w-[200px]">
                                  <div>मतदान केंद्र: <strong>प्राथमिक विद्यालय, कक्ष सं. 1</strong></div>
                                  <div>भाग संख्या: <strong>142</strong> | क्रम संख्या: <strong>81</strong></div>
                                  <div className="text-[8px] text-slate-500 mt-1">पहचान पत्र को सुरक्षित रखें। मतदान दिवस पर अवश्य लाएं।</div>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`ECI:EPIC:${cardData.epicNo}|NAME:${cardData.name}|RELATION:${cardData.fatherName}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500">
                                <span>CR-80 मानक स्मार्ट कार्ड</span>
                                <span className="font-mono font-bold">{cardData.epicNo}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 4. DRIVING LICENCE (SARATHI PARIVAHAN CR-80 PVC) */}
                    {/* ======================================================= */}
                    {currentTool.id === 'dl' && (
                      <>
                        {(cardSide === 'both' || cardSide === 'front') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b border-indigo-700 pb-1 flex items-center justify-between">
                                <div>
                                  <div className="text-[8.5px] font-black text-indigo-900 uppercase">भारत संघ • UNION OF INDIA</div>
                                  <div className="text-[7.5px] font-bold text-slate-600 uppercase">सड़क परिवहन एवं राजमार्ग मंत्रालय (MoRTH)</div>
                                </div>
                                <div className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-black shadow-xs">
                                  DL
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 py-1">
                                <div className="w-[66px] h-[82px] bg-slate-100 border border-slate-400 rounded overflow-hidden shrink-0 shadow-2xs">
                                  <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 space-y-1 text-xs">
                                  <div>
                                    <span className="text-[7.5px] text-slate-500 font-bold block uppercase">डी.एल. सं. / DL Number</span>
                                    <span className="font-mono font-black text-indigo-950 text-[11px] block">{cardData.dlNo}</span>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] text-slate-500 font-bold block uppercase">नाम / Name</span>
                                    <span className="font-black text-slate-900 text-[10.5px] block">{cardData.name}</span>
                                  </div>
                                  <div className="grid grid-cols-2 text-[8px] text-slate-700 gap-1">
                                    <div>DOB: <strong className="font-mono">{cardData.dob}</strong></div>
                                    <div>BG: <strong className="text-rose-600">{cardData.bloodGroup}</strong></div>
                                  </div>
                                  {/* Signature */}
                                  <div className="w-20 h-4 border-b border-slate-400 overflow-hidden flex items-center">
                                    <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[7.5px] text-slate-600">
                                <span>वैधता (NT): <strong className="font-mono text-emerald-800">{cardData.validNt}</strong></span>
                                <span>{cardData.rtoOffice?.split(' ')[0]} {cardData.rtoOffice?.split(' ')[1]}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {(cardSide === 'both' || cardSide === 'back') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b pb-1 text-[8px] font-bold text-slate-700 flex justify-between">
                                <span>सारथी वाहन चालन अनुज्ञप्ति (Sarathi Portal)</span>
                                <span className="font-mono font-bold text-indigo-900">{cardData.dlNo}</span>
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[8.5px]">
                                <div className="space-y-1 max-w-[200px] text-slate-700">
                                  <div>
                                    <strong className="block text-slate-900">अधिकृत वाहन श्रेणी (COV):</strong>
                                    {(cardData.covs || []).map((c, i) => (
                                      <div key={i} className="text-[8px] text-indigo-900 font-bold">• {c}</div>
                                    ))}
                                  </div>
                                  <div className="text-[8px] text-slate-600 mt-1">
                                    पता: {cardData.address}
                                  </div>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`MORTH:DL:${cardData.dlNo}|NAME:${cardData.name}|COV:${(cardData.covs || []).join(',')}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[7.5px] text-slate-500 font-mono">
                                <span>जारी RTO: {cardData.rtoOffice}</span>
                                <span className="font-bold text-emerald-700">VALID</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 5. AYUSHMAN GOLDEN CARD */}
                    {/* ======================================================= */}
                    {currentTool.id === 'ayushman' && (
                      <div className="cr80-card-scaler relative group max-w-full">
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                        <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-500 rounded-xl border border-amber-600 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-950 font-sans print:shadow-none print:border-slate-800">
                          <div className="flex items-center justify-between border-b border-amber-600 pb-1">
                            <div>
                              <div className="text-[9px] font-black tracking-wider text-slate-950 uppercase">आयुष्मान भारत • PM-JAY</div>
                              <div className="text-[7.5px] font-bold text-slate-800 uppercase">PRADHAN MANTRI JAN AROGYA YOJANA</div>
                            </div>
                            <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
                              ₹5 लाख मुफ़्त
                            </span>
                          </div>

                          <div className="flex items-center gap-3 py-1">
                            <div className="w-[68px] h-[84px] bg-white/80 border border-amber-700 rounded overflow-hidden shrink-0 shadow-2xs">
                              <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 space-y-1 text-xs">
                              <div>
                                <span className="text-[8px] text-slate-700 font-bold block uppercase">लाभार्थी का नाम</span>
                                <span className="font-black text-slate-950 text-[11px] block">{cardData.name}</span>
                              </div>
                              <div className="text-[9px] text-slate-800 space-y-0.5">
                                <div>जन्म तिथि / DOB: <span className="font-mono font-bold">{cardData.dob}</span></div>
                                <div>लिंग: <span className="font-bold">{cardData.gender}</span></div>
                                <div>राज्य: <span className="font-bold">{cardData.state}</span></div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-950 text-white rounded p-1 flex items-center justify-between px-2 text-[10px] font-mono font-bold shadow-xs">
                            <span>{cardData.pmjayId}</span>
                            <span className="text-yellow-400 text-[8px] uppercase">{cardData.coverageAmount}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 6. VEHICLE RC CERTIFICATE & PVC SMART CARD */}
                    {/* ======================================================= */}
                    {currentTool.id === 'rc' && (
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {(cardSide === 'both' || cardSide === 'front') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b border-indigo-600 pb-1 flex items-center justify-between">
                                <div>
                                  <div className="text-[9px] font-black text-indigo-900">सड़क परिवहन एवं राजमार्ग मंत्रालय</div>
                                  <div className="text-[7.5px] font-bold text-slate-600">MINISTRY OF ROAD TRANSPORT & HIGHWAYS</div>
                                </div>
                                <span className="font-mono font-black text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {cardData.regNo}
                                </span>
                              </div>

                              <div className="text-[9.5px] space-y-1 text-slate-800 py-1">
                                <div>वाहन स्वामी: <strong className="text-slate-950">{cardData.ownerName}</strong></div>
                                <div>पिता का नाम: <span>{cardData.fatherName}</span></div>
                                <div>मॉडल: <strong className="text-indigo-950">{cardData.makerModel}</strong></div>
                                <div className="flex justify-between text-[9px] text-slate-600">
                                  <span>ईंधन: {cardData.fuelType}</span>
                                  <span>श्रेणी: {cardData.vehicleClass || 'MOTOR CAR'}</span>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-600">
                                <span>पंजीयन: {cardData.regDate}</span>
                                <span>फिटनेस: {cardData.fitnessUpto}</span>
                                <span className="font-bold text-emerald-600">ACTIVE</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {(cardSide === 'both' || cardSide === 'back') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b pb-1 text-[8px] font-bold text-slate-700">
                                वाहन पंजीयन स्मार्ट कार्ड • {cardData.rtoOffice?.split(',')[0]}
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[9px]">
                                <div className="space-y-0.5 text-slate-700 max-w-[200px]">
                                  <div>चेसिस: <span className="font-mono font-bold">{cardData.chassisNo}</span></div>
                                  <div>इंजन: <span className="font-mono font-bold">{cardData.engineNo}</span></div>
                                  <div>बीमा: <span>{cardData.insuranceCompany?.split(' ')[0]}</span></div>
                                  <div>वैधता: <span className="font-mono font-bold">{cardData.insuranceUpto}</span></div>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`PARIVAHAN:RC:${cardData.regNo}|OWNER:${cardData.ownerName}|CHASSIS:${cardData.chassisNo}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                                <span>TAX: {cardData.mvTaxUpto}</span>
                                <span className="font-bold">{cardData.regNo}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 7. RATION CARD NFSA SLIP */}
                    {/* ======================================================= */}
                    {currentTool.id === 'ration' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-emerald-800 uppercase">खाद्य एवं रसद विभाग • उत्तर प्रदेश FCS</div>
                            <h3 className="text-base font-black text-slate-900">राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) राशन पर्ची</h3>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`FCS:RATION:${cardData.rationNo}|HEAD:${cardData.headName}|UNITS:${cardData.units}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">कार्ड नंबर</span>
                            <strong className="font-mono text-emerald-800">{cardData.rationNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">मुखिया का नाम</span>
                            <strong>{cardData.headName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">योजना</span>
                            <strong className="text-blue-800">{cardData.scheme}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">कुल यूनिट</span>
                            <strong className="text-purple-800">{cardData.units} यूनिट</strong>
                          </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden text-xs">
                          <div className="bg-slate-900 text-white p-2 font-bold grid grid-cols-12 text-[10px]">
                            <span className="col-span-2">क्र.सं.</span>
                            <span className="col-span-5">सदस्य का नाम</span>
                            <span className="col-span-3">संबंध</span>
                            <span className="col-span-2 text-right">आयु</span>
                          </div>
                          <div className="divide-y text-[11px]">
                            {(cardData.members || []).map((m, idx) => (
                              <div key={idx} className="p-1.5 grid grid-cols-12">
                                <span className="col-span-2 font-mono">{m.index}</span>
                                <span className="col-span-5 font-bold">{m.name}</span>
                                <span className="col-span-3 text-slate-600">{m.relation}</span>
                                <span className="col-span-2 text-right">{m.age} वर्ष</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{cardData.fpsDealer}</span>
                          <span className="font-bold text-emerald-700">{cardData.status}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 8. ELECTRICITY BILL SLIP */}
                    {/* ======================================================= */}
                    {currentTool.id === 'electricity' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-amber-700 uppercase">UPPCL • विद्युत वितरण निगम लि.</div>
                            <h3 className="text-base font-black text-slate-900">{cardData.discom}</h3>
                            <p className="text-[11px] text-slate-600">विद्युत बिल एवं सफल भुगतान रसीद</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`UPPCL:BILL:${cardData.consumerNo}|NAME:${cardData.consumerName}|PAID:${cardData.netPayable}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">खाता संख्या</span>
                            <strong className="font-mono text-blue-700">{cardData.consumerNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">उपभोक्ता</span>
                            <strong>{cardData.consumerName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">लोड / टैरिफ</span>
                            <strong>{cardData.sanctionedLoad}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">मीटर संख्या</span>
                            <strong className="font-mono">{cardData.meterNo}</strong>
                          </div>
                        </div>

                        <div className="border rounded-xl p-3 bg-blue-50/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">कुल उपभोग एवं बिल राशि</span>
                            <span className="text-xs text-slate-700">{cardData.billedUnits} यूनिट्स • {cardData.billMonth}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-950">₹{cardData.netPayable}.00</span>
                            <span className="text-[10px] text-emerald-700 font-bold block">PAID (भुगतान सफल)</span>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-[11px] text-slate-600">
                          <span>ट्रांजेक्शन ID: <strong className="font-mono">{cardData.txnId}</strong></span>
                          <span>दिनांक: {cardData.paymentDate}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 9. E-DISTRICT VERIFICATION SLIP */}
                    {/* ======================================================= */}
                    {currentTool.id === 'edistrict' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-purple-800 uppercase">e-District उत्तर प्रदेश • राजस्व परिषद</div>
                            <h3 className="text-base font-black text-slate-900">प्रमाण पत्र ऑनलाइन सत्यापन विवरण</h3>
                            <p className="text-[11px] text-slate-600">{cardData.certType}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`EDISTRICT:APP:${cardData.appNo}|CERT:${cardData.certNo}|NAME:${cardData.applicantName}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">आवेदन क्रमांक</span>
                            <strong className="font-mono text-purple-900">{cardData.appNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">प्रमाण पत्र क्रमांक</span>
                            <strong className="font-mono text-emerald-800">{cardData.certNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">आवेदक का नाम</span>
                            <strong>{cardData.applicantName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">पिता/पति का नाम</span>
                            <strong>{cardData.fatherName}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{cardData.issuingAuthority}</span>
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {cardData.verificationStatus}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 10. VEHICLE CHALLAN SLIP */}
                    {/* ======================================================= */}
                    {currentTool.id === 'challan' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-rose-700 uppercase">MoRTH • e-Challan परिवहन पोर्टल</div>
                            <h3 className="text-base font-black text-slate-900">वाहन ई-चालान जांच एवं निस्तारण रसीद</h3>
                            <p className="text-[11px] text-slate-600">{cardData.trafficPolice}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`MORTH:CHALLAN:${cardData.challanNo}|VEHICLE:${cardData.vehicleNo}|AMT:${cardData.amount}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">चालान संख्या</span>
                            <strong className="font-mono text-rose-700">{cardData.challanNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">वाहन नंबर</span>
                            <strong className="font-mono text-indigo-900">{cardData.vehicleNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">वाहन स्वामी</span>
                            <strong>{cardData.ownerName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">स्थान</span>
                            <span className="truncate block text-slate-700 font-bold">{cardData.location}</span>
                          </div>
                        </div>

                        <div className="border rounded-xl p-3 bg-rose-50/60 border-rose-200 space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9.5px] font-mono text-rose-800 font-bold block">{cardData.section}</span>
                              <p className="text-xs font-black text-slate-900">{cardData.offense}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-rose-950 font-mono">₹{cardData.amount}.00</span>
                              <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md block mt-1">
                                चुकता (PAID)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>सत्यापित ऑनलाइन भुगतान</span>
                          <span className="font-mono text-[11px]">e-Challan Portal</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 11. E-PAN DOWNLOAD CERTIFICATE LETTER */}
                    {/* ======================================================= */}
                    {currentTool.id === 'epan' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-emerald-800 uppercase">आयकर विभाग • भारत सरकार (ITD)</div>
                            <h3 className="text-base font-black text-slate-900">ई-पैन कार्ड डिजिटल डाउनलोड प्रमाण पत्र</h3>
                            <p className="text-[11px] text-slate-600">National Securities Depository Limited (NSDL) / UTIITSL</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`ITD:EPAN:${cardData.panNo}|NAME:${cardData.name}|DOB:${cardData.dob}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">स्थायी खाता संख्या (PAN)</span>
                            <strong className="font-mono text-base font-black text-emerald-800">{cardData.panNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">पैन धारक का नाम</span>
                            <strong className="text-sm font-bold">{cardData.name}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">पिता का नाम</span>
                            <strong>{cardData.fatherName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">जन्म तिथि (DOB)</span>
                            <strong className="font-mono">{cardData.dob}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">पावती संख्या (Ack No)</span>
                            <strong className="font-mono text-slate-700">{cardData.ackNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">डाउनलोड दिनांक</span>
                            <strong className="font-mono">{cardData.downloadDate}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span className="text-emerald-800 font-bold">✔ {cardData.itdSignStatus}</span>
                          <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">वैध ई-पैन</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 12. CYBER CAFE COUNTER TAX RECEIPT */}
                    {/* ======================================================= */}
                    {currentTool.id === 'receipt' && (
                      <div className="w-full max-w-md bg-white border-2 border-slate-900 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="text-center border-b-2 border-slate-900 pb-2">
                          <h3 className="text-base font-black uppercase text-slate-950">
                            {selectedCafe?.shopName || 'डिजिटल जन सेवा केंद्र एवं साइबर कैफे'}
                          </h3>
                          <p className="text-[10px] text-slate-600">
                            {selectedCafe?.address || 'मेन मार्केट, ब्लॉक रोड, तहसील कार्यालय के सामने'}
                          </p>
                          <p className="text-[10px] font-mono font-bold text-slate-700">
                            मो. {selectedCafe?.phone || '9876543210'}
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-xl border">
                          <div>रसीद सं: <strong className="font-mono text-indigo-900">{cardData.receiptNo}</strong></div>
                          <div>दिनांक: <strong className="font-mono">{cardData.date} {cardData.time}</strong></div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-500">ग्राहक का नाम:</span>
                            <strong className="text-slate-900">{cardData.name}</strong>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-500">ग्राहक मोबाइल:</span>
                            <span className="font-mono font-bold">{cardData.customerPhone}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-500">प्रदत्त सेवा विवरण:</span>
                            <strong className="text-slate-900">{cardData.serviceDesc}</strong>
                          </div>
                        </div>

                        <div className="bg-slate-950 text-white p-3 rounded-xl flex justify-between items-center">
                          <span className="font-bold text-sm">कुल प्राप्त राशि:</span>
                          <span className="font-mono font-black text-2xl text-yellow-400">₹30.00</span>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>अधिकृत रसीद • हस्ताक्षर की आवश्यकता नहीं</span>
                          <span className="font-bold text-emerald-700">सफल भुगतान</span>
                        </div>
                      </div>
                    )}

                  </>
                );
              })()}

            </div>

          </div>

          {/* =============================================================== */}
          {/* 3. PERSISTENT ORDER / FREE REPRINT HISTORY STRIP */}
          {/* =============================================================== */}
          <div className="no-print bg-white dark:bg-[#0c162c] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl">
                  <History className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    {currentTool.title} - प्रिंट एवं ऑर्डर इतिहास
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    पूर्व में जनरेट किए गए कार्ड कभी भी <strong className="text-emerald-600 dark:text-emerald-400">1-क्लिक में बिना वॉलेट काटे रिप्रिंट</strong> करें।
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="नंबर या नाम खोजें..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              {toolOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                  <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>इस सेवा के लिए अभी तक कोई दस्तावेज़ जनरेट नहीं हुआ है। बायीं तरफ फ़ॉर्म भरकर जनरेट करें।</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5">ऑर्डर ID</th>
                      <th className="p-2.5">विवरण</th>
                      <th className="p-2.5">कार्ड / संदर्भ</th>
                      <th className="p-2.5">दिनांक</th>
                      <th className="p-2.5">शुल्क</th>
                      <th className="p-2.5 text-right">निःशुल्क रिप्रिंट</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {toolOrders.map((order) => (
                      <tr key={order.id || order.orderId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {order.id || order.orderId}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          {order.docTitle || order.serviceTitle || currentTool.title}
                        </td>
                        <td className="p-2.5 font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {order.refNumber || order.vehicleNumber || '-'}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleString('hi-IN')}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{order.retailFee || currentTool.retailRate}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleFreeReprint(order)}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3 py-1 rounded-xl text-xs inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="1-क्लिक में रिप्रिंट खोलें"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>🖨️ रिप्रिंट</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
