import React from "react";
import { useNavigate } from "react-router-dom";

interface StepCardProps {
  id: string;
  name: string;
  description?: string;
  phaseName?: string;
  status: "not_started" | "in_progress" | "completed" | "skipped" | "not_needed";
  isParallel?: boolean;
  isArchived?: boolean;
  onStatusChange: (status: StepCardProps["status"]) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleParallel?: () => void;
  onArchive?: () => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  recommendations?: string[];
  aiInfo?: string;
}

const statusColors: Record<StepCardProps["status"], string> = {
  not_started: "badge badge-outline",
  in_progress: "badge badge-info",
  completed: "badge badge-success",
  skipped: "badge badge-warning",
  not_needed: "badge badge-neutral",
};

const StepCard: React.FC<StepCardProps> = ({
  id,
  name,
  description,
  phaseName,
  status,
  isParallel,
  isArchived,
  onStatusChange,
  onEdit,
  onDelete,
  onToggleParallel,
  onArchive,
  notes,
  onNotesChange,
  recommendations,
  aiInfo,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`card bg-base-100 shadow-md p-4 mb-2 ${isArchived ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-bold text-lg">{name}</span>
          {phaseName && <span className="ml-2 text-xs text-base-content/50">({phaseName})</span>}
        </div>
        <div className="flex gap-2">
          <span className={statusColors[status]}>{status.replace("_", " ")}</span>
          {isParallel && <span className="badge badge-accent">Parallel</span>}
        </div>
      </div>
      {description && <div className="mb-2 text-base-content/70">{description}</div>}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Recommendations:</span>
          <ul className="ml-4 list-disc">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
      {aiInfo && (
        <div className="mb-2 text-info">
          <span className="font-semibold">AI:</span> {aiInfo}
        </div>
      )}
      <div className="mb-2">
        {/* Example: Show a URL input for steps like "Choose a Domain" */}
        {name.toLowerCase().includes("domain") && (
          <div className="mb-2">
            <label className="label">Domain URL</label>
            <input
              className="input input-bordered w-full"
              type="url"
              placeholder="https://yourdomain.com"
              // TODO: Wire up value and onChange to save to profile/service
              onBlur={e => {
                // TODO: Save to profile/service
                alert(`Domain URL saved: ${e.target.value}`);
              }}
            />
          </div>
        )}
        <label className="label">Notes</label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={notes || ""}
          onChange={e => onNotesChange && onNotesChange(e.target.value)}
          placeholder="Add notes..."
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2 items-center">
        <select
          className="select select-bordered select-xs"
          value={status}
          onChange={e => onStatusChange(e.target.value as StepCardProps["status"])}
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
          <option value="not_needed">Not Needed</option>
        </select>
        <button className={`btn btn-xs ${isParallel ? "btn-accent" : "btn-outline btn-accent"}`} onClick={onToggleParallel}>
          {isParallel ? "Parallel" : "Set Parallel"}
        </button>
        <button className={`btn btn-xs ${isArchived ? "btn-outline" : "btn-outline"}`} onClick={onArchive}>
          {isArchived ? "Unarchive" : "Archive"}
        </button>
        <button className="btn btn-xs btn-outline" onClick={onEdit}>Edit</button>
        <button className="btn btn-xs btn-outline btn-error" onClick={onDelete}>Delete</button>
        <button className="btn btn-xs btn-primary" onClick={() => navigate(`/company/journey/step/${id}`)}>
          Details
        </button>
      </div>
    </div>
  );
};

export default StepCard;
