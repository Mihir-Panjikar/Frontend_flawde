// scripts/chatbot.js

document.addEventListener("DOMContentLoaded", function () {
  // Get room name from the HTML template
  const roomName = JSON.parse(document.getElementById("room-name").textContent);

  // Get DOM elements
  const chatLog = document.getElementById("chat-log");
  const messageInput = document.getElementById("chat-message-input");
  const messageSubmit = document.getElementById("chat-message-submit");
  const usernameInput = document.getElementById("username");
  const quickButtons = document.querySelectorAll(".quick-btn");

  // Set default username from localStorage or generate a guest name
  usernameInput.value =
    localStorage.getItem("chat_username") ||
    "Guest_" + Math.floor(Math.random() * 1000);

  // Save username when changed
  usernameInput.addEventListener("change", function () {
    localStorage.setItem("chat_username", this.value);
  });

  // Chat state management
  let chatContext = {
    inNegotiation: false,
    productDiscussed: null,
    originalPrice: 0,
    lowestPrice: 0,
    offeredPrice: 0,
    negotiationAttempts: 0,
  };

  // Create WebSocket connection
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const chatSocket = new WebSocket(
    protocol + window.location.host + "/ws/chat/" + roomName + "/"
  );

  // Handle incoming messages
  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);

    // Hide typing indicator if it exists
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }

    if (data.type === "bot_response") {
      displayBotMessage(data.message);

      // Handle negotiation options
      if (data.negotiation) {
        chatContext.inNegotiation = true;
        chatContext.productDiscussed = data.negotiation.product;
        chatContext.originalPrice = data.negotiation.originalPrice;
        chatContext.lowestPrice = data.negotiation.lowestPrice;
        chatContext.offeredPrice = data.negotiation.offeredPrice;

        displayNegotiationInterface(
          data.negotiation.product,
          data.negotiation.originalPrice,
          data.negotiation.offeredPrice
        );
      }

      // Handle options/buttons
      if (data.options && data.options.length > 0) {
        displayOptions(data.options);
      }
    } else {
      displayMessage(data.message, data.username);
    }
  };

  // Handle WebSocket connection errors
  chatSocket.onclose = function (e) {
    console.error("Chat socket closed unexpectedly");
    displaySystemMessage("Connection lost. Please refresh the page.");
  };

  // Send initial greeting when connected
  chatSocket.onopen = function (e) {
    showTypingIndicator();
    setTimeout(() => {
      sendToChatbot("greeting");
    }, 1000);
  };

  // Focus on message input
  messageInput.focus();

  // Handle Enter key press in message input
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      messageSubmit.click();
    }
  });

  // Handle quick buttons
  quickButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const query = this.dataset.query;
      messageInput.value = query;
      messageSubmit.click();
    });
  });

  // Handle send button click
  messageSubmit.addEventListener("click", function () {
    const message = messageInput.value.trim();
    const username = usernameInput.value.trim() || "Anonymous";

    if (message === "") return;

    // Display user message
    displayMessage(message, username);

    // Show typing indicator for bot response
    showTypingIndicator();

    // Send message to chatbot
    sendToChatbot(message);

    // Clear input field
    messageInput.value = "";
    messageInput.focus();
  });

  // Function to send message to chatbot
  function sendToChatbot(message) {
    chatSocket.send(
      JSON.stringify({
        message: message,
        username: usernameInput.value.trim() || "Anonymous",
        context: chatContext,
      })
    );
  }

  // Function to display messages in the chat log
  function displayMessage(message, sender) {
    const messageElement = document.createElement("div");

    messageElement.className = "message sent";

    // Create message content with username and timestamp
    const now = new Date();
    const timeStr =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    messageElement.innerHTML = `
            <div class="sender">${escapeHTML(sender)}</div>
            <div class="content">${escapeHTML(message)}</div>
            <div class="time">${timeStr}</div>
        `;

    // Add to chat log
    chatLog.appendChild(messageElement);

    // Scroll to bottom of chat
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Function to display bot messages
  function displayBotMessage(message) {
    const messageElement = document.createElement("div");

    messageElement.className = "message received bot";

    // Create message content with username and timestamp
    const now = new Date();
    const timeStr =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    messageElement.innerHTML = `
            <div class="sender">FlowerBot</div>
            <div class="content">${message}</div>
            <div class="time">${timeStr}</div>
        `;

    // Add to chat log
    chatLog.appendChild(messageElement);

    // Scroll to bottom of chat
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Function to display system messages
  function displaySystemMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "system-message";
    messageElement.textContent = message;

    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Function to show typing indicator
  function showTypingIndicator() {
    const typingElement = document.createElement("div");
    typingElement.className = "typing-indicator";
    typingElement.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

    chatLog.appendChild(typingElement);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Function to display interactive options
  function displayOptions(options) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "option-buttons";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.textContent = option;
      button.addEventListener("click", function () {
        messageInput.value = option;
        messageSubmit.click();
      });

      optionsContainer.appendChild(button);
    });

    // Find the last bot message and append options to it
    const lastBotMessage = chatLog.querySelector(".message.bot:last-of-type");
    if (lastBotMessage) {
      lastBotMessage.appendChild(optionsContainer);
    } else {
      chatLog.appendChild(optionsContainer);
    }

    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Function to display negotiation interface
  function displayNegotiationInterface(product, originalPrice, offeredPrice) {
    const negotiationElement = document.createElement("div");
    negotiationElement.className = "price-negotiation";

    const minPrice = Math.floor(originalPrice * 0.7); // 70% of original as minimum
    const maxPrice = originalPrice;

    negotiationElement.innerHTML = `
            <h4>Price Negotiation for ${product}</h4>
            <p>Original price: ₹${originalPrice}</p>
            <p>Offered price: ₹${offeredPrice}</p>
            
            <input type="range" id="price-slider" class="price-slider" 
                   min="${minPrice}" max="${maxPrice}" value="${offeredPrice}" 
                   step="50">
            
            <div class="price-controls">
                <span class="current-price">₹${offeredPrice}</span>
                <button class="negotiate-btn">Make Counter Offer</button>
            </div>
        `;

    chatLog.appendChild(negotiationElement);

    // Add event listeners for negotiation interface
    const slider = negotiationElement.querySelector("#price-slider");
    const priceDisplay = negotiationElement.querySelector(".current-price");
    const negotiateBtn = negotiationElement.querySelector(".negotiate-btn");

    slider.addEventListener("input", function () {
      priceDisplay.textContent = `₹${this.value}`;
    });

    negotiateBtn.addEventListener("click", function () {
      const counterOffer = slider.value;

      // Update context
      chatContext.offeredPrice = counterOffer;
      chatContext.negotiationAttempts++;

      // Send counter offer
      displayMessage(
        `I'd like to offer ₹${counterOffer} for the ${product}.`,
        usernameInput.value.trim() || "Anonymous"
      );

      // Show typing indicator
      showTypingIndicator();

      // Send to chatbot
      sendToChatbot(`counter_offer:${counterOffer}`);

      // Remove negotiation interface
      negotiationElement.remove();
    });

    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Helper function to escape HTML content
  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
