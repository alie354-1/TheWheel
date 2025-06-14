import React, { useState, useMemo } from 'react';
import { JourneyChallenge } from '../../../../lib/types/journey-challenges.types';
import { ChallengeCard } from '../ChallengeCard/ChallengeCard';
import { Search, Filter, X } from 'lucide-react';

interface ChallengeListProps {
  challenges: JourneyChallenge[];
  progressData: Record<string, any>;
  phaseId?: string;
  onChallengeClick: (challenge: JourneyChallenge) => void;
  onStartClick: (challenge: JourneyChallenge) => void;
  onCustomizeClick: (challenge: JourneyChallenge) => void;
  onMarkIrrelevantClick: (challenge: JourneyChallenge) => void;
}

/**
 * ChallengeList component
 * 
 * Displays a grid of challenge cards with filtering and search capabilities
 */
export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  progressData,
  phaseId,
  onChallengeClick,
  onStartClick,
  onCustomizeClick,
  onMarkIrrelevantClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  
  // Apply filters to challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      // Apply phase filter (if specified in props)
      if (phaseId && challenge.phase_id !== phaseId) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter) {
        const status = progressData[challenge.id]?.status || 'not_started';
        if (status !== statusFilter) {
          return false;
        }
      }
      
      // Apply difficulty filter
      if (difficultyFilter && challenge.difficulty_level !== difficultyFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          challenge.name.toLowerCase().includes(query) ||
          (challenge.description?.toLowerCase().includes(query) || false)
        );
      }
      
      return true;
    });
  }, [challenges, phaseId, statusFilter, difficultyFilter, searchQuery, progressData]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setDifficultyFilter(null);
  };
  
  // Check if any filters are active
  const hasActiveFilters = statusFilter || difficultyFilter || searchQuery;
  
  return (
    <div className="space-y-6">
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">All statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
          
          <select
            className="block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            value={difficultyFilter || ''}
            onChange={(e) => setDifficultyFilter(Number(e.target.value) || null)}
          >
            <option value="">All difficulties</option>
            <option value="1">Easy (1)</option>
            <option value="2">Moderate (2)</option>
            <option value="3">Standard (3)</option>
            <option value="4">Advanced (4)</option>
            <option value="5">Expert (5)</option>
          </select>
          
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredChallenges.length} 
        {filteredChallenges.length === 1 ? ' challenge' : ' challenges'} found
        {hasActiveFilters && ' (filtered)'}
      </div>
      
      {/* Challenge grid */}
      {filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              status={progressData[challenge.id]?.status || 'not_started'}
              onClick={() => onChallengeClick(challenge)}
              onStartClick={() => onStartClick(challenge)}
              onCustomizeClick={() => onCustomizeClick(challenge)}
              onMarkIrrelevantClick={() => onMarkIrrelevantClick(challenge)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 mb-2">No challenges found</div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-primary hover:text-primary-dark"
            >
              Clear filters to see all challenges
            </button>
          )}
        </div>
      )}
    </div>
  );
};
