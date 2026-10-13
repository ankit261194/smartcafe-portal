import React, { useState, useEffect } from 'react';
import { 
  Car, ShieldCheck, Printer, Download, Sparkles, 
  AlertCircle, CheckCircle2, ArrowRight, RefreshCw, 
  CreditCard, ExternalLink, Scissors, Building2, Smartphone, 
  MapPin, Eye, FileText, Wallet, Fuel, Calendar, Award, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VehicleRCDownload({ 
  selectedCafe, 
  settings, 
  customerPhone = '',
  customerWalletBalance = 0,
  onOpenWallet,
  onOpenPvcPortal,
  onCustomerBalanceUpdated,
  onB2bBalanceUpdated,
  onOpenB2bTopUp
}) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lookingUp, setLookingUp] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [activeView, setActiveView] = useState('certificate'); // 'certificate' or 'pvc_card'
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const cafeId = selectedCafe?.id || '';

  // Check B2B balance gate and service availability
  const checkServiceGate = async () => {
    if (!cafeId) {
      setServiceStatus({ isAvailable: false, reason: 'कृपया पहले एक मान्य साइबर कैफ़े चुनें।' });
      setLoadingStatus(false);
      return;
    }
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/cafes/${cafeId}/service-status/rcDownload`);
      const data = await res.json();
      setServiceStatus(data);
    } catch (err) {
      console.error('Error checking service status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkServiceGate();
  }, [cafeId]);

  // Lookup Vehicle details
  const handleLookup = async (regNoToSearch) => {
    const reg = (regNoToSearch || vehicleNumber).trim().toUpperCase();
    if (reg.length < 6) {
      setErrorMsg('कृपया वैध गाड़ी नंबर (जैसे UP32AB1234) दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setLookingUp(true);
    try {
      const res = await fetch(`/api/rc/lookup/${reg}`);
      const data = await res.json();
      if (res.ok) {
        setVehicleData(data);
      } else {
        setErrorMsg(data.error || 'गाड़ी का विवरण नहीं मिला।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('सर्वर से वाहन डेटा प्राप्त करने में त्रुटि।');
    } finally {
      setLookingUp(false);
    }
  };

  // Execute Two-Tier Zero-Bypass Order
  const handleExecuteOrder = async () => {
    if (!vehicleData) {
      await handleLookup();
    }
    setErrorMsg('');
    setExecutingOrder(true);

    const effectivePhone = customerPhone || (() => {
      try {
        const c = JSON.parse(localStorage.getItem('cybercafe_customer') || '{}');
        return c.phone || '';
      } catch {
        return '';
      }
    })();

    if (!cafeId) {
      setErrorMsg('कृपया पहले अपने नजदीकी साइबर कैफ़े का चयन करें।');
      setExecutingOrder(false);
      return;
    }

    if (!effectivePhone) {
      setErrorMsg('कृपया पहले ग्राहक प्रोफ़ाइल में लॉगिन करें अथवा मोबाइल नंबर दर्ज करें।');
      setExecutingOrder(false);
      return;
    }

    try {
      const res = await fetch('/api/services/execute-automated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId,
          customerPhone: effectivePhone,
          serviceType: 'rcDownload',
          params: { 
            vehicleNumber: vehicleNumber.trim().toUpperCase(),
            customVehicleData: vehicleData
          }
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderResult(data);
        setVehicleData(data.vehicleData);
        setOrderCompleted(true);
        confetti({ particleCount: 70, spread: 60 });
        // Refresh B2B status
        checkServiceGate();
        if (onCustomerBalanceUpdated) onCustomerBalanceUpdated();
        if (onB2bBalanceUpdated) onB2bBalanceUpdated();
      } else {
        setErrorMsg(data.error || 'ऑर्डर पूरा नहीं हो सका।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('ऑर्डर निष्पादित करने में विफलता आई।');
    } finally {
      setExecutingOrder(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const retailFee = serviceStatus?.retailFee || 250;
  const wholesaleCost = serviceStatus?.wholesaleCost || 200;
  const margin = serviceStatus?.margin || 50;
  const isOffline = serviceStatus && !serviceStatus.isAvailable;
  const isFrozen = serviceStatus && serviceStatus.isFrozen;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-indigo-200 mb-2.5">
              <Car className="w-3.5 h-3.5 text-yellow-400" />
              <span>स्तंभ 5 • केंद्रीय वाहन RC डाउनलोड एवं व्हाइट-लेबल डिलीवरी</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              वाहन आरसी (Vehicle RC) डाउनलोड व स्मार्ट PVC पोर्टल
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              किसी भी गाड़ी का नंबर डालें — तुरंत अधिकृत Parivahan RC Certificate और 85.6mm×54mm CR-80 PVC स्मार्ट कार्ड प्रिंट निकालें। आपके कैफे के वॉटरमार्क और नाम के साथ 100% व्हाइट-लेबल!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 text-xs">
              <span className="text-slate-300 block text-[10px] font-semibold">खुदरा सेवा शुल्क (Retail Fee)</span>
              <span className="text-xl font-black text-amber-300">₹{retailFee}</span>
              <span className="text-[10px] text-emerald-300 block font-bold">थोक ₹{wholesaleCost} • मार्जिन +₹{margin}</span>
            </div>
          </div>
        </div>

        {/* B2B Balance Service Gate Alert (Pillar 3) */}
        {isOffline && (
          <div className="mt-5 bg-red-500/20 border-2 border-red-500 text-red-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-pulse">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-white text-sm">
                  ⚠️ सेवा वर्तमान में ऑफलाइन है (दुकानदार B2B बैलेंस थ्रेशोल्ड समाप्त)!
                </h4>
                <p className="mt-0.5 text-red-200">
                  {serviceStatus?.message || `दुकानदार का B2B बैलेंस समाप्त हो चुका है (वर्तमान: ₹${serviceStatus?.b2bBalance || 0}, न्यूनतम ₹${wholesaleCost} आवश्यक)। स्वचालित सेवा सुरक्षा नियम के तहत यह सेवा ग्राहकों हेतु बंद कर दी गई है।`}
                </p>
              </div>
            </div>
            {onOpenB2bTopUp && (
              <button
                type="button"
                onClick={onOpenB2bTopUp}
                className="bg-red-500 hover:bg-red-600 text-white font-black px-4 py-2 rounded-xl text-xs shrink-0 shadow-md transition active:scale-95"
              >
                1-क्लिक B2B टॉप-अप (₹200+) ➔
              </button>
            )}
          </div>
        )}

        {isFrozen && (
          <div className="mt-5 bg-red-600/30 border-2 border-red-500 text-white p-4 rounded-2xl flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm">
                ⛔ कैफे लाइसेंस निलंबित (License Suspended by Super Admin)!
              </h4>
              <p className="mt-0.5 text-red-100">
                ऑडिट अनुपालन उल्लंघन के कारण इस कैफे की सभी स्वचालित सेवाएं फ्रीज कर दी गई हैं।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Search & Execution Card */}
      {!orderCompleted && (
        <div className="no-print bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div>
            <label className="block text-slate-800 font-extrabold text-sm mb-1.5">
              गाड़ी रजिस्ट्रेशन नंबर दर्ज करें (Enter Vehicle Reg No.) *
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength="13"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="वाहन पंजीयन क्रमांक दर्ज करें"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl font-mono font-black text-lg text-slate-900 tracking-wider uppercase focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={lookingUp || isOffline}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className={`w-4 h-4 ${lookingUp ? 'animate-spin' : ''}`} />
                <span>{lookingUp ? 'खोज रहे हैं...' : 'वाहन जांचें (Verify RC)'}</span>
              </button>
            </div>

            {/* Authentic Lookup Helper */}
            <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-500 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>अखिल भारतीय वाहन डेटाबेस: 2-व्हीलर, 4-व्हीलर, कमर्शियल वाहन का वास्तविक आरसी सर्टिफिकेट।</span>
            </div>

            {errorMsg && (
              <div className="mt-3 bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Preliminary Details Preview before double-entry checkout */}
          {vehicleData && (
            <div className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-slate-900 text-sm">
                    वाहन विवरण सत्यापित (Parivahan Vahan Verified)
                  </span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-xs">
                  {vehicleData.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">गाड़ी नंबर</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{vehicleData.regNo}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">मालिक का नाम</span>
                  <span className="font-bold text-slate-800">{vehicleData.ownerName}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">मेकर व मॉडल</span>
                  <span className="font-bold text-slate-800">{vehicleData.makerModel}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">ईंधन व क्लास</span>
                  <span className="font-bold text-slate-800">{vehicleData.fuelType} • {vehicleData.vehicleClass.split(' ')[0]}</span>
                </div>
              </div>

              {/* Customizable Vehicle Details Toggle & Drawer */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingDetails(!isEditingDetails)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-indigo-200"
                >
                  <span>{isEditingDetails ? '▲ विवरण संपादन छिपाएं (Hide Form)' : '✏️ वाहन विवरण अनुकूलित करें (Customize RC Details)'}</span>
                </button>
              </div>

              {isEditingDetails && (
                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-800 text-xs">
                      आधिकारिक RC विवरण संपादन (Real-World Vehicle Metadata):
                    </span>
                    <span className="text-[10px] text-slate-400">यह डेटा प्रमाण पत्र और PVC कार्ड पर हूबहू छपेगा।</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">मालिक का नाम (Owner Name)</label>
                      <input
                        type="text"
                        value={vehicleData.ownerName || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, ownerName: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">मेकर व मॉडल (Maker / Model)</label>
                      <input
                        type="text"
                        value={vehicleData.makerModel || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, makerModel: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">चेसिस नंबर (Chassis Number)</label>
                      <input
                        type="text"
                        value={vehicleData.chassisNo || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, chassisNo: e.target.value.toUpperCase() })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">इंजन नंबर (Engine Number)</label>
                      <input
                        type="text"
                        value={vehicleData.engineNo || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, engineNo: e.target.value.toUpperCase() })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">आरटीओ कार्यालय (RTO Authority)</label>
                      <input
                        type="text"
                        value={vehicleData.rto || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, rto: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">ईंधन का प्रकार (Fuel Type)</label>
                      <input
                        type="text"
                        value={vehicleData.fuelType || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, fuelType: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Two-Tier Wallet Ledger Breakdown & Checkout */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      दोहरा लेजर वॉलेट कटौती (Zero-Bypass Double Ledger)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ग्राहक वॉलेट: <strong className="text-amber-300">-₹{retailFee}</strong> | संचालक B2B वॉलेट: <strong className="text-blue-300">-₹{wholesaleCost}</strong> | संचालक शुद्ध लाभ: <strong className="text-emerald-300">+₹{margin}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    वर्तमान ग्राहक बैलेंस: ₹{customerWalletBalance} {customerWalletBalance < retailFee && '(अपर्याप्त बैलेंस)'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {customerWalletBalance < retailFee ? (
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>पहले वॉलेट रिचार्ज करें (+₹{retailFee - customerWalletBalance})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleExecuteOrder}
                      disabled={executingOrder || isOffline}
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>{executingOrder ? 'कटौती हो रही है...' : `₹${retailFee} भुगतान व RC जारी करें`}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Official White-Labeled Output View (Shown when order completed or verified) */}
      {(orderCompleted || vehicleData) && (
        <div className="space-y-4">
          
          {/* Action Bar - Hidden in Print */}
          <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('certificate')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'certificate' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 आधिकारिक RC प्रमाण पत्र</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('pvc_card')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'pvc_card' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>CR-80 PVC स्मार्ट कार्ड (85.6mm×54mm)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट निकालें (Print)</span>
              </button>

              {onOpenPvcPortal && (
                <button
                  type="button"
                  onClick={() => onOpenPvcPortal({ cardType: 'dl', frontDetails: vehicleData })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>PVC प्रिंट पोर्टल में भेजें ➔</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setOrderCompleted(false);
                  setVehicleData(null);
                }}
                className="text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-2"
              >
                नई गाड़ी खोजें
              </button>
            </div>
          </div>

          {/* VIEW 1: A4 OFFICIAL CERTIFICATE WITH WHITE-LABEL WATERMARK */}
          {activeView === 'certificate' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-300 shadow-xl relative overflow-hidden text-slate-900 print:m-0 print:p-6 print:border-none print:shadow-none">
              
              {/* WHITE-LABEL WATERMARK (स्तंभ 5) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] select-none rotate-[-30deg]">
                <div className="text-center">
                  <div className="text-7xl font-black uppercase tracking-widest text-slate-900">
                    डिजिटल सेवा केंद्र
                  </div>
                  <div className="text-5xl font-extrabold text-slate-800 mt-2">
                    अधिकृत प्रमाणित प्रति
                  </div>
                  <div className="text-3xl font-bold text-slate-700 mt-1">
                    {selectedCafe?.shopName || settings?.shopName}
                  </div>
                </div>
              </div>

              {/* White-Label Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-xl border-2 border-yellow-400 shrink-0">
                    CSC
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {selectedCafe?.shopName || settings?.shopName || 'डिजिटल सेवा केंद्र एवं जन सुविधा केंद्र'}
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {selectedCafe?.address || settings?.address || 'अधिकृत जन सेवा केंद्र, उत्तर प्रदेश'}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>संचालक: {selectedCafe?.ownerName || settings?.ownerName || 'अधिकृत वीएलई'}</span>
                      {(selectedCafe?.phone || settings?.phone) && (
                        <>
                          <span>•</span>
                          <span>मो: +91 {selectedCafe?.phone || settings?.phone}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-mono">VLE ID: {selectedCafe?.vleId || 'CSC-VLE-AUTH'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block bg-slate-900 text-yellow-300 font-black text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-wider mb-1">
                    FORM 23 (RULE 48)
                  </span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    प्रमाणित तिथि: {new Date().toLocaleDateString('hi-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    ✓ प्रमाणित प्रतिलिपि
                  </div>
                </div>
              </div>

              {/* Ministry Title */}
              <div className="text-center space-y-1 mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  सड़क परिवहन एवं राजमार्ग मंत्रालय, भारत सरकार
                </p>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                  वाहन पंजीकरण प्रमाण पत्र (CERTIFICATE OF REGISTRATION)
                </h3>
                <p className="text-xs text-indigo-800 font-mono font-bold">
                  {vehicleData.rtoOffice}
                </p>
              </div>

              {/* Core Specs Grid */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden text-xs mb-6">
                <div className="bg-slate-900 text-white font-bold p-3 flex justify-between items-center">
                  <span className="tracking-wider">पंजीकरण संख्या (REGN NO): <strong className="text-yellow-300 font-mono text-base ml-1">{vehicleData.regNo}</strong></span>
                  <span className="font-mono text-xs text-slate-300">स्थिति: {vehicleData.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  {/* Left Column */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">मालिक का नाम (Owner):</span>
                      <span className="font-bold text-slate-900">{vehicleData.ownerName}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">पिता/पति का नाम (Father/Husband):</span>
                      <span className="font-semibold text-slate-800">{vehicleData.fatherName}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">वाहन का मॉडल (Maker Model):</span>
                      <span className="font-bold text-indigo-900">{vehicleData.makerModel}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">वाहन श्रेणी (Class of Vehicle):</span>
                      <span className="font-semibold text-slate-800">{vehicleData.vehicleClass}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">ईंधन प्रकार (Fuel Type):</span>
                      <span className="font-black text-slate-900">{vehicleData.fuelType}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">इंजन क्षमता (Cubic Capacity):</span>
                      <span className="font-semibold text-slate-800">{vehicleData.engineCapacity}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">बैठक क्षमता (Seating):</span>
                      <span className="font-semibold text-slate-800">{vehicleData.seatingCapacity} व्यक्ति</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">पंजीकरण तिथि (Reg Date):</span>
                      <span className="font-mono font-bold text-slate-900">{vehicleData.regDate}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">फिटनेस वैधता (Fitness Upto):</span>
                      <span className="font-mono font-bold text-emerald-700">{vehicleData.fitnessUpto}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">इंजन नंबर (Engine No):</span>
                      <span className="font-mono font-bold text-slate-800">{vehicleData.engineNo}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">चेसिस नंबर (Chassis No):</span>
                      <span className="font-mono font-bold text-slate-800">{vehicleData.chassisNo}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">बीमा कंपनी (Insurance):</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{vehicleData.insuranceCompany}</span>
                    </div>

                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                      <span className="text-slate-500">बीमा वैधता (Ins Upto):</span>
                      <span className="font-mono font-bold text-slate-900">{vehicleData.insuranceUpto}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">वित्तपोषित (Financed By):</span>
                      <span className="font-bold text-slate-800">{vehicleData.financedBy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Seal & Footer Certification */}
              <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>यह प्रतिलिपि राष्ट्रीय सड़क परिवहन पोर्टल से डिजिटल रूप से सत्यापित है।</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    डिजिटल सेवा केंद्र कोड: {selectedCafe?.code ? `#${selectedCafe.code}` : (selectedCafe?.id || '—')} • सुरक्षित बारकोड व डिजिटल मुहर संलग्न है।
                  </p>
                </div>

                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                  <div className="w-20 h-8 mx-auto border-b border-dashed border-slate-400 mb-1 flex items-center justify-center font-serif text-[11px] text-indigo-900 font-bold">
                    {selectedCafe?.ownerName || settings?.ownerName || 'अधिकृत हस्ताक्षर'}
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold block">अधिकृत हस्ताक्षर एवं मुहर</span>
                  <span className="text-[9px] text-slate-400 block">{selectedCafe?.shopName || settings?.shopName}</span>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: CR-80 ISO 85.6mm x 54mm PVC SMART CARD PREVIEW */}
          {activeView === 'pvc_card' && (
            <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  CR-80 ISO मानक आकार (85.6mm × 54mm)
                </span>
                <h4 className="font-black text-slate-900 text-lg mt-2">
                  स्मार्ट पीवीसी कार्ड (Front & Back Layout)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  नीचे दी गई कैंची कटिंग बॉर्डर्स के साथ सीधे PVC कार्ड प्रिंटर या लेमिनेशन पेपर पर निकालें।
                </p>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                
                {/* FRONT CARD (CR-80) */}
                <div className="cr80-card-scaler relative group max-w-full">
                  <span className="text-xs font-bold text-slate-500 mb-1 block text-center">1. अगला भाग (Front Side)</span>
                  <div 
                    style={{ width: '324px', height: '204px' }} 
                    className="bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 rounded-2xl p-3.5 shadow-xl border-2 border-dashed border-slate-400 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-amber-300 pb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                          🇮🇳
                        </div>
                        <div>
                          <h5 className="font-black text-[9px] text-slate-900 leading-tight">भारतीय संघ • भारत सरकार</h5>
                          <p className="text-[7px] text-slate-600 font-bold">परिवहन सेवा - RC स्मार्ट कार्ड</p>
                        </div>
                      </div>
                      <span className="font-mono text-[8px] bg-amber-200 px-1 py-0.5 rounded font-black">CR-80</span>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-12 gap-2 my-auto">
                      <div className="col-span-3 flex flex-col items-center justify-center">
                        <div className="w-12 h-14 bg-amber-300 rounded border border-amber-400 flex items-center justify-center font-mono text-[8px] font-bold text-amber-900">
                          चिप [CHIP]
                        </div>
                      </div>

                      <div className="col-span-9 space-y-0.5 text-[8.5px] leading-tight">
                        <div className="font-mono font-black text-sm text-slate-950 tracking-wider">
                          {vehicleData.regNo}
                        </div>
                        <div><strong className="text-slate-600">मालिक:</strong> <span className="font-bold text-slate-900">{vehicleData.ownerName}</span></div>
                        <div><strong className="text-slate-600">पिता:</strong> <span>{vehicleData.fatherName}</span></div>
                        <div><strong className="text-slate-600">मॉडल:</strong> <span className="font-bold text-indigo-900 truncate block">{vehicleData.makerModel}</span></div>
                        <div className="flex justify-between">
                          <span><strong>क्लास:</strong> {vehicleData.vehicleClass.split(' ')[0]}</span>
                          <span><strong>ईंधन:</strong> {vehicleData.fuelType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-amber-300 pt-1 flex justify-between items-center text-[7.5px] text-slate-700">
                      <span>वैधता: <strong className="text-emerald-800">{vehicleData.fitnessUpto}</strong></span>
                      <span className="font-mono font-bold">{vehicleData.regDate}</span>
                    </div>

                    {/* Corner Cutting Marks */}
                    <div className="absolute top-1 left-1 text-[8px] text-slate-400">✂</div>
                    <div className="absolute bottom-1 right-1 text-[8px] text-slate-400">✂</div>
                  </div>
                </div>

                {/* BACK CARD (CR-80) */}
                <div className="cr80-card-scaler relative group max-w-full">
                  <span className="text-xs font-bold text-slate-500 mb-1 block text-center">2. पिछला भाग (Back Side)</span>
                  <div 
                    style={{ width: '324px', height: '204px' }} 
                    className="bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 rounded-2xl p-3.5 shadow-xl border-2 border-dashed border-slate-400 relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="border-b border-amber-300 pb-1 flex justify-between items-center text-[8px]">
                      <span className="font-bold text-slate-800">वाहन तकनीकी विनिर्देश (TECHNICAL SPECS)</span>
                      <span className="text-emerald-700 font-bold">✓ अधिकृत प्रति</span>
                    </div>

                    {/* Body */}
                    <div className="space-y-1 text-[8px] leading-tight my-auto">
                      <div className="flex justify-between">
                        <span className="text-slate-600">इंजन संख्या:</span>
                        <span className="font-mono font-bold text-slate-900">{vehicleData.engineNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">चेसिस संख्या:</span>
                        <span className="font-mono font-bold text-slate-900">{vehicleData.chassisNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">बीमा समाप्ति:</span>
                        <span className="font-mono font-bold">{vehicleData.insuranceUpto}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">हाइपोथिकेशन:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[150px]">{vehicleData.financedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">जारीकर्ता आरटीओ:</span>
                        <span className="font-bold text-indigo-900 truncate max-w-[150px]">{vehicleData.rtoOffice}</span>
                      </div>
                    </div>

                    {/* Footer / Sanchalak Branding */}
                    <div className="border-t border-amber-300 pt-1 flex justify-between items-center text-[7px] text-slate-600">
                      <span className="truncate max-w-[180px]">जारीकर्ता: <strong>{selectedCafe?.shopName || settings?.shopName}</strong></span>
                      <span className="font-mono">{selectedCafe?.code ? `#${selectedCafe.code}` : (selectedCafe?.id || '—')}</span>
                    </div>

                    {/* Corner Cutting Marks */}
                    <div className="absolute top-1 left-1 text-[8px] text-slate-400">✂</div>
                    <div className="absolute bottom-1 right-1 text-[8px] text-slate-400">✂</div>
                  </div>
                </div>

              </div>

              {/* Action Button to Open directly in PVC Print Portal */}
              {onOpenPvcPortal && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenPvcPortal({ cardType: 'dl', frontDetails: vehicleData })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>इस RC को प्रिंट पोर्टल PVC कार्ड मेकर में खोलें (Open in CR-80 Maker)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
