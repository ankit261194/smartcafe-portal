import React, { useState, useEffect } from 'react';
import { 
  Search, Printer, RefreshCw, ArrowLeft, CheckCircle2, Clock, 
  Copy, Check, CreditCard, ShieldCheck, FileText, AlertCircle, 
  ExternalLink, Sparkles, Filter, X, Smartphone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PanFindList({ 
  onBack, 
  onLaunchPanFind = () => {}, 
  onGeneratePvcCard = () => {},
  selectedCafe = null,
  customerSession = null
}) {
  const { language } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'
  const [copiedId, setCopiedId] = useState(null);

  const fetchPanRequests = async () => {
    setLoading(true);
    try {
      const cafeParam = selectedCafe?.id ? `?cafeId=${selectedCafe.id}` : '';
      const phoneParam = customerSession?.phone ? `${cafeParam ? '&' : '?'}phone=${customerSession.phone}` : '';
      const res = await fetch(`/api/pan-find/list${cafeParam}${phoneParam}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching PAN find requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanRequests();
  }, [selectedCafe?.id, customerSession?.phone]);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'completed' && r.status !== 'completed' && !r.panNumber) return false;
    if (filterStatus === 'pending' && (r.status === 'completed' || r.panNumber)) return false;

    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (r.applicantName && r.applicantName.toLowerCase().includes(s)) ||
      (r.panNumber && r.panNumber.toLowerCase().includes(s)) ||
      (r.searchParam && r.searchParam.toLowerCase().includes(s)) ||
      (r.orderId && r.orderId.toLowerCase().includes(s)) ||
      (r.id && r.id.toLowerCase().includes(s)) ||
      (r.customerPhone && r.customerPhone.includes(s))
    );
  });

  const totalFound = requests.filter(r => r.panNumber || r.status === 'completed').length;
  const totalPending = requests.filter(r => !r.panNumber && r.status !== 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      
      {/* 1. TOP BREADCRUMB & BACK NAVIGATION BAR */}
      <div className="no-print bg-white dark:bg-[#0c162c] rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'hi' ? '← डैशबोर्ड पर वापस जाएं' : '← Back to Dashboard'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {onBack && (
              <>
                <span className="cursor-pointer hover:underline font-semibold" onClick={onBack}>
                  {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                </span>
                <span>›</span>
              </>
            )}
            <span className="font-black text-emerald-700 dark:text-emerald-400">
              {language === 'hi' ? 'पैन फाइंड लिस्ट व ट्रैकर' : 'PAN Find Register & Tracker'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPanRequests}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
            title="सूची रीफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{language === 'hi' ? 'रीफ्रेश' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={onLaunchPanFind}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '➕ नया पैन खोजें' : '➕ Find New PAN'}</span>
          </button>
        </div>
      </div>

      {/* 2. OFFICIAL CSC / REKHA PRINT HEADER BANNER */}
      <div className="no-print bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-white rounded-3xl p-6 sm:p-7 shadow-md border border-emerald-600/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-emerald-100 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'hi' ? 'आयकर विभाग (Income Tax) अधिकृत पैन खोज लेजर' : 'Income Tax Official PAN Find Register'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'hi' ? 'पैन फाइंड लिस्ट व लाइव ट्रैकर' : 'PAN Find Register & Live Tracker'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {language === 'hi'
              ? 'आधार संख्या अथवा नाम व मोबाइल से खोजे गए सभी पैन कार्ड की लाइव सूची। खोज सफल होने पर 1-क्लिक में ISO CR-80 PVC स्मार्ट कार्ड जनरेट करें।'
              : 'Live record of all PAN cards retrieved via Aadhaar number or Name + Mobile. Instantly generate official CR-80 PVC smart card in 1 click.'}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-white/15 border border-white/20 rounded-2xl px-3.5 py-2 text-center">
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">
              {language === 'hi' ? 'कुल अनुरोध' : 'Total'}
            </span>
            <span className="text-xl font-mono font-black text-white">
              {requests.length}
            </span>
          </div>

          <div className="bg-white/15 border border-white/20 rounded-2xl px-3.5 py-2 text-center">
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
              {language === 'hi' ? '✅ खोज पूर्ण' : '✅ Found'}
            </span>
            <span className="text-xl font-mono font-black text-emerald-300">
              {totalFound}
            </span>
          </div>

          <div className="bg-white/15 border border-white/20 rounded-2xl px-3.5 py-2 text-center">
            <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider block">
              {language === 'hi' ? '⏳ पेंडिंग' : '⏳ Pending'}
            </span>
            <span className="text-xl font-mono font-black text-amber-300">
              {totalPending}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="no-print bg-white dark:bg-[#0c162c] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'आवेदक का नाम, पैन संख्या, आधार या टोकन ID खोजें...' : 'Search by Applicant Name, PAN, Aadhaar or Token ID...'}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              title="साफ़ करें"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterStatus === 'all' ? 'bg-white dark:bg-[#0f1d36] text-slate-900 dark:text-white shadow-xs font-black' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            {language === 'hi' ? `सभी (${requests.length})` : `All (${requests.length})`}
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterStatus === 'completed' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'hover:text-emerald-600'}`}
          >
            {language === 'hi' ? `✅ प्राप्त पैन (${totalFound})` : `✅ Found (${totalFound})`}
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterStatus === 'pending' ? 'bg-amber-600 text-white shadow-xs font-black' : 'hover:text-amber-600'}`}
          >
            {language === 'hi' ? `⏳ प्रक्रियाधीन (${totalPending})` : `⏳ Pending (${totalPending})`}
          </button>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE TABLE */}
      <div className="no-print bg-white dark:bg-[#0c162c] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="font-bold">{language === 'hi' ? 'पैन खोज रजिस्टर लोड हो रहा है...' : 'Loading PAN Find Register...'}</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          /* 100% ZERO DUMMY DATA EMPTY STATE */
          <div className="p-14 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">
              {search 
                ? (language === 'hi' ? 'खोज के अनुसार कोई रिकॉर्ड नहीं मिला' : 'No records match your search')
                : (language === 'hi' ? 'वर्तमान में कोई रिकॉर्ड नहीं है।' : 'Currently no records found.')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {search
                ? (language === 'hi' ? 'कृपया नाम या संख्या पुनः जांचें।' : 'Please check the name or number and try again.')
                : (language === 'hi' ? 'जब आप आधार संख्या अथवा नाम द्वारा पैन खोज सेवा का उपयोग करेंगे, तो सभी खोजे गए रिकॉर्ड यहाँ सुरक्षित रूप से दिखाई देंगे।' : 'When you search for PAN cards via Aadhaar or Name, all records will be permanently listed here.')}
            </p>
            {!search && (
              <button
                type="button"
                onClick={onLaunchPanFind}
                className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{language === 'hi' ? '🔍 अभी नया पैन खोजें' : '🔍 Find PAN Now'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">{language === 'hi' ? 'टोकन / ऑर्डर ID' : 'Token / Order ID'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'आवेदक का नाम' : 'Applicant Name'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'खोज माध्यम (आधार / फोन)' : 'Search Param (Aadhaar / Mobile)'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'आवेदन तिथि' : 'Application Date'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'खोजा गया पैन नंबर' : 'Retrieved PAN Number'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                  <th className="p-3.5 text-right">{language === 'hi' ? 'त्वरित कार्रवाई' : 'Quick Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredRequests.map((req) => {
                  const isFound = Boolean(req.panNumber);
                  const formattedDate = req.createdAt 
                    ? new Date(req.createdAt).toLocaleString('hi-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })
                    : '—';

                  return (
                    <tr 
                      key={req.id || req.orderId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* 1. Order ID */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {req.orderId || req.id}
                        </span>
                        {req.cafeShopName && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                            {req.cafeShopName}
                          </span>
                        )}
                      </td>

                      {/* 2. Applicant Name */}
                      <td className="p-3.5">
                        <span className="font-black text-slate-900 dark:text-white block text-sm">
                          {req.applicantName || 'आवेदक'}
                        </span>
                        {req.customerPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            +91 {req.customerPhone}
                          </span>
                        )}
                      </td>

                      {/* 3. Search Param */}
                      <td className="p-3.5">
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#070e1b] px-2 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block font-semibold">
                          {req.searchParam || req.maskedAadhaar || '—'}
                        </span>
                      </td>

                      {/* 4. Date */}
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* 5. Retrieved PAN */}
                      <td className="p-3.5">
                        {isFound ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg tracking-wider">
                              {req.panNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(req.panNumber, req.id)}
                              className="p-1 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                              title="पैन नंबर कॉपी करें"
                            >
                              {copiedId === req.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>प्रक्रियाधीन (खोज जारी है)</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Status Badge */}
                      <td className="p-3.5">
                        {isFound ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>सफल (Found)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>प्रक्रियाधीन</span>
                          </span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isFound ? (
                          <button
                            type="button"
                            onClick={() => onGeneratePvcCard(req.panNumber, req.applicantName)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
                            title="इस पैन नंबर का ISO CR-80 PVC स्मार्ट कार्ड जनरेट करें"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>🖨️ PVC कार्ड जनरेट करें</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={fetchPanRequests}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>स्थिति जांचें</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
