/**
 * Run Company Context and Features Fix Migration
 * 
 * This script applies the SQL migration that:
 * 1. Creates a secure function for fetching company context without triggering recursion
 * 2. Fixes the duplicate key constraint in extracted_features table
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure ES modules paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configuration
const migrationFileName = '20250320070000_fix_company_context_and_features.sql';
const migrationPath = path.resolve(__dirname, '..', 'supabase', 'migrations', migrationFileName);

// Check if the migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error(`Migration file not found: ${migrationPath}`);
  process.exit(1);
}

// Get Supabase URL and service role key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('Make sure these are defined in your .env file or environment.');
  process.exit(1);
}

console.log(`Applying migration: ${migrationFileName}`);
console.log('This migration will:');
console.log('1. Create a secure function for fetching company context');
console.log('2. Fix the duplicate key constraint issue in extracted_features');

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
  console.log('\nChanges applied:');
  console.log('✅ Created fetch_company_context_securely function');
  console.log('✅ Updated constraint on extracted_features to allow multiple entries with same feature name/set');
  console.log('✅ Updated RLS policies for secure access');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
