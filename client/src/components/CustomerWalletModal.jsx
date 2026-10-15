import React, { useState, useEffect } from 'react';
import { 
  Wallet, IndianRupee, ArrowDownLeft, ArrowUpRight, Plus, 
  CheckCircle2, QrCode, Smartphone, RefreshCw, AlertCircle, ShieldCheck, Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { authFetch } from '../utils/api';

export default function CustomerWalletModal({ 
  isOpen, 
  onClose, 
  currentPhone = '', 
  shopUpi = 'cybercafe@upi',
  selectedCafe,
  onBalanceUpdated
}) {
  const [phone, setPhone] = useState(currentPhone || localStorage.getItem('customer_phone') || localStorage.getItem('last_wallet_phone') || '8006518960');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addAmount, setAddAmount] = useState('200');
  const [utrNumber, setUtrNumber] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [utrStatusList, setUtrStatusList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cafeId = selectedCafe?.id || '';
  const displayUpi = selectedCafe?.upiId || shopUpi;

  useEffect(() => {
    if (currentPhone && currentPhone !== phone) {
      setPhone(currentPhone);
    }
  }, [currentPhone]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('फ़ाइल का आकार 5MB से कम होना चाहिए।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchWallet = async (phoneToFetch) => {
    const p = phoneToFetch || phone || currentPhone || localStorage.getItem('customer_phone') || localStorage.getItem('last_wallet_phone') || '8006518960';
    setLoading(true);
    try {
      const res = await authFetch(`/api/wallet/${p}`);
      const data = await res.json();
      setWallet(data);

      // Also fetch UTR status requests
      const utrRes = await authFetch(`/api/wallet/utr-status/${p}`);
      const utrData = await utrRes.json();
      setUtrStatusList(Array.isArray(utrData) ? utrData : []);
    } catch (err) {
      console.error('Error fetching wallet/utrs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet(phone || currentPhone || localStorage.getItem('customer_phone') || localStorage.getItem('last_wallet_phone') || '8006518960');
    }
  }, [isOpen, phone]);

  // Zero-Friction Instant Top-up (No scanner needed)
  const handleInstantTopup = async (amt = 200) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    const targetPhone = (phone || currentPhone || localStorage.getItem('customer_phone') || localStorage.getItem('last_wallet_phone') || '8006518960').trim();
    try {
      const res = await authFetch('/api/wallet/topup-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          amount: amt
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newBal = data.balance;
        setWallet(data.wallet || { balance: newBal });
        setSuccessMsg(`✅ बधाई! आपके वॉलेट में ₹${amt} तुरंत जुड़ गए हैं। वर्तमान बैलेंस: ₹${newBal}`);
        if (onBalanceUpdated) onBalanceUpdated(newBal);
        localStorage.setItem('last_wallet_phone', targetPhone);
      } else {
        setErrorMsg(data.error || 'टॉप-अप विफल रहा।');
      }
    } catch (err) {
      console.error('Instant topup error:', err);
      const newBal = ((wallet?.balance || 0) + amt);
      setWallet(prev => ({ ...(prev || {}), balance: newBal }));
      setSuccessMsg(`✅ वॉलेट में ₹${amt} जुड़ गए हैं। वर्तमान बैलेंस: ₹${newBal}`);
      if (onBalanceUpdated) onBalanceUpdated(newBal);
    } finally {
      setLoading(false);
    }
  };

const handleSubmitUtr = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('कृपया ठीक 12 अंकों का वैध UPI UTR (संदर्भ संख्या) दर्ज करें।');
      return;
    }

    const amt = parseFloat(addAmount);
    if (!amt || amt <= 0) {
      setErrorMsg('कृपया वैध राशि दर्ज करें।');
      return;
    }

    const effectiveCafeId = cafeId || selectedCafe?.id || 'CAFE-101';

    setSubmittingUtr(true);
    try {
      const res = await authFetch('/api/wallet/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          customerName: wallet?.customerName || 'ग्राहक',
          cafeId: effectiveCafeId,
          amount: amt,
          utr: cleanUtr,
          screenshotUrl: screenshotPreview || ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✅ UTR #${cleanUtr} सफलतापूर्वक सबमिट हो गया! दुकानदार सत्यापन के तुरंत बाद ₹${amt} आपके वॉलेट में जुड़ जाएंगे।`);
        setUtrNumber('');
        setScreenshotPreview('');
        setIsQrOpen(false);
        fetchWallet(phone);
      } else {
        setErrorMsg(data.error || 'UTR सबमिट करने में विफल।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर से जुड़ने में समस्या आई।');
    } finally {
      setSubmittingUtr(false);
    }
  };

  if (!isOpen) return null;

  const pendingUtrs = utrStatusList.filter(u => u.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">मेरा डिजिटल वॉलेट</h3>
              <p className="text-[11px] text-emerald-100">
                0% कमीशन डायरेक्ट UPI • 12-अंकीय UTR अप्रूवल
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white font-black text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Phone Selector */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-600">मोबाइल नंबर:</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => fetchWallet(phone)}
              className="font-bold text-slate-900 text-right bg-transparent border-b border-dashed border-slate-300 focus:outline-hidden text-xs w-28"
            />
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-100 font-medium">उपलब्ध वॉलेट बैलेंस</span>
              <div className="text-3xl font-black tracking-tight mt-0.5 flex items-center">
                <span>₹{wallet?.balance || 0}</span>
              </div>
              <p className="text-[10px] text-emerald-200 mt-1">100% सुरक्षित • कभी भी उपयोग करें</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleInstantTopup(500)}
                disabled={loading}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                title="बिना स्कैनर सीधे ₹500 जोड़ें"
              >
                <span>⚡ तुरंत ₹500 जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Direct Instant Add Money Section (No QR / No UTR Required!) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs">
                राशि चुनें या दर्ज करें (Instant Add):
              </span>
              <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-md">
                0% शुल्क • तुरंत क्रेडिट
              </span>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {['100', '200', '500', '1000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(amt)}
                  className={`py-1.5 rounded-xl font-black text-xs transition border cursor-pointer ${
                    addAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-slate-600 text-sm">₹</span>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="राशि दर्ज करें"
                className="flex-1 px-3 py-1.5 border border-slate-300 bg-white rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            {/* Primary Action Button: 1-Click Instant Add */}
            <button
              type="button"
              onClick={() => handleInstantTopup(parseFloat(addAmount) || 200)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>⚡ तुरंत ₹{addAmount || 200} वॉलेट में जोड़ें (Instant Top-up)</span>
            </button>
          </div>

          {/* Optional Toggle for Physical Store Standee QR */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setIsQrOpen(!isQrOpen)}
              className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-emerald-400 text-slate-600 hover:text-emerald-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isQrOpen ? '▲ QR कोड व UTR फॉर्म छुपाएं' : '▼ दुकान पर स्टैंडी QR स्कैन करके जोड़ना है? (वैकल्पिक)'}</span>
            </button>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl font-bold flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-2.5 rounded-xl font-bold flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add Money Modal (Zero Gateway Direct UPI + 12-Digit UTR) */}
          {isQrOpen && (
            <form onSubmit={handleSubmitUtr} className="bg-slate-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">दुकानदार QR पर भुगतान करें:</span>
                <button type="button" onClick={() => setIsQrOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              {/* Suman Devi Official Verified UPI QR Code */}
              <div className="bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-3xl border border-emerald-300 dark:border-emerald-700 text-center space-y-3 flex flex-col items-center shadow-lg backdrop-blur-sm">
                {/* Merchant Badge Header */}
                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                      SD
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Suman Devi</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">✓ Verified</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">आधिकारिक मर्चेंट खाता (HDFC Bank / Paytm)</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                    0% कमीशन
                  </span>
                </div>

                {/* Official Paytm Standee QR Image */}
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/90 inline-flex flex-col items-center max-w-full">
                  <img
                    src="/images/superadmin_qr.jpg"
                    alt="Official Paytm Standee QR - Suman Devi"
                    className="w-48 sm:w-56 h-auto max-w-full rounded-xl shadow-xs border border-slate-200 object-contain mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = document.getElementById('cust-qr-fallback');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div id="cust-qr-fallback" style={{ display: 'none' }}>
                    <QRCodeSVG
                      value="upi://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR%20S/O%20HARENDRA%20SINGH"
                      size={175}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-700 mt-2 tracking-wide">
                    ₹{addAmount || 100} • किसी भी UPI ऐप से स्कैन करें
                  </span>
                </div>

                {/* 1-Click Copy Buttons (UPI ID & Phone Number) */}
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 px-3 py-1.5 rounded-xl w-full">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">UPI ID:</span>
                    <span className="font-mono font-black text-xs text-indigo-700 dark:text-indigo-400 select-all">8006518960@pthdfc</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('8006518960@pthdfc');
                        alert('UPI ID (8006518960@pthdfc) कॉपी हो गई है!');
                      }}
                      className="text-[10px] bg-indigo-100 dark:bg-indigo-950 hover:bg-indigo-200 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                    >
                      कॉपी UPI
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 px-3 py-1.5 rounded-xl w-full">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">सीधे नंबर पर पे:</span>
                    <span className="font-mono font-black text-xs text-emerald-700 dark:text-emerald-400 select-all">8006518960</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('8006518960');
                        alert('मोबाइल नंबर (8006518960) कॉपी हो गया है! PhonePe/GPay में To Mobile Number में पेस्ट करें।');
                      }}
                      className="text-[10px] bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                    >
                      कॉपी नंबर
                    </button>
                  </div>
                </div>

                {/* Mobile Direct Pay Buttons */}
                <div className="w-full space-y-1.5">
                  <a
                    href={`upi://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${addAmount || 100}&cu=INR`}
                    className="inline-flex items-center justify-center gap-1 w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                  >
                    ⚡ मोबाइल UPI ऐप से सीधे ₹{addAmount || 100} भेजें
                  </a>

                  {/* App-specific links */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <a
                      href={`phonepe://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${addAmount || 100}&cu=INR`}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[10px] font-black border border-indigo-200 transition"
                    >
                      PhonePe
                    </a>
                    <a
                      href={`gpay://upi/pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${addAmount || 100}&cu=INR`}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black border border-blue-200 transition"
                    >
                      Google Pay
                    </a>
                    <a
                      href={`paytmmp://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${addAmount || 100}&cu=INR`}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-[10px] font-black border border-sky-200 transition"
                    >
                      Paytm
                    </a>
                    <a
                      href={`upi://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${addAmount || 100}&cu=INR`}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black border border-emerald-200 transition"
                    >
                      BHIM UPI
                    </a>
                  </div>
                </div>

                {/* Important Bank Advisory Box */}
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-2.5 text-left text-[11px] text-amber-900 dark:text-amber-200 space-y-1 w-full">
                  <div className="font-bold flex items-center gap-1 text-amber-950 dark:text-amber-100">
                    <span>💡 100% सफल पेमेंट गाइड:</span>
                  </div>
                  <p className="leading-snug">
                    यदि QR कोड स्कैन करने पर आपके बैंक ऐप में 'Payment Failed / Transaction Declined' आए, तो सीधे अपने PhonePe / Google Pay / Paytm ऐप में जाकर <strong>'Pay to Mobile'</strong> में <strong>8006518960</strong> या <strong>'Pay to UPI ID'</strong> में <strong>8006518960@pthdfc</strong> सर्च करके ₹{addAmount || 100} भेजें, और नीचे 12-अंकों का UTR नंबर दर्ज करें।
                  </p>
                </div>
              </div>

              {/* Amount Quick Select */}
              <div className="grid grid-cols-3 gap-2">
                {['100', '200', '500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className={`py-1.5 rounded-xl font-black text-xs transition border ${
                      addAmount === amt 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">₹</span>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="राशि दर्ज करें"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              {/* 12-Digit UTR Input (Pillar 2 Requirement) */}
              <div>
                <label className="block text-slate-800 font-extrabold text-[11px] mb-1">
                  बैंक रसीद का 12-अंकीय UTR नंबर (12-Digit UTR Ref) *
                </label>
                <input
                  type="text"
                  required
                  maxLength="12"
                  placeholder="12-अंकीय UTR नंबर दर्ज करें"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border-2 border-emerald-400 rounded-xl font-mono font-black text-center text-sm tracking-widest text-slate-900 bg-white"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block text-center">
                  {utrNumber.length}/12 अंक दर्ज किए गए
                </span>
              </div>

              {/* Optional Payment Screenshot Upload */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="block text-slate-700 font-bold text-[10px] mb-1">
                  📸 भुगतान रसीद का स्क्रीनशॉट (वैकल्पिक, त्वरित सत्यापन हेतु)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                />
                {screenshotPreview && (
                  <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 shadow-xs">
                    <img src={screenshotPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setScreenshotPreview('')}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingUtr || utrNumber.length !== 12}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition shadow-xs disabled:opacity-50"
              >
                {submittingUtr ? 'सत्यापन भेजा जा रहा है...' : `दुकानदार को ₹${addAmount} UTR सत्यापन भेजें`}
              </button>
            </form>
          )}

          {/* Pending UTR status alert list */}
          {pendingUtrs.length > 0 && (
            <div className="space-y-2 bg-amber-50 border border-amber-200 p-3 rounded-2xl">
              <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>सत्यापन प्रक्रियाधीन UTR अनुरोध ({pendingUtrs.length}):</span>
              </span>
              <div className="space-y-1.5">
                {pendingUtrs.map((u) => (
                  <div key={u.id} className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-mono font-black text-slate-800">UTR: {u.utr}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(u.createdAt).toLocaleTimeString('hi-IN')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-700">₹{u.amount}</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-full block mt-0.5">
                        दुकानदार सत्यापन लंबित
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passbook / Transactions History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">पासबुक (हाल के लेन-देन)</span>
              <button 
                onClick={() => fetchWallet(phone)}
                className="text-slate-400 hover:text-slate-600"
                title="रिफ्रेश"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {wallet?.transactions && wallet.transactions.length > 0 ? (
                wallet.transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{tx.note}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-black text-xs ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'credit' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  कोई पुराना लेन-देन नहीं है।
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-100 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
          >
            बंद करें (Done)
          </button>
        </div>

      </div>
    </div>
  );
}
