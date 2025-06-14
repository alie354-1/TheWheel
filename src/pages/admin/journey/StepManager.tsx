import React, { useEffect, useState } from "react";
import { journeyContentService } from "../../../lib/services/journeyContent.service";
import { Button, Checkbox, FormControlLabel, Input, MenuItem, Select, Table } from "@mui/material";
import StepInstanceToolAssignment from "../../../components/admin/journey/StepInstanceToolAssignment";

export default function StepManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [position, setPosition] = useState<number>(0);
  const [instances, setInstances] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setTemplates(await journeyContentService.getAllStepTemplates());
    setPhases(await journeyContentService.getAllPhases());
    setDomains(await journeyContentService.getAllDomains());
    setInstances(await journeyContentService.getAllStepInstances());
  };

  const handleTogglePhase = (phaseId: string) => {
    setSelectedPhases((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
    );
  };

  const handleCreateInstances = async () => {
    if (!selectedTemplate || !selectedDomain || selectedPhases.length === 0) return;
    for (const phase_id of selectedPhases) {
      await journeyContentService.upsertStepInstance({
        step_template_id: selectedTemplate,
        phase_id,
        domain_id: selectedDomain,
        position,
        config: {}
      });
    }
    setSelectedTemplate("");
    setSelectedPhases([]);
    setSelectedDomain("");
    setPosition(0);
    fetchAll();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Step Manager</h2>
      <div className="flex flex-col gap-2 mb-4">
        <Select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Step Template</MenuItem>
          {templates.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
          ))}
        </Select>
        <Select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Domain</MenuItem>
          {domains.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
          ))}
        </Select>
        <div>
          <label className="block font-medium mb-1">Select Phases:</label>
          {phases.map((p) => (
            <FormControlLabel
              key={p.id}
              control={
                <Checkbox
                  checked={selectedPhases.includes(p.id)}
                  onChange={() => handleTogglePhase(p.id)}
                />
              }
              label={p.name}
            />
          ))}
        </div>
        <Input
          type="number"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value))}
        />
        <Button variant="contained" onClick={handleCreateInstances}>
          Add Step to Selected Phases
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Phase</th>
            <th>Domain</th>
            <th>Position</th>
            <th>Tools</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((inst) => (
            <tr key={inst.id}>
              <td>{templates.find(t => t.id === inst.step_template_id)?.name}</td>
              <td>{phases.find(p => p.id === inst.phase_id)?.name}</td>
              <td>{domains.find(d => d.id === inst.domain_id)?.name}</td>
              <td>{inst.position}</td>
              <td><StepInstanceToolAssignment stepInstanceId={inst.id} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
