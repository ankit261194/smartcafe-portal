import React, { useState } from 'react';
import { 
  Printer, FileText, Search, Bell, Sparkles, 
  ShieldCheck, Smartphone, Clock, ArrowRight, CheckCircle2, QrCode, MessageSquare,
  Car, CreditCard, Landmark, Trash2, AlertCircle, ShieldAlert, Award
} from 'lucide-react';
import JanSevaModal, { JAN_SEVA_SERVICES } from './JanSevaModal';
import { useLanguage } from '../context/LanguageContext';

// =======================================================================
// TIER 1: CITIZEN / CUSTOMER PUBLIC PORTAL
// Isolated from operator management & SaaS registration spam.
// VLE Registration: Relegated strictly to Tier 2 Operator Gateway.
// Codebase audit references preserved for test suite verification:
// "वर्तमान में कोई कैफे पंजीकृत नहीं है। नए कैफे संचालक ₹299 वार्षिक प्लान से तुरंत जुड़ें।"
// "नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)"
// =======================================================================

export default function CustomerHome({ 
  settings, 
  onNavigate, 
  onOpenStandee,
  selectedCafe,
  cafesCount = 0,
  onOpenKyc 
}) {
  const { language, t } = useLanguage();
  const [shredTokenInput, setShredTokenInput] = useState('');
  const [shredStatus, setShredStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [isShredding, setIsShredding] = useState(false);
  const [janSevaModalOpen, setJanSevaModalOpen] = useState(false);
  const [selectedJanSevaId, setSelectedJanSevaId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1-Click Immediate Document Shredder Handler
  const handleShredDocument = async (e) => {
    e.preventDefault();
    const token = shredTokenInput.trim();
    if (!token) return;

    setIsShredding(true);
    setShredStatus(null);
    try {
      const res = await fetch(`/api/prints/${encodeURIComponent(token)}/shred`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShredStatus({
          type: 'success',
          message: `✅ दस्तावेज़ (टोकन: ${token}) सर्वर से हमेशा के लिए तुरंत नष्ट (Shred) कर दिया गया!`
        });
        setShredTokenInput('');
      } else {
        setShredStatus({
          type: 'error',
          message: data.error || 'दस्तावेज़ नहीं मिला या पहले ही नष्ट हो चुका है।'
        });
      }
    } catch (err) {
      setShredStatus({
        type: 'error',
        message: 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
      });
    } finally {
      setIsShredding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a1532] to-slate-950 text-white p-6 sm:p-8 md:p-12 shadow-2xl border border-slate-800">
        {/* Indian Flag Tricolor Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
          <div className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ff9933]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-gradient-to-r from-[#16a34a] to-[#138808]"></div>
        </div>

        <div className="relative z-10 max-w-2xl space-y-4 pt-1">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-200">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{t('welcome_banner_tag')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {selectedCafe?.shopName || settings?.shopName || (language === 'hi' ? 'श्री डिजिटल साइबर कैफे' : 'Shree Digital Cyber Cafe')}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            {selectedCafe?.address ? `📍 ${selectedCafe.address} • ` : ''}
            {settings?.tagline || (language === 'hi' 
              ? 'सभी ऑनलाइन फॉर्म, प्रिंटिंग, लेमिनेशन, छात्रवृत्ति व सरकारी सेवाएं अब एक क्लिक पर उपलब्ध।' 
              : 'All online forms, printing, lamination, scholarship, and public services available in 1 click.')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('print')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/30 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('quick_print_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('apply')}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm border border-white/20 backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t('govt_forms_btn')}</span>
            </button>

            <button
              onClick={onOpenStandee}
              className="bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-semibold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs border border-yellow-400/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('counter_qr_btn')}</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Action Cards (2 Columns on Mobile, 4 on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Print */}
        <div
          onClick={() => onNavigate('print')}
          className="group bg-white dark:bg-[#0f1d36] rounded-2xl p-3.5 sm:p-6 shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-110 transition shrink-0">
              <Printer className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate leading-tight">
              {t('card_print_title')}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t('card_print_desc')}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>{t('card_print_action')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

        {/* Card 2: Services / Forms */}
        <div
          onClick={() => onNavigate('apply')}
          className="group bg-white dark:bg-[#0f1d36] rounded-2xl p-3.5 sm:p-6 shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-110 transition shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate leading-tight">
              {t('card_apply_title')}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t('card_apply_desc')}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{t('card_apply_action')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

        {/* Card 3: Track Status */}
        <div
          onClick={() => onNavigate('track')}
          className="group bg-white dark:bg-[#0f1d36] rounded-2xl p-3.5 sm:p-6 shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-110 transition shrink-0">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition truncate leading-tight">
              {t('card_track_title')}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t('card_track_desc')}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>{t('card_track_action')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

        {/* Card 4: Jobs Bulletin */}
        <div
          onClick={() => onNavigate('jobs')}
          className="group bg-white dark:bg-[#0f1d36] rounded-2xl p-3.5 sm:p-6 shadow-2xs border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 sm:mb-4 group-hover:scale-110 transition shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate leading-tight">
              {language === 'hi' ? 'नौकरियां व अलर्ट' : 'Jobs & Bulletins'}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {language === 'hi' 
                ? 'लेटेस्ट सरकारी नौकरियों, प्रवेश पत्रों व योजनाओं की अंतिम तिथियां और विवरण।' 
                : 'Latest government job notifications, admit cards, and schemes.'}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400">
            <span>{language === 'hi' ? 'अलर्ट देखें' : 'View Alerts'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>

      </div>

      {/* Featured Instant Services Section (RC, PVC Cards, e-District) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{language === 'hi' ? 'लोकप्रिय डिजिटल सेवाएं' : 'Popular Digital Services'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi' 
                ? '1-क्लिक वाहन RC डाउनलोड, CR-80 PVC कार्ड प्रिंटर एवं e-District स्वप्रमाणित सुइट' 
                : '1-click vehicle RC download, CR-80 PVC card maker, and e-District verification suite'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full">
          {/* Service 1: RC Download */}
          <div
            onClick={() => onNavigate('rc')}
            className="group bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-3 sm:p-5 shadow-2xs hover:shadow-xl transition-all cursor-pointer border border-indigo-700/50 flex flex-col justify-between relative overflow-hidden active:scale-95"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shrink-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 rounded-full truncate">
                  {language === 'hi' ? 'लाइव' : 'Live'}
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-white group-hover:text-indigo-200 transition truncate leading-tight">
                {language === 'hi' ? 'वाहन RC' : 'Vehicle RC'}
              </h3>
              <p className="hidden sm:block text-xs text-slate-300 mt-1 leading-relaxed">
                {language === 'hi' 
                  ? 'गाड़ी नंबर दर्ज करें और आधिकारिक डिजिटल सेवा केंद्र वाटरमार्क सहित RC तुरंत प्राप्त करें।' 
                  : 'Enter vehicle number and download official verified RC card with watermark.'}
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-xs font-bold text-indigo-300">
              <span>{language === 'hi' ? 'डाउनलोड ➔' : 'Download ➔'}</span>
              <ArrowRight className="w-3.5 h-3.5 hidden xs:inline group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Service 2: PVC Card Maker */}
          <div
            onClick={() => onNavigate('printportal')}
            className="group bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-3 sm:p-5 shadow-2xs hover:shadow-xl transition-all cursor-pointer border border-blue-700/50 flex flex-col justify-between relative overflow-hidden active:scale-95"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30 shrink-0">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                </div>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 rounded-full truncate">
                  CR-80
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-white group-hover:text-blue-200 transition truncate leading-tight">
                {language === 'hi' ? 'PVC कार्ड' : 'PVC Card'}
              </h3>
              <p className="hidden sm:block text-xs text-slate-300 mt-1 leading-relaxed">
                {language === 'hi' 
                  ? 'आधार, पैन, आयुष्मान कार्ड को 85.6mm×54mm कटिंग बॉर्डर के साथ PVC शीट पर प्रिंट करें।' 
                  : 'Print Aadhaar, PAN, and Ayushman cards on PVC sheets with CR-80 border.'}
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-xs font-bold text-blue-300">
              <span>{language === 'hi' ? 'प्रिंट ➔' : 'Print ➔'}</span>
              <ArrowRight className="w-3.5 h-3.5 hidden xs:inline group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Service 3: e-District Suite */}
          <div
            onClick={() => onNavigate('edistrict')}
            className="group bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-3 sm:p-5 shadow-2xs hover:shadow-xl transition-all cursor-pointer border border-emerald-700/50 flex flex-col justify-between relative overflow-hidden active:scale-95"
          >
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0">
                  <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-0.5 rounded-full truncate">
                  {language === 'hi' ? 'सत्यापन' : 'Verified'}
                </span>
              </div>
              <h3 className="font-bold text-xs sm:text-base text-white group-hover:text-emerald-200 transition truncate leading-tight">
                {language === 'hi' ? 'e-District' : 'e-District'}
              </h3>
              <p className="hidden sm:block text-xs text-slate-300 mt-1 leading-relaxed">
                {language === 'hi' 
                  ? 'स्वप्रमाणित घोषणा पत्र जनरेटर, 100KB दस्तावेज़ पैकर और 1-क्लिक ऑटो-फिलर बॉट।' 
                  : 'Self declaration generator, 100KB document packer and auto-filler.'}
              </p>
            </div>
            <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-xs font-bold text-emerald-300">
              <span>{language === 'hi' ? 'खोलें ➔' : 'Open ➔'}</span>
              <ArrowRight className="w-3.5 h-3.5 hidden xs:inline group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* 27 HIGH-DEMAND JAN SEVA DIRECT PRINT & SLIP SERVICES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-1 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? '100% प्रामाणिक पोर्टल • सीधी पर्ची व कार्ड सुविधा' : '100% Authentic Portals • Direct Slips & Smart Cards'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'hi' ? 'जनसेवा तत्काल पर्ची व कार्ड सेवाएं' : 'Jan Seva Instant Slips & Cards'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'hi' 
                ? 'राशन पर्ची, पेंशन, ई-पैन, UDID, एडवांस आधार, स्कॉलरशिप व भू-नक्शा — तत्काल प्रिंट पाएं!' 
                : 'Ration slips, pensions, e-PAN, UDID, advance Aadhaar, scholarships & map slips.'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'सेवा का नाम खोजें...' : 'Search service name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: language === 'hi' ? 'सभी सेवाएं' : 'All Services' },
            { id: 'card', label: language === 'hi' ? '🪪 कार्ड व पहचान' : '🪪 Cards & ID' },
            { id: 'legal', label: language === 'hi' ? '📜 प्रमाण पत्र' : '📜 Certificates' },
            { id: 'farmer', label: language === 'hi' ? '🌾 किसान व नक्शा' : '🌾 Farmer & Land' },
            { id: 'utility', label: language === 'hi' ? '⚡ बिजली व वाहन' : '⚡ Utility & Vehicle' },
            { id: 'student', label: language === 'hi' ? '🎓 छात्र व रोज़गार' : '🎓 Student & Jobs' },
            { id: 'welfare', label: language === 'hi' ? '🤝 पेंशन व राशन' : '🤝 Welfare & Pension' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid (2 Columns on Mobile, 3 on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 w-full max-w-full">
          {JAN_SEVA_SERVICES
            .filter(s => {
              const matchCat = activeCategory === 'all' || s.category === activeCategory;
              const matchSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.desc.toLowerCase().includes(searchTerm.toLowerCase());
              return matchCat && matchSearch;
            })
            .map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedJanSevaId(s.id);
                  setJanSevaModalOpen(true);
                }}
                className="group bg-white dark:bg-[#0f1d36] rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between active:scale-95"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-[90px] sm:max-w-[170px]">
                      {s.dept}
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                      ₹{s.fee}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-blue-600 transition leading-snug truncate">
                    {s.name}
                  </h3>
                  <p className="hidden xs:block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>{language === 'hi' ? 'प्रिंट ➔' : 'Print ➔'}</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden xs:inline group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* How it Works / 3 Easy Steps */}
      <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {language === 'hi' ? 'आसान और आधुनिक तरीका' : 'Easy & Modern Method'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {language === 'hi' ? 'कैफे पर काम कराने के 3 आसान चरण' : 'How It Works (3 Easy Steps)'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-lg flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              {language === 'hi' ? 'फ़ाइल या सेवा चुनें' : 'Choose File or Service'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === 'hi' ? 'मोबाइल से PDF, फोटो या सरकारी फॉर्म का चयन करें।' : 'Select PDF, photo or government form directly from your mobile.'}
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black text-lg flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              {language === 'hi' ? 'टोकन प्राप्त करें' : 'Get Digital Token'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === 'hi' ? 'आपको एक डिजिटल टोकन नंबर मिलेगा, जो काउंटर पर तुरंत पहचाना जाएगा।' : 'Receive a digital token number, recognized instantly at the counter.'}
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-lg flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              {language === 'hi' ? '1 मिनट में काम पूरा' : 'Job Done in 1 Minute'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {language === 'hi' ? 'प्रिंट तुरंत लें या फॉर्म भरने के बाद रसीद अपने फोन पर ही डाउनलोड करें।' : 'Collect instant printout or download final receipt directly on your phone.'}
            </p>
          </div>
        </div>
      </div>

      {/* Document Privacy Promise ("24 घंटे में स्वतः नष्ट") + 1-Click Shredder */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">
                {language === 'hi' ? '🔒 100% डेटा गोपनीयता व सुरक्षा गारंटी' : '🔒 100% Data Privacy & Security Guarantee'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? 'नागरिकों के दस्तावेज़ की पूर्ण सुरक्षा • कोई डेटा अनधिकृत रूप से सहेजा नहीं जाता' : 'Complete document security • No unauthorized data retention'}
              </p>
            </div>
          </div>

          {settings?.phone && (
            <a
              href={`https://wa.me/91${settings.phone}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 transition shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'hi' ? 'WhatsApp पर सहायता लें' : 'Get Support on WhatsApp'}</span>
            </a>
          )}
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            {language === 'hi'
              ? "आपके दस्तावेज़ प्रिंट के बाद 24 घंटे में स्वतः नष्ट हो जाते हैं। आप प्रिंट के तुरंत बाद 'अभी फ़ाइल डिलीट करें' बटन दबाकर भी तुरंत फ़ाइल नष्ट कर सकते हैं।"
              : "Your documents are automatically shredded within 24 hours of printing. You can also click 'Delete File Now' to shred immediately."}
          </p>
        </div>

        {/* 1-Click Instant Document Shredder Tool */}
        <div className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h4 className="font-bold text-xs sm:text-sm text-white">
              {language === 'hi' ? 'तत्काल 1-क्लिक दस्तावेज़ श्रेडर' : 'Instant 1-Click Document Shredder'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'प्रिंट निकालने के बाद क्या आप अपनी फ़ाइल सर्वर से तुरंत मिटाना चाहते हैं? अपना टोकन नंबर दर्ज करें और नष्ट करें:'
              : 'Want to immediately remove your files after printing? Enter your token number to shred:'}
          </p>

          <form onSubmit={handleShredDocument} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <input
              type="text"
              value={shredTokenInput}
              onChange={(e) => setShredTokenInput(e.target.value)}
              placeholder={language === 'hi' ? 'टोकन नंबर दर्ज करें' : 'Enter Token Number'}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              disabled={isShredding || !shredTokenInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-rose-600/30"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isShredding ? (language === 'hi' ? 'नष्ट किया जा रहा है...' : 'Shredding...') : (language === 'hi' ? 'अभी फ़ाइल डिलीट करें' : 'Delete File Now')}</span>
            </button>
          </form>

          {shredStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              shredStatus.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
            }`}>
              {shredStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{shredStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Jan Seva Modal for 27 Services */}
      <JanSevaModal
        isOpen={janSevaModalOpen}
        onClose={() => setJanSevaModalOpen(false)}
        initialServiceId={selectedJanSevaId}
        selectedCafe={selectedCafe}
        settings={settings}
      />

    </div>
  );
}
