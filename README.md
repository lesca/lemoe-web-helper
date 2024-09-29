# Lemoe Web Helper Extension

[中文](README_zh.md) | [English](README.md)

## Overview

Lemoe Web Helper is a powerful browser extension designed to enhance your web browsing experience with AI-driven functionalities. It integrates seamlessly with Anki, allowing you to create flashcards effortlessly from selected text on any webpage. Whether you need summaries, translations, explanations, or custom text processing, Lemoe Web Helper has got you covered.

## Features

### AI-Powered Operations
- **Summarize:** Generate concise summaries of selected text.
- **Translate:** Translate selected text into your preferred language.
- **Explain:** Obtain detailed explanations of selected text.
- **Custom:** Customize processing to meet your specific text analysis needs.

### Anki Integration
- **Create Flashcards:** Directly create Anki flashcards from translated text.
- **Customizable Fields:** Configure Anki deck, model, and fields to suit your study preferences.
- **Tags Support:** Add customizable tags to your Anki notes for better organization.

### User-Friendly Interface
- **Sidepanel Interface:** Access all functionalities through a convenient sidepanel within your browser.
- **Keyboard Shortcuts:** Activate the extension quickly using `Alt + A` or `Option + A`.
- **Copy & Clear Options:** Easily copy results to your clipboard or clear them as needed.

## Installation

### Manual Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/lesca/lemoi-web-helper.git
   ```
2. **Open Chrome Extensions Page:**
   Navigate to `chrome://extensions` in your Chrome browser.
3. **Enable Developer Mode:**
   Toggle the "Developer mode" switch in the top right corner.
4. **Load Unpacked Extension:**
   Drag the `src` directory to the extensions page.
5. **Test the Extension:**
   Click on the extension icon or press `Alt + A` (`Option + A`) to activate the sidebar.

## First-Time Setup

Before using Lemoe Web Helper, you need to configure your API settings:

1. **Set Up API Keys:**
   - You can use **Ollama** or any other OpenAI-compatible API.
2. **Configure Settings:**
   - Navigate to the [extension settings page](chrome-extension://your-extension-id/settings.html).
   - Enter your API URL, model, API key, temperature, and top-p values.
   - Customize prompts as needed for summaries, translations, explanations, and custom processing.
3. **Save Settings:**
   - Click on "Save Settings" to apply your configurations.

## How to Use

1. **Activate the Extension:**
   - Click the extension icon in the toolbar or press `Alt + A` (`Option + A`).
2. **Select Text:**
   - Highlight the text on any webpage you wish to process.
3. **Choose an Action:**
   - Click on one of the buttons: **Summarize**, **Translate**, **Explain**, or **Custom**.
4. **View Results:**
   - The processed result will appear in the sidepanel.
5. **Additional Options:**
   - **Copy All:** Copy the entire content of the sidepanel to your clipboard.
   - **Clear:** Remove all content from the sidepanel.
   - **Settings:** Access and modify your extension settings.

## Anki Integration

Enhance your learning by integrating Lemoe Web Helper with Anki.

### Prerequisites
- **Anki:** Install [Anki](https://apps.ankiweb.net/) on your computer.
- **Anki Connect Plugin:** Install the [Anki Connect](https://ankiweb.net/shared/info/2055492159) plugin in Anki.

### Limitations
- **Translation Only:** Anki integration is currently available only with the **Translate** option.
- **AI Dependency:** The quality of Anki notes depends on the AI's processing capabilities and may occasionally encounter formatting issues.

### Usage
1. **Translate Text:**
   - Use the **Translate** button to translate the selected text.
2. **Add to Anki:**
   - Click the ⭐ icon below the translation result.
3. **Configure Anki Settings (First-Time Only):**
   - Select the Anki deck, model, and corresponding fields.
   - Click **Save Anki Settings** after configuration.
4. **Select Content:**
   - Choose which items to include in the Anki note.
5. **Finalize:**
   - Modify the content if necessary and click **Add to Anki** to create the flashcard.

## API and Prompts Configuration

Customize how Lemoe Web Helper interacts with AI services:

- **API Presets:** Choose from predefined API presets like Ollama, SiliconFlow, Azure, OpenAI, Claude, GLM, or create a custom preset.
- **Prompts:** Modify system prompts and specific prompts for summarizing, translating, explaining, or custom processing to tailor the AI responses to your needs.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.txt) file for more details.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss improvements or feature requests.

## Acknowledgements

- [Anki](https://apps.ankiweb.net/)
- [Anki Connect](https://ankiweb.net/shared/info/2055492159)