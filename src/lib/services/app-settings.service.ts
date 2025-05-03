import { supabase } from '../supabase';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    digest: boolean;
  };
  display: {
    compactView: boolean;
    showTips: boolean;
    cardSize: 'small' | 'medium' | 'large';
  };
  features: {
    [key: string]: boolean;
  };
  huggingface?: {
    api_key: string;
    spaces: {
      base: { url: string; model_id: string };
      company: { url: string; model_id: string };
      abstraction: { url: string; model_id: string };
    };
    default_tier: 'base' | 'company' | 'abstraction';
    enabled: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    inApp: true,
    digest: false
  },
  display: {
    compactView: false,
    showTips: true,
    cardSize: 'medium'
  },
  features: {},
  huggingface: {
    api_key: '',
    spaces: {
      base: { url: '', model_id: '' },
      company: { url: '', model_id: '' },
      abstraction: { url: '', model_id: '' }
    },
    default_tier: 'base',
    enabled: false
  }
};

class AppSettingsService {
  // Global app settings methods (app-wide, not user-specific)
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

  // User-specific settings methods
  async getUserSettings(userId: string): Promise<AppSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        return this.createDefaultSettings(userId);
      }
      
      return data.settings as AppSettings;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return this.createDefaultSettings(userId);
    }
  }
  
  async updateUserSettings(userId: string, settings: Partial<AppSettings>): Promise<AppSettings | null> {
    try {
      // First get current settings
      const currentSettings = await this.getUserSettings(userId);
      
      // Merge with new settings
      const updatedSettings = this.deepMerge(currentSettings, settings);
      
      // Update in the database
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        return null;
      }
      
      return data.settings as AppSettings;
    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      return null;
    }
  }
  
  private async createDefaultSettings(userId: string): Promise<AppSettings> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: DEFAULT_SETTINGS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating default settings:', error);
      }
      
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      return DEFAULT_SETTINGS;
    }
  }
  
  // Deep merge utility for nested objects - simplified version
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };
    
    Object.keys(source).forEach(key => {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null && 
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' && 
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        // If both values are objects, recursively merge
        output[key] = this.deepMerge(target[key], source[key]);
      } else {
        // Otherwise just assign the source value
        output[key] = source[key];
      }
    });
    
    return output;
  }
}

export const appSettingsService = new AppSettingsService();
