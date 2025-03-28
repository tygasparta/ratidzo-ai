/**
 * Ratidzo Health AI - Enhanced Background Effects
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(applyBackgroundEffects, 800);
  });

  function applyBackgroundEffects() {
    // Avoid duplicates
    if (document.querySelector('.ratidzo-bg-effects')) return;

    // Main container
    const effectsContainer = document.createElement('div');
    effectsContainer.className = 'ratidzo-bg-effects';
    effectsContainer.style.position = 'fixed';
    effectsContainer.style.top = '0';
    effectsContainer.style.left = '0';
    effectsContainer.style.width = '100%';
    effectsContainer.style.height = '100%';
    effectsContainer.style.zIndex = '-1';
    effectsContainer.style.pointerEvents = 'none';
    document.body.appendChild(effectsContainer);

    // Add subtle grid pattern
    const gridPattern = document.createElement('div');
    gridPattern.style.position = 'absolute';
    gridPattern.style.top = '0';
    gridPattern.style.left = '0';
    gridPattern.style.width = '100%';
    gridPattern.style.height = '100%';
    gridPattern.style.backgroundImage = 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)';
    gridPattern.style.backgroundSize = '40px 40px';
    effectsContainer.appendChild(gridPattern);

    // Add glowing orbs
    addGlowingOrbs(effectsContainer);

    // Add animations
    const animations = document.createElement('style');
    animations.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(10px, 10px) rotate(5deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      
      .glow-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.15;
        animation: float 20s infinite ease-in-out;
      }
    `;
    document.head.appendChild(animations);
  }

  function addGlowingOrbs(container) {
    // Define orbs with different positions and colors
    const orbs = [
      { color: '#16a34a', size: '300px', top: '10%', left: '5%', delay: '0s' },
      { color: '#eab308', size: '250px', top: '60%', left: '70%', delay: '5s' },
      { color: '#0284c7', size: '200px', top: '80%', left: '30%', delay: '10s' }
    ];

    // Create each orb
    orbs.forEach((orb, index) => {
      const orbElement = document.createElement('div');
      orbElement.className = 'glow-orb';
      orbElement.style.width = orb.size;
      orbElement.style.height = orb.size;
      orbElement.style.top = orb.top;
      orbElement.style.left = orb.left;
      orbElement.style.backgroundColor = orb.color;
      orbElement.style.animationDelay = orb.delay;
      container.appendChild(orbElement);
    });
  }
})(); 