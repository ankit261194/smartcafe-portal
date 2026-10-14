import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Store, Phone, MapPin, 
  CreditCard, IndianRupee, QrCode, CheckCircle2, AlertCircle,
  Wallet, ShieldCheck, Award, ArrowUpRight, TrendingUp, RefreshCw,
  Lock, KeyRound, Users, UserCheck, ShieldAlert, Globe, Eye, EyeOff
} from 'lucide-react';
import { authFetch } from '../utils/api';

export default function AdminSettings({
  settings,
  onSettingsUpdated,
  onOpenStandee,
  selectedCafe,
  onOpenB2bWallet,
  onOpenLicenseCertificate,
  onOpenKycModal
}) {
  const [formData, setFormData] = useState({
    shopName: selectedCafe?.shopName || settings?.shopName || '',
    tagline: selectedCafe?.tagline || settings?.tagline || '',
    ownerName: selectedCafe?.ownerName || settings?.ownerName || '',
    phone: selectedCafe?.phone || settings?.phone || '',
    upiId: selectedCafe?.upiId || settings?.upiId || '',
    address: selectedCafe?.address || settings?.address || '',
    rates: {
      bwPage: selectedCafe?.rates?.bwPage || settings?.rates?.bwPage || 3,
      colorPage: selectedCafe?.rates?.colorPage || settings?.rates?.colorPage || 10,
      xerox: selectedCafe?.rates?.xerox || settings?.rates?.xerox || 2,
      lamination: selectedCafe?.rates?.lamination || settings?.rates?.lamination || 20,
      passportPhoto: selectedCafe?.rates?.passportPhoto || settings?.rates?.passportPhoto || 50,
      formFeeNormal: selectedCafe?.rates?.formFeeNormal || settings?.rates?.formFeeNormal || 70,
    }
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync formData whenever selectedCafe changes
  useEffect(() => {
    if (selectedCafe) {
      setFormData({
        shopName: selectedCafe.shopName || settings?.shopName || '',
        tagline: selectedCafe.tagline || settings?.tagline || '',
        ownerName: selectedCafe.ownerName || settings?.ownerName || '',
        phone: selectedCafe.phone || settings?.phone || '',
        upiId: selectedCafe.upiId || settings?.upiId || '',
        address: selectedCafe.address || settings?.address || '',
        rates: {
          bwPage: selectedCafe.rates?.bwPage || settings?.rates?.bwPage || 3,
          colorPage: selectedCafe.rates?.colorPage || settings?.rates?.colorPage || 10,
          xerox: selectedCafe.rates?.xerox || settings?.rates?.xerox || 2,
          lamination: selectedCafe.rates?.lamination || settings?.rates?.lamination || 20,
          passportPhoto: selectedCafe.rates?.passportPhoto || settings?.rates?.passportPhoto || 50,
          formFeeNormal: selectedCafe.rates?.formFeeNormal || settings?.rates?.formFeeNormal || 70,
        }
      });
    }
  }, [selectedCafe]);

  // Rate Card & Profit Margin Engine state
  const [b2bRatesData, setB2bRatesData] = useState(null);
  const [retailRatesForm, setRetailRatesForm] = useState({
    rcDownload: 250,
    panCard: 150,
    incomeCert: 80,
    casteCert: 80,
    niwasCert: 80,
    drivingLicence: 250,
    pvcCard: 70
  });
  const [savingB2bRates, setSavingB2bRates] = useState(false);
  const [b2bRatesSuccess, setB2bRatesSuccess] = useState(false);

  // PIN Change State
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '' });
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMessage, setPinMessage] = useState(null);

  // Staff Mode Security & Helper PIN State
  const [staffEnabled, setStaffEnabled] = useState(selectedCafe?.staffEnabled !== false);
  const [staffPinInput, setStaffPinInput] = useState('');
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffMessage, setStaffMessage] = useState(null);

  // 1-Click Backup State
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  // Configurable Server URL State (for Mobile APK and remote PCs)
  const [customServerUrl, setCustomServerUrl] = useState(() => localStorage.getItem('cybercafe_server_url') || '');
  const [serverTestStatus, setServerTestStatus] = useState(null);
  const [testingServer, setTestingServer] = useState(false);

  const handleTestServer = async () => {
    setTestingServer(true);
    setServerTestStatus(null);
    try {
      const target = customServerUrl.trim().replace(/\/+$/, '') || window.location.origin;
      const res = await fetch(`${target}/api/settings`);
      if (res.ok) {
        setServerTestStatus({ success: true, msg: '✅ सर्वर से सफलतापूर्वक कनेक्ट हो गया!' });
      } else {
        setServerTestStatus({ success: false, msg: `❌ सर्वर त्रुटि (Status: ${res.status})` });
      }
    } catch (err) {
      setServerTestStatus({ success: false, msg: '❌ कनेक्शन विफल! कृपया IP/पोर्ट जांचें।' });
    } finally {
      setTestingServer(false);
    }
  };

  const handleSaveServerUrl = () => {
    if (customServerUrl.trim()) {
      localStorage.setItem('cybercafe_server_url', customServerUrl.trim().replace(/\/+$/, ''));
      alert('सर्वर URL सुरक्षित कर दिया गया! ऐप अब इस सर्वर से कनेक्ट होगा।');
    } else {
      localStorage.removeItem('cybercafe_server_url');
      alert('डिफ़ॉल्ट सर्वर URL रीसेट कर दिया गया।');
    }
  };

  // Sync staffEnabled whenever selectedCafe changes
  useEffect(() => {
    if (selectedCafe) {
      setStaffEnabled(selectedCafe.staffEnabled !== false);
    }
  }, [selectedCafe]);

  const fetchB2bRates = async () => {
    const cafeId = selectedCafe?.id;
    if (!cafeId) return;
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/rates`);
      if (res.ok) {
        const data = await res.json();
        setB2bRatesData(data);
        if (data.retailRates) {
          setRetailRatesForm(data.retailRates);
        }
      }
    } catch (err) {
      console.error('Error fetching B2B rates:', err);
    }
  };

  useEffect(() => {
    if (selectedCafe?.id) {
      fetchB2bRates();
    }
  }, [selectedCafe?.id]);

  const handleSaveRetailRates = async (e) => {
    e.preventDefault();
    const cafeId = selectedCafe?.id;
    if (!cafeId) {
      alert('कृपया पहले कोई कैफ़े चुनें!');
      return;
    }
    setSavingB2bRates(true);
    setB2bRatesSuccess(false);
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/retail-rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retailRatesForm)
      });
      if (res.ok) {
        setB2bRatesSuccess(true);
        fetchB2bRates();
      }
    } catch (err) {
      console.error(err);
      alert('रेट सुरक्षित करने में समस्या आई।');
    } finally {
      setSavingB2bRates(false);
    }
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setSuccess(false);
  };

  const handleRateChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      rates: { ...prev.rates, [field]: parseFloat(val) || 0 }
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const cafeId = selectedCafe?.id;
    if (!cafeId) {
      alert('कृपया पहले कोई कैफ़े चुनें!');
      setSaving(false);
      return;
    }

    try {
      // Multi-tenant isolated settings update
      const cafeRes = await authFetch(`/api/cafes/${cafeId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      // Fallback global settings update
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if ((cafeRes.ok || res.ok) && (data.success || cafeRes.ok)) {
        setSuccess(true);
        if (onSettingsUpdated) onSettingsUpdated(data.settings);
      }
    } catch (err) {
      console.error(err);
      alert('सेटिंग्स सेव करने में समस्या आई।');
    } finally {
      setSaving(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const cafeId = selectedCafe?.id;
    if (!cafeId) {
      setPinMessage({ type: 'error', text: 'कृपया पहले कोई कैफ़े चुनें!' });
      return;
    }
    setPinSaving(true);
    setPinMessage(null);
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPinMessage({ type: 'success', text: 'पिन सफलतापूर्वक बदल दिया गया! (नया 4-अंकीय PIN सक्रिय है)' });
        setPinForm({ oldPin: '', newPin: '' });
      } else {
        setPinMessage({ type: 'error', text: data.error || 'पिन बदलने में विफलता।' });
      }
    } catch (err) {
      setPinMessage({ type: 'error', text: 'सर्वर से कनेक्ट करने में त्रुटि।' });
    } finally {
      setPinSaving(false);
    }
  };

  const handleSaveStaffPin = async (e) => {
    e.preventDefault();
    const cafeId = selectedCafe?.id;
    if (!cafeId) {
      setStaffMessage({ type: 'error', text: 'कृपया पहले कोई कैफ़े चुनें!' });
      return;
    }
    if (staffPinInput && !/^\d{4}$/.test(staffPinInput.trim())) {
      setStaffMessage({ type: 'error', text: 'कृपया ठीक 4 अंकों का पिन दर्ज करें (जैसे 0000)' });
      return;
    }
    setStaffSaving(true);
    setStaffMessage(null);
    try {
      const body = { staffEnabled };
      if (staffPinInput.trim()) {
        body.staffPin = staffPinInput.trim();
      }
      const res = await authFetch(`/api/cafes/${cafeId}/staff-pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffMessage({ type: 'success', text: 'स्टाफ / हेल्पर सेटिंग्स सफलतापूर्वक सुरक्षित हो गईं! (नया स्टाफ पिन सक्रिय)' });
        setStaffPinInput('');
      } else {
        setStaffMessage({ type: 'error', text: data.error || 'स्टाफ सेटिंग्स सहेजने में विफल।' });
      }
    } catch (err) {
      setStaffMessage({ type: 'error', text: 'सर्वर से कनेक्ट करने में त्रुटि।' });
    } finally {
      setStaffSaving(false);
    }
  };

  const handleDownloadBackup = async () => {
    const cafeId = selectedCafe?.id;
    if (!cafeId) {
      alert('कृपया पहले कोई कैफ़े चुनें!');
      return;
    }
    setDownloadingBackup(true);
    try {
      const res = await authFetch(`/api/system/backup?cafeId=${cafeId}`);
      if (!res.ok) throw new Error('बैकअप डाउनलोड करने में त्रुटि!');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberCafe_${cafeId}_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('बैकअप डाउनलोड विफल: ' + (err.message || 'त्रुटि'));
    } finally {
      setDownloadingBackup(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            दुकान व रेट सेटिंग्स (Shop Profile & Rates)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            अपने कैफे का नाम, संपर्क, UPI आईडी और प्रिंट/सर्विस रेट्स यहाँ सेट करें।
          </p>
        </div>

        <button
          onClick={onOpenStandee}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>काउंटर A4 QR पोस्टर प्रिंट करें</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>दुकान सेटिंग्स व रेट सफलतापूर्वक अपडेट हो गए हैं! ✓</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Shop Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            दुकान की बुनियादी जानकारी (Shop Info)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">दुकान / केंद्र का नाम *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">टैगलाइन / उपनाम</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">संचालक / मालिक का नाम</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">मोबाइल नंबर (WhatsApp)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">UPI ID (पेमेंट QR हेतु) *</label>
              <input
                type="text"
                required
                placeholder="UPI ID दर्ज करें"
                value={formData.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">दुकान का पूरा पता</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rate Card Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            रेट कार्ड सेटिंग्स (Service Rates Configuration)
          </h3>
          <p className="text-xs text-slate-500">
            ये रेट्स कस्टमर पोर्टल पर क्विक प्रिंट और फॉर्म अप्लाई करते समय स्वतः लागू होंगे।
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-600 font-semibold mb-1">B&W प्रिंट (प्रति पेज ₹)</label>
              <input
                type="number"
                min="1"
                value={formData.rates.bwPage}
                onChange={(e) => handleRateChange('bwPage', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-600 font-semibold mb-1">कलर प्रिंट (प्रति पेज ₹)</label>
              <input
                type="number"
                min="1"
                value={formData.rates.colorPage}
                onChange={(e) => handleRateChange('colorPage', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-600 font-semibold mb-1">फोटोकॉपी Xerox (प्रति पेज ₹)</label>
              <input
                type="number"
                min="1"
                value={formData.rates.xerox}
                onChange={(e) => handleRateChange('xerox', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-600 font-semibold mb-1">लेमिनेशन (प्रति शीट ₹)</label>
              <input
                type="number"
                min="1"
                value={formData.rates.lamination}
                onChange={(e) => handleRateChange('lamination', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-600 font-semibold mb-1">पासपोर्ट फोटो 8 पीस (₹)</label>
              <input
                type="number"
                min="1"
                value={formData.rates.passportPhoto}
                onChange={(e) => handleRateChange('passportPhoto', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-slate-600 font-semibold mb-1">सामान्य फॉर्म सर्विस चार्ज (₹)</label>
              <input
                type="number"
                min="1"
                value={formData.rates.formFeeNormal}
                onChange={(e) => handleRateChange('formFeeNormal', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'सहेज रहे हैं...' : 'दुकान प्रोफाइल व रेट्स सुरक्षित करें (Save Profile)'}</span>
        </button>

      </form>

      {/* Operator PIN Security Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>संचालक 4-अंकीय सुरक्षा पिन बदलें (Change Operator PIN)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            कैफे एडमिन पैनल में लॉगिन करने हेतु प्रयुक्त होने वाला 4-अंकीय गुप्त पिन यहाँ से सुरक्षित रूप से बदलें। (डिफ़ॉल्ट पिन: 1234)
          </p>
        </div>

        {pinMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            pinMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {pinMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{pinMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="flex flex-col sm:flex-row items-end gap-3 pt-1">
          <div className="w-full sm:w-48">
            <label className="block text-slate-600 font-semibold mb-1 text-xs">पुराना पिन (Current PIN) *</label>
            <div className="relative">
              <input
                type={showOldPin ? "text" : "password"}
                maxLength="4"
                required
                value={pinForm.oldPin}
                onChange={(e) => setPinForm(prev => ({ ...prev, oldPin: e.target.value }))}
                placeholder="वर्तमान PIN"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-hidden pr-8"
              />
              <button
                type="button"
                onClick={() => setShowOldPin(!showOldPin)}
                className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showOldPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-slate-600 font-semibold mb-1 text-xs">नया 4-अंकीय पिन *</label>
            <div className="relative">
              <input
                type={showNewPin ? "text" : "password"}
                maxLength="4"
                required
                value={pinForm.newPin}
                onChange={(e) => setPinForm(prev => ({ ...prev, newPin: e.target.value }))}
                placeholder="नया PIN"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-hidden pr-8"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-2 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pinSaving}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{pinSaving ? 'बदल रहे हैं...' : 'पिन अपडेट करें ➔'}</span>
          </button>
        </form>
      </div>

      {/* Staff / Helper Mode Security Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>स्टाफ / हेल्पर मोड सेटिंग्स (Staff Mode Security & Helper PIN)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              अपने दुकान सहायक (Staff / Helper) को केवल प्रिंट कतार व फॉर्म भरने की अनुमति दें, जबकि कैशबुक, उधारी व थोक दरें पूरी तरह गोपनीय रहें। (डिफ़ॉल्ट पिन: 0000)
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <input
              type="checkbox"
              checked={staffEnabled}
              onChange={(e) => setStaffEnabled(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500"
            />
            <span className="text-xs font-bold text-slate-800">
              {staffEnabled ? '✓ स्टाफ लॉगिन सक्रिय (Active)' : '✕ स्टाफ लॉगिन बंद (Disabled)'}
            </span>
          </label>
        </div>

        {staffMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            staffMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {staffMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{staffMessage.text}</span>
          </div>
        )}

        {/* Staff Privileges Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>स्टाफ को स्वीकृत सुविधाएं (Allowed Privileges)</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>लाइव प्रिंट कतार (Live Print Queue) देखना व प्रिंट निकालना</li>
              <li>नागरिक फॉर्म आवेदन (Form Applications) व OTP दर्ज करना</li>
              <li>फ़ोटो व हस्ताक्षर क्रॉपिंग टूल (Photo/Signature Tool)</li>
              <li>दस्तावेज़ PDF मर्जर व फाइल स्प्लिटर (PDF Tools)</li>
            </ul>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>स्टाफ से पूरी तरह सुरक्षित व बंद (Hidden & Blocked)</span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>दुकान बहीखाता व दैनिक आमदनी (Cashbook & Revenue)</li>
              <li>ग्राहक उधारी रजिस्टर (Customer Udhar Ledger)</li>
              <li>सुपर एडमिन थोक दरें व B2B वॉलेट (Wholesale Rates & B2B)</li>
              <li>दुकान मालिक सेटिंग्स व मास्टर पिन (Owner Settings & PIN)</li>
            </ul>
          </div>
        </div>

        {/* Staff PIN Update Form */}
        <form onSubmit={handleSaveStaffPin} className="flex flex-col sm:flex-row items-end gap-3 pt-1">
          <div className="w-full sm:w-64">
            <label className="block text-slate-600 font-semibold mb-1 text-xs">नया 4-अंकीय स्टाफ पिन (Staff PIN)</label>
            <input
              type="password"
              maxLength="4"
              value={staffPinInput}
              onChange={(e) => setStaffPinInput(e.target.value)}
              placeholder="नया स्टाफ पिन (4-अंक)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={staffSaving}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{staffSaving ? 'सहेज रहे हैं...' : 'स्टाफ सेटिंग्स सुरक्षित करें ➔'}</span>
          </button>
        </form>
      </div>

      {/* 1. Sanchalak B2B Wallet Status & Threshold Gate Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span>संचालक B2B वॉलेट स्थिति (Sanchalak B2B Balance & Service Gate)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              सुपर एडमिन थोक API सेवाओं (RC डाउनलोड, पैन खोज) के उपयोग हेतु B2B बैलेंस अनिवार्य है।
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenB2bWallet}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>B2B वॉलेट रिचार्ज करें (Top-Up) ➔</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">वर्तमान B2B बैलेंस</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl font-black ${(b2bRatesData?.b2bBalance ?? selectedCafe?.b2bWallet?.balance ?? 0) < 200 ? 'text-red-600' : 'text-slate-900'}`}>
                ₹{b2bRatesData?.b2bBalance ?? selectedCafe?.b2bWallet?.balance ?? 0}
              </span>
              {(b2bRatesData?.b2bBalance ?? selectedCafe?.b2bWallet?.balance ?? 0) < 200 && (
                <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  कम बैलेंस!
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">न्यूनतम आवश्यक थ्रेशोल्ड</span>
            <span className="text-2xl font-black text-slate-700 mt-1 block">
              ₹{b2bRatesData?.minThreshold || 200}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">ऑटोमेटेड सेवाएं स्थिति</span>
            <span className={`text-sm font-black mt-2 block flex items-center gap-1.5 ${(b2bRatesData?.b2bBalance ?? selectedCafe?.b2bWallet?.balance ?? 0) >= 200 ? 'text-emerald-700' : 'text-red-600'}`}>
              {(b2bRatesData?.b2bBalance ?? selectedCafe?.b2bWallet?.balance ?? 0) >= 200 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>सक्रिय (Online & Active)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>ऑफलाइन (Balance Below ₹200)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {(b2bRatesData?.b2bBalance ?? selectedCafe?.b2bWallet?.balance ?? 0) < 200 && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">चेतावनी: आपका B2B बैलेंस न्यूनतम सीमा (₹200) से कम है!</p>
              <p className="text-[11px] text-red-700 mt-0.5">
                ग्राहक पोर्टल पर RC डाउनलोड जैसी स्वचालित सेवाएं तब तक बंद रहेंगी जब तक आप सुपर एडमिन को 12-अंकीय UTR भेजकर B2B वॉलेट टॉप-अप नहीं कर लेते।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Rate Card & Profit Margin Engine (Wholesale vs Retail) Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>संचालक रेट कार्ड व प्रॉफिट मार्जिन इंजन (Sanchalak Rate Card & Profit Margin Engine)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              सुपर एडमिन थोक आधार लागत (Wholesale Base Cost) के आधार पर अपनी खुदरा दरें (Retail Price) तय करें और अपना शुद्ध मुनाफा कमाएं।
            </p>
          </div>

          <button
            type="button"
            onClick={fetchB2bRates}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश दरें</span>
          </button>
        </div>

        {b2bRatesSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>संचालक खुदरा दरें व लाभ मार्जिन सफलतापूर्वक अपडेट हो गए! ✓</span>
          </div>
        )}

        <form onSubmit={handleSaveRetailRates} className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">सेवा का नाम (Automated Service)</th>
                  <th className="py-2.5 px-3">सुपर एडमिन थोक दर (Wholesale Cost)</th>
                  <th className="py-2.5 px-3">संचालक खुदरा मूल्य (Your Retail Price ₹)</th>
                  <th className="py-2.5 px-3">संचालक शुद्ध मुनाफा (Net Margin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { key: 'rcDownload', name: 'वाहन RC Parivahan Download', base: b2bRatesData?.superAdminRates?.rcDownload || 200 },
                  { key: 'panCard', name: 'पैन कार्ड त्वरित खोज (PAN Instant Find)', base: b2bRatesData?.superAdminRates?.panCard || 100 },
                  { key: 'drivingLicence', name: 'ड्राइविंग लाइसेंस विवरण (DL Details)', base: b2bRatesData?.superAdminRates?.drivingLicence || 200 },
                  { key: 'incomeCert', name: 'आय प्रमाण पत्र (Income Certificate)', base: b2bRatesData?.superAdminRates?.incomeCert || 50 },
                  { key: 'casteCert', name: 'जाति प्रमाण पत्र (Caste Certificate)', base: b2bRatesData?.superAdminRates?.casteCert || 50 },
                  { key: 'niwasCert', name: 'निवास प्रमाण पत्र (Domicile Certificate)', base: b2bRatesData?.superAdminRates?.niwasCert || 50 },
                  { key: 'pvcCard', name: 'CR-80 PVC स्मार्ट कार्ड प्रिंटिंग', base: b2bRatesData?.superAdminRates?.pvcCard || 40 }
                ].map((item) => {
                  const retailVal = retailRatesForm[item.key] !== undefined ? retailRatesForm[item.key] : (item.base + 50);
                  const netMargin = retailVal - item.base;

                  return (
                    <tr key={item.key} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-extrabold text-slate-800">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        ₹{item.base}
                        <span className="block text-[10px] text-slate-400 font-normal">एडमिन B2B डेबिट</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-bold">₹</span>
                          <input
                            type="number"
                            min={item.base}
                            value={retailVal}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || item.base;
                              setRetailRatesForm(prev => ({ ...prev, [item.key]: val }));
                              setB2bRatesSuccess(false);
                            }}
                            className="w-24 bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                          netMargin >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          <span>+₹{netMargin}</span>
                          <span className="text-[10px] opacity-75">प्रति ऑर्डर</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingB2bRates}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingB2bRates ? 'सुरक्षित कर रहे हैं...' : 'खुदरा रेट व मार्जिन सुरक्षित करें (Save Rates)'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Chain-to-Chain ₹299 Subscription & VLE Digital License Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>चेन-टू-चेन ₹299 सब्सक्रिप्शन व VLE डिजिटल लाइसेंस (Digital License & KYC)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              365 दिन अधिकृत डिजिटल सेवा केंद्र लाइसेंस प्रमाणपत्र और नेटवर्क सदस्यता की स्थिति।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenLicenseCertificate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>प्रमाण पत्र देखें (Print License)</span>
            </button>

            <button
              type="button"
              onClick={onOpenKycModal}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <span>रिन्यू / नया आवेदन</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">लाइसेंस संख्या (License Key):</span>
            <span className="font-mono font-black text-slate-800 text-sm block mt-0.5">
              {selectedCafe?.licenseKey || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">KYC सत्यापन स्थिति:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>सत्यापित अधिकृत केंद्र (Verified)</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[11px]">सब्सक्रिप्शन वैधता (Validity):</span>
            <span className="font-bold text-slate-800 block mt-0.5">
              365 दिन (वार्षिक प्रो प्लान सक्रिय)
            </span>
          </div>
        </div>
      </div>

      {/* Network & Wi-Fi IP Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Store className="w-4 h-4 text-indigo-600" />
          दुकान Wi-Fi नेटवर्क स्थिति (Mobile Connection URL)
        </h3>
        <p className="text-xs text-slate-500">
          दुकान के वाई-फाई या नेटवर्क से जुड़ा कोई भी ग्राहक अपने फोन में यह लिंक खोलकर फाइल भेज सकता है:
        </p>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="font-mono text-sm font-bold text-slate-800">
            http://192.168.1.2:5000
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText('http://192.168.1.2:5000');
              alert('Wi-Fi लिंक कॉपी हो गया!');
            }}
            className="text-xs bg-white border border-slate-300 hover:bg-slate-100 font-bold px-3 py-1.5 rounded-lg shadow-xs"
          >
            कॉपी करें
          </button>
        </div>
      </div>

      {/* Mobile APK & Remote Server Endpoint Configuration Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>मोबाइल ऐप व रिमोट सर्वर सेटिंग्स (Configurable Server Endpoint)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Android APK या रिमोट डिवाइस को सर्वर से जोड़ने के लिए सर्वर IP या डोमेन सेट करें (जैसे http://192.168.1.5:5000)।
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customServerUrl}
              onChange={(e) => {
                setCustomServerUrl(e.target.value);
                setServerTestStatus(null);
              }}
              placeholder="http://192.168.1.X:5000 या https://portal.example.com"
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleTestServer}
              disabled={testingServer}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>{testingServer ? 'जांच हो रही है...' : 'कनेक्शन टेस्ट करें'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveServerUrl}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>सहेजें (Save)</span>
            </button>
          </div>

          {serverTestStatus && (
            <div className={`p-2.5 rounded-xl text-xs font-bold ${serverTestStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {serverTestStatus.msg}
            </div>
          )}
        </div>
      </div>

      {/* Data Backup & Restore Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600" />
            <span>डेटा बैकअप व सुरक्षा (1-Click Safe Backup & Restore)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            अपनी दुकान का पूरा हिसाब, उधारी रजिस्टर और ग्राहक डेटा सुरक्षित रखने के लिए 1-क्लिक में सुरक्षित JSON बैकअप डाउनलोड करें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={downloadingBackup}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{downloadingBackup ? 'सुरक्षित बैकअप तैयार हो रहा है...' : '📥 1-क्लिक सुरक्षित बैकअप डाउनलोड करें (Export JSON)'}</span>
          </button>

          <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition border border-slate-200">
            <span>📤 बैकअप फ़ाइल से रीस्टोर करें</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const fd = new FormData();
                  fd.append('backupFile', e.target.files[0]);
                  const res = await authFetch('/api/backup/restore', { method: 'POST', body: fd });
                  const data = await res.json();
                  if (data.success) {
                    alert('डेटा सफलतापूर्वक रीस्टोर हो गया!');
                    window.location.reload();
                  } else {
                    alert(data.error || 'रीस्टोर विफल');
                  }
                }
              }}
            />
          </label>
        </div>
      </div>

    </div>
  );
}
