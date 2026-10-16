import React from 'react';
import { 
  Puzzle, Download, ExternalLink, Sparkles, CheckCircle2, 
  ShieldCheck, FileText, ArrowRight, Monitor, Laptop, Zap
} from 'lucide-react';

export default function ShopkeeperExtensionDesk({ selectedCafe }) {
  const handleOpenGuide = () => {
    window.open('/downloads/EXTENSION_USER_GUIDE.html', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-yellow-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ऑपरेटर विशेष क्रोम ऑटोमेशन (VLE Desktop Automation)</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Puzzle className="w-8 h-8 text-yellow-300" />
            <span>e-District 1-क्लिक ऑटो-फ़िलर एवं लाइव OTP क्रोम एक्सटेंशन</span>
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
            e-District UP, VAHAN, एवं PAN पोर्टल्स पर 25+ फील्ड्स को मात्र 0.5 सेकंड में ऑटो-टाइप करें। ग्राहक के फोन से आने वाला सरकारी आधार / फीस OTP सीधे e-District के बॉक्स में स्वतः भर जाता है।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleOpenGuide}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-white/20 transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-yellow-300" />
            <span>📖 सचित्र A to Z गाइड खोलें</span>
          </button>

          <a
            href="/downloads/SmartCafe_Chrome_Extension_Package.zip"
            download="SmartCafe_Chrome_Extension_Package.zip"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition active:scale-95 no-underline cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>📥 एक्सटेंशन ZIP डाउनलोड करें</span>
          </a>
        </div>
      </div>

      {/* 3 Step Visual Installation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="font-black text-slate-900 dark:text-white text-base">
            ZIP डाउनलोड व अनजिप
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            ऊपर दिए गए हरे बटन से <strong className="text-slate-700 dark:text-slate-200">SmartCafe_Chrome_Extension_Package.zip</strong> डाउनलोड करें और उसे अपने कंप्यूटर में Extract (अनजिप) करें।
          </p>
        </div>

        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="font-black text-slate-900 dark:text-white text-base">
            Chrome में Load Unpacked
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Chrome में <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-indigo-600">chrome://extensions</code> खोलें, ऊपर दाएँ <strong className="text-slate-700 dark:text-slate-200">'Developer mode'</strong> ऑन करें और <strong className="text-slate-700 dark:text-slate-200">'Load unpacked'</strong> दबाकर एक्सटेंशन फ़ोल्डर चुनें।
          </p>
        </div>

        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="font-black text-slate-900 dark:text-white text-base">
            दुकान से 1-क्लिक सिंक
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            एक्सटेंशन के आइकन पर क्लिक करके अपनी दुकान की ID (<strong className="text-emerald-600 font-mono">{selectedCafe?.id || 'CAFE-101'}</strong>) दर्ज करें। अब e-District पर जाते ही ऑटो-फ़िलर तैयार मिलेगा।
          </p>
        </div>
      </div>

      {/* Feature Checklist & Privacy Assurance */}
      <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span>एक्सटेंशन के प्रमुख फीचर्स व लाभ</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0b1528] border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">25+ फील्ड्स ऑटो-टाइप (0.5s):</strong>
              <span className="text-slate-500 dark:text-slate-400">आवेदक का नाम (हिंदी/अंग्रेजी), पिता का नाम, पता, तहसील, आधार संख्या सब एक क्लिक में भर जाते हैं।</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0b1528] border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">साइलेंट आधार OTP ऑटो-इंजेक्टर:</strong>
              <span className="text-slate-500 dark:text-slate-400">सरकारी सर्वर द्वारा ग्राहक के फोन पर भेजा गया 6-अंकों का OTP सीधे e-District के इनपुट में भर जाता है।</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0b1528] border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">100% प्राइवेसी सुरक्षा:</strong>
              <span className="text-slate-500 dark:text-slate-400">यह एक्सटेंशन ग्राहक के किसी भी व्यक्तिगत मैसेज को नहीं छूता; केवल सरकारी कीवर्ड वाले OTP ही प्रोसेस होते हैं।</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#0b1528] border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">Zero-Bypass गारंटी:</strong>
              <span className="text-slate-500 dark:text-slate-400">दुकान 'A' का ऑपरेटर कभी दुकान 'B' के किसी ग्राहक का डेटा या OTP नहीं देख सकता।</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
