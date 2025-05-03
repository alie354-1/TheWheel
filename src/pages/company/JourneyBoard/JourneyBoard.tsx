import React from "react";
import PhaseColumn from "./PhaseColumn";

interface Step {
  id: string;
  name: string;
  description?: string;
  phaseName: string;
  status: "not_started" | "in_progress" | "completed" | "skipped" | "not_needed";
  isParallel?: boolean;
  isArchived?: boolean;
  notes?: string;
  recommendations?: string[];
  aiInfo?: string;
}

interface JourneyBoardProps {
  phases: string[];
  stepsByPhase: Record<string, Step[]>;
  onStatusChange: (stepId: string, status: string) => void;
  onEditStep?: (stepId: string) => void;
  onDeleteStep?: (stepId: string) => void;
  onToggleParallel?: (stepId: string) => void;
  onArchiveStep?: (stepId: string) => void;
  onNotesChange?: (stepId: string, notes: string) => void;
}

const JourneyBoard: React.FC<JourneyBoardProps> = ({
  phases,
  stepsByPhase,
  onStatusChange,
  onEditStep,
  onDeleteStep,
  onToggleParallel,
  onArchiveStep,
  onNotesChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto">
      {phases.map((phase) => (
        <PhaseColumn
          key={phase}
          phaseName={phase}
          steps={stepsByPhase[phase] || []}
          onStatusChange={onStatusChange}
          onEditStep={onEditStep}
          onDeleteStep={onDeleteStep}
          onToggleParallel={onToggleParallel}
          onArchiveStep={onArchiveStep}
          onNotesChange={onNotesChange}
        />
      ))}
    </div>
  );
};

export default JourneyBoard;
