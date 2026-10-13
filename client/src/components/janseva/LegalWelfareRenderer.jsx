import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, CheckCircle2, Award, FileText, Landmark, 
  Scale, GraduationCap, Users, HeartHandshake, Home, Briefcase, 
  BadgePercent, Fuel, Globe, FileBadge
} from 'lucide-react';

export default function LegalWelfareRenderer({ service, data, cafe, generatedAt, token, photoUrl }) {
  const sId = service.id;

  const defaultPhoto = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' fill='%2394a3b8'><rect width='100' height='120' fill='%23cbd5e1'/><circle cx='50' cy='45' r='25' fill='%23475569'/><path d='M15 110 C15 80 85 80 85 110 Z' fill='%23475569'/></svg>";
  const photo = photoUrl || defaultPhoto;

  return (
    <div className="welfare-sheet bg-white border-2 border-slate-400 rounded-2xl p-6 sm:p-8 font-sans text-slate-900 shadow-md relative overflow-hidden select-none print:border-slate-800 print:shadow-none">
      
      {/* ===================== 1. E-STAMP AFFIDAVIT ===================== */}
      {sId === 'affidavit' && (
        <div className="space-y-4">
          <div className="border-4 border-double border-amber-800 p-3 bg-amber-50/30 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-black tracking-widest text-amber-900 uppercase">
              GOVERNMENT OF INDIA • E-DISTRICT LEGAL DECLARATION
            </div>
            <div className="text-base sm:text-lg font-black text-amber-950 font-serif">
              स्वप्रमाणित घोषणा पत्र / आधिकारिक शपथ पत्र
            </div>
            <div className="text-[10px] text-slate-600 font-bold">
              (सक्षम अधिकारी / e-District राजस्व एवं समाज कल्याण सेवाओं हेतु मान्य)
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">घोषणा का उद्देश्य</span>
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block">
                {data.purpose || 'आय प्रमाण पत्र / छात्रवृत्ति आवेदन हेतु'}
              </span>
            </div>
            <div className="w-16 h-20 border border-slate-400 rounded bg-slate-50 overflow-hidden shrink-0 shadow-xs">
              <img src={photo} alt="Applicant" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="text-xs leading-relaxed space-y-3 text-slate-800 font-serif text-justify pt-1">
            <p>
              समक्ष, <strong>सक्षम अधिकारी / तहसीलदार महोदय</strong>,
            </p>
            <p>
              मैं <strong>{data.applicantName || 'रामेश्वर सिंह'}</strong>, आत्मज/पत्नी श्री <strong>{data.fatherHusband || 'बाबूलाल'}</strong>, 
              निवासी: <strong>{data.address || 'मकान नं. 14, ग्राम व पोस्ट, तहसील, जिला'}</strong> का/की स्थाई निवासी हूँ तथा सत्यनिष्ठापूर्वक निम्न घोषणा करता/करती हूँ:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[11.5px]">
              <li>यह कि मैं उपरोक्त पते का स्थाई निवासी हूँ एवं समस्त विवरण मेरे निजी ज्ञान में पूर्णतः सत्य व सही हैं।</li>
              <li>यह कि मेरे परिवार की समस्त स्रोतों से कुल वार्षिक आय लगभग <strong>{data.income || '₹48,000/- (अड़तालीस हजार रुपये)'}</strong> मात्र है।</li>
              <li>यह कि मेरे द्वारा दी गई जानकारी असत्य पाए जाने पर किसी भी विधिक कार्यवाही का उत्तरदायित्व मेरा स्वयं का होगा।</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 items-end text-xs">
            <div className="space-y-1 text-[11px] text-slate-600">
              <div>स्थान: {cafe?.address || 'तहसील केंद्र'}</div>
              <div>दिनांक: {generatedAt}</div>
              <div className="font-mono text-[9px] text-slate-400">टोकन: {token}</div>
            </div>

            <div className="text-right space-y-1">
              <div className="w-32 border-b border-slate-800 ml-auto pb-1" />
              <div className="font-bold text-slate-900">हस्ताक्षर / अंगूठा निशानी</div>
              <div className="text-[10px] text-slate-600">({data.applicantName || 'घोषणाकर्ता'})</div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 2. NFSA RATION CARD MEMBER SLIP ===================== */}
      {sId === 'ration_slip' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-emerald-800 uppercase">खाद्य एवं रसद विभाग • FCS Portal</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) राशन कार्ड पात्रता पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                राशन वितरण एवं कोटेदार सत्यापन पर्ची (Official Member Slip)
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`NFSA:RC:${data.rationNo||'215487965412'}|UNITS:${data.units||'5'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">राशन कार्ड संख्या</span>
              <span className="font-mono font-black text-sm text-emerald-800">{data.rationNo || '215487965412'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">मुखिया का नाम</span>
              <span className="font-black text-slate-900">{data.headName || 'शांति देवी'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">कोटेदार का नाम</span>
              <span className="font-bold text-slate-800">{data.dealerName || 'मेसर्स कन्हैया लाल'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">कार्ड का प्रकार / कुल यूनिट</span>
              <span className="font-black text-blue-900">पात्र गृहस्थी • {data.units || '5'} यूनिट</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white font-bold p-2.5 grid grid-cols-12 text-[11px]">
              <span className="col-span-1 text-center">क्र.</span>
              <span className="col-span-4">सदस्य का नाम (Member Name)</span>
              <span className="col-span-3">मुखिया से संबंध</span>
              <span className="col-span-2 text-center">आयु / लिंग</span>
              <span className="col-span-2 text-right">आधार सीडिंग</span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-1 text-center font-bold">1</span>
                <span className="col-span-4 font-bold text-slate-900">{data.headName || 'शांति देवी'}</span>
                <span className="col-span-3 text-slate-600">स्वयं (मुखिया)</span>
                <span className="col-span-2 text-center">48 / महिला</span>
                <span className="col-span-2 text-right text-emerald-700 font-bold">सत्यापित ✓</span>
              </div>
              <div className="p-2 grid grid-cols-12 bg-slate-50/50">
                <span className="col-span-1 text-center font-bold">2</span>
                <span className="col-span-4 font-bold text-slate-900">सुरेश चंद्र</span>
                <span className="col-span-3 text-slate-600">पति</span>
                <span className="col-span-2 text-center">52 / पुरुष</span>
                <span className="col-span-2 text-right text-emerald-700 font-bold">सत्यापित ✓</span>
              </div>
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-1 text-center font-bold">3</span>
                <span className="col-span-4 font-bold text-slate-900">अमित कुमार</span>
                <span className="col-span-3 text-slate-600">बेटा</span>
                <span className="col-span-2 text-center">22 / पुरुष</span>
                <span className="col-span-2 text-right text-emerald-700 font-bold">सत्यापित ✓</span>
              </div>
              <div className="p-2 grid grid-cols-12 bg-slate-50/50">
                <span className="col-span-1 text-center font-bold">4</span>
                <span className="col-span-4 font-bold text-slate-900">पूजा वर्मा</span>
                <span className="col-span-3 text-slate-600">बेटी</span>
                <span className="col-span-2 text-center">19 / महिला</span>
                <span className="col-span-2 text-right text-emerald-700 font-bold">सत्यापित ✓</span>
              </div>
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-1 text-center font-bold">5</span>
                <span className="col-span-4 font-bold text-slate-900">रोहित कुमार</span>
                <span className="col-span-3 text-slate-600">बेटा</span>
                <span className="col-span-2 text-center">16 / पुरुष</span>
                <span className="col-span-2 text-right text-emerald-700 font-bold">सत्यापित ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 3. PM KISAN SAMMAN NIDHI ===================== */}
      {sId === 'pm_kisan_status' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-amber-800 uppercase">कृषि एवं किसान कल्याण मंत्रालय • PM-KISAN</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                प्रधानमंत्री किसान सम्मान निधि (PM-Kisan) लाभार्थी स्थिति पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                e-KYC, लैंड सीडिंग एवं क़िस्त भुगतान अभिलेख (Certified Status)
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`PMKISAN:NAME:${data.farmerName||'FARMER'}|STATUS:ACTIVE|FTO:PROCESSED`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">किसान का नाम</span>
              <span className="font-black text-slate-900">{data.farmerName || 'बलदेव सिंह'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">मोबाइल / आधार नंबर</span>
              <span className="font-mono font-bold text-blue-800">{data.mobileReg || '9839XXXX10'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">गाँव व जनपद</span>
              <span className="font-bold text-slate-800">{data.village || 'कछौना, हरदोई'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">e-KYC स्थिति</span>
              <span className="font-black text-emerald-700">पूर्ण (YES) ✓</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-center text-xs">
            <div>
              <span className="text-[10px] text-emerald-900 font-bold block">Land Seeding</span>
              <span className="font-black text-emerald-800 text-sm">YES ✓</span>
            </div>
            <div className="border-x border-emerald-200">
              <span className="text-[10px] text-emerald-900 font-bold block">Aadhaar Bank Seeding</span>
              <span className="font-black text-emerald-800 text-sm">ACTIVE ✓</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-900 font-bold block">FTO Status</span>
              <span className="font-black text-emerald-800 text-sm">PROCESSED ✓</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white font-bold p-2 grid grid-cols-12 text-[11px]">
              <span className="col-span-3">क़िस्त संख्या</span>
              <span className="col-span-3">भुगतान स्थिति</span>
              <span className="col-span-3 text-center">खाता संख्या</span>
              <span className="col-span-3 text-right">धनराशि (₹)</span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="p-2 grid grid-cols-12 bg-emerald-50/40">
                <span className="col-span-3 font-bold text-slate-900">18वीं क़िस्त (नवीनतम)</span>
                <span className="col-span-3 text-emerald-800 font-black">FTO जनरेटेड व क्रेडिटेड</span>
                <span className="col-span-3 text-center font-mono">XXXX-4912</span>
                <span className="col-span-3 text-right font-mono font-black text-slate-950">₹2,000.00</span>
              </div>
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-3 font-bold text-slate-900">17वीं क़िस्त</span>
                <span className="col-span-3 text-emerald-700 font-bold">बैंक खाते में अंतरित</span>
                <span className="col-span-3 text-center font-mono">XXXX-4912</span>
                <span className="col-span-3 text-right font-mono font-bold text-slate-950">₹2,000.00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 4. SCHOLARSHIP PFMS PASSBOOK ===================== */}
      {sId === 'scholarship_status' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">समाज कल्याण विभाग • PFMS Portal</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                छात्रवृत्ति एवं शुल्क प्रतिपूर्ति स्थिति व PFMS पासबुक पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                संस्थान, जिला समाज कल्याण अधिकारी (DWO) व बैंक अंतरण ब्यौरा
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`SCHOLARSHIP:REG:${data.regNo||'260194857201'}|AMT:5400`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">रजिस्ट्रेशन संख्या</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.regNo || '260194857201'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">छात्र / छात्रा का नाम</span>
              <span className="font-black text-slate-900">{data.studentName || 'अंशिका वर्मा'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पाठ्यक्रम / वर्ग</span>
              <span className="font-bold text-slate-800">{data.course || 'B.A. द्वितीय वर्ष'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">PFMS स्थिति</span>
              <span className="font-black text-emerald-700">सत्यापित व क्रेडिटेड ✓</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                PFMS ट्रांजेक्शन सफल: ₹5,400.00 बैंक खाते में अंतरित
              </span>
              <span className="font-mono text-[10px] text-emerald-800 font-bold">UTR: PFMS26019482910</span>
            </div>
            <p className="text-slate-700 text-[11px]">
              शिक्षण संस्थान स्तर से सत्यापित, जिला समाज कल्याण अधिकारी (DWO) द्वारा अनुमोदित तथा छात्रवृत्ति व शुल्क प्रतिपूर्ति की धनराशि आधार सीडेड बैंक खाते में सफलतापूर्वक क्रेडिट की जा चुकी है।
            </p>
          </div>
        </div>
      )}

      {/* ===================== 5. SSPY PENSION SLIP ===================== */}
      {sId === 'pension_slip' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-purple-900 uppercase">समाज कल्याण विभाग • SSPY Integrated Pension</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                वृद्धावस्था / विधवा / दिव्यांग पेंशन लाभार्थी स्थिति पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                त्रैमासिक ₹3,000 पेंशन क़िस्त एवं आधार-सीडेड बैंक अंतरण प्रमाण
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`SSPY:REG:${data.regNo||'1029384756'}|AMT:3000`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पंजीकरण संख्या</span>
              <span className="font-mono font-black text-sm text-purple-900">{data.regNo || '1029384756'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पेंशनर का नाम</span>
              <span className="font-black text-slate-900">{data.pensionerName || 'मंगली प्रसाद'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">योजना का प्रकार</span>
              <span className="font-bold text-slate-800">{data.pensionType || 'वृद्धावस्था पेंशन (Old Age)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">नवीनतम क़िस्त</span>
              <span className="font-black text-emerald-700">₹3,000 अंतरित ✓</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">भुगतान विवरण:</span>
              <span className="font-bold text-purple-950">द्वितीय त्रैमासिक क़िस्त (जुलाई-सितंबर) ₹3,000/- अंतरित</span>
            </div>
            <div className="font-mono text-xs font-bold text-slate-700">खाता: XXXX-4912</div>
          </div>
        </div>
      )}

      {/* ===================== 6. BHULEKH KHATAUNI / NAKSHA ===================== */}
      {sId === 'bhu_naksha' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-amber-900 uppercase">राजस्व परिषद उत्तर प्रदेश • भूलेख भू-नक्शा पोर्टल</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                उद्धरण खतौनी एवं सजरा नक्शा प्रमाणित नकल (Khatauni Nakal)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                फसली वर्ष 1431-1436 • खाता व गाटा संख्या अभिलेख
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`BHULEKH:GATA:${data.rationNo||'412/1'}|AREA:${data.units||'0.4120'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">खसरा / गाटा संख्या</span>
              <span className="font-mono font-black text-sm text-amber-900">{data.rationNo || 'गाटा संख्या 412/1'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">खातेदार का नाम</span>
              <span className="font-black text-slate-900">{data.headName || 'हरिशंकर पुत्र राम दयाल'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">क्षेत्रफल (रकबा)</span>
              <span className="font-mono font-bold text-blue-900">{data.units || '0.4120 हेक्टेयर'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">ग्राम व तहसील</span>
              <span className="font-bold text-slate-800">{data.dealerName || 'ग्राम रामपुर, तहसील सवायजपुर'}</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">आदेश व प्रविष्टियां (Remarks):</span>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              भूमि श्रेणी 1-क (संक्रमणीय भूमिधरों के अधिकार में)। खातेदार पूर्ण स्वत्वधारी हैं। कोई विधिक वाद अथवा बंधक प्रविष्टि नहीं पाई गई। राजस्व परिषद सर्वर द्वारा कंप्यूटरीकृत उद्धरण प्रतिलिपि।
            </p>
          </div>
        </div>
      )}

      {/* ===================== 7. PARIWAR REGISTER NAKAL ===================== */}
      {sId === 'pariwar_register' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase">पंचायती राज विभाग • e-Panchayat</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                परिवार रजिस्टर की प्रमाणित नकल (Certified Pariwar Register)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                ग्राम पंचायत कुटुंब रजिस्टर • नियम 2 एवं 3 के अंतर्गत प्रमाणित प्रति
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`PARIWAR:HEAD:${data.headName||'MUKHIYA'}|UNITS:${data.units||'5'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">मुखिया का नाम</span>
              <span className="font-black text-slate-900">{data.headName || 'राम सनेही'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">मकान / रजिस्टर क्रमांक</span>
              <span className="font-mono font-bold text-slate-800">{data.rationNo || 'मकान नं. 42 / खाता 19'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">ग्राम पंचायत व ब्लॉक</span>
              <span className="font-bold text-slate-800">{data.dealerName || 'ग्राम सुरसा, ब्लॉक हरदोई'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">कुल दर्ज सदस्य</span>
              <span className="font-black text-blue-900">{data.units || '5'} सदस्य</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white font-bold p-2 grid grid-cols-12 text-[11px]">
              <span className="col-span-1 text-center">क्र.</span>
              <span className="col-span-4">सदस्य का नाम</span>
              <span className="col-span-3">मुखिया से संबंध</span>
              <span className="col-span-2 text-center">आयु / लिंग</span>
              <span className="col-span-2 text-right">साक्षरता स्थिति</span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-1 text-center font-bold">1</span>
                <span className="col-span-4 font-bold text-slate-900">{data.headName || 'राम सनेही'}</span>
                <span className="col-span-3 text-slate-600">स्वयं (मुखिया)</span>
                <span className="col-span-2 text-center">54 / पुरुष</span>
                <span className="col-span-2 text-right font-bold text-slate-700">साक्षर</span>
              </div>
              <div className="p-2 grid grid-cols-12 bg-slate-50/50">
                <span className="col-span-1 text-center font-bold">2</span>
                <span className="col-span-4 font-bold text-slate-900">कलावती</span>
                <span className="col-span-3 text-slate-600">पत्नी</span>
                <span className="col-span-2 text-center">50 / महिला</span>
                <span className="col-span-2 text-right font-bold text-slate-700">साक्षर</span>
              </div>
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-1 text-center font-bold">3</span>
                <span className="col-span-4 font-bold text-slate-900">सर्वेश कुमार</span>
                <span className="col-span-3 text-slate-600">पुत्र</span>
                <span className="col-span-2 text-center">24 / पुरुष</span>
                <span className="col-span-2 text-right font-bold text-slate-700">स्नातक</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 8. CRS BIRTH / DEATH VERIFICATION ===================== */}
      {sId === 'crs_verification' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase">भारत के महारजिस्ट्रार • Registrar General of India</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                नागरिक पंजीकरण प्रणाली (CRS) प्रमाण पत्र नेट सत्यापन पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                जन्म एवं मृत्यु रजिस्ट्रीकरण अधिनियम, 1969 के अंतर्गत अधिकृत सत्यापन
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`CRS:REG:${data.regNo||'B-2026-09-948201'}|NAME:${data.applicantName||'NAME'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पंजीकरण संख्या (Reg No)</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.regNo || 'B-2026-09-948201'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">बच्चे / व्यक्ति का नाम</span>
              <span className="font-black text-slate-900">{data.applicantName || 'आरव कुमार'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पिता / पति का नाम</span>
              <span className="font-bold text-slate-800">{data.fatherHusband || 'राजेश कुमार'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">सत्यापन स्थिति</span>
              <span className="font-black text-emerald-700">सत्यापित एवं वैध ✓</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-1">
            <span className="font-bold text-emerald-950 block">डिजिटल रजिस्ट्री पुष्टि:</span>
            <p className="text-slate-700 text-[11px]">
              यह प्रमाण पत्र सक्षम रजिस्ट्रार (जन्म एवं मृत्यु) कार्यालय द्वारा विधिवत पंजीकृत है। अभिलेख केंद्रीय CRS डेटाबेस से शत-प्रतिशत मेल खाता है।
            </p>
          </div>
        </div>
      )}

      {/* ===================== 9. CERTIFICATE NET VERIFICATION ===================== */}
      {sId === 'cert_net_verify' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">राजस्व परिषद उत्तर प्रदेश • e-District Portal</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                आय / जाति / निवास प्रमाण पत्र ऑनलाइन नेट सत्यापन पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                तहसीलदार एवं सक्षम प्राधिकारी द्वारा डिजिटल हस्ताक्षरित अभिलेख
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`EDISTRICT:VERIFY:${data.applicantName||'CITIZEN'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदक का नाम</span>
              <span className="font-black text-slate-900">{data.applicantName || 'सुशील कुमार'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पिता का नाम</span>
              <span className="font-bold text-slate-800">{data.fatherHusband || 'श्री राम चरण'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">प्रमाण पत्र प्रकार</span>
              <span className="font-bold text-blue-900">{data.purpose || 'जाति प्रमाण पत्र (Caste Certificate)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">सत्यापन परिणाम</span>
              <span className="font-black text-emerald-700">सत्यापित (VERIFIED) ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 10. NPCI BANK SEEDING ===================== */}
      {sId === 'bank_npci_link' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase">NPCI • National Payments Corporation of India</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                आधार बैंक खाता NPCI / DBT सीडिंग स्थिति प्रमाण पत्र
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                डायरेक्ट बेनिफिट ट्रांसफर (DBT) मैपर स्टेटस जांच
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`NPCI:STATUS:ACTIVE|AADHAAR:${data.aadhaarNo||'4921'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-emerald-950 text-base">
              Bank Account is Active for DBT Payments
            </h4>
            <p className="text-xs text-emerald-800">
              आपका आधार नंबर बैंक खाते के साथ NPCI मैपर में सक्रिय (Active) रूप से लिंक है। सभी सरकारी सब्सिडी व पेंशन इसी खाते में प्राप्त होंगी।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">आधार संख्या (अंतिम 4 अंक)</span>
              <span className="font-mono font-black text-sm text-slate-900">{data.aadhaarNo || 'XXXX XXXX 4921'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">संबद्ध बैंक शाखा</span>
              <span className="font-bold text-slate-900">{data.panNo || 'बैंक ऑफ बड़ौदा, शाखा सुरसा'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 11. MGNREGA JOB CARD ===================== */}
      {sId === 'nrega_job_card' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-amber-900 uppercase">ग्रामीण विकास मंत्रालय • MGNREGA Portal</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार (मनरेगा) जॉब कार्ड व हाजिरी पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                कार्य दिवस, मस्टर रोल हाजिरी एवं मजदूरी बैंक भुगतान विवरणी
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`NREGA:JOB:${data.jobCardNo||'UP-04-002-019/52'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">जॉब कार्ड संख्या</span>
              <span className="font-mono font-black text-sm text-amber-900">{data.jobCardNo || 'UP-04-002-019/52'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">श्रमिक का नाम</span>
              <span className="font-black text-slate-900">{data.workerName || 'सियाराम'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">ग्राम पंचायत</span>
              <span className="font-bold text-slate-800">{data.gramPanchayat || 'रामपुर, सवायजपुर'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">कुल कार्य दिवस</span>
              <span className="font-black text-emerald-700">32 दिन • ₹7,680 क्रेडिटेड ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 12. LPG SUBSIDY ===================== */}
      {sId === 'lpg_subsidy' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय • MyLPG</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                एलपीजी रसोई गैस सब्सिडी एवं सिलेंडर डिलीवरी पावती
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                PAHAL (DBTL) प्रत्यक्ष लाभ अंतरण योजना अंतर्गत विवरण
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`LPG:ID:${data.lpgId||'12049182049182041'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">17-अंकीय LPG ID</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.lpgId || '12049182049182041'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">उपभोक्ता का नाम</span>
              <span className="font-black text-slate-900">{data.consumerName || 'कमला देवी'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">गैस एजेंसी</span>
              <span className="font-bold text-slate-800">{data.agencyName || 'भारत गैस ग्रामीण वितरक'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">नवीनतम सब्सिडी</span>
              <span className="font-black text-emerald-700">₹312.50 खाते में क्रेडिटेड ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 13. PMAY AWAS LIST ===================== */}
      {sId === 'pm_awas_list' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-emerald-900 uppercase">ग्रामीण विकास मंत्रालय • PMAY-G / AwaasSoft</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                प्रधानमंत्री आवास योजना ग्रामीण (PMAY-G) स्वीकृति एवं क़िस्त पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                ₹1,20,000 अनुदान सहायता एवं जियो-टैगिंग सत्यापन अभिलेख
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`PMAY:ID:${data.rationNo||'UP192840192'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">लाभार्थी का नाम</span>
              <span className="font-black text-slate-900">{data.headName || 'आशा देवी'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">PMAY पंजीकरण संख्या</span>
              <span className="font-mono font-bold text-blue-900">{data.rationNo || 'UP192840192'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">ग्राम पंचायत</span>
              <span className="font-bold text-slate-800">{data.dealerName || 'ग्राम बेहटा, हरदोई'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवास निर्माण स्थिति</span>
              <span className="font-black text-emerald-700">द्वितीय क़िस्त अंतरित (छत स्तर) ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 14. SEWAYOJAN X-10 ===================== */}
      {sId === 'sewayojan_x10' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase">प्रशिक्षण एवं सेवायोजन निदेशालय • उत्तर प्रदेश</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                रोजगार संगम सेवायोजन पंजीकरण कार्ड (X-10 Slip)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                आउटसोर्सिंग, संविदा एवं निजी क्षेत्र की भर्तियों हेतु अनिवार्य पावती
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`SEWAYOJAN:${data.regNo||'UP20261948291'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पंजीकरण संख्या</span>
              <span className="font-mono font-black text-sm text-slate-900">{data.regNo || 'UP20261948291'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">अभ्यर्थी का नाम</span>
              <span className="font-black text-slate-900">{data.studentName || 'अमनदीप'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">दर्ज योग्यता</span>
              <span className="font-bold text-slate-800">{data.course || 'स्नातक (B.Sc.) + CCC'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पंजीकरण वैधता</span>
              <span className="font-bold text-emerald-700">3 वर्ष तक मान्य ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 15. UDYAM MSME CERTIFICATE ===================== */}
      {sId === 'udyam_msme' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">Ministry of Micro, Small and Medium Enterprises • MSME</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                उद्यम पंजीकरण प्रमाणपत्र (Udyam Registration Certificate)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                भारत सरकार सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय द्वारा जारी
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`UDYAM:${data.panNo||'UDYAM-UP-30-0012948'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">उद्यम पंजीकरण संख्या</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.panNo || 'UDYAM-UP-30-0012948'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">इकाई का नाम (Enterprise)</span>
              <span className="font-black text-slate-900">{data.aadhaarNo || 'मेसर्स शर्मा डिजिटल सेवा केंद्र'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">उद्यम श्रेणी (Category)</span>
              <span className="font-bold text-slate-800">सूक्ष्म (Micro Enterprise)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">मुख्य गतिविधि</span>
              <span className="font-bold text-slate-800">सेवा क्षेत्र (Services - Cyber Cafe)</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 16. ADMIT CARD HALL TICKET ===================== */}
      {sId === 'admit_card' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase">भर्ती बोर्ड / परीक्षा प्राधिकरण • Examination Authority</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                प्रतियोगी परीक्षा प्रवेश पत्र (E-Admit Card / Hall Ticket)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                {data.course || 'SSC GD Exam 2026'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`ADMIT:ROLL:${data.regNo||'2401829104'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">रोल नंबर / Roll No</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.regNo || '2401829104'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">परीक्षार्थी का नाम</span>
              <span className="font-black text-slate-900">{data.studentName || 'अभिषेक पटेल'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">परीक्षा केंद्र व शहर</span>
              <span className="font-bold text-slate-800">राजकीय इंटर कॉलेज, हरदोई</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">रिपोर्टिंग समय</span>
              <span className="font-bold text-red-700">प्रातः 08:30 AM (गेट बंद 09:15)</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 17. E-COURT NEXT HEARING DATE ===================== */}
      {sId === 'ecourt_status' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-slate-800 uppercase">e-Courts Services • National Judicial Data Grid</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                न्यायालय वाद स्थिति एवं अगली सुनवाई तिथि पर्ची (e-Court Case Status)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                न्यायालय सिविल जज (जू.डि.), हरदोई • केस अभिलेख
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`ECOURT:CNR:${data.rationNo||'UP04000192842025'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">वादी बनाम प्रतिवादी</span>
              <span className="font-black text-slate-900">{data.applicantName || 'राम कुमार बनाम श्याम लाल'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">CNR संख्या (16 Digit)</span>
              <span className="font-mono font-bold text-blue-900">{data.rationNo || 'UP04000192842025'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">अगली सुनवाई की तारीख</span>
              <span className="font-black text-red-700 text-sm">18 अप्रैल 2026 (साक्ष्य हेतु)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">केस की अवस्था (Stage)</span>
              <span className="font-bold text-slate-800">वादी साक्ष्य (Evidence)</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 18. KANYA SUMANGALA & VIVAH ANUDAN ===================== */}
      {(sId === 'kanya_sumangala' || sId === 'vivah_anudan' || sId === 'mahila_scheme') && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-rose-800 uppercase">महिला एवं बाल विकास विभाग • उत्तर प्रदेश</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {sId === 'kanya_sumangala' ? 'मुख्यमंत्री कन्या सुमंगला योजना क़िस्त प्रमाण पत्र' : 'पुत्री विवाह अनुदान योजना स्वीकृति आदेश पत्र'}
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                राजकीय कोषागार स्तर से प्रत्यक्ष लाभ अंतरण (DBT) स्वीकृति आदेश
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`WELFARE:${data.applicantName||data.headName||'BENEFICIARY'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">लाभार्थी का नाम</span>
              <span className="font-black text-slate-900">{data.applicantName || data.headName || 'आरुषि सिंह'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदन क्रमांक</span>
              <span className="font-mono font-bold text-slate-800">{data.rationNo || 'MKSY-2026-01928'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">स्वीकृत अनुदान राशि</span>
              <span className="font-black text-emerald-700">{sId === 'vivah_anudan' ? '₹20,000/- स्वीकृत' : '₹3,000/- (तृतीय चरण)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">स्वीकृति स्थिति</span>
              <span className="font-black text-emerald-700">कोषागार द्वारा अंतरित ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 19. PASSPORT TRACKING ===================== */}
      {sId === 'passport_track' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">विदेश मंत्रालय • Passport Seva Portal</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                पासपोर्ट सेवा आवेदन स्थिति एवं स्पीड पोस्ट ट्रैकिंग पर्ची
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                Regional Passport Office (RPO) लखनऊ • डिस्पैच अभिलेख
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`PASSPORT:FILE:${data.panNo||'LKO206194829104'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">फाइल संख्या (File No)</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.panNo || 'LKO206194829104'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">आवेदक का नाम</span>
              <span className="font-black text-slate-900">{data.aadhaarNo || 'संजय कुमार'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पुलिस सत्यापन स्थिति</span>
              <span className="font-black text-emerald-700">सत्यापन पूर्ण (Clear) ✓</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">स्पीड पोस्ट ट्रैकिंग</span>
              <span className="font-mono font-bold text-indigo-900">ED194820194IN (डिस्पैच)</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 20. KCC SUBSIDY & ANIMAL HUSBANDRY ===================== */}
      {(sId === 'kcc_subsidy' || sId === 'animal_husbandry_kcc') && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-amber-900 uppercase">नाबार्ड एवं पशुपालन मंत्रालय • NABARD KCC</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {sId === 'kcc_subsidy' ? 'किसान क्रेडिट कार्ड (KCC) 3% ब्याज अनुदान पावती' : 'पशुपालन एवं डेयरी KCC ऋण स्वीकृति पर्ची'}
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                फसली एवं दुधारू पशु ऋण ब्याज सबवेंशन (Interest Subvention) ब्यौरा
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`KCC:${data.farmerName||'FARMER'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">किसान / पशुपालक का नाम</span>
              <span className="font-black text-slate-900">{data.farmerName || 'नत्थू लाल'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">KCC ऋण खाता संख्या</span>
              <span className="font-mono font-bold text-slate-800">{data.mobileReg || '301928475819'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">बैंक शाखा</span>
              <span className="font-bold text-slate-800">आर्यावर्त बैंक, शाखा बिलग्राम</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">3% ब्याज अनुदान</span>
              <span className="font-black text-emerald-700">स्वीकृत व समायोजित ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 21. ITR-V ACKNOWLEDGEMENT ===================== */}
      {sId === 'itr_v_slip' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">आयकर विभाग • Income Tax Department - Govt of India</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                ITR-V भारतीय आयकर रिटर्न सत्यापन पावती (ITR-V Acknowledgement)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                कर निर्धारण वर्ष (AY) 2026-27 • इलेक्ट्रॉनिक फाइलिंग अभिलेख
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`ITRV:PAN:${data.panNo||'AAAPS1928K'}|ACK:${data.aadhaarNo||'240182910492810'}`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पैन नंबर (PAN)</span>
              <span className="font-mono font-black text-sm text-blue-900">{data.panNo || 'AAAPS1928K'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">पावती संख्या (Ack No)</span>
              <span className="font-mono font-bold text-slate-800">{data.aadhaarNo || '240182910492810'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">फाइलिंग स्थिति</span>
              <span className="font-black text-emerald-700">ई-सत्यापित (e-Verified) ✓</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">फॉर्म प्रकार</span>
              <span className="font-bold text-slate-800">ITR-1 (सहज - वेतनभोगी)</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 22. 10TH/12TH BOARD RESULT ===================== */}
      {sId === 'board_result_verify' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-800 uppercase">माध्यमिक शिक्षा परिषद (Board of High School & Intermediate)</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                अंकतालिका व परीक्षा फल सत्यापन पत्र (Certified Marksheet Verification)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                {data.examClass || 'हाईस्कूल (Class 10th)'} परीक्षा वर्ष 2025-26
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`BOARD:ROLL:${data.rollNo||'124019284'}|RES:PASSED|DIV:FIRST`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">अनुक्रमांक (Roll No.)</span>
              <span className="font-mono font-black text-sm text-blue-800">{data.rollNo || '124019284'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">परीक्षार्थी का नाम</span>
              <span className="font-black text-slate-900">{data.studentName || 'मोहित कुमार'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">माता / पिता का नाम</span>
              <span className="font-bold text-slate-800">श्रीमती सरोज देवी / श्री बाबूराम</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">परीक्षा परिणाम</span>
              <span className="font-black text-emerald-700">उत्तीर्ण (PASSED) ✓</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 text-white font-bold p-2 grid grid-cols-12 text-[11px]">
              <span className="col-span-5">विषय (Subject)</span>
              <span className="col-span-3 text-center">पूर्णांक (Max)</span>
              <span className="col-span-4 text-right">प्राप्तांक (Marks Obtained)</span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-5 font-semibold">हिंदी (Hindi)</span>
                <span className="col-span-3 text-center font-mono">100</span>
                <span className="col-span-4 text-right font-mono font-bold">84</span>
              </div>
              <div className="p-2 grid grid-cols-12 bg-slate-50/50">
                <span className="col-span-5 font-semibold">अंग्रेजी (English)</span>
                <span className="col-span-3 text-center font-mono">100</span>
                <span className="col-span-4 text-right font-mono font-bold">78</span>
              </div>
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-5 font-semibold">गणित (Mathematics)</span>
                <span className="col-span-3 text-center font-mono">100</span>
                <span className="col-span-4 text-right font-mono font-bold">88</span>
              </div>
              <div className="p-2 grid grid-cols-12 bg-slate-50/50">
                <span className="col-span-5 font-semibold">विज्ञान (Science Theory + Practical)</span>
                <span className="col-span-3 text-center font-mono">100</span>
                <span className="col-span-4 text-right font-mono font-bold">86</span>
              </div>
              <div className="p-2 grid grid-cols-12">
                <span className="col-span-5 font-semibold">सामाजिक विज्ञान (Social Science)</span>
                <span className="col-span-3 text-center font-mono">100</span>
                <span className="col-span-4 text-right font-mono font-bold">76</span>
              </div>
              <div className="p-2.5 grid grid-cols-12 bg-blue-100/70 border-t-2 border-slate-900 font-black items-center">
                <span className="col-span-5 text-slate-950 text-sm">कुल प्राप्तांक (Grand Total):</span>
                <span className="col-span-3 text-center font-mono">500</span>
                <span className="col-span-4 text-right font-mono text-base text-blue-950">
                  412 / 500 (82.4% - प्रथम श्रेणी)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 23. PAN-AADHAAR LINK ===================== */}
      {sId === 'pan_aadhaar_link' && (
        <div className="space-y-4">
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-blue-900 uppercase">आयकर विभाग • e-Filing Portal</div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                पैन-आधार लिंकिंग सत्यापन प्रमाण पत्र (Link Status Certificate)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                डायरेक्टरेट ऑफ इनकम टैक्स (सिस्टम्स) - नई दिल्ली
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="p-1 bg-white border border-slate-300 rounded-lg inline-block">
                <QRCodeSVG value={`ITD:LINK:PAN:${data.panNo||'ABCDE1234F'}|STATUS:LINKED_OK`} size={64} />
              </div>
              <div className="text-[10px] font-mono font-bold text-slate-600 mt-1">{token}</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-emerald-950 text-base">
              PAN is already linked to given Aadhaar
            </h4>
            <p className="text-xs text-emerald-800">
              आपका स्थायी खाता संख्या (PAN) आपके आधार संख्या के साथ सफलतापूर्वक संबद्ध एवं सक्रिय है।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">पैन नंबर (Permanent Account Number)</span>
              <span className="font-mono font-black text-sm text-slate-900">{data.panNo || 'ABCDE1234F'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">आधार नंबर (Aadhaar Number)</span>
              <span className="font-mono font-black text-sm text-slate-900">{data.aadhaarNo || 'XXXX XXXX 4921'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Common Official Footer */}
      <div className="pt-4 mt-4 border-t-2 border-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-slate-500 text-[11px]">
          <p className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
            <span>यह प्रमाणित प्रति आधिकारिक डिजिटल सेवा केंद्र सर्वर से नागरिक सुविधा हेतु जारी की गई है।</span>
          </p>
          <p>सेवा केंद्र: {cafe?.shopName || 'डिजिटल सेवा केंद्र'} • जारी समय: {generatedAt}</p>
        </div>

        <div className="text-center sm:text-right shrink-0 border border-slate-300 rounded-xl p-3 bg-slate-50 min-w-[170px]">
          <div className="w-10 h-10 mx-auto sm:ml-auto border border-dashed border-slate-400 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400 mb-1">
            मुहर
          </div>
          <span className="text-[10px] font-bold text-slate-700 block">अधिकृत हस्ताक्षरकर्ता</span>
          <span className="text-[9px] text-slate-500 block">{cafe?.shopName || 'जन सेवा केंद्र'}</span>
        </div>
      </div>

    </div>
  );
}
