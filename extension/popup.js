// Popup script to manage cafeId and serverUrl
document.addEventListener('DOMContentLoaded', () => {
  const cafeIdInput = document.getElementById('cafeId');
  const serverUrlInput = document.getElementById('serverUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  chrome.storage.local.get(['cafeId', 'serverUrl'], (res) => {
    if (res.cafeId) cafeIdInput.value = res.cafeId;
    if (res.serverUrl) serverUrlInput.value = res.serverUrl;
  });

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
