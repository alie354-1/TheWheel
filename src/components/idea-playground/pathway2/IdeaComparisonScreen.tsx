import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIContext } from '../../../lib/services/ai/ai-context.provider';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import { useAuthStore } from '../../../lib/store';

interface IdeaComparisonScreenProps {
  ideas: IdeaPlaygroundIdea[];
  onSelectIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Idea Comparison Screen for Pathway 2
 * Allows users to compare multiple AI-generated ideas and select the most promising one
 */
const IdeaComparisonScreen: React.FC<IdeaComparisonScreenProps> = ({
  ideas,
  onSelectIdea,
}) => {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState<'relevance' | 'potential' | 'novelty'>('relevance');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isLoading: aiIsLoading } = useAIContext();
  
  // Filter ideas that were just created (within the last hour)
  useEffect(() => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Filter ideas by creation time and ensure they have proper values
    const recentIdeas = ideas.filter(idea => {
      const createdAt = new Date(idea.created_at);
      return createdAt >= oneHourAgo && idea.title && idea.description;
    });
    
    setFilteredIdeas(recentIdeas);
    setIsLoading(false);
  }, [ideas]);

  // Handle selecting an idea and navigating to the next screen
  const handleSelectIdea = () => {
    if (!selectedIdeaId) {
      setValidationError('Please select an idea to continue');
      return;
    }
    
    setValidationError(null);
    navigate(`/idea-hub/playground/pathway/2/idea-refinement/${selectedIdeaId}`);
  };

  // Handle sorting the ideas
  const handleSort = (criteria: 'relevance' | 'potential' | 'novelty') => {
    setSortCriteria(criteria);
    
    // Sort the ideas based on the criteria
    const sortedIdeas = [...filteredIdeas];
    switch (criteria) {
      case 'relevance':
        // Sort by title length (simple proxy for relevance in this example)
        sortedIdeas.sort((a, b) => a.title.length - b.title.length);
        break;
      case 'potential':
        // Sort by description length (simple proxy for potential in this example)
        sortedIdeas.sort((a, b) => b.description.length - a.description.length);
        break;
      case 'novelty':
        // Sort by creation date (newest first)
        sortedIdeas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    
    setFilteredIdeas(sortedIdeas);
  };

  // Render a loading state while waiting for ideas
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-r-transparent rounded-full"></div>
      </div>
    );
  }

  // Render an empty state if no ideas were generated
  if (filteredIdeas.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Ideas Generated</h1>
        <p className="text-gray-600 mb-6">
          We couldn't find any recently generated ideas for your selected industry. 
          Please go back and try again with a different industry or more specific criteria.
        </p>
        <button
          type="button"
          onClick={() => navigate('/idea-hub/playground/pathway/2/industry-selection')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Industry Selection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Industry Ideas</h1>
        <p className="text-gray-600">
          Review these AI-generated ideas for your industry and select the most promising one to refine further.
        </p>
      </div>
      
      {validationError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {validationError}
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-700 mr-2">Sort by:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => handleSort('relevance')}
              className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                sortCriteria === 'relevance'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Relevance
            </button>
            <button
              type="button"
              onClick={() => handleSort('potential')}
              className={`px-3 py-1 text-sm font-medium ${
                sortCriteria === 'potential'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              Potential
            </button>
            <button
              type="button"
              onClick={() => handleSort('novelty')}
              className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                sortCriteria === 'novelty'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Novelty
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer border-2 transition-all ${
              selectedIdeaId === idea.id
                ? 'border-indigo-500'
                : 'border-transparent hover:border-indigo-200'
            }`}
            onClick={() => setSelectedIdeaId(idea.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
              {selectedIdeaId === idea.id && (
                <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  Selected
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-4">{idea.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Problem Statement</h4>
                <p className="text-sm text-gray-600">
                  {idea.problem_statement || 'No problem statement available'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Solution Concept</h4>
                <p className="text-sm text-gray-600">
                  {idea.solution_concept || 'No solution concept available'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/idea-hub/playground/pathway/2/industry-selection')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back to Industry Selection
        </button>
        
        <button
          type="button"
          onClick={handleSelectIdea}
          disabled={aiIsLoading}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
            aiIsLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700'
          }`}
        >
          Continue with Selected Idea
        </button>
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Selection Tips</h3>
        <p className="text-sm text-blue-700">
          Choose the idea that resonates most with you and has the best combination of novelty, feasibility, and market potential. 
          You'll be able to refine and enhance this idea in the next step.
        </p>
      </div>
    </div>
  );
};

export default IdeaComparisonScreen;
