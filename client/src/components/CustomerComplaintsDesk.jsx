import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, AlertCircle, CheckCircle2, 
  Send, RefreshCw, Clock, Building2, User, Phone, ShieldCheck, 
  ArrowLeft, FileText, Check, Sparkles, Filter, X, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const COMPLAINT_CATEGORIES = [
  'पैन कार्ड सेवा त्रुटि / देरी (PAN Service Issue)',
  'वॉलेट रिचार्ज / UTR सत्यापन (Wallet/UTR Top-up)',
  'प्रिंट या PVC कार्ड गुणवत्ता (Print Quality Issue)',
  'वाहन RC / DL दस्तावेज समस्या (RC/DL Service)',
  'अधिक चार्ज या शुल्क विवाद (Fee Discrepancy)',
  'अन्य तकनीकी सहायता या प्रश्न (Other Support)'
];

export default function CustomerComplaintsDesk({ 
  onBack, 
  selectedCafe = null, 
  customerSession = null 
}) {
  const { language } = useLanguage();
  const [phone, setPhone] = useState(customerSession?.phone || '');
  const [customerName, setCustomerName] = useState(customerSession?.name || '');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (customerSession) {
      if (customerSession.phone) setPhone(customerSession.phone);
      if (customerSession.name) setCustomerName(customerSession.name);
    }
  }, [customerSession]);

  const fetchMyComplaints = async () => {
    if (!phone) return;
    setLoadingList(true);
    try {
      const res = await fetch(`/api/complaints/customer/${phone.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(Array.isArray(data) ? data : []);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setComplaints([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (phone && phone.length === 10) {
      fetchMyComplaints();
    }
  }, [phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone || phone.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें!');
      return;
    }
    if (!subject.trim() || !description.trim()) {
      setErrorMsg('कृपया शिकायत का विषय और पूरा विवरण दर्ज करें!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId: selectedCafe?.id || '',
          customerPhone: phone.trim(),
          customerName: customerName.trim() || 'नागरिक',
          category,
          subject: subject.trim(),
          description: description.trim(),
          orderId: orderId.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`✅ आपकी शिकायत (टोकन: ${data.complaint?.id || 'दर्ज'}) सफलतापूर्वक दर्ज कर ली गई है! जल्द ही समाधान उपलब्ध कराया जाएगा।`);
        setSubject('');
        setDescription('');
        setOrderId('');
        fetchMyComplaints();
        setActiveTab('history');
      } else {
        setErrorMsg(data.error || 'शिकायत दर्ज करने में विफल।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर से संपर्क नहीं हो सका। कृपया नेटवर्क जांचें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      
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
            <span className="font-black text-rose-700 dark:text-rose-400">
              {language === 'hi' ? 'सहायता व शिकायत निवारण' : 'Help & Grievance Redressal'}
            </span>
          </div>
        </div>

        {phone && phone.length === 10 && (
          <button
            type="button"
            onClick={fetchMyComplaints}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
            title="शिकायत स्थिति रिफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-600 dark:text-rose-400 ${loadingList ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{language === 'hi' ? 'रीफ्रेश' : 'Refresh'}</span>
          </button>
        )}
      </div>

      {/* 2. HEADER BANNER */}
      <div className="no-print bg-gradient-to-r from-red-700 via-rose-700 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-rose-600/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-900/80 text-rose-100 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
            <span>{language === 'hi' ? 'उपभोक्ता संरक्षण व त्वरित सहायता केंद्र' : 'Consumer Protection & Support Desk'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'hi' ? 'सहायता व शिकायत डेस्क' : 'Help & Grievance Desk'}
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {language === 'hi'
              ? 'यदि किसी सरकारी सेवा, कार्ड प्रिंट, दस्तावेज या वॉलेट भुगतान में कोई समस्या आई है, तो तुरंत शिकायत दर्ज करें। आपकी समस्या का 24 घंटे में समाधान किया जाएगा।'
              : 'If you face any issue with any service, card print, document or wallet payment, lodge a complaint here. Resolution guaranteed within 24 hours.'}
          </p>
        </div>

        {/* Tab switch pills in banner */}
        <div className="flex bg-black/30 p-1.5 rounded-2xl border border-white/20 text-xs font-black shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'new' ? 'bg-white text-rose-800 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            {language === 'hi' ? '➕ नई शिकायत दर्ज करें' : '➕ Lodge Complaint'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              fetchMyComplaints();
            }}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-rose-800 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <span>{language === 'hi' ? '📋 मेरी शिकायतें' : '📋 My Tickets'}</span>
            {complaints.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {complaints.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT: NEW COMPLAINT FORM vs HISTORY */}
      {activeTab === 'new' ? (
        <div className="bg-white dark:bg-[#0c162c] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-600" />
                <span>{language === 'hi' ? 'नई शिकायत दर्ज करें' : 'Lodge New Complaint'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'hi' 
                  ? 'कृपया सभी विवरण सही भरें ताकि संबंधित कैफे संचालक व एडमिन तुरंत कार्रवाई कर सकें।'
                  : 'Please fill in all details accurately for prompt action by operator & admin.'}
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">संबंधित सेवा केंद्र:</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {selectedCafe?.shopName || 'केंद्रीय सहायता केंद्र (Smart Cafe Central)'}
              </span>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl font-bold text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm">{successMsg}</p>
                <p className="text-[11px] mt-1 text-emerald-700 dark:text-emerald-400">
                  आप ऊपर दिए गए <strong>"मेरी शिकायतें"</strong> टैब में जाकर अपनी शिकायत की लाइव प्रगति और ऑपरेटर का उत्तर देख सकते हैं।
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-2xl font-bold text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                  {language === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="आवेदक का पूरा नाम"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                  {language === 'hi' ? '10-अंकों का मोबाइल नंबर *' : '10-digit Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                  {language === 'hi' ? 'शिकायत की श्रेणी *' : 'Complaint Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {COMPLAINT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                  {language === 'hi' ? 'संबंधित ऑर्डर / टोकन ID (यदि हो)' : 'Related Order/Token ID (Optional)'}
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="उदा. ORD-1729..., PAN, RC आदि"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                {language === 'hi' ? 'समस्या का संक्षिप्त विषय *' : 'Subject of Issue *'}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="उदा. पैन कार्ड डाउनलोड में त्रुटि, या UTR वेरीफाई नहीं हुआ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                {language === 'hi' ? 'समस्या का पूरा विवरण *' : 'Detailed Description *'}
              </label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="कृपया अपनी समस्या का पूरा विवरण लिखें ताकि तुरंत समाधान किया जा सके..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black px-8 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'शिकायत भेजी जा रही है...' : '🚀 शिकायत सबमिट करें (Lodge Complaint)'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="bg-white dark:bg-[#0c162c] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>{language === 'hi' ? 'मेरी दर्ज शिकायतें व समाधान स्थिति' : 'My Grievances & Status'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              मोबाइल: {phone || 'अज्ञात'}
            </span>
          </div>

          {loadingList ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
              <span>{language === 'hi' ? 'शिकायतें लोड हो रही हैं...' : 'Loading tickets...'}</span>
            </div>
          ) : complaints.length === 0 ? (
            /* 100% ZERO DUMMY DATA EMPTY STATE */
            <div className="p-12 text-center space-y-2.5">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                {language === 'hi' ? 'वर्तमान में कोई रिकॉर्ड नहीं है।' : 'Currently no records found.'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {language === 'hi'
                  ? 'आपके मोबाइल नंबर पर कोई लंबित या पुरानी शिकायत दर्ज नहीं है। यदि कोई समस्या हो तो नई शिकायत दर्ज करें।'
                  : 'No complaints have been lodged for this mobile number yet.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className="mt-2 inline-flex items-center gap-1.5 bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                <span>➕ नई शिकायत दर्ज करें</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => {
                const isResolved = c.status === 'resolved';
                const isInProgress = c.status === 'in_progress';

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070e1b] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {c.subject}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          श्रेणी: {c.category} • {c.cafeShopName || 'कैफे'}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                        isResolved 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : isInProgress 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {isResolved ? '🟢 समाधान हो गया' : isInProgress ? '🔵 प्रक्रियाधीन' : '🟡 नई शिकायत'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0f1d36] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {c.description}
                    </p>

                    {/* Replies thread */}
                    {Array.isArray(c.cafeReplies) && c.cafeReplies.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          कैफे संचालक / एडमिन का उत्तर:
                        </span>
                        {c.cafeReplies.map((r, i) => (
                          <div key={i} className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
                            <p className="font-medium">{r.message}</p>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-1 font-mono">
                              उत्तर दिनांक: {r.repliedAt ? new Date(r.repliedAt).toLocaleString('hi-IN') : 'हाल ही में'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
