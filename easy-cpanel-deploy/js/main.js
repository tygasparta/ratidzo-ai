/**
 * Ratidzo Health AI - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations
  initAnimations();
  
  // Initialize progress bars
  initProgressBars();
  
  // Setup diagnosis form
  setupDiagnosisForm();
  
  // Setup medication toggle
  setupMedicationToggle();
  
  // Initialize scroll effects
  initScrollEffects();
  
  // Setup mobile menu
  setupMobileMenu();
  
  // Setup range slider
  setupRangeSlider();
  
  // Setup reset form button
  setupResetForm();
  
  // Setup PDF download
  setupPdfDownload();
  
  // Setup form section hover effects
  setupFormSectionEffects();
  
  // Setup enhanced form field animations
  setupFormFieldAnimations();
});

/**
 * Initialize animations with delay for each element
 */
function initAnimations() {
  // Add animation delay to stagger animations
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
  
  animatedElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.1}s`;
  });
}

/**
 * Initialize progress bars with animated width
 */
function initProgressBars() {
  const progressBars = document.querySelectorAll('.progress-bar');
  
  // Set a small delay before starting the animation
  setTimeout(() => {
    progressBars.forEach(bar => {
      // Get width from the percentage text or data attribute
      const percentage = bar.parentElement.nextElementSibling.textContent.replace('%', '');
      bar.style.width = `${percentage}%`;
    });
  }, 500);
}

/**
 * Setup the diagnosis form functionality
 */
function setupDiagnosisForm() {
  const diagnosisForm = document.getElementById('diagnosis-form');
  const diagnosisResult = document.getElementById('diagnosis-result');
  
  if (!diagnosisForm) return;
  
  diagnosisForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const symptoms = document.getElementById('symptoms').value;
    const duration = document.getElementById('duration').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const severity = document.getElementById('severity').value;
    const weight = document.getElementById('weight').value;
    const weightUnit = document.getElementById('weight-unit').value;
    
    // Get checked symptoms
    const checkedSymptoms = [];
    document.querySelectorAll('input[name="symptoms[]"]:checked').forEach(checkbox => {
      checkedSymptoms.push(checkbox.value);
    });
    
    // Get checked conditions
    const existingConditions = [];
    document.querySelectorAll('input[name="conditions[]"]:checked').forEach(checkbox => {
      existingConditions.push(checkbox.value);
    });
    
    // Get other conditions
    const otherConditions = document.getElementById('other-conditions').value;
    
    // Get medication information
    const hasTakenMedication = document.querySelector('input[name="medication"]:checked')?.value === 'yes';
    const medicationDetails = hasTakenMedication ? document.getElementById('medication-details').value : '';
    
    // Validate form
    if (!symptoms.trim() && checkedSymptoms.length === 0) {
      showFormError('Please describe your symptoms or select from the list');
      return;
    }
    
    // Show loading state
    showLoading();
    
    // Prepare a well-structured health diagnosis prompt for the AI API
    const prompt = constructDiagnosisPrompt({
      age,
      gender,
      weight: weight ? `${weight} ${weightUnit}` : 'Not provided',
      symptoms,
      checkedSymptoms,
      duration,
      severity,
      existingConditions,
      otherConditions,
      hasTakenMedication,
      medicationDetails
    });
    
    console.log("AI Diagnosis Prompt:", prompt);
    
    // In a production environment, this would be an API call to the AI service
    // For now, we'll simulate the API call with a timeout
    setTimeout(() => {
      // This would be replaced with the actual API call in production
      sendToAIApi(prompt)
        .then(response => {
          // Process the AI response and display results
          processAIResponse(response);
          
          // Hide loading state
          hideLoading();
          
          // Show results
          diagnosisResult.style.display = 'block';
          
          // Scroll to results
          diagnosisResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(error => {
          console.error("API Error:", error);
          hideLoading();
          showFormError('There was an error processing your diagnosis. Please try again later.');
        });
    }, 2000);
  });
}

/**
 * Construct a comprehensive diagnosis prompt for the AI API
 */
function constructDiagnosisPrompt(formData) {
  // Format the selected symptoms
  const symptomsList = formData.checkedSymptoms.length > 0 
    ? `Selected symptoms: ${formData.checkedSymptoms.join(', ')}. ` 
    : '';
  
  // Format the existing conditions
  const conditionsList = formData.existingConditions.length > 0 
    ? `Existing conditions: ${formData.existingConditions.join(', ')}. ` 
    : '';
  
  // Format other conditions if provided
  const otherConditionsText = formData.otherConditions 
    ? `Other conditions: ${formData.otherConditions}. ` 
    : '';
  
  // Format medication information
  const medicationText = formData.hasTakenMedication 
    ? `Currently taking medications: ${formData.medicationDetails}. ` 
    : 'Not taking any medications. ';
  
  // Construct a comprehensive prompt for the AI
  return `Provide a medical analysis for a patient with the following information:
  
