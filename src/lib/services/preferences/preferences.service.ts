/**
 * Preferences Service
 * Provides a centralized service for managing user, company, and application preferences
 */

import { PreferenceMap, PreferenceChangeEvent, PreferenceChangeListener, PreferenceScope, PreferenceService, PreferenceValue } from './types';
import { serviceRegistry } from '../registry';

export class PreferencesServiceImpl implements PreferenceService {
  private listeners: PreferenceChangeListener[] = [];
  private inMemoryCache: {
    user: Record<string, PreferenceMap>;
    company: Record<string, PreferenceMap>;
    application: Record<string, PreferenceMap>;
  } = {
    user: {},
    company: {},
    application: {}
  };
  
  /**
   * Get a preference value by key, scope, and optional scopeId
   */
  async get<T extends PreferenceValue>(key: string, scope: PreferenceScope, scopeId?: string): Promise<T | null> {
    this.validateScopeId(scope, scopeId);
    
    // Try to get from cache first
    const cached = this.getFromCache<T>(key, scope, scopeId!);
    if (cached !== undefined) {
      return cached;
    }
    
    // Get from storage
    try {
      const supabase = serviceRegistry.get('supabase');
      
      const { data, error } = await supabase
        .from('preferences')
        .select('value')
        .eq('key', key)
        .eq('scope', scope)
        .eq('scope_id', scopeId || '')
        .single();
      
      if (error) {
        console.error(`Error fetching preference ${key}:`, error);
        return null;
      }
      
      // Update cache
      this.updateCache(key, data?.value || null, scope, scopeId!);
      
      return (data?.value as T) || null;
    } catch (error) {
      console.error(`Error in preferences.get(${key}):`, error);
      return null;
    }
  }
  
  /**
   * Get all preferences for a scope and scopeId
   */
  async getAll(scope: PreferenceScope, scopeId?: string): Promise<PreferenceMap> {
    this.validateScopeId(scope, scopeId);
    
    // Get from cache if available
    const cachedMap = this.getAllFromCache(scope, scopeId!);
    if (Object.keys(cachedMap).length > 0) {
      return cachedMap;
    }
    
    // Get from storage
    try {
      const supabase = serviceRegistry.get('supabase');
      
      const { data, error } = await supabase
        .from('preferences')
        .select('key, value')
        .eq('scope', scope)
        .eq('scope_id', scopeId || '');
      
      if (error) {
        console.error(`Error fetching preferences for ${scope}:`, error);
        return {};
      }
      
      const preferences: PreferenceMap = {};
      
      data?.forEach(item => {
        preferences[item.key] = item.value;
        
        // Update cache
        this.updateCache(item.key, item.value, scope, scopeId!);
      });
      
      return preferences;
    } catch (error) {
      console.error(`Error in preferences.getAll(${scope}):`, error);
      return {};
    }
  }
  
  /**
   * Set a preference value
   */
  async set<T extends PreferenceValue>(key: string, value: T, scope: PreferenceScope, scopeId?: string): Promise<void> {
    this.validateScopeId(scope, scopeId);
    
    try {
      const supabase = serviceRegistry.get('supabase');
      const oldValue = await this.get(key, scope, scopeId);
      
      const { error } = await supabase
        .from('preferences')
        .upsert({
          key,
          value,
          scope,
          scope_id: scopeId || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'key,scope,scope_id' });
      
      if (error) {
        console.error(`Error setting preference ${key}:`, error);
        throw error;
      }
      
      // Update cache
      this.updateCache(key, value, scope, scopeId!);
      
      // Notify listeners
      this.notifyChange({
        key,
        oldValue,
        newValue: value,
        scope,
        scopeId
      });
      
    } catch (error) {
      console.error(`Error in preferences.set(${key}):`, error);
      throw error;
    }
  }
  
