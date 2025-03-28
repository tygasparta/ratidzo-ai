/**
 * Ratidzo Health AI - PDF Enhancer
 * This script enhances the PDF generation by adding the logo, proper formatting, and website URL
 */

(function() {
  // Wait for the document to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Check if jsPDF is available (it should be in the bundled app)
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      console.warn('jsPDF library not found. Loading it from CDN...');
      
      // Load jsPDF from CDN if not available
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = initPdfEnhancer;
      document.head.appendChild(script);
    } else {
      initPdfEnhancer();
    }
  });

  function initPdfEnhancer() {
    console.log('Initializing Ratidzo PDF Enhancer');
    
    // Check for download buttons and enhance them
    const findAndEnhanceDownloadButtons = () => {
      const downloadButtons = document.querySelectorAll('button');
      downloadButtons.forEach(button => {
        if (
          button.textContent.toLowerCase().includes('download') &&
          button.textContent.toLowerCase().includes('pdf')
        ) {
          console.log('Found PDF download button, enhancing it');
          
          // Create a clone of the button to avoid event handler issues
          const enhancedButton = button.cloneNode(true);
          enhancedButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            generateEnhancedPDF();
            return false;
          });
          
          // Replace the original button with our enhanced version
          button.parentNode.replaceChild(enhancedButton, button);
        }
      });
    };

    // Wait for the DOM to be updated with diagnosis results
    let checkInterval = setInterval(() => {
      const diagnosisResult = document.querySelector('.diagnosis-result') || 
                             document.querySelector('[class*="diagnosis"]') ||
                             document.querySelector('[id*="diagnosis"]');
      
      if (diagnosisResult) {
        clearInterval(checkInterval);
        console.log('Diagnosis result found, enhancing download button');
        findAndEnhanceDownloadButtons();
      }
    }, 1000);
    
    // Set a timeout to stop checking after 30 seconds
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  function generateEnhancedPDF() {
    console.log('Generating enhanced PDF');
    
    // Get the jsPDF instance
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDF) {
      console.error('jsPDF library not available');
      alert('Unable to generate PDF. Please try again later.');
      return;
    }

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set document properties
    doc.setProperties({
      title: 'Ratidzo Health AI - Diagnosis Report',
      subject: 'Health Diagnosis Results',
      author: 'Ratidzo Health AI',
      creator: 'Ratidzo Health AI'
    });

    // Add the Ratidzo logo
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#1a202c"/>
      <path d="M4,16 L10,16 L12,12 L16,22 L19,13 L21,16 L28,16" stroke="url(#brandGradient)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M12,8 L12,24 M12,8 L18,8 Q21,8 21,11 Q21,14 18,14 L12,14 L18,24" stroke="url(#brandGradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#16a34a"/>
          <stop offset="100%" stop-color="#eab308"/>
        </linearGradient>
      </defs>
    </svg>`;

    // Create a temporary img element to convert the SVG to a data URL
    const createLogoDataUrl = (callback) => {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        callback(dataUrl);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(logoSvg);
    };

    // Get diagnosis data from the page
    const getDiagnosisData = () => {
      // Try to find the diagnosis result container
      const diagnosisContainer = document.querySelector('.diagnosis-result') || 
                                document.querySelector('[class*="diagnosis"]') ||
                                document.querySelector('[id*="diagnosis"]');
      
      if (!diagnosisContainer) {
        console.error('Diagnosis container not found');
        return {
          condition: 'Diagnosis Result',
          urgency: 'Unknown',
          explanation: 'Unable to retrieve diagnosis details',
          remedies: ['Please refer to the web application for complete results'],
          warning_signs: ['Consult with a healthcare professional for accurate diagnosis']
        };
      }

      // Extract diagnosis details
      const condition = diagnosisContainer.querySelector('h2, h3')?.textContent || 'Diagnosis Result';
      const urgencyElement = diagnosisContainer.querySelector('[class*="urgency"], [class*="badge"]');
      const urgency = urgencyElement ? urgencyElement.textContent : 'Unknown';
      
      // Get explanation
      const explanationElement = Array.from(diagnosisContainer.querySelectorAll('p')).find(p => 
        p.textContent.length > 50 && !p.textContent.includes('always consult')
      );
      const explanation = explanationElement ? explanationElement.textContent : '';
      
      // Get remedies
      const remediesTitle = Array.from(diagnosisContainer.querySelectorAll('h3, h4, strong')).find(el => 
        el.textContent.toLowerCase().includes('remedies') || el.textContent.toLowerCase().includes('recommendations')
      );
      let remediesElement = remediesTitle ? remediesTitle.nextElementSibling : null;
      if (!remediesElement || !remediesElement.tagName.match(/^(UL|OL)$/i)) {
        remediesElement = Array.from(diagnosisContainer.querySelectorAll('ul, ol')).find(list => 
          list.previousElementSibling && 
          (list.previousElementSibling.textContent.toLowerCase().includes('remedies') || 
           list.previousElementSibling.textContent.toLowerCase().includes('recommendations'))
        );
      }
      const remedies = remediesElement ? 
        Array.from(remediesElement.querySelectorAll('li')).map(li => li.textContent) : 
        ['No specific remedies found'];

      // Get warning signs
      const warningTitle = Array.from(diagnosisContainer.querySelectorAll('h3, h4, strong')).find(el => 
        el.textContent.toLowerCase().includes('warning')
      );
      let warningElement = warningTitle ? warningTitle.nextElementSibling : null;
      if (!warningElement || !warningElement.tagName.match(/^(UL|OL)$/i)) {
        warningElement = Array.from(diagnosisContainer.querySelectorAll('ul, ol')).find(list => 
          list.previousElementSibling && list.previousElementSibling.textContent.toLowerCase().includes('warning')
        );
      }
      const warning_signs = warningElement ? 
        Array.from(warningElement.querySelectorAll('li')).map(li => li.textContent) : 
        ['If symptoms persist or worsen, please consult a healthcare professional'];

      return {
        condition,
        urgency,
        explanation,
        remedies,
        warning_signs
      };
    };

    // Generate the PDF with the logo
    createLogoDataUrl((logoDataUrl) => {
      // Get the diagnosis data
      const diagnosisData = getDiagnosisData();
      
      // Set up fonts and styles
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(22, 163, 74); // Green color #16a34a
      
      // Add logo and title
      doc.addImage(logoDataUrl, 'PNG', 15, 10, 20, 20);
      doc.text('Ratidzo Health AI', 40, 25);
      
      // Add website URL and date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('https://ratidzo.com', 40, 32);
      doc.text(`Generated on ${new Date().toLocaleString()}`, 150, 32, { align: 'right' });
      
      // Add horizontal line
      doc.setDrawColor(22, 163, 74);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);
      
      // Add diagnosis section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text('Diagnosis Results', 15, 45);

      // Add condition name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(44, 82, 130); // Blue color
      doc.text(`Condition: ${diagnosisData.condition}`, 15, 55);
      
      // Add urgency level
      let urgencyColor;
      if (diagnosisData.urgency.toLowerCase().includes('high')) {
        urgencyColor = [220, 38, 38]; // Red for high
      } else if (diagnosisData.urgency.toLowerCase().includes('medium')) {
        urgencyColor = [234, 179, 8]; // Yellow for medium
      } else {
        urgencyColor = [22, 163, 74]; // Green for low
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(urgencyColor[0], urgencyColor[1], urgencyColor[2]);
      doc.text(`Urgency: ${diagnosisData.urgency}`, 15, 62);
      
      // Add explanation
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const splitExplanation = doc.splitTextToSize(diagnosisData.explanation, 170);
      doc.text(splitExplanation, 15, 72);
      
      // Calculate next Y position after text
      let yPosition = 72 + (splitExplanation.length * 6);
      
      // Add remedies section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74); // Green
      doc.text('Recommended Remedies:', 15, yPosition + 5);
      
      // Add remedies list
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      yPosition += 10;
      diagnosisData.remedies.forEach((remedy, index) => {
        const splitRemedy = doc.splitTextToSize(`${index + 1}. ${remedy}`, 170);
        doc.text(splitRemedy, 15, yPosition + (index * 7));
        yPosition += (splitRemedy.length - 1) * 7; // Adjust for multi-line items
      });
      
      yPosition += diagnosisData.remedies.length * 7;
      
      // Add warning signs section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38); // Red
      doc.text('Warning Signs:', 15, yPosition + 5);
      
      // Add warning signs list
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      yPosition += 10;
      diagnosisData.warning_signs.forEach((sign, index) => {
        const splitSign = doc.splitTextToSize(`${index + 1}. ${sign}`, 170);
        doc.text(splitSign, 15, yPosition + (index * 7));
        yPosition += (splitSign.length - 1) * 7; // Adjust for multi-line items
      });
      
      // Add disclaimer
      yPosition += diagnosisData.warning_signs.length * 7 + 10;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      const disclaimer = "Disclaimer: This information is provided for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment of medical conditions.";
      const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
      doc.text(splitDisclaimer, 15, yPosition);
      
      // Add footer with page number
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Ratidzo Health AI - Your AI Powered Health Assistant', 105, 285, { align: 'center' });
      doc.text('Page 1 of 1', 105, 290, { align: 'center' });
      
      // Save the PDF
      doc.save(`Ratidzo_Health_AI_Diagnosis_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  }
})(); 