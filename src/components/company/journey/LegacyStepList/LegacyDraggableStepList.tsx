import React, { useState, useCallback, useEffect } from 'react';
import { DraggableStepCard } from '../../journey/StepCard/DraggableStepCard';
import { JourneyStep, EnhancedJourneyStep, step_status } from '../../../../lib/types/journey-steps.types';
import { useRecommendationAnalytics } from '@/lib/hooks/useRecommendationAnalytics';
import { toast } from 'sonner';

interface DraggableStepListProps {
  steps: (JourneyStep | EnhancedJourneyStep)[];
  onOrderChange?: (steps: (JourneyStep | EnhancedJourneyStep)[]) => void;
  onStepSelect?: (stepId: string) => void;
  onStepStatusChange?: (stepId: string, status: step_status) => void;
  compact?: boolean;
  showPhase?: boolean;
  className?: string;
}

/**
 * DraggableStepList component
 * 
 * A component that displays a list of steps that can be reordered via drag and drop.
 * Part of the Journey UI Sprint 3 enhancements.
 */
export const DraggableStepList: React.FC<DraggableStepListProps> = ({
  steps,
  onOrderChange,
  onStepSelect,
  onStepStatusChange,
  compact = false,
  showPhase = true,
  className = '',
}) => {
  const [items, setItems] = useState<(JourneyStep | EnhancedJourneyStep)[]>([]);
  const analytics = useRecommendationAnalytics();

  // Initialize items state when steps prop changes
  useEffect(() => {
    setItems(steps);
  }, [steps]);

  // Handle moving a step
  const moveStep = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const draggedItem = newItems[dragIndex];
      
      // Remove the dragged item
      newItems.splice(dragIndex, 1);
      
      // Insert it at the new position
      newItems.splice(hoverIndex, 0, draggedItem);
      
      return newItems;
    });
  }, []);

  // Save the new order when drag ends
  const handleDragEnd = useCallback(() => {
    if (onOrderChange) {
      onOrderChange(items);
      
      // Log analytics - updated for Sprint 3
      analytics.trackRecommendationClick('step_reorder');
      
      toast.success('Step order updated');
    }
  }, [items, onOrderChange, analytics]);

  // Handle step selection
  const handleStepSelect = useCallback((stepId: string) => {
    if (onStepSelect) {
      onStepSelect(stepId);
    }
  }, [onStepSelect]);
  
  // Set up drag end event listener
  useEffect(() => {
    document.addEventListener('dragend', handleDragEnd);
    return () => {
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, [handleDragEnd]);

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((step, index) => {
        // Determine status - if it's an enhanced step it will have status property
        const status = ('status' in step) ? step.status : 'not_started';
        
        // Determine phase info
        const phaseInfo = ('phase_name' in step && step.phase_color) 
          ? { name: step.phase_name || '', color: step.phase_color } 
          : undefined;
        
        return (
          <DraggableStepCard
            key={step.id}
            step={step}
            index={index}
            status={status as step_status}
            phase={phaseInfo}
            moveStep={moveStep}
            onSelect={() => handleStepSelect(step.id)}
            compact={compact}
            showPhase={showPhase}
          />
        );
      })}

      {/* Hidden element just for spacing/layout purposes */}
      <div style={{ display: 'none' }} />
    </div>
  );
};

export default DraggableStepList;
