import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, CreditCard, User, 
  MapPin, FileText, Upload, ShieldCheck, AlertCircle, Eye, 
  Download, Printer, Sparkles, RefreshCw, CheckCircle2, 
  HelpCircle, Search, Edit3, Trash2, RotateCcw, Wallet, 
  Info, ExternalLink, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import aoCodesData from '../../data/ao_codes.json';
import { generateStampedForm49APdf } from '../../utils/form49aStamper';
import Form49APreviewModal from './Form49APreviewModal';
import { useLanguage } from '../../context/LanguageContext';
import { authFetch } from '../../utils/api';

// Exact 16 Non-Aadhaar Date of Birth Proofs according to official Form 49A / NSDL / UTIITSL rules
export const EXACT_16_DOB_PROOFS = [
  { id: 'municipal_birth_cert', label: 'Municipal Birth Certificate (जन्म प्रमाण पत्र - नगर निगम/पालिका)', en: 'Municipal Birth Certificate' },
  { id: '10th_marksheet', label: '10th / Matriculation Marksheet / Certificate (10वीं की अंकतालिका/सनद)', en: '10th / Matriculation Certificate' },
  { id: 'school_leaving_cert', label: 'School Leaving Certificate / Transfer Certificate (SLC / TC)', en: 'School Leaving / Transfer Certificate' },
  { id: 'passport', label: 'Passport (भारतीय पासपोर्ट)', en: 'Indian Passport' },
  { id: 'driving_licence', label: 'Driving Licence (ड्राइविंग लाइसेंस)', en: 'Driving Licence' },
  { id: 'voter_id', label: 'Voter ID Card / EPIC (मतदाता पहचान पत्र)', en: 'Voter ID Card / EPIC' },
  { id: 'domicile_cert', label: 'Domicile Certificate issued by Government (मूल निवास प्रमाण पत्र)', en: 'Government Domicile Certificate' },
  { id: 'govt_employee_id', label: 'Central / State Government Employee ID (सरकारी कर्मचारी पहचान पत्र)', en: 'Central / State Govt Employee ID' },
  { id: 'pension_order', label: 'Pension Payment Order (PPO / पेंशन भुगतान आदेश)', en: 'Pension Payment Order (PPO)' },
  { id: 'echs_card', label: 'ECHS / Ex-Servicemen Health Scheme Card (पूर्व सैनिक स्वास्थ्य योजना)', en: 'ECHS Health Card' },
  { id: 'psu_photo_id', label: 'Photo ID Card issued by Central / State PSU (पीएसयू फोटो पहचान पत्र)', en: 'Central/State PSU Photo ID' },
  { id: 'marriage_cert', label: 'Marriage Certificate issued by Registrar (विवाह पंजीयन प्रमाण पत्र)', en: 'Registrar Marriage Certificate' },
  { id: 'gazetted_dob_cert', label: 'DOB Certificate signed by Gazetted Officer (राजपत्रित अधिकारी प्रमाण पत्र)', en: 'Gazetted Officer DOB Certificate' },
  { id: 'mla_mp_dob_cert', label: 'DOB Certificate signed by MP / MLA / Councilor (सांसद/विधायक प्रमाण पत्र)', en: 'MP / MLA / Councilor DOB Certificate' },
  { id: 'armed_forces_id', label: 'Armed Forces Medical Services Photo ID (सशस्त्र बल पहचान पत्र)', en: 'Armed Forces Medical ID Card' },
  { id: 'bank_passbook_photo', label: 'Bank Passbook / Statement with Photo & DOB (बैंक पासबुक जिसमें जन्मतिथि अंकित हो)', en: 'Bank Passbook with Photo & DOB' }
];

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export default function PanCardApplicationModal({
  isOpen = false,
  onClose,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  isOperator = false,
  customerSession = null,
  selectedCafe = null,
  onOpenWallet,
  onOpenB2bWallet,
  onBalanceUpdated,
  theme = 'light'
}) {
  const { language, t } = useLanguage();

  // 8 Steps Wizard (1 to 8)
  const [currentStep, setCurrentStep] = useState(1);

  // Pricing & Role resolution
  // B2B Retailer / Operator = ₹145 | Public B2C Citizen = ₹190 | Base Cost = ₹120
  const applicableRole = isOperator ? 'cafe_operator' : 'customer';
  const mandatoryFee = isOperator ? 145 : 190;
  const currentAvailableBalance = isOperator ? sanchalakB2bBalance : walletBalance;
  const isInsufficientBalance = currentAvailableBalance < mandatoryFee;

  // Step 1: Application Category & Mode
  const [appType, setAppType] = useState('new_pan_49a'); // Form 49A Indian Citizen
  const [cardMode, setCardMode] = useState('physical_and_epan'); // Physical PAN Card + e-PAN

  // Step 2: Personal Details
  const [title, setTitle] = useState('Shri');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherMiddleName, setFatherMiddleName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [cardParentChoice, setCardParentChoice] = useState('father');

  // Step 3: Contact & Communication
  const defaultMobile = customerSession?.phone || (selectedCafe?.phone) || '';
  const [mobile, setMobile] = useState(defaultMobile);
  const [email, setEmail] = useState('');

  // Step 4: Address Details
  const [flat, setFlat] = useState('');
  const [premises, setPremises] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');

  // Step 5: AO Code Search & Details
  const [aoSearchQuery, setAoSearchQuery] = useState('');
  const [selectedAo, setSelectedAo] = useState({
    areaCode: 'KNP',
    aoType: 'W',
    rangeCode: '17',
    aoNumber: '95',
    displayText: 'Uttar Pradesh (BULANDSHAHAR) (KNP W 17 95)'
  });

  // Step 6: Identity & Proofs
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [nameOnAadhaar, setNameOnAadhaar] = useState('');
  const [dobProof, setDobProof] = useState(EXACT_16_DOB_PROOFS[0].label);

  // Step 7: Documents & Digital Touch/Stylus Canvas
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [signFile, setSignFile] = useState(null);
  const [signPreview, setSignPreview] = useState('');
  const [signMethod, setSignMethod] = useState('canvas'); // 'canvas' | 'upload'
  const [aadhaarDocFile, setAadhaarDocFile] = useState(null);
  const [aadhaarDocName, setAadhaarDocName] = useState('');
  const [dobDocFile, setDobDocFile] = useState(null);
  const [dobDocName, setDobDocName] = useState('');

  // Signature Canvas Drawing State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasCanvasDrawn, setHasCanvasDrawn] = useState(false);
  const drawingHistoryRef = useRef([]);

  // Step 8: Submission & Stamped Preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null); // { appId, txnId, application }
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfBlob, setPreviewPdfBlob] = useState(null);
  const [previewPdfDataUrl, setPreviewPdfDataUrl] = useState('');
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill name on Aadhaar when personal name changes
  useEffect(() => {
    if (!nameOnAadhaar || nameOnAadhaar === `${firstName} ${lastName}`.trim()) {
      const full = [firstName, middleName, lastName].filter(Boolean).join(' ');
      setNameOnAadhaar(full);
    }
  }, [firstName, middleName, lastName]);

  // Sync mobile default
  useEffect(() => {
    if (!mobile && (customerSession?.phone || selectedCafe?.phone)) {
      setMobile(customerSession?.phone || selectedCafe?.phone);
    }
  }, [customerSession, selectedCafe]);

  // Dynamic AO Codes Filtering (708 Cities in ao_codes.json)
  const filteredAoCodes = useMemo(() => {
    if (!aoSearchQuery || aoSearchQuery.trim().length < 2) {
      return aoCodesData.slice(0, 15);
    }
    const q = aoSearchQuery.toLowerCase().trim();
    return aoCodesData.filter(item => {
      const cityMatch = item.city && item.city.toLowerCase().includes(q);
      const stateMatch = item.state && item.state.toLowerCase().includes(q);
      const areaMatch = item.areaCode && item.areaCode.toLowerCase().includes(q);
      const displayMatch = item.display && item.display.toLowerCase().includes(q);
      return cityMatch || stateMatch || areaMatch || displayMatch;
    }).slice(0, 30);
  }, [aoSearchQuery]);

  // ─────────────────────────────────────────────────────────────────────────
  // DIGITAL SIGNATURE CANVAS CONTROLS (Touch, Mouse & Stylus Pen Support)
  // ─────────────────────────────────────────────────────────────────────────
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ratio = Math.max(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a'; // Deep Indigo/Black ink
  };

  useEffect(() => {
    if (currentStep === 7 && signMethod === 'canvas') {
      setTimeout(initCanvas, 100);
    }
  }, [currentStep, signMethod]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);

    setIsDrawing(true);
    setHasCanvasDrawn(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);

    // Save snapshot for Undo
    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingHistoryRef.current.push(snap);
      if (drawingHistoryRef.current.length > 20) drawingHistoryRef.current.shift();
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUri = canvas.toDataURL('image/png');
      setSignPreview(dataUri);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistoryRef.current = [];
    setHasCanvasDrawn(false);
    setSignPreview('');
  };

  const handleUndoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (drawingHistoryRef.current.length > 0) {
      const lastSnap = drawingHistoryRef.current.pop();
      ctx.putImageData(lastSnap, 0, 0);
      const dataUri = canvas.toDataURL('image/png');
      setSignPreview(dataUri);
      if (drawingHistoryRef.current.length === 0) setHasCanvasDrawn(false);
    } else {
      handleClearCanvas();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FILE UPLOAD HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'hi' ? 'फोटो का साइज 5MB से कम होना चाहिए।' : 'Photo size must be under 5MB.');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'hi' ? 'हस्ताक्षर का साइज 5MB से कम होना चाहिए।' : 'Signature size must be under 5MB.');
      return;
    }
    setSignFile(file);
    const reader = new FileReader();
    reader.onload = () => setSignPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAadhaarDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAadhaarDocFile(file);
    setAadhaarDocName(file.name);
  };

  const handleDobDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDobDocFile(file);
    setDobDocName(file.name);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP VALIDATION
  // ─────────────────────────────────────────────────────────────────────────
  const validateCurrentStep = () => {
    setErrorMessage('');

    if (currentStep === 1) {
      if (isInsufficientBalance) {
        setErrorMessage(
          language === 'hi' 
            ? `अपर्याप्त वॉलेट बैलेंस! आवश्यक शुल्क ₹${mandatoryFee}, वर्तमान बैलेंस ₹${currentAvailableBalance}। कृपया पहले वॉलेट रिचार्ज करें।` 
            : `Insufficient wallet balance! Required fee: ₹${mandatoryFee}, Current: ₹${currentAvailableBalance}. Please recharge wallet first.`
        );
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!lastName || lastName.trim() === '') {
        setErrorMessage(language === 'hi' ? 'आवेदक का उपनाम / अंतिम नाम (Last Name) अनिवार्य है।' : 'Last Name / Surname is mandatory.');
        return false;
      }
      if (!dob || dob.trim() === '') {
        setErrorMessage(language === 'hi' ? 'जन्म तिथि (DOB) अनिवार्य है।' : 'Date of Birth (DOB) is mandatory.');
        return false;
      }
      const fatherLast = fatherLastName || fatherFirstName;
      if (!fatherLast || fatherLast.trim() === '') {
        setErrorMessage(language === 'hi' ? 'पिता का नाम अनिवार्य है।' : "Father's name is mandatory.");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      const cleanMob = String(mobile).replace(/\D/g, '');
      if (cleanMob.length !== 10) {
        setErrorMessage(language === 'hi' ? 'वैध 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Enter a valid 10-digit mobile number.');
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (!premises && !flat && !street) {
        setErrorMessage(language === 'hi' ? 'मकान संख्या या गांव/भवन का नाम दर्ज करें।' : 'Please enter Flat/Door or Premises/Village.');
        return false;
      }
      if (!city || city.trim() === '') {
        setErrorMessage(language === 'hi' ? 'शहर / जिला दर्ज करें।' : 'Town / City / District is mandatory.');
        return false;
      }
      const cleanPin = String(pincode).replace(/\D/g, '');
      if (cleanPin.length !== 6) {
        setErrorMessage(language === 'hi' ? 'वैध 6-अंकीय पिनकोड दर्ज करें।' : 'Enter a valid 6-digit Pincode.');
        return false;
      }
      return true;
    }

    if (currentStep === 5) {
      if (!selectedAo?.areaCode || !selectedAo?.aoNumber) {
        setErrorMessage(language === 'hi' ? 'कृपया AO कोड (Area Code) का चयन करें।' : 'Please select an AO Code.');
        return false;
      }
      return true;
    }

    if (currentStep === 6) {
      const cleanAadhaar = String(aadhaarNumber).replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        setErrorMessage(language === 'hi' ? 'वैध 12-अंकीय आधार संख्या दर्ज करें।' : 'Enter a valid 12-digit Aadhaar Number.');
        return false;
      }
      if (!dobProof) {
        setErrorMessage(language === 'hi' ? 'जन्म तिथि का 16 प्रमाणों में से एक प्रमाण चुनें।' : 'Select a valid Date of Birth proof.');
        return false;
      }
      return true;
    }

    if (currentStep === 7) {
      if (!photoPreview && !photoFile) {
        setErrorMessage(language === 'hi' ? 'कृपया आवेदक की पासपोर्ट साइज फोटो अपलोड करें।' : 'Please upload applicant passport photo.');
        return false;
      }
      if (!signPreview && !signFile) {
        setErrorMessage(language === 'hi' ? 'कृपया डिजिटल हस्ताक्षर बनाएं या हस्ताक्षर अपलोड करें।' : 'Please draw digital signature or upload signature.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE FORM 49A DIGITAL PREVIEW GENERATOR
  // ─────────────────────────────────────────────────────────────────────────
  const handleOpenLivePreview = async () => {
    setGeneratingPreview(true);
    setErrorMessage('');
    try {
      const previewData = {
        id: 'PAN-PREVIEW',
        personal: {
          title,
          firstName,
          middleName,
          lastName,
          gender,
          dob,
          fatherFirstName,
          fatherMiddleName,
          fatherLastName,
          fatherName: [fatherFirstName, fatherMiddleName, fatherLastName].filter(Boolean).join(' '),
          motherName,
          cardParentChoice,
          mobile,
          email
        },
        address: {
          flat,
          premises,
          street,
          locality,
          city,
          state,
          pincode
        },
        aoCode: selectedAo,
        identity: {
          aadhaarNumber,
          nameOnAadhaar,
          dobProof
        },
        documents: {
          photo: photoPreview || photoFile,
          signature: signPreview || signFile,
          aadhaarDoc: aadhaarDocFile,
          dobDoc: dobDocFile
        }
      };

      const { pdfBytes, blob, dataUrl } = await generateStampedForm49APdf(previewData);
      setPreviewPdfBlob(blob);
      setPreviewPdfDataUrl(dataUrl);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error('Preview generation error:', err);
      setErrorMessage(language === 'hi' ? `फॉर्म पूर्वावलोकन त्रुटि: ${err.message}` : `Form Preview Error: ${err.message}`);
    } finally {
      setGeneratingPreview(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FINAL SUBMISSION HANDLER
  // ─────────────────────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Step A: Build Stamped Form 49A PDF
      const formPayload = {
        personal: {
          title,
          firstName,
          middleName,
          lastName,
          gender,
          dob,
          fatherName: [fatherFirstName, fatherMiddleName, fatherLastName].filter(Boolean).join(' ') || fatherLastName,
          motherName,
          cardParentChoice,
          mobile,
          email
        },
        address: {
          flat,
          premises,
          street,
          locality,
          city,
          state,
          pincode
        },
        aoCode: selectedAo,
        identity: {
          aadhaarNumber: String(aadhaarNumber).replace(/\D/g, ''),
          nameOnAadhaar: nameOnAadhaar || `${firstName} ${lastName}`.trim(),
          dobProof,
          signType: signMethod === 'canvas' ? 'digital_touch_canvas' : 'scanned_upload'
        },
        feeCharged: mandatoryFee,
        appliedBy: mobile,
        role: applicableRole,
        cafeId: selectedCafe?.id || ''
      };

      // Step B: Generate Stamped Form 49A PDF Bytes
      let form49aPdfBlob = null;
      try {
        const stamped = await generateStampedForm49APdf({
          ...formPayload,
          photo: photoPreview || photoFile,
          signature: signPreview || signFile,
          aadhaarDoc: aadhaarDocFile,
          dobDoc: dobDocFile
        });
        form49aPdfBlob = stamped.blob;
      } catch (err) {
        console.warn('Form 49A PDF stamp non-fatal error:', err.message);
      }

      // Step C: Prepare FormData for Atomic Server Submission
      const formData = new FormData();
      formData.append('appliedBy', mobile);
      formData.append('role', applicableRole);
      formData.append('feeCharged', String(mandatoryFee));
      formData.append('cafeId', selectedCafe?.id || '');
      formData.append('personal', JSON.stringify(formPayload.personal));
      formData.append('address', JSON.stringify(formPayload.address));
      formData.append('aoCode', JSON.stringify(formPayload.aoCode));
      formData.append('identity', JSON.stringify(formPayload.identity));

      // Append files
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (photoPreview) {
        formData.append('photo', photoPreview);
      }

      if (signFile) {
        formData.append('signature', signFile);
      } else if (signPreview) {
        formData.append('signature', signPreview);
      }

      if (aadhaarDocFile) formData.append('aadhaarDoc', aadhaarDocFile);
      if (dobDocFile) formData.append('dobDoc', dobDocFile);
      if (form49aPdfBlob) {
        formData.append('form49aPdf', form49aPdfBlob, 'Form49A_Stamped.pdf');
      }

      const res = await authFetch('/api/pan/apply', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'hi' ? 'आवेदन जमा करने में विफल।' : 'Failed to submit application.'));
      }

      // Submission Success!
      setSubmissionSuccess({
        appId: data.application?.id || data.applicationId,
        txnId: data.walletTxnId,
        application: data.application,
        currentBalance: data.currentBalance
      });

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      // Notify parent of updated wallet balance
      if (onBalanceUpdated) {
        onBalanceUpdated(data.currentBalance);
      }

    } catch (err) {
      console.error('PAN Application submit error:', err);
      setErrorMessage(err.message || 'त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Top Wizard Header Banner */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                    {language === 'hi' ? 'नया पैन कार्ड आवेदन (Form 49A)' : 'New PAN Card Application (Form 49A)'}
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                    UTIITSL / NSDL
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {language === 'hi' 
                    ? 'फिजिकल पैन कार्ड (डाक द्वारा) + डिजिटल e-PAN (ईमेल द्वारा) • 100% डिजिटल स्टैम्पिंग' 
                    : 'Physical PAN Card (by Post) + Digital e-PAN (by Email) • 100% Auto-Stamping'}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 8-Step Progress Stepper Bar */}
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto scrollbar-thin">
            <div className="flex items-center justify-between min-w-[580px] gap-2">
              {[
                { s: 1, label: language === 'hi' ? '1. प्रकार' : '1. Type' },
                { s: 2, label: language === 'hi' ? '2. व्यक्तिगत' : '2. Personal' },
                { s: 3, label: language === 'hi' ? '3. संपर्क' : '3. Contact' },
                { s: 4, label: language === 'hi' ? '4. पता' : '4. Address' },
                { s: 5, label: language === 'hi' ? '5. AO कोड' : '5. AO Code' },
                { s: 6, label: language === 'hi' ? '6. प्रमाण' : '6. Proofs' },
                { s: 7, label: language === 'hi' ? '7. फोटो/साइन' : '7. Upload' },
                { s: 8, label: language === 'hi' ? '8. समीक्षा' : '8. Review' },
              ].map(step => {
                const isPassed = currentStep > step.s;
                const isCurrent = currentStep === step.s;
                return (
                  <div 
                    key={step.s}
                    onClick={() => {
                      if (step.s < currentStep) setCurrentStep(step.s);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-xl transition cursor-pointer select-none ${
                      isCurrent 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : isPassed 
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100' 
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent 
                        ? 'bg-white text-blue-700' 
                        : isPassed 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isPassed ? '✓' : step.s}
                    </span>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Body / Steps Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1">{errorMessage}</span>
                {isInsufficientBalance && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (isOperator && onOpenB2bWallet) onOpenB2bWallet();
                      else if (onOpenWallet) onOpenWallet();
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-black px-3 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'वॉलेट रिचार्ज करें' : 'Recharge Wallet'}</span>
                  </button>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* SUCCESS BANNER WHEN APPLICATION SUBMITTED */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {submissionSuccess ? (
              <div className="text-center py-8 px-4 space-y-6 max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl border-2 border-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                    🎉 आवेदन सफलतापूर्वक दर्ज हुआ (Application Submitted)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {submissionSuccess.appId}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'hi' 
                      ? 'आपका पैन कार्ड आवेदन सफलतापूर्वक प्राप्त हो गया है। फॉर्म 49A डिजिटल रूप से स्टैम्प्ड कर दिया गया है।' 
                      : 'Your PAN card application has been received. Form 49A has been digitally stamped.'}
                  </p>
                </div>

                {/* Info Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">{language === 'hi' ? 'आवेदक का नाम:' : 'Applicant Name:'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{firstName} {lastName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">{language === 'hi' ? 'शुल्क काटा गया:' : 'Fee Charged:'}</span>
                    <span className="font-bold text-emerald-600">₹{mandatoryFee} (वॉलेट से डेबिट)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">{language === 'hi' ? 'लेन-देन आईडी:' : 'Transaction ID:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{submissionSuccess.txnId}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{language === 'hi' ? 'शेष वॉलेट बैलेंस:' : 'Remaining Balance:'}</span>
                    <span className="font-bold text-blue-600">₹{submissionSuccess.currentBalance}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenLivePreview}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/30 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{language === 'hi' ? 'स्टैम्प्ड Form 49A PDF देखें' : 'View Stamped Form 49A'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    {language === 'hi' ? 'समाप्त करें (Close)' : 'Done'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 1: APPLICATION CATEGORY & MODE */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{language === 'hi' ? 'चरण 1: आवेदन प्रकार एवं कार्ड मोड' : 'Step 1: Application Type & Card Mode'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'भारतीय नागरिक हेतु नया पैन कार्ड (Form 49A) व डिलीवरी माध्यम चुनें' 
                          : 'Select PAN Application Type and Delivery Mode for Indian Citizens'}
                      </p>
                    </div>

                    {/* Pricing Highlight Card */}
                    <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-500/40 shadow-xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2.5 py-0.5 rounded-full">
                            {isOperator ? '🏪 B2B दुकानदार / VLE दर' : '👤 B2C नागरिक पोर्टल दर'}
                          </span>
                          <h4 className="text-lg font-black mt-1">
                            ₹{mandatoryFee} <span className="text-xs font-normal text-slate-300">({language === 'hi' ? 'कुल सरकारी व सेवा शुल्क' : 'Total Govt & Service Fee'})</span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {language === 'hi' 
                              ? 'घर पर प्लास्टिक PVC कार्ड की डिलीवरी + ईमेल पर डिजिटल e-PAN' 
                              : 'Doorstep Plastic PVC Card Delivery + Digital e-PAN on Email'}
                          </p>
                        </div>

                        {/* Current Wallet Balance */}
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-right sm:text-right">
                          <span className="text-[10px] text-slate-300 block font-bold">
                            {language === 'hi' ? 'उपलब्ध वॉलेट बैलेंस' : 'Current Wallet Balance'}
                          </span>
                          <span className={`text-base font-black ${isInsufficientBalance ? 'text-rose-400' : 'text-emerald-300'}`}>
                            ₹{currentAvailableBalance}
                          </span>
                          {isInsufficientBalance && (
                            <span className="block text-[10px] font-bold text-rose-300">
                              ⚠️ ₹{mandatoryFee - currentAvailableBalance} {language === 'hi' ? 'कम है' : 'short'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mode Selection Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div 
                        onClick={() => setCardMode('physical_and_epan')}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                          cardMode === 'physical_and_epan' 
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'hi' ? 'फिजिकल पैन कार्ड + e-PAN (अनुशंसित)' : 'Physical PAN Card + e-PAN (Recommended)'}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {language === 'hi' 
                              ? 'घर के पते पर स्पीड पोस्ट द्वारा प्लास्टिक कार्ड प्राप्त होगा व ईमेल पर PDF।' 
                              : 'Physical card sent via Speed Post to address and e-PAN PDF to email.'}
                          </p>
                        </div>
                      </div>

                      <div 
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-850 flex items-start gap-3 cursor-not-allowed"
                        title="Form 49A mandates Physical PAN generation"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          —
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {language === 'hi' ? 'केवल e-PAN (डिजिटल)' : 'Only e-PAN (Digital Only)'}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {language === 'hi' 
                              ? 'फॉर्म 49A में फिजिकल कार्ड अनिवार्य रूप से सम्मिलित होता है।' 
                              : 'Physical dispatch is included by default for Form 49A.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 2: APPLICANT PERSONAL DETAILS */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{language === 'hi' ? 'चरण 2: आवेदक का व्यक्तिगत विवरण' : 'Step 2: Applicant Personal Details'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'नाम 10वीं मार्कशीट अथवा आधार कार्ड के अनुसार ही भरें' 
                          : 'Enter name strictly as per 10th marksheet or Aadhaar'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'उपाधि (Title)' : 'Title'} *
                        </label>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Shri">Shri (श्री - पुरुष)</option>
                          <option value="Smt">Smt (श्रीमती - विवाहित महिला)</option>
                          <option value="Kumari">Kumari (कुमारी - अविवाहित महिला)</option>
                          <option value="M/s">M/s (फर्म / अन्य)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'उपनाम / अंतिम नाम (Last Name)' : 'Last Name / Surname'} *
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value.toUpperCase())}
                          placeholder={language === 'hi' ? 'उपनाम दर्ज करें' : 'Enter Last Name'}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'प्रथम नाम (First Name)' : 'First Name'}
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                          placeholder={language === 'hi' ? 'प्रथम नाम दर्ज करें' : 'Enter First Name'}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'मध्य नाम (Middle Name)' : 'Middle Name'}
                        </label>
                        <input
                          type="text"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value.toUpperCase())}
                          placeholder={language === 'hi' ? 'मध्य नाम दर्ज करें' : 'Enter Middle Name'}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'लिंग (Gender)' : 'Gender'} *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Male', 'Female', 'Transgender'].map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGender(g)}
                              className={`py-2 rounded-xl text-xs font-bold border transition ${
                                gender === g 
                                  ? 'bg-blue-600 text-white border-blue-600' 
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {g === 'Male' ? 'पुरुष (Male)' : g === 'Female' ? 'महिला (Female)' : 'अन्य (Other)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'जन्म तिथि (Date of Birth)' : 'Date of Birth (DOB)'} *
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Parents Details Section */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        👨‍👩‍👧 {language === 'hi' ? 'माता-पिता का विवरण (Parents Details)' : "Parents' Details"}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {language === 'hi' ? 'पिता का अंतिम नाम (Father Last Name)' : "Father's Last Name"} *
                          </label>
                          <input
                            type="text"
                            value={fatherLastName}
                            onChange={(e) => setFatherLastName(e.target.value.toUpperCase())}
                            placeholder={language === 'hi' ? 'पिता का उपनाम दर्ज करें' : "Enter Father's Last Name"}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {language === 'hi' ? 'पिता का प्रथम नाम (Father First Name)' : "Father's First Name"}
                          </label>
                          <input
                            type="text"
                            value={fatherFirstName}
                            onChange={(e) => setFatherFirstName(e.target.value.toUpperCase())}
                            placeholder={language === 'hi' ? 'पिता का प्रथम नाम दर्ज करें' : "Enter Father's First Name"}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {language === 'hi' ? 'पिता का मध्य नाम (Father Middle Name)' : "Father's Middle Name"}
                          </label>
                          <input
                            type="text"
                            value={fatherMiddleName}
                            onChange={(e) => setFatherMiddleName(e.target.value.toUpperCase())}
                            placeholder=""
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {language === 'hi' ? 'माता का नाम (वैकल्पिक / Optional)' : "Mother's Name (Optional)"}
                          </label>
                          <input
                            type="text"
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value.toUpperCase())}
                            placeholder={language === 'hi' ? 'माता का नाम दर्ज करें' : "Enter Mother's Name"}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {language === 'hi' ? 'पैन कार्ड पर किसका नाम छपवाना चाहते हैं?' : 'Print on PAN Card'}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setCardParentChoice('father')}
                              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                                cardParentChoice === 'father'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {language === 'hi' ? 'पिता का नाम' : "Father's Name"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardParentChoice('mother')}
                              className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                                cardParentChoice === 'mother'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {language === 'hi' ? 'माता का नाम' : "Mother's Name"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 3: CONTACT & COMMUNICATION */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{language === 'hi' ? 'चरण 3: संपर्क व संचार विवरण' : 'Step 3: Contact & Communication Details'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'e-PAN PDF आपके दिए गए ईमेल पते पर 2-3 कार्यदिवसों में भेजा जाएगा' 
                          : 'e-PAN PDF will be dispatched directly to your given Email ID'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'मोबाइल नंबर (10-अंक)' : 'Mobile Number (10 Digits)'} *
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="XXXXXXXXXX"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-r-xl px-3 py-2 text-xs font-black tracking-widest focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {language === 'hi' ? 'SMS अपडेट व ट्रैकिंग इसी नंबर पर प्राप्त होंगे' : 'SMS alerts will be sent to this number'}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'ईमेल आईडी (e-PAN डिलीवरी हेतु)' : 'Email ID (for e-PAN delivery)'}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                          placeholder="applicant@example.com"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {language === 'hi' ? 'डिजिटल e-PAN PDF इसी मेल पर जारी होगा' : 'e-PAN PDF will arrive here'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 4: ADDRESS DETAILS */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{language === 'hi' ? 'चरण 4: निवास का पता (Residence Address)' : 'Step 4: Residence Address'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'स्पीड पोस्ट से फिजिकल कार्ड इसी पते पर डिलीवर किया जाएगा' 
                          : 'Physical PAN Card will be delivered to this postal address'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'मकान / कमरा संख्या (Flat/Door/Block No)' : 'Flat / Door / Block No'}
                        </label>
                        <input
                          type="text"
                          value={flat}
                          onChange={(e) => setFlat(e.target.value.toUpperCase())}
                          placeholder="e.g. SHOP NO 4 / H NO 12"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'भवन / परिसर / गांव (Premises/Building/Village)' : 'Premises / Building / Village'} *
                        </label>
                        <input
                          type="text"
                          value={premises}
                          onChange={(e) => setPremises(e.target.value.toUpperCase())}
                          placeholder="e.g. MAIN MARKET / RAMPUR"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'सड़क / गली / डाकघर (Road/Street/Post Office)' : 'Road / Street / Post Office'}
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value.toUpperCase())}
                          placeholder="e.g. STATION ROAD"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'क्षेत्र / मोहल्ला / तालुका (Area/Locality/Taluka)' : 'Area / Locality / Taluka'}
                        </label>
                        <input
                          type="text"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value.toUpperCase())}
                          placeholder="e.g. SADAR BAZAR"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'शहर / जिला (Town/City/District)' : 'Town / City / District'} *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value.toUpperCase())}
                          placeholder="e.g. BULANDSHAHAR"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'राज्य (State / Union Territory)' : 'State'} *
                        </label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                        >
                          {INDIAN_STATES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'पिनकोड (6-अंक)' : 'Pincode (6-Digit)'} *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="203001"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black tracking-widest focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 5: AO CODE SELECTION & SEARCH */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 5 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{language === 'hi' ? 'चरण 5: असेसिंग ऑफिसर (AO Code) चयन' : 'Step 5: Assessing Officer (AO Code) Selection'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? '708 भारतीय शहरों में से अपने शहर या जिले का नाम खोजें और AO कोड चुनें' 
                          : 'Search across 708 Indian cities to select your Assessing Officer Code'}
                      </p>
                    </div>

                    {/* Currently Selected AO Code Badge */}
                    <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 block">
                          ✓ {language === 'hi' ? 'वर्तमान में चयनित AO कोड' : 'Currently Selected AO Code'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                            {selectedAo.areaCode}
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                            {selectedAo.aoType}
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                            {selectedAo.rangeCode}
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                            {selectedAo.aoNumber}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {selectedAo.displayText || `${selectedAo.areaCode} ${selectedAo.aoType} ${selectedAo.rangeCode} ${selectedAo.aoNumber}`}
                      </span>
                    </div>

                    {/* Live Search Input over 708 cities */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={aoSearchQuery}
                        onChange={(e) => setAoSearchQuery(e.target.value)}
                        placeholder={language === 'hi' ? 'शहर का नाम या राज्य खोजें (जैसे Bulandshahar, Meerut, Delhi, Kanpur)...' : 'Search city or state (e.g. Bulandshahar, Mumbai, Patna)...'}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Results List */}
                    <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
                      {filteredAoCodes.map((item, idx) => {
                        const isMatch = selectedAo.areaCode === item.areaCode && selectedAo.aoNumber === item.aoNumber;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedAo({
                                areaCode: item.areaCode,
                                aoType: item.aoType,
                                rangeCode: item.rangeCode,
                                aoNumber: item.aoNumber,
                                displayText: item.display || `${item.state} (${item.city})`
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                              isMatch
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div>
                              <span className="font-bold">{item.city || item.display}</span>
                              <span className={`text-[10px] block ${isMatch ? 'text-blue-100' : 'text-slate-400'}`}>
                                {item.state}
                              </span>
                            </div>

                            <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-black/10">{item.areaCode}</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/10">{item.aoType}</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/10">{item.rangeCode}</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/10">{item.aoNumber}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 6: IDENTITY, ADDRESS & EXACT 16 NON-AADHAAR DOB PROOFS */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 6 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'hi' ? 'चरण 6: पहचान, पता एवं जन्मतिथि प्रमाण' : 'Step 6: Identity, Address & DOB Proofs'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'पहचान व पते हेतु आधार कार्ड, तथा जन्मतिथि हेतु 16 मान्य प्रमाणों में से एक चुनें' 
                          : 'Aadhaar for Identity & Address; select one of the exact 16 valid proofs for Date of Birth'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? '12-अंकीय आधार संख्या (Aadhaar Number)' : '12-Digit Aadhaar Number'} *
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder={language === 'hi' ? '12-अंकीय आधार संख्या दर्ज करें' : 'Enter 12-digit Aadhaar Number'}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black tracking-widest focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'hi' ? 'आधार कार्ड पर अंकित नाम' : 'Name as per Aadhaar'} *
                        </label>
                        <input
                          type="text"
                          value={nameOnAadhaar}
                          onChange={(e) => setNameOnAadhaar(e.target.value.toUpperCase())}
                          placeholder={language === 'hi' ? 'आधार कार्ड अनुसार पूरा नाम दर्ज करें' : 'Enter Name as per Aadhaar'}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Fixed POI & POA Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{language === 'hi' ? 'पहचान प्रमाण (Proof of Identity):' : 'Proof of Identity (POI):'}</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>आधार कार्ड (Aadhaar Card)</span>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500">{language === 'hi' ? 'पते का प्रमाण (Proof of Address):' : 'Proof of Address (POA):'}</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>आधार कार्ड (Aadhaar Card)</span>
                        </span>
                      </div>
                    </div>

                    {/* Exact 16 Non-Aadhaar DOB Proofs Dropdown */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-slate-900 dark:text-white">
                          {language === 'hi' ? 'जन्मतिथि प्रमाण पत्र (Proof of Date of Birth - सटीक 16 विकल्प)' : 'Proof of Date of Birth (Exact 16 Proofs)'} *
                        </label>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                          16 Official Options
                        </span>
                      </div>

                      <select
                        value={dobProof}
                        onChange={(e) => setDobProof(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                      >
                        {EXACT_16_DOB_PROOFS.map((p, idx) => (
                          <option key={p.id} value={p.label}>
                            {idx + 1}. {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 7: PHOTO, DIGITAL TOUCH SIGNATURE CANVAS & DOCUMENTS */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 7 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-600" />
                        <span>{language === 'hi' ? 'चरण 7: फोटो एवं डिजिटल टच/स्टाइलस हस्ताक्षर' : 'Step 7: Photo & Digital Touch Signature Canvas'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'पासपोर्ट फोटो अपलोड करें और स्क्रीन पर उंगली/स्टाइलस पेन से डिजिटल हस्ताक्षर बनाएं' 
                          : 'Upload passport photo & draw signature directly using touch, stylus pen, or mouse'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Photo Upload Box */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          📸 {language === 'hi' ? 'पासपोर्ट साइज फोटो (Photo)' : 'Passport Photograph'} *
                        </span>

                        <div className="flex items-center gap-4">
                          <div className="w-24 h-28 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {photoPreview ? (
                              <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-slate-400 text-center px-1">
                                3.5×2.5cm
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 flex-1">
                            <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{language === 'hi' ? 'फोटो अपलोड करें' : 'Upload Photo'}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                            <span className="block text-[10px] text-slate-400">
                              JPG/PNG, Max 2MB. Color photograph.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Signature Mode Selector & Canvas */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            ✍️ {language === 'hi' ? 'आवेदक के हस्ताक्षर (Signature)' : 'Applicant Signature'} *
                          </span>
                          
                          {/* Method Selector Tabs */}
                          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setSignMethod('canvas')}
                              className={`px-2 py-0.5 rounded-md transition ${
                                signMethod === 'canvas' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600' : 'text-slate-600'
                              }`}
                            >
                              {language === 'hi' ? 'डिजिटल टच' : 'Touch Canvas'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignMethod('upload')}
                              className={`px-2 py-0.5 rounded-md transition ${
                                signMethod === 'upload' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600' : 'text-slate-600'
                              }`}
                            >
                              {language === 'hi' ? 'अपलोड' : 'Upload File'}
                            </button>
                          </div>
                        </div>

                        {signMethod === 'canvas' ? (
                          <div className="space-y-2">
                            <div className="relative border-2 border-indigo-300 dark:border-indigo-800 rounded-xl overflow-hidden bg-white shadow-inner">
                              <canvas
                                ref={canvasRef}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                className="w-full h-28 touch-none cursor-crosshair block"
                              />
                              {!hasCanvasDrawn && !signPreview && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                                  ✍️ {language === 'hi' ? 'यहां उंगली या स्टाइलस से साइन करें' : 'Draw signature with touch / stylus / mouse here'}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleUndoCanvas}
                                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>{language === 'hi' ? 'पूर्ववत' : 'Undo'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleClearCanvas}
                                  className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{language === 'hi' ? 'मिटाएं' : 'Clear'}</span>
                                </button>
                              </div>

                              {signPreview && (
                                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{language === 'hi' ? 'हस्ताक्षर सुरक्षित' : 'Captured'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-32 h-20 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              {signPreview ? (
                                <img src={signPreview} alt="Sign" className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="text-[11px] text-slate-400 text-center px-1">
                                  Sign Preview
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 flex-1">
                              <label className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{language === 'hi' ? 'फ़ाइल चुनें' : 'Choose File'}</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={handleSignatureUpload}
                                  className="hidden"
                                />
                              </label>
                              <span className="block text-[10px] text-slate-400">
                                JPG/PNG, Max 2MB. Clear white background.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Additional Documents Attachment (Aadhaar & DOB Proof PDF/Image) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            📄 {language === 'hi' ? 'आधार कार्ड प्रति (PDF या इमेज)' : 'Aadhaar Document (PDF/Image)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {aadhaarDocName || (language === 'hi' ? 'फ़ाइल संलग्न नहीं' : 'No file attached')}
                          </span>
                        </div>
                        <label className="bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer shadow-2xs">
                          <span>{language === 'hi' ? 'अपलोड' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={handleAadhaarDocUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            📄 {language === 'hi' ? 'जन्मतिथि प्रमाण प्रति (DOB Proof)' : 'DOB Proof Document'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
                            {dobDocName || (language === 'hi' ? 'फ़ाइल संलग्न नहीं' : 'No file attached')}
                          </span>
                        </div>
                        <label className="bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1 rounded-lg text-xs cursor-pointer shadow-2xs">
                          <span>{language === 'hi' ? 'अपलोड' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={handleDobDocUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* STEP 8: SUMMARY REVIEW & STAMPED FORM 49A SUBMISSION */}
                {/* ═════════════════════════════════════════════════════════════ */}
                {currentStep === 8 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'hi' ? 'चरण 8: अंतिम समीक्षा एवं डिजिटल स्टैम्पिंग' : 'Step 8: Final Review & Digital Stamping'}</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'hi' 
                          ? 'सभी विवरण जांचें और फॉर्म 49A पूर्वावलोकन देखें' 
                          : 'Verify all details and review digitally stamped Form 49A'}
                      </p>
                    </div>

                    {/* Summary Details Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'आवेदक का नाम:' : 'Applicant Name:'}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{title} {firstName} {middleName} {lastName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'जन्म तिथि:' : 'Date of Birth:'}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{dob}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'लिंग:' : 'Gender:'}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{gender}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'पिता का नाम:' : "Father's Name:"}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{fatherFirstName} {fatherLastName}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">+91 {mobile}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'आधार संख्या:' : 'Aadhaar Number:'}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{aadhaarNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'AO कोड:' : 'AO Code:'}</span>
                          <span className="font-mono font-bold text-blue-600">{selectedAo.areaCode} {selectedAo.aoType} {selectedAo.rangeCode} {selectedAo.aoNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'जन्मतिथि प्रमाण:' : 'DOB Proof:'}</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">{dobProof}</span>
                        </div>
                      </div>

                      <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                        <span className="text-slate-400 block text-[10px]">{language === 'hi' ? 'पत्राचार का पता:' : 'Communication Address:'}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {[flat, premises, street, locality, city, state, pincode].filter(Boolean).join(', ')}
                        </span>
                      </div>

                      {/* Photo & Signature Thumbnails */}
                      <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">{language === 'hi' ? 'फोटो:' : 'Photo:'}</span>
                          {photoPreview && (
                            <img src={photoPreview} alt="Thumb" className="w-8 h-10 object-cover rounded border border-slate-300" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px]">{language === 'hi' ? 'हस्ताक्षर:' : 'Signature:'}</span>
                          {signPreview && (
                            <img src={signPreview} alt="Thumb" className="w-16 h-8 object-contain rounded border border-slate-300 bg-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preview Button Action Bar */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                          {language === 'hi' 
                            ? '100% डिजिटल स्टैम्प्ड फॉर्म 49A तैयार है' 
                            : '100% Digital Stamped Form 49A Ready'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenLivePreview}
                        disabled={generatingPreview}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        {generatingPreview ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span>{generatingPreview ? 'तैयार हो रहा है...' : (language === 'hi' ? 'Form 49A PDF पूर्वावलोकन' : 'Preview Form 49A PDF')}</span>
                      </button>
                    </div>

                    {/* Financial Summary & Wallet Debit Confirmation */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{language === 'hi' ? 'आवेदन शुल्क (Wallet Debit):' : 'Application Fee:'}</span>
                        <span className="font-black text-amber-300 text-sm">₹{mandatoryFee}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{language === 'hi' ? 'वर्तमान वॉलेट बैलेंस:' : 'Current Balance:'}</span>
                        <span className="font-bold text-slate-200">₹{currentAvailableBalance}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2">
                        <span className="text-slate-400">{language === 'hi' ? 'कटौती उपरांत शेष बैलेंस:' : 'Balance After Deduction:'}</span>
                        <span className={`font-black ${isInsufficientBalance ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ₹{Math.max(0, currentAvailableBalance - mandatoryFee)}
                        </span>
                      </div>
                    </div>

                    {/* Legal Checkbox */}
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        defaultChecked
                        required
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        {language === 'hi' 
                          ? 'मैं प्रमाणित करता/करती हूँ कि फॉर्म 49A में दी गई सभी जानकारी पूर्णतः सत्य है। आयकर अधिनियम 1961 के अंतर्गत पैन आवंटन हेतु सहमति प्रदान करता/करती हूँ।' 
                          : 'I declare that the information stated above is true to the best of my knowledge and belief under Section 139A of the Income Tax Act, 1961.'}
                      </span>
                    </label>
                  </div>
                )}
              </>
            )}

          </div>

          {/* Modal Bottom Controls / Navigation */}
          {!submissionSuccess && (
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'hi' ? 'पिछला' : 'Back'}</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <span>{language === 'hi' ? 'आगे बढ़ें' : 'Next Step'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || isInsufficientBalance}
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black px-7 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? 'फॉर्म प्रोसेस हो रहा है...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'hi' ? `₹${mandatoryFee} भुगतान व आवेदन जमा करें` : `Pay ₹${mandatoryFee} & Submit`}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Form 49A Preview Modal */}
      <Form49APreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        pdfBlob={previewPdfBlob}
        pdfDataUrl={previewPdfDataUrl}
        applicationData={{
          id: 'PAN-PREVIEW',
          personal: { firstName, lastName },
          aoCode: selectedAo
        }}
        theme={theme}
      />
    </>
  );
}
