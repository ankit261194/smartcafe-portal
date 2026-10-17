import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Search, RefreshCw, Filter, Download, 
  ExternalLink, CheckCircle2, AlertTriangle, XCircle, 
  Clock, Copy, Check, FileText, ArrowRight, ShieldAlert, 
  IndianRupee, Eye, Upload, Sparkles, FolderArchive, 
  HelpCircle, ChevronRight, X, User, Phone, MapPin, 
  AlertCircle, Calendar, Hash, Wrench, Bookmark
} from 'lucide-react';
import JSZip from 'jszip';
import { authFetch } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import { generateStampedForm49APdf } from '../../utils/form49aStamper';
import Form49APreviewModal from '../pan/Form49APreviewModal';

export default function AdminPanQueue({ theme = 'light' }) {
  const { language } = useLanguage();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'under_review', 'objection', 'completed', 'rejected'
  
  // Selected Application for Drawers / Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [quickCopyApp, setQuickCopyApp] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Separate Action Modals
  const [objectionModalOpen, setObjectionModalOpen] = useState(false);
  const [objectionReason, setObjectionReason] = useState('');
  const [submittingObjection, setSubmittingObjection] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [ackNumber, setAckNumber] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  // Form 49A Preview Modal State
  const [previewPdfBlob, setPreviewPdfBlob] = useState(null);
  const [previewPdfDataUrl, setPreviewPdfDataUrl] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // 1-Click ZIP Download State
  const [zippingId, setZippingId] = useState(null);

  // Standalone Option 2 Auto-Stamper State
  const [stamperToolOpen, setStamperToolOpen] = useState(false);
  const [stamperForm, setStamperForm] = useState({
    title: 'Shri',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '',
    fatherName: '',
    mobile: '',
    email: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
    areaCode: 'KNP',
    aoType: 'W',
    rangeCode: '17',
    aoNumber: '95',
    aadhaarNumber: '',
    dobProof: '10th Marksheet'
  });
  const [stamperPhoto, setStamperPhoto] = useState(null);
  const [stamperSign, setStamperSign] = useState(null);
  const [generatingStandalone, setGeneratingStandalone] = useState(false);

  // Bookmarklet Drawer State
  const [bookmarkletOpen, setBookmarkletOpen] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH APPLICATIONS QUEUE
  // ─────────────────────────────────────────────────────────────────────────
  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const url = statusFilter === 'all' 
        ? '/api/superadmin/pan/applications' 
        : `/api/superadmin/pan/applications?status=${statusFilter}`;
      
      const res = await authFetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications || []);
      } else {
        setError(data.error || 'पैन कतार लोड करने में विफल (Failed to load applications)');
      }
    } catch (err) {
      setError(err.message || 'सर्वर से संपर्क नहीं हो सका');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  // Filtered Applications by Search Query
  const filteredApps = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase().trim();
    return applications.filter(a => {
      const idMatch = a.id?.toLowerCase().includes(q);
      const nameMatch = `${a.personal?.firstName || ''} ${a.personal?.lastName || ''}`.toLowerCase().includes(q);
      const phoneMatch = String(a.appliedBy || a.personal?.mobile || '').includes(q);
      const aadhaarMatch = String(a.identity?.aadhaarNumber || '').includes(q);
      const ackMatch = String(a.fulfillment?.ackNumber || '').includes(q);
      return idMatch || nameMatch || phoneMatch || aadhaarMatch || ackMatch;
    });
  }, [applications, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
    const objection = applications.filter(a => a.status === 'objection').length;
    const completed = applications.filter(a => a.status === 'completed').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const totalFees = applications.reduce((sum, a) => sum + (Number(a.financials?.feeCharged) || 0), 0);
    const netProfits = applications.reduce((sum, a) => sum + (Number(a.financials?.netProfit) || 0), 0);
    return { total, pending, objection, completed, rejected, totalFees, netProfits };
  }, [applications]);

  // ─────────────────────────────────────────────────────────────────────────
  // QUICK COPY HELPER
  // ─────────────────────────────────────────────────────────────────────────
  const copyToClipboard = (text, fieldKey) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(String(text));
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(''), 1500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 1-CLICK ZIP ASSET DOWNLOADER
  // ─────────────────────────────────────────────────────────────────────────
  const handleDownloadZip = async (app) => {
    setZippingId(app.id);
    try {
      const zip = new JSZip();
      const applicantName = `${app.personal?.firstName || ''}_${app.personal?.lastName || ''}`.replace(/\s+/g, '_') || 'Applicant';
      const folderName = `${app.id}_${applicantName}`;
      const folder = zip.folder(folderName);

      // 1. Applicant Metadata JSON
      folder.file('applicant_data.json', JSON.stringify(app, null, 2));

      // 2. Fetch and attach files
      const attachFile = async (url, filename) => {
        if (!url) return;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            folder.file(filename, blob);
          }
        } catch (e) {
          console.warn(`Failed to zip file ${filename}:`, e.message);
        }
      };

      await Promise.all([
        attachFile(app.documents?.photo, 'photo.jpg'),
        attachFile(app.documents?.signature, 'signature.png'),
        attachFile(app.documents?.aadhaarDoc, 'aadhaar_doc.pdf'),
        attachFile(app.documents?.dobDoc, 'dob_proof_doc.pdf'),
        attachFile(app.documents?.generatedFormPdf, 'Form49A_Stamped.pdf')
      ]);

      // If Form 49A wasn't stored on server, generate it live on client!
      if (!app.documents?.generatedFormPdf) {
        try {
          const stamped = await generateStampedForm49APdf(app);
          folder.file('Form49A_AutoStamped.pdf', stamped.pdfBytes);
        } catch {}
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert(`ZIP निर्माण त्रुटि: ${err.message}`);
    } finally {
      setZippingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW FORM 49A PREVIEW
  // ─────────────────────────────────────────────────────────────────────────
  const handleViewForm49A = async (app) => {
    try {
      const stamped = await generateStampedForm49APdf(app);
      setPreviewPdfBlob(stamped.blob);
      setPreviewPdfDataUrl(stamped.dataUrl);
      setSelectedApp(app);
      setPreviewModalOpen(true);
    } catch (err) {
      alert(`फॉर्म पूर्वावलोकन त्रुटि: ${err.message}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ACTION MODAL SUBMISSIONS (OBJECTION, REJECT, REFUND, COMPLETE)
  // ─────────────────────────────────────────────────────────────────────────
  const submitObjection = async () => {
    if (!objectionReason.trim()) {
      alert('कृपया आपत्ति का कारण अनिवार्य रूप से दर्ज करें।');
      return;
    }
    setSubmittingObjection(true);
    try {
      const res = await authFetch(`/api/superadmin/pan/applications/${selectedApp.id}/raise-objection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: objectionReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setObjectionModalOpen(false);
        setObjectionReason('');
        fetchApplications();
      } else {
        alert(data.error || 'आपत्ति दर्ज करने में विफल');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingObjection(false);
    }
  };

  const submitReject = async () => {
    if (!rejectionReason.trim()) {
      alert('कृपया निरस्तीकरण का कारण दर्ज करें।');
      return;
    }
    setSubmittingReject(true);
    try {
      const res = await authFetch(`/api/superadmin/pan/applications/${selectedApp.id}/mark-rejected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRejectModalOpen(false);
        setRejectionReason('');
        fetchApplications();
      } else {
        alert(data.error || 'आवेदन निरस्त करने में विफल');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReject(false);
    }
  };

  const submitRefund = async () => {
    setSubmittingRefund(true);
    try {
      const res = await authFetch(`/api/superadmin/pan/applications/${selectedApp.id}/issue-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRefundModalOpen(false);
        alert(`✅ रिफंड सफल! ₹${data.refundedAmount} उपयोगकर्ता वॉलेट में क्रेडिट कर दिया गया है। (Txn: ${data.refundTxnId})`);
        fetchApplications();
      } else {
        alert(data.error || 'रिफंड जारी करने में विफल');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingRefund(false);
    }
  };

  const submitComplete = async () => {
    const cleanAck = String(ackNumber).trim();
    if (!cleanAck || cleanAck.length !== 15) {
      alert('कृपया 15-अंकीय वैध Acknowledgement Number दर्ज करें।');
      return;
    }
    setSubmittingComplete(true);
    try {
      const formData = new FormData();
      formData.append('ackNumber', cleanAck);
      if (slipFile) {
        formData.append('slipPdf', slipFile);
      }

      const res = await authFetch(`/api/superadmin/pan/applications/${selectedApp.id}/complete`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompleteModalOpen(false);
        setAckNumber('');
        setSlipFile(null);
        fetchApplications();
      } else {
        alert(data.error || 'आवेदन पूर्ण करने में विफल');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComplete(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STANDALONE OPTION 2 AUTO-STAMPER SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────
  const handleGenerateStandalone = async () => {
    if (!stamperForm.lastName || !stamperPhoto || !stamperSign) {
      alert('कृपया कम से कम उपनाम, फोटो और हस्ताक्षर प्रदान करें।');
      return;
    }
    setGeneratingStandalone(true);
    try {
      const res = await generateStampedForm49APdf({
        id: `STAMP-${Date.now()}`,
        personal: {
          title: stamperForm.title,
          firstName: stamperForm.firstName,
          lastName: stamperForm.lastName,
          gender: stamperForm.gender,
          dob: stamperForm.dob || '01-01-1995',
          fatherName: stamperForm.fatherName || 'FATHER NAME',
          mobile: stamperForm.mobile,
          email: stamperForm.email
        },
        address: {
          city: stamperForm.city || 'BULANDSHAHAR',
          state: stamperForm.state,
          pincode: stamperForm.pincode || '203001'
        },
        aoCode: {
          areaCode: stamperForm.areaCode,
          aoType: stamperForm.aoType,
          rangeCode: stamperForm.rangeCode,
          aoNumber: stamperForm.aoNumber
        },
        identity: {
          aadhaarNumber: stamperForm.aadhaarNumber || '548963217458',
          dobProof: stamperForm.dobProof
        },
        photo: stamperPhoto,
        signature: stamperSign
      });

      // Trigger Direct Download
      const a = document.createElement('a');
      a.href = res.dataUrl;
      a.download = `Form49A_Standalone_${stamperForm.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert('✅ 100% डिजिटल स्टैम्प्ड फॉर्म 49A डाउनलोड हो गया!');
    } catch (err) {
      alert(`स्टैम्पिंग त्रुटि: ${err.message}`);
    } finally {
      setGeneratingStandalone(false);
    }
  };

  // Bookmarklet JavaScript Code
  const bookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='https://smartcafe.sbs/tools/pansuvidha_bridge.js?t='+Date.now();document.body.appendChild(s);})();`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Controls */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                पैन कार्ड प्रबंधन डेस्क (Form 49A Management Console)
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Live
              </span>
            </div>
            <p className="text-xs text-slate-300">
              PanSuvidha / UTIITSL / Protean NSDL • 1-क्लिक ऑटो-फिल ब्रिज • स्वतंत्र रिफंड इंजन
            </p>
          </div>
        </div>

        {/* Action Header Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setStamperToolOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/15 transition cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-300" />
            <span>स्टैंडअलोन 49A स्टैम्पर</span>
          </button>

          <button
            type="button"
            onClick={() => setBookmarkletOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span>PanSuvidha 1-Click ब्रिज</span>
          </button>

          <button
            type="button"
            onClick={fetchApplications}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">कुल आवेदन (Total)</span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{stats.total}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">कतार में (Pending)</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{stats.pending}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 block">आपत्ति (Objection)</span>
          <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 block">{stats.objection}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">पूर्ण (Completed)</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.completed}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">निरस्त (Rejected)</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 block">{stats.rejected}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block">कुल राजस्व / लाभ</span>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 block">₹{stats.totalFees} <span className="text-xs font-bold text-emerald-600">(+₹{stats.netProfits})</span></span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', label: 'सभी (All)' },
            { id: 'pending', label: 'कतार में (Pending)' },
            { id: 'under_review', label: 'पुनः प्रस्तुत (Under Review)' },
            { id: 'objection', label: 'आपत्ति (Objection)' },
            { id: 'completed', label: 'पूर्ण (Completed)' },
            { id: 'rejected', label: 'निरस्त (Rejected)' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम, मोबाइल, आधार या Ack नंबर खोजें..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">पैन कार्ड कतार लोड हो रही है...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">कोई आवेदन नहीं मिला (No applications found)</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">आवेदन आईडी व तिथि</th>
                  <th className="py-3 px-4">आवेदक विवरण</th>
                  <th className="py-3 px-4">AO कोड / पता</th>
                  <th className="py-3 px-4">शुल्क / रिफंड</th>
                  <th className="py-3 px-4">स्थिति (Status)</th>
                  <th className="py-3 px-4 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.map((app) => {
                  const applicantName = `${app.personal?.firstName || ''} ${app.personal?.lastName || ''}`.trim() || 'आवेदक';
                  const dateStr = new Date(app.timestamps?.createdAt || Date.now()).toLocaleDateString('en-GB');

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      
                      {/* Column 1: ID & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-slate-900 dark:text-white block">
                          {app.id}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {dateStr} • {app.role === 'cafe_operator' ? '🏪 B2B VLE' : '👤 B2C'}
                        </span>
                      </td>

                      {/* Column 2: Personal Details */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {app.personal?.title || ''} {applicantName}
                        </span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>📱 {app.appliedBy || app.personal?.mobile}</span>
                          <span>•</span>
                          <span>🎂 {app.personal?.dob}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          आधार: {app.identity?.aadhaarNumber ? `•••• •••• ${app.identity.aadhaarNumber.slice(-4)}` : 'N/A'}
                        </span>
                      </td>

                      {/* Column 3: AO Code & City */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block text-[11px]">
                          {app.aoCode?.areaCode} {app.aoCode?.aoType} {app.aoCode?.rangeCode} {app.aoCode?.aoNumber}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate max-w-[160px]">
                          {app.address?.city || app.address?.district}, {app.address?.state} ({app.address?.pincode})
                        </span>
                      </td>

                      {/* Column 4: Financials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                          <span>₹{app.financials?.feeCharged || 145}</span>
                          <span className="text-[10px] text-emerald-600">(+₹{app.financials?.netProfit || 25})</span>
                        </div>
                        {app.financials?.isRefunded ? (
                          <span className="inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            रिफंड जमा (Credited)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">
                            Txn: {app.financials?.walletTxnId?.slice(-6)}
                          </span>
                        )}
                      </td>

                      {/* Column 5: Status Badge */}
                      <td className="py-3.5 px-4">
                        {app.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            ✓ पूर्ण (Ack: {app.fulfillment?.ackNumber?.slice(-6)})
                          </span>
                        )}
                        {app.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            ⏳ कतार में (Pending)
                          </span>
                        )}
                        {app.status === 'under_review' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                            🔄 पुनः प्रस्तुत (Resubmitted)
                          </span>
                        )}
                        {app.status === 'objection' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                            ⚠️ आपत्ति (Objection)
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                            ✕ निरस्त (Rejected)
                          </span>
                        )}
                      </td>

                      {/* Column 6: Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          
                          {/* 1. Quick Copy Drawer Button */}
                          <button
                            type="button"
                            onClick={() => setQuickCopyApp(app)}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Quick Copy for PanSuvidha"
                          >
                            <Copy className="w-3 h-3 text-blue-600" />
                            <span>कॉपी</span>
                          </button>

                          {/* 2. 1-Click ZIP Downloader */}
                          <button
                            type="button"
                            onClick={() => handleDownloadZip(app)}
                            disabled={zippingId === app.id}
                            className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Download All Assets in ZIP"
                          >
                            {zippingId === app.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <FolderArchive className="w-3 h-3" />
                            )}
                            <span>ZIP</span>
                          </button>

                          {/* 3. View Form 49A Preview */}
                          <button
                            type="button"
                            onClick={() => handleViewForm49A(app)}
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="View Form 49A PDF"
                          >
                            <FileText className="w-3 h-3" />
                            <span>49A</span>
                          </button>

                          {/* 4. Complete Action */}
                          {app.status !== 'completed' && app.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setAckNumber('');
                                setCompleteModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                              title="Mark Completed"
                            >
                              <Check className="w-3 h-3" />
                              <span>पूर्ण</span>
                            </button>
                          )}

                          {/* 5. Objection Action */}
                          {app.status !== 'completed' && app.status !== 'rejected' && app.status !== 'objection' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setObjectionReason('');
                                setObjectionModalOpen(true);
                              }}
                              className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                              title="Raise Objection (Zero Refund)"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              <span>आपत्ति</span>
                            </button>
                          )}

                          {/* 6. Reject Action (Strict Golden Rule 3: Reject != Refund) */}
                          {app.status !== 'completed' && app.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setRejectionReason('');
                                setRejectModalOpen(true);
                              }}
                              className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                              title="Reject Application (No Refund)"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>निरस्त</span>
                            </button>
                          )}

                          {/* 7. Independent Refund Action */}
                          {!app.financials?.isRefunded && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setRefundModalOpen(true);
                              }}
                              className="bg-slate-900 hover:bg-black text-amber-300 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer border border-amber-400/40"
                              title="Issue Independent Wallet Refund"
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>रिफंड</span>
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* QUICK COPY DRAWER (1-CLICK COPY FOR PANSUVIDHA / UTIITSL) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {quickCopyApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Copy className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-black text-sm text-white">PanSuvidha Quick-Copy Drawer</h3>
                  <span className="text-[11px] text-slate-400">{quickCopyApp.id} • {quickCopyApp.personal?.firstName} {quickCopyApp.personal?.lastName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickCopyApp(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Copy Fields List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              
              {/* Copy Full JSON button */}
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(quickCopyApp, null, 2), 'FULL_JSON')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                {copiedField === 'FULL_JSON' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'FULL_JSON' ? 'संपूर्ण JSON कॉपी हो गया!' : 'Copy Entire Application JSON (For Bridge)'}</span>
              </button>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  व्यक्तिगत विवरण (Personal Details)
                </span>

                {[
                  { label: 'Title', val: quickCopyApp.personal?.title || 'Shri', key: 'title' },
                  { label: 'First Name', val: quickCopyApp.personal?.firstName || '', key: 'fn' },
                  { label: 'Middle Name', val: quickCopyApp.personal?.middleName || '', key: 'mn' },
                  { label: 'Last Name', val: quickCopyApp.personal?.lastName || '', key: 'ln' },
                  { label: 'Date of Birth (YYYY-MM-DD)', val: quickCopyApp.personal?.dob || '', key: 'dob' },
                  { label: 'Gender', val: quickCopyApp.personal?.gender || 'Male', key: 'gen' },
                  { label: "Father's Name", val: quickCopyApp.personal?.fatherName || '', key: 'father' },
                  { label: 'Mobile Number', val: quickCopyApp.appliedBy || quickCopyApp.personal?.mobile, key: 'mob' },
                  { label: 'Email ID', val: quickCopyApp.personal?.email || '', key: 'email' },
                  { label: '12-Digit Aadhaar', val: quickCopyApp.identity?.aadhaarNumber || '', key: 'aadhaar' },
                  { label: 'Name on Aadhaar', val: quickCopyApp.identity?.nameOnAadhaar || '', key: 'aadhaar_name' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">{item.label}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.val || '—'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.val, item.key)}
                      className="bg-white dark:bg-slate-800 hover:bg-blue-50 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition"
                    >
                      {copiedField === item.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === item.key ? 'कॉपी' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  AO कोड एवं पता (AO Code & Address)
                </span>

                {[
                  { label: 'AO Area Code', val: quickCopyApp.aoCode?.areaCode, key: 'ao_area' },
                  { label: 'AO Type', val: quickCopyApp.aoCode?.aoType, key: 'ao_type' },
                  { label: 'AO Range Code', val: quickCopyApp.aoCode?.rangeCode, key: 'ao_range' },
                  { label: 'AO Number', val: quickCopyApp.aoCode?.aoNumber, key: 'ao_no' },
                  { label: 'Premises / Village', val: quickCopyApp.address?.premises, key: 'addr_prem' },
                  { label: 'Town / City', val: quickCopyApp.address?.city, key: 'addr_city' },
                  { label: 'State', val: quickCopyApp.address?.state, key: 'addr_state' },
                  { label: 'Pincode', val: quickCopyApp.address?.pincode, key: 'addr_pin' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">{item.label}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.val || '—'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.val, item.key)}
                      className="bg-white dark:bg-slate-800 hover:bg-blue-50 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition"
                    >
                      {copiedField === item.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === item.key ? 'कॉपी' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>

            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setQuickCopyApp(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
              >
                बंद करें (Close)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SEPARATE OBJECTION MODAL (Strict Golden Rule: ZERO REFUND) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {objectionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">आपत्ति दर्ज करें (Raise Objection)</h3>
                <span className="text-xs text-slate-400">{selectedApp.id}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <p className="font-bold">⚠️ सार्वभौमिक नियम (Universal Law):</p>
              <p className="text-[11px]">आपत्ति दर्ज करने पर उपयोगकर्ता को दस्तावेज़ पुनः अपलोड करने का अवसर मिलेगा। कोई रिफंड वॉलेट में वापस नहीं होगा।</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                आपत्ति का कारण (Reason for Objection) *
              </label>
              <textarea
                rows={3}
                value={objectionReason}
                onChange={(e) => setObjectionReason(e.target.value)}
                placeholder="जैसे: आधार कार्ड की कॉपी धुंधली है या जन्मतिथि प्रमाण में नाम का मिलान नहीं हुआ..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-3 text-xs font-bold focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setObjectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={submitObjection}
                disabled={submittingObjection}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {submittingObjection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>आपत्ति दर्ज करें (Zero Refund)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SEPARATE REJECT MODAL (Strict Golden Rule 3: Reject != Refund) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {rejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">आवेदन निरस्त करें (Mark Rejected)</h3>
                <span className="text-xs text-slate-400">{selectedApp.id}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-black">🛑 यूनिवर्सल नियम 3 (Golden Rule 3):</p>
              <p className="text-[11px]">Reject और Refund कभी स्वतः मर्ज नहीं होंगे! आवेदन निरस्त करने पर वॉलेट से कोई राशि वापस नहीं जाएगी। रिफंड केवल स्वतंत्र रूप से ही दिया जा सकता है।</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                निरस्तीकरण का कारण (Rejection Reason) *
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="जैसे: फर्जी आधार या अपात्र आवेदन..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={submittingReject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {submittingReject ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>निरस्त मार्क करें (No Refund)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SEPARATE INDEPENDENT REFUND MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {refundModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">वॉलेट रिफंड जारी करें (Issue Refund)</h3>
                <span className="text-xs text-slate-400">{selectedApp.id}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">आवेदक फोन / आईडी:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedApp.appliedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">काटा गया शुल्क:</span>
                <span className="font-bold text-emerald-600">₹{selectedApp.financials?.feeCharged || 145}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
                <span className="text-slate-500">रिफंड होने वाली कुल राशि:</span>
                <span className="font-black text-amber-500 text-sm">₹{selectedApp.financials?.feeCharged || 145}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              यह राशि तुरंत आवेदक या कैफे संचालक के वॉलेट में क्रेडिट कर दी जाएगी और खाता बही में REFUND ट्रांजैक्शन दर्ज होगा।
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={submitRefund}
                disabled={submittingRefund}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {submittingRefund ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>₹{selectedApp.financials?.feeCharged || 145} रिफंड क्रेडिट करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* COMPLETE APPLICATION MODAL (15-DIGIT ACK NUMBER & SLIP PDF) */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {completeModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">आवेदन पूर्ण मार्क करें (Mark Completed)</h3>
                <span className="text-xs text-slate-400">{selectedApp.id}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                15-अंकीय आधिकारिक Acknowledgement Number *
              </label>
              <input
                type="text"
                maxLength={15}
                value={ackNumber}
                onChange={(e) => setAckNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="15-अंकीय एक्नॉलेजमेंट नंबर दर्ज करें"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-black tracking-widest focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">UTIITSL / Protean NSDL पावती रसीद नंबर</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                पावती रसीद स्लिप PDF (Acknowledgement Slip)
              </label>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={submitComplete}
                disabled={submittingComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {submittingComplete ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>सत्यापित व पूर्ण करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* OPTION 2: STANDALONE FORM 49A AUTO-STAMPER TOOL MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {stamperToolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Option 2: स्टैंडअलोन Form 49A PDF ऑटो-स्टैम्पर</h3>
                  <p className="text-xs text-slate-400">बिना आवेदन दर्ज किए किसी भी फोटो व साइन को सीधे 49A में स्टैम्प व डाउनलोड करें</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStamperToolOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">उपनाम (Last Name) *</label>
                <input
                  type="text"
                  value={stamperForm.lastName}
                  onChange={(e) => setStamperForm({ ...stamperForm, lastName: e.target.value.toUpperCase() })}
                  placeholder="उपनाम दर्ज करें"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">प्रथम नाम (First Name)</label>
                <input
                  type="text"
                  value={stamperForm.firstName}
                  onChange={(e) => setStamperForm({ ...stamperForm, firstName: e.target.value.toUpperCase() })}
                  placeholder="प्रथम नाम दर्ज करें"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">पिता का नाम (Father Name)</label>
                <input
                  type="text"
                  value={stamperForm.fatherName}
                  onChange={(e) => setStamperForm({ ...stamperForm, fatherName: e.target.value.toUpperCase() })}
                  placeholder="पिता का नाम दर्ज करें"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">जन्म तिथि (DOB)</label>
                <input
                  type="date"
                  value={stamperForm.dob}
                  onChange={(e) => setStamperForm({ ...stamperForm, dob: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">12-अंकीय आधार</label>
                <input
                  type="text"
                  maxLength={12}
                  value={stamperForm.aadhaarNumber}
                  onChange={(e) => setStamperForm({ ...stamperForm, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="12-अंकीय आधार नंबर दर्ज करें"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">शहर / जिला</label>
                <input
                  type="text"
                  value={stamperForm.city}
                  onChange={(e) => setStamperForm({ ...stamperForm, city: e.target.value.toUpperCase() })}
                  placeholder="शहर / जिला दर्ज करें"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                <span className="text-xs font-black text-slate-900 dark:text-white block">📸 फोटो अपलोड (Photo) *</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setStamperPhoto(r.result);
                      r.readAsDataURL(f);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white"
                />
                {stamperPhoto && (
                  <img src={stamperPhoto} alt="Photo" className="w-16 h-20 object-cover rounded-lg border border-slate-300" />
                )}
              </div>

              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                <span className="text-xs font-black text-slate-900 dark:text-white block">✍️ हस्ताक्षर अपलोड (Signature) *</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setStamperSign(r.result);
                      r.readAsDataURL(f);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white"
                />
                {stamperSign && (
                  <img src={stamperSign} alt="Sign" className="w-24 h-12 object-contain rounded-lg border border-slate-300 bg-white" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStamperToolOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={handleGenerateStandalone}
                disabled={generatingStandalone}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition"
              >
                {generatingStandalone ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>100% स्टैम्प्ड 49A PDF बनाएं व डाउनलोड करें</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* PANSUVIDHA 1-CLICK AUTOFILL BRIDGE BOOKMARKLET DRAWER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {bookmarkletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-600 flex items-center justify-center">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">PanSuvidha 1-Click Autofill Bookmarklet</h3>
                  <span className="text-xs text-slate-400">UTIITSL / Protean NSDL Form 49A ऑटो-फिल ब्रिज</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookmarkletOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Draggable Bookmarklet Link */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-dashed border-blue-400 text-center space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                👇 इस बटन को पकड़कर अपने ब्राउज़र के बुकमार्क बार (Bookmarks Bar) पर ड्रैग करें:
              </span>
              
              <a
                href={bookmarkletCode}
                onClick={(e) => {
                  e.preventDefault();
                  alert('💡 कृपया इस बटन को माउस से पकड़कर अपने Chrome/Edge के Bookmarks Bar पर ड्रैग (खींचकर छोड़ें) करें!');
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-6 py-2.5 rounded-2xl text-xs shadow-lg shadow-blue-500/30 cursor-grab active:cursor-grabbing select-none"
              >
                <span>⚡ SmartCafe PanSuvidha Bridge</span>
              </a>
            </div>

            {/* How It Works Guide */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 text-slate-700 dark:text-slate-300">
              <span className="font-black text-slate-900 dark:text-white block">
                📖 उपयोग कैसे करें (Step-by-Step Guide):
              </span>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                <li>ऊपर दिए गए नीले बटन <b>⚡ SmartCafe PanSuvidha Bridge</b> को अपने ब्राउज़र बुकमार्क बार में सेव करें।</li>
                <li>पैन कार्ड कतार में किसी भी आवेदन के <b>कॉपी (Copy)</b> बटन पर क्लिक करें और <b>Copy Entire Application JSON</b> दबाएं।</li>
                <li>अब PanSuvidha या UTIITSL पोर्टल का Form 49A पेज खोलें।</li>
                <li>अपने बुकमार्क बार पर मौजूद <b>⚡ SmartCafe PanSuvidha Bridge</b> पर क्लिक करें।</li>
                <li>स्क्रीन पर फ्लोटिंग विजेट खुलेगा — पेस्ट करें पर क्लिक करें। संपूर्ण 49A फॉर्म 1 सेकंड में भर जाएगा!</li>
              </ol>
            </div>

            {/* Copy Bookmarklet Code Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(bookmarkletCode);
                  setCopiedBookmarklet(true);
                  setTimeout(() => setCopiedBookmarklet(false), 2000);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBookmarklet ? 'कोड कॉपी हो गया!' : 'बुकमार्कलेट कोड कॉपी करें'}</span>
              </button>

              <button
                type="button"
                onClick={() => setBookmarkletOpen(false)}
                className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
              >
                पूर्ण (Done)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Form 49A Preview Modal */}
      <Form49APreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        pdfBlob={previewPdfBlob}
        pdfDataUrl={previewPdfDataUrl}
        applicationData={selectedApp || {}}
        theme={theme}
      />

    </div>
  );
}
