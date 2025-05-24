import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase'; 
import ErrorBoundary from '../components/ErrorBoundary';
import {
  LayoutDashboard, 
  MessageSquare, 
  Users,
  Code,
  BookOpen,
  GraduationCap,
  Building2,
  FileText,
  Bell,
  Clock,
  ChevronRight,
  Bot,
  Brain,
  Target,
  Lightbulb,
  Calendar,
  Plus
} from 'lucide-react';
import OnboardingProgressCard from '../components/OnboardingProgressCard';
import StandupHistory from '../components/StandupHistory';
import JoinCompanyDialog from '../components/JoinCompanyDialog';

// Import TaskManager with error handling
const TaskManager = React.lazy(() => import('../components/tasks/TaskManager'));

export default function Dashboard() {
  const { profile } = useAuthStore();
  const [hasCompany, setHasCompany] = useState(false);
  const [standupEntries, setStandupEntries] = useState<any[]>([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [componentMounted, setComponentMounted] = useState(false);

  // Enhanced debug logging
  console.log("[Dashboard] Component rendering", {
    profileExists: !!profile,
    profileId: profile?.id,
    componentMounted: componentMounted,
    hasError: !!error,
    isLoading
  });

  useEffect(() => {
    // Performance tracking
    const startTime = performance.now();
    
    // Mark component as mounted to help with debugging
    setComponentMounted(true);
    console.log("[Dashboard] Component mounted, starting data loading");
    
    // Always set a timeout to end loading state even if other operations fail
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("[Dashboard] Forcing loading state to end after timeout (5s)");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds max loading time

    if (profile) {
      try {
        console.log("[Dashboard] Profile found, id:", profile.id);
        
        // Create an array of promises to run in parallel
        const promises = [
          // Company access check with detailed error handling
          checkCompanyAccess().catch(err => {
            console.error("[Dashboard] Company access check failed:", err);
            setHasCompany(false); // Sensible default
            return { hasCompany: false, error: err.message };
          }),
          
          // Standup entries with detailed error handling
          loadStandupEntries().catch(err => {
            console.error("[Dashboard] Standup entries loading failed:", err);
            setStandupEntries([]); // Empty fallback
            return [];
          })
        ];
        
        // Wait for all promises to settle (not necessarily resolve)
        Promise.allSettled(promises)
          .then(results => {
            console.log("[Dashboard] All data loading completed:", 
              results.map((r, i) => `Promise ${i}: ${r.status}`).join(', '));
            
            // Calculate loading time
            const endTime = performance.now();
            console.log(`[Dashboard] Total loading time: ${(endTime - startTime).toFixed(2)}ms`);
            
            // Ensure loading state is false
            setIsLoading(false);
          })
          .catch(err => {
            console.error("[Dashboard] Unexpected error in Promise.allSettled:", err);
            setIsLoading(false);
          });
      } catch (err) {
        console.error("[Dashboard] Error in main effect:", err);
        // Don't block rendering on errors
        setIsLoading(false);
      }
    } else {
      // Handle missing profile case
      console.log("[Dashboard] No profile available, auth may not be complete");
      setIsLoading(false);
      setError('User profile not loaded. Please try logging out and back in.');
    }

    return () => {
      clearTimeout(loadingTimeout);
      console.log("[Dashboard] Component unmounting");
    };
  }, [profile]);

  const checkCompanyAccess = async () => {
    if (!profile) {
      console.log("[Dashboard] checkCompanyAccess: No profile available");
      return;
    }

    console.log("[Dashboard] Starting company access check for user:", profile.id);
    const startTime = performance.now();
    
    try {
      // Don't set loading state here to avoid UI flicker
      setError('');

      // Use the company access service to prevent infinite recursion
      const { companyAccessService } = await import('../lib/services/company-access.service');
      const result = await companyAccessService.checkUserCompanyAccess(profile.id);
      
      console.log("[Dashboard] Company access check result:", {
        hasCompany: result.hasCompany,
        hasError: !!result.error,
        companyData: result.companyData?.length || 0
      });
      
      // Set the hasCompany state based on the result
      setHasCompany(result.hasCompany);
      
      // If there was an error, log it but don't fail completely
      if (result.error) {
        console.warn('[Dashboard] Company access warning:', result.error);
      }
      
      const endTime = performance.now();
      console.log(`[Dashboard] Company access check completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return result;
    } catch (error: any) {
      const endTime = performance.now();
      console.error(`[Dashboard] Error checking company access after ${(endTime - startTime).toFixed(2)}ms:`, error);
      
      // Add to error state but don't override more critical errors
      setError(prev => {
        const newError = `Company access check: ${error.message || 'Unknown error'}`;
        return prev ? `${prev}; ${newError}` : newError;
      });
      
      // Even in error state, initialize to sensible defaults
      setHasCompany(false);
      
      // Re-throw for Promise.allSettled to catch
      throw error;
    }
  };

  const loadStandupEntries = async () => {
    if (!profile) {
      console.log("[Dashboard] loadStandupEntries: No profile available");
      return [];
    }

    console.log("[Dashboard] Starting standup entries load for user:", profile.id);
    const startTime = performance.now();
    
    try {
      // Query standup_entries table directly with error handling
      const { data, error } = await supabase
        .from('standup_entries')
        .select(`
          *,
          tasks:standup_tasks(*)
        `)
        .eq('user_id', profile.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[Dashboard] Error querying standup_entries:', error);
        setStandupEntries([]);
        return [];
      }
      
      console.log(`[Dashboard] Loaded ${data?.length || 0} standup entries`);
      
      // Set entries even if empty array
      setStandupEntries(data || []);
      
      const endTime = performance.now();
      console.log(`[Dashboard] Standup entries load completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return data || [];
    } catch (error: any) {
      const endTime = performance.now();
      console.error(`[Dashboard] Error loading standup entries after ${(endTime - startTime).toFixed(2)}ms:`, error);
      
      // Don't fail completely, just show empty state
      setStandupEntries([]);
      
      // Re-throw for Promise.allSettled to catch
      throw error;
    }
  };

  const resources = [
    {
      title: 'Technical Docs',
      description: 'API guides & documentation',
      icon: Code,
      action: 'View Docs',
      link: '#'
    },
    {
      title: 'Startup Guides',
      description: 'Best practices & tutorials',
      icon: BookOpen,
      action: 'Explore Guides',
      link: '#'
    },
    {
      title: 'Templates',
      description: 'Ready-to-use documents',
      icon: FileText,
      action: 'Browse Templates',
      link: '#'
    },
    {
      title: 'Learning Paths',
      description: 'Structured courses',
      icon: GraduationCap,
      action: 'Start Learning',
      link: '#'
    }
  ];

  // If still loading, show a detailed loading indicator
  if (isLoading) {
    console.log("[Dashboard] Rendering loading state");
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-2 text-sm text-base-content/70">Loading dashboard...</p>
            <p className="mt-1 text-xs text-base-content/50">
              {componentMounted ? "Component mounted, fetching data..." : "Component mounting..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("[Dashboard] Rendering main dashboard content", {
    hasCompany,
    standupEntriesCount: standupEntries.length,
    hasError: !!error
  });
  
  return (
    <ErrorBoundary
      componentName="Dashboard"
      fallback={
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-medium text-base-content mb-2">Dashboard Error</h2>
              <p className="text-sm text-base-content/70 mb-4">
                There was a problem loading your dashboard. Please try refreshing the page.
              </p>
              <div className="text-xs text-base-content/60 mb-4 p-2 bg-base-200 rounded overflow-auto max-h-32">
                <pre>{error || "Unknown error occurred"}</pre>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary btn-sm"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      }
    >
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-base-content">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-sm text-base-content/70">
              Here's what's happening in your founder journey
            </p>
            {error && (
              <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-sm text-error">
                {error}
              </div>
            )}
          </div>
          <div>
            <Link to="/company/dashboard-new" className="btn btn-sm btn-outline">
              Try New Dashboard
            </Link>
          </div>
        </div>

        {/* Onboarding Progress */}
        <ErrorBoundary componentName="OnboardingProgressCard">
          <OnboardingProgressCard />
        </ErrorBoundary>

        {/* AI Co-founder Section */}
        <div className="mb-6">
          <div className="bg-base-200 rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-6 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-7 w-7 text-primary" />
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-base-content">AI Co-founder</h2>
                    <p className="text-sm text-base-content/70">Your personal startup advisor</p>
                  </div>
                </div>
                <Link
                  to="/idea-hub/cofounder-bot"
                  className="btn btn-sm btn-primary"
                >
                  Start Daily Standup
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Company Setup Card */}
        {!hasCompany && (
          <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-base-content">Set Up Your Company</h2>
                <p className="mt-1 text-sm text-base-content/70">
                  Create your company profile or join an existing one.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJoinDialog(true)}
                  className="btn btn-sm btn-outline"
                >
                  Join Company
                </button>
                <Link
                  to="/company/setup"
                  className="btn btn-sm btn-primary"
                >
                  Set Up Company
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Task Manager with React.Suspense and ErrorBoundary */}
        <div className="mb-8">
          <ErrorBoundary componentName="TaskManager">
            <React.Suspense fallback={
              <div className="bg-base-100 shadow-md rounded-lg p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-base-300 rounded"></div>
                      <div className="h-4 bg-base-300 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            }>
              <TaskManager showCompleted={false} />
            </React.Suspense>
          </ErrorBoundary>
        </div>

        {/* Standup History with ErrorBoundary */}
        <div className="mb-8">
          <ErrorBoundary componentName="StandupHistory">
            <StandupHistory entries={standupEntries} />
          </ErrorBoundary>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-base-100 overflow-hidden shadow-md rounded-lg hover:shadow transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <resource.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-base font-medium text-base-content">{resource.title}</h3>
                    <p className="mt-1 text-xs text-base-content/70">{resource.description}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <a
                    href={resource.link}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-focus"
                  >
                    {resource.action}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Company Dialog */}
        <JoinCompanyDialog
          isOpen={showJoinDialog}
          onClose={() => setShowJoinDialog(false)}
          onSuccess={() => {
            setShowJoinDialog(false);
            window.location.href = '/company/dashboard';
          }}
        />
      </div>
    </div>
    </ErrorBoundary>
  );
}
