/**
 * Dashboard Analytics Service
 * Provides cross-domain intelligence, company-level recommendations, blockers, and risk surfacing.
 * To be connected to real backend analytics in future sprints.
 */

export interface CompanySummary {
  completed: number;
  atRisk: number;
  blocked: number;
  urgent: number;
}

export interface Recommendation {
  message: string;
}

export interface Blocker {
  item: string;
  reason: string;
}

export interface RiskItem {
  item: string;
  reason: string;
}

const dashboardAnalyticsService = {
  /**
   * Get macro company progress summary
   */
  async getCompanySummary(companyId: string): Promise<CompanySummary> {
    // TODO: Replace with real backend aggregation
    return {
      completed: 42,
      atRisk: 3,
      blocked: 2,
      urgent: 5,
    };
  },

  /**
   * Get company-wide recommendations
   */
  async getCompanyRecommendations(companyId: string): Promise<Recommendation[]> {
    // TODO: Replace with real backend logic
    return [
      { message: "Address overdue compliance review in Finance domain." },
      { message: "Resolve cross-domain blocker: Marketing launch depends on Product milestone." },
      { message: "Review skipped onboarding steps in HR domain." },
    ];
  },

  /**
   * Get cross-domain blockers
   */
  async getCompanyBlockers(companyId: string): Promise<Blocker[]> {
    // TODO: Replace with real backend logic
    return [
      { item: "Product: Feature X", reason: "Blocked by pending legal approval" },
      { item: "Finance: Q2 Budget", reason: "Awaiting executive sign-off" },
    ];
  },

  /**
   * Get skipped or risky items for adaptive guidance
   */
  async getCompanyRisks(companyId: string): Promise<RiskItem[]> {
    // TODO: Replace with real backend logic
    return [
      { item: "HR: Employee Onboarding", reason: "3 steps skipped, risk of non-compliance" },
      { item: "IT: Security Audit", reason: "Delayed, may impact certification" },
    ];
  }
};

export default dashboardAnalyticsService;
