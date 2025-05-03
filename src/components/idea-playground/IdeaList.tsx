import React from 'react';
import { IdeaPlaygroundIdea } from '../../lib/types/idea-playground.types';

interface IdeaListProps {
  ideas: IdeaPlaygroundIdea[];
  isLoading: boolean;
  onIdeaClick?: (idea: IdeaPlaygroundIdea) => void;
  onToggleSave?: (idea: IdeaPlaygroundIdea) => void;
}

const IdeaList: React.FC<IdeaListProps> = ({ ideas, isLoading, onIdeaClick, onToggleSave }) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Generating ideas...</p>
      </div>
    );
  }

  if (ideas.length === 0 && !isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No ideas yet. Generate some ideas to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <div 
          key={idea.id}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
        >
          {/* Bookmark/Save Button */}
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(idea);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
              aria-label={idea.is_saved ? "Unsave idea" : "Save idea"}
            >
              {idea.is_saved ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-indigo-600" viewBox="0 0 24 24">
                  <path d="M5 5v16l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v16l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                </svg>
              )}
            </button>
          )}
          
          {/* Card Content (clickable) */}
          <div
            onClick={() => onIdeaClick && onIdeaClick(idea)}
            className="cursor-pointer"
          >
            <h3 className="font-semibold text-lg mb-2 pr-8">{idea.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{idea.description.substring(0, 120)}...</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-100 text-xs rounded-full text-blue-600">
                {idea.status || "Draft"}
              </span>
              {idea.used_company_context && (
                <span className="px-2 py-1 bg-green-100 text-xs rounded-full text-green-600">
                  Company Context
                </span>
              )}
              {idea.is_saved && (
                <span className="px-2 py-1 bg-indigo-100 text-xs rounded-full text-indigo-600">
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeaList;
