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
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-lg border-b-2 border-orange-500/80 no-print transition-all duration-200">
      
      {/* 1. Indian National Flag (Tiranga) Patriotic Top Ribbon */}
      <div className="h-1.5 w-full flex select-none no-print">
        <div className="flex-1 bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#ff9933]"></div>
        <div className="flex-1 bg-white border-x border-slate-200/50"></div>
        <div className="flex-1 bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#138808]"></div>
      </div>

      {/* 2. SINGLE UNIFIED MODERN NAVBAR */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-15 flex items-center justify-between gap-1.5 sm:gap-3 max-w-full">
        
        {/* Left: 3-Dot Side Toggle & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-xl transition cursor-pointer flex items-center gap-0.5 border border-white/30"
              title="साइड मेन्यू खोलें / छिपाएं (3-Dots Side Toggle)"
            >
              <MoreVertical className="w-5 h-5 text-white shrink-0" />
              <Menu className="w-4 h-4 text-amber-200 hidden xs:inline shrink-0" />
              <span className="text-[11px] font-black text-white hidden md:inline">मेन्यू</span>
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
              <div className="w-full h-full bg-orange-600 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-white text-xs sm:text-sm tracking-tight">
                  SC
                </span>
              </div>
            </div>
            <div className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              <h1 className="font-black text-white text-xs sm:text-base leading-tight tracking-tight truncate flex items-center gap-1">
                <span>Smart Cafe</span>
                <span className="bg-white text-orange-700 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                  B2B
                </span>
                {mode === 'admin' && (
                  <span className="hidden sm:inline bg-indigo-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    {isStaffAuth ? 'स्टाफ' : 'संचालक'}
                  </span>
                )}
                {mode === 'superadmin' && (
                  <span className="hidden sm:inline bg-amber-300 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                    SUPER ADMIN
                  </span>
                )}
              </h1>
              <p className="text-[9px] sm:text-[11px] text-amber-100 font-extrabold truncate">
                {selectedCafe?.shopName || 'स्मार्ट कैफे B2B पोर्टल • डिजिटल सेवा केंद्र'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Fast Tool Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-[190px] sm:max-w-xs lg:max-w-sm mx-1 sm:mx-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-amber-100 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              className="w-full bg-white/20 hover:bg-white/25 focus:bg-white text-white focus:text-slate-900 placeholder:text-amber-100 pl-7 pr-6 py-1.5 rounded-xl text-xs font-semibold border border-white/30 focus:border-white focus:outline-none transition shadow-2xs"
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
          <div className="flex items-center bg-white/20 border border-white/30 rounded-xl overflow-hidden shadow-2xs backdrop-blur-xs">
            <button
              type="button"
              onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
              className="px-2 sm:px-2.5 py-1.5 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer"
              title={isOperator ? "B2B वॉलेट देखें" : "डिजिटल वॉलेट देखें"}
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
              title="वॉलेट रिचार्ज करें"
            >
              <span>+ Add</span>
            </button>
          </div>

          {/* Day Mode / Night Mode Switcher (☀️/🌙) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-black px-2 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer shrink-0"
            title={theme === 'dark' ? 'दिन मोड में बदलें' : 'रात मोड में बदलें'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden md:inline text-amber-200">☀️ Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-200" />
                <span className="hidden md:inline text-white">🌙 Night</span>
              </>
            )}
          </button>

          {/* Role / Operator Gateway Actions (Desktop view - No horizontal clipping) */}
          {mode === 'customer' && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {/* 1. 🏪 दुकानदार लॉगिन */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  else if (onModeToggle) onModeToggle('admin');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-950/20 transition cursor-pointer shrink-0"
                title="साइबर कैफे दुकानदार व CSC VLE लॉगिन (Shopkeeper Login)"
              >
                <span className="text-sm leading-none">🏪</span>
                <span>दुकानदार</span>
              </button>

              {/* 2. 👑 एडमिन लॉगिन */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                  else if (onModeToggle) onModeToggle('superadmin');
                }}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-950/20 transition cursor-pointer shrink-0"
                title="मास्टर सुपर एडमिन लॉगिन (Super Admin Login)"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>एडमिन</span>
              </button>

              {/* 3. 👤 नागरिक प्रोफाइल */}
              <button
                type="button"
                onClick={onOpenCustomerProfile}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                title="नागरिक प्रोफ़ाइल व लॉगिन"
              >
                <User className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span className="hidden lg:inline truncate max-w-[90px]">
                  {customerSession?.phone ? (customerSession.name || customerSession.phone.slice(-4)) : 'नागरिक'}
                </span>
              </button>
            </div>
          )}

          {mode === 'admin' && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Operator Badge & Shop Indicator */}
              <div className="hidden md:flex items-center gap-1.5 bg-white/20 border border-white/30 px-2.5 py-1 rounded-xl text-xs text-white font-bold">
                <span>🏪</span>
                <span className="truncate max-w-[140px] font-black">{selectedCafe?.shopName || 'दुकानदार काउंटर'}</span>
                <span className="bg-white text-orange-700 text-[9px] font-black px-1.5 py-0.2 rounded">
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

      {/* 3. MOBILE UPFRONT GATEWAY BAR (100% Mobile Friendly, Login First, Never Cut Off, Saffron/Amber Theme) */}
      {mode === 'customer' && (
        <div className="sm:hidden w-full bg-orange-700/95 text-white border-t border-orange-500/60 px-2.5 py-1.5 flex items-center justify-between gap-1.5 shadow-inner">
          <span className="text-[10px] font-black text-amber-200 uppercase tracking-tight flex items-center gap-1 shrink-0 pl-1">
            <span>⚡ प्रवेश द्वार:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                else if (onModeToggle) onModeToggle('admin');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
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
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 cursor-pointer"
              title="मास्टर सुपर एडमिन लॉगिन (Super Admin Login)"
            >
              <Crown className="w-3 h-3 text-slate-950" />
              <span>एडमिन</span>
            </button>
            <button
              type="button"
              onClick={onOpenCustomerProfile}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold px-2 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
              title="नागरिक प्रोफ़ाइल"
            >
              <User className="w-3 h-3 text-amber-200" />
              <span>नागरिक</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
