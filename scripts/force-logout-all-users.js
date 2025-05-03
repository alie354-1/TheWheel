/**
 * Force Logout All Users Script
 * 
 * This script forces a logout of all users by:
 * 1. Clearing all authentication data from localStorage and sessionStorage
 * 2. Resetting the Supabase client instance
 * 3. Calling the auth service's forceLogoutAllUsers method
 * 
 * Usage: 
 * - Run this script in the browser console when logged in to force logout
 * - Or import it and call forceLogoutAllUsers() from your code
 */

import { authService } from '../src/lib/services/auth.service';
import { resetSupabaseClient } from '../src/lib/supabase';
import { useAuthStore } from '../src/lib/store';

/**
 * Force logout all users and clean up auth data
 * @returns {Promise<boolean>} Success status
 */
export async function forceLogoutAllUsers() {
  console.log('🔐 Starting force logout process...');
  
  try {
    // 1. Clear auth store state
    const { clearAuth } = useAuthStore.getState();
    clearAuth();
    console.log('✅ Auth store cleared');
    
    // 2. Call auth service's force logout method
    const { success, error } = await authService.forceLogoutAllUsers();
    
    if (error) {
      console.error('❌ Error during force logout:', error);
      return false;
    }
    
    // 3. Additional cleanup of any remaining auth data
    cleanupAllAuthData();
    console.log('✅ Additional auth data cleanup completed');
    
    // 4. Reset Supabase client to force a new instance
    resetSupabaseClient();
    console.log('✅ Supabase client reset');
    
    console.log('🎉 Force logout completed successfully!');
    console.log('🔄 Please refresh the page to see the changes');
    
    return true;
  } catch (error) {
    console.error('❌ Critical error during force logout:', error);
    return false;
  }
}

/**
 * Clean up all authentication-related data from storage
 */
function cleanupAllAuthData() {
  // Clear specific auth-related items from localStorage
  const authKeys = [
    'wheel-auth-storage',
    'supabase.auth.token',
    'supabase.auth.refreshToken',
    'supabase.auth.accessToken',
    'supabase.auth.expiresAt',
    'supabase.auth.provider',
    'supabase.auth.user',
    'auth',
    'token',
    'session'
  ];
  
  // Remove all potential auth keys
  authKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Could not remove ${key} from localStorage:`, e);
    }
  });
  
  // Clear session storage completely
  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn('Could not clear sessionStorage:', e);
  }
  
  // Clear all cookies related to auth
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name.includes('auth') || name.includes('token') || name.includes('supabase')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
}

// If this script is executed directly (not imported)
if (typeof window !== 'undefined' && window.location) {
  console.log('🔐 Force Logout Utility');
  console.log('To force logout all users, run:');
  console.log('forceLogoutAllUsers()');
  
  // Make the function available globally when script is loaded directly
  window.forceLogoutAllUsers = forceLogoutAllUsers;
}

export default forceLogoutAllUsers;
