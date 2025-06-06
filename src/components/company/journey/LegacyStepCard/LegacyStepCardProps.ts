import { JourneyStep } from "../../../../lib/types/journey-unified.types";

export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface StepCardProps {
  step: JourneyStep;
  status?: StepStatus;
  selected?: boolean; // Changed from isSelected to selected for consistency
  mode?: 'compact' | 'standard' | 'detailed';
  onClick?: (step: JourneyStep) => void;
  onStatusChange?: (newStatus: StepStatus) => void;
  className?: string;
  
  // Additional props for DraggableStepCard compatibility
  phase?: {
    name: string;
    color?: string;
  };
  compact?: boolean; // Alias for mode="compact"
  showPhase?: boolean; // Whether to show phase information
}
