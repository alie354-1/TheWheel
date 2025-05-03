import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Track the Supabase client instance to ensure we only create one
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase client instance (singleton pattern)
 * This ensures we only ever have one instance of the Supabase client
 * to prevent the "Multiple GoTrueClient instances detected" warning
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Initialize the Supabase client with environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Better error handling for missing environment variables
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL is missing in environment variables');
    throw new Error('Missing Supabase URL. Please check your environment configuration.');
  }

  if (!supabaseAnonKey) {
    console.error('VITE_SUPABASE_ANON_KEY is missing in environment variables');
    throw new Error('Missing Supabase Anon Key. Please check your environment configuration.');
  }

  try {
    // Create the client with improved configuration
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'wheel-auth-storage', // Use a specific storage key to avoid conflicts
        debug: import.meta.env.DEV // Enable debug mode only in development
      }
    });

    console.log('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw new Error('Failed to initialize Supabase client. See console for details.');
  }
}

// Export the singleton instance getter
export const supabase = getSupabaseClient();

/**
 * Reset the Supabase client instance
 * This is useful for testing or when we need to force a new instance
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
  console.log('Supabase client instance reset');
}
