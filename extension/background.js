// Smart Cafe e-District Auto-Filler Extension - Background Service Worker (Manifest V3)

const DEFAULT_SERVER = 'https://smartcafe.sbs';
let activePollInterval = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SmartCafe Extension] Service Worker installed successfully');
  chrome.storage.local.get(['cafeId', 'serverUrl'], (res) => {
    if (!res.cafeId) {
      chrome.storage.local.set({ cafeId: 'CAFE-101', serverUrl: DEFAULT_SERVER });
    }
  });
});

// Periodic Bridge Polling for Silent Government OTPs
async function pollLiveOtpBridge() {
  try {
    const data = await chrome.storage.local.get(['cafeId', 'serverUrl']);
    const cafeId = data.cafeId || 'CAFE-101';
    const baseUrl = (data.serverUrl || DEFAULT_SERVER).replace(/\/+$/, '');

    const res = await fetch(`${baseUrl}/api/otp/live-bridge/${cafeId}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.otps) && json.otps.length > 0) {
        const latestOtp = json.otps[0];
        chrome.storage.local.set({ latestLiveOtp: latestOtp });
        
        // Notify any active e-District tabs
        chrome.tabs.query({ url: "*://edistrict.up.gov.in/*" }, (tabs) => {
          tabs.forEach(tab => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, {
                action: 'NEW_LIVE_OTP',
                otpData: latestOtp
              }).catch(() => {});
            }
          });
        });
      }
    }
  } catch (err) {
    // Network retry silently
  }
}

// Start continuous polling every 2 seconds
setInterval(pollLiveOtpBridge, 2000);

// ===========================================================================
// REKHA PRINT 100% SILENT B2B AUTO-RELAY & AUTOMATION ENGINE
// ===========================================================================

const REKHA_DEFAULT_CONFIG = {
  username: '8006518960',
  password: '012323',
  baseUrl: 'https://rekhaprint.info',
  adminKey: 'Aa@910010025123343'
};

let isRekhaSyncInProgress = false;
let isRekhaLoggedIn = false;

async function ensureRekhaLogin(baseUrl, username, password) {
  try {
    const loginUrl = `${baseUrl.replace(/\/+$/, '')}/members/login.php`;
    const body = new URLSearchParams({
      username: username || '8006518960',
      password: password || '012323',
      login: 'Login Now'
    });

    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString(),
      credentials: 'include'
    });

    const text = await res.text();
    if (text.includes('Login Successful!') || text.includes('dashboard') || res.ok) {
      isRekhaLoggedIn = true;
      return true;
    }
  } catch (e) {
    console.error('[Rekha Relay] Login error:', e);
  }
  return false;
}

async function syncRekhaManualOrders() {
  if (isRekhaSyncInProgress) return;
  isRekhaSyncInProgress = true;

  try {
    const data = await chrome.storage.local.get(['serverUrl', 'rekhaUsername', 'rekhaPassword', 'rekhaBaseUrl']);
    const smartCafeUrl = (data.serverUrl || DEFAULT_SERVER).replace(/\/+$/, '');
    const username = data.rekhaUsername || REKHA_DEFAULT_CONFIG.username;
    const password = data.rekhaPassword || REKHA_DEFAULT_CONFIG.password;
    const baseUrl = (data.rekhaBaseUrl || REKHA_DEFAULT_CONFIG.baseUrl).replace(/\/+$/, '');
    const adminKey = REKHA_DEFAULT_CONFIG.adminKey;

    // 1. Fetch pending orders from Smart Cafe
    const queueRes = await fetch(`${smartCafeUrl}/api/index.php?endpoint=services/manual-relay/pending-queue`);
    if (!queueRes.ok) {
      isRekhaSyncInProgress = false;
      return;
    }

    const queueData = await queueRes.json();
    const orders = queueData.orders || [];

    if (orders.length === 0) {
      chrome.storage.local.set({
        rekhaRelayStatus: {
          lastSyncAt: new Date().toISOString(),
          active: true,
          pendingCount: 0,
          statusText: '🟢 ऑटो-रिले सक्रिय: कोई पेंडिंग आर्डर नहीं'
        }
      });
      isRekhaSyncInProgress = false;
      return;
    }

    // Ensure session on Rekha Print
    await ensureRekhaLogin(baseUrl, username, password);

    // 2. Auto-dispatch pending orders that have not been dispatched
    for (const ord of orders) {
      if (ord.upstreamDispatched) continue;

      const uService = ord.upstreamService || '';
      const uFile = ord.upstreamFile || 'll_exam_Request.php';
      const p = ord.params || {};

      const postParams = new URLSearchParams();
      postParams.append('submit', 'submit');

      if (uService === 'LL_Request') {
        postParams.append('applicationNumber', ord.refNumber || p.applicationNumber || p.appNo || '');
        postParams.append('dob', p.dob || '');
        postParams.append('password', p.password || '');
        postParams.append('state', p.state || 'UP');
        postParams.append('examsecretpin', p.examsecretpin || '');
      } else if (uService === 'DL Mobile Link') {
        postParams.append('applicationNumber', ord.refNumber || p.applicationNumber || p.dlNo || '');
        postParams.append('password', p.password || '');
        postParams.append('state', p.state || 'UP');
        postParams.append('mobile', p.mobile || ord.customerPhone || '');
      } else if (uService === 'Ayushman Download') {
        postParams.append('uidNumber', ord.refNumber || p.uidNumber || p.aadhaarNo || '');
        postParams.append('state_code', p.stateCode || p.state || 'UP');
      } else if (uService === 'Mobile_Update') {
        postParams.append('uidNumber', ord.refNumber || p.uidNumber || p.aadhaarNo || '');
        postParams.append('dob', p.dob || '');
        postParams.append('mobile', p.mobile || ord.customerPhone || '');
      } else if (uService === 'puc_services') {
        postParams.append('vehicle_number', (ord.refNumber || p.vehicleNumber || p.vehicalNumber || '').toUpperCase());
      } else if (uService === 'Land Seeding') {
        postParams.append('farmerId', ord.refNumber || p.farmerId || p.registrationNo || '');
        postParams.append('state', p.state || 'UP');
      } else if (uService === 'Samagra Print') {
        postParams.append('samagraId', ord.refNumber || p.samagraId || p.familyId || '');
      } else if (uService === 'Pan_Number_Link') {
        postParams.append('panNo', (p.panNo || ord.refNumber || '').toUpperCase());
        postParams.append('aadhaarNo', p.aadhaarNo || '');
        postParams.append('mobile', p.mobile || ord.customerPhone || '');
      } else if (uService === 'Dob_Update') {
        postParams.append('aadhaarNo', ord.refNumber || p.aadhaarNo || '');
        postParams.append('dob', p.dob || '');
        postParams.append('mobile', p.mobile || ord.customerPhone || '');
      } else {
        Object.entries(p).forEach(([k, v]) => {
          if (typeof v === 'string' || typeof v === 'number') {
            postParams.append(k, String(v));
          }
        });
      }

      try {
        const dispatchUrl = `${baseUrl}/members/${uFile}`;
        const dispRes = await fetch(dispatchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: postParams.toString(),
          credentials: 'include'
        });

        // Mark as dispatched on Smart Cafe
        await fetch(`${smartCafeUrl}/api/index.php?endpoint=services/manual-relay/update-upstream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: ord.id,
            upstreamStatus: 'Dispatched to Rekha Print',
            upstreamNote: `Automated background dispatch (HTTP ${dispRes.status})`
          })
        });
        console.log(`[Rekha Relay] Order ${ord.id} auto-dispatched to Rekha Print`);
      } catch (e) {
        console.error(`[Rekha Relay] Dispatch failed for ${ord.id}:`, e);
      }
    }

    // 3. Poll Rekha Print printRecord.php for completed jobs
    try {
      const recordsUrl = `${baseUrl}/members/printRecord.php`;
      const recRes = await fetch(recordsUrl, { credentials: 'include' });
      if (recRes.ok) {
        const html = await recRes.text();
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        let match;
        const parsedRows = [];

        while ((match = rowRegex.exec(html)) !== null) {
          const rowHtml = match[1];
          const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
          let tdMatch;
          const cells = [];
          while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
            cells.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
          }

          if (cells.length >= 3) {
            let status = 'Pending';
            if (rowHtml.includes('Success') || rowHtml.includes('badge-success')) {
              status = 'Success';
            } else if (rowHtml.includes('Failed') || rowHtml.includes('Refund') || rowHtml.includes('badge-danger')) {
              status = 'Failed';
            }

            let downloadUrl = '';
            const dlMatch = rowHtml.match(/href="([^"]*(?:download|\.pdf|data:application\/pdf)[^"]*)"/i);
            if (dlMatch) {
              downloadUrl = dlMatch[1];
              if (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('data:')) {
                downloadUrl = `${baseUrl}/members/${downloadUrl.replace(/^\/+/, '')}`;
              }
            }

            parsedRows.push({
              text: cells.join(' | ').toLowerCase(),
              status,
              downloadUrl
            });
          }
        }

        // Match with Smart Cafe pending orders
        for (const ord of orders) {
          const ref = (ord.refNumber || '').toLowerCase().trim();
          if (!ref) continue;

          for (const row of parsedRows) {
            if (row.text.includes(ref)) {
              if (row.status === 'Success' && row.downloadUrl) {
                await fetch(`${smartCafeUrl}/api/index.php?endpoint=superadmin/manual-orders/update-status`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    key: adminKey,
                    orderId: ord.id,
                    status: 'completed',
                    pdfUrl: row.downloadUrl
                  })
                });
                console.log(`[Rekha Relay] Order ${ord.id} marked COMPLETED via Rekha Print`);
                break;
              } else if (row.status === 'Failed') {
                await fetch(`${smartCafeUrl}/api/index.php?endpoint=superadmin/manual-orders/update-status`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    key: adminKey,
                    orderId: ord.id,
                    status: 'rejected',
                    rejectionReason: 'Rekha Print द्वारा आवेदन निरस्त किया गया'
                  })
                });
                console.log(`[Rekha Relay] Order ${ord.id} marked REJECTED via Rekha Print`);
                break;
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[Rekha Relay] Polling records error:', e);
    }

    chrome.storage.local.set({
      rekhaRelayStatus: {
        lastSyncAt: new Date().toISOString(),
        active: true,
        pendingCount: orders.length,
        statusText: `🟢 ऑटो-रिले सक्रिय: ${orders.length} आर्डर निगरानी में`
      }
    });

  } catch (err) {
    console.error('[Rekha Relay] Top-level error:', err);
  } finally {
    isRekhaSyncInProgress = false;
  }
}

// Start continuous silent auto-relay polling every 10 seconds
setInterval(syncRekhaManualOrders, 10000);
// Trigger once immediately
setTimeout(syncRekhaManualOrders, 3000);

// Message Listener for Content Scripts & Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'TRIGGER_REKHA_SYNC') {
    syncRekhaManualOrders().then(() => {
      chrome.storage.local.get(['rekhaRelayStatus'], (res) => {
        sendResponse({ success: true, status: res.rekhaRelayStatus });
      });
    });
    return true;
  }

  if (request.action === 'GET_LIVE_OTP') {
    chrome.storage.local.get(['latestLiveOtp'], (res) => {
      sendResponse({ latestLiveOtp: res.latestLiveOtp || null });
    });
    return true;
  }

  if (request.action === 'MARK_OTP_CONSUMED') {
    const otpId = request.otpId;
    chrome.storage.local.get(['serverUrl'], async (data) => {
      const baseUrl = (data.serverUrl || DEFAULT_SERVER).replace(/\/+$/, '');
      try {
        await fetch(`${baseUrl}/api/otp/mark-consumed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpId })
        });
        chrome.storage.local.remove('latestLiveOtp');
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({ success: false });
      }
    });
    return true;
  }
});
