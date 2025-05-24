import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Infrastructure and Providers
import { AppProvider } from './lib/contexts/AppProvider';
import { NotificationManager } from './components/feedback';

// Layout and Core Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RefactoredDashboard from './pages/RefactoredDashboard';
import Profile from './pages/Profile';
import RefactoredProfile from './pages/RefactoredProfile';
import CompanyDashboard from './pages/company/CompanyDashboard';
import RefactoredCompanyDashboard from './pages/company/RefactoredCompanyDashboard';
import JourneyPage from './pages/company/JourneyPage';
import RefactoredJourneyPage from './pages/company/RefactoredJourneyPage';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <AppProvider captureErrors={true} displayErrors={true}>
      {/* Notification Manager - positioned above everything else */}
      <NotificationManager />
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard-new" element={<RefactoredDashboard />} />
              
              {/* Profile */}
              <Route path="profile" element={<Profile />} />
              <Route path="profile-new" element={<RefactoredProfile />} />
              
              {/* Company Routes */}
              <Route path="company">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="dashboard-new" element={<RefactoredCompanyDashboard />} />
                <Route path="journey" element={<JourneyPage />} />
                <Route path="journey-new" element={<RefactoredJourneyPage />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppProvider>
  );
};

export default App;