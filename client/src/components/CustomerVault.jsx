import React, { useState, useEffect } from 'react';
import { 
  Users, Search, PlusCircle, Copy, CheckCircle2, 
  Trash2, Edit3, FileText, Phone, Mail, Award, X, Sparkles, ShieldCheck
} from 'lucide-react';

export default function CustomerVault({ selectedCafe }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // New customer form state
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    category: 'OBC',
    phone: '',
    email: '',
    aadhaarNo: '',
    address: '',
    pincode: '',
    highSchool: {
      board: 'UP Board',
      rollNo: '',
      passingYear: '2022',
      totalMarks: '600',
      obtainedMarks: '',
      percentage: ''
    },
    intermediate: {
      board: 'UP Board',
      rollNo: '',
      stream: 'Science',
      passingYear: '2024',
      totalMarks: '500',
      obtainedMarks: '',
      percentage: ''
    },
    notes: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const cafeParam = selectedCafe?.id ? `?cafeId=${selectedCafe.id}` : '';
      const res = await fetch(`/api/customers${cafeParam}`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [selectedCafe?.id]);

  const handleCopyDetails = (c) => {
    const text = `
=== ग्राहक बायोडाटा (फॉर्म हेतु) ===
नाम: ${c.fullName}
पिता का नाम: ${c.fatherName}
माता का नाम: ${c.motherName}
जन्मतिथि (DOB): ${c.dob}
लिंग: ${c.gender} | वर्ग: ${c.category}
मोबाइल: ${c.phone} | ईमेल: ${c.email || 'N/A'}
आधार नंबर: ${c.aadhaarNo}
पता: ${c.address} (पिनकोड: ${c.pincode})

[10वीं विवरण]
बोर्ड: ${c.highSchool?.board || 'N/A'}
रोल नंबर: ${c.highSchool?.rollNo || 'N/A'}
पास वर्ष: ${c.highSchool?.passingYear || 'N/A'}
प्राप्तांक: ${c.highSchool?.obtainedMarks || ''}/${c.highSchool?.totalMarks || ''} (${c.highSchool?.percentage || ''})

[12वीं विवरण]
बोर्ड: ${c.intermediate?.board || 'N/A'}
रोल नंबर: ${c.intermediate?.rollNo || 'N/A'}
स्ट्रीम: ${c.intermediate?.stream || 'N/A'}
पास वर्ष: ${c.intermediate?.passingYear || 'N/A'}
प्राप्तांक: ${c.intermediate?.obtainedMarks || ''}/${c.intermediate?.totalMarks || ''} (${c.intermediate?.percentage || ''})
==============================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCafe?.id) {
      alert('कृपया पहले अपने साइबर कैफ़े का चयन करें।');
      return;
    }
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cafeId: selectedCafe.id
        })
      });
      if (res.ok) {
        fetchCustomers();
        setIsModalOpen(false);
        // Reset form
        setFormData({
          fullName: '', fatherName: '', motherName: '', dob: '', gender: 'Male', category: 'OBC',
          phone: '', email: '', aadhaarNo: '', address: '', pincode: '',
          highSchool: { board: 'UP Board', rollNo: '', passingYear: '2022', totalMarks: '600', obtainedMarks: '', percentage: '' },
          intermediate: { board: 'UP Board', rollNo: '', stream: 'Science', passingYear: '2024', totalMarks: '500', obtainedMarks: '', percentage: '' },
          notes: ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप इस ग्राहक का बायोडाटा रिकॉर्ड हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.aadhaarNo?.includes(q) ||
      c.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              ग्राहक डेटा बैंक व फॉर्म ऑटोफिल (Customer Bio-Data Vault)
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {customers.length} ग्राहक सुरक्षित
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            पुराने ग्राहकों के 10वीं/12वीं अंक, रोल नंबर और पारिवारिक विवरण सेव रखें — फॉर्म भरते समय 1-क्लिक में पूरा डेटा कॉपी करें।
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया ग्राहक जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ग्राहक का नाम, मोबाइल नंबर या आधार नंबर से खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{c.fullName}</h3>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    पिता: <strong className="text-slate-800">{c.fatherName}</strong> • माता: <strong className="text-slate-800">{c.motherName}</strong>
                  </p>
                </div>

                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                  {c.id}
                </span>
              </div>

              {/* Personal Details Row */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 text-slate-600 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">DOB / जन्मतिथि:</span>
                  <span className="font-semibold text-slate-800">{c.dob}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">मोबाइल:</span>
                  <span className="font-semibold text-slate-800">{c.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">आधार नंबर:</span>
                  <span className="font-mono font-bold text-slate-800">{c.aadhaarNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ईमेल:</span>
                  <span className="truncate block font-medium">{c.email || 'N/A'}</span>
                </div>
              </div>

              {/* Academic Highlights */}
              <div className="py-2 space-y-1.5 text-xs">
                {c.highSchool?.rollNo && (
                  <div className="flex items-center justify-between bg-blue-50/60 px-2.5 py-1.5 rounded-lg text-[11px]">
                    <span className="font-bold text-blue-900">10वीं ({c.highSchool.board}):</span>
                    <span className="text-blue-800 font-mono">
                      Roll: {c.highSchool.rollNo} • {c.highSchool.obtainedMarks}/{c.highSchool.totalMarks} ({c.highSchool.percentage})
                    </span>
                  </div>
                )}

                {c.intermediate?.rollNo && (
                  <div className="flex items-center justify-between bg-emerald-50/60 px-2.5 py-1.5 rounded-lg text-[11px]">
                    <span className="font-bold text-emerald-900">12वीं ({c.intermediate.stream}):</span>
                    <span className="text-emerald-800 font-mono">
                      Roll: {c.intermediate.rollNo} • {c.intermediate.obtainedMarks}/{c.intermediate.totalMarks} ({c.intermediate.percentage})
                    </span>
                  </div>
                )}
              </div>

              {c.notes && (
                <p className="text-[11px] text-slate-500 italic mt-1">
                  नोट: {c.notes}
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyDetails(c)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  copiedId === c.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-blue-600 text-white'
                }`}
              >
                {copiedId === c.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>डेटा कॉपी हो गया! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>फॉर्म भरने हेतु पूरा डेटा कॉपी करें</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="हटाएं"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                नया ग्राहक प्रोफ़ाइल जोड़ें (New Customer Vault Entry)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="आवेदक का पूरा नाम"
                    value={formData.fullName}
                    onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">पिता का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="पिता का नाम दर्ज करें"
                    value={formData.fatherName}
                    onChange={(e) => setFormData(p => ({ ...p, fatherName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">माता का नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="माता का नाम दर्ज करें"
                    value={formData.motherName}
                    onChange={(e) => setFormData(p => ({ ...p, motherName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">जन्मतिथि (DOB) *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData(p => ({ ...p, dob: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">वर्ग / Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  >
                    <option value="General">General (सामान्य)</option>
                    <option value="General (EWS)">General (EWS)</option>
                    <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
                    <option value="SC">SC (अनुसूचित जाति)</option>
                    <option value="ST">ST (अनुसूचित जनजाति)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-अंकीय मोबाइल नंबर दर्ज करें"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">आधार नंबर *</label>
                  <input
                    type="text"
                    required
                    placeholder="12 अंकों का आधार"
                    value={formData.aadhaarNo}
                    onChange={(e) => setFormData(p => ({ ...p, aadhaarNo: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">स्थायी पता</label>
                  <input
                    type="text"
                    placeholder="ग्राम / मोहल्ला, पोस्ट, जिला, राज्य"
                    value={formData.address}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* 10th Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">10वीं (हाईस्कूल) विवरण:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="बोर्ड (UP / CBSE / अन्य)"
                    value={formData.highSchool.board}
                    onChange={(e) => setFormData(p => ({ ...p, highSchool: { ...p.highSchool, board: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="रोल नंबर"
                    value={formData.highSchool.rollNo}
                    onChange={(e) => setFormData(p => ({ ...p, highSchool: { ...p.highSchool, rollNo: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="पासिंग वर्ष"
                    value={formData.highSchool.passingYear}
                    onChange={(e) => setFormData(p => ({ ...p, highSchool: { ...p.highSchool, passingYear: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="अंक / प्रतिशत"
                    value={formData.highSchool.percentage}
                    onChange={(e) => setFormData(p => ({ ...p, highSchool: { ...p.highSchool, percentage: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* 12th Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">12वीं (इंटरमीडिएट) विवरण:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="बोर्ड"
                    value={formData.intermediate.board}
                    onChange={(e) => setFormData(p => ({ ...p, intermediate: { ...p.intermediate, board: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="रोल नंबर"
                    value={formData.intermediate.rollNo}
                    onChange={(e) => setFormData(p => ({ ...p, intermediate: { ...p.intermediate, rollNo: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="स्ट्रीम (Science/Arts/Com)"
                    value={formData.intermediate.stream}
                    onChange={(e) => setFormData(p => ({ ...p, intermediate: { ...p.intermediate, stream: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="अंक / प्रतिशत"
                    value={formData.intermediate.percentage}
                    onChange={(e) => setFormData(p => ({ ...p, intermediate: { ...p.intermediate, percentage: e.target.value } }))}
                    className="bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-500/20 text-xs"
              >
                डेटा बैंक में सेव करें
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
