/**
 * Enhanced Idea Hub Supabase Client
 * Re-exports the main supabase client for use in the enhanced idea hub
 */

import { supabase } from '../../lib/supabaseClient';

export { supabase };

// Helper function to handle common Supabase errors
export const handleSupabaseError = (error: any) => {
  if (error?.code === '406') {
    console.warn('Supabase 406 error - This is likely a permissions issue. Check RLS policies.');
  } else if (error?.code === '403') {
    console.warn('Supabase 403 error - This is likely an authentication issue.');
  }
  
  return error;
};
