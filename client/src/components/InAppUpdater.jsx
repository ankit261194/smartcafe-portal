import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, ArrowUpCircle, ShieldCheck } from 'lucide-react';
import { getServerBaseUrl } from '../utils/api';

const CURRENT_VERSION_CODE = 1; // Current installed APK version
const CURRENT_VERSION_NAME = '1.0.0';

export default function InAppUpdater() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Strictly show ONLY inside the native Android APK environment! Never show on web browsers!
    const isNativeApp = typeof window !== 'undefined' && (
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      Boolean(window.AndroidBridge) ||
      (typeof navigator !== 'undefined' && (
        navigator.userAgent.includes('SmartCafeApp') ||
        navigator.userAgent.includes('versionCode:') ||
        (navigator.userAgent.includes('Android') && navigator.userAgent.includes('wv'))
      ))
    );
    if (!isNativeApp) {
      return; // Never show to website/desktop/mobile web visitors!
    }

    // Check if dismissed in this session
    if (sessionStorage.getItem('smartcafe_update_dismissed') === 'true') {
      return;
    }

    const checkVersion = async () => {
      try {
        const baseUrl = getServerBaseUrl();
        const res = await fetch(`${baseUrl}/api/app/version`);
        if (res.ok) {
          const data = await res.json();
          // Detect installed version code if inside SmartCafeApp
          const match = typeof navigator !== 'undefined' ? navigator.userAgent.match(/versionCode:(\d+)/) : null;
          const installedCode = match ? parseInt(match[1], 10) : CURRENT_VERSION_CODE;
          
          if (data && data.versionCode > installedCode) {
            setUpdateInfo(data);
          }
        }
      } catch (err) {
        // Silently skip if network offline
      }
    };

    // Small delay so user sees the home screen first
    const timer = setTimeout(checkVersion, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('smartcafe_update_dismissed', 'true');
  };

  const handleUpdateClick = () => {
    const apkUrl = updateInfo?.apkUrl || 'https://smartcafe.sbs/CyberCafe_Portal.apk';
    window.open(apkUrl, '_blank');
  };

  if (!updateInfo || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-950/60 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                नया अपडेट उपलब्ध
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300">
                v{updateInfo.versionName || '2.0.0'}
              </span>
            </div>
            <h4 className="font-black text-sm text-white mt-0.5">
              Android APK ऑटो-अपडेट
            </h4>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          title="बाद में याद दिलाएं"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
        {updateInfo.releaseNotes || '1-क्लिक साइलेंट प्रिंट, काउंटर स्टेंडी जनरेटर, लाइव OTP सिंक ब्रिज एवं e-District ऑटो-फिलर'}
      </p>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          onClick={handleUpdateClick}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>अभी अपडेट डाउनलोड करें (1-Click Update)</span>
        </button>

        <button
          onClick={handleDismiss}
          className="bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"
        >
          बाद में
        </button>
      </div>
    </div>
  );
}
