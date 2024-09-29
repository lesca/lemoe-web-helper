document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-form");
  // api settings
  const apiUrlInput = document.getElementById("api-url");
  const modelInput = document.getElementById("model");
  const apiKeyInput = document.getElementById("api-key");
  const temperatureInput = document.getElementById("temperature");
  const topPInput = document.getElementById("top-p");
  // prompts
  const systemPromptInput = document.getElementById("system-prompt");
  const summarizePromptInput = document.getElementById("summarize-prompt");
  const translatePromptInput = document.getElementById("translate-prompt");
  const explainPromptInput = document.getElementById("explain-prompt");
  const customPromptInput = document.getElementById("custom-prompt");


  // api presets
  const apiPresetSelect = document.getElementById("api-preset");
  const defaultPresets = {
    selectedPreset: "ollama",
    ollama: {
      apiUrl: "http://localhost:11434/v1",
      model: "qwen2:latest",
      apiKey: "none",
      temperature: 0.1,
      topP: 0.4
    },
    siliconflow: {
      apiUrl: "https://api.siliconflow.cn/v1",
      model: "Qwen/Qwen2-7B-Instruct",
      apiKey: "",
      temperature: 0.1,
      topP: 0.4
    },
    azure: {
      apiUrl: "https://models.inference.ai.azure.com",
      model: "gpt-4o-mini",
      apiKey: "",
      temperature: 0.2,
      topP: 0.4
    },
    openai: {
      apiUrl: "https://api.openai.com/v1",
      model: "gpt-4o",
      apiKey: "",
      temperature: 0.2,
      topP: 0.4
    },
    custom: {
      apiUrl: "",
      model: "",
      apiKey: "",
      temperature: 0.2,
      topP: 0.5
    }
  };

  // Define default prompts
  const defaultPrompts = {
    system: "You are a helpful assistant that provides English word explanations in Simplified Chinese. You output in markdown lists under highlighted headers without ``` block.",
    summarize: "1. 列出文中出现的人物或组织（翻译、背景信息、文中关联）。\n2. 列出文中出现的地点或场所（翻译、背景信息、文中关联）。\n3. 根据时间、地点、人物、起因、经过、结果等，列出文中的事件，未提及的标注“不详”。\n4. 整理出文中的未来预期，列出人物、原因、预期等，未提及的标注“不详”。\n5. 列出文中所有评论或观点，不要遗漏，并列出人物、人物身份、人物观点等，未提及的标注“不详”。\n6. 最后根据以上信息补充并总结全文内容。\n\n全文信息如下：\n{{Text}}",
    translate: "先以列表形式解释{{Text}}中的词组（缩进形式列出国际音标、翻译、原文含义、常用短语），最后根据上下文给出{{Text}}的中文翻译。 \n\n注意，词组不要太长，原文含义可以拓展背景知识，常用短语需要中英文对照。",
    explain: "先解释{{Text}}常见的含义，然后给出{{Text}}在上下文中的含义，最后给出{{Text}}所在句子的中文翻译。\n\n上下文：\n{{Paragraph}} ",
    custom: "先解释{{Text}}常见的含义，然后推理{{Text}}在上下文中的含义，并给出推理过程中所用到的原文信息，最后给出{{Text}}所在句子的中文翻译。\n\n上下文：\n{{Paragraph}} \n\n全文：\n{{Page}}"
  };

  // Load saved settings
  let presets = {};
  chrome.storage.local.get(["presets", "prompts"], (result) => {
    // load selected preset
    presets = result.presets || defaultPresets;
    const selectedPreset = presets.selectedPreset || "ollama"
    apiPresetSelect.value = selectedPreset;

    // load settings of selected preset
    apiUrlInput.value = presets[selectedPreset].apiUrl;
    modelInput.value = presets[selectedPreset].model;
    apiKeyInput.value = presets[selectedPreset].apiKey;
    temperatureInput.value = presets[selectedPreset].temperature;
    topPInput.value = presets[selectedPreset].topP;

    // load prompts
    const prompts = result.prompts || defaultPrompts;
    systemPromptInput.value = prompts.system;
    summarizePromptInput.value = prompts.summarize;
    translatePromptInput.value = prompts.translate;
    explainPromptInput.value = prompts.explain;
    customPromptInput.value = prompts.custom;

  });

  // Save settings
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const selectedPreset = apiPresetSelect.value;
    presets[selectedPreset] = {
      apiUrl: apiUrlInput.value,
      model: modelInput.value,
      apiKey: apiKeyInput.value,
      temperature: parseFloat(temperatureInput.value),
      topP: parseFloat(topPInput.value)
    };

    const prompts = {
      system: systemPromptInput.value,
      summarize: summarizePromptInput.value,
      translate: translatePromptInput.value,
      explain: explainPromptInput.value,
      custom: customPromptInput.value
    };

    chrome.storage.local.set({ presets, prompts }, () => {
      document.getElementById("result").textContent = "Settings saved successfully!";
      setTimeout(() => {
        document.getElementById("result").textContent = "";
      }, 1000);
    });
  });

  // reset all settings
  const resetSettingsBtn = document.getElementById("reset");
  resetSettingsBtn.addEventListener("click", () => {
    chrome.storage.local.set({ presets: defaultPresets, prompts: defaultPrompts }, () => {
      document.getElementById("result").textContent = "Settings reset to default successfully!";
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  });

  // reset prompts
  const resetPromptsBtn = document.getElementById("reset-prompts");
  resetPromptsBtn.addEventListener("click", () => {
    chrome.storage.local.set({ prompts: defaultPrompts }, () => {
      document.getElementById("result").textContent = "Prompts reset to default successfully!";
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }); 
  });

  // Add event listener for preset change
  apiPresetSelect.addEventListener("change", (e) => {
    const selectedPreset = e.target.value;
    // update selected preset
    presets.selectedPreset = selectedPreset;

    // load settings of selected preset
    apiUrlInput.value = presets[selectedPreset].apiUrl;
    modelInput.value = presets[selectedPreset].model;
    apiKeyInput.value = presets[selectedPreset].apiKey;
    temperatureInput.value = presets[selectedPreset].temperature;
    topPInput.value = presets[selectedPreset].topP;
  });
});