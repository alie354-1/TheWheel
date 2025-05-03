/**
 * Script to apply the journey steps migration
 * 
 * This script applies the SQL migration to add necessary columns to the journey_steps table
 * and create the views and functions needed for the new UI components.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting journey steps migration...');
    
    // Read migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250501000000_create_step_enhanced_views.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into statements to execute them one by one
    // This is a simple approach - in a production environment, you might use a more robust SQL parser
    const sqlStatements = migrationSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${sqlStatements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
      
      try {
        // Execute using raw SQL
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement);
        }
      } catch (statementError) {
        console.error(`Exception executing statement ${i + 1}:`, statementError);
        console.error('Statement:', statement);
      }
    }
    
    console.log('✅ Migration completed!');
    
    // Verify table columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('journey_steps')
      .select('difficulty_level, estimated_time_min, estimated_time_max, key_outcomes')
      .limit(1);
    
    if (columnsError) {
      console.error('Error verifying columns:', columnsError);
    } else {
      console.log('✅ Column verification successful!');
      console.log('Sample data:', columns);
    }
    
    // Verify views exist
    const { data: views, error: viewsError } = await supabase.rpc('list_views');
    
    if (viewsError) {
      console.error('Error verifying views:', viewsError);
    } else {
      const enhancedViewExists = views.some(v => v.includes('journey_steps_enhanced'));
      const progressViewExists = views.some(v => v.includes('company_step_progress'));
      
      if (enhancedViewExists && progressViewExists) {
        console.log('✅ Views created successfully!');
      } else {
        console.warn('⚠️ Some views may not have been created correctly:');
        console.warn('journey_steps_enhanced:', enhancedViewExists ? 'exists' : 'missing');
        console.warn('company_step_progress:', progressViewExists ? 'exists' : 'missing');
      }
    }
    
  } catch (err) {
    console.error('Error running migration:', err);
  }
}

// Run the migration
runMigration().catch(console.error);
