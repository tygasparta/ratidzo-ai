/**
 * DeepSeek AI API Integration for Ratidzo Health AI
 * This module provides functions to interact with DeepSeek's AI models for medical diagnosis
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
 * Call the DeepSeek API with the patient's health data
 * @param {string} prompt - The formatted health diagnosis prompt
 * @returns {Promise<Array>} - Array of diagnosis conditions
 */
export async function getDiagnosisFromDeepSeek(prompt) {
  if (!USE_DEEPSEEK_API || !DEEPSEEK_API_KEY) {
    console.log('DeepSeek API is disabled or API key not configured. Using local diagnosis.');
    return null;
  }

  try {
    console.log('Calling DeepSeek API for diagnosis with key:', DEEPSEEK_API_KEY.substring(0, 5) + '...');
    
    const systemPrompt = `
You are a medical assistant AI specialized in preliminary health analysis. 
You will analyze the patient's symptoms and provide potential diagnoses.

For each condition, include:
1. Name of the condition
2. Probability level (High, Medium, or Low)
3. Brief description
4. Possible causes
5. Recommended actions
6. Risk factors

Format your response as a valid JSON array of conditions.
`;

    console.log('Patient prompt:', prompt.substring(0, 100) + '...');

    const userPrompt = `
Based on the following patient information, provide potential diagnoses:

${prompt}

Return your analysis ONLY as a valid JSON array of conditions with this structure:
[
  {
    "name": "Condition Name",
    "probability": "High|Medium|Low",
    "description": "Brief description of the condition",
    "possibleCauses": ["Cause 1", "Cause 2"],
    "recommendedActions": ["Action 1", "Action 2"],
    "riskFactors": ["Risk Factor 1", "Risk Factor 2"]
  }
]
`;

    // Make the API request
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    // Parse the response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }
    
    const content = data.choices[0].message.content;
    console.log('DeepSeek API response received:', content.substring(0, 100) + '...');
    
    // Parse the AI-generated response
    return parseAIResponse(content);
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    console.log('Falling back to rule-based diagnosis');
    return null;
  }
}

/**
 * Parse the AI response into structured diagnosis data
 * @param {string} aiContent - The content returned by the AI
 * @returns {Array|null} - Parsed array of diagnosis conditions or null if parsing failed
 */
function parseAIResponse(aiContent) {
  try {
    // Try to parse as JSON first
    const jsonData = JSON.parse(aiContent);
    
    // Check if it's already an array
    if (Array.isArray(jsonData)) {
      return validateDiagnosisData(jsonData);
    }
    
    // If it has a 'conditions' property that's an array
    if (jsonData.conditions && Array.isArray(jsonData.conditions)) {
      return validateDiagnosisData(jsonData.conditions);
    }
    
    // Otherwise, look for any array property
    for (const key in jsonData) {
      if (Array.isArray(jsonData[key])) {
        return validateDiagnosisData(jsonData[key]);
      }
    }
    
    throw new Error('No valid diagnosis array found in JSON response');
  } catch (jsonError) {
    console.error('Failed to parse JSON response:', jsonError);
    
    // If JSON parsing fails, try to extract structured data from the text
    console.log('Attempting to extract structured data from text response');
    
    try {
      // Extract condition information using regex
      const conditions = [];
      // Split by condition blocks (numbered items or condition headers)
      const conditionBlocks = aiContent.split(/\n\n(?=\d+\.\s+|Condition:)/);
      
      for (const block of conditionBlocks) {
        // Extract condition components
        const nameMatch = block.match(/(?:Condition:|^\d+\.\s+)(.+?)(?:\s*\(|:|-|$)/m);
        const probMatch = block.match(/probability:?\s*(\w+)/i) || block.match(/\((\w+)\s+probability\)/i);
        const descMatch = block.match(/description:?\s*(.+?)(?:\n\n|\n(?=Possible Causes:|Recommended Actions:|Risk Factors:))/is);
        const causesMatch = block.match(/Possible Causes:?\s*(.+?)(?:\n\n|\n(?=Recommended Actions:|Risk Factors:))/is);
        const actionsMatch = block.match(/Recommended Actions:?\s*(.+?)(?:\n\n|\n(?=Risk Factors:))/is);
        const riskMatch = block.match(/Risk Factors:?\s*(.+?)(?:\n\n|$)/is);
        
        if (nameMatch) {
          const condition = {
            name: nameMatch[1].trim(),
            probability: probMatch ? probMatch[1].trim() : 'Medium',
            description: descMatch ? descMatch[1].trim() : 'No description provided',
            possibleCauses: extractListItems(causesMatch ? causesMatch[1] : ''),
            recommendedActions: extractListItems(actionsMatch ? actionsMatch[1] : ''),
            riskFactors: extractListItems(riskMatch ? riskMatch[1] : '')
          };
          conditions.push(condition);
        }
      }
      
      return conditions.length > 0 ? validateDiagnosisData(conditions) : null;
    } catch (textError) {
      console.error('Failed to extract structured data from text:', textError);
      return null;
    }
  }
}

/**
 * Extract list items from a text block
 * @param {string} text - The text block containing list items
 * @returns {Array} - Array of extracted list items
 */
function extractListItems(text) {
  if (!text) return ['Information not provided'];
  
  // Try to extract bulleted or numbered list items
  const listItems = text.split(/\n-|\n\d+\./).map(item => item.trim()).filter(item => item);
  
  if (listItems.length > 0) {
    return listItems;
  }
  
  // If no list items found, use the whole text as a single item
  return [text.trim()];
}

/**
 * Validate and sanitize the diagnosis data
 * @param {Array} diagnosisData - The diagnosis data to validate
 * @returns {Array} - Validated and sanitized diagnosis data
 */
function validateDiagnosisData(diagnosisData) {
  if (!Array.isArray(diagnosisData) || diagnosisData.length === 0) {
    throw new Error('Invalid diagnosis data format');
  }
  
  return diagnosisData.map(condition => {
    // Ensure all required fields are present
    return {
      name: condition.name || 'Unknown Condition',
      probability: condition.probability || 'Medium',
      description: condition.description || 'No description provided',
      possibleCauses: Array.isArray(condition.possibleCauses) && condition.possibleCauses.length > 0 
        ? condition.possibleCauses 
        : ['Information not provided'],
      recommendedActions: Array.isArray(condition.recommendedActions) && condition.recommendedActions.length > 0 
        ? condition.recommendedActions 
        : ['Consult with a healthcare professional'],
      riskFactors: Array.isArray(condition.riskFactors) && condition.riskFactors.length > 0 
        ? condition.riskFactors 
        : ['Information not provided']
    };
  });
}

/**
 * Check if DeepSeek API integration is properly configured
 * @returns {boolean} - Whether the API is configured and enabled
 */
export function isDeepSeekEnabled() {
  return USE_DEEPSEEK_API && DEEPSEEK_API_KEY;
} 