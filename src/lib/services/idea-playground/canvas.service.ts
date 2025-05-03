/**
 * Canvas service for business model and value proposition canvases
 * 
 * This service manages the creation, update, and retrieval of different 
 * canvas types used for business idea modeling and visualization.
 */

import { supabase } from '../../supabase';
import { IdeaPlaygroundIdea } from '../../types/idea-playground.types';
import { LLMOrchestrator } from './llm/orchestrator';

/**
 * Base canvas interface with common properties
 */
export interface BaseCanvas {
  id: string;
  ideaId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  type: string;
}

/**
 * Business Model Canvas sections
 */
export interface BusinessModelCanvas extends BaseCanvas {
  type: 'business-model';
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

/**
 * Value Proposition Canvas sections
 */
export interface ValuePropositionCanvas extends BaseCanvas {
  type: 'value-proposition';
  customerJobs: string[];
  customerPains: string[];
  customerGains: string[];
  products: string[];
  painRelievers: string[];
  gainCreators: string[];
}

/**
 * Create parameters for a new Business Model Canvas
 */
export interface CreateBusinessModelCanvasParams {
  ideaId: string;
  name?: string;
  initialData?: Partial<BusinessModelCanvas>;
  userId: string;
}

/**
 * Create parameters for a new Value Proposition Canvas
 */
export interface CreateValuePropositionCanvasParams {
  ideaId: string;
  name?: string;
  initialData?: Partial<ValuePropositionCanvas>;
  userId: string;
}

/**
 * Update parameters for a canvas
 */
export interface UpdateCanvasParams {
  canvasId: string;
  data: Partial<BusinessModelCanvas> | Partial<ValuePropositionCanvas>;
  userId: string;
}

/**
 * Service for creating and managing different canvas types
 */
export class CanvasService {
  private orchestrator: LLMOrchestrator;
  
  constructor(orchestrator: LLMOrchestrator) {
    this.orchestrator = orchestrator;
  }
  
  /**
   * Create a new Business Model Canvas for an idea
   */
  async createBusinessModelCanvas(params: CreateBusinessModelCanvasParams): Promise<BusinessModelCanvas> {
    try {
      const now = new Date().toISOString();
      const canvasId = `bmc_${Math.random().toString(36).substring(2, 11)}`;
      
      // Create default canvas with empty sections
      const canvas: BusinessModelCanvas = {
        id: canvasId,
        ideaId: params.ideaId,
        name: params.name || 'Business Model Canvas',
        type: 'business-model',
        createdAt: now,
        updatedAt: now,
        keyPartners: [],
        keyActivities: [],
        keyResources: [],
        valuePropositions: [],
        customerRelationships: [],
        channels: [],
        customerSegments: [],
        costStructure: [],
        revenueStreams: [],
        ...params.initialData
      };
      
      // Save to database
      const { error } = await supabase
        .from('canvases')
        .insert([{
          id: canvas.id,
          idea_id: canvas.ideaId,
          name: canvas.name,
          type: canvas.type,
          data: JSON.stringify(canvas),
          created_at: canvas.createdAt,
          updated_at: canvas.updatedAt,
          user_id: params.userId
        }]);
        
      if (error) throw error;
      
      return canvas;
    } catch (error) {
      console.error('Error creating business model canvas:', error);
      throw new Error('Failed to create business model canvas');
    }
  }
  
  /**
   * Create a new Value Proposition Canvas for an idea
   */
  async createValuePropositionCanvas(params: CreateValuePropositionCanvasParams): Promise<ValuePropositionCanvas> {
    try {
      const now = new Date().toISOString();
      const canvasId = `vpc_${Math.random().toString(36).substring(2, 11)}`;
      
      // Create default canvas with empty sections
      const canvas: ValuePropositionCanvas = {
        id: canvasId,
        ideaId: params.ideaId,
        name: params.name || 'Value Proposition Canvas',
        type: 'value-proposition',
        createdAt: now,
        updatedAt: now,
        customerJobs: [],
        customerPains: [],
        customerGains: [],
        products: [],
        painRelievers: [],
        gainCreators: [],
        ...params.initialData
      };
      
      // Save to database
      const { error } = await supabase
        .from('canvases')
        .insert([{
          id: canvas.id,
          idea_id: canvas.ideaId,
          name: canvas.name,
          type: canvas.type,
          data: JSON.stringify(canvas),
          created_at: canvas.createdAt,
          updated_at: canvas.updatedAt,
          user_id: params.userId
        }]);
        
      if (error) throw error;
      
      return canvas;
    } catch (error) {
      console.error('Error creating value proposition canvas:', error);
      throw new Error('Failed to create value proposition canvas');
    }
  }
  
