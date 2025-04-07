/**
 * Settings page functionality
 * Handles settings-specific interactions and data loading
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize settings functionality when the page is loaded
  if (document.querySelector('.settings-page')) {
    initSettings();
  }
});

/**
 * Initialize settings functionality
 */
function initSettings() {
  // Set up tabs
  setupTabs();
  
  // Load settings data
  loadSettingsData();
  
  // Set up event listeners
  setupSettingsEvents();
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
      if (tabId === 'general-tab') {
        loadGeneralSettings();
      } else if (tabId === 'email-tab') {
        loadEmailSettings();
      } else if (tabId === 'integration-tab') {
        loadIntegrationSettings();
      } else if (tabId === 'account-tab') {
        loadAccountSettings();
      }
    });
  });
  
  // Activate first tab by default
  if (tabLinks.length > 0) {
    tabLinks[0].click();
  }
}

/**
 * Load settings data
 */
function loadSettingsData() {
  // The active tab will load its data
}

/**
 * Load general settings
 */
async function loadGeneralSettings() {
  try {
    // Show loading state
    showSettingsLoading(true, 'general-tab');
    
    // Fetch general settings from API
    const settings = await api.settings.getGeneral();
    
    // Update general settings form
    updateGeneralSettingsForm(settings);
    
    // Hide loading state
    showSettingsLoading(false, 'general-tab');
  } catch (error) {
    console.error('Error loading general settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading general settings. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showSettingsLoading(false, 'general-tab');
  }
}

/**
 * Load email settings
 */
async function loadEmailSettings() {
  try {
    // Show loading state
    showSettingsLoading(true, 'email-tab');
    
    // Fetch email settings from API
    const settings = await api.settings.getEmail();
    
    // Update email settings form
    updateEmailSettingsForm(settings);
    
    // Hide loading state
    showSettingsLoading(false, 'email-tab');
  } catch (error) {
    console.error('Error loading email settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading email settings. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showSettingsLoading(false, 'email-tab');
  }
}

/**
 * Load integration settings
 */
async function loadIntegrationSettings() {
  try {
    // Show loading state
    showSettingsLoading(true, 'integration-tab');
    
    // Fetch integration settings from API
    const settings = await api.settings.getIntegration();
    
    // Update integration settings form
    updateIntegrationSettingsForm(settings);
    
    // Hide loading state
    showSettingsLoading(false, 'integration-tab');
  } catch (error) {
    console.error('Error loading integration settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading integration settings. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showSettingsLoading(false, 'integration-tab');
  }
}

/**
 * Load account settings
 */
async function loadAccountSettings() {
  try {
    // Show loading state
    showSettingsLoading(true, 'account-tab');
    
    // Fetch account settings from API
    const settings = await api.settings.getAccount();
    
    // Update account settings form
    updateAccountSettingsForm(settings);
    
    // Hide loading state
    showSettingsLoading(false, 'account-tab');
  } catch (error) {
    console.error('Error loading account settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error loading account settings. Please try again.',
      type: 'error'
    });
    
    // Hide loading state
    showSettingsLoading(false, 'account-tab');
  }
}

/**
 * Update general settings form
 * @param {Object} settings - General settings
 */
function updateGeneralSettingsForm(settings) {
  // Application name
  const appNameInput = document.getElementById('app-name');
  if (appNameInput && settings.appName) {
    appNameInput.value = settings.appName;
  }
  
  // Date format
  const dateFormatSelect = document.getElementById('date-format');
  if (dateFormatSelect && settings.dateFormat) {
    dateFormatSelect.value = settings.dateFormat;
  }
  
  // Time zone
  const timeZoneSelect = document.getElementById('time-zone');
  if (timeZoneSelect && settings.timeZone) {
    timeZoneSelect.value = settings.timeZone;
  }
  
  // Language
  const languageSelect = document.getElementById('language');
  if (languageSelect && settings.language) {
    languageSelect.value = settings.language;
  }
}

/**
 * Update email settings form
 * @param {Object} settings - Email settings
 */
function updateEmailSettingsForm(settings) {
  // Default subject
  const defaultSubjectInput = document.getElementById('default-subject');
  if (defaultSubjectInput && settings.defaultSubject) {
    defaultSubjectInput.value = settings.defaultSubject;
  }
  
  // Default message
  const defaultMessageTextarea = document.getElementById('default-message');
  if (defaultMessageTextarea && settings.defaultMessage) {
    defaultMessageTextarea.value = settings.defaultMessage;
  }
  
  // Email signature
  const emailSignatureTextarea = document.getElementById('email-signature');
  if (emailSignatureTextarea && settings.emailSignature) {
    emailSignatureTextarea.value = settings.emailSignature;
  }
  
  // Reply-to email
  const replyToEmailInput = document.getElementById('reply-to-email');
  if (replyToEmailInput && settings.replyToEmail) {
    replyToEmailInput.value = settings.replyToEmail;
  }
}

/**
 * Update integration settings form
 * @param {Object} settings - Integration settings
 */
function updateIntegrationSettingsForm(settings) {
  // Client ID
  const clientIdInput = document.getElementById('client-id');
  if (clientIdInput && settings.clientId) {
    clientIdInput.value = settings.clientId;
  }
  
  // Client secret
  const clientSecretInput = document.getElementById('client-secret');
  if (clientSecretInput && settings.clientSecret) {
    // For security, don't show the actual secret
    clientSecretInput.value = settings.clientSecret ? '••••••••••••••••' : '';
  }
  
  // SharePoint site
  const sharepointSiteInput = document.getElementById('sharepoint-site');
  if (sharepointSiteInput && settings.sharepointSite) {
    sharepointSiteInput.value = settings.sharepointSite;
  }
  
  // OneDrive folder
  const onedriveFolderInput = document.getElementById('onedrive-folder');
  if (onedriveFolderInput && settings.onedriveFolder) {
    onedriveFolderInput.value = settings.onedriveFolder;
  }
  
  // Integration status
  const integrationStatusElement = document.getElementById('integration-status');
  if (integrationStatusElement) {
    if (settings.integrationStatus === 'connected') {
      integrationStatusElement.innerHTML = '<span class="status-badge status-success">Connected</span>';
    } else {
      integrationStatusElement.innerHTML = '<span class="status-badge status-warning">Not Connected</span>';
    }
  }
}

/**
 * Update account settings form
 * @param {Object} settings - Account settings
 */
function updateAccountSettingsForm(settings) {
  // Name
  const nameInput = document.getElementById('account-name');
  if (nameInput && settings.name) {
    nameInput.value = settings.name;
  }
  
  // Email
  const emailInput = document.getElementById('account-email');
  if (emailInput && settings.email) {
    emailInput.value = settings.email;
    // Email is read-only
    emailInput.setAttribute('readonly', 'readonly');
  }
}

/**
 * Set up settings event listeners
 */
function setupSettingsEvents() {
  // Save general settings button
  const saveGeneralBtn = document.getElementById('save-general-btn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', saveGeneralSettings);
  }
  
  // Save email settings button
  const saveEmailBtn = document.getElementById('save-email-btn');
  if (saveEmailBtn) {
    saveEmailBtn.addEventListener('click', saveEmailSettings);
  }
  
  // Save integration settings button
  const saveIntegrationBtn = document.getElementById('save-integration-btn');
  if (saveIntegrationBtn) {
    saveIntegrationBtn.addEventListener('click', saveIntegrationSettings);
  }
  
  // Test integration button
  const testIntegrationBtn = document.getElementById('test-integration-btn');
  if (testIntegrationBtn) {
    testIntegrationBtn.addEventListener('click', testIntegration);
  }
  
  // Save account settings button
  const saveAccountBtn = document.getElementById('save-account-btn');
  if (saveAccountBtn) {
    saveAccountBtn.addEventListener('click', saveAccountSettings);
  }
  
  // Change password button
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', showChangePasswordModal);
  }
  
  // Create backup button
  const createBackupBtn = document.getElementById('create-backup-btn');
  if (createBackupBtn) {
    createBackupBtn.addEventListener('click', createBackup);
  }
  
  // Restore backup button
  const restoreBackupBtn = document.getElementById('restore-backup-btn');
  if (restoreBackupBtn) {
    restoreBackupBtn.addEventListener('click', showRestoreBackupModal);
  }
}

