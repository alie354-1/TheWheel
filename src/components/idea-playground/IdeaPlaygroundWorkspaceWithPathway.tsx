import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../lib/hooks/useAuth';
import { useLogging } from '../../lib/hooks/useLogging';
import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';
import { IdeaVariation, MergedIdea } from '../../lib/types/idea-pathway.types';
import { ideaPlaygroundService } from '../../lib/services/idea-playground.service';
import CanvasSelector from './CanvasSelector';
import IdeaGenerationForm from './IdeaGenerationForm';
import IdeaList from './IdeaList';
import IdeaPathwayWorkflow from './pathway/IdeaPathwayWorkflow';

interface IdeaPlaygroundWorkspaceProps {
  initialCanvasId?: string;
}

const IdeaPlaygroundWorkspaceWithPathway: React.FC<IdeaPlaygroundWorkspaceProps> = ({
  initialCanvasId
}) => {
  // Hooks
  const { user } = useAuth();
  const { logAction } = useLogging('IdeaPlaygroundWorkspace');
  
  // States
  const [canvases, setCanvases] = useState<any[]>([]);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(initialCanvasId || null);
  const [ideas, setIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [activeIdea, setActiveIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [isPathwayActive, setIsPathwayActive] = useState(false);

  // Fetch canvases on component mount
  useEffect(() => {
    if (user?.id) {
      loadCanvases();
    }
  }, [user?.id]);

  // Fetch ideas when canvas changes
  useEffect(() => {
    if (selectedCanvasId) {
      loadIdeas(selectedCanvasId);
    } else {
      setIdeas([]);
    }
  }, [selectedCanvasId]);

  // Event handlers
  const loadCanvases = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userCanvases = await ideaPlaygroundService.getCanvasesForUser(user.id);
      setCanvases(userCanvases);
      
      // If no canvas is selected and we have canvases, select the first one
      if (!selectedCanvasId && userCanvases.length > 0) {
        setSelectedCanvasId(userCanvases[0].id);
      }
    } catch (error) {
      console.error('Error loading canvases:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadIdeas = async (canvasId: string) => {
    setIsLoading(true);
    try {
      const canvasIdeas = await ideaPlaygroundService.getIdeasForCanvas(canvasId);
      setIdeas(canvasIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCanvasChange = (canvasId: string) => {
    setSelectedCanvasId(canvasId);
    setActiveIdea(null);
    setIsPathwayActive(false);
  };
  
  const handleCreateCanvas = async (name: string, description?: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const newCanvas = await ideaPlaygroundService.createCanvas(
        user.id,
        name,
        description || ''
      );
      if (newCanvas) {
        setCanvases([...canvases, newCanvas]);
        setSelectedCanvasId(newCanvas.id);
        
        logAction('idea_playground_canvas_created', { 
          canvas_id: newCanvas.id,
          canvas_name: name
        });
      }
    } catch (error) {
      console.error('Error creating canvas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleIdeaGeneration = async (ideaParams: any) => {
    if (!user?.id || !selectedCanvasId) return;
    
    setIsLoading(true);
    try {
      const generatedIdeas = await ideaPlaygroundService.generateIdeas(
        user.id,
        selectedCanvasId,
        ideaParams
      );
      
      setIdeas([...generatedIdeas, ...ideas]);
      
      logAction('idea_playground_ideas_generated', {
        canvas_id: selectedCanvasId,
        count: generatedIdeas.length,
        parameters: ideaParams
      });
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleIdeaSelection = (idea: IdeaPlaygroundIdea) => {
    setActiveIdea(idea);
    setIsPathwayActive(true);
    
    logAction('idea_playground_pathway_started', {
      canvas_id: selectedCanvasId,
      idea_id: idea.id
    });
  };
  
  const handlePathwayClose = () => {
    setActiveIdea(null);
    setIsPathwayActive(false);
  };

  // Wrapper functions to handle nullable returns
  const wrappedSaveVariationAsIdea = async (userId: string, canvasId: string, variation: IdeaVariation) => {
    const result = await ideaPlaygroundService.saveVariationAsIdea(userId, canvasId, variation);
    if (!result) {
      throw new Error('Failed to save variation as idea');
    }
    return result;
  };

  const wrappedSaveMergedIdeaAsIdea = async (userId: string, canvasId: string, mergedIdea: MergedIdea) => {
    const result = await ideaPlaygroundService.saveMergedIdeaAsIdea(userId, canvasId, mergedIdea);
    if (!result) {
      throw new Error('Failed to save merged idea as idea');
    }
    return result;
  };
  
  const handlePathwayComplete = async (finalIdea: IdeaPlaygroundIdea | IdeaVariation | MergedIdea) => {
    if (!user?.id || !selectedCanvasId) return;
    
    setIsLoading(true);
    try {
      // If this is a merged idea or variation, we need to save it as a new idea in the canvas
      let savedIdea: IdeaPlaygroundIdea | null = null;
      
      if ('source_variations' in finalIdea) {
        // It's a merged idea
        savedIdea = await ideaPlaygroundService.saveMergedIdeaAsIdea(
          user.id,
          selectedCanvasId,
          finalIdea as MergedIdea
        );
      } else if ('parent_idea_id' in finalIdea) {
        // It's a variation
        savedIdea = await ideaPlaygroundService.saveVariationAsIdea(
          user.id,
          selectedCanvasId,
          finalIdea as IdeaVariation
        );
      } else {
        // It's already an idea, just update its status
        savedIdea = finalIdea as IdeaPlaygroundIdea;
        await ideaPlaygroundService.updateIdeaStatus(
          savedIdea.id,
          'refined'
        );
      }
      
      if (!savedIdea) {
        throw new Error('Failed to save idea from pathway');
      }
      
      // Reload ideas to get the updated list
      await loadIdeas(selectedCanvasId);
      
      // Close the pathway
      setActiveIdea(null);
      setIsPathwayActive(false);
      
      logAction('idea_playground_pathway_completed', {
        canvas_id: selectedCanvasId,
        idea_id: savedIdea.id,
        type: 'source_variations' in finalIdea 
          ? 'merged' 
          : 'parent_idea_id' in finalIdea 
            ? 'variation' 
            : 'original'
      });
    } catch (error) {
      console.error('Error completing pathway:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render UI
  if (isPathwayActive && activeIdea && selectedCanvasId) {
    return (
      <ErrorBoundary
        fallback={
          <div className="container mx-auto py-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Error in Idea Pathway</h2>
              <p className="text-gray-700 mb-6">
                We encountered an issue while loading the idea pathway. This might be related to the navigation state or data processing.
              </p>
              <button 
                onClick={handlePathwayClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Idea Playground
              </button>
            </div>
          </div>
        }
      >
        <div className="container mx-auto py-6">
          <button 
            onClick={handlePathwayClose}
            className="mb-4 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Idea List
          </button>
          
          <IdeaPathwayWorkflow
            initialIdea={activeIdea}
            canvasId={selectedCanvasId}
            userId={user?.id || ''}
            onClose={handlePathwayClose}
            onComplete={handlePathwayComplete}
            // Use wrapped methods to handle nullable returns
            saveVariationAsIdea={wrappedSaveVariationAsIdea}
            saveMergedIdeaAsIdea={wrappedSaveMergedIdeaAsIdea}
            updateIdeaStatus={ideaPlaygroundService.updateIdeaStatus}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Idea Playground</h1>
        <p className="text-gray-600 mb-6">
          Generate and explore business ideas with AI assistance. Create a canvas to organize related ideas.
        </p>
        
        <CanvasSelector
          canvases={canvases}
          selectedCanvasId={selectedCanvasId}
          onCanvasChange={handleCanvasChange}
          onCreateCanvas={handleCreateCanvas}
          isLoading={isLoading}
        />
      </div>
      
      {selectedCanvasId && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Generate New Ideas</h2>
            <IdeaGenerationForm 
              onSubmit={handleIdeaGeneration} 
              isLoading={isLoading}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Ideas</h2>
            <p className="text-gray-600 mb-6">
              Click on an idea card to explore variations and refine it through Pathway 1.
            </p>
            <IdeaList 
              ideas={ideas} 
              onIdeaClick={handleIdeaSelection}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default IdeaPlaygroundWorkspaceWithPathway;
