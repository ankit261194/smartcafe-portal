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
      {/* 1. COMPACT SLIM TICKER STRIP (REKHA PRINT STYLE — ZERO SCREEN BLOAT) */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 dark:bg-slate-900/90 border border-orange-300/80 dark:border-slate-800 rounded-2xl px-3.5 py-2 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: 1-Line Live Ticker Announcement */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="p-1 bg-orange-600 text-white rounded-lg shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </span>
          <div className="text-xs text-slate-800 dark:text-slate-200 truncate font-semibold">
            <span className="text-orange-700 dark:text-orange-400 font-black mr-1">📢 लाइव:</span>
            <span>वाहन RC, एडवांस CR-80 PVC आधार, पैन कार्ड व आय-जाति प्रमाण पत्र — <strong className="text-emerald-700 dark:text-emerald-400">0.2s स्पीड में HD प्रिंट तैयार!</strong> (थोक मार्जिन: ₹15-₹50)</span>
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
                title="दुकानदार B2B लॉगिन"
              >
                <span>🏪 दुकानदार B2B ➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                }}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                title="मास्टर एडमिन लॉगिन"
              >
                <span>👑 एडमिन ➔</span>
              </button>
            </>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>🏪 {selectedCafe?.shopName || 'B2B काउंटर'}</span>
              <span className="font-mono font-black text-amber-600">₹{displayBalance}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
            title="निःशुल्क रिप्रिंट हिस्ट्री"
          >
            <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">रिप्रिंट</span>
          </button>
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