/**
 * Save general settings
 */
async function saveGeneralSettings() {
  try {
    // Get form data
    const appName = document.getElementById('app-name').value;
    const dateFormat = document.getElementById('date-format').value;
    const timeZone = document.getElementById('time-zone').value;
    const language = document.getElementById('language').value;
    
    // Validate form data
    if (!appName) {
      ui.toast({
        message: 'Please enter an application name.',
        type: 'warning'
      });
      return;
    }
    
    // Disable save button
    const saveGeneralBtn = document.getElementById('save-general-btn');
    if (saveGeneralBtn) {
      saveGeneralBtn.disabled = true;
      saveGeneralBtn.innerHTML = '<span class="loading-spinner-sm"></span> Saving...';
    }
    
    // Save settings
    await api.settings.saveGeneral({
      appName,
      dateFormat,
      timeZone,
      language
    });
    
    // Show success notification
    ui.toast({
      message: 'General settings saved successfully!',
      type: 'success'
    });
    
    // Enable save button
    if (saveGeneralBtn) {
      saveGeneralBtn.disabled = false;
      saveGeneralBtn.textContent = 'Save Changes';
    }
  } catch (error) {
    console.error('Error saving general settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error saving general settings. Please try again.',
      type: 'error'
    });
    
    // Enable save button
    const saveGeneralBtn = document.getElementById('save-general-btn');
    if (saveGeneralBtn) {
      saveGeneralBtn.disabled = false;
      saveGeneralBtn.textContent = 'Save Changes';
    }
  }
}

