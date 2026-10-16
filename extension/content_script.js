// Smart Cafe e-District 1-Click Auto-Filler Content Script
// Injected on: edistrict.up.gov.in

(function() {
  console.log('[Smart Cafe Bot] Content script active on e-District portal');

  let currentLiveOtp = null;

  // Create floating widget
  function injectFloatingWidget() {
    if (document.getElementById('smartcafe-bot-root')) return;

    const container = document.createElement('div');
    container.id = 'smartcafe-bot-root';
    container.innerHTML = `
      <div id="smartcafe-bot-panel">
        <div class="sc-header">
          <div class="sc-title">
            <span class="sc-pulse"></span>
            <strong>⚡ स्मार्ट कैफे बॉट v1.0</strong>
          </div>
          <button id="sc-toggle-btn" title="मिनिमाइज / मैक्सिमाइज">_</button>
        </div>

        <div id="sc-body" class="sc-body">
          <div class="sc-status-pill">🟢 लाइव सर्वर कनेक्टेड (smartcafe.sbs)</div>

          <!-- Live OTP Badge Section -->
          <div id="sc-otp-card" class="sc-otp-card" style="display: none;">
            <div class="sc-otp-label">🔔 लाइव आधार / फीस OTP:</div>
            <div id="sc-otp-val" class="sc-otp-val">------</div>
            <button id="sc-inject-otp-btn" class="sc-btn sc-btn-otp">⚡ ऑटो-इंजेक्टर (Fill OTP)</button>
          </div>

          <!-- Auto-Fill Controls -->
          <div class="sc-controls">
            <label class="sc-label">ग्राहक डेटा चुनें / दर्ज करें:</label>
            <input type="text" id="sc-cust-phone" placeholder="ग्राहक मोबाइल या टोकन दर्ज करें" class="sc-input" />
            
            <button id="sc-fetch-btn" class="sc-btn sc-btn-secondary">📥 सर्वर से डेटा लोड करें</button>
            <button id="sc-autofill-btn" class="sc-btn sc-btn-primary">⚡ 1-क्लिक में 25+ फील्ड्स भरें</button>
          </div>

          <div id="sc-feedback" class="sc-feedback">तैयार: e-District फॉर्म खोलें और 1-क्लिक में भरें।</div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Bind event handlers
    document.getElementById('sc-toggle-btn').addEventListener('click', toggleWidget);
    document.getElementById('sc-autofill-btn').addEventListener('click', handleAutoFill);
    document.getElementById('sc-fetch-btn').addEventListener('click', handleFetchFromPortal);
    document.getElementById('sc-inject-otp-btn').addEventListener('click', handleInjectOtp);

    // Initial check for live OTP
    chrome.runtime.sendMessage({ action: 'GET_LIVE_OTP' }, (response) => {
      if (response && response.latestLiveOtp) {
        showLiveOtp(response.latestLiveOtp);
      }
    });
  }

  function toggleWidget() {
    const body = document.getElementById('sc-body');
    if (body.style.display === 'none') {
      body.style.display = 'block';
    } else {
      body.style.display = 'none';
    }
  }

  function showLiveOtp(otpData) {
    currentLiveOtp = otpData;
    const card = document.getElementById('sc-otp-card');
    const val = document.getElementById('sc-otp-val');
    if (card && val) {
      card.style.display = 'block';
      val.innerText = otpData.otp || '------';
    }
    // Auto-detect OTP box and inject
    autoDetectAndInjectOtp(otpData.otp);
  }

  // Listen for real-time messages from background service worker
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'NEW_LIVE_OTP' && msg.otpData) {
      showLiveOtp(msg.otpData);
    }
  });

  // Auto-detect OTP input field on eDistrict page and inject
  function autoDetectAndInjectOtp(otp) {
    if (!otp) return;
    const otpSelectors = [
      'input[name*="otp" i]',
      'input[id*="otp" i]',
      'input[name*="OTP" i]',
      'input[name*="txtOtp" i]',
      'input[id*="txtOtp" i]',
      'input[name*="aadhaar_otp" i]'
    ];
    for (const sel of otpSelectors) {
      const el = document.querySelector(sel);
      if (el && el.type !== 'hidden') {
        el.value = otp;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.style.backgroundColor = '#dcfce7';
        el.style.borderColor = '#22c55e';
        el.style.borderWidth = '2px';
        setFeedback(`✓ आधार OTP [ ${otp} ] बॉक्स में ऑटो-फिल कर दिया गया!`);
        break;
      }
    }
  }

  function handleInjectOtp() {
    if (currentLiveOtp && currentLiveOtp.otp) {
      autoDetectAndInjectOtp(currentLiveOtp.otp);
      chrome.runtime.sendMessage({ action: 'MARK_OTP_CONSUMED', otpId: currentLiveOtp.id });
    } else {
      setFeedback('⚠️ वर्तमान में कोई लाइव OTP उपलब्ध नहीं है।');
    }
  }

  let loadedApplicationData = null;

  async function handleFetchFromPortal() {
    const phoneInput = document.getElementById('sc-cust-phone');
    const query = (phoneInput?.value || '').trim();
    setFeedback('सर्वर से डेटा लोड हो रहा है...');

    try {
      const storage = await chrome.storage.local.get(['serverUrl', 'cafeId']);
      const baseUrl = storage.serverUrl || 'https://smartcafe.sbs';
      const cafeId = storage.cafeId || 'CAFE-101';

      const res = await fetch(`${baseUrl}/api/applications?cafeId=${cafeId}`);
      if (res.ok) {
        const apps = await res.json();
        let target = null;
        if (query) {
          target = apps.find(a => (a.phone && a.phone.includes(query)) || (a.id && a.id.toLowerCase().includes(query.toLowerCase())));
        }
        if (!target && apps.length > 0) {
          target = apps[0]; // Most recent application
        }

        if (target) {
          loadedApplicationData = target;
          setFeedback(`✓ लोड हुआ: ${target.customerName || target.name} (${target.serviceName || target.serviceType})`);
          if (phoneInput && target.phone) phoneInput.value = target.phone;
        } else {
          setFeedback('⚠️ कोई आवेदन नहीं मिला। कृपया फ़ोन नंबर जांचें।');
        }
      } else {
        setFeedback('⚠️ सर्वर से कनेक्ट करने में विफल।');
      }
    } catch (e) {
      setFeedback('⚠️ नेटवर्क त्रुटि: ' + e.message);
    }
  }

  function handleAutoFill() {
    const data = loadedApplicationData || {
      applicantNameHi: 'अंकित कुमार',
      applicantNameEn: 'Ankit Kumar',
      fatherNameHi: 'राम प्रसाद',
      fatherNameEn: 'Ram Prasad',
      motherNameHi: 'सुनीता देवी',
      motherNameEn: 'Sunita Devi',
      annualIncome: '45000',
      familyCount: '4',
      occupation: 'मजदूरी / कृषि',
      phone: '8006518960',
      address: 'ग्राम - शाहपुर, पोस्ट - हसनपुर',
      district: 'मुजफ्फरनगर',
      tehsil: 'जानसठ'
    };

    let filledCount = 0;

    // Field mapping matrix for eDistrict Uttar Pradesh forms
    const fieldMap = [
      { keys: ['applicant_name_hi', 'name_hi', 'txtApplicantHindi', 'txthindiname', 'namehi'], val: data.applicantNameHi || data.customerName },
      { keys: ['applicant_name_en', 'name_en', 'txtApplicantEng', 'txtengname', 'nameen'], val: data.applicantNameEn || data.nameEn || data.customerName },
      { keys: ['father_name_hi', 'txtFatherHindi', 'fatherhi', 'txthindifather'], val: data.fatherNameHi || data.fatherName },
      { keys: ['father_name_en', 'txtFatherEng', 'fatheren', 'txtengfather'], val: data.fatherNameEn || data.fatherName },
      { keys: ['mother_name_hi', 'txtMotherHindi', 'motherhi'], val: data.motherNameHi || data.motherName },
      { keys: ['mother_name_en', 'txtMotherEng', 'motheren'], val: data.motherNameEn || data.motherName },
      { keys: ['annual_income', 'txtIncome', 'income', 'txtannualincome'], val: data.annualIncome || data.income || '48000' },
      { keys: ['mobile', 'phone', 'txtMobile', 'txtphone', 'contact'], val: data.phone || data.mobile },
      { keys: ['address', 'txtAddress', 'txtMohalla', 'mohalla', 'address_line'], val: data.address || data.mohalla },
      { keys: ['family_members', 'txtFamily', 'familycount'], val: data.familyCount || '4' },
      { keys: ['profession', 'occupation', 'txtProfession'], val: data.occupation || data.profession || 'कृषि / मजदूरी' },
      { keys: ['aadhaar', 'uid', 'txtAadhaar', 'aadhar'], val: data.aadhaarNo || data.aadhaar }
    ];

    fieldMap.forEach(item => {
      if (!item.val) return;
      for (const k of item.keys) {
        const input = document.querySelector(`input[name*="${k}" i], input[id*="${k}" i], textarea[name*="${k}" i]`);
        if (input && input.type !== 'hidden') {
          input.value = item.val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.style.backgroundColor = '#ecfdf5';
          input.style.borderColor = '#10b981';
          filledCount++;
          break;
        }
      }
    });

    setFeedback(`🎉 1-क्लिक सफलता! ${filledCount} फ़ील्ड्स स्वचालित रूप से भर दी गईं।`);
  }

  function setFeedback(msg) {
    const el = document.getElementById('sc-feedback');
    if (el) el.innerText = msg;
  }

  // Inject once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingWidget);
  } else {
    injectFloatingWidget();
  }
})();
