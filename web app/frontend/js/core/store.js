/**
 * Store module
 * Simple state management for the application
 */
const store = {
  /**
   * Application state
   */
  state: {
    user: null,
    forms: [],
    recipients: [],
    tracking: [],
    extractedData: [],
    settings: {}
  },
  
  /**
   * Listeners for state changes
   */
  listeners: [],
  
  /**
   * Initialize the store
   */
  init() {
    // Load persisted state from localStorage if available
    const persistedState = localStorage.getItem('appState');
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState);
        // Only restore safe parts of state (not user authentication)
        this.state = {
          ...this.state,
          forms: parsedState.forms || [],
          recipients: parsedState.recipients || [],
          tracking: parsedState.tracking || [],
          extractedData: parsedState.extractedData || [],
          settings: parsedState.settings || {}
        };
      } catch (error) {
        console.error('Error parsing persisted state:', error);
      }
    }
  },
  
  /**
   * Get the current state
   * @returns {Object} - Current state
   */
  getState() {
    return this.state;
  },
  
  /**
   * Update the state
   * @param {Object} newState - State updates
   */
  setState(newState) {
    // Update state
    this.state = {
      ...this.state,
      ...newState
    };
    
    // Persist relevant parts of state to localStorage
    this.persistState();
    
    // Notify listeners
    this.notifyListeners();
  },
  
  /**
   * Persist state to localStorage
   */
  persistState() {
    try {
      // Only persist non-sensitive data
      const stateToPersist = {
        forms: this.state.forms,
        recipients: this.state.recipients,
        tracking: this.state.tracking,
        extractedData: this.state.extractedData,
        settings: this.state.settings
      };
      
      localStorage.setItem('appState', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error('Error persisting state:', error);
    }
  },
  
  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function for state changes
   * @returns {Function} - Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  /**
   * Notify all listeners of state changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  },
  
  /**
   * Reset the state to initial values
   */
  resetState() {
    this.state = {
      user: null,
      forms: [],
      recipients: [],
      tracking: [],
      extractedData: [],
      settings: {}
    };
    
    // Clear persisted state
    localStorage.removeItem('appState');
    
    // Notify listeners
    this.notifyListeners();
  }
};
