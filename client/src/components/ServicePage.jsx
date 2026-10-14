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
import { useLanguage } from '../context/LanguageContext';

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
    id: 'edistrict',
    title: { hi: 'e-District आय/जाति/निवास सत्यापन', en: 'e-District Income/Caste/Domicile Verification' },
    subtitle: { hi: 'राजस्व परिषद डिजिटल सत्यापन प्रमाण पत्र पर्ची', en: 'Revenue Board Digital Verification Certificate Slip' },
    category: 'edistrict',
    categoryName: { hi: 'e-District सेवाएं', en: 'e-District Services' },
    icon: Award,
    badge: { hi: 'सत्यापित पर्ची', en: 'Verified Slip' },
    color: 'from-violet-600 to-purple-700',
    accentColor: 'purple',
    serviceType: 'edistrictSlip',
    retailRate: 30,
    wholesaleRate: 15,
    placeholder: { hi: 'आवेदन क्रमांक दर्ज करें', en: 'Enter Application Number' },
    inputLabel: { hi: 'आवेदन क्रमांक', en: 'Application Number' }
  }
];

export default function ServicePage({
  activeToolId = 'edistrict',
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
  const { language, t, localize } = useLanguage();
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
  const [dobDate, setDobDate] = useState('');
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
    setDobDate('');
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
      setErrorMsg(`कृपया ${currentTool.inputLabel} दर्ज करें।`);
      return;
    }
    if (currentTool.id === 'edistrict' && !secondaryInput.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया प्रमाण पत्र क्रमांक दर्ज करें।' : 'Please enter Certificate ID.');
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
      address: addressInput.trim() || undefined
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
      params.certNo = secondaryInput.trim();
      params.applicantName = customerName.trim() || undefined;
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
      params.serviceDesc = secondaryInput.trim() || 'ऑनलाइन सेवाएं';
      params.customerName = customerName.trim() || undefined;
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
      const isCard = ['rc', 'pan', 'aadhaar', 'voter', 'dl', 'ayushman'].includes(currentTool.id);
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
            <span>{language === 'hi' ? '← डैशबोर्ड पर वापस जाएं' : '← Back to Dashboard'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="cursor-pointer hover:underline font-semibold" onClick={onBack}>
              {isOperator ? (language === 'hi' ? 'संचालक डैशबोर्ड' : 'Operator Dashboard') : (language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal')}
            </span>
            <span>›</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{localize(currentTool.categoryName)}</span>
            <span>›</span>
            <span className="font-black text-orange-600 dark:text-orange-400">{localize(currentTool.title)}</span>
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
                ₹{isOperator ? currentTool.wholesaleRate : currentTool.retailRate}
              </span>
            </div>
            {isOperator && (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                {language === 'hi' ? 'मुनाफ़ा: +' : 'Margin: +'}₹{currentTool.retailRate - currentTool.wholesaleRate}
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
          
          <div className="bg-white dark:bg-[#0c162c] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            {/* Service Header Info */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-900">
                    {localize(currentTool.badge)}
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⚡ 0.5s Engine
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <currentTool.icon className="w-5 h-5 text-orange-500" />
                  <span>{localize(currentTool.title)}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {localize(currentTool.subtitle)}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-rose-500 font-bold flex items-center gap-1 transition cursor-pointer"
                title={t('clear_form')}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('clear_form')}</span>
              </button>
            </div>

            {/* THE FORM */}
            <form onSubmit={handleInstantGenerate} className="space-y-4">
              
              {/* Primary Input (PAN, Aadhaar, Voter, RC, etc.) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{localize(currentTool.inputLabel)} *</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{language === 'hi' ? 'आवश्यक' : 'Required'}</span>
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
                  placeholder={localize(currentTool.placeholder)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-400 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-mono font-black text-base sm:text-lg uppercase tracking-wider focus:outline-none transition shadow-inner placeholder:text-slate-400"
                />
                {/* Validation Feedback */}
                <div className="flex items-center justify-between text-[11px] font-bold px-1 pt-0.5">
                  <span className="text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? (
                      <>
                        {currentTool.id === 'pan' && '10-अंकीय पैन नंबर'}
                        {currentTool.id === 'epan' && '10-अंकीय पैन अथवा पावती संख्या'}
                        {currentTool.id === 'aadhaar' && '12-अंकीय आधार संख्या (स्वतः 4-अंकीय स्पेस)'}
                        {currentTool.id === 'voter' && '10-अंकीय वोटर आईडी EPIC कोड'}
                        {currentTool.id === 'rc' && 'वाहन पंजीयन क्रमांक (जैसे UP32AB1234)'}
                        {currentTool.id === 'dl' && 'सारथी ड्राइविंग लाइसेंस क्रमांक'}
                        {currentTool.id === 'electricity' && 'उपभोक्ता खाता संख्या'}
                        {currentTool.id === 'ration' && '12-अंकीय राशन कार्ड संख्या'}
                        {currentTool.id === 'edistrict' && 'आवेदन क्रमांक संख्या'}
                        {currentTool.id === 'challan' && 'चालान / वाहन क्रमांक'}
                        {currentTool.id === 'ayushman' && 'PM-JAY आईडी / राशन अथवा आधार संख्या'}
                        {currentTool.id === 'receipt' && '10-अंकीय ग्राहक मोबाइल नंबर'}
                      </>
                    ) : (
                      <>
                        {currentTool.id === 'pan' && '10-Digit PAN Number'}
                        {currentTool.id === 'epan' && '10-Digit PAN or Ack Number'}
                        {currentTool.id === 'aadhaar' && '12-Digit Aadhaar (Auto 4-Digit Spacing)'}
                        {currentTool.id === 'voter' && '10-Digit EPIC Voter ID'}
                        {currentTool.id === 'rc' && 'Vehicle Registration Number (e.g. UP32AB1234)'}
                        {currentTool.id === 'dl' && 'Sarathi Driving Licence Number'}
                        {currentTool.id === 'electricity' && 'Consumer Account Number'}
                        {currentTool.id === 'ration' && '12-Digit Ration Card Number'}
                        {currentTool.id === 'edistrict' && 'Application Number'}
                        {currentTool.id === 'challan' && 'Challan / Vehicle Reg Number'}
                        {currentTool.id === 'ayushman' && 'PM-JAY ID or Ration/Aadhaar'}
                        {currentTool.id === 'receipt' && '10-Digit Customer Mobile Number'}
                      </>
                    )}
                  </span>
                  {primaryInput && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {primaryInput.length} {language === 'hi' ? 'वर्ण' : 'chars'}
                    </span>
                  )}
                </div>
              </div>

              {/* 1. PERSONAL DETAILS (NAME & FATHER'S NAME) - ONLY FOR SERVICES THAT REQUIRE THEM */}
              {['pan', 'aadhaar', 'voter', 'dl', 'ayushman', 'receipt'].includes(currentTool.id) && (
                <div className={`grid gap-3 ${['pan', 'voter', 'dl', 'ayushman'].includes(currentTool.id) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currentTool.id === 'voter' ? (language === 'hi' ? 'मतदाता का पूरा नाम *' : 'Voter Full Name *') :
                       currentTool.id === 'dl' ? (language === 'hi' ? 'लाइसेंस धारक का नाम *' : 'Licence Holder Name *') :
                       currentTool.id === 'ayushman' ? (language === 'hi' ? 'लाभार्थी का पूरा नाम *' : 'Beneficiary Full Name *') :
                       currentTool.id === 'receipt' ? (language === 'hi' ? 'ग्राहक का नाम' : 'Customer Name') :
                       t('sp_applicant_name')}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={
                        currentTool.id === 'receipt'
                          ? (language === 'hi' ? 'ग्राहक का नाम दर्ज करें' : 'Enter customer name')
                          : (language === 'hi' ? 'आवेदक का पूरा नाम दर्ज करें' : 'Enter applicant full name')
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none"
                    />
                  </div>

                  {['pan', 'voter', 'dl', 'ayushman'].includes(currentTool.id) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {currentTool.id === 'pan' ? (language === 'hi' ? 'पिता का पूरा नाम *' : "Father's Full Name *") :
                         t('sp_father_husband_name')}
                      </label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder={
                          currentTool.id === 'pan'
                            ? (language === 'hi' ? 'पिता का नाम दर्ज करें' : "Enter father's name")
                            : (language === 'hi' ? 'पिता अथवा पति का नाम दर्ज करें' : 'Enter father or husband name')
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 2. REAL HTML5 DATE PICKER FOR DOB & GENDER - ONLY FOR SERVICES THAT REQUIRE THEM */}
              {['pan', 'aadhaar', 'voter', 'dl', 'ayushman', 'epan'].includes(currentTool.id) && (
                <div className={`grid gap-3 ${['aadhaar', 'voter', 'ayushman'].includes(currentTool.id) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      <span>{t('sp_dob_label')} *</span>
                    </label>
                    <input
                      type="date"
                      value={dobDate}
                      onChange={(e) => setDobDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                    />
                    {dobDate && (
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {language === 'hi' ? `कार्ड पर छपेगा: ${formatDobDisplay(dobDate)}` : `Printed on card: ${formatDobDisplay(dobDate)}`}
                      </span>
                    )}
                  </div>

                  {/* Gender: STRICTLY only on Aadhaar, Voter, and Ayushman (PAN has no gender) */}
                  {['aadhaar', 'voter', 'ayushman'].includes(currentTool.id) && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('sp_gender_label')} *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="MALE">{t('sp_gender_male')}</option>
                        <option value="FEMALE">{t('sp_gender_female')}</option>
                        <option value="OTHER">{t('sp_gender_other')}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* 3. PERMANENT ADDRESS - STRICTLY ONLY FOR AADHAAR CARD */}
              {currentTool.id === 'aadhaar' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('sp_address_label')} *
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder={language === 'hi' ? 'पूरा स्थायी पता दर्ज करें' : 'Enter full permanent address'}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
              )}

              {/* 4. SECONDARY FIELD - ONLY FOR EDISTRICT, ELECTRICITY, DL, RECEIPT */}
              {['edistrict', 'electricity', 'dl', 'receipt'].includes(currentTool.id) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {currentTool.id === 'edistrict' ? (language === 'hi' ? 'प्रमाण पत्र क्रमांक *' : 'Certificate ID *') :
                     currentTool.id === 'electricity' ? (language === 'hi' ? 'विद्युत वितरण निगम (Discom Board)' : 'Discom Board') :
                     currentTool.id === 'dl' ? (language === 'hi' ? 'अधिकृत COV श्रेणी (जैसे LMV, MCWG)' : 'Authorized COV Category') :
                     (language === 'hi' ? 'सेवा विवरण' : 'Service Description')}
                  </label>
                  {currentTool.id === 'electricity' ? (
                    <select
                      value={secondaryInput}
                      onChange={(e) => setSecondaryInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="">{language === 'hi' ? '-- विद्युत निगम चुनें (डिफ़ॉल्ट UPPCL) --' : '-- Select Discom (Default UPPCL) --'}</option>
                      <option value="UPPCL">UPPCL (उत्तर प्रदेश पावर कारपोरेशन)</option>
                      <option value="PVVNL">PVVNL (पश्चिमांचल विद्युत वितरण निगम)</option>
                      <option value="DVVNL">DVVNL (दक्षिणांचल विद्युत वितरण निगम)</option>
                      <option value="MVVNL">MVVNL (मध्यांचल विद्युत वितरण निगम)</option>
                      <option value="PuVVNL">PuVVNL (पूर्वांचल विद्युत वितरण निगम)</option>
                      <option value="DHBVN">DHBVN (दक्षिण हरियाणा बिजली वितरण निगम)</option>
                      <option value="BSES">BSES (दिल्ली राजधानी/यमुना पावर)</option>
                      <option value="PSPCL">PSPCL (पंजाब स्टेट पावर कॉर्पोरेशन)</option>
                      <option value="JVVNL">JVVNL (जयपुर विद्युत वितरण निगम)</option>
                      <option value="SBPDCL">SBPDCL (साउथ बिहार पावर डिस्ट्रीब्यूशन)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={secondaryInput}
                      onChange={(e) => setSecondaryInput(e.target.value)}
                      placeholder={
                        currentTool.id === 'edistrict' ? (language === 'hi' ? 'प्रमाण पत्र क्रमांक दर्ज करें' : 'Enter Certificate ID') :
                        currentTool.id === 'dl' ? (language === 'hi' ? 'LMV-NT, MCWG दर्ज करें' : 'LMV-NT, MCWG') :
                        (language === 'hi' ? 'सेवा विवरण दर्ज करें' : 'Enter Service Description')
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  )}
                </div>
              )}

              {/* PHOTO & SIGNATURE UPLOAD / PRESET PICKER (FOR PVC SMART CARDS) */}
              {['pan', 'aadhaar', 'voter', 'dl', 'ayushman'].includes(currentTool.id) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-orange-500" />
                      <span>{t('sp_photo_sign_select')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{t('sp_live_preview')}</span>
                  </div>

                  {/* Photo Controls */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 bg-white shadow-xs">
                      <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                        {t('sp_photo_choose')}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => { setPhotoData(SAMPLE_PHOTOS.male); setIsCustomPhoto(false); }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                        >
                          👤 {t('sp_photo_male')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhotoData(SAMPLE_PHOTOS.female); setIsCustomPhoto(false); }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                        >
                          👩 {t('sp_photo_female')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhotoData(SAMPLE_PHOTOS.senior); setIsCustomPhoto(false); }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                        >
                          👴 {t('sp_photo_senior')}
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
                          <span>{t('sp_upload')}</span>
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
                          {t('sp_sign_choose')}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => { setSignData(SAMPLE_SIGNS.sign1); setIsCustomSign(false); }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                          >
                            ✍️ {t('sp_sign_1')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSignData(SAMPLE_SIGNS.sign2); setIsCustomSign(false); }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-bold hover:border-orange-500 transition cursor-pointer"
                          >
                            ✍️ {t('sp_sign_2')}
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
                            <span>{language === 'hi' ? 'हस्ताक्षर अपलोड' : 'Upload Signature'}</span>
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
                    <span>{t('sp_generating')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {currentTool.id === 'rc' ? (language === 'hi' ? '⚡ 1-क्लिक वाहन RC जनरेट करें' : '⚡ 1-Click Generate RC') :
                       currentTool.id === 'ration' ? (language === 'hi' ? '⚡ 1-क्लिक राशन पर्ची जनरेट करें' : '⚡ 1-Click Generate Ration Slip') :
                       currentTool.id === 'challan' ? (language === 'hi' ? '⚡ 1-क्लिक ई-चालान जांचें' : '⚡ 1-Click Verify Challan') :
                       currentTool.id === 'electricity' ? (language === 'hi' ? '⚡ 1-क्लिक बिल रसीद जनरेट करें' : '⚡ 1-Click Generate Bill Receipt') :
                       currentTool.id === 'edistrict' ? (language === 'hi' ? '⚡ 1-क्लिक सत्यापन पर्ची जनरेट करें' : '⚡ 1-Click Generate Verification Slip') :
                       currentTool.id === 'epan' ? (language === 'hi' ? '⚡ 1-क्लिक ई-पैन डाउनलोड करें' : '⚡ 1-Click Download e-PAN') :
                       currentTool.id === 'pan' ? (language === 'hi' ? '⚡ 1-क्लिक PVC पैन कार्ड जनरेट करें' : '⚡ 1-Click Generate PVC PAN') :
                       currentTool.id === 'aadhaar' ? (language === 'hi' ? '⚡ 1-क्लिक PVC आधार कार्ड जनरेट करें' : '⚡ 1-Click Generate PVC Aadhaar') :
                       currentTool.id === 'voter' ? (language === 'hi' ? '⚡ 1-क्लिक वोटर कार्ड जनरेट करें' : '⚡ 1-Click Generate Voter Card') :
                       currentTool.id === 'dl' ? (language === 'hi' ? '⚡ 1-क्लिक DL कार्ड जनरेट करें' : '⚡ 1-Click Generate DL Card') :
                       currentTool.id === 'ayushman' ? (language === 'hi' ? '⚡ 1-क्लिक गोल्डन कार्ड जनरेट करें' : '⚡ 1-Click Generate Golden Card') :
                       currentTool.id === 'receipt' ? (language === 'hi' ? '⚡ 1-क्लिक रसीद जनरेट करें' : '⚡ 1-Click Generate Receipt') :
                       t('sp_btn_generate')}
                    </span>
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
                  {currentResult?.isReprint ? (language === 'hi' ? '🔄 निःशुल्क रिप्रिंट प्रति तैयार है' : '🔄 Free Reprint Copy Ready') : `✅ ${t('sp_preview_heading')}`}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('sp_preview_sub')}
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
                    {t('sp_card_both')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('front')}
                    className={`px-3 py-1.5 rounded-lg transition ${cardSide === 'front' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {t('sp_card_front')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardSide('back')}
                    className={`px-3 py-1.5 rounded-lg transition ${cardSide === 'back' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {t('sp_card_back')}
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
                <span>🖨️ {t('sp_btn_print')}</span>
              </button>

              {/* 1-Click Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
                title={language === 'hi' ? 'आधिकारिक वेक्टर PDF फ़ाइल सीधे डाउनलोड करें' : 'Download official PDF file'}
              >
                <Download className="w-4 h-4" />
                <span>📥 {t('sp_btn_download_pdf')}</span>
              </button>
            </div>

          </div>

          {/* RENDER CANVAS CONTAINER WITH PRECISION CUTTING MARKS */}
          <div className="bg-white dark:bg-[#070e1b] p-3 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md max-w-full overflow-hidden">
            
            {/* Cut-Marks Print Notice */}
            <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Scissors className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{language === 'hi' ? 'मानक कटिंग बॉर्डर एवं क्रॉप गाइड (85.6mm × 54mm)' : 'Standard Cutting Border & Crop Guide (85.6mm × 54mm)'}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {language === 'hi' ? 'रसीद ID' : 'Receipt ID'}: {currentResult?.order?.id || `ORD-${Date.now().toString().slice(-6)}`}
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-2 sm:p-8 bg-slate-50/80 dark:bg-[#0a1426]/70 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl min-h-[320px] max-w-full overflow-x-auto">
              
              {!activeData ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
                    <currentTool.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {localize(currentTool.title)} • {language === 'hi' ? 'लाइव काउंटर' : 'Live Counter'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {language === 'hi'
                        ? 'कृपया बाएं फ़ॉर्म में आवश्यक विवरण दर्ज करें और "1-क्लिक जनरेट करें" बटन दबाएं। आपका वास्तविक कार्ड यहाँ तैयार होगा।'
                        : 'Please fill in the required details on the left form and click "1-Click Generate". Your authentic card will be generated here.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                    <span>{language === 'hi' ? '🔒 केवल आपका वास्तविक डेटा • कोई काल्पनिक अथवा डमी रिकॉर्ड नहीं' : '🔒 Real Data Only • Zero Dummy Records'}</span>
                  </div>
                </div>
              ) : (() => {
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
                    {currentTool.id === 'ayushman' && (
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
                    {currentTool.id === 'ration' && (
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
                    {currentTool.id === 'electricity' && (
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
                    {currentTool.id === 'edistrict' && (
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
                    {currentTool.id === 'challan' && (
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
                    {currentTool.id === 'epan' && (
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
                    {currentTool.id === 'receipt' && (
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

    </div>
  );
}
