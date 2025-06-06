import React from "react";
import { Step } from "../../types/journey.types";
import { Domain, Phase } from "../../types/journey.types";

interface CommunityStepsModalProps {
  open: boolean;
  sharedSteps: Step[];
  domains: Domain[];
  phases: Phase[];
  onClose: () => void;
  onImport: (step: Step) => void;
}

const CommunityStepsModal: React.FC<CommunityStepsModalProps> = ({
  open,
  sharedSteps,
  domains,
  phases,
  onClose,
  onImport,
}) => {
  const [selectedDomain, setSelectedDomain] = React.useState<string>("");
  const [selectedPhase, setSelectedPhase] = React.useState<string>("");

  if (!open) return null;

  // Filtered shared steps
  const filteredSteps = sharedSteps.filter(s => {
    if (selectedDomain && s.primary_domain_id !== selectedDomain && s.secondary_domain_id !== selectedDomain) {
      return false;
    }
    if (selectedPhase && s.primary_phase_id !== selectedPhase && s.secondary_phase_id !== selectedPhase) {
      return false;
    }
    return true;
  });

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
        <h2 className="text-xl font-bold mb-4">Community Steps</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Domain</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
            >
              <option value="">All</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>{domain.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Phase</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
            >
              <option value="">All</option>
              {phases.map(phase => (
                <option key={phase.id} value={phase.id}>{phase.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {filteredSteps.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No community steps found.</div>
          ) : (
            <div className="bg-white rounded shadow p-2">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Domain</th>
                    <th className="text-left py-2">Phase</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Import</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSteps.map(step => (
                    <tr key={step.id} className="border-t">
                      <td className="py-2">{step.name}</td>
                      <td className="py-2">
                        {domains.find(d => d.id === step.primary_domain_id)?.name || step.primary_domain_id}
                      </td>
                      <td className="py-2">
                        {phases.find(p => p.id === step.primary_phase_id)?.name || step.primary_phase_id}
                      </td>
                      <td className="py-2">{step.description}</td>
                      <td className="py-2">
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          onClick={() => onImport(step)}
                        >
                          Import
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

export default CommunityStepsModal;
