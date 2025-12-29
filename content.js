// Twitch Austrian Dialect Translator - Content Script
// This script monitors Twitch chat and translates German messages to Austrian dialect

(function() {
  'use strict';

  // Configuration
  let isEnabled = true;
  let showOriginal = true; // Show original text in tooltip
  let translationMode = 'replace'; // 'replace' or 'append'

  // Load settings from storage
  function loadSettings() {
    if (typeof browser !== 'undefined') {
      // Firefox
      browser.storage.local.get(['enabled', 'showOriginal', 'translationMode']).then(result => {
        isEnabled = result.enabled !== false;
        showOriginal = result.showOriginal !== false;
        translationMode = result.translationMode || 'replace';
      });
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      // Chrome
      chrome.storage.local.get(['enabled', 'showOriginal', 'translationMode'], result => {
        isEnabled = result.enabled !== false;
        showOriginal = result.showOriginal !== false;
        translationMode = result.translationMode || 'replace';
      });
    }
  }

  // Listen for settings changes
  function listenForSettingsChanges() {
    const storageAPI = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    if (storageAPI) {
      storageAPI.onChanged.addListener((changes, area) => {
        if (area === 'local') {
          if (changes.enabled) isEnabled = changes.enabled.newValue;
          if (changes.showOriginal) showOriginal = changes.showOriginal.newValue;
          if (changes.translationMode) translationMode = changes.translationMode.newValue;
        }
      });
    }
  }

  // Translate text from German to Austrian dialect
  function translateToAustrian(text) {
    if (!text || typeof text !== 'string') return text;
    
    let translatedText = text;
    let wasTranslated = false;
    
    // First, handle multi-word phrases (case-insensitive)
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
      // Skip empty strings, whitespace, and punctuation
      if (!word || /^[\s.,!?;:'"()[\]{}]+$/.test(word)) {
        return word;
      }
      
      const lowerWord = word.toLowerCase();
      
      // Check if word exists in dictionary
      if (AUSTRIAN_DICTIONARY.hasOwnProperty(lowerWord)) {
        wasTranslated = true;
        return matchCase(word, AUSTRIAN_DICTIONARY[lowerWord]);
      }
      
      return word;
    });
    
    return {
      text: translatedWords.join(''),
      wasTranslated: wasTranslated,
      original: text
    };
  }

  // Helper: Escape special regex characters
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Helper: Match the case of the original word
  function matchCase(original, replacement) {
    if (!original || !replacement) return replacement;
    
    // Check if all uppercase
    if (original === original.toUpperCase()) {
      return replacement.toUpperCase();
    }
    
    // Check if first letter is uppercase (capitalize)
    if (original[0] === original[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    
    // Otherwise, keep lowercase
    return replacement.toLowerCase();
  }

  // Process a single chat message element
  function processMessage(messageElement) {
    if (!isEnabled) return;
    if (messageElement.dataset.austrianTranslated) return;
    
    // Find text fragments within the message
    const textFragments = messageElement.querySelectorAll('[data-a-target="chat-message-text"], .text-fragment');
    
    textFragments.forEach(fragment => {
      if (fragment.dataset.austrianTranslated) return;
      
      const originalText = fragment.textContent;
      const result = translateToAustrian(originalText);
      
      if (result.wasTranslated) {
        // Mark as translated
        fragment.dataset.austrianTranslated = 'true';
        fragment.dataset.originalText = originalText;
        
        if (translationMode === 'replace') {
          fragment.textContent = result.text;
          
          // Add visual indicator and tooltip
          fragment.classList.add('austrian-translated');
          if (showOriginal) {
            fragment.title = `Original: ${originalText}`;
          }
        } else if (translationMode === 'append') {
          // Append translation after original
          const translationSpan = document.createElement('span');
          translationSpan.className = 'austrian-translation-append';
          translationSpan.textContent = ` [🇦🇹 ${result.text}]`;
          fragment.parentNode.insertBefore(translationSpan, fragment.nextSibling);
        }
      }
    });
    
    // Also process direct text nodes in the message
    processTextNodes(messageElement);
    
    messageElement.dataset.austrianTranslated = 'true';
  }

  // Process text nodes directly (for messages without specific text fragment elements)
  function processTextNodes(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip if parent is already processed or is a script/style
          if (node.parentElement.dataset.austrianTranslated) {
            return NodeFilter.FILTER_SKIP;
          }
          if (node.parentElement.tagName === 'SCRIPT' || 
              node.parentElement.tagName === 'STYLE') {
            return NodeFilter.FILTER_SKIP;
          }
          // Only process nodes with actual text content
          if (node.textContent.trim()) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
      const result = translateToAustrian(node.textContent);
      if (result.wasTranslated && node.parentElement) {
        node.textContent = result.text;
        node.parentElement.dataset.austrianTranslated = 'true';
        if (showOriginal) {
          node.parentElement.title = `Original: ${result.original}`;
        }
        node.parentElement.classList.add('austrian-translated');
      }
    });
  }

  // Find and process all chat messages
  function processAllMessages() {
    // Twitch chat message selectors
    const messageSelectors = [
      '[data-a-target="chat-message-container"]',
      '.chat-line__message',
      '[class*="chat-line"]',
      '.message'
    ];
    
    messageSelectors.forEach(selector => {
      const messages = document.querySelectorAll(selector);
      messages.forEach(processMessage);
    });
  }

  // Set up MutationObserver to watch for new chat messages
  function setupObserver() {
    const chatContainer = findChatContainer();
    
    if (!chatContainer) {
      // Chat container not found, retry after a delay
      setTimeout(setupObserver, 1000);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      if (!isEnabled) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this is a chat message
            if (node.matches && (
                node.matches('[data-a-target="chat-message-container"]') ||
                node.matches('.chat-line__message') ||
                node.matches('[class*="chat-line"]')
            )) {
              processMessage(node);
            }
            
            // Also check for chat messages within the added node
            const messages = node.querySelectorAll(
              '[data-a-target="chat-message-container"], .chat-line__message, [class*="chat-line"]'
            );
            messages.forEach(processMessage);
          }
        });
      });
    });

    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });

    console.log('[Austrian Translator] Observer started for chat container');
  }

  // Find the Twitch chat container
  function findChatContainer() {
    const selectors = [
      '[data-a-target="chat-scroller"]',
      '.chat-scrollable-area__message-container',
      '[class*="chat-list"]',
      '.chat-list',
      '[role="log"]',
      '.stream-chat'
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }

    // Fallback: find any scrollable chat area
    const chatArea = document.querySelector('[class*="chat"]');
    return chatArea;
  }

  // Also translate the chat input (optional feature)
  function setupInputTranslation() {
    const inputSelectors = [
      '[data-a-target="chat-input"]',
      '.chat-wysiwyg-input__editor',
      '[class*="chat-input"]'
    ];

    // We won't auto-translate input, but could add a button/hotkey for it
    // This is left as an optional enhancement
  }

  // Initialize the extension
  function init() {
    console.log('[Austrian Translator] Initializing...');
    
    loadSettings();
    listenForSettingsChanges();
    
    // Wait for the page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          processAllMessages();
          setupObserver();
        }, 2000);
      });
    } else {
      setTimeout(() => {
        processAllMessages();
        setupObserver();
      }, 2000);
    }

    // Also set up a periodic check for new chat containers (for SPAs)
    setInterval(() => {
      if (!document.querySelector('[data-austrian-observer-active]')) {
        const container = findChatContainer();
        if (container) {
          container.dataset.austrianObserverActive = 'true';
          setupObserver();
        }
      }
    }, 5000);
  }

  // Start the extension
  init();

})();
