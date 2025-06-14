import React, { useEffect, useState } from "react";
import { journeyFrameworkService } from "../../../../lib/services/journeyFramework.service";
import { companyJourneyServiceEnhanced } from "../../../../lib/services/companyJourneyEnhanced.service";
import { journeyProgressService, SmartRecommendation } from "../../../../lib/services/journeyProgress.service";
import { communityJourneyIntegrationService } from "../../../../lib/services/communityJourneyIntegration.service";
import { 
  JourneyPhase, 
  CompanyJourneyStep,
  step_status
} from "../../../../lib/types/journey-unified.types";
import { useCompany } from "../../../../lib/hooks/useCompany";
import SmartJourneyDashboard from "../components/SmartJourneyDashboard";
import FrameworkStepsBrowser from "../components/FrameworkStepsBrowser";
import TemplateUpdateNotifications from "../components/TemplateUpdateNotifications";

// Placeholder for companyMetadata (replace with real context/provider as needed)
const companyMetadata = {
  priorities: ["Product Development"]
};

const JourneyHomePage: React.FC = () => {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;
  
  // Add debug logging
  useEffect(() => {
    console.log("JourneyHomePage: companyId from useCompany hook", companyId);
  }, [companyId]);
  const [domains, setDomains] = useState<JourneyDomain[]>([]);
  const [phases, setPhases] = useState<JourneyPhase[]>([]);

  // Fetch domains and phases from DB on mount
  useEffect(() => {
    async function fetchMeta() {
      try {
        const dbDomains = await journeyFrameworkService.getDomains();
        setDomains(dbDomains);
        const dbPhases = await journeyFrameworkService.getPhases();
        setPhases(dbPhases);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    }
    fetchMeta();
  }, []);

  // Adapter functions to convert new types to old component interfaces
  const adaptDomainsForComponent = (domains: JourneyDomain[]) => {
    return domains.map(domain => ({
      id: domain.id,
      key: domain.id,
      name: domain.name,
      description: domain.description,
      color: domain.color,
      icon_url: domain.icon_url,
      is_active: domain.is_active,
      metadata: domain.metadata,
      created_at: domain.created_at,
      updated_at: domain.updated_at
    }));
  };

  const adaptPhasesForComponent = (phases: JourneyPhase[]) => {
    return phases.map(phase => ({
      id: phase.id,
      key: phase.id,
      name: phase.name,
      description: phase.description,
      order_index: phase.order_index,
      icon_url: phase.icon_url,
      color: phase.color,
      is_active: phase.is_active,
      metadata: phase.metadata,
      created_at: phase.created_at,
      updated_at: phase.updated_at
    }));
  };

  // Filter state
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  // Steps state (now local, to allow adding)
  const [steps, setSteps] = useState<any[]>([]);
  const [allSteps, setAllSteps] = useState<any[]>([]);

  // Company ID is now passed as a prop

  // Fetch only company steps from DB
  const fetchCompanySteps = async () => {
    if (!companyId) return;
    // Fetch all company steps for this company, regardless of status
    const { data: cjs, error: cjsError } = await supabase
      .from("company_journey_steps")
      .select("template_id")
      .eq("company_id", companyId);
    if (cjsError) {
      console.error("Failed to fetch company_journey_steps:", cjsError);
      setSteps([]);
      return;
    }
    const templateIds = (cjs || []).map((row: any) => row.template_id);
    if (templateIds.length === 0) {
      setSteps([]);
      return;
    }
    const { data: dbSteps, error: stepsError } = await supabase
      .from("journey_step_templates")
      .select("*")
      .in("id", templateIds);
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
      const { data, error } = await supabase.from("journey_step_templates").select("*");
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

  // View mode: "dashboard" | "step-detail" | "team"
  const [viewMode, setViewMode] = useState<"dashboard" | "step-detail" | "team">("dashboard");
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
        .from("journey_step_template_dependencies")
        .select("depends_on_template_id, dependency_type, journey_step_templates!journey_step_template_dependencies_depends_on_template_id_fkey(name)")
        .eq("step_template_id", stepDetailStep.id)
        .eq("dependency_type", "suggested");
      if (!nextError && nextData) {
        setStepDetailNextSteps(
          nextData.map((row: any) => ({
            to_step_id: row.depends_on_template_id,
            probability_weight: 0,
            step_name: row.journey_step_templates?.name
          }))
        );
      }
      // Prereq steps
      const { data: prereqData, error: prereqError } = await supabase
        .from("journey_step_template_dependencies")
        .select("step_template_id, dependency_type, journey_step_templates!journey_step_template_dependencies_step_template_id_fkey(name)")
        .eq("depends_on_template_id", stepDetailStep.id)
        .in("dependency_type", ["prerequisite", "blocking"]);
      if (!prereqError && prereqData) {
        setStepDetailPrereqSteps(
          prereqData.map((row: any) => ({
            from_step_id: row.step_template_id,
            relationship_type: row.dependency_type,
            step_name: row.journey_step_templates?.name
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
          // Adjust the parameter to match what taskService.getTasks accepts
          const tasks = await taskService.getTasks({ category: step.id });
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
        is_active: true,
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
    <AIProvider>
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="flex-shrink-0 lg:mr-8">
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
          onOpenStep={(stepId) => {
            const step = steps.find(s => s.id === stepId) || null;
            setStepDetailStep(step);
            setViewMode("step-detail");
          }}
        />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-8">
        {viewMode === "dashboard" || viewMode === "team" ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-8 mt-10 px-0">
              <h1 className="text-3xl font-bold text-center mb-4 sm:mb-0">Journey</h1>
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                  onClick={() => window.location.assign("/company/members")}
                >
                  Team Members
                </button>
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
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                  onClick={() => window.location.assign("/company/journey/submit-step")}
                >
                  Submit a Step
                </button>
                <button
                  className="px-4 py-2 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700"
                  onClick={() => window.location.assign("/company/journey/community-steps")}
                >
                  View Community Steps
                </button>
              </div>
            </div>
            
            {/* AI Recommendation Panel */}
            <div className="w-full mb-8 px-0">
              <AiRecommendationPanel />
            </div>

            {/* Journey Analytics Dashboard */}
            <div className="w-full mb-8 px-0">
              <JourneyAnalyticsDashboard />
            </div>

            {/* Recommended Next Steps */}
            <div className="w-full mb-8 px-0">
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
                    return allSteps.filter(
                      s => !steps.some(cs => cs.id === s.id)
                    );
                  })()
                }
                stepsWithStatus={stepsWithStatus}
                domains={domains}
                phases={phases}
                selectedDomain={selectedDomain}
                selectedPhase={selectedPhase}
                onSelectedDomainChange={setSelectedDomain}
                onSelectedPhaseChange={setSelectedPhase}
                onClose={() => setAllStepsModalOpen(false)}
                onViewDetails={step => {
                  setSelectedStep(step);
                  setModalPeerRate(undefined);
                  setModalPeerInsights(undefined);
                  setModalOpen(true);
                }}
                onStartStep={async (step) => {
                  // Insert into company_journey_steps
                  console.log("onStartStep: companyId", companyId);
                  if (!companyId) {
                    alert("Company ID not set.");
                    return;
                  }
                  const { data, error } = await supabase
                    .from("company_journey_steps")
                    .insert([
                      {
                        company_id: companyId,
                        template_id: step.id,
                        name: step.name,
                        description: step.description,
                        phase_id: step.phase_id,
                        domain_id: step.domain_id,
                        status: "not_started",
                        created_at: new Date().toISOString(),
                      },
                    ]);
                  if (error) {
                    alert("Failed to add step: " + error.message);
                    return;
                  }
                  // Refresh company steps
                  await fetchCompanySteps();
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
            </div>
            {/* Peer Insights and Progress */}
            <div className="w-full mb-8 px-0">
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
                    window.location.assign(`/journey/step/${step.id}`);
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
          <div className="w-full h-full flex flex-col px-0 py-10">
            <button
              className="mb-4 w-fit px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => setViewMode("dashboard")}
            >
              ← Back to Journey
            </button>
            {stepDetailStep ? (
              <div className="w-full">
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
    </AIProvider>
  );
};

export default JourneyHomePage;
