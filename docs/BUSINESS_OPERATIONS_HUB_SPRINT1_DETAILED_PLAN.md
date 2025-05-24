# Business Operations Hub: Sprint 1 Detailed Implementation Plan

## Sprint Overview

**Sprint 1: Foundation & Architecture (4 weeks)**

This sprint focuses on establishing the foundation for the Business Operations Hub with fully independent components that are separate from the existing journey system. We'll create a new directory structure, build the database schema, implement core services, and develop the initial UI components - all without dependencies on the old components.

## Key Objectives

1. Create a fully independent component architecture
2. Establish the database schema for business domain taxonomy
3. Implement data mapping between domains and existing journey content
4. Develop UI component library foundation
5. Build the initial admin tools for domain management
6. Implement event system infrastructure 
7. Leverage existing data through foreign key relationships

## Independence Strategy

All components will be fully independent from the existing journey system:

1. **Full Copy & Modify Approach**: Rather than just wrapping or extending existing components, we'll copy and modify them to create standalone versions for the Business Operations Hub.

2. **Source Tracking**: Each component that is derived from an existing one will include header comments documenting its origin for future reference.

3. **Isolated Directory Structure**: All code will reside in a dedicated `src/business-ops-hub` directory with its own organization.

4. **No Shared Dependencies**: Components will not import from journey components, ensuring true independence.

5. **Separate Data Access Layer**: While utilizing the same database, we'll create dedicated services to access data through the domain lens.

## Directory Structure

```
src/
├── business-ops-hub/                  # Root directory for all Business Ops Hub code
│   ├── components/                    # UI components
│   │   ├── domain-dashboard/          # Domain dashboard components
│   │   ├── task-management/           # Task management components 
│   │   ├── workspace/                 # Workspace components
│   │   ├── tool-integration/          # Tool integration components
│   │   └── common/                    # Common UI components
│   ├── services/                      # Business logic services
│   │   ├── domain.service.ts          # Domain management service
│   │   ├── domain-mapping.service.ts  # Domain-to-journey mapping service 
│   │   ├── context-detection.service.ts # Context detection service
│   │   └── event.service.ts           # Event tracking service
│   ├── adapters/                      # Data transformation adapters
│   ├── hooks/                         # React hooks
│   ├── types/                         # TypeScript type definitions
│   ├── utils/                         # Utility functions
│   ├── pages/                         # Page components
│   └── README.md                      # Documentation explaining the separation
```

## Detailed Week-by-Week Plan

### Week 1: Database Schema & Project Setup

#### Day 1-2: Project Structure & Setup

**Tasks:**

1. **Set up directory structure**
   - Create base directory at `src/business-ops-hub`
   - Create subdirectories for components, services, adapters, hooks, types, utils, and pages
   - Set up README.md explaining the separation philosophy
   - Configure build and lint tools for the new structure

2. **Configure build tools**
   - Update TypeScript paths in tsconfig.json to support the new structure
   - Set up Storybook instance for BOH components
   - Configure test infrastructure for the new components

3. **Establish component tracking system**
   - Define file header format for tracking component sources
   - Create registry file to document component relationships
   - Set up linting rules to enforce proper attribution

#### Day 3-5: Database Schema Design & Implementation

**Tasks:**

1. **Business domain taxonomy table**
   - Create migration file for `business_domains` table with fields:
     - id (UUID, primary key)
     - name (TEXT, not null)
     - description (TEXT)
     - icon (TEXT)
     - color (TEXT)
     - order_index (INTEGER)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)
   - Create indexes for efficient queries
   - Define RLS policies for security

2. **Domain-journey mapping table**
   - Create migration file for `domain_journey_mapping` table with fields:
     - id (UUID, primary key)
     - domain_id (UUID, foreign key to business_domains)
     - journey_id (UUID, foreign key to journey_steps)
     - relevance_score (FLOAT)
     - primary_domain (BOOLEAN)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)
   - Create composite index on (domain_id, journey_id)
   - Define RLS policies for security

3. **Decision events tracking table**
   - Create migration file for `decision_events` table with fields:
     - id (UUID, primary key)
     - company_id (UUID, foreign key to companies)
     - user_id (UUID, foreign key to auth.users)
     - event_type (TEXT)
     - context (JSONB)
     - data (JSONB)
     - created_at (TIMESTAMP)
   - Create indexes on company_id, user_id, and event_type
   - Define RLS policies for security

