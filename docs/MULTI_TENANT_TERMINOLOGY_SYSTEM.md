# Multi-Tenant Terminology System

## Overview

The Multi-Tenant Terminology System provides a comprehensive, future-proof solution for customizing terminology across multiple organizational levels. This system allows for complete white-labeling capabilities, with terminology inheritance flowing from system defaults down through various organizational levels to individual users.

## Key Features

- **Hierarchical Terminology Inheritance**: Terminology flows from system defaults through partners, organizations, companies, teams, and finally to individual users
- **White Label Support**: Complete customization for partner-branded platforms
- **Multi-Language Support**: Built-in internationalization capabilities
- **Consistency Tools**: Validation to ensure terminology remains coherent
- **React Integration**: Seamless integration with React components through context providers and hooks

## Terminology Hierarchy

Terminology is defined and inherited through a hierarchy of levels, with each level able to override or extend terminology from higher levels:

1. **System Default**: Base terminology provided by The Wheel
2. **Partner Level**: Customizations for white-label partners
3. **Organization Level**: Settings for VCs, studios, or parent organizations
4. **Company Level**: Company-specific terminology
5. **Team Level**: Team-specific terminology
6. **User Level**: Individual user preferences

## Data Model

The system uses a structured data model to store terminology at different levels:

```sql
-- System-wide default terminology
CREATE TABLE terminology_defaults (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT
);

-- Partner-level terminology (for white labeling)
CREATE TABLE partner_terminology (
  partner_id UUID REFERENCES partners(id),
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace', -- 'replace', 'merge', 'suggest'
  PRIMARY KEY (partner_id, key)
);

-- Organization-level terminology (for VCs, Studios, etc.)
CREATE TABLE organization_terminology (
  organization_id UUID REFERENCES organizations(id),
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace',
  PRIMARY KEY (organization_id, key)
);

-- Company-level terminology
CREATE TABLE company_terminology (
  company_id UUID REFERENCES companies(id),
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace',
  PRIMARY KEY (company_id, key)
);

-- Team-level terminology
CREATE TABLE team_terminology (
  team_id UUID REFERENCES teams(id),
  key TEXT,
  value JSONB NOT NULL,
  override_behavior TEXT DEFAULT 'replace',
  PRIMARY KEY (team_id, key)
);

-- User-level terminology preferences
CREATE TABLE user_terminology_preferences (
  user_id UUID REFERENCES users(id),
  key TEXT,
  value JSONB NOT NULL,
  PRIMARY KEY (user_id, key)
);

-- White label configuration
CREATE TABLE white_label_configuration (
  partner_id UUID REFERENCES partners(id) PRIMARY KEY,
  terminology_settings JSONB,
  branding_settings JSONB,
  domain_settings JSONB,
  feature_toggles JSONB
);
```

## Type System

The terminology system uses a comprehensive type system to ensure consistency:

```typescript
export enum TerminologyLevel {
  USER = 1,
  TEAM = 2,
  COMPANY = 3,
  ORGANIZATION = 4, // Parent org like a VC/Studio
  PARTNER = 5,      // White label partner
  SYSTEM = 6        // System defaults
}

export interface BaseTerms {
  singular: string;
  plural: string;
  verb?: string;
}

export interface ProgressTerms {
  notStarted: string;
  inProgress: string;
  completed: string;
  skipped: string;
  notNeeded?: string;
}

export interface EntityTerms extends BaseTerms {
  possessive?: string;
  articleIndefinite?: string; // "a" or "an"
  articleDefinite?: string;   // "the"
}

export interface JourneyTerms {
  mainUnit: EntityTerms;
  phaseUnit: EntityTerms;
  stepUnit: EntityTerms;
  progressTerms: ProgressTerms;
  pathUnit?: EntityTerms;
}

export interface ToolTerms {
  mainUnit: EntityTerms;
  evaluationTerms: EntityTerms;
  comparisonTerms: EntityTerms;
  categoryTerms?: EntityTerms;
}

export interface PathTerms {
  mainUnit: EntityTerms;
  progressTerms: {
    milestone: string;
    achievement: string;
    journey: string;
  };
}

export interface SystemWideTerms {
  application: {
    name: string;
    shortName?: string;
    tagline?: string;
  };
  navigation: {
    dashboard: string;
    settings: string;
    profile: string;
    help: string;
  };
  actions: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
  };
}

export interface TerminologyConfig {
  journeyTerms: JourneyTerms;
  toolTerms: ToolTerms;
  pathTerms: PathTerms;
  systemTerms: SystemWideTerms;
  _meta?: {
    version: string;
    baseLanguage: string;
    availableTranslations?: string[];
    lastUpdated?: string;
  };
  translations?: Record<string, Partial<TerminologyConfig>>;
}
```

