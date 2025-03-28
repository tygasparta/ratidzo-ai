/**
 * Ratidzo Health AI Chat Module
 * This module provides the chat functionality for the Ratidzo Health AI application
 * It integrates with the DeepSeek AI API through our PHP proxy
 */

// Chat configuration - using the PHP proxy
const CHAT_ENDPOINT = '/api-proxy.php/chat'; // Using the PHP proxy

// Chat state
let chatHistory = [];
let isChatOpen = false;
let isWaitingForResponse = false;

/**
 * Initialize the chat functionality
 */
function initChat() {
  console.log('Chat initialization starting...');
  
  // Create chat UI elements
  createChatInterface();
  
  // Use direct ID selector for the chat button
  const chatButton = document.getElementById('health-chat-button');
  if (chatButton) {
    console.log('Found chat button by ID');
    
    // Add event listener using a named function for better debugging
    function chatToggleHandler(event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Chat button clicked - toggling chat');
      toggleChat();
      return false;
    }
    
    // Remove any existing event listeners by cloning the node
    const newChatButton = chatButton.cloneNode(true);
    chatButton.parentNode.replaceChild(newChatButton, chatButton);
    
    // Add our new event listener
    newChatButton.addEventListener('click', chatToggleHandler, true);
    console.log('Chat button event listener attached successfully');
  } else {
    console.error('Could not find chat button with ID "health-chat-button"');
  }
  
  // Add event listener for send message button
  const sendButton = document.getElementById('chat-send-button');
  if (sendButton) {
    sendButton.addEventListener('click', sendChatMessage);
  }
  
  // Add event listener for input field (send on Enter)
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
      }
    });
  }
  
  // Add event listener for close button
  const closeButton = document.getElementById('chat-close-button');
  if (closeButton) {
    closeButton.addEventListener('click', toggleChat);
  }
}

/**
 * Create the chat interface elements and add them to the DOM
 */
function createChatInterface() {
  // Create chat container
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  chatContainer.id = 'chat-container';
  chatContainer.style.display = 'none';
  
  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.className = 'chat-header';
  
  const chatTitle = document.createElement('div');
  chatTitle.className = 'chat-title';
  
  const chatIcon = document.createElement('i');
  chatIcon.className = 'fas fa-robot';
  
  const chatTitleText = document.createElement('span');
  chatTitleText.textContent = 'Ratidzo Health Assistant';
  
  const closeButton = document.createElement('button');
  closeButton.id = 'chat-close-button';
  closeButton.innerHTML = '&times;';
  
  chatTitle.appendChild(chatIcon);
  chatTitle.appendChild(chatTitleText);
  chatHeader.appendChild(chatTitle);
  chatHeader.appendChild(closeButton);
  
  // Create chat messages container
  const chatMessages = document.createElement('div');
  chatMessages.className = 'chat-messages';
  chatMessages.id = 'chat-messages';
  
  // Create welcome message
  const welcomeMessage = document.createElement('div');
  welcomeMessage.className = 'chat-message ai-message';
  welcomeMessage.innerHTML = `
    <div class="message-content">
      <p>Hello! I'm your Ratidzo Health Assistant. How can I help with your health questions today?</p>
    </div>
  `;
  chatMessages.appendChild(welcomeMessage);
  
  // Create chat input area
  const chatInputArea = document.createElement('div');
  chatInputArea.className = 'chat-input-area';
  
  const chatForm = document.createElement('div');
  chatForm.className = 'chat-form';
  
  const chatInput = document.createElement('textarea');
  chatInput.id = 'chat-input';
  chatInput.placeholder = 'Type your health question...';
  chatInput.rows = 1;
  
  const sendButton = document.createElement('button');
  sendButton.id = 'chat-send-button';
  sendButton.type = 'button';
  
  const sendIcon = document.createElement('i');
  sendIcon.className = 'fas fa-paper-plane';
  sendButton.appendChild(sendIcon);
  
  chatForm.appendChild(chatInput);
  chatForm.appendChild(sendButton);
  
  const chatDisclaimer = document.createElement('div');
  chatDisclaimer.className = 'chat-disclaimer';
  chatDisclaimer.innerHTML = `
    <p>This AI assistant provides information for educational purposes only and does not replace professional medical advice.</p>
  `;
  
  chatInputArea.appendChild(chatForm);
  chatInputArea.appendChild(chatDisclaimer);
  
  // Assemble chat container
  chatContainer.appendChild(chatHeader);
  chatContainer.appendChild(chatMessages);
  chatContainer.appendChild(chatInputArea);
  
  // Add to the DOM
  document.body.appendChild(chatContainer);
}

