// Initialize Feature Flags
// This script creates the initial feature flags in the app_settings table

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default feature flags
const defaultFeatureFlags = {
  // Navigation features
  ideaHub: { enabled: true, visible: true },
  community: { enabled: false, visible: false },
  messages: { enabled: false, visible: false },
  directory: { enabled: false, visible: false },
  library: { enabled: false, visible: false },
  marketplace: { enabled: false, visible: false },
  legalHub: { enabled: false, visible: false },
  devHub: { enabled: false, visible: false },
  utilities: { enabled: false, visible: false },
  financeHub: { enabled: false, visible: false },
  adminPanel: { enabled: true, visible: true },
  
  // Component features
  aiCofounder: { enabled: false, visible: false },
  marketResearch: { enabled: false, visible: false },
  pitchDeck: { enabled: false, visible: false },
  documentStore: { enabled: false, visible: false },
  teamManagement: { enabled: false, visible: false },
  
  // Feature flags for mock services
  useMockAuth: { enabled: true, visible: true },
  useMockAI: { enabled: false, visible: true },
  
  // Enhanced Idea Playground feature flags
  enhancedIdeaPlayground: { enabled: true, visible: true },
  useRealAI: { enabled: true, visible: true },
  multiTieredAI: { enabled: false, visible: true }
};

async function initializeFeatureFlags() {
  console.log('Initializing feature flags...');
  
  try {
    // Check if feature flags already exist
    const { data: existingFlags, error: checkError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'feature_flags');
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingFlags && existingFlags.length > 0) {
      console.log('Feature flags already exist. Updating...');
      
      // Update existing flags
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({
          value: defaultFeatureFlags,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'feature_flags');
      
      if (updateError) {
        throw updateError;
      }
      
      console.log('Feature flags updated successfully!');
    } else {
      console.log('Feature flags do not exist. Creating...');
      
      // Insert new flags
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          key: 'feature_flags',
          value: defaultFeatureFlags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        throw insertError;
      }
      
      console.log('Feature flags created successfully!');
    }
  } catch (error) {
    console.error('Error initializing feature flags:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeFeatureFlags()
  .then(() => {
    console.log('Feature flags initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
