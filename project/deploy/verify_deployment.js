/**
 * Ratidzo Health AI - Deployment Verification Script
 * 
 * This script tests the deployed application by making API requests
 * to verify that the server is functioning correctly.
 * 
 * Usage: 
 *   node verify_deployment.js https://ratidzo.com
 */

const https = require('https');
const http = require('http');

// Get the target URL from command line arguments
const targetUrl = process.argv[2] || 'http://localhost:3000';
const isHttps = targetUrl.startsWith('https://');
const client = isHttps ? https : http;

console.log(`=== Ratidzo Health AI - Deployment Verification ===`);
console.log(`Testing deployment at: ${targetUrl}`);

// Test the health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\nTesting Health Endpoint...');
    
    const options = {
      method: 'GET',
      path: '/api/health'
    };
    
    const req = createRequest('/api/health', 'GET', null, (statusCode, data) => {
      if (statusCode === 200) {
        console.log('✅ Health endpoint is working');
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);
        resolve(true);
      } else {
        console.log(`❌ Health endpoint failed with status: ${statusCode}`);
        if (data) console.log(`Response: ${JSON.stringify(data)}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error connecting to health endpoint: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// Test the chat endpoint
function testChatEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\nTesting Chat Endpoint...');
    
    const requestData = {
      message: "Hello, I'd like to know about common cold symptoms.",
      history: []
    };
    
    const req = createRequest('/api/chat', 'POST', requestData, (statusCode, data) => {
      if (statusCode === 200) {
        console.log('✅ Chat endpoint is working');
        console.log(`Response length: ${data.response ? data.response.length : 0} characters`);
        console.log(`First 100 chars: ${data.response ? data.response.substring(0, 100) + '...' : 'No response'}`);
        resolve(true);
      } else {
        console.log(`❌ Chat endpoint failed with status: ${statusCode}`);
        if (data) console.log(`Response: ${JSON.stringify(data)}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error connecting to chat endpoint: ${error.message}`);
      resolve(false);
    });
    
    if (requestData) {
      req.write(JSON.stringify(requestData));
    }
    
    req.end();
  });
}

// Test accessing static files
function testStaticFiles() {
  return new Promise((resolve, reject) => {
    console.log('\nTesting Static File Access...');
    
    const filesToTest = ['/', '/index.html', '/css/main.css', '/js/main.js'];
    const results = [];
    
    let completed = 0;
    
    filesToTest.forEach((file, index) => {
      const req = createRequest(file, 'GET', null, (statusCode, data) => {
        const success = statusCode === 200;
        results[index] = {
          file,
          success,
          statusCode
        };
        
        if (success) {
          console.log(`✅ Successfully accessed ${file}`);
        } else {
          console.log(`❌ Failed to access ${file}: Status ${statusCode}`);
        }
        
        completed++;
        if (completed === filesToTest.length) {
          const allSuccessful = results.every(r => r.success);
          console.log(`\nStatic file test ${allSuccessful ? 'passed' : 'failed'}`);
          resolve(allSuccessful);
        }
      });
      
      req.on('error', (error) => {
        console.log(`❌ Error accessing ${file}: ${error.message}`);
        results[index] = {
          file,
          success: false,
          error: error.message
        };
        
        completed++;
        if (completed === filesToTest.length) {
          resolve(false);
        }
      });
      
      req.end();
    });
  });
}

// Helper function to create a request
function createRequest(path, method, data, callback) {
  const urlObj = new URL(path, targetUrl);
  
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || (isHttps ? 443 : 80),
    path: urlObj.pathname,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Ratidzo-Health-Verification/1.0'
    }
  };
  
  if (data) {
    options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
  }
  
  const req = client.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      let parsedData;
      try {
        parsedData = responseData ? JSON.parse(responseData) : null;
      } catch (e) {
        parsedData = responseData;
      }
      callback(res.statusCode, parsedData);
    });
  });
  
  return req;
}

// Run all tests
async function runTests() {
  console.log('\nStarting verification tests...');
  
  const healthResult = await testHealthEndpoint();
  const staticResult = await testStaticFiles();
  const chatResult = await testChatEndpoint();
  
  console.log('\n=== Verification Test Results ===');
  console.log(`Health API Test: ${healthResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Static Files Test: ${staticResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Chat API Test: ${chatResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  const overallResult = healthResult && staticResult && chatResult;
  
  console.log(`\nOverall Deployment Status: ${overallResult ? '✅ OPERATIONAL' : '❌ ISSUES DETECTED'}`);
  
  if (!overallResult) {
    console.log('\nTroubleshooting suggestions:');
    if (!healthResult) console.log('- Check if the server is running and the /api/health endpoint is implemented');
    if (!staticResult) console.log('- Verify file permissions and paths in your cPanel environment');
    if (!chatResult) console.log('- Check if the DeepSeek API key is properly configured in your .env file');
    console.log('- Review server logs for more detailed error information');
  }
  
  console.log('\nVerification completed.');
}

// Run all tests
runTests(); 