import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDiagnosisFromDeepSeek, isDeepSeekEnabled } from './deepseek-integration.js';
import { getChatResponseFromDeepSeek, isDeepSeekChatEnabled } from './chat-integration.js';

// Load environment variables
dotenv.config();

// Determine environment and configuration
const isProduction = process.env.NODE_ENV === 'production';
const DOMAIN = process.env.DOMAIN || 'ratidzo.com';
const PORT = process.env.PORT || 3000;
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10);

// Get allowed origins from env or set defaults for CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    [`https://${DOMAIN}`, `https://www.${DOMAIN}`, 'http://localhost:3000'];

// Setup enhanced logging
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // In production, optionally log to file
  if (isProduction && LOG_TO_FILE) {
    try {
      fs.appendFileSync('server.log', logMessage + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }
}

// Error logging with more detail
function logError(message, error) {
  log(`${message}: ${error.message}`, 'error');
  if (error.stack) {
    log(`Stack trace: ${error.stack}`, 'error');
  }
}

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define MIME types for static file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf'
};

// CORS handling function
function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  
  // Check if the origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default to the first allowed origin if no match (more restrictive in production)
    response.setHeader('Access-Control-Allow-Origin', isProduction ? ALLOWED_ORIGINS[0] : '*');
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

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
  
  // Set CORS headers for all API responses
  setCorsHeaders(request, response);
  
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
              setTimeout(() => reject(new Error(`DeepSeek API request timed out after ${API_TIMEOUT/1000} seconds`)), API_TIMEOUT)
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
    let requestTimer = null;
    
    log('Chat API endpoint called - beginning to process request');
    
    // Set a timeout for the entire request to prevent hanging
    requestTimer = setTimeout(() => {
      log('Request timeout occurred for chat API', 'error');
      response.writeHead(503, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ 
        error: 'Service unavailable', 
        message: 'Request timed out. Please try again later.' 
      }));
    }, API_TIMEOUT + 5000); // Add 5 seconds to the API timeout for request handling

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
          clearTimeout(requestTimer);
          return;
        }
        
        try {
          const data = JSON.parse(body);
          
          const { message, history } = data;
          
          if (!message) {
            log('Missing chat message in request', 'error');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Missing chat message' }));
            clearTimeout(requestTimer);
            return;
          }
          
          log(`Chat message length: ${message.length} characters`);
          log(`DeepSeek Chat API enabled: ${isDeepSeekChatEnabled()}`);
          
          // Use DeepSeek Chat API
          let chatResponse = '';
          
          try {
            log('Preparing to call DeepSeek API');
            
            // Implement retry logic with configurable timeout
            const maxRetries = 1; // Try up to 2 times (initial + 1 retry)
            
            // Function to attempt the API call with timeout
            const attemptApiCall = async (attempt = 0) => {
              log(`API call attempt ${attempt + 1}/${maxRetries + 1}`);
              
              try {
                // Use a timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error(`DeepSeek Chat API request timed out after ${API_TIMEOUT/1000} seconds`)), API_TIMEOUT)
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
              chatResponse = "I apologize, but I'm currently experiencing technical difficulties. Our team has been notified. Please try again later or contact support if the issue persists.";
            }
          }
          
          // Respond to the client
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            response: chatResponse || "I'm sorry, I couldn't process your request at this time.",
            timestamp: new Date().toISOString()
          }));
          
          clearTimeout(requestTimer);
        } catch (jsonError) {
          logError('Error parsing JSON from chat request', jsonError);
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ 
            error: 'Invalid JSON', 
            message: 'The request body contains invalid JSON' 
          }));
          clearTimeout(requestTimer);
        }
      } catch (error) {
        logError('Error processing chat request', error);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ 
          error: 'Internal server error',
          message: isProduction ? 'An error occurred processing your request' : error.message 
        }));
        clearTimeout(requestTimer);
      }
    });
    
    // Handle client disconnect
    request.on('close', () => {
      log('Client disconnected before response could be sent', 'warn');
      clearTimeout(requestTimer);
    });
    
    // Handle request errors
    request.on('error', (error) => {
      logError('Error in chat request', error);
      clearTimeout(requestTimer);
    });
    
    return true; // Request handled
  }

  // Add health check endpoint
  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
      version: '1.0.0'
    }));
    return true;
  }
  
  // If we got here, no API endpoint matched
  if (request.url.startsWith('/api/')) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'API endpoint not found' }));
    return true;
  }
  
  return false; // Not an API request
}

// Simplified health prompt processing (fallback when API is not available)
function processHealthPrompt(prompt) {
  log('Processing health prompt with rule-based system');
  return [
    {
      condition: "General Health Inquiry",
      description: "Based on the information provided, this appears to be a general health question. Please consult with a qualified healthcare professional for personalized advice.",
      confidence: 0.85,
      recommendations: [
        "Consult with a healthcare provider for a proper diagnosis",
        "Provide more specific symptoms for a more detailed analysis",
        "Consider visiting a medical facility if symptoms are severe or worsening"
      ]
    }
  ];
}

// Create the HTTP server
const server = http.createServer(async (request, response) => {
  const startTime = Date.now();
  const clientIP = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  
  log(`${request.method} ${request.url} from ${clientIP}`);
  
  try {
    // Check if this is an API request
    const isApiRequest = await handleApiRequest(request, response);
    if (isApiRequest) {
      const duration = Date.now() - startTime;
      log(`API request handled in ${duration}ms`);
      return;
    }
    
    // Handle static file requests
    let filePath = path.join(__dirname, request.url === '/' ? 'index.html' : request.url);
    
    // Security check to prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
      log(`Security violation: attempted path traversal with ${request.url}`, 'error');
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Serve the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // No such file, try index.html (for SPA routing)
          fs.readFile(path.join(__dirname, 'index.html'), (indexError, indexContent) => {
            if (indexError) {
              response.writeHead(404);
              response.end('404 Not Found');
              log(`File not found: ${filePath}`, 'error');
            } else {
              response.writeHead(200, { 'Content-Type': 'text/html' });
              response.end(indexContent, 'utf-8');
              const duration = Date.now() - startTime;
              log(`Served index.html for ${request.url} in ${duration}ms (SPA routing)`);
            }
          });
        } else {
          response.writeHead(500);
          response.end('500 Server Error');
          logError(`Error serving ${filePath}`, error);
        }
      } else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
        const duration = Date.now() - startTime;
        log(`Served ${filePath} in ${duration}ms`);
      }
    });
  } catch (error) {
    logError('Unhandled server error', error);
    if (!response.headersSent) {
      response.writeHead(500);
      response.end('500 Server Error');
    }
  }
});

// Handle server errors
server.on('error', (error) => {
  logError('Server error', error);
  if (error.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use. Please try a different port.`, 'error');
    process.exit(1);
  }
});

// Start the server
server.listen(PORT, () => {
  log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  log(`Visit http://localhost:${PORT} to view the application`);
  
  if (isProduction) {
    log(`Allowed origins for CORS: ${ALLOWED_ORIGINS.join(', ')}`);
    log(`API timeout set to ${API_TIMEOUT/1000} seconds`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  log('Server shutting down...', 'info');
  server.close(() => {
    log('Server terminated', 'info');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logError('Uncaught exception', error);
  // In production, we might want to keep the server running despite uncaught exceptions
  if (!isProduction) {
    process.exit(1);
  }
}); 