import React, { useState } from 'react';
import { 
  Button, Box, Typography, TextField, Grid, Paper, 
  Divider, alpha, IconButton, InputAdornment
} from '@mui/material';
import { Suggestion } from './SuggestionCard';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GroupIcon from '@mui/icons-material/Group';
import StarsIcon from '@mui/icons-material/Stars';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CampaignIcon from '@mui/icons-material/Campaign';

interface SuggestionEditorProps {
  suggestion: Suggestion;
  onSave: (suggestion: Suggestion) => void;
  onCancel: () => void;
}

/**
 * SuggestionEditor component allows editing of a suggestion's fields
 * with an enhanced modern UI
 */
const SuggestionEditor: React.FC<SuggestionEditorProps> = ({ suggestion, onSave, onCancel }) => {
  // State for the edited suggestion
  const [editedSuggestion, setEditedSuggestion] = useState<Suggestion>(suggestion);
  
  // Handle field updates
  const handleFieldUpdate = (field: keyof Suggestion, value: string) => {
    setEditedSuggestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedSuggestion);
  };

  // Handle array field updates (for fields like strengths, weaknesses, etc.)
  const handleArrayFieldUpdate = (field: keyof Suggestion, value: string) => {
    const items = value.split(/[,\n]/).map(item => item.trim()).filter(item => item);
    
    setEditedSuggestion(prev => {
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
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EditIcon 
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
                Edit Business Idea
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
              Refine your business idea by editing the details below. Changes will help AI generate more tailored suggestions.
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
                  value={editedSuggestion.title}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
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
                  value={editedSuggestion.description}
                  onChange={(e) => handleFieldUpdate('description', e.target.value)}
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
                  value={editedSuggestion.problem_statement}
                  onChange={(e) => handleFieldUpdate('problem_statement', e.target.value)}
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
                  value={editedSuggestion.solution_concept}
                  onChange={(e) => handleFieldUpdate('solution_concept', e.target.value)}
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
                  value={editedSuggestion.target_audience}
                  onChange={(e) => handleFieldUpdate('target_audience', e.target.value)}
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
                  value={editedSuggestion.unique_value}
                  onChange={(e) => handleFieldUpdate('unique_value', e.target.value)}
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
                  value={editedSuggestion.business_model}
                  onChange={(e) => handleFieldUpdate('business_model', e.target.value)}
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
                  value={editedSuggestion.revenue_model}
                  onChange={(e) => handleFieldUpdate('revenue_model', e.target.value)}
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
                  value={editedSuggestion.marketing_strategy}
                  onChange={(e) => handleFieldUpdate('marketing_strategy', e.target.value)}
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
                  value={editedSuggestion.go_to_market}
                  onChange={(e) => handleFieldUpdate('go_to_market', e.target.value)}
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

          {/* SWOT Analysis section removed - will be implemented later */}

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
              startIcon={<ArrowBackIcon />}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: 2,
                borderWidth: '1.5px'
              }}
            >
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
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
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SuggestionEditor;
