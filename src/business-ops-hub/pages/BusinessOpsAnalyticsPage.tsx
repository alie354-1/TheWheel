import React from "react";
import JourneyAnalyticsDashboard from "../../components/company/journey/LegacyAnalytics/LegacyJourneyAnalyticsDashboard.tsx";

/**
 * Business Operations Hub Analytics Dashboard Page
 * Reuses the JourneyAnalyticsDashboard for BOH analytics.
 */
const BusinessOpsAnalyticsPage: React.FC = () => {
  // In a real app, get companyId from context or route params
  const companyId = "demo-company-id";

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Business Operations Analytics</h1>
      <JourneyAnalyticsDashboard companyId={companyId} timeRange="month" showPredictions={true} />
    </div>
  );
};

export default BusinessOpsAnalyticsPage;
