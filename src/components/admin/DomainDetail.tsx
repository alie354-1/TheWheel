import React, { useEffect, useState } from "react";
import { BusinessDomain } from "../../business-ops-hub/types/domain.types";
import {
  getCompanyDomainById,
  getDomainById,
  updateCompanyDomain,
  deleteCompanyDomain,
} from "../../business-ops-hub/services/domain.service";

/**
 * DomainDetail.tsx
 * Admin component for viewing and editing a business domain's details.
 * Allows editing name, description, icon, color, order, and shows mapped steps.
 */

interface DomainDetailProps {
  domainId: string;
  companyId: string | null;
  onClose: () => void;
  onDomainUpdated?: () => void;
  onDomainDeleted?: () => void;
}

const DomainDetail: React.FC<DomainDetailProps> = ({
  domainId,
  companyId,
  onClose,
  onDomainUpdated,
  onDomainDeleted,
}) => {
  const [domain, setDomain] = useState<BusinessDomain | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BusinessDomain>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStepManager, setShowStepManager] = useState(false);

  // AI suggestion state
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ step: any; score: number }[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  const getSuggestedStepsForDomain = require("../../business-ops-hub/services/domain.service").getSuggestedStepsForDomain;
  const batchAddStepsToDomain = require("../../business-ops-hub/services/domain.service").batchAddStepsToDomain;
  const getDomainSteps = require("../../business-ops-hub/services/domain.service").getDomainSteps;

  const handleGetSuggestions = async () => {
    setSuggesting(true);
    setSuggestionLoading(true);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    setAiError(null);
    setAiSuccess(null);
    try {
      const res = await getSuggestedStepsForDomain(domainId, companyId || null);
      setSuggestions(res);
      setSelectedSuggestions(new Set(res.map((s: any) => s.step.id)));
    } catch (e) {
      setAiError("Failed to get AI suggestions.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleToggleSuggestion = (stepId: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleSaveSuggestions = async () => {
    setAiError(null);
    setAiSuccess(null);
    setSuggestionLoading(true);
    try {
      await batchAddStepsToDomain(
        domainId,
        companyId || null,
        Array.from(selectedSuggestions)
      );
      setAiSuccess("AI suggested steps mapped successfully.");
      // Optionally refresh mapped steps here
      setSuggesting(false);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
    } catch (err) {
      setAiError("Failed to map AI suggestions.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchDomain = async () => {
      let data = null;
      if (!companyId) {
        data = await getDomainById(domainId);
      } else {
        data = await getCompanyDomainById(domainId, companyId);
      }
      setDomain(data);
      setForm(data || {});
    };
    fetchDomain()
      .catch(() => setError("Failed to load domain"))
      .finally(() => setLoading(false));
  }, [domainId, companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!domain) return;
    setLoading(true);
    setError(null);
    try {
      if (!companyId) {
        // TODO: Implement update for global domains if needed
        setError("Editing global domains is not supported.");
      } else {
        await updateCompanyDomain(domain.id, companyId, form);
        setEditing(false);
        if (onDomainUpdated) onDomainUpdated();
      }
    } catch (err: any) {
      setError("Failed to update domain");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!domain) return;
    if (!window.confirm("Are you sure you want to delete this domain?")) return;
    setLoading(true);
    setError(null);
    try {
      if (!companyId) {
        // TODO: Implement delete for global domains if needed
        setError("Deleting global domains is not supported.");
      } else {
        await deleteCompanyDomain(domain.id, companyId);
        if (onDomainDeleted) onDomainDeleted();
        onClose();
      }
    } catch (err: any) {
      setError("Failed to delete domain");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!domain) return <div className="p-4 text-red-600">Domain not found.</div>;

  return (
    <div className="p-4 border rounded bg-white shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Domain Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">
        <label className="block font-semibold">Name</label>
        <input
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          disabled={!editing}
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Description</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
          disabled={!editing}
        />
      </div>
      <div className="mb-2 flex gap-2">
        <div>
          <label className="block font-semibold">Icon</label>
          <input
            name="icon"
            value={form.icon || ""}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block font-semibold">Color</label>
          <input
            name="color"
            value={form.color || ""}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block font-semibold">Order</label>
          <input
            name="order_index"
            type="number"
            value={form.order_index ?? ""}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-20"
            disabled={!editing}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-3 py-1 rounded"
              disabled={loading}
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setForm(domain);
              }}
              className="bg-gray-300 px-3 py-1 rounded"
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-1 rounded"
              disabled={loading}
            >
              Delete
            </button>
          </>
        )}
      </div>
      {/* Mapped steps and step mapping interface */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Mapped Steps</h4>
        <div className="flex gap-2 mb-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={() => setShowStepManager(true)}
          >
            Manage Steps
          </button>
          <button
            className="bg-purple-600 text-white px-2 py-1 rounded"
            onClick={handleGetSuggestions}
            disabled={suggestionLoading}
          >
            {suggestionLoading ? "Loading AI..." : "AI Suggestions"}
          </button>
        </div>
        {showStepManager && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg max-w-2xl w-full">
              <DomainStepManager
                domainId={domain.id}
                companyId={companyId || ""}
                onClose={() => setShowStepManager(false)}
              />
            </div>
          </div>
        )}
        {/* AI Suggestions Modal */}
        {suggesting && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full">
              <h4 className="text-lg font-bold mb-2">
                AI Suggested Steps for Domain: {domain.name}
              </h4>
              {aiError && <div className="text-red-600 mb-2">{aiError}</div>}
              {aiSuccess && <div className="text-green-600 mb-2">{aiSuccess}</div>}
              {suggestionLoading ? (
                <div>Loading suggestions...</div>
              ) : (
                <>
                  {suggestions.length === 0 ? (
                    <div>No suggestions found.</div>
                  ) : (
                    <div className="mb-4 max-h-64 overflow-y-auto">
                      {suggestions.map(({ step, score }) => (
                        <label
                          key={step.id}
                          className="flex items-center gap-2 border-b py-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSuggestions.has(step.id)}
                            onChange={() => handleToggleSuggestion(step.id)}
                          />
                          <span>
                            <span className="font-semibold">{step.name}</span>
                            {step.description && (
                              <span className="text-xs text-gray-600 ml-2">
                                {step.description}
                              </span>
                            )}
                            <span className="ml-2 text-xs text-purple-700">
                              (Score: {score.toFixed(2)})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-3 py-1 rounded bg-gray-200"
                      onClick={() => {
                        setSuggesting(false);
                        setSuggestions([]);
                        setSelectedSuggestions(new Set());
                        setAiError(null);
                        setAiSuccess(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white"
                      onClick={handleSaveSuggestions}
                      disabled={selectedSuggestions.size === 0 || suggestionLoading}
                    >
                      Save Selected
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import DomainStepManager from "./DomainStepManager";

export default DomainDetail;
