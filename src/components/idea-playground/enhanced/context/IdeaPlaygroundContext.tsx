import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  IdeaPlaygroundIdea, 
  IdeaPlaygroundStage, 
  IdeaPlaygroundProgress,
  IdeaPlaygroundValidationExperiment,
  IdeaPlaygroundCustomerSegment,
  IdeaPlaygroundCompetitor,
  IdeaPlaygroundBusinessModel,
  IdeaPlaygroundMilestone
} from '../../../../lib/types/idea-playground.types';
import { 
  IdeaWorkflowContext, 
  StageId, 
  initialContext,
  assignIdea,
  assignTargetStage,
  saveIdea,
  completeStage,
  addValidationExperiment,
  addCustomerSegment,
  addCompetitor,
  setBusinessModel,
  addMilestone,
  assignError,
  resetError
} from '../state/idea-workflow.machine';
import { AIServiceFactory } from '../services/ai-service.factory';
import { AIServiceInterface } from '../services/ai-service.interface';
import { useAuthStore } from '../../../../lib/store';

// Define the action types
type ActionType = 
  | { type: 'SET_IDEA'; idea: IdeaPlaygroundIdea }
  | { type: 'SET_STAGE'; stageId: string }
  | { type: 'SAVE_IDEA'; data: Partial<IdeaPlaygroundIdea> }
  | { type: 'COMPLETE_STAGE'; data: any }
  | { type: 'ADD_EXPERIMENT'; experiment: Partial<IdeaPlaygroundValidationExperiment> }
  | { type: 'ADD_CUSTOMER_SEGMENT'; segment: Partial<IdeaPlaygroundCustomerSegment> }
  | { type: 'ADD_COMPETITOR'; competitor: Partial<IdeaPlaygroundCompetitor> }
  | { type: 'SET_BUSINESS_MODEL'; model: Partial<IdeaPlaygroundBusinessModel> }
  | { type: 'ADD_MILESTONE'; milestone: Partial<IdeaPlaygroundMilestone> }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'RESET_ERROR' };

// Define the context type
interface IdeaPlaygroundContextType {
  state: IdeaWorkflowContext;
  setIdea: (idea: IdeaPlaygroundIdea) => void;
  setStage: (stageId: string) => void;
  goToStage: (stageId: string) => void;
  loadIdea: (ideaId: string) => Promise<void>;
  saveIdeaData: (data: Partial<IdeaPlaygroundIdea>) => Promise<void>;
  completeCurrentStage: (data: any) => Promise<void>;
  addExperiment: (experiment: Partial<IdeaPlaygroundValidationExperiment>) => Promise<void>;
  addCustomerSegment: (segment: Partial<IdeaPlaygroundCustomerSegment>) => Promise<void>;
  addCompetitor: (competitor: Partial<IdeaPlaygroundCompetitor>) => Promise<void>;
  setBusinessModel: (model: Partial<IdeaPlaygroundBusinessModel>) => Promise<void>;
  addMilestone: (milestone: Partial<IdeaPlaygroundMilestone>) => Promise<void>;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
  aiService: AIServiceInterface;
}

// Create the context
const IdeaPlaygroundContext = createContext<IdeaPlaygroundContextType | undefined>(undefined);

// Reducer function
const reducer = (state: IdeaWorkflowContext, action: ActionType): IdeaWorkflowContext => {
  switch (action.type) {
    case 'SET_IDEA':
      return assignIdea(state, { idea: action.idea });
    case 'SET_STAGE':
      return assignTargetStage(state, { stageId: action.stageId });
    case 'SAVE_IDEA':
      return saveIdea(state, { data: action.data });
    case 'COMPLETE_STAGE':
      return completeStage(state, { data: action.data });
    case 'ADD_EXPERIMENT':
      return addValidationExperiment(state, { experiment: action.experiment });
    case 'ADD_CUSTOMER_SEGMENT':
      return addCustomerSegment(state, { segment: action.segment });
    case 'ADD_COMPETITOR':
      return addCompetitor(state, { competitor: action.competitor });
    case 'SET_BUSINESS_MODEL':
      return setBusinessModel(state, { model: action.model });
    case 'ADD_MILESTONE':
      return addMilestone(state, { milestone: action.milestone });
    case 'SET_ERROR':
      return assignError(state, { message: action.message });
    case 'RESET_ERROR':
      return resetError(state);
    default:
      return state;
  }
};

// Provider component
interface IdeaPlaygroundProviderProps {
  children: ReactNode;
  initialIdea?: IdeaPlaygroundIdea;
  initialStageId?: string;
}

