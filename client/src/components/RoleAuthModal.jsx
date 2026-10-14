import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Smartphone, Crown, Monitor, Key, AlertCircle, CheckCircle2, MessageCircle, Store, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RoleAuthModal({
  isOpen,
  type = 'customer', // 'customer', 'cafe', or 'superadmin'
  onClose,
  onSuperAdminSuccess,
  onCafeSuccess,
  onCustomerSuccess,
  onOpenKyc,
  selectedCafe
}) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  // Toggle between 'login' and 'signup'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState(type === 'cafe' ? 'cafe' : 'citizen'); // 'citizen' or 'cafe'

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(selectedCafe?.phone || '');
  const [loginPassword, setLoginPassword] = useState('');

  // Super Admin state
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // WhatsApp Password Reset Handler (Admin Number: 8533955333)
  const handleForgotPasswordWhatsApp = () => {
    const targetPhone = (loginIdentifier || signupPhone || '').trim();
    const phoneText = targetPhone ? ` ${targetPhone}` : '';
    const message = `नमस्ते एडमिन जी, मैं स्मार्ट कैफ़े पोर्टल का पासवर्ड भूल गया हूँ। मेरा रजिस्टर्ड मोबाइल नंबर${phoneText} है। कृपया मेरा पासवर्ड रीसेट करने में मदद करें।`;
    const whatsappUrl = `https://wa.me/918533955333?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 1. Super Admin Master Login
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
        if (onSuperAdminSuccess) onSuperAdminSuccess(data);
        onClose();
      } else {
        setErrorMsg(data.error || (isHi ? 'अमान्य मास्टर पासवर्ड!' : 'Invalid Master Password!'));
      }
    } catch (err) {
      setErrorMsg(isHi ? 'सर्वर से जुड़ने में समस्या आई।' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct Sign Up (Name, Mobile, Password, Role)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhone = signupPhone.replace(/\D/g, '').slice(-10);
    const cleanPass = signupPassword.trim();
    const cleanName = signupName.trim();

    if (!cleanName) {
      setErrorMsg(isHi ? 'कृपया अपना पूरा नाम अथवा दुकान का नाम दर्ज करें।' : 'Please enter your full name or shop name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg(isHi ? 'कृपया ठीक 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg(isHi ? 'कृपया सुरक्षित पासवर्ड दर्ज करें।' : 'Please enter a password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          shopName: cleanName,
          phone: cleanPhone,
          password: cleanPass,
          role: signupRole
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(isHi ? 'खाता सफलतापूर्वक बन गया! लॉगिन हो रहा है...' : 'Account created successfully! Logging in...');
        
        // Persistent Auto-Login storage
        localStorage.setItem('smartcafe_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('smartcafe_token', data.token);

        if (data.user.role === 'cafe') {
          localStorage.setItem('cafe_auth', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('cafe_token', data.token);
          if (onCafeSuccess) onCafeSuccess(data.user, false);
        } else {
          localStorage.setItem('cybercafe_customer', JSON.stringify({ ...data.user, token: data.token }));
          if (onCustomerSuccess) onCustomerSuccess(data.user);
        }

        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.error || (isHi ? 'पंजीकरण विफल रहा।' : 'Registration failed.'));
      }
    } catch (err) {
      setErrorMsg(isHi ? 'सर्वर से संपर्क नहीं हो पाया।' : 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Universal User Login (Phone + Password)
  const handleUniversalLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanId = loginIdentifier.replace(/\D/g, '').slice(-10);
    const cleanPass = loginPassword.trim();

    if (!cleanId || cleanId.length !== 10) {
      setErrorMsg(isHi ? 'कृपया 10-अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a 10-digit mobile number.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg(isHi ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanId,
          identifier: cleanId,
          password: cleanPass,
          pin: cleanPass
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Persistent Auto-Login storage
        localStorage.setItem('smartcafe_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('smartcafe_token', data.token);

        if (data.user.role === 'cafe' || data.cafe) {
          const cafeObj = data.cafe || data.user;
          localStorage.setItem('cafe_auth', JSON.stringify(cafeObj));
          if (data.token) localStorage.setItem('cafe_token', data.token);
          if (onCafeSuccess) onCafeSuccess(cafeObj, false);
        } else {
          localStorage.setItem('cybercafe_customer', JSON.stringify({ ...data.user, token: data.token }));
          if (onCustomerSuccess) onCustomerSuccess(data.user);
        }
        onClose();
      } else {
        setErrorMsg(data.error || (isHi ? 'अमान्य मोबाइल नंबर अथवा पासवर्ड।' : 'Invalid phone number or password.'));
      }
    } catch (err) {
      setErrorMsg(isHi ? 'सर्वर से संपर्क नहीं हो पाया।' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        
        {/* SUPER ADMIN MASTER AUTH */}
        {type === 'superadmin' ? (
          <div>
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {isHi ? 'सुपर एडमिन सुरक्षा सत्यापन' : 'Super Admin Authentication'}
                  </h3>
                  <p className="text-[11px] text-amber-100">
                    {isHi ? 'SaaS केंद्रीय व्यवस्थापक कंट्रोल रूम' : 'Master Central Control Room'}
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

              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl text-amber-900 dark:text-amber-200 font-medium">
                🔒 <strong>{isHi ? 'सुरक्षा सूचना:' : 'Security Note:'}</strong> {isHi ? 'सुपर एडमिन क्षेत्र केवल प्लेटफ़ॉर्म स्वामी के लिए आरक्षित है।' : 'Restricted to Master Platform Owner only.'}
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isHi ? 'मास्टर एडमिन पासवर्ड (Master Password) *' : 'Master Admin Password *'}
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={isHi ? 'सुरक्षित मास्टर पासवर्ड दर्ज करें' : 'Enter master password'}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-black text-yellow-400 font-extrabold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <Key className="w-4 h-4 text-yellow-400" />
                <span>{loading ? (isHi ? 'सत्यापन जारी...' : 'Verifying...') : (isHi ? 'सुपर एडमिन अनलॉक करें ➔' : 'Unlock Super Admin ➔')}</span>
              </button>
            </form>
          </div>
        ) : (
          /* UNIVERSAL AUTH (LOGIN & SIGNUP WITH PERSISTENT AUTO-LOGIN) */
          <div>
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  {authMode === 'signup' ? <Sparkles className="w-5 h-5 text-yellow-300" /> : <Lock className="w-5 h-5 text-emerald-300" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    {authMode === 'signup' ? (isHi ? 'नया खाता बनाएं (Instant Signup)' : 'Create New Account') : (isHi ? 'स्मार्ट पोर्टल लॉगिन' : 'Smart Portal Login')}
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    {isHi ? 'डिजिटल सेवा केंद्र एवं B2B साइबर कैफे पोर्टल' : 'Digital Seva Kendra & B2B Cyber Cafe Portal'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white font-black text-xl">✕</button>
            </div>

            {/* Mode Switcher Tabs (Login vs Signup) */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isHi ? 'लॉगिन करें (Log In)' : 'Log In'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isHi ? 'नया खाता बनाएं (Sign Up)' : 'Sign Up'}</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleUniversalLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isHi ? '10-अंकीय मोबाइल नंबर (Mobile No) *' : '10-Digit Mobile Number *'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength="10"
                        required
                        autoFocus
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value.replace(/\D/g, ''))}
                        placeholder={isHi ? 'अपना 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Enter 10-digit mobile number'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isHi ? 'पासवर्ड (Password) *' : 'Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Forgot Password via WhatsApp */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPasswordWhatsApp}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-1.5 transition underline hover:no-underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isHi ? 'पासवर्ड भूल गए? एडमिन से WhatsApp पर रीसेट करवाएं' : 'Forgot Password? Reset via WhatsApp'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? (isHi ? 'लॉगिन हो रहा है...' : 'Logging in...') : (isHi ? 'सुरक्षित लॉगिन करें ➔' : 'Secure Login ➔')}</span>
                  </button>

                  <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {isHi ? 'नया खाता बनाना चाहते हैं?' : 'Need a new account?'}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                        className="text-blue-600 dark:text-blue-400 font-black ml-1.5 hover:underline"
                      >
                        {isHi ? 'तुरंत साइनअप करें' : 'Sign up now'}
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* TAB 2: SIGNUP FORM (3 SIMPLE FIELDS + ROLE) */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Account Type Selector */}
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      {isHi ? 'खाता प्रकार चुनें (Account Role) *' : 'Select Account Role *'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('citizen')}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          signupRole === 'citizen'
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-extrabold ring-2 ring-blue-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">{isHi ? '👤 आम नागरिक' : 'Citizen'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignupRole('cafe')}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          signupRole === 'cafe'
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-extrabold ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        <Store className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs">{isHi ? '🏪 दुकानदार / VLE' : 'Shopkeeper / VLE'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. Name */}
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {signupRole === 'cafe'
                        ? (isHi ? 'दुकान का नाम व संचालक का नाम *' : 'Shop Name & Owner Name *')
                        : (isHi ? 'आपका पूरा नाम (Full Name) *' : 'Full Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder={signupRole === 'cafe' ? (isHi ? 'उदा: माँ डिजिटल सेवा केंद्र' : 'e.g. Smart Cyber Cafe') : (isHi ? 'अपना नाम दर्ज करें' : 'Enter your name')}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 2. Mobile Number */}
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isHi ? '10-अंकीय मोबाइल नंबर (Login ID) *' : '10-Digit Mobile Number (Login ID) *'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength="10"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={isHi ? '10-अंकीय मोबाइल नंबर दर्ज करें' : 'Enter 10-digit mobile number'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {isHi ? 'यही नंबर आपका लॉगिन ID रहेगा।' : 'This will be your permanent Login ID.'}
                    </span>
                  </div>

                  {/* 3. Password */}
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {isHi ? 'सुरक्षित पासवर्ड बनाएं (Password) *' : 'Create Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder={isHi ? 'अपना पासवर्ड दर्ज करें' : 'Enter password'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {isHi ? 'कोई OTP का झंझट नहीं — तुरंत खाता सक्रिय हो जाएगा।' : 'Instant activation without OTP delays.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? (isHi ? 'खाता बन रहा है...' : 'Creating...') : (isHi ? '✨ तुरंत खाता बनाएं और आगे बढ़ें ➔' : 'Create Account & Continue ➔')}</span>
                  </button>

                  <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {isHi ? 'पहले से खाता है?' : 'Already have an account?'}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                        className="text-indigo-600 dark:text-indigo-400 font-black ml-1.5 hover:underline"
                      >
                        {isHi ? 'सीधे लॉगिन करें' : 'Log in here'}
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