## Default Terminology

The system includes sensible defaults that can be overridden:

```typescript
export const defaultTerminology: TerminologyConfig = {
  journeyTerms: {
    mainUnit: {
      singular: 'milestone',
      plural: 'milestones',
      verb: 'reach',
    },
    phaseUnit: {
      singular: 'stage',
      plural: 'stages',
    },
    stepUnit: {
      singular: 'task',
      plural: 'tasks',
      verb: 'complete',
    },
    progressTerms: {
      notStarted: 'not started',
      inProgress: 'in progress',
      completed: 'completed',
      skipped: 'skipped',
    },
  },
  toolTerms: {
    mainUnit: {
      singular: 'solution',
      plural: 'solutions',
      verb: 'implement',
    },
    evaluationTerms: {
      singular: 'assessment',
      plural: 'assessments',
      verb: 'evaluate',
    },
    comparisonTerms: {
      singular: 'comparison',
      plural: 'comparisons',
      verb: 'compare',
    },
  },
  pathTerms: {
    mainUnit: {
      singular: 'path',
      plural: 'paths',
    },
    progressTerms: {
      milestone: 'milestone',
      achievement: 'achievement',
      journey: 'journey',
    },
  },
  systemTerms: {
    application: {
      name: 'The Wheel',
      shortName: 'Wheel',
      tagline: 'Your startup journey, simplified',
    },
    navigation: {
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
    },
  },
  _meta: {
    version: '1.0',
    baseLanguage: 'en',
    availableTranslations: [],
    lastUpdated: new Date().toISOString(),
  },
};
```

## Service Layer

The service layer manages terminology fetching and persistence:

```typescript
// Context interface for terminology resolution
export interface TerminologyContext {
  userId?: string;
  teamId?: string;
  companyId?: string;
  organizationId?: string;
  partnerId?: string;
  whiteLabel?: boolean;
}

// Fetch terminology with inheritance
export async function getContextualTerminology(context: TerminologyContext): Promise<TerminologyConfig> {
  // Implementation fetches terminology from all applicable levels,
  // applying inheritance rules to build the final terminology set
}

// Save terminology at a specific level
export async function saveTerminology(
  level: TerminologyLevel,
  id: string,
  terminology: Partial<TerminologyConfig>,
  overrideBehavior: 'replace' | 'merge' | 'suggest' = 'replace'
): Promise<void> {
  // Implementation persists terminology at the specified level
}

// Get localized terminology
export async function getLocalizedTerminology(
  context: TerminologyContext,
  languageCode: string = 'en'
): Promise<TerminologyConfig> {
  // Implementation fetches terminology and applies localization
}
```

## React Integration

The system integrates with React through context providers and hooks:

```typescript
// Context provider
export const TerminologyProvider: React.FC = ({ children }) => {
  const { user } = useAuth();
  const { activeCompany } = useCompany();
  const [terminology, setTerminology] = useState<TerminologyConfig>(defaultTerminology);

  // Fetch terminology based on context
  useEffect(() => {
    if (activeCompany?.id) {
      getContextualTerminology({
        userId: user?.id,
        companyId: activeCompany.id,
        // Other context properties...
      })
        .then(setTerminology)
        .catch(err => {
          console.error('Failed to load terminology', err);
          setTerminology(defaultTerminology);
        });
    }
  }, [user?.id, activeCompany?.id]);

  return (
    <TerminologyContext.Provider value={terminology}>
      {children}
    </TerminologyContext.Provider>
  );
};

// Hook for accessing terminology
export const useTerminology = () => useContext(TerminologyContext);
```

