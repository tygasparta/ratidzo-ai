/**
 * Test script to verify the chat API connection
 */

// Make a direct POST request to the chat API
fetch('http://localhost:3000/api/chat', {
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
  console.log('Response headers:', response.headers);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('Success! Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
}); 