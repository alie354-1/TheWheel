import React, { useEffect, useState } from "react";
import { journeyContentService } from "../../../lib/services/journeyContent.service";
import { v4 as uuidv4 } from "uuid";

interface Tool {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  website_url?: string;
  logo_url?: string;
}

interface Step {
  id: string;
  name: string;
}

const ToolManager: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>([]);

  useEffect(() => {
    loadTools();
    loadSteps();
  }, []);

  const loadTools = async () => {
    const { data } = await journeyContentService.getAllTools?.();
    if (data) setTools(data);
  };

  const loadSteps = async () => {
    const { data } = await journeyContentService.getAllSteps?.();
    if (data) setSteps(data);
  };

  const handleToolSelect = (id: string) => {
    setSelectedToolIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleStepSelect = (id: string) => {
    setSelectedStepIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedToolIds.length && selectedStepIds.length) {
      await journeyContentService.assignToolsToSteps?.(selectedToolIds, selectedStepIds);
      alert("Tools assigned to steps successfully.");
      setSelectedToolIds([]);
      setSelectedStepIds([]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tool-Step Assignment</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-semibold mb-2">Select Tools</h3>
          <ul className="border rounded p-2 max-h-64 overflow-y-auto">
            {tools.map(tool => (
              <li key={tool.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedToolIds.includes(tool.id!)}
                  onChange={() => handleToolSelect(tool.id!)}
                />
                <span>{tool.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Select Steps</h3>
          <ul className="border rounded p-2 max-h-64 overflow-y-auto">
            {steps.map(step => (
              <li key={step.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedStepIds.includes(step.id)}
                  onChange={() => handleStepSelect(step.id)}
                />
                <span>{step.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={handleAssign}
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={!selectedToolIds.length || !selectedStepIds.length}
      >
        Assign Selected Tools to Selected Steps
      </button>
    </div>
  );
};

export default ToolManager;
