import React from 'react';
import { 
  Home, Car, CreditCard, ShieldCheck, Award, FileText, Zap, 
  Wallet, History, Printer, BookOpen, Users, QrCode, Settings, 
  Sparkles, X, Search, Download, Sun, Moon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const REKHA_NAV_CATEGORIES = [
  {
    category: {
      hi: '1. मुख्य डैशबोर्ड',
      en: '1. Main Dashboard'
    },
    items: [
      { id: 'dashboard', label: { hi: 'डैशबोर्ड (सभी सेवाएं)', en: 'Dashboard (All Services)' }, icon: Home }
    ]
  },
  {
    category: {
      hi: '2. वाहन / RTO सेवाएं',
      en: '2. Vehicle / RTO Services'
    },
    items: [
      { id: 'tool-rc', label: { hi: 'वाहन RC टू PDF / PVC', en: 'Vehicle RC to PDF / PVC' }, icon: Car },
      { id: 'tool-dl', label: { hi: 'ड्राइविंग लाइसेंस (DL) PVC', en: 'Driving Licence (DL) PVC' }, icon: Award },
      { id: 'tool-challan', label: { hi: 'वाहन ई-चालान जांच एवं रसीद', en: 'Vehicle e-Challan & Receipt' }, icon: FileText }
    ]
  },
  {
    category: {
      hi: '3. PAN कार्ड सेवाएं',
      en: '3. PAN Card Services'
    },
    items: [
      { id: 'tool-pan', label: { hi: 'इंस्टेंट पैन कार्ड CR-80 PVC', en: 'Instant PAN Card CR-80 PVC' }, icon: CreditCard },
      { id: 'tool-epan', label: { hi: 'ई-पैन कार्ड डिजिटल डाउनलोड', en: 'e-PAN Card Digital Download' }, icon: Download }
    ]
  },
  {
    category: {
      hi: '4. आधार कार्ड सेवाएं',
      en: '4. Aadhaar Card Services'
    },
    items: [
      { id: 'tool-aadhaar', label: { hi: 'एडवांस आधार CR-80 PVC कार्ड', en: 'Advance Aadhaar CR-80 PVC' }, icon: ShieldCheck }
    ]
  },
  {
    category: {
      hi: '5. वोटर कार्ड सेवाएं',
      en: '5. Voter Card Services'
    },
    items: [
      { id: 'tool-voter', label: { hi: 'डिजिटल वोटर स्मार्ट कार्ड', en: 'Digital Voter Smart Card' }, icon: Award }
    ]
  },
  {
    category: {
      hi: '6. राशन व आयुष्मान सेवाएं',
      en: '6. Food & Health Welfare'
    },
    items: [
      { id: 'tool-ayushman', label: { hi: 'आयुष्मान भारत गोल्डन कार्ड', en: 'Ayushman Bharat Golden Card' }, icon: Sparkles },
      { id: 'tool-ration', label: { hi: 'राशन कार्ड पर्चा / NFSA स्लिप', en: 'Ration Card / NFSA Slip' }, icon: FileText }
    ]
  },
  {
    category: {
      hi: '7. बिजली बिल व रसीद सेवाएं',
      en: '7. Electricity & Receipts'
    },
    items: [
      { id: 'tool-electricity', label: { hi: 'बिजली बिल भुगतान रसीद', en: 'Electricity Bill Receipt' }, icon: Zap },
      { id: 'tool-receipt', label: { hi: 'जन सेवा केंद्र बिल रसीद', en: 'Cyber Cafe Cash Receipt' }, icon: FileText }
    ]
  },
  {
    category: {
      hi: '8. e-District सत्यापन',
      en: '8. e-District Verification'
    },
    items: [
      { id: 'tool-edistrict', label: { hi: 'e-District सत्यापन प्रमाण पत्र', en: 'e-District Verification Slip' }, icon: Award }
    ]
  },
  {
    category: {
      hi: '9. वॉलेट एवं पासबुक',
      en: '9. Wallet & Passbook'
    },
    items: [
      { id: 'wallet', label: { hi: 'वॉलेट एवं पासबुक विवरण', en: 'Wallet & Passbook Details' }, icon: Wallet }
    ]
  },
  {
    category: {
      hi: '10. प्रिंट एवं ऑर्डर हिस्ट्री',
      en: '10. Print & Order History'
    },
    items: [
      { id: 'orders', label: { hi: 'प्रिंट एवं ऑर्डर हिस्ट्री (रीप्रिंट)', en: 'Print & Order History (Reprint)' }, icon: History }
    ]
  }
];

export const OPERATOR_EXCLUSIVE_ITEMS = [
  { id: 'queue', label: { hi: 'लाइव ग्राहक प्रिंट कतार', en: 'Live Customer Print Queue' }, icon: Printer },
  { id: 'cashbook', label: { hi: 'दैनिक रोकड़ बही', en: 'Daily Cashbook' }, icon: BookOpen },
  { id: 'udhar', label: { hi: 'उधार खाता', en: 'Udhar Register' }, icon: Users },
  { id: 'standee', label: { hi: 'दुकान QR स्टैन्डी पोस्टर', en: 'Shop QR Standee Poster' }, icon: QrCode },
  { id: 'settings', label: { hi: 'कैफे सेटिंग्स एवं रेट कार्ड', en: 'Cafe Settings & Rate Card' }, icon: Settings }
];

export default function RekhaSidebar({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  mode, // 'customer', 'admin', or 'superadmin'
  selectedCafe,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  pendingPrintsCount = 0,
  onOpenWallet,
  onOpenB2bWallet,
  onOpenKyc,
  onOpenShopkeeperLogin,
  onOpenSuperAdminLogin,
  isStaffAuth = false,
  searchTerm = '',
  onSearchChange,
  theme = 'light',
  toggleTheme = () => {},
  disabledTools = [],
  toolStatus = {}
}) {
  const { language, t, localize } = useLanguage();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity no-print"
        />
      )}

      {/* Sidebar Aside — Modern Clean Standard Layout */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-white/95 dark:bg-[#0c162c] text-slate-800 dark:text-slate-100 
        border-r border-slate-200 dark:border-slate-800/80 flex flex-col 
        transition-all duration-300 ease-in-out select-none shadow-sm backdrop-blur-md no-print
        ${isOpen 
          ? 'w-76 sm:w-80 translate-x-0 opacity-100' 
          : '-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none lg:border-r-0'
        }
      `}>
        
        {/* Indian Flag Tricolor Accent Ribbon */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ff9933]"></div>
          <div className="flex-1 bg-white border-x border-slate-200"></div>
          <div className="flex-1 bg-gradient-to-r from-[#16a34a] to-[#138808]"></div>
        </div>

        {/* Brand Header & Clean Close (✕) Button */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-600 p-0.5 shadow-md shadow-orange-500/20 shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-600 text-base tracking-tight">
                  SC
                </span>
              </div>
            </div>
            <div className="truncate">
              <div className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5">
                <span>Smart Cafe</span>
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                  B2B
                </span>
              </div>
              <p className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold leading-tight truncate">
                {selectedCafe?.shopName || t('brand_tagline')}
              </p>
            </div>
          </div>

          {/* Clean Standard Close Button (✕) */}
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center shrink-0"
            title={t('close_menu')}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Wallet Quick Card */}
        <div className="p-3.5 mx-3 my-2 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-amber-500/5 to-orange-500/10 dark:bg-slate-800/60 border border-emerald-300 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
              {mode === 'admin' ? t('b2b_wallet_title') : t('customer_wallet_title')}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('live_badge')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-xl font-black text-slate-950 dark:text-white font-mono flex items-center gap-1">
              <span className="text-amber-500">₹</span>
              <span>{mode === 'admin' ? sanchalakB2bBalance : walletBalance}</span>
            </div>

            <button
              type="button"
              onClick={mode === 'admin' ? onOpenB2bWallet : onOpenWallet}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              {t('add_funds')}
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('search_tools_sidebar')}
              className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition font-bold"
            />
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 sidebar-scroll">
          
          {REKHA_NAV_CATEGORIES.map((cat, idx) => {
            const catTitle = localize(cat.category);
            const filteredItems = cat.items.filter(item => {
              const rawToolKey = item.id.replace('tool-', '');
              const isHidden = (disabledTools && (disabledTools.includes(rawToolKey) || disabledTools.includes(item.id))) ||
                (toolStatus && (toolStatus[rawToolKey] === false || toolStatus[item.id] === false));
              if (isHidden) return false;
              const labelStr = localize(item.label);
              return !searchTerm || labelStr.toLowerCase().includes(searchTerm.toLowerCase());
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 rounded-xl border-l-4 border-orange-600 flex items-center justify-between shadow-2xs">
                  <span>{catTitle}</span>
                </div>

                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    const itemLabel = localize(item.label);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs text-left ${
                          isActive 
                            ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white font-black shadow-md shadow-orange-500/30 border border-orange-500' 
                            : 'text-slate-950 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100/70 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-orange-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-orange-600 dark:text-orange-400'}`} />
                        <span className="font-black text-xs sm:text-sm leading-snug">{itemLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Operator Exclusive Sidebar Section */}
          {mode === 'admin' && (
            <div className="space-y-1.5 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
              <div className="px-3 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border-l-4 border-indigo-600 flex items-center justify-between shadow-2xs">
                <span>{t('cat_operator_ctrl')}</span>
                <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">VLE</span>
              </div>

              <div className="space-y-1">
                {OPERATOR_EXCLUSIVE_ITEMS.map((item) => {
                  if (isStaffAuth && (item.id === 'cashbook' || item.id === 'udhar' || item.id === 'settings')) {
                    return null;
                  }

                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  const itemLabel = localize(item.label);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs text-left ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-black shadow-md shadow-indigo-600/30 border border-indigo-500' 
                          : 'text-slate-950 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        <span className="font-black text-xs sm:text-sm leading-snug">{itemLabel}</span>
                      </div>

                      {item.id === 'queue' && pendingPrintsCount > 0 && (
                        <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-xs shrink-0">
                          {pendingPrintsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info & Theme Switcher & KYC VLE link */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-2">
          
          {/* Day / Night Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-extrabold p-2 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            title={theme === 'dark' ? t('day_mode_full') : t('night_mode_full')}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 font-black">{t('day_mode_full')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-700 font-black">{t('night_mode_full')}</span>
              </>
            )}
          </button>

          {onOpenKyc && (
            <button
              type="button"
              onClick={onOpenKyc}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold p-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t('register_vle')}</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 font-mono">
            <span>Smart Cafe B2B v2026.5</span>
            <span className="text-emerald-500 font-bold">{t('live_ready')}</span>
          </div>
        </div>

      </aside>
    </>
  );
}
