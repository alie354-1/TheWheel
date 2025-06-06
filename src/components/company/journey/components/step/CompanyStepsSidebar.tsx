import React from "react";
import { Step } from "../../types/journey.types";
import { Domain, Phase } from "../../types/journey.types";

interface CompanyStepsSidebarProps {
  stepsWithStatus: {
    step: Step;
    status: "completed" | "ready" | "blocked";
    completion?: number;
    urgent?: boolean;
    dueDate?: string;
  }[];
  domains: Domain[];
  phases: Phase[];
  onViewStep: (step: Step) => void;
  onAddStep: () => void;
  onDeleteStep: (stepId: string) => void;
  onOpenStep: (stepId: string) => void;
}

const CompanyStepsSidebar: React.FC<CompanyStepsSidebarProps> = ({
  stepsWithStatus,
  domains,
  phases,
  onViewStep,
  onAddStep,
  onDeleteStep,
  onOpenStep,
}) => {
  const [search, setSearch] = React.useState("");
  const [filterUrgent, setFilterUrgent] = React.useState(false);
  const [filterStarted, setFilterStarted] = React.useState(false);
  const [filterBlocked, setFilterBlocked] = React.useState(false);

  // Overview stats
  const total = stepsWithStatus.length;
  const completed = stepsWithStatus.filter(s => s.status === "completed").length;
  const active = stepsWithStatus.filter(s => s.status !== "completed").length;
  const urgent = stepsWithStatus.filter(s => s.urgent).length;

  // Filtered steps
  let filtered = stepsWithStatus;
  if (search) {
    filtered = filtered.filter(s =>
      s.step.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (filterUrgent) {
    filtered = filtered.filter(s => s.urgent);
  }
  if (filterStarted) {
    filtered = filtered.filter(s => s.status === "ready");
  }
  if (filterBlocked) {
    filtered = filtered.filter(s => s.status === "blocked");
  }

  // Urgent steps
  const urgentSteps = filtered.filter(s => s.urgent);
  // In progress steps (not completed, not urgent)
  const inProgressSteps = filtered.filter(
    s => s.status !== "completed" && !s.urgent
  );

  return (
    <aside className="min-w-[200px] max-w-[320px] w-[260px] bg-white border-r h-screen flex flex-col p-3">
      {/* Overview */}
      <div className="mb-4">
        <div className="font-bold text-lg mb-1">My Company Steps</div>
        <div className="flex gap-2 text-xs text-gray-600">
          <span>📊 {total} Total</span>
          <span>🎯 {active} Active</span>
          <span>✅ {completed} Complete</span>
          <span>⚡ {urgent} Urgent</span>
        </div>
      </div>
      {/* Search & Filters */}
      <div className="mb-4">
        <input
          className="w-full border rounded px-2 py-1 text-sm mb-2"
          placeholder="Search steps..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 text-xs">
          <label>
            <input
              type="checkbox"
              checked={filterUrgent}
              onChange={e => setFilterUrgent(e.target.checked)}
            />{" "}
            Urgent
          </label>
          <label>
            <input
              type="checkbox"
              checked={filterStarted}
              onChange={e => setFilterStarted(e.target.checked)}
            />{" "}
            Started
          </label>
          <label>
            <input
              type="checkbox"
              checked={filterBlocked}
              onChange={e => setFilterBlocked(e.target.checked)}
            />{" "}
            Blocked
          </label>
        </div>
      </div>
      {/* Urgent Steps */}
      {urgentSteps.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold text-red-700 text-xs mb-1">Urgent Steps</div>
          <ul>
            {urgentSteps.map(s => (
              <li key={s.step.id} className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{s.step.name}</span>
                  {s.dueDate && (
                    <span className="ml-2 text-xs text-gray-500">Due: {s.dueDate}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1 rounded hover:bg-blue-100"
                    title="Quick View"
                    onClick={() => onViewStep(s.step)}
                  >
                    <span role="img" aria-label="Quick View" className="text-lg">🔍</span>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-indigo-100"
                    title="Open Step"
                    onClick={() => onOpenStep(s.step.id)}
                  >
                    <span role="img" aria-label="Open Step" className="text-lg">↗️</span>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100"
                    title="Delete Step"
                    onClick={() => onDeleteStep(s.step.id)}
                  >
                    <span role="img" aria-label="Delete Step" className="text-lg">🗑️</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* In Progress Steps */}
      {inProgressSteps.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold text-xs mb-1">In Progress</div>
          <ul>
            {inProgressSteps.map(s => (
              <li key={s.step.id} className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{s.step.name}</span>
                  {typeof s.completion === "number" && (
                    <span className="ml-2 text-xs text-gray-500">
                      {Math.round((s.completion || 0) * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1 rounded hover:bg-blue-100"
                    title="Quick View"
                    onClick={() => onViewStep(s.step)}
                  >
                    <span role="img" aria-label="Quick View" className="text-lg">🔍</span>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-indigo-100"
                    title="Open Step"
                    onClick={() => onOpenStep(s.step.id)}
                  >
                    <span role="img" aria-label="Open Step" className="text-lg">↗️</span>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100"
                    title="Delete Step"
                    onClick={() => onDeleteStep(s.step.id)}
                  >
                    <span role="img" aria-label="Delete Step" className="text-lg">🗑️</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Add Step Button */}
      <button
        className="mt-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
        onClick={onAddStep}
      >
        + Add New Step
      </button>
    </aside>
  );
};

export default CompanyStepsSidebar;
