import { IdeaPlaygroundIdea } from '../types/idea-playground.types';
import { 
  IdeaVariation, 
  MergedIdea, 
  IdeaVariationParams, 
  IdeaMergeParams 
} from '../types/idea-pathway.types';
import { supabase } from '../supabase';
import { generalLLMService } from './general-llm.service';
import { ideaPlaygroundService } from './idea-playground.service';

// Extend the ideaPlaygroundService with pathway methods
class IdeaPlaygroundPathwayService {
  /**
   * Generates variations of an existing idea
   * @param userId User ID
   * @param params Parameters for variation generation
   * @returns Array of generated variations
   */
  async generateIdeaVariations(userId: string, params: IdeaVariationParams): Promise<IdeaVariation[]> {
    try {
      const count = params.count || 3;
      
      // First, get the parent idea details
      const { data: parentIdea, error: ideaError } = await supabase
        .from('idea_playground_ideas')
        .select('*')
        .eq('id', params.idea_id)
        .single();
      
      if (ideaError || !parentIdea) {
        console.error('Error fetching parent idea:', ideaError);
        return [];
      }
      
      // Use general LLM service to generate variations
      const promptTemplate = `
      Create ${count} distinct and innovative variations of the following business idea:
      
      Original Idea: ${parentIdea.title}
      Description: ${parentIdea.description || 'Not provided'}
      Problem Statement: ${parentIdea.problem_statement || 'Not provided'}
      Solution Concept: ${parentIdea.solution_concept || 'Not provided'}
      
      For each variation:
      1. Create a unique approach or angle that distinguishes it from the original
      2. Include title, description, problem statement, solution concept, target audience, and unique value proposition
      3. Provide a SWOT analysis (2-3 points each for Strengths, Weaknesses, Opportunities, Threats)
      4. Ensure each variation is truly distinct and not just a minor modification
      
      Return the variations in valid JSON format as an array of objects. Each object should have the following fields:
      - title (string)
      - description (string)
      - problem_statement (string)
      - solution_concept (string)
      - target_audience (string)
      - unique_value (string)
      - strengths (array of strings)
      - weaknesses (array of strings)
      - opportunities (array of strings)
      - threats (array of strings)
      `;
      
      // Call LLM with retry and JSON parsing
      const responseText = await generalLLMService.query(promptTemplate, { userId });
      
      let variations;
      try {
        // Parse the LLM response
        const parsedResponse = JSON.parse(responseText);
        variations = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.variations;
        
        if (!Array.isArray(variations)) {
          throw new Error('Invalid variations format');
        }
      } catch (parseError) {
        console.error('Error parsing variations:', parseError);
        return [];
      }
      
      // Save variations to database
      const variationsWithMetadata = variations.map(variation => ({
        parent_idea_id: params.idea_id,
        ...variation,
        is_selected: false,
        is_merged: false,
      }));
      
      const { data: savedVariations, error: saveError } = await supabase
        .from('idea_playground_variations')
        .insert(variationsWithMetadata)
        .select();
      
      if (saveError) {
        console.error('Error saving variations:', saveError);
        return [];
      }
      
      return savedVariations;
    } catch (error) {
      console.error('Error generating variations:', error);
      return [];
    }
  }

