// Popup script for Austrian Dialect Translator

document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabled');
  const showOriginalToggle = document.getElementById('showOriginal');
  const translationModeSelect = document.getElementById('translationMode');
  const statusDiv = document.getElementById('status');
  const testInput = document.getElementById('testInput');
  const testOutput = document.getElementById('testOutput');

  // Get storage API (works for both Chrome and Firefox)
  const storageAPI = typeof browser !== 'undefined' ? browser.storage : chrome.storage;

  // Load saved settings
  function loadSettings() {
    storageAPI.local.get(['enabled', 'showOriginal', 'translationMode'], (result) => {
      enabledToggle.checked = result.enabled !== false;
      showOriginalToggle.checked = result.showOriginal !== false;
      translationModeSelect.value = result.translationMode || 'replace';
      updateStatus();
    });
  }

  // Save settings
  function saveSettings() {
    const settings = {
      enabled: enabledToggle.checked,
      showOriginal: showOriginalToggle.checked,
      translationMode: translationModeSelect.value
    };
    
    storageAPI.local.set(settings, () => {
      updateStatus();
    });
  }

  // Update status indicator
  function updateStatus() {
    const statusText = statusDiv.querySelector('.status-text');
    if (enabledToggle.checked) {
      statusDiv.className = 'status active';
      statusText.textContent = 'Aktiv';
    } else {
      statusDiv.className = 'status inactive';
      statusText.textContent = 'Inaktiv';
    }
  }

  // Translate text function (duplicated from content.js for popup testing)
  function translateToAustrian(text) {
    if (!text || typeof text !== 'string') return { text: text, wasTranslated: false };
    
    let translatedText = text;
    let wasTranslated = false;
    
    // First, handle multi-word phrases
    for (const [german, austrian] of AUSTRIAN_PHRASES) {
      const regex = new RegExp('\\b' + escapeRegex(german) + '\\b', 'gi');
      if (regex.test(translatedText)) {
        wasTranslated = true;
        translatedText = translatedText.replace(regex, (match) => {
          return matchCase(match, austrian);
        });
      }
    }
    
    // Then, handle single words
    const words = translatedText.split(/(\s+|[.,!?;:'"()[\]{}])/);
    const translatedWords = words.map(word => {
      if (!word || /^[\s.,!?;:'"()[\]{}]+$/.test(word)) {
        return word;
      }
      
      const lowerWord = word.toLowerCase();
      
      if (AUSTRIAN_DICTIONARY.hasOwnProperty(lowerWord)) {
        wasTranslated = true;
        return matchCase(word, AUSTRIAN_DICTIONARY[lowerWord]);
      }
      
      return word;
    });
    
    return {
      text: translatedWords.join(''),
      wasTranslated: wasTranslated
    };
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchCase(original, replacement) {
    if (!original || !replacement) return replacement;
    
    if (original === original.toUpperCase()) {
      return replacement.toUpperCase();
    }
    
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    
    return replacement.toLowerCase();
  }

  // Handle test input
  function handleTestInput() {
    const inputText = testInput.value.trim();
    
    if (!inputText) {
      testOutput.textContent = 'Übersetzung erscheint hier...';
      testOutput.classList.add('empty');
      return;
    }
    
    const result = translateToAustrian(inputText);
    testOutput.textContent = result.text;
    testOutput.classList.remove('empty');
    
    if (result.wasTranslated) {
      testOutput.style.color = '#10b981';
    } else {
      testOutput.style.color = '#e8e8e8';
    }
  }

  // Event listeners
  enabledToggle.addEventListener('change', saveSettings);
  showOriginalToggle.addEventListener('change', saveSettings);
  translationModeSelect.addEventListener('change', saveSettings);
  testInput.addEventListener('input', handleTestInput);

  // Initialize
  loadSettings();

  // Add some example text to test input
  testInput.placeholder = 'z.B.: Hallo, wie geht es dir?';
});