/**
 * Save email settings
 */
async function saveEmailSettings() {
  try {
    // Get form data
    const defaultSubject = document.getElementById('default-subject').value;
    const defaultMessage = document.getElementById('default-message').value;
    const emailSignature = document.getElementById('email-signature').value;
    const replyToEmail = document.getElementById('reply-to-email').value;
    
    // Validate form data
    if (!defaultSubject || !defaultMessage) {
      ui.toast({
        message: 'Please enter a default subject and message.',
        type: 'warning'
      });
      return;
    }
    
    if (replyToEmail && !ui.validateEmail(replyToEmail)) {
      ui.toast({
        message: 'Please enter a valid reply-to email address.',
        type: 'warning'
      });
      return;
    }
    
    // Disable save button
    const saveEmailBtn = document.getElementById('save-email-btn');
    if (saveEmailBtn) {
      saveEmailBtn.disabled = true;
      saveEmailBtn.innerHTML = '<span class="loading-spinner-sm"></span> Saving...';
    }
    
    // Save settings
    await api.settings.saveEmail({
      defaultSubject,
      defaultMessage,
      emailSignature,
      replyToEmail
    });
    
    // Show success notification
    ui.toast({
      message: 'Email settings saved successfully!',
      type: 'success'
    });
    
    // Enable save button
    if (saveEmailBtn) {
      saveEmailBtn.disabled = false;
      saveEmailBtn.textContent = 'Save Changes';
    }
  } catch (error) {
    console.error('Error saving email settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error saving email settings. Please try again.',
      type: 'error'
    });
    
    // Enable save button
    const saveEmailBtn = document.getElementById('save-email-btn');
    if (saveEmailBtn) {
      saveEmailBtn.disabled = false;
      saveEmailBtn.textContent = 'Save Changes';
    }
  }
}

/**
 * Save integration settings
 */
