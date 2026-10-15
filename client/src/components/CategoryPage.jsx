import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, X, Sparkles, ShieldCheck, CreditCard, 
  Car, Award, FileText, Zap, Layers, Smartphone, CheckCircle2,
  Lock, RefreshCw, Printer, User, Fingerprint, QrCode, Cpu,
  Flame, Landmark, HeartHandshake, Eye, Check, Clock, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORY_ICON_MAP } from './RekhaDashboard';
import { SERVICE_CATEGORIES } from '../data/servicesCatalog';

// Custom Graphical Badges for Round Circular Icons (matching Rekha Print Style)
function ServiceRoundIcon({ toolKind, serviceId }) {
  const sId = (serviceId || '').toLowerCase();

  // 1. Fingerprint / Biometric Services
  if (sId.includes('finger') || sId.includes('advance') || sId.includes('manual')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
        <Fingerprint className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 2. Robot / Automated Services
  if (sId.includes('robot') || sId.includes('auto') || sId.includes('instant')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
        <Cpu className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 3. PVC / Smart Card Services
  if (sId.includes('pvc') || sId.includes('card_convert') || sId.includes('smart')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 text-white flex items-center justify-center shadow-xs">
        <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 4. OTP / Mobile Verification
  if (sId.includes('otp') || sId.includes('phone') || sId.includes('mobile')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
        <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 5. Ayushman / Health / ABHA
  if (sId.includes('pmjay') || sId.includes('ayushman') || sId.includes('abha') || sId.includes('health')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-xs">
        <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 6. e-Shram / Welfare / Samagra
  if (sId.includes('shram') || sId.includes('samagra') || sId.includes('sambal') || sId.includes('welfare')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-xs">
        <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 7. Bank / NPCI / Financial
  if (sId.includes('bank') || sId.includes('npci') || sId.includes('dbt') || sId.includes('account')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-sky-500 to-blue-700 text-white flex items-center justify-center shadow-xs">
        <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 8. Vehicle / RC / Parivahan
  if (toolKind === 'rc' || sId.includes('rc') || sId.includes('chassis') || sId.includes('engine')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-xs">
        <Car className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 9. Driving Licence / Sarathi
  if (toolKind === 'dl' || sId.includes('dl') || sId.includes('licence')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-700 text-white flex items-center justify-center shadow-xs">
        <Award className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 10. Voter / Election
  if (toolKind === 'voter' || sId.includes('voter') || sId.includes('epic')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-xs">
        <Award className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 11. Ration / Food
  if (toolKind === 'ration' || sId.includes('ration') || sId.includes('khadya')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-lime-600 to-emerald-700 text-white flex items-center justify-center shadow-xs">
        <FileText className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // 12. Electricity / Bill
  if (toolKind === 'electricity' || sId.includes('bill') || sId.includes('electric') || sId.includes('discom')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
        <Zap className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  // Default Kind based
  if (toolKind === 'pan' || toolKind === 'epan') {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
        <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  if (toolKind === 'other' || sId.includes('ifsc') || sId.includes('pincode') || sId.includes('qr') || sId.includes('sarkari') || sId.includes('cropper') || sId.includes('photo_maker') || sId.includes('resizer')) {
    return (
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-rose-600 to-red-700 text-white flex items-center justify-center shadow-xs">
      <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
    </div>
  );
}

export default function CategoryPage({
  category,
  catalog = [],
  onSelectService,
  onSelectCategory,
  onBack,
  theme = 'light'
}) {
  const { language, t, localize } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter services strictly matching this category
  const services = useMemo(() => {
    if (!category?.id) return [];
    let list = catalog.filter(s => s.group === category.id || s.category === category.id);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(s => {
        const nameMatch = s.name && s.name.toLowerCase().includes(q);
        const titleHi = s.title?.hi && s.title.hi.toLowerCase().includes(q);
        const titleEn = s.title?.en && s.title.en.toLowerCase().includes(q);
        const subHi = s.sub?.hi && s.sub.hi.toLowerCase().includes(q);
        const subEn = s.sub?.en && s.sub.en.toLowerCase().includes(q);
        return nameMatch || titleHi || titleEn || subHi || subEn;
      });
    }
    return list;
  }, [catalog, category?.id, searchTerm]);

  // Strict Separation: Active Live Services vs. Under Development / Coming Soon
  const liveServices = useMemo(() => {
    return services.filter(s => !s.isComingSoon && s.status !== 'coming_soon');
  }, [services]);

  const comingSoonServices = useMemo(() => {
    return services.filter(s => s.isComingSoon || s.status === 'coming_soon');
  }, [services]);

  if (!category) {
    return null;
  }

  const categoryTitle = localize(category.title);

  const handleComingSoonClick = (service) => {
    const sName = service.title ? localize(service.title) : service.name;
    alert(language === 'hi' 
      ? `🚧 "${sName}" पर वर्तमान में कार्य चल रहा है। यह सेवा आगामी सिस्टम अपडेट में आधिकारिक सरकारी API के साथ लाइव की जा रही है।`
      : `🚧 "${sName}" is currently under development and will be activated with official APIs in the upcoming update.`
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">

      {/* =================================================================== */}
      {/* 0. CATEGORY QUICK SWITCHER HORIZONTAL BAR */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-black text-slate-500 shrink-0 hidden sm:inline">
          {language === 'hi' ? 'श्रेणी बदलें:' : 'Switch Category:'}
        </span>
        {SERVICE_CATEGORIES.map(cat => {
          const isActive = cat.id === category?.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 shadow-2xs flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-500'
              }`}
            >
              <span>{localize(cat.title)}</span>
            </button>
          );
        })}
      </div>
      
      {/* =================================================================== */}
      {/* 1. TOP BREADCRUMB & HEADER BAR */}
      {/* =================================================================== */}
      <div className="bg-white/95 dark:bg-[#0c162c]/95 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Universal Back & Category Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer shrink-0"
            title={language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Back to Dashboard'}
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="hidden sm:inline">{language === 'hi' ? '← डैशबोर्ड' : '← Dashboard'}</span>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${category.color || 'from-orange-500 to-amber-500'} text-white flex items-center justify-center shrink-0 shadow-md`}>
              {category.id === 'pan' && <CreditCard className="w-6 h-6" />}
              {category.id === 'rc' && <Car className="w-6 h-6" />}
              {category.id === 'dl' && <Award className="w-6 h-6" />}
              {category.id === 'voter' && <Award className="w-6 h-6" />}
              {category.id === 'ration' && <FileText className="w-6 h-6" />}
              {category.id === 'health' && <ShieldCheck className="w-6 h-6" />}
              {category.id === 'welfare' && <Layers className="w-6 h-6" />}
              {category.id === 'utility' && <Zap className="w-6 h-6" />}
              {category.id === 'banking' && <Landmark className="w-6 h-6" />}
              {category.id === 'agriculture' && <FileText className="w-6 h-6" />}
              {category.id === 'lookup' && <Search className="w-6 h-6" />}
              {category.id === 'telecom' && <Smartphone className="w-6 h-6" />}
              {category.id === 'aadhaar' && <ShieldCheck className="w-6 h-6" />}
              {!['pan','rc','dl','voter','ration','health','welfare','utility','banking','agriculture','lookup','telecom','aadhaar'].includes(category.id) && (
                <Sparkles className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  {categoryTitle}
                </h1>
                <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shrink-0">
                  {liveServices.length} {language === 'hi' ? 'सक्रिय लाइव' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {localize(category.desc) || (language === 'hi' ? 'अपनी अभीष्ट सेवा चुनें और विवरण भरें' : 'Select desired service to proceed')}
              </p>
            </div>
          </div>
        </div>

        {/* Right: In-Page Quick Filter Search */}
        <div className="relative w-full md:w-64 sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'hi' ? 'इस श्रेणी में सेवा खोजें...' : 'Filter in category...'}
            className="w-full pl-9 pr-8 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* No Results Fallback */}
      {services.length === 0 ? (
        <div className="bg-white/90 dark:bg-slate-900/90 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-black text-slate-700 dark:text-slate-300">
            {language === 'hi' ? 'इस खोज के अनुसार कोई सेवा नहीं मिली' : 'No services found matching search'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'hi' ? 'कृपया अन्य कीवर्ड खोजें या फिल्टर रीसेट करें।' : 'Please try different keywords.'}
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            {language === 'hi' ? 'सर्च हटाएं ➔' : 'Clear search ➔'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* =================================================================== */}
          {/* SECTION 1: 🟢 चालू और सक्रिय लाइव सेवाएं (LIVE ACTIVE SERVICES) */}
          {/* =================================================================== */}
          {liveServices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {language === 'hi' ? '🟢 चालू और सक्रिय सेवाएं (Live Services)' : '🟢 Active Live Services'}
                  </h2>
                </div>
                <span className="text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                  {liveServices.length} {language === 'hi' ? 'सक्रिय सेवाएं' : 'Active'}
                </span>
              </div>

              <div className="bg-slate-900/40 dark:bg-black/30 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 justify-items-center">
                  {liveServices.map((service) => {
                    const displayTitle = service.title ? localize(service.title) : service.name;

                    return (
                      <div
                        key={service.id}
                        onClick={() => onSelectService(service.id)}
                        className="group flex flex-col items-center cursor-pointer select-none"
                        title={displayTitle}
                      >
                        {/* The Round Circular Disc Button */}
                        <div className="
                          w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 
                          rounded-full 
                          bg-gradient-to-b from-white via-slate-50 to-amber-50/40 
                          dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 
                          border-[3px] border-emerald-500/70 dark:border-emerald-400/60 
                          group-hover:border-emerald-500 dark:group-hover:border-emerald-400 
                          group-hover:ring-4 group-hover:ring-emerald-500/25 dark:group-hover:ring-emerald-400/25
                          group-hover:scale-105 active:scale-95 
                          shadow-lg group-hover:shadow-2xl 
                          transition-all duration-200 ease-out 
                          flex flex-col items-center justify-center p-2.5 sm:p-3 text-center
                        ">
                          {/* Top Graphic / Icon */}
                          <div className="mb-1.5 sm:mb-2 group-hover:-translate-y-0.5 transition-transform duration-200">
                            <ServiceRoundIcon toolKind={service.kind || category.id} serviceId={service.id} />
                          </div>

                          {/* Service Name INSIDE the circle */}
                          <span className="
                            font-black text-[10px] sm:text-[11px] md:text-xs 
                            text-slate-800 dark:text-slate-100 
                            leading-tight line-clamp-2 
                            px-1 max-w-[100px] sm:max-w-[110px]
                            group-hover:text-emerald-700 dark:group-hover:text-emerald-300
                            transition-colors
                          ">
                            {displayTitle}
                          </span>
                        </div>

                        {/* Open Action Indicator */}
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-center">
                          <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
                          <span>➔</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* SECTION 2: 🚧 इन सेवाओं पर काम चल रहा है, जल्द ही लाइव होंगी (COMING SOON) */}
          {/* =================================================================== */}
          {comingSoonServices.length > 0 && (
            <div className="pt-6 border-t-2 border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === 'hi' ? '🚧 इन सेवाओं पर काम चल रहा है, जल्द ही लाइव होंगी' : '🚧 Under Development — Coming Soon'}</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {language === 'hi' ? 'ये सेवाएं अगले अपडेट में आधिकारिक सरकारी API के साथ लाइव जोड़ी जा रही हैं' : 'These services are being integrated with official APIs and will be active shortly'}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-2.5 py-1 rounded-full shrink-0">
                  {comingSoonServices.length} {language === 'hi' ? 'आगामी सेवाएं' : 'Upcoming'}
                </span>
              </div>

              <div className="bg-amber-500/5 dark:bg-amber-950/20 p-4 sm:p-6 rounded-3xl border border-amber-300/40 dark:border-amber-800/40 shadow-inner">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6 justify-items-center">
                  {comingSoonServices.map((service) => {
                    const displayTitle = service.title ? localize(service.title) : service.name;

                    return (
                      <div
                        key={service.id}
                        onClick={() => handleComingSoonClick(service)}
                        className="group flex flex-col items-center cursor-pointer select-none opacity-85 hover:opacity-100 transition-opacity"
                        title={`${displayTitle} (काम प्रगति पर है)`}
                      >
                        {/* The Round Circular Disc Button with Amber Theme */}
                        <div className="
                          w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 
                          rounded-full 
                          bg-gradient-to-b from-white via-slate-50 to-amber-100/30 
                          dark:from-slate-800/90 dark:via-slate-850 dark:to-slate-900 
                          border-[3px] border-amber-400/60 dark:border-amber-500/50 
                          border-dashed
                          group-hover:border-amber-500 dark:group-hover:border-amber-400 
                          group-hover:ring-4 group-hover:ring-amber-500/20 dark:group-hover:ring-amber-400/20
                          group-hover:scale-105 active:scale-95 
                          shadow-md group-hover:shadow-xl 
                          transition-all duration-200 ease-out 
                          flex flex-col items-center justify-center p-2.5 sm:p-3 text-center
                          relative
                        ">
                          {/* Coming Soon Tiny Badge Pill */}
                          <span className="absolute -top-1.5 bg-amber-500 text-slate-950 text-[8px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider shadow-2xs">
                            {language === 'hi' ? 'जल्द ही' : 'Soon'}
                          </span>

                          {/* Top Graphic / Icon */}
                          <div className="mb-1.5 sm:mb-2 group-hover:-translate-y-0.5 transition-transform duration-200 opacity-75 group-hover:opacity-100">
                            <ServiceRoundIcon toolKind={service.kind || category.id} serviceId={service.id} />
                          </div>

                          {/* Service Name INSIDE the circle */}
                          <span className="
                            font-black text-[10px] sm:text-[11px] md:text-xs 
                            text-slate-700 dark:text-slate-200 
                            leading-tight line-clamp-2 
                            px-1 max-w-[100px] sm:max-w-[110px]
                            group-hover:text-amber-700 dark:group-hover:text-amber-300
                            transition-colors
                          ">
                            {displayTitle}
                          </span>
                        </div>

                        {/* Coming Soon Indicator */}
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1 text-center">
                          <Clock className="w-3 h-3" />
                          <span>{language === 'hi' ? 'काम जारी' : 'In Progress'}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =================================================================== */}
      {/* 3. FOOTER TRUST & NOTICE */}
      {/* =================================================================== */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold py-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>
          {language === 'hi'
            ? '100% सुरक्षित एवं अधिकृत डिजिटल सेवा केंद्र — किसी भी चालू सेवा पर क्लिक करके सीधे आवेदन करें'
            : '100% Authorized Digital Seva Kendra Gateway — Click any active service to proceed'}
        </span>
      </div>

    </div>
  );
}
