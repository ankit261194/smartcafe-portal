import React, { useState } from 'react';
import { 
  Building2, User, Phone, Mail, Award, CheckCircle2, 
  AlertCircle, ShieldCheck, CreditCard, Sparkles, X
} from 'lucide-react';

export default function VleKycModal({ isOpen, onClose, onKycSubmitted }) {
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vleId, setVleId] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('उत्तर प्रदेश');
  const [pincode, setPincode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [utr, setUtr] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentSlip(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsAccepted) {
      setErrorMsg('कृपया चेन-टू-चेन सेवा शर्तें व नियम स्वीकार करें।');
      return;
    }

    const cleanUtr = utr.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('कृपया ₹299 फीस हेतु ठीक 12 अंकों का वैध UPI UTR संदर्भ नंबर दर्ज करें।');
      return;
    }

    if (!paymentSlip) {
      setErrorMsg('कृपया ₹299 भुगतान का स्क्रीनशॉट / रसीद पर्ची अनिवार्य रूप से अपलोड करें।');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentSlip', paymentSlip);
      formData.append('shopName', shopName.trim());
      formData.append('ownerName', ownerName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('vleId', vleId.trim().toUpperCase());
      formData.append('aadhaarNo', aadhaarNo.trim());
      formData.append('panNo', panNo.trim().toUpperCase());
      formData.append('upiId', upiId.trim() || `${phone.trim()}@upi`);
      formData.append('address', address.trim());
      formData.append('city', city.trim());
      formData.append('district', district.trim() || city.trim());
      formData.append('state', state);
      formData.append('pincode', pincode.trim());
      formData.append('termsAccepted', 'true');
      formData.append('utr', cleanUtr);

      const res = await fetch('/api/kyc/apply', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('🎉 VLE KYC आवेदन सफलतापूर्वक जमा हो गया! सुपर एडमिन द्वारा रसीद व UTR सत्यापन के बाद 365 दिन का डिजिटल लाइसेंस सक्रिय होगा (प्रारंभिक B2B बैलेंस ₹0 रहेगा)।');
        if (onKycSubmitted) onKycSubmitted();
      } else {
        setErrorMsg(data.error || 'KYC आवेदन जमा करने में त्रुटि आई।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर से जुड़ने में विफलता।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                VLE KYC रजिस्ट्रेशन एवं ₹299 वार्षिक ऑनबोर्डिंग
              </h3>
              <p className="text-[11px] text-blue-200">
                चेन-टू-चेन लाइसेंसिंग • 365 दिन असीमित पहुंच
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {successMsg ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black">
                ✓
              </div>
              <h4 className="text-lg font-black text-slate-900">
                आवेदन सफलतापूर्वक पंजीकृत हो गया!
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {successMsg}
              </p>
              <button
                onClick={onClose}
                className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
              >
                डैशबोर्ड पर लौटें
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 text-indigo-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  इस फॉर्म के माध्यम से आपका साइबर कैफे केंद्रीय SaaS नेटवर्क पर पंजीकृत होगा और <strong>₹299/वर्ष</strong> में पूर्ण डिजिटल लाइसेंस, रेट कार्ड मार्जिन व ऑटो-फ़िलर टूल मिलेगा।
                </span>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Shop & Owner */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  1. केंद्र एवं संचालक का विवरण
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">दुकान / साइबर कैफे का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="दुकान / साइबर कैफे का नाम दर्ज करें"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">संचालक का पूरा नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="संचालक का पूरा नाम दर्ज करें"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">मोबाइल नंबर *</label>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      placeholder="10 अंकों का मोबाइल नंबर"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ईमेल आईडी</label>
                    <input
                      type="email"
                      placeholder="vle@domain.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">दुकान UPI ID</label>
                    <input
                      type="text"
                      placeholder="shop@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* KYC Identification */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  2. सरकारी पहचान व CSC VLE KYC
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">CSC ID / VLE ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="CSC ID या VLE ID दर्ज करें"
                    value={vleId}
                    onChange={(e) => setVleId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">आधार नंबर (12 अंक) *</label>
                    <input
                      type="text"
                      required
                      maxLength="14"
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaarNo}
                      onChange={(e) => setAadhaarNo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">पैन नंबर *</label>
                    <input
                      type="text"
                      required
                      maxLength="10"
                      placeholder="10-अंकीय पैन नंबर दर्ज करें"
                      value={panNo}
                      onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold uppercase focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  3. दुकान का पता एवं स्थान
                </span>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">पूरा पता *</label>
                  <input
                    type="text"
                    required
                    placeholder="मेन रोड, ब्लॉक चौराहा, नज़दीक तहसील"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">शहर / कस्बा</label>
                    <input
                      type="text"
                      required
                      placeholder="शहर / कस्बा दर्ज करें"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">जिला</label>
                    <input
                      type="text"
                      required
                      placeholder="जिला दर्ज करें"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">पिनकोड</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      placeholder="6-अंकीय पिनकोड दर्ज करें"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Payment of ₹299 */}
              <div className="space-y-3 pt-2 bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
                <span className="font-extrabold text-amber-950 block">
                  4. ₹299 वार्षिक सदस्यता भुगतान (365 दिन डिजिटल लाइसेंस)
                </span>

                <div className="bg-white p-3 rounded-xl border border-amber-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold">सुपर एडमिन भुगतान QR (0% कमीशन):</span>
                  <p className="font-mono font-black text-sm text-indigo-700">superadmin@upi</p>
                  <p className="text-[10px] text-slate-400">फोनपे, गूगलपे या बैंक ऐप से ₹299 ट्रांसफर करें</p>
                </div>

                <div>
                  <label className="block text-slate-800 font-black mb-1">
                    भुगतान रसीद का 12-अंकीय UTR नंबर *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="12"
                    placeholder="12-अंकीय UTR नंबर दर्ज करें"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border-2 border-amber-400 rounded-xl font-mono font-black text-center text-sm tracking-widest text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {utr.length}/12 अंक दर्ज हुए
                  </span>
                </div>

                {/* Mandatory Payment Screenshot Slip Upload */}
                <div className="bg-white p-3 rounded-xl border-2 border-dashed border-indigo-300 space-y-2">
                  <label className="block text-slate-800 font-black text-xs">
                    📸 भुगतान स्क्रीनशॉट / रसीद पर्ची अनिवार्य रूप से अपलोड करें *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {slipPreview && (
                    <div className="mt-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">चयनित रसीद पर्ची:</p>
                      <img src={slipPreview} alt="Receipt Slip Preview" className="h-20 w-auto rounded-lg object-contain border" />
                    </div>
                  )}
                  <p className="text-[10px] text-indigo-700 font-semibold">
                    नोट: सुपर एडमिन द्वारा रसीद की फोटो देखने व अनुमोदन के बाद ही लाइसेंस जारी होगा।
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-700 leading-tight">
                  मैं केंद्रीय डिजिटल सेवा केंद्र नेटवर्क की सभी चेन-टू-चेन सेवा शर्तों, उपभोक्ता गोपनीयता नियमों एवं वार्षिक ₹299 लाइसेंसिंग नीतियों को स्वीकार करता हूँ।
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !termsAccepted || utr.length !== 12 || !paymentSlip}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black py-3 rounded-2xl text-xs transition disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                {submitting ? 'जमा कर रहे हैं...' : '₹299 VLE KYC पंजीकरण सबमिट करें ➔'}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
