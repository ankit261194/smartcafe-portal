import React, { useState, useEffect } from 'react';
import { 
  History, Printer, Download, Search, Filter, 
  Calendar, CheckCircle2, Clock, Eye, RefreshCw, 
  X, Scissors, ShieldCheck, Car, CreditCard, Award, FileText, Zap, Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function RekhaOrders({ onSelectTool }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeReprintOrder, setActiveReprintOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const list = await res.json();
        setOrders(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filterType !== 'all' && o.serviceType !== filterType) {
      if (filterType === 'rcDownload' && (o.serviceType === 'rc_download' || o.vehicleNumber)) {
        // match
      } else {
        return false;
      }
    }
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (o.id && o.id.toLowerCase().includes(s)) ||
      (o.orderId && o.orderId.toLowerCase().includes(s)) ||
      (o.docTitle && o.docTitle.toLowerCase().includes(s)) ||
      (o.refNumber && o.refNumber.toLowerCase().includes(s)) ||
      (o.vehicleNumber && o.vehicleNumber.toLowerCase().includes(s)) ||
      (o.customerName && o.customerName.toLowerCase().includes(s)) ||
      (o.customerPhone && o.customerPhone.includes(s))
    );
  });

  const handlePrintModal = () => {
    window.print();
  };

  const getServiceIcon = (type) => {
    if (type === 'rcDownload') return Car;
    if (type === 'panCard') return CreditCard;
    if (type === 'aadhaarCard') return ShieldCheck;
    if (type === 'voterCard') return Award;
    if (type === 'ayushmanCard') return Sparkles;
    if (type === 'rationCard') return FileText;
    if (type === 'electricityBill') return Zap;
    if (type === 'edistrictSlip') return Award;
    return FileText;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-yellow-300" />
            स्थाई प्रिंट एवं ऑर्डर लेजर
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            प्रिंट एवं ऑर्डर हिस्ट्री (Permanent Print History)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            पोर्टल द्वारा अब तक जनरेट किए गए सभी कार्ड व PDF की स्थाई सूची। किसी भी दस्तावेज़ को <strong className="text-emerald-400">1-क्लिक में निःशुल्क रिप्रिंट</strong> करें।
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश सूची</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="no-print bg-white dark:bg-[#0f1d36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ऑर्डर ID, गाड़ी नंबर, पैन, आधार, मोबाइल या नाम खोजें..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">सभी सेवाएं (All Services)</option>
            <option value="rcDownload">वाहन RC (Vehicle RC)</option>
            <option value="panCard">पैन कार्ड (PAN Card)</option>
            <option value="aadhaarCard">आधार कार्ड (Aadhaar Card)</option>
            <option value="voterCard">वोटर कार्ड (Voter Card)</option>
            <option value="ayushmanCard">आयुष्मान कार्ड (Ayushman)</option>
            <option value="rationCard">राशन पर्ची (Ration Slip)</option>
            <option value="electricityBill">बिजली बिल (Electricity Bill)</option>
            <option value="edistrictSlip">e-District सत्यापन</option>
          </select>
        </div>

      </div>

      {/* Orders Table */}
      <div className="no-print bg-white dark:bg-[#0f1d36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
            <span>इतिहास लोड हो रहा है...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>कोई ऑर्डर नहीं मिला।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">ऑर्डर विवरण</th>
                  <th className="p-3.5">कार्ड / संदर्भ संख्या</th>
                  <th className="p-3.5">ग्राहक</th>
                  <th className="p-3.5">दिनांक एवं समय</th>
                  <th className="p-3.5">शुल्क</th>
                  <th className="p-3.5 text-right">कार्रवाई (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredOrders.map((order) => {
                  const Icon = getServiceIcon(order.serviceType);
                  return (
                    <tr key={order.id || order.orderId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {order.docTitle || order.serviceTitle || 'डिजिटल सेवा'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              {order.id || order.orderId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-black text-indigo-700 dark:text-amber-400 text-xs">
                        {order.refNumber || order.vehicleNumber || '-'}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {order.customerName || 'नागरिक'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {order.customerPhone || '-'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleString('hi-IN')}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{order.retailFee || 0}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveReprintOrder(order)}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow-sm transition cursor-pointer"
                          title="1-क्लिक में बिना वॉलेट चार्ज के खोलें"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>🖨️ रिप्रिंट</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1-CLICK FREE REPRINT MODAL PREVIEW */}
      {activeReprintOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            
            <div className="no-print flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  1-क्लिक निःशुल्क रिप्रिंट (Zero Wallet Charge)
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeReprintOrder.docTitle || activeReprintOrder.serviceTitle}
                </h3>
              </div>

              <button
                onClick={() => setActiveReprintOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print canvas */}
            <div className="p-4 bg-slate-50 dark:bg-[#0b1528] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
              <div className="text-xs text-slate-600 dark:text-slate-300 text-center">
                संदर्भ संख्या: <strong className="font-mono text-indigo-700 dark:text-amber-400">{activeReprintOrder.refNumber || activeReprintOrder.vehicleNumber}</strong>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm">
                <QRCodeSVG value={`ORDER:${activeReprintOrder.id}|REF:${activeReprintOrder.refNumber || activeReprintOrder.vehicleNumber}`} size={120} />
              </div>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                मूल जनरेशन दिनांक: {new Date(activeReprintOrder.createdAt).toLocaleString('hi-IN')}
              </div>
            </div>

            {/* Actions */}
            <div className="no-print flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveReprintOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={handlePrintModal}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ अभी प्रिंट निकालें</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