Patient Details:
- Age: ${formData.age || 'Not provided'}
- Gender: ${formData.gender || 'Not provided'}
- Weight: ${formData.weight ? formData.weight : 'Not provided'}

Symptoms Information:
- Patient description: ${formData.symptoms || 'None provided'}
- ${symptomsList}
- Duration of symptoms: ${formData.duration || 'Not specified'}
- Severity level (1-10): ${formData.severity || '5'}

Medical History:
- ${conditionsList}${otherConditionsText}
- ${medicationText}

Based on the information above, please provide:
1. Potential conditions with probability levels (High, Medium, or Low)
2. A brief description of each condition
3. Possible causes for each condition
4. Recommended actions for each condition
5. Risk factors associated with each condition

Include a disclaimer that this is not a medical diagnosis and the patient should consult with a healthcare professional.`;
}

/**
 * Send the diagnosis prompt to the AI API via PHP proxy
 */
async function sendToAIApi(prompt) {
  console.log("Sending diagnosis prompt to API:", prompt.substring(0, 100) + "...");
  
  try {
    // Show loading indicator
    showLoading();
    
    // Use our PHP proxy instead of the Node.js endpoint
    console.log("Making API request to PHP proxy...");
    
    const response = await fetch('/api-proxy-diagnose.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", errorText);
      throw new Error('Error processing diagnosis');
    }
    
    const data = await response.json();
    console.log("API response successful:", data);
    
    // Hide loading indicator
    hideLoading();
    
    return {
      success: true,
      diagnosisResults: data.diagnosisResults,
      aiPowered: data.aiPowered
    };
  } catch (error) {
    console.error("API Error:", error);
    
    // Hide loading indicator
    hideLoading();
    
    // Fallback to local diagnosis in case of network issues
    console.log("Using fallback diagnosis due to API error");
    
    // Parse information from the prompt to simulate AI analysis
    const promptLines = prompt.split('\n');
    
    // Extract age, gender, symptoms, etc.
    const ageMatch = prompt.match(/Age: (.*?)($|\n)/);
    const age = ageMatch ? ageMatch[1].trim() : 'Not provided';
    
    const genderMatch = prompt.match(/Gender: (.*?)($|\n)/);
    const gender = genderMatch ? genderMatch[1].trim() : 'Not provided';
    
    const symptomsMatch = prompt.match(/Patient description: (.*?)($|\n|Symptoms Information)/s);
    const symptoms = symptomsMatch ? symptomsMatch[1].trim() : '';
    console.log("Fallback - extracted symptoms:", symptoms);
    
    const selectedSymptomsMatch = prompt.match(/Selected symptoms: (.*?)\. ?($|\n)/);
    const selectedSymptoms = selectedSymptomsMatch 
      ? selectedSymptomsMatch[1].split(', ').map(s => s.trim()) 
      : [];
    console.log("Fallback - selected symptoms:", selectedSymptoms);
    
    const durationMatch = prompt.match(/Duration of symptoms: (.*?)($|\n)/);
    const duration = durationMatch ? durationMatch[1].trim() : '';
    
    const severityMatch = prompt.match(/Severity level \(1-10\): (.*?)($|\n)/);
    const severity = severityMatch ? severityMatch[1].trim() : '5';
    
    const existingConditionsMatch = prompt.match(/Existing conditions: (.*?)\. ?($|\n)/);
    const existingConditions = existingConditionsMatch 
      ? existingConditionsMatch[1].split(', ').map(c => c.trim())
      : [];
    
    // Now use this parsed information to generate the diagnosis
    // This simulates what the AI API would do
    const diagnosisResults = await simulateAIDiagnosis(
      symptoms, 
      duration, 
      age, 
      gender, 
      severity, 
      selectedSymptoms, 
      existingConditions
    );
    
    return {
      success: true,
      diagnosisResults,
      aiPowered: false,
      fallback: true,
      rawPrompt: prompt
    };
  }
}

/**
 * Process the AI API response and display results
 */
function processAIResponse(response) {
  if (!response || !response.success || !response.diagnosisResults) {
    showFormError('There was an error processing your diagnosis');
    return;
  }
  
  const conditionsList = document.querySelector('.conditions-list');
  const diagnosisResults = response.diagnosisResults;
  
  // Clear previous results
  conditionsList.innerHTML = '';
  
  // Show AI badge if AI-powered diagnosis was used
  const resultHeader = document.querySelector('.diagnosis-result h3');
  if (resultHeader && response.aiPowered) {
    resultHeader.innerHTML = `Your Health Analysis <span class="ai-badge">AI-Powered</span>`;
    
    // Add CSS for the AI badge if it doesn't exist
    if (!document.getElementById('ai-badge-style')) {
      const style = document.createElement('style');
      style.id = 'ai-badge-style';
      style.textContent = `
        .ai-badge {
          display: inline-block;
          background: linear-gradient(90deg, #4ade80 0%, #06b6d4 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          margin-left: 0.5rem;
          vertical-align: middle;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Store diagnosis data for PDF generation
  window.diagnosisData = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    userInfo: {
      age: document.getElementById('age').value || 'Not provided',
      gender: document.getElementById('gender').value || 'Not provided',
      symptoms: document.getElementById('symptoms').value,
      checkedSymptoms: [],
      duration: document.getElementById('duration').value || 'Not provided',
      severity: document.getElementById('severity').value || '5'
    },
    conditions: diagnosisResults,
    aiPowered: response.aiPowered
  };
  
  // Get checked symptoms for PDF
  document.querySelectorAll('input[name="symptoms[]"]:checked').forEach(checkbox => {
    window.diagnosisData.userInfo.checkedSymptoms.push(checkbox.value);
  });
  
  // Display each condition in the results
  diagnosisResults.forEach(condition => {
    const li = document.createElement('li');
    li.className = 'condition-item';
    
    const probabilityClass = condition.probability === 'High' 
      ? 'high-probability' 
      : condition.probability === 'Medium' 
        ? 'medium-probability' 
        : 'low-probability';
    
    let conditionHTML = `
      <div class="condition-header">
        <h4>${condition.name}</h4>
        <span class="probability ${probabilityClass}">${condition.probability}</span>
      </div>
      <p class="condition-description">${condition.description}</p>
    `;
    
    // Add possible causes
    if (condition.possibleCauses && condition.possibleCauses.length > 0) {
      conditionHTML += `
        <div class="condition-section">
          <h5>Possible Causes</h5>
          <ul class="condition-list">
            ${condition.possibleCauses.map(cause => `<li>${cause}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Add recommended actions
    if (condition.recommendedActions && condition.recommendedActions.length > 0) {
      conditionHTML += `
        <div class="condition-section">
          <h5>Recommended Actions</h5>
          <ul class="condition-list">
            ${condition.recommendedActions.map(action => `<li>${action}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Add risk factors
    if (condition.riskFactors && condition.riskFactors.length > 0) {
      conditionHTML += `
        <div class="condition-section">
          <h5>Risk Factors</h5>
          <ul class="condition-list">
            ${condition.riskFactors.map(factor => `<li>${factor}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    li.innerHTML = conditionHTML;
    conditionsList.appendChild(li);
  });
  
  // Add disclaimer about AI-powered diagnosis
  if (response.aiPowered) {
    const disclaimer = document.querySelector('.disclaimer') || document.createElement('div');
    disclaimer.className = 'disclaimer';
    disclaimer.innerHTML = `
      <p><strong>AI-Powered Diagnosis Disclaimer:</strong> This analysis was generated using artificial intelligence 
      and is not a substitute for professional medical advice. Always consult with a healthcare provider 
      for proper diagnosis and treatment.</p>
    `;
    
    // Add the disclaimer if it doesn't exist
    if (!document.querySelector('.disclaimer')) {
      const resultsContainer = document.getElementById('diagnosis-result');
      resultsContainer.appendChild(disclaimer);
    }
  }
}

/**
 * Show an error message on the form
 */
function showFormError(message) {
  // Create error element if it doesn't exist
  let errorElement = document.querySelector('.form-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(errorElement, formActions);
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide error after 3 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 3000);
}

/**
 * Show loading state on the form
 */
function showLoading() {
  const submitButton = document.querySelector('.form-actions button');
  submitButton.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
  submitButton.disabled = true;
}

/**
 * Hide loading state on the form
 */
function hideLoading() {
  const submitButton = document.querySelector('.form-actions button');
  submitButton.innerHTML = 'Analyze Symptoms';
  submitButton.disabled = false;
}

/**
 * Setup the medication toggle functionality
 */
function setupMedicationToggle() {
  const medicationYes = document.getElementById('medication-yes');
  const medicationNo = document.getElementById('medication-no');
  const medicationDetailsGroup = document.getElementById('medication-details-group');
  
  if (!medicationYes || !medicationNo || !medicationDetailsGroup) return;
  
  medicationYes.addEventListener('change', function() {
    if (this.checked) {
      medicationDetailsGroup.style.display = 'block';
    }
  });
  
  medicationNo.addEventListener('change', function() {
    if (this.checked) {
      medicationDetailsGroup.style.display = 'none';
    }
  });
}

/**
 * Initialize scroll effects
 */
function initScrollEffects() {
  // Add fade-in effect for elements when they scroll into view
  const elementsToAnimate = document.querySelectorAll('.feature-card, .section-header, .about-content');
  
  // Options for the IntersectionObserver
  const observerOptions = {
    root: null, // Use the viewport
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
  };
  
  // Create the observer
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target); // Stop observing once it's animated
      }
    });
  }, observerOptions);
  
  // Observe each element
  elementsToAnimate.forEach(element => {
    observer.observe(element);
  });
  
  // Sticky header effect
  const header = document.querySelector('.header');
  
  // Apply the sticky header effect immediately on load if needed
  if (window.scrollY > 20) {
    header.classList.add('header-scrolled');
  }
  
  // Throttle scroll events for better performance
  let lastScrollPosition = window.scrollY;
  let ticking = false;
  
  window.addEventListener('scroll', function() {
    lastScrollPosition = window.scrollY;
    
    if (!ticking) {
      window.requestAnimationFrame(function() {
        if (lastScrollPosition > 20) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
        ticking = false;
      });
      
      ticking = true;
    }
  });
  
  // Initialize for mobile
  handleMobileStyles();
}

