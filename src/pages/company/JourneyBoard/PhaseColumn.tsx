import React from "react";
import StepCard from "./StepCard";

interface PhaseColumnProps {
  phaseName: string;
  steps: Array<{
    id: string;
    name: string;
    description?: string;
    status: "not_started" | "in_progress" | "completed" | "skipped" | "not_needed";
    isParallel?: boolean;
    isArchived?: boolean;
    notes?: string;
    recommendations?: string[];
    aiInfo?: string;
  }>;
  onStatusChange: (stepId: string, status: string) => void;
  onEditStep?: (stepId: string) => void;
  onDeleteStep?: (stepId: string) => void;
  onToggleParallel?: (stepId: string) => void;
  onArchiveStep?: (stepId: string) => void;
  onNotesChange?: (stepId: string, notes: string) => void;
}

const PhaseColumn: React.FC<PhaseColumnProps> = ({
  phaseName,
  steps,
  onStatusChange,
  onEditStep,
  onDeleteStep,
  onToggleParallel,
  onArchiveStep,
  onNotesChange,
}) => {
  return (
    <div className="w-full md:w-80 bg-base-200 rounded-lg p-2 shadow-md flex flex-col gap-2">
      <h3 className="text-xl font-bold mb-2">{phaseName}</h3>
      {steps.length === 0 ? (
        <div className="text-base-content/50 text-sm">No steps in this phase.</div>
      ) : (
        steps.map((step) => (
          <StepCard
            key={step.id}
            id={step.id}
            name={step.name}
            description={step.description}
            phaseName={phaseName}
            status={step.status}
            isParallel={step.isParallel}
            isArchived={step.isArchived}
            notes={step.notes}
            recommendations={step.recommendations}
            aiInfo={step.aiInfo}
            onStatusChange={(status) => onStatusChange(step.id, status)}
            onEdit={onEditStep ? () => onEditStep(step.id) : undefined}
            onDelete={onDeleteStep ? () => onDeleteStep(step.id) : undefined}
            onToggleParallel={onToggleParallel ? () => onToggleParallel(step.id) : undefined}
            onArchive={onArchiveStep ? () => onArchiveStep(step.id) : undefined}
            onNotesChange={onNotesChange ? (notes) => onNotesChange(step.id, notes) : undefined}
          />
        ))
      )}
    </div>
  );
};

export default PhaseColumn;
