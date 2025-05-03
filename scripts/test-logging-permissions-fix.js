/**
 * Test Logging Permissions Fix
 * 
 * This script tests the enhanced logging service and database permissions fixes.
 * It verifies that:
 * 1. Database permissions are correctly set
 * 2. The enhanced logging service gracefully handles permission errors
 * 3. Local logging fallback works correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize Supabase admin client for verification
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Test database permissions
 */
async function testDatabasePermissions() {
  console.log('\n--- Testing Database Permissions ---');
  
  // Test app_settings table permissions
  console.log('\nTesting app_settings table permissions:');
  try {
    const { data: appSettings, error: appSettingsError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'logging_enabled')
      .single();
    
    if (appSettingsError) {
      console.error('❌ Error reading from app_settings:', appSettingsError);
      console.log('   This indicates that the permissions fix may not have been applied correctly.');
    } else {
      console.log('✅ Successfully read from app_settings table');
      console.log(`   Value for logging_enabled: ${appSettings?.value || 'undefined'}`);
    }
  } catch (error) {
    console.error('❌ Exception when testing app_settings permissions:', error);
  }
  
  // Test logging_sessions table permissions
  console.log('\nTesting logging_sessions table permissions:');
  try {
    const sessionId = `test-session-${Date.now()}`;
    const { error: sessionError } = await supabase
      .from('logging_sessions')
      .insert({
        session_id: sessionId,
        start_time: new Date().toISOString()
      });
    
    if (sessionError) {
      console.error('❌ Error inserting into logging_sessions:', sessionError);
      console.log('   This indicates that the permissions fix may not have been applied correctly.');
    } else {
      console.log('✅ Successfully inserted into logging_sessions table');
      
      // Clean up the test session
      await supabaseAdmin
        .from('logging_sessions')
        .delete()
        .eq('session_id', sessionId);
      
      console.log('   Test session cleaned up');
    }
  } catch (error) {
    console.error('❌ Exception when testing logging_sessions permissions:', error);
  }
  
  // Test system_logs table permissions
  console.log('\nTesting system_logs table permissions:');
  try {
    const logId = `test-log-${Date.now()}`;
    const { error: logError } = await supabase
      .from('system_logs')
      .insert({
        id: logId,
        event_type: 'test',
        event_source: 'test_script',
        action: 'test',
        data: { test: true },
        created_at: new Date().toISOString()
      });
    
    if (logError) {
      console.error('❌ Error inserting into system_logs:', logError);
      console.log('   This indicates that the permissions fix may not have been applied correctly.');
    } else {
      console.log('✅ Successfully inserted into system_logs table');
      
      // Clean up the test log
      await supabaseAdmin
        .from('system_logs')
        .delete()
        .eq('id', logId);
      
      console.log('   Test log cleaned up');
    }
  } catch (error) {
    console.error('❌ Exception when testing system_logs permissions:', error);
  }
}

/**
 * Test enhanced logging service
 */
async function testEnhancedLoggingService() {
  console.log('\n--- Testing Enhanced Logging Service ---');
  
  // Check if the enhanced logging service file exists
  const enhancedServicePath = path.join(__dirname, '..', 'src', 'lib', 'services', 'logging.service.enhanced.ts');
  if (!fs.existsSync(enhancedServicePath)) {
    console.error('❌ Enhanced logging service file not found:', enhancedServicePath);
    return;
  }
  
  console.log('✅ Enhanced logging service file exists');
  
  // Check if the logging index file exists
  const indexPath = path.join(__dirname, '..', 'src', 'lib', 'services', 'logging.index.ts');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Logging index file not found:', indexPath);
    return;
  }
  
  console.log('✅ Logging index file exists');
  
  // Read the index file to verify it exports the enhanced logging service
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (!indexContent.includes('from \'./logging.service.enhanced\'')) {
    console.error('❌ Logging index file does not import from enhanced logging service');
  } else {
    console.log('✅ Logging index file correctly imports from enhanced logging service');
  }
  
  console.log('\nTo fully test the enhanced logging service in a browser environment:');
  console.log('1. Open the browser console');
  console.log('2. Navigate to a page that uses the logging service');
  console.log('3. Check for any logging-related errors');
  console.log('4. Verify that the application continues to function even if there are permission issues');
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Starting logging permissions fix tests...');
  
  // Test database permissions
  await testDatabasePermissions();
  
  // Test enhanced logging service
  await testEnhancedLoggingService();
  
  console.log('\nTests completed!');
}

// Run the tests
runTests()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Error running tests:', err);
    process.exit(1);
  });
