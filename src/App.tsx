import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import Directory from './pages/Directory';
import CofounderBot from './pages/idea-hub/CofounderBot';
import AIDiscussion from './pages/idea-hub/AIDiscussion';
import MarketValidation from './pages/idea-hub/MarketValidation';
import BusinessModel from './pages/idea-hub/BusinessModel';
import PitchDeck from './pages/idea-hub/PitchDeck';
import IdeaCanvas from './pages/idea-hub/IdeaCanvas';
import TestComponent from './pages/idea-hub/TestComponent';
import TestPage from './pages/TestPage';
import AdminPanel from './pages/AdminPanel';
import CompanySetup from './pages/company/CompanySetup';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanySettings from './pages/company/CompanySettings';
import IdeaHub from './pages/IdeaHub';
import TaskCreation from './components/tasks/TaskCreation';
import Refinement from './pages/idea-hub/Refinement';
import Community from './pages/Community';
import Messages from './pages/Messages';
import Layout from './components/Layout';
import GoogleCallback from './pages/auth/GoogleCallback';
// Import new idea exploration pages
import ExplorationHub from './pages/idea-hub/ExplorationHub';
import IdeaDetailPage from './pages/idea-hub/IdeaDetailPage';
import IdeaComparisonPage from './pages/idea-hub/IdeaComparisonPage';
import IdeaMergerPage from './pages/idea-hub/IdeaMergerPage';
import UnifiedWorkflow from './pages/idea-hub/UnifiedWorkflow';
import './lib/services/localStorage-cleaner';
import { AIContextProvider as AIProvider } from './lib/services/ai/ai-context-provider';
// Dynamic imports for components that might have path issues
// Import the actual IdeaPlaygroundPage component
const IdeaPlaygroundPage = React.lazy(() => import('./pages/idea-playground/IdeaPlaygroundPage'));
const PathwayRouter = React.lazy(() => import('./pages/idea-playground/PathwayRouter'));
const StandupTestPage = React.lazy(() => import('./pages/StandupTestPageWrapper'));
const OnboardingWizardExamples = React.lazy(() => import('./examples/OnboardingWizardExamples'));

function App() {
  const { user, profile } = useAuthStore();

  // If user is not logged in, show login page, test page, refinement page, or unified workflow page
  if (!user) {
    return (
      <AIProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/idea-hub/refinement" element={
            <div className="min-h-screen bg-gray-100">
              <Refinement />
            </div>
          } />
          <Route path="/idea-hub/unified" element={
            <div className="min-h-screen bg-gray-100">
              <UnifiedWorkflow />
            </div>
          } />
          <Route path="/idea-hub/playground" element={
            <div className="min-h-screen bg-gray-100">
              <React.Suspense fallback={<div>Loading...</div>}>
                <IdeaPlaygroundPage />
              </React.Suspense>
            </div>
          } />
          <Route path="/idea-hub/playground/pathway/*" element={
    <div className="min-h-screen bg-gray-100">
      <React.Suspense fallback={<div>Loading...</div>}>
        <PathwayRouter />
      </React.Suspense>
    </div>
  } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AIProvider>
    );
  }

  // If user is logged in but hasn't completed profile setup and isn't on the setup page,
  // redirect to setup
  if (!profile?.full_name && window.location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return (
    <AIProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="directory" element={<Directory />} />
            <Route path="messages" element={<Messages />} />
            <Route path="tasks">
              <Route path="new" element={<TaskCreation />} />
              <Route path="new/company" element={<TaskCreation isCompanyView />} />
            </Route>
            <Route path="community" element={<Community />} />
            <Route path="idea-hub">
              <Route index element={<IdeaHub />} />
              <Route path="cofounder-bot" element={<CofounderBot />} />
              <Route path="refinement" element={<Refinement />} />
              <Route path="ai-discussion" element={<AIDiscussion />} />
              <Route path="market-validation" element={<MarketValidation />} />
              <Route path="business-model" element={<BusinessModel />} />
              <Route path="pitch-deck" element={<PitchDeck />} />
              <Route path="canvas" element={<IdeaCanvas />} />
              <Route path="test" element={<TestComponent />} />
              {/* New Idea Exploration Routes */}
              <Route path="explore" element={<ExplorationHub />} />
              <Route path="idea/:ideaId" element={<IdeaDetailPage />} />
              <Route path="compare" element={<IdeaComparisonPage />} />
              <Route path="merge" element={<IdeaMergerPage />} />
              <Route path="unified" element={<UnifiedWorkflow />} />
              <Route path="playground">
                <Route index element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <IdeaPlaygroundPage />
                  </React.Suspense>
                } />
                <Route path="pathway/*" element={
    <React.Suspense fallback={<div>Loading...</div>}>
      <PathwayRouter />
    </React.Suspense>
  } />
              </Route>
            </Route>
            <Route path="company">
              <Route path="setup" element={<CompanySetup />} />
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="settings" element={<CompanySettings />} />
            </Route>
            <Route path="admin" element={<AdminPanel />} />
            <Route path="standup-test" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <StandupTestPage />
              </React.Suspense>
            } />
            <Route path="onboarding-examples" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <OnboardingWizardExamples />
              </React.Suspense>
            } />
          </Route>
        </Routes>
      </div>
    </AIProvider>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuthStore();
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to profile setup if profile is incomplete
  if (!profile?.full_name) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}

export default App;