  /**
   * Get a canvas by its ID
   */
  async getCanvas(canvasId: string): Promise<BusinessModelCanvas | ValuePropositionCanvas> {
    try {
      const { data, error } = await supabase
        .from('canvases')
        .select('data')
        .eq('id', canvasId)
        .single();
        
      if (error) throw error;
      
      return JSON.parse(data.data);
    } catch (error) {
      console.error(`Error fetching canvas with ID ${canvasId}:`, error);
      throw new Error(`Canvas not found with ID: ${canvasId}`);
    }
  }
  
  /**
   * Get all canvases for an idea
   */
  async getCanvasesForIdea(ideaId: string): Promise<(BusinessModelCanvas | ValuePropositionCanvas)[]> {
    try {
      const { data, error } = await supabase
        .from('canvases')
        .select('data')
        .eq('idea_id', ideaId);
        
      if (error) throw error;
      
      return data.map(item => JSON.parse(item.data));
    } catch (error) {
      console.error(`Error fetching canvases for idea ${ideaId}:`, error);
      return [];
    }
  }
  
  /**
   * Update an existing canvas
   */
  async updateCanvas(params: UpdateCanvasParams): Promise<BusinessModelCanvas | ValuePropositionCanvas> {
    try {
      // Get the current canvas
      const currentCanvas = await this.getCanvas(params.canvasId);
      
      // Update with new data and ensure type safety
      if (currentCanvas.type === 'business-model') {
        // Business Model Canvas
        const updatedCanvas: BusinessModelCanvas = {
          ...(currentCanvas as BusinessModelCanvas),
          ...params.data as Partial<BusinessModelCanvas>,
          updatedAt: new Date().toISOString(),
          type: 'business-model'
        };
        
        // Save to database
        const { error } = await supabase
          .from('canvases')
          .update({
            data: JSON.stringify(updatedCanvas),
            updated_at: updatedCanvas.updatedAt
          })
          .eq('id', params.canvasId)
          .eq('user_id', params.userId); // Ensure user owns the canvas
          
        if (error) throw error;
        
        return updatedCanvas;
      } else if (currentCanvas.type === 'value-proposition') {
        // Value Proposition Canvas
        const updatedCanvas: ValuePropositionCanvas = {
          ...(currentCanvas as ValuePropositionCanvas),
          ...params.data as Partial<ValuePropositionCanvas>,
          updatedAt: new Date().toISOString(),
          type: 'value-proposition'
        };
        
        // Save to database
        const { error } = await supabase
          .from('canvases')
          .update({
            data: JSON.stringify(updatedCanvas),
            updated_at: updatedCanvas.updatedAt
          })
          .eq('id', params.canvasId)
          .eq('user_id', params.userId); // Ensure user owns the canvas
          
        if (error) throw error;
        
        return updatedCanvas;
      } else {
        throw new Error(`Unknown canvas type: ${(currentCanvas as any).type}`);
      }
    } catch (error) {
      console.error(`Error updating canvas with ID ${params.canvasId}:`, error);
      throw new Error(`Failed to update canvas with ID: ${params.canvasId}`);
    }
  }
  
