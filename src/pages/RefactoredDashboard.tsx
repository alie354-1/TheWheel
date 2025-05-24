/**
 * Refactored Dashboard Page
 * 
 * Uses the new service registry pattern, hooks, and UI components.
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot,
  Code,
  BookOpen,
  FileText,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

// Import UI components
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { LoadingSpinner, ErrorDisplay, EmptyState } from '../components/feedback';
import { Container, Stack, Grid } from '../components/layout';

// Import service registry and hooks
import { serviceRegistry } from '../lib/services/registry';
import { useFeatureFlags } from '../lib/hooks/useFeatureFlags';
import { useAnalytics } from '../lib/hooks/useAnalytics';
import { useAuth } from '../lib/hooks/useAuth';

// Import other components
import OnboardingProgressCard from '../components/OnboardingProgressCard';
import StandupHistory from '../components/StandupHistory';
import JoinCompanyDialog from '../components/JoinCompanyDialog';

// Lazy load TaskManager
const TaskManager = React.lazy(() => import('../components/tasks/TaskManager'));

export default function Dashboard() {
  // Get services through hooks
  const { user, profile } = useAuth();
  const { trackView, trackEvent } = useAnalytics();
  const { isEnabled } = useFeatureFlags();
  
  // Component state
  const [hasCompany, setHasCompany] = useState(false);
  const [standupEntries, setStandupEntries] = useState<any[]>([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track page view on mount
  useEffect(() => {
    trackView('page', 'dashboard');
    
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000); // 5 seconds max loading time
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  // Load data on mount
  useEffect(() => {
    if (!profile) {
      setIsLoading(false);
      setError('User profile not loaded. Please try logging out and back in.');
      return;
    }
    
    // Track dashboard load event
    trackEvent('dashboard_loaded', { userId: profile.id });
    
    const loadDashboardData = async () => {
      try {
        // Run company check and standup entries in parallel
        const [companyResult, standupResult] = await Promise.allSettled([
          checkCompanyAccess(),
          loadStandupEntries()
        ]);
        
        // Log results and handle any errors
        if (companyResult.status === 'rejected') {
          console.error('Company access check failed:', companyResult.reason);
        }
        
        if (standupResult.status === 'rejected') {
          console.error('Standup entries loading failed:', standupResult.reason);
        }
        
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(`Error loading dashboard: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [profile]);
  
  const checkCompanyAccess = async () => {
    if (!profile) return;
    
    try {
      // Access company service via registry
      const companyAccessService = serviceRegistry.get('companyAccess');
      const result = await companyAccessService.checkUserCompanyAccess(profile.id);
      
      setHasCompany(result.hasCompany);
      return result;
    } catch (err: any) {
      setHasCompany(false);
      throw err;
    }
  };
  
  const loadStandupEntries = async () => {
    if (!profile) return [];
    
    try {
      // Use the supabase client from the registry
      const { supabase } = serviceRegistry.get('supabase');
      
      const { data, error } = await supabase
        .from('standup_entries')
        .select(`
          *,
          tasks:standup_tasks(*)
        `)
        .eq('user_id', profile.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setStandupEntries(data || []);
      return data || [];
    } catch (err) {
      setStandupEntries([]);
      throw err;
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
  
  // Handle loading state
  if (isLoading) {
    return (
      <Container padding maxWidth="xl">
        <div className="py-12 text-center">
          <LoadingSpinner size="lg" text="Loading dashboard..." centered />
        </div>
      </Container>
    );
  }
  
  // Handle error state
  if (error && !profile) {
    return (
      <Container padding maxWidth="lg">
        <ErrorDisplay 
          title="Dashboard Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }
  
  return (
    <Container padding maxWidth="xl">
      {/* Header */}
      <Stack direction="column" spacing="lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening in your founder journey
            </p>
          </div>
        </div>
        
        {/* Error alert if needed */}
        {error && (
          <ErrorDisplay 
            message={error}
            showDetails={false}
            onRetry={() => window.location.reload()}
          />
        )}
        
        {/* Onboarding Progress */}
        <OnboardingProgressCard />

        {/* AI Co-founder Section */}
        {isEnabled('aiCofounder') && (
          <Card shadow="sm" bordered>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Bot className="h-7 w-7 text-indigo-600" />
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900">AI Co-founder</h2>
                    <p className="text-sm text-gray-500">Your personal startup advisor</p>
                  </div>
                </div>
                <Link to="/idea-hub/cofounder-bot">
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={() => trackEvent('standup_started', { source: 'dashboard' })}
                  >
                    Start Daily Standup
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Setup Card */}
        {!hasCompany && (
          <Card shadow="md" bordered>
            <CardContent>
              <div className="flex items-start justify-between py-2">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Set Up Your Company</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your company profile or join an existing one.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="md"
                    onClick={() => {
                      setShowJoinDialog(true);
                      trackEvent('join_company_clicked', { source: 'dashboard' });
                    }}
                  >
                    Join Company
                  </Button>
                  <Link to="/company/setup">
                    <Button 
                      variant="primary" 
                      size="md"
                      onClick={() => trackEvent('setup_company_clicked', { source: 'dashboard' })}
                    >
                      Set Up Company
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Manager with React.Suspense */}
        <Card shadow="md">
          <Suspense fallback={
            <CardContent>
              <div className="animate-pulse flex space-x-4 py-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          }>
            <TaskManager showCompleted={false} />
          </Suspense>
        </Card>

        {/* Standup History */}
        <Card shadow="md">
          {standupEntries.length > 0 ? (
            <StandupHistory entries={standupEntries} />
          ) : (
            <CardContent>
              <EmptyState
                title="No standup entries yet"
                description="Complete your first standup with your AI co-founder"
                actionText="Start Standup"
                onAction={() => {
                  trackEvent('first_standup_clicked', { source: 'dashboard' });
                  window.location.href = '/idea-hub/cofounder-bot';
                }}
              />
            </CardContent>
          )}
        </Card>

        {/* Resources Grid */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resources</h2>
          <Grid cols={1} mdCols={2} lgCols={4} gap="md">
            {resources.map((resource, index) => (
              <Card key={index} shadow="sm" hoverable>
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <resource.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">{resource.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">{resource.description}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={resource.link}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      onClick={() => trackEvent('resource_clicked', { resourceTitle: resource.title })}
                    >
                      {resource.action}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </div>
      </Stack>

      {/* Join Company Dialog */}
      <JoinCompanyDialog
        isOpen={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onSuccess={() => {
          setShowJoinDialog(false);
          trackEvent('joined_company', { success: true });
          window.location.href = '/company/dashboard';
        }}
      />
    </Container>
  );
}