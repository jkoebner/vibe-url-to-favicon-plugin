let rules = [];
const storage = browser.storage || chrome.storage;

// Default color sets for new rules
const DEFAULT_COLOR_SETS = [
  { bg: '#667eea', fg: '#ffffff' },
  { bg: '#764ba2', fg: '#ffffff' },
  { bg: '#f093fb', fg: '#ffffff' },
  { bg: '#f5576c', fg: '#ffffff' },
  { bg: '#4facfe', fg: '#ffffff' },
  { bg: '#43e97b', fg: '#ffffff' },
  { bg: '#fa709a', fg: '#ffffff' },
  { bg: '#fee140', fg: '#000000' },
  { bg: '#48cae4', fg: '#ffffff' },
  { bg: '#f72585', fg: '#ffffff' }
];

// Load rules from storage
async function loadRules() {
  try {
    const result = await storage.local.get(['faviconRules']);
    rules = result.faviconRules || [];
    console.log('Loaded rules:', rules);
    renderRules();
  } catch (error) {
    console.error('Error loading rules:', error);
    showStatus('Error loading rules: ' + error.message, 'error');
    rules = [];
    renderRules();
  }
}

// Save rules to storage
async function saveRules() {
  try {
    collectRulesFromForm();
    console.log('Saving rules:', rules);
    await storage.local.set({ faviconRules: rules });
    showStatus('Rules saved successfully!', 'success');
    console.log('Rules saved successfully');
  } catch (error) {
    console.error('Error saving rules:', error);
    showStatus('Error saving rules: ' + error.message, 'error');
  }
}

// Collect rules from form inputs
function collectRulesFromForm() {
  const ruleItems = document.querySelectorAll('.rule-item');
  rules = [];
  
  ruleItems.forEach((item) => {
    const enabled = item.querySelector('input[type="checkbox"]').checked;
    const label = item.querySelector('input[id^="label-"]').value.substring(0, 12);
    const backgroundColor = item.querySelector('input[id^="bg-color-"]').value;
    const foregroundColor = item.querySelector('input[id^="fg-color-"]').value;
    const fontSize = item.querySelector('select[id^="font-"]').value;
    const pattern = item.querySelector('textarea[id^="pattern-"]').value;
    const description = item.querySelector('input[id^="description-"]').value;
    
    rules.push({
      enabled,
      label,
      backgroundColor,
      foregroundColor,
      fontSize,
      pattern,
      description
    });
  });
  
  console.log('Collected rules from form:', rules);
}

// Show status message
function showStatus(message, type = 'success') {
  const container = document.getElementById('status-container');
  const statusEl = document.createElement('div');
  statusEl.className = `status-message ${type}`;
  statusEl.textContent = message;
  
  container.appendChild(statusEl);
  
  // Trigger animation
  setTimeout(() => statusEl.classList.add('show'), 10);
  
  // Remove after delay
  setTimeout(() => {
    statusEl.classList.remove('show');
    setTimeout(() => container.removeChild(statusEl), 300);
  }, 3000);
}

// Get random color set
function getRandomColorSet() {
  return DEFAULT_COLOR_SETS[Math.floor(Math.random() * DEFAULT_COLOR_SETS.length)];
}

// Format label for display based on font size
function formatLabel(label, fontSize = 'large-sans') {
  if (!label) return { line1: '', line2: '', line3: '' };
  const upper = label.toUpperCase();
  
  if (fontSize.startsWith('small')) {
    // Small: 3 lines, 4 chars each (12 total)
    return {
      line1: upper.substring(0, 4),
      line2: upper.substring(4, 8),
      line3: upper.substring(8, 12)
    };
  } else {
    // Large: 2 lines, 3 chars each (6 total)
    return {
      line1: upper.substring(0, 3),
      line2: upper.substring(3, 6),
      line3: ''
    };
  }
}

