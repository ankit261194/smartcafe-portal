import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Sparkles, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ShopStandeeModal({ isOpen, onClose, settings, selectedCafe }) {
  if (!isOpen) return null;

  const [networkUrl, setNetworkUrl] = React.useState('');
  const [customUrl, setCustomUrl] = React.useState('');

  React.useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => {
        if (data.networkUrl) {
          setNetworkUrl(data.networkUrl);
          setCustomUrl(data.networkUrl);
        }
      })
      .catch(() => {});
  }, []);

  const rawBase = customUrl || networkUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
  const effectiveUrl = selectedCafe?.id
    ? `${rawBase.replace(/\/+$/, '')}/?cafe=${selectedCafe.id}`
    : rawBase;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden print-container">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-lg">दुकान काउंटर पोस्टर / स्टेंडी (Printable A4 QR)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              प्रिंट निकालें (A4 Poster Print)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Poster Content */}
        <div className="p-8 text-center bg-white border-8 border-blue-600 m-2 rounded-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 px-4 rounded-xl shadow-md mb-6">
            <p className="text-yellow-300 font-bold tracking-widest text-sm uppercase mb-1">
              ★ डिजिटल सेवा केंद्र एवं जन सुविधा केंद्र ★
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {settings?.shopName || 'श्री डिजिटल साइबर कैफे'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              {settings?.tagline || 'सभी ऑनलाइन फॉर्म, प्रिंटिंग, लेमिनेशन व सरकारी सेवाएं'}
            </p>
          </div>

          {/* Core Message */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
              <Smartphone className="w-7 h-7 text-blue-600 animate-bounce" />
              मोबाइल से QR कोड स्कैन करें!
            </h2>
            <p className="text-slate-700 font-medium text-base mt-1">
              लाइन में लगने या WhatsApp पर नंबर मांगने की ज़रूरत नहीं — सीधे प्रिंट निकालें व फॉर्म भरें।
            </p>
          </div>

          {/* Big QR Code */}
          <div className="flex flex-col items-center justify-center my-6">
            <div className="p-4 bg-white rounded-2xl border-4 border-slate-900 shadow-xl inline-block">
              <QRCodeSVG
                value={effectiveUrl}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-slate-700 font-bold font-mono mt-3 bg-slate-100 py-1 px-3 rounded-full border border-slate-200">
              दुकान Wi-Fi लिंक: {effectiveUrl}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-3 text-left mb-6">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>क्विक प्रिंट</span>
              </div>
              <p className="text-xs text-slate-600">
                PDF या फोटो अपलोड करें और तुरंत 1-मिनट में प्रिंट पाएं।
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>सरकारी फॉर्म</span>
              </div>
              <p className="text-xs text-slate-600">
                नौकरी, स्कॉलरशिप, आय/जाति/निवास घर से अप्लाई करें।
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 text-purple-800 font-bold text-sm mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>सुरक्षित डेटा</span>
              </div>
              <p className="text-xs text-slate-600">
                आपके सभी डॉक्यूमेंट्स 100% प्राइवेट व सुरक्षित रहते हैं।
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t-2 border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div>
              <span className="font-bold text-slate-900">संपर्क / WhatsApp:</span> {settings?.phone || 'कैफे काउंटर'}
            </div>
            <div>
              <span className="font-bold text-slate-900">पता:</span> {settings?.address || 'मेन मार्केट'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
