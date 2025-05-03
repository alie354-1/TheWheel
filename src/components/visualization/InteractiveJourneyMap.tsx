import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCompany } from '@/lib/hooks/useCompany';
import { journeyStepsService } from '@/lib/services/journeySteps.service';
import { Tooltip } from '@/components/common/Tooltip';

interface Step {
  id: string;
  name: string;
  status: string;
  phase_id: string;
  phase_name: string;
  difficulty_level: number;
  position: number;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  steps: Step[];
}

interface Relationship {
  source_id: string;
  target_id: string;
  type: 'prerequisite' | 'dependency' | 'related';
}

interface InteractiveJourneyMapProps {
  companyId?: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  highlightStepId?: string;
}

/**
 * InteractiveJourneyMap
 * 
 * A zoomable, pannable visualization of the company's journey steps,
 * showing phases, steps, and their relationships.
 * Part of the Sprint 4 Advanced Journey Visualization features.
 */
export const InteractiveJourneyMap: React.FC<InteractiveJourneyMapProps> = ({
  companyId,
  onStepClick,
  className = '',
  maxZoom = 2,
  minZoom = 0.5,
  initialZoom = 1,
  highlightStepId
}) => {
  const { currentCompany } = useCompany();
  const effectiveCompanyId = companyId || currentCompany?.id;
  
  const [phases, setPhases] = useState<Phase[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Zoom and pan state
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch journey data
  useEffect(() => {
    const fetchJourneyData = async () => {
      if (!effectiveCompanyId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch phases with steps
        const phasesData = await journeyStepsService.getPhases(effectiveCompanyId);
        
        // Fetch step relationships
        const relationshipsData = await journeyStepsService.getStepRelationships(effectiveCompanyId);
        
        setPhases(phasesData);
        setRelationships(relationshipsData);
      } catch (err) {
        console.error('Error fetching journey data:', err);
        setError('Failed to load journey map data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJourneyData();
  }, [effectiveCompanyId]);
  
  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoom + delta, minZoom), maxZoom);
    
    // Calculate zoom center point (cursor position)
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Adjust position to zoom towards cursor
      const zoomFactor = newZoom / zoom;
      const newX = mouseX - (mouseX - position.x) * zoomFactor;
      const newY = mouseY - (mouseY - position.y) * zoomFactor;
      
      setZoom(newZoom);
      setPosition({ x: newX, y: newY });
    } else {
      setZoom(newZoom);
    }
  };
  
  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  // Handle mouse up for panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Reset zoom and position
  const handleReset = () => {
    setZoom(initialZoom);
    setPosition({ x: 0, y: 0 });
  };
  
  // Zoom in
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, maxZoom);
    setZoom(newZoom);
  };
  
  // Zoom out
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, minZoom);
    setZoom(newZoom);
  };
  
  // Get status color for step
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'not_started':
        return 'bg-gray-300';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  // Get relationship color
  const getRelationshipColor = (type: string): string => {
    switch (type) {
      case 'prerequisite':
        return '#e11d48'; // rose-600
      case 'dependency':
        return '#0284c7'; // sky-600
      case 'related':
        return '#9333ea'; // purple-600
      default:
        return '#9ca3af'; // gray-400
    }
  };
  
  // Get step position in the SVG
  const getStepPosition = (phaseIndex: number, stepIndex: number, totalSteps: number) => {
    const phaseWidth = 250;
    const phaseHeight = 450;
    const phaseSpacing = 50;
    const stepHeight = Math.min(80, (phaseHeight - 60) / Math.max(totalSteps, 1));
    const stepSpacing = 20;
    
    const x = phaseIndex * (phaseWidth + phaseSpacing) + 40;
    const y = stepIndex * (stepHeight + stepSpacing) + 80;
    
    return { x, y, width: phaseWidth - 80, height: stepHeight };
  };
  
  // Render step connections (relationships)
  const renderConnections = () => {
    const connections: React.ReactNode[] = [];
    
    relationships.forEach((rel, index) => {
      let sourcePhaseIndex = -1;
      let sourceStepIndex = -1;
      let targetPhaseIndex = -1;
      let targetStepIndex = -1;
      
      // Find source and target positions
      phases.forEach((phase, phaseIndex) => {
        phase.steps.forEach((step, stepIndex) => {
          if (step.id === rel.source_id) {
            sourcePhaseIndex = phaseIndex;
            sourceStepIndex = stepIndex;
          }
          if (step.id === rel.target_id) {
            targetPhaseIndex = phaseIndex;
            targetStepIndex = stepIndex;
          }
        });
      });
      
      // Skip if we couldn't find both steps
      if (sourcePhaseIndex === -1 || targetPhaseIndex === -1) return;
      
      const sourcePos = getStepPosition(
        sourcePhaseIndex, 
        sourceStepIndex, 
        phases[sourcePhaseIndex].steps.length
      );
      const targetPos = getStepPosition(
        targetPhaseIndex, 
        targetStepIndex, 
        phases[targetPhaseIndex].steps.length
      );
      
      // Calculate control points for curved paths
      let controlPointX = 0;
      
      if (sourcePhaseIndex === targetPhaseIndex) {
        // Same phase - make a loop
        controlPointX = sourcePos.x - 100;
      } else {
        // Different phases - curve between
        controlPointX = (sourcePos.x + sourcePos.width + targetPos.x) / 2;
      }
      
      const path = `
        M ${sourcePos.x + sourcePos.width} ${sourcePos.y + sourcePos.height / 2}
        C ${controlPointX} ${sourcePos.y + sourcePos.height / 2},
          ${controlPointX} ${targetPos.y + targetPos.height / 2},
          ${targetPos.x} ${targetPos.y + targetPos.height / 2}
      `;
      
      connections.push(
        <g key={`rel-${index}`}>
          <path
            d={path}
            stroke={getRelationshipColor(rel.type)}
            strokeWidth={2}
            fill="none"
            strokeDasharray={rel.type === 'related' ? '5,5' : 'none'}
            markerEnd="url(#arrowhead)"
          />
          <title>{rel.type}</title>
        </g>
      );
    });
    
    return connections;
  };
  
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Loading journey map...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      ref={mapContainerRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Interactive Journey Map</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            disabled={zoom <= minZoom}
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
            aria-label="Reset view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            disabled={zoom >= maxZoom}
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden h-[600px] border border-gray-200 rounded-lg">
        <div
          className="absolute touch-none cursor-grab active:cursor-grabbing"
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <motion.div
            className="origin-center"
            style={{
              scale: zoom,
              x: position.x,
              y: position.y
            }}
          >
            <svg width="1500" height="600" viewBox="0 0 1500 600">
              {/* Arrow marker definition for relationship lines */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#667eea" />
                </marker>
              </defs>
              
              {/* Render relationships */}
              {renderConnections()}
              
              {/* Render phases and steps */}
              {phases.sort((a, b) => a.order - b.order).map((phase, phaseIndex) => (
                <g key={phase.id}>
                  {/* Phase header */}
                  <rect
                    x={phaseIndex * 300 + 10}
                    y={10}
                    width={280}
                    height={50}
                    rx={5}
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                  />
                  <text
                    x={phaseIndex * 300 + 150}
                    y={40}
                    textAnchor="middle"
                    fontSize={16}
                    fontWeight="bold"
                    fill="#374151"
                  >
                    {phase.name}
                  </text>
                  
                  {/* Phase steps */}
                  {phase.steps.map((step, stepIndex) => {
                    const stepPos = getStepPosition(phaseIndex, stepIndex, phase.steps.length);
                    const isHighlighted = highlightStepId === step.id;
                    
                    return (
                      <g key={step.id}>
                        <motion.rect
                          x={stepPos.x}
                          y={stepPos.y}
                          width={stepPos.width}
                          height={stepPos.height}
                          rx={5}
                          fill="white"
                          stroke={isHighlighted ? '#6366f1' : '#d1d5db'}
                          strokeWidth={isHighlighted ? 3 : 1}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => onStepClick?.(step.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <text
                          x={stepPos.x + 10}
                          y={stepPos.y + 20}
                          fontSize={12}
                          fontWeight="500"
                          fill="#1f2937"
                          onClick={() => onStepClick?.(step.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {step.name.length > 30 ? step.name.substring(0, 27) + '...' : step.name}
                        </text>
                        <circle
                          cx={stepPos.x + stepPos.width - 15}
                          cy={stepPos.y + stepPos.height - 15}
                          r={6}
                          className={getStatusColor(step.status)}
                        />
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
          </motion.div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex mt-4 text-xs text-gray-600 flex-wrap">
        <div className="mr-4 flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
          <span>Completed</span>
        </div>
        <div className="mr-4 flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
          <span>In Progress</span>
        </div>
        <div className="mr-4 flex items-center">
          <span className="inline-block w-3 h-3 bg-gray-300 rounded-full mr-1"></span>
          <span>Not Started</span>
        </div>
        <div className="mr-4 flex items-center">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
          <span>Blocked</span>
        </div>
        <div className="mr-4 flex items-center">
          <svg height="6" width="20" className="mr-1">
            <line x1="0" y1="3" x2="20" y2="3" stroke="#e11d48" strokeWidth="2" />
          </svg>
          <span>Prerequisite</span>
        </div>
        <div className="mr-4 flex items-center">
          <svg height="6" width="20" className="mr-1">
            <line x1="0" y1="3" x2="20" y2="3" stroke="#0284c7" strokeWidth="2" />
          </svg>
          <span>Dependency</span>
        </div>
        <div className="flex items-center">
          <svg height="6" width="20" className="mr-1">
            <line x1="0" y1="3" x2="20" y2="3" stroke="#9333ea" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
          <span>Related</span>
        </div>
      </div>
      
      <p className="mt-2 text-xs text-gray-500">
        <span className="font-medium">Tip:</span> Scroll to zoom, drag to pan, click on steps to view details
      </p>
    </div>
  );
};

export default InteractiveJourneyMap;
