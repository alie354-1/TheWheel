#!/usr/bin/env node

/**
 * Direct Hugging Face API key test that bypasses the database
 * This script tests the API key directly against the Hugging Face API
 * without relying on the app settings in the database
 * 
 * Usage:
 * node scripts/test-huggingface-api-key-direct.js YOUR_API_KEY [MODEL_ID]
 */

import axios from 'axios';

// Default model if none specified
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

async function testHuggingFaceApiKeyDirect(apiKey, modelId = DEFAULT_MODEL) {
  console.log('\nHugging Face API Key Direct Test');
  console.log('===============================\n');
  
  // Basic format check
  if (!apiKey) {
    console.error('Error: No API key provided');
    console.log('Usage: node scripts/test-huggingface-api-key-direct.js YOUR_API_KEY [MODEL_ID]');
    process.exit(1);
  }
  
  apiKey = apiKey.trim();
  
  if (!apiKey.startsWith('hf_') || apiKey.length < 5) {
    console.error('Error: Invalid API key format. Hugging Face API keys should start with "hf_" and be at least 5 characters long.');
    process.exit(1);
  }

  // Mask the API key for display purposes
  const maskedKey = `${apiKey.substring(0, 5)}${'*'.repeat(Math.max(0, apiKey.length - 5))}`;
  console.log(`Testing API key: ${maskedKey}`);
  console.log(`Using model: ${modelId}`);
  console.log('Sending test request to Hugging Face API...\n');

  try {
    // Direct API request with minimal parameters
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`,
      {
        inputs: 'Hello, this is a direct test request. Please respond if you can see this.',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for model loading
      }
    );

    console.log('✅ SUCCESS: Direct API request succeeded!\n');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('\nKey is working correctly with the Hugging Face API.');
    return true;
  } catch (error) {
    console.error('❌ ERROR: Direct API request failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status code: ${error.response.status}`);
      console.error('Response body:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\nAuthentication failed: Your Hugging Face API key is invalid or expired.');
      } else if (error.response.status === 404) {
        console.error(`\nModel not found: The model "${modelId}" doesn't exist or isn't accessible with your API key.`);
        console.error('Try a different model ID as the second parameter:');
        console.error('  node scripts/test-huggingface-api-key-direct.js YOUR_API_KEY gpt2');
      } else if (error.response.status === 429) {
        console.error('\nRate limit exceeded: Too many requests. Please try again later.');
      } else if (error.response.status === 503) {
        console.error('\nService unavailable: The model might be loading or under maintenance.');
        console.error('This is a transient error - please try again in a few minutes.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server. Network error or server timeout.');
      console.error('Error details:', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up the request:', error.message);
    }
    
    console.error('\nTroubleshooting steps:');
    console.error('1. Check if your API key is valid and has not expired');
    console.error('2. Verify you have permission to access the specified model');
    console.error('3. Try a different model by providing a second parameter');
    console.error('4. Check your internet connection');
    console.error('5. If using a VPN or proxy, try disabling it temporarily');
    
    return false;
  }
}

// Main function to handle async execution
async function main() {
  const apiKey = process.argv[2];
  const modelId = process.argv[3] || DEFAULT_MODEL;
  
  // Print some information about the test
  console.log('Hugging Face Direct API Test');
  console.log('============================');
  console.log('This test bypasses the database and app configuration,');
  console.log('testing your API key directly against the Hugging Face API.\n');
  
  try {
    await testHuggingFaceApiKeyDirect(apiKey, modelId);
  } catch (error) {
    console.error('\nUnexpected error during test:', error);
    process.exit(1);
  }
}

// Run the main function
main();
