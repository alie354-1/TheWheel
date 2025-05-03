/**
 * Script to run the Enhanced Idea Hub migration
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const MIGRATION_FILE = '20250426094500_enhanced_idea_hub.sql';
const MIGRATION_PATH = path.join(__dirname, '..', 'supabase', 'migrations', MIGRATION_FILE);

// Verify migration file exists
if (!fs.existsSync(MIGRATION_PATH)) {
  console.error(`Migration file not found: ${MIGRATION_PATH}`);
  process.exit(1);
}

console.log('Running Enhanced Idea Hub migration...');

try {
  // Run the migration using supabase CLI
  execSync(`npx supabase db push --db-only`, { stdio: 'inherit' });
  
  console.log('\n✅ Enhanced Idea Hub migration completed successfully!');
  console.log('\nNew database schema includes:');
  console.log('- Extended idea_playground_ideas table with company context fields');
  console.log('- Added idea type classification (new_company, new_feature, etc.)');
  console.log('- Added integration status tracking');
  console.log('- Created idea_hub_user_preferences table for view settings');
  console.log('- Added placeholder company_features table for future integration');
  
} catch (error) {
  console.error('\n❌ Migration failed with error:');
  console.error(error.message);
  process.exit(1);
}
