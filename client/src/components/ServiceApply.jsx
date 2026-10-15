import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, Upload, AlertCircle, CheckCircle2, 
  HelpCircle, Sparkles, Send, ShieldCheck, ArrowRight,
  Briefcase, GraduationCap, Award, CreditCard, Landmark, FileText, Trash2, Camera,
  Check, Eye, Layers, Copy, RefreshCw, Smartphone, IndianRupee
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PrintTokenModal from './PrintTokenModal';
import { authFetch } from '../utils/api';
import { SERVICE_FORM_SCHEMAS } from '../data/serviceFormSchemas';
import { JAN_SEVA_SERVICES } from './JanSevaModal';
import { useLanguage } from '../context/LanguageContext';

export const SERVICES_CATALOG = [
  {
    id: 'edistrict_revenue',
    category: { hi: "राजस्व प्रमाण पत्र (Revenue)", en: "Revenue Certificates" },
    icon: Award,
    color: "from-emerald-600 to-teal-600",
    items: [
      { id: 'income_cert', label: { hi: "आय प्रमाण पत्र", en: "Income Certificate" }, name: "आय प्रमाण पत्र (Income Certificate)", fee: 80, dept: "राजस्व परिषद उत्तर प्रदेश (e-District)" },
      { id: 'caste_cert', label: { hi: "जाति प्रमाण पत्र", en: "Caste Certificate" }, name: "जाति प्रमाण पत्र (Caste Certificate)", fee: 80, dept: "राजस्व परिषद उत्तर प्रदेश (e-District)" },
      { id: 'niwas_cert', label: { hi: "निवास प्रमाण पत्र", en: "Domicile Certificate" }, name: "निवास प्रमाण पत्र (Domicile/Niwas)", fee: 80, dept: "राजस्व परिषद उत्तर प्रदेश (e-District)" },
      { id: 'ews_cert', label: { hi: "EWS प्रमाण पत्र", en: "EWS Certificate" }, name: "EWS प्रमाण पत्र", fee: 120, dept: "राजस्व परिषद उत्तर प्रदेश (e-District)" }
    ]
  },
  {
    id: 'edistrict_land',
    category: { hi: "भूलेख एवं हैसियत सेवाएं", en: "Land Records & Solvency" },
    icon: Landmark,
    color: "from-cyan-600 to-blue-600",
    items: [
      { id: 'khatauni_copy', label: { hi: "खतौनी / भूलेख नकल", en: "Khatauni Land Record" }, name: "खतौनी नकल (Khatauni Land Record)", fee: 30, dept: "राजस्व परिषद (भूलेख)" },
      { id: 'haisiyat_cert', label: { hi: "हैसियत प्रमाण पत्र", en: "Solvency Certificate" }, name: "हैसियत प्रमाण पत्र (Haisiyat Certificate)", fee: 250, dept: "राजस्व परिषद उत्तर प्रदेश (e-District)" }
    ]
  },
  {
    id: 'edistrict_panchayat',
    category: { hi: "पंचायती राज व जन्म/मृत्यु", en: "Panchayati Raj & Vital" },
    icon: FileText,
    color: "from-amber-600 to-orange-600",
    items: [
      { id: 'birth_cert_rec', label: { hi: "जन्म प्रमाण पत्र सिफारिश", en: "Birth Certificate Rec." }, name: "जन्म प्रमाण पत्र सिफारिश", fee: 100, dept: "पंचायती राज विभाग (e-District)" },
      { id: 'death_cert_rec', label: { hi: "मृत्यु प्रमाण पत्र सिफारिश", en: "Death Certificate Rec." }, name: "मृत्यु प्रमाण पत्र सिफारिश", fee: 100, dept: "पंचायती राज विभाग (e-District)" },
      { id: 'parivar_register', label: { hi: "परिवार रजिस्टर नकल", en: "Family Register (Kutumb Nakal)" }, name: "परिवार रजिस्टर नकल", fee: 50, dept: "पंचायती राज विभाग (e-District)" }
    ]
  },
  {
    id: 'edistrict_social',
    category: { hi: "समाज कल्याण एवं पेंशन", en: "Social Welfare & Pension" },
    icon: ShieldCheck,
    color: "from-purple-600 to-pink-600",
    items: [
      { id: 'divyang_cert', label: { hi: "दिव्यांग प्रमाण पत्र", en: "Disability Certificate" }, name: "दिव्यांग प्रमाण पत्र आवेदन", fee: 100, dept: "समाज कल्याण विभाग (e-District)" },
      { id: 'shadi_anudan', label: { hi: "शादी अनुदान योजना", en: "Marriage Financial Aid" }, name: "शादी अनुदान योजना", fee: 150, dept: "समाज कल्याण विभाग (e-District)" }
    ]
  }
];

