/**
 * Test script for Hugging Face Spaces connection
 * 
 * This script tests connectivity to a Hugging Face Space by trying
 * various API endpoints and authorization tokens.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import axios from 'axios';

// Load environment variables
config();

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
  '/api/predict',    // Standard Gradio API endpoint (newer)
  '/run/predict',    // Alternative format for older Gradio
  '/api/generate',   // Common for LLM Spaces
  '/run',            // Direct endpoint (newer Gradio with FastAPI)
  '/predict',        // Direct predict endpoint
  ''                 // Root endpoint (some custom APIs)
];

// Define possible input formats to test
const INPUT_FORMATS = [
  { 
    name: 'Standard',
    data: { 
      inputs: "Test query from diagnostic script. Please respond if you receive this.",
      parameters: {
        max_new_tokens: 10,
        temperature: 0.1
      }
    }
  },
  {
    name: 'Data array',
    data: { data: ["Test query from diagnostic script. Please respond if you receive this."] }
  },
  {
    name: 'Simple text',
    data: { text: "Test query from diagnostic script. Please respond if you receive this." }
  },
  {
    name: 'Query parameter',
    data: { query: "Test query from diagnostic script. Please respond if you receive this." }
  }
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

// Test connection to a specific endpoint with all input formats
async function testEndpoint(spaceUrl, apiEndpoint, authToken = null) {
  const apiUrl = getSpaceApiUrl(spaceUrl, apiEndpoint);
  if (!apiUrl) {
    console.log(`  - Skipping ${apiEndpoint} (invalid Space URL)`);
    return { success: false, message: 'Invalid Space URL' };
  }
  
  console.log(`\n  Testing: ${apiUrl}`);
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization if token is provided
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('  Using authentication token');
  } else {
    console.log('  No authentication token provided');
  }
  
  // Try each input format
  for (const format of INPUT_FORMATS) {
    console.log(`    - Trying format: ${format.name}`);
    
    try {
      const response = await axios.post(
        apiUrl,
        format.data,
        { 
          headers,
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log(`      ✅ SUCCESS! Status: ${response.status}`);
      console.log(`      Response data:`, response.data);
      
      return { 
        success: true, 
        message: `Connection successful with ${format.name} format`, 
        inputFormat: format.name,
        endpoint: apiEndpoint,
        response: response.data
      };
    } catch (error) {
      const statusMessage = error.response ? `Error ${error.response.status}` : 'Network error';
      console.log(`      ❌ Failed: ${statusMessage}`);
      
      if (error.response?.status === 401) {
        console.log('      Authentication error (401): Token may be invalid or missing');
      } else if (error.response?.status === 404) {
        console.log('      Not found (404): Endpoint does not exist');
      }
    }
  }
  
  return { success: false, message: 'All input formats failed', endpoint: apiEndpoint };
}

// Main test function
async function testHuggingFaceConnection() {
  console.log('Testing Hugging Face Spaces connection...\n');
  
  try {
    // Get the current settings
    const { data: spacesSettings, error: spacesError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'huggingface_spaces')
      .maybeSingle();
    
    if (spacesError) {
      console.error('Error fetching Hugging Face Spaces settings:', spacesError);
      process.exit(1);
    }
    
    if (!spacesSettings) {
      console.log('Hugging Face Spaces settings not found. Run the migration script first.');
      process.exit(1);
    }
    
    // Get the settings
    const settings = spacesSettings.value;
    const tiers = ['base', 'company', 'abstraction', 'user'];
    let anyEndpointWorked = false;
    
    for (const tier of tiers) {
      const spaceConfig = settings.spaces[tier];
      if (!spaceConfig.space_url) {
        console.log(`\nSkipping ${tier} Space (no URL configured)`);
        continue;
      }
      
      console.log(`\n----------------------------------------`);
      console.log(`Testing ${tier} Space: ${spaceConfig.space_url}`);
      console.log(`Current endpoint: ${spaceConfig.api_endpoint}`);
      console.log(`Authentication token: ${spaceConfig.auth_token ? 'Provided' : 'Not provided'}`);
      console.log(`----------------------------------------`);
      
      // Get the current auth token
      const authToken = spaceConfig.auth_token || null;
      let workingEndpoint = null;
      let workingFormat = null;
      
      // First test the currently configured endpoint
      console.log(`\nTesting current endpoint: ${spaceConfig.api_endpoint}`);
      const currentResult = await testEndpoint(
        spaceConfig.space_url, 
        spaceConfig.api_endpoint, 
        authToken
      );
      
      if (currentResult.success) {
        console.log('\n✅ CURRENT ENDPOINT IS WORKING!');
        console.log(`Input format: ${currentResult.inputFormat}`);
        workingEndpoint = spaceConfig.api_endpoint;
        workingFormat = currentResult.inputFormat;
        anyEndpointWorked = true;
        continue;
      }
      
      // If current endpoint fails, test each API endpoint
      console.log('\nTesting alternative endpoints:');
      let foundWorkingEndpoint = false;
      
      for (const endpoint of API_ENDPOINTS) {
        if (endpoint === spaceConfig.api_endpoint) continue; // Skip already tested endpoint
        
        const result = await testEndpoint(spaceConfig.space_url, endpoint, authToken);
        if (result.success) {
          workingEndpoint = endpoint;
          workingFormat = result.inputFormat;
          anyEndpointWorked = true;
          foundWorkingEndpoint = true;
          break;
        }
      }
      
      // Print results for this Space
      if (foundWorkingEndpoint) {
        console.log(`\n✅ Found working endpoint for ${tier} Space: ${workingEndpoint}`);
        console.log(`Input format: ${workingFormat}`);
        console.log('Consider updating your configuration to use this endpoint.');
      } else {
        console.log(`\n❌ No working endpoint found for ${tier} Space.`);
        console.log('Check that:');
        console.log('1. The Space URL is correct');
        console.log('2. The Space is running and not paused');
        console.log('3. You have provided the correct auth token if the Space is private');
      }
    }
    
    console.log('\n----------------------------------------');
    console.log('SUMMARY');
    console.log('----------------------------------------');
    
    if (anyEndpointWorked) {
      console.log('✅ At least one Space connection was successful!');
      console.log('Check the logs above for details on which endpoints and formats worked.');
    } else {
      console.log('❌ No working connections found for any configured Spaces.');
      console.log('Please check your Space URLs and auth tokens.');
      console.log('Make sure your Spaces are running and not paused.');
      console.log('If your Spaces are private, you MUST provide a valid authentication token.');
    }
    
  } catch (error) {
    console.error('Test script error:', error);
    process.exit(1);
  }
}

// Run the test
testHuggingFaceConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
