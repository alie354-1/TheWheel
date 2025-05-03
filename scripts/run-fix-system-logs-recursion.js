/**
 * Run Fix System Logs Recursion Migration
 * 
 * This script applies the SQL migration to add security function for system logs
 * and update RLS policies to prevent infinite recursion when accessing logs
 * with company context.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const migrationFileName = '20250320064200_fix_system_logs_recursion.sql';
const migrationPath = path.resolve(__dirname, '..', 'supabase', 'migrations', migrationFileName);

// Check if the migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error(`Migration file not found: ${migrationPath}`);
  process.exit(1);
}

// Read environment variables from .env file
require('dotenv').config();

// Get Supabase URL and service role key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('Make sure these are defined in your .env file or environment.');
  process.exit(1);
}

console.log(`Running migration: ${migrationFileName}`);

try {
  // Apply the migration using PSQL
  const migration = fs.readFileSync(migrationPath, 'utf8');
  
  // Use Supabase REST API to execute the SQL
  const curlCommand = `
    curl -X POST '${supabaseUrl}/rest/v1/rpc/exec_sql' \\
    -H 'apikey: ${serviceRoleKey}' \\
    -H 'Authorization: Bearer ${serviceRoleKey}' \\
    -H 'Content-Type: application/json' \\
    -d '{"sql": ${JSON.stringify(migration)}}'
  `;
  
  // Execute the command
  execSync(curlCommand, { stdio: 'inherit' });
  
  console.log('Migration completed successfully.');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
