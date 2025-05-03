import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { MergedIdea } from '../../../lib/types/idea-pathway.types';
import MergedIdeaCard from './MergedIdeaCard';

interface MergedIdeaListProps {
  mergedIdeas: MergedIdea[];
  onSelectMergedIdea: (mergedIdeaId: string) => void;
  selectedMergedIdeaId?: string;
}

const MergedIdeaList: React.FC<MergedIdeaListProps> = ({ 
  mergedIdeas, 
  onSelectMergedIdea,
  selectedMergedIdeaId
}) => {
  if (!mergedIdeas || mergedIdeas.length === 0) {
    return (
      <Box sx={{ mt: 2, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body1" align="center">
          No merged ideas available. Please merge selected variations first.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {mergedIdeas.map((mergedIdea) => (
        <Grid item xs={12} key={mergedIdea.id}>
          <MergedIdeaCard
            mergedIdea={mergedIdea}
            isSelected={selectedMergedIdeaId ? selectedMergedIdeaId === mergedIdea.id : mergedIdea.is_selected}
            onSelect={onSelectMergedIdea}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default MergedIdeaList;
