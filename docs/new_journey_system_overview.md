# New Journey System Overview

## Introduction

The New Journey System is a completely new implementation of the journey functionality that provides founders with a comprehensive framework for startup success. It operates in parallel with the existing journey system, allowing for testing and gradual migration without disrupting the current user experience.

## Core Components

### Frontend Components

#### Pages
- **NewJourneyDashboard**: The main dashboard showing journey statistics, recommended next steps, and progress.
- **BrowseStepsPage**: Page for exploring and filtering available steps to add to a journey.
- **StepDetailPage**: Detailed view of a specific step with tasks, resources, and community insights.

#### UI Components
- **DashboardSidebar**: Navigation sidebar with journey statistics and filters.
- **RecommendedNextStep**: Card displaying AI-recommended next step based on current progress.
- **PeerInsights**: Shows anonymized data from other founders who completed similar steps.
- **YourProgress**: Visual representation of progress across different domains.

#### Router
- **NewJourneyRouter**: Handles routing between different journey pages.

### Backend Structure (Database Tables)

The system uses a two-tier architecture with framework tables (canonical steps) and company-specific journey tables:

#### Framework Tables
- `journey_phases`: Different phases of the startup journey (e.g., Ideation, Validation, Build)
- `journey_domains`: Business domains (e.g., Strategy, Product, Marketing)
- `journey_steps`: The canonical 150-step framework with detailed guidance

#### Company Implementation Tables
- `company_journeys`: Company-specific journey instances
- `company_journey_steps`: Customized step implementations for each company
- `step_tasks`: Sub-items within steps for granular progress tracking
- `step_outcomes`: Detailed tracking of step completion and insights

#### Community & Learning
- `anonymized_outcomes`: Privacy-safe sharing of insights between founders
- `adaptive_suggestions`: AI-driven suggestions based on outcomes
- `standup_sessions`: Integration with daily standup workflow

## Key Features

1. **Dashboard with Real-Time Stats**: Track progress across all journey steps.
2. **AI-Powered Recommendations**: Intelligent suggestions for next steps based on progress.
3. **Community Intelligence**: Anonymous peer insights without privacy compromise.
4. **Detailed Step Information**: Comprehensive guidance including "Why This Matters," deliverables, and success criteria.
5. **Task Management**: Granular tracking of progress within steps.
6. **Resource Recommendations**: Suggested tools and templates for each step.
7. **Standup Bot Integration**: Natural language processing for daily progress updates.
8. **Outcome Capture**: Detailed collection of results and learning from each step.

## Implementation Details

The new journey system is implemented as a separate module within the company context, using the path `/company/new-journey/*`. This allows it to operate in parallel with the existing journey system, enabling testing and gradual migration without disrupting the current user experience.

The UI is built with React and styled using Tailwind CSS, with a modern, clean design that emphasizes usability and clarity.

## Future Enhancements

1. **VC Portfolio Features**: Add portfolio-wide views for venture capital firms.
2. **Enhanced AI Integration**: Deeper integration of AI for personalized guidance.
3. **Expanded Community Features**: More robust peer learning mechanisms.
4. **Advanced Analytics**: Deeper insights into journey progress and outcomes.

## Migration Path

Once the new journey system is fully tested and validated, it can replace the existing journey system. This can be done by:

1. Migrating existing company journey data to the new system.
2. Updating route paths to make the new system the default.
3. Providing user onboarding to highlight new features and capabilities.
