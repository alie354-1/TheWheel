/**
 * Script to apply the recommendation system migrations
 * 
 * This script applies both SQL migrations:
 * 1. Enhanced views for journey steps
 * 2. Recommendation engine functions
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

// Migration file paths
const MIGRATIONS = [
  'supabase/migrations/20250501000000_create_step_enhanced_views.sql',
  'supabase/migrations/20250502000000_add_recommendation_functions.sql'
];

/**
 * Execute a single SQL migration file
 */
async function executeMigration(filePath) {
  console.log(`\n🚀 Running migration: ${filePath}`);
  
  try {
    // Read migration SQL file
    const migrationPath = path.join(process.cwd(), filePath);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into statements to execute them one by one
    const sqlStatements = migrationSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`  Found ${sqlStatements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      process.stdout.write(`  Executing statement ${i + 1}/${sqlStatements.length}... `);
      
      try {
        // Execute using raw SQL
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          process.stdout.write('❌\n');
          console.error(`  Error executing statement ${i + 1}:`, error.message);
          if (error.hint) {
            console.error(`  Hint: ${error.hint}`);
          }
          console.error(`  Statement: ${statement.substring(0, 100)}...`);
        } else {
          process.stdout.write('✅\n');
        }
      } catch (statementError) {
        process.stdout.write('❌\n');
        console.error(`  Exception executing statement ${i + 1}:`, statementError.message);
        console.error(`  Statement: ${statement.substring(0, 100)}...`);
      }
    }
    
    console.log(`  Migration completed: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`Error processing migration ${filePath}:`, err);
    return false;
  }
}

/**
 * Run all migrations
 */
async function runMigrations() {
  console.log('Starting Sprint 3 - Recommendation System migrations');
  console.log('=====================================================');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const migrationFile of MIGRATIONS) {
    const success = await executeMigration(migrationFile);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log('\nMigration Summary:');
  console.log(`  ✅ Successful migrations: ${successCount}`);
  console.log(`  ❌ Failed migrations: ${failureCount}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️ Some migrations failed. Please check the logs above for details.');
  }
  
  // Verify some key objects were created
  try {
    console.log('\nVerifying database objects:');
    
    // Check views
    const { data: views, error: viewsError } = await supabase.rpc('list_views');
    
    if (viewsError) {
      console.error('Error verifying views:', viewsError);
    } else {
      const expectedViews = [
        'journey_steps_enhanced',
        'company_step_progress', 
        'journey_step_relationships',
        'journey_step_recommendations'
      ];
      
      for (const view of expectedViews) {
        const exists = views.some(v => v.includes(view));
        console.log(`  View '${view}': ${exists ? '✅ exists' : '❌ missing'}`);
      }
    }
    
    // Check functions
    const { data: functions, error: functionsError } = await supabase.rpc('list_functions');
    
    if (functionsError) {
      console.error('Error verifying functions:', functionsError);
    } else {
      const expectedFunctions = [
        'get_enhanced_step',
        'get_personalized_step_tools',
        'get_steps_by_industry_popularity',
        'get_common_step_sequences'
      ];
      
      for (const func of expectedFunctions) {
        const exists = functions.some(f => f.includes(func));
        console.log(`  Function '${func}': ${exists ? '✅ exists' : '❌ missing'}`);
      }
    }
  } catch (err) {
    console.error('Error verifying database objects:', err);
  }
}

// Run the migrations
runMigrations().catch(console.error);
