import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '../../ErrorBoundary';
import { Box, Paper, Typography, CircularProgress, Button, Alert } from '@mui/material';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import { 
  IdeaPathwayStep, 
  IdeaVariation, 
  MergedIdea,
  IdeaPathwayState,
  IdeaVariationParams,
  IdeaMergeParams
} from '../../../lib/types/idea-pathway.types';
import { ideaPlaygroundPathwayService } from '../../../lib/services/idea-playground-pathway.service';
import IdeaVariationList from './IdeaVariationList';
import MergedIdeaList from './MergedIdeaList';
import PathwayNavigation from './PathwayNavigation';
import PathwayStepIndicator from './PathwayStepIndicator';

interface IdeaPathwayWorkflowProps {
  canvasId: string;
  initialIdea: IdeaPlaygroundIdea;
  userId: string;
  onComplete: (finalIdea: IdeaPlaygroundIdea | IdeaVariation | MergedIdea) => void;
  onClose: () => void;
  saveVariationAsIdea: (userId: string, canvasId: string, variation: IdeaVariation) => Promise<IdeaPlaygroundIdea>;
  saveMergedIdeaAsIdea: (userId: string, canvasId: string, mergedIdea: MergedIdea) => Promise<IdeaPlaygroundIdea>;
  updateIdeaStatus: (ideaId: string, status: string) => Promise<boolean>;
  generateVariations?: (userId: string, params: IdeaVariationParams) => Promise<IdeaVariation[]>;
  updateVariationSelection?: (variationId: string, isSelected: boolean) => Promise<boolean>;
  mergeSelectedVariations?: (userId: string, params: IdeaMergeParams) => Promise<MergedIdea[]>;
  getMergedIdeasForCanvas?: (canvasId: string) => Promise<MergedIdea[]>;
}

