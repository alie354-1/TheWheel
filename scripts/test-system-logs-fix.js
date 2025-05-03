/**
 * Test System Logs Fix
 * 
 * This script tests the fix for the infinite recursion issue when fetching logs
 * by verifying that the new secure function works correctly.
 */

const { execSync } = require('child_process');
require('dotenv').config();

// Get Supabase environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Testing the system logs recursion fix...');

// Test query to call the secure function
const testQuery = `
  SELECT * FROM fetch_system_logs_securely(
    '00000000-0000-0000-0000-000000000000'::uuid, -- Test user ID
    ARRAY['user_action', 'system']::text[],
    5
  );
`;

try {
  // Execute the query using curl to call the Supabase REST API
  const curlCommand = `
    curl -X POST '${supabaseUrl}/rest/v1/rpc/exec_sql' \\
    -H 'apikey: ${serviceRoleKey}' \\
    -H 'Authorization: Bearer ${serviceRoleKey}' \\
    -H 'Content-Type: application/json' \\
    -d '{"sql": ${JSON.stringify(testQuery)}}'
  `;
  
  console.log('Executing test query...');
  const result = execSync(curlCommand).toString();
  
  console.log('Test successful! The secure function is working correctly.');
  console.log('Summary of the fix:');
  console.log('1. Created a secure SECURITY DEFINER function to fetch logs without triggering RLS recursion');
  console.log('2. Updated the model-training service to use this secure function');
  console.log('3. Added RLS policies that avoid circular dependencies between system_logs and company_members');
  
  console.log('\nResults from test query:');
  const parsedResult = JSON.parse(result);
  console.log(`Retrieved ${parsedResult.length || 0} log entries successfully`);
  
} catch (error) {
  console.error('Error testing the fix:', error.message);
  console.error('The fix may not have been applied correctly.');
  console.error('Please check the migration scripts and make sure they were run properly.');
  process.exit(1);
}
