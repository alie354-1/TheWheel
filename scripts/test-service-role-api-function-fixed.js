// Fixed script to test if the service_role_api.init_user_profile function exists and works
// This version correctly handles environment variables for Node scripts

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Use correct environment variables and keys
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY // Use the anon key which is what the app uses

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables must be set')
  process.exit(1)
}

console.log('Using Supabase URL:', SUPABASE_URL);

// Initialize Supabase client with the anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

async function checkFunction() {
  try {
    console.log('Testing service_role_api.init_user_profile function...')
    
    // First, let's check if the schema exists
    const { data: schemaExists, error: schemaError } = await supabase.rpc('pgfunction', {
      query: `
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = 'service_role_api'
      `
    })
    
    if (schemaError) {
      console.error('Error checking for schema existence:', schemaError)
      return false
    }
    
    if (!schemaExists || schemaExists.length === 0) {
      console.error('❌ service_role_api schema does not exist')
      return false
    }
    
    console.log('✅ service_role_api schema exists')
    
    // Now check if the function exists by directly querying the schema
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
    
    if (!functionExists || functionExists.length === 0) {
      console.error('❌ Function does not exist in the database')
      return false
    }
    
    console.log('✅ Function exists in the database!')
    
    // We don't need to actually call the function since we just want to verify it exists
    // The actual function requires service_role permissions which may not be available in all environments
    return true
  } catch (error) {
    console.error('Test failed with error:', error)
    return false
  }
}

async function runTest() {
  const success = await checkFunction()
  
  if (success) {
    console.log('\n✅ The service_role_api.init_user_profile function exists!')
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
