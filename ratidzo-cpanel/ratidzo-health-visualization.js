/**
 * Ratidzo Health AI - Health Visualization Component
 * This script adds an animated health metrics visualization to the hero section
 */

(function() {
  // Wait for the document to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addHealthVisualization, 500); // Give the app a moment to render
  });

  function addHealthVisualization() {
    console.log('Ratidzo Health Visualization: Adding health metrics visualization');
    
    // Check if we're on the homepage
    const isHomepage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' || 
                      !window.location.pathname.includes('/');
    
    if (!isHomepage) {
      console.log('Not on homepage, skipping visualization');
      return;
    }

    // Find the hero section or main content area
    const heroSection = document.querySelector('[id*="hero"], [class*="hero"]') || 
                       document.querySelector('section:first-of-type') ||
                       document.querySelector('main') || 
                       document.getElementById('root');
    
    if (!heroSection) {
      console.log('Hero section not found, cannot add visualization');
      return;
    }

    // Check if there's already a visualization component
    if (document.querySelector('.health-metrics-visualization')) {
      console.log('Health visualization already exists, skipping');
      return;
    }

    // Create the visualization component
    const visualizationComponent = createVisualizationComponent();
    
    // Find the right place to insert the visualization
    const heroContent = heroSection.querySelector('div');
    if (heroContent) {
      // If the hero has a container div, add the visualization as a sibling
      heroContent.parentNode.insertBefore(visualizationComponent, heroContent.nextSibling);
      
      // Make the hero section a flex container for desktop layout
      const mediaQuery = window.matchMedia('(min-width: 768px)');
      if (mediaQuery.matches) {
        heroSection.style.display = 'flex';
        heroSection.style.alignItems = 'center';
        heroSection.style.gap = '2rem';
        
        // Style the content and visualization for desktop
        heroContent.style.flex = '1';
        visualizationComponent.style.flex = '1';
      }
    } else {
      // If no container found, just append to the hero section
      heroSection.appendChild(visualizationComponent);
    }
    
    // Start the animations
    startAnimations();
  }

  function createVisualizationComponent() {
    // Create the main container
    const container = document.createElement('div');
    container.className = 'health-metrics-visualization';
    container.style.backgroundColor = 'rgba(26, 32, 44, 0.7)';
    container.style.backdropFilter = 'blur(10px)';
    container.style.borderRadius = '16px';
    container.style.padding = '24px';
    container.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
    container.style.maxWidth = '450px';
    container.style.margin = '0 auto';
    container.style.marginTop = '2rem';
    container.style.marginBottom = '2rem';
    
    // Add heartbeat line visualization
    const healthVisualization = document.createElement('div');
    healthVisualization.className = 'health-visualization';
    healthVisualization.style.display = 'flex';
    healthVisualization.style.justifyContent = 'space-between';
    healthVisualization.style.marginBottom = '24px';
    
    // Heart Health
    const heartHealth = document.createElement('div');
    heartHealth.className = 'health-category';
    heartHealth.style.textAlign = 'center';
    heartHealth.style.display = 'flex';
    heartHealth.style.flexDirection = 'column';
    heartHealth.style.alignItems = 'center';
    
    const heartIcon = document.createElement('div');
    heartIcon.className = 'health-icon';
    heartIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    heartIcon.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
    heartIcon.style.borderRadius = '50%';
    heartIcon.style.width = '48px';
    heartIcon.style.height = '48px';
    heartIcon.style.display = 'flex';
    heartIcon.style.alignItems = 'center';
    heartIcon.style.justifyContent = 'center';
    heartIcon.style.marginBottom = '8px';
    
    const heartText = document.createElement('span');
    heartText.textContent = 'Heart Health';
    heartText.style.fontSize = '12px';
    heartText.style.color = '#a0aec0';
    
    heartHealth.appendChild(heartIcon);
    heartHealth.appendChild(heartText);
    
    // Vital Signs
    const vitalSigns = document.createElement('div');
    vitalSigns.className = 'health-category';
    vitalSigns.style.textAlign = 'center';
    vitalSigns.style.display = 'flex';
    vitalSigns.style.flexDirection = 'column';
    vitalSigns.style.alignItems = 'center';
    
    const vitalIcon = document.createElement('div');
    vitalIcon.className = 'health-icon';
    vitalIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>';
    vitalIcon.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
    vitalIcon.style.borderRadius = '50%';
    vitalIcon.style.width = '48px';
    vitalIcon.style.height = '48px';
    vitalIcon.style.display = 'flex';
    vitalIcon.style.alignItems = 'center';
    vitalIcon.style.justifyContent = 'center';
    vitalIcon.style.marginBottom = '8px';
    
    const vitalText = document.createElement('span');
    vitalText.textContent = 'Vital Signs';
    vitalText.style.fontSize = '12px';
    vitalText.style.color = '#a0aec0';
    
    vitalSigns.appendChild(vitalIcon);
    vitalSigns.appendChild(vitalText);
    
    // Diagnostics
    const diagnostics = document.createElement('div');
    diagnostics.className = 'health-category';
    diagnostics.style.textAlign = 'center';
    diagnostics.style.display = 'flex';
    diagnostics.style.flexDirection = 'column';
    diagnostics.style.alignItems = 'center';
    
    const diagIcon = document.createElement('div');
    diagIcon.className = 'health-icon';
    diagIcon.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>';
    diagIcon.style.backgroundColor = 'rgba(74, 222, 128, 0.1)';
    diagIcon.style.borderRadius = '50%';
    diagIcon.style.width = '48px';
    diagIcon.style.height = '48px';
    diagIcon.style.display = 'flex';
    diagIcon.style.alignItems = 'center';
    diagIcon.style.justifyContent = 'center';
    diagIcon.style.marginBottom = '8px';
    
    const diagText = document.createElement('span');
    diagText.textContent = 'Diagnostics';
    diagText.style.fontSize = '12px';
    diagText.style.color = '#a0aec0';
    
    diagnostics.appendChild(diagIcon);
    diagnostics.appendChild(diagText);
    
    // Add the categories to the visualization
    healthVisualization.appendChild(heartHealth);
    healthVisualization.appendChild(vitalSigns);
    healthVisualization.appendChild(diagnostics);
    
    // Add the "Powered by Advanced AI" badge
    const aiPoweredBadge = document.createElement('div');
    aiPoweredBadge.className = 'ai-powered-badge';
    aiPoweredBadge.textContent = 'Powered by Advanced AI';
    aiPoweredBadge.style.textAlign = 'center';
    aiPoweredBadge.style.fontSize = '14px';
    aiPoweredBadge.style.fontWeight = 'bold';
    aiPoweredBadge.style.background = 'linear-gradient(90deg, #4ade80 0%, #f59e0b 100%)';
    aiPoweredBadge.style.borderRadius = '20px';
    aiPoweredBadge.style.padding = '8px 16px';
    aiPoweredBadge.style.display = 'inline-block';
    aiPoweredBadge.style.margin = '0 auto 24px auto';
    aiPoweredBadge.style.color = 'white';
    
    // Create the badge container to center it
    const badgeContainer = document.createElement('div');
    badgeContainer.style.textAlign = 'center';
    badgeContainer.appendChild(aiPoweredBadge);
    
    // Add Symptom Analysis section
    const symptomAnalysis = document.createElement('div');
    symptomAnalysis.className = 'symptom-analysis';
    symptomAnalysis.style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
    symptomAnalysis.style.borderRadius = '8px';
    symptomAnalysis.style.padding = '16px';
    
    const analysisTitle = document.createElement('h3');
    analysisTitle.textContent = 'Symptom Analysis';
    analysisTitle.style.fontSize = '16px';
    analysisTitle.style.fontWeight = 'bold';
    analysisTitle.style.marginBottom = '16px';
    
    symptomAnalysis.appendChild(analysisTitle);
    
    // Add symptom progress bars
    const symptoms = [
      { name: 'Headache', percentage: 85 },
      { name: 'Fatigue', percentage: 65 },
      { name: 'Fever', percentage: 40 }
    ];
    
    symptoms.forEach(symptom => {
      const symptomRow = document.createElement('div');
      symptomRow.style.display = 'flex';
      symptomRow.style.alignItems = 'center';
      symptomRow.style.marginBottom = '12px';
      
      const symptomName = document.createElement('div');
      symptomName.textContent = symptom.name;
      symptomName.style.width = '80px';
      symptomName.style.fontSize = '14px';
      
      const progressContainer = document.createElement('div');
      progressContainer.style.flex = '1';
      progressContainer.style.height = '8px';
      progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      progressContainer.style.borderRadius = '4px';
      progressContainer.style.overflow = 'hidden';
      progressContainer.style.position = 'relative';
      
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.style.width = '0%'; // Start at 0 for animation
      progressBar.style.height = '100%';
      progressBar.style.background = symptom.percentage > 70 
        ? 'linear-gradient(90deg, #4ade80, #fbbf24)' 
        : symptom.percentage > 50 
          ? 'linear-gradient(90deg, #fbbf24, #f97316)'
          : 'linear-gradient(90deg, #f97316, #ef4444)';
      progressBar.style.borderRadius = '4px';
      progressBar.style.transition = 'width 1.5s ease-in-out';
      progressBar.dataset.target = `${symptom.percentage}%`;
      
      const percentageLabel = document.createElement('div');
      percentageLabel.textContent = `${symptom.percentage}%`;
      percentageLabel.style.marginLeft = '10px';
      percentageLabel.style.fontSize = '14px';
      percentageLabel.style.color = '#a0aec0';
      
      progressContainer.appendChild(progressBar);
      
      symptomRow.appendChild(symptomName);
      symptomRow.appendChild(progressContainer);
      symptomRow.appendChild(percentageLabel);
      
      symptomAnalysis.appendChild(symptomRow);
    });
    
    // Add ECG line at the top
    const ecgContainer = document.createElement('div');
    ecgContainer.className = 'ecg-container';
    ecgContainer.style.height = '80px';
    ecgContainer.style.position = 'relative';
    ecgContainer.style.marginBottom = '20px';
    
    const ecgLine = document.createElement('div');
    ecgLine.className = 'ecg-line';
    ecgLine.style.position = 'absolute';
    ecgLine.style.top = '0';
    ecgLine.style.left = '0';
    ecgLine.style.width = '100%';
    ecgLine.style.height = '100%';
    ecgLine.style.overflow = 'hidden';
    
    // Create SVG for the ECG line
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 1000 200");
    svg.setAttribute("preserveAspectRatio", "none");
    
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("stroke", "#4ade80");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("d", "M0,100 Q50,100 100,100 T200,100 T300,100 T400,60 T450,60 T460,20 T470,180 T480,100 T500,100 T600,100 T700,100 T800,100 T900,100 T1000,100");
    
    svg.appendChild(path);
    ecgLine.appendChild(svg);
    ecgContainer.appendChild(ecgLine);
    
    // Assemble all components
    container.appendChild(ecgContainer);
    container.appendChild(healthVisualization);
    container.appendChild(badgeContainer);
    container.appendChild(symptomAnalysis);
    
    return container;
  }

  function startAnimations() {
    // Animate the progress bars
    setTimeout(() => {
      const progressBars = document.querySelectorAll('.progress-bar');
      progressBars.forEach(bar => {
        bar.style.width = bar.dataset.target;
      });
    }, 300);
    
    // Animate the ECG line
    animateEcgLine();
  }
  
  function animateEcgLine() {
    const svg = document.querySelector('.ecg-line svg');
    if (!svg) return;
    
    const path = svg.querySelector('path');
    if (!path) return;
    
    // Define keyframes for the heartbeat animation
    const keyframes = [
      "M0,100 Q50,100 100,100 T200,100 T300,100 T400,60 T450,60 T460,20 T470,180 T480,100 T500,100 T600,100 T700,100 T800,100 T900,100 T1000,100",
      "M0,100 Q50,100 100,100 T200,100 T300,100 T400,100 T450,100 T460,100 T470,100 T480,100 T500,100 T600,60 T650,60 T660,20 T670,180 T680,100 T700,100 T800,100 T900,100",
      "M0,100 Q50,100 100,100 T200,100 T300,100 T400,100 T450,100 T460,100 T470,100 T480,100 T500,100 T600,100 T700,100 T800,60 T850,60 T860,20 T870,180 T880,100 T900,100"
    ];
    
    let currentFrame = 0;
    
    setInterval(() => {
      path.setAttribute("d", keyframes[currentFrame]);
      currentFrame = (currentFrame + 1) % keyframes.length;
    }, 1000);
  }
})(); 