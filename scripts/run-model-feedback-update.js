// Script to run the model feedback types update migration
// This adds support for 'automatic' and 'neutral' feedback types

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
    console.log('Starting model feedback types update migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join('supabase', 'migrations', '20250316212000_update_model_feedback_types.sql')
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
    
    console.log('Model feedback types update migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
