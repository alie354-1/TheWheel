# Business Operations Hub: Sprint 1 - Week 2

## Week 2: Domain Framework & Adapter Services

### Day 1-2: Domain Model Implementation

**Tasks:**

1. **Complete domain types and models**
   - Add comprehensive domain interface definitions:
   ```typescript
   // src/business-ops-hub/types/domain.types.ts
   
   export interface DomainWorkspace {
     id: string;
     name: string;
     domainId: string;
     companyId: string;
     userId: string;
     configuration: Record<string, any>;
     isShared: boolean;
     createdAt: Date;
     updatedAt: Date;
   }
   
   export interface DomainEvent {
     id: string;
     domainId: string;
     companyId: string;
     userId: string;
     eventType: string;
     context: Record<string, any>;
     data: Record<string, any>;
     createdAt: Date;
   }
   
   export type DomainSummary = {
     id: string;
     name: string;
     description: string;
     icon: string;
     color: string;
     stats: DomainStatsData;
     activeWorkspaces: number;
     recentEvents: DomainEvent[];
   };
   
   export interface DomainFilter {
     search?: string;
     sortBy?: 'name' | 'orderIndex' | 'completion' | 'activity';
     sortDirection?: 'asc' | 'desc';
     includeStats?: boolean;
     includeWorkspaces?: boolean;
     includeEvents?: boolean;
   }
   ```

2. **Implement domain context and hooks**
   - Create context hook for unified domain state management:
   ```typescript
   // src/business-ops-hub/hooks/useDomainContext.ts
   
   import { useContext, useEffect, useState } from 'react';
   import { DomainContext } from '../contexts/DomainContext';
   import { BusinessDomain, DomainStatsData } from '../types/domain.types';
   import { DomainService } from '../services/domain.service';
   
   export function useDomainContext() {
     const context = useContext(DomainContext);
     
     if (!context) {
       throw new Error('useDomainContext must be used within a DomainProvider');
     }
     
     return context;
   }
   
   export function useDomainStats(domainId: string) {
     const [stats, setStats] = useState<DomainStatsData | null>(null);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     
     useEffect(() => {
       const fetchStats = async () => {
         try {
           setLoading(true);
           
           // This would be an actual API call in the real implementation
           // Mocking for now
           const mockStats: DomainStatsData = {
             totalSteps: Math.floor(Math.random() * 30) + 10,
             completedSteps: Math.floor(Math.random() * 10),
             inProgressSteps: Math.floor(Math.random() * 5),
             upcomingSteps: Math.floor(Math.random() * 15),
             completionPercentage: Math.floor(Math.random() * 100)
           };
           
           // Simulate API delay
           await new Promise(resolve => setTimeout(resolve, 300));
           
           setStats(mockStats);
           setError(null);
         } catch (err) {
           setError(err instanceof Error ? err.message : 'Unknown error fetching stats');
         } finally {
           setLoading(false);
         }
       };
       
       if (domainId) {
         fetchStats();
       }
     }, [domainId]);
     
     return { stats, loading, error };
   }
   
   export function useDomainDetail(domainId: string | null) {
     const [domain, setDomain] = useState<BusinessDomain | null>(null);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const domainService = new DomainService();
     
     useEffect(() => {
       const fetchDomain = async () => {
         if (!domainId) {
           setDomain(null);
           setLoading(false);
           return;
         }
         
         try {
           setLoading(true);
           const data = await domainService.getDomainById(domainId);
           setDomain(data);
           setError(null);
         } catch (err) {
           setError(err instanceof Error ? err.message : 'Unknown error fetching domain');
           setDomain(null);
         } finally {
           setLoading(false);
         }
       };
       
       fetchDomain();
     }, [domainId]);
     
     return { domain, loading, error };
   }
   ```

