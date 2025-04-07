/**
 * API module
 * Handles communication with the backend API
 */
const api = {
  /**
   * Base URL for API requests
   */
  baseUrl: '/api',
  
  /**
   * Initialize the API module
   * @param {string} baseUrl - Base URL for API requests (optional)
   */
  init(baseUrl) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  },
  
  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves with the response data
   */
  async request(endpoint, options = {}) {
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      // Set up headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Set up request options
      const requestOptions = {
        ...options,
        headers
      };
      
      // Make the request
      const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Check for error response
        if (!response.ok) {
          throw new Error(data.error || data.message || 'API request failed');
        }
        
        return data;
      } else {
        // For non-JSON responses (like file downloads)
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        return response;
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },
  
  /**
   * Authentication API endpoints
   */
  auth: {
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Promise that resolves with the login response
     */
    login(email, password) {
      return api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} - Promise that resolves with the registration response
     */
    register(userData) {
      return api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },
    
    /**
     * Get current user data
     * @returns {Promise} - Promise that resolves with the user data
     */
    getUser() {
      return api.request('/auth/user');
    }
  },
  
  /**
   * Dashboard API endpoints
   */
  dashboard: {
    /**
     * Get dashboard summary data
     * @returns {Promise} - Promise that resolves with the dashboard data
     */
    getSummary() {
      return api.request('/dashboard/summary');
    }
  },
  
  /**
   * Forms API endpoints
   */
  forms: {
    /**
     * Get all forms
     * @returns {Promise} - Promise that resolves with the forms list
     */
    getAll() {
      return api.request('/forms');
    },
    
    /**
     * Get a specific form
     * @param {string} id - Form ID
     * @returns {Promise} - Promise that resolves with the form data
     */
    get(id) {
      return api.request(`/forms/${id}`);
    },
    
    /**
     * Create a new form
     * @param {FormData} formData - Form data
     * @returns {Promise} - Promise that resolves with the created form
     */
    create(formData) {
      return api.request('/forms', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set content type for FormData
      });
    },
    
    /**
     * Update a form
     * @param {string} id - Form ID
     * @param {Object} data - Form update data
     * @returns {Promise} - Promise that resolves with the updated form
     */
    update(id, data) {
      return api.request(`/forms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    /**
     * Delete a form
     * @param {string} id - Form ID
     * @returns {Promise} - Promise that resolves with the deletion response
     */
    delete(id) {
      return api.request(`/forms/${id}`, {
        method: 'DELETE'
      });
    },
    
    /**
     * Send a form to recipients
     * @param {string} id - Form ID
     * @param {Object} data - Send form data (recipients, subject, message)
     * @returns {Promise} - Promise that resolves with the send response
     */
    send(id, data) {
      return api.request(`/forms/${id}/send`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },
  
  /**
   * Recipients API endpoints
   */
  recipients: {
    /**
     * Get all recipients
     * @returns {Promise} - Promise that resolves with the recipients list
     */
    getAll() {
      return api.request('/recipients');
    },
    
    /**
     * Get a specific recipient
     * @param {string} id - Recipient ID
     * @returns {Promise} - Promise that resolves with the recipient data
     */
    get(id) {
      return api.request(`/recipients/${id}`);
    },
    
    /**
     * Create a new recipient
     * @param {Object} data - Recipient data
     * @returns {Promise} - Promise that resolves with the created recipient
     */
    create(data) {
      return api.request('/recipients', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    /**
     * Update a recipient
     * @param {string} id - Recipient ID
     * @param {Object} data - Recipient update data
     * @returns {Promise} - Promise that resolves with the updated recipient
     */
    update(id, data) {
      return api.request(`/recipients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    /**
     * Delete a recipient
     * @param {string} id - Recipient ID
     * @returns {Promise} - Promise that resolves with the deletion response
     */
    delete(id) {
      return api.request(`/recipients/${id}`, {
        method: 'DELETE'
      });
    },
    
    /**
     * Import recipients from file
     * @param {FormData} formData - Form data with file
     * @returns {Promise} - Promise that resolves with the import response
     */
    import(formData) {
      return api.request('/recipients/import', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set content type for FormData
      });
    }
  },
  
  /**
   * Tracking API endpoints
   */
  tracking: {
    /**
     * Get all tracking records
     * @returns {Promise} - Promise that resolves with the tracking list
     */
    getAll() {
      return api.request('/tracking');
    },
    
    /**
     * Check for returned forms
     * @returns {Promise} - Promise that resolves with the check response
     */
    checkReturns() {
      return api.request('/tracking/check-returns', {
        method: 'POST'
      });
    },
    
    /**
     * Generate tracking report
     * @param {Object} options - Report options
     * @returns {Promise} - Promise that resolves with the report data
     */
    generateReport(options) {
      return api.request('/tracking/report', {
        method: 'POST',
        body: JSON.stringify(options)
      });
    }
  },
  
  /**
   * Data extraction API endpoints
   */
  extraction: {
    /**
     * Get all extraction records
     * @returns {Promise} - Promise that resolves with the extraction list
     */
    getAll() {
      return api.request('/extraction');
    },
    
    /**
     * Extract data from forms
     * @param {Array} formIds - List of form IDs to extract data from
     * @returns {Promise} - Promise that resolves with the extraction response
     */
    extractData(formIds) {
      return api.request('/extraction/extract', {
        method: 'POST',
        body: JSON.stringify({ formIds })
      });
    },
    
    /**
     * Get extracted data
     * @returns {Promise} - Promise that resolves with the extracted data
     */
    getExtractedData() {
      return api.request('/extraction/data');
    },
    
    /**
     * Export data to Excel
     * @param {Array} dataIds - List of data IDs to export
     * @returns {Promise} - Promise that resolves with the export response
     */
    exportToExcel(dataIds) {
      return api.request('/extraction/export', {
        method: 'POST',
        body: JSON.stringify({ dataIds })
      });
    }
  },
  
  /**
   * Settings API endpoints
   */
  settings: {
    /**
     * Get all settings
     * @returns {Promise} - Promise that resolves with the settings
     */
    getAll() {
      return api.request('/settings');
    },
    
    /**
     * Update settings
     * @param {Object} settings - Settings to update
     * @returns {Promise} - Promise that resolves with the updated settings
     */
    update(settings) {
      return api.request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    },
    
    /**
     * Test integration settings
     * @param {Object} settings - Integration settings to test
     * @returns {Promise} - Promise that resolves with the test response
     */
    testIntegration(settings) {
      return api.request('/settings/test-integration', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
    },
    
    /**
     * Create backup
     * @param {Object} options - Backup options
     * @returns {Promise} - Promise that resolves with the backup response
     */
    createBackup(options) {
      return api.request('/settings/backup', {
        method: 'POST',
        body: JSON.stringify(options)
      });
    }
  }
};
