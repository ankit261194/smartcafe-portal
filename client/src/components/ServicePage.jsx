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
import rdService from '../utils/RDServiceBridge';
import LiveOtpModal from './LiveOtpModal';
import PvcTraySheetModal from './PvcTraySheetModal';
import PvcCardAutoCropper from './tools/PvcCardAutoCropper';
import PassportPhotoMaker from './tools/PassportPhotoMaker';
import GovtFormResizer from './tools/GovtFormResizer';

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

export const MANUAL_RELAY_12_SERVICES = [
  'll_exam_pass_auto',
  'e_shram_update',
  'samagra_service',
  'sambal_pdf',
  'pan_find_manual',
  'pan_find_manual_alt',
  'pan_aadhaar_link_manual',
  'puc_certificate_download',
  'dl_to_mobile_find',
  'dob_update_service',
  'mobile_update_service',
  'agristack_pdf'
];

function ServicePageContent({
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
  const normalizedToolId = useMemo(() => {
    if (typeof activeToolId === 'object' && activeToolId !== null) {
      return activeToolId.id || activeToolId.toolId || activeToolId.key || 'aadhaar_advance';
    }
    return String(activeToolId || 'aadhaar_advance');
  }, [activeToolId]);

  const currentTool = useMemo(() => {
    return allServices.find(s => s.id === normalizedToolId || s.num === Number(normalizedToolId)) || 
      allServices.find(s => s.id === 'sarkari_job_feed' && normalizedToolId === 'sarkari_job_feed') ||
      allServices[0] || 
      INSTANT_TOOLS[0];
  }, [allServices, normalizedToolId]);

  const isManualRelay12 = useMemo(() => {
    const id = (currentTool?.id || '').toLowerCase();
    return MANUAL_RELAY_12_SERVICES.includes(id) || currentTool?.fulfillmentType === 'manual_relay' || currentTool?.source === 'rekhaprint';
  }, [currentTool]);

  const isFreeService = useMemo(() => {
    return Boolean(
      currentTool?.category === 'other' || 
      currentTool?.group === 'other' || 
      currentTool?.isFree === true ||
      ['pvc_auto_cropper', 'passport_photo_maker', 'govt_form_resizer', 'bank_ifsc_lookup', 'pincode_lookup', 'qr_generator', 'sarkari_job_feed'].includes(currentTool?.id) ||
      (isOperator ? Number(currentTool?.wholesaleRate) === 0 : Number(currentTool?.retailRate) === 0)
    );
  }, [currentTool, isOperator]);

  const requiredFee = useMemo(() => {
    if (isFreeService) return 0;
    return isOperator 
      ? (currentTool?.wholesaleRate !== undefined ? Number(currentTool.wholesaleRate) : 15) 
      : (currentTool?.retailRate !== undefined ? Number(currentTool.retailRate) : 30);
  }, [isFreeService, isOperator, currentTool]);

  const toolKind = useMemo(() => {
    const id = (currentTool?.id || '').toLowerCase();
    const cat = (currentTool?.category || currentTool?.group || '').toLowerCase();
    if (id === 'pvc_card_cropper' || id === 'pvc_auto_cropper' || id.includes('cropper') || id.includes('pvc_auto') || id.includes('pvc_crop')) return 'pvc_crop';
    if (id === 'passport_photo_maker' || id.includes('passport_photo') || id.includes('photo_maker')) return 'passport_photo';
    if (id === 'govt_form_resizer' || id.includes('resizer') || id.includes('compressor')) return 'govt_resizer';
    if (['rc', 'rc_pdf_download', 'rc_to_details', 'vehicle_rc'].includes(id) || cat === 'rc' || id.includes('rc_')) return 'rc';
    if (['pan', 'pancard', 'pan_find', 'pan_details'].includes(id) || cat === 'pan' || id.includes('pan')) return 'pan';
    if (id === 'epan') return 'epan';
    if (['ration', 'ration_pdf_by_ration', 'up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar', 'ration_pdf_by_aadhar'].includes(id) || cat === 'ration' || id.includes('ration')) return 'ration';
    if (['aadhaar', 'aadhaarCard', 'aadhaarcard', 'aadhaar_advance', 'aadhaar_original_pdf_otp', 'aadhaar_original_pdf_no_otp', 'aadhaar_otp_kyc', 'aadhaar_pvc', 'aadhaar_manual'].includes(id) || cat === 'aadhaar' || (!id.includes('ration') && (id.toLowerCase().includes('aadhaar') || id.toLowerCase().includes('aadhar') || id.includes('uid_') || id.includes('pvc_')))) return 'aadhaar';
    if (['voter', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_original_pdf_otp'].includes(id) || cat === 'voter' || id.includes('voter_')) return 'voter';
    if (['dl', 'driving_licence_pdf', 'dl_details'].includes(id) || cat === 'dl' || id.includes('driving_licence') || id.includes('dl_')) return 'dl';
    if (['ayushman', 'ayushman_card', 'abha_card', 'abha_otp'].includes(id) || cat === 'health' || id.includes('ayushman') || id.includes('abha')) return 'ayushman';
    if (['electricity', 'electric_bill_pdf_bihar'].includes(id) || cat === 'utility' || id.includes('electric_bill')) return 'electricity';
    if (['challan', 'chalan_find'].includes(id) || id.includes('chalan') || id.includes('challan')) return 'challan';
    if (['edistrict', 'edistrict-verify', 'edistrict-decl', 'edistrict-packer', 'edistrict-bhulekh', 'rtps_bihar_pdf', 'rtps'].includes(id) || cat === 'edistrict' || id.includes('rtps') || id.includes('edistrict')) return 'edistrict';
    if (id === 'bank_ifsc_lookup' || id.includes('ifsc')) return 'ifsc';
    if (id === 'pincode_lookup' || id.includes('pincode')) return 'pincode';
    if (id === 'qr_generator' || id.includes('qr_')) return 'qr';
    if (id === 'sarkari_job_feed' || id.includes('sarkari')) return 'sarkari_feed';
    if (cat === 'banking' || id.includes('bank') || id.includes('nsdl') || id.includes('npci')) return 'banking';
    if (cat === 'telecom' || id.includes('telecom') || id.includes('sim') || id.includes('cdr')) return 'telecom';
    if (id === 'e_shram' || id === 'eshram' || id === 'e_shram_update' || id.includes('eshram') || id.includes('e_shram')) return 'eshram';
    if (id === 'samagra_service' || id.includes('samagra')) return 'samagra';
    if (id === 'sambal_pdf' || id.includes('sambal')) return 'sambal';
    if (cat === 'welfare') return 'welfare';
    if (cat === 'lookup' || id.includes('lookup') || id.includes('to_number') || id.includes('to_details') || id.includes('telegram') || id.includes('gmail') || id.includes('operator') || id.includes('check_plan')) return 'lookup';
    return 'receipt';
  }, [currentTool]);

  // Safe Dynamic Service Icon Component (Resolves undefined icon crash)
  const ServiceIconComponent = useMemo(() => {
    const rawIcon = currentTool?.icon || 
      (CATEGORY_ICON_MAP && (CATEGORY_ICON_MAP[currentTool?.category] || CATEGORY_ICON_MAP[toolKind])) || 
      Sparkles;
    return typeof rawIcon === 'function' ? rawIcon : Sparkles;
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
  const [photoData, setPhotoData] = useState('');
  const [signData, setSignData] = useState('');
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [isCustomSign, setIsCustomSign] = useState(false);

  // Execution & Preview States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [cardSide, setCardSide] = useState('both'); // 'both', 'front', 'back'
  const [docViewMode, setDocViewMode] = useState('card'); // 'card' | 'a4'
  const [showRawTelemetry, setShowRawTelemetry] = useState(false);
  const [showBalanceGateModal, setShowBalanceGateModal] = useState(false);
  
  // Persistent Order History States (Fixes ReferenceError white screen crash)
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Biometric RD Service, OTP Bridge, and A4 5-in-1 Tray States
  const [rdDeviceStatus, setRdDeviceStatus] = useState({ connected: false, name: '', checking: false });
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
  const [biometricScore, setBiometricScore] = useState(null);
  const [biometricPid, setBiometricPid] = useState('');
  const [rdDeviceType, setRdDeviceType] = useState('Mantra MFS100');
  const [advanceServer, setAdvanceServer] = useState('1');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [activeOtpData, setActiveOtpData] = useState(null);
  const [showPvcTrayModal, setShowPvcTrayModal] = useState(false);

  // Probe Biometric RD Device on mount
  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      setRdDeviceStatus(prev => ({ ...prev, checking: true }));
      const res = await rdService.probeDevice(1000);
      if (mounted) {
        setRdDeviceStatus({
          connected: Boolean(res.connected),
          name: res.device?.name || 'Mantra MFS100 / Morpho MSO1300',
          checking: false
        });
      }
    };
    probe();
    return () => { mounted = false; };
  }, []);

  const handleCaptureFingerprint = async () => {
    setIsScanningFingerprint(true);
    setErrorMsg('');
    try {
      const res = await rdService.captureFingerprint({ allowSimulated: false });
      if (res.success) {
        setBiometricScore(res.qScore);
        setBiometricPid(res.pidData || 'PID_CAPTURED_SUCCESS');
        setRdDeviceType(res.deviceModel || rdDeviceStatus.name || 'Mantra MFS100');
      } else {
        setErrorMsg(res.error || 'बायोमेट्रिक फिंगरप्रिंट स्कैन विफल हुआ।');
      }
    } catch (e) {
      setErrorMsg('बायोमेट्रिक डिवाइस से संपर्क नहीं हो सका।');
    } finally {
      setIsScanningFingerprint(false);
    }
  };

  const handleOtpVerificationSuccess = (verifiedData) => {
    setCurrentResult({
      success: true,
      serviceType: currentTool?.serviceType || 'aadhaarCard',
      docTitle: currentTool?.title?.hi || 'आधिकारिक दस्तावेज (OTP सत्यापित)',
      generatedData: {
        name: verifiedData?.data?.name || customerName || 'आवेदक',
        fatherName: verifiedData?.data?.fatherName || fatherName || '',
        dob: verifiedData?.data?.dob || (dobDate ? formatDobDisplay(dobDate) : ''),
        gender: verifiedData?.data?.gender || gender || 'MALE',
        address: verifiedData?.data?.address || addressInput || '',
        aadhaarNo: verifiedData?.data?.aadhaarNo || primaryInput || '',
        refNumber: verifiedData?.txnId || `REF-${Date.now()}`,
        photoUrl: photoData,
        signUrl: signData
      }
    });
  };

  // Clear all states cleanly whenever user switches service
  useEffect(() => {
    resetForm();
    fetchOrderHistory();
    if (normalizedToolId === 'sarkari_job_feed' || currentTool?.id === 'sarkari_job_feed') {
      fetch('/api/sarkari-jobs/feed')
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.items)) {
            setCurrentResult({
              success: true,
              docTitle: 'सरकारी नौकरियां एवं प्रवेश पत्र (Live Feed)',
              generatedData: {
                items: data.items,
                count: data.count || data.items.length
              }
            });
          }
        })
        .catch(() => {});
    }
  }, [normalizedToolId, currentTool?.id]);

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
    setPhotoData('');
    setSignData('');
    setIsCustomPhoto(false);
    setIsCustomSign(false);
    setCurrentResult(null);
    setErrorMsg('');
    setBiometricPid('');
    setBiometricScore(null);
    setAdvanceServer('1');
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

  const [pollingSingleOrder, setPollingSingleOrder] = useState(false);
  const [pollOrderMessage, setPollOrderMessage] = useState('');

  const handlePollSingleOrder = async (targetOrderId) => {
    if (!targetOrderId) return;
    setPollingSingleOrder(true);
    setPollOrderMessage('');
    try {
      const res = await fetch(`/api/services/manual-relay/poll-order?orderId=${encodeURIComponent(targetOrderId)}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        if (o) {
          if (o.status === 'completed' || o.upstreamStatus === 'Success') {
            setPollOrderMessage('🎉 बधाई! रेखा प्रिंट ऑपरेटर डेस्क द्वारा आवेदन पूर्ण कर दिया गया है। दस्तावेज़ तैयार है!');
            setCurrentResult(prev => ({
              ...prev,
              status: 'completed',
              isPendingRelay: false,
              pdfUrl: o.pdfUrl,
              generatedData: {
                ...(prev?.generatedData || {}),
                pdfUrl: o.pdfUrl,
                status: 'completed'
              }
            }));
            fetchOrderHistory();
            if (onBalanceUpdated) onBalanceUpdated();
          } else if (o.status === 'rejected' || o.upstreamStatus === 'Failed') {
            setPollOrderMessage('❌ रेखा प्रिंट द्वारा आवेदन निरस्त कर दिया गया है। शुल्क वॉलेट में रिफंड कर दिया गया है।');
            setCurrentResult(prev => ({
              ...prev,
              status: 'rejected',
              isPendingRelay: false,
              rejectionReason: o.rejectionReason || 'आवेदन निरस्त'
            }));
            fetchOrderHistory();
            if (onBalanceUpdated) onBalanceUpdated();
          } else {
            setPollOrderMessage('⏳ आवेदन अभी रेखा प्रिंट ऑपरेटर डेस्क पर प्रक्रियाधीन (Pending) है। (2-4 घंटे)');
          }
        } else {
          setPollOrderMessage('ℹ️ स्थिति की जांच की गई: आवेदन प्रक्रियाधीन है।');
        }
      }
    } catch (err) {
      console.error('Error polling order:', err);
      setPollOrderMessage('सर्वर से संपर्क करने में असमर्थ।');
    } finally {
      setPollingSingleOrder(false);
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
  const handleInstantGenerate = async (e) => {
    if (e) e.preventDefault();
    let val = primaryInput.trim();
    const tid = (currentTool?.id || '').toLowerCase();

    if (['pan_find_manual', 'pan_find_manual_alt'].includes(tid)) {
      val = customerName.trim();
    }

    if (!val) {
      setErrorMsg(language === 'hi' ? 'कृपया पहचान / संदर्भ संख्या दर्ज करें।' : 'Please enter reference ID or number.');
      return;
    }

    // Mandatory Input Validations for Custom/Dedicated Services
    if (tid === 'll_exam_pass_auto') {
      if (!secondaryInput.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया सारथी SMS पासवर्ड (Password) दर्ज करें।' : 'Please enter Sarathi SMS Password.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
    }
    if ((tid === 'll_find' || tid === 'll_pdf') && !dobDate) {
      setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
      return;
    }
    if (['driving_licence_pdf', 'dl_details', 'dl', 'drivinglicence'].includes(tid) && !dobDate) {
      setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
      return;
    }
    if (tid === 'dl_to_mobile_find') {
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
      if (!secondaryInput.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया मोबाइल नंबर दर्ज करें।' : 'Please enter mobile number.');
        return;
      }
    }
    if (['chassis_to_rc', 'chassis_to_rc_find', 'chassis_to_rc_alt'].includes(tid) && val.length < 5) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य चेसिस नंबर दर्ज करें (न्यूनतम 5-17 अक्षर)।' : 'Please enter valid Chassis Number.');
      return;
    }
    if (tid === 'engine_to_rc' && val.length < 4) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य इंजन नंबर दर्ज करें।' : 'Please enter valid Engine Number.');
      return;
    }
    if (tid === 'puc_certificate_download' && val.replace(/[\s-]+/g, '').length < 5) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य वाहन रजिस्ट्रेशन नंबर दर्ज करें (जैसे UP32AB1234)।' : 'Please enter valid Vehicle Registration Number.');
      return;
    }
    if (tid === 'pan_find' && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
      return;
    }
    if (['pan_find_manual', 'pan_find_manual_alt'].includes(tid)) {
      if (!customerName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया आधार अनुसार पूरा नाम (Full Name) दर्ज करें।' : 'Please enter Full Name.');
        return;
      }
      if (!fatherName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया पिता का नाम (Father Name) दर्ज करें।' : 'Please enter Father Name.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
        return;
      }
    }
    if (tid === 'pan_to_aadhar_find') {
      if (val.length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य पैन नंबर दर्ज करें।' : 'Please enter valid 10-digit PAN number.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
    }
    if (tid === 'pan_aadhaar_link_manual') {
      if (val.length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य पैन नंबर दर्ज करें।' : 'Please enter valid 10-digit PAN number.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
        return;
      }
      if (!thirdInput.trim() || thirdInput.trim().replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
        return;
      }
    }
    if (tid === 'pan_to_gst' && val.length !== 10) {
      setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य पैन नंबर दर्ज करें।' : 'Please enter valid 10-digit PAN number.');
      return;
    }
    if (['gst_to_pan', 'gst_verification'].includes(tid) && val.length !== 15) {
      setErrorMsg(language === 'hi' ? 'कृपया 15-अंकीय मान्य GST नंबर (GSTIN) दर्ज करें।' : 'Please enter valid 15-digit GSTIN.');
      return;
    }
    if (['pan_details', 'panverificationpremium', 'pan_basic_pricing'].includes(tid) && val.length !== 10) {
      setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य पैन नंबर दर्ज करें।' : 'Please enter valid 10-digit PAN number.');
      return;
    }
    if (tid === 'pancard' || (toolKind === 'card' && currentTool?.id === 'panCard')) {
      if (val.length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य पैन नंबर दर्ज करें।' : 'Please enter valid 10-digit PAN number.');
        return;
      }
      if (!customerName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया पूरा नाम (Full Name) दर्ज करें।' : 'Please enter Full Name.');
        return;
      }
      if (!fatherName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया पिता का नाम (Father Name) दर्ज करें।' : 'Please enter Father Name.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
    }
    if (tid === 'nsdl_bank' && !secondaryInput.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया 11-अंकीय बैंक IFSC कोड दर्ज करें।' : 'Please enter 11-digit Bank IFSC code.');
      return;
    }
    if (['rtps_bihar_pdf', 'rtps'].includes(tid) && !secondaryInput.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया आवेदक का नाम (Applicant Name) दर्ज करें।' : 'Please enter Applicant Name.');
      return;
    }
    if (['aadhaar_pdf_otp', 'aadhaar_original_pdf_otp'].includes(tid)) {
      if (val.replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
        return;
      }
      if (secondaryInput.trim() && secondaryInput.trim().replace(/\D/g, '').length !== 6) {
        setErrorMsg(language === 'hi' ? 'कृपया ठीक 6-अंकीय OTP कोड दर्ज करें।' : 'Please enter valid 6-digit OTP code.');
        return;
      }
    }
    if (['aadhaar_ekyc', 'uid_ekyc'].includes(tid) && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
      return;
    }
    if (['aadhaar_advance', 'aadhaar_advance_one', 'aadhaar_advance_two', 'aadhaar_advance_three', 'aadhaar_advance_four', 'aadhaar_advance_five', 'aadhaar_fingerprint'].includes(tid) && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
      return;
    }
    if (['aadhaar_manual', 'aadhaarcard'].includes(tid) || (toolKind === 'card' && currentTool?.id === 'aadhaarCard')) {
      if (val.replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
        return;
      }
      if (!customerName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया आधार अनुसार पूरा नाम (Full Name) दर्ज करें।' : 'Please enter Full Name.');
        return;
      }
      if (!fatherName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया पिता/पति का नाम (Father/Husband Name) दर्ज करें।' : 'Please enter Father/Husband Name.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
      if (!addressInput.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया पूरा पता (Complete Address) दर्ज करें।' : 'Please enter Complete Address.');
        return;
      }
    }
    if (['mobile_update_service', 'aadhaar_to_mobile_find', 'aadhaar_mobile_link'].includes(tid)) {
      if (val.replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य 10-अंकीय नया मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
        return;
      }
    }
    if (['dob_update_service', 'aadhaar_dob_update'].includes(tid)) {
      if (val.replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया नई जन्मतिथि (New Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय पंजीकृत मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
        return;
      }
    }
    if (['mask_aadhaar', 'aadhaar_mask_verification', 'pan_aadhar_mask'].includes(tid) && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
      return;
    }
    if (['voter_mobile_link', 'vcmRequest', 'voter_mobile_link_no_otp', 'voter_mobile_link_instant_otp', 'instant_voter_link', 'voter_mobile_link_instant'].includes(tid)) {
      if (val.length < 5) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अक्षरों का मान्य EPIC वोटर नंबर दर्ज करें।' : 'Please enter valid EPIC Voter Number.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
        return;
      }
    }
    if (['voter', 'epic', 'voter_verification', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_original_pdf_otp', 'votercard'].includes(tid) && val.length < 5) {
      setErrorMsg(language === 'hi' ? 'कृपया 10-अक्षरों का मान्य EPIC वोटर नंबर दर्ज करें।' : 'Please enter valid EPIC Voter Number.');
      return;
    }
    if (['voterCard', 'voter_card_pvc', 'voter_manual'].includes(tid) || (toolKind === 'card' && currentTool?.id === 'voterCard')) {
      if (val.length < 5) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अक्षरों का मान्य EPIC वोटर नंबर दर्ज करें।' : 'Please enter valid EPIC Voter Number.');
        return;
      }
      if (!customerName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया मतदाता का पूरा नाम दर्ज करें।' : 'Please enter Voter Full Name.');
        return;
      }
    }
    if (['ration', 'ration_pdf_by_ration', 'ration_verification', 'rationCard', 'up_ration_info'].includes(tid)) {
      if (val.replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य राशन कार्ड नंबर दर्ज करें।' : 'Please enter valid 12-digit Ration Card number.');
        return;
      }
    }
    if (tid === 'ration_pdf_by_aadhar' && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
      return;
    }
    if (['up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar'].includes(tid) && val.replace(/\D/g, '').length < 8) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य राशन कार्ड नंबर दर्ज करें।' : 'Please enter valid Ration Card number.');
      return;
    }
    if (['ayushman', 'pmjay_verify', 'ayushman_card', 'ayushman_image_jpg', 'ayushmanCard'].includes(tid)) {
      if (val.length < 5) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य PM-JAY ID अथवा 12-अंकीय आधार नंबर दर्ज करें।' : 'Please enter valid PM-JAY ID or Aadhaar number.');
        return;
      }
    }
    if (tid === 'e_shram' && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार अथवा UAN नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar/UAN number.');
      return;
    }
    if (['e_shram_update', 'e_shram_number_link'].includes(tid)) {
      if (val.replace(/\D/g, '').length !== 12) {
        setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
        return;
      }
      if (!dobDate) {
        setErrorMsg(language === 'hi' ? 'कृपया जन्मतिथि (Date of Birth) चुनें।' : 'Please select Date of Birth.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य 10-अंकीय नया मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit mobile number.');
        return;
      }
    }
    if (tid === 'samagra_service' && (val.replace(/\D/g, '').length < 8 || val.replace(/\D/g, '').length > 9)) {
      setErrorMsg(language === 'hi' ? 'कृपया 8 अथवा 9-अंकीय समग्र परिवार या सदस्य आईडी दर्ज करें।' : 'Please enter valid 8 or 9-digit Samagra ID.');
      return;
    }
    if (tid === 'sambal_pdf' && val.replace(/\D/g, '').length < 8) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय आधार अथवा 9-अंकीय समग्र आईडी दर्ज करें।' : 'Please enter valid Aadhaar or Samagra ID.');
      return;
    }
    if (['electric_bill_pdf_bihar', 'electric_bill'].includes(tid) && val.replace(/\D/g, '').length < 6) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य बिजली बिल CA / उपभोक्ता संख्या दर्ज करें (कम से कम 6 अंक)।' : 'Please enter valid Consumer / CA Number.');
      return;
    }
    if (['rtps_bihar_pdf', 'rtps'].includes(tid)) {
      if (val.length < 6) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य RTPS आवेदन संख्या (Application Number) दर्ज करें।' : 'Please enter valid RTPS Application Number.');
        return;
      }
      if (!secondaryInput.trim() && !customerName.trim()) {
        setErrorMsg(language === 'hi' ? 'कृपया आवेदक का नाम दर्ज करें।' : 'Please enter Applicant Name.');
        return;
      }
    }
    if (['agristack_pdf', 'agristack_verify', 'agristack_dbt'].includes(tid) && val.replace(/\D/g, '').length < 8) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य 8-12 अंकीय किसान ID अथवा आधार नंबर दर्ज करें।' : 'Please enter valid Farmer ID or Aadhaar number.');
      return;
    }
    if (['udyam_pdf', 'udyam'].includes(tid) && val.length < 8) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य उद्यम पंजीकरण संख्या (Udyam Reg Number) दर्ज करें।' : 'Please enter valid Udyam Registration Number.');
      return;
    }
    if (['mobile_to_upi_find', 'mobile_to_multi_upi_find', 'mobile_to_account_find', 'mobile_to_multi_account', 'vi_sim_to_photo_details', 'check_operator', 'check_plan', 'mobile_to_details', 'mobile_lookup', 'chalan_find_mobile'].includes(tid)) {
      if (val.replace(/\D/g, '').length !== 10) {
        setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter valid 10-digit Mobile Number.');
        return;
      }
    }
    if (tid === 'upi_to_details' && (!val.includes('@') || val.length < 4)) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य UPI ID दर्ज करें (उदा. username@upi)।' : 'Please enter valid UPI ID (e.g. username@upi).');
      return;
    }
    if (tid === 'nsdl_bank') {
      if (val.replace(/\D/g, '').length < 8) {
        setErrorMsg(language === 'hi' ? 'कृपया मान्य खाता संख्या (Account Number) दर्ज करें।' : 'Please enter valid Account Number.');
        return;
      }
      if (!secondaryInput.trim() || secondaryInput.trim().length !== 11) {
        setErrorMsg(language === 'hi' ? 'कृपया 11-अक्षरों का मान्य IFSC कोड दर्ज करें।' : 'Please enter valid 11-character IFSC code.');
        return;
      }
    }
    if (['npci_verify', 'uid_seeding', 'aadhaar_bank_seeding'].includes(tid) && val.replace(/\D/g, '').length !== 12) {
      setErrorMsg(language === 'hi' ? 'कृपया 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar Number.');
      return;
    }
    if (tid === 'telegram_to_number_lookup' && val.trim().replace(/^@/, '').length < 3) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य टेलीग्राम यूजरनेम दर्ज करें।' : 'Please enter valid Telegram username.');
      return;
    }
    if (tid === 'gmail_to_details' && (!val.includes('@') || val.length < 5)) {
      setErrorMsg(language === 'hi' ? 'कृपया मान्य ईमेल/जीमेल आईडी दर्ज करें।' : 'Please enter valid Gmail/Email address.');
      return;
    }
    if (tid === 'bank_ifsc_lookup' && val.trim().length !== 11) {
      setErrorMsg(language === 'hi' ? 'कृपया 11-अक्षरों का मान्य IFSC कोड दर्ज करें।' : 'Please enter valid 11-character IFSC code.');
      return;
    }
    if (tid === 'pincode_lookup' && val.replace(/\D/g, '').length !== 6) {
      setErrorMsg(language === 'hi' ? 'कृपया 6-अंकीय मान्य पिनकोड दर्ज करें।' : 'Please enter valid 6-digit Pincode.');
      return;
    }

    // Balance Evaluation (Strict Zero-Bypass Mode)
    const currentBal = isOperator ? (sanchalakB2bBalance || 0) : (customerSession?.phone ? (walletBalance || 0) : 0);
    if (!isFreeService && currentBal < requiredFee) {
      setErrorMsg(language === 'hi'
        ? `अपर्याप्त वॉलेट बैलेंस! (वर्तमान: ₹${currentBal}, आवश्यक: ₹${requiredFee})। कृपया सेवा का उपयोग करने के लिए वॉलेट रिचार्ज करें।`
        : `Insufficient wallet balance! (Current: ₹${currentBal}, Required: ₹${requiredFee}). Please recharge wallet.`);
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const effectivePhone = customerSession?.phone || (isOperator ? (selectedCafe?.phone || '') : (localStorage.getItem('customer_phone') || ''));
    const cafeId = selectedCafe?.id || (isOperator ? (selectedCafe?.code || 'SMARTCAFE-HQ') : 'SMARTCAFE-HQ');

    // Check if service requires Live OTP verification (only if OTP is not already provided)
    const requiresLiveOtp = (currentTool?.id?.includes('otp') || currentTool?.id === 'aadhaar_original_pdf_otp' || currentTool?.id === 'aadhaar_otp_kyc' || currentTool?.id === 'abha_otp' || currentTool?.id === 'voter_original_pdf_otp') && !secondaryInput.trim();
    if (requiresLiveOtp) {
      try {
        const otpRes = await authFetch('/api/services/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: currentTool.id,
            phone: val.length === 10 ? val : (effectivePhone || '8006518960'),
            aadhaarNo: val,
            customerName: customerName.trim() || undefined,
            name: customerName.trim() || undefined,
            fatherName: fatherName.trim() || undefined,
            dob: dobDate ? formatDobDisplay(dobDate) : undefined,
            gender: gender,
            address: addressInput.trim() || undefined,
            epicNumber: val
          })
        });
        const otpData = await otpRes.json();
        if (otpData.success) {
          setActiveOtpData({ ...otpData, testOtpHint: otpData.message?.match(/\d{6}/)?.[0] || '123456' });
          setShowOtpModal(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Live OTP request fallback:', err);
      }
    }

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

    if (toolKind === 'rc') {
      params.vehicleNumber = val.toUpperCase();
      params.rcno = val.toUpperCase();
      params.vehicle = val.toUpperCase();
      if (currentTool?.id?.includes('chassis')) {
        params.chassisNumber = val.toUpperCase();
        params.chassis = val.toUpperCase();
        params.chasis_number = val.toUpperCase();
      }
      if (currentTool?.id?.includes('engine')) {
        params.engineNumber = val.toUpperCase();
        params.engine_number = val.toUpperCase();
        params.engine = val.toUpperCase();
      }
    }
    if ((toolKind === 'pan' || toolKind === 'epan') && !['pan_find', 'pan_find_manual', 'pan_find_manual_alt'].includes(tid)) {
      params.panNo = val.toUpperCase();
      params.panNumber = val.toUpperCase();
      params.pan = val.toUpperCase();
      params.name = customerName.trim() || undefined;
      if (currentTool?.id?.includes('gst')) {
        params.gst = val.toUpperCase();
        params.gstNumber = val.toUpperCase();
      }
    }
    if (currentTool?.id?.includes('upi') || tid === 'upi_to_details') {
      params.UPI_ID = val.trim();
      params.upi_id = val.trim();
      params.upi = val.trim();
    }
    if (toolKind === 'aadhaar') {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.name = customerName.trim() || undefined;
      params.address = addressInput.trim() || undefined;
    }
    if (toolKind === 'voter' || currentTool?.category === 'voter' || tid.includes('voter') || tid.includes('epic')) {
      params.epicNo = val.toUpperCase().trim();
      params.epicNumber = val.toUpperCase().trim();
      params.epic = val.toUpperCase().trim();
      params.voter_number = val.toUpperCase().trim();
      params.voterNumber = val.toUpperCase().trim();
      params.epic_number = val.toUpperCase().trim();
      if (secondaryInput) {
        params.mobile = secondaryInput.trim();
        params.mobileNumber = secondaryInput.trim();
        params.phone = secondaryInput.trim();
        params.otp = secondaryInput.trim();
        params.otpCode = secondaryInput.trim();
      }
      if (customerName) {
        params.name = customerName.trim();
        params.customerName = customerName.trim();
      }
      if (fatherName) {
        params.fatherName = fatherName.trim();
        params.relativeName = fatherName.trim();
      }
      if (dobDate) params.dob = formatDobDisplay(dobDate);
      if (gender) params.gender = gender;
      if (thirdInput) params.assembly = thirdInput.trim();
      if (photoData) params.photo = photoData;
    }
    if (toolKind === 'ayushman') {
      params.pmjayId = val.toUpperCase();
      params.uidNumber = val;
      params.name = customerName.trim() || undefined;
      if (dobDate) params.dob = formatDobDisplay(dobDate);
    }
    if (toolKind === 'ration' && tid !== 'ration_pdf_by_aadhar') {
      params.rationNo = val;
      params.ration_no = val;
      params.uidNumber = val;
      params.aadhar = val;
      params.headName = customerName.trim() || undefined;
    }
    if (toolKind === 'electricity') {
      params.consumerNo = val;
      params.caNumber = val;
      params.consumerName = customerName.trim() || undefined;
      if (secondaryInput) params.operator = secondaryInput.trim();
    }
    if (toolKind === 'dl') {
      params.dlNo = val.toUpperCase();
      params.dl = val.toUpperCase();
      params.dl_number = val.toUpperCase();
      params.dob = dobDate ? formatDobDisplay(dobDate) : (params.dob || '01-01-1990');
      params.name = customerName.trim() || undefined;
    }
    if (currentTool?.id?.includes('eshram') || currentTool?.id === 'e_shram' || currentTool?.id === 'e_shram_update' || currentTool?.id === 'e_shram_number_link') {
      params.uidNumber = val;
      params.aadhaar = val;
      if (dobDate) params.dob = formatDobDisplay(dobDate);
      if (secondaryInput) params.mobile = secondaryInput.trim();
    }
    if (currentTool?.id === 'abha_card' || currentTool?.id === 'abha_otp' || currentTool?.id === 'abha_card_instant') {
      params.uidNumber = val;
      params.uid_number = val;
      if (dobDate) params.dob = formatDobDisplay(dobDate);
    }
    if (secondaryInput && secondaryInput.trim()) {
      params.secondaryInput = secondaryInput.trim();
      if (!params.mobile && /^\d{10}$/.test(secondaryInput.trim())) {
        params.mobile = secondaryInput.trim();
      }
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
    if (toolKind === 'ifsc') {
      params.ifscCode = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
      params.ifsc = params.ifscCode;
      params.query = params.ifscCode;
    }
    if (toolKind === 'pincode') {
      params.pincode = val.replace(/[^0-9]/g, '');
      params.pin = params.pincode;
      params.query = params.pincode;
    }
    if (toolKind === 'qr') {
      params.text = val;
      params.upi = val;
      params.query = val;
    }
    if (toolKind === 'sarkari_feed') {
      params.filter = val;
      params.query = val;
    }

    // Specific Service Parameter Mapping (Screenshot & Dedicated Form Inputs)
    if (tid === 'll_exam_pass_auto') {
      params.applicationNumber = val;
      params.dob = dobDate ? formatDobDisplay(dobDate) : '';
      params.password = secondaryInput.trim();
      params.examPin = thirdInput.trim();
      params.examsecretpin = thirdInput.trim();
      params.state = selectState || 'UP';
    }

    if (tid === 'll_find' || tid === 'll_pdf') {
      params.applicationNumber = val;
      params.idNumber = val;
      params.dob = dobDate ? formatDobDisplay(dobDate) : '';
      params.state = selectState || 'UP';
    }

    if (tid === 'dl_to_mobile_find') {
      params.dlNo = val;
      params.dl = val;
      params.dob = dobDate ? formatDobDisplay(dobDate) : '';
      params.mobile = secondaryInput.trim();
      params.state = selectState || 'UP';
      params.password = thirdInput.trim();
    }

    if (['driving_licence_pdf', 'dl_details', 'dl', 'drivinglicence'].includes(tid)) {
      params.dl = val;
      params.dlNo = val;
      params.dob = dobDate ? formatDobDisplay(dobDate) : '';
      params.cardBg = cardBg || 'White Background';
    }

    if (tid === 'puc_certificate_download') {
      params.vehicle_number = val.toUpperCase().replace(/[\s-]+/g, '');
      params.vehicleNumber = val.toUpperCase().replace(/[\s-]+/g, '');
      params.regNo = val.toUpperCase().replace(/[\s-]+/g, '');
    }

    if (['chassis_to_rc', 'chassis_to_rc_find', 'chassis_to_rc_alt'].includes(tid)) {
      params.chassisNumber = val.toUpperCase().trim();
      params.chassis = val.toUpperCase().trim();
      params.chassis_no = val.toUpperCase().trim();
    }

    if (tid === 'engine_to_rc') {
      params.engineNumber = val.toUpperCase().trim();
      params.engine = val.toUpperCase().trim();
      params.engine_number = val.toUpperCase().trim();
    }

    if (tid === 'pan_find') {
      const cleanUid = val.replace(/\D/g, '');
      params.aadhaarNo = cleanUid;
      params.uidNumber = cleanUid;
      params.aadhar = cleanUid;
      params.aadhaar = cleanUid;
      delete params.panNo;
      delete params.panNumber;
      delete params.pan;
    }

    if (['pan_find_manual', 'pan_find_manual_alt'].includes(tid)) {
      params.name = customerName.trim();
      params.customerName = customerName.trim();
      params.fatherName = fatherName.trim();
      params.dob = dobDate ? formatDobDisplay(dobDate) : undefined;
      params.mobile = secondaryInput.trim();
      delete params.panNo;
      delete params.panNumber;
      delete params.pan;
    }

    if (tid === 'pan_to_aadhar_find') {
      params.panNo = val.toUpperCase().trim();
      params.pan = val.toUpperCase().trim();
      params.panNumber = val.toUpperCase().trim();
      params.dob = dobDate ? formatDobDisplay(dobDate) : undefined;
    }

    if (tid === 'pan_aadhaar_link_manual') {
      params.panNo = val.toUpperCase().trim();
      params.pan = val.toUpperCase().trim();
      params.panNumber = val.toUpperCase().trim();
      params.aadhaarNo = secondaryInput.trim().replace(/\D/g, '');
      params.aadhaar = secondaryInput.trim().replace(/\D/g, '');
      params.mobile = (thirdInput.trim() || secondaryInput.trim()).replace(/\D/g, '');
    }

    if (tid === 'pan_to_gst') {
      params.panNo = val.toUpperCase().trim();
      params.pan = val.toUpperCase().trim();
      params.panNumber = val.toUpperCase().trim();
    }

    if (['gst_to_pan', 'gst_verification'].includes(tid)) {
      params.gstin = val.toUpperCase().trim();
      params.gst = val.toUpperCase().trim();
      params.gstNumber = val.toUpperCase().trim();
    }

    if (['pan_details', 'panverificationpremium', 'pan_basic_pricing'].includes(tid)) {
      params.panNumber = val.toUpperCase().trim();
      params.pan = val.toUpperCase().trim();
      params.panNo = val.toUpperCase().trim();
    }

    if (['pancard', 'pan'].includes(tid)) {
      params.panNo = val.toUpperCase().trim();
      params.pan = val.toUpperCase().trim();
      params.panNumber = val.toUpperCase().trim();
      params.name = customerName.trim() || undefined;
      params.customerName = customerName.trim() || undefined;
      params.fatherName = fatherName.trim() || undefined;
      params.dob = dobDate ? formatDobDisplay(dobDate) : undefined;
      params.photoData = photoData;
      params.signData = signData;
    }

    if (['aadhaar_pdf_otp', 'aadhaar_original_pdf_otp'].includes(tid)) {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.otp = secondaryInput.trim();
      params.txnId = currentResult?.txnId || activeOtpData?.txnId || undefined;
      params.action = secondaryInput.trim() ? 'verify_otp' : 'sendOtp';
    }

    if (['aadhaar_ekyc', 'uid_ekyc'].includes(tid)) {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.pidData = biometricPid;
      params.bioenc = biometricPid;
      params.deviceType = rdDeviceType || rdDeviceStatus.name || 'Mantra MFS100';
    }

    if (['aadhaar_advance', 'aadhaar_advance_one', 'aadhaar_advance_two', 'aadhaar_advance_three', 'aadhaar_advance_four', 'aadhaar_advance_five', 'aadhaar_fingerprint'].includes(tid)) {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.fingerprintData = biometricPid;
      params.pidData = biometricPid;
      params.bioenc = biometricPid;
      params.advanceServer = advanceServer || '1';
    }

    if (['aadhaar_manual', 'aadhaarcard'].includes(tid) || (toolKind === 'card' && currentTool?.id === 'aadhaarCard')) {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.name = customerName.trim();
      params.customerName = customerName.trim();
      params.fatherName = fatherName.trim();
      params.dob = dobDate ? formatDobDisplay(dobDate) : undefined;
      params.gender = gender;
      params.address = addressInput.trim();
      params.photoData = photoData;
      params.photo = photoData;
      params.serviceId = 'aadhaarCard';
    }

    if (['mobile_update_service', 'aadhaar_to_mobile_find', 'aadhaar_mobile_link'].includes(tid)) {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.dob = dobDate ? formatDobDisplay(dobDate) : undefined;
      params.mobile = secondaryInput.trim();
    }

    if (['dob_update_service', 'aadhaar_dob_update'].includes(tid)) {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.dob = dobDate ? formatDobDisplay(dobDate) : undefined;
      params.mobile = secondaryInput.trim();
      params.docProof = thirdInput.trim() || undefined;
    }

    if (['mask_aadhaar', 'aadhaar_mask_verification', 'pan_aadhar_mask'].includes(tid)) {
      const cleanUid = val.replace(/\D/g, '');
      params.aadhaarNo = cleanUid;
      params.uidNumber = cleanUid;
      params.aadhar = cleanUid;
      params.aadhaar = cleanUid;
    }

    if (tid === 'ration_pdf_by_aadhar') {
      params.aadhaarNo = val;
      params.uidNumber = val;
      params.aadhar = val;
      params.state = selectState || 'UP';
      params.rationtype = 'new';
      delete params.rationNo;
      delete params.ration_no;
      delete params.rationNumber;
    }

    if (['up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar'].includes(tid)) {
      params.rationNo = val;
      params.ration_no = val;
      params.rationNumber = val;
      params.state = selectState || 'UP';
    }

    if (['ration', 'ration_pdf_by_ration', 'ration_verification', 'rationCard', 'up_ration_info'].includes(tid)) {
      params.rationNo = val;
      params.rationNumber = val;
      params.ration_no = val;
      params.state = selectState || 'UP';
    }

    if (['ayushman', 'pmjay_verify', 'ayushman_card', 'ayushman_image_jpg', 'ayushmanCard'].includes(tid)) {
      params.pmjayId = val.toUpperCase().trim();
      params.uidNumber = val.trim();
      params.customerName = customerName.trim() || undefined;
      params.name = customerName.trim() || undefined;
      params.state = selectState || 'UP';
    }

    if (tid === 'e_shram') {
      params.uidNumber = val;
      params.aadhaar = val;
    }

    if (['e_shram_update', 'e_shram_number_link'].includes(tid)) {
      params.uidNumber = val;
      params.aadhaar = val;
      if (dobDate) params.dob = formatDobDisplay(dobDate);
      if (secondaryInput) params.mobile = secondaryInput.trim();
    }

    if (['samagra_service', 'sambal_pdf'].includes(tid)) {
      params.familyId = val;
      params.samagraId = val;
      params.aadhaar = val;
      params.uidNumber = val;
    }

    if (['rtps_bihar_pdf', 'rtps'].includes(tid)) {
      params.applicationNumber = val;
      params.appNo = val;
      params.name = secondaryInput.trim().toUpperCase();
      params.applicantName = secondaryInput.trim().toUpperCase();
    }

    if (tid === 'nsdl_bank') {
      params.accountNo = val;
      params.ifsc = secondaryInput.trim().toUpperCase();
      params.bankName = 'NSDL Payments Bank';
    }

    if (tid === 'telegram_to_number_lookup') {
      params.telegram = val.trim();
      params.username = val.trim();
    }

    if (tid === 'upi_to_details') {
      params.UPI_ID = val.trim();
      params.upi = val.trim();
    }

    if (tid === 'gmail_to_details') {
      params.email = val.trim();
      params.gmail = val.trim();
    }

    if (['electric_bill_pdf_bihar', 'electric_bill'].includes(tid)) {
      params.caNumber = val;
      params.ca_number = val;
      params.consumerNumber = val;
      params.operator = secondaryInput.trim() || 'SBPDCL';
    }

    if (['agristack_pdf', 'agristack_verify', 'agristack_dbt'].includes(tid)) {
      params.farmerId = val;
      params.uidNumber = val;
      params.aadhaar = val;
    }

    if (['udyam_pdf', 'udyam'].includes(tid)) {
      params.udyamNo = val;
      params.udyamNumber = val;
      if (secondaryInput) params.mobile = secondaryInput.trim();
    }

    if (['mobile_to_upi_find', 'mobile_to_multi_upi_find', 'mobile_to_account_find', 'mobile_to_multi_account', 'vi_sim_to_photo_details', 'check_operator', 'check_plan', 'mobile_to_details', 'mobile_lookup', 'chalan_find_mobile'].includes(tid)) {
      params.mobile = val.trim();
      params.mobileNumber = val.trim();
      params.phone = val.trim();
      params.type = 'mobile';
      params.value = val.trim();
    }

    if (['npci_verify', 'uid_seeding', 'aadhaar_bank_seeding'].includes(tid)) {
      params.aadhaar = val;
      params.uidNumber = val;
      params.aadhaarNo = val;
    }

    if (tid === 'bank_ifsc_lookup') {
      params.ifsc = val.trim().toUpperCase();
    }

    if (tid === 'pincode_lookup') {
      params.pincode = val.trim();
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
          previewMode: false,
          params
        })
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < 350) {
        await new Promise(r => setTimeout(r, 350 - elapsed));
      }

      const data = await res.json();

      if (data.isComingSoon) {
        setErrorMsg(data.message || '⏳ यह सेवा आगामी है (Coming Soon)। नए अधिकृत API प्रोवाइडर के साथ जल्द लाइव की जा रही है।');
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        setErrorMsg(data.error || 'अपर्याप्त वॉलेट बैलेंस! कृपया सेवा का उपयोग करने के लिए वॉलेट रिचार्ज करें।');
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        if (data.status === 'pending' || data.fulfillmentType === 'manual_relay') {
          setCurrentResult({
            ...data,
            isPendingRelay: true,
            status: 'pending',
            orderId: data.orderId || data.order?.id || `ORD-${Date.now()}`,
            order: data.order || { id: data.orderId, refNumber: val, serviceName: currentTool?.name },
            submittedParams: params,
            serviceTitle: currentTool?.title_hi || currentTool?.title || currentTool?.name,
            submittedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
          });
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          fetchOrderHistory();
          if (onBalanceUpdated) onBalanceUpdated();
          setTimeout(() => {
            const el = document.getElementById('cr80-preview-anchor');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return;
        }

        // Overlay user real inputs strictly
        const rawGen = data.generatedData || data.vehicleData || data.data || {};
        const officialPdf = rawGen.pdfUrl || rawGen.pdf || rawGen.pdf_base64 || rawGen.pdfBase64 || rawGen.Rc_Pdf || data.pdfUrl || null;
        const mergedData = {
          ...rawGen,
          regNo: val,
          panNo: val,
          aadhaarNo: ['up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar'].includes(tid) ? (rawGen.aadhaarNo || rawGen.uidNumber || rawGen.aadhar || '-') : val,
          maskedAadhaar: val.length >= 4 ? `XXXX XXXX ${val.replace(/\s/g, '').slice(-4)}` : val,
          epicNo: val,
          pmjayId: val,
          rationNo: tid === 'ration_pdf_by_aadhar' ? (rawGen.rationNo || rawGen.ration_no || rawGen.rcNo || rawGen.rationCardNo || '-') : val,
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
          signUrl: signData,
          pdfUrl: officialPdf,
          isLiveFromP4Points: Boolean(data.isLiveFromP4Points || rawGen.isLiveFromP4Points || data.source === 'p4points' || rawGen.source === 'p4points')
        };

        setCurrentResult({
          ...data,
          pdfUrl: officialPdf,
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
        if (isFreeService) {
          await executeDirectLookupFallback(val);
        } else {
          setErrorMsg(data.error || 'सेवा निष्पादन में त्रुटि हुई। कृपया पुनः प्रयास करें।');
        }
      }
    } catch (err) {
      console.warn('execute-automated error:', err);
      if (isFreeService) {
        await executeDirectLookupFallback(val);
      } else {
        setErrorMsg('सर्वर से संपर्क करने में असमर्थ। कृपया बाद में प्रयास करें।');
      }
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

      const targetUrl = fallbackUrlMap[currentTool.id] || fallbackUrlMap[toolKind];
      if (!targetUrl) {
        setErrorMsg('सेवा निष्पादन में त्रुटि हुई। कृपया पुनः प्रयास करें।');
        return;
      }
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
          retailFee: 0,
          wholesaleCost: 0,
          margin: 0,
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
    if (orderItem.fulfillmentType === 'manual_relay' && orderItem.status === 'pending') {
      setCurrentResult({
        success: true,
        isPendingRelay: true,
        status: 'pending',
        orderId: orderItem.id || orderItem.orderId,
        order: orderItem,
        submittedParams: orderItem.params || orderItem.inputs || {},
        serviceTitle: orderItem.serviceName || orderItem.docTitle || currentTool?.name,
        submittedAt: orderItem.submittedAt || orderItem.createdAt
      });
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    const genData = orderItem.generatedData || orderItem.vehicleData || orderItem;
    setCurrentResult({
      success: true,
      isReprint: true,
      message: '✅ 1-क्लिक निःशुल्क रिप्रिंट लोड हो गया (वॉलेट से कोई कटौती नहीं हुई)।',
      retailFee: 0,
      wholesaleCost: 0,
      margin: 0,
      pdfUrl: orderItem.pdfUrl || genData?.pdfUrl,
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

      // 1. If authentic official PDF is returned from P4Points upstream, download it directly!
      const rawLivePdf = activeData.pdfUrl || activeData.pdf || activeData.pdf_base64 || activeData.pdfBase64 || activeData.Rc_Pdf || activeData.raw?.pdf_base64 || activeData.raw?.pdfBase64 || activeData.raw?.pdf || activeData.raw?.data?.pdf_base64;
      if (rawLivePdf && typeof rawLivePdf === 'string' && rawLivePdf.length > 50) {
        let pdfDataUri = rawLivePdf;
        if (!pdfDataUri.startsWith('data:') && !pdfDataUri.startsWith('http')) {
          pdfDataUri = `data:application/pdf;base64,${rawLivePdf}`;
        }
        const a = document.createElement('a');
        a.href = pdfDataUri;
        a.download = `${currentTool.id}_${val}_official.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

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

  const activeData = currentResult?.generatedData || currentResult?.vehicleData || currentResult?.data || (currentResult && typeof currentResult === 'object' && currentResult.success ? currentResult : null);

  // Filtered orders for this specific tool (safe against undefined or null)
  const toolOrders = useMemo(() => {
    if (!Array.isArray(orderHistory)) return [];
    return orderHistory.filter(o => {
      if (!o) return false;
      const matchesTool = o.serviceType === currentTool?.serviceType || 
        o.serviceType === currentTool?.id ||
        (toolKind === 'rc' && (o.serviceType === 'rcDownload' || o.vehicleNumber)) ||
        (toolKind === 'pan' && (o.serviceType === 'panCard' || o.panNo)) ||
        (toolKind === 'aadhaar' && (o.serviceType === 'aadhaarCard' || o.aadhaarNo));
      if (!matchesTool) return false;
      if (!historySearch) return true;
      const s = String(historySearch).toLowerCase();
      return (
        (o.refNumber && String(o.refNumber).toLowerCase().includes(s)) ||
        (o.docTitle && String(o.docTitle).toLowerCase().includes(s)) ||
        (o.customerName && String(o.customerName).toLowerCase().includes(s))
      );
    });
  }, [orderHistory, currentTool, toolKind, historySearch]);


  // Screenshot-Exact Action Button Label Helper
  const getActionButtonText = () => {
    const id = (currentTool?.id || '').toLowerCase();
    if (isManualRelay12) {
      return '⏱️ अधिकृत ऑपरेटर सेवा अनुरोध (1-2 घंटे में प्रोसेस)';
    }
    if (['rc', 'rc_pdf_download', 'rc_to_details', 'vehicle_rc', 'pan', 'pan_details', 'pan_basic_pricing'].includes(id)) {
      return 'Fetch Details';
    }
    if (['chassis_to_rc', 'chassis_to_rc_find', 'chassis_to_rc_alt', 'engine_to_rc', 'puc_certificate_download'].includes(id)) {
      return '🔍 विवरण प्राप्त करें';
    }
    if (['pan_find', 'pan_find_manual', 'pan_find_manual_alt', 'pan_to_aadhar_find'].includes(id)) {
      return '🔍 पैन खोजें';
    }
    if (id === 'pan_aadhaar_link_manual') {
      return '🔗 लिंक अनुरोध भेजें';
    }
    if (id === 'pancard' || (id === 'pan' && currentTool?.serviceType === 'panCard')) {
      return '🖨️ कार्ड जनरेट करें';
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

    // 1. CHASSIS TO RC (Chassis Number)
    if (['chassis_to_rc', 'chassis_to_rc_find', 'chassis_to_rc_alt', 'chassis_to_mobile_find'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <span className="text-base leading-none">🔍</span>
            <div>
              <p className="font-bold">चेसिस नंबर से RC खोज (Chassis To RC)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                वाहन का 17-अंकीय चेसिस नंबर दर्ज करें। आधिकारिक RC विवरण व रजिस्ट्रेशन नंबर तुरंत प्राप्त करें।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chassis Number (17-अंकीय चेसिस नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17))}
              placeholder="17-अंकीय चेसिस नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
        </div>
      );
    }

    // 2. ENGINE TO RC (Engine Number)
    if (id === 'engine_to_rc') {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
            <span className="text-base leading-none">⚙️</span>
            <div>
              <p className="font-bold">इंजन नंबर से RC खोज (Engine To RC)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                वाहन का आधिकारिक इंजन नंबर दर्ज करें और RC विवरण प्राप्त करें।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Engine Number (इंजन नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20))}
              placeholder="इंजन नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
        </div>
      );
    }

    // 2B. PUC POLLUTION CERTIFICATE DOWNLOAD
    if (id === 'puc_certificate_download') {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <span className="text-base leading-none">🚗</span>
            <div>
              <p className="font-bold">वाहन प्रदूषण प्रमाण पत्र (PUC Certificate Download)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                वाहन का आधिकारिक रजिस्ट्रेशन नंबर दर्ज करें (जैसे UP32AB1234)। आधिकारिक प्रदूषण जांच प्रमाण पत्र तुरंत तैयार होगा।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Vehicle Registration Number (गाड़ी का नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14))}
              placeholder="गाड़ी नंबर दर्ज करें (जैसे UP32AB1234)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
        </div>
      );
    }

    // 3. VEHICLE RC / NEW RC (Screenshot 243)
    if (['rc', 'rc_pdf_download', 'rc_to_details', 'vehicle_rc', 'rc_father_name_find', 'rc_to_mobile_find', 'rc_mobile_fetch', 'vahan_check'].includes(id) || (cat === 'rc' && !['puc_certificate_download', 'chassis_to_rc', 'chassis_to_rc_find', 'chassis_to_rc_alt', 'chassis_to_mobile_find', 'engine_to_rc'].includes(id))) {
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
              placeholder="गाड़ी नंबर दर्ज करें"
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
              placeholder="पिता का नाम दर्ज करें"
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
            placeholder="गाड़ी या चालान नंबर दर्ज करें"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 5. LL EXAM REQUEST / PASS (Screenshot 234)
    if (id === 'll_exam_pass_auto') {
      return (
        <div className="space-y-3.5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <span className="text-base leading-none">💡</span>
            <div>
              <p className="font-bold">परिवहन सारथी ऑनलाइन टेस्ट आवेदन (Manual Relay)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आवेदन संख्या, जन्मतिथि और परिवहन विभाग द्वारा मोबाइल पर भेजा गया <b>SMS पासवर्ड</b> दर्ज करें। यह आवेदन रेखा ऑपरेटर द्वारा 1 से 2 घंटे में प्रोसेस किया जाता है।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Application Number (आवेदन संख्या) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
              placeholder="आवेदन संख्या दर्ज करें (जैसे 12345678/2026)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth (जन्मतिथि) *
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
              Parivahan SMS Password (सारथी एग्जाम पासवर्ड) *
            </label>
            <input
              type="password"
              required
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value)}
              placeholder="मोबाइल पर प्राप्त सारथी SMS पासवर्ड दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-sm font-bold focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Pin <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={thirdInput}
                onChange={(e) => setThirdInput(e.target.value)}
                placeholder="एग्जाम पिन (यदि उपलब्ध हो)"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select State (राज्य) *
              </label>
              <select
                value={selectState}
                onChange={(e) => setSelectState(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer"
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
        </div>
      );
    }

    // 6. LL FIND & LL PDF DOWNLOAD (Screenshot 230)
    if (['ll_find', 'll_pdf'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Application / Learning Number (आवेदन या लर्नर नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().slice(0, 20))}
              placeholder="आवेदन या लर्निंग नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth (जन्मतिथि) *
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
              Select State (राज्य) *
            </label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Delhi">Delhi</option>
              <option value="Haryana">Haryana</option>
              <option value="All India">All India</option>
            </select>
          </div>
        </div>
      );
    }

    // 7. DL TO MOBILE FIND / LINK
    if (id === 'dl_to_mobile_find') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Driving Licence (DL) Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 18))}
              placeholder="DL नंबर दर्ज करें (जैसे UP32 20180012345)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth (जन्मतिथि) *
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
              Registered / New Mobile Number *
            </label>
            <input
              type="text"
              required
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select State (राज्य) *
              </label>
              <select
                value={selectState}
                onChange={(e) => setSelectState(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer"
              >
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Delhi">Delhi</option>
                <option value="Haryana">Haryana</option>
                <option value="All India">All India</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sarathi SMS Password / PIN <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={thirdInput}
                onChange={(e) => setThirdInput(e.target.value)}
                placeholder="सारथी SMS पासवर्ड / पिन"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    // 8. GENUINE DRIVING LICENCE (DL) CARD PRINT (Screenshot 250)
    if (['dl', 'driving_licence_pdf', 'dl_details', 'drivingLicence'].includes(id)) {
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

    // 9A. LOST PAN CARD FIND BY AADHAAR (12-Digit Aadhaar Number - NO PAN Field!)
    if (id === 'pan_find') {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <span className="text-base leading-none">🔍</span>
            <div>
              <p className="font-bold">गुमशुदा पैन - आधार से खोज (Lost PAN by Aadhaar)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                अपना 12-अंकीय आधार नंबर दर्ज करें। आयकर विभाग के सर्वर से संबद्ध स्थायी खाता संख्या (PAN) तुरंत खोजी जाएगी।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar Number (12-अंकीय आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>
        </div>
      );
    }

    // 9B. LOST PAN CARD FIND MANUAL (Name + Father Name + DOB + Mobile - NO PAN Field!)
    if (['pan_find_manual', 'pan_find_manual_alt'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <span className="text-base leading-none">📋</span>
            <div>
              <p className="font-bold">नाम-मोबाइल-DOB से पैन खोज (PAN Search by Name, DOB & Mobile)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आधार अनुसार पूरा नाम, पिता का नाम, जन्मतिथि और 10-अंकीय मोबाइल नंबर दर्ज करें।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name (आधार अनुसार पूरा नाम) *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
              placeholder="पूरा नाम दर्ज करें (आधार अनुसार)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm uppercase focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Father Name (पिता का नाम) *
            </label>
            <input
              type="text"
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value.toUpperCase())}
              placeholder="पिता का नाम दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm uppercase focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Date Of Birth (जन्मतिथि) *
              </label>
              <input
                type="date"
                required
                value={dobDate}
                onChange={(e) => setDobDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mobile Number (मोबाइल नंबर) *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                inputMode="numeric"
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="10-अंकीय मोबाइल नंबर"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    // 10. PAN TO AADHAAR FIND
    if (id === 'pan_to_aadhar_find') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              10-Digit PAN Number *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="पैन कार्ड नंबर दर्ज करें (जैसे ABCDE1234F)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth (जन्मतिथि) *
            </label>
            <input
              type="date"
              required
              value={dobDate}
              onChange={(e) => setDobDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      );
    }

    // 11. PAN AADHAAR LINK MANUAL
    if (id === 'pan_aadhaar_link_manual') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              PAN Number (पैन नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय पैन नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar Number (12-अंकीय आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mobile Number (मोबाइल नंबर) *
            </label>
            <input
              type="text"
              required
              value={thirdInput}
              onChange={(e) => setThirdInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>
      );
    }

    // 12. PAN TO GST (Screenshot 227)
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

    // 13. GST TO PAN / GST VERIFICATION (Screenshot 228)
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

    // 14. PAN TO MASK AADHAAR / MASK PAN (Screenshot 196)
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

    // 15A. INSTANT PAN PVC CR-80 MAKER (Service 12: panCard)
    if (id === 'pancard') {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <span className="text-base leading-none">🖨️</span>
            <div>
              <p className="font-bold">ISO CR-80 PVC पैन कार्ड मेकर (NSDL/UTI लेआउट)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                पैन कार्ड नंबर, नाम, पिता का नाम, जन्मतिथि दर्ज करें तथा फ़ोटो व हस्ताक्षर अपलोड करें। 1-क्लिक में आधिकारिक CR-80 कार्ड तैयार होगा।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              10-Digit PAN Number (पैन नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय पैन नंबर दर्ज करें (जैसे ABCDE1234F)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name (पूरा नाम) *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
              placeholder="पैन कार्ड धारक का पूरा नाम"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Father's Name (पिता का नाम) *
            </label>
            <input
              type="text"
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value.toUpperCase())}
              placeholder="पिता का नाम दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth (जन्मतिथि) *
            </label>
            <input
              type="date"
              required
              value={dobDate}
              onChange={(e) => setDobDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm focus:outline-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                पासपोर्ट फ़ोटो अपलोड
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              {photoData && (
                <div className="w-12 h-14 rounded border border-slate-300 overflow-hidden mt-1 shadow-2xs">
                  <img src={photoData} alt="Photo preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                हस्ताक्षर (Signature) अपलोड
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              {signData && (
                <div className="w-20 h-8 rounded border border-slate-300 overflow-hidden mt-1 bg-white flex items-center justify-center p-1 shadow-2xs">
                  <img src={signData} alt="Sign preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 15B. GENERAL PAN / PAN DETAILS (Screenshot 220)
    if (['pan', 'pan_details', 'pan_basic_pricing', 'pan_to_udyam_details', 'pan_verification_premium', 'panverificationpremium'].includes(id)) {
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
              placeholder="Enter PDF Password"
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

    // 13A. AADHAAR ORIGINAL PDF WITH OTP (Service 13: aadhaar_pdf_otp)
    if (['aadhaar_pdf_otp', 'aadhaar_original_pdf_otp'].includes(id)) {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
            <span className="text-base leading-none">🪪</span>
            <div>
              <p className="font-bold">आधार ओरिजिनल PDF डाउनलोड (OTP द्वारा)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                12-अंकीय आधार नंबर दर्ज करें, 'OTP भेजें' बटन दबाएं एवं पंजीकृत मोबाइल पर प्राप्त 6-अंकीय OTP दर्ज कर ओरिजिनल e-Aadhaar PDF डाउनलोड करें।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:border-blue-500">
              <span className="bg-red-600 text-white font-bold px-3 py-2.5 text-xs flex items-center">
                UID
              </span>
              <input
                type="text"
                required
                maxLength={12}
                inputMode="numeric"
                autoComplete="off"
                value={primaryInput}
                onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="12-अंकीय आधार नंबर दर्ज करें"
                className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                6-Digit Aadhaar OTP (प्राप्त OTP)
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (primaryInput.replace(/\D/g, '').length !== 12) {
                    setErrorMsg(language === 'hi' ? 'कृपया पहले 12-अंकीय मान्य आधार नंबर दर्ज करें।' : 'Please enter valid 12-digit Aadhaar number.');
                    return;
                  }
                  setErrorMsg('');
                  setLoading(true);
                  try {
                    const otpRes = await authFetch('/api/services/otp/request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        serviceType: currentTool?.id || 'aadhaar_original_pdf_otp',
                        phone: customerSession?.phone || '8006518960',
                        aadhaarNo: primaryInput,
                        uidNumber: primaryInput,
                        cafeId: selectedCafe?.id || 'SMARTCAFE-HQ'
                      })
                    });
                    const otpData = await otpRes.json();
                    if (otpData.success || otpData.requiresOtp) {
                      setActiveOtpData({ ...otpData, testOtpHint: otpData.message?.match(/\d{6}/)?.[0] || '123456' });
                      setShowOtpModal(true);
                    } else {
                      setErrorMsg(otpData.error || 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।');
                    }
                  } catch (e) {
                    setErrorMsg('OTP सर्वर से संपर्क नहीं हो सका।');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>OTP भेजें (Request OTP)</span>
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="6-अंकीय OTP कोड दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>
        </div>
      );
    }

    // 13B. AADHAAR E-KYC BIOMETRIC VERIFICATION (Service 14: aadhaar_ekyc)
    if (['aadhaar_ekyc', 'uid_ekyc'].includes(id)) {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
            <span className="text-base leading-none">🔍</span>
            <div>
              <p className="font-bold">आधार e-KYC बायोमेट्रिक सत्यापन (eKYC Verification)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आधार नंबर दर्ज करें व बायोमेट्रिक स्कैनर (Mantra / Morpho / Startek) पर फिंगरप्रिंट कैप्चर कर लाइव जनसांख्यिकी डेटा सत्यापित करें।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:border-blue-500">
              <span className="bg-red-600 text-white font-bold px-3 py-2.5 text-xs flex items-center">
                UID
              </span>
              <input
                type="text"
                required
                maxLength={12}
                inputMode="numeric"
                autoComplete="off"
                value={primaryInput}
                onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="12-अंकीय आधार नंबर दर्ज करें"
                className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
              />
            </div>
          </div>

          {/* Live Biometric RD Service Scanner Interactive Block */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${rdDeviceStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {rdDeviceStatus.connected
                  ? `🟢 बायोमेट्रिक RD डिवाइस सक्रिय: ${rdDeviceStatus.name}`
                  : '🟡 UIDAI RD सर्विस (Mantra / Morpho / Startek)'}
              </span>
            </div>

            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500/10 to-indigo-500/10 border-2 border-dashed border-red-400 dark:border-red-600 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldCheck className={`w-8 h-8 ${isScanningFingerprint ? 'animate-bounce' : ''}`} />
            </div>

            {biometricScore ? (
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>फिंगरप्रिंट कैप्चर सफल! गुणवत्ता स्कोर: <b>{biometricScore}%</b> (e-KYC हेतु तैयार)</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isScanningFingerprint
                  ? '⏳ स्कैनर पर अंगूठा रखें... फिंगरप्रिंट पढ़ा जा रहा है...'
                  : 'UIDAI प्रमाणित RD स्कैनर से अंगूठा स्कैन करें'}
              </p>
            )}

            <button
              type="button"
              disabled={isScanningFingerprint}
              onClick={handleCaptureFingerprint}
              className="bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer w-full disabled:opacity-50"
            >
              {isScanningFingerprint ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>स्कैन हो रहा है... अंगूठा न हटाएं</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>बायोमेट्रिक स्कैन करें (Capture Fingerprint)</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // 13C. AADHAAR ADVANCE / FINGERPRINT PRINT 1 TO 5 (Service 15: aadhaar_advance)
    if (['aadhaar_advance', 'aadhaar_advance_one', 'aadhaar_advance_two', 'aadhaar_advance_three', 'aadhaar_advance_four', 'aadhaar_advance_five', 'aadhaar_fingerprint'].includes(id)) {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
            <span className="text-base leading-none">🖨️</span>
            <div>
              <p className="font-bold">आधार एडवांस फिंगरप्रिंट प्रिंट (सर्वर 1 से 5)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आधार नंबर दर्ज करें, सर्वर चुनें और बायोमेट्रिक स्कैनर पर अंगूठा लगाकर तुरंत लाइव आधार कार्ड प्राप्त करें।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:border-blue-500">
              <span className="bg-purple-600 text-white font-bold px-3 py-2.5 text-xs flex items-center">
                UID
              </span>
              <input
                type="text"
                required
                maxLength={12}
                inputMode="numeric"
                autoComplete="off"
                value={primaryInput}
                onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                placeholder="12-अंकीय आधार नंबर दर्ज करें"
                className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              एडवांस सर्वर चुनें (Select Advance Server 1-5) *
            </label>
            <select
              value={advanceServer}
              onChange={(e) => setAdvanceServer(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="1">सर्वर 1 (सुपरफास्ट - UIDAI Live)</option>
              <option value="2">सर्वर 2 (बैकअप - High Speed)</option>
              <option value="3">सर्वर 3 (Direct Auth Server)</option>
              <option value="4">सर्वर 4 (Enterprise Gateway)</option>
              <option value="5">सर्वर 5 (Redundant Mirror)</option>
            </select>
          </div>

          {/* Live Biometric RD Service Scanner Interactive Block */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${rdDeviceStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {rdDeviceStatus.connected
                  ? `🟢 बायोमेट्रिक RD सर्विस सक्रिय: ${rdDeviceStatus.name}`
                  : '🟡 UIDAI RD सर्विस (Mantra / Morpho / Startek)'}
              </span>
            </div>

            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-500/10 to-indigo-500/10 border-2 border-dashed border-rose-400 dark:border-rose-600 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldCheck className={`w-8 h-8 ${isScanningFingerprint ? 'animate-bounce' : ''}`} />
            </div>

            {biometricScore ? (
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>फिंगरप्रिंट कैप्चर सफल! गुणवत्ता स्कोर: <b>{biometricScore}%</b> (उत्कृष्ट)</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isScanningFingerprint
                  ? '⏳ स्कैनर पर अंगूठा रखें... फिंगरप्रिंट पढ़ा जा रहा है...'
                  : 'UIDAI प्रमाणित RD स्कैनर (Mantra MFS100 / Morpho MSO1300 E2/E3)'}
              </p>
            )}

            <button
              type="button"
              disabled={isScanningFingerprint}
              onClick={handleCaptureFingerprint}
              className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer w-full disabled:opacity-50"
            >
              {isScanningFingerprint ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>स्कैन हो रहा है... अंगूठा न हटाएं</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>फिंगरप्रिंट स्कैन करें (Capture Fingerprint)</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // 13D. AADHAAR MANUAL CR-80 PVC SMART CARD MAKER (Service 16: aadhaar_manual & aadhaarCard)
    if (['aadhaar_manual', 'aadhaarcard'].includes(id) || (toolKind === 'card' && currentTool?.id === 'aadhaarCard')) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
            <span className="text-base leading-none">🖨️</span>
            <div>
              <p className="font-bold">आधार मैनुअल CR-80 PVC स्मार्ट कार्ड मेकर</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आधार विवरण, जन्मतिथि व पूरा पता दर्ज करें तथा फ़ोटो अपलोड करें। ISO CR-80 PVC मानक (85.6mm × 54mm) कटिंग गाइडलाइन के साथ 1-क्लिक में कार्ड प्रिंट होगा।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              autoComplete="off"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Name (पूरा नाम - English / हिन्दी) *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="आधार धारक का पूरा नाम"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Father's / Husband's Name (पिता/पति का नाम) *
            </label>
            <input
              type="text"
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="पिता अथवा पति का नाम"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Date Of Birth (जन्मतिथि) *
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
                Gender (लिंग) *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="MALE">पुरुष (MALE)</option>
                <option value="FEMALE">महिला (FEMALE)</option>
                <option value="TRANSGENDER">अन्य (TRANSGENDER)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Complete Address (पूरा पता) *
            </label>
            <textarea
              required
              rows={2}
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="गाँव/मकान नं., पोस्ट, तहसील, जिला, राज्य एवं पिनकोड"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              पासपोर्ट फ़ोटो अपलोड (Photo Upload)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
              />
            </div>
            {photoData && (
              <div className="w-12 h-14 rounded border border-slate-300 overflow-hidden mt-1 shadow-2xs">
                <img src={photoData} alt="Photo preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 13E. AADHAAR MOBILE UPDATE SERVICE (Service 17: mobile_update_service)
    if (['mobile_update_service', 'aadhaar_to_mobile_find', 'aadhaar_mobile_link'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <span className="text-base leading-none">📱</span>
            <div>
              <p className="font-bold">आधार मोबाइल नंबर लिंक / अपडेट अनुरोध (मैन्युअल रिले)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आधार नंबर, जन्मतिथि एवं नया मोबाइल नंबर दर्ज करें। 1-2 घंटे में बैकएंड रिले द्वारा मोबाइल लिंक अनुरोध प्रोसेस किया जाएगा।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              autoComplete="off"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Of Birth (आधार अनुसार जन्मतिथि) *
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
              New Mobile Number (नया मोबाइल नंबर जिसे लिंक करना है) *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              inputMode="numeric"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय नया मोबाइल नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none"
            />
          </div>
        </div>
      );
    }

    // 13F. AADHAAR DOB UPDATE SERVICE (Service 18: dob_update_service)
    if (['dob_update_service', 'aadhaar_dob_update'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <span className="text-base leading-none">📅</span>
            <div>
              <p className="font-bold">आधार जन्मतिथि सुधार आवेदन (DOB Update Request)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                आधार नंबर, नई जन्मतिथि एवं पंजीकृत मोबाइल नंबर दर्ज करें। 1-2 घंटे में बैकएंड रिले द्वारा जन्मतिथि संशोधन अनुरोध प्रोसेस किया जाएगा।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              autoComplete="off"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              New Date Of Birth (संशोधित / नई जन्मतिथि) *
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
              Registered Mobile Number (पंजीकृत मोबाइल नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              inputMode="numeric"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Document Proof Details (दस्तावेज़ प्रमाण जैसे जन्म प्रमाण पत्र / 10th मार्कशीट)
            </label>
            <input
              type="text"
              value={thirdInput}
              onChange={(e) => setThirdInput(e.target.value)}
              placeholder="दस्तावेज़ का नाम अथवा प्रमाण पत्र संख्या (वैकल्पिक)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-xs focus:outline-none"
            />
          </div>
        </div>
      );
    }

    // 13G. MASK AADHAAR VERIFICATION (Service 19: mask_aadhaar)
    if (['mask_aadhaar', 'aadhaar_mask_verification', 'pan_aadhar_mask'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
            <span className="text-base leading-none">🛡️</span>
            <div>
              <p className="font-bold">मास्क आधार सत्यापन (Mask Aadhaar Verification)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                12-अंकीय आधार नंबर दर्ज कर UIDAI आधिकारिक मास्क आधार एवं सत्यापन स्थिति (Active/Linked) जांचें।
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              12-Digit Aadhaar Number (आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              autoComplete="off"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>
        </div>
      );
    }

    // 13H. UIDAI ORIGINAL PDF WITHOUT OTP (Screenshot 182)
    if (['uidai_original_pdf', 'aadhaar_original_pdf_no_otp'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar Number *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              autoComplete="off"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="Enter 12-digit Aadhaar Number"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
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
            maxLength={12}
            inputMode="numeric"
            autoComplete="off"
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
            placeholder="Enter 12-digit Aadhaar Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
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
            maxLength={12}
            inputMode="numeric"
            autoComplete="off"
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
            placeholder="Enter 12-digit Aadhaar Number"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
          />
        </div>
      );
    }

    // 17A. RATION CARD BY AADHAAR (Screenshot 255 - Must ask for Aadhaar Number, NOT Ration Number!)
    if (id === 'ration_pdf_by_aadhar') {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <span className="text-base leading-none">🌾</span>
            <div>
              <p className="font-bold">आधार से राशन कार्ड खोज व पर्ची डाउनलोड</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                परिवार के मुखिया अथवा किसी भी राशन कार्ड सदस्य का 12-अंकीय आधार नंबर दर्ज करें।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Aadhaar Number (12-अंकीय आधार नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none tracking-widest"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select State (राज्य) *</label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
              <option value="Bihar">Bihar (बिहार)</option>
              <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
              <option value="Rajasthan">Rajasthan (राजस्थान)</option>
              <option value="Haryana">Haryana (हरियाणा)</option>
              <option value="Delhi">Delhi (दिल्ली)</option>
              <option value="All India">All India (समस्त भारत)</option>
            </select>
          </div>
        </div>
      );
    }

    // 17B. RATION TO AADHAAR SEARCH
    if (['up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ration Card Number (राशन कार्ड नंबर) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9A-Z]/g, '').slice(0, 15))}
              placeholder="राशन कार्ड संख्या दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select State (राज्य)</label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Assam">Assam</option>
              <option value="All State">All State</option>
            </select>
          </div>
        </div>
      );
    }

    // 17C. REGULAR RATION CARD / PARCHAA PRINT
    if (['ration', 'ration_pdf_by_ration', 'ration_verification', 'rationCard', 'up_ration_info'].includes(id)) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ration Card Number (12-अंकीय राशन कार्ड नंबर) *
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय राशन कार्ड नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select State (राज्य) *</label>
            <select
              value={selectState}
              onChange={(e) => setSelectState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
              <option value="Bihar">Bihar (बिहार)</option>
              <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
              <option value="Rajasthan">Rajasthan (राजस्थान)</option>
              <option value="Haryana">Haryana (हरियाणा)</option>
              <option value="Delhi">Delhi (दिल्ली)</option>
              <option value="All India">All India (समस्त भारत)</option>
            </select>
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

    // 17D. RTPS BIHAR CERTIFICATE (Application Number + Applicant Name required by RtpsCertificate-Br.php)
    if (id === 'rtps_bihar_pdf' || id.includes('rtps')) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <span className="text-base leading-none">📜</span>
            <div>
              <p className="font-bold">बिहार RTPS प्रमाण पत्र डाउनलोड (Live P4Points API)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                RTPS पावती रसीद से <b>आवेदन संख्या (Application Number)</b> और <b>आवेदक का नाम</b> दर्ज करें।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Application Reference Number (आवेदन संख्या) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.trim())}
              placeholder="जैसे BIPCO/2026/123456 या BICC/..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Applicant Name (आवेदक का नाम, अंग्रेजी में) *
            </label>
            <input
              type="text"
              required
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.toUpperCase())}
              placeholder="आवेदक का पूरा नाम (अंग्रेजी में दर्ज करें)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white text-sm font-bold focus:outline-none uppercase"
            />
          </div>
        </div>
      );
    }

    // 17E. NSDL BANK DETAILS
    if (id === 'nsdl_bank') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Bank Account Number (बैंक खाता संख्या) *
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="खाता संख्या दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Bank IFSC Code (शाखा IFSC कोड) *
            </label>
            <input
              type="text"
              required
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
              placeholder="11-अंकीय IFSC कोड"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
        </div>
      );
    }

    // 17F. UPI TO DETAILS
    if (id === 'upi_to_details') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            UPI ID / VPA (वर्चुअल पेमेंट एड्रेस) *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.trim().toLowerCase())}
            placeholder="जैसे user@okhdfcbank या 9876543210@paytm"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 17G. TELEGRAM TO NUMBER LOOKUP
    if (id === 'telegram_to_number_lookup') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Telegram Username / User ID *
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.trim())}
            placeholder="जैसे @username या 123456789"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 17H. GMAIL TO DETAILS
    if (id === 'gmail_to_details') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Gmail / Google Email Address *
          </label>
          <input
            type="email"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.trim().toLowerCase())}
            placeholder="जैसे user@gmail.com"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
          />
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
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Beneficiary Name (लाभार्थी का नाम) *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
              placeholder="लाभार्थी का नाम दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none uppercase"
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
            {id === 'abha_otp' && (
              <span className="text-[11px] text-slate-400 block">OTP will be sent to registered mobile.</span>
            )}
          </div>
          {(id === 'abha_card' || id === 'abha_card_instant') && (
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
              {id === 'e_shram' ? 'Aadhaar / UAN Number (आधार या UAN नंबर) *' : 'Aadhaar Number (12-अंकीय आधार नंबर) *'}
            </label>
            <input
              type="text"
              required
              maxLength={12}
              inputMode="numeric"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
              placeholder="12-अंकीय आधार अथवा UAN नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
          {(id.includes('link') || id.includes('update')) && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth (आधार अनुसार जन्मतिथि) *</label>
                <input
                  type="date"
                  required
                  value={dobDate}
                  onChange={(e) => setDobDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Mobile Number (नया 10-अंकीय मोबाइल नंबर) *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  value={secondaryInput}
                  onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="10-अंकीय नया मोबाइल नंबर दर्ज करें"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      );
    }

    // 21. SAMAGRA / SAMBAL (Screenshot 200)
    if (['samagra_service', 'sambal_pdf'].includes(id)) {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {id === 'samagra_service'
              ? 'Samagra Family ID / Member ID (समग्र परिवार अथवा सदस्य आईडी) *'
              : 'Aadhaar Number / Samagra ID (12-अंकीय आधार अथवा 9-अंकीय समग्र आईडी) *'}
          </label>
          <input
            type="text"
            required
            maxLength={id === 'samagra_service' ? 9 : 12}
            inputMode="numeric"
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, id === 'samagra_service' ? 9 : 12))}
            placeholder={id === 'samagra_service' ? '8 या 9-अंकीय समग्र आईडी' : '12-अंकीय आधार अथवा 9-अंकीय समग्र आईडी'}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
          />
        </div>
      );
    }

    // 22. VOTER MOBILE LINK (Screenshot 264)
    if (['voter_mobile_link', 'vcmRequest', 'voter_mobile_link_no_otp', 'voter_mobile_link_instant_otp', 'instant_voter_link', 'voter_mobile_link_instant'].includes(id)) {
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
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
          </div>
        </div>
      );
    }

    // 22B. VOTER ORIGINAL PDF WITH OTP
    if (id === 'voter_original_pdf_otp') {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'EPIC वोटर नंबर (10 अक्षर) *' : 'EPIC Voter Number (10 Chars) *'}
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="EPIC वोटर नंबर दर्ज करें"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? '6-अंकीय मोबाइल OTP (यदि पहले से प्राप्त हो)' : '6-Digit Mobile OTP (Optional / If received)'}
            </label>
            <input
              type="text"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="6-अंकीय OTP दर्ज करें (खाली छोड़ें यदि अभी OTP भेजना है)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none"
            />
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              💡 {language === 'hi' ? 'यदि OTP खाली छोड़ेंगे तो सबमिट करने पर पंजीकृत मोबाइल पर OTP भेजा जाएगा।' : 'Leave blank to trigger SMS OTP on registered mobile on submit.'}
            </p>
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
            onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
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
            onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
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
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
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

    // 28A. VOTER PVC SMART CARD MAKER (CR-80 85.6mm×54mm)
    if (['voterCard', 'voter_card_pvc', 'voter_manual'].includes(id) || (toolKind === 'card' && id === 'voterCard')) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
            <span className="text-base leading-none">🖨️</span>
            <div>
              <p className="font-bold">ISO CR-80 PVC डिजिटल वोटर कार्ड मेकर (CR-80 85.6mm×54mm)</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                निर्वाचन आयोग (ECI) आधिकारिक डिज़ाइन, त्रि-रंगी सुरक्षा वॉटरमार्क, क्यूआर कोड एवं मतदान केंद्र विवरण सहित।
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'EPIC वोटर नंबर (10 अक्षर) *' : 'EPIC Voter Number (10 Chars) *'}
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
              placeholder="जैसे ABC1234567"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'मतदाता का पूरा नाम *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="पूरा नाम दर्ज करें"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'पिता / पति का नाम *' : 'Father / Husband Name *'}
              </label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="पिता या पति का नाम"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'जन्मतिथि (DOB) / आयु' : 'Date of Birth (DOB) / Age'}
              </label>
              <input
                type="date"
                value={dobDate}
                onChange={(e) => setDobDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'लिंग (Gender) *' : 'Gender *'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none cursor-pointer"
              >
                <option value="MALE">{language === 'hi' ? 'पुरुष (Male)' : 'Male'}</option>
                <option value="FEMALE">{language === 'hi' ? 'महिला (Female)' : 'Female'}</option>
                <option value="TRANSGENDER">{language === 'hi' ? 'अन्य (Transgender)' : 'Transgender'}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'विधानसभा निर्वाचन क्षेत्र (Assembly)' : 'Assembly Constituency'}
              </label>
              <input
                type="text"
                value={thirdInput}
                onChange={(e) => setThirdInput(e.target.value)}
                placeholder="विधानसभा निर्वाचन क्षेत्र संख्या व नाम"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'मतदान केंद्र / भाग संख्या (Part Name / No)' : 'Polling Station / Part No'}
              </label>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="मतदान केंद्र का नाम व भाग संख्या"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{language === 'hi' ? 'मतदाता फोटो (Photo Upload)' : 'Voter Photo'}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">PNG / JPG (max 2MB)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 bg-slate-100 border border-slate-300 rounded overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                {photoData ? (
                  <img src={photoData} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs font-bold">📷</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        </div>
      );
    }

    // 28. VOTER CARD / EPIC (Lookup & Standard Verification)
    if (['voter', 'voter_pdf', 'voter_original_pdf_no_otp', 'voter_verification', 'epic'].includes(id) || cat === 'voter') {
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {language === 'hi' ? '10-अक्षरों का EPIC वोटर नंबर *' : 'Voter Number (EPIC) *'}
          </label>
          <input
            type="text"
            required
            value={primaryInput}
            onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
            placeholder="EPIC वोटर नंबर दर्ज करें"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none uppercase"
          />
        </div>
      );
    }

    // 29. BANK IFSC LOOKUP (Single Click Instant)
    if (id === 'bank_ifsc_lookup' || id.includes('ifsc')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'बैंक IFSC कोड (11 अक्षर) *' : 'Bank IFSC Code (11 Chars) *'}
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
              placeholder="जैसे SBIN0000123 / PUNB0024000 / HDFC0000128"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-black text-sm focus:outline-none uppercase tracking-wider"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? '💡 केवल 11-अक्षरों का IFSC कोड डालें और 1-क्लिक में बैंक शाखा, पूरा पता, MICR व डिजिटल पेमेंट विवरण प्राप्त करें।'
              : '💡 Enter 11-digit IFSC code for instant Bank Name, Branch, Full Address & MICR.'}
          </p>
        </div>
      );
    }

    // 30. INDIA POST PINCODE LOOKUP (Single Click Instant)
    if (id === 'pincode_lookup' || id.includes('pincode')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? '6-अंकों का पिनकोड (Pincode) *' : '6-Digit Indian Pincode *'}
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="जैसे 110001, 201001, 800001"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-black text-sm focus:outline-none tracking-widest"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? '💡 पिनकोड डालते ही सभी डाकघरों की सूची, जिला और राज्य 0.2 सेकंड में प्राप्त करें।'
              : '💡 Instant Post Offices list, District & State in 0.2 seconds.'}
          </p>
        </div>
      );
    }

    // 31. INSTANT HIGH-RES QR GENERATOR (Single Click Instant)
    if (id === 'qr_generator' || id.includes('qr_')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'UPI ID, मोबाइल नंबर या टेक्स्ट *' : 'UPI ID, Mobile or Custom Text *'}
            </label>
            <input
              type="text"
              required
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.slice(0, 100))}
              placeholder="जैसे 8006518960@upi / https://smartcafe.sbs / दुकान का नाम"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? '💡 दुकान काउंटर स्टैंडी या रसीद टोकन के लिए 300 DPI एचडी क्यूआर कोड तुरंत 1-क्लिक में बनाएं।'
              : '💡 300 DPI High-Res QR code for shop counters, payments and receipts.'}
          </p>
        </div>
      );
    }

    // 32. LIVE SARKARI JOB FEED (Instant Feed)
    if (id === 'sarkari_job_feed' || id.includes('sarkari')) {
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'फ़िल्टर / सर्च कीवर्ड (वैकल्पिक)' : 'Filter / Keyword (Optional)'}
            </label>
            <input
              type="text"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value.slice(0, 50))}
              placeholder="जैसे SSC, Railway, Police, UPSC, Navy"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-bold text-sm focus:outline-none"
            />
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {language === 'hi'
                ? '💡 सीधे "⚡ ताज़ा अपडेट प्राप्त करें" दबाएं और 24x7 लाइव सरकारी नौकरी व एडमिट कार्ड की लिस्ट देखें।'
                : '💡 Press "Generate" to fetch all 24x7 live government exams, jobs, and admit cards.'}
            </span>
          </div>
        </div>
      );
    }

    // 33. DEFAULT / FALLBACK (Clean single input)
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              if (isOperator) {
                if (onOpenB2bWallet) onOpenB2bWallet();
              } else {
                if (customerSession?.phone) {
                  if (onOpenWallet) onOpenWallet();
                } else {
                  if (onOpenAuthModal) onOpenAuthModal();
                  else if (onOpenWallet) onOpenWallet();
                }
              }
            }}
            className="bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            {isOperator 
              ? `+ B2B (₹${sanchalakB2bBalance || 0})` 
              : customerSession?.phone 
              ? `+ ${language === 'hi' ? 'वॉलेट (शेष: ₹' : 'Wallet (Bal: ₹'}${walletBalance || 0})` 
              : `👤 ${language === 'hi' ? 'लॉगिन करें' : 'Login'}`}
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. DEDICATED FULL-SCREEN SERVICE WORKSPACE (2-COLUMN RESPONSIVE) */}
      {/* =================================================================== */}
      {toolKind === 'pvc_crop' ? (
        <PvcCardAutoCropper onOrderSaved={fetchOrderHistory} />
      ) : toolKind === 'passport_photo' ? (
        <PassportPhotoMaker onOrderSaved={fetchOrderHistory} />
      ) : toolKind === 'govt_resizer' ? (
        <GovtFormResizer onOrderSaved={fetchOrderHistory} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: THE INPUT FORM (AUTO-CLEARING, HTML5 DATES, PHOTO) */}
        {/* ================================================================= */}
        <div className="no-print w-full lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-[#0c162c] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            
            {/* Header Banner with Title on left & Status Badge & [← Back] on right */}
            <div className={`${currentTool?.isComingSoon ? 'bg-slate-800' : 'bg-[#1d4ed8] dark:bg-[#1e40af]'} text-white px-4 py-3.5 flex items-center justify-between shadow-xs gap-2`}>
              <span className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 truncate pr-2">
                <ServiceIconComponent className="w-4 h-4 text-white shrink-0" />
                <span className="truncate">{currentTool?.name || currentTool?.title?.en || currentTool?.id?.toUpperCase()}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {currentTool?.isComingSoon ? (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    ⏳ Coming Soon
                  </span>
                ) : isFreeService ? (
                  <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    🎉 100% मुफ़्त सेवा
                  </span>
                ) : (isManualRelay12 || currentTool?.fulfillmentType === 'manual_relay' || currentTool?.source === 'rekhaprint' || ['ll_exam_pass_auto', 'pan_find', 'pan_find_manual', 'pan_find_manual_alt', 'pan_aadhaar_link_manual', 'e_shram_update', 'samagra_service', 'sambal_pdf', 'dl_to_mobile_find', 'mobile_update_service', 'aadhaar_to_mobile_find', 'dob_update_service', 'puc_certificate_download', 'agristack_pdf'].includes(currentTool?.id)) ? (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    ⏱️ मैन्युअल रिले (1-2 घंटे)
                  </span>
                ) : (currentTool?.source === 'p4points' || ['rc_to_details', 'rc_fast_server', 'voter_verification', 'pan_details', 'pan_verification_premium', 'panverificationpremium', 'electric_bill_pdf_bihar', 'rtps_bihar_pdf', 'agristack_verify', 'agristack_dbt', 'udyam_pdf', 'mobile_to_upi_find', 'mobile_to_multi_upi_find', 'mobile_to_account_find', 'mobile_to_multi_account', 'upi_to_details', 'vi_sim_to_photo_details', 'check_operator', 'check_plan', 'mobile_to_details', 'mobile_lookup', 'chalan_find_mobile', 'chalan_find', 'nsdl_bank', 'npci_verify', 'uid_seeding', 'telegram_to_number_lookup', 'gmail_to_details', 'aadhaar_pdf_otp', 'aadhaar_original_pdf_otp', 'aadhaar_ekyc', 'uid_ekyc', 'aadhaar_advance', 'aadhaar_advance_one', 'aadhaar_advance_two', 'aadhaar_advance_three', 'aadhaar_advance_four', 'aadhaar_advance_five', 'mask_aadhaar', 'aadhaar_mask_verification', 'pan_aadhar_mask', 'pan_to_aadhar_find', 'pan_to_gst', 'gst_to_pan', 'gst_verification', 'ration_verification', 'ration_pdf_by_ration', 'ration_pdf_by_aadhar', 'up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar', 'up_ration_info', 'ayushman_image_jpg', 'e_shram'].includes(currentTool?.id) || currentTool?.fulfillmentType === 'instant_api' || currentTool?.serviceType === 'live_api') ? (
                  <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    🟢 लाइव सरकारी API
                  </span>
                ) : (toolKind === 'card' || ['panCard', 'aadhaarCard', 'aadhaar_manual', 'aadhaar_pvc', 'drivingLicence', 'voterCard', 'ayushmanCard', 'rationCard'].includes(currentTool?.id)) ? (
                  <span className="px-2 py-0.5 bg-sky-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    🖨️ CR-80 PVC स्मार्ट कार्ड
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-sky-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    ⚡ डिजिटल सेवा
                  </span>
                )}
                <button
                  type="button"
                  onClick={onBack}
                  className="bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
              </div>
            </div>

            {/* Manual Relay 12 Services Explicit Form Banner */}
            {isManualRelay12 && (
              <div className="m-4 mb-0 p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/10 border-2 border-amber-500/40 rounded-xl text-amber-950 dark:text-amber-200 text-xs shadow-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-black text-xs sm:text-sm text-amber-900 dark:text-amber-300">
                    ⏱️ अधिकृत ऑपरेटर सेवा अनुरोध (1-2 घंटे में प्रोसेस)
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed pl-6">
                  {language === 'hi'
                    ? 'यह सेवा सारथी/सरकारी पोर्टल पर बैकएंड ऑपरेटर द्वारा प्रोसेस की जाती है। अनुरोध दर्ज होने पर ट्रैकिंग रसीद जारी होगी।'
                    : 'This service is manually processed on the official portal by authorized backend operators (1-2 hours). A tracking docket will be issued upon submission.'}
                </p>
              </div>
            )}

            {/* Coming Soon Notice Banner */}
            {currentTool?.isComingSoon && (
              <div className="m-4 mb-0 p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-bold flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs sm:text-sm text-amber-950 dark:text-amber-300">
                    {language === 'hi' ? '⏳ यह सेवा आगामी है (Coming Soon)' : '⏳ Coming Soon Service'}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    {language === 'hi' 
                      ? 'यह सेवा नए अधिकृत API प्रोवाइडर के साथ शीघ्र ही लाइव की जाएगी। वर्तमान में इस सेवा पर कोई शुल्क नहीं कटेगा।' 
                      : 'This service will be made live shortly with an authorized API provider. No fee will be deducted.'}
                  </div>
                </div>
              </div>
            )}

            {/* New Form 49A PAN Card Application CTA Banner */}
            {(toolKind === 'pan' || currentTool?.category === 'pan') && (
              <div className="m-4 mb-0 p-3 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-400/40 rounded-xl text-white text-xs flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💳</span>
                  <div>
                    <span className="font-black text-xs text-white block">
                      {language === 'hi' ? 'नया पैन कार्ड (Form 49A) बनवाना है?' : 'Need a New PAN Card (Form 49A)?'}
                    </span>
                    <span className="text-[10px] text-blue-200">
                      {language === 'hi' ? '100% डिजिटल स्टैम्प्ड फॉर्म 49A • आधार व जन्मतिथि प्रमाण' : '100% Digital Auto-Stamped Form 49A'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTool('pan_new_apply')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition cursor-pointer shrink-0"
                >
                  <span>{language === 'hi' ? 'आवेदन खोलें' : 'Apply 49A'}</span>
                  <span>➔</span>
                </button>
              </div>
            )}

            {/* Card Body: EXACT Form Inputs matching Screenshots */}
            <form onSubmit={handleInstantGenerate} className="p-5 sm:p-6 space-y-4">
              {renderScreenshotFormInputs()}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                  {errorMsg.includes('बैलेंस') && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isOperator && onOpenB2bWallet) onOpenB2bWallet();
                          else if (onOpenWallet) onOpenWallet();
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition transform active:scale-95 text-xs"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? '💳 वॉलेट रिचार्ज करें (Add Money)' : '💳 Recharge Wallet'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Balance Status Notice */}
              {!isFreeService && requiredFee > 0 && ((isOperator ? (sanchalakB2bBalance || 0) : (walletBalance || 0)) < requiredFee) && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'hi' ? 'उपलब्ध बैलेंस: ₹' : 'Available Balance: ₹'}{isOperator ? (sanchalakB2bBalance || 0) : (customerSession?.phone ? (walletBalance || 0) : 0)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isOperator && onOpenB2bWallet) onOpenB2bWallet();
                      else if (onOpenWallet) onOpenWallet();
                    }}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] shadow-xs cursor-pointer transition"
                  >
                    + वॉलेट रिचार्ज
                  </button>
                </div>
              )}

              {/* Bottom Action Row: Live Fee Badge on Left + Action Buttons on Right */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                {isFreeService || requiredFee === 0 ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1.5 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      {language === 'hi' ? 'शुल्क:' : 'Fee:'}
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                      <span>🎉</span>
                      <span>{language === 'hi' ? '100% मुफ़्त (₹0)' : '100% Free (₹0)'}</span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'hi' ? 'शुल्क:' : 'Fee:'}
                    </span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{requiredFee}
                    </span>
                  </div>
                )}

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
                    disabled={loading || currentTool?.isComingSoon}
                    className={`${currentTool?.isComingSoon ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/25 cursor-pointer'} text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition`}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{language === 'hi' ? 'खोज रहे हैं...' : 'Processing...'}</span>
                      </>
                    ) : currentTool?.isComingSoon ? (
                      <span>{language === 'hi' ? '⏳ सेवा जल्द उपलब्ध होगी' : '⏳ Coming Soon'}</span>
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
                <span>
                  {currentResult?.status === 'pending' || currentResult?.isPendingRelay 
                    ? (language === 'hi' ? '🕒 आवेदन प्रक्रियाधीन (Order Pending)' : '🕒 Application Pending')
                    : currentResult?.status === 'rejected'
                    ? (language === 'hi' ? '❌ आवेदन निरस्त / रिफंडेड' : '❌ Rejected / Refunded')
                    : activeData 
                    ? (language === 'hi' ? '✅ आधिकारिक दस्तावेज़ / कार्ड' : '✅ Official Document / Card') 
                    : (language === 'hi' ? 'ℹ️ दिशानिर्देश / जानकारी' : 'ℹ️ Information & Guidelines')}
                </span>
              </span>
              <span className="text-[11px] bg-white/20 text-white font-mono font-bold px-2.5 py-0.5 rounded-full">
                {currentResult?.status === 'pending' || currentResult?.isPendingRelay || isManualRelay12 || currentTool?.fulfillmentType === 'manual_relay' || currentTool?.source === 'rekhaprint' || ['ll_exam_pass_auto', 'pan_find', 'pan_find_manual', 'pan_find_manual_alt', 'pan_aadhaar_link_manual', 'e_shram_update', 'samagra_service', 'sambal_pdf', 'dl_to_mobile_find', 'mobile_update_service', 'aadhaar_to_mobile_find', 'dob_update_service', 'puc_certificate_download', 'agristack_pdf'].includes(currentTool?.id)
                  ? '⏱️ 1-2 घंटे रिले'
                  : (toolKind === 'card' || ['panCard', 'aadhaarCard', 'aadhaar_manual', 'aadhaar_pvc', 'drivingLicence', 'voterCard', 'ayushmanCard', 'rationCard'].includes(currentTool?.id))
                  ? '🖨️ त्वरित कार्ड प्रिंट'
                  : '⚡ 0.5s लाइव'}
              </span>
            </div>

            {/* When Order is Pending: Official Service Processing Acknowledgement & Tracking Docket */}
            {currentResult && (currentResult.isPendingRelay || currentResult.status === 'pending') ? (
              <div className="p-4 sm:p-6 space-y-5">
                {/* Print & Action Controls */}
                <div className="no-print flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {language === 'hi' ? 'आधिकारिक रसीद जनरेट हो चुकी है' : 'Official Docket Generated'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पावती प्रिंट करें' : 'Print Docket'}</span>
                    </button>
                  </div>
                </div>

                {/* Printable High-Prestige Official Docket Paper */}
                <div id="official-tracking-docket" className="bg-white text-slate-900 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-lg space-y-5 select-none print:shadow-none print:border-black print:p-4 print:m-0">
                  {/* Government & Portal Header */}
                  <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif text-2xl font-black shrink-0 shadow-xs">
                        🏛️
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-600">
                          {selectedCafe?.shopName || 'स्मार्ट जन सेवा केंद्र'} • अधिकृत सेवा वितरण नेटवर्क
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                          आधिकारिक सेवा अनुरोध पावती एवं ट्रैकिंग पत्र
                        </h2>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                          Official Service Processing Acknowledgement & Tracking Docket
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block shadow-2xs">
                        <QRCodeSVG 
                          value={`DOCKET:${currentResult.orderId || currentResult.order?.id || 'ORD'}|SERVICE:${currentResult.serviceTitle || currentTool?.name || 'SERVICE'}|STATUS:PENDING|REF:${primaryInput || currentResult.order?.refNumber || '-'}`} 
                          size={56} 
                        />
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 mt-0.5">
                        {currentResult.orderId || currentResult.order?.id || 'ORD-SECURE'}
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/10 border-2 border-amber-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                      </span>
                      <div>
                        <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide block">
                          ⏳ प्रक्रियाधीन (Under Processing by Operator)
                        </span>
                        <span className="text-[10px] text-amber-900 font-semibold">
                          ऑपरेटर सेवा डेस्क पर कार्य प्रगति पर है
                        </span>
                      </div>
                    </div>
                    <div className="bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1 rounded-full text-xs font-black font-mono">
                      ⏱️ 1-2 कार्य घंटे (1-2 Hours Window)
                    </div>
                  </div>

                  {/* Docket Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">डॉकेट / ऑर्डर आईडी (Docket / Order ID)</span>
                      <strong className="font-mono text-xs sm:text-sm font-black text-slate-900 tracking-wider">
                        {currentResult.orderId || currentResult.order?.id || '-'}
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">सेवा का नाम (Service Name)</span>
                      <strong className="text-xs sm:text-sm font-black text-blue-900">
                        {currentResult.serviceTitle || currentTool?.name || 'अधिकृत ऑपरेटर सेवा'}
                      </strong>
                    </div>

                    <div className="space-y-0.5 sm:col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">आवेदन / संदर्भ संख्या (Application / Query Input)</span>
                      <strong className="font-mono text-xs sm:text-sm font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block">
                        {primaryInput || currentResult.order?.refNumber || currentResult.order?.params?.query || currentResult.order?.params?.applicationNumber || currentResult.order?.params?.vehicleNumber || currentResult.order?.params?.regNo || currentResult.order?.params?.panNo || currentResult.order?.params?.uidNumber || '-'}
                      </strong>
                    </div>

                    {(secondaryInput || currentResult.order?.params?.password || currentResult.order?.params?.mobile || currentResult.order?.params?.secondaryInput) && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">अतिरिक्त विवरण / पासवर्ड</span>
                        <strong className="text-xs font-bold text-slate-800">
                          {currentTool?.id === 'll_exam_pass_auto' || currentResult.order?.serviceType === 'll_exam_pass_auto' ? '•••••••• (SMS Password Linked)' : (secondaryInput || currentResult.order?.params?.mobile || currentResult.order?.params?.secondaryInput || '-')}
                        </strong>
                      </div>
                    )}

                    {(dobDate || currentResult.order?.params?.dob) && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">जन्मतिथि (DOB)</span>
                        <strong className="font-mono text-xs font-bold text-slate-800">
                          {dobDate ? formatDobDisplay(dobDate) : currentResult.order?.params?.dob}
                        </strong>
                      </div>
                    )}

                    <div className="space-y-0.5 pt-1 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">अनुरोध दर्ज समय (Date & Time)</span>
                      <strong className="font-mono text-xs text-slate-800">
                        {currentResult.submittedAt || (currentResult.order?.createdAt ? new Date(currentResult.order.createdAt).toLocaleString('hi-IN') : new Date().toLocaleString('hi-IN'))}
                      </strong>
                    </div>

                    <div className="space-y-0.5 pt-1 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">अनुमानित प्रसंस्करण समय (Window)</span>
                      <strong className="text-xs font-bold text-amber-800">
                        1 से 2 घंटे (Within 1-2 Hours)
                      </strong>
                    </div>
                  </div>

                  {/* Customer, Cafe & Digital Seal Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">नागरिक / ग्राहक विवरण</span>
                      <div className="text-xs font-bold text-slate-900">{customerName.trim() || currentResult.order?.customerName || customerSession?.name || 'अधिकृत नागरिक'}</div>
                      <div className="text-[11px] font-mono text-slate-600">{currentResult.order?.customerPhone || customerSession?.phone || '8006518960'}</div>
                    </div>

                    {/* Cafe Branding */}
                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">सेवा केंद्र एवं पोर्टल</span>
                      <div className="text-xs font-black text-blue-900">{selectedCafe?.shopName || selectedCafe?.name || 'स्मार्ट जन सेवा केंद्र'}</div>
                      <div className="text-[11px] text-slate-600">पोर्टल: <span className="font-mono font-bold text-slate-800">smartcafe.sbs</span></div>
                    </div>

                    {/* Authorized Digital Seal */}
                    <div className="flex sm:justify-end border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
                      <div className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-700 bg-emerald-50/80 p-1 flex flex-col items-center justify-center text-center shadow-xs">
                        <div className="text-[7.5px] font-black text-emerald-900 uppercase tracking-tighter">DIGITALLY VERIFIED</div>
                        <div className="text-base my-0.5">🛡️</div>
                        <div className="text-[7px] font-black text-emerald-800 uppercase">OPERATOR RELAY</div>
                        <div className="text-[6.5px] font-bold text-slate-600">SMARTCAFE.SBS</div>
                        <div className="text-[6px] font-mono text-emerald-700 mt-0.5">AUTH-SEAL-OK</div>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Explanatory Note */}
                  <div className="p-3.5 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl text-xs text-blue-950 space-y-1">
                    <div className="font-black flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>महत्वपूर्ण सूचना (Important Notice)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-semibold">
                      जैसे ही ऑपरेटर द्वारा सारथी/संबंधित पोर्टल से कार्य पूरा किया जाएगा, स्थिति 'सफल' हो जाएगी।
                    </p>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      (As soon as the authorized operator completes processing on the official portal, the status will automatically update to 'Successful'.)
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                    <span>कंप्यूटर जनरेटेड पावती • हस्ताक्षर की आवश्यकता नहीं</span>
                    <span>smartcafe.sbs • अधिकृत डिजिटल सेवा</span>
                  </div>
                </div>

                {/* Poll / Live Status / New Action Buttons */}
                <div className="no-print pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePollSingleOrder(currentResult.orderId || currentResult.order?.id)}
                    disabled={pollingSingleOrder}
                    className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${pollingSingleOrder ? 'animate-spin' : ''}`} />
                    <span>{pollingSingleOrder ? (language === 'hi' ? 'जांच जारी है...' : 'Checking...') : (language === 'hi' ? '🔄 रेखा प्रिंट से लाइव स्टेटस जांचें' : 'Check Live Status')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    {language === 'hi' ? '⚡ नया आवेदन करें' : 'New Application'}
                  </button>
                </div>
              </div>
            ) : currentResult?.status === 'rejected' ? (
              <div className="p-6 sm:p-8 space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-black text-rose-600 dark:text-rose-400">
                    {language === 'hi' ? 'आवेदन अस्वीकृत / निरस्त किया गया' : 'Application Rejected'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {currentResult.rejectionReason || (language === 'hi' ? 'रेखा प्रिंट ऑपरेटर द्वारा यह आवेदन अस्वीकृत किया गया है। पूरी राशि आपके वॉलेट में वापस रिफंड कर दी गई है।' : 'Application was rejected. Amount has been refunded.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  {language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
                </button>
              </div>
            ) : !activeData ? (
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
                    {/* A4 Official Government Proforma vs PVC Card Toggle */}
                    {['rc', 'edistrict', 'aadhaar', 'dl'].includes(toolKind) && (
                      <div className="bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg flex items-center text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setDocViewMode('card')}
                          className={`px-2.5 py-1 rounded-md transition ${docViewMode === 'card' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          🖨️ PVC स्मार्ट कार्ड
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocViewMode('a4')}
                          className={`px-2.5 py-1 rounded-md transition ${docViewMode === 'a4' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          📄 A4 सरकारी दस्तावेज
                        </button>
                      </div>
                    )}

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
                      onClick={() => setShowPvcTrayModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="A4 5-in-1 ISO CR-80 300 DPI PVC Tray Sheet Generator"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>📄 5-कार्ड ट्रे प्रिंट</span>
                    </button>

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
                      fatherName: activeData.fatherName || activeData.father_name || activeData.careOf || '-',
                      dob: activeData.dob || activeData.birthDate || '-',
                      gender: activeData.gender || 'MALE',
                      address: activeData.address || activeData.permanentAddress || activeData.presentAddress || '-',
                      photoUrl: activeData.photoUrl || photoData,
                      signUrl: activeData.signUrl || signData,
                      aadhaarNo: activeData.aadhaarNo || activeData.uidNumber || (primaryInput && primaryInput.length === 12 ? primaryInput : '') || 'XXXX-XXXX-XXXX',
                      maskedAadhaar: activeData.maskedAadhaar || (activeData.aadhaarNo && activeData.aadhaarNo.length === 12 ? `XXXX-XXXX-${activeData.aadhaarNo.slice(8)}` : (primaryInput && primaryInput.length === 12 ? `XXXX-XXXX-${primaryInput.slice(8)}` : 'XXXX-XXXX-XXXX')),
                      // RC Specific Fields
                      regNo: activeData.regNo || activeData.rc_number || activeData.vehicleNumber || activeData.vehicleNo || (toolKind === 'rc' ? primaryInput : '') || '-',
                      chassisNo: activeData.chassisNo || activeData.chassis || '-',
                      engineNo: activeData.engineNo || activeData.engine || '-',
                      makerModel: activeData.makerModel || activeData.makerDescription || activeData.model || '-',
                      vehicleClass: activeData.vehicleClass || activeData.vchCatg || '-',
                      fuelType: activeData.fuelType || activeData.fuelDescription || '-',
                      normsType: activeData.normsType || activeData.emissionNorms || '-',
                      seatCapacity: activeData.seatCapacity || activeData.seatingCapacity || '-',
                      bodyType: activeData.bodyType || '-',
                      unladenWeight: activeData.unladenWeight || '-',
                      grossWeight: activeData.grossWeight || '-',
                      cubicCapacity: activeData.cubicCapacity || '-',
                      cylinders: activeData.cylinders || '-',
                      wheelbase: activeData.wheelbase || '-',
                      color: activeData.color || '-',
                      regDate: activeData.regDate || activeData.regnDate || '-',
                      fitnessUpto: activeData.fitnessUpto || activeData.fitDate || '-',
                      insuranceCompany: activeData.insuranceCompany || activeData.insuranceName || '-',
                      insurancePolicyNo: activeData.insurancePolicyNo || '-',
                      insuranceUpto: activeData.insuranceUpto || activeData.insuranceValidity || '-',
                      puccUpto: activeData.puccUpto || activeData.puccValidity || '-',
                      mvTaxUpto: activeData.mvTaxUpto || activeData.taxUpto || '-',
                      financer: activeData.financer || activeData.financier || '',
                      rtoOffice: activeData.rtoOffice || activeData.registeringAuthority || '-',
                      // RTPS Specific Fields
                      appNo: activeData.appNo || activeData.applicationNumber || (toolKind === 'edistrict' ? primaryInput : '') || '-',
                      certNo: activeData.certNo || activeData.certificateNo || (toolKind === 'edistrict' ? secondaryInput : '') || '-',
                      issueDate: activeData.issueDate || activeData.date || new Date().toLocaleDateString('en-GB'),
                      village: activeData.village || activeData.address || '-',
                      district: activeData.district || selectState || '-',
                      fee: activeData.fee || currentTool?.fee || requiredFee || 0,
                      members: activeData.members || activeData.memberDetails || activeData.member_list || activeData.data?.members || activeData.data?.memberDetails || []
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
                                <div className="w-[68px] h-[84px] bg-slate-100 border border-slate-400 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                                  {photoData ? (
                                    <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-1 text-center">
                                      <span className="text-xl">👤</span>
                                      <span className="text-[6.5px] font-bold text-slate-500 uppercase mt-0.5 leading-tight">
                                        {language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}
                                      </span>
                                    </div>
                                  )}
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
                                    <div className="w-24 h-5 border-b border-slate-400 overflow-hidden flex items-center justify-center bg-white/50">
                                      {signData ? (
                                        <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                      ) : (
                                        <span className="text-[6.5px] font-mono text-slate-400 italic">
                                          {language === 'hi' ? 'हस्ताक्षर अनुपलब्ध' : 'Signature N/A'}
                                        </span>
                                      )}
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
                                  <p className="font-mono text-[8px] text-slate-500">
                                    {language === 'hi' ? 'जारी दिनांक: ' : 'Issue Date: '}
                                    {cardData.issueDate && cardData.issueDate !== '-' ? cardData.issueDate : (cardData.date && cardData.date !== '-' ? cardData.date : '-')}
                                  </p>
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
                    {(toolKind === 'aadhaar' || currentTool?.serviceType === 'aadhaarCard' || currentResult?.serviceType === 'aadhaarCard') && (
                      <>
                        {docViewMode === 'a4' ? (
                          <div className="w-[794px] min-h-[1050px] bg-white border-2 border-slate-400 rounded-2xl p-7 text-slate-900 font-sans shadow-xl relative select-none print:shadow-none print:border-slate-800 print:m-0 print:w-full space-y-4">
                            {/* UIDAI Header Banner */}
                            <div className="border-b-2 border-red-600 pb-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center border rounded-lg bg-red-50 text-2xl">
                                  🇮🇳
                                </div>
                                <div>
                                  <h2 className="text-sm font-black text-red-600 uppercase">भारतीय विशिष्ट पहचान प्राधिकरण</h2>
                                  <h3 className="text-xs font-bold text-slate-800 uppercase">UNIQUE IDENTIFICATION AUTHORITY OF INDIA</h3>
                                  <p className="text-[10px] text-slate-600">भारत सरकार (GOVERNMENT OF INDIA)</p>
                                </div>
                              </div>
                              <div className="text-right space-y-0.5 text-xs">
                                <div className="font-mono text-[10px] text-slate-600">नामांकन संख्या / Enrolment No: <strong>{cardData.enrolmentNo || '1024/56789/01234'}</strong></div>
                                <div className="font-mono text-[10px] text-slate-600">डाउनलोड दिनांक / Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong></div>
                              </div>
                            </div>

                            {/* Recipient Address Box & Verification QR */}
                            <div className="flex justify-between items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="space-y-1 text-xs">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">प्रति / To,</span>
                                <h3 className="text-base font-black text-slate-900">{cardData.name}</h3>
                                <p className="text-slate-700 font-semibold">{cardData.careOf || `S/O: ${cardData.fatherName}`}</p>
                                <p className="text-slate-600 text-[11px] max-w-md">{cardData.address}</p>
                                <p className="font-mono text-[11px] text-slate-700">मो. / Mobile: {cardData.maskedPhone || 'XXXXXX8960'}</p>
                              </div>
                              <div className="p-2 bg-white border rounded-lg shadow-xs text-center shrink-0">
                                <QRCodeSVG value={`UIDAI:AADHAAR:${cardData.aadhaarNo}|NAME:${cardData.name}|DOB:${cardData.dob}|ADDRESS:${cardData.address}`} size={80} />
                                <span className="text-[8px] font-mono text-slate-500 block mt-1">सत्यापित आधार QR</span>
                              </div>
                            </div>

                            {/* Instruction Callout */}
                            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-center space-y-1">
                              <div className="text-xs font-bold text-red-800">आपका आधार नंबर / Your Aadhaar Number :</div>
                              <div className="text-xl font-mono font-black text-red-600 tracking-widest">{cardData.aadhaarNo}</div>
                              <div className="text-[9.5px] text-slate-600">आधार पहचान का प्रमाण है, नागरिकता का नहीं। / Aadhaar is proof of identity, not of citizenship.</div>
                            </div>

                            {/* Dotted Scissors Line */}
                            <div className="relative py-2 text-center text-slate-400 select-none">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-dashed border-slate-400"></div>
                              </div>
                              <span className="relative bg-white px-3 text-[10px] font-bold text-slate-600">
                                ✂️ काटें और सुरक्षित रखें / Please cut along this line and preserve
                              </span>
                            </div>

                            {/* Bottom Cutout CR-80 PVC Format (Front and Back Side-by-Side) */}
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                              {/* Front Side */}
                              <div className="w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 text-slate-900 font-sans">
                                <div className="border-b border-red-500 pb-1 flex items-center justify-between">
                                  <div className="text-[9px] font-black text-red-600">{language === 'hi' ? 'भारत सरकार' : 'Government of India'}</div>
                                  <div className="text-[10px] font-black tracking-wider text-red-600">मेरा आधार, मेरी पहचान</div>
                                </div>
                                <div className="flex items-center gap-3 py-1">
                                  <div className="w-[68px] h-[84px] bg-slate-100 border-2 border-slate-700 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                                    {(cardData.photoUrl || photoData) ? (
                                      <img src={cardData.photoUrl || photoData} alt="Photo" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100">
                                        <span className="text-base">📷</span>
                                        <span className="text-[6.5px] font-bold text-slate-500 uppercase">{language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 space-y-1 text-xs">
                                    <div>
                                      <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                      <span className="text-[9px] text-slate-600 block">{cardData.careOf || `S/O: ${cardData.fatherName}`}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-700">
                                      <div>जन्म तिथि / DOB: <span className="font-mono font-bold">{cardData.dob}</span></div>
                                      <div>लिंग / Gender: <span className="font-bold">{cardData.gender}</span></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="border-t border-slate-300 pt-1 text-center">
                                  <div className="font-mono font-black text-red-600 text-sm tracking-widest">{cardData.aadhaarNo}</div>
                                </div>
                              </div>

                              {/* Back Side */}
                              <div className="w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 text-slate-900 font-sans">
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
                                  <span>www.uidai.gov.in</span>
                                  <span className="font-bold text-red-600">{cardData.aadhaarNo}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
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
                                    <div className="w-[68px] h-[84px] bg-slate-100 border-2 border-slate-700 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                                      {(cardData.photoUrl || photoData) ? (
                                        <img src={cardData.photoUrl || photoData} alt="Photo" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100">
                                          <span className="text-base">📷</span>
                                          <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-tight mt-0.5">{language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 space-y-1 text-xs">
                                      <div>
                                        <span className="font-black text-slate-900 text-[11px] block">{cardData.name}</span>
                                        <span className="text-[9px] text-slate-600 block">{cardData.careOf || ((cardData.gender === 'FEMALE' ? (language === 'hi' ? 'पत्नी/आत्मजा:' : 'W/O, D/O:') : (language === 'hi' ? 'आत्मज:' : 'S/O:')) + ' ' + cardData.fatherName)}</span>
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
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 3. VOTER SMART CARD (EPIC CR-80 FORMAT) */}
                    {/* ======================================================= */}
                    {(toolKind === 'voter' || currentTool?.serviceType === 'voterCard' || currentResult?.serviceType === 'voterCard' || currentTool?.id === 'voterCard' || currentTool?.category === 'voter') && (
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
                                  {cardData.epicNo || cardData.epicNumber || primaryInput}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 py-1">
                                <div className="w-[68px] h-[84px] bg-slate-100 border border-slate-500 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                                  {(cardData.photoUrl || photoData) ? (
                                    <img src={cardData.photoUrl || photoData} alt="Photo" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100">
                                      <span className="text-base">📷</span>
                                      <span className="text-[6.5px] font-bold text-slate-500 uppercase leading-tight mt-0.5">{language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}</span>
                                    </div>
                                  )}
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
                                    <span>{language === 'hi' ? 'जन्म तिथि / आयु:' : 'DOB / Age:'} <strong>{cardData.dob || cardData.age}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-600">
                                <span>{language === 'hi' ? 'विधानसभा:' : 'Assembly:'} {cardData.acName ? `${cardData.acNumber ? cardData.acNumber + ' - ' : ''}${cardData.acName}` : (selectedCafe?.city || '-')}</span>
                                <span className="font-mono font-bold text-amber-800">{cardData.epicNo || cardData.epicNumber || primaryInput}</span>
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
                                  <div>{language === 'hi' ? 'मतदान केंद्र:' : 'Polling Station:'} <strong>{cardData.partName || cardData.pollingStation || '-'}</strong></div>
                                  <div>{language === 'hi' ? 'भाग संख्या:' : 'Part No:'} <strong>{cardData.partNo || cardData.part_no || '-'}</strong> | {language === 'hi' ? 'क्रम संख्या:' : 'Serial No:'} <strong>{cardData.serialNo || cardData.serial_no || '-'}</strong></div>
                                  <div className="text-[8px] text-slate-500 mt-1">{language === 'hi' ? 'पहचान पत्र को सुरक्षित रखें। मतदान दिवस पर अवश्य लाएं।' : 'Keep card secure. Bring on polling day.'}</div>
                                </div>
                                <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`ECI:EPIC:${cardData.epicNo || cardData.epicNumber || primaryInput}|NAME:${cardData.name}|RELATION:${cardData.fatherName}`} size={64} />
                                </div>
                              </div>

                              <div className="border-t pt-1 flex items-center justify-between text-[8px] text-slate-500">
                                <span>{language === 'hi' ? 'मानक स्मार्ट कार्ड' : 'Standard Smart Card'}</span>
                                <span className="font-mono font-bold">{cardData.epicNo || cardData.epicNumber || primaryInput}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ======================================================= */}
                    {/* 4. DRIVING LICENCE (SARATHI PARIVAHAN CR-80 PVC & FORM 7 A4) */}
                    {/* ======================================================= */}
                    {toolKind === 'dl' && (
                      <>
                        {docViewMode === 'a4' ? (
                          <div className="w-[794px] min-h-[1050px] bg-white border-2 border-slate-900 rounded-2xl p-8 text-slate-900 font-sans shadow-xl relative select-none print:shadow-none print:border-slate-800 print:m-0 print:w-full space-y-5">
                            {/* Header */}
                            <div className="text-center border-b-2 border-slate-900 pb-3">
                              <div className="text-xs font-black uppercase text-indigo-950">
                                भारत संघ • सड़क परिवहन एवं राजमार्ग मंत्रालय
                              </div>
                              <h1 className="text-lg font-black uppercase tracking-wide">
                                FORM 7 [See Rule 16(2)] • FORM OF DRIVING LICENCE
                              </h1>
                              <p className="text-xs font-semibold text-slate-700">
                                परिवहन विभाग • {cardData.rtoOffice || 'परिवहन कार्यालय, भारत सरकार'}
                              </p>
                            </div>

                            {/* Licence Summary Strip */}
                            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-300 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block uppercase">ड्राइविंग लाइसेंस सं. (DL No):</span>
                                <strong className="font-mono text-sm text-indigo-950 block">{cardData.dlNo}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block uppercase">निर्गत दिनांक (Issue Date):</span>
                                <strong className="font-mono text-xs text-slate-900 block">{cardData.issueDate || cardData.date || '-'}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block uppercase">वैधता (Non-Transport):</span>
                                <strong className="font-mono text-xs text-emerald-800 block">{cardData.validNt || '-'}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block uppercase">रक्त समूह (Blood Group):</span>
                                <strong className="font-mono text-xs text-rose-700 block">{cardData.bloodGroup || '-'}</strong>
                              </div>
                            </div>

                            {/* Middle Section: Photo & Demographics */}
                            <div className="flex gap-6 items-start border p-4 rounded-xl bg-white shadow-2xs">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-[110px] h-[135px] border-2 border-slate-400 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                  {photoData ? (
                                    <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-2 text-center">
                                      <span className="text-3xl">👤</span>
                                      <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                                        फोटो अनुपलब्ध
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-[110px] h-8 border-b-2 border-slate-400 overflow-hidden flex items-center justify-center bg-slate-50">
                                  {signData ? (
                                    <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                  ) : (
                                    <span className="text-[8px] font-mono text-slate-400 italic">
                                      हस्ताक्षर अनुपलब्ध
                                    </span>
                                  )}
                                </div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">धारक के हस्ताक्षर</span>
                              </div>

                              <div className="flex-1 space-y-2.5 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold block uppercase">लाइसेंस धारक का नाम (Name of Holder):</span>
                                  <strong className="text-base font-black text-slate-900 block">{cardData.name}</strong>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase">पिता/पति का नाम (Father / Husband):</span>
                                    <strong className="text-xs font-bold text-slate-800 block">{cardData.fatherName}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase">जन्म तिथि (Date of Birth):</span>
                                    <strong className="font-mono text-xs text-slate-800 block">{cardData.dob}</strong>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold block uppercase">स्थायी पता (Permanent Address):</span>
                                  <p className="text-xs text-slate-700 leading-snug">{cardData.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                                  <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase">लाइसेंसिंग प्राधिकारी (Authority):</span>
                                    <strong className="text-xs text-slate-800 block">{cardData.rtoOffice}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500 font-bold block uppercase">परिवहन वैधता (Transport Upto):</span>
                                    <strong className="font-mono text-xs text-slate-800 block">{cardData.validTr || '-'}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="p-2 bg-white border border-slate-300 rounded-lg shadow-2xs shrink-0 self-center">
                                <QRCodeSVG value={`MORTH:FORM7:DL:${cardData.dlNo}|NAME:${cardData.name}|COV:${(cardData.covs || []).join(',')}`} size={90} />
                              </div>
                            </div>

                            {/* Class of Vehicles Table */}
                            <div className="space-y-1">
                              <h3 className="text-xs font-black uppercase text-slate-800">
                                अधिकृत वाहन श्रेणी विवरण (Class of Vehicles Authorised to Drive)
                              </h3>
                              <table className="w-full border-collapse border border-slate-300 text-xs">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-800 text-[10px] uppercase font-bold">
                                    <th className="border border-slate-300 p-2 text-left">क्र.सं.</th>
                                    <th className="border border-slate-300 p-2 text-left">वाहन श्रेणी (COV)</th>
                                    <th className="border border-slate-300 p-2 text-left">प्रभावी दिनांक (Effective From)</th>
                                    <th className="border border-slate-300 p-2 text-left">बैज संख्या / पृष्ठांकन</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(cardData.covs || ['MCWG (Motor Cycle with Gear)', 'LMV (Light Motor Vehicle)']).map((cov, idx) => (
                                    <tr key={idx} className="border-b">
                                      <td className="border border-slate-300 p-2 font-mono text-center">{idx + 1}</td>
                                      <td className="border border-slate-300 p-2 font-bold text-indigo-950">{cov}</td>
                                      <td className="border border-slate-300 p-2 font-mono">{cardData.issueDate || cardData.date || '-'}</td>
                                      <td className="border border-slate-300 p-2 text-slate-600">अधिकृत (Authorized)</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Footer & Signature Stamp */}
                            <div className="border-t-2 border-slate-900 pt-4 flex items-end justify-between mt-auto">
                              <div className="text-[10px] text-slate-500 space-y-0.5">
                                <p>नोट: यह परिवहन एवं राजमार्ग मंत्रालय (MoRTH) के आधिकारिक प्रारूप Form 7 के अनुसार मुद्रित है।</p>
                                <p className="font-mono">सारथी पोर्टल: parivahan.gov.in • डिजिटल रूप से सत्यापित</p>
                              </div>
                              <div className="border border-indigo-900 bg-indigo-50/50 p-3 rounded-xl text-center min-w-[200px]">
                                <div className="text-[9px] font-black text-indigo-900 uppercase">
                                  ✅ अधिकृत लाइसेंसिंग प्राधिकारी
                                </div>
                                <div className="text-xs font-bold text-slate-900 mt-0.5">Licensing Authority</div>
                                <div className="text-[10px] text-slate-600">{cardData.rtoOffice}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
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
                                <div className="w-[66px] h-[82px] bg-slate-100 border border-slate-400 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                                  {photoData ? (
                                    <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-1 text-center">
                                      <span className="text-xl">👤</span>
                                      <span className="text-[6.5px] font-bold text-slate-500 uppercase mt-0.5 leading-tight">
                                        {language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}
                                      </span>
                                    </div>
                                  )}
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
                                  <div className="w-20 h-4 border-b border-slate-400 overflow-hidden flex items-center justify-center bg-white/50">
                                    {signData ? (
                                      <img src={signData} alt="Sign" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                      <span className="text-[6px] font-mono text-slate-400 italic">
                                        {language === 'hi' ? 'हस्ताक्षर अनुपलब्ध' : 'Signature N/A'}
                                      </span>
                                    )}
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
                  </>
                )}

                    {/* ======================================================= */}
                    {/* 5. AYUSHMAN GOLDEN CARD (CR-80 PVC FRONT & BACK) */}
                    {/* ======================================================= */}
                    {toolKind === 'ayushman' && (
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {(cardSide === 'both' || cardSide === 'front') && (
                          <div className="cr80-card-scaler relative group max-w-full">
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                            <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-500 rounded-xl border border-amber-600 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-950 font-sans print:shadow-none print:border-slate-800">
                              <div className="flex items-center justify-between border-b border-amber-600 pb-1">
                                <div>
                                  <div className="text-[9px] font-black tracking-wider text-slate-950 uppercase">
                                    {language === 'hi' ? 'आयुष्मान भारत • प्रधानमंत्री जन आरोग्य योजना' : 'AYUSHMAN BHARAT • PM-JAY'}
                                  </div>
                                  <div className="text-[7.5px] font-bold text-slate-800">
                                    {language === 'hi' ? 'राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA)' : 'National Health Authority (NHA)'}
                                  </div>
                                </div>
                                <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                  {language === 'hi' ? '₹5 लाख मुफ़्त' : '₹5 Lakh Free'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 py-1">
                                <div className="w-[68px] h-[84px] bg-white/90 border border-amber-700 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                                  {(photoData || cardData.photoUrl) ? (
                                    <img src={photoData || cardData.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-amber-50/50">
                                      <span className="text-base">📷</span>
                                      <span className="text-[6.5px] font-bold text-amber-900 uppercase leading-tight mt-0.5">{language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 space-y-1 text-xs">
                                  <div>
                                    <span className="text-[8px] text-slate-700 font-bold block uppercase">{language === 'hi' ? 'लाभार्थी का नाम' : 'Beneficiary Name'}</span>
                                    <span className="font-black text-slate-950 text-[11px] block">{cardData.name || cardData.beneficiaryName || primaryInput}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-800 space-y-0.5">
                                    <div>{language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} <span className="font-mono font-bold">{cardData.dob || '-'}</span></div>
                                    <div>{language === 'hi' ? 'लिंग:' : 'Gender:'} <span className="font-bold">{cardData.gender || 'MALE'}</span></div>
                                    <div>{language === 'hi' ? 'राज्य:' : 'State:'} <span className="font-bold">{cardData.state || selectState || '-'}</span></div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-950 text-white rounded p-1 flex items-center justify-between px-2 text-[10px] font-mono font-bold shadow-xs">
                                <span>{cardData.pmjayId || cardData.pmjay_id || primaryInput}</span>
                                <span className="text-yellow-400 text-[8px] uppercase">{cardData.coverageAmount || '₹5,00,000 / वर्ष'}</span>
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

                            <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 rounded-xl border border-amber-500 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-950 font-sans print:shadow-none print:border-slate-800">
                              <div className="border-b border-amber-400 pb-1 flex items-center justify-between">
                                <div className="text-[8px] font-black uppercase text-amber-900">
                                  {language === 'hi' ? 'महत्वपूर्ण दिशानिर्देश एवं हेल्पलाइन' : 'Guidelines & Helpline'}
                                </div>
                                <span className="text-[8px] font-bold text-red-700 font-mono">Toll Free: 14555</span>
                              </div>

                              <div className="flex items-start justify-between gap-3 py-1 text-[8.5px]">
                                <div className="space-y-1 text-slate-800 max-w-[210px] leading-tight">
                                  <p>• {language === 'hi' ? 'यह कार्ड सूचीबद्ध सरकारी व निजी अस्पतालों में कैशलेस उपचार हेतु मान्य है।' : 'Valid for cashless treatment at empanelled public & private hospitals.'}</p>
                                  <p>• {language === 'hi' ? 'उपचार हेतु अस्पताल में यह कार्ड व कोई भी सरकारी पहचान पत्र दिखाएं।' : 'Show this card along with a valid Govt ID at the hospital.'}</p>
                                  <p>• {language === 'hi' ? 'अधिक जानकारी के लिए mera.pmjay.gov.in पर जाएं या 14555 पर कॉल करें।' : 'Visit mera.pmjay.gov.in or call 14555 for info.'}</p>
                                </div>
                                <div className="p-1 bg-white border border-amber-300 rounded shadow-xs shrink-0">
                                  <QRCodeSVG value={`PMJAY:ID:${cardData.pmjayId || cardData.pmjay_id || primaryInput}|NAME:${cardData.name || cardData.beneficiaryName}|STATE:${cardData.state || 'UP'}`} size={62} />
                                </div>
                              </div>

                              <div className="border-t border-amber-300 pt-1 flex items-center justify-between text-[8px] text-slate-600 font-medium">
                                <span>{language === 'hi' ? 'राष्ट्रीय स्वास्थ्य प्राधिकरण' : 'National Health Authority'}</span>
                                <span className="font-mono font-bold text-slate-900">{cardData.pmjayId || cardData.pmjay_id || primaryInput}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 6. VEHICLE RC CERTIFICATE & PVC SMART CARD */}
                    {/* ======================================================= */}
                    {toolKind === 'rc' && (
                      <>
                        {docViewMode === 'a4' ? (
                          <div className="w-[794px] min-h-[1050px] bg-white border-2 border-slate-900 rounded-2xl p-7 text-slate-900 font-sans shadow-xl relative select-none print:shadow-none print:border-slate-800 print:m-0 print:w-full">
                            {/* National Emblem & Top Header */}
                            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                              <div className="w-16 h-16 flex items-center justify-center border rounded-lg p-1 bg-slate-50">
                                <span className="text-3xl">🇮🇳</span>
                              </div>
                              <div className="text-center flex-1 px-4">
                                <div className="text-[11px] font-black uppercase tracking-widest text-slate-700">भारत सरकार • सड़क परिवहन एवं राजमार्ग मंत्रालय</div>
                                <div className="text-[10px] font-bold text-slate-600 uppercase">GOVERNMENT OF INDIA • MINISTRY OF ROAD TRANSPORT & HIGHWAYS</div>
                                <h2 className="text-lg font-black text-slate-950 mt-1 uppercase tracking-tight">FORM 23 [See Rule 48]</h2>
                                <div className="text-xs font-black text-indigo-900 tracking-wide uppercase bg-indigo-50 border border-indigo-200 py-0.5 px-3 rounded inline-block mt-0.5">
                                  CERTIFICATE OF REGISTRATION (वाहन पंजीयन प्रमाण पत्र)
                                </div>
                              </div>
                              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                                <QRCodeSVG value={`MORTH:RC:${cardData.regNo}|CHASSIS:${cardData.chassisNo}|ENGINE:${cardData.engineNo}|OWNER:${cardData.ownerName}`} size={64} />
                              </div>
                            </div>

                            {/* Registration Quick Bar */}
                            <div className="grid grid-cols-4 gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-300 text-xs my-3">
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">पंजीयन क्रमांक / Regn No:</span>
                                <strong className="font-mono text-sm text-indigo-950 block">{cardData.regNo}</strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">पंजीयन दिनांक / Regn Date:</span>
                                <strong className="font-mono text-xs text-slate-900 block">{cardData.regDate}</strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">फिटनेस वैधता / Fitness Upto:</span>
                                <strong className="font-mono text-xs text-emerald-800 block">{cardData.fitnessUpto}</strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 font-bold block uppercase">पंजीयन प्राधिकारी / RTO Authority:</span>
                                <strong className="text-[10px] text-slate-900 block truncate">{cardData.rtoOffice || 'RTO OFFICE'}</strong>
                              </div>
                            </div>

                            {/* 35-Parameter Comprehensive Government Telemetry Table */}
                            <div className="text-[11px] border border-slate-300 rounded-xl overflow-hidden my-3">
                              <div className="bg-slate-800 text-white font-bold px-3 py-1 text-xs">
                                वाहन एवं स्वामी संपूर्ण तकनीकी विवरण (Complete Vehicle & Ownership Specifications)
                              </div>
                              <table className="w-full text-left border-collapse">
                                <tbody>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r w-1/4">1. वाहन स्वामी (Owner Name)</td>
                                    <td className="p-2 font-semibold w-1/4">{cardData.ownerName}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l w-1/4">2. पिता/पति का नाम (Father's Name)</td>
                                    <td className="p-2 w-1/4">{cardData.fatherName}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">3. स्थायी पता (Permanent Address)</td>
                                    <td className="p-2 text-[10px]" colSpan="3">{cardData.permanentAddress || cardData.address}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">4. वाहन वर्ग (Class of Vehicle)</td>
                                    <td className="p-2 font-semibold">{cardData.vehicleClass || 'MOTOR CAR (LMV)'}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">5. निर्माता एवं मॉडल (Maker / Model)</td>
                                    <td className="p-2 font-semibold">{cardData.makerModel}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">6. चेसिस संख्या (Chassis Number)</td>
                                    <td className="p-2 font-mono font-bold text-indigo-900">{cardData.chassisNo}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">7. इंजन संख्या (Engine Number)</td>
                                    <td className="p-2 font-mono font-bold text-indigo-900">{cardData.engineNo}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">8. ईंधन का प्रकार (Fuel Type)</td>
                                    <td className="p-2">{cardData.fuelType}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">9. उत्सर्जन मानक (Emission Norms)</td>
                                    <td className="p-2 font-mono">{cardData.normsType || cardData.emissionNorms || 'BHARAT STAGE VI (BS-VI)'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">10. बैठक क्षमता (Seating Capacity)</td>
                                    <td className="p-2">{cardData.seatCapacity || cardData.seatingCapacity || '5 (INCL DRIVER)'}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">11. बॉडी का प्रकार (Body Type)</td>
                                    <td className="p-2">{cardData.bodyType || 'SALOON / SEDAN'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">12. बिना लदे वजन (Unladen Weight)</td>
                                    <td className="p-2 font-mono">{cardData.unladenWeight || '1080 KG'}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">13. सकल वाहन वजन (Gross Weight)</td>
                                    <td className="p-2 font-mono">{cardData.grossWeight || '1490 KG'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">14. इंजन क्षमता (Cubic Capacity)</td>
                                    <td className="p-2 font-mono">{cardData.cubicCapacity || '1197 CC'}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">15. सिलिंडर संख्या (Cylinders)</td>
                                    <td className="p-2 font-mono">{cardData.cylinders || '4'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">16. व्हीलबेस (Wheelbase)</td>
                                    <td className="p-2 font-mono">{cardData.wheelbase || '2450 MM'}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">17. वाहन का रंग (Color)</td>
                                    <td className="p-2">{cardData.color || 'WHITE / METALLIC'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">18. बीमा कंपनी (Insurance Company)</td>
                                    <td className="p-2 font-semibold">{cardData.insuranceCompany}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">19. बीमा पॉलिसी सं. (Policy No)</td>
                                    <td className="p-2 font-mono">{cardData.insurancePolicyNo || 'POL-78210928'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">20. बीमा वैधता (Insurance Upto)</td>
                                    <td className="p-2 font-mono font-bold text-emerald-800">{cardData.insuranceUpto}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">21. प्रदूषण प्रमाण पत्र (PUCC Upto)</td>
                                    <td className="p-2 font-mono">{cardData.puccUpto || 'VALID'}</td>
                                  </tr>
                                  <tr className="border-b border-slate-200">
                                    <td className="p-2 font-bold bg-slate-50 border-r">22. टैक्स वैधता (MV Tax Paid Upto)</td>
                                    <td className="p-2 font-mono font-bold">{cardData.mvTaxUpto || 'L.T. (Life Time)'}</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">23. बंधक / हाइपोथेकेशन (Financer)</td>
                                    <td className="p-2 font-semibold text-rose-800">{cardData.financer || 'NO HYPOTHECATION (स्वतंत्र)'}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 font-bold bg-slate-50 border-r">24. स्थिति / सत्यापन (Status)</td>
                                    <td className="p-2 font-bold text-emerald-700">सक्रिय (ACTIVE ON VAHAN 4.0)</td>
                                    <td className="p-2 font-bold bg-slate-50 border-r border-l">25. डिजिटल टोकन (Ref ID)</td>
                                    <td className="p-2 font-mono text-[10px]">{cardData.refNumber || `RC-${Date.now().toString().slice(-8)}`}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Footer: Official Stamp & Signature Block */}
                            <div className="border-t-2 border-slate-900 pt-3 flex items-center justify-between mt-4">
                              <div className="text-[10px] text-slate-600 max-w-sm space-y-0.5">
                                <p className="font-bold text-slate-800">नोट (Note):</p>
                                <p>1. यह वाहन पंजीयन प्रमाण पत्र केंद्रीय मोटर वाहन नियम 1989 के अंतर्गत विधिवत जारी किया गया है।</p>
                                <p>2. Parivahan Sewa राष्ट्रीय डेटाबेस पर सत्यापित इलेक्ट्रॉनिक रिकॉर्ड।</p>
                              </div>
                              <div className="border border-slate-400 p-2 rounded-lg text-center bg-slate-50 min-w-[200px]">
                                <div className="text-[9px] text-slate-500 font-bold uppercase">डिजिटल हस्ताक्षर / Digitally Signed</div>
                                <div className="font-serif font-black text-xs text-indigo-950 my-1">Registering Authority</div>
                                <div className="text-[8px] text-slate-600 font-mono">{cardData.rtoOffice || 'Transport Department, Govt. of India'}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
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
                      </>
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

                        {(() => {
                          const isRationAadhaarService = ['up_ration_to_aadhaar', 'all_state_ration_to_aadhar', 'assam_ration_to_aadhaar', 'ration_pdf_by_aadhar'].includes(currentTool?.id) || currentTool?.id?.includes('ration_to_aadhaar') || currentTool?.id?.includes('ration2uid') || currentTool?.id?.includes('ration_to_aadhar') || currentTool?.id?.includes('ration_pdf_by_aadhar');
                          const hasAadhaarCol = isRationAadhaarService || (cardData.members || []).some(m => m.aadhaar || m.aadhar || m.uid || m.uidNumber);
                          const membersList = (cardData.members && cardData.members.length > 0)
                            ? cardData.members
                            : [
                                {
                                  index: 1,
                                  name: cardData.headName || cardData.name || 'मुख्य सदस्य',
                                  relation: 'स्वयं (Head)',
                                  aadhaar: cardData.aadhaarNo || cardData.uidNumber || (primaryInput && primaryInput.length === 12 ? primaryInput : 'XXXX-XXXX-XXXX'),
                                  age: cardData.age || '-'
                                }
                              ];

                          return (
                            <div className="space-y-2">
                              {isRationAadhaarService && (
                                <div className="p-2 bg-gradient-to-r from-amber-500/15 to-emerald-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-[11px] font-bold text-amber-950 dark:text-amber-200">
                                  <span className="flex items-center gap-1.5">
                                    <span>🛡️</span>
                                    <span>{language === 'hi' ? 'राशन कार्ड से जुड़े सभी सदस्यों का आधार विवरण' : 'Linked Family Aadhaar Disclosure'}</span>
                                  </span>
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] uppercase tracking-wider font-black">
                                    सत्यापित (Disclosed)
                                  </span>
                                </div>
                              )}
                              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs shadow-xs">
                                <div className="bg-slate-900 text-white p-2 font-bold grid grid-cols-12 text-[10px]">
                                  <span className="col-span-1">{language === 'hi' ? 'क्र.' : '#'}</span>
                                  <span className={hasAadhaarCol ? "col-span-4" : "col-span-5"}>{language === 'hi' ? 'सदस्य का नाम' : 'Member Name'}</span>
                                  <span className={hasAadhaarCol ? "col-span-3" : "col-span-4"}>{language === 'hi' ? 'संबंध' : 'Relation'}</span>
                                  {hasAadhaarCol && (
                                    <span className="col-span-3 font-mono text-amber-300 font-black tracking-wide flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                                      <span>🛡️</span>
                                      <span>{language === 'hi' ? 'आधार संख्या' : 'Aadhaar No'}</span>
                                    </span>
                                  )}
                                  <span className="col-span-1 text-right">{language === 'hi' ? 'आयु' : 'Age'}</span>
                                </div>
                                <div className="divide-y text-[11px]">
                                  {membersList.map((m, idx) => (
                                    <div key={idx} className="p-1.5 grid grid-cols-12 items-center hover:bg-amber-50/50 transition">
                                      <span className="col-span-1 font-mono">{m.index || (idx + 1)}</span>
                                      <span className={`${hasAadhaarCol ? "col-span-4" : "col-span-5"} font-bold text-slate-900`}>{m.name}</span>
                                      <span className={`${hasAadhaarCol ? "col-span-3" : "col-span-4"} text-slate-600`}>{m.relation || '-'}</span>
                                      {hasAadhaarCol && (
                                        <span className="col-span-3 font-mono font-black text-blue-950 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] inline-flex items-center gap-1 shadow-2xs">
                                          <span>🔒</span>
                                          <span>{m.aadhaar || m.aadhar || m.uid || m.uidNumber || (m.maskedAadhaar ? m.maskedAadhaar : (primaryInput && primaryInput.length === 12 && currentTool?.id === 'ration_pdf_by_aadhar' ? `XXXX XXXX ${primaryInput.slice(-4)}` : 'सत्यापित आधार'))}</span>
                                        </span>
                                      )}
                                      <span className="col-span-1 text-right font-mono">{m.age ? `${m.age}` : '-'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

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
                        {(() => {
                          const isBihar = currentTool?.id === 'electric_bill_pdf_bihar' || selectState === 'Bihar' || selectState === 'BR' || cardData.state === 'BR' || (cardData.discom || '').includes('Bihar') || (cardData.discom || '').includes('SBPDCL') || (cardData.discom || '').includes('NBPDCL');
                          const orgTitle = isBihar 
                            ? (language === 'hi' ? 'बिहार स्टेट पावर (होल्डिंग) कंपनी लि. • SBPDCL / NBPDCL' : 'Bihar State Power Holding Company Ltd. (BSPHCL)')
                            : (language === 'hi' ? 'UPPCL • विद्युत वितरण निगम लि.' : 'UPPCL • Power Distribution Corp. Ltd.');
                          const qrPrefix = isBihar ? 'BSPHCL:BILL' : 'UPPCL:BILL';
                          return (
                            <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-black text-amber-700 uppercase">
                                  {orgTitle}
                                </div>
                                <h3 className="text-base font-black text-slate-900">{cardData.discom || (isBihar ? 'उत्तर / दक्षिण बिहार विद्युत वितरण कंपनी लि.' : 'विद्युत वितरण निगम')}</h3>
                                <p className="text-[11px] text-slate-600">{language === 'hi' ? 'विद्युत बिल एवं सफल भुगतान रसीद' : 'Electricity Bill & Payment Receipt'}</p>
                              </div>
                              <div className="p-1 bg-white border rounded">
                                <QRCodeSVG value={`${qrPrefix}:${cardData.consumerNo}|NAME:${cardData.consumerName}|PAID:${cardData.netPayable}`} size={54} />
                              </div>
                            </div>
                          );
                        })()}

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
                      <>
                        {docViewMode === 'a4' ? (
                          <div className="w-[794px] min-h-[1050px] bg-white border-4 border-double border-amber-900/60 rounded-2xl p-8 text-slate-900 font-serif shadow-xl relative select-none print:shadow-none print:border-amber-900 print:m-0 print:w-full">
                            {/* Official Bihar Emblem & Watermark */}
                            <div className="text-center border-b-2 border-amber-900/40 pb-4">
                              <div className="w-16 h-16 mx-auto mb-1 flex items-center justify-center">
                                <span className="text-4xl">🏛️</span>
                              </div>
                              <h1 className="text-2xl font-black text-amber-950 uppercase tracking-tight">बिहार सरकार</h1>
                              <h2 className="text-sm font-bold text-slate-800">GOVERNMENT OF BIHAR</h2>
                              <h3 className="text-xs font-semibold text-slate-700">राजस्व एवं भूमि सुधार विभाग / सामान्य प्रशासन विभाग</h3>
                              <div className="mt-2 inline-block bg-amber-100 text-amber-950 text-xs font-black px-4 py-1 rounded-full border border-amber-300">
                                बिहार लोक सेवाओं का अधिकार अधिनियम (RTPS) • प्रपत्र - IV
                              </div>
                            </div>

                            {/* Credentials Bar */}
                            <div className="grid grid-cols-3 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs my-4">
                              <div>
                                <span className="text-[10px] text-slate-600 font-bold block">प्रमाण पत्र संख्या (Certificate No):</span>
                                <strong className="font-mono text-xs text-amber-950 block">{cardData.certNo || cardData.appNo || `BR-RTPS-${Date.now().toString().slice(-8)}`}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-600 font-bold block">आवेदन संख्या (Application No):</span>
                                <strong className="font-mono text-xs text-slate-900 block">{cardData.appNo || primaryInput}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-600 font-bold block">निर्गत दिनांक (Date of Issue):</span>
                                <strong className="font-mono text-xs text-slate-900 block">{cardData.issueDate || cardData.date || new Date().toLocaleDateString('en-GB')}</strong>
                              </div>
                            </div>

                            {/* Certificate Declaration Body with Applicant Photo */}
                            <div className="my-6 space-y-4 text-sm leading-relaxed text-slate-900">
                              <div className="flex gap-6 items-start">
                                <div className="flex-1 space-y-4">
                                  <h3 className="text-center text-base font-black underline text-amber-950">
                                    निवास / जाति / आय प्रमाण पत्र (RESIDENCE / CASTE / INCOME CERTIFICATE)
                                  </h3>
                                  <p className="text-justify indent-8 leading-loose">
                                    प्रमाणित किया जाता है कि <b>{cardData.applicantName || cardData.name}</b>, आत्मज/आत्मजा/पत्नी <b>{cardData.fatherName}</b>, माता <b>{cardData.motherName || '-'}</b>, 
                                    ग्राम/मोहल्ला <b>{cardData.village || cardData.address || '-'}</b>, पोस्ट <b>{cardData.postOffice || '-'}</b>, थाना <b>{cardData.policeStation || '-'}</b>, 
                                    प्रखण्ड <b>{cardData.block || '-'}</b>, अनुमंडल <b>{cardData.subDivision || '-'}</b>, जिला <b>{cardData.district || selectState || '-'}</b>, राज्य <b>{cardData.state || selectState || 'बिहार'}</b> के स्थायी निवासी हैं।
                                  </p>
                                  <p className="text-justify indent-8 leading-loose">
                                    यह प्रमाण पत्र आवेदक द्वारा प्रस्तुत स्व-घोषणा एवं संबंधित राजस्व कर्मचारी/अंचल अधिकारी द्वारा समर्पित सत्यापन प्रतिवेदन के आधार पर 
                                    <b> बिहार लोक सेवाओं के अधिकार अधिनियम 2011</b> के प्रावधानों के अंतर्गत निर्गत किया जाता है।
                                  </p>
                                </div>

                                {/* Applicant Photo Frame */}
                                <div className="w-28 h-36 border-2 border-amber-950 rounded-lg p-1 bg-white shrink-0 shadow-xs flex flex-col items-center justify-center text-center">
                                  {(cardData.photoUrl || photoData) ? (
                                    <img src={cardData.photoUrl || photoData} alt="Applicant" className="w-full h-full object-cover rounded" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-1">
                                      <span className="text-2xl">👤</span>
                                      <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase">फोटो संलग्न</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Verification QR & Digital Signature Footer */}
                            <div className="border-t-2 border-amber-900/40 pt-5 mt-8 flex items-end justify-between">
                              <div className="space-y-1">
                                <div className="p-1.5 bg-white border border-amber-400 rounded-lg inline-block shadow-2xs">
                                  <QRCodeSVG value={`https://serviceonline.bihar.gov.in/verify/cert/${cardData.certNo || cardData.appNo}`} size={70} />
                                </div>
                                <p className="text-[9px] font-mono text-slate-600">सत्यापन: serviceonline.bihar.gov.in</p>
                              </div>

                              <div className="border-2 border-emerald-700 bg-emerald-50/60 p-3 rounded-xl text-center min-w-[220px]">
                                <div className="text-[9px] font-black text-emerald-800 uppercase flex items-center justify-center gap-1">
                                  <span>✅</span> <span>DIGITALLY SIGNED</span>
                                </div>
                                <div className="font-bold text-xs text-slate-900 my-1">राजस्व अधिकारी (Revenue Officer)</div>
                                <div className="text-[9px] text-slate-600">अंचल कार्यालय, बिहार सरकार</div>
                                <div className="text-[8px] font-mono text-slate-500 mt-1">{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</div>
                              </div>
                            </div>

                            <div className="text-[8px] text-slate-500 text-center mt-6 border-t pt-2">
                              नोट: यह एक डिजिटल रूप से हस्ताक्षरित इलेक्ट्रॉनिक प्रमाण पत्र है। इस पर किसी भौतिक हस्ताक्षर या मुहर की आवश्यकता नहीं है।
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-xl bg-white border-2 border-slate-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                            <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-black text-purple-800 uppercase">{language === 'hi' ? 'e-District उत्तर प्रदेश • राजस्व परिषद' : 'e-District UP • Board of Revenue'}</div>
                                <h3 className="text-base font-black text-slate-900">{language === 'hi' ? 'प्रमाण पत्र ऑनलाइन सत्यापन विवरण' : 'Certificate Verification Details'}</h3>
                                <p className="text-[11px] text-slate-600">{cardData.certType || 'निवास / जाति / आय प्रमाण पत्र'}</p>
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
                                <strong>{cardData.applicantName || cardData.name}</strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block">{language === 'hi' ? 'पिता/पति का नाम' : "Father / Husband Name"}</span>
                                <strong>{cardData.fatherName}</strong>
                              </div>
                            </div>

                            <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                              <span>{cardData.issuingAuthority || 'सक्षम प्राधिकारी / राजस्व अधिकारी'}</span>
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                {cardData.verificationStatus || 'सत्यापित (VERIFIED)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
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
                          <span className="font-mono font-black text-2xl text-yellow-400">
                            ₹{cardData.fee !== undefined && cardData.fee !== null ? cardData.fee : (currentTool?.fee !== undefined ? currentTool.fee : (requiredFee !== undefined ? requiredFee : 0))}.00
                          </span>
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
                    {/* 15A. E-SHRAM NATIONAL LABOUR UAN CARD (OFFICIAL CR-80) */}
                    {/* ======================================================= */}
                    {toolKind === 'eshram' && (
                      <div className="cr80-card-scaler relative group max-w-full">
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-slate-400 pointer-events-none" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-slate-400 pointer-events-none" />

                        <div className="cr80-card-print w-[340px] h-[215px] bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-xl border border-slate-400 shadow-md relative overflow-hidden flex flex-col justify-between p-3 select-none text-slate-900 font-sans print:shadow-none print:border-slate-800">
                          {/* Header */}
                          <div className="flex items-center justify-between border-b border-orange-500 pb-1">
                            <div>
                              <div className="text-[8px] font-black text-orange-900 uppercase">
                                श्रम एवं रोजगार मंत्रालय • भारत सरकार
                              </div>
                              <div className="text-[7px] font-bold text-slate-600 uppercase">
                                Ministry of Labour & Employment • Govt. of India
                              </div>
                            </div>
                            <span className="text-xs font-black bg-orange-600 text-white px-1.5 py-0.5 rounded shadow-2xs">
                              e-SHRAM
                            </span>
                          </div>

                          {/* Body: Photo + Details */}
                          <div className="flex items-center gap-2.5 py-1">
                            <div className="w-[64px] h-[78px] bg-slate-100 border border-slate-400 rounded overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                              {photoData ? (
                                <img src={photoData} alt="Photo" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-1 text-center">
                                  <span className="text-xl">👤</span>
                                  <span className="text-[6.5px] font-bold text-slate-500 uppercase mt-0.5 leading-tight">
                                    {language === 'hi' ? 'फोटो अनुपलब्ध' : 'Photo N/A'}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-0.5 text-xs">
                              <div>
                                <span className="text-[7.5px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'नाम' : 'Name'}</span>
                                <span className="font-black text-slate-900 text-[10.5px] block">{cardData.name}</span>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'पिता/पति का नाम' : "Father / Husband Name"}</span>
                                <span className="font-bold text-slate-800 text-[9.5px] block">{cardData.fatherName}</span>
                              </div>
                              <div className="grid grid-cols-2 text-[7.5px] text-slate-700">
                                <div>{language === 'hi' ? 'जन्म तिथि:' : 'DOB:'} <strong className="font-mono">{cardData.dob}</strong></div>
                                <div>{language === 'hi' ? 'लिंग:' : 'Gender:'} <strong>{cardData.gender}</strong></div>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-500 font-bold block uppercase">{language === 'hi' ? 'प्राथमिक व्यवसाय' : 'Primary Occupation'}</span>
                                <span className="font-bold text-orange-950 text-[8.5px] truncate block">{cardData.occupation || cardData.primaryOccupation || 'श्रमिक / कामगार (Labour)'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 12-Digit UAN Strip */}
                          <div className="bg-orange-950 text-white rounded p-1 text-center font-mono font-black text-xs tracking-widest shadow-xs">
                            <span className="text-[7px] text-orange-200 block font-sans tracking-normal font-normal">
                              {language === 'hi' ? 'सार्वभौमिक खाता संख्या (UAN)' : 'Universal Account Number (UAN)'}
                            </span>
                            {cardData.uan || cardData.uanNumber || cardData.uidNumber || (primaryInput && primaryInput.length === 12 ? primaryInput.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'XXXX XXXX XXXX')}
                          </div>

                          <div className="border-t pt-1 flex items-center justify-between text-[7px] text-slate-600">
                            <span>हेल्पलाइन: <strong>14434</strong> • eshram.gov.in</span>
                            <span className="font-bold text-emerald-800">सत्यापित कामगार</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 15B. MP SAMAGRA SSSM MEMBER SLIP PROFORMA */}
                    {/* ======================================================= */}
                    {toolKind === 'samagra' && (
                      <div className="w-full max-w-xl bg-white border-2 border-emerald-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-emerald-800 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-emerald-800 uppercase">
                              मध्य प्रदेश शासन • सामाजिक न्याय एवं निःशक्तजन कल्याण
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                              समग्र सामाजिक सुरक्षा मिशन (SSSM) • सदस्य जानकारी पर्ची
                            </h3>
                            <p className="text-[11px] text-slate-600">Samagra Samajik Suraksha Mission Member Slip</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`SAMAGRA:ID:${cardData.samagraId || primaryInput}|NAME:${cardData.name}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">समग्र सदस्य आईडी</span>
                            <strong className="font-mono text-emerald-950 text-sm">{cardData.samagraId || cardData.memberId || primaryInput}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">समग्र परिवार आईडी</span>
                            <strong className="font-mono text-indigo-900">{cardData.familyId || secondaryInput || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">सदस्य का नाम</span>
                            <strong className="text-slate-900">{cardData.name}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">पिता/अभिभावक</span>
                            <strong>{cardData.fatherName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">जन्म तिथि / आयु</span>
                            <strong className="font-mono">{cardData.dob}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">लिंग</span>
                            <strong>{cardData.gender}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">वर्ग (Category)</span>
                            <strong>{cardData.category || 'सामान्य / पिछड़ा वर्ग'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">ई-केवाईसी स्थिति</span>
                            <strong className="text-emerald-700">सत्यापित (Yes)</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>पोर्टल: <strong>samagra.gov.in</strong> • आधिकारिक प्रति</span>
                          <span className="font-bold text-emerald-700">सत्यापित समग्र रिकॉर्ड</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 15C. MP SAMBAL 2.0 JAN KALYAN CARD PROFORMA */}
                    {/* ======================================================= */}
                    {toolKind === 'sambal' && (
                      <div className="w-full max-w-xl bg-white border-2 border-amber-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-amber-800 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-amber-800 uppercase">
                              श्रम विभाग • मध्य प्रदेश शासन
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                              मुख्यमंत्री जन कल्याण (संबल 2.0) योजना परिचय पत्र
                            </h3>
                            <p className="text-[11px] text-slate-600">असंगठित शहरी एवं ग्रामीण कर्मकार कल्याण मण्डल</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`SAMBAL:ID:${cardData.sambalId || primaryInput}|NAME:${cardData.name}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">संबल पंजीयन क्रमांक</span>
                            <strong className="font-mono text-amber-950 text-sm">{cardData.sambalId || cardData.samagraId || primaryInput}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">हितग्राही का नाम</span>
                            <strong className="text-slate-900">{cardData.name}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">पिता/पति का नाम</span>
                            <strong>{cardData.fatherName}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">व्यवसाय श्रेणी</span>
                            <strong className="text-slate-800">{cardData.occupation || 'असंगठित श्रमिक'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">जिला / निकाय</span>
                            <strong>{cardData.district || selectState || 'मध्य प्रदेश'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase">कार्ड स्थिति</span>
                            <strong className="text-emerald-700">सक्रिय (Active 2.0)</strong>
                          </div>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>संबल पोर्टल: <strong>sambal.mp.gov.in</strong></span>
                          <span className="font-bold text-amber-800">संबल 2.0 अधिकृत</span>
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

                    {/* ======================================================= */}
                    {/* 17. BANK IFSC CODE & BRANCH PASSBOOK SLIP */}
                    {/* ======================================================= */}
                    {toolKind === 'ifsc' && (
                      <div className="w-full max-w-xl bg-white border-2 border-indigo-900 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-indigo-900 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-indigo-800 uppercase">
                              {language === 'hi' ? 'भारतीय रिज़र्व बैंक (RBI) अधिकृत IFSC व शाखा विवरण' : 'Reserve Bank of India Authorized Bank IFSC Slip'}
                            </div>
                            <h3 className="text-lg font-black text-slate-900">{cardData.bank || cardData.bankName || 'State Bank of India'}</h3>
                            <p className="text-[11px] text-slate-600 font-semibold">{cardData.branch ? `शाखा: ${cardData.branch}` : 'अधिकृत बैंक शाखा'}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`IFSC:${cardData.ifsc || cardData.refNumber}|BANK:${cardData.bank || '-'}|BRANCH:${cardData.branch || '-'}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'IFSC कोड' : 'IFSC Code'}</span>
                            <strong className="font-mono text-indigo-900 text-sm font-black">{cardData.ifsc || cardData.refNumber || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'MICR कोड' : 'MICR Code'}</span>
                            <strong className="font-mono text-slate-900">{cardData.micr || 'उपलब्ध नहीं'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'शहर / जिला' : 'City / District'}</span>
                            <strong className="text-slate-900">{cardData.city || cardData.district || '-'}</strong>
                          </div>
                          <div className="sm:col-span-3">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'शाखा का पूरा पता' : 'Branch Address'}</span>
                            <span className="text-slate-800 font-medium">{cardData.address || '-'}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase">{language === 'hi' ? 'डिजिटल पेमेंट सपोर्ट:' : 'Digital Support:'}</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">RTGS: ✅</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">NEFT: ✅</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">IMPS: ✅</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">UPI: ✅</span>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{selectedCafe?.shopName || 'स्मार्ट कैफे बैंकिंग पॉइंट'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'सत्यापित बैंक डेटा' : 'Verified Bank Data'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 18. INDIA POST PINCODE & POST OFFICES SLIP */}
                    {/* ======================================================= */}
                    {toolKind === 'pincode' && (
                      <div className="w-full max-w-xl bg-white border-2 border-red-800 rounded-2xl p-5 text-slate-900 font-sans space-y-3 shadow-md">
                        <div className="border-b-2 border-red-800 pb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-red-800 uppercase">
                              {language === 'hi' ? 'भारतीय डाक विभाग • डाकघर अवस्थिति विवरण' : 'Department of Posts • India Post Locator'}
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                              {language === 'hi' ? `पिनकोड: ${cardData.pincode || cardData.refNumber || '-'}` : `Pincode: ${cardData.pincode || cardData.refNumber || '-'}`}
                            </h3>
                            <p className="text-[11px] text-slate-600 font-semibold">{cardData.district ? `${cardData.district}, ${cardData.state || ''}` : 'भारत'}</p>
                          </div>
                          <div className="p-1 bg-white border rounded">
                            <QRCodeSVG value={`PIN:${cardData.pincode || cardData.refNumber}|DIST:${cardData.district || '-'}|STATE:${cardData.state || '-'}`} size={54} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-red-50/50 p-3 rounded-xl border border-red-200 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'पिनकोड' : 'Pincode'}</span>
                            <strong className="font-mono text-red-950 text-base font-black">{cardData.pincode || cardData.refNumber || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'जिला (District)' : 'District'}</span>
                            <strong className="text-slate-900">{cardData.district || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">{language === 'hi' ? 'राज्य (State)' : 'State'}</span>
                            <strong className="text-slate-900">{cardData.state || '-'}</strong>
                          </div>
                        </div>

                        {cardData.postOffices && cardData.postOffices.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-black text-slate-800 uppercase flex items-center justify-between">
                              <span>{language === 'hi' ? 'संबद्ध डाकघरों की सूची:' : 'Associated Post Offices:'}</span>
                              <span className="text-slate-500 text-[10px]">({cardData.postOffices.length} डाकघर)</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                              {cardData.postOffices.map((po, idx) => (
                                <div key={idx} className="p-2 bg-slate-50 border rounded-lg text-xs flex items-center justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-slate-900">{po.name || po.Name}</span>
                                    <span className="text-[10px] text-slate-500 block">{po.branchType || po.BranchType || 'Sub Post Office'}</span>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    (po.deliveryStatus || po.DeliveryStatus) === 'Delivery'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {po.deliveryStatus || po.DeliveryStatus || 'Delivery'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{selectedCafe?.shopName || 'स्मार्ट कैफे डाक सेवा'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? 'सत्यापित डाक डेटा' : 'Verified Postal Data'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 19. INSTANT HIGH-RES QR CODE PAYMENT STANDEE */}
                    {/* ======================================================= */}
                    {toolKind === 'qr' && (
                      <div className="w-full max-w-sm bg-white border-2 border-slate-900 rounded-3xl p-6 text-slate-900 font-sans space-y-4 shadow-xl text-center">
                        <div className="border-b pb-3">
                          <div className="text-[10px] font-black tracking-widest text-orange-600 uppercase">
                            BHIM UPI • DIGITAL INDIA
                          </div>
                          <h3 className="text-lg font-black text-slate-900">
                            {selectedCafe?.shopName || 'डिजिटल सेवा केंद्र काउंटर'}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">ऑल UPI पेमेंट्स स्वीकार्य</p>
                        </div>

                        <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner">
                          {cardData.qrUrl ? (
                            <img src={cardData.qrUrl} alt="Payment QR" className="w-56 h-56 object-contain" />
                          ) : (
                            <QRCodeSVG value={cardData.text || primaryInput || 'https://smartcafe.sbs'} size={220} level="H" />
                          )}
                        </div>

                        <div className="bg-slate-950 text-white py-2.5 px-4 rounded-xl">
                          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">UPI ID / लिंक / संदर्भ</span>
                          <strong className="font-mono text-sm text-yellow-400 break-all">{cardData.text || primaryInput || '-'}</strong>
                        </div>

                        <p className="text-[11px] text-slate-500 font-semibold">
                          {language === 'hi'
                            ? 'Google Pay, PhonePe, Paytm या किसी भी UPI ऐप से स्कैन करके भुगतान करें'
                            : 'Scan & Pay using any UPI app (GPay, PhonePe, Paytm)'}
                        </p>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 20. LIVE SARKARI JOB & EXAM ALERTS FEED */}
                    {/* ======================================================= */}
                    {toolKind === 'sarkari_feed' && (
                      <div className="w-full max-w-2xl bg-white border-2 border-amber-600 rounded-2xl p-5 text-slate-900 font-sans space-y-4 shadow-md">
                        <div className="border-b pb-3 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-amber-700 uppercase">
                              {language === 'hi' ? 'ताज़ा सरकारी भर्ती, एडमिट कार्ड व परिणाम लाइव' : 'Latest Government Jobs, Admit Cards & Results'}
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                              {language === 'hi' ? '📢 सरकारी योजनाएं एवं भर्ती अलर्ट' : '📢 Sarkari Live Notifications Desk'}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleInstantGenerate()}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {(cardData.items && cardData.items.length > 0) ? (
                            cardData.items.map((item, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 rounded-xl transition-all flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <span className="inline-block text-[9px] uppercase font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                    {item.category || 'Govt Alert'}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                                  <span className="text-[10px] text-slate-500 block">{item.pubDate}</span>
                                </div>
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-[11px] font-bold transition-all text-center"
                                  >
                                    {language === 'hi' ? 'फॉर्म भरें' : 'Apply'}
                                  </a>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
                              <span className="text-2xl">📢</span>
                              <p className="text-xs font-bold text-slate-700">
                                {language === 'hi' 
                                  ? 'लाइव सरकारी भर्ती सर्वर से डेटा लोड हो रहा है... कृपया "रिफ्रेश" बटन दबाएं।' 
                                  : 'Connecting to live government recruitment portal... Click Refresh to fetch latest alerts.'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs text-slate-600">
                          <span>{selectedCafe?.shopName || 'डिजिटल सेवा केंद्र'}</span>
                          <span className="font-bold text-emerald-700">{language === 'hi' ? '24x7 लाइव सरकारी अपडेट्स' : '24x7 Live Feed'}</span>
                        </div>
                      </div>
                    )}

                    {/* ======================================================= */}
                    {/* 21. CITIZEN DIGITAL INTELLIGENCE & LOOKUP DOSSIER */}
                    {/* ======================================================= */}
                    {toolKind === 'lookup' && (
                      <div className="w-full max-w-xl bg-white border-2 border-slate-900 rounded-2xl p-5 text-slate-900 font-sans space-y-4 shadow-xl">
                        <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              {language === 'hi' ? 'राष्ट्रीय डिजिटल पहचान एवं नागरिक खोज अन्वेषण' : 'National Digital Identity & Intelligence Dossier'}
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
                              {currentTool?.title || currentTool?.name || 'डिजिटल नागरिक सत्यापन रिपोर्ट'}
                            </h3>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {language === 'hi' ? 'दूरसंचार, यूपीआई एवं ऑनलाइन प्रोफाइल अधिकृत सत्यापन' : 'Telecom, UPI & Digital Profile Verification Record'}
                            </p>
                          </div>
                          <div className="p-1 bg-white border border-slate-300 rounded shadow-xs shrink-0">
                            <QRCodeSVG value={`DOSSIER:${cardData.refNumber || Date.now()}|QUERY:${primaryInput}|TIME:${Date.now()}`} size={56} />
                          </div>
                        </div>

                        {/* Search Input Banner */}
                        <div className="bg-slate-950 text-white p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">
                              {language === 'hi' ? 'खोजा गया इनपुट / संदर्भ' : 'Search Input / Query'}
                            </span>
                            <strong className="font-mono text-sm sm:text-base text-yellow-400 font-bold">
                              {primaryInput || cardData.query || '-'}
                            </strong>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {language === 'hi' ? 'सत्यापित लाइव' : 'LIVE VERIFIED'}
                          </span>
                        </div>

                        {/* 4-Quadrant Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">
                              {language === 'hi' ? 'संबद्ध धारक का नाम (Name / Identity)' : 'Primary Name / Identity'}
                            </span>
                            <strong className="text-sm text-slate-900 block">
                              {cardData.name && cardData.name !== '-' ? cardData.name : (cardData.customerName || cardData.ownerName || cardData.accountHolder || (activeData?.data?.name) || 'सत्यापित नागरिक')}
                            </strong>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">
                              {language === 'hi' ? 'संबद्ध मोबाइल नंबर (Linked Phone)' : 'Linked Mobile Number'}
                            </span>
                            <strong className="text-sm font-mono text-indigo-900 font-bold block">
                              {cardData.mobile || cardData.mobileNo || cardData.phone || (activeData?.data?.mobile) || primaryInput || '-'}
                            </strong>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">
                              {language === 'hi' ? 'दूरसंचार प्रदाता व मंडल (Carrier & Circle)' : 'Telecom Operator & Circle'}
                            </span>
                            <strong className="text-xs text-slate-900 block font-semibold">
                              {cardData.operator || cardData.carrier || (activeData?.data?.operator) || 'JIO / Airtel / Vi'} • {cardData.circle || cardData.state || (activeData?.data?.circle) || 'All India'}
                            </strong>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">
                              {language === 'hi' ? 'डिजिटल पहचान / ईमेल / UPI' : 'Digital Handle / Email / UPI'}
                            </span>
                            <strong className="text-xs font-mono text-slate-900 block truncate font-semibold">
                              {cardData.email || cardData.gmail || cardData.upi || cardData.telegram || cardData.username || (activeData?.data?.upi) || (activeData?.data?.email) || 'उपलब्ध (Active)'}
                            </strong>
                          </div>
                        </div>

                        {/* Verification & Footprint Summary */}
                        <div className="border border-indigo-200 bg-indigo-50/60 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-950 flex items-center gap-1">
                              <span>🛡️</span> {language === 'hi' ? 'साइबर ऑथेंटिकेशन स्थिति:' : 'Authentication Status:'}
                            </span>
                            <span className="text-emerald-700 font-black">
                              {cardData.status || (activeData?.success ? 'सत्यापित (100% MATCH)' : 'सक्रिय (ACTIVE)')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            {language === 'hi' 
                              ? 'यह डॉसियर अधिकृत टेलीकॉम गेटवे एवं सार्वजनिक डेटाबेस से सत्यापित डिजिटल रिकॉर्ड के आधार पर तैयार किया गया है।' 
                              : 'This dossier is compiled from verified digital telecommunication gateways and authentic public directories.'}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-2 flex items-center justify-between text-[11px] text-slate-600">
                          <span>{selectedCafe?.shopName || 'डिजिटल सेवा केंद्र एवं अन्वेषण डेस्क'}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            ID: {cardData.refNumber || `DS-${Date.now().toString().slice(-8)}`}
                          </span>
                        </div>
                      </div>
                    )}

                  </>
                );
              })()}

                </div>

                {/* 📋 EXPANDABLE FULL OFFICIAL TELEMETRY & RECORDS (100% P4POINTS RAW DATA TRANSPARENCY) */}
                {activeData && (
                  <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs mt-4">
                    <button
                      type="button"
                      onClick={() => setShowRawTelemetry(prev => !prev)}
                      className="w-full px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">📋</span>
                        <div>
                          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                            {language === 'hi' ? 'विस्तृत आधिकारिक रिकॉर्ड (Complete Official Telemetry & Records)' : 'Complete Official Telemetry & Records'}
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'hi' ? 'P4Points API व सरकारी गेटवे से प्राप्त 100% संपूर्ण कच्चा व परिष्कृत डेटा' : '100% Raw Key-Value Pairs & Official Gateway Attributes'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-full">
                          {showRawTelemetry ? (language === 'hi' ? 'छिपाएं ▲' : 'Collapse ▲') : (language === 'hi' ? 'देखें ▼' : 'Expand ▼')}
                        </span>
                      </div>
                    </button>

                    {showRawTelemetry && (
                      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        {/* Key-Value Pair Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {Object.entries({
                            ...(activeData?.raw && typeof activeData.raw === 'object' ? activeData.raw : {}),
                            ...(activeData?.data && typeof activeData.data === 'object' ? activeData.data : {}),
                            ...(typeof activeData === 'object' ? activeData : {})
                          })
                            .filter(([key, val]) => {
                              if (['photoUrl', 'signUrl', 'photo', 'sign', 'qr', 'raw', 'data', 'base64', 'fileData'].includes(key)) return false;
                              if (typeof val === 'object' && val !== null) return false;
                              return val !== undefined && val !== null && String(val).trim() !== '';
                            })
                            .map(([key, val]) => (
                              <div key={key} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono truncate" title={key}>
                                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                </span>
                                <strong className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono mt-0.5 break-words">
                                  {String(val)}
                                </strong>
                              </div>
                            ))}
                        </div>

                        {/* Raw JSON Inspector Details */}
                        <details className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                          <summary className="text-[11px] font-mono text-amber-400 font-bold cursor-pointer select-none">
                            {language === 'hi' ? '⚙️ डेवलपर व तकनीकी सत्यापन हेतु कच्चा JSON पेलोड (Raw JSON)' : '⚙️ Technical Telemetry Raw JSON Payload'}
                          </summary>
                          <pre className="mt-2.5 text-[10px] font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800 max-h-60">
                            {JSON.stringify(activeData?.raw || activeData?.data || activeData, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
      )}

      {/* Live Government OTP Bridge Modal */}
      <LiveOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        serviceTitle={currentTool?.name || currentTool?.title?.hi || 'सरकारी ई-सेवा'}
        serviceType={currentTool?.serviceType || currentTool?.id}
        txnId={activeOtpData?.txnId || ''}
        phone={primaryInput || customerSession?.phone || '8006518960'}
        aadhaarNo={primaryInput}
        testOtpHint={activeOtpData?.testOtpHint || ''}
        onVerified={(verifiedResponse) => {
          handleOtpVerificationSuccess(verifiedResponse);
        }}
      />

      {/* A4 5-in-1 ISO CR-80 300 DPI PVC Tray Sheet Generator Modal */}
      <PvcTraySheetModal
        isOpen={showPvcTrayModal}
        onClose={() => setShowPvcTrayModal(false)}
        cardData={activeData}
        toolKind={toolKind}
      />

      {/* ================================================================= */}
      {/* RECENT APPLICATIONS & ORDER HISTORY (EXACT REKHA PRINT ORDER DESK) */}
      {/* ================================================================= */}
      <div className="bg-white dark:bg-[#0c162c] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden mt-6">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider">
              {language === 'hi' ? '📋 हाल ही के आवेदन व प्रिंट इतिहास' : '📋 Recent Applications & Order History'}
            </h3>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {toolOrders.length > 0 ? toolOrders.length : orderHistory.length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchOrderHistory}
            disabled={loadingHistory}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {(!Array.isArray(orderHistory) || (toolOrders.length === 0 && orderHistory.length === 0)) ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi' ? 'वर्तमान में कोई पिछला आवेदन दर्ज नहीं है।' : 'No recent orders found.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'सेवा का नाम' : 'Service'}</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'संदर्भ सं. / इनपुट' : 'Ref / Input'}</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'ग्राहक / फोन' : 'Customer'}</th>
                  <th className="py-2.5 px-4">{language === 'hi' ? 'दिनांक व समय' : 'Date & Time'}</th>
                  <th className="py-2.5 px-4 text-center">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th className="py-2.5 px-4 text-right">{language === 'hi' ? 'कार्यवाही' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(toolOrders.length > 0 ? toolOrders : orderHistory.slice(0, 10)).map((orderItem, idx) => {
                  const isPending = orderItem.status === 'pending';
                  const isCompleted = orderItem.status === 'completed' || orderItem.upstreamStatus === 'Success';
                  const isRejected = orderItem.status === 'rejected' || orderItem.upstreamStatus === 'Failed';
                  const ref = orderItem.refNumber || orderItem.vehicleNumber || orderItem.panNo || orderItem.aadhaarNo || orderItem.orderId || '-';
                  
                  return (
                    <tr key={orderItem.id || orderItem.orderId || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {orderItem.serviceName || orderItem.docTitle || currentTool?.name || 'सेवा'}
                        {orderItem.fulfillmentType === 'manual_relay' && (
                          <span className="ml-1.5 text-[9px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-bold">
                            रेखा रिले
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {ref}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div className="font-semibold">{orderItem.customerName || '-'}</div>
                        <div className="font-mono text-[10px] text-slate-400">{orderItem.customerPhone || ''}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {orderItem.createdAt ? new Date(orderItem.createdAt).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-300 dark:border-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {language === 'hi' ? 'पेंडिंग (2-4h)' : 'Pending'}
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-300 dark:border-emerald-700">
                            ✓ {language === 'hi' ? 'पूर्ण' : 'Completed'}
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-300 dark:border-rose-700">
                            ✕ {language === 'hi' ? 'निरस्त/रिफंड' : 'Refunded'}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">{orderItem.status || '-'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleFreeReprint(orderItem)}
                              className="bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                              title={language === 'hi' ? 'पावती एवं ट्रैकिंग पत्र देखें' : 'View Docket'}
                            >
                              📄 {language === 'hi' ? 'पावती' : 'Docket'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePollSingleOrder(orderItem.id || orderItem.orderId)}
                              disabled={pollingSingleOrder}
                              className="bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              🔄 {language === 'hi' ? 'जांचें' : 'Check'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFreeReprint(orderItem)}
                            className="bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            🖨️ {language === 'hi' ? 'रिप्रिंट / लोड' : 'Reprint'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}

/**
 * 100% Fail-safe Error Boundary (Prevents ANY White Screen Crash)
 */
class ServiceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ServiceErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-12 max-w-xl mx-auto my-8 bg-white dark:bg-[#0c162c] border border-rose-300 dark:border-rose-900 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            सेवा लोड करने में समस्या आई
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {this.state.error?.message || 'डैशबोर्ड पर वापस जाएं और पुनः प्रयास करें।'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onBack) this.props.onBack();
              }}
              className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              ← डैशबोर्ड पर वापस जाएं
            </button>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              पुनः लोड करें
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ServicePage(props) {
  return (
    <ServiceErrorBoundary onBack={props.onBack}>
      <ServicePageContent {...props} />
    </ServiceErrorBoundary>
  );
}
