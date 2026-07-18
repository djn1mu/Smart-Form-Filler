// Open side panel when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CALL_AI") {
    handleAiCall(request, sender);
    return true; 
  }
});

async function handleAiCall(request, sender) {
  try {
    // 1. Fetch all settings and the last known form structure
    const settings = await chrome.storage.local.get(['apiKey', 'userProfile', 'apiEndpoint', 'modelName', 'lastScannedFields']);
    
    if (!settings.apiKey) throw new Error("API Key is missing. Please check settings.");

    // 2. Identify the target tab (where the form is)
    let targetTabId = sender.tab ? sender.tab.id : null;
    if (!targetTabId) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      targetTabId = activeTab?.id;
    }

    // 3. Determine the form context (new scan or refinement of previous scan)
    const fieldsToProcess = request.fields || settings.lastScannedFields || [];
    if (request.fields) {
      await chrome.storage.local.set({ lastScannedFields: request.fields });
    }
    
    const prompt = `
      You are a professional form-filling assistant.
      USER PROFILE: ${settings.userProfile}
      
      FORM FIELDS: ${JSON.stringify(fieldsToProcess)}
      
      ${request.refinement ? `USER SPECIFIC REQUEST: "${request.refinement}"` : "TASK: Fill the form based on the profile."}
      
      Respond ONLY with a JSON object containing a "fields" array: {"fields": [{"id": "field-id", "value": "the value"}]}.
    `;
    
    const response = await fetch(settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: [
          { role: "system", content: "You are a helpful assistant that outputs strictly valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.choices?.[0]?.message?.content) throw new Error("Invalid response from AI provider.");

    const parsedData = JSON.parse(result.choices[0].message.content);

    // 4. Inject the data back into the webpage
    if (targetTabId) {
      chrome.tabs.sendMessage(targetTabId, { 
        action: "FILL_FIELDS", 
        data: parsedData.fields || parsedData 
      });
    }

  } catch (error) {
    console.error("AI Filling Error:", error);
    chrome.runtime.sendMessage({ action: "AI_ERROR", message: error.message });
  }
}
