import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { IdeaVariation } from '../../../lib/types/idea-pathway.types';
import IdeaVariationCard from './IdeaVariationCard';

interface IdeaVariationListProps {
  variations: IdeaVariation[];
  onSelectVariation: (variationId: string, isSelected: boolean) => void;
  readOnly?: boolean;
}

const IdeaVariationList: React.FC<IdeaVariationListProps> = ({ 
  variations, 
  onSelectVariation,
  readOnly = false
}) => {
  if (!variations || variations.length === 0) {
    return (
      <Box sx={{ mt: 2, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body1" align="center">
          No variations available. Please generate variations first.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {variations.map((variation) => (
        <Grid item xs={12} md={6} key={variation.id}>
          <IdeaVariationCard
            variation={variation}
            isSelected={variation.is_selected}
            onSelect={onSelectVariation}
            readOnly={readOnly}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default IdeaVariationList;
