import React from 'react';
import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';

interface SavedIdeasListProps {
  ideas: IdeaPlaygroundIdea[];
  onIdeaClick?: (idea: IdeaPlaygroundIdea) => void;
  onToggleSave?: (idea: IdeaPlaygroundIdea) => void;
}

const SavedIdeasList: React.FC<SavedIdeasListProps> = ({ ideas, onIdeaClick, onToggleSave }) => {
  // Filter to show only saved ideas
  const savedIdeas = ideas.filter(idea => idea.is_saved);

  if (savedIdeas.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Saved Ideas</h2>
        <p className="text-gray-600 text-center py-4">No saved ideas yet. Click the bookmark icon on any idea to save it.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Saved Ideas <span className="text-sm text-gray-500">({savedIdeas.length})</span></h2>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-2" style={{ minWidth: "100%", width: "max-content" }}>
          {savedIdeas.map((idea) => (
            <div 
              key={idea.id}
              className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative flex-shrink-0" 
              style={{ width: "280px" }}
            >
              {/* Bookmark/Save Button */}
              {onToggleSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(idea);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                  aria-label="Unsave idea"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-indigo-600" viewBox="0 0 24 24">
                    <path d="M5 5v16l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                  </svg>
                </button>
              )}
              
              {/* Card Content (clickable) */}
              <div
                onClick={() => onIdeaClick && onIdeaClick(idea)}
                className="cursor-pointer"
              >
                <h3 className="font-semibold text-base mb-2 pr-6 truncate">{idea.title}</h3>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{idea.description.substring(0, 80)}...</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-xs rounded-full text-blue-600">
                    {idea.status || "Draft"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll hint */}
      {savedIdeas.length > 3 && (
        <div className="text-xs text-right text-gray-500 mt-2">
          ← Scroll for more →
        </div>
      )}
    </div>
  );
};

export default SavedIdeasList;
