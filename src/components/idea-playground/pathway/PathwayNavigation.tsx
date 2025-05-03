import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { IdeaPathwayStep } from '../../../lib/types/idea-pathway.types';

interface PathwayNavigationProps {
  currentStep: IdeaPathwayStep;
  handleNext: () => void;
  handleBack: () => void;
  handleComplete: () => void;
  disableNext: boolean;
  showComplete: boolean;
  isLoading: boolean;
}

const PathwayNavigation: React.FC<PathwayNavigationProps> = ({
  currentStep,
  handleNext,
  handleBack,
  handleComplete,
  disableNext,
  showComplete,
  isLoading
}) => {
  const isFirstStep = currentStep === IdeaPathwayStep.INITIAL_IDEA;
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
      <Button
        variant="outlined"
        onClick={handleBack}
        disabled={isFirstStep || isLoading}
      >
        Back
      </Button>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        {showComplete ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleComplete}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Saving...' : 'Complete'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={disableNext || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Processing...' : 'Next'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PathwayNavigation;
