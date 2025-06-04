import React, { useState } from 'react';
import { UnifiedDeckBuilder } from './UnifiedDeckBuilder.tsx';

export function DebugDeckBuilder() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-10), `${new Date().toISOString()}: ${info}`]);
  };

  // Wrap the original component to intercept events
  const originalLog = console.log;
  React.useEffect(() => {
    console.log = (...args) => {
      originalLog(...args);
      addDebugInfo(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
        <UnifiedDeckBuilder />
      </div>
      <div className="h-48 bg-gray-900 text-green-400 p-2 overflow-auto font-mono text-xs">
        <div className="font-bold mb-2">Debug Console:</div>
        {debugInfo.map((info, idx) => (
          <div key={idx} className="mb-1">{info}</div>
        ))}
      </div>
    </div>
  );
}
