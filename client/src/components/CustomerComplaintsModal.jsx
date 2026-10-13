import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, AlertCircle, CheckCircle2, 
  Send, RefreshCw, Clock, Building2, User, Phone, ShieldCheck, X
} from 'lucide-react';

const COMPLAINT_CATEGORIES = [
  'अधिक चार्ज लिया (Overcharging)',
  'काम में देरी (Delay in Service)',
  'गलत विवरण या रसीद (Incorrect Details/Receipt)',
  'खराब व्यवहार (Unprofessional Behavior)',
  'OTP या गोपनीयता समस्या (OTP/Privacy Issue)',
  'अन्य समस्या (Other Issue)'
];

export default function CustomerComplaintsModal({ 
  isOpen, 
  onClose, 
  selectedCafe, 
  customerSession
}) {
  const [phone, setPhone] = useState(customerSession?.phone || '');
  const [customerName, setCustomerName] = useState(customerSession?.name || '');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customerSession) {
      if (customerSession.phone) setPhone(customerSession.phone);
      if (customerSession.name) setCustomerName(customerSession.name);
    }
  }, [customerSession, isOpen]);

  // Past complaints
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  const fetchMyComplaints = async () => {
    if (!phone) return;
    setLoadingList(true);
    try {
      const res = await fetch(`/api/complaints/customer/${phone}`);
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyComplaints();
    }
  }, [isOpen, phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCafe?.id) {
      setErrorMsg('कृपया पहले अपने नजदीकी साइबर कैफ़े का चयन करें।');
      return;
    }
    if (!subject.trim() || !description.trim()) {
      setErrorMsg('कृपया विषय और समस्या का विवरण दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId: selectedCafe.id,
          customerPhone: phone.trim(),
          customerName: customerName.trim(),
          category,
          subject: subject.trim(),
          description: description.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('✅ आपकी शिकायत दर्ज हो गई है! कैफे संचालक को सूचित कर दिया गया है।');
        setSubject('');
        setDescription('');
        fetchMyComplaints();
        setActiveTab('history');
      } else {
        setErrorMsg(data.error || 'शिकायत दर्ज करने में विफल।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर त्रुटि आई।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">सहायता व शिकायत निवारण</h3>
              <p className="text-[11px] text-rose-100">
                {selectedCafe?.shopName || 'कैफे सेवा सहायता'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white font-black text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 p-2 flex items-center gap-2 border-b border-slate-200 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              activeTab === 'new' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + नई शिकायत दर्ज करें
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchMyComplaints();
            }}
            className={`flex-1 py-2 rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>मेरी शिकायतें व उत्तर</span>
            {complaints.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {complaints.length}
              </span>
            )}
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  यह शिकायत सीधे दुकान संचालक <strong>{selectedCafe?.shopName || 'कैफे'}</strong> को भेजी जाएगी। यदि वे 24 घंटे में समाधान नहीं करते, तो केंद्रीय निगरानी प्राधिकरण द्वारा हस्तक्षेप किया जाएगा।
                </span>
              </div>

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">आपका नाम *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">शिकायत श्रेणी (Category) *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-rose-500 bg-white"
                >
                  {COMPLAINT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">शिकायत का संक्षिप्त विषय (Subject) *</label>
                <input
                  type="text"
                  required
                  placeholder="शिकायत का संक्षिप्त विषय लिखें"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">विस्तृत विवरण (Description) *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="पूरी बात विस्तार से लिखें ताकि संचालक तुरंत समाधान कर सके..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'भेज रहे हैं...' : 'शिकायत दर्ज करें (Submit Ticket)'}</span>
              </button>

            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                <span>आपके द्वारा दर्ज शिकायतें:</span>
                <button onClick={fetchMyComplaints} className="hover:text-rose-600 flex items-center gap-1">
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
                  <span>रिफ्रेश</span>
                </button>
              </div>

              {complaints.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  आपने इस फोन नंबर से अभी तक कोई शिकायत दर्ज नहीं की है।
                </div>
              ) : (
                complaints.map((c) => (
                  <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 block">{c.id}</span>
                        <h4 className="font-black text-slate-900 text-xs">{c.subject}</h4>
                        <span className="text-[10px] text-rose-700 font-bold">{c.category}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        c.status === 'resolved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : c.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {c.status === 'resolved' ? 'हल किया गया (Resolved)' : c.status === 'in_progress' ? 'प्रक्रियाधीन' : 'खुला (Open)'}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] bg-white p-2.5 rounded-xl border border-slate-100">
                      {c.description}
                    </p>

                    {/* Sanchalak Replies */}
                    {c.cafeReplies && c.cafeReplies.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-800 text-[10px] flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          दुकानदार का उत्तर (Cafe Response):
                        </span>
                        {c.cafeReplies.map((r, i) => (
                          <div key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-[11px]">
                            <p>{r.message}</p>
                            <span className="text-[9px] text-emerald-600 mt-1 block">
                              {new Date(r.repliedAt).toLocaleDateString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>कैफे: {c.cafeShopName}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('hi-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-xl text-xs transition"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
