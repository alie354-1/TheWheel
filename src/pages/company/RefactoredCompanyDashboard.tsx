import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, Route, ListChecks, Landmark, 
  Lightbulb, Wrench, Users, Settings, FileText 
} from 'lucide-react';

// Import services from service registry
import { serviceRegistry } from "../../lib/services/registry";

// Import our hooks
import { useAuth } from "../../lib/hooks/useAuth";
import { useLogging } from "../../lib/hooks/useLogging";

// Import our UI components
import { Container, Stack } from "../../components/layout";
import { Card, CardHeader, CardContent, Tabs, Tab } from "../../components/ui";
import { LoadingSpinner, ErrorDisplay } from "../../components/feedback";

// Import specific dashboard widgets
import JourneyProgressWidget from '../../components/company/dashboard/JourneyProgressWidget';
import MyTasksWidget from '../../components/company/dashboard/MyTasksWidget';
import FinancialSnapshotWidget from '../../components/company/dashboard/FinancialSnapshotWidget';
import JourneyMapView from '../../components/company/dashboard/JourneyMapView';

// Tab component definitions (these can be moved to separate files later)
const OverviewTab = ({ companyId }: { companyId: string }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">
    {/* Main Content Area (2/3 width on large screens) */}
    <div className="lg:col-span-2 space-y-4">
      <Card>
        <CardContent className="p-4 max-h-[300px] overflow-auto">
          <JourneyProgressWidget companyId={companyId} />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 max-h-[250px] overflow-auto">
          <MyTasksWidget companyId={companyId} />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <h3 className="text-base font-medium mb-2">Recent Activity</h3>
          <p className="text-sm text-base-content/70">No recent activity to display</p>
        </CardContent>
      </Card>
    </div>

    {/* Sidebar Area (1/3 width on large screens) */}
    <Stack direction="column" spacing="md">
      <Card>
        <CardContent className="p-4 max-h-[250px] overflow-auto">
          <FinancialSnapshotWidget companyId={companyId} />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <h3 className="text-base font-medium mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-outline">Add Task</button>
            <button className="btn btn-sm btn-outline">Invite Team</button>
            <button className="btn btn-sm btn-outline">Update Budget</button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <h3 className="text-base font-medium mb-2">Team Pulse</h3>
          <p className="text-sm text-base-content/70">No team members to display</p>
        </CardContent>
      </Card>
    </Stack>
  </div>
);

const JourneyTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Journey Map</h3>
        <Link to={`/company/${companyId}/journey/unified`} className="btn btn-lg btn-primary font-bold">
          🚀 Launch NEW Redesigned Journey Experience
        </Link>
      </div>
      <div className="alert alert-info mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>The journey experience has been completely redesigned with new features! Click the button above to access it.</span>
      </div>
      <JourneyMapView companyId={companyId} />
    </CardContent>
  </Card>
);

const TasksTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Tasks</h3>
      <p>Task management interface will go here.</p>
    </CardContent>
  </Card>
);

const FinanceTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Finance</h3>
      <p>Financial charts, budget tracking, reports will go here.</p>
    </CardContent>
  </Card>
);

const IdeasTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Ideas</h3>
      <p>Company idea pipeline overview will go here.</p>
    </CardContent>
  </Card>
);

const ToolsTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Tools</h3>
      <p>Company tools management and marketplace interaction will go here.</p>
    </CardContent>
  </Card>
);

const TeamTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Team</h3>
      <p>Team member list, roles, invitations will go here.</p>
    </CardContent>
  </Card>
);

const SettingsTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Company Settings</h3>
      <p>Editing company profile details will go here.</p>
    </CardContent>
  </Card>
);

const DocumentsTab = ({ companyId }: { companyId: string }) => (
  <Card>
    <CardContent>
      <h3 className="text-xl font-semibold mb-4">Documents</h3>
      <p>Company document management (upload, view, organize) will go here.</p>
    </CardContent>
  </Card>
);

