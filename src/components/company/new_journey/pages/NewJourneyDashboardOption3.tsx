import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Eye,
  Trash2,
  Users,
  Paintbrush,
  BarChart,
  AlertCircle
} from 'lucide-react';

// Import modal components
import StepQuickViewModal from '../components/StepQuickViewModal';
import AllStepsModal from '../components/AllStepsModal';
import ActiveStepsModal from '../components/ActiveStepsModal';

// Using Helmet for document head
let Helmet: any;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // If react-helmet is not installed, create a placeholder component
  Helmet = ({ children }: { children: React.ReactNode }) => <>{children}</>;
}

// Import layout components
import Option1Layout from '../layouts/Option1Layout';

// Import sidebar components
import StepsSidebar from '../components/sidebar/StepsSidebar';
import JourneyStatsBar from '../components/sidebar/JourneyStatsBar';
import SearchBar from '../components/sidebar/SearchBar';

// Import step components
import ActiveStepCard from '../components/steps/ActiveStepCard';
import RecommendationCard, { Difficulty } from '../components/steps/RecommendationCard';
import StepsList from '../components/steps/StepsList';

// Import business components
import BusinessStatusWidget, { AIInsight, DomainActivity, AIAnalysis, UpcomingShift, BusinessStatusData } from '../components/BusinessStatusWidget';
import DomainProgressCard from '../components/business/DomainProgressCard';

// Import community components
import PeerInsightCard from '../components/community/PeerInsightCard';

// Import UI components
import ExpandableSection from '../components/ui/ExpandableSection';
import FiltersModal from '../components/filters/FiltersModal';

// Import hooks
import { useCompanySteps, CompanyStepWithMeta } from '../hooks/useCompanySteps';
import { useCompanyProgress } from '../hooks/useCompanyProgress';
import { useAIDashboard } from '../hooks/useAIDashboard';
import { useCompany } from '../../../../lib/hooks/useCompany';
import { useStepTasks } from '../hooks/useStepTasks';
import { BusinessStatusAIService } from '../../../../lib/services/ai/businessStatusAI.service';
import { newCompanyJourneyService } from '../../../../lib/services/new_journey/new_company_journey.service';
import { journeyStatusService } from '../../../../lib/services/new_journey/journey-status.service';
import { NewCompanyJourney, NewCompanyJourneyStep } from '../../../../lib/types/new_journey.types';
import { supabase } from '../../../../lib/utils/supabaseClient';

// Define NextTask interface if it doesn't exist
interface NextTask {
  id: string;
  text: string;
  done: boolean;
}

/**
 * NewJourneyDashboardOption3: Three-column dashboard layout
 * Shows a dashboard with left sidebar, main content, and right panel
 * Fully implements the AI enhancements and matches the wireframe exactly
 */
