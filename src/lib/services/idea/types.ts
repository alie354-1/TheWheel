/**
 * Idea Service Types
 * 
 * This file contains all the types and interfaces related to the idea generation
 * and management services.
 */

/**
 * Options for idea generation
 */
export interface IdeaGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  numberOfIdeas?: number;
  domains?: string[];
  industry?: string;
  companyType?: string;
}

/**
 * Idea object structure
 */
export interface Idea {
  id?: string;
  title: string;
  description: string;
  companyId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
  score?: number;
  feedback?: IdeaFeedback[];
  aiGenerated?: boolean;
}

/**
 * Idea feedback structure
 */
export interface IdeaFeedback {
  id?: string;
  ideaId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

/**
 * Idea service interface
 * 
 * This interface combines functionality from both idea-generation.service.ts
 * and idea-playground/idea-generation.service.ts
 */
export interface IdeaService {
  /**
   * Generates ideas based on the provided prompt and options
   */
  generateIdeas(prompt: string, options?: IdeaGenerationOptions): Promise<string[]>;
  
  /**
   * Generates idea titles based on industry or domain
   */
  generateIdeaTitles(industry: string, count?: number): Promise<string[]>;
  
  /**
   * Evaluates an idea and provides feedback
   */
  evaluateIdea(idea: Idea): Promise<{score: number; feedback: string}>;
  
  /**
   * Generates variations of an existing idea
   */
  generateVariations(idea: Idea, count?: number): Promise<string[]>;
  
  /**
   * Saves an idea to the database
   */
  saveIdea(idea: Idea): Promise<Idea>;
  
  /**
   * Gets ideas for a company
   */
  getIdeas(companyId: string): Promise<Idea[]>;
  
  /**
   * Gets a specific idea by ID
   */
  getIdeaById(ideaId: string): Promise<Idea | null>;
  
  /**
   * Updates an existing idea
   */
  updateIdea(ideaId: string, updates: Partial<Idea>): Promise<Idea>;
  
  /**
   * Deletes an idea
   */
  deleteIdea(ideaId: string): Promise<void>;
  
  /**
   * Adds feedback to an idea
   */
  addFeedback(ideaId: string, feedback: Omit<IdeaFeedback, 'ideaId'>): Promise<IdeaFeedback>;
}