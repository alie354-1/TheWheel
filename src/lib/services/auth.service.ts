import { supabase, resetSupabaseClient } from '../supabase';
import { User } from '../types/profile.types';
import { useAuthStore } from '../store';

// Maximum number of retries for auth operations
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;

/**
 * Singleton AuthService class
 * Manages authentication operations with improved error handling and retry logic
 */
class AuthService {
  private static instance: AuthService;
  private authStatus: 'unknown' | 'authenticated' | 'unauthenticated' | 'error' = 'unknown';
  private retryCount = 0;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
    console.log('AuthService initialized');
  }
  
  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get the current authentication status
   */
  getAuthStatus(): string {
    return this.authStatus;
  }

  /**
   * Sign in and fetch the full user record from the users table
   * Includes retry logic for transient errors
   */
  async signIn(email: string, password: string, retry = 0): Promise<{ user: User | null; error: Error | null }> {
    try {
      console.log(`Attempting sign in for ${email}...`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('network') && retry < MAX_RETRIES) {
          console.log(`Retrying sign in (${retry + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.signIn(email, password, retry + 1);
        }
        
        this.authStatus = 'error';
        return { user: null, error };
      }

      if (!data.user) {
        console.error('Sign in succeeded but no user returned');
        this.authStatus = 'error';
        return { user: null, error: new Error('Authentication succeeded but no user was returned') };
      }

      console.log('Sign in successful, fetching user record...');
      
      // Fetch the full user record from the users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user record:', userError.message);
        
        // We still have authentication, just couldn't get the full profile
        this.authStatus = 'authenticated';
        return { 
          user: { 
            email: data.user.email,
            // Add minimal user data from auth
            ...data.user
          } as User, 
          error: userError 
        };
      }

      this.authStatus = 'authenticated';
      console.log('User authenticated and profile loaded');
      return { user: userRecord as User, error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
      this.authStatus = 'error';
      return { user: null, error };
    }
  }

  /**
   * Sign out the current user with improved cleanup
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      console.log('Signing out user...');
      
      // Clear auth store first to prevent UI flashes
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during sign out:', error.message);
        return { error };
      }
      
      // Clean up local storage
      this.cleanupAuthStorage();
      
      this.authStatus = 'unauthenticated';
      console.log('User signed out successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      return { error };
    }
  }

  /**
   * Force logout all users - useful for testing and resolving auth issues
   */
  async forceLogoutAllUsers(): Promise<{ success: boolean; error: Error | null }> {
    try {
      console.log('Force logging out all users...');
      
      // Clear auth store
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clean up storage
      this.cleanupAuthStorage();
      
      // Reset the Supabase client to force a new instance
      resetSupabaseClient();
      
      this.authStatus = 'unauthenticated';
      console.log('Force logout completed successfully');
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error during force logout:', error);
      return { success: false, error };
    }
  }

  /**
   * Clean up authentication-related storage
   */
  private cleanupAuthStorage(): void {
    try {
      // Clear specific auth items from localStorage
      localStorage.removeItem('wheel-auth-storage');
      localStorage.removeItem('supabase.auth.token');
      
      // Clear session storage
      sessionStorage.clear();
      
      console.log('Auth storage cleaned up');
    } catch (error) {
      console.error('Error cleaning up auth storage:', error);
    }
  }

  /**
   * Get the current session with error handling
   */
  async getSession() {
    try {
      const result = await supabase.auth.getSession();
      
      if (result.data.session) {
        this.authStatus = 'authenticated';
      } else {
        this.authStatus = 'unauthenticated';
      }
      
      return result;
    } catch (error) {
      console.error('Error getting session:', error);
      this.authStatus = 'error';
      return { data: { session: null }, error };
    }
  }

  /**
   * Get the current user with error handling
   */
  async getUser() {
    try {
      return await supabase.auth.getUser();
    } catch (error) {
      console.error('Error getting user:', error);
      return { data: { user: null }, error };
    }
  }

  /**
   * Refresh the current session with retry logic
   */
  async refreshSession(retry = 0): Promise<{
    data: { session: any | null };
    error: Error | null;
  }> {
    try {
      return await supabase.auth.refreshSession();
    } catch (error: unknown) {
      console.error('Error refreshing session:', error);
      
      // Retry logic for network errors
      if (retry < MAX_RETRIES) {
        console.log(`Retrying session refresh (${retry + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.refreshSession(retry + 1);
      }
      
      return { 
        data: { session: null }, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  }

  /**
   * Set up auth state change listener with error handling
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    try {
      return supabase.auth.onAuthStateChange((event, session) => {
        // Update internal auth status
        if (event === 'SIGNED_IN') {
          this.authStatus = 'authenticated';
        } else if (event === 'SIGNED_OUT') {
          this.authStatus = 'unauthenticated';
        }
        
        // Call the provided callback
        callback(event, session);
      });
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      return { data: { subscription: null }, error };
    }
  }
}

// Export the singleton instance
export const authService = AuthService.getInstance();
