import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, CreditCard, ShieldCheck, Award, FileText, Zap, Sparkles, 
  Printer, ArrowRight, Wallet, History, Search, X, CheckCircle2, 
  Layers, Lock, AlertCircle, RefreshCw, ChevronRight, ChevronLeft, 
  User, ExternalLink, Smartphone, Check, BookOpen, Settings, LogOut,
  HelpCircle, QrCode
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
  services79Rates = [],
  pendingPrintsCount = 0,
  onLogout
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

  const isCustomerUser = Boolean(customerSession?.phone && !isOperator);
  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  const handleConfirmLogout = () => {
    let confirmMsg = 'क्या आप निश्चित रूप से लॉगआउट करना चाहते हैं?';
    if (isOperator) confirmMsg = 'दुकानदार B2B काउंटर से लॉगआउट करें?';
    else if (isCustomerUser) confirmMsg = 'नागरिक खाते से लॉगआउट करें?';

    if (window.confirm(confirmMsg)) {
      if (onLogout) onLogout();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* 1. DISTINCT ROLE-SPECIFIC HERO PRESENTATION CARD (3 CLEAR TIERS) */}
      {/* =================================================================== */}

      {/* ------------------------------------------------------------------- */}
      {/* TIER A: CYBER CAFE OPERATOR / VLE SANCHALAK B2B COUNTER DESK */}
      {/* ------------------------------------------------------------------- */}
      {isOperator ? (
        <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#0f172a] text-white border-2 border-amber-400/50 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Shop Info & Active VLE Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-700/50 pb-3.5 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 p-1 flex items-center justify-center shrink-0 text-2xl shadow-sm">
                🏪
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                    {selectedCafe?.shopName || (language === 'hi' ? 'दुकानदार B2B थोक काउंटर' : 'Shopkeeper B2B Counter')}
                  </h2>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    VLE ID: {selectedCafe?.vleId || 'VLE-Active'}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>365-दिन अधिकृत डिजिटल सेवा केंद्र</span>
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 font-bold mt-0.5">
                  {language === 'hi' 
                    ? '💡 थोक दरें सक्रिय: ग्राहक से पूरी फीस लें, आपका शुद्ध कमीशन सीधे B2B वॉलेट में सुरक्षित।' 
                    : '💡 Wholesale Rates Active: Collect full fee, margin instantly credited.'}
                </p>
              </div>
            </div>

            {/* Logout from Counter */}
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="bg-rose-600/90 hover:bg-rose-600 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0 border border-rose-400/50"
              title="काउंटर से बाहर निकलें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'काउंटर लॉगआउट' : 'Exit Counter'}</span>
            </button>
          </div>

          {/* 4 Counter Live Stats Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3.5">
            {/* Tile 1: B2B Wallet Balance */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col justify-between">
              <span className="text-[11px] font-extrabold text-amber-300">
                {language === 'hi' ? '💰 B2B थोक वॉलेट' : '💰 B2B Wallet'}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg sm:text-xl font-mono font-black text-white">
                  ₹{sanchalakB2bBalance}
                </span>
                <button
                  type="button"
                  onClick={onOpenB2bWallet}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2 py-1 rounded-lg transition active:scale-95 cursor-pointer"
                >
                  +{language === 'hi' ? 'रिचार्ज' : 'Topup'}
                </button>
              </div>
            </div>

            {/* Tile 2: Live Print Queue Alert */}
            <div 
              onClick={() => onNavigateTab('prints')}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col justify-between cursor-pointer hover:bg-white/15 transition group"
            >
              <span className="text-[11px] font-extrabold text-emerald-300 flex items-center justify-between">
                <span>{language === 'hi' ? '🖨️ लाइव प्रिंट कतार' : '🖨️ Print Queue'}</span>
                {pendingPrintsCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                    {pendingPrintsCount} {language === 'hi' ? 'नए' : 'New'}
                  </span>
                )}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-white/90 group-hover:text-amber-200 transition">
                  {language === 'hi' ? '1-क्लिक साइलेंट प्रिंट' : '1-Click Silent Print'}
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Tile 3: Daily Cashbook */}
            <div 
              onClick={() => onNavigateTab('cashbook')}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col justify-between cursor-pointer hover:bg-white/15 transition group"
            >
              <span className="text-[11px] font-extrabold text-cyan-300">
                {language === 'hi' ? '📖 दैनिक रोकड़ बही' : '📖 Cashbook'}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-white/90 group-hover:text-cyan-200 transition">
                  {language === 'hi' ? 'दैनिक हिसाब व आय' : 'Daily Income Record'}
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Tile 4: Udhar Register */}
            <div 
              onClick={() => onNavigateTab('udhar')}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col justify-between cursor-pointer hover:bg-white/15 transition group"
            >
              <span className="text-[11px] font-extrabold text-rose-300">
                {language === 'hi' ? '📒 ग्राहक उधार खाता' : '📒 Udhar Ledger'}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-white/90 group-hover:text-rose-200 transition">
                  {language === 'hi' ? 'बकाया हिसाब लेज़र' : 'Customer Debt Ledger'}
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>

          {/* Quick Operator Shortcuts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-black text-amber-300/80 shrink-0 hidden sm:inline">
              {language === 'hi' ? 'काउंटर टूल्स:' : 'Counter Tools:'}
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('prints')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <Printer className="w-3 h-3 text-amber-300" />
              <span>{language === 'hi' ? 'प्रिंट कतार' : 'Print Queue'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('applications')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <FileText className="w-3 h-3 text-cyan-300" />
              <span>{language === 'hi' ? 'फॉर्म डेस्क' : 'Applications'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTool && onSelectTool('pan_new_apply')}
              className="bg-blue-500/30 hover:bg-blue-600 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition border border-blue-400/30"
            >
              <CreditCard className="w-3 h-3 text-blue-300" />
              <span>{language === 'hi' ? 'नया पैन (49A)' : 'New PAN (49A)'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('cashbook')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <BookOpen className="w-3 h-3 text-emerald-300" />
              <span>{language === 'hi' ? 'रोकड़ बही' : 'Cashbook'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('udhar')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <Layers className="w-3 h-3 text-rose-300" />
              <span>{language === 'hi' ? 'उधार खाता' : 'Udhar'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <History className="w-3 h-3 text-blue-300" />
              <span>{language === 'hi' ? 'ऑर्डर लिस्ट' : 'Orders'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenStandee}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <QrCode className="w-3 h-3 text-purple-300" />
              <span>{language === 'hi' ? 'स्टैंडी QR' : 'Standee QR'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
            >
              <Settings className="w-3 h-3 text-slate-300" />
              <span>{language === 'hi' ? 'दुकान सेटिंग्स' : 'Settings'}</span>
            </button>
          </div>
        </div>
      ) : isCustomerUser ? (
        /* ------------------------------------------------------------------- */
        /* TIER B: REGISTERED CITIZEN USER PERSONAL ACCOUNT DESK */
        /* ------------------------------------------------------------------- */
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#1e3a8a] text-white border-2 border-indigo-500/50 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-700/50 pb-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 p-1 flex items-center justify-center shrink-0 text-xl shadow-sm text-cyan-300">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                    {language === 'hi' ? `नमस्ते, ${customerSession?.name || 'नागरिक'}` : `Welcome, ${customerSession?.name || 'Citizen'}`}
                  </h2>
                  <span className="bg-cyan-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    खाता: +91 {customerSession?.phone || ''}
                  </span>
                </div>
                <p className="text-xs text-indigo-200/90 font-bold mt-0.5">
                  {language === 'hi' 
                    ? 'सुरक्षित डिजिटल नागरिक सेवा केंद्र • आपके सभी सरकारी दस्तावेज़ व प्रमाण पत्र' 
                    : 'Secure Citizen Portal • All your government certificates & smart cards'}
                </p>
              </div>
            </div>

            {/* Logout from Citizen Account */}
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="bg-rose-600/90 hover:bg-rose-600 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0 border border-rose-400/50"
              title="खाते से लॉगआउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'खाता लॉगआउट' : 'Logout'}</span>
            </button>
          </div>

          {/* 3 Citizen Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-2.5">
            {/* Wallet Tile */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-cyan-300 block">
                  {language === 'hi' ? '💳 पर्सनल वॉलेट' : '💳 Personal Wallet'}
                </span>
                <span className="text-lg font-mono font-black text-white">
                  ₹{walletBalance}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenWallet}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-3 py-1.5 rounded-xl transition active:scale-95 cursor-pointer"
              >
                +{language === 'hi' ? 'पैसे जोड़ें' : 'Add Money'}
              </button>
            </div>

            {/* Orders & Reprint Tile */}
            <div 
              onClick={() => onNavigateTab('orders')}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition group"
            >
              <div>
                <span className="text-[11px] font-extrabold text-amber-300 block">
                  {language === 'hi' ? '🖨️ मेरे ऑर्डर्स व रिप्रिंट' : '🖨️ My Orders & Reprint'}
                </span>
                <span className="text-xs font-bold text-white/80 group-hover:text-white">
                  {language === 'hi' ? 'कार्ड्स 1-क्लिक डाउनलोड' : 'Instant Card Download'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition" />
            </div>

            {/* Help & Support Tile */}
            <div 
              onClick={() => onNavigateTab('complaint')}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition group"
            >
              <div>
                <span className="text-[11px] font-extrabold text-emerald-300 block">
                  {language === 'hi' ? '💬 सहायता व टिकट' : '💬 Support & Helpdesk'}
                </span>
                <span className="text-xs font-bold text-white/80 group-hover:text-white">
                  {language === 'hi' ? 'शिकायत व संपर्क' : 'Raise Issue or Ticket'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------- */
        /* SINGLE COMPACT FULL-HD 3D HERO BANNER (REPLACES 3 STACKED BANNERS) */
        /* ------------------------------------------------------------------- */
        <div className="bg-gradient-to-r from-[#0b172a] via-[#0f2744] to-[#042f2e] text-white border border-emerald-500/30 rounded-3xl p-3.5 sm:p-4.5 shadow-xl relative overflow-hidden group">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
            {/* Left Content Column */}
            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
              {/* 3D App Icon / Emblem with subtle float animation */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/60 bg-slate-900 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/smart_cafe_3d_badge.jpg"
                    alt="Smart Cafe 3D"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-3xl flex items-center justify-center h-full">👑</span>';
                    }}
                  />
                </div>
                {/* 3D badge chip */}
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-md shadow-xs">
                  3D HD
                </div>
              </div>

              {/* Text Highlights */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    🇮🇳 {language === 'hi' ? 'भारत का #1 डिजिटल सेवा केंद्र' : "India's #1 Digital Seva Portal"}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 hidden sm:inline">
                    ★ 86+ {language === 'hi' ? 'लाइव सरकारी सेवाएं' : 'Live Govt Services'}
                  </span>
                </div>

                <h2 className="text-sm sm:text-base font-black tracking-tight text-white mt-1 leading-snug">
                  {language === 'hi' 
                    ? '1-क्लिक में सरकारी प्रमाण पत्र, CR-80 PVC स्मार्ट कार्ड, वाहन RC व प्रिंट सेवाएं' 
                    : '1-Click Govt Certificates, CR-80 PVC Smart Cards, Vehicle RC & Live Prints'}
                </h2>

                {/* Compact Interactive Live Job Alerts Pill */}
                <div
                  onClick={() => {
                    if (onSelectTool) {
                      onSelectTool('sarkari_job_feed');
                    } else if (onSelectCategory) {
                      onSelectCategory({ id: 'other', title: { hi: 'अन्य सेवाएं', en: 'Other Services' } });
                    }
                  }}
                  className="mt-1.5 inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition active:scale-98"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
                  <span className="text-amber-300 font-black">📢 {language === 'hi' ? 'लाइव अलर्ट:' : 'Alert:'}</span>
                  <span className="truncate max-w-[260px] sm:max-w-[420px]">UIIC AO • SSC GD • RPF SI • UP Police Result</span>
                  <ChevronRight className="w-3 h-3 text-white/70 shrink-0" />
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <a
                href="/CyberCafe_Portal.apk"
                download="CyberCafe_Portal.apk"
                className="flex-1 md:flex-initial bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95 shrink-0 cursor-pointer"
                title="Android APK v2.0 (18.5 MB)"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                <span>{language === 'hi' ? 'ऐप डाउनलोड' : 'App (APK)'}</span>
              </a>

              <button
                type="button"
                onClick={onOpenShopkeeperLogin}
                className="flex-1 md:flex-initial bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shrink-0"
              >
                <span>🏪</span>
                <span>{language === 'hi' ? 'दुकानदार' : 'Operator'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenCustomerLogin}
                className="flex-1 md:flex-initial bg-white/15 hover:bg-white/25 text-white border border-white/20 font-black px-3.5 py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 shrink-0"
              >
                <User className="w-3.5 h-3.5 text-emerald-300" />
                <span>{language === 'hi' ? 'नागरिक' : 'Citizen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. CATEGORY QUICK-SWITCH HORIZONTAL FILTER PILLS BAR */}
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
      {/* 4. CLEAN 14 CATEGORY CARDS GRID (INCLUDING "अन्य सेवाएं") */}
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
                className={`bg-white dark:bg-slate-900 border ${
                  isOperator ? 'border-amber-200/80 dark:border-amber-900/30' : 'border-slate-200/90 dark:border-slate-800'
                } hover:border-orange-500 hover:shadow-md rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer group active:scale-98 min-h-[145px]`}
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

                  {isOther ? (
                    <span className="block text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {language === 'hi' ? '🎉 100% मुफ़्त • ₹0' : '🎉 100% Free • ₹0'}
                    </span>
                  ) : isOperator ? (
                    <span className="block text-[9px] font-black text-amber-600 dark:text-amber-400 mt-1">
                      {language === 'hi' ? 'थोक दरें लागू' : 'B2B Wholesale'}
                    </span>
                  ) : null}
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
