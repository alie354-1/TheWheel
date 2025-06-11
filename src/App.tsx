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
import Profile from './pages/Profile.tsx';
import ProfileSetup from './pages/ProfileSetup.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import InitialOnboardingPage from './pages/InitialOnboardingPage.tsx';
import UserSettingsPage from './pages/UserSettingsPage.tsx';

import BusinessOperationsHubPage from './business-ops-hub/pages/BusinessOperationsHubPage.tsx';
import UnifiedTaskListPage from './business-ops-hub/pages/UnifiedTaskListPage.tsx';
import DomainDetail from './business-ops-hub/pages/DomainDetail.tsx';
import StepDetailPage from './components/company/journey/pages/StepDetailPage.tsx';
import BusinessOpsAnalyticsPage from './business-ops-hub/pages/BusinessOpsAnalyticsPage.tsx';
import BusinessOpsAutomationsPage from './business-ops-hub/pages/BusinessOpsAutomationsPage.tsx';

// Sprint 13-16 feature components
import TeamManager from './business-ops-hub/components/team/TeamManager.tsx';
import KnowledgeRepository from './business-ops-hub/components/knowledge/KnowledgeRepository.tsx';
import WorkspaceTemplateManager from './business-ops-hub/components/WorkspaceTemplateManager.tsx';
import ToolImplementationGuide from './business-ops-hub/components/ToolImplementationGuide.tsx';

// Test pages
const TestDeckBuilderPage = lazy(() => import('./pages/TestDeckBuilderPage.tsx'));
const SimpleDragTestPage = lazy(() => import('./pages/SimpleDragTestPage.tsx'));
const ManualDragTestPage = lazy(() => import('./pages/ManualDragTestPage.tsx'));

// Lazily loaded pages for better initial load performance
const IdeaHub = lazy(() => import('./pages/IdeaHub.tsx'));
const EnhancedIdeaHubPage = lazy(() => import('./pages/EnhancedIdeaHubPage.tsx'));
// const DeckBuilderPage = lazy(() => import('./pages/DeckBuilderPage.tsx')); // Phase 1 Deck Builder - REMOVED
// const VisualDeckBuilderPage = lazy(() => import('./pages/VisualDeckBuilderPage.tsx')); // Visual Deck Builder - REMOVED
const DeckLibraryPage = lazy(() => import('./deck-builder/pages/DeckLibraryPage.tsx')); // Phase 2 Deck Library
const DeckEditPage = lazy(() => import('./deck-builder/pages/DeckEditPage.tsx')); // Phase 2 Deck Edit
// const DeckPreviewPage = lazy(() => import('./deck-builder/pages/DeckPreviewPage.tsx')); // Phase 2 Deck Preview - REPLACED
const DeckPreviewHostPage = lazy(() => import('./deck-builder/pages/DeckPreviewHostPage.tsx')); // New Preview Host Page
const SharedDeckViewerPage = lazy(() => import('./pages/SharedDeckViewerPage.tsx')); // Added for Unified Sharing
const OnboardingWizardPage = lazy(() => import('./pages/OnboardingWizardPage.tsx'));
const CompanySetup = lazy(() => import('./pages/company/CompanySetup.tsx'));
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard.tsx'));
const RefactoredCompanyDashboard = lazy(() => import('./pages/company/RefactoredCompanyDashboard.tsx'));
const CompanyBudgetPage = lazy(() => import('./pages/company/CompanyBudgetPage.tsx'));
const CompanyMembersPage = lazy(() => import('./pages/company/CompanyMembersPage.tsx'));
const CompanyProfilePage = lazy(() => import('./pages/company/CompanyProfilePage.tsx'));
const JourneyPage = lazy(() => import('./pages/company/JourneyPage.tsx'));
const RefactoredJourneyPage = lazy(() => import('./pages/company/RefactoredJourneyPage.tsx'));
const JourneyStepsPage = lazy(() => import('./pages/company/JourneyStepsPage.tsx'));
const JourneyStepPage = lazy(() => import('./pages/company/JourneyStepPage.tsx'));
const JourneyMapPage = lazy(() => import('./pages/company/JourneyMapPage.tsx'));
const JourneyOverviewPage = lazy(() => import('./pages/company/JourneyOverviewPage.tsx'));
const CompanyToolsPage = lazy(() => import('./pages/company/CompanyToolsPage.tsx'));
const CompanyToolEvaluationPage = lazy(() => import('./pages/company/CompanyToolEvaluationPage.tsx'));
const FinancialHubPage = lazy(() => import('./pages/FinancialHubPage.tsx'));
const ToolsMarketplacePage = lazy(() => import('./pages/ToolsMarketplacePage.tsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.tsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.tsx'));
const AdminAppSettingsPage = lazy(() => import('./pages/AdminAppSettingsPage.tsx'));
const AdminToolModerationPage = lazy(() => import('./pages/AdminToolModerationPage.tsx'));
const AdminJourneyContentPage = lazy(() => import('./pages/AdminJourneyContentPage.tsx'));
const AskWheelRequestsPage = lazy(() => import('./pages/admin/AskWheelRequestsPage.tsx'));
const DeckAdminDashboardPage = lazy(() => import('./pages/admin/DeckAdminDashboardPage.tsx')); // Added for Deck Admin
const TerminologyDemoPage = lazy(() => import('./pages/TerminologyDemoPage.tsx'));
const SimplifiedDashboard = lazy(() => import('./pages/SimplifiedDashboard.tsx'));

