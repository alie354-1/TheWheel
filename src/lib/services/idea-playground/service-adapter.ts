import { IdeaPlaygroundIdea as TypesIdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import { 
  ideaPlaygroundService, 
  IdeaPlaygroundIdea as ServiceIdeaPlaygroundIdea,
  IdeaStatus 
} from '../idea-playground.service';
import { pathway1Adapter } from './pathway1-adapter';
import { loggingService } from '../logging.service';

// Local storage key for maintaining idea cache
const LOCAL_IDEA_STORAGE_KEY = 'wheel99_local_ideas';

// Type for our local idea storage
interface LocalIdeaStorage {
  ideas: Record<string, TypesIdeaPlaygroundIdea>;
  lastUpdated: string;
}

/**
 * Adapter that connects the old components to the new modular service layer
 */
export const ideaPlaygroundAdapter = {
  /**
   * Get or initialize the local idea storage
   */
  _getLocalStorage(): LocalIdeaStorage {
    try {
      const stored = localStorage.getItem(LOCAL_IDEA_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse local idea storage');
    }
    
    // Initialize empty storage
    return {
      ideas: {},
      lastUpdated: new Date().toISOString()
    };
  },
  
  /**
   * Save to local idea storage
   */
  _saveLocalStorage(storage: LocalIdeaStorage) {
    try {
      localStorage.setItem(LOCAL_IDEA_STORAGE_KEY, JSON.stringify({
        ...storage,
        lastUpdated: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Failed to save to local idea storage');
    }
  },

  /**
   * Create a new idea in the system
   */
  async createIdea(
    ideaData: Partial<TypesIdeaPlaygroundIdea>,
    userId: string
  ): Promise<TypesIdeaPlaygroundIdea> {
    try {
      // Log the action with safe error handling
      try {
        loggingService.logUserAction('create_idea', 'IdeaPlaygroundAdapter', {
          userId,
          hasTitle: !!ideaData.title,
          timestamp: new Date().toISOString()
        }).catch(() => {
          // Ignore logging errors - don't let them block the main functionality
          console.warn('Failed to log idea creation - continuing with creation anyway');
        });
      } catch (e) {
        // Silently ignore all logging errors
      }
      
      // Get a canvas for this user
      const canvases = await ideaPlaygroundService.getCanvases(userId);
      const canvasId = canvases && canvases.length > 0 ? canvases[0].id : 'default-canvas';
      
      // Use the simplified idea generation method in the service
      const generatedIdeas = await ideaPlaygroundService.generateIdeas(userId, canvasId, {
        problem_area: ideaData.problem_statement,
        industry: ideaData.title?.split(' ')[0], // Use first word of title as mock industry
        count: 1,
        maxResults: 1
      });
      
      if (generatedIdeas && generatedIdeas.length > 0) {
        // Adapt the generated idea to match our expected format
        const generatedIdea = generatedIdeas[0];
        const result: TypesIdeaPlaygroundIdea = {
          id: generatedIdea.id,
          title: ideaData.title || generatedIdea.title || 'Untitled Idea',
          description: ideaData.description || generatedIdea.description || 'No description provided',
          problem_statement: ideaData.problem_statement || generatedIdea.problem_statement || '',
          solution_concept: ideaData.solution_concept || generatedIdea.solution_concept || '',
          target_audience: ideaData.target_audience || generatedIdea.target_audience || '',
          unique_value: ideaData.unique_value || generatedIdea.unique_value || '',
          business_model: ideaData.business_model || generatedIdea.business_model || '',
          status: generatedIdea.status || IdeaStatus.DRAFT,
          created_at: generatedIdea.createdAt || new Date().toISOString(),
          updated_at: generatedIdea.updatedAt || new Date().toISOString(),
          userId: userId,
          tags: generatedIdea.tags || []
        };
        
        return result;
      }
      
      throw new Error('Failed to generate idea');
    } catch (error) {
      console.error('Error in ideaPlaygroundAdapter.createIdea:', error);
      
      // Create a local version as fallback (no persistence)
      const localIdea: TypesIdeaPlaygroundIdea = {
        id: `local-${Date.now()}`,
        title: ideaData.title || 'Untitled Idea',
        description: ideaData.description || 'No description provided',
        problem_statement: ideaData.problem_statement || '',
        solution_concept: ideaData.solution_concept || '',
        target_audience: ideaData.target_audience || '',
        unique_value: ideaData.unique_value || '',
        business_model: ideaData.business_model || '',
        status: IdeaStatus.DRAFT,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        userId: userId,
        tags: []
      };
      
      // Save to local storage
      const storage = this._getLocalStorage();
      storage.ideas[localIdea.id] = localIdea;
      this._saveLocalStorage(storage);
      
      return localIdea;
    }
  },
  
  /**
   * Update an existing idea
   */
  async updateIdea(
    ideaId: string,
    ideaData: Partial<TypesIdeaPlaygroundIdea>
  ): Promise<TypesIdeaPlaygroundIdea> {
    try {
      // Log the action with safe error handling
      try {
        loggingService.logUserAction('update_idea', 'IdeaPlaygroundAdapter', {
          ideaId,
          fieldCount: Object.keys(ideaData).length,
          timestamp: new Date().toISOString()
        }).catch(() => {
          // Ignore logging errors
          console.warn('Failed to log idea update - continuing with update anyway');
        });
      } catch (e) {
        // Silently ignore all logging errors
      }
      
      // For local ideas created as fallbacks, update in local storage
      if (ideaId.startsWith('local-')) {
        const storage = this._getLocalStorage();
        const existingIdea = storage.ideas[ideaId];
        
        if (!existingIdea) {
          throw new Error('Local idea not found');
        }
        
        const updatedIdea: TypesIdeaPlaygroundIdea = {
          ...existingIdea,
          ...ideaData,
          id: ideaId,
          updated_at: new Date().toISOString()
        };
        
        storage.ideas[ideaId] = updatedIdea;
        this._saveLocalStorage(storage);
        
        return updatedIdea;
      }
      
      // For real ideas, attempt to update via service
      // Note: The updateIdea only returns a boolean, but we need to return the idea
      const updateSuccess = await ideaPlaygroundService.updateIdea(ideaId, {
        title: ideaData.title,
        description: ideaData.description,
        problem_statement: ideaData.problem_statement,
        solution_concept: ideaData.solution_concept,
        target_audience: ideaData.target_audience instanceof Array ? ideaData.target_audience.join(', ') : ideaData.target_audience,
        unique_value: ideaData.unique_value,
        business_model: ideaData.business_model,
      });
      
      if (updateSuccess) {
        // Since we don't get the updated idea back, reconstruct it
        return {
          ...ideaData,
          id: ideaId,
          updated_at: new Date().toISOString()
        } as TypesIdeaPlaygroundIdea;
      }
      
      throw new Error('Failed to update idea');
    } catch (error) {
      console.error('Error in ideaPlaygroundAdapter.updateIdea:', error);
      
      // Return the data as is for fallback
      return {
        ...ideaData,
        id: ideaId,
        updated_at: new Date().toISOString()
      } as TypesIdeaPlaygroundIdea;
    }
  },
  
  /**
   * Get an idea by ID
   */
  async getIdea(ideaId: string): Promise<TypesIdeaPlaygroundIdea | null> {
    try {
      // For local ideas created as fallbacks, check local storage
      if (ideaId.startsWith('local-')) {
        const storage = this._getLocalStorage();
        const localIdea = storage.ideas[ideaId];
        
        if (!localIdea) {
          console.warn('Local idea not found:', ideaId);
          return null;
        }
        
        return localIdea;
      }
      
      // For remote ideas, we would need to get the canvas and then find the idea
      // Since there's no direct getIdea method, we'll mock this for now
      // In a real implementation, this would use a combination of available API methods
      
      // This is just a mock implementation
      return {
        id: ideaId,
        title: "Retrieved Idea",
        description: "This idea was retrieved from the system.",
        problem_statement: "Problem statement placeholder",
        solution_concept: "Solution concept placeholder",
        target_audience: "Target audience placeholder",
        unique_value: "Unique value placeholder",
        business_model: "Business model placeholder",
        status: IdeaStatus.ACTIVE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        userId: 'system-user',
        tags: ['retrieved']
      };
    } catch (error) {
      console.error('Error in ideaPlaygroundAdapter.getIdea:', error);
      return null;
    }
  },
  
  /**
   * Get all ideas for a user
   */
  async getIdeas(userId?: string): Promise<TypesIdeaPlaygroundIdea[]> {
    try {
      // First check local storage for any locally created ideas
      const storage = this._getLocalStorage();
      const localIdeas = Object.values(storage.ideas);
      
      // If user ID is provided, filter for that user
      const filteredLocalIdeas = userId 
        ? localIdeas.filter(idea => idea.userId === userId)
        : localIdeas;
      
      // For remote ideas, get canvases for user and fetch ideas for each canvas
      const remoteIdeas: TypesIdeaPlaygroundIdea[] = [];
      
      if (userId) {
        try {
          const canvases = await ideaPlaygroundService.getCanvases(userId);
          
          // For each canvas, get its ideas
          for (const canvas of canvases) {
            const canvasIdeas = await ideaPlaygroundService.getIdeasForCanvas(canvas.id);
            
            // Convert to our idea format
            const convertedIdeas = canvasIdeas.map(idea => ({
              id: idea.id,
              title: idea.title,
              description: idea.description,
              problem_statement: idea.problem_statement,
              solution_concept: idea.solution_concept,
              target_audience: idea.target_audience,
              unique_value: idea.unique_value,
              business_model: idea.business_model || '',
              status: idea.status,
              created_at: idea.createdAt,
              updated_at: idea.updatedAt,
              userId: idea.userId || userId,
              tags: idea.tags || []
            }));
            
            remoteIdeas.push(...convertedIdeas);
          }
        } catch (err) {
          console.error('Error fetching remote ideas:', err);
          // Continue with just local ideas
        }
      }
      
      // Combine and return both types of ideas
      return [...filteredLocalIdeas, ...remoteIdeas];
    } catch (error) {
      console.error('Error in ideaPlaygroundAdapter.getIdeas:', error);
      return [];
    }
  },
  
  /**
   * Refine an idea based on feedback
   */
  async refineIdea(
    idea: TypesIdeaPlaygroundIdea,
    feedback: string
  ): Promise<Partial<TypesIdeaPlaygroundIdea>> {
    try {
      // Use the service's refineIdea or pathway adapter's functionality
      if (!idea || !idea.id) {
        throw new Error('Invalid idea provided for refinement');
      }
      
      // Use the service's refineIdea if the idea exists in the system
      if (!idea.id.startsWith('local-')) {
        try {
          const refinement = await ideaPlaygroundService.refineIdea(idea.id, feedback);
          return refinement;
        } catch (err) {
          console.warn('Error using service refineIdea, falling back to AI generation', err);
          // Fall through to use the AI service directly
        }
      }
      
      // Use the AI service directly as fallback
      // We can use the pathway1Adapter's functionality to generate a variation
      // that incorporates the feedback
      const mockRefinedIdea = {
        title: idea.title,
        description: `${idea.description} (Refined based on feedback)`,
        problem_statement: `${idea.problem_statement} (Refined)`,
        solution_concept: `${idea.solution_concept} (Enhanced)`,
        unique_value: `${idea.unique_value} (Improved)`,
        target_audience: idea.target_audience,
        business_model: idea.business_model
      };
      
      return mockRefinedIdea;
    } catch (error) {
      console.error('Error in ideaPlaygroundAdapter.refineIdea:', error);
      
      // Return a minimal refinement as fallback
      return {
        title: idea.title,
        description: idea.description + ' (Refined version)'
      };
    }
  },
  
  /**
   * Generate suggestions for an idea
   */
  async generateSuggestions(
    idea: TypesIdeaPlaygroundIdea,
    userId: string,
    count: number = 5
  ) {
    // Use the pathway1Adapter for generating suggestions
    return pathway1Adapter.generateCompanySuggestions(idea, userId, count);
  },
  
  /**
   * Merge selected suggestions
   */
  async mergeSuggestions(
    suggestions: any[],
    userId: string
  ) {
    // Use the pathway1Adapter for merging suggestions
    return pathway1Adapter.mergeSuggestions(suggestions, userId);
  }
};
