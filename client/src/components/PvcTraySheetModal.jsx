import React, { useState } from 'react';
import { 
  Printer, X, Layers, Copy, CheckCircle2, SlidersHorizontal, 
  Sparkles, ShieldCheck, Download, Eye, AlertCircle 
} from 'lucide-react';

export default function PvcTraySheetModal({
  isOpen,
  onClose,
  cardData = null,
  toolKind = 'pan',
  customFront = null,
  customBack = null
}) {
  const [layoutMode, setLayoutMode] = useState('front_all'); // 'front_all', 'back_all', 'paired', 'custom'
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [highDpiSharpen, setHighDpiSharpen] = useState(true);
  const [activeSlots, setActiveSlots] = useState([true, true, true, true, true]);

  if (!isOpen) return null;

  const handlePrintTray = () => {
    window.print();
  };

  const toggleSlot = (idx) => {
    const updated = [...activeSlots];
    updated[idx] = !updated[idx];
    setActiveSlots(updated);
  };

  const fillAllSlots = () => {
    setActiveSlots([true, true, true, true, true]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Print Specific CSS to Isolate A4 Sheet during window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pvc-tray-sheet-print, #pvc-tray-sheet-print * {
            visibility: visible !important;
          }
          #pvc-tray-sheet-print {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
          }
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  A4 5-in-1 ISO CR-80 300 DPI PVC Tray Sheet Generator
                </h2>
                <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  ISO 7810 ID-1
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Epson / Canon 5-कार्ड PVC ट्रे लेआउट (85.60mm × 53.98mm) • कॉर्नर क्रॉसहेयर कटिंग मार्क्स के साथ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintTray}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ट्रे प्रिंट निकालें (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-300">लेआउट मोड:</span>
            <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setLayoutMode('front_all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  layoutMode === 'front_all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                }`}
              >
                5 फ्रंट कार्ड
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('back_all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  layoutMode === 'back_all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                }`}
              >
                5 बैक कार्ड
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('paired')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  layoutMode === 'paired'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                }`}
              >
                फ्रंट व बैक पेयर
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showCrosshairs}
                onChange={e => setShowCrosshairs(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>कटिंग क्रॉसहेयर (+)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={highDpiSharpen}
                onChange={e => setHighDpiSharpen(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>300 DPI शार्प बॉर्डर</span>
            </label>

            <button
              type="button"
              onClick={fillAllSlots}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>सभी स्लॉट सक्रिय करें</span>
            </button>
          </div>
        </div>

        {/* Sheet Preview Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-200/60 dark:bg-slate-950">
          {/* Virtual A4 Canvas */}
          <div
            id="pvc-tray-sheet-print"
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-[10mm] flex flex-col justify-between relative box-border ${
              highDpiSharpen ? 'rendering-crisp-edges' : ''
            }`}
            style={{
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            }}
          >
            {/* Top Registration Bar */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 text-[8px] font-mono text-slate-500 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-black flex items-center justify-center font-bold text-[6px]">⌖</span>
                <span>SMART CAFE ISO CR-80 5-CARD PVC TRAY SHEET (210mm × 297mm • 300 DPI)</span>
              </div>
              <div className="flex items-center gap-4">
                <span>SLOTS: 5 × (85.60mm × 53.98mm)</span>
                <span>CORNER OFFSET: 2.0mm</span>
                <span className="w-2.5 h-2.5 rounded-full border border-black flex items-center justify-center font-bold text-[6px]">⌖</span>
              </div>
            </div>

            {/* 5 Card Cavity Grid (Standard Epson/Canon 5-Card PVC Tray Template) */}
            <div className="flex-1 flex flex-col justify-around py-4 gap-4">
              {[0, 1, 2, 3, 4].map(idx => {
                const isActive = activeSlots[idx];
                const isBack = layoutMode === 'back_all' || (layoutMode === 'paired' && idx % 2 === 1);

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-center mx-auto"
                    style={{
                      width: '85.6mm',
                      height: '54.0mm'
                    }}
                  >
                    {/* Corner Cutting Crosshairs (+) */}
                    {showCrosshairs && (
                      <>
                        {/* Top-Left Crosshair */}
                        <div className="absolute -top-[3mm] -left-[3mm] w-[6mm] h-[6mm] pointer-events-none flex items-center justify-center">
                          <span className="text-[10px] font-thin text-slate-800 leading-none select-none">+</span>
                        </div>
                        {/* Top-Right Crosshair */}
                        <div className="absolute -top-[3mm] -right-[3mm] w-[6mm] h-[6mm] pointer-events-none flex items-center justify-center">
                          <span className="text-[10px] font-thin text-slate-800 leading-none select-none">+</span>
                        </div>
                        {/* Bottom-Left Crosshair */}
                        <div className="absolute -bottom-[3mm] -left-[3mm] w-[6mm] h-[6mm] pointer-events-none flex items-center justify-center">
                          <span className="text-[10px] font-thin text-slate-800 leading-none select-none">+</span>
                        </div>
                        {/* Bottom-Right Crosshair */}
                        <div className="absolute -bottom-[3mm] -right-[3mm] w-[6mm] h-[6mm] pointer-events-none flex items-center justify-center">
                          <span className="text-[10px] font-thin text-slate-800 leading-none select-none">+</span>
                        </div>
                        {/* Center Alignment Ticks */}
                        <div className="absolute -top-[2mm] left-1/2 -translate-x-1/2 w-[1px] h-[3mm] bg-slate-400" />
                        <div className="absolute -bottom-[2mm] left-1/2 -translate-x-1/2 w-[1px] h-[3mm] bg-slate-400" />
                        <div className="absolute -left-[2mm] top-1/2 -translate-y-1/2 h-[1px] w-[3mm] bg-slate-400" />
                        <div className="absolute -right-[2mm] top-1/2 -translate-y-1/2 h-[1px] w-[3mm] bg-slate-400" />
                      </>
                    )}

                    {/* Outer Die-cut Bleed Guide Line */}
                    <div className="w-full h-full rounded-[3.18mm] border border-dashed border-slate-300 relative overflow-hidden bg-white flex flex-col justify-between p-2.5 box-border shadow-2xs">
                      {isActive ? (
                        <>
                          {/* Card Content Render */}
                          {customFront && !isBack ? (
                            <div className="w-full h-full">{customFront}</div>
                          ) : customBack && isBack ? (
                            <div className="w-full h-full">{customBack}</div>
                          ) : (
                            /* High-Definition CR-80 Render Fallback */
                            <div className="w-full h-full flex flex-col justify-between select-none">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b border-emerald-700/80 pb-0.5">
                                <div className="text-[8px] font-black uppercase text-emerald-900 tracking-tight">
                                  {cardData?.headerTitle || 'GOVERNMENT OF INDIA • भारत सरकार'}
                                </div>
                                <span className="text-[7px] font-bold text-slate-600 uppercase">
                                  {isBack ? 'REVERSE' : 'CR-80 CARD'}
                                </span>
                              </div>

                              {/* Card Body */}
                              {!isBack ? (
                                <div className="flex items-center gap-2 py-1 flex-1">
                                  {cardData?.photoUrl ? (
                                    <div className="w-[18mm] h-[22mm] rounded border border-slate-400 overflow-hidden shrink-0 bg-slate-100">
                                      <img src={cardData.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-[18mm] h-[22mm] rounded border border-slate-400 bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 shrink-0">
                                      PHOTO
                                    </div>
                                  )}
                                  <div className="flex-1 space-y-0.5 text-[8px]">
                                    <div>
                                      <span className="text-[6.5px] text-slate-500 block">नाम / NAME</span>
                                      <span className="font-black text-slate-900 block leading-tight">{cardData?.name || cardData?.ownerName || 'राम कुमार'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[6.5px] text-slate-500 block">पिता / FATHER'S NAME</span>
                                      <span className="font-bold text-slate-800 block leading-tight">{cardData?.fatherName || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <span className="text-[6.5px] text-slate-500 block">जन्म तिथि / DOB</span>
                                        <span className="font-mono font-bold text-slate-800 block">{cardData?.dob || '-'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[6.5px] text-slate-500 block">लिंग / GENDER</span>
                                        <span className="font-bold text-slate-800 block">{cardData?.gender || 'MALE'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col justify-around py-1 text-[7.5px]">
                                  <div>
                                    <span className="text-[6.5px] text-slate-500 block font-bold">पता / ADDRESS</span>
                                    <span className="font-medium text-slate-800 block leading-tight">
                                      {cardData?.address || 'ग्राम - रामपुर, पोस्ट - कल्याणपुर, जिला - अलीगढ़, उत्तर प्रदेश - 202001'}
                                    </span>
                                  </div>
                                  <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[7px] text-slate-500">
                                    <span>हेल्पलाइन: 1947 / 1800-180-1947</span>
                                    <span>www.smartcafe.sbs</span>
                                  </div>
                                </div>
                              )}

                              {/* Card Bottom Strip */}
                              <div className="bg-slate-900 text-white rounded px-2 py-0.5 text-center font-mono font-black text-[9px] tracking-wider">
                                {cardData?.refNumber || cardData?.panNo || cardData?.regNo || cardData?.aadhaarNo || `CARD-ID-SLOT-${idx + 1}`}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                          <span className="text-[10px] font-bold">स्लॉट {idx + 1} रिक्त (Empty)</span>
                          <button
                            type="button"
                            onClick={() => toggleSlot(idx)}
                            className="mt-1 text-[8px] text-indigo-600 underline font-bold cursor-pointer"
                          >
                            सक्रिय करें
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Slot Label Badge (Screen Only) */}
                    <div className="absolute -left-9 top-1/2 -translate-y-1/2 print:hidden">
                      <button
                        type="button"
                        onClick={() => toggleSlot(idx)}
                        className={`w-6 h-6 rounded-full font-mono text-[10px] font-black border transition cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-slate-200 text-slate-500 border-slate-300'
                        }`}
                        title="Toggle Slot"
                      >
                        {idx + 1}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Registration Bar */}
            <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-[8px] font-mono text-slate-500 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-black flex items-center justify-center font-bold text-[6px]">⌖</span>
                <span>AUTHENTIC PRINT TRAY READY • HIGH DEFINITION PVC MEDIA</span>
              </div>
              <div className="flex items-center gap-3">
                <span>PRINTER: EPSON L805 / L850 / CANON G570 PVC TRAY</span>
                <span className="w-2.5 h-2.5 rounded-full border border-black flex items-center justify-center font-bold text-[6px]">⌖</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
