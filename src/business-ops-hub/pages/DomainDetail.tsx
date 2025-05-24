/**
 * Business Operations Hub - Domain Detail Page
 * 
 * Displays detailed information about a business domain and its steps
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDomainDetail } from '../hooks/useDomainDetail';
import StepList from '../components/StepList';
import { DomainStepStatus } from '../types/domain.types';
import DomainStepIntegrationPanel from '../components/DomainStepIntegrationPanel';
import WorkspaceContainer from '../components/workspace/WorkspaceContainer';
import { supabase } from '../../lib/supabase';

/**
 * DomainDetail component - displays information about a domain and its steps
 */
export const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const {
    domain,
    steps,
    groupedSteps,
    loadingDomain,
    loadingSteps,
    error,
    refreshSteps,
    updateDomain,
    createStep,
    groupStepsByPhase
  } = useDomainDetail(domainId || '');
  
  const [showCreateStepForm, setShowCreateStepForm] = useState<boolean>(false);
  const [stats, setStats] = useState<Record<string, number>>({
    [DomainStepStatus.COMPLETED]: 0,
    [DomainStepStatus.IN_PROGRESS]: 0,
    [DomainStepStatus.NOT_STARTED]: 0,
    [DomainStepStatus.SKIPPED]: 0
  });

  // Workspace configuration state
  const [workspaceConfig, setWorkspaceConfig] = useState<any>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState<boolean>(true);

  // TODO: Replace with real companyId/userId from context/auth
  const companyId = "demo-company";
  const userId = "demo-user";

  // Fetch workspace configuration for this domain
  useEffect(() => {
    async function fetchWorkspaceConfig() {
      if (!domainId) return;
      setWorkspaceLoading(true);
      const { data, error } = await supabase
        .from("workspace_configurations")
        .select("*")
        .eq("domain_id", domainId)
        .eq("company_id", companyId)
        .eq("user_id", userId)
        .single();
      if (error || !data) {
        setWorkspaceConfig(null);
      } else {
        setWorkspaceConfig(data.configuration?.layout || null);
      }
      setWorkspaceLoading(false);
    }
    fetchWorkspaceConfig();
  }, [domainId]);
  
  // Calculate step statistics
  useEffect(() => {
    if (steps.length > 0) {
      const newStats: Record<string, number> = {
        [DomainStepStatus.COMPLETED]: 0,
        [DomainStepStatus.IN_PROGRESS]: 0,
        [DomainStepStatus.NOT_STARTED]: 0,
        [DomainStepStatus.SKIPPED]: 0
      };
      
      steps.forEach(step => {
        newStats[step.status] = (newStats[step.status] || 0) + 1;
      });
      
      setStats(newStats);
    }
  }, [steps]);
  
  if (loadingDomain && !domain) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-10 w-1/4 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !domain) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          <strong>Error:</strong> {error?.message || 'Domain not found'}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate('/business-ops-hub')}
        >
          Back to Business Operations Hub
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with domain info */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{domain.name}</h1>
            {domain.icon && (
              <span className="text-2xl">{domain.icon}</span>
            )}
          </div>
          <p className="text-gray-600 mt-2">{domain.description}</p>
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => navigate('/business-ops-hub')}
            >
              Back
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowCreateStepForm(true)}
            >
              Add Step
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-4 min-w-60">
          <h3 className="text-lg font-semibold mb-2">Step Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{stats[DomainStepStatus.COMPLETED]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-medium">{stats[DomainStepStatus.IN_PROGRESS]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Not Started:</span>
              <span className="font-medium">{stats[DomainStepStatus.NOT_STARTED]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skipped:</span>
              <span className="font-medium">{stats[DomainStepStatus.SKIPPED]}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{steps.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Workspace UI */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Workspace</h2>
        {workspaceLoading ? (
          <div className="text-gray-500">Loading workspace...</div>
        ) : (
          <WorkspaceContainer
            domain={domain}
            title={domain.name + " Workspace"}
            subtitle={domain.description || ""}
            tabs={
              workspaceConfig?.tabs && workspaceConfig.tabs.length > 0
                ? workspaceConfig.tabs
                : [
                    {
                      id: "overview",
                      title: "Overview",
                      content: (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Domain Overview</h3>
                          <p>{domain.description || "No description available."}</p>
                        </div>
                      ),
                    },
                    {
                      id: "steps",
                      title: "Steps",
                      content: (
                        <StepList
                          domainId={domainId || ""}
                          groupedSteps={groupedSteps}
                          isLoading={loadingSteps}
                        />
                      ),
                    },
                  ]
            }
            sidebarItems={
              workspaceConfig?.sidebarItems && workspaceConfig.sidebarItems.length > 0
                ? workspaceConfig.sidebarItems
                : [
                    {
                      id: "stats",
                      title: "Step Stats",
                      content: (
                        <div>
                          <h4 className="font-semibold mb-1">Step Statistics</h4>
                          <ul>
                            <li>Completed: {stats[DomainStepStatus.COMPLETED]}</li>
                            <li>In Progress: {stats[DomainStepStatus.IN_PROGRESS]}</li>
                            <li>Not Started: {stats[DomainStepStatus.NOT_STARTED]}</li>
                            <li>Skipped: {stats[DomainStepStatus.SKIPPED]}</li>
                            <li>Total: {steps.length}</li>
                          </ul>
                        </div>
                      ),
                      onClick: () => {},
                      active: true,
                    },
                  ]
            }
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">Workspace Content Area</h3>
              <p>
                This is the default workspace content. Use the tabs above to navigate between Overview and Steps.
              </p>
            </div>
          </WorkspaceContainer>
        )}
      </div>

      {/* Domain Step Management UI */}
      <div className="mb-8">
        <DomainStepIntegrationPanel domainId={domainId || ""} companyId={domain.company_id || ""} />
      </div>
      
      {/* Create Step Form */}
      {showCreateStepForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Step</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowCreateStepForm(false)}
            >
              &times;
            </button>
          </div>
          {/* Add step form would go here */}
          <p className="text-gray-500 italic mb-4">
            Form implementation would go here
          </p>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
              onClick={() => setShowCreateStepForm(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // This would use the createStep function
                setShowCreateStepForm(false);
              }}
            >
              Create Step
            </button>
          </div>
        </div>
      )}
      
      {/* Steps List */}
      <h2 className="text-2xl font-semibold mb-4">Steps</h2>
      <StepList 
        domainId={domainId || ''} 
        groupedSteps={groupedSteps} 
        isLoading={loadingSteps} 
      />
    </div>
  );
};

export default DomainDetail;
