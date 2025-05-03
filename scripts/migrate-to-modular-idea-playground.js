#!/usr/bin/env node
/**
 * Migration script to convert the Idea Playground to the new modular architecture
 * 
 * This script:
 * 1. Creates the necessary directory structure
 * 2. Sets up modular services
 * 3. Configures feature flags
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Base paths
const SRC_PATH = path.join(__dirname, '../src');
const LIB_PATH = path.join(SRC_PATH, 'lib');
const COMPONENTS_PATH = path.join(SRC_PATH, 'components');
const IDEA_PLAYGROUND_PATH = path.join(COMPONENTS_PATH, 'idea-playground');
const SERVICES_PATH = path.join(LIB_PATH, 'services');
const IDEA_PLAYGROUND_SERVICES_PATH = path.join(SERVICES_PATH, 'idea-playground');
const LLM_PATH = path.join(IDEA_PLAYGROUND_SERVICES_PATH, 'llm');
const AI_PATH = path.join(IDEA_PLAYGROUND_SERVICES_PATH, 'ai');
const CONTEXTS_PATH = path.join(LIB_PATH, 'contexts');
const PAGES_PATH = path.join(SRC_PATH, 'pages');

// Helper functions
function mkdirIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
}

function copyFile(source, destination) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`Copied file: ${source} → ${destination}`);
  } else {
    console.warn(`Warning: Source file not found: ${source}`);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running command: ${command}`);
        console.error(stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

// Main migration function
async function migrateToModularArchitecture() {
  console.log('Starting migration to modular Idea Playground architecture...');
  
  try {
    // 1. Create directory structure
    console.log('\nCreating directory structure...');
    mkdirIfNotExists(IDEA_PLAYGROUND_PATH);
    mkdirIfNotExists(path.join(IDEA_PLAYGROUND_PATH, 'pathway'));
    mkdirIfNotExists(path.join(IDEA_PLAYGROUND_PATH, 'pathway1'));
    mkdirIfNotExists(IDEA_PLAYGROUND_SERVICES_PATH);
    mkdirIfNotExists(LLM_PATH);
    mkdirIfNotExists(path.join(LLM_PATH, 'adapters'));
    mkdirIfNotExists(path.join(LLM_PATH, 'context'));
    mkdirIfNotExists(AI_PATH);
    mkdirIfNotExists(path.join(IDEA_PLAYGROUND_SERVICES_PATH, 'utils'));
    mkdirIfNotExists(path.join(PAGES_PATH, 'idea-playground'));
    
    // 2. Create core service files (architecture)
    console.log('\nCreating core service files...');
    
    // 3. Service Index
    writeFile(
      path.join(IDEA_PLAYGROUND_SERVICES_PATH, 'index.ts'),
      `/**
 * Index file for all idea playground services
 * This serves as a central export for all services
 */

// Main service facade
export { IdeaPlaygroundServiceFacade } from '../idea-playground.service.facade';

// Core domain services
export { CanvasService } from './canvas.service';
export { IdeaManagementService } from './idea-management.service';
export { RefinementService } from './refinement.service';
export { FeedbackService } from './feedback.service';
export { IdeaGenerationService } from './idea-generation.service';

// LLM services
export { LLMOrchestrator } from './llm/orchestrator';
export { OpenAIAdapter } from './llm/adapters/openai.adapter';
export { BaseContextProvider } from './llm/context/base-context.provider';
`
    );
    
    // 4. Create type definitions file
    writeFile(
      path.join(LIB_PATH, 'types/idea-playground.types.ts'),
      `/**
 * Type definitions for the Idea Playground
 */

export enum ProtectionLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CONFIDENTIAL = 'confidential'
}

export enum CanvasType {
  STANDARD = 'standard',
  BUSINESS_MODEL = 'business-model',
  PROBLEM_SOLUTION = 'problem-solution',
  CUSTOMER_JOURNEY = 'customer-journey',
  VALUE_PROPOSITION = 'value-proposition'
}

