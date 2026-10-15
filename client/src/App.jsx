import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CustomerHome from './components/CustomerHome';
import QuickPrint from './components/QuickPrint';
import ServiceApply from './components/ServiceApply';
import StatusTracker from './components/StatusTracker';
import AdminPrintQueue from './components/AdminPrintQueue';
import AdminApplications from './components/AdminApplications';
import AdminCashbook from './components/AdminCashbook';
import UdharRegister from './components/UdharRegister';
import AdminSettings from './components/AdminSettings';
import ShopStandeeModal from './components/ShopStandeeModal';
import ImageResizerTool from './components/ImageResizerTool';
import PdfMergerTool from './components/PdfMergerTool';
import CustomerVault from './components/CustomerVault';
import PortalsDirectory from './components/PortalsDirectory';
import PrintPortalCards from './components/PrintPortalCards';
import SuperAdminPanel from './components/SuperAdminPanel';
import CustomerWalletModal from './components/CustomerWalletModal';
import CafeSelectorModal from './components/CafeSelectorModal';
import VehicleRCDownload from './components/VehicleRCDownload';
import CustomerComplaintsModal from './components/CustomerComplaintsModal';
import AdminComplaints from './components/AdminComplaints';
import AdminB2BWalletModal from './components/AdminB2BWalletModal';
import AdminUtrApprovalModal from './components/AdminUtrApprovalModal';
import LicenseCertificateModal from './components/LicenseCertificateModal';
import VleKycModal from './components/VleKycModal';
import RoleAuthModal from './components/RoleAuthModal';
import UserProfileModal from './components/UserProfileModal';
import OperatorGateway from './components/OperatorGateway';
import SuperAdminGateway from './components/SuperAdminGateway';
import JanSevaModal from './components/JanSevaModal';
import RekhaSidebar from './components/RekhaSidebar';
import RekhaDashboard from './components/RekhaDashboard';
import InstantToolsEngine from './components/InstantToolsEngine';
import ServicePage from './components/ServicePage';
import CategoryPage from './components/CategoryPage';
import RekhaOrders from './components/RekhaOrders';
import IndianFlagBackdrop from './components/IndianFlagBackdrop';
import ScrollToTopWidget from './components/ScrollToTopWidget';
import { authFetch, getServerBaseUrl, setServerBaseUrl } from './utils/api';
import { useLanguage } from './context/LanguageContext';
import { getMergedServicesCatalog, SERVICE_CATEGORIES } from './data/servicesCatalog';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

