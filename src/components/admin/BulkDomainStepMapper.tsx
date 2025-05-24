import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getDomainSteps, batchAddStepsToDomain, getLLMStepSuggestionsForDomain, addTaskDependency } from "../../business-ops-hub/services/domain.service";

/**
 * BulkDomainStepMapper.tsx
 * Redesigned: Two-panel admin interface for mapping steps to domains.
 * Left: Domain selection (with search/filter).
 * Right: Step mapping for selected domain (with search/filter, batch actions, and AI suggestions).
 */

const BulkDomainStepMapper: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [domains, setDomains] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [mappedStepIds, setMappedStepIds] = useState<Set<string>>(new Set());
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search/filter state
  const [domainSearch, setDomainSearch] = useState("");
  const [stepSearch, setStepSearch] = useState("");

  // AI suggestion state
  const [suggestions, setSuggestions] = useState<{ step: any; score: number; explanation: string }[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("business_domains").select("*").is("company_id", null).order("name", { ascending: true }),
      supabase.from("journey_steps").select("*").order("name", { ascending: true }),
    ])
      .then(([domainRes, stepRes]) => {
        setDomains(domainRes.data || []);
        setSteps(stepRes.data || []);
      })
      .catch(() => setError("Failed to load domains or steps"))
      .finally(() => setLoading(false));
  }, []);

  // Load mapped steps for selected domain
  useEffect(() => {
    if (!selectedDomainId) {
      setMappedStepIds(new Set());
      setSelectedStepIds(new Set());
      setSuggestions([]);
      setSelectedSuggestionIds(new Set());
      return;
    }
    setLoading(true);
    getDomainSteps(selectedDomainId, null)
      .then((mapped) => {
        const ids = new Set(mapped.map((s: any) => s.step_id));
        setMappedStepIds(ids);
        setSelectedStepIds(new Set());
        setSuggestions([]);
        setSelectedSuggestionIds(new Set());
      })
      .catch(() => setError("Failed to load mapped steps"))
      .finally(() => setLoading(false));
  }, [selectedDomainId]);

  const handleMapSteps = async () => {
    if (!selectedDomainId || selectedStepIds.size === 0) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await batchAddStepsToDomain(selectedDomainId, Array.from(selectedStepIds));
      setSuccess("Steps mapped successfully.");
      // Refresh mapped steps
      const mapped = await getDomainSteps(selectedDomainId, null);
      setMappedStepIds(new Set(mapped.map((s: any) => s.step_id)));
      setSelectedStepIds(new Set());
    } catch (err) {
      setError("Failed to map steps.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!selectedDomainId) return;
    setSuggestionLoading(true);
    setSuggestions([]);
    setSelectedSuggestionIds(new Set());
    try {
      const res = await getLLMStepSuggestionsForDomain(selectedDomainId, null);
      setSuggestions(res);
      setSelectedSuggestionIds(new Set(res.map((s) => s.step.id)));
    } catch (e) {
      setError("Failed to get AI suggestions.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (!selectedDomainId || selectedSuggestionIds.size === 0) return;
    setLoading(true);
    setError(null);
    try {
      const suggestionIds = Array.from(selectedSuggestionIds);
      await batchAddStepsToDomain(selectedDomainId, suggestionIds);
      setSuccess("Selected AI suggested steps mapped successfully.");
      // Refresh mapped steps
      const mapped = await getDomainSteps(selectedDomainId, null);
      setMappedStepIds(new Set(mapped.map((s: any) => s.step_id)));
      setSuggestions([]);
      setSelectedSuggestionIds(new Set());
    } catch (err) {
      setError("Failed to save AI suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(domainSearch.toLowerCase())
  );
  const filteredSteps = steps.filter((s) =>
    s.name.toLowerCase().includes(stepSearch.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(stepSearch.toLowerCase()))
  );

  const selectedDomain = domains.find((d) => d.id === selectedDomainId);

  // New: State for selected mapped step and consideration links
  const [selectedMappedStepId, setSelectedMappedStepId] = useState<string | null>(null);

  // Reset selectedMappedStepId when domain changes or mapped steps change
  useEffect(() => {
    setSelectedMappedStepId(null);
  }, [selectedDomainId, mappedStepIds.size]);

  // New: State for consideration links and search
  const [considerationLinks, setConsiderationLinks] = useState<any[]>([]);
  const [considerationSearch, setConsiderationSearch] = useState("");
  const [considerationLoading, setConsiderationLoading] = useState(false);

  // Load consideration links for selected mapped step
  useEffect(() => {
    if (!selectedMappedStepId) {
      setConsiderationLinks([]);
      return;
    }
    setConsiderationLoading(true);
    supabase
      .from("task_dependencies")
      .select("*, depends_on_task:journey_steps!task_dependencies_depends_on_task_id_fkey(*)")
      .eq("task_id", selectedMappedStepId)
      .eq("type", "consideration")
      .then(({ data }) => {
        setConsiderationLinks(data || []);
      })
      .finally(() => setConsiderationLoading(false));
  }, [selectedMappedStepId]);

  // Add a consideration link
  const handleAddConsideration = async (dependsOnStepId: string) => {
    if (!selectedMappedStepId || !dependsOnStepId) return;
    setConsiderationLoading(true);
    try {
      await addTaskDependency(selectedMappedStepId, dependsOnStepId, "consideration");
      // Refresh links
      const { data } = await supabase
        .from("task_dependencies")
        .select("*, depends_on_task:journey_steps!task_dependencies_depends_on_task_id_fkey(*)")
        .eq("task_id", selectedMappedStepId)
        .eq("type", "consideration");
      setConsiderationLinks(data || []);
    } catch (err) {
      setError("Failed to add consideration link.");
    } finally {
      setConsiderationLoading(false);
    }
  };

  // Remove a consideration link
  const handleRemoveConsideration = async (dependencyId: string) => {
    setConsiderationLoading(true);
    try {
      await supabase.from("task_dependencies").delete().eq("id", dependencyId);
      // Refresh links
      if (selectedMappedStepId) {
        const { data } = await supabase
          .from("task_dependencies")
          .select("*, depends_on_task:journey_steps!task_dependencies_depends_on_task_id_fkey(*)")
          .eq("task_id", selectedMappedStepId)
          .eq("type", "consideration");
        setConsiderationLinks(data || []);
      }
    } catch (err) {
      setError("Failed to remove consideration link.");
    } finally {
      setConsiderationLoading(false);
    }
  };

  // Filter steps for consideration search (exclude self and already linked)
  const considerationCandidates = steps.filter(
    (s) =>
      s.id !== selectedMappedStepId &&
      !considerationLinks.some((link) => link.depends_on_task_id === s.id) &&
      (s.name.toLowerCase().includes(considerationSearch.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(considerationSearch.toLowerCase())))
  );

  return (
    <div className="p-6 bg-white rounded shadow max-w-5xl w-full flex flex-col h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bulk Domain-Step Mapping</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* Left: Domain selection */}
        <div className="w-1/3 border-r pr-4 flex flex-col">
          <input
            type="text"
            placeholder="Search domains..."
            className="border px-2 py-1 rounded mb-2"
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
          />
          <div className="overflow-y-auto flex-1">
            <ul>
              {filteredDomains.map((domain) => (
                <li
                  key={domain.id}
                  className={`p-2 rounded cursor-pointer mb-1 ${selectedDomainId === domain.id ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                  onClick={() => setSelectedDomainId(domain.id)}
                >
                  {domain.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Right: Step mapping */}
        <div className="w-2/3 pl-4 flex flex-col">
          {selectedDomainId ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Search steps..."
                  className="border px-2 py-1 rounded flex-1"
                  value={stepSearch}
                  onChange={(e) => setStepSearch(e.target.value)}
                />
                <button
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                  onClick={handleGetSuggestions}
                  disabled={suggestionLoading}
                  title="Get AI Suggestions"
                >
                  {suggestionLoading ? "Loading..." : "AI Suggestions"}
                </button>
                <button
                  className="bg-gray-200 px-3 py-1 rounded"
                  onClick={() => setSelectedStepIds(new Set())}
                  disabled={selectedStepIds.size === 0}
                  title="Clear selection"
                >
                  Clear
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={handleMapSteps}
                  disabled={selectedStepIds.size === 0 || loading}
                  title="Map selected steps"
                >
                  Map Selected
                </button>
              </div>
              {/* Step list */}
              <div className="flex-1 overflow-y-auto border rounded p-2 mb-2">
                <ul>
                  {filteredSteps.map((step) => (
                    <li
                      key={step.id}
                      className={`flex items-center gap-2 py-1 border-b cursor-pointer ${
                        mappedStepIds.has(step.id)
                          ? selectedMappedStepId === step.id
                            ? "bg-blue-50 ring-2 ring-blue-400"
                            : "hover:bg-blue-50"
                          : ""
                      }`}
                      onClick={() => {
                        if (mappedStepIds.has(step.id)) {
                          setSelectedMappedStepId(step.id);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStepIds.has(step.id)}
                        onChange={() => {
                          setSelectedStepIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(step.id)) {
                              next.delete(step.id);
                            } else {
                              next.add(step.id);
                            }
                            return next;
                          });
                        }}
                        disabled={mappedStepIds.has(step.id)}
                      />
                      <span className={mappedStepIds.has(step.id) ? "text-green-700 font-semibold" : ""}>
                        {step.name}
                        {step.description && (
                          <span className="text-xs text-gray-600 ml-2">
                            {step.description}
                          </span>
                        )}
                      </span>
                      {mappedStepIds.has(step.id) && (
                        <span className="ml-2 text-xs text-green-700">Mapped</span>
                      )}
                      {mappedStepIds.has(step.id) && selectedMappedStepId === step.id && (
                        <span className="ml-2 text-xs text-blue-700 font-bold">Selected</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Consideration Links Section */}
              {selectedMappedStepId && (
                <div className="border rounded p-3 mb-2 bg-yellow-50">
                  <div className="font-semibold mb-1">Consideration Links for Step</div>
                  {considerationLoading ? (
                    <div className="text-xs text-gray-500">Loading...</div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <span className="text-xs text-gray-700 font-semibold">Existing Considerations:</span>
                        {considerationLinks.length === 0 ? (
                          <span className="ml-2 text-xs text-gray-500">None</span>
                        ) : (
                          <ul className="mt-1">
                            {considerationLinks.map((link) => (
                              <li key={link.id} className="flex items-center gap-2 text-xs py-1">
                                <span className="font-semibold">{link.depends_on_task?.name || link.depends_on_task_id}</span>
                                {link.depends_on_task?.description && (
                                  <span className="text-gray-600 ml-2">{link.depends_on_task.description}</span>
                                )}
                                <button
                                  className="ml-2 text-red-600 underline"
                                  onClick={() => handleRemoveConsideration(link.id)}
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mb-1">
                        <span className="text-xs text-gray-700 font-semibold">Add Consideration:</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Search steps to add as consideration..."
                          className="border px-2 py-1 rounded flex-1"
                          value={considerationSearch}
                          onChange={(e) => setConsiderationSearch(e.target.value)}
                        />
                      </div>
                      <ul>
                        {considerationCandidates.slice(0, 8).map((s) => (
                          <li key={s.id} className="flex items-center gap-2 text-xs py-1">
                            <span className="font-semibold">{s.name}</span>
                            {s.description && (
                              <span className="text-gray-600 ml-2">{s.description}</span>
                            )}
                            <button
                              className="ml-2 text-blue-600 underline"
                              onClick={() => handleAddConsideration(s.id)}
                            >
                              Add
                            </button>
                          </li>
                        ))}
                        {considerationCandidates.length === 0 && (
                          <li className="text-xs text-gray-500">No steps found.</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              )}
              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-2">
                  <div className="font-semibold mb-1">AI Suggested Steps</div>
                  <ul>
                    {suggestions.map(({ step, score, explanation }) => (
                      <li key={step.id} className="flex items-start gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedSuggestionIds.has(step.id)}
                          onChange={() => {
                            setSelectedSuggestionIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(step.id)) {
                                next.delete(step.id);
                              } else {
                                next.add(step.id);
                              }
                              return next;
                            });
                          }}
                        />
                        <div className="flex-1">
                          <span className="font-semibold">{step.name}</span>
                          {step.description && (
                            <span className="text-xs text-gray-600 ml-2">{step.description}</span>
                          )}
                          <span className="ml-2 text-xs text-purple-700">(Score: {score.toFixed(2)})</span>
                          <button
                            className="ml-2 text-xs text-blue-600 underline"
                            onClick={() =>
                              setShowExplanation((prev) => ({
                                ...prev,
                                [step.id]: !prev[step.id],
                              }))
                            }
                          >
                            {showExplanation[step.id] ? "Hide Reason" : "Explain"}
                          </button>
                          {showExplanation[step.id] && (
                            <div className="mt-1 text-xs text-gray-700 bg-gray-50 border rounded p-2">
                              {explanation}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-2 bg-purple-600 text-white px-3 py-1 rounded"
                    onClick={handleApplySuggestions}
                    disabled={suggestionLoading || loading || selectedSuggestionIds.size === 0}
                  >
                    Map Selected Suggestions
                  </button>
                </div>
              )}
              {/* Mapped steps summary */}
              <div className="mt-2 text-xs text-gray-700">
                <span className="font-semibold">Mapped Steps:</span>{" "}
                {Array.from(mappedStepIds)
                  .map((id) => {
                    const step = steps.find((s) => s && s.id === id);
                    return step && step.name ? step.name : `[Missing step: ${id}]`;
                  })
                  .filter(Boolean)
                  .join(", ") || "None"}
              </div>
            </>
          ) : (
            <div className="text-gray-500 mt-8 text-center">Select a domain to map steps.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkDomainStepMapper;