3. **Domain utility functions**
   - Create color and icon utilities to ensure consistency:
   ```typescript
   // src/business-ops-hub/utils/domain-utils.ts
   
   type DomainColorPalette = {
     primary: string;
     secondary: string;
     background: string;
     text: string;
     accent: string;
   };
   
   export const generateDomainColorPalette = (baseColor: string): DomainColorPalette => {
     // In a real implementation, this would use color theory to generate
     // a harmonious palette based on the base color.
     // For demo purposes, just returning placeholder values
     return {
       primary: baseColor,
       secondary: adjustColor(baseColor, -20), // slightly darker
       background: adjustColor(baseColor, 80, true), // much lighter
       text: adjustColor(baseColor, -60), // much darker
       accent: getComplementaryColor(baseColor)
     };
   };
   
   // Helper function to adjust color lightness
   const adjustColor = (hexColor: string, amount: number, lighten = false): string => {
     // This would be implemented with a proper color manipulation library
     // For now, returning a placeholder
     return hexColor;
   };
   
   // Helper function to get complementary color
   const getComplementaryColor = (hexColor: string): string => {
     // This would calculate a proper complementary color
     // For now, returning a placeholder
     return hexColor;
   };
   
   // Predefined domain icon mappings
   export const domainIconMap: Record<string, string> = {
     finance: 'dollar-sign',
     marketing: 'chart-bar',
     operations: 'cog',
     sales: 'shopping-cart',
     hr: 'users',
     technology: 'microchip',
     legal: 'gavel',
     product: 'cube',
     default: 'folder'
   };
   
   // Get appropriate icon for domain
   export const getDomainIcon = (domainName: string): string => {
     const normalized = domainName.toLowerCase();
     
     for (const [key, value] of Object.entries(domainIconMap)) {
       if (normalized.includes(key)) {
         return value;
       }
     }
     
     return domainIconMap.default;
   };
   
   // Validate domain name
   export const validateDomainName = (name: string): boolean => {
     return name.length >= 3 && name.length <= 50;
   };
   ```

### Day 3-5: Journey-to-Domain Mapping Implementation

**Tasks:**

1. **Domain mapping service**
   - Implement advanced mapping functionality:
   ```typescript
   // src/business-ops-hub/services/domain-mapping-advanced.service.ts
   
   import { supabase } from '../../lib/supabase';
   import { DomainJourneyMapping } from '../types/domain.types';
   
   export class DomainMappingAdvancedService {
     /**
      * Batch create mappings for a domain
      */
     async batchCreateMappings(domainId: string, journeyIds: string[], baseScore = 0.7) {
       const mappings = journeyIds.map(journeyId => ({
         domain_id: domainId,
         journey_id: journeyId,
         relevance_score: baseScore,
         primary_domain: false
       }));
       
       const { data, error } = await supabase
         .from('domain_journey_mapping')
         .insert(mappings)
         .select();
         
       if (error) throw new Error(`Failed to batch create mappings: ${error.message}`);
       return data;
     }
     
     /**
      * Get recommendations for unmapped journey items
      * based on content similarity to items already in a domain
      */
     async getRecommendedMappings(domainId: string, limit = 10) {
       // In a real implementation, this would use content similarity
       // between journey items to find related content
       
       // For demo purposes, we'll return a mock response
       return [
         { journeyId: 'j1', title: 'Create marketing plan', score: 0.89 },
         { journeyId: 'j2', title: 'Design brand guidelines', score: 0.82 },
         { journeyId: 'j3', title: 'Set up social media accounts', score: 0.77 }
       ];
     }
     
     /**
      * Copy mappings from one domain to another
      */
     async copyMappings(sourceDomainId: string, targetDomainId: string) {
       // Get all mappings for source domain
       const { data: sourceMappings, error: sourceError } = await supabase
         .from('domain_journey_mapping')
         .select('journey_id, relevance_score, primary_domain')
         .eq('domain_id', sourceDomainId);
         
       if (sourceError) throw new Error(`Failed to fetch source mappings: ${sourceError.message}`);
       
       // Create new mappings for target domain
       const targetMappings = sourceMappings.map(mapping => ({
         domain_id: targetDomainId,
         journey_id: mapping.journey_id,
         relevance_score: mapping.relevance_score,
         primary_domain: mapping.primary_domain
       }));
       
       const { data, error } = await supabase
         .from('domain_journey_mapping')
         .insert(targetMappings)
         .select();
         
       if (error) throw new Error(`Failed to copy mappings: ${error.message}`);
       return data;
     }
     
     /**
      * Analyze text content for domain relevance
      * This is a more sophisticated version of generateMappingSuggestions
      */
     async analyzeDomainRelevance(text: string) {
       // In a real implementation, this would use NLP techniques
       // to analyze the text and match to appropriate domains
       
       // For demo purposes, we'll return a mock response
       return [
         { domainId: 'marketing', score: 0.85 },
         { domainId: 'sales', score: 0.65 },
         { domainId: 'product', score: 0.45 }
       ];
     }
   }
   ```

