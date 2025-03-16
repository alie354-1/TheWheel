/**
 * Initialize Profile Sections Script
 * 
 * This script creates default profile sections for a test user
 * to demonstrate the enhanced profile system functionality.
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// User ID to initialize (should be passed as argument)
const userId = process.argv[2];

if (!userId) {
  console.error('Error: User ID is required');
  console.log('Usage: node init-profile-sections.js <user-id>');
  process.exit(1);
}

async function initializeSections() {
  try {
    console.log(`Initializing profile sections for user: ${userId}`);
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();
    
    if (userError) {
      throw new Error(`User not found: ${userError.message}`);
    }
    
    console.log(`Found user: ${user.full_name} (${user.email})`);
    
    // Set primary role for testing
    const primaryRole = 'founder';
    
    // Update the user's profile with primary role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        primary_role: primaryRole,
        additional_roles: ['service_provider'],
        onboarding_completed: true
      })
      .eq('id', userId);
    
    if (updateError) {
      throw new Error(`Error updating profile: ${updateError.message}`);
    }
    
    console.log(`Updated profile with primary role: ${primaryRole}`);
    
    // Check if sections already exist
    const { data: existingSections, error: sectionsError } = await supabase
      .from('profile_sections')
      .select('id')
      .eq('user_id', userId);
    
    if (sectionsError) {
      throw new Error(`Error checking existing sections: ${sectionsError.message}`);
    }
    
    if (existingSections && existingSections.length > 0) {
      console.log(`Found ${existingSections.length} existing sections. Deleting...`);
      
      // Delete existing sections
      const { error: deleteError } = await supabase
        .from('profile_sections')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        throw new Error(`Error deleting existing sections: ${deleteError.message}`);
      }
      
      console.log('Existing sections deleted.');
    }
    
    // Create universal sections
    console.log('Creating universal sections...');
    
    const universalSections = [
      {
        user_id: userId,
        section_key: 'basic_info',
        title: 'Basic Information',
        description: 'Your name, headline, and profile photo',
        is_required: true,
        display_order: 1,
        required_fields: [
          { field: 'full_name' },
          { field: 'avatar_url' }
        ],
        optional_fields: [
          { field: 'headline' },
          { field: 'location' }
        ],
        is_role_specific: false,
        completion_percentage: 50
      },
      {
        user_id: userId,
        section_key: 'bio',
        title: 'About You',
        description: 'Tell others about yourself and your background',
        is_required: true,
        display_order: 2,
        required_fields: [
          { field: 'bio' }
        ],
        optional_fields: [
          { field: 'summary' }
        ],
        is_role_specific: false,
        completion_percentage: 0
      },
      {
        user_id: userId,
        section_key: 'skills',
        title: 'Skills & Expertise',
        description: 'List your professional skills and proficiency',
        is_required: false,
        display_order: 3,
        required_fields: [],
        optional_fields: [
          { field: 'skills' },
          { field: 'languages' }
        ],
        is_role_specific: false,
        completion_percentage: 0
      }
    ];
    
    const { error: universalError } = await supabase
      .from('profile_sections')
      .insert(universalSections);
    
    if (universalError) {
      throw new Error(`Error creating universal sections: ${universalError.message}`);
    }
    
    console.log(`Created ${universalSections.length} universal sections.`);
    
    // Create founder-specific sections
    if (primaryRole === 'founder') {
      console.log('Creating founder-specific sections...');
      
      const founderSections = [
        {
          user_id: userId,
          section_key: 'founder_info',
          title: 'Founder Information',
          description: 'Details about your founder journey',
          is_required: true,
          display_order: 4,
          required_fields: [
            { field: 'company_stage' }
          ],
          optional_fields: [
            { field: 'previous_ventures' },
            { field: 'funding_history' }
          ],
          is_role_specific: true,
          applicable_roles: ['founder'],
          completion_percentage: 0
        },
        {
          user_id: userId,
          section_key: 'startup_details',
          title: 'Startup Details',
          description: 'Information about your current venture',
          is_required: false,
          display_order: 5,
          required_fields: [],
          optional_fields: [
            { field: 'company_name' },
            { field: 'company_description' },
            { field: 'company_industry' }
          ],
          is_role_specific: true,
          applicable_roles: ['founder'],
          completion_percentage: 0
        }
      ];
      
      const { error: founderError } = await supabase
        .from('profile_sections')
        .insert(founderSections);
      
      if (founderError) {
        throw new Error(`Error creating founder sections: ${founderError.message}`);
      }
      
      console.log(`Created ${founderSections.length} founder sections.`);
    }
    
    // Create service provider sections (since user has service_provider as additional role)
    console.log('Creating service provider sections...');
    
    const serviceProviderSections = [
      {
        user_id: userId,
        section_key: 'services_offered',
        title: 'Services Offered',
        description: 'Professional services you provide',
        is_required: true,
        display_order: 6,
        required_fields: [
          { field: 'service_categories' }
        ],
        optional_fields: [
          { field: 'rate_information' },
          { field: 'availability' }
        ],
        is_role_specific: true,
        applicable_roles: ['service_provider'],
        completion_percentage: 0
      },
      {
        user_id: userId,
        section_key: 'portfolio',
        title: 'Portfolio & Work Samples',
        description: 'Showcase your past work and results',
        is_required: false,
        display_order: 7,
        required_fields: [],
        optional_fields: [
          { field: 'case_studies' },
          { field: 'testimonials' },
          { field: 'work_samples' }
        ],
        is_role_specific: true,
        applicable_roles: ['service_provider'],
        completion_percentage: 0
      }
    ];
    
    const { error: serviceProviderError } = await supabase
      .from('profile_sections')
      .insert(serviceProviderSections);
    
    if (serviceProviderError) {
      throw new Error(`Error creating service provider sections: ${serviceProviderError.message}`);
    }
    
    console.log(`Created ${serviceProviderSections.length} service provider sections.`);
    
    // Create a test notification
    console.log('Creating test notification...');
    
    const notification = {
      user_id: userId,
      type: 'milestone',
      priority: 'standard',
      title: 'Profile 25% Complete',
      description: 'You\'ve made a great start on your profile! Keep going to unlock more features.',
      action_url: '/profile',
      action_label: 'Complete Profile',
      icon: 'milestone_25',
      is_read: false,
      triggered_by: 'system'
    };
    
    const { error: notificationError } = await supabase
      .from('profile_notifications')
      .insert(notification);
    
    if (notificationError) {
      throw new Error(`Error creating notification: ${notificationError.message}`);
    }
    
    console.log('Test notification created.');
    
    // Update overall profile completion
    console.log('Updating overall profile completion...');
    
    // Use the database function to calculate
    await supabase.rpc('update_profile_completion', { p_user_id: userId });
    
    console.log('Profile completion updated.');
    
    console.log('Profile sections initialized successfully!');
    
    // Get final completion percentage
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('completion_percentage')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      throw new Error(`Error getting updated profile: ${profileError.message}`);
    }
    
    console.log(`Current profile completion: ${updatedProfile.completion_percentage}%`);
    
  } catch (error) {
    console.error('Error initializing profile sections:', error);
    process.exit(1);
  }
}

console.log('Profile Sections Initialization Script');
console.log('--------------------------------------');
initializeSections()
  .then(() => {
    console.log('Initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
