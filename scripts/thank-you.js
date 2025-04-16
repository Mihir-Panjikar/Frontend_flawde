document.addEventListener("DOMContentLoaded", function () {
  // Get order ID from session storage
  const orderId = sessionStorage.getItem("lastOrderId");

  if (orderId) {
    // Display the order number
    document.getElementById("orderNumber").textContent = orderId;

    // Optional: fetch order details from backend
    fetchOrderDetails(orderId);
  } else {
    // Fallback if no order ID
    document.getElementById("orderNumber").textContent = "N/A";
  }

  // Optional: Create confetti effect for celebration
  createConfetti();

  // Function to create simple confetti effect
  function createConfetti() {
    const confettiContainer = document.createElement("div");
    confettiContainer.className = "confetti-container";
    document.body.appendChild(confettiContainer);

    // Create multiple confetti pieces
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";

      // Randomize confetti appearance
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDelay = Math.random() * 5 + "s";
      confetti.style.backgroundColor = getRandomColor();

      // Add to container
      confettiContainer.appendChild(confetti);
    }

    // Remove confetti after animation completes
    setTimeout(() => {
      confettiContainer.remove();
    }, 10000);
  }

  // Generate random colors for confetti
  function getRandomColor() {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#FF33F5",
      "#F5FF33",
      "#33FFF5",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Add CSS for confetti animation
  const style = document.createElement("style");
  style.textContent = `
        .confetti-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f00;
            top: -10px;
            animation: fall 8s linear forwards;
        }
        
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
            }
        }
    `;
  document.head.appendChild(style);
});

async function fetchOrderDetails(orderId) {
  try {
    // You can implement this to fetch additional order details
    // const response = await fetch(`/api/orders/${orderId}/`);
    // const data = await response.json();
    // Update UI with additional order details if needed
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
}
