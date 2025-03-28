import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDiagnosisFromDeepSeek, isDeepSeekEnabled } from './deepseek-integration.js';
import { getChatResponseFromDeepSeek, isDeepSeekChatEnabled } from './chat-integration.js';

// Load environment variables
dotenv.config();

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Setup basic logging
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // In production, also log to file
  if (isProduction) {
    try {
      fs.appendFileSync('server.log', logMessage + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }
}

// Error logging
function logError(message, error) {
  log(`${message}: ${error.message}`, 'error');
  if (error.stack) {
    log(`Stack trace: ${error.stack}`, 'error');
  }
}

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
  // Skip API handling for root path
  if (request.url === '/' || request.url === '') {
    return false;
  }
  
  // Skip API handling for static file requests
  if (request.url.includes('.') && !request.url.startsWith('/api/')) {
    return false;
  }
  
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

  // Only handle API routes
  if (!request.url.startsWith('/api/')) {
    return false;
  }

  if (request.method === 'POST' && request.url === '/api/diagnose') {
    let body = '';
    
    request.on('data', chunk => {
      body += chunk.toString();
    });
    
    request.on('end', async () => {
      try {
        log('Received diagnosis request');
        
        const data = JSON.parse(body);
        const prompt = data.prompt;
        
        if (!prompt) {
          log('Missing diagnosis prompt in request', 'error');
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Missing diagnosis prompt' }));
          return;
        }
        
        log(`Diagnosis prompt length: ${prompt.length} characters`);
        log(`DeepSeek API enabled: ${isDeepSeekEnabled()}`);
        
        // First try to use DeepSeek API if configured
        let diagnosisResults = null;
        let apiPowered = false;
        
        if (isDeepSeekEnabled()) {
          log('Attempting to use DeepSeek API...');
          try {
            // Use a timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DeepSeek API request timed out after 30 seconds')), 30000)
            );
            
            const apiPromise = getDiagnosisFromDeepSeek(prompt);
            
            // Race between API call and timeout
            diagnosisResults = await Promise.race([apiPromise, timeoutPromise]);
            apiPowered = diagnosisResults !== null;
            log(`DeepSeek API successful: ${apiPowered}`);
          } catch (apiError) {
            logError('Error using DeepSeek API', apiError);
          }
        }
        
        // Fall back to the rule-based approach if DeepSeek fails or is not configured
        if (!diagnosisResults) {
          log('Using rule-based diagnosis processing');
          diagnosisResults = processHealthPrompt(prompt);
        }
        
        // Return the results
        const responseData = {
          success: true,
          diagnosisResults,
          aiPowered: apiPowered,
          timestamp: new Date().toISOString()
        };
        
        log(`Returning diagnosis with ${diagnosisResults.length} conditions, AI-powered: ${apiPowered}`);
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(responseData));
      } catch (error) {
        logError('Error processing diagnosis request', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
          error: 'Internal server error',
          message: isProduction ? 'An error occurred processing your request' : error.message 
        }));
      }
    });
    
    return true; // Request handled
  }
  
  if (request.method === 'POST' && request.url === '/api/chat') {
    let body = '';
    
    log('Chat API endpoint called - beginning to process request');
    
    // Set CORS headers specifically for chat API
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    request.on('data', chunk => {
      body += chunk.toString();
      log(`Received chunk of data, total size so far: ${body.length} bytes`);
    });
    
    request.on('end', async () => {
      log('Finished receiving data from client');
      try {
        log(`Received chat request, body length: ${body.length}`);
        
        if (!body || body.trim() === '') {
          log('Empty request body received', 'error');
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Empty request body', 
            message: 'Request body cannot be empty' 
          }));
          return;
        }
        
        try {
          const data = JSON.parse(body);
          
          const { message, history } = data;
          
          if (!message) {
            log('Missing chat message in request', 'error');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Missing chat message' }));
            return;
          }
          
          log(`Chat message length: ${message.length} characters`);
          log(`DeepSeek Chat API enabled: ${isDeepSeekChatEnabled()}`);
          
          // Use DeepSeek Chat API
          let chatResponse = '';
          
          try {
            log('Preparing to call DeepSeek API');
            
            // Implement retry logic with longer timeout
            const maxRetries = 1; // Try up to 2 times (initial + 1 retry)
            const timeoutMs = 30000; // 30 seconds timeout
            
            // Function to attempt the API call with timeout
            const attemptApiCall = async (attempt = 0) => {
              log(`API call attempt ${attempt + 1}/${maxRetries + 1}`);
              
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
                  log(`Attempt ${attempt + 1} failed, retrying... Error: ${error.message}`);
                  return attemptApiCall(attempt + 1);
                }
                throw error; // Re-throw if we've exhausted retries
              }
            };
            
            // Start the retry process
            chatResponse = await attemptApiCall();
            log(`Chat response received, length: ${chatResponse.length}`);
          } catch (apiError) {
            logError('Error using DeepSeek Chat API', apiError);
            
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
          
          log('Sending response back to client');
          response.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          response.end(JSON.stringify(responseData));
          log('Response sent successfully');
        } catch (parseError) {
          logError('JSON parsing error', parseError);
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Invalid JSON', 
            message: parseError.message 
          }));
        }
      } catch (error) {
        logError('Error processing chat request', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
          error: 'Internal server error',
          message: isProduction ? 'An error occurred processing your request' : error.message 
        }));
      }
    });
    
    return true; // Request handled
  }
  
  return false; // Request not handled
}

