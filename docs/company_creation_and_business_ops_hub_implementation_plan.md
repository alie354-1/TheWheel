# Company Creation and Business Operations Hub Integration: Full Implementation Plan

## Overview

This document outlines the complete implementation plan for ensuring that when a company is created in The Wheel platform, it's properly associated with the user who created it and the Business Operations Hub is correctly initialized. The Business Operations Hub should only be visible for users who have a company and should be automatically set up with appropriate domains and initial configurations.

---

## User Stories

### 1. User-Company Association

**As a** founder using The Wheel platform,  
**I want** to be automatically associated with my company when I create it,  
**So that** I can immediately access and manage my company's resources.

**Acceptance Criteria:**
- When a user creates a company, they are automatically assigned as a company member with "Founder" role
- The user-company association is persistent across sessions
- The user can see their company in the dashboard after creation
- If the user-company association fails, the company creation is rolled back to maintain data integrity
- Only company creators initially have access to company management features
- The system logs the company creation event with user association

---

### 2. Business Operations Hub Initialization

**As a** new founder on The Wheel platform,  
**I want** the Business Operations Hub to be automatically set up for my company,  
**So that** I can immediately start using its features without additional configuration.

**Acceptance Criteria:**
- After company creation, the Business Operations Hub is initialized with default business domains
- Initial domain-journey mappings are set up based on the company's industry
- All required database records are created for the Business Ops Hub to function correctly
- The initialization process completes within 3 seconds
- Any initialization errors are properly logged and reported
- The initialization process is transactional (all or nothing)

---

### 3. Business Operations Hub Visibility

**As a** user of The Wheel platform,  
**I want** the Business Operations Hub to be visible only when I have a company,  
**So that** I don't see features that aren't relevant to me.

**Acceptance Criteria:**
- Business Operations Hub navigation elements are only visible to users with a company
- Users without a company are redirected to company creation when trying to access the hub
- The visibility state correctly updates when a user creates or joins a company
- The visibility state persists across sessions
- Users with multiple companies see the Business Operations Hub for their currently selected company

---

### 4. Business Operations Hub First-Time Experience

**As a** new founder on The Wheel platform,  
**I want** a guided introduction to the Business Operations Hub,  
**So that** I can understand how to use its features effectively.

**Acceptance Criteria:**
- First-time users of the Business Operations Hub see an onboarding overlay
- The onboarding explains key features and concepts
- Users can navigate through the onboarding at their own pace
- Users can dismiss the onboarding and return to it later if needed
- The onboarding status is tracked per user to avoid repeated displays

---

## Technical Implementation Details

### 1. Database Schema Updates

#### a. Company Member Role Enhancement
- Ensure the `company_members` table properly tracks the "Founder" role
- Add created_by_user_id field to companies table (if not already present)

#### b. Business Ops Hub Database Initialization
- Create SQL functions for initializing default business domains
- Create SQL functions for establishing domain-journey mappings
- Add integrity constraints to ensure proper relationships

---

### 2. Business Ops Hub Initialization Service

#### a. Create a New Service

```typescript
// src/lib/services/businessOpsInitialization.service.ts

import { supabase } from "../supabase";

export interface BusinessOpsInitOptions {
  companyId: string;
  userId: string;
  industries: string[];
  businessModel?: string;
}

export class BusinessOpsInitializationService {
  /**
   * Initialize the Business Operations Hub for a newly created company
   */
  public static async initializeForCompany(options: BusinessOpsInitOptions): Promise<void> {
    const { companyId, userId, industries } = options;
    
    // Start a transaction to ensure all operations succeed or fail together
    const { error } = await supabase.rpc('initialize_business_ops_hub', {
      p_company_id: companyId,
      p_user_id: userId,
      p_industries: industries
    });
    
    if (error) throw error;
    
    // Log initialization event
    await this.logInitializationEvent(companyId, userId);
  }
  
  /**
   * Log the initialization event for auditing
   */
  private static async logInitializationEvent(companyId: string, userId: string): Promise<void> {
    await supabase.from('decision_events').insert({
      company_id: companyId,
      user_id: userId,
      event_type: 'business_ops_hub_initialized',
      context: {
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

#### b. SQL Stored Procedure

```sql
-- Create function to initialize Business Ops Hub
CREATE OR REPLACE FUNCTION initialize_business_ops_hub(
  p_company_id UUID,
  p_user_id UUID,
  p_industries TEXT[]
) RETURNS void AS $$
DECLARE
  v_domain_id UUID;
  v_journey_id UUID;
  v_relevance FLOAT;
BEGIN
  -- Map each industry to appropriate domains with relevance scores
  FOR i IN 1..array_length(p_industries, 1) LOOP
    -- Get relevant domains for this industry
    FOR v_domain_id, v_relevance IN 
      SELECT id, 1.0 -- Replace with actual relevance calculation
      FROM business_domains
      WHERE name ILIKE '%' || p_industries[i] || '%'
    LOOP
      -- Link domain to company with relevance score
      INSERT INTO domain_journey_mapping (
        domain_id, 
        journey_id,
        relevance_score,
        primary_domain
      )
      VALUES (
        v_domain_id,
        NULL, -- Set journey_id as needed
        v_relevance,
        (v_relevance > 0.7) -- Set as primary domain if highly relevant
      );
    END LOOP;
  END LOOP;
  
  -- Initialize workspace configurations with defaults
  INSERT INTO workspace_configurations (
    company_id,
    user_id,
    domain_id,
    name,
    configuration,
    is_shared
  )
  SELECT 
    p_company_id,
    p_user_id,
    id,
    name || ' Workspace',
    jsonb_build_object(
      'layout', 'default',
      'widgets', jsonb_build_array(
        jsonb_build_object('type', 'summary', 'position', 1),
        jsonb_build_object('type', 'tasks', 'position', 2),
        jsonb_build_object('type', 'recommendations', 'position', 3)
      )
    ),
    TRUE
  FROM business_domains;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. Integration with Company Creation Process

