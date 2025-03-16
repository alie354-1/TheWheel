import { IdeaPlaygroundIdea, IdeaPlaygroundStage, IdeaPlaygroundProgress } from '../../../../lib/types/idea-playground.types';

// Stage IDs
export enum StageId {
  DASHBOARD = 'dashboard',
  IDEA_GENERATION = 'idea_generation',
  INITIAL_ASSESSMENT = 'initial_assessment',
  DETAILED_REFINEMENT = 'detailed_refinement',
  MARKET_VALIDATION = 'market_validation',
  BUSINESS_MODEL = 'business_model',
  GO_TO_MARKET = 'go_to_market',
  COMPANY_FORMATION = 'company_formation',
}

// Define the context type for the workflow
export interface IdeaWorkflowContext {
  idea?: IdeaPlaygroundIdea;
  stages: IdeaPlaygroundStage[];
  currentStage?: IdeaPlaygroundStage;
  progress: IdeaPlaygroundProgress[];
  error?: string;
}

// Initial context
export const initialContext: IdeaWorkflowContext = {
  stages: [
    {
      id: StageId.DASHBOARD,
      key: 'dashboard',
      name: 'Dashboard',
      description: 'Manage your ideas',
      order_index: -1,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.IDEA_GENERATION,
      key: 'idea_generation',
      name: 'Idea Generation',
      description: 'Generate and capture your business idea',
      order_index: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.INITIAL_ASSESSMENT,
      key: 'initial_assessment',
      name: 'Initial Assessment',
      description: 'Evaluate the potential of your idea',
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.DETAILED_REFINEMENT,
      key: 'detailed_refinement',
      name: 'Detailed Refinement',
      description: 'Refine and improve your idea',
      order_index: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.MARKET_VALIDATION,
      key: 'market_validation',
      name: 'Market Validation',
      description: 'Validate your idea with experiments',
      order_index: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.BUSINESS_MODEL,
      key: 'business_model',
      name: 'Business Model',
      description: 'Develop a sustainable business model',
      order_index: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.GO_TO_MARKET,
      key: 'go_to_market',
      name: 'Go-to-Market',
      description: 'Plan your market entry strategy',
      order_index: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: StageId.COMPANY_FORMATION,
      key: 'company_formation',
      name: 'Company Formation',
      description: 'Prepare to establish your company',
      order_index: 6,
      created_at: new Date().toISOString(),
    },
  ],
  progress: [],
};

// Helper function to get a stage by ID
export const getStageById = (
  stageId: string,
  stages: IdeaPlaygroundStage[]
): IdeaPlaygroundStage | undefined => {
  return stages.find((stage) => stage.id === stageId);
};

// Helper function to check if a stage is completed
export const isStageCompleted = (
  stageId: string,
  ideaId: string,
  progress: IdeaPlaygroundProgress[]
): boolean => {
  return progress.some(
    (p) => p.stage_id === stageId && p.idea_id === ideaId && p.is_completed
  );
};

// Action to assign an idea to the context
export const assignIdea = (
  context: IdeaWorkflowContext,
  action: { idea: IdeaPlaygroundIdea }
): IdeaWorkflowContext => {
  return {
    ...context,
    idea: action.idea,
  };
};

// Action to assign a target stage to the context
export const assignTargetStage = (
  context: IdeaWorkflowContext,
  action: { stageId: string }
): IdeaWorkflowContext => {
  const targetStage = getStageById(action.stageId, context.stages);
  
  if (!targetStage) {
    return {
      ...context,
      error: `Stage with ID ${action.stageId} not found`,
    };
  }
  
  return {
    ...context,
    currentStage: targetStage,
    error: undefined,
  };
};

// Action to save idea data
export const saveIdea = (
  context: IdeaWorkflowContext,
  action: { data: Partial<IdeaPlaygroundIdea> }
): IdeaWorkflowContext => {
  if (!context.idea) {
    return {
      ...context,
      error: 'No idea to save',
    };
  }
  
  return {
    ...context,
    idea: {
      ...context.idea,
      ...action.data,
      updated_at: new Date().toISOString(),
    },
    error: undefined,
  };
};

