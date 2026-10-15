import React from 'react';
import { 
  Printer, Wallet, Crown, User, Menu, Sun, Moon, LogOut
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  settings,
  mode, // 'customer', 'admin', or 'superadmin'
  onModeToggle,
  activeCustomerTab,
  onCustomerTabChange,
  activeAdminTab,
  onAdminTabChange,
  pendingPrintsCount = 0,
  onOpenStandee,
  selectedCafe,
  onOpenCafeSelector,
  onOpenWallet,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  pendingUtrCount = 0,
  onOpenB2bWallet,
  onOpenUtrApproval,
  onOpenCustomerComplaints,
  onOpenLicenseCertificate,
  customerSession,
  onOpenCustomerProfile,
  onOpenShopkeeperLogin,
  onOpenSuperAdminLogin,
  onOpenKyc,
  isSuperAdminAuth,
  isCafeAuth,
  isStaffAuth = false,
  onLogout,
  onToggleSidebar,
  theme = 'light',
  toggleTheme = () => {},
  disabledTools = [],
  toolStatus = {}
}) {
  const { language, setLanguage, t, localize } = useLanguage();

  const isOperator = mode === 'admin';
  const isCustomerUser = Boolean(customerSession?.phone && mode === 'customer');
  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  // 4 Distinct Theme Backgrounds per Role
  const headerThemeClass = 
    mode === 'superadmin' 
      ? 'bg-gradient-to-r from-[#0f172a] via-[#1c1917] to-[#450a0a] border-b-2 border-rose-500/70 shadow-rose-950/40' 
      : isOperator 
      ? 'bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#0f172a] border-b-2 border-amber-400/60 shadow-amber-950/30' 
      : isCustomerUser 
      ? 'bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#1e3a8a] border-b-2 border-indigo-500/50 shadow-indigo-950/30' 
      : 'bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] border-b border-emerald-600/40 shadow-emerald-950/20';

  const handleConfirmLogout = () => {
    let confirmMsg = 'क्या आप निश्चित रूप से लॉगआउट करना चाहते हैं?';
    if (mode === 'superadmin') confirmMsg = 'सुपर एडमिन कंट्रोल रूम से लॉगआउट करें?';
    else if (isOperator) confirmMsg = 'दुकानदार B2B काउंटर से लॉगआउट करें?';
    else if (isCustomerUser) confirmMsg = 'नागरिक खाते से लॉगआउट करें?';

    if (window.confirm(confirmMsg)) {
      if (onLogout) onLogout();
    }
  };

  return (
    <header className={`sticky top-0 z-50 text-white shadow-md no-print transition-all duration-200 ${headerThemeClass}`}>
      
      {/* 1. TOP MAIN NAVBAR ROW */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-14 sm:h-15 flex items-center justify-between gap-2 max-w-full">
        
        {/* Left: Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 text-white hover:bg-white/15 active:scale-95 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-white/20 shrink-0"
              title={language === 'hi' ? 'साइड मेन्यू' : 'Side Menu'}
              aria-label="Toggle Side Menu"
            >
              <Menu className="w-5 h-5 text-white shrink-0" />
              <span className="text-[11px] font-black text-white hidden md:inline">{t('menu')}</span>
            </button>
          )}

          <div 
            onClick={() => {
              if (mode === 'customer') onCustomerTabChange('home');
              else if (mode === 'admin') onAdminTabChange('dashboard');
            }}
            className="flex items-center gap-2 cursor-pointer select-none min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 p-0.5 shadow-md shrink-0 border border-amber-300/40 flex items-center justify-center">
              <img 
                src="/images/smartcafe_navbar_icon.svg" 
                alt="Smart Cafe Official" 
                className="w-full h-full object-contain rounded-[14px] animate-smartcafe-icon"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/smartcafe_navbar_icon.svg';
                }}
              />
            </div>
            <div className="min-w-0 truncate">
              <h1 className="font-black text-white text-xs sm:text-base leading-tight tracking-tight flex items-center gap-1 truncate">
                <span className="truncate">Smart Cafe</span>
                
                {/* 4 Distinct Role Badges */}
                {mode === 'superadmin' ? (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs shrink-0 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    <span>{language === 'hi' ? 'मास्टर एडमिन' : 'Root Admin'}</span>
                  </span>
                ) : isOperator ? (
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs shrink-0 flex items-center gap-0.5">
                    <span>🏪</span>
                    <span>{isStaffAuth ? (language === 'hi' ? 'स्टाफ' : 'Staff') : (language === 'hi' ? 'B2B काउंटर' : 'Operator Desk')}</span>
                  </span>
                ) : isCustomerUser ? (
                  <span className="bg-indigo-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs shrink-0 flex items-center gap-0.5">
                    <User className="w-2.5 h-2.5" />
                    <span>{language === 'hi' ? 'नागरिक खाता' : 'Citizen Account'}</span>
                  </span>
                ) : (
                  <span className="bg-emerald-400/90 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs shrink-0">
                    {language === 'hi' ? 'नागरिक पोर्टल' : 'Public Portal'}
                  </span>
                )}
              </h1>
              
              <p className="text-[9px] sm:text-[11px] text-white/80 font-bold truncate hidden xs:block">
                {isOperator 
                  ? (selectedCafe?.shopName ? `🏪 ${selectedCafe.shopName}` : (language === 'hi' ? 'दुकानदार B2B थोक काउंटर' : 'Shopkeeper Counter'))
                  : isCustomerUser 
                  ? (customerSession?.name ? `👤 ${customerSession.name} (+91 ${customerSession.phone})` : `+91 ${customerSession?.phone || ''}`)
                  : (selectedCafe?.shopName || t('brand_tagline'))}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Integrated Actions (Language, Wallet, Day/Night, Desktop Auth, PROMINENT LOGOUT) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          
          {/* Dynamic Language Switcher */}
          <div className="flex items-center bg-white/15 border border-white/20 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-1.5 sm:px-2 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                language === 'hi' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-white/80 hover:text-white'
              }`}
              title="हिंदी भाषा सक्रिय करें"
            >
              <span>🇮🇳</span>
              <span className="hidden sm:inline">हिंदी</span>
              <span className="sm:hidden text-[10px]">HI</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 sm:px-2 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                language === 'en' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-white/80 hover:text-white'
              }`}
              title="Switch to English"
            >
              <span className="hidden sm:inline">English</span>
              <span className="sm:hidden text-[10px]">EN</span>
            </button>
          </div>

          {/* Live Wallet Pill (Visible for Logged In User, Operator or Admin) */}
          {(isOperator || isCustomerUser) && (
            <div className="flex items-center bg-white/20 border border-white/30 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs shrink-0">
              <button
                type="button"
                onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
                className="px-2 sm:px-2.5 py-1 text-white font-bold text-xs flex items-center gap-1 hover:bg-white/10 transition cursor-pointer"
                title={isOperator ? t('b2b_wallet_title') : t('customer_wallet_title')}
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-mono font-black text-xs sm:text-sm text-white">
                  {isOperator ? `B2B: ₹${displayBalance}` : `₹${displayBalance}`}
                </span>
              </button>
              <button
                type="button"
                onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-1.5 sm:px-2 py-1 text-[11px] transition cursor-pointer flex items-center gap-0.5"
                title={t('add_funds')}
              >
                <span>+{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
              </button>
            </div>
          )}

          {/* Pending prints count alert (Operator mode) */}
          {isOperator && pendingPrintsCount > 0 && (
            <button
              type="button"
              onClick={() => onAdminTabChange && onAdminTabChange('prints')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2 py-1 rounded-xl text-xs flex items-center gap-1 shadow-sm transition animate-pulse cursor-pointer shrink-0"
              title={language === 'hi' ? `${pendingPrintsCount} नए प्रिंट आदेश लंबित हैं` : `${pendingPrintsCount} Pending Prints`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{pendingPrintsCount}</span>
            </button>
          )}

          {/* Day Mode / Night Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer shrink-0"
            title={theme === 'dark' ? t('day_mode_full') : t('night_mode_full')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-amber-200 shrink-0" />
            )}
          </button>

          {/* =============================================================== */}
          {/* DEDICATED PROMINENT LOGOUT BUTTONS (FOR ALL LOGGED IN ACCOUNTS) */}
          {/* =============================================================== */}
          
          {/* 1. SHOPKEEPER LOGOUT */}
          {isOperator && (
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition cursor-pointer border border-rose-400 shrink-0"
              title={language === 'hi' ? 'दुकानदार B2B काउंटर से बाहर निकलें (लॉगआउट)' : 'Exit Shopkeeper Counter (Logout)'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'hi' ? 'काउंटर लॉगआउट' : 'Exit Counter'}</span>
              <span className="xs:hidden">{language === 'hi' ? 'लॉगआउट' : 'Exit'}</span>
            </button>
          )}

          {/* 2. CUSTOMER USER LOGOUT */}
          {isCustomerUser && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenCustomerProfile}
                className="hidden sm:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-1 rounded-xl text-xs text-white font-bold transition cursor-pointer"
                title={language === 'hi' ? 'नागरिक प्रोफाइल' : 'Citizen Profile'}
              >
                <User className="w-3.5 h-3.5 text-cyan-300" />
                <span className="truncate max-w-[110px] font-bold">
                  {customerSession.name || customerSession.phone}
                </span>
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition cursor-pointer border border-rose-400 shrink-0"
                title={language === 'hi' ? 'नागरिक खाते से लॉगआउट करें' : 'Logout of Account'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            </div>
          )}

          {/* 3. SUPER ADMIN LOGOUT */}
          {mode === 'superadmin' && (
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-950/40 transition cursor-pointer border border-red-500 shrink-0"
              title={language === 'hi' ? 'सुपर एडमिन कंट्रोल रूम से लॉगआउट करें' : 'Logout from Root Admin'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'एडमिन लॉगआउट' : 'Admin Logout'}</span>
            </button>
          )}

          {/* 4. PUBLIC GUEST GATEWAY BUTTONS (DESKTOP) */}
          {!isOperator && !isCustomerUser && mode !== 'superadmin' && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {/* 1. 🏪 दुकानदार लॉगिन */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  else if (onModeToggle) onModeToggle('admin');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-950/20 transition cursor-pointer shrink-0"
                title={language === 'hi' ? 'दुकानदार B2B लॉगिन' : 'Shopkeeper Login'}
              >
                <span className="text-sm leading-none">🏪</span>
                <span>{t('shopkeeper')}</span>
              </button>

              {/* 2. 👑 एडमिन लॉगिन */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                  else if (onModeToggle) onModeToggle('superadmin');
                }}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-950/20 transition cursor-pointer shrink-0"
                title={language === 'hi' ? 'मास्टर सुपर एडमिन लॉगिन' : 'Super Admin Login'}
              >
                <Crown className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>{t('admin')}</span>
              </button>

              {/* 3. 👤 नागरिक लॉगिन / साइनअप */}
              <button
                type="button"
                onClick={onOpenCustomerProfile}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                title={language === 'hi' ? 'नागरिक लॉगिन / साइनअप' : 'Citizen Login / Sign Up'}
              >
                <User className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>{language === 'hi' ? 'नागरिक लॉगिन' : 'Citizen'}</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 2. MOBILE CLEAN SUB-BAR (DYNAMIC FOR EACH ROLE) */}
      
      {/* Case 1: Public Guest on Mobile */}
      {!isOperator && !isCustomerUser && mode !== 'superadmin' && (
        <div className="sm:hidden w-full bg-[#064e3b]/95 text-white border-t border-emerald-600/40 px-2 py-1.5 grid grid-cols-3 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
              else if (onModeToggle) onModeToggle('admin');
            }}
            className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-1.5 px-1 rounded-xl text-xs shadow-sm truncate active:scale-95 cursor-pointer min-w-0"
          >
            <span className="text-xs shrink-0">🏪</span>
            <span className="truncate">{t('shopkeeper')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
              else if (onModeToggle) onModeToggle('superadmin');
            }}
            className="flex items-center justify-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-1.5 px-1 rounded-xl text-xs shadow-sm truncate active:scale-95 cursor-pointer min-w-0"
          >
            <Crown className="w-3 h-3 text-slate-950 shrink-0" />
            <span className="truncate">{t('admin')}</span>
          </button>
          <button
            type="button"
            onClick={onOpenCustomerProfile}
            className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold py-1.5 px-1 rounded-xl text-xs shadow-sm truncate active:scale-95 cursor-pointer min-w-0"
          >
            <User className="w-3 h-3 text-emerald-200 shrink-0" />
            <span className="truncate">{language === 'hi' ? 'नागरिक लॉगिन' : 'Login'}</span>
          </button>
        </div>
      )}

      {/* Case 2: Registered Customer on Mobile */}
      {isCustomerUser && (
        <div className="sm:hidden w-full bg-[#0f172a]/95 text-white border-t border-indigo-500/40 px-3 py-1.5 flex items-center justify-between gap-2 shadow-inner">
          <div 
            onClick={onOpenCustomerProfile}
            className="text-xs font-black text-cyan-300 truncate flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
            <span className="truncate">
              {customerSession?.name ? `${customerSession.name}` : `+91 ${customerSession?.phone || ''}`}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
          </button>
        </div>
      )}

      {/* Case 3: Shopkeeper Operator on Mobile */}
      {isOperator && (
        <div className="sm:hidden w-full bg-[#022c22]/95 text-white border-t border-amber-400/40 px-3 py-1.5 flex items-center justify-between gap-2 shadow-inner">
          <div className="text-xs font-black text-amber-300 truncate flex items-center gap-1.5 min-w-0 flex-1">
            <span>🏪</span>
            <span className="truncate">
              {selectedCafe?.shopName || (language === 'hi' ? 'दुकानदार काउंटर' : 'Shopkeeper Desk')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'काउंटर से बाहर' : 'Exit'}</span>
          </button>
        </div>
      )}

    </header>
  );
}
