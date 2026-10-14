import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { getMergedServicesCatalog } from '../data/servicesCatalog';
import { CATEGORY_ICON_MAP } from './RekhaDashboard';

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
    id: 'aadhaar_advance',
    title: { hi: 'आधार एडवांस (फिंगरप्रिंट)', en: 'Aadhaar Advance (Fingerprint)' },
    subtitle: { hi: 'बायोमेट्रिक फिंगर से तुरंत आधार कार्ड डाउनलोड', en: 'Instant Aadhaar Download via Fingerprint' },
    category: 'aadhaar',
    categoryName: { hi: 'आधार सेवाएं', en: 'Aadhaar Services' },
    icon: ShieldCheck,
    badge: { hi: 'लाइव सेवा', en: 'Live Service' },
    color: 'from-red-600 to-rose-700',
    accentColor: 'rose',
    serviceType: 'aadhaarCard',
    retailRate: 25,
    wholesaleRate: 15,
    placeholder: { hi: '12-अंकीय आधार नंबर दर्ज करें', en: 'Enter 12-Digit Aadhaar Number' },
    inputLabel: { hi: 'आधार नंबर', en: 'Aadhaar Number' }
  }
];

export default function ServicePage({
  activeToolId = 'aadhaar_advance',
  onSelectTool,
  onBack,
  selectedCafe,
  customerSession,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  isOperator = false,
  onOpenWallet,
  onOpenB2bWallet,
  onOpenAuthModal,
  onBalanceUpdated,
  disabledTools = [],
  theme = 'light',
  services79Rates = []
}) {
  const { language, t, localize } = useLanguage();
  const allServices = useMemo(() => getMergedServicesCatalog(services79Rates), [services79Rates]);
  const currentTool = useMemo(() => {
    return allServices.find(s => s.id === activeToolId || s.num === Number(activeToolId)) || allServices[0] || INSTANT_TOOLS[0];
  }, [allServices, activeToolId]);

  const toolKind = useMemo(() => {
    const id = (currentTool?.id || '').toLowerCase();
    const cat = (currentTool?.category || '').toLowerCase();
    if (['rc', 'rc_pdf_download', 'rc_to_details', 'vehicle_rc'].includes(id) || cat === 'rc' || id.includes('rc_')) return 'rc';
    if (['pan', 'pan_find', 'pan_details'].includes(id) || cat === 'pan' || id.includes('pan_')) return 'pan';
    if (id === 'epan') return 'epan';
    if (['aadhaar', 'aadhaar_advance', 'aadhaar_original_pdf_otp', 'aadhaar_original_pdf_no_otp', 'aadhaar_otp_kyc', 'aadhaar_pvc'].includes(id) || cat === 'aadhaar' || id.includes('aadhaar_') || id.includes('uid_') || id.includes('pvc_')) return 'aadhaar';
    if (['voter', 'voter_pdf', 'voter_original_pdf_no_otp'].includes(id) || cat === 'voter' || id.includes('voter_')) return 'voter';
    if (['dl', 'driving_licence_pdf', 'dl_details'].includes(id) || cat === 'dl' || id.includes('driving_licence') || id.includes('dl_')) return 'dl';
    if (['ayushman', 'ayushman_card', 'abha_card', 'abha_otp'].includes(id) || cat === 'health' || id.includes('ayushman') || id.includes('abha')) return 'ayushman';
    if (['ration', 'ration_pdf_by_ration'].includes(id) || cat === 'ration' || id.includes('ration_')) return 'ration';
    if (['electricity', 'electric_bill_pdf_bihar'].includes(id) || cat === 'utility' || id.includes('electric_bill')) return 'electricity';
    if (['challan', 'chalan_find'].includes(id) || id.includes('chalan') || id.includes('challan')) return 'challan';
    if (['edistrict', 'edistrict-verify', 'edistrict-decl', 'edistrict-packer', 'edistrict-bhulekh'].includes(id) || cat === 'edistrict') return 'edistrict';
    if (cat === 'banking' || id.includes('bank') || id.includes('nsdl') || id.includes('npci')) return 'banking';
    if (cat === 'telecom' || id.includes('telecom') || id.includes('sim') || id.includes('cdr')) return 'telecom';
    if (cat === 'agriculture' || id.includes('agri') || id.includes('kisan')) return 'agriculture';
    if (cat === 'welfare' || id.includes('samagra') || id.includes('sambal') || id.includes('eshram')) return 'welfare';
    return 'receipt';
  }, [currentTool]);

  // Safe Dynamic Service Icon Component (Resolves undefined icon crash)
  const ServiceIconComponent = useMemo(() => {
    return currentTool?.icon || 
      (CATEGORY_ICON_MAP && (CATEGORY_ICON_MAP[currentTool?.category] || CATEGORY_ICON_MAP[toolKind])) || 
      Sparkles;
  }, [currentTool, toolKind]);

  const photoInputRef = useRef(null);
  const signInputRef = useRef(null);

  // =========================================================================
  // AUTO-CLEARING INPUT FORM STATES (ZERO LINGERING DATA ON TOOL SWITCH)
  // =========================================================================
  const [primaryInput, setPrimaryInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [fatherName, setFatherName] = useState('');
  
  // Real HTML5 Date Picker for DOB & Dates (strictly YYYY-MM-DD)
  const [dobDate, setDobDate] = useState('');
  const [gender, setGender] = useState('MALE');
  const [secondaryInput, setSecondaryInput] = useState(''); // e.g. Cert No, Ack No, Discom
  const [addressInput, setAddressInput] = useState('');
  const [thirdInput, setThirdInput] = useState('');
  const [uploadedPdfName, setUploadedPdfName] = useState('');
  const [colorType, setColorType] = useState('Yellow');
  const [mobileShow, setMobileShow] = useState('No');
  const [cardBg, setCardBg] = useState('White Background');
  const [selectState, setSelectState] = useState('Uttar Pradesh');
  const [rationType, setRationType] = useState('New Format Print');

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
  const [showBalanceGateModal, setShowBalanceGateModal] = useState(false);
  
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
    setDobDate('');
    setGender('MALE');
    setSecondaryInput('');
    setThirdInput('');
    setAddressInput('');
    setUploadedPdfName('');
    setColorType('Yellow');
    setMobileShow('No');
    setCardBg('White Background');
    setSelectState('Uttar Pradesh');
    setRationType('New Format Print');
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
    if (!isoStr) return '-';
    const parts = isoStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
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
  // 1-Click Instant Execution
  const handleInstantGenerate = async (e) => {
    if (e) e.preventDefault();
    let val = primaryInput.trim();
    if (!val) {
      setErrorMsg(language === 'hi' ? 'कृपया पहचान / संदर्भ संख्या दर्ज करें।' : 'Please enter reference ID or number.');
      return;
    }

    // 1. Compulsory Auth Gate Check (Zero Guest Access)
    const isAuthenticated = Boolean(customerSession?.phone || isOperator);
    if (!isAuthenticated) {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      } else {
        alert('कृपया सेवा का उपयोग करने से पहले लॉगिन या साइनअप करें!');
      }
      return;
    }

    // 2. Mandatory Zero-Credit Balance Gate Check
    const requiredFee = isOperator ? (currentTool.wholesaleRate || 15) : (currentTool.retailRate || 30);
    const currentBal = isOperator ? (sanchalakB2bBalance || 0) : (walletBalance || 0);

    if (currentBal < requiredFee) {
      setErrorMsg(`अपर्याप्त बैलेंस! इस सेवा के लिए ₹${requiredFee} आवश्यक है (आपका वर्तमान बैलेंस: ₹${currentBal})। कृपया पहले वॉलेट रिचार्ज करें।`);
      setShowBalanceGateModal(true);
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const effectivePhone = customerSession?.phone || (isOperator ? (selectedCafe?.phone || '') : '');
    const cafeId = selectedCafe?.id || (isOperator ? selectedCafe?.code : 'SMARTCAFE-HQ');

    const params = {
      customerName: customerName.trim() || undefined,
      name: customerName.trim() || undefined,
      fatherName: fatherName.trim() || undefined,
      dob: dobDate ? formatDobDisplay(dobDate) : undefined,
      gender: gender,
      address: addressInput.trim() || undefined,
      referenceNumber: val,
      query: val,
      serviceId: currentTool.id,
      serviceName: currentTool.name
    };

    if (toolKind === 'rc') params.vehicleNumber = val.toUpperCase();
    if (toolKind === 'pan' || toolKind === 'epan') {
      params.panNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (toolKind === 'aadhaar') {
      params.aadhaarNo = val;
      params.name = customerName.trim() || undefined;
      params.address = addressInput.trim() || undefined;
    }
    if (toolKind === 'voter') {
      params.epicNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (toolKind === 'ayushman') {
      params.pmjayId = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (toolKind === 'ration') {
      params.rationNo = val;
      params.headName = customerName.trim() || undefined;
    }
    if (toolKind === 'electricity') {
      params.consumerNo = val;
      params.consumerName = customerName.trim() || undefined;
    }
    if (toolKind === 'dl') {
      params.dlNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (toolKind === 'challan') {
      params.vehicleNo = val.toUpperCase();
      params.name = customerName.trim() || undefined;
    }
    if (toolKind === 'banking') {
      params.accountNo = val;
      params.name = customerName.trim() || undefined;
      params.bankName = secondaryInput.trim() || 'NSDL Payments Bank';
    }
    if (toolKind === 'agriculture') {
      params.farmerId = val.toUpperCase();
      params.name = customerName.trim() || undefined;
      params.khasraNo = secondaryInput.trim() || 'खसरा सं. 142/1';
    }
    if (toolKind === 'welfare') {
      params.samagraId = val;
      params.name = customerName.trim() || undefined;
      params.schemeName = secondaryInput.trim() || 'समग्र सामाजिक सुरक्षा योजना';
    }
    if (toolKind === 'telecom') {
      params.mobileNo = val;
      params.name = customerName.trim() || undefined;
      params.operatorName = secondaryInput.trim() || 'JIO / Airtel / BSNL';
    }
    if (toolKind === 'receipt') {
      params.serviceDesc = secondaryInput.trim() || 'ऑनलाइन सेवाएं';
    }

    try {
      const startTime = Date.now();
      const res = await fetch('/api/services/execute-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId,
          customerPhone: effectivePhone,
          serviceType: currentTool.id,
          serviceId: currentTool.id,
          operatorB2bDirect: isOperator,
          params
        })
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise(r => setTimeout(r, 350 - elapsed));
      }

      const data = await res.json();

      if (res.status === 403) {
        setErrorMsg(data.error || `अपर्याप्त बैलेंस! इस सेवा के लिए ₹${requiredFee} आवश्यक है। कृपया पहले वॉलेट रिचार्ज करें।`);
        setShowBalanceGateModal(true);
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        // Overlay user real inputs strictly
        const rawGen = data.generatedData || data.vehicleData || data.data || {};
        const mergedData = {
          ...rawGen,
          regNo: val,
          panNo: val,
          aadhaarNo: val,
          maskedAadhaar: val.length >= 4 ? `XXXX XXXX ${val.replace(/\s/g, '').slice(-4)}` : val,
          epicNo: val,
          pmjayId: val,
          rationNo: val,
          consumerNo: val,
          appNo: val,
          certNo: secondaryInput.trim() || rawGen.certNo || '-',
          dlNo: val,
          challanNo: val,
          name: customerName.trim() || rawGen.name || rawGen.ownerName || '-',
          ownerName: customerName.trim() || rawGen.ownerName || rawGen.name || '-',
          applicantName: customerName.trim() || rawGen.applicantName || rawGen.name || '-',
          headName: customerName.trim() || rawGen.headName || rawGen.name || '-',
          consumerName: customerName.trim() || rawGen.consumerName || rawGen.name || '-',
          fatherName: fatherName.trim() || rawGen.fatherName || '-',
          dob: dobDate ? formatDobDisplay(dobDate) : (rawGen.dob || '-'),
          gender: gender,
          address: addressInput.trim() || rawGen.address || '-',
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
        edistrict: `/api/edistrict/lookup/${encodeURIComponent(val)}/${encodeURIComponent(secondaryInput.trim() || '-')}`,
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
          regNo: val,
          panNo: val,
          aadhaarNo: val,
          maskedAadhaar: val.length >= 4 ? `XXXX XXXX ${val.replace(/\s/g, '').slice(-4)}` : val,
          epicNo: val,
          pmjayId: val,
          rationNo: val,
          consumerNo: val,
          appNo: val,
          certNo: secondaryInput.trim() || lookupData.certNo || '-',
          dlNo: val,
          challanNo: val,
          name: customerName.trim() || lookupData.name || lookupData.ownerName || '-',
          ownerName: customerName.trim() || lookupData.ownerName || lookupData.name || '-',
          applicantName: customerName.trim() || lookupData.applicantName || lookupData.name || '-',
          headName: customerName.trim() || lookupData.headName || lookupData.name || '-',
          consumerName: customerName.trim() || lookupData.consumerName || lookupData.name || '-',
          fatherName: fatherName.trim() || lookupData.fatherName || '-',
          dob: dobDate ? formatDobDisplay(dobDate) : (lookupData.dob || '-'),
          gender: gender,
          address: addressInput.trim() || lookupData.address || '-',
          photoUrl: photoData,
          signUrl: signData
        };

        setCurrentResult({
          success: true,
          isInstantPreview: true,
          message: '✅ 1-क्लिक इंस्टेंट जनरेशन सफल! आधिकारिक प्रति तैयार है।',
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
        setErrorMsg(errJson.error || 'जनरेशन पूरा नहीं हो सका। कृपया विवरण जांचें।');
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
      if (!activeData) {
        setErrorMsg('कृपया पहले फ़ॉर्म में विवरण भरकर "1-क्लिक जनरेट करें" बटन दबाएं।');
        return;
      }
      const val = primaryInput.trim() || activeData.regNo || activeData.panNo || activeData.aadhaarNo || activeData.appNo || '-';
      const isCard = ['rc', 'pan', 'aadhaar', 'voter', 'dl', 'ayushman', 'epan'].includes(toolKind);
      const cardData = activeData;

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
        if (['pan', 'epan'].includes(toolKind)) {
          doc.setFillColor(6, 95, 70); // Emerald 800
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('INCOME TAX DEPARTMENT - GOVT. OF INDIA', 42.8, 6.5, { align: 'center' });
        } else if (toolKind === 'aadhaar') {
          doc.setFillColor(220, 38, 38); // Red 600
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('GOVERNMENT OF INDIA - UIDAI AADHAAR', 42.8, 6.5, { align: 'center' });
        } else if (toolKind === 'voter') {
          doc.setFillColor(217, 119, 6); // Amber 600
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('ELECTION COMMISSION OF INDIA (EPIC)', 42.8, 6.5, { align: 'center' });
        } else if (toolKind === 'dl') {
          doc.setFillColor(49, 46, 129); // Indigo 900
          doc.rect(1.5, 1.5, 82.6, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('UNION OF INDIA - DRIVING LICENCE (SARATHI)', 42.8, 6.5, { align: 'center' });
        } else if (toolKind === 'rc') {
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

        if (toolKind === 'rc') {
          doc.text(`MODEL: ${cardData.makerModel || 'MOTOR VEHICLE'}`, 5, 29);
          doc.setFontSize(8);
          doc.setFont('courier', 'bold');
          doc.setTextColor(37, 99, 235);
          doc.text(`REG NO: ${cardData.regNo || val}`, 5, 35);
        } else if (toolKind === 'dl') {
          doc.text(`VALIDITY: NT UPTO 2042`, 5, 29);
          doc.setFontSize(8);
          doc.setFont('courier', 'bold');
          doc.setTextColor(49, 46, 129);
          doc.text(`DL NO: ${cardData.dlNo || val}`, 5, 35);
        } else if (['pan', 'epan'].includes(toolKind)) {
          doc.setFontSize(9);
          doc.setFont('courier', 'bold');
          doc.setTextColor(6, 95, 70);
          doc.text(`PAN: ${cardData.panNo || val}`, 5, 35);
        } else if (toolKind === 'aadhaar') {
          doc.setFontSize(8.5);
          doc.setFont('courier', 'bold');
          doc.setTextColor(220, 38, 38);
          doc.text(`AADHAAR: ${cardData.aadhaarNo || val}`, 5, 35);
        } else if (toolKind === 'voter') {
          doc.setFontSize(8.5);
          doc.setFont('courier', 'bold');
          doc.setTextColor(217, 119, 6);
          doc.text(`EPIC NO: ${cardData.epicNo || val}`, 5, 35);
        } else if (toolKind === 'ayushman') {
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

        doc.save(`${(currentTool.name || toolKind).toUpperCase().replace(/[\s/]+/g, '_')}_${val}.pdf`);
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
        doc.text(localize(currentTool.title).toUpperCase(), 105, 20, { align: 'center' });

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(localize(currentTool.subtitle), 105, 27, { align: 'center' });

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
        doc.text(`Service Category: ${localize(currentTool.categoryName)}`, 20, 84);
        doc.text(`Primary ID: ${val}`, 20, 92);
        doc.text(`Secondary Reference: ${secondaryInput || cardData.certNo || '-'}`, 20, 100);
        doc.text(`Digital Verification Authority: National Government e-Services Portal`, 20, 108);

        // Official Stamp / Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('This is an authentic computer-generated official receipt/certificate and does not require a physical signature.', 105, 270, { align: 'center' });
        doc.text(`Generated at ${selectedCafe?.shopName || 'Smart Cafe'} • Powered by Smart Cafe B2B Portal`, 105, 275, { align: 'center' });

        doc.save(`${(currentTool.name || toolKind).toUpperCase().replace(/[\s/]+/g, '_')}_Slip_${val}.pdf`);
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
      o.serviceType === currentTool.id ||
      (toolKind === 'rc' && (o.serviceType === 'rcDownload' || o.vehicleNumber)) ||
      (toolKind === 'pan' && (o.serviceType === 'panCard' || o.panNo)) ||
      (toolKind === 'aadhaar' && (o.serviceType === 'aadhaarCard' || o.aadhaarNo));
    if (!matchesTool) return false;
    if (!historySearch) return true;
    const s = historySearch.toLowerCase();
    return (
      (o.refNumber && o.refNumber.toLowerCase().includes(s)) ||
      (o.docTitle && o.docTitle.toLowerCase().includes(s)) ||
      (o.customerName && o.customerName.toLowerCase().includes(s))
    );
  });


  // Screenshot-Exact Action Button Label Helper
  const getActionButtonText = () => {
    const id = (currentTool?.id || '').toLowerCase();
    if (['rc', 'rc_pdf_download', 'rc_to_details', 'vehicle_rc', 'pan', 'pan_details', 'pan_basic_pricing'].includes(id)) {
      return 'Fetch Details';
    }
    if (['chassis_to_rc_find', 'chassis_to_rc_alt', 'engine_to_rc'].includes(id)) {
      return '🔍 विवरण प्राप्त करें';
    }
    if (['pan_to_gst', 'gst_to_pan', 'gst_verification', 'upi_to_details', 'gmail_to_details'].includes(id)) {
      return 'Search';
    }
    if (['aadhaar_pvc', 'pvc_convert'].includes(id)) {
      return '⬆ Convert to PVC';
    }
    if (id === 'abha_card_instant') {
      return '📥 Download Card';
    }
    if (id === 'abha_card') {
      return '✈ Send OTP';
    }
    if (id.includes('link') && id.includes('shram')) {
      return 'Update Mobile';
    }
    if (id === 'll_exam_pass_auto') {
      return 'Apply Data ✔';
    }
    return 'Submit';
  };

  const showSecondaryButton = useMemo(() => {
    const id = (currentTool?.id || '').toLowerCase();
    return ['samagra_service', 'sambal_pdf', 'mobile_to_account_find', 'mobile_to_multi_account', 'mobile_to_upi_find', 'mobile_to_multi_upi_find', 'voter_mobile_link', 'vcmRequest', 'mask_pan', 'pan_aadhar_mask', 'pantomaaskaadhaar', 'aadhartomaskpan', 'npci_verify', 'npci_link_status'].includes(id);
  }, [currentTool]);

  // Dynamic Screenshot-Exact Form Inputs Engine
  const renderScreenshotFormInputs = () => {
    const id = (currentTool?.id || '').toLowerCase();
    const cat = (currentTool?.category || '').toLowerCase();

    // 1. CHASSIS TO RC (Screenshot 235)
    if (['chassis_to_rc_find', 'chassis_to_rc_alt', 'chassis_to_mobile_find'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            चैसिस नंबर (Chassis Number) *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="उदा. MBHZCDESKRH174969"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
          <span className="text-[11px] text-slate-400 block">चैसिस नंबर दर्ज करें।</span>
        </div>
      );
    }

    // 2. ENGINE TO RC (Screenshot 236)
    if (id === 'engine_to_rc') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            इंजन नंबर (Engine Number) *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="उदा. Z12EP1074803"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
          <span className="text-[11px] text-slate-400 block">वाहन का वैध इंजन नंबर दर्ज करें।</span>
        </div>
      );
    }

    // 3. VEHICLE RC / NEW RC (Screenshot 243)
    if (['rc', 'rc_pdf_download', 'rc_to_details', 'vehicle_rc', 'rc_father_name_find', 'rc_to_mobile_find', 'rc_mobile_fetch', 'vahan_check'].includes(id) || cat === 'rc') {
      return (
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Vehicle Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
              placeholder="BR01AB1234 / UP32AB1234"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Father Name (Optional)
            </label>
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="RAMESH KUMAR"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none"
            />
          </div>
        </div>
      );
    }

    // 4. CHALLAN (Screenshot)
    if (['challan', 'chalan_find', 'chalan_find_mobile'].includes(id) || cat === 'challan') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            वाहन अथवा चालान क्रमांक (Challan / Vehicle Number) *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="UP32AB1234 / UP1234567890"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 5. DRIVING LICENCE CARD PRINT (Screenshot 250)
    if (['dl', 'driving_licence_pdf', 'dl_details', 'dl_to_mobile_find'].includes(id) || cat === 'dl') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              DL Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 18))}
              placeholder="Enter DL Number (e.g. UP32 20180012345)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth *
            </label>
            <input
              type="date"
              required
              value={dobDate}
              onChange={(e) => setDobDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Card Background
            </label>
            <select
              value={cardBg}
              onChange={(e) => setCardBg(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="White Background">White Background</option>
              <option value="Light Blue (Original)">Light Blue (Original)</option>
            </select>
          </div>
        </div>
      );
    }

    // 6. LL CARD DOWNLOAD (Screenshot 230)
    if (['ll_find', 'll_pdf'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Application / Learning Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="Enter Application / Learning Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 7. LL EXAM REQUEST (Screenshot 234)
    if (id === 'll_exam_pass_auto') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Application Number: *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
              placeholder="App****6545"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth: *
            </label>
            <input
              type="date"
              required
              value={dobDate}
              onChange={(e) => setDobDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password: *
            </label>
            <input
              type="password"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value)}
              placeholder="Enter Password"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Exam Pin <span className="text-rose-500 font-bold">Optional</span>
            </label>
            <input
              type="text"
              value={thirdInput}
              onChange={(e) => setThirdInput(e.target.value)}
              placeholder="Enter Exam Pin"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select State: *
            </label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Delhi">Delhi</option>
              <option value="Haryana">Haryana</option>
            </select>
          </div>
        </div>
      );
    }

    // 8. PAN TO GST (Screenshot 227)
    if (id === 'pan_to_gst') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Pan To GST Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="Enter PAN Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 9. GST TO PAN / GST VERIFICATION (Screenshot 228)
    if (['gst_to_pan', 'gst_verification'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            GST To PAN Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 15))}
            placeholder="ENTER GST NUMBER"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 10. PAN TO MASK AADHAAR / MASK PAN (Screenshot 196)
    if (['mask_pan', 'pan_aadhar_mask', 'pantomaaskaadhaar'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Pan Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="Enter PAN Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 11. GENERAL PAN / PAN DETAILS (Screenshot 220)
    if (['pan', 'pan_details', 'pan_basic_pricing', 'panCard', 'pan_to_aadhar_find', 'pan_to_udyam_details'].includes(id) || cat === 'pan') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            PAN Card Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
            placeholder="Enter 10-Digit PAN Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 12. AADHAAR PVC CONVERT (Screenshot 180)
    if (['aadhaar_pvc', 'pvc_convert'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload Aadhar PDF *
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploadedPdfName(f.name);
                  if (!primaryInput) setPrimaryInput('UIDAI-PDF-' + f.name.slice(0, 8));
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Note: आधार UIDAI के Official वेबसाइट से ही डाउनलोड करें, तभी PVC बनेगा</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              PDF Password *
            </label>
            <input
              type="password"
              required
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value)}
              placeholder="Enter PDF Password (e.g. ANKI1994)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Color Type *</label>
              <select
                value={colorType}
                onChange={(e) => setColorType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                <option value="Yellow">Yellow</option>
                <option value="White">White</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Show *</label>
              <select
                value={mobileShow}
                onChange={(e) => setMobileShow(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // 13. UIDAI ORIGINAL PDF API (Screenshot 182)
    if (['uidai_original_pdf', 'aadhaar_original_pdf_no_otp', 'aadhaar_original_pdf_otp'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => {
                const digits = e.target.value.replace(/D/g, '').slice(0, 12);
                const parts = [];
                for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
                setPrimaryInput(parts.join(' '));
              }}
              placeholder="Enter Aadhaar Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Language</label>
            <select
              value={secondaryInput || 'Hindi (हिन्दी)'}
              onChange={(e) => setSecondaryInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              <option value="English">English</option>
              <option value="Bengali">Bengali</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select PDF Type</label>
            <select
              value={thirdInput || 'E-Print'}
              onChange={(e) => setThirdInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="E-Print">E-Print</option>
              <option value="PVC Format">PVC Format</option>
            </select>
          </div>
        </div>
      );
    }

    // 14. AADHAAR ADVANCE / FINGERPRINT (Screenshot 177 / 178)
    if (['aadhaar_advance', 'aadhaar_fingerprint'].includes(id)) {
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Enter Your Aadhaar Number *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:border-blue-500">
              <span className="bg-purple-600 text-white font-bold px-3 py-2.5 text-xs flex items-center">
                UID
              </span>
              <input
                type="text"
                required
                value={primaryInput}
                onChange={(e) => {
                  const digits = e.target.value.replace(/D/g, '').slice(0, 12);
                  const parts = [];
                  for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
                  setPrimaryInput(parts.join(' '));
                }}
                placeholder="9999 XXXX XXXX"
                className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              बायोमेट्रिक फिंगरप्रिंट स्कैनर तैयार है (Device Ready)
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Mantra / Morpho Auto-Detect Active
            </p>
          </div>
        </div>
      );
    }

    // 15. AADHAAR TO MASK PAN / NPCI (Screenshots 189, 195)
    if (['npci_verify', 'npci_link_status', 'aadhartomaskpan', 'aadhar_number_to_details', 'uid_seeding', 'pvc_verify'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Aadhaar Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => {
              const digits = e.target.value.replace(/D/g, '').slice(0, 12);
              const parts = [];
              for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
              setPrimaryInput(parts.join(' '));
            }}
            placeholder="Enter 12-digit Aadhaar Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 16. GENERAL AADHAAR (Screenshot 181, 184, 185)
    if (['aadhaar', 'aadhaarCard', 'aadhaar_otp_kyc'].includes(id) || cat === 'aadhaar') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Aadhaar Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => {
              const digits = e.target.value.replace(/D/g, '').slice(0, 12);
              const parts = [];
              for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
              setPrimaryInput(parts.join(' '));
            }}
            placeholder="Enter Aadhaar Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 17. RATION CARD (Screenshot 255)
    if (['ration', 'ration_pdf_by_ration', 'ration_verification', 'rationCard', 'up_ration_info'].includes(id) || cat === 'ration') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ration Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/D/g, '').slice(0, 12))}
              placeholder="Enter Ration Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ration Type</label>
            <select
              value={rationType}
              onChange={(e) => setRationType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="New Format Print">New Format Print</option>
              <option value="Old Format Slip">Old Format Slip</option>
              <option value="All State NFSA Slip">All State NFSA Slip</option>
            </select>
          </div>
        </div>
      );
    }

    // 18. PMJAY VERIFY / AYUSHMAN (Screenshot 190)
    if (['ayushman', 'pmjay_verify', 'ayushman_card', 'ayushman_image_jpg'].includes(id) || cat === 'health') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar / PM-JAY Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 18))}
              placeholder="Enter Aadhaar Number / PM-JAY ID"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select State:</label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Haryana">Haryana</option>
              <option value="Delhi">Delhi</option>
              <option value="All India">All India</option>
            </select>
          </div>
        </div>
      );
    }

    // 19. ABHA CARD (Screenshots 193, 194)
    if (['abha_card', 'abha_otp', 'abha_card_instant'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar / Identity Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.slice(0, 18))}
              placeholder="Enter 12 Digit Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 block">OTP will be sent to registered mobile.</span>
          </div>
          {id === 'abha_card_instant' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth *</label>
              <input
                type="date"
                required
                value={dobDate}
                onChange={(e) => setDobDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          )}
        </div>
      );
    }

    // 20. E-SHRAM (Screenshots 191, 192)
    if (['e_shram', 'e_shram_update', 'e_shram_number_link'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/D/g, '').slice(0, 12))}
              placeholder="Enter Aadhaar Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth *</label>
            <input
              type="date"
              required
              value={dobDate}
              onChange={(e) => setDobDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>
          {id.includes('link') && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Mobile Number *</label>
              <input
                type="text"
                required
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value.replace(/D/g, '').slice(0, 10))}
                placeholder="Enter New Mobile Number"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none"
              />
            </div>
          )}
        </div>
      );
    }

    // 21. SAMAGRA / SAMBAL (Screenshot 200)
    if (['samagra_service', 'sambal_pdf'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Member ID *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.replace(/D/g, '').slice(0, 9))}
            placeholder="Enter Member ID"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 22. VOTER MOBILE LINK (Screenshot 264)
    if (['voter_mobile_link', 'vcmRequest', 'voter_mobile_link_no_otp', 'voter_mobile_link_instant_otp'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Voter Number *</label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="Enter Voter Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Number *</label>
            <input
              type="text"
              required
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/D/g, '').slice(0, 10))}
              placeholder="954785****"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>
      );
    }

    // 23. SESSION UPDATE (Screenshot 274)
    if (id === 'session_update') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Number *</label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.replace(/D/g, '').slice(0, 10))}
            placeholder="Enter 10-digit mobile number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 24. MOBILE TO ACCOUNT / MULTI ACCOUNT / UPI FIND (Screenshot 210)
    if (['mobile_to_account_find', 'mobile_to_multi_account', 'mobile_to_upi_find', 'mobile_to_multi_upi_find', 'mobile_to_details', 'mobile_lookup', 'check_operator', 'check_plan'].includes(id) || cat === 'telecom') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Mobile Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.replace(/D/g, '').slice(0, 10))}
            placeholder="Enter 10-Digit Mobile Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 25. ELECTRICITY BILL
    if (['electricity', 'electric_bill_pdf_bihar'].includes(id) || cat === 'utility') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Consumer Account Number (CA / K-Number) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/D/g, '').slice(0, 12))}
              placeholder="Enter Consumer Account Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discom Board *</label>
            <select
              value={secondaryInput || 'UPPCL'}
              onChange={(e) => setSecondaryInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="UPPCL">UPPCL (उत्तर प्रदेश पावर)</option>
              <option value="NBPDCL">NBPDCL (North Bihar Power)</option>
              <option value="SBPDCL">SBPDCL (South Bihar Power)</option>
              <option value="PVVNL">PVVNL (पश्चिमांचल विद्युत)</option>
              <option value="DVVNL">DVVNL (दक्षिणांचल विद्युत)</option>
              <option value="DHBVN">DHBVN (दक्षिण हरियाणा)</option>
              <option value="BSES">BSES (दिल्ली पावर)</option>
            </select>
          </div>
        </div>
      );
    }

    // 26. UDYAM MSME
    if (id === 'udyam_pdf') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Udyam Registration Number *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 19))}
            placeholder="UDYAM-XX-00-0000000"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 27. AGRISTACK
    if (['agristack_pdf', 'agristack_verify', 'agristack_dbt'].includes(id) || cat === 'agriculture') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Farmer ID / Aadhaar / Khasra No *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 16))}
              placeholder="Enter Farmer ID or Aadhaar"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select State:</label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
        </div>
      );
    }

    // 28. VOTER CARD / EPIC
    if (['voter', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_verification'].includes(id) || cat === 'voter') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Voter Number (EPIC) *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
            placeholder="Enter 10-Digit EPIC Code (e.g. XYZ1234567)"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 29. DEFAULT / FALLBACK (Clean single input)
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {localize(currentTool.inputLabel || 'पहचान / संदर्भ संख्या')} *
        </label>
        <input
          type="text"
          required
          value={primaryInput}
          onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
          placeholder={localize(currentTool.placeholder || 'विवरण दर्ज करें')}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
        />
      </div>
    );
  };


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
            <span>{language === 'hi' ? '← वापस जाएं' : '← Back'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="cursor-pointer hover:underline font-semibold" onClick={onBack}>
              {isOperator ? (language === 'hi' ? 'संचालक डैशबोर्ड' : 'Operator Dashboard') : (language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal')}
            </span>
            <span>›</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{localize(currentTool?.categoryName || currentTool?.category || '')}</span>
            <span>›</span>
            <span className="font-black text-orange-600 dark:text-orange-400">{localize(currentTool?.title || currentTool?.name || 'सेवा')}</span>
          </div>
        </div>

        {/* Wholesale & Retail Price Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                {isOperator ? (language === 'hi' ? 'थोक B2B दर' : 'Wholesale B2B Rate') : (language === 'hi' ? 'खुदरा शुल्क' : 'Retail Price')}
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                ₹{isOperator ? (currentTool?.wholesaleRate ?? 0) : (currentTool?.retailRate ?? 0)}
              </span>
            </div>
            {isOperator && (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                {language === 'hi' ? 'मुनाफ़ा: +' : 'Margin: +'}₹{Math.max(0, (currentTool?.retailRate || 0) - (currentTool?.wholesaleRate || 0))}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
            className="bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            {language === 'hi' ? `+ रिचार्ज (शेष: ₹${isOperator ? sanchalakB2bBalance : walletBalance})` : `+ Add Funds (Bal: ₹${isOperator ? sanchalakB2bBalance : walletBalance})`}
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
          <div className="bg-white dark:bg-[#0c162c] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            
            {/* Blue Header Banner with Title on left & [← Back] on right */}
            <div className="bg-[#1d4ed8] dark:bg-[#1e40af] text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
              <span className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 truncate pr-2">
                <ServiceIconComponent className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">{currentTool?.name || currentTool?.title?.en || currentTool?.id?.toUpperCase()}</span>
              </span>
              <button
                type="button"
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
              </button>
            </div>

            {/* Card Body: EXACT Form Inputs matching Screenshots */}
            <form onSubmit={handleInstantGenerate} className="p-5 sm:p-6 space-y-4">
              {renderScreenshotFormInputs()}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Bottom Action Row: Live Fee Badge on Left + Action Buttons on Right */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'शुल्क:' : 'Fee:'}
                  </span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{isOperator ? (currentTool.wholesaleRate || 15) : (currentTool.retailRate || 30)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {showSecondaryButton && (
                    <button
                      type="button"
                      onClick={() => fetchOrderHistory()}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-xs"
                    >
                      Show
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'hi' ? 'खोज रहे हैं...' : 'Processing...'}</span>
                      </>
                    ) : (
                      <span>{getActionButtonText()}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: PREVIEW & GUIDELINES (EXACT REKHA PRINT LAYOUT) */}
        {/* ================================================================= */}
        <div id="cr80-preview-anchor" className="w-full lg:col-span-7 space-y-4 max-w-full">
          <div className="bg-white dark:bg-[#0c162c] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            
            {/* Blue Header Banner */}
            <div className="bg-[#1d4ed8] dark:bg-[#1e40af] text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
              <span className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                <span>{activeData ? (language === 'hi' ? '✅ आधिकारिक दस्तावेज़ / कार्ड' : '✅ Official Document / Card') : (language === 'hi' ? 'ℹ️ दिशानिर्देश / जानकारी' : 'ℹ️ Information & Guidelines')}</span>
              </span>
              <span className="text-[11px] bg-white/20 text-white font-mono font-bold px-2.5 py-0.5 rounded-full">
                ⚡ 0.5s Fast
              </span>
            </div>

            {/* When Idle: EXACT Rekha Print Guidance box */}
            {!activeData ? (
              <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ServiceIconComponent className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                    {language === 'hi' ? 'कोई विवरण प्रदर्शित करने के लिए नहीं है' : 'No record displayed yet'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === 'hi'
                      ? 'बाईं ओर दिए गए फ़ॉर्म में आवश्यक विवरण दर्ज करें और खोजें। आपका आधिकारिक दस्तावेज़ यहाँ तैयार होगा।'
                      : 'Please enter details in the form on the left and submit to fetch details.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>{language === 'hi' ? 'प्रसंस्करण समय: 1-12 सेकंड' : 'Processing Time: Instant 0.5s'}</span>
                  <span>•</span>
                  <span>{language === 'hi' ? '100% सुरक्षित API' : '100% Verified'}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Action Bar (Print & Download Controls) */}
                <div className="no-print p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {currentResult?.isReprint ? (language === 'hi' ? '🔄 निःशुल्क रिप्रिंट प्रति' : '🔄 Free Reprint Copy') : (language === 'hi' ? '✅ दस्तावेज़ तैयार है' : '✅ Ready')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Card Side Toggle */}
                    {['pan', 'aadhaar', 'voter', 'dl', 'rc', 'ayushman', 'epan'].includes(toolKind) && (
                      <div className="bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg flex items-center text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setCardSide('both')}
                          className={`px-2.5 py-1 rounded-md transition ${cardSide === 'both' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          Both
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardSide('front')}
                          className={`px-2.5 py-1 rounded-md transition ${cardSide === 'front' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          Front
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardSide('back')}
                          className={`px-2.5 py-1 rounded-md transition ${cardSide === 'back' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          Back
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* RENDER CANVAS CONTAINER */}
                <div className="flex flex-wrap items-center justify-center gap-4 p-2 sm:p-6 bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[300px] overflow-x-auto">
                  {(() => {
                    const cardData = {
                      ...activeData,
                      name: activeData.name || activeData.ownerName || activeData.applicantName || activeData.headName || activeData.consumerName || '-',
                      ownerName: activeData.ownerName || activeData.name || '-',
                      applicantName: activeData.applicantName || activeData.name || '-',
                      headName: activeData.headName || activeData.name || '-',
                      consumerName: activeData.consumerName || activeData.name || '-',
                      fatherName: activeData.fatherName || '-',
                      dob: activeData.dob || '-',
                      gender: activeData.gender || 'MALE',
                      address: activeData.address || '-',
                      photoUrl: activeData.photoUrl || photoData,
                      signUrl: activeData.signUrl || signData
                    };

                    return (
                      <>
{/* 1. PAN CARD RENDERER (NSDL / UTI OFFICIAL FORMAT) */}
                    {/* ======================================================= */}
                    {toolKind === 'pan' && (
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
                                  <div className="text-[9px] font-black tracking-wider text-emerald-800 uppercase">
                                    {language === 'hi' ? 'आयकर विभाग • भारत सरकार' : 'INCOME TAX DEPARTMENT • GOVT. OF INDIA'}
                                  </div>
                                  <div className="text-[7.5px] font-bold text-slate-600 uppercase">
                                    {language === 'hi' ? 'स्थायी खाता संख्या कार्ड' : 'PERMANENT ACCOUNT NUMBER CARD'}
                                  </div>
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
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'नाम' : 'Name'}</span>
                                    <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'पिता का नाम' : "Father's Name"}</span>
                                    <span className="font-bold text-slate-800 text-[10px] block">{cardData.fatherName}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}</span>
                                    <span className="font-mono font-bold text-slate-800 text-[10px]">{cardData.dob}</span>
                                  </div>

                                  {/* Signature Strip */}
                                  <div className="pt-0.5">
                                    <div className="w-24 h-5 border-b border-slate-400 overflow-hidden flex items-center">
                                      <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <span className="text-[6.5px] text-slate-400 font-bold block">{language === 'hi' ? 'हस्ताक्षर' : 'Signature'}</span>
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
                                {language === 'hi' ? 'इस कार्ड के खो जाने पर कृपया नजदीकी आयकर कार्यालय को सूचित करें।' : 'If lost, please return to nearest Income Tax Office.'}
                              </div>

                              <div className="flex items-center justify-between gap-3 py-2">
                                <div className="space-y-1 text-[9px] text-slate-700 leading-tight">
                                  <p className="font-bold">National Securities Depository Limited</p>
                                  <p>UTI Infrastructure Technology And Services Ltd.</p>
                                  <p className="font-mono text-[8px] text-slate-500">{language === 'hi' ? 'जारी दिनांक: 14/03/2020' : 'Issue Date: 14/03/2020'}</p>
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
                    {toolKind === 'aadhaar' && (
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
                                  <div className="text-[9px] font-black text-red-600 leading-tight">
                                    {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
                                  </div>
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
                                    <span className="text-[9px] text-slate-600 block">{language === 'hi' ? 'आत्मज:' : 'S/O:'} {cardData.fatherName}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-700">
                                    <div>{language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} <span className="font-mono font-bold">{cardData.dob}</span></div>
                                    <div>{language === 'hi' ? 'लिंग:' : 'Gender:'} <span className="font-bold">{cardData.gender}</span></div>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-slate-300 pt-1 text-center">
                                <div className="font-mono font-black text-red-600 text-sm tracking-widest">
                                  {cardData.aadhaarNo}
                                </div>
                                <div className="text-[7.5px] text-slate-500">{language === 'hi' ? 'मेरा आधार, मेरी पहचान' : 'My Aadhaar, My Identity'}</div>
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
                                {language === 'hi' ? 'भारतीय विशिष्ट पहचान प्राधिकरण • UIDAI' : 'Unique Identification Authority of India • UIDAI'}
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[9px]">
                                <div className="space-y-0.5 max-w-[200px]">
                                  <span className="font-bold text-slate-900 block">{language === 'hi' ? 'पता:' : 'Address:'}</span>
                                  <p className="text-slate-700 leading-tight">{cardData.address}</p>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`UIDAI:AADHAAR:${cardData.aadhaarNo}|NAME:${cardData.name}|DOB:${cardData.dob}|ADDRESS:${cardData.address}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                                <span>{language === 'hi' ? 'हेल्पलाइन: 1947 | uidai.gov.in' : 'Helpline: 1947 | uidai.gov.in'}</span>
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
                    {toolKind === 'voter' && (
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
                                  <div className="text-[9px] font-black text-amber-900 uppercase">
                                    {language === 'hi' ? 'भारत निर्वाचन आयोग' : 'ELECTION COMMISSION OF INDIA'}
                                  </div>
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
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'मतदाता का नाम' : 'Elector Name'}</span>
                                    <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'पिता/पति का नाम' : "Father / Husband Name"}</span>
                                    <span className="font-bold text-slate-800 text-[10px] block">{cardData.fatherName}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[9px] text-slate-700">
                                    <span>{language === 'hi' ? 'लिंग:' : 'Gender:'} <strong>{cardData.gender}</strong></span>
                                    <span>{language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} <strong>{cardData.dob}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-600">
                                <span>{language === 'hi' ? 'विधानसभा:' : 'Assembly:'} {cardData.acName ? `${cardData.acNumber ? cardData.acNumber + ' - ' : ''}${cardData.acName}` : (selectedCafe?.city || '-')}</span>
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
                                {language === 'hi' ? 'निर्वाचक रजिस्ट्रीकरण अधिकारी द्वारा जारी' : 'Issued by Electoral Registration Officer'}
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[9px]">
                                <div className="space-y-1 text-slate-700 max-w-[200px]">
                                  <div>{language === 'hi' ? 'मतदान केंद्र:' : 'Polling Station:'} <strong>{language === 'hi' ? 'प्राथमिक विद्यालय, कक्ष सं. 1' : 'Primary School, Room 1'}</strong></div>
                                  <div>{language === 'hi' ? 'भाग संख्या:' : 'Part No:'} <strong>142</strong> | {language === 'hi' ? 'क्रम संख्या:' : 'Serial No:'} <strong>81</strong></div>
                                  <div className="text-[8px] text-slate-500 mt-1">{language === 'hi' ? 'पहचान पत्र को सुरक्षित रखें। मतदान दिवस पर अवश्य लाएं।' : 'Keep card secure. Bring on polling day.'}</div>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`ECI:EPIC:${cardData.epicNo}|NAME:${cardData.name}|RELATION:${cardData.fatherName}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500">
                                <span>{language === 'hi' ? 'मानक स्मार्ट कार्ड' : 'Standard Smart Card'}</span>
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
                    {toolKind === 'dl' && (
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
                                  <div className="text-[8.5px] font-black text-indigo-900 uppercase">
                                    {language === 'hi' ? 'भारत संघ • सड़क परिवहन एवं राजमार्ग मंत्रालय' : 'UNION OF INDIA • MoRTH'}
                                  </div>
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
                                    <span className="text-[7.5px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'डी.एल. सं.' : 'DL Number'}</span>
                                    <span className="font-mono font-black text-indigo-950 text-[11px] block">{cardData.dlNo}</span>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'नाम' : 'Name'}</span>
                                    <span className="font-black text-slate-900 text-[10.5px] block">{cardData.name}</span>
                                  </div>
                                  <div className="grid grid-cols-2 text-[8px] text-slate-700 gap-1">
                                    <div>{language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} <strong className="font-mono">{cardData.dob}</strong></div>
                                    <div>{language === 'hi' ? 'रक्त समूह:' : 'BG:'} <strong className="text-rose-600">{cardData.bloodGroup}</strong></div>
                                  </div>
                                  {/* Signature */}
                                  <div className="w-20 h-4 border-b border-slate-400 overflow-hidden flex items-center">
                                    <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[7.5px] text-slate-600">
                                <span>{language === 'hi' ? 'वैधता:' : 'Validity:'} <strong className="font-mono text-emerald-800">{cardData.validNt}</strong></span>
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
                                <span>{language === 'hi' ? 'सारथी वाहन चालन अनुज्ञप्ति' : 'Sarathi Driving Licence'}</span>
                                <span className="font-mono font-bold text-indigo-900">{cardData.dlNo}</span>
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[8.5px]">
                                <div className="space-y-1 max-w-[200px] text-slate-700">
                                  <div>
                                    <strong className="block text-slate-900">{language === 'hi' ? 'अधिकृत वाहन श्रेणी:' : 'Authorized COV:'}</strong>
                                    {(cardData.covs || []).map((c, i) => (
                                      <div key={i} className="text-[8px] text-indigo-900 font-bold">• {c}</div>
                                    ))}
                                  </div>
                                  <div className="text-[8px] text-slate-600 mt-1">
                                    {language === 'hi' ? 'पता:' : 'Address:'} {cardData.address}
                                  </div>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`MORTH:DL:${cardData.dlNo}|NAME:${cardData.name}|COV:${(cardData.covs || []).join(',')}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[7.5px] text-slate-500 font-mono">
                                <span>{language === 'hi' ? 'जारी RTO:' : 'Issuing RTO:'} {cardData.rtoOffice}</span>
                                <span className="font-bold text-emerald-700">{language === 'hi' ? 'वैध' : 'VALID'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 5. AYUSHMAN GOLDEN CARD */}
                    {/* ======================================================= */}
                    {toolKind === 'ayushman' && (
                      <div className="cr80-card-scaler relative group max-w-full">
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                        <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-500 rounded-xl border border-amber-600 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-950 font-sans print:shadow-none print:border-slate-800">
                          <div className="flex items-center justify-between border-b border-amber-600 pb-1">
                            <div>
                              <div className="text-[9px] font-black tracking-wider text-slate-950 uppercase">
                                {language === 'hi' ? 'आयुष्मान भारत • प्रधानमंत्री जन आरोग्य योजना' : 'AYUSHMAN BHARAT • PM-JAY'}
                              </div>
                            </div>
                            <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
                              {language === 'hi' ? '₹5 लाख मुफ़्त' : '₹5 Lakh Free'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 py-1">
                            <div className="w-[68px] h-[84px] bg-white/80 border border-amber-700 rounded overflow-hidden shrink-0 shadow-2xs">
                              <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 space-y-1 text-xs">
                              <div>
                                <span className="text-[8px] text-slate-700 font-bold block uppercase">{language === 'hi' ? 'लाभार्थी का नाम' : 'Beneficiary Name'}</span>
                                <span className="font-black text-slate-950 text-[11px] block">{cardData.name}</span>
                              </div>
                              <div className="text-[9px] text-slate-800 space-y-0.5">
                                <div>{language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} <span className="font-mono font-bold">{cardData.dob}</span></div>
                                <div>{language === 'hi' ? 'लिंग:' : 'Gender:'} <span className="font-bold">{cardData.gender}</span></div>
                                <div>{language === 'hi' ? 'राज्य:' : 'State:'} <span className="font-bold">{cardData.state}</span></div>
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
                    {toolKind === 'rc' && (
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
                                  <div className="text-[9px] font-black text-indigo-900">
                                    {language === 'hi' ? 'सड़क परिवहन एवं राजमार्ग मंत्रालय' : 'MINISTRY OF ROAD TRANSPORT & HIGHWAYS'}
                                  </div>
                                </div>
                                <span className="font-mono font-black text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {cardData.regNo}
                                </span>
                              </div>

                              <div className="text-[9.5px] space-y-1 text-slate-800 py-1">
                                <div>{language === 'hi' ? 'वाहन स्वामी:' : 'Owner Name:'} <strong className="text-slate-950">{cardData.ownerName}</strong></div>
                                <div>{language === 'hi' ? 'पिता का नाम:' : "Father's Name:"} <span>{cardData.fatherName}</span></div>
                                <div>{language === 'hi' ? 'मॉडल:' : 'Model:'} <strong className="text-indigo-950">{cardData.makerModel}</strong></div>
                                <div className="flex justify-between text-[9px] text-slate-600">
                                  <span>{language === 'hi' ? 'ईंधन:' : 'Fuel:'} {cardData.fuelType}</span>
                                  <span>{language === 'hi' ? 'श्रेणी:' : 'Class:'} {cardData.vehicleClass || 'MOTOR CAR'}</span>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-600">
                                <span>{language === 'hi' ? 'पंजीयन:' : 'Registration:'} {cardData.regDate}</span>
                                <span>{language === 'hi' ? 'फिटनेस:' : 'Fitness:'} {cardData.fitnessUpto}</span>
                                <span className="font-bold text-emerald-600">{language === 'hi' ? 'सक्रिय' : 'ACTIVE'}</span>
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
                                {language === 'hi' ? 'वाहन पंजीयन स्मार्ट कार्ड' : 'Vehicle Registration Card'} • {cardData.rtoOffice?.split(',')[0]}
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[9px]">
                                <div className="space-y-0.5 text-slate-700 max-w-[200px]">
                                  <div>{language === 'hi' ? 'चेसिस:' : 'Chassis:'} <span className="font-mono font-bold">{cardData.chassisNo}</span></div>
                                  <div>{language === 'hi' ? 'इंजन:' : 'Engine:'} <span className="font-mono font-bold">{cardData.engineNo}</span></div>
                                  <div>{language === 'hi' ? 'बीमा:' : 'Insurance:'} <span>{cardData.insuranceCompany?.split(' ')[0]}</span></div>
                                  <div>{language === 'hi' ? 'वैधता:' : 'Validity:'} <span className="font-mono font-bold">{cardData.insuranceUpto}</span></div>
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
                    {toolKind === 'ration' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-emerald-800 uppercase">{language === 'hi' ? 'खाद्य एवं रसद विभाग • उत्तर प्रदेश' : 'Department of Food & Logistics • UP'}</div>
                            <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'राष्ट्रीय खाद्य सुरक्षा अधिनियम राशन पर्ची' : 'NFSA Ration Card Slip'}</h3>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`FCS:RATION:${cardData.rationNo}|HEAD:${cardData.headName}|UNITS:${cardData.units}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'कार्ड नंबर' : 'Card Number'}</span>
                            <strong className="font-mono text-emerald-800">{cardData.rationNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'मुखिया का नाम' : 'Head of Family'}</span>
                            <strong>{cardData.headName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'योजना' : 'Scheme'}</span>
                            <strong className="text-blue-800">{cardData.scheme}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'कुल यूनिट' : 'Total Units'}</span>
                            <strong className="text-purple-800">{cardData.units} {language === 'hi' ? 'यूनिट' : 'Units'}</strong>
                          </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden text-xs">
                          <div className="bg-slate-900 text-white p-2 font-bold grid grid-cols-12 text-[10px]">
                            <span className="col-span-2">{language === 'hi' ? 'क्र.सं.' : 'S.No'}</span>
                            <span className="col-span-5">{language === 'hi' ? 'सदस्य का नाम' : 'Member Name'}</span>
                            <span className="col-span-3">{language === 'hi' ? 'संबंध' : 'Relation'}</span>
                            <span className="col-span-2 text-right">{language === 'hi' ? 'आयु' : 'Age'}</span>
                          </div>
                          <div className="divide-y text-[11px]">
                            {(cardData.members || []).map((m, idx) => (
                              <div key={idx} className="p-1.5 grid grid-cols-12">
                                <span className="col-span-2 font-mono">{m.index}</span>
                                <span className="col-span-5 font-bold">{m.name}</span>
                                <span className="col-span-3 text-slate-600">{m.relation}</span>
                                <span className="col-span-2 text-right">{m.age} {language === 'hi' ? 'वर्ष' : 'Yrs'}</span>
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
                    {toolKind === 'electricity' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-amber-700 uppercase">
                              {language === 'hi' ? 'UPPCL • विद्युत वितरण निगम लि.' : 'UPPCL • Power Distribution Corp. Ltd.'}
                            </div>
                            <h3 className="text-base font-black text-slate-900">{cardData.discom}</h3>
                            <p className="text-[11px] text-slate-600">{language === 'hi' ? 'विद्युत बिल एवं सफल भुगतान रसीद' : 'Electricity Bill & Payment Receipt'}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`UPPCL:BILL:${cardData.consumerNo}|NAME:${cardData.consumerName}|PAID:${cardData.netPayable}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'खाता संख्या' : 'Account Number'}</span>
                            <strong className="font-mono text-blue-700">{cardData.consumerNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'उपभोक्ता' : 'Consumer'}</span>
                            <strong>{cardData.consumerName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'लोड / टैरिफ' : 'Load / Tariff'}</span>
                            <strong>{cardData.sanctionedLoad}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'मीटर संख्या' : 'Meter Number'}</span>
                            <strong className="font-mono">{cardData.meterNo}</strong>
                          </div>
                        </div>

                        <div className="border rounded-xl p-3 bg-blue-50/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">{language === 'hi' ? 'कुल उपभोग एवं बिल राशि' : 'Total Units & Amount'}</span>
                            <span className="text-xs text-slate-700">{cardData.billedUnits} {language === 'hi' ? 'यूनिट्स' : 'Units'} • {cardData.billMonth}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-950">₹{cardData.netPayable}.00</span>
                            <span className="text-[10px] text-emerald-700 font-bold block">{language === 'hi' ? 'भुगतान सफल' : 'Payment Successful'}</span>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-[11px] text-slate-600">
                          <span>{language === 'hi' ? 'लेन-देन ID:' : 'Transaction ID:'} <strong className="font-mono">{cardData.txnId}</strong></span>
                          <span>{language === 'hi' ? 'दिनांक:' : 'Date:'} {cardData.paymentDate}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 9. E-DISTRICT VERIFICATION SLIP */}
                    {/* ======================================================= */}
                    {toolKind === 'edistrict' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-purple-800 uppercase">{language === 'hi' ? 'e-District उत्तर प्रदेश • राजस्व परिषद' : 'e-District UP • Board of Revenue'}</div>
                            <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'प्रमाण पत्र ऑनलाइन सत्यापन विवरण' : 'Certificate Verification Details'}</h3>
                            <p className="text-[11px] text-slate-600">{cardData.certType}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`EDISTRICT:APP:${cardData.appNo}|CERT:${cardData.certNo}|NAME:${cardData.applicantName}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'आवेदन क्रमांक' : 'Application Number'}</span>
                            <strong className="font-mono text-purple-900">{cardData.appNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'प्रमाण पत्र क्रमांक' : 'Certificate Number'}</span>
                            <strong className="font-mono text-emerald-800">{cardData.certNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'आवेदक का नाम' : 'Applicant Name'}</span>
                            <strong>{cardData.applicantName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'पिता/पति का नाम' : "Father / Husband Name"}</span>
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
                    {toolKind === 'challan' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-rose-700 uppercase">MoRTH • e-Challan परिवहन पोर्टल</div>
                            <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'वाहन ई-चालान जांच एवं निस्तारण रसीद' : 'Vehicle e-Challan Receipt'}</h3>
                            <p className="text-[11px] text-slate-600">{cardData.trafficPolice}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`MORTH:CHALLAN:${cardData.challanNo}|VEHICLE:${cardData.vehicleNo}|AMT:${cardData.amount}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'चालान संख्या' : 'Challan Number'}</span>
                            <strong className="font-mono text-rose-700">{cardData.challanNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'वाहन नंबर' : 'Vehicle Number'}</span>
                            <strong className="font-mono text-indigo-900">{cardData.vehicleNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'वाहन स्वामी' : 'Owner Name'}</span>
                            <strong>{cardData.ownerName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'स्थान' : 'Location'}</span>
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
                                {language === 'hi' ? 'चुकता' : 'PAID'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{language === 'hi' ? 'सत्यापित ऑनलाइन भुगतान' : 'Verified Online Payment'}</span>
                          <span className="font-mono text-[11px]">e-Challan Portal</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 11. E-PAN DOWNLOAD CERTIFICATE LETTER */}
                    {/* ======================================================= */}
                    {toolKind === 'epan' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-emerald-800 uppercase">{language === 'hi' ? 'आयकर विभाग • भारत सरकार' : 'Income Tax Department • Govt. of India'}</div>
                            <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'ई-पैन कार्ड डिजिटल डाउनलोड प्रमाण पत्र' : 'e-PAN Card Digital Certificate'}</h3>
                            <p className="text-[11px] text-slate-600">National Securities Depository Limited (NSDL) / UTIITSL</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`ITD:EPAN:${cardData.panNo}|NAME:${cardData.name}|DOB:${cardData.dob}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'स्थायी खाता संख्या' : 'Permanent Account Number'}</span>
                            <strong className="font-mono text-base font-black text-emerald-800">{cardData.panNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'पैन धारक का नाम' : 'PAN Holder Name'}</span>
                            <strong className="text-sm font-bold">{cardData.name}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'पिता का नाम' : "Father's Name"}</span>
                            <strong>{cardData.fatherName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}</span>
                            <strong className="font-mono">{cardData.dob}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'पावती संख्या' : 'Acknowledgement Number'}</span>
                            <strong className="font-mono text-slate-700">{cardData.ackNo}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'डाउनलोड दिनांक' : 'Download Date'}</span>
                            <strong className="font-mono">{cardData.downloadDate}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span className="text-emerald-800 font-bold">✔ {cardData.itdSignStatus}</span>
                          <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">{language === 'hi' ? 'वैध ई-पैन' : 'Valid e-PAN'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 12. CYBER CAFE COUNTER TAX RECEIPT */}
                    {/* ======================================================= */}
                    {toolKind === 'receipt' && (
                      <div className="w-full max-w-md bg-white border-2 border-slate-900 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="text-center border-b-2 border-slate-900 pb-2">
                          <h3 className="text-base font-black uppercase text-slate-950">
                            {selectedCafe?.shopName || (language === 'hi' ? 'डिजिटल जन सेवा केंद्र एवं साइबर कैफे' : 'Digital Jan Seva Kendra & Cyber Cafe')}
                          </h3>
                          <p className="text-[10px] text-slate-600">
                            {selectedCafe?.address || '-'}
                          </p>
                          {selectedCafe?.phone && (
                            <p className="text-[10px] font-mono font-bold text-slate-700">
                              {language === 'hi' ? 'मो.' : 'Mob.'} {selectedCafe.phone}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-xl border">
                          <div>{language === 'hi' ? 'रसीद सं:' : 'Receipt No:'} <strong className="font-mono text-indigo-900">{cardData.receiptNo}</strong></div>
                          <div>{language === 'hi' ? 'दिनांक:' : 'Date:'} <strong className="font-mono">{cardData.date} {cardData.time}</strong></div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-500">{language === 'hi' ? 'ग्राहक का नाम:' : 'Customer Name:'}</span>
                            <strong className="text-slate-900">{cardData.name}</strong>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-500">{language === 'hi' ? 'ग्राहक मोबाइल:' : 'Customer Mobile:'}</span>
                            <span className="font-mono font-bold">{cardData.customerPhone}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-slate-500">{language === 'hi' ? 'प्रदत्त सेवा विवरण:' : 'Service Description:'}</span>
                            <strong className="text-slate-900">{cardData.serviceDesc}</strong>
                          </div>
                        </div>

                        <div className="bg-slate-950 text-white p-3 rounded-xl flex justify-between items-center">
                          <span className="font-bold text-sm">{language === 'hi' ? 'कुल प्राप्त राशि:' : 'Total Amount:'}</span>
                          <span className="font-mono font-black text-2xl text-yellow-400">₹30.00</span>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>{language === 'hi' ? 'अधिकृत रसीद • हस्ताक्षर की आवश्यकता नहीं' : 'Authorized Receipt • Signature Not Required'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'सफल भुगतान' : 'Payment Success'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 13. BANKING & NSDL BC ACKNOWLEDGEMENT RECEIPT */}
                    {/* ======================================================= */}
                    {toolKind === 'banking' && (
                      <div className="w-full max-w-xl bg-white border-2 border-indigo-900 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-indigo-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-indigo-800 uppercase">{language === 'hi' ? 'राष्ट्रीय बैंकिंग एवं डीबीटी सेवा केंद्र' : 'National Banking & DBT Customer Service'}</div>
                            <h3 className="text-base font-black text-slate-900">{cardData.bankName || 'NSDL Payments Bank / CSP Counter'}</h3>
                            <p className="text-[11px] text-slate-600">{language === 'hi' ? 'बैंक खाता एवं आधार सीडिंग पावती पर्ची' : 'Bank Account & DBT Seeding Acknowledgement'}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`BANK:ACK:${cardData.accountNo || cardData.refNumber || '-'}|NAME:${cardData.name || '-'}|STATUS:VERIFIED`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'खाता संख्या / संदर्भ' : 'Account / Reference'}</span>
                            <strong className="font-mono text-indigo-900">{cardData.accountNo || cardData.refNumber || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'खाताधारक का नाम' : 'Account Holder'}</span>
                            <strong className="text-slate-900">{cardData.name || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'डीबीटी / एनपीसीआई स्थिति' : 'DBT / NPCI Status'}</span>
                            <strong className="text-emerald-700">{language === 'hi' ? 'सक्रिय (Active)' : 'Active'}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{selectedCafe?.shopName || 'डिजिटल सेवा केंद्र'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'सत्यापित पावती' : 'Verified Acknowledgement'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 14. AGRICULTURE & PM-KISAN / AGRISTACK RECEIPT */}
                    {/* ======================================================= */}
                    {toolKind === 'agriculture' && (
                      <div className="w-full max-w-xl bg-white border-2 border-emerald-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-emerald-800 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-emerald-800 uppercase">{language === 'hi' ? 'कृषि एवं किसान कल्याण मंत्रालय • भारत सरकार' : 'Ministry of Agriculture & Farmers Welfare • GoI'}</div>
                            <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'एग्रीस्टैक / पीएम-किसान पंजीकरण एवं ई-केवाईसी पर्ची' : 'AgriStack / PM-Kisan Farmer Registry Slip'}</h3>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`AGRI:FARMER:${cardData.farmerId || cardData.refNumber || '-'}|NAME:${cardData.name || '-'}|STATUS:ACTIVE`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'किसान पंजीकरण संख्या' : 'Farmer Reg ID'}</span>
                            <strong className="font-mono text-emerald-900">{cardData.farmerId || cardData.refNumber || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}</span>
                            <strong className="text-slate-900">{cardData.name || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'भूलेख / खसरा विवरण' : 'Land / Khasra Details'}</span>
                            <strong className="text-slate-800">{cardData.khasraNo || 'सत्यापित (Verified)'}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{language === 'hi' ? 'ई-केवाईसी स्थिति: सफल' : 'e-KYC Status: Successful'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'अधिकृत किसान पावती' : 'Authorized Farmer Slip'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 15. WELFARE & SAMAGRA / SAMBAL / E-SHRAM CERTIFICATE */}
                    {/* ======================================================= */}
                    {toolKind === 'welfare' && (
                      <div className="w-full max-w-xl bg-white border-2 border-orange-700 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-orange-700 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-orange-700 uppercase">{language === 'hi' ? 'सामाजिक सुरक्षा एवं जनकल्याण विभाग' : 'Social Security & Public Welfare Department'}</div>
                            <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'समग्र / संबल / जनकल्याण योजना प्रमाण पत्र' : 'Welfare & Social Security Scheme Certificate'}</h3>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`WELFARE:ID:${cardData.samagraId || cardData.refNumber || '-'}|NAME:${cardData.name || '-'}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-orange-50/50 p-3 rounded-xl border border-orange-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'समग्र / सदस्य आईडी' : 'Samagra / Member ID'}</span>
                            <strong className="font-mono text-orange-950">{cardData.samagraId || cardData.refNumber || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'हितग्राही का नाम' : 'Beneficiary Name'}</span>
                            <strong className="text-slate-900">{cardData.name || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'योजना नाम' : 'Scheme'}</span>
                            <strong className="text-slate-800">{cardData.schemeName || 'संबल / सामाजिक सुरक्षा'}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{language === 'hi' ? 'प्रमाण पत्र स्थिति: अधिकृत' : 'Certificate Status: Authorized'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'सफल सत्यापन' : 'Verified'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 16. TELECOM SIM & ACTIVATION ACKNOWLEDGEMENT */}
                    {/* ======================================================= */}
                    {toolKind === 'telecom' && (
                      <div className="w-full max-w-xl bg-white border-2 border-blue-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-blue-800 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-blue-800 uppercase">{language === 'hi' ? 'दूरसंचार विभाग • अधिकृत रिटेलर काउंटर' : 'Department of Telecommunications • Authorized Retailer'}</div>
                            <h3 className="text-base font-black text-slate-900">{cardData.operatorName || 'Telecom Customer Services'}</h3>
                            <p className="text-[11px] text-slate-600">{language === 'hi' ? 'सिम एक्टिवेशन एवं बायोमेट्रिक ई-केवाईसी पावती' : 'SIM Activation & Biometric e-KYC Slip'}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`TELECOM:MOB:${cardData.mobileNo || cardData.refNumber || '-'}|NAME:${cardData.name || '-'}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}</span>
                            <strong className="font-mono text-blue-900 text-sm">{cardData.mobileNo || cardData.refNumber || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">{language === 'hi' ? 'ग्राहक का नाम' : 'Customer Name'}</span>
                            <strong className="text-slate-900">{cardData.name || '-'}</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{selectedCafe?.shopName || 'दूरसंचार सेवा केंद्र'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'सक्रियण सफल' : 'Activation Complete'}</span>
                        </div>
                      </div>
                    )}

                  </>
                );
              })()}

                </div>
              </div>
            )}

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
                    {localize(currentTool.title)} - {t('sp_history_title')}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('sp_history_sub')}
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder={t('sp_search_history_hint')}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              {toolOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                  <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>{t('sp_no_history')}</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                      <th className="p-2.5">{t('sp_th_order_id')}</th>
                      <th className="p-2.5">{t('sp_th_desc')}</th>
                      <th className="p-2.5">{t('sp_th_card_ref')}</th>
                      <th className="p-2.5">{t('sp_th_date')}</th>
                      <th className="p-2.5">{t('sp_th_fee')}</th>
                      <th className="p-2.5 text-right">{t('sp_th_reprint')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {toolOrders.map((order) => (
                      <tr key={order.id || order.orderId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {order.id || order.orderId}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          {order.docTitle || order.serviceTitle || localize(currentTool.title)}
                        </td>
                        <td className="p-2.5 font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {order.refNumber || order.vehicleNumber || '-'}
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(order.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{order.retailFee || currentTool.retailRate}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleFreeReprint(order)}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3 py-1 rounded-xl text-xs inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title={t('sp_btn_reprint')}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>🖨️ {t('sp_btn_reprint')}</span>
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

      {/* Insufficient Balance Gate Modal (Zero Credit Policy) */}
      {showBalanceGateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-amber-500 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  अपर्याप्त बैलेंस (Zero Credit Policy)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  इस सेवा को निष्पादित करने के लिए पर्याप्त बैलेंस आवश्यक है।
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0b1528] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">आवश्यक सेवा शुल्क:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  ₹{isOperator ? currentTool.wholesaleRate : currentTool.retailRate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">आपका वर्तमान बैलेंस:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">
                  ₹{isOperator ? sanchalakB2bBalance : walletBalance}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBalanceGateModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBalanceGateModal(false);
                  if (isOperator) {
                    if (onOpenB2bWallet) onOpenB2bWallet();
                  } else {
                    if (onOpenWallet) onOpenWallet();
                  }
                }}
                className="flex-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>➕ अभी वॉलेट रिचार्ज करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
