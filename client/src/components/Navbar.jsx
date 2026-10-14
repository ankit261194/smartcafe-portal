import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Printer, FileText, Search, Settings, 
  IndianRupee, QrCode, ShieldCheck,
  Award, CreditCard, Sparkles, Building2, Wallet, Crown,
  Car, MessageSquare, Lock, User, LogOut, Menu, Sun, Moon, ArrowRight
} from 'lucide-react';
import { INSTANT_TOOLS } from './InstantToolsEngine';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORY_ICON_MAP } from './RekhaDashboard';

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
  onSelectTool,
  theme = 'light',
  toggleTheme = () => {},
  disabledTools = [],
  toolStatus = {}
}) {
  const { language, setLanguage, toggleLanguage, t, localize } = useLanguage();
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchedTools = useMemo(() => {
    if (!toolSearchQuery.trim()) return [];
    const q = toolSearchQuery.toLowerCase().trim();
    return INSTANT_TOOLS.filter(t => {
      const isHidden = (disabledTools && (disabledTools.includes(t.id) || disabledTools.includes(t.serviceType))) ||
        (toolStatus && (toolStatus[t.id] === false || toolStatus[t.serviceType] === false));
      if (isHidden) return false;
      const titleStr = typeof t.title === 'object' ? (t.title[language] || t.title.hi) : (t.title || '');
      const subStr = typeof t.subtitle === 'object' ? (t.subtitle[language] || t.subtitle.hi) : (t.subtitle || '');
      const badgeStr = typeof t.badge === 'object' ? (t.badge[language] || t.badge.hi) : (t.badge || '');
      return titleStr.toLowerCase().includes(q) ||
        subStr.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        badgeStr.toLowerCase().includes(q);
    });
  }, [toolSearchQuery, disabledTools, toolStatus, language]);

  const displayBalance = mode === 'admin' ? sanchalakB2bBalance : walletBalance;
  const isOperator = mode === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-white shadow-md border-b border-emerald-600/40 no-print transition-all duration-200">
      
      {/* SINGLE UNIFIED MODERN NAVBAR */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-15 flex items-center justify-between gap-1.5 sm:gap-3 max-w-full">
        
        {/* Left: Sleek Standard Menu Toggle (☰) & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 text-white hover:bg-white/15 active:scale-95 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-white/20"
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
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#064e3b] rounded-[14px] flex items-center justify-center">
                <span className="font-black text-white text-xs sm:text-sm tracking-tight">
                  SC
                </span>
              </div>
            </div>
            <div className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              <h1 className="font-black text-white text-xs sm:text-base leading-tight tracking-tight truncate flex items-center gap-1">
                <span>Smart Cafe</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                  B2B
                </span>
                {mode === 'admin' && (
                  <span className="hidden sm:inline bg-indigo-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    {isStaffAuth ? t('staff') : t('operator')}
                  </span>
                )}
                {mode === 'superadmin' && (
                  <span className="hidden sm:inline bg-amber-300 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    {t('root_admin')}
                  </span>
                )}
              </h1>
              <p className="text-[9px] sm:text-[11px] text-emerald-100 font-extrabold truncate">
                {selectedCafe?.shopName || t('brand_tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Fast Tool Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-[190px] sm:max-w-xs lg:max-w-sm mx-1 sm:mx-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-emerald-200 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={toolSearchQuery}
              onChange={(e) => {
                setToolSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matchedTools.length > 0) {
                  e.preventDefault();
                  if (onSelectTool) onSelectTool(matchedTools[0].id);
                  setIsSearchOpen(false);
                  setToolSearchQuery('');
                }
              }}
              placeholder={t('search_placeholder')}
              className="w-full bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder:text-emerald-100 pl-7 pr-6 py-1.5 rounded-xl text-xs font-semibold border border-white/20 focus:border-white focus:outline-none transition shadow-2xs"
            />
            {toolSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setToolSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && toolSearchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0f1d36] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {matchedTools.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                  {t('search_no_results')}
                </div>
              ) : (
                matchedTools.map(t => {
                  const IconComp = t?.icon || (CATEGORY_ICON_MAP && CATEGORY_ICON_MAP[t?.category]) || Sparkles;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (onSelectTool) onSelectTool(t.id);
                        setIsSearchOpen(false);
                        setToolSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${t.color || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center shrink-0`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{localize(t?.title || t?.name || 'सेवा')}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{localize(t?.subtitle || t?.desc || '')}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300/40 px-2 py-0.5 rounded-md shrink-0">
                        ₹{mode === 'admin' ? (t.wholesaleRate ?? 0) : (t.retailRate ?? 0)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right: Integrated Actions (Language, Wallet, Day/Night, Role Switch) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Dynamic Language Switcher (Hindi vs English - Pure Single Language Mode) */}
          <div className="flex items-center bg-white/15 border border-white/20 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                language === 'hi' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'text-white/80 hover:text-white'
              }`}
              title="हिंदी भाषा सक्रिय करें"
            >
              <span>🇮🇳</span>
              <span className="hidden sm:inline">हिंदी</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 ${
                language === 'en' 
                  ? 'bg-white text-emerald-900 shadow-xs' 
                  : 'text-white/80 hover:text-white'
              }`}
              title="Switch to English"
            >
              <span className="hidden sm:inline">English</span>
              <span className="sm:hidden">EN</span>
            </button>
          </div>

          {/* Live Wallet Pill with [+ Add Money] (Visible ONLY when logged in) */}
          {Boolean(customerSession?.phone || isCafeAuth || isOperator || isSuperAdminAuth || mode === 'admin') && (
            <div className="flex items-center bg-white/20 border border-white/30 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs">
              <button
                type="button"
                onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
                className="px-2 sm:px-2.5 py-1.5 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer"
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
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-2 py-1.5 text-[11px] transition cursor-pointer hidden xs:flex items-center gap-0.5"
                title={t('add_funds')}
              >
                <span>{t('add_money')}</span>
              </button>
            </div>
          )}

          {/* Day Mode / Night Mode Switcher (☀️/🌙) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-black px-2 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer shrink-0"
            title={theme === 'dark' ? t('day_mode_full') : t('night_mode_full')}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden md:inline text-amber-200">{t('day_mode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-200" />
                <span className="hidden md:inline text-white">{t('night_mode')}</span>
              </>
            )}
          </button>

          {/* Role / Operator Gateway Actions (Desktop view - No horizontal clipping) */}
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
                <button
                  type="button"
                  onClick={onLogout}
                  className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer shrink-0"
                  title={t('logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout')}</span>
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
              {/* Operator Badge & Shop Indicator */}
              <div className="hidden md:flex items-center gap-1.5 bg-white/20 border border-white/30 px-2.5 py-1 rounded-xl text-xs text-white font-bold">
                <span>🏪</span>
                <span className="truncate max-w-[140px] font-black">{selectedCafe?.shopName || (language === 'hi' ? 'दुकानदार काउंटर' : 'Shopkeeper Counter')}</span>
                <span className="bg-white text-emerald-900 text-[9px] font-black px-1.5 py-0.2 rounded">
                  {isStaffAuth ? t('staff') : t('operator')}
                </span>
              </div>

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

              {/* Prominent Red Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer shrink-0"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
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
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer shrink-0"
                title={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 3. MOBILE UPFRONT GATEWAY BAR (100% Mobile Friendly, Login First, Never Cut Off, Dark Emerald Theme) */}
      {mode === 'customer' && (
        customerSession?.phone ? (
          <div className="sm:hidden w-full bg-[#064e3b]/95 text-white border-t border-emerald-600/40 px-3 py-1.5 flex items-center justify-between gap-2 shadow-inner">
            <button
              type="button"
              onClick={onOpenCustomerProfile}
              className="text-xs font-black text-emerald-200 truncate flex items-center gap-1.5 min-w-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">{customerSession.name || (language === 'hi' ? 'ग्राहक' : 'Customer')} ({customerSession.phone})</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{t('logout')}</span>
            </button>
          </div>
        ) : (
          <div className="sm:hidden w-full bg-[#064e3b]/95 text-white border-t border-emerald-600/40 px-2.5 py-1.5 flex items-center justify-between gap-1.5 shadow-inner">
            <span className="text-[10px] font-black text-emerald-200 uppercase tracking-tight flex items-center gap-1 shrink-0 pl-1">
              <span>{t('quick_gateway')}</span>
            </span>
            <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  else if (onModeToggle) onModeToggle('admin');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
                title={language === 'hi' ? 'दुकानदार काउंटर लॉगिन' : 'Shopkeeper Login'}
              >
                <span className="text-xs">🏪</span>
                <span>{t('shopkeeper')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                  else if (onModeToggle) onModeToggle('superadmin');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
                title={language === 'hi' ? 'सुपर एडमिन लॉगिन' : 'Super Admin Login'}
              >
                <Crown className="w-3 h-3 text-slate-950" />
                <span>{t('admin')}</span>
              </button>
              <button
                type="button"
                onClick={onOpenCustomerProfile}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold px-2 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                title={language === 'hi' ? 'नागरिक लॉगिन / साइनअप' : 'Citizen Login / Sign Up'}
              >
                <User className="w-3 h-3 text-emerald-200" />
                <span>{language === 'hi' ? 'लॉगिन' : 'Login'}</span>
              </button>
            </div>
          </div>
        )
      )}

    </header>
  );
}
