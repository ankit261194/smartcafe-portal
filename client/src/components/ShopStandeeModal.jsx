import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, X, Sparkles, Smartphone, ShieldCheck, CheckCircle2, QrCode, FileText, CreditCard, Car, Zap, HeartPulse, Vote, Fingerprint } from 'lucide-react';
import jsPDF from 'jspdf';
import { getServerBaseUrl } from '../utils/api';

export default function ShopStandeeModal({ isOpen, onClose, settings, selectedCafe }) {
  if (!isOpen) return null;

  const [standeeData, setStandeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterSize, setPosterSize] = useState('A4'); // 'A4' or '12x18'
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const posterRef = useRef(null);

  const cafeId = selectedCafe?.id || settings?.cafeId || 'CAFE-101';

  useEffect(() => {
    let isMounted = true;
    const fetchStandee = async () => {
      try {
        const baseUrl = getServerBaseUrl();
        const res = await fetch(`${baseUrl}/api/cafes/${cafeId}/standee-data`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.cafe) {
            setStandeeData(data.cafe);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Standee fetch fallback to props:', e);
      }
      if (isMounted) {
        setStandeeData({
          id: cafeId,
          shopName: selectedCafe?.shopName || settings?.shopName || 'डिजिटल जन सेवा केंद्र',
          ownerName: selectedCafe?.ownerName || 'कैफे संचालक',
          phone: selectedCafe?.phone || settings?.phone || '',
          address: selectedCafe?.address || settings?.address || 'मुख्य बाजार, सेवा केंद्र',
          cscVleId: selectedCafe?.vleId || selectedCafe?.code || cafeId,
          qrDeepLink: `https://smartcafe.sbs/?cafe=${cafeId}`,
          tagline: '★ अधिकृत डिजिटल सेवा केंद्र एवं जन सुविधा केंद्र ★',
          rates: selectedCafe?.rates || settings?.rates || { bwPage: 3, colorPage: 10 }
        });
        setLoading(false);
      }
    };
    fetchStandee();
    return () => { isMounted = false; };
  }, [cafeId, selectedCafe, settings]);

  const cafe = standeeData || {
    id: cafeId,
    shopName: selectedCafe?.shopName || settings?.shopName || 'डिजिटल जन सेवा केंद्र',
    ownerName: selectedCafe?.ownerName || 'कैफे संचालक',
    phone: selectedCafe?.phone || settings?.phone || '',
    address: selectedCafe?.address || settings?.address || 'मुख्य बाजार, सेवा केंद्र',
    cscVleId: selectedCafe?.vleId || selectedCafe?.code || cafeId,
    qrDeepLink: `https://smartcafe.sbs/?cafe=${cafeId}`,
    rates: selectedCafe?.rates || settings?.rates || { bwPage: 3, colorPage: 10 }
  };

  const qrUrl = `https://smartcafe.sbs/?cafe=${cafe.id || cafeId}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setGeneratingPdf(true);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: posterSize === '12x18' ? [305, 457] : 'a4'
      });

      // Render high-contrast crisp vector-based PDF or trigger print dialog
      pdf.setProperties({
        title: `${cafe.shopName} - Standee Poster`,
        subject: 'Official CSC Digital Seva Counter Standee',
        author: 'Smart Cafe SaaS Platform'
      });

      // Open print window directly for maximum 300 DPI native vector quality
      window.print();
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const servicesList = [
    { title: 'आधार कार्ड PVC प्रिंट', sub: 'एडवांस e-KYC व बायोमेट्रिक', icon: Fingerprint, color: 'text-orange-600 bg-orange-50' },
    { title: 'पैन कार्ड (NSDL/UTI)', sub: 'नया बनाएं, सुधारें व PVC', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
    { title: 'वोटर कार्ड स्मार्ट प्रिंट', sub: 'डिजिटल कलर PVC कार्ड', icon: Vote, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'वाहन RC स्मार्ट कार्ड', sub: 'परिवहन RC, चालान व DL', icon: Car, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'आय, जाति, निवास प्रमाण', sub: 'e-District सत्यापन पर्ची', icon: FileText, color: 'text-amber-600 bg-amber-50' },
    { title: 'बिजली बिल भुगतान', sub: 'तत्काल बिल व अधिकृत रसीद', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
    { title: 'आयुष्मान भारत कार्ड', sub: '₹5 लाख मुफ्त इलाज गोल्डन कार्ड', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
    { title: '1-मिनट डायरेक्ट प्रिंट', sub: 'दुकानदार काउंटर से साइलेंट प्रिंट', icon: Printer, color: 'text-cyan-600 bg-cyan-50' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Print Specific CSS to enforce single page 300 DPI A4 layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #standee-poster-printable, #standee-poster-printable * {
            visibility: visible;
          }
          #standee-poster-printable {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 10mm;
            border: 4mm solid #1e3a8a !important;
            box-sizing: border-box;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Toolbar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>ब्रांडेड काउंटर स्टेंडी पोस्टर जनरेटर</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">300 DPI</span>
              </h3>
              <p className="text-[11px] text-slate-400">काउंटर पर लगाने के लिए लैमिनेशन-रेडी A4 पोस्टर</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Size Selector */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setPosterSize('A4')}
                className={`px-2.5 py-1 rounded-lg transition ${posterSize === 'A4' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                A4 (स्टैंडी)
              </button>
              <button
                type="button"
                onClick={() => setPosterSize('12x18')}
                className={`px-2.5 py-1 rounded-lg transition ${posterSize === '12x18' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                12×18 (पोस्टर)
              </button>
            </div>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>1-क्लिक प्रिंट</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Standee Poster Container */}
        <div className="p-3 sm:p-6 bg-slate-100 max-h-[85vh] overflow-y-auto">
          <div 
            id="standee-poster-printable"
            ref={posterRef}
            className="bg-white rounded-2xl shadow-xl border-4 border-blue-900 p-5 sm:p-7 relative text-slate-900"
            style={{ minHeight: '600px' }}
          >
            {/* Tricolor Header Accent */}
            <div className="flex h-2.5 w-full rounded-t-lg overflow-hidden mb-4 shadow-sm">
              <div className="flex-1 bg-orange-500"></div>
              <div className="flex-1 bg-white border-y border-slate-200"></div>
              <div className="flex-1 bg-emerald-600"></div>
            </div>

            {/* CSC & Center Authority Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-yellow-300 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                <span>★ डिजिटल सेवा केंद्र एवं अधिकृत जन सुविधा केंद्र ★</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2 tracking-tight uppercase">
                {cafe.shopName || 'डिजिटल जन सेवा केंद्र'}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 font-bold mt-1">
                <span className="text-blue-900 font-black">VLE ID: {cafe.cscVleId || cafe.id}</span>
                <span>•</span>
                <span>संचालक: {cafe.ownerName || 'कैफे संचालक'}</span>
                {cafe.phone && (
                  <>
                    <span>•</span>
                    <span>📞 {cafe.phone}</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {cafe.address || 'मुख्य बाजार, जन सुविधा केंद्र'}
              </p>
            </div>

            {/* Center Showcase: Large QR Code with Direct Scan Prompt */}
            <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-center mb-4 shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                <Smartphone className="w-3.5 h-3.5" />
                <span>लाइन में न लगें • फोन से सीधे प्रिंट व फॉर्म भेजें</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                मोबाइल कैमरे से यह QR कोड स्कैन करें!
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                स्कैन करते ही आपके फोन पर सीधे इसी दुकान का डिजिटल पोर्टल खुल जाएगा।
              </p>

              <div className="flex flex-col items-center justify-center my-3">
                <div className="p-3.5 bg-white rounded-2xl border-4 border-slate-950 shadow-lg inline-block">
                  <QRCodeSVG
                    value={qrUrl}
                    size={190}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-xl shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-mono font-black text-slate-800">
                    {qrUrl}
                  </span>
                </div>
              </div>
            </div>

            {/* 8-Service Grid */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>उपलब्ध 85+ प्रमुख सरकारी एवं डिजिटल सेवाएं:</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">ISO CR-80 PVC & 1-क्लिक डिलीवरी</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {servicesList.map((srv, idx) => {
                  const Icon = srv.icon;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-start gap-2 shadow-2xs">
                      <div className={`w-7 h-7 rounded-lg ${srv.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-[11px] text-slate-900 leading-tight truncate">
                          {srv.title}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                          {srv.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rates & Highlights Strip */}
            <div className="bg-blue-950 text-white rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-yellow-300 font-black">प्रिंट दरें:</span>
                <span>B/W प्रिंट: ₹{cafe.rates?.bwPage || 3}/पन्ना</span>
                <span>•</span>
                <span>रंगीन प्रिंट: ₹{cafe.rates?.colorPage || 10}/पन्ना</span>
                <span>•</span>
                <span>PVC स्मार्ट कार्ड: ₹50</span>
              </div>
              <div className="text-emerald-400 text-[11px] font-black">
                ✓ लेमिनेशन व फोटोकॉपी उपलब्ध
              </div>
            </div>

            {/* Security Guarantee Footer */}
            <div className="border-t-2 border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-600 font-bold">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% गोपनीय व सुरक्षित • आपके दस्तावेज़ प्रिंट के 24 घंटे में स्वतः नष्ट हो जाते हैं</span>
              </div>
              <div className="text-slate-500 font-medium">
                पावर्ड बाय Smart Cafe SaaS Platform • smartcafe.sbs
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer (No Print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium">
            <span className="font-bold text-slate-900">सुझाव:</span> इस पोस्टर को A4 या 12×18 इंच फोटो पेपर पर प्रिंट कराकर लेमिनेशन करवाएं और दुकान के मुख्य काउंटर पर लगाएं।
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 पोस्टर प्रिंट निकालें</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              बंद करें
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
