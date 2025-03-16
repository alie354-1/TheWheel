#!/usr/bin/env node

/**
 * Run Consolidated Migration Script
 * 
 * This script applies the consolidated schema to the Supabase database.
 * It replaces the individual migration scripts.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Path to the consolidated schema
const schemaPath = path.resolve(__dirname, '../supabase/consolidated/schema.sql');

// Check if the schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error(`Error: Consolidated schema file not found at ${schemaPath}`);
  process.exit(1);
}

// Read the schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Running consolidated migration...');

try {
  // Use the Supabase CLI to run the SQL
  // Note: This requires the Supabase CLI to be installed
  execSync(`supabase db execute --file ${schemaPath}`, {
    env: {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    stdio: 'inherit'
  });

  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Error running migration:', error.message);
  process.exit(1);
}

// Update the migration status in the database
console.log('Updating migration status...');

try {
  // Create a temporary SQL file to update the migration status
  const tempSqlPath = path.resolve(__dirname, '../temp_migration_status.sql');
  
  // SQL to update the migration status
  const updateStatusSql = `
    INSERT INTO supabase_migrations.schema_migrations (version, statements)
    VALUES ('consolidated_schema', 'Consolidated schema migration')
    ON CONFLICT (version) DO UPDATE SET statements = 'Consolidated schema migration';
  `;
  
  fs.writeFileSync(tempSqlPath, updateStatusSql);
  
  // Execute the SQL
  execSync(`supabase db execute --file ${tempSqlPath}`, {
    env: {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    stdio: 'inherit'
  });
  
  // Remove the temporary file
  fs.unlinkSync(tempSqlPath);
  
  console.log('Migration status updated successfully!');
} catch (error) {
  console.error('Error updating migration status:', error.message);
  // Continue execution even if this fails
}

console.log('Consolidated migration completed successfully!');
