// content containers
const statusDiv = document.getElementById("status");
const resultDiv = document.getElementById("result");

// icons
const copyIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
`;
const checkIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
`;
const markdownIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
    <line x1="16" y1="8" x2="2" y2="22"></line>
    <line x1="17.5" y1="15" x2="9" y2="15"></line>
  </svg>
`;
const ankiIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
`;



document.addEventListener("DOMContentLoaded", () => {
  // ai buttons
  const summarizeBtn = document.getElementById("summarize");
  const translateBtn = document.getElementById("translate");
  const explainBtn = document.getElementById("explain");
  const customBtn = document.getElementById("custom");
  const clearBtn = document.getElementById("clear");
  // function buttons
  const copyBtn = document.getElementById("copy");
  const settingsBtn = document.getElementById("settings");

  // ai explain
  explainBtn.addEventListener("click", () => handleButtonAction("explain", "Explaining"));

  // ai translate
  translateBtn.addEventListener("click", () => handleButtonAction("translate", "Translating"));

  // ai summarize
  summarizeBtn.addEventListener("click", () => handleButtonAction("summarize", "Summarizing"));

  // ai custom
  customBtn.addEventListener("click", () => handleButtonAction("custom", "Processing"));

  // settings
  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // clear all result content
  clearBtn.addEventListener("click", () => {
    resultDiv.innerHTML = "";
    statusDiv.textContent = "Ready.";
  });

  // copy all result content
  copyBtn.addEventListener("click", () => {
    const resultContent = resultDiv.innerText;
    if (resultContent) {
      navigator.clipboard.writeText(resultContent).then(() => {
        statusDiv.textContent = "All content is copied to clipboard!";
        setTimeout(() => {
          statusDiv.textContent = "";
        }, 1000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        statusDiv.textContent = "Failed to copy content.";
      });
    } else {
      statusDiv.textContent = "No content to copy.";
    }
  });

});

// ** End of DOMContentLoaded ** //

// get selected text and paragraph
function getSelectedTextAndParagraph() {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  const pageContent = document.body.innerText;
  
  if (!selectedText) {
    return { selectedText: '', paragraph: '', pageContent: pageContent };
  }

  let node = selection.anchorNode;
  while (node && node.nodeName !== 'P') {
    node = node.parentNode;
  }

  const paragraph = node ? node.textContent.trim() : '';

  return { selectedText, paragraph, pageContent };
}

// get selected text and paragraph from the active tab
function getContentFromActiveTab(callback) {
  // get the active tab 
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // execute the script to get the selected text and paragraph
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getSelectedTextAndParagraph,
    }, (results) => {
      if (chrome.runtime.lastError || !results || results.length === 0) {
        statusDiv.textContent = "Error: No permission to this tab yet.";
      } else {
        const { selectedText, paragraph, pageContent } = results[0].result;
        callback(selectedText, paragraph, pageContent);
      }
    });
  });
}


