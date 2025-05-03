import React from "react";

export interface ToolListItem {
  id: string;
  name: string;
  description?: string;
  url: string;
  logo_url?: string;
  ranking: number;
  is_custom?: boolean;
}

interface ToolListProps {
  tools: ToolListItem[];
  onAddToCompare: (toolId: string) => void;
  onViewDetails: (toolId: string) => void;
  comparisonList: string[];
}

const ToolList: React.FC<ToolListProps> = ({
  tools,
  onAddToCompare,
  onViewDetails,
  comparisonList,
}) => {
  if (!tools || tools.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">All Tools for This Step</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <li key={tool.id} className="card bg-base-100 shadow-md p-4 flex flex-col">
            <div className="flex items-center mb-2">
              {tool.logo_url && (
                <img src={tool.logo_url} alt={tool.name} className="h-8 w-8 mr-2 rounded" />
              )}
              <span className="font-bold">{tool.name}</span>
              {tool.is_custom && (
                <span className="badge badge-accent ml-2">Custom</span>
              )}
            </div>
            <div className="text-base-content/70 mb-2">{tool.description}</div>
<div className="flex space-x-2 mb-2">
  <button 
    type="button"
    className="text-primary underline text-sm"
    onClick={(e) => {
      e.stopPropagation(); // Stop event bubbling entirely
      // Use the tool's ID instead of URL to avoid routing issues
      const toolUrl = tool.url;
      // Ensure URL has protocol
      const fullUrl = toolUrl.startsWith('http') ? toolUrl : `https://${toolUrl}`;
      const win = window.open(fullUrl, '_blank');
      if (win) win.focus();
      return false; // Extra prevention
    }}
  >
    Visit Website
  </button>
  <span className="text-sm">•</span>
  <button 
    type="button"
    className="text-primary underline text-sm"
    onClick={(e) => {
      e.stopPropagation(); // Stop event bubbling entirely
      onViewDetails(tool.id);
      return false; // Extra prevention
    }}
  >
    View Details
  </button>
</div>
            <button
              className="btn btn-sm btn-outline btn-primary mt-auto"
              onClick={() => onAddToCompare(tool.id)}
              disabled={comparisonList.includes(tool.id)}
            >
              {comparisonList.includes(tool.id) ? "Added" : "Add to Compare"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolList;
