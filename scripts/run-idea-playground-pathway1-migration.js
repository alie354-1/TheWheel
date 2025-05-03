/**
 * Script to run the Idea Playground Pathway 1 migration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, '../supabase/migrations/20250317091000_idea_playground_pathway1.sql');

// Check if migration file exists
if (!fs.existsSync(migrationFile)) {
  console.error(`Migration file not found: ${migrationFile}`);
  process.exit(1);
}

try {
  console.log('Running Idea Playground Pathway 1 migration...');
  
  // Run the migration
  const command = `npx supabase db diff --file=idea_playground_pathway1 --use-migra`;
  execSync(command, { stdio: 'inherit' });
  
  // Apply the migration
  const applyCommand = `npx supabase db push`;
  execSync(applyCommand, { stdio: 'inherit' });
  
  console.log('\n✅ Migration completed successfully!');
  
  // Verify the tables were created
  console.log('\nVerifying tables...');
  
  const tables = [
    'idea_playground_variations',
    'idea_playground_merged_ideas',
    'idea_playground_merge_sources'
  ];
  
  const checkCommand = `npx supabase db query "SELECT table_name FROM information_schema.tables WHERE table_name IN ('${tables.join("', '")}');"`;
  const result = execSync(checkCommand).toString();
  
  const foundTables = tables.filter(table => result.includes(table));
  
  if (foundTables.length === tables.length) {
    console.log('✅ All required tables exist');
  } else {
    console.log(`⚠️ Some tables may not have been created correctly`);
    console.log(`Expected: ${tables.join(', ')}`);
    console.log(`Found: ${foundTables.join(', ')}`);
  }
  
  console.log('\nIdea Playground Pathway 1 migration setup complete!');
  
} catch (error) {
  console.error('\n❌ Migration failed:');
  console.error(error.message);
  process.exit(1);
}
