import React, { useState } from 'react';
import { Lightbulb, Brain, ArrowRight, Target } from 'lucide-react';
import { UnifiedIdea, IdeaGenerationParams } from '../../lib/types/unified-idea.types';
import { useUnifiedIdeaContext } from '../../lib/contexts/UnifiedIdeaContext';

interface IdeaExplorationPanelProps {
  ideas: UnifiedIdea[];
  selectedIdeas: UnifiedIdea[];
  onIdeaSelect: (idea: UnifiedIdea, isSelected: boolean) => void;
  onRefineIdea: (idea: UnifiedIdea) => void;
}

type ExplorationMode = 'list' | 'create' | 'generate' | 'refine';

const IdeaExplorationPanel: React.FC<IdeaExplorationPanelProps> = ({
  ideas,
  selectedIdeas,
  onIdeaSelect,
  onRefineIdea
}) => {
  const { generateIdeas, isLoading, error, setCurrentIdea } = useUnifiedIdeaContext();
  
  // State for exploration mode
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>('list');
  
  // State for idea generation form
  const [generationParams, setGenerationParams] = useState<IdeaGenerationParams>({
    topic: '',
    count: 3
  });
  
  // State for create idea form
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    solution_concept: ''
  });
  
  // Handle input changes for generation form
  const handleInputChange = (field: keyof IdeaGenerationParams, value: any) => {
    setGenerationParams({
      ...generationParams,
      [field]: value
    });
  };
  
  // Handle input changes for create idea form
  const handleNewIdeaChange = (field: string, value: string) => {
    setNewIdea({
      ...newIdea,
      [field]: value
    });
  };
  
  // Handle idea generation
  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateIdeas(generationParams);
      setExplorationMode('list');
    } catch (error) {
      console.error('Error generating ideas:', error);
    }
  };
  
  // Handle creating a new idea
  const handleCreateIdea = async () => {
    if (!newIdea.title) {
      // Show error
      return;
    }
    
    try {
      // Use generateIdeas with custom parameters to create a single idea
      const createdIdeas = await generateIdeas({
        title: newIdea.title,
        context: newIdea.description,
        count: 1
      });
      
      if (createdIdeas.length > 0) {
        // Set the newly created idea as current and move to refinement
        setCurrentIdea(createdIdeas[0]);
        onRefineIdea(createdIdeas[0]);
      }
      
      // Reset form and go back to list view
      setNewIdea({
        title: '',
        description: '',
        solution_concept: ''
      });
      setExplorationMode('list');
    } catch (error) {
      console.error('Error creating idea:', error);
    }
  };
  
  // Handle idea selection
  const handleIdeaSelection = (idea: UnifiedIdea) => {
    const isCurrentlySelected = selectedIdeas.some(i => i.id === idea.id);
    onIdeaSelect(idea, !isCurrentlySelected);
  };

  // Render the exploration options when in list mode and no ideas exist
  const renderExplorationOptions = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Option 1: I have an idea I want to develop */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mx-auto mb-4">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">I have an idea I want to develop</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Start with your own idea and develop it through our guided workflow.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setExplorationMode('create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create My Idea
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Option 2: Help me generate ideas for a specific market */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mx-auto mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Help me generate ideas for a specific market</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Specify a market and audience to get AI-generated business ideas.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setExplorationMode('generate')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Generate Ideas
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Option 3: Refine an existing idea */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
          <div className="p-5">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Refine an existing idea</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Select an idea from your workspace to continue refining it.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setExplorationMode('refine')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                disabled={ideas.length === 0}
              >
                Refine Idea
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Idea Exploration</h2>
        {explorationMode !== 'list' && (
          <button
            onClick={() => setExplorationMode('list')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Back to Ideas
          </button>
        )}
        {explorationMode === 'list' && ideas.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setExplorationMode('create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create New Idea
            </button>
            <button
              onClick={() => setExplorationMode('generate')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Generate Ideas
            </button>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
      {/* Idea generation form */}
      {explorationMode === 'generate' && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Generate Ideas for a Specific Market</h3>
          <form onSubmit={handleGenerateIdeas}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market or Industry
                </label>
                <input
                  type="text"
                  value={generationParams.topic || ''}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Healthcare, Education, Fintech"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Problem Area (optional)
                </label>
                <input
                  type="text"
                  value={generationParams.problem || ''}
                  onChange={(e) => handleInputChange('problem', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Remote work challenges, Climate change"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience (optional)
                </label>
                <input
                  type="text"
                  value={generationParams.target_audience || ''}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Small businesses, Students, Elderly"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Ideas
                </label>
                <select
                  value={generationParams.count || 3}
                  onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value={1}>1</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setExplorationMode('list')}
                className="mr-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Ideas'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Create Idea Form - Option 1 */}
      {explorationMode === 'create' && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Create Your Idea</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe your idea in one sentence <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newIdea.title}
                onChange={(e) => handleNewIdeaChange('title', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 'An AI-powered customer service tool' or 'Tutus for ponies!'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What inspired this idea?
              </label>
              <textarea
                rows={3}
                value={newIdea.description}
                onChange={(e) => handleNewIdeaChange('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 'I love ponies and think they'd look great in tutus' or 'I hate waiting for customer service calls'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Do you see this as a product, technology, or service?
              </label>
              <textarea
                rows={3}
                value={newIdea.solution_concept}
                onChange={(e) => handleNewIdeaChange('solution_concept', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., 'A physical product line of custom-made tutus' or 'A software tool that uses AI'"
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setExplorationMode('list')}
                className="mr-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateIdea}
                disabled={!newIdea.title || isLoading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create & Continue to Refinement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refine Existing Idea - Option 3 */}
      {explorationMode === 'refine' && ideas.length > 0 && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Select an Idea to Refine</h3>
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div 
                key={idea.id}
                className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => onRefineIdea(idea)}
              >
                <h4 className="font-medium">{idea.title || 'Untitled Idea'}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {idea.description || 'No description provided.'}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {idea.refinement_stage.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ideas grid - Only show in list mode */}
      {explorationMode === 'list' && (
        ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ${
                  selectedIdeas.some(i => i.id === idea.id) ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{idea.title || 'Untitled Idea'}</h3>
                    <input
                      type="checkbox"
                      checked={selectedIdeas.some(i => i.id === idea.id)}
                      onChange={() => handleIdeaSelection(idea)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-500 line-clamp-3">
                    {idea.description || 'No description provided.'}
                  </p>
                  
                  {/* Refinement stage badge */}
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {idea.refinement_stage.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => onRefineIdea(idea)}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      Refine Idea
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-8">No ideas yet. Choose an option below to get started!</p>
            {renderExplorationOptions()}
          </div>
        )
      )}
    </div>
  );
};

export default IdeaExplorationPanel;
