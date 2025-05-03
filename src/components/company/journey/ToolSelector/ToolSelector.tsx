import React, { useEffect, useState } from "react";
import ToolRecommendationList, { ToolRecommendation } from "./ToolRecommendationList";
import ToolList, { ToolListItem } from "./ToolList";
import CustomToolForm from "./CustomToolForm";
import ToolComparisonTable from "./ToolComparisonTable";
import ScorecardBuilder, { ScorecardCriterion } from "./ScorecardBuilder";
import ToolEvaluationForm from "./ToolEvaluationForm";
import DocumentUploader from "./DocumentUploader";
import EvaluationHistory, { EvaluationHistoryEntry } from "./EvaluationHistory";
import ToolDetailsModal from "./ToolDetailsModal";
import * as toolSelectionService from "../../../../lib/services/toolSelection.service";

interface ToolSelectorProps {
  open: boolean;
  onClose: () => void;
  stepId: string;
  companyId: string;
  userId: string;
}

const ToolSelector: React.FC<ToolSelectorProps> = ({
  open,
  onClose,
  stepId,
  companyId,
  userId,
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [tools, setTools] = useState<ToolListItem[]>([]);
  const [customTools, setCustomTools] = useState<ToolListItem[]>([]);
  const [comparisonList, setComparisonList] = useState<ToolListItem[]>([]);
  const [scorecard, setScorecard] = useState<ScorecardCriterion[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistoryEntry[]>([]);
  const [isSavingScorecard, setIsSavingScorecard] = useState(false);
  
  // Tool details modal state
  const [detailsToolId, setDetailsToolId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch data on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    Promise.all([
      toolSelectionService.getPersonalizedToolRecommendations(companyId, stepId),
      toolSelectionService.getStepTools(stepId),
      toolSelectionService.getCompanyCustomTools(companyId, stepId),
      toolSelectionService.getScorecardDefinitions(companyId, stepId),
      // toolSelectionService.getToolEvaluations(stepId), // Needs per-tool
    ])
      .then(([recRes, toolsRes, customRes, scorecardRes]) => {
        setRecommendations(recRes.data || []);
        setTools(toolsRes.data || []);
        setCustomTools((customRes.data || []).map((t: any) => {
          // Ensure t is treated as an object before spreading
          const toolObj = typeof t === 'object' && t !== null ? t : {};
          return { ...toolObj, id: t?.id || '', name: t?.name || '', url: t?.url || '', is_custom: true };
        }));
        if (scorecardRes.data && scorecardRes.data.length > 0) {
          setScorecard(scorecardRes.data[0].criteria || []);
        }
        setLoading(false);
      })
.catch((err: any) => {
  console.error("ToolSelector data fetch error:", err);
  setError(err.message || "Failed to load tool data");
  setLoading(false);
});
  }, [open, companyId, stepId]);

  // Add to comparison
  const handleAddToCompare = (toolId: string) => {
    // Ensure tools and customTools are arrays before spreading
    const toolsArray = Array.isArray(tools) ? tools : [];
    const customToolsArray = Array.isArray(customTools) ? customTools : [];
    const all = [...toolsArray, ...customToolsArray];
    
    const tool = all.find((t) => t.id === toolId);
    if (tool && !comparisonList.some((t) => t.id === toolId) && comparisonList.length < 5) {
      // Ensure comparisonList is an array before spreading
      const comparisonListArray = Array.isArray(comparisonList) ? comparisonList : [];
      setComparisonList([...comparisonListArray, tool]);
    }
  };

  // Remove from comparison
  const handleRemoveFromCompare = (toolId: string) => {
    setComparisonList(comparisonList.filter((t) => t.id !== toolId));
    if (selectedToolId === toolId) setSelectedToolId(null);
  };

  // Add custom tool
  const handleAddCustomTool = async (tool: { name: string; url: string; description?: string; logo_url?: string }) => {
    const res = await toolSelectionService.addCompanyCustomTool(companyId, stepId, tool);
    if (res.data && res.data[0]) {
      // Ensure res.data[0] is an object before spreading
      const dataObj = typeof res.data[0] === 'object' && res.data[0] !== null ? res.data[0] : {};
      // Use type assertion to tell TypeScript that dataObj has these properties
      const typedDataObj = dataObj as Partial<ToolListItem>;
      
      const newTool: ToolListItem = { 
        id: typedDataObj.id || '',
        name: typedDataObj.name || '',
        url: typedDataObj.url || '',
        ranking: typedDataObj.ranking || 0,
        is_custom: true,
        description: typedDataObj.description || '',
        logo_url: typedDataObj.logo_url || ''
      };
      
      // Ensure arrays before spreading
      const customToolsArray = Array.isArray(customTools) ? customTools : [];
      const comparisonListArray = Array.isArray(comparisonList) ? comparisonList : [];
      
      setCustomTools([...customToolsArray, newTool]);
      setComparisonList([...comparisonListArray, newTool]);
    }
  };

  // Save scorecard
  const handleSaveScorecard = async (criteria: ScorecardCriterion[]) => {
    setIsSavingScorecard(true);
    await toolSelectionService.saveScorecardDefinition(companyId, "", stepId, criteria, userId, "Custom Scorecard");
    setScorecard(criteria);
    setIsSavingScorecard(false);
  };

  // Save evaluation (per tool)
  const handleSaveEvaluation = async (toolId: string, responses: Record<string, any>, notes: string) => {
    // Find scorecardId (assume first for now)
    const scorecardRes = await toolSelectionService.getScorecardDefinitions(companyId, stepId);
    const scorecardId = scorecardRes.data && scorecardRes.data[0]?.id;
    if (scorecardId) {
      await toolSelectionService.saveToolEvaluation(scorecardId, toolId, userId, responses, notes);
      // Optionally refresh evaluation history
    }
  };

  // Upload document (per tool)
  const handleUploadDocument = async (toolId: string, file: File, description?: string) => {
    // Assume file upload to storage is handled elsewhere, here we just save the URL
    // For demo, use file.name as URL
    await toolSelectionService.uploadToolDocument(companyId, toolId, userId, file.name, file.type, description);
    // Optionally refresh evaluation history
  };

  // Select final tool
  const handleSelectTool = async (toolId: string) => {
    setSelectedToolId(toolId);
    await toolSelectionService.selectCompanyToolForStep(companyId, stepId, toolId);
  };
  
  // Open tool details modal
  const handleViewToolDetails = (toolId: string) => {
    setDetailsToolId(toolId);
    setShowDetailsModal(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Tool Selection & Evaluation</h2>
        {loading ? (
          <div className="text-center p-8">Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            <ToolRecommendationList
              recommendations={recommendations}
              onAddToCompare={handleAddToCompare}
              onViewDetails={handleViewToolDetails}
              comparisonList={comparisonList.map((t) => t.id)}
            />
            <ToolList
              tools={[...tools, ...customTools]}
              onAddToCompare={handleAddToCompare}
              onViewDetails={handleViewToolDetails}
              comparisonList={comparisonList.map((t) => t.id)}
            />
            <CustomToolForm onAddCustomTool={handleAddCustomTool} />
            <ScorecardBuilder
              initialCriteria={scorecard}
              onSave={handleSaveScorecard}
              isSaving={isSavingScorecard}
            />
            <ToolComparisonTable
              tools={comparisonList}
              selectedToolId={selectedToolId}
              onSelectTool={handleSelectTool}
              onRemoveTool={handleRemoveFromCompare}
              renderScorecard={(tool) => (
                <ToolEvaluationForm
                  toolId={tool.id}
                  criteria={scorecard}
                  onSave={(responses, notes) => handleSaveEvaluation(tool.id, responses, notes)}
                />
              )}
            />
            {selectedToolId && (
              <DocumentUploader
                onUpload={(file, description) => handleUploadDocument(selectedToolId, file, description)}
              />
            )}
            <EvaluationHistory entries={evaluationHistory} />
            
            {/* Tool Details Modal */}
            <ToolDetailsModal
              open={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              toolId={detailsToolId}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ToolSelector;
