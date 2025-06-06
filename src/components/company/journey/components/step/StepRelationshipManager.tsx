import React, { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabase.ts";

interface StepRelationship {
  id: string;
  from_step_id: string;
  to_step_id: string;
  relationship_type: string;
  probability_weight: number;
  success_criteria: any;
  conditions: any;
}

interface StepRelationshipManagerProps {
  stepId: string;
}

const RELATIONSHIP_TYPES = [
  "prerequisite",
  "parallel",
  "alternative",
  "next",
  "blocking"
];

export const StepRelationshipManager: React.FC<StepRelationshipManagerProps> = ({ stepId }) => {
  const [relationships, setRelationships] = useState<StepRelationship[]>([]);
  const [incomingRelationships, setIncomingRelationships] = useState<StepRelationship[]>([]);
  const [stepNames, setStepNames] = useState<Record<string, string>>({});
  const [toStepId, setToStepId] = useState("");
  const [relationshipType, setRelationshipType] = useState("next");
  const [probability, setProbability] = useState(0.5);
  const [loading, setLoading] = useState(false);
  // Structured success criteria state
  const [requiredDeliverables, setRequiredDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [qualityMetrics, setQualityMetrics] = useState<{ name: string; value: string }[]>([]);
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");
  const [timeConstraints, setTimeConstraints] = useState<{ deadline: string; description: string }[]>([]);
  const [newDeadline, setNewDeadline] = useState("");
  const [newTimeDesc, setNewTimeDesc] = useState("");

  useEffect(() => {
    fetchRelationships();
    fetchIncomingRelationships();
    fetchStepNames();
    // eslint-disable-next-line
  }, [stepId]);

  async function fetchRelationships() {
    setLoading(true);
    const { data, error } = await supabase
      .from("step_relationships")
      .select("*")
      .eq("from_step_id", stepId);
    if (!error && data) setRelationships(data);
    setLoading(false);
  }

  async function fetchIncomingRelationships() {
    const { data, error } = await supabase
      .from("step_relationships")
      .select("*")
      .eq("to_step_id", stepId);
    if (!error && data) setIncomingRelationships(data);
  }

  async function fetchStepNames() {
    // Fetch all steps referenced in relationships for display
    const stepIds = [
      ...relationships.map(r => r.to_step_id),
      ...relationships.map(r => r.from_step_id),
      ...incomingRelationships.map(r => r.to_step_id),
      ...incomingRelationships.map(r => r.from_step_id),
      stepId
    ];
    const uniqueStepIds = Array.from(new Set(stepIds)).filter(Boolean);
    if (uniqueStepIds.length === 0) return;
    const { data, error } = await supabase
      .from("steps")
      .select("id, name")
      .in("id", uniqueStepIds);
    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach((row: any) => {
        map[row.id] = row.name;
      });
      setStepNames(map);
    }
  }

  async function addRelationship() {
    if (!toStepId) return;
    setLoading(true);
    const success_criteria = {
      required_deliverables: requiredDeliverables,
      quality_metrics: qualityMetrics,
      time_constraints: timeConstraints
    };
    const { error } = await supabase
      .from("step_relationships")
      .insert([
        {
          from_step_id: stepId,
          to_step_id: toStepId,
          relationship_type: relationshipType,
          probability_weight: probability,
          success_criteria
        }
      ]);
    if (!error) {
      setToStepId("");
      setRelationshipType("next");
      setProbability(0.5);
      setRequiredDeliverables([]);
      setNewDeliverable("");
      setQualityMetrics([]);
      setNewMetricName("");
      setNewMetricValue("");
      setTimeConstraints([]);
      setNewDeadline("");
      setNewTimeDesc("");
      fetchRelationships();
      fetchIncomingRelationships();
      fetchStepNames();
    }
    setLoading(false);
  }

  async function deleteRelationship(id: string) {
    setLoading(true);
    await supabase.from("step_relationships").delete().eq("id", id);
    fetchRelationships();
    fetchIncomingRelationships();
    fetchStepNames();
    setLoading(false);
  }

  return (
    <div className="border rounded p-4 mt-6">
      <h3 className="text-md font-semibold mb-2">Step Relationships</h3>
      <div className="mb-4">
        <label className="block text-xs mb-1">To Step ID</label>
        <input
          type="text"
          value={toStepId}
          onChange={e => setToStepId(e.target.value)}
          className="border px-2 py-1 rounded text-xs w-64"
          placeholder="Enter target step ID"
        />
      </div>
      <div className="mb-2 flex gap-2 items-center">
        <label className="text-xs">Type</label>
        <select
          value={relationshipType}
          onChange={e => setRelationshipType(e.target.value)}
          className="text-xs border rounded"
        >
          {RELATIONSHIP_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <label className="text-xs ml-4">Probability</label>
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={probability}
          onChange={e => setProbability(Number(e.target.value))}
          className="text-xs border rounded w-16"
        />
        <button
          type="button"
          onClick={addRelationship}
          className="ml-4 px-2 py-1 bg-blue-600 text-white text-xs rounded"
          disabled={loading || !toStepId}
        >
          Add Relationship
        </button>
      </div>
      <div className="mb-2">
        <label className="block text-xs mb-1">Success Criteria</label>
        {/* Required Deliverables */}
        <div className="mb-1">
          <span className="text-xs font-semibold">Required Deliverables:</span>
          <ul className="inline ml-2">
            {requiredDeliverables.map((d, i) => (
              <li key={i} className="inline mr-2">
                <span className="bg-gray-200 px-2 py-0.5 rounded">{d}</span>
                <button
                  type="button"
                  className="ml-1 text-red-500"
                  onClick={() =>
                    setRequiredDeliverables(requiredDeliverables.filter((_, idx) => idx !== i))
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newDeliverable}
            onChange={e => setNewDeliverable(e.target.value)}
            className="border px-1 py-0.5 rounded text-xs ml-2 w-32"
            placeholder="Add deliverable"
            onKeyDown={e => {
              if (e.key === "Enter" && newDeliverable.trim()) {
                setRequiredDeliverables([...requiredDeliverables, newDeliverable.trim()]);
                setNewDeliverable("");
              }
            }}
          />
          <button
            type="button"
            className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded"
            onClick={() => {
              if (newDeliverable.trim()) {
                setRequiredDeliverables([...requiredDeliverables, newDeliverable.trim()]);
                setNewDeliverable("");
              }
            }}
          >
            Add
          </button>
        </div>
        {/* Quality Metrics */}
        <div className="mb-1">
          <span className="text-xs font-semibold">Quality Metrics:</span>
          <ul className="inline ml-2">
            {qualityMetrics.map((m, i) => (
              <li key={i} className="inline mr-2">
                <span className="bg-gray-200 px-2 py-0.5 rounded">{m.name}: {m.value}</span>
                <button
                  type="button"
                  className="ml-1 text-red-500"
                  onClick={() =>
                    setQualityMetrics(qualityMetrics.filter((_, idx) => idx !== i))
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            value={newMetricName}
            onChange={e => setNewMetricName(e.target.value)}
            className="border px-1 py-0.5 rounded text-xs ml-2 w-20"
            placeholder="Metric"
          />
          <input
            type="text"
            value={newMetricValue}
            onChange={e => setNewMetricValue(e.target.value)}
            className="border px-1 py-0.5 rounded text-xs ml-2 w-16"
            placeholder="Value"
            onKeyDown={e => {
              if (e.key === "Enter" && newMetricName.trim() && newMetricValue.trim()) {
                setQualityMetrics([...qualityMetrics, { name: newMetricName.trim(), value: newMetricValue.trim() }]);
                setNewMetricName("");
                setNewMetricValue("");
              }
            }}
          />
          <button
            type="button"
            className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded"
            onClick={() => {
              if (newMetricName.trim() && newMetricValue.trim()) {
                setQualityMetrics([...qualityMetrics, { name: newMetricName.trim(), value: newMetricValue.trim() }]);
                setNewMetricName("");
                setNewMetricValue("");
              }
            }}
          >
            Add
          </button>
        </div>
        {/* Time Constraints */}
        <div>
          <span className="text-xs font-semibold">Time Constraints:</span>
          <ul className="inline ml-2">
            {timeConstraints.map((t, i) => (
              <li key={i} className="inline mr-2">
                <span className="bg-gray-200 px-2 py-0.5 rounded">
                  {t.deadline} {t.description && `(${t.description})`}
                </span>
                <button
                  type="button"
                  className="ml-1 text-red-500"
                  onClick={() =>
                    setTimeConstraints(timeConstraints.filter((_, idx) => idx !== i))
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <input
            type="date"
            value={newDeadline}
            onChange={e => setNewDeadline(e.target.value)}
            className="border px-1 py-0.5 rounded text-xs ml-2 w-28"
          />
          <input
            type="text"
            value={newTimeDesc}
            onChange={e => setNewTimeDesc(e.target.value)}
            className="border px-1 py-0.5 rounded text-xs ml-2 w-32"
            placeholder="Description"
            onKeyDown={e => {
              if (e.key === "Enter" && newDeadline) {
                setTimeConstraints([...timeConstraints, { deadline: newDeadline, description: newTimeDesc }]);
                setNewDeadline("");
                setNewTimeDesc("");
              }
            }}
          />
          <button
            type="button"
            className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded"
            onClick={() => {
              if (newDeadline) {
                setTimeConstraints([...timeConstraints, { deadline: newDeadline, description: newTimeDesc }]);
                setNewDeadline("");
                setNewTimeDesc("");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-xs font-semibold mb-1">Outgoing Relationships</h4>
        {loading ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : (
          <ul className="text-xs">
            {relationships.map(rel => (
              <li key={rel.id} className="mb-1 flex items-center gap-2">
                <span className="font-mono">{stepNames[rel.from_step_id] || rel.from_step_id}</span>
                <span className="text-gray-500">{rel.relationship_type}</span>
                <span>→</span>
                <span className="font-mono">{stepNames[rel.to_step_id] || rel.to_step_id}</span>
                <span className="text-gray-400">({(rel.probability_weight * 100).toFixed(0)}%)</span>
                {rel.success_criteria && Object.keys(rel.success_criteria).length > 0 && (
                  <span className="text-gray-500 ml-2">
                    <span className="italic">criteria:</span>{" "}
                    <span className="font-mono">{JSON.stringify(rel.success_criteria)}</span>
                  </span>
                )}
                <button
                  type="button"
                  className="text-red-500 hover:underline ml-2"
                  onClick={() => deleteRelationship(rel.id)}
                >
                  Delete
                </button>
              </li>
            ))}
            {relationships.length === 0 && (
              <li className="text-gray-400">No outgoing relationships defined for this step.</li>
            )}
          </ul>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-xs font-semibold mb-1">Incoming Relationships</h4>
        {loading ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : (
          <ul className="text-xs">
            {incomingRelationships.map(rel => (
              <li key={rel.id} className="mb-1 flex items-center gap-2">
                <span className="font-mono">{stepNames[rel.from_step_id] || rel.from_step_id}</span>
                <span className="text-gray-500">{rel.relationship_type}</span>
                <span>→</span>
                <span className="font-mono">{stepNames[rel.to_step_id] || rel.to_step_id}</span>
                <span className="text-gray-400">({(rel.probability_weight * 100).toFixed(0)}%)</span>
                {rel.success_criteria && Object.keys(rel.success_criteria).length > 0 && (
                  <span className="text-gray-500 ml-2">
                    <span className="italic">criteria:</span>{" "}
                    <span className="font-mono">{JSON.stringify(rel.success_criteria)}</span>
                  </span>
                )}
                <button
                  type="button"
                  className="text-red-500 hover:underline ml-2"
                  onClick={() => deleteRelationship(rel.id)}
                >
                  Delete
                </button>
              </li>
            ))}
            {incomingRelationships.length === 0 && (
              <li className="text-gray-400">No incoming relationships for this step.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StepRelationshipManager;
