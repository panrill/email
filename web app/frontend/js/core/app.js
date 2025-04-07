/**
 * Main application module
 * Initializes the application and manages core functionality
 */
const app = {
  /**
   * Application configuration
   */
  config: {
    apiUrl: '/api',
    routes: {
      '/': { page: 'dashboard', title: 'Dashboard', auth: true },
      '/login': { page: 'login', title: 'Login', auth: false },
      '/register': { page: 'register', title: 'Register', auth: false },
      '/forms': { page: 'forms', title: 'Forms', auth: true },
      '/recipients': { page: 'recipients', title: 'Recipients', auth: true },
      '/tracking': { page: 'tracking', title: 'Tracking', auth: true },
      '/extraction': { page: 'extraction', title: 'Data Extraction', auth: true },
      '/settings': { page: 'settings', title: 'Settings', auth: true }
    }
  },

  /**
   * Initialize the application
   */
  init() {
    // Initialize core modules
    store.init();
    router.init(this.config.routes);
    auth.init();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Check authentication and navigate to appropriate page
    auth.checkAuth().then(isAuthenticated => {
      if (isAuthenticated) {
        // If user is authenticated and on login/register page, redirect to dashboard
        if (['/login', '/register'].includes(window.location.pathname)) {
          router.navigate('/');
        } else {
          // Otherwise, load the current page
          router.loadCurrentRoute();
        }
      } else {
        // If user is not authenticated and trying to access protected route, redirect to login
        const currentRoute = router.getCurrentRoute();
        if (currentRoute && currentRoute.auth) {
          router.navigate('/login');
        } else {
          // Otherwise, load the current page (login or register)
          router.loadCurrentRoute();
        }
      }
    });
  },

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Toggle user dropdown
    document.addEventListener('click', (e) => {
      const userMenuButton = document.getElementById('user-menu-button');
      const userDropdown = document.getElementById('user-dropdown');
      
      if (userMenuButton && userDropdown) {
        if (userMenuButton.contains(e.target)) {
          userDropdown.classList.toggle('active');
        } else if (!userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      }
    });

    // Toggle sidebar on mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('collapsed');
        }
      });
    }

    // Handle logout
    document.addEventListener('click', (e) => {
      if (e.target.closest('#logout-button')) {
        e.preventDefault();
        auth.logout();
      }
    });
  },

  /**
   * Render the base template
   * @param {Object} data - Data to pass to the template
   * @returns {string} - HTML string
   */
  renderBaseTemplate(data) {
    const template = document.getElementById('base-template').innerHTML;
    return template.replace(/\${(\w+)}/g, (match, p1) => {
      return data[p1] || '';
    });
  },

  /**
   * Render a page template
   * @param {string} templateId - ID of the template to render
   * @param {Object} data - Data to pass to the template
   * @returns {string} - HTML string
   */
  renderPageTemplate(templateId, data = {}) {
    const template = document.getElementById(`${templateId}-template`).innerHTML;
    return template.replace(/\${(\w+)}/g, (match, p1) => {
      return data[p1] !== undefined ? data[p1] : '';
    });
  },

  /**
   * Render the application with the specified page content
   * @param {string} pageContent - HTML content for the page
   * @param {string} pageTitle - Title of the page
   */
  renderApp(pageContent, pageTitle) {
    // Get user data from store
    const user = store.getState().user || {};
    
    // Update document title
    document.title = `${pageTitle} - Email Form System`;
    
    // Render base template if authenticated
    if (auth.isAuthenticated()) {
      const appContainer = document.getElementById('app');
      appContainer.innerHTML = this.renderBaseTemplate({
        userName: user.name || 'User',
        userEmail: user.email || ''
      });
      
      // Insert page content
      const contentContainer = document.getElementById('content');
      if (contentContainer) {
        contentContainer.innerHTML = pageContent;
      }
      
      // Update active navigation link
      this.updateActiveNavLink();
    } else {
      // For non-authenticated pages (login, register), render directly
      document.getElementById('app').innerHTML = pageContent;
    }
  },

  /**
   * Update the active navigation link based on current route
   */
  updateActiveNavLink() {
    const currentPath = window.location.pathname;
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current nav link
    const activeLink = document.querySelector(`.nav-link[data-route="${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  },

  /**
   * Show a notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="material-icons notification-icon">${this.getNotificationIcon(type)}</i>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close">
        <i class="material-icons">close</i>
      </button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add active class after a small delay (for animation)
    setTimeout(() => {
      notification.classList.add('active');
    }, 10);
    
    // Set up close button
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notification.classList.remove('active');
        setTimeout(() => {
          notification.remove();
        }, 300);
      });
    }
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.classList.remove('active');
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        }
      }, duration);
    }
  },

  /**
   * Get the appropriate icon for a notification type
   * @param {string} type - Notification type
   * @returns {string} - Material icon name
   */
  getNotificationIcon(type) {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
};
