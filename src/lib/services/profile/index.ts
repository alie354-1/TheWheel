/**
 * Profile Service exports
 */
export * from './types';
export * from './profile.service';

// Export singleton instance for direct usage
import { profileServiceInstance } from './profile.service';
export const profileService = profileServiceInstance;