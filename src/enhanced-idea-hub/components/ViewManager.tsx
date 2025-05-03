/**
 * ViewManager Component
 * Manages different view types for the Enhanced Idea Hub with a modern design
 */

import React from 'react';
import { EnhancedIdeaPlaygroundIdea, IdeaHubViewType, IdeaFilters } from '../types';
import { useIdeaHubStore } from '../store/idea-hub-store';
import CardGridView from './views/CardGridView';

interface ViewManagerProps {
  ideas: EnhancedIdeaPlaygroundIdea[];
  isLoading?: boolean;
  onSelectIdea?: (idea: EnhancedIdeaPlaygroundIdea) => void;
  className?: string;
}

const ViewManager: React.FC<ViewManagerProps> = ({
  ideas,
  isLoading = false,
  onSelectIdea,
  className = '',
}) => {
  const currentView = useIdeaHubStore(state => state.currentView);
  const setCurrentView = useIdeaHubStore(state => state.setCurrentView);
  const filters = useIdeaHubStore(state => state.filters);
  
  // Handle view switching
  const handleViewChange = (view: IdeaHubViewType) => {
    setCurrentView(view);
  };
  
  // Render the appropriate view based on currentView
  const renderView = () => {
    switch (currentView) {
      case 'card_grid':
        return (
          <CardGridView
            ideas={ideas}
            onSelectIdea={onSelectIdea}
            filters={filters}
            isLoading={isLoading}
          />
        );
      
      // Add other view cases as they are implemented
      // case 'kanban':
      //   return <KanbanView ideas={ideas} onSelectIdea={onSelectIdea} filters={filters} isLoading={isLoading} />;
      
      // case 'list':
      //   return <ListView ideas={ideas} onSelectIdea={onSelectIdea} filters={filters} isLoading={isLoading} />;
      
      // case 'timeline':
      //   return <TimelineView ideas={ideas} onSelectIdea={onSelectIdea} filters={filters} isLoading={isLoading} />;
      
      // case 'network':
      //   return <NetworkView ideas={ideas} onSelectIdea={onSelectIdea} filters={filters} isLoading={isLoading} />;
      
      // case 'focus':
      //   return <FocusView ideas={ideas} onSelectIdea={onSelectIdea} filters={filters} isLoading={isLoading} />;
      
      // case 'folder':
      //   return <FolderView ideas={ideas} onSelectIdea={onSelectIdea} filters={filters} isLoading={isLoading} />;
      
      default:
        return (
          <CardGridView
            ideas={ideas}
            onSelectIdea={onSelectIdea}
            filters={filters}
            isLoading={isLoading}
          />
        );
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* View Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 bg-white rounded-lg shadow p-2">
          <ViewButton
            label="Card Grid"
            icon="grid"
            isActive={currentView === 'card_grid'}
            onClick={() => handleViewChange('card_grid')}
          />
          
          <ViewButton
            label="Kanban"
            icon="columns"
            isActive={currentView === 'kanban'}
            onClick={() => handleViewChange('kanban')}
            disabled={true}
          />
          
          <ViewButton
            label="List"
            icon="list"
            isActive={currentView === 'list'}
            onClick={() => handleViewChange('list')}
            disabled={true}
          />
          
          <ViewButton
            label="Timeline"
            icon="clock"
            isActive={currentView === 'timeline'}
            onClick={() => handleViewChange('timeline')}
            disabled={true}
          />
          
          <ViewButton
            label="Network"
            icon="network"
            isActive={currentView === 'network'}
            onClick={() => handleViewChange('network')}
            disabled={true}
          />
          
          <ViewButton
            label="Focus"
            icon="focus"
            isActive={currentView === 'focus'}
            onClick={() => handleViewChange('focus')}
            disabled={true}
          />
          
          <ViewButton
            label="Folders"
            icon="folder"
            isActive={currentView === 'folder'}
            onClick={() => handleViewChange('folder')}
            disabled={true}
          />
        </div>
      </div>
      
      {/* Current View */}
      <div className="w-full">
        {renderView()}
      </div>
    </div>
  );
};

// Helper component for view buttons
interface ViewButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ViewButton: React.FC<ViewButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
  disabled = false,
}) => {
  // Icon mapping
  const getIconElement = () => {
    switch (icon) {
      case 'grid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'columns':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        );
      case 'list':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      case 'clock':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'network':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'focus':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'folder':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <button
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-800'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Switch to ${label} view`}
      title={disabled ? `${label} view (Coming Soon)` : `Switch to ${label} view`}
    >
      <span className="mr-2">{getIconElement()}</span>
      <span className="hidden sm:inline">{label}</span>
      {disabled && <span className="ml-1 text-xs hidden md:inline">(Coming Soon)</span>}
    </button>
  );
};

export default ViewManager;
