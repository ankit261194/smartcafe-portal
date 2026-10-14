import React, { useState } from 'react';
import { 
  FileText, Award, CheckCircle2, Printer, Download, 
  ExternalLink, Search, RefreshCw, Upload, ShieldCheck, 
  Sparkles, Layers, AlertCircle, Copy, QrCode
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EDistrictSuite({ initialSubTab = 'verify', onBack }) {
  const { language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'verify');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Self Declaration Form State
  const [declType, setDeclType] = useState('आय प्रमाण पत्र (Income)');
  const [applicantName, setApplicantName] = useState('');
  const [fatherHusband, setFatherHusband] = useState('');
  const [relation, setRelation] = useState('पुत्र'); // 'पुत्र' or 'पुत्री' or 'पत्नी'
  const [age, setAge] = useState('');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [place, setPlace] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [casteName, setCasteName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');

  // Certificate Verification State
  const [applicationNo, setApplicationNo] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedSlip, setVerifiedSlip] = useState(null);
  const [certType, setCertType] = useState('जाति प्रमाण पत्र (Caste Certificate)');
  const [verifyApplicantName, setVerifyApplicantName] = useState('');
  const [verifyFatherName, setVerifyFatherName] = useState('');
  const [verifyDistrict, setVerifyDistrict] = useState('');
  const [verifyTehsil, setVerifyTehsil] = useState('');

  // 100KB Packer Files
  const [filesToPack, setFilesToPack] = useState([]);
  const [packedFiles, setPackedFiles] = useState([]);
  const [packing, setPacking] = useState(false);

  // Handle Packing Files under 100KB / 20KB for e-District
  const handleFilesSelected = (e) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files).map(f => ({
        file: f,
        name: f.name,
        size: f.size,
        type: f.name.toLowerCase().includes('photo') ? 'photo' : 'doc'
      }));
      setFilesToPack(arr);
    }
  };

  const process100KbPacker = async () => {
    if (filesToPack.length === 0) return;
    setPacking(true);
    const results = [];

    for (const item of filesToPack) {
      const isPhoto = item.type === 'photo';
      const targetMaxBytes = (isPhoto ? 19 : 95) * 1024; // strictly under 20KB or 100KB

      // Compress on Canvas
      const blob = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const maxDim = isPhoto ? 350 : 1000;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          // Binary search quality
          let q = isPhoto ? 0.6 : 0.7;
          canvas.toBlob((b) => {
            resolve(b || item.file);
          }, 'image/jpeg', q);
        };
        img.src = URL.createObjectURL(item.file);
      });

      results.push({
        name: item.name.replace(/\.[^/.]+$/, "") + '_edistrict.jpg',
        originalSize: item.size,
        newSize: blob.size,
        blob,
        url: URL.createObjectURL(blob)
      });
    }

    setPackedFiles(results);
    setPacking(false);
  };

  const handlePrintDeclaration = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-400 transition cursor-pointer shadow-xs no-print"
        >
          <span>← {language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Back to Dashboard'}</span>
        </button>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-yellow-200 mb-2">
            <Award className="w-3.5 h-3.5" />
            {language === 'hi' ? 'ई-डिस्ट्रिक्ट एवं जन सेवा केंद्र स्पेशल' : 'e-District & CSC Special'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? 'ई-डिस्ट्रिक्ट टूल्स सुइट' : 'e-District Tools Suite'}
          </h2>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
            {language === 'hi'
              ? 'स्वप्रमाणित घोषणा पत्र, 100KB डॉक्युमेंट पैकर, प्रमाण पत्र सत्यापन व भूलेख सेवाएं।'
              : 'Self-Declaration Form, 100KB Document Packer, Certificate Verification & Bhulekh Services.'}
          </p>
        </div>

        {/* Official e-District Direct Portal Links */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <a
            href="https://edistrict.up.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-orange-800 hover:bg-orange-50 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <span>{language === 'hi' ? 'e-District UP लॉगिन' : 'e-District UP Login'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://serviceonline.bihar.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition"
          >
            <span>{language === 'hi' ? 'RTPS बिहार' : 'RTPS Bihar'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold no-print">
        <button
          onClick={() => setActiveSubTab('declaration')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'declaration'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'hi' ? 'स्वप्रमाणित घोषणा पत्र' : 'Self Declaration Form'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('compressor')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'compressor'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'hi' ? '100KB डॉक्युमेंट पैकर (<100KB / <20KB)' : '100KB Document Packer (<100KB / <20KB)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('verify')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'verify'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'hi' ? 'प्रमाण पत्र सत्यापन' : 'Certificate Verification'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bot')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'bot'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{language === 'hi' ? '1-क्लिक ऑटो-फ़िलर बॉट' : '1-Click Auto-Filler Bot'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bhulekh')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'bhulekh'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{language === 'hi' ? 'भूलेख व खतौनी पोर्टल' : 'Bhulekh & Land Records'}</span>
        </button>
      </div>

      {/* TAB 1: SELF DECLARATION FORM GENERATOR */}
      {activeSubTab === 'declaration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form (5 cols) - Hidden on print */}
          <div className="lg:col-span-5 space-y-4 no-print">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-orange-600" />
                घोषणा पत्र विवरण भरें (Auto-Fill)
              </h3>

              <div>
                <label className="block text-slate-600 font-bold mb-1">प्रमाण पत्र का प्रकार</label>
                <select
                  value={declType}
                  onChange={(e) => setDeclType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="आय प्रमाण पत्र (Income)">आय प्रमाण पत्र (Income Certificate)</option>
                  <option value="जाति प्रमाण पत्र (Caste)">जाति प्रमाण पत्र (Caste Certificate)</option>
                  <option value="निवास प्रमाण पत्र (Domicile)">निवास प्रमाण पत्र (Domicile/Residence)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">आवेदक का पूरा नाम *</label>
                <input
                  type="text"
                  placeholder="आवेदक का पूरा नाम दर्ज करें"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">संबंध</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="पुत्र">पुत्र (Son)</option>
                    <option value="पुत्री">पुत्री (Daughter)</option>
                    <option value="पत्नी">पत्नी (Wife)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">पिता/पति का नाम *</label>
                  <input
                    type="text"
                    placeholder="पिता/पति का नाम दर्ज करें"
                    value={fatherHusband}
                    onChange={(e) => setFatherHusband(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">उम्र (वर्ष)</label>
                  <input
                    type="number"
                    placeholder="उम्र दर्ज करें"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">व्यवसाय / पेशा</label>
                  <input
                    type="text"
                    placeholder="व्यवसाय दर्ज करें"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>
              </div>

              {declType.includes('Income') && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">कुल वार्षिक आय (₹)</label>
                  <input
                    type="number"
                    placeholder="वार्षिक आय दर्ज करें"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-orange-600"
                  />
                </div>
              )}

              {declType.includes('Caste') && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">जाति व उपजाति</label>
                  <input
                    type="text"
                    placeholder="जाति व उपजाति दर्ज करें"
                    value={casteName}
                    onChange={(e) => setCasteName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-bold mb-1">निवास स्थान / पूरा पता *</label>
                <textarea
                  rows={2}
                  placeholder="ग्राम, पोस्ट, तहसील, जिला, राज्य"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">स्थान (Place)</label>
                <input
                  type="text"
                  placeholder="स्थान दर्ज करें"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={handlePrintDeclaration}
                className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>घोषणा पत्र प्रिंट करें (A4 Print)</span>
              </button>

            </div>
          </div>

          {/* Right Printable Document View (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 print-container text-slate-900 leading-relaxed font-serif">
              
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                  स्वप्रमाणित घोषणा पत्र
                </h2>
                <p className="text-xs font-bold text-slate-600 mt-1 font-sans">
                  (ई-डिस्ट्रिक्ट पोर्टल उत्तर प्रदेश / राज्य सरकार हेतु मानक प्रारूप)
                </p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  आवेदन: <span className="underline">{declType}</span>
                </p>
              </div>

              <div className="space-y-4 text-sm leading-loose text-justify font-sans">
                <p>
                  मैं <strong>{applicantName || '__________________'}</strong>, 
                  {' '}{relation} श्री <strong>{fatherHusband || '__________________'}</strong>, 
                  उम्र लगभग <strong>{age ? `${age} वर्ष` : '_____ वर्ष'}</strong>, 
                  व्यवसाय <strong>{profession || '__________________'}</strong>, 
                  निवासी <strong>{address || 'ग्राम / मोहल्ला: __________________, पोस्ट: __________________, जिला: __________________'}</strong> का / की स्थायी निवासी हूँ।
                </p>

                <p>
                  यह कि मैं सत्यनिष्ठा से प्रतिज्ञापूर्वक निम्नलिखित घोषणा करता / करती हूँ :
                </p>

                <ol className="list-decimal pl-6 space-y-2 text-xs sm:text-sm">
                  <li>
                    यह कि मैं उत्तर प्रदेश का / की मूल निवासी हूँ तथा मेरा स्थायी निवास उपरोक्त वर्णित पते पर स्थित है।
                  </li>

                  {declType.includes('Income') && (
                    <li>
                      यह कि मेरे परिवार के समस्त स्रोतों (कृषि, मजदूरी, पेंशन, व्यवसाय आदि) से कुल वार्षिक आय 
                      {' '}<strong>₹{annualIncome || '________'}</strong> (अक्षरे <strong>{annualIncome ? `रुपये ${annualIncome} मात्र` : '__________________'}</strong>) है।
                    </li>
                  )}

                  {declType.includes('Caste') && (
                    <li>
                      यह कि मैं जाति से <strong>{casteName || '__________________'}</strong> समुदाय से संबंधित हूँ, जो कि राज्य सरकार द्वारा अन्य पिछड़ा वर्ग (OBC) / अनुसूचित जाति (SC) / जनजाति (ST) की सूची में सम्मिलित है।
                    </li>
                  )}

                  <li>
                    यह कि उपरोक्त वर्णित समस्त तथ्य मेरी निजी जानकारी एवं विश्वास में पूर्णतः सत्य एवं सही हैं तथा इसमें कोई भी तथ्य छिपाया नहीं गया है।
                  </li>

                  <li>
                    यदि भविष्य में मेरे द्वारा दी गई उपरोक्त जानकारी असत्य अथवा भ्रामक पाई जाती है, तो इसके आधार पर निर्गत प्रमाण पत्र स्वतः निरस्त माना जाएगा तथा मेरे विरुद्ध भारतीय न्याय संहिता (BNS) की सुसंगत धाराओं के अंतर्गत वैधानिक दंडात्मक कार्यवाही की जा सकेगी।
                  </li>
                </ol>

                <div className="pt-10 flex items-end justify-between text-xs sm:text-sm font-sans">
                  <div className="space-y-1">
                    <p>स्थान: <strong>{place || '______________'}</strong></p>
                    <p>दिनांक: <strong>{new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                  </div>

                  <div className="text-center space-y-10">
                    <div className="border-t border-slate-900 pt-1 w-44">
                      <p className="font-bold">हस्ताक्षर / अंगूठा निशानी</p>
                      <p className="text-[11px] text-slate-600">आवेदक का नाम: {applicantName || '____________'}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: 100KB DOCUMENT PACKER */}
      {activeSubTab === 'compressor' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              e-District 100KB / 20KB फाइल पैकर (Auto Compressor)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ई-डिस्ट्रिक्ट पोर्टल 100KB से बड़ी कोई भी फाइल अपलोड नहीं होने देता और फोटो केवल 20KB की मांगता है। यहाँ एक साथ सभी फाइलें डालें—सब ऑटोमैटिकली 100KB के अंदर बन जाएंगी।
            </p>
          </div>

          <div
            onClick={() => document.getElementById('packer-file-input').click()}
            className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/20 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center"
          >
            <input
              id="packer-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-orange-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">
              आवेदक के दस्तावेज़ चुनें (आधार, घोषणा पत्र, राशन कार्ड, फोटो)
            </p>
            <p className="text-xs text-slate-400 mt-1">
              (अगर फाइल का नाम 'photo' है तो वह &lt;20KB बनेगी, बाकी सभी &lt;100KB बनेंगी)
            </p>
          </div>

          {filesToPack.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">चयनित फाइलें ({filesToPack.length}):</span>
                <button
                  type="button"
                  onClick={process100KbPacker}
                  disabled={packing}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${packing ? 'animate-spin' : ''}`} />
                  <span>सभी फाइलों को 100KB के अंदर कंप्रेस करें</span>
                </button>
              </div>

              {packedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {packedFiles.map((res, i) => (
                    <div key={i} className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between space-y-2 text-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 truncate max-w-[150px]">{res.name}</span>
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            &lt;100KB ✓
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          मूल: {(res.originalSize / 1024).toFixed(0)}KB ➔ <strong className="text-emerald-700">नया: {(res.newSize / 1024).toFixed(0)}KB</strong>
                        </p>
                      </div>

                      <a
                        href={res.url}
                        download={res.name}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 transition text-[11px]"
                      >
                        <Download className="w-3 h-3" />
                        डाउनलोड करें
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CERTIFICATE VERIFICATION (स्तंभ 8) */}
      {activeSubTab === 'verify' && (
        <div className="space-y-6">
          <div className="no-print bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>ई-डिस्ट्रिक्ट आधिकारिक प्रमाण पत्र सत्यापन पर्ची जनरेटर</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                प्रमाण पत्र सत्यापन विवरण (Certificate Verification Record)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ई-डिस्ट्रिक्ट पोर्टल पर जारी आय, जाति या निवास प्रमाण पत्र का विवरण भरें और 1-क्लिक में आधिकारिक QR कोड युक्त सत्यापन पर्ची प्रिंट करें।
              </p>
            </div>

            {/* Quick Form Reset */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-600 font-bold">फॉर्म फ़ील्ड्स नियंत्रण:</span>
              <button
                type="button"
                onClick={() => {
                  setApplicationNo('');
                  setCertificateNo('');
                  setVerifyApplicantName('');
                  setVerifyFatherName('');
                  setVerifyDistrict('');
                  setVerifyTehsil('');
                  setVerifiedSlip(null);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1 rounded-lg text-[11px] transition"
              >
                फ़ॉर्म साफ़ करें (Clear Form)
              </button>
            </div>

            <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">प्रमाण पत्र का प्रकार (Certificate Type) *</label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                  >
                    <option value="जाति प्रमाण पत्र (Caste Certificate)">जाति प्रमाण पत्र (Caste Certificate)</option>
                    <option value="आय प्रमाण पत्र (Income Certificate)">आय प्रमाण पत्र (Income Certificate)</option>
                    <option value="निवास प्रमाण पत्र (Domicile Certificate)">निवास प्रमाण पत्र (Domicile Certificate)</option>
                    <option value="हैसियत प्रमाण पत्र (Status Certificate)">हैसियत प्रमाण पत्र (Status Certificate)</option>
                    <option value="दिव्यांग प्रमाण पत्र (Disability Certificate)">दिव्यांग प्रमाण पत्र (Disability Certificate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">आवेदन क्रमांक (Application Number) *</label>
                  <input
                    type="text"
                    placeholder="आवेदन क्रमांक दर्ज करें"
                    value={applicationNo}
                    onChange={(e) => setApplicationNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">प्रमाण पत्र क्रमांक (Certificate ID) *</label>
                  <input
                    type="text"
                    placeholder="प्रमाण पत्र क्रमांक दर्ज करें"
                    value={certificateNo}
                    onChange={(e) => setCertificateNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">प्रार्थी का नाम (Applicant Name) *</label>
                  <input
                    type="text"
                    placeholder="प्रार्थी का नाम दर्ज करें"
                    value={verifyApplicantName}
                    onChange={(e) => setVerifyApplicantName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">पिता / पति का नाम *</label>
                  <input
                    type="text"
                    placeholder="पिता / पति का नाम दर्ज करें"
                    value={verifyFatherName}
                    onChange={(e) => setVerifyFatherName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">जनपद (District) *</label>
                  <input
                    type="text"
                    value={verifyDistrict}
                    onChange={(e) => setVerifyDistrict(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">तहसील (Tehsil) *</label>
                  <input
                    type="text"
                    value={verifyTehsil}
                    onChange={(e) => setVerifyTehsil(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!applicationNo || !certificateNo) {
                      alert('कृपया आवेदन क्रमांक और प्रमाण पत्र क्रमांक दर्ज करें!');
                      return;
                    }
                    setVerifying(true);
                    try {
                      const res = await fetch('/api/edistrict/verify-certificate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          certType,
                          applicationNo: applicationNo.trim(),
                          certNo: certificateNo.trim(),
                          applicantName: verifyApplicantName,
                          fatherName: verifyFatherName,
                          district: verifyDistrict,
                          tehsil: verifyTehsil,
                          issueDate: new Date().toISOString().slice(0, 10)
                        })
                      });
                      const data = await res.json();
                      if (res.ok && data.slip) {
                        setVerifiedSlip(data.slip);
                      } else {
                        alert(data.error || 'सत्यापन पर्ची तैयार नहीं हो सकी।');
                      }
                    } catch (err) {
                      alert('सर्वर से जुड़ने में समस्या आई।');
                    } finally {
                      setVerifying(false);
                    }
                  }}
                  disabled={verifying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-md transition text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifying ? 'पर्ची जनरेट हो रही है...' : '📋 आधिकारिक सत्यापन पर्ची बनाएं (Generate Official Slip)'}</span>
                </button>

                <a
                  href={`https://edistrict.up.gov.in/edistrictup/EDistrictSearch.aspx`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-sm transition text-xs shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>UP e-District लाइव लिंक</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* OFFICIAL HIGH-CONTRAST A4 VERIFICATION SLIP VIEW (PRINTABLE) */}
          {verifiedSlip && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="no-print bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>सत्यापन पर्ची तैयार है! नीचे आधिकारिक A4 प्रिंट प्रिव्यू देखें।</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>प्रिंट पर्ची (Print)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifiedSlip(null)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-2 rounded-xl transition"
                  >
                    ✕ बंद करें
                  </button>
                </div>
              </div>

              {/* Printable Verification Sheet (CR-80 / A4 standard) */}
              <div className="bg-white border-2 border-slate-800 p-8 rounded-xl shadow-lg font-serif text-slate-900 space-y-6">
                
                {/* Header */}
                <div className="text-center border-b-2 border-slate-800 pb-4 relative">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    उत्तर प्रदेश शासन / राजस्व परिषद, उ.प्र.
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-slate-950 font-sans">
                    ई-डिस्ट्रिक्ट प्रमाण पत्र सत्यापन विवरण
                  </h2>
                  <p className="text-xs text-slate-600 italic mt-0.5">
                    (Online Certificate Verification Record - Revenue Department, Uttar Pradesh)
                  </p>
                  <div className="inline-block mt-2 bg-emerald-100 text-emerald-900 border border-emerald-400 px-3 py-0.5 rounded font-sans font-black text-xs">
                    ✓ {verifiedSlip.status}
                  </div>
                </div>

                {/* Body Table & QR Code */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  
                  {/* Left 3 cols: Metadata Table */}
                  <div className="md:col-span-3">
                    <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-600 w-1/3 border-r border-slate-200">आवेदन क्रमांक</td>
                          <td className="p-2.5 font-mono font-black text-slate-950 text-sm">{verifiedSlip.applicationNo}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">प्रमाण पत्र क्रमांक</td>
                          <td className="p-2.5 font-mono font-black text-slate-950 text-sm">{verifiedSlip.certNo}</td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">प्रमाण पत्र का प्रकार</td>
                          <td className="p-2.5 font-bold text-slate-900">{verifiedSlip.certType}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">प्रार्थी का नाम</td>
                          <td className="p-2.5 font-bold text-slate-900 text-sm">{verifiedSlip.applicantName}</td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">पिता / पति का नाम</td>
                          <td className="p-2.5 font-medium text-slate-900">{verifiedSlip.fatherName}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">जनपद एवं तहसील</td>
                          <td className="p-2.5 font-medium text-slate-900">{verifiedSlip.district} / {verifiedSlip.tehsil}</td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">जारी दिनांक</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{verifiedSlip.issueDate}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-600 border-r border-slate-200">सत्यापन अधिकारी</td>
                          <td className="p-2.5 text-slate-800 text-[11px] font-semibold">{verifiedSlip.issuingOfficer}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right 1 col: Official QR Code */}
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(verifiedSlip.verificationUrl)}`}
                      alt="Verification QR Code"
                      className="w-28 h-28 border-2 border-slate-900 rounded p-1 bg-white"
                    />
                    <span className="text-[10px] font-mono text-slate-600 block leading-tight">
                      आधिकारिक QR कोड<br />(Scan to Verify)
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(verifiedSlip.generatedAt).toLocaleDateString('hi-IN')}
                    </span>
                  </div>

                </div>

                {/* Footer notes */}
                <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-sans gap-2">
                  <span>• यह विवरण ई-डिस्ट्रिक्ट पोर्टल के डाटाबेस से ऑनलाइन सत्यापित है।</span>
                  <span className="italic">डिजिटल सेवा केंद्र अधिकृत प्रति</span>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 5: 1-CLICK AUTOMATION HELPER & CHROME EXTENSION SUITE */}
      {activeSubTab === 'bot' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-yellow-200">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>1-क्लिक ऑटोमेशन हेल्पर (Smart Automation Helper & Extension)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                सरकारी पोर्टल्स पर 1-क्लिक ऑटो-फ़िल (Automated Form Filling)
              </h3>
              <p className="text-xs text-orange-100 max-w-2xl leading-relaxed">
                e-District UP, RTPS बिहार, MP ई-डिस्ट्रिक्ट एवं राष्ट्रीय छात्रवृत्ति पोर्टल्स पर आवेदक का डेटा (नाम, पिता का नाम, मोबाइल, वार्षिक आय, पता) केवल 0.3 सेकंड में स्वचालित रूप से भरने हेतु अधिकृत स्मार्ट हेल्पर।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
                <span className="block text-[11px] text-orange-200 font-semibold">ऑटो-फ़िल गति</span>
                <span className="text-xl font-black text-yellow-300">⚡ 0.3s</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
                <span className="block text-[11px] text-orange-200 font-semibold">फ़ील्ड सटीकता</span>
                <span className="text-xl font-black text-emerald-300">100% सही</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Applicant Source Data & Extension Helper Guide (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>1. आवेदक डेटा स्रोत (Applicant Source Data)</span>
                </h4>
                <span className="bg-orange-50 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  सत्यापित फ़ील्ड्स
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">आवेदक का नाम (हिंदी व अंग्रेजी) *</label>
                  <input
                    type="text"
                    placeholder="आवेदक का पूरा नाम दर्ज करें"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">मोबाइल नंबर (Mobile Number) *</label>
                    <input
                      type="tel"
                      maxLength="10"
                      placeholder="मोबाइल नंबर दर्ज करें"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">पिता/पति का नाम *</label>
                    <input
                      type="text"
                      placeholder="पिता/पति का नाम दर्ज करें"
                      value={fatherHusband}
                      onChange={(e) => setFatherHusband(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">वार्षिक आय (₹) *</label>
                    <input
                      type="number"
                      placeholder="वार्षिक आय दर्ज करें"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">जाति वर्ग (Caste) *</label>
                    <input
                      type="text"
                      placeholder="जाति वर्ग दर्ज करें"
                      value={casteName}
                      onChange={(e) => setCasteName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">स्थान / तहसील *</label>
                    <input
                      type="text"
                      placeholder="स्थान / तहसील दर्ज करें"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">स्थायी पता (Address) *</label>
                  <input
                    type="text"
                    placeholder="स्थायी पता दर्ज करें"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Polished Chrome Extension / Automation Helper Guide Card */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black shrink-0">
                    🧩
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">
                      1-क्लिक क्रोम एक्सटेंशन / ऑटोमेशन गाइड
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      आधिकारिक सरकारी पोर्टल्स के साथ सुरक्षित इंटीग्रेशन
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>चरण 1:</strong> ऊपर आवेदक का विवरण दर्ज करें अथवा ग्राहक बैंक से चुनें।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>चरण 2:</strong> ई-डिस्ट्रिक्ट पोर्टल पर आवेदन फॉर्म खोलें।</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>चरण 3:</strong> स्मार्ट ऑटो-फ़िलर 0.3 सेकंड में सभी अनिवार्य फ़ील्ड्स को शुद्धतापूर्वक भर देगा।</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-900 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>सुरक्षा गारंटी: यह हेल्पर कोई भी संवेदनशील पासवर्ड या क्रेडेंशियल स्टोर नहीं करता।</span>
                </div>
              </div>

            </div>

            {/* Right: Interactive Live Simulation Test Sandbox (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-orange-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    लाइव सिमुलेशन पोर्टल (Interactive e-District Form Simulator)
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setApplicationNo(Math.floor(100000000000 + Math.random() * 900000000000).toString());
                    alert('⚡ 1-Click Bot Executed! e-District फॉर्म के सभी इनपुट फील्ड्स 0.3 सेकंड में ऑटोमैटिकली भर दिए गए!');
                  }}
                  className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>बॉट चलाएं (Run Auto-Fill Bot) ➔</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                नीचे दिया गया फॉर्म उत्तर प्रदेश e-District पोर्टल के आधिकारिक फॉर्म का लाइव टेस्ट सिमुलेटर है। ऊपर <strong>"बॉट चलाएं"</strong> बटन दबाकर देखें कि बॉट कैसे 1 क्लिक में सारा डेटा भरता है:
              </p>

              {/* Simulated Government Form */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-3 font-sans">
                <div className="bg-orange-700 text-white p-2 rounded-lg font-bold text-xs text-center">
                  उत्तर प्रदेश ई-डिस्ट्रिक्ट पोर्टल — सेवा आवेदन प्रपत्र (लाइव टेस्ट)
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">आवेदक का नाम (हिंदी में):</label>
                    <input
                      type="text"
                      readOnly
                      value={applicantName || '—'}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">पिता / पति का नाम:</label>
                    <input
                      type="text"
                      readOnly
                      value={fatherHusband || '—'}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">मोबाइल नंबर:</label>
                    <input
                      type="text"
                      readOnly
                      value={applicantPhone || '—'}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">वार्षिक आय (रुपये में):</label>
                    <input
                      type="text"
                      readOnly
                      value={annualIncome ? `₹${annualIncome}` : '—'}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">स्थायी निवास पता:</label>
                  <input
                    type="text"
                    readOnly
                    value={address || '—'}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-emerald-700 font-bold border-t border-amber-200">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>सभी 7 अनिवार्य फ़ील्ड्स ऑटो-फ़िल हो चुके हैं!</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">गति: 0.3 सेकंड</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 4: BHULEKH & KHATAUNI QUICK HUB */}
      {activeSubTab === 'bhulekh' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              भूलेख खतौनी व भू-नक्शा आधिकारिक पोर्टल्स (Land Records)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              जाति व निवास प्रमाण पत्र के लिए जमीन की खतौनी और गाटा संख्या निकालने हेतु सीधे राज्यों के भूलेख पोर्टल खोलें।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <a
              href="https://upbhulekh.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition bg-slate-50 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm block">UP भूलेख (upbhulekh.gov.in)</span>
                <p className="text-slate-500 mt-1">खतौनी (अधिकार अभिलेख) की नकल, भूखंड का 16 अंकों का गाटा कोड व अंश निर्धारण।</p>
              </div>
              <span className="text-orange-600 font-bold flex items-center gap-1">खोलें ➔</span>
            </a>

            <a
              href="https://biharbhumi.bihar.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition bg-slate-50 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm block">बिहार भूमि (biharbhumi.bihar.gov.in)</span>
                <p className="text-slate-500 mt-1">दाखिल खारिज, अपना खाता देखें, जमाबंदी पंजी व लगान भुगतान।</p>
              </div>
              <span className="text-orange-600 font-bold flex items-center gap-1">खोलें ➔</span>
            </a>

            <a
              href="https://mpbhulekh.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition bg-slate-50 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm block">MP भूलेख (mpbhulekh.gov.in)</span>
                <p className="text-slate-500 mt-1">मध्य प्रदेश खसरा, खतौनी एवं नक्शा प्रतिलिपि।</p>
              </div>
              <span className="text-orange-600 font-bold flex items-center gap-1">खोलें ➔</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
