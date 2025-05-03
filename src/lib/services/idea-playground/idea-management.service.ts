/**
 * Service for managing ideas throughout their lifecycle
 */
import { supabase } from '../../supabase';
import { IdeaPlaygroundIdea } from '../../types/idea-playground.types';
import { IdeaGenerationResult } from '../../types/idea-generation.types';

/**
 * Service for managing all aspects of ideas in the system
 */
export class IdeaManagementService {
  /**
   * Create a new idea in the database
   * @param ideaData The idea data to create
   */
  async createIdea(ideaData: Partial<IdeaPlaygroundIdea>): Promise<IdeaPlaygroundIdea> {
    try {
      // Ensure all required fields have values
      const idea = this.ensureRequiredFields(ideaData);
      
      // Insert into database
      const { data, error } = await supabase
        .from('ideas')
        .insert([idea])
        .select()
        .single();
        
      if (error) throw error;
      
      return data as IdeaPlaygroundIdea;
    } catch (error) {
      console.error('Error creating idea:', error);
      throw new Error('Failed to create idea');
    }
  }
  
  /**
   * Get a single idea by its ID
   * @param ideaId The ID of the idea to retrieve
   */
  async getIdea(ideaId: string): Promise<IdeaPlaygroundIdea> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();
        
      if (error) throw error;
      
      return data as IdeaPlaygroundIdea;
    } catch (error) {
      console.error(`Error fetching idea with ID ${ideaId}:`, error);
      throw new Error(`Idea not found with ID: ${ideaId}`);
    }
  }
  
  /**
   * Get all ideas for a specific user
   * @param userId The user ID to get ideas for
   */
  async getIdeasForUser(userId: string): Promise<IdeaPlaygroundIdea[]> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data as IdeaPlaygroundIdea[];
    } catch (error) {
      console.error(`Error fetching ideas for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Update an existing idea
   * @param idea The idea data to update
   */
  async updateIdea(idea: IdeaPlaygroundIdea): Promise<IdeaPlaygroundIdea> {
    try {
      // Set updated timestamp
      const updatedIdea = {
        ...idea,
        updated_at: new Date().toISOString()
      };
      
      // Update in database
      const { data, error } = await supabase
        .from('ideas')
        .update(updatedIdea)
        .eq('id', idea.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data as IdeaPlaygroundIdea;
    } catch (error) {
      console.error(`Error updating idea with ID ${idea.id}:`, error);
      throw new Error(`Failed to update idea with ID: ${idea.id}`);
    }
  }
  
  /**
   * Delete an idea
   * @param ideaId The ID of the idea to delete
   */
  async deleteIdea(ideaId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);
        
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting idea with ID ${ideaId}:`, error);
      throw new Error(`Failed to delete idea with ID: ${ideaId}`);
    }
  }
  
  /**
   * Set the protection level for an idea
   * @param ideaId The ID of the idea
   * @param level The protection level to set
   * @param userId The ID of the user making the change
   */
  async setProtectionLevel(
    ideaId: string, 
    level: string,
    userId: string
  ): Promise<void> {
    try {
      // Update the idea
      const { error } = await supabase
        .from('ideas')
        .update({
          protection_level: level,
          updated_at: new Date().toISOString()
        })
        .eq('id', ideaId)
        .eq('user_id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error(`Error setting protection level for idea ${ideaId}:`, error);
      throw new Error(`Failed to set protection level for idea with ID: ${ideaId}`);
    }
  }
  
  /**
   * Ensure all required fields have values
   * @param ideaData Partial idea data
   * @returns Complete idea data with default values where needed
   */
  private ensureRequiredFields(ideaData: Partial<IdeaPlaygroundIdea>): Partial<IdeaPlaygroundIdea> {
    const now = new Date().toISOString();
    
    return {
      ...ideaData,
      title: ideaData.title || 'Untitled Idea',
      description: ideaData.description || '',
      problem_statement: ideaData.problem_statement || '',
      solution_concept: ideaData.solution_concept || '',
      target_audience: ideaData.target_audience || [],
      unique_value: ideaData.unique_value || '',
      business_model: ideaData.business_model || '',
      created_at: ideaData.created_at || now,
      updated_at: ideaData.updated_at || now,
      protection_level: ideaData.protection_level || 'public'
    };
  }
}
