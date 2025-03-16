import { User } from '@supabase/supabase-js';
import { mockProfileService } from './mock-profile.service';

export class MockAuthService {
  private mockUser: User = {
    id: 'mock-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };

  constructor() {}

  async signIn(): Promise<{ user: User | null; error: Error | null }> {
    return { user: this.mockUser, error: null };
  }

  async signOut(): Promise<{ error: Error | null }> {
    return { error: null };
  }

  async getSession() {
    return {
      data: {
        session: {
          user: this.mockUser
        }
      },
      error: null
    };
  }

  async getUser() {
    return {
      data: {
        user: this.mockUser
      },
      error: null
    };
  }

  async refreshSession() {
    return {
      data: {
        session: {
          user: this.mockUser
        }
      },
      error: null
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Simulate an initial auth state change
    setTimeout(() => {
      callback('SIGNED_IN', {
        user: this.mockUser
      });
    }, 100);

    // Return a mock unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
}

export const mockAuthService = new MockAuthService();
