const bouquets = [
  {
    name: "Romantic Red Roses Bouquet",
    description: "12 fresh red roses wrapped in love.",
    price: 499,
    image: "assets/Red Rose bouquet.jpg",
  },
  {
    name: "Pink Rose Bouquet",
    description: "Fresh Pink roses wrapped in love.",
    price: 599,
    image: "assets/pink rose bouquet.jpg",
  },
  {
    name: "White Rose Bouquet",
    description: "Fresh White roses wrapped in love.",
    price: 699,
    image: "assets/White Rose Bouquet.jpg",
  },
  {
    name: "Tulip Bouquet",
    description: "Elegant tulip bouquet bursting with color and charm.",
    price: 799,
    image: "assets/Tulip Bouquet.jpg",
  },
  {
    name: "Black Rose Bouquet",
    description: "Fresh Black roses wrapped in love.",
    price: 899,
    image: "assets/Black Rose Bouquet.jpeg",
  },
  {
    name: "Lavender Bouquet",
    description: "Fresh Lavenders wrapped in love.",
    price: 699,
    image: "assets/Lavender Bouquet.jpg",
  },
  {
    name: "Lily Bouquet",
    description:
      "Graceful lily bouquet radiating purity , elegance, and fragrance.",
    price: 799,
    image: "assets/Lily Bouquet.jpg",
  },
  {
    name: "Mixed Bouquet",
    description: "A bouquet with elegent flowers",
    price: 599,
    image: "assets/Mixed Bouquet.jpg",
  },
  {
    name: "Sunflower Bouquet",
    description: "Vibrant sunflower bouquet shining with warmth and happiness.",
    price: 899,
    image: "assets/Sunflower Bouquet.jpg",
  },
  {
    name: "White Daisy Bouquet",
    description:
      "Vibrant White Daisy bouquet shining with purity and elegance.",
    price: 799,
    image: "assets/White Daisy Bouquet.jpg",
  },

  {
    name: "Box Bouquet",
    description: "",
    price: 999,
    image: "assets/Box Bouquet.jpg",
  },
  {
    name: "Chocolate Bouquet",
    description: "",
    price: 899,
    image: "assets/Chocolate Bouquet.jpg",
  },
  {
    name: "Ferrero rocher Bouquet",
    description: "",
    price: 999,
    image: "assets/Ferrero rocher Bouquet.webp",
  },
  {
    name: "Heart shaped Bouquet",
    description: "",
    price: 1299,
    image: "assets/Heart shaped Bouquet.jpg",
  },
  {
    name: "Hot wheels Bouquet",
    description: "",
    price: 1399,
    image: "assets/Hot wheels Bouquet.jpg",
  },
  {
    name: "Money Bouquet",
    description: "",
    price: 899,
    image: "assets/Money Bouquet.jpg",
  },
  {
    name: "Personlized Bouquet",
    description: "",
    price: 1299,
    image: "assets/Personalized Bouquet.jpg",
  },
  {
    name: "Ribbon Bouquet",
    description: "",
    price: 899,
    image: "assets/Ribbion bouquet.jpg",
  },
  {
    name: "Toy Bouquet",
    description: "",
    price: 999,
    image: "assets/Toy bouquet.jpg",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  // Only generate cards if the bouquetGrid element exists
  const bouquetGrid = document.getElementById("bouquetGrid");

  if (bouquetGrid) {
    // Generate dynamic cards only if the container exists
    bouquets.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "bouquet-card";
      card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p><strong>₹${item.price}</strong></p>
          <button class="add-to-cart" data-id="${index}" data-name="${item.name}" data-price="${item.price}">Add to Cart</button>
        `;
      bouquetGrid.appendChild(card);
    });
  }

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

  // Get all "Add to Cart" buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  // Add click event listeners to all buttons
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.dataset.id;
      const productName = this.dataset.name;
      const productPrice = parseInt(this.dataset.price);

      // Create product object
      const product = {
        id: Date.now(), // Unique identifier
        productId: productId,
        name: productName,
        price: productPrice,
        type: "simple",
      };

      // Add to cart
      addToCart(product);

      // Show confirmation to user
      showAddedToCartMessage(productName);
    });
  });

  // Function to add items to cart
  function addToCart(item) {
    let cart = localStorage.getItem("cart");

    if (!cart) {
      cart = [];
    } else {
      cart = JSON.parse(cart);
    }

    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update cart count if you have a cart indicator
    updateCartCount();
  }

  // Function to show "Added to Cart" message
  function showAddedToCartMessage(productName) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector(".cart-notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.className = "cart-notification";
      document.body.appendChild(notification);
    }

    // Set message and show notification
    notification.textContent = `${productName} added to cart!`;
    notification.classList.add("show");

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // Function to update cart count indicator (if you have one)
  function updateCartCount() {
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      cartCountElement.textContent = cart.length;
    }
  }

  // Initialize cart count on page load
  updateCartCount();
});