  /**
   * Set multiple preferences at once
   */
  async setMultiple(preferences: PreferenceMap, scope: PreferenceScope, scopeId?: string): Promise<void> {
    this.validateScopeId(scope, scopeId);
    
    try {
      const supabase = serviceRegistry.get('supabase');
      const timestamp = new Date().toISOString();
      
      // Get old values for change events
      const oldValues = await this.getAll(scope, scopeId);
      
      // Prepare upsert data
      const upsertData = Object.entries(preferences).map(([key, value]) => ({
        key,
        value,
        scope,
        scope_id: scopeId || '',
        updated_at: timestamp
      }));
      
      const { error } = await supabase
        .from('preferences')
        .upsert(upsertData, { onConflict: 'key,scope,scope_id' });
      
      if (error) {
        console.error(`Error setting multiple preferences:`, error);
        throw error;
      }
      
      // Update cache and notify listeners
      Object.entries(preferences).forEach(([key, value]) => {
        this.updateCache(key, value, scope, scopeId!);
        
        this.notifyChange({
          key,
          oldValue: oldValues[key] || null,
          newValue: value,
          scope,
          scopeId
        });
      });
      
    } catch (error) {
      console.error(`Error in preferences.setMultiple:`, error);
      throw error;
    }
  }
  
  /**
   * Remove a preference
   */
  async remove(key: string, scope: PreferenceScope, scopeId?: string): Promise<void> {
    this.validateScopeId(scope, scopeId);
    
    try {
      const supabase = serviceRegistry.get('supabase');
      const oldValue = await this.get(key, scope, scopeId);
      
      const { error } = await supabase
        .from('preferences')
        .delete()
        .eq('key', key)
        .eq('scope', scope)
        .eq('scope_id', scopeId || '');
      
      if (error) {
        console.error(`Error removing preference ${key}:`, error);
        throw error;
      }
      
      // Update cache
      this.removeFromCache(key, scope, scopeId!);
      
      // Notify listeners
      this.notifyChange({
        key,
        oldValue,
        newValue: null,
        scope,
        scopeId
      });
      
    } catch (error) {
      console.error(`Error in preferences.remove(${key}):`, error);
      throw error;
    }
  }
  
