/**
 * Chat functionality fix script
 * This script ensures the chat button works correctly
 */

(function() {
  // Run immediately when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat fix script loaded');
    
    // Find the chat button
    const chatButton = document.getElementById('health-chat-button');
    if (!chatButton) {
      console.error('Chat button not found');
      return;
    }
    
    console.log('Found chat button, removing all event listeners');
    
    // Create a new button to replace the old one (this removes all event listeners)
    const newButton = chatButton.cloneNode(true);
    chatButton.parentNode.replaceChild(newButton, chatButton);
    
    // Define our chat toggle function
    function toggleChat() {
      console.log('Chat toggle clicked');
      
      // Find the chat container
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer) {
        console.error('Chat container not found, might need to create it');
        return;
      }
      
      console.log('Toggling chat container visibility');
      
      // Toggle chat visibility
      if (chatContainer.style.display === 'none' || !chatContainer.style.display) {
        chatContainer.style.display = 'flex';
        setTimeout(() => {
          chatContainer.classList.add('chat-open');
        }, 10);
      } else {
        chatContainer.classList.remove('chat-open');
        setTimeout(() => {
          chatContainer.style.display = 'none';
        }, 300);
      }
    }
    
    // Add our click handler to the new button
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Chat button clicked');
      
      // Try to create chat interface if it doesn't exist
      if (!document.getElementById('chat-container')) {
        console.log('Creating chat interface');
        
        // Import and initialize chat module
        import('./chat.js')
          .then(chatModule => {
            console.log('Chat module loaded successfully');
            chatModule.initChat();
            
            // Now we can toggle the chat
            toggleChat();
          })
          .catch(error => {
            console.error('Failed to load chat module:', error);
            alert('Chat feature is currently unavailable. Please try again later.');
          });
      } else {
        // Chat interface already exists, just toggle it
        toggleChat();
      }
      
      return false;
    });
    
    console.log('Chat button event listener added successfully');
  });
})(); 