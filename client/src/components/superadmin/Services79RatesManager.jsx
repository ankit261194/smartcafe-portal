import React, { useState, useEffect } from 'react';
import { 
  Search, Save, RefreshCw, CheckCircle2, AlertCircle, ToggleLeft, 
  ToggleRight, IndianRupee, Layers, ShieldCheck, Zap, Filter, ArrowUp
} from 'lucide-react';
import { authFetch } from '../../utils/api';
import DEFAULT_SERVICES_79 from '../../data/services_79.json';

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
  other: 'अन्य सेवाएं',
  misc: 'अन्य टूल्स'
};

export default function Services79RatesManager({ onRatesUpdated }) {
  const [services, setServices] = useState(DEFAULT_SERVICES_79);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [unsavedCount, setUnsavedCount] = useState(0);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'live', 'generator', 'coming_soon'

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/services/rates');
      if (res.ok) {
        const data = await res.json();
        if (data.services && Array.isArray(data.services) && data.services.length > 0) {
          const merged = DEFAULT_SERVICES_79.map(base => {
            const override = data.services.find(o => o.id === base.id || o.num === base.num);
            if (!override) return base;
            return {
              ...base,
              wholesaleRate: override.wholesaleRate !== undefined ? override.wholesaleRate : base.wholesaleRate,
              retailRate: override.retailRate !== undefined ? override.retailRate : base.retailRate,
              isActive: override.isActive !== undefined ? override.isActive : base.isActive
            };
          });
          setServices(merged);
          setUnsavedCount(0);
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
    setUnsavedCount(prev => prev + 1);
  };

  const handleToggleActive = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    setUnsavedCount(prev => prev + 1);
  };

  const handleSaveSingle = async (service) => {
    setSavingId(service.id);
    try {
      let res = await authFetch('/api/superadmin/services/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          wholesaleRate: service.wholesaleRate,
          retailRate: service.retailRate,
          isActive: service.isActive
        })
      });

      if (!res.ok) {
        res = await fetch('/api/services/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: service.id,
            wholesaleRate: service.wholesaleRate,
            retailRate: service.retailRate,
            isActive: service.isActive
          })
        });
      }

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg(`✅ "${service.name}" का नया रेट सफलतापूर्वक सहेजा गया!`);
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

  // MASTER 1-CLICK SAVE ALL 79 SERVICES
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      let res = await authFetch('/api/superadmin/services/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      });

      if (!res.ok) {
        res = await fetch('/api/services/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services })
        });
      }

      const data = await res.json();
      if (data.success) {
        // Also cache locally in browser as safety net
        try {
          localStorage.setItem('portal_services_79_rates', JSON.stringify(services));
        } catch (e) {}

        setUnsavedCount(0);
        setSaveSuccessMsg('🎉 बधाई! सभी 79 सेवाओं के नए रेट व मार्जिन सफलतापूर्वक डेटाबेस में लॉक और पूरे पोर्टल पर लाइव हो चुके हैं!');
        setTimeout(() => setSaveSuccessMsg(''), 6000);
        if (onRatesUpdated) onRatesUpdated();
      } else {
        alert(data.error || 'रेट सेव करने में त्रुटि आई।');
      }
    } catch (err) {
      alert('सर्वर से कनेक्ट नहीं हो सका।');
    } finally {
      setSaving(false);
    }
  };

  const liveServicesCount = services.filter(s => s.serviceType === 'live_api' && s.fulfillmentType !== 'manual_relay').length;
  const manualRelayServicesCount = services.filter(s => s.serviceType === 'manual_relay' || s.fulfillmentType === 'manual_relay').length;
  const generatorServicesCount = services.filter(s => s.serviceType === 'generator').length;
  const comingSoonServicesCount = services.filter(s => s.serviceType === 'coming_soon' || (s.isComingSoon && s.fulfillmentType !== 'manual_relay')).length;

  const filteredServices = services.filter(s => {
    if (filterTab === 'live') {
      if (s.serviceType !== 'live_api' || s.fulfillmentType === 'manual_relay') return false;
    } else if (filterTab === 'manual_relay') {
      if (s.serviceType !== 'manual_relay' && s.fulfillmentType !== 'manual_relay') return false;
    } else if (filterTab === 'generator') {
      if (s.serviceType !== 'generator') return false;
    } else if (filterTab === 'coming_soon') {
      if (s.serviceType !== 'coming_soon' && !s.isComingSoon) return false;
    }
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = !search.trim() || 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      String(s.num).includes(search) || 
      s.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative">
      
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
            नीचे टेबल में किसी भी सर्विस का थोक या ग्राहक रेट बदलें। बदलने के बाद ऊपर या नीचे दिया गया <strong>"मास्टर सेव"</strong> बटन दबाएं — सभी 79 रेट्स एक बार में सेव हो जाएंगे।
          </p>
        </div>

        {/* TOP MASTER SAVE BUTTON */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchRates}
            disabled={loading}
            className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="डेटाबेस से पुनः लोड करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50 border-2 border-emerald-400/40"
          >
            <Save className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>{saving ? 'लाइव सेव हो रहा है...' : '💾 मास्टर सेव: सभी 79 रेट्स एक साथ सहेजें'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 dark:border-emerald-600 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-100 shadow-md animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

        {/* Service Classification Filter Tabs */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-black shrink-0 border border-slate-200 dark:border-slate-700 gap-1">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterTab === 'all' 
                ? 'bg-white dark:bg-[#0f1d36] text-slate-900 dark:text-white shadow-xs font-black' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📋 सभी सेवाएं ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('live')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'live' 
                ? 'bg-emerald-600 text-white shadow-xs font-black' 
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>🟢 लाइव P4 API ({liveServicesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('manual_relay')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'manual_relay' 
                ? 'bg-purple-600 text-white shadow-xs font-black' 
                : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <span>🔄 रेखा रिले (2-4h) ({manualRelayServicesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('generator')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'generator' 
                ? 'bg-blue-600 text-white shadow-xs font-black' 
                : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            <span>🖨️ PVC जनरेटर ({generatorServicesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('coming_soon')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'coming_soon' 
                ? 'bg-amber-600 text-white shadow-xs font-black' 
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span>⏳ आगामी सेवाएं ({comingSoonServicesCount})</span>
          </button>
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

                    {/* Service Name & Category & Transparent Badges */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{service.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {service.category}
                        </span>
                        {service.fulfillmentType === 'manual_relay' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            🔄 रेखा रिले (2-4h)
                          </span>
                        ) : (service.serviceType === 'live_api' || (service.status === 'live' && !service.isComingSoon)) ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            🟢 लाइव P4 API
                          </span>
                        ) : (service.serviceType === 'generator' || service.status === 'generator') ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                            🖨️ स्मार्ट जनरेटर
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            ⏳ आगामी सेवा
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
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
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
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
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {retailProfit >= 0 ? '+' : ''}₹{retailProfit.toFixed(1)}
                      </span>
                    </td>

                    {/* Active/Inactive Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(service.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 mx-auto ${
                          service.isActive 
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>{service.isActive ? 'ON' : 'OFF'}</span>
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

      {/* BOTTOM MASTER SAVE BAR & Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          दर्शाई गई सेवाएं: <span className="font-bold text-slate-800 dark:text-slate-200">{filteredServices.length}</span> / कुल: <span className="font-bold text-slate-800 dark:text-slate-200">{services.length}</span>
          {unsavedCount > 0 && (
            <span className="ml-3 text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200">
              ⚠️ {unsavedCount} बदलाव अभी सहेजे नहीं गए हैं
            </span>
          )}
        </div>

        {/* BOTTOM MASTER BUTTON */}
        <button
          onClick={handleSaveAll}
          disabled={saving || loading}
          className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-black px-7 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50 border-2 border-emerald-400/40"
        >
          <Save className="w-5 h-5 text-amber-300" />
          <span>{saving ? 'लाइव सेव हो रहा है...' : '💾 मास्टर सेव: सभी 79 रेट्स एक साथ सहेजें'}</span>
        </button>
      </div>

      {/* FLOATING STICKY MASTER SAVE BAR (Fixed at viewport bottom when scrolling table) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 no-print pointer-events-auto">
        <div className="bg-slate-900/95 dark:bg-slate-950/95 border-2 border-emerald-500 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">💾</span>
            <div className="truncate">
              <span className="font-black text-xs sm:text-sm text-emerald-400 block leading-tight">
                मास्टर 1-क्लिक सेव
              </span>
              <span className="text-[10px] text-slate-300 truncate block">
                {unsavedCount > 0 ? `${unsavedCount} बदलाव तैयार हैं` : 'सभी 79 रेट्स एक बार में सेव करें'}
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 active:scale-95 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{saving ? 'सहेजा जा रहा है...' : '💾 मास्टर सेव करें'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
