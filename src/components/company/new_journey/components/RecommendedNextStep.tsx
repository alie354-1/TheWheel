import React from 'react';
import { ArrowRight, Compass, Eye } from 'lucide-react';

export interface RecommendedNextStepProps {
  stepId: string;
  name: string;
  reason: string;
  description: string;
  onStart: () => void;
  onPreview?: (stepId: string) => void;
}

/**
 * Component that displays the recommended next step for the user
 * Based on AI recommendations and journey progress
 */
const RecommendedNextStep: React.FC<RecommendedNextStepProps> = ({
  stepId,
  name,
  reason,
  description,
  onStart,
  onPreview
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <Compass className="h-5 w-5 text-indigo-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-900">Recommended Next Step</h2>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-medium text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{reason}</p>
      </div>
      
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="flex space-x-3">
        {onPreview && (
          <button
            onClick={() => onPreview(stepId)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </button>
        )}
        <button
          onClick={onStart}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Start Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedNextStep;
