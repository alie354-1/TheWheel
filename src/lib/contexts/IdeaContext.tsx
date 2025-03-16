import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BusinessSuggestions, IdeaVariation } from '../services/idea-generation.service';
import { useNavigate, useLocation } from 'react-router-dom';

// Local storage key for idea data
const IDEA_DATA_STORAGE_KEY = 'wheel99_idea_refinement_data';
const IDEA_STEP_STORAGE_KEY = 'wheel99_idea_refinement_step';

// Define the shape of our idea data
export interface IdeaData {
  id?: string;
  version?: number;
  title: string;
  description: string;
  problem_statement: string;
  solution_concept: string;
  target_audience: string;
  unique_value: string;
  business_model: string;
  marketing_strategy: string;
  revenue_model: string;
  go_to_market: string;
  market_size?: string;
  ai_feedback?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    suggestions: string[];
    market_insights: string[];
    validation_tips: string[];
  };
  business_suggestions?: BusinessSuggestions;
  selected_suggestions?: Record<string, string[]>;
  concept_variations?: IdeaVariation[];
  selected_variation?: IdeaVariation;
  merged_variation?: {
    title: string;
    description: string;
    differentiator: string;
    targetMarket: string;
    revenueModel: string;
  };
}

// Define the shape of our context
interface IdeaContextType {
  ideaData: IdeaData;
  setIdeaData: React.Dispatch<React.SetStateAction<IdeaData>>;
  currentStep: number;
  setCurrentStep: (step: number) => void; // Changed to a function that takes a number
  totalSteps: number;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  success: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  saveToLocalStorage: () => void;
  clearLocalStorage: () => void;
}

// Create the context with a default value
const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

// Define props for the provider component
interface IdeaProviderProps {
  children: ReactNode;
  initialStep?: number;
}

// Default idea data
const defaultIdeaData: IdeaData = {
  title: '',
  description: '',
  problem_statement: '',
  solution_concept: '',
  target_audience: '',
  unique_value: '',
  business_model: '',
  marketing_strategy: '',
  revenue_model: '',
  go_to_market: '',
  ai_feedback: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    suggestions: [],
    market_insights: [],
    validation_tips: []
  },
  selected_suggestions: {
    target_audience: [],
    sales_channels: [],
    pricing_model: [],
    customer_type: [],
    integration_needs: []
  }
};

// Create a provider component
export const IdeaProvider: React.FC<IdeaProviderProps> = ({ children, initialStep = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to load saved data from localStorage
  const loadSavedData = (): IdeaData => {
    try {
      const savedData = localStorage.getItem(IDEA_DATA_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded saved idea data from localStorage');
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading saved idea data:', error);
    }
    return defaultIdeaData;
  };
  
  // Try to load saved step from localStorage or URL
  const loadSavedStep = (): number => {
    // First check URL for step parameter
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (!isNaN(step) && step >= 0 && step < 5) {
        console.log('Using step from URL parameter:', step);
        return step;
      }
    }
    
    // Then check localStorage
    try {
      const savedStep = localStorage.getItem(IDEA_STEP_STORAGE_KEY);
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step) && step >= 0 && step < 5) {
          console.log('Using step from localStorage:', step);
          return step;
        }
      }
    } catch (error) {
      console.error('Error loading saved step:', error);
    }
    
    // Default to initialStep or 0
    return initialStep;
  };

  // Initialize state for idea data
  const [ideaData, setIdeaData] = useState<IdeaData>(loadSavedData);

  // Initialize state for current step
  const [currentStep, setCurrentStepState] = useState(loadSavedStep);
  const totalSteps = 5; // Basic Info, Concept Variations, Business Model, Detailed Refinement, Component Variations

  // Initialize state for loading, error, and success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(IDEA_DATA_STORAGE_KEY, JSON.stringify(ideaData));
    } catch (error) {
      console.error('Error saving idea data to localStorage:', error);
    }
  }, [ideaData]);

  // Save step to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(IDEA_STEP_STORAGE_KEY, currentStep.toString());
      
      // Update URL to reflect current step
      const url = new URL(window.location.href);
      url.searchParams.set('step', currentStep.toString());
      navigate(`/idea-hub/refinement?step=${currentStep}`, { replace: true });
    } catch (error) {
      console.error('Error saving step to localStorage:', error);
    }
  }, [currentStep, navigate]);

  // Custom setCurrentStep function with improved navigation
  const setCurrentStep = (step: number) => {
    console.log('IdeaContext: Setting current step from', currentStep, 'to', step);
    
    if (step >= 0 && step < totalSteps) {
      // Save current data before changing step
      try {
        localStorage.setItem(IDEA_DATA_STORAGE_KEY, JSON.stringify(ideaData));
      } catch (error) {
        console.error('Error saving idea data before step change:', error);
      }
      
      // Update the step state
      setCurrentStepState(step);
      
      // Update URL with the new step
      navigate(`/idea-hub/refinement?step=${step}`, { replace: true });
      
      console.log('IdeaContext: Step change completed to', step);
    } else {
      console.error('Invalid step:', step);
    }
  };
  
  // Function to explicitly save to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(IDEA_DATA_STORAGE_KEY, JSON.stringify(ideaData));
      localStorage.setItem(IDEA_STEP_STORAGE_KEY, currentStep.toString());
      console.log('Manually saved idea data and step to localStorage');
      return true;
    } catch (error) {
      console.error('Error manually saving to localStorage:', error);
      return false;
    }
  };
  
  // Function to clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(IDEA_DATA_STORAGE_KEY);
      localStorage.removeItem(IDEA_STEP_STORAGE_KEY);
      console.log('Cleared idea data and step from localStorage');
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  };

  // Create the context value
  const contextValue: IdeaContextType = {
    ideaData,
    setIdeaData,
    currentStep,
    setCurrentStep,
    totalSteps,
    isLoading,
    setIsLoading,
    error,
    setError,
    success,
    setSuccess,
    saveToLocalStorage,
    clearLocalStorage
  };

  // Provide the context value to children
  return (
    <IdeaContext.Provider value={contextValue}>
      {children}
    </IdeaContext.Provider>
  );
};

// Create a custom hook to use the context
export const useIdeaContext = () => {
  const context = useContext(IdeaContext);
  if (context === undefined) {
    throw new Error('useIdeaContext must be used within an IdeaProvider');
  }
  return context;
};
