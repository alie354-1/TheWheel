import React, { useEffect, useState } from "react";
import { journeyContentService } from "../lib/services/journeyContent.service";
import ExcelImportMapper from "../components/admin/ExcelImportMapper"; // Import the new component

function AdminJourneyContentPage() {
  // State for journey phases
  const [phases, setPhases] = useState<any[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(true);

  // State for selected phase and steps
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  // State for selected step and tools
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  // State for new phase creation
  const [newPhaseName, setNewPhaseName] = useState("");
  const [creatingPhase, setCreatingPhase] = useState(false);

  // State for new step creation
  const [newStepName, setNewStepName] = useState("");
  const [creatingStep, setCreatingStep] = useState(false);

  // State for new tool creation
  const [newToolName, setNewToolName] = useState("");
  const [creatingTool, setCreatingTool] = useState(false);

  // State for global tool selection - COMMENTED OUT as getAllGlobalTools was removed
  // const [globalTools, setGlobalTools] = useState<any[]>([]);
  // const [selectedGlobalToolId, setSelectedGlobalToolId] = useState<string | null>(null);
  // const [addingGlobalTool, setAddingGlobalTool] = useState(false);

  useEffect(() => {
    fetchPhases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPhases() {
    setLoadingPhases(true);
    try {
      const data = await journeyContentService.getPhases();
      setPhases(data || []);
    } catch (err) {
      console.error("Error fetching phases:", err); // Log error
      setPhases([]);
    }
    setLoadingPhases(false);
  }

  useEffect(() => {
    if (!selectedPhaseId) {
      setSteps([]);
      setSelectedStepId(null);
      return;
    }
    fetchSteps(selectedPhaseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhaseId]);

  async function fetchSteps(phaseId: string) {
    setLoadingSteps(true);
    try {
      const data = await journeyContentService.getSteps(phaseId);
      setSteps(data || []);
      setSelectedStepId(null); // Reset step selection when phase changes
    } catch (err) {
      console.error("Error fetching steps:", err); // Log error
      setSteps([]);
      setSelectedStepId(null);
    }
    setLoadingSteps(false);
  }

  useEffect(() => {
    if (!selectedStepId) {
      setTools([]);
      // setGlobalTools([]); // Commented out
      return;
    }
    fetchTools(selectedStepId);
    // fetchGlobalTools(); // Commented out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStepId]);

  async function fetchTools(stepId: string) {
    setLoadingTools(true);
    try {
      const data = await journeyContentService.getTools(stepId);
      setTools(data || []);
    } catch (err) {
      console.error("Error fetching tools:", err); // Log error
      setTools([]);
    }
    setLoadingTools(false);
  }

  // Commented out as getAllGlobalTools was removed
  // async function fetchGlobalTools() {
  //   try {
  //       const data = await journeyContentService.getAllGlobalTools(); // This function no longer exists
  //       setGlobalTools(data || []);
  //   } catch (err) {
  //       console.error("Error fetching global tools:", err);
  //       setGlobalTools([]);
  //   }
  // }

  // CRUD: Create/Update Phase (using Upsert)
  async function handleCreatePhase(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhaseName.trim()) return;
    setCreatingPhase(true);
    try {
      // Assuming order_index should be based on current count or needs manual input later
      const nextOrderIndex = phases.length + 1;
      await journeyContentService.upsertPhase({
          name: newPhaseName,
          order_index: nextOrderIndex, // Assign next order index
          order: nextOrderIndex // Also set 'order' if it exists
        });
      setNewPhaseName("");
      await fetchPhases(); // Refresh list
    } catch(err) {
        console.error("Failed to upsert phase:", err);
        // TODO: Show error to user
    } finally {
      setCreatingPhase(false);
    }
  }

  // CRUD: Delete Phase
  async function handleDeletePhase(phaseId: string) {
    if (!window.confirm("Delete this phase and ALL its steps/tools?")) return;
    try {
        await journeyContentService.deletePhase(phaseId);
        if (selectedPhaseId === phaseId) setSelectedPhaseId(null);
        await fetchPhases(); // Refresh list
    } catch(err) {
        console.error("Failed to delete phase:", err);
        // TODO: Show error to user
    }
  }

  // CRUD: Create/Update Step (using Upsert)
  async function handleCreateStep(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPhaseId || !newStepName.trim()) return;
    setCreatingStep(true);
    try {
       // Assuming order_index should be based on current count or needs manual input later
       const nextOrderIndex = steps.length + 1;
      await journeyContentService.upsertStep(selectedPhaseId, {
          name: newStepName,
          order_index: nextOrderIndex, // Assign next order index
          order: nextOrderIndex // Also set 'order' if it exists
        });
      setNewStepName("");
      await fetchSteps(selectedPhaseId); // Refresh list
    } catch(err) {
        console.error("Failed to upsert step:", err);
        // TODO: Show error to user
    } finally {
      setCreatingStep(false);
    }
  }

  // CRUD: Delete Step
  async function handleDeleteStep(stepId: string) {
    if (!window.confirm("Delete this step and ALL its tools?")) return;
    if (!selectedPhaseId) return; // Should not happen if button is visible
    try {
        await journeyContentService.deleteStep(stepId);
        await fetchSteps(selectedPhaseId); // Refresh list
    } catch(err) {
        console.error("Failed to delete step:", err);
        // TODO: Show error to user
    }
  }

  // CRUD: Create Tool (Now uses upsertToolForStep)
  async function handleCreateTool(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStepId || !newToolName.trim()) return;
    setCreatingTool(true);
    try {
      // We need more info than just name (like URL) for upsertToolForStep
      // For now, just log and don't call service, or implement a modal to get more details
      console.warn("handleCreateTool needs update: requires URL and potentially other fields for upsertToolForStep.");
      alert("Creating tool directly here needs implementation update to gather URL.");
      // Example call if URL was available:
      // await journeyContentService.upsertToolForStep(selectedStepId, { name: newToolName, url: 'http://example.com' });
      // setNewToolName("");
      // await fetchTools(selectedStepId); // Refresh list
    } catch(err) {
        console.error("Failed to upsert tool:", err);
        // TODO: Show error to user
    } finally {
      setCreatingTool(false);
    }
  }

  // CRUD: Delete Tool (Now deletes the tool entry itself)
  async function handleDeleteTool(toolId: string) { // Only needs toolId now
    if (!window.confirm("Delete this tool permanently?")) return;
    if (!selectedStepId) return; // Should have selected step to be viewing tools
    try {
        await journeyContentService.deleteTool(toolId); // Call updated service function
        await fetchTools(selectedStepId); // Refresh list for the current step
    } catch(err) {
        console.error("Failed to delete tool:", err);
        // TODO: Show error to user
    }
  }

  // Add existing global tool to step - COMMENTED OUT
  // async function handleAddGlobalTool(e: React.FormEvent) {
  //   e.preventDefault();
  //   if (!selectedStepId || !selectedGlobalToolId) return;
  //   setAddingGlobalTool(true);
  //   try {
  //     // This function no longer exists in the service
  //     // await journeyContentService.addExistingToolToStep(selectedStepId, selectedGlobalToolId);
  //     console.warn("handleAddGlobalTool needs update: addExistingToolToStep was removed.");
  //     alert("Adding global tools needs implementation update.");
  //     setSelectedGlobalToolId(null);
  //     // await fetchTools(selectedStepId);
  //   } finally {
  //     setAddingGlobalTool(false);
  //   }
  // }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin: Journey Content Management</h1>

      {/* New Import Section using ExcelImportMapper */}
      <div className="mb-8 border p-4 rounded-lg shadow">
         <h2 className="text-xl font-semibold mb-4">Import from Excel</h2>
         <ExcelImportMapper />
      </div>

      {/* Phases Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Phases</h2>
        <form onSubmit={handleCreatePhase} className="flex items-center mb-4 gap-2">
          <input
            type="text"
            className="input input-bordered"
            placeholder="New phase name"
            value={newPhaseName}
            onChange={e => setNewPhaseName(e.target.value)}
            disabled={creatingPhase}
          />
          <button className="btn btn-success" type="submit" disabled={creatingPhase || !newPhaseName.trim()}>
            {creatingPhase ? "Adding..." : "Add Phase"}
          </button>
        </form>
        {loadingPhases ? (
          <p>Loading phases...</p>
        ) : (
          <ul className="space-y-2">
            {phases.map(phase => (
              <li
                key={phase.id}
                className={`p-2 border rounded cursor-pointer ${selectedPhaseId === phase.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedPhaseId(phase.id)}
              >
                {phase.name || "[Unnamed Phase]"} (Order: {phase.order_index ?? phase.order ?? 'N/A'})
                <button
                  className="ml-4 text-red-600 float-right"
                  onClick={(e) => { e.stopPropagation(); handleDeletePhase(phase.id); }}
                  title="Delete Phase"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Steps Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Steps {selectedPhaseId ? `(for Phase: ${phases.find(p => p.id === selectedPhaseId)?.name})` : ''}</h2>
         {selectedPhaseId && (
            <form onSubmit={handleCreateStep} className="flex items-center mb-4 gap-2">
              <input
                type="text"
                className="input input-bordered"
                placeholder="New step name"
                value={newStepName}
                onChange={e => setNewStepName(e.target.value)}
                disabled={creatingStep}
              />
              <button className="btn btn-success" type="submit" disabled={creatingStep || !newStepName.trim()}>
                {creatingStep ? "Adding..." : "Add Step"}
              </button>
            </form>
         )}
        <div className="border p-4 rounded bg-gray-50 min-h-[100px]">
          {!selectedPhaseId ? (
            <span>Select a phase to view its steps.</span>
          ) : loadingSteps ? (
            <span>Loading steps...</span>
          ) : (
            <ul className="space-y-2">
              {steps.length === 0 ? (
                <li>No steps found for this phase.</li>
              ) : (
                steps.map(step => (
                  <li
                    key={step.id}
                    className={`p-2 border rounded cursor-pointer ${selectedStepId === step.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedStepId(step.id)}
                  >
                    {step.name || "[Unnamed Step]"} (Order: {step.order_index ?? step.order ?? 'N/A'})
                     <button
                        className="ml-4 text-red-600 float-right"
                        onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id); }}
                        title="Delete Step"
                    >
                        Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Tools Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tools {selectedStepId ? `(for Step: ${steps.find(s => s.id === selectedStepId)?.name})` : ''}</h2>
        {selectedStepId && (
          <>
            {/* Simplified Add Tool Form - Needs enhancement to collect URL etc. */}
            <form onSubmit={handleCreateTool} className="flex items-center mb-4 gap-2">
              <input
                type="text"
                className="input input-bordered"
                placeholder="New tool name (requires URL - see console)"
                value={newToolName}
                onChange={e => setNewToolName(e.target.value)}
                disabled={creatingTool}
              />
              <button className="btn btn-success" type="submit" disabled={creatingTool || !newToolName.trim()}>
                {creatingTool ? "Adding..." : "Add Tool"}
              </button>
            </form>

            {/* Global Tool Section Commented Out */}
            {/*
            <form onSubmit={handleAddGlobalTool} className="flex items-center mb-4 gap-2">
              <select
                className="input input-bordered"
                value={selectedGlobalToolId || ""}
                onChange={e => setSelectedGlobalToolId(e.target.value)}
                disabled={addingGlobalTool}
              >
                <option value="">Select global tool to add...</option>
                {globalTools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} {tool.category ? `(${tool.category})` : ""}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" type="submit" disabled={addingGlobalTool || !selectedGlobalToolId}>
                {addingGlobalTool ? "Adding..." : "Add Existing Tool"}
              </button>
            </form>
             */}
          </>
        )}
        <div className="border p-4 rounded bg-gray-50 min-h-[100px]">
          {!selectedStepId ? (
            <span>Select a step to view its tools.</span>
          ) : loadingTools ? (
            <span>Loading tools...</span>
          ) : (
            <ul>
              {tools.length === 0 ? (
                <li>No tools found for this step.</li>
              ) : (
                tools.map((tool, idx) => (
                  <li key={tool.id || idx}>
                    {tool.name || "[Unnamed Tool]"} {tool.url ? `(${tool.url})` : ''}
                    <button
                      className="ml-2 text-red-600"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteTool(tool.id); // Pass only tool.id
                      }}
                      title="Delete tool"
                    >
                      &times;
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminJourneyContentPage;
