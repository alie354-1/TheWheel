/**
 * Supabase Client Service
 * 
 * This module provides the Supabase client instance for use across the application.
 * It ensures we have a single, consistent way to access Supabase by using the
 * singleton implementation from src/lib/supabase.ts.
 */

import { supabase } from '../../supabase';
import { loggingService } from '../logging.service';

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
