import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from "sonner";
import JourneyBoard from "./JourneyBoard/JourneyBoard";
import AIRecommendationPanel from "./JourneyBoard/AIRecommendationPanel";
import FilterBar from "./JourneyBoard/FilterBar";
import * as journeyBoardService from "../../lib/services/journeyBoard.service";
import ListView from "./JourneyBoard/ListView";
/* import { ActionPanel } from '../../components/company/journey/ActionPanel'; // Import ActionPanel */
// Removed the old RecommendationsPanel import
// import { RecommendationsPanel } from "../../components/company/journey/StepRecommendations"; 
/* import { JourneyAnalyticsDashboard } from "../../components/company/journey/Analytics"; */

// Replace with real companyId from context/auth
const companyId = "demo-company-id";

const JourneyMapPage: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [phases, setPhases] = useState<string[]>([]);
  const [stepsByPhase, setStepsByPhase] = useState<Record<string, any[]>>({});
  const [aiRecommendations, setAIRecommendations] = useState<string[]>([]);
  const [aiInfo, setAIInfo] = useState<string | undefined>(undefined);
  const [aiAnswer, setAIAnswer] = useState<string | undefined>(undefined);
  const [aiLoading, setAILoading] = useState(false);

  // Filter state
  const [selectedPhase, setSelectedPhase] = useState<string | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<string | "All">("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("board");

  const loadData = useCallback(async () => {
      const { phases, steps, progress, customSteps } = await journeyBoardService.getCompanyJourneyBoard(companyId);
      // Group steps by phase, merge with progress and custom steps
      const phaseNames = phases.map((p: any) => p.name);
      setPhases(phaseNames);

      const stepsByPhase: Record<string, any[]> = {};
      for (const phase of phases) {
        const phaseSteps = steps
          .filter((s: any) => s.phase_id === phase.id)
          .map((s: any) => {
            const prog = progress.find((p: any) => p.step_id === s.id) || {};
            return {
              id: s.id,
              name: s.name,
              description: s.description,
              phaseName: phase.name,
              status: prog.status || "not_started",
              isParallel: prog.can_be_parallel,
              isArchived: prog.archived,
              notes: prog.notes,
              recommendations: [], // TODO: fetch per step
              aiInfo: "", // TODO: fetch per step
            };
          });
        const phaseCustomSteps = customSteps
          .filter((cs: any) => cs.phase_id === phase.id)
          .map((cs: any) => ({
            id: cs.id,
            name: cs.name,
            description: cs.description,
            phaseName: phase.name,
            status: "not_started",
            isParallel: cs.can_be_parallel,
            isArchived: cs.archived,
            notes: "",
            recommendations: [],
            aiInfo: "",
          }));
        stepsByPhase[phase.name] = [...phaseSteps, ...phaseCustomSteps];
      }
      setStepsByPhase(stepsByPhase);

      // Fetch AI recommendations
      const ai = await journeyBoardService.getCompanyJourneyAIRecommendations(companyId);
      setAIRecommendations((ai.data || []).map((r: any) => r.recommendation));
      setAIInfo("AI is using your company profile and journey history to suggest next steps.");
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (stepId: string, status: string) => {
    await journeyBoardService.updateCompanyStep(companyId, stepId, { status });
    await loadData(); // Refresh data after update
  };

  const handleEditStep = async (stepId: string) => {
    // TODO: Implement edit logic
    toast.info(`Edit step: ${stepId}`);
  };

  const handleDeleteStep = async (stepId: string) => {
    await journeyBoardService.updateCompanyStep(companyId, stepId, { archived: true });
    await loadData(); // Refresh data after deletion
    toast.success("Step deleted successfully.");
  };

  const handleToggleParallel = async (stepId: string) => {
    const step = Object.values(stepsByPhase).flat().find(s => s.id === stepId);
    if (!step) return;
    await journeyBoardService.updateCompanyStep(companyId, stepId, { can_be_parallel: !step.isParallel });
    await loadData(); // Refresh data after toggling parallel
    toast.success("Step parallel status updated.");
  };

  const handleArchiveStep = async (stepId: string) => {
    const step = Object.values(stepsByPhase).flat().find(s => s.id === stepId);
    if (!step) return;
    await journeyBoardService.updateCompanyStep(companyId, stepId, { archived: !step.isArchived });
    await loadData(); // Refresh data after archiving
    toast.success("Step archived successfully.");
  };

  const handleNotesChange = async (stepId: string, notes: string) => {
    await journeyBoardService.updateCompanyStep(companyId, stepId, { notes });
    toast.success("Notes updated successfully.");
  };

  const handleAskAI = async (question: string) => {
    setAILoading(true);
    const res = await journeyBoardService.askCompanyJourneyAIQuestion(companyId, "", question);
    // Add type assertion to fix TypeScript error
    setAIAnswer(res.data && (res.data[0] as any)?.answer || undefined);
    setAILoading(false);
  };

  // Handler for step selection from ActionPanel
  const handleStepSelect = (stepId: string) => {
    // Navigate to the step detail page
    if (stepId) {
      navigate(`/company/${companyId}/journey/step/${stepId}`);
      toast.info(`Navigating to step: ${stepId}`); // Optional feedback
    }
  };

  // Filtered steps
  const filteredPhases = selectedPhase === "All" ? phases : [selectedPhase];
  const filteredStepsByPhase: typeof stepsByPhase = {};
  filteredPhases.forEach(phase => {
    filteredStepsByPhase[phase] = (stepsByPhase[phase] || []).filter(step => {
      const statusMatch = selectedStatus === "All" || step.status === selectedStatus;
      const searchMatch =
        !search ||
        step.name.toLowerCase().includes(search.toLowerCase()) ||
        (step.description && step.description.toLowerCase().includes(search.toLowerCase()));
      return statusMatch && searchMatch;
    });
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Company Journey</h1>
      <FilterBar
        phases={phases}
        statuses={["not_started", "in_progress", "completed", "skipped", "not_needed"]}
        selectedPhase={selectedPhase}
        selectedStatus={selectedStatus}
        search={search}
        onPhaseChange={setSelectedPhase}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
      />
      {/* AI Panel Section */}
      <div className="mb-6"> 
          <AIRecommendationPanel
            recommendations={aiRecommendations}
            aiInfo={aiInfo}
            onAskQuestion={handleAskAI}
            aiAnswer={aiAnswer}
            loading={aiLoading}
          />
      </div>
      
      {/* Main Content Area + Action Panel Sidebar */}
      <div className="flex gap-4 mt-6">
        {/* Main content area for Board, List, or Timeline */}
        <div className="flex-grow">
          {view === "board" && (
            <JourneyBoard
              phases={filteredPhases}
              stepsByPhase={filteredStepsByPhase}
              onStatusChange={handleStatusChange}
              // Pass other necessary props if JourneyBoard needs them
              onEditStep={handleEditStep}
              onDeleteStep={handleDeleteStep}
              onToggleParallel={handleToggleParallel}
              onArchiveStep={handleArchiveStep}
              onNotesChange={handleNotesChange}
            />
          )}
          {view === "list" && (
            <ListView
              steps={filteredPhases.flatMap(phase =>
                (filteredStepsByPhase[phase] || []).map((step) => ({ // Removed unused idx, arr
                  id: step.id,
                  name: step.name,
                  status: step.status,
                  isArchived: step.isArchived,
                  onStatusChange: async (status: string) => {
                    await journeyBoardService.updateCompanyStep(companyId, step.id, { status });
                    await loadData(); // Refresh data after update
                  },
                  onReorder: async (stepId: string, direction: "up" | "down") => {
                    const steps = filteredPhases.flatMap(p => filteredStepsByPhase[p] || []);
                    const currentIdx = steps.findIndex(s => s.id === stepId);
                    let targetIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
                    if (targetIdx < 0 || targetIdx >= steps.length) return;
                    const currentStep = steps[currentIdx];
                    const targetStep = steps[targetIdx];
                    // Assuming order_index exists or needs to be handled
                    // This part might need adjustment based on actual data structure/API
                    await journeyBoardService.updateCompanyStep(companyId, currentStep.id, { order_index: targetIdx }); 
                    await journeyBoardService.updateCompanyStep(companyId, targetStep.id, { order_index: currentIdx });
                    await loadData(); // Refresh data after reorder
                  }
                }))
              )}
            />
          )}
          {/* Timeline view is disabled */}
        </div>

        {/* Action Panel Sidebar */}
        <div className="w-80 flex-shrink-0"> {/* Fixed width sidebar */}
          {/* <ActionPanel 
            companyId={companyId} 
            onStepSelect={handleStepSelect} // Pass the selection handler
          /> */}
        </div>
      </div>
    </div>
  );
};

export default JourneyMapPage;
