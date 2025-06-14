import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import NewJourneyDashboard from './pages/NewJourneyDashboard';
import NewJourneyDashboardOption3 from './pages/NewJourneyDashboardOption3';
import NewJourneyDashboardOption4 from './pages/NewJourneyDashboardOption4';
import BrowseStepsPage from './pages/BrowseStepsPage';
import StepDetailPage from './pages/StepDetailPage';
import DomainDetailPage from './pages/DomainDetailPage';
import StepRedirectHandler from './components/StepRedirectHandler';

/**
 * Main router component for the New Journey system.
 * Handles navigation between different journey pages and dashboard layouts.
 * The NewJourneyDashboard acts as a layout for the different dashboard options.
 */
const NewJourneyRouter: React.FC = () => {
  return (
    <Routes>
      {/* Main dashboard container */}
      <Route path="/" element={<NewJourneyDashboard />}>
        {/* Default to Option 3 */}
        <Route index element={<Navigate to="option3" replace />} />
        <Route path="option3" element={<NewJourneyDashboardOption3 />} />
        <Route path="option4" element={<NewJourneyDashboardOption4 />} />
      </Route>
      
      {/* Other journey pages */}
      <Route path="/browse" element={<BrowseStepsPage />} />
      
      {/* Step routes with type distinction */}
      <Route path="/step/:stepId" element={<StepRedirectHandler />} />
      <Route path="/template-step/:stepId" element={<StepDetailPage mode="template" />} />
      <Route path="/company-step/:stepId" element={<StepDetailPage mode="company" />} />
      
      <Route path="/domain/:domainName" element={<DomainDetailPage />} />
      
      {/* Fallback redirect for any unmatched paths within the journey system */}
      <Route path="*" element={<Navigate to="/company/new-journey" replace />} />
    </Routes>
  );
};

export default NewJourneyRouter;
