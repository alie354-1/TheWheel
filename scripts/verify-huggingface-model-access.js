#!/usr/bin/env node

/**
 * HuggingFace Model Access Verification Script
 * 
 * This script checks if your Hugging Face account has access to specific models.
 * It's helpful for troubleshooting API key issues by determining if the problem 
 * is with the key itself or with model access permissions.
 * 
 * Usage:
 * node scripts/verify-huggingface-model-access.js YOUR_API_KEY [MODEL_ID]
 */

import axios from 'axios';

// Default models to check for access
const DEFAULT_MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.2',  // Open access model
  'meta-llama/Llama-2-13b-chat-hf',      // Requires approval
  'google/flan-t5-xxl',                  // Open access model
  'gpt2'                                 // Fully open model
];

/**
 * Check if the user has access to a specific model
 */
async function checkModelAccess(apiKey, modelId) {
  try {
    // Try to get model information using the HF API
    const response = await axios.get(
      `https://huggingface.co/api/models/${encodeURIComponent(modelId)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 10000
      }
    );
    
    // If we get a 200, the user has access
    return {
      modelId,
      hasAccess: true,
      isPrivate: response.data.private || false,
      message: `Access granted to model: ${modelId}`
    };
  } catch (error) {
    // If we get a 401 or 403, the user doesn't have access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        modelId,
        hasAccess: false,
        isPrivate: true,
        message: `Access denied to model: ${modelId} (${error.response.status})`
      };
    } 
    // If we get a 404, the model doesn't exist
    else if (error.response && error.response.status === 404) {
      return {
        modelId,
        hasAccess: false,
        isPrivate: false,
        message: `Model not found: ${modelId}`
      };
    } 
    // For any other error, we don't know
    else {
      return {
        modelId,
        hasAccess: false,
        isPrivate: null,
        message: `Error checking access to ${modelId}: ${error.message}`
      };
    }
  }
}

/**
 * Test a Hugging Face API key with multiple models to verify access
 */
async function verifyModelAccess(apiKey, specificModel = null) {
  console.log('Hugging Face Model Access Verification');
  console.log('======================================\n');
  
  if (!apiKey) {
    console.error('Error: No API key provided');
    console.log('Usage: node scripts/verify-huggingface-model-access.js YOUR_API_KEY [MODEL_ID]');
    process.exit(1);
  }
  
  // Basic format check
  apiKey = apiKey.trim();
  if (!apiKey.startsWith('hf_') || apiKey.length < 5) {
    console.error('Error: Invalid API key format. Hugging Face API keys should start with "hf_" and be at least 5 characters long.');
    process.exit(1);
  }
  
  const maskedKey = `${apiKey.substring(0, 5)}${'*'.repeat(Math.max(0, apiKey.length - 5))}`;
  console.log(`Testing API key: ${maskedKey}\n`);
  
  try {
    // First check basic account info to verify the key is valid
    console.log('Checking account access...');
    try {
      const userInfoResponse = await axios.get(
        'https://huggingface.co/api/whoami',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      console.log('✅ API key is valid for account access');
      if (userInfoResponse.data && userInfoResponse.data.name) {
        console.log(`Account: ${userInfoResponse.data.name}`);
      }
      console.log('');
    } catch (error) {
      console.error('❌ API key fails basic authentication');
      if (error.response && error.response.status === 401) {
        console.error('   Authentication error: Invalid or expired API key\n');
      } else {
        console.error(`   Error: ${error.message}\n`);
      }
      
      // If we can't even authenticate, no need to check model access
      console.error('Since the API key fails basic authentication, model access checks will also fail.');
      process.exit(1);
    }
    
    // If a specific model was provided, only check that one
    const modelsToCheck = specificModel ? [specificModel] : DEFAULT_MODELS;
    
    console.log('Checking model access permissions...\n');
    
    // Check access to each model
    const results = await Promise.all(
      modelsToCheck.map(modelId => checkModelAccess(apiKey, modelId))
    );
    
    // Report results
    let accessGranted = 0;
    let accessDenied = 0;
    
    console.log('Model Access Results:');
    console.log('--------------------');
    
    results.forEach(result => {
      if (result.hasAccess) {
        console.log(`✅ ${result.message}`);
        accessGranted++;
      } else {
        console.log(`❌ ${result.message}`);
        accessDenied++;
      }
    });
    
    console.log('\nSummary:');
    console.log(`Access granted to ${accessGranted} out of ${results.length} models`);
    
    // Provide recommendations based on results
    console.log('\nRecommendations:');
    
    if (accessGranted === 0) {
      console.log('- Your API key has limited model access. Consider these options:');
      console.log('  1. Use a different model that you have access to');
      console.log('  2. Request access to specific gated models at huggingface.co');
      console.log('  3. Use only open access models like "gpt2"');
    } else if (accessGranted < results.length) {
      console.log('- Configure your application to use the models you have access to:');
      results.filter(r => r.hasAccess).forEach(model => {
        console.log(`  - ${model.modelId}`);
      });
    } else {
      console.log('- Your API key has access to all tested models. No issues detected.');
    }
    
    // Specific advice for common models
    const llamaResult = results.find(r => r.modelId.includes('llama'));
    if (llamaResult && !llamaResult.hasAccess) {
      console.log('\nNote about Llama models:');
      console.log('- Meta\'s Llama models require special access approval');
      console.log('- Visit https://huggingface.co/meta-llama to request access');
    }
    
  } catch (error) {
    console.error('Unexpected error during verification:', error);
    process.exit(1);
  }
}

// Get API key and optional model ID from command line arguments
const apiKey = process.argv[2];
const specificModel = process.argv[3];

// Run the model access verification
verifyModelAccess(apiKey, specificModel);
