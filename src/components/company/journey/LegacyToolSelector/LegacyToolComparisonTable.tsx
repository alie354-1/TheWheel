import React, { useState } from "react";
import { ToolReference } from "../../../../lib/types/journey-steps.types";
import { ToolRecommendation } from "./ToolRecommendationList";

// Update to use ToolReference as a base and extend it
export interface ToolListItem extends ToolReference {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  ranking?: number;
  relevance_score?: number;
  is_custom?: boolean;
}

interface ToolComparisonTableProps {
  tools: ToolListItem[];
  selectedToolId: string | null;
  onSelectTool: (toolId: string) => void;
  onRemoveTool: (toolId: string) => void;
  renderScorecard?: (tool: ToolListItem) => React.ReactNode;
}

const ToolComparisonTable: React.FC<ToolComparisonTableProps> = ({
  tools,
  selectedToolId,
  onSelectTool,
  onRemoveTool,
  renderScorecard,
}) => {
  const [expandedScorecard, setExpandedScorecard] = useState<string | null>(null);

  if (!tools || tools.length === 0) return null;
  
  // Calculate how many tools are being compared
  const comparingCount = tools.length;
  
  return (
    <div className="mt-10 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          Tool Comparison ({comparingCount})
        </h3>
        {selectedToolId && (
          <div className="text-sm text-primary">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Tool selected for this step
            </span>
          </div>
        )}
      </div>
      
      {/* Modern card-based comparison view for smaller number of tools */}
      {tools.length <= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow border-2 ${
                selectedToolId === tool.id ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="card-body p-4">
                <div className="flex items-center mb-3">
                  {tool.logo_url && (
                    <img 
                      src={tool.logo_url}
                      alt={`${tool.name} logo`} 
                      className="h-10 w-10 mr-3 rounded-md object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-logo.png'; // Fallback image
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{tool.name}</h4>
                    {tool.is_custom && (
                      <span className="badge badge-accent text-xs">Custom</span>
                    )}
                    {tool.relevance_score && (
                      <div className="flex items-center mt-1">
                        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, tool.relevance_score * 10)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {Math.round(tool.relevance_score * 10)}% match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm mb-4">
                  {tool.description ? (
                    <p className="line-clamp-3">
                      {tool.description}
                    </p>
                  ) : (
                    <p className="italic text-gray-400">No description available</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {tool.url && (
                    <a 
                      href={tool.url.startsWith('http') ? tool.url : `https://${tool.url}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-outline w-full"
                    >
                      Visit Website
                    </a>
                  )}
                  
                  <button
                    onClick={() => onRemoveTool(tool.id)}
                    className="btn btn-xs btn-outline btn-error"
                  >
                    Remove
                  </button>
                </div>
                
                {renderScorecard && (
                  <div className="mt-2 border-t pt-3">
                    <h5 className="text-sm font-semibold mb-2">Evaluation</h5>
                    <div className={expandedScorecard === tool.id ? "block" : "max-h-24 overflow-hidden"}>
                      {renderScorecard(tool)}
                    </div>
                    <button
                      onClick={() => setExpandedScorecard(expandedScorecard === tool.id ? null : tool.id)}
                      className="text-xs text-primary mt-1"
                    >
                      {expandedScorecard === tool.id ? "Show Less" : "Show More"}
                    </button>
                  </div>
                )}
                
                <div className="mt-auto pt-3">
                  <button
                    className={`btn btn-primary w-full ${selectedToolId === tool.id ? 'btn-disabled' : ''}`}
                    onClick={() => onSelectTool(tool.id)}
                    disabled={selectedToolId === tool.id}
                  >
                    {selectedToolId === tool.id ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected Tool
                      </span>
                    ) : (
                      'Select This Tool'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Traditional table for larger number of tools */}
      {tools.length > 3 && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Description</th>
                <th>Actions</th>
                <th className="w-24">Custom</th>
                {renderScorecard && <th>Evaluation</th>}
                <th className="w-32">Select</th>
                <th className="w-24">Remove</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className={selectedToolId === tool.id ? "bg-primary/10" : ""}>
                  <td>
                    <div className="flex items-center">
                      {tool.logo_url && (
                        <img 
                          src={tool.logo_url} 
                          alt={`${tool.name} logo`}
                          className="h-8 w-8 mr-2 rounded object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/placeholder-logo.png';
                          }}
                        />
                      )}
                      <span className="font-bold">{tool.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-md">
                      {tool.description ? (
                        tool.description.length > 100 
                          ? `${tool.description.substring(0, 100)}...` 
                          : tool.description
                      ) : (
                        <span className="italic text-gray-400">No description available</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      {tool.url && (
                        <a 
                          href={tool.url.startsWith('http') ? tool.url : `https://${tool.url}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-xs"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    {tool.is_custom ? (
                      <span className="badge badge-accent">Custom</span>
                    ) : (
                      <span className="badge badge-outline">Standard</span>
                    )}
                  </td>
                  {renderScorecard && (
                    <td>
                      {expandedScorecard === tool.id ? (
                        <div className="relative">
                          <div className="absolute z-10 bg-base-100 shadow-xl p-4 border rounded-md w-96">
                            {renderScorecard(tool)}
                            <button
                              className="btn btn-xs btn-outline mt-2"
                              onClick={() => setExpandedScorecard(null)}
                            >
                              Close
                            </button>
                          </div>
                          <button
                            className="btn btn-xs btn-outline w-20"
                            onClick={() => setExpandedScorecard(null)}
                          >
                            Hide
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => setExpandedScorecard(tool.id)}
                        >
                          Show Scorecard
                        </button>
                      )}
                    </td>
                  )}
                  <td>
                    <button
                      className={`btn btn-sm w-full ${selectedToolId === tool.id ? 'btn-success' : 'btn-outline btn-primary'}`}
                      onClick={() => onSelectTool(tool.id)}
                      disabled={selectedToolId === tool.id}
                    >
                      {selectedToolId === tool.id ? "Selected" : "Select"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline btn-error w-full"
                      onClick={() => onRemoveTool(tool.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ToolComparisonTable;
