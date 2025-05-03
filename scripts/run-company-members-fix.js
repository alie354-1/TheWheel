/**
 * Run the fix for the company_members recursion issue
 * 
 * This script executes the migration that fixes the Row Level Security policy
 * for the company_members table to prevent infinite recursion.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set the migration path
const migrationPath = path.join(__dirname, '../supabase/migrations/20250320062500_fix_company_members_recursion.sql');

// Function to run the SQL file using psql
function runMigration() {
  console.log('====================================');
  console.log('RUNNING COMPANY MEMBERS RECURSION FIX');
  console.log('====================================');

  // Read the SQL file to display it
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('\nMigration SQL to be executed:');
    console.log('------------------------------------');
    console.log(sql);
    console.log('------------------------------------\n');
  } catch (err) {
    console.error('Error reading migration file:', err);
    console.log('Cannot find the migration file at:', migrationPath);
    console.log('Please make sure the file exists before running this script.');
    process.exit(1);
  }

  // Get database connection info from environment
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('\n❌ ERROR: DATABASE_URL environment variable is not set!');
    console.log('To run this migration, you need to provide the database connection string.');
    console.log('Example: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres node scripts/run-company-members-fix.js');
    process.exit(1);
  }
  
  console.log('Applying company_members recursion fix...');
  
  // Use psql to run the SQL file
  const psql = spawn('psql', [DATABASE_URL, '-f', migrationPath]);
  
  psql.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  psql.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });
  
  psql.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Company members recursion fix applied successfully!');
      console.log('\nTo verify the fix, run the test script:');
      console.log('node scripts/simple-recursion-verify.js');
    } else {
      console.error(`\n❌ Migration failed with exit code ${code}`);
      console.log('Please check the error messages above and try again.');
    }
  });
}

// Run the migration
runMigration();
