import React, { useState } from 'react';
import { 
  ExternalLink, Search, Globe, Landmark, Award, 
  CreditCard, GraduationCap, ShieldCheck, Sparkles 
} from 'lucide-react';

const PORTALS = [
  {
    name: 'CSC Digital Seva Portal',
    url: 'https://digitalseva.csc.gov.in/',
    category: 'CSC व बैंकिंग',
    desc: 'CSC VLE लॉगिन, बैंकिंग, रिचार्ज, बिल भुगतान व जन सेवा केंद्र पोर्टल',
    badge: 'Official'
  },
  {
    name: 'e-District UP (ई-डिस्ट्रिक्ट उत्तर प्रदेश)',
    url: 'https://edistrict.up.gov.in/',
    category: 'प्रमाण पत्र (Certificates)',
    desc: 'आय, जाति, निवास, दिव्यांग व खतौनी प्रमाण पत्र आवेदन',
    badge: 'Popular'
  },
  {
    name: 'RTPS Bihar (सर्विस प्लस बिहार)',
    url: 'https://serviceonline.bihar.gov.in/',
    category: 'प्रमाण पत्र (Certificates)',
    desc: 'जाति, आवासीय व आय प्रमाण पत्र बिहार पोर्टल',
    badge: 'Popular'
  },
  {
    name: 'SSC Official Portal (कर्मचारी चयन आयोग)',
    url: 'https://ssc.gov.in/',
    category: 'सरकारी नौकरी',
    desc: 'SSC CGL, CHSL, GD Constable, MTS आवेदन व एडमिट कार्ड',
    badge: 'Trending'
  },
  {
    name: 'UTIITSL PAN Card Portal',
    url: 'https://www.pan.utiitsl.com/',
    category: 'पैन व आधार',
    desc: 'नया पैन कार्ड (Form 49A), पैन सुधार व रिप्रिंट',
    badge: 'Essential'
  },
  {
    name: 'Protean (NSDL) PAN Portal',
    url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
    category: 'पैन व आधार',
    desc: 'NSDL ऑनलाइन पैन कार्ड आवेदन व स्टेटस ट्रैकिंग',
    badge: 'Essential'
  },
  {
    name: 'UP Scholarship Portal (छात्रवृत्ति)',
    url: 'https://scholarship.up.gov.in/',
    category: 'स्कॉलरशिप',
    desc: 'दशमोत्तर, प्री-मैट्रिक छात्रवृत्ति रजिस्ट्रेशन व रिन्यूअल',
    badge: 'High Demand'
  },
  {
    name: 'National Scholarship Portal (NSP)',
    url: 'https://scholarships.gov.in/',
    category: 'स्कॉलरशिप',
    desc: 'केंद्रीय व अल्पसंख्यक छात्रवृत्ति योजनाएं (All India)',
    badge: 'Central'
  },
  {
    name: 'Parivahan Sarathi (ड्राइविंग लाइसेंस)',
    url: 'https://sarathi.parivahan.gov.in/',
    category: 'वाहन व लाइसेंस',
    desc: 'लर्निंग लाइसेंस, पक्का ड्राइविंग लाइसेंस व RC सेवाएं',
    badge: 'Govt'
  },
  {
    name: 'myAadhaar Portal (UIDAI)',
    url: 'https://myaadhaar.uidai.gov.in/',
    category: 'पैन व आधार',
    desc: 'आधार डाउनलोड, PVC कार्ड ऑर्डर, एड्रेस अपडेट व बायोमेट्रिक लॉक',
    badge: 'UIDAI'
  },
  {
    name: 'EPFO UAN Member Portal (PF क्लेम)',
    url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/',
    category: 'CSC व बैंकिंग',
    desc: 'PF बैलेंस विड्रॉल (Form 31/19/10C), पासबुक व KYC',
    badge: 'PF'
  },
  {
    name: 'PM Kisan Samman Nidhi',
    url: 'https://pmkisan.gov.in/',
    category: 'योजनाएं',
    desc: 'किसान सम्मान निधि e-KYC, नया किसान रजिस्ट्रेशन व किस्त स्टेटस',
    badge: 'PM Scheme'
  },
  {
    name: 'Railway Recruitment Boards (RRB)',
    url: 'https://www.rrbcdg.gov.in/',
    category: 'सरकारी नौकरी',
    desc: 'रेलवे NTPC, Group D, ALP व तकनीशियन भर्ती पोर्टल',
    badge: 'Govt'
  },
  {
    name: 'DigiLocker Portal',
    url: 'https://www.digilocker.gov.in/',
    category: 'दस्तावेज़',
    desc: 'डिजिटल मार्कशीट, ड्राइविंग लाइसेंस व पैन कार्ड फेच करें',
    badge: 'DigiLocker'
  }
];

export default function PortalsDirectory() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const categories = ['All', 'सरकारी नौकरी', 'प्रमाण पत्र (Certificates)', 'पैन व आधार', 'स्कॉलरशिप', 'CSC व बैंकिंग', 'योजनाएं'];

  const filtered = PORTALS.filter(p => {
    const matchesCat = filter === 'All' || p.category === filter;
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-yellow-300 mb-2">
            <Globe className="w-3.5 h-3.5" />
            1-क्लिक सरकारी वेबसाइट डायरेक्ट हब
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            सरकारी व जन सेवा पोर्टल्स डायरेक्टरी (Official Portals Hub)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            CSC, ई-डिस्ट्रिक्ट, SSC, पैन कार्ड, स्कॉलरशिप व आधार के आधिकारिक पोर्टल्स को सीधे एक क्लिक में खोलें।
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                filter === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="वेबसाइट खोजें..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((portal, idx) => (
          <a
            key={idx}
            href={portal.url}
            target="_blank"
            rel="noreferrer"
            className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-lg transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {portal.category}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {portal.badge}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2.5 group-hover:text-blue-600 transition flex items-center justify-between">
                <span>{portal.name}</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {portal.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>आधिकारिक पोर्टल खोलें</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </div>
          </a>
        ))}
      </div>

    </div>
  );
}
