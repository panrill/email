/**
 * Data Extraction page functionality
 * Handles extraction-specific interactions and data loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize extraction functionality when the page is loaded
  if (document.querySelector('.extraction-page')) {
    initExtraction();
  }
});

/**
 * Initialize extraction functionality
 */
function initExtraction() {
  // Set up tabs
  setupTabs();
  
  // Load extraction data
  loadExtractionData();
  
  // Set up event listeners
  setupExtractionEvents();
}

/**
 * Set up tabs
 */
function setupTabs() {
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get tab ID
      const tabId = link.getAttribute('data-tab');
      
      // Remove active class from all tab links
      tabLinks.forEach(link => {
        link.classList.remove('active');
      });
      
      // Add active class to current tab link
      link.classList.add('active');
      
      // Hide all tab contents
      tabContents.forEach(content => {
        content.style.display = 'none';
      });
      
      // Show current tab content
      document.getElementById(tabId).style.display = 'block';
      
      // Load tab data
      if (tabId === 'pending-tab') {
        loadPendingExtractions();
      } else if (tabId === 'extracted-tab') {
        loadExtractedData();
      }
    });
  });
  
  // Activate first tab by default
  if (tabLinks.length > 0) {
    tabLinks[0].click();
  }
}

/**
 * Load extraction data
 */
function loadExtractionData() {
  // The active tab will load its data
}

/**
 * Load pending extractions
 */