2. **Domain content analysis utilities**
   - Create text analysis for automated categorization:
   ```typescript
   // src/business-ops-hub/utils/content-analysis.ts
   
   export interface KeywordMatch {
     keyword: string;
     count: number;
     positions: number[];
   }
   
   export interface ContentAnalysisResult {
     keywords: KeywordMatch[];
     domainScores: Record<string, number>;
     topDomain: string;
     confidence: number;
   }
   
   // Domain-specific keywords for classification
   const domainKeywords: Record<string, string[]> = {
     finance: ['budget', 'financial', 'revenue', 'cost', 'profit', 'expense', 'funding', 'investment'],
     marketing: ['brand', 'campaign', 'advertising', 'social media', 'content', 'audience', 'marketing'],
     operations: ['process', 'workflow', 'efficiency', 'optimization', 'logistics', 'supply chain'],
     sales: ['customer', 'prospect', 'deal', 'pipeline', 'conversion', 'lead', 'proposal'],
     hr: ['employee', 'recruitment', 'hiring', 'interview', 'training', 'personnel', 'talent'],
     technology: ['software', 'hardware', 'development', 'infrastructure', 'technology', 'system'],
     product: ['product', 'feature', 'roadmap', 'release', 'design', 'iteration', 'prototype']
   };
   
   /**
    * Analyze text content to determine domain relevance
    * @param text The text content to analyze
    * @returns ContentAnalysisResult with domain scores and keyword matches
    */
   export function analyzeContent(text: string): ContentAnalysisResult {
     const lowerText = text.toLowerCase();
     const matches: Record<string, KeywordMatch[]> = {};
     const domainScores: Record<string, number> = {};
     
     // Initialize scores
     Object.keys(domainKeywords).forEach(domain => {
       domainScores[domain] = 0;
       matches[domain] = [];
     });
     
     // Count keyword occurrences for each domain
     Object.entries(domainKeywords).forEach(([domain, keywords]) => {
       keywords.forEach(keyword => {
         const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
         let match;
         const positions: number[] = [];
         
         while ((match = regex.exec(text)) !== null) {
           positions.push(match.index);
         }
         
         if (positions.length > 0) {
           matches[domain].push({
             keyword,
             count: positions.length,
             positions
           });
           
           // Add to domain score - more matches = higher score
           domainScores[domain] += positions.length;
         }
       });
     });
     
     // Find top domain
     let topDomain = '';
     let maxScore = 0;
     Object.entries(domainScores).forEach(([domain, score]) => {
       if (score > maxScore) {
         maxScore = score;
         topDomain = domain;
       }
     });
     
     // Calculate confidence (0-1)
     const totalScore = Object.values(domainScores).reduce((sum, score) => sum + score, 0);
     const confidence = totalScore > 0 ? maxScore / totalScore : 0;
     
     // Flatten keywords across all domains
     const allKeywords = Object.values(matches).flat();
     
     return {
       keywords: allKeywords,
       domainScores,
       topDomain,
       confidence
     };
   }
   
   /**
    * Suggest domains based on text content
    * @param text The text content to analyze
    * @returns Array of domain IDs with relevance scores
    */
   export function suggestDomains(text: string): Array<{ domainId: string; score: number }> {
     const { domainScores, topDomain, confidence } = analyzeContent(text);
     
     // Normalize scores to 0-1 range
     const totalScore = Object.values(domainScores).reduce((sum, score) => sum + score, 0);
     
     if (totalScore === 0) {
       return [];
     }
     
     const normalizedScores = Object.entries(domainScores)
       .filter(([_, score]) => score > 0)
       .map(([domain, score]) => ({
         domainId: domain,
         score: score / totalScore
       }))
       .sort((a, b) => b.score - a.score);
     
     return normalizedScores;
   }
   ```