export interface IdeaPlaygroundIdea {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  solution_concept: string;
  target_audience: string[];
  unique_value: string;
  business_model: string;
  canvas_data?: Record<string, any>;
  canvas_type?: CanvasType;
  user_id: string;
  created_at: string;
  updated_at: string;
  parent_idea_id?: string;
  refinement_feedback?: string;
  protection_level: ProtectionLevel | string;
}

export interface IdeaVariation {
  id: string;
  ideaId: string;
  title: string;
  description: string;
  targetAudience: string[];
  problemStatement: string;
  solutionConcept: string;
  uniqueValue: string;
  createdAt: string;
}

export interface IdeaRefinementFeedback {
  id: string;
  ideaId: string;
  userId: string;
  feedback: string;
  createdAt: string;
  resultingIdeaId?: string;
}

export interface IdeaMergeResult {
  id: string;
  title: string;
  description: string;
  sourceIdeaIds: string[];
  userId: string;
  createdAt: string;
}
`
    );
    
    // 5. Create service facade
    writeFile(
      path.join(SERVICES_PATH, 'idea-playground.service.facade.ts'),
      `/**
 * Facade service that provides a unified API for the Idea Playground
 */
import { supabase } from '../supabase';
import { IdeaPlaygroundIdea, ProtectionLevel } from '../types/idea-playground.types';
import { LLMOrchestrator } from './idea-playground/llm/orchestrator';
import { IdeaGenerationService } from './idea-playground/idea-generation.service';
import { IdeaManagementService } from './idea-playground/idea-management.service';
import { RefinementService } from './idea-playground/refinement.service';
import { CanvasService } from './idea-playground/canvas.service';
import { featureFlags, FeatureFlag } from './feature-flags.service';

/**
 * This facade provides a simplified interface to all the Idea Playground services.
 * It coordinates between different services and handles feature flag checking.
 */
export class IdeaPlaygroundServiceFacade {
  private orchestrator: LLMOrchestrator;
  private ideaGenerationService: IdeaGenerationService;
  private ideaManagementService: IdeaManagementService;
  private refinementService: RefinementService;
  private canvasService: CanvasService;
  
  constructor() {
    this.orchestrator = new LLMOrchestrator();
    this.ideaGenerationService = new IdeaGenerationService(this.orchestrator);
    this.ideaManagementService = new IdeaManagementService();
    this.refinementService = new RefinementService(this.orchestrator);
    this.canvasService = new CanvasService();
  }
  
  /**
   * Generate a new idea
   */
  async generateIdea(prompt: string, userId: string): Promise<IdeaPlaygroundIdea> {
    this.checkFeatureFlag(FeatureFlag.IDEA_PLAYGROUND);
    return this.ideaGenerationService.generateIdea(prompt, userId);
  }
  
  /**
   * Get ideas for a user
   */
  async getIdeas(userId: string): Promise<IdeaPlaygroundIdea[]> {
    return this.ideaManagementService.getIdeasForUser(userId);
  }
  
  /**
   * Get a single idea by ID
   */
  async getIdea(ideaId: string): Promise<IdeaPlaygroundIdea> {
    return this.ideaManagementService.getIdea(ideaId);
  }
  
  /**
   * Save a new or update an existing idea
   */
  async saveIdea(idea: Partial<IdeaPlaygroundIdea>): Promise<IdeaPlaygroundIdea> {
    if (!idea.id) {
      // New idea
      return this.ideaManagementService.createIdea(idea);
    } else {
      // Update existing
      return this.ideaManagementService.updateIdea(idea as IdeaPlaygroundIdea);
    }
  }
  
  /**
   * Update an existing idea
   */
  async updateIdea(idea: IdeaPlaygroundIdea): Promise<IdeaPlaygroundIdea> {
    return this.ideaManagementService.updateIdea(idea);
  }
  
