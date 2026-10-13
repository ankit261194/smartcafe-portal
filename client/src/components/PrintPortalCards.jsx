import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Printer, Upload, Download, Sparkles, 
  CheckCircle2, RefreshCw, Scissors, ShieldCheck, Layers, Image as ImageIcon 
} from 'lucide-react';

const CARD_TYPES = [
  { id: 'aadhaar', name: 'आधार कार्ड (Aadhaar Card)', color: 'border-red-500', desc: 'Front & Back 85.6mm x 54mm' },
  { id: 'pan', name: 'पैन कार्ड (PAN Card)', color: 'border-blue-600', desc: 'UTI / NSDL PVC Card Format' },
  { id: 'ayushman', name: 'आयुष्मान भारत कार्ड (Golden Card)', color: 'border-emerald-600', desc: 'PMJAY गोल्डन कार्ड लेआउट' },
  { id: 'voter', name: 'वोटर आईडी (EPIC Voter Card)', color: 'border-amber-600', desc: 'निर्वाचन आयोग मतदाता पहचान पत्र' },
  { id: 'eshram', name: 'ई-श्रम कार्ड (E-Shram Card)', color: 'border-orange-500', desc: 'श्रम एवं रोजगार मंत्रालय UAN कार्ड' },
  { id: 'dl', name: 'ड्राइविंग लाइसेंस (DL / RC)', color: 'border-indigo-600', desc: 'परिवहन स्मार्ट कार्ड लेआउट' }
];

