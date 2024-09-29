document.addEventListener('DOMContentLoaded', () => {
  // anki form
  const form = document.getElementById('anki-form');
  const statusDiv = document.getElementById('status');

  // anki settings
  const toggleButton = document.getElementById('toggle-anki-settings');
  const settingsForm = document.getElementById('anki-settings-form');
  const ankiDecksSelect = document.getElementById('anki-deck');
  const ankiModelsSelect = document.getElementById('anki-model');
  const ankiTermSelect = document.getElementById('anki-term');
  const ankiIpaSelect = document.getElementById('anki-ipa');
  const ankiMeaningSelect = document.getElementById('anki-meaning');
  const ankiExtendedSelect = document.getElementById('anki-extended');
  const ankiPhraseSelect = document.getElementById('anki-phrase');
  const ankiTextSelect = document.getElementById('anki-text');
  const ankiTranslationSelect = document.getElementById('anki-translation');
  const ankiTags = document.getElementById('anki-tags');
  const saveButton = document.getElementById('save-anki-settings');
  let ankiSettings = {};
  getAnkiSettings();

  // add to anki button
  const addToAnkiButton = document.getElementById('add-to-anki');
  addToAnkiButton.addEventListener('click', (e) => {
    e.preventDefault();
    // Get all selected checkboxes
    const selectedCheckboxes = form.querySelectorAll('input[name="selected-terms"]:checked');

    // Extract the values (terms) from the selected checkboxes
    const selectedTerms = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);

    // Create an array to store the selected term data
    const selectedTermData = {
      text: document.getElementById('selected-text').value,
      translation: document.getElementById('translation').value,
      terms: []
    };

    // Check if any terms are selected
    if (selectedTerms.length === 0) {
      statusDiv.textContent = 'Please select at least one term to add to Anki.';
      return; // Exit the function early
    }

    // Clear previous status
    statusDiv.textContent = '';

    // Iterate over selected terms
    selectedTerms.forEach(item => {
      // Find the corresponding row for the selected term
      const row = form.querySelector(`input[value="${item}"]`).closest('tr');

      // Extract data for the selected term
      const term = row.querySelector('.anki-data-term').value;
      const ipa = row.querySelector('.anki-data-ipa').value;
      const meaning = row.querySelector('.anki-data-meaning').value;
      const extended = row.cells[4].textContent;
      const phrase = row.cells[5].textContent;
      const text = selectedTermData.text.replace(new RegExp(term, 'gi'), `<b>$&</b>`);
      const translation = selectedTermData.translation;

      // Add the term data to the array
      // selectedTermData.terms.push({ term, ipa, meaning, extended, phrase, text });

      // add anki note
      const ankiFieldsData = {
        [ankiSettings.term]: term,
        [ankiSettings.ipa]: ipa,
        [ankiSettings.meaning]: meaning,
        [ankiSettings.extended]: extended,
        [ankiSettings.phrase]: phrase,
        [ankiSettings.text]: text,
        [ankiSettings.translation]: translation,
      };
      addAnkiNote(ankiSettings, ankiFieldsData).then((result) => {
        statusDiv.textContent = result;
      }).catch(error => {
        statusDiv.textContent = error;
      });
    });

    // Log the selected term data
    // console.log('Selected terms and their data:', selectedTermData);

  });


  // toggle anki settings
  toggleButton.addEventListener('click', () => {
    if (settingsForm.style.display === 'none') {  // display settings form
      settingsForm.style.display = 'block';
      toggleButton.textContent = 'Anki Settings ▲';

      // load anki settings
      ankiTags.value = ankiSettings.tags;
      updateAnkiDecks();
      updateAnkiModels();
      updateAnkiFields();
    } else {  // hide settings form
      settingsForm.style.display = 'none';
      toggleButton.textContent = 'Anki Settings ▼';
    }
  });

  // listen to ankiDecksSelect clicked
  ankiDecksSelect.addEventListener('click', () => {
    updateAnkiDecks();
  });

  // listen to ankiModelsSelect click
  ankiModelsSelect.addEventListener('click', () => {
    updateAnkiModels();
  });

  // listen to ankiModelSelect change
  ankiModelsSelect.addEventListener('change', () => {
    updateAnkiFields();
  });

  function updateAnkiDecks() {
    getAnkiDecks().then(decks => {
      statusDiv.textContent = 'Anki Connect is ready.';
      ankiDecksSelect.innerHTML = '';
      decks.forEach(deck => {
        const option = document.createElement('option');
        option.value = deck;
        option.textContent = deck;
        if (ankiSettings.deck === deck) {
          option.selected = true;
        }
        ankiDecksSelect.appendChild(option);
      });
    }).catch(error => {
      statusDiv.innerHTML = '<b>Error:</b> Please make sure Anki-Connect is running.';
      console.error('Error:', error);
    });
  }

  function updateAnkiModels() {
    // get anki models
    getAnkiModels().then(models => {
      ankiModelsSelect.innerHTML = '';
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        if (ankiSettings.model === model) {
          option.selected = true;
        }
        ankiModelsSelect.appendChild(option);
      });
      updateAnkiFields();
    });
  }

  function updateAnkiFields() {
    // get anki fields
    getAnkiNoteFields(ankiModelsSelect.value).then(fields => {
      [ankiTermSelect, ankiIpaSelect, ankiMeaningSelect, ankiExtendedSelect, ankiPhraseSelect, ankiTextSelect, ankiTranslationSelect].forEach(select => {
        select.innerHTML = ''; // Clear existing options
        fields.forEach(field => {
          const option = document.createElement('option');
          const selectId = select.id.split('-')[1];
          option.value = field;
          option.textContent = field;
          // console.log(selectId, ankiSettings[selectId]);
          if (field === ankiSettings[selectId]) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      });
    });
  }

  // save anki settings
  saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    ankiSettings = {
      deck: ankiDecksSelect.value,
      model: ankiModelsSelect.value,
      term: ankiTermSelect.value,
      ipa: ankiIpaSelect.value,
      meaning: ankiMeaningSelect.value,
      extended: ankiExtendedSelect.value,
      phrase: ankiPhraseSelect.value,
      text: ankiTextSelect.value,
      translation: ankiTranslationSelect.value,
      tags: ankiTags.value
    };
    chrome.storage.local.set({ ankiSettings }, () => {
      statusDiv.textContent = 'Anki settings saved.';
      // console.log(ankiSettings);
    });
  });

  // get anki settings
  function getAnkiSettings() {
    chrome.storage.local.get(["ankiSettings"], (result) => {
      if (result.ankiSettings) {
        ankiSettings = result.ankiSettings;
      } else {
        ankiSettings = {
          deck: 'Default',
          model: 'Basic',
          term: 'Front',
          ipa: '',
          meaning: 'Back',
          extended: '',
          phrase: '',
          text: '',
          translation: '',
          tags: 'lemoe'
        };
      }
      // console.log(result);
    });
  }

});

