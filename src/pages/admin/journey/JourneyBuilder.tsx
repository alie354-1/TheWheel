import React, { useEffect, useState } from "react";
import { journeyContentService } from "../../../lib/services/journeyContent.service";
import { Button, Input, MenuItem, Select, Table } from "@mui/material";

export default function JourneyBuilder() {
  const [phases, setPhases] = useState([]);
  const [domains, setDomains] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [instances, setInstances] = useState([]);
  const [newInstance, setNewInstance] = useState({
    step_template_id: "",
    phase_id: "",
    domain_id: "",
    position: 0,
    config: {}
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setPhases(await journeyContentService.getAllPhases());
    setDomains(await journeyContentService.getAllDomains());
    setTemplates(await journeyContentService.getAllStepTemplates());
    setInstances(await journeyContentService.getAllStepInstances());
  };

  const handleSave = async () => {
    await journeyContentService.upsertStepInstance(newInstance);
    setNewInstance({
      step_template_id: "",
      phase_id: "",
      domain_id: "",
      position: 0,
      config: {}
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await journeyContentService.deleteStepInstance(id);
    fetchAll();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Journey Builder</h2>
      <div className="flex gap-2 mb-4">
        <Select
          value={newInstance.step_template_id}
          onChange={(e) => setNewInstance({ ...newInstance, step_template_id: e.target.value })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Template</MenuItem>
          {templates.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
          ))}
        </Select>
        <Select
          value={newInstance.phase_id}
          onChange={(e) => setNewInstance({ ...newInstance, phase_id: e.target.value })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Phase</MenuItem>
          {phases.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
        <Select
          value={newInstance.domain_id}
          onChange={(e) => setNewInstance({ ...newInstance, domain_id: e.target.value })}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Domain</MenuItem>
          {domains.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
          ))}
        </Select>
        <Input
          type="number"
          placeholder="Position"
          value={newInstance.position}
          onChange={(e) => setNewInstance({ ...newInstance, position: parseInt(e.target.value) })}
        />
        <Button variant="contained" onClick={handleSave}>
          Add Step Instance
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Phase</th>
            <th>Domain</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((inst) => (
            <tr key={inst.id}>
              <td>{templates.find(t => t.id === inst.step_template_id)?.name}</td>
              <td>{phases.find(p => p.id === inst.phase_id)?.name}</td>
              <td>{domains.find(d => d.id === inst.domain_id)?.name}</td>
              <td>{inst.position}</td>
              <td>
                <Button color="error" onClick={() => handleDelete(inst.id)}>
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