export const IdeaPlaygroundProvider: React.FC<IdeaPlaygroundProviderProps> = ({ 
  children, 
  initialIdea, 
  initialStageId = StageId.DASHBOARD 
}) => {
  const [state, dispatch] = useReducer(reducer, initialContext);
  const { featureFlags } = useAuthStore();
  const aiService = AIServiceFactory.createService();
  
  // Reset AI services when feature flags change
  useEffect(() => {
    console.log('Feature flags changed, resetting AI services');
    AIServiceFactory.resetServices();
  }, [featureFlags.useRealAI?.enabled, featureFlags.multiTieredAI?.enabled]);

  // Initialize with the initial idea and stage
  useEffect(() => {
    if (initialIdea) {
      dispatch({ type: 'SET_IDEA', idea: initialIdea });
    }
    dispatch({ type: 'SET_STAGE', stageId: initialStageId });
  }, [initialIdea, initialStageId]);

  // Define the context value
  const contextValue: IdeaPlaygroundContextType = {
    state,
    setIdea: (idea: IdeaPlaygroundIdea) => dispatch({ type: 'SET_IDEA', idea }),
    setStage: (stageId: string) => dispatch({ type: 'SET_STAGE', stageId }),
    goToStage: (stageId: string) => dispatch({ type: 'SET_STAGE', stageId }),
    loadIdea: async (ideaId: string) => {
      // In a real implementation, we would load the idea from the database
      // For now, we'll just set a mock idea
      const mockIdea: IdeaPlaygroundIdea = {
        id: ideaId,
        canvas_id: 'canvas-1',
        title: 'Mock Idea',
        description: 'This is a mock idea for testing purposes',
        problem_statement: 'Problem statement for the mock idea',
        solution_concept: 'Solution concept for the mock idea',
        target_audience: 'Target audience for the mock idea',
        unique_value: 'Unique value proposition for the mock idea',
        business_model: 'Business model for the mock idea',
        marketing_strategy: 'Marketing strategy for the mock idea',
        revenue_model: 'Revenue model for the mock idea',
        go_to_market: 'Go-to-market strategy for the mock idea',
        market_size: 'Market size for the mock idea',
        used_company_context: false,
        is_archived: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dispatch({ type: 'SET_IDEA', idea: mockIdea });
    },
    saveIdeaData: async (data: Partial<IdeaPlaygroundIdea>) => {
      dispatch({ type: 'SAVE_IDEA', data });
      // In a real implementation, we would save the data to the database here
    },
    completeCurrentStage: async (data: any) => {
      dispatch({ type: 'COMPLETE_STAGE', data });
      // In a real implementation, we would save the progress to the database here
    },
    addExperiment: async (experiment: Partial<IdeaPlaygroundValidationExperiment>) => {
      dispatch({ type: 'ADD_EXPERIMENT', experiment });
      // In a real implementation, we would save the experiment to the database here
    },
    addCustomerSegment: async (segment: Partial<IdeaPlaygroundCustomerSegment>) => {
      dispatch({ type: 'ADD_CUSTOMER_SEGMENT', segment });
      // In a real implementation, we would save the segment to the database here
    },
    addCompetitor: async (competitor: Partial<IdeaPlaygroundCompetitor>) => {
      dispatch({ type: 'ADD_COMPETITOR', competitor });
      // In a real implementation, we would save the competitor to the database here
    },
    setBusinessModel: async (model: Partial<IdeaPlaygroundBusinessModel>) => {
      dispatch({ type: 'SET_BUSINESS_MODEL', model });
      // In a real implementation, we would save the business model to the database here
    },
    addMilestone: async (milestone: Partial<IdeaPlaygroundMilestone>) => {
      dispatch({ type: 'ADD_MILESTONE', milestone });
      // In a real implementation, we would save the milestone to the database here
    },
    goToNextStage: () => {
      if (!state.currentStage || !state.idea) return;
      
      const currentIndex = state.stages.findIndex(s => s.id === state.currentStage?.id);
      if (currentIndex < state.stages.length - 1 && currentIndex >= 0) {
        const nextStage = state.stages[currentIndex + 1];
        dispatch({ type: 'SET_STAGE', stageId: nextStage.id });
      }
    },
    goToPreviousStage: () => {
      if (!state.currentStage || !state.idea) return;
      
      const currentIndex = state.stages.findIndex(s => s.id === state.currentStage?.id);
      if (currentIndex > 0) {
        const previousStage = state.stages[currentIndex - 1];
        dispatch({ type: 'SET_STAGE', stageId: previousStage.id });
      }
    },
    aiService
  };

  return (
    <IdeaPlaygroundContext.Provider value={contextValue}>
      {children}
    </IdeaPlaygroundContext.Provider>
  );
};

// Custom hook to use the context
export const useIdeaPlayground = (): IdeaPlaygroundContextType => {
  const context = useContext(IdeaPlaygroundContext);
  if (context === undefined) {
    throw new Error('useIdeaPlayground must be used within an IdeaPlaygroundProvider');
  }
  return context;
};
