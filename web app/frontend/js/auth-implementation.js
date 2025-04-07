/**
 * Authentication implementation for HTML/JS frontend
 * This file extends the core auth.js module with specific implementation details
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize authentication forms
  initLoginForm();
  initRegisterForm();
  
  // Set up authentication state display
  updateAuthDisplay();
  
  // Listen for auth state changes
  store.subscribe(state => {
    updateAuthDisplay();
  });
});

/**
 * Initialize login form functionality
 */
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate form
    if (!validateLoginForm(email, password)) {
      return;
    }
    
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner-sm"></span> Signing in...';
    
    // Clear previous errors
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    try {
      // Attempt login
      const success = await auth.login(email, password);
      
      if (success) {
        // Show success notification
        ui.toast({
          message: 'Login successful!',
          type: 'success'
        });
        
        // Navigate to dashboard
        router.navigate('/');
      }
    } catch (error) {
      // Display error message
      if (errorElement) {
        errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        errorElement.style.display = 'block';
      }
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

/**
 * Validate login form
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {boolean} - Whether the form is valid
 */
function validateLoginForm(email, password) {
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-text').forEach(el => {
    el.textContent = '';
  });
  
  // Validate email
  if (!email) {
    document.getElementById('email-error').textContent = 'Email is required';
    isValid = false;
  } else if (!ui.validateEmail(email)) {
    document.getElementById('email-error').textContent = 'Email is invalid';
    isValid = false;
  }
  
  // Validate password
  if (!password) {
    document.getElementById('password-error').textContent = 'Password is required';
    isValid = false;
  }
  
  return isValid;
}

/**
 * Initialize register form functionality
 */
function initRegisterForm() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;
  
  // Track current step
  let currentStep = 1;
  
  // Get step buttons
  const nextStepBtn = document.getElementById('next-step');
  const prevStepBtn = document.getElementById('prev-step');
  const completeRegBtn = document.getElementById('complete-registration');
  
  // Handle next step button
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      if (validateRegisterStep(currentStep)) {
        // Update step UI
        updateRegisterStep(currentStep, currentStep + 1);
        currentStep++;
        
        // Update buttons visibility
        if (currentStep > 1) {
          prevStepBtn.style.display = 'block';
        }
        
        if (currentStep === 3) {
          nextStepBtn.style.display = 'none';
          completeRegBtn.style.display = 'block';
          
          // Update review information
          updateRegisterReview();
        }
      }
    });
  }
  
  // Handle previous step button
  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        // Update step UI
        updateRegisterStep(currentStep, currentStep - 1);
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
    
    // Validate final step
    if (!validateRegisterStep(currentStep)) {
      return;
    }
    
    // Show loading state
    const submitBtn = completeRegBtn;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner-sm"></span> Registering...';
    
    // Clear previous errors
    const errorElement = document.getElementById('register-error');
    if (errorElement) {
      errorElement.style.display = 'none';
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
        ui.toast({
          message: 'Registration successful! Please log in.',
          type: 'success'
        });
        
        // Navigate to login page
        router.navigate('/login');
      }
    } catch (error) {
      // Display error message
      if (errorElement) {
        errorElement.textContent = error.message || 'Registration failed. Please try again.';
        errorElement.style.display = 'block';
      }
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

/**
 * Validate a registration step
 * @param {number} step - Step number to validate
 * @returns {boolean} - Whether the step is valid
 */
function validateRegisterStep(step) {
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
    } else if (!ui.validateEmail(email)) {
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
}

/**
 * Update the registration step UI
 * @param {number} currentStep - Current step number
 * @param {number} newStep - New step number
 */
function updateRegisterStep(currentStep, newStep) {
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
}

/**
 * Update the registration review information
 */
function updateRegisterReview() {
  document.getElementById('review-email').textContent = document.getElementById('reg-email').value;
  document.getElementById('review-name').textContent = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
  document.getElementById('review-phone').textContent = document.getElementById('phone').value || 'Not provided';
  document.getElementById('review-company').textContent = document.getElementById('company').value || 'Not provided';
}

/**
 * Update authentication display based on auth state
 */
function updateAuthDisplay() {
  const isAuthenticated = auth.isAuthenticated();
  const user = store.getState().user;
  
  // Update user menu
  const userMenuButton = document.getElementById('user-menu-button');
  if (userMenuButton && user) {
    const userNameElement = userMenuButton.querySelector('.user-name');
    if (userNameElement) {
      userNameElement.textContent = user.name || 'User';
    }
  }
  
  // Update user dropdown
  const userDropdown = document.getElementById('user-dropdown');
  if (userDropdown && user) {
    const userNameElement = userDropdown.querySelector('.user-name');
    const userEmailElement = userDropdown.querySelector('.user-email');
    
    if (userNameElement) {
      userNameElement.textContent = user.name || 'User';
    }
    
    if (userEmailElement) {
      userEmailElement.textContent = user.email || '';
    }
  }
  
  // Update navigation visibility based on auth state
  document.querySelectorAll('[data-auth-required]').forEach(el => {
    if (isAuthenticated) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
  
  document.querySelectorAll('[data-auth-anonymous]').forEach(el => {
    if (!isAuthenticated) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

/**
 * Handle logout action
 */
function handleLogout() {
  // Confirm logout
  ui.confirm({
    title: 'Logout',
    message: 'Are you sure you want to log out?',
    confirmText: 'Logout',
    cancelText: 'Cancel'
  }).then(confirmed => {
    if (confirmed) {
      auth.logout();
      
      // Show notification
      ui.toast({
        message: 'You have been logged out',
        type: 'info'
      });
    }
  });
}

// Add global event listener for logout button
document.addEventListener('click', (e) => {
  if (e.target.closest('#logout-button')) {
    e.preventDefault();
    handleLogout();
  }
});
