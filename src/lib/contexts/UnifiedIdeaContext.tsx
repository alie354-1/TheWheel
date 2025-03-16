import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store';
import { unifiedIdeaService } from '../services/unified-idea.service';
import { 
  IdeaWorkspace, 
  UnifiedIdea,
  IdeaGenerationParams
} from '../types/unified-idea.types';

interface UnifiedIdeaContextType {
  // Workspace state
  workspaces: IdeaWorkspace[];
  currentWorkspace: IdeaWorkspace | null;
  setCurrentWorkspace: (workspace: IdeaWorkspace | null) => void;
  createWorkspace: (title: string, description?: string) => Promise<IdeaWorkspace | null>;
  updateWorkspace: (workspaceId: string, updates: Partial<IdeaWorkspace>) => Promise<boolean>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  
  // Ideas state
  ideas: UnifiedIdea[];
  currentIdea: UnifiedIdea | null;
  setCurrentIdea: (idea: UnifiedIdea | null) => void;
  generateIdeas: (params: IdeaGenerationParams) => Promise<UnifiedIdea[]>;
  updateIdea: (ideaId: string, updates: Partial<UnifiedIdea>) => Promise<boolean>;
  deleteIdea: (ideaId: string) => Promise<boolean>;
  
  // Refinement state
  currentRefinementStep: number;
  setCurrentRefinementStep: (step: number) => void;
  
  // UI state
  isLoading: boolean;
  error: string;
  setError: (error: string) => void;
  success: string;
  setSuccess: (success: string) => void;
  
  // Local storage
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
}

const UnifiedIdeaContext = createContext<UnifiedIdeaContextType | undefined>(undefined);

export const useUnifiedIdeaContext = () => {
  const context = useContext(UnifiedIdeaContext);
  if (!context) {
    throw new Error('useUnifiedIdeaContext must be used within a UnifiedIdeaProvider');
  }
  return context;
};

interface UnifiedIdeaProviderProps {
  children: ReactNode;
  initialWorkspaceId?: string;
  initialIdeaId?: string;
  initialStep?: number;
}

