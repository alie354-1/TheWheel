#!/usr/bin/env node

/**
 * Hugging Face API Key Validator Script
 * 
 * This script is specifically designed to test Hugging Face API key validity
 * by making a minimal authentication test rather than trying to use inference.
 * 
 * Usage:
 * node scripts/key-validator.js YOUR_API_KEY
 */

import axios from 'axios';

// Main validation function
async function validateApiKey(apiKey) {
  console.log('Hugging Face API Key Validator');
  console.log('=============================\n');
  
  // Basic format check
  if (!apiKey) {
    console.error('Error: No API key provided');
    console.log('Usage: node scripts/key-validator.js YOUR_API_KEY');
    process.exit(1);
  }
  
  apiKey = apiKey.trim();
  
  if (!apiKey.startsWith('hf_') || apiKey.length < 5) {
    console.error('Error: Invalid API key format. Hugging Face API keys should start with "hf_" and be at least 5 characters long.');
    process.exit(1);
  }

  // Mask the API key for display
  const maskedKey = `${apiKey.substring(0, 5)}${'*'.repeat(Math.max(0, apiKey.length - 5))}`;
  console.log(`Testing API key: ${maskedKey}\n`);
  
  // First approach: Try the user info API endpoint
  try {
    console.log('Method 1: Testing key against user info API...');
    
    const response = await axios.get(
      'https://huggingface.co/api/whoami',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    console.log('✅ SUCCESS: Key is valid for accessing user information!');
    console.log('User info:', JSON.stringify(response.data, null, 2));
    console.log('\nThis confirms the key is valid for Hugging Face account access.');
    
    return true;
  } catch (userInfoError) {
    console.error('❌ ERROR: User info validation failed:');
    
    if (userInfoError.response) {
      console.error(`Status code: ${userInfoError.response.status}`);
      if (userInfoError.response.data) {
        console.error('Response body:', userInfoError.response.data);
      }
    } else if (userInfoError.request) {
      console.error('No response received from the server.');
    } else {
      console.error('Error:', userInfoError.message);
    }
    
    console.log('\nTrying alternative validation method...\n');
  }
  
  // Second approach: Try the simplest model info API call
  try {
    console.log('Method 2: Testing key with model info API...');
    
    const response = await axios.get(
      'https://huggingface.co/api/models?limit=1',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    console.log('✅ SUCCESS: Key is valid for accessing model information!');
    if (response.data && response.data.length > 0) {
      console.log('Model info sample:', JSON.stringify(response.data[0], null, 2));
    }
    console.log('\nThis confirms the key is valid for Hugging Face API access.');
    
    return true;
  } catch (modelInfoError) {
    console.error('❌ ERROR: Model info validation failed:');
    
    if (modelInfoError.response) {
      console.error(`Status code: ${modelInfoError.response.status}`);
      if (modelInfoError.response.data) {
        console.error('Response body:', modelInfoError.response.data);
      }
    } else if (modelInfoError.request) {
      console.error('No response received from the server.');
    } else {
      console.error('Error:', modelInfoError.message);
    }
  }
  
  console.log('\n================================================');
  console.log('VALIDATION RESULT: The API key appears to be invalid.');
  console.log('================================================\n');
  
  console.log('Possible causes:');
  console.log('1. The API key may have expired or been revoked');
  console.log('2. The API key might not have the correct permissions');
  console.log('3. There could be a typo in the key');
  console.log('4. Your account might have restrictions or limitations');
  console.log('5. The Hugging Face API might be experiencing issues\n');
  
  console.log('Recommendations:');
  console.log('1. Generate a new API key at https://huggingface.co/settings/tokens');
  console.log('2. Make sure to create a key with "read" access');
  console.log('3. If you need to access Inference API, ensure your account has access to the models you want to use');
  console.log('4. Check if your Hugging Face account is in good standing\n');
  
  return false;
}

// Get API key from command line arguments
const apiKey = process.argv[2];

// Run the validation
validateApiKey(apiKey).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
