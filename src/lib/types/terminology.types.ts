/**
 * Core terminology types for the multi-tenant terminology system
 */

// Terminology value types
export type TerminologyValue = string | number | boolean | Record<string, any>;

// Mapping of terminology keys to values
export type TerminologyMap = {
  [key: string]: any;
  terms?: Record<string, any>;
  behaviors?: Record<string, TerminologyOverrideBehavior>;
};

// Resolved terminology map with inheritance applied
export type ResolvedTerminologyMap = {
  [key: string]: any;
};

// Supported entity types for terminology customization
export type TerminologyEntityType = 'system' | 'partner' | 'organization' | 'company' | 'team' | 'user';

// Override behavior for terminology customization
export type TerminologyOverrideBehavior = 'replace' | 'merge' | 'suggest';

// Base terminology entry
export interface TerminologyEntry {
  key: string;
  value: TerminologyValue;
}

// System-wide default terminology entry
export interface DefaultTerminologyEntry extends TerminologyEntry {
  description?: string;
}

// Partner-level terminology entry
export interface PartnerTerminologyEntry extends TerminologyEntry {
  partner_id: string;
  override_behavior: TerminologyOverrideBehavior;
  created_at?: string;
  updated_at?: string;
}

// Organization-level terminology entry
export interface OrganizationTerminologyEntry extends TerminologyEntry {
  organization_id: string;
  override_behavior: TerminologyOverrideBehavior;
  created_at?: string;
  updated_at?: string;
}

// Company-level terminology entry
export interface CompanyTerminologyEntry extends TerminologyEntry {
  company_id: string;
  override_behavior: TerminologyOverrideBehavior;
  created_at?: string;
  updated_at?: string;
}

// Team-level terminology entry
export interface TeamTerminologyEntry extends TerminologyEntry {
  team_id: string;
  override_behavior: TerminologyOverrideBehavior;
  created_at?: string;
  updated_at?: string;
}

// User-level terminology preference entry
export interface UserTerminologyEntry extends TerminologyEntry {
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

// Common journey terminology terms
export interface JourneyTerminology {
  mainUnit: {
    singular: string;
    plural: string;
    verb?: string;
    possessive?: string;
    articleIndefinite?: string;
    articleDefinite?: string;
  };
  phaseUnit?: {
    singular: string;
    plural: string;
    possessive?: string;
    articleIndefinite?: string;
    articleDefinite?: string;
  };
  stepUnit: {
    singular: string;
    plural: string;
    verb?: string;
    possessive?: string;
    articleIndefinite?: string;
    articleDefinite?: string;
  };
  progressTerms?: {
    notStarted: string;
    inProgress: string;
    completed: string;
    skipped?: string;
    notNeeded?: string;
  };
}

// Common tool terminology terms
export interface ToolTerminology {
  mainUnit: {
    singular: string;
    plural: string;
    verb?: string;
    possessive?: string;
    articleIndefinite?: string;
    articleDefinite?: string;
  };
  evaluationTerms?: {
    singular: string;
    plural: string;
    verb?: string;
    possessive?: string;
    articleIndefinite?: string; 
    articleDefinite?: string;
  };
}

// System-wide terminology terms
export interface SystemTerminology {
  application?: {
    name: string;
    shortName?: string;
    tagline?: string;
  };
  actions?: {
    [key: string]: string;
  };
}

// Complete terminology structure
export interface CompleteTerminology {
  journeyTerms?: JourneyTerminology;
  toolTerms?: ToolTerminology;
  systemTerms?: SystemTerminology;
  [key: string]: any;
}

// Parameters for terminology resolution requests
export interface TerminologyResolutionParams {
  entityType: TerminologyEntityType;
  entityId: string;
  keys?: string[];
}

// Internal terminology settings for A/B testing
export interface TerminologySettings {
  enabled: boolean;
  abTestId?: string;
  variant?: string;
}
