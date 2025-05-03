/**
 * DISABLED Privacy Service
 * 
 * This service has been temporarily disabled to prevent 406 errors with consent settings.
 * All operations are now no-ops (they do nothing) but provide sensible defaults.
 */

import { useAuthStore } from '../store';

/**
 * Privacy Service Interface
 */
export interface PrivacyService {
  getUserConsent: (userId: string) => Promise<any>;
  updateUserConsent: (userId: string, settings: any) => Promise<void>;
  logEvent: (eventData: any) => Promise<void>;
}

/**
 * No-op implementation of Privacy Service
 */
class DisabledPrivacyService implements PrivacyService {
  constructor() {
    console.log('[PrivacyService] Initialized in DISABLED mode to prevent 406 errors');
  }

  /**
   * Get user consent settings (returns default values)
   */
  async getUserConsent(userId: string): Promise<any> {
    console.log('[PrivacyService] getUserConsent called (DISABLED) for user:', userId);
    
    // Return default consent settings that allow basic functionality
    return {
      analytics_consent: true,
      marketing_consent: false,
      data_processing_consent: true,
      third_party_consent: false,
      last_updated: new Date().toISOString(),
      user_id: userId
    };
  }

  /**
   * Update user consent settings (no-op)
   */
  async updateUserConsent(userId: string, settings: any): Promise<void> {
    console.log('[PrivacyService] updateUserConsent called (DISABLED) for user:', userId, settings);
    
    // No-op implementation
    return Promise.resolve();
  }

  /**
   * Log event (no-op)
   */
  async logEvent(eventData: any): Promise<void> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[PrivacyService] logEvent called (DISABLED):', eventData);
    }
    
    // No-op implementation
    return Promise.resolve();
  }
}

// Export singleton instance
export const privacyService = new DisabledPrivacyService();
