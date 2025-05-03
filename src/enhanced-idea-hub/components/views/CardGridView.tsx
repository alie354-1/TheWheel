/**
 * CardGridView Component
 * Displays ideas in a responsive grid layout with modern styling
 */

import React, { useState } from 'react';
import { EnhancedIdeaPlaygroundIdea, IdeaFilters } from '../../types';
import IdeaCard from '../common/IdeaCard';
import { useIdeaHubStore } from '../../store/idea-hub-store';

interface CardGridViewProps {
  ideas: EnhancedIdeaPlaygroundIdea[];
  onSelectIdea?: (idea: EnhancedIdeaPlaygroundIdea) => void;
  filters?: IdeaFilters;
  isLoading?: boolean;
  className?: string;
}

const CardGridView: React.FC<CardGridViewProps> = ({
  ideas,
  onSelectIdea,
  filters = {},
  isLoading = false,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const toggleSaveIdea = useIdeaHubStore(state => state.toggleSaveIdea);
  const pushIdeaToCompany = useIdeaHubStore(state => state.pushIdeaToCompany);
  const promoteIdeaToCompany = useIdeaHubStore(state => state.promoteIdeaToCompany);
  
  // Get current user ID from the store or context
  React.useEffect(() => {
    // In a real implementation, this would come from an auth context or service
    // For now, we'll use a placeholder
    setCurrentUserId('current-user-id');
  }, []);
  
  // Sort ideas based on current sort settings
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    
    if (sortBy === 'updated_at') {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
  
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };
  
  const handleMoveToStage = (idea: EnhancedIdeaPlaygroundIdea, stage: string) => {
    if (stage === 'next' && idea.integration.status === 'ready_for_company') {
      pushIdeaToCompany(idea.id);
    }
    // Handle other stage transitions as needed
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* Sorting Controls */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          
          <button
            className={`text-sm px-3 py-1 rounded-md ${
              sortBy === 'updated_at' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            onClick={() => handleSortChange('updated_at')}
          >
            Date {sortBy === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          
          <button
            className={`text-sm px-3 py-1 rounded-md ${
              sortBy === 'title' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            onClick={() => handleSortChange('title')}
          >
            Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-500">Loading ideas...</p>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && sortedIdeas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No ideas found</h3>
          <p className="mt-1 text-gray-500 max-w-md">
            Try adjusting your filters or create a new idea to get started.
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => {
              // This would typically open the create idea modal
              // For now, it's just a placeholder
            }}
          >
            Create New Idea
          </button>
        </div>
      )}
      
      {/* Card Grid */}
      {!isLoading && sortedIdeas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onSelect={onSelectIdea}
              onToggleSave={(idea) => toggleSaveIdea(idea.id)}
              onMoveToStage={handleMoveToStage}
              onPromoteToCompany={(idea) => {
                // For now, we'll use a default company ID
                // In a real implementation, you would show a company selector
                const defaultCompanyId = idea.companyId || 'default-company-id';
                promoteIdeaToCompany(idea.id, defaultCompanyId);
              }}
              currentUserId={currentUserId || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardGridView;
