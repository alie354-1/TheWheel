import React, { useState, useEffect } from "react";
import { getDomainSteps } from "../services/domain.service";
import { getStepSuggestionsForDomain } from "../services/recommendation.service";
import { DomainStep } from "../types/domain-extended.types";

interface StepSelectorProps {
  onStepSelect: (stepId: string) => void;
  excludeStepIds?: string[];
  domainId: string;
  companyId: string;
}

export const StepSelector: React.FC<StepSelectorProps> = ({
  onStepSelect,
  excludeStepIds = [],
  domainId,
  companyId,
}) => {
  const [allSteps, setAllSteps] = useState<DomainStep[]>([]);
  const [filteredSteps, setFilteredSteps] = useState<DomainStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("all");
  const [phases, setPhases] = useState<string[]>([]);
  const [recommendedSteps, setRecommendedSteps] = useState<{ step_id: string; count: number }[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      setLoading(true);
      try {
        // Get all steps, including recommendations, then filter out associated steps
        const stepsData = await getDomainSteps(domainId, companyId, true);
        setAllSteps(stepsData);

        // Extract unique phases
        const uniquePhases = [
          ...new Set(stepsData.map((step) => step.phase_name)),
        ];
        setPhases(uniquePhases);

        // Initial filtering
        applyFilters(stepsData, searchTerm, selectedPhase);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching journey steps:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const recs = await getStepSuggestionsForDomain(companyId, domainId, 5);
        setRecommendedSteps(recs);
      } catch (err) {
        setRecommendedSteps([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchSteps();
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId, companyId]);

  const applyFilters = (
    steps: DomainStep[],
    search: string,
    phase: string
  ) => {
    let filtered = steps;

    // Filter by excluded step IDs
    if (excludeStepIds.length > 0) {
      filtered = filtered.filter((step) => !excludeStepIds.includes(step.step_id));
    }

    // Filter by phase
    if (phase !== "all") {
      filtered = filtered.filter((step) => step.phase_name === phase);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (step) =>
          step.name.toLowerCase().includes(searchLower) ||
          step.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSteps(filtered);
  };

  useEffect(() => {
    applyFilters(allSteps, searchTerm, selectedPhase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSteps, searchTerm, selectedPhase, excludeStepIds]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhase(e.target.value);
  };

  if (loading) return <div>Loading steps...</div>;

  return (
    <div className="step-selector">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search steps..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border px-2 py-1 rounded text-sm"
        />
        <select
          value={selectedPhase}
          onChange={handlePhaseChange}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="all">All Phases</option>
          {phases.map((phase) => (
            <option key={phase} value={phase}>
              {phase}
            </option>
          ))}
        </select>
      </div>
      <div className="step-results">
        {/* Recommended Steps Section */}
        <div className="mb-4">
          <h3 className="font-semibold text-sm mb-1">Recommended Steps</h3>
          {loadingRecommendations ? (
            <p className="text-gray-500">Loading recommendations...</p>
          ) : recommendedSteps.length === 0 ? (
            <p className="text-gray-400 text-xs">No recommendations at this time.</p>
          ) : (
            <div className="grid gap-2">
              {recommendedSteps.map((rec) => (
                <div key={rec.step_id} className="border rounded p-2 flex flex-col gap-1 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-700">Step ID: {rec.step_id}</span>
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                      Added by {rec.count} companies
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => onStepSelect(rec.step_id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Add to Domain
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Main Step List */}
        {filteredSteps.length === 0 ? (
          <p className="text-gray-500">No steps match your criteria.</p>
        ) : (
          <div className="grid gap-2">
            {filteredSteps.map((step) => (
              <div key={step.id} className="border rounded p-2 flex flex-col gap-1 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{step.name}</h4>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{step.phase_name}</span>
                </div>
                <p className="text-gray-700 text-xs">{step.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Difficulty: {step.difficulty}/5</span>
                  <span>Time: {step.time_estimate} mins</span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => onStepSelect(step.step_id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Add to Domain
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepSelector;
