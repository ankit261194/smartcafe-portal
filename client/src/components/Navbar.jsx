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

  const displayBalance = mode === 'admin' ? sanchalakB2bBalance : walletBalance;
  const isOperator = mode === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-white shadow-md border-b border-emerald-600/40 no-print transition-all duration-200">
      
      {/* 1. TOP MAIN NAVBAR ROW */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-14 sm:h-15 flex items-center justify-between gap-2 max-w-full">
        
        {/* Left: Sleek Standard Menu Toggle (☰) & Brand Logo */}
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 p-0.5 shadow-md shrink-0 border border-amber-300/40 overflow-hidden">
              <img 
                src="/images/smartcafe_navbar_icon.svg" 
                alt="Smart Cafe Official" 
                className="w-full h-full object-contain rounded-[14px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/smartcafe_navbar_icon.svg';
                }}
              />
            </div>
            <div className="min-w-0 truncate">
              <h1 className="font-black text-white text-xs sm:text-base leading-tight tracking-tight flex items-center gap-1 truncate">
                <span className="truncate">Smart Cafe</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs shrink-0">
                  B2B
                </span>
                {mode === 'admin' && (
                  <span className="hidden sm:inline bg-indigo-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs shrink-0">
                    {isStaffAuth ? t('staff') : t('operator')}
                  </span>
                )}
                {mode === 'superadmin' && (
                  <span className="hidden sm:inline bg-amber-300 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs shrink-0">
                    {t('root_admin')}
                  </span>
                )}
              </h1>
              <p className="text-[9px] sm:text-[11px] text-emerald-100 font-extrabold truncate hidden xs:block">
                {selectedCafe?.shopName || t('brand_tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Integrated Actions (Language, Wallet, Day/Night, Desktop Auth) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          
          {/* Dynamic Language Switcher (Responsive: HI/EN on mobile, Hindi/English on desktop) */}
          <div className="flex items-center bg-white/15 border border-white/20 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-1.5 sm:px-2 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                language === 'hi' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
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
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'text-white/80 hover:text-white'
              }`}
              title="Switch to English"
            >
              <span className="hidden sm:inline">English</span>
              <span className="sm:hidden text-[10px]">EN</span>
            </button>
          </div>

          {/* Live Wallet Pill (Always accessible for seamless 1-click add money) */}
          <div className="flex items-center bg-white/20 border border-white/30 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs shrink-0">
            <button
              type="button"
              onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
              className="px-2 sm:px-2.5 py-1.5 text-white font-bold text-xs flex items-center gap-1 hover:bg-white/10 transition cursor-pointer"
              title={isOperator ? t('b2b_wallet_title') : t('customer_wallet_title')}
            >
              <Wallet className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="font-mono font-black text-xs sm:text-sm text-white">
                {isOperator ? `B2B: ₹${displayBalance}` : `₹${displayBalance}`}
              </span>
            </button>
            <button
              type="button"
              onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-2 py-1.5 text-[11px] transition cursor-pointer flex items-center gap-0.5"
              title={t('add_funds')}
            >
              <span>{t('add_money')}</span>
            </button>
          </div>

          {/* Day Mode / Night Mode Switcher (☀️/🌙) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-black p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer shrink-0"
            title={theme === 'dark' ? t('day_mode_full') : t('night_mode_full')}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="hidden md:inline text-amber-200">{t('day_mode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="hidden md:inline text-white">{t('night_mode')}</span>
              </>
            )}
          </button>

          {/* Desktop User Gateway & Profile (Hidden on mobile < sm) */}
          {mode === 'customer' && (
            customerSession?.phone ? (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onOpenCustomerProfile}
                  className="bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-400/40 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  title={language === 'hi' ? 'नागरिक प्रोफ़ाइल' : 'Citizen Profile'}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300 animate-pulse"></span>
                  <span className="truncate max-w-[140px]">
                    {customerSession.name ? `${customerSession.name}` : (language === 'hi' ? 'ग्राहक' : 'Customer')} ({customerSession.phone})
                  </span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {/* 1. 🏪 दुकानदार लॉगिन */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                    else if (onModeToggle) onModeToggle('admin');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-950/20 transition cursor-pointer shrink-0"
                  title={language === 'hi' ? 'दुकानदार लॉगिन' : 'Shopkeeper Login'}
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
                  className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-950/20 transition cursor-pointer shrink-0"
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
                  <span>{language === 'hi' ? 'लॉगिन / साइनअप' : 'Login / Sign Up'}</span>
                </button>
              </div>
            )
          )}

          {mode === 'admin' && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Operator Badge & Shop Indicator (Click to open profile & change password) */}
              <button
                type="button"
                onClick={onOpenCustomerProfile}
                className="hidden md:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-1 rounded-xl text-xs text-white font-bold transition cursor-pointer"
                title={language === 'hi' ? 'ऑपरेटर प्रोफ़ाइल एवं पासवर्ड बदलें' : 'Operator Profile & Change Password'}
              >
                <span>🏪</span>
                <span className="truncate max-w-[140px] font-black">{selectedCafe?.shopName || (language === 'hi' ? 'दुकानदार काउंटर' : 'Shopkeeper Counter')}</span>
                <span className="bg-white text-emerald-900 text-[9px] font-black px-1.5 py-0.5 rounded">
                  {isStaffAuth ? t('staff') : t('operator')}
                </span>
              </button>

              {/* Pending prints count alert */}
              {pendingPrintsCount > 0 && (
                <button
                  type="button"
                  onClick={() => onAdminTabChange && onAdminTabChange('prints')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition animate-pulse cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{pendingPrintsCount}</span>
                </button>
              )}
            </div>
          )}

          {mode === 'superadmin' && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="bg-amber-500 text-slate-950 border border-amber-300 px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-black flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>{t('root_admin')}</span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95 border border-red-500"
                title="सुपर एडमिन लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 2. MOBILE CLEAN GATEWAY BAR (100% Responsive Grid, Zero Text Spilling) */}
      {mode === 'customer' && (
        customerSession?.phone ? (
          <div className="sm:hidden w-full bg-[#064e3b]/95 text-white border-t border-emerald-600/40 px-3 py-1.5 flex items-center justify-between gap-2 shadow-inner">
            <button
              type="button"
              onClick={onOpenCustomerProfile}
              className="text-xs font-black text-emerald-200 truncate flex items-center gap-1.5 min-w-0 flex-1 text-left"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate max-w-[200px]">
                {customerSession.name || (language === 'hi' ? 'ग्राहक' : 'Customer')} ({customerSession.phone})
              </span>
            </button>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मेन्यू' : 'Menu'}</span>
            </button>
          </div>
        ) : (
          <div className="sm:hidden w-full bg-[#064e3b]/95 text-white border-t border-emerald-600/40 px-2 py-1.5 grid grid-cols-3 gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                else if (onModeToggle) onModeToggle('admin');
              }}
              className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-1.5 px-1 rounded-xl text-xs shadow-sm truncate active:scale-95 cursor-pointer min-w-0"
              title={language === 'hi' ? 'दुकानदार काउंटर लॉगिन' : 'Shopkeeper Login'}
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
              title={language === 'hi' ? 'सुपर एडमिन लॉगिन' : 'Super Admin Login'}
            >
              <Crown className="w-3 h-3 text-slate-950 shrink-0" />
              <span className="truncate">{t('admin')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenCustomerProfile}
              className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold py-1.5 px-1 rounded-xl text-xs shadow-sm truncate active:scale-95 cursor-pointer min-w-0"
              title={language === 'hi' ? 'नागरिक लॉगिन / साइनअप' : 'Citizen Login / Sign Up'}
            >
              <User className="w-3 h-3 text-emerald-200 shrink-0" />
              <span className="truncate">{language === 'hi' ? 'लॉगिन' : 'Login'}</span>
            </button>
          </div>
        )
      )}

    </header>
  );
}