4. **Workspace configurations table**
   - Create migration file for `workspace_configurations` table with fields:
     - id (UUID, primary key)
     - company_id (UUID, foreign key to companies)
     - user_id (UUID, foreign key to auth.users)
     - domain_id (UUID, foreign key to business_domains)
     - name (TEXT)
     - configuration (JSONB)
     - is_shared (BOOLEAN)
     - created_at (TIMESTAMP)
     - updated_at (TIMESTAMP)
   - Create indexes on company_id, user_id, domain_id
   - Define RLS policies for security

5. **Seed data preparation**
   - Define initial business domains based on content analysis
   - Create seed script for default domains
   - Design configuration templates for common workspaces

#### Existing Data Analysis & Integration Planning

**Tasks:**

1. **Journey content analysis**
   - Analyze existing journey steps and challenges for domain patterns
   - Build a dataset mapping journey content to potential domains
   - Identify patterns in journey content for automating domain mapping

2. **Tool data analysis**
   - Analyze existing tool categories and data structure
   - Map tool categories to preliminary domain areas
   - Design domain-based view of tool catalog

3. **Data integration design**
   - Design queries to access journey data through domain lens
   - Create normalization functions for consistent data presentation
   - Develop caching strategy for domain-filtered data

### Week 2: Domain Framework & Adapter Services

#### Day 1-2: Domain Model Implementation

**Tasks:**

1. **Domain types and models**
   - Create TypeScript interfaces for domain-related types:
   ```typescript
   // src/business-ops-hub/types/domain.types.ts
   
   export interface BusinessDomain {
     id: string;
     name: string;
     description: string;
     icon: string;
     color: string;
     orderIndex: number;
     createdAt: Date;
     updatedAt: Date;
   }
   
   export interface DomainJourneyMapping {
     id: string;
     domainId: string;
     journeyId: string;
     relevanceScore: number;
     primaryDomain: boolean;
   }
   
   export interface DomainStatsData {
     totalSteps: number;
     completedSteps: number;
     inProgressSteps: number;
     upcomingSteps: number;
     completionPercentage: number;
   }
   ```

2. **Domain service implementation**
   - Create service for domain CRUD operations:
   ```typescript
   // src/business-ops-hub/services/domain.service.ts
   
   import { supabase } from '../../lib/supabase';
   import { BusinessDomain } from '../types/domain.types';
   
   export class DomainService {
     /**
      * Get all business domains
      */
     async getAllDomains(): Promise<BusinessDomain[]> {
       const { data, error } = await supabase
         .from('business_domains')
         .select('*')
         .order('order_index');
         
       if (error) throw new Error(`Failed to fetch domains: ${error.message}`);
       return data as BusinessDomain[];
     }
     
     /**
      * Get domain by ID
      */
     async getDomainById(id: string): Promise<BusinessDomain> {
       const { data, error } = await supabase
         .from('business_domains')
         .select('*')
         .eq('id', id)
         .single();
         
       if (error) throw new Error(`Failed to fetch domain: ${error.message}`);
       return data as BusinessDomain;
     }
     
     /**
      * Create new domain
      */
     async createDomain(domain: Omit<BusinessDomain, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessDomain> {
       const { data, error } = await supabase
         .from('business_domains')
         .insert([domain])
         .select();
         
       if (error) throw new Error(`Failed to create domain: ${error.message}`);
       return data[0] as BusinessDomain;
     }
     
     /**
      * Update existing domain
      */
     async updateDomain(id: string, updates: Partial<BusinessDomain>): Promise<BusinessDomain> {
       const { data, error } = await supabase
         .from('business_domains')
         .update(updates)
         .eq('id', id)
         .select();
         
       if (error) throw new Error(`Failed to update domain: ${error.message}`);
       return data[0] as BusinessDomain;
     }
     
     /**
      * Delete domain
      */
     async deleteDomain(id: string): Promise<void> {
       const { error } = await supabase
         .from('business_domains')
         .delete()
         .eq('id', id);
         
       if (error) throw new Error(`Failed to delete domain: ${error.message}`);
     }
     
     /**
      * Reorder domains
      */
     async reorderDomains(orderedIds: string[]): Promise<void> {
       // Start transaction
       const updates = orderedIds.map((id, index) => {
         return supabase
           .from('business_domains')
           .update({ order_index: index })
           .eq('id', id);
       });
       
       // Execute all updates
       await Promise.all(updates);
     }
   }
   ```

