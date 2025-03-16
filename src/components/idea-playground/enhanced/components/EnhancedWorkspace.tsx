import React, { useState, useEffect } from 'react';
import { IdeaPlaygroundProvider } from '../context/IdeaPlaygroundContext';
import { useIdeaPlayground } from '../context/IdeaPlaygroundContext';
import NavigationSidebar from './NavigationSidebar';
import Dashboard from './Dashboard';
import IdeaGenerationStage from '../components/stages/IdeaGenerationStage';
import InitialAssessmentStage from '../components/stages/InitialAssessmentStage';
import DetailedRefinementStage from '../components/stages/DetailedRefinementStage';
import MarketValidationStage from '../components/stages/MarketValidationStage';
import BusinessModelStage from '../components/stages/BusinessModelStage';
import GoToMarketStage from '../components/stages/GoToMarketStage';
import CompanyFormationStage from '../components/stages/CompanyFormationStage';
import { StageId } from '../state/idea-workflow.machine';
import { IdeaPlaygroundIdea } from '../../../../lib/types/idea-playground.types';
import { useAuthStore } from '../../../../lib/store';

// Import new shared components
import TeamCollaboration from '../../../idea-playground/shared/TeamCollaboration';
import IdeaDashboard from '../../../idea-playground/shared/IdeaDashboard';
import OnboardingTutorial from '../../../idea-playground/shared/OnboardingTutorial';
import OnboardingWizard from '../../../../components/ui/OnboardingWizard';
import { FeatureConfig, FeatureStep, FeatureHighlight } from '../../../../components/ui/OnboardingWizard';
import ExternalToolsIntegration from '../../../idea-playground/shared/ExternalToolsIntegration';
import IdeaExportModal from '../../../idea-playground/shared/IdeaExportModal';

interface EnhancedWorkspaceProps {
  ideas: IdeaPlaygroundIdea[];
  onCreateNewIdea: () => void;
  onSaveIdea: (idea: IdeaPlaygroundIdea) => Promise<void>;
  onExportIdea?: (idea: IdeaPlaygroundIdea) => void;
  initialIdea?: IdeaPlaygroundIdea;
  className?: string;
}

/**
 * Enhanced Workspace component that provides the IdeaPlayground context
 */
const EnhancedWorkspace: React.FC<EnhancedWorkspaceProps> = ({
  ideas,
  onCreateNewIdea,
  onSaveIdea,
  onExportIdea,
  initialIdea,
  className = ''
}) => {
  const { featureFlags } = useAuthStore();
  const useMockAI = featureFlags?.useMockAI?.enabled || false;
  const useMultiTieredAI = featureFlags?.useMultiTieredAI?.enabled || false;
  
  // Wrap the workspace content with the provider
  return (
    <div className={`h-full ${className}`}>
      <IdeaPlaygroundProvider initialIdea={initialIdea}>
        <WorkspaceInner 
          ideas={ideas} 
          onCreateNewIdea={onCreateNewIdea} 
          onSaveIdea={onSaveIdea}
          onExportIdea={onExportIdea}
          useMockAI={useMockAI}
          useMultiTieredAI={useMultiTieredAI}
        />
      </IdeaPlaygroundProvider>
    </div>
  );
};

/**
 * Inner component that has access to the context and receives props from parent
 */
