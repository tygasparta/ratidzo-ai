import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDiagnosisFromDeepSeek, isDeepSeekEnabled } from './deepseek-integration.js';
import { getChatResponseFromDeepSeek, isDeepSeekChatEnabled } from './chat-integration.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Handle API requests for health diagnosis
async function handleApiRequest(request, response) {
  // Set CORS headers for all responses
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return true;
  }

  if (request.method === 'POST' && request.url === '/api/diagnose') {
    let body = '';
    
    request.on('data', chunk => {
      body += chunk.toString();
    });
    
    request.on('end', async () => {
      try {
        console.log('Received diagnosis request');
        
        const data = JSON.parse(body);
        const prompt = data.prompt;
        
        if (!prompt) {
          console.error('Missing diagnosis prompt in request');
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Missing diagnosis prompt' }));
          return;
        }
        
        console.log(`Diagnosis prompt length: ${prompt.length} characters`);
        console.log(`DeepSeek API enabled: ${isDeepSeekEnabled()}`);
        
        // First try to use DeepSeek API if configured
        let diagnosisResults = null;
        let apiPowered = false;
        
        if (isDeepSeekEnabled()) {
          console.log('Attempting to use DeepSeek API...');
          try {
            // Use a timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DeepSeek API request timed out')), 15000)
            );
            
            const apiPromise = getDiagnosisFromDeepSeek(prompt);
            
            // Race between API call and timeout
            diagnosisResults = await Promise.race([apiPromise, timeoutPromise]);
            apiPowered = diagnosisResults !== null;
            console.log(`DeepSeek API successful: ${apiPowered}`);
          } catch (apiError) {
            console.error('Error using DeepSeek API:', apiError);
          }
        }
        
        // Fall back to the rule-based approach if DeepSeek fails or is not configured
        if (!diagnosisResults) {
          console.log('Using rule-based diagnosis processing');
          diagnosisResults = processHealthPrompt(prompt);
        }
        
        // Return the results
        const responseData = {
          success: true,
          diagnosisResults,
          aiPowered: apiPowered,
          timestamp: new Date().toISOString()
        };
        
        console.log(`Returning diagnosis with ${diagnosisResults.length} conditions, AI-powered: ${apiPowered}`);
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(responseData));
      } catch (error) {
        console.error('Error processing diagnosis request:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }));
      }
    });
    
    return true; // Request handled
  }
  
  if (request.method === 'POST' && request.url === '/api/chat') {
    let body = '';
    
    console.log('Chat API endpoint called - beginning to process request');
    console.log('Request headers:', JSON.stringify(request.headers, null, 2));
    
    // Set CORS headers specifically for chat API
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    request.on('data', chunk => {
      body += chunk.toString();
      console.log(`Received chunk of data, total size so far: ${body.length} bytes`);
    });
    
    request.on('end', async () => {
      console.log('Finished receiving data from client');
      try {
        console.log('Received chat request, body length:', body.length);
        
        if (!body || body.trim() === '') {
          console.error('Empty request body received');
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Empty request body', 
            message: 'Request body cannot be empty' 
          }));
          return;
        }
        
        try {
          const data = JSON.parse(body);
          console.log('Parsed JSON data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
          
          const { message, history } = data;
          
          if (!message) {
            console.error('Missing chat message in request');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Missing chat message' }));
            return;
          }
          
          console.log(`Chat message length: ${message.length} characters`);
          console.log(`DeepSeek Chat API enabled: ${isDeepSeekChatEnabled()}`);
          
          // Use DeepSeek Chat API
          let chatResponse = '';
          
          try {
            console.log('Preparing to call DeepSeek API');
            
            // Implement retry logic with longer timeout
            const maxRetries = 1; // Try up to 2 times (initial + 1 retry)
            const timeoutMs = 30000; // Increased from 15000 to 30000 (30 seconds)
            
            // Function to attempt the API call with timeout
            const attemptApiCall = async (attempt = 0) => {
              console.log(`API call attempt ${attempt + 1}/${maxRetries + 1}`);
              
              try {
                // Use a timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error(`DeepSeek Chat API request timed out after ${timeoutMs/1000} seconds`)), timeoutMs)
                );
                
                const apiPromise = getChatResponseFromDeepSeek(message, history);
                
                // Race between API call and timeout
                return await Promise.race([apiPromise, timeoutPromise]);
              } catch (error) {
                if (attempt < maxRetries) {
                  console.log(`Attempt ${attempt + 1} failed, retrying... Error: ${error.message}`);
                  return attemptApiCall(attempt + 1);
                }
                throw error; // Re-throw if we've exhausted retries
              }
            };
            
            // Start the retry process
            chatResponse = await attemptApiCall();
            console.log(`Chat response received, length: ${chatResponse.length}`);
          } catch (apiError) {
            console.error('Error using DeepSeek Chat API:', apiError);
            console.error('API Error stack:', apiError.stack);
            
            // Provide more helpful error message to the user
            if (apiError.message.includes('timed out')) {
              chatResponse = "I apologize, but our AI health assistant is taking longer than expected to respond. This could be due to high demand or complex processing. Please try simplifying your question or try again in a few minutes.";
            } else {
              chatResponse = "I apologize, but I'm having trouble processing your request at the moment. Please try again shortly.";
            }
          }
          
          // Return the results
          const responseData = {
            success: true,
            response: chatResponse,
            timestamp: new Date().toISOString()
          };
          
          console.log('Sending response back to client');
          response.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          response.end(JSON.stringify(responseData));
          console.log('Response sent successfully');
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.error('Raw body received:', body);
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Invalid JSON', 
            message: parseError.message 
          }));
        }
      } catch (error) {
        console.error('Error processing chat request:', error);
        console.error('Error stack:', error.stack);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }));
      }
    });
    
    return true; // Request handled
  }
  
  return false; // Request not handled
}

