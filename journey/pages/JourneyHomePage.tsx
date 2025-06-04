import React, { useEffect, useState } from "react";
import { JourneyService } from "../services/journey.service";
import { StepsList } from "../components/step/StepsList";
import SmartJourneyDashboard from "../components/SmartJourneyDashboard";
import StepDetailsModal from "../components/step/StepDetailsModal";
import StepsFilterPanel from "../components/step/StepsFilterPanel";
import CompanyStepsSection from "../components/step/CompanyStepsSection";
import CompanyStepsSidebar from "../components/step/CompanyStepsSidebar";
import RecommendedStepsPanel from "../components/step/RecommendedStepsPanel";
import AllStepsModal from "../components/step/AllStepsModal";
import CreateStepModal from "../components/step/CreateStepModal";
import { Step } from "../types/journey.types";
import { Task } from "../../lib/types/task.types";
import { taskService } from "../../lib/services/task.service";
import { AIProvider } from "../../lib/services/ai/ai-context.provider";
import CommunityStepsModal from "../components/step/CommunityStepsModal";
import { StepDetailWireframe } from "../components/step/StepDetailWireframe";
import StepRelationshipManager from "../components/step/StepRelationshipManager";
import { supabase } from "../../lib/supabase";

// Placeholder for companyMetadata (replace with real context/provider as needed)
const companyMetadata = {
  priorities: ["Product Development"]
};