/**
 * Toggle the chat interface visibility
 */
function toggleChat() {
  const chatContainer = document.getElementById('chat-container');
  if (!chatContainer) return;
  
  isChatOpen = !isChatOpen;
  
  if (isChatOpen) {
    chatContainer.style.display = 'flex';
    setTimeout(() => {
      chatContainer.classList.add('chat-open');
      // Focus the input field
      document.getElementById('chat-input').focus();
    }, 10);
  } else {
    chatContainer.classList.remove('chat-open');
    setTimeout(() => {
      chatContainer.style.display = 'none';
    }, 300);
  }
  
  // Update chat button aria-expanded attribute
  const chatButton = document.querySelector('.chat-button button');
  if (chatButton) {
    chatButton.setAttribute('aria-expanded', isChatOpen);
  }
}

/**
 * Send a chat message to the DeepSeek AI API via PHP proxy
 */
async function sendChatMessage() {
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  if (!chatInput || !chatMessages || isWaitingForResponse) return;
  
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  
  console.log("Sending message to chat API:", userMessage);
  
  // Clear the input field
  chatInput.value = '';
  
  // Add user message to chat
  const userMessageElement = document.createElement('div');
  userMessageElement.className = 'chat-message user-message';
  userMessageElement.innerHTML = `
    <div class="message-content">
      <p>${formatMessage(userMessage)}</p>
    </div>
  `;
  chatMessages.appendChild(userMessageElement);
  
  // Add loading indicator for AI response
  const aiMessageElement = document.createElement('div');
  aiMessageElement.className = 'chat-message ai-message loading';
  aiMessageElement.innerHTML = `
    <div class="message-content">
      <p><span class="typing-indicator"><span>.</span><span>.</span><span>.</span></span></p>
    </div>
  `;
  chatMessages.appendChild(aiMessageElement);
  
  // Scroll to the bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Set waiting state
  isWaitingForResponse = true;
  
  // Add to chat history
  chatHistory.push({ role: 'user', content: userMessage });
  
  try {
    const payload = {
      message: userMessage,
      history: chatHistory.slice(-6) // Send last 6 messages for context
    };
    
    // Send the message to the PHP proxy
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Replace loading indicator with actual response
    aiMessageElement.className = 'chat-message ai-message';
    aiMessageElement.innerHTML = `
      <div class="message-content">
        <p>${formatMessage(data.response)}</p>
      </div>
    `;
    
    // Add to chat history
    chatHistory.push({ role: 'assistant', content: data.response });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // Replace loading indicator with error message
    aiMessageElement.className = 'chat-message ai-message error';
    aiMessageElement.innerHTML = `
      <div class="message-content">
        <p>I'm sorry, I encountered an error processing your request. Please try again later.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
    
  } finally {
    // Reset waiting state
    isWaitingForResponse = false;
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

/**
 * Format a message with line breaks and links
 * @param {string} message - The message to format
 * @returns {string} - Formatted HTML message
 */
function formatMessage(message) {
  return message
    .replace(/\n/g, '<br>') // Convert line breaks to <br>
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); // Convert URLs to links
}

// Export functions
export { initChat }; 