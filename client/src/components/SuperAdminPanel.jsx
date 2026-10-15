import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Building2, Users, IndianRupee, CheckCircle2, 
  Clock, Plus, Search, RefreshCw, Calendar, Smartphone, 
  MapPin, ExternalLink, AlertCircle, ArrowUpRight, Award, Sparkles,
  Lock, Unlock, Eye, EyeOff, Save, Check, X, FileText, QrCode,
  Megaphone, Trash2, Radio, Activity, HardDrive, Cpu, Server, KeyRound,
  Power, Car, CreditCard, Zap, Download, ArrowLeft, LogOut,
  AlertTriangle, Database
} from 'lucide-react';
import { authFetch, getServerBaseUrl } from '../utils/api';
import Services79RatesManager from './superadmin/Services79RatesManager';
import UsersDirectoryManager from './superadmin/UsersDirectoryManager';

export const MASTER_12_APIS = [
  { id: 'rc', serviceType: 'rcDownload', name: 'वाहन RC टू PDF / PVC', apiName: 'Parivahan MoRTH Gateway REST API v2.4', endpoint: '/api/rc/lookup/:regNo', defaultWholesale: 200, defaultRetail: 250, category: 'vehicle', latency: '180ms' },
  { id: 'pan', serviceType: 'panCard', name: 'इंस्टेंट पैन कार्ड CR-80 PVC', apiName: 'NSDL / UTI e-Governance Cloud API', endpoint: '/api/pan/lookup/:panNo', defaultWholesale: 15, defaultRetail: 30, category: 'pan', latency: '210ms' },
  { id: 'aadhaar', serviceType: 'aadhaarCard', name: 'एडवांस आधार CR-80 PVC', apiName: 'UIDAI e-KYC Smart PVC Rendering Engine', endpoint: '/api/aadhaar/lookup/:aadhaarNo', defaultWholesale: 15, defaultRetail: 30, category: 'aadhaar', latency: '240ms' },
  { id: 'voter', serviceType: 'voterCard', name: 'डिजिटल वोटर स्मार्ट कार्ड (EPIC)', apiName: 'ECI Electoral Search National Portal', endpoint: '/api/voter/lookup/:epicNo', defaultWholesale: 15, defaultRetail: 30, category: 'voter', latency: '190ms' },
  { id: 'ayushman', serviceType: 'ayushmanCard', name: 'आयुष्मान भारत PM-JAY गोल्डन कार्ड', apiName: 'NHA PM-JAY Cloud API v3.2', endpoint: '/api/ayushman/lookup/:pmjayId', defaultWholesale: 15, defaultRetail: 30, category: 'welfare', latency: '220ms' },
  { id: 'ration', serviceType: 'rationCard', name: 'राशन कार्ड पर्चा / NFSA स्लिप', apiName: 'PDS / NFSA State Food Civil Supplies Grid', endpoint: '/api/ration/lookup/:rationNo', defaultWholesale: 10, defaultRetail: 25, category: 'welfare', latency: '160ms' },
  { id: 'electricity', serviceType: 'electricityBill', name: 'बिजली बिल भुगतान रसीद', apiName: 'State Discom Energy Billing Engine', endpoint: '/api/electricity/lookup/:consumerNo', defaultWholesale: 10, defaultRetail: 20, category: 'utility', latency: '175ms' },
  { id: 'edistrict', serviceType: 'edistrictSlip', name: 'e-District आय/जाति/निवास सत्यापन', apiName: 'State Revenue Council e-District Gateway', endpoint: '/api/edistrict/lookup/:appNo', defaultWholesale: 15, defaultRetail: 30, category: 'edistrict', latency: '250ms' },
  { id: 'dl', serviceType: 'drivingLicence', name: 'ड्राइविंग लाइसेंस (DL) PVC', apiName: 'MoRTH Sarathi DL Verification Engine', endpoint: '/api/dl/lookup/:dlNo', defaultWholesale: 25, defaultRetail: 50, category: 'vehicle', latency: '210ms' },
  { id: 'challan', serviceType: 'challanSearch', name: 'वाहन ई-चालान जांच एवं रसीद', apiName: 'MoRTH e-Challan Official Verifier', endpoint: '/api/challan/lookup/:vehicleNo', defaultWholesale: 10, defaultRetail: 20, category: 'vehicle', latency: '195ms' },
  { id: 'epan', serviceType: 'ePan', name: 'ई-पैन कार्ड डिजिटल डाउनलोड', apiName: 'Income Tax Dept e-Filing Instant e-PAN API', endpoint: '/api/epan/lookup/:panNo', defaultWholesale: 10, defaultRetail: 25, category: 'pan', latency: '230ms' },
  { id: 'receipt', serviceType: 'receiptMaker', name: 'जन सेवा केंद्र बिल / टैक्स रसीद', apiName: 'Central Counter Invoicing & Ledger System', endpoint: '/api/receipt/lookup/:query', defaultWholesale: 5, defaultRetail: 15, category: 'utility', latency: '110ms' }
];
export const MASTER_14_APIS = MASTER_12_APIS;

