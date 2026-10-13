import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, Clock, Upload, Download, 
  MessageSquare, RefreshCw, Eye, Edit3, X, AlertCircle, 
  FileCheck, ShieldCheck, Zap, Radio, Copy, Check, CreditCard, Sparkles, IndianRupee
} from 'lucide-react';

export default function AdminApplications({ onUpdateCounts, onNavigateToPrintPortal, selectedCafe }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [receiptFile, setReceiptFile] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Live OTP Sync Bridge State
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const [autoFillerCopied, setAutoFillerCopied] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const cafeParam = selectedCafe?.id ? `?cafeId=${selectedCafe.id}` : '';
      const res = await fetch(`/api/applications${cafeParam}`);
      const data = await res.json();
      setApps(data);
      if (onUpdateCounts) onUpdateCounts();
      
      // Update selectedApp if open
      if (selectedApp) {
        const found = data.find(a => a.id === selectedApp.id);
        if (found) setSelectedApp(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 4000); // 4-second real-time poll for OTP and payments
    return () => clearInterval(interval);
  }, [selectedApp?.id, selectedCafe?.id]);

  const handleMarkCashPaid = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}/mark-paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMode: 'cash' })
      });
      if (res.ok) {
        alert('✅ नकद भुगतान दर्ज हो गया! फॉर्म अब सरकारी पोर्टल पर अप्लाई हेतु तैयार है।');
        fetchApps();
      }
    } catch (err) {
      console.error('Mark paid error:', err);
    }
  };

  const handleRequestOtp = async (appId, otpType = 'aadhaar') => {
    setRequestingOtp(true);
    try {
      const res = await fetch(`/api/applications/${appId}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpType })
      });
      if (res.ok) {
        fetchApps();
      }
    } catch (err) {
      console.error('Request OTP error:', err);
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleUpdateStatus = async (id, status, remarks) => {
    try {
      const body = { status };
      if (remarks) body.remarks = remarks;

      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchApps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile || !selectedApp) return;

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      if (remarksInput) formData.append('remarks', remarksInput);

      const res = await fetch(`/api/applications/${selectedApp.id}/receipt`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchApps();
        setSelectedApp(data.application);
        setReceiptFile(null);
        setRemarksInput('');
        alert('अंतिम रसीद सफलतापूर्वक अपलोड हो गई!');
      }
    } catch (err) {
      console.error(err);
      alert('रसीद अपलोड करने में विफल।');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const copyLiveOtp = (otp) => {
    navigator.clipboard.writeText(otp);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  const FIELD_LABEL_MAP = {
    applicantName: 'आवेदक का नाम (Name)',
    applicantNameHindi: 'आवेदक का नाम (हिंदी)',
    candidateName: 'अभ्यर्थी का नाम',
    studentName: 'छात्र / छात्रा का नाम',
    fullName: 'पूरा नाम',
    farmerName: 'किसान का नाम',
    memberName: 'कर्मचारी का नाम',
    voterName: 'मतदाता का नाम',
    voterNameHindi: 'मतदाता का नाम (हिंदी)',
    beneficiaryName: 'लाभार्थी का नाम',
    holderName: 'कार्डधारक का नाम',
    holderNameHindi: 'नाम (हिंदी)',
    fatherName: 'पिता का नाम',
    fatherHusbandName: 'पिता / पति का नाम',
    fatherHusband: 'पिता / पति का नाम',
    motherName: 'माता का नाम',
    relativeName: 'नातेदार का नाम',
    relationType: 'नातेदार का रिश्ता',
    casteCategory: 'जाति वर्ग (Category)',
    subCaste: 'उप-जाति (Sub-Caste)',
    villageMohalla: 'मकान नं. / ग्राम / मोहल्ला',
    postOffice: 'डाकघर (Post)',
    tehsil: 'तहसील',
    district: 'जनपद / जिला',
    occupation: 'व्यवसाय',
    familyMembers: 'परिवार के सदस्य',
    annualIncome: 'वार्षिक आय',
    income: 'वार्षिक आय',
    aadhaarNo: 'आधार संख्या',
    idNumber: 'पहचान संख्या',
    rationCardNo: 'राशन कार्ड संख्या',
    rationNo: 'राशन कार्ड संख्या',
    reason: 'आवेदन का उद्देश्य',
    purpose: 'उद्देश्य',
    dob: 'जन्मतिथि (DOB)',
    gender: 'लिंग',
    email: 'ईमेल',
    deliveryAddress: 'डिलीवरी पता',
    pincode: 'पिन कोड',
    panNo: 'पैन नंबर',
    correctionType: 'सुधार का प्रकार',
    assembly: 'विधानसभा क्षेत्र',
    houseAddress: 'मकान व पता',
    mobile: 'मोबाइल नंबर',
    tenthRollNo: '10वीं रोल नंबर',
    tenthBoard: '10वीं बोर्ड',
    tenthYear: '10वीं वर्ष',
    tenthMarks: '10वीं प्राप्तांक',
    twelfthRoll: '12वीं रोल नंबर',
    collegeName: 'कॉलेज / संस्थान',
    courseYear: 'कोर्स व वर्ष',
    feeAmount: 'कॉलेज फीस राशि',
    bankAccount: 'बैंक खाता व IFSC',
    bankDetails: 'बैंक विवरण',
    uanNumber: 'UAN नंबर',
    claimType: 'विड्रॉल प्रकार',
    withdrawalReason: 'निकासी कारण',
    claimAmount: 'निकासी राशि',
    bloodGroup: 'ब्लड ग्रुप',
    education: 'शैक्षणिक योग्यता',
    rtoOffice: 'RTO कार्यालय',
    vehicleClass: 'वाहन श्रेणी',
    khasraKhatauni: 'खसरा/खतौनी संख्या',
    landArea: 'रकबा (हेक्टेयर)'
  };

  const [copiedField, setCopiedField] = useState(null);
  const copyFieldValue = (fieldKey, val) => {
    navigator.clipboard.writeText(String(val || ''));
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const copyAllDetails = (details, app) => {
    if (!details) return;
    const d = typeof details === 'object' ? details : { विवरण: details };
    const text = Object.entries(d)
      .map(([k, v]) => `${FIELD_LABEL_MAP[k] || k}: ${v}`)
      .join('\n');
    const fullText = `=== आवेदन: ${app.serviceName} (${app.id}) ===\nआवेदक: ${app.customerName}\nमोबाइल: ${app.phone}\n${text}`;
    navigator.clipboard.writeText(fullText);
    alert('✅ सभी आवेदन विवरण क्लिपबोर्ड पर कॉपी हो गए!');
  };

  // Generate 1-Click e-District / Govt Portal Auto-Fill script
  const generateAutoFillScript = (app) => {
    const d = typeof app.details === 'object' ? app.details : {};
    const nameVal = d.applicantName || d.candidateName || d.studentName || d.fullName || app.customerName || '';
    const nameHindiVal = d.applicantNameHindi || d.voterNameHindi || '';
    const fatherVal = d.fatherName || d.fatherHusbandName || d.fatherHusband || '';
    const motherVal = d.motherName || '';
    const incomeVal = (d.annualIncome || d.income || '48000').replace(/[^0-9]/g, '') || '48000';
    const casteVal = d.subCaste || d.casteCategory || '';
    const villageVal = d.villageMohalla || d.houseAddress || d.address || '';
    const tehsilVal = d.tehsil || '';
    const districtVal = d.district || '';
    const aadhaarVal = (d.aadhaarNo || '').replace(/\s+/g, '');
    const rollVal = d.tenthRollNo || d.tenthRoll || '';

    return `// == Official Portal Auto-Filler Script for ${nameVal} (${app.serviceName}) ==
(function(){
  console.log("⚡ Auto-filling government form for ${nameVal}...");
  const setVal = (selectors, val) => {
    if (!val) return;
    for (const sel of selectors.split(',')) {
      const el = document.querySelector(sel.trim());
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', {bubbles:true}));
        el.dispatchEvent(new Event('change', {bubbles:true}));
        return;
      }
    }
  };

  setVal('#txtApplicantName, input[name*="applicant_name"], input[name*="name_en"], #applicantName', "${nameVal}");
  setVal('#txtApplicantNameHindi, input[name*="name_hi"], #applicantNameHindi', "${nameHindiVal}");
  setVal('#txtFatherName, input[name*="father"], #fatherName', "${fatherVal}");
  setVal('#txtMotherName, input[name*="mother"], #motherName', "${motherVal}");
  setVal('#txtMobile, input[name*="mobile"], input[name*="phone"], #mobile', "${app.phone}");
  setVal('#txtIncome, input[name*="income"], #annualIncome', "${incomeVal}");
  setVal('#txtSubCaste, select[name*="subcaste"], input[name*="caste"]', "${casteVal}");
  setVal('#txtVillage, textarea[name*="address"], input[name*="village"]', "${villageVal}");
  setVal('#txtTehsil, select[name*="tehsil"], input[name*="tehsil"]', "${tehsilVal}");
  setVal('#txtDistrict, select[name*="district"], input[name*="district"]', "${districtVal}");
  setVal('#txtAadhaar, input[name*="aadhaar"], input[name*="uid"]', "${aadhaarVal}");
  setVal('#txtRollNo, input[name*="roll"]', "${rollVal}");

  alert("✅ आवेदक ${nameVal} का डेटा फॉर्म में स्वतः भर दिया गया! कृपया कैप्चा डालें और सबमिट करें।");
})();`;
  };

  const copyAutoFillerScript = (app) => {
    navigator.clipboard.writeText(generateAutoFillScript(app));
    setAutoFillerCopied(true);
    setTimeout(() => setAutoFillerCopied(false), 2500);
  };

  const filtered = apps.filter(a => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'hold') return a.status === 'hold' || a.paymentStatus?.startsWith('hold');
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            लाइव e-District ऑटोमेशन व CRM
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            ऑनलाइन फॉर्म, लाइव OTP व आवेदन प्रबंधन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ग्राहकों द्वारा घर से भेजे गए फॉर्म, आधार OTP अनुरोध, नकद पुष्टि और 1-क्लिक सरकारी ऑटो-फ़िलर।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : ''}`}
            >
              सभी ({apps.length})
            </button>
            <button
              onClick={() => setStatusFilter('hold')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'hold' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700'}`}
            >
              पेमेंट होल्ड ({apps.filter(a => a.paymentStatus?.startsWith('hold')).length})
            </button>
            <button
              onClick={() => setStatusFilter('received')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'received' ? 'bg-white text-blue-600 shadow-sm' : ''}`}
            >
              स्वीकृत / नए
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : ''}`}
            >
              पूर्ण ✓
            </button>
          </div>

          <button
            onClick={fetchApps}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="रिफ्रेश"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((app) => {
          const isCashHold = app.paymentStatus === 'hold_cash';
          const isOnlineHold = app.paymentStatus === 'hold_online';
          const isPaid = app.paymentStatus === 'paid' || app.paymentStatus === 'paid_upi' || app.paymentStatus === 'paid_cash';

          return (
            <div
              key={app.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition flex flex-col justify-between space-y-4 ${
                isCashHold ? 'border-amber-300 bg-amber-50/20' : 
                isOnlineHold ? 'border-orange-300 bg-orange-50/20' : 
                'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                    {app.id}
                  </span>
                  
                  {/* Payment Badges */}
                  {isCashHold && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      🟡 दुकान पर कैश देगा (Hold)
                    </span>
                  )}
                  {isOnlineHold && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300">
                      🟠 थोड़ी देर में ऑनलाइन (Hold)
                    </span>
                  )}
                  {isPaid && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      🟢 भुगतान प्राप्त (Paid)
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mt-2.5 leading-snug">
                  {app.serviceName}
                </h3>
                <p className="text-xs text-slate-500">{app.serviceCategory}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p>आवेदक: <strong className="text-slate-900">{app.customerName}</strong></p>
                  <p>मोबाइल: <strong className="text-slate-900">{app.phone}</strong></p>
                  <p>चार्ज: <strong className="text-emerald-700">₹{app.totalFee}</strong></p>
                  
                  {/* Live OTP Notification on Card */}
                  {app.otpStatus === 'received' && (
                    <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-xl text-emerald-900 font-bold flex items-center justify-between mt-2 animate-bounce">
                      <span>⚡ OTP प्राप्त: <span className="font-mono text-sm text-emerald-700 font-black">{app.liveOtp}</span></span>
                      <button
                        onClick={() => copyLiveOtp(app.liveOtp)}
                        className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]"
                      >
                        कॉपी
                      </button>
                    </div>
                  )}

                  {app.otpStatus === 'requested' && (
                    <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-amber-800 text-[11px] font-bold flex items-center gap-1.5 mt-2">
                      <Radio className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>ग्राहक के फोन पर अलर्ट भेजा गया...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {/* Hold Action: Mark Cash Paid Button */}
                {isCashHold && (
                  <button
                    type="button"
                    onClick={() => handleMarkCashPaid(app.id)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>₹{app.totalFee} नकद प्राप्त हुआ (अप्लाई खोलें)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>दस्तावेज़, लाइव OTP व ऑटो-फ़िलर</span>
                </button>

                {app.phone && (
                  <a
                    href={`https://wa.me/91${app.phone}?text=${encodeURIComponent(`नमस्ते ${app.customerName} जी, आपके आवेदन "${app.serviceName}" (टोकन: ${app.id}) की ताज़ा स्थिति: ${app.status === 'completed' ? '✅ कार्य सफलतापूर्वक पूर्ण हो गया है! आप कैफे से रसीद/दस्तावेज प्राप्त कर सकते हैं।' : app.status === 'rejected' ? '❌ आवेदन अस्वीकृत कर दिया गया है। कृपया विवरण हेतु कैफे पर संपर्क करें।' : isCashHold ? '⏳ दुकान पर शुल्क जमा होने का इंतज़ार है।' : '⚙️ कार्य प्रगति पर है।'} कुल राशि: ₹${app.totalFee}। धन्यवाद - ${selectedCafe?.shopName || 'डिजिटल सेवा केंद्र'}।`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center border border-emerald-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp पर 1-क्लिक स्टेटस भेजें</span>
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Detail / Action Modal with Live OTP & Auto-Filler Bot */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden p-6 space-y-5 border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                  {selectedApp.id}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedApp.serviceName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* LIVE OTP BRIDGE CONSOLE */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-black text-xs text-emerald-300">लाइव e-District OTP सिंक ब्रिज</span>
                </div>
                <span className="text-[11px] text-slate-300">ग्राहक: {selectedApp.phone}</span>
              </div>

              {/* OTP State Display */}
              {selectedApp.otpStatus === 'received' ? (
                <div className="bg-emerald-500/20 border border-emerald-400 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-300 font-bold block">
                      ग्राहक के फोन से तुरंत प्राप्त OTP:
                    </span>
                    <span className="font-mono text-2xl font-black text-white tracking-widest">
                      {selectedApp.liveOtp}
                    </span>
                  </div>
                  <button
                    onClick={() => copyLiveOtp(selectedApp.liveOtp)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    {otpCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{otpCopied ? 'कॉपी हो गया!' : 'OTP कॉपी करें'}</span>
                  </button>
                </div>
              ) : selectedApp.otpStatus === 'requested' ? (
                <div className="bg-amber-500/20 border border-amber-400/50 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Radio className="w-4 h-4 animate-spin text-amber-400" />
                    <span>ग्राहक के मोबाइल ऐप / SMS लिसनर पर अलर्ट भेजा गया... OTP का इंतज़ार है</span>
                  </div>
                  <button
                    onClick={() => handleRequestOtp(selectedApp.id, selectedApp.otpType || 'aadhaar')}
                    className="text-xs text-amber-300 underline font-bold"
                  >
                    दोबारा भेजें
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  e-District में आधार नंबर डालने के बाद नीचे बटन दबाएं — ग्राहक को फोन किए बिना OTP स्क्रीन पर आ जाएगा।
                </p>
              )}

              {/* Trigger OTP Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={requestingOtp}
                  onClick={() => handleRequestOtp(selectedApp.id, 'aadhaar')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>📡 ग्राहक से आधार e-KYC OTP मांगें</span>
                </button>

                <button
                  type="button"
                  disabled={requestingOtp}
                  onClick={() => handleRequestOtp(selectedApp.id, 'payment')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>📡 फाइनल पेमेंट पुष्टि OTP मांगें</span>
                </button>

                {/* 1-Click e-District Auto Filler Script Copy */}
                <button
                  type="button"
                  onClick={() => copyAutoFillerScript(selectedApp)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition ml-auto"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{autoFillerCopied ? 'स्क्रिप्ट कॉपी हो गई!' : '⚡ e-District 1-क्लिक ऑटो-फ़िलर कोड'}</span>
                </button>
              </div>
            </div>

            {/* Customer Submitted Form Details */}
            {selectedApp.details && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>ग्राहक द्वारा भरा गया विवरण (Form Details):</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyAllDetails(selectedApp.details, selectedApp)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-xl text-[11px] border border-indigo-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>पूरा फॉर्म डेटा कॉपी करें</span>
                  </button>
                </div>

                {typeof selectedApp.details === 'object' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {Object.entries(selectedApp.details).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="truncate">
                          <span className="text-[10px] text-slate-500 font-black block uppercase">
                            {FIELD_LABEL_MAP[k] || k}:
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs break-words">
                            {String(v || 'लागू नहीं')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyFieldValue(k, v)}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold shrink-0 transition cursor-pointer ${
                            copiedField === k 
                              ? 'bg-emerald-600 text-white border-emerald-700' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          title="यह वैल्यू कॉपी करें"
                        >
                          {copiedField === k ? '✓' : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200">{selectedApp.details}</p>
                )}
              </div>
            )}

            {/* Attached Documents Vault */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                ग्राहक द्वारा अपलोड किए गए दस्तावेज़ ({selectedApp.documents?.length || 0}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {selectedApp.documents?.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{doc.name || doc.originalName}</span>
                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      डाउनलोड
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Quick Buttons */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-1.5">स्थिति बदलें:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'received', 'आवेदन प्राप्त हो चुका है।')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedApp.status === 'received' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  प्राप्त (Received)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'processing', 'पोर्टल पर फॉर्म भरा जा रहा है।')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedApp.status === 'processing' ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  प्रक्रिया में (Processing)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'completed', 'फॉर्म सफलतापूर्वक सबमिट हो गया है!')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedApp.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  पूर्ण (Completed ✓)
                </button>
              </div>
            </div>

            {/* Upload Final Receipt Section */}
            <form onSubmit={handleUploadReceipt} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
              <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                अंतिम फॉर्म रसीद अपलोड करें (Upload Final Receipt PDF)
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="text-xs bg-white border border-emerald-300 rounded-xl p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 flex-1"
                />
                <button
                  type="submit"
                  disabled={uploadingReceipt || !receiptFile}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  {uploadingReceipt ? 'अपलोड हो रहा है...' : 'रसीद सेव करें'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
