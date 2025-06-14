import React, { useEffect, useState } from "react";
import { newJourneyAdminService } from "../../../lib/services/admin/new_journey_admin.service";
import { Button, Input, Table } from "@mui/material";
import { NewJourneyDomain } from "../../../lib/types/new_journey.types";

export default function DomainManager() {
  const [domains, setDomains] = useState<NewJourneyDomain[]>([]);
  const [newDomain, setNewDomain] = useState({ name: "" });
  const [selectedSystem, setSelectedSystem] = useState<'legacy' | 'new'>('legacy');

  useEffect(() => {
    if (selectedSystem === 'new') {
      fetchDomains();
    } else {
      // Legacy system does not have domain management in this service
      setDomains([]);
    }
  }, [selectedSystem]);

  const fetchDomains = async () => {
    const data = await newJourneyAdminService.getDomains();
    setDomains(data);
  };

  const handleSave = async () => {
    if (!newDomain.name.trim() || selectedSystem === 'legacy') return;
    await newJourneyAdminService.upsertDomain(newDomain);
    setNewDomain({ name: "" });
    fetchDomains();
  };

  const handleDelete = async (id: string) => {
    if (selectedSystem === 'legacy') return;
    await newJourneyAdminService.deleteDomain(id);
    fetchDomains();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Domain Manager</h2>
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
          placeholder="Domain name"
          value={newDomain.name}
          onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
        />
        <Button variant="contained" onClick={handleSave}>
          Add Domain
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => (
            <tr key={domain.id}>
              <td>{domain.name}</td>
              <td>
                <Button color="error" onClick={() => handleDelete(domain.id)}>
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
