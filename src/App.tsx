import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';

// Layout components
import Layout from './components/Layout.tsx';
import CommunityRoutes from './routes/CommunityRoutes.tsx';

// Static (eagerly loaded) pages
import Dashboard from './pages/Dashboard.tsx';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import OnboardingPage from './pages/OnboardingPage';
import InitialOnboardingPage from './pages/InitialOnboardingPage';
import UserSettingsPage from './pages/UserSettingsPage';

import BusinessOperationsHubPage from './business-ops-hub/pages/BusinessOperationsHubPage';
import UnifiedTaskListPage from './business-ops-hub/pages/UnifiedTaskListPage';
import DomainDetail from './business-ops-hub/pages/DomainDetail';
import StepDetailPage from './components/company/journey/pages/StepDetailPage';
import BusinessOpsAnalyticsPage from './business-ops-hub/pages/BusinessOpsAnalyticsPage';
import BusinessOpsAutomationsPage from './business-ops-hub/pages/BusinessOpsAutomationsPage';

// Sprint 13-16 feature components
import TeamManager from './business-ops-hub/components/team/TeamManager';
import KnowledgeRepository from './business-ops-hub/components/knowledge/KnowledgeRepository';
import WorkspaceTemplateManager from './business-ops-hub/components/WorkspaceTemplateManager';
import ToolImplementationGuide from './business-ops-hub/components/ToolImplementationGuide';


