import { supabase } from '../supabase';
import { generalLLMService } from './general-llm.service';
import { mockIdeaPlaygroundService } from './mock-idea-playground.service';
import {
  IdeaPlaygroundCanvas,
  IdeaPlaygroundIdea,
  IdeaPlaygroundComponent,
  IdeaPlaygroundTag,
  IdeaPlaygroundFeedback,
  IdeaGenerationParams,
  IdeaRefinementParams,
  CompanyRelevance
} from '../types/idea-playground.types';

// Set to false to use real services
const USE_MOCK_SERVICES = true;

export class IdeaPlaygroundService {
  constructor() {}
  
  // Canvas Management
  async createCanvas(userId: string, name: string, description?: string, companyId?: string): Promise<IdeaPlaygroundCanvas | null> {
    try {
      const { data, error } = await supabase.rpc('create_idea_playground_canvas', {
        p_user_id: userId,
        p_company_id: companyId,
        p_name: name,
        p_description: description
      });
      
      if (error) {
        console.error('Error creating canvas:', error);
        return null;
      }
      
      // Get the created canvas
      const canvasId = data;
      return await this.getCanvas(canvasId);
    } catch (error) {
      console.error('Error in createCanvas:', error);
      return null;
    }
  }
  
  async getCanvases(userId: string, includeArchived: boolean = false): Promise<IdeaPlaygroundCanvas[]> {
    try {
      let query = supabase
        .from('idea_playground_canvases')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching canvases:', error);
        return [];
      }
      
      return data as IdeaPlaygroundCanvas[];
    } catch (error) {
      console.error('Error in getCanvases:', error);
      return [];
    }
  }
  
  async getCanvas(canvasId: string): Promise<IdeaPlaygroundCanvas | null> {
    try {
      const { data, error } = await supabase
        .from('idea_playground_canvases')
        .select('*')
        .eq('id', canvasId)
        .single();
        
      if (error) {
        console.error('Error fetching canvas:', error);
        return null;
      }
      
      return data as IdeaPlaygroundCanvas;
    } catch (error) {
      console.error('Error in getCanvas:', error);
      return null;
    }
  }
  
  async updateCanvas(canvasId: string, updates: Partial<IdeaPlaygroundCanvas>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_playground_canvases')
        .update(updates)
        .eq('id', canvasId);
        
      if (error) {
        console.error('Error updating canvas:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateCanvas:', error);
      return false;
    }
  }
  
  async archiveCanvas(canvasId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('archive_idea_playground_canvas', {
        p_canvas_id: canvasId
      });
      
      if (error) {
        console.error('Error archiving canvas:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in archiveCanvas:', error);
      return false;
    }
  }
  
  // Idea Generation and Management
  async generateIdeas(
    userId: string,
    canvasId: string,
    params: IdeaGenerationParams
  ): Promise<IdeaPlaygroundIdea[]> {
    try {
      // Get user's company if they have one
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      const companyId = userProfile?.company_id;
      const useCompanyContext = params.useCompanyContext && companyId;
      
      // Create context for LLM query
      const context = {
        userId,
        companyId: useCompanyContext ? companyId : undefined,
        useCompanyModel: useCompanyContext,
        useAbstraction: true,
        useExistingModels: true,
        context: 'idea_playground'
      };
      
      // Create prompt
      const prompt = this.createIdeaGenerationPrompt(params, useCompanyContext);
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, context);
      
      // Parse the response
      const content = response.content || '';
      
      console.log('OpenAI response content:', content);
      
      // Try to extract JSON using multiple patterns
      let jsonData;
      let extractedJson = '';
      
      // Try to extract JSON from code blocks
      const jsonCodeBlockMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonCodeBlockMatch) {
        extractedJson = jsonCodeBlockMatch[1];
        console.log('Extracted JSON from code block:', extractedJson);
      } 
      // Try to extract JSON array pattern
      else {
        const jsonArrayMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
        if (jsonArrayMatch) {
          extractedJson = jsonArrayMatch[0];
          console.log('Extracted JSON array:', extractedJson);
        }
        // Try to extract any JSON object
        else {
          const jsonObjectMatch = content.match(/{[\s\S]*}/);
          if (jsonObjectMatch) {
            extractedJson = jsonObjectMatch[0];
            console.log('Extracted JSON object:', extractedJson);
          }
        }
      }
      
      if (!extractedJson) {
        console.error('Failed to extract JSON from LLM response');
        console.log('Full response content:', content);
        
        // Create a fallback idea if no JSON could be extracted
        return this.createFallbackIdeas(content, canvasId);
      }
      
      try {
        // Clean up the extracted JSON to handle common formatting issues
        const cleanedJson = extractedJson
          .replace(/\\"/g, '"')  // Handle escaped quotes
          .replace(/\n/g, ' ')   // Remove newlines
          .replace(/,\s*}/g, '}') // Remove trailing commas in objects
          .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        console.log('Cleaned JSON:', cleanedJson);
        
        const parsedData = JSON.parse(cleanedJson);
        
        // Ensure the response is an array
        const ideasArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        
        // Generate company relevance if using company context
        const savedIdeas: IdeaPlaygroundIdea[] = [];
        
        for (const ideaData of ideasArray) {
          // Generate company relevance if using company context
          let companyRelevance: CompanyRelevance | undefined;
          if (useCompanyContext) {
            companyRelevance = await this.generateCompanyRelevance(ideaData, companyId);
          }
          
          // Save the idea to the database
          const { data, error } = await supabase
            .from('idea_playground_ideas')
            .insert({
              canvas_id: canvasId,
              title: ideaData.title || 'Untitled Idea',
              description: ideaData.description || '',
              problem_statement: ideaData.problem_statement || '',
              solution_concept: ideaData.solution_concept || '',
              target_audience: ideaData.target_audience || '',
              unique_value: ideaData.unique_value || '',
              business_model: ideaData.business_model || '',
              marketing_strategy: ideaData.marketing_strategy || '',
              revenue_model: ideaData.revenue_model || '',
              go_to_market: ideaData.go_to_market || '',
              market_size: ideaData.market_size || '',
              used_company_context: useCompanyContext,
              company_relevance: useCompanyContext ? companyRelevance : null,
              version: 1
            })
            .select()
            .single();
            
          if (error) {
            console.error('Error saving idea:', error);
            continue;
          }
          
          savedIdeas.push(data as IdeaPlaygroundIdea);
          
          // Save components if provided
          if (ideaData.competition && Array.isArray(ideaData.competition)) {
            for (const item of ideaData.competition) {
              await this.createComponent(data.id, 'competition', item);
            }
          }
          
          if (ideaData.revenue_streams && Array.isArray(ideaData.revenue_streams)) {
            for (const item of ideaData.revenue_streams) {
              await this.createComponent(data.id, 'revenue_streams', item);
            }
          }
          
          if (ideaData.cost_structure && Array.isArray(ideaData.cost_structure)) {
            for (const item of ideaData.cost_structure) {
              await this.createComponent(data.id, 'cost_structure', item);
            }
          }
          
          if (ideaData.key_metrics && Array.isArray(ideaData.key_metrics)) {
            for (const item of ideaData.key_metrics) {
              await this.createComponent(data.id, 'key_metrics', item);
            }
          }
        }
        
        return savedIdeas;
      } catch (parseError) {
        console.error('Error parsing JSON from ideas:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      
      // Create a fallback idea with error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createFallbackIdeas(`Error generating ideas: ${errorMessage}`, canvasId);
    }
  }
  // Create fallback ideas when JSON extraction or parsing fails
  private createFallbackIdeas(content: string, canvasId: string): IdeaPlaygroundIdea[] {
    try {
      // Extract useful information from the content
      const titleMatch = content.match(/title[:\s]+"?([^"\n,]+)"?/i) || 
                         content.match(/idea[:\s]+"?([^"\n,]+)"?/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Generated Idea';
      
      const descriptionMatch = content.match(/description[:\s]+"?([^"\.]+\.)"?/i) || 
                               content.match(/brief[:\s]+"?([^"\.]+\.)"?/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : 'Generated from AI response';
      
      const problemMatch = content.match(/problem[:\s]+"?([^"\.]+\.)"?/i);
      const problem = problemMatch ? problemMatch[1].trim() : 'Identified from AI response';
      
      const solutionMatch = content.match(/solution[:\s]+"?([^"\.]+\.)"?/i);
      const solution = solutionMatch ? solutionMatch[1].trim() : 'Proposed solution from AI response';
      
      // Create a fallback idea
      const fallbackIdea: Partial<IdeaPlaygroundIdea> = {
        canvas_id: canvasId,
        title: title,
        description: description,
        problem_statement: problem,
        solution_concept: solution,
        target_audience: 'Extracted from AI response',
        unique_value: 'Value proposition extracted from AI response',
        business_model: 'Business model extracted from AI response',
        marketing_strategy: 'Marketing strategy extracted from AI response',
        revenue_model: 'Revenue model extracted from AI response',
        go_to_market: 'Go-to-market strategy extracted from AI response',
        market_size: 'Market size extracted from AI response',
        used_company_context: false,
        version: 1
      };
      
      // Log the fallback idea
      console.log('Created fallback idea:', fallbackIdea);
      
      return [fallbackIdea as IdeaPlaygroundIdea];
    } catch (error) {
      console.error('Error creating fallback idea:', error);
      
      // Return a very basic fallback idea if everything else fails
      const fallbackIdea: Partial<IdeaPlaygroundIdea> = {
        canvas_id: canvasId,
        title: 'Generated Idea',
        description: 'An idea was generated but could not be properly formatted',
        problem_statement: 'The system encountered an issue processing the AI response',
        solution_concept: 'Please try again with more specific parameters',
        target_audience: 'N/A',
        unique_value: 'N/A',
        business_model: 'N/A',
        marketing_strategy: 'N/A',
        revenue_model: 'N/A',
        go_to_market: 'N/A',
        market_size: 'N/A',
        used_company_context: false,
        is_archived: false,
        version: 1
      };
      
      return [fallbackIdea as IdeaPlaygroundIdea];
    }
  }
  
  async getIdeasForCanvas(canvasId: string, includeArchived: boolean = false): Promise<IdeaPlaygroundIdea[]> {
    try {
      let query = supabase
        .from('idea_playground_ideas')
        .select('*')
        .eq('canvas_id', canvasId)
        .order('created_at', { ascending: false });
        
      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching ideas:', error);
        return [];
      }
      
      return data as IdeaPlaygroundIdea[];
    } catch (error) {
      console.error('Error in getIdeasForCanvas:', error);
      return [];
    }
  }
  
  async getIdea(ideaId: string): Promise<IdeaPlaygroundIdea | null> {
    try {
      const { data, error } = await supabase
        .from('idea_playground_ideas')
        .select('*')
        .eq('id', ideaId)
        .single();
        
      if (error) {
        console.error('Error fetching idea:', error);
        return null;
      }
      
      return data as IdeaPlaygroundIdea;
    } catch (error) {
      console.error('Error in getIdea:', error);
      return null;
    }
  }
  
  async updateIdea(ideaId: string, updates: Partial<IdeaPlaygroundIdea>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_playground_ideas')
        .update(updates)
        .eq('id', ideaId);
        
      if (error) {
        console.error('Error updating idea:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateIdea:', error);
      return false;
    }
  }
  
  async archiveIdea(ideaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_playground_ideas')
        .update({ is_archived: true })
        .eq('id', ideaId);
        
      if (error) {
        console.error('Error archiving idea:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in archiveIdea:', error);
      return false;
    }
  }
  
  async duplicateIdea(ideaId: string, newTitle?: string): Promise<IdeaPlaygroundIdea | null> {
    try {
      const { data, error } = await supabase.rpc('duplicate_idea_playground_idea', {
        p_idea_id: ideaId,
        p_new_title: newTitle
      });
      
      if (error) {
        console.error('Error duplicating idea:', error);
        return null;
      }
      
      // Get the duplicated idea
      return await this.getIdea(data);
    } catch (error) {
      console.error('Error in duplicateIdea:', error);
      return null;
    }
  }
  
  async moveIdeaToCanvas(ideaId: string, targetCanvasId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('move_idea_to_canvas', {
        p_idea_id: ideaId,
        p_target_canvas_id: targetCanvasId
      });
      
      if (error) {
        console.error('Error moving idea:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in moveIdeaToCanvas:', error);
      return false;
    }
  }
  
  // Component Management
  async createComponent(ideaId: string, componentType: string, content: string): Promise<IdeaPlaygroundComponent | null> {
    try {
      const { data, error } = await supabase
        .from('idea_playground_components')
        .insert({
          idea_id: ideaId,
          component_type: componentType,
          content,
          is_selected: false
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating component:', error);
        return null;
      }
      
      return data as IdeaPlaygroundComponent;
    } catch (error) {
      console.error('Error in createComponent:', error);
      return null;
    }
  }
  
  async getComponentsForIdea(ideaId: string, componentType?: string): Promise<IdeaPlaygroundComponent[]> {
    try {
      let query = supabase
        .from('idea_playground_components')
        .select('*')
        .eq('idea_id', ideaId);
        
      if (componentType) {
        query = query.eq('component_type', componentType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching components:', error);
        return [];
      }
      
      return data as IdeaPlaygroundComponent[];
    } catch (error) {
      console.error('Error in getComponentsForIdea:', error);
      return [];
    }
  }
  
  async updateComponent(componentId: string, updates: Partial<IdeaPlaygroundComponent>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('idea_playground_components')
        .update(updates)
        .eq('id', componentId);
        
      if (error) {
        console.error('Error updating component:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateComponent:', error);
      return false;
    }
  }
  
  // Feedback Management
  async createFeedback(ideaId: string, feedback: Partial<IdeaPlaygroundFeedback>): Promise<IdeaPlaygroundFeedback | null> {
    try {
      const { data, error } = await supabase
        .from('idea_playground_feedback')
        .insert({
          idea_id: ideaId,
          ...feedback
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating feedback:', error);
        return null;
      }
      
      return data as IdeaPlaygroundFeedback;
    } catch (error) {
      console.error('Error in createFeedback:', error);
      return null;
    }
  }
  
  async getFeedbackForIdea(ideaId: string): Promise<IdeaPlaygroundFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('idea_playground_feedback')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching feedback:', error);
        return [];
      }
      
      return data as IdeaPlaygroundFeedback[];
    } catch (error) {
      console.error('Error in getFeedbackForIdea:', error);
      return [];
    }
  }
  
  // Idea Refinement
  async refineIdea(
    userId: string,
    params: IdeaRefinementParams
  ): Promise<IdeaPlaygroundIdea | null> {
    try {
      // Get the original idea
      const originalIdea = await this.getIdea(params.idea_id);
      if (!originalIdea) {
        console.error('Original idea not found');
        return null;
      }
      
      // Get user's company if they have one
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      const companyId = userProfile?.company_id;
      
      // Create context for LLM query
      const context = {
        userId,
        companyId: originalIdea.used_company_context ? companyId : undefined,
        useCompanyModel: originalIdea.used_company_context,
        useAbstraction: true,
        useExistingModels: true,
        context: 'idea_playground'
      };
      
      // Create prompt
      const prompt = this.createIdeaRefinementPrompt(originalIdea, params);
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, context);
      
      // Parse the response
      const content = response.content || '';
      
      console.log('OpenAI response content for refinement:', content);
      
      // Try to extract JSON using multiple patterns
      let extractedJson = '';
      
      // Try to extract JSON from code blocks
      const jsonCodeBlockMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonCodeBlockMatch) {
        extractedJson = jsonCodeBlockMatch[1];
        console.log('Extracted JSON from code block:', extractedJson);
      } 
      // Try to extract JSON object pattern
      else {
        const jsonObjectMatch = content.match(/{[\s\S]*}/);
        if (jsonObjectMatch) {
          extractedJson = jsonObjectMatch[0];
          console.log('Extracted JSON object:', extractedJson);
        }
      }
      
      if (!extractedJson) {
        console.error('Failed to extract JSON from LLM response');
        console.log('Full response content:', content);
        
        // Create a fallback refined idea
        return this.createFallbackRefinedIdea(originalIdea, content);
      }
      
      try {
        // Clean up the extracted JSON to handle common formatting issues
        const cleanedJson = extractedJson
          .replace(/\\"/g, '"')  // Handle escaped quotes
          .replace(/\n/g, ' ')   // Remove newlines
          .replace(/,\s*}/g, '}'); // Remove trailing commas in objects
        
        console.log('Cleaned JSON:', cleanedJson);
        
        const parsedData = JSON.parse(cleanedJson);
        console.log('Parsed data:', parsedData);
        
        // Create a new version of the idea
        const { data, error } = await supabase
          .from('idea_playground_ideas')
          .insert({
            canvas_id: originalIdea.canvas_id,
            title: `${originalIdea.title} (Refined)`,
            description: parsedData.description || originalIdea.description,
            problem_statement: parsedData.problem_statement || originalIdea.problem_statement,
            solution_concept: parsedData.solution_concept || originalIdea.solution_concept,
            target_audience: parsedData.target_audience || originalIdea.target_audience,
            unique_value: parsedData.unique_value || originalIdea.unique_value,
            business_model: parsedData.business_model || originalIdea.business_model,
            marketing_strategy: parsedData.marketing_strategy || originalIdea.marketing_strategy,
            revenue_model: parsedData.revenue_model || originalIdea.revenue_model,
            go_to_market: parsedData.go_to_market || originalIdea.go_to_market,
            market_size: parsedData.market_size || originalIdea.market_size,
            used_company_context: originalIdea.used_company_context,
            company_relevance: originalIdea.company_relevance,
            version: originalIdea.version + 1
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error saving refined idea:', error);
          return null;
        }
        
        const refinedIdea = data as IdeaPlaygroundIdea;
        
        // Copy components from the original idea
        const originalComponents = await this.getComponentsForIdea(originalIdea.id);
        
        for (const component of originalComponents) {
          await this.createComponent(
            refinedIdea.id,
            component.component_type,
            component.content
          );
        }
        
        // Add new components if provided
        if (parsedData.competition && Array.isArray(parsedData.competition)) {
          for (const item of parsedData.competition) {
            await this.createComponent(refinedIdea.id, 'competition', item);
          }
        }
        
        if (parsedData.revenue_streams && Array.isArray(parsedData.revenue_streams)) {
          for (const item of parsedData.revenue_streams) {
            await this.createComponent(refinedIdea.id, 'revenue_streams', item);
          }
        }
        
        if (parsedData.cost_structure && Array.isArray(parsedData.cost_structure)) {
          for (const item of parsedData.cost_structure) {
            await this.createComponent(refinedIdea.id, 'cost_structure', item);
          }
        }
        
        if (parsedData.key_metrics && Array.isArray(parsedData.key_metrics)) {
          for (const item of parsedData.key_metrics) {
            await this.createComponent(refinedIdea.id, 'key_metrics', item);
          }
        }
        
        return refinedIdea;
      } catch (parseError) {
        console.error('Error parsing JSON from refined idea:', parseError);
        return this.createFallbackRefinedIdea(originalIdea, content);
      }
    } catch (error) {
      console.error('Error refining idea:', error);
      return null;
    }
  }
  
  private async createFallbackRefinedIdea(originalIdea: IdeaPlaygroundIdea, content: string): Promise<IdeaPlaygroundIdea | null> {
    try {
      // Extract useful information from the content
      const descriptionMatch = content.match(/description[:\s]+"?([^"\.]+\.)"?/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : originalIdea.description;
      
      const problemMatch = content.match(/problem[:\s]+"?([^"\.]+\.)"?/i);
      const problem = problemMatch ? problemMatch[1].trim() : originalIdea.problem_statement;
      
      const solutionMatch = content.match(/solution[:\s]+"?([^"\.]+\.)"?/i);
      const solution = solutionMatch ? solutionMatch[1].trim() : originalIdea.solution_concept;
      
      // Create a fallback refined idea
      const { data, error } = await supabase
        .from('idea_playground_ideas')
        .insert({
          canvas_id: originalIdea.canvas_id,
          title: `${originalIdea.title} (Refined)`,
          description: description,
          problem_statement: problem,
          solution_concept: solution,
          target_audience: originalIdea.target_audience,
          unique_value: originalIdea.unique_value,
          business_model: originalIdea.business_model,
          marketing_strategy: originalIdea.marketing_strategy,
          revenue_model: originalIdea.revenue_model,
          go_to_market: originalIdea.go_to_market,
          market_size: originalIdea.market_size,
          used_company_context: originalIdea.used_company_context,
          company_relevance: originalIdea.company_relevance,
          version: originalIdea.version + 1
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error saving fallback refined idea:', error);
        return null;
      }
      
      const refinedIdea = data as IdeaPlaygroundIdea;
      
      // Copy components from the original idea
      const originalComponents = await this.getComponentsForIdea(originalIdea.id);
      
      for (const component of originalComponents) {
        await this.createComponent(
          refinedIdea.id,
          component.component_type,
          component.content
        );
      }
      
      return refinedIdea;
    } catch (error) {
      console.error('Error creating fallback refined idea:', error);
      return null;
    }
  }
  
  private createIdeaRefinementPrompt(originalIdea: IdeaPlaygroundIdea, params: IdeaRefinementParams): string {
    // Create a prompt for refining the idea based on the focus areas and other parameters
    let focusAreasText = '';
    if (params.focus_areas.includes('problem')) {
      focusAreasText += '- Problem Statement: Refine the problem statement to be more specific, compelling, and well-defined.\n';
    }
    if (params.focus_areas.includes('solution')) {
      focusAreasText += '- Solution Concept: Enhance the solution concept to be more innovative, feasible, and effective.\n';
    }
    if (params.focus_areas.includes('market')) {
      focusAreasText += '- Market Analysis: Improve the market analysis, including target audience and market size.\n';
    }
    if (params.focus_areas.includes('business_model')) {
      focusAreasText += '- Business Model: Refine the business model, revenue model, and unique value proposition.\n';
    }
    if (params.focus_areas.includes('go_to_market')) {
      focusAreasText += '- Go-to-Market Strategy: Enhance the go-to-market strategy and marketing approach.\n';
    }
    
    let specificQuestionsText = '';
    if (params.specific_questions && params.specific_questions.length > 0) {
      specificQuestionsText = 'Please address these specific questions in your refinement:\n';
      params.specific_questions.forEach((question, index) => {
        specificQuestionsText += `${index + 1}. ${question}\n`;
      });
    }
    
    let improvementDirectionText = '';
    if (params.improvement_direction) {
      improvementDirectionText = `Overall improvement direction: ${params.improvement_direction}\n`;
    }
    
    return `You are an experienced business consultant tasked with refining and improving a business idea. 
Below is the original idea:

Title: ${originalIdea.title}
Description: ${originalIdea.description}
Problem Statement: ${originalIdea.problem_statement}
Solution Concept: ${originalIdea.solution_concept}
Target Audience: ${originalIdea.target_audience}
Unique Value Proposition: ${originalIdea.unique_value}
Business Model: ${originalIdea.business_model}
Marketing Strategy: ${originalIdea.marketing_strategy}
Revenue Model: ${originalIdea.revenue_model}
Go-to-Market Strategy: ${originalIdea.go_to_market}
Market Size: ${originalIdea.market_size}

Please refine this idea by focusing on the following areas:
${focusAreasText}
${specificQuestionsText}
${improvementDirectionText}

Provide a refined version of the idea that addresses these focus areas and questions.
Format your response as a JSON object with the same fields as the original idea, but with your improvements.

\`\`\`json
{
  "title": "Original title (keep this the same)",
  "description": "Refined description",
  "problem_statement": "Refined problem statement",
  "solution_concept": "Refined solution concept",
  "target_audience": "Refined target audience",
  "unique_value": "Refined unique value proposition",
  "business_model": "Refined business model",
  "marketing_strategy": "Refined marketing strategy",
  "revenue_model": "Refined revenue model",
  "go_to_market": "Refined go-to-market strategy",
  "market_size": "Refined market size",
  "competition": ["Competitor 1", "Competitor 2"],
  "revenue_streams": ["Revenue Stream 1", "Revenue Stream 2"],
  "cost_structure": ["Cost 1", "Cost 2"],
  "key_metrics": ["Metric 1", "Metric 2"]
}
\`\`\`

Be specific, practical, and insightful in your refinements. Focus on making the idea more viable, compelling, and well-defined.`;
  }
  
  // Helper methods
  private createIdeaGenerationPrompt(params: IdeaGenerationParams, useCompanyContext: boolean): string {
    const count = params.count || 3;
    
    let contextualInfo = '';
    if (params.industry) contextualInfo += `Industry: ${params.industry}\n`;
    if (params.target_audience) contextualInfo += `Target Audience: ${params.target_audience}\n`;
    if (params.problem_area) contextualInfo += `Problem Area: ${params.problem_area}\n`;
    if (params.technology) contextualInfo += `Technology: ${params.technology}\n`;
    if (params.business_model_preference) contextualInfo += `Business Model Preference: ${params.business_model_preference}\n`;
    if (params.market_size_preference) contextualInfo += `Market Size Preference: ${params.market_size_preference}\n`;
    if (params.innovation_level) contextualInfo += `Innovation Level: ${params.innovation_level}\n`;
    if (params.resource_constraints && params.resource_constraints.length > 0) {
      contextualInfo += `Resource Constraints: ${params.resource_constraints.join(', ')}\n`;
    }
    
    let companyContextPrompt = '';
    if (useCompanyContext) {
      companyContextPrompt = `
You have access to company-specific information through the context provided.
Use this information to generate ideas that are relevant to the company's:
- Existing markets and customers
- Current products and services
- Strategic goals and initiatives
- Core competencies and strengths

Your ideas should leverage the company's existing assets and capabilities while
addressing new opportunities or challenges.
`;
    }
    
    return `You are an experienced startup advisor and idea generator. Generate ${count} innovative business ideas${contextualInfo ? ' based on the following parameters:\n\n' + contextualInfo : '.'} Make sure the ideas are diverse and cover different approaches.
${companyContextPrompt}
Each idea should include:
- A compelling title
- A concise description
- A clear problem statement
- A solution concept
- Target audience
- Unique value proposition
- Business model
- Marketing strategy
- Revenue model
- Go-to-market strategy
- Estimated market size
- Potential competitors
- Possible revenue streams
- Basic cost structure
- Key metrics for success

Format your response as a JSON array of business ideas.

\`\`\`json
[
  {
    "title": "Idea Title",
    "description": "Brief description of the idea",
    "problem_statement": "The problem this solves",
    "solution_concept": "How the solution works",
    "target_audience": "Who the customers are",
    "unique_value": "Why customers would choose this",
    "business_model": "How the business creates and delivers value",
    "marketing_strategy": "How to reach customers",
    "revenue_model": "How the business makes money",
    "go_to_market": "Initial launch strategy",
    "market_size": "Estimated market size",
    "competition": ["Competitor 1", "Competitor 2"],
    "revenue_streams": ["Revenue Stream 1", "Revenue Stream 2"],
    "cost_structure": ["Cost 1", "Cost 2"],
    "key_metrics": ["Metric 1", "Metric 2"]
  }
]
\`\`\`

Be creative, specific, and realistic. Each idea should be viable and distinct.`;
  }
  
  private async generateCompanyRelevance(idea: any, companyId: string): Promise<CompanyRelevance> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user is found, return default relevance
      if (!user || !user.id) {
        console.error('No authenticated user found');
        return {
          existingMarkets: [],
          customerSynergies: [],
          complementaryProducts: [],
          strategicFit: "No user authentication"
        };
      }
      
      // Create context for LLM query
      const context = {
        userId: user.id,
        companyId,
        useCompanyModel: true,
        useAbstraction: false,
        useExistingModels: true,
        context: 'idea_playground'
      };
      
      // Create prompt
      const prompt = `
You have access to company-specific information through the context provided.
Analyze how the following business idea relates to the company's existing business:

Title: ${idea.title}
Description: ${idea.description || 'N/A'}
Problem Statement: ${idea.problem_statement || 'N/A'}
Solution Concept: ${idea.solution_concept || 'N/A'}
Target Audience: ${idea.target_audience || 'N/A'}

Provide a structured analysis of how this idea relates to the company in the following format:

\`\`\`json
{
  "existingMarkets": [
    "Specific existing market 1 that this idea could target",
    "Specific existing market 2 that this idea could target"
  ],
  "customerSynergies": [
    "Specific way this idea could appeal to existing customers 1",
    "Specific way this idea could appeal to existing customers 2"
  ],
  "complementaryProducts": [
    "Specific existing product/service 1 this idea complements",
    "Specific existing product/service 2 this idea complements"
  ],
  "strategicFit": "Overall assessment of how this idea fits with company strategy"
}
\`\`\`

Be specific and reference actual company information from the context provided.
`;
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, context);
      
      // Parse the response
      const content = response.content || '';
      
      // Try to extract JSON
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (parseError) {
          console.error('Error parsing JSON from company relevance:', parseError);
        }
      }
      
      return {
        existingMarkets: [],
        customerSynergies: [],
        complementaryProducts: [],
        strategicFit: "Could not determine strategic fit"
      };
    } catch (error) {
      console.error('Error generating company relevance:', error);
      return {
        existingMarkets: [],
        customerSynergies: [],
        complementaryProducts: [],
        strategicFit: "Error generating company relevance"
      };
    }
  }
}

// Export either the real or mock service based on the flag
export const ideaPlaygroundService = USE_MOCK_SERVICES ? mockIdeaPlaygroundService : new IdeaPlaygroundService();
