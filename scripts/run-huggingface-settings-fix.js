// Run the Hugging Face settings fix migration
import { execSync } from 'child_process';

console.log('Running the Hugging Face settings fix migration...');

try {
  execSync('node scripts/run-migration.js 20250319151900_fix_app_settings_policies.sql', { 
    stdio: 'inherit' 
  });
  console.log('✅ Successfully ran Hugging Face settings fix migration');
} catch (error) {
  console.error('❌ Error running Hugging Face settings fix migration:', error);
  process.exit(1);
}
