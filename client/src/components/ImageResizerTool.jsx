import React, { useState, useRef, useEffect } from 'react';
import { 
  Crop, Download, Upload, Sliders, CheckCircle2, 
  Sparkles, FileImage, RefreshCw, AlertCircle, ShieldCheck 
} from 'lucide-react';

const PRESETS = [
  {
    id: 'ssc_photo',
    name: 'SSC Photo (GD/CGL/CHSL)',
    category: 'SSC Form',
    width: 200,
    height: 230,
    targetKb: 45,
    minKb: 20,
    desc: '3.5 x 4.5 cm (20KB से 50KB के बीच)'
  },
  {
    id: 'ssc_sign',
    name: 'SSC Signature (हस्ताक्षर)',
    category: 'SSC Form',
    width: 140,
    height: 60,
    targetKb: 18,
    minKb: 10,
    desc: '140 x 60 px (10KB से 20KB के बीच)'
  },
  {
    id: 'police_photo',
    name: 'UP Police / State Police Photo',
    category: 'Police Form',
    width: 200,
    height: 250,
    targetKb: 45,
    minKb: 20,
    desc: '20KB से 50KB, सफेद या हल्का बैकग्राउंड'
  },
  {
    id: 'police_sign',
    name: 'UP Police Signature',
    category: 'Police Form',
    width: 140,
    height: 60,
    targetKb: 18,
    minKb: 5,
    desc: '5KB से 20KB'
  },
  {
    id: 'pan_photo',
    name: 'UTI / NSDL PAN Photo',
    category: 'PAN Card',
    width: 213,
    height: 213,
    targetKb: 28,
    minKb: 10,
    desc: '213 x 213 px, 300 DPI, 30KB से कम'
  },
  {
    id: 'pan_sign',
    name: 'UTI / NSDL PAN Signature',
    category: 'PAN Card',
    width: 400,
    height: 200,
    targetKb: 28,
    minKb: 10,
    desc: '400 x 200 px, 30KB से कम'
  },
  {
    id: 'scholarship_photo',
    name: 'UP Scholarship Photo',
    category: 'Scholarship',
    width: 150,
    height: 180,
    targetKb: 18,
    minKb: 5,
    desc: '20KB से कम'
  },
  {
    id: 'custom',
    name: 'कस्टम साइज़ (Custom Size)',
    category: 'Custom',
    width: 300,
    height: 300,
    targetKb: 50,
    minKb: 10,
    desc: 'अपनी इच्छानुसार चौड़ाई, ऊंचाई और KB सेट करें'
  }
];

