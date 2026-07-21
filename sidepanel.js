let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const saveBtn = document.getElementById('saveBtn');

  // 1. Load saved settings
  chrome.storage.local.get(['apiKey', 'userProfile', 'apiEndpoint', 'modelName', 'chatHistory'], (res) => {
    if (res.apiKey) document.getElementById('apiKey').value = res.apiKey;
    if (res.userProfile) document.getElementById('userProfile').value = res.userProfile;
    if (res.apiEndpoint) document.getElementById('apiEndpoint').value = res.apiEndpoint;
    if (res.modelName) document.getElementById('modelName').value = res.modelName;

    // Restore previous chat history
    if (res.chatHistory && res.chatHistory.length > 0) {
      chatHistory = res.chatHistory;
      const container = document.getElementById('chat-container');
      container.innerHTML = ''; // Clear default greeting
      chatHistory.forEach(msg => appendMessage(msg.sender, msg.text, false));
    }
  });

  // 2. Save settings
  saveBtn.addEventListener('click', () => {
    const settings = {
      apiKey: document.getElementById('apiKey').value,
      userProfile: document.getElementById('userProfile').value,
      apiEndpoint: document.getElementById('apiEndpoint').value,
      modelName: document.getElementById('modelName').value
    };
    chrome.storage.local.set(settings, () => {
      const originalText = saveBtn.innerText;
      saveBtn.innerText = '✓ Saved!';
      saveBtn.classList.add('btn-saved');
      setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.classList.remove('btn-saved');
      }, 2000);
    });
  });

  // 3. Trigger initial scan
  scanBtn.addEventListener('click', () => {
    setLoadingState(true);
    document.getElementById('settingsDetails').open = false; // Auto-collapse settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "SCAN_FORM" });
      appendMessage('AI', 'Scanning form fields...');
    });
  });

  // 4. Handle Chat refinement
  document.getElementById('sendBtn').addEventListener('click', handleSend);
  
  document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  function handleSend() {
    const text = document.getElementById('userInput').value.trim();
    if (!text) return;
    
    document.getElementById('settingsDetails').open = false; // Auto-collapse settings
    appendMessage('You', text);
    document.getElementById('userInput').value = '';
    setLoadingState(true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // We tell the background script to talk to AI with a "refinement" instruction
      chrome.runtime.sendMessage({ action: "CALL_AI", refinement: text });
    });
  }

  // 5. Close Panel
  document.getElementById('closePanelBtn').addEventListener('click', () => {
    window.close();
  });

  // 6. Clear Chat
  document.getElementById('clearChatBtn').addEventListener('click', () => {
    chatHistory = [];
    chrome.storage.local.remove('chatHistory');
    document.getElementById('chat-container').innerHTML = '<div class="chat-msg ai-msg">👋 Hi! I\'m your AI assistant. Click "Analyze & Fill" below to scan the page, or ask me anything!</div>';
  });
});

function setLoadingState(isLoading) {
  const scanBtn = document.getElementById('scanBtn');
  const sendBtn = document.getElementById('sendBtn');
  if (isLoading) {
    scanBtn.disabled = true;
    sendBtn.disabled = true;
    scanBtn.innerText = '⏳ Processing...';
  } else {
    scanBtn.disabled = false;
    sendBtn.disabled = false;
    scanBtn.innerText = '🚀 Analyze & Fill Form';
  }
}

// Listen for updates from the background script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "AI_ERROR") {
    appendMessage('AI', `❌ Error: ${request.message}`);
    setLoadingState(false);
  } else if (request.action === "FILL_COMPLETED") {
    appendMessage('AI', '✅ Form filled successfully!');
    setLoadingState(false);
  }
});

function appendMessage(sender, text, save = true) {
  const container = document.getElementById('chat-container');
  const div = document.createElement('div');
  
  // Style bubbles differently based on who sent the message
  div.className = `chat-msg ${sender === 'You' ? 'user-msg' : 'ai-msg'}`;
  div.innerText = text; 
  
  container.appendChild(div);
  
  // Smooth scroll to the newest message
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

  // Save to memory
  if (save) {
    chatHistory.push({ sender, text });
    chrome.storage.local.set({ chatHistory });
  }
}