// handle button action
function handleButtonAction(action, actionVerb) {
  getContentFromActiveTab((selectedText, paragraph, pageContent) => {
    if (selectedText) {
      // update status
      statusDiv.textContent = `${actionVerb}...`;

      // clear result if summarize
      if (action === "summarize") {
        resultDiv.innerHTML = "";
      }
      
      // Create a new div for the result bubble
      const resultBubble = document.createElement('div');
      const bubbleId = Date.now();
      resultBubble.className = 'bubble';
      resultBubble.innerHTML = `
        <div class="bubble-header">
          <span class="bubble-title">${action.charAt(0).toUpperCase() + action.slice(1)} @ ${new Date().toLocaleString()}</span>
        </div>
        <div class="bubble-content" id="content-${bubbleId}"></div>
        <div class="bubble-markdown" id="markdown-${bubbleId}" style="display: none;"></div>
        <div class="bubble-icons">
          <div class="bubble-icon copy-icon" title="Copy content">
            ${copyIconSvg}
          </div>
          <div class="bubble-icon copy-markdown-icon" title="Copy as markdown">
            ${markdownIconSvg}
          </div>
          <div class="bubble-icon anki-icon" title="Add to Anki">
            ${ankiIconSvg}
          </div>
        </div>
        <div class="bubble-text" id="text-${bubbleId}" style="display: none;">${selectedText}</div>
        <div class="bubble-action" id="action-${bubbleId}" style="display: none;">${action}</div>
      `;
      // append the bubble to the result div
      resultDiv.appendChild(resultBubble);
      // scroll result div to the bottom
      resultDiv.scrollTop = resultDiv.scrollHeight;

      // Create a new port for this request
      const port = chrome.runtime.connect({name: "aiStream"});
      
      // Listen for messages on this port
      port.onMessage.addListener((message) => {
        if (message.error) {
          statusDiv.textContent = `Error: ${message.error}`;
        } else if (message.chunk) {
          const bubbleContent = document.getElementById(`content-${bubbleId}`);
          bubbleContent.innerHTML = marked.parse(message.chunk);
          const bubbleMarkdown = document.getElementById(`markdown-${bubbleId}`);
          bubbleMarkdown.innerHTML = message.chunk;
        } else if (message.done) {
          statusDiv.textContent = "Done";
        }
      });

      // Send the initial message to start the stream
      port.postMessage({action, selectedText, paragraph, pageContent});
    } else {
      statusDiv.textContent = `Please select some text on the page to ${action}.`;
    }
  });
}


// Add event listener for copy icons
resultDiv.addEventListener('click', (event) => {
  const copyIcon = event.target.closest('.copy-icon');
  const copyMarkdownIcon = event.target.closest('.copy-markdown-icon');
  const ankiIcon = event.target.closest('.anki-icon');

  // copy content
  if (copyIcon || copyMarkdownIcon) {
    const bubble = (copyIcon || copyMarkdownIcon).closest('.bubble');
    let textToCopy;
    let iconToUpdate;

    if (copyIcon) {
      textToCopy = bubble.querySelector('.bubble-content').innerText;
      iconToUpdate = copyIcon;
    } else {
      textToCopy = bubble.querySelector('.bubble-markdown').innerHTML;
      iconToUpdate = copyMarkdownIcon;
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Visual feedback for successful copy
        const originalIcon = iconToUpdate.innerHTML;
        iconToUpdate.innerHTML = checkIconSvg;
        statusDiv.textContent = "Copied to clipboard!";
        setTimeout(() => {
          iconToUpdate.innerHTML = originalIcon;
          statusDiv.textContent = "Ready.";
        }, 1000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        statusDiv.textContent = "Failed to copy text.";
      });
  }

  // add to anki for "translate" action only
  if (ankiIcon) {
    const bubble = ankiIcon.closest('.bubble');
    const action = bubble.querySelector('.bubble-action').innerText;
    const content = bubble.querySelector('.bubble-markdown').innerHTML;
    const text = bubble.querySelector('.bubble-text').innerText;
    
    // if the action is not "translate", do nothing
    if (action !== "translate") {
      statusDiv.textContent = "This feature is only available for translation.";
      return;
    }

    // First, check if an Anki tab is already open
    chrome.tabs.query({url: chrome.runtime.getURL('anki.html')}, (tabs) => {
      if (tabs.length > 0) {
        // If a tab is found, activate it and send the message
        chrome.tabs.update(tabs[0].id, {active: true}, () => {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'anki', content: content, text: text});
        });
      } else {
        // If no tab is found, create a new one
        chrome.tabs.create({
          url: chrome.runtime.getURL('anki.html'),
          active: true
        }, (tab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (info.status === 'complete' && tabId === tab.id) {
              chrome.tabs.onUpdated.removeListener(listener);
              chrome.tabs.sendMessage(tabId, {action: 'anki', content: content, text: text});
            }
          });
        });
      }
    });
  }
});
