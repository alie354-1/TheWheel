import React from 'react';
import { Route, Routes } from 'react-router-dom';
import JourneyDashboard from './pages/JourneyDashboard';
// Import other pages as they are created
// import BrowseStepsPage from './pages/BrowseStepsPage';
// import StepDetailPage from './pages/StepDetailPage';

const JourneyRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<JourneyDashboard />} />
      {/* <Route path="/browse" element={<BrowseStepsPage />} /> */}
      {/* <Route path="/step/:stepId" element={<StepDetailPage />} /> */}
    </Routes>
  );
};

export default JourneyRouter;
