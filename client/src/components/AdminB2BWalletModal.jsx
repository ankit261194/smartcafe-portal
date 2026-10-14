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
  const [isQrOpen, setIsQrOpen] = useState(false);
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

            <button
              onClick={() => setIsQrOpen(!isQrOpen)}
              className="bg-white text-indigo-900 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-50 transition"
            >
              <Plus className="w-4 h-4 text-indigo-700" />
              <span>B2B रिचार्ज</span>
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
              <div className="bg-white p-3 rounded-2xl border border-indigo-200 text-center space-y-2 flex flex-col items-center shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span>खाताधारक:</span>
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Suman Devi ✓</span>
                </div>
                <div className="p-1.5 bg-white rounded-xl shadow-md border-2 border-indigo-400 inline-block">
                  <img 
                    src="/images/superadmin_qr.jpg" 
                    alt="Suman Devi UPI QR" 
                    className="w-48 h-auto rounded-lg object-contain"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full">
                  <span className="text-[10px] text-slate-500 font-bold">UPI ID:</span>
                  <span className="font-mono font-black text-xs text-indigo-700 select-all">8006518960@pthdfc</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('8006518960@pthdfc');
                      alert('UPI ID (8006518960@pthdfc) कॉपी हो गई है!');
                    }}
                    className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-bold transition"
                  >
                    कॉपी करें
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black border border-indigo-200">PhonePe</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black border border-blue-200">Google Pay</span>
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md text-[10px] font-black border border-sky-200">Paytm</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black border border-emerald-200">BHIM UPI</span>
                </div>
                <a
                  href={`upi://pay?pa=8006518960@pthdfc&pn=Suman%20Devi&am=${amount || 500}&cu=INR&tn=B2B-Wallet-Topup`}
                  className="inline-flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  ⚡ मोबाइल UPI ऐप से ₹{amount || 500} भेजें
                </a>
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
