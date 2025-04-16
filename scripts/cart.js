// Get CSRF token for secure form submissions
function getCSRFToken() {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrftoken") {
      return value;
    }
  }
  return "";
}

document.addEventListener("DOMContentLoaded", function () {
  loadCartItems();

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }

  const navbarToggle = document.querySelector(".navbar-toggle");
  const navbar = document.querySelector(".navbar");
  const navMenu = document.querySelector(".navbar ul");

  // Create overlay element
  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  document.body.appendChild(overlay);

  navbarToggle.addEventListener("click", function () {
    navMenu.classList.toggle("open");
    navbar.classList.toggle("menu-open");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", function () {
    navMenu.classList.remove("open");
    navbar.classList.remove("menu-open");
    overlay.classList.remove("active");
  });

  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Add cart counter functionality
  updateCartCount();
});

function loadCartItems() {
  // Get cart data from localStorage
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const cartContainer = document.getElementById("cart-items");

  // Clear previous content
  cartContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    document.getElementById("checkout-btn").disabled = true;
    return;
  }

  // Calculate totals
  let subtotal = 0;

  // Display each item
  cartItems.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Create cart item element
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";
    cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-id="${item.id}">×</button>
        `;

    cartContainer.appendChild(cartItemElement);
  });

  // Update summary
  document.getElementById("subtotal").textContent = `₹${subtotal}`;
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;
  document.getElementById("total").textContent = `₹${total}`;

  // Add event listeners for buttons
  addCartEventListeners();
}

async function handleCheckout() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  if (cartItems.length === 0) {
    alert("Your cart is empty");
    return;
  }

  // Prepare order data
  const orderData = {
    status: "Pending",
    items: cartItems.map((item) => ({
      product: item.id,
      quantity: item.quantity,
    })),
  };

  try {
    // Send order data to backend
    const response = await fetch("/api/orders/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (response.ok) {
      // Store order ID for thank you page
      sessionStorage.setItem("lastOrderId", data.order_id);
      // Clear the cart
      localStorage.removeItem("cartItems");
      // Redirect to thank you page
      window.location.href = "/thank-you/";
    } else {
      alert(`Error: ${data.error || "Could not create order"}`);
    }
  } catch (error) {
    console.error("Error creating order:", error);
    alert("There was a problem processing your order. Please try again.");
  }
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function updateCartCount() {
  const cartCounter = document.querySelector(".cart-icon span");
  if (cartCounter) {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartCounter.textContent = cart.length;
    cartCounter.style.display = cart.length > 0 ? "flex" : "none";
  }
}

function addCartEventListeners() {
  const decreaseButtons = document.querySelectorAll(".quantity-btn.decrease");
  const increaseButtons = document.querySelectorAll(".quantity-btn.increase");
  const removeButtons = document.querySelectorAll(".remove-btn");

  decreaseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateItemQuantity(this.dataset.id, -1);
    });
  });

  increaseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      updateItemQuantity(this.dataset.id, 1);
    });
  });

  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      removeItemFromCart(this.dataset.id);
    });
  });
}

function updateItemQuantity(itemId, change) {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const item = cartItems.find((item) => item.id.toString() === itemId.toString());

  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItemFromCart(itemId);
    } else {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      loadCartItems();
    }
  }
}

function removeItemFromCart(itemId) {
  let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  cartItems = cartItems.filter((item) => item.id.toString() !== itemId.toString());
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  loadCartItems();
}
