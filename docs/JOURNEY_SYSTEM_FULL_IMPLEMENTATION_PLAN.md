# Journey System Full Implementation Plan

This document outlines the complete architecture and implementation plan for the redesigned Journey System, incorporating all core, supporting, and extended modules.

---

## 1. Core Journey Structure

- **journey_domains**: Business domains (e.g., Marketing, Product)
- **journey_phases**: Sequential journey phases
- **journey_step_templates**: Reusable step blueprints
- **journey_steps**: User-specific step instances

---

## 2. Startup & Company Progression

- **journey_startup_stages**: Defines startup lifecycle stages
- **journey_company_profiles**: Tracks company metadata and stage
- **journey_company_users**: Maps users to companies

---

## 3. Methodology & Content

- **journey_methodologies**: Frameworks like Lean Startup, JTBD
- **journey_content_blocks**: Modular content (text, video, etc.)
- **journey_step_content_map**: Links content to step templates

---

## 4. Tool Marketplace

- **journey_tools**: Canonical tool records
- **journey_tool_reviews**: User-submitted ratings and feedback
- **journey_tool_use_cases**: Contextual applications by stage
- **journey_tool_features**: Structured feature metadata
- **journey_tool_claims**: Vendor claim and moderation system
- **journey_tool_discussions**: Community Q&A per tool
- **journey_tool_alternatives**: Tool comparison mapping
- **journey_tool_integrations**: Integration metadata

---

## 5. Step-Tool Relationships

- **journey_step_tools**: Maps tools to step templates with relevance

---

## 6. Admin & Versioning

- **journey_step_template_versions**: Version control for templates

---

## 7. User Feedback & Analytics

- **journey_step_feedback**: User feedback and ratings
- **journey_step_analytics**: Time spent, interactions, etc.

---

## 8. Dependencies & Logic

- **journey_step_dependencies**: Prerequisite step mapping
- **journey_step_unlock_criteria**: JSON-based unlock rules

---

## 9. Community & Expert Integration

- **journey_step_expert_recommendations**: Expert suggestions per step
- **journey_community_discussions_map**: Links to community threads

---

## 10. AI Recommendation Engine (Planned)

- **journey_ai_recommendation_inputs**: Captures user context
- **journey_ai_recommendation_outputs**: Stores generated suggestions
- **journey_ai_feedback**: User feedback on AI suggestions

---

## 11. Feature Flag Integration

- All new features are gated behind flags:
  - `use_new_journey_schema_read`
  - `use_new_journey_schema_write`
  - `admin_journey_v2_enabled`
  - `show_new_journey_ui_for_company`

---

## 12. Admin Interfaces

- **StepTemplateManager**: Create/edit step templates
- **ToolManager**: Manage tools and metadata
- **BulkUploadManager**: CSV import for steps, tools, phases
- **PhaseManager / DomainManager**: Manage taxonomy

---

## 13. Compatibility & Migration

- Legacy views (e.g., `legacy_journey_steps_view`) to support old UI
- No destructive changes to existing tables
- Migration of legacy data deferred to post-setup phase

---

## 14. Rollout Strategy

- **Phase 1**: Schema setup (complete)
- **Phase 2**: Admin tools and data entry
- **Phase 3**: New UI components (flagged)
- **Phase 4**: Gradual rollout and testing
- **Phase 5**: Legacy data migration (optional)

---

## 15. Next Steps

- Finalize schema with any missing tables
- Build admin interfaces
- Populate with new 85-step framework and tools
- Begin internal testing via feature flags
