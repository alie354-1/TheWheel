/**
 * Draggable List Component
 * 
 * A reusable component for creating drag-and-drop lists.
 * Part of the UI rewrite to implement a more modern and consistent design.
 */

import React, { useState, useRef, useEffect } from 'react';
import { colors, spacing, shadows, borderRadius } from '../../design-system';

export interface DraggableItem {
  /** Item ID (unique identifier) */
  id: string;
  /** Item content (React node) */
  content: React.ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Additional data associated with the item */
  data?: any;
}

export interface DraggableListProps {
  /** List items */
  items: DraggableItem[];
  /** Function called when items are reordered */
  onReorder: (items: DraggableItem[]) => void;
  /** Direction of the list (horizontal or vertical) */
  direction?: 'horizontal' | 'vertical';
  /** Whether to show a placeholder during dragging */
  showPlaceholder?: boolean;
  /** Custom placeholder component */
  placeholder?: React.ReactNode;
  /** Whether the list is disabled */
  disabled?: boolean;
  /** Custom item renderer */
  renderItem?: (item: DraggableItem, isDragging: boolean, index: number) => React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Handle selector (CSS selector for drag handle) */
  handleSelector?: string;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Drag delay in milliseconds */
  dragDelay?: number;
}

/**
 * Draggable list component for creating drag-and-drop lists
 */
export const DraggableList: React.FC<DraggableListProps> = ({
  items,
  onReorder,
  direction = 'vertical',
  showPlaceholder = true,
  placeholder,
  disabled = false,
  renderItem,
  className = '',
  style = {},
  handleSelector,
  animationDuration = 200,
  dragDelay = 0,
}) => {
  // State for tracking dragging
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragCurrentPosition, setDragCurrentPosition] = useState({ x: 0, y: 0 });
  
  // Refs
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragDelayTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset item refs when items change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, item: DraggableItem, index: number) => {
    if (disabled || item.disabled) return;

    // Check if handle selector is specified and if the event target matches it
    if (handleSelector) {
      const target = e.target as HTMLElement;
      const handle = target.closest(handleSelector);
      if (!handle) return;
    }

    // Get client position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Set drag start position
    setDragStartPosition({ x: clientX, y: clientY });
    setDragCurrentPosition({ x: clientX, y: clientY });

    // If drag delay is specified, use a timer
    if (dragDelay > 0) {
      if (dragDelayTimer.current) clearTimeout(dragDelayTimer.current);
      dragDelayTimer.current = setTimeout(() => {
        setDraggedItem(item);
        setDraggedIndex(index);
        setIsDragging(true);
      }, dragDelay);
    } else {
      setDraggedItem(item);
      setDraggedIndex(index);
      setIsDragging(true);
    }

    // Add event listeners for drag move and end
    if ('touches' in e) {
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    // Prevent default to avoid text selection during drag
    e.preventDefault();
  };

  // Handle drag move
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    // Get client position
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Update current position
    setDragCurrentPosition({ x: clientX, y: clientY });

    // Find the item being dragged over
    if (listRef.current && draggedIndex !== null) {
      const listRect = listRef.current.getBoundingClientRect();
      const dragPoint = direction === 'vertical' ? clientY : clientX;
      const listStart = direction === 'vertical' ? listRect.top : listRect.left;

      // Find the index of the item being dragged over
      let newDragOverIndex = null;
      for (let i = 0; i < itemRefs.current.length; i++) {
        const itemRef = itemRefs.current[i];
        if (itemRef) {
          const itemRect = itemRef.getBoundingClientRect();
          const itemStart = direction === 'vertical' ? itemRect.top : itemRect.left;
          const itemEnd = direction === 'vertical' ? itemRect.bottom : itemRect.right;
          const itemCenter = (itemStart + itemEnd) / 2;

          if (i < draggedIndex && dragPoint < itemCenter) {
            newDragOverIndex = i;
            break;
          } else if (i > draggedIndex && dragPoint > itemCenter) {
            newDragOverIndex = i;
          }
        }
      }

      setDragOverIndex(newDragOverIndex);
    }

    // Prevent default to avoid scrolling during drag on touch devices
    e.preventDefault();
  };

  // Handle drag end
  const handleDragEnd = () => {
    // Clear drag delay timer
    if (dragDelayTimer.current) {
      clearTimeout(dragDelayTimer.current);
      dragDelayTimer.current = null;
    }

    // If not dragging, return
    if (!isDragging) return;

    // If dragged over an item, reorder the items
    if (draggedIndex !== null && dragOverIndex !== null) {
      const newItems = [...items];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dragOverIndex, 0, removed);
      onReorder(newItems);
    }

    // Reset dragging state
    setDraggedItem(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);

    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  // Calculate drag offset
  const getDragOffset = () => {
    if (!isDragging || draggedIndex === null) return { x: 0, y: 0 };

    const offsetX = dragCurrentPosition.x - dragStartPosition.x;
    const offsetY = dragCurrentPosition.y - dragStartPosition.y;

    return { x: offsetX, y: offsetY };
  };

  // List container style
  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    position: 'relative',
    ...style,
  };

  // Render the list
  return (
    <div
      ref={listRef}
      className={`draggable-list ${className} ${direction} ${disabled ? 'disabled' : ''}`}
      style={listStyle}
    >
      {items.map((item, index) => {
        const isDraggedItem = Boolean(draggedItem && draggedItem.id === item.id);
        const isItemDisabled = disabled || item.disabled;
        
        // Item style
        const itemStyle: React.CSSProperties = {
          position: 'relative',
          transition: isDraggedItem ? 'none' : `transform ${animationDuration}ms ease`,
          transform: isDraggedItem
            ? `translate(${direction === 'horizontal' ? getDragOffset().x : 0}px, ${
                direction === 'vertical' ? getDragOffset().y : 0
              }px)`
            : 'translate(0, 0)',
          zIndex: isDraggedItem ? 10 : 1,
          opacity: isDraggedItem ? 0.8 : 1,
          cursor: isItemDisabled ? 'default' : 'grab',
          userSelect: 'none',
          boxSizing: 'border-box',
          margin: direction === 'vertical' ? `${spacing[2]} 0` : `0 ${spacing[2]}`,
        };

        // Render the item
        return (
          <div
            key={item.id}
            ref={el => (itemRefs.current[index] = el)}
            className={`draggable-item ${isDraggedItem ? 'dragging' : ''} ${
              isItemDisabled ? 'disabled' : ''
            }`}
            style={itemStyle}
            onMouseDown={e => handleDragStart(e, item, index)}
            onTouchStart={e => handleDragStart(e, item, index)}
          >
            {renderItem ? renderItem(item, isDraggedItem, index) : item.content}
          </div>
        );
      })}
    </div>
  );
};

export default DraggableList;
