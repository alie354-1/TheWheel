#!/usr/bin/env node

/**
 * Run Logging System Test
 * 
 * This script runs the comprehensive logging system test that demonstrates
 * all aspects of the logging, privacy, and model training functionality.
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Check if .env file exists, create a basic one if it doesn't
const envPath = join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with default test user ID...');
  fs.writeFileSync(envPath, 'TEST_USER_ID=00000000-0000-0000-0000-000000000000\n');
}

// Run the test script
console.log('Running comprehensive logging system test...');
const result = spawnSync('node', [join(__dirname, 'test-logging-system.js')], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Check the result
if (result.error) {
  console.error('Error running test:', result.error);
  process.exit(1);
}

process.exit(result.status);
