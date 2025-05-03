# Database Schema and Type Definitions

This document details the database schema for the Idea Playground system with continuous learning and IP protection features.

## Table Structure

### Core Tables

- **ideas** - Base table for storing business ideas (existing table extended)
- **idea_interactions** - User interactions with ideas (ratings, edits, etc.)
- **idea_protection_settings** - IP protection configuration
- **training_sessions** - AI model training sessions 
- **training_ideas** - Ideas used in training sessions
- **idea_implementations** - Business ideas implemented as products/companies

## Supabase Migration Files

### Core Schema Modifications

```sql
-- supabase/migrations/20250318000000_idea_playground_extended.sql

-- First, ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns to the ideas table for training and protection
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS training_status TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS protection_level TEXT DEFAULT 'public';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS last_trained_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS embedding VECTOR(1536); -- For similarity search

-- Create a comprehensive interaction tracking table
CREATE TABLE IF NOT EXISTS idea_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  interaction_type TEXT NOT NULL, -- 'positive_rating', 'negative_rating', 'saved', 'dismissed', 'edited', 'merged', etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For ratings
  rating_value INTEGER,
  
  -- For modifications
  previous_version JSONB,
  new_version JSONB,
  
  -- For merges
  merged_with_idea_ids UUID[],
  
  -- For dismissals or explicit feedback
  reason TEXT,
  comment TEXT
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idea_interactions_idea_id_idx ON idea_interactions(idea_id);
CREATE INDEX IF NOT EXISTS idea_interactions_user_id_idx ON idea_interactions(user_id);
CREATE INDEX IF NOT EXISTS idea_interactions_type_idx ON idea_interactions(interaction_type);

-- Protection settings table
CREATE TABLE IF NOT EXISTS idea_protection_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  protection_level TEXT NOT NULL DEFAULT 'public',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Proprietary metadata
  company_name TEXT,
  implementation_date TIMESTAMP WITH TIME ZONE,
  legal_status TEXT,
  
  -- Access controls
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  team_access UUID[] DEFAULT '{}',
  viewer_access UUID[] DEFAULT '{}',
  
  -- Training controls
  exclude_from_training BOOLEAN DEFAULT FALSE,
  exclude_from_similarity_search BOOLEAN DEFAULT FALSE,
  obfuscation_level TEXT DEFAULT 'none',
  
  UNIQUE(idea_id)
);

-- Training data tracking table
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  model_version TEXT,
  training_data_count INTEGER,
  validation_data_count INTEGER,
  metrics JSONB,
  status TEXT DEFAULT 'pending'
);

-- Ideas used in training
CREATE TABLE IF NOT EXISTS training_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  included_as TEXT, -- 'positive', 'negative', 'modified', 'merged'
  obfuscated BOOLEAN DEFAULT FALSE
);

-- Create the implementation tracking table
CREATE TABLE IF NOT EXISTS idea_implementations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  implemented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  legal_status TEXT DEFAULT 'pending',
  
  -- Additional details
  implementation_details JSONB,
  business_model TEXT,
  market_segment TEXT,
  funding_status TEXT
);
```

### Row-Level Security Policies

```sql
-- supabase/migrations/20250318000100_idea_playground_security.sql

-- Enable Row Level Security on all tables
ALTER TABLE idea_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_protection_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_implementations ENABLE ROW LEVEL SECURITY;

-- Idea Interactions - Basic policies
CREATE POLICY "Users can see their own interactions"
  ON idea_interactions
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own interactions"
  ON idea_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own interactions"
  ON idea_interactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Protection Settings - Access control
CREATE POLICY "Owners can view protection settings"
  ON idea_protection_settings
  FOR SELECT
  USING (auth.uid() = owner_user_id);
  
CREATE POLICY "Team members can view protection settings"
  ON idea_protection_settings
  FOR SELECT
  USING (auth.uid() = ANY(team_access));
  
CREATE POLICY "Owners can edit protection settings"
  ON idea_protection_settings
  FOR ALL
  USING (auth.uid() = owner_user_id);

-- Idea Implementations - IP protection
CREATE POLICY "Only owners can view implementations"
  ON idea_implementations
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Only owners can create implementations"
  ON idea_implementations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Training data access - Admin only
CREATE POLICY "Only admins can view training sessions"
  ON training_sessions
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
  
CREATE POLICY "Only admins can manage training sessions"
  ON training_sessions
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
```

## TypeScript Type Definitions

### Idea Protection Types

