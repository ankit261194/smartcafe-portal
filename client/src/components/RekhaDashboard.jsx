import React from 'react';
import { 
  Car, CreditCard, ShieldCheck, Award, FileText, Zap, Sparkles, 
  Printer, ArrowRight, Wallet, History, Users, Clock, CheckCircle2, 
  ExternalLink, Layers, Crop, ChevronRight, User
} from 'lucide-react';

export const REKHA_CATEGORIES_CONFIG = [
  {
    id: 'vehicle',
    title: 'वाहन व RTO सेवाएं',
    englishTitle: 'Vehicle & RTO Smart Services',
    icon: Car,
    color: 'from-blue-600 via-indigo-600 to-blue-700',
    lightBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-900/60',
    accentText: 'text-blue-600 dark:text-blue-400',
    wholesaleBadge: 'थोक: ₹10 - ₹200',
    retailBadge: 'खुदरा: ₹20 - ₹250',
    defaultToolId: 'rc',
    services: [
      { id: 'rc', label: 'RC स्मार्ट कार्ड (CR-80)', desc: 'Parivahan RC to PVC / PDF' },
      { id: 'dl', label: 'DL स्मार्ट कार्ड (Sarathi)', desc: 'Driving Licence CR-80 PVC' },
      { id: 'challan', label: 'ई-चालान जांच एवं रसीद', desc: 'MoRTH Official Challan Slip' }
    ]
  },
  {
    id: 'pan',
    title: 'पैन कार्ड सेवाएं',
    englishTitle: 'PAN Card PVC & Digital Suite',
    icon: CreditCard,
    color: 'from-teal-600 via-emerald-600 to-teal-700',
    lightBg: 'bg-teal-50/70 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-900/60',
    accentText: 'text-teal-600 dark:text-teal-400',
    wholesaleBadge: 'थोक: ₹10 - ₹15',
    retailBadge: 'खुदरा: ₹25 - ₹30',
    defaultToolId: 'pan',
    services: [
      { id: 'pan', label: 'CR-80 PVC पैन कार्ड', desc: 'NSDL / UTI Verified Layout' },
      { id: 'epan', label: 'ई-पैन कार्ड डिजिटल डाउनलोड', desc: 'Instant e-PAN Letter Slip' }
    ]
  },
  {
    id: 'aadhaar',
    title: 'आधार कार्ड सेवाएं',
    englishTitle: 'Aadhaar Smart Card Suite',
    icon: ShieldCheck,
    color: 'from-rose-600 via-red-600 to-rose-700',
    lightBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-900/60',
    accentText: 'text-rose-600 dark:text-rose-400',
    wholesaleBadge: 'थोक: ₹15',
    retailBadge: 'खुदरा: ₹30',
    defaultToolId: 'aadhaar',
    services: [
      { id: 'aadhaar', label: 'एडवांस CR-80 PVC आधार कार्ड', desc: 'UIDAI ISO Dimensions with QR' }
    ]
  },
  {
    id: 'voter',
    title: 'वोटर कार्ड सेवाएं',
    englishTitle: 'Voter ID EPIC Smart Card Suite',
    icon: Award,
    color: 'from-amber-600 via-orange-600 to-amber-700',
    lightBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-900/60',
    accentText: 'text-amber-600 dark:text-amber-400',
    wholesaleBadge: 'थोक: ₹15',
    retailBadge: 'खुदरा: ₹30',
    defaultToolId: 'voter',
    services: [
      { id: 'voter', label: 'डिजिटल वोटर स्मार्ट कार्ड', desc: 'Election Commission EPIC Layout' }
    ]
  },
  {
    id: 'welfare',
    title: 'राशन व आयुष्मान सेवाएं',
    englishTitle: 'Food & Health Welfare Suite',
    icon: Sparkles,
    color: 'from-emerald-600 via-green-600 to-emerald-700',
    lightBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-900/60',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    wholesaleBadge: 'थोक: ₹10 - ₹15',
    retailBadge: 'खुदरा: ₹25 - ₹30',
    defaultToolId: 'ayushman',
    services: [
      { id: 'ayushman', label: 'PM-JAY गोल्डन कार्ड', desc: '₹5 लाख मुफ़्त उपचार गारंटी कार्ड' },
      { id: 'ration', label: 'NFSA राशन पर्ची', desc: 'कोटेदार वितरण पात्रता पर्चा' }
    ]
  },
  {
    id: 'utility',
    title: 'बिल व रसीद सेवाएं',
    englishTitle: 'Discom Electricity & Cash Receipts',
    icon: Zap,
    color: 'from-cyan-600 via-blue-600 to-cyan-700',
    lightBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-900/60',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    wholesaleBadge: 'थोक: ₹5 - ₹10',
    retailBadge: 'खुदरा: ₹15 - ₹20',
    defaultToolId: 'electricity',
    services: [
      { id: 'electricity', label: 'बिजली बिल भुगतान रसीद', desc: 'UPPCL / State Discom Consumer Bill' },
      { id: 'receipt', label: 'साइबर कैफे बिल / कैश रसीद', desc: 'Instant Official Counter Tax Slip' }
    ]
  },
  {
    id: 'edistrict',
    title: 'e-District सेवाएं',
    englishTitle: 'Revenue Council e-District Suite',
    icon: FileText,
    color: 'from-violet-600 via-purple-600 to-violet-700',
    lightBg: 'bg-violet-50/70 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-900/60',
    accentText: 'text-violet-600 dark:text-violet-400',
    wholesaleBadge: 'थोक: ₹15',
    retailBadge: 'खुदरा: ₹30',
    defaultToolId: 'edistrict',
    services: [
      { id: 'edistrict', label: 'आय/जाति/निवास सत्यापन पर्ची', desc: 'तहसीलदार डिजिटल सत्यापन प्रमाण पत्र' }
    ]
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
  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* 1. TIER-1 COMMERCIAL B2B SAAS HERO BANNER (HIGH CONVERTING & CLEAN) */}
      {/* =================================================================== */}
      <div className="bg-white/95 dark:bg-[#0c162c]/95 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden transition-all">
        
        {/* Tricolor Ribbon on Top of Card */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10">
          <div className="flex-1 bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#ff9933]"></div>
          <div className="flex-1 bg-white border-x border-slate-200/80"></div>
          <div className="flex-1 bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#138808]"></div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
          
          {/* Left: Brand Identity & Value Proposition */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-emerald-500/15 dark:from-orange-950/50 dark:to-emerald-950/50 border border-orange-400/40 dark:border-orange-700/60 px-3 py-1 rounded-full text-xs font-black text-orange-700 dark:text-orange-300 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span>Smart Cafe B2B • डिजिटल सेवा केंद्र पोर्टल</span>
              </span>

              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>सर्वर स्थिति: 100% लाइव (110ms)</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {isOperator ? (selectedCafe?.shopName || 'स्मार्ट कैफे B2B ऑपरेटर डेस्क') : '1-क्लिक CR-80 PVC स्मार्ट कार्ड एवं सरकारी सेवाएं'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
              {isOperator ? (
                <span>
                  🏪 <strong>VLE संचालक काउंटर:</strong> नीचे दी गई किसी भी श्रेणी से 1-क्लिक में आधिकारिक CR-80 PVC स्मार्ट कार्ड व सरकारी रसीद जनरेट करें। थोक मार्जिन आपके B2B वॉलेट में स्वतः क्रेडिट होगा।
                </span>
              ) : (
                <span>
                  वाहन RC (Parivahan), एडवांस PVC आधार, NSDL पैन कार्ड, डिजिटल वोटर आईडी व आय-जाति सत्यापन पर्ची — <strong>मात्र 0.2 सेकंड में HD ओरिजिनल कलर्स के साथ प्रिंट तैयार!</strong>
                </span>
              )}
            </p>

            {/* Live Financial & Performance Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-400 block">स्पीड</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">⚡ 0.2s इंस्टेंट</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-400 block">थोक बचत</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">💰 ₹15-₹50 मार्जिन</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-400 block">फॉर्मेट</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">🖨️ CR-80 PVC</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-400 block">सुरक्षा</span>
                <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">🔒 24h श्रेडर</span>
              </div>
            </div>

            {/* Non-Operator Upfront Action Buttons (High Converting & Sleek) */}
            {!isOperator && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                    else if (onNavigateTab) onNavigateTab('operator');
                  }}
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-700/25 transition cursor-pointer"
                  title="साइबर कैफे दुकानदार व CSC VLE लॉगिन"
                >
                  <span className="text-base leading-none">🏪</span>
                  <span>दुकानदार B2B लॉगिन ➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                  }}
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
                  title="मास्टर सुपर एडमिन कंट्रोल रूम लॉगिन"
                >
                  <span className="text-base leading-none">👑</span>
                  <span>मास्टर एडमिन लॉगिन ➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCustomerProfile) onOpenCustomerProfile();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-yellow-300 border border-slate-300 dark:border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="नागरिक प्रोफ़ाइल व लॉगिन"
                >
                  <User className="w-3.5 h-3.5 text-yellow-500" />
                  <span>नागरिक प्रोफ़ाइल</span>
                </button>
              </div>
            )}

          </div>

          {/* Right: Live Wallet Card & Instant Reprint Strip */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 lg:min-w-[220px]">
            
            {/* Live Wallet Pill */}
            <div className="bg-gradient-to-br from-slate-50 to-orange-50/40 dark:from-slate-800/90 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                  {isOperator ? 'संचालक B2B वॉलेट' : 'वॉलेट बैलेंस'}
                </span>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-0.5 mt-0.5">
                  <span className="text-amber-500">₹</span>
                  <span>{displayBalance}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                + रिचार्ज
              </button>
            </div>

            {/* Reprint History Action */}
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold p-3 rounded-2xl text-xs flex items-center justify-between gap-2 transition shadow-sm cursor-pointer"
              title="निःशुल्क रिप्रिंट हिस्ट्री"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-black">निःशुल्क रिप्रिंट हिस्ट्री</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

          </div>

        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. REKHA PRINT STYLE CATEGORY BOXES GRID (7 CORE SUITES) */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>सेवा श्रेणियां (Select Service Category)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              किसी भी सेवा पर क्लिक करें — नया स्वच्छ पृष्ठ खुलेगा जहाँ आप कार्ड जनरेट व 1-क्लिक प्रिंट कर सकेंगे।
            </p>
          </div>
        </div>

        {/* 7 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full max-w-full">
          {REKHA_CATEGORIES_CONFIG.map((cat) => {
            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                className={`bg-white dark:bg-[#0c162c] rounded-3xl p-5 border ${cat.borderColor} hover:border-orange-500 dark:hover:border-orange-500 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Top Header of Category Box */}
                <div className="space-y-3.5">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-105 transition shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40 px-2 py-0.5 rounded-md">
                        {isOperator ? cat.wholesaleBadge : cat.retailBadge}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                      {cat.englishTitle}
                    </p>
                  </div>

                  {/* Interactive Sub-service Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 block">
                      उपलब्ध टूल्स:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.services.map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTool(srv.id);
                          }}
                          className="bg-slate-100 hover:bg-orange-50 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 hover:border-orange-400 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-orange-600 px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title={srv.desc}
                        >
                          <span>{srv.label}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom 1-Click Launch Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSelectTool(cat.defaultToolId)}
                    className="w-full bg-slate-50 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white text-slate-700 dark:bg-slate-800/60 dark:text-slate-200 font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer shadow-2xs group-hover:shadow-md"
                  >
                    <span>⚡ सेवा शुरू करें</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. RECENT ORDERS & FREE REPRINT STRIP */}
      {/* =================================================================== */}
      <div className="bg-white dark:bg-[#0c162c] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-2xl">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                हालिया प्रिंट एवं दस्तावेज़ (Recent Print History)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                पहले जनरेट किए गए सभी कार्ड व PDF कभी भी <strong className="text-emerald-600 dark:text-emerald-400">1-क्लिक में निःशुल्क रिप्रिंट</strong> करें।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
          >
            <span>सभी ऑर्डर्स देखें ➔</span>
          </button>
        </div>

        {orderHistory.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs space-y-1.5">
            <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
            <p>वर्तमान में कोई हालिया प्रिंट नहीं है। ऊपर दी गई किसी भी श्रेणी से कार्ड जनरेट करें।</p>
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
                    {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                  </span>
                  <strong className="text-xs text-slate-900 dark:text-white font-bold block truncate">
                    {item.docTitle || item.serviceTitle || 'डिजिटल सेवा'}
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
                  <span>रिप्रिंट</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. UTILITY SUITE (Print, Resizer, PDF) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div
          onClick={() => onNavigateTab('print')}
          className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-5 rounded-3xl shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-white">क्विक प्रिंट व ज़ेरॉक्स (A4 Xerox)</h4>
            <p className="text-xs text-blue-200 mt-1">
              फ़ाइल अपलोड करें, B&W या कलर चुनें और काउंटर से तत्काल प्रिंट निकालें।
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-white/20 text-xs font-bold text-yellow-300 flex items-center justify-between">
            <span>प्रिंट शुरू करें</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('resizer')}
          className="bg-gradient-to-br from-purple-900 to-slate-900 text-white p-5 rounded-3xl shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-3">
              <Crop className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-white">फ़ोटो व सिग्नेचर रिसाइज़र</h4>
            <p className="text-xs text-purple-200 mt-1">
              सरकारी फॉर्म हेतु फ़ोटो को 20KB-50KB व सिग्नेचर को 10KB-20KB में बदलें।
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-white/20 text-xs font-bold text-yellow-300 flex items-center justify-between">
            <span>रिसाइज़ टूल खोलें</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('pdf')}
          className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-5 rounded-3xl shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-white">PDF मर्जर व स्प्लिटर</h4>
            <p className="text-xs text-teal-200 mt-1">
              मार्कशीट, आधार व आय प्रमाण पत्र की कई PDF फाइलों को 1-क्लिक में जोड़ें।
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-white/20 text-xs font-bold text-yellow-300 flex items-center justify-between">
            <span>PDF टूल खोलें</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>

    </div>
  );
}