export const UnifiedIdeaProvider: React.FC<UnifiedIdeaProviderProps> = ({ 
  children, 
  initialWorkspaceId,
  initialIdeaId,
  initialStep = 0
}) => {
  const { user } = useAuthStore();
  
  // Workspace state
  const [workspaces, setWorkspaces] = useState<IdeaWorkspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<IdeaWorkspace | null>(null);
  
  // Ideas state
  const [ideas, setIdeas] = useState<UnifiedIdea[]>([]);
  const [currentIdea, setCurrentIdea] = useState<UnifiedIdea | null>(null);
  
  // Refinement state
  const [currentRefinementStep, setCurrentRefinementStep] = useState<number>(initialStep);
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Load workspaces on component mount
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);
  
  // Load ideas when current workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadIdeas(currentWorkspace.id);
    }
  }, [currentWorkspace]);
  
  // Set initial workspace and idea if provided
  useEffect(() => {
    if (initialWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === initialWorkspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
      }
    }
  }, [initialWorkspaceId, workspaces]);
  
  useEffect(() => {
    if (initialIdeaId && ideas.length > 0) {
      const idea = ideas.find(i => i.id === initialIdeaId);
      if (idea) {
        setCurrentIdea(idea);
      }
    }
  }, [initialIdeaId, ideas]);
  
  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);
  
  // Load workspaces
  const loadWorkspaces = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const workspaces = await unifiedIdeaService.getWorkspaces(user.id);
      setWorkspaces(workspaces);
      
      // Set the first workspace as current if available and no current workspace is set
      if (workspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(workspaces[0]);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      setError('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load ideas for a workspace
  const loadIdeas = async (workspaceId: string) => {
    setIsLoading(true);
    try {
      const ideas = await unifiedIdeaService.getIdeas(workspaceId);
      setIdeas(ideas);
      
      // Set the active idea as current if available
      if (currentWorkspace?.active_idea_id) {
        const activeIdea = ideas.find(i => i.id === currentWorkspace.active_idea_id);
        if (activeIdea) {
          setCurrentIdea(activeIdea);
        }
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
      setError('Failed to load ideas');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new workspace
  const createWorkspace = async (title: string, description?: string) => {
    if (!user) {
      setError('You must be logged in to create a workspace');
      return null;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const workspace = await unifiedIdeaService.createWorkspace(user.id, title, description);
      
      if (workspace) {
        setWorkspaces([workspace, ...workspaces]);
        setCurrentWorkspace(workspace);
        setSuccess('Workspace created successfully');
        return workspace;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating workspace:', error);
      setError('Failed to create workspace');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update a workspace
  const updateWorkspace = async (workspaceId: string, updates: Partial<IdeaWorkspace>) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await unifiedIdeaService.updateWorkspace(workspaceId, updates);
      
      if (success) {
        // Update the workspace in the local state
        setWorkspaces(workspaces.map(w => 
          w.id === workspaceId ? { ...w, ...updates } : w
        ));
        
        // Update current workspace if it's the one being updated
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspace({ ...currentWorkspace, ...updates });
        }
        
        setSuccess('Workspace updated successfully');
      } else {
        setError('Failed to update workspace');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating workspace:', error);
      setError('Failed to update workspace');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a workspace
  const deleteWorkspace = async (workspaceId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await unifiedIdeaService.deleteWorkspace(workspaceId);
      
      if (success) {
        // Remove the workspace from the local state
        const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        setWorkspaces(updatedWorkspaces);
        
        // If the current workspace was deleted, set the first available workspace as current
        if (currentWorkspace?.id === workspaceId) {
          setCurrentWorkspace(updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null);
          setIdeas([]);
          setCurrentIdea(null);
        }
        
        setSuccess('Workspace deleted successfully');
      } else {
        setError('Failed to delete workspace');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      setError('Failed to delete workspace');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate ideas
  const generateIdeas = async (params: IdeaGenerationParams) => {
    if (!user || !currentWorkspace) {
      setError('You must be logged in and have a workspace selected to generate ideas');
      return [];
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const generatedIdeas = await unifiedIdeaService.generateIdeas(
        currentWorkspace.id,
        user.id,
        params
      );
      
      if (generatedIdeas.length > 0) {
        // Add the new ideas to the list
        setIdeas([...generatedIdeas, ...ideas]);
        setSuccess('Ideas generated successfully');
      } else {
        setError('Failed to generate ideas');
      }
      
      return generatedIdeas;
    } catch (error) {
      console.error('Error generating ideas:', error);
      setError('Failed to generate ideas');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an idea
  const updateIdea = async (ideaId: string, updates: Partial<UnifiedIdea>) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await unifiedIdeaService.updateIdea(ideaId, updates);
      
      if (success) {
        // Update the idea in the local state
        setIdeas(ideas.map(i => 
          i.id === ideaId ? { ...i, ...updates } : i
        ));
        
        // Update current idea if it's the one being updated
        if (currentIdea?.id === ideaId) {
          setCurrentIdea({ ...currentIdea, ...updates });
        }
        
        setSuccess('Idea updated successfully');
      } else {
        setError('Failed to update idea');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating idea:', error);
      setError('Failed to update idea');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete an idea
  const deleteIdea = async (ideaId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const success = await unifiedIdeaService.deleteIdea(ideaId);
      
      if (success) {
        // Remove the idea from the local state
        setIdeas(ideas.filter(i => i.id !== ideaId));
        
        // If the current idea was deleted, set the first available idea as current
        if (currentIdea?.id === ideaId) {
          const remainingIdeas = ideas.filter(i => i.id !== ideaId);
          setCurrentIdea(remainingIdeas.length > 0 ? remainingIdeas[0] : null);
        }
        
        // If the active idea in the workspace was deleted, update the workspace
        if (currentWorkspace?.active_idea_id === ideaId) {
          const remainingIdeas = ideas.filter(i => i.id !== ideaId);
          const newActiveIdea = remainingIdeas.length > 0 ? remainingIdeas[0].id : undefined;
          
          if (currentWorkspace) {
            updateWorkspace(currentWorkspace.id, { active_idea_id: newActiveIdea });
          }
        }
        
        setSuccess('Idea deleted successfully');
      } else {
        setError('Failed to delete idea');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting idea:', error);
      setError('Failed to delete idea');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save current state to localStorage
  const saveToLocalStorage = () => {
    if (!user) return;
    
    try {
      const state = {
        currentWorkspaceId: currentWorkspace?.id,
        currentIdeaId: currentIdea?.id,
        currentRefinementStep,
        currentIdea,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`unified_idea_state_${user.id}`, JSON.stringify(state));
      console.log('Saved idea data to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  
  // Load state from localStorage
  const loadFromLocalStorage = () => {
    if (!user) return;
    
    try {
      const savedState = localStorage.getItem(`unified_idea_state_${user.id}`);
      
      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('Loaded saved idea data from localStorage');
        
        // Set the refinement step
        if (state.currentRefinementStep !== undefined) {
          console.log('Using step from localStorage:', state.currentRefinementStep);
          setCurrentRefinementStep(state.currentRefinementStep);
        }
        
        // If we have a current idea in localStorage but not in state, use it temporarily
        if (state.currentIdea && !currentIdea) {
          setCurrentIdea(state.currentIdea);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };
  
  // Clear localStorage
  const clearLocalStorage = () => {
    if (!user) return;
    
    try {
      localStorage.removeItem(`unified_idea_state_${user.id}`);
      console.log('Cleared idea data from localStorage');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };
  
  // Auto-save to localStorage periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveToLocalStorage();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [currentWorkspace, currentIdea, currentRefinementStep]);
  
  const contextValue: UnifiedIdeaContextType = {
    // Workspace state
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    
    // Ideas state
    ideas,
    currentIdea,
    setCurrentIdea,
    generateIdeas,
    updateIdea,
    deleteIdea,
    
    // Refinement state
    currentRefinementStep,
    setCurrentRefinementStep,
    
    // UI state
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    
    // Local storage
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage
  };
  
  return (
    <UnifiedIdeaContext.Provider value={contextValue}>
      {children}
    </UnifiedIdeaContext.Provider>
  );
};
