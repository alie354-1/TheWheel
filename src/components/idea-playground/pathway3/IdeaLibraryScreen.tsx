import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import { useAuthStore } from '../../../lib/store';

interface IdeaLibraryScreenProps {
  ideas: IdeaPlaygroundIdea[];
  onSelectIdea: (ideaId: string) => IdeaPlaygroundIdea | null;
}

/**
 * Idea Library Screen for Pathway 3
 * Allows users to browse, filter, and select existing ideas for refinement
 */
const IdeaLibraryScreen: React.FC<IdeaLibraryScreenProps> = ({
  ideas,
  onSelectIdea,
}) => {
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'relevance'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'mine'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Filter and sort ideas
  useEffect(() => {
    setIsLoading(true);
    
    // Filter ideas based on search query and filter criteria
    let result = [...ideas];
    
    // Filter by ownership if "Mine" is selected
    if (filterBy === 'mine' && user?.id) {
      result = result.filter(idea => idea.canvas_id === user.id);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(idea => 
        idea.title.toLowerCase().includes(query) || 
        idea.description.toLowerCase().includes(query) ||
        idea.problem_statement?.toLowerCase().includes(query) ||
        idea.solution_concept?.toLowerCase().includes(query)
      );
    }
    
    // Sort the filtered ideas
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
        // For relevance, we'll use a simple scoring system based on completeness
        result.sort((a, b) => {
          const scoreA = getIdeaCompletionScore(a);
          const scoreB = getIdeaCompletionScore(b);
          return scoreB - scoreA;
        });
        break;
    }
    
    setFilteredIdeas(result);
    setIsLoading(false);
  }, [ideas, searchQuery, sortBy, filterBy, user?.id]);

  // Calculate a completion score for an idea (used for relevance sorting)
  const getIdeaCompletionScore = (idea: IdeaPlaygroundIdea): number => {
    let score = 0;
    if (idea.title) score += 1;
    if (idea.description) score += 1;
    if (idea.problem_statement) score += 2;
    if (idea.solution_concept) score += 2;
    if (idea.target_audience) score += 1;
    if (idea.unique_value) score += 1;
    if (idea.business_model) score += 1;
    if (idea.marketing_strategy) score += 1;
    if (idea.go_to_market) score += 1;
    return score;
  };

  // Handle selecting an idea and navigating to the analysis screen
  const handleSelectIdea = () => {
    if (!selectedIdeaId) {
      setValidationError('Please select an idea to continue');
      return;
    }
    
    setValidationError(null);
    navigate(`/idea-hub/playground/pathway/3/analyze/${selectedIdeaId}`);
  };

  // Format date to a readable string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Render a loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-r-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse & Refine Ideas</h1>
        <p className="text-gray-600">
          Review existing ideas, analyze their potential, and refine them to create stronger business concepts.
        </p>
      </div>
      
      {validationError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {validationError}
        </div>
      )}
      
      {/* Search and filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Ideas
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Search by title, description, problem, or solution"
          />
        </div>
        
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical' | 'relevance')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="recent">Most Recent</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="relevance">Relevance</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <select
            id="filter"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'mine')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Ideas</option>
            <option value="mine">My Ideas</option>
          </select>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {filteredIdeas.length === 0 ? (
            'No ideas found matching your criteria'
          ) : (
            `Showing ${filteredIdeas.length} idea${filteredIdeas.length !== 1 ? 's' : ''}`
          )}
        </div>
        
        <button
          type="button"
          onClick={handleSelectIdea}
          disabled={!selectedIdeaId}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
            !selectedIdeaId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          Analyze Selected Idea
        </button>
      </div>
      
      {/* Ideas list */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No ideas found matching your criteria</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter settings</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIdeas.map((idea) => (
                <tr 
                  key={idea.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedIdeaId === idea.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setSelectedIdeaId(idea.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{idea.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {idea.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(idea.updated_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(getIdeaCompletionScore(idea) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round((getIdeaCompletionScore(idea) / 10) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/idea-hub/playground')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back to Pathways
        </button>
        
        <button
          type="button"
          onClick={handleSelectIdea}
          disabled={!selectedIdeaId}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${
            !selectedIdeaId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          Analyze Selected Idea
        </button>
      </div>
    </div>
  );
};

export default IdeaLibraryScreen;
