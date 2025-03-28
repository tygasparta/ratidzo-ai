/**
 * Ratidzo Health AI - Homepage Element Fix
 * This script ensures all homepage elements are properly displayed
 */

(function() {
  // Wait for the document to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(enhanceHomepage, 500); // Give the app a moment to render
  });

  function enhanceHomepage() {
    console.log('Ratidzo Homepage Fix: Checking for missing elements');
    
    // Check if we're on the homepage
    const isHomepage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' || 
                      !window.location.pathname.includes('/');
    
    if (!isHomepage) {
      console.log('Not on homepage, skipping enhancement');
      return;
    }

    // Add any missing sections
    ensureHeroSection();
    ensureFeaturesSection();
    ensureTestimonialSection();
    fixMobileLayout();
    
    // Make the logo clickable (returns to homepage)
    enhanceLogo();
  }

  function ensureHeroSection() {
    const heroSection = document.querySelector('[id*="hero"], [class*="hero"]');
    
    if (!heroSection) {
      console.log('Hero section not found, checking for alternative containers');
      const mainContent = document.querySelector('main') || document.getElementById('root');
      
      // If there's still content to work with, make sure the hero elements are visible
      if (mainContent) {
        // Make sure hero content is visible
        const heading = mainContent.querySelector('h1, [class*="title"], [class*="heading"]');
        if (heading) {
          heading.style.display = 'block';
          heading.style.visibility = 'visible';
          heading.style.opacity = '1';
        }
        
        // Ensure subtitle is visible
        const subtitle = mainContent.querySelector('h2, [class*="subtitle"]');
        if (subtitle) {
          subtitle.style.display = 'block';
          subtitle.style.visibility = 'visible';
          subtitle.style.opacity = '1';
        }
        
        // Ensure hero image is visible
        const image = mainContent.querySelector('img');
        if (image) {
          image.style.display = 'block';
          image.style.maxWidth = '100%';
          image.style.height = 'auto';
          image.style.visibility = 'visible';
          image.style.opacity = '1';
        }
      }
    } else {
      console.log('Hero section found, ensuring visibility');
      heroSection.style.display = 'flex';
      heroSection.style.visibility = 'visible';
      heroSection.style.opacity = '1';
    }
  }

  function ensureFeaturesSection() {
    // Check if features section exists
    const featuresSection = document.querySelector('[id*="features"], [class*="features"]');
    
    if (!featuresSection) {
      console.log('Features section not found, checking for content that needs to be shown');
      
      // Look for any hidden sections and make them visible
      const hiddenSections = Array.from(document.querySelectorAll('section, [class*="section"]')).filter(
        section => {
          const style = window.getComputedStyle(section);
          return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
        }
      );
      
      hiddenSections.forEach(section => {
        section.style.display = 'block';
        section.style.visibility = 'visible';
        section.style.opacity = '1';
      });
    } else {
      console.log('Features section found, ensuring visibility');
      featuresSection.style.display = 'block';
      featuresSection.style.visibility = 'visible';
      featuresSection.style.opacity = '1';
    }
  }

  function ensureTestimonialSection() {
    // Check if testimonial section exists
    const testimonialSection = document.querySelector('[id*="testimonial"], [class*="testimonial"]');
    
    if (!testimonialSection) {
      console.log('Testimonial section not found, not critical for functionality');
    } else {
      console.log('Testimonial section found, ensuring visibility');
      testimonialSection.style.display = 'block';
      testimonialSection.style.visibility = 'visible';
      testimonialSection.style.opacity = '1';
    }
  }
  
  function fixMobileLayout() {
    // Fix any mobile layout issues - ensure main content is visible and properly sized
    const mainContent = document.querySelector('main') || document.getElementById('root');
    if (mainContent) {
      // Ensure main content takes up appropriate space
      mainContent.style.minHeight = '100vh';
      mainContent.style.width = '100%';
      mainContent.style.overflow = 'auto';
      
      // Ensure buttons are visible and properly styled
      const buttons = mainContent.querySelectorAll('button, a[class*="button"], [role="button"]');
      buttons.forEach(button => {
        button.style.display = 'inline-block';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        
        // Ensure buttons have sufficient contrast
        const style = window.getComputedStyle(button);
        if (style.backgroundColor === 'transparent' || style.backgroundColor === 'rgba(0, 0, 0, 0)') {
          if (button.textContent.toLowerCase().includes('check') || 
              button.textContent.toLowerCase().includes('symptom')) {
            button.style.backgroundColor = '#16a34a'; // Green for primary action
            button.style.color = 'white';
          } else if (button.textContent.toLowerCase().includes('chat')) {
            button.style.borderColor = '#16a34a';
            button.style.color = '#16a34a';
          }
        }
      });
      
      // Fix any spacing issues in the hero section
      const heroContent = mainContent.querySelector('[class*="hero"], [id*="hero"]') || 
                         mainContent.querySelector('section:first-of-type');
      if (heroContent) {
        const contentElements = heroContent.children;
        for (let i = 0; i < contentElements.length; i++) {
          contentElements[i].style.marginBottom = '1rem';
        }
      }
    }
    
    // Fix navigation elements if needed
    const nav = document.querySelector('nav, header, [class*="header"], [class*="navbar"]');
    if (nav) {
      nav.style.display = 'flex';
      nav.style.visibility = 'visible';
      nav.style.opacity = '1';
      nav.style.padding = '1rem';
      nav.style.alignItems = 'center';
      nav.style.justifyContent = 'space-between';
    }
  }
  
  function enhanceLogo() {
    // Find the logo element and make it a clickable link to the homepage
    const logo = document.querySelector('[class*="logo"], [id*="logo"]');
    if (logo && !logo.closest('a')) {
      // Wrap the logo in an anchor tag if it's not already wrapped
      const logoLink = document.createElement('a');
      logoLink.href = '/';
      logoLink.style.textDecoration = 'none';
      logoLink.style.color = 'inherit';
      logoLink.title = 'Return to Homepage';
      
      // Replace the logo with the linked version
      logo.parentNode.insertBefore(logoLink, logo);
      logoLink.appendChild(logo);
    }
  }
})(); 