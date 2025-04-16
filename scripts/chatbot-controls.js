document.addEventListener("DOMContentLoaded", function () {
  // Initialize chatbot UI controls after a short delay
  // to ensure the chatbot HTML is loaded
  setTimeout(() => {
    initChatbotControls();
  }, 500);
});

function initChatbotControls() {
  // Get control buttons
  const minimizeBtn = document.querySelector(".minimize-chat");
  const clearChatBtn = document.querySelector(".clear-chat");
  const chatbotContainer = document.querySelector(".chatbot-container");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotSuggestions = document.querySelector(".chatbot-suggestions");

  if (!minimizeBtn || !clearChatBtn) return;

  // Minimize/expand chatbot
  minimizeBtn.addEventListener("click", function () {
    const isMinimized = chatbotContainer.classList.toggle("minimized");
    
    // Update button text/icon
    this.textContent = isMinimized ? "▲" : "▼";
    this.title = isMinimized ? "Expand" : "Minimize";
    
    // Hide/show suggestions when minimized
    if (chatbotSuggestions) {
      chatbotSuggestions.style.display = isMinimized ? "none" : "block";
    }
  });

  // Clear chat history
  clearChatBtn.addEventListener("click", function () {
    // Display confirmation dialog
    if (confirm("Clear the entire conversation?")) {
      // Keep only system messages for instructions
      const systemMessages = Array.from(chatbotMessages.querySelectorAll(".system-message"));
      
      // Clear messages
      chatbotMessages.innerHTML = '';
      
      // Re-add important system messages
      systemMessages.forEach(msg => {
        chatbotMessages.appendChild(msg);
      });
      
      // Add a new system message indicating the chat was cleared
      const clearMsg = document.createElement("div");
      clearMsg.className = "system-message";
      clearMsg.textContent = "Conversation cleared";
      chatbotMessages.appendChild(clearMsg);
      
      // Send message to server to clear context if needed
      if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
        window.chatSocket.send(JSON.stringify({
          type: "clear_context"
        }));
      }
    }
  });
  
  // Add CSS for minimized state
  const style = document.createElement("style");
  style.textContent = `
    .chatbot-container.minimized .chatbot-messages,
    .chatbot-container.minimized .chatbot-input {
      display: none;
    }
    
    .chatbot-container.minimized {
      height: auto;
    }
  `;
  document.head.appendChild(style);
}