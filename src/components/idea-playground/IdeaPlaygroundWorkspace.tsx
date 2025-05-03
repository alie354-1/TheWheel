import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { ideaPlaygroundService } from '../../lib/services/idea-playground.service';
import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';
import { ExtendedUserProfile } from '../../lib/types/extended-profile.types';

// Use types from service file for compatibility
import type { IdeaPlaygroundCanvas, IdeaGenerationParams } from '../../lib/services/idea-playground.service';

// Components
import CanvasSelector from './CanvasSelector';
import IdeaGenerationForm from './IdeaGenerationForm';
import IdeaRefinementForm from './IdeaRefinementForm';
import IdeaList from './IdeaList';
import SavedIdeasList from './SavedIdeasList';
import CreateCanvasModal from './CreateCanvasModal';

// Define local types
interface IdeaRefinementParams {
  ideaId: string;
  feedback: string;
}

const IdeaPlaygroundWorkspace: React.FC = () => {
  const auth = useAuth();
  const user = auth.user;
  const profile = auth.profile as ExtendedUserProfile | null;
  const [canvases, setCanvases] = useState<IdeaPlaygroundCanvas[]>([]);
  const [currentCanvas, setCurrentCanvas] = useState<IdeaPlaygroundCanvas | null>(null);
  const [ideas, setIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateCanvas, setShowCreateCanvas] = useState(false);
  const [ideaMode, setIdeaMode] = useState<'generate' | 'market' | 'refine'>('generate');
  
  // Load canvases on component mount
  useEffect(() => {
    if (user) {
      loadCanvases();
    }
  }, [user]);
  
  // Load ideas when canvas changes
  useEffect(() => {
    if (currentCanvas) {
      loadIdeas(currentCanvas.id);
    }
  }, [currentCanvas]);
  
  const loadCanvases = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const canvasList = await ideaPlaygroundService.getCanvases(user.id);
    setCanvases(canvasList);
    
    // Set current canvas to the first one if available
    if (canvasList.length > 0 && !currentCanvas) {
      setCurrentCanvas(canvasList[0]);
    }
    
    setIsLoading(false);
  };
  
  const loadIdeas = async (canvasId: string) => {
    setIsLoading(true);
    try {
      const ideaList = await ideaPlaygroundService.getIdeasForCanvas(canvasId);
      
      // Convert to IdeaPlaygroundIdea format with is_saved mapping to isFavorite for demo
      const convertedIdeas: IdeaPlaygroundIdea[] = ideaList.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        problem_statement: idea.problem_statement || '',
        solution_concept: idea.solution_concept || '',
        target_audience: Array.isArray(idea.target_audience) ? idea.target_audience : [idea.target_audience || ''],
        unique_value: idea.unique_value || '',
        business_model: idea.business_model || '',
        user_id: idea.userId || '',
        created_at: idea.createdAt || new Date().toISOString(),
        updated_at: idea.updatedAt || new Date().toISOString(),
        protection_level: 'public',
        status: idea.status || 'draft',
        is_saved: idea.isFavorite || false,
        used_company_context: false
      }));
      
      setIdeas(convertedIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateCanvas = async (name: string, description?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    const newCanvas = await ideaPlaygroundService.createCanvas(
      user.id,
      name,
      description || ''
    );
    
    if (newCanvas) {
      setCanvases([newCanvas, ...canvases]);
      setCurrentCanvas(newCanvas);
      setShowCreateCanvas(false);
    }
    
    setIsLoading(false);
  };
  
  const handleGenerateIdeas = async (params: IdeaGenerationParams) => {
    if (!user || !currentCanvas) return;
    
    setIsLoading(true);
    try {
      const newIdeas = await ideaPlaygroundService.generateIdeas(
        user.id,
        currentCanvas.id,
        params
      );
      
      if (newIdeas.length > 0) {
        // Force a reload of ideas from the service instead of updating the state directly
        await loadIdeas(currentCanvas.id);
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefineIdea = async (params: IdeaRefinementParams) => {
    if (!user || !currentCanvas) return;
    
    setIsLoading(true);
    try {
      const refinedIdea = await ideaPlaygroundService.refineIdea(
        params.ideaId,
        params.feedback
      );
      
      if (refinedIdea && currentCanvas) {
        // Force a reload of ideas from the service
        await loadIdeas(currentCanvas.id);
      }
    } catch (error) {
      console.error('Error refining idea:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSaveIdea = async (idea: IdeaPlaygroundIdea) => {
    if (!user) return;
    
    try {
      const success = await ideaPlaygroundService.toggleSaveIdea(user.id, idea);
      
      if (success && currentCanvas) {
        // Create a new array with the updated idea to preserve immutability
        const updatedIdeas = ideas.map(i => 
          i.id === idea.id 
            ? { ...i, is_saved: !i.is_saved }  // Toggle saved state
            : i
        );
        
        setIdeas(updatedIdeas);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    }
  };
  
  // If no user, show login prompt
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to use the Idea Playground</h2>
        <p>You need to be logged in to create and manage ideas.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Idea Playground</h1>
      
      {/* Canvas Selector */}
      <div className="mb-6">
        <CanvasSelector
          canvases={canvases}
          selectedCanvasId={currentCanvas?.id || null}
          onCanvasChange={(canvasId) => {
            const selectedCanvas = canvases.find(c => c.id === canvasId);
            if (selectedCanvas) {
              setCurrentCanvas(selectedCanvas);
            }
          }}
          onCreateCanvas={(name, description) => handleCreateCanvas(name, description)}
          isLoading={isLoading}
        />
      </div>
      
      {currentCanvas ? (
        <>
          {/* Saved Ideas List - Shows at the top for quick access */}
          <SavedIdeasList
            ideas={ideas}
            onIdeaClick={(idea) => console.log('Clicked saved idea:', idea)}
            onToggleSave={handleToggleSaveIdea}
          />
          
          {/* Mode Selector */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 font-medium ${
                  ideaMode === 'generate' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIdeaMode('generate')}
              >
                Generate Ideas
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  ideaMode === 'market' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIdeaMode('market')}
              >
                Market Focus
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  ideaMode === 'refine' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIdeaMode('refine')}
              >
                Refine Ideas
              </button>
            </div>
          </div>
          
          {/* Idea Generation Form */}
          {ideaMode === 'generate' && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Generate New Ideas</h2>
              <IdeaGenerationForm
                onSubmit={handleGenerateIdeas}
                hasCompany={!!profile?.company_id}
                useMarketContext={false}
              />
            </div>
          )}
          
          {/* Market Focus Form */}
          {ideaMode === 'market' && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Generate Ideas with Market Focus</h2>
              <IdeaGenerationForm
                onSubmit={handleGenerateIdeas}
                hasCompany={!!profile?.company_id}
                useMarketContext={true}
              />
            </div>
          )}
          
          {/* Idea Refinement Form */}
          {ideaMode === 'refine' && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Refine Existing Ideas</h2>
              <IdeaRefinementForm
                onSubmit={handleRefineIdea}
                ideas={ideas}
              />
            </div>
          )}
          
          {/* Ideas List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ideas in {currentCanvas.name}</h2>
            <IdeaList
              ideas={ideas}
              isLoading={isLoading}
              onIdeaClick={(idea) => console.log('Clicked idea:', idea)}
              onToggleSave={handleToggleSaveIdea}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">
            You don't have any canvases yet. Create one to get started!
          </p>
          <button
            onClick={() => setShowCreateCanvas(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Canvas
          </button>
        </div>
      )}
      
      {/* Create Canvas Modal */}
      {showCreateCanvas && (
        <CreateCanvasModal
          onClose={() => setShowCreateCanvas(false)}
          onCreate={handleCreateCanvas}
        />
      )}
    </div>
  );
};

export default IdeaPlaygroundWorkspace;