export default function ImageResizerTool() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [width, setWidth] = useState(PRESETS[0].width);
  const [height, setHeight] = useState(PRESETS[0].height);
  const [targetKb, setTargetKb] = useState(PRESETS[0].targetKb);

  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');
  const [processedBlob, setProcessedBlob] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [processedSize, setProcessedSize] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Image adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const canvasRef = useRef(null);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setWidth(preset.width);
    setHeight(preset.height);
    setTargetKb(preset.targetKb);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      setOriginalSize(file.size);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
    }
  };

  // Process image using Canvas and binary search JPEG compression
  const processImage = () => {
    if (!originalUrl) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Clear & set white background (especially for signatures or transparent PNGs)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Apply brightness & contrast filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // Draw image to fill/fit dimensions
      ctx.drawImage(img, 0, 0, width, height);

      // Target max bytes
      const maxBytes = targetKb * 1024;

      // Binary search for optimal JPEG quality to achieve target KB
      let low = 0.05;
      let high = 0.98;
      let bestBlob = null;
      let bestQuality = 0.8;

      const testQuality = (q) => {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', q);
        });
      };

      (async () => {
        for (let i = 0; i < 7; i++) {
          const mid = (low + high) / 2;
          const b = await testQuality(mid);
          if (b.size <= maxBytes) {
            bestBlob = b;
            bestQuality = mid;
            low = mid; // try for higher quality while still under target
          } else {
            high = mid; // too large, lower quality
          }
        }

        // Fallback if still no blob under max
        if (!bestBlob) {
          bestBlob = await testQuality(0.1);
        }

        setProcessedBlob(bestBlob);
        setProcessedSize(bestBlob.size);
        const resultUrl = URL.createObjectURL(bestBlob);
        setProcessedUrl(resultUrl);
        setProcessing(false);
      })();
    };
    img.src = originalUrl;
  };

  useEffect(() => {
    if (originalUrl) {
      processImage();
    }
  }, [originalUrl, width, height, targetKb, brightness, contrast]);

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const baseName = originalFile ? originalFile.name.replace(/\.[^/.]+$/, "") : 'photo';
    a.download = `${baseName}_${selectedPreset.id}_${(processedSize / 1024).toFixed(0)}KB.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-yellow-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            दैनिक सरकारी फॉर्म टूल
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            स्मार्ट फोटो व साइन रीसाइज़र (Image Resizer & Compressor)
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
            SSC, रेलवे, UP पुलिस और पैन कार्ड के लिए फोटो और हस्ताक्षर को 1-क्लिक में निर्धारित KB व पिक्सल में बदलें।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Preset Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Crop className="w-4 h-4 text-blue-600" />
              1. सरकारी फॉर्म प्रीसेट चुनें
            </h3>

            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex flex-col gap-0.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm font-bold'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Settings Box */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              आयाम व आकार सेटिंग्स (Dimensions & KB)
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">चौड़ाई (Width px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">ऊंचाई (Height px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>टारगेट अधिकतम साइज़:</span>
                <span className="text-blue-600 font-bold">{targetKb} KB से कम</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={targetKb}
                onChange={(e) => setTargetKb(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Brightness & Contrast */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">फोटो ब्राइटनेस / क्लियरिटी:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">ब्राइटनेस ({brightness}%)</span>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-slate-500">कंट्रास्ट ({contrast}%)</span>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Upload & Live Result Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Upload Dropzone */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-blue-600" />
              2. फ़ोटो या हस्ताक्षर चुनें
            </h3>

            <div
              onClick={() => document.getElementById('resizer-file-input').click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center"
            >
              <input
                id="resizer-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileImage className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-xs font-bold text-slate-800">
                यहाँ क्लिक करके ग्राहक की फोटो या साइन चुनें (JPG, PNG)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                चाहे 5MB की भारी फोटो हो, यह टूल तुरंत इसे फॉर्म के नियम अनुसार छोटा कर देगा।
              </p>
            </div>
          </div>

          {/* Comparison & Preview Area */}
          {originalUrl ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">परिणाम व तुलना (Result Preview):</h4>
                {processing && (
                  <span className="text-xs text-blue-600 font-bold flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    प्रोसेस हो रहा है...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                {/* Original Preview */}
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-2">मूल फोटो (Original)</span>
                  <div className="max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-white p-2 border border-slate-200">
                    <img src={originalUrl} alt="Original" className="max-h-44 object-contain" />
                  </div>
                  <p className="text-xs font-bold text-rose-600 mt-2">
                    मूल साइज़: {(originalSize / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* Resized Result Preview */}
                <div className="bg-emerald-50/50 p-4 rounded-xl text-center border-2 border-emerald-400 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-900 uppercase">तैयार फोटो (Resized & Compressed)</span>
                  </div>
                  <div className="max-h-48 flex items-center justify-center overflow-hidden rounded-lg bg-white p-2 border border-emerald-200">
                    {processedUrl && (
                      <img src={processedUrl} alt="Resized" className="max-h-44 object-contain shadow-xs" />
                    )}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm font-black text-emerald-700">
                      नया साइज़: {(processedSize / 1024).toFixed(1)} KB ✓
                    </p>
                    <p className="text-[11px] text-slate-500">
                      आयाम: {width} × {height} px ({selectedPreset.name})
                    </p>
                  </div>
                </div>

              </div>

              {/* Download Action Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!processedUrl || processing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>तैयार फ़ाइल डाउनलोड करें (Download Ready File)</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              कृपया पहले कोई फोटो या साइन अपलोड करें।
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