// Process health prompt and return diagnosis (simulated AI response)
function processHealthPrompt(prompt) {
  console.log('Processing health diagnosis prompt:', prompt);
  
  // Extract key information from the prompt with more robust regex patterns
  const ageMatch = prompt.match(/Age: (.*?)($|\n)/);
  const age = ageMatch ? ageMatch[1].trim() : 'Not provided';
  
  const genderMatch = prompt.match(/Gender: (.*?)($|\n)/);
  const gender = genderMatch ? genderMatch[1].trim() : 'Not provided';
  
  // Improve symptom extraction with more flexible pattern
  const symptomsMatch = prompt.match(/Patient description: (.*?)($|\n|Symptoms Information|Medical History)/s);
  const symptoms = symptomsMatch ? symptomsMatch[1].trim().toLowerCase() : '';
  console.log("Extracted symptoms:", symptoms);
  
  // Fix the selected symptoms regex to handle the end of the section properly
  const selectedSymptomsMatch = prompt.match(/Selected symptoms: (.*?)(\.|\n|$)/);
  const selectedSymptoms = selectedSymptomsMatch 
    ? selectedSymptomsMatch[1].split(', ').map(s => s.trim().toLowerCase())
    : [];
  console.log("Selected symptoms:", selectedSymptoms);
  
  const severityMatch = prompt.match(/Severity level \(1-10\): (.*?)($|\n)/);
  const severity = severityMatch ? parseInt(severityMatch[1].trim()) : 5;
  
  const existingConditionsMatch = prompt.match(/Existing conditions: (.*?)(\.|\n|$)/);
  const existingConditions = existingConditionsMatch 
    ? existingConditionsMatch[1].split(', ').map(c => c.trim().toLowerCase())
    : [];
  
  const diagnosis = [];
  
  // Create an enhanced symptoms string that includes both free text and selected symptoms
  const allSymptoms = symptoms + ' ' + selectedSymptoms.join(' ');
  console.log("Combined symptoms for analysis:", allSymptoms);
  
  // Analyze symptoms and generate diagnosis with more keyword matching
  // Headache conditions
  if (allSymptoms.includes('headache') || allSymptoms.includes('head ache') || 
      allSymptoms.includes('head pain') || allSymptoms.includes('migraine')) {
    const headacheSeverity = severity > 7 ? 'High' : (severity > 4 ? 'Medium' : 'Low');
    
    diagnosis.push({
      name: 'Tension Headache',
      probability: headacheSeverity,
      description: 'A common type of headache characterized by a dull pain or pressure around the forehead, temples, or back of the head and neck. Often triggered by stress, poor posture, or eye strain.',
      possibleCauses: ['Stress and anxiety', 'Poor posture', 'Eye strain', 'Dehydration', 'Skipped meals', 'Lack of sleep'],
      recommendedActions: ['Over-the-counter pain relievers like ibuprofen or acetaminophen', 'Apply cold or warm compresses', 'Practice stress management techniques', 'Ensure proper ergonomics', 'Stay hydrated', 'Maintain regular sleep schedule'],
      riskFactors: ['History of depression or anxiety', 'High stress lifestyle', 'Sedentary work requiring long periods of concentration']
    });
    
    if (allSymptoms.includes('light') || allSymptoms.includes('noise') || 
        allSymptoms.includes('sensitive') || allSymptoms.includes('nausea') || 
        allSymptoms.includes('vomit') || severity > 6) {
      diagnosis.push({
        name: 'Migraine',
        probability: 'Medium',
        description: 'A neurological condition characterized by intense, debilitating headaches often accompanied by nausea, vomiting, and extreme sensitivity to light and sound. Migraines typically affect one side of the head and can last from hours to days.',
        possibleCauses: ['Genetic factors', 'Hormonal changes', 'Certain foods and additives', 'Stress', 'Sensory stimuli', 'Changes in sleep patterns'],
        recommendedActions: ['Rest in a quiet, dark room', 'Apply cold compresses', 'Try OTC pain relievers in early stages', 'Consider prescription medications if severe', 'Track triggers in a headache diary'],
        riskFactors: ['Family history of migraines', 'Age (typically begin in adolescence)', 'Gender (more common in women)', 'Hormonal changes']
      });
    }
  }
  
  // Fever-related conditions
  if (allSymptoms.includes('fever') || allSymptoms.includes('temperature') || 
      allSymptoms.includes('hot') || allSymptoms.includes('chills')) {
    
    // Cold or flu indicators
    const hasColdFluSymptoms = allSymptoms.includes('cough') || 
                              allSymptoms.includes('sore throat') || 
                              allSymptoms.includes('congestion') || 
                              allSymptoms.includes('runny nose') || 
                              allSymptoms.includes('sneez');
    
    if (hasColdFluSymptoms) {
      diagnosis.push({
        name: 'Common Cold',
        probability: 'High',
        description: 'A viral infection of the upper respiratory tract characterized by nasal congestion, sore throat, coughing, sneezing, and mild fever. Usually self-limiting and resolves within 7-10 days.',
        possibleCauses: ['Rhinoviruses (most common)', 'Coronavirus (not COVID-19)', 'RSV and other respiratory viruses'],
        recommendedActions: ['Rest and stay hydrated', 'Use saline nasal spray for congestion', 'Take OTC decongestants or pain relievers if needed', 'Use honey for sore throat (if over 1 year old)'],
        riskFactors: ['Weakened immune system', 'Season (more common in fall and winter)', 'Close contact with infected individuals', 'Age (children under 6 are at higher risk)']
      });
      
      // Flu indicators
      if (severity > 6 || allSymptoms.includes('body ache') || allSymptoms.includes('muscle') || 
          allSymptoms.includes('fatigue') || allSymptoms.includes('exhaust')) {
        diagnosis.push({
          name: 'Influenza',
          probability: 'Medium',
          description: 'A contagious viral infection that attacks the respiratory system. Unlike the common cold, influenza comes on suddenly and causes more severe symptoms including high fever, body aches, fatigue, and can lead to complications like pneumonia.',
          possibleCauses: ['Influenza A virus', 'Influenza B virus', 'Influenza C virus (less common)'],
          recommendedActions: ['Rest and stay hydrated', 'Take OTC fever reducers like acetaminophen', 'Consider antiviral medications if within 48 hours of symptoms', 'Monitor for worsening symptoms'],
          riskFactors: ['Age (very young and elderly at higher risk)', 'Chronic medical conditions', 'Weakened immune system', 'Pregnancy', 'Obesity']
        });
      }
      
      // COVID indicators
      if (allSymptoms.includes('breath') || allSymptoms.includes('taste') || 
          allSymptoms.includes('smell') || allSymptoms.includes('respiratory')) {
        diagnosis.push({
          name: 'COVID-19',
          probability: 'Medium',
          description: 'A respiratory illness caused by the SARS-CoV-2 virus. Symptoms range from mild to severe and can include fever, cough, shortness of breath, fatigue, loss of taste or smell, and more.',
          possibleCauses: ['Infection with SARS-CoV-2 virus'],
          recommendedActions: ['Get tested for COVID-19', 'Self-isolate to prevent spreading', 'Rest and stay hydrated', 'Monitor oxygen levels if possible', 'Take OTC medications for symptom relief', 'Seek medical attention if symptoms worsen'],
          riskFactors: ['Advanced age', 'Underlying medical conditions', 'Immunocompromised state', 'Obesity', 'Unvaccinated status']
        });
      }
    }
  }
  
  // Stomach issues
  if (allSymptoms.includes('stomach') || allSymptoms.includes('nausea') || 
      allSymptoms.includes('vomit') || allSymptoms.includes('diarrhea') || 
      allSymptoms.includes('digest') || allSymptoms.includes('abdomen')) {
    
    diagnosis.push({
      name: 'Gastroenteritis',
      probability: 'Medium',
      description: 'Also known as stomach flu, this is an inflammation of the lining of the intestines caused by a virus, bacteria, or parasites. Symptoms include watery diarrhea, abdominal cramps, nausea or vomiting, and sometimes fever.',
      possibleCauses: ['Norovirus', 'Rotavirus', 'Food-borne bacteria (E. coli, Salmonella)', 'Consumption of contaminated food or water'],
      recommendedActions: ['Stay hydrated and replace electrolytes', 'Follow the BRAT diet (bananas, rice, applesauce, toast)', 'Rest', 'Avoid dairy, caffeine, and fatty foods'],
      riskFactors: ['Weakened immune system', 'Close contact with infected individuals', 'Consumption of undercooked foods', 'Travel to areas with poor sanitation']
    });
    
    // Acid reflux/GERD indicators
    if (allSymptoms.includes('heartburn') || allSymptoms.includes('acid') || 
        allSymptoms.includes('reflux') || allSymptoms.includes('chest') || 
        allSymptoms.includes('burn')) {
      diagnosis.push({
        name: 'Acid Reflux/GERD',
        probability: 'Medium',
        description: 'A digestive disorder that affects the ring of muscle between the esophagus and stomach, causing stomach acid to flow back into the esophagus, irritating the lining.',
        possibleCauses: ['Weakened lower esophageal sphincter', 'Hiatal hernia', 'Certain foods and beverages', 'Obesity', 'Pregnancy', 'Smoking'],
        recommendedActions: ['Avoid trigger foods (spicy, fatty, acidic)', 'Eat smaller meals', 'Don\'t lie down after eating', 'Elevate head of bed', 'OTC antacids or acid reducers', 'Weight management'],
        riskFactors: ['Obesity', 'Smoking', 'Pregnancy', 'Certain medications', 'Hiatal hernia', 'Delayed stomach emptying']
      });
    }
  }
  
  // Fatigue-related conditions
  if (allSymptoms.includes('tired') || allSymptoms.includes('fatigue') || 
      allSymptoms.includes('exhaust') || allSymptoms.includes('energy') || 
      allSymptoms.includes('weak') || allSymptoms.includes('lethargy')) {
    
    diagnosis.push({
      name: 'Fatigue',
      probability: 'High',
      description: 'Extreme tiredness resulting from mental or physical exertion or illness. Persistent fatigue can interfere with daily activities and may be a symptom of an underlying medical condition.',
      possibleCauses: ['Poor sleep quality or quantity', 'Psychological stress or anxiety', 'Vitamin deficiencies', 'Sedentary lifestyle', 'Medications', 'Underlying medical conditions'],
      recommendedActions: ['Improve sleep hygiene', 'Regular physical activity', 'Stress management techniques', 'Stay hydrated and maintain a balanced diet', 'Consider vitamin B12 and iron levels'],
      riskFactors: ['High-stress lifestyle', 'Poor nutrition', 'Sedentary behavior', 'Chronic illness', 'Sleep disorders']
    });
    
    // Anemia for females
    if (gender.toLowerCase() === 'female') {
      diagnosis.push({
        name: 'Anemia',
        probability: 'Low',
        description: 'A condition where you don\'t have enough healthy red blood cells to carry adequate oxygen to the body\'s tissues. Symptoms include fatigue, weakness, pale skin, shortness of breath, and dizziness.',
        possibleCauses: ['Iron deficiency', 'Vitamin deficiency (B12 or folate)', 'Chronic diseases', 'Inherited blood disorders', 'Blood loss'],
        recommendedActions: ['Get blood tests to confirm diagnosis', 'Iron supplements if iron-deficient', 'Vitamin B12 supplements or injections if deficient', 'Dietary changes to increase iron intake'],
        riskFactors: ['Heavy menstrual periods', 'Pregnancy', 'Vegetarian/vegan diet without proper supplementation', 'Blood donation', 'Certain chronic conditions']
      });
    }
  }
  
  // Add more conditions to improve diagnosis coverage
  
  // Pain conditions
  if (allSymptoms.includes('pain') || allSymptoms.includes('ache') || 
      allSymptoms.includes('hurt') || allSymptoms.includes('sore')) {
    if (allSymptoms.includes('joint') || allSymptoms.includes('arthritis') || 
        allSymptoms.includes('knee') || allSymptoms.includes('elbow') || 
        allSymptoms.includes('wrist') || allSymptoms.includes('ankle')) {
      diagnosis.push({
        name: 'Arthritis',
        probability: age > 50 ? 'Medium' : 'Low',
        description: 'Inflammation of one or more joints, causing pain and stiffness that can worsen with age.',
        possibleCauses: ['Wear and tear on joints (osteoarthritis)', 'Autoimmune disorder (rheumatoid arthritis)', 'Uric acid crystals (gout)', 'Previous joint injury'],
        recommendedActions: ['Over-the-counter pain relievers', 'Physical therapy', 'Regular gentle exercise', 'Hot and cold therapy', 'Weight management to reduce joint stress'],
        riskFactors: ['Age over 50', 'Previous joint injuries', 'Family history', 'Obesity', 'Jobs that stress joints']
      });
    }
    
    if (allSymptoms.includes('back') || allSymptoms.includes('spine') || 
        allSymptoms.includes('lumbar') || allSymptoms.includes('spinal')) {
      diagnosis.push({
        name: 'Back Pain',
        probability: 'Medium',
        description: 'Pain in the back that can range from a dull, constant ache to a sudden, sharp sensation that leaves you incapacitated.',
        possibleCauses: ['Muscle or ligament strain', 'Bulging or ruptured disks', 'Arthritis', 'Skeletal irregularities', 'Osteoporosis'],
        recommendedActions: ['Hot or cold compresses', 'Over-the-counter pain relievers', 'Gentle activity', 'Improve posture', 'Strengthen core muscles', 'Avoid prolonged sitting'],
        riskFactors: ['Age', 'Lack of exercise', 'Excess weight', 'Improper lifting', 'Psychological conditions', 'Smoking']
      });
    }
  }
  
  // Skin conditions
  if (allSymptoms.includes('skin') || allSymptoms.includes('rash') || 
      allSymptoms.includes('itch') || allSymptoms.includes('bump') || 
      allSymptoms.includes('hive') || allSymptoms.includes('dry skin')) {
    diagnosis.push({
      name: 'Dermatitis',
      probability: 'Medium',
      description: 'A general term for skin inflammation. Dermatitis is typically characterized by itchy, dry skin or a rash on swollen, reddened skin.',
      possibleCauses: ['Contact with irritant substances', 'Allergic reactions', 'Underlying health conditions', 'Genetics', 'Environmental factors'],
      recommendedActions: ['Avoid scratching', 'Apply anti-itch creams or lotions', 'Use moisturizers', 'Apply cool wet compresses', 'Identify and avoid triggers'],
      riskFactors: ['History of allergies or asthma', 'Occupational exposure to irritants', 'Dry climate', 'Stress', 'Age (more common in children)']
    });
  }
  
  // Mental health conditions
  if (allSymptoms.includes('anxiety') || allSymptoms.includes('stress') || 
      allSymptoms.includes('worry') || allSymptoms.includes('overwhelm') || 
      allSymptoms.includes('nervous') || allSymptoms.includes('panic')) {
    diagnosis.push({
      name: 'Anxiety',
      probability: 'Medium',
      description: 'Anxiety disorders are characterized by feelings of worry, anxiety, or fear that are strong enough to interfere with daily activities.',
      possibleCauses: ['Stress buildup', 'Traumatic events', 'Medical conditions', 'Genetics', 'Brain chemistry', 'Substance use'],
      recommendedActions: ['Stress management techniques', 'Regular physical activity', 'Adequate sleep', 'Limit caffeine and alcohol', 'Consider counseling or therapy', 'Learn about anxiety management strategies'],
      riskFactors: ['Trauma', 'Stress from illness', 'Family history', 'Personality type', 'Other mental health disorders']
    });
  }
  
  if (allSymptoms.includes('sad') || allSymptoms.includes('depress') || 
      allSymptoms.includes('mood') || allSymptoms.includes('hopeless') || 
      allSymptoms.includes('interest') || allSymptoms.includes('motivation')) {
    diagnosis.push({
      name: 'Depression',
      probability: 'Medium',
      description: 'A mood disorder that causes a persistent feeling of sadness and loss of interest. It affects how you feel, think, and behave and can lead to a variety of emotional and physical problems.',
      possibleCauses: ['Brain chemistry imbalances', 'Hormonal changes', 'Genetic features', 'Biological differences', 'Life events', 'Early childhood trauma'],
      recommendedActions: ['Seek professional help', 'Exercise regularly', 'Establish regular sleep patterns', 'Build strong relationships', 'Participate in activities you enjoy', 'Avoid alcohol and recreational drugs'],
      riskFactors: ['Personal or family history', 'Major life changes or trauma', 'Physical illness or medications', 'Chronic pain', 'Isolation']
    });
  }
  
  // Handle existing conditions
  if (existingConditions.includes('diabetes')) {
    diagnosis.push({
      name: 'Diabetes Management',
      probability: 'High',
      description: 'Ongoing management of diabetes, a chronic condition that affects how your body turns food into energy by regulating blood sugar levels.',
      possibleCauses: ['Type 1 diabetes (autoimmune condition)', 'Type 2 diabetes (insulin resistance)', 'Gestational diabetes (during pregnancy)'],
      recommendedActions: ['Monitor blood glucose levels regularly', 'Take medication as prescribed', 'Maintain a balanced diet', 'Regular physical activity', 'Stay hydrated'],
      riskFactors: ['Family history', 'Obesity', 'Physical inactivity', 'Age (risk increases with age for Type 2)', 'History of gestational diabetes']
    });
  }
  
  if (existingConditions.includes('hypertension') || existingConditions.includes('high blood pressure')) {
    diagnosis.push({
      name: 'Hypertension Management',
      probability: 'High',
      description: 'Ongoing management of high blood pressure, a common condition where the long-term force of the blood against artery walls is high enough to potentially cause health problems like heart disease.',
      possibleCauses: ['Genetics and family history', 'Age (risk increases with age)', 'Unhealthy lifestyle', 'Certain chronic conditions', 'Stress'],
      recommendedActions: ['Regular blood pressure monitoring', 'Take prescribed medications consistently', 'Reduce sodium intake', 'Regular physical activity', 'Maintain healthy weight'],
      riskFactors: ['Family history', 'Age over 65', 'Race (more common in African heritage)', 'Obesity', 'Sedentary lifestyle', 'High sodium diet']
    });
  }
  
  // If no specific conditions matched, provide general health advice
  if (diagnosis.length === 0) {
    diagnosis.push({
      name: 'General Health Assessment',
      probability: 'N/A',
      description: 'Based on the limited information provided, a specific condition cannot be identified. However, this does not mean your symptoms are not important.',
      possibleCauses: ['Various medical conditions', 'Environmental factors', 'Lifestyle factors', 'Psychological factors', 'Normal bodily variations'],
      recommendedActions: ['Keep a symptom journal noting timing, severity, and circumstances', 'Consider if symptoms are related to recent changes in diet, activity, or environment', 'Consult with a healthcare professional for proper evaluation', 'Be prepared to describe your symptoms in detail'],
      riskFactors: ['Depends on specific symptoms and personal health history']
    });
  }
  
  console.log("Generated diagnosis with", diagnosis.length, "conditions");
  return diagnosis;
}

const server = http.createServer((request, response) => {
  console.log(`Request: ${request.method} ${request.url}`);
  
  // Handle API requests first
  if (handleApiRequest(request, response)) {
    return;
  }
  
  // Serve index.html for root requests
  let filePath = request.url === '/' ? 
    path.join(__dirname, 'index.html') : 
    path.join(__dirname, request.url);
  
  // Get the file extension
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // If the file doesn't exist, try using the dist directory
        const distPath = path.join(__dirname, 'dist', request.url.replace(/^\//, ''));
        
        fs.readFile(distPath, (err, distContent) => {
          if (err) {
            // If still not found, serve the index.html (for SPA routing)
            response.writeHead(200, { 'Content-Type': 'text/html' });
            fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
              if (err) {
                response.writeHead(404);
                response.end('404 Not Found');
                return;
              }
              response.end(indexContent);
            });
          } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(distContent);
          }
        });
      } else {
        // Server error
        response.writeHead(500);
        response.end('Internal Server Error');
      }
    } else {
      // Success - serve the file
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Health diagnosis API available at http://localhost:${PORT}/api/diagnose`);
}); 