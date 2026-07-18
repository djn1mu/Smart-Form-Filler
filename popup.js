document.addEventListener('DOMContentLoaded', () => {
  // Load existing settings from local storage
  chrome.storage.local.get(['apiKey', 'userProfile', 'apiEndpoint', 'modelName'], (res) => {
    if (res.apiKey) document.getElementById('apiKey').value = res.apiKey;
    if (res.userProfile) document.getElementById('userProfile').value = res.userProfile;
    if (res.apiEndpoint) document.getElementById('apiEndpoint').value = res.apiEndpoint;
    if (res.modelName) document.getElementById('modelName').value = res.modelName;
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const settings = {
      apiKey: document.getElementById('apiKey').value,
      userProfile: document.getElementById('userProfile').value,
      apiEndpoint: document.getElementById('apiEndpoint').value,
      modelName: document.getElementById('modelName').value
    };

    chrome.storage.local.set(settings, () => {
      // Request the content script to scan the form
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "SCAN_FORM" });
        window.close(); // Close popup to let user see the fill action
      });
    });
  });
});