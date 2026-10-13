import React, { useState } from 'react';
import { Crown, Lock, Key, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function SuperAdminGateway({
  onLoginSuccess,
  onBackToCitizen
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPass = password.trim();

    if (!cleanPass) {
      setErrorMsg('कृपया मास्टर पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('superadmin_auth', 'true');
        if (data.token) {
          sessionStorage.setItem('superadmin_token', data.token);
        }
        onLoginSuccess(data);
      } else {
        setErrorMsg(data.error || 'अमान्य मास्टर पासवर्ड! प्रवेश अस्वीकृत।');
      }
    } catch (err) {
      setErrorMsg('सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      
      {/* Back to Citizen Portal */}
      <button
        onClick={onBackToCitizen}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>सार्वजनिक नागरिक पोर्टल पर वापस जाएं</span>
      </button>

      {/* Main Super Admin Card */}
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-7 text-slate-950">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-yellow-400 flex items-center justify-center mb-3 shadow-lg">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            केंद्रीय व्यवस्थापक लॉगिन
          </h2>
          <p className="text-xs sm:text-sm font-bold opacity-90 mt-1">
            केंद्रीय साइबर कैफे नेटवर्क • मास्टर रूट एक्सेस
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-500/60 text-rose-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-[11px] text-amber-200 leading-relaxed">
            🔒 यह अनुभाग केवल केंद्रीय नेटवर्क व्यवस्थापक के लिए आरक्षित है। प्रवेश हेतु सुरक्षित मास्टर पासवर्ड आवश्यक है।
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              मास्टर एडमिन पासवर्ड *
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="सुरक्षित मास्टर पासवर्ड दर्ज करें"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl font-mono text-sm text-yellow-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? 'सत्यापन हो रहा है...' : 'मास्टर कंसोल अनलॉक करें ➔'}</span>
          </button>

        </form>

      </div>

    </div>
  );
}