/**
 * Handle mobile-specific styles
 */
function handleMobileStyles() {
  // Check if we're on a mobile device
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Adjust header for mobile
    const header = document.querySelector('.header');
    if (header) {
      header.classList.add('mobile-view');
    }
  }
}

/**
 * Setup mobile menu functionality
 */
function setupMobileMenu() {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu-container');
  
  if (!menuButton || !mobileMenu) return;
  
  // Toggle menu when button is clicked
  menuButton.addEventListener('click', function() {
    menuButton.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Toggle aria-expanded attribute for accessibility
    const isExpanded = menuButton.classList.contains('active');
    menuButton.setAttribute('aria-expanded', isExpanded);
  });
  
  // Close menu when a link is clicked
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      menuButton.classList.remove('active');
      mobileMenu.classList.remove('active');
      menuButton.setAttribute('aria-expanded', false);
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!menuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
      menuButton.classList.remove('active');
      mobileMenu.classList.remove('active');
      menuButton.setAttribute('aria-expanded', false);
    }
  });
  
  // Set initial aria-expanded attribute
  menuButton.setAttribute('aria-expanded', false);
}

/**
 * Setup range slider functionality with enhanced visuals
 */
function setupRangeSlider() {
  const rangeSlider = document.getElementById('severity');
  const rangeValue = document.getElementById('severity-value');
  
  if (!rangeSlider || !rangeValue) return;
  
  // Set initial value and color
  updateSliderValue(rangeSlider.value);
  
  // Update value display on input change
  rangeSlider.addEventListener('input', function() {
    updateSliderValue(this.value);
  });
  
  // Function to update slider value display and styling
  function updateSliderValue(value) {
    rangeValue.textContent = value;
    
    // Update color based on value
    let color, position;
    if (value <= 3) {
      color = '#4ade80'; // Green
      position = (value / 10) * 100;
    } else if (value <= 7) {
      color = '#facc15'; // Yellow
      position = (value / 10) * 100;
    } else {
      color = '#ef4444'; // Red
      position = (value / 10) * 100;
    }
    
    rangeValue.style.backgroundColor = color;
    rangeValue.style.marginLeft = `calc(${position}% - 20px)`;
    
    // Add a ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('range-ripple');
    ripple.style.left = `${position}%`;
    ripple.style.backgroundColor = color;
    
    const sliderContainer = rangeSlider.parentElement;
    sliderContainer.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}

/**
 * Setup form section hover effects
 */
function setupFormSectionEffects() {
  const formSections = document.querySelectorAll('.form-section');
  
  formSections.forEach(section => {
    // Add subtle hover animation
    section.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    });
    
    section.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });
    
    // Add focus effect when a field inside the section is focused
    const fields = section.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      field.addEventListener('focus', function() {
        section.classList.add('section-focused');
      });
      
      field.addEventListener('blur', function() {
        if (!section.contains(document.activeElement)) {
          section.classList.remove('section-focused');
        }
      });
    });
  });
}

