import React from "react";
import { useNavigate } from "react-router-dom";
import { Step } from "../../types/journey.types";

interface StepsListProps {
  stepsWithStatus: {
    step: Step;
    status: "completed" | "ready" | "blocked";
    recommended?: boolean;
    peerRate?: number;
    peerInsights?: string[];
  }[];
  onViewDetails?: (step: Step) => void;
}

export const StepsList: React.FC<StepsListProps> = ({ stepsWithStatus, onViewDetails }) => {
  const navigate = useNavigate();
  const [, setRerender] = React.useState(0);

  if (!stepsWithStatus.length) {
    return <div className="text-gray-500 text-center py-8">No steps found.</div>;
  }

  const statusColors: Record<string, string> = {
    completed: "bg-green-500 text-white",
    ready: "bg-blue-500 text-white",
    blocked: "bg-gray-400 text-white"
  };

  function markCompleted(stepId: string) {
    const completedStepIds: string[] = JSON.parse(localStorage.getItem("completedStepIds") || "[]");
    if (!completedStepIds.includes(stepId)) {
      completedStepIds.push(stepId);
      localStorage.setItem("completedStepIds", JSON.stringify(completedStepIds));
      setRerender(x => x + 1);
    }
  }

  function reopenStep(stepId: string) {
    let completedStepIds: string[] = JSON.parse(localStorage.getItem("completedStepIds") || "[]");
    completedStepIds = completedStepIds.filter(id => id !== stepId);
    localStorage.setItem("completedStepIds", JSON.stringify(completedStepIds));
    setRerender(x => x + 1);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stepsWithStatus.map(({ step, status, recommended, peerRate, peerInsights }) => (
        <div
          key={step.id}
          className={`bg-white rounded-lg shadow p-5 border border-gray-100 text-left hover:shadow-lg transition flex flex-col ${
            recommended ? "ring-2 ring-yellow-400" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2
                className="text-lg font-bold cursor-pointer hover:underline"
                title="Open full step page"
                onClick={() => navigate(`/journey/step/${step.id}`)}
              >
                {step.name}
              </h2>
              <button
                className="ml-1 px-1 py-0.5 text-xs text-blue-600 border border-blue-100 rounded hover:bg-blue-50"
                title="Open full step page"
                onClick={() => navigate(`/journey/step/${step.id}`)}
                style={{ lineHeight: 1 }}
              >
                <span role="img" aria-label="Open">↗</span>
              </button>
            </div>
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${statusColors[status]}`}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {recommended && (
                <span className="ml-2 text-yellow-500" title="Recommended Next Step">★</span>
              )}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{step.description}</p>
          <div className="flex items-center text-xs text-gray-500 space-x-4 mb-2">
            <span>Difficulty: {step.difficulty}</span>
            <span>Time: {step.time_estimate}</span>
          </div>
          {/* Peer stats/insights */}
          {(peerRate || (peerInsights && peerInsights.length > 0)) && (
            <div className="mb-2">
              {peerRate && (
                <div className="text-xs text-blue-700 font-medium">
                  {peerRate}% of similar companies chose this
                </div>
              )}
              {peerInsights && peerInsights.length > 0 && (
                <ul className="text-xs text-blue-600 list-disc pl-4 mt-1">
                  {peerInsights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="mt-auto flex gap-2">
            {status !== "completed" && status !== "blocked" && (
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                onClick={() => markCompleted(step.id)}
              >
                Mark Completed
              </button>
            )}
            {status === "completed" && (
              <button
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                onClick={() => reopenStep(step.id)}
              >
                Reopen
              </button>
            )}
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
              title="Quick View (open details modal)"
              onClick={() => onViewDetails ? onViewDetails(step) : navigate(`/journey/step/${step.id}`)}
            >
              Quick View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
