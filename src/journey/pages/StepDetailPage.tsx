import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JourneyService } from "../services/journey.service";
import { StepDetailWireframe } from "../components/step/StepDetailWireframe";
import StepRelationshipManager from "../components/step/StepRelationshipManager";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

/**
 * StepDetailPage
 * 
 * Displays the full wireframe for a single journey step.
 */
const StepDetailPage: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();
  const step = stepId ? JourneyService.getStepById(stepId) : undefined;
  const tools = JourneyService.getToolsForStep(stepId || "");

  // Recommended next steps state
  const [nextSteps, setNextSteps] = useState<{ to_step_id: string; probability_weight: number; step_name?: string }[]>([]);
  const [prereqSteps, setPrereqSteps] = useState<{ from_step_id: string; relationship_type: string; step_name?: string }[]>([]);

  useEffect(() => {
    async function fetchNextSteps() {
      if (!stepId) return;
      const { data, error } = await supabase
        .from("step_relationships")
        .select("to_step_id, probability_weight, steps!step_relationships_to_step_id_fkey(name)")
        .eq("from_step_id", stepId)
        .eq("relationship_type", "next")
        .order("probability_weight", { ascending: false });
      if (!error && data) {
        setNextSteps(
          data.map((row: any) => ({
            to_step_id: row.to_step_id,
            probability_weight: row.probability_weight,
            step_name: row.steps?.name
          }))
        );
      }
    }
    async function fetchPrereqSteps() {
      if (!stepId) return;
      const { data, error } = await supabase
        .from("step_relationships")
        .select("from_step_id, relationship_type, steps!step_relationships_from_step_id_fkey(name)")
        .eq("to_step_id", stepId)
        .in("relationship_type", ["prerequisite", "blocking"]);
      if (!error && data) {
        setPrereqSteps(
          data.map((row: any) => ({
            from_step_id: row.from_step_id,
            relationship_type: row.relationship_type,
            step_name: row.steps?.name
          }))
        );
      }
    }
    fetchNextSteps();
    fetchPrereqSteps();
  }, [stepId]);

  if (!step) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Step Not Found</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/journey")}
        >
          Back to All Steps
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <button
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded"
        onClick={() => navigate("/journey")}
      >
        ← Back to All Steps
      </button>
      <div className="max-w-7xl mx-auto">
        <StepDetailWireframe step={step} tools={tools} nextSteps={nextSteps} prereqSteps={prereqSteps} />
        <StepRelationshipManager stepId={stepId || ""} />
      </div>
    </div>
  );
};

export default StepDetailPage;
