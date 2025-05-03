#!/usr/bin/env node

/**
 * Run Comprehensive Logging System Migration
 * 
 * This script executes the database migration for the comprehensive logging system, 
 * creating all the necessary tables, indexes, and functions.
 */

import { execSync } from 'child_process';
import { resolve } from 'path';
import fs from 'fs';

// Configuration
const MIGRATION_FILE = '20250316203000_comprehensive_logging_system.sql';
const MIGRATION_PATH = resolve('supabase/migrations', MIGRATION_FILE);
const LOG_FILE = resolve('logs', 'migration-logging-system.log');

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
    log('Starting migration for Comprehensive Logging System...');
    
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
    log('Executing SQL migration...');
    
    const command = `psql "${SUPABASE_DB_URL}" -f "${MIGRATION_PATH}"`;
    log(`Running command: ${command}`);
    
    const output = execSync(command).toString();
    log('Migration output:');
    log(output);
    
    // Verify the migration was successful by checking if tables were created
    log('Verifying migration...');
    
    const verifyCommand = `psql "${SUPABASE_DB_URL}" -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('system_logs', 'logging_sessions', 'consent_settings', 'privacy_requests', 'classification_rules', 'retention_policies', 'extracted_features', 'model_registry', 'model_feedback');"`;
    const verifyOutput = execSync(verifyCommand).toString();
    
    log('Verification result:');
    log(verifyOutput);
    
    // Check if all tables are present
    const requiredTables = [
      'system_logs', 
      'logging_sessions', 
      'consent_settings', 
      'privacy_requests', 
      'classification_rules', 
      'retention_policies', 
      'extracted_features',
      'model_registry',
      'model_feedback'
    ];
    
    let allTablesPresent = true;
    for (const table of requiredTables) {
      if (!verifyOutput.includes(table)) {
        log(`WARNING: Table '${table}' was not found after migration`);
        allTablesPresent = false;
      }
    }
    
    if (allTablesPresent) {
      log('SUCCESS: All required tables were created successfully');
    } else {
      log('WARNING: Some tables may be missing, please check the verification result');
    }
    
    // Insert default classification rules if needed
    log('Setting up default classification rules...');
    const insertDefaultRulesCommand = `psql "${SUPABASE_DB_URL}" -c "
      INSERT INTO public.classification_rules (data_type, pattern, classification, retention_policy, description, priority, is_active)
      SELECT 'email', '\\\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Z|a-z]{2,}\\\\b', 'personal', 'medium_term', 'Email addresses', 100, true
      WHERE NOT EXISTS (SELECT 1 FROM public.classification_rules WHERE data_type = 'email');
      
      INSERT INTO public.classification_rules (data_type, pattern, classification, retention_policy, description, priority, is_active)
      SELECT 'default', '.*', 'non_personal', 'long_term', 'Default rule for non-personal data', 0, true
      WHERE NOT EXISTS (SELECT 1 FROM public.classification_rules WHERE data_type = 'default');
    "`;
    
    try {
      execSync(insertDefaultRulesCommand);
      log('Default classification rules set up successfully');
    } catch (err) {
      log(`WARNING: Error setting up default classification rules: ${err.message}`);
    }
    
    log('Migration completed successfully!');
    
  } catch (error) {
    log(`ERROR: ${error.message}`);
    if (error.stdout) log(`stdout: ${error.stdout.toString()}`);
    if (error.stderr) log(`stderr: ${error.stderr.toString()}`);
    
    process.exit(1);
  }
}

runMigration().catch(err => {
  log(`Unhandled error: ${err.message}`);
  process.exit(1);
});
