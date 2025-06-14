import React, { useEffect, useState } from "react";
import { journeyContentService } from "../../../lib/services/journeyContent.service";
import { Button, Checkbox, FormControlLabel } from "@mui/material";

interface Props {
  stepInstanceId: string;
}

export default function StepInstanceToolAssignment({ stepInstanceId }: Props) {
  const [tools, setTools] = useState<any[]>([]);
  const [assignedToolIds, setAssignedToolIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data } = await journeyContentService.getAllTools();
    setTools(data);
    const stepTools = await journeyContentService.getToolsForStep(stepInstanceId);
    setAssignedToolIds(stepTools.map((t: any) => t.id));
  };

  const handleToggleTool = (toolId: string) => {
    setAssignedToolIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSave = async () => {
    await journeyContentService.assignToolsToSteps(assignedToolIds, [stepInstanceId]);
    fetchTools();
  };

  return (
    <div className="p-2 border rounded">
      <h4 className="font-semibold mb-2">Assign Tools</h4>
      <div className="flex flex-col gap-1 mb-2">
        {tools.map((tool) => (
          <FormControlLabel
            key={tool.id}
            control={
              <Checkbox
                checked={assignedToolIds.includes(tool.id)}
                onChange={() => handleToggleTool(tool.id)}
              />
            }
            label={tool.name}
          />
        ))}
      </div>
      <Button variant="outlined" onClick={handleSave}>
        Save Assignments
      </Button>
    </div>
  );
}
