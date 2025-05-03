/**
 * Dashboard Diagnostic Script
 * 
 * This script helps diagnose issues with the dashboard loading by:
 * 1. Checking for circular dependencies
 * 2. Testing individual components in isolation
 * 3. Adding enhanced error logging
 */

import { createClient } from '@supabase/supabase-js';
import { featureFlagsService } from '../src/lib/services/feature-flags.service.ts';
import { authService } from '../src/lib/services/auth.service.ts';

// Track import paths to detect circular dependencies
const importPaths = new Set();
const importStack = [];

// Enhanced console logging
const originalConsoleError = console.error;
console.error = function(...args) {
  originalConsoleError('[ENHANCED ERROR]', ...args);
  
  // Capture stack trace
  const stack = new Error().stack;
  originalConsoleError('[STACK TRACE]', stack);
  
  // Original behavior
  return originalConsoleError.apply(this, args);
};

// Test Supabase connection directly
async function testSupabaseConnection() {
  try {
    console.log('Testing direct Supabase connection...');
    
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a fresh client
    const testClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test a simple query
    const { data, error } = await testClient.from('app_settings').select('*').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase connection successful:', data ? 'Data received' : 'No data');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

// Test auth service
async function testAuthService() {
  try {
    console.log('Testing auth service...');
    const { data, error } = await authService.getSession();
    
    if (error) {
      throw error;
    }
    
    console.log('Auth service test:', data.session ? 'Session found' : 'No active session');
    return true;
  } catch (error) {
    console.error('Auth service test failed:', error);
    return false;
  }
}

// Test feature flags service
async function testFeatureFlagsService() {
  try {
    console.log('Testing feature flags service...');
    await featureFlagsService.loadFeatureFlags();
    console.log('Feature flags loaded successfully');
    return true;
  } catch (error) {
    console.error('Feature flags service test failed:', error);
    return false;
  }
}

// Check for circular dependencies
function checkCircularDependencies() {
  console.log('Checking for potential circular dependencies...');
  
  // List of services to check
  const servicesToCheck = [
    '../src/lib/services/company-access.service.ts',
    '../src/lib/services/task.service.ts',
    '../src/lib/services/ai.service.ts',
    '../src/lib/services/feature-flags.service.ts',
    '../src/lib/services/auth.service.ts',
    '../src/lib/services/logging.service.ts'
  ];
  
  // Try importing each service and track dependencies
  servicesToCheck.forEach(servicePath => {
    try {
      importStack.push(servicePath);
      
      // Dynamic import to check dependencies
      import(servicePath).then(module => {
        console.log(`Successfully imported ${servicePath}`);
        importStack.pop();
      }).catch(error => {
        console.error(`Error importing ${servicePath}:`, error);
        console.error(`Import stack: ${importStack.join(' -> ')}`);
        importStack.pop();
      });
      
    } catch (error) {
      console.error(`Error checking ${servicePath}:`, error);
      importStack.pop();
    }
  });
}

// Run all tests
async function runDiagnostics() {
  console.log('Starting dashboard diagnostics...');
  
  // Run tests in sequence
  await testSupabaseConnection();
  await testAuthService();
  await testFeatureFlagsService();
  checkCircularDependencies();
  
  console.log('Diagnostics complete. Check console for results.');
}

// Execute diagnostics
runDiagnostics();

export { 
  testSupabaseConnection,
  testAuthService,
  testFeatureFlagsService,
  checkCircularDependencies
};
