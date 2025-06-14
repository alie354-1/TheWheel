/**
 * Supabase Client
 * Creates and exports a Supabase client instance
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Add error handling for requests
    fetch: (...args) => {
      return fetch(...args).catch(error => {
        console.error('Supabase request error:', error);
        throw error;
      });
    }
  }
});

// Helper function to handle common Supabase errors
export const handleSupabaseError = (error: any) => {
  if (error?.code === '406') {
    console.warn('Supabase 406 error - This is likely a permissions issue. Check RLS policies.');
  } else if (error?.code === '403') {
    console.warn('Supabase 403 error - This is likely an authentication issue.');
  }
  
  return error;
};
