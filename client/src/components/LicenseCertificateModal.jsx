import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Printer, CheckCircle2, 
  Building2, Calendar, MapPin, Smartphone, QrCode, X
} from 'lucide-react';

export default function LicenseCertificateModal({ 
  isOpen, 
  onClose, 
  selectedCafe 
}) {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cafeId = selectedCafe?.id || '';

  useEffect(() => {
    if (isOpen && cafeId) {
      setLoading(true);
      fetch(`/api/cafes/${cafeId}/license-certificate`)
        .then(r => r.json())
        .then(d => setCertData(d))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else if (isOpen && !cafeId) {
      setLoading(false);
      setCertData(null);
    }
  }, [isOpen, cafeId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        
        {/* Top Action Bar (Hidden on Print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="font-extrabold text-sm">डिजिटल सेवा केंद्र अधिकृत लाइसेंस प्रमाण पत्र</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रमाण पत्र प्रिंट करें</span>
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white font-black text-xl leading-none ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div className="p-8 overflow-y-auto flex-1 flex items-center justify-center bg-amber-50/40">
          
          <div className="w-full max-w-xl bg-white border-8 border-double border-amber-600 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden text-slate-900">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-600 text-2xl font-serif">❖</div>
            <div className="absolute top-2 right-2 text-amber-600 text-2xl font-serif">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-2xl font-serif">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-2xl font-serif">❖</div>

            {/* Emblem */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-white flex items-center justify-center shadow-lg border-2 border-white mb-3">
              <Award className="w-9 h-9 text-slate-950" />
            </div>

            <p className="text-[11px] font-black uppercase tracking-widest text-amber-800">
              केंद्रीय डिजिटल सेवा केंद्र एवं साइबर कैफे नेटवर्क प्राधिकरण
            </p>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              डिजिटल सेवा केंद्र अधिकृत प्रमाण पत्र
            </h1>

            <p className="text-xs text-slate-500 font-semibold mt-1">
              CERTIFICATE OF RECOGNITION & VLE FRANCHISE LICENSE (365 DAYS)
            </p>

            {/* License Key Box */}
            <div className="my-5 inline-block bg-amber-50 border-2 border-amber-300 rounded-2xl px-6 py-2">
              <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
                डिजिटल लाइसेंस कुंजी (LICENSE KEY):
              </span>
              <span className="font-mono font-black text-base text-slate-900 tracking-widest">
                {certData?.licenseKey || selectedCafe?.licenseKey || (selectedCafe?.code ? `VLE-LIC-2026-UP24-${selectedCafe.code}` : 'लाइसेंस लंबित')}
              </span>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto space-y-2 mb-6">
              <p>
                प्रमाणित किया जाता है कि <strong>{certData?.ownerName || selectedCafe?.ownerName || 'कैफे संचालक'}</strong>, दुकान <strong>"{certData?.shopName || selectedCafe?.shopName || 'डिजिटल सेवा केंद्र'}"</strong>, पता: <strong>{certData?.address || selectedCafe?.address || '—'}</strong> को ई-गवर्नेंस, ऑनलाइन फॉर्म व सरकारी सेवाओं के निष्पादन हेतु अधिकृत किया गया है।
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs grid grid-cols-2 gap-3 text-left mb-6">
              <div>
                <span className="text-slate-400 block text-[10px]">VLE / CSC पहचान आईडी:</span>
                <span className="font-mono font-black text-slate-900">{certData?.vleId || '-'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">सब्सक्रिप्शन प्लान:</span>
                <span className="font-bold text-indigo-900">₹299 वार्षिक प्रो प्लान (365 दिन)</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">सक्रियण तिथि (Issued Date):</span>
                <span className="font-mono font-bold text-slate-800">
                  {new Date(certData?.activatedAt || Date.now()).toLocaleDateString('hi-IN')}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">वैधता (Valid Till):</span>
                <span className="font-mono font-black text-emerald-700">
                  {new Date(certData?.validTill || Date.now() + 365*24*3600*1000).toLocaleDateString('hi-IN')}
                </span>
              </div>
            </div>

            {/* Stamps and Signature */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <div className="text-left">
                <div className="w-12 h-12 bg-slate-900 text-yellow-300 rounded-xl flex items-center justify-center font-mono font-black text-xs">
                  QR
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">स्कैन कर सत्यापन जांचें</span>
              </div>

              <div className="text-center">
                <div className="w-20 h-8 mx-auto border-b border-dashed border-slate-400 mb-1 flex items-center justify-center font-serif text-[11px] text-indigo-900 font-bold">
                  अधिकृत मुहर
                </div>
                <span className="text-[10px] text-slate-700 font-bold block">निदेशक (Director of Digital Services)</span>
                <span className="text-[9px] text-slate-400 block">SaaS Kiosk Licensing Authority</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