/**
 * Setup enhanced form field animations
 */
function setupFormFieldAnimations() {
  // Add label float animation for text inputs
  const textInputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
  
  textInputs.forEach(input => {
    const label = input.previousElementSibling;
    if (!label || label.tagName !== 'LABEL') return;
    
    // Check if input has value on load
    if (input.value) {
      label.classList.add('active-label');
    }
    
    // Add events for label animation
    input.addEventListener('focus', function() {
      label.classList.add('active-label');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        label.classList.remove('active-label');
      }
    });
  });
  
  // Enhance checkbox animations
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const checkboxItem = this.closest('.checkbox-item');
      
      if (this.checked) {
        const ripple = document.createElement('span');
        ripple.classList.add('checkbox-ripple');
        checkboxItem.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 500);
      }
    });
  });
  
  // Add animation to form validation
  const form = document.getElementById('diagnosis-form');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      const requiredFields = form.querySelectorAll('[required]');
      let hasError = false;
      
      requiredFields.forEach(field => {
        if (!field.value) {
          hasError = true;
          const fieldGroup = field.closest('.form-group');
          
          // Add shake animation
          fieldGroup.classList.add('shake-error');
          
          // Remove shake class after animation completes
          setTimeout(() => {
            fieldGroup.classList.remove('shake-error');
          }, 600);
        }
      });
      
      // Add class to show active section when submitting
      const formSections = document.querySelectorAll('.form-section');
      formSections.forEach(section => section.classList.add('form-section-active'));
      
      // Remove active class after animation
      setTimeout(() => {
        formSections.forEach(section => section.classList.remove('form-section-active'));
      }, 800);
    });
  }
}

