import React, { useState } from 'react';

interface TestComponent {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

export const TestDeckBuilder: React.FC = () => {
  const [components, setComponents] = useState<TestComponent[]>([
    { id: '1', x: 50, y: 50, width: 200, height: 100, content: 'Test Component 1' },
    { id: '2', x: 300, y: 200, width: 150, height: 150, content: 'Test Component 2' }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleComponentClick = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    console.log('Component clicked:', componentId);
    setSelectedId(componentId);
  };

  const handleSlideClick = () => {
    console.log('Slide clicked - deselecting');
    setSelectedId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    e.stopPropagation();
    const component = components.find(c => c.id === selectedId);
    if (!component) return;

    if (type === 'drag') {
      setDragStart({ x: e.clientX - component.x, y: e.clientY - component.y });
    } else {
      setResizeStart({ 
        x: e.clientX, 
        y: e.clientY, 
        width: component.width, 
        height: component.height 
      });
    }
  };

  const updateComponent = (id: string, updates: Partial<TestComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedId) return;

      if (dragStart) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        console.log('Dragging:', { x: newX, y: newY });
        updateComponent(selectedId, { x: newX, y: newY });
      } else if (resizeStart) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(50, resizeStart.height + deltaY);
        console.log('Resizing:', { width: newWidth, height: newHeight });
        updateComponent(selectedId, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setDragStart(null);
      setResizeStart(null);
    };

    if (dragStart || resizeStart) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragStart, resizeStart, selectedId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Deck Builder - Simple Component Interactions</h2>
      <p>Selected: {selectedId || 'None'}</p>
      
      <div 
        onClick={handleSlideClick}
        style={{
          position: 'relative',
          width: '800px',
          height: '600px',
          border: '2px solid #ccc',
          backgroundColor: '#f5f5f5'
        }}
      >
        {components.map(component => (
          <div
            key={component.id}
            onClick={(e) => handleComponentClick(e, component.id)}
            onMouseDown={(e) => selectedId === component.id && handleMouseDown(e, 'drag')}
            style={{
              position: 'absolute',
              left: component.x,
              top: component.y,
              width: component.width,
              height: component.height,
              backgroundColor: selectedId === component.id ? '#e3f2fd' : '#fff',
              border: selectedId === component.id ? '2px solid #2196f3' : '1px solid #ddd',
              padding: '10px',
              cursor: selectedId === component.id ? 'move' : 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${Math.min(component.width / 10, component.height / 5)}px`
            }}
          >
            {component.content}
            
            {selectedId === component.id && (
              <div
                onMouseDown={(e) => handleMouseDown(e, 'resize')}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  right: -5,
                  bottom: -5,
                  width: 10,
                  height: 10,
                  backgroundColor: '#2196f3',
                  cursor: 'nwse-resize'
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>Click a component to select it (blue border)</li>
          <li>Drag selected component to move</li>
          <li>Drag blue corner handle to resize</li>
          <li>Click empty space to deselect</li>
        </ul>
        <h3>Component States:</h3>
        {components.map(comp => (
          <div key={comp.id} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {comp.id}: x={comp.x}, y={comp.y}, w={comp.width}, h={comp.height}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDeckBuilder;
