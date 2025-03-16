import React, { useState, useEffect } from 'react';
import { IdeaPlaygroundIdea } from '../../../lib/types/idea-playground.types';

interface IdeaMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  direction?: 'up' | 'down' | 'neutral';
  description: string;
  color: string;
}

interface IdeaProgress {
  section: string;
  percentage: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface ActivityEntry {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'export' | 'milestone';
  description: string;
  timestamp: string;
  user: string;
}

interface IdeaDashboardProps {
  ideas: IdeaPlaygroundIdea[];
  selectedIdea?: IdeaPlaygroundIdea;
  onIdeaSelect: (ideaId: string) => void;
  timeframe: 'week' | 'month' | 'year';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'year') => void;
}

/**
 * Idea Dashboard Component
 * Displays key metrics, progress tracking, and activity logs for ideas
 */
const IdeaDashboard: React.FC<IdeaDashboardProps> = ({
  ideas,
  selectedIdea,
  onIdeaSelect,
  timeframe,
  onTimeframeChange,
}) => {
  // State
  const [metrics, setMetrics] = useState<IdeaMetric[]>([]);
  const [progress, setProgress] = useState<IdeaProgress[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate metrics based on ideas and timeframe
  useEffect(() => {
    setIsLoading(true);
    
    // In a real implementation, this would fetch metrics from the backend
    setTimeout(() => {
      // Generate mock metrics
      const mockMetrics: IdeaMetric[] = [
        {
          name: 'Total Ideas',
          value: ideas.length,
          previousValue: ideas.length - 2,
          change: 2,
          direction: 'up',
          description: 'Number of ideas in your workspace',
          color: 'blue',
        },
        {
          name: 'Progress Rate',
          value: 68,
          previousValue: 52,
          change: 16,
          direction: 'up',
          description: 'Average completion percentage across all ideas',
          color: 'green',
        },
        {
          name: 'Collaboration',
          value: 4,
          previousValue: 3,
          change: 1,
          direction: 'up',
          description: 'Average team members per idea',
          color: 'purple',
        },
        {
          name: 'Feedback',
          value: 12,
          previousValue: 15,
          change: 3,
          direction: 'down',
          description: 'Number of comments in the selected timeframe',
          color: 'yellow',
        },
      ];
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 800);
  }, [ideas, timeframe]);

  // Calculate progress for the selected idea
  useEffect(() => {
    if (!selectedIdea) return;
    
    // In a real implementation, this would calculate progress based on fields
    // Define sections and their completion criteria
    const sections = [
      { section: 'Basic Info', field: 'title' },
      { section: 'Problem Statement', field: 'problem_statement' },
      { section: 'Solution Concept', field: 'solution_concept' },
      { section: 'Target Audience', field: 'target_audience' },
      { section: 'Value Proposition', field: 'unique_value' },
      { section: 'Business Model', field: 'business_model' },
      { section: 'Marketing Strategy', field: 'marketing_strategy' },
      { section: 'Go-to-Market Plan', field: 'go_to_market' },
    ];
    
    // Calculate progress for each section
    const ideaProgress = sections.map(({ section, field }) => {
      const fieldValue = selectedIdea[field as keyof IdeaPlaygroundIdea] as string | undefined;
      
      // Check if field exists and has content
      if (!fieldValue) {
        return {
          section,
          percentage: 0,
          status: 'not-started' as const,
        };
      }
      
      // Simple heuristic - completion based on text length
      // In a real app, this would be more sophisticated
      const length = fieldValue.trim().length;
      
      if (length === 0) {
        return {
          section,
          percentage: 0,
          status: 'not-started' as const,
        };
      } else if (length < 50) {
        return {
          section,
          percentage: 30,
          status: 'in-progress' as const,
        };
      } else if (length < 150) {
        return {
          section,
          percentage: 70,
          status: 'in-progress' as const,
        };
      } else {
        return {
          section,
          percentage: 100,
          status: 'completed' as const,
        };
      }
    });
    
    setProgress(ideaProgress);
  }, [selectedIdea]);

  // Fetch activity log for the selected idea
  useEffect(() => {
    if (!selectedIdea) return;
    
    // In a real implementation, this would fetch activity from the backend
    // Mock data for activity log
    const recentDate = new Date();
    const olderDate = new Date();
    olderDate.setDate(olderDate.getDate() - 2);
    const evenOlderDate = new Date();
    evenOlderDate.setDate(evenOlderDate.getDate() - 4);
    
    const mockActivity: ActivityEntry[] = [
      {
        id: '1',
        type: 'edit',
        description: 'Updated business model',
        timestamp: recentDate.toISOString(),
        user: 'You',
      },
      {
        id: '2',
        type: 'comment',
        description: 'Added feedback on target audience',
        timestamp: recentDate.toISOString(),
        user: 'Sarah',
      },
      {
        id: '3',
        type: 'export',
        description: 'Exported to PDF',
        timestamp: olderDate.toISOString(),
        user: 'You',
      },
      {
        id: '4',
        type: 'share',
        description: 'Shared with marketing team',
        timestamp: olderDate.toISOString(),
        user: 'You',
      },
      {
        id: '5',
        type: 'milestone',
        description: 'Completed initial analysis',
        timestamp: evenOlderDate.toISOString(),
        user: 'System',
      },
    ];
    
    setActivity(mockActivity);
  }, [selectedIdea]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    if (!progress.length) return 0;
    
    const total = progress.reduce((sum, section) => sum + section.percentage, 0);
    return Math.round(total / progress.length);
  };

  // Get status color for progress bar
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-200';
      case 'in-progress':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return (
          <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </span>
        );
      case 'comment':
        return (
          <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'share':
        return (
          <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </span>
        );
      case 'export':
        return (
          <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'milestone':
        return (
          <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </span>
        );
    }
  };

  // Get color class for metric card
  const getMetricColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'purple':
        return 'bg-purple-50 border-purple-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get text color for metric card
  const getMetricTextColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-700';
      case 'green':
        return 'text-green-700';
      case 'purple':
        return 'text-purple-700';
      case 'yellow':
        return 'text-yellow-700';
      case 'red':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  // Get change indicator for metric card
  const getChangeIndicator = (direction: string) => {
    switch (direction) {
      case 'up':
        return (
          <span className="inline-flex items-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </span>
        );
      case 'down':
        return (
          <span className="inline-flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        );
    }
  };

  // Timeframe selection
  const handleTimeframeChange = (newTimeframe: 'week' | 'month' | 'year') => {
    onTimeframeChange(newTimeframe);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Idea Development Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Track progress and metrics for your idea portfolio
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="inline-flex rounded-md shadow-sm mt-2" role="group">
              <button
                type="button"
                onClick={() => handleTimeframeChange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  timeframe === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => handleTimeframeChange('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  timeframe === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-t border-b border-gray-300'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => handleTimeframeChange('year')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  timeframe === 'year'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="mb-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))
            ) : (
              // Actual metrics
              metrics.map((metric) => (
                <div
                  key={metric.name}
                  className={`border rounded-lg p-4 ${getMetricColor(metric.color)}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-gray-500">{metric.name}</h4>
                    {metric.direction && metric.change !== undefined && (
                      <div className="text-xs flex items-center">
                        {getChangeIndicator(metric.direction)}
                        <span className={metric.direction === 'up' ? 'text-green-600' : metric.direction === 'down' ? 'text-red-600' : 'text-gray-600'}>
                          {metric.change}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className={`text-2xl font-bold mt-2 ${getMetricTextColor(metric.color)}`}>
                    {metric.value}
                    {metric.name === 'Progress Rate' && '%'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Idea selection, progress, and activity feed in 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Idea Selection Column */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Ideas</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200 max-h-96 overflow-auto">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-4 cursor-pointer ${
                      selectedIdea?.id === idea.id
                        ? 'bg-indigo-50 border-l-4 border-indigo-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onIdeaSelect(idea.id)}
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{idea.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{idea.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {new Date(idea.updated_at).toLocaleDateString()}
                      </div>
                      <div className="bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600">
                        {idea.status ? (
                          `Status: ${idea.status}`
                        ) : (
                          'Stage: ' + (idea.current_stage_id ? idea.current_stage_id.split('-')[0] : '1') 
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Column */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Progress
              {selectedIdea && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  for {selectedIdea.title}
                </span>
              )}
            </h3>
            {!selectedIdea ? (
              <div className="border rounded-lg p-6 h-96 flex items-center justify-center text-gray-500">
                Select an idea to view progress
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                {/* Overall progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Overall Completion</h4>
                    <span className="text-sm font-medium text-indigo-600">
                      {calculateOverallProgress()}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${calculateOverallProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {/* Section progress */}
                <div className="space-y-4 max-h-72 overflow-auto">
                  {progress.map((section) => (
                    <div key={section.section}>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-700">{section.section}</h4>
                        <span className="text-xs font-medium text-gray-500">
                          {section.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`${getStatusColor(section.status)} h-1.5 rounded-full`}
                          style={{ width: `${section.percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 capitalize">
                        {section.status.replace('-', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed Column */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
              {selectedIdea && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  for {selectedIdea.title}
                </span>
              )}
            </h3>
            {!selectedIdea ? (
              <div className="border rounded-lg p-6 h-96 flex items-center justify-center text-gray-500">
                Select an idea to view activity
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="max-h-80 overflow-auto">
                  {activity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activity.map((entry) => (
                        <div key={entry.id} className="flex space-x-3">
                          {getActivityIcon(entry.type)}
                          <div>
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">{entry.user}</span>{' '}
                              {entry.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDashboard;
