import React, { useState } from "react";
import { Step } from "../../types/journey.types";
import StepsFilterPanel from "./StepsFilterPanel";
import { StepsList } from "./StepsList";

interface CompanyStepsSectionProps {
  stepsWithStatus: {
    step: Step;
    status: "completed" | "ready" | "blocked";
    recommended?: boolean;
    completion?: number;
  }[];
  domains: { id: string; name: string }[];
  phases: { id: string; name: string }[];
}

export const CompanyStepsSection: React.FC<CompanyStepsSectionProps> = ({
  stepsWithStatus,
  domains,
  phases,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // List or card view toggle (default to card)
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Only show steps that are "started" (not just "ready" but have progress)
  const startedSteps = stepsWithStatus.filter(
    s => s.status !== "ready" || (s.completion && s.completion > 0)
  );

  const filtered = startedSteps.filter(s => {
    if (selectedDomain) {
      if (
        s.step.primary_domain_id !== selectedDomain &&
        s.step.secondary_domain_id !== selectedDomain
      ) {
        return false;
      }
    }
    if (selectedPhase) {
      if (
        s.step.primary_phase_id !== selectedPhase &&
        s.step.secondary_phase_id !== selectedPhase
      ) {
        return false;
      }
    }
    if (selectedStatus && s.status !== selectedStatus) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.step.name.toLowerCase().includes(q) &&
        !s.step.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">My Company Steps</h2>
        <div>
          <button
            className={`px-3 py-1 rounded-l ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setViewMode("card")}
          >
            Cards
          </button>
          <button
            className={`px-3 py-1 rounded-r ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>
      <StepsFilterPanel
        domains={domains}
        phases={phases}
        statusOptions={["completed", "ready", "blocked"]}
        selectedDomain={selectedDomain}
        selectedPhase={selectedPhase}
        selectedStatus={selectedStatus}
        search={search}
        onDomainChange={setSelectedDomain}
        onPhaseChange={setSelectedPhase}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearch}
      />
      {filtered.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No company steps found.</div>
      ) : viewMode === "card" ? (
        <StepsList stepsWithStatus={filtered} />
      ) : (
        <div className="bg-white rounded shadow p-4">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Progress</th>
                <th className="text-left py-2">Quick View</th>
                <th className="text-left py-2">Open</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
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
                      onClick={() => window.dispatchEvent(new CustomEvent("quickViewStep", { detail: s.step }))}
                    >
                      Quick View
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
  );
};

export default CompanyStepsSection;
