import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Smartphone, Crown, Monitor, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RoleAuthModal({
  isOpen,
  type, // 'superadmin', 'cafe', or 'customer'
  onClose,
  onSuperAdminSuccess,
  onCafeSuccess,
  onCustomerSuccess,
  onOpenKyc,
  selectedCafe
}) {
  // Super Admin state
  const [adminPin, setAdminPin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);

  // Cafe state
  const [cafeIdentifier, setCafeIdentifier] = useState(selectedCafe?.phone || '');
  const [cafePin, setCafePin] = useState('');

  // Customer state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPin, setCustomerPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSuperAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('superadmin_auth', 'true');
        if (data.token) {
          sessionStorage.setItem('superadmin_token', data.token);
        }
        onSuperAdminSuccess(data);
        onClose();
      } else {
        setErrorMsg(data.error || 'अमान्य क्रेडेंशियल!');
      }
    } catch (err) {
      setErrorMsg('सर्वर से जुड़ने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  const handleCafeSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cafeIdentifier.trim(),
          pin: cafePin.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('cafe_auth', JSON.stringify(data.cafe));
        if (data.token) {
          localStorage.setItem('cafe_token', data.token);
        }
        localStorage.setItem('is_staff_auth', data.isStaff ? 'true' : 'false');
        onCafeSuccess(data.cafe, data.isStaff);
        onClose();
      } else {
        setErrorMsg(data.error || 'लॉगिन विफल!');
      }
    } catch (err) {
      setErrorMsg('सर्वर से जुड़ने में समस्या आई।');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhone = customerPhone.trim();
    const cleanPin = customerPin.trim();
    if (!customerName.trim()) {
      setErrorMsg('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg('कृपया ठीक 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!/^\d{4}$/.test(cleanPin)) {
      setErrorMsg('कृपया ठीक 4 अंकों का सुरक्षा पिन (Security PIN) दर्ज करें।');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          name: customerName.trim(),
          pin: cleanPin,
          cafeId: selectedCafe?.id || ''
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('cybercafe_customer', JSON.stringify({ ...data.customer, token: data.token, pin: cleanPin }));
        onCustomerSuccess(data.customer);
        onClose();
      } else {
        setErrorMsg(data.error || 'प्रोफ़ाइल सहेजने में विफल।');
      }
    } catch (err) {
      setErrorMsg('सर्वर त्रुटि!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        
        {/* SUPER ADMIN MODAL */}
        {type === 'superadmin' && (
          <div>
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    सुपर एडमिन सुरक्षा सत्यापन
                  </h3>
                  <p className="text-[11px] text-amber-100">
                    SaaS केंद्रीय व्यवस्थापक कंट्रोल पैनल
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white font-black text-xl">✕</button>
            </div>

            <form onSubmit={handleSuperAdminSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 font-medium">
                🔒 <strong>सुरक्षा सूचना:</strong> सुपर एडमिन क्षेत्र केवल प्लेटफ़ॉर्म स्वामी के लिए आरक्षित है। प्रवेश हेतु आपका मास्टर पासवर्ड अनिवार्य है।
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मास्टर एडमिन पासवर्ड (Master Password) *
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="सुरक्षित मास्टर पासवर्ड दर्ज करें"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  केंद्रीय सुपर एडमिन ऑथराइजेशन पासवर्ड
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-black text-yellow-400 font-extrabold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Key className="w-4 h-4 text-yellow-400" />
                <span>{loading ? 'सत्यापन जारी...' : 'सुपर एडमिन अनलॉक करें ➔'}</span>
              </button>
            </form>
          </div>
        )}

        {/* CAFE OPERATOR MODAL */}
        {type === 'cafe' && (
          <div>
            <div className="bg-gradient-to-r from-indigo-700 via-blue-800 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    कैफे संचालक / CSC VLE लॉगिन
                  </h3>
                  <p className="text-[11px] text-indigo-100">
                    दुकान डैशबोर्ड, प्रिंट कतार व B2B नियंत्रण
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white font-black text-xl">✕</button>
            </div>

            <form onSubmit={handleCafeSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  रजिस्टर्ड मोबाइल / VLE ID / कोड *
                </label>
                <input
                  type="text"
                  required
                  value={cafeIdentifier}
                  onChange={(e) => setCafeIdentifier(e.target.value)}
                  placeholder="10-अंकीय मोबाइल नंबर या VLE ID"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  पंजीकृत साइबर कैफे संचालक क्रेडेंशियल
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  4-अंकीय सुरक्षा पिन (Owner PIN / Staff PIN) *
                </label>
                <input
                  type="password"
                  maxLength="4"
                  required
                  value={cafePin}
                  onChange={(e) => setCafePin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center tracking-widest text-lg font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>संचालक मालिक पिन / स्टाफ पिन</span>
                  <span className="text-indigo-600 font-semibold">स्टाफ मोड ऑटो-डिटेक्ट</span>
                </div>
                <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                  💡 केवल वे संचालक लॉगिन कर सकते हैं जिन्होंने ₹299 का वार्षिक सब्सक्रिप्शन लिया है और सुपर एडमिन द्वारा स्वीकृत हैं।
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Monitor className="w-4 h-4" />
                <span>{loading ? 'सत्यापन हो रहा है...' : 'दुकान डैशबोर्ड खोलें ➔'}</span>
              </button>

              {onOpenKyc && (
                <div className="pt-2 text-center border-t border-slate-200">
                  <p className="text-slate-600 text-xs mb-1.5 font-medium">नया साइबर कैफ़े जोड़ना चाहते हैं?</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenKyc();
                    }}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>✨ नया साइबर कैफ़े जोड़ें (₹299 VLE पंजीकरण)</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* CUSTOMER PROFILE MODAL */}
        {type === 'customer' && (
          <div>
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <User className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    ग्राहक प्रोफ़ाइल व लॉगिन
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    अपना वॉलेट, फॉर्म स्थिति व प्रिंट रसीदें देखें
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white font-black text-xl">✕</button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  आपका पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="अपना पूरा नाम दर्ज करें"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  10-अंकीय मोबाइल नंबर (Phone Number) *
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  इस नंबर से आपका डिजिटल वॉलेट और फॉर्म हिस्ट्री लिंक रहेगी।
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>4-अंकीय वॉलेट सुरक्षा पिन (Security PIN) *</span>
                  <span className="text-[10px] text-blue-600 font-semibold">नया या पुराना पिन</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength="4"
                    required
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-lg tracking-widest text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  आपके डिजिटल वॉलेट बैलेंस की सुरक्षा हेतु 4 अंकों का गुप्त पिन।
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block text-[10px]">चयनित स्थानीय कैफे:</span>
                <strong className="text-slate-900 block text-xs mt-0.5">
                  {selectedCafe ? `${selectedCafe.shopName} (कोड: #${selectedCafe.code})` : 'कोई कैफे चयनित नहीं है'}
                </strong>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'सहेज रहे हैं...' : 'प्रोफ़ाइल सुरक्षित करें ➔'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
