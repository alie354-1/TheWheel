import { supabase } from '../src/lib/supabase.js';

// The ID of the mock user
const MOCK_USER_ID = 'mock-user-id';

async function resetOnboardingState() {
  console.log('Resetting onboarding state for mock user...');
  
  try {
    // First, get the current profile
    const { data: profile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', MOCK_USER_ID)
      .single();
      
    if (getError) {
      console.error('Error fetching profile:', getError);
      return;
    }
    
    // Update the profile to reset onboarding flags
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        setup_progress: {
          ...profile.setup_progress,
          form_data: {
            ...(profile.setup_progress?.form_data || {}),
            initialOnboardingComplete: false
          }
        }
      })
      .eq('id', MOCK_USER_ID);
      
    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }
    
    console.log('Successfully reset onboarding state for mock user');
    console.log('Visit http://localhost:5173/initial-onboarding to test the onboarding flow');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
resetOnboardingState();
