#!/usr/bin/env node

/**
 * Database Settings Checker for Hugging Face
 * 
 * This script verifies that Hugging Face settings are properly stored
 * in your Supabase database and available to the application.
 * 
 * Usage:
 * node scripts/check-huggingface-db-settings.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.log('Make sure your .env file contains SUPABASE_URL and SUPABASE_ANON_KEY variables.');
  process.exit(1);
}

async function checkHuggingFaceSettings() {
  console.log('Hugging Face Database Settings Checker');
  console.log('=====================================\n');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('Testing database connection...');
    
    // First check the app_settings table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('app_settings')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accessing app_settings table:');
      console.error(`   ${tableError.message}`);
      console.log('\nPossible issues:');
      console.log('1. The app_settings table does not exist');
      console.log('2. The current user does not have permissions to access the table');
      console.log('3. Database connection error');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');
    
    // Now check for Hugging Face settings
    console.log('Checking for Hugging Face settings...');
    
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'huggingface')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying Hugging Face settings:');
      console.error(`   ${error.message}`);
      process.exit(1);
    }
    
    if (!data || data.length === 0) {
      console.log('❌ No Hugging Face settings found in the database.');
      console.log('\nRecommendation:');
      console.log('1. Go to Settings > Integrations in your application');
      console.log('2. Configure Hugging Face settings and save them');
      console.log('3. Run this script again to verify settings were saved correctly');
      process.exit(1);
    }
    
    // We found settings
    console.log('✅ Hugging Face settings found in database\n');
    
    const settings = data[0].value;
    
    console.log('Settings Details:');
    console.log('-----------------');
    
    // Check API key
    if (settings.api_key) {
      const maskedKey = `${settings.api_key.substring(0, 5)}${'*'.repeat(Math.max(0, settings.api_key.length - 5))}`;
      console.log(`API key: ${maskedKey}`);
      
      if (!settings.api_key.startsWith('hf_') || settings.api_key.length < 5) {
        console.log('❌ API key format is invalid. Should start with "hf_" and be at least 5 characters');
      } else {
        console.log('✅ API key format appears valid');
      }
    } else {
      console.log('❌ No API key configured');
    }
    
    // Check enabled status
    console.log(`Enabled: ${settings.enabled ? 'Yes ✅' : 'No ❌'}`);
    
    // Check model configurations
    console.log('\nModel Configurations:');
    if (settings.spaces) {
      for (const [tier, config] of Object.entries(settings.spaces)) {
        if (config.model_id) {
          console.log(`- ${tier}: ${config.model_id} ✅`);
        } else {
          console.log(`- ${tier}: Not configured ❌`);
        }
      }
    } else {
      console.log('❌ No model configurations found');
    }
    
    // Check default tier
    console.log(`\nDefault tier: ${settings.default_tier || 'Not set ❌'}`);
    
    // Final summary
    console.log('\nSummary:');
    if (settings.api_key && settings.enabled && settings.spaces) {
      console.log('✅ Basic Hugging Face configuration is complete');
      console.log('   However, your API key may still be invalid or expired (401 errors)');
      console.log('   Use the API key validation scripts to test your key directly');
    } else {
      console.log('❌ Hugging Face configuration is incomplete');
      console.log('   Please complete the configuration in Settings > Integrations');
    }
    
  } catch (error) {
    console.error('\nUnexpected error during database check:', error);
    process.exit(1);
  }
}

// Run the check
checkHuggingFaceSettings();
