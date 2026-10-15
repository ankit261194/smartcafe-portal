import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, User, Phone, CheckCircle2, 
  AlertCircle, ShieldCheck, QrCode, ArrowLeft,
  Clock, Sparkles, X, Check, Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { authFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function VleKycModal({ 
  isOpen, 
  onClose, 
  onKycSubmitted, 
  settings,
  onActivationLogin 
}) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Details, 2: ₹299 Locked QR + UTR, 3: Pending / Approved
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const pollTimerRef = useRef(null);

  const superAdminUpi = settings?.superAdminUpiId || '8006518960@pthdfc';

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg('');
      setUtrNumber('');
      setIsApproved(false);
      setSubmittedData(null);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen]);

  // Polling for admin approval in Step 3
  useEffect(() => {
    if (step === 3 && submittedData && !isApproved) {
      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await authFetch(`/api/kyc/status/${submittedData.phone}?_t=${Date.now()}`);
          const data = await res.json();
          if (data && data.status === 'approved' && data.cafe) {
            setIsApproved(true);
            clearInterval(pollTimerRef.current);
            try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
            setTimeout(() => {
              if (onActivationLogin) {
                onActivationLogin(data.cafe);
              }
              onClose();
            }, 2500);
          }
        } catch (e) {
          console.error('KYC Polling error:', e);
        }
      }, 3000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [step, submittedData, isApproved]);

  if (!isOpen) return null;

  const handleNextToQr = (e) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया संचालक का नाम दर्ज करें।' : 'Please enter owner name.');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें।' : 'Please enter 10-digit mobile number.');
      return;
    }
    if (!shopName.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया दुकान या कैफे का नाम दर्ज करें।' : 'Please enter shop name.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg(language === 'hi' ? 'कृपया ठीक 12 अंकों का वैध UTR नंबर दर्ज करें।' : 'Please enter valid 12-digit UTR.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('ownerName', ownerName.trim());
      formData.append('phone', phone.trim());
      formData.append('shopName', shopName.trim());
      formData.append('utr', cleanUtr);
      formData.append('vleId', `VLE-${phone.trim().slice(-4)}`);
      formData.append('email', `${phone.trim()}@csc.gov.in`);
      formData.append('state', 'उत्तर प्रदेश');
      formData.append('city', 'स्मार्ट सिटी');

      const res = await authFetch('/api/kyc/apply', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedData({
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          shopName: shopName.trim(),
          utr: cleanUtr
        });
        if (data.isAutoActivate && data.cafe) {
          setIsApproved(true);
          try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
          setTimeout(() => {
            if (onActivationLogin) onActivationLogin(data.cafe);
            onClose();
          }, 2200);
        } else {
          setStep(3);
          if (onKycSubmitted) onKycSubmitted();
        }
      } else {
        setErrorMsg(data.error || 'KYC आवेदन सबमिट करने में विफल।');
      }
    } catch (err) {
      setErrorMsg('सर्वर से जुड़ने में समस्या आई।');
    } finally {
      setSubmitting(false);
    }
  };

  const upiQrString = `upi://pay?pa=${superAdminUpi}&pn=SmartCafe%20VLE%20Portal&am=299&cu=INR&tn=VLE299`;

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(superAdminUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button 
                type="button" 
                onClick={() => { setStep(1); setErrorMsg(''); }}
                className="hover:bg-white/20 p-1 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Building2 className="w-4.5 h-4.5 text-yellow-200" />
            <h3 className="font-black text-sm">
              {step === 1 ? (language === 'hi' ? 'दुकानदार VLE साइनअप (₹299)' : 'VLE Registration (₹299)') :
               step === 2 ? (language === 'hi' ? '₹299 सदस्यता QR' : '₹299 Membership QR') :
               (language === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status')}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white font-black text-lg p-1 leading-none rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Modal Body (Zero Scroll Guaranteed) */}
        <div className="p-4 space-y-3.5 text-xs text-slate-800 dark:text-slate-100">
          
          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SHOPKEEPER BASIC DETAILS */}
          {step === 1 && (
            <form onSubmit={handleNextToQr} className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>वार्षिक प्रो सदस्यता शुल्क मात्र <strong>₹299 / 365 दिन</strong></span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {language === 'hi' ? 'संचालक का नाम (Owner Name)' : 'Owner Name'}
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="जैसे अंकित चौधरी"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {language === 'hi' ? 'मोबाइल नंबर (10-अंक)' : 'Mobile Number (10 digits)'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="8006518960"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {language === 'hi' ? 'दुकान / साइबर कैफे का नाम' : 'Shop / Cyber Cafe Name'}
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="जैसे स्मार्ट जन सेवा केंद्र"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-2.5 rounded-2xl text-sm shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{language === 'hi' ? '₹299 सदस्यता QR देखें ➔' : 'View ₹299 QR Code ➔'}</span>
              </button>
            </form>
          )}

          {/* STEP 2: ₹299 DYNAMIC QR + 12-DIGIT UTR INPUT */}
          {step === 2 && (
            <form onSubmit={handleSubmitUtr} className="space-y-3">
              {/* Centered Compact QR Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-1.5">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                  <QRCodeSVG
                    value={upiQrString}
                    size={160}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>PhonePe / GPay / Paytm से </span>
                  <span className="font-black text-orange-600 dark:text-orange-400">₹299</span>
                  <span> स्कैन करके पे करें</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-[10px] text-slate-500 hover:text-orange-600 font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>UPI: {superAdminUpi}</span>
                  {copiedUpi ? <Check className="w-3 h-3 text-orange-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Single 12-digit UTR Input Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>{language === 'hi' ? '12-अंकीय UPI UTR (संदर्भ संख्या) दर्ज करें:' : 'Enter 12-Digit UPI UTR:'}</span>
                  <span className="text-[10px] font-mono text-slate-400">{utrNumber.length}/12</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="जैसे 4123XXXXXXXX"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-orange-500/70 focus:border-orange-600 rounded-xl px-3 py-2 font-mono font-black text-sm tracking-widest text-slate-900 dark:text-white text-center focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              {/* Submit UTR Button */}
              <button
                type="submit"
                disabled={submitting || utrNumber.length !== 12}
                className={`w-full py-2.5 rounded-2xl font-black text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 ${
                  utrNumber.length === 12 && !submitting
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white cursor-pointer'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <span>{language === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...'}</span>
                ) : (
                  <span>{language === 'hi' ? 'सत्यापन के लिए भेजें ➔' : 'Submit for Verification ➔'}</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: PENDING STATUS / APPROVAL NOTIFICATION */}
          {step === 3 && (
            <div className="text-center py-4 space-y-3">
              {isApproved ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {language === 'hi' ? '✅ बधाई! आपका खाता सत्यापित हो गया!' : '✅ VLE Account Verified!'}
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {submittedData?.shopName} का ऑपरेटर काउंटर खोला जा रहा है...
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'hi' ? '⏳ सदस्यता सत्यापन लंबित' : '⏳ VLE Verification Pending'}
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-mono space-y-0.5">
                    <div>दुकान: <strong className="text-orange-600">{submittedData?.shopName}</strong></div>
                    <div>UTR: <strong className="text-slate-900 dark:text-white">{submittedData?.utr}</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {language === 'hi' 
                      ? 'व्यवस्थापक द्वारा UTR की पुष्टि होते ही आपका ऑपरेटर काउंटर तुरंत खुल जाएगा।'
                      : 'Operator counter will unlock automatically upon admin confirmation.'}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 underline"
                  >
                    {language === 'hi' ? 'पृष्ठभूमि में चलने दें (बंद करें)' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
