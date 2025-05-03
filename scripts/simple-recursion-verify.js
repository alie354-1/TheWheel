/**
 * Simple verification script for company members recursion fix
 * 
 * This is a simplified version of the verification script
 * that doesn't rely on ESM imports
 */

// Require the Supabase client directly
const { createClient } = require('@supabase/supabase-js');

// Get environment variables or use defaults
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Main function to test
async function testCompanyMembersAccess() {
  console.log('=====================================');
  console.log('TESTING COMPANY MEMBERS RECURSION FIX');
  console.log('=====================================');
  
  try {
    console.log('\nChecking authentication...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('⚠️ Authentication error:', userError);
      console.log('Please ensure you are logged in before running this test.');
      return false;
    }
    
    const userId = userData.user.id;
    console.log(`✅ Authenticated as user: ${userId}`);
    
    // Test 1: Use the RPC function to get company memberships
    try {
      console.log('\n🔍 TEST 1: Use the secured RPC function');
      console.log('Calling fetch_company_context_securely...');
      
      const start = Date.now();
      const { data: secureData, error: secureError } = await supabase.rpc(
        'fetch_company_context_securely',
        { 
          p_user_id: userId,
          p_company_id: null // null returns all companies
        }
      );
      const end = Date.now();
      
      if (secureError) {
        console.error('⚠️ RPC Error:', secureError);
        console.log('The secure function might not be available yet.');
      } else {
        console.log(`✅ Secure function returned ${secureData ? secureData.length : 0} companies in ${end - start}ms`);
        console.log('Company data:', secureData);
      }
    } catch (err) {
      console.error('⚠️ Test 1 failed:', err);
    }
    
    // Test 2: Try to get company memberships directly (should avoid recursion)
    try {
      console.log('\n🔍 TEST 2: Direct table access (should be protected against recursion)');
      console.log('Querying company_members table directly...');
      
      const start = Date.now();
      const { data: directData, error: directError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userId)
        .limit(5);
      const end = Date.now();
      
      if (directError) {
        if (directError.code === '42P17') {
          console.error('❌ RECURSION ERROR DETECTED!');
          console.error('The company_members policy is still triggering infinite recursion.');
          console.error('Error details:', directError);
        } else {
          console.error('⚠️ Query Error:', directError);
        }
      } else {
        console.log(`✅ Direct query worked without recursion! Returned ${directData ? directData.length : 0} results in ${end - start}ms`);
        console.log('This suggests the policy fix is working correctly.');
      }
    } catch (err) {
      console.error('⚠️ Test 2 failed:', err);
    }
    
    console.log('\nTests completed. Check results above to determine if the fix was successful.');
    return true;
  } catch (error) {
    console.error('❌ Error in verification:', error);
    return false;
  }
}

// Run the test
testCompanyMembersAccess()
  .then(() => console.log('\nTest script completed.'))
  .catch(err => console.error('Error running test script:', err));
