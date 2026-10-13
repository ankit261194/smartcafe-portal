import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, PlusCircle, 
  Trash2, CheckCircle2, UserX, Printer, RefreshCw, 
  CreditCard, Smartphone, Banknote, Calendar, Download,
  FileSpreadsheet, MessageCircle 
} from 'lucide-react';
import { authFetch } from '../utils/api';

export default function AdminCashbook({ settings, selectedCafe }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('transactions'); // 'transactions' or 'udhar'
  const [dateFilter, setDateFilter] = useState('today'); // 'today', 'yesterday', '7days', 'month', 'all'
  
  // Custom Transaction Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' or 'upi'
  const [type, setType] = useState('income'); // 'income' or 'expense'
  const [customer, setCustomer] = useState('');

  // Udhar Form State
  const [udharName, setUdharName] = useState('');
  const [udharPhone, setUdharPhone] = useState('');
  const [udharAmount, setUdharAmount] = useState('');
  const [udharNote, setUdharNote] = useState('');

  const cafeId = selectedCafe?.id || '';

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);

  const updateOfflineCount = () => {
    try {
      const cq = JSON.parse(localStorage.getItem('offline_cashbook_queue') || '[]');
      const uq = JSON.parse(localStorage.getItem('offline_udhar_queue') || '[]');
      setOfflinePendingCount(cq.length + uq.length);
    } catch {
      setOfflinePendingCount(0);
    }
  };

  const fetchCashbook = async () => {
    if (!cafeId) {
      setData({ entries: [], udharList: [] });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await authFetch(`/api/cashbook?cafeId=${cafeId}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineQueues = async () => {
    if (!navigator.onLine || syncingOffline) return;
    setSyncingOffline(true);
    try {
      const cq = JSON.parse(localStorage.getItem('offline_cashbook_queue') || '[]');
      const remainingCq = [];
      for (const item of cq) {
        try {
          await authFetch('/api/cashbook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } catch (err) {
          remainingCq.push(item);
        }
      }
      localStorage.setItem('offline_cashbook_queue', JSON.stringify(remainingCq));

      const uq = JSON.parse(localStorage.getItem('offline_udhar_queue') || '[]');
      const remainingUq = [];
      for (const item of uq) {
        try {
          await authFetch('/api/udhar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } catch (err) {
          remainingUq.push(item);
        }
      }
      localStorage.setItem('offline_udhar_queue', JSON.stringify(remainingUq));

      updateOfflineCount();
      if (cafeId) {
        fetchCashbook();
      }
    } catch (e) {
      console.error('Offline sync failed:', e);
    } finally {
      setSyncingOffline(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueues();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updateOfflineCount();
    if (navigator.onLine) {
      syncOfflineQueues();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [cafeId]);

  useEffect(() => {
    if (cafeId) {
      fetchCashbook();
    } else {
      setData({ entries: [], udharList: [] });
      setLoading(false);
    }
  }, [cafeId]);

  const queueOfflineCashbook = (entry) => {
    try {
      const cq = JSON.parse(localStorage.getItem('offline_cashbook_queue') || '[]');
      cq.push(entry);
      localStorage.setItem('offline_cashbook_queue', JSON.stringify(cq));
    } catch (e) {
      console.error(e);
    }
    // Optimistic UI
    setData(prev => ({
      ...prev,
      entries: [
        {
          id: 'temp_' + Date.now(),
          ...entry,
          createdAt: new Date().toISOString(),
          isOfflinePending: true
        },
        ...(prev?.entries || [])
      ]
    }));
    updateOfflineCount();
  };

  const queueOfflineUdhar = (entry) => {
    try {
      const uq = JSON.parse(localStorage.getItem('offline_udhar_queue') || '[]');
      uq.push(entry);
      localStorage.setItem('offline_udhar_queue', JSON.stringify(uq));
    } catch (e) {
      console.error(e);
    }
    // Optimistic UI
    setData(prev => ({
      ...prev,
      udharList: [
        {
          id: 'temp_' + Date.now(),
          ...entry,
          status: 'pending',
          paidAmount: 0,
          createdAt: new Date().toISOString(),
          isOfflinePending: true
        },
        ...(prev?.udharList || [])
      ]
    }));
    updateOfflineCount();
  };

  // Quick 1-click Punch function
  const handleQuickPunch = async (punchTitle, punchCat, punchAmount, punchMode = 'cash') => {
    if (!cafeId) return;
    const entry = {
      cafeId,
      title: punchTitle,
      category: punchCat,
      amount: punchAmount,
      paymentMode: punchMode,
      type: 'income',
      customer: 'काउंटर वॉक-इन'
    };

    if (!navigator.onLine) {
      queueOfflineCashbook(entry);
      return;
    }

    try {
      const res = await authFetch('/api/cashbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        fetchCashbook();
      } else {
        queueOfflineCashbook(entry);
      }
    } catch (err) {
      console.warn('Network error, queued offline:', err);
      queueOfflineCashbook(entry);
    }
  };

  // Quick 1-click Expense function
  const handleQuickExpense = async (expTitle, expAmount, expCategory = 'Shop Expenses') => {
    if (!cafeId) return;
    const entry = {
      cafeId,
      title: expTitle,
      category: expCategory,
      amount: parseFloat(expAmount),
      paymentMode: 'cash',
      type: 'expense',
      customer: 'दुकान खर्च'
    };

    if (!navigator.onLine) {
      queueOfflineCashbook(entry);
      return;
    }

    try {
      const res = await authFetch('/api/cashbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        fetchCashbook();
      } else {
        queueOfflineCashbook(entry);
      }
    } catch (err) {
      console.warn('Network error, queued offline:', err);
      queueOfflineCashbook(entry);
    }
  };

  // Partial Payment State & Handler
  const [partialModal, setPartialModal] = useState({ isOpen: false, udhar: null, amount: '', note: '' });

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
        fetchCashbook();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCustomEntry = async (e) => {
    e.preventDefault();
    if (!title || !amount || !cafeId) return;

    const entry = {
      cafeId,
      title,
      category,
      amount: parseFloat(amount),
      paymentMode,
      type,
      customer: customer || 'काउंटर ग्राहक'
    };

    setTitle('');
    setAmount('');
    setCustomer('');

    if (!navigator.onLine) {
      queueOfflineCashbook(entry);
      return;
    }

    try {
      const res = await authFetch('/api/cashbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        fetchCashbook();
      } else {
        queueOfflineCashbook(entry);
      }
    } catch (err) {
      console.warn('Network error, queued offline:', err);
      queueOfflineCashbook(entry);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await authFetch(`/api/cashbook/${id}`, { method: 'DELETE' });
      fetchCashbook();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUdhar = async (e) => {
    e.preventDefault();
    if (!udharName || !udharAmount || !cafeId) return;

    const entry = {
      cafeId,
      customerName: udharName,
      phone: udharPhone,
      amount: parseFloat(udharAmount),
      note: udharNote
    };

    setUdharName('');
    setUdharPhone('');
    setUdharAmount('');
    setUdharNote('');

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
        fetchCashbook();
      } else {
        queueOfflineUdhar(entry);
      }
    } catch (err) {
      console.warn('Network error, queued offline:', err);
      queueOfflineUdhar(entry);
    }
  };

  const handleSettleUdhar = async (id, mode) => {
    try {
      await authFetch(`/api/udhar/${id}/settle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMode: mode })
      });
      fetchCashbook();
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Date Filter logic
  const getFilteredEntries = () => {
    if (!data?.entries) return [];
    const entries = [...data.entries];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    if (dateFilter === 'today') {
      return entries.filter(e => e.createdAt && e.createdAt.startsWith(todayStr));
    } else if (dateFilter === 'yesterday') {
      return entries.filter(e => e.createdAt && e.createdAt.startsWith(yesterdayStr));
    } else if (dateFilter === '7days') {
      return entries.filter(e => new Date(e.createdAt) >= sevenDaysAgo);
    } else if (dateFilter === 'month') {
      return entries.filter(e => e.createdAt && e.createdAt >= monthStartStr);
    }
    return entries;
  };

  const filteredEntries = getFilteredEntries();

  // Dynamic Metrics for the selected date range
  const dynamicStats = (() => {
    let inc = 0;
    let exp = 0;
    let cash = 0;
    let upi = 0;
    filteredEntries.forEach(e => {
      if (e.type === 'income') {
        inc += e.amount;
        if (e.paymentMode === 'upi') upi += e.amount;
        else cash += e.amount;
      } else if (e.type === 'expense') {
        exp += e.amount;
      }
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      netProfit: inc - exp,
      cashIncome: cash,
      upiIncome: upi,
      totalTransactions: filteredEntries.length,
      totalUdhar: data?.todayStats?.totalUdhar || 0
    };
  })();

  const stats = dynamicStats;
  const filterLabel = dateFilter === 'today' ? 'आज' : dateFilter === 'yesterday' ? 'कल' : dateFilter === '7days' ? '7 दिन' : dateFilter === 'month' ? 'इस माह' : 'कुल';

  return (
    <div className="space-y-6">

      {/* Offline / Sync Banner */}
      {(!isOnline || offlinePendingCount > 0) && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border ${
          !isOnline 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900' 
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${!isOnline ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
            <span>
              {!isOnline 
                ? '⚠️ ऑफलाइन मोड (Offline Mode) सक्रिय है: आप बिना इंटरनेट के भी हिसाब व उधारी जोड़ सकते हैं।' 
                : '🌐 इंटरनेट सक्रिय है।'}
              {offlinePendingCount > 0 && ` (${offlinePendingCount} प्रविष्टियां ऑफलाइन कतार में सुरक्षित हैं)`}
            </span>
          </div>
          {offlinePendingCount > 0 && isOnline && (
            <button
              onClick={syncOfflineQueues}
              disabled={syncingOffline}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingOffline ? 'animate-spin' : ''}`} />
              <span>{syncingOffline ? 'सिंक हो रहा है...' : 'अभी सिंक करें (Sync Now)'}</span>
            </button>
          )}
        </div>
      )}
      
      {/* Date Filter & 1-Click Excel CSV Export Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0 mr-1" />
          {[
            { id: 'today', label: 'आज (Today)' },
            { id: 'yesterday', label: 'कल (Yesterday)' },
            { id: '7days', label: '7 दिन (7 Days)' },
            { id: 'month', label: 'इस महीने (Month)' },
            { id: 'all', label: 'सभी (All Time)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                dateFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!cafeId) {
              alert('कृपया पहले कोई कैफ़े चुनें!');
              return;
            }
            try {
              const res = await authFetch(`/api/cashbook/export-csv?cafeId=${cafeId}&filter=${dateFilter}`);
              if (!res.ok) throw new Error('CSV डाउनलोड करने में त्रुटि!');
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Cashbook_${cafeId}_${dateFilter}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error(err);
              alert('CSV डाउनलोड विफल: ' + (err.message || 'त्रुटि'));
            }
          }}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs shrink-0 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>एक्सेल (CSV) डे-बुक डाउनलोड</span>
        </button>
      </div>

      {/* Dynamic Range Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">{filterLabel} की कुल आय</span>
          <div className="text-xl font-black text-slate-900 mt-1">₹{stats.totalIncome}</div>
          <span className="text-[10px] text-emerald-600 font-bold">{stats.totalTransactions} लेन-देन</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">नकद (Cash)</span>
          <div className="text-xl font-black text-emerald-600 mt-1">₹{stats.cashIncome}</div>
          <span className="text-[10px] text-slate-400">गल्ले में नकद</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">ऑनलाइन UPI</span>
          <div className="text-xl font-black text-blue-600 mt-1">₹{stats.upiIncome}</div>
          <span className="text-[10px] text-slate-400">बैंक खाते में</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">{filterLabel} का खर्च</span>
          <div className="text-xl font-black text-rose-600 mt-1">₹{stats.totalExpense}</div>
          <span className="text-[10px] text-slate-400">दुकान खर्च</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">शुद्ध बचत (Profit)</span>
          <div className={`text-xl font-black mt-1 ${stats.netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            ₹{stats.netProfit}
          </div>
          <span className="text-[10px] text-indigo-500 font-semibold">आय - खर्च</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">बाकी उधारी</span>
          <div className="text-xl font-black text-amber-600 mt-1">₹{stats.totalUdhar}</div>
          <span className="text-[10px] text-amber-500 font-semibold">लेना बाकी</span>
        </div>
      </div>

      {/* Quick 1-Click Punch Buttons Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-xs">⚡ त्वरित बिक्री दर्ज करें (1-Click Quick Punch):</span>
          </div>
          <span className="text-[11px] text-slate-400">क्लिक करते ही नकद बिक्री जुड़ जाएगी</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => handleQuickPunch('फोटोकॉपी (1 प्रति)', 'Xerox', 2, 'cash')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>फोटोकॉपी</span>
            <span className="text-emerald-400 font-extrabold text-sm">+₹2</span>
          </button>

          <button
            onClick={() => handleQuickPunch('B&W प्रिंट (1 पेज)', 'Print', 3, 'cash')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>B&W प्रिंट</span>
            <span className="text-emerald-400 font-extrabold text-sm">+₹3</span>
          </button>

          <button
            onClick={() => handleQuickPunch('कलर प्रिंट (1 पेज)', 'Print', 10, 'cash')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>कलर प्रिंट</span>
            <span className="text-yellow-300 font-extrabold text-sm">+₹10</span>
          </button>

          <button
            onClick={() => handleQuickPunch('पासपोर्ट साइज फोटो (8 पीस)', 'Photo', 50, 'cash')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>पासपोर्ट फोटो</span>
            <span className="text-emerald-400 font-extrabold text-sm">+₹50</span>
          </button>

          <button
            onClick={() => handleQuickPunch('लेमिनेशन (1 शीट)', 'Lamination', 20, 'cash')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>लेमिनेशन</span>
            <span className="text-emerald-400 font-extrabold text-sm">+₹20</span>
          </button>

          <button
            onClick={() => handleQuickPunch('फॉर्म सर्विस चार्ज', 'Form Fee', 100, 'cash')}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>ऑनलाइन फॉर्म</span>
            <span className="text-yellow-300 font-extrabold text-sm">+₹100</span>
          </button>
        </div>
      </div>

      {/* 1-Click Everyday Cyber Cafe Operational Expense Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-bold text-xs">⚡ दैनिक दुकान खर्च पंच (1-Click Quick Expense):</span>
          </div>
          <span className="text-[11px] text-slate-400">क्लिक करते ही दुकान खर्च गल्ले से कट जाएगा</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => handleQuickExpense('A4 फोटोकॉपी पेपर रिम', 240, 'Paper Stock')}
            className="bg-white/10 hover:bg-rose-900/40 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>A4 पेपर रिम</span>
            <span className="text-rose-300 font-extrabold text-sm">-₹240</span>
          </button>

          <button
            onClick={() => handleQuickExpense('प्रिंटर इंक बॉटल रीफिल', 350, 'Printer Ink')}
            className="bg-white/10 hover:bg-rose-900/40 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>प्रिंटर इंक</span>
            <span className="text-rose-300 font-extrabold text-sm">-₹350</span>
          </button>

          <button
            onClick={() => handleQuickExpense('लेमिनेशन पाउच पैकेट (100 पीस)', 180, 'Lamination Pouches')}
            className="bg-white/10 hover:bg-rose-900/40 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>लेमिनेशन पाउच</span>
            <span className="text-rose-300 font-extrabold text-sm">-₹180</span>
          </button>

          <button
            onClick={() => handleQuickExpense('चाय व नाश्ता', 30, 'Refreshment')}
            className="bg-white/10 hover:bg-rose-900/40 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>चाय / नाश्ता</span>
            <span className="text-rose-300 font-extrabold text-sm">-₹30</span>
          </button>

          <button
            onClick={() => handleQuickExpense('दुकान बिजली / जनरेटर पेट्रोल', 100, 'Electricity/Power')}
            className="bg-white/10 hover:bg-rose-900/40 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>बिजली / जनरेटर</span>
            <span className="text-rose-300 font-extrabold text-sm">-₹100</span>
          </button>

          <button
            onClick={() => handleQuickExpense('दुकान सफाई व विविध खर्च', 50, 'Miscellaneous')}
            className="bg-white/10 hover:bg-rose-900/40 active:scale-95 border border-white/20 py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center"
          >
            <span>विविध / सफाई</span>
            <span className="text-rose-300 font-extrabold text-sm">-₹50</span>
          </button>
        </div>
      </div>

      {/* Main Sections: Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          <button
            onClick={() => setTab('transactions')}
            className={`py-2 px-4 rounded-t-xl font-bold text-xs transition border-t border-x ${
              tab === 'transactions'
                ? 'bg-white border-slate-200 text-blue-600 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            दैनिक लेन-देन खाता ({filteredEntries.length})
          </button>

          <button
            onClick={() => setTab('udhar')}
            className={`py-2 px-4 rounded-t-xl font-bold text-xs transition border-t border-x flex items-center gap-1.5 ${
              tab === 'udhar'
                ? 'bg-white border-slate-200 text-amber-600 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>उधारी खाता (Udhar Register)</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {data?.udharList?.filter(u => !u.isSettled).length || 0}
            </span>
          </button>
        </div>

        <div className="p-6">
          
          {tab === 'transactions' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Transactions Table */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">लेन-देन विवरण ({filterLabel} - {filteredEntries.length} प्रविष्टियां)</h3>
                  <button onClick={fetchCashbook} className="text-slate-400 hover:text-slate-700">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredEntries.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      इस समयावधि ({filterLabel}) में कोई लेन-देन दर्ज नहीं है।
                    </div>
                  ) : (
                    filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg font-bold ${
                          entry.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {entry.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{entry.title}</p>
                          <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                            <span>{new Date(entry.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="capitalize">{entry.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-600">{entry.paymentMode === 'upi' ? 'ऑनलाइन UPI' : 'नकद'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-base font-black ${
                          entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {entry.type === 'income' ? '+' : '-'}₹{entry.amount}
                        </span>

                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )))}
                </div>
              </div>

              {/* Right 1 Col: Manual Entry Form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  कस्टम प्रविष्टि (Add Entry)
                </h3>

                <form onSubmit={handleAddCustomEntry} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">विवरण (Title)</label>
                    <input
                      type="text"
                      required
                      placeholder="खर्च / आय का विवरण दर्ज करें"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">राशि (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">प्रकार (Type)</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="income">आय (+) Income</option>
                        <option value="expense">खर्च (-) Expense</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">पेमेंट मोड</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cash">नकद (Cash)</option>
                        <option value="upi">ऑनलाइन UPI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">ग्राहक/सप्लायर</label>
                      <input
                        type="text"
                        placeholder="नाम (वैकल्पिक)"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-blue-500/20 mt-2"
                  >
                    खाते में जोड़ें
                  </button>
                </form>
              </div>

            </div>
          ) : (
            
            /* Udhar Register View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Udhar List (2 Cols) */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">बकाया उधारी सूची (Pending Udhar)</h3>

                <div className="space-y-2">
                  {data?.udharList?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">कोई उधारी दर्ज नहीं है। सब हिसाब चुकता है! ✓</div>
                  ) : (
                    data?.udharList?.map((u) => {
                      const remaining = u.remainingAmount !== undefined ? u.remainingAmount : (u.isSettled ? 0 : u.amount);
                      const total = u.totalAmount !== undefined ? u.totalAmount : u.amount;
                      const paid = u.paidAmount || 0;

                      return (
                        <div
                          key={u.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition ${
                            u.isSettled ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-amber-50/50 border-amber-200 shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{u.customerName}</h4>
                              {u.isSettled ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  चुकता किया गया ✓
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  बकाया: ₹{remaining}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 mt-0.5">
                              {u.phone && <span>फोन: {u.phone} • </span>}
                              <span>नोट: {u.note || 'बिना विवरण'}</span>
                              {paid > 0 && <span className="text-emerald-700 font-semibold ml-1">(कुल ₹{total} में से ₹{paid} जमा)</span>}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-lg font-black text-amber-700">₹{remaining}</span>

                            {!u.isSettled && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {u.phone && (
                                  <a
                                    href={`https://wa.me/91${u.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${u.customerName} जी, ${selectedCafe?.shopName || 'साइबर कैफे'} पर आपका ₹${remaining} बकाया है। कृपया इसे UPI ID: ${selectedCafe?.upiId || 'shop@upi'} पर भुगतान करें। धन्यवाद!`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition shadow-xs"
                                    title="WhatsApp पर तकादा मैसेज भेजें"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>तकादा</span>
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setPartialModal({ isOpen: true, udhar: u, amount: '', note: '' })}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                                >
                                  आंशिक जमा
                                </button>
                                <button
                                  onClick={() => handleSettleUdhar(u.id, 'cash')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                                >
                                  पूरा नकद
                                </button>
                                <button
                                  onClick={() => handleSettleUdhar(u.id, 'upi')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                                >
                                  पूरा UPI
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Udhar Form (1 Col) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-amber-600" />
                  नई उधारी लिखें (Add Udhar)
                </h3>

                <form onSubmit={handleAddUdhar} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">ग्राहक का नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="ग्राहक का नाम दर्ज करें"
                      value={udharName}
                      onChange={(e) => setUdharName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">मोबाइल नंबर</label>
                    <input
                      type="tel"
                      placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
                      value={udharPhone}
                      onChange={(e) => setUdharPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">उधारी राशि (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="0"
                      value={udharAmount}
                      onChange={(e) => setUdharAmount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">विवरण / किस काम की उधारी</label>
                    <input
                      type="text"
                      placeholder="उधार का कारण / विवरण दर्ज करें"
                      value={udharNote}
                      onChange={(e) => setUdharNote(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-amber-500/20 mt-2"
                  >
                    उधारी दर्ज करें
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Partial Payment Modal Dialog */}
      {partialModal.isOpen && partialModal.udhar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">
                आंशिक उधारी जमा ({partialModal.udhar.customerName})
              </h3>
              <button
                type="button"
                onClick={() => setPartialModal({ isOpen: false, udhar: null, amount: '', note: '' })}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
              <span className="text-slate-600 block">कुल बकाया राशि:</span>
              <span className="text-xl font-black text-amber-800">
                ₹{partialModal.udhar.remainingAmount !== undefined ? partialModal.udhar.remainingAmount : partialModal.udhar.amount}
              </span>
            </div>

            <form onSubmit={handlePartialSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">जमा की जाने वाली राशि (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={partialModal.udhar.remainingAmount !== undefined ? partialModal.udhar.remainingAmount : partialModal.udhar.amount}
                  value={partialModal.amount}
                  onChange={(e) => setPartialModal({ ...partialModal, amount: e.target.value })}
                  placeholder="जमा राशि दर्ज करें"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">टिप्पणी / नोट</label>
                <input
                  type="text"
                  value={partialModal.note}
                  onChange={(e) => setPartialModal({ ...partialModal, note: e.target.value })}
                  placeholder="भुगतान टिप्पणी (वैकल्पिक)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPartialModal({ isOpen: false, udhar: null, amount: '', note: '' })}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl transition shadow-sm"
                >
                  जमा दर्ज करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
