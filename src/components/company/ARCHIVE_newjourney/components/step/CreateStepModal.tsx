import React, { useState } from "react";
import { Step } from "../../types/journey.types";
import { Domain, Phase } from "../../types/journey.types";
import { useAIContext } from "../../../../../lib/services/ai/ai-context.provider.tsx";

interface CreateStepModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (step: Partial<Step> & { share: boolean }) => void;
  domains: Domain[];
  phases: Phase[];
}

const initialStep: Partial<Step> = {
  name: "",
  description: "",
  primary_domain_id: "",
  primary_phase_id: "",
  difficulty: "Medium",
  time_estimate: "",
  coverage_notes: "",
  howto_without_tools: "",
  audience: "",
  active: true,
  snippet_references: [],
  resource_links: [],
};

const CreateStepModal: React.FC<CreateStepModalProps> = ({
  open,
  onClose,
  onCreate,
  domains,
  phases,
}) => {
  const [step, setStep] = useState<Partial<Step>>(initialStep);
  const [share, setShare] = useState<boolean>(false);
  const { getSmartSuggestions, isLoading } = useAIContext();

  if (!open) return null;

  // AI-powered suggestions for each field
  const [lastAISuggestions, setLastAISuggestions] = useState<string[]>([]);
  const [aiFeedback, setAIFeedback] = useState<"up" | "down" | null>(null);

  async function getAISuggestions() {
    const [nameSuggestions, descSuggestions, timeSuggestions, notesSuggestions, howtoSuggestions, audienceSuggestions] = await Promise.all([
      getSmartSuggestions("step name", step.name || ""),
      getSmartSuggestions("description", step.description || ""),
      getSmartSuggestions("time estimate", step.time_estimate || ""),
      getSmartSuggestions("coverage notes", step.coverage_notes || ""),
      getSmartSuggestions("how-to", step.howto_without_tools || ""),
      getSmartSuggestions("audience", step.audience || "")
    ]);
    setStep(prev => ({
      ...prev,
      name: prev.name || nameSuggestions[0],
      description: prev.description || descSuggestions[0],
      time_estimate: prev.time_estimate || timeSuggestions[0],
      coverage_notes: prev.coverage_notes || notesSuggestions[0],
      howto_without_tools: prev.howto_without_tools || howtoSuggestions[0],
      audience: prev.audience || audienceSuggestions[0],
    }));
    // Track the suggestions for feedback
    setLastAISuggestions([
      nameSuggestions[0],
      descSuggestions[0],
      timeSuggestions[0],
      notesSuggestions[0],
      howtoSuggestions[0],
      audienceSuggestions[0],
    ]);
    setAIFeedback(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setStep(prev => ({ ...prev, [name]: value }));
  }

  function handleArrayChange(name: keyof Step, value: string) {
    setStep(prev => ({
      ...prev,
      [name]: value.split(",").map(s => s.trim()).filter(Boolean),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate({ ...step, share });
    setStep(initialStep);
    setShare(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Add a New Step</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
              onClick={getAISuggestions}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Get AI Suggestions"}
            </button>
          </div>
          {/* AI Feedback UI */}
          {lastAISuggestions.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-600">Were these AI suggestions helpful?</span>
              <button
                type="button"
                className={`px-2 py-1 rounded text-xs ${aiFeedback === "up" ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setAIFeedback("up")}
                aria-label="Thumbs up"
              >
                👍
              </button>
              <button
                type="button"
                className={`px-2 py-1 rounded text-xs ${aiFeedback === "down" ? "bg-red-200 text-red-800" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setAIFeedback("down")}
                aria-label="Thumbs down"
              >
                👎
              </button>
              {aiFeedback && (
                <span className="text-xs text-gray-500 ml-2">
                  {aiFeedback === "up" ? "Thanks for your feedback!" : "We'll use this to improve future suggestions."}
                </span>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center">
              Step Name
              <button
                type="button"
                className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs"
                onClick={async () => {
                  const suggestions = await getSmartSuggestions("step name", step.name || "");
                  if (suggestions[0]) setStep(prev => ({ ...prev, name: suggestions[0] }));
                }}
                disabled={isLoading}
                title="Get AI suggestion for step name"
              >
                ✨
              </button>
            </label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="name"
              value={step.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center">
              Description
              <button
                type="button"
                className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs"
                onClick={async () => {
                  const suggestions = await getSmartSuggestions("description", step.description || "");
                  if (suggestions[0]) setStep(prev => ({ ...prev, description: suggestions[0] }));
                }}
                disabled={isLoading}
                title="Get AI suggestion for description"
              >
                ✨
              </button>
            </label>
            <textarea
              className="border rounded px-2 py-1 w-full"
              name="description"
              value={step.description || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1">Domain</label>
              <select
                className="border rounded px-2 py-1 w-full"
                name="primary_domain_id"
                value={step.primary_domain_id || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1">Phase</label>
              <select
                className="border rounded px-2 py-1 w-full"
                name="primary_phase_id"
                value={step.primary_phase_id || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Difficulty</label>
            <select
              className="border rounded px-2 py-1 w-full"
              name="difficulty"
              value={step.difficulty || "Medium"}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Time Estimate</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="time_estimate"
              value={step.time_estimate || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Coverage Notes</label>
            <textarea
              className="border rounded px-2 py-1 w-full"
              name="coverage_notes"
              value={step.coverage_notes || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">How-To Without Tools</label>
            <textarea
              className="border rounded px-2 py-1 w-full"
              name="howto_without_tools"
              value={step.howto_without_tools || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Audience</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="audience"
              value={step.audience || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Snippet References (comma separated URLs)</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="snippet_references"
              value={Array.isArray(step.snippet_references) ? step.snippet_references.join(", ") : ""}
              onChange={e => handleArrayChange("snippet_references", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Resource Links (comma separated URLs)</label>
            <input
              className="border rounded px-2 py-1 w-full"
              name="resource_links"
              value={Array.isArray(step.resource_links) ? step.resource_links.join(", ") : ""}
              onChange={e => handleArrayChange("resource_links", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={share}
              onChange={e => setShare(e.target.checked)}
              id="share"
            />
            <label htmlFor="share" className="text-sm">Share this step with the community</label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStepModal;