export default function ServiceApply({ 
  settings, 
  selectedCafe, 
  onApplicationSubmitted, 
  preselectedService,
  onOpenJanSevaStudio
}) {
  const { language, t, localize } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(SERVICES_CATALOG[0].id);
  const [selectedService, setSelectedService] = useState(
    preselectedService || SERVICES_CATALOG[0].items[0]
  );

  // Dynamic Fields State
  const [formFields, setFormFields] = useState({});
  const [slotFiles, setSlotFiles] = useState({}); // { [slotId]: File }
  const [extraFiles, setExtraFiles] = useState([]); // [File, ...]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Payment State
  const [paymentChoice, setPaymentChoice] = useState('paid_wallet'); // 'paid_wallet', 'paid_upi', 'pay_cash_at_shop', 'pay_online_later'
  const [customerWallet, setCustomerWallet] = useState(null);

  // Active Schema Resolution
  const activeSchema = (selectedService?.id && Object.values(SERVICE_FORM_SCHEMAS).find(s => s.id === selectedService.id))
    || SERVICE_FORM_SCHEMAS[selectedService?.name];
  const janSevaMatch = selectedService?.isJanSeva 
    ? JAN_SEVA_SERVICES.find(s => s.id === selectedService.id)
    : JAN_SEVA_SERVICES.find(s => s.name === selectedService.name || s.id === selectedService.id);

  // Reset form inputs when service changes
  useEffect(() => {
    setFormFields({});
    setSlotFiles({});
    setExtraFiles([]);
    setError('');
  }, [selectedService?.name]);

  // Handle service preselection from props
  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      // Auto select category
      const foundCat = SERVICES_CATALOG.find(cat => 
        cat.items.some(it => it.name === preselectedService.name || it.id === preselectedService.id || it.name === preselectedService.serviceName)
      );
      if (foundCat) setSelectedCategory(foundCat.id);
    }
  }, [preselectedService]);

  const handleSelectService = (item, catId) => {
    setSelectedService(item);
    setSelectedCategory(catId);
  };

  const handleFieldChange = (fieldId, value) => {
    setFormFields(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSlotFileUpload = (slotId, file) => {
    if (!file) return;
    setSlotFiles(prev => ({ ...prev, [slotId]: file }));
  };

  const removeSlotFile = (slotId) => {
    setSlotFiles(prev => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  const handleExtraFilesUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setExtraFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeExtraFile = (index) => {
    setExtraFiles(prev => prev.filter((_, i) => i !== index));
  };



  // Fetch wallet for customer
  const checkWalletBalance = async (p) => {
    if (!p || p.length < 10) return;
    try {
      const res = await authFetch(`/api/wallet/${p}?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setCustomerWallet(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const phoneToTest = formFields.phone || formFields.mobile || formFields.applicantPhone || '';
    if (phoneToTest.length >= 10) {
      checkWalletBalance(phoneToTest);
    }
  }, [formFields.phone, formFields.mobile, formFields.applicantPhone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Determine applicant name and phone
    const applicantName = formFields.applicantName || 
      formFields.candidateName || 
      formFields.studentName || 
      formFields.fullName || 
      formFields.farmerName || 
      formFields.memberName || 
      formFields.voterName || 
      formFields.beneficiaryName || 
      formFields.holderName || 
      formFields.applicantNameHindi || 
      'नागरिक';

    const phone = formFields.phone || 
      formFields.mobile || 
      formFields.applicantPhone || 
      formFields.pfMobile || 
      (() => {
        try {
          const sess = JSON.parse(localStorage.getItem('cybercafe_customer') || '{}');
          return sess.phone || '';
        } catch {
          return '';
        }
      })();

    // Validate required fields
    if (activeSchema?.fields) {
      for (const f of activeSchema.fields) {
        if (f.required && !formFields[f.id]) {
          setError(`कृपया "${f.label}" आवश्यक रूप से दर्ज करें।`);
          return;
        }
      }
    } else if (janSevaMatch?.fields) {
      for (const f of janSevaMatch.fields) {
        if (f.required && !formFields[f.id]) {
          setError(`कृपया "${f.label}" दर्ज करें।`);
          return;
        }
      }
    }

    // Collect all documents
    const allFiles = [];
    const docLabels = [];

    // From slot uploads
    Object.entries(slotFiles).forEach(([slotId, file]) => {
      allFiles.push(file);
      const slotDef = activeSchema?.docsRequired?.find(d => d.id === slotId);
      docLabels.push(slotDef ? slotDef.label : file.name);
    });

    // From extra uploads
    extraFiles.forEach(f => {
      allFiles.push(f);
      docLabels.push(f.name);
    });

    if (allFiles.length === 0) {
      setError('कृपया कम से कम एक आवश्यक दस्तावेज (फोटो, आधार या मार्कशीट) अपलोड करें।');
      return;
    }

    const fee = selectedService?.fee || 80;

    // Wallet balance check if wallet chosen
    if (paymentChoice === 'paid_wallet') {
      if (customerWallet && customerWallet.balance < fee) {
        setError(`वॉलेट में बैलेंस कम है (उपलब्ध: ₹${customerWallet.balance}, आवश्यक: ₹${fee})। कृपया "ऑनलाइन UPI" अथवा "दुकान पर कैश" विकल्प चुनें।`);
        return;
      }
    }

    const cafeId = selectedCafe?.id || settings?.cafeId || '';

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cafeId', cafeId);
      formData.append('customerName', applicantName.trim());
      formData.append('phone', String(phone).trim());
      formData.append('serviceCategory', selectedCategory);
      formData.append('serviceName', selectedService?.name || 'सरकारी सेवा');
      formData.append('details', JSON.stringify(formFields));
      formData.append('totalFee', fee);
      formData.append('paymentType', paymentChoice);

      // Append documents & labels
      allFiles.forEach((file) => {
        formData.append('documents', file);
      });
      docLabels.forEach(lbl => {
        formData.append('docLabels', lbl);
      });

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // If wallet debit
        if (paymentChoice === 'paid_wallet') {
          await authFetch('/api/wallet/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: String(phone).trim(),
              amount: fee,
              note: `${selectedService?.name} आवेदन शुल्क`,
              appId: data.application.id
            })
          });
        }

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });

        setSubmittedData(data.application);
        if (onApplicationSubmitted) onApplicationSubmitted();

        // Reset fields
        setFormFields({});
        setSlotFiles({});
        setExtraFiles([]);
      } else {
        setError(data.error || 'आवेदन सबमिट करने में कोई समस्या आई।');
      }
    } catch (err) {
      console.error(err);
      setError('सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-100 mb-2 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'hi' ? '100% आधिकारिक सरकारी प्रारूप • घर बैठे डिजिटल आवेदन' : '100% Official Portal Format • Digital Application from Home'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              {language === 'hi' ? 'ऑनलाइन सरकारी फॉर्म व प्रमाण पत्र सेवा' : 'Online Government Forms & Certificate Services'}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'सटीक विवरण व दस्तावेज भरें — हमारा अधिकृत कैफे ऑपरेटर सरकारी पोर्टल पर फॉर्म भरकर अंतिम रसीद सीधे आपके फोन पर भेज देगा।'
                : 'Fill accurate details and upload documents — our authorized cafe operator will process your form and send the final receipt directly to your phone.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center shrink-0">
            <span className="text-[11px] text-emerald-200 block uppercase font-bold">
              {language === 'hi' ? 'विश्वसनीय डिजिटल सेवा' : 'Trusted Digital Service'}
            </span>
            <div className="text-sm font-black mt-0.5 text-white">
              {language === 'hi' ? '0% रिजेक्शन गारंटी' : '0% Rejection Guarantee'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Categories & Services Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              {language === 'hi' ? 'सेवा चुनें' : 'Select Service'}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {language === 'hi' ? 'e-District अधिकृत सेवाएं' : 'e-District Official Services'}
            </span>
          </div>

          <div className="space-y-3.5 max-h-[82vh] overflow-y-auto pr-1">
            {SERVICES_CATALOG.map((group, idx) => {
              const Icon = group.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs mb-2.5 pb-2 border-b border-slate-100">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>{localize(group.category)}</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                    {group.items.map((item, i) => {
                      const isSelected = selectedService?.id === item.id || selectedService?.name === item.name;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectService(item, group.id)}
                          className={`w-full text-left p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold transition flex items-center justify-between cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                              : 'border-transparent bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[200px] leading-tight">
                            {localize(item.label) || item.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-slate-500 font-mono text-[10px] sm:text-[11px]">₹{item.fee}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Form & Dedicated Inputs (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-6">
            
            {/* Selected Service Header & Department Box */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-400 font-black uppercase tracking-wider block">
                  {selectedService?.dept || activeSchema?.dept || janSevaMatch?.dept || (SERVICES_CATALOG.find(g => g.id === selectedCategory) ? localize(SERVICES_CATALOG.find(g => g.id === selectedCategory).category) : '')}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-xl font-black text-xs">
                  {language === 'hi' ? `सेवा शुल्क: ₹${selectedService?.fee} मात्र` : `Service Fee: ₹${selectedService?.fee}`}
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-black mt-1.5 text-white">
                {localize(selectedService?.label) || selectedService?.name}
              </h4>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeSchema?.bannerText || janSevaMatch?.desc || (language === 'hi' ? 'सरकारी पोर्टल पर सही प्रारूप में फॉर्म भरने हेतु आवश्यक जानकारी दर्ज करें।' : 'Enter required information for official portal submission.')}
              </p>

              {/* Instant Studio Fast Action Button for Jan Seva Services */}
              {(selectedService.isJanSeva || janSevaMatch) && (
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-yellow-300 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'hi' ? 'तत्काल ओरिजिनल PVC कार्ड अथवा प्रमाणित पर्ची चाहिए?' : 'Need instant original PVC card or certified print?'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenJanSevaStudio) {
                        onOpenJanSevaStudio(selectedService.id);
                      }
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '🚀 जनसेवा तत्काल स्टूडियो में खोलें ➔' : '🚀 Open in Jan Seva Studio ➔'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fields Information Banner */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'इस सेवा के लिए आवश्यक कॉलम नीचे दिए गए हैं - कृपया वास्तविक विवरण दर्ज करें:' : 'Mandatory fields for this service are listed below - please enter valid details:'}</span>
              </div>
            </div>

            {/* DYNAMIC SCHEMA FIELDS */}
            {activeSchema?.fields ? (
              <div className="space-y-4">
                <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'आवेदक का आवश्यक विवरण:' : 'Mandatory Applicant Details:'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeSchema.fields.map((fld) => (
                    <div key={fld.id} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>{fld.label}</span>
                        {fld.required && <span className="text-red-500 font-black">*</span>}
                      </label>

                      {fld.type === 'select' ? (
                        <select
                          value={formFields[fld.id] || fld.options[0]}
                          onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                        >
                          {fld.options.map((opt, oi) => (
                            <option key={oi} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={fld.type}
                          required={fld.required}
                          placeholder={fld.placeholder}
                          value={formFields[fld.id] || ''}
                          onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                          className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : janSevaMatch?.fields ? (
              <div className="space-y-4">
                <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? 'जनसेवा आवेदन विवरण:' : 'Jan Seva Service Details:'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {janSevaMatch.fields.map((fld) => (
                    <div key={fld.id} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>{fld.label}</span>
                        {fld.required && <span className="text-red-500 font-black">*</span>}
                      </label>

                      {fld.type === 'select' ? (
                        <select
                          value={formFields[fld.id] || fld.options[0]}
                          onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                        >
                          {fld.options.map((opt, oi) => (
                            <option key={oi} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={fld.type}
                          required={fld.required}
                          placeholder={fld.placeholder}
                          value={formFields[fld.id] || ''}
                          onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                          className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Standard Fallback Form Fields
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{language === 'hi' ? 'आवेदक का नाम *' : 'Applicant Full Name *'}</label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                      value={formFields.applicantName || ''}
                      onChange={(e) => handleFieldChange('applicantName', e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}</label>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      placeholder={language === 'hi' ? '10-अंकीय मोबाइल' : '10-digit Mobile'}
                      value={formFields.phone || ''}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{language === 'hi' ? 'अतिरिक्त जानकारी व निर्देश' : 'Additional Information & Instructions'}</label>
                  <textarea
                    rows={2}
                    placeholder={language === 'hi' ? 'पिता का नाम, जन्मतिथि, वर्ग या कोई विशेष निर्देश' : "Father's name, DOB, category or specific instructions"}
                    value={formFields.details || ''}
                    onChange={(e) => handleFieldChange('details', e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* DEDICATED REQUIRED DOCUMENT UPLOAD SLOTS */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'अनिवार्य दस्तावेज अपलोड:' : 'Required Document Uploads:'}</span>
                </h5>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {language === 'hi' ? 'PDF या साफ फोटो मान्य' : 'PDF or clear photo accepted'}
                </span>
              </div>

              {/* If specific slots defined */}
              {activeSchema?.docsRequired && activeSchema.docsRequired.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeSchema.docsRequired.map((slot) => {
                    const uploaded = slotFiles[slot.id];
                    return (
                      <div
                        key={slot.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                          uploaded 
                            ? 'bg-emerald-50/70 border-emerald-400' 
                            : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 leading-snug">
                            {slot.label}
                          </span>
                          {slot.required && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black shrink-0">
                              {language === 'hi' ? 'अनिवार्य' : 'Required'}
                            </span>
                          )}
                        </div>

                        {uploaded ? (
                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-300 text-xs">
                            <div className="flex items-center gap-2 truncate max-w-[190px]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-bold text-slate-900 truncate">{uploaded.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSlotFile(slot.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title={language === 'hi' ? 'हटाएं' : 'Remove'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <label className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs">
                              <Upload className="w-3.5 h-3.5 text-blue-600" />
                              <span>{language === 'hi' ? 'फ़ाइल चुनें' : 'Choose File'}</span>
                              <input
                                type="file"
                                accept={slot.accept || '.pdf,image/*'}
                                className="hidden"
                                onChange={(e) => handleSlotFileUpload(slot.id, e.target.files?.[0])}
                              />
                            </label>

                            <label className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold p-2 rounded-xl text-xs flex items-center justify-center cursor-pointer transition shadow-xs" title={language === 'hi' ? 'कैमरा से फोटो खींचें' : 'Take photo'}>
                              <Camera className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => handleSlotFileUpload(slot.id, e.target.files?.[0])}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Generic Upload Dropzone if no schema
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 rounded-2xl p-5 text-center transition">
                  <label htmlFor="generic-doc-upload" className="cursor-pointer block">
                    <Upload className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                      {language === 'hi' ? 'आवश्यक दस्तावेज (फोटो, आधार या मार्कशीट) चुनने हेतु क्लिक करें' : 'Click to select required documents (Photo, Aadhaar or Marksheet)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'hi' ? 'PDF, JPG, PNG (अधिकतम 15MB प्रति फ़ाइल)' : 'PDF, JPG, PNG (Max 15MB per file)'}
                    </p>
                    <input
                      id="generic-doc-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleExtraFilesUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Extra Document Upload Toggle */}
              <div className="pt-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>{language === 'hi' ? '+ कोई अन्य अतिरिक्त दस्तावेज जोड़ें' : '+ Add extra document'}</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleExtraFilesUpload}
                  />
                </label>

                {extraFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {extraFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[240px]">{f.name}</span>
                        <button type="button" onClick={() => removeExtraFile(i)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Choice Selection */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                {language === 'hi' ? '💳 भुगतान का तरीका चुनें *' : '💳 Select Payment Method *'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Option 1: Digital Wallet */}
                <div
                  onClick={() => setPaymentChoice('paid_wallet')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    paymentChoice === 'paid_wallet'
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{language === 'hi' ? '🟢 डिजिटल वॉलेट' : '🟢 Digital Wallet'}</span>
                    <span className="font-black text-emerald-700">₹{selectedService?.fee}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi' ? `घर बैठे 1-क्लिक भुगतान। ${customerWallet ? `(बैलेंस: ₹${customerWallet.balance})` : ''}` : `1-click payment from home. ${customerWallet ? `(Balance: ₹${customerWallet.balance})` : ''}`}
                  </p>
                </div>

                {/* Option 2: Instant UPI */}
                <div
                  onClick={() => setPaymentChoice('paid_upi')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    paymentChoice === 'paid_upi'
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{language === 'hi' ? '💳 तुरंत ऑनलाइन UPI' : '💳 Instant Online UPI'}</span>
                    <span className="font-black text-blue-700">₹{selectedService?.fee}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi' ? 'PhonePe / Google Pay QR से तुरंत भुगतान।' : 'Instant payment via PhonePe / Google Pay QR.'}
                  </p>
                </div>

                {/* Option 3: Pay Cash at Shop */}
                <div
                  onClick={() => setPaymentChoice('pay_cash_at_shop')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    paymentChoice === 'pay_cash_at_shop'
                      ? 'bg-amber-50 border-amber-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-900">{language === 'hi' ? '🟡 दुकान पर नकद भुगतान' : '🟡 Pay Cash at Cafe Shop'}</span>
                    <span className="font-black text-amber-800">₹{selectedService?.fee}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi' ? 'फॉर्म सबमिट रहेगा, जब दुकान पर कैश देंगे तब ऑपरेटर अप्लाई करेगा।' : 'Form remains queued; operator will apply once cash is received.'}
                  </p>
                </div>

                {/* Option 4: Pay Online Later */}
                <div
                  onClick={() => setPaymentChoice('pay_online_later')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    paymentChoice === 'pay_online_later'
                      ? 'bg-orange-50 border-orange-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-orange-900">{language === 'hi' ? '🟠 बाद में ऑनलाइन भुगतान' : '🟠 Pay Online Later'}</span>
                    <span className="font-black text-orange-800">₹{selectedService?.fee}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi' ? 'फॉर्म तुरंत कतार में रहेगा। 1 घंटे में ऑनलाइन पे करने पर अप्लाई होगा।' : 'Form queued immediately; processed once paid online within 1 hour.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-4 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{language === 'hi' ? 'आवेदन सबमिट हो रहा है...' : 'Submitting application...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{language === 'hi' ? `आवेदन सबमिट करें (शुल्क: ₹${selectedService?.fee})` : `Submit Application (Fee: ₹${selectedService?.fee})`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'hi' ? 'फॉर्म भरने के बाद फाइनल पावती रसीद आपके टोकन नंबर पर अपलोड कर दी जाएगी।' : 'After submission, official acknowledgement receipt will be uploaded to your token.'}
              </p>
            </div>

          </form>

        </div>

      </div>

      {/* Confirmation Token Modal */}
      <PrintTokenModal
        isOpen={!!submittedData}
        onClose={() => setSubmittedData(null)}
        data={submittedData}
        type="service"
      />

    </div>
  );
}
