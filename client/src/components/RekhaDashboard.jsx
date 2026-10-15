import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, CreditCard, ShieldCheck, Award, FileText, Zap, Sparkles, 
  Printer, ArrowRight, Wallet, History, Search, X, CheckCircle2, 
  Layers, Lock, AlertCircle, RefreshCw, ChevronRight, ChevronLeft, 
  User, ExternalLink, Smartphone, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getMergedServicesCatalog, SERVICE_CATEGORIES } from '../data/servicesCatalog';

// Map category IDs to rich Lucide icons
export const CATEGORY_ICON_MAP = {
  aadhaar: ShieldCheck,
  pan: CreditCard,
  rc: Car,
  dl: Award,
  voter: Award,
  ration: FileText,
  health: ShieldCheck,
  welfare: Layers,
  utility: Zap,
  banking: Zap,
  agriculture: FileText,
  lookup: Search,
  telecom: Smartphone,
  other: Sparkles,
  all: Sparkles
};

export default function RekhaDashboard({
  onSelectTool,
  onSelectCategory,
  onNavigateTab,
  selectedCafe,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  isOperator = false,
  isSuperAdminAuth = false,
  onOpenWallet,
  onOpenB2bWallet,
  onOpenStandee,
  onOpenCustomerProfile,
  onOpenShopkeeperLogin,
  onOpenSuperAdminLogin,
  onOpenCustomerLogin,
  orderHistory = [],
  customerSession,
  disabledTools = [],
  toolStatus = {},
  theme = 'light',
  services79Rates = []
}) {
  const { language, t, localize } = useLanguage();

  // 1. Dynamic Merged Catalog (Enriched 79 P4Points Services)
  const fullCatalog = useMemo(() => {
    return getMergedServicesCatalog(services79Rates);
  }, [services79Rates]);

  // 2. Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    SERVICE_CATEGORIES.forEach(cat => {
      counts[cat.id] = fullCatalog.filter(s => s.group === cat.id || s.category === cat.id).length;
    });
    return counts;
  }, [fullCatalog]);

  const isUserLoggedIn = Boolean(customerSession?.phone || isOperator || isSuperAdminAuth);
  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* TOP HEADER & QUICK CONTROLS (DIRECT ACCESS, ZERO CLUTTER) */}
      {/* =================================================================== */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs flex items-center justify-between gap-3 backdrop-blur-md">
        
        {/* Left: Clean Service Navigator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 truncate">
            {language === 'hi' ? 'डिजिटल सेवा पोर्टल' : 'Digital Services Portal'}
          </span>
        </div>

        {/* Right: Quick Reprint History & Wallet Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Wallet Pill (HIDDEN FOR GUESTS, VISIBLE ONLY WHEN LOGGED IN) */}
          {isUserLoggedIn && (
            <div className="hidden sm:flex bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Wallet className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">₹{displayBalance}</span>
              <button
                type="button"
                onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-0.5 rounded font-black transition cursor-pointer"
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            title={language === 'hi' ? 'ऑर्डर हिस्ट्री व 1-क्लिक रिप्रिंट' : 'Order History & Free Reprint'}
          >
            <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden xs:inline">{language === 'hi' ? 'रिप्रिंट हिस्ट्री' : 'Reprint'}</span>
          </button>
        </div>

      </div>

      {/* 24x7 Live Sarkari Job & Exam Alerts Banner */}
      <div 
        onClick={() => {
          if (onSelectTool) {
            onSelectTool({ id: 'sarkari_job_feed', name: 'लाइव सरकारी नौकरी, एडमिट कार्ड व योजनाएं', category: 'other' });
          } else if (onSelectCategory) {
            onSelectCategory({ id: 'other', title: { hi: '⚡ अन्य उपयोगी सेवाएं (Other Services)', en: '⚡ Other Useful Services' } });
          }
        }}
        className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-3 sm:p-3.5 text-white shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all active:scale-99"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                {language === 'hi' ? '📢 लाइव सरकारी अलर्ट 24x7' : '📢 Live Govt Alerts'}
              </span>
              <span className="text-[10px] text-amber-100 font-bold hidden sm:inline">
                {language === 'hi' ? 'रोज़ाना नए फॉर्म व एडमिट कार्ड' : 'Daily New Forms & Results'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black truncate text-white/95 mt-0.5">
              UIIC AO Admit Card 2026 • SSC Constable GD 2026 • RPF SI Exam City • UP Police Result
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1 bg-white text-orange-600 font-black px-3 py-1.5 rounded-xl text-xs hover:bg-orange-50 transition shadow-xs">
          <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. SPECIAL 7 FREE CYBER CAFE UTILITIES STRIP (100% FREE • 1-CLICK) */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/30 dark:border-amber-500/20 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? '🛠️ साइबर कैफे 7 फ्री टूल्स (Free Cyber Cafe Utilities)' : '🛠️ 7 Free Cyber Cafe Utilities'}
                </h2>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                  100% FREE (₹0)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {language === 'hi' 
                  ? 'A4 to PVC क्रॉपर, पासपोर्ट फोटो मेकर, 50KB रिसाइज़र, बैंक IFSC, पिनकोड व QR कोड — 1-क्लिक में तुरंत काम पूरा करें'
                  : 'PVC Cropper, Passport Photo Maker, 50KB Resizer, Bank IFSC, Pincode & QR — Instant 1-Click Generation'
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const otherCat = SERVICE_CATEGORIES.find(c => c.id === 'other') || {
                id: 'other',
                title: { hi: '⚡ अन्य उपयोगी सेवाएं (Other Services)', en: '⚡ Other Useful Services' }
              };
              if (onSelectCategory) onSelectCategory(otherCat);
            }}
            className="self-start sm:self-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
          >
            <span>{language === 'hi' ? '⚡ अन्य सेवाएं पेज खोलें (7 टूल्स)' : 'Open Other Services Hub (7 Tools)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7 Free Tools 1-Click Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          
          {/* Tool 1: A4 to PVC Auto-Cropper */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'pvc_auto_cropper', name: 'A4 to PVC कार्ड ऑटो-क्रॉपर', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 hover:border-orange-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-orange-600 line-clamp-1">
              {language === 'hi' ? 'A4 to PVC क्रॉपर' : 'PVC Auto-Cropper'}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              CR-80 85.6×54mm
            </span>
          </div>

          {/* Tool 2: Passport Photo Maker */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'passport_photo_maker', name: '1-क्लिक पासपोर्ट साइज फोटो मेकर', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 hover:border-blue-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-600 line-clamp-1">
              {language === 'hi' ? 'पासपोर्ट फोटो मेकर' : 'Passport Photos'}
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">
              4×6 शीट / 8 फोटो
            </span>
          </div>

          {/* Tool 3: Govt Form Resizer (50KB) */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'govt_form_resizer', name: 'सरकारी फॉर्म फोटो व साइन रिसाइज़र', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 line-clamp-1">
              {language === 'hi' ? 'फॉर्म 50KB रिसाइज़र' : '50KB Resizer'}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              SSC/पुलिस 20-50KB
            </span>
          </div>

          {/* Tool 4: Bank IFSC Lookup */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'bank_ifsc_lookup', name: 'बैंक IFSC सर्च व शाखा विवरण', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 line-clamp-1">
              {language === 'hi' ? 'बैंक IFSC कोड' : 'Bank IFSC'}
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
              शाखा, पता, MICR
            </span>
          </div>

          {/* Tool 5: India Post Pincode Locator */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'pincode_lookup', name: 'डाकघर पिनकोड सर्च व एड्रेस लोकेटर', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 hover:border-red-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-red-600 line-clamp-1">
              {language === 'hi' ? 'डाकघर पिनकोड' : 'Post Pincode'}
            </div>
            <span className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1">
              जिला व सभी डाकघर
            </span>
          </div>

          {/* Tool 6: Instant QR Code Generator */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'qr_generator', name: 'इंस्टेंट पेमेंट व टोकन QR कोड मेकर', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 hover:border-purple-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-purple-600 line-clamp-1">
              {language === 'hi' ? 'QR कोड मेकर' : 'QR Maker'}
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1">
              पेमेंट व रसीद QR
            </span>
          </div>

          {/* Tool 7: Sarkari Jobs Live Feed */}
          <div
            onClick={() => onSelectTool && onSelectTool({ id: 'sarkari_job_feed', name: 'लाइव सरकारी नौकरी, एडमिट कार्ड व योजनाएं', category: 'other' })}
            className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 hover:border-amber-500 rounded-2xl p-3 flex flex-col items-center justify-between text-center cursor-pointer group hover:shadow-md transition active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="font-black text-xs text-slate-800 dark:text-slate-100 group-hover:text-amber-600 line-clamp-1">
              {language === 'hi' ? 'सरकारी रिजल्ट' : 'Sarkari Jobs'}
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
              24x7 नए फॉर्म
            </span>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. CATEGORY QUICK-SWITCH HORIZONTAL FILTER PILLS BAR */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-black text-slate-500 shrink-0 hidden sm:inline">
          {language === 'hi' ? 'श्रेणी चुनें:' : 'Categories:'}
        </span>

        {/* Featured "Other Services (7 Free Tools)" Pill - Highlighted Right At Start */}
        <button
          type="button"
          onClick={() => {
            const otherCat = SERVICE_CATEGORIES.find(c => c.id === 'other') || {
              id: 'other',
              title: { hi: '⚡ अन्य उपयोगी सेवाएं (Other Services)', en: '⚡ Other Useful Services' }
            };
            if (onSelectCategory) onSelectCategory(otherCat);
          }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-orange-700 text-white font-black px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>⚡ अन्य उपयोगी सेवाएं (7 Free Tools) 🔥</span>
        </button>

        {/* All Other Category Pills */}
        {SERVICE_CATEGORIES.filter(c => c.id !== 'other').map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory(c);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold px-3 py-1.5 rounded-full text-xs transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 shadow-2xs"
          >
            {localize(c.title)}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* 4. CLEAN 14 CATEGORY CARDS GRID */}
      {/* =================================================================== */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5">
          {SERVICE_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICON_MAP[cat.id] || Sparkles;
            const count = categoryCounts[cat.id] || 0;
            const isOther = cat.id === 'other';

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(cat);
                  }
                }}
                className={`rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer group active:scale-98 min-h-[145px] ${
                  isOther
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-orange-500 hover:shadow-md'
                }`}
              >
                {/* Category Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-2 ${
                  isOther ? 'animate-bounce' : ''
                }`}>
                  <IconComp className="w-6 h-6" />
                </div>

                {/* Category Title */}
                <div className="w-full">
                  <h3 className={`text-xs sm:text-sm font-black line-clamp-1 leading-snug ${
                    isOther 
                      ? 'text-orange-700 dark:text-orange-400 font-black' 
                      : 'text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                  }`}>
                    {localize(cat.title)}
                  </h3>
                  
                  {isOther ? (
                    <span className="inline-block text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 px-2 py-0.5 rounded-full mt-1.5 shadow-2xs">
                      🔥 7 फ्री टूल्स (Free)
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1.5">
                      {count} {language === 'hi' ? 'सेवाएं' : 'Services'}
                    </span>
                  )}
                </div>

                {/* Small Action */}
                <div className="mt-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                  <span>{language === 'hi' ? 'सेवाएं देखें' : 'View Options'}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
