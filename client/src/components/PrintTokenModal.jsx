import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Printer, X, Download, Copy, Clock, ShieldCheck, Trash2 } from 'lucide-react';

export default function PrintTokenModal({ isOpen, onClose, data, type = 'print' }) {
  if (!isOpen || !data) return null;

  const [copied, setCopied] = React.useState(false);
  const [shredded, setShredded] = React.useState(Boolean(data.isShredded));
  const [shredding, setShredding] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShredFile = async () => {
    if (!window.confirm('क्या आप इस फाइल को सर्वर से तुरंत हमेशा के लिए डिलीट (श्रेड) करना चाहते हैं? डिलीट करने के बाद इसे दोबारा प्रिंट नहीं किया जा सकेगा।')) return;
    setShredding(true);
    try {
      const res = await fetch(`/api/prints/${data.id}/shred`, { method: 'POST' });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setShredded(true);
        alert('✅ फ़ाइल सर्वर से तुरंत स्थायी रूप से डिलीट कर दी गई है!');
      } else {
        alert(resData.error || 'डिलीट करने में विफल।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर त्रुटि!');
    } finally {
      setShredding(false);
    }
  };

  const [slipFormat, setSlipFormat] = React.useState('thermal'); // 'thermal' (58mm/80mm POS slip) or 'a4'

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden print-container transition-all ${
        slipFormat === 'thermal' ? 'max-w-[340px] w-full font-mono text-xs' : 'max-w-md w-full'
      }`}>
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setSlipFormat('thermal')}
              className={`px-2 py-1 rounded-md transition ${slipFormat === 'thermal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              थर्मल स्लिप (POS)
            </button>
            <button
              type="button"
              onClick={() => setSlipFormat('a4')}
              className={`px-2 py-1 rounded-md transition ${slipFormat === 'a4' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
            >
              A4 रसीद
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट निकालें</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            {type === 'print' ? 'प्रिंट रिक्वेस्ट सफलतापूर्वक सबमिट!' : 'आवेदन सफलतापूर्वक प्राप्त!'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            कृपया नीचे दिए गए टोकन नंबर को काउंटर पर दिखाएं या सेव रखें।
          </p>

          {/* Token Card */}
          <div className="my-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-400 rounded-xl p-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              आपका टोकन नंबर (Token ID)
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 tracking-wider font-mono">
                {data.id}
              </span>
              <button
                onClick={handleCopy}
                className="no-print p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-white transition"
                title="टोकन कॉपी करें"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <span className="text-xs text-emerald-600 font-semibold mt-1 block">कॉपी हो गया! ✓</span>}
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-3.5 text-left text-xs space-y-2 border border-slate-200">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">नाम:</span>
              <span className="font-semibold text-slate-800">{data.customerName}</span>
            </div>

            {data.phone && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">मोबाइल:</span>
                <span className="font-semibold text-slate-800">{data.phone}</span>
              </div>
            )}

            {type === 'print' ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">फ़ाइल का नाम:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">{data.fileOriginalName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">प्रिंट प्रकार:</span>
                  <span className="font-semibold text-slate-800">
                    {data.colorType === 'bw' ? 'ब्लैक एंड व्हाइट' : 'रंगीन (Color)'} • {data.copies} कॉपी
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">कुल शुल्क:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{data.totalAmount}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">सेवा का नाम:</span>
                  <span className="font-semibold text-slate-800">{data.serviceName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">अपलोड किए गए दस्तावेज:</span>
                  <span className="font-semibold text-slate-800">{data.documents?.length || 0} फाइलें</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">सेवा शुल्क:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{data.totalFee || 'शामिल'}</span>
                </div>
              </>
            )}

            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">पेमेंट स्टेटस:</span>
              <span className={`font-bold ${data.paymentStatus?.includes('paid') ? 'text-emerald-600' : 'text-amber-600'}`}>
                {data.paymentStatus === 'paid_upi' ? 'UPI द्वारा प्राप्त ✓' :
                 data.paymentStatus === 'paid_cash' ? 'नकद प्राप्त ✓' : 'काउंटर पर देय (Pending)'}
              </span>
            </div>
          </div>

          {/* Mini QR Code for tracking */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}?track=${data.id}`}
              size={64}
              level="M"
            />
            <div className="text-left text-[11px] text-slate-500 leading-tight">
              <p className="font-medium text-slate-700">QR कोड से कभी भी स्थिति ट्रैक करें</p>
              <p className="mt-0.5">कैफे पर आते ही यह टोकन दिखाकर तुरंत अपना दस्तावेज़ प्राप्त करें।</p>
            </div>
          </div>

          {/* Immediate Document Shredder & Privacy Guarantee */}
          {type === 'print' && (
            <div className="no-print mt-4 pt-3 border-t border-slate-200 text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 mb-2.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🔒 आपके दस्तावेज़ प्रिंट के बाद 24 घंटे में स्वतः नष्ट हो जाते हैं।</span>
              </div>
              {shredded ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-center">
                  <span>🗑️ यह फ़ाइल सर्वर से स्थायी रूप से डिलीट (श्रेड) हो चुकी है</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleShredFile}
                  disabled={shredding}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="सर्वर से फ़ाइल अभी हमेशा के लिए नष्ट करें"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{shredding ? 'फ़ाइल डिलीट हो रही है...' : 'अभी फ़ाइल डिलीट करें'}</span>
                </button>
              )}
            </div>
          )}

          {/* Footer Close button */}
          <div className="no-print mt-4">
            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl transition text-sm shadow-md"
            >
              ठीक है / बंद करें
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
