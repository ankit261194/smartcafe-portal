// Popup script to manage cafeId and serverUrl
document.addEventListener('DOMContentLoaded', () => {
  const cafeIdInput = document.getElementById('cafeId');
  const serverUrlInput = document.getElementById('serverUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  const rekhaSyncBtn = document.getElementById('rekhaSyncBtn');
  const rekhaStatusText = document.getElementById('rekhaRelayStatusText');

  chrome.storage.local.get(['cafeId', 'serverUrl', 'rekhaRelayStatus'], (res) => {
    if (res.cafeId) cafeIdInput.value = res.cafeId;
    if (res.serverUrl) serverUrlInput.value = res.serverUrl;
    if (res.rekhaRelayStatus && res.rekhaRelayStatus.statusText) {
      rekhaStatusText.innerText = res.rekhaRelayStatus.statusText;
    }
  });

  if (rekhaSyncBtn) {
    rekhaSyncBtn.addEventListener('click', () => {
      rekhaStatusText.innerText = '⏳ सिंक प्रगति पर है...';
      chrome.runtime.sendMessage({ action: 'TRIGGER_REKHA_SYNC' }, (response) => {
        if (response && response.status) {
          rekhaStatusText.innerText = response.status.statusText || '✓ सिंक संपन्न!';
        } else {
          rekhaStatusText.innerText = '✓ सिंक कमांड भेजी गई!';
        }
      });
    });
  }

  saveBtn.addEventListener('click', () => {
    const cafeId = (cafeIdInput.value || 'CAFE-101').trim();
    const serverUrl = (serverUrlInput.value || 'https://smartcafe.sbs').trim();

    chrome.storage.local.set({ cafeId, serverUrl }, () => {
      statusDiv.innerText = '✓ सेटिंग्स सफलतापूर्वक सहेजी गईं!';
      setTimeout(() => {
        statusDiv.innerText = '🟢 100% लाइव ब्रिज सक्रिय';
      }, 2000);
    });
  });
});
