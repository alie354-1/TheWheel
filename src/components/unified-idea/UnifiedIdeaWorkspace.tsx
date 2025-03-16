import React, { useState } from 'react';
import { useUnifiedIdeaContext } from '../../lib/contexts/UnifiedIdeaContext';
import { IdeaGenerationParams, UnifiedIdea } from '../../lib/types/unified-idea.types';

// Import sub-components (to be implemented)
import WorkspaceHeader from './WorkspaceHeader';
import IdeaExplorationPanel from './IdeaExplorationPanel';
import IdeaRefinementPanel from './IdeaRefinementPanel';
// These components will be implemented later
const IdeaComparisonPanel: React.FC<{ideas: UnifiedIdea[], onBack: () => void}> = ({ideas, onBack}) => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Compare Ideas</h2>
    <p className="text-gray-500 mb-4">This feature is coming soon!</p>
    <button 
      onClick={onBack}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
    >
      Back to Ideas
    </button>
  </div>
);

const IdeaMergePanel: React.FC<{ideas: UnifiedIdea[], onBack: () => void}> = ({ideas, onBack}) => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Merge Ideas</h2>
    <p className="text-gray-500 mb-4">This feature is coming soon!</p>
    <button 
      onClick={onBack}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
    >
      Back to Ideas
    </button>
  </div>
);

// Define the view modes
type ViewMode = 'exploration' | 'refinement' | 'comparison' | 'merge';

interface UnifiedIdeaWorkspaceProps {
  workspaceId?: string;
  initialIdeaId?: string;
}

const UnifiedIdeaWorkspace: React.FC<UnifiedIdeaWorkspaceProps> = () => {
  // Get context
  const {
    currentWorkspace,
    currentIdea,
    setCurrentIdea,
    ideas,
    isLoading,
    error,
    success,
    createWorkspace
  } = useUnifiedIdeaContext();

  // State for the current view mode
  const [viewMode, setViewMode] = useState<ViewMode>('exploration');
  
  // State for selected ideas (for comparison and merging)
  const [selectedIdeas, setSelectedIdeas] = useState<UnifiedIdea[]>([]);
  
  // State for workspace creation form - MOVED UP before conditional returns
  const [workspaceForm, setWorkspaceForm] = useState({
    title: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Handle idea selection for comparison or merging
  const handleIdeaSelection = (idea: UnifiedIdea, isSelected: boolean) => {
    if (isSelected) {
      setSelectedIdeas([...selectedIdeas, idea]);
    } else {
      setSelectedIdeas(selectedIdeas.filter(i => i.id !== idea.id));
    }
  };


  // Handle switching to refinement mode for a specific idea
  const handleRefineIdea = (idea: UnifiedIdea) => {
    setCurrentIdea(idea);
    setViewMode('refinement');
  };

  // Handle switching to comparison mode
  const handleCompareIdeas = () => {
    if (selectedIdeas.length < 2) {
      // Show error or notification
      return;
    }
    setViewMode('comparison');
  };

  // Handle switching to merge mode
  const handleMergeIdeas = () => {
    if (selectedIdeas.length < 2) {
      // Show error or notification
      return;
    }
    setViewMode('merge');
  };

  // Handle returning to exploration mode
  const handleBackToExploration = () => {
    setViewMode('exploration');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }
  
  // Handle workspace form input changes
  const handleWorkspaceInputChange = (field: string, value: string) => {
    setWorkspaceForm({
      ...workspaceForm,
      [field]: value
    });
  };
  
  // Handle workspace creation
  const handleCreateWorkspace = async () => {
    if (!workspaceForm.title.trim()) {
      return; // Don't create workspace without a title
    }
    
    setIsCreating(true);
    try {
      await createWorkspace(workspaceForm.title, workspaceForm.description);
      // Reset form after successful creation
      setWorkspaceForm({
        title: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // No workspace selected
  if (!currentWorkspace) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Unified Idea Workspace</h2>
        <p className="mb-6 text-gray-600">Create a new workspace to start generating and refining your ideas.</p>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Create New Workspace</h3>
          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={workspaceForm.title}
                onChange={(e) => handleWorkspaceInputChange('title', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 'My Startup Ideas' or 'Q2 Product Brainstorm'"
              />
            </div>
            
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                rows={3}
                value={workspaceForm.description}
                onChange={(e) => handleWorkspaceInputChange('description', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Describe the purpose of this workspace"
              />
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={!workspaceForm.title.trim() || isCreating}
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Workspaces help you organize your ideas and keep related concepts together.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Workspace header with controls */}
      <WorkspaceHeader 
        workspace={currentWorkspace}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedIdeasCount={selectedIdeas.length}
        onCompare={handleCompareIdeas}
        onMerge={handleMergeIdeas}
      />

      {/* Success message */}
      {success && (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <div className="text-green-700">{success}</div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-grow overflow-auto">
        {viewMode === 'exploration' && (
          <IdeaExplorationPanel 
            ideas={ideas}
            selectedIdeas={selectedIdeas}
            onIdeaSelect={handleIdeaSelection}
            onRefineIdea={handleRefineIdea}
          />
        )}

        {viewMode === 'refinement' && currentIdea && (
          <IdeaRefinementPanel 
            idea={currentIdea}
            onBack={handleBackToExploration}
          />
        )}

        {viewMode === 'comparison' && (
          <IdeaComparisonPanel 
            ideas={selectedIdeas}
            onBack={handleBackToExploration}
          />
        )}

        {viewMode === 'merge' && (
          <IdeaMergePanel 
            ideas={selectedIdeas}
            onBack={handleBackToExploration}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedIdeaWorkspace;
