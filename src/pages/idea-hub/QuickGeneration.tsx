import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography, Container, Paper } from '@mui/material';
import { ArrowRight, Save, Lightbulb } from 'lucide-react';
import SaveIdeaModal from '../../components/idea-playground/SaveIdeaModal';
import { useAuthStore } from '../../lib/store';
import SuggestionsScreen from '../../components/idea-playground/pathway1/SuggestionsScreen';
import { Suggestion } from '../../components/idea-playground/pathway1/SuggestionCard';
import IdeaCaptureScreen from '../../components/idea-playground/pathway1/IdeaCaptureScreen';
import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';
import { ideaPlaygroundAdapter } from '../../lib/services/idea-playground/service-adapter';
import { AIContextProvider } from '../../lib/services/ai/ai-context-provider';

// Define the steps in the quick generation workflow
enum WorkflowStep {
  CAPTURE_IDEA = 'capture_idea',
  SUGGESTIONS = 'suggestions',
  COMPLETE = 'complete'
}

const QuickGeneration: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.CAPTURE_IDEA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [idea, setIdea] = useState<IdeaPlaygroundIdea | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  
  // We need to use a safe userId for all operations
  const safeUserId = user?.id || 'anonymous';

  // Handle the initial idea capture - match IdeaCaptureScreen's expected interface
  const handleCreateIdea = async (initialIdeaData: { 
    title: string; 
    description: string; 
    solution_concept?: string;
    used_company_context?: boolean;
    company_id?: string;
  }, event?: React.FormEvent) => {
    // If an event was passed, prevent default behavior
    if (event instanceof Event) {
      event.preventDefault();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("QuickGeneration: Creating idea");
      
      // Create the idea using the adapter service with compatible format
      const ideaToCreate: Partial<IdeaPlaygroundIdea> = {
        title: initialIdeaData.title,
        description: initialIdeaData.description,
        solution_concept: initialIdeaData.solution_concept || '',
        problem_statement: '', // Added to ensure we have required fields
        target_audience: [], // Initialize as empty array to match type
        unique_value: '',
      };
      
      const result = await ideaPlaygroundAdapter.createIdea(ideaToCreate, safeUserId);
      
      console.log("QuickGeneration: Idea created successfully, ID:", result.id);

      // Set the idea in state
      setIdea(result as any);
      
      // Move to the suggestions step within this component
      console.log("QuickGeneration: Moving to suggestions step");
      setCurrentStep(WorkflowStep.SUGGESTIONS);
      
      return result;
    } catch (err) {
      console.error('Error creating idea:', err);
      setError('Failed to create idea. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion selection and completion
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    // Set the selected suggestion
    setSelectedSuggestion(suggestion);
    
    // Update the idea with the selected suggestion details
    if (idea) {
      // Convert target_audience from string to string[] to match IdeaPlaygroundIdea type
      const targetAudienceArray = suggestion.target_audience ? 
        [suggestion.target_audience] : 
        [];
      
      const updatedIdea = {
        ...idea,
        title: suggestion.title,
        description: suggestion.description,
        problem_statement: suggestion.problem_statement,
        solution_concept: suggestion.solution_concept,
        target_audience: targetAudienceArray, // Use the array version
        unique_value: suggestion.unique_value,
        business_model: suggestion.business_model
      };
      
      // Update the idea in the database
      ideaPlaygroundAdapter.updateIdea(idea.id, updatedIdea)
        .then(() => {
          // Move to the complete step
          setCurrentStep(WorkflowStep.COMPLETE);
        })
        .catch(err => {
          console.error('Error updating idea with suggestion:', err);
          setError('Failed to save your selected idea. Please try again.');
        });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === WorkflowStep.SUGGESTIONS) {
      setCurrentStep(WorkflowStep.CAPTURE_IDEA);
    } else {
      // If we're already at the first step, go back to the idea selection screen
      navigate('/idea-playground');
    }
  };

  // Render the appropriate step
  // This effect forces a re-render when idea data changes
  useEffect(() => {
    if (idea && currentStep === WorkflowStep.SUGGESTIONS) {
      console.log("QuickGeneration: Idea data ready for suggestions step:", idea.id);
    }
  }, [idea, currentStep]);

  const renderStep = () => {
    // Display loading spinner for any async operations
    if (isLoading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
          <CircularProgress size={60} />
          <Typography variant="h6" mt={2}>Processing...</Typography>
        </Box>
      );
    }

    console.log("QuickGeneration: Rendering step:", currentStep, idea?.id);
    
    switch (currentStep) {
      case WorkflowStep.CAPTURE_IDEA:
        return (
          // Using the AIContextProvider needed by IdeaCaptureScreen
          <AIContextProvider>
            <IdeaCaptureScreen 
              onCreateIdea={(ideaData, event) => handleCreateIdea(ideaData, event)}
            />
          </AIContextProvider>
        );
      
      case WorkflowStep.SUGGESTIONS:
        // Add failsafe debug check
        if (!idea) {
          console.error("QuickGeneration: No idea data in suggestions step!");
          return (
            <Box p={4} textAlign="center">
              <Typography color="error">
                No idea data available. Please go back and try again.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCurrentStep(WorkflowStep.CAPTURE_IDEA)}
                sx={{ mt: 2 }}
              >
                Go Back
              </Button>
            </Box>
          );
        }
        
        console.log("QuickGeneration: Rendering SuggestionsScreen with idea:", idea.id);
        
        return (
          <SuggestionsScreen 
            idea={idea}
            userId={safeUserId}
            onNext={handleSelectSuggestion}
            onBack={handleBack}
          />
        );
      
      case WorkflowStep.COMPLETE:
        return (
          <Box p={4}>
            <Typography variant="h5" gutterBottom>Idea Generated!</Typography>
            
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedSuggestion?.title || idea?.title || 'Your Idea'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {selectedSuggestion?.description || idea?.description || 'No description provided.'}
              </Typography>
              
              <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/idea-hub')}
                >
                  Return to Idea Hub
                </Button>
                
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setShowSaveModal(true)}
                    startIcon={<Save />}
                  >
                    Save Idea
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      // Navigate to detailed generation with the current idea ID
                      if (idea) {
                        navigate(`/idea-hub/playground/pathway/1?ideaId=${idea.id}`);
                      } else {
                        console.error("No idea ID available for detailed generation");
                        setError("Cannot continue to detailed generation: Missing idea data");
                      }
                    }}
                    startIcon={<ArrowRight />}
                  >
                    Continue to Detailed Generation
                  </Button>
                </Box>
              </Box>
              
              <Box mt={4} pt={3} borderTop="1px solid" borderColor="divider">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    // Navigate to refinement with the current idea ID
                    if (idea) {
                      navigate(`/idea-hub/refinement?step=1&ideaId=${idea.id}`);
                    } else {
                      console.error("No idea ID available for refinement");
                      setError("Cannot continue to refinement: Missing idea data");
                    }
                  }}
                  startIcon={<Lightbulb />}
                  fullWidth
                >
                  Continue to Idea Refinement
                </Button>
              </Box>
            </Paper>
            
            {/* Save Idea Modal */}
            {idea && (
              <SaveIdeaModal
                open={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                idea={idea}
                onSave={async (updatedIdea) => {
                  try {
                    await ideaPlaygroundAdapter.updateIdea(idea.id, updatedIdea);
                    // Update the local idea state with the saved changes
                    setIdea({...idea, ...updatedIdea});
                  } catch (error) {
                    console.error('Error saving idea:', error);
                    setError('Failed to save idea. Please try again.');
                  }
                }}
              />
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Quick Idea Generation
        </Typography>
        
        {error && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'error.light', 
              color: 'error.contrastText' 
            }}
          >
            <Typography variant="body1">{error}</Typography>
          </Paper>
        )}
        
        {renderStep()}
      </Box>
    </Container>
  );
};

export default QuickGeneration;
