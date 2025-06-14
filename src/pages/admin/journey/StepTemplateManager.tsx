import React, { useEffect, useState } from "react";
import { journeyContentService } from "../../../lib/services/journeyContent.service";
import { newJourneyAdminService } from "../../../lib/services/admin/new_journey_admin.service";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { NewJourneyStep } from "../../../lib/types/new_journey.types";

export default function StepTemplateManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<'legacy' | 'new'>('legacy');

  const activeService = selectedSystem === 'legacy' ? journeyContentService : newJourneyAdminService;

  useEffect(() => {
    fetchTemplates();
  }, [selectedSystem]);

  const fetchTemplates = async () => {
    if (selectedSystem === 'legacy') {
      const data = await journeyContentService.getAllStepTemplates();
      setTemplates(data);
    } else {
      const data = await newJourneyAdminService.getStepTemplates();
      setTemplates(data);
    }
  };

  const handleSave = async () => {
    await activeService.upsertStepTemplate(editing);
    setEditing(null);
    fetchTemplates();
  };
  
  const renderLegacyRow = (t: any) => (
    <TableRow key={t.id}>
      <TableCell>{t.name}</TableCell>
      <TableCell>{t.description}</TableCell>
      <TableCell>{t.instructions ? "✓" : ""}</TableCell>
      <TableCell>{t.task_list ? "✓" : ""}</TableCell>
      <TableCell>{t.resources ? "✓" : ""}</TableCell>
      <TableCell>{t.notes ? "✓" : ""}</TableCell>
      <TableCell>{t.tool_picker ? "✓" : ""}</TableCell>
      <TableCell>{t.submission_box ? "✓" : ""}</TableCell>
      <TableCell>
        {/* Edit functionality for legacy can be added here if needed */}
      </TableCell>
    </TableRow>
  );

  const renderNewRow = (t: NewJourneyStep) => (
    <TableRow key={t.id}>
      <TableCell>
        {editing?.id === t.id ? <Input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} /> : t.name}
      </TableCell>
      <TableCell>
        {editing?.id === t.id ? <Input value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} /> : t.description}
      </TableCell>
      <TableCell colSpan={6}>
        {editing?.id === t.id ? <Input value={editing.guidance_notes || ''} onChange={e => setEditing({...editing, guidance_notes: e.target.value})} /> : t.guidance_notes}
      </TableCell>
      <TableCell>
        {editing?.id === t.id ? (
          <Button onClick={handleSave}>Save</Button>
        ) : (
          <Button onClick={() => setEditing(t)}>Edit</Button>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Step Template Manager</h2>
      <div className="mb-4">
        <label className="mr-4">
          <input type="radio" value="legacy" checked={selectedSystem === 'legacy'} onChange={() => setSelectedSystem('legacy')} />
          Legacy System
        </label>
        <label>
          <input type="radio" value="new" checked={selectedSystem === 'new'} onChange={() => setSelectedSystem('new')} />
          New System
        </label>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            {selectedSystem === 'legacy' ? (
              <>
                <TableCell>Instructions</TableCell>
                <TableCell>Task List</TableCell>
                <TableCell>Resources</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Tool Picker</TableCell>
                <TableCell>Submission Box</TableCell>
              </>
            ) : (
              <TableCell colSpan={6}>Guidance Notes</TableCell>
            )}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((t) => selectedSystem === 'legacy' ? renderLegacyRow(t) : renderNewRow(t))}
        </TableBody>
      </Table>
    </div>
  );
}
