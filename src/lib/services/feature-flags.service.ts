import { supabase } from '../supabase';
import { useAuthStore, FeatureFlags } from '../store';

/**
 * Feature Flags Service
 * This service is responsible for loading and saving feature flags from the database
 */
class FeatureFlagsService {
  /**
   * Load feature flags from the database
   * @returns A promise that resolves when the feature flags are loaded
   */
  async loadFeatureFlags(): Promise<void> {
    try {
      console.log('Loading feature flags from database...');
      
      // Get the feature flags from the database
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'feature_flags')
        .maybeSingle();
      
      if (error) {
        console.error('Error loading feature flags:', error);
        return;
      }
      
      if (data?.value) {
        console.log('Feature flags loaded from database:', data.value);
        
        // Update the store with the feature flags from the database
        const { setFeatureFlags } = useAuthStore.getState();
        setFeatureFlags(data.value);
      } else {
        console.log('No feature flags found in database, using defaults');
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  }
  
  /**
   * Save feature flags to the database
   * @param flags The feature flags to save
   * @returns A promise that resolves when the feature flags are saved
   */
  async saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<void> {
    try {
      console.log('Saving feature flags to database:', flags);
      
      // Check if the feature flags record exists
      const { data: existingFlags, error: checkError } = await supabase
        .from('app_settings')
        .select('key')
        .eq('key', 'feature_flags')
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking feature flags:', checkError);
        return;
      }
      
      // Get the current feature flags from the store
      const { featureFlags } = useAuthStore.getState();
      
      // Merge the new flags with the current flags
      const updatedFlags = { ...featureFlags };
      Object.entries(flags).forEach(([key, value]) => {
        if (updatedFlags[key]) {
          updatedFlags[key] = { ...updatedFlags[key], ...value };
        } else {
          updatedFlags[key] = value as { enabled: boolean; visible: boolean };
        }
      });
      
      if (existingFlags?.key === 'feature_flags') {
        // Update existing record
        const { error: updateError } = await supabase
          .from('app_settings')
          .update({
            value: updatedFlags,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'feature_flags');
        
        if (updateError) {
          console.error('Error updating feature flags:', updateError);
          return;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            key: 'feature_flags',
            value: updatedFlags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting feature flags:', insertError);
          return;
        }
      }
      
      console.log('Feature flags saved to database');
      
      // Update the store with the new feature flags
      const { setFeatureFlags } = useAuthStore.getState();
      setFeatureFlags(updatedFlags);
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }
  
  /**
   * Reset the LLM service to use the latest feature flags
   * This is needed because the LLM service is a singleton that caches the feature flags
   */
  resetLLMService(): void {
    try {
      // Import the resetGeneralLLMService function
      // Use a direct import instead of require to avoid issues
      import('./general-llm.service').then(module => {
        // Reset the LLM service
        module.resetGeneralLLMService();
        console.log('LLM service reset to use latest feature flags');
      }).catch(error => {
        console.error('Error importing general-llm.service:', error);
      });
    } catch (error) {
      console.error('Error resetting LLM service:', error);
    }
  }
}

// Create a singleton instance of the service
export const featureFlagsService = new FeatureFlagsService();