3. **Domain utility functions**
   - Create color generation utility for domains
   - Build icon mapping system for domains
   - Implement domain name validation

#### Day 3-5: Journey-to-Domain Mapping Implementation

**Tasks:**

1. **Mapping service implementation**
   - Create service for managing domain-journey mappings:
   ```typescript
   // src/business-ops-hub/services/domain-mapping.service.ts
   
   import { supabase } from '../../lib/supabase';
   import { DomainJourneyMapping } from '../types/domain.types';
   
   export class DomainMappingService {
     /**
      * Get journey items for a domain
      */
     async getJourneyItemsForDomain(domainId: string) {
       const { data, error } = await supabase
         .from('domain_journey_mapping')
         .select(`
           id,
           relevance_score,
           primary_domain,
           journey:journey_id(*)
         `)
         .eq('domain_id', domainId)
         .order('relevance_score', { ascending: false });
         
       if (error) throw new Error(`Failed to fetch domain journey items: ${error.message}`);
       return data;
     }
     
     /**
      * Get domains for a journey item
      */
     async getDomainsForJourneyItem(journeyId: string) {
       const { data, error } = await supabase
         .from('domain_journey_mapping')
         .select(`
           id,
           relevance_score,
           primary_domain,
           domain:domain_id(*)
         `)
         .eq('journey_id', journeyId)
         .order('relevance_score', { ascending: false });
         
       if (error) throw new Error(`Failed to fetch journey item domains: ${error.message}`);
       return data;
     }
     
     /**
      * Create mapping
      */
     async createMapping(mapping: Omit<DomainJourneyMapping, 'id'>) {
       const { data, error } = await supabase
         .from('domain_journey_mapping')
         .insert([mapping])
         .select();
         
       if (error) throw new Error(`Failed to create mapping: ${error.message}`);
       return data[0];
     }
     
     /**
      * Update mapping
      */
     async updateMapping(id: string, updates: Partial<DomainJourneyMapping>) {
       const { data, error } = await supabase
         .from('domain_journey_mapping')
         .update(updates)
         .eq('id', id)
         .select();
         
       if (error) throw new Error(`Failed to update mapping: ${error.message}`);
       return data[0];
     }
     
     /**
      * Delete mapping
      */
     async deleteMapping(id: string) {
       const { error } = await supabase
         .from('domain_journey_mapping')
         .delete()
         .eq('id', id);
         
       if (error) throw new Error(`Failed to delete mapping: ${error.message}`);
     }
     
     /**
      * Set primary domain for journey item
      * This will ensure only one domain is primary
      */
     async setPrimaryDomain(journeyId: string, domainId: string) {
       // Start by clearing any existing primary domains
       await supabase
         .from('domain_journey_mapping')
         .update({ primary_domain: false })
         .eq('journey_id', journeyId);
         
       // Then set the new primary domain
       const { error } = await supabase
         .from('domain_journey_mapping')
         .update({ primary_domain: true })
         .eq('journey_id', journeyId)
         .eq('domain_id', domainId);
         
       if (error) throw new Error(`Failed to set primary domain: ${error.message}`);
     }
     
     /**
      * Generate mapping suggestions based on content analysis
      */
     async generateMappingSuggestions(journeyId: string) {
       // This would call a more complex content analysis function
       // For now, we'll return a placeholder
       return [
         { domainId: 'domain1', score: 0.9 },
         { domainId: 'domain2', score: 0.7 },
         { domainId: 'domain3', score: 0.5 }
       ];
     }
   }
   ```

2. **Adapter layer implementation**
   - Create adapter for transforming journey data to domain view
   - Implement data normalization functions
   - Build relevance scoring algorithm

3. **Domain content analysis tools**
   - Implement text analysis for content categorization
   - Create similarity detection for mapping suggestions
   - Build validation rules for mapping quality

4. **API contract definition**
   - Define OpenAPI specs for domain management APIs
   - Document mapping service endpoints
   - Create API response formats for domain data

