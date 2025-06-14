import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import { companyJourneyService } from "../../lib/services/companyJourney.service";
import { companyAccessService } from "../../lib/services/company-access.service";
import { useAuthStore } from "../../lib/store";
import { LayoutDashboard, Route, ListChecks, Landmark, Lightbulb, Wrench, Users, Settings, FileText } from 'lucide-react'; // Added FileText
import JourneyProgressWidget from '../../components/company/dashboard/JourneyProgressWidget';
import MyTasksWidget from '../../components/company/dashboard/MyTasksWidget';
import FinancialSnapshotWidget from '../../components/company/dashboard/FinancialSnapshotWidget';
import JourneyMapView from '../../components/company/dashboard/JourneyMapView'; // Import the new view

// Placeholder components for tab content
const OverviewTab = ({ companyId }: { companyId: string }) => (
  // Improved responsive grid with better spacing
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4">
    {/* Main Content Area (2/3 width on large screens) */}
    <div className="lg:col-span-2 space-y-4">
      {/* Journey Progress with max-height constraint */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4 max-h-[300px] overflow-auto">
          <JourneyProgressWidget companyId={companyId} />
        </div>
      </div>
      
      {/* Tasks widget with max-height constraint */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4 max-h-[250px] overflow-auto">
          <MyTasksWidget companyId={companyId} />
        </div>
      </div>
      
      {/* Recent Activity with compact styling */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4">
          <h3 className="card-title text-base font-medium mb-2">Recent Activity</h3>
          <p className="text-sm text-base-content/70">No recent activity to display</p>
        </div>
      </div>
    </div>

    {/* Sidebar Area (1/3 width on large screens) */}
    <div className="space-y-4">
      {/* Financial snapshot with max-height */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4 max-h-[250px] overflow-auto">
          <FinancialSnapshotWidget companyId={companyId} />
        </div>
      </div>
      
      {/* Quick Actions with compact styling */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4">
          <h3 className="card-title text-base font-medium mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-outline">Add Task</button>
            <button className="btn btn-sm btn-outline">Invite Team</button>
            <button className="btn btn-sm btn-outline">Update Budget</button>
          </div>
        </div>
      </div>
      
      {/* Team Pulse with compact styling */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4">
          <h3 className="card-title text-base font-medium mb-2">Team Pulse</h3>
          <p className="text-sm text-base-content/70">No team members to display</p>
        </div>
      </div>
    </div>
  </div>
);
const JourneyTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Journey Map</h3>
  <Link to={`/company/new-journey`} className="btn btn-lg btn-primary font-bold">
    🚀 Launch NEW Redesigned Journey Experience
  </Link>
    </div>
    <div className="alert alert-info mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>The journey experience has been completely redesigned with new features! Click the button above to access it.</span>
    </div>
    <JourneyMapView companyId={companyId} /> {/* Use the new component */}
   </div>
);
const TasksTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Tasks</h3> {/* Increased heading size */}
    <p>Task management interface (list, filters, board?) will go here.</p>
     {/* TODO: Implement Tasks component */}
   </div>
);
const FinanceTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Finance</h3> {/* Increased heading size */}
    <p>Financial charts, budget tracking, reports will go here.</p>
     {/* TODO: Link to or embed Financial Hub components */}
   </div>
);
const IdeasTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Ideas</h3> {/* Increased heading size */}
    <p>Company idea pipeline overview will go here.</p>
     {/* TODO: Implement Ideas overview component */}
   </div>
);
const ToolsTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Tools</h3> {/* Increased heading size */}
    <p>Company tools management and marketplace interaction will go here.</p>
     {/* TODO: Implement Tools component */}
   </div>
);
const TeamTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Team</h3> {/* Increased heading size */}
    <p>Team member list, roles, invitations will go here.</p>
     {/* TODO: Implement Team component */}
   </div>
);
const SettingsTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Company Settings</h3> {/* Increased heading size */}
    <p>Editing company profile details will go here.</p>
     {/* TODO: Implement Company Settings component/form */}
   </div>
);
const DocumentsTab = ({ companyId }: { companyId: string }) => (
   <div className="p-6 bg-base-100 rounded-lg shadow mt-4"> {/* Added styling */}
    <h3 className="text-xl font-semibold mb-4">Documents</h3> {/* Increased heading size */}
    <p>Company document management (upload, view, organize) will go here.</p>
     {/* TODO: Implement Documents component */}
   </div>
);

