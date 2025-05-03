/**
 * Terminology Service
 * 
 * Handles retrieval and management of terminology across different levels of the application
 * with support for customization, inheritance, and caching.
 */

import { supabase } from '../supabase';
import { 
  TerminologyEntityType,
  TerminologyValue,
  TerminologyMap,
  ResolvedTerminologyMap,
  TerminologyOverrideBehavior,
  TerminologySettings
} from '../types/terminology.types';

import {
  deepGet,
  applyTerminologyOverride,
  createDefaultTerminology,
  predefinedTerminologySets,
  flattenTerminology,
  unflattenTerminology
} from '../utils/terminology-utils';

// Cache to optimize repeated terminology resolution requests
const terminologyCache = new Map<string, {
  data: ResolvedTerminologyMap,
  timestamp: number
}>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class TerminologyService {
  /**
   * Helper method to get table name based on entity type
   */
  private static getTableNameForEntityType(entityType: TerminologyEntityType): string {
    switch (entityType) {
      case 'partner': return 'partner_terminology';
      case 'organization': return 'organization_terminology';
      case 'company': return 'company_terminology';
      case 'team': return 'team_terminology';
      case 'user': return 'user_terminology_preferences';
      default: throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Helper method to get ID column name based on entity type
   */
  private static getIdColumnForEntityType(entityType: TerminologyEntityType): string {
    switch (entityType) {
      case 'partner': return 'partner_id';
      case 'organization': return 'organization_id';
      case 'company': return 'company_id';
      case 'team': return 'team_id';
      case 'user': return 'user_id';
      default: throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Delete terminology for a specific category
   * @param entityType Type of entity (partner, organization, company, team, user)
   * @param entityId ID of the entity
   * @param category Category to delete (e.g., 'journeyTerms', 'toolTerms')
   * @returns Promise resolving to true if successful
   */
  static async deleteTerminologyForCategory(
    entityType: TerminologyEntityType,
    entityId: string,
    category: string
  ): Promise<boolean> {
    try {
      // Validate input
      if (!entityType || !entityId || !category) {
        throw new Error('Entity type, entity ID, and category are required');
      }

      // Get table name and ID column
      const tableName = this.getTableNameForEntityType(entityType);
      const idColumn = this.getIdColumnForEntityType(entityType);
      
      // Delete all records for this category
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idColumn, entityId)
        .like('key', `${category}.%`);
      
      if (error) {
        console.error(`Error deleting terminology for ${entityType} ${entityId}:`, error);
        throw error;
      }
      
      // Clear cache for this entity
      this.clearCache(entityType, entityId);
      
      return true;
    } catch (err) {
      console.error(`Failed to delete terminology for category ${category}:`, err);
      throw err;
    }
  }

  /**
   * Save terminology records for an entity
   * @param entityType Type of entity (partner, organization, company, team, user)
   * @param entityId ID of the entity
   * @param records Array of terminology records to save
   * @returns Promise resolving to true if successful
   */
  static async saveTerminology(
    entityType: TerminologyEntityType,
    entityId: string,
    records: Array<{
      key: string,
      value: TerminologyValue,
      override_behavior?: TerminologyOverrideBehavior
    }>
  ): Promise<boolean> {
    try {
      // Validate input
      if (!entityType || !entityId || !records || !Array.isArray(records)) {
        throw new Error('Entity type, entity ID, and records array are required');
      }

      // Get table name and ID column
      const tableName = this.getTableNameForEntityType(entityType);
      const idColumn = this.getIdColumnForEntityType(entityType);
      
      // Prepare records with entity ID
      const recordsWithEntityId = records.map(record => ({
        ...record,
        [idColumn]: entityId,
        override_behavior: record.override_behavior || 'replace'
      }));
      
      // Insert records
      if (recordsWithEntityId.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .insert(recordsWithEntityId);
        
        if (error) {
          console.error(`Error saving terminology for ${entityType} ${entityId}:`, error);
          throw error;
        }
      }
      
      // Clear cache for this entity
      this.clearCache(entityType, entityId);
      
      return true;
    } catch (err) {
      console.error('Failed to save terminology:', err);
      throw err;
    }
  }

  /**
   * Retrieve system default terminology
   */
  static async getDefaultTerminology(): Promise<ResolvedTerminologyMap> {
    const cacheKey = 'default';
    const cached = terminologyCache.get(cacheKey);
    
    // Return cached version if available and not expired
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
    
    try {
      // Fetch default terms from database
      const { data: defaultTerms, error } = await supabase
        .from('terminology_defaults')
        .select('key, value');
      
      if (error) {
        throw error;
      }
      
      // Build system defaults
      let result: ResolvedTerminologyMap;
      
      if (defaultTerms?.length) {
        // Convert from flat DB structure to hierarchical object
        const flatMap: Record<string, TerminologyValue> = {};
        defaultTerms.forEach(term => {
          flatMap[term.key] = term.value;
        });
        
        result = unflattenTerminology(flatMap) as ResolvedTerminologyMap;
      } else {
        // Use hardcoded defaults if nothing in DB
        result = createDefaultTerminology();
      }
      
      // Cache the result
      terminologyCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (err) {
      console.error('Failed to fetch default terminology:', err);
      return createDefaultTerminology();
    }
  }

  /**
   * Resolve terminology for a specific entity with inheritance
   * @param entityType Type of entity (partner, company, team, user)
   * @param entityId ID of the entity
   * @param options Optional settings for terminology resolution
   */
  static async resolveTerminology(
    entityType: TerminologyEntityType,
    entityId: string,
    options: { keys?: string[], ignoreCache?: boolean } = {}
  ): Promise<ResolvedTerminologyMap> {
    const { keys, ignoreCache = false } = options;
    
    // Generate unique cache key
    const cacheKey = `${entityType}:${entityId}:${keys ? keys.join(',') : 'all'}`;
    
    // Check cache first
    if (!ignoreCache) {
      const cached = terminologyCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data;
      }
    }
    
    try {
      // Get the base terminology from system defaults
      const baseTerminology = await TerminologyService.getDefaultTerminology();
      
      // No inheritance for system level
      if (entityType === 'system') {
        return baseTerminology;
      }

      // Get terminology settings to determine if A/B testing is active
      const settings = await TerminologyService.getTerminologySettings(entityType, entityId);
      
      // Get inherited terminology for entity
      const result = await TerminologyService.fetchInheritedTerminology(
        entityType,
        entityId,
        baseTerminology,
        settings
      );
      
      // Cache the result
      terminologyCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (err) {
      console.error(`Failed to resolve terminology for ${entityType} ${entityId}:`, err);
      // Fall back to defaults
      return TerminologyService.getDefaultTerminology();
    }
  }
  
  /**
   * Get terminology settings for the given entity
   */
  private static async getTerminologySettings(
    entityType: TerminologyEntityType,
    entityId: string
  ): Promise<TerminologySettings> {
    // Default settings
    const defaultSettings: TerminologySettings = {
      enabled: true
    };
    
    try {
      // For partner entities, check white label configuration
      if (entityType === 'partner') {
        const { data } = await supabase
          .from('white_label_configuration')
          .select('terminology_settings')
          .eq('partner_id', entityId)
          .single();
        
        if (data?.terminology_settings) {
          return {
            ...defaultSettings,
            ...(data.terminology_settings as TerminologySettings)
          };
        }
      }
      
      // Check if entity is part of a terminology A/B test
      const { data: abTest } = await supabase
        .from('terminology_ab_test_assignments')
        .select('test_id, variant')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .limit(1);
      
      if (abTest?.[0]) {
        return {
          ...defaultSettings,
          abTestId: abTest[0].test_id,
          variant: abTest[0].variant
        };
      }
      
      return defaultSettings;
    } catch (err) {
      console.error('Failed to get terminology settings:', err);
      return defaultSettings;
    }
  }
  
  /**
   * Fetch terminology inheritance chain for the given entity
   */
  private static async fetchInheritedTerminology(
    entityType: TerminologyEntityType,
    entityId: string,
    baseTerminology: ResolvedTerminologyMap,
    settings: TerminologySettings
  ): Promise<ResolvedTerminologyMap> {
    // Start with base terminology
    let result = { ...baseTerminology };
    
    // Skip inheritance if disabled
    if (!settings.enabled) {
      return result;
    }
    
    try {
      // Apply terminology override from A/B test variant if applicable
      if (settings.abTestId && settings.variant) {
        const { data: testData } = await supabase
          .from('terminology_ab_test')
          .select('variants')
          .eq('id', settings.abTestId)
          .single();
        
        if (testData?.variants && testData.variants[settings.variant]) {
          const variantTerms = testData.variants[settings.variant];
          result = TerminologyService.mergeTerminology(result, variantTerms);
          return result;
        }
      }
      
      // Determine inheritance path based on entity type
      let inheritanceChain: Array<{ type: TerminologyEntityType, id: string }> = [];
      
      switch (entityType) {
        case 'user':
          // User -> Team -> Company -> Organization -> Partner
          inheritanceChain = await TerminologyService.getUserInheritancePath(entityId);
          break;
          
        case 'team':
          // Team -> Company -> Organization -> Partner
          inheritanceChain = await TerminologyService.getTeamInheritancePath(entityId);
          break;
          
        case 'company':
          // Company -> Organization -> Partner
          inheritanceChain = await TerminologyService.getCompanyInheritancePath(entityId);
          break;
          
        case 'organization':
          // Organization -> Partner
          inheritanceChain = await TerminologyService.getOrganizationInheritancePath(entityId);
          break;
          
        case 'partner':
          // Just the partner
          inheritanceChain = [{ type: 'partner', id: entityId }];
          break;
      }
      
      // Apply terminology in order from highest level (partner) to lowest (user)
      for (let i = inheritanceChain.length - 1; i >= 0; i--) {
        const { type, id } = inheritanceChain[i];
        const entityTerms = await TerminologyService.getEntityTerminology(type, id);
        result = TerminologyService.mergeTerminology(result, entityTerms);
      }
      
      return result;
    } catch (err) {
      console.error('Failed to fetch inherited terminology:', err);
      return result;
    }
  }
  
  /**
   * Get user's inheritance path
   */
  private static async getUserInheritancePath(
    userId: string
  ): Promise<Array<{ type: TerminologyEntityType, id: string }>> {
    const result = [{ type: 'user' as TerminologyEntityType, id: userId }];
    
    try {
      // Get user's team
      const { data: teamData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .limit(1);
      
      if (teamData && teamData.length > 0) {
        const teamPath = await TerminologyService.getTeamInheritancePath(teamData[0].team_id);
        result.push(...teamPath);
        return result;
      }
      
      // Try to get user's company if not part of a team
      const { data: companyData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', userId)
        .limit(1);
      
      if (companyData && companyData.length > 0) {
        const companyPath = await TerminologyService.getCompanyInheritancePath(companyData[0].company_id);
        result.push(...companyPath);
      }
      
      return result;
    } catch (err) {
      console.error('Failed to get user inheritance path:', err);
      return result;
    }
  }
  
  /**
   * Get team's inheritance path
   */
  private static async getTeamInheritancePath(
    teamId: string
  ): Promise<Array<{ type: TerminologyEntityType, id: string }>> {
    const result = [{ type: 'team' as TerminologyEntityType, id: teamId }];
    
    try {
      // Get team's company
      const { data: teamData } = await supabase
        .from('teams')
        .select('company_id')
        .eq('id', teamId)
        .single();
      
      if (teamData?.company_id) {
        const companyPath = await TerminologyService.getCompanyInheritancePath(teamData.company_id);
        result.push(...companyPath);
      }
      
      return result;
    } catch (err) {
      console.error('Failed to get team inheritance path:', err);
      return result;
    }
  }
  
  /**
   * Get company's inheritance path
   */
  private static async getCompanyInheritancePath(
    companyId: string
  ): Promise<Array<{ type: TerminologyEntityType, id: string }>> {
    const result = [{ type: 'company' as TerminologyEntityType, id: companyId }];
    
    try {
      // Get company's organization
      const { data: companyData } = await supabase
        .from('companies')
        .select('organization_id')
        .eq('id', companyId)
        .single();
      
      if (companyData?.organization_id) {
        const orgPath = await TerminologyService.getOrganizationInheritancePath(companyData.organization_id);
        result.push(...orgPath);
      }
      
      return result;
    } catch (err) {
      console.error('Failed to get company inheritance path:', err);
      return result;
    }
  }
  
  /**
   * Get organization's inheritance path
   */
  private static async getOrganizationInheritancePath(
    orgId: string
  ): Promise<Array<{ type: TerminologyEntityType, id: string }>> {
    const result = [{ type: 'organization' as TerminologyEntityType, id: orgId }];
    
    try {
      // Get organization's partner
      const { data: orgData } = await supabase
        .from('organizations')
        .select('partner_id')
        .eq('id', orgId)
        .single();
      
      if (orgData?.partner_id) {
        result.push({ type: 'partner', id: orgData.partner_id });
      }
      
      return result;
    } catch (err) {
      console.error('Failed to get org inheritance path:', err);
      return result;
    }
  }
  
  /**
   * Get terminology for a specific entity type
   */
  private static async getEntityTerminology(
    entityType: TerminologyEntityType,
    entityId: string
  ): Promise<TerminologyMap> {
    let tableName: string;
    let idColumn: string;
    
    switch (entityType) {
      case 'partner':
        tableName = 'partner_terminology';
        idColumn = 'partner_id';
        break;
      case 'organization':
        tableName = 'organization_terminology';
        idColumn = 'organization_id';
        break;
      case 'company':
        tableName = 'company_terminology';
        idColumn = 'company_id';
        break;
      case 'team':
        tableName = 'team_terminology';
        idColumn = 'team_id';
        break;
      case 'user':
        tableName = 'user_terminology_preferences';
        idColumn = 'user_id';
        break;
      default:
        return {};
    }
    
    try {
      // Query for entity's terminology
      const { data, error } = await supabase
        .from(tableName)
        .select('key, value, override_behavior')
        .eq(idColumn, entityId);
      
      if (error) {
        throw error;
      }
      
      // Convert from flat DB structure to hierarchical object
      const flatMap: Record<string, TerminologyValue> = {};
      const behaviors: Record<string, TerminologyOverrideBehavior> = {};
      
      data?.forEach(term => {
        flatMap[term.key] = term.value;
        if ('override_behavior' in term) {
          behaviors[term.key] = term.override_behavior as TerminologyOverrideBehavior;
        }
      });
      
      const unflattenedTerms = unflattenTerminology(flatMap);
      
      return {
        terms: unflattenedTerms as Record<string, TerminologyMap>,
        behaviors
      };
    } catch (err) {
      console.error(`Failed to get terminology for ${entityType} ${entityId}:`, err);
      return {};
    }
  }
  
  /**
   * Merge terminology with override behaviors
   */
  private static mergeTerminology(
    base: ResolvedTerminologyMap,
    override: any
  ): ResolvedTerminologyMap {
    if (!override || Object.keys(override).length === 0) {
      return base;
    }
    
    const { terms, behaviors = {} } = override;
    
    if (!terms || Object.keys(terms).length === 0) {
      return base;
    }
    
    // Create a deep copy of the base
    const result = { ...base };
    
    // Flatten terms for easier access
    const flatTerms = flattenTerminology(terms);
    
    // Apply each term with its override behavior
    for (const [key, value] of Object.entries(flatTerms)) {
      const behavior = behaviors[key] || 'replace';
      const baseValue = deepGet(base, key);
      
      // Apply the override based on behavior
      const updatedValue = applyTerminologyOverride(baseValue, value, behavior);
      
      // Update the result with the new value at the correct path
      const path = key.split('.');
      let current = result;
      
      for (let i = 0; i < path.length - 1; i++) {
        const part = path[i];
        current[part] = current[part] || {};
        current = current[part];
      }
      
      current[path[path.length - 1]] = updatedValue;
    }
    
    return result;
  }
  
  /**
   * Clear terminology cache
   */
  static clearCache(entityType?: TerminologyEntityType, entityId?: string): void {
    if (!entityType) {
      // Clear entire cache
      terminologyCache.clear();
      return;
    }
    
    if (!entityId) {
      // Clear all entries for the given entity type
      const keysToRemove: string[] = [];
      terminologyCache.forEach((_, key) => {
        if (key.startsWith(`${entityType}:`)) {
          keysToRemove.push(key);
        }
      });
      
      keysToRemove.forEach(key => terminologyCache.delete(key));
      return;
    }
    
    // Clear only the specific entity
    const keyPrefix = `${entityType}:${entityId}:`;
    const keysToRemove: string[] = [];
    terminologyCache.forEach((_, key) => {
      if (key.startsWith(keyPrefix)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => terminologyCache.delete(key));
  }

  /**
   * Apply predefined terminology template
   */
  static async applyPredefinedTerminology(
    entityType: TerminologyEntityType,
    entityId: string,
    templateKey: string
  ): Promise<boolean> {
    try {
      const template = predefinedTerminologySets[templateKey];
      if (!template) {
        throw new Error(`Template '${templateKey}' not found`);
      }

      // Flatten template for db storage
      const flat = flattenTerminology(template);
      const records = Object.entries(flat).map(([key, value]) => ({
        key,
        value,
        override_behavior: 'replace' as TerminologyOverrideBehavior
      }));

      let tableName: string;
      let idColumn: string;

      switch (entityType) {
        case 'partner':
          tableName = 'partner_terminology';
          idColumn = 'partner_id';
          break;
        case 'organization':
          tableName = 'organization_terminology';
          idColumn = 'organization_id';
          break;
        case 'company':
          tableName = 'company_terminology';
          idColumn = 'company_id';
          break;
        case 'team':
          tableName = 'team_terminology';
          idColumn = 'team_id';
          break;
        case 'user':
          tableName = 'user_terminology_preferences';
          idColumn = 'user_id';
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }

      // Delete existing terminology
      await supabase
        .from(tableName)
        .delete()
        .eq(idColumn, entityId);

      // Insert new terminology
      if (records.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .insert(records.map(record => ({
            ...record,
            [idColumn]: entityId
          })));

        if (error) throw error;
      }

      // Clear cache for this entity
      this.clearCache(entityType, entityId);

      return true;
    } catch (err) {
      console.error('Failed to apply predefined terminology:', err);
      return false;
    }
  }
}
