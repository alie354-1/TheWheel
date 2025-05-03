/**
 * Enhanced Idea Hub Store
 * Central state management for the Enhanced Idea Hub
 */

import create from 'zustand';
import { EnhancedIdeaPlaygroundIdea, IdeaFilters, IdeaHubViewType } from '../types';

// Import the API service
import { ideaHubApi } from '../services/api/idea-hub-api';

interface IdeaHubState {
  // Data
  ideas: EnhancedIdeaPlaygroundIdea[];
  isLoading: boolean;
  error: Error | null;
  
  // View management
  currentView: IdeaHubViewType;
  setCurrentView: (view: IdeaHubViewType) => void;
  
  // Filtering
  filters: IdeaFilters;
  setFilters: (filters: IdeaFilters) => void;
  
  // Actions
  fetchIdeas: () => Promise<void>;
  saveIdea: (idea: EnhancedIdeaPlaygroundIdea) => Promise<void>;
  deleteIdea: (ideaId: string) => Promise<void>;
  toggleSaveIdea: (ideaId: string) => Promise<void>;
  createIdea: (idea: Partial<EnhancedIdeaPlaygroundIdea>) => Promise<string>;
  
  // Company-specific actions
  pushIdeaToCompany: (ideaId: string) => Promise<void>;
  convertIdeaToCompany: (ideaId: string) => Promise<void>;
  promoteIdeaToCompany: (ideaId: string, companyId: string) => Promise<void>;
}

// Use the real API service imported above

export const useIdeaHubStore = create<IdeaHubState>((set, get) => ({
  // Initial state
  ideas: [],
  isLoading: false,
  error: null,
  currentView: 'card_grid',
  filters: {},
  
  // View management
  setCurrentView: (view) => {
    set({ currentView: view });
    // Save preference to user settings
    // Note: This would need a real implementation with user ID
    // For now, we'll just update the state
  },
  
  // Filtering
  setFilters: (filters) => set({ filters }),
  
  // Actions
  fetchIdeas: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const ideas = await ideaHubApi.fetchIdeas(get().filters);
      set({ ideas, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  saveIdea: async (idea) => {
    set({ isLoading: true, error: null });
    
    try {
      await ideaHubApi.updateIdea(idea.id, idea);
      await get().fetchIdeas();
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  deleteIdea: async (ideaId) => {
    set({ isLoading: true, error: null });
    
    try {
      await ideaHubApi.deleteIdea(ideaId);
      const ideas = get().ideas.filter(idea => idea.id !== ideaId);
      set({ ideas, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  toggleSaveIdea: async (ideaId) => {
    const idea = get().ideas.find(i => i.id === ideaId);
    if (!idea) return;
    
    const updatedIdea = { ...idea, is_saved: !idea.is_saved };
    await get().saveIdea(updatedIdea);
  },
  
  createIdea: async (ideaData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newIdeaId = await ideaHubApi.createIdea(ideaData);
      await get().fetchIdeas();
      set({ isLoading: false });
      return newIdeaId || '';
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  // Company-specific actions
  pushIdeaToCompany: async (ideaId) => {
    set({ isLoading: true, error: null });
    
    try {
      await ideaHubApi.pushIdeaToCompanyFeature(ideaId);
      await get().fetchIdeas();
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  convertIdeaToCompany: async (ideaId) => {
    set({ isLoading: true, error: null });
    
    try {
      await ideaHubApi.convertIdeaToCompany(ideaId);
      await get().fetchIdeas();
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  promoteIdeaToCompany: async (ideaId, companyId) => {
    set({ isLoading: true, error: null });
    
    try {
      await ideaHubApi.promoteIdeaToCompany(ideaId, companyId);
      await get().fetchIdeas();
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
}));
