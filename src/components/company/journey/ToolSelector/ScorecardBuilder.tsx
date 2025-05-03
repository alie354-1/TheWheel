import React, { useState } from "react";

export interface ScorecardCriterion {
  label: string;
  type: "number" | "text" | "boolean";
}

interface ScorecardBuilderProps {
  initialCriteria?: ScorecardCriterion[];
  onSave: (criteria: ScorecardCriterion[]) => void;
  isSaving?: boolean;
}

const ScorecardBuilder: React.FC<ScorecardBuilderProps> = ({
  initialCriteria = [],
  onSave,
  isSaving,
}) => {
  const [criteria, setCriteria] = useState<ScorecardCriterion[]>(initialCriteria);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"number" | "text" | "boolean">("number");

  const addCriterion = () => {
    if (!label) return;
    setCriteria([...criteria, { label, type }]);
    setLabel("");
    setType("number");
  };

  const removeCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (criteria.length > 0) {
      onSave(criteria);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Build a Custom Scorecard</h3>
      <div className="flex gap-2 mb-2">
        <input
          className="input input-bordered"
          placeholder="Criterion label"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={type}
          onChange={e => setType(e.target.value as "number" | "text" | "boolean")}
        >
          <option value="number">Number (1-5)</option>
          <option value="text">Text</option>
          <option value="boolean">Yes/No</option>
        </select>
        <button className="btn btn-sm btn-primary" type="button" onClick={addCriterion}>
          Add
        </button>
      </div>
      <ul className="mb-2">
        {criteria.map((c, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="font-semibold">{c.label}</span>
            <span className="badge badge-outline">{c.type}</span>
            <button
              className="btn btn-xs btn-outline btn-error"
              type="button"
              onClick={() => removeCriterion(idx)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        className="btn btn-success btn-sm"
        type="button"
        onClick={handleSave}
        disabled={isSaving || criteria.length === 0}
      >
        {isSaving ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          "Save Scorecard"
        )}
      </button>
    </div>
  );
};

export default ScorecardBuilder;
