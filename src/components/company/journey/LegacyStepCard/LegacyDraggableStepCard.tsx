import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { StepCard } from './StepCard';
import { useRecommendationAnalytics } from '@/lib/hooks/useRecommendationAnalytics';
import { JourneyStep, EnhancedJourneyStep, step_status } from '../../../../lib/types/journey-steps.types';

const ITEM_TYPE = 'JOURNEY_STEP';

interface DragItem {
  id: string;
  index: number;
}

interface DraggableStepCardProps {
  step: JourneyStep | EnhancedJourneyStep;
  index: number;
  status?: step_status;
  phase?: { name: string; color?: string };
  moveStep: (dragIndex: number, hoverIndex: number) => void;
  onSelect?: () => void;
  compact?: boolean;
  showPhase?: boolean;
}

export const DraggableStepCard: React.FC<DraggableStepCardProps> = ({
  step,
  index,
  moveStep,
  onSelect,
  status,
  phase,
  compact,
  showPhase
}) => {
  const analytics = useRecommendationAnalytics();
  const ref = useRef<HTMLDivElement>(null);

  // Track drag analytics
  const trackDragAction = (action: 'start' | 'end' | 'drop') => {
    // Updated for Sprint 3 analytics with new method signature
    analytics.trackRecommendationClick(step.id);
  };

  // Setup drag source
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: { id: step.id, index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
    // Add lifecycle events with proper typing
    options: {
      dropEffect: 'move',
    },
    end: () => {
      trackDragAction('end');
    },
  });

  // Call trackDragAction at the beginning of drag
  React.useEffect(() => {
    if (isDragging) {
      trackDragAction('start');
    }
  }, [isDragging]);

  // Setup drop target
  const [{ handlerId }, drop] = useDrop<DragItem, unknown, { handlerId: string | symbol | null }>({
    accept: ITEM_TYPE,
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveStep(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for performance to avoid expensive index searches
      item.index = hoverIndex;
      
      trackDragAction('drop');
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));

  return (
    <div 
      ref={ref} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
      className="transition-transform hover:translate-y-[-2px]"
      data-handler-id={handlerId}
    >
      <StepCard
        step={step}
        status={status}
        phase={phase}
        compact={compact}
        showPhase={showPhase}
        onClick={onSelect}
      />
    </div>
  );
};

export default DraggableStepCard;