### Week 3: UI Component Library & Admin Tools

#### Day 1-2: UI Component Library Foundation

**Tasks:**

1. **Base components implementation**
   - Copy and adapt Button component:
   ```typescript
   // src/business-ops-hub/components/common/Button.tsx
   
   /**
    * Business Operations Hub
    * 
    * [COPIED FROM]: src/components/common/Button.tsx
    * [MODIFICATIONS]:
    * - Updated styling to match BOH theming
    * - Added domain-specific variants
    * - Removed journey-specific props
    */
   
   import React from 'react';
   import styled from 'styled-components';
   
   export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'domain';
   
   export interface ButtonProps {
     variant?: ButtonVariant;
     size?: 'small' | 'medium' | 'large';
     fullWidth?: boolean;
     disabled?: boolean;
     loading?: boolean;
     domainColor?: string;
     children: React.ReactNode;
     onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
   }
   
   const StyledButton = styled.button<{
     variant: ButtonVariant;
     size: 'small' | 'medium' | 'large';
     fullWidth: boolean;
     domainColor?: string;
   }>`
     display: inline-flex;
     align-items: center;
     justify-content: center;
     border-radius: 0.375rem;
     font-weight: 500;
     transition: all 150ms ease-in-out;
     cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
     opacity: ${(props) => (props.disabled ? 0.6 : 1)};
     width: ${(props) => (props.fullWidth ? '100%' : 'auto')};
     
     /* Size styles */
     ${(props) => {
       switch (props.size) {
         case 'small':
           return `
             font-size: 0.875rem;
             padding: 0.375rem 0.75rem;
           `;
         case 'large':
           return `
             font-size: 1.125rem;
             padding: 0.75rem 1.5rem;
           `;
         default:
           return `
             font-size: 1rem;
             padding: 0.5rem 1rem;
           `;
       }
     }}
     
     /* Variant styles */
     ${(props) => {
       switch (props.variant) {
         case 'secondary':
           return `
             background-color: #f3f4f6;
             color: #1f2937;
             border: 1px solid #e5e7eb;
             &:hover:not(:disabled) {
               background-color: #e5e7eb;
             }
           `;
         case 'outline':
           return `
             background-color: transparent;
             color: #2563eb;
             border: 1px solid #2563eb;
             &:hover:not(:disabled) {
               background-color: rgba(37, 99, 235, 0.05);
             }
           `;
         case 'text':
           return `
             background-color: transparent;
             color: #2563eb;
             border: none;
             padding-left: 0.25rem;
             padding-right: 0.25rem;
             &:hover:not(:disabled) {
               background-color: rgba(37, 99, 235, 0.05);
             }
           `;
         case 'domain':
           return `
             background-color: ${props.domainColor || '#2563eb'};
             color: white;
             border: none;
             &:hover:not(:disabled) {
               filter: brightness(0.9);
             }
           `;
         default:
           return `
             background-color: #2563eb;
             color: white;
             border: none;
             &:hover:not(:disabled) {
               background-color: #1d4ed8;
             }
           `;
       }
     }}
   `;
   
   export const Button: React.FC<ButtonProps> = ({
     variant = 'primary',
     size = 'medium',
     fullWidth = false,
     disabled = false,
     loading = false,
     domainColor,
     children,
     onClick,
     ...props
   }) => {
     return (
       <StyledButton
         variant={variant}
         size={size}
         fullWidth={fullWidth}
         disabled={disabled || loading}
         domainColor={domainColor}
         onClick={onClick}
         {...props}
       >
         {loading ? <span className="loading-spinner" /> : children}
       </StyledButton>
     );
   };
   ```

   - Copy and adapt Card component:
   ```typescript
   // src/business-ops-hub/components/common/Card.tsx
   
   /**
    * Business Operations Hub
    * 
    * [COPIED FROM]: src/components/common/Card.tsx
    * [MODIFICATIONS]:
    * - Updated styling to match BOH theming
    * - Added domain color accents
    * - Added specialized card variants for domain dashboard
    */
   
   import React from 'react';
   import styled from 'styled-components';
   
   export interface CardProps {
     title?: React.ReactNode;
     subtitle?: React.ReactNode;
     icon?: React.ReactNode;
     accentColor?: string;
     className?: string;
     onClick?: () => void;
     interactive?: boolean;
     children: React.ReactNode;
     variant?: 'default' | 'domain' | 'stats' | 'action';
   }
   
   const StyledCard = styled.div<{
     accentColor?: string;
     interactive: boolean;
     variant: string;
   }>`
     background-color: white;
     border-radius: 0.5rem;
     box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
     overflow: hidden;
     transition: all 150ms ease-in-out;
     height: 100%;
     display: flex;
     flex-direction: column;
     
     ${({ interactive }) => interactive && `
       cursor: pointer;
       &:hover {
         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
         transform: translateY(-2px);
       }
     `}
     
     ${({ variant, accentColor }) => {
       switch (variant) {
         case 'domain':
           return `
             border-top: 4px solid ${accentColor || '#2563eb'};
           `;
         case 'stats':
           return `
             background-color: #f9fafb;
           `;
         case 'action':
           return `
             border: 1px dashed #d1d5db;
             justify-content: center;
             align-items: center;
             text-align: center;
           `;
         default:
           return '';
       }
     }}
   `;
   
   const CardHeader = styled.div<{ hasIcon: boolean }>`
     display: flex;
     align-items: ${props => props.hasIcon ? 'center' : 'flex-start'};
     padding: 1rem;
     border-bottom: 1px solid #f3f4f6;
   `;
   
   const IconWrapper = styled.div`
     margin-right: 0.75rem;
     display: flex;
     align-items: center;
     justify-content: center;
   `;
   
   const TitleArea = styled.div`
     flex: 1;
   `;
   
   const Title = styled.h3`
     margin: 0;
     font-size: 1rem;
     font-weight: 600;
     color: #111827;
   `;
   
   const Subtitle = styled.div`
     font-size: 0.875rem;
     color: #6b7280;
     margin-top: 0.25rem;
   `;
   
   const CardBody = styled.div`
     padding: 1rem;
     flex: 1;
   `;
   
   export const Card: React.FC<CardProps> = ({
     title,
     subtitle,
     icon,
     accentColor,
     className,
     onClick,
     interactive = false,
     children,
     variant = 'default',
     ...props
   }) => {
     return (
       <StyledCard 
         className={className}
         accentColor={accentColor}
         interactive={interactive || !!onClick}
         variant={variant}
         onClick={onClick}
         {...props}
       >
         {(title || subtitle || icon) && (
           <CardHeader hasIcon={!!icon}>
             {icon && <IconWrapper>{icon}</IconWrapper>}
             <TitleArea>
               {title && <Title>{title}</Title>}
               {subtitle && <Subtitle>{subtitle}</Subtitle>}
             </TitleArea>
           </CardHeader>
         )}
         <CardBody>{children}</CardBody>
       </StyledCard>
     );
   };
   ```

