import React, { useState, useEffect } from 'react';
import { Lightbulb, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useIdeaContext } from '../../lib/contexts/IdeaContext';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import StepIndicator from './StepIndicator';
import StepNavigation from './StepNavigation';
import BasicIdeaInfo from './BasicIdeaInfo';
import ConceptVariations from './ConceptVariations';
import BusinessModelGenerator from './BusinessModelGenerator';
import DetailedRefinement from './DetailedRefinement';
import ComponentVariations from './ComponentVariations';

const IdeaRefinementWorkflow: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    ideaData, 
    setIdeaData,
    currentStep, 
    isLoading, 
    setIsLoading, 
    error, 
    setError, 
    success, 
    setSuccess,
    saveToLocalStorage
  } = useIdeaContext();

  const steps = [
    'Basic Info',
    'Concept Variations',
    'Business Model',
    'Detailed Refinement',
    'Component Variations'
  ];

  // Track save attempts to provide better error messages
  const [saveAttempts, setSaveAttempts] = useState(0);

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save your idea. Your progress is saved locally.');
      return;
    }

    // Log the current state of ideaData to debug
    console.log('Current ideaData state:', ideaData);
    console.log('Title:', ideaData.title);
    console.log('Description:', ideaData.description);

    // Check if title and description are empty or undefined
    const title = ideaData.title?.trim();
    const description = ideaData.description?.trim();

    if (!title || !description) {
      setError('Please provide at least a title and description before saving.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setSaveAttempts(prev => prev + 1);

    try {
      // First save to localStorage as a backup
      saveToLocalStorage();
      
      // Create a base idea object with the required fields
      const ideaObject = {
        user_id: user.id,
        title: title,
        description: description,
        problem_statement: ideaData.problem_statement || '',
        solution_concept: ideaData.solution_concept || '',
        target_audience: ideaData.target_audience || '',
        unique_value: ideaData.unique_value || '',
        business_model: ideaData.business_model || '',
        marketing_strategy: ideaData.marketing_strategy || '',
        revenue_model: ideaData.revenue_model || '',
        go_to_market: ideaData.go_to_market || '',
        status: 'draft'
      };

      // Prepare the full object with all possible fields
      const fullIdeaObject = {
        ...ideaObject,
        ai_feedback: ideaData.ai_feedback || null,
        selected_suggestions: ideaData.selected_suggestions || null,
        concept_variations: ideaData.concept_variations || null,
        selected_variation: ideaData.selected_variation || null,
        merged_variation: ideaData.merged_variation || null,
        market_insights: ideaData.selected_suggestions || null
      };

      // Check if we're updating an existing idea or creating a new one
      if (ideaData.id) {
        // Update existing idea
        const { error } = await supabase
          .from('ideas')
          .update(fullIdeaObject)
          .eq('id', ideaData.id);

        if (error) {
          throw error;
        }
        
        setSuccess('Idea updated successfully!');
      } else {
        // Create new idea with retry logic for different field combinations
        let savedIdea = null;
        let saveError = null;
        
        // Try with all fields first
        try {
          const { data, error } = await supabase
            .from('ideas')
            .insert(fullIdeaObject)
            .select('id')
            .single();
            
          if (error) {
            saveError = error;
          } else {
            savedIdea = data;
          }
        } catch (error: any) {
          saveError = error;
        }
        
        // If that failed, try with just the base fields
        if (saveError && !savedIdea) {
          try {
            const { data, error } = await supabase
              .from('ideas')
              .insert(ideaObject)
              .select('id')
              .single();
              
            if (error) {
              throw error;
            }
            
            savedIdea = data;
          } catch (error: any) {
            throw error;
          }
        }
        
        // Update the idea data with the new ID
        if (savedIdea && savedIdea.id) {
          setIdeaData(prev => ({
            ...prev,
            id: savedIdea.id
          }));
          
          setSuccess('Idea saved successfully!');
        } else {
          throw new Error('Failed to save idea');
        }
      }
    } catch (error: any) {
      console.error('Error saving idea:', error);
      
      // Provide more helpful error messages
      if (error.message.includes('duplicate key')) {
        setError('You already have an idea with this title. Please use a different title.');
      } else if (error.message.includes('violates foreign key constraint')) {
        setError('There was an issue with the database relationships. Your progress is saved locally.');
      } else if (error.message.includes('permission denied')) {
        setError('You don\'t have permission to save this idea. Please check your account status.');
      } else if (saveAttempts > 2) {
        setError(`Persistent error saving to database. Your progress is saved locally. Technical details: ${error.message}`);
      } else {
        setError(`Error saving idea: ${error.message}. Your progress is saved locally.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Force re-render when step changes
  const [key, setKey] = useState(0);
  
  // Update key when currentStep changes to force re-render
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
    console.log('Step changed to:', currentStep, 'with key:', key + 1);
  }, [currentStep]);
  
  // Auto-save to localStorage periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveToLocalStorage();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [saveToLocalStorage]);
  
  const renderCurrentStep = () => {
    console.log('Rendering step:', currentStep, 'with key:', key);
    
    // Force a direct approach to rendering the components
    switch (currentStep) {
      case 0:
        return <BasicIdeaInfo key={`basic-info-${key}`} />;
      case 1:
        console.log('Rendering ConceptVariations component');
        return <ConceptVariations key={`concept-variations-${key}`} />;
      case 2:
        return <BusinessModelGenerator key={`business-model-${key}`} />;
      case 3:
        return <DetailedRefinement key={`detailed-refinement-${key}`} />;
      case 4:
        return <ComponentVariations key={`component-variations-${key}`} />;
      default:
        console.log('Default case, rendering BasicIdeaInfo');
        return <BasicIdeaInfo key={`basic-info-default-${key}`} />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Lightbulb className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-2 text-lg font-medium text-gray-900">
              Idea Refinement
            </h2>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
        
        {/* Step Indicator */}
        <StepIndicator steps={steps} />

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation */}
        <div className="mt-8">
          <StepNavigation 
            onSave={handleSave}
            nextLabel={
              currentStep === 0 ? "Continue to Concept Variations" :
              currentStep === 1 ? "Continue to Business Model" :
              currentStep === 2 ? "Continue to Detailed Refinement" :
              currentStep === 3 ? "Continue to Component Variations" : 
              "Next"
            }
            previousLabel={
              currentStep === 1 ? "Back to Basic Info" :
              currentStep === 2 ? "Back to Concept Variations" :
              currentStep === 3 ? "Back to Business Model" :
              currentStep === 4 ? "Back to Detailed Refinement" :
              "Back"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default IdeaRefinementWorkflow;
