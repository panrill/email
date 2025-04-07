/**
 * Forms page functionality
 * Handles forms-specific interactions and data loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize forms functionality when the page is loaded
  if (document.querySelector('.forms-page')) {
    initForms();
  }
});

/**
 * Initialize forms functionality
 */
function initForms() {
  // Load forms data
  loadForms();
  
  // Set up event listeners
  setupFormsEvents();
}

/**
 * Load forms data from API
 */
async function loadForms() {
  try {
    // Show loading state
    showFormsLoading(true);
    
    // Fetch forms data from API
    const forms = await api.forms.getAll();
    
    // Update forms container
    updateFormsContainer(forms);
    
    // Hide loading state
    showFormsLoading(false);
  } catch (error) {
    console.error('Error loading forms:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading forms. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showFormsLoading(false);
  }
}

/**
 * Update forms container with forms data
 * @param {Array} forms - List of forms
 */
function updateFormsContainer(forms) {
  const formsContainer = document.getElementById('forms-container');
  
  if (!formsContainer) return;
  
  // Clear container
  formsContainer.innerHTML = '';
  
  // Check if there are forms
  if (forms.length === 0) {
    formsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="material-icons">description</i>
        </div>
        <h3>No Forms Found</h3>
        <p>Upload a form to get started.</p>
        <button id="empty-upload-btn" class="btn btn-primary">
          <i class="material-icons">upload_file</i>
          Upload Form
        </button>
      </div>
    `;
    
    // Add event listener to empty state upload button
    const emptyUploadBtn = document.getElementById('empty-upload-btn');
    if (emptyUploadBtn) {
      emptyUploadBtn.addEventListener('click', showUploadForm);
    }
    
    return;
  }
  
  // Add form cards
  forms.forEach(form => {
    const formCard = templates.createElement('form-card-template', {
      id: form.id,
      name: form.name,
      size: ui.formatFileSize(form.size),
      created: ui.formatDate(form.created)
    });
    
    formsContainer.appendChild(formCard);
  });
  
  // Add event listeners to form cards
  setupFormCardEvents();
}

/**
 * Set up forms event listeners
 */
function setupFormsEvents() {
  // Upload form button
  const uploadFormBtn = document.getElementById('upload-form-btn');
  if (uploadFormBtn) {
    uploadFormBtn.addEventListener('click', showUploadForm);
  }
  
  // File upload area
  const fileUploadArea = document.getElementById('file-upload-area');
  const fileUploadInput = document.getElementById('file-upload-input');
  
  if (fileUploadArea && fileUploadInput) {
    // Click on upload area
    fileUploadArea.addEventListener('click', () => {
      fileUploadInput.click();
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
        fileUploadInput.files = e.dataTransfer.files;
        handleFileSelected();
      }
    });
    
    // File input change
    fileUploadInput.addEventListener('change', handleFileSelected);
  }
  
  // Upload button
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadForm);
  }
  
  // Cancel upload button
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  if (cancelUploadBtn) {
    cancelUploadBtn.addEventListener('click', hideUploadForm);
  }
}

/**
 * Set up form card event listeners
 */
function setupFormCardEvents() {
  // View form buttons
  document.querySelectorAll('.view-form').forEach(button => {
    button.addEventListener('click', (e) => {
      const formId = e.currentTarget.getAttribute('data-id');
      viewForm(formId);
    });
  });
  
  // Send form buttons
  document.querySelectorAll('.send-form').forEach(button => {
    button.addEventListener('click', (e) => {
      const formId = e.currentTarget.getAttribute('data-id');
      showSendFormModal(formId);
    });
  });
  
  // Delete form buttons
  document.querySelectorAll('.delete-form').forEach(button => {
    button.addEventListener('click', (e) => {
      const formId = e.currentTarget.getAttribute('data-id');
      confirmDeleteForm(formId);
    });
  });
}

/**
 * Show the upload form container
 */
function showUploadForm() {
  const uploadContainer = document.querySelector('.form-upload-container');
  if (uploadContainer) {
    uploadContainer.style.display = 'block';
  }
}

/**
 * Hide the upload form container
 */
function hideUploadForm() {
  const uploadContainer = document.querySelector('.form-upload-container');
  if (uploadContainer) {
    uploadContainer.style.display = 'none';
    
    // Reset file input
    const fileUploadInput = document.getElementById('file-upload-input');
    if (fileUploadInput) {
      fileUploadInput.value = '';
    }
    
    // Reset progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const uploadProgress = document.getElementById('upload-progress');
    
    if (progressBar && progressText && uploadProgress) {
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
      uploadProgress.classList.remove('active');
    }
  }
}

/**
 * Handle file selected event
 */
function handleFileSelected() {
  const fileUploadInput = document.getElementById('file-upload-input');
  
  if (!fileUploadInput || !fileUploadInput.files || fileUploadInput.files.length === 0) {
    return;
  }
  
  const file = fileUploadInput.files[0];
  
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    ui.toast({
      message: 'Only PDF files are allowed.',
      type: 'error'
    });
    fileUploadInput.value = '';
    return;
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    ui.toast({
      message: 'File size exceeds the maximum limit of 10MB.',
      type: 'error'
    });
    fileUploadInput.value = '';
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
}

/**
 * Upload form to server
 */
async function uploadForm() {
  const fileUploadInput = document.getElementById('file-upload-input');
  
  if (!fileUploadInput || !fileUploadInput.files || fileUploadInput.files.length === 0) {
    ui.toast({
      message: 'Please select a file to upload.',
      type: 'warning'
    });
    return;
  }
  
  const file = fileUploadInput.files[0];
  
  // Show progress bar
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const uploadProgress = document.getElementById('upload-progress');
  
  if (progressBar && progressText && uploadProgress) {
    uploadProgress.classList.add('active');
  }
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload file
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        
        if (progressBar && progressText) {
          progressBar.style.width = `${percentComplete}%`;
          progressText.textContent = `${percentComplete}%`;
        }
      }
    });
    
    // Handle response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Success
        ui.toast({
          message: 'Form uploaded successfully!',
          type: 'success'
        });
        
        // Hide upload form
        hideUploadForm();
        
        // Reload forms
        loadForms();
      } else {
        // Error
        ui.toast({
          message: `Upload failed: ${xhr.statusText}`,
          type: 'error'
        });
      }
    });
    
    // Handle error
    xhr.addEventListener('error', () => {
      ui.toast({
        message: 'Upload failed. Please try again.',
        type: 'error'
      });
    });
    
    // Send request
    xhr.open('POST', `${api.baseUrl}/forms`);
    
    // Add authorization header
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  } catch (error) {
    console.error('Error uploading form:', error);
    
    ui.toast({
      message: 'Error uploading form. Please try again.',
      type: 'error'
    });
    
    // Hide progress bar
    if (uploadProgress) {
      uploadProgress.classList.remove('active');
    }
  }
}

/**
 * View a form
 * @param {string} formId - Form ID
 */
function viewForm(formId) {
  window.open(`${api.baseUrl}/forms/${formId}`, '_blank');
}

/**
 * Show send form modal
 * @param {string} formId - Form ID
 */
async function showSendFormModal(formId) {
  try {
    // Get recipients
    const recipients = await api.recipients.getAll();
    
    // Create recipients checkboxes
    let recipientsHtml = '';
    
    if (recipients.length === 0) {
      recipientsHtml = '<p>No recipients found. Please add recipients first.</p>';
    } else {
      recipientsHtml = `
        <div class="form-group">
          <label>Select Recipients:</label>
          <div class="recipients-list">
            ${recipients.map(recipient => `
              <div class="form-check">
                <input type="checkbox" id="recipient-${recipient.id}" class="form-check-input recipient-checkbox" value="${recipient.id}" data-name="${recipient.name}" data-email="${recipient.email}">
                <label for="recipient-${recipient.id}" class="form-check-label">${recipient.name} (${recipient.email})</label>
              </div>
            `).join('')}
          </div>
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
      <form id="send-form-form">
        ${recipientsHtml}
        <div class="form-group">
          <label for="email-subject">Subject:</label>
          <input type="text" id="email-subject" class="form-control" value="${emailTemplates.defaultSubject}">
        </div>
        <div class="form-group">
          <label for="email-message">Message:</label>
          <textarea id="email-message" class="form-control" rows="5">${emailTemplates.defaultBody}</textarea>
        </div>
      </form>
    `;
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button type="button" class="btn btn-secondary" id="cancel-send-btn">Cancel</button>
      <button type="button" class="btn btn-primary" id="send-form-btn">Send</button>
    `;
    
    // Show modal
    const modal = ui.createModal({
      title: 'Send Form',
      content,
      footer,
      size: 'large',
      onClose: () => {}
    });
    
    // Add event listeners
    const cancelSendBtn = document.getElementById('cancel-send-btn');
    const sendFormBtn = document.getElementById('send-form-btn');
    
    if (cancelSendBtn) {
      cancelSendBtn.addEventListener('click', () => {
        modal.close();
      });
    }
    
    if (sendFormBtn) {
      sendFormBtn.addEventListener('click', async () => {
        // Get selected recipients
        const selectedRecipients = [];
        document.querySelectorAll('.recipient-checkbox:checked').forEach(checkbox => {
          selectedRecipients.push({
            id: checkbox.value,
            name: checkbox.getAttribute('data-name'),
            email: checkbox.getAttribute('data-email')
          });
        });
        
        if (selectedRecipients.length === 0) {
          ui.toast({
            message: 'Please select at least one recipient.',
            type: 'warning'
          });
          return;
        }
        
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
          // Disable send button
          sendFormBtn.disabled = true;
          sendFormBtn.innerHTML = '<span class="loading-spinner-sm"></span> Sending...';
          
          // Send form
          const result = await api.forms.send(formId, {
            recipients: selectedRecipients,
            subject,
            message
          });
          
          // Close modal
          modal.close();
          
          // Show success notification
          ui.toast({
            message: `Form sent to ${selectedRecipients.length} recipient(s) successfully!`,
            type: 'success'
          });
        } catch (error) {
          console.error('Error sending form:', error);
          
          ui.toast({
            message: 'Error sending form. Please try again.',
            type: 'error'
          });
          
          // Enable send button
          sendFormBtn.disabled = false;
          sendFormBtn.textContent = 'Send';
        }
      });
    }
  } catch (error) {
    console.error('Error showing send form modal:', error);
    
    ui.toast({
      message: 'Error loading recipients. Please try again.',
      type: 'error'
    });
  }
}

