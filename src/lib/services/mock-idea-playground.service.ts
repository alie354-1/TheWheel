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
import { generalLLMService } from './general-llm.service';

export class MockIdeaPlaygroundService {
  // Mock data for ideas

  

  private mockCanvases: Map<string, IdeaPlaygroundCanvas> = new Map();
  private mockIdeas: Map<string, IdeaPlaygroundIdea[]> = new Map();
  private mockComponents: Map<string, IdeaPlaygroundComponent[]> = new Map();
  private mockFeedback: Map<string, IdeaPlaygroundFeedback[]> = new Map();
  private idCounter = 1;

  constructor() {
    // Initialize with an empty canvas for testing
    const canvasId = `canvas-${this.idCounter++}`;
    const mockCanvas: IdeaPlaygroundCanvas = {
      id: canvasId,
      user_id: 'mock-user-id',
      company_id: 'mock-company-id',
      name: 'Test Canvas',
      description: 'A test canvas for idea generation',
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockCanvases.set(canvasId, mockCanvas);
    this.mockIdeas.set(canvasId, []);
  }

  // Canvas Management
  async createCanvas(userId: string, name: string, description?: string, companyId?: string): Promise<IdeaPlaygroundCanvas | null> {
    try {
      const canvasId = `canvas-${this.idCounter++}`;
      const newCanvas: IdeaPlaygroundCanvas = {
        id: canvasId,
        user_id: userId,
        company_id: companyId,
        name,
        description,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      this.mockCanvases.set(canvasId, newCanvas);
      this.mockIdeas.set(canvasId, []);
      
      return newCanvas;
    } catch (error) {
      console.error('Error in createCanvas:', error);
      return null;
    }
  }
  
  getCanvases = async (userId: string, includeArchived: boolean = false): Promise<any[]> => {
    console.log('Mock getCanvases called with userId:', userId);
    // Convert Map values to array
    return Promise.resolve(Array.from(this.mockCanvases.values()));
  }
 
  
  updateCanvas = async (canvasId: string, updates: Partial<IdeaPlaygroundCanvas>): Promise<boolean> => {
    console.log('Mock updateCanvas called with canvasId:', canvasId);
    return Promise.resolve(true);
  }
  
  archiveCanvas = async (canvasId: string): Promise<boolean> => {
    console.log('Mock archiveCanvas called with canvasId:', canvasId);
    return Promise.resolve(true);
  }
 
  
  // Idea Generation and Management
  async generateIdeas(
    userId: string,
    canvasId: string,
    params: IdeaGenerationParams
  ): Promise<IdeaPlaygroundIdea[]> {
    console.log('MockIdeaPlaygroundService.generateIdeas called with:', { userId, canvasId, params });
    try {
      // Create context for LLM query
      const context = {
        userId,
        companyId: 'mock-company-id',
        useCompanyModel: params.useCompanyContext,
        useAbstraction: true,
        useExistingModels: true,
        context: 'idea_playground'
      };
      
      // Create prompt
      const prompt = this.createIdeaGenerationPrompt(params, params.useCompanyContext || false);
      
      // Query the LLM
      const response = await generalLLMService.query(prompt, context);
      
      // Parse the response
      const content = response.content || '';
      
      console.log('OpenAI response content:', content);
      
      // Try to extract JSON using multiple patterns
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
        console.log('Parsed data:', parsedData);
        
        // Ensure the response is an array
        const ideasArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        
        // Generate company relevance if using company context
        const savedIdeas: IdeaPlaygroundIdea[] = [];
        
        for (const ideaData of ideasArray) {
          // Generate company relevance if using company context
          let companyRelevance: CompanyRelevance | undefined;
          if (params.useCompanyContext) {
            companyRelevance = await this.generateCompanyRelevance(ideaData);
          }
          
          // Create a new idea
          const ideaId = `idea-${this.idCounter++}`;
          const newIdea: IdeaPlaygroundIdea = {
            id: ideaId,
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
            used_company_context: params.useCompanyContext || false,
            company_relevance: params.useCompanyContext ? companyRelevance : undefined,
            is_archived: false,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
        // Save the idea
        const canvasIdeas = this.mockIdeas.get(canvasId) || [];
        canvasIdeas.unshift(newIdea);
        this.mockIdeas.set(canvasId, canvasIdeas);
        
        console.log('Added new idea to canvas:', newIdea);
        console.log('Updated canvas ideas:', canvasIdeas);
        console.log('All canvas ideas:', this.mockIdeas);
        
        savedIdeas.push(newIdea);
          
          // Save components if provided
          const components: IdeaPlaygroundComponent[] = [];
          
          if (ideaData.competition && Array.isArray(ideaData.competition)) {
            for (const item of ideaData.competition) {
              const component = await this.createComponent(ideaId, 'competition', item);
              if (component) {
                components.push(component);
              }
            }
          }
          
          if (ideaData.revenue_streams && Array.isArray(ideaData.revenue_streams)) {
            for (const item of ideaData.revenue_streams) {
              const component = await this.createComponent(ideaId, 'revenue_streams', item);
              if (component) {
                components.push(component);
              }
            }
          }
          
          if (ideaData.cost_structure && Array.isArray(ideaData.cost_structure)) {
            for (const item of ideaData.cost_structure) {
              const component = await this.createComponent(ideaId, 'cost_structure', item);
              if (component) {
                components.push(component);
              }
            }
          }
          
          if (ideaData.key_metrics && Array.isArray(ideaData.key_metrics)) {
            for (const item of ideaData.key_metrics) {
              const component = await this.createComponent(ideaId, 'key_metrics', item);
              if (component) {
                components.push(component);
              }
            }
          }
          
          this.mockComponents.set(ideaId, components);
        }
        
        return savedIdeas;
      } catch (parseError) {
        console.error('Error parsing JSON from ideas:', parseError);
        return this.createFallbackIdeas('Error parsing JSON from ideas', canvasId);
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
      const ideaId = `idea-${this.idCounter++}`;
      const fallbackIdea: IdeaPlaygroundIdea = {
        id: ideaId,
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
        is_archived: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save the idea
      const canvasIdeas = this.mockIdeas.get(canvasId) || [];
      canvasIdeas.unshift(fallbackIdea);
      this.mockIdeas.set(canvasId, canvasIdeas);
      
      // Log the fallback idea
      console.log('Created fallback idea:', fallbackIdea);
      
      return [fallbackIdea];
    } catch (error) {
      console.error('Error creating fallback idea:', error);
      
      // Return a very basic fallback idea if everything else fails
      const ideaId = `idea-${this.idCounter++}`;
      const fallbackIdea: IdeaPlaygroundIdea = {
        id: ideaId,
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
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save the idea
      const canvasIdeas = this.mockIdeas.get(canvasId) || [];
      canvasIdeas.unshift(fallbackIdea);
      this.mockIdeas.set(canvasId, canvasIdeas);
      
      return [fallbackIdea];
    }
  }
  
  getIdeasForCanvas = async (canvasId: string, includeArchived: boolean = false): Promise<any[]> => {
    console.log('Mock getIdeasForCanvas called with canvasId:', canvasId);
    const ideas = this.mockIdeas.get(canvasId) || [];
    return Promise.resolve(ideas);
  }
  
  getIdea = async (ideaId: string): Promise<IdeaPlaygroundIdea | null> => {
    console.log('Mock getIdea called with ideaId:', ideaId);
    // Search through all canvases for the idea
    for (const ideas of this.mockIdeas.values()) {
      const idea = ideas.find(idea => idea.id === ideaId);
      if (idea) {
        return Promise.resolve(idea);
      }
    }
    return Promise.resolve(null);
  }
  
  updateIdea = async (ideaId: string, updates: Partial<IdeaPlaygroundIdea>): Promise<boolean> => {
    console.log('Mock updateIdea called with ideaId:', ideaId, 'and updates:', updates);
    // Search through all canvases for the idea
    for (const ideas of this.mockIdeas.values()) {
      const ideaIndex = ideas.findIndex(idea => idea.id === ideaId);
      if (ideaIndex !== -1) {
        // Update the idea
        ideas[ideaIndex] = { ...ideas[ideaIndex], ...updates };
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
  
  archiveIdea = async (ideaId: string): Promise<boolean> => {
    console.log('Mock archiveIdea called with ideaId:', ideaId);
    // Search through all canvases for the idea
    for (const ideas of this.mockIdeas.values()) {
      const ideaIndex = ideas.findIndex(idea => idea.id === ideaId);
      if (ideaIndex !== -1) {
        // Mark the idea as archived
        ideas[ideaIndex].is_archived = true;
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
  
  async createComponent(ideaId: string, componentType: string, content: string): Promise<IdeaPlaygroundComponent | null> {
    try {
      const componentId = `component-${this.idCounter++}`;
      const newComponent: IdeaPlaygroundComponent = {
        id: componentId,
        idea_id: ideaId,
        component_type: componentType,
        content,
        is_selected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to components map
      const components = this.mockComponents.get(ideaId) || [];
      components.push(newComponent);
      this.mockComponents.set(ideaId, components);
      
      return newComponent;
    } catch (error) {
      console.error('Error creating component:', error);
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
  
  private async generateCompanyRelevance(idea: any): Promise<CompanyRelevance> {
    // Create a mock company relevance
    return {
      existingMarkets: [
        "Small business software market",
        "Productivity tools market"
      ],
      customerSynergies: [
        "Existing customers would benefit from streamlined workflows",
        "Complements current product offerings"
      ],
      complementaryProducts: [
        "Project management software",
        "Team collaboration tools"
      ],
      strategicFit: "This idea aligns well with the company's focus on productivity enhancement and workflow optimization."
    };
  }
}

export const mockIdeaPlaygroundService = new MockIdeaPlaygroundService();