// Render all rules
function renderRules() {
  const container = document.getElementById('rules-container');
  container.innerHTML = '';
  
  rules.forEach((rule, index) => {
    const ruleElement = createRuleElement(rule, index);
    container.appendChild(ruleElement);
  });
}

// Create a single rule element
function createRuleElement(rule, index) {
  const div = document.createElement('div');
  div.className = `rule-item ${rule.enabled ? '' : 'disabled'}`;
  
  const formattedLabel = formatLabel(rule.label, rule.fontSize);
  
  div.innerHTML = `
    <div class="drag-handle" title="Drag to reorder">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z"/>
      </svg>
    </div>
    <button type="button" class="btn btn-danger delete-btn" onclick="deleteRule(${index})" title="Delete rule">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
      </svg>
    </button>
    
    <div class="checkbox-group">
      <input type="checkbox" id="enabled-${index}" ${rule.enabled ? 'checked' : ''}>
      <label for="enabled-${index}">Enabled</label>
    </div>
    
    <div class="form-row">
      <div class="form-group width-120">
        <label for="label-${index}">Label</label>
        <input type="text" id="label-${index}" value="${escapeHtml(rule.label || '')}" 
               placeholder="STAGE" maxlength="12">
      </div>
      
      <div class="form-group width-100">
        <label for="bg-color-${index}">Background</label>
        <input type="color" id="bg-color-${index}" value="${rule.backgroundColor || '#667eea'}">
      </div>
      
      <div class="form-group width-100">
        <label for="fg-color-${index}">Text</label>
        <input type="color" id="fg-color-${index}" value="${rule.foregroundColor || '#ffffff'}">
      </div>
      
      <div class="form-group width-120">
        <label for="font-${index}">Font</label>
        <select id="font-${index}">
          <option value="large-sans" ${(rule.fontSize === 'large-sans' || !rule.fontSize) ? 'selected' : ''}>Large Sans</option>
          <option value="large-serif" ${rule.fontSize === 'large-serif' ? 'selected' : ''}>Large Serif</option>
          <option value="small-sans" ${rule.fontSize === 'small-sans' ? 'selected' : ''}>Small Sans</option>
          <option value="small-serif" ${rule.fontSize === 'small-serif' ? 'selected' : ''}>Small Serif</option>
        </select>
      </div>
      
      <div class="preview-favicon ${(rule.fontSize || 'large-sans').startsWith('small') ? 'small-font' : ''}" style="background: ${rule.backgroundColor || '#667eea'}; color: ${rule.foregroundColor || '#ffffff'}; font-family: ${(rule.fontSize || 'large-sans').includes('serif') ? 'serif' : 'sans-serif'};">
        <span class="line1">${formattedLabel.line1}</span>
        <span class="line2">${formattedLabel.line2}</span>
        ${formattedLabel.line3 ? `<span class="line3">${formattedLabel.line3}</span>` : ''}
      </div>
    </div>
    
    <div class="form-group">
      <label for="pattern-${index}">URL Pattern (Regular Expression)</label>
      <textarea id="pattern-${index}" placeholder="https?://stage\\.application\\.com/.*">${escapeHtml(rule.pattern || '')}</textarea>
    </div>
    
    <div class="form-group">
      <label for="description-${index}">Description</label>
      <input type="text" id="description-${index}" value="${escapeHtml(rule.description || '')}" 
             placeholder="Staging environment">
    </div>
  `;
  
  // Add event listeners
  setupRuleEventListeners(div, index);
  
  return div;
}

