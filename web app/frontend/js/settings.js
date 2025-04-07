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
  
(Content truncated due to size limit. Use line ranges to read in chunks)