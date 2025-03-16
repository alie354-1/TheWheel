import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Zap,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { ideaExplorationService } from '../../lib/services/idea-exploration.service';
import { 
  ExplorationIdea, 
  IdeaComparisonResult 
} from '../../lib/types/idea-exploration.types';

export default function IdeaComparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [ideas, setIdeas] = useState<ExplorationIdea[]>([]);
  const [comparison, setComparison] = useState<IdeaComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Parse the query parameters to get the idea IDs
    const params = new URLSearchParams(location.search);
    const idString = params.get('ids');
    const session = params.get('session');
    
    if (idString && session) {
      const ids = idString.split(',');
      setSessionId(session);
      loadIdeas(ids);
    } else {
      setError('No ideas selected for comparison');
      setIsLoading(false);
    }
  }, [location]);

  const loadIdeas = async (ideaIds: string[]) => {
    setIsLoading(true);
    try {
      const loadedIdeas: ExplorationIdea[] = [];
      
      for (const id of ideaIds) {
        const idea = await ideaExplorationService.getIdea(id);
        if (idea) {
          loadedIdeas.push(idea);
        }
      }
      
      if (loadedIdeas.length < 2) {
        setError('At least 2 valid ideas are required for comparison');
      } else {
        setIdeas(loadedIdeas);
        // Automatically compare the ideas
        compareIdeas(loadedIdeas);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
      setError('Failed to load ideas for comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const compareIdeas = async (ideasToCompare: ExplorationIdea[]) => {
    if (!user || !sessionId || ideasToCompare.length < 2) return;
    
    setIsComparing(true);
    setError('');
    
    try {
      const context = {
        userId: user.id,
        context: 'idea_exploration'
      };
      
      const result = await ideaExplorationService.compareIdeas(
        ideasToCompare,
        user.id,
        sessionId,
        context
      );
      
      if (result) {
        setComparison(result);
      } else {
        setError('Failed to compare ideas. Please try again.');
      }
    } catch (error) {
      console.error('Error comparing ideas:', error);
      setError('Failed to compare ideas');
    } finally {
      setIsComparing(false);
    }
  };

  const handleMergeIdeas = () => {
    if (!sessionId) return;
    
    // Navigate to merge page with the same ideas
    const ideaIds = ideas.map(idea => idea.id).join(',');
    navigate(`/idea-hub/merge?ids=${ideaIds}&session=${sessionId}`);
  };

  const handleViewIdea = (ideaId: string) => {
    navigate(`/idea-hub/idea/${ideaId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RotateCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/idea-hub/explore')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Idea Explorer
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => compareIdeas(ideas)}
              disabled={isComparing || ideas.length < 2}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {isComparing ? (
                <>
                  <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Comparison
                </>
              )}
            </button>
            <button
              onClick={handleMergeIdeas}
              disabled={ideas.length < 2}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 mr-1" />
              Merge Ideas
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Idea Comparison</h1>

        {/* Ideas Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map(idea => (
            <div key={idea.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">{idea.title}</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
                <button
                  onClick={() => handleViewIdea(idea.id)}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Results */}
        {isComparing ? (
          <div className="flex justify-center py-12">
            <RotateCw className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : comparison ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 space-y-8">
              {/* Merger Potential */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Merger Potential</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        {comparison.merger_potential}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {comparison.merger_potential < 30 ? 'Low' : 
                         comparison.merger_potential < 70 ? 'Medium' : 'High'} Compatibility
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div 
                      style={{ width: `${comparison.merger_potential}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Common Strengths */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Common Strengths
                </h3>
                {comparison.common_strengths.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    {comparison.common_strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No common strengths identified</p>
                )}
              </div>

              {/* Common Weaknesses */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  Common Weaknesses
                </h3>
                {comparison.common_weaknesses.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    {comparison.common_weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No common weaknesses identified</p>
                )}
              </div>

              {/* Unique Strengths */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Unique Strengths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ideas.map(idea => (
                    <div key={`strength-${idea.id}`} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{idea.title}</h4>
                      {comparison.unique_strengths[idea.title] && comparison.unique_strengths[idea.title].length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {comparison.unique_strengths[idea.title].map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No unique strengths identified</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unique Weaknesses */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Unique Weaknesses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ideas.map(idea => (
                    <div key={`weakness-${idea.id}`} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{idea.title}</h4>
                      {comparison.unique_weaknesses[idea.title] && comparison.unique_weaknesses[idea.title].length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {comparison.unique_weaknesses[idea.title].map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No unique weaknesses identified</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Complementary Aspects */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Layers className="h-5 w-5 text-indigo-500 mr-2" />
                  Complementary Aspects
                </h3>
                {comparison.complementary_aspects.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    {comparison.complementary_aspects.map((aspect, index) => (
                      <li key={index}>{aspect}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No complementary aspects identified</p>
                )}
              </div>

              {/* Conflicting Aspects */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <XCircle className="h-5 w-5 text-orange-500 mr-2" />
                  Conflicting Aspects
                </h3>
                {comparison.conflicting_aspects.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    {comparison.conflicting_aspects.map((aspect, index) => (
                      <li key={index}>{aspect}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No conflicting aspects identified</p>
                )}
              </div>

              {/* Merger Suggestions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Zap className="h-5 w-5 text-purple-500 mr-2" />
                  Merger Suggestions
                </h3>
                {comparison.merger_suggestions.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    {comparison.merger_suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No merger suggestions provided</p>
                )}
              </div>

              {/* Merge Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleMergeIdeas}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Proceed to Merge Ideas
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 text-center py-12">
              <p className="text-sm text-gray-500">
                {ideas.length < 2 ? 
                  'At least 2 ideas are required for comparison' : 
                  'Click "Compare Ideas" to analyze the similarities and differences between these ideas'}
              </p>
              {ideas.length >= 2 && (
                <div className="mt-6">
                  <button
                    onClick={() => compareIdeas(ideas)}
                    disabled={isComparing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Compare Ideas
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
