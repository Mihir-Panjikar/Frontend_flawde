document.addEventListener('DOMContentLoaded', function() {
  // User Type Toggle
  const customerToggle = document.getElementById('customerToggle');
  const retailerToggle = document.getElementById('retailerToggle');
  const customerSection = document.getElementById('customerSection');
  const retailerSection = document.getElementById('retailerSection');
  
  // Customer Toggle
  const customerLoginToggle = document.getElementById('customerLoginToggle');
  const customerSignupToggle = document.getElementById('customerSignupToggle');
  const customerLoginForm = document.getElementById('customerLoginForm');
  const customerSignupForm = document.getElementById('customerSignupForm');
  
  // Retailer Toggle
  const retailerLoginToggle = document.getElementById('retailerLoginToggle');
  const retailerSignupToggle = document.getElementById('retailerSignupToggle');
  const retailerLoginForm = document.getElementById('retailerLoginForm');
  const retailerSignupForm = document.getElementById('retailerSignupForm');
  
  // User Type Toggle Functionality
  customerToggle.addEventListener('click', () => {
    customerToggle.classList.add('active');
    retailerToggle.classList.remove('active');
    customerSection.classList.remove('hidden');
    retailerSection.classList.add('hidden');
  });
  
  retailerToggle.addEventListener('click', () => {
    retailerToggle.classList.add('active');
    customerToggle.classList.remove('active');
    retailerSection.classList.remove('hidden');
    customerSection.classList.add('hidden');
  });
  
  // Customer Toggle Functionality
  customerLoginToggle.addEventListener('click', () => {
    customerLoginToggle.classList.add('active');
    customerSignupToggle.classList.remove('active');
    customerLoginForm.classList.remove('hidden');
    customerSignupForm.classList.add('hidden');
  });
  
  customerSignupToggle.addEventListener('click', () => {
    customerSignupToggle.classList.add('active');
    customerLoginToggle.classList.remove('active');
    customerSignupForm.classList.remove('hidden');
    customerLoginForm.classList.add('hidden');
  });
  
  // Retailer Toggle Functionality
  retailerLoginToggle.addEventListener('click', () => {
    retailerLoginToggle.classList.add('active');
    retailerSignupToggle.classList.remove('active');
    retailerLoginForm.classList.remove('hidden');
    retailerSignupForm.classList.add('hidden');
  });
  
  retailerSignupToggle.addEventListener('click', () => {
    retailerSignupToggle.classList.add('active');
    retailerLoginToggle.classList.remove('active');
    retailerSignupForm.classList.remove('hidden');
    retailerLoginForm.classList.add('hidden');
  });
  
  // Form submission handlers
  customerLoginForm.addEventListener('submit', handleCustomerLogin);
  customerSignupForm.addEventListener('submit', handleCustomerSignup);
  retailerLoginForm.addEventListener('submit', handleRetailerLogin);
  retailerSignupForm.addEventListener('submit', handleRetailerSignup);
  
  // Forgot password links
  document.getElementById('customerForgotPasswordLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Please contact customer support to reset your customer password.');
  });
  
  document.getElementById('retailerForgotPasswordLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Please contact business support to reset your retailer password.');
  });
});

// Customer Login Handler
async function handleCustomerLogin(e) {
  e.preventDefault();
  
  // Get form data
  const username = document.getElementById('customerLoginUsername').value;
  const password = document.getElementById('customerLoginPassword').value;
  const messageElement = document.getElementById('customerLoginMessage');
  
  // Basic validation
  if (!username || !password) {
    showMessage(messageElement, 'Please fill in all fields', 'error');
    return;
  }
  
  // Clear previous messages
  messageElement.className = 'form-message';
  messageElement.style.display = 'none';
  
  try {
    // Send login request to backend
    const response = await fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({ 
        username, 
        password,
        user_type: 'customer'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle login errors
      const errorMessage = data.error || 'Login failed. Please check your credentials.';
      showMessage(messageElement, errorMessage, 'error');
      return;
    }
    
    // Login successful
    // Store the token and user type in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userType', 'customer');
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      username: data.username,
      email: data.email
    }));
    
    // Show success message and redirect
    showMessage(messageElement, 'Login successful! Redirecting...', 'success');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    showMessage(messageElement, 'An unexpected error occurred. Please try again later.', 'error');
  }
}

