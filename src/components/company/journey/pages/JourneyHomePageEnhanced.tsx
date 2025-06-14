import React, { useEffect, useState } from "react";
import { journeyFrameworkService } from "../../../../lib/services/journeyFramework.service";
import { companyJourneyServiceEnhanced } from "../../../../lib/services/companyJourneyEnhanced.service";
import { journeyProgressService, ProgressAnalytics } from "../../../../lib/services/journeyProgress.service";
import { communityJourneyIntegrationService, PeerProgress } from "../../../../lib/services/communityJourneyIntegration.service";
import { 
  JourneyPhase, 
  CompanyJourneyStep,
  step_status
} from "../../../../lib/types/journey-unified.types";
import { useCompany } from "../../../../lib/hooks/useCompany";
import SmartJourneyDashboard from "../components/SmartJourneyDashboard";
import FrameworkStepsBrowser from "../components/FrameworkStepsBrowser";
import TemplateUpdateNotifications from "../components/TemplateUpdateNotifications";

const JourneyHomePageEnhanced: React.FC = () => {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;

  // Core data state
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [companySteps, setCompanySteps] = useState<CompanyJourneyStep[]>([]);
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [peerProgress, setPeerProgress] = useState<PeerProgress[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [showFrameworkBrowser, setShowFrameworkBrowser] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<step_status | ''>('');
  
  // Load initial data
  useEffect(() => {
    if (companyId) {
      loadJourneyData();
    }
  }, [companyId]);

  const loadJourneyData = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        phasesData,
        stepsData,
        analyticsData,
        peerData
      ] = await Promise.all([
        journeyFrameworkService.getPhases(),
        companyJourneyServiceEnhanced.getCompanySteps(companyId),
        journeyProgressService.getProgressAnalytics(companyId),
        communityJourneyIntegrationService.getPeerProgress(companyId, {
          anonymized: true,
          limit: 5
        })
      ]);

      setPhases(phasesData);
      setCompanySteps(stepsData);
      setAnalytics(analyticsData);
      setPeerProgress(peerData);
    } catch (error) {
      console.error('Error loading journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepImport = async (stepIds: string[]) => {
    if (!companyId) return;
    
    try {
      await journeyFrameworkService.importStepsToCompany({
        companyId,
        stepIds,
        customizeOnImport: false,
        preserveOrder: true
      });

      // Reload company steps
      const updatedSteps = await companyJourneyServiceEnhanced.getCompanySteps(companyId);
      setCompanySteps(updatedSteps);
      setShowFrameworkBrowser(false);
    } catch (error) {
      console.error('Error importing steps:', error);
    }
  };

  const handleStepStatusUpdate = async (stepId: string, status: step_status) => {
    if (!companyId) return;

    try {
      await companyJourneyServiceEnhanced.updateStepProgress(companyId, stepId, { status });
      
      // Update local state
      setCompanySteps(prev => 
        prev.map(step => 
          step.id === stepId ? { ...step, status } : step
        )
      );

      // Reload analytics to reflect changes
      const updatedAnalytics = await journeyProgressService.getProgressAnalytics(companyId);
      setAnalytics(updatedAnalytics);
    } catch (error) {
      console.error('Error updating step status:', error);
    }
  };

  const getStepsByPhase = (phaseId: string) => {
    return companySteps.filter(step => step.phase_id === phaseId);
  };

  const getStepStatusColor = (status: step_status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSteps = companySteps.filter(step => {
    if (selectedPhase && step.phase_id !== selectedPhase) return false;
    if (selectedStatus && step.status !== selectedStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Journey Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track your progress through the startup journey with AI-powered insights
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFrameworkBrowser(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Framework Steps
              </button>
            </div>
          </div>
        </div>

        {/* Smart Journey Dashboard */}
        <div className="mb-8">
          <SmartJourneyDashboard
            companyId={companyId}
            showRecommendations={true}
            showPeerInsights={true}
            showProgress={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Journey Steps by Phase */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Your Journey Steps</h2>
                  <div className="flex gap-3">
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Phases</option>
                      {phases.map(phase => (
                        <option key={phase.id} value={phase.id}>{phase.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as step_status)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {phases.map(phase => {
                  const phaseSteps = getStepsByPhase(phase.id).filter(step => {
                    if (selectedStatus && step.status !== selectedStatus) return false;
                    return true;
                  });

                  if (selectedPhase && selectedPhase !== phase.id) return null;
                  if (phaseSteps.length === 0 && selectedPhase === '') return null;

                  return (
                    <div key={phase.id} className="mb-8 last:mb-0">
                      <div className="flex items-center mb-4">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: phase.color || '#6B7280' }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                        <span className="ml-2 text-sm text-gray-500">
                          ({phaseSteps.length} steps)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {phaseSteps.map(step => (
                          <div
                            key={step.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 flex-1">{step.name}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStepStatusColor(step.status)}`}>
                                {step.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {step.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {step.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {step.completion_percentage !== undefined && (
                                  <span>{step.completion_percentage}% complete</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {step.status === 'not_started' && (
                                  <button
                                    onClick={() => handleStepStatusUpdate(step.id, 'in_progress')}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Start
                                  </button>
                                )}
                                {step.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleStepStatusUpdate(step.id, 'completed')}
                                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredSteps.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No steps found</p>
                    <button
                      onClick={() => setShowFrameworkBrowser(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Browse Framework Steps
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Update Notifications */}
            {companyId && (
              <TemplateUpdateNotifications
                companyId={companyId}
                onNotificationClick={(notification) => {
                  console.log('Notification clicked:', notification);
                }}
              />
            )}

            {/* Quick Stats */}
            {analytics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium text-green-600">{Math.round(analytics.completionRate)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Steps</span>
                    <span className="font-medium">{analytics.completedSteps} / {analytics.totalSteps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Phase</span>
                    <span className="font-medium">{analytics.currentPhase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600">{analytics.inProgressSteps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Completion</span>
                    <span className="font-medium">{analytics.estimatedCompletionDays} days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowFrameworkBrowser(true)}
                  className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Import Framework Steps
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => console.log('Create custom step')}
                >
                  Create Custom Step
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => console.log('View analytics')}
                >
                  View Detailed Analytics
                </button>
              </div>
            </div>

            {/* Peer Progress Insights */}
            {peerProgress.length > 0 && (
              <div className="bg-blue-50 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Community Insights</h3>
                <div className="space-y-3">
                  {peerProgress.slice(0, 3).map(peer => (
                    <div key={peer.companyId} className="bg-white rounded-md p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{peer.companyName}</span>
                        <span className="text-sm font-medium text-blue-600">
                          {Math.round(peer.completionRate)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {peer.industry} • {peer.currentPhase}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Framework Steps Browser Modal */}
      {showFrameworkBrowser && companyId && (
        <FrameworkStepsBrowser
          companyId={companyId}
          onImportSteps={handleStepImport}
          onClose={() => setShowFrameworkBrowser(false)}
        />
      )}
    </div>
  );
};

export default JourneyHomePageEnhanced;
