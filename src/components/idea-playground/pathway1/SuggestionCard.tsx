import React from 'react';
import { Paper, Typography, Box, Button, Chip, Divider, alpha, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import GroupIcon from '@mui/icons-material/Group';
import StarsIcon from '@mui/icons-material/Stars';
import BusinessIcon from '@mui/icons-material/Business';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface Suggestion {
  title: string;
  description: string;
  problem_statement: string;
  solution_concept: string;
  target_audience: string;
  unique_value: string;
  business_model: string;
  revenue_model: string;
  marketing_strategy: string;
  go_to_market: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  // Additional fields needed by other components
  market_size?: string;
  competition?: string[] | string;
  revenue_streams?: string[] | string;
  cost_structure?: string[] | string;
  key_metrics?: string[] | string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  isSelected: boolean;
  onSelect: () => void;
  onContinue: () => void;
  onEdit?: () => void; // Optional edit callback
}

/**
 * SuggestionCard component displays a business idea suggestion
 * with options to select it, edit it, or continue with it
 */
const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isSelected,
  onSelect,
  onContinue,
  onEdit
}) => {
  // SWOT analysis section removed - will be implemented later
  const renderSWOTSection = () => {
    // This function is kept as a stub for future implementation
    return null;
  };

  return (
    <Paper 
      elevation={isSelected ? 4 : 1} 
      sx={{ 
        p: 3,
        position: 'relative',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 8,
          transform: 'translateY(-4px)'
        }
      }}
    >
      {/* Selection button */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 12, 
          right: 12,
          cursor: 'pointer',
          zIndex: 2,
          backgroundColor: isSelected ? 'primary.light' : 'background.paper',
          borderRadius: '50%',
          padding: '2px',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? 2 : 0,
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
        onClick={onSelect}
      >
        {isSelected ? (
          <CheckCircleIcon color="primary" fontSize="medium" />
        ) : (
          <RadioButtonUncheckedIcon color="action" fontSize="medium" />
        )}
      </Box>

      {/* Title and description */}
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          color: 'text.primary',
          fontWeight: 600,
          mb: 1,
          pr: 4 // Make room for selection icon
        }}
      >
        {suggestion.title}
      </Typography>
      
      <Typography 
        variant="body2" 
        paragraph
        sx={{
          color: 'text.secondary',
          mb: 2
        }}
      >
        {suggestion.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Business highlights */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} sx={{ flexGrow: 1 }}>
        <Box sx={{ 
          bgcolor: alpha('#ffebee', 0.3), 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Typography 
            variant="subtitle2" 
            display="flex" 
            alignItems="center"
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: 'error.dark' 
            }}
          >
            <PriorityHighIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
            Problem
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            {suggestion.problem_statement}
          </Typography>
        </Box>
        
        <Box sx={{ 
          bgcolor: alpha('#e8f5e9', 0.3), 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Typography 
            variant="subtitle2" 
            display="flex" 
            alignItems="center"
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: 'success.dark' 
            }}
          >
            <EmojiObjectsIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
            Solution
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            {suggestion.solution_concept}
          </Typography>
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3} mt={3}>
        <Box sx={{ 
          bgcolor: alpha('#e3f2fd', 0.3), 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Typography 
            variant="subtitle2" 
            display="flex" 
            alignItems="center"
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: 'primary.dark' 
            }}
          >
            <GroupIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
            Target Audience
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            {suggestion.target_audience}
          </Typography>
        </Box>
        
        <Box sx={{ 
          bgcolor: alpha('#fff8e1', 0.3), 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Typography 
            variant="subtitle2" 
            display="flex" 
            alignItems="center"
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: 'warning.dark' 
            }}
          >
            <StarsIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
            Unique Value
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            {suggestion.unique_value}
          </Typography>
        </Box>
      </Box>

      {/* SWOT Analysis */}
      {renderSWOTSection()}

      <Divider sx={{ my: 3 }} />

      {/* Action buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mt: 'auto', 
        pt: 2
      }}>
        {/* Edit button - only show if onEdit is provided */}
        {onEdit && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={onEdit}
            sx={{
              py: 1.2,
              flex: '0 0 auto',
              width: '100px',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: 2,
              transition: 'all 0.25s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              }
            }}
          >
            Edit
          </Button>
        )}

        {/* Continue button */}
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={onContinue}
          sx={{
            py: 1.2,
            fontSize: '0.95rem',
            fontWeight: 600,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
            transition: 'all 0.25s ease',
            boxShadow: '0 2px 6px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 10px rgba(25, 118, 210, 0.35)'
            },
            '&:active': {
              transform: 'translateY(0px)'
            }
          }}
          endIcon={<ArrowForwardIcon />}
        >
          Continue with this idea
        </Button>
      </Box>
    </Paper>
  );
};

export default SuggestionCard;
