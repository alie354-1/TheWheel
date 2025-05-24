/**
 * Feature Flags Types - Shared type definitions for the feature flags system
 */

/**
 * Definition of a single feature flag
 */
export interface FeatureFlag {
  enabled: boolean; // Whether the feature is functionally enabled
  visible: boolean; // Whether the feature should be shown in the UI
  description?: string; // Optional description of what the feature controls
  override?: boolean; // Optional field to track if a user/company override is in effect
}

/**
 * Complete map of all feature flags
 */
export interface FeatureFlags {
  [key: string]: FeatureFlag;
}

/**
 * Feature flag categories for organization
 */
export enum FeatureFlagCategory {
  NAVIGATION = 'navigation',
  COMPONENTS = 'components',
  IDEA_PLAYGROUND = 'ideaPlayground',
  INTEGRATION = 'integration',
  SYSTEM = 'system',
  EXPERIMENTAL = 'experimental'
}

/**
 * Feature flag definition with metadata
 */
export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  category: FeatureFlagCategory;
  defaultValue: FeatureFlag;
}

/**
 * Definition of a feature flag group for UI organization
 */
export interface FeatureFlagGroup {
  name: string;
  description: string;
  category: FeatureFlagCategory;
  features: FeatureFlagDefinition[];
}

/**
 * Feature flag override configuration for users or companies
 */
export interface FeatureFlagOverride {
  id: string; // User ID or Company ID
  type: 'user' | 'company';
  flags: Partial<FeatureFlags>; // Only need to specify overridden flags
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for the feature flags service
 */
export interface IFeatureFlagsService {
  // Core methods
  loadFeatureFlags(): Promise<FeatureFlags>;
  saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<void>;
  getFeatureFlags(): FeatureFlags;
  getFeatureFlag(key: string): FeatureFlag | undefined;
  setFeatureFlag(key: string, value: Partial<FeatureFlag>): void;
  resetToDefaults(): Promise<void>;
  
  // Override methods
  loadUserOverrides(userId: string): Promise<void>;
  loadCompanyOverrides(companyId: string): Promise<void>;
  saveUserOverride(userId: string, flags: Partial<FeatureFlags>): Promise<void>;
  saveCompanyOverride(companyId: string, flags: Partial<FeatureFlags>): Promise<void>;
  clearOverrides(): void;
  
  // Utility methods
  isEnabled(key: string): boolean;
  isVisible(key: string): boolean;
  getAllDefinitions(): FeatureFlagDefinition[];
  getGroupedDefinitions(): FeatureFlagGroup[];
}