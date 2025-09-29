// Background script for Tab Favicon Labeler
'use strict';

let rules = [];
const storage = browser.storage || chrome.storage;

// Load rules from storage
async function loadRules() {
  try {
    const result = await storage.local.get(['faviconRules']);
    rules = result.faviconRules || [];
    console.log('Background: Loaded', rules.length, 'rules');
  } catch (error) {
    console.error('Background: Error loading rules:', error);
    rules = [];
  }
}

// Listen for storage changes
storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.faviconRules) {
    loadRules();
    console.log('Background: Rules updated');
  }
});

// Initialize
loadRules();

console.log('Tab Favicon Labeler background script loaded');