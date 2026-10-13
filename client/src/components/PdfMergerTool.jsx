import React, { useState } from 'react';
import { 
  FileText, Upload, Download, Trash2, ArrowUp, ArrowDown, 
  Sparkles, CheckCircle2, RefreshCw, AlertCircle, Layers 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function PdfMergerTool() {
  const [files, setFiles] = useState([]);
  const [targetLimit, setTargetLimit] = useState('200'); // '200' KB or '300' KB or 'high'
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('Combined_Documents.pdf');

  const handleFilesUpload = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const newItems = selected.map(file => ({
        id: Math.random().toString(),
        file,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newItems]);
      setSuccess(false);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setSuccess(false);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const generatePdf = async () => {
    if (files.length === 0) return;
    setGenerating(true);
    setSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

      // Determine quality based on target limit and number of pages
      let compressionQuality = 0.75;
      if (targetLimit === '200') {
        compressionQuality = files.length > 2 ? 0.45 : 0.6;
      } else if (targetLimit === '300') {
        compressionQuality = files.length > 3 ? 0.55 : 0.7;
      }

      for (let i = 0; i < files.length; i++) {
        if (i > 0) doc.addPage();

        const item = files[i];
        
        // Load image into HTML Image object
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = item.preview;
        });

        // Downscale image on canvas for compression
        const canvas = document.createElement('canvas');
        const maxCanvasDim = targetLimit === 'high' ? 1600 : 1000;
        let cWidth = img.width;
        let cHeight = img.height;

        if (cWidth > maxCanvasDim || cHeight > maxCanvasDim) {
          if (cWidth > cHeight) {
            cHeight = Math.round((cHeight * maxCanvasDim) / cWidth);
            cWidth = maxCanvasDim;
          } else {
            cWidth = Math.round((cWidth * maxCanvasDim) / cHeight);
            cHeight = maxCanvasDim;
          }
        }

        canvas.width = cWidth;
        canvas.height = cHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, cWidth, cHeight);
        ctx.drawImage(img, 0, 0, cWidth, cHeight);

        const jpegData = canvas.toDataURL('image/jpeg', compressionQuality);

        // Calculate aspect ratio for A4 page fit with margins
        const margin = 10;
        const maxW = pageWidth - (margin * 2);
        const maxH = pageHeight - (margin * 2);

        let finalW = maxW;
        let finalH = (cHeight / cWidth) * finalW;

        if (finalH > maxH) {
          finalH = maxH;
          finalW = (cWidth / cHeight) * finalH;
        }

        const posX = (pageWidth - finalW) / 2;
        const posY = (pageHeight - finalH) / 2;

        doc.addImage(jpegData, 'JPEG', posX, posY, finalW, finalH, undefined, 'FAST');
      }

      doc.save(pdfFileName || 'Combined_Documents.pdf');
      setSuccess(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('PDF तैयार करने में समस्या आई।');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-2">
            <Layers className="w-3.5 h-3.5" />
            दस्तावेज़ जोड़ें व कंप्रेस करें
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            दस्तावेज़ से PDF निर्माता (Doc to 200KB PDF Builder)
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            आधार कार्ड, 10वीं मार्कशीट और जाति प्रमाण पत्र की फोटो जोड़ें और सरकारी फॉर्म के लिए 200KB के अंदर सिंगल PDF बनाएं।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload & Options (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              1. दस्तावेज़ / फोटो जोड़ें
            </h3>

            <div
              onClick={() => document.getElementById('pdf-merge-input').click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center"
            >
              <input
                id="pdf-merge-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesUpload}
                className="hidden"
              />
              <FileText className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-800">
                यहाँ क्लिक करके 1 या अधिक फोटो चुनें
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                आधार कार्ड आगे/पीछे, मार्कशीट, प्रमाण पत्र आदि
              </p>
            </div>

            {/* Target Size Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                PDF साइज़ टारगेट (Size Limit)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetLimit('200')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    targetLimit === '200'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block">&lt; 200 KB</span>
                  <span className="text-[10px] text-slate-400">स्कॉलरशिप / e-District</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetLimit('300')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    targetLimit === '300'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block">&lt; 300 KB</span>
                  <span className="text-[10px] text-slate-400">स्टैंडर्ड फॉर्म</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetLimit('high')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    targetLimit === 'high'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block">High Quality</span>
                  <span className="text-[10px] text-slate-400">प्रिंट निकालने हेतु</span>
                </button>
              </div>
            </div>

            {/* Output File Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                PDF फ़ाइल का नाम
              </label>
              <input
                type="text"
                value={pdfFileName}
                onChange={(e) => setPdfFileName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

          </div>

        </div>

        {/* Right Column: Files List & Action (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                शामिल दस्तावेज़ ({files.length} पेज):
              </h3>
              {files.length > 0 && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                >
                  सभी हटाएं
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                अभी कोई फ़ाइल नहीं जोड़ी गई है। बाईं तरफ से फोटो अपलोड करें।
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {files.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={item.preview}
                        alt="thumb"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="truncate max-w-[180px] sm:max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(item.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
                        title="ऊपर करें"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === files.length - 1}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
                        title="नीचे करें"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFile(item.id)}
                        className="p-1.5 hover:bg-rose-100 rounded text-rose-500"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={generatePdf}
                disabled={files.length === 0 || generating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PDF तैयार हो रही है...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>संयुक्त PDF बनाएं और डाउनलोड करें (Generate PDF)</span>
                  </>
                )}
              </button>

              {success && (
                <p className="text-center text-xs text-emerald-600 font-bold mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PDF सफलता से डाउनलोड हो गई है! ✓</span>
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