3. **Adapter layer implementation**
   - Create adapter for transforming journey data to domain view:
   ```typescript
   // src/business-ops-hub/adapters/journey-domain-adapter.ts
   
   import { DomainJourneyMapping } from '../types/domain.types';
   
   interface JourneyStep {
     id: string;
     title: string;
     description: string;
     status: string;
     phase_id: string;
     difficulty: string;
     estimated_time: number;
     tools?: { id: string; name: string }[];
   }
   
   interface DomainViewJourneyStep {
     id: string;
     title: string;
     description: string;
     status: string;
     phaseId: string;
     difficulty: string;
     estimatedTime: number;
     relevanceScore: number;
     primaryDomain: boolean;
     domainId: string;
     tools?: { id: string; name: string }[];
   }
   
   export class JourneyDomainAdapter {
     /**
      * Transform journey steps data to domain-centric view
      */
     transformStepsForDomain(
       steps: JourneyStep[],
       mappings: DomainJourneyMapping[]
     ): DomainViewJourneyStep[] {
       const mappingsByJourneyId = new Map<
         string,
         { relevanceScore: number; primaryDomain: boolean; domainId: string }
       >();
       
       // Create lookup map for quick access
       mappings.forEach(mapping => {
         mappingsByJourneyId.set(mapping.journeyId, {
           relevanceScore: mapping.relevanceScore,
           primaryDomain: mapping.primaryDomain,
           domainId: mapping.domainId
         });
       });
       
       // Transform steps with domain mapping data
       return steps.map(step => {
         const mapping = mappingsByJourneyId.get(step.id) || {
           relevanceScore: 0,
           primaryDomain: false,
           domainId: ''
         };
         
         return {
           id: step.id,
           title: step.title,
           description: step.description,
           status: step.status,
           phaseId: step.phase_id,
           difficulty: step.difficulty,
           estimatedTime: step.estimated_time,
           relevanceScore: mapping.relevanceScore,
           primaryDomain: mapping.primaryDomain,
           domainId: mapping.domainId,
           tools: step.tools
         };
       });
     }
     
     /**
      * Group journey steps by domain with priority ordering
      */
     groupStepsByDomain(
       steps: JourneyStep[],
       mappings: DomainJourneyMapping[]
     ): Record<string, DomainViewJourneyStep[]> {
       const transformedSteps = this.transformStepsForDomain(steps, mappings);
       const result: Record<string, DomainViewJourneyStep[]> = {};
       
       // Group by domain ID
       transformedSteps.forEach(step => {
         if (!step.domainId) return; // Skip unmapped steps
         
         if (!result[step.domainId]) {
           result[step.domainId] = [];
         }
         
         result[step.domainId].push(step);
       });
       
       // Sort each domain's steps by relevance score
       Object.keys(result).forEach(domainId => {
         result[domainId].sort((a, b) => {
           // Primary domain steps come first
           if (a.primaryDomain && !b.primaryDomain) return -1;
           if (!a.primaryDomain && b.primaryDomain) return 1;
           
           // Then sort by relevance score
           return b.relevanceScore - a.relevanceScore;
         });
       });
       
       return result;
     }
     
     /**
      * Find "orphaned" steps that aren't mapped to any domain
      */
     findUnmappedSteps(
       steps: JourneyStep[],
       mappings: DomainJourneyMapping[]
     ): JourneyStep[] {
       const mappedStepIds = new Set(mappings.map(m => m.journeyId));
       return steps.filter(step => !mappedStepIds.has(step.id));
     }
   }
   ```

