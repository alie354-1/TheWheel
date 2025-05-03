import React from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { IdeaPathwayStep } from '../../../lib/types/idea-pathway.types';

interface PathwayStepIndicatorProps {
  currentStep: IdeaPathwayStep;
}

// Map the enum steps to friendly display names
const stepLabels: Record<IdeaPathwayStep, string> = {
  [IdeaPathwayStep.INITIAL_IDEA]: 'Initial Idea',
  [IdeaPathwayStep.VARIATIONS]: 'Variations',
  [IdeaPathwayStep.SELECTION]: 'Selection',
  [IdeaPathwayStep.MERGE]: 'Merge',
  [IdeaPathwayStep.FINAL_SELECTION]: 'Final Selection'
};

// Order of steps in the pathway
const stepsOrder: IdeaPathwayStep[] = [
  IdeaPathwayStep.INITIAL_IDEA,
  IdeaPathwayStep.VARIATIONS,
  IdeaPathwayStep.SELECTION,
  IdeaPathwayStep.MERGE,
  IdeaPathwayStep.FINAL_SELECTION
];

const PathwayStepIndicator: React.FC<PathwayStepIndicatorProps> = ({ currentStep }) => {
  // Find the active step index based on the current step
  const activeStep = stepsOrder.indexOf(currentStep);
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {stepsOrder.map((step) => (
          <Step key={step}>
            <StepLabel>{stepLabels[step]}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default PathwayStepIndicator;
