# Interactive, AI-Augmented Company Journey Page: Build Plan & Schema

## Overview

This document describes the architecture, features, and database schema for the new Company Journey page, designed to be highly interactive, founder-focused, and AI-augmented from the start.

---

## Features to Build

### 1. Interactive Journey Board
- Drag-and-drop board or timeline view for all journey steps, grouped by phase or status (Not Started, In Progress, Completed, Skipped, Not Needed).
- StepCard component for each step, supporting:
  - Marking as Complete, Skipped, Not Needed, or In Progress (single click or context menu).
  - Drag-and-drop reordering within/between phases/statuses.
  - Adding/editing notes, attaching documents, and viewing recommendations.
  - Adding custom steps or phases.
  - Marking steps as "Can be done in parallel" and visually grouping them.
  - Hiding/archiving steps.
- Filtering, sorting, and search for steps, notes, or resources.

### 2. AI-Powered Contextual Guidance
- AI Recommendation Panel:
  - Shows next best steps, focus areas, and parallelizable work based on company data and journey history.
  - Provides recommendations, tips, and resources for each step, personalized to the company’s context and what similar companies have done.
  - Allows founders to ask questions about their journey and get contextual answers (initially via a generic model, later a contextual one).
- All AI hooks are in place from the start, with a service abstraction for easy model upgrades.

### 3. Founder-Centric UX
- “My Journey” summary at the top: progress, focus, blockers, and next steps (AI-powered).
- All actions (status change, reorder, add note, etc.) are instant, undoable, and collaborative (real-time updates for all team members).
- Mobile-friendly, accessible, and visually engaging.

### 4. Technical/Service Considerations
- Modular UI: StepCard, PhaseColumn, JourneyBoard, AIRecommendationPanel, etc.
- Service methods for updating step status, order, notes, custom steps, and AI queries.
- Real-time updates (Supabase subscriptions or polling).

---

## SQL Migration

See `supabase/migrations/20250428_journey_page_interactive_enhancements.sql` for the following:

- Add support for custom step order, parallel steps, and archiving in `company_progress`
- Table for custom company steps: `company_custom_steps`
- Tables for AI recommendations and Q&A: `company_journey_ai_recommendations`, `company_journey_ai_questions`
- Indexes for efficient lookup

---

## Next Steps

1. Run the migration to update your schema.
2. Build the new Company Journey page and supporting services/components as outlined above.
3. Integrate AI hooks for recommendations and Q&A, starting with a generic model and planning for future contextual upgrades.