// Setup event listeners for a rule element
function setupRuleEventListeners(element, index) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  const labelInput = element.querySelector(`#label-${index}`);
  const bgColorInput = element.querySelector(`#bg-color-${index}`);
  const fgColorInput = element.querySelector(`#fg-color-${index}`);
  const fontSelect = element.querySelector(`#font-${index}`);
  const preview = element.querySelector('.preview-favicon');
  const dragHandle = element.querySelector('.drag-handle');
  
  checkbox.addEventListener('change', () => {
    element.className = `rule-item ${checkbox.checked ? '' : 'disabled'}`;
  });
  
  // Update preview when any visual property changes
  const updatePreview = () => {
    const fontSize = fontSelect.value;
    const formatted = formatLabel(labelInput.value, fontSize);
    
    let line1 = preview.querySelector('.line1');
    let line2 = preview.querySelector('.line2');
    let line3 = preview.querySelector('.line3');
    
    line1.textContent = formatted.line1;
    line2.textContent = formatted.line2;
    
    if (formatted.line3) {
      if (!line3) {
        line3 = document.createElement('span');
        line3.className = 'line3';
        preview.appendChild(line3);
      }
      line3.textContent = formatted.line3;
    } else if (line3) {
      line3.remove();
    }
    
    preview.style.background = bgColorInput.value;
    preview.style.color = fgColorInput.value;
    preview.style.fontFamily = fontSize.includes('serif') ? 'serif' : 'sans-serif';
    preview.className = `preview-favicon ${fontSize.startsWith('small') ? 'small-font' : ''}`;
  };
  
  labelInput.addEventListener('input', updatePreview);
  bgColorInput.addEventListener('change', updatePreview);
  fgColorInput.addEventListener('change', updatePreview);
  fontSelect.addEventListener('change', updatePreview);
  
  // Drag and drop functionality
  setupDragAndDrop(element, dragHandle);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add new rule
function addRule() {
  // Preserve existing form data before adding new rule
  collectRulesFromForm();
  
  const colors = getRandomColorSet();
  const newRule = {
    label: '',
    backgroundColor: colors.bg,
    foregroundColor: colors.fg,
    fontSize: 'large-sans',
    pattern: '',
    description: '',
    enabled: true
  };
  
  rules.push(newRule);
  renderRules();
  
  // Focus on the new rule's label input
  setTimeout(() => {
    const ruleItems = document.querySelectorAll('.rule-item');
    const lastRule = ruleItems[ruleItems.length - 1];
    if (lastRule) {
      lastRule.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const labelInput = lastRule.querySelector('input[id^="label-"]');
      if (labelInput) {
        labelInput.focus();
      }
    }
  }, 100);
}

// Delete rule
function deleteRule(index) {
  if (confirm('Are you sure you want to delete this rule?')) {
    rules.splice(index, 1);
    renderRules();
  }
}

// Export settings
function exportSettings() {
  collectRulesFromForm();
  const exportData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    rules: rules
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  document.getElementById('export-data').value = jsonString;
  document.getElementById('export-modal').style.display = 'block';
}

// Import settings
function importSettings(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.rules || !Array.isArray(data.rules)) {
      throw new Error('Invalid file format: missing rules array');
    }
    
    // Validate and sanitize rules
    const validRules = data.rules.filter(rule => {
      return rule && 
             typeof rule.pattern === 'string' && 
             typeof rule.label === 'string';
    }).map(rule => ({
      enabled: rule.enabled !== false,
      label: (rule.label || '').substring(0, 12),
      backgroundColor: rule.backgroundColor || '#667eea',
      foregroundColor: rule.foregroundColor || '#ffffff',
      fontSize: rule.fontSize || 'large-sans',
      pattern: rule.pattern || '',
      description: rule.description || ''
    }));
    
    if (validRules.length === 0) {
      throw new Error('No valid rules found in import file');
    }
    
    const message = `Import ${validRules.length} rule(s)? This will replace your current configuration.`;
    if (confirm(message)) {
      rules = validRules;
      renderRules();
      saveRules();
      showStatus(`Successfully imported ${validRules.length} rule(s)!`, 'success');
    }
  } catch (error) {
    console.error('Import error:', error);
    showStatus(`Import failed: ${error.message}`, 'error');
  }
}