const NewJourneyDashboardOption3: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompany, loading: companyLoading } = useCompany();
  
  // Company journey state
  const [companyJourney, setCompanyJourney] = useState<NewCompanyJourney | null>(null);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(true);
  
  // State
  const [search, setSearch] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  
  // Filter states
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [filterCompleted, setFilterCompleted] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  
  // State for expandable sections
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [expandedRecommendations, setExpandedRecommendations] = useState<string[]>([]);
  
  // Active filter for stats bar
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for modals
  const [quickViewStep, setQuickViewStep] = useState<NewCompanyJourneyStep | null>(null);
  const [showAllStepsModal, setShowAllStepsModal] = useState(false);
  const [showActiveStepsModal, setShowActiveStepsModal] = useState(false);
  
  // Initialize company journey
  useEffect(() => {
    const initJourney = async () => {
      if (!currentCompany) {
        setJourneyLoading(false);
        return;
      }
      
      try {
        setJourneyLoading(true);
        setJourneyError(null);
        
        const journey = await newCompanyJourneyService.getOrCreateCompanyJourney(currentCompany.id);
        setCompanyJourney(journey);
        console.log('Initialized company journey:', journey);
      } catch (error) {
        console.error('Error initializing company journey:', error);
        setJourneyError('Failed to initialize company journey. Please try again.');
      } finally {
        setJourneyLoading(false);
      }
    };
    
    initJourney();
  }, [currentCompany]);
  
  // Use real data hooks with the real journey ID
  const { 
    inProgressSteps, 
    urgentSteps, 
    completedSteps, 
    mostRecentSteps,
    loading: stepsLoading, 
    handleDeleteStep,
    fetchCompanySteps 
  } = useCompanySteps(
    companyJourney?.id || ''
  );
  
  // Pre-fetch tasks for all in-progress steps at the component level
  const [stepTasksMap, setStepTasksMap] = useState<Record<string, any>>({});
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  
  // Fetch tasks for all in-progress steps
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (!inProgressSteps || inProgressSteps.length === 0) {
        setTasksLoading(false);
        return;
      }
      
      setTasksLoading(true);
      const tasksMap: Record<string, any> = {};
      
      try {
        // Get all step IDs
        const stepIds = inProgressSteps.map(step => step.step.id);
        
        // Fetch tasks for all steps in parallel
        const promises = stepIds.map(async (stepId) => {
          const { data, error } = await supabase
            .from('standup_tasks')
            .select('*')
            .eq('step_id', stepId)
            .order('created_at');
            
          if (error) {
            console.error(`Error fetching tasks for step ${stepId}:`, error);
            return { stepId, tasks: [] };
          }
          
          return { stepId, tasks: data || [] };
        });
        
        const results = await Promise.all(promises);
        
        // Organize results into a map
        results.forEach(result => {
          tasksMap[result.stepId] = result.tasks;
        });
        
        setStepTasksMap(tasksMap);
      } catch (error) {
        console.error('Error fetching tasks for steps:', error);
      } finally {
        setTasksLoading(false);
      }
    };
    
    fetchAllTasks();
  }, [inProgressSteps]);
  const { progressData, engagementMetrics, loading: progressLoading } = useCompanyProgress(
    companyJourney?.id || ''
  );
  const { 
    recommendedSteps, 
    peerInsights, 
    businessHealth, 
    isLoading: aiLoading,
    refreshAllData 
  } = useAIDashboard(companyJourney?.id || '');
  
  // Refresh AI data when journey is initialized
  useEffect(() => {
    // Only refresh if we have a journey and don't already have data
    if (companyJourney?.id && (!recommendedSteps.length || !peerInsights.length || !businessHealth)) {
      refreshAllData();
    }
  }, [companyJourney, refreshAllData, recommendedSteps.length, peerInsights.length, businessHealth]);
  
  // Loading state - only consider true loading state for initial load
  // This prevents the blinking issue when data is being refreshed
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    // Once all data is loaded at least once, mark initial load as complete
    if (!stepsLoading && !progressLoading && !aiLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [stepsLoading, progressLoading, aiLoading, initialLoadComplete]);
  
  // Only show loading state on initial load
  const isLoading = !initialLoadComplete && (companyLoading || journeyLoading || stepsLoading || progressLoading || aiLoading);
  
  // Stats for the sidebar - use actual counts, not fallbacks
  const statsData = {
    total: (inProgressSteps?.length || 0) + (completedSteps?.length || 0) + (urgentSteps?.length || 0),
    active: inProgressSteps?.length || 0,
    completed: completedSteps?.length || 0,
    urgent: urgentSteps?.length || 0
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearch(query);
    console.log(`Searching for: ${query}`);
    // In a real implementation, this would filter the steps
  };
  
  // Handle opening filter modal
  const openFiltersModal = () => {
    setShowFiltersModal(true);
  };
  
  // Handle continuing a step
  const handleContinueStep = async (stepId: string) => {
    if (!companyJourney?.id) return;
    
    try {
      // Update step status to active if not already
      const step = [...(inProgressSteps || []), ...(urgentSteps || [])].find(s => s.step.id === stepId);
      if (step?.step.status === 'not_started') {
        await newCompanyJourneyService.updateStepStatus(stepId, 'active');
      }
      
      // Navigate to company step detail page
      navigate(`/company/new-journey/company-step/${stepId}`);
    } catch (error) {
      console.error('Error continuing step:', error);
    }
  };
  
  // Handle starting a recommended step
  const handleStartRecommendation = async (recId: string) => {
    if (!companyJourney?.id) return;
    
    try {
      // Find the recommendation
      const recommendation = recommendedSteps.find(r => r.id === recId);
      if (!recommendation) return;
      
      // Show loading state
      setJourneyLoading(true);
      
      // Add the step to the company journey
      const newStep = await newCompanyJourneyService.addStepToJourney(companyJourney.id, recId);
      
      // Get the most recent statuses to determine which status to set for new steps
      const mostRecentStatuses = await journeyStatusService.getMostRecentStatuses();
      const initialStatus = mostRecentStatuses.length > 0 ? mostRecentStatuses[0] : 'active';
      
      // Set the step status so it appears in the dashboard
      await newCompanyJourneyService.updateStepStatus(newStep.id, initialStatus);
      
      // Refresh the steps list
      fetchCompanySteps();
      
      // Navigate directly to the step detail page
      navigate(`/company/new-journey/company-step/${newStep.id}`);
    } catch (error) {
      console.error('Error starting recommendation:', error);
      alert('Failed to add step to journey. Please try again.');
    } finally {
      setJourneyLoading(false);
    }
  };
  
  // Handle opening the All Steps modal
  const handleOpenAllStepsModal = () => {
    setShowAllStepsModal(true);
  };
  
  // Handle opening the Active Steps modal
  const handleOpenActiveStepsModal = () => {
    setShowActiveStepsModal(true);
  };
  
  // Handle starting a step from the All Steps modal
  const handleStartStepFromModal = (stepId: string) => {
    setShowAllStepsModal(false);
    // Navigate to the company step page
    navigate(`/company/new-journey/company-step/${stepId}`);
  };
  
  // Handle when a step is added from the modal
  const handleStepAddedFromModal = () => {
    // Refresh all data
    fetchCompanySteps();
    refreshAllData();
  };
  
  // Handle previewing a step from the All Steps modal
  const handlePreviewStepFromModal = (stepId: string) => {
    setShowAllStepsModal(false);
    // Navigate to the template step page
    navigate(`/company/new-journey/template-step/${stepId}`);
  };
  
  // Handle viewing a domain in detail
  const handleViewDomainDetails = (domainId: string) => {
    console.log(`Viewing domain details: ${domainId}`);
    // In a real implementation, this would navigate to the domain detail page
    navigate(`/company/new-journey/domain/${domainId}`);
  };
  
  // Handle step click
  const handleStepClick = (stepId: string) => {
    console.log(`Viewing step: ${stepId}`);
    // Navigate to the step detail page using the company-step URL pattern
    // since these are steps that are already part of the company journey
    navigate(`/company/new-journey/company-step/${stepId}`);
  };
  
  // Handle quick view
  const handleQuickView = (stepId: string) => {
    const step = [...(inProgressSteps || []), ...(urgentSteps || []), ...(completedSteps || [])].find(s => s.step.id === stepId);
    if (step) {
      setQuickViewStep(step.step);
    }
  };
  
  // Handle close quick view
  const handleCloseQuickView = () => {
    setQuickViewStep(null);
  };
  
  // Toggle expansion of a step
  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps(prevExpanded => {
      if (prevExpanded.includes(stepId)) {
        return prevExpanded.filter(id => id !== stepId);
      } else {
        return [...prevExpanded, stepId];
      }
    });
  };
  
  // Toggle expansion of a recommendation
  const toggleRecommendationExpand = (recId: string) => {
    setExpandedRecommendations(prevExpanded => {
      if (prevExpanded.includes(recId)) {
        return prevExpanded.filter(id => id !== recId);
      } else {
        return [...prevExpanded, recId];
      }
    });
  };
  
  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // In a real implementation, this would filter the steps
  };
  
  // Sidebar content
  const sidebarContent = (
    <div className="space-y-6 p-4">
      {/* Sidebar Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Steps</h2>
        <p className="text-sm text-gray-500">Track and manage your founder journey steps</p>
      </div>
      
      {/* Stats Bar - Compact Version */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 flex items-center">
            <BarChart className="h-3 w-3 mr-1 text-indigo-500" />
            Journey Stats
          </h3>
          <button className="text-xs text-indigo-600 hover:text-indigo-800">
            <ChevronUp className="h-3 w-3 mr-1 inline" />
            Details
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {/* Total */}
          <button 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded border border-gray-100 hover:bg-gray-50 transition-colors text-center ${activeFilter === 'all' ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <Activity className="h-3 w-3 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Total</span>
            <span className="text-sm font-bold text-gray-900">{statsData.total}</span>
          </button>
          
          {/* Active */}
          <button 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded border border-blue-100 hover:bg-blue-50 transition-colors text-center ${activeFilter === 'active' ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => handleFilterChange('active')}
          >
            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mb-1">
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600">Active</span>
            <span className="text-sm font-bold text-blue-800">{statsData.active}</span>
          </button>
          
          {/* Completed */}
          <button 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded border border-green-100 hover:bg-green-50 transition-colors text-center ${activeFilter === 'completed' ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600">Done</span>
            <span className="text-sm font-bold text-green-800">{statsData.completed}</span>
          </button>
          
          {/* Urgent */}
          <button 
            className={`flex flex-col items-center justify-center py-2 px-1 rounded border border-amber-100 hover:bg-amber-50 transition-colors text-center ${activeFilter === 'urgent' ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => handleFilterChange('urgent')}
          >
            <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center mb-1">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600">Urgent</span>
            <span className="text-sm font-bold text-amber-800">{statsData.urgent}</span>
          </button>
        </div>
      </div>
      
      {/* Filter Button */}
      <button
        onClick={openFiltersModal}
        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <Filter className="h-4 w-4 mr-2 text-gray-500" />
        Filter Steps
      </button>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search steps..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      {/* Urgent Steps */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-2" />
          Urgent Steps
        </h3>
        <ul className="space-y-2">
          {urgentSteps && urgentSteps.length > 0 ? (
            urgentSteps.map((step) => (
              <li key={step.step.id} className="p-2 border border-red-100 bg-red-50 rounded-md">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{step.step.name}</span>
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
                      title="Quick view"
                      onClick={() => handleQuickView(step.step.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
                      title="Open details"
                      onClick={() => handleStepClick(step.step.id)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50" 
                      title="Delete step"
                      onClick={() => handleDeleteStep(step.step.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-red-600">
                  Due: {step.dueDate ? new Date(step.dueDate).toLocaleDateString() : 'No due date'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-red-600 h-1.5 rounded-full" 
                    style={{ width: `${step.completion ? Math.round(step.completion * 100) : 0}%` }}
                  ></div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-2 border border-gray-200 bg-gray-50 rounded-md text-center text-sm text-gray-500">
              No urgent steps
            </li>
          )}
        </ul>
      </div>
      
      {/* In Progress Steps */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center">
          <Clock className="h-3 w-3 mr-2" />
          In Progress
        </h3>
        <ul className="space-y-2">
          {inProgressSteps && inProgressSteps.length > 0 ? (
            inProgressSteps.map((step) => (
              <li key={step.step.id} className="p-2 border border-blue-100 bg-blue-50 rounded-md">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{step.step.name}</span>
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
                      title="Quick view"
                      onClick={() => handleQuickView(step.step.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
                      title="Open details"
                      onClick={() => handleStepClick(step.step.id)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50" 
                      title="Delete step"
                      onClick={() => handleDeleteStep(step.step.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  Progress: {step.completion ? Math.round(step.completion * 100) : 0}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${step.completion ? Math.round(step.completion * 100) : 0}%` }}
                  ></div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-2 border border-gray-200 bg-gray-50 rounded-md text-center text-sm text-gray-500">
              No in-progress steps
            </li>
          )}
        </ul>
      </div>
      
      {/* Completed Steps */}
      <div className="mb-4">
        <details className="group">
          <summary className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 flex items-center cursor-pointer list-none">
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-2" />
              Completed
              <span className="ml-1 text-gray-500">({completedSteps?.length || 0})</span>
            </div>
            <span className="ml-auto text-gray-400 group-open:rotate-180 transition-transform">
              <ChevronDown className="h-3 w-3" />
            </span>
          </summary>
          <ul className="space-y-2 mt-2">
            {completedSteps && completedSteps.length > 0 ? (
              completedSteps.slice(0, 2).map((step) => (
                <li key={step.step.id} className="p-2 border border-green-100 bg-green-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{step.step.name}</span>
                    <div className="flex space-x-1">
                      <button 
                        className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
                        title="Quick view"
                        onClick={() => handleQuickView(step.step.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50" 
                        title="Open details"
                        onClick={() => handleStepClick(step.step.id)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Completed: {step.step.completed_at ? new Date(step.step.completed_at).toLocaleDateString() : 'Recently'}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-2 border border-gray-200 bg-gray-50 rounded-md text-center text-sm text-gray-500">
                No completed steps
              </li>
            )}
          </ul>
        </details>
      </div>
    </div>
  );
  
  // Right panel content
  const rightPanelContent = (
    <div className="space-y-4 w-full">
      {/* Business Status & Journey Overview */}
      <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900">Business Health</h2>
          <div className="flex items-center space-x-3">
            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800">View details</a>
            <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800">View all domains</a>
          </div>
        </div>
        
        {/* Domain Progress */}
        <div className="space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : businessHealth && businessHealth.domainInsights ? (
            businessHealth.domainInsights.map((domain, index) => (
              <div key={domain.domain} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">{domain.domain}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                    {domain.isActiveFocus ? (
                      <>
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span>Active Focus</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>Maintaining</span>
                      </>
                    )}
                  </span>
                </div>
                
                {/* Maturity level indicator */}
                <div className="w-full flex mb-2 mt-2 gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level}
                      className={`h-2 flex-1 rounded-sm ${
                        level <= domain.maturityLevel 
                          ? (domain.maturityLevel >= 4 ? 'bg-green-500' : 'bg-blue-500') 
                          : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {domain.stepsEngaged} steps engaged
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {domain.timeInvested} invested
                  </span>
                </div>
                
                {/* Strength and Focus Areas */}
                <div className="bg-gray-50 rounded-md p-2 mt-2 text-xs">
                  {domain.strengths && domain.strengths.length > 0 && (
                    <div className="flex items-center mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-700">{domain.strengths[0]}</span>
                    </div>
                  )}
                  {domain.focusAreas && domain.focusAreas.length > 0 && (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-gray-700">{domain.focusAreas[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Peer Insights Section */}
      <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900">Community Insights</h2>
          <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800">View all</a>
        </div>
        
        <div className="space-y-3">
          {peerInsights && peerInsights.length > 0 ? (
            peerInsights.map((insight) => (
              <PeerInsightCard
                key={insight.id}
                insightObj={{
                  id: insight.id,
                  content: insight.content,
                  author: {
                    name: insight.authorName,
                    initials: insight.authorInitials
                  },
                  companyName: insight.authorCompany,
                  date: insight.date,
                  domain: insight.relevantDomain
                }}
                onLike={() => console.log(`Liked insight: ${insight.id}`)}
                onComment={() => console.log(`Commented on insight: ${insight.id}`)}
                onView={() => console.log(`Viewed insight: ${insight.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {aiLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <p>No peer insights available</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Help Card */}
      <div className="bg-indigo-50 shadow-sm rounded-lg p-5 border border-indigo-100">
        <h3 className="font-medium text-indigo-700 mb-2">Need Help?</h3>
        <p className="text-sm text-indigo-700 mb-4">
          Get personalized guidance from our AI assistant or connect with an expert founder.
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => console.log('Ask AI Assistant clicked')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Ask AI Assistant
          </button>
          <button 
            onClick={() => console.log('Connect with Expert clicked')}
            className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
          >
            <Activity className="h-4 w-4 mr-2" />
            Connect with Expert
          </button>
        </div>
      </div>
    </div>
  );
  
  // Main content
  const mainContent = (
    <div className="space-y-6">
      {/* Pick Up Where You Left Off section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mr-3">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Pick Up Where You Left Off</h3>
                <p className="text-sm text-gray-500">Continue your most recent active steps</p>
              </div>
            </div>
            
            <button 
              onClick={handleOpenActiveStepsModal}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <span>View all active steps</span>
              <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Active steps */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : mostRecentSteps && mostRecentSteps.length > 0 ? (
            // Use the mostRecentSteps from our hook
            mostRecentSteps.map((stepWithMeta: CompanyStepWithMeta) => {
              // Get tasks for this step from our pre-fetched map
              const stepTasks = stepTasksMap[stepWithMeta.step.id] || [];
              
              return (
                <ActiveStepCard
                  key={stepWithMeta.step.id}
                  step={{
                    id: stepWithMeta.step.id,
                    title: stepWithMeta.step.name,
                    description: stepWithMeta.step.description,
                    domain: stepWithMeta.step.domain?.name || 'General',
                    status: stepWithMeta.step.status,
                    priority: stepWithMeta.isUrgent ? 'high' : 'normal'
                  }}
                  progress={stepWithMeta.completion ? Math.round(stepWithMeta.completion * 100) : 0}
                  lastWorkedOn={stepWithMeta.step.updated_at ? new Date(stepWithMeta.step.updated_at).toLocaleString() : 'Recently'}
                  startDate={stepWithMeta.step.started_at || undefined}
                  dueDate={stepWithMeta.dueDate || undefined}
                  nextTasks={tasksLoading ? [] : stepTasks}
                  timeSpent={'4.5 hours'}
                  tools={['Zoom', 'Google Forms', 'Miro']}
                  expandable={true}
                  expanded={expandedSteps.includes(stepWithMeta.step.id)}
                  onToggleExpand={() => toggleStepExpand(stepWithMeta.step.id)}
                  onContinue={() => handleContinueStep(stepWithMeta.step.id)}
                />
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No active steps found. Start a new step to see it here.</p>
              <button 
                onClick={handleOpenAllStepsModal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Steps
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Recommended Next Steps section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Recommended Next Steps</h3>
                <p className="text-sm text-gray-500">Based on your progress and peer activity</p>
              </div>
            </div>
            
            <button 
              onClick={handleOpenAllStepsModal}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <span>View all</span>
              <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Recommendation cards */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : recommendedSteps && recommendedSteps.length > 0 ? (
            recommendedSteps.map(rec => (
              <div key={rec.id} className="mb-3">
                <RecommendationCard
                  id={rec.id}
                  title={rec.title}
                  domain={rec.domain}
                  description={rec.description}
                  peerPercentage={rec.peerPercentage}
                  estimatedTime={rec.estimatedTime}
                  difficulty={rec.difficulty as Difficulty}
                  expandable={true}
                  expanded={expandedRecommendations.includes(rec.id)}
                  onToggleExpand={() => toggleRecommendationExpand(rec.id)}
                  onStart={() => handleStartRecommendation(rec.id)}
                  onPreview={(stepId) => handlePreviewStepFromModal(stepId)}
                  whyItMatters={rec.reason}
                  recommendedTools={rec.tools}
                  iconColor={rec.domain === 'Product' ? 'blue' : 
                             rec.domain === 'Development' ? 'purple' : 
                             rec.domain === 'Finance' ? 'green' : 'indigo'}
                  journeyId={companyJourney?.id}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recommendations available at this time.</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-4 px-4 pb-4">
            <button 
              onClick={handleOpenAllStepsModal}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              disabled={!companyJourney}
            >
              <Search className="h-4 w-4 mr-2" />
              Browse All Steps
            </button>
            <button 
              onClick={() => navigate('/company/new-journey/browse', { 
                state: { journeyId: companyJourney?.id, addCustom: true } 
              })}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none"
              disabled={!companyJourney}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Show error state if there's an error initializing the journey
  if (journeyError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Journey</h2>
          <p className="text-gray-600 mb-6">{journeyError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state if company is not loaded yet
  if (companyLoading || (journeyLoading && !companyJourney)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Show message if no company is selected
  if (!currentCompany && !companyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600 mb-6">Please select a company to view its journey dashboard.</p>
          <button
            onClick={() => navigate('/companies')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Select Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Journey Dashboard - Option 3</title>
      </Helmet>
      
      <Option1Layout
        sidebar={sidebarContent}
        mainContent={mainContent}
        rightPanel={rightPanelContent}
        title={`${currentCompany?.name || 'Your'} Founder Journey`}
        subtitle="Track your progress with personalized guidance and community insights"
        isLoading={isLoading}
      />
      
      {/* Filters Modal */}
      {showFiltersModal && (
        <FiltersModal
          isOpen={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          filterUrgent={filterUrgent}
          setFilterUrgent={setFilterUrgent}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          filterBlocked={filterBlocked}
          setFilterBlocked={setFilterBlocked}
          filterCompleted={filterCompleted}
          setFilterCompleted={setFilterCompleted}
          domains={['Product', 'Marketing', 'Finance']}
          selectedDomains={selectedDomains}
          setSelectedDomains={setSelectedDomains}
        />
      )}
      
      {/* Quick View Modal */}
      {quickViewStep && (
        <StepQuickViewModal
          step={quickViewStep}
          onClose={handleCloseQuickView}
          onOpenDetails={(stepId) => {
            handleCloseQuickView();
            handleStepClick(stepId);
          }}
        />
      )}
      
      {/* All Steps Modal */}
      <AllStepsModal
        isOpen={showAllStepsModal}
        onClose={() => setShowAllStepsModal(false)}
        onStartStep={handleStartStepFromModal}
        onPreviewStep={handlePreviewStepFromModal}
        journeyId={companyJourney?.id}
        onStepAdded={handleStepAddedFromModal}
      />
      
      {/* Active Steps Modal */}
      <ActiveStepsModal
        isOpen={showActiveStepsModal}
        onClose={() => setShowActiveStepsModal(false)}
        onOpenStep={handleStepClick}
        journeyId={companyJourney?.id}
      />
    </>
  );
};

export default NewJourneyDashboardOption3;