// Idea Hub pages
const QuickGeneration = lazy(() => import('./pages/idea-hub/QuickGeneration'));
const Refinement = lazy(() => import('./pages/idea-hub/Refinement'));
const SavedIdeasPage = lazy(() => import('./pages/idea-hub/SavedIdeasPage'));
const CofounderBot = lazy(() => import('./pages/idea-hub/CofounderBot'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Import our AppProvider
import { AppProvider } from './lib/contexts/AppProvider';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import JourneyHomePage from './components/company/journey/pages/JourneyHomePage';

const App: React.FC = () => {
  return (
    <AppProvider captureErrors={true} displayErrors={true}>
      <TooltipProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public Test Pages */}
          <Route path="/journey-system-test" element={<JourneySystemTestPage />} />
          {/* Authentication & Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/initial-onboarding" element={<InitialOnboardingPage />} />
          <Route path="/onboarding-wizard" element={<OnboardingWizardPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />

          {/* Publicly accessible shared deck view */}
          <Route path="/deck/shared/:shareToken" element={<SharedDeckViewerPage />} />

          {/* Deck Preview Host Page - outside main Layout for true full-screen */}
          <Route path="deck-builder/preview/:deckId" element={<PrivateRoute />}> {/* Assuming preview requires auth */}
            <Route index element={<DeckPreviewHostPage />} />
          </Route>

          {/* Main Application */}
          {/* Visual Deck Builder route removed as UnifiedDeckBuilder is used via DeckEditPage and potentially a new deck route */}
          {/* 
          <Route element={<PrivateRoute />}>
            <Route path="visual-deck-builder" element={<VisualDeckBuilderPage />} />
          </Route> 
          */}

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="account-settings" element={<UserSettingsPage />} />
              <Route path="simplified-dashboard" element={<SimplifiedDashboard />} />
              
              {/* Business Operations Hub Routes */}
              <Route path="business-ops-hub" element={<BusinessOperationsHubPage />} />
              <Route path="business-ops-hub/tasks" element={<UnifiedTaskListPage />} />
              <Route path="business-ops-hub/analytics" element={<BusinessOpsAnalyticsPage />} />
              <Route path="business-ops-hub/automations" element={<BusinessOpsAutomationsPage />} />
              <Route path="business-ops-hub/team" element={<TeamManager />} />
              <Route path="business-ops-hub/knowledge" element={<KnowledgeRepository />} />
              <Route path="business-ops-hub/templates" element={<WorkspaceTemplateManager />} />
              <Route path="business-ops-hub/tool-guides" element={<ToolImplementationGuide />} />
              <Route path="business-ops-hub/domain/:domainId" element={<DomainDetail />} />
              <Route path="business-ops-hub/:domainId/steps/:stepId" element={<StepDetailPage />} />
              <Route path="business-ops-hub/:domainId" element={<DomainDetail />} />
              
              {/* Company Management */}
              <Route path="company">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="setup" element={<CompanySetup />} />
                <Route path="dashboard" element={<CompanyDashboard />} />
                {/* Removed dashboard-new route - using old refactored component */}
                <Route path="profile/:companyId" element={<CompanyProfilePage />} />

                {/* Redirect old journey routes to new journey */}
                <Route path="journey" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="journey/steps" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="journey/steps/:stepId" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="journey/map" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="journey/overview" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="journey/submit-step" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="journey/community-steps" element={<Navigate to="/company/new-journey" replace />} />
                <Route path="tools" element={<CompanyToolsPage />} />
                <Route path="tools/evaluation/:toolId" element={<CompanyToolEvaluationPage />} />
                <Route path="budget" element={<CompanyBudgetPage />} />
                <Route path="members" element={<CompanyMembersPage />} />
                <Route path="new-journey/*" element={<NewJourneyRouter />} />
              </Route>
              
              {/* Idea Hub */}
              <Route path="idea-hub">
                <Route index element={<IdeaHub />} />
                <Route path="enhanced" element={<EnhancedIdeaHubPage />} />
                <Route path="quick-generation" element={<QuickGeneration />} />
                <Route path="refinement" element={<Refinement />} />
                <Route path="saved" element={<SavedIdeasPage />} />
                <Route path="cofounder-bot" element={<CofounderBot />} />
                {/* <Route path="deck-builder" element={<DeckBuilderPage />} /> Phase 1 Deck Builder - REMOVED */}
              </Route>

              {/* Deck Builder - Unified routes */}
              <Route path="deck-builder">
                <Route index element={<Navigate to="library" replace />} />
                <Route path="library" element={<DeckLibraryPage />} />
                <Route path="edit/:deckId" element={<DeckEditPage />} />
                {/* preview/:deckId route moved outside Layout */}
              </Route>
              
              {/* Financial Hub */}
              <Route path="financial-hub" element={<FinancialHubPage />} />
              
              {/* Tools Marketplace */}
              <Route path="tools-marketplace" element={<ToolsMarketplacePage />} />
              
              {/* Analytics */}
              <Route path="analytics" element={<AnalyticsPage />} />
              
              {/* Community Section */}
              <Route path="community/*" element={<CommunityRoutes />} />
              
              {/* Admin Section */}
              <Route path="admin">
  <Route path="journey/phase-manager" element={<PhaseManager />} />
                <Route index element={<AdminPanel />} />
                <Route path="settings" element={<AdminAppSettingsPage />} />
                <Route path="tool-moderation" element={<AdminToolModerationPage />} />
                <Route path="journey-content" element={<AdminJourneyContentPage />} />
                <Route path="ask-wheel-requests" element={<AskWheelRequestsPage />} />
                <Route path="deck-insights" element={<DeckAdminDashboardPage />} /> {/* Added Deck Admin Route */}
                <Route path="community-submissions" element={<CommunitySubmissionsPage />} />
              </Route>
              
              {/* Demo & Development */}
              <Route path="deck-builder-reorg" element={<DeckBuilderReorgPage />} />
              <Route path="terminology-demo" element={<TerminologyDemoPage />} />
              <Route path="test-deck-builder" element={<TestDeckBuilderPage />} />
              <Route path="simple-drag-test" element={<SimpleDragTestPage />} />
              <Route path="manual-drag-test" element={<ManualDragTestPage />} />
              <Route path="journey-dashboard-demo" element={<JourneyDashboardDemo />} />
            </Route>
          </Route>
          
          {/* Temporary Error Route - For debugging only */}
          <Route path="route-not-found" element={
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
              <h1 className="text-2xl font-semibold text-red-600 mb-4">Route Not Found</h1>
              <p className="mb-4 text-center">The route you are trying to access is not defined in the router.</p>
              <p className="text-sm bg-gray-100 p-4 rounded mb-4 max-w-md overflow-auto" id="attempted-route"></p>
              <button onClick={() => window.history.back()} className="px-4 py-2 bg-blue-500 text-white rounded">
                Go Back
              </button>
              <script dangerouslySetInnerHTML={{__html: `
                document.getElementById('attempted-route').textContent = 'Attempted path: ' + window.location.pathname;
              `}}/>
            </div>
          } />

      {/* New Journey System */}

      {/* Redirect standalone journey routes to new journey */}
      <Route path="/journey" element={<Navigate to="/company/new-journey" replace />} />
      <Route path="/journey/step/:stepId" element={<Navigate to="/company/new-journey/company-step/:stepId" replace />} />
      <Route path="/journey/map" element={<Navigate to="/company/new-journey" replace />} />
          
          {/* Fallback for unknown routes - temporary error page */}
          <Route path="*" element={<Navigate to="/route-not-found" replace />} />
        </Routes>
      </Suspense>
      </TooltipProvider>
    </AppProvider>
  );
};

export default App;
