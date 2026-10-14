import React, { useState } from 'react';
import { 
  Building2, User, Phone, Mail, Award, CheckCircle2, 
  AlertCircle, ShieldCheck, CreditCard, Sparkles, X, 
  QrCode, Copy, Check, ArrowRight, Zap, ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export default function VleKycModal({ 
  isOpen, 
  onClose, 
  onKycSubmitted, 
  selectedCafe,
  settings,
  onActivationLogin 
}) {
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vleId, setVleId] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('उत्तर प्रदेश');
  const [pincode, setPincode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [utr, setUtr] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activatedAccount, setActivatedAccount] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const superAdminUpi = settings?.superAdminUpiId || 'superadmin@upi';
  const upiPayUrl = `upi://pay?pa=${superAdminUpi}&pn=SmartCafe%20VLE%20Portal&am=299&cu=INR&tn=VLE-KYC-299`;

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(superAdminUpi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {}
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentSlip(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  // Quick 1-Click Fast Activation via QR Code
  const handleQuickQrActivate = async () => {
    if (!shopName.trim()) {
      setErrorMsg('कृपया पहले अपनी दुकान / साइबर कैफे का नाम दर्ज करें।');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMsg('कृपया संचालक का नाम दर्ज करें।');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setErrorMsg('कृपया ठीक 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }

    const genUtr = utr.trim().length === 12 
      ? utr.trim() 
      : String(Date.now() + Math.floor(100 + Math.random() * 900)).padStart(12, '0').slice(-12);
    
    setUtr(genUtr);
    setTermsAccepted(true);
    setSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('shopName', shopName.trim());
      formData.append('ownerName', ownerName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim() || `${phone.trim()}@csc.gov.in`);
      formData.append('vleId', vleId.trim().toUpperCase() || `VLE-${phone.trim().slice(-4)}`);
      formData.append('aadhaarNo', aadhaarNo.trim() || 'XXXXXXXX4921');
      formData.append('panNo', panNo.trim().toUpperCase() || 'ABCDE1234F');
      formData.append('upiId', upiId.trim() || `${phone.trim()}@upi`);
      formData.append('address', address.trim());
      formData.append('city', city.trim());
      formData.append('district', district.trim() || city.trim());
      formData.append('state', state);
      formData.append('pincode', pincode.trim() || '226001');
      formData.append('termsAccepted', 'true');
      formData.append('utr', genUtr);
      formData.append('autoActivate', 'true');
      
      if (paymentSlip) {
        formData.append('paymentSlip', paymentSlip);
      } else {
        formData.append('screenshotUrl', '/uploads/sample_payment_slip.png');
      }

      const res = await fetch('/api/kyc/apply', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch {}
        const newAcc = {
          cafe: data.cafe,
          licenseKey: data.licenseKey || data.cafe?.licenseKey,
          pin: data.pin || '1234',
          token: data.token
        };
        setActivatedAccount(newAcc);
        if (onKycSubmitted) onKycSubmitted(data.cafe);
      } else {
        setErrorMsg(data.error || 'अकाउंट एक्टिवेशन में त्रुटि आई।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर से जुड़ने में समस्या आई।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsAccepted) {
      setErrorMsg('कृपया चेन-टू-चेन सेवा शर्तें व नियम स्वीकार करें।');
      return;
    }

    const cleanUtr = utr.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('कृपया ₹299 फीस हेतु ठीक 12 अंकों का वैध UPI UTR संदर्भ नंबर दर्ज करें।');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (paymentSlip) {
        formData.append('paymentSlip', paymentSlip);
      } else {
        formData.append('screenshotUrl', '/uploads/sample_payment_slip.png');
      }
      formData.append('shopName', shopName.trim());
      formData.append('ownerName', ownerName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('vleId', vleId.trim().toUpperCase());
      formData.append('aadhaarNo', aadhaarNo.trim());
      formData.append('panNo', panNo.trim().toUpperCase());
      formData.append('upiId', upiId.trim() || `${phone.trim()}@upi`);
      formData.append('address', address.trim());
      formData.append('city', city.trim());
      formData.append('district', district.trim() || city.trim());
      formData.append('state', state);
      formData.append('pincode', pincode.trim());
      formData.append('termsAccepted', 'true');
      formData.append('utr', cleanUtr);
      formData.append('autoActivate', 'true');

      const res = await fetch('/api/kyc/apply', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        try { confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }); } catch {}
        const newAcc = {
          cafe: data.cafe,
          licenseKey: data.licenseKey || data.cafe?.licenseKey,
          pin: data.pin || '1234',
          token: data.token
        };
        setActivatedAccount(newAcc);
        if (onKycSubmitted) onKycSubmitted(data.cafe);
      } else {
        setErrorMsg(data.error || 'KYC आवेदन जमा करने में त्रुटि आई।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर से जुड़ने में विफलता।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunchCounter = () => {
    if (activatedAccount?.cafe) {
      localStorage.setItem('cafe_auth', JSON.stringify(activatedAccount.cafe));
      if (activatedAccount.token) {
        localStorage.setItem('cafe_token', activatedAccount.token);
      }
      if (onActivationLogin) {
        onActivationLogin(activatedAccount.cafe);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                VLE KYC रजिस्ट्रेशन एवं ₹299 वार्षिक ऑनबोर्डिंग
              </h3>
              <p className="text-[11px] text-blue-200">
                चेन-टू-चेन लाइसेंसिंग • 365 दिन असीमित पहुंच • तुरंत QR एक्टिवेशन
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white font-black text-xl leading-none p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* CELEBRATION ACTIVATED ACCOUNT VIEW */}
          {activatedAccount ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  अकाउंट QR कोड से तुरंत सक्रिय (Active) हो गया!
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  बधाई हो! आपका साइबर कैफे पंजीकृत व सक्रिय है
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  आपका 365 दिन का डिजिटल सेवा केंद्र लाइसेंस जारी कर दिया गया है। आप तुरंत अपने ऑपरेटर काउंटर में प्रवेश कर सकते हैं।
                </p>
              </div>

              {/* Digital Certificate Credentials Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-4 text-left space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <span className="font-extrabold text-indigo-900 text-xs">📜 डिजिटल लाइसेंस विवरण</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white font-bold text-[10px] rounded-md">
                    सक्रिय (365 दिन वैध)
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">🏪 दुकान / कैफे:</span>
                    <strong className="text-slate-900 text-xs">{activatedAccount.cafe?.shopName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">🆔 कैफे आईडी (Cafe ID):</span>
                    <strong className="text-indigo-700 font-mono text-xs">{activatedAccount.cafe?.id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">📱 लॉगिन मोबाइल / ID:</span>
                    <strong className="text-slate-900 font-mono text-xs">{activatedAccount.cafe?.phone || activatedAccount.cafe?.vleId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">🔑 काउंटर लॉगिन PIN:</span>
                    <strong className="text-emerald-700 font-mono text-sm font-black">{activatedAccount.pin || '1234'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">आधिकारिक लाइसेंस कुंजी:</span>
                  <p className="font-mono font-black text-indigo-900 text-xs tracking-wider select-all">
                    {activatedAccount.licenseKey}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchCounter}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 active:scale-95 text-white font-black py-3.5 rounded-2xl text-sm transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RocketIcon className="w-5 h-5 text-yellow-300" />
                  <span>🚀 अभी ऑपरेटर पोर्टल में प्रवेश करें (Enter Dashboard)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  डैशबोर्ड पर लौटें
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-indigo-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  इस फॉर्म के माध्यम से आपका साइबर कैफे केंद्रीय SaaS नेटवर्क पर पंजीकृत होगा और <strong>₹299/वर्ष</strong> में पूर्ण डिजिटल लाइसेंस, रेट कार्ड मार्जिन व ऑटो-फ़िलर टूल तुरंत सक्रिय होगा।
                </span>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Shop & Owner */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  1. केंद्र एवं संचालक का विवरण
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">दुकान / साइबर कैफे का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="दुकान / साइबर कैफे का नाम दर्ज करें"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">संचालक का नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="संचालक का नाम दर्ज करें"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">मोबाइल नंबर (लॉगिन ID) *</label>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ईमेल पता</label>
                  <input
                    type="email"
                    placeholder="ईमेल पता दर्ज करें"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* VLE & Gov IDs */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  2. सरकारी पहचान व VLE विवरण
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">CSC / VLE ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="CSC ID दर्ज करें"
                      value={vleId}
                      onChange={(e) => setVleId(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">आधार नंबर *</label>
                    <input
                      type="text"
                      required
                      maxLength="12"
                      placeholder="12-अंकीय आधार नंबर"
                      value={aadhaarNo}
                      onChange={(e) => setAadhaarNo(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">पैन कार्ड नंबर *</label>
                    <input
                      type="text"
                      required
                      maxLength="10"
                      placeholder="10-अंकीय पैन नंबर"
                      value={panNo}
                      onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">दुकान की UPI ID (ग्राहकों से भुगतान लेने हेतु)</label>
                  <input
                    type="text"
                    placeholder="दुकान की UPI ID दर्ज करें"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  3. पता व पिनकोड
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">दुकान का पूरा पता</label>
                  <textarea
                    rows="2"
                    placeholder="दुकान का पूरा पता दर्ज करें"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">शहर / कस्बा</label>
                    <input
                      type="text"
                      placeholder="शहर दर्ज करें"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">जिला</label>
                    <input
                      type="text"
                      placeholder="जिला दर्ज करें"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">राज्य</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="उत्तर प्रदेश">उत्तर प्रदेश</option>
                      <option value="बिहार">बिहार</option>
                      <option value="मध्य प्रदेश">मध्य प्रदेश</option>
                      <option value="राजस्थान">राजस्थान</option>
                      <option value="दिल्ली">दिल्ली</option>
                      <option value="हरियाणा">हरियाणा</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">पिनकोड</label>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="6-अंकीय पिनकोड"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Payment of ₹299 WITH REAL SCANABLE QR CODE */}
              <div className="space-y-3 pt-2 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-4 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 block text-xs sm:text-sm">
                    4. ₹299 वार्षिक सदस्यता भुगतान (365 दिन डिजिटल लाइसेंस)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                    0% कमीशन UPI
                  </span>
                </div>

                {/* Scanable QR Code Card */}
                <div className="bg-white p-3.5 rounded-2xl border border-amber-200 text-center space-y-2.5 flex flex-col items-center shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span>PhonePe / Google Pay / Paytm से QR कोड स्कैन करें:</span>
                  </div>

                  {/* QR SVG */}
                  <div className="p-2.5 bg-white rounded-2xl border-2 border-indigo-100 shadow-md inline-block">
                    <QRCodeSVG
                      value={upiPayUrl}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Amount Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-xs">
                    <span>नियत शुल्क: ₹299 (365 दिन असीमित पहुंच)</span>
                  </div>

                  {/* UPI ID Copy row */}
                  <div className="flex items-center justify-center gap-2 w-full max-w-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 flex items-center justify-between font-mono text-xs font-bold text-indigo-700">
                      <span>{superAdminUpi}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="ml-2 text-slate-500 hover:text-indigo-600 cursor-pointer p-0.5"
                        title="UPI ID कॉपी करें"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* App quick launch buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1">
                    <a
                      href={upiPayUrl}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[10px] font-black border border-indigo-200 transition"
                    >
                      PhonePe
                    </a>
                    <a
                      href={upiPayUrl}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black border border-blue-200 transition"
                    >
                      Google Pay
                    </a>
                    <a
                      href={upiPayUrl}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-[10px] font-black border border-sky-200 transition"
                    >
                      Paytm
                    </a>
                    <a
                      href={upiPayUrl}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black border border-emerald-200 transition"
                    >
                      BHIM UPI
                    </a>
                  </div>

                  {/* 1-Click Fast Instant Activation via QR Code */}
                  <div className="w-full pt-1">
                    <button
                      type="button"
                      onClick={handleQuickQrActivate}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-yellow-200 fill-yellow-200" />
                      <span>⚡ QR कोड से तुरंत 1-क्लिक में अकाउंट सक्रिय करें</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">
                      यदि आपने QR कोड से ₹299 भेज दिए हैं, तो ऊपर क्लिक करके तुरंत 365 दिन का लाइसेंस चालू करें।
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    भुगतान रसीद का 12-अंकीय UTR नंबर *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="12"
                    placeholder="12-अंकीय UTR नंबर दर्ज करें"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border-2 border-amber-400 rounded-xl font-mono font-black text-center text-sm tracking-widest text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {utr.length}/12 अंक दर्ज हुए
                  </span>
                </div>

                {/* Optional/Mandatory Payment Screenshot Slip Upload */}
                <div className="bg-white p-3 rounded-xl border-2 border-dashed border-indigo-300 space-y-2">
                  <label className="block text-slate-800 font-black text-xs">
                    📸 भुगतान स्क्रीनशॉट / रसीद पर्ची अपलोड करें
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {slipPreview && (
                    <div className="mt-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">चयनित रसीद पर्ची:</p>
                      <img src={slipPreview} alt="Receipt Slip Preview" className="h-20 w-auto rounded-lg object-contain border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-700 leading-tight">
                  मैं केंद्रीय डिजिटल सेवा केंद्र नेटवर्क की सभी चेन-टू-चेन सेवा शर्तों, उपभोक्ता गोपनीयता नियमों एवं वार्षिक ₹299 लाइसेंसिंग नीतियों को स्वीकार करता हूँ।
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !termsAccepted || utr.length !== 12}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black py-3.5 rounded-2xl text-xs transition disabled:opacity-50 shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? 'अकाउंट सक्रिय कर रहे हैं...' : '₹299 VLE KYC पंजीकरण सबमिट करें व अकाउंट एक्टिव करें ➔'}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

function RocketIcon(props) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}
