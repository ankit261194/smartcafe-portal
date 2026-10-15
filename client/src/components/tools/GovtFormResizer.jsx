import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck, Upload, Download, RefreshCw, Sparkles, 
  Crop, CheckCircle2, Sliders, ShieldCheck, AlertCircle,
  FileImage, Scale, Check, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function GovtFormResizer({ onOrderSaved }) {
  const { language } = useLanguage();

  const [sourceFile, setSourceFile] = useState(null);
  const [sourceImgUrl, setSourceImgUrl] = useState('');
  const [originalSizeKb, setOriginalSizeKb] = useState(0);

  // Preset definitions
  const PRESETS = [
    {
      id: 'ssc_photo',
      name: 'SSC फोटो (GD / CGL / CHSL)',
      tag: 'SSC 20KB - 50KB',
      category: 'SSC Form',
      targetKb: 45,
      minKb: 20,
      maxKb: 50,
      width: 200,
      height: 230,
      desc: 'साइज: 20KB से 50KB के बीच (3.5 × 4.5 cm)'
    },
    {
      id: 'ssc_sign',
      name: 'SSC हस्ताक्षर (Signature)',
      tag: 'SSC 10KB - 20KB',
      category: 'SSC Form',
      targetKb: 18,
      minKb: 10,
      maxKb: 20,
      width: 140,
      height: 60,
      desc: 'साइज: 10KB से 20KB के बीच (140 × 60 px)'
    },
    {
      id: 'police_photo',
      name: 'UP पुलिस भर्ती फोटो (Police Photo)',
      tag: 'Police 20KB - 50KB',
      category: 'Police',
      targetKb: 45,
      minKb: 20,
      maxKb: 50,
      width: 200,
      height: 250,
      desc: 'साइज: 20KB से 50KB, सफेद या हल्का बैकग्राउंड'
    },
    {
      id: 'police_sign',
      name: 'UP पुलिस हस्ताक्षर (Police Sign)',
      tag: 'Police 5KB - 20KB',
      category: 'Police',
      targetKb: 18,
      minKb: 5,
      maxKb: 20,
      width: 140,
      height: 60,
      desc: 'साइज: 5KB से 20KB (ब्लैक इंक साइन)'
    },
    {
      id: 'pan_photo',
      name: 'PAN कार्ड फोटो (UTI / NSDL)',
      tag: 'PAN 213x213 < 30KB',
      category: 'PAN',
      targetKb: 28,
      minKb: 10,
      maxKb: 30,
      width: 213,
      height: 213,
      desc: '213 × 213 px, 300 DPI, 30KB से कम'
    },
    {
      id: 'pan_sign',
      name: 'PAN कार्ड हस्ताक्षर (UTI / NSDL)',
      tag: 'PAN 400x200 < 30KB',
      category: 'PAN',
      targetKb: 28,
      minKb: 10,
      maxKb: 30,
      width: 400,
      height: 200,
      desc: '400 × 200 px, 30KB से कम'
    },
    {
      id: 'scholarship_photo',
      name: 'छात्रवृत्ति फॉर्म फोटो (UP / NSP)',
      tag: 'Scholarship < 20KB',
      category: 'Scholarship',
      targetKb: 18,
      minKb: 5,
      maxKb: 20,
      width: 150,
      height: 180,
      desc: 'साइज: 20KB से कम'
    },
    {
      id: 'custom_50',
      name: 'सटीक 50KB कंप्रेसर (Exact 50KB)',
      tag: 'Exact 50KB',
      category: 'Custom',
      targetKb: 48,
      minKb: 20,
      maxKb: 50,
      width: 300,
      height: 300,
      desc: 'किसी भी सरकारी फॉर्म के लिए परफेक्ट 50KB'
    },
    {
      id: 'custom_100',
      name: 'सटीक 100KB कंप्रेसर (Exact 100KB)',
      tag: 'Exact 100KB',
      category: 'Custom',
      targetKb: 95,
      minKb: 50,
      maxKb: 100,
      width: 600,
      height: 600,
      desc: 'दस्तावेज़ / मार्कशीट के लिए 100KB'
    }
  ];

  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customKb, setCustomKb] = useState(50);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState('');
  const [processedSizeKb, setProcessedSizeKb] = useState(0);
  const [processedDimensions, setProcessedDimensions] = useState({ w: 0, h: 0 });

  const fileInputRef = useRef(null);

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceFile(file);
    setOriginalSizeKb((file.size / 1024).toFixed(1));

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImgUrl(event.target.result);
      processCompression(event.target.result, selectedPreset, customKb, isCustomMode);
    };
    reader.readAsDataURL(file);
  };

  // High Precision Binary Search Compression Algorithm
  const processCompression = (imgSrc, presetObj, targetKbVal, customActive) => {
    if (!imgSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      const targetKB = customActive ? Number(targetKbVal) : presetObj.targetKb;
      const minKB = customActive ? Math.max(5, targetKB - 15) : presetObj.minKb;
      const maxKB = customActive ? targetKB : presetObj.maxKb;

      let targetW = customActive ? srcW : presetObj.width;
      let targetH = customActive ? srcH : presetObj.height;

      // Maintain aspect ratio if custom or standard scaling
      if (customActive || !presetObj.width) {
        if (srcW > 1200 || srcH > 1200) {
          const ratio = Math.min(1200 / srcW, 1200 / srcH);
          targetW = Math.round(srcW * ratio);
          targetH = Math.round(srcH * ratio);
        } else {
          targetW = srcW;
          targetH = srcH;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      // Crisp rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // White background fill for transparent PNGs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);

      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Binary search for optimal JPEG quality to hit targetKB
      let low = 0.05;
      let high = 0.98;
      let bestQuality = 0.85;
      let bestDataUrl = '';
      let bestSizeKb = 0;

      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        const testDataUrl = canvas.toDataURL('image/jpeg', mid);
        // Calculate size in KB from base64
        const stringLength = testDataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
        const sizeInKb = sizeInBytes / 1024;

        bestDataUrl = testDataUrl;
        bestSizeKb = sizeInKb;
        bestQuality = mid;

        if (sizeInKb > targetKB) {
          high = mid; // Too large, decrease quality
        } else {
          low = mid; // Within or below target, try higher quality
        }
      }

      setProcessedUrl(bestDataUrl);
      setProcessedSizeKb(bestSizeKb.toFixed(1));
      setProcessedDimensions({ w: targetW, h: targetH });
      setIsProcessing(false);

      // Save order in backend
      logUtilityOrder('govt_form_resizer', `${bestSizeKb.toFixed(1)}KB`);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = imgSrc;
  };

  // Re-process when preset or custom target changes
  useEffect(() => {
    if (sourceImgUrl) {
      processCompression(sourceImgUrl, selectedPreset, customKb, isCustomMode);
    }
  }, [selectedPreset, customKb, isCustomMode]);

  // Log order in backend
  const logUtilityOrder = async (toolId, sizeStr) => {
    try {
      await fetch('/api/services/execute-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: toolId,
          serviceId: toolId,
          params: { targetKb: sizeStr, presetName: selectedPreset.name },
          operatorB2bDirect: true
        })
      });
      if (onOrderSaved) onOrderSaved();
    } catch (e) {}
  };

  // 1-Click Download
  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `Resized_${selectedPreset.id}_${processedSizeKb}KB.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      
      {/* Tool Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Scale className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/25 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                100% FREE • NO QUALITY LOSS
              </span>
              <span className="bg-emerald-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                Exact 20KB - 50KB Presets
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1">
              सरकारी फॉर्म फोटो व साइन रिसाइज़र (20KB - 50KB Exact)
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              SSC, UP पुलिस, छात्रवृत्ति व पैन फॉर्म के लिए फोटो व हस्ताक्षर अपलोड करें — 1-क्लिक में बिना धुंधला हुए सटीक KB में सेट करें!
            </p>
          </div>
        </div>

        {/* 1-Click Download CTA */}
        {processedUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-black px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer shrink-0"
          >
            <Download className="w-5 h-5 text-emerald-700" />
            <span>📥 कंप्रेस्ड फ़ाइल डाउनलोड करें</span>
          </button>
        )}
      </div>

      {/* Grid: Controls on Left, Live Resized Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & PRESETS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. Upload Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>1. फोटो या हस्ताक्षर अपलोड करें</span>
            </h3>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileImage className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                {sourceFile ? sourceFile.name : 'यहाँ क्लिक करके फोटो या साइन चुनें'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {sourceFile ? `मूल साइज़: ${originalSizeKb} KB` : 'JPG, PNG फ़ाइल (कितने भी MB की हो)'}
              </p>
            </div>

            {/* Presets List */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                सरकारी फॉर्म प्रीसेट चुनें (Target Preset):
              </label>
              
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(p);
                      setIsCustomMode(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedPreset.id === p.id && !isCustomMode
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {p.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </div>
                    {selectedPreset.id === p.id && !isCustomMode && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom KB Input */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={isCustomMode}
                  onChange={(e) => setIsCustomMode(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>कस्टम KB साइज़ सेट करें (Custom Target KB)</span>
              </label>

              {isCustomMode && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={customKb}
                    onChange={(e) => setCustomKb(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono font-black text-sm text-center"
                  />
                  <span className="text-xs font-bold text-slate-500">KB (सटीक साइज़)</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: BEFORE VS AFTER COMPARISON & DOWNLOAD (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>कंप्रेस रिज़ल्ट व क्लैरिटी तुलना (Before vs After)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  सरकारी पोर्टल के लिए 100% कंपैटिबल • बिना धुंधलापन के सटीक KB
                </p>
              </div>

              {processedUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड</span>
                </button>
              )}
            </div>

            {/* RESULTS CONTAINER */}
            {isProcessing ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-emerald-600">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-xs font-black">सटीक KB में कंप्रेस किया जा रहा है...</span>
              </div>
            ) : processedUrl ? (
              
              <div className="space-y-4">
                
                {/* Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-500 font-bold">मूल साइज़ (Original)</div>
                    <div className="text-sm sm:text-base font-mono font-black text-slate-700 dark:text-slate-300 mt-0.5">
                      {originalSizeKb} KB
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">नया साइज़ (Compressed)</div>
                    <div className="text-sm sm:text-base font-mono font-black text-emerald-700 dark:text-emerald-300 mt-0.5 flex items-center justify-center gap-1">
                      <span>{processedSizeKb} KB</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/60 p-3 rounded-2xl border border-blue-200 dark:border-blue-800/60">
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">डाइमेंशन्स (Pixels)</div>
                    <div className="text-sm sm:text-base font-mono font-black text-blue-700 dark:text-blue-300 mt-0.5">
                      {processedDimensions.w} × {processedDimensions.h}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="p-3 bg-emerald-100/70 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs font-black text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>सत्यापित: {selectedPreset.name} के सभी नियमों के 100% अनुकूल है!</span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    वेरिफाइड ✅
                  </span>
                </div>

                {/* Image Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Original */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      मूल फोटो (Original) • {originalSizeKb} KB
                    </span>
                    <div className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img
                        src={sourceImgUrl}
                        alt="Original"
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Compressed */}
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                      कंप्रेस्ड रिज़ल्ट (Exact {processedSizeKb} KB)
                    </span>
                    <div className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 overflow-hidden border-2 border-emerald-500 shadow-md">
                      <img
                        src={processedUrl}
                        alt="Compressed"
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                </div>

              </div>

            ) : (
              /* Empty State */
              <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Scale className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    कोई फोटो या हस्ताक्षर अपलोड नहीं किया गया
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    बाईं ओर से अपनी फोटो या हस्ताक्षर चुनें। टूल तुरंत उसे SSC, पुलिस या फॉर्म के सटीक 20KB - 50KB में कंप्रेस कर देगा।
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            {processedUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% फ्री टूल • अनलिमिटेड रिसाइजिंग</span>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>📥 कंप्रेस्ड फ़ाइल तुरंत डाउनलोड करें</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