async function saveIntegrationSettings() {
  try {
    // Get form data
    const clientId = document.getElementById('client-id').value;
    const clientSecret = document.getElementById('client-secret').value;
    const sharepointSite = document.getElementById('sharepoint-site').value;
    const onedriveFolder = document.getElementById('onedrive-folder').value;
    
    // Validate form data
    if (!clientId || !sharepointSite) {
      ui.toast({
        message: 'Please enter a client ID and SharePoint site.',
        type: 'warning'
      });
      return;
    }
    
    // Disable save button
    const saveIntegrationBtn = document.getElementById('save-integration-btn');
    if (saveIntegrationBtn) {
      saveIntegrationBtn.disabled = true;
      saveIntegrationBtn.innerHTML = '<span class="loading-spinner-sm"></span> Saving...';
    }
    
    // Save settings
    await api.settings.saveIntegration({
      clientId,
      clientSecret: clientSecret === '••••••••••••••••' ? null : clientSecret, // Only send if changed
      sharepointSite,
      onedriveFolder
    });
    
    // Show success notification
    ui.toast({
      message: 'Integration settings saved successfully!',
      type: 'success'
    });
    
    // Enable save button
    if (saveIntegrationBtn) {
      saveIntegrationBtn.disabled = false;
      saveIntegrationBtn.textContent = 'Save Changes';
    }
    
    // Reload integration settings
    loadIntegrationSettings();
  } catch (error) {
    console.error('Error saving integration settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error saving integration settings. Please try again.',
      type: 'error'
    });
    
    // Enable save button
    const saveIntegrationBtn = document.getElementById('save-integration-btn');
    if (saveIntegrationBtn) {
      saveIntegrationBtn.disabled = false;
      saveIntegrationBtn.textContent = 'Save Changes';
    }
  }
}

/**
 * Test integration
 */
async function testIntegration() {
  try {
    // Disable test button
    const testIntegrationBtn = document.getElementById('test-integration-btn');
    if (testIntegrationBtn) {
      testIntegrationBtn.disabled = true;
      testIntegrationBtn.innerHTML = '<span class="loading-spinner-sm"></span> Testing...';
    }
    
    // Test integration
    const result = await api.settings.testIntegration();
    
    // Show result notification
    if (result.success) {
      ui.toast({
        message: 'Integration test successful!',
        type: 'success'
      });
    } else {
      ui.toast({
        message: `Integration test failed: ${result.error}`,
        type: 'error'
      });
    }
    
    // Enable test button
    if (testIntegrationBtn) {
      testIntegrationBtn.disabled = false;
      testIntegrationBtn.textContent = 'Test Integration';
    }
    
    // Reload integration settings
    loadIntegrationSettings();
  } catch (error) {
    console.error('Error testing integration:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error testing integration. Please try again.',
      type: 'error'
    });
    
    // Enable test button
    const testIntegrationBtn = document.getElementById('test-integration-btn');
    if (testIntegrationBtn) {
      testIntegrationBtn.disabled = false;
      testIntegrationBtn.textContent = 'Test Integration';
    }
  }
}

/**
 * Save account settings
 */
async function saveAccountSettings() {
  try {
    // Get form data
    const name = document.getElementById('account-name').value;
    
    // Validate form data
    if (!name) {
      ui.toast({
        message: 'Please enter your name.',
        type: 'warning'
      });
      return;
    }
    
    // Disable save button
    const saveAccountBtn = document.getElementById('save-account-btn');
    if (saveAccountBtn) {
      saveAccountBtn.disabled = true;
      saveAccountBtn.innerHTML = '<span class="loading-spinner-sm"></span> Saving...';
    }
    
    // Save settings
    await api.settings.saveAccount({
      name
    });
    
    // Show success notification
    ui.toast({
      message: 'Account settings saved successfully!',
      type: 'success'
    });
    
    // Enable save button
    if (saveAccountBtn) {
      saveAccountBtn.disabled = false;
      saveAccountBtn.textContent = 'Save Changes';
    }
    
    // Update user info in header
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = name;
    }
  } catch (error) {
    console.error('Error saving account settings:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error saving account settings. Please try again.',
      type: 'error'
    });
    
    // Enable save button
    const saveAccountBtn = document.getElementById('save-account-btn');
    if (saveAccountBtn) {
      saveAccountBtn.disabled = false;
      saveAccountBtn.textContent = 'Save Changes';
    }
  }
}

/**
 * Show change password modal
 */
