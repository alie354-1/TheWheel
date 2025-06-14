import React from "react";
import { Step } from "../../types/journey.types";
import { StepsList } from "./StepsList";

import { Domain, Phase } from "../../types/journey.types";

interface AllStepsModalProps {
  open: boolean;
  steps: Step[];
  stepsWithStatus: {
    step: Step;
    status: "completed" | "ready" | "blocked";
    recommended?: boolean;
    completion?: number;
  }[];
  domains: Domain[];
  phases: Phase[];
  onClose: () => void;
  onViewDetails: (step: Step) => void;
  onStartStep: (step: Step) => void; // NEW PROP
  selectedDomain: string;
  selectedPhase: string;
  onSelectedDomainChange: (domain: string) => void;
  onSelectedPhaseChange: (phase: string) => void;
}

const AllStepsModal: React.FC<AllStepsModalProps> = ({
  open,
  steps,
  stepsWithStatus,
  domains,
  phases,
  onClose,
  onViewDetails,
  onStartStep,
  selectedDomain,
  selectedPhase,
  onSelectedDomainChange,
  onSelectedPhaseChange,
}) => {

  if (!open) return null;

  // For all steps, try to find their status in stepsWithStatus, else default to "ready"
  const allStepsWithStatus = steps.map(step => {
    const found = stepsWithStatus.find(s => s.step.id === step.id);
    return found
      ? found
      : {
          step,
          status: "ready" as const,
          recommended: false,
          completion: 0,
        };
  });

  // Filtered steps
  const filteredStepsWithStatus = allStepsWithStatus.filter(s => {
    if (selectedDomain) {
      if (
        s.step.domain_id !== selectedDomain
      ) {
        return false;
      }
    }
    if (selectedPhase) {
      if (
        s.step.phase_id !== selectedPhase
      ) {
        return false;
      }
    }
    return true;
  });

  // Get unique domains and phases from steps (for fallback)
  const uniqueDomains = Array.from(
    new Set(
      filteredStepsWithStatus.flatMap(s => [s.step.domain_id].filter(Boolean))
    )
  );
  const uniquePhases = Array.from(
    new Set(
      filteredStepsWithStatus.flatMap(s => [s.step.phase_id].filter(Boolean))
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">All Steps</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Domain</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedDomain}
              onChange={e => onSelectedDomainChange(e.target.value)}
            >
              <option value="">All</option>
              {domains.length > 0
                ? domains.map(domain => (
                    <option key={domain.id} value={domain.id}>{domain.name}</option>
                  ))
                : uniqueDomains.map(domainId => (
                    <option key={domainId} value={domainId}>{domainId}</option>
                  ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Phase</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedPhase}
              onChange={e => onSelectedPhaseChange(e.target.value)}
            >
              <option value="">All</option>
              {phases.length > 0
                ? phases.map(phase => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))
                : uniquePhases.map(phaseId => (
                    <option key={phaseId} value={phaseId}>{phaseId}</option>
                  ))}
            </select>
          </div>
        </div>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {filteredStepsWithStatus.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No steps found.</div>
          ) : (
            <div className="bg-white rounded shadow p-2">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Progress</th>
                    <th className="text-left py-2">Quick View</th>
                    <th className="text-left py-2">Start Step</th>
                    <th className="text-left py-2">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStepsWithStatus.map(s => (
                    <tr key={s.step.id} className="border-t">
                      <td className="py-2">{s.step.name}</td>
                      <td className="py-2">{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</td>
                      <td className="py-2">
                        {s.completion !== undefined
                          ? `${Math.round((s.completion || 0) * 100)}%`
                          : "—"}
                      </td>
                      <td className="py-2">
                          <button
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                            onClick={() => onViewDetails(s.step)}
                          >
                            Quick View
                          </button>
                      </td>
                      <td className="py-2">
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          onClick={() => {
                            if (window.confirm("Add this step to your company journey?")) {
                              // Call the parent handler
                              onStartStep(s.step);
                            }
                          }}
                        >
                          Start Step
                        </button>
                      </td>
                      <td className="py-2">
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                          onClick={() => window.location.assign(`/journey/step/${s.step.id}`)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllStepsModal;
