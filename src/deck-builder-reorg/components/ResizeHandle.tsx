import React from 'react';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'top' | 'bottom';
  visible: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResizeStart, position, visible }) => {
  if (!visible) return null;
  
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '14px', // Increased size for better visibility
    height: '14px', // Increased size
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // blue-500 with higher opacity
    borderRadius: '50%',
    zIndex: 1000, // Ensure handles are on top
    border: '2px solid white', // Thicker border for better contrast
    pointerEvents: 'auto', // Ensure handles can capture mouse events
    boxShadow: '0 0 3px rgba(0, 0, 0, 0.5)', // Add shadow for better visibility
    transform: 'translate(0, 0)', // Ensure no additional transforms are applied
  };

  // We don't use top/right/bottom/left positioning here because that's handled by the parent component
  // This component just needs to be visible and handle mouse events
  const positionStyles: Record<ResizeHandleProps['position'], React.CSSProperties> = {
    'top-left': { ...baseStyle, cursor: 'nwse-resize' },
    'top-right': { ...baseStyle, cursor: 'nesw-resize' },
    'bottom-left': { ...baseStyle, cursor: 'nesw-resize' },
    'bottom-right': { ...baseStyle, cursor: 'nwse-resize' },
    'left': { ...baseStyle, cursor: 'ew-resize' },
    'right': { ...baseStyle, cursor: 'ew-resize' },
    'top': { ...baseStyle, cursor: 'ns-resize' },
    'bottom': { ...baseStyle, cursor: 'ns-resize' },
  };
  
  return (
    <div
      style={positionStyles[position]}
      onMouseDown={(e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        onResizeStart(e);
      }}
      className="hover:bg-blue-400 resize-handle" // Add hover effect and class for debugging
    />
  );
};
