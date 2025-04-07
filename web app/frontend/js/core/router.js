/**
 * Router module
 * Handles client-side routing and navigation
 */
const router = {
  /**
   * Routes configuration
   */
  routes: {},

  /**
   * Initialize the router
   * @param {Object} routes - Routes configuration
   */
  init(routes) {
    this.routes = routes;
    
    // Set up event listeners for navigation
    this.setupEventListeners();
    
    // Handle initial route
    window.addEventListener('DOMContentLoaded', () => {
      // We don't navigate here because app.init handles the initial navigation
      // based on authentication status
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.loadCurrentRoute();
    });
  },

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Delegate click events on links
    document.addEventListener('click', (e) => {
      // Find closest anchor tag
      const link = e.target.closest('a');
      
      // If it's an internal link (starts with / and is on the same origin)
      if (link && link.getAttribute('href').startsWith('/') && 
          link.origin === window.location.origin) {
        
        // Prevent default navigation
        e.preventDefault();
        
        // Navigate to the link's href
        this.navigate(link.getAttribute('href'));
      }
    });
  },

  /**
   * Navigate to a specific path
   * @param {string} path - Path to navigate to
   */
  navigate(path) {
    // Update browser history
    window.history.pushState({}, '', path);
    
    // Load the route
    this.loadCurrentRoute();
  },

  /**
   * Get the current route based on window.location.pathname
   * @returns {Object|null} - Route object or null if not found
   */
  getCurrentRoute() {
    const path = window.location.pathname;
    
    // Check if the path exactly matches a route
    if (this.routes[path]) {
      return {
        ...this.routes[path],
        path
      };
    }
    
    // Default to home if path is not found
    if (path !== '/' && !this.routes[path]) {
      return {
        ...this.routes['/'],
        path: '/'
      };
    }
    
    return null;
  },

  /**
   * Load the current route based on window.location.pathname
   */
  loadCurrentRoute() {
    const route = this.getCurrentRoute();
    
    if (!route) {
      console.error('Route not found');
      return;
    }
    
    // Check if route requires authentication
    if (route.auth && !auth.isAuthenticated()) {
      this.navigate('/login');
      return;
    }
    
    // Load the page module dynamically
    this.loadPage(route.page, route.title);
  },

  /**
   * Load a page module and render it
   * @param {string} pageName - Name of the page to load
   * @param {string} pageTitle - Title of the page
   */
  loadPage(pageName, pageTitle) {
    try {
      // For non-authenticated pages (login, register)
      if (['login', 'register'].includes(pageName)) {
        const pageContent = app.renderPageTemplate(pageName);
        app.renderApp(pageContent, pageTitle);
        
        // Initialize page-specific functionality
        this.initPageFunctionality(pageName);
        return;
      }
      
      // For authenticated pages
      if (auth.isAuthenticated()) {
        // Render the page
        const pageContent = app.renderPageTemplate(pageName);
        app.renderApp(pageContent, pageTitle);
        
        // Initialize page-specific functionality
        this.initPageFunctionality(pageName);
      } else {
        // Redirect to login if not authenticated
        this.navigate('/login');
      }
    } catch (error) {
      console.error(`Error loading page ${pageName}:`, error);
      app.showNotification(`Error loading page: ${error.message}`, 'error');
    }
  },

  /**
   * Initialize page-specific functionality
   * @param {string} pageName - Name of the page
   */
  initPageFunctionality(pageName) {
    switch (pageName) {
      case 'login':
        this.initLoginPage();
        break;
      case 'register':
        this.initRegisterPage();
        break;
      case 'dashboard':
        this.initDashboardPage();
        break;
      case 'forms':
        this.initFormsPage();
        break;
      case 'recipients':
        this.initRecipientsPage();
        break;
      case 'tracking':
        this.initTrackingPage();
        break;
      case 'extraction':
        this.initExtractionPage();
        break;
      case 'settings':
        this.initSettingsPage();
        break;
    }
  },

  /**
   * Initialize login page functionality
   */
  initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        if (loginError) {
          loginError.style.display = 'none';
        }
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          // Attempt login
          const success = await auth.login(email, password);
          
          if (success) {
            // Show success notification
            app.showNotification('Login successful!', 'success');
            
            // Navigate to dashboard
            this.navigate('/');
          }
        } catch (error) {
          // Display error message
          if (loginError) {
            loginError.textContent = error.message || 'Login failed. Please check your credentials.';
            loginError.style.display = 'block';
          }
        }
      });
    }
  },

  /**
   * Initialize register page functionality
   */
  initRegisterPage() {
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');
    const nextStepBtn = document.getElementById('next-step');
    const prevStepBtn = document.getElementById('prev-step');
    const completeRegBtn = document.getElementById('complete-registration');
    
    let currentStep = 1;
    
    if (registerForm) {
      // Handle next step button
      if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
          if (this.validateRegisterStep(currentStep)) {
            // Update step UI
            this.updateRegisterStep(currentStep, currentStep + 1);
            currentStep++;
            
            // Update buttons visibility
            if (currentStep > 1) {
              prevStepBtn.style.display = 'block';
            }
            
            if (currentStep === 3) {
              nextStepBtn.style.display = 'none';
              completeRegBtn.style.display = 'block';
              
              // Update review information
              this.updateRegisterReview();
            }
          }
        });
      }
      
      // Handle previous step button
      if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
          if (currentStep > 1) {
            // Update step UI
            this.updateRegisterStep(currentStep, currentStep - 1);
            currentStep--;
            
            // Update buttons visibility
            if (currentStep === 1) {
              prevStepBtn.style.display = 'none';
            }
            
            if (currentStep < 3) {
              nextStepBtn.style.display = 'block';
              completeRegBtn.style.display = 'none';
            }
          }
        });
      }
      
      // Handle form submission
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        if (registerError) {
          registerError.style.display = 'none';
        }
        
        // Validate final step
        if (!this.validateRegisterStep(currentStep)) {
          return;
        }
        
        // Get form data
        const formData = {
          email: document.getElementById('reg-email').value,
          password: document.getElementById('reg-password').value,
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          phone: document.getElementById('phone').value || '',
          company: document.getElementById('company').value || ''
        };
        
        try {
          // Attempt registration
          const success = await auth.register(formData);
          
          if (success) {
            // Show success notification
            app.showNotification('Registration successful! Please log in.', 'success');
            
            // Navigate to login page
            this.navigate('/login');
          }
        } catch (error) {
          // Display error message
          if (registerError) {
            registerError.textContent = error.message || 'Registration failed. Please try again.';
            registerError.style.display = 'block';
          }
        }
      });
    }
  },

  /**
   * Validate a registration step
   * @param {number} step - Step number to validate
   * @returns {boolean} - Whether the step is valid
   */
  validateRegisterStep(step) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-text').forEach(el => {
      el.textContent = '';
    });
    
    if (step === 1) {
      // Validate email
      const email = document.getElementById('reg-email').value;
      if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('email-error').textContent = 'Email is invalid';
        isValid = false;
      }
      
      // Validate password
      const password = document.getElementById('reg-password').value;
      if (!password) {
        document.getElementById('password-error').textContent = 'Password is required';
        isValid = false;
      } else if (password.length < 8) {
        document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
        isValid = false;
      }
      
      // Validate password confirmation
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      if (!confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Please confirm your password';
        isValid = false;
      } else if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        isValid = false;
      }
    } else if (step === 2) {
      // Validate first name
      const firstName = document.getElementById('firstName').value;
      if (!firstName) {
        document.getElementById('firstName-error').textContent = 'First name is required';
        isValid = false;
      }
      
      // Validate last name
      const lastName = document.getElementById('lastName').value;
      if (!lastName) {
        document.getElementById('lastName-error').textContent = 'Last name is required';
        isValid = false;
      }
    } else if (step === 3) {
      // Validate terms agreement
      const agreeToTerms = document.getElementById('agreeToTerms').checked;
      if (!agreeToTerms) {
        document.getElementById('terms-error').textContent = 'You must agree to the terms and conditions';
        isValid = false;
      }
    }
    
    return isValid;
  },

  /**
   * Update the registration step UI
   * @param {number} currentStep - Current step number
   * @param {number} newStep - New step number
   */
  updateRegisterStep(currentStep, newStep) {
    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      step.classList.remove('active');
      if (stepNum === newStep) {
        step.classList.add('active');
      } else if (stepNum < newStep) {
        step.classList.add('completed');
      }
    });
    
    // Update step content
    document.querySelectorAll('.step-content').forEach(content => {
      const contentStep = parseInt(content.getAttribute('data-step-content'));
      content.classList.remove('active');
      if (contentStep === newStep) {
        content.classList.add('active');
      }
    });
  },

  /**
   * Update the registration review information
   */
  updateRegisterReview() {
    document.getElementById('review-email').textContent = document.getElementById('reg-email').value;
    document.getElementById('review-name').textContent = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
    document.getElementById('review-phone').textContent = document.getElementById('phone').value || 'Not provided';
    document.getElementById('review-company').textContent = document.getElementById('company').value || 'Not provided';
  },

  /**
   * Initialize dashboard page functionality
   */
  initDashboardPage() {
    // Load dashboard data
    this.loadDashboardData();
  },

  /**
   * Load dashboard data from API
   */
  async loadDashboardData() {
    try {
      const dashboardData = await api.dashboard.getSummary();
      
      // Update summary cards
      document.getElementById('forms-count').textContent = dashboardData.formsCount || 0;
      document.getElementById('recipients-count').textContent = dashboardData.recipientsCount || 0;
      document.getElementById('emails-sent-count').textContent = dashboardData.emailsSentCount || 0;
      document.getElementById('forms-returned-count').textContent = dashboardData.formsReturnedCount || 0;
      
      // Update activity table
      this.renderActivityTable(dashboardData.recentActivity || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      app.showNotification('Error loading dashboard data', 'error');
    }
  },

  /**
   * Render the activity table with data
   * @param {Array} activities - List of activities
   */
  renderActivityTable(activities) {
    const tableBody = document.getElementById('activity-table-body');
    
    if (!tableBody) return;
    
    if (activities.length === 0) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="3">No recent activity</td>
        </tr>
      `;
      return;
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add activity rows
    activities.forEach(activity => {
      const statusClass = this.getStatusClass(activity.status);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${this.formatDate(activity.date)}</td>
        <td>${activity.activity}</td>
        <td><span class="status-badge status-${statusClass}">${activity.status}</span></td>
      `;
      
      tableBody.appendChild(row);
    });
  },

  /**
   * Get the CSS class for a status
   * @param {string} status - Status text
   * @returns {string} - CSS class
   */
  getStatusClass(status) {
    status = status.toLowerCase();
    
    if (['completed', 'sent', 'processed'].includes(status)) {
      return 'success';
    } else if (['pending', 'in progress'].includes(status)) {
      return 'info';
    } else if (['warning', 'not returned'].includes(status)) {
      return 'warning';
    } else if (['error', 'failed'].includes(status)) {
      return 'error';
    }
    
    return 'pending';
  },

  /**
   * Format a date string
   * @param {string} dateString - Date string
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },

  /**
   * Initialize forms page functionality
   */
  initFormsPage() {
    // This would be implemented in a similar way to the dashboard page
    console.log('Forms page initialized');
  },

  /**
   * Initialize recipients page functionality
   */
  initRecipientsPage() {
    // This would be implemented in a similar way to the dashboard page
    console.log('Recipients page initialized');
  },

  /**
   * Initialize tracking page functionality
   */
  initTrackingPage() {
    // This would be implemented in a similar way to the dashboard page
    console.log('Tracking page initialized');
  },

  /**
   * Initialize extraction page functionality
   */
  initExtractionPage() {
    // This would be implemented in a similar way to the dashboard page
    console.log('Extraction page initialized');
  },

  /**
   * Initialize settings page functionality
   */
  initSettingsPage() {
    // This would be implemented in a similar way to the dashboard page
    console.log('Settings page initialized');
  }
};
