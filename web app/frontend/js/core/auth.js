/**
 * Authentication module
 * Handles user authentication and authorization
 */
const auth = {
  /**
   * Initialize the authentication module
   */
  init() {
    // Check if token exists in localStorage
    this.token = localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - Whether the user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  },

  /**
   * Check authentication status and load user data if authenticated
   * @returns {Promise<boolean>} - Promise that resolves with authentication status
   */
  async checkAuth() {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Get user data from API
      const userData = await api.auth.getUser();
      
      // Update store with user data
      store.setState({ user: userData });
      
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      
      // Clear invalid token
      this.logout();
      
      return false;
    }
  },

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<boolean>} - Promise that resolves with login success
   */
  async login(email, password) {
    try {
      // Call login API
      const response = await api.auth.login(email, password);
      
      // Save token to localStorage and module
      this.token = response.access_token;
      localStorage.setItem('token', this.token);
      
      // Update store with user data
      store.setState({ user: response.user });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<boolean>} - Promise that resolves with registration success
   */
  async register(userData) {
    try {
      // Call register API
      await api.auth.register(userData);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout() {
    // Clear token from localStorage and module
    localStorage.removeItem('token');
    this.token = null;
    
    // Clear user data from store
    store.setState({ user: null });
    
    // Redirect to login page
    router.navigate('/login');
  }
};
