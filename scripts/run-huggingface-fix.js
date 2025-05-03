/**
 * Runner script for the Hugging Face Spaces endpoint fix
 * 
 * This script uses CommonJS syntax to avoid ES module issues.
 */

// Load required libraries
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Define possible API endpoints to test
const API_ENDPOINTS = [
  '/api/predict', // Standard Gradio API endpoint (newer)
  '/run/predict', // Alternative format for older Gradio
  '/api/generate', // Common for LLM Spaces
  '/run', // Direct endpoint (newer Gradio with FastAPI)
  '/predict' // Direct predict endpoint
];

// Function to get API URL from Space URL
function getSpaceApiUrl(spaceUrl, apiEndpoint) {
  if (!spaceUrl) {
    return null;
  }
  
  let apiUrl;
  
  if (spaceUrl.includes('huggingface.co/spaces/')) {
    // Convert standard URL to API URL
    // From: https://huggingface.co/spaces/username/space-name
    // To: https://username-space-name.hf.space/api/endpoint
    const parts = spaceUrl.split('/');
    const username = parts[parts.length - 2];
    const spaceName = parts[parts.length - 1];
    apiUrl = `https://${username}-${spaceName}.hf.space${apiEndpoint}`;
  } else {
    // Use the URL directly with the API endpoint
    apiUrl = `${spaceUrl.replace(/\/$/, '')}${apiEndpoint}`;
  }
  
  return apiUrl;
}

// Test connection to a specific endpoint
async function testEndpoint(spaceUrl, apiEndpoint, authToken = null) {
  const apiUrl = getSpaceApiUrl(spaceUrl, apiEndpoint);
  if (!apiUrl) {
    console.log(`  - Skipping ${apiEndpoint} (invalid Space URL)`);
    return { success: false, message: 'Invalid Space URL' };
  }
  
  console.log(`  - Testing ${apiUrl}...`);
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization if token is provided
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    // First try with standard input format
    const response = await axios.post(
      apiUrl,
      { 
        inputs: "Test query from diagnostic script. Please respond if you receive this.",
        parameters: {
          max_new_tokens: 10,
          temperature: 0.1
        }
      },
      { 
        headers,
        timeout: 5000 // 5 second timeout
      }
    );
    
    console.log(`    Success with standard input format! Status: ${response.status}`);
    return { 
      success: true, 
      message: 'Connection successful with standard format', 
      inputFormat: 'standard' 
    };
  } catch (error) {
    // If that fails, try with 'data' array format
    try {
      const response = await axios.post(
        apiUrl,
        { data: ["Test query from diagnostic script. Please respond if you receive this."] },
        { headers, timeout: 5000 }
      );
      
      console.log(`    Success with 'data' array format! Status: ${response.status}`);
      return { 
        success: true, 
        message: 'Connection successful with data array format', 
        inputFormat: 'data' 
      };
    } catch (secondError) {
      let errorMessage = 'Failed to connect to endpoint';
      
      if (error.response) {
        errorMessage = `Error: ${error.response.status}`;
        if (error.response.status === 401) {
          errorMessage = 'Authentication error (401): Token may be invalid or missing';
        } else if (error.response.status === 404) {
          errorMessage = 'Not found (404): Endpoint does not exist';
        }
      } else if (error.request) {
        errorMessage = 'Network error: No response received';
      }
      
      console.log(`    ${errorMessage}`);
      return { success: false, message: errorMessage };
    }
  }
}

// Main fix function
async function fixHuggingFaceEndpoint() {
  console.log('Running Hugging Face Spaces endpoint fix...');
  
  try {
    // Force the default API endpoint to be '/api/predict' instead of '/api/generate'
    // This matches the current error message which shows a 404 when accessing the /api/predict endpoint
    
    // Get current settings or create them if they don't exist
    console.log('Checking for Hugging Face Spaces settings...');
    
    const { data: spacesSettings, error: spacesError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'huggingface_spaces')
      .maybeSingle();
    
    if (spacesError) {
      console.error('Error fetching Hugging Face Spaces settings:', spacesError);
      console.log('You may need to run the initial migration script first.');
      return;
    }
    
    if (!spacesSettings) {
      console.log('Hugging Face Spaces settings not found.');
      // Run the initial migration to create the settings
      console.log('Please run the initial migration script first.');
      return;
    }
    
    console.log('Current settings found. Updating API endpoints...');
    
    // For each tier, update the API endpoint
    const settings = spacesSettings.value;
    const tiers = ['base', 'company', 'abstraction', 'user'];
    
    let hasChanges = false;
    
    for (const tier of tiers) {
      if (settings.spaces[tier].space_url) {
        console.log(`\nUpdating ${tier} Space configuration:`);
        console.log(`- Current endpoint: ${settings.spaces[tier].api_endpoint}`);
        
        // Update the API endpoint to '/api/predict'
        if (settings.spaces[tier].api_endpoint !== '/api/predict') {
          settings.spaces[tier].api_endpoint = '/api/predict';
          hasChanges = true;
          console.log(`- New endpoint: /api/predict`);
        }
        
        // Add debugging information
        console.log(`- Space URL: ${settings.spaces[tier].space_url}`);
        console.log(`- Full API URL: ${getSpaceApiUrl(settings.spaces[tier].space_url, settings.spaces[tier].api_endpoint)}`);
        console.log(`- Auth token provided: ${settings.spaces[tier].auth_token ? 'Yes' : 'No'}`);
      }
    }
    
    if (hasChanges) {
      // Update the settings
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({
          value: settings,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'huggingface_spaces');
      
      if (updateError) {
        console.error('Error updating Hugging Face Spaces settings:', updateError);
        return;
      }
      
      console.log('\nSuccessfully updated API endpoints to /api/predict');
    } else {
      console.log('\nNo changes needed. All API endpoints are already set to /api/predict');
    }
    
    console.log('\nFix completed. Please check the Settings page and ensure you have:');
    console.log('1. Provided the correct Space URL (should be the Hugging Face Spaces URL)');
    console.log('2. Provided a valid authentication token if your Space is private');
    console.log('3. Verified your Space is running and not paused');
    
  } catch (error) {
    console.error('Fix script error:', error);
  }
}

// Run the fix
console.log('Starting Hugging Face Spaces endpoint fix...');
fixHuggingFaceEndpoint()
  .then(() => console.log('Fix script completed.'))
  .catch(error => {
    console.error('Unhandled error:', error);
  });
