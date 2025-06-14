import React, { useEffect, useState } from "react";
import { journeyContentService } from "../../../lib/services/journeyContent.service";
import { newJourneyAdminService } from "../../../lib/services/admin/new_journey_admin.service";
import { Button, Input, Table } from "@mui/material";
import { NewJourneyPhase } from "../../../lib/types/new_journey.types";

export default function PhaseManager() {
  const [phases, setPhases] = useState<NewJourneyPhase[]>([]);
  const [newPhase, setNewPhase] = useState({ name: "", position: 0 });
  const [selectedSystem, setSelectedSystem] = useState<'legacy' | 'new'>('legacy');

  useEffect(() => {
    if (selectedSystem === 'new') {
      fetchPhases();
    } else {
      // For legacy, there is no phase management, so clear the list.
      setPhases([]);
    }
  }, [selectedSystem]);

  const fetchPhases = async () => {
    const data = await newJourneyAdminService.getPhases();
    setPhases(data);
  };

  const handleSave = async () => {
    if (!newPhase.name.trim() || selectedSystem === 'legacy') return;
    await newJourneyAdminService.upsertPhase({ name: newPhase.name, order_index: newPhase.position });
    setNewPhase({ name: "", position: 0 });
    fetchPhases();
  };

  const handleDelete = async (id: string) => {
    if (selectedSystem === 'legacy') return;
    await newJourneyAdminService.deletePhase(id);
    fetchPhases();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Phase Manager</h2>
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
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Phase name"
          value={newPhase.name}
          onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Position"
          value={newPhase.position}
          onChange={(e) => setNewPhase({ ...newPhase, position: parseInt(e.target.value) })}
        />
        <Button variant="contained" onClick={handleSave}>
          Add Phase
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {phases.map((phase) => (
            <tr key={phase.id}>
              <td>{phase.name}</td>
              <td>{phase.order_index}</td>
              <td>
                <Button color="error" onClick={() => handleDelete(phase.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
