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
  features: {}
};

class AppSettingsService {
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
