/**
 * Enhanced Idea Hub Types
 */

import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';

/**
 * Idea type classification
 */
export type IdeaType = 'new_company' | 'new_feature' | 'new_product' | 'improvement';

/**
 * Ownership type for ideas
 */
export type OwnershipType = 'personal' | 'company';

/**
 * Integration status for ideas
 */
export type IntegrationStatus = 'draft' | 'ready_for_company' | 'pending_approval' | 'approved' | 'implemented';

/**
 * Company context information
 */
export interface CompanyContext {
  industry?: string;
  stage?: string;
  size?: string;
  existingProducts?: string[];
  targetMarket?: string;
  companyVision?: string;
}

/**
 * Integration information
 */
export interface IdeaIntegration {
  status: IntegrationStatus;
  approvedBy?: string;
  approvalDate?: string;
  targetFeatureId?: string;
}

/**
 * Extended idea playground idea with company context and integration status
 */
export interface EnhancedIdeaPlaygroundIdea {
  id: string;
  title: string;
  description: string;
  
  // Optional fields from base IdeaPlaygroundIdea that we may not always have
  problem_statement?: string;
  solution_concept?: string;
  target_audience?: string[];
  unique_value?: string;
  business_model?: string;
  canvas_data?: Record<string, any>;
  canvas_type?: string;
  created_at: string;
  updated_at: string;
  parent_idea_id?: string;
  refinement_feedback?: string;
  protection_level?: string;
  status?: string;
  is_saved?: boolean;
  
  // Ownership and creator information
  creatorId?: string;
  ownershipType: OwnershipType;
  
  // Company classification
  ideaType: IdeaType;
  
  // Company context (optional for new company ideas)
  companyId?: string;
  companyName?: string;
  companyContext?: CompanyContext;
  
  // Integration status
  integration: IdeaIntegration;
}

/**
 * View types for the idea hub
 */
export type IdeaHubViewType = 
  'card_grid' | 
  'kanban' | 
  'list' | 
  'timeline' | 
  'network' |
  'focus' |
  'folder';

/**
 * User preferences for the idea hub
 */
export interface IdeaHubUserPreferences {
  defaultView: IdeaHubViewType;
  viewSettings: Record<IdeaHubViewType, any>;
  filterPresets: FilterPreset[];
}

/**
 * Filter preset for saving common filter combinations
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: IdeaFilters;
}

/**
 * Filters for ideas
 */
export interface IdeaFilters {
  ideaType?: IdeaType[];
  status?: string[];
  companyId?: string;
  integrationStatus?: IntegrationStatus[];
  query?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isSaved?: boolean;
  ownershipType?: OwnershipType;
}

/**
 * Company feature
 */
export interface CompanyFeature {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  sourceIdeaId?: string;
  status: 'proposed' | 'approved' | 'in_development' | 'released';
  featureData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
