/**
 * Apply Logging Fix
 * 
 * This script applies the enhanced logging service and fixes permissions
 * for the app_settings and logging_sessions tables to resolve 406 Not Acceptable
 * and 403 Forbidden errors.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting logging fix application...');

// Step 1: Run the permissions fix script
console.log('\n1. Applying database permissions fixes...');
try {
  execSync('node scripts/fix-app-settings-logging-permissions.js', { stdio: 'inherit' });
  console.log('✅ Database permissions fixed successfully');
} catch (error) {
  console.error('❌ Error applying database permissions fix:', error);
  console.log('Continuing with other fixes...');
}

// Step 2: Create an index file to use the enhanced logging service
console.log('\n2. Setting up enhanced logging service...');
const indexFilePath = path.join(__dirname, '..', 'src', 'lib', 'services', 'logging.index.ts');

try {
  const indexContent = `/**
 * Logging Service Index
 * 
 * This file exports the enhanced logging service as the default logging service.
 * It provides graceful fallbacks for common permission issues.
 */

// Import the enhanced logging service instead of the original
import { enhancedLoggingService as loggingService } from './logging.service.enhanced';

// Re-export for backward compatibility
export { loggingService };

// Export the enhanced service directly for new code
export { enhancedLoggingService } from './logging.service.enhanced';
`;

  fs.writeFileSync(indexFilePath, indexContent);
  console.log(`✅ Created ${indexFilePath}`);
} catch (error) {
  console.error('❌ Error creating logging index file:', error);
}

// Step 3: Print instructions
console.log('\n3. Instructions for implementation:');
console.log(`
To use the enhanced logging service with graceful fallbacks:

1. Update imports in your components:
   
   // Change this:
   import { loggingService } from '../lib/services/logging.service';
   
   // To this:
   import { loggingService } from '../lib/services/logging.index';

2. For new components, you can use the enhanced service directly:
   
   import { enhancedLoggingService } from '../lib/services/logging.index';

3. The enhanced logging service will:
   - Handle 406 Not Acceptable errors from app_settings table
   - Handle 403 Forbidden errors from logging_sessions table
   - Fall back to local storage when database operations fail
   - Provide the same API as the original logging service

4. You can check if local logging is being used:
   
   if (loggingService.isUsingLocalLogging()) {
     console.warn('Using local logging due to permission issues');
   }

5. You can access locally stored logs:
   
   const localLogs = loggingService.getLocalLogs();
`);

console.log('\nLogging fix application completed!');
