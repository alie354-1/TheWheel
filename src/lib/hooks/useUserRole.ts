import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserRoleHook {
  isSystemAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check user roles and permissions
 * 
 * Provides information about the current user's role in the system,
 * such as whether they are a system administrator.
 */
export const useUserRole = (): UserRoleHook => {
  const { user } = useAuth();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsSystemAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if user has admin role directly in the user object
        // Admin roles can be 'admin', 'superadmin', or 'Platform Admin'
        const adminRoles = ['admin', 'superadmin', 'Platform Admin'];
        const isAdmin = user.role ? adminRoles.includes(user.role) : false;
        
        setIsSystemAdmin(isAdmin);
        
        // For development purposes, you might want to set specific users as admins
        // This can be removed in production
        if (process.env.NODE_ENV === 'development') {
          // List of admin emails for development
          const devAdmins = ['admin@example.com', 'dev@example.com'];
          if (user.email && devAdmins.includes(user.email)) {
            setIsSystemAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  return { isSystemAdmin, isLoading, error };
};
