import React, { useEffect, useState } from "react";
import { journeyFrameworkService } from "../../../../lib/services/journeyFramework.service";
import { companyJourneyServiceEnhanced } from "../../../../lib/services/companyJourneyEnhanced.service";
import { journeyProgressService, SmartRecommendation } from "../../../../lib/services/journeyProgress.service";
import { 
  JourneyPhase, 
  CompanyJourneyStep,
  step_status
} from "../../../../lib/types/journey-unified.types";
import { useCompany } from "../../../../lib/hooks/useCompany";
import FrameworkStepsBrowser from "../components/FrameworkStepsBrowser";
import TemplateUpdateNotifications from "../components/TemplateUpdateNotifications";

const EnhancedJourneyHomePage: React.FC = () => {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;

  // Core data state
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [companySteps, setCompanySteps] = useState<CompanyJourneyStep[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [showFrameworkBrowser, setShowFrameworkBrowser] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<step_status | ''>('');

  // Load initial data
  useEffect(() => {
    if (companyId) {
      loadInitialData();
    }
  }, [companyId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load framework data
      const [phasesData] = await Promise.all([
        journeyFrameworkService.getPhases()
      ]);
      
      setPhases(phasesData);

      if (companyId) {
        // Load company-specific data
        const [stepsData, recommendationsData] = await Promise.all([
          companyJourneyServiceEnhanced.getCompanySteps(companyId),
          journeyProgressService.getSmartRecommendations(companyId)
        ]);

        setCompanySteps(stepsData);
        setRecommendations(recommendationsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
    } catch (error) {
      console.error('Error updating step status:', error);
    }
  };

  const getStepsByPhase = (phaseId: string) => {
    return companySteps.filter(step => step.phase_id === phaseId);
  };

  const getStepStatusColor = (status: step_status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
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
              <h1 className="text-3xl font-bold text-gray-900">Journey Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track your startup's progress through the journey framework
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFrameworkBrowser(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Framework Steps
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
                  <p className="text-gray-600 mt-1">AI-powered suggestions based on your progress</p>
                </div>
                <div className="p-6 space-y-4">
                  {recommendations.slice(0, 3).map(rec => (
                    <div
                      key={rec.id}
                      className={`border-l-4 ${getPriorityColor(rec.priority)} bg-gray-50 p-4 rounded-r-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <p className="text-gray-600 mt-1">{rec.description}</p>
                          <p className="text-sm text-gray-500 mt-2">{rec.estimatedImpact}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Journey Steps by Phase */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Your Journey Steps</h2>
                  <div className="flex gap-3">
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">All Phases</option>
                      {phases.map(phase => (
                        <option key={phase.id} value={phase.id}>{phase.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as step_status)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
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
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStepStatusColor(step.status)}`}>
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
                                {step.completion_percentage && (
                                  <span>{step.completion_percentage}% complete</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {step.status === 'not_started' && (
                                  <button
                                    onClick={() => handleStepStatusUpdate(step.id, 'in_progress')}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Start
                                  </button>
                                )}
                                {step.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleStepStatusUpdate(step.id, 'completed')}
                                    className="text-xs text-green-600 hover:text-green-800"
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

          {/* Right Column - Notifications & Quick Actions */}
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Steps</span>
                  <span className="font-medium">{companySteps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {companySteps.filter(s => s.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium text-blue-600">
                    {companySteps.filter(s => s.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Not Started</span>
                  <span className="font-medium text-gray-600">
                    {companySteps.filter(s => s.status === 'not_started').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowFrameworkBrowser(true)}
                  className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Import Framework Steps
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md">
                  Create Custom Step
                </button>
                <button className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded-md">
                  View Analytics
                </button>
              </div>
            </div>
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

export default EnhancedJourneyHomePage;
