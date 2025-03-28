/**
 * Ratidzo Health AI - Header Logo Fix
 * This script adds the colorful Ratidzo logo header that's missing from the page
 */

(function() {
  // Wait for the document to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addRatizoHeader, 300); // Give the app a moment to render
  });

  function addRatizoHeader() {
    console.log('Ratidzo Header Fix: Adding logo header');
    
    // Check if we're on the homepage
    const isHomepage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' || 
                      !window.location.pathname.includes('/');
    
    // Check if header already exists to avoid duplicates
    if (document.querySelector('.ratidzo-header')) {
      console.log('Header already exists, skipping');
      return;
    }

    // Create the header element
    const header = document.createElement('header');
    header.className = 'ratidzo-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '1rem 2rem';
    header.style.backgroundColor = 'rgba(13, 18, 30, 0.7)';
    header.style.backdropFilter = 'blur(5px)';
    header.style.position = 'relative';
    header.style.zIndex = '100';
    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    
    // Create the logo container
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    logoContainer.style.display = 'flex';
    logoContainer.style.alignItems = 'center';
    
    // Create the logo icon (bicycle icon with green color)
    const logoIcon = document.createElement('div');
    logoIcon.className = 'logo-icon';
    logoIcon.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M7 9a2 2 0 0 0 -2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2"></path><path d="M17 9a2 2 0 0 0 -2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-2"></path><path d="M16 9v-4a1 1 0 0 0 -1 -1h-6a1 1 0 0 0 -1 1v4"></path></svg>';
    logoIcon.style.marginRight = '0.5rem';
    
    // Create the colorful Ratidzo text logo
    const logoText = document.createElement('div');
    logoText.className = 'logo-text';
    logoText.innerHTML = '<span style="color: #4ade80">R</span><span style="color: #fbbf24">A</span><span style="color: #f87171">T</span><span style="color: #60a5fa">I</span><span style="color: #fbbf24">D</span><span style="color: #f87171">Z</span><span style="color: #4ade80">O</span>';
    logoText.style.fontWeight = 'bold';
    logoText.style.fontSize = '1.75rem';
    logoText.style.letterSpacing = '1px';
    
    // Append logo parts to container
    logoContainer.appendChild(logoIcon);
    logoContainer.appendChild(logoText);
    
    // Create the action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions';
    actionsContainer.style.display = 'flex';
    actionsContainer.style.alignItems = 'center';
    actionsContainer.style.gap = '1rem';
    
    // Create "Get Started" button
    const getStartedBtn = document.createElement('button');
    getStartedBtn.className = 'get-started-btn';
    getStartedBtn.textContent = 'Get Started';
    getStartedBtn.style.backgroundColor = 'transparent';
    getStartedBtn.style.border = 'none';
    getStartedBtn.style.color = 'white';
    getStartedBtn.style.padding = '0.5rem 1rem';
    getStartedBtn.style.borderRadius = '0.25rem';
    getStartedBtn.style.cursor = 'pointer';
    getStartedBtn.style.fontSize = '0.875rem';
    
    // Create "Chat with Ratidzo" button
    const chatBtn = document.createElement('button');
    chatBtn.className = 'chat-btn';
    chatBtn.textContent = 'Chat with Ratidzo';
    chatBtn.style.backgroundColor = '#4ade80';
    chatBtn.style.border = 'none';
    chatBtn.style.color = 'white';
    chatBtn.style.padding = '0.5rem 1rem';
    chatBtn.style.borderRadius = '0.25rem';
    chatBtn.style.cursor = 'pointer';
    chatBtn.style.fontSize = '0.875rem';
    chatBtn.style.fontWeight = 'bold';
    chatBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Append buttons to actions container
    actionsContainer.appendChild(getStartedBtn);
    actionsContainer.appendChild(chatBtn);
    
    // Append logo and actions to header
    header.appendChild(logoContainer);
    header.appendChild(actionsContainer);
    
    // Add the header to the page
    const root = document.getElementById('root');
    if (root) {
      // Insert before the first child of root
      if (root.firstChild) {
        root.insertBefore(header, root.firstChild);
      } else {
        root.appendChild(header);
      }
      
      // Add event listeners to buttons
      getStartedBtn.addEventListener('click', function() {
        console.log('Get Started clicked');
        // Scroll to main content
        const mainContent = document.querySelector('main') || document.querySelector('section:first-of-type');
        if (mainContent) {
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      chatBtn.addEventListener('click', function() {
        console.log('Chat with Ratidzo clicked');
        // Find the chat button in the main content and click it
        const chatButtons = Array.from(document.querySelectorAll('button, a')).filter(btn => 
          btn.textContent.toLowerCase().includes('chat') && 
          btn.textContent.toLowerCase().includes('ratidzo')
        );
        
        if (chatButtons.length > 0) {
          chatButtons[0].click();
        }
      });
    } else {
      console.error('Root element not found');
    }
  }
})(); 