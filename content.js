// Content script to replace favicon with custom labels
(function() {
  'use strict';
  
  const storage = browser.storage || chrome.storage;
  let currentRule = null;
  let originalFavicon = null;
  let observer = null;
  
  // Create canvas favicon with text
  function createTextFavicon(text, backgroundColor = '#667eea', foregroundColor = '#ffffff', fontSize = 'large-sans') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 32;
    canvas.height = 32;
    
    // Fill background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 32, 32);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(1, adjustBrightness(backgroundColor, -10));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    // Add subtle border
    ctx.strokeStyle = foregroundColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 31, 31);
    ctx.globalAlpha = 1.0;
    
    // Prepare text based on font size
    const upperText = text.toUpperCase();
    let lines = [];
    let fontFamily = fontSize.includes('serif') ? 'serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    
    if (fontSize.startsWith('small')) {
      // Small: 3 lines, 4 chars each
      lines = [
        upperText.substring(0, 4),
        upperText.substring(4, 8),
        upperText.substring(8, 12)
      ].filter(line => line.length > 0);
    } else {
      // Large: 2 lines, 3 chars each
      lines = [
        upperText.substring(0, 3),
        upperText.substring(3, 6)
      ].filter(line => line.length > 0);
    }
    
    // Set text properties
    ctx.fillStyle = foregroundColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    
    // Draw text lines
    if (fontSize.startsWith('small')) {
      ctx.font = `bold 7px ${fontFamily}`;
      const lineHeight = 8;
      const startY = 16 - ((lines.length - 1) * lineHeight / 2);
      
      lines.forEach((line, i) => {
        ctx.fillText(line, 16, startY + (i * lineHeight));
      });
    } else {
      ctx.font = `bold 10px ${fontFamily}`;
      if (lines.length === 2) {
        ctx.fillText(lines[0], 16, 11);
        ctx.fillText(lines[1], 16, 21);
      } else {
        ctx.font = `bold 12px ${fontFamily}`;
        ctx.fillText(lines[0], 16, 16);
      }
    }
    
    return canvas.toDataURL('image/png');
  }
  
  // Adjust color brightness
  function adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
  
  // Set favicon
  function setFavicon(dataUrl) {
    let favicon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
    
    if (favicon) {
      if (!favicon.hasAttribute('data-original')) {
        favicon.setAttribute('data-original', favicon.href);
        originalFavicon = favicon.href;
      }
      favicon.href = dataUrl;
    } else {
      // Create new favicon element
      favicon = document.createElement('link');
      favicon.rel = 'shortcut icon';
      favicon.type = 'image/png';
      favicon.href = dataUrl;
      
      // Store original if any existing favicon
      const existing = document.querySelector('link[rel*="icon"]');
      if (existing) {
        originalFavicon = existing.href;
        existing.remove();
      }
      
      document.head.appendChild(favicon);
    }
  }
  
  // Restore original favicon
  function restoreOriginalFavicon() {
    const favicon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
    if (favicon && originalFavicon) {
      favicon.href = originalFavicon;
      favicon.removeAttribute('data-original');
    }
  }
  
  // Get matching rule for current URL
  async function getMatchingRule() {
    try {
      const result = await storage.local.get(['faviconRules', 'extensionEnabled']);
      const isEnabled = result.extensionEnabled !== false;
      
      if (!isEnabled) {
        return null;
      }
      
      const rules = result.faviconRules || [];
      const url = window.location.href;
      
      for (const rule of rules) {
        if (rule.enabled && rule.pattern && rule.label) {
          try {
            const regex = new RegExp(rule.pattern, 'i');
            if (regex.test(url)) {
              return rule;
            }
          } catch (e) {
            console.warn('Invalid regex pattern:', rule.pattern, e);
          }
        }
      }
    } catch (error) {
      console.error('Error getting favicon rules:', error);
    }
    return null;
  }
  
  // Apply or remove custom favicon
  async function updateFavicon() {
    const rule = await getMatchingRule();
    
    if (rule && rule.label) {
      const ruleSignature = `${rule.label}_${rule.backgroundColor}_${rule.foregroundColor}`;
      const currentSignature = currentRule ? 
        `${currentRule.label}_${currentRule.backgroundColor}_${currentRule.foregroundColor}` : null;
      
      if (ruleSignature !== currentSignature) {
        currentRule = rule;
        const faviconData = createTextFavicon(
          rule.label, 
          rule.backgroundColor || '#667eea', 
          rule.foregroundColor || '#ffffff',
          rule.fontSize || 'large-sans'
        );
        setFavicon(faviconData);
        console.log('Applied custom favicon:', rule.label);
      }
    } else {
      if (currentRule) {
        currentRule = null;
        restoreOriginalFavicon();
        console.log('Restored original favicon');
      }
    }
  }
  
  // Initialize
  async function init() {
    // Initial update
    await updateFavicon();
    
    // Watch for URL changes (for SPAs)
    let lastUrl = location.href;
    if (observer) observer.disconnect();
    
    observer = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(updateFavicon, 100);
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }
  
  // Listen for storage changes
  storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.faviconRules || changes.extensionEnabled)) {
      updateFavicon();
    }
  });
  
  // Listen for messages from popup
  (browser.runtime || chrome.runtime).onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleExtension') {
      updateFavicon();
    }
  });
  
  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Cleanup on beforeunload
  window.addEventListener('beforeunload', () => {
    if (observer) observer.disconnect();
  });
})();