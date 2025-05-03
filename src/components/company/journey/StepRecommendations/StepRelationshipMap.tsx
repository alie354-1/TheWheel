import React, { useEffect, useState, useRef } from 'react';
import { RecommendationService } from '@/lib/services/recommendation.service';
import type { StepRelationship } from '@/lib/types/journey-steps.types';
import { motion } from 'framer-motion';

interface StepRelationshipMapProps {
  stepId: string;
  onStepSelect?: (stepId: string) => void;
  className?: string;
  maxItems?: number;
}

/**
 * StepRelationshipMap visualizes relationships between steps
 * Shows a connections map of prerequisite and dependent steps
 */
export const StepRelationshipMap: React.FC<StepRelationshipMapProps> = ({
  stepId,
  onStepSelect,
  className = '',
  maxItems = 8,
}) => {
  const [relationships, setRelationships] = useState<StepRelationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Colors for different types of relationships
  const relationshipColors = {
    prerequisite: '#3b82f6', // blue-500
    dependent: '#10b981',    // emerald-500 
    related: '#6366f1'       // indigo-500
  };

  useEffect(() => {
    const fetchRelationships = async () => {
      if (!stepId) return;

      try {
        setLoading(true);
        const relationshipData = await RecommendationService.getStepRelationships(stepId);
        setRelationships(relationshipData);
        setError(null);
      } catch (err) {
        console.error('Error fetching step relationships:', err);
        setError('Failed to load step relationships');
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, [stepId]);

  // Get visible relationships based on showAll flag
  const visibleRelationships = showAll 
    ? relationships 
    : relationships.slice(0, maxItems);

  // Simple coordinates for different nodes in visualization
  const calculateCoordinates = () => {
    const centerX = 200;
    const centerY = 160;
    const radius = 130;
    
    // Store nodes and their positions
    const nodes: { [key: string]: { x: number, y: number, name?: string, type?: string } } = {};
    
    // Add center node (current step)
    nodes[stepId] = { x: centerX, y: centerY };
    
    // Calculate positions for related nodes in a circle
    visibleRelationships.forEach((rel, index) => {
      const angle = (2 * Math.PI * index) / visibleRelationships.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const relatedId = rel.source_id === stepId ? rel.target_id : rel.source_id;
      const relatedName = rel.source_id === stepId ? rel.target_name : rel.source_name;
      
      nodes[relatedId] = { 
        x, 
        y,
        name: relatedName,
        type: rel.relationship_type
      };
    });
    
    return nodes;
  };

  const nodes = calculateCoordinates();

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-indigo-700 px-4 py-3">
        <h3 className="text-lg font-medium text-white">Step Connections</h3>
        <p className="text-indigo-100 text-sm">
          How this step connects to others in your journey
        </p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : relationships.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No connections found for this step.
          </div>
        ) : (
          <div className="relative" ref={containerRef} style={{ height: '320px' }}>
            {/* Lines connecting nodes */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 400 320" 
              preserveAspectRatio="xMidYMid meet"
              className="absolute top-0 left-0"
            >
              {visibleRelationships.map((rel, index) => {
                const sourceId = rel.source_id;
                const targetId = rel.target_id;
                
                if (!nodes[sourceId] || !nodes[targetId]) return null;
                
                const startX = nodes[sourceId].x;
                const startY = nodes[sourceId].y;
                const endX = nodes[targetId].x;
                const endY = nodes[targetId].y;
                
                // Calculate path curve control points
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const curveFactor = 20;
                
                const isPrerequisite = rel.relationship_type === 'prerequisite';
                const stroke = relationshipColors[rel.relationship_type];
                
                return (
                  <g key={`${sourceId}-${targetId}-${index}`}>
                    <path
                      d={`M ${startX} ${startY} Q ${midX + curveFactor} ${midY + curveFactor} ${endX} ${endY}`}
                      stroke={stroke}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={isPrerequisite ? "5,5" : "none"}
                      className="transition-all duration-300"
                    />
                    {/* Arrowhead */}
                    <polygon 
                      points={`${endX},${endY} ${endX-5},${endY-3} ${endX-3},${endY+5}`}
                      fill={stroke}
                      transform={`rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI + 45}, ${endX}, ${endY})`}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Center node (current step) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="absolute bg-indigo-100 border-2 border-indigo-600 rounded-lg p-3 transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-lg max-w-[140px]"
              style={{ left: nodes[stepId].x, top: nodes[stepId].y }}
            >
              <div className="text-sm font-semibold text-indigo-800 text-center">
                Current Step
              </div>
            </motion.div>

            {/* Related nodes */}
            {visibleRelationships.map((rel, index) => {
              const relatedId = rel.source_id === stepId ? rel.target_id : rel.source_id;
              if (!nodes[relatedId]) return null;
              
              const node = nodes[relatedId];
              const type = node.type || 'related';
              const typeName = type.charAt(0).toUpperCase() + type.slice(1);
              
              const bg = type === 'prerequisite' 
                ? 'bg-blue-50 border-blue-500'
                : type === 'dependent' 
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-indigo-50 border-indigo-500';
              
              const textColor = type === 'prerequisite' 
                ? 'text-blue-800'
                : type === 'dependent' 
                  ? 'text-emerald-800'
                  : 'text-indigo-800';
                  
              return (
                <motion.div
                  key={relatedId}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5, delay: 0.1 + (index * 0.05) }}
                  className={`absolute border-2 rounded-lg p-2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer max-w-[120px] shadow-md ${bg}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => onStepSelect?.(relatedId)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`text-xs font-medium ${textColor} mb-1`}>{typeName}</div>
                  <div className="text-xs font-semibold text-gray-900 line-clamp-2">
                    {node.name || 'Unknown Step'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {relationships.length > maxItems && (
          <div className="mt-2 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showAll ? 'Show less' : `Show all (${relationships.length})`}
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            Prerequisites
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-1"></span>
            Dependencies
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-1"></span>
            Related
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepRelationshipMap;