// Process health prompt and return diagnosis (simulated AI response)
function processHealthPrompt(prompt) {
  log('Processing health diagnosis prompt');
  
  // Extract key information from the prompt with more robust regex patterns
  const ageMatch = prompt.match(/Age: (.*?)($|\n)/);
  const age = ageMatch ? ageMatch[1].trim() : 'Not provided';
  
  const genderMatch = prompt.match(/Gender: (.*?)($|\n)/);
  const gender = genderMatch ? genderMatch[1].trim() : 'Not provided';
  
  // Improve symptom extraction with more flexible pattern
  const symptomsMatch = prompt.match(/Patient description: (.*?)($|\n|Symptoms Information|Medical History)/s);
  const symptoms = symptomsMatch ? symptomsMatch[1].trim().toLowerCase() : '';
  
  // Fix the selected symptoms regex to handle the end of the section properly
  const selectedSymptomsMatch = prompt.match(/Selected symptoms: (.*?)(\.|\n|$)/);
  const selectedSymptoms = selectedSymptomsMatch 
    ? selectedSymptomsMatch[1].split(', ').map(s => s.trim().toLowerCase())
    : [];
  
  const severityMatch = prompt.match(/Severity level \(1-10\): (.*?)($|\n)/);
  const severity = severityMatch ? parseInt(severityMatch[1].trim()) : 5;
  
  const existingConditionsMatch = prompt.match(/Existing conditions: (.*?)(\.|\n|$)/);
  const existingConditions = existingConditionsMatch 
    ? existingConditionsMatch[1].split(', ').map(c => c.trim().toLowerCase())
    : [];
  
  // Generate basic diagnosis based on symptoms
  const diagnosis = [];
  
  // Create an enhanced symptoms string that includes both free text and selected symptoms
  const allSymptoms = symptoms + ' ' + selectedSymptoms.join(' ');
  
  // Example: For headache symptoms
  if (allSymptoms.includes('headache') || allSymptoms.includes('migraine')) {
    diagnosis.push({
      name: 'Tension Headache',
      probability: 'Medium',
      description: 'A common type of headache characterized by a dull pain or pressure around the forehead.',
      possibleCauses: ['Stress', 'Poor posture', 'Eye strain', 'Dehydration'],
      recommendedActions: ['Over-the-counter pain relievers', 'Rest', 'Stay hydrated'],
      riskFactors: ['Stress', 'Poor posture', 'Sleep issues']
    });
  }
  
  // For cold/flu symptoms
  if (allSymptoms.includes('cough') || allSymptoms.includes('fever') || 
      allSymptoms.includes('sore throat') || allSymptoms.includes('congestion')) {
    diagnosis.push({
      name: 'Common Cold',
      probability: 'High',
      description: 'A viral infection of the upper respiratory tract with symptoms including cough, sore throat, and congestion.',
      possibleCauses: ['Rhinovirus', 'Coronavirus (common cold variety)', 'Other respiratory viruses'],
      recommendedActions: ['Rest', 'Stay hydrated', 'Over-the-counter cold medications'],
      riskFactors: ['Exposure to sick individuals', 'Weakened immune system']
    });
  }
  
  // If no specific conditions matched, provide general health advice
  if (diagnosis.length === 0) {
    diagnosis.push({
      name: 'General Health Assessment',
      probability: 'N/A',
      description: 'Based on the information provided, a specific condition cannot be identified.',
      possibleCauses: ['Various factors', 'Insufficient information to determine'],
      recommendedActions: ['Consult with a healthcare professional', 'Monitor symptoms'],
      riskFactors: ['Depends on specific symptoms and health history']
    });
  }
  
  log(`Generated diagnosis with ${diagnosis.length} conditions`);
  return diagnosis;
}

const server = http.createServer((request, response) => {
  log(`Request: ${request.method} ${request.url}`);
  
  // First, try to handle as an API request
  const isApiRequest = handleApiRequest(request, response);
  if (isApiRequest) {
    log(`Handled as API request: ${request.url}`);
    return;
  }
  
  // If it's not an API request, serve static files
  log(`Handling as static file request: ${request.url}`);
  
  // Parse the URL to get the pathname
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
        // File not found, try index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
          if (err) {
            log(`File not found and cannot serve index.html: ${filePath}`, 'error');
            response.writeHead(404);
            response.end('404 - Not Found');
            return;
          }
          log(`Serving index.html for SPA routing: ${request.url}`);
          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end(indexContent);
        });
      } else {
        // Server error
        logError(`Error serving file: ${filePath}`, error);
        response.writeHead(500);
        response.end('500 - Internal Server Error');
      }
    } else {
      // Success - serve the file
      log(`Serving file: ${filePath}, type: ${contentType}`);
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content);
    }
  });
});

// Error handling for the server
server.on('error', (error) => {
  logError('Server error', error);
  if (error.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use. Please choose a different port.`, 'error');
    process.exit(1);
  }
});

// Start the server
server.listen(PORT, () => {
  log(`Server running at http://localhost:${PORT}/`);
  log(`Health diagnosis API available at http://localhost:${PORT}/api/diagnose`);
  log(`Chat API available at http://localhost:${PORT}/api/chat`);
  
  log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
}); 