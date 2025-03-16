import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lightbulb, 
  RotateCw, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  BarChart,
  Target,
  Layers,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { ideaExplorationService } from '../../lib/services/idea-exploration.service';
import { ExplorationIdea, IdeaAnalysis } from '../../lib/types/idea-exploration.types';

export default function IdeaDetail() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [idea, setIdea] = useState<ExplorationIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [editedIdea, setEditedIdea] = useState<Partial<ExplorationIdea>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'history'>('overview');

  useEffect(() => {
    if (ideaId) {
      loadIdea(ideaId);
    }
  }, [ideaId]);

  const loadIdea = async (id: string) => {
    setIsLoading(true);
    try {
      const idea = await ideaExplorationService.getIdea(id);
      if (idea) {
        setIdea(idea);
        setEditedIdea({
          title: idea.title,
          description: idea.description,
          problem_statement: idea.problem_statement,
          solution_concept: idea.solution_concept,
          target_audience: idea.target_audience,
          unique_value: idea.unique_value,
          business_model: idea.business_model,
          marketing_strategy: idea.marketing_strategy,
          revenue_model: idea.revenue_model,
          go_to_market: idea.go_to_market,
          market_size: idea.market_size
        });
      } else {
        setError('Idea not found');
      }
    } catch (error) {
      console.error('Error loading idea:', error);
      setError('Failed to load idea details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeIdea = async () => {
    if (!user || !idea) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const context = {
        userId: user.id,
        context: 'idea_exploration'
      };
      
      const analysis = await ideaExplorationService.analyzeIdea(idea, user.id, context);
      
      if (analysis) {
        // Update the idea with the new analysis
        setIdea({
          ...idea,
          analysis
        });
        
        // Switch to the analysis tab
        setActiveTab('analysis');
      } else {
        setError('Failed to analyze idea. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing idea:', error);
      setError('Failed to analyze idea');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!idea) return;
    
    try {
      const success = await ideaExplorationService.updateIdea(idea.id, {
        ...editedIdea,
        updated_at: new Date().toISOString()
      });
      
      if (success) {
        // Update the local idea state
        setIdea({
          ...idea,
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
    // Reset edited idea to current idea values
    if (idea) {
      setEditedIdea({
        title: idea.title,
        description: idea.description,
        problem_statement: idea.problem_statement,
        solution_concept: idea.solution_concept,
        target_audience: idea.target_audience,
        unique_value: idea.unique_value,
        business_model: idea.business_model,
        marketing_strategy: idea.marketing_strategy,
        revenue_model: idea.revenue_model,
        go_to_market: idea.go_to_market,
        market_size: idea.market_size
      });
    }
    setIsEditing(false);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RotateCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Idea not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/idea-hub/explore')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Idea Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={handleAnalyzeIdea}
                  disabled={isAnalyzing}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Analyze
                    </>
                  )}
                </button>
              </>
            )}
            {isEditing && (
              <>
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
              </>
            )}
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

        {/* Idea Title */}
        <div className="mb-6">
          {isEditing ? (
            <input
              type="text"
              value={editedIdea.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="block w-full text-2xl font-bold text-gray-900 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Idea Title"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {idea.is_merged ? 'Merged idea' : 'Version'} {idea.version} • Last updated {formatDate(idea.updated_at)}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis {idea.analysis ? <CheckCircle className="inline h-3 w-3 text-green-500 ml-1" /> : null}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
                    placeholder="Describe your idea"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.description}</p>
                )}
              </div>

              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 text-red-500 mr-2" />
                  Problem Statement
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.problem_statement || ''}
                    onChange={(e) => handleInputChange('problem_statement', e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What problem does this idea solve?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.problem_statement}</p>
                )}
              </div>

              {/* Solution Concept */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  Solution Concept
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.solution_concept || ''}
                    onChange={(e) => handleInputChange('solution_concept', e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How does your solution work?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.solution_concept}</p>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  Target Audience
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.target_audience || ''}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Who are your customers?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.target_audience}</p>
                )}
              </div>

              {/* Unique Value Proposition */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Zap className="h-5 w-5 text-purple-500 mr-2" />
                  Unique Value Proposition
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.unique_value || ''}
                    onChange={(e) => handleInputChange('unique_value', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What makes your solution unique?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.unique_value}</p>
                )}
              </div>

              {/* Business Model */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Layers className="h-5 w-5 text-indigo-500 mr-2" />
                  Business Model
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.business_model || ''}
                    onChange={(e) => handleInputChange('business_model', e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will the business create and deliver value?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.business_model}</p>
                )}
              </div>

              {/* Revenue Model */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                  Revenue Model
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.revenue_model || ''}
                    onChange={(e) => handleInputChange('revenue_model', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will the business make money?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.revenue_model}</p>
                )}
              </div>

              {/* Marketing Strategy */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Target className="h-5 w-5 text-red-500 mr-2" />
                  Marketing Strategy
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.marketing_strategy || ''}
                    onChange={(e) => handleInputChange('marketing_strategy', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will you reach customers?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.marketing_strategy}</p>
                )}
              </div>

              {/* Go-to-Market Strategy */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  Go-to-Market Strategy
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.go_to_market || ''}
                    onChange={(e) => handleInputChange('go_to_market', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="How will you launch and scale the business?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.go_to_market}</p>
                )}
              </div>

              {/* Market Size */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <BarChart className="h-5 w-5 text-green-500 mr-2" />
                  Market Size
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedIdea.market_size || ''}
                    onChange={(e) => handleInputChange('market_size', e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="What is the estimated market size?"
                  />
                ) : (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{idea.market_size}</p>
                )}
              </div>

              {/* Competition */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Competition</h3>
                <div className="flex flex-wrap gap-2">
                  {idea.competition && idea.competition.length > 0 ? (
                    idea.competition.map((competitor, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {competitor}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No competitors specified</p>
                  )}
                </div>
              </div>

              {/* Revenue Streams */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Revenue Streams</h3>
                {idea.revenue_streams && idea.revenue_streams.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {idea.revenue_streams.map((stream, index) => (
                      <li key={index}>{stream}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No revenue streams specified</p>
                )}
              </div>

              {/* Cost Structure */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cost Structure</h3>
                {idea.cost_structure && idea.cost_structure.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {idea.cost_structure.map((cost, index) => (
                      <li key={index}>{cost}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No cost structure specified</p>
                )}
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Key Metrics</h3>
                {idea.key_metrics && idea.key_metrics.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    {idea.key_metrics.map((metric, index) => (
                      <li key={index}>{metric}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No key metrics specified</p>
                )}
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="p-6">
              {idea.analysis ? (
                <div className="space-y-8">
                  {/* Strengths */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Strengths
                    </h3>
                    {idea.analysis.strengths.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No strengths identified</p>
                    )}
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Weaknesses
                    </h3>
                    {idea.analysis.weaknesses.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No weaknesses identified</p>
                    )}
                  </div>

                  {/* Opportunities */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Opportunities
                    </h3>
                    {idea.analysis.opportunities.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.opportunities.map((opportunity, index) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No opportunities identified</p>
                    )}
                  </div>

                  {/* Threats */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      Threats
                    </h3>
                    {idea.analysis.threats.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.threats.map((threat, index) => (
                          <li key={index}>{threat}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No threats identified</p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      Suggestions for Improvement
                    </h3>
                    {idea.analysis.suggestions.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No suggestions provided</p>
                    )}
                  </div>

                  {/* Market Insights */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                      Market Insights
                    </h3>
                    {idea.analysis.market_insights.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.market_insights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No market insights provided</p>
                    )}
                  </div>

                  {/* Validation Tips */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Validation Tips
                    </h3>
                    {idea.analysis.validation_tips.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {idea.analysis.validation_tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No validation tips provided</p>
                    )}
                  </div>

                  {/* Re-analyze Button */}
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleAnalyzeIdea}
                      disabled={isAnalyzing}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                          Re-analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-analyze Idea
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Analyze this idea to get feedback and insights
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleAnalyzeIdea}
                      disabled={isAnalyzing}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Analyze Idea
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              {idea.is_merged ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Merge History</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This idea was created by merging multiple ideas. The parent ideas are:
                  </p>
                  {idea.parent_ideas && idea.parent_ideas.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                      {idea.parent_ideas.map((parentId, index) => (
                        <li key={index}>
                          <button
                            onClick={() => navigate(`/idea-hub/idea/${parentId}`)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Parent Idea {index + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No parent ideas found</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    This idea has no merge history
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
