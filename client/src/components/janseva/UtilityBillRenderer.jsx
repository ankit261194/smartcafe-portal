import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Zap, ShieldCheck, CheckCircle2, Car, Award, AlertCircle, FileText, Scale, Calendar, Clock, CreditCard } from 'lucide-react';

export default function UtilityBillRenderer({ service, data, cafe, generatedAt, token }) {
  const isElectricityBill = service.id === 'electricity_bill';
  const isNewMeter = service.id === 'new_electricity_meter';
  const isPucc = service.id === 'vehicle_pucc_insurance';
  const isChallan = service.id === 'virtual_court_challan';
  const isDlSarathi = service.id === 'dl_sarathi_slip';

  return (
    <div className="utility-sheet bg-white border-2 border-slate-400 rounded-2xl p-6 sm:p-8 font-sans text-slate-900 shadow-md relative overflow-hidden select-none print:border-slate-800 print:shadow-none">
      
      {/* ===================== 1. UPPCL ELECTRICITY BILL INVOICE ===================== */}
      {isElectricityBill && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {data.discom || 'विद्युत वितरण निगम लिमिटेड'}
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  उत्तर प्रदेश पावर कारपोरेशन लिमिटेड (U.P. Power Corporation Limited)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  विद्युत बिल एवं भुगतान रसीद (Official Consumer Electricity Invoice)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={data.consumerNo ? `UPPCL:CA:${data.consumerNo}|AMT:${data.amount||''}|DUE:${data.dueDate||''}` : ''} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">रसीद: {token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">10-अंकीय खाता संख्या (Account ID)</span>
              <span className="font-mono font-black text-sm text-blue-700">{data.consumerNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">उपभोक्ता का नाम</span>
              <span className="font-black text-slate-900">{data.consumerName || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">सप्लाई श्रेणी (Tariff)</span>
              <span className="font-bold text-slate-800">{data.loadKw || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">मीटर संख्या (Meter No.)</span>
              <span className="font-mono font-bold text-slate-800">{data.meterNo || '-'}</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white font-bold p-2.5 grid grid-cols-12 text-[11px]">
              <span className="col-span-6">मद / विवरण (Charge Description)</span>
              <span className="col-span-3 text-center">रीडिंग / यूनिट</span>
              <span className="col-span-3 text-right">धनराशि (₹)</span>
            </div>

            <div className="divide-y divide-slate-200">
              <div className="p-2.5 grid grid-cols-12">
                <span className="col-span-6 text-slate-700 font-semibold">पिछली मीटर रीडिंग (Previous Reading)</span>
                <span className="col-span-3 text-center font-mono font-bold">1420 KWh</span>
                <span className="col-span-3 text-right font-mono text-slate-500">-</span>
              </div>
              <div className="p-2.5 grid grid-cols-12">
                <span className="col-span-6 text-slate-700 font-semibold">वर्तमान मीटर रीडिंग (Current Reading)</span>
                <span className="col-span-3 text-center font-mono font-bold">1605 KWh</span>
                <span className="col-span-3 text-right font-mono text-slate-500">-</span>
              </div>
              <div className="p-2.5 grid grid-cols-12 bg-blue-50/50">
                <span className="col-span-6 font-bold text-slate-900">कुल उपभोग यूनिट (Billed Units)</span>
                <span className="col-span-3 text-center font-mono font-black text-blue-900">185 Units</span>
                <span className="col-span-3 text-right font-mono font-bold text-slate-900">₹945.00</span>
              </div>
              <div className="p-2.5 grid grid-cols-12">
                <span className="col-span-6 text-slate-700 font-semibold">नियत प्रभार (Fixed Charges)</span>
                <span className="col-span-3 text-center text-slate-400">1 KW</span>
                <span className="col-span-3 text-right font-mono text-slate-900">₹110.00</span>
              </div>
              <div className="p-2.5 grid grid-cols-12">
                <span className="col-span-6 text-slate-700 font-semibold">विद्युत कर (Electricity Duty @ 5%)</span>
                <span className="col-span-3 text-center text-slate-400">-</span>
                <span className="col-span-3 text-right font-mono text-slate-900">₹52.75</span>
              </div>
              <div className="p-2.5 grid grid-cols-12">
                <span className="col-span-6 text-slate-700 font-semibold">समायोजन / पिछला बकाया (Arrears)</span>
                <span className="col-span-3 text-center text-slate-400">-</span>
                <span className="col-span-3 text-right font-mono text-slate-900">₹132.25</span>
              </div>
            </div>

            <div className="bg-amber-100 p-3 grid grid-cols-12 border-t-2 border-slate-900 items-center font-black">
              <div className="col-span-6 text-slate-950 text-sm">
                वर्तमान कुल देय धनराशि (Total Amount Due):
                <span className="block text-[10px] text-amber-900 font-normal">अंतिम तिथि तक भुगतान पर छूट मान्य</span>
              </div>
              <div className="col-span-3 text-center text-xs text-red-700">
                अंतिम तिथि: {data.dueDate || '-'}
              </div>
              <div className="col-span-3 text-right text-lg sm:text-xl font-mono text-red-950 font-black">
                {data.amount ? (data.amount.startsWith('₹') ? data.amount : `₹${data.amount}`) : '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 2. JHATPAT NEW CONNECTION DEMAND NOTE ===================== */}
      {isNewMeter && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  झटपट पोर्टल • नया बिजली कनेक्शन पावती पर्ची
                </h3>
                <p className="text-xs text-blue-800 font-bold">
                  उत्तर प्रदेश पावर कारपोरेशन लिमिटेड (UPPCL Jhatpat Portal)
                </p>
                <p className="text-[11px] text-slate-500">
                  नवीन विद्युत संयोजन तकनीकी संभाव्यता एवं डिमांड नोट पत्र (Demand Note Receipt)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={data.consumerNo ? `JHATPAT:APP:${data.consumerNo}|LOAD:${data.loadKw||''}` : ''} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदन संख्या (Application ID)</span>
              <span className="font-mono font-black text-sm text-blue-700">{data.consumerNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदक का नाम</span>
              <span className="font-black text-slate-900">{data.consumerName || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदित भार (Sanctioned Load)</span>
              <span className="font-bold text-slate-800">{data.loadKw || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">विद्युत उपकेंद्र</span>
              <span className="font-bold text-slate-800">{data.substation || '-'}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              तकनीकी संभाव्यता स्वीकृत (Feasibility Approved)
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              आपके परिसर पर नया मीटर लगाने हेतु अवर अभियंता (JE) स्तर से साइट सत्यापन पूर्ण हो चुका है। कुल संयोजन शुल्क ऑनलाइन पोर्टल पर जमा हो चुका है।
            </p>
          </div>
        </div>
      )}

      {/* ===================== 3. VEHICLE PUCC & INSURANCE ===================== */}
      {isPucc && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  सड़क परिवहन एवं राजमार्ग मंत्रालय (MoRTH)
                </h3>
                <p className="text-xs text-emerald-800 font-bold">
                  वाहन प्रदूषण नियंत्रण (PUCC) एवं मोटर वाहन बीमा प्रमाण पत्र
                </p>
                <p className="text-[11px] text-slate-500">
                  परिवहन सेवा पोर्टल (e-Vahan Integrated Transport System)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={data.vehicleNo ? `PARIVAHAN:RC:${data.vehicleNo}|PUC:PASS|EXP:${data.puccUpto||''}` : ''} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पंजीकरण संख्या (Vehicle No.)</span>
              <span className="font-mono font-black text-sm text-emerald-800 uppercase">{data.vehicleNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">वाहन स्वामी का नाम</span>
              <span className="font-black text-slate-900 uppercase">{data.ownerName || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">वाहन श्रेणी / ईंधन</span>
              <span className="font-bold text-slate-800">{data.vehicleClass || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">उत्सर्जन मानक</span>
              <span className="font-bold text-emerald-700">BS-VI (भारत स्टेज 6)</span>
            </div>
          </div>

          <div className="border border-emerald-300 rounded-xl p-3.5 bg-emerald-50/40 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                प्रदूषण जांच परिणाम: योग्य एवं वैध (PASSED & COMPLIANT)
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                GREEN CERTIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-[9px] text-slate-500 block font-sans">कार्बन मोनोऑक्साइड (CO)</span>
                <span className="font-bold text-slate-900">0.08 % (मानक &lt; 0.5%)</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-sans">हाइड्रोकार्बन (HC)</span>
                <span className="font-bold text-slate-900">82 PPM (मानक &lt; 750)</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-sans">PUCC वैधता अवधि</span>
                <span className="font-bold text-emerald-800">{data.puccUpto || '-'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block font-sans">मोटर बीमा स्थिति</span>
                <span className="font-bold text-blue-900">{data.insuranceUpto || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 4. VIRTUAL COURT E-CHALLAN RECEIPT ===================== */}
      {isChallan && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-700 text-white rounded-xl shadow-xs">
                <Scale className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  विधि एवं न्याय मंत्रालय • भारत सरकार
                </h3>
                <p className="text-xs text-indigo-900 font-bold">
                  वर्चुअल कोर्ट ई-चालान निस्तारण रसीद (Virtual Courts Challan Disposed)
                </p>
                <p className="text-[11px] text-slate-500">
                  National Judicial Data Grid (e-Courts Project)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={data.vehicleNo ? `VIRTUALCOURT:VEH:${data.vehicleNo}|STATUS:DISPOSED` : ''} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">गाड़ी नंबर / चालान संख्या</span>
              <span className="font-mono font-black text-sm text-indigo-900 uppercase">{data.vehicleNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">वाहन स्वामी / अभियुक्त</span>
              <span className="font-black text-slate-900">{data.ownerName || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">न्यायालय (Court)</span>
              <span className="font-bold text-slate-800">वर्चुअल कोर्ट (यातायात विभाग)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">चालान स्थिति</span>
              <span className="font-black text-emerald-700">निस्तारित (DISPOSED) ✓</span>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">जुर्माना धनराशि:</span>
              <span className="text-base font-black text-indigo-950 font-mono">₹1,000.00 (सफलतापूर्वक प्राप्त)</span>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
                NO PENDING COURT FINE ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 5. SARATHI DL SLOT & APPOINTMENT ===================== */}
      {isDlSarathi && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-700 text-white rounded-xl shadow-xs">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  सारथी परिवहन सेवा (Sarathi Parivahan)
                </h3>
                <p className="text-xs text-sky-900 font-bold">
                  ड्राइविंग लाइसेंस आवेदन स्थिति एवं RTO टेस्ट स्लॉट बुकिंग पावती
                </p>
                <p className="text-[11px] text-slate-500">
                  सड़क परिवहन एवं राजमार्ग मंत्रालय (MoRTH)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={data.vehicleNo ? `SARATHI:APP:${data.vehicleNo}` : ''} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदन संख्या (Application No)</span>
              <span className="font-mono font-black text-sm text-sky-900">{data.vehicleNo || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदक का नाम</span>
              <span className="font-black text-slate-900">{data.ownerName || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">लाइसेंस श्रेणी</span>
              <span className="font-bold text-slate-800">{data.licenseClass || data.vehicleClass || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">RTO स्लॉट तारीख</span>
              <span className="font-bold text-emerald-700">{data.puccUpto || data.slotDate || '-'}</span>
            </div>
          </div>

          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-sky-950 block">आवश्यक निर्देश:</span>
            <p className="text-slate-700 text-[11px]">
              कृपया निर्धारित तिथि पर सभी मूल दस्तावेज़ (आधार कार्ड, निवास प्रमाण पत्र, मेडिकल प्रमाण पत्र फॉर्म 1-ए) एवं इस पावती पर्ची के साथ संबंधित संभागीय परिवहन कार्यालय (RTO) में बायोमेट्रिक व ड्राइविंग टेस्ट हेतु उपस्थित हों।
            </p>
          </div>
        </div>
      )}

      {/* Common Official Footer */}
      <div className="pt-4 mt-4 border-t-2 border-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-slate-500 text-[11px]">
          <p className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
            <span>यह कंप्यूटरीकृत आधिकारिक पर्ची संबंधित सरकारी पोर्टल के सर्वर अभिलेखों के आधार पर जनरेट की गई है।</span>
          </p>
          <p>अधिकृत केंद्र: {cafe?.shopName || 'डिजिटल सेवा केंद्र'} • जारी समय: {generatedAt}</p>
        </div>

        <div className="text-center sm:text-right shrink-0 border border-slate-300 rounded-xl p-3 bg-slate-50 min-w-[170px]">
          <div className="w-10 h-10 mx-auto sm:ml-auto border border-dashed border-slate-400 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400 mb-1">
            मुहर
          </div>
          <span className="text-[10px] font-bold text-slate-700 block">अधिकृत ऑपरेटर</span>
          <span className="text-[9px] text-slate-500 block">{cafe?.shopName || 'जन सेवा केंद्र'}</span>
        </div>
      </div>
    </div>
  );
}
