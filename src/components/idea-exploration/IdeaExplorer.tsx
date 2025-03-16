import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Plus, 
  RotateCw, 
  Filter, 
  Search, 
  Trash2, 
  Edit, 
  Copy, 
  ArrowRight,
  Lightbulb,
  Zap,
  Layers,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { ideaExplorationService } from '../../lib/services/idea-exploration.service';
import { 
  IdeaExplorationSession, 
  ExplorationIdea, 
  IdeaGenerationParams 
} from '../../lib/types/idea-exploration.types';
import IdeaCard from './IdeaCard';

export default function IdeaExplorer() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<IdeaExplorationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<IdeaExplorationSession | null>(null);
  const [ideas, setIdeas] = useState<ExplorationIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  
  // Generation parameters
  const [generationParams, setGenerationParams] = useState<IdeaGenerationParams>({
    count: 3,
    innovation_level: 'balanced'
  });
  const [showGenerationForm, setShowGenerationForm] = useState(false);

  // Load sessions on component mount
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Load ideas when current session changes
  useEffect(() => {
    if (currentSession) {
      loadIdeas(currentSession.id);
    }
  }, [currentSession]);

  const loadSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const sessions = await ideaExplorationService.getSessions(user.id);
      setSessions(sessions);
      
      // Set the first session as current if available
      if (sessions.length > 0 && !currentSession) {
        setCurrentSession(sessions[0]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load idea exploration sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadIdeas = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const ideas = await ideaExplorationService.getIdeas(sessionId);
      setIdeas(ideas);
    } catch (error) {
      console.error('Error loading ideas:', error);
      setError('Failed to load ideas for this session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!user) return;
    
    try {
      const session = await ideaExplorationService.createSession(
        user.id,
        newSessionTitle || 'New Exploration',
        newSessionDescription
      );
      
      if (session) {
        setSessions([session, ...sessions]);
        setCurrentSession(session);
        setShowNewSessionForm(false);
        setNewSessionTitle('');
        setNewSessionDescription('');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create new exploration session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this exploration session? This will delete all ideas in this session.')) {
      return;
    }
    
    try {
      const success = await ideaExplorationService.deleteSession(sessionId);
      
      if (success) {
        // Remove the session from the list
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);
        
        // If the current session was deleted, set the first available session as current
        if (currentSession?.id === sessionId) {
          setCurrentSession(updatedSessions.length > 0 ? updatedSessions[0] : null);
          setIdeas([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete exploration session');
    }
  };

  const handleGenerateIdeas = async () => {
    if (!user || !currentSession) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const context = {
        userId: user.id,
        context: 'idea_exploration'
      };
      
      const generatedIdeas = await ideaExplorationService.generateIdeas(
        currentSession.id,
        user.id,
        generationParams,
        context
      );
      
      if (generatedIdeas.length > 0) {
        // Add the new ideas to the list
        setIdeas([...generatedIdeas, ...ideas]);
        setShowGenerationForm(false);
      } else {
        setError('Failed to generate ideas. Please try again.');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      setError('Failed to generate ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }
    
    try {
      const success = await ideaExplorationService.deleteIdea(ideaId);
      
      if (success) {
        // Remove the idea from the list
        setIdeas(ideas.filter(idea => idea.id !== ideaId));
        
        // Remove from selected ideas if it was selected
        if (selectedIdeas.includes(ideaId)) {
          setSelectedIdeas(selectedIdeas.filter(id => id !== ideaId));
        }
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
      setError('Failed to delete idea');
    }
  };

  const handleSelectIdea = (ideaId: string) => {
    if (selectedIdeas.includes(ideaId)) {
      setSelectedIdeas(selectedIdeas.filter(id => id !== ideaId));
    } else {
      setSelectedIdeas([...selectedIdeas, ideaId]);
    }
  };

  const handleCompareIdeas = () => {
    if (selectedIdeas.length < 2) {
      setError('Please select at least 2 ideas to compare');
      return;
    }
    
    // Navigate to comparison page with selected idea IDs
    navigate(`/idea-hub/compare?ids=${selectedIdeas.join(',')}&session=${currentSession?.id}`);
  };

  const handleMergeIdeas = () => {
    if (selectedIdeas.length < 2) {
      setError('Please select at least 2 ideas to merge');
      return;
    }
    
    // Navigate to merge page with selected idea IDs
    navigate(`/idea-hub/merge?ids=${selectedIdeas.join(',')}&session=${currentSession?.id}`);
  };

  const handleViewIdea = (ideaId: string) => {
    navigate(`/idea-hub/idea/${ideaId}`);
  };

  const filteredIdeas = ideas.filter(idea => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      idea.title.toLowerCase().includes(searchLower) ||
      (idea.description && idea.description.toLowerCase().includes(searchLower)) ||
      (idea.problem_statement && idea.problem_statement.toLowerCase().includes(searchLower)) ||
      (idea.solution_concept && idea.solution_concept.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Idea Explorer</h1>
            <p className="mt-1 text-sm text-gray-500">
              Generate, analyze, and refine multiple business ideas
            </p>
          </div>
          <div className="flex space-x-4">
            {currentSession && (
              <button
                onClick={() => setShowGenerationForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Ideas
              </button>
            )}
            <button
              onClick={() => setShowNewSessionForm(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Exploration
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Session Selector */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <label htmlFor="session-selector" className="block text-sm font-medium text-gray-700 mb-2">
              Exploration Session
            </label>
            <div className="flex space-x-4">
              <select
                id="session-selector"
                value={currentSession?.id || ''}
                onChange={(e) => {
                  const session = sessions.find(s => s.id === e.target.value);
                  setCurrentSession(session || null);
                  setSelectedIdeas([]);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
              {currentSession && (
                <button
                  onClick={() => handleDeleteSession(currentSession.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Session
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {currentSession && ideas.length > 0 && (
          <div className="mb-6 flex space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ideas..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {selectedIdeas.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCompareIdeas}
                  disabled={selectedIdeas.length < 2}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Compare ({selectedIdeas.length})
                </button>
                <button
                  onClick={handleMergeIdeas}
                  disabled={selectedIdeas.length < 2}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Merge ({selectedIdeas.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RotateCw className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : currentSession && filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                isSelected={selectedIdeas.includes(idea.id)}
                onSelect={() => handleSelectIdea(idea.id)}
                onView={() => handleViewIdea(idea.id)}
                onDelete={() => handleDeleteIdea(idea.id)}
              />
            ))}
          </div>
        ) : currentSession ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating some business ideas
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowGenerationForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Ideas
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No exploration sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new exploration session to get started
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowNewSessionForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Exploration
              </button>
            </div>
          </div>
        )}

        {/* New Session Modal */}
        {showNewSessionForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowNewSessionForm(false)} />

              {/* Modal */}
              <div className="relative w-full max-w-md rounded-lg bg-white shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    New Exploration Session
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="session-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="session-title"
                        value={newSessionTitle}
                        onChange={(e) => setNewSessionTitle(e.target.value)}
                        placeholder="E.g., SaaS Ideas, Mobile App Concepts"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="session-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        id="session-description"
                        value={newSessionDescription}
                        onChange={(e) => setNewSessionDescription(e.target.value)}
                        placeholder="Brief description of this exploration session"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setShowNewSessionForm(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateSession}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Idea Generation Modal */}
        {showGenerationForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowGenerationForm(false)} />

              {/* Modal */}
              <div className="relative w-full max-w-lg rounded-lg bg-white shadow-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Generate Business Ideas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="idea-count" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Ideas
                      </label>
                      <select
                        id="idea-count"
                        value={generationParams.count || 3}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          count: parseInt(e.target.value)
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value={1}>1 idea</option>
                        <option value={3}>3 ideas</option>
                        <option value={5}>5 ideas</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                        Industry (Optional)
                      </label>
                      <input
                        type="text"
                        id="industry"
                        value={generationParams.industry || ''}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          industry: e.target.value
                        })}
                        placeholder="E.g., Healthcare, Fintech, Education"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Audience (Optional)
                      </label>
                      <input
                        type="text"
                        id="target-audience"
                        value={generationParams.target_audience || ''}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          target_audience: e.target.value
                        })}
                        placeholder="E.g., Small businesses, Millennials, Parents"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="problem-area" className="block text-sm font-medium text-gray-700 mb-1">
                        Problem Area (Optional)
                      </label>
                      <input
                        type="text"
                        id="problem-area"
                        value={generationParams.problem_area || ''}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          problem_area: e.target.value
                        })}
                        placeholder="E.g., Remote work, Mental health, Sustainability"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="innovation-level" className="block text-sm font-medium text-gray-700 mb-1">
                        Innovation Level
                      </label>
                      <select
                        id="innovation-level"
                        value={generationParams.innovation_level || 'balanced'}
                        onChange={(e) => setGenerationParams({
                          ...generationParams,
                          innovation_level: e.target.value as 'incremental' | 'disruptive' | 'balanced'
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="incremental">Incremental (Lower risk, near-term)</option>
                        <option value="balanced">Balanced (Moderate innovation)</option>
                        <option value="disruptive">Disruptive (Higher risk, breakthrough)</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setShowGenerationForm(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerateIdeas}
                        disabled={isGenerating}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Generate Ideas
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
