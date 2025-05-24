import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

// Layout components
import Layout from './components/Layout';

// Static (eagerly loaded) pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import OnboardingPage from './pages/OnboardingPage';
import InitialOnboardingPage from './pages/InitialOnboardingPage';

import BusinessOperationsHubPage from './business-ops-hub/pages/BusinessOperationsHubPage';
import UnifiedTaskListPage from './business-ops-hub/pages/UnifiedTaskListPage';
import DomainDetail from './business-ops-hub/pages/DomainDetail';
import StepDetailPage from './business-ops-hub/pages/StepDetailPage';
import BusinessOpsAnalyticsPage from './business-ops-hub/pages/BusinessOpsAnalyticsPage';
import BusinessOpsAutomationsPage from './business-ops-hub/pages/BusinessOpsAutomationsPage';

// Sprint 13-16 feature components
import TeamManager from './business-ops-hub/components/team/TeamManager';
import KnowledgeRepository from './business-ops-hub/components/knowledge/KnowledgeRepository';
import WorkspaceTemplateManager from './business-ops-hub/components/WorkspaceTemplateManager';
import ToolImplementationGuide from './business-ops-hub/components/ToolImplementationGuide';

// Lazily loaded pages for better initial load performance
const IdeaHub = lazy(() => import('./pages/IdeaHub'));
const EnhancedIdeaHubPage = lazy(() => import('./pages/EnhancedIdeaHubPage'));
const DeckBuilderPage = lazy(() => import('./pages/DeckBuilderPage')); // Phase 1 Deck Builder
const DeckLibraryPage = lazy(() => import('./deck-builder/pages/DeckLibraryPage')); // Phase 2 Deck Library
const DeckEditPage = lazy(() => import('./deck-builder/pages/DeckEditPage')); // Phase 2 Deck Edit
const OnboardingWizardPage = lazy(() => import('./pages/OnboardingWizardPage'));
const CompanySetup = lazy(() => import('./pages/company/CompanySetup'));
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const RefactoredCompanyDashboard = lazy(() => import('./pages/company/RefactoredCompanyDashboard'));
const CompanyBudgetPage = lazy(() => import('./pages/company/CompanyBudgetPage'));
const CompanyMembersPage = lazy(() => import('./pages/company/CompanyMembersPage'));
const CompanyProfilePage = lazy(() => import('./pages/company/CompanyProfilePage'));
const JourneyPage = lazy(() => import('./pages/company/JourneyPage'));
const RefactoredJourneyPage = lazy(() => import('./pages/company/RefactoredJourneyPage'));
const JourneyStepsPage = lazy(() => import('./pages/company/JourneyStepsPage'));
const JourneyStepPage = lazy(() => import('./pages/company/JourneyStepPage'));
const JourneyMapPage = lazy(() => import('./pages/company/JourneyMapPage'));
const JourneyOverviewPage = lazy(() => import('./pages/company/JourneyOverviewPage'));
const CompanyToolsPage = lazy(() => import('./pages/company/CompanyToolsPage'));
const CompanyToolEvaluationPage = lazy(() => import('./pages/company/CompanyToolEvaluationPage'));
const FinancialHubPage = lazy(() => import('./pages/FinancialHubPage'));
const ToolsMarketplacePage = lazy(() => import('./pages/ToolsMarketplacePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminAppSettingsPage = lazy(() => import('./pages/AdminAppSettingsPage'));
const AdminToolModerationPage = lazy(() => import('./pages/AdminToolModerationPage'));
const AdminJourneyContentPage = lazy(() => import('./pages/AdminJourneyContentPage'));
const AskWheelRequestsPage = lazy(() => import('./pages/admin/AskWheelRequestsPage'));
const TerminologyDemoPage = lazy(() => import('./pages/TerminologyDemoPage'));
const SimplifiedDashboard = lazy(() => import('./pages/SimplifiedDashboard'));

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

const App: React.FC = () => {
  return (
    <AppProvider captureErrors={true} displayErrors={true}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          {/* Authentication & Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/initial-onboarding" element={<InitialOnboardingPage />} />
          <Route path="/onboarding-wizard" element={<OnboardingWizardPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />

          {/* Main Application */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
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
                <Route path="journey" element={<JourneyPage />} />
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
                <Route path="deck-builder" element={<DeckBuilderPage />} /> {/* Phase 1 Deck Builder */}
              </Route>

              {/* Deck Builder - Phase 2 */}
              <Route path="deck-builder">
                <Route index element={<Navigate to="library" replace />} />
                <Route path="library" element={<DeckLibraryPage />} />
                <Route path="edit/:deckId" element={<DeckEditPage />} />
                <Route path="preview/:deckId" element={<DeckEditPage />} />
              </Route>
              
              {/* Financial Hub */}
              <Route path="financial-hub" element={<FinancialHubPage />} />
              
              {/* Tools Marketplace */}
              <Route path="tools-marketplace" element={<ToolsMarketplacePage />} />
              
              {/* Analytics */}
              <Route path="analytics" element={<AnalyticsPage />} />
              
              {/* Admin Section */}
              <Route path="admin">
                <Route index element={<AdminPanel />} />
                <Route path="settings" element={<AdminAppSettingsPage />} />
                <Route path="tool-moderation" element={<AdminToolModerationPage />} />
                <Route path="journey-content" element={<AdminJourneyContentPage />} />
                <Route path="ask-wheel-requests" element={<AskWheelRequestsPage />} />
              </Route>
              
              {/* Demo & Development */}
              <Route path="terminology-demo" element={<TerminologyDemoPage />} />
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
          
          {/* Fallback for unknown routes - temporary error page */}
          <Route path="*" element={<Navigate to="/route-not-found" replace />} />
        </Routes>
      </Suspense>
    </AppProvider>
  );
};

export default App;
