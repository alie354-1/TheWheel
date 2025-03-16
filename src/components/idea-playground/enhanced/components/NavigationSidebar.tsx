import React from 'react';
import { useIdeaPlayground } from '../context/IdeaPlaygroundContext';
import { StageId } from '../state/idea-workflow.machine';

interface NavigationSidebarProps {
  className?: string;
  onToggleCollaboration?: () => void;
  onToggleDashboard?: () => void;
  onToggleExternalTools?: () => void;
  onExportIdea?: () => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ 
  className = '',
  onToggleCollaboration,
  onToggleDashboard,
  onToggleExternalTools,
  onExportIdea
}) => {
  const { state, goToStage } = useIdeaPlayground();
  const { stages, currentStage, idea, progress } = state;

  // Check if a stage is completed
  const isStageCompleted = (stageId: string) => {
    if (!idea) return false;
    return progress.some(p => p.stage_id === stageId && p.idea_id === idea.id && p.is_completed);
  };

  // Check if a stage is the current stage
  const isCurrentStage = (stageId: string) => {
    return currentStage?.id === stageId;
  };

  // Check if a stage is accessible
  const isStageAccessible = (stageId: string, orderIndex: number) => {
    if (stageId === StageId.DASHBOARD) return true;
    if (!idea) return false;
    
    // The first stage is always accessible
    if (orderIndex === 0) return true;
    
    // Previous stages must be completed to access this stage
    const previousStages = stages.filter(s => s.order_index < orderIndex);
    return previousStages.every(s => isStageCompleted(s.id));
  };

  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      <h2 className="text-xl font-bold mb-4">Founder's Journey</h2>
      
      {/* Dashboard link is always available */}
      <div 
        className={`
          mb-2 p-3 rounded-md cursor-pointer
          ${isCurrentStage(StageId.DASHBOARD) 
            ? 'bg-blue-500 text-white' 
            : 'hover:bg-gray-100'}
        `}
        onClick={() => goToStage(StageId.DASHBOARD)}
      >
        <div className="flex items-center">
          <span className="material-icons mr-2">dashboard</span>
          <span>Dashboard</span>
        </div>
      </div>
      
      {/* Stage navigation */}
      <div className="mt-6">
        <h3 className="text-sm uppercase text-gray-500 mb-2">Workflow Stages</h3>
        
        {stages
          .filter(stage => stage.id !== StageId.DASHBOARD)
          .sort((a, b) => a.order_index - b.order_index)
          .map((stage) => {
            const isCompleted = isStageCompleted(stage.id);
            const isCurrent = isCurrentStage(stage.id);
            const isAccessible = isStageAccessible(stage.id, stage.order_index);
            
            return (
              <div 
                key={stage.id}
                className={`
                  mb-2 p-3 rounded-md flex items-center
                  ${isCurrent ? 'bg-blue-500 text-white' : ''}
                  ${isAccessible 
                    ? 'cursor-pointer hover:bg-gray-100' 
                    : 'opacity-50 cursor-not-allowed'}
                `}
                onClick={() => isAccessible && goToStage(stage.id)}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <span className="material-icons text-green-500">check_circle</span>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isCurrent ? 'border-white' : 'border-gray-400'}`}>
                      {stage.order_index + 1}
                    </div>
                  )}
                </div>
                <div>
                  <div className={`font-medium ${isCurrent ? 'text-white' : 'text-gray-800'}`}>
                    {stage.name}
                  </div>
                  <div className={`text-xs ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      
      {/* Actions and Tools */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-sm uppercase text-gray-500 mb-2">Tools</h3>
        
        {onToggleCollaboration && (
          <div 
            className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer mb-2 flex items-center"
            onClick={onToggleCollaboration}
          >
            <span className="material-icons text-sm mr-1">people</span>
            <span>Team Collaboration</span>
          </div>
        )}
        
        {onToggleDashboard && (
          <div 
            className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer mb-2 flex items-center"
            onClick={onToggleDashboard}
          >
            <span className="material-icons text-sm mr-1">analytics</span>
            <span>Progress Dashboard</span>
          </div>
        )}
        
        {onToggleExternalTools && (
          <div 
            className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer mb-2 flex items-center"
            onClick={onToggleExternalTools}
          >
            <span className="material-icons text-sm mr-1">integration_instructions</span>
            <span>External Tools</span>
          </div>
        )}
        
        {onExportIdea && idea && (
          <div 
            className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer mb-2 flex items-center"
            onClick={onExportIdea}
          >
            <span className="material-icons text-sm mr-1">file_download</span>
            <span>Export Idea</span>
          </div>
        )}
      </div>
      
      {/* Help and resources */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm uppercase text-gray-500 mb-2">Resources</h3>
        <div className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer mb-2 flex items-center">
          <span className="material-icons text-sm mr-1">help_outline</span>
          <span>How to use this tool</span>
        </div>
        <div className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer mb-2 flex items-center">
          <span className="material-icons text-sm mr-1">book</span>
          <span>Founder's handbook</span>
        </div>
        <div className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer flex items-center">
          <span className="material-icons text-sm mr-1">support</span>
          <span>Get support</span>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
