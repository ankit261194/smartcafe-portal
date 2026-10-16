import React, { useState } from 'react';
import { 
  Upload, Printer, FileText, CheckCircle2, AlertCircle, 
  Sparkles, Smartphone, QrCode, ArrowRight, ShieldCheck, 
  HelpCircle, Copy, Layers, SlidersHorizontal, Loader2, Camera
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import PrintTokenModal from './PrintTokenModal';
import PvcTraySheetModal from './PvcTraySheetModal';
import { useLanguage } from '../context/LanguageContext';

export default function QuickPrint({ settings, selectedCafe, cafes = [], onSelectCafe, onPrintSubmitted }) {
  const { language, t } = useLanguage();
  const [showPvcTrayModal, setShowPvcTrayModal] = useState(false);
  const [file, setFile] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pagesCount, setPagesCount] = useState(1);
  const [minDetectedPages, setMinDetectedPages] = useState(1);
  const [detectingPages, setDetectingPages] = useState(false);
  const [detectedPageNotice, setDetectedPageNotice] = useState('');
  const [copies, setCopies] = useState(1);
  const [colorType, setColorType] = useState('bw'); // 'bw' or 'color'
  const [sideType, setSideType] = useState('single'); // 'single' or 'double'
  const [paperSize, setPaperSize] = useState('A4');
  const [pageRange, setPageRange] = useState('All');
  const [paymentMode, setPaymentMode] = useState('counter'); // 'counter' or 'upi'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Rates from selectedCafe or settings
  const rates = selectedCafe?.rates || settings?.rates || { bwPage: 3, colorPage: 10 };
  const currentRate = colorType === 'color' ? rates.colorPage : rates.bwPage;
  const totalAmount = Math.max(1, pagesCount * copies * currentRate);

  const processSelectedFile = async (selected) => {
    setFile(selected);
    setError('');
    setDetectedPageNotice('');

    if (selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf')) {
      try {
        setDetectingPages(true);
        const arrayBuffer = await selected.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();
        if (count && count > 0) {
          setPagesCount(count);
          setMinDetectedPages(count);
          setDetectedPageNotice(`✅ PDF में कुल ${count} पेज स्वचालित रूप से पहचाने गए!`);
        }
      } catch (err) {
        console.warn('PDF page detection fallback:', err);
        setPagesCount(1);
        setMinDetectedPages(1);
      } finally {
        setDetectingPages(false);
      }
    } else {
      setPagesCount(1);
      setMinDetectedPages(1);
      setDetectedPageNotice('✅ 1 पेज (फोटो / सिंगल दस्तावेज)');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('कृपया पहले प्रिंट करने के लिए PDF या फ़ोटो अपलोड करें।');
      return;
    }

    const cafeId = selectedCafe?.id || '';

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('cafeId', cafeId);
      formData.append('file', file);
      formData.append('customerName', customerName.trim() || 'काउंटर ग्राहक');
      formData.append('phone', phone.trim());
      formData.append('pagesCount', pagesCount);
      formData.append('copies', copies);
      formData.append('colorType', colorType);
      formData.append('sideType', sideType);
      formData.append('paperSize', paperSize);
      formData.append('pageRange', pageRange);
      formData.append('totalAmount', totalAmount);
      formData.append('paymentStatus', paymentMode === 'upi' ? 'paid_upi' : 'pending_counter');
      formData.append('notes', notes);

      const res = await fetch('/api/prints', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setSubmittedData(data.print);
        if (onPrintSubmitted) onPrintSubmitted();

        // Reset form
        setFile(null);
        setNotes('');
      } else {
        setError(data.error || 'प्रिंट रिक्वेस्ट सबमिट करने में समस्या आई।');
      }
    } catch (err) {
      console.error(err);
      setError('सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  // UPI string for dynamic payment QR
  const upiId = settings?.upiId || '8006518960@pthdfc';
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(settings?.shopName || 'CyberCafe')}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Print Payment')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {t('qp_superfast_badge')}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t('quick_print_title')}
            </h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              {t('quick_print_sub')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl text-center shrink-0">
            <span className="text-xs text-blue-200 block">{t('qp_current_rates')}</span>
            <div className="text-sm font-bold mt-1 text-white flex gap-3">
              <span>{language === 'hi' ? 'ब्लैक एंड व्हाइट' : 'B&W'}: ₹{rates.bwPage}{language === 'hi' ? '/पेज' : '/page'}</span>
              <span className="text-blue-300">|</span>
              <span className="text-yellow-300">{language === 'hi' ? 'रंगीन' : 'Color'}: ₹{rates.colorPage}{language === 'hi' ? '/पेज' : '/page'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Shop Selection & Delivery Banner */}
      <div className="bg-white dark:bg-[#0f1d36] rounded-2xl p-4 sm:p-5 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                {language === 'hi' ? 'दुकान डिलीवरी काउंटर' : 'Delivery Counter'}
              </span>
              {selectedCafe?.id && (
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedCafe.id}
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base mt-0.5">
              {selectedCafe?.shopName || settings?.shopName || (language === 'hi' ? 'डिजिटल सेवा केंद्र (मुख्य काउंटर)' : 'Main Cyber Counter')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedCafe?.address || (language === 'hi' ? 'आपके दस्तावेज़ केवल इसी दुकान के ऑपरेटर काउंटर पर सुरक्षित पहुंचेंगे।' : 'Documents delivered strictly to this shopkeeper.')}
            </p>
          </div>
        </div>

        {/* Cafe Dropdown Picker if multiple cafes exist */}
        {Array.isArray(cafes) && cafes.length > 1 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedCafe?.id || ''}
              onChange={(e) => {
                const found = cafes.find(c => c.id === e.target.value);
                if (found && onSelectCafe) onSelectCafe(found);
              }}
              className="w-full sm:w-auto text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-[#0b1528] border border-indigo-300 dark:border-indigo-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{language === 'hi' ? 'दुकान बदलें...' : 'Change Shop...'}</option>
              {cafes.map(c => (
                <option key={c.id} value={c.id}>
                  🏪 {c.shopName || c.ownerName} ({c.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: File Upload & Print Settings */}
        <div className="md:col-span-2 space-y-6">
          
          {/* File Upload Box */}
          <div className="bg-white dark:bg-[#0f1d36] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-orange-500" />
              {t('qp_upload_step')}
            </h3>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                file
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {t('qp_file_selected')}
                  </p>
                  {detectingPages && (
                    <div className="mt-2.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>PDF पेजों की सटीक गणना की जा रही है...</span>
                    </div>
                  )}
                  {detectedPageNotice && !detectingPages && (
                    <div className="mt-2.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs">
                      <span>{detectedPageNotice}</span>
                    </div>
                  )}
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-2 underline">
                    {t('qp_change_file')}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {t('qp_upload_drag')}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {t('qp_upload_hint')}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Camera Direct Capture Button */}
            <div className="mt-3">
              <label 
                htmlFor="mobile-cam-capture"
                className="w-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs active:scale-95"
              >
                <Camera className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>{t('qp_live_photo_btn')}</span>
                <input
                  id="mobile-cam-capture"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Print Preferences */}
          <div className="bg-white dark:bg-[#0f1d36] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-orange-500" />
              {t('qp_print_options_step')}
            </h3>

            {/* Color vs B&W */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t('qp_color_type_label')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColorType('bw')}
                  className={`p-3.5 rounded-xl border-2 text-left font-medium transition flex items-center justify-between ${
                    colorType === 'bw'
                      ? 'border-slate-900 bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1528] hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{t('qp_bw_option')}</span>
                    <span className="text-xs opacity-80">{t('qp_bw_sub')} (₹{rates.bwPage}{language === 'hi' ? '/पेज' : '/page'})</span>
                  </div>
                  {colorType === 'bw' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setColorType('color')}
                  className={`p-3.5 rounded-xl border-2 text-left font-medium transition flex items-center justify-between ${
                    colorType === 'color'
                      ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1528] hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{t('qp_color_option')}</span>
                    <span className="text-xs opacity-80">{t('qp_color_sub')} (₹{rates.colorPage}{language === 'hi' ? '/पेज' : '/page'})</span>
                  </div>
                  {colorType === 'color' && <CheckCircle2 className="w-5 h-5 text-yellow-300" />}
                </button>
              </div>
            </div>

            {/* Pages & Copies Row (2 Columns on Mobile) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider truncate">
                    {t('qp_pages_count_label')}
                  </label>
                  {minDetectedPages > 1 && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full truncate">
                      🔒 {minDetectedPages}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <input
                    type="number"
                    min={minDetectedPages}
                    max="500"
                    value={pagesCount}
                    onChange={(e) => setPagesCount(Math.max(minDetectedPages, parseInt(e.target.value) || minDetectedPages))}
                    className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t('pages')}</span>
                </div>
                {minDetectedPages > 1 && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 hidden xs:block">
                    {language === 'hi' ? `* असली पेजों (${minDetectedPages}) से कम नहीं हो सकता।` : `* Cannot be less than detected pages (${minDetectedPages}).`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 truncate">
                  {t('qp_copies_label')}
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-base sm:text-lg flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-1.5 sm:py-2 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-base sm:text-lg flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Sides & Paper Size (2 Columns on Mobile) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 truncate">
                  {t('qp_sides_label')}
                </label>
                <select
                  value={sideType}
                  onChange={(e) => setSideType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="single">{t('qp_single_side')}</option>
                  <option value="double">{t('qp_double_side')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 truncate">
                  {t('qp_paper_size_label')}
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="A4">{t('qp_size_a4')}</option>
                  <option value="Legal">{t('qp_size_legal')}</option>
                  <option value="Photo4x6">{t('qp_size_photo')}</option>
                  <option value="PVC_5in1">📄 5-in-1 PVC ट्रे शीट (CR-80)</option>
                </select>
              </div>
            </div>

            {/* Page Range & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('qp_page_range_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('qp_page_range_hint')}
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('qp_notes_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('qp_notes_hint')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* A4 5-Card PVC Tray Sheet Generator Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPvcTrayModal(true)}
                className="w-full bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700/60 text-indigo-700 dark:text-indigo-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>📄 A4 शीट पर 5-कार्ड ट्रे प्रिंट लेआउट (5-in-1 PVC Tray Sheet)</span>
              </button>
            </div>

          </div>

        </div>

        {/* Right 1 Col: Customer Details & Checkout Box */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#0f1d36] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-orange-500" />
              {t('qp_customer_step')}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('qp_name_label')}
              </label>
              <input
                type="text"
                placeholder={t('qp_name_hint')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('qp_phone_label')}
              </label>
              <input
                type="tel"
                placeholder={t('qp_phone_hint')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Bill Summary */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t('qp_rate_label')}</span>
                <span>₹{currentRate}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t('qp_total_pages_copies')}</span>
                <span>{pagesCount} {language === 'hi' ? 'पेज' : 'pages'} × {copies} {language === 'hi' ? 'कॉपी' : 'copies'}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>{t('qp_total_amount_label')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                {t('qp_pay_mode_label')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('counter')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    paymentMode === 'counter'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('qp_pay_counter')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    paymentMode === 'upi'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {t('qp_pay_upi')}
                </button>
              </div>
            </div>

            {/* Dynamic UPI QR Code if selected */}
            {paymentMode === 'upi' && (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2">
                  {t('qp_scan_pay')} (₹{totalAmount})
                </p>
                <div className="bg-white p-2.5 rounded-lg inline-block shadow-sm">
                  <QRCodeSVG value={upiPayUrl} size={130} level="M" />
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-1.5">
                  UPI ID: {upiId}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('qp_submitting')}</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>{t('qp_submit_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('qp_privacy_banner')}</span>
            </div>

          </div>

        </div>

      </form>

      {/* Confirmation Token Modal */}
      <PrintTokenModal
        isOpen={!!submittedData}
        onClose={() => setSubmittedData(null)}
        data={submittedData}
        type="print"
      />

      {/* A4 5-in-1 ISO CR-80 PVC Tray Sheet Modal */}
      <PvcTraySheetModal
        isOpen={showPvcTrayModal}
        onClose={() => setShowPvcTrayModal(false)}
      />

    </div>
  );
}