export default function SuperAdminPanel({ theme = 'light', onToolStatusUpdated = () => {}, onBackToPortal = () => {}, onLogout = () => {} }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('cafes'); // 'cafes', 'api_hub', 'api_gateway', 'rates', 'b2b_utr', 'kyc', 'shadow_audit', 'broadcast', 'system_health'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'expired'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [togglingTool, setTogglingTool] = useState({});

  // Future Live API Gateway Configuration State (Requirement 7)
  const [apiGateway, setApiGateway] = useState({
    liveMode: false,
    provider: 'P4Points',
    apiKey: '',
    endpoint: 'https://authorized.p4points.co.in/api/v1/',
    secret: '',
    balance: null,
    timeoutMs: 8000,
    services: {
      balance: { live: true, endpoint: 'https://authorized.p4points.co.in/api/v1/Balance_info.php' },
      panVerify: { live: true, endpoint: 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php' },
      aadhaarToPan: { live: true, endpoint: 'https://authorized.p4points.co.in/api/v1/getPanNumber.php' },
      ekyc: { live: true, endpoint: 'https://authorized.p4points.co.in/api/v1/uid/ekycVerification.php' },
      rc: { live: false, endpoint: 'https://kyc-api.surepass.io/api/v1/rc/rc-full' },
      voter: { live: false, endpoint: 'https://kyc-api.surepass.io/api/v1/voter-id/voter-id' },
      dl: { live: false, endpoint: 'https://kyc-api.surepass.io/api/v1/driving-license/driving-license' },
      challan: { live: false, endpoint: 'https://kyc-api.surepass.io/api/v1/rc/echallan' },
      electricity: { live: false, endpoint: 'https://kyc-api.surepass.io/api/v1/utility/electricity' },
      edistrict: { live: false, endpoint: 'https://kyc-api.surepass.io/api/v1/revenue/edistrict' }
    }
  });
  const [savingGateway, setSavingGateway] = useState(false);
  const [testingGateway, setTestingGateway] = useState(false);
  const [gatewaySavedMsg, setGatewaySavedMsg] = useState(false);
  const [gatewayTestResult, setGatewayTestResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Gateway Health & Low-Balance Monitor (Option 2)
  const [gatewayHealth, setGatewayHealth] = useState(null);
  const [loadingGatewayHealth, setLoadingGatewayHealth] = useState(false);

  // MySQL Enterprise Database Architecture & Status (Option 1)
  const [dbStatus, setDbStatus] = useState(null);
  const [loadingDbStatus, setLoadingDbStatus] = useState(false);
  const [migratingDb, setMigratingDb] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [showDbSetupWizard, setShowDbSetupWizard] = useState(false);
  const [dbConfigForm, setDbConfigForm] = useState({ host: 'localhost', database: '', username: '', password: '', port: 3306 });
  const [savingDbConfig, setSavingDbConfig] = useState(false);
  const [dbConfigResult, setDbConfigResult] = useState(null);

  // 24x7 Telegram Alert Bot State
  const [telegramConfig, setTelegramConfig] = useState({ botToken: '', chatId: '', enabled: false });
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramResult, setTelegramResult] = useState(null);

  // Meta WhatsApp / Fast2SMS State
  const [whatsappConfig, setWhatsappConfig] = useState({ metaToken: '', phoneNumberId: '', fast2smsKey: '', whatsappEnabled: false, smsEnabled: false });
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState(null);
  
  // System Health state
  const [systemHealth, setSystemHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [downloadingMasterBackup, setDownloadingMasterBackup] = useState(false);
  const [runningShredder, setRunningShredder] = useState(false);

  // Complaint filters
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all'); // 'all', 'open', 'resolved'
  
  // Broadcast announcement state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info'); // 'info', 'warning', 'urgent'
  const [publishingBroadcast, setPublishingBroadcast] = useState(false);
  
  // Wholesale rates state
  const [superAdminRates, setSuperAdminRates] = useState({
    rcDownload: 200,
    panCard: 107,
    incomeCert: 50,
    casteCert: 50,
    niwasCert: 50,
    drivingLicence: 150,
    pvcCard: 40
  });
  const [savingRates, setSavingRates] = useState(false);
  const [ratesSavedMsg, setRatesSavedMsg] = useState(false);

  // New Cafe form state
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [addingCafe, setAddingCafe] = useState(false);

  // Audit note state
  const [auditNoteInputs, setAuditNoteInputs] = useState({});
  const [viewingSlipUrl, setViewingSlipUrl] = useState('');

  const handleToggleTool = async (apiItem, currentActive) => {
    const key = apiItem.id || apiItem.serviceType;
    setTogglingTool(prev => ({ ...prev, [key]: true }));
    try {
      const res = await authFetch('/api/superadmin/tools/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: apiItem.id,
          serviceType: apiItem.serviceType,
          enabled: !currentActive
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStats();
        if (onToolStatusUpdated) onToolStatusUpdated();
      } else {
        alert(data?.error || 'टूल स्थिति अद्यतन करने में त्रुटि आई।');
      }
    } catch (err) {
      alert('सर्वर से कनेक्ट नहीं हो सका।');
    } finally {
      setTogglingTool(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSendWarning = async (cafeId, complaintId) => {
    const msg = prompt('दुकानदार को भेजी जाने वाली आधिकारिक चेतावनी (Compliance Warning) दर्ज करें:');
    if (!msg || !msg.trim()) return;
    try {
      const res = await authFetch(`/api/superadmin/shadow-audit/cafes/${cafeId}/warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warningMessage: msg.trim(), complaintId })
      });
      if (res.ok) {
        alert('✅ आधिकारिक चेतावनी नोटिस सफलतापूर्वक दुकानदार के डैशबोर्ड पर प्रेषित कर दिया गया!');
        fetchStats();
      }
    } catch (err) {
      alert('चेतावनी भेजने में त्रुटि आई।');
    }
  };

  const handlePublishBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setPublishingBroadcast(true);
    try {
      const res = await authFetch('/api/superadmin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          type: broadcastType
        })
      });
      if (res.ok) {
        alert('✅ केंद्रीय प्रसारण संदेश सफलतापूर्वक सभी कैफे के लिए सक्रिय कर दिया गया!');
        setBroadcastMessage('');
        fetchStats();
      }
    } catch (err) {
      alert('प्रसारण भेजने में त्रुटि आई।');
    } finally {
      setPublishingBroadcast(false);
    }
  };

  const handleClearBroadcast = async () => {
    if (!confirm('क्या आप सक्रिय केंद्रीय प्रसारण संदेश को हटाना चाहते हैं?')) return;
    try {
      const res = await authFetch('/api/superadmin/broadcast', { method: 'DELETE' });
      if (res.ok) {
        alert('✅ प्रसारण संदेश हटा दिया गया!');
        fetchStats();
      }
    } catch (err) {
      alert('हटाने में त्रुटि आई।');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/superadmin/stats');
      const data = await res.json();
      setStats(data);
      if (data.superAdminRates) {
        setSuperAdminRates(data.superAdminRates);
      }
    } catch (err) {
      console.error('Error fetching superadmin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await authFetch('/api/superadmin/system-health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleDownloadMasterBackup = async () => {
    setDownloadingMasterBackup(true);
    try {
      const res = await authFetch('/api/system/backup');
      if (!res.ok) throw new Error('मास्टर बैकअप डाउनलोड करने में त्रुटि!');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberCafe_Master_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('मास्टर बैकअप डाउनलोड विफल: ' + (err.message || 'त्रुटि'));
    } finally {
      setDownloadingMasterBackup(false);
    }
  };

  const handleRunShredderNow = async () => {
    setRunningShredder(true);
    try {
      const res = await authFetch('/api/system/cleanup/run', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        const stats = data.stats;
        alert(`✅ प्राइवेसी फ़ाइल श्रेडर सफलतापूर्वक पूरा हुआ!\nहटाए गए एक्सपायर्ड/प्रिंटेड फाइल्स: ${stats?.lastRunFilesPurged || 0}\nखाली की गई जगह: ${((stats?.lastRunBytesReclaimed || 0)/1024).toFixed(1)} KB`);
        fetchSystemHealth();
      } else {
        alert(data.error || 'फ़ाइल श्रेडर चलाने में विफलता।');
      }
    } catch (err) {
      alert('सर्वर से कनेक्ट करने में त्रुटि।');
    } finally {
      setRunningShredder(false);
    }
  };

  const handleResetOperatorPin = async (cafe) => {
    const defaultNewPin = Math.floor(1000 + Math.random() * 9000).toString();
    const pin = prompt(`कैफे "${cafe.shopName}" के ऑपरेटर के लिए नया 4-अंकों का सुरक्षा पिन दर्ज करें:`, defaultNewPin);
    if (!pin) return;
    if (!/^\d{4}$/.test(pin.trim())) {
      alert('कृपया ठीक 4 अंकों का संख्यात्मक पिन दर्ज करें!');
      return;
    }
    try {
      const res = await authFetch(`/api/superadmin/cafes/${cafe.id}/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: pin.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}\nनया पिन: ${data.newPin}\nकृपया यह पिन कैफे संचालक (${cafe.ownerName} - ${cafe.phone}) को सूचित करें।`);
        fetchStats();
      } else {
        alert(data.error || 'पिन रीसेट करने में त्रुटि आई।');
      }
    } catch (err) {
      alert('सर्वर से कनेक्ट नहीं हो सका।');
    }
  };

  const fetchApiGateway = async () => {
    try {
      const res = await authFetch('/api/superadmin/api-gateway');
      if (res.ok) {
        const data = await res.json();
        if (data?.apiGateway) setApiGateway(data.apiGateway);
      }
    } catch (e) {
      console.warn('Error fetching API Gateway config:', e);
    }
  };

  const fetchGatewayHealth = async () => {
    setLoadingGatewayHealth(true);
    try {
      const res = await authFetch('/api/system/gateway-health?_t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data && data.success) {
        setGatewayHealth(data);
      }
    } catch (e) {
      console.warn('Error fetching gateway health:', e);
    } finally {
      setLoadingGatewayHealth(false);
    }
  };

  const fetchDbStatus = async () => {
    setLoadingDbStatus(true);
    try {
      const res = await authFetch('/api/system/db-status?_t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data && data.dbStatus) {
        setDbStatus(data.dbStatus);
      }
    } catch (e) {
      console.warn('Error fetching DB status:', e);
    } finally {
      setLoadingDbStatus(false);
    }
  };

  const handleMigrateDb = async () => {
    if (!window.confirm('क्या आप JSON स्टोर का संपूर्ण डेटा (Users, Wallets, Orders, Cafes) MySQL में माइग्रेट करना चाहते हैं?')) return;
    setMigratingDb(true);
    setMigrationResult(null);
    try {
      const res = await authFetch('/api/system/migrate-db?key=Aa@910010025123343', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'Aa@910010025123343' })
      });
      const data = await res.json();
      setMigrationResult(data);
      if (res.ok && data.success) {
        alert('✅ ' + data.message);
        fetchDbStatus();
      } else {
        alert('❌ ' + (data.error || 'माइग्रेशन विफल रहा।'));
      }
    } catch (e) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setMigratingDb(false);
    }
  };

  const handleSaveDbConfig = async (e) => {
    if (e) e.preventDefault();
    if (!dbConfigForm.database.trim() || !dbConfigForm.username.trim()) {
      alert('डेटाबेस का नाम (Database Name) और उपयोगकर्ता नाम (Username) दर्ज करें!');
      return;
    }
    setSavingDbConfig(true);
    setDbConfigResult(null);
    try {
      const res = await authFetch('/api/system/save-db-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dbConfigForm,
          masterKey: 'Aa@910010025123343'
        })
      });
      const data = await res.json();
      setDbConfigResult(data);
      if (res.ok && data.success) {
        alert('✅ ' + data.message);
        setShowDbSetupWizard(false);
        fetchDbStatus();
      } else {
        alert('❌ ' + (data.error || 'कॉन्फ़िगरेशन सहेजने में विफलता।'));
      }
    } catch (err) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setSavingDbConfig(false);
    }
  };

  const handleDownloadSqlDump = () => {
    window.open('/api/system/export-sql', '_blank');
  };

  const handleSaveTelegram = async (e) => {
    if (e) e.preventDefault();
    setSavingTelegram(true);
    setTelegramResult(null);
    try {
      const res = await authFetch('/api/superadmin/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ ' + data.message);
      } else {
        alert('❌ ' + (data.error || 'सेव करने में त्रुटि।'));
      }
    } catch (e) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      alert('कृपया पहले Bot Token और Chat ID दर्ज करें!');
      return;
    }
    setTestingTelegram(true);
    setTelegramResult(null);
    try {
      const res = await authFetch('/api/superadmin/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramConfig)
      });
      const data = await res.json();
      setTelegramResult(data);
      if (res.ok && data.success) {
        alert('✅ ' + data.message);
      } else {
        alert('❌ ' + (data.error || 'टेस्ट अलर्ट भेजने में विफलता।'));
      }
    } catch (e) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleSaveWhatsapp = async (e) => {
    if (e) e.preventDefault();
    setSavingWhatsapp(true);
    setWhatsappResult(null);
    try {
      const res = await authFetch('/api/superadmin/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsappConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ ' + data.message);
      } else {
        alert('❌ ' + (data.error || 'सेव करने में त्रुटि।'));
      }
    } catch (e) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleTestWhatsapp = async () => {
    const testPhone = prompt('टेस्ट व्हाट्सएप/एसएमएस भेजने हेतु 10-अंकीय मोबाइल नंबर दर्ज करें:', '8006518960');
    if (!testPhone || testPhone.trim().length !== 10) return;
    setTestingWhatsapp(true);
    setWhatsappResult(null);
    try {
      const res = await authFetch('/api/superadmin/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone.trim() })
      });
      const data = await res.json();
      setWhatsappResult(data);
      if (res.ok && data.success) {
        alert('✅ ' + data.message);
      } else {
        alert('❌ ' + (data.error || 'टेस्ट संदेश भेजने में विफलता।'));
      }
    } catch (e) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setTestingWhatsapp(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchApiGateway();
    fetchGatewayHealth();
    fetchDbStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'system_health') {
      fetchSystemHealth();
      fetchDbStatus();
    } else if (activeTab === 'api_gateway') {
      fetchApiGateway();
      fetchGatewayHealth();
    }
  }, [activeTab]);

  const handleSaveApiGateway = async (e) => {
    if (e) e.preventDefault();
    setSavingGateway(true);
    try {
      const res = await authFetch('/api/superadmin/api-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiGateway)
      });
      const data = await res.json();
      if (res.ok) {
        setGatewaySavedMsg(true);
        setTimeout(() => setGatewaySavedMsg(false), 3500);
      } else {
        alert(data.error || 'सेव करने में त्रुटि आई।');
      }
    } catch (e) {
      alert('सर्वर से संपर्क नहीं हो सका।');
    } finally {
      setSavingGateway(false);
    }
  };

  const handleTestApiGateway = async () => {
    setTestingGateway(true);
    setGatewayTestResult(null);
    try {
      const res = await authFetch('/api/superadmin/api-gateway/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: apiGateway.provider,
          apiKey: apiGateway.apiKey,
          endpoint: apiGateway.endpoint
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.balance !== undefined) {
          setApiGateway(prev => ({ ...prev, balance: data.balance }));
        }
        setGatewayTestResult({ success: true, message: data.message, ping: data.ping, balance: data.balance });
      } else {
        setGatewayTestResult({ success: false, message: data.message || data.error || 'कनेक्शन टेस्ट विफल।' });
      }
    } catch (e) {
      setGatewayTestResult({ success: false, message: 'सर्वर से संपर्क करने में असमर्थ।' });
    } finally {
      setTestingGateway(false);
    }
  };

  // Pillar 4: Save Wholesale Rate Card
  const handleSaveRates = async (e) => {
    e.preventDefault();
    setSavingRates(true);
    try {
      const res = await authFetch('/api/superadmin/rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(superAdminRates)
      });
      if (res.ok) {
        setRatesSavedMsg(true);
        setTimeout(() => setRatesSavedMsg(false), 3000);
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      alert('रेट कार्ड सेव करने में त्रुटि आई।');
    } finally {
      setSavingRates(false);
    }
  };

  // Pillar 2: Approve / Reject Sanchalak B2B UTR
  const handleB2bUtrAction = async (utrId, action) => {
    try {
      const res = await authFetch(`/api/superadmin/b2b-utr-requests/${utrId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(action === 'approve' ? '✅ B2B UTR स्वीकृत! संचालक B2B वॉलेट में बैलेंस जुड़ गया।' : 'B2B UTR अस्वीकृत कर दिया गया।');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pillar 7: Approve / Reject VLE KYC Application
  const handleKycAction = async (kycId, action) => {
    try {
      const res = await authFetch(`/api/superadmin/kyc-applications/${kycId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(action === 'approve' ? '🎉 VLE KYC स्वीकृत! 365 दिन का डिजिटल लाइसेंस एक्टिव हुआ व कैफे डायरेक्टरी में शामिल हुआ।' : 'KYC अस्वीकृत कर दिया गया।');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pillar 6: Freeze / Unfreeze Cafe License (Secret Shadow Audit)
  const handleToggleFreezeCafe = async (cafeId, currentFrozen) => {
    let reason = '';
    if (!currentFrozen) {
      reason = prompt('कृपया कैफे लाइसेंस निलंबित (Freeze) करने का कारण दर्ज करें:', 'ऑडिट निगरानी में अधिक चार्जिंग व गंभीर ग्राहक शिकायतें पाई गईं।');
      if (!reason) return;
    } else {
      if (!window.confirm('क्या आप इस कैफे का लाइसेंस बहाल (Unfreeze) करना चाहते हैं?')) return;
    }

    try {
      const res = await authFetch(`/api/superadmin/shadow-audit/cafes/${cafeId}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeze: !currentFrozen, reason })
      });
      if (res.ok) {
        alert(!currentFrozen ? '⛔ कैफे लाइसेंस निलंबित (Frozen) कर दिया गया! कैफे की सेवाएं बंद हो गईं।' : '✅ कैफे लाइसेंस बहाल कर दिया गया!');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save secret audit note
  const handleSaveAuditNote = async (complaintId) => {
    const note = auditNoteInputs[complaintId];
    if (!note) return;
    try {
      const res = await authFetch(`/api/superadmin/shadow-audit/complaints/${complaintId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        alert('गुप्त ऑडिट नोट सुरक्षित हो गया!');
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenewSubscription = async (cafeId) => {
    if (!window.confirm(`क्या आप इस कैफे के लिए ₹299 वार्षिक प्लान (365 दिन) रिन्यू करना चाहते हैं?`)) return;
    try {
      const res = await authFetch(`/api/cafes/${cafeId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 365, amount: 299, plan: '₹299 वार्षिक प्रो प्लान' })
      });
      if (res.ok) {
        alert('✅ कैफे का ₹299 वार्षिक सब्सक्रिप्शन 365 दिनों के लिए सफलतापूर्वक सक्रिय हो गया!');
        fetchStats();
      }
    } catch (err) {
      console.error('Renew error:', err);
    }
  };

  const handleDeleteCafe = async (cafe) => {
    const cName = cafe.shopName || cafe.id;
    if (!window.confirm(`⚠️ क्या आप वाकई "${cName}" (${cafe.phone || cafe.id}) को हमेशा के लिए डिलीट करना चाहते हैं?\n\nयह क्रिया वापस नहीं ली जा सकती!`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/superadmin/cafes/${cafe.id}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`✅ कैफे "${cName}" सफलतापूर्वक डिलीट कर दिया गया है।`);
        fetchStats();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`❌ एरर: ${err.error || 'कैफे डिलीट नहीं हो सका।'}`);
      }
    } catch (err) {
      console.error('Delete cafe error:', err);
      alert('सर्वर से संपर्क नहीं हो सका।');
    }
  };

  const handleCreateCafe = async (e) => {
    e.preventDefault();
    if (!newShopName || !newOwnerName || !newPhone) {
      alert('कृपया दुकान का नाम, संचालक का नाम और फोन नंबर दर्ज करें।');
      return;
    }
    setAddingCafe(true);
    try {
      const res = await authFetch('/api/cafes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: newShopName,
          ownerName: newOwnerName,
          phone: newPhone,
          city: newCity || '',
          district: newDistrict || newCity || '',
          pincode: newPincode || '',
          upiId: newUpiId || `${newPhone}@upi`
        })
      });
      if (res.ok) {
        alert('🎉 नया साइबर कैफे सफलतापूर्वक पंजीकृत हो गया!');
        setIsAddModalOpen(false);
        setNewShopName('');
        setNewOwnerName('');
        setNewPhone('');
        fetchStats();
      }
    } catch (err) {
      console.error('Create cafe error:', err);
    } finally {
      setAddingCafe(false);
    }
  };

  const cafes = stats?.cafes || [];
  const b2bUtrList = stats?.utrRequests?.filter(u => u.tier === 'sanchalak_to_superadmin') || [];
  const pendingB2bCount = b2bUtrList.filter(u => u.status === 'pending').length;
  const kycList = stats?.kycApplications || [];
  const pendingKycCount = kycList.filter(k => k.status === 'pending_approval').length;
  const complaintsList = stats?.complaints || [];

  const filteredComplaints = complaintsList.filter(cmp => {
    const term = complaintSearch.toLowerCase().trim();
    const matchesSearch = !term ||
      (cmp.id && cmp.id.toLowerCase().includes(term)) ||
      (cmp.customerName && cmp.customerName.toLowerCase().includes(term)) ||
      (cmp.customerPhone && cmp.customerPhone.includes(term)) ||
      (cmp.subject && cmp.subject.toLowerCase().includes(term)) ||
      (cmp.description && cmp.description.toLowerCase().includes(term)) ||
      (cmp.cafeShopName && cmp.cafeShopName.toLowerCase().includes(term));
    const matchesStatus = complaintStatusFilter === 'all' || cmp.status === complaintStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCafes = cafes.filter(c => {
    const matchesSearch = 
      c.shopName.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && c.subscription?.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400/20 p-1 shadow-lg shrink-0 border border-amber-400/40 overflow-hidden hidden sm:block">
              <img 
                src="/images/smartcafe_navbar_icon.svg" 
                alt="Smart Cafe Official" 
                className="w-full h-full object-contain rounded-[12px]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/smartcafe_navbar_icon.svg';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                सुपर एडमिन SaaS केंद्रीय कंट्रोल रूम
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                स्मार्ट कैफे नेटवर्क — ₹299 SaaS, गुप्त ऑडिट व थोक रेट इंजन
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                पूरे राज्य/देश के साइबर कैफे, जन सेवा केंद्र और सीएससी का केंद्रीय डैशबोर्ड। थोक रेट तय करें, B2B UTR अप्रूव करें, KYC जारी करें और गुप्त निगरानी से गुणवत्ता बनाए रखें।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition border border-slate-700/80 shadow-md cursor-pointer active:scale-95"
                title="मुख्य नागरिक व ऑपरेटर पोर्टल पर वापस जाएं"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400" />
                <span>← मुख्य पोर्टल पर वापस जाएं</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95"
                title="सुपर एडमिन कंट्रोल रूम से लॉगआउट करें"
              >
                <LogOut className="w-4 h-4" />
                <span>🚪 सुपर एडमिन लॉगआउट</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>नया कैफे जोड़ें (Add Cafe)</span>
            </button>

            <button
              onClick={fetchStats}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-2.5 rounded-2xl transition"
              title="रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Platform Financial Ledger & KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">कुल कैफे नेटवर्क</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-white">
              {stats?.totalCafes || 0} <span className="text-xs font-normal text-slate-300">दुकानें</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">सक्रिय ₹299 लाइसेंस</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-emerald-300">
              {stats?.activeCafes || 0} <span className="text-xs font-normal text-emerald-200">सक्रिय</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">₹299 सब्सक्रिप्शन</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-amber-300">
              ₹{stats?.totalRevenue || 0}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">थोक सेवा राजस्व</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-indigo-300">
              ₹{stats?.wholesaleServiceRevenue || 0}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">कुल शुद्ध कमाई</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-emerald-400">
              ₹{stats?.totalPlatformEarnings || stats?.totalRevenue || 0}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">लंबित KYC / UTR</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black mt-2 text-rose-300">
              {pendingKycCount + pendingB2bCount} <span className="text-xs font-normal text-slate-300">कार्य शेष</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time P4Points Health & Low-Balance Alert Engine (Option 2) */}
      <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        gatewayHealth?.isLowBalance
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-md'
          : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              gatewayHealth?.isLowBalance
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-600 text-white'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  अपस्ट्रीम प्रोवाइडर स्थिति (Upstream P4Points Gateway)
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  gatewayHealth?.status === 'HEALTHY'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : gatewayHealth?.status === 'LOW_BALANCE'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 animate-bounce'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 animate-pulse'
                }`}>
                  {gatewayHealth?.status === 'HEALTHY' 
                    ? '🟢 लाइव व सक्रिय (Healthy)' 
                    : gatewayHealth?.status === 'LOW_BALANCE' 
                    ? '🟡 कम बैलेंस (Low Balance)' 
                    : '🔴 क्रिटिकल / डाउन'}
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-3 mt-0.5">
                <span>उपलब्ध API बैलेंस: <strong className="text-emerald-600 dark:text-emerald-400 font-black">₹{gatewayHealth?.balance ?? '...'}</strong></span>
                <span className="text-xs font-semibold text-slate-500">लेटेंसी: {gatewayHealth?.latencyMs ? `${gatewayHealth.latencyMs}ms` : 'जांच जारी...'}</span>
                {dbStatus && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Database className="w-3 h-3 text-indigo-500" />
                    डेटाबेस: {dbStatus.isMysqlConnected ? '🟢 MySQL Enterprise' : (dbStatus.isSqlConnected ? `🟢 रिलेशनल SQL (${(dbStatus.engine || 'sqlite').toUpperCase()})` : '🟡 JSON फ़ाइल (Active)')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchGatewayHealth}
              disabled={loadingGatewayHealth}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingGatewayHealth ? 'animate-spin' : ''}`} />
              <span>{loadingGatewayHealth ? 'जांच जारी...' : '🔄 बैलेंस रिफ्रेश'}</span>
            </button>
            <a
              href="https://authorized.p4points.co.in/"
              target="_blank"
              rel="noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <span>💳 P4Points पोर्टल ➔</span>
            </a>
          </div>
        </div>

        {gatewayHealth?.alertMessage && (
          <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-800/80 text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" />
            <span>{gatewayHealth.alertMessage}</span>
          </div>
        )}
      </div>

      {/* Super Admin Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-2 text-xs font-black">
        <button
          onClick={() => setActiveTab('services_79')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'services_79' 
              ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>79 सर्विस रेट कार्ड व मार्जिन</span>
          <span className="bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
            79
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'users' 
              ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-300" />
          <span>उपयोगकर्ता व पासवर्ड रजिस्टर</span>
        </button>

        <button
          onClick={() => setActiveTab('cafes')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'cafes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>कैफे डायरेक्टरी ({cafes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api_gateway')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'api_gateway' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>API गेटवे सेटिंग्स (Live Gateway)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            apiGateway?.liveMode ? 'bg-emerald-400 text-slate-950 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {apiGateway?.liveMode ? '🟢 LIVE ON' : 'रेडी'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'rates' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>थोक रेट कार्ड (Wholesale Engine)</span>
        </button>

        <button
          onClick={() => setActiveTab('b2b_utr')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'b2b_utr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>B2B UTR अप्रूवल</span>
          {pendingB2bCount > 0 && (
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingB2bCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'kyc' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>VLE KYC आवेदन</span>
          {pendingKycCount > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {pendingKycCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('shadow_audit')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'shadow_audit' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-yellow-300" />
          <span>गुप्त निगरानी व ऑडिट (Shadow Surveillance)</span>
          {complaintsList.length > 0 && (
            <span className="bg-rose-900 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {complaintsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'broadcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4 text-yellow-300" />
          <span>केंद्रीय प्रसारण (Broadcast)</span>
          {stats?.broadcastNotice?.active && (
            <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
              लाइव
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('system_health')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'system_health' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>सर्वर स्थिति व स्टोरेज (System Health)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
        </button>
      </div>

      {/* TAB: 79 SERVICES DYNAMIC RATE & MULTI-TIER MARGIN ENGINE */}
      {(activeTab === 'rates' || activeTab === 'services_79') && (
        <Services79RatesManager onRatesUpdated={fetchStats} />
      )}

      {/* TAB: USERS & PASSWORDS DIRECTORY CONTROL ROOM */}
      {activeTab === 'users' && (
        <UsersDirectoryManager />
      )}

      {/* TAB: API GATEWAY SETTINGS (READY FOR FUTURE LIVE APIS - REQUIREMENT 7) */}
      {activeTab === 'api_gateway' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-[#062024] to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
            {/* Indian Flag Tricolor Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
              <div className="flex-1 bg-gradient-to-r from-[#f97316] to-[#ff9933]"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-gradient-to-r from-[#16a34a] to-[#138808]"></div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  लाइव सरकारी API गेटवे एकीकरण (Live Government API Integration)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                  <Cpu className="w-7 h-7 text-emerald-400" />
                  <span>सुपर एडमिन API गेटवे सेटिंग्स (Live API Gateway)</span>
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
                  जब आपके पास आधिकारिक API प्रोवाइडर (Surepass, RapidAPI अथवा Custom API Endpoint) की कुंजियाँ उपलब्ध हो जाएं, तब आप केवल API Key दर्ज करके यहाँ से Live API Mode को <strong>ON</strong> कर सकते हैं। सिस्टम स्वतः असली सरकारी सर्वर से डेटा फेच करने लगेगा।
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={fetchApiGateway}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition border border-slate-700 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ताज़ा करें (Sync)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Live Switch & Mode Indicator */}
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                  मास्टर गेटवे स्विच (Master Production Toggle)
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>लाइव सरकारी API मोड (Live API Gateway Mode)</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    apiGateway.liveMode 
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300' 
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300'
                  }`}>
                    {apiGateway.liveMode ? '🟢 लाइव मोड चालू (LIVE MODE ACTIVE)' : '🔴 मॉक/सैंडबॉक्स मोड सक्रिय (INSTANT MOCK ACTIVE)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                  {apiGateway.liveMode 
                    ? 'लाइव मोड चालू है। सेवा अनुरोध सीधे आपके लाइव API गेटवे क्रेडेंशियल्स के साथ प्रोसेस होंगे।' 
                    : 'वर्तमान में सुरक्षित मॉक जनरेशन सक्रिय है। बिना API कुंजी के भी सभी कार्ड और स्लिप्स 0.5 सेकंड में 100% फुल-कलर ISO HD फॉर्मेट में तैयार होते हैं।'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setApiGateway(prev => ({ ...prev, liveMode: !prev.liveMode }))}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                    apiGateway.liveMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={apiGateway.liveMode}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      apiGateway.liveMode ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                1. API प्रदाता चुनें (Select API Provider)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'P4Points', name: 'P4Points B2B Gateway', desc: 'authorized.p4points.co.in (Aadhaar to PAN, PAN Verify, eKYC, Balance Info API)', defaultEndpoint: 'https://authorized.p4points.co.in/api/v1/' },
                  { id: 'Surepass', name: 'Surepass Technologies', desc: 'NSDL, Parivahan, UIDAI, ECI भारत सरकार अनुशंसित', defaultEndpoint: 'https://kyc-api.surepass.io/api/v1/' },
                  { id: 'RapidAPI', name: 'RapidAPI Enterprise', desc: 'ग्लोबल डेवलपर्स गेटवे (Vehicle RC, PAN, Voter)', defaultEndpoint: 'https://india-gov-api.p.rapidapi.com/v1/' },
                  { id: 'Custom', name: 'कस्टम API एंडपॉइंट (Custom REST)', desc: 'आपका अपना निजी API सर्वर या थर्ड-पार्टी वेंडर', defaultEndpoint: 'https://api.yourdomain.com/v1/' }
                ].map((prov) => {
                  const isSelected = apiGateway.provider === prov.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => setApiGateway(prev => ({ 
                        ...prev, 
                        provider: prov.id,
                        endpoint: prov.defaultEndpoint
                      }))}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{prov.name}</span>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {prov.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSaveApiGateway} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* API Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>लाइव API Key / Bearer Token <span className="text-red-500">*</span></span>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(prev => !prev)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showApiKey ? 'छिपाएं' : 'दिखाएं'}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiGateway.apiKey}
                      onChange={(e) => setApiGateway(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="API Key दर्ज करें"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    सुरक्षित एन्क्रिप्टेड स्टोरेज में सहेजा जाएगा।
                  </span>
                </div>

                {/* API Endpoint Base URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    API बेस URL (Base Endpoint URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={apiGateway.endpoint}
                    onChange={(e) => setApiGateway(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://kyc-api.surepass.io/api/v1/"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:border-emerald-500 focus:outline-none transition"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    रूट REST API एंडपॉइंट जहाँ कॉल्स भेजी जाएंगी।
                  </span>
                </div>

                {/* Client Secret / Webhook */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    क्लाइंट सीक्रेट / वेबहुक की (Client Secret / Signature)
                  </label>
                  <input
                    type="text"
                    value={apiGateway.secret || ''}
                    onChange={(e) => setApiGateway(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="वैकल्पिक (Optional Secret Key)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Timeout */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    अनुरोध टाइमआउट (Request Timeout)
                  </label>
                  <select
                    value={apiGateway.timeoutMs || 5000}
                    onChange={(e) => setApiGateway(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:border-emerald-500 focus:outline-none transition cursor-pointer"
                  >
                    <option value={3000}>3 सेकंड (अल्ट्रा फ़ास्ट)</option>
                    <option value={5000}>5 सेकंड (मानक अनुशंसित)</option>
                    <option value={8000}>8 सेकंड (धीमे नेटवर्क हेतु)</option>
                    <option value={12000}>12 सेकंड (लंबी सरकारी क्वेरी)</option>
                  </select>
                </div>

              </div>

              {/* Service-Level Live Toggles */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  2. व्यक्तिगत सेवा लाइव स्विच (Per-Service Live Toggles)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'rc', label: '🚗 वाहन RC Parivahan' },
                    { key: 'pan', label: '💳 पैन कार्ड NSDL/UTI' },
                    { key: 'aadhaar', label: '🪪 आधार कार्ड UIDAI' },
                    { key: 'voter', label: '🗳️ वोटर कार्ड ECI' },
                    { key: 'dl', label: '🚗 ड्राइविंग लाइसेंस Sarathi' },
                    { key: 'challan', label: '🚨 वाहन ई-चालान' },
                    { key: 'electricity', label: '⚡ बिजली बिल रसीद' },
                    { key: 'edistrict', label: '📜 e-District सत्यापन' }
                  ].map(srv => {
                    const isSrvLive = apiGateway.services?.[srv.key]?.live;
                    return (
                      <div
                        key={srv.key}
                        onClick={() => setApiGateway(prev => ({
                          ...prev,
                          services: {
                            ...(prev.services || {}),
                            [srv.key]: {
                              ...(prev.services?.[srv.key] || {}),
                              live: !isSrvLive
                            }
                          }
                        }))}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSrvLive 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200' 
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{srv.label}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          isSrvLive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {isSrvLive ? 'LIVE' : 'MOCK'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={savingGateway}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  {savingGateway ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>सुरक्षित हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>💾 API गेटवे सेटिंग्स सेव करें</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={testingGateway}
                  onClick={handleTestApiGateway}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  {testingGateway ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>टेस्ट हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>📡 कनेक्शन टेस्ट (Ping Gateway)</span>
                    </>
                  )}
                </button>

                {gatewaySavedMsg && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>गेटवे सेटिंग्स सफलतापूर्वक सहेजी गईं!</span>
                  </span>
                )}
              </div>

              {/* Test Result Banner */}
              {gatewayTestResult && (
                <div className={`mt-4 p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
                  gatewayTestResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200'
                }`}>
                  <span className="text-lg">{gatewayTestResult.success ? '✅' : '❌'}</span>
                  <div>
                    <div className="font-black text-sm">{gatewayTestResult.message}</div>
                    {gatewayTestResult.ping && (
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                        प्रोवाइडर: {gatewayTestResult.ping.provider} • लेटेंसी: {gatewayTestResult.ping.latency} • समय: {new Date(gatewayTestResult.ping.testedAt).toLocaleTimeString('hi-IN')}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Option 6: Meta WhatsApp Cloud API / SMS Gateway Card */}
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>स्वचालित व्हाट्सएप व SMS गेटवे (Meta Cloud API & Fast2SMS)</span>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    ऑटो-डिस्पैचर
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  कार्ड जनरेशन, प्रिंट पूर्ण होने एवं UTR अप्रूवल पर ग्राहक के मोबाइल पर ऑटोमैटिक रसीद व डाउनलोड लिंक भेजना।
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWhatsapp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Meta Cloud API Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="EAAGm0PX4ZC0BA..."
                    value={whatsappConfig.metaToken}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, metaToken: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    WhatsApp Phone Number ID
                  </label>
                  <input
                    type="text"
                    placeholder="104598712345678"
                    value={whatsappConfig.phoneNumberId}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Fast2SMS API Key (SMS बैकअप)
                  </label>
                  <input
                    type="password"
                    placeholder="W7kPqX4LmR..."
                    value={whatsappConfig.fast2smsKey}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, fast2smsKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={whatsappConfig.whatsappEnabled}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, whatsappEnabled: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>व्हाट्सएप ऑटो-मैसेज चालू रखें</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={whatsappConfig.smsEnabled}
                      onChange={(e) => setWhatsappConfig(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>SMS अलर्ट चालू रखें</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestWhatsapp}
                    disabled={testingWhatsapp}
                    className="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>{testingWhatsapp ? 'भेज रहे हैं...' : '💬 टेस्ट नोटिफिकेशन भेजें'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={savingWhatsapp}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingWhatsapp ? 'सहेज रहे हैं...' : '💾 सेटिंग्स सहेजें'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: CAFES DIRECTORY */}
      {activeTab === 'cafes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f1d36] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="कैफे नाम, कोड या शहर खोजें..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 rounded-xl focus:outline-hidden focus:border-orange-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-bold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'all' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                सभी ({cafes.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterStatus === 'active' ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                सक्रिय ({cafes.filter(c => c.subscription?.status === 'active' && !c.isFrozen).length})
              </button>
            </div>
          </div>

          {filteredCafes.length === 0 ? (
            <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 my-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                वर्तमान में कोई कैफे पंजीकृत नहीं है।
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                नए साइबर कैफ़े संचालक ₹299 वार्षिक VLE KYC प्लान के तहत पंजीकरण करके इस नेटवर्क से जुड़ सकते हैं।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCafes.map((cafe) => {
                const daysLeft = Math.ceil(
                  (new Date(cafe.subscription?.validTill).getTime() - Date.now()) / (1000 * 3600 * 24)
                );
                const isExpired = daysLeft <= 0;
                const isFrozen = !!cafe.isFrozen;
                const b2bBal = cafe.b2bWallet?.balance || 0;

                return (
                  <div 
                    key={cafe.id} 
                    className={`bg-white dark:bg-[#0f1d36] rounded-3xl p-5 border transition flex flex-col justify-between ${
                      isFrozen 
                        ? 'border-2 border-red-500 bg-red-50/20 dark:bg-red-950/20' 
                        : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 flex items-center justify-center font-black text-sm">
                            {cafe.code}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                              {cafe.shopName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{cafe.ownerName}</span>
                              <span>•</span>
                              <span>+91 {cafe.phone}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isFrozen && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white">
                              लाइसेंस निलंबित (FROZEN)
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            isExpired
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {isExpired ? 'समाप्त' : 'सक्रिय (Active)'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 bg-slate-50 dark:bg-[#0b1528] rounded-2xl p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-slate-500 dark:text-slate-400">स्थान व शहर:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{cafe.city} (पिन: {cafe.pincode})</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-slate-500 dark:text-slate-400">संचालक B2B बैलेंस:</span>
                          <span className={`font-black ${b2bBal < 200 ? 'text-red-600 font-mono' : 'text-emerald-700 dark:text-emerald-400 font-mono'}`}>
                            ₹{b2bBal} {b2bBal < 200 && '⚠️ (कोटा कम)'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-slate-500 dark:text-slate-400">लाइसेंस कुंजी:</span>
                          <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-[11px]">{cafe.licenseKey}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="text-slate-500 dark:text-slate-400">वैधता शेष:</span>
                          <span className={`font-bold ${daysLeft < 30 ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                            {daysLeft > 0 ? `${daysLeft} दिन शेष` : 'अवधि समाप्त'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleRenewSubscription(cafe.id)}
                        className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-emerald-200 dark:border-emerald-800/60"
                        title="₹299 वार्षिक लाइसेंस रिन्यू करें"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>₹299 रिन्यू (+365 दिन)</span>
                      </button>

                      <button
                        onClick={() => handleResetOperatorPin(cafe)}
                        className="bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="ऑपरेटर का 4-अंकों का लॉगिन पिन रीसेट करें"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>पिन रीसेट (PIN)</span>
                      </button>

                      <button
                        onClick={() => handleToggleFreezeCafe(cafe.id, isFrozen)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isFrozen 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isFrozen ? 'लाइसेंस बहाल करें' : 'लाइसेंस फ्रीज करें'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCafe(cafe)}
                        className="bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                        title="कैफे को हमेशा के लिए डिलीट करें"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span>हटाएं (Delete)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: B2B UTR APPROVAL QUEUE (स्तंभ 2) */}
      {activeTab === 'b2b_utr' && (
        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-500" />
                <span>संचालक B2B वॉलेट UTR सत्यापन कतार (Super Admin UTR Approvals)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                कैफे संचालकों द्वारा सुपर एडमिन QR (superadmin@upi) पर भेजे गए 12-अंकीय UTR की पुष्टि करें और B2B बैलेंस क्रेडिट करें।
              </p>
            </div>

            <button onClick={fetchStats} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {b2bUtrList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              कोई B2B UTR अनुरोध नहीं है।
            </div>
          ) : (
            <div className="space-y-3">
              {b2bUtrList.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
                    req.status === 'pending' 
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60' 
                      : 'bg-slate-50 dark:bg-[#0b1528] border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{req.cafeShopName}</span>
                      <span className="font-mono text-slate-400 dark:text-slate-500">({req.phone})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-400">जमा 12-अंकीय UTR:</span>
                      <span className="font-mono font-black text-xs text-indigo-900 dark:text-amber-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-slate-700 tracking-wider">
                        {req.utr}
                      </span>
                      {req.screenshotUrl && (
                        <button
                          type="button"
                          onClick={() => setViewingSlipUrl(req.screenshotUrl)}
                          className="bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>📸 रसीद पर्ची देखें</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      समय: {new Date(req.createdAt).toLocaleString('hi-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">B2B रिचार्ज राशि</span>
                      <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">₹{req.amount}</span>
                    </div>

                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleB2bUtrAction(req.id, 'approve')}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>स्वीकारें (Approve)</span>
                        </button>

                        <button
                          onClick={() => handleB2bUtrAction(req.id, 'reject')}
                          className="bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-800 dark:text-red-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>अस्वीकार</span>
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        req.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                      }`}>
                        {req.status === 'approved' ? 'स्वीकृत (B2B Credited)' : 'अस्वीकृत'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VLE KYC APPLICATIONS QUEUE (स्तंभ 7) */}
      {activeTab === 'kyc' && (
        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span>VLE KYC एवं ₹299 वार्षिक ऑनबोर्डिंग सत्यापन</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                नये कैफे संचालकों के CSC ID, आधार, पैन व ₹299 UTR सत्यापन कर उन्हें 365 दिन का डिजिटल लाइसेंस और कुंजी जारी करें।
              </p>
            </div>

            <button onClick={fetchStats} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {kycList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              कोई VLE KYC आवेदन लंबित नहीं है।
            </div>
          ) : (
            <div className="space-y-4">
              {kycList.map((kyc) => (
                <div 
                  key={kyc.id} 
                  className={`p-5 rounded-3xl border text-xs space-y-3 ${
                    kyc.status === 'pending_approval' 
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-400/10' 
                      : 'bg-slate-50 dark:bg-[#0b1528] border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{kyc.id}</span>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">{kyc.shopName}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">संचालक: <strong className="text-slate-800 dark:text-slate-200">{kyc.ownerName}</strong> • मो: {kyc.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 font-bold px-3 py-1 rounded-xl text-xs">
                        {kyc.subscriptionPlan || '₹299 वार्षिक प्रो प्लान'}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        kyc.status === 'approved' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : kyc.status === 'pending_approval'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                      }`}>
                        {kyc.status === 'approved' ? 'सत्यापित (365 Days Active)' : kyc.status === 'pending_approval' ? 'सत्यापन लंबित' : 'अस्वीकृत'}
                      </span>
                    </div>
                  </div>

                  {/* KYC details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-[#0a1222] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">CSC ID / VLE ID:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">{kyc.vleId}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">आधार नंबर:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{kyc.aadhaarNo}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">पैन कार्ड:</span>
                      <span className="font-mono font-black text-slate-800 dark:text-slate-200">{kyc.panNo}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px]">₹299 फीस UTR:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-1 rounded">{kyc.utr}</span>
                        {kyc.screenshotUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingSlipUrl(kyc.screenshotUrl)}
                            className="bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-300 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>📸 पर्ची</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      स्थान: {kyc.address}, {kyc.city}, {kyc.state} ({kyc.pincode})
                    </span>

                    {kyc.status === 'pending_approval' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleKycAction(kyc.id, 'approve')}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>KYC स्वीकृत करें व लाइसेंस दें</span>
                        </button>

                        <button
                          onClick={() => handleKycAction(kyc.id, 'reject')}
                          className="bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-800 dark:text-red-300 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                        >
                          अस्वीकार
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[11px]">
                        लाइसेंस कुंजी: {kyc.licenseKey}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SECRET SHADOW COMPLAINT & AUDIT MONITORING (स्तंभ 6 - गुप्त निगरानी) */}
      {activeTab === 'shadow_audit' && (
        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-8 border-2 border-rose-300 dark:border-rose-900/60 shadow-sm space-y-6">
          <div className="bg-gradient-to-r from-red-900 via-rose-950 to-slate-900 text-white rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>गुप्त निगरानी व केंद्रीय ऑडिट कंट्रोल (100% Confidential Shadow View)</span>
              </div>
              <h3 className="text-xl font-black">
                सभी कैफे की शिकायतों एवं चैट का गुप्त ऑडिट
              </h3>
              <p className="text-xs text-rose-200 mt-1 max-w-xl">
                ग्राहक या दुकानदार को बिना पता चले, सुपर एडमिन हर कैफे की सभी शिकायतों, वार्तालापों और प्रतिक्रियाओं की गुप्त निगरानी कर सकता है। अनियमितता पाए जाने पर तुरंत लाइसेंस फ्रीज करें।
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs text-center shrink-0">
              <span className="text-rose-200 block text-[10px]">कुल ऑडिटेड शिकायतें</span>
              <span className="text-2xl font-black text-white">{complaintsList.length}</span>
            </div>
          </div>

          {/* Search & Status Filter Toolbar */}
          <div className="bg-slate-50 dark:bg-[#0b1528] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                placeholder="🔍 शिकायत ID, ग्राहक, फोन, विषय या कैफे नाम खोजें..."
                className="w-full pl-9 pr-8 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium focus:outline-hidden focus:border-rose-500"
              />
              {complaintSearch && (
                <button
                  onClick={() => setComplaintSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 font-bold self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setComplaintStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  complaintStatusFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                सभी ({complaintsList.length})
              </button>
              <button
                type="button"
                onClick={() => setComplaintStatusFilter('open')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  complaintStatusFilter === 'open'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                लंबित / खुली ({complaintsList.filter(c => c.status === 'open').length})
              </button>
              <button
                type="button"
                onClick={() => setComplaintStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  complaintStatusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                समाधानित ({complaintsList.filter(c => c.status === 'resolved').length})
              </button>
            </div>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              {complaintSearch || complaintStatusFilter !== 'all'
                ? 'खोज के अनुसार कोई शिकायत नहीं मिली।'
                : 'किसी भी कैफे के खिलाफ कोई शिकायत दर्ज नहीं है।'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((cmp) => {
                const targetCafe = cafes.find(c => c.id === cmp.cafeId || c.code === cmp.cafeId);
                const isFrozen = !!targetCafe?.isFrozen;

                return (
                  <div 
                    key={cmp.id}
                    className="p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0b1528] space-y-4 text-xs hover:border-rose-400 transition"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-bold">{cmp.id}</span>
                          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-black px-2 py-0.5 rounded text-[10px]">
                            {cmp.category}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm mt-1">{cmp.subject}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          cmp.status === 'resolved' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          स्थिति: {cmp.status === 'resolved' ? 'Resolved' : 'Open'}
                        </span>

                        {targetCafe && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSendWarning(targetCafe.id, cmp.id)}
                              className="bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                              title="दुकानदार को आधिकारिक चेतावनी नोटिस भेजें"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                              <span>चेतावनी भेजें (Warning)</span>
                            </button>

                            <button
                              onClick={() => handleToggleFreezeCafe(targetCafe.id, isFrozen)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                isFrozen 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                              }`}
                            >
                              {isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{isFrozen ? 'लाइसेंस बहाल करें' : 'लाइसेंस फ्रीज करें (Freeze)'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Parties Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-[#070e1b] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">आरोपी कैफे:</span>
                        <strong className="text-slate-900 dark:text-white">{cmp.cafeShopName}</strong>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">दुकानदार: {targetCafe?.ownerName || 'संचालक'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px]">शिकायतकर्ता ग्राहक:</span>
                        <strong className="text-slate-900 dark:text-white">{cmp.customerName}</strong>
                        <span className="font-mono text-slate-500 dark:text-slate-400 block text-[10px]">मो: {cmp.customerPhone}</span>
                      </div>
                    </div>

                    {/* Customer description */}
                    <div className="bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-slate-800 dark:text-rose-200">
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block mb-0.5">ग्राहक का मूल आरोप:</span>
                      <p>{cmp.description}</p>
                    </div>

                    {/* Sanchalak reply transcript */}
                    {cmp.cafeReplies && cmp.cafeReplies.length > 0 && (
                      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-slate-800 dark:text-emerald-200">
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block mb-0.5">कैफे संचालक का उत्तर:</span>
                        {cmp.cafeReplies.map((r, i) => (
                          <p key={i} className="text-emerald-950 dark:text-emerald-300 font-medium">"{r.message}"</p>
                        ))}
                      </div>
                    )}

                    {/* Confidential Super Admin Audit Note (NEVER seen by cafe or customer) */}
                    <div className="bg-slate-900 dark:bg-[#070e1b] text-white p-3.5 rounded-2xl space-y-2 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-300 font-extrabold text-[11px] flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>सुपर एडमिन गुप्त ऑडिट नोट (Secret Shadow Audit Note):</span>
                        </span>
                        <span className="text-[10px] text-slate-400">यह केवल सुपर एडमिन को दिखाई देता है</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="इस कैफे के संबंध में गुप्त टिप्पणी लिखें..."
                          value={auditNoteInputs[cmp.id] !== undefined ? auditNoteInputs[cmp.id] : (cmp.secretAuditNote || '')}
                          onChange={(e) => setAuditNoteInputs({ ...auditNoteInputs, [cmp.id]: e.target.value })}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveAuditNote(cmp.id)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          नोट सेव करें
                        </button>
                      </div>

                      {cmp.secretAuditNote && (
                        <p className="text-[10px] text-yellow-200 font-mono">
                          सहेजा गया नोट: {cmp.secretAuditNote}
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENT MANAGER */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                  केंद्रीय नेटवर्क प्रसारण (Super Admin Network Broadcast)
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                यहाँ से भेजा गया संदेश तुरंत सभी कैफे संचालकों और ग्राहकों के शीर्ष (Header) पर अलर्ट बैनर के रूप में दिखेगा।
              </p>
            </div>

            {stats?.broadcastNotice?.active && (
              <button
                type="button"
                onClick={handleClearBroadcast}
                className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>सक्रिय प्रसारण हटाएं</span>
              </button>
            )}
          </div>

          {/* Current Live Notice if any */}
          {stats?.broadcastNotice?.active && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
              stats.broadcastNotice.type === 'urgent'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : stats.broadcastNotice.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <Radio className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold uppercase text-[10px] tracking-wider block">
                    🔴 वर्तमान में लाइव प्रसारण संदेश ({new Date(stats.broadcastNotice.createdAt).toLocaleString('hi-IN')})
                  </span>
                  <p className="text-sm font-bold mt-1">{stats.broadcastNotice.message}</p>
                </div>
              </div>
              <span className="bg-emerald-600 text-white font-extrabold px-3 py-1 rounded-full text-[10px] shrink-0">
                सक्रिय (Active)
              </span>
            </div>
          )}

          {/* New Broadcast Publisher Form */}
          <form onSubmit={handlePublishBroadcast} className="space-y-4">
            <div>
              <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs mb-1.5">
                प्रसारण संदेश लिखें (Broadcast Announcement) *
              </label>
              <textarea
                required
                rows="3"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="पोर्टल पर प्रसारित की जाने वाली आवश्यक सूचना यहाँ लिखें..."
                className="w-full p-3.5 bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 dark:text-slate-200 font-bold text-xs mb-1.5">
                  सूचना की प्राथमिकता (Alert Level)
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#0b1528] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="info">सामान्य सूचना (Info - Blue Banner)</option>
                  <option value="warning">सावधानी / चेतावनी (Warning - Amber Banner)</option>
                  <option value="urgent">अति-आवश्यक / इमरजेंसी (Urgent - Red Banner)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={publishingBroadcast}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-6 rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-yellow-300" />
                  <span>{publishingBroadcast ? 'प्रसारित कर रहे हैं...' : 'पूरे नेटवर्क में प्रसारित करें (Publish) ➔'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 7: LIVE SYSTEM HEALTH & STORAGE MONITOR */}
      {activeTab === 'system_health' && (
        <div className="bg-white dark:bg-[#0f1d36] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                  सर्वर हेल्थ, स्टोरेज व डेटाबेस मॉनिटर (Live System Health)
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Node.js प्रक्रिया स्थिति, RAM उपयोग, अपलोड्स डिस्क स्पेस एवं मल्टी-टेनेंट डेटाबेस रिकॉर्ड्स का लाइव विवरण।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleDownloadMasterBackup}
                disabled={downloadingMasterBackup}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 cursor-pointer"
                title="सभी 10 पिलर, कैफे, वॉलेट व कैशबुक का सम्पूर्ण मास्टर JSON बैकअप डाउनलोड करें"
              >
                <Save className="w-4 h-4" />
                <span>{downloadingMasterBackup ? 'तैयार हो रहा है...' : '📥 1-क्लिक मास्टर SaaS बैकअप'}</span>
              </button>

              <button
                type="button"
                onClick={handleRunShredderNow}
                disabled={runningShredder}
                className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 cursor-pointer"
                title="24 घंटे से पुरानी या प्रिंट हो चुकी फाइलों को तुरंत नष्ट करें"
              >
                <Trash2 className={`w-4 h-4 ${runningShredder ? 'animate-spin' : ''}`} />
                <span>{runningShredder ? 'फ़ाइलें हटा रहे हैं...' : '⚡ तुरंत फ़ाइल श्रेडर चलाएं'}</span>
              </button>

              <button
                onClick={() => { fetchSystemHealth(); fetchDbStatus(); }}
                disabled={loadingHealth || loadingDbStatus}
                className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${(loadingHealth || loadingDbStatus) ? 'animate-spin' : ''}`} />
                <span>ताजा करें</span>
              </button>
            </div>
          </div>

          {/* Option 1: MySQL Enterprise Database Architecture & 1-Click Migration Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-700/60 rounded-3xl p-5 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-white">एंटरप्राइज रिलेशनल डेटाबेस (Hostinger MySQL & SQLite SQL)</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      dbStatus?.isMysqlConnected 
                        ? 'bg-emerald-500 text-slate-950' 
                        : (dbStatus?.isSqlConnected ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950')
                    }`}>
                      {dbStatus?.isMysqlConnected 
                        ? '🟢 MySQL ENTERPRISE सक्रिय' 
                        : (dbStatus?.isSqlConnected ? `🟢 रिलेशनल SQL (${(dbStatus.engine || 'sqlite').toUpperCase()} PDO) सक्रिय` : '🟡 पोर्टेबल JSON मोड सक्रिय')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {dbStatus?.isMysqlConnected 
                      ? `Hostinger MySQL डेटाबेस से सफलतापूर्वक कनेक्टेड (${dbStatus.database || 'Database'} @ ${dbStatus.host || 'localhost'})`
                      : (dbStatus?.isSqlConnected 
                          ? `सिस्टम रियल रिलेशनल SQL इंजन (${dbStatus.database || 'portal.sqlite'} - ${dbStatus.tables?.length || 8} टेबल्स, ACID ट्रांजेक्शन) पर 100% सक्रिय है। Hostinger MySQL पर अपग्रेड करने हेतु नीचे विजार्ड का उपयोग करें।`
                          : 'वर्तमान में सिस्टम सुरक्षित पोर्टेबल JSON स्टोर पर चल रहा है।')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={fetchDbStatus}
                  disabled={loadingDbStatus}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDbStatus ? 'animate-spin' : ''}`} />
                  <span>जांचें</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDbSetupWizard(prev => !prev)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showDbSetupWizard ? 'विजार्ड बंद करें' : '⚙️ वेब सेटअप विजार्ड'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSqlDump}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  title="सभी टेबल्स का SQL डंप डाउनलोड करें"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.SQL डंप</span>
                </button>
                <button
                  type="button"
                  onClick={handleMigrateDb}
                  disabled={migratingDb}
                  className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Database className={`w-3.5 h-3.5 ${migratingDb ? 'animate-spin' : ''}`} />
                  <span>{migratingDb ? 'माइग्रेट हो रहा है...' : '⚡ 1-क्लिक माइग्रेट'}</span>
                </button>
              </div>
            </div>

            {/* Direct Web Setup Wizard Form (In-App Hostinger Configurator) */}
            {showDbSetupWizard && (
              <form onSubmit={handleSaveDbConfig} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                    <span>⚡ Hostinger MySQL डायरेक्ट वेब सेटअप विजार्ड</span>
                    <span className="text-[10px] text-slate-300 font-normal">(Hostinger cPanel/FTP खोलने की आवश्यकता नहीं)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowDbSetupWizard(false)}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Host (होस्ट)</label>
                    <input
                      type="text"
                      value={dbConfigForm.host}
                      onChange={(e) => setDbConfigForm(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">डेटाबेस नाम *</label>
                    <input
                      type="text"
                      required
                      value={dbConfigForm.database}
                      onChange={(e) => setDbConfigForm(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="u123456_smartcafe"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">यूजरनेम *</label>
                    <input
                      type="text"
                      required
                      value={dbConfigForm.username}
                      onChange={(e) => setDbConfigForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="u123456_admin"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">पासवर्ड</label>
                    <input
                      type="password"
                      value={dbConfigForm.password}
                      onChange={(e) => setDbConfigForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••••••"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingDbConfig}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingDbConfig ? 'कनेक्ट हो रहा है...' : '⚡ टेस्ट कनेक्शन व MySQL में सेव करें'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Live Database Engine Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">डेटाबेस इंजन</span>
                <span className="text-sm font-black text-white mt-1 block font-mono">
                  {dbStatus?.isMysqlConnected ? 'MariaDB / MySQL Enterprise' : (dbStatus?.isSqlConnected ? `SQLite ${(dbStatus.engine || 'sqlite').toUpperCase()} PDO (ACID)` : 'ACID JSON Flat-File')}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">कनेक्शन स्थिति</span>
                <span className={`text-sm font-black mt-1 block font-mono ${dbStatus?.isSqlConnected || dbStatus?.isMysqlConnected ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {dbStatus?.isSqlConnected || dbStatus?.isMysqlConnected ? 'CONNECTED (Active Relational SQL)' : 'STANDALONE (Safe)'}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">डेटाबेस फ़ाइल / होस्ट</span>
                <span className="text-sm font-black text-white mt-1 block font-mono truncate" title={dbStatus?.database || 'portal.sqlite'}>
                  {dbStatus?.database || 'portal.sqlite'}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">सक्रिय रिलेशनल टेबल्स</span>
                <span className="text-sm font-black text-cyan-400 mt-1 block font-mono">
                  {dbStatus?.tables?.length ? `${dbStatus.tables.length} टेबल्स (100% सक्रिय)` : '8 रिलेशनल स्कीमा'}
                </span>
              </div>
            </div>

            {/* Migration Feedback Result Alert */}
            {migrationResult && (
              <div className={`p-3.5 rounded-xl text-xs border ${
                migrationResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="font-black flex items-center gap-2">
                  <span>{migrationResult.success ? '✅ माइग्रेशन सफल:' : '❌ माइग्रेशन सूचना:'}</span>
                  <span>{migrationResult.message || migrationResult.error}</span>
                </div>
                {migrationResult.details && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2 text-[11px] font-mono text-slate-300">
                    <div>यूज़र्स: <strong>{migrationResult.details.users ?? 0}</strong></div>
                    <div>वॉलेट्स: <strong>{migrationResult.details.wallets ?? 0}</strong></div>
                    <div>कैफे: <strong>{migrationResult.details.cafes ?? 0}</strong></div>
                    <div>ऑर्डर्स: <strong>{migrationResult.details.orders ?? 0}</strong></div>
                    <div>ट्रांजेक्शन: <strong>{migrationResult.details.transactions ?? 0}</strong></div>
                    <div>UTRs: <strong>{migrationResult.details.utrs ?? 0}</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* Hostinger Step-by-Step Instructions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-slate-300 space-y-2">
              <span className="font-extrabold text-white text-[11px] flex items-center gap-1.5">
                <span className="text-amber-400">💡</span> Hostinger hPanel MySQL 2-मिनट एक्टिवेशन गाइड:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>Hostinger hPanel ➔ <strong>Databases</strong> ➔ <strong>MySQL Databases</strong> में जाएं और नया डेटाबेस व यूजर बनाएं (उदा. <code className="bg-white/10 px-1 py-0.5 rounded text-amber-300">u123456_smartcafe</code>)।</li>
                <li>ऊपर दिए गए <strong>"⚙️ वेब सेटअप विजार्ड"</strong> बटन पर क्लिक करके डेटाबेस नाम, यूजर व पासवर्ड भरें और सेव करें।</li>
                <li>सिस्टम स्वतः 7 रिलेशनल टेबल्स बनाकर सारा पिछला डेटा बिना किसी डेटा हानि के MySQL में सुरक्षित कर देगा।</li>
              </ol>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* Option 2 & 5: 24×7 Instant Auto-UTR Engine & Telegram Alert Bot */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Auto-UTR Webhook Card */}
            <div className="bg-white dark:bg-[#0f1d36] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>24×7 इंस्टेंट ऑटो-UTR वेबहुक इंजन</span>
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">
                      सक्रिय (ACTIVE)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    बैंक/PhonePe पेमेंट SMS से UTR मैच होते ही 0.5 सेकंड में ऑटोमैटिक वॉलेट क्रेडिट।
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400 block text-[10px]">वेबहुक एंडपॉइंट URL:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 break-all">
                    https://smartcafe.sbs/api/webhook/upi-payment
                  </strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400 block text-[10px]">सीक्रेट कुंजी (Webhook Secret):</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Aa@910010025123343
                  </strong>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  💡 Android SMS Forwarder / MacroDroid द्वारा बैंक SMS फॉरवर्ड करते ही UTR ऑटोमैटिक रूप से वेरीफाई होकर वॉलेट में बैलेंस जोड़ देगा। डुप्लीकेट UTR पर स्वतः फ्रॉड लॉक एक्टिव है।
                </p>
              </div>
            </div>

            {/* Telegram Alert Bot Card */}
            <div className="bg-white dark:bg-[#0f1d36] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>24×7 टेलीग्राम अलर्ट बॉट (@SmartCafeAlertsBot)</span>
                    <span className="bg-sky-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black">
                      पुश अलर्ट
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    P4Points लो-बैलेंस (&lt;₹200), नया कैफे आवेदन व सुरक्षा अलर्ट्स सीधे आपके फोन पर।
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTelegram} className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-bold text-[10px] mb-1">Bot Token</label>
                    <input
                      type="text"
                      placeholder="123456789:ABCdefGhI..."
                      value={telegramConfig.botToken}
                      onChange={(e) => setTelegramConfig(prev => ({ ...prev, botToken: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-bold text-[10px] mb-1">Admin Chat ID</label>
                    <input
                      type="text"
                      placeholder="987654321"
                      value={telegramConfig.chatId}
                      onChange={(e) => setTelegramConfig(prev => ({ ...prev, chatId: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-slate-800 dark:text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={telegramConfig.enabled}
                      onChange={(e) => setTelegramConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                    <span>अलर्ट सक्रिय रखें</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram}
                      className="bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer border border-sky-200 dark:border-sky-800"
                    >
                      <span>{testingTelegram ? 'भेज रहे हैं...' : '🔔 टेस्ट अलर्ट'}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={savingTelegram}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingTelegram ? 'सहेज रहे हैं...' : 'सहेजें'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {loadingHealth && !systemHealth ? (
            <div className="p-12 text-center text-slate-400 text-xs font-bold">
              सिस्टम स्थिति लोड हो रही है...
            </div>
          ) : systemHealth ? (
            <div className="space-y-6 text-xs">
              
              {/* Server Engine Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 dark:bg-[#070e1b] text-white p-4 rounded-2xl flex flex-col justify-between border border-slate-800">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    सर्वर Uptime
                  </span>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {Math.floor(systemHealth.uptimeSeconds / 3600)}h {Math.floor((systemHealth.uptimeSeconds % 3600) / 60)}m {systemHealth.uptimeSeconds % 60}s
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">लगातार सक्रिय</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-orange-500" />
                    Node.js रनटाइम
                  </span>
                  <div className="mt-3">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {systemHealth.nodeVersion}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      OS: {systemHealth.platform} ({systemHealth.arch})
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-blue-500" />
                    अपलोड्स डिस्क स्टोरेज
                  </span>
                  <div className="mt-3">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {systemHealth.storage?.uploadTotalMB} MB
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {systemHealth.storage?.uploadFilesCount} कुल फ़ाइलें (PDF / स्कैन)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    डेटाबेस स्टोर (JSON)
                  </span>
                  <div className="mt-3">
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {systemHealth.storage?.storeSizeKB} KB
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      स्थायी डेटाबेस फ़ाइल
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Auto-Purge Cron Engine (File Shredder) Live Telemetry Card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-indigo-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <span>प्राइवेसी ऑटो-पर्ज क्रॉन इंजन (Privacy File Shredder Cron Engine)</span>
                        <span className="bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">
                          {systemHealth.fileShredder?.status === 'active' ? 'प्रति घंटा सक्रिय (ACTIVE CRON)' : 'सक्रिय'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        नागरिक निजता सुरक्षा हेतु 24 घंटे से पुरानी अपलोड फाइल्स व पूर्ण हो चुके प्रिंट जॉब्स का स्वतः विलोपन चक्र।
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunShredderNow}
                    disabled={runningShredder}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${runningShredder ? 'animate-spin' : ''}`} />
                    <span>{runningShredder ? 'श्रेडर रनिंग...' : '⚡ रन श्रेडर नाउ'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-medium">कुल हटाई गई फ़ाइलें (Total Purged)</span>
                    <span className="text-lg font-black text-rose-400 font-mono mt-0.5 block">
                      {systemHealth.fileShredder?.totalPurged ?? 0} फ़ाइलें
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-medium">मुक्त की गई स्टोरेज मेमोरी</span>
                    <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                      {(((systemHealth.fileShredder?.bytesReclaimed ?? 0) / 1024) > 1024
                        ? ((systemHealth.fileShredder?.bytesReclaimed ?? 0) / (1024 * 1024)).toFixed(2) + ' MB'
                        : ((systemHealth.fileShredder?.bytesReclaimed ?? 0) / 1024).toFixed(1) + ' KB')}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-medium">अंतिम ऑटो-रन समय (Last Run)</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block truncate">
                      {systemHealth.fileShredder?.lastRun
                        ? new Date(systemHealth.fileShredder.lastRun).toLocaleTimeString('hi-IN')
                        : 'सक्रियण प्रतीक्षा'}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-medium">अगला शेड्यूल्ड रन (Next Run)</span>
                    <span className="text-xs font-bold text-yellow-300 mt-1 block truncate">
                      {systemHealth.fileShredder?.nextRun
                        ? new Date(systemHealth.fileShredder.nextRun).toLocaleTimeString('hi-IN')
                        : '1 घंटे के भीतर'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory Allocation Gauge */}
              <div className="bg-slate-50 dark:bg-[#0b1528] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    होस्ट सिस्टम RAM स्थिति
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">
                    उपयोग: {systemHealth.totalSystemMemoryMB - systemHealth.freeSystemMemoryMB} MB / {systemHealth.totalSystemMemoryMB} MB
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((systemHealth.totalSystemMemoryMB - systemHealth.freeSystemMemoryMB) / systemHealth.totalSystemMemoryMB) * 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Node RSS Memory:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{systemHealth.processMemory?.rssMB} MB</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Heap Total:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{systemHealth.processMemory?.heapTotalMB} MB</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Heap Used:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{systemHealth.processMemory?.heapUsedMB} MB</strong>
                  </div>
                </div>
              </div>

              {/* Database Entity Breakdown Grid */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  मल्टी-टेनेंट डेटाबेस रिकॉर्ड गणना (Live Entity Records)
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs text-center">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold">पंजीकृत कैफे</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{systemHealth.counts?.cafes}</span>
                  </div>

                  <div className="bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs text-center">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold">प्रिंट कतार</span>
                    <span className="text-xl font-black text-blue-500 mt-1 block">{systemHealth.counts?.prints}</span>
                  </div>

                  <div className="bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs text-center">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold">फॉर्म आवेदन</span>
                    <span className="text-xl font-black text-orange-500 mt-1 block">{systemHealth.counts?.applications}</span>
                  </div>

                  <div className="bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs text-center">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold">रोकड़ बही (Cash)</span>
                    <span className="text-xl font-black text-emerald-500 mt-1 block">{systemHealth.counts?.cashbook}</span>
                  </div>

                  <div className="bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs text-center">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold">उधार खाते</span>
                    <span className="text-xl font-black text-amber-500 mt-1 block">{systemHealth.counts?.udhar}</span>
                  </div>

                  <div className="bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs text-center">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold">शिकायतें (Shadow)</span>
                    <span className="text-xl font-black text-rose-500 mt-1 block">{systemHealth.counts?.complaints}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-rose-600 text-xs">
              सिस्टम स्थिति प्राप्त करने में त्रुटि आई।
            </div>
          )}
        </div>
      )}

      {/* Add New Cyber Cafe Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-lg">नया साइबर कैफे पंजीकृत करें</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCafe} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">दुकान / सेंटर का नाम *</label>
                <input
                  type="text"
                  required
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  placeholder="दुकान / केंद्र का नाम दर्ज करें"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">दुकानदार का नाम *</label>
                  <input
                    type="text"
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="दुकानदार / संचालक का नाम"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">शहर / कस्बा</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="शहर / कस्बा दर्ज करें"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">पिनकोड</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="6-अंकीय पिनकोड दर्ज करें"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0b1528] text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 rounded-xl p-3 text-[11px] text-orange-900 dark:text-orange-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <span>
                  पंजीकरण होते ही कैफे को स्वतः <strong>365 दिन (₹299 प्रो प्लान)</strong>, ₹0 B2B बैलेंस और एक डिजिटल लाइसेंस कुंजी मिल जाएगी।
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={addingCafe}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {addingCafe ? 'जोड़ रहे हैं...' : 'सुरक्षित जोड़ें (Save)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* पर्ची रसीद प्रिव्यू मॉडल (Full Screenshot Modal) */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1d36] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>📸 संलग्न भुगतान रसीद (UTR पर्ची)</span>
              </h4>
              <button 
                onClick={() => setViewingSlipUrl('')}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 p-2 rounded-2xl flex items-center justify-center border border-slate-200 max-h-[70vh] overflow-auto">
              <img 
                src={viewingSlipUrl.startsWith('/') && getServerBaseUrl() ? `${getServerBaseUrl()}${viewingSlipUrl}` : viewingSlipUrl} 
                alt="UTR Slip Receipt" 
                className="max-w-full h-auto rounded-xl shadow-sm" 
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingSlipUrl('')}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
