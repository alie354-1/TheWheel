import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  CardActions,
  Radio,
  FormControlLabel
} from '@mui/material';
import { MergedIdea } from '../../../lib/types/idea-pathway.types';

interface MergedIdeaCardProps {
  mergedIdea: MergedIdea;
  isSelected: boolean;
  onSelect: (mergedIdeaId: string) => void;
}

const MergedIdeaCard: React.FC<MergedIdeaCardProps> = ({ 
  mergedIdea, 
  isSelected,
  onSelect
}) => {
  const handleSelectChange = () => {
    onSelect(mergedIdea.id);
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
          {mergedIdea.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {mergedIdea.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Problem Statement
          </Typography>
          <Typography variant="body2" paragraph>
            {mergedIdea.problem_statement}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Solution Concept
          </Typography>
          <Typography variant="body2" paragraph>
            {mergedIdea.solution_concept}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Target Audience
          </Typography>
          <Typography variant="body2" paragraph>
            {mergedIdea.target_audience}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Unique Value
          </Typography>
          <Typography variant="body2" paragraph>
            {mergedIdea.unique_value}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Business Model
          </Typography>
          <Typography variant="body2" paragraph>
            {mergedIdea.business_model}
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
              {mergedIdea.strengths.map((strength, index) => (
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
              {mergedIdea.weaknesses.map((weakness, index) => (
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
              {mergedIdea.opportunities.map((opportunity, index) => (
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
              {mergedIdea.threats.map((threat, index) => (
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
      
      <CardActions sx={{ px: 2, pb: 2 }}>
        <FormControlLabel
          control={
            <Radio
              checked={isSelected}
              onChange={handleSelectChange}
              color="primary"
            />
          }
          label={isSelected ? "Selected" : "Select this merged idea"}
        />
      </CardActions>
    </Card>
  );
};

export default MergedIdeaCard;
