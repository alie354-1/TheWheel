import React from "react";

/**
 * Business Operations Hub Analytics Dashboard Page
 * Legacy analytics dashboard has been deprecated and removed.
 */
const BusinessOpsAnalyticsPage: React.FC = () => {
  // In a real app, get companyId from context or route params
  // const companyId = "demo-company-id";

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Business Operations Analytics</h1>
      {/* Legacy analytics dashboard has been removed */}
      <p>The analytics dashboard feature is currently unavailable.</p>
    </div>
  );
};

export default BusinessOpsAnalyticsPage;
