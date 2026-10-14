import React, { useState, useEffect } from 'react';
import { 
  Search, Save, RefreshCw, CheckCircle2, AlertCircle, ToggleLeft, 
  ToggleRight, IndianRupee, Layers, ShieldCheck, Zap, Filter
} from 'lucide-react';
import { authFetch } from '../../utils/api';

const CATEGORY_NAMES = {
  all: 'सभी 79 सेवाएं',
  aadhaar: 'आधार सेवाएं',
  pan: 'पैन कार्ड सेवाएं',
  voter: 'वोटर कार्ड',
  rc: 'वाहन व RTO',
  banking: 'बैंकिंग व UPI',
  welfare: 'कल्याणकारी व श्रम',
  utility: 'बिजली व बिल',
  telecom: 'सिम व टेलीकॉम',
  agriculture: 'एग्रीस्टैक व कृषि',
  edistrict: 'e-District व राजस्व',
  health: 'आयुष्मान व स्वास्थ्य',
  lookup: 'नंबर व डिटेल खोज',
  misc: 'अन्य टूल्स'
};

export default function Services79RatesManager({ onRatesUpdated }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/services/rates');
      if (res.ok) {
        const data = await res.json();
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
      }
    } catch (err) {
      console.error('Error fetching 79 services rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRateChange = (id, field, value) => {
    const numVal = Math.max(0, parseFloat(value) || 0);
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: numVal } : s));
  };

  const handleToggleActive = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleSaveSingle = async (service) => {
    setSavingId(service.id);
    try {
      const res = await authFetch('/api/superadmin/services/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          wholesaleRate: service.wholesaleRate,
          retailRate: service.retailRate,
          isActive: service.isActive
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg(`✅ "${service.name}" के नए रेट सफलतापूर्वक सहेजे गए!`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        if (onRatesUpdated) onRatesUpdated();
      } else {
        alert(data.error || 'रेट सेव करने में विफलता।');
      }
    } catch (err) {
      alert('सर्वर से कनेक्ट नहीं हो सका।');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await authFetch('/api/superadmin/services/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg('🎉 सभी 79 सेवाओं के नए रेट व मार्जिन सफलतापूर्वक लाइव कर दिए गए हैं!');
        setTimeout(() => setSaveSuccessMsg(''), 5000);
        if (onRatesUpdated) onRatesUpdated();
      } else {
        alert(data.error || 'रेट सेव करने में त्रुटि।');
      }
    } catch (err) {
      alert('सर्वर से कनेक्ट नहीं हो सका।');
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = !search.trim() || 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      String(s.num).includes(search) || 
      s.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-full text-xs font-black text-emerald-800 dark:text-emerald-300 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>मास्टर 79-सर्विस डायनामिक रेट व मल्टी-टियर मार्जिन इंजन</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            79 सर्विस रेट कार्ड व लाइव प्रॉफिट कंट्रोल
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            API प्रोवाइडर की बेस लागत के आधार पर दुकानदारों (Wholesale) और आम जनता (Retail) के लिए अपनी इच्छानुसार रेट तय करें। मुनाफा तुरंत ऑटो-कैलकुलेट होगा और पूरे पोर्टल पर लाइव हो जाएगा।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchRates}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'लाइव हो रहा है...' : '💾 सभी 79 रेट्स एक साथ सेव करें'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center gap-3 text-xs font-black text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="सर्विस नाम या नंबर खोजें (उदा. 9, PAN, RC)..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
          {Object.entries(CATEGORY_NAMES).map(([catKey, catLabel]) => {
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table of 79 Services */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-[#0b1528] text-slate-600 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-3 min-w-[200px]">सर्विस नाम</th>
              <th className="py-3 px-3 text-center min-w-[100px]">
                प्रदाता बेस लागत
                <span className="block text-[9px] text-slate-400 font-normal">API Cost</span>
              </th>
              <th className="py-3 px-3 min-w-[130px]">
                दुकानदार B2B रेट (₹)
                <span className="block text-[9px] text-indigo-500 dark:text-indigo-400 font-normal">Wholesale</span>
              </th>
              <th className="py-3 px-3 text-center min-w-[110px]">
                दुकानदार मार्जिन
                <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-normal">Your Profit</span>
              </th>
              <th className="py-3 px-3 min-w-[130px]">
                पब्लिक B2C रेट (₹)
                <span className="block text-[9px] text-amber-500 font-normal">Citizen Rate</span>
              </th>
              <th className="py-3 px-3 text-center min-w-[110px]">
                पब्लिक मार्जिन
                <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-normal">Your Profit</span>
              </th>
              <th className="py-3 px-3 text-center min-w-[90px]">स्टेटस</th>
              <th className="py-3 px-3 text-center min-w-[80px]">सेव</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-400">
                  कोई सर्विस नहीं मिली।
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => {
                const wholesaleProfit = (service.wholesaleRate || 0) - (service.providerCost || 0);
                const retailProfit = (service.retailRate || 0) - (service.providerCost || 0);
                const isSingleSaving = savingId === service.id;

                return (
                  <tr 
                    key={service.id} 
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                      !service.isActive ? 'opacity-50 bg-slate-100/40 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 dark:text-slate-500">
                      {service.num}
                    </td>

                    {/* Service Name & Category */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{service.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {service.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                          {service.id}
                        </span>
                      </div>
                    </td>

                    {/* Provider Base Cost */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center font-mono font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                        ₹{service.providerCost}
                      </div>
                    </td>

                    {/* Wholesale Rate Input */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-black">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={service.wholesaleRate}
                          onChange={(e) => handleRateChange(service.id, 'wholesaleRate', e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 text-xs font-black font-mono border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-[#0b1528] text-indigo-900 dark:text-indigo-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Wholesale Profit Auto-calc */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-0.5 font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                        wholesaleProfit >= 0 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {wholesaleProfit >= 0 ? '+' : ''}₹{wholesaleProfit.toFixed(1)}
                      </span>
                    </td>

                    {/* Retail Rate Input */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-400 font-black">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={service.retailRate}
                          onChange={(e) => handleRateChange(service.id, 'retailRate', e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 text-xs font-black font-mono border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-[#0b1528] text-amber-900 dark:text-amber-300 rounded-lg focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </td>

                    {/* Retail Profit Auto-calc */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-0.5 font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                        retailProfit >= 0 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {retailProfit >= 0 ? '+' : ''}₹{retailProfit.toFixed(1)}
                      </span>
                    </td>

                    {/* Active Toggle Switch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(service.id)}
                        className="inline-flex items-center gap-1 cursor-pointer transition"
                        title={service.isActive ? 'सेवा चालू है (क्लिक करके बंद करें)' : 'सेवा बंद है (क्लिक करके चालू करें)'}
                      >
                        {service.isActive ? (
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            चालू
                          </span>
                        ) : (
                          <span className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                            बंद
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Single Save Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSaveSingle(service)}
                        disabled={isSingleSaving}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                        title="यह रेट सहेजें"
                      >
                        {isSingleSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 pt-2">
        <div>
          दर्शाई गई सेवाएं: <span className="font-bold text-slate-800 dark:text-slate-200">{filteredServices.length}</span> / कुल: <span className="font-bold text-slate-800 dark:text-slate-200">{services.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            सक्रिय: {services.filter(s => s.isActive).length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            निष्क्रिय: {services.filter(s => !s.isActive).length}
          </span>
        </div>
      </div>

    </div>
  );
}