/**
 * Setup reset form button
 */
function setupResetForm() {
  const resetButton = document.getElementById('reset-form');
  const form = document.getElementById('diagnosis-form');
  
  if (!resetButton || !form) return;
  
  resetButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the form?')) {
      form.reset();
      
      // Reset range slider value display
      const rangeSlider = document.getElementById('severity');
      const rangeValue = document.getElementById('severity-value');
      
      if (rangeSlider && rangeValue) {
        rangeValue.textContent = rangeSlider.value;
        rangeValue.style.backgroundColor = 'var(--color-primary)';
      }
      
      // Hide medication details if it was shown
      const medicationDetailsGroup = document.getElementById('medication-details-group');
      if (medicationDetailsGroup) {
        medicationDetailsGroup.style.display = 'none';
      }
    }
  });
}

/**
 * Setup PDF download functionality
 */
function setupPdfDownload() {
  const downloadButton = document.getElementById('download-pdf');
  
  if (!downloadButton) return;
  
  downloadButton.addEventListener('click', function() {
    generatePDF();
  });
}

/**
 * Generate a PDF with the diagnosis results using jsPDF
 */
function generatePDF() {
  if (!window.diagnosisData) {
    alert("No diagnosis data available. Please complete a health analysis first.");
    return;
  }
  
  // Get the download button correctly using its ID
  const downloadButton = document.getElementById('download-pdf');
  
  if (!downloadButton) {
    console.error("PDF download button not found");
    return;
  }
  
  // Update button state to show it's processing
  const originalButtonText = downloadButton.innerHTML;
  downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
  downloadButton.disabled = true;
  
  try {
    console.log("Starting PDF generation with jsPDF...");
    
    // Check if jspdf is available
    if (typeof jspdf === 'undefined') {
      throw new Error("jsPDF library not loaded");
    }
    
    // Initialize jsPDF with a portrait A4 page
    const { jsPDF } = jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set document properties
    doc.setProperties({
      title: 'Ratidzo Health Report',
      subject: 'Health Analysis',
      author: 'Ratidzo Health AI',
      creator: 'Ratidzo Health AI'
    });
    
    // Define colors and styles
    const primaryColor = [74, 222, 128]; // Green
    const secondaryColor = [255, 149, 0]; // Orange
    const warningColor = [255, 59, 48]; // Red
    const textColor = [51, 51, 51]; // Dark gray
    const lightGray = [150, 150, 150]; // Light gray
    
    // Constants for layout
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    
    // Starting Y position
    let y = margin;
    
    // Helper function to add a new page if needed
    function checkPageBreak(height) {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    }
    
    // Helper function to add a text paragraph with word wrapping
    function addParagraph(text, x, maxWidth, fontSize = 10, fontStyle = 'normal', textColor = [0, 0, 0]) {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      y += (lines.length * fontSize * 0.352) + 2; // Approximate line height + spacing
      return lines.length;
    }
    
    // Add logo and title
    // Add title text
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Ratidzo Health Report", margin, y + 10);
    
    // Add website and timestamp
    y += 16;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("www.ratidzo-health.com", margin, y);
    
    const dateTime = window.diagnosisData.date + " " + new Date().toLocaleTimeString();
    const dateWidth = doc.getTextWidth(`Generated: ${dateTime}`);
    doc.text(`Generated: ${dateTime}`, pageWidth - margin - dateWidth, y);
    
    // Add AI-powered badge if applicable
    if (window.diagnosisData.aiPowered) {
      y += 8;
      // Draw rounded rectangle
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(margin, y - 5, 35, 8, 2, 2, 'F');
      
      // Add text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255); // White text
      doc.text("AI-POWERED", margin + 17.5, y, { align: 'center' });
    }
    
    // Add horizontal separator line
    y += 12;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Add patient information in a table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Patient Information", margin, y);
    y += 8;
    
    const userInfo = window.diagnosisData.userInfo;
    
    // Create a simple table for user info
    const patientInfoTable = [
      [{ content: 'Age', styles: { fontStyle: 'bold' } }, userInfo.age || 'Not provided', 
       { content: 'Gender', styles: { fontStyle: 'bold' } }, userInfo.gender || 'Not provided'],
      [{ content: 'Severity', styles: { fontStyle: 'bold' } }, `${userInfo.severity}/10`, 
       { content: 'Duration', styles: { fontStyle: 'bold' } }, userInfo.duration || 'Not provided']
    ];
    
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      body: patientInfoTable,
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20 },
        3: { cellWidth: 'auto' }
      }
    });
    
    y = doc.previousAutoTable.finalY + 5;
    
    // Add symptoms information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Symptoms:", margin, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    const symptomsText = userInfo.symptoms || 'None provided';
    const symptomsLines = doc.splitTextToSize(symptomsText, contentWidth - 10);
    doc.text(symptomsLines, margin + 5, y);
    y += (symptomsLines.length * 3.5) + 5;
    
    // Add selected symptoms if any
    if (userInfo.checkedSymptoms && userInfo.checkedSymptoms.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text("Selected Symptoms:", margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      const selectedSymptomsText = userInfo.checkedSymptoms.join(', ');
      const selectedSymptomsLines = doc.splitTextToSize(selectedSymptomsText, contentWidth - 10);
      doc.text(selectedSymptomsLines, margin + 5, y);
      y += (selectedSymptomsLines.length * 3.5) + 5;
    }
    
    // Add horizontal separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Add health analysis results section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Health Analysis Results", margin, y);
    y += 10;
    
    // Add each condition
    window.diagnosisData.conditions.forEach((condition, index) => {
      checkPageBreak(50); // Check if we need a new page
      
      // Draw condition box with colored border based on probability
      let borderColor;
      if (condition.probability === 'High') {
        borderColor = warningColor;
      } else if (condition.probability === 'Medium') {
        borderColor = secondaryColor;
      } else {
        borderColor = primaryColor;
      }
      
      // Draw a rectangle with colored top border
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'F');
      doc.setLineWidth(1.5);
      doc.line(margin, y, margin + contentWidth, y);
      
      // Add condition title and probability
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(condition.name, margin + 5, y + 6);
      
      // Add probability badge
      const probText = condition.probability;
      const probWidth = doc.getTextWidth(probText) + 10;
      
      doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.roundedRect(pageWidth - margin - probWidth - 5, y + 3, probWidth, 6, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(probText, pageWidth - margin - 5 - (probWidth / 2), y + 6.5, { align: 'center' });
      
      y += 12;
      
      // Add condition description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const descLines = doc.splitTextToSize(condition.description, contentWidth - 5);
      doc.text(descLines, margin + 5, y);
      y += (descLines.length * 3.5) + 5;
      
      // Check page break before sections
      checkPageBreak(40);
      
      // Add sections using autotables for better formatting
      
      // Possible Causes
      if (condition.possibleCauses && condition.possibleCauses.length > 0) {
        // Section title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Possible Causes:", margin + 5, y);
        y += 5;
        
        // Create table for causes
        const causesData = condition.possibleCauses.map(cause => [{ content: '•', styles: { fontStyle: 'bold' } }, cause]);
        
        doc.autoTable({
          startY: y,
          margin: { left: margin + 10, right: margin },
          tableWidth: contentWidth - 10,
          styles: {
            fontSize: 9,
            cellPadding: 1
          },
          body: causesData,
          theme: 'plain',
          columnStyles: {
            0: { cellWidth: 4 },
            1: { cellWidth: 'auto' }
          }
        });
        
        y = doc.previousAutoTable.finalY + 3;
      }
      
      // Check page break before recommended actions
      checkPageBreak(40);
      
      // Recommended Actions
      if (condition.recommendedActions && condition.recommendedActions.length > 0) {
        // Section title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Recommended Actions:", margin + 5, y);
        y += 5;
        
        // Create table for actions
        const actionsData = condition.recommendedActions.map(action => [{ content: '•', styles: { fontStyle: 'bold' } }, action]);
        
        doc.autoTable({
          startY: y,
          margin: { left: margin + 10, right: margin },
          tableWidth: contentWidth - 10,
          styles: {
            fontSize: 9,
            cellPadding: 1
          },
          body: actionsData,
          theme: 'plain',
          columnStyles: {
            0: { cellWidth: 4 },
            1: { cellWidth: 'auto' }
          }
        });
        
        y = doc.previousAutoTable.finalY + 3;
      }
      
      // Check page break before risk factors
      checkPageBreak(40);
      
      // Risk Factors
      if (condition.riskFactors && condition.riskFactors.length > 0) {
        // Section title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Risk Factors:", margin + 5, y);
        y += 5;
        
        // Create table for risk factors
        const riskData = condition.riskFactors.map(risk => [{ content: '•', styles: { fontStyle: 'bold' } }, risk]);
        
        doc.autoTable({
          startY: y,
          margin: { left: margin + 10, right: margin },
          tableWidth: contentWidth - 10,
          styles: {
            fontSize: 9,
            cellPadding: 1
          },
          body: riskData,
          theme: 'plain',
          columnStyles: {
            0: { cellWidth: 4 },
            1: { cellWidth: 'auto' }
          }
        });
        
        y = doc.previousAutoTable.finalY + 10;
      }
    });
    
    // Check if we need a new page for disclaimer
    checkPageBreak(40);
    
    // Add horizontal separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);
    
    // Add disclaimer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Medical Disclaimer", margin, y);
    y += 5;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const disclaimerText = "This health report is for informational purposes only and does not constitute medical advice. " +
      "The information provided should not be used for diagnosing or treating a health problem or disease. " +
      "Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";
    
    const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
    doc.text(disclaimerLines, margin, y);
    y += (disclaimerLines.length * 3) + 3;
    
    // Add AI-powered disclaimer if applicable
    if (window.diagnosisData.aiPowered) {
      const aiDisclaimerText = "This analysis was generated using artificial intelligence technology and should be reviewed by a healthcare professional.";
      const aiDisclaimerLines = doc.splitTextToSize(aiDisclaimerText, contentWidth);
      doc.text(aiDisclaimerLines, margin, y);
      y += (aiDisclaimerLines.length * 3) + 3;
    }
    
    // Add footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text("© 2025 Ratidzo Health AI. All rights reserved.", pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    // Save the PDF
    doc.save("Ratidzo-Health-Report.pdf");
    
    console.log("PDF generated and saved successfully");
    
    // Reset button state
    downloadButton.innerHTML = originalButtonText;
    downloadButton.disabled = false;
    
  } catch (error) {
    console.error("PDF generation error:", error);
    
    // Reset button state
    downloadButton.innerHTML = originalButtonText;
    downloadButton.disabled = false;
    
    // Show error alert
    alert("There was an error generating the PDF. Please try again.");
    
    // Offer alternative: open print view
    if (confirm("Would you like to try opening a printable version instead?")) {
      openPrintableVersion();
    }
  }
}

