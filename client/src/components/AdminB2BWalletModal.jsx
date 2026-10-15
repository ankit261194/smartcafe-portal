import React, { useState, useEffect } from 'react';
import { 
  Wallet, IndianRupee, ArrowDownLeft, ArrowUpRight, Plus, 
  CheckCircle2, QrCode, Smartphone, RefreshCw, AlertCircle, ShieldCheck, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { authFetch } from '../utils/api';

export default function AdminB2BWalletModal({ 
  isOpen, 
  onClose, 
  selectedCafe,
  onB2bUpdated 
}) {
  const [b2bData, setB2bData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('500');
  const [utrNumber, setUtrNumber] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(true);
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');

  const cafeId = selectedCafe?.id || '';

  const fetchB2bWallet = async () => {
    if (!cafeId) return;
    setLoading(true);
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/b2b-wallet`);
      const data = await res.json();
      setB2bData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && cafeId) {
      fetchB2bWallet();
    }
  }, [isOpen, cafeId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentSlip(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitB2bUtr = async (e) => {
    e.preventDefault();
    if (!cafeId) {
      setErrorMsg('कृपया पहले अपने साइबर कैफे का चयन करें।');
      return;
    }
    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('कृपया ठीक 12 अंकों का वैध UPI UTR (संदर्भ संख्या) दर्ज करें।');
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setErrorMsg('कृपया वैध राशि दर्ज करें।');
      return;
    }
    if (!paymentSlip) {
      setErrorMsg('कृपया B2B रिचार्ज भुगतान की स्क्रीनशॉट / रसीद पर्ची अनिवार्य रूप से अपलोड करें।');
      return;
    }

    setErrorMsg('');
    setStatusMsg('');
    setSubmittingUtr(true);

    try {
      const formData = new FormData();
      formData.append('paymentSlip', paymentSlip);
      formData.append('amount', amt);
      formData.append('utr', cleanUtr);

      const res = await authFetch(`/api/cafes/${cafeId}/b2b-wallet/submit-utr`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('✅ UTR व रसीद सत्यापन हेतु सुपर एडमिन को भेज दी गई! सुपर एडमिन द्वारा अनुमोदन के बाद B2B बैलेंस जुड़ेगा।');
        setUtrNumber('');
        setPaymentSlip(null);
        setSlipPreview('');
        setIsQrOpen(false);
        fetchB2bWallet();
        if (onB2bUpdated) onB2bUpdated();
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

  const currentBal = b2bData?.b2bWallet?.balance || 0;
  const minThreshold = b2bData?.b2bWallet?.minThreshold || 200;
  const isBelow = currentBal < minThreshold;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">संचालक B2B वॉलेट (Wholesale Wallet)</h3>
              <p className="text-[11px] text-blue-200">
                {selectedCafe?.shopName || 'कैफे B2B बैलेंस'}
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

        <div className="p-5 space-y-4 text-xs">
          
          {/* Threshold alert */}
          {isBelow && (
            <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-800">⚠️ B2B बैलेंस न्यूनतम थ्रेशोल्ड (₹{minThreshold}) से कम है!</strong>
                <span className="text-[11px] text-red-700">
                  वर्तमान बैलेंस मात्र ₹{currentBal} है। जब तक बैलेंस ₹{minThreshold} से कम रहेगा, ग्राहक RC डाउनलोड जैसी स्वचालित सेवाएं उपयोग नहीं कर पाएंगे। तुरंत B2B टॉप-अप करें।
                </span>
              </div>
            </div>
          )}

          {/* Balance card */}
          <div className="bg-gradient-to-br from-indigo-700 to-blue-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-200 font-medium">B2B थोक बैलेंस</span>
              <div className="text-3xl font-black tracking-tight mt-0.5">
                ₹{currentBal}
              </div>
              <p className="text-[10px] text-blue-300 mt-1">
                न्यूनतम अनिवार्य कोटा: ₹{minThreshold}
              </p>
            </div>

          </div>

          {/* Optional Toggle for Super Admin QR Standee */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setIsQrOpen(!isQrOpen)}
              className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isQrOpen ? '▲ केंद्रीय एडमिन QR फॉर्म छुपाएं' : '▼ केंद्रीय एडमिन QR से UTR रसीद भेजनी है? (वैकल्पिक)'}</span>
            </button>
          </div>

          {statusMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* B2B Top-Up Form via Super Admin QR */}
          {isQrOpen && (
            <form onSubmit={handleSubmitB2bUtr} className="bg-slate-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">केंद्रीय एडमिन QR पर भुगतान करें:</span>
                <button type="button" onClick={() => setIsQrOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              {/* Super Admin Payment target & Real Suman Devi QR Code */}
              <div className="bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-3xl border border-indigo-300 dark:border-indigo-700 text-center space-y-3 flex flex-col items-center shadow-lg backdrop-blur-sm">
                {/* Merchant Badge Header */}
                <div className="flex items-center justify-between w-full px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                      SD
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                        <span>Suman Devi</span>
                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">✓ Verified</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">केंद्रीय B2B मर्चेंट (HDFC Bank / Paytm)</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 rounded-lg text-[10px] font-black border border-indigo-200 dark:border-indigo-800">
                    0% कमीशन B2B
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
                      const fallback = document.getElementById('b2b-qr-fallback');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div id="b2b-qr-fallback" style={{ display: 'none' }}>
                    <QRCodeSVG
                      value="upi://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR%20S/O%20HARENDRA%20SINGH"
                      size={175}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-700 mt-2 tracking-wide">
                    ₹{amount || 500} • किसी भी UPI ऐप से स्कैन करें
                  </span>
                </div>

                {/* 1-Click Copy Buttons (UPI ID & Phone Number) */}
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-3 py-1.5 rounded-xl w-full">
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

                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-3 py-1.5 rounded-xl w-full">
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
                    href={`upi://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${amount || 500}&cu=INR`}
                    className="inline-flex items-center justify-center gap-1 w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                  >
                    ⚡ मोबाइल UPI ऐप से सीधे ₹{amount || 500} भेजें
                  </a>

                  {/* App-specific links */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <a
                      href={`phonepe://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${amount || 500}&cu=INR`}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[10px] font-black border border-indigo-200 transition"
                    >
                      PhonePe
                    </a>
                    <a
                      href={`gpay://upi/pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${amount || 500}&cu=INR`}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black border border-blue-200 transition"
                    >
                      Google Pay
                    </a>
                    <a
                      href={`paytmmp://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${amount || 500}&cu=INR`}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-[10px] font-black border border-sky-200 transition"
                    >
                      Paytm
                    </a>
                    <a
                      href={`upi://pay?pa=8006518960@pthdfc&pn=ANKIT%20KUMAR&am=${amount || 500}&cu=INR`}
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
                    यदि QR कोड स्कैन करने पर आपके बैंक ऐप में 'Payment Failed / Transaction Declined' आए, तो सीधे अपने PhonePe / Google Pay / Paytm ऐप में जाकर <strong>'Pay to Mobile'</strong> में <strong>8006518960</strong> या <strong>'Pay to UPI ID'</strong> में <strong>8006518960@pthdfc</strong> सर्च करके ₹{amount || 500} भेजें, और नीचे 12-अंकों का UTR नंबर दर्ज करें।
                  </p>
                </div>
              </div>

              {/* Amount Quick select */}
              <div className="grid grid-cols-3 gap-2">
                {['500', '1000', '2000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 rounded-xl font-black text-xs transition border ${
                      amount === amt 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">भुगतान की गई राशि (Amount) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  बैंक रसीद का 12-अंकीय UTR नंबर (12-Digit Ref No.) *
                </label>
                <input
                  type="text"
                  required
                  maxLength="12"
                  placeholder="12-अंकीय UTR नंबर दर्ज करें"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border-2 border-indigo-400 rounded-xl font-mono font-black text-sm text-center tracking-widest text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {utrNumber.length}/12 अंक दर्ज हुए
                </span>
              </div>

              {/* Mandatory Payment Slip Screenshot Upload */}
              <div className="bg-indigo-50/70 p-3 rounded-xl border-2 border-dashed border-indigo-300 space-y-2">
                <label className="block text-slate-800 font-bold text-xs">
                  📸 भुगतान रसीद / स्क्रीनशॉट पर्ची अनिवार्य रूप से अपलोड करें *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {slipPreview && (
                  <div className="mt-1.5 p-1 bg-white rounded-lg border border-slate-200 inline-block">
                    <img src={slipPreview} alt="Receipt Slip" className="h-16 w-auto rounded object-contain" />
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                  सुपर एडमिन द्वारा रसीद व UTR की पुष्टि के बाद ही B2B बैलेंस क्रेडिट होगा।
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingUtr || utrNumber.length !== 12 || !paymentSlip}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs transition disabled:opacity-50 shadow-md"
              >
                {submittingUtr ? 'सत्यापित कर रहे हैं...' : `सुपर एडमिन को ₹${amount} UTR भेजें`}
              </button>
            </form>
          )}

          {/* B2B Passbook / Transactions History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">B2B लेन-देन पासबुक</span>
              <button 
                onClick={fetchB2bWallet}
                className="text-slate-400 hover:text-slate-600"
                title="रिफ्रेश"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {b2bData?.b2bWallet?.transactions && b2bData.b2bWallet.transactions.length > 0 ? (
                b2bData.b2bWallet.transactions.map((tx) => (
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
                          {tx.utr && <span className="font-mono ml-1">UTR: {tx.utr}</span>}
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
                  कोई पुराना B2B लेन-देन नहीं है।
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
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
