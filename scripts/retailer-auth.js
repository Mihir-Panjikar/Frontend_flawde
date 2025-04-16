document.addEventListener("DOMContentLoaded", function () {
  // Toggle between login and signup forms
  const loginToggle = document.getElementById("loginToggle");
  const signupToggle = document.getElementById("signupToggle");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginToggle.addEventListener("click", function () {
    loginToggle.classList.add("active");
    signupToggle.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  });

  signupToggle.addEventListener("click", function () {
    signupToggle.classList.add("active");
    loginToggle.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  // Handle retailer registration form submission
  const retailerSignupForm = document.getElementById("retailerSignupForm");
  const signupMessage = document.getElementById("signupMessage");

  retailerSignupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const formData = {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      store_name: document.getElementById("storeName").value,
      business_name: document.getElementById("businessName").value,
      phone_number: document.getElementById("phoneNumber").value,
      address: document.getElementById("address").value,
    };

    // Validate password length
    if (formData.password.length < 6) {
      showMessage(
        signupMessage,
        "Password must be at least 6 characters long.",
        "error"
      );
      return;
    }

    // Send registration request to API
    fetch("/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(Object.values(data).flat().join(" "));
          });
        }
        return response.json();
      })
      .then((data) => {
        showMessage(
          signupMessage,
          "Registration successful! You can now login.",
          "success"
        );
        retailerSignupForm.reset();

        // Switch to login form after successful registration
        setTimeout(() => {
          loginToggle.click();
        }, 2000);
      })
      .catch((error) => {
        showMessage(
          signupMessage,
          error.message || "Registration failed. Please try again.",
          "error"
        );
      });
  });

  // Handle retailer login form submission
  const retailerLoginForm = document.getElementById("retailerLoginForm");
  const loginMessage = document.getElementById("loginMessage");

  retailerLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data
    const formData = {
      username: document.getElementById("loginUsername").value,
      password: document.getElementById("loginPassword").value,
    };

    // Send login request to API
    fetch("/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Login failed");
          });
        }
        return response.json();
      })
      .then((data) => {
        // Save auth token and retailer info to localStorage
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("retailerId", data.retailer_id);
        localStorage.setItem("businessName", data.business_name);
        localStorage.setItem("storeName", data.store_name);
        localStorage.setItem("isVerified", data.is_verified || false);

        showMessage(
          loginMessage,
          "Login successful! Redirecting...",
          "success"
        );

        // Redirect to retailer dashboard
        setTimeout(() => {
          window.location.href = "retailer-dashboard.html";
        }, 1500);
      })
      .catch((error) => {
        showMessage(
          loginMessage,
          error.message || "Invalid credentials. Please try again.",
          "error"
        );
      });
  });

  // Function to display messages
  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-message " + type;

    // Hide message after some time if it's a success message
    if (type === "success") {
      setTimeout(() => {
        element.style.display = "none";
      }, 5000);
    }
  }

  // Check if user is already logged in
  function checkAuthStatus() {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      // Redirect to dashboard if already logged in
      window.location.href = "retailer-dashboard.html";
    }
  }

  // Run auth check when page loads
  checkAuthStatus();
});
