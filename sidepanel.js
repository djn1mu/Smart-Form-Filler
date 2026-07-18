document.addEventListener('DOMContentLoaded', () => {
  // 1. Load saved settings
  chrome.storage.local.get(['apiKey', 'userProfile', 'apiEndpoint', 'modelName'], (res) => {
    if (res.apiKey) document.getElementById('apiKey').value = res.apiKey;
    if (res.userProfile) document.getElementById('userProfile').value = res.userProfile;
    if (res.apiEndpoint) document.getElementById('apiEndpoint').value = res.apiEndpoint;
    if (res.modelName) document.getElementById('modelName').value = res.modelName;
  });

  // 2. Save settings
  document.getElementById('saveBtn').addEventListener('click', () => {
    const settings = {
      apiKey: document.getElementById('apiKey').value,
      userProfile: document.getElementById('userProfile').value,
      apiEndpoint: document.getElementById('apiEndpoint').value,
      modelName: document.getElementById('modelName').value
    };
    chrome.storage.local.set(settings, () => alert('Settings saved!'));
  });

  // 3. Trigger initial scan
  document.getElementById('scanBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "SCAN_FORM" });
      appendMessage('AI', 'Scanning form fields...');
    });
  });

  // 4. Handle Chat refinement
  document.getElementById('sendBtn').addEventListener('click', () => {
    const text = document.getElementById('userInput').value;
    if (!text) return;
    
    appendMessage('You', text);
    document.getElementById('userInput').value = '';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // We tell the background script to talk to AI with a "refinement" instruction
      chrome.runtime.sendMessage({ action: "CALL_AI", refinement: text });
    });
  });
});

function appendMessage(sender, text) {
  const container = document.getElementById('chat-container');
  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `<span class="${sender === 'You' ? 'user-msg' : 'ai-msg'}">${sender}:</span> ${text}`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}