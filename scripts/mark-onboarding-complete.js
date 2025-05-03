import { supabase } from '../src/lib/supabase';
import { multiPersonaProfileService } from '../src/lib/services/multi-persona-profile.service';

// All onboarding steps in order
const ALL_ONBOARDING_STEPS = [
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

// We'll mark all steps as completed except for 'completion' which will be the current step
const COMPLETED_STEPS = ALL_ONBOARDING_STEPS.filter(step => step !== 'completion');

/**
 * Script to mark onboarding as complete for all existing users
 * This helps users who completed onboarding before the multi-persona 
 * system was implemented, ensuring they don't have to repeat the process
 */
async function markOnboardingComplete() {
  console.log('===== Mark Onboarding Complete for Existing Users =====');
  
  const stats = {
    usersProcessed: 0,
    personasProcessed: 0,
    newStatesCreated: 0,
    statesUpdated: 0,
    errors: 0
  };
  
  try {
    // Get all users from the core profiles table
    console.log('Fetching all user profiles...');
    const { data: users, error: usersError } = await supabase
      .from('user_core_profiles')
      .select('id, email, full_name');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users to process`);
    
    // Process each user
    for (const user of users) {
      console.log(`\nProcessing user: ${user.full_name || user.email || user.id}`);
      
      try {
        // Get all personas for this user
        const personas = await multiPersonaProfileService.getPersonas(user.id);
        
        if (personas.length === 0) {
          console.log(`No personas found for user ${user.id}, creating default persona...`);
          // This will create a default persona and onboarding state
          await multiPersonaProfileService.getActivePersona(user.id);
          
          // Fetch personas again
          const newPersonas = await multiPersonaProfileService.getPersonas(user.id);
          
          if (newPersonas.length > 0) {
            console.log(`Created default persona for user ${user.id}`);
            // Process the newly created persona
            await processPersonas(user.id, newPersonas, stats);
          } else {
            console.error(`Failed to create default persona for user ${user.id}`);
            stats.errors++;
          }
        } else {
          // Process existing personas
          await processPersonas(user.id, personas, stats);
        }
        
        stats.usersProcessed++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        stats.errors++;
      }
    }
    
    console.log('\n===== Processing Complete =====');
    console.log(`Users processed: ${stats.usersProcessed}`);
    console.log(`Personas processed: ${stats.personasProcessed}`);
    console.log(`New onboarding states created: ${stats.newStatesCreated}`);
    console.log(`Existing onboarding states updated: ${stats.statesUpdated}`);
    console.log(`Errors encountered: ${stats.errors}`);
  } catch (error) {
    console.error('Error running script:', error);
  }
}

/**
 * Process all personas for a given user
 */
async function processPersonas(userId, personas, stats) {
  for (const persona of personas) {
    console.log(`- Processing persona: ${persona.name} (${persona.id})`);
    
    try {
      // Check if onboarding state exists
      const { data: state, error } = await supabase
        .from('onboarding_state')
        .select('*')
        .eq('user_id', userId)
        .eq('persona_id', persona.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means not found
        console.error(`  Error checking onboarding state: ${error.message}`);
        stats.errors++;
        continue;
      }
      
      if (!state) {
        // No onboarding state found, create one that's marked complete
        console.log(`  Creating completed onboarding state for persona ${persona.id}`);
        
        const { error: insertError } = await supabase
          .from('onboarding_state')
          .insert([{
            user_id: userId,
            persona_id: persona.id,
            current_step: 'completion',
            completed_steps: COMPLETED_STEPS,
            form_data: { 
              initialOnboardingComplete: true,
              completedAt: new Date().toISOString()
            },
            is_complete: true,
            last_updated: new Date().toISOString(),
            metrics: {
              step_completion_times: {},
              total_time_spent: 0
            }
          }]);
        
        if (insertError) {
          console.error(`  Error creating onboarding state: ${insertError.message}`);
          stats.errors++;
        } else {
          console.log(`  ✅ Created completed onboarding state`);
          stats.newStatesCreated++;
        }
      } else if (!state.is_complete) {
        // Onboarding state exists but isn't complete, update it
        console.log(`  Updating onboarding state for persona ${persona.id}`);
        
        const { error: updateError } = await supabase
          .from('onboarding_state')
          .update({
            current_step: 'completion',
            completed_steps: COMPLETED_STEPS,
            form_data: { 
              ...state.form_data,
              initialOnboardingComplete: true,
              completedAt: new Date().toISOString()
            },
            is_complete: true,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('persona_id', persona.id);
        
        if (updateError) {
          console.error(`  Error updating onboarding state: ${updateError.message}`);
          stats.errors++;
        } else {
          console.log(`  ✅ Updated onboarding state to complete`);
          stats.statesUpdated++;
        }
      } else {
        // Already complete, nothing to do
        console.log(`  ✓ Onboarding already complete, no action needed`);
      }
      
      stats.personasProcessed++;
    } catch (error) {
      console.error(`  Error processing persona ${persona.id}:`, error);
      stats.errors++;
    }
  }
}

// Run the script
markOnboardingComplete().catch(console.error);
