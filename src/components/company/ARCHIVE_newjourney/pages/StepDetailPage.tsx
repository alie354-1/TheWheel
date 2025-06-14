import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JourneyService } from "../services/journey.service";
import { StepDetailWireframe } from "../components/step/StepDetailWireframe";
import StepRelationshipManager from "../components/step/StepRelationshipManager";
import { supabase } from "../../../../lib/supabase.ts";
import type { Step } from "../types/journey.types";

/**
 * StepDetailPage
 * 
 * Displays the full wireframe for a single journey step.
 */
const StepDetailPage: React.FC = () => {
  const { stepId } = useParams<{ stepId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recommended next steps state
  const [nextSteps, setNextSteps] = useState<{ to_step_id: string; probability_weight: number; step_name?: string }[]>([]);
  const [prereqSteps, setPrereqSteps] = useState<{ from_step_id: string; relationship_type: string; step_name?: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchStepData() {
      setLoading(true);
      setError(null);
      setStep(null);
      setTools([]);
      console.log("[StepDetailPage] stepId param:", stepId);
      if (!stepId) {
        setLoading(false);
        setStep(null);
        return;
      }
      try {
        const fetchedStep = await JourneyService.getStepById(stepId);
        console.log("[StepDetailPage] Supabase getStepById result:", fetchedStep);
        if (isMounted) {
          if (fetchedStep) {
            setStep(fetchedStep);
            setTools(JourneyService.getToolsForStep(stepId));
          } else {
            setStep(null);
          }
        }
      } catch (err) {
        console.error("[StepDetailPage] Error fetching step:", err);
        if (isMounted) {
          setError("Failed to load step.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStepData();
    return () => {
      isMounted = false;
    };
  }, [stepId]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Loading Step...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/journey")}
        >
          Back to All Steps
        </button>
      </div>
    );
  }

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