// Customer Signup Handler
async function handleCustomerSignup(e) {
  e.preventDefault();
  
  // Get form data
  const username = document.getElementById('customerSignupUsername').value;
  const email = document.getElementById('customerSignupEmail').value;
  const password = document.getElementById('customerSignupPassword').value;
  const passwordConfirm = document.getElementById('customerSignupPasswordConfirm').value;
  const phone = document.getElementById('customerSignupPhone').value;
  const address = document.getElementById('customerSignupAddress').value;
  const messageElement = document.getElementById('customerSignupMessage');
  
  // Validation
  if (!username || !email || !password || !passwordConfirm) {
    showMessage(messageElement, 'Please fill in all required fields', 'error');
    return;
  }
  
  if (password !== passwordConfirm) {
    showMessage(messageElement, 'Passwords do not match', 'error');
    return;
  }
  
  if (password.length < 8) {
    showMessage(messageElement, 'Password must be at least 8 characters long', 'error');
    return;
  }
  
  // Clear previous messages
  messageElement.className = 'form-message';
  messageElement.style.display = 'none';
  
  try {
    // Send registration request to backend
    const response = await fetch('/api/customers/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({
        username,
        email,
        password,
        phone_number: phone,
        address
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle registration errors
      let errorMessage = 'Registration failed.';
      if (data.username) {
        errorMessage = `Username error: ${data.username.join(', ')}`;
      } else if (data.email) {
        errorMessage = `Email error: ${data.email.join(', ')}`;
      } else if (data.password) {
        errorMessage = `Password error: ${data.password.join(', ')}`;
      } else if (data.error) {
        errorMessage = data.error;
      }
      
      showMessage(messageElement, errorMessage, 'error');
      return;
    }
    
    // Registration successful
    // Store the token and user type in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userType', 'customer');
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      username: data.username,
      email: data.email
    }));
    
    // Show success message and redirect
    showMessage(messageElement, 'Account created successfully! Redirecting...', 'success');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    
  } catch (error) {
    console.error('Registration error:', error);
    showMessage(messageElement, 'An unexpected error occurred. Please try again later.', 'error');
  }
}

// Retailer Login Handler
async function handleRetailerLogin(e) {
  e.preventDefault();
  
  // Get form data
  const username = document.getElementById('retailerLoginUsername').value;
  const password = document.getElementById('retailerLoginPassword').value;
  const messageElement = document.getElementById('retailerLoginMessage');
  
  // Basic validation
  if (!username || !password) {
    showMessage(messageElement, 'Please fill in all fields', 'error');
    return;
  }
  
  // Clear previous messages
  messageElement.className = 'form-message';
  messageElement.style.display = 'none';
  
  try {
    // Send login request to backend
    const response = await fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({ 
        username, 
        password,
        user_type: 'retailer'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle login errors
      const errorMessage = data.error || 'Login failed. Please check your credentials.';
      showMessage(messageElement, errorMessage, 'error');
      return;
    }
    
    // Login successful
    // Store the token and user type in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userType', 'retailer');
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      username: data.username,
      email: data.email,
      store_name: data.store_name
    }));
    
    // Show success message and redirect
    showMessage(messageElement, 'Login successful! Redirecting...', 'success');
    
    // Redirect to retailer dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/retailer/dashboard/';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    showMessage(messageElement, 'An unexpected error occurred. Please try again later.', 'error');
  }
}

// Retailer Signup Handler
async function handleRetailerSignup(e) {
  e.preventDefault();
  
  // Get form data
  const username = document.getElementById('retailerSignupUsername').value;
  const email = document.getElementById('retailerSignupEmail').value;
  const password = document.getElementById('retailerSignupPassword').value;
  const passwordConfirm = document.getElementById('retailerSignupPasswordConfirm').value;
  const storeName = document.getElementById('retailerSignupStoreName').value;
  const businessName = document.getElementById('retailerSignupBusinessName').value;
  const phone = document.getElementById('retailerSignupPhone').value;
  const address = document.getElementById('retailerSignupAddress').value;
  const messageElement = document.getElementById('retailerSignupMessage');
  
  // Validation
  if (!username || !email || !password || !passwordConfirm || !storeName || !businessName || !phone || !address) {
    showMessage(messageElement, 'Please fill in all required fields', 'error');
    return;
  }
  
  if (password !== passwordConfirm) {
    showMessage(messageElement, 'Passwords do not match', 'error');
    return;
  }
  
  if (password.length < 8) {
    showMessage(messageElement, 'Password must be at least 8 characters long', 'error');
    return;
  }
  
  // Clear previous messages
  messageElement.className = 'form-message';
  messageElement.style.display = 'none';
  
  try {
    // Send registration request to backend
    const response = await fetch('/api/retailers/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({
        username,
        email,
        password,
        store_name: storeName,
        business_name: businessName,
        phone_number: phone,
        address
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle registration errors
      let errorMessage = 'Registration failed.';
      if (data.username) {
        errorMessage = `Username error: ${data.username.join(', ')}`;
      } else if (data.email) {
        errorMessage = `Email error: ${data.email.join(', ')}`;
      } else if (data.password) {
        errorMessage = `Password error: ${data.password.join(', ')}`;
      } else if (data.error) {
        errorMessage = data.error;
      }
      
      showMessage(messageElement, errorMessage, 'error');
      return;
    }
    
    // Registration successful
    // Display success message
    showMessage(messageElement, 'Account created successfully! Your account is pending approval. We will notify you by email once approved.', 'success');
    
    // After a delay, redirect to login form
    setTimeout(() => {
      // Switch to login tab
      document.getElementById('retailerLoginToggle').click();
    }, 3000);
    
  } catch (error) {
    console.error('Registration error:', error);
    showMessage(messageElement, 'An unexpected error occurred. Please try again later.', 'error');
  }
}

// Helper function to display messages
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `form-message ${type}`;
  element.style.display = 'block';
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Check authentication status on page load
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  
  if (token) {
    // User is logged in, redirect based on user type
    if (userType === 'customer') {
      window.location.href = '/';
    } else if (userType === 'retailer') {
      window.location.href = '/retailer/dashboard/';
    }
  }
}

// Call this function when page loads
checkAuthStatus();