const WorkspaceInner: React.FC<{
  ideas: IdeaPlaygroundIdea[];
  onCreateNewIdea: () => void;
  onSaveIdea: (idea: IdeaPlaygroundIdea) => Promise<void>;
  onExportIdea?: (idea: IdeaPlaygroundIdea) => void;
  useMockAI: boolean;
  useMultiTieredAI: boolean;
}> = ({ 
  ideas, 
  onCreateNewIdea, 
  onSaveIdea,
  onExportIdea,
  useMockAI,
  useMultiTieredAI
}) => {
  const { state, saveIdeaData, setStage } = useIdeaPlayground();
  const { currentStage, idea } = state;
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExternalTools, setShowExternalTools] = useState(false);
  const [showFeatureIntro, setShowFeatureIntro] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  // Handle saving idea data
  const handleSaveIdea = async (data: Partial<IdeaPlaygroundIdea>) => {
    if (!idea) return;
    
    // Update local state
    saveIdeaData(data);
    
    // Save to backend
    const updatedIdea = { ...idea, ...data };
    await onSaveIdea(updatedIdea as IdeaPlaygroundIdea);
  };

  // Handle exporting idea
  const handleExportIdea = () => {
    if (!idea || !onExportIdea) return;
    
    // Show the export modal if it exists, otherwise use the provided function
    if (idea) {
      setShowExportModal(true);
    } else {
      onExportIdea(idea);
    }
  };
  
  // Handle onboarding start
  const handleOnboardingStart = async () => {
    setShowOnboarding(false);
    
    console.log("Onboarding dismissed, showing main interface");
    
    try {
      // Create a default idea immediately with more complete data
      const defaultIdea: IdeaPlaygroundIdea = {
        id: `idea-${Date.now()}`,
        canvas_id: 'default-canvas',
        title: 'New Business Idea',
        description: 'A starting point for your business idea',
        problem_statement: 'Businesses need better ways to organize and manage their operations',
        solution_concept: 'A comprehensive platform that integrates various business processes',
        target_audience: 'Small to medium-sized businesses',
        unique_value: 'All-in-one solution with intuitive interface',
        business_model: 'SaaS subscription with tiered pricing',
        marketing_strategy: 'Content marketing and referral program',
        revenue_model: 'Monthly subscription',
        go_to_market: 'Freemium model with paid upgrades',
        market_size: 'Over $10B market opportunity',
        used_company_context: false,
        is_archived: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save the idea data
      await saveIdeaData(defaultIdea);
      
      // Set initial state to IDEA_GENERATION stage directly
      setStage(StageId.IDEA_GENERATION);
      
      // Show feature introduction after a brief delay
      setTimeout(() => {
        setShowFeatureIntro(true);
        // Auto-hide after 8 seconds
        setTimeout(() => {
          setShowFeatureIntro(false);
        }, 8000);
      }, 1500);

      // Automatically show team collaboration feature after a delay to increase visibility
      setTimeout(() => {
        setShowCollaboration(true);
      }, 3000);
    } catch (error) {
      console.error("Error in onboarding completion:", error);
    }
  };
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    // Any actions after onboarding is complete
  };
  
  // Handle collaboration toggling
  const handleToggleCollaboration = () => {
    setShowCollaboration(prev => !prev);
  };
  
  // Handle dashboard toggling
  const handleToggleDashboard = () => {
    setShowDashboard(prev => !prev);
  };
  
  // Handle external tools toggling
  const handleToggleExternalTools = () => {
    setShowExternalTools(prev => !prev);
  };
  
  // Feature configuration for the OnboardingWizard
  const getIdeaPlaygroundFeatureConfig = (): FeatureConfig => {
    return {
      id: 'idea-playground',
      name: 'Idea Playground',
      description: 'Develop your business ideas from concept to execution plan',
      steps: [
        {
          title: 'Define your idea concept',
          description: 'Start with a clear, concise description of your business idea'
        },
        {
          title: 'Articulate problem & solution',
          description: 'Identify the problem you solve and how your solution addresses it'
        },
        {
          title: 'Identify target audience',
          description: 'Define who will benefit most from your product or service'
        },
        {
          title: 'Develop business model',
          description: 'Outline how your idea will generate revenue and create value'
        },
        {
          title: 'Create go-to-market plan',
          description: 'Plan how you will launch your product and reach customers'
        }
      ],
      features: [
        {
          title: 'AI Assistance',
          description: 'Get suggestions, enhancement, and guidance from our AI at every step',
          colorScheme: 'indigo'
        },
        {
          title: 'Collaborative Tools',
          description: 'Share ideas with team members and collect feedback',
          colorScheme: 'purple'
        },
        {
          title: 'Export Options',
          description: 'Save your work in various formats for presentations or sharing',
          colorScheme: 'blue'
        },
        {
          title: 'Progress Tracking',
          description: 'Monitor your idea development with visual progress indicators',
          colorScheme: 'green'
        }
      ]
    };
  };

  // Render the appropriate stage component based on the current stage
  const renderStageComponent = () => {
    if (!currentStage) return null;

    switch (currentStage.id) {
      case StageId.DASHBOARD:
        return (
          <Dashboard 
            ideas={ideas} 
            onCreateNewIdea={onCreateNewIdea} 
          />
        );
      case StageId.IDEA_GENERATION:
        return (
          <IdeaGenerationStage 
            onSave={handleSaveIdea} 
          />
        );
      case StageId.INITIAL_ASSESSMENT:
        return (
          <InitialAssessmentStage 
            onSave={handleSaveIdea} 
          />
        );
      case StageId.DETAILED_REFINEMENT:
        return (
          <DetailedRefinementStage 
            onSave={handleSaveIdea} 
          />
        );
      case StageId.MARKET_VALIDATION:
        return (
          <MarketValidationStage 
            onSave={handleSaveIdea} 
          />
        );
      case StageId.BUSINESS_MODEL:
        return (
          <BusinessModelStage 
            onSave={handleSaveIdea} 
          />
        );
      case StageId.GO_TO_MARKET:
        return (
          <GoToMarketStage 
            onSave={handleSaveIdea} 
          />
        );
      case StageId.COMPANY_FORMATION:
        return (
          <CompanyFormationStage 
            onSave={handleSaveIdea}
            onExport={handleExportIdea}
          />
        );
      default:
        return <div>Unknown stage</div>;
    }
  };

  return (
    <div className="flex h-full">
      <NavigationSidebar 
        className="w-64 flex-shrink-0" 
        onToggleCollaboration={handleToggleCollaboration}
        onToggleDashboard={handleToggleDashboard}
        onToggleExternalTools={handleToggleExternalTools}
        onExportIdea={handleExportIdea}
      />
      
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Show onboarding wizard if it's the first time */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <OnboardingWizard
              feature={getIdeaPlaygroundFeatureConfig()}
              onStart={handleOnboardingStart}
              primaryColor="bg-indigo-600"
              startButtonText="Start Your Founder's Journey"
              className="max-w-3xl"
            />
          </div>
        )}
        
        {/* Feature introduction notification */}
        {showFeatureIntro && (
          <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">New Features Available!</h4>
                <p className="text-sm">Try Team Collaboration, Analytics Dashboard, and Export Tools in the sidebar!</p>
              </div>
              <button 
                className="ml-4 text-white" 
                onClick={() => setShowFeatureIntro(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex flex-row h-full overflow-hidden">
          {/* Main workspace */}
          <div className="flex-grow p-4 overflow-auto">
            {renderStageComponent()}
            
            {/* Feature discovery hints - visible when main workspace is shown */}
            {!showOnboarding && !showCollaboration && !showDashboard && !showExternalTools && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Powerful Features Available</h3>
                <p className="text-blue-700 mb-4">
                  Use the sidebar to access these powerful features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-3 bg-white rounded-md shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-50"
                    onClick={handleToggleCollaboration}
                  >
                    <h4 className="font-medium text-blue-700">Team Collaboration</h4>
                    <p className="text-sm text-blue-600">Invite team members and collect feedback</p>
                  </div>
                  <div 
                    className="p-3 bg-white rounded-md shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-50"
                    onClick={handleToggleDashboard}
                  >
                    <h4 className="font-medium text-blue-700">Analytics Dashboard</h4>
                    <p className="text-sm text-blue-600">Track your progress with visual metrics</p>
                  </div>
                  <div 
                    className="p-3 bg-white rounded-md shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-50"
                    onClick={handleToggleExternalTools}
                  >
                    <h4 className="font-medium text-blue-700">External Tools</h4>
                    <p className="text-sm text-blue-600">Connect with your favorite productivity tools</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Collaboration panel (conditionally shown) */}
          {showCollaboration && idea && (
            <div className="w-96 border-l border-gray-200 h-full overflow-auto p-4 bg-white">
              <TeamCollaboration 
                idea={idea}
                onMemberAdd={async (email, role) => console.log('Adding member', email, role)}
                onMemberRemove={async (memberId) => console.log('Removing member', memberId)}
                onMemberRoleChange={async (memberId, newRole) => console.log('Changing role', memberId, newRole)}
                onCommentAdd={async (text, section) => console.log('Adding comment', text, section)}
                onCommentResolve={async (commentId) => console.log('Resolving comment', commentId)}
                onCommentDelete={async (commentId) => console.log('Deleting comment', commentId)}
              />
            </div>
          )}
          
          {/* External tools panel (conditionally shown) */}
          {showExternalTools && (
            <div className="w-96 border-l border-gray-200 h-full overflow-auto p-4 bg-white">
              <ExternalToolsIntegration 
                idea={idea as IdeaPlaygroundIdea}
                onSuccess={(message: string) => console.log('Success:', message)}
                onError={(error: string) => console.log('Error:', error)}
              />
            </div>
          )}
        </div>
        
        {/* Dashboard overlay (conditionally shown) */}
        {showDashboard && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Idea Development Dashboard</h2>
                <button 
                  onClick={handleToggleDashboard}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <IdeaDashboard 
                  ideas={ideas}
                  selectedIdea={idea}
                  onIdeaSelect={(ideaId) => console.log('Selected idea', ideaId)}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Export modal (conditionally shown) */}
        {showExportModal && idea && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 flex items-center justify-center p-4">
            <IdeaExportModal 
              idea={idea}
              onClose={() => setShowExportModal(false)}
              onExport={(format, sections) => {
                console.log('Exporting idea', format, sections);
                if (onExportIdea) onExportIdea(idea);
                setShowExportModal(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedWorkspace;
