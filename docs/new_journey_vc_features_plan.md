# New Journey System: VC Features Implementation Plan

This document provides the complete technical specification for the VC Portfolio Management features, as outlined in the MRD (Section 2.3.7). This module is designed to be built on top of the core Journey System foundation.

## 1. Guiding Principles

- **Privacy First**: All data aggregation will be privacy-preserving. VCs will only see the level of detail that their portfolio companies have explicitly granted them permission to see.
- **Actionable Insights**: The dashboard will focus on providing VCs with actionable data, such as identifying at-risk companies or highlighting portfolio-wide trends, rather than just raw data.
- **Modular Architecture**: The VC features will be built as a separate, self-contained module (`src/components/vc/new_journey/`) that consumes its own dedicated service.

---

## 2. Backend Architecture

### 2.1. Database Schema
The following tables, defined in `new_journey_database_backend_plan.md`, will support this module:

- **`vc_portfolios_new`**: This table maps VC firms to the companies in their portfolio and defines the data sharing level for each relationship.
- **`vc_portfolio_insights_new`**: This table will store pre-aggregated, anonymized data for a VC's entire portfolio to ensure fast dashboard loads and maintain privacy. This table will be populated by a scheduled job.

### 2.2. VC Portfolio Service

A dedicated service will be created to handle all logic related to the VC features.

**File**: `src/lib/services/new_journey/new_vc_portfolio.service.ts`

- **Responsibility**: To fetch and aggregate data for the VC dashboard in a secure and privacy-compliant manner.
- **Key Methods**:
    - `getPortfolioOverview(vcFirmId)`:
        1.  Fetches the list of companies associated with the `vcFirmId` from `vc_portfolios_new`.
        2.  For each company, it fetches high-level progress metrics (e.g., overall completion percentage, number of active steps) from `company_journeys_new`, respecting the `data_sharing_level`.
        3.  Returns a list of companies with their high-level progress.
    - `getAggregatedPortfolioInsights(vcFirmId)`:
        1.  Fetches the latest pre-calculated insights from the `vc_portfolio_insights_new` table.
        2.  This ensures the dashboard loads quickly and does not require heavy, on-the-fly calculations.
    - `generatePortfolioInsights(vcFirmId)`:
        1.  **This method will be run by a scheduled background job (e.g., nightly).**
        2.  It iterates through all companies in a VC's portfolio.
        3.  It calculates aggregated metrics (e.g., average progress by domain, number of companies with stalled steps).
        4.  It identifies risk indicators (e.g., companies with low confidence scores on recent outcomes).
        5.  It saves this aggregated data to the `vc_portfolio_insights_new` table.

---

## 3. Frontend Architecture

The entire VC-facing UI will be built in a new, separate directory.

**Directory**: `src/components/vc/new_journey/`

```
src/components/vc/new_journey/
├── VCPortfolioRouter.tsx      # Main router for the VC module

├── pages/
│   └── VCPortfolioDashboard.tsx # The main dashboard for VCs

└── components/
    ├── PortfolioOverviewTable.tsx # Table showing all companies and their high-level progress
    ├── RiskIndicatorsPanel.tsx    # Panel highlighting at-risk companies
    └── BenchmarkingCharts.tsx     # Charts comparing companies against portfolio averages
```

### Component Specifications:

- **`pages/VCPortfolioDashboard.tsx`**:
    - **Responsibility**: The main container page for the VC view.
    - **Data Fetching**: Calls `new_vc_portfolio.service.ts` to get the overview and aggregated insights.
    - **Children**: `PortfolioOverviewTable`, `RiskIndicatorsPanel`, `BenchmarkingCharts`.

- **`components/PortfolioOverviewTable.tsx`**:
    - **Props**: `companies: CompanyProgress[]`
    - **Responsibility**: Displays a table of all portfolio companies, their overall progress percentage, and a link to a (future) detailed view.

- **`components/RiskIndicatorsPanel.tsx`**:
    - **Props**: `riskIndicators: { stalled_steps: number, low_confidence: number }`
    - **Responsibility**: Shows high-level alerts, such as "5 companies have steps that have been active for over 30 days."

---

## 4. Future Implementation Sprint Plan (Post-MVP)

The implementation of this module is planned as a fast-follow after the core Journey System is launched and stable.

### Week 1: Backend Service & Data Job
- **Task**: Implement `new_vc_portfolio.service.ts` and set up the scheduled job to run `generatePortfolioInsights` nightly.

### Week 2: Frontend Components
- **Task**: Build all the frontend components (`VCPortfolioDashboard`, `PortfolioOverviewTable`, etc.) and the router.

### Week 3: Integration & Testing
- **Task**: Connect the frontend components to the backend service, perform end-to-end testing, and prepare for a beta launch with a select group of VCs.

This plan ensures that the VC features can be developed independently without impacting the core founder-facing journey system, while still being built on the same robust and scalable foundation.