#### a. Update Company Creation in CompanySetup.tsx

```typescript
// Modified handleSave function in CompanySetup.tsx

import { BusinessOpsInitializationService } from '../../lib/services/businessOpsInitialization.service';

const handleSave = async (goToDashboard = false) => {
  if (!user || !formData.name || formData.industries.length === 0) return;

  setIsLoading(true);
  setError('');

  // Prepare data for saving, separating direct columns and metadata
  const companyData = {
    // ...existing code...
  };
  
  try {
    // Begin transaction
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{
        ...companyData,
        created_by_user_id: user.id // Add creator user ID reference
      }])
      .select()
      .single();

    if (companyError) throw companyError;

    if (!company) {
      throw new Error('Failed to create company');
    }

    // Store company ID for future updates
    setCompanyId(company.id);

    // Create company member record for owner
    const { error: memberError } = await supabase
      .from('company_members')
      .insert({
        company_id: company.id,
        user_id: user.id,
        title: 'Founder',
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      // If member creation fails, delete the company to maintain consistency
      await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);
      throw memberError;
    }
    
    // Initialize Business Operations Hub
    try {
      await BusinessOpsInitializationService.initializeForCompany({
        companyId: company.id,
        userId: user.id,
        industries: formData.industries,
        businessModel: formData.business_model
      });
    } catch (initError: any) {
      console.error('Error initializing Business Ops Hub:', initError);
      // Log the error but don't fail the entire operation
      // Consider showing a warning to the user
    }

    // Navigate to dashboard if requested
    if (goToDashboard) {
      // Clear session storage
      sessionStorage.removeItem('companySetupData');
      navigate('/company/dashboard');
    }
  } catch (error: any) {
    console.error('Error saving company:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

### 4. Business Ops Hub Visibility Control

#### a. Update Navigation Component

```typescript
// src/components/Navigation.tsx or similar

import { useCompany } from '../lib/hooks/useCompany';

const Navigation = () => {
  const { currentCompany } = useCompany();
  
  return (
    <nav>
      {/* Common navigation elements */}
      
      {/* Business Ops Hub only visible if user has a company */}
      {currentCompany && (
        <li>
          <NavLink to="/business-ops-hub">Business Operations Hub</NavLink>
        </li>
      )}
      
      {/* Other navigation elements */}
    </nav>
  );
};
```

#### b. Route Protection

```typescript
// src/components/PrivateBusinessOpsRoute.tsx

import { Navigate } from 'react-router-dom';
import { useCompany } from '../lib/hooks/useCompany';

interface PrivateBusinessOpsRouteProps {
  component: React.ComponentType;
}

const PrivateBusinessOpsRoute: React.FC<PrivateBusinessOpsRouteProps> = ({ component: Component }) => {
  const { currentCompany, loading } = useCompany();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentCompany) {
    return <Navigate to="/company/setup" replace />;
  }
  
  return <Component />;
};
```

---

### 5. Business Ops Hub First-Time Experience

#### a. First-Time Experience Component

```typescript
// src/business-ops-hub/components/OnboardingOverlay.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/hooks/useAuth';

export const OnboardingOverlay: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'business_ops_hub_onboarded')
        .single();
        
      if (error || !data) {
        setShowOverlay(true);
      }
    };
    
    checkOnboardingStatus();
  }, [user]);
  
  const handleComplete = async () => {
    if (!user) return;
    
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        key: 'business_ops_hub_onboarded',
        value: 'true'
      });
      
    setShowOverlay(false);
  };
  
  if (!showOverlay) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl">
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold">Welcome to Business Operations Hub</h2>
            <p className="my-4">
              The Business Operations Hub helps you manage all aspects of your business operations
              across various domains like Finance, Marketing, Operations, and more.
            </p>
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Next
            </button>
          </>
        )}
        
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold">Domains and Tasks</h2>
            <p className="my-4">
              Your business is organized into domains. Each domain contains tasks and 
              resources to help you grow and manage that aspect of your business.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Previous
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Next
              </button>
            </div>
          </>
        )}
        
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold">Get Started</h2>
            <p className="my-4">
              We've set up domains based on your company's industry. Explore each domain,
              complete tasks, and grow your business effectively.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Get Started
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

#### b. Integration into Business Operations Hub Page

```typescript
// Update src/business-ops-hub/pages/BusinessOperationsHubPage.tsx

import { OnboardingOverlay } from '../components/OnboardingOverlay';

const BusinessOperationsHubPage: React.FC = () => {
  // ...existing code...

  return (
    <>
      <OnboardingOverlay />
      {/* Existing component JSX */}
    </>
  );
};
```

---

## Detailed Engineering Tasks

(See plan for full breakdown of tasks, estimates, and risk management.)
