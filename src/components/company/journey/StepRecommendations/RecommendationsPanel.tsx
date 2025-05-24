import React from 'react';
import { NextBestSteps, NextBestStepsProps } from './NextBestSteps'; // Ensure named import for props
import StepRelationshipMap, { StepRelationshipMapProps } from './StepRelationshipMap'; // Ensure named import for props

interface RecommendationsPanelProps {
  companyId: string; // companyId is needed for NextBestSteps
  currentStepId?: string;
  className?: string;
}

/**
 * RecommendationsPanel displays various AI-powered recommendations related
 * to the user's journey progress.
 */
const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  companyId,
  currentStepId,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        AI Recommendations
      </h2>

      {/* Next Best Steps Component */}
      {/* Props passed should match NextBestStepsProps */}
      <NextBestSteps
        companyId={companyId}
        currentStepId={currentStepId}
        className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm"
        // Add other props like onStepSelect if needed by the parent context
      />

      {/* Step Relationship Map Component */}
      {/* Props passed should match StepRelationshipMapProps */}
      {currentStepId && (
        <StepRelationshipMap
          stepId={currentStepId} // Pass currentStepId as stepId
          className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm"
          // Add other props like onStepSelect if needed
        />
      )}

      {/* Placeholder for other recommendation types (e.g., tool recommendations) */}
      {/*
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">Recommended Tools</h3>
        <p className="text-gray-600 dark:text-gray-400">Tool recommendations will appear here.</p>
      </div>
      */}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>AI recommendations are based on your progress, company profile, and successful patterns from similar companies.</p>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
