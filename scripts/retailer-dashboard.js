document.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated
  const authToken = localStorage.getItem("authToken");
  const retailerId = localStorage.getItem("retailerId");
  const businessName = localStorage.getItem("businessName");
  const storeName = localStorage.getItem("storeName");
  const isVerified = localStorage.getItem("isVerified") === "true";

  if (!authToken || !retailerId) {
    // Redirect to login page if not authenticated
    window.location.href = "retailer-login.html";
    return;
  }

  // Display retailer info
  const businessNameDisplay = document.getElementById("businessNameDisplay");
  if (businessNameDisplay && businessName) {
    businessNameDisplay.textContent = businessName;
  }

  const storeNameDisplay = document.getElementById("storeNameDisplay");
  if (storeNameDisplay && storeName) {
    storeNameDisplay.textContent = storeName;
  }

  // Display verification status
  const verificationStatus = document.getElementById("verificationStatus");
  if (verificationStatus) {
    if (isVerified) {
      verificationStatus.textContent = "✓ Verified Account";
      verificationStatus.classList.add("verified");
    } else {
      verificationStatus.textContent = "⚠ Account Pending Verification";
      verificationStatus.classList.add("not-verified");
    }
  }

  // Navigation between dashboard sections
  const navLinks = document.querySelectorAll(".dashboard-nav a");
  const sections = document.querySelectorAll(".dashboard-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.getAttribute("data-section");

      // Update active nav link
      navLinks.forEach((navLink) => {
        navLink.parentElement.classList.remove("active");
      });
      this.parentElement.classList.add("active");

      // Show target section, hide others
      sections.forEach((section) => {
        if (section.id === targetSection) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
    });
  });

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      // Send logout request to API
      fetch("/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
      })
        .then(() => {
          // Clear local storage and redirect to login page
          localStorage.removeItem("authToken");
          localStorage.removeItem("retailerId");
          localStorage.removeItem("businessName");
          localStorage.removeItem("storeName");
          localStorage.removeItem("isVerified");
          window.location.href = "retailer-login.html";
        })
        .catch((error) => {
          console.error("Logout failed:", error);
          // Force logout on client side even if API call fails
          localStorage.removeItem("authToken");
          localStorage.removeItem("retailerId");
          localStorage.removeItem("businessName");
          localStorage.removeItem("storeName");
          localStorage.removeItem("isVerified");
          window.location.href = "retailer-login.html";
        });
    });
  }

  // Add Product Modal Functionality
  const addProductBtn = document.getElementById("addProductBtn");
  const addProductModal = document.getElementById("addProductModal");
  const closeModalBtn = document.querySelector(".close-modal");

  if (addProductBtn && addProductModal) {
    addProductBtn.addEventListener("click", function () {
      addProductModal.style.display = "flex";
    });

    closeModalBtn.addEventListener("click", function () {
      addProductModal.style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
      if (event.target == addProductModal) {
        addProductModal.style.display = "none";
      }
    });
  }

  // Handle Add Product Form Submission
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData();
      formData.append("name", document.getElementById("productName").value);
      formData.append(
        "description",
        document.getElementById("productDescription").value
      );
      formData.append("price", document.getElementById("productPrice").value);
      formData.append(
        "category",
        document.getElementById("productCategory").value
      );

      // Handle image upload
      const imageFile = document.getElementById("productImage").files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Send request to API
      fetch("/api/products/", {
        method: "POST",
        headers: {
          Authorization: `Token ${authToken}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add product");
          }
          return response.json();
        })
        .then((data) => {
          // Close modal and reset form
          addProductModal.style.display = "none";
          addProductForm.reset();

          // Refresh products display
          fetchProducts();

          // Show success notification
          alert("Product added successfully!");
        })
        .catch((error) => {
          console.error("Error adding product:", error);
          alert("Failed to add product. Please try again.");
        });
    });
  }

  // Function to fetch and display products
  function fetchProducts() {
    const productsGrid = document.querySelector(".products-grid");

    if (!productsGrid) return;

    // Show loading state
    productsGrid.innerHTML = "<p>Loading products...</p>";

    fetch(`/api/products/retailer/${retailerId}/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((products) => {
        if (products.length === 0) {
          productsGrid.innerHTML =
            '<p class="empty-state">You haven\'t added any products yet</p>';
          return;
        }

        // Display products
        productsGrid.innerHTML = "";
        products.forEach((product) => {
          const productCard = document.createElement("div");
          productCard.className = "product-card";
          productCard.innerHTML = `
          <img src="${product.image || "assets/placeholder.jpg"}" alt="${
            product.name
          }">
          <h4>${product.name}</h4>
          <p class="product-price">₹${product.price}</p>
          <div class="product-actions">
            <button class="edit-btn" data-id="${product.id}">Edit</button>
            <button class="delete-btn" data-id="${product.id}">Delete</button>
          </div>
        `;
          productsGrid.appendChild(productCard);
        });

        // Add event listeners to edit and delete buttons
        addProductEventListeners();
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        productsGrid.innerHTML =
          '<p class="empty-state">Error loading products. Please try again.</p>';
      });
  }

  // Function to add event listeners to product actions
  function addProductEventListeners() {
    // Edit product buttons
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        // Implement edit product functionality
        alert("Edit product functionality will be implemented here");
      });
    });

    // Delete product buttons
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this product?")) {
          // Send delete request to API
          fetch(`/api/products/${productId}/`, {
            method: "DELETE",
            headers: {
              Authorization: `Token ${authToken}`,
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete product");
              }
              // Refresh products display
              fetchProducts();
            })
            .catch((error) => {
              console.error("Error deleting product:", error);
              alert("Failed to delete product. Please try again.");
            });
        }
      });
    });
  }

  // Load account settings
  function loadAccountSettings() {
    const settingsForm = document.getElementById("accountSettingsForm");
    if (!settingsForm) return;

    // Fetch retailer profile data
    fetch(`/api/retailers/${retailerId}/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch account settings");
        }
        return response.json();
      })
      .then((data) => {
        // Fill the form with data
        document.getElementById("settingsUsername").value = data.username;
        document.getElementById("settingsEmail").value = data.email;
        document.getElementById("settingsStoreName").value =
          data.store_name || "";
        document.getElementById("settingsBusinessName").value =
          data.business_name || "";
        document.getElementById("settingsPhone").value =
          data.phone_number || "";
        document.getElementById("settingsAddress").value = data.address || "";
      })
      .catch((error) => {
        console.error("Error loading account settings:", error);
        const settingsMessage = document.getElementById("settingsMessage");
        settingsMessage.textContent =
          "Failed to load account settings. Please refresh the page.";
        settingsMessage.className = "form-message error";
      });

    // Handle settings form submission
    settingsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = {
        email: document.getElementById("settingsEmail").value,
        store_name: document.getElementById("settingsStoreName").value,
        business_name: document.getElementById("settingsBusinessName").value,
        phone_number: document.getElementById("settingsPhone").value,
        address: document.getElementById("settingsAddress").value,
      };

      // Include password only if it's provided
      const newPassword = document.getElementById("settingsPassword").value;
      if (newPassword) {
        formData.password = newPassword;
      }

      // Send update request
      fetch(`/api/retailers/${retailerId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
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
          // Update business name in localStorage if it changed
          if (data.business_name !== businessName) {
            localStorage.setItem("businessName", data.business_name);
            document.getElementById("businessNameDisplay").textContent =
              data.business_name;
          }

          // Update store name in localStorage if it changed
          if (data.store_name !== storeName) {
            localStorage.setItem("storeName", data.store_name);
            document.getElementById("storeNameDisplay").textContent =
              data.store_name;
          }

          // Show success message
          const settingsMessage = document.getElementById("settingsMessage");
          settingsMessage.textContent =
            "Account settings updated successfully!";
          settingsMessage.className = "form-message success";

          // Clear password field
          document.getElementById("settingsPassword").value = "";

          // Hide message after some time
          setTimeout(() => {
            settingsMessage.style.display = "none";
          }, 5000);
        })
        .catch((error) => {
          console.error("Error updating account settings:", error);
          const settingsMessage = document.getElementById("settingsMessage");
          settingsMessage.textContent =
            error.message || "Failed to update account settings.";
          settingsMessage.className = "form-message error";
        });
    });
  }

  // Initialize dashboard
  fetchProducts();
  loadAccountSettings();
});
