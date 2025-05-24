import { PreferencesServiceImpl } from './preferences.service';

export * from './types';
export * from './preferences.service';

// Export a singleton instance
export const preferencesService = new PreferencesServiceImpl();