2. **Domain-specific components**
   - Create DomainCard component:
   ```typescript
   // src/business-ops-hub/components/domain-dashboard/DomainCard.tsx
   
   import React from 'react';
   import styled from 'styled-components';
   import { Card } from '../common/Card';
   import { BusinessDomain, DomainStatsData } from '../../types/domain.types';
   
   export interface DomainCardProps {
     domain: BusinessDomain;
     stats?: DomainStatsData;
     priorityTasks?: Array<{
       id: string;
       title: string;
       status: string;
     }>;
     onViewDetails: (domainId: string) => void;
   }
   
   const ProgressBar = styled.div<{ percentage: number; color: string }>`
     width: 100%;
     height: 4px;
     background-color: #e5e7eb;
     border-radius: 2px;
     margin-top: 0.5rem;
     
     &::after {
       content: '';
       display: block;
       width: ${props => `${props.percentage}%`};
       height: 100%;
       background-color: ${props => props.color};
       border-radius: 2px;
       transition: width 0.3s ease;
     }
   `;
   
   const StatsRow = styled.div`
     display: flex;
     justify-content: space-between;
     margin-top: 1rem;
     font-size: 0.875rem;
   `;
   
   const StatItem = styled.div`
     text-align: center;
   `;
   
   const StatValue = styled.div`
     font-weight: 600;
   `;
   
   const StatLabel = styled.div`
     color: #6b7280;
     font-size: 0.75rem;
   `;
   
   const TaskList = styled.div`
     margin-top: 1rem;
   `;
   
   const TaskItem = styled.div`
     padding: 0.5rem 0;
     border-bottom: 1px solid #f3f4f6;
     font-size: 0.875rem;
     display: flex;
     align-items: center;
     
     &:last-child {
       border-bottom: none;
     }
   `;
   
   const StatusDot = styled.span<{ status: string }>`
     display: inline-block;
     width: 8px;
     height: 8px;
     border-radius: 50%;
     margin-right: 0.5rem;
     
     ${({ status }) => {
       switch (status) {
         case 'completed':
           return `background-color: #10b981;`;
         case 'in_progress':
           return `background-color: #3b82f6;`;
         case 'blocked':
           return `background-color: #ef4444;`;
         default:
           return `background-color: #9ca3af;`;
       }
     }}
   `;
   
   export const DomainCard: React.FC<DomainCardProps> = ({
     domain,
     stats,
     priorityTasks = [],
     onViewDetails,
   }) => {
     const completionPercentage = stats?.completionPercentage || 0;
     
     return (
       <Card
         variant="domain"
         accentColor={domain.color}
         title={domain.name}
         subtitle={`${completionPercentage}% Complete`}
         interactive
         onClick={() => onViewDetails(domain.id)}
       >
         <ProgressBar percentage={completionPercentage} color={domain.color} />
         
         {stats && (
           <StatsRow>
             <StatItem>
               <StatValue>{stats.completedSteps}</StatValue>
               <StatLabel>Completed</StatLabel>
             </StatItem>
             <StatItem>
               <StatValue>{stats.inProgressSteps}</StatValue>
               <StatLabel>In Progress</StatLabel>
             </StatItem>
             <StatItem>
               <StatValue>{stats.upcomingSteps}</StatValue>
               <StatLabel>Upcoming</StatLabel>
             </StatItem>
           </StatsRow>
         )}
         
         {priorityTasks.length > 0 && (
           <TaskList>
             <h4 style={{ fontSize: '0.875rem', margin: '1rem 0 0.5rem' }}>Priority Tasks</h4>
             {priorityTasks.map(task => (
               <TaskItem key={task.id}>
                 <StatusDot status={task.status} />
                 {task.title}
               </TaskItem>
             ))}
           </TaskList>
         )}
       </Card>
     );
   };
   ```

