chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCAN_FORM") {
    const inputs = document.querySelectorAll('input, textarea, select');
    const formContext = Array.from(inputs).map((input, index) => {
      // Try to find a label for the input
      const label = document.querySelector(`label[for="${input.id}"]`)?.innerText || 
                    input.getAttribute('aria-label') || 
                    input.placeholder || 
                    input.name;
      
      // Add a temporary ID so we can find it later to fill it
      input.dataset.aiId = `field-${index}`;
      
      return {
        id: input.dataset.aiId,
        type: input.type,
        label: label,
        placeholder: input.placeholder
      };
    });

    // Send this "Map" of the form to the background script to talk to the AI
    chrome.runtime.sendMessage({ action: "CALL_AI", fields: formContext });
  }

  if (request.action === "FILL_FIELDS") {
    request.data.forEach(item => {
      const element = document.querySelector(`[data-ai-id="${item.id}"]`);
      if (element) {
        element.value = item.value;
        // Trigger events so the website knows we changed the value
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
});