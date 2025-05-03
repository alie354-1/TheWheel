import { useState } from 'react';
import { useIdeaPlayground } from '../contexts/IdeaPlaygroundContext';

// Define our own Canvas type for backward compatibility
interface Canvas {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export const useCanvas = () => {
  const { facade, isLoading, error } = useIdeaPlayground();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [currentCanvas, setCurrentCanvas] = useState<Canvas | null>(null);
  
  const loadCanvases = async (userId: string, includeArchived: boolean = false) => {
    try {
      // In a real implementation, we would call facade.getCanvases
      // For now, use a placeholder implementation
      const fetchedCanvases: Canvas[] = [
        {
          id: 'canvas-1',
          name: 'My First Canvas',
          description: 'A canvas for my initial ideas',
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_archived: false
        }
      ];
      
      setCanvases(fetchedCanvases);
      
      // Set current canvas to the first one if not already set
      if (fetchedCanvases.length > 0 && !currentCanvas) {
        setCurrentCanvas(fetchedCanvases[0]);
      }
      
      return fetchedCanvases;
    } catch (err) {
      console.error('Error in useCanvas.loadCanvases:', err);
      return [];
    }
  };
  
  const createCanvas = async (userId: string, name: string, description?: string, companyId?: string) => {
    try {
      // In a real implementation, we would call facade.createCanvas
      // For now, use a placeholder implementation
      const newCanvas: Canvas = {
        id: `canvas-${Date.now()}`,
        name,
        description,
        user_id: userId,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      };
      
      setCanvases([newCanvas, ...canvases]);
      setCurrentCanvas(newCanvas);
      
      return newCanvas;
    } catch (err) {
      console.error('Error in useCanvas.createCanvas:', err);
      return null;
    }
  };
  
  const updateCanvas = async (canvasId: string, updates: Partial<Canvas>) => {
    try {
      // In a real implementation, we would call facade.updateCanvas
      // For now, update the local state only
      const updatedCanvases = canvases.map(canvas => 
        canvas.id === canvasId ? { ...canvas, ...updates, updated_at: new Date().toISOString() } : canvas
      );
      
      setCanvases(updatedCanvases);
      
      // Update current canvas if it's the one being updated
      if (currentCanvas && currentCanvas.id === canvasId) {
        setCurrentCanvas({ ...currentCanvas, ...updates, updated_at: new Date().toISOString() });
      }
      
      return true;
    } catch (err) {
      console.error('Error in useCanvas.updateCanvas:', err);
      return false;
    }
  };
  
  const archiveCanvas = async (canvasId: string) => {
    try {
      // In a real implementation, we would call facade.archiveCanvas
      // For now, update the local state only
      return await updateCanvas(canvasId, { is_archived: true });
    } catch (err) {
      console.error('Error in useCanvas.archiveCanvas:', err);
      return false;
    }
  };
  
  return {
    canvases,
    currentCanvas,
    setCurrentCanvas,
    loadCanvases,
    createCanvas,
    updateCanvas,
    archiveCanvas,
    isLoading,
    error
  };
};
