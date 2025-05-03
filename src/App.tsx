import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import type { User, UserProfile } from './lib/types/profile.types';
import { loggingService } from './lib/services/logging.service';
import { LoggingProvider } from './components/LoggingProvider';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import OnboardingPage from './pages/OnboardingPage';
import OnboardingWizardPage from './pages/OnboardingWizardPage';
import InitialOnboardingPage from './pages/InitialOnboardingPage';
import { EnhancedOnboardingPage } from './pages/EnhancedOnboardingPage';
import OnboardingDemoPage from './pages/OnboardingDemoPage';
import TerminologyDemoPage from './pages/TerminologyDemoPage';
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
import SettingsPage from './pages/SettingsPage';
import CompanySetup from './pages/company/CompanySetup';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanySettings from './pages/company/CompanySettings';
import JourneyMapPage from './pages/company/JourneyMapPage';
import JourneyStepPage from './pages/company/JourneyStepPage';
import JourneyChallengesPage from './pages/company/JourneyChallengesPage';
import JourneyOverviewPage from './pages/company/JourneyOverviewPage';
import JourneyChallengeDetailPage from './pages/company/JourneyChallengeDetailPage';
import JourneyStepsPage from './pages/company/JourneyStepsPage';
import JourneyPage from './pages/company/JourneyPage';
import JourneyStepsRedirect from './pages/company/JourneyStepsRedirect';
import IdeaHub from './pages/IdeaHub';
import EnhancedIdeaHub from './pages/idea-hub/EnhancedIdeaHub';
import EnhancedIdeaHubPage from './pages/EnhancedIdeaHubPage';
import TaskCreation from './components/tasks/TaskCreation';
import Refinement from './pages/idea-hub/Refinement';
import Community from './pages/Community';
import Messages from './pages/Messages';
import Layout from './components/Layout';
import GoogleCallback from './pages/auth/GoogleCallback';
import AdminJourneyContentPage from './pages/AdminJourneyContentPage'; // Import Admin Journey Content Page
import AdminToolModerationPage from './pages/AdminToolModerationPage';
import AskWheelRequestsPage from './pages/admin/AskWheelRequestsPage'; // Import Ask The Wheel Requests Page
// Import new idea exploration pages
import ExplorationHub from './pages/idea-hub/ExplorationHub';
import IdeaDetailPage from './pages/idea-hub/IdeaDetailPage';
import IdeaComparisonPage from './pages/idea-hub/IdeaComparisonPage';
import IdeaMergerPage from './pages/idea-hub/IdeaMergerPage';
import UnifiedWorkflow from './pages/idea-hub/UnifiedWorkflow';
import QuickGeneration from './pages/idea-hub/QuickGeneration';
import SavedIdeasPage from './pages/idea-hub/SavedIdeasPage';
import { cleanLocalStorage } from './lib/services/localStorage-cleaner';
import { AIContextProvider as AIProvider } from './lib/services/ai/ai-context-provider';
// Import LLMProviderTest component
import LLMProviderTest from './components/LLMProviderTest';
import DragDropProvider from './components/DragDropProvider';
// Dynamic imports for components that might have path issues
// Import the actual IdeaPlaygroundPage component
const IdeaPlaygroundPage = React.lazy(() => import('./pages/idea-playground/IdeaPlaygroundPage'));
const PathwayRouter = React.lazy(() => import('./pages/idea-playground/PathwayRouter'));
const StandupTestPage = React.lazy(() => import('./pages/StandupTestPageWrapper'));
const OnboardingWizardExamples = React.lazy(() => import('./examples/OnboardingWizardExamples'));

