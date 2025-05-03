#!/usr/bin/env node

/**
 * Advanced diagnostic script for Hugging Face API key issues
 * This script tests your Hugging Face API key against the API
 * while duplicating the exact environment your app uses.
 * 
 * Usage:
 * node scripts/diagnose-huggingface-key.js YOUR_API_KEY
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Configuration constants
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

// Get API key from command line arguments
const apiKey = process.argv[2];

// Create diagnostic functions
const diagnostics = {
  log: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  success: (message) => console.log(`[SUCCESS] ${message}`),
  warning: (message) => console.log(`[WARNING] ${message}`),
  divider: () => console.log('-'.repeat(50)),
  maskApiKey: (key) => key ? `${key.substring(0, 5)}${'*'.repeat(Math.max(0, key.length - 5))}` : 'undefined',

  // Validate API key format
  validateApiKey: (key) => {
    if (typeof key !== 'string') {
      diagnostics.error('API key is not a string');
      return false;
    }
    if (!key.trim()) {
      diagnostics.error('API key is empty');
      return false;
    }
    if (!key.startsWith('hf_')) {
      diagnostics.error('API key doesn\'t start with "hf_"');
      return false;
    }
    if (key.length <= 5) {
      diagnostics.error('API key is too short');
      return false;
    }
    return true;
  },

  // Test API key using direct approach
  testDirectApiCall: async (key, modelId = DEFAULT_MODEL) => {
    diagnostics.divider();
    diagnostics.log(`Testing direct API call to Hugging Face`);
    diagnostics.log(`Model ID: ${modelId}`);
    diagnostics.log(`API key: ${diagnostics.maskApiKey(key)}`);
    
    try {
      // Create a request identical to what the app would send
      const response = await axios.post(
        `${HUGGINGFACE_API_URL}/${encodeURIComponent(modelId)}`,
        {
          inputs: 'Test query from diagnosis script. Please respond with "Success" if you receive this.',
          parameters: {
            max_new_tokens: 50,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          // Set a longer timeout since some models can be slow to load
          timeout: 60000
        }
      );
      
      diagnostics.success('Direct API call successful!');
      diagnostics.log(`Response status: ${response.status}`);
      diagnostics.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } catch (error) {
      diagnostics.error('Direct API call failed');
      
      if (error.response) {
        diagnostics.error(`Status code: ${error.response.status}`);
        diagnostics.error(`Response: ${JSON.stringify(error.response.data)}`);
        
        if (error.response.status === 401) {
          diagnostics.error('Authentication failed: Invalid API key or insufficient permissions');
        } else if (error.response.status === 404) {
          diagnostics.error(`Model not found: "${modelId}" doesn't exist or isn't accessible with your API key`);
        } else if (error.response.status === 429) {
          diagnostics.error('Rate limit exceeded: Too many requests');
        } else if (error.response.status === 503) {
          diagnostics.error('Service unavailable: The model might be loading or under maintenance');
        }
      } else if (error.request) {
        diagnostics.error('No response received (network error or timeout)');
      } else {
        diagnostics.error(`Request error: ${error.message}`);
      }
      
      return false;
    }
  },

  // Test database access for app settings (if environment variables are available)
  testDatabaseAccess: async () => {
    diagnostics.divider();
    diagnostics.log('Testing database access for app settings');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      diagnostics.error('Supabase environment variables not available');
      diagnostics.warning('Skipping database test');
      return null;
    }
    
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'huggingface')
        .single();
      
      if (error) {
        diagnostics.error(`Database query error: ${error.message}`);
        return null;
      }
      
      if (!data) {
        diagnostics.warning('No Hugging Face settings found in database');
        return null;
      }
      
      diagnostics.success('Database access successful');
      
      // Check if the key is properly stored in the database
      const storedSettings = data.value;
      
      if (!storedSettings || !storedSettings.api_key) {
        diagnostics.warning('API key not found in database settings');
        return null;
      }
      
      const storedKey = storedSettings.api_key.trim();
      diagnostics.log(`API key in database: ${diagnostics.maskApiKey(storedKey)}`);
      
      // Check if the stored key is valid
      if (!diagnostics.validateApiKey(storedKey)) {
        diagnostics.error('Stored API key has invalid format');
      } else {
        diagnostics.success('Stored API key has valid format');
      }
      
      // Print model information
      diagnostics.log('Model settings from database:');
      if (storedSettings.spaces) {
        Object.entries(storedSettings.spaces).forEach(([tier, config]) => {
          diagnostics.log(`${tier}: ${config.model_id || 'not set'}`);
        });
      } else {
        diagnostics.warning('No model configuration found in database');
      }
      
      return storedSettings;
    } catch (error) {
      diagnostics.error(`Database access error: ${error.message}`);
      return null;
    }
  },

  // Compare API keys
  compareApiKeys: (commandLineKey, databaseKey) => {
    diagnostics.divider();
    diagnostics.log('Comparing API keys');
    
    if (!commandLineKey || !databaseKey) {
      diagnostics.warning('Cannot compare keys (one or both are missing)');
      return false;
    }
    
    const key1 = commandLineKey.trim();
    const key2 = databaseKey.trim();
    
    if (key1 === key2) {
      diagnostics.success('API keys match!');
      return true;
    } else {
      diagnostics.error('API keys do not match!');
      diagnostics.log(`Command line key: ${diagnostics.maskApiKey(key1)}`);
      diagnostics.log(`Database key: ${diagnostics.maskApiKey(key2)}`);
      return false;
    }
  }
};

// Main diagnostic function
async function runDiagnostics() {
  console.log('Hugging Face API Key Diagnostic Tool');
  console.log('====================================\n');
  
  // Step 1: Validate command line API key
  if (!apiKey) {
    diagnostics.error('No API key provided');
    console.log('Usage: node scripts/diagnose-huggingface-key.js YOUR_API_KEY');
    process.exit(1);
  }
  
  diagnostics.log(`Validating API key: ${diagnostics.maskApiKey(apiKey)}`);
  const isValidFormat = diagnostics.validateApiKey(apiKey);
  
  if (isValidFormat) {
    diagnostics.success('API key format is valid');
  } else {
    diagnostics.error('API key format is invalid');
    process.exit(1);
  }
  
  // Step 2: Test API key with direct API call
  await diagnostics.testDirectApiCall(apiKey);
  
  // Step 3: Test database access if environment variables are available
  const dbSettings = await diagnostics.testDatabaseAccess();
  
  if (dbSettings && dbSettings.api_key) {
    // Step 4: Compare API keys
    diagnostics.compareApiKeys(apiKey, dbSettings.api_key);
    
    // Step 5: Test with database API key
    if (apiKey !== dbSettings.api_key.trim()) {
      diagnostics.log('Testing API call with database API key...');
      await diagnostics.testDirectApiCall(dbSettings.api_key);
    }
    
    // Step 6: Test with different model types if available
    if (dbSettings.spaces) {
      for (const [tier, config] of Object.entries(dbSettings.spaces)) {
        if (config.model_id && config.model_id !== DEFAULT_MODEL) {
          diagnostics.log(`Testing with ${tier} model: ${config.model_id}`);
          await diagnostics.testDirectApiCall(apiKey, config.model_id);
        }
      }
    }
  }
  
  diagnostics.divider();
  diagnostics.log('Diagnostic Summary:');
  diagnostics.log('1. If direct API calls failed with 401: The API key is invalid or has insufficient permissions');
  diagnostics.log('2. If database access failed: Your app settings might not be properly saved');
  diagnostics.log('3. If key comparisons failed: Your UI might be using a different key than provided');
  diagnostics.log('4. If model tests failed: You might not have access to the specific models');
  
  console.log('\nDiagnostic complete!');
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('Unexpected error during diagnostics:', error);
  process.exit(1);
});
