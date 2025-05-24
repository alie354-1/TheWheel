import { supabase } from '../supabase';
import { loggingService } from './logging.service';

// Define the structure for an application setting
export interface AppSetting { // Added export
  key: string; // Unique key for the setting (e.g., 'enable_feature_x', 'default_theme')
  value: any; // The value of the setting (can be boolean, string, number, object)
  description?: string; // Optional description of the setting
  scope: 'global' | 'company'; // Whether the setting is global or company-specific
  company_id?: string | null; // Required if scope is 'company'
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing application settings.
 */
export const appSettingsService = {
  /**
   * Fetches a specific application setting.
   * Checks for company-specific setting first, then falls back to global if applicable.
   *
   * @param key - The unique key of the setting.
   * @param companyId - Optional company ID for company-scoped settings.
   * @returns A promise resolving to the setting value or null if not found/error.
   */
  async getSetting(key: string, companyId?: string): Promise<any | null> {
    if (!key) {
      loggingService.logError(new Error('getSetting called without a key'));
      return null;
    }

    try {
      let setting: AppSetting | null = null;

      // 1. Try fetching company-specific setting if companyId is provided
      if (companyId) {
        const { data: companyData, error: companyError } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', key)
          .eq('scope', 'company')
          .eq('company_id', companyId)
          .maybeSingle();

        if (companyError) {
           loggingService.logError(new Error(companyError.message), { context: 'getSetting (company)', key, companyId, dbError: companyError });
           // Don't return yet, try global fallback
        } else if (companyData) {
          setting = companyData as AppSetting; // Assuming structure matches
           if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
             loggingService.logInfo('Fetched company-specific setting', { key, companyId, value: setting?.value });
           }
          return setting?.value; // Return company-specific value
        }
      }

      // 2. Fetch global setting if no company-specific one was found or needed
      const { data: globalData, error: globalError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .eq('scope', 'global')
        .maybeSingle();

      if (globalError) {
        loggingService.logError(new Error(globalError.message), { context: 'getSetting (global)', key, dbError: globalError });
        return null; // Error fetching global setting
      }

      setting = globalData as AppSetting;
      if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
        loggingService.logInfo('Fetched global setting', { key, value: setting?.value });
      }
      return setting?.value ?? null; // Return global value or null if not found

    } catch (exception: any) {
      loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'getSetting', key, companyId, exception });
      return null;
    }
  },

  /**
   * Fetches all settings, optionally filtered by scope and/or company.
   *
   * @param scope - Optional filter by scope ('global' or 'company').
   * @param companyId - Optional company ID (required if scope is 'company').
   * @returns A promise resolving to an array of settings or null if error.
   */
  async getAllSettings(scope?: 'global' | 'company', companyId?: string): Promise<AppSetting[] | null> {
     if (scope === 'company' && !companyId) {
       loggingService.logError(new Error('getAllSettings called with scope "company" but no companyId'));
       return null;
     }

     try {
       let query = supabase.from('app_settings').select('*');

       if (scope) {
         query = query.eq('scope', scope);
         if (scope === 'company' && companyId) {
           query = query.eq('company_id', companyId);
         }
       }

       const { data, error } = await query;

       if (error) {
         loggingService.logError(new Error(error.message), { context: 'getAllSettings', scope, companyId, dbError: error });
         return null;
       }
       return data;
     } catch (exception: any) {
       loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'getAllSettings', scope, companyId, exception });
       return null;
     }
  },

  /**
   * Updates or creates an application setting. Requires admin privileges.
   *
   * @param settingData - The setting data to upsert.
   * @param adminUserId - The ID of the admin user performing the action (for permission check).
   * @returns A promise resolving to the updated/created setting or null if error/permission denied.
   */
  async upsertSetting(
    settingData: Omit<AppSetting, 'created_at' | 'updated_at'>,
    adminUserId: string // Assuming an admin check is needed
  ): Promise<AppSetting | null> {
    if (!settingData.key || !settingData.scope) {
       loggingService.logError(new Error('upsertSetting called with missing key or scope'), { settingData });
       return null;
    }
    if (settingData.scope === 'company' && !settingData.company_id) {
       loggingService.logError(new Error('upsertSetting called with company scope but no company_id'), { settingData });
       return null;
    }
     if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
       loggingService.logInfo('Upserting app setting', { adminUserId, settingData });
     }
     console.warn(`upsertSetting: Not fully implemented. Requires permission check.`);
     // TODO: Implement permission check for adminUserId

     try {
       // --- Placeholder Permission Check ---
       // const isAdmin = await checkAdminPermission(adminUserId); // Implement this check
       const isAdmin = true; // Assume admin for now
       if (!isAdmin) {
         throw new Error('User does not have permission to manage application settings.');
       }
       // --- End Placeholder ---

       // Prepare data for upsert
       const upsertPayload: any = {
         key: settingData.key,
         value: settingData.value,
         scope: settingData.scope,
         description: settingData.description,
         company_id: settingData.scope === 'company' ? settingData.company_id : null,
       };

       // Define conflict resolution based on scope
       const conflictKey = settingData.scope === 'global' ? 'key, scope' : 'key, scope, company_id';

       const { data, error } = await supabase
         .from('app_settings')
         .upsert(upsertPayload, { onConflict: conflictKey as any }) // Cast needed if TS complains about dynamic key
         .select()
         .single();

       if (error) {
         loggingService.logError(new Error(error.message), { context: 'upsertSetting', settingData, dbError: error });
         return null;
       }

       if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
         loggingService.logInfo('App setting upserted successfully', { data });
       }
       return data;

     } catch (exception: any) {
       loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'upsertSetting', settingData, exception });
       return null;
     }
  },

  /**
   * Deletes an application setting. Requires admin privileges.
   * Note: Be cautious deleting global settings.
   *
   * @param key - The key of the setting to delete.
   * @param scope - The scope of the setting.
   * @param companyId - The company ID if scope is 'company'.
   * @param adminUserId - The ID of the admin user performing the action.
   * @returns A promise resolving to true on success, false otherwise.
   */
  async deleteSetting(
    key: string,
    scope: 'global' | 'company',
    adminUserId: string,
    companyId?: string
  ): Promise<boolean> {
     if (!key || !scope) {
       loggingService.logError(new Error('deleteSetting called with missing key or scope'), { key, scope, companyId });
       return false;
     }
     if (scope === 'company' && !companyId) {
       loggingService.logError(new Error('deleteSetting called with company scope but no company_id'), { key, scope });
       return false;
     }
     if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
       loggingService.logInfo('Deleting app setting', { adminUserId, key, scope, companyId });
     }
     console.warn(`deleteSetting: Not fully implemented. Requires permission check.`);
     // TODO: Implement permission check for adminUserId

     try {
       // --- Placeholder Permission Check ---
       const isAdmin = true; // Assume admin for now
       if (!isAdmin) {
         throw new Error('User does not have permission to delete application settings.');
       }
       // --- End Placeholder ---

       let query = supabase.from('app_settings').delete().eq('key', key).eq('scope', scope);

       if (scope === 'company' && companyId) {
         query = query.eq('company_id', companyId);
       }

       const { error } = await query;

       if (error) {
         loggingService.logError(new Error(error.message), { context: 'deleteSetting', key, scope, companyId, dbError: error });
         return false;
       }

       if ('logInfo' in loggingService && typeof loggingService.logInfo === 'function') {
         loggingService.logInfo('App setting deleted successfully', { key, scope, companyId });
       }
       return true;

     } catch (exception: any) {
       loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), { context: 'deleteSetting', key, scope, companyId, exception });
       return false;
     }
  },
};
