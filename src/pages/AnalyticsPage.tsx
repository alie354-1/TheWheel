import React from 'react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
// Layout is handled by the router configuration (e.g., App.tsx)

/**
 * Page component for displaying the Analytics Dashboard.
 * This component will be rendered within the main Layout via React Router's <Outlet />.
 */
const AnalyticsPage: React.FC = () => {
  // TODO: Add logic to determine company context if needed, or pass relevant props
  // const companyId = useCurrentCompanyId(); // Example hook

  return (
    <AnalyticsDashboard /* companyId={companyId} */ />
  );
};

export default AnalyticsPage;