async function loadPendingExtractions() {
  try {
    // Show loading state
    showExtractionLoading(true, 'pending-tab');
    
    // Fetch pending extractions from API
    const pendingExtractions = await api.extraction.getPending();
    
    // Update pending extractions table
    updatePendingExtractionsTable(pendingExtractions);
    
    // Hide loading state
    showExtractionLoading(false, 'pending-tab');
  } catch (error) {
    console.error('Error loading pending extractions:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading pending extractions. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showExtractionLoading(false, 'pending-tab');
  }
}

/**
 * Load extracted data
 */
async function loadExtractedData() {
  try {
    // Show loading state
    showExtractionLoading(true, 'extracted-tab');
    
    // Fetch extracted data from API
    const extractedData = await api.extraction.getData();
    
    // Update extracted data table
    updateExtractedDataTable(extractedData);
    
    // Hide loading state
    showExtractionLoading(false, 'extracted-tab');
  } catch (error) {
    console.error('Error loading extracted data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading extracted data. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showExtractionLoading(false, 'extracted-tab');
  }
}

/**
 * Update pending extractions table
 * @param {Array} pendingExtractions - List of pending extractions
 */
function updatePendingExtractionsTable(pendingExtractions) {
  const tableBody = document.getElementById('pending-extractions-table-body');
  
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Check if there are pending extractions
  if (pendingExtractions.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No pending extractions found</td>
      </tr>
    `;
    
    // Disable process selected button
    const processSelectedBtn = document.getElementById('process-selected-btn');
    if (processSelectedBtn) {
      processSelectedBtn.disabled = true;
    }
    
    return;
  }
  
  // Enable process selected button
  const processSelectedBtn = document.getElementById('process-selected-btn');
  if (processSelectedBtn) {
    processSelectedBtn.disabled = false;
  }
  
  // Add pending extraction rows
  pendingExtractions.forEach(extraction => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', extraction.id);
    row.innerHTML = `
      <td>
        <div class="form-check">
          <input type="checkbox" class="form-check-input extraction-checkbox" id="extraction-${extraction.id}">
          <label class="form-check-label" for="extraction-${extraction.id}"></label>
        </div>
      </td>
      <td>${extraction.formName}</td>
      <td>${extraction.recipientName}</td>
      <td>${ui.formatDate(extraction.returnDate)}</td>
      <td>
        <div class="table-actions">
          <button class="extraction-action view-form" title="View Form">
            <i class="material-icons">visibility</i>
          </button>
          <button class="extraction-action process-extraction" title="Process Extraction">
            <i class="material-icons">data_usage</i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to extraction actions
  setupPendingExtractionEvents();
}

/**
 * Update extracted data table
 * @param {Array} extractedData - List of extracted data records
 */
function updateExtractedDataTable(extractedData) {
  const tableBody = document.getElementById('extracted-data-table-body');
  
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Check if there is extracted data
  if (extractedData.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No extracted data found</td>
      </tr>
    `;
    
    // Disable export to Excel button
    const exportToExcelBtn = document.getElementById('export-to-excel-btn');
    if (exportToExcelBtn) {
      exportToExcelBtn.disabled = true;
    }
    
    return;
  }
  
  // Enable export to Excel button
  const exportToExcelBtn = document.getElementById('export-to-excel-btn');
  if (exportToExcelBtn) {
    exportToExcelBtn.disabled = false;
  }
  
  // Add extracted data rows
  extractedData.forEach(data => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', data.id);
    row.innerHTML = `
      <td>
        <div class="form-check">
          <input type="checkbox" class="form-check-input data-checkbox" id="data-${data.id}">
          <label class="form-check-label" for="data-${data.id}"></label>
        </div>
      </td>
      <td>${data.formName}</td>
      <td>${data.recipientName}</td>
      <td>${ui.formatDate(data.extractionDate)}</td>
      <td>${data.fieldCount} fields</td>
      <td>
        <div class="table-actions">
          <button class="data-action view-data" title="View Data">
            <i class="material-icons">visibility</i>
          </button>
          <button class="data-action download-data" title="Download Data">
            <i class="material-icons">download</i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to data actions
  setupExtractedDataEvents();
}

/**
 * Set up extraction event listeners
 */
function setupExtractionEvents() {
  // Select all pending extractions checkbox
  const selectAllPendingCheckbox = document.getElementById('select-all-pending');
  if (selectAllPendingCheckbox) {
    selectAllPendingCheckbox.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.extraction-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllPendingCheckbox.checked;
      });
    });
  }
  
  // Select all extracted data checkbox
  const selectAllDataCheckbox = document.getElementById('select-all-data');
  if (selectAllDataCheckbox) {
    selectAllDataCheckbox.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.data-checkbox');
      checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllDataCheckbox.checked;
      });
    });
  }
  
  // Process selected button
  const processSelectedBtn = document.getElementById('process-selected-btn');
  if (processSelectedBtn) {
    processSelectedBtn.addEventListener('click', processSelectedExtractions);
  }
  
  // Export to Excel button
  const exportToExcelBtn = document.getElementById('export-to-excel-btn');
  if (exportToExcelBtn) {
    exportToExcelBtn.addEventListener('click', exportSelectedToExcel);
  }
}

/**
 * Set up pending extraction event listeners
 */
function setupPendingExtractionEvents() {
  // View form buttons
  document.querySelectorAll('.pending-tab .view-form').forEach(button => {
    button.addEventListener('click', (e) => {
      const extractionId = e.currentTarget.closest('tr').getAttribute('data-id');
      viewPendingForm(extractionId);
    });
  });
  
  // Process extraction buttons
  document.querySelectorAll('.pending-tab .process-extraction').forEach(button => {
    button.addEventListener('click', (e) => {
      const extractionId = e.currentTarget.closest('tr').getAttribute('data-id');
      processExtraction(extractionId);
    });
  });
}

/**
 * Set up extracted data event listeners
 */
function setupExtractedDataEvents() {
  // View data buttons
  document.querySelectorAll('.extracted-tab .view-data').forEach(button => {
    button.addEventListener('click', (e) => {
      const dataId = e.currentTarget.closest('tr').getAttribute('data-id');
      viewExtractedData(dataId);
    });
  });
  
  // Download data buttons
  document.querySelectorAll('.extracted-tab .download-data').forEach(button => {
    button.addEventListener('click', (e) => {
      const dataId = e.currentTarget.closest('tr').getAttribute('data-id');
      downloadExtractedData(dataId);
    });
  });
}