```typescript
// src/lib/types/idea-protection.types.ts
export enum IdeaProtectionLevel {
  PUBLIC = 'public',           // Default, can be shared and used for training
  PRIVATE = 'private',         // Only visible to creator, but can be used for anonymized training
  PROTECTED = 'protected',     // Private and excluded from training entirely
  PROPRIETARY = 'proprietary'  // Implemented as product/company with legal protection
}

export enum LegalStatus {
  PENDING = 'pending',
  PATENT_FILED = 'patent-filed',
  TRADEMARK_REGISTERED = 'trademark-registered',
  INCORPORATED = 'incorporated'
}

export interface IdeaProtectionSettings {
  id: string;
  ideaId: string;
  protectionLevel: IdeaProtectionLevel;
  updatedAt: string;
  
  // For proprietary ideas
  companyName?: string;
  implementationDate?: string;
  legalStatus?: LegalStatus;
  
  // Access controls
  ownerUserId: string;
  teamAccess?: string[];
  viewerAccess?: string[];
  
  // For training exclusion
  excludeFromTraining: boolean;
  excludeFromSimilaritySearch: boolean;
  obfuscationLevel: 'none' | 'basic' | 'complete';
}

export interface IdeaImplementation {
  id: string;
  ideaId: string;
  userId: string;
  companyName: string;
  implementedAt: string;
  legalStatus: LegalStatus;
  implementationDetails?: any;
  businessModel?: string;
  marketSegment?: string;
  fundingStatus?: string;
}
```

### Idea Feedback Types

```typescript
// src/lib/types/idea-feedback.types.ts
export enum IdeaInteractionType {
  // Direct feedback
  POSITIVE_RATING = 'positive_rating',
  NEGATIVE_RATING = 'negative_rating',
  NEUTRAL_RATING = 'neutral_rating',
  
  // Actions
  SAVED = 'saved',
  DISMISSED = 'dismissed',
  
  // Modifications
  EDITED = 'edited',
  MERGED = 'merged',
  REFINED = 'refined',
  
  // Business actions
  IMPLEMENTED = 'implemented',
  SHARED = 'shared',
  EXPORTED = 'exported',
  
  // Engagement metrics
  VIEWED_DETAILS = 'viewed_details',
  HIGH_ENGAGEMENT = 'high_engagement',
  LOW_ENGAGEMENT = 'low_engagement'
}

export interface IdeaInteraction {
  id: string;
  ideaId: string;
  userId: string;
  interactionType: IdeaInteractionType;
  timestamp: string;
  
  // For ratings
  ratingValue?: number;
  
  // For modifications
  previousVersion?: any;
  newVersion?: any;
  
  // For merges
  mergedWithIdeaIds?: string[];
  
  // For dismissals or explicit feedback
  reason?: string;
  comment?: string;
}
```

### Training Types

```typescript
// src/lib/types/training.types.ts
export enum TrainingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface TrainingSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  modelVersion: string;
  trainingDataCount: number;
  validationDataCount: number;
  metrics?: any;
  status: TrainingStatus;
}

export interface TrainingIdea {
  id: string;
  trainingSessionId: string;
  ideaId: string;
  includedAs: 'positive' | 'negative' | 'modified' | 'merged';
  obfuscated: boolean;
}
```

## Database Schema Diagram

```mermaid
erDiagram
    ideas ||--o{ idea_interactions : "generates"
    ideas ||--o{ idea_protection_settings : "protects"
    ideas ||--o{ training_ideas : "trains"
    ideas ||--o{ idea_implementations : "implements"
    
    training_sessions ||--o{ training_ideas : "includes"
    
    ideas {
        uuid id PK
        text training_status
        text protection_level
        uuid owner_user_id FK
        timestamp last_trained_at
        vector embedding
    }
    
    idea_interactions {
        uuid id PK
        uuid idea_id FK
        uuid user_id FK
        text interaction_type
        timestamp timestamp
        int rating_value
        jsonb previous_version
        jsonb new_version
        uuid[] merged_with_idea_ids
        text reason
        text comment
    }
    
    idea_protection_settings {
        uuid id PK
        uuid idea_id FK
        text protection_level
        timestamp updated_at
        text company_name
        timestamp implementation_date
        text legal_status
        uuid owner_user_id FK
        uuid[] team_access
        uuid[] viewer_access
        boolean exclude_from_training
        boolean exclude_from_similarity_search
        text obfuscation_level
    }
    
    training_sessions {
        uuid id PK
        timestamp started_at
        timestamp completed_at
        text model_version
        int training_data_count
        int validation_data_count
        jsonb metrics
        text status
    }
    
    training_ideas {
        uuid id PK
        uuid training_session_id FK
        uuid idea_id FK
        text included_as
        boolean obfuscated
    }
    
    idea_implementations {
        uuid id PK
        uuid idea_id FK
        uuid user_id FK
        text company_name
        timestamp implemented_at
        text legal_status
        jsonb implementation_details
        text business_model
        text market_segment
        text funding_status
    }
