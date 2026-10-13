import React, { useState, useEffect } from 'react';
import { 
  Bell, Calendar, GraduationCap, ArrowRight, ExternalLink, 
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Trash2, Search, X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function JobBulletin({ onApplyJob, isOperator = false }) {
  const { language, t } = useLanguage();
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Create Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('सरकारी नौकरी');
  const [newLastDate, setNewLastDate] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newFee, setNewFee] = useState('');
  const [newBadge, setNewBadge] = useState('New');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBulletins = () => {
    setLoading(true);
    fetch('/api/bulletins')
      .then(res => res.json())
      .then(data => {
        setBulletins(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBulletins();
  }, []);

  const handleCreateBulletin = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert(language === 'hi' ? 'कृपया नोटिस का शीर्षक दर्ज करें।' : 'Please enter notice title.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          lastDate: newLastDate.trim() || (language === 'hi' ? 'जल्द ही' : 'Soon'),
          qualification: newQualification.trim(),
          fee: newFee.trim(),
          badge: newBadge,
          description: newDescription.trim()
        })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewLastDate('');
        setNewQualification('');
        setNewFee('');
        setNewDescription('');
        fetchBulletins();
      }
    } catch (err) {
      console.error(err);
      alert(language === 'hi' ? 'नोटिस जोड़ने में त्रुटि आई।' : 'Error adding notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBulletin = async (id, title) => {
    if (!window.confirm(language === 'hi' ? `क्या आप "${title}" नोटिस को हटाना चाहते हैं?` : `Do you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/bulletins/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBulletins();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['all', 'सरकारी नौकरी', 'छात्रवृत्ति', 'प्रवेश परीक्षा', 'सरकारी योजना'];

  const filtered = bulletins.filter(item => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term ||
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.qualification && item.qualification.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-yellow-300 mb-2">
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            {language === 'hi' ? 'दैनिक सरकारी सूचना पट' : 'Daily Government Bulletin'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? 'सरकारी नौकरियां एवं योजनाएं' : 'Government Jobs & Schemes'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {language === 'hi'
              ? 'नवीनतम फॉर्म, अंतिम तिथि, योग्यता एवं हमारे कैफे से 1-क्लिक आवेदन।'
              : 'Latest forms, deadlines, eligibility and 1-click cafe applications.'}
          </p>
        </div>

        {isOperator && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया नोटिस जोड़ें' : 'Add Notice'}</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? '🔍 फॉर्म नाम, योग्यता या पद खोजें...' : '🔍 Search form name, eligibility or post...'}
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all'
                ? (language === 'hi' ? 'सभी फॉर्म' : 'All Forms')
                : cat === 'सरकारी नौकरी'
                ? (language === 'hi' ? 'सरकारी नौकरी' : 'Govt Jobs')
                : cat === 'छात्रवृत्ति'
                ? (language === 'hi' ? 'छात्रवृत्ति' : 'Scholarships')
                : cat === 'प्रवेश परीक्षा'
                ? (language === 'hi' ? 'प्रवेश परीक्षा' : 'Admissions')
                : (language === 'hi' ? 'सरकारी योजना' : 'Govt Schemes')}
            </button>
          ))}
        </div>
      </div>

      {/* Bulletins List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">
            {language === 'hi' ? 'कोई नोटिस उपलब्ध नहीं है' : 'No notices available'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {search
              ? (language === 'hi' ? 'खोज के अनुसार कोई फॉर्म नहीं मिला।' : 'No forms found matching your search.')
              : (language === 'hi' ? 'जल्द ही नए सरकारी फॉर्म व योजनाएं यहाँ जोड़ी जाएंगी।' : 'New government forms and schemes will be posted here soon.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                    {item.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.badge === 'Trending' ? 'bg-amber-100 text-amber-800' :
                      item.badge === 'Last Few Days' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                      item.badge === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      ★ {item.badge}
                    </span>

                    {isOperator && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBulletin(item.id, item.title)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition"
                        title={language === 'hi' ? 'नोटिस हटाएं' : 'Delete notice'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-3 leading-snug">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{language === 'hi' ? 'अंतिम तिथि:' : 'Last Date:'} <strong className="text-slate-900">{item.lastDate}</strong></span>
                  </div>
                  {item.qualification && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{language === 'hi' ? 'योग्यता:' : 'Eligibility:'} <strong className="text-slate-900">{item.qualification}</strong></span>
                    </div>
                  )}
                  {item.fee && (
                    <div className="text-[11px] text-slate-500">
                      {language === 'hi' ? 'सरकारी फीस:' : 'Govt Fee:'} <span className="font-semibold text-slate-700">{item.fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onApplyJob(item)}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>{language === 'hi' ? 'कैफे से ऑनलाइन अप्लाई करें' : 'Apply Online via Cafe'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Add New Bulletin Modal for Operator */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'hi' ? 'नया भर्ती / योजना नोटिस जारी करें' : 'Issue New Recruitment / Scheme Notice'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBulletin} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'फॉर्म / भर्ती का नाम *' : 'Form / Recruitment Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === 'hi' ? 'फॉर्म / भर्ती का पूरा नाम दर्ज करें' : 'Enter full name of form/recruitment'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'श्रेणी' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="सरकारी नौकरी">{language === 'hi' ? 'सरकारी नौकरी' : 'Government Job'}</option>
                    <option value="छात्रवृत्ति">{language === 'hi' ? 'छात्रवृत्ति' : 'Scholarship'}</option>
                    <option value="प्रवेश परीक्षा">{language === 'hi' ? 'प्रवेश परीक्षा' : 'Entrance Exam'}</option>
                    <option value="सरकारी योजना">{language === 'hi' ? 'सरकारी योजना' : 'Govt Scheme'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'प्राथमिकता बैज' : 'Priority Badge'}
                  </label>
                  <select
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Trending">Trending</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Last Few Days">Last Few Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'अंतिम तिथि' : 'Last Date'}
                  </label>
                  <input
                    type="text"
                    value={newLastDate}
                    onChange={(e) => setNewLastDate(e.target.value)}
                    placeholder={language === 'hi' ? 'अंतिम तिथि दर्ज करें' : 'Enter last date'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'सरकारी फीस' : 'Govt Fee'}
                  </label>
                  <input
                    type="text"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder={language === 'hi' ? 'सरकारी फीस विवरण दर्ज करें' : 'Enter govt fee details'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'न्यूनतम योग्यता' : 'Minimum Qualification'}
                </label>
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder={language === 'hi' ? 'न्यूनतम योग्यता दर्ज करें' : 'Enter minimum qualification'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'संक्षिप्त विवरण' : 'Brief Description'}
                </label>
                <textarea
                  rows="2"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={language === 'hi' ? 'आयु सीमा, पदों की संख्या या आवश्यक प्रमाण पत्र...' : 'Age limit, number of posts or required certificates...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:border-blue-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
                >
                  {isSubmitting
                    ? (language === 'hi' ? 'जोड़ रहे हैं...' : 'Publishing...')
                    : (language === 'hi' ? 'सूचना जारी करें ✓' : 'Publish Notice ✓')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
