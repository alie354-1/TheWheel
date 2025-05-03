import React from "react";

interface ListViewProps {
  steps: Array<{
    id: string;
    name: string;
    status: "not_started" | "in_progress" | "completed" | "skipped" | "not_needed";
    isArchived?: boolean;
    onStatusChange: (status: string) => void;
    onReorder: (stepId: string, direction: "up" | "down") => void;
  }>;
}

const ListView: React.FC<ListViewProps> = ({ steps }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <ul className="divide-y divide-base-200">
        {steps.map((step, idx) => (
          <li key={step.id} className={`flex items-center gap-2 py-2 ${step.isArchived ? "opacity-50" : ""}`}>
            <input
              type="checkbox"
              className="checkbox checkbox-success"
              checked={step.status === "completed"}
              onChange={() => step.onStatusChange(step.status === "completed" ? "not_started" : "completed")}
            />
            <span className={`flex-grow ${step.status === "completed" ? "line-through" : ""}`}>{step.name}</span>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => step.onReorder(step.id, "up")}
              disabled={idx === 0}
              title="Move Up"
            >↑</button>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => step.onReorder(step.id, "down")}
              disabled={idx === steps.length - 1}
              title="Move Down"
            >↓</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListView;
