/**
 * Auth Service Types
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  isAdmin?: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthService {
  /**
   * Login a user
   */
  login(credentials: AuthCredentials): Promise<User>;
  
  /**
   * Logout the current user
   */
  logout(): Promise<void>;
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Check if a user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Register a new user
   */
  register(credentials: AuthCredentials, userData?: Partial<User>): Promise<User>;
  
  /**
   * Send password reset email
   */
  resetPassword(email: string): Promise<void>;
  
  /**
   * Update user password
   */
  updatePassword(oldPassword: string, newPassword: string): Promise<void>;
  
  /**
   * Get auth state
   */
  getAuthState(): AuthState;
  
  /**
   * Subscribe to auth state changes
   */
  subscribeToAuthChanges(callback: (state: AuthState) => void): () => void;
}