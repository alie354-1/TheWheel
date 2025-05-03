import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  CardActions,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { IdeaVariation } from '../../../lib/types/idea-pathway.types';

interface IdeaVariationCardProps {
  variation: IdeaVariation;
  isSelected: boolean;
  onSelect: (variationId: string, isSelected: boolean) => void;
  readOnly?: boolean;
}

const IdeaVariationCard: React.FC<IdeaVariationCardProps> = ({ 
  variation, 
  isSelected,
  onSelect,
  readOnly = false
}) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(variation.id, event.target.checked);
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderColor: isSelected ? 'primary.main' : 'grey.300',
        borderWidth: 2,
        borderStyle: 'solid',
        boxShadow: isSelected ? 3 : 1
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom component="div">
          {variation.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {variation.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Problem Statement
          </Typography>
          <Typography variant="body2" paragraph>
            {variation.problem_statement}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Solution Concept
          </Typography>
          <Typography variant="body2" paragraph>
            {variation.solution_concept}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Target Audience
          </Typography>
          <Typography variant="body2" paragraph>
            {variation.target_audience}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Unique Value
          </Typography>
          <Typography variant="body2" paragraph>
            {variation.unique_value}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            SWOT Analysis
          </Typography>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="success.main">
              Strengths
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {variation.strengths.map((strength, index) => (
                <Chip 
                  key={index} 
                  label={strength} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="error.main">
              Weaknesses
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {variation.weaknesses.map((weakness, index) => (
                <Chip 
                  key={index} 
                  label={weakness} 
                  size="small" 
                  color="error" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="info.main">
              Opportunities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {variation.opportunities.map((opportunity, index) => (
                <Chip 
                  key={index} 
                  label={opportunity} 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
          
          <Box>
            <Typography variant="caption" fontWeight="bold" color="warning.main">
              Threats
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {variation.threats.map((threat, index) => (
                <Chip 
                  key={index} 
                  label={threat} 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
      
      {!readOnly && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSelected}
                onChange={handleSelectChange}
                color="primary"
              />
            }
            label={isSelected ? "Selected" : "Select this variation"}
          />
        </CardActions>
      )}
    </Card>
  );
};

export default IdeaVariationCard;
