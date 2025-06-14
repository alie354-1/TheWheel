import React, { useState } from "react";
import { ScorecardCriterion } from "./ScorecardBuilder";

interface ToolEvaluationFormProps {
  toolId: string;
  criteria: ScorecardCriterion[];
  initialResponses?: Record<string, any>;
  initialNotes?: string;
  onSave: (responses: Record<string, any>, notes: string) => void;
  isSaving?: boolean;
}

const ToolEvaluationForm: React.FC<ToolEvaluationFormProps> = ({
  toolId,
  criteria,
  initialResponses = {},
  initialNotes = "",
  onSave,
  isSaving,
}) => {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [notes, setNotes] = useState(initialNotes);

  const handleChange = (label: string, value: any) => {
    setResponses((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(responses, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {criteria.map((criterion) => (
        <div key={criterion.label} className="form-control">
          <label className="label">{criterion.label}</label>
          {criterion.type === "number" ? (
            <input
              type="number"
              min={1}
              max={5}
              className="input input-bordered"
              value={responses[criterion.label] ?? ""}
              onChange={e => handleChange(criterion.label, Number(e.target.value))}
              required
            />
          ) : criterion.type === "boolean" ? (
            <select
              className="select select-bordered"
              value={responses[criterion.label] ?? ""}
              onChange={e => handleChange(criterion.label, e.target.value === "true")}
              required
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              type="text"
              className="input input-bordered"
              value={responses[criterion.label] ?? ""}
              onChange={e => handleChange(criterion.label, e.target.value)}
              required
            />
          )}
        </div>
      ))}
      <div className="form-control">
        <label className="label">Notes</label>
        <textarea
          className="textarea textarea-bordered"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary btn-sm"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          "Save Evaluation"
        )}
      </button>
    </form>
  );
};

export default ToolEvaluationForm;
