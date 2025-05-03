/**
 * Test Onboarding Flow Script
 * 
 * This script tests the onboarding flow by:
 * 1. Using mock auth to simulate a new user
 * 2. Monitoring state changes in the onboarding process
 * 3. Reporting any errors or issues during transitions
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

// Initialize Supabase client with service key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test user data
const TEST_USER_EMAIL = 'onboarding-test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

async function setupTestUser() {
  console.log('Setting up test user...');

  // Check if test user already exists
  const { data: existingUser, error: getUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', TEST_USER_EMAIL)
    .single();

  if (getUserError && getUserError.code !== 'PGRST116') {
    console.error('Error checking for existing user:', getUserError);
    return null;
  }

  if (existingUser) {
    console.log('Test user already exists with ID:', existingUser.id);
    
    // Clean up existing onboarding data for this user
    console.log('Cleaning up existing onboarding data...');
    
    // Delete any personas
    const { error: deletePersonasError } = await supabase
      .from('personas')
      .delete()
      .eq('user_id', existingUser.id);
      
    if (deletePersonasError) {
      console.error('Error deleting existing personas:', deletePersonasError);
    }
    
    // Reset profile setup progress
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        setup_progress: {
          completed_steps: [],
          current_step: null,
          form_data: {},
          is_complete: false
        }
      })
      .eq('id', existingUser.id);
      
    if (updateProfileError) {
      console.error('Error resetting profile setup progress:', updateProfileError);
    }
    
    return existingUser.id;
  }

  // Create new test user
  const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true
  });

  if (signUpError) {
    console.error('Error creating test user:', signUpError);
    return null;
  }

  console.log('Created new test user with ID:', newUser.user.id);
  return newUser.user.id;
}

async function monitorOnboardingState(userId) {
  console.log('Setting up monitoring for onboarding state...');
  
  // Create a baseline profile
  const { error: createProfileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Test User',
      setup_progress: {
        completed_steps: [],
        current_step: 'welcome',
        form_data: {},
        is_complete: false
      }
    });
    
  if (createProfileError) {
    console.error('Error creating test profile:', createProfileError);
  }
  
  // Subscribe to changes on the personas table
  console.log('Monitoring persona creation...');
  const personaSubscription = supabase
    .channel('public:personas')
    .on('INSERT', payload => {
      if (payload.new && payload.new.user_id === userId) {
        console.log('New persona created:', payload.new);
      }
    })
    .subscribe();
    
  // Subscribe to changes on the onboarding_state table
  console.log('Monitoring onboarding state changes...');
  const onboardingSubscription = supabase
    .channel('public:onboarding_state')
    .on('INSERT', payload => {
      if (payload.new && payload.new.user_id === userId) {
        console.log('New onboarding state created:', payload.new);
      }
    })
    .on('UPDATE', payload => {
      if (payload.new && payload.new.user_id === userId) {
        console.log('Onboarding state updated:', payload.new);
      }
    })
    .subscribe();
    
  // Also poll for state changes every 2 seconds
  const pollInterval = setInterval(async () => {
    // Check profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('setup_progress')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile state:', profileError);
    } else if (profile && profile.setup_progress) {
      console.log('Current profile setup progress:', profile.setup_progress);
    }
    
    // Check personas
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', userId);
      
    if (personasError) {
      console.error('Error checking personas:', personasError);
    } else if (personas && personas.length > 0) {
      console.log('Current personas count:', personas.length);
      
      // For each persona, check onboarding state
      for (const persona of personas) {
        const { data: onboardingState, error: onboardingError } = await supabase
          .from('onboarding_state')
          .select('*')
          .eq('user_id', userId)
          .eq('persona_id', persona.id)
          .single();
          
        if (onboardingError && onboardingError.code !== 'PGRST116') {
          console.error('Error checking onboarding state:', onboardingError);
        } else if (onboardingState) {
          console.log(`Onboarding state for persona ${persona.id}:`, onboardingState);
        }
      }
    }
  }, 2000);
  
  console.log(`
--------------------------------------------------------------------------------
Test user ready for onboarding testing
Email: ${TEST_USER_EMAIL}
Password: ${TEST_USER_PASSWORD}
--------------------------------------------------------------------------------

INSTRUCTIONS:
1. Log in with the test user credentials
2. Observe the onboarding flow - it should progress smoothly without flickering
3. Check the console logs for any errors or issues
4. Press Ctrl+C in this terminal when you're done testing

Monitoring onboarding state changes...
`);
  
  // Keep the script running until the user terminates it
  process.stdin.resume();
  
  // Clean up on exit
  process.on('SIGINT', () => {
    console.log('Cleaning up...');
    clearInterval(pollInterval);
    personaSubscription.unsubscribe();
    onboardingSubscription.unsubscribe();
    process.exit(0);
  });
}

async function main() {
  try {
    const userId = await setupTestUser();
    if (!userId) {
      console.error('Failed to set up test user. Exiting.');
      process.exit(1);
    }
    
    await monitorOnboardingState(userId);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main();
