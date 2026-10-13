import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Sparkles, Printer, RotateCw, Layers, CheckCircle2 } from 'lucide-react';

export default function CR80CardRenderer({ 
  service, 
  data, 
  photoUrl, 
  signUrl, 
  cafe 
}) {
  const [viewMode, setViewMode] = useState('both'); // 'front', 'back', 'both'

  const subType = service.subType || (
    service.id.includes('aadhaar') || service.id.includes('pvc') ? 'aadhaar' :
    service.id.includes('pan') ? 'pan' :
    service.id.includes('voter') ? 'voter' :
    service.id.includes('ayushman') ? 'ayushman' :
    service.id.includes('eshram') ? 'eshram' :
    service.id.includes('udid') ? 'udid' : 'generic'
  );

  // Fallback realistic placeholder images if user didn't upload custom photos
  const defaultPhoto = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' fill='%2394a3b8'><rect width='100' height='120' fill='%23cbd5e1'/><circle cx='50' cy='45' r='25' fill='%23475569'/><path d='M15 110 C15 80 85 80 85 110 Z' fill='%23475569'/></svg>";
  const defaultSign = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60' fill='none'><path d='M20 35 C40 10 60 50 80 25 C100 45 120 20 150 35 C170 30 180 40 190 35' stroke='%230f172a' stroke-width='3' stroke-linecap='round'/></svg>";

  const photo = photoUrl || defaultPhoto;
  const sign = signUrl || defaultSign;

  return (
    <div className="space-y-4">
      {/* View Switcher (Hidden on print) */}
      <div className="no-print flex items-center justify-between bg-slate-100 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>कार्ड लेआउट (CR-80 Format):</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'both' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            दोनों तरफ (Front + Back)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'front' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            केवल Front (आगे)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('back')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'back' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            केवल Back (पीछे)
          </button>
        </div>
      </div>

      {/* RENDER CANVAS CONTAINER */}
      <div className="print-card-canvas flex flex-wrap items-center justify-center gap-6 p-4 sm:p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
        
        {/* ===================== 1. AADHAAR CARD ===================== */}
        {subType === 'aadhaar' && (
          <>
            {(viewMode === 'both' || viewMode === 'front') && (
              <div className="cr80-card w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
                {/* Guilloche waves pattern background */}
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
                
                {/* Header */}
                <div className="relative border-b border-red-500 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AshokaEmblem className="w-5 h-7 text-slate-800" />
                    <div>
                      <div className="text-[9px] font-black leading-tight text-red-600">भारत सरकार</div>
                      <div className="text-[8px] font-bold leading-tight text-slate-700">Government of India</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black tracking-wider text-red-600">मेरा आधार, मेरी पहचान</div>
                  </div>
                </div>

                {/* Body: Photo + Details + QR */}
                <div className="relative flex-1 flex items-center gap-2 py-1">
                  {/* Photo Frame */}
                  <div className="w-[68px] h-[82px] border-2 border-slate-800 rounded bg-slate-100 overflow-hidden shrink-0 shadow-xs">
                    <img src={photo} alt="Aadhaar Holder" className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-[9px] leading-tight space-y-0.5 text-slate-900">
                    <div className="font-bold text-[10px] text-slate-950">{data.holderNameHindi || data.holderName || '-'}</div>
                    <div className="font-semibold text-slate-700">{data.holderName || '-'}</div>
                    <div className="text-[8px] pt-0.5">
                      <span className="text-slate-500 font-bold">जन्म तिथि / DOB: </span>
                      <span className="font-bold">{data.dob || '-'}</span>
                    </div>
                    <div className="text-[8px]">
                      <span className="text-slate-500 font-bold">लिंग / Gender: </span>
                      <span className="font-bold">{data.gender || '-'}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 p-0.5 bg-white border border-slate-300 rounded">
                    <QRCodeSVG 
                      value={data.idNumber ? `<?xml version="1.0"?><PrintLetterBarcodeData uid="${data.idNumber.replace(/\s/g,'')}" name="${data.holderName||''}" gender="${(data.gender||'M')[0]}" yob="${(data.dob||'').slice(-4)}" co="${data.careOf||''}" vtc="${data.district||''}" pc="${data.pincode||''}"/>` : ''} 
                      size={54} 
                    />
                  </div>
                </div>

                {/* Bottom Number Bar */}
                <div className="relative bg-red-600 text-white rounded py-1 px-2 text-center shadow-xs">
                  <div className="font-mono font-black text-sm tracking-widest leading-none">
                    {formatAadhaar(data.idNumber || 'XXXX XXXX XXXX')}
                  </div>
                </div>
              </div>
            )}

            {(viewMode === 'both' || viewMode === 'back') && (
              <div className="cr80-card w-[340px] h-[215px] bg-white rounded-xl border border-slate-400 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
                <div className="border-b border-red-500 pb-1 flex items-center justify-between">
                  <div className="text-[8px] font-black text-slate-800 leading-tight">
                    भारतीय विशिष्ट पहचान प्राधिकरण
                    <span className="block text-[7px] text-slate-600 font-bold">Unique Identification Authority of India</span>
                  </div>
                  <div className="text-[7px] font-bold text-red-600">हेल्पलाइन: 1947</div>
                </div>

                {/* Back Body: Address in Hindi & English + QR */}
                <div className="flex-1 flex gap-2 py-1 items-center">
                  <div className="flex-1 text-[8px] leading-tight space-y-1 text-slate-800">
                    <div>
                      <span className="font-black text-red-600 block">पता:</span>
                      <span className="font-semibold block">{data.addressHindi || data.address || '-'}</span>
                    </div>
                    <div className="pt-0.5 border-t border-slate-100">
                      <span className="font-black text-slate-700 block text-[7px]">Address:</span>
                      <span className="font-medium text-[7.5px] block">{data.address || '-'}</span>
                    </div>
                  </div>

                  <div className="shrink-0 p-0.5 bg-white border border-slate-300 rounded">
                    <QRCodeSVG 
                      value={data.idNumber ? `UIDAI:BACK:${data.idNumber.replace(/\s/g,'')}|ADDR:${data.address||''}|PIN:${data.pincode||''}` : ''} 
                      size={64} 
                    />
                  </div>
                </div>

                {/* Barcode & UIDAI Footer */}
                <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[7px] text-slate-600">
                  <div className="font-mono font-bold tracking-widest text-slate-900">
                    ||||| | |||| || |||||| | ||||| |||||
                  </div>
                  <div>www.uidai.gov.in • help@uidai.gov.in</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================== 2. PAN CARD (NSDL / UTI) ===================== */}
        {subType === 'pan' && (
          <>
            {(viewMode === 'both' || viewMode === 'front') && (
              <div className="cr80-card w-[340px] h-[215px] bg-gradient-to-br from-sky-50 via-white to-blue-50 rounded-xl border border-blue-400 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
                {/* Header */}
                <div className="border-b-2 border-amber-500 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AshokaEmblem className="w-5 h-7 text-slate-800" />
                    <div>
                      <div className="text-[9px] font-black text-blue-900 leading-tight">आयकर विभाग</div>
                      <div className="text-[8px] font-bold text-slate-700 leading-tight">INCOME TAX DEPARTMENT</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-black text-amber-700">भारत सरकार</div>
                    <div className="text-[7px] font-bold text-slate-600">GOVT. OF INDIA</div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex items-center gap-2.5 py-1">
                  {/* Photo & Hologram */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-[66px] h-[78px] border border-blue-800 rounded bg-slate-100 overflow-hidden shadow-xs">
                      <img src={photo} alt="PAN Photo" className="w-full h-full object-cover" />
                    </div>
                    {/* Security Hologram */}
                    <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600 flex items-center justify-center shadow-xs">
                      <span className="text-[6px] font-black text-amber-950">ITD</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-[8.5px] leading-tight space-y-1">
                    <div>
                      <span className="text-[7px] text-slate-500 uppercase font-bold block">स्थाई खाता संख्या / PAN</span>
                      <span className="font-mono font-black text-xs tracking-wider text-blue-950 bg-blue-100/60 px-1.5 py-0.5 rounded border border-blue-300 inline-block">
                        {data.panNo || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 uppercase font-bold block">नाम / Name</span>
                      <span className="font-bold text-slate-900 uppercase block">{data.holderName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 uppercase font-bold block">पिता का नाम / Father's Name</span>
                      <span className="font-bold text-slate-800 uppercase block">{data.fatherName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 uppercase font-bold block">जन्मतिथि / Date of Birth</span>
                      <span className="font-bold text-slate-900 block">{data.dob || '-'}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <div className="p-0.5 bg-white border border-slate-300 rounded">
                      <QRCodeSVG value={data.panNo ? `PAN:${data.panNo}|NAME:${data.holderName||''}|DOB:${data.dob||''}` : ''} size={56} />
                    </div>
                    {/* Signature Box */}
                    <div className="w-20 h-6 border border-slate-400 bg-white rounded flex items-center justify-center overflow-hidden">
                      <img src={sign} alt="PAN Signature" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-0.5 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                  <span>NSDL / UTI e-Governance</span>
                  <span>Digitally Verified Card</span>
                </div>
              </div>
            )}

            {(viewMode === 'both' || viewMode === 'back') && (
              <div className="cr80-card w-[340px] h-[215px] bg-slate-50 rounded-xl border border-slate-400 shadow-lg relative overflow-hidden flex flex-col justify-between p-3 font-sans select-none print:shadow-none print:border-slate-800">
                <div className="text-[8px] leading-relaxed text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">1. This card is valid throughout India.</p>
                  <p>2. In case of loss, contact the nearest Income Tax office or report on incometax.gov.in.</p>
                  <p>3. If found, please return to: Income Tax PAN Services Unit, NSDL e-Gov, Mumbai.</p>
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded text-center my-2">
                  <div className="font-mono text-xs font-bold tracking-widest text-slate-900">
                    *{data.panNo || '-'}*
                  </div>
                  <div className="text-[7px] text-slate-500 mt-0.5">Machine Readable Line</div>
                </div>
                <div className="text-[7.5px] text-center text-slate-500 border-t border-slate-200 pt-1">
                  आयकर पैन सेवा केंद्र • हेल्पलाइन 1800-180-1961
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================== 3. VOTER SMART CARD (CR-80) ===================== */}
        {subType === 'voter' && (
          <>
            {(viewMode === 'both' || viewMode === 'front') && (
              <div className="cr80-card w-[340px] h-[215px] bg-white rounded-xl border border-emerald-500 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
                {/* Header Tricolor */}
                <div className="border-b-2 border-emerald-600 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AshokaEmblem className="w-5 h-7 text-slate-800" />
                    <div>
                      <div className="text-[9px] font-black text-emerald-800 leading-tight">भारत निर्वाचन आयोग</div>
                      <div className="text-[8px] font-bold text-slate-700 leading-tight">ELECTION COMMISSION OF INDIA</div>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-600 flex items-center justify-center">
                    <span className="text-[5px] font-black text-amber-900">ECI</span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex items-center gap-2 py-1">
                  {/* Photo */}
                  <div className="w-[68px] h-[82px] border-2 border-slate-800 rounded bg-slate-100 overflow-hidden shrink-0 shadow-xs">
                    <img src={photo} alt="Voter Photo" className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-[8.5px] leading-tight space-y-1">
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold block">EPIC संख्या / EPIC No.</span>
                      <span className="font-mono font-black text-xs text-emerald-900 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-300 inline-block">
                        {data.epicNo || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold block">मतदाता का नाम / Name</span>
                      <span className="font-bold text-slate-900 block">{data.voterNameHindi || data.voterName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold block">पिता/पति का नाम / Relation Name</span>
                      <span className="font-semibold text-slate-800 block">{data.relationName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold block">लिंग / Gender • आयु / Age</span>
                      <span className="font-bold text-slate-900 block">{data.gender || '-'} • {data.age || '-'}</span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="shrink-0 p-0.5 bg-white border border-slate-300 rounded">
                    <QRCodeSVG value={data.epicNo ? `ECI:EPIC:${data.epicNo}|NAME:${data.voterName||''}|AC:${data.assembly||''}` : ''} size={56} />
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-emerald-700 text-white rounded py-0.5 px-2 text-center text-[8px] font-bold">
                  विधानसभा: {data.assembly || '-'}
                </div>
              </div>
            )}

            {(viewMode === 'both' || viewMode === 'back') && (
              <div className="cr80-card w-[340px] h-[215px] bg-slate-50 rounded-xl border border-slate-400 shadow-lg relative overflow-hidden flex flex-col justify-between p-3 font-sans select-none print:shadow-none print:border-slate-800">
                <div className="text-[8px] space-y-1 text-slate-800">
                  <div className="font-black text-emerald-800">मतदान केंद्र (Polling Station):</div>
                  <div className="font-semibold">{data.boothName || '-'}</div>
                  <div className="pt-1">
                    <span className="font-bold text-slate-600">पता / Address: </span>
                    <span>{data.address || '-'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[7px] text-slate-600">
                  <div className="text-center">
                    <div className="font-mono font-bold tracking-widest text-[8px]">|||| | |||||| ||| ||||</div>
                    <span>बारकोड अनुभाग</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-6 border-b border-dashed border-slate-600 mx-auto" />
                    <span className="font-bold block text-slate-800">निर्वाचक रजिस्ट्रीकरण अधिकारी</span>
                    <span>Electoral Registration Officer</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================== 4. AYUSHMAN BHARAT CARD ===================== */}
        {subType === 'ayushman' && (
          <div className="cr80-card w-[340px] h-[215px] bg-gradient-to-br from-emerald-50 via-white to-amber-50 rounded-xl border-2 border-emerald-600 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white -mx-2.5 -mt-2.5 px-3 py-1.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black tracking-wide">आयुष्मान भारत • PM-JAY</div>
                <div className="text-[7px] font-bold text-emerald-200">राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA)</div>
              </div>
              <span className="bg-amber-400 text-amber-950 font-black text-[8px] px-1.5 py-0.5 rounded shadow-xs">
                ₹5 लाख मुफ़्त उपचार
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 flex items-center gap-2.5 py-1.5">
              <div className="w-[66px] h-[80px] border border-emerald-700 rounded bg-slate-100 overflow-hidden shrink-0 shadow-xs">
                <img src={photo} alt="Ayushman Photo" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-[8.5px] leading-tight space-y-1">
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">PMJAY ID / ABHA संख्या</span>
                  <span className="font-mono font-black text-xs text-emerald-950 block">
                    {data.abhaId || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">लाभार्थी का नाम</span>
                  <span className="font-bold text-slate-900 text-xs block">{data.beneficiaryName || '-'}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">मुखिया / पिता का नाम</span>
                  <span className="font-semibold text-slate-800 block">{data.familyHead || '-'}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">जनपद व राज्य</span>
                  <span className="font-semibold text-slate-800 block">{data.district || '-'}</span>
                </div>
              </div>

              <div className="shrink-0 p-0.5 bg-white border border-slate-300 rounded">
                <QRCodeSVG value={data.abhaId ? `PMJAY:${data.abhaId}|NAME:${data.beneficiaryName||''}|STATE:${data.district||''}` : ''} size={56} />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-emerald-300 pt-0.5 flex items-center justify-between text-[7px] text-emerald-800 font-bold">
              <span>टोल फ्री: 14555</span>
              <span>www.pmjay.gov.in</span>
            </div>
          </div>
        )}

        {/* ===================== 5. E-SHRAM CARD ===================== */}
        {subType === 'eshram' && (
          <div className="cr80-card w-[340px] h-[215px] bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-xl border-2 border-orange-500 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white -mx-2.5 -mt-2.5 px-3 py-1 flex items-center justify-between">
              <div>
                <div className="text-[9px] font-black">ई-श्रम कार्ड • e-Shram</div>
                <div className="text-[7px] text-orange-200">श्रम एवं रोजगार मंत्रालय (Govt of India)</div>
              </div>
              <span className="text-[8px] font-black text-amber-200">UAN Card</span>
            </div>

            <div className="flex-1 flex items-center gap-2.5 py-1">
              <div className="w-[66px] h-[80px] border border-orange-700 rounded bg-slate-100 overflow-hidden shrink-0 shadow-xs">
                <img src={photo} alt="eShram Photo" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-[8.5px] leading-tight space-y-1">
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">सार्वभौमिक खाता संख्या (UAN)</span>
                  <span className="font-mono font-black text-xs text-orange-950 block">
                    {data.uanNo || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">श्रमिक का नाम</span>
                  <span className="font-bold text-slate-900 block">{data.workerName || '-'}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">व्यवसाय (Occupation)</span>
                  <span className="font-semibold text-slate-800 block">{data.occupation || '-'}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">ब्लड ग्रुप / जन्मतिथि</span>
                  <span className="font-semibold text-slate-800 block">{data.bloodGroup || '-'}</span>
                </div>
              </div>

              <div className="shrink-0 p-0.5 bg-white border border-slate-300 rounded">
                <QRCodeSVG value={data.uanNo ? `ESHRAM:${data.uanNo}|NAME:${data.workerName||''}` : ''} size={56} />
              </div>
            </div>

            <div className="border-t border-orange-300 pt-0.5 flex items-center justify-between text-[7px] text-orange-900 font-bold">
              <span>हेल्पलाइन: 14434</span>
              <span>eshram.gov.in</span>
            </div>
          </div>
        )}

        {/* ===================== 6. UDID DIVYANG SWAVLAMBAN CARD ===================== */}
        {subType === 'udid' && (
          <div className="cr80-card w-[340px] h-[215px] bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-xl border-2 border-purple-600 shadow-lg relative overflow-hidden flex flex-col justify-between p-2.5 font-sans select-none print:shadow-none print:border-slate-800">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white -mx-2.5 -mt-2.5 px-3 py-1 flex items-center justify-between">
              <div>
                <div className="text-[9px] font-black">स्वावलंबन UDID कार्ड • Divyang Card</div>
                <div className="text-[7px] text-purple-200">दिव्यांगजन सशक्तिकरण विभाग (DEPwD)</div>
              </div>
              <span className="bg-purple-900 text-yellow-300 font-black text-[7px] px-1 py-0.5 rounded">
                {data.validUpto || 'Permanent'}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2.5 py-1">
              <div className="w-[66px] h-[80px] border border-purple-800 rounded bg-slate-100 overflow-hidden shrink-0 shadow-xs">
                <img src={photo} alt="UDID Photo" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-[8.5px] leading-tight space-y-1">
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">18-अंकीय UDID संख्या</span>
                  <span className="font-mono font-black text-xs text-purple-950 block">
                    {data.udidNo || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">दिव्यांगजन का नाम</span>
                  <span className="font-bold text-slate-900 block">{data.personName || '-'}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">दिव्यांगता प्रकार व प्रतिशत</span>
                  <span className="font-bold text-purple-900 block">{data.disabilityType || '-'}</span>
                </div>
                <div>
                  <span className="text-[7px] text-slate-500 font-bold block">मेडिकल बोर्ड</span>
                  <span className="font-semibold text-slate-700 block">{data.hospital || '-'}</span>
                </div>
              </div>

              <div className="shrink-0 p-0.5 bg-white border border-slate-300 rounded">
                <QRCodeSVG value={data.udidNo ? `UDID:${data.udidNo}|NAME:${data.personName||''}|PCT:${data.disabilityType||''}` : ''} size={56} />
              </div>
            </div>

            <div className="border-t border-purple-300 pt-0.5 flex items-center justify-between text-[7px] text-purple-900 font-bold">
              <span>swavlambancard.gov.in</span>
              <span>सत्यापित दिव्यांग कार्ड ✓</span>
            </div>
          </div>
        )}

      </div>

      {/* Cutting Margin & PVC Tray Print Notice */}
      <div className="no-print bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>CR-80 मानक साइज़:</strong> यह लेआउट इंकजेट पीवीसी कार्ड ट्रे (Epson L805 / Canon G series) और लेमिनेशन शीट कटिंग बॉर्डर के साथ 100% फिट बैठता है।
          </span>
        </div>
      </div>
    </div>
  );
}

function AshokaEmblem({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="currentColor">
      <path d="M20 5 C15 5 12 10 12 15 C12 22 17 25 17 32 L15 32 C12 32 10 35 10 38 L10 42 C10 45 15 48 20 48 C25 48 30 45 30 42 L30 38 C30 35 28 32 25 32 L23 32 C23 25 28 22 28 15 C28 10 25 5 20 5 Z M18 36 L22 36 L22 44 L18 44 Z" />
    </svg>
  );
}

function formatAadhaar(str) {
  if (!str) return 'XXXX XXXX XXXX';
  const clean = str.replace(/\s+/g, '');
  if (clean.length === 12) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
  }
  return str;
}
