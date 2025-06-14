/**
 * Supabase Client Service
 * 
 * This module provides the Supabase client instance for use across the application.
 * It ensures we have a single, consistent way to access Supabase.  
 */

import { createClient } from '@supabase/supabase-js';
import { loggingService } from '../logging.service';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof loggingService?.error === 'function') {
    loggingService.error(
      'Missing Supabase environment variables',
      new Error('Missing Supabase environment variables'), 
      { context: 'supabaseClient' }
    );
  }
  console.error('Missing required environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. Application cannot start.');
  // Throw an error to halt execution if critical env vars are missing
  throw new Error('Supabase URL and/or Anon Key are missing. Check environment variables.');
}

/**
 * Create a Supabase client instance
 */
// This line will only be reached if supabaseUrl and supabaseAnonKey are present
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase service to be registered in the service registry
 */
export const supabaseService = {
  supabase, // The client instance
  
  /**
   * Reset the Supabase client's auth state
   */
  resetAuth: async () => {
    try {
      await supabase.auth.signOut();
      
      if (typeof loggingService?.info === 'function') {
        loggingService.info('Supabase auth reset', { context: 'supabaseClient' });
      }
      
      return { success: true };
    } catch (error) {
      if (typeof loggingService?.error === 'function') {
        loggingService.error(
          'Error resetting Supabase auth',
          error instanceof Error ? error : new Error(String(error)), 
          { context: 'supabaseClient.resetAuth' }
        );
      }
      
      console.error('Error resetting Supabase auth:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Check if the Supabase client is authenticated
   */
  isAuthenticated: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return { authenticated: !!data.session, session: data.session };
    } catch (error) {
      if (typeof loggingService?.error === 'function') {
        loggingService.error(
          'Error checking Supabase auth status',
          error instanceof Error ? error : new Error(String(error)), 
          { context: 'supabaseClient.isAuthenticated' }
        );
      }
      
      console.error('Error checking Supabase auth status:', error);
      return { authenticated: false, error };
    }
  }
};
