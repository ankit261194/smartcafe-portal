import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, CreditCard, ShieldCheck, Award, FileText, Zap, Sparkles, 
  Printer, ArrowRight, Wallet, History, Search, X, CheckCircle2, 
  Layers, Lock, AlertCircle, RefreshCw, ChevronRight, ChevronLeft, 
  User, ExternalLink, Smartphone
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // 3. Carousel Slides (Compact announcements - Height ~85px)
  const promoSlides = useMemo(() => [
    {
      badge: language === 'hi' ? '🇮🇳 79+ लाइव सेवाएं' : '🇮🇳 79+ Live Services',
      title: language === 'hi' 
        ? 'आधिकारिक डिजिटल सेवा हब — 1-क्लिक में HD PDF व PVC कार्ड' 
        : 'Official Digital Service Hub — 1-Click HD PDF & PVC Cards',
      sub: language === 'hi'
        ? 'आधार, पैन, वाहन RC, वोटर, राशन व राज्य कल्याण सेवाएं बिना किसी देरी के उपलब्ध।'
        : 'Instant Aadhaar, PAN, Vehicle RC, Voter, Ration & Welfare services live.',
      color: 'from-orange-600 via-amber-600 to-orange-700'
    },
    {
      badge: language === 'hi' ? '🚗 वाहन RC व DL' : '🚗 Vehicle RC & DL',
      title: language === 'hi'
        ? 'गाड़ी नंबर से तुरंत वाहन RC PDF व ड्राइविंग लाइसेंस सर्च'
        : 'Instant MoRTH Vehicle RC PDF & Sarathi DL Search',
      sub: language === 'hi'
        ? 'परिवहन अधिकृत प्रिंट फॉर्मेट व ई-चालान जांच सिर्फ 1-क्लिक में।'
        : 'Official MoRTH Parivahan format and traffic challan check in seconds.',
      color: 'from-emerald-600 via-teal-600 to-emerald-700'
    },
    {
      badge: language === 'hi' ? '🏪 थोक B2B रेट्स' : '🏪 Wholesale B2B Rates',
      title: language === 'hi'
        ? 'दुकानदार व VLE काउंटर: प्रत्येक ऑर्डर पर सीधा ₹10 से ₹70 का मार्जिन'
        : 'VLE Counter: Pocket ₹10 to ₹70 Net Margin Per Service',
      sub: language === 'hi'
        ? 'थोक दर B2B वॉलेट से स्वतः कटेगी और आपका कमीशन तुरंत सुरक्षित रहेगा।'
        : 'Wholesale rates deduct automatically and profits are safely logged.',
      color: 'from-blue-600 via-indigo-600 to-blue-700'
    }
  ], [language]);

  // Auto rotate carousel slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  // 4. Global Search Filtered Services
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return fullCatalog.filter(s => {
      const nameMatch = s.name && s.name.toLowerCase().includes(q);
      const idMatch = s.id && s.id.toLowerCase().includes(q);
      const titleHi = s.title?.hi && s.title.hi.toLowerCase().includes(q);
      const titleEn = s.title?.en && s.title.en.toLowerCase().includes(q);
      const subHi = s.sub?.hi && s.sub.hi.toLowerCase().includes(q);
      const subEn = s.sub?.en && s.sub.en.toLowerCase().includes(q);
      const catMatch = s.category && s.category.toLowerCase().includes(q);
      return nameMatch || idMatch || titleHi || titleEn || subHi || subEn || catMatch;
    });
  }, [fullCatalog, searchQuery]);

  // 5. Services inside Modal Category
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

  const displayBalance = isOperator ? sanchalakB2bBalance : walletBalance;

  // Handle service click
  const handleServiceClick = (serviceId) => {
    setSelectedCategoryModal(null);
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
          {/* Live Wallet Pill */}
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
      {/* 2. COMPACT PROMO CAROUSEL (Slim Height ~85px - No Screen Takeover) */}
      {/* =================================================================== */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 text-white">
        
        {/* Tricolor Accent Top Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex z-20">
          <div className="flex-1 bg-[#f97316]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#16a34a]"></div>
        </div>

        {/* Slide Content */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${promoSlides[activeSlide].color} transition-all duration-500 flex items-center justify-between gap-4`}>
          <div className="min-w-0 flex-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full mb-1 border border-white/20">
              {promoSlides[activeSlide].badge}
            </span>
            <h2 className="text-sm sm:text-base font-black truncate leading-snug">
              {promoSlides[activeSlide].title}
            </h2>
            <p className="text-[11px] sm:text-xs text-white/90 truncate mt-0.5 hidden sm:block">
              {promoSlides[activeSlide].sub}
            </p>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSlide(prev => (prev - 1 + promoSlides.length) % promoSlides.length)}
              className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide(prev => (prev + 1) % promoSlides.length)}
              className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
          {promoSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1 rounded-full transition-all ${activeSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. FAST SEARCH BAR (1-Click Instant Service Access) */}
      {/* =================================================================== */}
      <div className="relative">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'hi' 
            ? 'किसी भी सेवा का नाम या नंबर सर्च करें (जैसे RC, पैन, आधार, राशन, समग्र, बिजली)...' 
            : 'Search any service: Aadhaar, PAN, RC, Ration, Samagra, Electricity, Voter...'
          }
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-orange-500 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. SEARCH RESULTS VIEW (When User Types in Search Bar) */}
      {/* =================================================================== */}
      {searchQuery.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-600" />
              <span>
                {language === 'hi' ? `"${searchQuery}" के लिए परिणाम (${searchResults.length})` : `Results for "${searchQuery}" (${searchResults.length})`}
              </span>
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-orange-600 hover:underline font-bold"
            >
              {language === 'hi' ? 'खोज हटाएं' : 'Clear search'}
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {language === 'hi' ? 'कोई सेवा नहीं मिली' : 'No service found'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'hi' ? 'कृपया अन्य शब्द टाइप करें।' : 'Please try another search keyword.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map(service => {
                const margin = Math.max(0, (Number(service.retailRate) || 0) - (Number(service.wholesaleRate) || 0));
                const serviceTitle = service.title ? localize(service.title) : service.name;
                const serviceSub = service.sub ? localize(service.sub) : `${service.name} आधिकारिक डिजिटल सेवा`;

                return (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500 hover:shadow-md transition shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-slate-400">#{service.num}</span>
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          LIVE ⚡
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {serviceTitle}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {serviceSub}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        {isOperator ? (
                          <div className="text-xs">
                            <span className="text-[10px] text-slate-500 block">थोक दर:</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">₹{service.wholesaleRate}</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold ml-1.5">(+₹{margin} लाभ)</span>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="text-[10px] text-slate-500 block">सेवा शुल्क:</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white text-sm">₹{service.retailRate}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleServiceClick(service.id)}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* 5. CLEAN CATEGORY CARDS GRID (When NOT searching) */
        /* =================================================================== */
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
      )}

      {/* =================================================================== */}
      {/* 6. CATEGORY SERVICES MODAL / DRAWER (Clean Options Popup) */}
      {/* =================================================================== */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedCategoryModal.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                  {React.createElement(CATEGORY_ICON_MAP[selectedCategoryModal.id] || Sparkles, { className: 'w-5 h-5' })}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate leading-snug">
                    {localize(selectedCategoryModal.title)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {categoryCounts[selectedCategoryModal.id] || 0} {language === 'hi' ? 'लाइव सेवाएं उपलब्ध' : 'services live'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategoryModal(null)}
                className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Internal Search */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={language === 'hi' ? 'इस श्रेणी में खोजें...' : 'Filter in this category...'}
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

            {/* Modal Services List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
              {modalCategoryServices.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  {language === 'hi' ? 'कोई सेवा नहीं मिली' : 'No service found'}
                </div>
              ) : (
                modalCategoryServices.map((service) => {
                  const margin = Math.max(0, (Number(service.retailRate) || 0) - (Number(service.wholesaleRate) || 0));
                  const serviceTitle = service.title ? localize(service.title) : service.name;
                  const serviceSub = service.sub ? localize(service.sub) : `${service.name} आधिकारिक डिजिटल सेवा`;

                  return (
                    <div
                      key={service.id}
                      className="bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 transition shadow-2xs hover:shadow-xs hover:border-orange-400"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono text-slate-400">#{service.num}</span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {serviceTitle}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {serviceSub}
                        </p>
                      </div>

                      {/* Rates & Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isOperator ? (
                          <div className="text-right text-xs">
                            <span className="text-[10px] text-slate-400 block">{language === 'hi' ? 'थोक दर' : 'Wholesale'}</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">₹{service.wholesaleRate}</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">(+₹{margin})</span>
                          </div>
                        ) : (
                          <div className="text-right text-xs">
                            <span className="text-[10px] text-slate-400 block">{language === 'hi' ? 'शुल्क' : 'Fee'}</span>
                            <span className="font-mono font-black text-slate-900 dark:text-white text-sm">₹{service.retailRate}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleServiceClick(service.id)}
                          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <span>{language === 'hi' ? 'शुरू करें' : 'Open'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'hi' 
                  ? '🔒 आधिकारिक P4Points API द्वारा 100% वेरिफाइड जन सेवा केंद्र पोर्टल' 
                  : '🔒 100% Verified Official P4Points API Gateway'
                }
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
