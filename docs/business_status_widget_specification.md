# Business Status Widget Specification

## Overview

The Business Status Widget replaces the current "Journey Engagement" section in the New Journey Dashboard. This widget implements the philosophy that "the startup journey is never complete" by showing business domains as evolving areas of focus rather than steps to be completed.

## Core Philosophy

- **Continuous Evolution**: There are no "complete" domains in business, only varying levels of maturity and focus
- **Dynamic Attention Shifts**: Founders naturally shift focus between domains based on current needs
- **Pattern Recognition**: Similar companies follow natural rhythms of attention to different areas
- **AI-Enhanced Understanding**: Provides insights based on company patterns and industry data

## Widget Structure

### 1. Active Areas Section

Shows business domains currently receiving active attention, with clear descriptions of current activities.

**Example**:
```
Customer Research: Daily activity, conducting interviews
• AI Insight: Interview frequency increased 40% vs typical early-stage pattern
• Suggested: Consider systematizing feedback collection

Product Development: Regular progress, building core features  
• AI Insight: Development velocity matches 70th percentile for seed-stage startups
• Suggested: Architecture decisions upcoming - review technical debt patterns

Marketing Strategy: Recently started, exploring channels
• AI Insight: Channel exploration timing aligns with successful PMF companies
• Suggested: A/B testing framework recommended based on similar company patterns
```

### 2. Background Operations Section

Shows business domains that are running in the background with minimal active attention, but that are still important to maintain.

**Example**:
```
Operations: Running smoothly, weekly check-ins
• AI Insight: Current operational load sustainable for next 8 weeks
• Pattern Alert: Similar companies typically need operations focus at 25-employee mark

Legal: Handled, quarterly reviews scheduled  
• AI Insight: IP protection gaps detected based on product development activity
• Suggested: Patent review recommended within 90 days

Fundraising: Paused, will restart when needed
• AI Insight: Based on burn rate and milestones, funding runway until Q3 2025
• Pattern Match: 73% of similar companies start fundraising 6 months before runway end
```

### 3. AI Business Analysis Section

Provides high-level AI analysis of overall business activity and balance, identifying potential risks, opportunities, and patterns.

**Example**:
```
Attention Balance: Currently well-distributed across growth areas
Risk Alert: Operations may become bottleneck if customer research leads to rapid scaling  
Opportunity: Marketing timing optimal - competitors in your space average 3-month delay
Pattern Match: Your focus sequence matches successful Series A companies 82% of time
```

### 4. Upcoming Shifts Section

Shows predicted or planned shifts in business focus based on current patterns and industry data.

**Example**:
```
Next 2 weeks: Marketing strategy moving from exploration to execution
Next month: Operations will need dedicated attention (hiring, systems)
Next quarter: Fundraising preparation recommended based on milestone trajectory
AI Prediction: Customer research will naturally decrease as product validation increases
```

## Technical Implementation

### Component Structure

1. `BusinessStatusWidget.tsx` - Main component
   - `ActiveAreasSection.tsx` - Subcomponent for active domains
   - `BackgroundOperationsSection.tsx` - Subcomponent for background domains
   - `AIBusinessAnalysisSection.tsx` - Subcomponent for AI analysis
   - `UpcomingShiftsSection.tsx` - Subcomponent for upcoming changes

### Data Model

```typescript
interface DomainActivity {
  domain: string;
  activityLevel: 'high' | 'medium' | 'low' | 'dormant';
  currentActivity: string;
  maturityLevel: 'exploring' | 'learning' | 'practicing' | 'refining' | 'teaching';
  aiInsights: {
    observation: string;
    suggestion?: string;
    alert?: string;
  }[];
}

interface AIAnalysis {
  balanceAssessment: string;
  riskAlerts: string[];
  opportunities: string[];
  patternMatches: string[];
}

interface UpcomingShift {
  timeframe: string;
  description: string;
  isPrediction: boolean;
}

interface BusinessStatusData {
  activeDomains: DomainActivity[];
  backgroundDomains: DomainActivity[];
  aiAnalysis: AIAnalysis;
  upcomingShifts: UpcomingShift[];
}
```

### Integration Points

1. **Data Sources**:
   - `useCompanyProgress` hook - For maturity levels and engagement data
   - `newJourneyAI.service.ts` - For AI insights and pattern matching
   - Activity tracking system (future enhancement) - For time/activity metrics

2. **Dashboard Integration**:
   - Replace the current Journey Engagement section in `NewJourneyDashboard.tsx`
   - Maintain consistent styling with other dashboard components

### Visual Design

- Clean, modern interface consistent with existing dashboard
- Color coding for activity levels (high: blue, medium: green, low: gray, dormant: light gray)
- Collapsible sections for each category to manage information density
- Icons to represent different domains and activity types
- Visual indicators for AI insights (lightbulb), alerts (warning), and suggestions (checkmark)

## Implementation Plan

1. Create BusinessStatusWidget component and subcomponents
2. Implement mock data model for initial testing
3. Replace Journey Engagement section in NewJourneyDashboard
4. Add AI analysis functionality and real data integration (future)

## Acceptance Criteria

- Widget accurately displays domains by activity level
- Language consistently reflects continuous evolution rather than completion
- AI insights are clearly distinguished from factual data
- Visual design matches overall dashboard aesthetic
- Mobile responsive design works on all screen sizes