// Idea Hub pages
const QuickGeneration = lazy(() => import('./pages/idea-hub/QuickGeneration.tsx'));
const Refinement = lazy(() => import('./pages/idea-hub/Refinement.tsx'));
const SavedIdeasPage = lazy(() => import('./pages/idea-hub/SavedIdeasPage.tsx'));
const CofounderBot = lazy(() => import('./pages/idea-hub/CofounderBot.tsx'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Import our AppProvider
import { AppProvider } from './lib/contexts/AppProvider.tsx';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import JourneyHomePage from './components/company/journey/pages/JourneyHomePage.tsx';

const App: React.FC = () => {
  return (
    <AppProvider captureErrors={true} displayErrors={true}>
      <TooltipProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
                <Route path="dashboard-new" element={<RefactoredCompanyDashboard />} />
                <Route path="profile/:companyId" element={<CompanyProfilePage />} />

                <Route path="journey" element={<JourneyHomePage companyId="default" />} />
                <Route path="journey-new" element={<RefactoredJourneyPage />} />
                <Route path="journey/steps" element={<JourneyStepsPage />} />
                <Route path="journey/steps/:stepId" element={<JourneyStepPage />} />
                <Route path="journey/map" element={<JourneyMapPage />} />
                <Route path="journey/overview" element={<JourneyOverviewPage />} />
                <Route path="tools" element={<CompanyToolsPage />} />
                <Route path="tools/evaluation/:toolId" element={<CompanyToolEvaluationPage />} />
                <Route path="budget" element={<CompanyBudgetPage />} />
                <Route path="members" element={<CompanyMembersPage />} />
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
                <Route index element={<AdminPanel />} />
                <Route path="settings" element={<AdminAppSettingsPage />} />
                <Route path="tool-moderation" element={<AdminToolModerationPage />} />
                <Route path="journey-content" element={<AdminJourneyContentPage />} />
                <Route path="ask-wheel-requests" element={<AskWheelRequestsPage />} />
                <Route path="deck-insights" element={<DeckAdminDashboardPage />} /> {/* Added Deck Admin Route */}
              </Route>
              
              {/* Demo & Development */}
              <Route path="terminology-demo" element={<TerminologyDemoPage />} />
              <Route path="test-deck-builder" element={<TestDeckBuilderPage />} />
              <Route path="simple-drag-test" element={<SimpleDragTestPage />} />
              <Route path="manual-drag-test" element={<ManualDragTestPage />} />
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

      <Route path="/journey" element={<JourneyHomePage companyId="default" />} />
          <Route path="/journey/step/:stepId" element={<StepDetailPage />} />
          <Route path="/journey/map" element={<JourneyMapPage />} />
          
          {/* Fallback for unknown routes - temporary error page */}
          <Route path="*" element={<Navigate to="/route-not-found" replace />} />
        </Routes>
      </Suspense>
      </TooltipProvider>
    </AppProvider>
  );
};

export default App;
