/**
 * Ratidzo Health AI - Features Section
 * This script creates a beautiful features section for the homepage
 */

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(createFeaturesSection, 800);
  });

  function createFeaturesSection() {
    console.log('Creating Ratidzo features section');

    // First check if the features section already exists
    if (document.querySelector('.ratidzo-features')) {
      console.log('Features section already exists');
      return;
    }

    // Find where to insert the features section (after hero section)
    const heroSection = document.querySelector('section:first-of-type') || 
                       document.querySelector('[class*="hero"]');

    if (!heroSection) {
      console.log('Hero section not found, cannot add features section');
      return;
    }

    // Create features section
    const featuresSection = document.createElement('section');
    featuresSection.className = 'ratidzo-features';
    featuresSection.style.padding = '6rem 1rem';
    featuresSection.style.backgroundColor = 'rgba(17, 24, 39, 0.3)';
    featuresSection.style.position = 'relative';
    featuresSection.style.overflow = 'hidden';

    // Add background decorations
    const bgDecoration1 = document.createElement('div');
    bgDecoration1.style.position = 'absolute';
    bgDecoration1.style.top = '-100px';
    bgDecoration1.style.right = '-100px';
    bgDecoration1.style.width = '300px';
    bgDecoration1.style.height = '300px';
    bgDecoration1.style.borderRadius = '50%';
    bgDecoration1.style.background = 'radial-gradient(circle, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0) 70%)';
    bgDecoration1.style.zIndex = '0';
    featuresSection.appendChild(bgDecoration1);

    const bgDecoration2 = document.createElement('div');
    bgDecoration2.style.position = 'absolute';
    bgDecoration2.style.bottom = '-100px';
    bgDecoration2.style.left = '-100px';
    bgDecoration2.style.width = '300px';
    bgDecoration2.style.height = '300px';
    bgDecoration2.style.borderRadius = '50%';
    bgDecoration2.style.background = 'radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0) 70%)';
    bgDecoration2.style.zIndex = '0';
    featuresSection.appendChild(bgDecoration2);

    // Create container
    const container = document.createElement('div');
    container.style.maxWidth = '1200px';
    container.style.margin = '0 auto';
    container.style.position = 'relative';
    container.style.zIndex = '10';
    featuresSection.appendChild(container);

    // Add section heading
    const heading = document.createElement('h2');
    heading.textContent = 'Why Choose Ratidzo Health AI';
    heading.style.fontSize = '2rem';
    heading.style.textAlign = 'center';
    heading.style.marginBottom = '3rem';
    heading.style.background = 'linear-gradient(90deg, #16a34a, #eab308)';
    heading.style.webkitBackgroundClip = 'text';
    heading.style.backgroundClip = 'text';
    heading.style.webkitTextFillColor = 'transparent';
    heading.style.display = 'inline-block';
    heading.style.width = '100%';
    container.appendChild(heading);

    // Add subheading
    const subheading = document.createElement('p');
    subheading.textContent = 'Providing accessible healthcare insights to all Zimbabweans through AI technology';
    subheading.style.textAlign = 'center';
    subheading.style.maxWidth = '700px';
    subheading.style.margin = '-2rem auto 3rem';
    subheading.style.color = '#a0aec0';
    subheading.style.fontSize = '1.1rem';
    container.appendChild(subheading);

    // Features grid
    const featuresGrid = document.createElement('div');
    featuresGrid.style.display = 'grid';
    featuresGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    featuresGrid.style.gap = '2rem';
    container.appendChild(featuresGrid);

    // Feature card data
    const features = [
      {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5V6h14v13z" fill="#16a34a"/><path d="M6 9h12v2H6zm0 4h12v2H6z" fill="#16a34a"/></svg>',
        title: 'Symptom Analysis',
        description: 'Describe your symptoms in simple terms and our AI will analyze them to provide potential conditions, severity assessment, and recommended actions.'
      },
      {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#eab308"/></svg>',
        title: 'Traditional Remedies',
        description: 'Access a comprehensive database of traditional Zimbabwean remedies and treatments that have been used for generations in local communities.'
      },
      {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#16a34a"/></svg>',
        title: 'Nearby Clinics',
        description: 'Find healthcare facilities near you, including clinics, hospitals, and pharmacies, with directions and operational hours information.'
      },
      {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="#eab308"/></svg>',
        title: 'Privacy Focused',
        description: 'Your health data remains private and secure. We do not store your personal health information or share it with third parties.'
      },
      {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="#16a34a"/></svg>',
        title: 'Works Offline',
        description: 'Access basic health information even when not connected to the internet, ensuring health guidance is always available.'
      },
      {
        icon: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" fill="#eab308"/></svg>',
        title: 'AI Health Chat',
        description: 'Chat with our AI assistant in natural language about any health concerns and receive instant guidance and information.'
      }
    ];

    // Create feature cards
    features.forEach(feature => {
      const card = document.createElement('div');
      card.className = 'feature-card';
      card.style.background = 'rgba(26, 32, 44, 0.4)';
      card.style.backdropFilter = 'blur(8px)';
      card.style.webkitBackdropFilter = 'blur(8px)';
      card.style.borderRadius = '12px';
      card.style.padding = '2rem';
      card.style.transition = 'all 0.3s ease';
      card.style.border = '1px solid rgba(55, 65, 81, 0.3)';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      
      // Add hover effect
      card.onmouseover = function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        this.style.borderColor = 'rgba(55, 65, 81, 0.6)';
      };
      card.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
        this.style.borderColor = 'rgba(55, 65, 81, 0.3)';
      };

      // Icon
      const iconDiv = document.createElement('div');
      iconDiv.className = 'feature-icon';
      iconDiv.style.marginBottom = '1.5rem';
      iconDiv.innerHTML = feature.icon;
      card.appendChild(iconDiv);

      // Title
      const titleDiv = document.createElement('h3');
      titleDiv.textContent = feature.title;
      titleDiv.style.fontSize = '1.25rem';
      titleDiv.style.fontWeight = '600';
      titleDiv.style.marginBottom = '1rem';
      titleDiv.style.color = 'white';
      card.appendChild(titleDiv);

      // Description
      const descDiv = document.createElement('p');
      descDiv.textContent = feature.description;
      descDiv.style.fontSize = '1rem';
      descDiv.style.color = '#a0aec0';
      descDiv.style.lineHeight = '1.5';
      card.appendChild(descDiv);

      // Decorative circle
      const circle = document.createElement('div');
      circle.style.position = 'absolute';
      circle.style.bottom = '-20px';
      circle.style.right = '-20px';
      circle.style.width = '100px';
      circle.style.height = '100px';
      circle.style.borderRadius = '50%';
      circle.style.background = 'linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(234, 179, 8, 0.1) 100%)';
      circle.style.zIndex = '0';
      card.appendChild(circle);

      // Add to grid
      featuresGrid.appendChild(card);
    });

    // Add the CTA section below features
    const ctaSection = document.createElement('div');
    ctaSection.className = 'cta-section';
    ctaSection.style.textAlign = 'center';
    ctaSection.style.marginTop = '4rem';
    ctaSection.style.padding = '3rem';
    ctaSection.style.backgroundColor = 'rgba(26, 32, 44, 0.4)';
    ctaSection.style.borderRadius = '16px';
    ctaSection.style.border = '1px solid rgba(55, 65, 81, 0.3)';
    container.appendChild(ctaSection);

    // CTA heading
    const ctaHeading = document.createElement('h3');
    ctaHeading.textContent = 'Ready to experience better health insights?';
    ctaHeading.style.fontSize = '1.5rem';
    ctaHeading.style.marginBottom = '1.5rem';
    ctaHeading.style.color = 'white';
    ctaSection.appendChild(ctaHeading);

    // CTA text
    const ctaText = document.createElement('p');
    ctaText.textContent = 'Start your journey to better health understanding with Ratidzo Health AI';
    ctaText.style.fontSize = '1rem';
    ctaText.style.color = '#a0aec0';
    ctaText.style.marginBottom = '2rem';
    ctaText.style.maxWidth = '600px';
    ctaText.style.margin = '0 auto 2rem';
    ctaSection.appendChild(ctaText);

    // CTA button
    const ctaButton = document.createElement('button');
    ctaButton.textContent = 'Get Started Now';
    ctaButton.style.padding = '0.75rem 2rem';
    ctaButton.style.borderRadius = '9999px';
    ctaButton.style.background = 'linear-gradient(90deg, #16a34a, #eab308)';
    ctaButton.style.color = 'white';
    ctaButton.style.fontWeight = '500';
    ctaButton.style.border = 'none';
    ctaButton.style.cursor = 'pointer';
    ctaButton.style.transition = 'all 0.3s ease';
    ctaButton.style.fontSize = '1rem';
    ctaButton.onmouseover = function() {
      this.style.transform = 'translateY(-3px)';
      this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    };
    ctaButton.onmouseout = function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    };
    ctaSection.appendChild(ctaButton);

    // Insert features section after hero section
    if (heroSection.nextSibling) {
      heroSection.parentNode.insertBefore(featuresSection, heroSection.nextSibling);
    } else {
      heroSection.parentNode.appendChild(featuresSection);
    }

    // Add animations for features section
    const featuresAnimation = document.createElement('style');
    featuresAnimation.textContent = `
      .ratidzo-features {
        animation: fadeIn 1s ease-out forwards;
      }
      
      .feature-card {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.5s ease-out forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(featuresAnimation);
    
    // Apply staggered animations to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
      card.style.animationDelay = `${0.1 + index * 0.1}s`;
    });

    console.log('Features section created successfully');
  }
})(); 