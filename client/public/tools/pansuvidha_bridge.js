/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ SMART CAFE (smartcafe.sbs) — PANSUVIDHA 1-CLICK AUTOFILL BRIDGE v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * Standalone Cross-Portal Autofill Engine for Form 49A (UTIITSL / Protean NSDL / PanSuvidha).
 * Can be executed via Browser Bookmarklet, Chrome Extension, or DevTools Console.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__SMARTCAFE_PAN_BRIDGE_LOADED__) {
    const existingHud = document.getElementById('smartcafe-pansuvidha-hud');
    if (existingHud) {
      existingHud.style.display = 'block';
      existingHud.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  window.__SMARTCAFE_PAN_BRIDGE_LOADED__ = true;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SMART FIELD DETECTION & SYNTHETIC VALUE INJECTION
  // ─────────────────────────────────────────────────────────────────────────
  function setFieldValue(element, value) {
    if (!element || value === undefined || value === null) return false;
    try {
      element.focus();
      if (element.tagName === 'SELECT') {
        let matched = false;
        const valUpper = String(value).trim().toUpperCase();
        for (let i = 0; i < element.options.length; i++) {
          const opt = element.options[i];
          const optText = opt.text.trim().toUpperCase();
          const optVal = opt.value.trim().toUpperCase();
          if (optVal === valUpper || optText === valUpper || optText.includes(valUpper) || valUpper.includes(optText)) {
            element.selectedIndex = i;
            element.value = opt.value;
            matched = true;
            break;
          }
        }
        if (!matched && element.options.length > 0) {
          element.value = value;
        }
      } else if (element.type === 'radio' || element.type === 'checkbox') {
        element.checked = Boolean(value);
      } else {
        // Text / Number / Tel / Date input
        element.value = String(value);
      }

      // Fire full chain of synthetic DOM events for React/Angular/Vue/jQuery compatibility
      element.dispatchEvent(new Event('focus', { bubbles: true }));
      element.dispatchEvent(new Event('keydown', { bubbles: true }));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('keyup', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));

      // Visual feedback: Subtle Emerald Glow
      element.style.transition = 'all 0.3s ease';
      element.style.borderColor = '#10b981';
      element.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.25)';
      return true;
    } catch (e) {
      console.warn('[SmartCafe Bridge] Error setting field:', element, e);
      return false;
    }
  }

  function findElement(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch {}
    }
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CORE AUTOFILL ROUTINE
  // ─────────────────────────────────────────────────────────────────────────
  function executeAutofill(payload) {
    if (!payload || typeof payload !== 'object') {
      alert('⚠️ अमान्य डेटा (Invalid Payload)! कृपया Smart Cafe से कॉपी किया गया JSON पेस्ट करें।');
      return { count: 0, total: 0 };
    }

    const personal = payload.personal || payload;
    const address = payload.address || payload;
    const aoCode = payload.aoCode || payload;
    const identity = payload.identity || payload;

    let filledCount = 0;

    // Field Rules Map
    const rules = [
      // Title
      {
        val: personal.title || 'Shri',
        selectors: ['select[name*="title" i]', 'select[id*="title" i]', 'select[name*="salutation" i]', '#salutation', '#ddlTitle']
      },
      // Last Name (Mandatory)
      {
        val: personal.lastName || personal.last_name || personal.surname,
        selectors: ['input[name*="lastName" i]', 'input[id*="lastName" i]', 'input[name*="last_name" i]', 'input[name*="surname" i]', '#txtLastName', '#txtSurname']
      },
      // First Name
      {
        val: personal.firstName || personal.first_name,
        selectors: ['input[name*="firstName" i]', 'input[id*="firstName" i]', 'input[name*="first_name" i]', '#txtFirstName']
      },
      // Middle Name
      {
        val: personal.middleName || personal.middle_name,
        selectors: ['input[name*="middleName" i]', 'input[id*="middleName" i]', 'input[name*="middle_name" i]', '#txtMiddleName']
      },
      // DOB
      {
        val: personal.dob || personal.birthDate,
        selectors: ['input[name*="dob" i]', 'input[id*="dob" i]', 'input[name*="birth" i]', '#txtDOB', '#txtDateOfBirth']
      },
      // Gender
      {
        val: personal.gender || 'Male',
        selectors: ['select[name*="gender" i]', 'select[id*="gender" i]', '#ddlGender', '#gender']
      },
      // Father's Last Name
      {
        val: personal.fatherLastName || personal.fatherName,
        selectors: ['input[name*="fatherLastName" i]', 'input[id*="fatherLastName" i]', 'input[name*="father_last" i]', '#txtFatherLastName']
      },
      // Father's First Name
      {
        val: personal.fatherFirstName,
        selectors: ['input[name*="fatherFirstName" i]', 'input[id*="fatherFirstName" i]', 'input[name*="father_first" i]', '#txtFatherFirstName']
      },
      // Mobile Number
      {
        val: personal.mobile || payload.appliedBy,
        selectors: ['input[name*="mobile" i]', 'input[id*="mobile" i]', 'input[name*="phone" i]', 'input[name*="contact" i]', '#txtMobile']
      },
      // Email
      {
        val: personal.email,
        selectors: ['input[name*="email" i]', 'input[id*="email" i]', '#txtEmail']
      },
      // Flat / Door No
      {
        val: address.flat || address.flat_no || address.houseNo,
        selectors: ['input[name*="flat" i]', 'input[id*="flat" i]', 'input[name*="door" i]', '#txtFlatNo', '#txtFlat']
      },
      // Premises / Village
      {
        val: address.premises || address.building || address.village,
        selectors: ['input[name*="premises" i]', 'input[id*="premises" i]', 'input[name*="building" i]', 'input[name*="village" i]', '#txtPremises']
      },
      // Road / Street
      {
        val: address.street || address.road,
        selectors: ['input[name*="street" i]', 'input[id*="street" i]', 'input[name*="road" i]', '#txtStreet']
      },
      // Locality / Area
      {
        val: address.locality || address.area,
        selectors: ['input[name*="locality" i]', 'input[id*="locality" i]', 'input[name*="area" i]', '#txtLocality']
      },
      // Town / City
      {
        val: address.city || address.town || address.district,
        selectors: ['input[name*="city" i]', 'input[id*="city" i]', 'input[name*="town" i]', 'input[name*="district" i]', '#txtCity']
      },
      // State
      {
        val: address.state,
        selectors: ['select[name*="state" i]', 'select[id*="state" i]', '#ddlState', '#state']
      },
      // Pincode
      {
        val: address.pincode || address.pin,
        selectors: ['input[name*="pin" i]', 'input[id*="pin" i]', 'input[name*="zip" i]', '#txtPinCode', '#txtPincode']
      },
      // AO Area Code
      {
        val: aoCode.areaCode || aoCode.area_code,
        selectors: ['input[name*="areaCode" i]', 'input[id*="areaCode" i]', 'input[name*="area_code" i]', '#txtAreaCode']
      },
      // AO Type
      {
        val: aoCode.aoType || aoCode.ao_type,
        selectors: ['input[name*="aoType" i]', 'input[id*="aoType" i]', 'input[name*="ao_type" i]', '#txtAOType']
      },
      // AO Range Code
      {
        val: aoCode.rangeCode || aoCode.range_code,
        selectors: ['input[name*="rangeCode" i]', 'input[id*="rangeCode" i]', 'input[name*="range_code" i]', '#txtRangeCode']
      },
      // AO Number
      {
        val: aoCode.aoNumber || aoCode.ao_number || aoCode.aoNo,
        selectors: ['input[name*="aoNumber" i]', 'input[id*="aoNumber" i]', 'input[name*="ao_no" i]', '#txtAONumber', '#txtAONo']
      },
      // Aadhaar Number
      {
        val: identity.aadhaarNumber || identity.aadhaar_number || identity.aadhaar,
        selectors: ['input[name*="aadhaar" i]', 'input[id*="aadhaar" i]', 'input[name*="uid" i]', '#txtAadhaarNo', '#txtAadhar']
      },
      // Name on Aadhaar
      {
        val: identity.nameOnAadhaar || identity.name_on_aadhaar,
        selectors: ['input[name*="nameOnAadhaar" i]', 'input[id*="nameOnAadhaar" i]', 'input[name*="aadhar_name" i]', '#txtNameAsPerAadhaar']
      },
      // DOB Proof
      {
        val: identity.dobProof || identity.dob_proof,
        selectors: ['select[name*="dobProof" i]', 'select[id*="dobProof" i]', 'select[name*="dob_proof" i]', '#ddlDOBProof', '#ddlProofOfDOB']
      }
    ];

    rules.forEach(rule => {
      if (rule.val) {
        const el = findElement(rule.selectors);
        if (el) {
          const ok = setFieldValue(el, rule.val);
          if (ok) filledCount++;
        }
      }
    });

    return { count: filledCount, total: rules.length };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. FLOATING HUD USER INTERFACE
  // ─────────────────────────────────────────────────────────────────────────
  const hud = document.createElement('div');
  hud.id = 'smartcafe-pansuvidha-hud';
  hud.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 330px;
    background: #0f172a;
    color: #f8fafc;
    border: 2px solid #3b82f6;
    border-radius: 20px;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6);
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding: 16px;
    box-sizing: border-box;
    font-size: 13px;
    transition: all 0.2s ease;
  `;

  hud.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #1e293b; padding-bottom:10px; margin-bottom:12px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">🛡️</span>
        <div>
          <b style="font-size:13px; display:block; color:#ffffff;">Smart Cafe Bridge</b>
          <span style="font-size:10px; color:#94a3b8;">PanSuvidha / UTI / NSDL 1-Click</span>
        </div>
      </div>
      <button id="sc-hud-close" style="background:#1e293b; border:none; color:#cbd5e1; border-radius:8px; width:26px; height:26px; cursor:pointer; font-weight:bold;">✕</button>
    </div>

    <div style="margin-bottom:12px;">
      <label style="font-size:11px; font-weight:bold; color:#cbd5e1; display:block; margin-bottom:4px;">
        आवेदन JSON डेटा (Application JSON):
      </label>
      <textarea id="sc-payload-input" rows="3" placeholder="Smart Cafe से कॉपी किया गया JSON यहाँ पेस्ट करें..." style="width:100%; box-sizing:border-box; background:#020617; border:1px solid #334155; border-radius:10px; padding:8px; color:#38bdf8; font-family:monospace; font-size:11px; resize:none;"></textarea>
    </div>

    <div style="display:flex; gap:6px; margin-bottom:10px;">
      <button id="sc-btn-autofill" style="flex:1; background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#ffffff; border:none; border-radius:12px; padding:10px; font-weight:bold; font-size:12px; cursor:pointer; box-shadow:0 4px 10px rgba(37,99,235,0.3);">
        ⚡ 1-Click ऑटो-फिल (Fill)
      </button>
      <button id="sc-btn-paste" style="background:#1e293b; color:#93c5fd; border:1px solid #334155; border-radius:12px; padding:10px 12px; font-weight:bold; font-size:11px; cursor:pointer;" title="Paste from Clipboard">
        📋 पेस्ट
      </button>
    </div>

    <div id="sc-status-box" style="display:none; padding:8px 10px; border-radius:10px; font-size:11px; margin-bottom:8px; font-weight:bold;"></div>

    <div style="font-size:10px; color:#64748b; text-align:center; border-top:1px solid #1e293b; padding-top:8px;">
      Smart Cafe Cyber Portal • smartcafe.sbs
    </div>
  `;

  document.body.appendChild(hud);

  // HUD Elements
  const closeBtn = document.getElementById('sc-hud-close');
  const payloadInput = document.getElementById('sc-payload-input');
  const autofillBtn = document.getElementById('sc-btn-autofill');
  const pasteBtn = document.getElementById('sc-btn-paste');
  const statusBox = document.getElementById('sc-status-box');

  closeBtn.addEventListener('click', () => {
    hud.style.display = 'none';
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          payloadInput.value = text;
          showStatus('📋 क्लिपबोर्ड से डेटा पेस्ट किया गया!', '#064e3b', '#6ee7b7');
        }
      } else {
        payloadInput.focus();
        showStatus('कृपया Ctrl+V दबाकर पेस्ट करें', '#1e293b', '#93c5fd');
      }
    } catch (e) {
      payloadInput.focus();
      showStatus('कृपया Ctrl+V दबाकर पेस्ट करें', '#1e293b', '#93c5fd');
    }
  });

  autofillBtn.addEventListener('click', () => {
    const raw = payloadInput.value.trim();
    if (!raw) {
      showStatus('⚠️ कृपया पहले JSON डेटा पेस्ट करें!', '#4c0519', '#fda4af');
      return;
    }

    try {
      const data = JSON.parse(raw);
      const res = executeAutofill(data);
      if (res.count > 0) {
        showStatus(`✅ सफलता! ${res.count} फ़ील्ड्स स्वतः भर दिए गए।`, '#064e3b', '#6ee7b7');
      } else {
        showStatus('⚠️ कोई फ़ील्ड मैच नहीं हुआ। कृपया सुनिश्चित करें कि आप Form 49A पेज पर हैं।', '#451a03', '#fcd34d');
      }
    } catch (e) {
      showStatus(`❌ अमान्य JSON: ${e.message}`, '#4c0519', '#fda4af');
    }
  });

  function showStatus(msg, bg, text) {
    statusBox.style.display = 'block';
    statusBox.style.background = bg;
    statusBox.style.color = text;
    statusBox.textContent = msg;
  }

  // Cross-Window PostMessage Listener
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SMARTCAFE_PAN_AUTOFILL') {
      const res = executeAutofill(event.data.payload);
      showStatus(`⚡ 1-क्लिक ऑटो-फिल पूर्ण: ${res.count} फ़ील्ड्स भरे गए!`, '#064e3b', '#6ee7b7');
    }
  });

  console.log('✅ Smart Cafe PanSuvidha Bridge v2.0 initialized successfully.');
})();
