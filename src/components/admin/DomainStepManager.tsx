import React, { useEffect, useState } from "react";
import { DomainStep } from "../../business-ops-hub/types/domain-extended.types";
import { getDomainSteps, addStepToDomain, removeStepFromDomain } from "../../business-ops-hub/services/domain.service";
import { supabase } from "../../lib/supabase";

/**
 * DomainStepManager.tsx
 * Admin component for managing steps mapped to a domain.
 * Allows viewing, adding, removing, and reordering steps.
 */

interface DomainStepManagerProps {
  domainId: string;
  companyId: string;
  onClose: () => void;
}

const DomainStepManager: React.FC<DomainStepManagerProps> = ({
  domainId,
  companyId,
  onClose,
}) => {
  const [steps, setSteps] = useState<DomainStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For step search/add
  const [allJourneySteps, setAllJourneySteps] = useState<any[]>([]);
  const [stepSearch, setStepSearch] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDomainSteps(domainId, companyId)
      .then((data) => setSteps(data))
      .catch(() => setError("Failed to load steps"))
      .finally(() => setLoading(false));
  }, [domainId, companyId]);

  useEffect(() => {
    // Fetch all journey steps for the add dropdown
    const fetchAllSteps = async () => {
      const { data, error } = await supabase
        .from("journey_steps")
        .select("*")
        .order("name", { ascending: true });
      if (!error) setAllJourneySteps(data || []);
    };
    fetchAllSteps();
  }, []);

  const handleAddStep = async (stepId: string) => {
    setAddLoading(true);
    setError(null);
    try {
      await addStepToDomain(domainId, stepId, companyId);
      // Refresh mapped steps
      const updated = await getDomainSteps(domainId, companyId);
      setSteps(updated);
      setStepSearch("");
    } catch (err: any) {
      setError("Failed to add step");
    } finally {
      setAddLoading(false);
    }
  };

  // TODO: Add UI for removing/reordering steps

  // Filter steps for search dropdown (exclude already mapped)
  const mappedStepIds = new Set(steps.map((s) => s.step_id));
  const filteredStepOptions = allJourneySteps.filter(
    (step) =>
      !mappedStepIds.has(step.id) &&
      (step.name?.toLowerCase().includes(stepSearch.toLowerCase()) ||
        step.description?.toLowerCase().includes(stepSearch.toLowerCase()))
  );

  return (
    <div className="p-4 bg-white rounded shadow max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Manage Mapped Steps</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Add Step Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Add Step to Domain</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search steps..."
            value={stepSearch}
            onChange={(e) => setStepSearch(e.target.value)}
            className="border px-2 py-1 rounded w-64"
          />
          <select
            className="border px-2 py-1 rounded w-80"
            value=""
            onChange={(e) => {
              if (e.target.value) handleAddStep(e.target.value);
            }}
            disabled={addLoading}
          >
            <option value="">Select a step to add...</option>
            {filteredStepOptions.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name} {step.description ? `- ${step.description}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Step Name</th>
              <th className="p-2 text-left">Custom Name</th>
              <th className="p-2 text-left">Custom Description</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.id} className="border-t">
                <td className="p-2">{step.name}</td>
                <td className="p-2">{step.custom_name || ""}</td>
                <td className="p-2">{step.custom_description || ""}</td>
                <td className="p-2">{step.priority_order ?? step.order_index ?? ""}</td>
                <td className="p-2">
                  <button
                    className="text-red-600"
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      try {
                        await removeStepFromDomain(domainId, step.step_id, companyId);
                        const updated = await getDomainSteps(domainId, companyId);
                        setSteps(updated);
                      } catch (err: any) {
                        setError("Failed to remove step");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {steps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-center text-gray-500">
                  No steps mapped to this domain.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {/* TODO: Add UI for reordering steps */}
      <div className="mt-4 flex justify-end">
        <button onClick={onClose} className="bg-gray-300 px-3 py-1 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default DomainStepManager;
