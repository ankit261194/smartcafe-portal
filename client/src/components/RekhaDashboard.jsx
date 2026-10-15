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
      {/* 2. CATEGORY QUICK-SWITCH HORIZONTAL FILTER PILLS BAR */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs font-black text-slate-500 shrink-0 hidden sm:inline">
          {language === 'hi' ? 'श्रेणी चुनें:' : 'Categories:'}
        </span>

        {/* All Category Pills */}
        {SERVICE_CATEGORIES.map(c => (
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
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-orange-500 hover:shadow-md rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer group active:scale-98 min-h-[145px]"
              >
                {/* Category Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-2`}>
                  <IconComp className="w-6 h-6" />
                </div>

                {/* Category Title */}
                <div className="w-full">
                  <h3 className="text-xs sm:text-sm font-black line-clamp-1 leading-snug text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {localize(cat.title)}
                  </h3>
                  
                  <span className="inline-block text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1.5">
                    {count} {language === 'hi' ? 'सेवाएं' : 'Services'}
                  </span>
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
