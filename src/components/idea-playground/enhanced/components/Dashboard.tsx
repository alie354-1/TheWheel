import React, { useState, useEffect } from 'react';
import { useIdeaPlayground } from '../context/IdeaPlaygroundContext';
import { IdeaPlaygroundIdea } from '../../../../lib/types/idea-playground.types';
import { StageId, isStageCompleted } from '../state/idea-workflow.machine';

interface DashboardProps {
  ideas: IdeaPlaygroundIdea[];
  onCreateNewIdea: () => void;
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  ideas, 
  onCreateNewIdea,
  className = '' 
}) => {
  const { state, loadIdea, goToStage } = useIdeaPlayground();
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'stage'>('updated');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter(idea => {
      // Filter by status
      if (filter === 'in-progress') {
        return !idea.is_archived && !isIdeaCompleted(idea);
      } else if (filter === 'completed') {
        return !idea.is_archived && isIdeaCompleted(idea);
      } else {
        return !idea.is_archived;
      }
    })
    .filter(idea => {
      // Filter by search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        idea.title.toLowerCase().includes(term) ||
        idea.description.toLowerCase().includes(term) ||
        idea.problem_statement.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === 'updated') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'stage') {
        const stageA = getStageOrder(a.current_stage_id);
        const stageB = getStageOrder(b.current_stage_id);
        return stageB - stageA;
      }
      return 0;
    });

  // Helper function to check if an idea is completed
  const isIdeaCompleted = (idea: IdeaPlaygroundIdea) => {
    // An idea is considered completed if the last stage is completed
    return state.stages.length > 0 && 
      isStageCompleted(
        state.stages[state.stages.length - 1].id, 
        idea.id, 
        state.progress
      );
  };

  // Helper function to get stage order for sorting
  const getStageOrder = (stageId?: string) => {
    if (!stageId) return -1;
    const stage = state.stages.find(s => s.id === stageId);
    return stage ? stage.order_index : -1;
  };

  // Helper function to get progress percentage
  const getProgressPercentage = (idea: IdeaPlaygroundIdea) => {
    if (!idea) return 0;
    
    const totalStages = state.stages.length;
    if (totalStages === 0) return 0;
    
    const completedStages = state.stages.filter(stage => 
      isStageCompleted(stage.id, idea.id, state.progress)
    ).length;
    
    return Math.round((completedStages / totalStages) * 100);
  };

  // Helper function to get current stage name
  const getCurrentStageName = (idea: IdeaPlaygroundIdea) => {
    if (!idea.current_stage_id) return 'Not started';
    
    const stage = state.stages.find(s => s.id === idea.current_stage_id);
    return stage ? stage.name : 'Unknown stage';
  };

  // Handle idea selection
  const handleSelectIdea = (idea: IdeaPlaygroundIdea) => {
    loadIdea(idea.id);
    
    // Navigate to the current stage or dashboard
    const targetStage = idea.current_stage_id || StageId.DASHBOARD;
    goToStage(targetStage);
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Ideas</h1>
        <button
          onClick={onCreateNewIdea}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span className="material-icons mr-1">add</span>
          New Idea
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ideas</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="stage">Stage</option>
          </select>
        </div>
      </div>

      {/* Ideas grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => {
            const progress = getProgressPercentage(idea);
            const currentStage = getCurrentStageName(idea);
            
            return (
              <div
                key={idea.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectIdea(idea)}
              >
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">{idea.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{idea.description}</p>
                
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{currentStage}</span>
                    <span>{progress}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>Created: {new Date(idea.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(idea.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No ideas found matching your criteria.</p>
          <button
            onClick={onCreateNewIdea}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create Your First Idea
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
