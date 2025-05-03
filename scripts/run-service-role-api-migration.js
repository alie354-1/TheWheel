// Script to run the service_role_api function migration
// This adds the missing init_user_profile function to fix profile creation issues

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

// Validate required environment variables
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set')
  process.exit(1)
}

// Initialize Supabase client with the service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runMigration() {
  try {
    console.log('Starting service_role_api migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join('supabase', 'migrations', '20250316192200_add_service_role_api_function.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual commands (roughly by semicolons)
    const commands = sql
      .split(';')
      .map(command => command.trim())
      .filter(command => command.length > 0)
    
    // Execute each command
    for (const command of commands) {
      console.log(`Executing SQL command: ${command.substring(0, 50)}...`)
      const { error } = await supabase.rpc('pgfunction', { query: command + ';' })
      
      if (error) {
        console.error('Error executing SQL command:', error)
        throw error
      }
    }
    
    console.log('Service role API function migration completed successfully')
    console.log('The init_user_profile function is now available and should fix profile initialization errors')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
