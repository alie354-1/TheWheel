/**
 * Enhanced Profile System Migration Script
 * 
 * This script runs the SQL migration for the enhanced profile system
 * and provides verification of successful implementation.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Migration file path
const migrationFilePath = path.join(
  __dirname,
  '../supabase/migrations/20250316145000_enhanced_profile_completion.sql'
);

async function runMigration() {
  try {
    console.log('Starting Enhanced Profile System migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .replace(/\/\*.*?\*\//gms, '') // Remove block comments
      .replace(/--.*$/gm, '') // Remove line comments
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        // Using rpc to execute raw SQL
        await supabase.rpc('exec_sql', { sql: statement + ';' });
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        throw error;
      }
    }
    
    console.log('Migration executed successfully.');
    await verifyMigration();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function verifyMigration() {
  console.log('Verifying migration...');
  
  try {
    // Verify tables were created
    const tables = [
      'profile_sections',
      'user_work_experience',
      'user_education',
      'professional_services',
      'profile_notifications',
      'company_invitations'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', table)
        .eq('table_schema', 'public');
      
      if (error) {
        throw new Error(`Error verifying table ${table}: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error(`Table ${table} not found after migration`);
      }
      
      console.log(`✓ Table ${table} created successfully`);
    }
    
    // Verify columns were added to profiles table
    const columns = [
      'completion_percentage',
      'completion_last_updated',
      'primary_role',
      'additional_roles',
      'onboarding_completed'
    ];
    
    for (const column of columns) {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public')
        .eq('column_name', column);
      
      if (error) {
        throw new Error(`Error verifying column ${column}: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error(`Column ${column} not found in profiles table after migration`);
      }
      
      console.log(`✓ Column ${column} added to profiles table`);
    }
    
    // Verify views were created
    const views = [
      'enhanced_profiles',
      'service_provider_directory',
      'company_members_directory'
    ];
    
    for (const view of views) {
      const { data, error } = await supabase
        .from('information_schema.views')
        .select('table_name')
        .eq('table_name', view)
        .eq('table_schema', 'public');
      
      if (error) {
        throw new Error(`Error verifying view ${view}: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error(`View ${view} not found after migration`);
      }
      
      console.log(`✓ View ${view} created successfully`);
    }
    
    // Verify functions were created
    const functions = [
      'calculate_section_completion',
      'update_profile_completion',
      'create_milestone_notification'
    ];
    
    for (const func of functions) {
      const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_name', func)
        .eq('routine_schema', 'public');
      
      if (error) {
        throw new Error(`Error verifying function ${func}: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error(`Function ${func} not found after migration`);
      }
      
      console.log(`✓ Function ${func} created successfully`);
    }
    
    console.log('All migration components verified successfully!');
    console.log('Enhanced Profile System migration complete.');
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

console.log('Enhanced Profile System Migration Script');
console.log('---------------------------------------');
runMigration()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
