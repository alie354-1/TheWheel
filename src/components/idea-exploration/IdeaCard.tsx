import React from 'react';
import { 
  Lightbulb, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Circle,
  Tag,
  Users,
  Zap,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { ExplorationIdea } from '../../lib/types/idea-exploration.types';

interface IdeaCardProps {
  idea: ExplorationIdea;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onDelete: () => void;
}

export default function IdeaCard({ idea, isSelected, onSelect, onView, onDelete }: IdeaCardProps) {
  // Truncate text to a certain length
  const truncate = (text: string | null | undefined, length: number = 100) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Get the analysis strength count if available
  const getStrengthCount = () => {
    if (idea.analysis && idea.analysis.strengths) {
      return idea.analysis.strengths.length;
    }
    return 0;
  };

  // Get the analysis weakness count if available
  const getWeaknessCount = () => {
    if (idea.analysis && idea.analysis.weaknesses) {
      return idea.analysis.weaknesses.length;
    }
    return 0;
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${isSelected ? 'border-indigo-500' : 'border-gray-200'}`}>
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{idea.title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(idea.created_at)}
              {idea.is_merged && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Merged
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onSelect}
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-indigo-600 focus:outline-none"
          >
            {isSelected ? (
              <CheckCircle className="h-5 w-5 text-indigo-600" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {truncate(idea.description, 150)}
        </p>

        {/* Key Details */}
        <div className="space-y-2 mb-4">
          {idea.problem_statement && (
            <div className="flex items-start">
              <MessageSquare className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-gray-600 line-clamp-2">
                <span className="font-medium">Problem:</span> {truncate(idea.problem_statement, 80)}
              </p>
            </div>
          )}
          {idea.target_audience && (
            <div className="flex items-start">
              <Users className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-gray-600 line-clamp-2">
                <span className="font-medium">Audience:</span> {truncate(idea.target_audience, 80)}
              </p>
            </div>
          )}
          {idea.unique_value && (
            <div className="flex items-start">
              <Zap className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-gray-600 line-clamp-2">
                <span className="font-medium">Value:</span> {truncate(idea.unique_value, 80)}
              </p>
            </div>
          )}
        </div>

        {/* Analysis Summary */}
        {idea.analysis && (
          <div className="flex space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-gray-600">{getStrengthCount()} strengths</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
              <span className="text-xs text-gray-600">{getWeaknessCount()} weaknesses</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {idea.competition && idea.competition.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {idea.competition.slice(0, 3).map((competitor, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {competitor}
              </span>
            ))}
            {idea.competition.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{idea.competition.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 flex justify-between">
        <button
          onClick={onDelete}
          className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
        <button
          onClick={onView}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
