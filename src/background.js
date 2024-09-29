chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'sidepanel.html'
  });
  chrome.sidePanel.open({ tabId: tab.id }).then(() => {
    // send message until sidepanel is ready
    chrome.tabs.sendMessage(tab.id, { action: "clearResult" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Side panel not ready yet, retrying...");
        setTimeout(() => chrome.runtime.sendMessage({ action: "clearResult" }), 200);
      }
    });
  });
});


chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "aiStream") {
    port.onMessage.addListener(async (msg) => {
      // get all presets and prompts
      const settings = await chrome.storage.local.get(["presets", "prompts"]);
      if (!settings.presets || !settings.prompts) {
        port.postMessage({ error: "Update your API settings for AI to work." });
        return;
      }

      // get the api settings of the selected preset
      const selectedPreset = settings.presets.selectedPreset || "ollama";
      const apiUrl = settings.presets[selectedPreset].apiUrl || "http://localhost:11434/v1";
      const model = settings.presets[selectedPreset].model || "qwen2:latest";
      const apiKey = settings.presets[selectedPreset].apiKey || "";
      const temperature = parseFloat(settings.presets[selectedPreset].temperature) || 0.1;
      const topP = parseFloat(settings.presets[selectedPreset].topP) || 0.4;
      const prompts = settings.prompts || "Failed to get prompts.";
      const prompt = prompts[msg.action] || "Failed to get prompt.";

      // Call OpenAI API with streaming enabled
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: prompts.system },
            { role: "user", content: prompt.replaceAll('{{Text}}', msg.selectedText).replaceAll('{{Paragraph}}', msg.paragraph).replaceAll('{{Page}}', msg.pageContent) }
          ],
          stream: true,
          temperature: temperature,
          top_p: topP,
        }),
      });

      // check if response is ok
      if (response.status !== 200) {
        port.postMessage({ error: `API request failed with status ${response.status} ${response.statusText}` });
        return;
      }

      // read the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          port.postMessage({ done: true });
          break;
        }

        // decode the value
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // pop the last line (incomplete line)
        buffer = lines.pop() || "";

        // parse the lines
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            if (line === 'data: [DONE]') {
              port.postMessage({ done: true });
              break;
            }
            try {
              const data = JSON.parse(line.slice(6));
              content += data?.choices?.[0]?.delta?.content || '';
              if (content) {
                port.postMessage({ chunk: content });
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
              console.log('Problematic line:', line);
            }
          }
        }
      }
    });
  }
});
