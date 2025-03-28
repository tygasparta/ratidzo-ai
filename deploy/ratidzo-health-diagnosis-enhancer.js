/**
 * Ratidzo Health Diagnosis Enhancer
 * 
 * This script enhances the diagnosis functionality of Ratidzo Health AI,
 * particularly for gastrointestinal symptoms such as diarrhea ("running stomach").
 * 
 * It intercepts API responses and enhances them when specific symptoms are detected.
 */

(function() {
  // Wait for the DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Ratidzo] Diagnosis Enhancer loaded');
    
    // Symptom keywords and their associated conditions
    const gastrointestinalSymptoms = [
      'diarrhea', 'running stomach', 'loose stool', 'loose stools', 'watery stool',
      'frequent bowel movement', 'stomach ache', 'stomach pain', 'abdominal pain',
      'vomiting', 'nausea', 'upset stomach', 'gastric'
    ];
    
    const diagnosisEnhancements = {
      diarrhea: {
        condition: 'Gastroenteritis',
        urgency: 'Moderate - Seek medical attention if symptoms persist over 48 hours, high fever develops, or severe dehydration occurs',
        description: 'Gastroenteritis is inflammation of the stomach and intestines, typically resulting from bacterial or viral infections. It often manifests as diarrhea ("running stomach") and may be accompanied by abdominal cramps, nausea, vomiting, and fever.',
        remedies: [
          'Stay hydrated with oral rehydration solutions (mix 1L clean water with 6 level teaspoons sugar and 1/2 level teaspoon salt)',
          'Consume easily digestible foods like rice, bananas, toast, and applesauce',
          'Avoid dairy, caffeine, alcohol, and fatty or spicy foods until recovery',
          'Rest and monitor for signs of dehydration (dry mouth, excessive thirst, reduced urination)'
        ],
        precautions: [
          'If blood appears in stool, seek immediate medical attention',
          'If vomiting prevents drinking liquids, medical attention is necessary to prevent dehydration',
          'Infants, elderly, and those with weakened immune systems should seek medical care sooner'
        ]
      }
    };
    
    // Function to intercept and enhance health analysis responses
    function enhanceDiagnosis() {
      // Check for diagnosis elements every second (they may load dynamically)
      const diagnosisInterval = setInterval(() => {
        // Find diagnosis containers using various selectors to ensure compatibility
        const diagnosisContainers = [
          ...document.querySelectorAll('.diagnosis-container'),
          ...document.querySelectorAll('.diagnosis-results'),
          ...document.querySelectorAll('[data-testid="diagnosis-result"]'),
          ...document.querySelectorAll('.diagnosis-section'),
          ...document.querySelectorAll('.health-analysis')
        ];
        
        if (diagnosisContainers.length > 0) {
          diagnosisContainers.forEach(container => enhanceDiagnosisContainer(container));
          
          // Add event listener for diagnosis form submissions
          const diagnosisForms = document.querySelectorAll('form');
          diagnosisForms.forEach(form => {
            // Remove existing listeners to prevent duplicates
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            newForm.addEventListener('submit', handleDiagnosisSubmit);
          });
        }
      }, 1000);
      
      // Clear interval after 30 seconds to avoid indefinite checking
      setTimeout(() => clearInterval(diagnosisInterval), 30000);
    }
    
    // Handle diagnosis form submission
    function handleDiagnosisSubmit(event) {
      // Get all text inputs in the form
      const textInputs = event.target.querySelectorAll('input[type="text"], textarea');
      
      // Look for gastrointestinal symptoms in the inputs
      let hasGastroSymptoms = false;
      let matchedSymptom = null;
      
      textInputs.forEach(input => {
        const inputValue = input.value.toLowerCase();
        for (const symptom of gastrointestinalSymptoms) {
          if (inputValue.includes(symptom)) {
            hasGastroSymptoms = true;
            matchedSymptom = symptom === 'running stomach' ? 'diarrhea' : symptom;
            break;
          }
        }
      });
      
      if (hasGastroSymptoms) {
        console.log('[Ratidzo] Detected gastrointestinal symptom:', matchedSymptom);
        // Store the matched symptom to use when enhancing the response later
        window.ratidzoPendingSymptom = matchedSymptom;
        
        // Check for the diagnosis response after a delay
        setTimeout(() => {
          const diagnosisContainers = [
            ...document.querySelectorAll('.diagnosis-container'),
            ...document.querySelectorAll('.diagnosis-results'),
            ...document.querySelectorAll('[data-testid="diagnosis-result"]'),
            ...document.querySelectorAll('.diagnosis-section'),
            ...document.querySelectorAll('.health-analysis')
          ];
          
          if (diagnosisContainers.length > 0) {
            diagnosisContainers.forEach(container => enhanceDiagnosisContainer(container, matchedSymptom));
          }
        }, 3000); // Wait for response to load
      }
    }
    
    // Enhance a diagnosis container with better information
    function enhanceDiagnosisContainer(container, forcedSymptom = null) {
      // Get the symptom to use (either forced or from pending)
      const symptom = forcedSymptom || window.ratidzoPendingSymptom || null;
      if (!symptom || !diagnosisEnhancements[symptom]) return;
      
      // Clear the pending symptom to avoid repeated enhancements
      window.ratidzoPendingSymptom = null;
      
      // Find elements to enhance
      const enhancement = diagnosisEnhancements[symptom];
      
      // Look for condition/diagnosis element
      const conditionElements = [
        ...container.querySelectorAll('.diagnosis-condition'),
        ...container.querySelectorAll('.condition'),
        ...container.querySelectorAll('h3'),
        ...container.querySelectorAll('h2')
      ];
      
      // Look for description elements
      const descriptionElements = [
        ...container.querySelectorAll('.diagnosis-description'),
        ...container.querySelectorAll('.description'),
        ...container.querySelectorAll('p')
      ];
      
      // Look for urgency elements
      const urgencyElements = [
        ...container.querySelectorAll('.diagnosis-urgency'),
        ...container.querySelectorAll('.urgency'),
        ...container.querySelectorAll('.severity')
      ];
      
      // Look for remedies elements
      const remediesElements = [
        ...container.querySelectorAll('.diagnosis-remedies'),
        ...container.querySelectorAll('.remedies'),
        ...container.querySelectorAll('ul')
      ];
      
      // Update condition if found
      conditionElements.forEach(el => {
        // Only update if it contains generic text like "General Discomfort"
        if (el.textContent.includes('General') || el.textContent.includes('Discomfort')) {
          el.textContent = enhancement.condition;
        }
      });
      
      // Update description if found
      if (descriptionElements.length > 0) {
        descriptionElements[0].textContent = enhancement.description;
      }
      
      // Update urgency if found
      urgencyElements.forEach(el => {
        el.textContent = enhancement.urgency;
      });
      
      // Update remedies if found
      if (remediesElements.length > 0) {
        const remediesList = remediesElements[0];
        // Clear existing remedies
        remediesList.innerHTML = '';
        
        // Add enhanced remedies
        enhancement.remedies.forEach(remedy => {
          const li = document.createElement('li');
          li.textContent = remedy;
          remediesList.appendChild(li);
        });
        
        // Add precautions if there's space
        if (enhancement.precautions && enhancement.precautions.length > 0) {
          const precautionsHeading = document.createElement('h4');
          precautionsHeading.textContent = 'Precautions:';
          precautionsHeading.style.marginTop = '15px';
          remediesList.parentNode.appendChild(precautionsHeading);
          
          const precautionsList = document.createElement('ul');
          enhancement.precautions.forEach(precaution => {
            const li = document.createElement('li');
            li.textContent = precaution;
            precautionsList.appendChild(li);
          });
          remediesList.parentNode.appendChild(precautionsList);
        }
      }
      
      console.log('[Ratidzo] Enhanced diagnosis for:', symptom);
    }
    
    // Start the enhancement process
    enhanceDiagnosis();
  });
})(); 