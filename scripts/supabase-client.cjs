/**
 * CommonJS version of Supabase client for migration scripts
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables from .env file

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

// Better error handling for missing environment variables
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing in environment variables');
  throw new Error('Missing Supabase URL. Please check your environment configuration.');
}

if (!supabaseServiceKey) {
  console.error('VITE_SUPABASE_SERVICE_KEY is missing in environment variables');
  throw new Error('Missing Supabase Service Key. Please check your environment configuration.');
}

// Create the Supabase client with SERVICE ROLE key for full database access
// This is important for migration scripts that need to access all tables
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'wheel-auth-storage'
  }
});

console.log('Supabase client initialized for migration');

// Export the supabase client
module.exports = { supabase };