  /**
   * Updates the selection state of a variation
   * @param variationId Variation ID
   * @param isSelected Whether the variation is selected
   * @returns True if update was successful
   */
  async updateVariationSelection(variationId: string, isSelected: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_playground_variations')
        .update({ is_selected: isSelected })
        .eq('id', variationId);
      
      return !error;
    } catch (error) {
      console.error('Error updating variation selection:', error);
      return false;
    }
  }

  /**
   * Merges selected variations into new ideas
   * @param userId User ID
   * @param params Merge parameters
   * @returns Array of merged ideas
   */
  async mergeSelectedVariations(userId: string, params: IdeaMergeParams): Promise<MergedIdea[]> {
    try {
      const count = params.count || 2;
      const strategy = params.merge_strategy || 'hybrid';
      
      // Fetch the selected variations
      const { data: variations, error: fetchError } = await supabase
        .from('idea_playground_variations')
        .select('*')
        .in('id', params.variation_ids);
      
      if (fetchError || !variations || variations.length < 2) {
        console.error('Error fetching variations:', fetchError);
        return [];
      }
      
      // Prepare the prompt for LLM
      const promptTemplate = `
      Merge the following ${variations.length} business idea variations into ${count} new hybrid ideas:
      
      ${variations.map((v, i) => `
      VARIATION ${i + 1}: ${v.title}
      Description: ${v.description || 'Not provided'}
      Problem Statement: ${v.problem_statement || 'Not provided'}
      Solution Concept: ${v.solution_concept || 'Not provided'}
      Target Audience: ${v.target_audience || 'Not provided'}
      Unique Value: ${v.unique_value || 'Not provided'}
      
      Strengths: ${v.strengths?.join(', ') || 'None provided'}
      Weaknesses: ${v.weaknesses?.join(', ') || 'None provided'}
      `).join('\n')}
      
      Create ${count} merged ideas that:
      1. Combine the strengths of the original variations
      2. Address the weaknesses where possible
      3. Create unique and compelling new concepts that are better than any individual variation
      4. Maintain coherence and market fit

      Strategy focus: ${strategy === 'combine_strengths' ? 'Emphasize combining the strongest elements from each variation' : 
        strategy === 'address_weaknesses' ? 'Focus on addressing the weaknesses of each variation' : 
        'Balance both strengthening advantages and addressing weaknesses'}
      
      Return the merged ideas in valid JSON format as an array of objects. Each object should have the following fields:
      - title (string)
      - description (string)
      - problem_statement (string)
      - solution_concept (string)
      - target_audience (string)
      - unique_value (string)
      - business_model (string)
      - strengths (array of strings)
      - weaknesses (array of strings)
      - opportunities (array of strings)
      - threats (array of strings)
      `;
      
      // Call LLM with retry and JSON parsing
      const responseText = await generalLLMService.query(promptTemplate, { userId });
      
      let mergedIdeas;
      try {
        // Parse the LLM response
        const parsedResponse = JSON.parse(responseText);
        mergedIdeas = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.mergedIdeas;
        
        if (!Array.isArray(mergedIdeas)) {
          throw new Error('Invalid merged ideas format');
        }
      } catch (parseError) {
        console.error('Error parsing merged ideas:', parseError);
        return [];
      }
      
      // Save merged ideas to database
      const mergedIdeasWithMetadata = mergedIdeas.map(idea => ({
        canvas_id: params.canvas_id,
        ...idea,
        is_selected: false,
      }));
      
      const { data: savedMergedIdeas, error: saveError } = await supabase
        .from('idea_playground_merged_ideas')
        .insert(mergedIdeasWithMetadata)
        .select();
      
      if (saveError || !savedMergedIdeas) {
        console.error('Error saving merged ideas:', saveError);
        return [];
      }
      
      // Create relationships between merged ideas and source variations
      const mergeSourceEntries = [];
      for (const mergedIdea of savedMergedIdeas) {
        for (const variationId of params.variation_ids) {
          mergeSourceEntries.push({
            merged_idea_id: mergedIdea.id,
            variation_id: variationId
          });
        }
      }
      
      const { error: relationError } = await supabase
        .from('idea_playground_merge_sources')
        .insert(mergeSourceEntries);
      
      if (relationError) {
        console.error('Error saving merge source relationships:', relationError);
      }
      
      // Flag the variations as merged
      await supabase
        .from('idea_playground_variations')
        .update({ is_merged: true })
        .in('id', params.variation_ids);
      
      return savedMergedIdeas;
    } catch (error) {
      console.error('Error merging variations:', error);
      return [];
    }
  }

  /**
   * Gets merged ideas for a canvas
   * @param canvasId Canvas ID
   * @returns Array of merged ideas with source variations
   */
  async getMergedIdeasForCanvas(canvasId: string): Promise<MergedIdea[]> {
    try {
      // Get merged ideas
      const { data: mergedIdeas, error: fetchError } = await supabase
        .from('idea_playground_merged_ideas')
        .select('*')
        .eq('canvas_id', canvasId);
      
      if (fetchError || !mergedIdeas) {
        console.error('Error fetching merged ideas:', fetchError);
        return [];
      }
      
      // Get source variations for each merged idea
      for (const mergedIdea of mergedIdeas) {
        const { data: mergeSources, error: sourcesError } = await supabase
          .from('idea_playground_merge_sources')
          .select('variation_id')
          .eq('merged_idea_id', mergedIdea.id);
        
        if (!sourcesError && mergeSources) {
          mergedIdea.source_variations = mergeSources.map(source => source.variation_id);
        }
      }
      
      return mergedIdeas;
    } catch (error) {
      console.error('Error getting merged ideas:', error);
      return [];
    }
  }

  /**
   * Saves a variation as a new idea
   * @param userId User ID
   * @param canvasId Canvas ID
   * @param variation Variation to save
   * @returns Saved idea
   */
  async saveVariationAsIdea(userId: string, canvasId: string, variation: IdeaVariation): Promise<IdeaPlaygroundIdea> {
    try {
      const newIdea = {
        canvas_id: canvasId,
        title: variation.title,
        description: variation.description,
        problem_statement: variation.problem_statement,
        solution_concept: variation.solution_concept,
        target_audience: variation.target_audience,
        unique_value: variation.unique_value,
        business_model: variation.business_model || '',
        pathway_status: 'refined',
        metadata: {
          source_type: 'variation',
          source_id: variation.id
        }
      };
      
      const { data: savedIdea, error } = await supabase
        .from('idea_playground_ideas')
        .insert(newIdea)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving variation as idea:', error);
        throw error;
      }
      
      return savedIdea;
    } catch (error) {
      console.error('Error in saveVariationAsIdea:', error);
      throw error;
    }
  }

  /**
   * Saves a merged idea as a new idea
   * @param userId User ID
   * @param canvasId Canvas ID
   * @param mergedIdea Merged idea to save
   * @returns Saved idea
   */
  async saveMergedIdeaAsIdea(userId: string, canvasId: string, mergedIdea: MergedIdea): Promise<IdeaPlaygroundIdea> {
    try {
      const newIdea = {
        canvas_id: canvasId,
        title: mergedIdea.title,
        description: mergedIdea.description,
        problem_statement: mergedIdea.problem_statement,
        solution_concept: mergedIdea.solution_concept,
        target_audience: mergedIdea.target_audience,
        unique_value: mergedIdea.unique_value,
        business_model: mergedIdea.business_model || '',
        pathway_status: 'refined',
        metadata: {
          source_type: 'merged',
          source_id: mergedIdea.id,
          source_variations: mergedIdea.source_variations
        }
      };
      
      const { data: savedIdea, error } = await supabase
        .from('idea_playground_ideas')
        .insert(newIdea)
        .select()
        .single();
      
      if (error) {
        console.error('Error saving merged idea as idea:', error);
        throw error;
      }
      
      return savedIdea;
    } catch (error) {
      console.error('Error in saveMergedIdeaAsIdea:', error);
      throw error;
    }
  }

  /**
   * Updates the status of an idea
   * @param ideaId Idea ID
   * @param status New status
   * @returns True if update was successful
   */
  async updateIdeaStatus(ideaId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_playground_ideas')
        .update({ pathway_status: status })
        .eq('id', ideaId);
      
      return !error;
    } catch (error) {
      console.error('Error updating idea status:', error);
      return false;
    }
  }
}

export const ideaPlaygroundPathwayService = new IdeaPlaygroundPathwayService();
