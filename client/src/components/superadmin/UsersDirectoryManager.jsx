import React, { useState, useEffect } from 'react';
import { 
  Users, Search, RefreshCw, KeyRound, ShieldAlert, ShieldCheck, 
  Trash2, MessageSquare, IndianRupee, Edit3, CheckCircle2, 
  AlertCircle, Plus, Minus, Copy, Eye, EyeOff, Store, UserCheck
} from 'lucide-react';
import { authFetch } from '../../utils/api';

export default function UsersDirectoryManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'cafe', 'customer'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'blocked'
  
  // Modals state
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('credit'); // 'credit' | 'debit'
  const [balanceRemark, setBalanceRemark] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  const [copiedId, setCopiedId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/superadmin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Error fetching users directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopyPassword = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword.trim()) return;
    setSavingPassword(true);
    try {
      const res = await authFetch(`/api/superadmin/users/${passwordModalUser.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`✅ उपयोगकर्ता "${passwordModalUser.name}" का पासवर्ड सफलतापूर्वक अपडेट कर दिया गया!`);
        setTimeout(() => setSuccessToast(''), 4000);
        setPasswordModalUser(null);
        setNewPassword('');
        fetchUsers();
      } else {
        alert(data.error || 'पासवर्ड बदलने में त्रुटि।');
      }
    } catch (err) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    const amt = parseFloat(balanceAmount);
    if (!balanceModalUser || isNaN(amt) || amt <= 0) {
      alert('कृपया मान्य राशि दर्ज करें!');
      return;
    }
    setSavingBalance(true);
    try {
      const res = await authFetch(`/api/superadmin/users/${balanceModalUser.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          type: balanceType,
          remark: balanceRemark.trim() || `सुपर एडमिन द्वारा मैन्युअल ${balanceType === 'credit' ? 'क्रेडिट' : 'डेबिट'}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`✅ उपयोगकर्ता का बैलेंस अपडेट हुआ! नया बैलेंस: ₹${data.newBalance}`);
        setTimeout(() => setSuccessToast(''), 4000);
        setBalanceModalUser(null);
        setBalanceAmount('');
        setBalanceRemark('');
        fetchUsers();
      } else {
        alert(data.error || 'बैलेंस एडजस्ट करने में त्रुटि।');
      }
    } catch (err) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setSavingBalance(false);
    }
  };

  const handleToggleBlock = async (user) => {
    const actionText = user.isBlocked ? 'अनब्लॉक' : 'ब्लॉक';
    if (!window.confirm(`क्या आप सचमुच उपयोगकर्ता "${user.name}" (${user.phone}) को ${actionText} करना चाहते हैं?`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/superadmin/users/${user.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !user.isBlocked })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`✅ उपयोगकर्ता सफलतापूर्वक ${actionText} कर दिया गया!`);
        setTimeout(() => setSuccessToast(''), 4000);
        fetchUsers();
      } else {
        alert(data.error || 'स्थिति बदलने में त्रुटि।');
      }
    } catch (err) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ चेतावनी: क्या आप उपयोगकर्ता "${user.name}" (${user.phone}) को स्थायी रूप से हटाना (Delete) चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती!`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/superadmin/users/${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessToast(`✅ उपयोगकर्ता "${user.name}" को सफलतापूर्वक पोर्टल से हटा दिया गया!`);
        setTimeout(() => setSuccessToast(''), 4000);
        fetchUsers();
      } else {
        alert(data.error || 'डिलीट करने में त्रुटि।');
      }
    } catch (err) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleOpenWhatsApp = (user) => {
    const cleanPhone = String(user.phone).replace(/\D/g, '').slice(-10);
    const msg = encodeURIComponent(`नमस्ते ${user.name} जी, मैं स्मार्ट कैफ़े पोर्टल सुपर एडमिन बात कर रहा हूँ। आपका खाता हमारे पास पंजीकृत है। हम आपकी क्या सहायता कर सकते हैं?`);
    window.open(`https://wa.me/91${cleanPhone}?text=${msg}`, '_blank');
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !u.isBlocked) || 
      (statusFilter === 'blocked' && !!u.isBlocked);
    const matchesSearch = !search.trim() || 
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.shopName && u.shopName.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && String(u.phone).includes(search));
    return matchesRole && matchesStatus && matchesSearch;
  });

  const totalShopkeepers = users.filter(u => u.role === 'cafe').length;
  const totalCitizens = users.filter(u => u.role === 'customer').length;
  const totalBlocked = users.filter(u => u.isBlocked).length;
  const totalBalances = users.reduce((sum, u) => sum + (parseFloat(u.balance) || 0), 0);

  return (
    <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 px-3 py-1 rounded-full text-xs font-black text-indigo-800 dark:text-indigo-300 mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>सुपर एडमिन मास्टर उपयोगकर्ता व क्रेडेंशियल कंट्रोल रूम</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            उपयोगकर्ता व पासवर्ड रजिस्टर (Users & Credentials Directory)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            पोर्टल पर पंजीकृत सभी दुकानदारों और नागरिकों का मास्टर डेटाबेस। पासवर्ड साफ़ अक्षरों में देखें, 1-क्लिक में बदलें, बैलेंस जोड़ें/घटाएं, WhatsApp सहायता भेजें, या ब्लॉक/डिलीट करें।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50 dark:bg-[#0b1528] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">कुल रजिस्टर्ड यूजर्स</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{users.length}</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b1528] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">🏪 दुकानदार (VLEs)</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{totalShopkeepers}</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b1528] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">👤 आम नागरिक (B2C)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{totalCitizens}</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b1528] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">💰 कुल वॉलेट फंड्स</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">₹{totalBalances.toFixed(0)}</span>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center gap-3 text-xs font-black text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम, दुकान या मोबाइल नंबर खोजें..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:border-indigo-500 font-bold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                roleFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              सभी
            </button>
            <button
              onClick={() => setRoleFilter('cafe')}
              className={`px-3 py-1 rounded-lg transition ${
                roleFilter === 'cafe' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🏪 दुकानदार
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-3 py-1 rounded-lg transition ${
                roleFilter === 'customer' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              👤 नागरिक
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              स्थिति: सभी
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'active' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🟢 सक्रिय
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'blocked' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🔴 ब्लॉक
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-[#0b1528] text-slate-600 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 text-center w-10">#</th>
              <th className="py-3 px-3 min-w-[170px]">उपयोगकर्ता व दुकान</th>
              <th className="py-3 px-3 text-center min-w-[110px]">रोल / प्रकार</th>
              <th className="py-3 px-3 min-w-[120px]">मोबाइल (Login ID)</th>
              <th className="py-3 px-3 min-w-[150px]">
                लॉगिन पासवर्ड (Plaintext)
                <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-normal">Super Admin Direct View</span>
              </th>
              <th className="py-3 px-3 text-center min-w-[100px]">वॉलेट बैलेंस</th>
              <th className="py-3 px-3 text-center min-w-[90px]">स्थिति</th>
              <th className="py-3 px-3 text-center min-w-[200px]">त्वरित एक्शन</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  कोई उपयोगकर्ता नहीं मिला।
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => {
                const isBlocked = !!user.isBlocked;
                const isCafe = user.role === 'cafe';

                return (
                  <tr 
                    key={user.id || user.phone} 
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                      isBlocked ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Name & Shop */}
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                      </div>
                      {user.shopName && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-bold">
                          <Store className="w-3 h-3 text-indigo-500" />
                          <span>{user.shopName}</span>
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        isCafe 
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {isCafe ? '🏪 दुकानदार B2B' : '👤 नागरिक B2C'}
                      </span>
                    </td>

                    {/* Phone / Login ID */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {user.phone}
                    </td>

                    {/* Plaintext Password with Copy */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-black text-xs text-indigo-900 dark:text-amber-400">
                        <span>{user.password || '••••••'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyPassword(user.id, user.password)}
                          className="hover:text-emerald-600 transition cursor-pointer p-0.5"
                          title="पासवर्ड कॉपी करें"
                        >
                          {copiedId === user.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ₹{(parseFloat(user.balance) || 0).toFixed(0)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {isBlocked ? (
                        <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                          🔴 ब्लॉक
                        </span>
                      ) : (
                        <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          🟢 सक्रिय
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Edit Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModalUser(user);
                            setNewPassword(user.password || '');
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition cursor-pointer"
                          title="पासवर्ड बदलें"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Adjust Balance */}
                        <button
                          type="button"
                          onClick={() => {
                            setBalanceModalUser(user);
                            setBalanceAmount('');
                            setBalanceRemark('');
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
                          title="बैलेंस जोड़ें या घटाएं"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                        </button>

                        {/* 1-Click WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(user)}
                          className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 transition cursor-pointer"
                          title="WhatsApp चैट खोलें"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Block / Unblock */}
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(user)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isBlocked 
                              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200' 
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                          }`}
                          title={isBlocked ? 'अनब्लॉक करें' : 'ब्लॉक करें'}
                        >
                          {isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-500 dark:text-slate-400 transition cursor-pointer"
                          title="स्थायी रूप से हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Edit Password */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  पासवर्ड बदलें (Reset Password)
                </h3>
              </div>
              <button 
                onClick={() => setPasswordModalUser(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-black text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div>उपयोगकर्ता: <strong className="text-slate-900 dark:text-white">{passwordModalUser.name}</strong></div>
              <div>मोबाइल नंबर (Login ID): <strong className="font-mono text-slate-900 dark:text-white">{passwordModalUser.phone}</strong></div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  नया पासवर्ड दर्ज करें *
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="नया पासवर्ड..."
                  className="w-full p-2.5 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{savingPassword ? 'सेव हो रहा है...' : 'सुरक्षित करें'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adjust Balance */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  वॉलेट बैलेंस एडजस्ट करें
                </h3>
              </div>
              <button 
                onClick={() => setBalanceModalUser(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-black text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div>उपयोगकर्ता: <strong className="text-slate-900 dark:text-white">{balanceModalUser.name}</strong></div>
              <div>वर्तमान बैलेंस: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-black">₹{balanceModalUser.balance}</strong></div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceType('credit')}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    balanceType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>➕ बैलेंस जोड़ें (Credit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBalanceType('debit')}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    balanceType === 'debit'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>➖ बैलेंस काटें (Debit)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  राशि (₹) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="उदा. 500"
                  className="w-full p-2.5 text-xs font-mono font-black border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  टिप्पणी (Remark / Reason)
                </label>
                <input
                  type="text"
                  value={balanceRemark}
                  onChange={(e) => setBalanceRemark(e.target.value)}
                  placeholder="उदा. UPI टॉपअप सत्यापन / मैन्युअल एडजस्टमेंट"
                  className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={savingBalance}
                  className={`text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50 ${
                    balanceType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <span>{savingBalance ? 'एडजस्ट हो रहा है...' : (balanceType === 'credit' ? 'क्रेडिट करें' : 'डेबिट करें')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
