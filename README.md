# ✨ AI Smart Form Filler

A powerful, privacy-first Google Chrome Extension that uses Artificial Intelligence to intelligently autofill any form on the web. 

Instead of relying on rigid, pre-defined fields like standard password managers, this extension reads the context of the webpage and uses an LLM (Large Language Model) to figure out exactly what information belongs in which box based on your custom bio.

## 🚀 Features

- **Bring Your Own LLM (BYOK):** Works with any OpenAI-compatible API endpoint. Use OpenAI (GPT-4o), Groq, Together AI, or even a local model via Ollama.
- **Chat to Refine:** Features a sleek Side Panel UI. If the AI misses a field, just type *"Use my business email instead"* and it will instantly update the form.
- **Privacy First:** Your API key and personal profile are stored strictly in your browser's local storage. They never go to a central server—only directly to your chosen LLM provider.
- **Universal Compatibility:** Scans standard `<input>`, `<textarea>`, and `<select>` fields, analyzing their labels and placeholders to map data intelligently.

## 🛠️ Architecture

This extension is built using Chrome Manifest V3 and follows a strict three-pillar architecture:
1. **The Side Panel (`sidepanel.html/js`):** The user interface. Manages state, handles user chat input, and saves configuration to `chrome.storage.local`.
2. **The Content Script (`content.js`):** The "Eyes and Hands". Injected into the active webpage to scrape form fields and programmatically inject the AI's answers back into the DOM.
3. **The Background Service Worker (`background.js`):** The "Brain". Securely routes messages between the Side Panel and Content Script, constructs the prompt, and handles the `fetch` request to the AI API.

## 📦 Installation (Developer Mode)

Since this extension allows you to use your own API keys, it is designed to be run locally.

1. Download or clone this repository to your local machine:
   ```bash
   git clone https://github.com/djn1mu/Personal-Project.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Turn on **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this repository (the folder containing `manifest.json`).
6. The extension is now installed! Pin it to your Chrome toolbar for easy access.

## ⚙️ Configuration & Usage

1. Click the extension icon in your Chrome toolbar to open the **Side Panel**.
2. Expand the **⚙️ Settings & Profile** section.
3. Enter your AI provider details:
   - **API Endpoint:** (e.g., `https://api.openai.com/v1/chat/completions`)
   - **API Key:** Your secret key.
   - **Model Name:** (e.g., `gpt-4o-mini`)
4. Fill out **Your Profile**. Be as detailed as possible! Include your name, addresses, phone numbers, work history, and custom instructions.
5. Click **Save Settings**.

**To fill a form:**
Navigate to any website with a form (job application, checkout page, contact form) and click **🚀 Analyze & Fill Form** in the side panel. 

If you want to change something, just type a message in the chat box (e.g., *"Make the bio shorter"*) and hit Enter!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Currently looking for help with:
- Expanding `content.js` to handle complex custom dropdowns (Div-based selects).
- Adding multi-profile support (e.g., "Personal" vs "Work" profiles).

## 📝 License

MIT License