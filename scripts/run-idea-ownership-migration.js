/**
 * Run the idea ownership model migration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running Idea Ownership Model Migration...');

try {
  // Check if the migration file exists
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250426104300_fix_company_members_and_enhance_idea_ownership.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  console.log('Migration file found. Applying migration...');
  
  // Run the migration using supabase CLI
  // Note: This assumes supabase CLI is installed and configured
  try {
    execSync('npx supabase db push', { stdio: 'inherit' });
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error.message);
    console.log('Trying alternative method...');
    
    // Alternative method: Use psql directly if available
    try {
      // Get database connection info from .env file
      const envPath = path.join(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const dbUrl = envContent.split('\n')
          .find(line => line.startsWith('DATABASE_URL='))
          ?.split('=')[1]
          ?.trim();
        
        if (dbUrl) {
          console.log('Running migration using psql...');
          execSync(`psql "${dbUrl}" -f "${migrationPath}"`, { stdio: 'inherit' });
          console.log('✅ Migration applied successfully using psql!');
        } else {
          throw new Error('DATABASE_URL not found in .env file');
        }
      } else {
        throw new Error('.env file not found');
      }
    } catch (psqlError) {
      console.error('Error applying migration with psql:', psqlError.message);
      console.log('Please run the migration manually using your preferred method.');
      console.log(`Migration file: ${migrationPath}`);
    }
  }
  
  console.log('Migration completed. Now updating TypeScript types and API services...');
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
