# Journey System & Tool Marketplace Redesign Architecture

## Overview

This document outlines a comprehensive redesign of the journey system and tool marketplace. It consolidates all prior implementations into a unified, extensible, and future-proof architecture. The system supports dynamic company-specific journeys, expert integration, analytics, and a full-featured tool marketplace with vendor management, reviews, and documentation.

---

## Contents

1. Journey System Core Architecture
2. Tool Marketplace Architecture
3. Integration Points
4. Migration Strategy
5. CSV Import Format Specifications
6. Admin Components
7. Future Extensions

---

## 1. Journey System Core Architecture

### Key Concepts

- **Phases**: High-level stages of a startup journey (e.g., Ideation, Build, Launch)
- **Domains**: Functional areas (e.g., Marketing, Finance, Product)
- **Step Templates**: Reusable definitions of steps
- **Steps**: Specific instances of templates within a phase/domain
- **Company Paths**: Customizable journeys per company
- **Progress**: Tracks company progress through steps

### Database Schema

Includes:
- `journey_phases`
- `journey_domains`
- `journey_step_templates`
- `journey_steps`
- `journey_company_paths`
- `journey_company_steps`
- `journey_progress`
- `journey_step_analytics`
- `journey_company_analytics`
- `journey_step_engagement`
- `journey_step_comments`
- `journey_step_history`
- `journey_step_experts`
- `journey_community_step_submissions`

### Features

- JSONB fields for extensibility
- Versioning for step templates
- Company-specific overrides
- Analytics and engagement tracking
- Community submissions and expert tagging

---

## 2. Tool Marketplace Architecture

### Key Concepts

- **Tool Profiles**: Rich metadata, pricing, integrations
- **Ownership**: Tools can be claimed and managed by vendors
- **Reviews**: Structured user feedback
- **Documentation**: Markdown-based structured docs
- **Discussions**: Community Q&A and support
- **Analytics**: Usage and engagement metrics

### Database Schema

Includes:
- `journey_tools`
- `journey_tool_managers`
- `journey_tool_claims`
- `journey_tool_analytics`
- `journey_tool_reviews`
- `journey_tool_review_votes`
- `journey_tool_docs`
- `journey_tool_doc_sections`
- `journey_tool_discussions`
- `journey_tool_discussion_replies`
- `journey_tool_reply_votes`
- `journey_tool_features`
- `journey_tool_integrations`
- `journey_tool_use_cases`
- `journey_user_tool_interactions`
- `journey_tool_comparison_lists`
- `journey_tool_comparison_items`

### Features

- Full tool profile pages
- Claim and manage tools
- Review and rating system
- Documentation and tutorials
- Community discussions
- Feature comparisons and integrations

---

## 3. Integration Points

- **Step-Tool Mapping**: `journey_step_tools` links steps to tools
- **Expert-Step Mapping**: `journey_step_experts` links experts to steps
- **Company Progress**: `journey_progress` tracks step completion
- **Analytics**: Aggregated in `journey_step_analytics` and `journey_company_analytics`

---

## 4. Migration Strategy

1. Create new `journey_` prefixed tables
2. Build service layer for new schema
3. Update admin components to use new services
4. Migrate data from old tables
5. Update user-facing components
6. Deprecate old system

---

## 5. CSV Import Format Specifications

### Phases

```
name,description,order_index,icon_url,color
Ideation,Generate and validate business ideas,1,/icons/ideation.svg,#3498db
```

### Domains

```
name,description,icon_url,color
Marketing,Building brand awareness,/icons/marketing.svg,#9b59b6
```

### Steps

```
name,description,phase_name,domain_name,estimated_time,difficulty,order_index,prerequisites,applicable_stages
Define Value Proposition,Clearly articulate your value,Ideation,Product,1-2 weeks,Medium,1,,Pre-seed;Seed
```

### Tools

```
name,description,category,subcategory,url
Trello,Project management,Productivity,Task Management,https://trello.com
```

### Step-Tool Mappings

```
step_name,phase_name,domain_name,tool_name,relevance_score,usage_notes
Build MVP,Build,Product,Trello,0.9,Use for tracking tasks
```

---

## 6. Admin Components

- **JourneyAdminDashboard**: Central hub
- **PhaseManager**: Manage phases
- **DomainManager**: Manage domains
- **StepTemplateManager**: Manage templates
- **StepManager**: Manage steps
- **ToolManager**: Manage tools
- **BulkUploadManager**: Upload CSVs for phases, domains, steps, tools, mappings

---

## 7. Future Extensions

- AI-powered step recommendations
- Personalized journey paths
- Tool usage analytics dashboards
- Expert Q&A and mentoring integration
- Public tool marketplace with search and filters
- Tool monetization and affiliate links

---

This document serves as the blueprint for implementing a unified, scalable, and extensible journey and tool system.