const IdeaPathwayWorkflow: React.FC<IdeaPathwayWorkflowProps> = ({ 
  canvasId, 
  initialIdea,
  userId,
  onComplete,
  onClose,
  saveVariationAsIdea,
  saveMergedIdeaAsIdea,
  updateIdeaStatus,
  generateVariations,
  updateVariationSelection,
  mergeSelectedVariations,
  getMergedIdeasForCanvas
}) => {
  const [state, setState] = useState<IdeaPathwayState>({
    currentStep: IdeaPathwayStep.INITIAL_IDEA,
    selectedIdea: initialIdea,
    variations: [],
    selectedVariations: [],
    mergedIdeas: [],
    selectedMergedIdea: null,
    isLoading: false
  });

  const [error, setError] = useState<string | null>(null);

  // Generate variations when entering the variations step
  useEffect(() => {
    if (state.currentStep === IdeaPathwayStep.VARIATIONS && state.variations.length === 0) {
      generateVariationsHandler();
    }
  }, [state.currentStep]);

  // Generate merged ideas when entering the merge step
  useEffect(() => {
    if (state.currentStep === IdeaPathwayStep.MERGE && 
        state.selectedVariations.length >= 2 && 
        state.mergedIdeas.length === 0) {
      mergeSelectedVariationsHandler();
    }
  }, [state.currentStep, state.selectedVariations]);

  // Generate variations for the initial idea
  const generateVariationsHandler = async () => {
    // Validate the selected idea
    if (!state.selectedIdea) {
      console.error('No selected idea available for generating variations');
      setError('No idea selected. Please try again.');
      return;
    }
    
    if (!state.selectedIdea.id) {
      console.error('Selected idea has no ID:', state.selectedIdea);
      setError('Invalid idea data. Please try again with a different idea.');
      return;
    }
    
    // Set loading state
    setState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    console.log('Generating variations for idea:', state.selectedIdea);
    console.log('Using user ID:', userId);
    
    try {
      // Explicitly check if generateVariations is provided
      let genVariations;
      if (typeof generateVariations === 'function') {
        console.log('Using provided generateVariations function');
        genVariations = generateVariations;
      } else {
        console.log('Falling back to ideaPlaygroundPathwayService.generateIdeaVariations');
        if (!ideaPlaygroundPathwayService || !ideaPlaygroundPathwayService.generateIdeaVariations) {
          throw new Error('Service not available: ideaPlaygroundPathwayService.generateIdeaVariations');
        }
        genVariations = ideaPlaygroundPathwayService.generateIdeaVariations;
      }
      
      // Prepare parameters
      const params = {
        idea_id: state.selectedIdea.id,
        count: 5
      };
      console.log('Variation params:', params);
      
      // Call the function with debugging
      console.log('Calling variation generation function...');
      const variations = await genVariations(userId, params);
      console.log('Variations received:', variations);
      
      if (!variations || !Array.isArray(variations)) {
        throw new Error('Invalid variations response: ' + JSON.stringify(variations));
      }
      
      // Update state with the received variations
      setState(prev => ({ 
        ...prev, 
        variations: variations,
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(`Failed to generate idea variations: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle selection of variations
  const handleVariationSelect = async (variationId: string, isSelected: boolean) => {
    try {
      // Use the provided function if available, otherwise fallback to the service
      const updateSelection = updateVariationSelection || ideaPlaygroundPathwayService.updateVariationSelection;
      await updateSelection(variationId, isSelected);
      
      setState(prev => {
        const selectedVariations = isSelected 
          ? [...prev.selectedVariations, variationId]
          : prev.selectedVariations.filter(id => id !== variationId);
          
        return { 
          ...prev, 
          selectedVariations,
          variations: prev.variations.map(v => 
            v.id === variationId ? { ...v, is_selected: isSelected } : v
          )
        };
      });
    } catch (err) {
      console.error('Error updating variation selection:', err);
      setError('Failed to update selection. Please try again.');
    }
  };

  // Merge selected variations
  const mergeSelectedVariationsHandler = async () => {
    if (state.selectedVariations.length < 2) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      // Use the provided function if available, otherwise fallback to the service
      const mergeFn = mergeSelectedVariations || ideaPlaygroundPathwayService.mergeSelectedVariations;
      const mergedIdeas = await mergeFn(userId, {
        variation_ids: state.selectedVariations,
        canvas_id: canvasId,
        count: 2
      });
      
      setState(prev => ({ 
        ...prev, 
        mergedIdeas,
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error merging variations:', err);
      setError('Failed to merge selected variations. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle selection of merged idea
  const handleMergedIdeaSelect = (mergedIdeaId: string) => {
    setState(prev => ({
      ...prev,
      selectedMergedIdea: mergedIdeaId,
      mergedIdeas: prev.mergedIdeas.map(idea => ({
        ...idea,
        is_selected: idea.id === mergedIdeaId
      }))
    }));
  };

  // Save the selected variation as a final idea
  const saveVariationAsIdeaHandler = async (variationId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      const variation = state.variations.find(v => v.id === variationId);
      if (!variation) throw new Error('Variation not found');
      
      // Use the provided saveVariationAsIdea function
      const finalIdea = await saveVariationAsIdea(userId, canvasId, variation);
      
      // Call the provided onComplete callback
      onComplete(finalIdea);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error saving variation as idea:', err);
      setError('Failed to save the selected variation. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Save the selected merged idea as a final idea
  const saveMergedIdeaAsIdeaHandler = async (mergedIdeaId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      const mergedIdea = state.mergedIdeas.find(idea => idea.id === mergedIdeaId);
      if (!mergedIdea) throw new Error('Merged idea not found');
      
      // Use the provided saveMergedIdeaAsIdea function
      const finalIdea = await saveMergedIdeaAsIdea(userId, canvasId, mergedIdea);
      
      // Call the provided onComplete callback
      onComplete(finalIdea);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
    } catch (err) {
      console.error('Error saving merged idea:', err);
      setError('Failed to save the merged idea. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle next step in the pathway
  const handleNext = () => {
    const currentStep = state.currentStep;
    
    // Define the next step based on the current step
    let nextStep: IdeaPathwayStep;
    
    switch (currentStep) {
      case IdeaPathwayStep.INITIAL_IDEA:
        nextStep = IdeaPathwayStep.VARIATIONS;
        break;
      case IdeaPathwayStep.VARIATIONS:
        if (state.selectedVariations.length === 1) {
          // If only one variation is selected, skip to final selection
          nextStep = IdeaPathwayStep.FINAL_SELECTION;
        } else {
          nextStep = IdeaPathwayStep.SELECTION;
        }
        break;
      case IdeaPathwayStep.SELECTION:
        nextStep = IdeaPathwayStep.MERGE;
        break;
      case IdeaPathwayStep.MERGE:
        nextStep = IdeaPathwayStep.FINAL_SELECTION;
        break;
      default:
        nextStep = currentStep;
    }
    
    setState(prev => ({ ...prev, currentStep: nextStep }));
  };

  // Handle back step in the pathway
  const handleBack = () => {
    const currentStep = state.currentStep;
    
    // Define the previous step based on the current step
    let prevStep: IdeaPathwayStep;
    
    switch (currentStep) {
      case IdeaPathwayStep.VARIATIONS:
        prevStep = IdeaPathwayStep.INITIAL_IDEA;
        break;
      case IdeaPathwayStep.SELECTION:
        prevStep = IdeaPathwayStep.VARIATIONS;
        break;
      case IdeaPathwayStep.MERGE:
        prevStep = IdeaPathwayStep.SELECTION;
        break;
      case IdeaPathwayStep.FINAL_SELECTION:
        if (state.selectedVariations.length === 1) {
          // If only one variation was selected, go back to variations
          prevStep = IdeaPathwayStep.VARIATIONS;
        } else {
          prevStep = IdeaPathwayStep.MERGE;
        }
        break;
      default:
        prevStep = currentStep;
    }
    
    setState(prev => ({ ...prev, currentStep: prevStep }));
  };

  // Complete the pathway and save the final idea
  const handleComplete = () => {
    if (state.selectedMergedIdea) {
      saveMergedIdeaAsIdeaHandler(state.selectedMergedIdea);
    } else if (state.selectedVariations.length === 1) {
      saveVariationAsIdeaHandler(state.selectedVariations[0]);
    }
  };

  // Check if next button should be disabled
  const isNextDisabled = () => {
    switch (state.currentStep) {
      case IdeaPathwayStep.VARIATIONS:
        return state.selectedVariations.length === 0;
      case IdeaPathwayStep.SELECTION:
        return state.selectedVariations.length < 2;
      case IdeaPathwayStep.MERGE:
        return !state.selectedMergedIdea;
      default:
        return false;
    }
  };

  // Check if complete button should be displayed
  const showCompleteButton = state.currentStep === IdeaPathwayStep.FINAL_SELECTION;

  // Render content based on current step
  const renderStepContent = () => {
    switch (state.currentStep) {
      case IdeaPathwayStep.INITIAL_IDEA:
        return (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Initial Idea</Typography>
            <Typography variant="body1">{state.selectedIdea?.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {state.selectedIdea?.description}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={handleNext}
            >
              Generate Variations
            </Button>
          </Box>
        );
      
      case IdeaPathwayStep.VARIATIONS:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Idea Variations
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select one or more variations to explore further.
            </Typography>
            
            {state.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <IdeaVariationList 
                variations={state.variations} 
                onSelectVariation={handleVariationSelect}
              />
            )}
          </Box>
        );
      
      case IdeaPathwayStep.SELECTION:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Variations
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Review your selected variations before merging them.
            </Typography>
            
            <IdeaVariationList 
              variations={state.variations.filter(v => state.selectedVariations.includes(v.id))} 
              onSelectVariation={handleVariationSelect}
              readOnly
            />
          </Box>
        );
      
      case IdeaPathwayStep.MERGE:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Merged Ideas
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select one of the merged ideas to finalize.
            </Typography>
            
            {state.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <MergedIdeaList 
                mergedIdeas={state.mergedIdeas} 
                onSelectMergedIdea={handleMergedIdeaSelect}
              />
            )}
          </Box>
        );
      
      case IdeaPathwayStep.FINAL_SELECTION:
        const selectedIdea = state.selectedMergedIdea 
          ? state.mergedIdeas.find(idea => idea.id === state.selectedMergedIdea)
          : state.variations.find(v => v.id === state.selectedVariations[0]);
        
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Final Selection
            </Typography>
            
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h5" gutterBottom>
                {selectedIdea?.title}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {selectedIdea?.description}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Problem Statement
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedIdea?.problem_statement}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Solution Concept
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedIdea?.solution_concept}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Target Audience
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedIdea?.target_audience}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Unique Value Proposition
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedIdea?.unique_value}
              </Typography>
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error" gutterBottom>
              An error occurred in the Idea Pathway
            </Typography>
            <Typography variant="body1" paragraph>
              There was a problem displaying the pathway interface. This might be related to the navigation state.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onClose}
              sx={{ mt: 2 }}
            >
              Return to Idea Playground
            </Button>
          </Paper>
        </Box>
      }
    >
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <PathwayStepIndicator currentStep={state.currentStep} />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
        
        <PathwayNavigation 
          currentStep={state.currentStep}
          handleNext={handleNext}
          handleBack={handleBack}
          handleComplete={handleComplete}
          disableNext={isNextDisabled()}
          showComplete={showCompleteButton}
          isLoading={state.isLoading}
        />
      </Paper>
    </Box>
    </ErrorBoundary>
  );
};

export default IdeaPathwayWorkflow;