/**
 * Confirm delete form
 * @param {string} formId - Form ID
 */
function confirmDeleteForm(formId) {
  ui.confirm({
    title: 'Delete Form',
    message: 'Are you sure you want to delete this form? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmClass: 'btn-danger'
  }).then(async (confirmed) => {
    if (confirmed) {
      try {
        // Delete form
        await api.forms.delete(formId);
        
        // Show success notification
        ui.toast({
          message: 'Form deleted successfully!',
          type: 'success'
        });
        
        // Reload forms
        loadForms();
      } catch (error) {
        console.error('Error deleting form:', error);
        
        ui.toast({
          message: 'Error deleting form. Please try again.',
          type: 'error'
        });
      }
    }
  });
}

/**
 * Show or hide forms loading state
 * @param {boolean} isLoading - Whether forms are loading
 */
function showFormsLoading(isLoading) {
  const formsPage = document.querySelector('.forms-page');
  
  if (!formsPage) return;
  
  if (isLoading) {
    formsPage.classList.add('loading');
    
    // Add loading spinner if it doesn't exist
    if (!formsPage.querySelector('.loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading forms...</p>
      `;
      formsPage.appendChild(loadingOverlay);
    }
  } else {
    formsPage.classList.remove('loading');
    
    // Remove loading spinner if it exists
    const loadingOverlay = formsPage.querySelector('.loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
}
