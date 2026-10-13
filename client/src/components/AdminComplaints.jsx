import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, AlertCircle, CheckCircle2, 
  Send, RefreshCw, Clock, Building2, User, Phone, Check, ShieldAlert
} from 'lucide-react';
import { authFetch } from '../utils/api';

export default function AdminComplaints({ selectedCafe }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');
  const [sendingReply, setSendingReply] = useState(false);

  const cafeId = selectedCafe?.id || '';

  const fetchComplaints = async () => {
    if (!cafeId) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/complaints`);
      const data = await res.json();
      setComplaints(data);
      if (selectedTicket) {
        const updated = data.find(c => c.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [cafeId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);

    try {
      const res = await authFetch(`/api/cafes/${cafeId}/complaints/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage.trim(),
          status: newStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReplyMessage('');
        fetchComplaints();
        alert('✅ ग्राहक को उत्तर भेज दिया गया और टिकट अपडेट हो गया!');
      }
    } catch (err) {
      console.error(err);
      alert('उत्तर भेजने में त्रुटि आई।');
    } finally {
      setSendingReply(false);
    }
  };

  const openTickets = complaints.filter(c => c.status !== 'resolved');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-rose-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-rose-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
            <span>स्तंभ 6 • ग्राहक शिकायत निवारण डेस्क (Cafe Resolution Desk)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            सहायता व शिकायत प्रबंधन — {selectedCafe?.shopName || 'मेरा कैफे'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            ग्राहकों द्वारा आपके कैफे के विरुद्ध दर्ज शिकायतों को देखें और तुरंत समाधान लिखें। ग्राहक संतुष्टि आपके डिजिटल सेवा केंद्र की रेटिंग तय करती है।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 text-xs text-center">
            <span className="text-slate-300 block text-[10px] font-semibold">लंबित शिकायतें</span>
            <span className="text-2xl font-black text-rose-300">{openTickets.length}</span>
          </div>

          <button
            onClick={fetchComplaints}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl transition"
            title="रिफ्रेश"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Ticket List (Left) and Conversation Detail (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left List (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>कुल टिकट ({complaints.length})</span>
            <span className="text-slate-400">दुकान कोड: {selectedCafe?.code ? `#${selectedCafe.code}` : (selectedCafe?.id || '—')}</span>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
              बधाई! आपके कैफे के खिलाफ कोई शिकायत दर्ज नहीं है।
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = selectedTicket?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedTicket(c)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-400/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          c.status === 'resolved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : c.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.status === 'resolved' ? 'हल किया गया' : c.status === 'in_progress' ? 'प्रक्रियाधीन' : 'खुला (Open)'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-xs mt-1.5 line-clamp-1">{c.subject}</h4>
                      <p className="text-[11px] text-rose-700 font-bold mt-0.5">{c.category}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{c.customerName} ({c.customerPhone})</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('hi-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail & Reply Console (7 cols) */}
        <div className="md:col-span-7">
          {selectedTicket ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              
              {/* Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.id}</span>
                    <h3 className="font-black text-slate-900 text-base mt-0.5">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>ग्राहक: <strong className="text-slate-800">{selectedTicket.customerName}</strong></span>
                      <span>•</span>
                      <span>मो: <strong className="text-slate-800 font-mono">{selectedTicket.customerPhone}</strong></span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    selectedTicket.status === 'resolved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedTicket.status === 'resolved' ? 'Resolved ✓' : 'Pending Action'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  ग्राहक द्वारा दर्ज समस्या:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedTicket.description}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  समय: {new Date(selectedTicket.createdAt).toLocaleString('hi-IN')}
                </span>
              </div>

              {/* Previous Replies */}
              {selectedTicket.cafeReplies && selectedTicket.cafeReplies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">दुकान द्वारा भेजा गया उत्तर:</span>
                  {selectedTicket.cafeReplies.map((r, i) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 text-xs">
                      <p className="leading-relaxed">{r.message}</p>
                      <span className="text-[10px] text-emerald-600 mt-1 block">
                        {new Date(r.repliedAt).toLocaleString('hi-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-slate-200">
                <label className="block text-slate-800 font-extrabold text-xs">
                  ग्राहक को उत्तर भेजें (Send Response to Customer):
                </label>

                <textarea
                  rows="3"
                  required
                  placeholder="शिकायत का आधिकारिक उत्तर यहाँ लिखें..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600">स्थिति बदलें:</span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl font-bold bg-white text-xs"
                    >
                      <option value="resolved">समाधान हो गया (Resolved)</option>
                      <option value="in_progress">प्रक्रिया में (In Progress)</option>
                      <option value="open">खुला रखें (Keep Open)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? 'भेज रहे हैं...' : 'उत्तर भेजें व स्टेटस अपडेट करें'}</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
              बाएं से किसी भी शिकायत पर क्लिक करके विवरण देखें और उत्तर भेजें।
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
