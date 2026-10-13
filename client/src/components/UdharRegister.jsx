import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, UserX, PlusCircle, CheckCircle2, 
  Trash2, RefreshCw, MessageCircle, AlertCircle, 
  Smartphone, Calendar, Download, Printer, ShieldCheck, Wifi, WifiOff
} from 'lucide-react';
import { authFetch } from '../utils/api';

export default function UdharRegister({ settings, selectedCafe }) {
  const [udharList, setUdharList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unsettled'); // 'all', 'unsettled', 'settled'

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Partial Payment Modal State
  const [partialModal, setPartialModal] = useState({ isOpen: false, udhar: null, amount: '', note: '' });

  // Offline State
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);

  const cafeId = selectedCafe?.id || '';

  const updateOfflineCount = () => {
    try {
      const uq = JSON.parse(localStorage.getItem('offline_udhar_queue') || '[]');
      setOfflinePendingCount(uq.length);
    } catch {
      setOfflinePendingCount(0);
    }
  };

  const fetchUdhar = async () => {
    if (!cafeId) {
      setUdharList([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await authFetch(`/api/cashbook?cafeId=${cafeId}`);
      const json = await res.json();
      setUdharList(json?.udharList || []);
    } catch (err) {
      console.error('Error fetching udhar register:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineQueue = async () => {
    if (!navigator.onLine || syncingOffline) return;
    setSyncingOffline(true);
    try {
      const uq = JSON.parse(localStorage.getItem('offline_udhar_queue') || '[]');
      const remaining = [];
      for (const item of uq) {
        try {
          await authFetch('/api/udhar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } catch (err) {
          remaining.push(item);
        }
      }
      localStorage.setItem('offline_udhar_queue', JSON.stringify(remaining));
      updateOfflineCount();
      if (cafeId) fetchUdhar();
    } catch (err) {
      console.error('Udhar offline sync error:', err);
    } finally {
      setSyncingOffline(false);
    }
  };

  useEffect(() => {
    fetchUdhar();
    updateOfflineCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [cafeId]);

  const queueOfflineUdhar = (entry) => {
    try {
      const uq = JSON.parse(localStorage.getItem('offline_udhar_queue') || '[]');
      uq.push({ ...entry, id: `OFFLINE-UDHAR-${Date.now()}`, createdAt: new Date().toISOString() });
      localStorage.setItem('offline_udhar_queue', JSON.stringify(uq));
      updateOfflineCount();
      // Optimistic update
      setUdharList(prev => [
        {
          id: `OFFLINE-UDHAR-${Date.now()}`,
          ...entry,
          isSettled: false,
          remainingAmount: entry.amount,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      alert('⚠️ इंटरनेट कनेक्शन नहीं है! उधारी प्रविष्टि ऑफ़लाइन सुरक्षित कर ली गई है और इंटरनेट आते ही स्वतः सर्वर से सिंक हो जाएगी।');
    } catch (err) {
      console.error('Error queueing offline udhar:', err);
    }
  };

  const handleAddUdhar = async (e) => {
    e.preventDefault();
    if (!customerName || !amount || !cafeId) return;

    const entry = {
      cafeId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      amount: parseFloat(amount),
      note: note.trim()
    };

    setCustomerName('');
    setPhone('');
    setAmount('');
    setNote('');

    if (!navigator.onLine) {
      queueOfflineUdhar(entry);
      return;
    }

    try {
      const res = await authFetch('/api/udhar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        fetchUdhar();
      } else {
        queueOfflineUdhar(entry);
      }
    } catch (err) {
      console.warn('Network error adding udhar, queueing offline:', err);
      queueOfflineUdhar(entry);
    }
  };

  const handleSettle = async (id, mode = 'cash') => {
    try {
      const res = await authFetch(`/api/udhar/${id}/settle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMode: mode })
      });
      if (res.ok) fetchUdhar();
    } catch (err) {
      console.error('Error settling udhar:', err);
    }
  };

  const handlePartialSubmit = async (e) => {
    e.preventDefault();
    if (!partialModal.udhar || !partialModal.amount) return;
    try {
      const res = await authFetch(`/api/udhar/${partialModal.udhar.id}/partial-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(partialModal.amount),
          note: partialModal.note || 'आंशिक भुगतान'
        })
      });
      if (res.ok) {
        setPartialModal({ isOpen: false, udhar: null, amount: '', note: '' });
        fetchUdhar();
      }
    } catch (err) {
      console.error('Error submitting partial payment:', err);
    }
  };

  const filteredUdhar = udharList.filter(u => {
    if (filter === 'unsettled') return !u.isSettled;
    if (filter === 'settled') return u.isSettled;
    return true;
  });

  const totalOutstanding = udharList
    .filter(u => !u.isSettled)
    .reduce((sum, u) => sum + (u.remainingAmount !== undefined ? u.remainingAmount : u.amount), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Offline Status Warning Banner */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900 text-xs font-bold">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>इंटरनेट बंद है (Offline Mode) • आपकी नई उधारी प्रविष्टियां फ़ोन में सुरक्षित रहेंगी और नेटवर्क आते ही सिंक हो जाएंगी।</span>
          </div>
          {offlinePendingCount > 0 && (
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[10px] shrink-0">
              {offlinePendingCount} ऑफ़लाइन कतार में
            </span>
          )}
        </div>
      )}

      {isOnline && offlinePendingCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-blue-900 text-xs font-bold">
          <span>{offlinePendingCount} ऑफ़लाइन उधारी रिकॉर्ड सिंक हेतु तैयार हैं।</span>
          <button
            onClick={syncOfflineQueue}
            disabled={syncingOffline}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingOffline ? 'animate-spin' : ''}`} />
            <span>{syncingOffline ? 'सिंक हो रहा है...' : 'अभी सिंक करें'}</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-rose-200 mb-2">
            <UserX className="w-3.5 h-3.5 text-yellow-300" />
            <span>डिजिटल खाता • उधार बहीखाता रजिस्टर</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">उधार रजिस्टर (Udhar Register)</h2>
          <p className="text-xs text-rose-200 mt-0.5">
            ग्राहकों की उधारी का हिसाब रखें, 1-क्लिक में WhatsApp तगादा भेजें व आंशिक भुगतान जमा करें।
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right shrink-0">
          <span className="text-[11px] text-rose-200 font-bold block">कुल बाकी उधारी (Pending)</span>
          <span className="text-2xl font-black text-white">₹{totalOutstanding}</span>
        </div>
      </div>

      {/* New Udhar Form & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add New Udhar Form */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>नया उधार जोड़ें</span>
          </h3>

          <form onSubmit={handleAddUdhar} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ग्राहक का नाम *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="उदा. रमेश कुमार"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर (WhatsApp हेतु)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-अंकीय मोबाइल"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">उधार राशि (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="उदा. 150"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-sm text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">विवरण / नोट (वैकल्पिक)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="उदा. पैन कार्ड फॉर्म + प्रिंट"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!cafeId}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl transition shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50"
            >
              + खाता में उधार दर्ज करें
            </button>
          </form>
        </div>

        {/* Right: Udhar Table & Filter */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <UserX className="w-4 h-4 text-slate-700" />
              <span>उधारी खाता विवरण ({filteredUdhar.length})</span>
            </h3>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilter('unsettled')}
                className={`px-3 py-1 rounded-lg transition ${filter === 'unsettled' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'}`}
              >
                बाकी ({udharList.filter(u => !u.isSettled).length})
              </button>
              <button
                onClick={() => setFilter('settled')}
                className={`px-3 py-1 rounded-lg transition ${filter === 'settled' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
              >
                चुका दिया ({udharList.filter(u => u.isSettled).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${filter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'}`}
              >
                सभी
              </button>
            </div>
          </div>

          {filteredUdhar.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
              <p className="font-bold text-slate-600">कोई उधारी रिकॉर्ड मौजूद नहीं है।</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredUdhar.map((u) => {
                const rem = u.remainingAmount !== undefined ? u.remainingAmount : u.amount;
                return (
                  <div
                    key={u.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                      u.isSettled 
                        ? 'bg-slate-50 border-slate-200 opacity-75' 
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{u.customerName}</span>
                        {u.phone && (
                          <span className="text-[11px] font-mono text-slate-500">({u.phone})</span>
                        )}
                        {u.isSettled ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            चुका दिया ✓
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            बाकी: ₹{rem}
                          </span>
                        )}
                      </div>

                      {u.note && (
                        <p className="text-[11px] text-slate-600 font-medium">नोट: {u.note}</p>
                      )}

                      <span className="text-[10px] text-slate-400 block">
                        दिनांक: {new Date(u.createdAt).toLocaleDateString('hi-IN')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
                      {/* WhatsApp Reminder */}
                      {u.phone && !u.isSettled && (
                        <a
                          href={`https://wa.me/91${u.phone}?text=${encodeURIComponent(`नमस्ते ${u.customerName} जी, आपके ${selectedCafe?.shopName || 'कैफे'} पर ₹${rem} की उधारी बकाया है। कृपया सुविधानुसार भुगतान कर दें। धन्यवाद!`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition"
                          title="WhatsApp पर तगादा भेजें"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>तगादा</span>
                        </a>
                      )}

                      {!u.isSettled && (
                        <>
                          <button
                            onClick={() => setPartialModal({ isOpen: true, udhar: u, amount: '', note: '' })}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition"
                          >
                            आंशिक जमा
                          </button>
                          <button
                            onClick={() => handleSettle(u.id, 'cash')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs"
                          >
                            पूर्ण चुकता ✓
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Partial Payment Modal */}
      {partialModal.isOpen && partialModal.udhar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm">
              आंशिक उधारी जमा ({partialModal.udhar.customerName})
            </h4>
            <p className="text-xs text-slate-500">
              कुल बकाया: ₹{partialModal.udhar.remainingAmount !== undefined ? partialModal.udhar.remainingAmount : partialModal.udhar.amount}
            </p>
            <form onSubmit={handlePartialSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">जमा की जा रही राशि (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={partialModal.udhar.remainingAmount !== undefined ? partialModal.udhar.remainingAmount : partialModal.udhar.amount}
                  value={partialModal.amount}
                  onChange={(e) => setPartialModal(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">नोट</label>
                <input
                  type="text"
                  value={partialModal.note}
                  onChange={(e) => setPartialModal(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="उदा. आधा भुगतान किया"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPartialModal({ isOpen: false, udhar: null, amount: '', note: '' })}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-xl"
                >
                  जमा करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
