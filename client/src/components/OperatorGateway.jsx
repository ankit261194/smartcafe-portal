import React, { useState } from 'react';
import { Monitor, Lock, ShieldCheck, Sparkles, Key, AlertCircle, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';

export default function OperatorGateway({
  selectedCafe,
  onLoginSuccess,
  onOpenKyc,
  onBackToCitizen
}) {
  const [identifier, setIdentifier] = useState(selectedCafe?.phone || '');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanId = identifier.trim();
    const cleanPin = pin.trim();

    if (!cleanId) {
      setErrorMsg('कृपया पंजीकृत मोबाइल नंबर या VLE ID दर्ज करें।');
      return;
    }
    if (!cleanPin) {
      setErrorMsg('कृपया 4-अंकीय सुरक्षा पिन दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          pin: cleanPin
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('cafe_auth', JSON.stringify(data.cafe));
        if (data.token) {
          localStorage.setItem('cafe_token', data.token);
        }
        localStorage.setItem('is_staff_auth', data.isStaff ? 'true' : 'false');
        onLoginSuccess(data.cafe, data.isStaff);
      } else {
        setErrorMsg(data.error || 'लॉगिन विफल! कृपया सही मोबाइल नंबर व पिन दर्ज करें।');
      }
    } catch (err) {
      setErrorMsg('सर्वर से जुड़ने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      
      {/* Back button */}
      <button
        onClick={onBackToCitizen}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>सार्वजनिक नागरिक पोर्टल पर वापस जाएं</span>
      </button>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 via-slate-900 to-indigo-950 text-white p-6 sm:p-7">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center mb-3">
            <Monitor className="w-6 h-6 text-indigo-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            दुकानदार काउंटर प्रवेश
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            VLE संचालक एवं स्टाफ डेस्क (Operator Gateway)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              पंजीकृत मोबाइल नंबर / VLE ID / कोड *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="10-अंकीय मोबाइल नंबर या VLE ID"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              4-अंकीय सुरक्षा पिन (Owner PIN या Staff PIN) *
            </label>
            <input
              type="password"
              maxLength="4"
              inputMode="numeric"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center tracking-widest text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
              <span>मालिक पिन: पूर्ण नियंत्रण</span>
              <span className="text-indigo-600 font-semibold">स्टाफ पिन: प्रिंट व फॉर्म</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? 'सत्यापन हो रहा है...' : 'दुकान काउंटर खोलें ➔'}</span>
          </button>

          {/* New VLE Registration Card */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              क्या आप नए साइबर कैफे संचालक हैं?
            </p>
            <button
              type="button"
              onClick={onOpenKyc}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              title="नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>नया VLE लाइसेंस पंजीकरण (₹299 वार्षिक प्रो प्लान)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-slate-400">
              365 दिन असीमित 1-क्लिक प्रिंट, e-District सुइट व B2B थोक दरें
            </p>
          </div>

        </form>

      </div>

    </div>
  );
}
