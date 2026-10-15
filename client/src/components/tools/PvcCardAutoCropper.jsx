import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Printer, Download, Eye, RefreshCw, Sparkles, 
  Crop, CheckCircle2, Sliders, ShieldCheck, CreditCard,
  FileText, Layers, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function PvcCardAutoCropper({ onOrderSaved }) {
  const { language, t } = useLanguage();
  
  const [sourceFile, setSourceFile] = useState(null);
  const [sourceImgUrl, setSourceImgUrl] = useState('');
  const [preset, setPreset] = useState('aadhaar'); // 'aadhaar', 'voter', 'ayushman', 'custom'
  const [cardLayout, setCardLayout] = useState('side_by_side'); // 'side_by_side', 'stacked'
  const [contrast, setContrast] = useState(105);
  const [brightness, setBrightness] = useState(102);
  const [showBorder, setShowBorder] = useState(true);
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frontCardUrl, setFrontCardUrl] = useState('');
  const [backCardUrl, setBackCardUrl] = useState('');
  const [separateBackUpload, setSeparateBackUpload] = useState('');

  const fileInputRef = useRef(null);
  const backInputRef = useRef(null);
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const a4SheetCanvasRef = useRef(null);

  // Default Sample Cards for instant 1-click preview without uploading
  const DEFAULT_SAMPLE = '/images/sample_pvc_sheet.png';

  const PRESETS_INFO = [
    {
      id: 'aadhaar',
      name: language === 'hi' ? '🪪 ई-आधार (UIDAI A4)' : '🪪 e-Aadhaar (UIDAI A4)',
      desc: language === 'hi' ? 'आधार के निचले हिस्से से फ्रंट व बैक 1-क्लिक में अलग करें' : 'Auto crop Front & Back from bottom section'
    },
    {
      id: 'voter',
      name: language === 'hi' ? '🗳️ वोटर कार्ड (e-EPIC A4)' : '🗳️ Voter Card (e-EPIC)',
      desc: language === 'hi' ? 'डिजिटल वोटर कार्ड A4 शीट से CR-80 PVC में सेट करें' : 'Crop Election Voter Card to standard PVC'
    },
    {
      id: 'ayushman',
      name: language === 'hi' ? '🏥 आयुष्मान कार्ड (PM-JAY)' : '🏥 Ayushman Card (PM-JAY)',
      desc: language === 'hi' ? 'गोल्डन कार्ड PDF से फ्रंट व बैक 85.6mm×54mm में निकालें' : 'Extract Golden Card to standard PVC layout'
    },
    {
      id: 'custom',
      name: language === 'hi' ? '📂 कस्टम / अलग-अलग फ्रंट-बैक' : '📂 Custom / Separate Sides',
      desc: language === 'hi' ? 'कोई भी कार्ड या फ्रंट व बैक अलग-अलग अपलोड करें' : 'Upload front & back separately'
    }
  ];

  // Handle Main File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImgUrl(event.target.result);
      processAutoCrop(event.target.result, preset, separateBackUpload);
    };
    reader.readAsDataURL(file);
  };

  // Handle Separate Back Image Upload
  const handleBackUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSeparateBackUpload(event.target.result);
      processAutoCrop(sourceImgUrl, 'custom', event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Auto-Crop Engine via HTML5 Canvas (300 DPI Standard: 1011px x 638px)
  const processAutoCrop = (imgSrc, currentPreset, backImgSrc = '') => {
    if (!imgSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const W = img.naturalWidth || img.width;
      const H = img.naturalHeight || img.height;

      // CR-80 dimensions at 300 DPI: 1011 x 638 pixels (85.6mm x 53.98mm)
      const targetW = 1011;
      const targetH = 638;

      // Create Front Canvas
      const frontCanvas = document.createElement('canvas');
      frontCanvas.width = targetW;
      frontCanvas.height = targetH;
      const fCtx = frontCanvas.getContext('2d');
      fCtx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;

      // Create Back Canvas
      const backCanvas = document.createElement('canvas');
      backCanvas.width = targetW;
      backCanvas.height = targetH;
      const bCtx = backCanvas.getContext('2d');
      bCtx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;

      if (currentPreset === 'aadhaar') {
        // Standard UIDAI A4 sheet:
        // Bottom ~28% contains Front (left half) and Back (right half)
        const cropY = H * 0.70;
        const cropH = H * 0.285;
        const halfW = W * 0.485;

        // Draw Front Card (Left side of bottom section)
        fCtx.drawImage(img, W * 0.02, cropY, halfW, cropH, 0, 0, targetW, targetH);

        // Draw Back Card (Right side of bottom section)
        bCtx.drawImage(img, W * 0.50, cropY, halfW, cropH, 0, 0, targetW, targetH);
      } else if (currentPreset === 'voter') {
        // Standard ECI Voter PDF: card is usually centered or in bottom half
        const cropY = H > W ? H * 0.55 : H * 0.10;
        const cropH = H * 0.38;
        const halfW = W * 0.48;

        fCtx.drawImage(img, W * 0.03, cropY, halfW, cropH, 0, 0, targetW, targetH);
        bCtx.drawImage(img, W * 0.51, cropY, halfW, cropH, 0, 0, targetW, targetH);
      } else if (currentPreset === 'ayushman') {
        // Ayushman card: typically two side-by-side or stacked
        const cropY = H * 0.15;
        const cropH = H * 0.35;
        const halfW = W * 0.48;

        fCtx.drawImage(img, W * 0.03, cropY, halfW, cropH, 0, 0, targetW, targetH);
        bCtx.drawImage(img, W * 0.51, cropY, halfW, cropH, 0, 0, targetW, targetH);
      } else {
        // Custom: If separate back is provided, front uses full imgSrc and back uses backImgSrc
        fCtx.drawImage(img, 0, 0, W, H, 0, 0, targetW, targetH);

        if (backImgSrc) {
          const backImg = new Image();
          backImg.onload = () => {
            bCtx.drawImage(backImg, 0, 0, backImg.naturalWidth, backImg.naturalHeight, 0, 0, targetW, targetH);
            setBackCardUrl(backCanvas.toDataURL('image/png', 0.95));
          };
          backImg.src = backImgSrc;
        } else {
          // If single image in custom mode, split horizontally in half
          fCtx.drawImage(img, 0, 0, W * 0.5, H, 0, 0, targetW, targetH);
          bCtx.drawImage(img, W * 0.5, 0, W * 0.5, H, 0, 0, targetW, targetH);
        }
      }

      // Add border guide if enabled
      if (showBorder) {
        [fCtx, bCtx].forEach(ctx => {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, targetW - 4, targetH - 4);
        });
      }

      const fUrl = frontCanvas.toDataURL('image/png', 0.95);
      const bUrl = backCanvas.toDataURL('image/png', 0.95);

      setFrontCardUrl(fUrl);
      setBackCardUrl(bUrl);
      setIsProcessing(false);

      // Save order in backend (strictly ₹0 free utility)
      logUtilityOrder('pvc_auto_cropper', 'A4 to PVC कार्ड ऑटो-क्रॉपर');
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = imgSrc;
  };

  // Re-run crop when settings change
  useEffect(() => {
    if (sourceImgUrl) {
      processAutoCrop(sourceImgUrl, preset, separateBackUpload);
    }
  }, [preset, contrast, brightness, showBorder]);

  // Log order in backend
  const logUtilityOrder = async (toolId, name) => {
    try {
      await fetch('/api/services/execute-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: toolId,
          serviceId: toolId,
          params: { cardType: 'CR-80 PVC Card', preset },
          operatorB2bDirect: true
        })
      });
      if (onOrderSaved) onOrderSaved();
    } catch (e) {}
  };

  // 1-Click Print A4 Sheet
  const handlePrint = () => {
    window.print();
  };

  // 1-Click Download Front or Back PNG
  const handleDownload = (dataUrl, filename) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      
      {/* Print Specific CSS to Isolate A4 PVC Layout during window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-pvc-a4-sheet, #printable-pvc-a4-sheet * {
            visibility: visible !important;
          }
          #printable-pvc-a4-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            background: #ffffff !important;
            z-index: 999999 !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Tool Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Crop className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/25 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                100% FREE • 1-CLICK ACTION
              </span>
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                ISO CR-80 Standard
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1">
              A4 to PVC कार्ड ऑटो-क्रॉपर (CR-80 85.6mm × 54mm)
            </h2>
            <p className="text-xs text-amber-100 font-medium">
              ई-आधार, वोटर कार्ड या आयुष्मान A4 PDF/इमेज अपलोड करें — फोटोशॉप की जरूरत नहीं, 1-क्लिक में फ्रंट व बैक प्रिंट के लिए तैयार!
            </p>
          </div>
        </div>

        {/* Quick Print CTA */}
        {frontCardUrl && (
          <button
            type="button"
            onClick={handlePrint}
            className="bg-white text-orange-600 hover:bg-orange-50 font-black px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer shrink-0"
          >
            <Printer className="w-5 h-5 text-orange-600" />
            <span>🖨️ सीधे A4 प्रिंट निकालें</span>
          </button>
        )}
      </div>

      {/* Main Grid: Upload & Controls on Left, Live PVC Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: UPLOAD & PRESET CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Upload Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-600" />
              <span>1. A4 PDF या कार्ड इमेज अपलोड करें</span>
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-300 dark:border-orange-900/60 hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-900/60 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                {sourceFile ? sourceFile.name : 'यहाँ क्लिक करें या फ़ाइल ड्रैग करें'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                ई-आधार, वोटर, आयुष्मान A4 PDF या JPG, PNG (1-क्लिक ऑटो-डिटेक्ट)
              </p>
            </div>

            {/* Presets Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                कार्ड का प्रकार (Preset Auto-Detect):
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS_INFO.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPreset(p.id);
                      if (sourceImgUrl) processAutoCrop(sourceImgUrl, p.id, separateBackUpload);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      preset === p.id 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-black shadow-xs' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{p.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </div>
                    {preset === p.id && <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mode: Back Image Upload if needed */}
            {preset === 'custom' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                  बैक साइड इमेज (Back Side - Optional):
                </label>
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-orange-600" />
                  <span>{separateBackUpload ? 'बैक साइड चुनी गई ✅' : 'बैक साइड अलग से अपलोड करें'}</span>
                </button>
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* 2. Visual Enhancements & Print Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-600" />
              <span>2. क्लैरिटी व प्रिंट सेटिंग्स</span>
            </h3>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span>कंट्रास्ट (Contrast / शार्पनेस)</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="140"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span>ब्राइटनेस (सफेद बैकग्राउंड क्लैरिटी)</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="130"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBorder}
                  onChange={(e) => setShowBorder(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>कटिंग बॉर्डर लाइन (Black Outline)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutMarks}
                  onChange={(e) => setShowCutMarks(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>कैंची कटिंग मार्क्स (Scissor Marks)</span>
              </label>
            </div>

            {/* Layout Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">
                A4 प्रिंट लेआउट:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCardLayout('side_by_side')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    cardLayout === 'side_by_side'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  साइड-बाय-साइड (Side-by-Side)
                </button>
                <button
                  type="button"
                  onClick={() => setCardLayout('stacked')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    cardLayout === 'stacked'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ऊपर-नीचे (Stacked)
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: LIVE ISO CR-80 PREVIEW & PRINTABLE A4 SHEET (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span>लाइव CR-80 PVC कार्ड प्रीव्यू (85.6mm × 54mm @ 300 DPI)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  मानक PVC स्मार्ट कार्ड साइज़ • लेमिनेशन व डायरेक्ट PVC प्रिंट के लिए बिल्कुल सटीक
                </p>
              </div>

              {/* Download Actions */}
              {frontCardUrl && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDownload(frontCardUrl, 'Front_Card_CR80.png')}
                    className="p-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1"
                    title="फ्रंट साइड डाउनलोड करें"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Front</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(backCardUrl, 'Back_Card_CR80.png')}
                    className="p-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1"
                    title="बैक साइड डाउनलोड करें"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                </div>
              )}
            </div>

            {/* PREVIEW CONTAINER */}
            {isProcessing ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-orange-600">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs font-black">1-क्लिक ऑटो-क्रॉपिंग प्रक्रिया जारी है...</span>
              </div>
            ) : frontCardUrl ? (
              
              /* PRINTABLE SHEET AREA (Mapped to #printable-pvc-a4-sheet for window.print) */
              <div 
                id="printable-pvc-a4-sheet"
                className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto"
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest text-center mb-3 no-print">
                  --- A4 PRINT SHEET PREVIEW (CUTTING GUIDELINES) ---
                </div>

                <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${
                  cardLayout === 'stacked' ? '!flex-col' : ''
                }`}>
                  
                  {/* FRONT CARD (85.6mm x 54mm) */}
                  <div className="relative group">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider text-center mb-1 no-print">
                      FRONT (सामने का भाग) • 85.6mm
                    </div>
                    
                    <div className="w-[280px] sm:w-[310px] h-[178px] sm:h-[196px] rounded-xl overflow-hidden shadow-lg border-2 border-slate-900 bg-white relative">
                      <img
                        src={frontCardUrl}
                        alt="Front Card CR80"
                        className="w-full h-full object-cover"
                      />
                      {showCutMarks && (
                        <div className="absolute inset-0 pointer-events-none border border-dashed border-red-500/60 m-1 rounded-lg" />
                      )}
                    </div>
                  </div>

                  {/* BACK CARD (85.6mm x 54mm) */}
                  <div className="relative group">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider text-center mb-1 no-print">
                      BACK (पीछे का भाग) • 54mm
                    </div>
                    
                    <div className="w-[280px] sm:w-[310px] h-[178px] sm:h-[196px] rounded-xl overflow-hidden shadow-lg border-2 border-slate-900 bg-white relative">
                      <img
                        src={backCardUrl}
                        alt="Back Card CR80"
                        className="w-full h-full object-cover"
                      />
                      {showCutMarks && (
                        <div className="absolute inset-0 pointer-events-none border border-dashed border-red-500/60 m-1 rounded-lg" />
                      )}
                    </div>
                  </div>

                </div>

                {/* Print Hint Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 no-print flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% सटीक डाइमेंशन्स सेट हैं। प्रिंटर में A4 पेपर या फोटो पेपर डालकर [प्रिंट] दबाएं।</span>
                </div>

              </div>

            ) : (
              /* Empty State */
              <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    कोई A4 PDF या इमेज अपलोड नहीं की गई
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    बाईं ओर अपनी ई-आधार, वोटर या आयुष्मान कार्ड A4 PDF अपलोड करें। टूल तुरंत उसे CR-80 PVC साइज में ऑटो-क्रॉप कर देगा।
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            {frontCardUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>300 DPI हाई-रेज़ोल्यूशन • 100% फ्री सेवा (₹0 शुल्क)</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ A4 शीट प्रिंट निकालें</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