## Using Terminology in Components

Components can access terminology through the `useTerminology` hook:

```typescript
import { useTerminology } from '../hooks/useTerminology';

const JourneyOverview: React.FC = () => {
  const terms = useTerminology();
  
  return (
    <div className="container">
      <h1>Your {terms.pathTerms.progressTerms.journey}</h1>
      <p>You have completed 5 out of 12 {terms.journeyTerms.mainUnit.plural}</p>
      
      <h2>Next {terms.journeyTerms.mainUnit.singular} to {terms.journeyTerms.mainUnit.verb}</h2>
      
      {/* The rest of the component using dynamic terminology */}
    </div>
  );
};
```

## Administration Interfaces

The system includes interfaces for managing terminology at different levels:

### White Label Administration

```
WHITE LABEL ADMINISTRATION
- Partner profile and settings
- Terminology customization
- Branding customization (logo, colors, typography)
- Feature configuration
- Domain settings
- User management
```

### Organization-Level Configuration

```
ORGANIZATION TERMINOLOGY SETTINGS
- Organization profile
- Terminology preferences with inheritance awareness
- Application to portfolio companies
- Override behavior configuration
```

### Company-Level Configuration

```
COMPANY TERMINOLOGY SETTINGS
- Company profile
- Terminology inheritance settings
- Custom terminology configuration
- Preview functionality
```

## Terminology Consistency Tools

The system includes tools to validate terminology consistency:

```typescript
export interface TerminologyConsistencyIssue {
  path: string;
  issue: 'missing' | 'plural_mismatch' | 'verb_tense_mismatch' | 'capitalization_inconsistency';
  severity: 'error' | 'warning' | 'suggestion';
  message: string;
  suggestion?: string;
}

export function checkTerminologyConsistency(terminology: TerminologyConfig): TerminologyConsistencyIssue[] {
  // Implementation validates terminology consistency
}
```

## A/B Testing Integration

The system supports A/B testing for terminology optimization:

```typescript
export async function assignTerminologyTestVariant(companyId: string): Promise<string> {
  // Implementation assigns a test variant for A/B testing
}

export async function trackTerminologyFeedback(
  companyId: string, 
  feedbackType: 'positive' | 'negative' | 'suggestion',
  details?: string
): Promise<void> {
  // Implementation tracks feedback from terminology tests
}
```

## AI-Assisted Terminology Optimization

The system leverages AI to optimize terminology based on user behavior:

```typescript
export async function analyzeTerminologyEffectiveness(): Promise<TerminologyRecommendation[]> {
  // Implementation analyzes effectiveness and provides recommendations
}
```

## Implementation Strategy

Implementation of the terminology system follows these phases:

1. **Database Migration:**
   - Create new terminology tables with inheritance structure
   - Migrate existing terminology to the new system
   - Add indices for performance optimization

2. **Service Layer Implementation:**
   - Build the hierarchical terminology service
   - Create utilities for flattening/unflattening terminology
   - Implement direct CRUD operations in service (see [Direct Service Approach](./TERMINOLOGY_SERVICE_DIRECT_APPROACH.md))
   - Implement consistency and validation tools

3. **Admin Interfaces:**
   - Build the white label administration panel
   - Create organization-level terminology configuration
   - Implement company-level terminology management

4. **React Components:**
   - Create the TerminologyProvider context
   - Build hooks for accessing terminology
   - Implement dynamic text components that use terminology

5. **Testing and Validation:**
   - Create test cases for terminology inheritance
   - Create unit tests for service methods (`scripts/test-terminology-service.js`)
   - Validate performance across large terminology sets
   - Test multi-language support

## Architecture Notes

The terminology system uses a direct service approach rather than REST API endpoints for data operations. This simplifies the architecture by eliminating the API layer and allowing components to interact directly with the `TerminologyService` class. For more details on this approach, see [Direct Service Approach](./TERMINOLOGY_SERVICE_DIRECT_APPROACH.md).
