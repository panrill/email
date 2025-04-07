/**
 * Recipients page functionality
 * Handles recipients-specific interactions and data loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize recipients functionality when the page is loaded
  if (document.querySelector('.recipients-page')) {
    initRecipients();
  }
});

/**
 * Initialize recipients functionality
 */
function initRecipients() {
  // Load recipients data
  loadRecipients();
  
  // Set up event listeners
  setupRecipientsEvents();
}

/**
 * Load recipients data from API
 */
async function loadRecipients() {
  try {
    // Show loading state
    showRecipientsLoading(true);
    
    // Fetch recipients data from API
    const recipients = await api.recipients.getAll();
    
    // Update recipients table
    updateRecipientsTable(recipients);
    
    // Hide loading state
    showRecipientsLoading(false);
  } catch (error) {
    console.error('Error loading recipients:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading recipients. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showRecipientsLoading(false);
  }
}

/**
 * Update recipients table with recipients data
 * @param {Array} recipients - List of recipients
 */
function updateRecipientsTable(recipients) {
  const tableBody = document.getElementById('recipients-table-body');
  
  if (!tableBody) return;
  
  // Clear table
  tableBody.innerHTML = '';
  
  // Check if there are recipients
  if (recipients.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">No recipients found</td>
      </tr>
    `;
    return;
  }
  
  // Add recipient rows
  recipients.forEach(recipient => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', recipient.id);
    row.innerHTML = `
      <td>${recipient.name}</td>
      <td>${recipient.email}</td>
      <td>${recipient.formsSent || 0}</td>
      <td>${recipient.formsReturned || 0}</td>
      <td>
        <div class="table-actions">
          <button class="recipient-action edit-recipient" title="Edit Recipient">
            <i class="material-icons">edit</i>
          </button>
          <button class="recipient-action send-to-recipient" title="Send Form">
            <i class="material-icons">send</i>
          </button>
          <button class="recipient-action delete-recipient" title="Delete Recipient">
            <i class="material-icons">delete</i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to recipient actions
  setupRecipientActionEvents();
}

/**
 * Set up recipients event listeners
 */
function setupRecipientsEvents() {
  // Add recipient button
  const addRecipientBtn = document.getElementById('add-recipient-btn');
  if (addRecipientBtn) {
    addRecipientBtn.addEventListener('click', showAddRecipientModal);
  }
  
  // Import recipients button
  const importRecipientsBtn = document.getElementById('import-recipients-btn');
  if (importRecipientsBtn) {
    importRecipientsBtn.addEventListener('click', showImportRecipientsModal);
  }
  
  // Export recipients button
  const exportRecipientsBtn = document.getElementById('export-recipients-btn');
  if (exportRecipientsBtn) {
    exportRecipientsBtn.addEventListener('click', exportRecipients);
  }
  
  // Search recipients input
  const searchRecipientsInput = document.getElementById('search-recipients');
  if (searchRecipientsInput) {
    searchRecipientsInput.addEventListener('input', ui.debounce(searchRecipients, 300));
  }
}

/**
 * Set up recipient action event listeners
 */
function setupRecipientActionEvents() {
  // Edit recipient buttons
  document.querySelectorAll('.edit-recipient').forEach(button => {
    button.addEventListener('click', (e) => {
      const recipientId = e.currentTarget.closest('tr').getAttribute('data-id');
      showEditRecipientModal(recipientId);
    });
  });
  
  // Send to recipient buttons
  document.querySelectorAll('.send-to-recipient').forEach(button => {
    button.addEventListener('click', (e) => {
      const recipientId = e.currentTarget.closest('tr').getAttribute('data-id');
      showSendToRecipientModal(recipientId);
    });
  });
  
  // Delete recipient buttons
  document.querySelectorAll('.delete-recipient').forEach(button => {
    button.addEventListener('click', (e) => {
      const recipientId = e.currentTarget.closest('tr').getAttribute('data-id');
      confirmDeleteRecipient(recipientId);
    });
  });
}

/**
 * Show add recipient modal
 */
function showAddRecipientModal() {
  // Create modal content
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="add-recipient-form">
      <div class="form-group">
        <label for="recipient-name">Name</label>
        <input type="text" id="recipient-name" class="form-control" placeholder="Enter recipient name" required>
      </div>
      <div class="form-group">
        <label for="recipient-email">Email</label>
        <input type="email" id="recipient-email" class="form-control" placeholder="Enter recipient email" required>
      </div>
      <div class="form-group">
        <label for="recipient-phone">Phone (optional)</label>
        <input type="tel" id="recipient-phone" class="form-control" placeholder="Enter recipient phone">
      </div>
      <div class="form-group">
        <label for="recipient-company">Company (optional)</label>
        <input type="text" id="recipient-company" class="form-control" placeholder="Enter recipient company">
      </div>
    </form>
  `;
  
  // Create modal footer
  const footer = document.createElement('div');
  footer.innerHTML = `
    <button type="button" class="btn btn-secondary" id="cancel-add-btn">Cancel</button>
    <button type="button" class="btn btn-primary" id="save-recipient-btn">Save</button>
  `;
  
  // Show modal
  const modal = ui.createModal({
    title: 'Add Recipient',
    content,
    footer,
    size: 'medium',
    onClose: () => {}
  });
  
  // Add event listeners
  const cancelAddBtn = document.getElementById('cancel-add-btn');
  const saveRecipientBtn = document.getElementById('save-recipient-btn');
  const addRecipientForm = document.getElementById('add-recipient-form');
  
  if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', () => {
      modal.close();
    });
  }
  
  if (saveRecipientBtn && addRecipientForm) {
    saveRecipientBtn.addEventListener('click', async () => {
      // Validate form
      if (!addRecipientForm.checkValidity()) {
        addRecipientForm.reportValidity();
        return;
      }
      
      // Get form data
      const name = document.getElementById('recipient-name').value;
      const email = document.getElementById('recipient-email').value;
      const phone = document.getElementById('recipient-phone').value;
      const company = document.getElementById('recipient-company').value;
      
      try {
        // Disable save button
        saveRecipientBtn.disabled = true;
        saveRecipientBtn.innerHTML = '<span class="loading-spinner-sm"></span> Saving...';
        
        // Create recipient
        await api.recipients.create({
          name,
          email,
          phone,
          company
        });
        
        // Close modal
        modal.close();
        
        // Show success notification
        ui.toast({
          message: 'Recipient added successfully!',
          type: 'success'
        });
        
        // Reload recipients
        loadRecipients();
      } catch (error) {
        console.error('Error adding recipient:', error);
        
        ui.toast({
          message: 'Error adding recipient. Please try again.',
          type: 'error'
        });
        
        // Enable save button
        saveRecipientBtn.disabled = false;
        saveRecipientBtn.textContent = 'Save';
      }
    });
  }
}

/**
 * Show edit recipient modal
 * @param {string} recipientId - Recipient ID
 */
async function showEditRecipientModal(recipientId) {
  try {
    // Get recipient data
    const recipient = await api.recipients.get(recipientId);
    
    // Create modal content
    const content = document.createElement('div');
    content.innerHTML = `
      <form id="edit-recipient-form">
        <div class="form-group">
          <label for="edit-recipient-name">Name</label>
          <input type="text" id="edit-recipient-name" class="form-control" value="${recipient.name}" required>
        </div>
        <div class="form-group">
          <label for="edit-recipient-email">Email</label>
          <input type="email" id="edit-recipient-email" class="form-control" value="${recipient.email}" required>
        </div>
        <div class="form-group">
          <label for="edit-recipient-phone">Phone (optional)</label>
          <input type="tel" id="edit-recipient-phone" class="form-control" value="${recipient.phone || ''}">
        </div>
        <div class="form-group">
          <label for="edit-recipient-company">Company (optional)</label>
          <input type="text" id="edit-recipient-company" class="form-control" value="${recipient.company || ''}">
        </div>
      </form>
    `;
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button type="button" class="btn btn-secondary" id="cancel-edit-btn">Cancel</button>
      <button type="button" class="btn btn-primary" id="update-recipient-btn">Update</button>
    `;
    
    // Show modal
    const modal = ui.createModal({
      title: 'Edit Recipient',
      content,
      footer,
      size: 'medium',
      onClose: () => {}
    });
    
    // Add event listeners
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const updateRecipientBtn = document.getElementById('update-recipient-btn');
    const editRecipientForm = document.getElementById('edit-recipient-form');
    
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        modal.close();
      });
    }
    
    if (updateRecipientBtn && editRecipientForm) {
      updateRecipientBtn.addEventListener('click', async () => {
        // Validate form
        if (!editRecipientForm.checkValidity()) {
          editRecipientForm.reportValidity();
          return;
        }
        
        // Get form data
        const name = document.getElementById('edit-recipient-name').value;
        const email = document.getElementById('edit-recipient-email').value;
        const phone = document.getElementById('edit-recipient-phone').value;
        const company = document.getElementById('edit-recipient-company').value;
        
        try {
          // Disable update button
          updateRecipientBtn.disabled = true;
          updateRecipientBtn.innerHTML = '<span class="loading-spinner-sm"></span> Updating...';
          
          // Update recipient
          await api.recipients.update(recipientId, {
            name,
            email,
            phone,
            company
          });
          
          // Close modal
          modal.close();
          
          // Show success notification
          ui.toast({
            message: 'Recipient updated successfully!',
            type: 'success'
          });
          
          // Reload recipients
          loadRecipients();
        } catch (error) {
          console.error('Error updating recipient:', error);
          
          ui.toast({
            message: 'Error updating recipient. Please try again.',
            type: 'error'
          });
          
          // Enable update button
          updateRecipientBtn.disabled = false;
          updateRecipientBtn.textContent = 'Update';
        }
      });
    }
  } catch (error) {
    console.error('Error loading recipient:', error);
    
    ui.toast({
      message: 'Error loading recipient. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Show send to recipient modal
 * @param {string} recipientId - Recipient ID
 */
async function showSendToRecipientModal(recipientId) {
  try {
    // Get recipient data
    const recipient = await api.recipients.get(recipientId);
    
    // Get forms
    const forms = await api.forms.getAll();
    
    // Create forms select options
    let formsHtml = '';
    
    if (forms.length === 0) {
      formsHtml = '<p>No forms found. Please upload forms first.</p>';
    } else {
      formsHtml = `
        <div class="form-group">
          <label for="form-select">Select Form:</label>
          <select id="form-select" class="form-control">
            ${forms.map(form => `<option value="${form.id}">${form.name}</option>`).join('')}
          </select>
        </div>
      `;
    }
    
    // Get email templates
    const settings = await api.settings.getAll();
    const emailTemplates = settings.emailTemplates || {
      defaultSubject: 'Please complete the attached form',
      defaultBody: 'Hello {Name},\n\nPlease complete the attached form and return it at your earliest convenience.\n\nThank you.'
    };
    
    // Create modal content
    const content = document.createElement('div');
    content.innerHTML = `
      <form id="send-to-recipient-form">
        <div class="form-group">
          <label>Recipient:</label>
          <p><strong>${recipient.name}</strong> (${recipient.email})</p>
        </div>
        ${formsHtml}
        <div class="form-group">
          <label for="email-subject">Subject:</label>
          <input type="text" id="email-subject" class="form-control" value="${emailTemplates.defaultSubject}">
        </div>
        <div class="form-group">
          <label for="email-message">Message:</label>
          <textarea id="email-message" class="form-control" rows="5">${emailTemplates.defaultBody.replace('{Name}', recipient.name)}</textarea>
        </div>
      </form>
    `;
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button type="button" class="btn btn-secondary" id="cancel-send-btn">Cancel</button>
      <button type="button" class="btn btn-primary" id="send-to-recipient-btn">Send</button>
    `;
    
    // Show modal
    const modal = ui.createModal({
      title: 'Send Form to Recipient',
      content,
      footer,
      size: 'medium',
      onClose: () => {}
    });
    
    // Add event listeners
    const cancelSendBtn = document.getElementById('cancel-send-btn');
    const sendToRecipientBtn = document.getElementById('send-to-recipient-btn');
    const formSelect = document.getElementById('form-select');
    
    if (cancelSendBtn) {
      cancelSendBtn.addEventListener('click', () => {
        modal.close();
      });
    }
    
    if (sendToRecipientBtn && formSelect) {
      sendToRecipientBtn.addEventListener('click', async () => {
        // Get form data
        const formId = formSelect.value;
        const subject = document.getElementById('email-subject').value;
        const message = document.getElementById('email-message').value;
        
        if (!formId) {
          ui.toast({
            message: 'Please select a form.',
            type: 'warning'
          });
          return;
        }
        
        if (!subject || !message) {
          ui.toast({
            message: 'Please enter a subject and message.',
            type: 'warning'
          });
          return;
        }
        
        try {
          // Disable send button
          sendToRecipientBtn.disabled = true;
          sendToRecipientBtn.innerHTML = '<span class="loading-spinner-sm"></span> Sending...';
          
          // Send form
          const result = await api.forms.send(formId, {
            recipients: [recipient],
            subject,
            message
          });
          
          // Close modal
          modal.close();
          
          // Show success notification
          ui.toast({
            message: `Form sent to ${recipient.name} successfully!`,
            type: 'success'
          });
          
          // Reload recipients
          loadRecipients();
        } catch (error) {
          console.error('Error sending form:', error);
          
          ui.toast({
            message: 'Error sending form. Please try again.',
            type: 'error'
          });
          
          // Enable send button
          sendToRecipientBtn.disabled = false;
          sendToRecipientBtn.textContent = 'Send';
        }
      });
    }
  } catch (error) {
    console.error('Error loading recipient or forms:', error);
    
    ui.toast({
      message: 'Error loading data. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Show import recipients modal
 */
function showImportRecipientsModal() {
  // Create modal content
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="import-recipients-form">
      <div class="form-group">
        <label>Upload CSV or Excel File:</label>
        <div id="file-upload-area" class="file-upload-area">
          <div class="file-upload-icon">
            <i class="material-icons">cloud_upload</i>
          </div>
          <div class="file-upload-text">
            <p>Drag and drop your file here, or click to browse</p>
            <p class="text-muted">Supported formats: CSV, XLSX</p>
          </div>
          <input type="file" id="import-file-input" class="file-upload-input" accept=".csv,.xlsx">
        </div>
      </div>
      <div id="import-preview" style="display: none;">
        <h4>Import Preview</h4>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody id="import-preview-body">
            </tbody>
          </table>
        </div>
      </div>
    </form>
  `;
  
  // Create modal footer
  const footer = document.createElement('div');
  footer.innerHTML = `
    <button type="button" class="btn btn-secondary" id="cancel-import-btn">Cancel</button>
    <button type="button" class="btn btn-primary" id="import-recipients-btn" disabled>Import</button>
  `;
  
  // Show modal
  const modal = ui.createModal({
    title: 'Import Recipients',
    content,
    footer,
    size: 'large',
    onClose: () => {}
  });
  
  // Add event listeners
  const cancelImportBtn = document.getElementById('cancel-import-btn');
  const importRecipientsBtn = document.getElementById('import-recipients-btn');
  const fileUploadArea = document.getElementById('file-upload-area');
  const importFileInput = document.getElementById('import-file-input');
  
  if (cancelImportBtn) {
    cancelImportBtn.addEventListener('click', () => {
      modal.close();
    });
  }
  
  if (fileUploadArea && importFileInput) {
    // Click on upload area
    fileUploadArea.addEventListener('click', () => {
      importFileInput.click();
    });
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.classList.add('dragover');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
      fileUploadArea.classList.remove('dragover');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadArea.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        importFileInput.files = e.dataTransfer.files;
        handleImportFileSelected();
      }
    });
    
    // File input change
    importFileInput.addEventListener('change', handleImportFileSelected);
  }
  
  if (importRecipientsBtn) {
    importRecipientsBtn.addEventListener('click', importRecipients);
  }
}

/**
 * Handle import file selected event
 */
function handleImportFileSelected() {
  const importFileInput = document.getElementById('import-file-input');
  
  if (!importFileInput || !importFileInput.files || importFileInput.files.length === 0) {
    return;
  }
  
  const file = importFileInput.files[0];
  
  // Validate file type
  const validExtensions = ['.csv', '.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(fileExtension)) {
    ui.toast({
      message: 'Only CSV and Excel files are allowed.',
      type: 'error'
    });
    importFileInput.value = '';
    return;
  }
  
  // Show file name in upload area
  const fileUploadText = document.querySelector('.file-upload-text');
  if (fileUploadText) {
    fileUploadText.innerHTML = `
      <p>Selected file: <strong>${file.name}</strong></p>
      <p>Size: ${ui.formatFileSize(file.size)}</p>
    `;
  }
  
  // Enable import button
  const importRecipientsBtn = document.getElementById('import-recipients-btn');
  if (importRecipientsBtn) {
    importRecipientsBtn.disabled = false;
  }
  
  // TODO: In a real implementation, we would parse the file and show a preview
  // For this demo, we'll just show a mock preview
  showImportPreview();
}

/**
 * Show import preview
 */
function showImportPreview() {
  const importPreview = document.getElementById('import-preview');
  const importPreviewBody = document.getElementById('import-preview-body');
  
  if (!importPreview || !importPreviewBody) return;
  
  // Show preview section
  importPreview.style.display = 'block';
  
  // Add mock data
  importPreviewBody.innerHTML = `
    <tr>
      <td>John Doe</td>
      <td>john.doe@example.com</td>
      <td>555-123-4567</td>
      <td>Example Corp</td>
    </tr>
    <tr>
      <td>Jane Smith</td>
      <td>jane.smith@example.com</td>
      <td>555-987-6543</td>
      <td>Sample Inc</td>
    </tr>
    <tr>
      <td>Bob Johnson</td>
      <td>bob.johnson@example.com</td>
      <td>555-555-5555</td>
      <td>Test LLC</td>
    </tr>
  `;
}

/**
 * Import recipients
 */
async function importRecipients() {
  const importFileInput = document.getElementById('import-file-input');
  
  if (!importFileInput || !importFileInput.files || importFileInput.files.length === 0) {
    ui.toast({
      message: 'Please select a file to import.',
      type: 'warning'
    });
    return;
  }
  
  const file = importFileInput.files[0];
  
  try {
    // Disable import button
    const importRecipientsBtn = document.getElementById('import-recipients-btn');
    if (importRecipientsBtn) {
      importRecipientsBtn.disabled = true;
      importRecipientsBtn.innerHTML = '<span class="loading-spinner-sm"></span> Importing...';
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Import recipients
    const result = await api.recipients.import(formData);
    
    // Close modal
    const modal = document.querySelector('.modal-container');
    if (modal) {
      modal.remove();
    }
    
    // Show success notification
    ui.toast({
      message: `${result.imported} recipients imported successfully!`,
      type: 'success'
    });
    
    // Reload recipients
    loadRecipients();
  } catch (error) {
    console.error('Error importing recipients:', error);
    
    ui.toast({
      message: 'Error importing recipients. Please try again.',
      type: 'error'
    });
    
    // Enable import button
    const importRecipientsBtn = document.getElementById('import-recipients-btn');
    if (importRecipientsBtn) {
      importRecipientsBtn.disabled = false;
      importRecipientsBtn.textContent = 'Import';
    }
  }
}

/**
 * Export recipients
 */
function exportRecipients() {
  // In a real implementation, we would call the API to export recipients
  // For this demo, we'll just show a success notification
  ui.toast({
    message: 'Recipients exported successfully!',
    type: 'success'
  });
}

/**
 * Confirm delete recipient
 * @param {string} recipientId - Recipient ID
 */
function confirmDeleteRecipient(recipientId) {
  ui.confirm({
    title: 'Delete Recipient',
    message: 'Are you sure you want to delete this recipient? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmClass: 'btn-danger'
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        // Delete recipient
        await api.recipients.delete(recipientId);
        
        // Show success notification
        ui.toast({
          message: 'Recipient deleted successfully!',
          type: 'success'
        });
        
        // Reload recipients
        loadRecipients();
      } catch (error) {
        console.error('Error deleting recipient:', error);
        
        ui.toast({
          message: 'Error deleting recipient. Please try again.',
          type: 'error'
        });
      }
    }
  });
}

