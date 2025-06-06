import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export interface IdeaIteration {
  id: string;
  version: number;
  title: string;
  description: string;
  problem_statement?: string;
  solution_concept?: string;
  target_audience?: string;
  unique_value?: string;
  business_model?: string;
  marketing_strategy?: string;
  revenue_model?: string;
  go_to_market?: string;
  feedback?: any;
  timestamp: string;
}

export interface IdeaMemory {
  id: string;
  user_id: string;
  idea_id: string;
  iterations: IdeaIteration[];
  summary?: string;
  tags?: string[];
  last_updated: string;
  created_at: string;
}

class IdeaMemoryService {
  async getMemory(userId: string, ideaId: string): Promise<IdeaMemory | null> {
    try {
      const { data, error } = await supabase
        .from('idea_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('idea_id', ideaId)
        .single();

      if (error) {
        console.error('Error fetching idea memory:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMemory:', error);
      return null;
    }
  }

  async getAllMemories(userId: string): Promise<IdeaMemory[]> {
    try {
      const { data, error } = await supabase
        .from('idea_memories')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching all idea memories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllMemories:', error);
      return [];
    }
  }

  async saveMemory(
    userId: string, 
    ideaId: string, 
    iterations: IdeaIteration[], 
    summary?: string, 
    tags?: string[]
  ): Promise<string | null> {
    try {
      const existingMemory = await this.getMemory(userId, ideaId);
      
      if (existingMemory) {
        // Update existing memory
        const { error } = await supabase
          .from('idea_memories')
          .update({
            iterations,
            summary,
            tags,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingMemory.id);

        if (error) {
          console.error('Error updating idea memory:', error);
          return null;
        }

        return existingMemory.id;
      } else {
        // Create new memory
        const newMemoryId = uuidv4();
        const { error } = await supabase
          .from('idea_memories')
          .insert({
            id: newMemoryId,
            user_id: userId,
            idea_id: ideaId,
            iterations,
            summary,
            tags,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating idea memory:', error);
          return null;
        }

        return newMemoryId;
      }
    } catch (error) {
      console.error('Error in saveMemory:', error);
      return null;
    }
  }

  async addIteration(
    userId: string, 
    ideaId: string, 
    iteration: Omit<IdeaIteration, 'id' | 'timestamp'>
  ): Promise<boolean> {
    try {
      // Try to get the memory, but don't fail if the table doesn't exist
      let memory: IdeaMemory | null = null;
      try {
        memory = await this.getMemory(userId, ideaId);
      } catch (memoryError) {
        console.log('Error getting memory, might be a missing table:', memoryError);
        // Continue without memory
      }
      
      const iterations = memory?.iterations || [];
      
      const newIteration: IdeaIteration = {
        ...iteration,
        id: uuidv4(),
        timestamp: new Date().toISOString()
      };
      
      const updatedIterations = [...iterations, newIteration];
      
      // Try to update the idea's version and iterations count in the ideas table
      try {
        await supabase
          .from('ideas')
          .update({
            version: iteration.version,
            iterations: updatedIterations.length
          })
          .eq('id', ideaId)
          .eq('user_id', userId);
      } catch (updateError) {
        console.log('Error updating idea, might be missing columns:', updateError);
        // Continue without updating the idea
      }
      
      // Try to save the memory, but don't fail if the table doesn't exist
      try {
        const result = await this.saveMemory(userId, ideaId, updatedIterations, memory?.summary, memory?.tags);
        return !!result;
      } catch (saveError) {
        console.log('Error saving memory, might be a missing table:', saveError);
        // Return true anyway since we've at least tried to save the iteration
        return true;
      }
    } catch (error) {
      console.error('Error in addIteration:', error);
      return false;
    }
  }

  async generateSummary(userId: string, ideaId: string): Promise<string> {
    try {
      const memory = await this.getMemory(userId, ideaId);
      
      if (!memory || memory.iterations.length === 0) {
        return "No iterations found for this idea.";
      }
      
      // Get the latest iteration
      const latestIteration = memory.iterations[memory.iterations.length - 1];
      
      // Compare with the first iteration if available
      const firstIteration = memory.iterations[0];
      
      let summary = `Idea "${latestIteration.title}" has evolved through ${memory.iterations.length} iterations. `;
      
      if (memory.iterations.length > 1) {
        summary += `Starting as "${firstIteration.title}", it has been refined to focus on ${latestIteration.target_audience || 'its target audience'}. `;
        summary += `Key improvements include ${latestIteration.unique_value || 'its unique value proposition'}.`;
      } else {
        summary += `It is currently in its initial stage of development.`;
      }
      
      // Save the generated summary
      await this.saveMemory(userId, ideaId, memory.iterations, summary, memory.tags);
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return "Unable to generate summary at this time.";
    }
  }

  async isFeatureEnabled(featureName: string, userId?: string, context?: string): Promise<boolean> {
    // Enable enhanced_idea_generation feature only for idea refinement, not for standup
    if (featureName === 'enhanced_idea_generation') {
      if (context === 'standup') {
        console.log('Enhanced idea generation disabled for standup context');
        return false;
      }
      console.log('Enhanced idea generation feature enabled for idea refinement');
      return true;
    }
    // Use the main feature flag system
    try {
      // Dynamically import to avoid circular dependency if needed
      const { featureFlagsService } = await import('./feature-flags.service');
      return featureFlagsService.isEnabled(featureName);
    } catch (error) {
      console.error(`Error checking feature flag ${featureName} via main feature flag system:`, error);
      return false;
    }
  }
}

export const ideaMemoryService = new IdeaMemoryService();
