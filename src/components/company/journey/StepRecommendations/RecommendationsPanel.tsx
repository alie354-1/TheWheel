import React from 'react';
import NextBestSteps from './NextBestSteps';
import StepRelationshipMap from './StepRelationshipMap';

interface RecommendationsPanelProps {
  stepId?: string;
  onStepSelect?: (stepId: string) => void;
  className?: string;
  showRelationships?: boolean;
}

/**
 * RecommendationsPanel combines step recommendations and relationship visualization
 * to provide a comprehensive view of recommended next steps and their connections
 */
export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  stepId,
  onStepSelect,
  className = '',
  showRelationships = true,
}) => {
  return (
    <div className={`recommendations-panel space-y-4 ${className}`}>
      <NextBestSteps 
        limit={3} 
        onStepSelect={onStepSelect} 
      />
      
      {showRelationships && stepId && (
        <StepRelationshipMap 
          stepId={stepId} 
          onStepSelect={onStepSelect} 
        />
      )}
    </div>
  );
};

export default RecommendationsPanel;
