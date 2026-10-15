import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, CheckCircle2, Clock, Trash2, ExternalLink, 
  Eye, RefreshCw, MessageSquare, AlertCircle, FileText, Filter,
  FolderOpen, Monitor, Volume2, Sparkles, Send, Search, X
} from 'lucide-react';
import { playChime } from '../utils/audio';

export default function AdminPrintQueue({ onUpdateCounts, selectedCafe }) {
  const [prints, setPrints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'printed', 'delivered'
  const [searchTerm, setSearchTerm] = useState('');
  const prevPendingCountRef = useRef(0);

  const fetchPrints = async () => {
    try {
      setLoading(true);
      const cafeParam = selectedCafe?.id ? `?cafeId=${selectedCafe.id}` : '';
      const res = await fetch(`/api/prints${cafeParam}`);
      const data = await res.json();
      setPrints(data);

      const currentPending = data.filter(p => p.printStatus === 'pending').length;
      // If new pending print arrived, ring chime bell!
      if (currentPending > prevPendingCountRef.current && prevPendingCountRef.current !== 0) {
        playChime();
      }
      prevPendingCountRef.current = currentPending;

      if (onUpdateCounts) onUpdateCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrints();
    // Poll every 8 seconds for new customer uploads
    const interval = setInterval(fetchPrints, 8000);
    return () => clearInterval(interval);
  }, [selectedCafe?.id]);

  const handleUpdateStatus = async (id, printStatus, paymentStatus) => {
    try {
      const body = {};
      if (printStatus) body.printStatus = printStatus;
      if (paymentStatus) body.paymentStatus = paymentStatus;

      const res = await fetch(`/api/prints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) fetchPrints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`क्या आप प्रिंट रिक्वेस्ट ${id} को हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/prints/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPrints();
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Silent Hidden-Iframe Direct Print (No download required)
  const handleIframeSilentPrint = (prnt) => {
    if (prnt.fileShredded || !prnt.filePath) {
      alert('यह फ़ाइल 24-घंटे गोपनीयता नीति या ग्राहक द्वारा सर्वर से स्थायी रूप से नष्ट (Shred) हो चुकी है।');
      return;
    }
    try {
      let iframe = document.getElementById('silent-print-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'silent-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }
      iframe.src = prnt.filePath;
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          if (prnt.printStatus === 'pending') {
            handleUpdateStatus(prnt.id, 'printed');
          }
        } catch (e) {
          console.warn('Iframe print error, falling back:', e);
          handlePrintDocument(prnt);
        }
      };
    } catch (err) {
      console.error(err);
      handlePrintDocument(prnt);
    }
  };

  // Browser Print Dialog
  const handlePrintDocument = (prnt) => {
    const printWindow = window.open(prnt.filePath, '_blank');
    if (printWindow) {
      printWindow.focus();
      if (prnt.printStatus === 'pending') {
        handleUpdateStatus(prnt.id, 'printed');
      }
    }
  };

  // 2. Open file in default Windows Application (Adobe / Word / Photo Viewer)
  const handleOpenInWindowsApp = async (prnt) => {
    try {
      const res = await fetch('/api/system/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: prnt.filePath })
      });
      const data = await res.json();
      if (data.success) {
        if (prnt.printStatus === 'pending') {
          handleUpdateStatus(prnt.id, 'printed');
        }
      } else {
        alert(data.error || 'फ़ाइल Windows में नहीं खुल सकी।');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Direct Windows Printer Spooler
  const handleWindowsDirectPrint = async (prnt) => {
    try {
      const res = await fetch('/api/system/direct-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: prnt.filePath })
      });
      const data = await res.json();
      if (data.success) {
        handleUpdateStatus(prnt.id, 'printed');
        alert('प्रिंट कमांड डिफ़ॉल्ट Windows प्रिंटर को भेज दी गई है!');
      } else {
        alert(data.error || 'प्रिंटर से कनेक्ट नहीं हो सका।');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Open Uploads Folder in Windows Explorer
  const handleOpenUploadsFolder = async () => {
    try {
      await fetch('/api/system/open-folder', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = prints.filter(p => {
    const matchesFilter = filter === 'all' || p.printStatus === filter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (p.id && p.id.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term)) ||
      (p.customerName && p.customerName.toLowerCase().includes(term)) ||
      (p.fileOriginalName && p.fileOriginalName.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = prints.filter(p => p.printStatus === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header with Stats, System Folder & Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              लाइव प्रिंट कतार (Live Print Queue)
            </h2>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                {pendingCount} पेंडिंग प्रिंट्स
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ग्राहकों द्वारा फोन से भेजी गई फाइलों को तुरंत 1-क्लिक में प्रिंट करें या Windows में खोलें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Windows Folder Button */}
          <button
            onClick={handleOpenUploadsFolder}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="कंप्यूटर में Uploads फोल्डर खोलें"
          >
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">PC फोल्डर खोलें</span>
          </button>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              सभी ({prints.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${filter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              पेंडिंग ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('printed')}
              className={`px-3 py-1.5 rounded-lg transition ${filter === 'printed' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              प्रिंटेड
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg transition ${filter === 'delivered' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              डिलीवर
            </button>
          </div>

          <button
            onClick={fetchPrints}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barcode Scanner & Rapid Counter Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 टोकन ID, मोबाइल नंबर, ग्राहक या फ़ाइल नाम खोजें या बारकोड स्कैन करें..."
            className="w-full pl-10 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              title="साफ़ करें"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shrink-0 flex items-center gap-2">
          <span>प्रिंटर रूटिंग:</span>
          <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">🎨 Epson Tank</span>
          <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">⬛ HP Laser</span>
        </div>
      </div>

      {/* Prints List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-base">
            {searchTerm ? 'खोज के अनुसार कोई प्रिंट नहीं मिला' : 'वर्तमान में कोई रिकॉर्ड नहीं है।'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm
              ? 'कृपया टोकन नंबर या मोबाइल नंबर दोबारा जांचें।'
              : 'जैसे ही कोई ग्राहक काउंटर QR स्कैन करके फाइल भेजेगा, कंप्यूटर पर ऑटोमैटिक घंटी बजेगी और फाइल यहाँ आ जाएगी।'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
            >
              खोज साफ़ करें
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prnt) => {
            const isPending = prnt.printStatus === 'pending';
            const isPrinted = prnt.printStatus === 'printed';
            const isDelivered = prnt.printStatus === 'delivered';

            return (
              <div
                key={prnt.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                  isPending
                    ? 'border-amber-400 bg-amber-50/20 shadow-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        {prnt.id}
                      </span>
                      
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        prnt.colorType === 'color' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {prnt.colorType === 'color' ? '🎨 रंगीन (Color)' : '⬛ B&W'}
                      </span>

                      {/* Printer Hardware Routing Tag */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        prnt.colorType === 'color'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}>
                        <Printer className="w-3 h-3" />
                        {prnt.colorType === 'color' ? 'Epson Color Tank' : 'HP Laser 1020'}
                      </span>

                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {prnt.copies} कॉपी • {prnt.pagesCount} पेज ({prnt.paperSize})
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {new Date(prnt.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm truncate max-w-md">
                        {prnt.fileOriginalName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>ग्राहक: <strong className="text-slate-800">{prnt.customerName}</strong></span>
                      {prnt.phone && (
                        <span>मोबाइल: <strong className="text-slate-800">{prnt.phone}</strong></span>
                      )}
                      <span>पेज रेंज: <strong>{prnt.pageRange}</strong></span>
                      <span>साइड: <strong>{prnt.sideType === 'double' ? 'दोनों तरफ' : 'एक तरफ'}</strong></span>
                      {prnt.notes && (
                        <span className="text-amber-700 font-medium">निर्देश: "{prnt.notes}"</span>
                      )}
                    </div>
                  </div>

                  {/* Middle Payment Info */}
                  <div className="text-left lg:text-right shrink-0">
                    <div className="text-lg font-black text-slate-900">
                      ₹{prnt.totalAmount}
                    </div>
                    <span className={`text-[11px] font-bold inline-block mt-0.5 px-2 py-0.5 rounded ${
                      prnt.paymentStatus === 'paid_upi' ? 'bg-emerald-100 text-emerald-800' :
                      prnt.paymentStatus === 'paid_cash' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {prnt.paymentStatus === 'paid_upi' ? 'UPI प्राप्त ✓' :
                       prnt.paymentStatus === 'paid_cash' ? 'नकद प्राप्त ✓' : 'भुगतान बाकी'}
                    </span>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {prnt.fileShredded || !prnt.filePath ? (
                      <span className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>फ़ाइल नष्ट (Shredded)</span>
                      </span>
                    ) : (
                      <>
                        {/* View Preview in Browser */}
                        <a
                          href={prnt.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
                          title="ब्राउज़र में देखें"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">देखें</span>
                        </a>

                        {/* 1-Click Direct Silent Print */}
                        <button
                          onClick={() => handleIframeSilentPrint(prnt)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                          title="बिना डाउनलोड किए 1-क्लिक में तुरंत प्रिंट निकालें"
                        >
                          <Printer className="w-4 h-4 text-yellow-300" />
                          <span>1-क्लिक डायरेक्ट प्रिंट</span>
                        </button>
                      </>
                    )}

                    {/* Print in New Tab */}
                    <button
                      onClick={() => handlePrintDocument(prnt)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      title="प्रिंट विंडो खोलें"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">प्रिंट डायलॉग</span>
                    </button>

                    {/* Windows App Open */}
                    <button
                      onClick={() => handleOpenInWindowsApp(prnt)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                      title="Windows के डिफ़ॉल्ट ऐप (Acrobat/Word) में सीधे खोलें"
                    >
                      <Monitor className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">PC में खोलें</span>
                    </button>

                    {/* Windows Direct Print */}
                    <button
                      onClick={() => handleWindowsDirectPrint(prnt)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                      title="सीधे डिफ़ॉल्ट Windows प्रिंटर पर भेजें"
                    >
                      <Printer className="w-3.5 h-3.5 text-yellow-300" />
                      <span className="hidden md:inline">Windows स्पूलर</span>
                    </button>

                    {/* Mark status */}
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(prnt.id, 'printed')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        मार्क प्रिंटेड ✓
                      </button>
                    )}

                    {isPrinted && (
                      <button
                        onClick={() => handleUpdateStatus(prnt.id, 'delivered', 'paid_cash')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        डिलीवर किया ✓
                      </button>
                    )}

                    {/* WhatsApp Notification */}
                    {prnt.phone && (
                      <a
                        href={`https://wa.me/91${prnt.phone}?text=${encodeURIComponent(`नमस्ते ${prnt.customerName} जी, आपका प्रिंटआउट (${prnt.fileOriginalName}) ${selectedCafe?.shopName || 'कैफे'} पर तैयार है। टोकन: ${prnt.id}। कुल राशि: ₹${prnt.totalAmount}। धन्यवाद!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition text-xs font-bold flex items-center gap-1.5 border border-emerald-200"
                        title="ग्राहक को WhatsApp सूचना भेजें"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span className="hidden xl:inline">WhatsApp</span>
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(prnt.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
