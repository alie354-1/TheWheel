import React, { useEffect, useState } from "react";
import { JourneyService } from "../services/journey.service";
import { supabase } from "../../lib/supabase";
import { Step } from "../types/journey.types";
import { useNavigate } from "react-router-dom";

/**
 * JourneyMapPage
 * 
 * Visualizes the journey as a graph of steps and relationships.
 */
const NODE_RADIUS = 40;

const JourneyMapPage: React.FC = () => {
  const steps = JourneyService.getSteps();
  const [relationships, setRelationships] = useState<any[]>([]);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRelationships() {
      const { data } = await supabase
        .from("step_relationships")
        .select("from_step_id, to_step_id, relationship_type, probability_weight");
      setRelationships(data || []);
    }
    fetchRelationships();
  }, []);

  useEffect(() => {
    // Simple circular layout for demo
    const angleStep = (2 * Math.PI) / steps.length;
    const centerX = 400, centerY = 300, radius = 220;
    const pos: Record<string, { x: number; y: number }> = {};
    steps.forEach((step, i) => {
      pos[step.id] = {
        x: centerX + radius * Math.cos(i * angleStep - Math.PI / 2),
        y: centerY + radius * Math.sin(i * angleStep - Math.PI / 2)
      };
    });
    setPositions(pos);
  }, [steps.length]);

  // For demo, completed steps could be stored in localStorage
  const completedStepIds: string[] = JSON.parse(localStorage.getItem("completedStepIds") || "[]");

  function getNodeColor(stepId: string) {
    if (completedStepIds.includes(stepId)) return "#22c55e"; // green
    // Could add more logic for ready/blocked
    return "#3b82f6"; // blue
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Journey Map</h1>
      <div className="flex justify-center">
        <svg width={800} height={600} style={{ background: "#f8fafc", borderRadius: 12 }}>
          {/* Edges */}
          {relationships.map((rel, i) => {
            const from = positions[rel.from_step_id];
            const to = positions[rel.to_step_id];
            if (!from || !to) return null;
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={rel.relationship_type === "next" ? "#2563eb" : "#a1a1aa"}
                  strokeWidth={rel.relationship_type === "next" ? 3 : 1.5}
                  markerEnd="url(#arrowhead)"
                  opacity={0.8}
                />
                {/* Probability label */}
                {rel.relationship_type === "next" && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 10}
                    fontSize={12}
                    fill="#2563eb"
                    textAnchor="middle"
                  >
                    {(rel.probability_weight * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="8"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#2563eb" />
            </marker>
          </defs>
          {/* Nodes */}
          {steps.map((step) => {
            const pos = positions[step.id];
            if (!pos) return null;
            return (
              <g key={step.id} onClick={() => navigate(`/journey/step/${step.id}`)} style={{ cursor: "pointer" }}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={getNodeColor(step.id)}
                  stroke="#1e293b"
                  strokeWidth={2}
                  opacity={0.95}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight="bold"
                  fill="#fff"
                  dy={5}
                >
                  {step.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p>
          <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2 align-middle"></span>
          Completed Step
          <span className="inline-block w-4 h-4 rounded-full bg-blue-500 ml-6 mr-2 align-middle"></span>
          Incomplete Step
          <span className="inline-block w-6 h-1 bg-blue-600 ml-6 mr-2 align-middle"></span>
          "Next" Relationship
        </p>
      </div>
    </div>
  );
};

export default JourneyMapPage;