const TABS = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, component: OverviewTab },
  { id: 'journey', name: 'Journey', icon: Route, component: JourneyTab },
  { id: 'tasks', name: 'Tasks', icon: ListChecks, component: TasksTab },
  { id: 'finance', name: 'Finance', icon: Landmark, component: FinanceTab },
  { id: 'ideas', name: 'Ideas', icon: Lightbulb, component: IdeasTab },
  { id: 'tools', name: 'Tools', icon: Wrench, component: ToolsTab },
  { id: 'documents', name: 'Documents', icon: FileText, component: DocumentsTab }, // Added Documents tab
  { id: 'team', name: 'Team', icon: Users, component: TeamTab },
  { id: 'settings', name: 'Settings', icon: Settings, component: SettingsTab },
];

function CompanyDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].id); // Default to 'overview'

  // --- Removed Journey-specific state from main component ---
  // const [journey, setJourney] = useState<any[]>([]);
  // const [hasCustomJourney, setHasCustomJourney] = useState(false);
  // const [loadingJourney, setLoadingJourney] = useState(true);
  // const [customizing, setCustomizing] = useState(false);
  // const [newStepName, setNewStepName] = useState("");
  // const [addingStep, setAddingStep] = useState(false);
  // const [toolSubmissionStepId, setToolSubmissionStepId] = useState<string | null>(null);
  // const [toolName, setToolName] = useState("");
  // const [toolUrl, setToolUrl] = useState("");
  // const [toolDescription, setToolDescription] = useState("");
  // const [toolCategory, setToolCategory] = useState("");
  // const [submittingTool, setSubmittingTool] = useState(false);
  // --- End Removed State ---


  // Fetch company ID for the current user
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (!user) {
        setIsLoadingCompany(false);
        return;
      }
      setIsLoadingCompany(true);
      try {
        const accessInfo = await companyAccessService.checkUserCompanyAccess(user.id);
        if (accessInfo.hasCompany && accessInfo.companyData.length > 0) {
          setCompanyId(accessInfo.companyData[0]?.id || null);
          if (accessInfo.companyData[0]?.id) {
            localStorage.setItem("companyId", accessInfo.companyData[0].id);
          }
        } else {
          setCompanyId(null);
        }
        if (accessInfo.error) {
           console.error("Error checking company access:", accessInfo.error);
        }
      } catch (error) {
        console.error("Error fetching user company access info:", error);
        setCompanyId(null);
      } finally {
        setIsLoadingCompany(false);
      }
    };
    fetchUserCompany();
  }, [user]);

  // --- Removed Journey-specific functions ---
  // async function fetchJourney(currentCompanyId: string) { ... }
  // async function handleCustomizeJourney() { ... }
  // async function handleAddCustomStep(e: React.FormEvent) { ... }
  // async function handleDismissStep(stepId: string) { ... }
  // async function handleMoveStep(idx: number, direction: "up" | "down") { ... }
  // async function handleSubmitTool(e: React.FormEvent) { ... }
  // --- End Removed Functions ---


  // Loading state for company check
  if (isLoadingCompany) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p>Loading company information...</p>
      </div>
    );
  }

  // If no company, prompt to set one up
  if (!companyId) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
        <p className="mb-4">You haven't set up or joined a company yet.</p>
        <Link to="/company/setup" className="btn btn-primary">
          Set Up Your Company
        </Link>
      </div>
    );
  }

  // Find the component for the active tab
  const ActiveTabComponent = TABS.find(tab => tab.id === activeTab)?.component;

  // Render dashboard with tabs if company exists
  return (
    // Use bg-base-200 for the page background
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-base-content">Company Dashboard</h1> {/* Use theme text color */}

      {/* Tab Navigation - Using tabs-bordered for cleaner look */}
      <div role="tablist" className="tabs tabs-bordered border-b border-base-300 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            className={`tab tab-bordered gap-2 px-4 py-2 transition-all duration-200 ease-in-out
              ${activeTab === tab.id ? 
                'tab-active text-primary border-primary font-medium' : 
                'text-base-content hover:text-primary hover:border-base-300'}`}
            onClick={() => {
              if (tab.id === 'journey') {
                navigate('/company/new-journey');
              } else {
                setActiveTab(tab.id);
              }
            }}
            aria-selected={activeTab === tab.id}
          >
            <tab.icon className="h-4 w-4 mr-1" /> {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div>
        {ActiveTabComponent ? (
          <ActiveTabComponent companyId={companyId} />
        ) : (
          <div className="p-6 bg-base-100 rounded-lg shadow mt-4">Error: Tab content not found.</div>
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
