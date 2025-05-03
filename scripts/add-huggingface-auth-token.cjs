/**
 * This script adds an authentication token to the Hugging Face Spaces settings.
 * It's needed for accessing private Spaces.
 */

// Load required libraries
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get auth token from command line
const authToken = process.argv[2];
if (!authToken) {
  console.error('Error: Auth token not provided');
  console.log('Usage: node scripts/add-huggingface-auth-token.cjs YOUR_HUGGINGFACE_TOKEN');
  process.exit(1);
}

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

// Main function
async function addAuthToken() {
  console.log('Adding Hugging Face auth token...');
  
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
    
    console.log('Current settings found. Updating with auth token...');
    
    // Update all spaces with the auth token
    const settings = spacesSettings.value;
    const tiers = ['base', 'company', 'abstraction', 'user'];
    
    for (const tier of tiers) {
      if (settings.spaces[tier].space_url) {
        console.log(`Adding auth token to ${tier} Space...`);
        settings.spaces[tier].auth_token = authToken;
      }
    }
    
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
      process.exit(1);
    }
    
    console.log('✅ Successfully added auth token to all Space configurations.');
    console.log('Now your application should be able to access your private Spaces.');
    
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
}

// Run the function
addAuthToken()
  .then(() => console.log('Auth token update completed.'))
  .catch(error => {
    console.error('Unhandled error:', error);
  });
