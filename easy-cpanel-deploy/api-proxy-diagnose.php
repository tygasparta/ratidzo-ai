<?php
/**
 * Ratidzo Health AI - Diagnosis Proxy
 * This script provides a simple API for health diagnoses
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

// DeepSeek API Configuration
$apiKey = 'sk-b2685fbe1ad44eebbc6193148a31dade'; // Replace with your actual API key
$deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';

// Get request body
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

// Validate request data
if (!$requestData || !isset($requestData['prompt'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing prompt in request data']);
    exit;
}

$prompt = $requestData['prompt'];

// Format message for DeepSeek API
$systemPrompt = "You are a medical assistant AI specialized in preliminary health analysis. 
You will analyze the patient's symptoms and provide potential diagnoses.

For each condition, include:
1. Name of the condition
2. Probability level (High, Medium, or Low)
3. Brief description
4. Possible causes
5. Recommended actions
6. Risk factors

Format your response as a valid JSON array of conditions.";

$userPrompt = "Based on the following patient information, provide potential diagnoses:

{$prompt}

Return your analysis ONLY as a valid JSON array of conditions with this structure:
[
  {
    \"name\": \"Condition Name\",
    \"probability\": \"High|Medium|Low\",
    \"description\": \"Brief description of the condition\",
    \"possibleCauses\": [\"Cause 1\", \"Cause 2\"],
    \"recommendedActions\": [\"Action 1\", \"Action 2\"],
    \"riskFactors\": [\"Risk Factor 1\", \"Risk Factor 2\"]
  }
]";

// Prepare API request
$apiRequestData = [
    'model' => 'deepseek-chat',
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ],
    'temperature' => 0.3,
    'max_tokens' => 4000
];

// Make request to DeepSeek API
$ch = curl_init($deepseekApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiRequestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 60); // 60 second timeout

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Handle DeepSeek API response
if ($error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $error,
        'diagnosisResults' => getFallbackDiagnosis()
    ]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => "API returned status code $httpCode",
        'diagnosisResults' => getFallbackDiagnosis()
    ]);
    exit;
}

$responseData = json_decode($response, true);

if (!$responseData || !isset($responseData['choices'][0]['message']['content'])) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid API response format',
        'diagnosisResults' => getFallbackDiagnosis()
    ]);
    exit;
}

$content = $responseData['choices'][0]['message']['content'];

// Try to parse the AI-generated content as JSON
try {
    $diagnosisResults = json_decode($content, true);
    
    if (!is_array($diagnosisResults)) {
        // If not an array, look for a JSON array in the content
        preg_match('/\[\s*\{.*\}\s*\]/s', $content, $matches);
        if (!empty($matches[0])) {
            $diagnosisResults = json_decode($matches[0], true);
        }
    }
    
    // Validate the results
    if (!is_array($diagnosisResults) || empty($diagnosisResults)) {
        throw new Exception('Invalid diagnosis results format');
    }
    
    // Return the results
    echo json_encode([
        'success' => true,
        'diagnosisResults' => $diagnosisResults,
        'aiPowered' => true,
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    // Return a fallback diagnosis if parsing fails
    echo json_encode([
        'success' => true,
        'diagnosisResults' => getFallbackDiagnosis(),
        'aiPowered' => false,
        'timestamp' => date('c')
    ]);
}

/**
 * Provide a fallback diagnosis when AI parsing fails
 */
function getFallbackDiagnosis() {
    return [
        [
            'name' => 'General Health Inquiry',
            'probability' => 'Medium',
            'description' => 'Based on the information provided, this appears to be a general health question. Please consult with a qualified healthcare professional for personalized advice.',
            'possibleCauses' => ['Information not provided'],
            'recommendedActions' => [
                'Consult with a healthcare provider for a proper diagnosis',
                'Provide more specific symptoms for a more detailed analysis',
                'Consider visiting a medical facility if symptoms are severe or worsening'
            ],
            'riskFactors' => ['Information not provided']
        ]
    ];
} 