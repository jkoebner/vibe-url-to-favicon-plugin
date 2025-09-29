document.addEventListener('DOMContentLoaded', async () => {
  const storage = browser.storage || chrome.storage;
  
  // Open options page
  document.getElementById('open-options').addEventListener('click', () => {
    if (browser.runtime && browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // Fallback
      const optionsUrl = browser.runtime.getURL('options.html') || chrome.runtime.getURL('options.html');
      const createTab = browser.tabs.create || chrome.tabs.create;
      createTab({ url: optionsUrl });
    }
    window.close();
  });
  
  // Format label for display (3 chars per line)
  function formatLabel(label) {
    if (!label) return { line1: '', line2: '' };
    const upper = label.toUpperCase();
    return {
      line1: upper.substring(0, 3),
      line2: upper.substring(3, 6)
    };
  }
  
  // Load and display current status
  try {
    const result = await storage.local.get(['faviconRules']);
    const rules = result.faviconRules || [];
    const enabledRules = rules.filter(rule => rule.enabled && rule.label && rule.pattern);
    
    // Update status badge
    const statusEl = document.getElementById('status');
    statusEl.textContent = `${enabledRules.length} active rule${enabledRules.length !== 1 ? 's' : ''}`;
    statusEl.className = `status-badge ${enabledRules.length > 0 ? 'active' : 'inactive'}`;
    
    // Show preview of active rules
    const previewContainer = document.getElementById('preview-container');
    
    if (enabledRules.length > 0) {
      const headerEl = document.createElement('div');
      headerEl.className = 'preview-header';
      headerEl.textContent = 'Active Labels:';
      previewContainer.appendChild(headerEl);
      
      const gridEl = document.createElement('div');
      gridEl.className = 'preview-grid';
      
      enabledRules.forEach(rule => {
        const formatted = formatLabel(rule.label);
        const itemEl = document.createElement('div');
        itemEl.className = 'preview-item';
        
        itemEl.innerHTML = `
          <div class="preview-favicon" style="background: ${rule.backgroundColor}; color: ${rule.foregroundColor};">
            <span class="line1">${formatted.line1}</span>
            <span class="line2">${formatted.line2}</span>
          </div>
          <div class="preview-text">
            <div class="preview-description">${rule.description || 'Unnamed Rule'}</div>
            <div class="preview-pattern">${rule.pattern}</div>
          </div>
        `;
        
        gridEl.appendChild(itemEl);
      });
      
      previewContainer.appendChild(gridEl);
    } else {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      emptyEl.textContent = 'No active rules configured';
      previewContainer.appendChild(emptyEl);
    }
    
  } catch (error) {
    console.error('Error loading rules in popup:', error);
    
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Error loading rules';
    statusEl.className = 'status-badge inactive';
  }
});