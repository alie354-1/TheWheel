# Hugging Face Settings - Fixed as App-Wide Settings

## Issue

The Hugging Face settings were not saving correctly because of an inconsistency in how the app was handling settings storage. The core issue was:

1. The application has two settings tables:
   - `app_settings`: Global, app-wide settings (shared by all users)
   - `user_settings`: User-specific settings (separate for each user)

2. The `HuggingFaceSettings.tsx` component was trying to store settings directly in the correct table (`app_settings`):
   ```javascript
   const { error: updateError } = await supabase
     .from('app_settings')
     .upsert({
       key: 'huggingface',
       value: settings,
       updated_at: new Date().toISOString()
     }, {
       onConflict: 'key'
     });
   ```

3. However, there was no dedicated method in the `appSettingsService` to handle global settings; it only had methods for user-specific settings:
   ```javascript
   async updateUserSettings(userId: string, settings: Partial<AppSettings>): Promise<AppSettings | null> {
     // ...
   }
   ```

## Solution

Since Hugging Face settings should be app-wide (global) rather than user-specific, we needed to:

1. Add proper global settings methods to the `appSettingsService` 
2. Modify the component to use these new methods instead of direct database access

### Key Changes

1. Added global settings methods to the service:
   ```typescript
   // In app-settings.service.ts
   async getGlobalSettings(key: string): Promise<any> {
     try {
       const { data, error } = await supabase
         .from('app_settings')
         .select('value')
         .eq('key', key)
         .single();

       if (error) {
         console.error(`Error fetching global settings for key ${key}:`, error);
         return null;
       }
       
       return data.value;
     } catch (error) {
       console.error(`Error in getGlobalSettings for key ${key}:`, error);
       return null;
     }
   }
   
   async updateGlobalSettings(key: string, value: any): Promise<any> {
     try {
       const { data, error } = await supabase
         .from('app_settings')
         .upsert({
           key,
           value,
           updated_at: new Date().toISOString()
         }, {
           onConflict: 'key'
         })
         .select()
         .single();

       if (error) {
         console.error(`Error updating global settings for key ${key}:`, error);
         return null;
       }
       
       return data.value;
     } catch (error) {
       console.error(`Error in updateGlobalSettings for key ${key}:`, error);
       return null;
     }
   }
   ```

2. Modified the component to use these new global settings methods:
   ```typescript
   const loadSettings = async () => {
     try {
       const huggingfaceSettings = await appSettingsService.getGlobalSettings('huggingface');
       
       if (huggingfaceSettings) {
         setSettings(huggingfaceSettings);
       }
     } catch (error) {
       console.error('Error loading Hugging Face settings:', error);
     }
   };

   const handleSave = async () => {
     // validation...
     try {
       const updatedSettings = await appSettingsService.updateGlobalSettings('huggingface', settings);
       
       if (!updatedSettings) {
         throw new Error('Failed to update settings');
       }
       
       setSuccess('Hugging Face settings saved successfully!');
     } catch (error) {
       // error handling...
     }
   };
   ```

## Why This Works

1. **Appropriate Storage**: Now the settings are properly stored as app-wide settings in the `app_settings` table
2. **Consistent Interface**: We have a proper service interface for accessing global settings
3. **Code Organization**: Direct database access is encapsulated in the service layer
4. **Error Handling**: We have consistent error handling patterns throughout the application

## Testing

To verify the fix works:

1. Navigate to the Hugging Face settings page
2. Enter valid settings
3. Save the settings
4. Refresh the page - the settings should persist
5. Log in as a different user - they should see the same settings (unlike user-specific settings)