function App() {
  const { user, profile } = useAuthStore() as { user: User; profile: UserProfile };
  const location = useLocation();
  const [appError, setAppError] = useState<Error | null>(null);

// Apply user's theme preference dynamically
useEffect(() => {
const theme = profile?.theme ?? 'light';
document.documentElement.classList.toggle('dark', theme === 'dark');
}, [profile?.theme]);
  
  // Setup global error handler
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log the error to our original console.error
      originalConsoleError.apply(console, args);
      
      // Check if this is an error object
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg) {
        setAppError(errorArg);
      }
    };
    
    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setAppError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // Our new LoggingProvider will handle initialization and session management automatically
  
  // Clean localStorage at app initialization
  useEffect(() => {
    // Clean localStorage
    cleanLocalStorage(false); // Use false to only clean in appropriate routes
  }, []);
  

  const navigate = useNavigate();

  // Navigation logic moved to useEffect to prevent infinite update loops
  useEffect(() => {
    if (!user) {
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }
    // Removed the mandatory redirect to /profile-setup if full_name is missing.
    // Profile setup is now optional.
    const hasCompletedOnboarding = profile?.setup_progress?.completed_steps?.includes('complete');
    const hasCompletedInitialOnboarding = profile?.setup_progress?.form_data?.initialOnboardingComplete === true;

    // Only block dashboard if onboarding is truly incomplete
    if (profile?.full_name && !hasCompletedInitialOnboarding &&
        !['/initial-onboarding', '/onboarding-demo', '/dashboard'].includes(window.location.pathname)) {
      navigate('/initial-onboarding', { replace: true });
      return;
    }

    // Removed the check and redirect for main onboarding (!hasCompletedOnboarding).
    // Users can now navigate freely after initial onboarding.
    // The OnboardingProgressCard will remind them to complete the main onboarding later.

    // Final check: If user is fully logged in and tries to access login/setup, redirect to dashboard
    if (profile?.full_name && hasCompletedInitialOnboarding && ['/login', '/initial-onboarding', '/profile-setup'].includes(window.location.pathname)) {
      navigate('/dashboard', { replace: true });
    }
    
  }, [user, profile, navigate, location.pathname]); // Added location.pathname dependency

  // If user is not logged in, show login and public routes
  if (!user) {
    return (
      <AIProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/llm-test" element={<LLMProviderTest />} />
          <Route path="/onboarding-demo" element={<OnboardingDemoPage />} />
          <Route path="/initial-onboarding" element={<InitialOnboardingPage />} />
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
          <Route path="/idea-playground" element={<Navigate to="/idea-hub/playground" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AIProvider>
    );
  }

  return (
    <LoggingProvider
      enableDetailedLogging={true}
      captureUserContext={true}
      captureCompanyContext={false} // Disabled company context to prevent recursion issues while company functionality is being rebuilt
      captureSystemContext={true}
      featureSets={['user_behavior', 'system_interactions', 'business_logic', 'ai_conversations', 'idea_generation']}
    >
      <AIProvider>
        <DragDropProvider>
          <div className="min-h-screen bg-gray-100">
          <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/llm-test" element={<LLMProviderTest />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={
              <ErrorBoundary 
                componentName="DashboardPage"
                fallback={
                  <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h2>
                        <p className="text-sm text-gray-700 mb-4">
                          There was a problem loading your dashboard. Please try refreshing the page.
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  </div>
                }
              >
                <React.Suspense fallback={
                  <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
                      </div>
                    </div>
                  </div>
                }>
                  <Dashboard />
                </React.Suspense>
              </ErrorBoundary>
            } />
            <Route path="profile" element={<Profile />} />
          <Route path="onboarding" element={<OnboardingPage />} />
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
              <Route path="quick-generation" element={<QuickGeneration />} />
              <Route path="saved" element={<React.Suspense fallback={<div>Loading...</div>}>
                <SavedIdeasPage />
              </React.Suspense>} />
              <Route path="enhanced" element={<EnhancedIdeaHub />} />
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
              <Route path="journey" element={<JourneyMapPage />} />
              <Route path="journey/step/:stepId" element={<JourneyStepPage />} />
              <Route path="journey/steps" element={<JourneyStepsPage />} />
              <Route path="journey/unified" element={<JourneyPage />} />
              <Route path="journey/challenges" element={<JourneyChallengesPage />} />
              <Route path="journey/overview" element={<JourneyOverviewPage />} />
              <Route path="journey/challenge/:challengeId" element={<JourneyStepsRedirect />} />
              <Route path="journey/challenge/:challengeId/customize" element={<JourneyStepPage mode="edit" />} />
              <Route path="journey/challenges/create" element={<JourneyStepPage mode="create" />} />
            </Route>
            {/* Add a top-level journey route for easier access */}
            <Route path="journey" element={<Navigate to="/company/journey" replace />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin-journey-content" element={<AdminJourneyContentPage />} /> {/* Add route for Admin Journey Content */}
            <Route path="admin-tool-moderation" element={<AdminToolModerationPage />} />
            <Route path="admin-ask-wheel" element={<AskWheelRequestsPage />} /> {/* Add route for Ask The Wheel Requests */}
            <Route path="settings" element={<SettingsPage />} />
            {/* Onboarding Routes */}
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="initial-onboarding" element={<InitialOnboardingPage />} />
            <Route path="onboarding-wizard" element={<OnboardingWizardPage />} />
            <Route path="onboarding/enhanced" element={<EnhancedOnboardingPage />} />
            <Route path="onboarding-demo" element={<OnboardingDemoPage />} />
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
            <Route path="enhanced-idea-hub" element={<EnhancedIdeaHubPage />} />
            <Route path="idea-playground" element={<Navigate to="/idea-hub/playground" replace />} />
            <Route path="terminology-demo" element={<TerminologyDemoPage />} />
          </Route>
          </Routes>
          </div>
        </DragDropProvider>
      </AIProvider>
    </LoggingProvider>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuthStore();
  
  // Removed logging to prevent database errors
  // The logging service has been disabled
  
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
