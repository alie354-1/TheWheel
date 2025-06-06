import React from "react";
import { Domain, Phase } from "../../types/journey.types";

export interface StepsFilterPanelProps {
  domains: Domain[];
  phases: Phase[];
  statusOptions: string[];
  selectedDomain: string;
  selectedPhase: string;
  selectedStatus: string;
  search: string;
  onDomainChange: (domainId: string) => void;
  onPhaseChange: (phaseId: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

export const StepsFilterPanel: React.FC<StepsFilterPanelProps> = ({
  domains,
  phases,
  statusOptions,
  selectedDomain,
  selectedPhase,
  selectedStatus,
  search,
  onDomainChange,
  onPhaseChange,
  onStatusChange,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-4 bg-white p-4 rounded shadow">
      <div>
        <label className="block text-xs font-semibold mb-1">Domain</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedDomain}
          onChange={e => onDomainChange(e.target.value)}
        >
          <option value="">All</option>
          {domains.map(domain => (
            <option key={domain.id} value={domain.id}>{domain.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Phase</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedPhase}
          onChange={e => onPhaseChange(e.target.value)}
        >
          <option value="">All</option>
          {phases.map(phase => (
            <option key={phase.id} value={phase.id}>{phase.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Status</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedStatus}
          onChange={e => onStatusChange(e.target.value)}
        >
          <option value="">All</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold mb-1">Search</label>
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          placeholder="Search steps..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StepsFilterPanel;
