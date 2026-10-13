import React, { useState } from 'react';
import { 
  Search, CheckCircle2, Clock, FileText, Download, 
  AlertCircle, MessageSquare, ArrowRight, ShieldCheck, RefreshCw,
  Car, ExternalLink
} from 'lucide-react';

export default function StatusTracker({ settings, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setError('कृपया टोकन नंबर (जैसे PRNT-8192 या APP-5021) या मोबाइल नंबर दर्ज करें।');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('सर्वर से डेटा प्राप्त करने में असमर्थ।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'printed':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {status === 'printed' ? 'प्रिंट तैयार है (Printed)' :
             status === 'delivered' ? 'वितरित (Delivered)' : 'सफलतापूर्वक पूर्ण (Completed)'}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            प्रक्रिया में (Processing / Under Review)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            त्रुटि / अस्वीकृत (Action Required)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            प्राप्त हुआ / कतार में (Pending Queue)
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Search Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">
          टोकन व स्टेटस ट्रैकर (Live Status)
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          अपने प्रिंटआउट या सरकारी फॉर्म की वर्तमान स्थिति जांचने के लिए टोकन नंबर या मोबाइल नंबर डालें।
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="टोकन आईडी (जैसे APP-5021) या मोबाइल नंबर"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 text-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>स्थिति देखें</span>
          </button>
        </form>

        {error && (
          <p className="text-xs text-rose-600 font-semibold mt-3">{error}</p>
        )}
      </div>

      {/* Results Area */}
      {searched && result && (
        <div className="space-y-4">
          
          {!result.found ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-base">कोई रिकॉर्ड नहीं मिला</h4>
              <p className="text-xs text-slate-500 mt-1">
                कृपया टोकन नंबर (जैसे PRNT-8192) या सही 10-अंकों का मोबाइल नंबर जांचें।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Applications Results */}
              {result.applications.map((app) => (
                <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {app.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(app.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{app.serviceName}</h3>
                      <p className="text-xs text-slate-600">आवेदक: <span className="font-semibold">{app.customerName}</span> ({app.phone})</p>
                    </div>
                    <div>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  {/* Remarks from owner */}
                  {app.remarks && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
                      <span className="font-bold block mb-0.5 text-blue-950">कैफे ऑपरेटर संदेश / स्थिति:</span>
                      <p>{app.remarks}</p>
                    </div>
                  )}

                  {/* Acknowledgment receipt if completed */}
                  {app.acknowledgmentReceipt && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 block">
                          🎉 अंतिम आवेदन रसीद / फाइनल फॉर्म तैयार है!
                        </span>
                        <p className="text-xs text-emerald-700 mt-0.5 truncate max-w-sm">
                          फ़ाइल: {app.acknowledgmentReceipt.originalName}
                        </p>
                      </div>
                      <a
                        href={app.acknowledgmentReceipt.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
                      >
                        <Download className="w-4 h-4" />
                        रसीद डाउनलोड करें
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                    <span>शुल्क: ₹{app.totalFee} ({app.paymentStatus === 'paid_upi' ? 'UPI पेड' : app.paymentStatus === 'paid_cash' ? 'नकद पेड' : 'पेंडिंग'})</span>
                    
                    {settings?.phone && (
                      <a
                        href={`https://wa.me/91${settings.phone}?text=${encodeURIComponent(`नमस्ते, मेरा टोकन नंबर ${app.id} (${app.serviceName}) है। कृपया स्थिति बताएं।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        कैफे से WhatsApp पर संपर्क करें
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Prints Results */}
              {result.prints.map((prnt) => (
                <div key={prnt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                          {prnt.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(prnt.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 truncate max-w-sm">
                        प्रिंट जॉब: {prnt.fileOriginalName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {prnt.colorType === 'bw' ? 'ब्लैक एंड व्हाइट' : 'रंगीन (Color)'} • {prnt.copies} कॉपी • {prnt.pagesCount} पेज
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(prnt.printStatus)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                    <span className="font-bold text-slate-900">कुल राशि: ₹{prnt.totalAmount}</span>
                    <span className="text-slate-500">
                      {prnt.printStatus === 'printed' ? '✅ काउंटर पर आकर प्रिंट प्राप्त करें' : '⏳ प्रिंटर कतार में है...'}
                    </span>
                  </div>
                </div>
              ))}

              {/* RC Orders Results */}
              {result.rcOrders && result.rcOrders.map((rc) => (
                <div key={rc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                          {rc.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(rc.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                        <Car className="w-4 h-4 text-indigo-600" />
                        <span>वाहन RC: {rc.vehicleNumber}</span>
                      </h3>
                      <p className="text-xs text-slate-600">
                        मालिक: <span className="font-semibold">{rc.rcData?.ownerName || 'उपलब्ध'}</span> • मॉडल: {rc.rcData?.makerModel || rc.rcData?.model || 'वाहन मॉडल'}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        RC जनरेटेड (Ready)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-700 block">चेसिस: {rc.rcData?.chassisNo || 'N/A'}</span>
                      <span className="text-[11px] text-slate-500">जारीकर्ता केंद्र: {rc.cafeShopName || 'अधिकृत डिजिटल केंद्र'}</span>
                    </div>

                    {rc.downloadUrl && (
                      <a
                        href={rc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>RC PDF डाउनलोड करें</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                    <span className="font-bold text-slate-900">शुल्क: ₹{rc.retailFee} (वॉलेट से डेबिट)</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>वाटरमार्क सहित अधिकृत प्रति</span>
                    </span>
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