/**
 * Open a printable version of the diagnosis in a new window
 */
function openPrintableVersion() {
  if (!window.diagnosisData) return;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Pop-up blocked. Please allow pop-ups for this site to use this feature.");
    return;
  }
  
  const data = window.diagnosisData;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ratidzo Health Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .header { display: flex; align-items: center; }
        .info { margin: 20px 0; padding: 10px; border: 1px solid #eee; }
        .condition { margin-bottom: 20px; padding: 10px; border: 1px solid #eee; }
        .high { color: #ff3b30; }
        .medium { color: #ff9500; }
        .low { color: #4cd964; }
        .disclaimer { font-size: 12px; font-style: italic; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ratidzo Health Report</h1>
        ${data.aiPowered ? '<span style="background: #4ade80; color: white; padding: 5px 10px; border-radius: 10px; margin-left: 10px;">AI-POWERED</span>' : ''}
      </div>
      <p>Generated on: ${data.date} at ${data.time}</p>
      
      <div class="info">
        <h2>Patient Information</h2>
        <p><strong>Age:</strong> ${data.userInfo.age}</p>
        <p><strong>Gender:</strong> ${data.userInfo.gender}</p>
        <p><strong>Symptoms:</strong> ${data.userInfo.symptoms || 'None provided'}</p>
        ${data.userInfo.checkedSymptoms.length > 0 ? `<p><strong>Selected Symptoms:</strong> ${data.userInfo.checkedSymptoms.join(', ')}</p>` : ''}
        <p><strong>Duration:</strong> ${data.userInfo.duration}</p>
        <p><strong>Severity:</strong> ${data.userInfo.severity}/10</p>
      </div>
      
      <h2>Health Analysis Results</h2>
      ${data.conditions.map(condition => `
        <div class="condition">
          <h3>${condition.name} <span class="${condition.probability.toLowerCase()}">(${condition.probability})</span></h3>
          <p>${condition.description}</p>
          
          ${condition.possibleCauses && condition.possibleCauses.length > 0 ? `
            <h4>Possible Causes:</h4>
            <ul>
              ${condition.possibleCauses.map(cause => `<li>${cause}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${condition.recommendedActions && condition.recommendedActions.length > 0 ? `
            <h4>Recommended Actions:</h4>
            <ul>
              ${condition.recommendedActions.map(action => `<li>${action}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${condition.riskFactors && condition.riskFactors.length > 0 ? `
            <h4>Risk Factors:</h4>
            <ul>
              ${condition.riskFactors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
      
      <div class="disclaimer">
        <p><strong>Medical Disclaimer:</strong> This health report is for informational purposes only and does not constitute medical advice. The information provided should not be used for diagnosing or treating a health problem or disease. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
        ${data.aiPowered ? '<p>This analysis was generated using artificial intelligence technology and should be reviewed by a healthcare professional.</p>' : ''}
        <p>&copy; 2025 Ratidzo Health AI. All rights reserved.</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Initialize all UI components
 */
function initUI() {
  // Remove loader on page load
  window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('loader-hidden');
      setTimeout(() => {
        loader.remove();
      }, 1000);
    }
  });
  
  // Initialize dynamic elements
  setupMobileMenu();
  setupRangeSlider();
  setupFormSectionEffects();
  setupFormFieldAnimations();
  setupResetForm();
  initAgeCalculation();
  setupAnimationObserver();
  
  // Initialize chat functionality
  console.log('Chat button functionality is now handled in chat.js');
}

// Call init function to setup UI components
document.addEventListener('DOMContentLoaded', initUI); 