3. **Layout components**
   - Create dashboard grid layout
   - Implement responsive container components
   - Build navigation components

#### Day 3-5: Domain Mapping Admin Tool

**Tasks:**

1. **Admin interface implementation**
   - Create admin layout container
   - Build domain management interface components
   - Implement domain editing forms

2. **Domain mapping interface**
   - Create journey content browser component
   - Build mapping interface with drag-and-drop
   - Implement bulk mapping capabilities
   - Create mapping visualization components

3. **React Context for domain management**
   - Create context for domain state management:
   ```typescript
   // src/business-ops-hub/contexts/DomainContext.tsx
   
   import React, { createContext, useContext, useState, useEffect } from 'react';
   import { BusinessDomain } from '../types/domain.types';
   import { DomainService } from '../services/domain.service';
   
   interface DomainContextType {
     domains: BusinessDomain[];
     loading: boolean;
     error: string | null;
     selectedDomainId: string | null;
     setSelectedDomainId: (id: string | null) => void;
     refreshDomains: () => Promise<void>;
     createDomain: (domain: Omit<BusinessDomain, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BusinessDomain>;
     updateDomain: (id: string, updates: Partial<BusinessDomain>) => Promise<BusinessDomain>;
     deleteDomain: (id: string) => Promise<void>;
     reorderDomains: (orderedIds: string[]) => Promise<void>;
   }
   
   const DomainContext = createContext<DomainContextType | undefined>(undefined);
   
   export const useDomains = () => {
     const context = useContext(DomainContext);
     if (!context) {
       throw new Error('useDomains must be used within a DomainProvider');
     }
     return context;
   };
   
   export const DomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [domains, setDomains] = useState<BusinessDomain[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
     
     const domainService = new DomainService();
     
     const refreshDomains = async () => {
       try {
         setLoading(true);
         setError(null);
         const data = await domainService.getAllDomains();
         setDomains(data);
       } catch (err) {
