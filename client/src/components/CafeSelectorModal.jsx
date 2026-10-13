import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, MapPin, Smartphone, CheckCircle2, 
  ArrowRight, ShieldCheck, Sparkles, Navigation
} from 'lucide-react';

export default function CafeSelectorModal({ 
  isOpen, 
  onClose, 
  selectedCafe, 
  onSelectCafe,
  onOpenKyc
}) {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [activeTab, setActiveTab] = useState('nearby'); // 'code', 'nearby'

  const fetchCafes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cafes');
      const data = await res.json();
      setCafes(data);
    } catch (err) {
      console.error('Error fetching cafes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCafes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (cafe) => {
    onSelectCafe(cafe);
    onClose();
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const found = cafes.find(c => c.code.toLowerCase() === codeQuery.trim().toLowerCase());
    if (found) {
      handleSelect(found);
    } else {
      alert(`दुकान कोड "${codeQuery}" नहीं मिला। कृपया कोड जांचें या नीचे सूची से चुनें।`);
    }
  };

  const filteredCafes = cafes.filter(c => {
    const s = search.toLowerCase();
    return (
      c.shopName.toLowerCase().includes(s) ||
      (c.city && c.city.toLowerCase().includes(s)) ||
      (c.pincode && c.pincode.includes(s)) ||
      c.code.includes(s)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-blue-100">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              डिजिटल कैफे नेटवर्क
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white font-bold text-lg">✕</button>
          </div>
          <h2 className="text-xl font-black mt-2">अपना स्थानीय जन सेवा केंद्र / कैफे चुनें</h2>
          <p className="text-xs text-blue-100 mt-0.5">
            आप जिस दुकान से काम करवाना चाहते हैं, उसे कोड या पिनकोड से चुनें।
          </p>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-white/10 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('nearby')}
              className={`py-1.5 rounded-lg transition ${
                activeTab === 'nearby' ? 'bg-white text-indigo-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              📍 पिनकोड / नज़दीकी कैफे
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-1.5 rounded-lg transition ${
                activeTab === 'code' ? 'bg-white text-indigo-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              🔢 3-अंकों का दुकान कोड
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 text-xs">
          
          {/* Tab 1: Code Input */}
          {activeTab === 'code' ? (
            <form onSubmit={handleCodeSubmit} className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <label className="block font-bold text-slate-800">
                दुकानदार द्वारा दिया गया कोड दर्ज करें:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={codeQuery}
                  onChange={(e) => setCodeQuery(e.target.value)}
                  placeholder="उदा. 101 या 102"
                  className="flex-1 px-4 py-2.5 border-2 border-indigo-200 rounded-xl font-mono text-center text-base font-black tracking-widest focus:outline-hidden focus:border-indigo-600 uppercase"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  कनेक्ट करें
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 टिप: अपनी दुकान के काउंटर पर लगे पोस्टर से 3-अंकों का कोड देख सकते हैं।
              </p>
            </form>
          ) : (
            /* Tab 2: Nearby Search */
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="पिनकोड (241001), शहर (हरदोई/लखनऊ) या दुकान नाम..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 text-xs"
              />
            </div>
          )}

          {/* Current Selected Shop Badge */}
          {selectedCafe && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold block">वर्तमान चुनी गई दुकान:</span>
                  <span className="font-extrabold text-slate-900">{selectedCafe.shopName}</span>
                </div>
              </div>
              <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-300 font-black text-emerald-800 text-xs">
                #{selectedCafe.code}
              </span>
            </div>
          )}

          {/* List of Available Cafes */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {cafes.length === 0 && !loading ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="font-extrabold text-slate-800 text-sm leading-relaxed">
                  वर्तमान में कोई कैफे पंजीकृत नहीं है।
                </p>
                <p className="text-xs text-slate-500">
                  कृपया अपने नजदीकी जन सेवा केंद्र से संपर्क करें।
                </p>
                {onOpenKyc && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenKyc();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <span className="font-bold text-slate-500 text-[11px] block">
                  उपलब्ध जन सेवा केंद्र ({filteredCafes.length}):
                </span>

                {filteredCafes.map((c) => {
                  const isCurrent = selectedCafe?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(c)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-blue-50/70 border-blue-400 shadow-xs' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                          #{c.code}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs leading-snug">
                            {c.shopName}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{c.city} (पिन: {c.pincode})</span>
                            <span>•</span>
                            <span>{c.ownerName}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{isCurrent ? 'चुना हुआ' : 'चुनें'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {cafes.length > 0 && onOpenKyc && (
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKyc();
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
