import React, { useState, useEffect } from 'react';
import { 
  Button, Typography, Box, Paper, TextField, Divider, 
  LinearProgress, Alert, Grid, alpha, CircularProgress,
  InputAdornment
} from '@mui/material';
import { Suggestion } from './SuggestionCard';
import { ideaMergerService } from '../../../lib/services/idea-playground/ai';
import { useAuthStore } from '../../../lib/store';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GroupIcon from '@mui/icons-material/Group';
import StarsIcon from '@mui/icons-material/Stars';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface SuggestionMergerProps {
  suggestions: Suggestion[];
  onSave: (suggestion: Suggestion) => void;
  onCancel: () => void;
}

const SuggestionMerger: React.FC<SuggestionMergerProps> = ({ suggestions, onSave, onCancel }) => {
  // State for loading and error handling
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for the merged suggestion
  const [mergedSuggestion, setMergedSuggestion] = useState<Suggestion | null>(null);
  
  // Initialize merged suggestion using the first suggestion as a base
  useEffect(() => {
    if (suggestions.length > 0) {
      const userInfo = {
        id: 'user123', // Replace with actual user ID from auth context if available
        name: 'User'
      };

      // Generate AI merged suggestion
      generateAIMergedSuggestion(suggestions, userInfo.id);
    }
  }, [suggestions]);

  // Function to generate a merged suggestion using AI
  const generateAIMergedSuggestion = async (suggestions: Suggestion[], userId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const merged = await ideaMergerService.mergeSuggestions(suggestions, userId);
      setMergedSuggestion(merged);
    } catch (err) {
      console.error('Error merging suggestions:', err);
      setError('Failed to generate merged suggestion. Using basic merge instead.');
      setMergedSuggestion(createBasicMergedSuggestion(suggestions));
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to combine array fields from multiple suggestions
  const combineArrayField = (field: keyof Suggestion) => {
    const allItems = suggestions.flatMap(suggestion => {
      const value = suggestion[field];
      return Array.isArray(value) ? value : [];
    });
    return [...new Set(allItems)].slice(0, 5); // Limit to 5 unique items
  };

  // Function to create a basic merged suggestion when AI fails
  const createBasicMergedSuggestion = (suggestions: Suggestion[]): Suggestion => {
    if (suggestions.length === 0) {
      throw new Error('No suggestions to merge');
    }

    const baseSuggestion = suggestions[0];
    const allTitles = suggestions.map(suggestion => suggestion.title.replace(/ \(Merged Concept\)$/, ''));

    // Create a title that references the merged concepts
    const mergedTitle = allTitles.length <= 2
      ? `${allTitles.join(' + ')} (Merged Concept)`
      : `${allTitles[0]} + ${allTitles.length - 1} More (Merged Concept)`;

    return {
      title: mergedTitle,
      description: `A merged concept combining the best elements of ${allTitles.join(', ')}.`,
      problem_statement: baseSuggestion.problem_statement,
      solution_concept: `Combined approach that integrates: ${suggestions.map(s => s.solution_concept).join('; ')}`,
      target_audience: baseSuggestion.target_audience,
      unique_value: `Multi-faceted value proposition: ${suggestions.map(s => s.unique_value).join('; ')}`,
      business_model: baseSuggestion.business_model,
      marketing_strategy: baseSuggestion.marketing_strategy,
      revenue_model: baseSuggestion.revenue_model,
      go_to_market: baseSuggestion.go_to_market,
      market_size: baseSuggestion.market_size,
      competition: combineArrayField('competition'),
      revenue_streams: combineArrayField('revenue_streams'),
      cost_structure: combineArrayField('cost_structure'),
      key_metrics: combineArrayField('key_metrics'),
      strengths: combineArrayField('strengths'),
      weaknesses: combineArrayField('weaknesses'),
      opportunities: combineArrayField('opportunities'),
      threats: combineArrayField('threats')
    };
  };

  // Function to handle field updates
  const handleFieldUpdate = (field: keyof Suggestion, value: string) => {
    if (!mergedSuggestion) return;
    
    try {
      setMergedSuggestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value
        };
      });
    } catch (error) {
      console.error(`Error updating field ${field}:`, error);
      // Continue with operation despite errors - don't break the UI
    }
  };

  // Function to handle array field updates
  const handleArrayFieldUpdate = (field: keyof Suggestion, value: string) => {
    if (!mergedSuggestion) return;
    
    // Split by commas or newlines
    const items = value.split(/[,\n]/).map(item => item.trim()).filter(item => item);
    
    setMergedSuggestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: items
      };
    });
  };

  // Generate a color for each section based on field type
  const getFieldColor = (field: string) => {
    switch(field) {
      case 'problem_statement': return '#ffebee'; // light red
      case 'solution_concept': return '#e8f5e9'; // light green
      case 'target_audience': return '#e3f2fd'; // light blue
      case 'unique_value': return '#fff8e1'; // light yellow/amber
      case 'business_model': 
      case 'revenue_model': return '#f3e5f5'; // light purple
      case 'marketing_strategy':
      case 'go_to_market': return '#e0f7fa'; // light cyan
      default: return '#f5f5f5'; // light grey
    }
  };

  // If no merged suggestion yet, show loading
  if (!mergedSuggestion) {
    return (
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        maxWidth: '1400px', 
        mx: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Paper 
          elevation={0}
          sx={{
            p: 5,
            width: '100%',
            maxWidth: '600px',
            borderRadius: 3,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          {isGenerating ? (
            <>
              <MergeTypeIcon 
                color="primary" 
                sx={{ 
                  fontSize: 60, 
                  mb: 3,
                  opacity: 0.8
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  background: 'linear-gradient(90deg, #2196f3, #1565c0)',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Merging Your Ideas
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '450px',
                  mx: 'auto'
                }}
              >
                AI is combining the best elements from your selected ideas. This may take a moment as we create the perfect blend.
              </Typography>
              
              <LinearProgress 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  maxWidth: '400px',
                  mx: 'auto',
                  mb: 3,
                  bgcolor: alpha('#e3f2fd', 0.5),
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
                    borderRadius: 5
                  }
                }} 
              />
              
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                AI works best when combining complementary concepts
              </Typography>
            </>
          ) : error ? (
            <>
              <PriorityHighIcon 
                color="error" 
                sx={{ 
                  fontSize: 60, 
                  mb: 3,
                  opacity: 0.8
                }} 
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: 'error.main'
                }}
              >
                Merger Error
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '450px',
                  mx: 'auto'
                }}
              >
                {error}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onCancel}
                startIcon={<ArrowBackIcon />}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                  boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
                }}
              >
                Go Back
              </Button>
            </>
          ) : (
            <>
              <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2 
                }}
              >
                Preparing Idea Merger
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary'
                }}
              >
                Initializing the idea merger process...
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    );
  }

  // Render the merged suggestion editor
  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      maxWidth: '1400px', 
      mx: 'auto',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          mb: 3
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MergeTypeIcon 
              color="primary"
              sx={{ mr: 1.5, fontSize: 28 }}
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(90deg, #2196f3, #1565c0)',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block'
              }}
            >
              Merged Business Concept
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: '800px',
              ml: 0.5
            }}
          >
            We've combined your selected ideas into a cohesive concept. Review and refine before continuing.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TitleIcon sx={{ mr: 1, color: 'primary.main' }} />
            Basic Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={mergedSuggestion.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('title', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha('#f5f5f5', 0.3),
                    '&:hover': {
                      backgroundColor: alpha('#f5f5f5', 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha('#e3f2fd', 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={mergedSuggestion.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('description', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha('#f5f5f5', 0.3),
                    '&:hover': {
                      backgroundColor: alpha('#f5f5f5', 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha('#e3f2fd', 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <EmojiObjectsIcon sx={{ mr: 1, color: 'primary.main' }} />
            Core Concept
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Problem Statement"
                multiline
                rows={3}
                value={mergedSuggestion.problem_statement}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('problem_statement', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('problem_statement'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('problem_statement'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('problem_statement'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <PriorityHighIcon color="error" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Solution Concept"
                multiline
                rows={3}
                value={mergedSuggestion.solution_concept}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('solution_concept', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('solution_concept'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('solution_concept'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('solution_concept'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <EmojiObjectsIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Audience"
                value={mergedSuggestion.target_audience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('target_audience', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('target_audience'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('target_audience'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('target_audience'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unique Value Proposition"
                value={mergedSuggestion.unique_value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('unique_value', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('unique_value'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('unique_value'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('unique_value'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StarsIcon color="warning" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
            Business Strategy
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Model"
                value={mergedSuggestion.business_model}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('business_model', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('business_model'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('business_model'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('business_model'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Revenue Model"
                value={mergedSuggestion.revenue_model}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('revenue_model', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('revenue_model'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('revenue_model'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('revenue_model'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOnIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Marketing Strategy"
                multiline
                rows={2}
                value={mergedSuggestion.marketing_strategy}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('marketing_strategy', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('marketing_strategy'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('marketing_strategy'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('marketing_strategy'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <CampaignIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Go-to-Market Strategy"
                multiline
                rows={2}
                value={mergedSuggestion.go_to_market}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldUpdate('go_to_market', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(getFieldColor('go_to_market'), 0.3),
                    '&:hover': {
                      backgroundColor: alpha(getFieldColor('go_to_market'), 0.5),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(getFieldColor('go_to_market'), 0.3),
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <CampaignIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* SWOT Analysis removed - will be implemented later */}

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onCancel}
            startIcon={<CancelIcon />}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
              }
            }}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onSave(mergedSuggestion)}
            startIcon={<SaveIcon />}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(33, 150, 243, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Save Merged Concept
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SuggestionMerger;
