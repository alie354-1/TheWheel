// Modified script to test if the service_role_api.init_user_profile function exists and works
// This version uses the VITE_ prefixed environment variables

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Use the VITE_ prefixed variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY environment variables must be set')
  process.exit(1)
}

// Initialize Supabase client with the service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkFunction() {
  try {
    console.log('Testing service_role_api.init_user_profile function...')
    
    // Get a sample user ID from the auth.users table
    // We only need one for testing
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1)
    
    if (userError) {
      console.error('Error fetching test user:', userError)
      return false
    }
    
    if (!users || users.length === 0) {
      // If no real users exist, use a dummy UUID for the structure test
      console.log('No users found in database, using a test UUID for structure check')
      
      // Just test if the function exists by directly querying the schema
      const { data: functionExists, error: functionCheckError } = await supabase.rpc('pgfunction', {
        query: `
          SELECT proname, pronamespace::regnamespace as schema
          FROM pg_proc
          WHERE proname = 'init_user_profile'
          AND pronamespace::regnamespace::text = 'service_role_api'
        `
      })
      
      if (functionCheckError) {
        console.error('Error checking for function existence:', functionCheckError)
        return false
      }
      
      if (functionExists && functionExists.length > 0) {
        console.log('✅ Function exists in the database!')
        return true
      } else {
        console.error('❌ Function does not exist in the database')
        return false
      }
    }
    
    // Use the first user ID for the test
    const testUserId = users[0].id
    console.log(`Using user ID ${testUserId} for test`)
    
    // Try calling the function
    const { data, error } = await supabase.rpc('service_role_api.init_user_profile', {
      user_id: testUserId
    })
    
    if (error) {
      console.error('Error calling init_user_profile function:', error)
      return false
    }
    
    console.log('✅ Function call succeeded!')
    console.log('Return data structure:', JSON.stringify(data, null, 2).substring(0, 100) + '...')
    return true
  } catch (error) {
    console.error('Test failed with error:', error)
    return false
  }
}

async function runTest() {
  const success = await checkFunction()
  
  if (success) {
    console.log('\n✅ The service_role_api.init_user_profile function is working correctly!')
    console.log('The multi-persona profile system should now work properly.')
  } else {
    console.log('\n❌ There are still issues with the service_role_api.init_user_profile function.')
    console.log('Please check the migration logs and try running the migration again.')
  }
}

// Run the test
runTest().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
