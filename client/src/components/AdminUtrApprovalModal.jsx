import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, RefreshCw, QrCode, Smartphone, 
  IndianRupee, Clock, AlertCircle, ShieldCheck, Check
} from 'lucide-react';
import { authFetch } from '../utils/api';

export default function AdminUtrApprovalModal({ 
  isOpen, 
  onClose, 
  selectedCafe,
  onUtrApproved 
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [viewingSlipUrl, setViewingSlipUrl] = useState('');

  const cafeId = selectedCafe?.id || '';

  const fetchUtrRequests = async () => {
    if (!cafeId) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/utr-requests`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUtrRequests();
    }
  }, [isOpen, cafeId]);

  const handleAction = async (utrId, action) => {
    setActionInProgress(utrId);
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/utr-requests/${utrId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchUtrRequests();
        if (onUtrApproved) onUtrApproved();
        alert(action === 'approve' ? '✅ UTR स्वीकृत! ग्राहक वॉलेट में राशि जमा हो गई और कैशबुक में दर्ज हुई।' : 'UTR अस्वीकृत कर दिया गया।');
      }
    } catch (err) {
      console.error(err);
      alert('कार्रवाई करने में त्रुटि आई।');
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isOpen) return null;

  const pendingList = requests.filter(r => r.status === 'pending');
  const pastList = requests.filter(r => r.status !== 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <QrCode className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                ग्राहक UPI UTR सत्यापन व अप्रूवल कतार
              </h3>
              <p className="text-[11px] text-emerald-100">
                0% कमीशन डायरेक्ट UPI • 12-अंकीय UTR पुष्टि
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white font-black text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-800 text-sm">
              लंबित टॉप-अप अनुरोध ({pendingList.length})
            </span>
            <button 
              onClick={fetchUtrRequests}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>

          {/* Pending Requests */}
          {pendingList.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400">
              वर्तमान में कोई लंबित ग्राहक UTR सत्यापन अनुरोध नहीं है।
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((r) => (
                <div 
                  key={r.id}
                  className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{r.customerName}</span>
                      <span className="text-slate-500 font-mono">({r.customerPhone})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">जमा UTR:</span>
                      <span className="font-mono font-black text-xs text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 tracking-wider">
                        {r.utr}
                      </span>
                      {r.screenshotUrl && (
                        <button
                          type="button"
                          onClick={() => setViewingSlipUrl(r.screenshotUrl)}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition"
                        >
                          <span>📸 पर्ची देखें</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400">
                      समय: {new Date(r.createdAt).toLocaleString('hi-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">अनुरोधित राशि</span>
                      <span className="text-xl font-black text-emerald-700">₹{r.amount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={actionInProgress === r.id}
                        onClick={() => handleAction(r.id, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 transition shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>स्वीकारें (Approve)</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionInProgress === r.id}
                        onClick={() => handleAction(r.id, 'reject')}
                        className="bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>अस्वीकार</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past history */}
          {pastList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-700 block">हाल के सत्यापित UTR:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pastList.map((r) => (
                  <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800">{r.customerName} ({r.customerPhone})</span>
                      <span className="font-mono text-slate-500 ml-2">UTR: {r.utr}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">₹{r.amount}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {r.status === 'approved' ? 'स्वीकृत' : 'अस्वीकृत'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2 rounded-xl text-xs transition"
          >
            बंद करें (Done)
          </button>
        </div>

      </div>

      {/* Slip Preview Modal */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-slate-800">ग्राहक भुगतान रसीद पर्ची</span>
              <button 
                onClick={() => setViewingSlipUrl('')} 
                className="text-slate-400 hover:text-slate-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border bg-slate-100 flex items-center justify-center">
              <img src={viewingSlipUrl} alt="Bank Receipt Slip" className="max-w-full max-h-[65vh] object-contain" />
            </div>
            <button
              onClick={() => setViewingSlipUrl('')}
              className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs"
            >
              वापस जाएं
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
