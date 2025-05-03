import React from "react";
import { PersonalizedToolRecommendation } from "../../../../lib/types/journey-steps.types";

// We'll extend the PersonalizedToolRecommendation type for UI-specific needs
export interface ToolRecommendation extends Omit<PersonalizedToolRecommendation, 'relevance_score'> {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  ranking?: number;
  relevance_score: number; // Renamed from ranking to match our data model
}

interface ToolRecommendationListProps {
  recommendations: ToolRecommendation[];
  onAddToCompare: (toolId: string) => void;
  onViewDetails: (toolId: string) => void;
  comparisonList: string[];
}

const ToolRecommendationList: React.FC<ToolRecommendationListProps> = ({
  recommendations,
  onAddToCompare,
  onViewDetails,
  comparisonList,
}) => {
  if (!recommendations || recommendations.length === 0) return null;
  
  // Sort recommendations by relevance score if present
  const sortedRecommendations = [...recommendations].sort((a, b) => 
    (b.relevance_score || 0) - (a.relevance_score || 0)
  );

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span>Personalized Recommendations</span>
        <span className="ml-2 text-sm text-gray-500 font-normal">
          (Based on your company profile and step needs)
        </span>
      </h3>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedRecommendations.map((tool) => (
          <li key={tool.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
            <div className="flex items-center mb-2">
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
                {tool.relevance_score > 0 && (
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
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

            <div className="text-base-content/70 mb-3 text-sm">
              {tool.description ? (
                tool.description.length > 150 
                  ? `${tool.description.substring(0, 150)}...` 
                  : tool.description
              ) : (
                <span className="italic text-gray-400">No description available</span>
              )}
            </div>

            <div className="flex space-x-2 mb-3">
              {tool.url && (
                <>
                  <button 
                    type="button"
                    className="text-primary underline text-sm hover:text-primary-focus"
                    onClick={(e) => {
                      e.stopPropagation();
                      const toolUrl = tool.url;
                      const fullUrl = toolUrl?.startsWith('http') ? toolUrl : `https://${toolUrl}`;
                      const win = window.open(fullUrl, '_blank');
                      if (win) win.focus();
                      return false;
                    }}
                  >
                    Visit Website
                  </button>
                  <span className="text-sm text-gray-300">•</span>
                </>
              )}
              <button 
                type="button"
                className="text-primary underline text-sm hover:text-primary-focus"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(tool.id);
                  return false;
                }}
              >
                View Details
              </button>
            </div>

            <button
              className={`btn btn-sm mt-auto ${
                comparisonList.includes(tool.id) 
                  ? 'btn-disabled bg-gray-100 text-gray-500' 
                  : 'btn-primary'
              }`}
              onClick={() => !comparisonList.includes(tool.id) && onAddToCompare(tool.id)}
              disabled={comparisonList.includes(tool.id)}
            >
              {comparisonList.includes(tool.id) ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Added to Compare
                </span>
              ) : (
                'Add to Compare'
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToolRecommendationList;
