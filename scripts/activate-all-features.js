/**
 * This script activates all feature flags for the Idea Playground
 * to make sure all features are visible and available to users.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function activateAllFeatures() {
  console.log('Activating all feature flags for the Idea Playground...');

  try {
    // Get all feature flags from the app_settings table
    const { data: appSettings, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'feature_flags');

    if (error) {
      throw error;
    }

    let featureFlags = {};

    // If there are existing feature flags, use them as a base
    if (appSettings && appSettings.length > 0) {
      featureFlags = appSettings[0].value.features || {};
    }

    // Ensure all important feature flags are enabled
    const updatedFeatureFlags = {
      ...featureFlags,
      // Enhanced Idea Playground features
      useRealAI: { enabled: true, description: 'Use real AI service instead of mock' },
      multiTieredAI: { enabled: true, description: 'Use multi-tiered AI service for enhanced responses' },
      showTeamCollaboration: { enabled: true, description: 'Show team collaboration features' },
      showDashboard: { enabled: true, description: 'Show analytics dashboard' },
      showExportTools: { enabled: true, description: 'Show export tools features' },
      showExternalTools: { enabled: true, description: 'Show external tools integration' },
      showPathwayIntegration: { enabled: true, description: 'Enable pathway integration with enhanced workspace' },
      showIdeaWorkflow: { enabled: true, description: 'Show structured idea workflow' },
      useSmartSuggestions: { enabled: true, description: 'Enable smart suggestions in forms' },
      useContextualAI: { enabled: true, description: 'Enable contextual AI panel' },
      useOnboarding: { enabled: true, description: 'Show onboarding tutorials' },
    };

    // Update the feature flags in the database
    const { error: updateError } = await supabase
      .from('app_settings')
      .upsert({
        key: 'feature_flags',
        value: { features: updatedFeatureFlags },
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      throw updateError;
    }

    console.log('All features activated successfully!');
    console.log('The following features are now enabled:');
    Object.entries(updatedFeatureFlags).forEach(([key, value]) => {
      console.log(`- ${key}: ${value.enabled ? 'Enabled' : 'Disabled'} (${value.description})`);
    });

  } catch (error) {
    console.error('Error activating features:', error);
  }
}

// Execute the function
activateAllFeatures();
