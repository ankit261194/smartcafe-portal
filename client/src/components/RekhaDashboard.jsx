import React from 'react';
import { 
  Car, CreditCard, ShieldCheck, Award, FileText, Zap, Sparkles, 
  Printer, ArrowRight, Wallet, History, Users, Clock, CheckCircle2, 
  Layers, Crop, ChevronRight, User, Download
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DIRECT_SERVICES_TILES = [
  { id: 'rc', label: { hi: 'वाहन RC', en: 'Vehicle RC' }, sub: { hi: 'CR-80 PVC', en: 'CR-80 PVC' }, icon: Car, color: 'from-blue-600 to-indigo-600', wholesale: '₹10', retail: '₹20' },
  { id: 'pan', label: { hi: 'पैन कार्ड', en: 'PAN Card' }, sub: { hi: 'CR-80 PVC', en: 'CR-80 PVC' }, icon: CreditCard, color: 'from-teal-600 to-emerald-600', wholesale: '₹10', retail: '₹25' },
  { id: 'aadhaar', label: { hi: 'आधार PVC', en: 'Aadhaar PVC' }, sub: { hi: 'UIDAI Smart', en: 'UIDAI Smart' }, icon: ShieldCheck, color: 'from-red-600 to-rose-600', wholesale: '₹15', retail: '₹30' },
  { id: 'voter', label: { hi: 'वोटर कार्ड', en: 'Voter ID' }, sub: { hi: 'EPIC Smart', en: 'EPIC Smart' }, icon: Award, color: 'from-amber-600 to-orange-600', wholesale: '₹15', retail: '₹30' },
  { id: 'ayushman', label: { hi: 'आयुष्मान', en: 'Ayushman' }, sub: { hi: 'PM-JAY कार्ड', en: 'PM-JAY Card' }, icon: Sparkles, color: 'from-yellow-600 to-amber-600', wholesale: '₹10', retail: '₹25' },
  { id: 'ration', label: { hi: 'राशन पर्ची', en: 'Ration Slip' }, sub: { hi: 'NFSA स्लिप', en: 'NFSA Slip' }, icon: FileText, color: 'from-green-600 to-emerald-600', wholesale: '₹10', retail: '₹20' },
  { id: 'electricity', label: { hi: 'बिजली बिल', en: 'Electricity Bill' }, sub: { hi: 'भुगतान रसीद', en: 'Payment Slip' }, icon: Zap, color: 'from-cyan-600 to-blue-600', wholesale: '₹5', retail: '₹15' },
  { id: 'edistrict', label: { hi: 'e-District', en: 'e-District' }, sub: { hi: 'सत्यापन पर्ची', en: 'Verification Slip' }, icon: Award, color: 'from-violet-600 to-purple-600', wholesale: '₹15', retail: '₹30' },
  { id: 'dl', label: { hi: 'DL सारथी', en: 'DL Sarathi' }, sub: { hi: 'स्मार्ट कार्ड', en: 'Smart Card' }, icon: Car, color: 'from-indigo-600 to-blue-700', wholesale: '₹15', retail: '₹30' },
  { id: 'challan', label: { hi: 'ई-चालान', en: 'e-Challan' }, sub: { hi: 'जांच व रसीद', en: 'Check & Slip' }, icon: FileText, color: 'from-rose-600 to-red-600', wholesale: '₹10', retail: '₹20' },
  { id: 'epan', label: { hi: 'e-PAN', en: 'e-PAN' }, sub: { hi: 'डाउनलोड', en: 'Download' }, icon: Download, color: 'from-teal-600 to-emerald-700', wholesale: '₹10', retail: '₹20' },
  { id: 'receipt', label: { hi: 'कैफे रसीद', en: 'Cafe Receipt' }, sub: { hi: 'टैक्स स्लिप', en: 'Tax Slip' }, icon: FileText, color: 'from-purple-600 to-indigo-700', wholesale: '₹5', retail: '₹15' }
];

export const REKHA_CATEGORIES_CONFIG = [
  {
    id: 'vehicle',
    title: { hi: 'वाहन व RTO सेवाएं', en: 'Vehicle & RTO Services' },
    desc: { hi: 'RC, ड्राइविंग लाइसेंस एवं ई-चालान रसीद सेवा', en: 'Parivahan RC, Driving Licence & e-Challan Receipts' },
    toolsCount: 3,
    icon: Car,
    color: 'from-blue-600 via-indigo-600 to-blue-700',
    lightBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-900/60',
    accentText: 'text-blue-600 dark:text-blue-400',
    wholesaleBadge: { hi: 'थोक: ₹10 - ₹200', en: 'Wholesale: ₹10 - ₹200' },
    retailBadge: { hi: 'खुदरा: ₹20 - ₹250', en: 'Retail: ₹20 - ₹250' },
    defaultToolId: 'rc'
  },
  {
    id: 'pan',
    title: { hi: 'पैन कार्ड सेवाएं', en: 'PAN Card Services' },
    desc: { hi: 'CR-80 PVC पैन कार्ड एवं ई-पैन डिजिटल डाउनलोड', en: 'CR-80 PVC PAN Card & e-PAN Digital Download' },
    toolsCount: 2,
    icon: CreditCard,
    color: 'from-teal-600 via-emerald-600 to-teal-700',
    lightBg: 'bg-teal-50/70 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-900/60',
    accentText: 'text-teal-600 dark:text-teal-400',
    wholesaleBadge: { hi: 'थोक: ₹10 - ₹15', en: 'Wholesale: ₹10 - ₹15' },
    retailBadge: { hi: 'खुदरा: ₹25 - ₹30', en: 'Retail: ₹25 - ₹30' },
    defaultToolId: 'pan'
  },
  {
    id: 'aadhaar',
    title: { hi: 'आधार कार्ड सेवाएं', en: 'Aadhaar Card Services' },
    desc: { hi: 'एडवांस CR-80 PVC आधार कार्ड व QR लेआउट', en: 'Advance CR-80 PVC Aadhaar Card with QR' },
    toolsCount: 1,
    icon: ShieldCheck,
    color: 'from-rose-600 via-red-600 to-rose-700',
    lightBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-900/60',
    accentText: 'text-rose-600 dark:text-rose-400',
    wholesaleBadge: { hi: 'थोक: ₹15', en: 'Wholesale: ₹15' },
    retailBadge: { hi: 'खुदरा: ₹30', en: 'Retail: ₹30' },
    defaultToolId: 'aadhaar'
  },
  {
    id: 'voter',
    title: { hi: 'वोटर कार्ड सेवाएं', en: 'Voter ID Services' },
    desc: { hi: 'डिजिटल वोटर स्मार्ट कार्ड', en: 'Digital Voter Smart Card' },
    toolsCount: 1,
    icon: Award,
    color: 'from-amber-600 via-orange-600 to-amber-700',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-900/60',
    accentText: 'text-amber-600 dark:text-amber-400',
    wholesaleBadge: { hi: 'थोक: ₹15', en: 'Wholesale: ₹15' },
    retailBadge: { hi: 'खुदरा: ₹30', en: 'Retail: ₹30' },
    defaultToolId: 'voter'
  },
  {
    id: 'welfare',
    title: { hi: 'राशन व आयुष्मान सेवाएं', en: 'Food & Health Welfare' },
    desc: { hi: 'PM-JAY गोल्डन कार्ड व NFSA राशन पर्ची', en: 'PM-JAY Golden Card & NFSA Ration Slips' },
    toolsCount: 2,
    icon: Sparkles,
    color: 'from-emerald-600 via-green-600 to-emerald-700',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-900/60',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    wholesaleBadge: { hi: 'थोक: ₹10 - ₹15', en: 'Wholesale: ₹10 - ₹15' },
    retailBadge: { hi: 'खुदरा: ₹25 - ₹30', en: 'Retail: ₹25 - ₹30' },
    defaultToolId: 'ayushman'
  },
  {
    id: 'utility',
    title: { hi: 'बिल व रसीद सेवाएं', en: 'Electricity & Receipts' },
    desc: { hi: 'बिजली बिल भुगतान रसीद व काउंटर कैश स्लिप', en: 'Electricity Bill Receipt & Counter Cash Slips' },
    toolsCount: 2,
    icon: Zap,
    color: 'from-cyan-600 via-blue-600 to-cyan-700',
    lightBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-900/60',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    wholesaleBadge: { hi: 'थोक: ₹5 - ₹10', en: 'Wholesale: ₹5 - ₹10' },
    retailBadge: { hi: 'खुदरा: ₹15 - ₹20', en: 'Retail: ₹15 - ₹20' },
    defaultToolId: 'electricity'
  },
  {
    id: 'edistrict',
    title: { hi: 'e-District सेवाएं', en: 'e-District Verification' },
    desc: { hi: 'आय/जाति/निवास डिजिटल सत्यापन प्रमाण पत्र', en: 'Income/Caste/Domicile Digital Verification Slips' },
    toolsCount: 1,
    icon: FileText,
    color: 'from-violet-600 via-purple-600 to-violet-700',
    lightBg: 'bg-violet-50/70 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-900/60',
    accentText: 'text-violet-600 dark:text-violet-400',
    wholesaleBadge: { hi: 'थोक: ₹15', en: 'Wholesale: ₹15' },
    retailBadge: { hi: 'खुदरा: ₹30', en: 'Retail: ₹30' },
    defaultToolId: 'edistrict'
  }
];

export default function RekhaDashboard({
  onSelectTool,
  onNavigateTab,
  selectedCafe,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  isOperator = false,
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
  theme = 'light'
}) {
  const { language, t, localize } = useLanguage();
  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* 1. COMPACT SLIM TICKER STRIP (PURE SINGLE LANGUAGE) */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 dark:bg-slate-900/90 border border-orange-300/80 dark:border-slate-800 rounded-2xl px-3.5 py-2 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: 1-Line Live Ticker Announcement */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="p-1 bg-orange-600 text-white rounded-lg shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </span>
          <div className="text-xs text-slate-800 dark:text-slate-200 truncate font-semibold">
            <span className="text-orange-700 dark:text-orange-400 font-black mr-1">
              {language === 'hi' ? '📢 लाइव:' : '📢 Live:'}
            </span>
            <span>
              {language === 'hi' 
                ? 'वाहन RC, एडवांस CR-80 PVC आधार, पैन कार्ड व आय-जाति प्रमाण पत्र — HD प्रिंट तैयार! (थोक मार्जिन: ₹15-₹50)'
                : 'Vehicle RC, Advance CR-80 PVC Aadhaar, PAN Card & e-District Certificates — HD Prints Ready! (Wholesale Margin: ₹15-₹50)'
              }
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isOperator ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  else if (onNavigateTab) onNavigateTab('operator');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                title={language === 'hi' ? 'दुकानदार B2B लॉगिन' : 'Shopkeeper B2B Login'}
              >
                <span>{language === 'hi' ? '🏪 दुकानदार B2B ➔' : '🏪 Shopkeeper B2B ➔'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                }}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                title={language === 'hi' ? 'मास्टर एडमिन लॉगिन' : 'Master Admin Login'}
              >
                <span>{language === 'hi' ? '👑 एडमिन ➔' : '👑 Admin ➔'}</span>
              </button>
            </>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>🏪 {selectedCafe?.shopName || (language === 'hi' ? 'B2B काउंटर' : 'B2B Counter')}</span>
              <span className="font-mono font-black text-amber-600">₹{displayBalance}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
            title={language === 'hi' ? 'निःशुल्क रिप्रिंट हिस्ट्री' : 'Free Reprint History'}
          >
            <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">{t('reprint')}</span>
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. DIRECT 1-CLICK INSTANT SERVICES GRID (3 COLS ON MOBILE, 6 ON DESKTOP) */}
      {/* =================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t('instant_tools_heading')}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('instant_tools_sub')}
            </p>
          </div>
        </div>

        {/* Responsive Grid: 3 Columns on Mobile (<640px), 4 on sm, 6 on md+ */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 w-full max-w-full">
          {DIRECT_SERVICES_TILES.map((tItem) => {
            const Icon = tItem.icon;
            const labelStr = localize(tItem.label);
            const subStr = localize(tItem.sub);

            return (
              <button
                key={tItem.id}
                type="button"
                onClick={() => onSelectTool(tItem.id)}
                className="group bg-white dark:bg-[#0c162c] rounded-2xl p-2 sm:p-3.5 border border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-between text-center relative overflow-hidden active:scale-95 cursor-pointer"
              >
                <span className="self-end text-[9px] sm:text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40 px-1 sm:px-1.5 py-0.2 rounded-md">
                  {isOperator ? tItem.wholesale : tItem.retail}
                </span>

                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${tItem.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition my-1 shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="w-full">
                  <span className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition block truncate leading-tight">
                    {labelStr}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 block truncate font-medium mt-0.5">
                    {subStr}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. CLEAN CATEGORY BOXES GRID (2 COLS ON MOBILE, 4 ON DESKTOP - NO SUB-SERVICE PILL CLUTTER) */}
      {/* =================================================================== */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t('category_suites_heading')}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('category_suites_sub')}
            </p>
          </div>
        </div>

        {/* Clean Responsive Category Grid: 2 Columns on Mobile, 2 on sm, 3 on lg, 4 on xl */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 w-full max-w-full">
          {REKHA_CATEGORIES_CONFIG.map((cat) => {
            const Icon = cat.icon;
            const titleStr = localize(cat.title);
            const descStr = localize(cat.desc);
            const badgeStr = isOperator ? localize(cat.wholesaleBadge) : localize(cat.retailBadge);

            return (
              <div
                key={cat.id}
                onClick={() => onSelectTool(cat.defaultToolId)}
                className={`bg-white dark:bg-[#0c162c] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border ${cat.borderColor} hover:border-orange-500 dark:hover:border-orange-500 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer`}
              >
                {/* Top Header of Category Box */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-105 transition shrink-0`}>
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-[95px] sm:max-w-none text-right">
                      {badgeStr}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition leading-snug truncate">
                      {titleStr}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed line-clamp-2">
                      {descStr}
                    </p>
                  </div>
                </div>

                {/* Bottom 1-Click Launch Action (Clean, un-cluttered card footer) */}
                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div
                    className="w-full bg-slate-50 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white text-slate-700 dark:bg-slate-800/60 dark:text-slate-200 font-black py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs flex items-center justify-between transition shadow-2xs group-hover:shadow-md"
                  >
                    <span>{t('launch_service')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition shrink-0" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. RECENT ORDERS & FREE REPRINT STRIP */}
      {/* =================================================================== */}
      <div className="bg-white dark:bg-[#0c162c] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-2xl">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {t('recent_orders_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('recent_orders_sub')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
          >
            <span>{t('view_all_history')} ➔</span>
          </button>
        </div>

        {orderHistory.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs space-y-1.5">
            <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
            <p>{t('no_orders_yet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {orderHistory.slice(0, 3).map((item) => (
              <div 
                key={item.id || item.orderId}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 truncate">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                    {new Date(item.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                  </span>
                  <strong className="text-xs text-slate-900 dark:text-white font-bold block truncate">
                    {item.docTitle || item.serviceTitle || (language === 'hi' ? 'डिजिटल सेवा' : 'Digital Service')}
                  </strong>
                  <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 block">
                    {item.refNumber || item.vehicleNumber || '-'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('orders')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('reprint')}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 5. UTILITY SUITE (Print, Resizer, PDF - 3 COLS ACROSS ALL SCREENS) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full">
        
        <div
          onClick={() => onNavigateTab('print')}
          className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 text-white flex items-center justify-center mb-2 sm:mb-3 shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-black text-xs sm:text-base text-white truncate leading-tight">
              {language === 'hi' ? 'क्विक प्रिंट' : 'Quick Print'}
            </h4>
            <p className="hidden sm:block text-xs text-blue-200 mt-1 leading-relaxed">
              {language === 'hi' 
                ? 'फ़ाइल अपलोड करें, B&W या कलर चुनें और तत्काल प्रिंट निकालें।' 
                : 'Upload files, choose B&W or color, and print instantly.'}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-2 border-t border-white/20 text-[10px] sm:text-xs font-bold text-yellow-300 flex items-center justify-between">
            <span>{language === 'hi' ? 'प्रिंट ➔' : 'Print ➔'}</span>
            <ArrowRight className="w-3.5 h-3.5 hidden xs:inline" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('resizer')}
          className="bg-gradient-to-br from-purple-900 to-slate-900 text-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 text-white flex items-center justify-center mb-2 sm:mb-3 shrink-0">
              <Crop className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-black text-xs sm:text-base text-white truncate leading-tight">
              {language === 'hi' ? 'फ़ोटो रिसाइज़र' : 'Photo Resizer'}
            </h4>
            <p className="hidden sm:block text-xs text-purple-200 mt-1 leading-relaxed">
              {language === 'hi' 
                ? 'सरकारी फॉर्म हेतु फ़ोटो को 20KB-50KB व सिग्नेचर को 10KB-20KB में बदलें।' 
                : 'Resize photos to 20KB-50KB and signatures to 10KB-20KB for govt forms.'}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-2 border-t border-white/20 text-[10px] sm:text-xs font-bold text-yellow-300 flex items-center justify-between">
            <span>{language === 'hi' ? 'रिसाइज़ ➔' : 'Resize ➔'}</span>
            <ArrowRight className="w-3.5 h-3.5 hidden xs:inline" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('pdf')}
          className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col justify-between active:scale-95"
        >
          <div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 text-white flex items-center justify-center mb-2 sm:mb-3 shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="font-black text-xs sm:text-base text-white truncate leading-tight">
              {language === 'hi' ? 'PDF टूल्स' : 'PDF Tools'}
            </h4>
            <p className="hidden sm:block text-xs text-teal-200 mt-1 leading-relaxed">
              {language === 'hi' 
                ? 'मार्कशीट, आधार व प्रमाण पत्र की कई PDF फाइलों को 1-क्लिक में जोड़ें।' 
                : 'Merge multiple PDF files like marksheets, Aadhaar, and slips in 1 click.'}
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-2 border-t border-white/20 text-[10px] sm:text-xs font-bold text-yellow-300 flex items-center justify-between">
            <span>{language === 'hi' ? 'PDF ➔' : 'PDF ➔'}</span>
            <ArrowRight className="w-3.5 h-3.5 hidden xs:inline" />
          </div>
        </div>

      </div>

    </div>
  );
}