  /**
   * Delete a canvas
   */
  async deleteCanvas(canvasId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('canvases')
        .delete()
        .eq('id', canvasId)
        .eq('user_id', userId); // Ensure user owns the canvas
        
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting canvas with ID ${canvasId}:`, error);
      throw new Error(`Failed to delete canvas with ID: ${canvasId}`);
    }
  }
  
  /**
   * Auto-generate a Business Model Canvas from an idea using AI
   */
  async generateBusinessModelCanvas(idea: IdeaPlaygroundIdea, userId: string): Promise<BusinessModelCanvas> {
    try {
      // Prompt for generating BMC content
      const prompt = `
        Generate a Business Model Canvas for the following business idea:
        
        IDEA:
        Title: ${idea.title}
        Description: ${idea.description}
        Problem Statement: ${idea.problem_statement}
        Solution Concept: ${idea.solution_concept}
        Target Audience: ${typeof idea.target_audience === 'string' ? idea.target_audience : idea.target_audience.join(', ')}
        Unique Value: ${idea.unique_value}
        
        Format the response as JSON with these sections (each should be an array of string bullet points):
        - keyPartners: Key partners and suppliers
        - keyActivities: Activities required to deliver the value proposition
        - keyResources: Resources needed to deliver the value proposition
        - valuePropositions: Value delivered to customers
        - customerRelationships: Types of relationships with customers
        - channels: How value propositions are delivered
        - customerSegments: Target customer groups
        - costStructure: Major cost drivers
        - revenueStreams: How the business generates revenue
      `;
      
      // Generate canvas content via LLM
      const canvasJson = await this.orchestrator.complete(prompt);
      
      let canvasData: Partial<BusinessModelCanvas>;
      try {
        canvasData = JSON.parse(canvasJson);
      } catch (error) {
        console.error('Error parsing canvas JSON:', error);
        canvasData = this.generateDefaultBMC(idea);
      }
      
      // Create the canvas with generated content
      return this.createBusinessModelCanvas({
        ideaId: idea.id,
        name: `${idea.title} - Business Model Canvas`,
        initialData: canvasData,
        userId
      });
    } catch (error) {
      console.error('Error generating business model canvas:', error);
      throw error;
    }
  }
  
  /**
   * Auto-generate a Value Proposition Canvas from an idea using AI
   */
  async generateValuePropositionCanvas(idea: IdeaPlaygroundIdea, userId: string): Promise<ValuePropositionCanvas> {
    try {
      // Prompt for generating VPC content
      const prompt = `
        Generate a Value Proposition Canvas for the following business idea:
        
        IDEA:
        Title: ${idea.title}
        Description: ${idea.description}
        Problem Statement: ${idea.problem_statement}
        Solution Concept: ${idea.solution_concept}
        Target Audience: ${typeof idea.target_audience === 'string' ? idea.target_audience : idea.target_audience.join(', ')}
        Unique Value: ${idea.unique_value}
        
        Format the response as JSON with these sections (each should be an array of string bullet points):
        - customerJobs: Tasks customers are trying to accomplish
        - customerPains: Negative emotions, risks, and obstacles related to jobs
        - customerGains: Benefits customers expect, desire, or would be surprised by
        - products: Products and services offered
        - painRelievers: How products alleviate specific customer pains
        - gainCreators: How products create customer gains
      `;
      
      // Generate canvas content via LLM
      const canvasJson = await this.orchestrator.complete(prompt);
      
      let canvasData: Partial<ValuePropositionCanvas>;
      try {
        canvasData = JSON.parse(canvasJson);
      } catch (error) {
        console.error('Error parsing canvas JSON:', error);
        canvasData = this.generateDefaultVPC(idea);
      }
      
      // Create the canvas with generated content
      return this.createValuePropositionCanvas({
        ideaId: idea.id,
        name: `${idea.title} - Value Proposition Canvas`,
        initialData: canvasData,
        userId
      });
    } catch (error) {
      console.error('Error generating value proposition canvas:', error);
      throw error;
    }
  }
  
  /**
   * Generate default Business Model Canvas for fallback
   */
  private generateDefaultBMC(idea: IdeaPlaygroundIdea): Partial<BusinessModelCanvas> {
    return {
      keyPartners: ['Key technology providers', 'Industry partners'],
      keyActivities: ['Product development', 'Marketing', 'Customer support'],
      keyResources: ['Technology platform', 'Human capital', 'Intellectual property'],
      valuePropositions: [idea.unique_value || 'Unique solution for customers'],
      customerRelationships: ['Self-service', 'Automated services', 'Personal assistance'],
      channels: ['Web platform', 'Mobile app', 'Direct sales'],
      customerSegments: Array.isArray(idea.target_audience) ? idea.target_audience : [idea.target_audience || 'Target customers'],
      costStructure: ['Development costs', 'Marketing expenses', 'Operations'],
      revenueStreams: ['Subscription fees', 'Usage fees', 'Licensing']
    };
  }
  
  /**
   * Generate default Value Proposition Canvas for fallback
   */
  private generateDefaultVPC(idea: IdeaPlaygroundIdea): Partial<ValuePropositionCanvas> {
    return {
      customerJobs: ['Complete core tasks', 'Solve specific problems'],
      customerPains: ['Inefficiency', 'High costs', 'Complexity'],
      customerGains: ['Time savings', 'Cost reduction', 'Improved results'],
      products: [idea.title || 'Product/service offering'],
      painRelievers: [idea.problem_statement ? `Solves: ${idea.problem_statement}` : 'Addresses key pain points'],
      gainCreators: [idea.unique_value || 'Creates value for customers']
    };
  }
}