/**
 * Search recipients
 */
function searchRecipients() {
  const searchInput = document.getElementById('search-recipients');
  
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll('#recipients-table-body tr:not(.empty-row)');
  
  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const email = row.cells[1].textContent.toLowerCase();
    
    if (name.includes(searchTerm) || email.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  // Show empty message if no results
  const visibleRows = document.querySelectorAll('#recipients-table-body tr:not(.empty-row):not([style*="display: none"])');
  const emptyRow = document.querySelector('#recipients-table-body tr.empty-row');
  
  if (visibleRows.length === 0 && emptyRow) {
    emptyRow.style.display = '';
    emptyRow.cells[0].textContent = `No recipients found matching "${searchTerm}"`;
  } else if (emptyRow) {
    emptyRow.style.display = 'none';
  }
}

/**
 * Show or hide recipients loading state
 * @param {boolean} isLoading - Whether recipients are loading
 */
function showRecipientsLoading(isLoading) {
  const recipientsPage = document.querySelector('.recipients-page');
  
  if (!recipientsPage) return;
  
  if (isLoading) {
    recipientsPage.classList.add('loading');
    
    // Add loading spinner if it doesn't exist
    if (!recipientsPage.querySelector('.loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading recipients...</p>
      `;
      recipientsPage.appendChild(loadingOverlay);
    }
  } else {
    recipientsPage.classList.remove('loading');
    
    // Remove loading spinner if it exists
    const loadingOverlay = recipientsPage.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
}
