/**
 * Journey Integration Service
 * 
 * Connects journey steps with experts, resources, and community features.
 * This service acts as the integration layer between the journey system and other modules.
 */

import { recommendationService } from '../recommendation';

// Step types
export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  phase: string;
  order: number;
  estimatedTime: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources?: {
    articles?: { id: string; title: string; url: string }[];
    videos?: { id: string; title: string; url: string }[];
    tools?: { id: string; name: string; url: string }[];
  };
}

// Journey types
export interface Journey {
  id: string;
  companyId: string;
  title: string;
  description: string;
  phases: JourneyPhase[];
}

export interface JourneyPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  steps: JourneyStep[];
}

// Progress tracking types
export interface StepProgress {
  stepId: string;
  companyId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // in minutes
  notes?: string;
}

// Mock implementation for demo purposes
class JourneyIntegrationService {
  /**
   * Get a journey step by ID
   */
  async getStep(stepId: string): Promise<JourneyStep> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: stepId,
      title: 'Create Your Minimum Viable Product',
      description: 'Build the simplest version of your product that solves the core problem for your customers. Focus on the essential features that deliver the most value.',
      phase: 'Build',
      order: 3,
      estimatedTime: '2-4 weeks',
      status: 'not_started',
      resources: {
        articles: [
          { id: 'a1', title: 'The Lean MVP Guide', url: '/resources/articles/lean-mvp-guide' },
          { id: 'a2', title: 'Validating Your MVP', url: '/resources/articles/validating-mvp' }
        ],
        videos: [
          { id: 'v1', title: 'MVP in 2 Weeks', url: '/resources/videos/mvp-in-2-weeks' }
        ],
        tools: [
          { id: 't1', name: 'Feature Prioritization Template', url: '/resources/tools/feature-prioritization' }
        ]
      }
    };
  }

  /**
   * Get a company's journey
   */
  async getJourney(companyId: string): Promise<Journey> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: 'journey-1',
      companyId,
      title: 'Startup Journey',
      description: 'A step-by-step guide to building your startup from idea to scale.',
      phases: [
        {
          id: 'phase-1',
          title: 'Validate',
          description: 'Validate your idea and identify your target market.',
          order: 1,
          steps: [
            {
              id: 'step-1',
              title: 'Define Your Value Proposition',
              description: 'Clearly articulate the unique value your product provides to customers.',
              phase: 'Validate',
              order: 1,
              estimatedTime: '1-2 weeks',
              status: 'completed'
            },
            {
              id: 'step-2',
              title: 'Identify Your Target Market',
              description: 'Research and define your ideal customer segments.',
              phase: 'Validate',
              order: 2,
              estimatedTime: '1-2 weeks',
              status: 'completed'
            }
          ]
        },
        {
          id: 'phase-2',
          title: 'Build',
          description: 'Build your minimum viable product and prepare for launch.',
          order: 2,
          steps: [
            {
              id: 'step-3',
              title: 'Create Your Minimum Viable Product',
              description: 'Build the simplest version of your product that solves the core problem for your customers.',
              phase: 'Build',
              order: 3,
              estimatedTime: '2-4 weeks',
              status: 'not_started'
            },
            {
              id: 'step-4',
              title: 'Develop Your Go-to-Market Strategy',
              description: 'Plan how you will reach and acquire your first customers.',
              phase: 'Build',
              order: 4,
              estimatedTime: '1-2 weeks',
              status: 'not_started'
            }
          ]
        },
        {
          id: 'phase-3',
          title: 'Launch',
          description: 'Launch your product and acquire your first customers.',
          order: 3,
          steps: [
            {
              id: 'step-5',
              title: 'Launch Your MVP',
              description: 'Release your product to your target market and gather feedback.',
              phase: 'Launch',
              order: 5,
              estimatedTime: '1 week',
              status: 'not_started'
            },
            {
              id: 'step-6',
              title: 'Implement Customer Feedback Loops',
              description: 'Create systems to collect and act on customer feedback.',
              phase: 'Launch',
              order: 6,
              estimatedTime: '1-2 weeks',
              status: 'not_started'
            }
          ]
        }
      ]
    };
  }

  /**
   * Update a step's status
   */
  async updateStepStatus(
    stepId: string, 
    companyId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    notes?: string
  ): Promise<StepProgress> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const now = new Date();
    
    return {
      stepId,
      companyId,
      status,
      startedAt: status === 'not_started' ? undefined : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completedAt: status === 'completed' ? now : undefined,
      timeSpent: status === 'completed' ? 2520 : undefined, // 42 hours in minutes
      notes
    };
  }

  /**
   * Get step progress for a company
   */
  async getStepProgress(stepId: string, companyId: string): Promise<StepProgress> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      stepId,
      companyId,
      status: 'not_started'
    };
  }

  /**
   * Get overall journey progress for a company
   */
  async getJourneyProgress(companyId: string): Promise<{
    totalSteps: number;
    completedSteps: number;
    currentPhase: string;
    phaseProgress: { phase: string; completed: number; total: number }[];
  }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      totalSteps: 30,
      completedSteps: 12,
      currentPhase: 'Build',
      phaseProgress: [
        { phase: 'Validate', completed: 8, total: 8 },
        { phase: 'Build', completed: 4, total: 8 },
        { phase: 'Launch', completed: 0, total: 6 },
        { phase: 'Scale', completed: 0, total: 8 }
      ]
    };
  }

  /**
   * Connect a journey step with experts
   */
  async connectStepWithExperts(stepId: string, expertIds: string[]): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log(`Connected step ${stepId} with experts: ${expertIds.join(', ')}`);
  }

  /**
   * Connect a journey step with templates
   */
  async connectStepWithTemplates(stepId: string, templateIds: string[]): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log(`Connected step ${stepId} with templates: ${templateIds.join(', ')}`);
  }

  /**
   * Log step completion for analytics
   */
  async logStepCompletion(
    stepId: string, 
    companyId: string, 
    timeSpent: number, 
    outcome?: { [key: string]: any }
  ): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`Logged completion of step ${stepId} for company ${companyId}`);
    console.log(`Time spent: ${timeSpent} minutes`);
    if (outcome) {
      console.log('Outcome:', outcome);
    }
  }
}

export const journeyIntegrationService = new JourneyIntegrationService();
