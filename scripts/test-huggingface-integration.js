/**
 * Test script for Hugging Face integration
 * 
 * This script tests the direct connection to Hugging Face API
 * and verifies the settings are properly loaded.
 */
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase details from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testHuggingFaceIntegration() {
  console.log('🔍 Testing Hugging Face Integration');
  console.log('----------------------------------');

  try {
    // Step 1: Check if Hugging Face settings exist
    console.log('Step 1: Checking Hugging Face settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'huggingface')
      .single();

    if (settingsError) {
      throw new Error(`Error retrieving Hugging Face settings: ${settingsError.message}`);
    }

    if (!settings || !settings.value) {
      throw new Error('Hugging Face settings not found. Please configure them in the Settings page.');
    }

    console.log('✅ Found Hugging Face settings');

    const hfSettings = settings.value;
    const apiKey = hfSettings.api_key;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not set. Please add your API key in the Settings page.');
    }

    // Step 2: Check if Hugging Face is enabled
    console.log('Step 2: Checking if Hugging Face is enabled...');
    const { data: featureFlags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('key', 'useHuggingFace')
      .single();

    if (flagsError) {
      console.warn(`Warning: Could not check if Hugging Face is enabled: ${flagsError.message}`);
    } else if (!featureFlags || !featureFlags.value || !featureFlags.value.enabled) {
      console.warn('Warning: Hugging Face is currently disabled. Enable it in Settings to use it.');
    } else {
      console.log('✅ Hugging Face is enabled');
    }

    // Step 3: Test connection to Hugging Face API with the base model
    console.log('Step 3: Testing connection to Hugging Face API...');
    const defaultTier = hfSettings.default_tier || 'base';
    const modelId = hfSettings.spaces?.[defaultTier]?.model_id;
    
    if (!modelId) {
      throw new Error(`Model ID for ${defaultTier} tier not set.`);
    }

    const testPrompt = 'Test query from the application. Please respond with "Success" if you receive this.';
    console.log(`Using model: ${modelId}`);
    console.log(`Sending test prompt: "${testPrompt}"`);

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(modelId)}`,
      { 
        inputs: testPrompt,
        parameters: { max_new_tokens: 10 }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log('✅ Successfully connected to Hugging Face API');
      console.log('Response data:', response.data);
    } else {
      throw new Error(`Unexpected response from Hugging Face API: ${response.status}`);
    }

    console.log('----------------------------------');
    console.log('🎉 Hugging Face integration test complete! All tests passed.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('API Error Details:');
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, error.response.data);
    }
    
    process.exit(1);
  }
}

testHuggingFaceIntegration();
