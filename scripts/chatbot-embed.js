document.addEventListener("DOMContentLoaded", function () {
  // First load the chatbot HTML structure
  fetch("/chat/chatbot-structure/")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("chatbot-placeholder").innerHTML = html;

      // After HTML is loaded, initialize the WebSocket
      initChatbotSocket();
    })
    .catch((err) => {
      console.error("Failed to load chatbot:", err);
      document.getElementById("chatbot-placeholder").innerHTML = 
        '<div class="system-message">Failed to load chatbot. Please refresh the page.</div>';
    });
});

function initChatbotSocket() {
  // Get session key from a data attribute or generate a guest ID
  const sessionId =
    document
      .getElementById("chatbot-placeholder")
      .getAttribute("data-session-id") ||
    "guest-" + Math.random().toString(36).substring(2, 15);

  // Create WebSocket connection
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const chatSocket = new WebSocket(
    protocol + window.location.host + "/ws/chatbot/" + sessionId + "/"
  );

  const messageContainer = document.getElementById("chatbot-messages");
  const userInput = document.getElementById("user-message");
  const sendButton = document.getElementById("send-button");

  // Context management for conversation state
  let chatContext = {
    inNegotiation: false,
    productDiscussed: null,
    lastMessageTime: null,
    conversationHistory: [],
    recentTopics: []
  };

  if (!messageContainer || !userInput || !sendButton) {
    console.error("Chatbot elements not found");
    return;
  }

  // Add welcome message when socket connects
  chatSocket.onopen = function(e) {
    showTypingIndicator();
    
    // Slight delay to simulate bot typing
    setTimeout(() => {
      removeTypingIndicator();
      addBotMessage("Welcome to FloraCouture! How can I help you today with flowers or arrangements?");
      
      // Add a system welcome message with info
      addSystemMessage("Feel free to ask about our products, delivery options, or custom arrangements.");
    }, 1000);
  };

  chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    
    // Remove typing indicator if present
    removeTypingIndicator();

    // Handle different message types
    if (data.type === "bot_response" || data.sender === "bot") {
      addBotMessage(data.message);
      
      // Update conversation context
      chatContext.lastMessageTime = new Date();
      chatContext.conversationHistory.push({
        role: "bot",
        message: data.message,
        timestamp: new Date()
      });

      // Handle rich responses
      handleRichResponse(data);
    } else {
      addUserMessage(data.message);
      
      // Update conversation context
      chatContext.conversationHistory.push({
        role: "user",
        message: data.message,
        timestamp: new Date()
      });
    }
  };

  chatSocket.onclose = function (e) {
    console.error("Chat socket closed unexpectedly");
    addSystemMessage("Connection lost. Please refresh the page to reconnect.");
    
    // Disable input
    userInput.disabled = true;
    sendButton.disabled = true;
  };

  // Error handling for socket
  chatSocket.onerror = function(e) {
    console.error("WebSocket error:", e);
    addSystemMessage("An error occurred with the chat connection.");
  };

  // Send message function
  function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      // Add user message to UI immediately
      addUserMessage(message);
      
      // Show typing indicator for bot response
      showTypingIndicator();

      // Send to WebSocket
      try {
        chatSocket.send(
          JSON.stringify({
            message: message,
            context: chatContext
          })
        );
      } catch (error) {
        removeTypingIndicator();
        addSystemMessage("Failed to send message. Please check your connection.");
        console.error("Send message error:", error);
      }

      // Update context with the topic extraction (simple version)
      updateContextWithTopic(message);

      // Clear input
      userInput.value = "";
    }
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);

  userInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Implement "user is typing" indicator
  userInput.addEventListener("input", function() {
    // Could send typing status to server if needed
    // chatSocket.send(JSON.stringify({type: 'typing'}));
  });

  // Quick suggestion buttons
  document.querySelectorAll(".suggestion-btn").forEach((button) => {
    button.addEventListener("click", function () {
      userInput.value = this.getAttribute("data-message");
      sendMessage();
    });
  });

  // Helper functions
  function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "user-message");
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${escapeHTML(message)}</p>
        <span class="message-time">${formatTime(new Date())}</span>
      </div>
      <div class="message-avatar">👤</div>
    `;
    messageContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  function addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "bot-message");
    messageDiv.innerHTML = `
      <div class="message-avatar">🌸</div>
      <div class="message-content">
        <p>${message}</p>
        <span class="message-time">${formatTime(new Date())}</span>
      </div>
    `;
    messageContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  function addSystemMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("system-message");
    messageDiv.textContent = message;
    messageContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    // Remove existing typing indicator if any
    removeTypingIndicator();
    
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message", "typing-indicator");
    typingDiv.innerHTML = `
      <div class="message-avatar">🌸</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messageContainer.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typingIndicator = messageContainer.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  
  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function updateContextWithTopic(message) {
    // Simple keyword extraction
    const keywords = ["roses", "delivery", "bouquet", "order", "price", "custom", "wedding", "birthday"];
    const lowercaseMsg = message.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowercaseMsg.includes(keyword) && !chatContext.recentTopics.includes(keyword)) {
        chatContext.recentTopics.push(keyword);
        // Keep only last 3 topics
        if (chatContext.recentTopics.length > 3) {
          chatContext.recentTopics.shift();
        }
      }
    });
  }

  function handleRichResponse(data) {
    // Handle product cards
    if (data.products && data.products.length) {
      addProductCards(data.products);
    }
    
    // Handle quick reply buttons
    if (data.quickReplies && data.quickReplies.length) {
      addQuickReplies(data.quickReplies);
    }
    
    // Handle negotiation options
    if (data.negotiation) {
      handleNegotiation(data.negotiation);
    }
    
    // Handle images
    if (data.image) {
      addImageMessage(data.image);
    }
  }

  function addProductCards(products) {
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "product-cards";
    
    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h4>${product.name}</h4>
        <p class="price">₹${product.price}</p>
        <button class="view-product" data-id="${product.id}">View Details</button>
      `;
      
      cardsContainer.appendChild(card);
    });
    
    messageContainer.appendChild(cardsContainer);
    scrollToBottom();
    
    // Add click handlers
    cardsContainer.querySelectorAll('.view-product').forEach(button => {
      button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        userInput.value = `Tell me more about product #${productId}`;
        sendMessage();
      });
    });
  }
  
  function addQuickReplies(replies) {
    const repliesContainer = document.createElement("div");
    repliesContainer.className = "quick-replies";
    
    replies.forEach(reply => {
      const button = document.createElement("button");
      button.className = "quick-reply-btn";
      button.textContent = reply;
      
      button.addEventListener('click', function() {
        userInput.value = this.textContent;
        sendMessage();
        
        // Remove the quick replies after selection
        repliesContainer.remove();
      });
      
      repliesContainer.appendChild(button);
    });
    
    messageContainer.appendChild(repliesContainer);
    scrollToBottom();
  }
  
  function handleNegotiation(negotiation) {
    chatContext.inNegotiation = true;
    chatContext.productDiscussed = negotiation.product;
    
    const negotiationDiv = document.createElement("div");
    negotiationDiv.className = "negotiation-container";
    negotiationDiv.innerHTML = `
      <h4>Price Negotiation</h4>
      <p>Product: ${negotiation.product}</p>
      <p>Original price: ₹${negotiation.originalPrice}</p>
      <p>Current offer: ₹${negotiation.offeredPrice}</p>
      
      <input type="range" 
             min="${negotiation.lowestPrice}" 
             max="${negotiation.originalPrice}" 
             value="${negotiation.offeredPrice}"
             class="price-slider">
             
      <div class="price-display">₹<span class="selected-price">${negotiation.offeredPrice}</span></div>
      
      <div class="negotiation-buttons">
        <button class="counter-offer-btn">Make Counter Offer</button>
        <button class="accept-price-btn">Accept Price</button>
      </div>
    `;
    
    messageContainer.appendChild(negotiationDiv);
    scrollToBottom();
    
    // Add event listeners
    const slider = negotiationDiv.querySelector('.price-slider');
    const priceDisplay = negotiationDiv.querySelector('.selected-price');
    
    slider.addEventListener('input', function() {
      priceDisplay.textContent = this.value;
    });
    
    negotiationDiv.querySelector('.counter-offer-btn').addEventListener('click', function() {
      const offerPrice = slider.value;
      userInput.value = `I'd like to offer ₹${offerPrice} for the ${negotiation.product}`;
      sendMessage();
      negotiationDiv.remove();
    });
    
    negotiationDiv.querySelector('.accept-price-btn').addEventListener('click', function() {
      userInput.value = `I accept the price of ₹${negotiation.offeredPrice} for the ${negotiation.product}`;
      sendMessage();
      negotiationDiv.remove();
    });
  }
  
  function addImageMessage(imageUrl) {
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("message", "bot-message");
    imageDiv.innerHTML = `
      <div class="message-avatar">🌸</div>
      <div class="message-content">
        <img src="${imageUrl}" alt="Product image" class="message-image">
        <span class="message-time">${formatTime(new Date())}</span>
      </div>
    `;
    messageContainer.appendChild(imageDiv);
    scrollToBottom();
  }
}