// handle messages from sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const selectedText = document.getElementById('selected-text');
  const translationTextarea = document.getElementById('translation');
  if (message.action === 'anki') {
    selectedText.value = message.text;
    translationTextarea.value = 'Processing ...';
    showAnkiData(message.content);
  }
});


function  showAnkiData(content) {
  const statusDiv = document.getElementById('status');
  const ankiJsonContainer = document.getElementById('anki-json');
  const translationTextarea = document.getElementById('translation');
  const table = document.getElementById('terms-table');
  const tbody = table.querySelector('tbody');

  // clear table
  tbody.innerHTML = '';

  statusDiv.textContent = 'Processing...';
  ankiJsonContainer.innerHTML = '';
  getAnkiJsonByAi(content).then((data) => {
    const ankiJson = JSON.parse(data);
    ankiJsonContainer.textContent = data;
    translationTextarea.value = ankiJson.translation;

    ankiJson.terms.forEach((term, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="checkbox" id="term-${index}" name="selected-terms" value="${term.term}"></td>
        <td><input class="anki-data-term" type="text" value="${term.term}" name="term-${index}"></td>
        <td><input class="anki-data-ipa" type="text" value="${term.ipa}" name="ipa-${index}"></td>
        <td><input class="anki-data-meaning" type="text" value="${term.meaning}" name="meaning-${index}"></td>
        <td>${term.extended}</td>
        <td>${convertPhraseToString(term.phrase)}</td>
      `;
      tbody.appendChild(row);
    });

    statusDiv.textContent = 'Ready';
  });
}

async function getAnkiJsonByAi(content) {
  const statusDiv = document.getElementById('status');
  const settings = await chrome.storage.local.get(["presets", "prompts"]);
  const selectedPreset = settings.presets.selectedPreset || "ollama";
  const apiUrl = settings.presets[selectedPreset].apiUrl || "http://localhost:11434/v1";
  const model = settings.presets[selectedPreset].model || "qwen2:latest";
  const apiKey = settings.presets[selectedPreset].apiKey || "";
  const temperature = parseFloat(settings.presets[selectedPreset].temperature) || 0.1;
  const topP = parseFloat(settings.presets[selectedPreset].topP) || 0.4;
  const promptSystem = "You are a helpful assistant.";
  const prompt = "将下面的信息以yaml格式整理出来，yaml格式如下：\n```yaml\nterms:\n  - term: the 1st term\n    ipa: mapping to 国际音标\n    meaning: mapping to 翻译\n    extended: mapping to 原文含义\n    phrase: mapping to 常用短语\ntranslation: mapping to the last paragraph\n```";

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        temperature: temperature,
        top_p: topP,
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: `${prompt}\n${content}` }
        ]
      })
    });

    // if response code is not 200, throw error
    if (response.status !== 200) {
      statusDiv.textContent = `Failed to get response: ${response.status} ${response.statusText}`;
      return;
    }

    const data = await response.json();
    const ankiYaml = data.choices[0].message.content;
    console.log(ankiYaml);
    const ankiJson = jsyaml.load(ankiYaml.replace(/```yaml|```/g, '').replace(/"/g, ''));
    console.log(ankiJson);

    return JSON.stringify(ankiJson, null, 2);
  } catch (error) {
    statusDiv.textContent = `Failed to get response: ${error}`;
    console.log(`Failed to get response: ${error}`);
  }
}

function convertPhraseToString(phrase) {
  if (typeof phrase === 'string') {
    return phrase;
  } else if (Array.isArray(phrase)) {
    return phrase.map(item => {
      if (typeof item === 'string') {
        return item;
      } else if (typeof item === 'object') {
        return Object.entries(item).map(([key, value]) => `${key}: ${value}`).join('; ');
      }
      return '';
    }).join('; ');
  } else if (typeof phrase === 'object') {
    return Object.entries(phrase).map(([key, value]) => `${key}: ${value}`).join('; ');
  }
  return '';
}

// ** Anki Connect Functions ** //

async function addAnkiNote(ankiSettings, ankiFieldsData) {
  const response = await fetch('http://localhost:8765', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: ankiSettings.deck,
          modelName: ankiSettings.model,
          fields: ankiFieldsData,
          options: {
            allowDuplicate: false,
            duplicateScope: 'deck',
          },
          tags: [ankiSettings.tags],
        },
      },
    }),
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(`Anki-Connect error: ${result.error}`);
  }

  return result.result; // This will be the new note ID if successful
}

async function getAnkiDecks() {
  const response = await fetch('http://127.0.0.1:8765', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'deckNames',
      version: 6,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(`Anki-Connect error: ${result.error}`);
  }

  return result.result;
}

async function getAnkiModels() {
  const action = 'modelNames';
  const version = 6;

  const response = await fetch('http://127.0.0.1:8765', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      version,
    }),
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(`Anki-Connect error: ${result.error}`);
  }

  return result.result;
}

async function getAnkiNoteFields(modelName) {
  const response = await fetch('http://localhost:8765', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'modelFieldNames',
      version: 6,
      params: {
        modelName: modelName
      }
    })
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(`Anki-Connect error: ${result.error}`);
  }

  return result.result;
}
