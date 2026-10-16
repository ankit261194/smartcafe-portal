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

// Message Listener for Content Scripts & Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
