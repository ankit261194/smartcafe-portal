import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Printer, FileText, Search, Settings, 
  IndianRupee, QrCode, ShieldCheck,
  Award, CreditCard, Sparkles, Building2, Wallet, Crown,
  Car, MessageSquare, Lock, User, LogOut, Menu, Sun, Moon, ArrowRight, MoreVertical
} from 'lucide-react';
import { INSTANT_TOOLS } from './InstantToolsEngine';

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
      return t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q);
    });
  }, [toolSearchQuery, disabledTools, toolStatus]);

  const displayBalance = mode === 'admin' ? sanchalakB2bBalance : walletBalance;
  const isOperator = mode === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1528]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs no-print transition-colors duration-200">
      
      {/* 1. Indian National Flag (Tiranga) Patriotic Top Ribbon */}
      <div className="h-1.5 w-full flex select-none no-print">
        <div className="flex-1 bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#ff9933]"></div>
        <div className="flex-1 bg-white dark:bg-slate-200 border-x border-slate-200/50"></div>
        <div className="flex-1 bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#138808]"></div>
      </div>

      {/* 2. SINGLE UNIFIED MODERN NAVBAR (NO DUPLICATE TOP MICRO-BAR) */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 max-w-full">
        
        {/* Left: 3-Dot Side Toggle & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 text-slate-800 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-0.5 border border-slate-200/80 dark:border-slate-800"
              title="साइड मेन्यू खोलें / छिपाएं (3-Dots Side Toggle)"
            >
              <MoreVertical className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
              <Menu className="w-4 h-4 text-slate-600 dark:text-slate-300 hidden xs:inline shrink-0" />
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 hidden md:inline">मेन्यू</span>
            </button>
          )}

          <div 
            onClick={() => {
              if (mode === 'customer') onCustomerTabChange('home');
              else if (mode === 'admin') onAdminTabChange('dashboard');
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-600 p-0.5 shadow-md shadow-orange-500/20 shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-600 text-xs sm:text-sm tracking-tight">
                  SC
                </span>
              </div>
            </div>
            <div className="truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
              <h1 className="font-black text-slate-900 dark:text-white text-xs sm:text-base leading-tight tracking-tight truncate flex items-center gap-1">
                <span>Smart Cafe</span>
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                  B2B
                </span>
                {mode === 'admin' && (
                  <span className="hidden sm:inline bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    {isStaffAuth ? 'स्टाफ' : 'संचालक'}
                  </span>
                )}
                {mode === 'superadmin' && (
                  <span className="hidden sm:inline bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    SUPER ADMIN
                  </span>
                )}
              </h1>
              <p className="text-[9px] sm:text-[11px] text-orange-600 dark:text-orange-400 font-extrabold truncate">
                {selectedCafe?.shopName || 'स्मार्ट कैफे B2B पोर्टल • डिजिटल सेवा केंद्र'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Fast Tool Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-[190px] sm:max-w-xs lg:max-w-sm mx-1 sm:mx-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              placeholder="1-क्लिक टूल खोजें (RC, पैन, DL, बिल)..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-7 pr-6 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none transition shadow-2xs"
            />
            {toolSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setToolSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
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
                  कोई टूल नहीं मिला।
                </div>
              ) : (
                matchedTools.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (onSelectTool) onSelectTool(t.id);
                      setIsSearchOpen(false);
                      setToolSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-orange-50/70 dark:hover:bg-slate-800/80 transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${t.color} text-white flex items-center justify-center shrink-0`}>
                        <t.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300/40 px-2 py-0.5 rounded-md shrink-0">
                      ₹{mode === 'admin' ? t.wholesaleRate : t.retailRate}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Integrated Actions (Wallet, Standee, Day/Night, Role Switch) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Live Wallet Pill with [+ Add Money] (Strictly Starts at ₹0) */}
          <div className="flex items-center bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-orange-500/10 dark:bg-slate-800/80 border border-emerald-300/80 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
              className="px-2.5 py-1.5 text-slate-900 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100/50 dark:hover:bg-slate-700/60 transition cursor-pointer"
              title={isOperator ? "B2B वॉलेट देखें" : "डिजिटल वॉलेट देखें"}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-mono font-black text-xs sm:text-sm">
                {isOperator ? `B2B: ₹${displayBalance}` : `₹${displayBalance}`}
              </span>
            </button>
            <button
              type="button"
              onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black px-2.5 py-1.5 text-[11px] transition cursor-pointer hidden xs:flex items-center gap-1"
              title="वॉलेट रिचार्ज करें"
            >
              <span>+ Add</span>
            </button>
          </div>

          {/* Standee QR Poster Button (Desktop & Tablet) */}
          {onOpenStandee && (
            <button
              type="button"
              onClick={onOpenStandee}
              className="hidden md:flex bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 font-bold px-2.5 py-1.5 rounded-xl text-xs items-center gap-1.5 transition shadow-2xs cursor-pointer"
              title="दुकान काउंटर पोस्टर देखें"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>पोस्टर</span>
            </button>
          )}

          {/* Day Mode / Night Mode Switcher (☀️/🌙) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-300 dark:border-slate-700 font-extrabold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer shrink-0"
            title={theme === 'dark' ? 'दिन मोड में बदलें (Day Mode)' : 'रात मोड में बदलें (Night Mode)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline font-black text-amber-300">☀️ Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline font-black text-slate-700">🌙 Night</span>
              </>
            )}
          </button>

          {/* Role / Operator Gateway Actions (Desktop view) */}
          {mode === 'customer' && (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* 1. 🏪 दुकानदार लॉगिन (Shopkeeper Login - Emerald/Indigo Button) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  else if (onModeToggle) onModeToggle('admin');
                }}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black px-2 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-700/25 transition cursor-pointer shrink-0"
                title="साइबर कैफे दुकानदार व CSC VLE लॉगिन (Shopkeeper Login)"
              >
                <span className="text-sm leading-none">🏪</span>
                <span className="hidden xs:inline">दुकानदार लॉगिन</span>
                <span className="xs:hidden">दुकानदार</span>
              </button>

              {/* 2. 👑 एडमिन लॉगिन (Super Admin Login - Amber/Slate Button) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                  else if (onModeToggle) onModeToggle('superadmin');
                }}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black px-2 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-500/25 transition cursor-pointer shrink-0"
                title="मास्टर सुपर एडमिन लॉगिन (Super Admin Login)"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span className="hidden xs:inline">एडमिन लॉगिन</span>
                <span className="xs:hidden">एडमिन</span>
              </button>

              {/* 3. 👤 नागरिक लॉगिन / प्रोफ़ाइल (Citizen Login - Clean Pill) */}
              <button
                type="button"
                onClick={onOpenCustomerProfile}
                className="bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 px-2 sm:px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                title="नागरिक प्रोफ़ाइल व लॉगिन"
              >
                <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {customerSession?.phone ? (customerSession.name || customerSession.phone.slice(-4)) : 'नागरिक लॉगिन'}
                </span>
                <span className="sm:hidden">नागरिक</span>
              </button>

              {/* VLE ₹299 KYC Registration link */}
              {onOpenKyc && (
                <button
                  type="button"
                  onClick={onOpenKyc}
                  className="hidden xl:flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition shadow-xs cursor-pointer shrink-0"
                  title="नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)"
                >
                  <Award className="w-3.5 h-3.5 text-yellow-300" />
                  <span>नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)</span>
                </button>
              )}
            </div>
          )}

          {mode === 'admin' && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Operator Badge & Shop Indicator */}
              <div className="hidden md:flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                <span>🏪</span>
                <span className="truncate max-w-[140px] font-black">{selectedCafe?.shopName || 'दुकानदार काउंटर'}</span>
                <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                  {isStaffAuth ? 'स्टाफ' : 'संचालक'}
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
                title="काउंटर सुरक्षित लॉक करें और बाहर निकलें"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </div>
          )}

          {mode === 'superadmin' && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="bg-amber-500 text-slate-950 border border-amber-300 px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-black flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>ROOT ADMIN</span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer shrink-0"
                title="सुपर एडमिन कंसोल से बाहर निकलें"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 3. MOBILE UPFRONT GATEWAY BAR (100% Mobile Friendly, Login First, Never Cut Off) */}
      {mode === 'customer' && (
        <div className="sm:hidden w-full bg-slate-900/95 dark:bg-[#070e1b]/95 border-t border-slate-800/80 px-2.5 py-2 flex items-center justify-between gap-1.5 shadow-inner">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-tight flex items-center gap-1 shrink-0 pl-1">
            <span>⚡ प्रवेश द्वार:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                else if (onModeToggle) onModeToggle('admin');
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
              title="दुकानदार B2B काउंटर लॉगिन (Shopkeeper Login)"
            >
              <span className="text-xs">🏪</span>
              <span>दुकानदार</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                else if (onModeToggle) onModeToggle('superadmin');
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
              title="मास्टर सुपर एडमिन लॉगिन (Super Admin Login)"
            >
              <Crown className="w-3 h-3 text-slate-950" />
              <span>एडमिन</span>
            </button>
            <button
              type="button"
              onClick={onOpenCustomerProfile}
              className="bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 font-bold px-2 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
              title="नागरिक प्रोफ़ाइल"
            >
              <User className="w-3 h-3 text-yellow-400" />
              <span>नागरिक</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