// Copy to clipboard
async function copyToClipboard() {
  const exportData = document.getElementById('export-data');
  try {
    await navigator.clipboard.writeText(exportData.value);
    showStatus('Configuration copied to clipboard!', 'success');
  } catch (error) {
    // Fallback for older browsers
    exportData.select();
    document.execCommand('copy');
    showStatus('Configuration copied to clipboard!', 'success');
  }
}

// Download export file
function downloadExport() {
  const exportData = document.getElementById('export-data').value;
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `tab-favicon-labeler-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showStatus('Configuration file downloaded!', 'success');
}

// Initialize with example rules
function initializeWithExamples() {
  if (rules.length === 0) {
    rules = [
      {
        label: 'STAGE',
        backgroundColor: '#667eea',
        foregroundColor: '#ffffff',
        fontSize: 'large-sans',
        pattern: 'https?://stage\\.application\\.com/.*',
        description: 'Staging Environment',
        enabled: true
      },
      {
        label: 'PROD',
        backgroundColor: '#f5576c',
        foregroundColor: '#ffffff',
        fontSize: 'large-sans',
        pattern: 'https?://prod\\.application\\.com/.*',
        description: 'Production Environment',
        enabled: true
      }
    ];
    renderRules();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load rules and initialize
  loadRules().then(() => {
    initializeWithExamples();
  });
  
  // Main buttons
  document.getElementById('add-rule').addEventListener('click', addRule);
  document.getElementById('add-rule-bottom').addEventListener('click', addRule);
  document.getElementById('save-rules').addEventListener('click', saveRules);
  
  // Import/Export
  document.getElementById('export-btn').addEventListener('click', exportSettings);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => importSettings(e.target.result);
      reader.readAsText(file);
      e.target.value = '';
    }
  });
  
  // Modal controls
  document.getElementById('export-close').addEventListener('click', () => {
    document.getElementById('export-modal').style.display = 'none';
  });
  
  document.getElementById('copy-export').addEventListener('click', copyToClipboard);
  document.getElementById('download-export').addEventListener('click', () => {
    downloadExport();
    document.getElementById('export-modal').style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('export-modal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveRules();
    }
    if (e.key === 'Escape') {
      const modal = document.getElementById('export-modal');
      if (modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    }
  });
});

// Drag and drop functionality
function setupDragAndDrop(element, dragHandle) {
  element.draggable = true;
  
  dragHandle.addEventListener('mousedown', (e) => {
    element.style.cursor = 'grabbing';
  });
  
  element.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', element.outerHTML);
    element.classList.add('dragging');
    dragHandle.style.cursor = 'grabbing';
  });
  
  element.addEventListener('dragend', (e) => {
    element.classList.remove('dragging');
    element.style.cursor = '';
    dragHandle.style.cursor = 'grab';
  });
  
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const dragging = document.querySelector('.dragging');
    if (dragging && dragging !== element) {
      const rect = element.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (e.clientY < midY) {
        element.classList.add('drag-over-top');
        element.classList.remove('drag-over-bottom');
      } else {
        element.classList.add('drag-over-bottom');
        element.classList.remove('drag-over-top');
      }
    }
  });
  
  element.addEventListener('dragleave', (e) => {
    element.classList.remove('drag-over-top', 'drag-over-bottom');
  });
  
  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over-top', 'drag-over-bottom');
    
    const dragging = document.querySelector('.dragging');
    if (dragging && dragging !== element) {
      const container = document.getElementById('rules-container');
      const allItems = Array.from(container.children);
      const dragIndex = allItems.indexOf(dragging);
      const dropIndex = allItems.indexOf(element);
      
      if (dragIndex !== -1 && dropIndex !== -1) {
        // Collect current form data
        collectRulesFromForm();
        
        // Reorder rules array
        const draggedRule = rules.splice(dragIndex, 1)[0];
        rules.splice(dropIndex, 0, draggedRule);
        
        // Re-render
        renderRules();
      }
    }
  });
}

// Make functions available globally for onclick handlers
window.deleteRule = deleteRule;