/**
 * Supabase Client
 * Re-exports the singleton Supabase client from the main implementation
 * This ensures we only have one instance of the Supabase client throughout the application
 * to prevent the "Multiple GoTrueClient instances detected" warning
 */

export { supabase } from './supabase';

// Helper function to handle common Supabase errors
export const handleSupabaseError = (error: any) => {
  if (error?.code === '406') {
    console.warn('Supabase 406 error - This is likely a permissions issue. Check RLS policies.');
  } else if (error?.code === '403') {
    console.warn('Supabase 403 error - This is likely an authentication issue.');
  }
  
  return error;
};
