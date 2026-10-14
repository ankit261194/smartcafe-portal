import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, CreditCard, ShieldCheck, Award, FileText, Zap, Sparkles, 
  Printer, ArrowRight, Wallet, History, Search, X, CheckCircle2, 
  Layers, Lock, AlertCircle, RefreshCw, ChevronRight, ChevronLeft, 
  User, ExternalLink, Smartphone, Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getMergedServicesCatalog, SERVICE_CATEGORIES } from '../data/servicesCatalog';

// Map category IDs to rich Lucide icons
const CATEGORY_ICON_MAP = {
  aadhaar: ShieldCheck,
  pan: CreditCard,
  rc: Car,
  dl: Award,
  voter: Award,
  ration: FileText,
  health: ShieldCheck,
  welfare: Layers,
  utility: Zap,
  banking: Zap,
  agriculture: FileText,
  lookup: Search,
  telecom: Smartphone,
  all: Sparkles
};

export default function RekhaDashboard({
  onSelectTool,
  onNavigateTab,
  selectedCafe,
  walletBalance = 0,
  sanchalakB2bBalance = 0,
  isOperator = false,
  isSuperAdminAuth = false,
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
  theme = 'light',
  services79Rates = []
}) {
  const { language, t, localize } = useLanguage();
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  // 1. Dynamic Merged Catalog (Enriched 79 P4Points Services)
  const fullCatalog = useMemo(() => {
    return getMergedServicesCatalog(services79Rates);
  }, [services79Rates]);

  // 2. Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    SERVICE_CATEGORIES.forEach(cat => {
      counts[cat.id] = fullCatalog.filter(s => s.group === cat.id).length;
    });
    return counts;
  }, [fullCatalog]);

  // 3. Graphical Promotional Banners (Clean, Visual, High-Impact)
  const promoSlides = useMemo(() => [
    {
      badge: language === 'hi' ? '🇮🇳 राष्ट्रीय जन सेवा हब' : '🇮🇳 National Service Hub',
      title: language === 'hi' 
        ? 'आधार, पैन व डिजिटल पहचान सेवाएं — 1-क्लिक HD स्मार्ट कार्ड' 
        : 'Aadhaar, PAN & Digital Identity — 1-Click HD Smart Cards',
      sub: language === 'hi'
        ? 'बायोमेट्रिक आधार एडवांस, ई-पैन PDF व CR-80 PVC कार्ड ओरिजिनल लेआउट में तैयार।'
        : 'Biometric Aadhaar advance, e-PAN PDF & CR-80 PVC cards in original layout.',
      chips: language === 'hi' 
        ? ['🪪 आधार PVC', '💳 इंस्टेंट पैन', '🗳️ वोटर कार्ड', '0.5s जनरेशन'] 
        : ['🪪 Aadhaar PVC', '💳 Instant PAN', '🗳️ Voter Card', '0.5s Fast'],
      color: 'from-orange-600 via-amber-600 to-orange-700',
      accent: 'border-orange-300'
    },
    {
      badge: language === 'hi' ? '🚗 MoRTH परिवहन सेवाएं' : '🚗 MoRTH Transport Desk',
      title: language === 'hi'
        ? 'गाड़ी नंबर से वाहन RC टू PDF व ड्राइविंग लाइसेंस स्मार्ट कार्ड'
        : 'Vehicle RC to PDF & Driving Licence Smart Card from Reg No',
      sub: language === 'hi'
        ? 'परिवहन सेवा अधिकृत डिजिटल प्रतिलिपि, फिटनेस व ई-चालान जांच तुरंत उपलब्ध।'
        : 'Official Parivahan RC copy, fitness & traffic challan lookup in seconds.',
      chips: language === 'hi' 
        ? ['🚗 वाहन RC स्लिप', '🪪 ड्राइविंग लाइसेंस', '📄 ई-चालान जांच'] 
        : ['🚗 Vehicle RC', '🪪 Driving Licence', '📄 e-Challan'],
      color: 'from-emerald-600 via-teal-600 to-emerald-700',
      accent: 'border-emerald-300'
    },
    {
      badge: language === 'hi' ? '🌾 राशन, समग्र व आयुष्मान' : '🌾 Ration, Samagra & PM-JAY',
      title: language === 'hi'
        ? 'आयुष्मान भारत PM-JAY गोल्डन कार्ड व NFSA राशन पर्चा'
        : 'Ayushman Bharat PM-JAY Golden Card & NFSA Ration Slips',
      sub: language === 'hi'
        ? 'मध्य प्रदेश समग्र आईडी, बिहार RTPS प्रमाण पत्र व राज्य कल्याणकारी सेवाएं लाइव।'
        : 'MP Samagra ID, Bihar RTPS certificates & State Welfare services live.',
      chips: language === 'hi' 
        ? ['🏥 आयुष्मान कार्ड', '🌾 राशन पर्ची', '👨‍👩‍👧 समग्र ID', '⚡ बिजली बिल'] 
        : ['🏥 Golden Card', '🌾 Ration Slip', '👨‍👩‍👧 Samagra ID', '⚡ Power Bill'],
      color: 'from-blue-600 via-indigo-600 to-blue-700',
      accent: 'border-blue-300'
    },
    {
      badge: language === 'hi' ? '🏪 थोक B2B VLE काउंटर' : '🏪 Wholesale B2B VLE Desk',
      title: language === 'hi'
        ? 'दुकानदारों के लिए विशेष थोक दरें — प्रति ऑर्डर सीधा कमीशन'
        : 'Exclusive Wholesale Rates for Shopkeepers — Direct Net Margins',
      sub: language === 'hi'
        ? 'B2B वॉलेट से ऑटो-कटौती, स्वचालित दैनिक कैशबुक व ग्राहक प्रिंट कतार प्रबंधन।'
        : 'Auto B2B debit, automated cashbook profit tracking & live customer print queue.',
      chips: language === 'hi' 
        ? ['💰 थोक दरें', '📘 ऑटो कैशबुक', '🖨️ साइलेंट प्रिंट', '📱 WhatsApp सूचना'] 
        : ['💰 Wholesale Rates', '📘 Auto Cashbook', '🖨️ Silent Print', '📱 WhatsApp Notify'],
      color: 'from-purple-600 via-violet-600 to-purple-800',
      accent: 'border-purple-300'
    }
  ], [language]);

  // Auto rotate carousel slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  // 4. Services inside Modal Category
  const modalCategoryServices = useMemo(() => {
    if (!selectedCategoryModal) return [];
    let list = fullCatalog.filter(s => s.group === selectedCategoryModal.id);
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase().trim();
      list = list.filter(s => {
        const nameMatch = s.name && s.name.toLowerCase().includes(q);
        const titleHi = s.title?.hi && s.title.hi.toLowerCase().includes(q);
        const titleEn = s.title?.en && s.title.en.toLowerCase().includes(q);
        return nameMatch || titleHi || titleEn;
      });
    }
    return list;
  }, [fullCatalog, selectedCategoryModal, modalSearch]);

  const isUserLoggedIn = Boolean(customerSession?.phone || isOperator || isSuperAdminAuth);
  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  // Handle service click (Compulsory Login Gate)
  const handleServiceClick = (serviceId) => {
    setSelectedCategoryModal(null);
    if (!isUserLoggedIn) {
      if (onOpenCustomerLogin) {
        onOpenCustomerLogin(serviceId);
      }
      return;
    }
    if (onSelectTool) {
      onSelectTool(serviceId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* =================================================================== */}
      {/* 1. TOP ANNOUNCEMENT & ROLE ACCESS BAR */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 dark:bg-slate-900/90 border border-orange-300/80 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Live Ticker Announcement */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="p-1.5 bg-gradient-to-tr from-orange-600 to-amber-600 text-white rounded-xl shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <div className="text-xs text-slate-800 dark:text-slate-200 truncate font-semibold">
            <span className="text-orange-700 dark:text-orange-400 font-black mr-1">
              {language === 'hi' ? '📢 लाइव सेवा हब:' : '📢 Live Hub:'}
            </span>
            <span>
              {language === 'hi' 
                ? isOperator 
                  ? '79+ B2B थोक सेवाएं लाइव! आधार, RC, पैन, वोटर व राशन — थोक रेट्स व सीधा कमीशन एक्टिव।'
                  : '79+ सरकारी व डिजिटल सेवाएं उपलब्ध! आधार, RC, पैन, वोटर व राशन पर्ची — 1-क्लिक डाउनलोड।'
                : isOperator
                  ? '79+ B2B Wholesale Services Live! Instant wholesale profit margins active.'
                  : '79+ Official Citizen Services Available! Instant 1-Click Delivery.'
              }
            </span>
          </div>
        </div>

        {/* Right: Balance Pill & Role Gate Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          
          {/* Live Wallet Pill (HIDDEN FOR GUESTS, VISIBLE ONLY WHEN LOGGED IN) */}
          {isUserLoggedIn && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Wallet className="w-3.5 h-3.5 text-amber-500" />
              <span>{isOperator ? (language === 'hi' ? 'B2B बैलेंस:' : 'B2B Balance:') : (language === 'hi' ? 'वॉलेट:' : 'Wallet:')}</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">₹{displayBalance}</span>
              <button
                type="button"
                onClick={isOperator ? onOpenB2bWallet : onOpenWallet}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-lg font-black transition cursor-pointer"
              >
                + {language === 'hi' ? 'जोड़ें' : 'Add'}
              </button>
            </div>
          )}

          {!isOperator ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onOpenShopkeeperLogin) onOpenShopkeeperLogin();
                  else if (onNavigateTab) onNavigateTab('operator');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                title={language === 'hi' ? 'दुकानदार B2B लॉगिन' : 'Shopkeeper B2B Login'}
              >
                <span>{language === 'hi' ? '🏪 दुकानदार B2B ➔' : '🏪 Shopkeeper B2B ➔'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenSuperAdminLogin) onOpenSuperAdminLogin();
                }}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                title={language === 'hi' ? 'मास्टर एडमिन लॉगिन' : 'Master Admin Login'}
              >
                <span>{language === 'hi' ? '👑 एडमिन ➔' : '👑 Admin ➔'}</span>
              </button>
            </>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl px-2.5 py-1 text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <span>🏪 {selectedCafe?.shopName || (language === 'hi' ? 'VLE काउंटर' : 'VLE Counter')}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
            title={language === 'hi' ? 'ऑर्डर हिस्ट्री व रिप्रिंट' : 'Order History & Reprint'}
          >
            <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">{language === 'hi' ? 'रिप्रिंट हिस्ट्री' : 'Reprint'}</span>
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. GRAPHICAL PROMOTIONAL BANNER SLIDER */}
      {/* =================================================================== */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 text-white">
        
        {/* Tricolor Accent Top Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
          <div className="flex-1 bg-[#f97316]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#16a34a]"></div>
        </div>

        {/* Slide Visual Content */}
        <div className={`p-4 sm:p-6 bg-gradient-to-r ${promoSlides[activeSlide].color} transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-black/25 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/25">
                {promoSlides[activeSlide].badge}
              </span>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                79 LIVE SERVICES ⚡
              </span>
            </div>
            
            <h2 className="text-base sm:text-lg lg:text-xl font-black leading-snug drop-shadow-xs">
              {promoSlides[activeSlide].title}
            </h2>
            
            <p className="text-xs sm:text-sm text-white/90 line-clamp-2 max-w-2xl font-medium">
              {promoSlides[activeSlide].sub}
            </p>

            {/* Feature Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {promoSlides[activeSlide].chips.map((chip, i) => (
                <span 
                  key={i} 
                  className="text-[11px] font-bold bg-white/15 backdrop-blur-xs border border-white/20 px-2.5 py-0.5 rounded-lg text-white shadow-2xs"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveSlide(prev => (prev - 1 + promoSlides.length) % promoSlides.length)}
              className="w-8 h-8 rounded-xl bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide(prev => (prev + 1) % promoSlides.length)}
              className="w-8 h-8 rounded-xl bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {promoSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${activeSlide === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. CLEAN 13 CATEGORY CARDS GRID */}
      {/* =================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {language === 'hi' ? '🏛️ सेवा श्रेणियां (Service Categories)' : '🏛️ Service Categories'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {fullCatalog.length} {language === 'hi' ? 'सेवाएं उपलब्ध' : 'services available'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-3.5">
          {SERVICE_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICON_MAP[cat.id] || Sparkles;
            const count = categoryCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryModal(cat);
                  setModalSearch('');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center hover:border-orange-500 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-98 min-h-[145px]"
              >
                {/* Category Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-2`}>
                  <IconComp className="w-6 h-6" />
                </div>

                {/* Category Title */}
                <div className="w-full">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 line-clamp-1 leading-snug">
                    {localize(cat.title)}
                  </h3>
                  <span className="inline-block text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1.5">
                    {count} {language === 'hi' ? 'सेवाएं' : 'Services'}
                  </span>
                </div>

                {/* Small Action */}
                <div className="mt-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                  <span>{language === 'hi' ? 'सेवाएं देखें' : 'View Options'}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. CATEGORY SELECTION SCREEN / MODAL (Round Icons & ZERO Rates) */}
      {/* =================================================================== */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${selectedCategoryModal.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                  {React.createElement(CATEGORY_ICON_MAP[selectedCategoryModal.id] || Sparkles, { className: 'w-6 h-6' })}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate leading-snug">
                    {localize(selectedCategoryModal.title)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {categoryCounts[selectedCategoryModal.id] || 0} {language === 'hi' ? 'लाइव सेवाएं उपलब्ध — सेवा चुनकर आगे बढ़ें' : 'live services available'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategoryModal(null)}
                className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Internal Quick Filter */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={language === 'hi' ? 'इस श्रेणी में सेवा खोजें...' : 'Filter in this category...'}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {modalSearch && (
                  <button
                    type="button"
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Services: Clean Grid with Round 3D Icons & ZERO Rates */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 scrollbar-thin">
              {modalCategoryServices.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  {language === 'hi' ? 'कोई सेवा नहीं मिली' : 'No service found'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {modalCategoryServices.map((service) => {
                    const serviceTitle = service.title ? localize(service.title) : service.name;
                    const IconComp = CATEGORY_ICON_MAP[selectedCategoryModal.id] || Sparkles;

                    return (
                      <div
                        key={service.id}
                        onClick={() => handleServiceClick(service.id)}
                        className="bg-slate-50/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-orange-500 dark:hover:border-orange-500 rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer group active:scale-95 min-h-[155px]"
                      >
                        {/* Circular / Round 3D Icon Container */}
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${selectedCategoryModal.color || 'from-orange-500 to-amber-500'} text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200 mb-2 shrink-0 ring-4 ring-white dark:ring-slate-800`}>
                          <IconComp className="w-6 h-6" />
                        </div>

                        {/* Service Title & Number (ABSOLUTELY NO RATES ON THIS SCREEN) */}
                        <div className="w-full flex-1 flex flex-col justify-center my-1">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-0.5">#{service.num}</span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {serviceTitle}
                          </h4>
                        </div>

                        {/* Clean Action Indicator - ZERO RATES ON THIS SCREEN */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 w-full flex items-center justify-center gap-1 text-[11px] font-extrabold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300">
                          <span>{language === 'hi' ? 'सेवा चुनें' : 'Select'}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center flex items-center justify-between px-5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'hi' 
                  ? '🔒 आधिकारिक डिजिटल जन सेवा केंद्र अधिकृत पोर्टल' 
                  : '🔒 Official Digital Seva Kendra Gateway'
                }
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {language === 'hi' ? '100% सुरक्षित सेवा' : '100% Secure'}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