  /**
   * Remove multiple preferences
   */
  async removeMultiple(keys: string[], scope: PreferenceScope, scopeId?: string): Promise<void> {
    this.validateScopeId(scope, scopeId);
    
    if (keys.length === 0) return;
    
    try {
      // Get old values for change events
      const oldValues = await this.getAll(scope, scopeId);
      
      const supabase = serviceRegistry.get('supabase');
      
      // Delete all at once
      const { error } = await supabase
        .from('preferences')
        .delete()
        .eq('scope', scope)
        .eq('scope_id', scopeId || '')
        .in('key', keys);
      
      if (error) {
        console.error(`Error removing multiple preferences:`, error);
        throw error;
      }
      
      // Update cache and notify listeners
      keys.forEach(key => {
        this.removeFromCache(key, scope, scopeId!);
        
        this.notifyChange({
          key,
          oldValue: oldValues[key] || null,
          newValue: null,
          scope,
          scopeId
        });
      });
      
    } catch (error) {
      console.error(`Error in preferences.removeMultiple:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all preferences for a scope
   */
  async clear(scope: PreferenceScope, scopeId?: string): Promise<void> {
    this.validateScopeId(scope, scopeId);
    
    try {
      // Get old values for change events
      const oldValues = await this.getAll(scope, scopeId);
      const keys = Object.keys(oldValues);
      
      if (keys.length === 0) return;
      
      const supabase = serviceRegistry.get('supabase');
      
      const { error } = await supabase
        .from('preferences')
        .delete()
        .eq('scope', scope)
        .eq('scope_id', scopeId || '');
      
      if (error) {
        console.error(`Error clearing preferences for ${scope}:`, error);
        throw error;
      }
      
      // Clear cache
      this.clearCache(scope, scopeId!);
      
      // Notify listeners for each removed preference
      keys.forEach(key => {
        this.notifyChange({
          key,
          oldValue: oldValues[key],
          newValue: null,
          scope,
          scopeId
        });
      });
      
    } catch (error) {
      console.error(`Error in preferences.clear(${scope}):`, error);
      throw error;
    }
  }
  
  /**
   * Check if a preference exists
   */
  async has(key: string, scope: PreferenceScope, scopeId?: string): Promise<boolean> {
    this.validateScopeId(scope, scopeId);
    
    try {
      const value = await this.get(key, scope, scopeId);
      return value !== null;
    } catch (error) {
      console.error(`Error in preferences.has(${key}):`, error);
      return false;
    }
  }
  
  /**
   * Add a change listener
   */
  addChangeListener(listener: PreferenceChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Convenience methods for user preferences
  
  /**
   * Get a user preference
   */
  async getUserPreference<T extends PreferenceValue>(key: string, userId: string): Promise<T | null> {
    return this.get<T>(key, 'user', userId);
  }
  
  /**
   * Set a user preference
   */
  async setUserPreference<T extends PreferenceValue>(key: string, value: T, userId: string): Promise<void> {
    return this.set<T>(key, value, 'user', userId);
  }
  
  /**
   * Get all user preferences
   */
  async getAllUserPreferences(userId: string): Promise<PreferenceMap> {
    return this.getAll('user', userId);
  }
  
  // Convenience methods for company preferences
  
  /**
   * Get a company preference
   */
  async getCompanyPreference<T extends PreferenceValue>(key: string, companyId: string): Promise<T | null> {
    return this.get<T>(key, 'company', companyId);
  }
  
  /**
   * Set a company preference
   */
  async setCompanyPreference<T extends PreferenceValue>(key: string, value: T, companyId: string): Promise<void> {
    return this.set<T>(key, value, 'company', companyId);
  }
  
  /**
   * Get all company preferences
   */
  async getAllCompanyPreferences(companyId: string): Promise<PreferenceMap> {
    return this.getAll('company', companyId);
  }
  
  // Convenience methods for application preferences
  
  /**
   * Get an application preference
   */
  async getApplicationPreference<T extends PreferenceValue>(key: string): Promise<T | null> {
    return this.get<T>(key, 'application');
  }
  
  /**
   * Set an application preference
   */
  async setApplicationPreference<T extends PreferenceValue>(key: string, value: T): Promise<void> {
    return this.set<T>(key, value, 'application');
  }
  
  /**
   * Get all application preferences
   */
  async getAllApplicationPreferences(): Promise<PreferenceMap> {
    return this.getAll('application');
  }
  
  // Private helper methods
  
  /**
   * Validate scope ID requirement
   */
  private validateScopeId(scope: PreferenceScope, scopeId?: string): void {
    if ((scope === 'user' || scope === 'company') && !scopeId) {
      throw new Error(`scopeId is required for ${scope} preferences`);
    }
  }
  
  /**
   * Notify listeners of preference changes
   */
  private notifyChange(event: PreferenceChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in preference change listener:', error);
      }
    });
  }
  
  /**
   * Get a preference from the cache
   */
  private getFromCache<T>(key: string, scope: PreferenceScope, scopeId: string): T | null | undefined {
    const scopeCache = this.inMemoryCache[scope];
    const idCache = scopeCache[scopeId];
    
    if (!idCache) return undefined;
    
    return idCache[key] as T | null | undefined;
  }
  
  /**
   * Get all preferences from the cache for a scope
   */
  private getAllFromCache(scope: PreferenceScope, scopeId: string): PreferenceMap {
    const scopeCache = this.inMemoryCache[scope];
    return scopeCache[scopeId] || {};
  }
  
  /**
   * Update the cache with a new preference value
   */
  private updateCache(key: string, value: PreferenceValue, scope: PreferenceScope, scopeId: string): void {
    if (!this.inMemoryCache[scope][scopeId]) {
      this.inMemoryCache[scope][scopeId] = {};
    }
    
    this.inMemoryCache[scope][scopeId][key] = value;
  }
  
  /**
   * Remove a preference from the cache
   */
  private removeFromCache(key: string, scope: PreferenceScope, scopeId: string): void {
    if (!this.inMemoryCache[scope][scopeId]) return;
    
    delete this.inMemoryCache[scope][scopeId][key];
  }
  
  /**
   * Clear all preferences from the cache for a scope
   */
  private clearCache(scope: PreferenceScope, scopeId: string): void {
    this.inMemoryCache[scope][scopeId] = {};
  }
}