// Action to complete a stage
export const completeStage = (
  context: IdeaWorkflowContext,
  action: { data: any }
): IdeaWorkflowContext => {
  if (!context.idea || !context.currentStage) {
    return {
      ...context,
      error: 'No idea or current stage',
    };
  }
  
  // Create a new progress entry or update an existing one
  const existingProgressIndex = context.progress.findIndex(
    (p) => p.stage_id === context.currentStage?.id && p.idea_id === context.idea?.id
  );
  
  let updatedProgress = [...context.progress];
  
  if (existingProgressIndex >= 0) {
    // Update existing progress
    updatedProgress[existingProgressIndex] = {
      ...updatedProgress[existingProgressIndex],
      is_completed: true,
      completion_data: action.data,
      updated_at: new Date().toISOString(),
    };
  } else {
    // Create new progress
    updatedProgress.push({
      id: `progress_${Date.now()}`,
      idea_id: context.idea.id,
      stage_id: context.currentStage.id,
      is_completed: true,
      completion_data: action.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Update the idea's current stage to the next stage
  const currentIndex = context.stages.findIndex(
    (s) => s.id === context.currentStage?.id
  );
  
  let nextStageId = context.currentStage.id;
  
  if (currentIndex < context.stages.length - 1 && currentIndex >= 0) {
    nextStageId = context.stages[currentIndex + 1].id;
  }
  
  return {
    ...context,
    progress: updatedProgress,
    idea: {
      ...context.idea,
      current_stage_id: nextStageId,
      updated_at: new Date().toISOString(),
    },
    error: undefined,
  };
};

// Action to add a validation experiment
export const addValidationExperiment = (
  context: IdeaWorkflowContext,
  action: { experiment: any }
): IdeaWorkflowContext => {
  if (!context.idea) {
    return {
      ...context,
      error: 'No idea to add experiment to',
    };
  }
  
  // In a real implementation, this would add the experiment to a database
  // For now, we'll just update the context
  return {
    ...context,
    error: undefined,
  };
};

// Action to add a customer segment
export const addCustomerSegment = (
  context: IdeaWorkflowContext,
  action: { segment: any }
): IdeaWorkflowContext => {
  if (!context.idea) {
    return {
      ...context,
      error: 'No idea to add segment to',
    };
  }
  
  // In a real implementation, this would add the segment to a database
  // For now, we'll just update the context
  return {
    ...context,
    error: undefined,
  };
};

// Action to add a competitor
export const addCompetitor = (
  context: IdeaWorkflowContext,
  action: { competitor: any }
): IdeaWorkflowContext => {
  if (!context.idea) {
    return {
      ...context,
      error: 'No idea to add competitor to',
    };
  }
  
  // In a real implementation, this would add the competitor to a database
  // For now, we'll just update the context
  return {
    ...context,
    error: undefined,
  };
};

// Action to set the business model
export const setBusinessModel = (
  context: IdeaWorkflowContext,
  action: { model: any }
): IdeaWorkflowContext => {
  if (!context.idea) {
    return {
      ...context,
      error: 'No idea to set business model for',
    };
  }
  
  // In a real implementation, this would set the business model in a database
  // For now, we'll just update the context
  return {
    ...context,
    error: undefined,
  };
};

// Action to add a milestone
export const addMilestone = (
  context: IdeaWorkflowContext,
  action: { milestone: any }
): IdeaWorkflowContext => {
  if (!context.idea) {
    return {
      ...context,
      error: 'No idea to add milestone to',
    };
  }
  
  // In a real implementation, this would add the milestone to a database
  // For now, we'll just update the context
  return {
    ...context,
    error: undefined,
  };
};

// Action to assign an error
export const assignError = (
  context: IdeaWorkflowContext,
  action: { message: string }
): IdeaWorkflowContext => {
  return {
    ...context,
    error: action.message,
  };
};

// Action to reset an error
export const resetError = (
  context: IdeaWorkflowContext
): IdeaWorkflowContext => {
  return {
    ...context,
    error: undefined,
  };
};
