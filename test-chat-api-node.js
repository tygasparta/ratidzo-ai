/**
 * Test script to verify the chat API connection using Node.js
 */

import fetch from 'node-fetch';

// Make a direct POST request to the chat API
console.log('Sending test request to chat API...');

fetch('http://localhost:5173/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Hello, this is a test message',
    history: []
  })
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response status text:', response.statusText);
  
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  console.log('Success! Response data:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
}); 