import React, { useState, useRef } from 'react';

interface ResizableBoxProps {
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
}

const SimpleResizeTest: React.FC<ResizableBoxProps> = ({
  initialWidth = 200,
  initialHeight = 150,
  initialX = 100,
  initialY = 100
}) => {
  const [dimensions, setDimensions] = useState({
    x: initialX,
    y: initialY,
    width: initialWidth,
    height: initialHeight
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialDimensions = useRef({ ...dimensions });

  const handleResizeStart = (handle: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Resize start:', handle);
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    initialMousePos.current = { x: e.clientX, y: e.clientY };
    initialDimensions.current = { ...dimensions };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;
    
    const deltaX = e.clientX - initialMousePos.current.x;
    const deltaY = e.clientY - initialMousePos.current.y;
    
    console.log('Mouse move:', { deltaX, deltaY, handle: resizeHandle });
    
    const newDimensions = { ...initialDimensions.current };
    
    switch (resizeHandle) {
      case 'top-left':
        newDimensions.x = initialDimensions.current.x + deltaX;
        newDimensions.y = initialDimensions.current.y + deltaY;
        newDimensions.width = initialDimensions.current.width - deltaX;
        newDimensions.height = initialDimensions.current.height - deltaY;
        break;
      case 'top-right':
        newDimensions.y = initialDimensions.current.y + deltaY;
        newDimensions.width = initialDimensions.current.width + deltaX;
        newDimensions.height = initialDimensions.current.height - deltaY;
        break;
      case 'bottom-left':
        newDimensions.x = initialDimensions.current.x + deltaX;
        newDimensions.width = initialDimensions.current.width - deltaX;
        newDimensions.height = initialDimensions.current.height + deltaY;
        break;
      case 'bottom-right':
        newDimensions.width = initialDimensions.current.width + deltaX;
        newDimensions.height = initialDimensions.current.height + deltaY;
        break;
      case 'top':
        newDimensions.y = initialDimensions.current.y + deltaY;
        newDimensions.height = initialDimensions.current.height - deltaY;
        break;
      case 'right':
        newDimensions.width = initialDimensions.current.width + deltaX;
        break;
      case 'bottom':
        newDimensions.height = initialDimensions.current.height + deltaY;
        break;
      case 'left':
        newDimensions.x = initialDimensions.current.x + deltaX;
        newDimensions.width = initialDimensions.current.width - deltaX;
        break;
    }
    
    // Ensure minimum dimensions
    newDimensions.width = Math.max(50, newDimensions.width);
    newDimensions.height = Math.max(50, newDimensions.height);
    
    setDimensions(newDimensions);
  };

  const handleMouseUp = () => {
    console.log('Mouse up');
    setIsResizing(false);
    setResizeHandle(null);
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handles = [
    { name: 'top-left', style: { top: -5, left: -5, cursor: 'nwse-resize' } },
    { name: 'top-right', style: { top: -5, right: -5, cursor: 'nesw-resize' } },
    { name: 'bottom-left', style: { bottom: -5, left: -5, cursor: 'nesw-resize' } },
    { name: 'bottom-right', style: { bottom: -5, right: -5, cursor: 'nwse-resize' } },
    { name: 'top', style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
    { name: 'right', style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' } },
    { name: 'bottom', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' } },
    { name: 'left', style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'ew-resize' } }
  ];

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      position: 'relative', 
      background: '#f0f0f0',
      overflow: 'hidden'
    }}>
      <div
        style={{
          position: 'absolute',
          left: dimensions.x,
          top: dimensions.y,
          width: dimensions.width,
          height: dimensions.height,
          background: 'white',
          border: '2px solid #3b82f6',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ padding: '10px' }}>
          <h3>Resizable Box</h3>
          <p>Width: {Math.round(dimensions.width)}px</p>
          <p>Height: {Math.round(dimensions.height)}px</p>
          <p>X: {Math.round(dimensions.x)}px</p>
          <p>Y: {Math.round(dimensions.y)}px</p>
        </div>
        
        {/* Resize handles */}
        {handles.map(({ name, style }) => (
          <div
            key={name}
            onMouseDown={handleResizeStart(name)}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: '#3b82f6',
              borderRadius: '50%',
              ...style
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleResizeTest;
