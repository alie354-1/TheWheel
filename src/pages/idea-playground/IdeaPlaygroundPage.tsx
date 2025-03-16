import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store';
import PathwayRouter from './PathwayRouter';
import EnhancedWorkspace from '../../components/idea-playground/enhanced/components/EnhancedWorkspace';
import { ideaPlaygroundService } from '../../lib/services/idea-playground.service';
import { IdeaPlaygroundIdea, IdeaPlaygroundCanvas } from '../../lib/types/idea-playground.types';

/**
 * The main Idea Playground page component.
 * This component serves as the container for the Idea Playground experience,
 * integrating the pathway router and managing feature flags.
 */
const IdeaPlaygroundPage: React.FC = () => {
  const { user, featureFlags } = useAuthStore();
  // Force enable the enhanced workflow for testing
  const useEnhancedWorkflow = false; // Force disabled to ensure PathwayRouter is used
  
  const [ideas, setIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const [canvases, setCanvases] = useState<IdeaPlaygroundCanvas[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load ideas and canvases when the component mounts
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  // Load ideas and canvases
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load canvases
      const loadedCanvases = await ideaPlaygroundService.getCanvases(user.id);
      setCanvases(loadedCanvases);
      
      // Load ideas for all canvases
      const allIdeas: IdeaPlaygroundIdea[] = [];
      for (const canvas of loadedCanvases) {
        const canvasIdeas = await ideaPlaygroundService.getIdeasForCanvas(canvas.id);
        allIdeas.push(...canvasIdeas);
      }
      
      setIdeas(allIdeas);
    } catch (error) {
      console.error('Error loading ideas and canvases:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new idea
  const handleCreateIdea = async (idea: Partial<IdeaPlaygroundIdea>): Promise<IdeaPlaygroundIdea> => {
    if (!user) throw new Error('User not authenticated');
    
    // Get the first canvas or create one if none exists
    let canvasId = '';
    if (canvases.length > 0) {
      canvasId = canvases[0].id;
    } else {
      const newCanvas = await ideaPlaygroundService.createCanvas(
        user.id,
        'My Ideas',
        'Default canvas for ideas'
      );
      
      if (!newCanvas) {
        throw new Error('Failed to create canvas');
      }
      
      canvasId = newCanvas.id;
      setCanvases(prev => [...prev, newCanvas]);
    }
    
    // Generate the idea
    const ideasParam = {
      count: 1,
      problem_area: idea.problem_statement || '',
      industry: idea.title || 'General',
      useCompanyContext: false
    };
    
    const generatedIdeas = await ideaPlaygroundService.generateIdeas(
      user.id,
      canvasId,
      ideasParam
    );
    
    if (generatedIdeas.length === 0) {
      throw new Error('Failed to create idea');
    }
    
    // Update ideas list
    setIdeas(prev => [...prev, generatedIdeas[0]]);
    
    return generatedIdeas[0];
  };
  
  // Save an idea
  const handleSaveIdea = async (idea: IdeaPlaygroundIdea): Promise<void> => {
    try {
      await ideaPlaygroundService.updateIdea(idea.id, idea);
      
      // Update the ideas list
      setIdeas(prev => prev.map(i => i.id === idea.id ? idea : i));
    } catch (error) {
      console.error('Error saving idea:', error);
      throw error;
    }
  };
  
  // Export an idea
  const handleExportIdea = (idea: IdeaPlaygroundIdea) => {
    console.log('Exporting idea:', idea);
    // In a real app, this would open an export modal or generate exports
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        {useEnhancedWorkflow ? (
          // Use the enhanced workflow with all new components
          <EnhancedWorkspace 
            ideas={ideas}
            onCreateNewIdea={() => handleCreateIdea({ title: 'New Idea', description: 'Description pending' })}
            onSaveIdea={handleSaveIdea}
            onExportIdea={handleExportIdea}
            className="container mx-auto px-4"
          />
        ) : (
          // Use the traditional pathway router
          <PathwayRouter />
        )}
      </div>
    </div>
  );
};

export default IdeaPlaygroundPage;