export default function App() {
  const { language, t } = useLanguage();
  // 3-Tier Isolated Routing Architecture
  // Tier 1: 'customer' (default public citizen portal)
  // Tier 2: 'admin' (dedicated cyber cafe operator / VLE gateway & dashboard)
  // Tier 3: 'superadmin' (dedicated master super admin root panel)
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (p === '/superadmin' || p.startsWith('/superadmin') || hash === '#superadmin') {
        return 'superadmin';
      }
      if (p === '/operator' || p === '/cafe-login' || p.startsWith('/operator') || p.startsWith('/cafe-login') || hash === '#operator') {
        return 'admin';
      }
      if (p === '/' || p === '') {
        return 'customer';
      }
    }
    const saved = sessionStorage.getItem('active_mode');
    return (saved === 'admin' || saved === 'superadmin') ? saved : 'customer';
  });

  const [customerTab, setCustomerTab] = useState('home'); // 'home', 'print', 'apply', 'track', 'jobs', 'rc', 'printportal', 'edistrict', 'resizer', 'pdf'
  const [adminTab, setAdminTab] = useState('prints'); // 'prints', 'applications', 'cashbook', 'udhar', 'rc', 'printportal', 'edistrict', 'portals', 'complaints', 'settings', 'resizer', 'pdf', 'customers'
  const [settings, setSettings] = useState(null);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [isStandeeOpen, setIsStandeeOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCafeSelectorOpen, setIsCafeSelectorOpen] = useState(false);
  const [isB2bWalletOpen, setIsB2bWalletOpen] = useState(false);
  const [isUtrApprovalOpen, setIsUtrApprovalOpen] = useState(false);
  const [isCustomerComplaintsOpen, setIsCustomerComplaintsOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [preloadedPvcCard, setPreloadedPvcCard] = useState(null);
  const [sanchalakB2bBalance, setSanchalakB2bBalance] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingUtrCount, setPendingUtrCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingPrintsCount, setPendingPrintsCount] = useState(0);
  const [preselectedService, setPreselectedService] = useState(null);
  const [activeOtpApp, setActiveOtpApp] = useState(null);
  const [incomingOtpInput, setIncomingOtpInput] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [janSevaModalOpen, setJanSevaModalOpen] = useState(false);
  const [selectedJanSevaId, setSelectedJanSevaId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [activeInstantToolId, setActiveInstantToolId] = useState('aadhaar_advance');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [broadcastNotice, setBroadcastNotice] = useState(null);

  // Global Theme Switcher State (stored in localStorage smartcafe_theme)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('smartcafe_theme') || 'light';
      } catch (e) {
        return 'light';
      }
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('smartcafe_theme', nextTheme);
        } catch (e) {}
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return nextTheme;
    });
  };

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [theme]);

  // Master 14 APIs and Disabled Tools Live Status
  const [toolSettings, setToolSettings] = useState({
    disabledTools: [],
    toolStatus: {},
    apis: []
  });

  const fetchToolSettings = async () => {
    try {
      const res = await fetch('/api/tools/status');
      if (res.ok) {
        const data = await res.json();
        setToolSettings({
          disabledTools: data.disabledTools || [],
          toolStatus: data.toolStatus || {},
          apis: data.apis || []
        });
      }
    } catch (err) {
      console.warn('Error fetching tool settings:', err);
    }
  };

  // Master 79 Services Dynamic Rates State (Persisted in server & database)
  const [services79Rates, setServices79Rates] = useState([]);

  const fetchServices79Rates = async () => {
    try {
      const res = await fetch('/api/services/rates');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.services)) {
          setServices79Rates(data.services);
        }
      }
    } catch (err) {
      console.warn('Error fetching 79 services rates:', err);
    }
  };

  useEffect(() => {
    fetchToolSettings();
    fetchServices79Rates();
  }, []);

  // Authentication & Dynamic Customer Session (No fake defaults)
  const [customerSession, setCustomerSession] = useState(() => {
    try {
      const saved = localStorage.getItem('cybercafe_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSuperAdminAuth, setIsSuperAdminAuth] = useState(() => {
    return sessionStorage.getItem('superadmin_auth') === 'true';
  });

  const [isCafeAuth, setIsCafeAuth] = useState(() => {
    return !!localStorage.getItem('cafe_auth');
  });

  const [isStaffAuth, setIsStaffAuth] = useState(() => {
    return localStorage.getItem('is_staff_auth') === 'true';
  });

  const [roleAuthModalConfig, setRoleAuthModalConfig] = useState({
    isOpen: false,
    type: 'customer' // 'customer', 'cafe', or 'superadmin'
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenCustomerProfile = () => {
    if (customerSession?.phone || isCafeAuth || localStorage.getItem('smartcafe_user') || localStorage.getItem('cafe_auth')) {
      setIsProfileModalOpen(true);
    } else {
      setRoleAuthModalConfig({ isOpen: true, type: 'customer' });
    }
  };

  // Configurable Mobile Server URL State & Capacitor native environment detection
  const [showServerConfigModal, setShowServerConfigModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => localStorage.getItem('cybercafe_server_url') || '');

  // URL Routing Sync
  const navigateToTier = (targetMode) => {
    if (typeof window !== 'undefined') {
      try {
        if (targetMode === 'superadmin') {
          window.history.pushState({}, '', '/superadmin');
        } else if (targetMode === 'admin') {
          window.history.pushState({}, '', '/operator');
        } else {
          window.history.pushState({}, '', '/');
        }
      } catch (e) {
        // Fallback for file:// or capacitor protocol
      }
    }
    sessionStorage.setItem('active_mode', targetMode);
    setMode(targetMode);
  };

  // Universal Back and Home Handlers (Requirement: Back button on every page)
  const handleUniversalBack = () => {
    if (mode === 'superadmin') {
      navigateToTier('customer');
    } else if (mode === 'admin') {
      if (adminTab === 'tool' && selectedCategory) {
        setAdminTab('category');
      } else if (adminTab === 'category') {
        setAdminTab('dashboard');
      } else if (adminTab !== 'dashboard' && adminTab !== 'home') {
        setAdminTab('dashboard');
      } else {
        navigateToTier('customer');
      }
    } else {
      if (customerTab === 'tool' && selectedCategory) {
        setCustomerTab('category');
      } else if (customerTab === 'category') {
        setCustomerTab('home');
      } else {
        setCustomerTab('home');
      }
    }
  };

  const handleGoHome = () => {
    if (mode === 'superadmin') {
      navigateToTier('customer');
    } else if (mode === 'admin') {
      setAdminTab('dashboard');
    } else {
      setCustomerTab('home');
    }
  };

  const getCurrentPageTitle = () => {
    if (mode === 'superadmin') {
      return language === 'hi' ? '🛡️ सुपर एडमिन SaaS कंट्रोल रूम' : '🛡️ Super Admin Control Room';
    }

    if (customerTab === 'category' || adminTab === 'category') {
      return selectedCategory 
        ? (selectedCategory.title?.[language] || selectedCategory.title?.hi || 'सेवा श्रेणी') 
        : (language === 'hi' ? 'सेवा श्रेणी' : 'Service Category');
    }
    
    if (mode === 'admin') {
      const adminTitles = {
        prints: { hi: '🖨️ लाइव प्रिंट कतार (Print Queue)', en: '🖨️ Live Print Queue' },
        applications: { hi: '📄 फॉर्म आवेदन डेस्क (Application Desk)', en: '📄 Applications Desk' },
        cashbook: { hi: '💰 दैनिक रोकड़ बही (Daily Cashbook)', en: '💰 Daily Cashbook' },
        udhar: { hi: '📒 ग्राहक उधार व खाता रजिस्टर (Udhar Register)', en: '📒 Udhar Register' },
        complaints: { hi: '💬 ग्राहक सहायता व शिकायत (Complaints)', en: '💬 Customer Complaints' },
        settings: { hi: '⚙️ कैफे सेटिंग्स व रेट कार्ड (Cafe Settings)', en: '⚙️ Cafe Settings' },
        customers: { hi: '👥 ग्राहक डायरेक्टरी (Customer Vault)', en: '👥 Customer Vault' },
        portals: { hi: '🌐 सरकारी पोर्टल्स डायरेक्टरी (Govt Portals)', en: '🌐 Govt Portals Directory' },
        resizer: { hi: '✂️ फोटो व सिग्नेचर रिसाइज़र (Photo & Sign Resizer)', en: '✂️ Photo & Sign Resizer' },
        pdf: { hi: '📑 PDF मर्जर व टूल्स (PDF Tools)', en: '📑 PDF Merger & Tools' },
        edistrict: { hi: '📜 ई-डिस्ट्रिक्ट टूल्स सुइट (e-District Suite)', en: '📜 e-District Tools Suite' },
        printportal: { hi: '🪪 CR-80 PVC स्मार्ट कार्ड मेकर (PVC Card Portal)', en: '🪪 CR-80 PVC Smart Card Maker' },
        rc: { hi: '🚗 वाहन RC टू PDF / PVC (Vehicle RC Tool)', en: '🚗 Vehicle RC Download & PVC' }
      };
      return adminTitles[adminTab]?.[language] || adminTab;
    }

    const customerTitles = {
      print: { hi: '🖨️ त्वरित दस्तावेज़ प्रिंट (Quick Print)', en: '🖨️ Quick Print Documents' },
      apply: { hi: '📄 सरकारी योजना व फॉर्म आवेदन (Apply for Services)', en: '📄 Apply for Govt Services' },
      track: { hi: '🔍 आवेदन व प्रिंट स्थिति जांचें (Status Tracker)', en: '🔍 Track Application & Print' },
      jobs: { hi: '📢 सरकारी नौकरी व भर्ती बुलेटिन (Job Alerts)', en: '📢 Govt Job & Exam Alerts' },
      resizer: { hi: '✂️ फोटो व सिग्नेचर रिसाइज़र (Photo & Sign Resizer)', en: '✂️ Photo & Sign Resizer' },
      pdf: { hi: '📑 PDF मर्जर व टूल्स (PDF Merger Tool)', en: '📑 PDF Merger & Tools' },
      edistrict: { hi: '📜 ई-डिस्ट्रिक्ट टूल्स सुइट (e-District Suite)', en: '📜 e-District Suite' },
      printportal: { hi: '🪪 CR-80 PVC स्मार्ट कार्ड मेकर (PVC Card Portal)', en: '🪪 CR-80 PVC Smart Card Maker' },
      rc: { hi: '🚗 वाहन RC टू PDF / PVC (Vehicle RC Tool)', en: '🚗 Vehicle RC Download & PVC' },
      portalhome: { hi: '🏠 नागरिक सेवा केंद्र पोर्टल (Citizen Portal Home)', en: '🏠 Citizen Portal Home' }
    };
    return customerTitles[customerTab]?.[language] || customerTab;
  };

  const hasCustomHeader = 
    (customerTab === 'tool' || customerTab.startsWith('tool-') || customerTab === 'category' || customerTab === 'orders') ||
    (adminTab === 'tool' || adminTab.startsWith('tool-') || adminTab === 'category' || adminTab === 'orders');

  const isSubPage = 
    !hasCustomHeader && (
      (mode === 'customer' && customerTab !== 'home' && customerTab !== 'dashboard') ||
      (mode === 'admin' && adminTab !== 'dashboard' && adminTab !== 'home') ||
      (mode === 'superadmin')
    );

  useEffect(() => {
    const handlePopState = (e) => {
      const state = e?.state;
      if (state?.appTab === 'tool' && state.toolId) {
        setActiveInstantToolId(state.toolId);
        if (mode === 'customer') setCustomerTab('tool');
        else setAdminTab('tool');
        return;
      }
      if (state?.appTab === 'category' && state.catId) {
        const found = SERVICE_CATEGORIES.find(c => c.id === state.catId);
        if (found) setSelectedCategory(found);
        if (mode === 'customer') setCustomerTab('category');
        else setAdminTab('category');
        return;
      }

      const p = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      let newMode = 'customer';
      if (p === '/superadmin' || p.startsWith('/superadmin') || hash === '#superadmin') {
        newMode = 'superadmin';
      } else if (p === '/operator' || p === '/cafe-login' || p.startsWith('/operator') || p.startsWith('/cafe-login') || hash === '#operator') {
        newMode = 'admin';
      }
      setMode(newMode);
      sessionStorage.setItem('active_mode', newMode);

      if (newMode === 'customer') {
        if (customerTab === 'tool' && selectedCategory) {
          setCustomerTab('category');
        } else {
          setCustomerTab('home');
        }
      } else if (newMode === 'admin') {
        if (adminTab === 'tool' && selectedCategory) {
          setAdminTab('category');
        } else {
          setAdminTab('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mode, customerTab, adminTab, selectedCategory]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isNative = window.Capacitor?.isNativePlatform?.() || window.location.protocol === 'capacitor:';
      const existing = localStorage.getItem('cybercafe_server_url');
      if (isNative && !existing) {
        setTimeout(() => setShowServerConfigModal(true), 1200);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('superadmin_auth');
    sessionStorage.removeItem('superadmin_token');
    localStorage.removeItem('cafe_auth');
    localStorage.removeItem('cafe_token');
    localStorage.removeItem('is_staff_auth');
    localStorage.removeItem('cybercafe_customer');
    localStorage.removeItem('smartcafe_user');
    localStorage.removeItem('smartcafe_token');
    setIsSuperAdminAuth(false);
    setIsCafeAuth(false);
    setIsStaffAuth(false);
    setCustomerSession(null);
    navigateToTier('customer');
  };

  const handleLaunchService = (toolKey) => {
    setActiveInstantToolId(toolKey);
    // Automatically find and attach category so Back navigation is always 100% accurate
    try {
      const all = getMergedServicesCatalog(services79Rates);
      const matched = all.find(s => s.id === toolKey || s.num === Number(toolKey));
      if (matched) {
        const catObj = SERVICE_CATEGORIES.find(c => c.id === matched.group || c.id === matched.category);
        if (catObj) {
          setSelectedCategory(catObj);
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({ appTab: 'tool', toolId: toolKey }, '');
      } catch (e) {}
    }
    if (mode === 'customer') setCustomerTab('tool');
    else setAdminTab('tool');
  };

  const handleSelectCategory = (cat) => {
    // If passed category is an ID string, find the category object
    let catObj = cat;
    if (typeof cat === 'string') {
      catObj = SERVICE_CATEGORIES.find(c => c.id === cat) || { id: cat, title: { hi: cat, en: cat } };
    }
    setSelectedCategory(catObj);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({ appTab: 'category', catId: catObj.id }, '');
      } catch (e) {}
    }
    if (mode === 'customer') setCustomerTab('category');
    else setAdminTab('category');
  };

  // Fetch shop settings and cafes
  const fetchSettingsAndCafes = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);

      const cafesRes = await fetch('/api/cafes');
      const cafesList = await cafesRes.json();
      const validCafes = Array.isArray(cafesList) ? cafesList : [];
      setCafes(validCafes);
      if (validCafes.length > 0) {
        const urlParams = new URLSearchParams(window.location.search);
        const queryCafeId = urlParams.get('cafe') || urlParams.get('cafeId');
        const savedId = queryCafeId || localStorage.getItem('selectedCafeId');
        const found = validCafes.find(c => 
          c.id === savedId || 
          c.code === savedId || 
          c.slug === savedId ||
          c.id.toLowerCase() === (savedId || '').toLowerCase()
        ) || validCafes[0];
        if (queryCafeId && found) {
          localStorage.setItem('selectedCafeId', found.id);
        }
        setSelectedCafe(found);
      } else {
        setSelectedCafe(null);
      }
    } catch (err) {
      console.error('Error fetching settings/cafes:', err);
    }
  };

  // Fetch wallet balance (Authentic to logged-in user or guest session)
  const fetchWalletBalance = async (forcedPhone) => {
    const targetPhone = forcedPhone || customerSession?.phone || localStorage.getItem('last_wallet_phone') || '9876543210';
    try {
      if (forcedPhone || customerSession?.phone) {
        localStorage.setItem('last_wallet_phone', targetPhone);
      }
      const res = await authFetch(`/api/wallet/${targetPhone}`);
      const data = await res.json();
      if (data && data.balance !== undefined) {
        setWalletBalance(Number(data.balance));
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  // Fetch Central Broadcast Notice
  const fetchBroadcastNotice = async () => {
    try {
      const res = await fetch('/api/broadcast');
      const data = await res.json();
      if (data?.broadcast?.active) {
        setBroadcastNotice(data.broadcast);
      } else {
        setBroadcastNotice(null);
      }
    } catch (err) {
      console.warn('Error fetching broadcast notice:', err);
    }
  };

  // Poll for applications requesting OTP (strictly scoped to current logged-in customer's phone)
  const checkLiveOtpRequests = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      const waiting = data.find(a => a.otpStatus === 'requested' && a.phone === customerSession?.phone);
      setActiveOtpApp(waiting || null);
    } catch (err) {
      console.error('Error checking OTP:', err);
    }
  };

  // Submit customer OTP
  const handleCustomerSubmitOtp = async (e) => {
    e.preventDefault();
    if (!activeOtpApp || !incomingOtpInput) return;
    setSubmittingOtp(true);
    try {
      const res = await fetch(`/api/applications/${activeOtpApp.id}/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: incomingOtpInput })
      });
      if (res.ok) {
        alert('✅ OTP सफलतापूर्वक दुकानदार के कंप्यूटर पर भेज दिया गया!');
        setIncomingOtpInput('');
        setActiveOtpApp(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOtp(false);
    }
  };

  // Fetch pending prints count (scoped to selectedCafe)
  const fetchPendingCounts = async () => {
    try {
      const cafeParam = selectedCafe?.id ? `?cafeId=${selectedCafe.id}` : '';
      const res = await fetch(`/api/prints${cafeParam}`);
      const data = await res.json();
      const count = data.filter(p => p.printStatus === 'pending').length;
      setPendingPrintsCount(count);
    } catch (err) {
      console.error('Error fetching prints count:', err);
    }
  };

  // Fetch Sanchalak B2B Wallet balance (Owner only)
  const fetchB2bWallet = async () => {
    if (mode !== 'admin' || isStaffAuth || !selectedCafe?.id) return;
    try {
      const res = await authFetch(`/api/cafes/${selectedCafe.id}/b2b-wallet`);
      if (res.ok) {
        const data = await res.json();
        setSanchalakB2bBalance(data.b2bWallet?.balance ?? 0);
      }
    } catch (err) {
      console.error('Error fetching B2B wallet:', err);
    }
  };

  // Fetch pending customer UTRs (Owner only)
  const fetchPendingUtrs = async () => {
    if (mode !== 'admin' || isStaffAuth || !selectedCafe?.id) return;
    try {
      const res = await authFetch(`/api/cafes/${selectedCafe.id}/utr-requests`);
      if (res.ok) {
        const list = await res.json();
        const pending = Array.isArray(list) ? list.filter(u => u.status === 'pending') : [];
        setPendingUtrCount(pending.length);
      }
    } catch (err) {
      console.error('Error fetching UTR requests:', err);
    }
  };

  useEffect(() => {
    fetchSettingsAndCafes();
    fetchPendingCounts();
    fetchWalletBalance();
    checkLiveOtpRequests();
    fetchB2bWallet();
    fetchPendingUtrs();
    fetchBroadcastNotice();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      fetchWalletBalance();
      fetchPendingCounts();
      checkLiveOtpRequests();
      fetchB2bWallet();
      fetchPendingUtrs();
      fetchBroadcastNotice();
    }, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedCafe?.id, customerSession?.phone]);

  // Enforce staff restricted view to allowed tabs only
  useEffect(() => {
    if (mode === 'admin' && isStaffAuth) {
      const allowedStaffTabs = ['prints', 'applications', 'resizer', 'pdf'];
      if (!allowedStaffTabs.includes(adminTab)) {
        setAdminTab('prints');
      }
    }
  }, [mode, isStaffAuth, adminTab]);

  const handleApplyFromJob = (jobItem) => {
    setPreselectedService({
      name: jobItem.serviceName || jobItem.title,
      fee: 100,
      docs: ["10वीं मार्कशीट", "फोटो", "हस्ताक्षर", "आईडी प्रूफ"]
    });
    setCustomerTab('apply');
  };

  return (
    <div className={`min-h-screen flex relative max-w-full overflow-x-clip ${theme === 'dark' ? 'dark bg-[#060c18] text-slate-100' : 'bg-slate-50/90 text-slate-900'} transition-colors duration-200`}>
      
      {/* Full-Screen Indian National Flag (Tiranga) Backdrop */}
      <IndianFlagBackdrop theme={theme} />

      {/* Rekha Print Navy Sidebar Navigation */}
      {mode !== 'superadmin' && (
        <RekhaSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={
            mode === 'customer' 
              ? (customerTab === 'tool' ? `tool-${activeInstantToolId}` : 
                 customerTab === 'home' || customerTab === 'dashboard' ? 'dashboard' :
                 customerTab === 'print' ? 'print' :
                 customerTab)
              : (adminTab === 'tool' ? `tool-${activeInstantToolId}` : 
                 adminTab === 'dashboard' ? 'dashboard' :
                 adminTab === 'prints' ? 'queue' :
                 adminTab)
          }
          onSelectTab={(tabId) => {
            if (tabId === 'dashboard') {
              if (mode === 'customer') setCustomerTab('home');
              else setAdminTab('dashboard');
            } else if (tabId === 'print' || tabId === 'quick-print') {
              if (mode === 'customer') setCustomerTab('print');
              else setAdminTab('prints');
            } else if (tabId.startsWith('tool-')) {
              const toolKey = tabId.replace('tool-', '');
              handleLaunchService(toolKey);
            } else if (tabId === 'orders') {
              if (mode === 'customer') setCustomerTab('orders');
              else setAdminTab('orders');
            } else if (tabId === 'wallet') {
              if (mode === 'admin') setIsB2bWalletOpen(true);
              else setIsWalletOpen(true);
            } else if (tabId === 'queue') {
              setAdminTab('prints');
            } else if (tabId === 'applications') {
              setAdminTab('applications');
            } else if (tabId === 'cashbook') {
              setAdminTab('cashbook');
            } else if (tabId === 'udhar') {
              setAdminTab('udhar');
            } else if (tabId === 'standee') {
              setIsStandeeOpen(true);
            } else if (tabId === 'settings') {
              setAdminTab('settings');
            } else {
              if (mode === 'customer') setCustomerTab(tabId);
              else setAdminTab(tabId);
            }
          }}
          mode={mode}
          selectedCafe={selectedCafe}
          walletBalance={walletBalance}
          sanchalakB2bBalance={sanchalakB2bBalance}
          pendingPrintsCount={pendingPrintsCount}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
          onOpenKyc={() => setIsKycModalOpen(true)}
          onOpenShopkeeperLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'cafe' })}
          onOpenSuperAdminLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'superadmin' })}
          isStaffAuth={isStaffAuth}
          searchTerm={sidebarSearchTerm}
          onSearchChange={setSidebarSearchTerm}
          theme={theme}
          toggleTheme={toggleTheme}
          disabledTools={toolSettings.disabledTools}
          toolStatus={toolSettings.toolStatus}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10 max-w-full overflow-x-clip">
        {/* Navigation Header */}
        <Navbar
          settings={settings}
          mode={mode}
          onModeToggle={navigateToTier}
          activeCustomerTab={customerTab}
          onCustomerTabChange={(tab) => setCustomerTab(tab)}
          activeAdminTab={adminTab}
          onAdminTabChange={(tab) => setAdminTab(tab)}
          pendingPrintsCount={pendingPrintsCount}
          onOpenStandee={() => setIsStandeeOpen(true)}
          selectedCafe={selectedCafe}
          onOpenCafeSelector={() => setIsCafeSelectorOpen(true)}
          onOpenWallet={() => setIsWalletOpen(true)}
          walletBalance={walletBalance}
          sanchalakB2bBalance={sanchalakB2bBalance}
          pendingUtrCount={pendingUtrCount}
          onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
          onOpenUtrApproval={() => setIsUtrApprovalOpen(true)}
          onOpenCustomerComplaints={() => setIsCustomerComplaintsOpen(true)}
          onOpenLicenseCertificate={() => setIsLicenseModalOpen(true)}
          customerSession={customerSession}
          onOpenCustomerProfile={handleOpenCustomerProfile}
          onOpenShopkeeperLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'cafe' })}
          onOpenSuperAdminLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'superadmin' })}
          onOpenKyc={() => setIsKycModalOpen(true)}
          isSuperAdminAuth={isSuperAdminAuth}
          isCafeAuth={isCafeAuth}
          isStaffAuth={isStaffAuth}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onSelectTool={(toolKey) => {
            handleLaunchService(toolKey);
          }}
          theme={theme}
          toggleTheme={toggleTheme}
          disabledTools={toolSettings.disabledTools}
          toolStatus={toolSettings.toolStatus}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-20 sm:pb-8 max-w-full overflow-x-hidden">
        
        {/* Offline Network Warning Banner */}
        {!isOnline && (
          <div className="mb-6 p-4 rounded-2xl shadow-lg border bg-rose-600 text-white border-rose-400 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-extrabold uppercase tracking-wider block text-[10px]">
                  {t('offline_alert')}
                </span>
                <p className="text-sm font-bold mt-0.5">
                  {language === 'hi' 
                    ? 'आपका इंटरनेट कनेक्शन कट गया है। कृपया नेटवर्क जांचें। ऑनलाइन होने के बाद ही फॉर्म व प्रिंट सबमिट करें।'
                    : 'Your internet connection was interrupted. Please check network. Submit forms & prints once online.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOnline(navigator.onLine)}
              className="bg-white text-rose-700 font-black px-3 py-1.5 rounded-xl text-xs hover:bg-rose-50 transition shrink-0"
            >
              {language === 'hi' ? 'पुनः जांचें' : 'Retry'}
            </button>
          </div>
        )}

        {/* SUPER ADMIN CENTRAL BROADCAST ANNOUNCEMENT BANNER */}
        {broadcastNotice && broadcastNotice.active && (
          <div className={`mb-6 p-4 rounded-2xl shadow-lg border flex items-center justify-between gap-4 text-xs transition ${
            broadcastNotice.type === 'urgent'
              ? 'bg-rose-600 text-white border-rose-400'
              : broadcastNotice.type === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
              : 'bg-blue-600 text-white border-blue-400'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">📢</span>
              <div>
                <span className="font-extrabold uppercase tracking-wider block text-[10px] opacity-90">
                  केंद्रीय नेटवर्क घोषणा (Super Admin Broadcast):
                </span>
                <p className="text-sm font-bold mt-0.5">{broadcastNotice.message}</p>
              </div>
            </div>
            <button
              onClick={() => setBroadcastNotice(null)}
              className="text-white hover:bg-black/20 font-black text-sm px-2.5 py-1 rounded-lg transition shrink-0"
              title="बंद करें"
            >
              ✕
            </button>
          </div>
        )}

        {/* LIVE OTP ALERT BANNER FOR CUSTOMER */}
        {activeOtpApp && mode === 'customer' && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white p-4 rounded-2xl shadow-xl border-2 border-yellow-300 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h4 className="font-black text-sm">
                    अत्यावश्यक: आपके आधार पर e-District का OTP आया है!
                  </h4>
                  <p className="text-xs text-yellow-100 mt-0.5">
                    आवेदन "{activeOtpApp.serviceName}" भरने हेतु दुकानदार को तुरंत 6-अंकों का OTP भेजें:
                  </p>
                </div>
              </div>

              <form onSubmit={handleCustomerSubmitOtp} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={incomingOtpInput}
                  onChange={(e) => setIncomingOtpInput(e.target.value)}
                  placeholder="6-अंकों का OTP"
                  className="px-3 py-2 rounded-xl bg-white text-slate-900 font-mono font-black text-sm w-36 text-center border-2 border-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingOtp}
                  className="bg-slate-950 hover:bg-black text-white font-black px-4 py-2 rounded-xl text-xs transition shadow-md"
                >
                  {submittingOtp ? 'भेज रहे हैं...' : 'OTP भेजें ➔'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SANCHALAK B2B BALANCE ALERT BANNER (OPERATOR MODE) */}
        {mode === 'admin' && isCafeAuth && !isStaffAuth && sanchalakB2bBalance < 200 && (
          <div className="mb-6 bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h4 className="font-black text-base sm:text-lg">
                  अत्यावश्यक: आपका B2B बैलेंस समाप्त (शेष: ₹{sanchalakB2bBalance})!
                </h4>
                <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-2xl">
                  न्यूनतम थ्रेशोल्ड सीमा ₹200 से कम होने के कारण वाहन RC Parivahan Download जैसी स्वचालित सेवाएं ऑटो-ऑफलाइन हो गई हैं। तुरंत 12-अंकीय UTR भेजकर B2B रिचार्ज करें।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsB2bWalletOpen(true)}
              className="bg-white hover:bg-yellow-300 text-red-900 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg transition shrink-0 active:scale-95 cursor-pointer"
            >
              तुरंत B2B रिचार्ज करें (₹200+) ➔
            </button>
          </div>
        )}

        {/* SANCHALAK CAFE SUSPENDED BANNER (OPERATOR MODE) */}
        {mode === 'admin' && isCafeAuth && selectedCafe?.isFrozen && (
          <div className="mb-6 bg-red-900 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-red-500 flex items-start gap-3">
            <span className="text-2xl">⛔</span>
            <div>
              <h4 className="font-black text-base">
                कैफे लाइसेंस अस्थायी रूप से निलंबित (Cafe License Suspended)!
              </h4>
              <p className="text-xs text-red-200 mt-0.5">
                कारण: {selectedCafe?.frozenReason || 'सुपर एडमिन ऑडिट अनुपालन उल्लंघन'}। केंद्रीय टीम से संपर्क करें।
              </p>
            </div>
          </div>
        )}

        {/* SANCHALAK COMPLIANCE NOTICE BANNER (OPERATOR MODE) */}
        {mode === 'admin' && isCafeAuth && selectedCafe?.warnings && selectedCafe.warnings.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-yellow-300 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-black text-base">
                  सुपर एडमिन आधिकारिक अनुपालन चेतावनी (Compliance Notice)
                </h4>
                <p className="text-xs text-amber-100">
                  सुपर एडमिन द्वारा आपके कैफे के विरुद्ध उठाई गई शिकायतों के आधार पर आधिकारिक नोटिस जारी किया गया है:
                </p>
                <div className="mt-2 space-y-2">
                  {selectedCafe.warnings.map((w, idx) => (
                    <div key={w.id || idx} className="bg-black/30 p-3 rounded-xl border border-white/20 text-xs">
                      <p className="font-bold">{w.message}</p>
                      <span className="text-[10px] text-yellow-200 block mt-1">
                        जारीकर्ता: {w.issuedBy} • {new Date(w.issuedAt).toLocaleString('hi-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* UNIVERSAL BACK & BREADCRUMB NAVIGATION BAR (Requirement: Back button on every page) */}
        {/* =================================================================== */}
        {isSubPage && (
          <div className="no-print mb-4 sm:mb-6 bg-white/95 dark:bg-[#0c162c]/95 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleUniversalBack}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer group"
                title={language === 'hi' ? 'पिछले पेज पर वापस जाएं' : 'Go back to previous page'}
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:-translate-x-1 transition-transform" />
                <span>{language === 'hi' ? '← वापस जाएं' : '← Go Back'}</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="hover:text-orange-600 dark:hover:text-orange-400 transition flex items-center gap-1 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>
                    {mode === 'superadmin' 
                      ? (language === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal')
                      : mode === 'admin'
                      ? (language === 'hi' ? 'दुकानदार डैशबोर्ड' : 'Operator Dashboard')
                      : (language === 'hi' ? 'मुख्य पृष्ठ' : 'Home')}
                  </span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-black text-orange-600 dark:text-orange-400">
                  {getCurrentPageTitle()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoHome}
              className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ml-auto border border-slate-200 dark:border-slate-700 active:scale-95 shadow-2xs"
              title={language === 'hi' ? 'मुख्य डैशबोर्ड पर जाएं' : 'Go to main dashboard'}
            >
              <Home className="w-3.5 h-3.5 text-orange-500" />
              <span>{mode === 'admin' ? (language === 'hi' ? 'डैशबोर्ड' : 'Dashboard') : (language === 'hi' ? 'होम पेज' : 'Home')}</span>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* TIER 1: CUSTOMER / CITIZEN PUBLIC PORTAL */}
        {/* =================================================================== */}
        {mode === 'customer' && (
          <>
            {(customerTab === 'home' || customerTab === 'dashboard') && (
              <RekhaDashboard
                onSelectTool={(toolKey) => {
                  if (toolKey === 'quick-print' || toolKey === 'print') {
                    setCustomerTab('print');
                  } else {
                    handleLaunchService(toolKey);
                  }
                }}
                onSelectCategory={handleSelectCategory}
                onNavigateTab={(tab) => {
                  if (tab === 'quick-print' || tab === 'print') {
                    setCustomerTab('print');
                  } else {
                    setCustomerTab(tab);
                  }
                }}
                selectedCafe={selectedCafe}
                walletBalance={walletBalance}
                sanchalakB2bBalance={sanchalakB2bBalance}
                isOperator={false}
                onOpenWallet={() => setIsWalletOpen(true)}
                onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
                onOpenStandee={() => setIsStandeeOpen(true)}
                onOpenCustomerProfile={handleOpenCustomerProfile}
                onOpenShopkeeperLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'cafe' })}
                onOpenSuperAdminLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'superadmin' })}
                onOpenCustomerLogin={(toolId) => setRoleAuthModalConfig({ isOpen: true, type: 'customer', pendingTool: toolId || null })}
                customerSession={customerSession}
                disabledTools={toolSettings.disabledTools}
                toolStatus={toolSettings.toolStatus}
                theme={theme}
                isSuperAdminAuth={isSuperAdminAuth}
                services79Rates={services79Rates}
              />
            )}

            {customerTab === 'category' && (
              <CategoryPage
                category={selectedCategory || SERVICE_CATEGORIES[0]}
                catalog={getMergedServicesCatalog(services79Rates)}
                onSelectService={(serviceId) => {
                  handleLaunchService(serviceId);
                }}
                onBack={() => setCustomerTab('home')}
                theme={theme}
              />
            )}

            {customerTab === 'portalhome' && (
              <CustomerHome
                settings={settings}
                selectedCafe={selectedCafe}
                cafesCount={cafes.length}
                onNavigate={(tab) => setCustomerTab(tab)}
                onOpenStandee={() => setIsStandeeOpen(true)}
                onOpenKyc={() => setIsKycModalOpen(true)}
              />
            )}

            {(customerTab === 'tool' || customerTab.startsWith('tool-')) && (
              <ServicePage
                activeToolId={customerTab.startsWith('tool-') ? customerTab.replace('tool-', '') : activeInstantToolId}
                onSelectTool={(toolId) => {
                  setActiveInstantToolId(toolId);
                  setCustomerTab('tool');
                }}
                onBack={() => {
                  if (selectedCategory) {
                    setCustomerTab('category');
                  } else {
                    setCustomerTab('home');
                  }
                }}
                selectedCafe={selectedCafe}
                customerSession={customerSession}
                walletBalance={walletBalance}
                sanchalakB2bBalance={sanchalakB2bBalance}
                isOperator={false}
                onOpenWallet={() => setIsWalletOpen(true)}
                onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
                onOpenAuthModal={() => setRoleAuthModalConfig({ isOpen: true, type: 'customer' })}
                onBalanceUpdated={() => {
                  fetchWalletBalance();
                  fetchB2bWallet();
                }}
                disabledTools={toolSettings.disabledTools}
                theme={theme}
                services79Rates={services79Rates}
              />
            )}

            {customerTab === 'orders' && (
              <RekhaOrders
                onSelectTool={(toolKey) => {
                  setActiveInstantToolId(toolKey);
                  setCustomerTab('tool');
                }}
                onBack={() => setCustomerTab('home')}
              />
            )}

            {customerTab === 'print' && (
              <QuickPrint
                settings={settings}
                selectedCafe={selectedCafe}
                onPrintSubmitted={fetchPendingCounts}
              />
            )}

            {customerTab === 'apply' && (
              <ServiceApply
                settings={settings}
                selectedCafe={selectedCafe}
                preselectedService={preselectedService}
                onApplicationSubmitted={() => {}}
                onOpenJanSevaStudio={(sId) => {
                  setSelectedJanSevaId(sId);
                  setJanSevaModalOpen(true);
                }}
              />
            )}

            {customerTab === 'track' && (
              <StatusTracker settings={settings} />
            )}

            {customerTab === 'resizer' && (
              <ImageResizerTool />
            )}

            {customerTab === 'pdf' && (
              <PdfMergerTool />
            )}

            {customerTab === 'printportal' && (
              <PrintPortalCards preloadedCard={preloadedPvcCard} />
            )}

            {customerTab === 'rc' && (
              <VehicleRCDownload
                selectedCafe={selectedCafe}
                settings={settings}
                customerPhone={customerSession?.phone || ''}
                customerWalletBalance={walletBalance}
                onOpenWallet={() => setIsWalletOpen(true)}
                onCustomerBalanceUpdated={fetchWalletBalance}
                onB2bBalanceUpdated={fetchB2bWallet}
                onOpenPvcPortal={(pvcData) => {
                  setPreloadedPvcCard(pvcData);
                  setCustomerTab('printportal');
                }}
                onOpenB2bTopUp={() => setIsB2bWalletOpen(true)}
              />
            )}
          </>
        )}

        {/* =================================================================== */}
        {/* TIER 2: CYBER CAFE OPERATOR / VLE SANCHALAK PORTAL */}
        {/* =================================================================== */}
        {mode === 'admin' && (
          !isCafeAuth ? (
            <OperatorGateway
              selectedCafe={selectedCafe}
              onLoginSuccess={(cafeData, isStaff) => {
                setIsCafeAuth(true);
                setIsStaffAuth(Boolean(isStaff));
                if (cafeData) setSelectedCafe(cafeData);
                if (isStaff) {
                  setAdminTab('prints');
                }
              }}
              onOpenKyc={() => setIsKycModalOpen(true)}
              onBackToCitizen={() => navigateToTier('customer')}
            />
          ) : (
            <>
              {(adminTab === 'dashboard' || adminTab === 'home') && (
                <RekhaDashboard
                  isOperator={true}
                  onSelectTool={(toolKey) => {
                    if (toolKey === 'quick-print' || toolKey === 'print') {
                      setAdminTab('prints');
                    } else {
                      handleLaunchService(toolKey);
                    }
                  }}
                  onSelectCategory={handleSelectCategory}
                  onNavigateTab={(tab) => {
                    if (tab === 'quick-print' || tab === 'print') {
                      setAdminTab('prints');
                    } else {
                      setAdminTab(tab);
                    }
                  }}
                  selectedCafe={selectedCafe}
                  walletBalance={walletBalance}
                  sanchalakB2bBalance={sanchalakB2bBalance}
                  onOpenWallet={() => setIsWalletOpen(true)}
                  onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
                  onOpenStandee={() => setIsStandeeOpen(true)}
                  onOpenCustomerProfile={handleOpenCustomerProfile}
                  onOpenShopkeeperLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'cafe' })}
                  onOpenSuperAdminLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'superadmin' })}
                  onOpenCustomerLogin={() => setRoleAuthModalConfig({ isOpen: true, type: 'customer' })}
                  customerSession={customerSession}
                  disabledTools={toolSettings.disabledTools}
                  toolStatus={toolSettings.toolStatus}
                  theme={theme}
                  isSuperAdminAuth={isSuperAdminAuth}
                  services79Rates={services79Rates}
                />
              )}

              {adminTab === 'category' && (
                <CategoryPage
                  category={selectedCategory || SERVICE_CATEGORIES[0]}
                  catalog={getMergedServicesCatalog(services79Rates)}
                  onSelectService={(serviceId) => {
                    handleLaunchService(serviceId);
                  }}
                  onBack={() => setAdminTab('dashboard')}
                  theme={theme}
                />
              )}

              {(adminTab === 'tool' || adminTab.startsWith('tool-')) && (
                <ServicePage
                  activeToolId={adminTab.startsWith('tool-') ? adminTab.replace('tool-', '') : activeInstantToolId}
                  onSelectTool={(toolId) => {
                    setActiveInstantToolId(toolId);
                    setAdminTab('tool');
                  }}
                  onBack={() => {
                    if (selectedCategory) {
                      setAdminTab('category');
                    } else {
                      setAdminTab('dashboard');
                    }
                  }}
                  selectedCafe={selectedCafe}
                  customerSession={customerSession}
                  walletBalance={walletBalance}
                  sanchalakB2bBalance={sanchalakB2bBalance}
                  isOperator={true}
                  onOpenWallet={() => setIsWalletOpen(true)}
                  onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
                  onBalanceUpdated={() => {
                    fetchWalletBalance();
                    fetchB2bWallet();
                  }}
                  disabledTools={toolSettings.disabledTools}
                  theme={theme}
                  services79Rates={services79Rates}
                />
              )}

              {adminTab === 'orders' && (
                <RekhaOrders
                  onSelectTool={(toolKey) => {
                    setActiveInstantToolId(toolKey);
                    setAdminTab('tool');
                  }}
                  onBack={() => setAdminTab('dashboard')}
                />
              )}

              {adminTab === 'prints' && (
                <AdminPrintQueue
                  selectedCafe={selectedCafe}
                  onUpdateCounts={fetchPendingCounts}
                />
              )}

              {adminTab === 'applications' && (
                <AdminApplications
                  selectedCafe={selectedCafe}
                  onUpdateCounts={fetchPendingCounts}
                />
              )}

              {!isStaffAuth && adminTab === 'cashbook' && (
                <AdminCashbook
                  settings={settings}
                  selectedCafe={selectedCafe}
                />
              )}

              {!isStaffAuth && adminTab === 'udhar' && (
                <UdharRegister
                  settings={settings}
                  selectedCafe={selectedCafe}
                />
              )}

              {!isStaffAuth && adminTab === 'printportal' && (
                <PrintPortalCards preloadedCard={preloadedPvcCard} />
              )}

              {!isStaffAuth && adminTab === 'rc' && (
                <VehicleRCDownload
                  selectedCafe={selectedCafe}
                  settings={settings}
                  customerPhone={customerSession?.phone || ''}
                  customerWalletBalance={walletBalance}
                  onOpenWallet={() => setIsWalletOpen(true)}
                  onCustomerBalanceUpdated={fetchWalletBalance}
                  onB2bBalanceUpdated={fetchB2bWallet}
                  onOpenPvcPortal={(pvcData) => {
                    setPreloadedPvcCard(pvcData);
                    setAdminTab('printportal');
                  }}
                  onOpenB2bTopUp={() => setIsB2bWalletOpen(true)}
                />
              )}

              {!isStaffAuth && adminTab === 'complaints' && (
                <AdminComplaints selectedCafe={selectedCafe} />
              )}

              {adminTab === 'resizer' && (
                <ImageResizerTool />
              )}

              {adminTab === 'pdf' && (
                <PdfMergerTool />
              )}

              {!isStaffAuth && adminTab === 'customers' && (
                <CustomerVault selectedCafe={selectedCafe} />
              )}

              {!isStaffAuth && adminTab === 'portals' && (
                <PortalsDirectory />
              )}

              {!isStaffAuth && adminTab === 'settings' && (
                <AdminSettings
                  settings={settings}
                  onSettingsUpdated={(newSet) => setSettings(newSet)}
                  onOpenStandee={() => setIsStandeeOpen(true)}
                  selectedCafe={selectedCafe}
                  onOpenB2bWallet={() => setIsB2bWalletOpen(true)}
                  onOpenLicenseCertificate={() => setIsLicenseModalOpen(true)}
                  onOpenKycModal={() => setIsKycModalOpen(true)}
                />
              )}
            </>
          )
        )}

        {/* =================================================================== */}
        {/* TIER 3: MASTER SUPER ADMIN PORTAL (Private Root SaaS Control) */}
        {/* =================================================================== */}
        {mode === 'superadmin' && (
          !isSuperAdminAuth ? (
            <SuperAdminGateway
              onLoginSuccess={() => {
                setIsSuperAdminAuth(true);
              }}
              onBackToCitizen={() => navigateToTier('customer')}
            />
          ) : (
            <SuperAdminPanel 
              theme={theme} 
              onToolStatusUpdated={fetchToolSettings} 
              onRatesUpdated={fetchServices79Rates}
              onBackToPortal={() => navigateToTier('customer')}
            />
          )
        )}

      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Tier 1 Customer View Only) */}
      {mode === 'customer' && (
        <nav className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 ${theme === 'dark' ? 'bg-[#0f172a]/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-600'} backdrop-blur-md border-t py-2 px-3 flex items-center justify-around shadow-lg no-print`}>
          <button
            onClick={() => setCustomerTab('home')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
              customerTab === 'home' ? 'text-orange-600 dark:text-orange-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🏠</span>
            <span>{t('bottom_home')}</span>
          </button>

          <button
            onClick={() => setCustomerTab('print')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
              customerTab === 'print' ? 'text-orange-600 dark:text-orange-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🖨️</span>
            <span>{t('bottom_print')}</span>
          </button>

          <button
            onClick={() => setCustomerTab('apply')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
              customerTab === 'apply' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-base leading-none">📄</span>
            <span>{t('bottom_apply')}</span>
          </button>

          <button
            onClick={() => setCustomerTab('track')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
              customerTab === 'track' ? 'text-amber-500 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🔍</span>
            <span>{t('bottom_track')}</span>
          </button>

          <button
            onClick={() => setCustomerTab('rc')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
              customerTab === 'rc' ? 'text-orange-600 dark:text-orange-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🚗</span>
            <span>{t('bottom_rc')}</span>
          </button>
        </nav>
      )}

      {/* Clean Authentic Footer */}
      <footer className={`no-print bg-white dark:bg-[#0b1528] border-t border-slate-200 dark:border-slate-800 mt-auto py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200 ${mode === 'customer' ? 'pb-24 sm:pb-6' : ''}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {selectedCafe?.shopName || settings?.shopName || (language === 'hi' ? 'डिजिटल सेवा केंद्र' : 'Digital Service Hub')}
            </span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400">{selectedCafe?.address || settings?.address || (language === 'hi' ? 'ऑनलाइन नागरिक सेवा केंद्र' : 'Citizen Online Service Center')}</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{language === 'hi' ? '🔒 24 घंटे में दस्तावेज़ स्वतः नष्ट' : '🔒 Documents auto-deleted in 24 hrs'}</span>
          </div>

          {/* Discreet 3-Tier Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {mode !== 'customer' && (
              <button
                type="button"
                onClick={() => navigateToTier('customer')}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'hi' ? '← नागरिक पोर्टल' : '← Citizen Portal'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigateToTier('admin')}
              className={`hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition flex items-center gap-1 cursor-pointer ${
                mode === 'admin' ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
              title={language === 'hi' ? 'दुकानदार व CSC VLE काउंटर डेस्क लॉगिन' : 'Shopkeeper & VLE Counter Login'}
            >
              <span>{language === 'hi' ? '🏪 दुकानदार काउंटर प्रवेश' : '🏪 Shopkeeper Counter'}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <button
              type="button"
              onClick={() => navigateToTier('superadmin')}
              className={`hover:text-amber-500 font-semibold transition flex items-center gap-1 cursor-pointer ${
                mode === 'superadmin' ? 'text-amber-500 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
              title={language === 'hi' ? 'केंद्रीय सुपर एडमिन रूट लॉगिन' : 'Super Admin Root Login'}
            >
              <span>{language === 'hi' ? '🛡️ सुपर एडमिन' : '🛡️ Super Admin'}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            <button
              type="button"
              onClick={() => setShowServerConfigModal(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[11px] transition cursor-pointer"
              title="मोबाइल ऐप सर्वर IP कॉन्फ़िगर करें"
            >
              📱 मोबाइल सेटिंग्स
            </button>

            {settings?.phone && (
              <>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <a
                  href={`https://wa.me/91${settings.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold"
                >
                  WhatsApp: +91 {settings.phone}
                </a>
              </>
            )}
          </div>
        </div>
      </footer>
      </div>

      {/* Standee Poster Modal */}
      <ShopStandeeModal
        isOpen={isStandeeOpen}
        onClose={() => setIsStandeeOpen(false)}
        settings={settings}
        selectedCafe={selectedCafe}
      />

      {/* Customer Wallet Modal */}
      <CustomerWalletModal
        isOpen={isWalletOpen}
        onClose={() => {
          setIsWalletOpen(false);
          fetchWalletBalance();
        }}
        currentPhone={customerSession?.phone || localStorage.getItem('last_wallet_phone') || '9876543210'}
        shopUpi={selectedCafe?.upiId || settings?.upiId}
        selectedCafe={selectedCafe}
        onBalanceUpdated={(newBal) => {
          setWalletBalance(newBal);
          if (!customerSession) {
            const guestUser = { phone: '9876543210', name: 'सत्यापित उपभोक्ता', role: 'customer' };
            setCustomerSession(guestUser);
            localStorage.setItem('cybercafe_customer', JSON.stringify(guestUser));
          }
        }}
      />

      {/* Cafe Selector Modal */}
      <CafeSelectorModal
        isOpen={isCafeSelectorOpen}
        onClose={() => setIsCafeSelectorOpen(false)}
        selectedCafe={selectedCafe}
        onOpenKyc={mode === 'admin' ? () => setIsKycModalOpen(true) : null}
        onSelectCafe={(c) => {
          setSelectedCafe(c);
          localStorage.setItem('selectedCafeId', c.id);
        }}
      />

      {/* Customer Help & Complaints Modal */}
      <CustomerComplaintsModal
        isOpen={isCustomerComplaintsOpen}
        onClose={() => setIsCustomerComplaintsOpen(false)}
        selectedCafe={selectedCafe}
        customerSession={customerSession}
      />

      {/* Sanchalak B2B Wallet Top-Up Modal */}
      <AdminB2BWalletModal
        isOpen={isB2bWalletOpen}
        onClose={() => {
          setIsB2bWalletOpen(false);
          fetchB2bWallet();
        }}
        selectedCafe={selectedCafe}
        onB2bUpdated={(newBal) => {
          setSanchalakB2bBalance(newBal);
          fetchB2bWallet();
          fetchSettingsAndCafes();
        }}
        onBalanceUpdated={() => {
          fetchB2bWallet();
          fetchSettingsAndCafes();
        }}
      />

      {/* Customer 12-Digit UTR Approval Queue Modal */}
      <AdminUtrApprovalModal
        isOpen={isUtrApprovalOpen}
        onClose={() => setIsUtrApprovalOpen(false)}
        selectedCafe={selectedCafe}
        onApproved={() => {
          fetchPendingUtrs();
          fetchWalletBalance();
        }}
      />

      {/* Official 365-Day Digital License Certificate Modal */}
      <LicenseCertificateModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        selectedCafe={selectedCafe}
      />

      {/* Chain-to-Chain ₹299 VLE KYC Onboarding Modal */}
      <VleKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        selectedCafe={selectedCafe}
        settings={settings}
        onKycSubmitted={(cafe) => {
          fetchSettingsAndCafes();
        }}
        onActivationLogin={(cafe) => {
          setIsCafeAuth(true);
          setMode('cafe');
          if (cafe) setSelectedCafe(cafe);
          fetchSettingsAndCafes();
        }}
      />

      {/* 3-Role Authentication Modal (Customer Profile & Dialog Fallbacks) */}
      <RoleAuthModal
        isOpen={roleAuthModalConfig.isOpen}
        type={roleAuthModalConfig.type}
        onClose={() => setRoleAuthModalConfig({ isOpen: false, type: 'customer' })}
        selectedCafe={selectedCafe}
        onOpenKyc={() => setIsKycModalOpen(true)}
        onSuperAdminSuccess={() => {
          setIsSuperAdminAuth(true);
          setMode('superadmin');
        }}
        onCafeSuccess={(cafeData, isStaff) => {
          setIsCafeAuth(true);
          setIsStaffAuth(Boolean(isStaff));
          if (cafeData) setSelectedCafe(cafeData);
          if (isStaff) {
            setAdminTab('prints');
          }
          setMode('admin');
          if (roleAuthModalConfig.pendingTool) {
            const pt = roleAuthModalConfig.pendingTool;
            setRoleAuthModalConfig({ isOpen: false, type: 'cafe', pendingTool: null });
            setActiveInstantToolId(pt);
            setAdminTab('tool');
          }
        }}
        onCustomerSuccess={(custData) => {
          setCustomerSession(custData);
          fetchWalletBalance(custData?.phone);
          if (roleAuthModalConfig.pendingTool) {
            const pt = roleAuthModalConfig.pendingTool;
            setRoleAuthModalConfig({ isOpen: false, type: 'customer', pendingTool: null });
            setActiveInstantToolId(pt);
            setCustomerTab('tool');
          }
        }}
      />

      {/* Universal User & Operator Profile & Security Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={
          customerSession || (isCafeAuth && selectedCafe ? {
            id: selectedCafe.id,
            name: selectedCafe.shopName || selectedCafe.ownerName || 'संचालक',
            shopName: selectedCafe.shopName || '',
            phone: selectedCafe.phone || '',
            role: 'cafe',
            balance: sanchalakB2bBalance || selectedCafe.b2bWallet?.balance || 0,
            password: selectedCafe.pin || '1234'
          } : (() => {
            try {
              return JSON.parse(localStorage.getItem('smartcafe_user') || 'null');
            } catch {
              return null;
            }
          })())
        }
        onLogout={handleLogout}
        onUserUpdated={(updatedUser) => {
          if (updatedUser?.role === 'cafe') {
            if (selectedCafe) setSelectedCafe(prev => ({ ...prev, ...updatedUser }));
          } else {
            setCustomerSession(updatedUser);
          }
        }}
        onOpenWalletModal={() => {
          if (isCafeAuth) {
            setIsB2bWalletOpen(true);
          } else {
            setIsWalletOpen(true);
          }
        }}
      />

      {/* Configurable Mobile Server Endpoint Modal */}
      {showServerConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-sm">📱 मोबाइल ऐप सर्वर सेटिंग्स</h4>
              <button 
                onClick={() => setShowServerConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              कंप्यूटर पर चल रहे पोर्टल से जुड़ने के लिए सर्वर का IP पता व पोर्ट दर्ज करें (जैसे <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">http://192.168.1.5:5000</code>)।
            </p>
            <div className="space-y-2">
              <input
                type="url"
                value={serverUrlInput}
                onChange={(e) => setServerUrlInput(e.target.value)}
                placeholder="http://192.168.1.5:5000"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setServerBaseUrl('');
                  setServerUrlInput('');
                  setShowServerConfigModal(false);
                  fetchSettingsAndCafes();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                डिफ़ॉल्ट
              </button>
              <button
                type="button"
                onClick={() => {
                  setServerBaseUrl(serverUrlInput);
                  setShowServerConfigModal(false);
                  fetchSettingsAndCafes();
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                सुरक्षित करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jan Seva Instant Studio Modal */}
      <JanSevaModal
        isOpen={janSevaModalOpen}
        onClose={() => setJanSevaModalOpen(false)}
        initialServiceId={selectedJanSevaId}
        selectedCafe={selectedCafe}
        settings={settings}
      />

      {/* 1-Click Floating Scroll Control Widget (Top / Bottom / % Indicator) */}
      <ScrollToTopWidget />

    </div>
  );
}
