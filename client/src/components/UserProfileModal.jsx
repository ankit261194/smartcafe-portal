import React, { useState } from 'react';
import { 
  User, Lock, KeyRound, Smartphone, ShieldCheck, CheckCircle2, 
  AlertCircle, Eye, EyeOff, Store, Wallet, Copy, LogOut, X, RefreshCw 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onUserUpdated,
  onOpenWalletModal
}) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'change_password'

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Show stored credentials
  const [showStoredPass, setShowStoredPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const phone = currentUser?.phone || '';
  const name = currentUser?.name || currentUser?.shopName || (isHi ? 'उपयोगकर्ता' : 'User');
  const role = currentUser?.role || 'citizen';
  const isCafe = role === 'cafe';
  const balance = currentUser?.balance ?? 0;
  const storedPassword = currentUser?.password || '';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword.trim()) {
      setErrorMsg(isHi ? 'कृपया अपना वर्तमान पासवर्ड अथवा पिन दर्ज करें।' : 'Please enter your current password or PIN.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg(isHi ? 'कृपया नया पासवर्ड अथवा पिन दर्ज करें।' : 'Please enter new password or PIN.');
      return;
    }
    if (newPassword.trim().length < 4) {
      setErrorMsg(isHi ? 'पासवर्ड / पिन कम से कम 4 अक्षरों का होना चाहिए।' : 'Password/PIN must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isHi ? 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(isHi ? '✅ पासवर्ड सफलतापूर्वक बदल दिया गया है!' : '✅ Password successfully updated!');
        
        // Update local session
        const updatedUser = { ...currentUser, password: newPassword.trim() };
        localStorage.setItem('smartcafe_user', JSON.stringify(updatedUser));
        if (isCafe) {
          localStorage.setItem('cafe_auth', JSON.stringify(updatedUser));
        } else {
          localStorage.setItem('cybercafe_customer', JSON.stringify(updatedUser));
        }

        if (onUserUpdated) onUserUpdated(updatedUser);

        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(data.error || (isHi ? 'पासवर्ड बदलने में त्रुटि आई।' : 'Failed to update password.'));
      }
    } catch (err) {
      setErrorMsg(isHi ? 'सर्वर से संपर्क नहीं हो सका।' : 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
              {isCafe ? <Store className="w-5 h-5 text-indigo-400" /> : <User className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">
                {isHi ? 'मेरी प्रोफ़ाइल एवं सुरक्षा' : 'My Profile & Security'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {isCafe ? (isHi ? 'दुकानदार / VLE ऑपरेटर खाता' : 'Operator VLE Account') : (isHi ? 'नागरिक खाता' : 'Citizen Account')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isHi ? '👤 खाता विवरण (Profile)' : 'Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('change_password'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'change_password'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isHi ? '🔑 पासवर्ड / पिन बदलें' : 'Change Password'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & CREDENTIALS VIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              
              {/* Profile Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{isHi ? 'नाम / दुकान:' : 'Name / Shop:'}</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">{name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{isHi ? 'मोबाइल नंबर (Login ID):' : 'Mobile (Login ID):'}</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                    <span>{phone}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(phone)}
                      className="p-1 hover:text-indigo-600 cursor-pointer"
                      title="कॉपी करें"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{isHi ? 'खाता प्रकार:' : 'Account Role:'}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    isCafe
                      ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {isCafe ? (isHi ? '🏪 दुकानदार B2B ऑपरेटर' : 'Shopkeeper B2B') : (isHi ? '👤 आम नागरिक B2C' : 'Citizen B2C')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">{isHi ? 'वॉलेट बैलेंस:' : 'Wallet Balance:'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{balance.toFixed(2)}
                    </span>
                    {onOpenWalletModal && (
                      <button
                        type="button"
                        onClick={() => { onClose(); onOpenWalletModal(); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                      >
                        {isHi ? '+ पैसे जोड़ें' : '+ Add Money'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stored Credentials Card */}
              <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black">
                    <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isHi ? 'आपका वर्तमान लॉगिन पासवर्ड / पिन' : 'Current Password / PIN'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStoredPass(!showStoredPass)}
                    className="text-amber-700 dark:text-amber-300 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {showStoredPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showStoredPass ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'देखें (Show)' : 'Show')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-300/50 dark:border-amber-700/50">
                  <span className="font-mono font-black text-sm text-slate-800 dark:text-white tracking-wider">
                    {showStoredPass ? (storedPassword || '1234') : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(storedPassword || '1234')}
                    className="p-1 hover:text-amber-600 cursor-pointer"
                    title="कॉपी करें"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  {isHi ? 'यदि आप अपना पासवर्ड बदलना चाहते हैं, तो ऊपर "🔑 पासवर्ड बदलें" टैब पर क्लिक करें।' : 'Click "Change Password" tab above to update your credentials.'}
                </p>
              </div>

              {/* Logout & Close Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { onClose(); if (onLogout) onLogout(); }}
                  className="flex-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isHi ? 'लॉगआउट करें (Logout)' : 'Logout'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  {isHi ? 'बंद करें (Close)' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD / PIN */}
          {activeTab === 'change_password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-[11px] leading-relaxed">
                ℹ️ <strong>{isHi ? 'पासवर्ड सुरक्षा:' : 'Password Security:'}</strong> {isHi ? 'अपना नया पासवर्ड किसी से साझा न करें। ऑपरेटर 4-अंकीय पिन भी रख सकते हैं।' : 'Keep your password confidential.'}
              </div>

              {/* Current Password */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isHi ? 'वर्तमान पासवर्ड / पिन (Current Password) *' : 'Current Password / PIN *'}
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder={isHi ? 'वर्तमान पासवर्ड या 4-अंकीय पिन दर्ज करें' : 'Enter current password or PIN'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isHi ? 'नया पासवर्ड / पिन बनाएं (New Password) *' : 'New Password / PIN *'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isHi ? 'नया सुरक्षित पासवर्ड या पिन बनाएं' : 'Enter new password or PIN'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {isHi ? 'नए पासवर्ड की पुष्टि करें (Confirm Password) *' : 'Confirm New Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isHi ? 'दोबारा नया पासवर्ड दर्ज करें' : 'Confirm new password'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? (isHi ? 'सुरक्षित हो रहा है...' : 'Saving...') : (isHi ? '✨ पासवर्ड सुरक्षित करें ➔' : 'Save Password ➔')}</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
