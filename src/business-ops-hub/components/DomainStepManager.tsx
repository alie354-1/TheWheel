import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { addSubTaskDependency, removeSubTaskDependency } from "../services/domain.service";
import { useDomainSteps } from "../hooks/useDomainSteps";
import { useCompany } from "@/lib/hooks/useCompany";
import { DomainStep } from "../types/domain-extended.types";

interface DomainStepManagerProps {
  domainId: string;
  companyId: string;
}

const StepWithSubTasks: React.FC<{
  step: any;
  allSteps: any[];
  removeStep: (stepId: string) => void;
}> = ({ step, allSteps, removeStep }) => {
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [subTaskSearch, setSubTaskSearch] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);

  // Fetch sub-tasks for this step
  React.useEffect(() => {
    setSubTaskLoading(true);
    supabase
      .from("task_dependencies")
      .select("*, sub_task:journey_steps!task_dependencies_depends_on_task_id_fkey(*)")
      .eq("task_id", step.id)
      .eq("type", "is_sub_task_of")
      .then(({ data }) => {
        setSubTasks(data || []);
      })
      .finally(() => setSubTaskLoading(false));
  }, [step.id]);

  // Candidates for adding as sub-tasks
  const subTaskCandidates = allSteps.filter(
    (s) =>
      s.id !== step.id &&
      !subTasks.some((link) => link.depends_on_task_id === s.id) &&
      (s.name.toLowerCase().includes(subTaskSearch.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(subTaskSearch.toLowerCase())))
  );

  // Add sub-task
  const handleAddSubTask = async (subTaskId: string) => {
    setSubTaskLoading(true);
    try {
      await addSubTaskDependency(step.id, subTaskId);
      // Refresh sub-tasks
      const { data } = await supabase
        .from("task_dependencies")
        .select("*, sub_task:journey_steps!task_dependencies_depends_on_task_id_fkey(*)")
        .eq("task_id", step.id)
        .eq("type", "is_sub_task_of");
      setSubTasks(data || []);
    } catch (err) {
      // Optionally handle error
    } finally {
      setSubTaskLoading(false);
    }
  };

  // Remove sub-task
  const handleRemoveSubTask = async (dependencyId: string) => {
    setSubTaskLoading(true);
    try {
      await removeSubTaskDependency(dependencyId);
      // Refresh sub-tasks
      const { data } = await supabase
        .from("task_dependencies")
        .select("*, sub_task:journey_steps!task_dependencies_depends_on_task_id_fkey(*)")
        .eq("task_id", step.id)
        .eq("type", "is_sub_task_of");
      setSubTasks(data || []);
    } catch (err) {
      // Optionally handle error
    } finally {
      setSubTaskLoading(false);
    }
  };

  return (
    <div className="border rounded p-3 flex flex-col gap-1 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-bold">{step.name}</h4>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{step.phase_name}</span>
      </div>
      <p className="text-gray-700 text-sm">{step.domain_specific_description || step.description}</p>
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Difficulty: {step.difficulty}/5</span>
        <span>Time: {step.time_estimate} mins</span>
      </div>
      {/* Sub-tasks section */}
      <div className="mt-2 bg-yellow-50 border rounded p-2">
        <div className="font-semibold text-xs mb-1">Sub-Tasks</div>
        {subTaskLoading ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : (
          <>
            {subTasks.length === 0 ? (
              <div className="text-xs text-gray-500 mb-1">No sub-tasks.</div>
            ) : (
              <ul className="mb-1">
                {subTasks.map((link) => (
                  <li key={link.id} className="flex items-center gap-2 text-xs py-1">
                    <span className="font-semibold">{link.sub_task?.name || link.depends_on_task_id}</span>
                    {link.sub_task?.description && (
                      <span className="text-gray-600 ml-2">{link.sub_task.description}</span>
                    )}
                    <button
                      className="ml-2 text-red-600 underline"
                      onClick={() => handleRemoveSubTask(link.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                placeholder="Search steps to add as sub-task..."
                className="border px-2 py-1 rounded flex-1"
                value={subTaskSearch}
                onChange={(e) => setSubTaskSearch(e.target.value)}
              />
            </div>
            <ul>
              {subTaskCandidates.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-xs py-1">
                  <span className="font-semibold">{s.name}</span>
                  {s.description && (
                    <span className="text-gray-600 ml-2">{s.description}</span>
                  )}
                  <button
                    className="ml-2 text-blue-600 underline"
                    onClick={() => handleAddSubTask(s.id)}
                  >
                    Add
                  </button>
                </li>
              ))}
              {subTaskCandidates.length === 0 && (
                <li className="text-xs text-gray-500">No steps found.</li>
              )}
            </ul>
          </>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => removeStep(step.step_id)}
          className="text-xs text-red-600 hover:underline"
        >
          Remove from Domain
        </button>
      </div>
    </div>
  );
};

export const DomainStepManager: React.FC<DomainStepManagerProps> = ({
  domainId,
  companyId,
}) => {
  const { currentUser } = useCompany();
  const {
    steps,
    recommendedSteps,
    loading,
    error,
    addStep,
    removeStep,
    bulkAddSteps,
    refreshRecommendations,
  } = useDomainSteps(domainId, companyId, currentUser?.id || null);

  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);

  const handleAddRecommendations = async () => {
    if (selectedRecommendations.length > 0) {
      await bulkAddSteps(selectedRecommendations);
      setSelectedRecommendations([]);
    }
  };

  const handleToggleRecommendation = (stepId: string) => {
    setSelectedRecommendations((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  if (loading) return <div>Loading domain steps...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="domain-step-manager">
      <h2 className="text-xl font-semibold mb-2">Domain Steps</h2>
      {/* Associated Steps Section */}
      <div className="domain-steps-section mb-6">
        <h3 className="font-semibold mb-1">Associated Steps ({steps.length})</h3>
        {steps.length === 0 ? (
          <p className="text-gray-500">No steps associated with this domain yet.</p>
        ) : (
          <div className="grid gap-3">
            {steps.map((step) => (
              <StepWithSubTasks
                key={step.id}
                step={step}
                allSteps={steps}
                removeStep={removeStep}
              />
            ))}
          </div>
        )}
      </div>
      {/* Recommended Steps Section */}
      <div className="recommended-steps-section">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">Recommended Steps ({recommendedSteps.length})</h3>
          <button
            onClick={refreshRecommendations}
            className="text-xs text-blue-600 hover:underline"
          >
            Refresh Recommendations
          </button>
        </div>
        {recommendedSteps.length === 0 ? (
          <p className="text-gray-500">No recommendations available.</p>
        ) : (
          <>
            <div className="grid gap-3">
              {recommendedSteps.map((step) => (
                <div
                  key={step.id}
                  className={`border rounded p-3 flex flex-col gap-1 bg-blue-50 ${
                    selectedRecommendations.includes(step.step_id) ? "ring-2 ring-blue-400" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">{step.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{step.phase_name}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{step.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Difficulty: {step.difficulty}/5</span>
                    <span>Time: {step.time_estimate} mins</span>
                    <span>Relevance: {Math.round(step.relevance_score * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedRecommendations.includes(step.step_id)}
                        onChange={() => handleToggleRecommendation(step.step_id)}
                      />
                      Select
                    </label>
                    <button
                      onClick={() => addStep(step.step_id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Add to Domain
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {selectedRecommendations.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddRecommendations}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                >
                  Add {selectedRecommendations.length} Selected Steps
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DomainStepManager;