const TABS = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, component: OverviewTab },
  { id: 'journey', name: 'Journey', icon: Route, component: JourneyTab },
  { id: 'tasks', name: 'Tasks', icon: ListChecks, component: TasksTab },
  { id: 'finance', name: 'Finance', icon: Landmark, component: FinanceTab },
  { id: 'ideas', name: 'Ideas', icon: Lightbulb, component: IdeasTab },
  { id: 'tools', name: 'Tools', icon: Wrench, component: ToolsTab },
  { id: 'documents', name: 'Documents', icon: FileText, component: DocumentsTab },
  { id: 'team', name: 'Team', icon: Users, component: TeamTab },
  { id: 'settings', name: 'Settings', icon: Settings, component: SettingsTab },
];

function RefactoredCompanyDashboard() {
  // Get services from registry
  const companyAccessService = serviceRegistry.get('companyAccess');
  
  // Use our custom hooks
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { error: logError, withErrorLogging } = useLogging();
  
  // Component state
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [error, setError] = useState<string | null>(null);

  // Fetch company ID for the current user
  useEffect(() => {
    const fetchUserCompany = withErrorLogging(async () => {
      if (!user) {
        setIsLoadingCompany(false);
        return;
      }
      
      setIsLoadingCompany(true);
      setError(null);
      
      try {
        const accessInfo = await companyAccessService.checkUserCompanyAccess(user.id);
        
        if (accessInfo.hasCompany && accessInfo.companyData.length > 0) {
          setCompanyId(accessInfo.companyData[0]?.id || null);
        } else {
          setCompanyId(null);
        }
        
        if (accessInfo.error) {
          setError(`Error checking company access: ${accessInfo.error}`);
        }
      } catch (err: any) {
        setError(`Failed to load company: ${err.message || 'Unknown error'}`);
        setCompanyId(null);
      } finally {
        setIsLoadingCompany(false);
      }
    }, "Failed to load company information");

    fetchUserCompany();
  }, [user, companyAccessService, withErrorLogging]);

  // Auth loading state
  if (isAuthLoading) {
    return (
      <Container maxWidth="md" centered padding>
        <LoadingSpinner size="lg" text="Loading authentication data..." centered />
      </Container>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" centered padding>
        <ErrorDisplay 
          title="Authentication Required" 
          message="You need to be logged in to view this page." 
          actionText="Go to Login"
          actionLink="/login"
        />
      </Container>
    );
  }

  // Loading state for company check
  if (isLoadingCompany) {
    return (
      <Container maxWidth="md" centered padding>
        <LoadingSpinner size="lg" text="Loading company information..." centered />
      </Container>
    );
  }

  // If no company, prompt to set one up
  if (!companyId) {
    return (
      <Container maxWidth="md" centered padding>
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Company Dashboard</h1>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You haven't set up or joined a company yet.</p>
            <Link to="/company/setup" className="btn btn-primary">
              Set Up Your Company
            </Link>
          </CardContent>
        </Card>
        
        {error && (
          <ErrorDisplay 
            title="Error"
            message={error}
            className="mt-4"
          />
        )}
      </Container>
    );
  }

  // Find the component for the active tab
  const ActiveTabComponent = TABS.find(tab => tab.id === activeTab)?.component;

  // Render dashboard with tabs if company exists
  return (
    <Container maxWidth="7xl" padding className="bg-base-200">
      <h1 className="text-3xl font-bold mb-6 text-base-content">Company Dashboard</h1>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="bordered"
        className="mb-6"
      >
        {TABS.map(tab => (
          <Tab 
            key={tab.id} 
            value={tab.id}
            label={(
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" /> 
                <span>{tab.name}</span>
              </div>
            )}
          />
        ))}
      </Tabs>

      {/* Tab Content Area */}
      {error && (
        <ErrorDisplay 
          title="Error" 
          message={error} 
          className="mb-4" 
        />
      )}
      
      {ActiveTabComponent ? (
        <ActiveTabComponent companyId={companyId} />
      ) : (
        <Card>
          <CardContent>Error: Tab content not found.</CardContent>
        </Card>
      )}
    </Container>
  );
}

export default RefactoredCompanyDashboard;