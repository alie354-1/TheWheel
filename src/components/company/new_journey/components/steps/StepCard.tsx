import React from 'react';

export interface StepCardProps {
  id: string;
  title: string;
  description?: string;
  domain?: string;
  status?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  completedOn?: string;
  completionPercentage?: number;
  onClick?: (id: string) => void;
  showDetails?: boolean;
}

/**
 * StepCard - Card showing a journey step with basic information
 */
const StepCard: React.FC<StepCardProps> = ({
  id,
  title,
  description,
  domain,
  status = 'Not Started',
  tags = [],
  priority,
  completedOn,
  completionPercentage = 0,
  onClick,
  showDetails = false
}) => {
  // Get priority color
  const getPriorityColor = () => {
    const colorMap: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-amber-100 text-amber-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return priority ? colorMap[priority] || 'bg-gray-100 text-gray-800' : '';
  };
  
  // Get status color
  const getStatusColor = () => {
    const colorMap: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Blocked': 'bg-red-100 text-red-700',
      'Completed': 'bg-green-100 text-green-700'
    };
    
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };
  
  // Get domain color
  const getDomainColor = () => {
    const colorMap: Record<string, string> = {
      'Product': 'bg-indigo-100 text-indigo-800',
      'Development': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-green-100 text-green-800',
      'Finance': 'bg-amber-100 text-amber-800',
      'Legal': 'bg-red-100 text-red-800',
      'Operations': 'bg-gray-100 text-gray-800'
    };
    
    return domain ? colorMap[domain] || 'bg-gray-100 text-gray-800' : '';
  };
  
  return (
    <div 
      className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors mb-3 cursor-pointer"
      onClick={() => onClick && onClick(id)}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full flex-shrink-0 mr-3 ${status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
          <i className={`fas ${status === 'Completed' ? 'fa-check' : 'fa-tasks'}`}></i>
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            
            {/* Status indicator */}
            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor()}`}>
              {status}
            </span>
          </div>
          
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {/* Domain tag */}
            {domain && (
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getDomainColor()}`}>
                {domain}
              </span>
            )}
            
            {/* Priority tag */}
            {priority && (
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getPriorityColor()}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </span>
            )}
            
            {/* Additional tags */}
            {tags.map((tag, index) => (
              <span key={index} className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                {tag}
              </span>
            ))}
          </div>
          
          {/* Progress bar for in-progress steps */}
          {status === 'In Progress' && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-medium text-gray-700">{completionPercentage}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Completion date for completed steps */}
          {status === 'Completed' && completedOn && (
            <div className="mt-2 text-xs text-gray-500">
              <i className="fas fa-calendar-check mr-1"></i>
              Completed on {completedOn}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepCard;
