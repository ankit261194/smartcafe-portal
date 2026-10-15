import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clock, RefreshCw, X, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authFetch } from '../utils/api';

export default function LiveOtpModal({
  isOpen,
  onClose,
  serviceTitle = 'सरकारी ई-सेवा',
  serviceType = '',
  txnId = '',
  phone = '',
  aadhaarNo = '',
  onVerified,
  testOtpHint = ''
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setTimer(60);
      setCanResend(false);
      setError('');
      setSuccessMsg('');
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 150);
    }
  }, [isOpen, txnId]);

  useEffect(() => {
    if (!isOpen) return;
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (!clean) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Handle full paste
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const newDigits = [...digits];
      chars.forEach((c, idx) => {
        if (index + idx < 6) newDigits[index + idx] = c;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(5, index + chars.length);
      if (inputRefs.current[nextIdx]) inputRefs.current[nextIdx].focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = digits.join('');

  const handleVerify = async () => {
    if (fullOtp.length !== 6) {
      setError('कृपया सभी 6 अंकों का OTP दर्ज करें।');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/services/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnId,
          otp: fullOtp,
          serviceType
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'अमान्य OTP! कृपया सही 6-अंकीय कोड दर्ज करें।');
      }

      setSuccessMsg('✅ OTP सत्यापन सफल!');
      setTimeout(() => {
        if (onVerified) onVerified(data);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'सत्यापन विफल हुआ।');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setError('');
    try {
      const res = await authFetch('/api/services/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          phone,
          aadhaarNo
        })
      });
      const data = await res.json();
      if (data.success) {
        setTimer(60);
        setCanResend(false);
        setDigits(['', '', '', '', '', '']);
        setSuccessMsg(data.message || 'नया OTP आपके मोबाइल पर भेजा गया!');
        setTimeout(() => setSuccessMsg(''), 4000);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (e) {
      setError('OTP पुनः भेजने में असमर्थ। कृपया प्रतीक्षा करें।');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">लाइव OTP सत्यापन</h3>
              <p className="text-xs text-slate-500">{serviceTitle || 'सुरक्षित पहचान प्रमाणीकरण'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-1">
            आधार / सेवा से लिंक आपके पंजीकृत मोबाइल नंबर पर 6-अंकीय सुरक्षा कोड (OTP) भेजा गया है।
          </p>
          {phone && (
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              मोबाइल: ******{phone.slice(-4)}
            </p>
          )}

          {testOtpHint && (
            <div className="mt-2 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-1.5 inline-block font-mono">
              परीक्षण OTP कोड: <b>{testOtpHint}</b>
            </div>
          )}

          {/* 6 Digit Input Group */}
          <div className="flex items-center justify-center gap-2 my-6">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-11 h-13 text-center text-xl font-mono font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition shadow-2xs"
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-2.5 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Timer and Resend Button */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-6 px-2">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              समय शेष: <b>00:{String(timer).padStart(2, '0')}</b>
            </span>

            <button
              type="button"
              disabled={!canResend || resending}
              onClick={handleResend}
              className={`font-bold flex items-center gap-1 transition ${
                canResend
                  ? 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>OTP पुनः भेजें</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="button"
              disabled={fullOtp.length !== 6 || loading}
              onClick={handleVerify}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>सत्यापित करें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
