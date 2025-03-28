import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDiagnosisFromDeepSeek, isDeepSeekEnabled } from './deepseek-integration.js';
import { getChatResponseFromDeepSeek, isDeepSeekChatEnabled } from './chat-integration.js';

// Load environment variables
dotenv.config();

// Setup debug logging
const DEBUG = true;
const logDebug = (message) => {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG][${timestamp}] ${message}`);
    // Also log to file
    fs.appendFileSync('logs/server-debug.log', `[${timestamp}] ${message}\n`);
  }
};

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
  logDebug(`API Request: ${request.method} ${request.url}`);
  
  // Skip API handling for root path
  if (request.url === '/' || request.url === '') {
    logDebug('Skipping API handling for root path');
    return false;
  }
  
  // Skip API handling for static file requests
  if (request.url.includes('.') && !request.url.startsWith('/api/')) {
    logDebug(`Skipping API handling for static file: ${request.url}`);
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
    logDebug('Handled OPTIONS preflight request');
    return true;
  }

  // Only handle API routes
  if (!request.url.startsWith('/api/')) {
    logDebug(`Not an API request: ${request.url}`);
    return false;
  }

  if (request.method === 'POST' && request.url === '/api/diagnose') {
    let body = '';
    
    request.on('data', chunk => {
      body += chunk.toString();
      logDebug(`Received data chunk for diagnose API, size: ${chunk.length}`);
    });
    
    request.on('end', async () => {
      try {
        logDebug('Received diagnosis request');
        
        const data = JSON.parse(body);
        const prompt = data.prompt;
        
        if (!prompt) {
          logDebug('Missing diagnosis prompt in request');
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Missing diagnosis prompt' }));
          return;
        }
        
        logDebug(`Diagnosis prompt length: ${prompt.length} characters`);
        logDebug(`DeepSeek API enabled: ${isDeepSeekEnabled()}`);
        
        // First try to use DeepSeek API if configured
        let diagnosisResults = null;
        let apiPowered = false;
        
        if (isDeepSeekEnabled()) {
          logDebug('Attempting to use DeepSeek API...');
          try {
            // Use a timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DeepSeek API request timed out')), 15000)
            );
            
            const apiPromise = getDiagnosisFromDeepSeek(prompt);
            
            // Race between API call and timeout
            diagnosisResults = await Promise.race([apiPromise, timeoutPromise]);
            apiPowered = diagnosisResults !== null;
            logDebug(`DeepSeek API successful: ${apiPowered}`);
          } catch (apiError) {
            logDebug(`Error using DeepSeek API: ${apiError.message}`);
            console.error('Error using DeepSeek API:', apiError);
          }
        }
        
        // Fall back to the rule-based approach if DeepSeek fails or is not configured
        if (!diagnosisResults) {
          logDebug('Using rule-based diagnosis processing');
          diagnosisResults = processHealthPrompt(prompt);
        }
        
        // Return the results
        const responseData = {
          success: true,
          diagnosisResults,
          aiPowered: apiPowered,
          timestamp: new Date().toISOString()
        };
        
        logDebug(`Returning diagnosis with ${diagnosisResults.length} conditions, AI-powered: ${apiPowered}`);
        
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(responseData));
      } catch (error) {
        logDebug(`Error processing diagnosis request: ${error.message}`);
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
    
    logDebug('Chat API endpoint called - beginning to process request');
    logDebug(`Request headers: ${JSON.stringify(request.headers)}`);
    
    // Set CORS headers specifically for chat API
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    request.on('data', chunk => {
      body += chunk.toString();
      logDebug(`Received chunk of data for chat API, total size so far: ${body.length} bytes`);
    });
    
    request.on('end', async () => {
      logDebug('Finished receiving data from client for chat API');
      try {
        logDebug(`Received chat request, body length: ${body.length}`);
        
        if (!body || body.trim() === '') {
          logDebug('Empty request body received for chat API');
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Empty request body', 
            message: 'Request body cannot be empty' 
          }));
          return;
        }
        
        try {
          const data = JSON.parse(body);
          logDebug(`Parsed JSON data for chat API: ${JSON.stringify(data).substring(0, 200) + '...'}`);
          
          const { message, history } = data;
          
          if (!message) {
            logDebug('Missing chat message in request');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Missing chat message' }));
            return;
          }
          
          logDebug(`Chat message length: ${message.length} characters`);
          logDebug(`DeepSeek Chat API enabled: ${isDeepSeekChatEnabled()}`);
          
          // Use DeepSeek Chat API
          let chatResponse = '';
          
          try {
            logDebug('Preparing to call DeepSeek API for chat');
            
            // Implement retry logic with longer timeout
            const maxRetries = 1; // Try up to 2 times (initial + 1 retry)
            const timeoutMs = 30000; // Increased from 15000 to 30000 (30 seconds)
            
            // Function to attempt the API call with timeout
            const attemptApiCall = async (attempt = 0) => {
              logDebug(`API call attempt ${attempt + 1}/${maxRetries + 1}`);
              
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
                  logDebug(`Attempt ${attempt + 1} failed, retrying... Error: ${error.message}`);
                  return attemptApiCall(attempt + 1);
                }
                throw error; // Re-throw if we've exhausted retries
              }
            };
            
            // Start the retry process
            chatResponse = await attemptApiCall();
            logDebug(`Chat response received, length: ${chatResponse.length}`);
          } catch (apiError) {
            logDebug(`Error using DeepSeek Chat API: ${apiError.message}`);
            logDebug(`Error stack: ${apiError.stack}`);
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
          
          logDebug('Sending chat response back to client');
          response.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          response.end(JSON.stringify(responseData));
        } catch (jsonError) {
          logDebug(`Error parsing JSON from chat request: ${jsonError.message}`);
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Invalid JSON', 
            message: jsonError.message 
          }));
        }
      } catch (error) {
        logDebug(`Error processing chat request: ${error.message}`);
        console.error('Error processing chat request:', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
          error: 'Internal server error',
          message: error.message 
        }));
      }
    });
    
    return true; // Request handled
  }
  
  return false; // Request not handled by this function
}

// Simple rule-based health diagnosis function
function processHealthPrompt(prompt) {
  logDebug('Processing health prompt with rule-based system');
  // ... rest of the function as is
  return []; // Placeholder for demo
}

// Create HTTP server
const server = http.createServer((request, response) => {
  logDebug(`Received request: ${request.method} ${request.url}`);
  
  // First, try to handle as an API request
  const isApiRequest = handleApiRequest(request, response);
  if (isApiRequest) {
    logDebug(`Handled as API request: ${request.url}`);
    return;
  }
  
  // If it's not an API request, serve static files
  logDebug(`Handling as static file request: ${request.url}`);
  
  // Parse the URL to get the pathname
  let filePath = `.${request.url}`;
  
  // Default to index.html if the URL is just '/'
  if (filePath === './') {
    filePath = './index.html';
    logDebug(`Using default index.html for root path`);
  }
  
  // Get the absolute file path
  const absolutePath = path.resolve(filePath);
  logDebug(`Absolute file path: ${absolutePath}`);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      logDebug(`File does not exist: ${filePath}, error: ${err.code}`);
    } else {
      logDebug(`File exists: ${filePath}`);
    }
  });
  
  // Get the file extension to determine content type
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  logDebug(`File extension: ${extname}, Content type: ${contentType}`);
  
  // Read the file
  logDebug(`Attempting to read file: ${filePath}`);
  fs.readFile(filePath, (error, content) => {
    if (error) {
      logDebug(`Error reading file ${filePath}: ${error.code}, ${error.message}`);
      
      if (error.code === 'ENOENT') {
        // File not found
        logDebug(`File not found: ${filePath}, looking for 404.html`);
        fs.readFile('./404.html', (err, content) => {
          if (err) {
            // If 404 page is also not found, send a simple error message
            logDebug('404 page not found, sending generic response');
            response.writeHead(404);
            response.end('404 - File Not Found');
          } else {
            // Send 404 page
            logDebug('Serving 404 page');
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end(content);
          }
        });
      } else {
        // Server error
        logDebug(`Server error: ${error.code}, ${error.message}`);
        response.writeHead(500);
        response.end(`Internal Server Error: ${error.code} - ${error.message}`);
      }
    } else {
      // Success - serve the file
      logDebug(`Successfully read file: ${filePath}, size: ${content.length} bytes`);
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content);
      logDebug(`File ${filePath} sent to client`);
    }
  });
});

server.listen(PORT, () => {
  logDebug(`Server running at http://localhost:${PORT}/`);
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Health diagnosis API available at http://localhost:${PORT}/api/diagnose`);
  console.log(`Chat API available at http://localhost:${PORT}/api/chat`);
}); 