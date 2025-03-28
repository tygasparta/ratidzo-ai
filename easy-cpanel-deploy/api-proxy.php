<?php
/**
 * Ratidzo Health AI - Simple PHP API Proxy
 * This script forwards requests to the DeepSeek API
 */

// Set headers to allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get request path
$requestPath = $_SERVER['PATH_INFO'] ?? '';

// DeepSeek API Configuration
$apiKey = 'sk-b2685fbe1ad44eebbc6193148a31dade'; // Replace with your actual API key
$deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';

// Get request body
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

// Validate request data
if (!$requestData || !isset($requestData['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

// Process chat request
if ($requestPath === '/chat') {
    $message = $requestData['message'];
    $history = $requestData['history'] ?? [];
    
    // Format message for DeepSeek API
    $systemPrompt = "You are an AI health assistant for Ratidzo Health AI, a medical information platform. 
Your primary goal is to provide general health information, guidance, and educational content to users.";
    
    $apiRequestData = [
        'model' => 'deepseek-chat',
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt]
        ],
        'temperature' => 0.7,
        'max_tokens' => 2000
    ];
    
    // Add history (limited to prevent token limit issues)
    if (!empty($history)) {
        // Add up to 5 previous messages for context
        $limitedHistory = array_slice($history, -5);
        foreach ($limitedHistory as $historyItem) {
            $apiRequestData['messages'][] = $historyItem;
        }
    }
    
    // Add current message
    $apiRequestData['messages'][] = ['role' => 'user', 'content' => $message];
    
    // Make request to DeepSeek API
    $ch = curl_init($deepseekApiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiRequestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Handle DeepSeek API response
    if ($error) {
        http_response_code(500);
        echo json_encode([
            'response' => "I apologize, but I'm currently experiencing technical difficulties. Please try again later.",
            'error' => $error
        ]);
        exit;
    }
    
    if ($httpCode !== 200) {
        http_response_code(502);
        echo json_encode([
            'response' => "I apologize, but I'm having trouble connecting to my knowledge base. Please try again later.",
            'error' => "API returned status code $httpCode"
        ]);
        exit;
    }
    
    $responseData = json_decode($response, true);
    
    if (!$responseData || !isset($responseData['choices'][0]['message']['content'])) {
        http_response_code(502);
        echo json_encode([
            'response' => "I apologize, but I received an invalid response format. Please try again later.",
            'error' => 'Invalid API response format'
        ]);
        exit;
    }
    
    $content = $responseData['choices'][0]['message']['content'];
    
    // Return response to client
    echo json_encode([
        'response' => $content,
        'timestamp' => date('c')
    ]);
    exit;
}

// Process diagnosis request
if ($requestPath === '/diagnose') {
    // Implement diagnosis logic here if needed
    // For simplicity, we'll return a fallback response
    
    echo json_encode([
        'success' => true,
        'diagnosisResults' => [
            [
                'name' => 'General Health Inquiry',
                'probability' => 'Medium',
                'description' => 'Based on the information provided, this appears to be a general health question. Please consult with a qualified healthcare professional for personalized advice.',
                'possibleCauses' => ['Information not provided'],
                'recommendedActions' => ['Consult with a healthcare provider for a proper diagnosis', 'Provide more specific symptoms for a more detailed analysis'],
                'riskFactors' => ['Information not provided']
            ]
        ],
        'aiPowered' => false,
        'timestamp' => date('c')
    ]);
    exit;
}

// If no matching endpoint
http_response_code(404);
echo json_encode(['error' => 'API endpoint not found']); 