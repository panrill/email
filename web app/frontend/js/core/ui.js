/**
 * UI utilities module
 * Provides helper functions for UI manipulation
 */
const ui = {
  /**
   * Create an element with attributes and children
   * @param {string} tag - Element tag name
   * @param {Object} attrs - Element attributes
   * @param {Array|string} children - Child elements or text content
   * @returns {HTMLElement} - Created element
   */
  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof HTMLElement) {
          element.appendChild(child);
        } else if (child !== null && child !== undefined) {
          element.appendChild(document.createTextNode(child.toString()));
        }
      });
    } else if (children !== null && children !== undefined) {
      element.textContent = children.toString();
    }
    
    return element;
  },
  
  /**
   * Create a modal dialog
   * @param {Object} options - Modal options
   * @returns {HTMLElement} - Modal element
   */
  createModal(options = {}) {
    const {
      title = 'Modal',
      content = '',
      footer = null,
      size = 'medium',
      onClose = () => {}
    } = options;
    
    // Create modal container
    const modalContainer = this.createElement('div', {
      className: 'modal-container',
      onClick: (e) => {
        if (e.target === modalContainer) {
          closeModal();
        }
      }
    });
    
    // Create modal content
    const modalContent = this.createElement('div', {
      className: `modal-content modal-${size}`
    });
    
    // Create modal header
    const modalHeader = this.createElement('div', {
      className: 'modal-header'
    }, [
      this.createElement('h3', {
        className: 'modal-title'
      }, title),
      this.createElement('button', {
        className: 'modal-close',
        onClick: closeModal
      }, [
        this.createElement('i', {
          className: 'material-icons'
        }, 'close')
      ])
    ]);
    
    // Create modal body
    const modalBody = this.createElement('div', {
      className: 'modal-body'
    });
    
    // Add content to modal body
    if (typeof content === 'string') {
      modalBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      modalBody.appendChild(content);
    }
    
    // Add elements to modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    
    // Add footer if provided
    if (footer) {
      const modalFooter = this.createElement('div', {
        className: 'modal-footer'
      });
      
      if (typeof footer === 'string') {
        modalFooter.innerHTML = footer;
      } else if (footer instanceof HTMLElement) {
        modalFooter.appendChild(footer);
      } else if (Array.isArray(footer)) {
        footer.forEach(item => {
          if (item instanceof HTMLElement) {
            modalFooter.appendChild(item);
          }
        });
      }
      
      modalContent.appendChild(modalFooter);
    }
    
    // Add modal content to container
    modalContainer.appendChild(modalContent);
    
    // Add modal to document
    document.body.appendChild(modalContainer);
    
    // Function to close the modal
    function closeModal() {
      modalContainer.classList.add('closing');
      setTimeout(() => {
        document.body.removeChild(modalContainer);
        onClose();
      }, 300);
    }
    
    // Show modal with animation
    setTimeout(() => {
      modalContainer.classList.add('active');
    }, 10);
    
    // Return the modal container and a close function
    return {
      element: modalContainer,
      close: closeModal
    };
  },
  
  /**
   * Create a confirmation dialog
   * @param {Object} options - Confirmation options
   * @returns {Promise} - Promise that resolves with the user's choice
   */
  confirm(options = {}) {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmClass = 'btn-primary',
      cancelClass = 'btn-secondary'
    } = options;
    
    return new Promise((resolve) => {
      // Create footer with buttons
      const footer = this.createElement('div', {
        className: 'modal-footer'
      }, [
        this.createElement('button', {
          className: `btn ${cancelClass}`,
          onClick: () => {
            modal.close();
            resolve(false);
          }
        }, cancelText),
        this.createElement('button', {
          className: `btn ${confirmClass}`,
          onClick: () => {
            modal.close();
            resolve(true);
          }
        }, confirmText)
      ]);
      
      // Create and show modal
      const modal = this.createModal({
        title,
        content: `<p>${message}</p>`,
        footer,
        size: 'small',
        onClose: () => resolve(false)
      });
    });
  },
  
  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   */
  toast(options = {}) {
    const {
      message = '',
      type = 'info',
      duration = 3000
    } = options;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = this.createElement('div', {
        className: 'toast-container'
      });
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = this.createElement('div', {
      className: `toast toast-${type}`
    }, [
      this.createElement('div', {
        className: 'toast-content'
      }, [
        this.createElement('i', {
          className: 'material-icons toast-icon'
        }, this.getToastIcon(type)),
        this.createElement('span', {
          className: 'toast-message'
        }, message)
      ]),
      this.createElement('button', {
        className: 'toast-close',
        onClick: () => closeToast()
      }, [
        this.createElement('i', {
          className: 'material-icons'
        }, 'close')
      ])
    ]);
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);
    
    // Function to close the toast
    function closeToast() {
      toast.classList.remove('active');
      setTimeout(() => {
        if (toast.parentNode) {
          toastContainer.removeChild(toast);
        }
        
        // Remove container if empty
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      }, 300);
    }
    
    // Auto-close after duration
    if (duration > 0) {
      setTimeout(closeToast, duration);
    }
    
    // Return close function
    return closeToast;
  },
  
  /**
   * Get the appropriate icon for a toast type
   * @param {string} type - Toast type
   * @returns {string} - Material icon name
   */
  getToastIcon(type) {
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
  },
  
  /**
   * Format a date string
   * @param {string|Date} date - Date to format
   * @param {string} format - Format string (default: 'YYYY-MM-DD')
   * @returns {string} - Formatted date
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  
  /**
   * Format a number as a file size
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  },
  
  /**
   * Validate an email address
   * @param {string} email - Email address to validate
   * @returns {boolean} - Whether the email is valid
   */
  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  
  /**
   * Debounce a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};
