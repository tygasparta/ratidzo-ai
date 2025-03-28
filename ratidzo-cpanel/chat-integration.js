/**
 * DeepSeek AI Chat Integration for Ratidzo Health AI
 * This module provides functions to interact with DeepSeek's AI chat models
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const USE_DEEPSEEK_API = process.env.USE_DEEPSEEK_API === 'true';

/**
 * Call the DeepSeek API with user chat message and chat history
 * @param {string} message - The user's chat message
 * @param {Array} history - Array of previous chat messages
 * @returns {Promise<string>} - AI assistant's response
 */
export async function getChatResponseFromDeepSeek(message, history = []) {
  // Always log the message, even if we'll use a fallback
  console.log('Chat message received:', message);
  
  if (!USE_DEEPSEEK_API) {
    console.log('DeepSeek API is disabled in configuration. Using fallback response.');
    return getFallbackResponse(message);
  }
  
  if (!DEEPSEEK_API_KEY) {
    console.log('DeepSeek API key is missing. Check your .env file. Using fallback response.');
    return getFallbackResponse(message);
  }

  try {
    console.log('Calling DeepSeek API for chat with key:', DEEPSEEK_API_KEY.substring(0, 5) + '...');
    console.log('Using DeepSeek API URL:', DEEPSEEK_API_URL);
    
    const systemPrompt = `
You are an AI health assistant for Ratidzo Health AI, a medical information platform. 
Your primary goal is to provide general health information, guidance, and educational content to users.

Guidelines:
1. Be informative, helpful, and compassionate in your responses.
2. Explain health concepts clearly in simple, non-technical language.
3. Suggest general wellness advice and preventive healthcare measures when appropriate.
4. Always emphasize the importance of consulting healthcare professionals for diagnosis, treatment, or medical emergencies.
5. Do not diagnose specific conditions, prescribe medications, or provide personalized medical advice.
6. If asked about symptoms requiring immediate medical attention, advise users to seek emergency care.
7. Maintain a professional yet warm tone.
8. Your answers should be accurate, evidence-based, and free from bias.
9. If uncertain about information, acknowledge limitations rather than guessing.
10. Focus on providing educational information about health topics, nutrition, exercise, mental health, and general wellness.

Remember to include an appropriate disclaimer when discussing sensitive medical topics.
`;

    // Format messages for the API
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    
    // Add chat history (limited to prevent token limit issues)
    if (history && history.length > 0) {
      // Add up to 5 previous messages for context
      const limitedHistory = history.slice(-5);
      messages.push(...limitedHistory);
    }
    
    // Add the current user message
    messages.push({ role: "user", content: message });

    console.log(`Sending chat request with ${messages.length} messages`);

    // Make the API request
    console.log('Sending request to DeepSeek API...');
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    console.log('DeepSeek API response status:', response.status, response.statusText);
    
    // Parse the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API raw response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format from DeepSeek API:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from DeepSeek API');
    }
    
    const content = data.choices[0].message.content;
    console.log('DeepSeek API response received:', content.substring(0, 100) + '...');
    
    return content;
  } catch (error) {
    console.error('DeepSeek Chat API Error:', error);
    console.error('Error stack:', error.stack);
    return getFallbackResponse(message);
  }
}

/**
 * Provide a fallback response when the DeepSeek API is unavailable
 * @param {string} message - The user's message
 * @returns {string} - Fallback response
 */
function getFallbackResponse(message) {
  console.log('Using fallback response for message:', message);
  
  // Default fallback message
  let response = "I'm sorry, but our AI health assistant is currently unavailable. Please try again later, or contact a healthcare professional if you have urgent health concerns.";
  
  // Check for certain keywords to provide more specific fallback responses
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('emergency') || 
      lowerMessage.includes('urgent') || 
      lowerMessage.includes('pain') || 
      lowerMessage.includes('heart attack') || 
      lowerMessage.includes('stroke')) {
    response = "If you're experiencing a medical emergency, please call emergency services immediately or go to your nearest emergency room. Our chat service is not designed to address urgent medical situations.";
  } else if (lowerMessage.includes('hello') || 
             lowerMessage.includes('hi') || 
             lowerMessage.includes('hey')) {
    response = "Hello! I'm the Ratidzo Health Assistant. While I'm experiencing some technical difficulties connecting to our AI system, I'd be happy to assist you when I'm back online. In the meantime, you can explore other features of our platform or try again later.";
  } else if (lowerMessage.includes('thank')) {
    response = "You're welcome! I'm currently experiencing some connection issues with our AI system, but I appreciate your understanding. Please feel free to reach out again later when our services are fully operational.";
  } else if (lowerMessage.includes('symptom') || 
             lowerMessage.includes('sick') || 
             lowerMessage.includes('ill') || 
             lowerMessage.includes('feel')) {
    response = "I understand you might be concerned about your health symptoms. While I'm experiencing technical difficulties at the moment, I encourage you to try our symptom checker feature on the homepage, or consult with a healthcare professional for personalized advice.";
  }
  
  return response;
}

/**
 * Check if DeepSeek Chat API integration is properly configured
 * @returns {boolean} - Whether the API is configured and enabled
 */
export function isDeepSeekChatEnabled() {
  return USE_DEEPSEEK_API && DEEPSEEK_API_KEY;
} 