// Direct schema checker
// This script directly tries to call the init_user_profile function to verify if it exists

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Use the VITE_ prefixed variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables must be set')
  process.exit(1)
}

console.log('Using Supabase URL:', SUPABASE_URL)

// Initialize Supabase client with the anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

async function directFunctionCheck() {
  try {
    console.log('Attempting to directly call service_role_api.init_user_profile...')
    
    // Generate a random test UUID
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    // Try directly calling the function
    const { data, error } = await supabase.rpc('service_role_api.init_user_profile', {
      user_id: testUserId
    })
    
    if (error) {
      // If we get a specific error that indicates the function exists but permission was denied
      // that's actually a positive sign that the function exists but just can't be called with anon key
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.log('✅ Function exists but cannot be called with anon key (expected behavior)')
        return true
      }
      
      // If we get a "function does not exist" error, that means our function is missing
      if (error.code === '42883' || error.message.includes('function does not exist')) {
        console.error('❌ Function does not exist:', error.message)
        return false
      }
      
      // Any other error
      console.error('Error calling function:', error)
      console.log('Error code:', error.code)
      console.log('Error message:', error.message)
      
      // If the error message mentions "function" and "not found", it likely doesn't exist
      if (error.message.toLowerCase().includes('not found') && error.message.toLowerCase().includes('function')) {
        return false
      }
      
      // For any other type of error, we can't be sure
      console.log('Cannot determine if function exists due to error')
      return false
    }
    
    // If no error, function exists and executed successfully
    console.log('✅ Function exists and executed successfully!')
    console.log('Return data:', data)
    return true
  } catch (error) {
    console.error('Test failed with error:', error)
    return false
  }
}

async function checkUserCoreProfilesTable() {
  try {
    console.log('\nChecking for user_core_profiles table...')
    
    // Test if we can query the user_core_profiles table
    const { data, error } = await supabase
      .from('user_core_profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') { // undefined_table
        console.error('❌ user_core_profiles table does not exist')
        return false
      }
      console.error('Error checking user_core_profiles table:', error)
      return false
    }
    
    console.log('✅ user_core_profiles table exists')
    return true
  } catch (error) {
    console.error('Error checking user_core_profiles table:', error)
    return false
  }
}

async function checkUserPersonasTable() {
  try {
    console.log('\nChecking for user_personas table...')
    
    // Test if we can query the user_personas table
    const { data, error } = await supabase
      .from('user_personas')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') { // undefined_table
        console.error('❌ user_personas table does not exist')
        return false
      }
      console.error('Error checking user_personas table:', error)
      return false
    }
    
    console.log('✅ user_personas table exists')
    return true
  } catch (error) {
    console.error('Error checking user_personas table:', error)
    return false
  }
}

async function runTests() {
  const functionExists = await directFunctionCheck()
  const coreProfilesExist = await checkUserCoreProfilesTable()
  const personasExist = await checkUserPersonasTable()
  
  console.log('\n--- TEST RESULTS ---')
  
  if (functionExists) {
    console.log('✅ service_role_api.init_user_profile function exists')
  } else {
    console.log('❌ service_role_api.init_user_profile function is missing')
  }
  
  if (coreProfilesExist && personasExist) {
    console.log('✅ Required tables exist')
  } else {
    console.log('❌ Some required tables are missing')
  }
  
  if (functionExists && coreProfilesExist && personasExist) {
    console.log('\n✅ All required database objects exist!')
    console.log('The multi-persona profile system should now be functional.')
  } else {
    console.log('\n❌ Some required database objects are missing.')
    console.log('The SQL migration needs to be re-applied.')
    console.log('Please run the migration script again: node scripts/run-service-role-api-migration.js')
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
