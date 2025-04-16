document.addEventListener('DOMContentLoaded', function() {
    // Get room name from the HTML template
    const roomName = JSON.parse(document.getElementById('room-name').textContent);
    
    // Elements
    const chatLog = document.getElementById('chat-log');
    const messageInput = document.getElementById('chat-message-input');
    const messageSubmit = document.getElementById('chat-message-submit');
    const usernameInput = document.getElementById('username');
    
    // Set default username from localStorage or generate a guest name
    usernameInput.value = localStorage.getItem('chat_username') || 'Guest_' + Math.floor(Math.random() * 1000);
    
    // Save username when changed
    usernameInput.addEventListener('change', function() {
        localStorage.setItem('chat_username', this.value);
    });
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const chatSocket = new WebSocket(
        protocol + window.location.host + '/ws/chat/' + roomName + '/'
    );
    
    // Handle incoming messages
    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        displayMessage(data.message, data.username);
    };
    
    // Handle WebSocket connection errors
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
        displaySystemMessage('Connection lost. Please refresh the page.');
    };
    
    // Focus on message input
    messageInput.focus();
    
    // Handle Enter key press in message input
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            messageSubmit.click();
        }
    });
    
    // Handle send button click
    messageSubmit.addEventListener('click', function() {
        const message = messageInput.value.trim();
        const username = usernameInput.value.trim() || 'Anonymous';
        
        // Don't send empty messages
        if (message === '') return;
        
        // Send message via WebSocket
        chatSocket.send(JSON.stringify({
            'message': message,
            'username': username
        }));
        
        // Clear input field
        messageInput.value = '';
        
        // Reset focus
        messageInput.focus();
    });
    
    // Function to display messages in the chat log
    function displayMessage(message, sender) {
        const messageElement = document.createElement('div');
        const currentUser = usernameInput.value.trim();
        
        // Determine if this message was sent by the current user
        const messageType = sender === currentUser ? 'sent' : 'received';
        
        messageElement.className = `message ${messageType}`;
        
        // Create message content with username and timestamp
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0');
        
        messageElement.innerHTML = `
            <div class="sender">${sender}</div>
            <div class="content">${escapeHTML(message)}</div>
            <div class="time">${timeStr}</div>
        `;
        
        // Add to chat log
        chatLog.appendChild(messageElement);
        
        // Scroll to bottom of chat
        chatLog.scrollTop = chatLog.scrollHeight;
    }
    
    // Function to display system messages
    function displaySystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = message;
        
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }
    
    // Helper function to escape HTML content
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Display welcome message
    displaySystemMessage('Welcome to the chat room! You are now connected.');
});