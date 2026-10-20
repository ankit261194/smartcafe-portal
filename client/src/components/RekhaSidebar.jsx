import React from 'react';
import { 
  LayoutDashboard, Printer, Search, Wallet, User, 
  HelpCircle, LogOut, X, ShieldCheck, Sparkles,
  FileText, BookOpen, Layers, Settings, QrCode,
  Users, Puzzle, CreditCard
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
  onOpenSuperAdminLogin,
  onOpenStandee,
  customerSession,
  isOperator = false,
  isSuperAdminAuth = false
}) {
  const { language, t, localize } = useLanguage();

  const isCustomerUser = Boolean(customerSession?.phone && mode === 'customer');
  const isOperatorActive = isOperator || mode === 'admin';
  const isUserLoggedIn = Boolean(isCustomerUser || isOperatorActive || isSuperAdminAuth);
  const displayBalance = isOperatorActive ? sanchalakB2bBalance : walletBalance;

  // 1. Operator Navigation Items (Commercial Cyber Cafe Desk)
  const OPERATOR_NAV_ITEMS = [
    {
      id: 'dashboard',
      label: { hi: 'थोक डैशबोर्ड', en: 'B2B Dashboard' },
      icon: LayoutDashboard
    },
    {
      id: 'customers',
      label: { hi: '👥 मेरे ग्राहक व OTP', en: 'My Customers & OTP' },
      icon: Users,
      badge: { hi: 'लाइव OTP', en: 'Live OTP' }
    },
    {
      id: 'extension',
      label: { hi: '🧩 e-District एक्सटेंशन', en: 'e-District Extension' },
      icon: Puzzle,
      badge: { hi: 'ऑटो-फ़िल', en: 'Auto-Fill' }
    },
    {
      id: 'prints',
      label: { hi: 'लाइव प्रिंट कतार', en: 'Live Print Queue' },
      icon: Printer
    },
    {
      id: 'applications',
      label: { hi: 'फॉर्म आवेदन डेस्क', en: 'Application Desk' },
      icon: FileText
    },
    {
      id: 'cashbook',
      label: { hi: 'दैनिक रोकड़ बही', en: 'Daily Cashbook' },
      icon: BookOpen
    },
    {
      id: 'udhar',
      label: { hi: 'ग्राहक उधार रजिस्टर', en: 'Udhar Register' },
      icon: Layers
    },
    {
      id: 'orders',
      label: { hi: '🖨️ प्रिंट इतिहास (30-दिन)', en: 'Print History (30-Day)' },
      icon: Printer,
      badge: { hi: 'सुरक्षित', en: 'Saved' }
    },
    {
      id: 'panfind-list',
      label: { hi: 'पैन फाइंड लिस्ट', en: 'PAN Find List' },
      icon: Search,
      badge: { hi: 'लाइव', en: 'Live' }
    },
    {
      id: 'new_pan_card',
      label: { hi: '💳 नया पैन कार्ड (Form 49A)', en: '💳 New PAN (Form 49A)' },
      icon: CreditCard,
      badge: { hi: 'ज़ीरो प्रिंट', en: 'Zero Print' }
    },
    {
      id: 'settings',
      label: { hi: 'दुकान सेटिंग्स व रेट्स', en: 'Cafe Settings' },
      icon: Settings
    }
  ];

  // 2. Customer User Navigation Items (Personal Citizen Portal)
  const CUSTOMER_NAV_ITEMS = [
    {
      id: 'dashboard',
      label: { hi: 'नागरिक सेवा डैशबोर्ड', en: 'Services Dashboard' },
      icon: LayoutDashboard
    },
    {
      id: 'new_pan_card',
      label: { hi: '💳 नया पैन कार्ड (Form 49A)', en: '💳 New PAN (Form 49A)' },
      icon: CreditCard,
      badge: { hi: 'डिजिटल', en: 'Digital' }
    },
    {
      id: 'print',
      label: { hi: 'त्वरित दस्तावेज़ प्रिंट', en: 'Quick Print' },
      icon: Printer
    },
    {
      id: 'orders',
      label: { hi: '🖨️ प्रिंट इतिहास (30-दिन)', en: 'Print History (30-Day)' },
      icon: Printer,
      badge: { hi: 'सुरक्षित', en: 'Saved' }
    },
    {
      id: 'wallet',
      label: { hi: 'वॉलेट मैनेज (+ पैसे जोड़ें)', en: 'My Wallet (+ Add)' },
      icon: Wallet
    },
    {
      id: 'panfind-list',
      label: { hi: 'पैन फाइंड लिस्ट', en: 'PAN Find List' },
      icon: Search,
      badge: { hi: 'लाइव', en: 'Live' }
    },
    {
      id: 'myaccount',
      label: { hi: 'माय प्रोफाइल', en: 'My Profile' },
      icon: User
    },
    {
      id: 'complaint',
      label: { hi: 'सहायता व शिकायत', en: 'Help & Complaint' },
      icon: HelpCircle
    }
  ];

  // 3. Public Guest Navigation Items (Unauthenticated)
  const GUEST_NAV_ITEMS = [
    {
      id: 'dashboard',
      label: { hi: 'सभी नागरिक सेवाएं', en: 'All Services' },
      icon: LayoutDashboard
    },
    {
      id: 'new_pan_card',
      label: { hi: '💳 नया पैन कार्ड (Form 49A)', en: '💳 New PAN (Form 49A)' },
      icon: CreditCard,
      badge: { hi: 'डिजिटल', en: 'Digital' }
    },
    {
      id: 'print',
      label: { hi: 'त्वरित दस्तावेज़ प्रिंट', en: 'Quick Print' },
      icon: Printer
    },
    {
      id: 'guest-operator-login',
      label: { hi: '🏪 दुकानदार B2B काउंटर', en: '🏪 Shopkeeper Counter' },
      icon: User
    },
    {
      id: 'guest-customer-login',
      label: { hi: '👤 नागरिक लॉगिन / साइनअप', en: '👤 Citizen Login' },
      icon: User
    },
    {
      id: 'complaint',
      label: { hi: 'सहायता केंद्र', en: 'Help Center' },
      icon: HelpCircle
    }
  ];

  const currentNavItems = isOperatorActive 
    ? OPERATOR_NAV_ITEMS 
    : isCustomerUser 
    ? CUSTOMER_NAV_ITEMS 
    : GUEST_NAV_ITEMS;

  const handleItemClick = (item) => {
    if (item.id === 'wallet') {
      if (isOperatorActive && onOpenB2bWallet) onOpenB2bWallet();
      else if (onOpenWallet) onOpenWallet();
    } else if (item.id === 'myaccount') {
      if (onOpenCustomerProfile) onOpenCustomerProfile();
    } else if (item.id === 'guest-operator-login') {
      if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
    } else if (item.id === 'guest-customer-login') {
      if (onOpenCustomerLogin) onOpenCustomerLogin();
      else if (onOpenCustomerProfile) onOpenCustomerProfile();
    } else {
      if (onSelectTab) onSelectTab(item.id);
    }
    if (window.innerWidth < 1024 && onClose) onClose();
  };

  const handleLogoutClick = () => {
    let confirmMsg = 'क्या आप निश्चित रूप से लॉगआउट करना चाहते हैं?';
    if (isOperatorActive) confirmMsg = 'दुकानदार B2B काउंटर से लॉगआउट करें?';
    else if (isCustomerUser) confirmMsg = 'नागरिक खाते से लॉगआउट करें?';

    if (window.confirm(confirmMsg)) {
      if (onLogout) onLogout();
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity no-print"
        />
      )}

      {/* 100% Fixed Screen Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        bg-white dark:bg-[#0c162c] text-slate-800 dark:text-slate-100 
        border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between
        transition-all duration-300 ease-in-out select-none shadow-2xl backdrop-blur-md no-print
        overflow-y-auto scrollbar-thin
        ${isOpen 
          ? 'w-64 sm:w-72 translate-x-0 opacity-100' 
          : '-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none lg:border-r-0'
        }
      `}>
        
        {/* Top Header Group */}
        <div className="shrink-0">
          {/* Top Tricolor Accent Ribbon */}
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
                  {isOperatorActive ? (
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
                      B2B
                    </span>
                  ) : isCustomerUser ? (
                    <span className="bg-indigo-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
                      USER
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] font-black leading-tight truncate text-emerald-600 dark:text-emerald-400">
                  {isOperatorActive
                    ? (selectedCafe?.shopName || (language === 'hi' ? 'दुकानदार B2B काउंटर' : 'Shopkeeper Counter'))
                    : isCustomerUser
                    ? (customerSession.name ? `${customerSession.name}` : `+91 ${customerSession.phone}`)
                    : (selectedCafe?.shopName || (language === 'hi' ? 'डिजिटल नागरिक सेवा केंद्र' : 'Citizen Service Hub'))}
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

          {/* Live Wallet Pill (When Logged in) */}
          {isUserLoggedIn && (
            <div className="mx-3 my-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                  {isOperatorActive ? (language === 'hi' ? 'B2B थोक वॉलेट' : 'B2B Wallet') : (language === 'hi' ? 'वॉलेट बैलेंस' : 'Wallet')}
                </span>
                <span className="font-mono font-black text-slate-950 dark:text-white shrink-0 text-xs sm:text-sm">
                  ₹{displayBalance}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isOperatorActive && onOpenB2bWallet) onOpenB2bWallet();
                  else if (onOpenWallet) onOpenWallet();
                }}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-black px-2 py-1 rounded-lg transition shadow-2xs cursor-pointer"
              >
                +{language === 'hi' ? 'जोड़ें' : 'Add'}
              </button>
            </div>
          )}
        </div>

        {/* Middle Navigation Group */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {currentNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs sm:text-sm
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
          {/* Dedicated Red Logout Button */}
          {isUserLoggedIn ? (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 transition cursor-pointer text-xs sm:text-sm border border-rose-500"
              title={isOperatorActive ? 'काउंटर से बाहर निकलें' : 'खाते से लॉगआउट करें'}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>
                {isOperatorActive 
                  ? (language === 'hi' ? 'काउंटर से बाहर निकलें (लॉगआउट)' : 'Exit Counter (Logout)')
                  : (language === 'hi' ? 'खाता लॉगआउट करें (Logout)' : 'Logout of Account')}
              </span>
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
                👤 {language === 'hi' ? 'नागरिक' : 'Citizen'}
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
