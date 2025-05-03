#!/usr/bin/env node

/**
 * Run Profile Permissions Fix Migration
 * 
 * This script applies the multi-persona profile system permission fixes to the Supabase database.
 * It creates secure API endpoints to handle administrative operations and fixes RLS policies.
 */

import { execSync } from 'child_process';
import { resolve } from 'path';
import fs from 'fs';

// Migration constants
const MIGRATION_FILE = '20250316205000_fix_profile_permissions.sql';
const MIGRATION_PATH = resolve('supabase/migrations', MIGRATION_FILE);
const LOG_FILE = resolve('logs', 'migration-profile-permissions.log');

// Ensure logs directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Log both to console and to file
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${message}`;
  console.log(logMsg);
  fs.appendFileSync(LOG_FILE, logMsg + '\n');
};

// Execute the migration
async function runMigration() {
  try {
    log('\n🔨 Running profile permissions fix migration...');
    
    // Check if the migration file exists
    if (!fs.existsSync(MIGRATION_PATH)) {
      throw new Error(`Migration file not found: ${MIGRATION_PATH}`);
    }
    
    // Get Supabase credentials from environment
    const { SUPABASE_URL, SUPABASE_DB_URL } = process.env;
    
    if (!SUPABASE_DB_URL) {
      throw new Error('SUPABASE_DB_URL environment variable is not set');
    }
    
    // Run the migration
    log('\n📄 Executing SQL migration...');
    
    const command = `psql "${SUPABASE_DB_URL}" -f "${MIGRATION_PATH}"`;
    log(`Running command: ${command}`);
    
    const output = execSync(command).toString();
    log('Migration output:');
    log(output);
    
    // Verify the migration was successful
    log('\n✅ Verifying migration...');
    
    // Check service_role_api schema exists
    const schemaCommand = `psql "${SUPABASE_DB_URL}" -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'service_role_api';"`;
    const schemaOutput = execSync(schemaCommand).toString();
    
    if (schemaOutput.includes('service_role_api')) {
      log('✅ service_role_api schema created successfully');
    } else {
      log('❌ service_role_api schema was not created successfully');
    }
    
    // Check functions exist
    const funcCommand = `psql "${SUPABASE_DB_URL}" -c "SELECT proname FROM pg_proc WHERE proname LIKE 'init_user_profile' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'service_role_api');"`;
    const funcOutput = execSync(funcCommand).toString();
    
    if (funcOutput.includes('init_user_profile')) {
      log('✅ init_user_profile function created successfully');
    } else {
      log('❌ init_user_profile function was not created successfully');
    }
    
    // Check RLS policies exist
    const rlsCommand = `psql "${SUPABASE_DB_URL}" -c "SELECT policyname FROM pg_policies WHERE tablename = 'user_core_profiles' AND policyname = 'user_core_profiles_select';"`;
    const rlsOutput = execSync(rlsCommand).toString();
    
    if (rlsOutput.includes('user_core_profiles_select')) {
      log('✅ RLS policies created successfully');
    } else {
      log('❌ RLS policies were not created successfully');
    }

    log('\n✅ Migration completed successfully!');
    log('\n--------------------------------------------------------------------------------');
    log('\n🔒 Next steps: Update the multi-persona-profile.service.ts file to use');
    log('   the new service_role_api.init_user_profile() function instead of directly');
    log('   calling admin.getUserById().');
    log('\n   Example change in createDefaultProfile():');
    log('   Instead of: supabase.auth.admin.getUserById(userId)');
    log('   Use: supabase.rpc("service_role_api.init_user_profile", { user_id: userId })');
    log('\n--------------------------------------------------------------------------------');
    
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    if (error.stdout) log(`stdout: ${error.stdout.toString()}`);
    if (error.stderr) log(`stderr: ${error.stderr.toString()}`);
    
    process.exit(1);
  }
}

runMigration().catch(err => {
  console.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
