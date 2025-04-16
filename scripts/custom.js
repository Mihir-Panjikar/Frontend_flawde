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
  // Calculate total price when checkboxes are clicked
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const priceDisplay = document.getElementById("customPrice");
  let basePrice = 500; // Starting price

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updatePrice);
  });

  function updatePrice() {
    let total = basePrice;
    checkboxes.forEach((box) => {
      if (box.checked) {
        total += parseInt(box.dataset.price);
      }
    });
    priceDisplay.textContent = total;
  }

  // Handle form submission
  const customForm = document.getElementById("customForm");

  customForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const bouquetName = document.getElementById("bouquetName").value;
    const message = document.getElementById("message").value;
    const selectedOptions = [];

    checkboxes.forEach((box) => {
      if (box.checked) {
        selectedOptions.push({
          name: box.value,
          price: parseInt(box.dataset.price),
        });
      }
    });

    const totalPrice = parseInt(priceDisplay.textContent);

    // Prepare order data
    const orderData = {
      name: bouquetName,
      message: message,
      options: selectedOptions,
      totalPrice: totalPrice,
      type: "custom",
    };

    // Save to cart in localStorage
    addToCart(orderData);

    // Optional: Send to backend API
    /*
        fetch('/api/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/cart/';
        })
        .catch(error => {
            console.error('Error:', error);
        });
        */

    // For now just redirect to cart
    window.location.href = "/cart/";
  });

  // Function to add items to cart
  function addToCart(item) {
    let cart = localStorage.getItem("cart");

    if (!cart) {
      cart = [];
    } else {
      cart = JSON.parse(cart);
    }

    // Add unique ID to item
    item.id = Date.now();
    cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));
  }
});
