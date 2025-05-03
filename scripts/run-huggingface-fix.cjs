/**
 * Runner script for the Hugging Face Spaces endpoint fix
 * 
 * This script uses CommonJS syntax with .cjs extension to avoid ES module issues.
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
