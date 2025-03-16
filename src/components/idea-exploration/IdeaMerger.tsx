import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  AlertCircle, 
  Zap,
  ArrowRight,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { ideaExplorationService } from '../../lib/services/idea-exploration.service';
import { ExplorationIdea } from '../../lib/types/idea-exploration.types';

export default function IdeaMerger() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [ideas, setIdeas] = useState<ExplorationIdea[]>([]);
  const [mergedIdea, setMergedIdea] = useState<ExplorationIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIdea, setEditedIdea] = useState<Partial<ExplorationIdea>>({});

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
      setError('No ideas selected for merging');
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
        setError('At least 2 valid ideas are required for merging');
      } else {
        setIdeas(loadedIdeas);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
      setError('Failed to load ideas for merging');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergeIdeas = async () => {
    if (!user || !sessionId || ideas.length < 2) return;
    
    setIsMerging(true);
    setError('');
    
    try {
      const context = {
        userId: user.id,
        context: 'idea_exploration'
      };
      
      const result = await ideaExplorationService.mergeIdeas(
        ideas,
        user.id,
        sessionId,
        context
      );
      
      if (result) {
        setMergedIdea(result);
        setEditedIdea({
          title: result.title,
          description: result.description,
          problem_statement: result.problem_statement,
          solution_concept: result.solution_concept,
          target_audience: result.target_audience,
          unique_value: result.unique_value,
          business_model: result.business_model,
          marketing_strategy: result.marketing_strategy,
          revenue_model: result.revenue_model,
          go_to_market: result.go_to_market,
          market_size: result.market_size
        });
      } else {
        setError('Failed to merge ideas. Please try again.');
      }
    } catch (error) {
      console.error('Error merging ideas:', error);
      setError('Failed to merge ideas');
    } finally {
      setIsMerging(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!mergedIdea) return;
    
    try {
      const success = await ideaExplorationService.updateIdea(mergedIdea.id, {
        ...editedIdea,
        updated_at: new Date().toISOString()
      });
      
      if (success) {
        // Update the local merged idea state
        setMergedIdea({
          ...mergedIdea,
          ...editedIdea,
          updated_at: new Date().toISOString()
        });
        
        setIsEditing(false);
      } else {
        setError('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setError('Failed to save changes');
    }
  };

  const handleInputChange = (field: keyof ExplorationIdea, value: string) => {
    setEditedIdea({
      ...editedIdea,
      [field]: value
    });
  };

  const handleCancelEdit = () => {
    // Reset edited idea to current merged idea values
    if (mergedIdea) {
      setEditedIdea({
        title: mergedIdea.title,
        description: mergedIdea.description,
        problem_statement: mergedIdea.problem_statement,
        solution_concept: mergedIdea.solution_concept,
        target_audience: mergedIdea.target_audience,
        unique_value: mergedIdea.unique_value,
        business_model: mergedIdea.business_model,
        marketing_strategy: mergedIdea.marketing_strategy,
        revenue_model: mergedIdea.revenue_model,
        go_to_market: mergedIdea.go_to_market,
        market_size: mergedIdea.market_size
      });
    }
    setIsEditing(false);
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
          {mergedIdea && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Merged Idea
            </button>
          )}
          {isEditing && (
            <div className="flex space-x-3">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          )}
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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Idea Merger</h1>

        {/* Source Ideas */}
        {!mergedIdea && (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Source Ideas</h2>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map(idea => (
                <div key={idea.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{idea.title}</h3>
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

            {/* Merge Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleMergeIdeas}
                disabled={isMerging || ideas.length < 2}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isMerging ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Merging Ideas...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Merge Ideas
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Merged Idea */}
        {mergedIdea && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedIdea.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="block w-full text-xl font-bold text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Merged Idea Title"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">{mergedIdea.title}</h2>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Merged Successfully
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Created from {mergedIdea.parent_ideas.length} source ideas
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Describe the merged idea"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.description}</p>
                )}
              </div>

              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Problem Statement</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.problem_statement || ''}
                    onChange={(e) => handleInputChange('problem_statement', e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What problem does this merged idea solve?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.problem_statement}</p>
                )}
              </div>

              {/* Solution Concept */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Solution Concept</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.solution_concept || ''}
                    onChange={(e) => handleInputChange('solution_concept', e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How does the merged solution work?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.solution_concept}</p>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Target Audience</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.target_audience || ''}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Who are the customers for this merged idea?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.target_audience}</p>
                )}
              </div>

              {/* Unique Value Proposition */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unique Value Proposition</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.unique_value || ''}
                    onChange={(e) => handleInputChange('unique_value', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What makes this merged solution unique?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.unique_value}</p>
                )}
              </div>

              {/* Business Model */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Business Model</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.business_model || ''}
                    onChange={(e) => handleInputChange('business_model', e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will the merged business create and deliver value?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.business_model}</p>
                )}
              </div>

              {/* Revenue Model */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Model</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.revenue_model || ''}
                    onChange={(e) => handleInputChange('revenue_model', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will the merged business make money?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.revenue_model}</p>
                )}
              </div>

              {/* Marketing Strategy */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Marketing Strategy</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.marketing_strategy || ''}
                    onChange={(e) => handleInputChange('marketing_strategy', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will you reach customers for the merged idea?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.marketing_strategy}</p>
                )}
              </div>

              {/* Go-to-Market Strategy */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Go-to-Market Strategy</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.go_to_market || ''}
                    onChange={(e) => handleInputChange('go_to_market', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will you launch and scale the merged business?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.go_to_market}</p>
                )}
              </div>

              {/* Market Size */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Market Size</h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.market_size || ''}
                    onChange={(e) => handleInputChange('market_size', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What is the estimated market size for the merged idea?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{mergedIdea.market_size}</p>
                )}
              </div>

              {/* View Button */}
              {!isEditing && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => handleViewIdea(mergedIdea.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Full Idea Details
                    <ArrowRight className="h-4 w-4 ml-2" />
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