const JourneyHomePage: React.FC = () => {
  const [domains, setDomains] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);

  // Fetch domains and phases from DB on mount
  useEffect(() => {
    async function fetchMeta() {
      const dbDomains = await JourneyService.getDomains();
      setDomains(dbDomains);
      const dbPhases = await JourneyService.getPhases();
      setPhases(dbPhases);
    }
    fetchMeta();
  }, []);

  // Filter state
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Steps state (now local, to allow adding)
  const [steps, setSteps] = useState<any[]>([]);
  const [allSteps, setAllSteps] = useState<any[]>([]);

  // Company ID (replace with real company context/provider as needed)
  const companyId = "YOUR_COMPANY_ID_HERE"; // TODO: Replace with actual company ID from context

  // Fetch only company steps from DB
  const fetchCompanySteps = async () => {
    if (!companyId) return;
    const { data: cjs, error: cjsError } = await supabase
      .from("company_journey_steps")
      .select("step_id")
      .eq("company_id", companyId)
      .not("status", "eq", "not_started");
    if (cjsError) {
      console.error("Failed to fetch company_journey_steps:", cjsError);
      setSteps([]);
      return;
    }
    const stepIds = (cjs || []).map((row: any) => row.step_id);
    if (stepIds.length === 0) {
      setSteps([]);
      return;
    }
    const { data: dbSteps, error: stepsError } = await supabase
      .from("steps")
      .select("*")
      .in("id", stepIds);
    if (stepsError) {
      console.error("Failed to fetch steps for company:", stepsError);
      setSteps([]);
      return;
    }
    setSteps(dbSteps || []);
  };

  useEffect(() => {
    fetchCompanySteps();
  }, [companyId]);

  // Fetch all steps for the "View All Steps" modal
  useEffect(() => {
    async function fetchAllSteps() {
      const { data, error } = await supabase.from("steps").select("*");
      if (error) {
        console.error("Failed to fetch all steps:", error);
        setAllSteps([]);
        return;
      }
      setAllSteps(data || []);
    }
    fetchAllSteps();
  }, []);

  // Modal and detail state
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPeerRate, setModalPeerRate] = useState<number | undefined>(undefined);
  const [modalPeerInsights, setModalPeerInsights] = useState<string[] | undefined>(undefined);

  // View mode: "dashboard" | "step-detail"
  const [viewMode, setViewMode] = useState<"dashboard" | "step-detail">("dashboard");
  const [stepDetailStep, setStepDetailStep] = useState<Step | null>(null);
  const [stepDetailTools, setStepDetailTools] = useState<any[]>([]);
  const [stepDetailNextSteps, setStepDetailNextSteps] = useState<any[]>([]);
  const [stepDetailPrereqSteps, setStepDetailPrereqSteps] = useState<any[]>([]);

  // Fetch tools, nextSteps, prereqSteps for step-detail view
  useEffect(() => {
    async function fetchStepDetailData() {
      if (!stepDetailStep) return;
      setStepDetailTools(JourneyService.getToolsForStep(stepDetailStep.id));
      // Next steps
      const { data: nextData, error: nextError } = await supabase
        .from("step_relationships")
        .select("to_step_id, probability_weight, steps!step_relationships_to_step_id_fkey(name)")
        .eq("from_step_id", stepDetailStep.id)
        .eq("relationship_type", "next")
        .order("probability_weight", { ascending: false });
      if (!nextError && nextData) {
        setStepDetailNextSteps(
          nextData.map((row: any) => ({
            to_step_id: row.to_step_id,
            probability_weight: row.probability_weight,
            step_name: row.steps?.name
          }))
        );
      }
      // Prereq steps
      const { data: prereqData, error: prereqError } = await supabase
        .from("step_relationships")
        .select("from_step_id, relationship_type, steps!step_relationships_from_step_id_fkey(name)")
        .eq("to_step_id", stepDetailStep.id)
        .in("relationship_type", ["prerequisite", "blocking"]);
      if (!prereqError && prereqData) {
        setStepDetailPrereqSteps(
          prereqData.map((row: any) => ({
            from_step_id: row.from_step_id,
            relationship_type: row.relationship_type,
            step_name: row.steps?.name
          }))
        );
      }
    }
    if (viewMode === "step-detail" && stepDetailStep) {
      fetchStepDetailData();
    }
  }, [viewMode, stepDetailStep]);

  // Step progress state
  const [stepTasks, setStepTasks] = useState<Record<string, { total: number; completed: number }>>({});

  // StepsWithStatus state
  const [stepsWithStatus, setStepsWithStatus] = useState<
    { step: Step; status: "completed" | "ready" | "blocked"; recommended?: boolean; completion?: number }[]
  >([]);

  // All Steps Modal state
  const [allStepsModalOpen, setAllStepsModalOpen] = useState(false);

  // Create Step Modal state
  const [createStepModalOpen, setCreateStepModalOpen] = useState(false);

  // Community Steps Modal state
  const [communityStepsModalOpen, setCommunityStepsModalOpen] = useState(false);

  // Compute step statuses and progress
  useEffect(() => {
    async function computeStatuses() {
      const newStepTasks: Record<string, { total: number; completed: number }> = {};
      const newStepsWithStatus: {
        step: Step;
        status: "completed" | "ready" | "blocked";
        recommended?: boolean;
        completion?: number;
      }[] = [];

      await Promise.all(
        steps.map(async (step) => {
          const tasks = await taskService.getTasks({ stepId: step.id });
          const total = tasks.length;
          const completed = tasks.filter((t: Task) => t.status === "completed").length;
          newStepTasks[step.id] = { total, completed };

          // Example status logic
          let status: "completed" | "ready" | "blocked" = "ready";
          let completion = 0;
          if (total > 0) {
            completion = completed / total;
            if (completed === total) status = "completed";
            else if (completed < total) status = "ready";
          }
          newStepsWithStatus.push({
            step,
            status,
            completion,
            recommended: false // Placeholder, real logic can be added
          });
        })
      );
      setStepTasks(newStepTasks);
      setStepsWithStatus(newStepsWithStatus);
    }
    computeStatuses();
  }, [steps]);

  // Handler for creating a new step
  function handleCreateStep(newStep: Partial<Step> & { share: boolean }) {
    // For demo, just add to local steps array
    const id = crypto.randomUUID();
    setSteps(prev => [
      ...prev,
      {
        ...newStep,
        id,
        created_at: new Date().toISOString(),
        active: true,
        snippet_references: newStep.snippet_references || [],
        resource_links: newStep.resource_links || [],
      } as Step,
    ]);
    // Optionally: handle sharing logic here
  }

  // Filter shared steps (for demo, any step with share === true)
  const sharedSteps = steps.filter((s: any) => s.share === true || s.shared === true);

  // Restore dashboardRecommendations definition (was lost in previous edits)
  const dashboardRecommendations = companyMetadata
    ? [
        {
          title: "Validate Product-Market Fit",
          description: companyMetadata.priorities?.includes("Product Development")
            ? "Talk to 15-25 potential customers to identify real needs for your product."
            : "Talk to 15-25 potential customers to identify real needs.",
          peerRate: 73
        },
        {
          title: "Build MVP",
          description: "Create a minimum viable product to test your core hypothesis.",
          peerRate: 45
        }
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Sidebar */}
      <CompanyStepsSidebar
        stepsWithStatus={stepsWithStatus}
        domains={domains}
        phases={phases}
        onViewStep={step => {
          const s = stepsWithStatus.find(x => x.step.id === step.id);
          setSelectedStep(step);
          setModalPeerRate(s?.recommended ? 73 : undefined);
          setModalPeerInsights(
            s?.recommended
              ? [
                  "67% of SaaS startups are focusing on customer interviews this month.",
                  "Most companies spend 2-4 weeks on market validation before building."
                ]
              : undefined
          );
          setModalOpen(true);
        }}
        onAddStep={() => setCreateStepModalOpen(true)}
        onDeleteStep={stepId => {
          setSteps(prev => prev.filter(s => s.id !== stepId));
        }}
        onOpenStep={stepId => {
          const step = steps.find(s => s.id === stepId) || null;
          setStepDetailStep(step);
          setViewMode("step-detail");
        }}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {viewMode === "dashboard" ? (
          <>
            <div className="flex justify-between items-center w-full mb-8 mt-10 px-8">
              <h1 className="text-3xl font-bold text-center">Journey</h1>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                  onClick={() => window.location.assign("/journey/map")}
                >
                  View Journey Map
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
                  onClick={() => setCommunityStepsModalOpen(true)}
                >
                  Browse Community Steps
                </button>
              </div>
            </div>
            {/* Recommended Next Steps */}
            <div className="w-full mb-8 px-8">
              <AIProvider>
                <RecommendedStepsPanel
                  recommendations={
                    dashboardRecommendations.filter(rec => {
                      // Find the corresponding step
                      const step = steps.find(
                        s => s.name.toLowerCase() === rec.title.toLowerCase()
                      );
                      if (!step) return false;
                      // Find the status for this step
                      const statusObj = stepsWithStatus.find(s => s.step.id === step.id);
                      // Exclude if started (completion > 0 or status !== "ready")
                      if (!statusObj) return true;
                      if (statusObj.completion && statusObj.completion > 0) return false;
                      if (statusObj.status !== "ready") return false;
                      return true;
                    })
                  }
                  steps={steps}
                  onViewDetails={(step) => {
                    const s = stepsWithStatus.find(x => x.step.id === step.id);
                    setSelectedStep(step);
                    setModalPeerRate(s?.recommended ? 73 : undefined);
                    setModalPeerInsights(
                      s?.recommended
                        ? [
                            "67% of SaaS startups are focusing on customer interviews this month.",
                            "Most companies spend 2-4 weeks on market validation before building."
                          ]
                        : undefined
                    );
                    setModalOpen(true);
                  }}
                  onViewAll={() => setAllStepsModalOpen(true)}
                />
                <AllStepsModal
                  open={allStepsModalOpen}
                  steps={
                    (() => {
                      // Debug: log ids
                      console.log("allSteps ids:", allSteps.map(s => s.id));
                      console.log("company steps ids:", steps.map(cs => cs.id));
                      return allSteps.filter(
                        s => !steps.some(cs => cs.id === s.id)
                      );
                    })()
                  }
                  stepsWithStatus={stepsWithStatus}
                  domains={domains}
                  phases={phases}
                  onClose={() => setAllStepsModalOpen(false)}
                  onViewDetails={async (step) => {
                    // Add to company_journey_steps if not already present
                    if (!companyId) return;
                    const { data: existing, error: existingError } = await supabase
                      .from("company_journey_steps")
                      .select("id")
                      .eq("company_id", companyId)
                      .eq("step_id", step.id)
                      .maybeSingle();
                    if (!existing && !existingError) {
                      await supabase
                        .from("company_journey_steps")
                        .insert([
                          {
                            company_id: companyId,
                            step_id: step.id,
                            status: "ready"
                          }
                        ]);
                    }
                    // Refetch company steps and update state before showing detail
                    await fetchCompanySteps();
                    // Show in main pane (not full screen)
                    setStepDetailStep(step);
                    setViewMode("step-detail");
                    setAllStepsModalOpen(false);
                  }}
                />
                <CreateStepModal
                  open={createStepModalOpen}
                  onClose={() => setCreateStepModalOpen(false)}
                  onCreate={handleCreateStep}
                  domains={domains}
                  phases={phases}
                />
              </AIProvider>
            </div>
            {/* Peer Insights and Progress */}
            <div className="w-full mb-8 px-8">
              <SmartJourneyDashboard
                recommendations={[]} // Only show peer insights and progress
                peerInsights={[
                  "67% of SaaS startups are focusing on customer interviews this month.",
                  "Most companies spend 2-4 weeks on market validation before building."
                ]}
                progressSummary={{
                  Strategy: "80",
                  Product: "60",
                  Operations: "30"
                }}
              />
            </div>
            {/* Step Details Modal */}
            {selectedStep && (
              <StepDetailsModal
                open={modalOpen}
                step={selectedStep}
                peerRate={modalPeerRate}
                peerInsights={modalPeerInsights}
                onClose={() => setModalOpen(false)}
                onOpenFullStep={step => {
                  setStepDetailStep(step);
                  setViewMode("step-detail");
                  setModalOpen(false);
                }}
              />
            )}
            {/* Community Steps Modal */}
            <CommunityStepsModal
              open={communityStepsModalOpen}
              sharedSteps={sharedSteps}
              domains={domains}
              phases={phases}
              onClose={() => setCommunityStepsModalOpen(false)}
              onImport={step => {
                // Import: add to user's steps (with a new id)
                const id = crypto.randomUUID();
                setSteps(prev => [
                  ...prev,
                  {
                    ...step,
                    id,
                    created_at: new Date().toISOString(),
                    active: true,
                    share: false, // imported steps are not shared by default
                  } as Step,
                ]);
                setCommunityStepsModalOpen(false);
              }}
            />
          </>
        ) : (
          // Step Detail View
          <div className="w-full h-full flex flex-col px-8 py-10">
            <button
              className="mb-4 w-fit px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setViewMode("dashboard")}
            >
              ← Back to Journey
            </button>
            {stepDetailStep ? (
              <div className="max-w-7xl mx-auto">
                <StepDetailWireframe
                  step={stepDetailStep}
                  tools={stepDetailTools}
                  nextSteps={stepDetailNextSteps}
                  prereqSteps={stepDetailPrereqSteps}
                />
                <StepRelationshipManager stepId={stepDetailStep.id} />
              </div>
            ) : (
              <div>No step selected.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyHomePage;
