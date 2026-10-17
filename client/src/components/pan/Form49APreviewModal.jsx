import React, { useState, useEffect } from 'react';
import { 
  X, Download, Printer, FileText, CheckCircle2, 
  ExternalLink, ZoomIn, ZoomOut, RefreshCw, ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Form49APreviewModal({
  isOpen = false,
  onClose,
  pdfDataUrl = '',
  pdfBlob = null,
  applicationData = {},
  theme = 'light'
}) {
  const { language } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [activeUrl, setActiveUrl] = useState('');

  useEffect(() => {
    if (pdfDataUrl) {
      setActiveUrl(pdfDataUrl);
    } else if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setActiveUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (applicationData?.documents?.generatedFormPdf) {
      setActiveUrl(applicationData.documents.generatedFormPdf);
    }
  }, [pdfDataUrl, pdfBlob, applicationData]);

  if (!isOpen) return null;

  const applicantName = applicationData?.personal?.firstName 
    ? `${applicationData.personal.firstName} ${applicationData.personal.lastName || ''}`.trim()
    : (applicationData?.personal?.lastName || 'आवेदक');

  const appId = applicationData?.id || 'PAN-APPLICATION';

  const handleDownload = () => {
    if (!activeUrl) return;
    setDownloading(true);
    try {
      const a = document.createElement('a');
      a.href = activeUrl;
      a.download = `Form49A_${appId}_${applicantName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    if (!activeUrl) return;
    try {
      const win = window.open(activeUrl, '_blank');
      if (win) {
        win.focus();
        setTimeout(() => win.print(), 1000);
      }
    } catch (e) {
      console.warn('Print popup blocked, downloading instead');
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {language === 'hi' ? 'डिजिटल फॉर्म 49A — ऑटो-स्टैम्पिंग पूर्वावलोकन' : 'Digital Form 49A — Auto-Stamping Preview'}
                </h3>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  100% Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {appId} • {applicantName} • {applicationData?.aoCode?.areaCode || 'AO Verified'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-white/15 cursor-pointer"
              title="Print Form 49A"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{language === 'hi' ? 'प्रिंट करें' : 'Print'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !activeUrl}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? (language === 'hi' ? 'डाउनलोडिंग...' : 'Saving...') : (language === 'hi' ? 'डाउनलोड PDF' : 'Download PDF')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center text-slate-300 transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Specifications Sub-Bar */}
        <div className="flex items-center justify-between px-5 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'फोटो 1 व 2 स्टैम्प्ड' : 'Photos 1 & 2 Stamped'}</span>
            </span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '15° क्रॉस हस्ताक्षर' : '15° Cross-Signature'}</span>
            </span>
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'आधार व जन्म प्रमाण पत्र मर्ज्ड' : 'Aadhaar & DOB Merged'}</span>
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Income Tax Dept Form 49A Standards
          </span>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 w-full bg-slate-200 dark:bg-slate-950 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          {activeUrl ? (
            <iframe
              src={`${activeUrl}#toolbar=1&navpanes=0&view=FitH`}
              title="Form 49A Preview"
              className="w-full h-full rounded-2xl shadow-lg border border-slate-300 dark:border-slate-800 bg-white"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {language === 'hi' ? 'फॉर्म 49A तैयार किया जा रहा है...' : 'Generating Form 49A PDF...'}
              </p>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {language === 'hi' 
                ? 'यह PDF सीधे UTIITSL / NSDL / PanSuvidha पोर्टल पर अपलोड करने योग्य है (<2MB)।' 
                : 'This PDF is ready for direct upload to UTIITSL / NSDL / PanSuvidha portals (<2MB).'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
