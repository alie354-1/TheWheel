# Journey Map Implementation Plan

## Overview

This document outlines the implementation plan for enhancing the Journey Map functionality in The Wheel platform. The Journey Map is a core feature that guides founders through the startup process with personalized recommendations, tools, and resources.

## Database Enhancements

We've implemented the following database enhancements in `supabase/migrations/20250428123000_enhance_journey_map_and_tools.sql`:

1. **Company Profile Fields for Tool Personalization**
   - Added fields to the `companies` table: `industry`, `company_size`, `funding_stage`, and `tech_stack`
   - These fields will be used to personalize tool recommendations

2. **Tool Ranking System**
   - Created `journey_step_tool_rankings` table to store personalized tool rankings based on company profile
   - Added `default_ranking` column to `journey_step_tools` table

3. **Step-Tool Association**
   - Added `step_id` to `company_tool_evaluations` to track which step a tool is being evaluated for

4. **AI Review for Custom Tools**
   - Added `ai_review_status` and `user_edited_description` to `tool_submissions` table

5. **Database Functions**
   - Created `get_personalized_tool_rankings` function to retrieve personalized tool recommendations
   - Created `has_sufficient_profile_data` function to check if a company has enough profile data for personalization

## Service Layer Enhancements

We've enhanced the `companyJourney.service.ts` with the following functionality:

1. **Step Management**
   - `skipStep`: Allow users to skip steps they don't need
   - `markStepComplete`: Mark steps as completed
   - `addFocusArea` and `removeFocusArea`: Manage focus areas

2. **Tool Recommendations**
   - `getPersonalizedToolRecommendations`: Get personalized tool recommendations based on company profile
   - `hasSufficientProfileData`: Check if company has enough profile data for personalization
   - `getStepTools`: Get all tools for a step

3. **Custom Tool Management**
   - `submitCustomTool`: Submit a custom tool for a journey step
   - `updateCustomToolDescription`: Update AI-generated description
   - `addCustomToolToCompany`: Add a custom tool to the company's toolset

## UI Enhancements

We've enhanced the `JourneyStepDetails.tsx` component with the following features:

1. **Step Management**
   - Skip step functionality
   - Mark step as complete
   - Toggle focus area

2. **Step Content Display**
   - Guidance section with detailed explanation
   - Checklists for step completion requirements
   - Options for different approaches to the step
   - Tips for best practices
   - Resources (links, documents) for additional information
   - User notes for personal observations and planning

3. **Tool Recommendations**
   - Display personalized tool recommendations
   - Show/hide additional tools
   - Alert for incomplete company profile

4. **Custom Tool Submission**
   - Form for submitting custom tools
   - AI-generated description review
   - Accept/edit/reject AI-generated descriptions

5. **Feedback Collection**
   - Rating and comment submission for steps
   - Success confirmation

## Next Steps

1. **Journey Map UI Improvements**
   - Update the main Journey Map view to show step completion status
   - Add visual indicators for focus areas
   - Improve navigation between steps and phases
   - Ensure proper layout of step details with content before action choices

2. **User Notes Feature**
   - Add a dedicated notes section to the step details page
   - Implement save/load functionality for notes using the company_progress.notes field
   - Add auto-save functionality for notes

3. **Company Profile Enhancement**
   - Create or update the company profile page to collect industry, size, and funding stage
   - Implement profile completeness indicator

4. **Admin Tool Management**
   - Complete the tool submission moderation interface
   - Implement the tool ranking management interface

5. **AI Integration**
   - Implement the AI enrichment service for custom tool descriptions
   - Set up webhooks for AI processing notifications

6. **Analytics**
   - Track step completion rates
   - Monitor tool usage and effectiveness
   - Analyze feedback for continuous improvement

7. **Testing**
   - Unit tests for new service methods
   - Integration tests for the personalization algorithm
   - User acceptance testing for the enhanced UI

## Implementation Timeline

1. **Phase 1: Database & Service Layer (Completed)**
   - Database schema updates
   - Core service methods

2. **Phase 2: UI Implementation (In Progress)**
   - Journey step details enhancements
   - Tool recommendation UI
   - Custom tool submission flow

3. **Phase 3: AI Integration (Next)**
   - Custom tool description generation
   - Personalization algorithm refinement

4. **Phase 4: Admin Tools & Analytics (Future)**
   - Tool moderation interface
   - Analytics dashboard
   - Feedback analysis tools
