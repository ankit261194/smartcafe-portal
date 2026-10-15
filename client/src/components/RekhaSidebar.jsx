import React from 'react';
import { 
  LayoutDashboard, Printer, Search, Wallet, User, 
  HelpCircle, LogOut, X, ShieldCheck, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RekhaSidebar({
  isOpen,
  onClose,
  activeTab = 'dashboard',
  onSelectTab,
  onLogout,
  mode = 'customer',
  selectedCafe,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  onOpenWallet,
  onOpenB2bWallet,
  onOpenCustomerProfile,
  onOpenShopkeeperLogin,
  onOpenCustomerLogin,
  customerSession,
  isOperator = false,
  isSuperAdminAuth = false
}) {
  const { language, t, localize } = useLanguage();

  const isUserLoggedIn = Boolean(customerSession?.phone || isOperator || isSuperAdminAuth);
  const displayBalance = (isOperator || mode === 'admin') ? sanchalakB2bBalance : walletBalance;

  // Exact 7 core navigation items with Other Services featured
  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: { hi: 'डैशबोर्ड', en: 'Dashboard' },
      icon: LayoutDashboard
    },
    {
      id: 'orders',
      label: { hi: 'प्रिंट लिस्ट / ऑर्डर्स', en: 'Print List / Orders' },
      icon: Printer
    },
    {
      id: 'panfind-list',
      label: { hi: 'पैन फाइंड लिस्ट', en: 'PAN Find List' },
      icon: Search,
      badge: { hi: 'लाइव', en: 'Live' }
    },
    {
      id: 'wallet',
      label: { hi: 'वॉलेट मैनेज', en: 'Wallet Manage' },
      icon: Wallet
    },
    {
      id: 'myaccount',
      label: { hi: 'माय अकाउंट / प्रोफाइल', en: 'My Account' },
      icon: User
    },
    {
      id: 'complaint',
      label: { hi: 'सहायता व शिकायत', en: 'Help & Complaint' },
      icon: HelpCircle
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity no-print"
        />
      )}

      {/* 100% Fixed Screen Sidebar (Zero Scroll, Fits Within Viewport Height) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-white dark:bg-[#0c162c] text-slate-800 dark:text-slate-100 
        border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between
        transition-all duration-300 ease-in-out select-none shadow-2xl backdrop-blur-md no-print
        overflow-hidden
        ${isOpen 
          ? 'w-64 sm:w-72 translate-x-0 opacity-100' 
          : '-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none lg:border-r-0'
        }
      `}>
        
        {/* Top Header Group */}
        <div className="shrink-0">
          {/* Indian Flag Tricolor Accent Ribbon */}
          <div className="h-1.5 w-full flex shrink-0">
            <div className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ff9933]"></div>
            <div className="flex-1 bg-white border-x border-slate-200"></div>
            <div className="flex-1 bg-gradient-to-r from-[#16a34a] to-[#138808]"></div>
          </div>

          {/* Brand & Close Button */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 p-0.5 shadow-md shadow-amber-500/20 shrink-0 flex items-center justify-center">
                <img 
                  src="/images/smartcafe_navbar_icon.svg" 
                  alt="Smart Cafe Official" 
                  className="w-full h-full object-contain rounded-[10px] animate-smartcafe-icon"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/smartcafe_navbar_icon.svg';
                  }}
                />
              </div>
              <div className="truncate">
                <div className="font-black text-slate-900 dark:text-white text-sm tracking-tight leading-tight flex items-center gap-1.5">
                  <span>Smart Cafe</span>
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
                    B2B
                  </span>
                </div>
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black leading-tight truncate">
                  {selectedCafe?.shopName || (language === 'hi' ? 'डिजिटल सेवा केंद्र' : 'Digital Seva Kendra')}
                </p>
              </div>
            </div>

            {/* Close Button (✕) */}
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center shrink-0"
              title={language === 'hi' ? 'मेन्यू बंद करें' : 'Close Menu'}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Wallet Pill */}
          <div className="mx-3 my-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                {mode === 'admin' || isOperator ? (language === 'hi' ? 'B2B वॉलेट' : 'B2B Wallet') : (language === 'hi' ? 'वॉलेट बैलेंस' : 'Wallet')}
              </span>
              <span className="font-mono font-black text-slate-950 dark:text-white shrink-0 text-xs sm:text-sm">
                ₹{displayBalance}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (mode === 'admin' || isOperator) {
                  if (onOpenB2bWallet) onOpenB2bWallet();
                } else {
                  if (onOpenWallet) onOpenWallet();
                }
              }}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black px-2 py-1 rounded-lg transition shadow-2xs cursor-pointer"
            >
              +{language === 'hi' ? 'जोड़ें' : 'Add'}
            </button>
          </div>
        </div>

        {/* Middle Navigation Group (Strictly Fixed 6 Items, Zero Scroll) */}
        <div className="flex-1 px-3 py-1 space-y-1.5 flex flex-col justify-center">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onSelectTab) onSelectTab(item.id);
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm
                  transition-all duration-150 cursor-pointer text-left group
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 font-black' 
                    : 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-orange-600 dark:hover:text-orange-400'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate leading-tight font-black">
                    {localize(item.label)}
                  </span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-500 text-white uppercase tracking-wider shrink-0 shadow-2xs">
                    {localize(item.badge)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Group (Dedicated Logout Button & SSL Security Badge) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 shrink-0">
          {/* Strictly Dedicated Red Logout Button in Side Toggle */}
          {isUserLoggedIn ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(language === 'hi' ? 'क्या आप निश्चित रूप से लॉगआउट करना चाहते हैं?' : 'Are you sure you want to log out?')) {
                  if (onLogout) onLogout();
                  if (onClose) onClose();
                }
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition cursor-pointer text-xs sm:text-sm"
              title={language === 'hi' ? 'खाते से लॉगआउट करें' : 'Logout of Account'}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{language === 'hi' ? 'लॉगआउट करें (Logout)' : 'Logout'}</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  if (onClose) onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-2 px-2 rounded-xl text-center text-xs shadow-sm transition cursor-pointer"
              >
                🏪 {language === 'hi' ? 'दुकानदार' : 'Operator'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCustomerProfile) onOpenCustomerProfile();
                  else if (onOpenCustomerLogin) onOpenCustomerLogin();
                  if (onClose) onClose();
                }}
                className="bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-black py-2 px-2 rounded-xl text-center text-xs shadow-sm transition cursor-pointer"
              >
                👤 {language === 'hi' ? 'ग्राहक' : 'Citizen'}
              </button>
            </div>
          )}

          {/* Security SSL Notice */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{language === 'hi' ? '100% सुरक्षित 256-Bit एन्क्रिप्टेड' : '100% Secure 256-Bit SSL'}</span>
          </div>
        </div>

      </aside>
    </>
  );
}
