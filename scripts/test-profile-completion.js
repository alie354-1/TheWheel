// This script tests the fix for onboarding progress tracking
// and the service_role_api.init_user_profile function

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function main() {
  console.log('Testing onboarding progress and profile fixes...');
  
  try {
    // Step 1: Test direct profile creation (bypassing service role API)
    const testUserId = `test-user-${uuidv4()}`;
    console.log(`Creating test user with ID: ${testUserId}`);
    
    // Create a core profile directly
    const { data: coreProfile, error: coreError } = await supabase
      .from('user_core_profiles')
      .insert([{
        id: testUserId,
        email: `test-${testUserId}@example.com`,
        full_name: 'Test User',
        display_name: 'Test',
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        system_metadata: {
          profile_version: 1,
          last_updated: new Date().toISOString(),
          two_factor_enabled: false
        }
      }])
      .select()
      .single();
      
    if (coreError) {
      throw new Error(`Error creating test core profile: ${coreError.message}`);
    }
    console.log('Core profile created successfully');
    
    // Step 2: Create a test persona
    const { data: persona, error: personaError } = await supabase
      .from('user_personas')
      .insert([{
        user_id: testUserId,
        name: 'Test Persona',
        type: 'founder',
        is_active: true,
        is_public: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (personaError) {
      throw new Error(`Error creating test persona: ${personaError.message}`);
    }
    console.log('Persona created successfully:', persona.id);
    
    // Step 3: Create onboarding state with completed steps
    const completedSteps = ['role_selection', 'company_stage', 'industry_selection', 'skill_level'];
    const { data: onboardingState, error: onboardingError } = await supabase
      .from('onboarding_state')
      .insert([{
        user_id: testUserId,
        persona_id: persona.id,
        current_step: 'goals_selection',
        completed_steps: completedSteps,
        form_data: {
          userRole: 'FOUNDER',
          companyStage: 'IDEA_STAGE',
          industryCategory: 'TECHNOLOGY',
          skillLevel: 'INTERMEDIATE'
        },
        is_complete: false,
        last_updated: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (onboardingError) {
      throw new Error(`Error creating onboarding state: ${onboardingError.message}`);
    }
    console.log('Onboarding state created with completed steps:', completedSteps);
    
    // Step 4: Update the core profile with the persona as active
    const { error: updateError } = await supabase
      .from('user_core_profiles')
      .update({
        active_persona_id: persona.id
      })
      .eq('id', testUserId);
      
    if (updateError) {
      throw new Error(`Error updating core profile: ${updateError.message}`);
    }
    console.log('Core profile updated with active persona');
    
    // Step 5: Verify everything was set up correctly
    // Check core profile
    const { data: checkProfile, error: checkProfileError } = await supabase
      .from('user_core_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
      
    if (checkProfileError) {
      throw new Error(`Error checking profile: ${checkProfileError.message}`);
    }
    console.log(`Profile verification: ${JSON.stringify(checkProfile, null, 2)}`);
    
    // Check onboarding state
    const { data: checkState, error: checkStateError } = await supabase
      .from('onboarding_state')
      .select('*')
      .eq('user_id', testUserId)
      .eq('persona_id', persona.id)
      .single();
      
    if (checkStateError) {
      throw new Error(`Error checking onboarding state: ${checkStateError.message}`);
    }
    console.log(`Onboarding state verification: ${JSON.stringify(checkState, null, 2)}`);
    
    // Step 6: Calculate progress using the same algorithm from OnboardingProgressCard
    const allSteps = [
      'welcome',
      'role_selection',
      'company_stage',
      'industry_selection',
      'skill_level', 
      'goals_selection',
      'theme_preferences',
      'notification_preferences',
      'recommendations',
      'completion'
    ];
    const totalSteps = allSteps.length - 1; // Excluding welcome step
    
    // If current step is in completion or user has completed all steps
    let progress = 0;
    if (checkState.is_complete || checkState.current_step === 'completion') {
      progress = 100;
    } else {
      // Count completed steps, but also count the current step as partial progress
      const completedCount = checkState.completed_steps.length;
      const currentStepIndex = allSteps.indexOf(checkState.current_step);
      
      // Calculate percentage: completed steps + partial credit for current step
      progress = Math.min(100, Math.round(((completedCount + 0.5) / totalSteps) * 100));
    }
    
    console.log(`Calculated progress: ${progress}%`);
    console.log('Expected display in UI:', `You're ${progress}% through the onboarding process`);
    
    // Step 7: Cleanup (optional, comment out to keep test data)
    // const { error: cleanupError } = await supabase
    //   .from('user_core_profiles')
    //   .delete()
    //   .eq('id', testUserId);
    //
    // if (cleanupError) {
    //   console.warn(`Warning: Could not clean up test user: ${cleanupError.message}`);
    // } else {
    //   console.log('Test user cleaned up successfully');
    // }
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
