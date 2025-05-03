#!/usr/bin/env node

/**
 * Enhanced script to test a Hugging Face API key directly
 * This version matches how the application authenticates with Hugging Face
 * 
 * Usage:
 * Simple: node scripts/test-huggingface-api-key.js YOUR_API_KEY
 * With model type: node scripts/test-huggingface-api-key.js YOUR_API_KEY base|company|abstraction
 */

import axios from 'axios';

// Models to test with - these match the defaults used in the application
const DEFAULT_MODELS = {
  base: 'mistralai/Mistral-7B-Instruct-v0.2',
  company: 'mistralai/Mistral-7B-Instruct-v0.2',
  abstraction: 'mistralai/Mistral-7B-Instruct-v0.2'
};

async function testHuggingFaceApiKey(apiKey, modelType = 'base') {
  console.log('\nHugging Face API Key Test');
  console.log('=========================\n');
  
  // Basic format check - same as in the application
  if (!apiKey) {
    console.error('Error: No API key provided');
    console.log('Usage:');
    console.log('  Simple: node scripts/test-huggingface-api-key.js YOUR_API_KEY');
    console.log('  With model type: node scripts/test-huggingface-api-key.js YOUR_API_KEY base|company|abstraction');
    process.exit(1);
  }
  
  apiKey = apiKey.trim();
  
  // Validate key format - matches the validation in huggingface-client.ts
  if (!validateApiKey(apiKey)) {
    console.error('Error: Invalid API key format. Hugging Face API keys should start with "hf_" and be at least 5 characters long.');
    process.exit(1);
  }

  // Get the correct model for the selected model type
  const modelId = DEFAULT_MODELS[modelType] || DEFAULT_MODELS.base;
  
  console.log(`Testing API key: ${maskApiKey(apiKey)}`);
  console.log(`Using model type: ${modelType}`);
  console.log(`Using model ID: ${modelId}`);
  console.log('Sending test request to Hugging Face API...\n');

  try {
    // Create a request body that matches the format used by the application
    // This is designed to mimic how huggingface-client.ts sends requests
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`,
      {
        inputs: 'Test query from the application. Please respond with a short confirmation if you receive this.',
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API KEY IS VALID! API request successful.\n');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('\nKey is working correctly with the Hugging Face API.');
    return true;
  } catch (error) {
    console.error('❌ API request failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status code: ${error.response.status}`);
      console.error('Response body:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\nAuthentication failed: Your Hugging Face API key is invalid or expired.');
        console.error('Make sure this is the same API key that works in the UI.');
      } else if (error.response.status === 404) {
        console.error(`\nModel not found: The model "${modelId}" doesn't exist or isn't accessible with your API key.`);
        console.error('Try testing with a different model using the third parameter:');
        console.error('  node scripts/test-huggingface-api-key.js YOUR_API_KEY base|company|abstraction');
      } else if (error.response.status === 429) {
        console.error('\nRate limit exceeded: Too many requests. Please try again later.');
      } else if (error.response.status === 503) {
        console.error('\nService unavailable: The Hugging Face API is currently unavailable.');
        console.error('This is a transient error - please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server. Network error or server timeout.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up the request:', error.message);
    }
    
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify that your API key is correct and hasn\'t expired');
    console.error('2. Check if you have access to the model used in this test');
    console.error('3. Try a different model type (base, company, abstraction)');
    console.error('4. Make sure your internet connection is working');
    console.error('5. If the key works in the UI but fails here, contact support');
    
    return false;
  }
}

// Helper function to validate API key format - same logic as the application
function validateApiKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.trim().startsWith('hf_') && apiKey.length > 5;
}

// Helper function to mask the API key for display
function maskApiKey(apiKey) {
  return `${apiKey.substring(0, 5)}${'*'.repeat(apiKey.length - 5)}`;
}

// Get the API key and optional model type from command line arguments
const apiKey = process.argv[2];
const modelType = process.argv[3] || 'base';

// Validate model type
if (!['base', 'company', 'abstraction'].includes(modelType)) {
  console.error(`Error: Invalid model type '${modelType}'. Must be one of: base, company, abstraction`);
  process.exit(1);
}

// Run the test
testHuggingFaceApiKey(apiKey, modelType).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
