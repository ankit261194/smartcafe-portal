import React, { useState, useEffect } from 'react';
import { 
  History, Printer, Download, Search, Filter, 
  Calendar, CheckCircle2, Clock, Eye, RefreshCw, 
  X, Scissors, ShieldCheck, Car, CreditCard, Award, FileText, Zap, Sparkles,
  ArrowLeft
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';

export default function RekhaOrders({ onSelectTool, onBack }) {
  const { language } = useLanguage();
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
              {language === 'hi' ? 'प्रिंट एवं ऑर्डर इतिहास' : 'Print & Order History'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'hi' ? 'सूची रिफ्रेश करें' : 'Refresh List'}</span>
        </button>
      </div>

      {/* 2. PREMIUM CSC OFFICIAL BANNER (Matches Header Emerald Theme, Pure Single Language) */}
      <div className="no-print bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-white rounded-3xl p-6 sm:p-7 shadow-md border border-emerald-600/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 text-emerald-100 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'hi' ? 'स्थाई प्रिंट एवं ऑर्डर लेजर' : 'Permanent Print & Order Ledger'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === 'hi' ? 'प्रिंट एवं ऑर्डर इतिहास' : 'Print & Order History'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {language === 'hi' 
              ? 'पोर्टल द्वारा अब तक जनरेट किए गए सभी कार्ड व PDF की स्थाई सूची। किसी भी दस्तावेज़ को 1-क्लिक में निःशुल्क रिप्रिंट करें।'
              : 'Permanent register of all cards and PDFs generated so far. Free 1-click reprints anytime without extra wallet debit.'
            }
          </p>
        </div>

        <div className="bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5 text-center shrink-0">
          <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">
            {language === 'hi' ? 'कुल रिकॉर्ड्स' : 'Total Records'}
          </span>
          <span className="text-xl font-mono font-black text-white">
            {filteredOrders.length}
          </span>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="no-print bg-white dark:bg-[#0c162c] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'ऑर्डर ID, गाड़ी नंबर, पैन, आधार, मोबाइल या नाम खोजें...' : 'Search by Order ID, Vehicle No, PAN, Aadhaar, Mobile or Name...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070e1b] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-[#070e1b] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">{language === 'hi' ? 'सभी e-District सेवाएं' : 'All e-District Services'}</option>
            <option value="edistrictSlip">{language === 'hi' ? 'e-District सत्यापन पर्ची' : 'e-District Verification'}</option>
            <option value="declaration">{language === 'hi' ? 'स्वप्रमाणित घोषणा पत्र' : 'Self Declaration'}</option>
          </select>
        </div>

      </div>

      {/* 4. Orders Table */}
      <div className="no-print bg-white dark:bg-[#0c162c] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <span>{language === 'hi' ? 'इतिहास लोड हो रहा है...' : 'Loading history...'}</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p>{language === 'hi' ? 'कोई ऑर्डर नहीं मिला।' : 'No orders found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-black border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">{language === 'hi' ? 'ऑर्डर विवरण' : 'Order Details'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'कार्ड / संदर्भ संख्या' : 'Card / Ref Number'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'ग्राहक' : 'Customer'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'दिनांक एवं समय' : 'Date & Time'}</th>
                  <th className="p-3.5">{language === 'hi' ? 'शुल्क' : 'Fee'}</th>
                  <th className="p-3.5 text-right">{language === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredOrders.map((order) => {
                  const Icon = getServiceIcon(order.serviceType);
                  return (
                    <tr key={order.id || order.orderId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {order.docTitle || order.serviceTitle || (language === 'hi' ? 'डिजिटल सेवा' : 'Digital Service')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              {order.id || order.orderId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-black text-emerald-800 dark:text-amber-400 text-xs">
                        {order.refNumber || order.vehicleNumber || '-'}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {order.customerName || (language === 'hi' ? 'नागरिक' : 'Citizen')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {order.customerPhone || '-'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{order.retailFee || 0}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveReprintOrder(order)}
                          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 shadow-sm transition cursor-pointer"
                          title={language === 'hi' ? '1-क्लिक में बिना वॉलेट चार्ज के खोलें' : 'Open 1-click reprint without wallet debit'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? '🖨️ रिप्रिंट' : '🖨️ Reprint'}</span>
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

      {/* 5. 1-CLICK FREE REPRINT MODAL PREVIEW */}
      {activeReprintOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c162c] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            
            <div className="no-print flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {language === 'hi' ? '1-क्लिक निःशुल्क रिप्रिंट' : '1-Click Free Reprint'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeReprintOrder.docTitle || activeReprintOrder.serviceTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveReprintOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print canvas */}
            <div className="p-4 bg-slate-50 dark:bg-[#070e1b] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
              <div className="text-xs text-slate-600 dark:text-slate-300 text-center">
                {language === 'hi' ? 'संदर्भ संख्या:' : 'Reference Number:'}{' '}
                <strong className="font-mono text-emerald-800 dark:text-amber-400">{activeReprintOrder.refNumber || activeReprintOrder.vehicleNumber}</strong>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-sm">
                <QRCodeSVG value={`ORDER:${activeReprintOrder.id}|REF:${activeReprintOrder.refNumber || activeReprintOrder.vehicleNumber}`} size={120} />
              </div>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                {language === 'hi' ? 'मूल जनरेशन दिनांक:' : 'Original Generation Date:'}{' '}
                {new Date(activeReprintOrder.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}
              </div>
            </div>

            {/* Actions */}
            <div className="no-print flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveReprintOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handlePrintModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'hi' ? '🖨️ अभी प्रिंट निकालें' : '🖨️ Print Now'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
