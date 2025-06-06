import React from "react";
import { Step } from "../../types/journey.types";

interface RecommendedStep {
  title: string;
  description: string;
  peerRate: number;
  stepId?: string;
}

interface RecommendedStepsPanelProps {
  recommendations: RecommendedStep[];
  steps: Step[];
  onViewDetails: (step: Step) => void;
  onViewAll: () => void;
}

const RecommendedStepsPanel: React.FC<RecommendedStepsPanelProps> = ({
  recommendations,
  steps,
  onViewDetails,
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-900">Recommended Next Steps</h2>
        <button
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-semibold"
          onClick={onViewAll}
        >
          View All Steps
        </button>
      </div>
      {recommendations.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No recommendations found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {recommendations.map((rec, idx) => {
            // Try to find the matching step by name (fallback to id if available)
            const step =
              steps.find(
                s =>
                  s.name.toLowerCase() === rec.title.toLowerCase() ||
                  (rec.stepId && s.id === rec.stepId)
              ) || null;
            return (
              <div
                key={rec.title + idx}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between"
              >
                <div>
                  <div className="font-bold text-lg text-blue-900">{rec.title}</div>
                  <div className="text-gray-700 mb-1">{rec.description}</div>
                  <div className="text-blue-600 text-sm font-medium">
                    {rec.peerRate}% of similar companies chose this
                  </div>
                </div>
                <div className="mt-3 md:mt-0 flex gap-2">
                  {step && (
                    <>
                      <button
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded shadow hover:bg-blue-200 text-sm"
                        onClick={() => onViewDetails(step)}
                      >
                        Quick View
                      </button>
                      <button
                        className="px-3 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-sm"
                        onClick={() => window.location.assign(`/journey/step/${step.id}`)}
                      >
                        Open
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendedStepsPanel;
