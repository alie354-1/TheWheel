import React, { useState } from 'react';
import Draggable from 'react-draggable';

export function SimpleDragTest() {
  const [components, setComponents] = useState([
    { id: '1', x: 50, y: 50, width: 200, height: 100, text: 'Component 1' },
    { id: '2', x: 300, y: 150, width: 200, height: 100, text: 'Component 2' }
  ]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-20), `[${new Date().toISOString().split('T')[1]}] ${message}`]);
  };

  const handleDragStop = (id: string, e: any, data: any) => {
    addLog(`Drag stop for ${id}: x=${data.x}, y=${data.y}`);
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, x: data.x, y: data.y } : comp
    ));
  };

  const handleClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addLog(`Clicked component ${id}`);
    setSelectedId(id);
  };

  return (
    <div className="flex h-screen">
      <div 
        className="flex-1 relative bg-gray-100 overflow-hidden"
        onClick={() => {
          addLog('Clicked background - deselecting');
          setSelectedId(null);
        }}
      >
        <h2 className="absolute top-2 left-2 text-lg font-bold">Simple Drag Test</h2>
        
        {components.map(comp => (
          <Draggable
            key={comp.id}
            position={{ x: comp.x, y: comp.y }}
            onStop={(e, data) => handleDragStop(comp.id, e, data)}
          >
            <div
              className={`absolute p-4 bg-white rounded shadow cursor-move ${
                selectedId === comp.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ width: comp.width, height: comp.height }}
              onClick={(e) => handleClick(comp.id, e)}
            >
              <div className="font-bold">{comp.text}</div>
              <div className="text-xs text-gray-500">
                Position: ({comp.x}, {comp.y})
              </div>
            </div>
          </Draggable>
        ))}
      </div>
      
      <div className="w-96 bg-gray-900 text-green-400 p-4 overflow-auto">
        <h3 className="font-bold mb-2">Event Log:</h3>
        <div className="font-mono text-xs space-y-1">
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
