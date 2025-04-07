/**
 * Tracking page functionality
 * Handles tracking-specific interactions and data loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tracking functionality when the page is loaded
  if (document.querySelector('.tracking-page')) {
    initTracking();
  }
});

/**
 * Initialize tracking functionality
 */
function initTracking() {
  // Load tracking data
  loadTracking();
  
  // Set up event listeners
  setupTrackingEvents();
}

/**
 * Load tracking data from API
 */
async function loadTracking() {
  try {
    // Show loading state
    showTrackingLoading(true);
    
    // Fetch tracking data from API
    const tracking = await api.tracking.getAll();
    
    // Update tracking table
    updateTrackingTable(tracking);
    
    // Hide loading state
    showTrackingLoading(false);
  } catch (error) {
    console.error('Error loading tracking data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading tracking data. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showTrackingLoading(false);
  }
}

/**
 * Update tracking table with tracking data
 * @param {Array} tracking - List of tracking records
 */
function updateTrackingTable(tracking) {
  const tableBody = document.getElementById('tracking-table-body');
  
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Check if there are tracking records
  if (tracking.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No tracking records found</td>
      </tr>
    `;
    return;
  }
  
  // Add tracking rows
  tracking.forEach(record => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', record.id);
    
    // Determine status class
    let statusClass = '';
    let statusText = record.status;
    
    switch (record.status.toLowerCase()) {
      case 'sent':
        statusClass = 'status-info';
        break;
      case 'returned':
        statusClass = 'status-success';
        break;
      case 'not returned':
        statusClass = 'status-warning';
        break;
      case 'expired':
        statusClass = 'status-danger';
        break;
      default:
        statusClass = 'status-default';
    }
    
    row.innerHTML = `
      <td>${record.formName}</td>
      <td>${record.recipientName}</td>
      <td>${ui.formatDate(record.sentDate)}</td>
      <td>${record.returnDate ? ui.formatDate(record.returnDate) : '-'}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="table-actions">
          <button class="tracking-action view-form" title="View Form">
            <i class="material-icons">description</i>
          </button>
          ${record.status.toLowerCase() === 'returned' ? `
            <button class="tracking-action view-return" title="View Return">
              <i class="material-icons">visibility</i>
            </button>
            <button class="tracking-action extract-data" title="Extract Data">
              <i class="material-icons">data_usage</i>
            </button>
          ` : `
            <button class="tracking-action resend-form" title="Resend Form">
              <i class="material-icons">send</i>
            </button>
          `}
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to tracking actions
  setupTrackingActionEvents();
}

/**
 * Set up tracking event listeners
 */
function setupTrackingEvents() {
  // Check returns button
  const checkReturnsBtn = document.getElementById('check-returns-btn');
  if (checkReturnsBtn) {
    checkReturnsBtn.addEventListener('click', checkReturns);
  }
  
  // Generate report button
  const generateReportBtn = document.getElementById('generate-report-btn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateReport);
  }
  
  // Filter form select
  const filterFormSelect = document.getElementById('filter-form');
  if (filterFormSelect) {
    filterFormSelect.addEventListener('change', filterTracking);
  }
  
  // Filter recipient select
  const filterRecipientSelect = document.getElementById('filter-recipient');
  if (filterRecipientSelect) {
    filterRecipientSelect.addEventListener('change', filterTracking);
  }
  
  // Filter status select
  const filterStatusSelect = document.getElementById('filter-status');
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', filterTracking);
  }
  
  // Load filter options
  loadFilterOptions();
}

/**
 * Set up tracking action event listeners
 */
function setupTrackingActionEvents() {
  // View form buttons
  document.querySelectorAll('.view-form').forEach(button => {
    button.addEventListener('click', (e) => {
      const trackingId = e.currentTarget.closest('tr').getAttribute('data-id');
      viewForm(trackingId);
    });
  });
  
  // View return buttons
  document.querySelectorAll('.view-return').forEach(button => {
    button.addEventListener('click', (e) => {
      const trackingId = e.currentTarget.closest('tr').getAttribute('data-id');
      viewReturn(trackingId);
    });
  });
  
  // Extract data buttons
  document.querySelectorAll('.extract-data').forEach(button => {
    button.addEventListener('click', (e) => {
      const trackingId = e.currentTarget.closest('tr').getAttribute('data-id');
      extractData(trackingId);
    });
  });
  
  // Resend form buttons
  document.querySelectorAll('.resend-form').forEach(button => {
    button.addEventListener('click', (e) => {
      const trackingId = e.currentTarget.closest('tr').getAttribute('data-id');
      resendForm(trackingId);
    });
  });
}

/**
 * Load filter options
 */
async function loadFilterOptions() {
  try {
    // Get forms
    const forms = await api.forms.getAll();
    
    // Update form filter
    const filterFormSelect = document.getElementById('filter-form');
    if (filterFormSelect) {
      // Clear options except first
      while (filterFormSelect.options.length > 1) {
        filterFormSelect.remove(1);
      }
      
      // Add form options
      forms.forEach(form => {
        const option = document.createElement('option');
        option.value = form.id;
        option.textContent = form.name;
        filterFormSelect.appendChild(option);
      });
    }
    
    // Get recipients
    const recipients = await api.recipients.getAll();
    
    // Update recipient filter
    const filterRecipientSelect = document.getElementById('filter-recipient');
    if (filterRecipientSelect) {
      // Clear options except first
      while (filterRecipientSelect.options.length > 1) {
        filterRecipientSelect.remove(1);
      }
      
      // Add recipient options
      recipients.forEach(recipient => {
        const option = document.createElement('option');
        option.value = recipient.id;
        option.textContent = recipient.name;
        filterRecipientSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

/**
 * Filter tracking records
 */
async function filterTracking() {
  try {
    // Show loading state
    showTrackingLoading(true);
    
    // Get filter values
    const formId = document.getElementById('filter-form').value;
    const recipientId = document.getElementById('filter-recipient').value;
    const status = document.getElementById('filter-status').value;
    
    // Create filter object
    const filters = {};
    
    if (formId) {
      filters.formId = formId;
    }
    
    if (recipientId) {
      filters.recipientId = recipientId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    // Fetch filtered tracking data
    const tracking = await api.tracking.getFiltered(filters);
    
    // Update tracking table
    updateTrackingTable(tracking);
    
    // Hide loading state
    showTrackingLoading(false);
  } catch (error) {
    console.error('Error filtering tracking data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error filtering tracking data. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showTrackingLoading(false);
  }
}

/**
 * Check for returned forms
 */
async function checkReturns() {
  try {
    // Disable check returns button
    const checkReturnsBtn = document.getElementById('check-returns-btn');
    if (checkReturnsBtn) {
      checkReturnsBtn.disabled = true;
      checkReturnsBtn.innerHTML = '<span class="loading-spinner-sm"></span> Checking...';
    }
    
    // Check for returns
    const result = await api.tracking.checkReturns();
    
    // Show success notification
    ui.toast({
      message: `Check complete: ${result.newReturns} new returns found.`,
      type: 'success'
    });
    
    // Reload tracking data
    loadTracking();
    
    // Enable check returns button
    if (checkReturnsBtn) {
      checkReturnsBtn.disabled = false;
      checkReturnsBtn.innerHTML = '<i class="material-icons">refresh</i> Check Returns';
    }
  } catch (error) {
    console.error('Error checking returns:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error checking returns. Please try again.',
      type: 'error'
    });
    
    // Enable check returns button
    const checkReturnsBtn = document.getElementById('check-returns-btn');
    if (checkReturnsBtn) {
      checkReturnsBtn.disabled = false;
      checkReturnsBtn.innerHTML = '<i class="material-icons">refresh</i> Check Returns';
    }
  }
}

/**
 * Generate tracking report
 */
async function generateReport() {
  try {
    // Disable generate report button
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn) {
      generateReportBtn.disabled = true;
      generateReportBtn.innerHTML = '<span class="loading-spinner-sm"></span> Generating...';
    }
    
    // Get filter values
    const formId = document.getElementById('filter-form').value;
    const recipientId = document.getElementById('filter-recipient').value;
    const status = document.getElementById('filter-status').value;
    
    // Create filter object
    const filters = {};
    
    if (formId) {
      filters.formId = formId;
    }
    
    if (recipientId) {
      filters.recipientId = recipientId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    // Generate report
    const result = await api.tracking.generateReport(filters);
    
    // Show success notification
    ui.toast({
      message: 'Report generated successfully!',
      type: 'success'
    });
    
    // Download report
    window.open(result.reportUrl, '_blank');
    
    // Enable generate report button
    if (generateReportBtn) {
      generateReportBtn.disabled = false;
      generateReportBtn.innerHTML = '<i class="material-icons">description</i> Generate Report';
    }
  } catch (error) {
    console.error('Error generating report:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error generating report. Please try again.',
      type: 'error'
    });
    
    // Enable generate report button
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn) {
      generateReportBtn.disabled = false;
      generateReportBtn.innerHTML = '<i class="material-icons">description</i> Generate Report';
    }
  }
}

/**
 * View form
 * @param {string} trackingId - Tracking ID
 */
async function viewForm(trackingId) {
  try {
    // Get tracking record
    const record = await api.tracking.get(trackingId);
    
    // Open form in new tab
    window.open(`${api.baseUrl}/forms/${record.formId}`, '_blank');
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
 * View returned form
 * @param {string} trackingId - Tracking ID
 */
async function viewReturn(trackingId) {
  try {
    // Get tracking record
    const record = await api.tracking.get(trackingId);
    
    // Open returned form in new tab
    window.open(`${api.baseUrl}/tracking/${trackingId}/return`, '_blank');
  } catch (error) {
    console.error('Error viewing return:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error viewing returned form. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Extract data from returned form
 * @param {string} trackingId - Tracking ID
 */
async function extractData(trackingId) {
  try {
    // Show loading notification
    ui.toast({
      message: 'Extracting data from form...',
      type: 'info'
    });
    
    // Extract data
    const result = await api.extraction.extract(trackingId);
    
    // Show success notification
    ui.toast({
      message: 'Data extracted successfully!',
      type: 'success'
    });
    
    // Navigate to extraction page
    router.navigate('/extraction');
  } catch (error) {
    console.error('Error extracting data:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error extracting data. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Resend form
 * @param {string} trackingId - Tracking ID
 */
async function resendForm(trackingId) {
  try {
    // Get tracking record
    const record = await api.tracking.get(trackingId);
    
    // Create modal content
    const content = document.createElement('div');
    content.innerHTML = `
      <form id="resend-form-form">
        <div class="form-group">
          <label>Recipient:</label>
          <p><strong>${record.recipientName}</strong> (${record.recipientEmail})</p>
        </div>
        <div class="form-group">
          <label>Form:</label>
          <p><strong>${record.formName}</strong></p>
        </div>
        <div class="form-group">
          <label for="email-subject">Subject:</label>
          <input type="text" id="email-subject" class="form-control" value="Reminder: Please complete the attached form">
        </div>
        <div class="form-group">
          <label for="email-message">Message:</label>
          <textarea id="email-message" class="form-control" rows="5">Hello ${record.recipientName},

This is a reminder to please complete the attached form and return it at your earliest convenience.

Thank you.</textarea>
        </div>
      </form>
    `;
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button type="button" class="btn btn-secondary" id="cancel-resend-btn">Cancel</button>
      <button type="button" class="btn btn-primary" id="resend-form-btn">Resend</button>
    `;
    
    // Show modal
    const modal = ui.createModal({
      title: 'Resend Form',
      content,
      footer,
      size: 'medium',
      onClose: () => {}
    });
    
    // Add event listeners
    const cancelResendBtn = document.getElementById('cancel-resend-btn');
    const resendFormBtn = document.getElementById('resend-form-btn');
    
    if (cancelResendBtn) {
      cancelResendBtn.addEventListener('click', () => {
        modal.close();
      });
    }
    
    if (resendFormBtn) {
      resendFormBtn.addEventListener('click', async () => {
        // Get subject and message
        const subject = document.getElementById('email-subject').value;
        const message = document.getElementById('email-message').value;
        
        if (!subject || !message) {
          ui.toast({
            message: 'Please enter a subject and message.',
            type: 'warning'
          });
          return;
        }
        
        try {
          // Disable resend button
          resendFormBtn.disabled = true;
          resendFormBtn.innerHTML = '<span class="loading-spinner-sm"></span> Sending...';
          
          // Resend form
          const result = await api.tracking.resend(trackingId, {
            subject,
            message
          });
          
          // Close modal
          modal.close();
          
          // Show success notification
          ui.toast({
            message: 'Form resent successfully!',
            type: 'success'
          });
          
          // Reload tracking data
          loadTracking();
        } catch (error) {
          console.error('Error resending form:', error);
          
          ui.toast({
            message: 'Error resending form. Please try again.',
            type: 'error'
          });
          
          // Enable resend button
          resendFormBtn.disabled = false;
          resendFormBtn.textContent = 'Resend';
        }
      });
    }
  } catch (error) {
    console.error('Error preparing to resend form:', error);
    
    ui.toast({
      message: 'Error preparing to resend form. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Show or hide tracking loading state
 * @param {boolean} isLoading - Whether tracking is loading
 */
function showTrackingLoading(isLoading) {
  const trackingPage = document.querySelector('.tracking-page');
  
  if (!trackingPage) return;
  
  if (isLoading) {
    trackingPage.classList.add('loading');
    
    // Add loading spinner if it doesn't exist
    if (!trackingPage.querySelector('.loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading tracking data...</p>
      `;
      trackingPage.appendChild(loadingOverlay);
    }
  } else {
    trackingPage.classList.remove('loading');
    
    // Remove loading spinner if it exists
    const loadingOverlay = trackingPage.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
}