4. **Domain workspace service**
   - Create service for managing workspace CRUD operations:
   ```typescript
   // src/business-ops-hub/services/domain-workspace.service.ts
   
   import { supabase } from '../../lib/supabase';
   import { DomainWorkspace } from '../types/domain.types';
   
   export class DomainWorkspaceService {
     /**
      * Get all workspaces for a domain
      */
     async getWorkspacesForDomain(domainId: string, userId?: string): Promise<DomainWorkspace[]> {
       let query = supabase
         .from('workspace_configurations')
         .select('*')
         .eq('domain_id', domainId);
       
       // If userId provided, filter by personal or shared workspaces
       if (userId) {
         query = query.or(`user_id.eq.${userId},is_shared.eq.true`);
       }
       
       const { data, error } = await query;
         
       if (error) throw new Error(`Failed to fetch workspaces: ${error.message}`);
       
       // Transform from snake_case to camelCase
       return data.map(item => ({
         id: item.id,
         name: item.name,
         domainId: item.domain_id,
         companyId: item.company_id,
         userId: item.user_id,
         configuration: item.configuration,
         isShared: item.is_shared,
         createdAt: new Date(item.created_at),
         updatedAt: new Date(item.updated_at)
       }));
     }
     
     /**
      * Get workspace by ID
      */
     async getWorkspaceById(id: string): Promise<DomainWorkspace> {
       const { data, error } = await supabase
         .from('workspace_configurations')
         .select('*')
         .eq('id', id)
         .single();
         
       if (error) throw new Error(`Failed to fetch workspace: ${error.message}`);
       
       return {
         id: data.id,
         name: data.name,
         domainId: data.domain_id,
         companyId: data.company_id,
         userId: data.user_id,
         configuration: data.configuration,
         isShared: data.is_shared,
         createdAt: new Date(data.created_at),
         updatedAt: new Date(data.updated_at)
       };
     }
     
     /**
      * Create new workspace
      */
     async createWorkspace(workspace: Omit<DomainWorkspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<DomainWorkspace> {
       const { data, error } = await supabase
         .from('workspace_configurations')
         .insert([{
           name: workspace.name,
           domain_id: workspace.domainId,
           company_id: workspace.companyId,
           user_id: workspace.userId,
           configuration: workspace.configuration,
           is_shared: workspace.isShared
         }])
         .select();
         
       if (error) throw new Error(`Failed to create workspace: ${error.message}`);
       
       const item = data[0];
       return {
         id: item.id,
         name: item.name,
         domainId: item.domain_id,
         companyId: item.company_id,
         userId: item.user_id,
         configuration: item.configuration,
         isShared: item.is_shared,
         createdAt: new Date(item.created_at),
         updatedAt: new Date(item.updated_at)
       };
     }
     
     /**
      * Update existing workspace
      */
     async updateWorkspace(id: string, updates: Partial<DomainWorkspace>): Promise<DomainWorkspace> {
       // Convert camelCase to snake_case for DB
       const dbUpdates: Record<string, any> = {};
       
       if (updates.name !== undefined) dbUpdates.name = updates.name;
       if (updates.configuration !== undefined) dbUpdates.configuration = updates.configuration;
       if (updates.isShared !== undefined) dbUpdates.is_shared = updates.isShared;
       
       const { data, error } = await supabase
         .from('workspace_configurations')
         .update(dbUpdates)
         .eq('id', id)
         .select();
         
       if (error) throw new Error(`Failed to update workspace: ${error.message}`);
       
       const item = data[0];
       return {
         id: item.id,
         name: item.name,
         domainId: item.domain_id,
         companyId: item.company_id,
         userId: item.user_id,
         configuration: item.configuration,
         isShared: item.is_shared,
         createdAt: new Date(item.created_at),
         updatedAt: new Date(item.updated_at)
       };
     }
     
     /**
      * Delete workspace
      */
     async deleteWorkspace(id: string): Promise<void> {
       const { error } = await supabase
         .from('workspace_configurations')
         .delete()
         .eq('id', id);
         
       if (error) throw new Error(`Failed to delete workspace: ${error.message}`);
     }
     
     /**
      * Duplicate workspace
      */
     async duplicateWorkspace(id: string, newName: string): Promise<DomainWorkspace> {
       // Get original workspace
       const original = await this.getWorkspaceById(id);
       
       // Create new workspace with same config but different name
       return this.createWorkspace({
         name: newName,
         domainId: original.domainId,
         companyId: original.companyId,
         userId: original.userId,
         configuration: original.configuration,
         isShared: false // Default to private for duplicated workspaces
       });
     }
   }