export default function PrintPortalCards({ preloadedCard }) {
  const [selectedCardType, setSelectedCardType] = useState(() => {
    if (preloadedCard?.cardType) {
      const match = CARD_TYPES.find(c => c.id === preloadedCard.cardType);
      if (match) return match;
    }
    return CARD_TYPES[0];
  });

  useEffect(() => {
    if (preloadedCard?.cardType) {
      const match = CARD_TYPES.find(c => c.id === preloadedCard.cardType);
      if (match) setSelectedCardType(match);
    }
  }, [preloadedCard]);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [printPaper, setPrintPaper] = useState('a4_single'); // 'a4_single', 'a4_multi_5', 'photo_4x6'
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(105);

  const rcDetails = preloadedCard?.frontDetails || null;

  const handleFrontUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFrontImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBackUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBackImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePrint = () => {
    window.print();
  };



  return (
    <div className="space-y-6">
      
      {/* Top Banner - Hidden on print */}
      <div className="no-print bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-yellow-300" />
            स्मार्ट PVC कार्ड प्रिंट पोर्टल
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            प्रिंट पोर्टल: आधार, पैन, आयुष्मान PVC कार्ड (CR-80 Format)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            फ़्रंट और बैक फ़ोटो डालें — यह टूल ऑटोमैटिकली 85.6mm × 54mm के मानक PVC कार्ड लेआउट में कटिंग बॉर्डर के साथ A4 या 4×6 पेपर पर सेट कर देगा।
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={!frontImage && !backImage && !rcDetails}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50 shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>कार्ड प्रिंट निकालें (Print Sheet)</span>
        </button>
      </div>

      {/* Controls Bar - Hidden on print */}
      <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Card Type Selector (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              1. कार्ड का प्रकार चुनें
            </h3>

            <div className="space-y-1.5">
              {CARD_TYPES.map((c) => {
                const isSelected = selectedCardType.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCardType(c)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            {/* Paper Selection */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                प्रिंट पेपर लेआउट (Paper Layout)
              </label>
              <select
                value={printPaper}
                onChange={(e) => setPrintPaper(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="a4_single">A4 शीट - सिंगल कार्ड (Front & Back)</option>
                <option value="photo_4x6">4×6 फोटो पेपर (Borderless Glossy)</option>
                <option value="a4_multi_5">A4 शीट - 5 कार्ड्स लेआउट (पेपर बचत)</option>
              </select>
            </div>

            {/* Quality Adjustments */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>ब्राइटनेस:</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="90"
                max="130"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />

              <div className="flex justify-between font-semibold text-slate-600">
                <span>कंट्रास्ट / डार्कनेस:</span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="90"
                max="130"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

          </div>
        </div>

        {/* Right Upload Areas (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              2. कार्ड का अगला भाग (Front) और पिछला भाग (Back) अपलोड करें
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Front Upload Box */}
              <div
                onClick={() => document.getElementById('card-front-input').click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
                  frontImage ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-blue-500 bg-slate-50'
                }`}
              >
                <input
                  id="card-front-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFrontUpload}
                  className="hidden"
                />
                {frontImage ? (
                  <div className="space-y-1">
                    <img src={frontImage} alt="Front" className="max-h-24 object-contain rounded border border-slate-200 mx-auto" />
                    <span className="text-xs text-emerald-700 font-bold block">अगला भाग (Front) चुना गया ✓</span>
                    <span className="text-[10px] text-blue-600 underline">बदलने के लिए क्लिक करें</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">अगला भाग (Front) अपलोड करें</p>
                    <p className="text-[10px] text-slate-400">आधार / पैन / आयुष्मान का फ्रंट फोटो</p>
                  </div>
                )}
              </div>

              {/* Back Upload Box */}
              <div
                onClick={() => document.getElementById('card-back-input').click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
                  backImage ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-blue-500 bg-slate-50'
                }`}
              >
                <input
                  id="card-back-input"
                  type="file"
                  accept="image/*"
                  onChange={handleBackUpload}
                  className="hidden"
                />
                {backImage ? (
                  <div className="space-y-1">
                    <img src={backImage} alt="Back" className="max-h-24 object-contain rounded border border-slate-200 mx-auto" />
                    <span className="text-xs text-emerald-700 font-bold block">पिछला भाग (Back) चुना गया ✓</span>
                    <span className="text-[10px] text-blue-600 underline">बदलने के लिए क्लिक करें</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">पिछला भाग (Back) अपलोड करें</p>
                    <p className="text-[10px] text-slate-400">आधार / पैन / आयुष्मान का बैक फोटो</p>
                  </div>
                )}
              </div>

            </div>



            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-slate-700" />
                कटिंग गाइड: प्रिंट शीट पर 1mm कटिंग बॉर्डर अपने आप लग जाएगा।
              </span>
              <span className="font-bold text-slate-700">मानक साइज़: 85.6 × 54 mm</span>
            </div>

          </div>
        </div>

      </div>

      {/* PRINT SHEET CONTAINER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 print-container">
        
        <div className="no-print flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              प्रिंट प्रीव्यू (Exact Physical Scale: 85.6mm × 54mm)
            </h3>
          </div>
          <button
            onClick={handlePrint}
            disabled={!frontImage && !backImage && !rcDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट कमांड दें</span>
          </button>
        </div>

        {/* Physical Scale Printable Layout */}
        <div 
          className="mx-auto bg-white p-4 flex flex-wrap items-center justify-center gap-4"
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`
          }}
        >
          
          {/* Card Front (Exact CR-80 Proportion 85.6mm x 54mm) */}
          <div
            className="relative border-2 border-dashed border-slate-400 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 shadow-sm"
            style={{
              width: '85.6mm',
              height: '54mm',
              boxSizing: 'border-box'
            }}
          >
            {frontImage ? (
              <img
                src={frontImage}
                alt="Card Front"
                className="w-full h-full object-fill"
              />
            ) : rcDetails ? (
              /* Preloaded Parivahan Smart Card RC Front */
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-2.5 flex flex-col justify-between text-[8px] leading-tight select-none">
                <div className="flex items-center justify-between border-b border-indigo-500/40 pb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">🇮🇳</span>
                    <div>
                      <span className="font-extrabold text-[8px] uppercase tracking-wider block text-yellow-300">भारतीय संघ राज्य</span>
                      <span className="text-[6.5px] text-slate-300 block">परिवहन विभाग • REGISTRATION CERTIFICATE</span>
                    </div>
                  </div>
                  <span className="text-[7px] font-black bg-blue-500/30 px-1 py-0.5 rounded border border-blue-400/40">CR-80 SMART</span>
                </div>

                <div className="grid grid-cols-12 gap-1.5 items-center my-0.5">
                  <div className="col-span-3 flex flex-col items-center">
                    <div className="w-6 h-5 bg-gradient-to-tr from-amber-300 to-yellow-500 rounded border border-amber-600 flex items-center justify-center text-[5px] text-amber-950 font-black shadow-xs">
                      CHIP
                    </div>
                    <span className="text-[6px] text-slate-400 mt-1">EMV SMART</span>
                  </div>

                  <div className="col-span-9 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black font-mono text-yellow-300 tracking-wider">
                        {rcDetails.regNo}
                      </span>
                      <span className="text-[6.5px] text-slate-300 font-mono">Dt: {rcDetails.regDate}</span>
                    </div>
                    <p className="font-bold truncate text-[7.5px] text-white">
                      नाम: {rcDetails.ownerName}
                    </p>
                    <p className="text-[6.5px] text-slate-300 truncate">
                      मॉडल: {rcDetails.makerModel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-indigo-500/40 pt-1 text-[6.5px] text-slate-300">
                  <span>प्राधिकरण: {rcDetails.state || 'परिवहन कार्यालय'}</span>
                  <span className="font-mono text-yellow-400">RC-SMART-VALID</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-2 text-slate-400 no-print">
                <CreditCard className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-[11px] font-bold block">Front (अगला भाग)</span>
                <span className="text-[9px]">85.6 mm × 54 mm</span>
              </div>
            )}
            {/* Scissor indicator */}
            <div className="absolute top-1 left-1 opacity-30 text-[9px] pointer-events-none">✂</div>
          </div>

          {/* Card Back (Exact CR-80 Proportion 85.6mm x 54mm) */}
          <div
            className="relative border-2 border-dashed border-slate-400 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 shadow-sm"
            style={{
              width: '85.6mm',
              height: '54mm',
              boxSizing: 'border-box'
            }}
          >
            {backImage ? (
              <img
                src={backImage}
                alt="Card Back"
                className="w-full h-full object-fill"
              />
            ) : rcDetails ? (
              /* Preloaded Parivahan Smart Card RC Back */
              <div className="w-full h-full bg-slate-900 text-white p-2.5 flex flex-col justify-between text-[7.5px] leading-tight select-none border border-slate-800">
                <div className="bg-black/40 px-1.5 py-0.5 rounded text-[6.5px] flex justify-between font-mono text-slate-300 border border-slate-800">
                  <span>CHASSIS: {rcDetails.chassisNo}</span>
                  <span>ENGINE: {rcDetails.engineNo}</span>
                </div>

                <div className="space-y-0.5 py-0.5 text-[7px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ईंधन (Fuel):</span>
                    <span className="font-bold text-white">{rcDetails.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">फिटनेस वैध (Fitness):</span>
                    <span className="font-bold text-emerald-400">{rcDetails.fitnessUpto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">बीमा वैध (Insurance):</span>
                    <span className="font-bold text-yellow-300">{rcDetails.insuranceUpto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">प्रदूषण वैध (PUC):</span>
                    <span className="font-bold text-slate-200">{rcDetails.puccUpto}</span>
                  </div>
                </div>

                <div className="border-t border-slate-700/60 pt-1 flex items-center justify-between text-[6px] text-slate-400">
                  <span>डिजिटल सेवा केंद्र अधिकृत प्रति</span>
                  <span className="font-mono text-slate-500">||||| | |||| ||| ||||</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-2 text-slate-400 no-print">
                <CreditCard className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-[11px] font-bold block">Back (पिछला भाग)</span>
                <span className="text-[9px]">85.6 mm × 54 mm</span>
              </div>
            )}
            {/* Scissor indicator */}
            <div className="absolute top-1 right-1 opacity-30 text-[9px] pointer-events-none">✂</div>
          </div>

        </div>

        {/* Paper Saving Advice */}
        <div className="no-print mt-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-xs text-slate-600">
          💡 <strong>प्रिंट टिप:</strong> प्रिंटर सेटिंग्स में <strong>Scale: 100% (Actual Size)</strong> चुनें और <strong>Paper Size: A4</strong> या <strong>4×6 Glossy</strong> रखें। दोनों कार्ड एक-दूसरे के बगल में बिल्कुल सही साइज़ में प्रिंट होंगे, जिन्हें कैंची से काटकर सीधे 65x95mm लेमिनेशन पाउच में डाला जा सकता है।
        </div>

      </div>

    </div>
  );
}
