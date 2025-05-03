import React from "react";

interface FilterBarProps {
  phases: string[];
  statuses: string[];
  selectedPhase: string | "All";
  selectedStatus: string | "All";
  search: string;
  onPhaseChange: (phase: string | "All") => void;
  onStatusChange: (status: string | "All") => void;
  onSearchChange: (search: string) => void;
  view: string;
  onViewChange: (view: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  phases,
  statuses,
  selectedPhase,
  selectedStatus,
  search,
  onPhaseChange,
  onStatusChange,
  onSearchChange,
  view,
  onViewChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <select
        className="select select-bordered"
        value={selectedPhase}
        onChange={e => onPhaseChange(e.target.value)}
      >
        <option value="All">All Phases</option>
        {phases.map(phase => (
          <option key={phase} value={phase}>{phase}</option>
        ))}
      </select>
      <select
        className="select select-bordered"
        value={selectedStatus}
        onChange={e => onStatusChange(e.target.value)}
      >
        <option value="All">All Statuses</option>
        {statuses.map(status => (
          <option key={status} value={status}>{status.replace("_", " ")}</option>
        ))}
      </select>
      <input
        className="input input-bordered"
        type="text"
        placeholder="Search steps..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
      <select
        className="select select-bordered"
        value={view}
        onChange={e => onViewChange(e.target.value)}
      >
        <option value="board">Board View</option>
        <option value="list">List View</option>
        <option value="timeline">Timeline View</option>
      </select>
    </div>
  );
};

export default FilterBar;