/**
 * View pending form
 * @param {string} extractionId - Extraction ID
 */
async function viewPendingForm(extractionId) {
  try {
    // Get extraction data
    const extraction = await api.extraction.getPending(extractionId);
    
    // Open form in new tab
    window.open(`${api.baseUrl}/tracking/${extraction.trackingId}/return`, '_blank');
  } catch (error) {
    console.error('Error viewing form:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error viewing form. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Process extraction
 * @param {string} extractionId - Extraction ID
 */
async function processExtraction(extractionId) {
  try {
    // Show loading notification
    ui.toast({
      message: 'Processing extraction...',
      type: 'info'
    });
    
    // Process extraction
    const result = await api.extraction.process(extractionId);
    
    // Show success notification
    ui.toast({
      message: 'Extraction processed successfully!',
      type: 'success'
    });
    
    // Reload data
    loadPendingExtractions();
    loadExtractedData();
    
    // Switch to extracted tab
    document.querySelector('.tab-link[data-tab="extracted-tab"]').click();
  } catch (error) {
    console.error('Error processing extraction:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error processing extraction. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Process selected extractions
 */
async function processSelectedExtractions() {
  // Get selected extractions
  const selectedCheckboxes = document.querySelectorAll('.extraction-checkbox:checked');
  
  if (selectedCheckboxes.length === 0) {
    ui.toast({
      message: 'Please select at least one extraction to process.',
      type: 'warning'
    });
    return;
  }
  
  // Confirm processing
  ui.confirm({
    title: 'Process Extractions',
    message: `Are you sure you want to process ${selectedCheckboxes.length} selected extraction(s)?`,
    confirmText: 'Process',
    cancelText: 'Cancel'
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        // Disable process selected button
        const processSelectedBtn = document.getElementById('process-selected-btn');
        if (processSelectedBtn) {
          processSelectedBtn.disabled = true;
          processSelectedBtn.innerHTML = '<span class="loading-spinner-sm"></span> Processing...';
        }
        
        // Get extraction IDs
        const extractionIds = Array.from(selectedCheckboxes).map(checkbox => {
          return checkbox.closest('tr').getAttribute('data-id');
        });
        
        // Process extractions
        const result = await api.extraction.processMultiple(extractionIds);
        
        // Show success notification
        ui.toast({
          message: `${result.processed} extraction(s) processed successfully!`,
          type: 'success'
        });
        
        // Reload data
        loadPendingExtractions();
        loadExtractedData();
        
        // Switch to extracted tab
        document.querySelector('.tab-link[data-tab="extracted-tab"]').click();
        
        // Enable process selected button
        if (processSelectedBtn) {
          processSelectedBtn.disabled = false;
          processSelectedBtn.innerHTML = 'Process Selected';
        }
      } catch (error) {
        console.error('Error processing extractions:', error);
        
        // Show error notification
        ui.toast({
          message: 'Error processing extractions. Please try again.',
          type: 'error'
        });
        
        // Enable process selected button
        const processSelectedBtn = document.getElementById('process-selected-btn');
        if (processSelectedBtn) {
          processSelectedBtn.disabled = false;
          processSelectedBtn.innerHTML = 'Process Selected';
        }
      }
    }
  });
}

/**
 * View extracted data
 * @param {string} dataId - Data ID
 */
async function viewExtractedData(dataId) {
  try {
    // Get extracted data
    const data = await api.extraction.getData(dataId);
    
    // Create modal content
    const content = document.createElement('div');
    
    // Create table of extracted fields
    let fieldsHtml = '';
    
    if (data.fields && data.fields.length > 0) {
      fieldsHtml = `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${data.fields.map(field => `
                <tr>
                  <td>${field.name}</td>
                  <td>${field.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      fieldsHtml = '<p>No fields found in extracted data.</p>';
    }
    
    content.innerHTML = `
      <div class="extraction-details">
        <div class="form-group">
          <label>Form:</label>
          <p><strong>${data.formName}</strong></p>
        </div>
        <div class="form-group">
          <label>Recipient:</label>
          <p><strong>${data.recipientName}</strong> (${data.recipientEmail})</p>
        </div>
        <div class="form-group">
          <label>Extraction Date:</label>
          <p>${ui.formatDate(data.extractionDate)}</p>
        </div>
        <div class="form-group">
          <label>Extracted Fields:</label>
          ${fieldsHtml}
        </div>
      </div>
    `;
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button type="button" class="btn btn-secondary" id="close-view-btn">Close</button>
      <button type="button" class="btn btn-primary" id="download-data-btn">Download Data</button>
    `;
    
    // Show modal
    const modal = ui.createModal({
      title: 'View Extracted Data',
      content,
      footer,
      size: 'large',
      onClose: () => {}
    });
    
    // Add event listeners
    const closeViewBtn = document.getElementById('close-view-btn');
    const downloadDataBtn = document.getElementById('download-data-btn');
    
    if (closeViewBtn) {
      closeViewBtn.addEventListener('click', () => {
        modal.close();
      });
    }
    
    if (downloadDataBtn) {
      downloadDataBtn.addEventListener('click', () => {
        downloadExtractedData(dataId);
      });
    }
  } catch (error) {
    console.error('Error viewing extracted data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error viewing extracted data. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Download extracted data
 * @param {string} dataId - Data ID
 */
async function downloadExtractedData(dataId) {
  try {
    // Download data
    const result = await api.extraction.download(dataId);
    
    // Open download URL
    window.open(result.downloadUrl, '_blank');
  } catch (error) {
    console.error('Error downloading extracted data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error downloading extracted data. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Export selected data to Excel
 */
async function exportSelectedToExcel() {
  // Get selected data
  const selectedCheckboxes = document.querySelectorAll('.data-checkbox:checked');
  
  if (selectedCheckboxes.length === 0) {
    ui.toast({
      message: 'Please select at least one data record to export.',
      type: 'warning'
    });
    return;
  }
  
  try {
    // Disable export button
    const exportToExcelBtn = document.getElementById('export-to-excel-btn');
    if (exportToExcelBtn) {
      exportToExcelBtn.disabled = true;
      exportToExcelBtn.innerHTML = '<span class="loading-spinner-sm"></span> Exporting...';
    }
    
    // Get data IDs
    const dataIds = Array.from(selectedCheckboxes).map(checkbox => {
      return checkbox.closest('tr').getAttribute('data-id');
    });
    
    // Export to Excel
    const result = await api.extraction.exportToExcel(dataIds);
    
    // Show success notification
    ui.toast({
      message: 'Data exported to Excel successfully!',
      type: 'success'
    });
    
    // Open download URL
    window.open(result.downloadUrl, '_blank');
    
    // Enable export button
    if (exportToExcelBtn) {
      exportToExcelBtn.disabled = false;
      exportToExcelBtn.innerHTML = 'Export to Excel';
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error exporting to Excel. Please try again.',
      type: 'error'
    });
    
    // Enable export button
    const exportToExcelBtn = document.getElementById('export-to-excel-btn');
    if (exportToExcelBtn) {
      exportToExcelBtn.disabled = false;
      exportToExcelBtn.innerHTML = 'Export to Excel';
    }
  }
}

/**
 * Show or hide extraction loading state
 * @param {boolean} isLoading - Whether extraction is loading
 * @param {string} tabId - Tab ID
 */
function showExtractionLoading(isLoading, tabId) {
  const tabContent = document.getElementById(tabId);
  
  if (!tabContent) return;
  
  if (isLoading) {
    tabContent.classList.add('loading');
    
    // Add loading spinner if it doesn't exist
    if (!tabContent.querySelector('.loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading data...</p>
      `;
      tabContent.appendChild(loadingOverlay);
    }
  } else {
    tabContent.classList.remove('loading');
    
    // Remove loading spinner if it exists
    const loadingOverlay = tabContent.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
}
