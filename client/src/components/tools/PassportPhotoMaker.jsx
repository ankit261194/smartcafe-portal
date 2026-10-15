import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Printer, Download, Eye, RefreshCw, Sparkles, 
  Crop, CheckCircle2, Sliders, ShieldCheck, Image as ImageIcon,
  Palette, Scissors, Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function PassportPhotoMaker({ onOrderSaved }) {
  const { language } = useLanguage();

  const [sourceFile, setSourceFile] = useState(null);
  const [sourceImgUrl, setSourceImgUrl] = useState('/images/sample_avatar.jpg');
  const [photoCount, setPhotoCount] = useState(8); // 6, 8, 12, 16, 32
  const [paperSize, setPaperSize] = useState('4x6'); // '4x6' or 'a4'
  const [borderType, setBorderType] = useState('black_line'); // 'black_line', 'white_studio', 'none'
  const [bgColor, setBgColor] = useState('original'); // 'original', 'white', 'sky_blue', 'light_gray'
  const [contrast, setContrast] = useState(105);
  const [brightness, setBrightness] = useState(105);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sheetDataUrl, setSheetDataUrl] = useState('');

  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const PHOTO_PRESETS = [
    { count: 8, paper: '4x6', name: '4×6 इंच शीट (8 फोटो - 2×4 ग्रिड)', desc: 'मानक स्टूडियो साइज़ • सबसे ज्यादा इस्तेमाल होने वाला' },
    { count: 6, paper: '4x6', name: '4×6 इंच शीट (6 फोटो - 2×3 ग्रिड)', desc: 'चौड़े बॉर्डर व मार्जिन के साथ' },
    { count: 12, paper: 'a4', name: 'A4 पेपर शीट (12 फोटो - 3×4 ग्रिड)', desc: 'साधारण A4 पेपर या फोटो पेपर के लिए' },
    { count: 16, paper: 'a4', name: 'A4 पेपर शीट (16 फोटो - 4×4 ग्रिड)', desc: 'अधिक फोटो प्रति शीट' },
    { count: 32, paper: 'a4', name: 'A4 पेपर शीट (32 फोटो - 4×8 ग्रिड)', desc: 'थोक पासपोर्ट फोटो प्रिंट' }
  ];

  // Handle Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImgUrl(event.target.result);
      generateSheet(event.target.result, photoCount, paperSize);
    };
    reader.readAsDataURL(file);
  };

  // Generate Printable Sheet via Canvas @ 300 DPI
  const generateSheet = (imgSrc, count, paper) => {
    if (!imgSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 300 DPI Dimensions:
      // Passport photo: 3.5cm x 4.5cm = 413px x 531px
      const photoW = 413;
      const photoH = 531;

      // Paper Dimensions @ 300 DPI:
      // 4x6 inch = 1200px x 1800px
      // A4 (8.27 x 11.69 inch) = 2480px x 3508px
      let sheetW = 1800; // Landscape 6x4 or Portrait
      let sheetH = 1200;
      let cols = 4;
      let rows = 2;

      if (paper === '4x6') {
        if (count === 8) {
          sheetW = 1800; sheetH = 1200; cols = 4; rows = 2;
        } else {
          sheetW = 1800; sheetH = 1200; cols = 3; rows = 2;
        }
      } else {
        // A4 Portrait: 2480 x 3508
        sheetW = 2480; sheetH = 3508;
        if (count === 12) { cols = 3; rows = 4; }
        else if (count === 16) { cols = 4; rows = 4; }
        else { cols = 4; rows = 8; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = sheetW;
      canvas.height = sheetH;
      const ctx = canvas.getContext('2d');

      // 1. Fill clean white paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      // 2. Prepare single processed photo canvas
      const singleCanvas = document.createElement('canvas');
      singleCanvas.width = photoW;
      singleCanvas.height = photoH;
      const sCtx = singleCanvas.getContext('2d');

      // Background color if selected
      if (bgColor === 'white') {
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, photoW, photoH);
      } else if (bgColor === 'sky_blue') {
        sCtx.fillStyle = '#bae6fd';
        sCtx.fillRect(0, 0, photoW, photoH);
      } else if (bgColor === 'light_gray') {
        sCtx.fillStyle = '#f1f5f9';
        sCtx.fillRect(0, 0, photoW, photoH);
      }

      // Apply brightness & contrast filters
      sCtx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;

      // Crop/Scale photo into 3.5cm x 4.5cm ratio (center-crop)
      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;
      const srcRatio = srcW / srcH;
      const targetRatio = photoW / photoH;

      let sx = 0, sy = 0, sw = srcW, sh = srcH;
      if (srcRatio > targetRatio) {
        sw = srcH * targetRatio;
        sx = (srcW - sw) / 2;
      } else {
        sh = srcW / targetRatio;
        sy = (srcH - sh) / 2;
      }

      sCtx.drawImage(img, sx, sy, sw, sh, 0, 0, photoW, photoH);

      // Border on single photo
      if (borderType === 'black_line') {
        sCtx.strokeStyle = '#0f172a';
        sCtx.lineWidth = 3;
        sCtx.strokeRect(1, 1, photoW - 2, photoH - 2);
      } else if (borderType === 'white_studio') {
        sCtx.strokeStyle = '#ffffff';
        sCtx.lineWidth = 8;
        sCtx.strokeRect(4, 4, photoW - 8, photoH - 8);
        sCtx.strokeStyle = '#cbd5e1';
        sCtx.lineWidth = 1;
        sCtx.strokeRect(1, 1, photoW - 2, photoH - 2);
      }

      // 3. Grid Layout Spacing Calculations
      const totalPhotosW = cols * photoW;
      const totalPhotosH = rows * photoH;
      const gapX = (sheetW - totalPhotosW) / (cols + 1);
      const gapY = (sheetH - totalPhotosH) / (rows + 1);

      // 4. Place photos on sheet with cutting guidelines
      let placed = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (placed >= count) break;

          const posX = gapX + c * (photoW + gapX);
          const posY = gapY + r * (photoH + gapY);

          ctx.drawImage(singleCanvas, posX, posY);

          // Draw subtle dashed scissor cutting marks between photos
          ctx.setLineDash([8, 8]);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;

          // Corner guide marks
          ctx.beginPath();
          ctx.moveTo(posX - 10, posY);
          ctx.lineTo(posX + photoW + 10, posY);
          ctx.moveTo(posX, posY - 10);
          ctx.lineTo(posX, posY + photoH + 10);
          ctx.stroke();

          placed++;
        }
      }

      ctx.setLineDash([]); // Reset line dash

      const outUrl = canvas.toDataURL('image/jpeg', 0.96);
      setSheetDataUrl(outUrl);
      setIsProcessing(false);

      // Log order in backend (₹0 free utility)
      logUtilityOrder('passport_photo_maker', count);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = imgSrc;
  };

  // Re-generate when controls change
  useEffect(() => {
    if (sourceImgUrl) {
      generateSheet(sourceImgUrl, photoCount, paperSize);
    }
  }, [photoCount, paperSize, borderType, bgColor, contrast, brightness]);

  // Log order in backend
  const logUtilityOrder = async (toolId, count) => {
    try {
      await fetch('/api/services/execute-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: toolId,
          serviceId: toolId,
          params: { photoCount: count, paperSize },
          operatorB2bDirect: true
        })
      });
      if (onOrderSaved) onOrderSaved();
    } catch (e) {}
  };

  // 1-Click Print
  const handlePrint = () => {
    window.print();
  };

  // 1-Click Download
  const handleDownload = () => {
    if (!sheetDataUrl) return;
    const a = document.createElement('a');
    a.href = sheetDataUrl;
    a.download = `Passport_Photos_${photoCount}_Sheet_${paperSize}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      
      {/* Print Specific CSS to Isolate 4x6 / A4 Photo Sheet during window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-passport-sheet, #printable-passport-sheet * {
            visibility: visible !important;
          }
          #printable-passport-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperSize === '4x6' ? '6in' : '210mm'} !important;
            height: ${paperSize === '4x6' ? '4in' : '297mm'} !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            z-index: 999999 !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: ${paperSize === '4x6' ? '6in 4in landscape' : 'A4 portrait'} !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Tool Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Camera className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/25 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                100% FREE • 1-CLICK ACTION
              </span>
              <span className="bg-amber-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                3.5cm × 4.5cm Standard
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1">
              1-क्लिक पासपोर्ट साइज फोटो मेकर (4x6 शीट / 8 फोटो)
            </h2>
            <p className="text-xs text-blue-100 font-medium">
              1 फोटो अपलोड करें — तुरंत 4×6 पेपर पर 8 फोटो (या 6/12/16 फोटो) बॉर्डर व कटिंग मार्क्स के साथ तैयार!
            </p>
          </div>
        </div>

        {/* 1-Click Print CTA */}
        {sheetDataUrl && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="bg-white/20 hover:bg-white/30 text-white font-black px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>डाउनलोड</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="bg-white text-blue-700 hover:bg-blue-50 font-black px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-5 h-5 text-blue-700" />
              <span>🖨️ 1-क्लिक प्रिंट निकालें</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Controls on Left, Live Sheet Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Upload Photo */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>1. ग्राहक की फोटो अपलोड करें</span>
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                {sourceFile ? sourceFile.name : 'यहाँ क्लिक करके फोटो चुनें'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                मोबाइल से खींची गई या स्कैन की गई कोई भी फोटो (JPG, PNG)
              </p>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                प्रिंट लेआउट व फोटो संख्या चुनें:
              </label>
              <div className="space-y-2">
                {PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPhotoCount(p.count);
                      setPaperSize(p.paper);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      photoCount === p.count && paperSize === p.paper
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{p.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </div>
                    {photoCount === p.count && paperSize === p.paper && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 2. Photo Enhancement & Styling */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>2. फोटो स्टाइलिंग व बॉर्डर</span>
            </h3>

            {/* Border Options */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                फोटो बॉर्डर (Cutting Outline):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBorderType('black_line')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    borderType === 'black_line'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  पतली काली लाइन
                </button>
                <button
                  type="button"
                  onClick={() => setBorderType('white_studio')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    borderType === 'white_studio'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  स्टूडियो व्हाइट
                </button>
                <button
                  type="button"
                  onClick={() => setBorderType('none')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    borderType === 'none'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  बिना बॉर्डर
                </button>
              </div>
            </div>

            {/* Brightness & Contrast */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span>ब्राइटनेस (चेहरा साफ करें)</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <span>कंट्रास्ट (क्लैरिटी)</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="140"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PRINT SHEET PREVIEW (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-blue-600" />
                  <span>लाइव 300 DPI प्रिंटेबल शीट प्रीव्यू ({paperSize === '4x6' ? '4×6 इंच' : 'A4'} • {photoCount} फोटो)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  प्रत्येक फोटो: 3.5cm × 4.5cm • बीच में कैंची कटिंग गाइड्स के साथ
                </p>
              </div>

              {sheetDataUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>डाउनलोड</span>
                </button>
              )}
            </div>

            {/* PRINTABLE CANVAS CONTAINER */}
            {isProcessing ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-blue-600">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs font-black">पासपोर्ट फोटो शीट तैयार हो रही है...</span>
              </div>
            ) : sheetDataUrl ? (
              
              /* PRINTABLE SHEET CONTAINER (Mapped to #printable-passport-sheet for print) */
              <div 
                id="printable-passport-sheet"
                className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center"
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest text-center mb-3 no-print">
                  --- {paperSize === '4x6' ? '4x6 INCH PHOTO PAPER SHEET' : 'A4 PHOTO PAPER SHEET'} ---
                </div>

                {/* The Sheet Image */}
                <div className="max-w-full overflow-hidden rounded-xl shadow-2xl border-2 border-slate-900 bg-white">
                  <img
                    src={sheetDataUrl}
                    alt="Passport Photo Sheet"
                    className="max-h-[460px] w-auto object-contain mx-auto"
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 no-print flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>300 DPI स्टूडियो क्वालिटी। प्रिंटर में {paperSize === '4x6' ? '4×6 फोटो पेपर' : 'A4 पेपर'} लगाएं और प्रिंट करें।</span>
                </div>
              </div>

            ) : null}

            {/* Bottom Actions Bar */}
            {sheetDataUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% फ्री सेवा • अनलिमिटेड प्रिंट</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>HD शीट सेव करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ 1-क्लिक प्रिंट निकालें</span>
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
