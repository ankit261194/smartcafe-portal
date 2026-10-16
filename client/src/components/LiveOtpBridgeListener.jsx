import React, { useState, useEffect, useRef } from 'react';
import { BellRing, Copy, Check, X, ShieldAlert, Sparkles, Clock, Smartphone } from 'lucide-react';
import { getServerBaseUrl } from '../utils/api';

/**
 * Phase 3: Live OTP Bridge Notification Component
 * Continuously listens on the ultra-fast shop OTP bridge.
 * When a customer receives an Aadhaar / eDistrict OTP, it rings a chime and shows
 * a prominent card on the shopkeeper's screen with 1-click copy.
 */
export default function LiveOtpBridgeListener({ cafeId, isOperator = true }) {
  const [activeOtps, setActiveOtps] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const seenOtpIdsRef = useRef(new Set());
  const audioContextRef = useRef(null);

  // Play a pleasant dual-tone chime (Ding-Dong) using HTML5 Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // First tone: 587Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Second tone: 880Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  useEffect(() => {
    if (!isOperator) return;

    let isSubscribed = true;
    const effectiveCafeId = cafeId || 'CAFE-101';

    const checkLiveBridge = async () => {
      try {
        const baseUrl = getServerBaseUrl();
        const res = await fetch(`${baseUrl}/api/otp/live-bridge/${effectiveCafeId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed) return;

        if (Array.isArray(data.otps) && data.otps.length > 0) {
          // Check for newly arrived OTPs
          let hasNew = false;
          data.otps.forEach(otp => {
            if (!seenOtpIdsRef.current.has(otp.id)) {
              seenOtpIdsRef.current.add(otp.id);
              hasNew = true;
            }
          });

          if (hasNew) {
            playChime();
          }
          setActiveOtps(data.otps);
        } else {
          setActiveOtps([]);
        }
      } catch (err) {
        // Silent poll error handling
      }
    };

    checkLiveBridge();
    const interval = setInterval(checkLiveBridge, 1500); // Poll every 1.5s
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [cafeId, isOperator]);

  const handleCopyOtp = (otpRecord) => {
    if (!otpRecord?.otp) return;
    navigator.clipboard.writeText(otpRecord.otp);
    setCopiedId(otpRecord.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleMarkConsumed = async (otpId) => {
    try {
      const baseUrl = getServerBaseUrl();
      await fetch(`${baseUrl}/api/otp/mark-consumed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpId })
      });
      setActiveOtps(prev => prev.filter(o => o.id !== otpId));
    } catch (e) {
      console.error(e);
      setActiveOtps(prev => prev.filter(o => o.id !== otpId));
    }
  };

  if (!isOperator || activeOtps.length === 0) return null;

  return (
    <aside aria-label="लाइव OTP अलर्ट" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full px-3 pointer-events-none">
      {activeOtps.map((record) => (
        <div
          key={record.id}
          className="pointer-events-auto bg-slate-950 text-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 animate-bounce-short relative overflow-hidden"
        >
          {/* Top Progress / TTL indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, ((record.expiresInSec || 180) / 180) * 100)}%` }}
            />
          </div>

          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse shrink-0">
                <BellRing className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                    लाइव OTP ब्रिज
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {record.expiresInSec || 180}s शेष
                  </span>
                </div>
                <h4 className="font-black text-sm text-white mt-0.5">
                  {record.sender || 'सरकारी सेवा / UIDAI'}
                </h4>
              </div>
            </div>

            <button
              onClick={() => handleMarkConsumed(record.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="खारिज करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Customer & Service Info */}
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl mb-3 border border-slate-800">
            <span className="flex items-center gap-1 font-bold text-slate-200">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              {record.customerPhone ? `ग्राहक: ${record.customerPhone}` : 'ग्राहक मोबाइल'}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold truncate max-w-[150px]">
              {record.serviceType || 'e-District / आधार'}
            </span>
          </div>

          {/* Large Highlighted OTP */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-center mb-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-0.5">
              प्रवेश कोड / सुरक्षा OTP
            </p>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-400 select-all">
              {record.otp}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyOtp(record)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
            >
              {copiedId === record.id ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>1-क्लिक कॉपी (Copy OTP)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleMarkConsumed(record.id)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"
            >
              उपयोग हुआ ✓
            </button>
          </div>
        </div>
      ))}
    </aside>
  );
}