function showChangePasswordModal() {
  // Create modal content
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="change-password-form">
      <div class="form-group">
        <label for="current-password">Current Password</label>
        <input type="password" id="current-password" class="form-control" placeholder="Enter current password" required>
      </div>
      <div class="form-group">
        <label for="new-password">New Password</label>
        <input type="password" id="new-password" class="form-control" placeholder="Enter new password" required>
        <small class="form-text text-muted">Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.</small>
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm New Password</label>
        <input type="password" id="confirm-password" class="form-control" placeholder="Confirm new password" required>
      </div>
    </form>
  `;
  
  // Create modal footer
  const footer = document.createElement('div');
  footer.innerHTML = `
    <button type="button" class="btn btn-secondary" id="cancel-password-btn">Cancel</button>
    <button type="button" class="btn btn-primary" id="change-password-submit-btn">Change Password</button>
  `;
  
  // Show modal
  const modal = ui.createModal({
    title: 'Change Password',
    content,
    footer,
    size: 'medium',
    onClose: () => {}
  });
  
  // Add event listeners
  const cancelPasswordBtn = document.getElementById('cancel-password-btn');
  const changePasswordSubmitBtn = document.getElementById('change-password-submit-btn');
  const changePasswordForm = document.getElementById('change-password-form');
  
  if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', () => {
      modal.close();
    });
  }
  
  if (changePasswordSubmitBtn && changePasswordForm) {
    changePasswordSubmitBtn.addEventListener('click', async () => {
      // Validate form
      if (!changePasswordForm.checkValidity()) {
        changePasswordForm.reportValidity();
        return;
      }
      
      // Get form data
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate passwords
      if (newPassword !== confirmPassword) {
        ui.toast({
          message: 'New password and confirm password do not match.',
          type: 'warning'
        });
        return;
      }
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        ui.toast({
          message: 'Password does not meet the requirements.',
          type: 'warning'
        });
        return;
      }
      
      try {
        // Disable change password button
        changePasswordSubmitBtn.disabled = true;
        changePasswordSubmitBtn.innerHTML = '<span class="loading-spinner-sm"></span> Changing...';
        
        // Change password
        await api.settings.changePassword({
          currentPassword,
          newPassword
        });
        
        // Close modal
        modal.close();
        
        // Show success notification
        ui.toast({
          message: 'Password changed successfully!',
          type: 'success'
        });
      } catch (error) {
        console.error('Error changing password:', error);
        
        // Show error notification
        ui.toast({
          message: 'Error changing password. Please check your current password and try again.',
          type: 'error'
        });
        
        // Enable change password button
        changePasswordSubmitBtn.disabled = false;
        changePasswordSubmitBtn.textContent = 'Change Password';
      }
    });
  }
}

/**
 * Create backup
 */
async function createBackup() {
  try {
    // Disable create backup button
    const createBackupBtn = document.getElementById('create-backup-btn');
    if (createBackupBtn) {
      createBackupBtn.disabled = true;
      createBackupBtn.innerHTML = '<span class="loading-spinner-sm"></span> Creating...';
    }
    
    // Create backup
    const result = await api.settings.createBackup();
    
    // Show success notification
    ui.toast({
      message: 'Backup created successfully!',
      type: 'success'
    });
    
    // Download backup
    window.open(result.downloadUrl, '_blank');
    
    // Enable create backup button
    if (createBackupBtn) {
      createBackupBtn.disabled = false;
      createBackupBtn.innerHTML = '<i class="material-icons">backup</i> Create Backup';
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    
    // Show error notification
    ui.toast({
      message: 'Error creating backup. Please try again.',
      type: 'error'
    });
    
    // Enable create backup button
    const createBackupBtn = document.getElementById('create-backup-btn');
    if (createBackupBtn) {
      createBackupBtn.disabled = false;
      createBackupBtn.innerHTML = '<i class="material-icons">backup</i> Create Backup';
    }
  }
}

/**
 * Show restore backup modal
 */
function showRestoreBackupModal() {
  // Create modal content
  const content = document.createElement('div');
  content.innerHTML = `
    <form id="restore-backup-form">
      <div class="form-group">
        <label>Upload Backup File:</label>
        <div id="file-upload-area" class="file-upload-area">
          <div class="file-upload-icon">
            <i class="material-icons">restore</i>
          </div>
          <div class="file-upload-text">
            <p>Drag and drop your backup file here, or click to browse</p>
            <p class="text-muted">Supported format: .zip</p>
          </div>
          <input type="file" id="backup-file-input" class="file-upload-input" accept=".zip">
        </div>
      </div>
      <div class="alert alert-warning">
        <i class="material-icons">warning</i>
        <span>Warning: Restoring a backup will overwrite all current data. This action cannot be undone.</span>
      </div>
    </form>
  `;
  
  // Create modal footer
  const footer = document.createElement('div');
  footer.innerHTML = `
    <button type="button" class="btn btn-secondary" id="cancel-restore-btn">Cancel</button>
    <button type="button" class="btn btn-danger" id="restore-backup-btn" disabled>Restore Backup</button>
  `;
  
  // Show modal
  const modal = ui.createModal({
    title: 'Restore Backup',
    content,
    footer,
    size: 'medium',
    onClose: () => {}
  });
  
  // Add event listeners
  const cancelRestoreBtn = document.getElementById('cancel-restore-btn');
  const restoreBackupBtn = document.getElementById('restore-backup-btn');
  const fileUploadArea = document.getElementById('file-upload-area');
  const backupFileInput = document.getElementById('backup-file-input');
  
  if (cancelRestoreBtn) {
    cancelRestoreBtn.addEventListener('click', () => {
      modal.close();
    });
  }
  
  if (fileUploadArea && backupFileInput) {
    // Click on upload area
    fileUploadArea.addEventListener('click', () => {
      backupFileInput.click();
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
        backupFileInput.files = e.dataTransfer.files;
        handleBackupFileSelected();
      }
    });
    
    // File input change
    backupFileInput.addEventListener('change', handleBackupFileSelected);
  }
  
  if (restoreBackupBtn) {
    restoreBackupBtn.addEventListener('click', restoreBackup);
  }
  
  /**
   * Handle backup file selected event
   */
  function handleBackupFileSelected() {
    if (!backupFileInput || !backupFileInput.files || backupFileInput.files.length === 0) {
      return;
    }
    
    const file = backupFileInput.files[0];
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      ui.toast({
        message: 'Only ZIP files are allowed.',
        type: 'error'
      });
      backupFileInput.value = '';
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
    
    // Enable restore button
    if (restoreBackupBtn) {
      restoreBackupBtn.disabled = false;
    }
  }
  
  /**
   * Restore backup
   */
  async function restoreBackup() {
    if (!backupFileInput || !backupFileInput.files || backupFileInput.files.length === 0) {
      ui.toast({
        message: 'Please select a backup file.',
        type: 'warning'
      });
      return;
    }
    
    const file = backupFileInput.files[0];
    
    // Confirm restore
    ui.confirm({
      title: 'Restore Backup',
      message: 'Are you sure you want to restore this backup? All current data will be overwritten. This action cannot be undone.',
      confirmText: 'Restore',
      cancelText: 'Cancel',
      confirmClass: 'btn-danger'
    }).then(async (confirmed) => {
      if (confirmed) {
        try {
          // Disable restore button
          if (restoreBackupBtn) {
            restoreBackupBtn.disabled = true;
            restoreBackupBtn.innerHTML = '<span class="loading-spinner-sm"></span> Restoring...';
          }
          
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          
          // Restore backup
          await api.settings.restoreBackup(formData);
          
          // Close modal
          modal.close();
          
          // Show success notification
          ui.toast({
            message: 'Backup restored successfully! The page will reload in 5 seconds.',
            type: 'success'
          });
          
          // Reload page after 5 seconds
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        } catch (error) {
          console.error('Error restoring backup:', error);
          
          // Show error notification
          ui.toast({
            message: 'Error restoring backup. Please try again.',
            type: 'error'
          });
          
          // Enable restore button
          if (restoreBackupBtn) {
            restoreBackupBtn.disabled = false;
            restoreBackupBtn.textContent = 'Restore Backup';
          }
        }
      }
    });
  }
}

/**
 * Show or hide settings loading state
 * @param {boolean} isLoading - Whether settings are loading
 * @param {string} tabId - Tab ID
 */
function showSettingsLoading(isLoading, tabId) {
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
        <p>Loading settings...</p>
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
