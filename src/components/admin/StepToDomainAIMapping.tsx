import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getLLMDomainSuggestionsForStep, batchAddStepsToDomain } from "../../business-ops-hub/services/domain.service";

/**
 * StepToDomainAIMapping.tsx
 * Admin interface for mapping steps to domains using AI recommendations.
 * Lists all steps, and for each step, shows top recommended domains (with explanations).
 */

const StepToDomainAIMapping: React.FC = () => {
  const [steps, setSteps] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [aiResults, setAIResults] = useState<Record<string, { domain: any; score: number; explanation: string }[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [selectedDomainIds, setSelectedDomainIds] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("journey_steps").select("*").order("name", { ascending: true }),
      supabase.from("business_domains").select("*").is("company_id", null).order("name", { ascending: true }),
    ])
      .then(([stepRes, domainRes]) => {
        setSteps(stepRes.data || []);
        setDomains(domainRes.data || []);
      })
      .catch(() => setError("Failed to load steps or domains"))
      .finally(() => setLoading(false));
  }, []);

  const handleGetAISuggestions = async (stepId: string) => {
    setActiveStepId(stepId);
    setError(null);
    setSuccess(null);
    setAIResults((prev) => ({ ...prev, [stepId]: [] }));
    try {
      const results = await getLLMDomainSuggestionsForStep(stepId, null);
      setAIResults((prev) => ({ ...prev, [stepId]: results }));
      setSelectedDomainIds((prev) => ({
        ...prev,
        [stepId]: new Set(results.filter((r) => r.score > 0.5).map((r) => r.domain.id)),
      }));
    } catch (err: any) {
      setError(err.message || "Failed to get AI domain suggestions.");
    }
  };

  const handleToggleDomain = (stepId: string, domainId: string) => {
    setSelectedDomainIds((prev) => {
      const next = new Set(prev[stepId] || []);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return { ...prev, [stepId]: next };
    });
  };

  const handleMapDomains = async (stepId: string) => {
    if (!selectedDomainIds[stepId] || selectedDomainIds[stepId].size === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // For each selected domain, map the step to the domain
      for (const domainId of selectedDomainIds[stepId]) {
        await batchAddStepsToDomain(domainId, null, [stepId]);
      }
      setSuccess("Step mapped to selected domains successfully.");
    } catch (err) {
      setError("Failed to map step to domains.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-5xl w-full flex flex-col h-[80vh]">
      <h2 className="text-xl font-bold mb-4">Step-to-Domain AI Mapping</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="flex-1 overflow-y-auto border rounded p-2">
        <ul>
          {steps.map((step) => (
            <li key={step.id} className="mb-6 border-b pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{step.name}</span>
                {step.description && (
                  <span className="text-xs text-gray-600 ml-2">{step.description}</span>
                )}
                <button
                  className="ml-4 bg-purple-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => handleGetAISuggestions(step.id)}
                  disabled={activeStepId === step.id && !aiResults[step.id]}
                >
                  {activeStepId === step.id && !aiResults[step.id] ? "Loading..." : "AI Domain Suggestions"}
                </button>
                <button
                  className="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => handleMapDomains(step.id)}
                  disabled={saving || !selectedDomainIds[step.id] || selectedDomainIds[step.id].size === 0}
                >
                  Map Selected Domains
                </button>
              </div>
              {/* AI Results */}
              {aiResults[step.id] && aiResults[step.id].length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3 mt-2">
                  <div className="font-semibold mb-1">AI Recommended Domains</div>
                  <ul>
                    {aiResults[step.id].map(({ domain, score, explanation }) => (
                      <li key={domain.id} className="flex items-start gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedDomainIds[step.id]?.has(domain.id) || false}
                          onChange={() => handleToggleDomain(step.id, domain.id)}
                        />
                        <div className="flex-1">
                          <span className="font-semibold">{domain.name}</span>
                          {domain.description && (
                            <span className="text-xs text-gray-600 ml-2">{domain.description}</span>
                          )}
                          <span className="ml-2 text-xs text-purple-700">(Score: {score.toFixed(2)})</span>
                          <div className="mt-1 text-xs text-gray-700 bg-gray-50 border rounded p-2">
                            {explanation}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StepToDomainAIMapping;
