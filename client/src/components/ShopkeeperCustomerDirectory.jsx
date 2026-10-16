import React, { useState, useEffect } from 'react';
import { 
  Users, Search, RefreshCw, Sparkles, Phone, MessageSquare, 
  ExternalLink, Copy, CheckCircle2, Clock, ShieldCheck, AlertCircle,
  Radio, X, Check, ArrowRight
} from 'lucide-react';
import { playChime } from '../utils/audio';

export default function ShopkeeperCustomerDirectory({ selectedCafe }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // OTP Fetch Modal State
  const [otpModalCustomer, setOtpModalCustomer] = useState(null);
  const [otpStatus, setOtpStatus] = useState('listening'); // 'listening', 'received', 'expired'
  const [latestOtpData, setLatestOtpData] = useState(null);
  const [countdown, setCountdown] = useState(90);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const cafeId = selectedCafe?.id || 'CAFE-101';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cafes/${cafeId}/customers`);
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [cafeId]);

  // Handle Start Live OTP Fetch
  const handleStartOtpFetch = async (cust) => {
    setOtpModalCustomer(cust);
    setOtpStatus('listening');
    setLatestOtpData(null);
    setCountdown(90);
    setCopiedOtp(false);

    try {
      // Notify server of active fetch request
      await fetch('/api/otp/request-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: cust.phone,
          cafeId: cafeId,
          requestedBy: 'operator'
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Poll for OTP when modal is active
  useEffect(() => {
    if (!otpModalCustomer || otpStatus !== 'listening') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOtpStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/otp/poll-latest?phone=${otpModalCustomer.phone}&cafeId=${cafeId}`);
        const data = await res.json();
        if (data.success && data.status === 'received' && data.otp) {
          setLatestOtpData(data);
          setOtpStatus('received');
          playChime();
          clearInterval(pollInterval);
          clearInterval(timer);
        }
      } catch (err) {
        // silent retry
      }
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [otpModalCustomer, otpStatus, cafeId]);

  const handleCopyOtp = (otpText) => {
    navigator.clipboard.writeText(otpText);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.lastService && c.lastService.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
            <span>सुरक्षित टेनेंट-आइसोलेशन (Strict Shop Isolation)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-yellow-300" />
            <span>मेरे ग्राहक एवं 1-क्लिक ऑन-डिमांड OTP डेस्क</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            आपकी दुकान (<strong className="text-white">{selectedCafe?.shopName || 'डिजिटल सेवा केंद्र'}</strong>) से जुड़े सभी पंजीकृत ग्राहकों की सूची। सरकारी सेवाओं (Aadhaar, e-District, VAHAN, PAN) के लिए यहाँ से 1-क्लिक में लाइव OTP प्राप्त करें।
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchCustomers}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश (Sync)</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-[#0f1d36] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ग्राहक का नाम, मोबाइल अथवा सेवा खोजें..."
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#0b1528] text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 self-end sm:self-auto">
          <span>कुल पंजीकृत ग्राहक: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{customers.length}</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SMS OTP सिंक ब्रिज सक्रिय</span>
          </span>
        </div>
      </div>

      {/* Customer Table / Cards */}
      <div className="bg-white dark:bg-[#0f1d36] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>ग्राहक डेटा लोड हो रहा है...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-bold">कोई ग्राहक रिकॉर्ड नहीं मिला।</p>
            <p className="text-[11px] text-slate-400">जब ग्राहक आपकी दुकान के QR स्टैंडी अथवा प्रिंट/फॉर्म से जुड़ेंगे, वे यहाँ स्वतः दिखने लगेंगे।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b1528] text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3.5 px-4">ग्राहक विवरण</th>
                  <th className="py-3.5 px-4">मोबाइल नंबर</th>
                  <th className="py-3.5 px-4">अंतिम सेवा</th>
                  <th className="py-3.5 px-4">कुल कार्य</th>
                  <th className="py-3.5 px-4">ऐप स्थिति</th>
                  <th className="py-3.5 px-4 text-right">कार्रवाई (Live Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.phone} className="hover:bg-slate-50/80 dark:hover:bg-[#091322] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-xs shrink-0">
                          {cust.name ? cust.name.charAt(0).toUpperCase() : 'ग'}
                        </div>
                        <div>
                          <span>{cust.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            सक्रिय: {new Date(cust.lastActive).toLocaleDateString('hi-IN')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-mono text-slate-700 dark:text-slate-300 font-bold">
                        <span>{cust.phone}</span>
                        <a
                          href={`https://wa.me/91${cust.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp पर मैसेज करें"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {cust.lastService || 'सामान्य'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {cust.totalOrders || 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>🟢 ऐप कनेक्टेड</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleStartOtpFetch(cust)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>⚡ OTP निकालें</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LIVE OTP LISTENING MODAL */}
      {otpModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  ⚡
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    लाइव सरकारी OTP सिंक डेस्क
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ग्राहक: <strong className="text-slate-900 dark:text-white">{otpModalCustomer.name}</strong> ({otpModalCustomer.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Listening / Radar State */}
            {otpStatus === 'listening' && (
              <div className="py-6 text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse"></div>
                  <div className="relative w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                    <Radio className="w-6 h-6 animate-spin" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    सरकारी SMS OTP की प्रतीक्षा कर रहे हैं...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    जैसे ही e-District, Aadhaar अथवा VAHAN पोर्टल से ग्राहक के फोन पर OTP आएगा, वह यहाँ सीधे दिखाई दे जाएगा।
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>शेष समय: <strong>{countdown}s</strong></span>
                </div>
              </div>
            )}

            {/* OTP Received State */}
            {otpStatus === 'received' && latestOtpData && (
              <div className="py-4 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                    सरकारी OTP प्राप्त हुआ ({latestOtpData.sender})
                  </span>
                  <div className="my-3 py-3 px-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-3xl sm:text-4xl font-mono font-black text-emerald-600 dark:text-emerald-300 tracking-widest shadow-inner">
                    {latestOtpData.otp}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    प्राप्त समय: {new Date(latestOtpData.receivedAt).toLocaleTimeString('hi-IN')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(latestOtpData.otp)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    {copiedOtp ? <CheckCircle2 className="w-4 h-4 text-yellow-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedOtp ? 'कॉपी हो गया! (Copied)' : '📋 1-क्लिक में OTP कॉपी करें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpModalCustomer(null)}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    पूर्ण (Done)
                  </button>
                </div>

                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] text-left flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>यदि आपने e-District क्रोम एक्सटेंशन ऑन रखा है, तो यह OTP सरकारी बॉक्स में स्वतः टाइप भी हो चुका है!</span>
                </div>
              </div>
            )}

            {/* Expired State */}
            {otpStatus === 'expired' && (
              <div className="py-6 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm">
                    समय समाप्त (Timeout)
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    90 सेकंड में कोई नया सरकारी OTP प्राप्त नहीं हुआ। कृपया सरकारी पोर्टल से 'Resend OTP' दबाएं।
                  </p>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleStartOtpFetch(otpModalCustomer)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>पुनः प्रयास करें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpModalCustomer(null)}
                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    बंद करें
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
