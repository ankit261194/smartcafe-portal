import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, IndianRupee, ArrowLeft, CheckCircle2, 
  QrCode, Clock, AlertCircle, Sparkles, X, Check, Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { authFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function CustomerWalletModal({ 
  isOpen, 
  onClose, 
  currentPhone = '', 
  shopUpi = '8006518960@pthdfc',
  selectedCafe,
  onBalanceUpdated
}) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Amount, 2: Locked QR + UTR, 3: Pending / Approved
  const [phone, setPhone] = useState(currentPhone || localStorage.getItem('customer_phone') || '');
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('200');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedTxn, setSubmittedTxn] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const pollTimerRef = useRef(null);

  const effectiveUpi = selectedCafe?.upiId || shopUpi || '8006518960@pthdfc';

  const fetchWallet = async (p) => {
    const targetPhone = p || phone || currentPhone || localStorage.getItem('customer_phone') || '';
    if (!targetPhone) return;
    try {
      const res = await authFetch(`/api/wallet/${targetPhone}?_t=${Date.now()}`);
      const data = await res.json();
      setWallet(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg('');
      setUtrNumber('');
      setIsApproved(false);
      setSubmittedTxn(null);
      const p = currentPhone || localStorage.getItem('customer_phone') || '';
      setPhone(p);
      if (p) fetchWallet(p);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, currentPhone]);

  // Polling for approval in Step 3
  useEffect(() => {
    if (step === 3 && submittedTxn && !isApproved) {
      pollTimerRef.current = setInterval(async () => {
        try {
          const p = phone || currentPhone;
          if (!p) return;
          const res = await authFetch(`/api/wallet/utr-status/${p}?_t=${Date.now()}`);
          const utrs = await res.json();
          const match = Array.isArray(utrs) && utrs.find(u => u.utr === submittedTxn.utr);
          if (match && (match.status === 'approved' || match.status === 'auto_approved')) {
            setIsApproved(true);
            clearInterval(pollTimerRef.current);
            try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
            if (onBalanceUpdated) onBalanceUpdated();
            fetchWallet(p);
            setTimeout(() => {
              onClose();
            }, 2500);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [step, submittedTxn, isApproved]);

  if (!isOpen) return null;

  const currentBal = wallet?.balance ?? 0;

  const handleNextToQr = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      setErrorMsg(language === 'hi' ? 'कृपया न्यूनतम ₹10 दर्ज करें।' : 'Please enter minimum ₹10.');
      return;
    }
    if (!phone || !/^\d{10}$/.test(phone.trim())) {
      setErrorMsg(language === 'hi' ? 'कृपया 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter 10-digit mobile number.');
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
      const res = await authFetch('/api/wallet/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          amount: parseFloat(amount),
          utr: cleanUtr,
          cafeId: selectedCafe?.id || 'CAFE-101'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedTxn({ amount: parseFloat(amount), utr: cleanUtr });
        if (data.autoApproved) {
          setIsApproved(true);
          try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
          if (onBalanceUpdated) onBalanceUpdated();
          fetchWallet(phone);
          setTimeout(() => onClose(), 2200);
        } else {
          setStep(3);
        }
      } else {
        setErrorMsg(data.error || 'UTR सबमिट करने में विफल।');
      }
    } catch (err) {
      setErrorMsg('सर्वर से जुड़ने में समस्या आई।');
    } finally {
      setSubmitting(false);
    }
  };

  const upiQrString = `upi://pay?pa=${effectiveUpi}&pn=SmartCafe&am=${parseFloat(amount || 0)}&cu=INR&tn=WalletTopup`;

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(effectiveUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between shadow-xs">
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
            <Wallet className="w-4.5 h-4.5 text-amber-300" />
            <h3 className="font-black text-sm">
              {step === 1 ? (language === 'hi' ? 'वॉलेट रिचार्ज' : 'Wallet Recharge') :
               step === 2 ? (language === 'hi' ? `₹${amount} का भुगतान करें` : `Pay ₹${amount}`) :
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

          {/* STEP 1: ENTER AMOUNT */}
          {step === 1 && (
            <form onSubmit={handleNextToQr} className="space-y-3">
              {/* Balance Badge */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-bold">{language === 'hi' ? 'वर्तमान बैलेंस:' : 'Current Balance:'}</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">₹{currentBal}</span>
              </div>

              {/* Mobile Input if not present */}
              {!currentPhone && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {language === 'hi' ? 'मोबाइल नंबर (10-अंक)' : 'Mobile Number (10 digits)'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="8006518960"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {language === 'hi' ? 'कितने पैसे जोड़ने हैं? (रुपये दर्ज करें)' : 'Amount to Add (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="200"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 font-mono font-black text-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {['100', '200', '500', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-1.5 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      amount === val 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    +₹{val}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-2.5 rounded-2xl text-sm shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{language === 'hi' ? 'आगे बढ़ें (QR कोड देखें) ➔' : 'Proceed (View QR) ➔'}</span>
              </button>
            </form>
          )}

          {/* STEP 2: LOCKED DYNAMIC QR + 12-DIGIT UTR INPUT */}
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
                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{amount}</span>
                  <span> स्कैन करें</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-[10px] text-slate-500 hover:text-emerald-600 font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>UPI ID: {effectiveUpi}</span>
                  {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
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
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/70 focus:border-emerald-600 rounded-xl px-3 py-2 font-mono font-black text-sm tracking-widest text-slate-900 dark:text-white text-center focus:outline-none"
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
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer'
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
                    {language === 'hi' ? '✅ भुगतान स्वीकृत!' : '✅ Payment Approved!'}
                  </h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    ₹{submittedTxn?.amount} आपके वॉलेट में जुड़ चुके हैं।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'hi' ? '⏳ भुगतान सत्यापन लंबित' : '⏳ Verification Pending'}
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-mono space-y-0.5">
                    <div>राशि: <strong className="text-emerald-600">₹{submittedTxn?.amount}</strong></div>
                    <div>UTR: <strong className="text-slate-900 dark:text-white">{submittedTxn?.utr}</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {language === 'hi' 
                      ? 'व्यवस्थापक द्वारा बैंक कन्फर्म होते ही राशि स्वतः आपके वॉलेट में जुड़ जाएगी। यह विंडो स्वतः अपडेट होगी।'
                      : 'Amount will be added automatically once confirmed by admin.'}
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
