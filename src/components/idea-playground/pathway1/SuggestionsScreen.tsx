import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Box, Paper, Grid, CircularProgress, LinearProgress, alpha } from '@mui/material';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';
import SuggestionCard, { Suggestion } from './SuggestionCard';
import SuggestionMerger from './SuggestionMerger';
import SuggestionEditor from './SuggestionEditor';
import { ideaPathway1AIService } from '../../../lib/services/idea-pathway1-ai.service';
import { sequentialGenerationService } from '../../../lib/services/idea-playground/ai';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MergeIcon from '@mui/icons-material/Merge';

interface SuggestionsScreenProps {
  idea: IdeaPlaygroundIdea;
  userId: string;
  onNext: (selectedSuggestion: Suggestion) => void;
  onBack: () => void;
}

const SuggestionsScreen: React.FC<SuggestionsScreenProps> = ({ idea, userId, onNext, onBack }) => {
  // State for suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
  const [mergedSuggestion, setMergedSuggestion] = useState<Suggestion | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [showingMockData, setShowingMockData] = useState<boolean>(false);
  
  // Sequential generation tracking
  const [generationQueue, setGenerationQueue] = useState<number[]>([]);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalToGenerate, setTotalToGenerate] = useState<number>(5);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for timeouts and aborts
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Generate suggestions when component mounts
  useEffect(() => {
    console.log("SuggestionsScreen: Component mounted with idea:", idea?.id);
    if (idea) {
      generateSuggestions();
    } else {
      console.error("SuggestionsScreen: No idea data provided to component");
      setIsLoading(false);
      setError('Cannot generate suggestions: Missing idea data');
    }
  }, [idea]);

  // Function to fetch idea and generate suggestions
  const fetchIdeaAndGenerateSuggestions = async () => {
    if (!idea) {
      setError('Cannot generate suggestions: Missing idea data');
      return;
    }
    
      setIsLoading(true);
    setError(null);
    
    try {
      // Generate suggestions
      await generateSuggestions();
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate suggestions sequentially one by one using our new modular service
  const generateSequentialSuggestions = async () => {
    if (!idea) {
      console.error('Cannot generate sequential suggestions: idea is undefined or null');
      setError('Cannot generate suggestions: Missing idea data');
      setIsLoading(false);
      return;
    }

    // Prevent duplicate calls while generating
    if (isGeneratingAI) {
      console.log('Already generating suggestions, skipping duplicate call');
      return;
    }

    // Reset states
    setIsLoading(true);
    setError(null);
    setIsGeneratingAI(true);
    setShowingMockData(false);
    setSuggestions([]);
    setSelectedSuggestions([]);
    setMergedSuggestion(null);
    setCompletedCount(0);
    
    // Generate between 3-5 suggestions
    // The sequential service will enforce these bounds internally as well
    const numToGenerate = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
    console.log(`Requesting ${numToGenerate} AI-generated suggestions`);
    setTotalToGenerate(numToGenerate);
    
    try {
      // Get a safe userId or use anonymous as fallback
      const safeUserId = userId || 'anonymous';
      
      // Use the modular sequential generation service to generate suggestions
      // Handle progress through the callback
      await sequentialGenerationService.generateSuggestionsSequentially(
        idea,
        safeUserId,
        numToGenerate,
        (suggestion, isMock, index, total) => {
          // Update the current generating index
          setGeneratingIndex(index);
          
          // Add the suggestion to our results
          setSuggestions(prev => [...prev, suggestion]);
          setCompletedCount(prev => prev + 1);
          
          // If this is a mock suggestion, update the showingMockData flag
          if (isMock && !showingMockData) {
            setShowingMockData(true);
          }
          
          // When all done, set the generating index to null
          if (index === total - 1) {
            setGeneratingIndex(null);
          }
        }
      );
    } catch (error) {
      console.error('Error in sequential generation:', error);
      
      // Set an error message but don't clear suggestions we might have already generated
      if (suggestions.length === 0) {
        setError('Failed to generate suggestions. Please try again later.');
        // Fall back to mock data if we have no suggestions
        generateMockSuggestions();
      } else if (!error) {
        setError('Some suggestions failed to generate.');
      }
    } finally {
      // Done generating
      setIsGeneratingAI(false);
      setIsLoading(false);
    }
  };

  // Main function to trigger suggestion generation
  const generateSuggestions = async () => {
    // Safety check - if this method is called without idea, just return
    if (!idea) {
      console.error('Cannot generate suggestions: idea is undefined or null');
      setError('Cannot generate suggestions: Missing idea data');
      setIsLoading(false);
      return;
    }

    // Prevent duplicate calls while generating
    if (isGeneratingAI) {
      console.log('Already generating suggestions, skipping duplicate call');
      return;
    }

    // Generate sequentially by default
    await generateSequentialSuggestions();
  };
  
  // Generate mock suggestions as fallback - ONLY when all AI generation fails
  const generateMockSuggestions = () => {
    console.log('Generating mock suggestions as fallback - no AI suggestions available');
    setShowingMockData(true);
    
    // We should ONLY show mock suggestions if we have NO real AI suggestions
    if (suggestions.length > 0) {
      console.warn('Refusing to mix AI and mock suggestions - keeping existing AI suggestions');
      return;
    }
    
    // Generate a reasonable number of mock suggestions - not too many
    const mockCount = Math.min(4, Math.max(3, Math.floor(Math.random() * 2) + 3));
    console.log(`Generating ${mockCount} mock suggestions`);
    
    // Access the mock generator method
    let mockSuggestions;
    try {
      // Use the public mock generator method
      mockSuggestions = ideaPathway1AIService.generateMockSuggestionsPublic(idea, mockCount);
    } catch (err) {
      console.warn('Could not access generateMockSuggestions, using fallback implementation');
      
      // Fallback implementation in case the service method cannot be accessed
      mockSuggestions = generateLocalMockSuggestions(idea, mockCount);
    }
    
    // Set the mock suggestions only if we have none already
    setSuggestions(mockSuggestions);
    setSelectedSuggestions([]);
    setMergedSuggestion(null);
    
    // Update total count to match what we actually generated
    setTotalToGenerate(mockSuggestions.length);
    setCompletedCount(mockSuggestions.length);
  };
  
  // Local implementation of mock suggestions as a final fallback
  const generateLocalMockSuggestions = (idea: IdeaPlaygroundIdea, count: number): Suggestion[] => {
    const mockSuggestions: Suggestion[] = [];

    // Default values to use if idea is null or undefined
    const defaultTitle = 'Business Idea';
    const defaultDescription = 'A new business concept';
    const defaultProblemStatement = 'Problem statement not available';
    const defaultSolutionConcept = 'Solution concept not available';

    // Safely get properties with fallbacks
    const ideaTitle = idea?.title || defaultTitle;
    const ideaDescription = idea?.description || defaultDescription;
    const ideaProblemStatement = idea?.problem_statement || defaultProblemStatement;
    const ideaSolutionConcept = idea?.solution_concept || defaultSolutionConcept;

    const variants = [
      { suffix: 'Premium Edition', audience: 'Enterprise customers', model: 'Subscription' },
      { suffix: 'Lite Version', audience: 'Individual users', model: 'Freemium' },
      { suffix: 'Pro Edition', audience: 'Professional users', model: 'One-time purchase' },
      { suffix: 'Community Edition', audience: 'Communities and non-profits', model: 'Open source with paid support' },
      { suffix: 'Enterprise Solution', audience: 'Large corporations', model: 'Annual licensing' }
    ];

    // Limit to requested count and no more than 4 mock suggestions
    const limitedCount = Math.min(count, variants.length, 4);
    
    // Generate the limited number of suggestions
    for (let i = 0; i < limitedCount; i++) {
      const variant = variants[i];

      mockSuggestions.push({
        title: `${ideaTitle} - ${variant.suffix}`,
        description: `A ${variant.suffix.toLowerCase()} of ${ideaTitle} targeting ${variant.audience.toLowerCase()}.`,
        problem_statement: ideaProblemStatement,
        solution_concept: ideaSolutionConcept,
        target_audience: variant.audience,
        unique_value: `Specialized features for ${variant.audience.toLowerCase()}`,
        business_model: `${variant.model} model`,
        marketing_strategy: 'Digital marketing and industry partnerships',
        revenue_model: variant.model,
        go_to_market: 'Targeted launch to early adopters',
        market_size: 'Market size will depend on specific segment targeting',
        competition: ['Competitor A', 'Competitor B', 'Competitor C'],
        revenue_streams: ['Primary Revenue', 'Secondary Revenue', 'Tertiary Revenue'],
        cost_structure: ['Development', 'Marketing', 'Operations', 'Customer Support'],
        key_metrics: ['User Acquisition', 'Retention Rate', 'Revenue Per User', 'Customer Lifetime Value'],
        // SWOT fields kept but minimized - will be implemented later
        strengths: [''],
        weaknesses: [''],
        opportunities: [''],
        threats: ['']
      });
    }

    return mockSuggestions;
  };

  // Toggle suggestion selection
  const toggleSuggestionSelection = (suggestion: Suggestion) => {
    // If already selected, remove from selection
    if (selectedSuggestions.some(s => s.title === suggestion.title)) {
      setSelectedSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
    } else {
      // Otherwise, add to selection
      setSelectedSuggestions(prev => [...prev, suggestion]);
    }
  };

  // Start the merging process
  const startMerging = () => {
    setIsMerging(true);
  };

  // Cancel merging process
  const cancelMerging = () => {
    setIsMerging(false);
  };
  
  // Start editing a suggestion
  const startEditing = (suggestion: Suggestion) => {
    setEditingSuggestion(suggestion);
    setIsEditing(true);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingSuggestion(null);
    setIsEditing(false);
  };
  
  // Save edited suggestion
  const saveEditedSuggestion = (editedSuggestion: Suggestion) => {
    // Find and replace the suggestion in the suggestions array
    setSuggestions(prev => 
      prev.map(s => s.title === editingSuggestion?.title ? editedSuggestion : s)
    );
    
    // If the edited suggestion was selected, update the selection
    if (selectedSuggestions.some(s => s.title === editingSuggestion?.title)) {
      setSelectedSuggestions(prev => 
        prev.map(s => s.title === editingSuggestion?.title ? editedSuggestion : s)
      );
    }
    
    // Reset editing state
    setIsEditing(false);
    setEditingSuggestion(null);
  };

  // Save merged suggestion and proceed
  const saveMergedSuggestion = (suggestion: Suggestion) => {
    setMergedSuggestion(suggestion);
    setIsMerging(false);
    
    // If onNext is provided, proceed with the merged suggestion
    if (onNext) {
      onNext(suggestion);
    }
  };

  // Handle continuing with a single suggestion
  const continueWithSuggestion = (suggestion: Suggestion) => {
    if (onNext) {
      onNext(suggestion);
    }
  };

  // Loading state - only show completed suggestions as they arrive
  if (isLoading) {
    return (
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        maxWidth: '1400px', 
        mx: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' 
      }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            p: 4, 
            mb: 4,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(90deg, #2196f3, #1565c0)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block'
            }}
          >
            Generating Business Ideas
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: '600px',
              mb: 4,
              lineHeight: 1.6
            }}
          >
            AI is creating customized business idea variations based on your concept.
            {suggestions.length > 0 && " Each idea appears below when it's ready."}
            {suggestions.length > 0 && isGeneratingAI && 
              " Using only AI-generated ideas - no examples."
            }
          </Typography>
          
          <Box sx={{ width: '100%', maxWidth: '500px', mt: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1,
                alignItems: 'center'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: 'text.primary'
                }}
              >
                Progress: {completedCount} of {totalToGenerate} ideas
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: showingMockData ? 'warning.main' : 'primary.main',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showingMockData ? (
                  <>
                    <PriorityHighIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Examples
                  </>
                ) : (
                  <>
                    <EmojiObjectsIcon fontSize="small" sx={{ mr: 0.5 }} />
                    AI-generated
                  </>
                )}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={(completedCount / totalToGenerate) * 100} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: alpha('#e3f2fd', 0.5),
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                  borderRadius: 5
                }
              }}
            />
            
            {generatingIndex !== null && (
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1.5, 
                  display: 'block',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  textAlign: 'center'
                }}
              >
                Creating idea variation #{generatingIndex + 1}...
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Show only completed suggestions as they arrive, without placeholders */}
        {suggestions.length > 0 && (
          <>
            <Box 
              sx={{ 
                mb: 3, 
                pb: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  mb: 1
                }}
              >
                Ideas Generated So Far
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  maxWidth: '800px',
                  lineHeight: 1.6
                }}
              >
                Review these idea variations as they're created. You can select, edit, or continue with any suggestion.
              </Typography>
            </Box>
            
            <Grid 
              container 
              spacing={3} 
              sx={{ mb: 4 }}
            >
              {suggestions.map((suggestion, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <SuggestionCard 
                    suggestion={suggestion} 
                    isSelected={selectedSuggestions.some(s => s.title === suggestion.title)}
                    onSelect={() => toggleSuggestionSelection(suggestion)}
                    onContinue={() => continueWithSuggestion(suggestion)}
                    onEdit={() => startEditing(suggestion)}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    );
  }

  // Error state
  if (error && suggestions.length === 0) {
    return (
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        maxWidth: '1400px', 
        mx: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            bgcolor: alpha('#f44336', 0.05),
            border: '1px solid',
            borderColor: 'error.main',
            maxWidth: '500px',
            width: '100%'
          }}
        >
          <PriorityHighIcon 
            color="error" 
            sx={{ 
              fontSize: 56,
              mb: 2,
              opacity: 0.7
            }}
          />
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'error.main', 
              fontWeight: 600,
              mb: 2
            }}
          >
            Unable to Generate Ideas
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              lineHeight: 1.6
            }}
          >
            {error}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchIdeaAndGenerateSuggestions}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                minWidth: '120px',
                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
              }}
              startIcon={<EmojiObjectsIcon />}
            >
              Try Again
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={onBack} 
              sx={{ 
                px: 3,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 500,
                minWidth: '120px'
              }}
              startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Merging interface
  if (isMerging) {
    return (
      <SuggestionMerger 
        suggestions={selectedSuggestions} 
        onSave={saveMergedSuggestion}
        onCancel={cancelMerging}
      />
    );
  }
  
  // Editing interface
  if (isEditing && editingSuggestion) {
    return (
      <SuggestionEditor
        suggestion={editingSuggestion}
        onSave={saveEditedSuggestion}
        onCancel={cancelEditing}
      />
    );
  }

  // Main suggestion selection interface
  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      maxWidth: '1400px', 
      mx: 'auto', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        mb: 4, 
        pb: 3, 
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 1.5,
            background: 'linear-gradient(90deg, #2196f3, #1565c0)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block'
          }}
        >
          Business Idea Variations
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: '800px',
            lineHeight: 1.6
          }}
        >
          We've generated multiple variations of your business idea. Select one to continue, or select multiple to merge them together.
        </Typography>
      </Box>
      
      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: showingMockData ? alpha('#ff9800', 0.1) : alpha('#f44336', 0.1), 
            border: '1px solid',
            borderColor: showingMockData ? 'warning.main' : 'error.main',
            color: showingMockData ? 'warning.dark' : 'error.dark' 
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontWeight: 500,
              mb: 1
            }}
          >
            {showingMockData ? (
              <PriorityHighIcon color="warning" sx={{ mr: 1 }} />
            ) : (
              <PriorityHighIcon color="error" sx={{ mr: 1 }} />
            )}
            {error}
          </Typography>
          
          <Button 
            variant="contained" 
            size="medium" 
            color={showingMockData ? "warning" : "error"}
            sx={{ 
              mt: 1.5,
              fontWeight: 500,
              px: 3
            }} 
            onClick={generateSuggestions}
            disabled={isGeneratingAI}
          >
            Try Again with AI
          </Button>
          
          {showingMockData && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2,
                fontStyle: 'italic',
                color: 'warning.dark'
              }}
            >
              Currently showing example ideas to help you get started
            </Typography>
          )}
        </Paper>
      )}

      <Grid 
        container 
        spacing={3} 
        sx={{ 
          flexGrow: 1,
          mb: 4
        }}
      >
        {suggestions.map((suggestion, index) => (
          <Grid item xs={12} md={6} key={index}>
            <SuggestionCard 
              suggestion={suggestion} 
              isSelected={selectedSuggestions.some(s => s.title === suggestion.title)}
              onSelect={() => toggleSuggestionSelection(suggestion)}
              onContinue={() => continueWithSuggestion(suggestion)}
              onEdit={() => startEditing(suggestion)}
            />
          </Grid>
        ))}
      </Grid>

      <Box 
        sx={{
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 'auto',
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button 
          variant="outlined" 
          onClick={onBack}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.2
          }}
          startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={generateSuggestions} 
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.2,
              borderWidth: '1.5px'
            }}
            disabled={isGeneratingAI}
            startIcon={<EmojiObjectsIcon />}
          >
            {isGeneratingAI ? "Generating..." : "Regenerate Ideas"}
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            disabled={selectedSuggestions.length < 2}
            onClick={startMerging}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              background: selectedSuggestions.length < 2 ? undefined : 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              boxShadow: selectedSuggestions.length < 2 ? undefined : '0 4px 8px rgba(33, 150, 243, 0.3)',
            }}
            startIcon={<MergeIcon />}
          >
            Merge Selected ({selectedSuggestions.length})
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SuggestionsScreen;
