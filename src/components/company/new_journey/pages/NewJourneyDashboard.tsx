import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import DashboardOptionsNav from '../components/DashboardOptionsNav';

/**
 * A shell component to host the dashboard options and render the selected one.
 * This component will be the main entry point for `/company/new-journey`.
 */
const NewJourneyDashboard: React.FC = () => {
  const location = useLocation();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">New Journey Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select a layout below or navigate to a specific dashboard.
          </p>
        </header>
        
        {/* Navigation to switch between dashboard options */}
        <DashboardOptionsNav currentPath={location.pathname} />
        
        {/* This will render the nested route component (e.g., Option3 or Option4) */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default NewJourneyDashboard;