  /**
   * Delete an idea
   */
  async deleteIdea(ideaId: string): Promise<void> {
    return this.ideaManagementService.deleteIdea(ideaId);
  }
  
  /**
   * Refine an idea based on feedback
   */
  async refineIdea(
    idea: IdeaPlaygroundIdea, 
    feedback: string,
    userId: string
  ): Promise<IdeaPlaygroundIdea> {
    this.checkFeatureFlag(FeatureFlag.AI_REFINEMENT);
    return this.refinementService.refineIdea(idea, feedback, userId);
  }
  
  /**
   * Update canvas data for an idea
   */
  async updateCanvas(
    ideaId: string,
    canvasData: Record<string, any>,
    canvasType: string
  ): Promise<IdeaPlaygroundIdea> {
    return this.canvasService.updateCanvas(ideaId, canvasData, canvasType);
  }
  
  /**
   * Set the protection level for an idea
   */
  async setIdeaProtectionLevel(
    ideaId: string, 
    level: ProtectionLevel | string,
    userId: string
  ): Promise<void> {
    this.checkFeatureFlag(FeatureFlag.IP_PROTECTION);
    return this.ideaManagementService.setProtectionLevel(ideaId, level, userId);
  }
  
  /**
   * Check if a feature flag is enabled, throw error if not
   */
  private checkFeatureFlag(flag: FeatureFlag): void {
    if (!featureFlags.isEnabled(flag)) {
      throw new Error(\`Feature is not enabled: \${flag}\`);
    }
  }
}
`
    );
    
    // 6. Create feature flags definition
    writeFile(
      path.join(SERVICES_PATH, 'feature-flags.service.ts'),
      `import { supabase } from '../supabase';

/**
 * Feature flags for the application
 */
export enum FeatureFlag {
  IDEA_PLAYGROUND = 'idea_playground',
  IP_PROTECTION = 'ip_protection',
  AI_REFINEMENT = 'ai_refinement',
  HUGGING_FACE_INTEGRATION = 'hugging_face_integration',
  CONTINUOUS_LEARNING = 'continuous_learning'
}

/**
 * Service for managing feature flags
 */
export class FeatureFlagsService {
  private flags: Record<string, boolean> = {};
  private userId: string | null = null;
  private loaded = false;
  
  /**
   * Set the user ID for user-specific flags
   */
  setUserId(userId: string | null) {
    this.userId = userId;
    this.loaded = false;
  }
  
  /**
   * Load all feature flags from the database
   */
  async loadFlags(): Promise<void> {
    try {
      // Get global flags
      const { data: globalFlags } = await supabase
        .from('feature_flags')
        .select('feature, enabled, user_percentage')
        .is('user_id', null);
      
      // Get user-specific flags
      const { data: userFlags } = await supabase
        .from('feature_flags')
        .select('feature, enabled')
        .eq('user_id', this.userId || '');
      
      // Set defaults
      this.flags = Object.values(FeatureFlag).reduce((acc, flag) => {
        acc[flag] = false;
        return acc;
      }, {} as Record<string, boolean>);
      
      // Apply global flags
      if (globalFlags) {
        for (const flag of globalFlags) {
          // If percentage rollout, check if user is in the percentage
          if (flag.user_percentage !== null && flag.user_percentage < 100) {
            // Generate a consistent hash for user+feature
            const hash = this.hashCode(\`\${this.userId}-\${flag.feature}\`);
            const normalized = (hash % 100 + 100) % 100; // Ensure 0-99 range
            
            this.flags[flag.feature] = flag.enabled && normalized < flag.user_percentage;
          } else {
            this.flags[flag.feature] = flag.enabled;
          }
        }
      }
      
      // Apply user-specific flags (override global)
      if (userFlags) {
        for (const flag of userFlags) {
          this.flags[flag.feature] = flag.enabled;
        }
      }
      
      this.loaded = true;
    } catch (error) {
      console.error('Error loading feature flags:', error);
      // Default to disabled for all flags on error
    }
  }
  
  /**
   * Check if a feature flag is enabled
   */
  isEnabled(feature: FeatureFlag): boolean {
    // Default to false if not loaded
    if (!this.loaded) {
      console.warn('Feature flags not loaded. Call loadFlags() first.');
      return false;
    }
    
    return this.flags[feature] || false;
  }
  
  /**
   * Generate a consistent hash for a string
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

// Create a singleton instance
export const featureFlags = new FeatureFlagsService();
`
    );
    
    // Initialize feature flags
    writeFile(
      path.join(SERVICES_PATH, 'idea-playground', 'idea-management.service.ts'),
      `/**
 * Service for managing ideas, handling CRUD operations
 */
import { supabase } from '../../supabase';
import { IdeaPlaygroundIdea, ProtectionLevel } from '../../types/idea-playground.types';

export class IdeaManagementService {
  /**
   * Get all ideas for a specific user
   */
  async getIdeasForUser(userId: string): Promise<IdeaPlaygroundIdea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as IdeaPlaygroundIdea[];
  }
  
  /**
   * Get a single idea by ID
   */
  async getIdea(ideaId: string): Promise<IdeaPlaygroundIdea> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
      
    if (error) throw error;
    
    return data as IdeaPlaygroundIdea;
  }
  
  /**
   * Create a new idea
   */
  async createIdea(idea: Partial<IdeaPlaygroundIdea>): Promise<IdeaPlaygroundIdea> {
    const { data, error } = await supabase
      .from('ideas')
      .insert([
        {
          ...idea,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return data as IdeaPlaygroundIdea;
  }
  
  /**
   * Update an existing idea
   */
  async updateIdea(idea: IdeaPlaygroundIdea): Promise<IdeaPlaygroundIdea> {
    const { data, error } = await supabase
      .from('ideas')
      .update({
        ...idea,
        updated_at: new Date().toISOString()
      })
      .eq('id', idea.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as IdeaPlaygroundIdea;
  }
  
  /**
   * Delete an idea
   */
  async deleteIdea(ideaId: string): Promise<void> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);
      
    if (error) throw error;
  }
  
  /**
   * Set the protection level for an idea
   */
  async setProtectionLevel(
    ideaId: string, 
    level: ProtectionLevel | string,
    userId: string
  ): Promise<void> {
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
    
    // Add to protection settings table
    const { error: settingsError } = await supabase
      .from('idea_protection_settings')
      .insert([{
        idea_id: ideaId,
        protection_level: level,
        owner_user_id: userId,
        created_at: new Date().toISOString()
      }]);
    
    if (settingsError) {
      console.error('Error adding protection settings:', settingsError);
    }
  }
}
`
    );
    
    // Create script for enabling feature flags
    writeFile(
      path.join(__dirname, 'enable-idea-playground-features.js'),
      `#!/usr/bin/env node
/**
 * Script to enable the Idea Playground features by setting feature flags
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Feature flags to enable
const featureFlags = [
  { feature: 'idea_playground', enabled: true },
  { feature: 'ip_protection', enabled: true },
  { feature: 'ai_refinement', enabled: true },
  { feature: 'hugging_face_integration', enabled: false },
  { feature: 'continuous_learning', enabled: false }
];

async function enableFeatures() {
  console.log('Enabling Idea Playground features...');
  
  try {
    // Check if feature_flags table exists
    const { error: checkError } = await supabase
      .from('feature_flags')
      .select('feature')
      .limit(1);
    
    if (checkError) {
      // Table doesn't exist, create it
      console.log('Creating feature_flags table...');
      
      const { error: createError } = await supabase.rpc('run_sql_query', {
        query: \`
          CREATE TABLE IF NOT EXISTS public.feature_flags (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            feature TEXT NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT false,
            user_id UUID,
            user_percentage INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(feature, user_id)
          );
          
          CREATE INDEX IF NOT EXISTS feature_flags_feature_idx ON public.feature_flags(feature);
          CREATE INDEX IF NOT EXISTS feature_flags_user_id_idx ON public.feature_flags(user_id);
        \`
      });
      
      if (createError) {
        console.error('Error creating feature_flags table:', createError);
        process.exit(1);
      }
    }
    
    // Upsert feature flags
    for (const flag of featureFlags) {
      const { error } = await supabase
        .from('feature_flags')
        .upsert(
          {
            feature: flag.feature,
            enabled: flag.enabled,
            user_id: null, // Global flag
            user_percentage: 100, // Available to all users
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'feature, user_id'
          }
        );
      
      if (error) {
        console.error(\`Error setting feature flag \${flag.feature}:\`, error);
      } else {
        console.log(\`Feature flag \${flag.feature} set to \${flag.enabled}\`);
      }
    }
    
    console.log('All feature flags updated successfully!');
  } catch (error) {
    console.error('Error enabling features:', error);
    process.exit(1);
  }
}

enableFeatures();
`
    );
    
    // Create LLM orchestrator stub
    writeFile(
      path.join(LLM_PATH, 'orchestrator.ts'),
      `/**
 * Orchestrator for LLM operations
 * This coordinates between different AI providers and context enhancers
 */
import { OpenAIAdapter } from './adapters/openai.adapter';
import { LLMAdapter } from './adapters/interface';
import { ContextManager } from './context/context-manager';
import { BaseContextProvider } from './context/base-context.provider';

export class LLMOrchestrator {
  private adapters: Record<string, LLMAdapter>;
  private contextManager: ContextManager;
  private activeAdapter: string;
  
  constructor() {
    // Initialize adapters
    this.adapters = {
      openai: new OpenAIAdapter()
    };
    
    // Set default adapter
    this.activeAdapter = 'openai';
    
    // Initialize context providers
    this.contextManager = new ContextManager([
      new BaseContextProvider()
    ]);
  }
  
  /**
   * Generate text using the active LLM adapter
   */
  async generateText(prompt: string, options?: any): Promise<string> {
    const adapter = this.getActiveAdapter();
    
    // Enhance prompt with context
    const enhancedPrompt = await this.contextManager.enhancePrompt(prompt);
    
    // Generate text
    return adapter.generateText(enhancedPrompt, options);
  }
  
  /**
   * Generate idea using the active LLM adapter
   */
  async generateIdea(prompt: string, options?: any): Promise<any> {
    return this.generateText(
      \`Generate a business idea based on this prompt: \${prompt}
      
      Return the result as a JSON object with these properties:
      - title: A catchy name for the idea
      - description: Brief overview of the idea
      - problem_statement: What problem does it solve
      - solution_concept: How the solution works
      - target_audience: Who would use this (array of user types)
      - unique_value: What makes this idea unique
      - business_model: How it would make money\`,
      options
    );
  }
  
  /**
   * Get the active adapter
   */
  getActiveAdapter(): LLMAdapter {
    return this.adapters[this.activeAdapter];
  }
  
  /**
   * Switch the active LLM adapter
   */
  setActiveAdapter(adapterId: string): void {
    if (!this.adapters[adapterId]) {
      throw new Error(\`Adapter \${adapterId} not found\`);
    }
    this.activeAdapter = adapterId;
  }
  
  /**
   * Refine an idea based on feedback
   */
  async refineIdea(idea: any, feedback: string): Promise<any> {
    const adapter = this.getActiveAdapter();
    return adapter.refineIdea(idea, feedback);
  }
}
`
    );

    // Create adapter interface
    writeFile(
      path.join(LLM_PATH, 'adapters', 'interface.ts'),
      `/**
 * Interface for LLM adapters
 * Any AI provider must implement this interface
 */
export interface LLMAdapter {
  /**
   * Generate text from a prompt
   */
  generateText(prompt: string, options?: any): Promise<string>;
  
  /**
   * Generate embeddings for a text
   */
  generateEmbedding(text: string): Promise<number[]>;
  
  /**
   * Generate variations of an idea
   */
  generateIdeaVariations(originalIdea: any, count: number): Promise<any[]>;
  
  /**
   * Refine an idea based on feedback
   */
  refineIdea(idea: any, feedback: string): Promise<any>;
  
  /**
   * Check if the adapter is available
   */
  isAvailable(): Promise<boolean>;
}
`
    );
    
    // Create idea generation service
    writeFile(
      path.join(IDEA_PLAYGROUND_SERVICES_PATH, 'idea-generation.service.ts'),
      `/**
 * Service for generating ideas using AI
 */
import { LLMOrchestrator } from './llm/orchestrator';
import { IdeaPlaygroundIdea } from '../../types/idea-playground.types';
import { IdeaManagementService } from './idea-management.service';

export class IdeaGenerationService {
  private orchestrator: LLMOrchestrator;
  private ideaManagementService: IdeaManagementService;
  
  constructor(orchestrator: LLMOrchestrator) {
    this.orchestrator = orchestrator;
    this.ideaManagementService = new IdeaManagementService();
  }
  
  /**
   * Generate a new idea from a user prompt
   */
  async generateIdea(prompt: string, userId: string): Promise<IdeaPlaygroundIdea> {
    try {
      // Generate idea using AI
      const response = await this.orchestrator.generateIdea(prompt);
      
      // Parse response - handling both string and parsed object scenarios
      let ideaData: any;
      
      if (typeof response === 'string') {
        try {
          // Try to parse as JSON
          ideaData = JSON.parse(response);
        } catch (parseError) {
          console.error('Error parsing AI response as JSON:', parseError);
          // Create basic structure from text response
          ideaData = {
            title: this.extractTitle(response) || 'Untitled Idea',
            description: response
          };
        }
      } else {
        // Already parsed
        ideaData = response;
      }
      
      // Ensure all required fields exist
      const idea: Partial<IdeaPlaygroundIdea> = {
        title: ideaData.title || 'Untitled Idea',
        description: ideaData.description || prompt,
        problem_statement: ideaData.problem_statement || '',
        solution_concept: ideaData.solution_concept || '',
        target_audience: ideaData.target_audience || [],
        unique_value: ideaData.unique_value || '',
        business_model: ideaData.business_model || '',
        user_id: userId,
        protection_level: 'public'
      };
      
      // Save to database
      return this.ideaManagementService.createIdea(idea);
    } catch (error) {
      console.error('Error generating idea:', error);
      throw error;
    }
  }
  
  /**
   * Extract a title from a text response
   */
  private extractTitle(text: string): string | null {
    // Try to find a title in the text
    // First look for "Title:" or "# "
    const titleMatch = text.match(/Title:(.+?)\\n|#(.+?)\\n/);
    
    if (titleMatch) {
      const title = titleMatch[1] || titleMatch[2];
      return title.trim();
    }
    
    // If no title found, use the first line if it's short enough
    const firstLine = text.split('\\n')[0].trim();
    if (firstLine.length <= 50) {
      return firstLine;
    }
    
    return null;
  }
}
`
    );

    // Print next steps
    console.log('\nModular architecture files have been created.');
    console.log('\nNext steps:');
    console.log('1. Run `npm i` to ensure all dependencies are installed');
    console.log('2. Run `node scripts/enable-idea-playground-features.js` to enable the feature flags');
    console.log('3. Add missing implementation files as needed');
    console.log('4. Update the application to use the new modular services\n');
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Main function to run migration
async function main() {
  try {
    const success = await migrateToModularArchitecture();
    
    if (success) {
      console.log('\nMigration completed successfully!');
    } else {
      console.error('\nMigration failed. Please check the logs for errors.');
    }
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the migration
main();
